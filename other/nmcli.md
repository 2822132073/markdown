# nmcli 命令操作

[TOC]

> nmcli用来配置网络,可以永久的修改,并且生成配置文件

![img](D:\markdown\nmcli.assets\1482552-20180930195218267-1123602572.png)

> nmcli有最重要的是device和connection,一个device可以有许多的connection,但是同一时刻只能有一个connection处于up状态

## 使用`nmcli`初始化设备

> 首先检查`NetworkManager`是否启动
>
> ```
> [root@cq88 ~]# systemctl status NetworkManager |grep "Active" |awk '{print "status: "$2}'
> status: active
> ```
>
> 如果没有启动,则启动,如果没有安装则安装
>
> ```
> yum install -y NetworkManager
> ```
>
> 查看现有`device`
>
> ```
> [root@cq88 ~]# nmcli device 
> DEVICE   TYPE      STATE   CONNECTION 
> ens34    ethernet  已连接  ens34
> ```
>
> 再查看`connect`
>
> > 连接的必须关联一个`device`才能生效
>
> ```
> [root@cq88 ~]# nmcli connection 
> NAME     UUID                                  TYPE      DEVICE  
> ens34    94aea789-efb3-ef4c-81b0-e8b18ecc9797  ethernet  ens34 
> ```
>
> > 可以使用`nmcli connection show `来查看连接的属性,连接的属性有许多,常用的一般是以下几种
>
> ```
> ipv4.method:                           #获取IP方式
> ipv4.dns:                              #dns地址
> ipv4.addresses:                        #ip地址和子网掩码
> ipv4.gateway:                          #网关
> connection.autoconnect:                #是否开机自动连接到该连接,需要设置为yes,不然需要手动up该连接
> ```
>
> 





## connection操作

### 显示现有的连接

```shell
[root@docker ~]# nmcli connection show
NAME     UUID                                  TYPE      DEVICE  
docker0  75cc1253-5fdb-463c-805b-28c5554ccdb9  bridge    docker0 
ens32    de8ca924-3562-48aa-92e0-9bcfe876d1a1  ethernet  ens32   
ens34    94aea789-efb3-ef4c-81b0-e8b18ecc9797  ethernet  ens34   
```



### 启动一个现有连接

> 基于connection名进行启动
>
> ```shell
> [root@docker ~]# nmcli connection up ens32
> Connection successfully activated (D-Bus active path: /org/freedesktop/NetworkManager/ActiveConnection/18)
> ```
>
> 基于UUID进行启动
>
> ```shell
>[root@docker ~]# nmcli connection up de8ca924-3562-48aa-92e0-9bcfe876d1a1 
> Connection successfully activated (D-Bus active path: /org/freedesktop/NetworkManager/ActiveConnection/12)
> ```
> 
> 基于网卡名进行启动
>
> ```shell
>[root@docker ~]# nmcli connection up ifname ens32
> Connection successfully activated (D-Bus active path: /org/freedesktop/NetworkManager/ActiveConnection/17)
> ```

### 停用connection

> 停止一个连接,和上面用法相同

### 修改connection属性

> 这些属性可以用`nmcli connection show eth0`进行获取，然后可以修改、添加或删除属性，若要设置属性，只需指定属性名称后跟值，空值将删除属性值，同一属性添加多个值使用`+`。同一属性删除指定值用`-`加索引,**`在添加或者删除IP时需要激活连接才能生效`**

