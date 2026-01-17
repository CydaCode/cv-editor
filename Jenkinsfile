pipeline {
    agent any

    environment {
        APP_NAME = "cv-editor"
        APP_DIR = "/home/ubuntu/cv-editor"
        EC2_USER = 'ubuntu'
        EC2_HOST = '54.221.75.127'
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

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh '''
                    npm ci
                    npm run build
                    '''
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
                cp frontend/package.json build/frontend/
                '''
            }
        }

        stage('Deploy Application') {
            steps {
                sshagent(credentials: ['EC2_SSH_KEY']) {
                    sh '''
                    echo "Starting deployment..."

                    # Ensure target subdirectories exist
                    ssh -o StrictHostKeyChecking=no $EC2_USER@$EC2_HOST \
                        "mkdir -p /home/ubuntu/cv-editor/backend /home/ubuntu/cv-editor/frontend"

                    # Deploy backend
                    rsync -avz --delete \
                    --exclude node_modules \
                    --exclude .git \
                    --exclude .env \
                    build/backend/ \
                    $EC2_USER@$EC2_HOST:/home/ubuntu/cv-editor/backend/


                    # Deploy frontend
                    rsync -avz --delete \
                    --exclude node_modules \
                    --exclude .git \
                    build/frontend/ \
                    $EC2_USER@$EC2_HOST:/home/ubuntu/cv-editor/frontend/


                    echo "Deployment completed safely!"
                    '''
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

        stage('Start Frontend') {
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
                curl -f http://${EC2_HOST}:3000
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