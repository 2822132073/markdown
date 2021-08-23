# Mysql搭建

[TOC]

*默认将安装包上传到 `/opt` 目录下*

## 下载链接

**[Mysql下载链接](dev.mysql.com/downloads/mysql)**

## 启动并开机自启Mysql

```shell
]# systemctl start mysqld
]# systemctl enable mysqld
```

## 修改Mysql密码

### 找到Mysql默认密码

*密码并不确定*

```shell
]# cat /var/log/mysqld.log |egrep "password.*root@localhost"|awk '{print $NF}'
rt7a,qB:pgCt
```

### 登录Mysql

*可以不加-S,直接登录,-S指定的是mysql的socket文件* 

```shell
]# mysql -uroot -p -S /var/lib/mysql/mysql.sock
Enter password: 
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 6
Server version: 5.7.33

Copyright (c) 2000, 2021, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql>
```

### 修改Mysql密码

*以下过程需要在Mysql的终端进行*

```shell
mysql> set password for root@localhost = password('Qwer123456...');
```