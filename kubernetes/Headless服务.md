# Headless服务

## 实验manifest

### busybox
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: busybox
  namespace: test-es
spec:
  containers:
  - image: busybox
    command:
      - sleep
      - "360000"
    imagePullPolicy: IfNotPresent
    name: busybox
```

### StatefulSet
```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: web
  namespace: test-es
spec:
  podManagementPolicy: Parallel
  selector:
    matchLabels:
      app: nginx
  serviceName: ng-svc-headless
  replicas: 3
  template:
    metadata:
      labels:
        app: nginx-pod
    spec:
      containers:
      - name: nginx
        image: nginx:1.17.1
        ports:
        - containerPort: 80
          name: web
```


### deploy
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ng-deployment
  namespace: test-es
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx-pod
  template:
    metadata:
      labels:
        app: nginx-pod
    spec:
      containers:
      - name: nginx
        image: nginx:1.17.1
        ports:
        - containerPort: 80
```
### SVC-clusterIP
```yaml
apiVersion: v1
kind: Service
metadata:
  namespace: test-es
  name: ng-svc
  labels:
    app: nginx-svc
spec:
  ports:
  - port: 80
    name: web
  selector:
    app: nginx-pod
```
### SVC-Headless
```yaml
apiVersion: v1
kind: Service
metadata:
  namespace: test-es
  name: ng-svc-headless
  labels:
    app: nginx-svc
spec:
  ports:
  - port: 80
    name: web
  clusterIP: None
  selector:
    app: nginx-pod
```

### 结论
> `headless`与`clusterIP`区别在于,当向`clusterIP`发起请求时,`kube-proxy`,一个`clusterIP`,然后通过这个`clusterIP`向后端负载均衡
> 而`Headless`确实不走`kube-proxy`,直接由`dns`返回后端`pod`的`IP`
> 而且在`StatefulSet`中可以通过域名访问到每一个`pod`


### 过程
> 将以上`manifest`应用一下,在此名称空间下,找到一个可以`curl`和`ping`的pod,
> 在进行实验时,需要修改每个`pod`下`/usr/share/nginx/html/index.html`,将其修改为具有标识性的内容

```shell
[elasticsearch@test-master-0 ~]$ curl ng-svc
2
[elasticsearch@test-master-0 ~]$ curl ng-svc
1
[elasticsearch@test-master-0 ~]$ curl ng-svc
3
```
> 先对`clusterIP`进行访问,可以访问得到

```shell
[elasticsearch@test-master-0 ~]$ curl ng-svc-headless
1
[elasticsearch@test-master-0 ~]$ curl ng-svc-headless
2
[elasticsearch@test-master-0 ~]$ curl ng-svc-headless
3
```
> 再对`headless`进行访问,也可以访问得到


```shell
lasticsearch@test-master-0 ~]$ ping ng-svc-headless
PING ng-svc-headless.test-es.svc.cluster.local (10.42.248.158) 56(84) bytes of data.
64 bytes from 10-42-248-158.ng-svc.test-es.svc.cluster.local (10.42.248.158): icmp_seq=1 ttl=62 time=0.337 ms
[elasticsearch@test-master-0 ~]$ ping ng-svc-headless
PING ng-svc-headless.test-es.svc.cluster.local (10.42.20.6) 56(84) bytes of data.
64 bytes from 10-42-20-6.ng-svc.test-es.svc.cluster.local (10.42.20.6): icmp_seq=1 ttl=62 time=0.463 ms
[elasticsearch@test-master-0 ~]$ ping ng-svc-headless
PING ng-svc-headless.test-es.svc.cluster.local (10.42.160.180) 56(84) bytes of data.
64 bytes from 10-42-160-180.ng-svc.test-es.svc.cluster.local (10.42.160.180): icmp_seq=1 ttl=62 time=0.259 ms
```
> 对`headless`进行`ping`,可以得到后端的`IP`



```shell
[elasticsearch@test-master-0 ~]$ ping ng-svc
PING ng-svc.test-es.svc.cluster.local (10.43.12.65) 56(84) bytes of data.
```
> 对`Cluster`进行访问,可以得到`ClusterIP`而无法得到后端`podIP`
```shell
[root@cq49 ~]# kubectl get svc -n test-es ng-svc
NAME     TYPE        CLUSTER-IP    EXTERNAL-IP   PORT(S)   AGE
ng-svc   ClusterIP   10.43.12.65   <none>        80/TCP    21m
```



### StatefulSet
> 在进行实验时,需要修改每个`pod`下`/usr/share/nginx/html/index.html`,将其修改为具有标识性的内容


这样就可以通过域名来对应一个个的`pod`,如果在他们`sts`内部,还可以不使用`svcName`,直接使用`podName`去访问`pod`
```shell
[elasticsearch@test-master-0 ~]$ curl ng-sts-0.ng-svc-headless
1
[elasticsearch@test-master-0 ~]$ curl ng-sts-1.ng-svc-headless
2
[elasticsearch@test-master-0 ~]$ curl ng-sts-2.ng-svc-headless
3
```
