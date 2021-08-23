[TOC]

# 搭建HAproxy集群

*需要在部署完成Galera集群后部署HAproxy集群

| 主机名       | 角色          |
| ------------ | ------------- |
| controller01 | 192.168.10.31 |
| controller02 | 192.168.10.32 |
| controller03 | 192.168.10.33 |

## 安装HAproxy

```shell
yum install -y haproxy
```

## 为HAproxy配置用户,让其可以无密码访问

```sql
mysql -uroot -pa123456! -P3306
create user 'haproxy_check'@'localhost';
create user 'haproxy_check'@'192.168.10.31';
create user 'haproxy_check'@'192.168.10.32';
create user 'haproxy_check'@'192.168.10.33';
create user 'haproxy_check'@'controller01';
create user 'haproxy_check'@'controller02';
create user 'haproxy_check'@'controller03';
grant process on *.* to 'haproxy_check'@'localhost' identified by '';
grant process on *.* to 'haproxy_check'@'192.168.10.31' identified by '';
grant process on *.* to 'haproxy_check'@'192.168.10.32' identified by '';
grant process on *.* to 'haproxy_check'@'192.168.10.33' identified by '';
grant process on *.* to 'haproxy_check'@'controller01' identified by '';
grant process on *.* to 'haproxy_check'@'controller02' identified by '';
grant process on *.* to 'haproxy_check'@'controller03' identified by '';
flush privileges;
select user, host, authentication_string from mysql.user;
quit
```

## 开启一些内核参数

### 生成配置文件

*注释选项为可选项,可以配置,也可以不配置*

```shell
cat > /etc/sysctl.d/haproxy.conf << EOF
## 开启：内核路由转发功能
net.ipv4.ip_forward = 1
## 允许：应用程序能够绑定到不属于本地网卡的地址上（仅仅在结合KeepAlived高可用的情况下使用）
## net.ipv4.ip_nonlocal_bind = 1
## 扩大：可用的<随机端口范围>
## net.ipv4.ip_local_port_range = 1024 65000
## 缩短：<TIME_WAIT状态端口>的<等待时间>
## net.ipv4.tcp_fin_timeout = 15
## 设置：允许将TIME-WAIT sockets重新用于新的TCP连接，net.ipv4.tcp_tw_reuse = 1 表示开启重用，默认为0，表示关闭
## net.ipv4.tcp_tw_reuse = 1
## 设置：开启TCP连接中TIME-WAIT sockets的快速回收，net.ipv4.tcp_tw_recycle = 1 表示开启，默认为0，表示关闭。
## net.ipv4.tcp_tw_recycle = 0
EOF
```

### 加载内核参数

```shell
sysctl --system
```

## 编写Haproxy配置文件

*所有节点都相同*

```shell
cat > /etc/haproxy/haproxy.cfg <<EOF
global
  chroot   /var/lib/haproxy
  daemon
  group    haproxy
  maxconn  4000
  pidfile  /var/run/haproxy.pid
  user     haproxy
#################################################################
defaults
  log  global
  maxconn  4000
  option   redispatch
  retries  3
  timeout  http-request 10s
  timeout  queue 1m
  timeout  connect 10s
  timeout  client 1m
  timeout  server 1m
  timeout  check 10s
#################################################################
## haproxy监控页
listen stats
  bind 0.0.0.0:1080
  mode http
  stats enable
  stats uri /
  stats realm OpenStack\Haproxy
  stats auth admin:admin
  stats  refresh 30s
  stats  show-node
  stats  show-legends
  stats  hide-version
#################################################################
## Galera集群 负载均衡
listen galera_cluster
  bind *:33061
  balance  roundrobin
  mode tcp
  option   mysql-check user haproxy_check
  server   controller01 192.168.10.31:3306 check port 3306 inter 2000 rise 2 fall 5
  server   controller02 192.168.10.32:3306 check port 3306 inter 2000 rise 2 fall 5
  server   controller03 192.168.10.33:3306 check port 3306 inter 2000 rise 2 fall 5
EOF
```

## 启动并且使其开机自启

```shell
systemctl enable haproxy
systemctl restart haproxy
```

## 放行防火墙

*如果有的话*

```shell
firewall-cmd --permanent --zone=public --add-port=33061/tcp --add-port=1080/tcp
firewall-cmd --reload
```



