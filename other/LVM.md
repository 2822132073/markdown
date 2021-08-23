# LVM操作

[TOC]

## PV

### 前置条件

> 向虚拟机中加入三个磁盘

```shell
[root@localhost ~] #lsblk
NAME            MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
sda               8:0    0   20G  0 disk 
├─sda1            8:1    0  200M  0 part /boot
└─sda2            8:2    0 19.8G  0 part 
  ├─centos-root 253:0    0 17.8G  0 lvm  /
  └─centos-swap 253:1    0    2G  0 lvm  [SWAP]
sdb               8:16   0   20G  0 disk 
sdc               8:32   0   20G  0 disk 
sdd               8:48   0   20G  0 disk 
sr0              11:0    1  4.2G  0 rom  
```

> 将每个磁盘分两个区

```shell
[root@localhost ~] #fdisk /dev/sdb
欢迎使用 fdisk (util-linux 2.23.2)。

更改将停留在内存中，直到您决定将更改写入磁盘。
使用写入命令前请三思。

Device does not contain a recognized partition table
使用磁盘标识符 0x0c0e0cff 创建新的 DOS 磁盘标签。

命令(输入 m 获取帮助)：n
Partition type:
   p   primary (0 primary, 0 extended, 4 free)
   e   extended
Select (default p): p
分区号 (1-4，默认 1)：
起始 扇区 (2048-41943039，默认为 2048)：
将使用默认值 2048
Last 扇区, +扇区 or +size{K,M,G} (2048-41943039，默认为 41943039)：+10G
分区 1 已设置为 Linux 类型，大小设为 10 GiB

命令(输入 m 获取帮助)：n
Partition type:
   p   primary (1 primary, 0 extended, 3 free)
   e   extended
Select (default p): 
Using default response p
分区号 (2-4，默认 2)：
起始 扇区 (20973568-41943039，默认为 20973568)：
将使用默认值 20973568
Last 扇区, +扇区 or +size{K,M,G} (20973568-41943039，默认为 41943039)：
将使用默认值 41943039
分区 2 已设置为 Linux 类型，大小设为 10 GiB

命令(输入 m 获取帮助)：p

磁盘 /dev/sdb：21.5 GB, 21474836480 字节，41943040 个扇区
Units = 扇区 of 1 * 512 = 512 bytes
扇区大小(逻辑/物理)：512 字节 / 512 字节
I/O 大小(最小/最佳)：512 字节 / 512 字节
磁盘标签类型：dos
磁盘标识符：0x0c0e0cff

   设备 Boot      Start         End      Blocks   Id  System
/dev/sdb1            2048    20973567    10485760   83  Linux
/dev/sdb2        20973568    41943039    10484736   83  Linux

命令(输入 m 获取帮助)：w
The partition table has been altered!

Calling ioctl() to re-read partition table.
正在同步磁盘。
[root@localhost ~] #fdisk /dev/sdc
[root@localhost ~] #fdisk /dev/sdd
[root@localhost ~] #lsblk
NAME            MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
sda               8:0    0   20G  0 disk 
├─sda1            8:1    0  200M  0 part /boot
└─sda2            8:2    0 19.8G  0 part 
  ├─centos-root 253:0    0 17.8G  0 lvm  /
  └─centos-swap 253:1    0    2G  0 lvm  [SWAP]
sdb               8:16   0   20G  0 disk 
├─sdb1            8:17   0   10G  0 part 
└─sdb2            8:18   0   10G  0 part 
sdc               8:32   0   20G  0 disk 
├─sdc1            8:33   0   10G  0 part 
└─sdc2            8:34   0   10G  0 part 
sdd               8:48   0   20G  0 disk 
├─sdd1            8:49   0   10G  0 part 
└─sdd2            8:50   0   10G  0 part 
```



### 创建PV

```shell
[root@localhost ~] #pvcreate /dev/sd{b..d}{1..2}    //创建pv
  Physical volume "/dev/sdb1" successfully created.
  Physical volume "/dev/sdb2" successfully created.
  Physical volume "/dev/sdc1" successfully created.
  Physical volume "/dev/sdc2" successfully created.
  Physical volume "/dev/sdd1" successfully created.
  Physical volume "/dev/sdd2" successfully created. 
```

