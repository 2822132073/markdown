# 安装XtraBackup





[官网](https://www.percona.com/downloads/Percona-XtraBackup-2.4/LATEST/)

## 从官网下载对应的rpm包









| 系统环境                             | 内核版本                  |
| ------------------------------------ | ------------------------- |
| CentOS Linux release 7.6.1810 (Core) | 5.6.4-1.el7.elrepo.x86_64 |

## 准备环境

> 安装`XtraBackup`需要依赖的一些包

```
wget ftp://rpmfind.net/linux/atrpms/el6-x86_64/atrpms/stable/libev-4.04-2.el6.x86_64.rpm
rpm -ivh libev-4.04-2.el6.x86_64.rpm
yum -y install perl perl-devel libaio libaio-devel perl-Time-HiRes perl-DBD-MySQL rsync perl  perl-Digest-MD5
```

## 从官网下载rpm包

```
wget https://downloads.percona.com/downloads/Percona-XtraBackup-2.4/Percona-XtraBackup-2.4.24/binary/redhat/7/x86_64/percona-xtrabackup-24-2.4.24-1.el7.x86_64.rpm
rpm -ivh percona-xtrabackup-24-2.4.24-1.el7.x86_64.rpm
```

> 一定要先把准备环境的步骤先做











