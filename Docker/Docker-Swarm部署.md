# Docker-Swarm部署

[TOC]

## 节点规划

|      IP       |    角色     |
| :-----------: | :---------: |
| **10.0.0.91** | **manager** |
| **10.0.0.92** | **worker**  |
| **10.0.0.93** | **worker**  |

## 前置条件

安装`Docker-Swarm`需要先安装`Docker`,所以请先安装 `Docker`

## 添加主机名(每个主机都要做)

```shell
[root@node02 ~]# cat /etc/hosts
127.0.0.1   localhost localhost.localdomain localhost4 localhost4.localdomain4
::1         localhost localhost.localdomain localhost6 localhost6.localdomain6
10.0.0.91 manager
10.0.0.92 node01
10.0.0.93 node02
```

## 检查内核参数(每个主机都要做)

```shell
[root@manager ~]# sysctl net.ipv4.ip_forward
net.ipv4.ip_forward = 1
[root@manager ~]# sysctl net.bridge.bridge-nf-call-ip6tables
net.bridge.bridge-nf-call-ip6tables = 1
[root@manager ~]# sysctl net.bridge.bridge-nf-call-iptables
net.bridge.bridge-nf-call-iptables = 1
```

> 如果以上参数不为`1`,请将一下参数加入`/etc/sysctl.d/99-sysctl.conf`
>
> ```shell
> net.bridge.bridge-nf-call-ip6tables = 1
> net.bridge.bridge-nf-call-iptables = 1
> net.ipv4.ip_forward=1
> ```
>
> 然后刷新参数
>
> ```shell
> [root@manager ~]# sysctl -p
> net.bridge.bridge-nf-call-ip6tables = 1
> net.bridge.bridge-nf-call-iptables = 1
> net.ipv4.ip_forward = 1
> ```
>
> 

## 部署`Docker-Swarm`manager节点 

```shell
[root@manager ~]# docker swarm init --advertise-addr 10.0.0.91
Swarm initialized: current node (twdifunytj89jtfy7xs4ywhpo) is now a manager.

To add a worker to this swarm, run the following command:

    docker swarm join --token SWMTKN-1-3i1g0lktfcpc2xhan9azg5u9ptb53792rx1ewf5b7rkeu7plin-08eu61zvk062fdhl0mob8gry7 10.0.0.91:2377

To add a manager to this swarm, run 'docker swarm join-token manager' and follow the instructions.
```

## 部署`Docker-swarm`Worker节点

*就是上面的那条命令*

```shell
docker swarm join --token SWMTKN-1-3i1g0lktfcpc2xhan9azg5u9ptb53792rx1ewf5b7rkeu7plin-08eu61zvk062fdhl0mob8gry7 10.0.0.91:2377
```

## 查看`Docker-Swarm`集群状态

```shell
[root@manager ~]# docker node ls
ID                            HOSTNAME            STATUS              AVAILABILITY        MANAGER STATUS      ENGINE VERSION
twdifunytj89jtfy7xs4ywhpo *   manager             Ready               Active              Leader              19.03.11
prcglmd0rlex3hxyjc2j66g77     node01              Ready               Active                                  19.03.11
o7webxf66m99i4cdeqgosfip2     node02              Ready               Active                                  19.03.11
```

> **AVAILABILITY列的说明：**
>
> - `Active` 意味着调度程序可以将任务分配给节点。
> - `Pause`意味着调度程序不会将新任务分配给节点，但现有任务仍在运行。
> - `Drain` 意味着调度程序不会向节点分配新任务。调度程序关闭所有现有任务并在可用节点上调度它们。
>
> **MANAGER STATUS列的说明**
>
> 显示节点是属于manager或者worker
>
> - **没有值** 表示不参与群管理的工作节点。
> - **`Leader`** 意味着该节点是使得群的所有群管理和编排决策的主要管理器节点。
> - **`Reachable`** 意味着节点是管理者节点正在参与Raft共识。如果领导节点不可用，则该节点有资格被选为新领导者。
> - **`Unavailable`** 意味着节点是不能与其他管理器通信的管理器。如果管理器节点不可用，您应该将新的管理器节点加入群集，或者将工作器节点升级为管理器。

## 添加`Docker-Swarm`manager节点

> 在`Manager`节点执行以下命令
>
> ```shell
> docker swarm join-token manager
> ```
>
> 会得到条命令
>
> ```shell
> [root@manager ~]# docker swarm join-token manager
> To add a manager to this swarm, run the following command:
> 
>     docker swarm join --token SWMTKN-1-3i1g0lktfcpc2xhan9azg5u9ptb53792rx1ewf5b7rkeu7plin-a93wphvego2iwmen4p1rpnhsg 10.0.0.91:2377
> 
> ```
>
> 在其它需要成为`manager`节点的节点执行

*Docker会开启两个端口,`2377`和`7946`，`2377`作为cluster管理端口，`7946`用于节点发现*

