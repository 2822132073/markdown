# maven的安装 
> 主要就是下载maven到jenkins_home的那个卷中,所以说,如果jenkins是单独的一个机器,那就直接在上面下载maven,然后放入jenkins_home,如果是放在k8s中的话,那就是根据不同的存储类型,来进行不同的操作,下面我是使用的nfs作为存储卷,所以只需要到nfs那台机器上就可以了

有三点需要注意的地方。

- ​    maven一定要安装在jenkins服务器上。
- ​    maven安装之前要先安装jdk。
- ​    建任务前，需要有git环境，并配置好用户名密码

> 将文件下载到jenkins_home下面的java目录下

```bash
# 下载maven
mkdir java
cd java
wget https://mirrors.aliyun.com/apache/maven/maven-3/3.8.7/binaries/apache-maven-3.8.7-bin.tar.gz
tar xf apache-maven-3.8.7-bin.tar.gz
rm -f apache-maven-3.8.7-bin.tar.gz

```

![image-20230112201414521](https://cdn.jsdelivr.net/gh/2822132073/image/202301122014465.png)

**修改maven配置文件**

> maven的配置文件在maven目录下的`conf/settings.xml`文件,主要修改的两个位置
>
> - maven仓库位置,添加阿里仓库
> - maven下载下来的jar包放哪里

**添加阿里仓库**

> 搜索mirrors,删除原来的一个仓库

```xml
    <mirror>
      <id>alimaven</id>
      <name>aliyun maven</name>
      <url>http://maven.aliyun.com/nexus/content/groups/public/</url>
      <mirrorOf>central</mirrorOf> 
    </mirror>

```

**声明jar存放位置**

> 搜索localRepository,在其下面添加一个,这个路径指的是,jar包存放的位置,我声明的位置是在存储卷中,以免每次jenkins pod重启,他的缓存都会丢失,也可以指向另外一个卷中

```bash
mkdir /var/jenkins_home/maven_repository
chown 1000:1000  /var/jenkins_home/maven_repository
```

> 不修改权限的话,maven无法创建目录

```xml
  <localRepository>/var/jenkins_home/maven_repository</localRepository>
```

**在jenkins中配置maven**

> ​	路径 系统管理-->全局工具配置

![image-20230112202149508](https://cdn.jsdelivr.net/gh/2822132073/image/202301122021855.png)

> 点击新增maven

![image-20230112202522571](https://cdn.jsdelivr.net/gh/2822132073/image/202301122025596.png)

> MAVEN_HOME指定的是刚刚maven的位置,Name可以随便填写,记住勾选掉自动安装,最后保存就行

# JDK的安装

> 其实这一步应该是在安装maven之前的,但是只要不是去使用maven,先后无所谓,这里和上一步的步骤差不多,

![image-20230112201414521](https://cdn.jsdelivr.net/gh/2822132073/image/202301122014465.png)

> 就直接从这一步开始,下载和解压的过程和maven差不多,这里写一个下载的地址
>
> [jdk下载](http://www.codebaoku.com/jdk/jdk-index.html)



> 和上面一样还是 路径 系统管理-->全局工具配置

![image-20230112212553999](https://cdn.jsdelivr.net/gh/2822132073/image/202301122125174.png)

![image-20230112212618074](https://cdn.jsdelivr.net/gh/2822132073/image/202301122126393.png)