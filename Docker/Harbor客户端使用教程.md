# Harbor客户端使用

**如果`Harbor`没有配置证书,需要将`Harbor`的`IP`放入`daemon.json`的`insecure-registries`中,如下**

```shell
[root@manager ~]# cat /etc/docker/daemon.json
{
  "registry-mirrors": ["https://esc1pe31.mirror.aliyuncs.com"],
  "insecure-registries" : ["192.168.10.126"]
}
```

重启dockerd

```shell
systemctl restart docker
```

然后就可以登陆

```shell
[root@manager ~]# docker login 192.168.10.126
```

