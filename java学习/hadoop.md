# 组成

hadoop是一个非常大的生态圈,由许许多多的软件组成,但是我的目的只是为了通过考试,所以,下面只有三个组成部分

- HDFS
- YARN
- MapReduce



## HDFS

- NameNode（nn）：存储文件的元数据，如文件名，文件目录结构，文件属性（生成时间、副本数、文件权限），以及每个文件的块列表和块所在的DataNode等。
  （1）管理HDFS的名称空间；
  （2）配置副本策略；
  （3）管理数据块（Block）映射信息；
  （4）处理客户端读写请求。
- DataNode(dn)：在本地文件系统存储文件块数据，以及块数据的校验和。
  （1）存储实际的数据块；
  （2）执行数据块的读/写操作。
- Secondary NameNode(2nn)：每隔一段时间对NameNode元数据备份。并非NameNode的热备。当NameNode挂掉的时候，它并不能马上替换NameNode并提供服务。
  （1）辅助NameNode，分担其工作量，比如定期合并Fsimage和Edits，并推送给NameNode
  （2）在紧急情况下，可辅助恢复NameNode。

## YARN

### ResourceManager

ResourceManager 负责整个集群的资源管理和分配，是一个全局的资源管理系统。
NodeManager 以心跳的方式向 ResourceManager 汇报资源使用情况（目前主要是 CPU 和内存的使用情况）。RM 只接受 NM 的资源回报信息，对于具体的资源处理则交给 NM 自己处理。
YARN Scheduler 根据 application 的请求为其分配资源，不负责application job 的监控、追踪、运行状态反馈、启动等工作。

### NodeManager

NodeManager 是每个节点上的资源和任务管理器，它是管理这台机器的代理，负责该节点程序的运行，以及该节点资源的管理和监控。YARN 集群每个节点都运行一个NodeManager。
NodeManager 定时向 ResourceManager 汇报本节点资源（CPU、内存）的使用情况和Container 的运行状态。当 ResourceManager 宕机时 NodeManager 自动连接 RM 备用节点。
NodeManager 接收并处理来自 ApplicationMaster 的 Container 启动、停止等各种请求。

### ApplicationMaster

用 户 提 交 的 每 个 应 用 程 序 均 包 含 一 个 ApplicationMaster ， 它 可 以 运 行 在ResourceManager 以外的机器上。
负责与 RM 调度器协商以获取资源（用 Container 表示）。
将得到的任务进一步分配给内部的任务(资源的二次分配)。
与 NM 通信以启动/停止任务。
监控所有任务运行状态，并在任务运行失败时重新为任务申请资源以重启任务。
当前 YARN 自带了两个 ApplicationMaster 实现，一个是用于演示AM 编写方法的实例程序 DistributedShell，它可以申请一定数目的Container 以并行运行一个 Shell 命令或者 Shell 脚本；另一个是运行 MapReduce 应用程序的 AM—MRAppMaster。

说明1：客户端可以有多个
说明2：集群上可以运行多个ApplicationMaster
说明3：每个NodeManager上可以有多个Container