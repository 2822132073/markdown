# Redis哨兵模式

[TOC]

| 主机      | 角色        |
| --------- | ----------- |
| 10.0.0.91 | Master,哨兵 |
| 10.0.0.92 | Slave,哨兵  |
| 10.0.0.93 | Slave,哨兵  |

## 安装Redis

> 见前面的安装`Redis`

## 修改配置文件

*哨兵模式是在主从复制的基础上的,设置哨兵可以监控主节点,当主节点宕掉后,可以自动进行切换,所以说哨兵模式需要起两个服务,一个redis,一个sentinel*

```
Redis的配置文件的后面添加:
replicaof <masterip> <masterport>
```

## 配置Redis-sentinel的systemctl管理

*在安装Redis后,就可以已经安装了redis-sentinel*

```
cat >/usr/lib/systemd/system/redis-sentinel.service<< EOF
[Unit]
Description=Redis Sentinel
After=network.target

[Service]
ExecStart=/usr/local/bin/redis-sentinel /etc/redis-sentinel.conf --daemonize no
ExecStop=/usr/libexec/redis-shutdown redis-sentinel

[Install]
WantedBy=multi-user.target
EOF
```

> 如果,前面已经创建了`/usr/libexec/redis-shutdown `,就不需要创建了

## 配置redis-sentinel

*每个节点都需要配置,每个节点的配置文件都一样*

```
cat >/etc/redis-sentinel.conf<<EOF 
port 26379
daemonize no
pidfile "/var/run/redis-sentinel.pid"
logfile /var/log/redis-sentinel.log
dir "/tmp"
sentinel myid 257f02646bf7a5094b26a08604606a2cea09d7c4
sentinel deny-scripts-reconfig yes
sentinel monitor mymaster 10.0.0.91 6379 2
sentinel config-epoch mymaster 2
sentinel leader-epoch mymaster 22
EOF
```

### 	查看集群状态

```
[root@manager ~]# redis-cli -p 26379 info Sentinel
# Sentinel
sentinel_masters:1
sentinel_tilt:0
sentinel_running_scripts:0
sentinel_scripts_queue_length:0
sentinel_simulate_failure_flags:0
master0:name=mymaster,status=ok,address=10.0.0.91:6379,slaves=2,sentinels=3
//可以看到主节点的地址为10.0.0.91,有两个Slave,有三个哨兵
```