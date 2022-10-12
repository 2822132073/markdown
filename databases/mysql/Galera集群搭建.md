# Galera集群

[TOC]

# 搭建

*本版本安装包使用Galera集群专用的Mysql安装包*

```mermaid
graph TD
Step1[上传Galera专用安装包]-->Step2[安装Mysql集群]
Step2-->Step3[启动Mysql]
Step3-->Step4[修改Mysql密码,并关闭Mysql]
Step4-->Step5[修改配置文件]
Step5-->Step6[引导Galera集群]
Step6[引导Galera集群]-->Step[检查集群状态]
subgraph 引导Galer集群
Step6-->ST1
ST1[启动第一台主机]-->ST2[再启动其它主机]
end
```

## 上传Galer集群安装包

*放在/opt目录下*

```shell
galera-3-25.3.33-1.el7.x86_64.rpm
mysql-wsrep-5.7-5.7.33-25.25.el7.x86_64.rpm
mysql-wsrep-client-5.7-5.7.33-25.25.el7.x86_64.rpm
mysql-wsrep-common-5.7-5.7.33-25.25.el7.x86_64.rpm
mysql-wsrep-devel-5.7-5.7.33-25.25.el7.x86_64.rpm
mysql-wsrep-libs-5.7-5.7.33-25.25.el7.x86_64.rpm
mysql-wsrep-libs-compat-5.7-5.7.33-25.25.el7.x86_64.rpm
mysql-wsrep-server-5.7-5.7.33-25.25.el7.x86_64.rpm
mysql-wsrep-test-5.7-5.7.33-25.25.el7.x86_64.rpm
```

*以上安装包必须全部安装*

## 安装Mysql集群

```shell
]# yum install -y /opt/*
```

## 启动Mysql

```shell
systemctl enable mysqld
systemctl start mysqld
```

## 修改Mysql的密码

```shell
#通过过滤找出Mysql初始密码
rootPass=`sed -r -n '/root@localhost: /p' /var/log/mysqld.log | awk -F '(: )+' '{print $2}'`
echo "$rootPass"
mysql -uroot -p$rootPass --connect-expired-password <<EOF
##临时设置密码强度
set global validate_password_policy=LOW; 
set global validate_password_length=6; 
#设置主机密码
alter user 'root'@'localhost' identified with mysql_native_password by 'a123456!'; 
grant all on *.* to 'root'@'%' identified with mysql_native_password by 'a123456!' with grant option;
flush privileges;
EOF
```

*如果开启防火墙则需要开启相应端口*

```shell
firewall-cmd --permanent --zone=public --add-port=3306/tcp --add-port=4567/tcp
firewall-cmd --reload
```

## 修改配置文件

*修改配置文件需要先进行对mysql的关闭*

```shell
systemctl stop mysqld
```

*Galera需要引用一个文件,路径不正确,所以需要创建软连接*

```shell
ln -s /usr/lib64/galera-3/libgalera_smm.so /usr/lib64/libgalera_smm.so
```

*找出自己的IP*

```shell
IP="`ip add show eth0 | grep -E "^\s*inet +" | awk -F '[ /]+' '{print $3}'`"
```

*配置文件以及相应的解释*

