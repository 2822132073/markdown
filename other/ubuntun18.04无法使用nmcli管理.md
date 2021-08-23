# ubuntun18.04无法使用nmcli管理

[TOC]

## 起因

> 在安装`ubuntun18.04`时,在安装完成后,想使用`nmcli`管理网络,下载`network-manager`后,查看连接状态,状态为无法管理

## 原因

> `ubuntun18.04`默认使用`netplan`管理网络,在我查看`interface`文件时,这个文件为空,所以,需要在`netplan`下进行修改

## 解决

> 在这个文件下加入一行`renderer: NetworkManager`,注意缩进

```shell
[root@root ~]# cat /etc/netplan/00-installer-config.yaml 
# This is the network config written by 'subiquity'
network:
  renderer: NetworkManager
  version: 2
  ethernets:
    ens33:
      dhcp4: true
```

```shell
[root@root ~]# netplan try
Do you want to keep these settings?
Press ENTER before the timeout to accept the new configuration
Changes will revert in 118 seconds
Configuration accepted.
[root@root ~]# netplan apply 
```

### NetworkManager配置文件位置

> 我是用`NetworkManager`修改`IP`,在`/etc/netplan/`并没有进行修改,`Network-Manager`是对`/etc/NetworkManager/system-connections`进行的修改,下面的每一个文件名都对应着一个`con-name`