### 扫描PV

```shell
[root@localhost ~] #pvscan   //扫描pv,将磁盘中全部pv扫描出来
  PV /dev/sda2   VG centos          lvm2 [19.80 GiB / 0    free]
  PV /dev/sdd2                      lvm2 [<10.00 GiB]
  PV /dev/sdc2                      lvm2 [<10.00 GiB]
  PV /dev/sdc1                      lvm2 [10.00 GiB]
  PV /dev/sdd1                      lvm2 [10.00 GiB]
  PV /dev/sdb2                      lvm2 [<10.00 GiB]
  PV /dev/sdb1                      lvm2 [10.00 GiB]
  Total: 7 [<79.80 GiB] / in use: 1 [19.80 GiB] / in no VG: 6 [<60.00 GiB]
```

### 查看PV

```shell
[root@localhost ~] #pvs     //查看pv
  PV         VG     Fmt  Attr PSize   PFree  
  /dev/sda2  centos lvm2 a--   19.80g      0 
  /dev/sdb1         lvm2 ---   10.00g  10.00g
  /dev/sdb2         lvm2 ---  <10.00g <10.00g
  /dev/sdc1         lvm2 ---   10.00g  10.00g
  /dev/sdc2         lvm2 ---  <10.00g <10.00g
  /dev/sdd1         lvm2 ---   10.00g  10.00g
  /dev/sdd2         lvm2 ---  <10.00g <10.00g
```

### 查看PV详细信息

```shell
[root@localhost ~] #pvdisplay     //显示pv的详细信息
  --- Physical volume ---
  PV Name               /dev/sda2   #实际的 partition 分区名称
  VG Name               centos
  PV Size               19.80 GiB / not usable 3.00 MiB
  Allocatable           yes (but full)
  PE Size               4.00 MiB
  Total PE              5069
  Free PE               0
  Allocated PE          5069
  PV UUID               6qdKbB-EDGJ-Ny96-tkvL-F9yN-utZK-aTCgOj
   
  "/dev/sdd2" is a new physical volume of "<10.00 GiB"
  --- NEW Physical volume ---
  PV Name               /dev/sdd2  #实际的 partition 分区名称
  VG Name                           #因为尚未分配出去，所以空白！
  PV Size               <10.00 GiB  #就是容量说明
  Allocatable           NO         #是否已被分配，结果是 NO
  PE Size (KByte)       0          #在此 PV 內的 PE 大小
  Total PE              0          #共分割出几个 PE
  Free PE               0          #沒被 LV 用掉的 PE
  Allocated PE          0          #尚可分配出去的 PE 数量
  PV UUID               ZsvIhv-LoGl-C5bY-RlSD-EwrD-le6B-5y85CZ
.........
   
```

### 删除PV

```shell
[root@localhost ~] #pvremove /dev/sdb1    //移除一个pv
  Labels on physical volume "/dev/sdb1" successfully wiped.
```

## VG

### 将PV加入VG

```shell
[root@localhost ~] #vgcreate vg1 /dev/sd{b..c}{1..2}
  Physical volume "/dev/sdb1" successfully created.
  Volume group "vg1" successfully created
```

### 查看哪些PV加入了那个卷组

```shell
[root@localhost ~] #pvs             //我们可以通过pvs看到这些物理卷加入了vg01
  PV         VG     Fmt  Attr PSize   PFree  
  /dev/sda2  centos lvm2 a--   19.80g      0 
  /dev/sdb1  vg1    lvm2 a--  <10.00g <10.00g
  /dev/sdb2  vg1    lvm2 a--  <10.00g <10.00g
  /dev/sdc1  vg1    lvm2 a--  <10.00g <10.00g
  /dev/sdc2  vg1    lvm2 a--  <10.00g <10.00g
  /dev/sdd1         lvm2 ---   10.00g  10.00g
  /dev/sdd2         lvm2 ---  <10.00g <10.00g
```

### 指定PE的大小

```shell
[root@localhost ~] #vgcreate -s 16M vg2 /dev/sdd{1..2}    //创建一个PE为16M的卷组vg2
  Volume group "vg2" successfully created
```

### 查看具体VG具体信息

