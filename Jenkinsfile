pipeline {
    agent any

    environment {
        APP_NAME = "cv-editor"
        APP_DIR = "/var/www/cv-editor"
    }

    stages {
        stage('Checkout Source Code') {
            steps {
                git branch: 'solution',
                    url: 'https://github.com/CydaCode/cv-editor.git'
            }
        }

        stage('Prepare Frontend Env') {
            steps {
                withCredentials([
                    string(credentialsId: 'API_URL', variable: 'API_URL'),
                    string(credentialsId: 'S3_BUCKET', variable: 'S3_BUCKET')
                ]) {
                    sh """
                    cat <<EOF > frontend/.env.production
NEXT_PUBLIC_API_URL=${API_URL}
EOF
                    """
                }
            }
        }

        stage('Install Backend Dependencies') {
            steps {
                dir('backend') {
                    sh 'npm ci'
                }
            }
        }

        stage('Install Frontend Dependencies') {
            steps {
                dir('frontend') {
                    sh 'yarn install --frozen-lockfile'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh 'yarn build'
                }
            }
        }

        stage('Package Application') {
            steps {
                sh '''
                rm -rf build
                mkdir -p build
                cp -r backend build/
                cp -r frontend/.next build/frontend
                cp -r frontend/public build/frontend
                '''
            }
        }

        stage('Deploy to EC2') {
            steps {
                withCredentials([
                    string(credentialsId: 'EC2_HOST', variable: 'EC2_HOST'),
                    string(credentialsId: 'EC2_USER', variable: 'EC2_USER')
                ]) {
                    sshagent(credentials: ['EC2_SSH_KEY']) {
                        sh """
                        ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} '
                            mkdir -p ${APP_DIR}
                            rm -rf ${APP_DIR}/*
                        '
                        scp -r build/* ${EC2_USER}@${EC2_HOST}:${APP_DIR}
                        """
                    }
                }
            }
        }

        stage('Configure Backend Environment') {
            steps {
                sshagent(credentials: ['EC2_SSH_KEY']) {
                    withCredentials([
                        string(credentialsId: 'MONGODB_URI', variable: 'MONGO_URI'),
                        string(credentialsId: 'AWS_ACCESS_KEY_ID', variable: 'AWS_KEY'),
                        string(credentialsId: 'AWS_SECRET_ACCESS_KEY', variable: 'AWS_SECRET'),
                        string(credentialsId: 'S3_BUCKET', variable: 'S3_BUCKET')
                    ]) {
                        sh """
                        ssh ${EC2_USER}@${EC2_HOST} '
                            cat <<EOF > ${APP_DIR}/backend/.env
NODE_ENV=production
PORT=5000
MONGODB_URI=${MONGO_URI}
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=${AWS_KEY}
AWS_SECRET_ACCESS_KEY=${AWS_SECRET}
S3_BUCKET_NAME=${S3_BUCKET}
EOF
                        '
                        """
                    }
                }
            }
        }

        stage('Start Backend') {
            steps {
                sshagent(credentials: ['EC2_SSH_KEY']) {
                    sh """
                    ssh ${EC2_USER}@${EC2_HOST} '
                        cd ${APP_DIR}/backend
                        npm ci --omit=dev
                        pm2 delete ${APP_NAME} || true
                        pm2 start server.js --name ${APP_NAME}
                        pm2 save
                    '
                    """
                }
            }
        }

        stage('Health Check') {
            steps {
                sh """
                sleep 10
                curl -f http://${EC2_HOST}:5000/api/health
                """
            }
        }
    }

    post {
        success {
            echo 'Deployment successful'
        }
        failure {
            echo 'Deployment failed'
        }
    }
}