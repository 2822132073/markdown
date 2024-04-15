# cephadm安装ceph（reef）

https://blog.csdn.net/zjz5740/article/details/115652219

https://blog.csdn.net/networken/article/details/106870859

[安装](https://docs.ceph.com/en/pacific/cephadm/install/)

[osd部署](https://docs.ceph.com/en/pacific/cephadm/services/osd/#cephadm-deploy-osds)

[添加主机到集群](https://docs.ceph.com/en/pacific/cephadm/host-management/#cephadm-adding-hosts)

| 主机ip地址 | 主机名 | 角色 |
| ---------- | ------ | ---- |
| 10.0.0.80  | ceph-0 |      |
| 10.0.0.81  | ceph-1 |      |
| 10.0.0.82  | ceph-2 |      |
| 10.0.0.83  | ceph-3 |      |



## 系统初始化

### 关闭防火墙和selinux

```shell
setenforce 0
sed -i s#SELINUX=enforcing#SELINUX=disabled#g /etc/selinux/config
systemctl stop firewalld 
systemctl disable firewalld
```



## 安装cephadm

### 下载cephadm

> 一定要注意下载的版本，以免后面出错

```shell
CEPH_RELEASE=16.2.10 # replace this with the active release
curl --silent --remote-name --location https://download.ceph.com/rpm-${CEPH_RELEASE}/el8/noarch/cephadm
chmod +x cephadm 
```

### 更新cephadm

> 如果出现`-bash: ./cephadm: /usr/libexec/platform-python: bad interpreter: No such file or directory`错误，请在前面使用python，需要版本在3.6以上
>
> ```shell
> python3.6 ./cephadm add-repo --release Pacific
> ```

```shell
./cephadm add-repo --release Pacific
./cephadm install
which cephadm
```



## 引导一个新集群

### 引导集群中的第一个机器

> 这个需要指定的ip是cephadm机器的ip

```shell
cephadm bootstrap --mon-ip 10.0.0.80 #安装15版本完成会出现一个dashboard创建用户失败的错误，不用管
```

### 安装相关工具包，查看集群状态

```shell
cephadm add-repo --release pacific #前面执行过就不需要执行了，如果执行了记得修改apt源地址
cephadm install ceph-common
ceph status #查看是否可以输出正确的结果
```

### 向集群中添加机器

> 每台机器都需要做，cepeadm会自动的对集群的mon进行管理，不需要我们自己去指定

```shell
ssh-copy-id -f -i /etc/ceph/ceph.pub root@ceph-1
ceph orch host add ceph-1 10.0.0.81
```



## 部署osd

### 查看集群主机中的设备

> 会列出所有的设备，并且标出是否可用，如果不可用，会给出原因

```shell
[root@ceph-0 /etc/ceph]# ceph orch device ls
HOST    PATH      TYPE  DEVICE ID                                             SIZE  AVAILABLE  REFRESHED  REJECT REASONS                                                           
ceph-0  /dev/sdb  hdd                                                        20.0G             30m ago    Has a FileSystem, Insufficient space (<10 extents) on vgs, LVM detected  
ceph-0  /dev/sdc  hdd                                                        20.0G             30m ago    Has a FileSystem, Insufficient space (<10 extents) on vgs, LVM detected  
ceph-0  /dev/sdd  hdd                                                        20.0G             30m ago    Has a FileSystem, Insufficient space (<10 extents) on vgs, LVM detected  
ceph-0  /dev/sde  hdd                                                        20.0G             30m ago    Has a FileSystem, Insufficient space (<10 extents) on vgs, LVM detected  
ceph-0  /dev/sr0  hdd   VMware_Virtual_SATA_CDRW_Drive_01000000000000000001  1023M             30m ago    Failed to determine if device is BlueStore, Insufficient space (<5GB)    
ceph-1  /dev/sdb  hdd                                                        20.0G             9m ago     Has a FileSystem, Insufficient space (<10 extents) on vgs, LVM detected  
ceph-1  /dev/sdc  hdd                                                        20.0G             9m ago     Has a FileSystem, Insufficient space (<10 extents) on vgs, LVM detected  
ceph-1  /dev/sdd  hdd                                                        20.0G             9m ago     Has a FileSystem, Insufficient space (<10 extents) on vgs, LVM detected  
ceph-1  /dev/sde  hdd                                                        20.0G             9m ago     Has a FileSystem, Insufficient space (<10 extents) on vgs, LVM detected  

```

> ```shell
> # 删除所有和ceph相关的vg和pv
> vgremove -f `vgs |grep ceph |awk '{print $1}'`
> pvremove `pvs --noheadings -o pv_name,vg_name --separator '|' | awk -F '|' '$2 == "" {print $1}'`
> # 或者使用
> ceph orch device zap ceph-1 /dev/sdb
> ```

### 部署osd

```shell
ceph orch apply osd --all-available-devices # 在所有主机上，部署所有可以使用的硬盘为osd
ceph orch daemon add osd host1:/dev/sdb #指定某个主机上的某个设备为osd
```



## 删除集群