```shell
[root@localhost ~] #vgdisplay vg2
  --- Volume group ---
  VG Name               vg2   VG名称
  System ID                       
  Format                lvm2
  Metadata Areas        2
  Metadata Sequence No  1
  VG Access             read/write
  VG Status             resizable
  MAX LV                0
  Cur LV                0      当前逻辑卷 0
  Open LV               0     打开的逻辑卷数量
  Max PV                0     
  Cur PV                2
  Act PV                2
  VG Size               <19.97 GiB
  PE Size               16.00 MiB
  Total PE              1278
  Alloc PE / Size       0 / 0   
  Free  PE / Size       1278 / <19.97 GiB
  VG UUID               I2m01v-VFpf-EK2D-reKO-XSQJ-jlh5-pGV58C
```

### 扫描磁盘中所有VG

```shell
[root@localhost ~] #vgscan
  Reading volume groups from cache.
  Found volume group "vg2" using metadata type lvm2
  Found volume group "vg1" using metadata type lvm2
  Found volume group "centos" using metadata type lvm2
```

### 将PV移除VG

```shell
[root@localhost ~] #vgreduce  vg1 /dev/sdc{1..2}    //将 sdc1,sdc2 从 vg1 中移除 
  Removed "/dev/sdc1" from volume group "vg1"
  Removed "/dev/sdc2" from volume group "vg1"
[root@localhost ~] #pvs
  PV         VG     Fmt  Attr PSize   PFree  
  /dev/sda2  centos lvm2 a--   19.80g      0 
  /dev/sdb1  vg1    lvm2 a--  <10.00g <10.00g
  /dev/sdb2  vg1    lvm2 a--  <10.00g <10.00g
  /dev/sdc1         lvm2 ---   10.00g  10.00g
  /dev/sdc2         lvm2 ---  <10.00g <10.00g
  /dev/sdd1  vg2    lvm2 a--    9.98g   9.98g
  /dev/sdd2  vg2    lvm2 a--    9.98g   9.98g
```

### 将PV加入VG

```shell
[root@localhost ~] #vgextend vg2 /dev/sdc2    //将sdc1加入vg2
  Volume group "vg2" successfully extended
[root@localhost ~] #pvs
  PV         VG     Fmt  Attr PSize   PFree  
  /dev/sda2  centos lvm2 a--   19.80g      0 
  /dev/sdb1  vg1    lvm2 a--  <10.00g <10.00g
  /dev/sdb2  vg1    lvm2 a--  <10.00g <10.00g
  /dev/sdc1         lvm2 ---   10.00g  10.00g
  /dev/sdc2  vg2    lvm2 a--    9.98g   9.98g
  /dev/sdd1  vg2    lvm2 a--    9.98g   9.98g
  /dev/sdd2  vg2    lvm2 a--    9.98g   9.98g
```

### 删除vg(vgremove)

```shell
[root@localhost ~] #vgremove vg1   //删除vg1
  Volume group "vg1" successfully removed
[root@localhost ~] #pvs
  PV         VG     Fmt  Attr PSize   PFree  
  /dev/sda2  centos lvm2 a--   19.80g      0 
  /dev/sdb1         lvm2 ---   10.00g  10.00g
  /dev/sdb2         lvm2 ---  <10.00g <10.00g
  /dev/sdc1         lvm2 ---   10.00g  10.00g
  /dev/sdc2  vg2    lvm2 a--    9.98g   9.98g
  /dev/sdd1  vg2    lvm2 a--    9.98g   9.98g
  /dev/sdd2  vg2    lvm2 a--    9.98g   9.98g
```



## LV

### 创建LV

#### 指定容量

>  由于前面的PE设置为16M,这里的大小也必须为16M的倍数

```shell
[root@localhost ~] #lvcreate -L 200M -n lv01 vg2    //创建一个名lv01的逻辑卷,大小为200M,从vg2中分空间
  Rounding up size to full physical extent 208.00 MiB   
  Logical volume "lv01" created.
```

#### 指定PE个数

>  创建一个逻辑分区为lv02,大小为100个PE大小,从VG2中分空间  

```shell
[root@localhost ~] #lvcreate -l 100 -n lv02 vg2  
```

#### 指定VG的百分比大小

> 创建一个逻辑分区为lv03,大小为30%的VG大小(这里的的VG就是VG2),分VG2的空间  Logical volume "vg03" created.

