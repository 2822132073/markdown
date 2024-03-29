

## 优化

### 关闭防火墙

```shell
systemctl disable firewalld
systemctl stop firewalld
```



### 关闭selinux

> ubuntu18 需要安装`selinux-utils`
>
> ```shell
> apt install  -y selinux-utils
> ```

```shell
setenforce 0
sed -i '/SELINUX/s/enforcing/disabled/g' /etc/selinux/config
```

### 节点都要关闭swap

```shell
swapoff -a
sed -i '/ swap / s/^\(.*\)$/#\1/g' /etc/fstab
```

### 所有节点都要开启内核模块

```bash
modprobe ip_vs
modprobe ip_vs_rr
modprobe ip_vs_wrr
modprobe ip_vs_sh
modprobe nf_conntrack
modprobe nf_conntrack_ipv4
modprobe br_netfilter
modprobe overlay
```

#### 开启模块自动加载服务



> Linux系统加载哪些内核模块，和配置文件有关系。
>
> 1. 模块保存在`/lib/modules/`下。
> 2. 使用`/etc/modules-load.d/`来配置系统启动时加载哪些模块。
> 3. 使用`/etc/modprobe.d/`下配置模块加载时的一些参数


> 这一步会在ubuntu中出现警告,但是不影响使用,仍然会开启自启

```
cat > /etc/modules-load.d/k8s-modules.conf <<EOF
ip_vs
ip_vs_rr
ip_vs_wrr
ip_vs_sh
nf_conntrack
nf_conntrack_ipv4
br_netfilter
overlay
EOF
```

```
systemctl enable systemd-modules-load
systemctl restart systemd-modules-load
```

### 内核优化

```bash
cat <<EOF > /etc/sysctl.d/kubernetes.conf
# 开启数据包转发功能（实现vxlan）
net.ipv4.ip_forward=1
# iptables对bridge的数据进行处理
net.bridge.bridge-nf-call-iptables=1
net.bridge.bridge-nf-call-ip6tables=1
net.bridge.bridge-nf-call-arptables=1
# 关闭tcp_tw_recycle，否则和NAT冲突，会导致服务不通
net.ipv4.tcp_tw_recycle=0
# 不允许将TIME-WAIT sockets重新用于新的TCP连接
net.ipv4.tcp_tw_reuse=0
# socket监听(listen)的backlog上限
net.core.somaxconn=32768
# 最大跟踪连接数，默认 nf_conntrack_buckets * 4
net.netfilter.nf_conntrack_max=1000000
# 禁止使用 swap 空间，只有当系统 OOM 时才允许使用它
vm.swappiness=0
# 计算当前的内存映射文件数。
vm.max_map_count=655360
# 内核可分配的最大文件数
fs.file-max=6553600
# 持久连接
net.ipv4.tcp_keepalive_time=600
net.ipv4.tcp_keepalive_intvl=30
net.ipv4.tcp_keepalive_probes=10
EOF
```

配置生效

```bash
sysctl -p /etc/sysctl.d/kubernetes.conf
```

### 清空iptables规则

```bash
iptables -F && iptables -X && iptables -F -t nat && iptables -X -t nat
iptables -P FORWARD ACCEPT
```

## 安装containerd

### 配置docker源

```bash
wget -O /etc/yum.repos.d/docker.repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
```

### 安装 containerd

```bash
yum install -y containerd.io
```



## 安装kubeadm,kubelet

### ubuntu18.04

