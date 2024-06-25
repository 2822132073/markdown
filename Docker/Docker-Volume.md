# Docker Volume

[TOC]



## 种类

### Volumes

### `Docker管理宿主机文件系统的一部分，默认位于 /var/lib/docker/volumes 目录中；（最常用的方式）`

> 在我们没有指定volumes时,docker会创建很多匿名卷
### BindMounts

### `意为着可以存储在宿主机系统的任意位置；（比较常用的方式）`

> 但是，bind mount在不同的宿主机系统时不可移植的，比如Windows和Linux的目录结构是不一样的，bind mount所指向的host目录也不能一样。这也是为什么bind mount不能出现在Dockerfile中的原因，因为这样Dockerfile就不可移植了。

### Tmpfs

### `挂载存储在宿主机系统的内存中，而不会写入宿主机的文件系统；（一般都不会用的方式）`

### 三种模式示意图

![img](https://cdn.jsdelivr.net/gh/2822132073/image/202406251904714.webp)

## 演示

### 当创建Container时不指定Volume名称

####  创建一个Container,并且在其中创建一个文件

>```shell
>[root@docker ~]# docker run --rm  --name test_volume -ti -v /data busybox
>/ # cd /data/
>/data # touch fengsiling  创建一个文件
>```

 ####  查看Volume

> 出现了一个匿名的Volume
>
> ```shell
> [root@docker ~]# docker volume ls
> DRIVER              VOLUME NAME
> local               0076af0dc98a08dfffc89909cfec1d62cae921560373bb91c6b5cccfdc77d829
> ```
>
> 我们通过find寻找一下这个文件
>
> ```shell
> [root@docker ~]# find / -name fengsiling
> /var/lib/docker/volumes/0076af0dc98a08dfffc89909cfec1d62cae921560373bb91c6b5cccfdc77d829/_data/fengsiling
> ```
>
> > 可以发现,这个文件在`/var/lib/docker/volumes/0076af0dc98a08dfffc89909cfec1d62cae921560373bb91c6b5cccfdc77d829/_data`下,可以对应之前说的
>
> 我们也可以通过`docker inspect`
>
> ```shell
> [root@docker ~]# docker inspect  test_volume
> .....
>         "Mounts": [
>             {
>                 "Type": "volume",
>                 "Name": "0076af0dc98a08dfffc89909cfec1d62cae921560373bb91c6b5cccfdc77d829",
>                 "Source": "/var/lib/docker/volumes/0076af0dc98a08dfffc89909cfec1d62cae921560373bb91c6b5cccfdc77d829/_data",
>                 "Destination": "/data",
>                 "Driver": "local",
>                 "Mode": "",
>                 "RW": true,
>                 "Propagation": ""
>             }
> ...
> ```
>
> 也可以通过指定格式查看
>
> ```shell
> [root@docker ~]# docker inspect -f {{.Mounts}} gracious_haibt
> [{volume 0076af0dc98a08dfffc89909cfec1d62cae921560373bb91c6b5cccfdc77d829 /var/lib/docker/volumes/0076af0dc98a08dfffc89909cfec1d62cae921560373bb91c6b5cccfdc77d829/_data /data local  true }]
> ```
>
> 



### 创建Container时指定Volumes

#### 创建一个Container

```shell
 [root@docker ~]# docker run --rm  --name test_volume -ti -v test-volume:/data busybox
```

#### 查看Volumes

```shell
[root@docker ~]# docker volume ls
DRIVER              VOLUME NAME
local               test-volume
```

*其它的和匿名volume都一样*

### Volume的共用

*有时候希望同一个卷的内容被两个容器公用,特别是在哪些无状态的应用,这样就可以很好地横向扩展*

#### 创建一个卷,并向其中写入数据

```shel
[root@docker ~]# docker volume create nginx-test
nginx-test
[root@docker ~]# echo "test-data" >/var/lib/docker/volumes/nginx-test/_data/index.html 
```

#### 创建一个容器,将这个卷挂入其中

```shell
docker run --rm -d --name test_nginx-1 -v nginx-test:/usr/share/nginx/html/ nginx 
```

#### 查询IP地址

```shell
docker inspect -f {{.NetworkSettings.Networks.bridge.IPAddress}} test_nginx-1
```

#### 进行访问

```shell
[root@docker ~]# curl 192.168.99.2
test-data
```

#### 再创建一个Container,还是使用这个卷

```shel
docker run --rm -d --name test_nginx-2 -v nginx-test:/usr/share/nginx/html/ nginx 
```

#### 进行访问

```shell
[root@docker ~]# curl 192.168.99.3
test-data
```

> 两次访问的结果一样,可以利用这种特性,可以做很多事情,可以批量制造很多相同的容器,可以快速的进行横向扩展

### Volume的同步性

*基于上面的实验,做以下实验*

#### 修改Volume中的数据

```shell
[root@docker ~]# echo "test-data-version2" >/var/lib/docker/volumes/nginx-test/_data/index.html 
```

#### 查看两个容器是否同时修改

```shell
[root@docker ~]# curl 192.168.99.3
test-data-version2
[root@docker ~]# curl 192.168.99.2
test-data-version2
```

