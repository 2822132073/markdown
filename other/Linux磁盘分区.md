# Linux磁盘分区



> Linux的磁盘分区工具有两种，一种是fdisk，一种是parted，`fdisk`只能用来进行2T以下的磁盘分区，而`parted`可以进行2T以上的磁盘分区

> 1. MBR分区表：Master Boot Record，即硬盘主引导记录分区表，只支持容量在 2.1TB 以下的硬盘，超过2.1TB的硬盘只能管理2.1TB，最多只支持4个主分区或三个主分区和一个扩展分区，扩展分区下可以有多个逻辑分区。
>
> 2. GPT分区表：GPT，全局唯一标识分区表(GUID Partition Table)，与MBR最大4个分区表项的限制相比，GPT对分区数量没有限制，但Windows最大仅支持128个GPT分区，GPT可管理硬盘大小达到了18EB。只有基于UEFI平台的主板才支持GPT分区引导启动。

## fdisk

> 注意，实验环境为Centos8

### 交互式命令

> `fdisk  device_path`

```shell
[root@localhost ~]# fdisk /dev/sdb

Welcome to fdisk (util-linux 2.32.1).
Changes will remain in memory only, until you decide to write them.
Be careful before using the write command.

Device does not contain a recognized partition table.
Created a new DOS disklabel with disk identifier 0x3be3d17c.

Command (m for help): m

Help:

  DOS (MBR)
   a   toggle a bootable flag
   b   edit nested BSD disklabel
   c   toggle the dos compatibility flag

  Generic
   d   delete a partition 
   F   list free unpartitioned space
   l   list known partition types
   n   add a new partition
   p   print the partition table
   t   change a partition type
   v   verify the partition table
   i   print information about a partition

  Misc
   m   print this menu
   u   change display/entry units
   x   extra functionality (experts only)

  Script
   I   load disk layout from sfdisk script file
   O   dump disk layout to sfdisk script file

  Save & Exit
   w   write table to disk and exit
   q   quit without saving changes

  Create a new label
   g   create a new empty GPT partition table
   G   create a new empty SGI (IRIX) partition table
   o   create a new empty DOS partition table
   s   create a new empty Sun partition table
```



```
在使用m后，会打印出相关的信息，有些不需要关注，在这里写一些需要关注的命令
   d   delete a partition   // 删除一个分区
   F   list free unpartitioned space  //列出未分区的空间
   l   list known partition types  //显示已知的分区类型，其中82为Linux swap分区，83为Linux分区
   n   add a new partition  // 增加一个新的分区
   p   print the partition table  //显示磁盘当前的分区表
   t   change a partition type  //改变一个分区的系统ID，就是改变分区类型
   v   verify the partition table   //验证磁盘分区表
   i   print information about a partition //打印分区表信息
   w   write table to disk and exit //将分区表写入磁盘并退出（保存并退出）
   q   quit without saving changes  //不保存分区表信息
```



> 下面的步骤根据提示进行就可以了

### 实例

```c
[root@localhost ~]# fdisk /dev/sdb 

Welcome to fdisk (util-linux 2.32.1).
Changes will remain in memory only, until you decide to write them.
Be careful before using the write command.

Device does not contain a recognized partition table.
Created a new DOS disklabel with disk identifier 0x2a38366a.

Command (m for help): p    
Disk /dev/sdb: 100 GiB, 107374182400 bytes, 209715200 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: dos   //这里的dos就是对应的mbr
Disk identifier: 0x2a38366a

Command (m for help): n
Partition type
   p   primary (0 primary, 0 extended, 4 free)
   e   extended (container for logical partitions)
Select (default p): p   //选择的分区是主分区
Partition number (1-4, default 1): 
First sector (2048-209715199, default 2048):  
Last sector, +sectors or +size{K,M,G,T,P} (2048-209715199, default 209715199): +10G //表示分区大小

Created a new partition 1 of type 'Linux' and of size 10 GiB.

Command (m for help): n
Partition type
   p   primary (1 primary, 0 extended, 3 free)
   e   extended (container for logical partitions)
Select (default p): p
Partition number (2-4, default 2): 
First sector (20973568-209715199, default 20973568): 
Last sector, +sectors or +size{K,M,G,T,P} (20973568-209715199, default 209715199): +60G

Created a new partition 2 of type 'Linux' and of size 60 GiB.

Command (m for help): p
Disk /dev/sdb: 100 GiB, 107374182400 bytes, 209715200 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: dos
Disk identifier: 0x2a38366a

Device     Boot    Start       End   Sectors Size Id Type
/dev/sdb1           2048  20973567  20971520  10G 83 Linux
/dev/sdb2       20973568 146802687 125829120  60G 83 Linux

Command (m for help): w   //注意需要将修改保存，不然就是白改的
The partition table has been altered.
Calling ioctl() to re-read partition table.
Syncing disks.

```





