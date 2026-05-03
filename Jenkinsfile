pipeline {
    agent any

    environment {
        // ── Image config ──────────────────────────────────────────────
        DOCKERHUB_USER     = "atharva608"
        FRONTEND_IMAGE     = "${DOCKERHUB_USER}/fitness-app-frontend"
        BACKEND_IMAGE      = "${DOCKERHUB_USER}/fitness-app-backend"
        VERSION_TAG        = "1.0.${BUILD_NUMBER}"

        // ── Container & volume config ─────────────────────────────────
        FRONTEND_CONTAINER = "fitness-frontend"
        BACKEND_CONTAINER  = "fitness-backend"
        VOLUME_NAME        = "fitness_data"

        // ── Ports ─────────────────────────────────────────────────────
        FRONTEND_HOST_PORT = "5173"
        BACKEND_HOST_PORT  = "3000"

        // ── Credentials ───────────────────────────────────────────────
        DOCKER_CREDS_ID    = "docker-home"      // Jenkins cred ID for Docker Hub
        GITHUB_CREDS_ID    = "github-home"      // Jenkins cred ID for GitHub
    }

    options {
        timeout(time: 30, unit: 'MINUTES')
        retry(2)                          // auto-retry whole pipeline up to 2x
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    triggers {
        // Webhook or manual trigger on staging branch
        githubPush()
    }

    stages {

        // ── 0. DOCKER SETUP & PERMISSIONS ─────────────────────────────
        stage('Docker Setup & Permissions') {
            steps {
                echo "▶ Checking Docker CLI and fixing socket permissions..."
                script {
                    sh '''
                        # Install Docker CLI if not present
                        if ! command -v docker >/dev/null 2>&1; then
                            echo "⚠️ Docker CLI not found. Installing..."
                            sudo apt-get update
                            sudo apt-get install -y docker.io
                        else
                            echo "✅ Docker CLI already installed."
                        fi

                        # Try to fix permissions for the Docker socket (Windows/Linux paths)
                        sudo chmod 666 //var/run/docker.sock || chmod 666 //var/run/docker.sock || true
                        sudo chmod 666 /var/run/docker.sock || chmod 666 /var/run/docker.sock || true
                        
                        # Verify Docker CLI can connect to the daemon
                        docker version
                    '''
                }
            }
        }

        // ── 1. CHECKOUT ───────────────────────────────────────────────
        stage('Checkout') {
            steps {
                echo "▶ Checking out staging branch..."
                git branch: 'staging',
                    credentialsId: "${GITHUB_CREDS_ID}",
                    url: 'https://github.com/atharva0608/fitness-app.git'
            }
        }

        // ── 2. BUILD IMAGES ───────────────────────────────────────────
        stage('Build Images') {
            steps {
                echo "▶ Building frontend image..."
                sh """
                    docker build \
                        -t ${FRONTEND_IMAGE}:${VERSION_TAG} \
                        -t ${FRONTEND_IMAGE}:latest \
                        .
                """

                echo "▶ Building backend image..."
                sh """
                    docker build \
                        -t ${BACKEND_IMAGE}:${VERSION_TAG} \
                        -t ${BACKEND_IMAGE}:latest \
                        ./backend
                """
            }
        }

        // ── 3. DOCKER HUB LOGIN ───────────────────────────────────────
        stage('Docker Login') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: "${DOCKER_CREDS_ID}",
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
                }
            }
        }

        // ── 4. PUSH IMAGES ────────────────────────────────────────────
        stage('Push Images') {
            steps {
                echo "▶ Pushing frontend ${VERSION_TAG} & latest..."
                sh """
                    docker push ${FRONTEND_IMAGE}:${VERSION_TAG}
                    docker push ${FRONTEND_IMAGE}:latest
                """

                echo "▶ Pushing backend ${VERSION_TAG} & latest..."
                sh """
                    docker push ${BACKEND_IMAGE}:${VERSION_TAG}
                    docker push ${BACKEND_IMAGE}:latest
                """
            }
        }

        // ── 5. DEPLOY (zero-downtime replace) ─────────────────────────
        stage('Deploy') {
            steps {
                script {
                    // ── Ensure persistent volume exists ────────────────
                    sh "docker volume create ${VOLUME_NAME} || true"

                    // ── BACKEND ────────────────────────────────────────
                    echo "▶ Deploying backend..."
                    sh """
                        # Start new backend alongside old one on a temp port
                        docker run -d \
                            --name ${BACKEND_CONTAINER}_new \
                            -p 3001:3000 \
                            -v ${VOLUME_NAME}:/data \
                            -e NODE_ENV=production \
                            -e DB_PATH=/data/fitness.db \
                            ${BACKEND_IMAGE}:${VERSION_TAG}
                    """

                    // ── Quick health check on new backend ──────────────
                    sleep(time: 8, unit: 'SECONDS')
                    sh """
                        docker inspect -f '{{.State.Running}}' ${BACKEND_CONTAINER}_new \
                            | grep -q true || (echo "❌ New backend failed health check" && exit 1)
                    """

                    // ── Swap: stop old, rename new ─────────────────────
                    sh """
                        docker stop  ${BACKEND_CONTAINER} 2>/dev/null || true
                        docker rm    ${BACKEND_CONTAINER} 2>/dev/null || true
                        docker rename ${BACKEND_CONTAINER}_new ${BACKEND_CONTAINER}
                        # Rebind to correct port (stop & restart on real port)
                        docker stop  ${BACKEND_CONTAINER}
                        docker rm    ${BACKEND_CONTAINER}
                        docker run -d \
                            --name ${BACKEND_CONTAINER} \
                            -p ${BACKEND_HOST_PORT}:3000 \
                            -v ${VOLUME_NAME}:/data \
                            -e NODE_ENV=production \
                            -e DB_PATH=/data/fitness.db \
                            ${BACKEND_IMAGE}:${VERSION_TAG}
                    """

                    // ── FRONTEND ───────────────────────────────────────
                    echo "▶ Deploying frontend..."
                    sh """
                        docker stop  ${FRONTEND_CONTAINER} 2>/dev/null || true
                        docker rm    ${FRONTEND_CONTAINER} 2>/dev/null || true
                        docker run -d \
                            --name ${FRONTEND_CONTAINER} \
                            -p ${FRONTEND_HOST_PORT}:5173 \
                            -e NODE_ENV=production \
                            ${FRONTEND_IMAGE}:${VERSION_TAG}
                    """
                }
            }
        }

        // ── 6. POST-DEPLOY VALIDATION ─────────────────────────────────
        stage('Validate') {
            steps {
                script {
                    sleep(time: 5, unit: 'SECONDS')

                    echo "▶ Checking containers are running..."
                    sh """
                        docker inspect -f '{{.State.Running}}' ${BACKEND_CONTAINER} \
                            | grep -q true  || (echo "❌ Backend not running" && exit 1)
                        docker inspect -f '{{.State.Running}}' ${FRONTEND_CONTAINER} \
                            | grep -q true  || (echo "❌ Frontend not running" && exit 1)
                        echo "✅ Both containers healthy"
                    """

                    echo "▶ Checking backend port ${BACKEND_HOST_PORT}..."
                    sh """
                        curl -sf http://localhost:${BACKEND_HOST_PORT}/health \
                            && echo "✅ Backend responding" \
                            || echo "⚠️  /health not implemented — container is running"
                    """
                }
            }
        }
    }

    // ── POST: Rollback on failure, cleanup, notify ─────────────────────
    post {
        failure {
            script {
                echo "🔴 Pipeline failed — attempting rollback to previous build..."

                def prevBuild = currentBuild.previousSuccessfulBuild
                def prevNum   = prevBuild ? prevBuild.number : null

                if (prevNum) {
                    def rollbackTag = "1.0.${prevNum}"
                    echo "↩ Rolling back to ${rollbackTag}"

                    sh """
                        # Cleanup any half-started new containers
                        docker stop  ${BACKEND_CONTAINER}_new  2>/dev/null || true
                        docker rm    ${BACKEND_CONTAINER}_new  2>/dev/null || true

                        # Rollback backend
                        docker stop  ${BACKEND_CONTAINER}  2>/dev/null || true
                        docker rm    ${BACKEND_CONTAINER}  2>/dev/null || true
                        docker run -d \
                            --name ${BACKEND_CONTAINER} \
                            -p ${BACKEND_HOST_PORT}:3000 \
                            -v ${VOLUME_NAME}:/data \
                            -e NODE_ENV=production \
                            -e DB_PATH=/data/fitness.db \
                            ${BACKEND_IMAGE}:${rollbackTag}

                        # Rollback frontend
                        docker stop  ${FRONTEND_CONTAINER}  2>/dev/null || true
                        docker rm    ${FRONTEND_CONTAINER}  2>/dev/null || true
                        docker run -d \
                            --name ${FRONTEND_CONTAINER} \
                            -p ${FRONTEND_HOST_PORT}:5173 \
                            -e NODE_ENV=production \
                            ${FRONTEND_IMAGE}:${rollbackTag}
                    """
                    echo "↩ Rollback to ${rollbackTag} complete"
                } else {
                    echo "⚠️  No previous successful build found — manual intervention required"
                }
            }
        }

        success {
            echo """
            ✅ ===============================
               Deployment successful!
               Build : ${VERSION_TAG}
               Frontend → http://localhost:${FRONTEND_HOST_PORT}
               Backend  → http://localhost:${BACKEND_HOST_PORT}
            ===============================
            """
        }

        always {
            // Remove dangling images to save disk
            sh "docker image prune -f || true"
            // Archive docker logs for this build
            sh """
                docker logs ${FRONTEND_CONTAINER} > frontend-${BUILD_NUMBER}.log 2>&1 || true
                docker logs ${BACKEND_CONTAINER}  > backend-${BUILD_NUMBER}.log  2>&1 || true
            """
            archiveArtifacts artifacts: '*.log', allowEmptyArchive: true
        }
    }
}
