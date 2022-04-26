# 安装Docker









```
sudo yum remove -y docker \
                  docker-client \
                  docker-client-latest \
                  docker-common \
                  docker-latest \
                  docker-latest-logrotate \
                  docker-logrotate \
                  docker-engine
sudo yum install -y yum-utils \
  device-mapper-persistent-data \
  lvm2
sudo yum-config-manager \
    --add-repo \
    http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
sudo yum install -y docker-ce docker-ce-cli containerd.io
systemctl start docker
cat >/etc/docker/daemon.json <<EOF
{
  "registry-mirrors": ["https://esc1pe31.mirror.aliyuncs.com"]
}
EOF
systemctl enable docker
systemctl restart docker
```



## 卸载旧版

```shell
sudo yum remove -y docker \
                  docker-client \
                  docker-client-latest \
                  docker-common \
                  docker-latest \
                  docker-latest-logrotate \
                  docker-logrotate \
                  docker-engine
```



## 安装需要的工具

```shell
sudo yum install -y yum-utils \
  device-mapper-persistent-data \
  lvm2
```

## 添加需要的源

### 阿里源

```shell
sudo yum-config-manager \
    --add-repo \
    http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
```

### 清华源

```shell
sudo yum-config-manager \
    --add-repo \
    https://mirrors.tuna.tsinghua.edu.cn/docker-ce/linux/centos/docker-ce.repo
```

## 安装Docker

```shell
sudo yum  install -y docker-ce docker-ce-cli containerd.io
```





## 修改镜像源

```shell
cat >/etc/docker/daemon.json <<EOF
{
  "registry-mirrors": ["https://esc1pe31.mirror.aliyuncs.com"]
}
EOF
```

