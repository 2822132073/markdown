![img](D:\markdown\golang\Goland无法跳转代码.assets\clipboard.png)

无法进行函数查看,并且无代码提示,无法查看源码

但是可以运行

我们可以

![img](D:\markdown\golang\Goland无法跳转代码.assets\clipboard-16520188760171.png)

```shell
go mod vendor
```

出现`vendor`文件夹后,差不多就可以了

![img](D:\markdown\golang\Goland无法跳转代码.assets\clipboard-16520188760172.png)

![img](D:\markdown\golang\Goland无法跳转代码.assets\clipboard-16520188760183.png)

这样就可以了

![img](D:\markdown\golang\Goland无法跳转代码.assets\clipboard-16520188760184.png)

如果还是无法进行跳转,查看Goland的Settings里面的这个是否勾选,没有勾选,勾选这个就行

![image-20220508221015085](D:\markdown\golang\Goland无法跳转代码.assets\image-20220508221015085.png)