## parted

> 分为两种方式，交互式和非交互式，两种方式其实差不多。在parted操作是立即生效的，不需要进行保存，请谨慎操作！！！

```
[root@localhost ~]# parted /dev/sdb
GNU Parted 3.2
Using /dev/sdb
Welcome to GNU Parted! Type 'help' to view a list of commands.
(parted) help                                                             
  align-check TYPE N                        check partition N for TYPE(min|opt) alignment
  help [COMMAND]                           print general help, or help on COMMAND
  mklabel,mktable LABEL-TYPE               create a new disklabel (partition table)
  mkpart PART-TYPE [FS-TYPE] START END     make a partition
  name NUMBER NAME                         name partition NUMBER as NAME
  print [devices|free|list,all|NUMBER]     display the partition table, available devices, free space, all found partitions, or a particular partition
  quit                                     exit program
  rescue START END                         rescue a lost partition near START and END
  resizepart NUMBER END                    resize partition NUMBER
  rm NUMBER                                delete partition NUMBER
  select DEVICE                            choose the device to edit
  disk_set FLAG STATE                      change the FLAG on selected device
  disk_toggle [FLAG]                       toggle the state of FLAG on selected device
  set NUMBER FLAG STATE                    change the FLAG on partition NUMBER
  toggle [NUMBER [FLAG]]                   toggle the state of FLAG on partition NUMBER
  unit UNIT                                set the default unit to UNIT
  version                                  display the version number and copyright information of GNU Parted

```





### 需要使用的命令有几个：

```
mklabel   //用来进行生成分区表
mkpart   //用来制作分区
print    //打印相关信息
rm      //删除分区
select   //切换操作的磁盘
```



### 生成分区表

```
(parted) mklabel gpt
```



### 生成分区

> mkpart PART-TYPE [FS-TYPE] START END

> Warning: The resulting partition is not properly aligned for best performance: 34s % 2048s != 0s
>
> 注意，在生成分区时，START需要选择0%或者1M开始,不然会出现以上错误。例如：
>
> ```
> mkpart primary xfs 1M 10G
> or
> mkpart primary xfs 0% 10G
> ```





### 查看

```
print list //打印主机上所有设备的分区表
print free  //打印空余空间
print    //打印正在进行操作的磁盘的分区表
```





### 删除

```
rm <指定的分区编号>
```



### 实例

```c
[root@localhost ~]# parted /dev/sdb
GNU Parted 3.2
Using /dev/sdb
Welcome to GNU Parted! Type 'help' to view a list of commands.
(parted) mklabel gpt        //生成Gpt分区表 
(parted) mkpart primary xfs 1M 10G  //生成一个主分区，大小为10G，文件系统为xfs
(parted) mkpart primary ext4 10G 50G   //生成一个主分区，大小为40G，文件系统为ext4
(parted) print                                                            
Model: VMware Virtual disk (scsi)
Disk /dev/sdb: 107GB
Sector size (logical/physical): 512B/512B
Partition Table: gpt
Disk Flags: 

Number  Start   End     Size    File system  Name     Flags
 1      1049kB  10.0GB  9999MB  xfs          primary   //可以看到这两个分区
 2      10.0GB  50.0GB  40.0GB  ext4         primary

(parted) rm 1                  //这里的1是，上面的Number的序号                               
(parted) print                 //删除之后可以看到，第一个分区已经被删除
Model: VMware Virtual disk (scsi)
Disk /dev/sdb: 107GB
Sector size (logical/physical): 512B/512B
Partition Table: gpt
Disk Flags: 

Number  Start   End     Size    File system  Name     Flags
 2      10.0GB  50.0GB  40.0GB  ext4         primary

(parted) print free           //可以看到空闲的空间
Model: VMware Virtual disk (scsi)
Disk /dev/sdb: 107GB
Sector size (logical/physical): 512B/512B
Partition Table: gpt
Disk Flags: 

Number  Start   End     Size    File system  Name     Flags
        17.4kB  10.0GB  10.0GB  Free Space
 2      10.0GB  50.0GB  40.0GB  ext4         primary
        50.0GB  107GB   57.4GB  Free Space

```

> parted不需要使用partprobe通知操作系统







