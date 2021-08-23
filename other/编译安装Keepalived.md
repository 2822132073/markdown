[TOC]



# 编译安装Keepalived

*由于yum安装不知道为啥无法执行脚本,需要编译安装keepalived才可以执行脚本*

## 安装必要的依赖包

```shell
yum install -y gcc openssl-devel libnl libnl-devel libnl3-devel pcre*
```

## 下载安装包

*需要下载wget

```shell
wget http://yum.test.com/tar/keepalived-2.0.20.tar.gz
```

## 解压安装包

```shell
tar -axf keepalived-2.0.20.tar.gz
```

## 切换目录

```shell
cd keepalived-2.0.20
```

## 生成编译文件

```shell
./configure --prefix=/usr/local/keepalived --enable-regex
```

## 编译安装

```shell
make && make install
```

## 修改一些配置文件

*原文件*

```shell
~]# cat /usr/local/keepalived/etc/sysconfig/keepalived 
# Options for keepalived. See `keepalived --help' output and keepalived(8) and
# keepalived.conf(5) man pages for a list of all options. Here are the most
# common ones :
#
# --vrrp               -P    Only run with VRRP subsystem.
# --check              -C    Only run with Health-checker subsystem.
# --dont-release-vrrp  -V    Dont remove VRRP VIPs & VROUTEs on daemon stop.
# --dont-release-ipvs  -I    Dont remove IPVS topology on daemon stop.
# --dump-conf          -d    Dump the configuration data.
# --log-detail         -D    Detailed log messages.
# --log-facility       -S    0-7 Set local syslog facility (default=LOG_DAEMON)
#

KEEPALIVED_OPTIONS="-D"

```

*修改后的文件*

```shell
~]# cat /usr/local/keepalived/etc/sysconfig/keepalived 
# Options for keepalived. See `keepalived --help' output and keepalived(8) and
# keepalived.conf(5) man pages for a list of all options. Here are the most
# common ones :
#
# --vrrp               -P    Only run with VRRP subsystem.
# --check              -C    Only run with Health-checker subsystem.
# --dont-release-vrrp  -V    Dont remove VRRP VIPs & VROUTEs on daemon stop.
# --dont-release-ipvs  -I    Dont remove IPVS topology on daemon stop.
# --dump-conf          -d    Dump the configuration data.
# --log-detail         -D    Detailed log messages.
# --log-facility       -S    0-7 Set local syslog facility (default=LOG_DAEMON)
#

KEEPALIVED_OPTIONS="-D -f /etc/keepalived/keepalived.conf"
```

## 移动keepalived命令

```shell
cp /usr/local/keepalived/sbin/keepalived /usr/local/sbin/
```

## 创建目录并且移动文件

```shell
cp /usr/local/keepalived/etc/keepalived/keepalived.conf /etc/keepalived/
```

## 检测是否可以能够启动

### 备份配置文件

```shell
cp /etc/keepalived/keepalived.conf{,.bak}
```

### 修改配置文件

*配置文件中的VIP根据实际环境选择*

```shell
! Configuration File for keepalived
global_defs {
router_id 1
}

vrrp_instance VI_1 {
state MASTER
interface ens34
virtual_router_id 60
priority 100
advert_int 1
nopreempt
authentication {
auth_type PASS
auth_pass 1111
}
virtual_ipaddress {
192.168.10.143/24
}
}
}
}
```

### 启动keepalived

```shell
systemctl start keepalived
```

### 查看是否有IP

```shell
[root@fsl ~]# ip a|grep 192.168.10.143
    inet 192.168.10.143/24 scope global secondary ens34
```

