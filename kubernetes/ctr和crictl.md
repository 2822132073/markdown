

[博客](https://icloudnative.io/posts/getting-started-with-containerd/#3-containerd-%E5%AE%89%E8%A3%85)



# 说明

ctr是containerd自带的CLI命令行工具，crictl是k8s中CRI（容器运行时接口）的客户端，k8s使用该客户端和containerd进行交互；

# 使用

## ctr



### namespace

> containerd是有名称空间的概念的,默认ctr是在default名称空间下进行操作的,而docker使用的是`moby`名称空间,kubernets使用的是`k8s.io`,在对kubernetes操作时,需要注意名称空间的概念



> ctr只是一个用于调试用的命令行工具,操作比较不友好,想要友好的操作的话,可以使用`nerdctl`,这是一个和docker兼容得到命令行工具,支持docker compose,和许多功能
>
> [github地址](https://github.com/containerd/nerdctl)

> 下面操作,都会类比docker操作

> ctr与docker不同,他将操作进行细分,containerd更加底层,所有这里只写一些会常用的操作,例如,镜像的相关操作
>
> `image`:子命令操作镜像相关
>
> `task`:用于操作容器相关

| 说明               | docker         | ctr          |
| ------------------ | -------------- | ------------ |
| 查看镜像           | docker images  | ctr i ls     |
| 拉取镜像           | docker pull    | ctr i pull   |
| 推送容器           | docker push    | ctr i push   |
| 重新打标签         | docker tag     | ctr i tag    |
| 删除镜像           | docker rmi     | ctr i rm     |
| 导入镜像           | docker import  | ctr i import |
| 导出镜像           | docker export  | ctr i export |
| 创建容器           | docker create  | ctr c create |
| 删除容器           | docker rm      |      ctr c rm      |
| 运行一个容器 | docker start | ctr t start |
| 停止正在运行的容器 | docker stop    | ctr t pause |
| 运行容器           | docker run     | ctr  t resume |
| 查看容器           | docker ps      | ctr t ls |
| 查看容器具体信息   | docker inspect | ctr c  info |
| 在容器中运行命令   | docker exec    | ctr t exec |

> **i**: image的缩写
>
> **t**: task的缩写
>
> **c**:container的缩写



### ctr image pull

> 与docker不同的是,ctr需要把路径写全

```shell
ctr i pull docker.io/library/nginx:alpine
```

### ctr i ls

```shell
root@manager:~# ctr i ls
REF                            TYPE                                                      DIGEST                                                                  SIZE     PLATFORMS                                                                                LABELS 
docker.io/library/nginx:alpine application/vnd.docker.distribution.manifest.list.v2+json sha256:dd8a054d7ef030e94a6449783605d6c306c1f69c10c2fa06b66a030e0d1db793 15.9 MiB linux/386,linux/amd64,linux/arm/v6,linux/arm/v7,linux/arm64/v8,linux/ppc64le,linux/s390x - 



root@manager:~# ctr i ls -q
docker.io/library/nginx:alpine
```

### ctr i push

```
ctr images push  <remote> [<local>]
```

### ctr i tag

```shell
ctr images tag <source_ref> <target_ref>
```

### ctr i rm

```
ctr i rm docker.io/library/nginx:alpine
```

### ctr i import

> `<in>`为tar包

```shell
 ctr images import <in>
```

### ctr c create

> 前面是镜像名,后面是容器名,容器必须通过task start启动

```
ctr c create docker.io/library/nginx:alpine nginx
```

### ctr c rm

> 删除容器之前,需要将这个容器在task中删除,不然无法删除

```
ctr c rm nginx
```

### ctr t start

> 启动一个容器,默认是前台启动,需要加上-d选项,让其变为daemon启动

```
ctr t start -d nginx
```

### ctr t pause

```shell
root@manager:~# ctr t pause nginx
root@manager:~# ctr t ls
TASK     PID     STATUS    
nginx    2318    PAUSED
```

### ctr  t resume 

```shell
root@manager:~# ctr t resume nginx
root@manager:~# ctr t ls
TASK     PID     STATUS    
nginx    2318    RUNNING
```

### ctr c  info

> 可以查看一些关于容器的信息

```shell
root@manager:~# ctr c info nginx
{
    "ID": "nginx",
    "Labels": {
        "io.containerd.image.config.stop-signal": "SIGQUIT",

........
```

### ctr t exec

> 进入task执行命令,需要执行exec-id,这个id必须唯一

```shell
ctr t exec --exec-id 2 nginx sh
```

### ctr t kill

> 杀死一个task,这是在删除task之前需要做的步骤

```shell
root@manager:~# ctr t kill nginx
root@manager:~# ctr t ls
TASK     PID     STATUS    
nginx    3318    STOPPED
```

### ctr t rm

```shell
root@manager:~# ctr t rm nginx
root@manager:~# ctr t ls
TASK    PID    STATUS 
```

### ctr t metrics

使用 `task metrics` 命令用来获取容器的内存、CPU 和 PID 的限额与使用量。

```shell
[root@containerd ~]#ctr t metrics nginx
ID       TIMESTAMP
nginx    2021-10-24 05:54:38.74392351 +0000 UTC

METRIC                   VALUE
memory.usage_in_bytes    1986560
memory.limit_in_bytes    9223372036854771712
memory.stat.cache        16384
cpuacct.usage            63033641
cpuacct.usage_percpu     [17342796 45690845]
pids.current             3
pids.limit               0
[root@containerd ~]#
```

### ctr t ps

```shell
[root@containerd ~]#ctr t ls
TASK     PID      STATUS
nginx    24841    RUNNING
[root@containerd ~]#ctr t ps nginx
PID      INFO
24841    -
24873    -
24874    -
[root@containerd ~]#ps -ef|grep nginx
root      24822      1  0 13:54 ?        00:00:00 /usr/local/bin/containerd-shim-runc-v2 -namespace default -id nginx -address /run/containerd/containerd.sock
root      24841  24822  0 13:54 ?        00:00:00 nginx: master process nginx -g daemon off;
101       24873  24841  0 13:54 ?        00:00:00 nginx: worker process
101       24874  24841  0 13:54 ?        00:00:00 nginx: worker process
root      24917  24303  0 13:56 pts/0    00:00:00 grep --color=auto nginx
[root@containerd ~]#
```

### 查看命名空间

另外 Containerd 中也支持命名空间的概念，比如查看命名空间：

```
[root@containerd ~]#ctr ns ls
NAME    LABELS
default
[root@containerd ~]#
```

### 创建命名空间

如果不指定，ctr 默认使用的是 `default` 空间。同样也可以使用 `ns create` 命令创建一个命名空间：

```
[root@containerd ~]#ctr ns create test
[root@containerd ~]#ctr ns ls
NAME    LABELS
default
test
[root@containerd ~]#
```

### 删除命名空间

使用 `remove` 或者 `rm` 可以删除 namespace：

```
[root@containerd ~]#ctr ns ls
NAME    LABELS
default
test
[root@containerd ~]#ctr ns rm test #删除命名空间
test
[root@containerd ~]#ctr ns ls
NAME    LABELS
default
[root@containerd ~]#
```

### 将镜像挂载到本机目录

> 挂载后,只可以读取

```shell
root@manager:~# ctr i mount docker.io/library/nginx:alpine /mnt
sha256:376baf7ada4b52ef4c110a023fe7185c4c2c090fa24a5cbd746066333ce3bc46
/mnt
root@manager:~# cd /mnt/
root@manager:/mnt# ls
bin  dev  docker-entrypoint.d  docker-entrypoint.sh  etc  home  lib  media  mnt  opt  proc  root  run  sbin  srv  sys  tmp  usr  var
```



### 指定命名空间选项

有了命名空间后就可以在操作资源的时候指定 namespace，比如查看 test 命名空间的镜像，可以在操作命令后面加上 `-n test` 选项：

## crictl

> 上面说了,containerd有名称空间的概念,而crictl的名称空间就是k8s.io





# nerdctl

## 下载

[github](https://github.com/containerd/nerdctl/releases)
