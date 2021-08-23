# 将两个container加入同一net_NameSpace

[TOC]

## 需求

> 将两个容器加入同一网络名称空间,通过`localhost`来相互访问,从而不需要获取其它另外一个服务的`Container_IP`例如:
>
> > 我想要部署一个`wordpress`服务,需要`wordpress`服务镜像和`Mysql`服务镜像,一个端口是`80`,一个端口是`3306`,如果想要`wordpress`访问`3306`,就需要获取`Mysql`的`Container_ip`,如果在同一网络名称空间,就不需要找到`IP`,直接访问`localhost`就可以

## 实现

> 创建一个容器`test_1`
>
> > 查看其的`IP`为`172.17.0.2`
>
> ```shell
> [root@manager ~]# docker run --rm -ti --name test_1 busybox sh
> / # ip a
> 1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue qlen 1000
>     link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
>     inet 127.0.0.1/8 scope host lo
>        valid_lft forever preferred_lft forever
> 74: eth0@if75: <BROADCAST,MULTICAST,UP,LOWER_UP,M-DOWN> mtu 1500 qdisc noqueue 
>     link/ether 02:42:ac:11:00:02 brd ff:ff:ff:ff:ff:ff
>     inet 172.17.0.2/16 brd 172.17.255.255 scope global eth0
>        valid_lft forever preferred_lft forever
> ```
>
> 再创建一个容器`test_2`
>
> > 可以看到两个容器的`IP`地址完全相同,`MAC`地址也完全相同
>
> ```shell
> [root@manager ~]# docker run --rm -ti --name test_2 --network container:test_1 busybox sh
> / # ip a
> 1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue qlen 1000
>     link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
>     inet 127.0.0.1/8 scope host lo
>        valid_lft forever preferred_lft forever
> 74: eth0@if75: <BROADCAST,MULTICAST,UP,LOWER_UP,M-DOWN> mtu 1500 qdisc noqueue 
>     link/ether 02:42:ac:11:00:02 brd ff:ff:ff:ff:ff:ff
>     inet 172.17.0.2/16 brd 172.17.255.255 scope global eth0
>        valid_lft forever preferred_lft forever
> ```
>
> `--network`可以指定连接到那个网络,也可以指定和那个容器公用网络名称空间.通过`Container:<container_name>`指定

