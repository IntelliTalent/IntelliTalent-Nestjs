pipeline {
  agent any

  stages{

    stage("runNew") {
      steps {
        echo "------------------------------ up the start ---------------------------------------------"
        sh"""
          docker compose down
          docker compose up -d
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
