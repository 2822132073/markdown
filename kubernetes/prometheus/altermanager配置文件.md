>  前面有写到,alertmanager的功能有分组,抑制,静默三种功能下面就来介绍这三种功能,以及他的路由与发送功能

```yaml
# 全局配置项
global: 
  resolve_timeout: 5m #处理超时时间，默认为5min
  smtp_smarthost: 'smtp.sina.com:25' # 邮箱smtp服务器代理
  smtp_from: '******@sina.com' # 发送邮箱名称
  smtp_auth_username: '******@sina.com' # 邮箱名称
  smtp_auth_password: '******' # 邮箱密码或授权码
  wechat_api_url: 'https://qyapi.weixin.qq.com/cgi-bin/' # 企业微信地址


# 定义模板信心
templates:
  - 'template/*.tmpl'

# 定义路由树信息
route:
  group_by: ['alertname'] # 报警分组依据
  group_wait: 10s # 最初即第一次等待多久时间发送一组警报的通知
  group_interval: 10s # 在发送新警报前的等待时间
  repeat_interval: 1m # 发送重复警报的周期 对于email配置中，此项不可以设置过低，否则将会由于邮件发送太多频繁，被smtp服务器拒绝
  receiver: 'email' # 发送警报的接收者的名称，以下receivers name的名称

# 定义警报接收者信息
receivers:
  - name: 'email' # 警报
    email_configs: # 邮箱配置
    - to: '******@163.com'  # 接收警报的email配置
      html: '{{ template "test.html" . }}' # 设定邮箱的内容模板
      headers: { Subject: "[WARN] 报警邮件"} # 接收邮件的标题
    webhook_configs: # webhook配置
    - url: 'http://127.0.0.1:5001'
    send_resolved: true
    wechat_configs: # 企业微信报警配置
    - send_resolved: true
      to_party: '1' # 接收组的id
      agent_id: '1000002' # (企业微信-->自定应用-->AgentId)
      corp_id: '******' # 企业信息(我的企业-->CorpId[在底部])
      api_secret: '******' # 企业微信(企业微信-->自定应用-->Secret)
      message: '{{ template "test_wechat.html" . }}' # 发送消息模板的设定
inhibit_rules: 
  - source_match: 
     severity: 'critical' 
    target_match: 
     severity: 'warning' 
    equal: ['alertname', 'dev', 'instance']

```



```yaml

global:
  # 邮箱相关配置
  smtp_smarthost: 'localhost:25'
  smtp_from: 'alertmanager@example.org'
  smtp_auth_username: 'alertmanager'
  smtp_auth_password: 'password'

# 通知模板文件目录
templates:
  - '/etc/alertmanager/template/*.tmpl'

# route根节点,每个alter都会经过的节点
route:
  # 传入警报分组所依据的标签。例如，针对cluster=A和alertname=LatencyHigh传入的多个警报将被分到处理到单个组中,相当于mysql中的group by
  #
  # 要按所有可能的标签进行聚合，请使用“...”作为唯一的标签名称。这相当于没有进行聚合，按原样传递所有警报。这一般是不可能的，除非您的警报量非常低，或者上游通知系统执行自己的分组。 Example: group_by: [...]
  group_by: ['alertname', 'cluster', 'service']

  # 当一个新组被进入的alert创建时,等待最少group_wait的时间再发送通知
  # 这种方式可以收到同一组短时间内一起触发的alert,而不会发很多次
  group_wait: 30s

  # 当第一组通知被发送后,第二组将会间隔group_interval再次发送
  group_interval: 5m

  # 如果警报已成功发送，请等待repeat_interval重新发送警报。
  repeat_interval: 3h

  # 设置默认的接受者
  receiver: team-X-mails

  # 上述所有属性都由所有子路由继承，并且可以在每个子路由上覆盖。

  # 子路由树
  routes:
    # 此路由对警报标签执行正则表达式匹配，以捕获与service列表相关的警报。
    - matchers:
        - service=~"foo1|foo2|baz"
      receiver: team-X-mails
      # 该服务有一个用于关键警报的子路由，任何不匹配的警报，即severity="critical"，回退到父节点并发送到“team-X-mails”,如果匹配将被发送到team-X-pager
      routes:
        - matchers:
            - severity="critical"
          receiver: team-X-pager
          
          
          
    - matchers:
        - service="files"
      receiver: team-Y-mails

      routes:
        - matchers:
            - severity="critical"
          receiver: team-Y-pager

    # 此路由处理来自数据库服务的所有警报。如果没有团队来处理它，则默认为数据库团队。
    - matchers:
        - service="database"
      receiver: team-DB-pager
      # 此外，还按受影响的数据库对警报进行分组。
      group_by: [alertname, cluster, database]
      routes:
        - matchers:
            - owner="team-X"
          receiver: team-X-pager
          # continue被设置为true,还回去匹配下面的路由
          continue: true
        - matchers:
            - owner="team-Y"
          receiver: team-Y-pager


# Inhibition rules 允许禁止一组alert当另外一组alert发生时
# 如果一些危险级别的alert发生,可以用这些去禁止一些警告级别的通知
inhibit_rules:
  - source_matchers: [severity="critical"]
    target_matchers: [severity="warning"]
# 注意,这里的equal指的是: 指定标签值在两个alert都相等的话,就可以进行抑制
# 例如: {altername="test1",cluster="k8s-1",service="example",severity="critical"}
#	    {altername="test1",cluster="k8s-1",service="example",severity="warning"}
# 这两个alert就可以相互进行抑制,其中一个值不可以,也就是第二个就可以抑制第一个
    equal: [alertname, cluster, service]


receivers:
  - name: 'team-X-mails'
    email_configs:
      - to: 'team-X+alerts@example.org'

  - name: 'team-X-pager'
    email_configs:
      - to: 'team-X+alerts-critical@example.org'
    pagerduty_configs:
      - service_key: <team-X-key>

  - name: 'team-Y-mails'
    email_configs:
      - to: 'team-Y+alerts@example.org'

  - name: 'team-Y-pager'
    pagerduty_configs:
      - service_key: <team-Y-key>

  - name: 'team-DB-pager'
    pagerduty_configs:
      - service_key: <team-DB-key>
```

> 这个示例配置文件是官方给的,以后要用的时候,还是可以给一个参考作用的,还有相关receivers的配置,就需要实践得出,不想浪费时间在这个上面,一般网上都有教程