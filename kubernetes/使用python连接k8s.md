# 使用python连接k8s

## 通过`ServiceAccount`进行连接

```python
KubernetesObj = kubernetes.client.Configuration()
KubernetesObj.host = 'https://YOUR-APISERVER-ADDRESS:6443'
KubernetesObj.api_key['authorization'] = "YOUR-TOKEN"
KubernetesObj.verify_ssl = False
KubernetesObj.api_key_prefix['authorization'] = 'Bearer'
v1 = kubernetes.client.AppsV1Api(kubernetes.client.ApiClient(KubernetesObj))
```

> 这里的`YOUR-TOKEN`为`kubernetes`中的`Serviceaccounts`的`Secret`的`Token`,经过base64 位解码后再的数据

```shell
kubectl -n kube-system get secret {Service-Account Token} -o jsonpath={.data.token} | base64 -d
```





## 通过config进行连接

> 也可以使用kubelet使用的配置进行连接,只需要将这个文件拷贝出来进行了,一般在`/root/.kube/config`

```python
config.kube_config.load_kube_config(config_file=".\kubeconfig.yaml")
config.load_config()
print(config)
v1 = client.CoreV1Api()
```

