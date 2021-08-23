# Docker-Swarm网络

[TOC]

> `Docker-Swarm`有两个网络
>
> - `docker_gwbridge`
> - `ingress`
>
> `docker_gwbridge`是一个`bridge`网络,负责,容器与主机通信
>
> `ingress`是一个`overlay2`的虚拟的二层覆盖网络,这个网络用于将服务暴露给外部访问，docker swarm就是通过它实现的routing mesh（将外部请求路由到不同主机的容器）。

## Docker-Swarm中的容器如何与其他主机上的容器通信

> `Docker-Swarm`会创建一个`ingess`
>
> ```shell
> [root@manager ~]# docker network ls
> NETWORK ID          NAME                DRIVER              SCOPE
> 2d7d0c914941        bridge              bridge              local
> d90826abad05        docker_gwbridge     bridge              local
> 5987468e9e42        host                host                local
> q79wmy2m5tc5        ingress             overlay             swarm #自动创建的网络,但是我的主机上有点问题,创建的ingress网络与主机网络的相同,我对这个网络进行过更换
> e71fb6d1afcb        none                null                local
> ```
>
> 查看`ingress`的网络详情
>
> ```shell
> [root@manager ~]# docker inspect ingress 
> .....
>      "IPAM": {
>          "Driver": "default",
>          "Options": null,
>          "Config": [
>              {
>                  "Subnet": "10.11.0.0/16",
>                  "Gateway": "10.11.0.2"
>              }
>          ]
>      },
> .....
> ```
>
> > 可以看到`ingress`的子网为`10.11.0.0/16`
>
> 创建一个服务
>
> > 如果不对端口指定端口,容器只连接上`docker0`网桥,当将容器的端口进行对外暴露时,才会接入`ingress`和`docker_gwbridge`
>
> ```shell
> docker service create --replicas 3 -p8080:80 --name test_1 busybox:sleep
> ```
>
> 查看各个容器的ip:
>
> **`Manager`**
>
> > `Bridge`:`172.18.0.3/16`
> >
> > `overlay`:` 10.11.0.14/16 `
>
> ```shell
> [root@manager ~]# docker exec test_1.3.ptazpkyc9ksu27o0ra47k2sxd ip a
> ...
> 26: eth0@if27: <BROADCAST,MULTICAST,UP,LOWER_UP,M-DOWN> mtu 1150 qdisc noqueue 
>     link/ether 02:42:0a:0b:00:0e brd ff:ff:ff:ff:ff:ff
>     inet 10.11.0.14/16 brd 10.11.255.255 scope global eth0
>        valid_lft forever preferred_lft forever
> 28: eth1@if29: <BROADCAST,MULTICAST,UP,LOWER_UP,M-DOWN> mtu 1500 qdisc noqueue 
>     link/ether 02:42:ac:12:00:03 brd ff:ff:ff:ff:ff:ff
>     inet 172.18.0.3/16 brd 172.18.255.255 scope global eth1
>        valid_lft forever preferred_lft forever
> ```
>
> **`Node01`**
>
> > `Bridge`:`172.18.0.3/16 `
> >
> > `overlay`:`10.11.0.12/16`
>
> ```shell
> [root@node01 ~]# docker exec test_1.1.rpi44vea4kvwgcsfipdlj4m5o ip a
> .....
> 22: eth0@if23: <BROADCAST,MULTICAST,UP,LOWER_UP,M-DOWN> mtu 1150 qdisc noqueue 
>     link/ether 02:42:0a:0b:00:0c brd ff:ff:ff:ff:ff:ff
>     inet 10.11.0.12/16 brd 10.11.255.255 scope global eth0
>        valid_lft forever preferred_lft forever
> 24: eth1@if25: <BROADCAST,MULTICAST,UP,LOWER_UP,M-DOWN> mtu 1500 qdisc noqueue 
>     link/ether 02:42:ac:12:00:03 brd ff:ff:ff:ff:ff:ff
>     inet 172.18.0.3/16 brd 172.18.255.255 scope global eth1
>        valid_lft forever preferred_lft forever
> ```
>
> **`Node02`**
>
> > `Bridge`:`172.18.0.3/16`
> >
> > `overlay`:`10.11.0.13/16`
>
> ```shell
> [root@node02 ~]# docker exec test_1.2.yz0fujii835wtqmlpposu1aqh ip a
> ...
> 22: eth0@if23: <BROADCAST,MULTICAST,UP,LOWER_UP,M-DOWN> mtu 1150 qdisc noqueue 
>     link/ether 02:42:0a:0b:00:0d brd ff:ff:ff:ff:ff:ff
>     inet 10.11.0.13/16 brd 10.11.255.255 scope global eth0
>        valid_lft forever preferred_lft forever
> 24: eth1@if25: <BROADCAST,MULTICAST,UP,LOWER_UP,M-DOWN> mtu 1500 qdisc noqueue 
>     link/ether 02:42:ac:12:00:03 brd ff:ff:ff:ff:ff:ff
>     inet 172.18.0.3/16 brd 172.18.255.255 scope global eth1
>        valid_lft forever preferred_lft forever
> ```
>
> 三个容器的`bridge`的`bridge`网络地址是相同的,`overlay`是不同的,不同主机间的容器是使用`overlay`的网络进行通信的
>
> ```shell
> [root@manager ~]# docker exec test_1.3.ptazpkyc9ksu27o0ra47k2sxd ping -c4 10.11.0.13
> PING 10.11.0.13 (10.11.0.13): 56 data bytes
> 64 bytes from 10.11.0.13: seq=0 ttl=64 time=0.361 ms
> 64 bytes from 10.11.0.13: seq=1 ttl=64 time=2.727 ms
> 64 bytes from 10.11.0.13: seq=2 ttl=64 time=0.701 ms
> 64 bytes from 10.11.0.13: seq=3 ttl=64 time=0.608 ms
> 
> --- 10.11.0.13 ping statistics ---
> 4 packets transmitted, 4 packets received, 0% packet loss
> round-trip min/avg/max = 0.361/1.099/2.727 ms
> ```
>
> `bridge`网络是用来与宿主机进行通信,并且能与外网进行通信
>
> ```shell
> [root@manager ~]# docker exec test_1.3.x0i66md3ks9u0t1idhn9u00f4 route -n
> Kernel IP routing table
> Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
> 0.0.0.0         172.18.0.1      0.0.0.0         UG    0      0        0 eth1
> 10.11.0.0       0.0.0.0         255.255.0.0     U     0      0        0 eth0
> 172.18.0.0      0.0.0.0         255.255.0.0     U     0      0        0 eth1
> ```
>
> 先使用`ping`外网
>
> ```shell
> [root@manager ~]# docker exec test_1.3.x0i66md3ks9u0t1idhn9u00f4 ping -c 4 www.baidu.com
> PING www.baidu.com (112.80.248.75): 56 data bytes
> 64 bytes from 112.80.248.75: seq=0 ttl=127 time=16.433 ms
> 64 bytes from 112.80.248.75: seq=1 ttl=127 time=16.223 ms
> 64 bytes from 112.80.248.75: seq=2 ttl=127 time=17.008 ms
> 64 bytes from 112.80.248.75: seq=3 ttl=127 time=16.623 ms
> 
> --- www.baidu.com ping statistics ---
> 4 packets transmitted, 4 packets received, 0% packet loss
> round-trip min/avg/max = 16.223/16.571/17.008 ms
> ```
>
> 
>
> 将容器与`docker_gwbridge`断开连接
>
> ```shell
> [root@manager ~]# docker network disconnect docker_gwbridge test_1.3.ptazpkyc9ksu27o0ra47k2sxd 
> Error response from daemon: container 8efd61d20463d1f0bfb526542d365e6fb42e2636093d75df6ee09170e905d4d1 failed to leave network docker_gwbridge: container 8efd61d20463d1f0bfb526542d365e6fb42e2636093d75df6ee09170e905d4d1: endpoint create on GW Network failed: endpoint with name gateway_fd1e316fc655 already exists in network docker_gwbridge
> ```
>
> `ping`外网
>
> ```shell
> [root@manager ~]# docker exec test_1.3.x0i66md3ks9u0t1idhn9u00f4 ping -c 4 www.baidu.com
> ^C
> ```
> 
> > 显示无法`ping`外网

