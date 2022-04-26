# xargs简单教程

[TOC]

## `-p,-t`

> `-p`: 在执行命令前打印并询问是否执行，输入y继续
>
> `-t`:在命令执行完成之后,打印命令内容,输出到`/dev/stderr`



## `-L`

> 指定一次一次多少行命令参数
>
> ```shell
> [root@cq49 /tmp/fsl]# touch {1..6}
> [root@cq49 /tmp/fsl]# ls
> 1  2  3  4  5  6
> [root@cq49 /tmp/fsl]# ls * |xargs -L 2
> 1 2
> 3 4
> 5 6
> [root@cq49 /tmp/fsl]# ls * |xargs -L 3
> 1 2 3
> 4 5 6
> ```

## `-I`

> 将`-I`指定的单词在后面的命令中替换掉
>
> ```shell
> [root@cq49 /tmp/fsl]# ls
> 1  2  3  4  5  6
> [root@cq49 /tmp/fsl]# ls * |xargs -I NUMBER rm -f  NUMBER
> [root@cq49 /tmp/fsl]# ls
> ```