> **开始的IP为`192.168.66.99`**
>
> ```shell
> [root@docker /etc/sysconfig/network-scripts]# ip a
> ....
>  link/ether 00:0c:29:ab:dd:a3 brd ff:ff:ff:ff:ff:ff
>  inet 192.168.66.99/24 brd 192.168.66.255 scope global noprefixroute ens32
>     valid_lft forever preferred_lft forever
> ...
> ..
> ```
>
> **添加IP`192.168.66.66`,并启动连接**
>
> ```shell
> [root@docker ~]# nmcli c modify ens32  +ipv4.addresses 192.168.66.66/24 ipv4.method manual 
> [root@docker ~]# nmcli c up ens32
> Connection successfully activated (D-Bus active path: /org/freedesktop/NetworkManager/ActiveConnection/22)
> ```
>
> **查看IP,有两个IP**
>
> ```shell
> [root@docker ~]# ip a
> .....
> 4: ens32: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
>     link/ether 00:0c:29:ab:dd:a3 brd ff:ff:ff:ff:ff:ff
>     inet 192.168.66.99/24 brd 192.168.66.255 scope global noprefixroute ens32
>        valid_lft forever preferred_lft forever
>     inet 192.168.66.66/24 brd 192.168.66.255 scope global secondary noprefixroute ens32
>        valid_lft forever preferred_lft forever
> 
> ```
>
> **查看配置文件**
>
> > 配置文件也发生了改变
>
> ```shell
> [root@docker ~]# cat /etc/sysconfig/network-scripts/ifcfg-ens32
> HWADDR=00:0C:29:AB:DD:A3
> TYPE=Ethernet
> PROXY_METHOD=none
> BROWSER_ONLY=no
> BOOTPROTO=none
> DEFROUTE=yes
> IPV4_FAILURE_FATAL=no
> IPV6INIT=yes
> IPV6_AUTOCONF=yes
> IPV6_DEFROUTE=yes
> IPV6_FAILURE_FATAL=no
> IPV6_ADDR_GEN_MODE=stable-privacy
> NAME=ens32
> UUID=de8ca924-3562-48aa-92e0-9bcfe876d1a1
> DEVICE=ens32
> ONBOOT=yes
> IPADDR=192.168.66.99
> PREFIX=24
> IPADDR1=192.168.66.66
> PREFIX1=24
> ```
>
> **删除IP`192.168.66.66`**
>
> ```shell
> [root@docker ~]# nmcli c modify ens32  -ipv4.addresses 192.168.66.66/24 ipv4.method manual 
> [root@docker ~]# nmcli c up ens32
> Connection successfully activated (D-Bus active path: /org/freedesktop/NetworkManager/ActiveConnection/23)
> [root@docker ~]# ip a
> .....
> 4: ens32: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
>     link/ether 00:0c:29:ab:dd:a3 brd ff:ff:ff:ff:ff:ff
>     inet 192.168.66.99/24 brd 192.168.66.255 scope global noprefixroute ens32
>        valid_lft forever preferred_lft forever
> ```
>
> 添加多个IP
>
> ```shell
> [root@docker ~]# nmcli c modify ens32  +ipv4.addresses 192.168.66.51/24 ipv4.method manual 
> [root@docker ~]# nmcli c modify ens32  +ipv4.addresses 192.168.66.52/24 ipv4.method manual 
> [root@docker ~]# nmcli c modify ens32  +ipv4.addresses 192.168.66.53/24 ipv4.method manual 
> [root@docker ~]# nmcli c up ens32
> 
> ```
>
> **查看索引**
>
> ```shell
> [root@docker ~]# nmcli -f IP4.ADDRESS connection show ens32
> IP4.ADDRESS[1]:                         192.168.66.99/24
> IP4.ADDRESS[2]:                         192.168.66.51/24
> IP4.ADDRESS[3]:                         192.168.66.52/24
> IP4.ADDRESS[4]:                         192.168.66.53/24
> ```
>
> **根据索引删除IP**
>
> ```shell
> [root@docker ~]# nmcli c modify ens32 -ipv4.addresses 2
> [root@docker ~]# nmcli c up ens32
> Connection successfully activated (D-Bus active path: /org/freedesktop/NetworkManager/ActiveConnection/25)
> ```
>
> **查看IP**
>
> ```shell
> [root@docker ~]# ip a
> 4: ens32: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
>     link/ether 00:0c:29:ab:dd:a3 brd ff:ff:ff:ff:ff:ff
>     inet 192.168.66.99/24 brd 192.168.66.255 scope global noprefixroute ens32
>        valid_lft forever preferred_lft forever
>     inet 192.168.66.51/24 brd 192.168.66.255 scope global secondary noprefixroute ens32
>        valid_lft forever preferred_lft forever
>     inet 192.168.66.53/24 brd 192.168.66.255 scope global secondary noprefixroute ens32
>        valid_lft forever preferred_lft forever
> [root@docker ~]# nmcli -f IP4.ADDRESS connection show ens32
> IP4.ADDRESS[1]:                         192.168.66.99/24
> IP4.ADDRESS[2]:                         192.168.66.51/24
> IP4.ADDRESS[3]:                         192.168.66.53/24
> ```

