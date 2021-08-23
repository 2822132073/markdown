![这里写图片描述](D:\markdown\Docker\Dockerd,coniainerd关系.assets\aHR0cDovL2ltZy5ibG9nLmNzZG4ubmV0LzIwMTgwMTA4MTIxNDUyMzc0)

> `docker`和`dockerd`不是相同的程序
>
> - `docker`是一个客户端的工具,用来调用`dockerd`
> - `Dockerd`是一个服务端程序,默认是通过`socket`通信的,也可以设置为通过`TCP`通信,`Dockerd`相当与存在于用户与`containerd`之间的中间键,最终还是调用的`containerd`
>
> `dockerd`也不是最终运行容器的进程,它会调用`containerd`,然后`containerd`产生一个`docker-shim`进程,`docker-shim`再会器调用`Runc`来运行容器

