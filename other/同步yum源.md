# 同步YUM源

## 下载相应的源

*这里我用阿里源*

```shell
wget -O /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-7.repo
wget -O /etc/yum.repos.d/epel.repo http://mirrors.aliyun.com/repo/epel-7.repo
############或者#############
curl -o /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-7.repo
curl -o /etc/yum.repos.d/epel.repo http://mirrors.aliyun.com/repo/epel-7.repo
```

## 检查源是否正常

```shell
[root@yum ~]# yum repolist 
Loaded plugins: fastestmirror
Loading mirror speeds from cached hostfile
 * base: mirrors.aliyun.com
 * extras: mirrors.aliyun.com
 * updates: mirrors.aliyun.com
repo id                                             repo name                                                                   status
base/7/x86_64                                       CentOS-7 - Base - mirrors.aliyun.com                                        10,072
extras/7/x86_64                                     CentOS-7 - Extras - mirrors.aliyun.com                                         476
updates/7/x86_64                                    CentOS-7 - Updates - mirrors.aliyun.com                                      2,173
repolist: 12,721
```

## 安装相应的工具

```shell
yum install -y wget make cmake gcc gcc-c++ pcre-devel zlib-devel openssl openssl-devel createrepo yum-utils
```

- yum-utils：reposync同步工具
- createrepo：编辑yum库工具

## 开始同步数据到本地

```shell
reposync -n --repoid=extras --repoid=updates --repoid=base --repoid=epel -p /opt/repo
```

- -n指定下载最新的软件包
- -p指定目录
- --repoid指定本地的源

## 创建仓库索引



```shell
createrepo -po /opt/repo/base/ /opt/repo/base/
createrepo -po /opt/repo/extras/ /opt/repo/extras/
createrepo -po /opt/repo/updates/ /opt/repo/updates/
createrepo -po /opt/repo/epel/ /opt/repo/epel/
```

### 更新数据源

```shell
createrepo --update /opt/repo/base/
createrepo --update /opt/repo/extras/
createrepo --update /opt/repo/updates/
createrepo --update /opt/repo/epel/
```

## 启动配置Apache

```shell
[root@yumserver ~]# vim /etc/httpd/conf/httpd.conf
DocumentRoot "/opt/repo"
<Directory "/opt/repo">
    Options Indexes FollowSymLinks
    AllowOverride  None
    Order allow,deny
    Allow from all
    Require all granted
</Directory>
```



