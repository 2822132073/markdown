# elasticsearch在k8s中开启`X-pack`

[TOC]
## 1.生成`ca`和`cert`
> 可以不生成证书,用之前生成的,但是证书不能有密码,也可以不使用证书,如果不添加证书,就不需要第2,3步
>
> 此步可以在容器中执行,或者找一台有es的机器执行

> 此步需要使用前面`es`中的命令,需要进入容器中进行
> 此时的`elasticsearch.yml`是这样的:
> ```yaml
> apiVersion: v1
kind: ConfigMap
metadata:
  labels:
    cattle.io/creator: norman
  name: test-master-config
  namespace: test-es
data:
  elasticsearch.yml: |-
    indices.memory.index_buffer_size: 30%
    http.cors.enabled: true
    http.cors.allow-origin: "*"

需要进入容器下执行以下命令
```shell
elasticsearch-certutil ca --out elastic-stack-ca.p12 --pass "" --days 3650
elasticsearch-certutil cert --ca elastic-stack-ca.p12 --out elastic-certificates.p12 --pas "" --days 3650 --ca-pass ""
```
`--out`:输出文件名
`--pass`:密码
`--days`:`ca`有效期
`--ca-pass`:`ca`的密码
将`ca`和`cert`从容器中复制出来
```shell
kubectl cp <ns>/<pod>:/usr/share/elasticsearch/elastic-stack-ca.p12 ./elastic-stack-ca.p12
kubectl cp <ns>/<pod>:/usr/share/elasticsearch/elastic-certificates.p12 ./elastic-certificates.p12
```
再将这两个证书制作成`cm`
```shell
kubectl create cm -n <ns>  elasticsearch-cert --from-file=elastic-certificates.p12
kubectl create cm -n <ns> elasticsearch-ca --from-file=elastic-stack-ca.p12
```

## 3.将`ca`和`cert`制作成`cm`,并将其挂载到容器中
> 这里只需要修改`sts`的`manifest`就可以了
> ```yaml
>       volumes:
>       - configMap:
>           defaultMode: 420
>           name: elasticsearch-ca
>         name: es-ca
>       - configMap:
>           defaultMode: 420
>           name: elasticsearch-cert
>         name: es-cert
> 
> ```
> ```yaml
>         volumeMounts:
>         - mountPath: /usr/share/elasticsearch/data
>           name: locales-master
>         - mountPath: /usr/share/elasticsearch/config/elasticsearch.yml
>           name: esconfig
>           subPath: elasticsearch.yml
>         - mountPath: /usr/share/elasticsearch/config/elastic-certificates.p12
>           name: es-cert
>           subPath: elastic-certificates.p12
>         - mountPath: /usr/share/elasticsearch/config/elastic-stack-ca.p12
>           name: es-ca
> 



## 4.修改`readinessProbe`

> 如果不修改`readinessProbe`,es将无法启动,因为es在k8s中运行,解析时需要用到`svc`,
> 现在es开启了`X-pack`,每次请求都需要用到`User`和`Password`,而现在还没有用户创建,而原来的`readinessProbe`的判断条件为`http_code`为`200`才判定为就绪状态,而现在无法达到这个状态,所以`pod`无法就绪,`svc`的`endpoint`无法将`pod`添加到其中,es无法扫描到集群中的`master`节点,集群就无法启动,所以需要修改`readinessProbe`的判断条件,将`http_code`为`401`也判断为就绪,这样集群才能启动,可以在创建用户后再修改回来
> ```shell
                  elif [[ ${HTTP_CODE} == "401" ]];then
                       exit 0

>   这里启动探针需要修改所有节点




## 5.修改`elasticsearch.yml`
> ### 添加证书的配置文件
```shell
apiVersion: v1
kind: ConfigMap
metadata:
  labels:
    cattle.io/creator: norman
  name: test-master-config
  namespace: <ns>
data:
  elasticsearch.yml: |-
    indices.memory.index_buffer_size: 30%
    http.cors.enabled: true
    http.cors.allow-origin: "*"
    discovery.zen.ping_timeout: 60s
    xpack.security.enabled: true
    xpack.security.transport.ssl.enabled: true
    xpack.security.transport.ssl.verification_mode: certificate
    xpack.security.transport.ssl.client_authentication: required
    xpack.security.transport.ssl.keystore.path: elastic-certificates.p12
    xpack.security.transport.ssl.truststore.path: elastic-certificates.p12
```
> ### 不添加证书的配置文件
```shell
apiVersion: v1
kind: ConfigMap
metadata:
  labels:
    cattle.io/creator: norman
  name: test-master-config
  namespace: <ns>
data:
  elasticsearch.yml: |-
    indices.memory.index_buffer_size: 30%
    http.cors.enabled: true
    http.cors.allow-origin: "*"
    discovery.zen.ping_timeout: 60s
    xpack.security.enabled: true
    xpack.security.transport.ssl.enabled: true
```
## 6.创建用户
> 在创建用户之前,需要等待集群状态为健康

> 交互式
  ```shell
bin/elasticsearch-setup-passwords interactive
```
自动生成密码

bin/elasticsearch-setup-passwords auto
```

## 7.修改之前修改的`readinessProbe`
> 现在创建用户后,我们可以将之前的`readinessProbe`修改回来,再将添加环境变量`ELASTIC_USERNAME`和`ELASTIC_PASSWORD`
> 这样es就可以将可以正常了

## 8.配置`kibana`的配置文件,并将其挂载到容器中

> 这是`kibana.yml`配置文件
> ```shell
> kubectl create cm -n <ns> kibana-cm --from-file=kibana.yml
> ```
> ```yaml
> elasticsearch.username: kibana_system
> elasticsearch.password: <kibana_system-password>
> server.host: "0"
> server.shutdownTimeout: "5s"
> ```
> 将配置文件挂载进去,需要修改一下地方
> ```yaml
> volumeMounts:
> - mountPath: /usr/share/kibana/config/kibana.yml
>   name: cm
>   subPath: kibana.yml
> volumes:
>   - configMap:
>     defaultMode: 420
>     name: kibana-cm
>   name: cm
> ```
> 
>设置完成以后,可以使用`elastic`用户登录
