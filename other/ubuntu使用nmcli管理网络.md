# 使用NetworkManager管理网络

[TOC]

## ubuntu16.04

> 在`ubuntu16.04`中可以使用两种方式管理网卡.
>
> -  `/etc/network/interfaces`
> - `NetworkManager`
>
> `ubuntu16.04`默认使用 `/etc/network/interfaces`管理网络,想要使用`NetworkManager`管理网络,需要安装`network-manager`
>
> ```shell
> apt install -y network-manager
> ```
>
> 在使用`NetworkManager`管理网络后,请不要使用`/etc/network/interfaces`方式管理网络,如果用户在安装nm之后（Desktop版本默认安装了nm），自己手动修改了`interfaces` 文件，那nm 就自动停止对系统网络的管理，系统改使用`interfaces` 文件内的参数进行网络配置。
>
> **此时，再去修改nm 内的参数，不影响系统实际的网络配置。若要让nm 内的配置生效，必须重新启用nm 接管系统的网络配置。**
>
> 所以想要使用`Network-Manager`管理网络,必须要将`/etc/network/interfaces`的**除lo外**所有网络配置删除
>
> ```shell
> [root@ubuntu ~]# cat /etc/network/interfaces
> source /etc/network/interfaces.d/*
> auto lo
> iface lo inet loopback
> ```
>
> 还需要修改`NetworkManager`配置文件`/etc/NetworkManager/NetworkManager.conf`
>
> ```shell
> [ifupdown]
> managed=true
> ```
>
> 
>
> **而且需要确保每个连接的`connection.autoconnect`属性为`yes`**

## ubuntu18.04/22.04

使用`netplan`管理网络时，可能这个配置文件不是直接生成的，而是通过一个cloud-ini生成的，我们需要修改这个文件，一般`netplan`为以下内容时需要注意：

```yaml
# This file is generated from information provided by the datasource.  Changes
# to it will not persist across an instance reboot.  To disable cloud-init's
# network configuration capabilities, write a file
# /etc/cloud/cloud.cfg.d/99-disable-network-config.cfg with the following:
# network: {config: disabled}
network:
    ethernets:
        ens33:
            dhcp4: true
    version: 2
```

直接按照它的指示添加文件写入内容即可



> 在`ubuntu18.04/22.04`中默认使用`netplan`管理网络,想要使用`NetworkManager`管理网络,需要先安装
>
> ```shell
> apt install -y network-manager
> ```
>
> 需要修改`NetworkManager`配置文件`/etc/NetworkManager/NetworkManager.conf`
>
> ```shell
> [ifupdown]
> managed=true
> ```
>
> 再修改`netplan`的配置文件
>
> ```shell
> [root@root ~]# cat /etc/netplan/00-installer-config.yaml 
> # This is the network config written by 'subiquity'
> network:
>   renderer: NetworkManager
>   version: 2
> ```
>
> 应用配置文件
>
> ```shell
> [root@root ~]# netplan try
> Do you want to keep these settings?
> Press ENTER before the timeout to accept the new configuration
> Changes will revert in 118 seconds
> Configuration accepted.
> [root@root ~]# netplan apply
> ```
>
> 如果使用 `nmcli donnection` 查看到的连接不生效，请使用 `nmcli c up <connect-name>` 启动这个 `connect`
> 一般来说肯定是有与`connect`相关联的`device`的，如果没有，请手动创建