### 添加connection

> ```shell
> [root@docker ~]# nmcli connection add con-name ens32_1 type ethernet autoconnect yes ipv4.method manual ipv4.addresses 192.168.66.33/24 ifname ens32
> Connection 'ens32_1' (5e52fc40-65dd-43d8-8870-c391c1093801) successfully added.
> ```
>
> 更多的类型或方法可以使用`nmcli connection add help`查看。

### 删除connection

> ```shell
> [root@docker ~]# nmcli connection delete ens32_1 
> Connection 'ens32_1' (5e52fc40-65dd-43d8-8870-c391c1093801) successfully deleted.
> ```

### clone

> 克隆连接，克隆一个存在的连接，除了连接名称和uuid是新生成的，其他都是一样的。
>
> ```shell
> [root@docker ~]# nmcli connection clone ens32 ens32-clone
> ens32 (de8ca924-3562-48aa-92e0-9bcfe876d1a1) cloned as ens32-clone (12813450-d335-40ae-82bc-944a6279e519).
> [root@docker ~]# nmcli c
> NAME         UUID                                  TYPE      DEVICE  
> docker0      75cc1253-5fdb-463c-805b-28c5554ccdb9  bridge    docker0 
> ens32        de8ca924-3562-48aa-92e0-9bcfe876d1a1  ethernet  ens32   
> ens34        94aea789-efb3-ef4c-81b0-e8b18ecc9797  ethernet  ens34   
> ens32-clone  12813450-d335-40ae-82bc-944a6279e519  ethernet  --      
> ```
>
> 



## device

> 命令格式：`nmcli device {status|show|set|connect|reapply|modify|disconnect|delete|monitor|wifi|lldp}`
> 显示和管理设备接口。该选项有很多功能，例如连接wifi，创建热点，扫描无线，邻近发现等，下面仅列出常用选项。详细功能可使用`nmcli device help`查看。

### 查看状态

> ```shell
> [root@docker ~]# nmcli device  status 
> DEVICE   TYPE      STATE      CONNECTION 
> ens34    ethernet  connected  ens34      
> ens32    ethernet  connected  ens32      
> docker0  bridge    connected  docker0    
> lo       loopback  unmanaged  --         
> ```



### 查看接口详细信息

> ```shell
> [root@docker ~]# nmcli device show ens32
> GENERAL.DEVICE:                         ens32
> GENERAL.TYPE:                           ethernet
> GENERAL.HWADDR:                         00:0C:29:AB:DD:A3
> GENERAL.MTU:                            1500
> GENERAL.STATE:                          100 (connected)
> GENERAL.CONNECTION:                     ens32
> GENERAL.CON-PATH:                       /org/freedesktop/NetworkManager/ActiveConnection/25
> WIRED-PROPERTIES.CARRIER:               on
> IP4.ADDRESS[1]:                         192.168.66.99/24
> IP4.ADDRESS[2]:                         192.168.66.51/24
> IP4.ADDRESS[3]:                         192.168.66.53/24
> IP4.GATEWAY:                            --
> IP4.ROUTE[1]:                           dst = 192.168.66.0/24, nh = 0.0.0.0, mt = 102
> IP4.ROUTE[2]:                           dst = 192.168.66.0/24, nh = 0.0.0.0, mt = 102
> IP4.ROUTE[3]:                           dst = 192.168.66.0/24, nh = 0.0.0.0, mt = 102
> IP6.ADDRESS[1]:                         fe80::47b1:4549:f237:56fa/64
> IP6.GATEWAY:                            --
> IP6.ROUTE[1]:                           dst = ff00::/8, nh = ::, mt = 256, table=255
> IP6.ROUTE[2]:                           dst = fe80::/64, nh = ::, mt = 256
> IP6.ROUTE[3]:                           dst = fe80::/64, nh = ::, mt = 102
> ```
>
> 

