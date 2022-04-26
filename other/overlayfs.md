# overlayfs实验



[TOC]

## overlayfs基本原理

![img](.\overlayfs.assets\1580705-20191230141201863-1669781061.png)



##  实验目的

> 对overlayfs的特性进行研究,并且手动实现,更加深刻的掌握其特性

## 实验步骤

### 创建需要的目录



```shell
mkdir overlayfs/lowerdir{1..3} -p
mkdir overlayfs/upperdir -p
mkdir overlayfs/merged -p
mkdir overlayfs/work -p
```

### 创建相关文件

> 注意,我们在**lowerdir1**创建了**1,2,3**三个文件,但是只向 其中的 **1**写入了正确内容,其它两个都是写入的英文字符,在**lowerdir2**创建了 **2,3**两个文件,在 **2**中写入了正确的数字,在另外一个文件中写入英文字符,在**lowerdir3**只创建一个文件 **3**,并写入字符三

```shell
cd overlayfs
touch lowerdir1/{1..3}
touch lowerdir2/{2..3}
touch lowerdir3/3 
echo 1 >lowerdir1/1
echo b >lowerdir1/2
echo c >lowerdir1/3

echo 2 >lowerdir2/2
echo d >lowerdir2/3

echo 3 >lowerdir3/3
touch upperdir/upper 
echo upper >upperdir/upper
```





### 创建overlayfs

> `lowerdir`:底层目录,其中的文件为`Read-only`,支持多lower，最大支持500层,每层有优先级的区别,各个目录使用`:`间隔,第一个目录在最上层,然后一级一级的向下,在下面的这个命令,lowerdir3在最高层,lower1在最低层
>
> `upperdir`:上层目录,所有的修改操作都在这个目录,不会对底层文件进行修改
>
> `merged`:文件呈现的目录,也就是命令最后的一个参数
>
> `workdir`:指定文件系统的工作基础目录，挂载后内容会被清空，且在使用过程中其内容用户不可见,文件系统类型必须和upper相同

```shell
mount -t overlay overlay -o lowerdir=lowerdir3:lowerdir2:lowerdir1,upperdir=upperdir,workdir=work merged
```



### 验证结果

![image-20220426203746110](.\overlayfs.assets\image-20220426203746110.png)

![image-20220426203824505](.\overlayfs.assets\image-20220426203824505.png)

>  在修改lower文件后,文件会先被拷贝到upper层,再进行修改

![image-20220426203947123](.\overlayfs.assets\image-20220426203947123.png)

### 结论

> overlayfs还有许多细节没有讨论到,只验证了其最表面的特性,这些特性可以足够我们做很多东西,就比如:
>
> 需要同时构建一个应用的两个版本,比如是版本10和11,我们可以先将版本10拉下来,再将这个目录作为lower层,开两个merged层,这样我们就有两个版本为10的目录,我们可以在其中的一个目录里面进行拉取版本11的文件,这样不会对底层文件进行修改,又可以节约时间
