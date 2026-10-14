
pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        timeout(time: 30, unit: 'MINUTES')
    }

    environment {
        DEPLOY_HOST = '100.31.77.18'
        DEPLOY_DIR = '/home/ubuntu/tech-gadget-comparison-and-recommendation-platform'
        COMPOSE_PROJECT_NAME = 'tech-gadget-comparison-and-recommendation-platform'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Validate Deployment Files') {
            steps {
                sh '''
                    set -eu

                    test -f docker-compose.yml
                    test -f backend/Dockerfile
                    test -f frontend/Dockerfile
                    test -f nginx/default.conf

                    echo "Required deployment files found."
                '''
            }
        }

        stage('Deploy to Ubuntu EC2') {
            steps {
                withCredentials([
                    sshUserPrivateKey(
                        credentialsId: 'gadget-ec2-ssh',
                        keyFileVariable: 'SSH_KEY',
                        usernameVariable: 'SSH_USER'
                    )
                ]) {
                    sh '''
                        set -eu

                        SSH_OPTS="-i $SSH_KEY -o StrictHostKeyChecking=accept-new"

                        echo "Checking SSH connection..."
                        ssh $SSH_OPTS "$SSH_USER@$DEPLOY_HOST" \
                            "test -d '$DEPLOY_DIR' && test -f '$DEPLOY_DIR/.env'"

                        echo "Uploading application files..."
                        rsync -az \
                            --exclude='.git/' \
                            --exclude='.env' \
                            --exclude='.env.*' \
                            --exclude='node_modules/' \
                            --exclude='dist/' \
                            -e "ssh $SSH_OPTS" \
                            ./ "$SSH_USER@$DEPLOY_HOST:$DEPLOY_DIR/"

                        echo "Building and restarting containers..."
                        ssh $SSH_OPTS "$SSH_USER@$DEPLOY_HOST" \
                            "cd '$DEPLOY_DIR' &&
                             export COMPOSE_PROJECT_NAME='$COMPOSE_PROJECT_NAME' &&
                             docker compose config --quiet &&
                             docker compose build &&
                             docker compose up -d"

                        echo "Creating any missing database tables..."
                        ssh $SSH_OPTS "$SSH_USER@$DEPLOY_HOST" \
                            "cd '$DEPLOY_DIR' &&
                             export COMPOSE_PROJECT_NAME='$COMPOSE_PROJECT_NAME' &&
                             docker compose exec -T backend python -c 'from app.core.database import Base, engine; import app.models.gadget, app.models.user; Base.metadata.create_all(bind=engine); print(list(Base.metadata.tables.keys()))'"

                        echo "Checking application..."
                        ssh $SSH_OPTS "$SSH_USER@$DEPLOY_HOST" \
                            "curl -fsS http://127.0.0.1/docs -o /dev/null &&
                             docker compose -f '$DEPLOY_DIR/docker-compose.yml' ps"

                        echo "Deployment completed."
                    '''
                }
            }
        }
    }

    post {
        success {
            echo 'Deployment successful. Check the application URL.'
        }

        failure {
            echo 'Deployment failed. Review the stage logs above.'
        }

        always {
            echo 'Pipeline finished.'
        }
    }
}