```shell
[root@localhost ~] #lvcreate -l 20%VG -n vg03 vg2    
```

### 查看LV具体信息

```shell
[root@localhost ~] #lvdisplay /dev/vg2/lv01
 --- Logical volume ---
  LV Path                /dev/vg2/lv01
  LV Name                lv01
  VG Name                vg2
  LV UUID                Rbduny-ikWr-oS6g-1HIe-gpov-yigV-Cuc4rb
  LV Write Access        read/write
  LV Creation host, time localhost.localdomain, 2020-10-14 19:56:26 +0800
  LV Status              available
  # open                 0
  LV Size                208.00 MiB
  Current LE             13
  Segments               1
  Allocation             inherit
  Read ahead sectors     auto
  - currently set to     8192
  Block device           253:2
```

### 扫描磁盘中的LV

```shell
[root@localhost ~] #lvscan
  ACTIVE            '/dev/vg2/lv01' [208.00 MiB] inherit
  ACTIVE            '/dev/vg2/lv02' [1.56 GiB] inherit
  ACTIVE            '/dev/vg2/vg03' [5.98 GiB] inherit
  ACTIVE            '/dev/centos/swap' [2.00 GiB] inherit
  ACTIVE            '/dev/centos/root' [17.80 GiB] inherit
```

### 删除LVM

>  //直接删除,如果不加 -y 会出现提示

```shell
[root@localhost ~] #lvremove /dev/vg2/vg03 -y  
  Logical volume "vg03" successfully removed
```

### 扩容LV

```shell
[root@localhost ~] #lvextend -L +208M /dev/vg2/lv01
  Size of logical volume vg2/lv01 changed from 208.00 MiB (13 extents) to 416.00 MiB (26 extents).
  Logical volume vg2/lv01 successfully resized.
```

>  可以看出容量大了208M   

```shell
[root@localhost ~] #lvs
  LV   VG     Attr       LSize   Pool Origin Data%  Meta%  Move Log Cpy%Sync Convert
  root centos -wi-ao----  17.80g                                                    
  swap centos -wi-ao----   2.00g                                                    
  lv01 vg2    -wi-a----- 416.00m              
  lv02 vg2    -wi-a-----   1.56g 
```

### 在有文件系统的情况下继续扩容

#### 创建ext4文件系统

```shell
[root@localhost ~] #mkfs.ext4 /dev/vg2/lv01
[root@localhost ~] #mount /dev/vg2/lv01 /mnt/lv01/
```

#### 扩容文件系统

```shell
[root@localhost /mnt/lv01] #lvextend -L +208M /dev/vg2/lv01
  Size of logical volume vg2/lv01 changed from 416.00 MiB (26 extents) to 624.00 MiB (39 extents).
  Logical volume vg2/lv01 successfully resized.
```

> 查看是否扩容

```shell
[root@localhost /mnt/lv01] #lvs       
  LV   VG     Attr       LSize   Pool Origin Data%  Meta%  Move Log Cpy%Sync Convert
..............                                                  
  lv01 vg2    -wi-ao---- 624.00m      //我们可以看出来的确扩容了  
```

> 但是文件系统并没有改变

```shell
[root@manager /mnt]# df -h
Filesystem               Size  Used Avail Use% Mounted on
.....
/dev/mapper/vg2-lv01     190M  1.6M  175M   1% /mnt/lv01
```

> 这样扩容只是将LV扩容,文件系统的一些元数据并没有改变,ext4文件系统扩容使用"resize2fs [逻辑卷名称]"，xfs文件系统扩容使用"xfs_growfs 挂载点"

```shell
[root@localhost /mnt/lv01] #df -h /mnt/lv01/
文件系统              容量  已用  可用 已用% 挂载点
/dev/mapper/vg2-lv01  597M  2.3M  561M    1% /mnt/lv01
```

#### 创建xfs文件系统

```shell
[root@localhost /mnt/lv01] #mkfs.xfs /dev/vg2/lv02
[root@localhost /mnt/lv01] #mount /dev/vg2/lv02 /mnt/lv02/
[root@localhost /mnt/lv01] #df -h /mnt/lv02
文件系统              容量  已用  可用 已用% 挂载点
/dev/mapper/vg2-lv02  1.6G   33M  1.6G    3% /mnt/lv02
```

