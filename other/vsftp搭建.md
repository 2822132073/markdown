# 安装mycli

| 系统环境 | CentOS Linux release 7.5.1804 |
| -------- | ----------------------------- |
|          |                               |



## 安装Python3

*安装mycli需要python3环境，在python2环境中会缺少许多包，所以采用了python3*

```
yum install -y python3
```

## 安装相关依赖包

```
pip3 install setuptools_rust
pip3 install -y --upgrade pip
# 这里为什么要升级,我也不知道,猜测是缺一些包,就下载了一下
```

##  安装mycli

```
pip3 install -y mycli
```



