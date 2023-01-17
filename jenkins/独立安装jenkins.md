> 在集群之中安装jenkins,并不是一个很好的选择,所以在这里记录一下使用docker在独立机器上安装

[dockerhub页面](https://hub.docker.com/r/jenkins/jenkins)

尽量下载最新的版本,新版与旧版本的页面不同,新版本更加好看,我觉得更好点

> 拉取的命令就不写了

# 启动jenkins

```bash
mkdir /var/jenkins_home
chmod o+w  /var/jenkins_home
```

> jenkins容器没有使用root作为用户,而是使用一个uid为1000的用户作为用户,所以,需要给其他人加上写权限,也可以,更改属组为1000,然后给属组加上写权限

```bash
docker run -d \
	--name jenkins \
	-v /var/jenkins_home:/var/jenkins_home \
	-v /usr/bin/docker:/usr/bin/docker \
	-v /var/run/docker.sock:/var/run/docker.sock\
	-p 8080:8080 -p 50000:50000 \
	--restart=on-failure \
	-e TZ=Asia/Shanghai \
	-e JAVA_OPTS: -Duser.timezone=Asia/Shanghai \
	jenkins/jenkins:2.375.2-centos7
```

**或者使用docker compose进行部署,没什么区别**

```yaml
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
```

> 主要就是映射8080端口,让外部可以进行访问,还有映射jenkins_home,这里没有采用命名卷的形式,是因为我想要更好的修改里面的文件,所以直接使用了本机的相同的目录进行映射
>
> 这里还进行了docker相关文件的映射,主要是为了在jenkins中使用docker命令操作宿主机的docker daemon,然后进行构建镜像然后推送镜像相关任务,注意,这里的docker.sock的文件权限需要注意,需要修改权限


```bash
sed -i  "s#updates.jenkins.io#mirrors.tuna.tsinghua.edu.cn/jenkins/updates#g" /var/jenkins_home/hudson.model.UpdateCenter.xml 
```

> Jenkins 启动后，会通过 `hudson.model.UpdateCenter.xml` 中的 url 下载 `update-center.json` 将 `id` 设置成 `json` 的名称放入 `updates` 目录中，当 `updates/default.json` 生成后,注意,这里下载的default.json是没有加速的,等下在安装插件页面的时候,我们需要再去替换default.json中的内容


```bash
docker exec -ti jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

> 启动之后,jenkins会有一个初始密码,登录时需要

![image-20230115134048733](https://cdn.jsdelivr.net/gh/2822132073/image/202301151340130.png)

> 这里的密码是上面找到的

![image-20230115134533465](https://cdn.jsdelivr.net/gh/2822132073/image/202301151345735.png)

> 到这个页面之后,差不错default.json下载好了

```bash
sed -i 's#http://updates.jenkins-ci.org/download#https://mirrors.tuna.tsinghua.edu.cn/jenkins#g'  /var/jenkins_home/updates/default.json && sed -i 's#http://www.google.com#https://www.baidu.com#g' /var/jenkins_home/updates/default.json
```

> 替换其中的检测是否连接的地址,和下载插件的地址

> 关于其他的插件安装,就看自己的选择了
>
> 
