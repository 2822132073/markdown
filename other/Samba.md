# Samba

## 环境说明

```shell
[root@localhost ~]# uname -a
Linux localhost.localdomain 3.10.0-862.el7.x86_64 #1 SMP Fri Apr 20 16:44:24 UTC 2018 x86_64 x86_64 x86_64 GNU/Linux

```





## 安装步骤

### 安装软件

```
yum -y install samba-client samba-common cifs-utils samba
```

### 备份以前的文件

```
cp /etc/samba/smb.conf{,.bak}
```

### 创建配置文件

#### 无需密码的配置文件

> 注意共享目录权限

```ini
[global]  
        workgroup = FSL_SMB_server
        server string = Fsl_Server_Smb
        security = user   
        map to guest = Bad User
        passdb backend = tdbsam
[share]
        path = /data
        public = yes

```

#### 需要密码的配置文件

```ini
[global]    
workgroup = FSL_SMB_server
server string = Fsl_Server_Smb
security = user                   
passdb backend = smbpasswd
smb passwd file = /etc/samba/smbpasswd
[share]
comment = share some files
path = /data/smb
public = no
create mask = 0644
directory mask = 0755
valid users = fsl
write list = fsl
writeable = yes
```

> 在创建smb用户之前,需要先创建系统用户,最好使用无法登录的用户以确保安全,如下:
>
> ```shell
> useradd   -M -s /sbin/nologin fsl
> smbpasswd -a fsl
> ```
>
> 这样就可以使用这个用户进行登录







## 用户映射

### 步骤

#### 向`/etc/samba/smb.conf`的`global`区域中添加一个配置项

```shell
username map = /etc/samba/smbusers
```

### 再向这个文件写出映射关系

```shell
#UNIX_USER = Smb user,可以写多个用户,使用空格分隔
root = fsl fsq fcr
```

> UNIX_USER也使用`smbpasswd`创建之后才能进行使用,比如这个例子中,我们将三个用户映射成为root用户,我们不仅仅要将三个用户创建,而且需要将root用户使用`smbpasswd`创建

这样写完之后,使用fsl用户登录smb创建文件,在Linux中, 显示创建的文件的属组,属主为root