```shell
[mysqld]
# 设置：数据库基础目录
datadir=/var/lib/mysql
# 设置：mysqld进程间通信的<socket套接字文件>
socket=/var/lib/mysql/mysql.sock
# 设置：mysqld服务进程的<运行用户账户>
user=mysql
# 设置：<BinLog日志模式>为<ROW行模式>
binlog_format=ROW
# 绑定：服务侦听的IP地址
bind-address=0.0.0.0
# 设置：最大连接数
max-connections=65535
# 增大：最大错误连接数，该参数可以防止<暴力破解>，达到<阈值>就无条件拒绝连接
max_connect_errors=4000
# 禁用：密码复杂性检查
validate_password=off
# 设置：默认存储引擎为InnoDB，Galera不能与<MyISAM等非事务性存储引擎>一起工作
default_storage_engine=innodb
# 设置：InnoDB锁定模式为2，这是一个<交错锁定模式>，不要更改<该值>，否则会造成<死锁及系统无响应>的问题。
innodb_autoinc_lock_mode=2
# 设置：日志落盘模式为：每隔1秒，就将<InnoDB日志缓冲区>落盘写入<磁盘文件>，而不是每次提交时写入一次，以提高性能。
# 注意：如果整个集群因断电而全部宕机，则一样会有丢失数据的可能。
innodb_flush_log_at_trx_commit=0
# 设置：<Innodb内存缓冲区>的大小，用于缓存<表的数据和索引>。
#      通常是128MB，为了弥补Galera集群在独立MySQL数据库服务器上内存使用量的增加，您应该将通常的值缩减5%。
innodb_buffer_pool_size=122M
# 设置：提供<扩展WSREP写集复制功能>的<lib库文件>
wsrep_provider=/usr/lib64/libgalera_smm.so
# 设置：<Galera集群>的<cache缓存大小>
wsrep_provider_options="gcache.size=300M; gcache.page_size=300M"
# 设置：<Galera集群>的<名称>
wsrep_cluster_name="example_cluster"
# 设置：<Galera集群>的<节点IP地址>
wsrep_cluster_address="gcomm://192.168.10.31,192.168.10.32,192.168.10.33"
# 设置：本机的<Galera集群节点名称>
wsrep_node_name="$HOSTNAME"
# 设置：本机的<Galera集群节点IP地址>
wsrep_node_address="$IP"
# 设置：<Galera集群>的<同步复制工具>
wsrep_sst_method=rsync
# 设置：允许导入</etc/my.cnf.d目录>中的<其它配置文件>
!includedir /etc/my.cnf.d
[mysql_safe]
# 设置：错误日志文件
log-error=/var/log/mysqld.log
# 设置：进程PID文件
pid-file=/var/run/mysqld/mysqld.pid
```

# 引导Galera集群

## 先随便选择一台进行引导整个集群

```shell
systemctl stop mysqld
/usr/bin/mysqld_bootstrap
mysql -uroot -pa123456! -e "SHOW STATUS LIKE 'wsrep_cluster_size';"
```

![image-20210415170000738](C:\Users\86134\Desktop\image-20210415170000738.png)



## 在其他节点上进行加入集群

```shell
systemctl restart mysqld
```

## 在`第一台机器上检查是否有三个节点` 

```shell
mysql -uroot -pa123456! -e "SHOW STATUS LIKE 'wsrep_cluster_size';"
```

```shell
[root@galera03 ~]# mysql -uroot -pa123456! -e "SHOW STATUS LIKE 'wsrep_cluster_size';"
mysql: [Warning] Using a password on the command line interface can be insecure.
+--------------------+-------+
| Variable_name      | Value |
+--------------------+-------+
| wsrep_cluster_size | 3     |
+--------------------+-------+
```

## 优化Mysql

### 优化：放宽<ulimit系统资源>的<单用户>限制

```shell
cat > /etc/security/limits.d/21-nproc-nofile.conf << EOF
*          hard    nofile    $(cat /proc/sys/fs/file-max)
*          soft    nofile    $(cat /proc/sys/fs/file-max)
*          hard    nproc     $(($(cat /proc/sys/kernel/threads-max)/2))
*          soft    nproc     $(($(cat /proc/sys/kernel/threads-max)/2))
EOF
reboot

```

### 优化：<最大并发连接数>

```shell
cat > /etc/my.cnf.d/max_connections.cnf <<EOF
## 添加或修改：<最大并发连接数>，最大值：16384
[mysqld]
max_connections = 16384
EOF
```

*注意*

*在默认的<mysqld.service服务启动脚本>中，有一个 [LimitNOFILE = 10000 可打开的文件描述符数] 选项，由于<网络连接>同样需要占用<文件描述符>，因此 [LimitNOFILE = 10000] 同样会制约<最大并发连接数>,这里，我们将 LimitNOFILE 设置为： LimitNOFILE = $(cat /proc/sys/fs/file-max)*

```shell
nofile=$(cat /proc/sys/fs/file-max)
sed -i -r 's/^\s*LimitNOFILE +=.*/LimitNOFILE = '$nofile'/' /lib/systemd/system/mysqld.service
systemctl daemon-reload
systemctl restart mysqld
```

*查看配置是否成功*

```shell
mysqladmin -uroot -pa123456! variables | grep -E " max_connections "
```

*优化打开文件最大数量*

```shell
cat > /etc/my.cnf.d/open_files_limit.cnf <<EOF
## 添加或修改：<打开文件的最大数量>
[mysqld]
open_files_limit = $(cat /proc/sys/fs/file-max)
EOF
```

*重启Mysql*

```shell
systemctl restart mysqld
```

```shell
mysqladmin -uroot -pa123456! variables | grep -E " open_files_limit "
```