[阿里云](https://developer.aliyun.com/mirror/kubernetes/?spm=a2c6h.25603864.0.0.71132529B0RUxM)

#### 安装kubeadm

> 安装kubeadm同时会安装kubelet还有containerd,在安装时,必须明确的指定每个安装包的版本,没有指定版本的安装包会默认安装最新版本

```bash
apt-get update && apt-get install -y apt-transport-https
curl https://mirrors.aliyun.com/kubernetes/apt/doc/apt-key.gpg | apt-key add - 
cat <<EOF >/etc/apt/sources.list.d/kubernetes.list
deb https://mirrors.aliyun.com/kubernetes/apt/ kubernetes-xenial main
EOF
apt-get update
apt-get install -y kubelet kubeadm kubectl
```

#### 如何安装指定版本

```shell
sudo apt-cache madison package #使用 apt-cache madison 列出软件的所有来源
sudo apt-get install package=version #通过apt-get安装指定版本的软件
```

#### 命令补全

```shell
echo 'source <(kubectl completion bash)' >> $HOME/.bashrc
echo 'source <(kubeadm completion bash)' >> $HOME/.bashrc
echo 'source <(crictl completion)' >> $HOME/.bashrc
source $HOME/.bashrc
```



### Centos7

```bash
cat <<EOF > /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=https://mirrors.aliyun.com/kubernetes/yum/repos/kubernetes-el7-x86_64/
enabled=1
gpgcheck=0
repo_gpgcheck=0
gpgkey=https://mirrors.aliyun.com/kubernetes/yum/doc/yum-key.gpg https://mirrors.aliyun.com/kubernetes/yum/doc/rpm-package-key.gpg
EOF

```

查看当前稳定版本为`1.24.1`

```
yum list kubeadm kubelet
```

#### 安装

```
yum install -y kubelet kubeadm
```

#### 配置命令补齐

```bash
yum install -y bash-completion
echo 'source <(kubectl completion bash)' >> $HOME/.bashrc
echo 'source <(kubeadm completion bash)' >> $HOME/.bashrc
echo 'source <(crictl completion)' >> $HOME/.bashrc
source $HOME/.bashrc

```

#### 启动kubelet

```
systemctl enable kubelet
systemctl restart kubelet
```



## 修改containerd配置文件

> `root` 容器存储路径，修改成磁盘空间充足的路径
>
> `sandbox_image` pause 镜像名称以及镜像tag（一定要可以拉取到 pause 镜像的，否则会导致集群初始化的时候 kubelet 重启失败）
>
> `bin_dir` cni 插件存放路径，yum 安装的 containerd 默认存放在 /opt/cni/bin 目录下

### 获得默认配置文件

```
containerd config default >/etc/containerd/config.toml
```

### 对其进行相应的修改

```shell
# 修改Containerd的配置文件
sed -i "s#SystemdCgroup\ \=\ false#SystemdCgroup\ \=\ true#g" /etc/containerd/config.toml
cat /etc/containerd/config.toml | grep SystemdCgroup

sed -i "s#registry.k8s.io#registry.cn-hangzhou.aliyuncs.com/chenby#g" /etc/containerd/config.toml
cat /etc/containerd/config.toml | grep sandbox_image

sed -i "s#config_path\ \=\ \"\"#config_path\ \=\ \"/etc/containerd/certs.d\"#g" /etc/containerd/config.toml
cat /etc/containerd/config.toml | grep certs.d

```

### **配置镜像加速**

```shell
mkdir /etc/containerd/certs.d/docker.io -pv
cat > /etc/containerd/certs.d/docker.io/hosts.toml << EOF
server = "https://docker.io"
[host."https://hub-mirror.c.163.com"]
  capabilities = ["pull", "resolve"]
EOF
## 重启生效加速
systemctl daemon-reload
systemctl enable --now containerd
systemctl restart containerd
```

### 配置crictl的containerd的socket位置

```bash
cat > /etc/crictl.yaml <<'EOF'
runtime-endpoint: "unix:///run/containerd/containerd.sock"
image-endpoint: "unix:///run/containerd/containerd.sock"
timeout: 0
debug: false
pull-image-on-create: false
disable-pull-on-run: false
EOF
 
 
# 或者执行下面的两条命令来生成配置文件
crictl config runtime-endpoint unix:///run/containerd/containerd.sock
crictl config image-endpoint unix:///run/containerd/containerd.sock
```

### 启动 containerd 服务，**并设置为开机启动**

```
systemctl enable containerd
systemctl restart containerd
```

## kubeadm部署kubernetes

> 导出引导的配置文件

```
kubeadm config print init-defaults >/root/kubeadm.yaml
```

> `advertiseAddress` 参数需要修改成当前 master 节点的 ip
>
> `bindPort` 参数为 apiserver 服务的访问端口，可以自定义
>
> `criSocket` 参数定义 容器运行时 使用的套接字，默认是 dockershim ，这里需要修改为 contained 的套接字文件，在 conf.toml 里面可以找到
>
> `imagePullPolicy` 参数定义镜像拉取策略，IfNotPresent 本地没有镜像则拉取镜像；Always 总是重新拉取镜像；Never 从不拉取镜像，本地没有镜像，kubelet 启动 pod 就会报错 （注意驼峰命名，这里的大写别改成小写）
>
> `certificatesDir` 参数定义证书文件存储路径，没特殊要求，可以不修改
>
> `controlPlaneEndpoint` 参数定义稳定访问 ip ，高可用这里可以填 vip
>
> `dataDir` 参数定义 etcd 数据持久化路径，默认 /var/lib/etcd ，部署前，确认路径所在磁盘空间是否足够
>
> `imageRepository` 参数定义镜像仓库名称，默认 k8s.gcr.io ，如果要修改，需要注意确定镜像一定是可以拉取的到，并且所有的镜像都是从这个镜像仓库拉取的
>
> `kubernetesVersion` 参数定义镜像版本，和镜像的 tag 一致
>
> `podSubnet` 参数定义 pod 使用的网段，不要和 serviceSubnet 以及本机网段有冲突
>
> `serviceSubnet` 参数定义 k8s 服务 ip 网段，注意是否和本机网段有冲突
>
> `cgroupDriver` 参数定义 cgroup 驱动，默认是 cgroupfs
>
> `mode` 参数定义转发方式，可选为iptables 和 ipvs
>
> `name` 参数定义节点名称，如果是主机名需要保证可以解析（kubectl get nodes 命令查看到的节点名称）

```yaml
apiVersion: kubeadm.k8s.io/v1beta3
bootstrapTokens:
- groups:
  - system:bootstrappers:kubeadm:default-node-token
  token: abcdef.0123456789abcdef
  ttl: 24h0m0s
  usages:
  - signing
  - authentication
kind: InitConfiguration
localAPIEndpoint:
  advertiseAddress: 172.16.0.211   #当前主机的IP
  bindPort: 6443
nodeRegistration:
      criSocket: /run/containerd/containerd.sock  #containerd.sock的地址
  imagePullPolicy: IfNotPresent
  name: master-1  #当前主机的主机名
  taints: null
---
apiServer:
  timeoutForControlPlane: 4m0s
apiVersion: kubeadm.k8s.io/v1beta3
certificatesDir: /etc/kubernetes/pki
clusterName: kubernetes
controlPlaneEndpoint: 172.16.0.13:6443  #如果要做nginx负载均衡,或者vip,这里填vip或者ng的地址
controllerManager: {}
dns: {}
etcd:
  local:
    dataDir: /var/lib/etcd
imageRepository: registry.cn-hangzhou.aliyuncs.com/google_containers #镜像加速
kind: ClusterConfiguration
kubernetesVersion: 1.23.0
networking:
  dnsDomain: cluster.local
  podSubnet: 172.16.0.0/16
  serviceSubnet: 10.96.0.0/12
scheduler: {}

#这两个是后加上去的,不是自带的
---
apiVersion: kubelet.config.k8s.io/v1beta1
kind: KubeletConfiguration
cgroupDriver: systemd
cgroupsPerQOS: true

---
apiVersion: kubeproxy.config.k8s.io/v1alpha1
kind: KubeProxyConfiguration
mode: ipvs

```

### 集群初始化

```
kubeadm init --config kubeadm.yaml
```

### 初始化完成后

> 执行引导集群的主机上执行

```
  mkdir -p $HOME/.kube
  sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
  sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

### 引导其它机器

#### 拷贝相应文件

> 首先需要将一下配置文件拷贝到对应主机上,node节点不需要,只有master需要

**脚本**

```bash
#!bin/bash
Node=$1
ssh master-2 "mkdir -p /etc/kubernetes/pki/etcd"
if [[ $Node =~ master* ]];then
scp -rp /root/.kube/config master-2:/root/.kube
fi
scp -rp /etc/kubernetes/pki/ca.* master-2:/etc/kubernetes/pki
scp -rp /etc/kubernetes/pki/sa.* master-2:/etc/kubernetes/pki
scp -rp /etc/kubernetes/pki/front-proxy-ca.* master-2:/etc/kubernetes/pki
scp -rp /etc/kubernetes/pki/etcd/ca.* master-2:/etc/kubernetes/pki/etcd
scp -rp /etc/kubernetes/admin.conf master-2:/etc/kubernetes
```



```
ssh master-2 "mkdir -p /etc/kubernetes/pki/etcd"
scp -rp /root/.kube/config master-2:/root/.kube
scp -rp /etc/kubernetes/pki/ca.* master-2:/etc/kubernetes/pki
scp -rp /etc/kubernetes/pki/sa.* master-2:/etc/kubernetes/pki
scp -rp /etc/kubernetes/pki/front-proxy-ca.* master-2:/etc/kubernetes/pki
scp -rp /etc/kubernetes/pki/etcd/ca.* master-2:/etc/kubernetes/pki/etcd
scp -rp /etc/kubernetes/admin.conf master-2:/etc/kubernetes


ssh master-3 "mkdir -p /etc/kubernetes/pki/etcd"
scp -rp /root/.kube/config master-3:/root/.kube
scp -rp /etc/kubernetes/pki/ca.* master-3:/etc/kubernetes/pki
scp -rp /etc/kubernetes/pki/sa.* master-3:/etc/kubernetes/pki
scp -rp /etc/kubernetes/pki/front-proxy-ca.* master-3:/etc/kubernetes/pki
scp -rp /etc/kubernetes/pki/etcd/ca.* master-3:/etc/kubernetes/pki/etcd
scp -rp /etc/kubernetes/admin.conf master-3:/etc/kubernetes

ssh node-1 "mkdir -p /etc/kubernetes/pki/etcd"
scp -rp /etc/kubernetes/pki/ca.* node-1:/etc/kubernetes/pki
scp -rp /etc/kubernetes/pki/sa.* node-1:/etc/kubernetes/pki
scp -rp /etc/kubernetes/pki/front-proxy-ca.* node-1:/etc/kubernetes/pki
scp -rp /etc/kubernetes/pki/etcd/ca.* node-1:/etc/kubernetes/pki/etcd
scp -rp /etc/kubernetes/admin.conf node-1:/etc/kubernetes

ssh node-2 "mkdir -p /etc/kubernetes/pki/etcd"
scp -rp /etc/kubernetes/pki/ca.* node-2:/etc/kubernetes/pki
scp -rp /etc/kubernetes/pki/sa.* node-2:/etc/kubernetes/pki
scp -rp /etc/kubernetes/pki/front-proxy-ca.* node-2:/etc/kubernetes/pki
scp -rp /etc/kubernetes/pki/etcd/ca.* node-2:/etc/kubernetes/pki/etcd
scp -rp /etc/kubernetes/admin.conf node-2:/etc/kubernetes
```

#### 执行对应的引导命令

> master像下面这样

```
  kubeadm join 192.168.91.8:6443 --token abcdef.0123456789abcdef \
        --discovery-token-ca-cert-hash sha256:5e2387403e698e95b0eab7197837f2425f7b8610e7b400e54d81c27f3c6f1964 \
        --control-plane
```

> node节点像下面这样

```
kubeadm join 192.168.91.8:6443 --token abcdef.0123456789abcdef \
        --discovery-token-ca-cert-hash sha256:5e2387403e698e95b0eab7197837f2425f7b8610e7b400e54d81c27f3c6f1964
```

### 获取join命令

> 在进行join的过程中,可能会丢失join命令的情况,所以需要生成新的join命令

```shell
kubeadm token create --print-join-command 
```

> 如果是master节点,需要在后面添加`--control-plane`

### 重置集群命令

```shell
iptables -F && iptables -X && iptables -F -t nat && iptables -X -t nat
iptables -P FORWARD ACCEPT
```





## 安装calico

[官方配置文档](https://projectcalico.docs.tigera.io/reference/node/configuration)

> 我在安装的时候发现一个问题,在安装之后发现calico默认使用的是ipip模式,而在这个模式下,不知道为啥,pod可以访问pod,pod可以访问cluster,但是却无法访问Node,我将calico的网络模式换成了BGP模式,这样就可以了

```
curl https://docs.projectcalico.org/manifests/calico.yaml -O
```

> 需要添加一个环境变量
>
> 搜索,`CALICO_IPV4POOL_IPIP`

```
        - name: IP_AUTODETECTION_METHOD
          value: interface=ens*
```

> 这个变量是为了指定那个网卡为calico使用的网卡,可以使用通配符,只能在apply之前添加,之后添加没有用,我尝试过.


```
kubectl apply -f calico.yaml
```

### 当无法拉去镜像时

> 可以去github直接下载对应的包,然后进行导入

### 修改IPIP为BGP

> 将原来的`ipipMode: Always`修改为`Never`

```
# kubectl edit ippool
ipipMode: Always --> ipipMode: Never
```

## 安装Metric

### 下载yaml

```
wget https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/high-availability.yaml
```

### 修改Yaml

```shell
sed -i "s#k8s.gcr.io/metrics-server#registry.cn-hangzhou.aliyuncs.com/chenby#g" high-availability.yaml
sed -i "/args/a\        - --kubelet-insecure-tls" high-availability.yaml 

# args添加tls证书配置选项
vim high-availability.yaml
添加"- --kubelet-insecure-tls"
```

### 应用Yaml

```
kubectl apply -f high-availability.yaml
```

### 查看结果

```shell
# 查看metrics资源
kubectl  get pod -n kube-system | grep metrics
metrics-server-65fb95948b-2bcht            1/1     Running   0             32s
metrics-server-65fb95948b-vqp5s            1/1     Running   0             32s
# 查看node资源情况
kubectl  top node
NAME           CPU(cores)   CPU%   MEMORY(bytes)   MEMORY%   
k8s-master01   127m         1%     2439Mi          64%       
k8s-node01     50m          0%     1825Mi          23%       
k8s-node02     53m          0%     1264Mi          16%   
```



# 遇到奇奇怪怪的问题

## failed to pull and unpack image "docker.io/bitnami/nginx:1.23.3-debian-11-r3": failed to unpack image on snapshotter overlayfs: unexpected media type text/html

> 拉取镜像的时候,会出现这种错误,解决方法
>
> 修改`/etc/containerd/config.toml`
>
> 搜索config_path,将其修改为空
>
> ```bash
> sed -i 's#/etc/containerd/certs.d##g' /etc/containerd/config.toml
> ```
>
> ![image-20230103234956736](https://cdn.jsdelivr.net/gh/2822132073/image/202301032349307.png)



## Failed to pull image  rpc error: code = Unknown desc = failed to pull image "docker.io/yangxikun/k8s-dns-sidecar-amd64:1.14.7": failed commit on ref "layer-sha256:a413d646ee118a8ca25fb59e56351633a386088e0f603f3b9ca173daf945ccf8": "layer-sha256:a413d646ee118a8ca25fb59e56351633a386088e0f603f3b9ca173daf945ccf8" failed size validation: 10068781 != 9333267

> ```shell
> rm -rf /var/lib/containerd/io.containerd.content.v1.content/ingest
> ```
>
> 删除哪些没有下载完成的镜像缓存

## 参考文档

[kubeadm + containerd 部署 k8s-v1.23.3(含证书升级)](https://blog.csdn.net/u010383467/article/details/122984097)

[kubeadm部署K8S并使用containerd做运行时](https://blog.csdn.net/weixin_41020960/article/details/118108397)



