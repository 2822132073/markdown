# bash_completion无法使用





## 查看是否安装`bash_completion`

> 没有安装则安装

```shell
[root@localhost ~]# rpm -qa  |grep bash-completion
bash-completion-2.1-8.el7.noarch
```

## 查看`/etc/bash_completion`是否存在

```
[root@localhost ~]# ls /etc/bash_completion
ls: cannot access /etc/bash_completion: No such file or directory
```

## 找到`/etc/bash_completion`位置

```
[root@localhost ~]# find / -name bash_completion
/usr/share/bash-completion/bash_completion
```

## 将其复制到`/etc`下

```shell
cp /usr/share/bash-completion/bash_completion /etc/
```

## 修改`/etc/profile`文件,使其全局生效

```
echo "source /etc/bash_completion" >>/etc/profile
```







```
rpm -q bash-completion && find / -name bash_completion |xargs -I file mv file /etc && echo "source /etc/bash_completion" >>/etc/profile |source /etc/bash_completion
```

