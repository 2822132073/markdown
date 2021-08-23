# Docker网络实验

[TOC]

## Docker的四种网络模式

*我们使用busybox来完成本次实验*

### Host

容器将不会虚拟出自己的网卡，配置自己的 IP 等，而是使用宿主机的 IP 和端口。

**也就是说共享宿主机的网络名称空间**

#### 查看本机ip

```shell
[root@docker ~]# ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host 
       valid_lft forever preferred_lft forever
2: ens34: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
    link/ether 00:0c:29:ab:dd:ad brd ff:ff:ff:ff:ff:ff
    inet 10.0.0.99/24 brd 10.0.0.255 scope global noprefixroute ens34
       valid_lft forever preferred_lft forever
    inet6 fe80::20c:29ff:feab:ddad/64 scope link 
       valid_lft forever preferred_lft forever
3: docker0: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc noqueue state DOWN group default 
    link/ether 02:42:e9:e7:e1:ea brd ff:ff:ff:ff:ff:ff
    inet 172.17.0.1/16 brd 172.17.255.255 scope global docker0
       valid_lft forever preferred_lft forever
    inet6 fe80::42:e9ff:fee7:e1ea/64 scope link 
       valid_lft forever preferred_lft forever
```

#### 创建一个Network NameSpace 为本机的container

指定网络用host,可以看到这和我们宿主的结果是一样

```shell
[root@docker ~]# docker run --rm --network host busybox ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host 
       valid_lft forever preferred_lft forever
2: ens34: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast qlen 1000
    link/ether 00:0c:29:ab:dd:ad brd ff:ff:ff:ff:ff:ff
    inet 10.0.0.99/24 brd 10.0.0.255 scope global noprefixroute ens34
       valid_lft forever preferred_lft forever
    inet6 fe80::20c:29ff:feab:ddad/64 scope link 
       valid_lft forever preferred_lft forever
3: docker0: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc noqueue 
    link/ether 02:42:e9:e7:e1:ea brd ff:ff:ff:ff:ff:ff
    inet 172.17.0.1/16 brd 172.17.255.255 scope global docker0
       valid_lft forever preferred_lft forever
    inet6 fe80::42:e9ff:fee7:e1ea/64 scope link 
       valid_lft forever preferred_lft forever
```

### Bridge(默认为此模式)

为每一个容器分配、设置 IP 等，并将容器连接到一个 `docker0` 虚拟网桥，默认为该模式。

**创建自己的Network NameSpace,并为其设置IP,设置网络**

#### 创建一个的container(网络模式不用指定默认为Bridge)

```shell
docker run --rm  -d busybox sleep 600
```

#### 查看其网络地址

```shell
[root@docker ~]# docker exec d6c3b610ac2b ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
4: eth0@if5: <BROADCAST,MULTICAST,UP,LOWER_UP,M-DOWN> mtu 1500 qdisc noqueue 
    link/ether 02:42:ac:11:00:02 brd ff:ff:ff:ff:ff:ff
    inet 172.17.0.2/16 brd 172.17.255.255 scope global eth0
       valid_lft forever preferred_lft forever
```

#### 检测网络是否连通

```shell
[root@docker ~]# ping -c5 172.17.0.2
PING 172.17.0.2 (172.17.0.2) 56(84) bytes of data.
64 bytes from 172.17.0.2: icmp_seq=1 ttl=64 time=0.027 ms
64 bytes from 172.17.0.2: icmp_seq=2 ttl=64 time=0.034 ms
64 bytes from 172.17.0.2: icmp_seq=3 ttl=64 time=0.032 ms
64 bytes from 172.17.0.2: icmp_seq=4 ttl=64 time=0.054 ms
64 bytes from 172.17.0.2: icmp_seq=5 ttl=64 time=0.042 ms

--- 172.17.0.2 ping statistics ---
5 packets transmitted, 5 received, 0% packet loss, time 4005ms
rtt min/avg/max/mdev = 0.027/0.037/0.054/0.012 ms
```

#### 查看路由

*可以发现一条到docker0网桥的路由*

```shell
[root@docker ~]# route -n
Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         10.0.0.2        0.0.0.0         UG    100    0        0 ens34
10.0.0.0        0.0.0.0         255.255.255.0   U     100    0        0 ens34
172.17.0.0      0.0.0.0         255.255.0.0     U     0      0        0 docker0
```

### none

容器有独立的 Network namespace，但并没有对其进行任何网络设置，如分配 veth pair 和网桥连接，IP 等。

**为其创建自己的Network NameSpace,并不设置网络**

#### 创建一个网络模式为none的container

```shell
[root@docker ~]# docker run --rm -d --network none  --name test-busybox-2 busybox sleep 6000
```

#### 查看网络地址

```shell
[root@docker ~]# docker exec e262d92ae198 ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
```

#### 现象

可以看到,并没有出现ip,只有一个本地回环地址

### container

新创建的容器不会创建自己的网卡和配置自己的 IP，而是和一个指定的容器共享 IP、端口范围等。

**将新创建的Container加入其它Container的Network NameSpace,共享其它container的Network NameSpace**

#### 首先创建container 网络模式为Bridge模式

```shell
docker run --rm  -d --name Bridge busybox sleep 600

#### 再创建一个Container,网络模式为Container

```shell
docker run --rm -d --network container:Bridge --name container busybox sleep 600
```

#### 查看两个Container的IP

```shell
[root@docker ~]# docker exec Bridge ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
12: eth0@if13: <BROADCAST,MULTICAST,UP,LOWER_UP,M-DOWN> mtu 1500 qdisc noqueue 
    link/ether 02:42:ac:11:00:02 brd ff:ff:ff:ff:ff:ff
    inet 172.17.0.2/16 brd 172.17.255.255 scope global eth0
       valid_lft forever preferred_lft forever
[root@docker ~]# docker exec container ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
12: eth0@if13: <BROADCAST,MULTICAST,UP,LOWER_UP,M-DOWN> mtu 1500 qdisc noqueue 
    link/ether 02:42:ac:11:00:02 brd ff:ff:ff:ff:ff:ff
    inet 172.17.0.2/16 brd 172.17.255.255 scope global eth0
       valid_lft forever preferred_lft forever
```

#### 现象

两个的设备的IP和MAC地址完全相同

