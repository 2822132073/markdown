# Rancher安装报错处理

[TOC]

## open /proc/sys/net/netfilter/nf_conntrack_max: permission denied

> 在我安装`rancher2.5.9`时在执行docker命令后十几秒后,容器停止,查看日志后发现报以下错误:
>
> ```
> Set sysctl 'net/netfilter/nf_conntrack_max' to 131072
> open /proc/sys/net/netfilter/nf_conntrack_max: permission denied
> k3s exited with: exit status 1
> 
> ```
>
> 提示没有权限,但是我添加了`--privileged `,权限没有问题,上Github上搜索,是一个Bug,解决的办法是:将`/proc/sys/net/netfilter/nf_conntrack_max`改成它上面那个出现的值,也就是`131072`,这样就可以了

