在使用k8s的过程中,持久卷是不可以忽略的一部分,大型的ceph这种没有条件部署,所以可以选择nfs-provisioner,来进行提供StorageClass

[github项目地址](https://github.com/kubernetes-sigs/nfs-subdir-external-provisioner)

```shell
# 为所有节点安装 nfs-common
sudo apt install nfs-common

# 在存储节点上安装 nfs-common
sudo apt install nfs-kernel-server

# 创建共享目录
mkdir /mnt/nfs_share
chmod -R 777 /mnt/nfs_share

# 添加访问权限
sudo vim /etc/exports
# 在最后一行写入
/mnt/nfs_share 192.168.2.0/24(rw,sync,no_subtree_check,no_root_squash)
# 第一个为共享的目录,第二个为允许访问的IP(*为所有都可以访问),第三个为权限
# 启动 nfs 服务
systemctl start nfs-server.service 
systemctl enable nfs-server.service 


# 检验是否成功开启
sudo showmount -e 192.168.2.102
# Export list for 192.168.2.102:
# /mnt/nfs_share 192.168.2.0/24
```





> lank8s.cn可以加速k8s.grc.io,但是需要跳过验证

```
mkdir /etc/containerd/certs.d/lank8s.cn -pv
cat > /etc/containerd/certs.d/lank8s.cn/hosts.toml << EOF
server = "https://lank8s.cn"
[host."https://lank8s.cn"]
  capabilities = ["pull", "resolve"]
  skip_verify = true
EOF
## 重启生效加速
systemctl daemon-reload
systemctl enable --now containerd
systemctl restart containerd
```





**RBAC**

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: nfs-provisioner
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: nfs-client-provisioner
  # replace with namespace where provisioner is deployed
  namespace: nfs-provisioner
---
kind: ClusterRole
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: nfs-client-provisioner-runner
rules:
  - apiGroups: [""]
    resources: ["nodes"]
    verbs: ["get", "list", "watch"]
  - apiGroups: [""]
    resources: ["persistentvolumes"]
    verbs: ["get", "list", "watch", "create", "delete"]
  - apiGroups: [""]
    resources: ["persistentvolumeclaims"]
    verbs: ["get", "list", "watch", "update"]
  - apiGroups: ["storage.k8s.io"]
    resources: ["storageclasses"]
    verbs: ["get", "list", "watch"]
  - apiGroups: [""]
    resources: ["events"]
    verbs: ["create", "update", "patch"]
---
kind: ClusterRoleBinding
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: run-nfs-client-provisioner
subjects:
  - kind: ServiceAccount
    name: nfs-client-provisioner
    # replace with namespace where provisioner is deployed
    namespace: nfs-provisioner
roleRef:
  kind: ClusterRole
  name: nfs-client-provisioner-runner
  apiGroup: rbac.authorization.k8s.io
---
kind: Role
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: leader-locking-nfs-client-provisioner
  # replace with namespace where provisioner is deployed
  namespace: nfs-provisioner
rules:
  - apiGroups: [""]
    resources: ["endpoints"]
    verbs: ["get", "list", "watch", "create", "update", "patch"]
---
kind: RoleBinding
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: leader-locking-nfs-client-provisioner
  # replace with namespace where provisioner is deployed
  namespace: nfs-provisioner
subjects:
  - kind: ServiceAccount
    name: nfs-client-provisioner
    # replace with namespace where provisioner is deployed
    namespace: nfs-provisioner
roleRef:
  kind: Role
  name: leader-locking-nfs-client-provisioner
  apiGroup: rbac.authorization.k8s.io

```



**deploy**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nfs-client-provisioner
  labels:
    app: nfs-client-provisioner
  namespace: nfs-provisioner 
spec:
  replicas: 1
  strategy:
    type: Recreate
  selector:
    matchLabels:
      app: nfs-client-provisioner
  template:
    metadata:
      labels:
        app: nfs-client-provisioner
    spec:
      serviceAccountName: nfs-client-provisioner
      containers:
        - name: nfs-client-provisioner
          image: lank8s.cn/sig-storage/nfs-subdir-external-provisioner:v4.0.2
          volumeMounts:
            - name: nfs-client-root
              mountPath: /persistentvolumes
          env:
            - name: PROVISIONER_NAME
              value: k8s-sigs.io/nfs-subdir-external-provisioner
            - name: NFS_SERVER
              value: 172.16.1.119
            - name: NFS_PATH
              value: /nfsroot/kubernetes
      volumes:
        - name: nfs-client-root
          nfs:
          # 这里要填nfs服务器地址
            server: 172.16.1.119
            path: /nfsroot/kubernetes

```

**storageclass**

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: nfs-client
  # 这里的值,需要和上文的PROVISIONER_NAME一样
provisioner: k8s-sigs.io/nfs-subdir-external-provisioner 
parameters:
  archiveOnDelete: "false"
```



**测试**

```yaml
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: test-claim
spec:
  storageClassName: nfs-client
  accessModes:
    - ReadWriteMany
  resources:
    requests:
      storage: 1Mi
kind: Pod
apiVersion: v1
metadata:
  name: test-pod
spec:
  containers:
  - name: test-pod
    image: busybox:stable
    command:
      - "/bin/sh"
    args:
      - "-c"
      - "touch /mnt/SUCCESS && exit 0 || exit 1"
    volumeMounts:
      - name: nfs-pvc
        mountPath: "/mnt"
  restartPolicy: "Never"
  volumes:
    - name: nfs-pvc
      persistentVolumeClaim:
        claimName: test-claim
```

> pod运行完成之后,会在nfs服务的目录下生成一个SUCCESS文件,代表可以使用该文件了