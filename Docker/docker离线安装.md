# Docker离线安装

*由于一次在没有网络的情况下,需要安装一些服务,但是没有办法下载包,而且,编译安装需要好多依赖,所以就想着用docker,我一般是yum安装的docker,这次真好研究了一下.*

[TOC]



## 系统版本

```shell
CentOS Linux release 7.5.1804 (Core)
```

## 去腾讯源下载对应版本的docker

```shell
https://mirrors.tuna.tsinghua.edu.cn/docker-ce/linux/static/
```

## 将安装包传到家目录下,然后移动到/usr/bin下

```shell
[root@template ~]# tar  xf docker-19.03.9.tgz 
[root@template ~]# cp docker/* /usr/bin/
```

## 添加用户和组

```shell
useradd docker
```

## 使用systemd管理docker和containerd

### docker systemd配置文件

```shell
cat  >/usr/lib/systemd/system/docker.service <<EOF
[Unit]
Description=Docker Application Container Engine
Documentation=https://docs.docker.com
BindsTo=containerd.service
After=network-online.target firewalld.service containerd.service
Wants=network-online.target
Requires=docker.socket

[Service]
Type=notify
ExecStart=/usr/bin/dockerd -H fd:// --containerd=/run/containerd/containerd.sock
ExecReload=/bin/kill -s HUP $MAINPID
TimeoutSec=0
RestartSec=2
Restart=always
StartLimitBurst=3
StartLimitInterval=60s
LimitNOFILE=infinity
LimitNPROC=infinity
LimitCORE=infinity
TasksMax=infinity
Delegate=yes
KillMode=process

[Install]
WantedBy=multi-user.target
EOF
```

```shell
cat >/usr/lib/systemd/system/docker.socket <<EOF 
[Unit]
Description=Docker Socket for the API
PartOf=docker.service

[Socket]
ListenStream=/var/run/docker.sock
SocketMode=0660
SocketUser=root
SocketGroup=docker

[Install]
WantedBy=sockets.target
EOF
```

### containerd systemd配置文件

```shell
cat >/usr/lib/systemd/system/containerd.service <<EOF
[Unit]
Description=containerd container runtime
Documentation=https://containerd.io
After=network.target

[Service]
ExecStartPre=-/sbin/modprobe overlay
ExecStart=/usr/bin/containerd
KillMode=process
Delegate=yes
LimitNOFILE=1048576
LimitNPROC=infinity
LimitCORE=infinity
TasksMax=infinity

[Install]
WantedBy=multi-user.target
EOF

```

## 配置镜像加速

```shell
cat >/etc/docker/daemon.json <<EOF
{
  "registry-mirrors": ["https://esc1pe31.mirror.aliyuncs.com"]
}
EOF
```

## 拉取并测试镜像

```shell
[root@template ~]# docker images
[root@template ~]# docker run hello-world 

Hello from Docker!
This message shows that your installation appears to be working correctly.

To generate this message, Docker took the following steps:
 1. The Docker client contacted the Docker daemon.
 2. The Docker daemon pulled the "hello-world" image from the Docker Hub.
    (amd64)
 3. The Docker daemon created a new container from that image which runs the
    executable that produces the output you are currently reading.
 4. The Docker daemon streamed that output to the Docker client, which sent it
    to your terminal.

To try something more ambitious, you can run an Ubuntu container with:
 $ docker run -it ubuntu bash

Share images, automate workflows, and more with a free Docker ID:
 https://hub.docker.com/

For more examples and ideas, visit:
 https://docs.docker.com/get-started/
```


