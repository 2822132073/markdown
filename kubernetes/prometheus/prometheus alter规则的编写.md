```yaml
groups:
- name: example
  rules:
  - alert: HighRequestLatency
    expr: job:request_latency_seconds:mean5m{job="myjob"} > 0.5
    for: 10m
    labels:
      severity: page
    annotations:
      summary: High request latency
```

> alterRule规则的设置在groups下的一个元素的列表之中,其中可以看到,一个alterRule规则可以包含几个关键字:
>
> - **alter**: 告警的名字,这个将会出现在label中,以`alertname=***`的形式
> - **expr**:触发表示式
> - **for**:当报警持续发生多长时间时发出告警到altermanager
> - **labels**:告警的标签,用于区分告警的种类和来源,任何现有的冲突标签都将被覆盖。标签值可以在模板中使用
> - **annotations**:可用于存储更长的附加信息，如警告描述或运行簿链接。注释值在模板中使用

> 一个alter的label来源于alterRule配置的label,还有使用的指标自带的label,指标自带的label,会自动加入alter的label