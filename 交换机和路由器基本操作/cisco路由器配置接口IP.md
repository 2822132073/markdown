# 三层交换机配置DHCP服务

[TOC]

## 拓扑图

![image-20210529195653910](C:\Users\86134\AppData\Roaming\Typora\typora-user-images\image-20210529195653910.png)

> 实现`vlan30`的主机分配到`192.168.30.0/24`的地址
>
> `vlan40`的主机分配到`192.168.40.0/24`的地址
>
> 排除`网关的地址`(默认为网段的第一个`IP`)

*交换机的配置就不写了,就是将对应的端口配置对应的vlan,还有配置trunk*

## 三层交换的配置

> ### 配置trunk口
>
> ```
> Switch(config-if)#switchport trunk encapsulation dot1q  //这里和二层交换机不同需要声明,vlan数据帧的封装类型,虽然只要一种
> Switch(config-if)#switchport mode trunk 
> Switch(config-if)#switchport trunk allowed vlan all
> ```
>
> ### 开启DHCP
>
> ```
> //全局下开启DHCP服务，该服务默认是关闭的
> Switch_Dhcp(config)#service dhcp
> //关闭DHCP分配冲突，日志记录消息
> Switch_Dhcp(config)#no ip dhcp conflict logging
> ```
>
> ### 配置各个Vlan的ip(此ip为网关)
>
> ```
> Switch(config)#vlan 30
> Switch(config-vlan)#vlan 40
> Switch(config-vlan)#exit
> Switch(config)#interface vlan 30  //配置vlan虚拟接口
> Switch(config-if)#ip address 192.168.30.1 255.255.255.0 //为虚拟接口配置IP
> Switch(config-if)#exit
> Switch(config)#interface vlan 40
> Switch(config-if)#ip address 192.168.40.1 255.255.255.0
> Switch(config-if)#exit
> ```
>
> ### 配置DHCP地址池
>
> ```
> Switch(config)#ip dhcp pool 30  //这里的30为地址池的名字,可以为任意字符
> Switch(dhcp-config)#network 192.168.30.0 255.255.255.0  //配置dhcp地址池的网段
> Switch(dhcp-config)#default-router 192.168.30.1  //配置默认网关
> Switch(dhcp-config)#dns-server 223.5.5.5 //配置DNS
> ```
>
> ```
> Switch(config)#ip dhcp pool 40  //这里的30为地址池的名字,可以为任意字符
> Switch(dhcp-config)#network 192.168.40.0 255.255.255.0  //配置dhcp地址池的网段
> Switch(dhcp-config)#default-router 192.168.40.1  //配置默认网关
> Switch(dhcp-config)#dns-server 223.5.5.5 //配置DNS
> ```
>
> ### 设置不可以被获取的地址
>
> ```
> Switch(config)#ip dhcp excluded-address 192.168.30.1
> Switch(config)#ip dhcp excluded-address 192.168.40.1
> ```
>
> ### 查看DHCP的分配情况
>
> ```
> show ip dhcp binding
> ```
>
> 

