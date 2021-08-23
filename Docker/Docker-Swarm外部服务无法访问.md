# Docker-Swarm外部服务无法访问

[TOC]

## 起因

> 在使用`Docker-Swarm`时,我已经将端口暴露,自己主机上可以访问自己的端口,在别的主机上无法访问

## 排查

> 在阅读许多的网上文档后,我基本上理解`Docker-Swarm`的负载的方式,再对问题进行排查,发现我的`Ingress`的子网和我的宿主机的网段相同,从而无法进行负载均衡,还排查到,在其它主机访问时,在流量走到`ingess-box`的`PREROUTEING`上就无法进行流量转发

**eth1**

```shell
09:46:09.678458 IP 10.0.0.92.36270 > 172.18.0.2.8080: Flags [S], seq 613789891, win 29200, options [mss 1460,sackOK,TS val 4084214 ecr 0,nop,wscale 7], length 0
09:46:10.680436 IP 10.0.0.92.36270 > 172.18.0.2.8080: Flags [S], seq 613789891, win 29200, options [mss 1460,sackOK,TS val 4085216 ecr 0,nop,wscale 7], length 0
09:46:12.686405 IP 10.0.0.92.36270 > 172.18.0.2.8080: Flags [S], seq 613789891, win 29200, options [mss 1460,sackOK,TS val 4087221 ecr 0,nop,wscale 7], length 0
```

**eth0**

无报文

> 在这里写一下`iptables`规则
>
> ```shell
> *mangle
> :PREROUTING ACCEPT [7:420]
> :INPUT ACCEPT [0:0]
> :FORWARD ACCEPT [0:0]
> :OUTPUT ACCEPT [0:0]
> :POSTROUTING ACCEPT [0:0]
> -A PREROUTING -p tcp -m tcp --dport 8080 -j MARK --set-xmark 0x100/0xffffffff
> -A INPUT -d 10.0.0.5/32 -j MARK --set-xmark 0x100/0xffffffff
> COMMIT
> *nat
> :PREROUTING ACCEPT [7:420]
> :INPUT ACCEPT [0:0]
> :OUTPUT ACCEPT [0:0]
> :POSTROUTING ACCEPT [0:0]
> :DOCKER_OUTPUT - [0:0]
> :DOCKER_POSTROUTING - [0:0]
> -A POSTROUTING -d 10.0.0.0/24 -m ipvs --ipvs -j SNAT --to-source 10.0.0.2
> COMMIT
> 
> ```
>
> `ipvs`
>
> ```shell
> IP Virtual Server version 1.2.1 (size=4096)
> Prot LocalAddress:Port Scheduler Flags
>   -> RemoteAddress:Port           Forward Weight ActiveConn InActConn
> FWM  256 rr
>   -> 10.0.0.6:0                   Masq    1      0          0         
>   -> 10.0.0.8:0                   Masq    1      0          0         
>   -> 10.0.0.9:0                   Masq    1      0          0         
> ```
>
> 按道理说,从外部访问的主机会匹配这条规则,然后将这个报文打上`MARK`,然后交由`ipvs`处理,`IPVS`再将其进行向后端转发,但是流量到了这里就无法进行转发了
>
> ```shell
> -A PREROUTING -p tcp -m tcp --dport 8080 -j MARK --set-xmark 0x100/0xffffffff
> ```

进行`curl`前

```shell
Chain PREROUTING (policy ACCEPT 7 packets, 420 bytes)
 pkts bytes target     prot opt in     out     source               destination         

Chain INPUT (policy ACCEPT 0 packets, 0 bytes)
 pkts bytes target     prot opt in     out     source               destination         

Chain OUTPUT (policy ACCEPT 6 packets, 372 bytes)
 pkts bytes target     prot opt in     out     source               destination         
    0     0 DOCKER_OUTPUT  all  --  *      *       0.0.0.0/0            127.0.0.11          

Chain POSTROUTING (policy ACCEPT 6 packets, 372 bytes)
 pkts bytes target     prot opt in     out     source               destination         
    0     0 DOCKER_POSTROUTING  all  --  *      *       0.0.0.0/0            127.0.0.11          
    0     0 SNAT       all  --  *      *       0.0.0.0/0            10.0.0.0/24          ipvs to:10.0.0.2

Chain DOCKER_OUTPUT (1 references)
 pkts bytes target     prot opt in     out     source               destination         
    0     0 DNAT       tcp  --  *      *       0.0.0.0/0            127.0.0.11           tcp dpt:53 to:127.0.0.11:40265
    0     0 DNAT       udp  --  *      *       0.0.0.0/0            127.0.0.11           udp dpt:53 to:127.0.0.11:50438

Chain DOCKER_POSTROUTING (1 references)
 pkts bytes target     prot opt in     out     source               destination         
    0     0 SNAT       tcp  --  *      *       127.0.0.11           0.0.0.0/0            tcp spt:40265 to::53
    0     0 SNAT       udp  --  *      *       127.0.0.11           0.0.0.0/0            udp spt:50438 to::53
[root@manager ~]# iptables -nv -L -t nat


```

进行`curl`后