> `Docker-Swarm`会有一个名称空间,里面包含这个网段的网桥,所有接入`overlay`网络的容器都会连接到该网桥
>
> 查看`docker`网络名称空间
>
> ```shell
> [root@manager ~]# ll /run/docker/netns/
> total 0
> -r--r--r-- 1 root root 0 May 17 16:25 1-q79wmy2m5t
> -r--r--r-- 1 root root 0 May 17 19:10 7035cc6a4c3a   #这个网络名称空间里面存在着ingress网络的网桥br0
> -r--r--r-- 1 root root 0 May 17 16:25 ingress_sbox   #下面会写到
> ```
>
> 进入网络名称空间:
>
> > 可以看到网桥的`IP`
>
> ```shell
> [root@manager ~]# nsenter --net=/run/docker/netns/1-q79wmy2m5t ip a
> .........
> 2: br0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1150 qdisc noqueue state UP group default 
>     link/ether 4a:12:15:4c:27:e9 brd ff:ff:ff:ff:ff:ff
>     inet 10.11.0.2/16 brd 10.11.255.255 scope global br0
>        valid_lft forever preferred_lft forever
> 11: vxlan0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1150 qdisc noqueue master br0 state UNKNOWN group default 
>     link/ether 4a:12:15:4c:27:e9 brd ff:ff:ff:ff:ff:ff link-netnsid 0
> 13: veth0@if12: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1150 qdisc noqueue master br0 state UP group default 
>     link/ether a6:0f:6e:b1:3d:c9 brd ff:ff:ff:ff:ff:ff link-netnsid 1
> 37: veth5@if36: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1150 qdisc noqueue master br0 state UP group default 
>     link/ether ea:5f:00:41:94:fc brd ff:ff:ff:ff:ff:ff link-netnsid 2
> ```
>
> > 下面还有两个`veth`设备对,设备号前面的是本名称空间的设备的设备号,而后面的另外一个数字是和它一对的设备的设备号,比如这条:`37: veth5@if36: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1150 qdisc noqueue master br0 state UP group default  `,这个设备在本名称空间的设备号为`37`,而相对应的他的另一端的设备号应该是`36`,另一端一般在容器中,看这个` master br0 `可以看出而设备号为`37`的这个设备连接到`br0`上
>
> 来验证这一点:
>
> ```shell
> [root@manager ~]# docker exec test_1.3.nrm0chgn4m9f5xeh4665d1854 ip a
> .....
> 36: eth0@if37: <BROADCAST,MULTICAST,UP,LOWER_UP,M-DOWN> mtu 1150 qdisc noqueue 
>     link/ether 02:42:0a:0b:00:10 brd ff:ff:ff:ff:ff:ff
>     inet 10.11.0.16/16 brd 10.11.255.255 scope global eth0
>        valid_lft forever preferred_lft forever
> ......
> ```
>
> 可以看到是这样的,这样,容器就将流量发往`ingress`网络的网关从而发往各个节点,其它节点的`overlay`网络也是这样通信,可以说`veth`对都是这样通信的,一端放在容器中做网桥,一端连接网桥

