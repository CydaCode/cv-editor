pipeline {
    agent any

    environment {
        APP_NAME = "cv-editor"
        APP_DIR = "/home/ubuntu/cv-editor"
        AWS_REGION = "us-east-1"
    }


    stages {
        stage('Checkout Source Code') {
            steps {
                git branch: 'solution-stage2',
                    url: 'https://github.com/CydaCode/cv-editor.git'
            }
        }

        stage('Build & Push Docker Images to ECR') {
            steps {
                withCredentials([
                    string(credentialsId: 'AWS_ACCESS_KEY_ID', variable: 'AWS_KEY'),
                    string(credentialsId: 'AWS_SECRET_ACCESS_KEY', variable: 'AWS_SECRET'),
                    string(credentialsId: 'AWS_ACCOUNT_ID', variable: 'AWS_ACCOUNT')
                ]) {
                    sh '''
                        export AWS_ACCESS_KEY_ID=${AWS_KEY}
                        export AWS_SECRET_ACCESS_KEY=${AWS_SECRET}
                        export AWS_DEFAULT_REGION=${AWS_REGION}

                        # Login to ECR
                        aws ecr get-login-password --region ${AWS_REGION} | \
                        docker login --username AWS --password-stdin \
                        ${AWS_ACCOUNT}.dkr.ecr.${AWS_REGION}.amazonaws.com

                        # Build Backend
                        docker build -t ${APP_NAME}-backend ./backend
                        docker tag ${APP_NAME}-backend:latest \
                        ${AWS_ACCOUNT}.dkr.ecr.${AWS_REGION}.amazonaws.com/${APP_NAME}-backend:latest

                        # Build Frontend
                        docker build -t ${APP_NAME}-frontend ./frontend
                        docker tag ${APP_NAME}-frontend:latest \
                        ${AWS_ACCOUNT}.dkr.ecr.${AWS_REGION}.amazonaws.com/${APP_NAME}-frontend:latest

                        # Push Images
                        docker push ${AWS_ACCOUNT}.dkr.ecr.${AWS_REGION}.amazonaws.com/${APP_NAME}-backend:latest
                        docker push ${AWS_ACCOUNT}.dkr.ecr.${AWS_REGION}.amazonaws.com/${APP_NAME}-frontend:latest
                    '''
                }
            }
        }

        stage('Deploy Backend (Private EC2 via Bastion)') {
            steps {
                sshagent(credentials: ['EC2_SSH_KEY']) {
                    withCredentials([
                        string(credentialsId: 'MONGODB_URI', variable: 'MONGO_URI'),
                        string(credentialsId: 'S3_BUCKET', variable: 'S3_BUCKET'),
                        string(credentialsId: 'AWS_ACCESS_KEY_ID', variable: 'AWS_KEY'),
                        string(credentialsId: 'AWS_SECRET_ACCESS_KEY', variable: 'AWS_SECRET'),
                        string(credentialsId: 'AWS_ACCOUNT_ID', variable: 'AWS_ACCOUNT'),
                        string(credentialsId: 'EC2_USER', variable: 'EC2_USER'),
                        string(credentialsId: 'BACKEND_HOST', variable: 'BACKEND_HOST'),
                        string(credentialsId: 'BASTION_HOST', variable: 'BASTION_HOST')
                    ]) {

                        sh '''
                        ssh -A \
                        -o StrictHostKeyChecking=no \
                        -o UserKnownHostsFile=/dev/null \
                        -o ProxyCommand="ssh -A -o StrictHostKeyChecking=no \
                                        -o UserKnownHostsFile=/dev/null \
                                        -W %h:%p ${EC2_USER}@${BASTION_HOST}" \
                        ${EC2_USER}@${BACKEND_HOST} << 'EOF'
                                
                            set -e

                            mkdir -p ${APP_DIR}/backend

                            # Login to ECR
                            export AWS_ACCESS_KEY_ID=${AWS_KEY}
                            export AWS_SECRET_ACCESS_KEY=${AWS_SECRET}
                            export AWS_DEFAULT_REGION=${AWS_REGION}

                            aws ecr get-login-password --region ${AWS_REGION} | \
                            docker login --username AWS --password-stdin \
                            ${AWS_ACCOUNT}.dkr.ecr.${AWS_REGION}.amazonaws.com

                            # Pull Latest Image
                            docker pull ${AWS_ACCOUNT}.dkr.ecr.${AWS_REGION}.amazonaws.com/${APP_NAME}-backend:latest

                            # Stop Old Container
                            docker rm -f ${APP_NAME}-backend || true

                            # Run Backend Container
                            docker run -d \
                                --name ${APP_NAME}-backend \
                                -e NODE_ENV=production \
                                -e PORT=5000 \
                                -e MONGODB_URI=${MONGO_URI} \
                                -e AWS_REGION=${AWS_REGION} \
                                -e AWS_ACCESS_KEY_ID=${AWS_KEY} \
                                -e AWS_SECRET_ACCESS_KEY=${AWS_SECRET} \
                                -e S3_BUCKET_NAME=${S3_BUCKET} \
                                -p 5000:5000 \
                                ${AWS_ACCOUNT}.dkr.ecr.${AWS_REGION}.amazonaws.com/${APP_NAME}-backend:latest
                            exit
EOF
                        '''
                    }
                }
            }
        }



        stage('Deploy Frontend (Public EC2)') {
            steps {
                sshagent(credentials: ['EC2_SSH_KEY']) {
                    withCredentials([
                        string(credentialsId: 'AWS_ACCESS_KEY_ID', variable: 'AWS_KEY'),
                        string(credentialsId: 'AWS_SECRET_ACCESS_KEY', variable: 'AWS_SECRET'),
                        string(credentialsId: 'AWS_ACCOUNT_ID', variable: 'AWS_ACCOUNT'),
                        string(credentialsId: 'EC2_USER', variable: 'EC2_USER'),
                        string(credentialsId: 'FRONTEND_HOST', variable: 'FRONTEND_HOST'),
                        string(credentialsId: 'API_URL', variable: 'API_URL')
                    ]) {

                        sh '''
                        ssh -o StrictHostKeyChecking=no ${EC2_USER}@${FRONTEND_HOST} <<EOF

                            export AWS_ACCESS_KEY_ID=${AWS_KEY}
                            export AWS_SECRET_ACCESS_KEY=${AWS_SECRET}
                            export AWS_DEFAULT_REGION=${AWS_REGION}

                            aws ecr get-login-password --region ${AWS_REGION} | \
                            docker login --username AWS --password-stdin \
                            ${AWS_ACCOUNT}.dkr.ecr.${AWS_REGION}.amazonaws.com

                            docker pull ${AWS_ACCOUNT}.dkr.ecr.${AWS_REGION}.amazonaws.com/${APP_NAME}-frontend:latest

                            docker rm -f ${APP_NAME}-frontend || true

                            docker run -d \
                                --name ${APP_NAME}-frontend \
                                -e NEXT_PUBLIC_API_URL=${API_URL} \
                                -p 3000:3000 \
                                ${AWS_ACCOUNT}.dkr.ecr.${AWS_REGION}.amazonaws.com/${APP_NAME}-frontend:latest
EOF
                        '''
                    }
                }
            }
        }

        

        stage('Health Check') {
            steps {
                withCredentials([
                    string(credentialsId: 'FRONTEND_HOST', variable: 'FRONTEND_HOST')
                ]) {
                    sh """
                        sleep 15
                        curl -f http://${FRONTEND_HOST}:3000
                    """
                }
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