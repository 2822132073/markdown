# 安装Redis

*这里安装的是redis-6.0.10*

[TOC]

## 准备安装环境

> 安装`redis-6.0.10`需要安装`gcc5.3`以上,在这里使用`scl`工具,`scl`工具允许用户在同一系统上运行同一软件的不同版本
>
> ```
> yum -y install centos-release-scl
> yum -y install devtoolset-9-gcc devtoolset-9-gcc-c++ devtoolset-9-binutils
> scl enable devtoolset-9 bash
> ```
>
> *需要注意的是scl命令启用只是临时的，退出shell或重启就会恢复原系统gcc版本。*
>
> > 如果要长期使用gcc 9.3的话
>
> ```
> echo "source /opt/rh/devtoolset-9/enable" >>/etc/profile
> ```

## 下载源码包

```
wget http://download.redis.io/releases/redis-6.0.10.tar.gz
```

## 解压并编译

```
tar xf redis-6.0.10.tar.gz
cd redis-6.0.10
make PREFIX=/usr/local/redis install
cd src/
make install
```

## 编辑systemctl管理文件

**systemctl管理文件**

```
cat >/lib/systemd/system/redis.service<<EOF
[Unit]
Description=Redis persistent key-value database
After=network.target

[Service]
ExecStart=/usr/local/bin/redis-server /etc/redis.conf --daemonize no
ExecStop=/usr/libexec/redis-shutdown

[Install]
WantedBy=multi-user.target
EOF
```

**编写关闭脚本**

```
vim /usr/libexec/redis-shutdown
#!/bin/bash
#
# Wrapper to close properly redis and sentinel
test x"$REDIS_DEBUG" != x && set -x

REDIS_CLI=/usr/local/bin/redis-cli

# Retrieve service name
SERVICE_NAME="$1"
if [ -z "$SERVICE_NAME" ]; then
   SERVICE_NAME=redis
fi

# Get the proper config file based on service name
CONFIG_FILE="/etc/$SERVICE_NAME.conf"

# Use awk to retrieve host, port from config file
HOST=`awk '/^[[:blank:]]*bind/ { print $2 }' $CONFIG_FILE | tail -n1`
PORT=`awk '/^[[:blank:]]*port/ { print $2 }' $CONFIG_FILE | tail -n1\`
PASS=`awk '/^[[:blank:]]*requirepass/ { print $2 }' $CONFIG_FILE | tail -n1\`
SOCK=`awk '/^[[:blank:]]*unixsocket\s/ { print $2 }' $CONFIG_FILE | tail -n1\`

# Just in case, use default host, port
HOST=${HOST:-127.0.0.1}
if [ "$SERVICE_NAME" = redis ]; then
    PORT=${PORT:-6379}
else
    PORT=${PORT:-26739}
fi

# Setup additional parameters
# e.g password-protected redis instances
[ -z "$PASS"  ] || ADDITIONAL_PARAMS="-a $PASS"

# shutdown the service properly
if [ -e "$SOCK" ] ; then
	$REDIS_CLI -s $SOCK $ADDITIONAL_PARAMS shutdown
else
	$REDIS_CLI -h $HOST -p $PORT $ADDITIONAL_PARAMS shutdown
fi


chmod a+x /usr/libexec/redis-shutdown
```

> 在使用改配置文件时,必须监听127.0.0.1,不然无法进行关闭,在配置文件中可以监听过个`IP`,例如:
>
> ```
> bind 127.0.0.1 10.0.0.91 #同时监听 127.0.0.1 10.0.0.91
> ```