## Docker-Swarm如何完成负载均衡

> 先创建一个服务:
>
> *创建一个服务,由三个nginx容器组成,将宿主机的80端口映射到容器的80端口*
>
> ```shell
> docker service create --replicas 3 --name test_1 -p 8080:80 nginx
> ```
>
> 等其创建好了过后,可以看到宿主机上有这样一条`iptables`规则:
>
> ```shell
> -A DOCKER-INGRESS -p tcp -m tcp --dport 8080 -j DNAT --to-destination 172.18.0.2:8080
> ```
>
> *将目标端口是本机的数据包发往`172.18.0.2/24`上*
>
> 看看路由的情况:
>
> > 所有网段为172.18.0.0网段的机器会将数据包发往`docker_gwbridge`上
>
> ```shell
> [root@manager ~]# route -n
> Kernel IP routing table
> Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
> .......
> 172.18.0.0      0.0.0.0         255.255.0.0     U     0      0        0 docker_gwbridge
> ```
>
> 而`172.18.0.2`在一个叫做`ingress_sbox`的名称空间内,进去看看他的`IP`情况
>
> ```shell
> [root@manager ~]# nsenter --net=/run/docker/netns/ingress_sbox ip a
> .......
> 12: eth0@if13: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1150 qdisc noqueue state UP group default 
>     link/ether 02:42:0a:0b:00:04 brd ff:ff:ff:ff:ff:ff link-netnsid 0
>     inet 10.11.0.4/16 brd 10.11.255.255 scope global eth0
>        valid_lft forever preferred_lft forever
>     inet 10.11.0.20/32 brd 10.11.0.20 scope global eth0
>        valid_lft forever preferred_lft forever
> 14: eth1@if15: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default 
>     link/ether 02:42:ac:12:00:02 brd ff:ff:ff:ff:ff:ff link-netnsid 1
>     inet 172.18.0.2/16 brd 172.18.255.255 scope global eth1
>        valid_lft forever preferred_lft forever
> 
> ```
>
> > 数据报文从`docker_gwbridge`到`ingress_sbox`的过程,和前面的`veth`是一样的,可以看到`172.18.0.2`的另一端的设备为`15`,而`15`在宿主机的名称空间上
> >
> > ```shell
> > [root@manager ~]# ip a|grep 15.*14
> > 15: veth8a6ad36@if14: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue master docker_gwbridge state UP group default 
> > ```
> >
> > 而这个设备连接在`docker_gwbridge`上
>
> 报文到达`ingress-sbox`再进行`iptables`的流量转发
>
> ```shell
> [root@manager ~]# nsenter --net=/run/docker/netns/ingress_sbox iptables-save -t mangle
> # Generated by iptables-save v1.4.21 on Mon May 17 20:44:00 2021
> *mangle
> .......
> -A PREROUTING -p tcp -m tcp --dport 8080 -j MARK --set-xmark 0x102/0xffffffff
> -A INPUT -d 10.11.0.11/32 -j MARK --set-xmark 0x102/0xffffffff
> COMMIT
> ```
>
> > 一个报文到达`ingress_sbox`上后,`dstIP`为`172.18.0.2`,`dstPort`为`8080`,这就匹配了第一条规则,`iptables`将这个报文`mark`上`0x102`,`0x102`的十进制数为`258`
>
> ```shell
> [root@manager ~]# nsenter --net=/run/docker/netns/ingress_sbox ipvsadm -Ln
> IP Virtual Server version 1.2.1 (size=4096)
> Prot LocalAddress:Port Scheduler Flags
>   -> RemoteAddress:Port           Forward Weight ActiveConn InActConn
> FWM  258 rr
>   -> 10.11.0.12:0                 Masq    1      0          0         
>   -> 10.11.0.13:0                 Masq    1      0          0         
>   -> 10.11.0.16:0                 Masq    1      0          0         
> ```
>
> > 将标记为`258`的报文转发到下面三个`IP`
>
> ```shell
> [root@manager ~]# nsenter --net=/run/docker/netns/ingress_sbox iptables-save -t nat
> *nat
> .....
> -A POSTROUTING -d 10.11.0.0/16 -m ipvs --ipvs -j SNAT --to-source 10.11.0.4
> COMMIT
> ```
>
> > 这是一个`NAT`表的规则,将目标地址为`10.11.0.0/16`网段的报文的源地址转换为`10.11.0.4`,`Docker-swarm`的节点的这个`IP`都不相同,可以根据这个`IP`,每个请求哪个主机发出的
>
> **`Manager主机`**
>
> *每个主机都有自己的一个`IP`,用来访问后端服务,还有一个`VIP`不知道有啥用*
>
> ```shell
> [root@manager ~]# nsenter --net=/run/docker/netns/ingress_sbox ip a
> .......
> 12: eth0@if13: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1150 qdisc noqueue state UP group default 
>     link/ether 02:42:0a:0b:00:04 brd ff:ff:ff:ff:ff:ff link-netnsid 0
>     inet 10.11.0.4/16 brd 10.11.255.255 scope global eth0
>        valid_lft forever preferred_lft forever
>     inet 10.11.0.20/32 brd 10.11.0.20 scope global eth0
>        valid_lft forever preferred_lft forever
> 
> ```
>
> **`Node1`**
>
> ```shell
> 12: eth0@if13: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1150 qdisc noqueue state UP group default 
>     link/ether 02:42:0a:0b:00:09 brd ff:ff:ff:ff:ff:ff link-netnsid 0
>     inet 10.11.0.9/16 brd 10.11.255.255 scope global eth0
>        valid_lft forever preferred_lft forever
>     inet 10.11.0.20/32 brd 10.11.0.20 scope global eth0
>        valid_lft forever preferred_lft forever
> ```
>
> **`Node2`**
>
> ```shell
> 12: eth0@if13: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1150 qdisc noqueue state UP group default 
>     link/ether 02:42:0a:0b:00:0a brd ff:ff:ff:ff:ff:ff link-netnsid 0
>     inet 10.11.0.10/16 brd 10.11.255.255 scope global eth0
>        valid_lft forever preferred_lft forever
>     inet 10.11.0.20/32 brd 10.11.0.20 scope global eth0
>        valid_lft forever preferred_lft forever
> ```
>
> > 到这个为止,报文的目的端口还是`8080`,并没有变成`80`,所以在所有的容器的网络名称空间中都有这样一条`iptables`规则存在于`PREROUTING`上
>
> ```shel
> -A PREROUTING -d 10.11.0.21/32 -p tcp -m tcp --dport 8080 -j REDIRECT --to-ports 80
> ```
>
> > 当目的地址为自身的服务`IP`时,就会将目的端口转换为`80`,这样就完成了负载均衡
>
> <img src="D:\markdown\Docker\Docker-swarm网络.assets\201805040929325.png" alt="img" style="zoom:200%;" />

