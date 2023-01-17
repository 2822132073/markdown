# 安装elastic-operator

[官网](https://www.elastic.co/guide/en/cloud-on-k8s/current/k8s-deploy-eck.html)

```bash
kubectl create -f https://download.elastic.co/downloads/eck/2.6.1/crds.yaml
kubectl apply -f https://download.elastic.co/downloads/eck/2.6.1/operator.yaml
```

> 一个写的是crd资源,一个是operator相关文件

## 部署es

**[配置文档](https://www.elastic.co/guide/en/cloud-on-k8s/current/k8s-elasticsearch-specification.html)**

> 现在只需要去定义一个Elasticsearch资源就可以,operator就会自己去生成相关资源

```yml
apiVersion: elasticsearch.k8s.elastic.co/v1
kind: Elasticsearch
metadata:
  name: log  #集群的名字
  namespace: elastic-system
spec:
  version: 8.2.3 #es的版本
  nodeSets: # 下面可以写许多组节点,
  - name: master  # 一组节点的名字
    count: 1
    config:  #这组节点所有都是这个配置文件
      node.roles: ["master"]   # 7.9之后可以这样写,可以设置多个角色
      node.store.allow_mmap: false
    volumeClaimTemplates:  #配置卷模板
    - metadata:
        name: elasticsearch-data # 这个不能修改,除非修改其引用的名称
      spec:
        accessModes:
        - ReadWriteOnce
        resources:
          requests:
            storage: 20Gi
        storageClassName: nfs-client
  - name: data
    count: 3
    config:
      node.roles: ["data"]
    volumeClaimTemplates:
    - metadata:
        name: elasticsearch-data # Do not change this name unless you set up a volume mount for the data path.
      spec:
        accessModes:
        - ReadWriteOnce
        resources:
          requests:
            storage: 20Gi
        storageClassName: nfs-client
        
        
```

> 部署完成,之后然后获取密码

```bash
PASSWORD=$(kubectl get secret -n elastic-system log-es-elastic-user -o go-template='{{.data.elastic | base64decode}}')
IP=$(kubectl get svc -n elastic-system  log-es-http -o go-template='{{.spec.clusterIP}}')
curl -u "elastic:$PASSWORD" -k "https://$IP:9200/_cluster/health?pretty"
{
  "cluster_name" : "log",
  "status" : "green",
  "timed_out" : false,
  "number_of_nodes" : 4,
  "number_of_data_nodes" : 3,
  "active_primary_shards" : 10,
  "active_shards" : 20,
  "relocating_shards" : 0,
  "initializing_shards" : 0,
  "unassigned_shards" : 0,
  "delayed_unassigned_shards" : 0,
  "number_of_pending_tasks" : 0,
  "number_of_in_flight_fetch" : 0,
  "task_max_waiting_in_queue_millis" : 0,
  "active_shards_percent_as_number" : 100.0
}
```

> 获取到密码和IP后查看时候部署成功

# 部署kibana

**[文档](https://www.elastic.co/guide/en/cloud-on-k8s/current/k8s-kibana.html)**

```yaml
apiVersion: kibana.k8s.elastic.co/v1
kind: Kibana
metadata:
  name: log
  namespace: elastic-system
spec:
  version: 8.2.3
  config:
    i18n.locale: "zh-CN"  #配置中文,配置为追加,不是覆盖
  count: 1
  elasticsearchRef:
    name: log # 指向那个es机器
  http:
    service:
      spec:
        externalIPs:
        - 192.168.1.124
        ports:
          - name: http
            port: 80
            protocol: TCP
            targetPort: 5601
    tls:
      selfSignedCertificate:
        disabled: true  #需要关不不然无法进入
```

> 部署成功之后,可以直接访问,使用上面elastic用户的密码