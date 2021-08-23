# DNS搭建

[TOC]



## 要求

1. 主机域: host.com

2. 主机名要求: 以自己姓名首字母为主机名
3. search域为host.com

## 安装bind9

```shell
]# yum install bind bind-utils
```

## 修改配置文件

### /etc/named.conf

修改过的内容:

> ​	listen-on port 53 { any; };   # 修改监听的端口和ip,any为本机上的所有ip
>
> allow-query     { any; }; #允许哪些人的查询

```shell
//
// named.conf
//
// Provided by Red Hat bind package to configure the ISC BIND named(8) DNS
// server as a caching only nameserver (as a localhost DNS resolver only).
//
// See /usr/share/doc/bind*/sample/ for example named configuration files.
//
// See the BIND Administrator's Reference Manual (ARM) for details about the
// configuration located in /usr/share/doc/bind-{version}/Bv9ARM.html

options {
	listen-on port 53 { any; };
	listen-on-v6 port 53 { ::1; };
	directory 	"/var/named";
	dump-file 	"/var/named/data/cache_dump.db";
	statistics-file "/var/named/data/named_stats.txt";
	memstatistics-file "/var/named/data/named_mem_stats.txt";
	allow-query     { any; };
	/* 
	 - If you are building an AUTHORITATIVE DNS server, do NOT enable recursion.
	 - If you are building a RECURSIVE (caching) DNS server, you need to enable 
	   recursion. 
	 - If your recursive DNS server has a public IP address, you MUST enable access 
	   control to limit queries to your legitimate users. Failing to do so will
	   cause your server to become part of large scale DNS amplification 
	   attacks. Implementing BCP38 within your network would greatly
	   reduce such attack surface 
	*/
	recursion yes;

	dnssec-enable yes;
	dnssec-validation yes;

	/* Path to ISC DLV key */
	bindkeys-file "/etc/named.iscdlv.key";

	managed-keys-directory "/var/named/dynamic";

	pid-file "/run/named/named.pid";
	session-keyfile "/run/named/session.key";
};

logging {
        channel default_debug {
                file "data/named.run";
                severity dynamic;
        };
};

zone "." IN {
	type hint;
	file "named.ca";
};

include "/etc/named.rfc1912.zones";
include "/etc/named.root.key";
```

## 复制区域解析服务

```shell
]# cp /var/named/named.empty /etc/named/host.com.zone
```

### 

/etc/named.rfc1912.zones

```shell
#添加一下内容到/etc/named.rfc1912.zones
zone "host.com" IN {
	type master;
	file "host.com.zone";
	allow-update { none; };
};
```

/var/named/host.com.zone

```shell
#区域解析文件以实际情况来改变
$TTL 1D
@	IN SOA	@ 12312312.qq.coom. (
					0	; serial
					1D	; refresh
					1H	; retry
					1W	; expire
					3H )	; minimum
       	IN	NS	@
    	IN	A	127.0.0.1
    	IN	AAAA	::1
ntp	IN	A	192.168.10.135
yum	IN	A	192.168.10.136
ftp	IN	A	192.168.10.136
web IN  A   192.168.10.136
```

## 检查配置文件是否正确

```shell
~]# named-checkconf    //检查配置文件语法
~]# named-checkzone host.com /var/named/host.com.zone   //检查区域文件语法 
```

## 启动named

```shell
[root@fsl ~]# systemctl start named
[root@fsl ~]# systemctl enable named
Created symlink from /etc/systemd/system/multi-user.target.wants/named.service to /usr/lib/systemd/system/named.service.
```

## 检查是否能解析

```shell
[root@fsl ~]# dig fsl.host.com @192.168.10.134 +short
192.168.10.134
[root@fsl ~]# dig cc.host.com @192.168.10.134 +short
192.168.10.136
[root@fsl ~]# dig jw.host.com @192.168.10.134 +short
192.168.10.135
```

# 脚本

```shell
#!/bin/bash
#以下脚本提供了一个基础DNS环境添加了一个基本的 host.com 域
#添加了一条 A 记录: fsl >> 10.0.0.1
#结尾时添加了一个验证的操作,会输出10.0.0.1
yum install bind bind-utils -y
sed -i -r -e "/\s*allow-query/s#localhost#any#" -e "/\s*listen-on\sport/s#127.0.0.1#any#" /etc/named.conf
echo -e "\033[36m 成功修改named配置文件 \033[0m"
cat >>/etc/named.rfc1912.zones<<EOF
zone "host.com" IN {
	type master;
	file "host.com.zone";
	allow-update { none; };
};
EOF
echo -e "\033[36m 成功修改 /etc/named.rfc1912.zones 配置文件 \033[0m"
cp /var/named/named.localhost /var/named/host.com.zone
echo -e "\033[36m 成功复制/var/named/host.com.zone \033[0m"
echo "fsl IN A 10.0.0.1" >>/var/named/host.com.zone 
echo -e "\033[36m 成功添加一条A记录 \033[0m"
chmod o+r /var/named/host.com.zone
systemctl start named
echo -e "\033[36m 成功启动named \033[0m"
systemctl enable named
echo -e "\033[36m 成功设置开机自启named \033[0m"
dig fsl.host.com @10.0.0.88 +short
```

