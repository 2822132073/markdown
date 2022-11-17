# 安装

安装的时候,centos和ubuntu的包名都是screen,直接安装就好

# 使用

```shell
├─sshd───sshd───bash───pstree
```

> 这就是初始本次会话的进程树

## 创建任务

> 这两个都是会直接进入这个任务,需要自己进行退出(Detached)

### 没有名字的任务

```shell
screen
```

> 创建一个会话,会使用一个固定格式的名字,这个我没有查阅文档

### 创建一个有名字

```shell
screen -S {task_name}
```

> 创建一个指定名字的窗口





## 将任务放到后台

> 在创建任务时,会直接进入到任务的shell中,有时候需要将任务直接放到后台执行,所有要放到后台

### Ctrl+A

### 另外一种方式：再打开一个终端

```bash
screen -d {pid}
或者
screen -d {task_name}
```

## 恢复任务

```shell
screen -r {pid}
或者
screen -r {task_name}

```



## 删除任务

使用 `-r`进入screen任务之后 输入`exit`

## 常用命令

```shell
screen -dmS [Task_name] [该窗口需要执行命令]
```





[详细博客](https://www.cnblogs.com/linyu51/p/15481474.html)
