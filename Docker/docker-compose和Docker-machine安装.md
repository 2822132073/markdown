

[TOC]

# V1版本安装

```shell
curl -L "https://github.com/docker/compose/releases/download/1.24.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
```

## 下载docker-compose

```shell
curl -L "https://github.com/docker/compose/releases/download/1.24.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
```

## 赋予执行权限

```shell
chmod +x /usr/local/bin/docker-compose
```

## 创建软链

```shell
ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
```

## 查看软件版本

```shell
docker-compose --version
```



# v2版本安装

```bash
mkdir -p ~/.docker/cli-plugins/
curl -SL https://get.daocloud.io/docker/compose/releases/download/v2.2.2/docker-compose-linux-x86_64 -o ~/.docker/cli-plugins/docker-compose

chmod +x ~/.docker/cli-plugins/docker-compose

docker compose version
```




## 安装Docker-machine

```shell
base=https://github.com/docker/machine/releases/download/v0.16.0
curl -L $base/docker-machine-$(uname -s)-$(uname -m) >/tmp/docker-machine
sudo mv /tmp/docker-machine /usr/local/bin/docker-machine
chmod +x /usr/local/bin/docker-machine
```
