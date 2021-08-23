# ip netns无法查看docker Container Network NameSpace

[TOC]

## 情况说明

一次在做docker网络实验的时候,我想看看docker的网络名称空间,发现无法查看,我的container在运行中,有IP,可以ping通,就是无法查看,网上寻找解决方案

## 问题所在

创建docker容器后本来应该有新的命名空间（如果有独立网络的话），那么可以通过 ip netns 命令查看到命名空间，但是实际上却看不到。

查过资料才发现，ip netns 只能查看到 /var/run/netns 下面的网络命名空间。docker 不像openstack  neutron 会自动在这个文件创建命名空间名字，需要手动创建。

docker的netns的文件存在一个叫/run/docker/netns的目录下

## 解决方案

### 一:

我们可以直接将/run/docker/netns直接link到/var/run/netns下

**这样的话在我们使用ip netns add添加network添加namespace时会报错**

```shel
ln -s /run/docker/netns /var/run/netns
```

### 二:

或者手动一个一个的添加

```shell
pid=`docker inspect -f '{{.State.Pid}}' $container_id`
ln -s /proc/$pid/ns/net /var/run/netns/$container_id
```



