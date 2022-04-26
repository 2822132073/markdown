# Docker修改默认网段

[TOC]

## 需求



在默认情况下,docker下的网段默认为 172.17.0.0/16,我需要将其换成192.168.10.0/24的网段

## 实现

修改/etc/docker/daemon.json

```shell
[root@docker ~]# cat /etc/docker/daemon.json
{
  "registry-mirrors": ["https://esc1pe31.mirror.aliyuncs.com"],
  "bip":"192.168.99.1/24"
}
```

注意：

- "bridge" : "","bip": "",这两个不能同时配置

- "bip"中配置的不能是一个网络`192.168.1.0/24`，它指网桥的ip，也就是bip的四位最后一位不能是0，否则一直报错如下：

  ```shell
  Error starting daemon: Error initializing network controller: Error creating default "bridge" network: failed to allocate gateway (192.168.0.0): Address already in use
  ```

- "default-gateway"不能和"bip"相同，但是又必须属于bip的网络，所以一般不指定，否则很容易报错如下：

  ```shell
  Error initializing network controller: Error creating default "bridge" network: auxilairy address: (DefaultGatewayIPv4:10.40.2.1) must belong to the master pool: 192.168.1.0/24
  ```

