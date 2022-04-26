# cephadm安装ceph

https://blog.csdn.net/zjz5740/article/details/115652219

https://blog.csdn.net/networken/article/details/106870859

## 系统初始化

### 关闭防火墙和selinux

```shell
setenforce 0
sed -i s#SELINUX=enforcing#SELINUX=disabled#g /etc/selinux/config
systemctl stop firewalld 
systemctl disable firewalld
```



### 安装必要软件

```shell
yum install -y tree wget git dstate screen curl net-tools htop vim lsof yum-utils net-tools unzip lsb lrzsz gcc gcc-c++ autoconf automake make mlocate bash-completion python3
```

## 安装docker

```shell
# 卸载原有docker组件
sudo yum remove -y docker \
                  docker-client \
                  docker-client-latest \
                  docker-common \
                  docker-latest \
                  docker-latest-logrotate \
                  docker-logrotate \
                  docker-engine
# 安装相关工具
sudo yum install -y yum-utils \
  device-mapper-persistent-data \
  lvm2
# 添加相关源文件
sudo yum-config-manager \
    --add-repo \
    http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
# 安装docker
sudo yum install -y docker-ce docker-ce-cli containerd.io
# 启动docker
systemctl start docker
# 修改镜像源文件
cat >/etc/docker/daemon.json <<EOF
{
  "registry-mirrors": ["https://esc1pe31.mirror.aliyuncs.com"]
}
EOF
# 重启docker
systemctl enable docker
systemctl restart docker
```

## 安装cephadm

### 下载cephadm

```shell
curl https://raw.githubusercontent.com/ceph/ceph/v15.2.1/src/cephadm/cephadm -o cephadm
chmod +x cephadm
```

### 安装cephadm到当前主机

```shell
./cephadm add-repo --release octopus
./cephadm install
```

### 确定正确加载环境变量

```shell
[root@localhost ~]# which cephadm
/usr/sbin/cephadm	
```

## 引导新集群

```shell
mkdir -p /etc/ceph
cephadm bootstrap --mon-ip
```

