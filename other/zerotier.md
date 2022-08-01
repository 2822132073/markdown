# 异地组网

[TOC]



## 此实验在部分windows,安卓上无法成功

> windows在使用的时候尽量关闭所有防火墙

## 相关网站

`官网`:https://www.zerotier.com/

`历史版本网站`:https://download.zerotier.com/RELEASES/



## 教程

### 首先登录zerotier

![image-20220426130034789](https://cdn.jsdelivr.net/gh/2822132073/image/image-20220426130034789.png)

### 创建网络

![image-20220426130303224](https://cdn.jsdelivr.net/gh/2822132073/image/image-20220426130303224.png)

> 点击创建网络后,会直接出现下图所示的网络,第二个是我之前创建的
>
> 第一列: 网络ID,想要加入网络的设置直接使用网络ID加入就可以了
>
> 第二列:子网范围,加入网络的设备会从该子网随机选取一个IP进行分配
>
> 第三列:绿色的是在线的主机数,蓝色的是认证的主机数

![image-20220426130448818](https://cdn.jsdelivr.net/gh/2822132073/image/image-20220426130448818.png)



### 安装zerotier

#### Linux

```shell
curl -s https://install.zerotier.com | sudo bash
```

> 直接使用脚本进行安装



### 加入网络

> 在Linux环境下直接使用命令进行加入

```c
 zerotier-cli join 12ac4a1e711e54c4 //12ac4a1e711e54c4这个是网络ID,需要填自己的
```

> 加入网络后,使用`ip a`查看会出现这样的一个设备

**Centos7**

![image-20220426132405005](https://cdn.jsdelivr.net/gh/2822132073/image/image-20220426132405005.png)

**Ubuntu20**

![image-20220426132452736](https://cdn.jsdelivr.net/gh/2822132073/image/image-20220426132452736.png)

**Ubuntu18**

![image-20220426134433595](https://cdn.jsdelivr.net/gh/2822132073/image/image-20220426134433595.png)


> 这个时候两个设备是没有IP地址的,需要在网页去设置
>
> 
>
> 这两个虚拟网卡的名字似乎是相同的,可能所有加入网络的设备都会这样,这个不清楚

![image-20220426132727674](https://cdn.jsdelivr.net/gh/2822132073/image/image-20220426132727674.png)

> 点击网络名可以进入设置

![image-20220426133103393](https://cdn.jsdelivr.net/gh/2822132073/image/image-20220426133103393.png)

> 这里的私有和公共
>
> 私有: 在设备加入网络后,`zerotier`不会直接加入网络,他会需要用户进行认证
>
> 公共:不需要用户进行认证,所有知道网络ID的都可以加入网络

![image-20220426133848167](https://cdn.jsdelivr.net/gh/2822132073/image/image-20220426133848167.png)

> 该页面可以在设置界面下拉查看
>
> 上面说的认证就是在这里打钩就行了

![image-20220426134103623](https://cdn.jsdelivr.net/gh/2822132073/image/image-20220426134103623.png)

> 在认证过一段时间后,这个就会出现IP,这个就是各个机器的IP

**Centos7**

![image-20220426134502330](https://cdn.jsdelivr.net/gh/2822132073/image/image-20220426134502330.png)

**Ubuntu20**

![image-20220426134517407](https://cdn.jsdelivr.net/gh/2822132073/image/image-20220426134517407.png)

**ubuntu18**

![image-20220426134541554](https://cdn.jsdelivr.net/gh/2822132073/image/image-20220426134541554.png)



可以使用这个IP进行通信

![image-20220426134754250](https://cdn.jsdelivr.net/gh/2822132073/image/image-20220426134754250.png)

![image-20220426134802908](https://cdn.jsdelivr.net/gh/2822132073/image/image-20220426134802908.png)

![image-20220426134810236](https://cdn.jsdelivr.net/gh/2822132073/image/image-20220426134810236.png)



### 不采用zerotier的自动分配IP

![image-20220607221840882](https://cdn.jsdelivr.net/gh/2822132073/image/image-20220607221840882.png)

想要完全不使用zerotier提供的自动分配IP请不要勾选下面的**IPv4 Auto-Assign**,而且还需要在下面的设备自己添加设备的IP,而且需要自己设置路由,例如下图的IP都是`10.0.0.0/24`,我们就必须提交一个Destination为10.0.0.0/24,(via)直接不填,这样表示,这个网段的主机为内网主机,如果没有这个路由,主机上的IP将无法出现

![](https://cdn.jsdelivr.net/gh/2822132073/image/image-20220607222122436.png)

路由设置:

![image-20220607222533845](https://cdn.jsdelivr.net/gh/2822132073/image/image-20220607222533845.png)



## 使用路由器作为网关

> 使用路由器作为网关,连接内网设备

[官网地址](https://zerotier.atlassian.net/wiki/spaces/SD/pages/224395274/Route+between+ZeroTier+and+Physical+Networks)



> 假设这个是路由器,内网地址为`10.0.0.0/24`,虚拟局域网的设备想要访问该内网,需要进行的步骤

![image-20220426135851986](D:\markdown\other\zerotire.assets\image-20220426135851986.png)

![image-20220426140222600](D:\markdown\other\zerotire.assets\image-20220426140222600.png)


> 记得需要进行iptables的规则配置
```
PHY_IFACE=ens192; ZT_IFACE=ztbtovisvv
sudo iptables -t nat -A POSTROUTING -o $PHY_IFACE -j MASQUERADE
sudo iptables -A FORWARD -i $PHY_IFACE -o $ZT_IFACE -m state --state RELATED,ESTABLISHED -j ACCEPT
sudo iptables -A FORWARD -i $ZT_IFACE -o $PHY_IFACE -j ACCEPT
```

> 需要开启ipv4转发,将其临时生效之后,需要将`net.ipv4.ip_forward=1`添加进入`/etc/sysctl.conf`

```
sudo sysctl -w net.ipv4.ip_forward=1
```



## 使用dns解析主机名(不需要记ip)

