# Docker将container同时加入两个网络

[TOC]



## 需求

让container加入两个网络

## 实现

如果使用`docker run`来实现.好像是不行的,因为`--network`只能指定一个网络

可以使用`docker network connect`来进行连接

### 创建两个网络

```shell
[root@docker ~]# docker network create --subnet 10.0.1.0/24 --gateway 10.0.1.10 test-1
e957a6ee57cc36a90ac46c80722b03d6efb131f3491a460d7e403f87f82e690d
[root@docker ~]# docker network create --subnet 10.0.2.0/24 --gateway 10.0.2.10 test-2
fc67eed08df58adf69279e64845136373aea5cfebea3d5e5001acd4609ff2ea5
```

- --subnet指定网段
- --gateway指定网关

### 创建一个Container

```shell
[root@docker ~]# docker run -d  --name test --network test-1 --rm -d busybox sleep 600
[root@docker ~]# docker exec test ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
53: eth0@if54: <BROADCAST,MULTICAST,UP,LOWER_UP,M-DOWN> mtu 1500 qdisc noqueue 
    link/ether 02:42:0a:00:01:01 brd ff:ff:ff:ff:ff:ff
    inet 10.0.1.1/24 brd 10.0.1.255 scope global eth0
       valid_lft forever preferred_lft forever
```

### 将其加入另外一个网络

```shell
[root@docker ~]# docker network connect test-2 test
[root@docker ~]# docker exec test ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
53: eth0@if54: <BROADCAST,MULTICAST,UP,LOWER_UP,M-DOWN> mtu 1500 qdisc noqueue 
    link/ether 02:42:0a:00:01:01 brd ff:ff:ff:ff:ff:ff
    inet 10.0.1.1/24 brd 10.0.1.255 scope global eth0
       valid_lft forever preferred_lft forever
55: eth1@if56: <BROADCAST,MULTICAST,UP,LOWER_UP,M-DOWN> mtu 1500 qdisc noqueue 
    link/ether 02:42:0a:00:02:01 brd ff:ff:ff:ff:ff:ff
    inet 10.0.2.1/24 brd 10.0.2.255 scope global eth1
       valid_lft forever preferred_lft forever
```



