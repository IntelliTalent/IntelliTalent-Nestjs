pipeline {
  agent any

  	environment {
		DOCKERHUB_CREDENTIALS=credentials('Dockerhub')
	}

  stages{

//     stage("unit test"){
//       agent {
//         docker {
//             image 'node:lts'
//             reuseNode true
//         }
//     }

//     steps {
//               sh "npm i "
//               sh"""
//               cp /Read-it/deployment/envfiles/backend_testing.env ./.env
//               """
//               sh "npm run test"
//       }
//   }


    stage("runNew") {
    steps {
      echo "------------------------------ up the start ---------------------------------------------"
      sh"""
        docker compose down
        docker compose up -d
      """
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
}
