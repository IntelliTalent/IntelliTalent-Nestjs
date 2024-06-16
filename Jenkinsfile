pipeline {
  agent any

  stages{

    stage("runNew") {
      steps {
        echo "------------------------------ up the start ---------------------------------------------"
        sh"""
          ls -la
          cp /intelli/.env ../.env
          docker-compose down
          docker-compose up -d --build --no-cache
        """
      }
    }

  }

    post {
      always {
        echo "------------------------------ down the Testing enviroment ---------------------------------------------"
        sh"""
          docker image prune -a -f
        """
      }
    }


}
