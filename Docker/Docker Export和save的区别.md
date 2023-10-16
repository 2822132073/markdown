# Docker 镜像和容器的区别

## 容器与镜像的区别

> `docker`的镜像是一层一层的, 我们在寻找一个文件时,是一层一层的去寻找的,如果在顶层没有时,才去下一层去寻找,知道找到为止,而在镜像这些层都是`只读`
>
> `docker`的容器与镜像的区别就是在容器上加了一层`可读写`的层,我们在读写层上写文件,`读写层`在最顶层

> 也就是说`容器` = `镜像` + `可读写层` 
>
> 所以说,不管`容器`是否运行,`容器`都是容器

## Create

>`容器` = `镜像` + `可读写层` 
>
>在`docker`中有一个命令:`create`
>
>`docker create`命令允许我们创建一个`可写层`在镜像的只读层的顶部,然后通过`docker start`启动它,在`docker start`启动之前,`容器`并没有独立的名称空间,只有自己的`读写层`,在启动后,`docker`会创建独立的名称空间,并且将`容器`放进去.
>
>> ```shell
>> [root@node01 ~]# docker create -ti busybox sh
>> 533e04b09b6f956bbe3526f35fc77b0d9e6bb92d9f3e6705d5a08c677acfe40c
>> [root@node01 ~]# ls /run/docker/netns/
>> 1-vg6yiuz1vw  ingress_sbox
>> [root@node01 ~]# docker ps -a
>> CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS              PORTS               NAMES
>> 533e04b09b6f        busybox             "sh"                9 seconds ago       Created                                 kind_banzai
>> [root@node01 ~]# docker start kind_banzai
>> kind_banzai
>> [root@node01 ~]# docker ps -a
>> CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS              PORTS               NAMES
>> 533e04b09b6f        busybox             "sh"                30 seconds ago      Up 4 seconds                            kind_banzai
>> [root@node01 ~]# ls /run/docker/netns/
>> 1-vg6yiuz1vw  3a960bf7f4af  ingress_sbox
>
>> *可以看出名称空间在变化启动前和启动后,有添加*



## export与save的区别

> 在使用的时候
>
> - `export`是导出容器的,使用`import`导入镜像
> - `save`是导出镜像的,使用`load`导入镜像
>
> 在`import`的`help`中写的是
>
> > `Import the contents from a tarball to create a filesystem image`
> >
> > 从`tar`中导入内容创建镜像
>
> 而`load`的`help`中写的是
>
> > `Load an image from a tar archive or STDIN`
> >
> > 加载一个镜像从`tar`包中
>
> `export`是将`容器`的能看到的文件内容导出,将这些文件写到一层中,在``history`命令中可以无法看到之前的构建记录
>
> `save`是将`镜像`导出,包含每一层的元数据,``history`命令中可以可以看到之前的构建记录

## 演示

> **Manager**
>
> ```shell
> [root@manager ~]# docker run --name test_export busybox touch /1.txt
> [root@manager ~]# docker export test_export -o test_export.tar
> [root@manager ~]# scp test_export.tar 10.0.0.92:/tmp
> ```
>
> **Node**
>
> ```shell
> [root@node01 /tmp]# docker import /tmp/test_export.tar 
> sha256:4d5af6567f056d8c889052f938f8d5feb73f31dd007cf074aa1476ab1e8e6510
> [root@node01 /tmp]# docker history test:test 
> IMAGE               CREATED             CREATED BY          SIZE                COMMENT
> 4d5af6567f05        2 minutes ago                           1.24MB              Imported from -
> ```
>
> 