```shell
Chain PREROUTING (policy ACCEPT 11 packets, 660 bytes)
 pkts bytes target     prot opt in     out     source               destination         

Chain INPUT (policy ACCEPT 0 packets, 0 bytes)
 pkts bytes target     prot opt in     out     source               destination         

Chain OUTPUT (policy ACCEPT 6 packets, 372 bytes)
 pkts bytes target     prot opt in     out     source               destination         
    0     0 DOCKER_OUTPUT  all  --  *      *       0.0.0.0/0            127.0.0.11          

Chain POSTROUTING (policy ACCEPT 6 packets, 372 bytes)
 pkts bytes target     prot opt in     out     source               destination         
    0     0 DOCKER_POSTROUTING  all  --  *      *       0.0.0.0/0            127.0.0.11          
    0     0 SNAT       all  --  *      *       0.0.0.0/0            10.0.0.0/24          ipvs to:10.0.0.2

Chain DOCKER_OUTPUT (1 references)
 pkts bytes target     prot opt in     out     source               destination         
    0     0 DNAT       tcp  --  *      *       0.0.0.0/0            127.0.0.11           tcp dpt:53 to:127.0.0.11:40265
    0     0 DNAT       udp  --  *      *       0.0.0.0/0            127.0.0.11           udp dpt:53 to:127.0.0.11:50438

Chain DOCKER_POSTROUTING (1 references)
 pkts bytes target     prot opt in     out     source               destination         
    0     0 SNAT       tcp  --  *      *       127.0.0.11           0.0.0.0/0            tcp spt:40265 to::53
    0     0 SNAT       udp  --  *      *       127.0.0.11           0.0.0.0/0            udp spt:50438 to::53
```

> 可以看到,在`curl`前后,`POSTROUTING`并没有没有改变,`PREROUTING`的报文数发生了改变



**`curl`前,mangle表的变化**

```shell
Chain PREROUTING (policy ACCEPT 0 packets, 0 bytes)
 pkts bytes target     prot opt in     out     source               destination         
    0     0 MARK       tcp  --  *      *       0.0.0.0/0            0.0.0.0/0            tcp dpt:8080 MARK set 0x102

Chain INPUT (policy ACCEPT 0 packets, 0 bytes)
 pkts bytes target     prot opt in     out     source               destination         
    0     0 MARK       all  --  *      *       0.0.0.0/0            10.0.0.14            MARK set 0x102

Chain FORWARD (policy ACCEPT 0 packets, 0 bytes)
 pkts bytes target     prot opt in     out     source               destination         

Chain OUTPUT (policy ACCEPT 0 packets, 0 bytes)
 pkts bytes target     prot opt in     out     source               destination         

Chain POSTROUTING (policy ACCEPT 0 packets, 0 bytes)
 pkts bytes target     prot opt in     out     source               destination         
```

**`curl`后,mangle表的变化**

```shell
Chain PREROUTING (policy ACCEPT 5 packets, 300 bytes)
 pkts bytes target     prot opt in     out     source               destination         
    5   300 MARK       tcp  --  *      *       0.0.0.0/0            0.0.0.0/0            tcp dpt:8080 MARK set 0x102

Chain INPUT (policy ACCEPT 0 packets, 0 bytes)
 pkts bytes target     prot opt in     out     source               destination         
    0     0 MARK       all  --  *      *       0.0.0.0/0            10.0.0.14            MARK set 0x102

Chain FORWARD (policy ACCEPT 0 packets, 0 bytes)
 pkts bytes target     prot opt in     out     source               destination         

Chain OUTPUT (policy ACCEPT 0 packets, 0 bytes)
 pkts bytes target     prot opt in     out     source               destination         

Chain POSTROUTING (policy ACCEPT 0 packets, 0 bytes)
 pkts bytes target     prot opt in     out     source               destination         
```

> 报文进入了`mangle`表进行了`MARK`,但是却无法转发到`IPVS`上

这个问题就不找了,以后更厉害了,估计就知道了



## 解决方法

> 如果,有服务进行了端口暴露,需要停止这个服务,再进行删除`ingress`网络,不然无法成功删除
>
> 删除原来的`ingess`网络
>
> ```shell
> [root@manager ~]# docker network rm ingress 
> WARNING! Before removing the routing-mesh network, make sure all the nodes in your swarm run the same docker engine version. Otherwise, removal may not be effective and functionality of newly create ingress networks will be impaired.
> Are you sure you want to continue? [y/N] y
> 
> ```
>
> 创建新的`ingess`网络
>
> ```shell
> docker network create \
> --driver overlay \
> --ingress \
> --subnet=10.11.0.0/16 \   #定义的子网网段,不能和主机现有网络相同
> --gateway=10.11.0.2 \   #网关
> --opt com.docker.network.driver.mtu=1200 \  #mtu值
> my-ingress  # ingess网络名称
> 
> docker network create --driver overlay --ingress --subnet=10.11.0.0/16  --gateway=10.11.0.2 --opt com.docker.network.driver.mtu=1200  myingress  
> ```
>
> 创建服务,查看是否可以负载均衡
>
> ```shell
> [root@manager ~]# docker service create --replicas 3 --name web -p 8080:80 nginx
> ```
>
> 在`node2`上进行访问
>
> ```shell
> [root@node01 ~]# curl 10.0.0.91:8080
> <!DOCTYPE html>
> <html>
> <head>
> <title>Welcome to nginx!</title>
> <style>
>  body {
>      width: 35em;
>      margin: 0 auto;
>      font-family: Tahoma, Verdana, Arial, sans-serif;
>  }
> </style>
> </head>
> <body>
> <h1>Welcome to nginx!</h1>
> <p>If you see this page, the nginx web server is successfully installed and
> working. Further configuration is required.</p>
> 
> <p>For online documentation and support please refer to
> <a href="http://nginx.org/">nginx.org</a>.<br/>
> Commercial support is available at
> <a href="http://nginx.com/">nginx.com</a>.</p>
> 
> <p><em>Thank you for using nginx.</em></p>
> </body>
> </html>
> ```



