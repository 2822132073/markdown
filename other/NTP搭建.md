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
# For more information about this file, see the man pages
# ntp.conf(5), ntp_acc(5), ntp_auth(5), ntp_clock(5), ntp_misc(5), ntp_mon(5).

driftfile /var/lib/ntp/drift

# Permit time synchronization with our time source, but do not
# permit the source to query or modify the service on this system.
restrict default nomodify notrap nopeer noquery

# Permit all access over the loopback interface.  This could
# be tightened as well, but to do so would effect some of
# the administrative functions.
restrict 192.168.10.0 mask 255.255.255.0 notrust nomodify notrap  
restrict 127.0.0.1 
restrict ::1

# Hosts on local network are less restricted.
#restrict 192.168.1.0 mask 255.255.255.0 nomodify notrap

# Use public servers from the pool.ntp.org project.
# Please consider joining the pool (http://www.pool.ntp.org/join.html).
server 127.127.1.0          #同步本地时钟时间
Fudge 127.127.1.0 stratum 10
#server 192.168.1.134
#broadcast 192.168.1.255 autokey	# broadcast server
#broadcastclient			# broadcast client
#broadcast 224.0.1.1 autokey		# multicast server
#multicastclient 224.0.1.1		# multicast client
#manycastserver 239.255.254.254		# manycast server
#manycastclient 239.255.254.254 autokey # manycast client

# Enable public key cryptography.
#crypto

includefile /etc/ntp/crypto/pw

# Key file containing the keys and key identifiers used when operating
# with symmetric key cryptography. 
keys /etc/ntp/keys

# Specify the key identifiers which are trusted.
#trustedkey 4 8 42

# Specify the key identifier to use with the ntpdc utility.
#requestkey 8

# Specify the key identifier to use with the ntpq utility.
#controlkey 8

# Enable writing of statistics records.
#statistics clockstats cryptostats loopstats peerstats

# Disable the monitoring facility to prevent amplification attacks using ntpdc
# monlist command when default restrict does not include the noquery flag. See
# CVE-2013-5211 for more details.
# Note: Monitoring will not be disabled with the limited restriction flag.
disable monitor


```

## 启动ntpd

```shell
]# systemctl start ntpd
]# systemctl enable ntpd
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
# Use public servers from the pool.ntp.org project.
# Please consider joining the pool (http://www.pool.ntp.org/join.html).
server 192.168.10.134 iburst
#server 0.centos.pool.ntp.org iburst
#server 1.centos.pool.ntp.org iburst
#server 2.centos.pool.ntp.org iburst
#server 3.centos.pool.ntp.org iburst

# Record the rate at which the system clock gains/losses time.
driftfile /var/lib/chrony/drift

# Allow the system clock to be stepped in the first three updates
# if its offset is larger than 1 second.
makestep 1.0 3

# Enable kernel synchronization of the real-time clock (RTC).
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
