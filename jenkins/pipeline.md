```pipeline
pipeline {
	agent any
	stages {
		stage("拉取代码"){
		  checkout scmGit(branches: [[name: '*/master']], extensions: [], userRemoteConfigs: [[credentialsId: 'gitee.com', url: 'https://gitee.com/fengsiling-66/jenkins_test.git']])
		}
	}
	


}
```

