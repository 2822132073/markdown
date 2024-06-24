# NTP服务搭建

[TOC]

## 安装NTP服务

```shell
]# yum install -y ntp
```

## 修改时区

```shell
]# timedatectl set-timezone Asia/Shanghai
```

## 修改配置文件

/etc/ntp.conf

以下配置修改了

1. 允许192.168.10.0/24网段同步时间

   > restrict 192.168.10.0 mask 255.255.255.0 notrust nomodify notrap

2. 将同步服务器去掉,改为本地时钟同步

   > server 127.127.1.0          
   > Fudge 127.127.1.0 stratum 10

3. 注释原来的同步服务器

   > server开头的所有

```shell
driftfile /var/lib/ntp/drift

restrict default nomodify notrap nopeer noquery

restrict 192.168.10.0 mask 255.255.255.0 notrust nomodify notrap  
restrict 127.0.0.1 
restrict ::1

server 127.127.1.0          #同步本地时钟时间
Fudge 127.127.1.0 stratum 10

includefile /etc/ntp/crypto/pw

keys /etc/ntp/keys

disable monitor

```

## 启动ntpd

```shell
]# systemctl start ntpd
]# systemctl enable ntpd
```

## 查看

> 说明同步的是本地时钟

```shell
[root@ceph-0 /etc]# ntpq -p
     remote           refid      st t when poll reach   delay   offset  jitter
==============================================================================
 LOCAL(0)        .LOCL.           5 l    1   64    1    0.000    0.000   0.008
```



## NTP客户端操作

### 修改时区

```shell
]# timedatectl set-timezone Asia/Shanghai
```

### 查看是否安装chrony

```shell
]# rpm -qa|grep chrony
chrony-3.4-1.el7.x86_64
```

### 如果没有的话请安装

```shell
]# yum install -y chrony
```

### 修改配置文件

cat /etc/chrony.conf

修改过的地方

1. 删除所有原有时间服务,添加局域网的时间服务

   > server 192.168.10.134 iburst

```shell

server 192.168.10.134 iburst

driftfile /var/lib/chrony/drift


makestep 1.0 3

rtcsync

# Enable hardware timestamping on all interfaces that support it.
#hwtimestamp *

# Increase the minimum number of selectable sources required to adjust
# the system clock.
#minsources 2

# Allow NTP client access from local network.
#allow 192.168.0.0/16

# Serve time even if not synchronized to a time source.
#local stratum 10

# Specify file containing keys for NTP authentication.
#keyfile /etc/chrony.keys

# Specify directory for log files.
logdir /var/log/chrony

# Select which information is logged.
#log measurements statistics tracking

```

## 重启chrony

```shell
]# systemctl restart chronyd
]# systemctl enable chronyd
```





# 脚本

```shell
#!/bin/bash
#查看是否安装ntp
rpm -qa|grep ntp-4.2.6p5-29.el7.centos.2.x86_64
# 没有安装则安装ntp
if [ $? != 0 ];then
yum install -y ntp
fi
#备份配置文件
cp /etc/ntp.conf{,.bak}
#修改配置文件
cat >/etc/ntp.conf <<EOF
driftfile /var/lib/ntp/drift
restrict default nomodify notrap nopeer noquery
restrict 192.168.10.0 mask 255.255.255.0 notrust nomodify notrap
restrict 127.0.0.1 
restrict ::1
server 127.127.1.0
Fudge 127.127.1.0 stratum 10
includefile /etc/ntp/crypto/pw
keys /etc/ntp/keys
disable monitor
EOF
systemctl start ntpd && systemctl enable ntpd
```
