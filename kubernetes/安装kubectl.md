# 安装kubectl

## 下载kubectl

```
http://mirror.cnrancher.com/
```

> 找到对应的版本,下载对应的命令
>
> 记住要添加执行权限



## 创建对应的配置文件目录

```
mkdir -p $HOME/.kube
vim $HOME/.kube/config ##这步将对应的配置写入其中
chown $(id -u):$(id -g) $HOME/.kube/config #修改权限
kubectl version #查看版本
kubectl get pod -A    #查看是否成功
```



