Kubernetes的API SERVER会暴露API服务，Promethues集成了对Kubernetes的自动发现，它有5种模式：

- Node
- Service
- Pod
- Endpoints
- ingress

对于不同的模式,k8s会暴露不同的信息,这些信息以label的形式传到prometheus,promethues可以将这些信息重新根据规则进行重命名,让其变成哪些用户比较方便查看的形式,在原来prometheus的配置文件中,这些内容主要写在`scrape_configs`中,而现在使用`prometheus-operator`来进行部署,就不需要写配置文件,这些内容就写在`serviceMonitor`资源的`ServiceMonitor.spec.endpoints.relabelings`中,舒服的是,**ServiceMonitor**会自动的创建一些**scrape_configs**,不需要我们自己去写,具体的规则根据一下文件来解释,这个案例是在[prometheus-operator](https://github.com/prometheus-operator/prometheus-operator/blob/main/Documentation/user-guides/getting-started.md)中的一个getStart示例,可以去看ServiceMonitor的配置

下面是部署完成ServiceMonitor后自动生成的prometheus配置文件的一部分,也就是ServiceMonitor自动生成的部分

> 关于`relabel_configs`的相关配置有很多相同的例子,我只留下每类例子中的一个
>
> - replace(哪些会在label页面中出现,以及出现的内容)
> - keep(用于决定哪些target保留)
> - drop(用于决定哪些target丢弃)
>
> 这里只写一些常见的类型

```yaml
scrape_configs:  
- job_name: serviceMonitor/default/example-app/0   # 在prometheus的target页面显示的名字
  honor_timestamps: true  #如果为true,target暴露的时间将会被prometheus使用
  scrape_interval: 30s  # 多久抓取一次。
  scrape_timeout: 10s # 抓取失败的超时时间
  metrics_path: /metrics  # 抓取的路径
  scheme: http  #使用的协议
  follow_redirects: true # 当遇到3xx时,是否继续抓取
  relabel_configs:
  - source_labels: [__meta_kubernetes_service_label_app, __meta_kubernetes_service_labelpresent_app]  # 这里的source_labels指的就是下面给出数据的discoveredLabels的值
    separator: ; # 分隔符,就按照给个例子来说,上面的source_labels给出两个,所以说下面的regex也需要给出两个,那么就是用;分割两个表达式
    regex: (example-app);true
    replacement: $1 
    action: keep # 将丢弃哪些没有匹配到regex的target,也就是说,有多个action为kepp的配置,那么这些配置必须都被满足,还有一个action为drop,和这个作用相反
# 以上配置的意思就是,
# __meta_kubernetes_service_label_app=example-app && __meta_kubernetes_service_labelpresent_app= true 的target将会被保留
 - source_labels: [__meta_kubernetes_endpoint_address_target_kind, __meta_kubernetes_endpoint_address_target_name]
    separator: ;
    regex: Node;(.*)
    target_label: node
    replacement: ${1}  # 这里的${1}指的是regex匹配到的第一个组
    action: replace
 # 这个配置的意思是
 # 将__meta_kubernetes_endpoint_address_target_kind = Node 的 target,
 # 会将在web页面的该target中添加一个node的便签,他的值为__meta_kubernetes_endpoint_address_target_name的值
- source_labels: [__meta_kubernetes_endpoint_address_target_kind, __meta_kubernetes_endpoint_address_target_name]
    separator: ;
    regex: Pod;(.*)
    target_label: pod
    replacement: ${1}
    action: replace
 # 这个配置的意思是
 # __meta_kubernetes_endpoint_address_target_kind = pod 的 target,
 # 会将在web页面的该target中添加一个node的便签,他的值为__meta_kubernetes_endpoint_address_target_name的值
  - separator: ;
    regex: (.*)
    target_label: endpoint
    replacement: web
    action: replace
    # 像这种没有source_labels的配置,他的意思就是直接在web页面的Labels中添加一个key为endpoint,value为web的label
  - source_labels: [__address__]
    separator: ;
    regex: (.*)
    modulus: 1
    target_label: __tmp_hash
    replacement: $1
    action: hashmod
  kubernetes_sd_configs:
  
  
# 官方文档中可以看许多东西 #https://prometheus.io/docs/prometheus/latest/configuration/configuration/#kubernetes_sd_config
  - role: endpoints # 这个配置的是这个是什么角色,不同的角色会有不同的
    kubeconfig_file: ""
    follow_redirects: true
    namespaces:
      names:
      - default  # 指定是哪个名称空间
```

> 上面的配置就是根据这些数据来做的

```json
{
  "discoveredLabels": {
    "__address__": "172.17.247.35:8080",
    "__meta_kubernetes_endpoint_address_target_kind": "Pod",
    "__meta_kubernetes_endpoint_address_target_name": "example-app-7cdbf89849-z8dsv",
    "__meta_kubernetes_endpoint_node_name": "node-2",
    "__meta_kubernetes_endpoint_port_name": "web",
    "__meta_kubernetes_endpoint_port_protocol": "TCP",
    "__meta_kubernetes_endpoint_ready": "true",
    "__meta_kubernetes_endpoints_label_app": "example-app",
    "__meta_kubernetes_endpoints_labelpresent_app": "true",
    "__meta_kubernetes_endpoints_name": "example-app",
    "__meta_kubernetes_namespace": "default",
    "__meta_kubernetes_pod_annotation_cni_projectcalico_org_containerID": "93663438f46c6f76d50330a09f3bd7355c94bfdb06e507dfd54438321f6581ab",
    "__meta_kubernetes_pod_annotation_cni_projectcalico_org_podIP": "172.17.247.35/32",
    "__meta_kubernetes_pod_annotation_cni_projectcalico_org_podIPs": "172.17.247.35/32",
    "__meta_kubernetes_pod_annotationpresent_cni_projectcalico_org_containerID": "true",
    "__meta_kubernetes_pod_annotationpresent_cni_projectcalico_org_podIP": "true",
    "__meta_kubernetes_pod_annotationpresent_cni_projectcalico_org_podIPs": "true",
    "__meta_kubernetes_pod_container_name": "example-app",
    "__meta_kubernetes_pod_container_port_name": "web",
    "__meta_kubernetes_pod_container_port_number": "8080",
    "__meta_kubernetes_pod_container_port_protocol": "TCP",
    "__meta_kubernetes_pod_controller_kind": "ReplicaSet",
    "__meta_kubernetes_pod_controller_name": "example-app-7cdbf89849",
    "__meta_kubernetes_pod_host_ip": "172.16.1.115",
    "__meta_kubernetes_pod_ip": "172.17.247.35",
    "__meta_kubernetes_pod_label_app": "example-app",
    "__meta_kubernetes_pod_label_pod_template_hash": "7cdbf89849",
    "__meta_kubernetes_pod_labelpresent_app": "true",
    "__meta_kubernetes_pod_labelpresent_pod_template_hash": "true",
    "__meta_kubernetes_pod_name": "example-app-7cdbf89849-z8dsv",
    "__meta_kubernetes_pod_node_name": "node-2",
    "__meta_kubernetes_pod_phase": "Running",
    "__meta_kubernetes_pod_ready": "true",
    "__meta_kubernetes_pod_uid": "7f8d228c-0147-4168-89bb-db47f8b511b2",
    "__meta_kubernetes_service_label_app": "example-app",
    "__meta_kubernetes_service_labelpresent_app": "true",
    "__meta_kubernetes_service_name": "example-app",
    "__metrics_path__": "/metrics",
    "__scheme__": "http",
    "__scrape_interval__": "30s",
    "__scrape_timeout__": "10s",
    "job": "serviceMonitor/default/example-app/0"
  },
  "labels": {
    "container": "example-app",
    "endpoint": "web",
    "instance": "172.17.247.35:8080",
    "job": "example-app",
    "namespace": "default",
    "pod": "example-app-7cdbf89849-z8dsv",
    "service": "example-app"
  },
  "scrapePool": "serviceMonitor/default/example-app/0",
  "scrapeUrl": "http://172.17.247.35:8080/metrics",
  "globalUrl": "http://172.17.247.35:8080/metrics",
  "lastError": "",
  "lastScrape": "2023-01-06T13:29:25.245828881Z",
  "lastScrapeDuration": 0.019387708,
  "health": "up",
  "scrapeInterval": "30s",
  "scrapeTimeout": "10s"
}
```



**job_name的显示**

![image-20230106211719888](https://cdn.jsdelivr.net/gh/2822132073/image/202301062117390.png)



**使用action为replace的便签会出现的地方**

![image-20230106215402164](https://cdn.jsdelivr.net/gh/2822132073/image/202301062154504.png)



