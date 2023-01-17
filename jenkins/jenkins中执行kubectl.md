> jenkins想要发布应用,就需要借助插件或者kubectl,按照原来的方法,可以将远程在有kubectl的机器上执行命令,但是需要传输yml文件,现在可以将kubectl放到jenkins中,使用kubernetes的相关插件完成配置工作,来进行部署

```bash
version: "3"
services:
  jenkins:
    image: jenkins/jenkins:2.375.2-centos7
    ports:
      - 8080:8080
      - 50000:50000
    restart: "always"
    container_name: jenkins
    environment:
      TZ: Asia/Shanghai
      JAVA_OPTS: -Duser.timezone=Asia/Shanghai
    volumes:
      - /var/jenkins_home:/var/jenkins_home
      - /var/run/docker.sock:/var/run/docker.sock
      - /usr/bin/docker:/usr/bin/docker
      - ./kubectl:/usr/bin/kubectl
```

> 从集群中任意机器上拷贝一个kubectl到目录下,注意版本问题
>
> 也可以直接再制作一个镜像,将这些命令拷贝进去



## 使用

> 在之前有一个连接k8s的教程,在使用之前需要将那个东西完成,因为,下面使用的插件,和那个绑定,还有一个凭证会在那步创建,所以最好先完成那个

![image-20230116195129985](https://cdn.jsdelivr.net/gh/2822132073/image/202301161951407.png)

> 任意一个流水线项目都会有一个语法生成器

![image-20230116195416145](https://cdn.jsdelivr.net/gh/2822132073/image/202301161954485.png)

> 选择这个kubeconfig

![image-20230116195633653](https://cdn.jsdelivr.net/gh/2822132073/image/202301161956503.png)

> 服务端点就是apiserver的地址
>
> 这个`Certificate of certificate authority`是ca证书
>
> 凭据是在连接k8s时创建的凭据的ID

**生成流水线脚本后**

> 可以在block中使用kubectl命令进行一些操作

```pipeline
kubeconfig(credentialsId: 'mykubernetes', serverUrl: 'https://172.16.1.119:6443') {
    // some block
}
```

> 这个还不用使用,会报错,要加上`caCertificate`
>
> [jenkins官网地址配置](https://www.jenkins.io/doc/pipeline/steps/kubernetes/#kubeconfig-setup-kubernetes-cli-kubectl)
>
> ```pipeline
> kubeconfig(credentialsId: 'mykubernetes',caCertificate: '', serverUrl: 'https://172.16.1.119:6443') {
>     // some block
> }
> 
> ```
>
> 