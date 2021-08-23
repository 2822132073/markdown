# kubernetes安装es+kibana

[TOC]





## 创建NameSpace

```
kind: Namespace
apiVersion: v1
metadata:
  name: kube-logging
```



## 安装ES集群

> [参考链接](https://www.cnblogs.com/jingying/p/14386783.html)
>
> 在Kubernetes中安装ES集群时,我选择安装一个三节点的集群
>
> - master: 管理整个集群,保存元数据
> - data: 存储数据,负责数据的写入
> - client: 负责任务分发和结果汇聚，分担数据节点压力。

### Master

> 以下文件包含
>
> - `ConfigMap`
> - `Deployment`
> - `PersistentVolumeClaim`
> - `Service`
>
> 需要修改一下信息:
>
> - `PVC`
>
> `Master`暴露一下端口或配置:
>
> - `9300`:用于节点内部通信

```yaml
---
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: kube-logging
  name: elasticsearch-master-config
  labels:
    app: elasticsearch
    role: master
data:
  elasticsearch.yml: |-
    cluster.name: ${CLUSTER_NAME}
    node.name: ${NODE_NAME}
    discovery.seed_hosts: ${NODE_LIST}
    cluster.initial_master_nodes: ${MASTER_NODES}
    network.host: 0.0.0.0
    node:
      master: true
      data: false
      ingest: false
    xpack.security.enabled: true
    xpack.monitoring.collection.enabled: true
---
---
apiVersion: apps/v1
kind: Deployment
metadata:
  namespace: kube-logging
  name: elasticsearch-master
  labels:
    app: elasticsearch
    role: master
spec:
  replicas: 1
  selector:
    matchLabels:
      app: elasticsearch
      role: master
  template:
    metadata:
      labels:
        app: elasticsearch
        role: master
    spec:
      containers:
      - name: elasticsearch-master
        image: docker.elastic.co/elasticsearch/elasticsearch:7.3.0
        env:
        - name: CLUSTER_NAME
          value: elasticsearch
        - name: NODE_NAME
          value: elasticsearch-master
        - name: NODE_LIST
          value: elasticsearch-master,elasticsearch-data,elasticsearch-client
        - name: MASTER_NODES
          value: elasticsearch-master
        - name: "ES_JAVA_OPTS"
          value: "-Xms256m -Xmx256m"
        ports:
        - containerPort: 9300
          name: transport
        volumeMounts:
        - name: config
          mountPath: /usr/share/elasticsearch/config/elasticsearch.yml
          readOnly: true
          subPath: elasticsearch.yml
        - name: storage
          mountPath: /usr/share/elasticsearch/data
      volumes:
      - name: config
        configMap:
          name: elasticsearch-master-config
      - name: "storage"
        persistentVolumeClaim:
          claimName: es-master-pvc
      initContainers:
      - name: increase-vm-max-map
        image: busybox
        command: ["sysctl", "-w", "vm.max_map_count=262144"]
        securityContext:
          privileged: true
      securityContext:
        fsGroup: 1000
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: es-master-pvc
  namespace: kube-logging 
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: ceph-nvme-rbd-new
  resources:
    requests:
      storage: 30Gi
---
apiVersion: v1
kind: Service
metadata:
  namespace: kube-logging
  name: elasticsearch-master
  labels:
    app: elasticsearch
    role: master
spec:
  ports:
  - port: 9300
    name: transport
  selector:
    app: elasticsearch
    role: master

```

### data

> data节点负责整个集群数据的数据的写入和存储,对于data节点对好选择使用StatefulSet,相对于Dp来说,StatefulSet更加稳定
>
> 以下资源配置清单包括一下内容:
>
> - `ConfigMap`
> - `StatefulSet`
> - `Service`
>
> 需要修改的内容为一下:
>
> - `StatefulSet`中的`volumeClaimTemplates`
>
> `Master`暴露一下端口或配置:
>
> - `9300`:用于节点内部通信

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: kube-logging
  name: elasticsearch-data-config
  labels:
    app: elasticsearch
    role: data
data:
  elasticsearch.yml: |-
    cluster.name: ${CLUSTER_NAME}
    node.name: ${NODE_NAME}
    discovery.seed_hosts: ${NODE_LIST}
    cluster.initial_master_nodes: ${MASTER_NODES}
    network.host: 0.0.0.0
    node:
      master: false
      data: true
      ingest: false
    xpack.security.enabled: true
    xpack.monitoring.collection.enabled: true
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  namespace: kube-logging
  name: elasticsearch-data
  labels:
    app: elasticsearch
    role: data
spec:
  serviceName: "elasticsearch-data"
  replicas: 1
  selector:
    matchLabels:
      app: elasticsearch-data
      role: data
  template:
    metadata:
      labels:
        app: elasticsearch-data
        role: data
    spec:
      containers:
      - name: elasticsearch-data
        image: docker.elastic.co/elasticsearch/elasticsearch:7.3.0
        env:
        - name: CLUSTER_NAME
          value: elasticsearch
        - name: NODE_NAME
          value: elasticsearch-data
        - name: NODE_LIST
          value: elasticsearch-master,elasticsearch-data,elasticsearch-client
        - name: MASTER_NODES
          value: elasticsearch-master
        - name: "ES_JAVA_OPTS"
          value: "-Xms300m -Xmx300m"
        ports:
        - containerPort: 9300
          name: transport
        volumeMounts:
        - name: config
          mountPath: /usr/share/elasticsearch/config/elasticsearch.yml
          readOnly: true
          subPath: elasticsearch.yml
        - name: elasticsearch-data-persistent-storage
          mountPath: /usr/share/elasticsearch/data
      volumes:
      - name: config
        configMap:
          name: elasticsearch-data-config
      securityContext:
        fsGroup: 1000
      initContainers:
      - name: increase-vm-max-map
        image: busybox
        command: ["sysctl", "-w", "vm.max_map_count=262144"]
        securityContext:
          privileged: true
      securityContext:
        fsGroup: 1000
  volumeClaimTemplates:
  - metadata:
      name: elasticsearch-data-persistent-storage
    spec:
      accessModes: [ "accessModes" ]
      storageClassName: ceph-nvme-rbd-new
      resources:
        requests:
          storage: 20Gi
---
apiVersion: v1
kind: Service
metadata:
  namespace: kube-logging
  name: elasticsearch-data
  labels:
    app: elasticsearch
    role: data
spec:
  ports:
  - port: 9300
    name: transport
  selector:
    app: elasticsearch
    role: data

```

### client

> `Client`节点负责对外的`REST`节点的暴露
>
> 以下资源配置文件包含一下:
>
> - `ConfigMap`
> - `Deployment`
> - `PersistentVolumeClaim`
>
> 以下文件需要修改:
>
> - `PersistentVolumeClaim`
>
> `Master`暴露一下端口或配置:
>
> - `9300`:用于节点内部通信
> - `9200`:用于暴露给外部

```yaml
---
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: kube-logging
  name: elasticsearch-client-config
  labels:
    app: elasticsearch
    role: client
data:
  elasticsearch.yml: |-
    cluster.name: ${CLUSTER_NAME}
    node.name: ${NODE_NAME}
    discovery.seed_hosts: ${NODE_LIST}
    cluster.initial_master_nodes: ${MASTER_NODES}
    network.host: 0.0.0.0
    node:
      master: false
      data: false
      ingest: true
    xpack.security.enabled: true
    xpack.monitoring.collection.enabled: true
---
---
apiVersion: apps/v1
kind: Deployment
metadata:
  namespace: kube-logging
  name: elasticsearch-client
  labels:
    app: elasticsearch
    role: client
spec:
  replicas: 1
  selector:
    matchLabels:
      app: elasticsearch
      role: client
  template:
    metadata:
      labels:
        app: elasticsearch
        role: client
    spec:
      containers:
      - name: elasticsearch-client
        image: docker.elastic.co/elasticsearch/elasticsearch:7.3.0
        env:
        - name: CLUSTER_NAME
          value: elasticsearch
        - name: NODE_NAME
          value: elasticsearch-client
        - name: NODE_LIST
          value: elasticsearch-master,elasticsearch-data,elasticsearch-client
        - name: MASTER_NODES
          value: elasticsearch-master
        - name: "ES_JAVA_OPTS"
          value: "-Xms256m -Xmx256m"
        ports:
        - containerPort: 9200
          name: client
        - containerPort: 9300
          name: transport
        volumeMounts:
        - name: config
          mountPath: /usr/share/elasticsearch/config/elasticsearch.yml
          readOnly: true
          subPath: elasticsearch.yml
        - name: storage
          mountPath: /usr/share/elasticsearch/data
      securityContext:
        fsGroup: 1000
      volumes:
      - name: config
        configMap:
          name: elasticsearch-client-config
      - name: "storage"
        persistentVolumeClaim:
          claimName: es-client-pvc
      initContainers:
      - name: increase-vm-max-map
        image: busybox
        command: ["sysctl", "-w", "vm.max_map_count=262144"]
        securityContext:
          privileged: true
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: es-client-pvc
  namespace: kube-logging 
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: ceph-nvme-rbd-new
  resources:
    requests:
      storage: 30Gi
apiVersion: v1
kind: Service
metadata:
  namespace: kube-logging
  name: elasticsearch-client
  labels:
    app: elasticsearch
    role: client
spec:
  ports:
  - port: 9200
    name: client
  - port: 9300
    name: transport
  selector:
    app: elasticsearch
    role: client
```

### 验证ES集群状态

```shell
[root@rancher ~]# kubectl get po -n kube-logging 
NAME                                    READY   STATUS    RESTARTS   AGE
elasticsearch-client-55bb7dd8c5-x49dw   1/1     Running   0          83m
elasticsearch-data-0                    1/1     Running   0          103m
elasticsearch-master-5dcdb759fd-wb4gd   1/1     Running   0          3h15m
```

## 生成密匙

> 开启xpack验证，现在需要在`client`节点，执行`bin/elasticsearch-setup-passwords` 命令，用于生成密码。命令整合如下：

```
kubectl exec -it $(kubectl get pods -n kube-logging | grep elasticsearch-client | sed -n 1p | awk '{print $1}') -n kube-logging -- bin/elasticsearch-setup-passwords auto -b
```

输出如下:

```
Changed password for user apm_system
PASSWORD apm_system = f4bdyVLK7rEu7T2JOyJO

Changed password for user kibana
PASSWORD kibana = naVl6rTssxV4m3LpkZ5I

Changed password for user logstash_system
PASSWORD logstash_system = yKy3Z8qGdgPsdJWjBsKG

Changed password for user beats_system
PASSWORD beats_system = 2H5ZOvl50IVCvxFnGQ0f

Changed password for user remote_monitoring_user
PASSWORD remote_monitoring_user = 5QFmVwGJDgAo07VIg6un

Changed password for user elastic
PASSWORD elastic = mlYmB6gGEHsBkYglNMyX
```

我们接下来会使用`elastic`用户,所以将其密码做成`secret`,在之后的安装`kibana`会用到

```
kubectl create secret generic elasticsearch-pw-elastic -n kube-logging --from-literal password=mlYmB6gGEHsBkYglNMyX 
```



## 安装`kibana`

> [参考链接](https://www.cnblogs.com/jingying/p/14387940.html)
>
> `kibana`用于进行数据的展示,`kibana`并没有进行数据持久化,因为数据全部存在`ES`中
>
> 以下资源配置清单包括:
>
> - `ConfigMap`
> - `Deployment`
> - `Service`
>
> 暴露了`5601`端口到`30287`

```yaml
---
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: kube-logging
  name: kibana-config
  labels:
    app: kibana
data:
  kibana.yml: |-
    server.host: 0.0.0.0
    elasticsearch:
      hosts: ${ELASTICSEARCH_HOSTS}
      username: ${ELASTICSEARCH_USER}
      password: ${ELASTICSEARCH_PASSWORD}
    i18n.locale: "zh-CN"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  namespace: kube-logging
  name: kibana
  labels:
    app: kibana
spec:
  replicas: 1
  selector:
    matchLabels:
      app: kibana
  template:
    metadata:
      labels:
        app: kibana
    spec:
      containers:
        - name: kibana
          image: docker.elastic.co/kibana/kibana:7.3.0
          ports:
            - containerPort: 5601
              name: webinterface
          env:
            - name: ELASTICSEARCH_HOSTS
              value: "http://elasticsearch-client.kube-logging.svc.cluster.local:9200"
            - name: ELASTICSEARCH_USER
              value: "elastic"
            - name: ELASTICSEARCH_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: elasticsearch-pw-elastic
                  key: password
          volumeMounts:
            - name: config
              mountPath: /usr/share/kibana/config/kibana.yml
              readOnly: true
              subPath: kibana.yml
      volumes:
        - name: config
          configMap:
            name: kibana-config
---
apiVersion: v1
kind: Service
metadata:
  name: kibana-api
  namespace: kube-logging
spec:
  type: NodePort
  selector:
    app: kibana
  ports:
    - name: http
      port: 5601
      targetPort: 5601
      nodePort: 30287
```

> 通过访问`Http://NodeIP:30287`可以访问`kibana`
>
> Username: `elastic`
>
> Password:`mlYmB6gGEHsBkYglNMyX` #之前生成的密匙

