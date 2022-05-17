# git





[TOC]



![img](git.assets\02-232838726.png)





> `<>`其中内容为必选项
>
> `[]`其中内容为可选项

## init

> init可以初始化一个git版本库,使用`git init test`会在本目录下生成一个`test`的目录,并且在目录中生成`.git`文件夹,如果有`test`目录,那么会直接在`test`中生成`.git`目录,
>
> 如果`git init`后没有接任何参数,那么就是直接初始化本目录,也就是在本目录下生成`.git`

## clone

> 除了可以自己创建版本库,还可以克隆其他远程的代码库
>
> ```c
> git clone <url> [other_name]  //从url地址中克隆代码,如果存在other_name,那么就将代码放在哪个目录
> ```
>
> 例如:
>
> `url`:https://gitee.com/linux_duduniao/gosh.git
>
> 代码的存放目录将会是`gosh`
>
> 如果存在other_name为`othersh`,那么存放代码的目录为`othersh`





## add

> 将文件从工作区移动到暂存区
>
> ```c
> git add file  //将文件添加到暂存区
> git add -A  //将文件全部添加到暂存区
> ```

## commit

> 将暂存区的文件提交到仓库区
>
> ```c
> git commit -m"message" file //将file提交到仓库区,并附加message
> git commit -a -m"message" //提交所有暂存区的文件
> ```



## status

> 查看当前git仓库的状态
>
> ```c
> git status
> ```



## diff

> 比较文件在暂存区和在工作区的文件的区别
>
> ```c
> git diff <file> //查看文件在暂存区和工作区的区别
> git diff --cached <file> //仓库区和暂存区的对比  
> git diff --staged <file>  //仓库区和暂存区的对比,和cached作用相同
> ```

## reset

> 用于回退版本,可以指定回退的版本,有三种模式
>
> **mixed**:默认参数,回退暂存区和仓库区到指定版本,工作区不变
>
> **soft**:仅仅回退仓库区,暂存区和工作区不变
>
> **hard**:回退所有区域到指定版本
>
> 可以通过**HEAD**来进行代指当前版本,**HEAD^**代表上个版本,**HEAD^^**代表上上个版本,依次类推
>
> 也可以通过数字指定,**HEAD~0**值当前版本,**HEAD~1**指上个版本,依次类推
>
> 还可以通过`git log --oneline`显示的版本号进行指定
>
> ```c
> 
> ```
>
> 

## rm

> 进行删除文件
>
> ```c
> git rm <file> //删除工作区和暂存区的文件
> git rm --cached <file> //删除暂存区的文件
> ```

## mv

> 用于移动或重命名一个文件、目录或软连接。
>
> ```c
> git mv <file> <newfile>  //移动或者重命名一个文件
> git mv -f <file> <newfile>  //如果新文件名已经存在,可以使用-f,但是原来的会被覆盖
> ```





## log

> 查看提交日志,显示相关信息
>
> ```c
> git log //显示相关日志
> git log --oneline //显示简短的日志信息
> ```
>

## branch

> 创建分支,查看分支
>
> ```c
> git branch <branch_name>  //创建branch_name分支
> git branch //查看所有分支
> ```

## checkout

> 切换分支,删除分支
>
> ```
> git checkout <branch_name>  //切换到branch_name
> git checkout -b <branch_name> //创建并切换到指定分支
> git checkout -d <branch_name>  //删除指定分支
> ```





## remote

> 操作远程仓库
>
> ``` 
> git remote -v //查看远程仓库的短名称和相对应的url
> git remote //查看远程仓库的短名称
> git remote add <short_name> <url> //添加远程仓库
> git remote rm <short_name>  //删除远程仓库
> git remote rename <old> <new> //重命名远程仓库
> ```

## fetch

> 将远程仓库代码拉取到本地,但是不改变本地代码,想要如何移动指针,看用户自己的选择
>
> ```c
> git fetch <remote> <branch_name>  //下拉remote的branch
> ```
>
> 

## pull

> 将代码从远程从远程仓库拉取下来,并将其合并
>
> ```c
> git pull <remote> <remote_branch>[:local_branch] //从remote上拉取remote_branch,并与当前分支合并.如果指定local_branch,将与local_branch合并
> ```

## push

> 将本地仓库区代码提交到远程仓库区
>
> ```c
> git push <remote> <local_branch>[:remote_branch]  //将本地的local_branch提交到remote的remote_branch,如果local_branch和remote_branch相同,可以省略remote_branch
> 
> ```
>
> 

## revert

> 回退某个版本的修改
>
> [博客地址](https://blog.csdn.net/zhuqiuhui/article/details/105424776)
>
> 比如我们有dev1分支,dev2和master三条个分支,当一次dev1和master条分支合并后形成m5,发现dev1分支提交的内容有bug,需要紧急回退到原来的版本,但是在这之前,又有一个dev2分支的代码合并进master分支形成的m6,所以我们需要排除掉dev1分区的改变,保留dev2的改变,我们这个时候就需要revert	
>
> ![img](git.assets\watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3podXFpdWh1aQ==,size_16,color_FFFFFF,t_70.png)
>
> ```c
> git revert  <commit_id> //将某个commit_id的修改回退,将其与的部分留在工作区和暂存区,并且形成一个新的commit
> git revert -n <commit_id>   //只留在暂存区和工作区,但是不进行提交commit
> ```
>
> 如果,想要回退的commit是一个merge产生的,那么它的父分支有两个,那么我们需要指定那个是想要保留的分支,不然无法进行**revert**,需要使用`-m`指定哪个是需要保留的分支内容,`-m`可以指定的值有两个(1|2),就按照下图,如果指定1,那就是保留**d7328d9**删除**ef8915c**产生的修改,选择2就是保留**ef8915c**,删除**d7328d9**的修改
>
> ![image-20220506220819834](D:\markdown\other\git.assets\image-20220506220819834.png)
>
> ```c
> git revert -m[1|2] <commit_id>  //在需要回退的commit是merge形成的时候,或者commit有两个父分支,使用-m
> ```
>
> 
## rebase

>

## merge

> 
