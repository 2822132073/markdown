# 使用Linux作为网关

## 环境介绍

### 虚拟机

> 有两个网络,一个与windows主机在一起(192.168.1.13)
>
> 另外一个与其它虚拟机组成一个网络(172.16.0.13)

### windows主机

> 与虚拟机同处一个网络(192.168.1.11)



## 目的

实现windows主机网络(192.168.1.0/24)与Linux主机中网络(172.16.0.16/24)网络互通,通过Linux作为网关



## 过程

### windows主机(在管理员模式下)

```cmd
route add -p 172.16.0.0/24 mask 255.255.255.0 192.168.1.13
```

> -p为永久路由不加-p为临时路由

### Linux主机

```shell
echo "1"> /proc/sys/net/ipv4/ip_forward
sysctl -p
iptables -t nat -A POSTROUTING -s 192.168.1.0/24 -j SNAT --to 172.16.0.13
iptables-save > /etc/iptables-script
```

> 注意,这里保存后,重启之后不会载入,需要在启动时执行
>
> `iptables-restore < /etc/iptables-script`

> 这条iptables规则的意思是源地址是192.168.1.0/24网段的数据包进行源地址转换,转换为172.16.0.13