![图片](https://cdn.jsdelivr.net/gh/2822132073/image/202406252125829.webp)

1. pool和pg(placement group)都是逻辑上的概念,实际数据都是存在于osd上的
2. ceph内部的冗余是在pg层上进行的

> 存储池的类型就是管理存储池冗余数据的，数据冗余无非是做数据分片的副本，这儿不叫分片，叫 PG，我们叫主 PG，也叫活动 PG 和副本 PG，我们这样来称呼就行了，一个 PG 里面的对象是统一被管理的，写的时候，一定是先写主 PG，然后再由主 PG 同步给副本 PG





## ceph的组件

### mon （核心组件）

一个Ceph集群需要多个Monitor组成的小集群，它们通过Paxos同步数据，用来保存 `monitor map, manager map, OSD map, MDS map, CRUSH map`，这些map是集群得一些元数据，对于集群来说至关重要。

## osd （核心组件） `Object Storage Daemon`

对象存储组件，一个单独的硬盘一个，也就是说如果一个物理主机有10个硬盘，那么就需要有10个osd

存储数据、处理数据复制、恢复和再平衡，并通过检查其他 Ceph OSD Daemon 的心跳为 Ceph 监控程序和管理程序提供一些监控信息。通常至少需要三个 Ceph OSD 才能实现冗余和高可用性。

> 一个ceph集群最少需要以上这两个组件

## mgr

Ceph 管理器守护进程（ceph-mgr）负责跟踪运行时指标和 Ceph 群集的当前状态，包括存储利用率、当前性能指标和系统负载。Ceph 管理器守护进程还托管基于 python 的模块，用于管理和公开 Ceph 群集信息，包括基于 Web 的 Ceph 控制面板和 REST API。高可用性通常至少需要两个管理器。

## mds

如果不需要使用到cephFS，就可以不安装mds

Ceph 元数据服务器（MDS，ceph-mds）存储 Ceph 文件系统的元数据。Ceph 元数据服务器允许 CephFS 用户运行基本命令（如 ls、find 等），而不会对 Ceph 存储群集造成负担。

## rgw

Ceph Object Storage 使用 Ceph Object Gateway 守护进程 (radosgw)，这是一个 HTTP 服务器，旨在与 Ceph 存储集群交互。Ceph Object Gateway 提供与 Amazon S3 和 OpenStack Swift 兼容的接口，并且拥有自己的用户管理。Ceph Object Gateway 可以使用单个 Ceph 存储集群来存储来自 Ceph 文件系统和 Ceph 块设备客户端的数据。S3 API 和 Swift API 共享一个共同的命名空间，这意味着可以使用一个 API 向 Ceph 存储集群写入数据，然后使用另一个 API 检索该数据。

