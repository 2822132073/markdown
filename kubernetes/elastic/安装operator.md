[官方文档](https://www.elastic.co/guide/en/cloud-on-k8s/current/k8s-deploy-eck.html)

安装crd资源

```bash
kubectl create -f https://download.elastic.co/downloads/eck/2.5.0/crds.yaml
```

下面这些资源将会被创建

```bash
customresourcedefinition.apiextensions.k8s.io/agents.agent.k8s.elastic.co created
customresourcedefinition.apiextensions.k8s.io/apmservers.apm.k8s.elastic.co created
customresourcedefinition.apiextensions.k8s.io/beats.beat.k8s.elastic.co created
customresourcedefinition.apiextensions.k8s.io/elasticmapsservers.maps.k8s.elastic.co created
customresourcedefinition.apiextensions.k8s.io/elasticsearches.elasticsearch.k8s.elastic.co created
customresourcedefinition.apiextensions.k8s.io/enterprisesearches.enterprisesearch.k8s.elastic.co created
customresourcedefinition.apiextensions.k8s.io/kibanas.kibana.k8s.elastic.co created
```

声明rbac和operator相关

```bash
kubectl apply -f https://download.elastic.co/downloads/eck/2.5.0/operator.yaml
```