### 设置属性

> `设置设备自动连接`
>
> ```shell
> [root@docker ~]# nmcli device set ens32 autoconnect yes
> ```
>
> 

### 连接一个设备

> 连接设备。提供一个设备接口，网络管理器将尝试找到一个合适的连接, 将被激活。它还将考虑未设置为自动连接的连接。(默认超时为90s)
>
> ```shell
> [root@docker ~]# nmcli device connect ens32
> Device 'ens32' successfully activated with 'de8ca924-3562-48aa-92e0-9bcfe876d1a1'.
> ```

### 修改连接

> 修改设备上处于活动的设备，但该修改只是临时的，并不会写入文件。（语法与 nmcli connection modify 相同）,无需`up`设备
>
> ```shell
> [root@docker ~]# nmcli device modify ens34 +ipv4.addresses 10.0.0.66/24
> Connection successfully reapplied to device 'ens34'.
> [root@docker ~]# ip a
> 2: ens34: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
>     link/ether 00:0c:29:ab:dd:ad brd ff:ff:ff:ff:ff:ff
>     inet 10.0.0.99/24 brd 10.0.0.255 scope global noprefixroute ens34
>        valid_lft forever preferred_lft forever
>     inet 10.0.0.66/24 brd 10.0.0.255 scope global secondary noprefixroute ens34
>        valid_lft forever preferred_lft forever
> [root@docker ~]# nmcli device modify ens34 -ipv4.addresses 10.0.0.66/24
> Connection successfully reapplied to device 'ens34'.
> [root@docker ~]# ip a
> 2: ens34: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
>     link/ether 00:0c:29:ab:dd:ad brd ff:ff:ff:ff:ff:ff
>     inet 10.0.0.99/24 brd 10.0.0.255 scope global noprefixroute ens34
>        valid_lft forever preferred_lft forever
> 
> 
> ```

### 断开连接

> 断开当前连接的设备，防止自动连接。但注意，断开意味着设备停止！但可用 connect 进行连接
>
> ```shell
> [root@docker ~]# nmcli device disconnect ens32
> Device 'ens32' successfully disconnected.
> [root@docker ~]# ip a
> 4: ens32: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
>     link/ether 00:0c:29:ab:dd:a3 brd ff:ff:ff:ff:ff:ff
> [root@docker ~]# nmcli device 
> DEVICE   TYPE      STATE         CONNECTION 
> ens34    ethernet  connected     ens34      
> docker0  bridge    connected     docker0    
> ens32    ethernet  disconnected  --         
> lo       loopback  unmanaged     --         
> [root@docker ~]# nmcli device connect ens32
> Device 'ens32' successfully activated with 'de8ca924-3562-48aa-92e0-9bcfe876d1a1'.
> [root@docker ~]# ip a
> 4: ens32: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
>     link/ether 00:0c:29:ab:dd:a3 brd ff:ff:ff:ff:ff:ff
>     inet 192.168.66.99/24 brd 192.168.66.255 scope global noprefixroute ens32
>        valid_lft forever preferred_lft forever
>     inet 192.168.66.51/24 brd 192.168.66.255 scope global secondary noprefixroute ens32
>        valid_lft forever preferred_lft forever
>     inet 192.168.66.53/24 brd 192.168.66.255 scope global secondary noprefixroute ens32
>        valid_lft forever preferred_lft forever
>     inet6 fe80::47b1:4549:f237:56fa/64 scope link tentative 
>        valid_lft forever preferred_lft forever
> ```

## nmcli状态码

mcli 如果成功退出状态值为0，如果发生错误则返回大于0的值。

- **0**: 成功-指示操作已成功
- **1**: 位置或指定的错误
- **2**: 无效的用户输入，错误的nmcli调用
- **3**: 超时了（请参阅 --wait 选项）
- **4**: 连接激活失败
- **5**: 连接停用失败
- **6**: 断开设备失败
- **7**: 连接删除失败
- **8**: 网络管理器没有运行
- **10**: 连接、设备或接入点不存在
- **65**: 当使用 --complete-args 选项，文件名应遵循。

