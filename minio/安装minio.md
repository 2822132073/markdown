[官方文档](https://www.minio.org.cn/docs/cn/minio/linux/operations/installation.html)

### 准备环境

| 主机名  | 配置                                           | ip        |
| ------- | ---------------------------------------------- | --------- |
| minio-0 | 1c4g+额外的4个硬盘（/data/minio下的 disk1到4） | 10.0.0.80 |
| minio-1 | 1c4g+额外的4个硬盘（/data/minio下的 disk1到4） | 10.0.0.81 |
| minio-2 | 1c4g+额外的4个硬盘（/data/minio下的 disk1到4） | 10.0.0.82 |
|         |                                                |           |

具体的步骤就不写了，主要有一下几个方面

- 时间同步
- IP与主机名
- 磁盘的初始化与自动挂载

### 安装

这些操作每个主机都需要做，有些需要修改为对应的地址

#### 设置主机名与IP

```shell
nmcli connection modify ens33  ipv4.method manual ipv4.dns 223.5.5.5 ipv4.gateway 10.0.0.2 ipv4.addresses 10.0.0.83/24 connection.autoconnect yes ipv6.method ignore 802-3-ethernet.mac-address ""
hostnamectl set-hostname minio-3
nmcli c up ens33
```

#### 下载相关文件

```shell
wget https://dl.min.io/server/minio/release/linux-amd64/minio
chmod +x minio
sudo mv minio /usr/local/bin/
```

#### 编写systemd文件

该文件存储在**/etc/systemd/system/minio.service**

```ini
cat >/etc/systemd/system/minio.service<<EOF

[Unit]
Description=MinIO
Documentation=https://min.io/docs/minio/linux/index.html
Wants=network-online.target
After=network-online.target
AssertFileIsExecutable=/usr/local/bin/minio

[Service]
WorkingDirectory=/usr/local

User=minio
Group=minio
ProtectProc=invisible

EnvironmentFile=-/etc/default/minio
ExecStartPre=/bin/bash -c "if [ -z \"\${MINIO_VOLUMES}\" ]; then echo \"Variable MINIO_VOLUMES not set in /etc/default/minio\"; exit 1; fi"
ExecStart=/usr/local/bin/minio server \$MINIO_OPTS $MINIO_VOLUMES

# MinIO RELEASE.2023-05-04T21-44-30Z adds support for Type=notify (https://www.freedesktop.org/software/systemd/man/systemd.service.html#Type=)
# This may improve systemctl setups where other services use `After=minio.server`
# Uncomment the line to enable the functionality
# Type=notify

# Let systemd restart this service always
Restart=always

# Specifies the maximum file descriptor number that can be opened by this process
LimitNOFILE=65536

# Specifies the maximum number of threads this process can create
TasksMax=infinity

# Disable timeout logic and wait until process is stopped
TimeoutStopSec=infinity
SendSIGKILL=no

[Install]
WantedBy=multi-user.target

# Built for \${project.name}-\${project.version} (\${project.name})

EOF
```

#### 创建用户和组以及挂载

```sh
groupadd -r minio
useradd -M -r -g minio minio
chown minio:minio /data/minio/disk1 /data/minio/disk2 /data/minio/disk3 /data/minio/disk4
```



#### 证书文件

这里我没有使用，如果没有使用的话，需要修改一些环境变量的值，后面会提到

#### 环境变量文件

这里使用的都是http协议，如果使用了证书，需要使用https

```shell
MINIO_VOLUMES="http://minio-{0...2}:9000/data/minio/disk{1...4}/"
MINIO_OPTS="--console-address :9001"
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=fsl2000.
MINIO_SERVER_URL="http://10.0.0.80:9000"
```

### 启动

```bash
systemctl start minio.service
```

