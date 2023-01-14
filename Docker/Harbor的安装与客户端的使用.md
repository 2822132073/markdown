> 安装Harbor需要安装`docker-compose`,关于`docker-compose`的下载,有相关的说明

# 下载Harbor

[github页面](https://github.com/goharbor/harbor/releases)

> 选择一个版本,然后下载下来,最好是选择离线版本,这样就不需要下载镜像了

```bash
# 先传入harbor-offline-installer-v2.7.0.tgz 安装包
root@template:~# tar xvf harbor-offline-installer-v2.7.0.tgz 
harbor/harbor.v2.7.0.tar.gz
harbor/prepare
harbor/LICENSE
harbor/install.sh
harbor/common.sh
harbor/harbor.yml.tmpl
# 现在进行配置harbor
root@template:~# cd harbor/
root@template:~/harbor# cp harbor.yml.tmpl harbor.yml
```

![image-20230113212804186](https://cdn.jsdelivr.net/gh/2822132073/image/202301132128892.png)

> 主要是对这块区域进行配置,建议是最好配置这个证书

# 生成证书

> 所有操作在harbor目录的cert目录中操作

```bash
mkdir cert
cd cert
```

## 生成自建CA的私钥和证书

```bash
openssl genrsa -out ca.key 4096
```

## 生成CA的证书

```bash
openssl req -x509 -new -nodes -sha512 -days 3650 \
 -subj "/C=CN/ST=Beijing/L=Beijing/O=example/OU=Personal/CN=harbor.fsl.com" \
 -key ca.key \
 -out ca.crt
```

> 这里的CN可以改成IP

> 如果遇到`Can't load /root/.rnd into RNG`错误
>
> ```bash
> cd /root
> openssl rand -writerand .rnd
> ```

## 生成Harbor的私钥

```bash
openssl genrsa -out harbor.fsl.com.key 4096
```

## 生成CSR

```bash
openssl req -sha512 -new \
    -subj "/C=CN/ST=Beijing/L=Beijing/O=example/OU=Personal/CN=harbor.fsl.com" \
    -key harbor.fsl.com.key \
    -out harbor.fsl.com.csr
```

> 这里的CN可以改成IP

## **生成x509 v3文件**

> 这个玩意,我也不知道是啥,找了半天也没找到相关的博客

```bash
cat > v3.ext <<-EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1=harbor.fsl.com
DNS.2=harbor.fsl.com
DNS.3=harbor.fsl.com
EOF
```

> 如果是IP访问的话,是这样
>
> ```bash
> cat > v3.ext <<-EOF
> authorityKeyIdentifier=keyid,issuer
> basicConstraints=CA:FALSE
> keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
> extendedKeyUsage = serverAuth
> subjectAltName = IP:x.x.x.x
> EOF
> ```

## 使用上述文件,生成证书

```bash
openssl x509 -req -sha512 -days 3650 \
    -extfile v3.ext \
    -CA ca.crt -CAkey ca.key -CAcreateserial \
    -in harbor.fsl.com.csr \
    -out harbor.fsl.com.crt
```

## 转换证书格式,给docker使用

> 之前文档写的一步,不知道需要不

```bash
openssl x509 -inform PEM -in harbor.fsl.com.crt -out harbor.fsl.com.cert
```

# 配置Harbor证书

![image-20230113220147583](https://cdn.jsdelivr.net/gh/2822132073/image/202301132201218.png)

> 这里的配置要和证书中的一致

# 启动Harbor

```bash
root@template:~/harbor# ./install.sh 

[Step 0]: checking if docker is installed ...

Note: docker version: 20.10.22

.......
```

> 直接执行install.sh这个脚本就可以了

```bash
root@template:~/harbor# docker compose ps
NAME                IMAGE                                COMMAND                  SERVICE             CREATED             STATUS                        PORTS
harbor-core         goharbor/harbor-core:v2.7.0          "/harbor/entrypoint.…"   core                2 minutes ago       Up About a minute (healthy)   
harbor-db           goharbor/harbor-db:v2.7.0            "/docker-entrypoint.…"   postgresql          2 minutes ago       Up 2 minutes (healthy)        
harbor-jobservice   goharbor/harbor-jobservice:v2.7.0    "/harbor/entrypoint.…"   jobservice          2 minutes ago       Up About a minute (healthy)   
harbor-log          goharbor/harbor-log:v2.7.0           "/bin/sh -c /usr/loc…"   log                 2 minutes ago       Up 2 minutes (healthy)        127.0.0.1:1514->10514/tcp
harbor-portal       goharbor/harbor-portal:v2.7.0        "nginx -g 'daemon of…"   portal              2 minutes ago       Up 2 minutes (healthy)        
nginx               goharbor/nginx-photon:v2.7.0         "nginx -g 'daemon of…"   proxy               2 minutes ago       Up About a minute (healthy)   0.0.0.0:80->8080/tcp, :::80->8080/tcp, 0.0.0.0:443->8443/tcp, :::443->8443/tcp
redis               goharbor/redis-photon:v2.7.0         "redis-server /etc/r…"   redis               2 minutes ago       Up About a minute (healthy)   
registry            goharbor/registry-photon:v2.7.0      "/home/harbor/entryp…"   registry            2 minutes ago       Up 2 minutes (healthy)        
registryctl         goharbor/harbor-registryctl:v2.7.0   "/home/harbor/start.…"   registryctl         2 minutes ago       Up 2 minutes (healthy)        

```

> 看到这些都是**up**的就可以了

# 访问Harbor

> 这里的默认用户名密码为
>
> admin/Harbor12345
>
> 可以在harbor.yml中配置

![image-20230113220732950](https://cdn.jsdelivr.net/gh/2822132073/image/202301132207813.png)

# Harbor的使用



## Docker

**如果`Harbor`没有配置证书,需要将`Harbor`的`IP`放入`daemon.json`的`insecure-registries`中,如下**

```shell
[root@manager ~]# cat /etc/docker/daemon.json
{
  "registry-mirrors": ["https://esc1pe31.mirror.aliyuncs.com"],
  "insecure-registries" : ["192.168.10.126"]
}
```

重启dockerd

```shell
systemctl restart docker
```

然后就可以登陆

**如果配置了证书,需要将证书放在/etc/docker/certs.d的域名的路径**

```bash
root@template:~/harbor# mkdir -p /etc/docker/certs.d/harbor.fsl.com
root@template:~/harbor# cd cert/
root@template:~/harbor/cert# cp harbor.fsl.com.cert /etc/docker/certs.d/harbor.fsl.com
root@template:~/harbor/cert# cp harbor.fsl.com.key /etc/docker/certs.d/harbor.fsl.com
root@template:~/harbor/cert# cp ca.key /etc/docker/certs.d/harbor.fsl.com
root@template:~/harbor/cert# docker login -u admin -pHarbor12345 harbor.fsl.com
WARNING! Using --password via the CLI is insecure. Use --password-stdin.
WARNING! Your password will be stored unencrypted in /root/.docker/config.json.
Configure a credential helper to remove this warning. See
https://docs.docker.com/engine/reference/commandline/login/#credentials-store

Login Succeeded
```

## Containerd

[](https://www.modb.pro/db/536568)

[](https://www.modb.pro/db/489915)

[](https://zhuanlan.zhihu.com/p/558475074)

> 直接在config.toml中配置相关的证书参数对于Containerd默认使用的ctr是不生效的因为ctr不使用CRI；
>
> 因此它不读取配置中【plugins."io.containerd.grpc.v1.cri"】配置的认证内容
>
> 我们可以使用Containerd支持的hosts方式去进行配置，可以实现ctr和nerdctl去对接Harbor

### **创建Harbor对应的证书目录**

```bash
mkdir -p etc/containerd/certs.d/harbor.devops.com/
```

> 首先我们需要创建hosts.toml文件或者证书文件存储的目录，注意这个创建的目录名称必须是Harbor的域名(如果不是则报x509)；然后将证书文件或者hosts.toml文件放入该目录下才会生效

### **修改config.toml配置**

> 找到[plugins."io.containerd.grpc.v1.cri".registry]下的config_path，然后指定证书存储目录

```bash
vim etc/containerd/config.toml
```

![image-20230114144017261](https://cdn.jsdelivr.net/gh/2822132073/image/202301141440116.png)

```bash
systemctl restart containerd
```

### 配置

> 有两种方式
>
> - 配置证书
> - 忽略证书

#### 忽略证书

> 忽略证书，就是我们只需要在/etc/containerd/certs.d/harbor.fsl.com/目录下面创建hosts.toml文件即可，不需要Harbor认证的自签名证书

```bash
]# vim etc/containerd/certs.d/harbor.devops.com/hosts.toml
[host."https://harbor.devops.com"]
  capabilities = ["pull", "resolve","push"]
  skip_verify = true
```

> 不需要重启服务，我们直接通过ctr跟nerdctl命令进行验证,可以拉取镜像,也可以进行登录

```bash
root@node-1:/etc/containerd# nerdctl login -u admin -p Harbor12345 harbor.fsl.com
WARN[0000] WARNING! Using --password via the CLI is insecure. Use --password-stdin. 
WARNING: Your password will be stored unencrypted in /root/.docker/config.json.
Configure a credential helper to remove this warning. See
https://docs.docker.com/engine/reference/commandline/login/#credentials-store

Login Succeeded
```

#### 配置证书

> 现在我们需要把自签名Harbor域名的CA证书上传到/etc/containerd/certs.d/harbor.fsl.com/目录下,其它没啥变化,只是添加了ca的配置

```bash
~]# vim etc/containerd/certs.d/harbor.fsl.com/hosts.toml
[host."https://harbor.fsl.com"]

  capabilities = ["pull", "resolve","push"]
  ca = ["ca.crt"]

```

```bash
root@node-1:/etc/containerd/certs.d/harbor.fsl.com# nerdctl login -u admin -p Harbor12345 harbor.fsl.com
WARN[0000] WARNING! Using --password via the CLI is insecure. Use --password-stdin. 
WARNING: Your password will be stored unencrypted in /root/.docker/config.json.
Configure a credential helper to remove this warning. See
https://docs.docker.com/engine/reference/commandline/login/#credentials-store

Login Succeeded

```

