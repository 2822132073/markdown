```sh
pipeline {
	agent any
	# parameters的定义会在开始构建时让用户进行输入,可以设置默认值,可以通过环境变量引入
	# ${params.xxx}来引入
	# parameters可以使用的数据类型很多,可以在语法生成器的Declarative Directive Generator查看
	# https://www.jenkins.io/doc/book/pipeline/syntax/#parameters 文档
    parameters  {
        string(name: 'harbor_bot_name', defaultValue: 'robot-jenkins+jenkins_bot', description: 'harbor机器人名')
        string(name: 'harbor_bot_token', defaultValue: '96aTjhHfwV0YIPuCfPsyo4duZCOSJ9uk', description: 'harbor机器人凭据')
        string(name: 'image_name', defaultValue: 'jenkins-test', description: '镜像名')
        string(name: 'harbor_address', defaultValue: 'harbor.fsl.com', description: 'harbor地址')
        string(name: 'harbor_project_name', defaultValue: 'jenkins', description: 'harbor镜像项目名')
        string(name: 'namespace', defaultValue: 'default', description: '部署到的名称空间')
        string(name: 'app_name', defaultValue: 'jenkins-test', description: '应用名称')
    }
    # key=value的键值对,可以通过 ${env.xxx}进行引用
    # https://www.jenkins.io/doc/book/pipeline/syntax/#environment
    environment {
		image_address = "${params.harbor_address}/${params.harbor_project_name}/${params.image_name}:${tag}"
    }
    # 所有的步骤都在stages中完成
    # https://www.jenkins.io/doc/book/pipeline/syntax/#stages
	stages {
	# 会在jenkins中显示,一般一个stage就是完成一个任务,stage里面的step是完成任务的具体操作
		stage("拉取代码"){
		    steps {
		        echo "开始拉取代码"
		    	checkout scmGit(branches: [[name: '${tag}']], extensions: [], userRemoteConfigs: [[credentialsId: 'gitee.com', url: 'https://gitee.com/fengsiling-66/jenkins_test.git']])
		    }
		}
		stage("打包代码"){
		    steps{
		    echo "使用maven打包代码"
            sh '/var/jenkins_home/java/apache-maven-3.8.7/bin/mvn clean package -Dmaven.test.skip=true'
		    }
		}
		stage("制作docker镜像"){
		    steps{
			sh 'env'
			echo "${env.image_address}"
		    sh "docker build -t ${env.image_address} ."
		    }
		}
		stage("推送镜像"){
		    steps{
		    echo "推送镜像到harbor"
			echo "${params.harbor_bot_name}"
			sh """
				docker login ${params.harbor_address} -u '${params.harbor_bot_name}' -p"${params.harbor_bot_token}"
				docker push ${env.image_address}
				docker rmi ${env.image_address}
				docker logout ${params.harbor_address}
			   """
		    }
		}
		stage("部署应用到k8s"){
		    steps{
				kubeconfig(credentialsId: 'mykubernetes',caCertificate: '', serverUrl: 'https://172.16.1.119:6443') {
				    sh "sed -i s#APP_NAME#${params.app_name}#g k8s.yaml"
				    sh "sed -i s#NAMESPACE#${params.namespace}#g k8s.yaml "
				    sh "sed -i s#IMAGE_ADDRESS#${env.image_address}#g k8s.yaml"
				    sh 'cat k8s.yaml'
					sh 'kubectl apply -f k8s.yaml'
                    sh 'kubectl get deploy,svc,pod -n ${namespace} --selector=app=${app_name}'
				}
		    }
		}
	}
}
```

> 在进行变量引用时不能使用单引号,需要使用双引号,不然jenkins无法替换变量