#### 扩容XFS文件系统

```shell
[root@localhost /mnt/lv01] #lvextend -L +208M /dev/vg2/lv02
  Size of logical volume vg2/lv02 changed from 1.56 GiB (100 extents) to <1.77 GiB (113 extents).
  Logical volume vg2/lv02 successfully resized.
[root@localhost /mnt/lv01] #df -h /mnt/lv02
文件系统              容量  已用  可用 已用% 挂载点
/dev/mapper/vg2-lv02  1.6G   33M  1.6G    3% /mnt/lv02
```

#### 使用xfs_growfs

```shell
[root@localhost /mnt/lv01] #xfs_growfs /mnt/lv02
meta-data=/dev/mapper/vg2-lv02   isize=512    agcount=4, agsize=102400 blks
         =                       sectsz=512   attr=2, projid32bit=1
         =                       crc=1        finobt=0 spinodes=0
data     =                       bsize=4096   blocks=409600, imaxpct=25
         =                       sunit=0      swidth=0 blks
naming   =version 2              bsize=4096   ascii-ci=0 ftype=1
log      =internal               bsize=4096   blocks=2560, version=2
         =                       sectsz=512   sunit=0 blks, lazy-count=1
realtime =none                   extsz=4096   blocks=0, rtextents=0
data blocks changed from 409600 to 462848
[root@localhost /mnt/lv01] #df -h /mnt/lv02
文件系统              容量  已用  可用 已用% 挂载点
/dev/mapper/vg2-lv02  1.8G   33M  1.8G    2% /mnt/lv02
```

#### 使用`-r`选项扩容

```shell
[root@localhost /mnt/lv01] #lvextend -L +208M -r /dev/vg2/lv02
  Size of logical volume vg2/lv02 changed from <1.77 GiB (113 extents) to <1.97 GiB (126 extents).
  Logical volume vg2/lv02 successfully resized.
meta-data=/dev/mapper/vg2-lv02   isize=512    agcount=5, agsize=102400 blks
         =                       sectsz=512   attr=2, projid32bit=1
         =                       crc=1        finobt=0 spinodes=0
data     =                       bsize=4096   blocks=462848, imaxpct=25
         =                       sunit=0      swidth=0 blks
naming   =version 2              bsize=4096   ascii-ci=0 ftype=1
log      =internal               bsize=4096   blocks=2560, version=2
         =                       sectsz=512   sunit=0 blks, lazy-count=1
realtime =none                   extsz=4096   blocks=0, rtextents=0
data blocks changed from 462848 to 516096
[root@localhost /mnt/lv01] #df -h /mnt/lv02
文件系统              容量  已用  可用 已用% 挂载点
/dev/mapper/vg2-lv02  2.0G   33M  2.0G    2% /mnt/lv02
```



### 文件系统缩容

#### 卸载LV

```shell
[root@localhost /mnt] #umount /mnt/lv01
```

#### 缩减

```shell
[root@localhost /mnt] #lvreduce -L -208M -r /dev/vg2/lv01
fsck，来自 util-linux 2.23.2
/dev/mapper/vg2-lv01: 12/212992 files (0.0% non-contiguous), 37649/851968 blocks
resize2fs 1.42.9 (28-Dec-2013)
Resizing the filesystem on /dev/mapper/vg2-lv01 to 638976 (1k) blocks.
The filesystem on /dev/mapper/vg2-lv01 is now 638976 blocks long.

  Size of logical volume vg2/lv01 changed from 832.00 MiB (52 extents) to 624.00 MiB (39 extents).
  Logical volume vg2/lv01 successfully resized.


```

#### 重新挂载

```shell
[root@localhost /mnt] #mount /dev/vg2/lv01 /mnt/lv01 
[root@localhost /mnt] #df -h /mnt/lv01
文件系统              容量  已用  可用 已用% 挂载点
/dev/mapper/vg2-lv01  597M  2.3M  562M    1% /mnt/lv01
```

> 如果我们不使用 -r 选项,在扩展完分区后,我们需要使用resize2fs去扩展文件系统 //而且我们需要先缩小文件系统,再去缩小分区大小

# XFS文件系统无法缩容