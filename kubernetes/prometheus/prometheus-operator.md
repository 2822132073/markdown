prometheus-operator一共自定义了这些crd资源

- **`Prometheus`**:定义了想要的Prometheus实例的状态
- **`Alertmanager`**:定义想要的AlertManager状态。
- `ThanosRuler`:定义所需的Thanos规则。
- **`ServiceMonitor`**:该定义说明了如何监视Kubernetes服务,operator会根据API服务器中对象的当前状态自动生成**Prometheus**的**scrape_configs**配置。
- **`PodMonitor`**:它以声明的方式指定如何监视pod组。Operator根据API服务器中对象的当前状态自动生成Prometheus的**scrape_configs**配置。
- `Probe`:声明式地指定应如何监视ingress对象或静态目标。Operator根据定义自动生成Prometheus**scrape_configs** 配置。
- **`PrometheusRule`**:定义一组所需的Prometheus警报或记录规则。operator生成一个规则文件，Prometheus实例可以使用该文件。
- **`AlertmanagerConfig`**:配置Altermanager的相关配置

我现在在用的只有

- **prometheus**:生成prometheus的pod实例,然后可以关联**Alertmanager**,**ServiceMonitor**,**PodMonitor**,**PrometheusRule**
- **Alertmanager**:生成Altermanager实例,还可以关联AlertmanagerConfig
- **ServiceMonitor**:定义将采集k8s中哪些svc的数据,通过label去选取
- **PodMonitor**:定义将采集k8s中哪些pod的数据,通过label去选取
- **PrometheusRule**:定义record规则和alter规则,相当于原来的prometheus配置文件
- **AlertmanagerConfig**:定义altermanager配置文件,配置报警信息将会发到哪里去

PrometheusRule有两种规则

- **record**:record规则使您可以预先计算需要很长时间或计算量很大的表达式，并将其结果保存为新的时间序列。然后，查询预定的结果通常比每次需要时执行原始表达式要快得多。[官方文档](https://prometheus.io/docs/prometheus/latest/configuration/recording_rules)
- **alter**:alter规则允许您基于Prometheus表达式语言表达式定义警报条件，并将有关触发警报的通知发送到外部服务。每当警报表达式在给定时间点导致一个或多个alter规则触发时,这个规则将会被视为活动。[官方文档](https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules)



![img](https://cdn.jsdelivr.net/gh/2822132073/image/202301071941244.png)

> 通过上图可以看出,prometheus资源对象根据`spec.alerting.alertmanagers.name`去匹配`alertmanager`对象,再通过`spec.ruleSelector`去匹配对应的**PrometheusRule**,通过`spec.serviceMonitorSelector`来对`serviceMonitor`的匹配,至于`serviceMonitorSelector`去匹配**svc**则是通过相应的**label**.
>
> > 这里特别说明一下,当**\*\*Selector** 为 {}时:
> >
> > ![image-20230107235603474](https://cdn.jsdelivr.net/gh/2822132073/image/202301072356792.png)
> >
> > 意思是匹配所有对象

![custom-metrics-elements.png](https://cdn.jsdelivr.net/gh/2822132073/image/202301081205892.png)

> 这个图是prometheus官网给的图,可以通过图中可以看到,都是通过label进行匹配的