```json
input {
  kafka {
    bootstrap_servers => "kafka-0-svc.logging.svc.cluster.local:31090,kafka-1-svc.logging.svc.cluster.local:31091,kafka-2-svc.logging.svc.cluster.local:31092"
    consumer_threads => 1
    group_id => "test-consumer-group"
    auto_offset_reset => "latest"
    decorate_events => true
    topics => ["logstash_nginxlog","logstash_systemlog","logstash_applog","pfsense","logstash_ceph","app-log-prod"]
    codec => json { charset => "UTF-8" }
  }
}
filter {
  if [app_name] {
    mutate { add_field => { "[@metadata][target_index]" => "%{[app_name]}-%{+YYYY.MM.dd}" } }
  }
}

filter {
  if [fields][type] == "nginxlog" {  
    if ([uri] =~ "^\/vip\/verify.html") {
      drop {}
    }
    if [fields][project] == "s-ixueshu-ng" {
      if ([uri] =~ "^\/cover\/") {
        drop {}
      }
      if ([uri] =~ "^\/visit_log.html") {
        drop {}
      }
      if ([uri] =~ "^\/favicon.ico") {
        drop {}
      }
      if (".js" in [uri]) {
        drop {}
      }
      if (".css" in [uri]) {
        drop {}
      }
      if (".png" in [uri]) {
        drop {}
      }
      if (".jpg" in [uri]) {
        drop {}
      }
    }
    json {
      source => "message"
    }
    mutate {
      convert => ["request_time", "float"]
      convert => ["upstream_response_time", "float"]
      convert => ["body_bytes_sent", "float"]
      remove_field => ["tags","beat","@version","offset"]
    }
    geoip {
      source => "remote_addr"
    }
    useragent {
      source => "http_user_agent"
      target => "ua"
    }
  }    
}

filter {
  if [fields][project] == "ceph-rgw" {
    grok {
      match => {
        "message" => [
        "%{TIMESTAMP_ISO8601:datetime} %{WORD:client_id}  %{NUMBER:client_level} %{WORD:web_engine}: %{WORD:req_id}: %{IPV4:client_ip} - - \[%{HTTPDATE:timestamp}\] \"%{WORD:verb} %{URIPATHPARAM:uri} (HTTP/%{NUMBER:http_version})\" %{NUMBER:http_code} %{NUMBER} - %{GREEDYDATA:client}"
        ]
      }
    }
    date {
      match => [ "timestamp" , "dd/MMM/YYYY:HH:mm:ss Z" ]
      timezone => "Asia/Shanghai" 
    }
    if ("_grokparsefailure" in [tags]) {
      drop {}
    }
    mutate {
      remove_field => ["NUMBER","BASE10NUM"]
    }
  }
}

filter {
  if [fields][project] == "sshlog" {
    grok {
      match => { 
        "message" => [
          "%{SYSLOGBASE} (?=%{GREEDYDATA})%{WORD:status} password for ?(invalid user)? %{WORD:USER} from %{DATA:IP} port",
          "%{SYSLOGBASE} (?=%{GREEDYDATA})%{WORD:pam_module}\(%{NOTSPACE:pam_caller}\): session %{WORD:pam_session_state} for user %{USERNAME:username}(?: by %{GREEDYDATA:pam_by})?",
          "%{SYSLOGBASE} (?=%{GREEDYDATA:message})" 
        ]
      }
    }
    if ([status] == "Accepted") {
      mutate {
        add_tag => ["Success"]
      }
    }
    if ([status] == "Failed") {
      mutate {
        add_tag => ["Failed"]
      }
    }

    mutate {
      remove_field => ["SYSLOGBASE","SYSLOGFACILITY","facility","priority","logsource","IPORHOST"]
    }
  }
}

filter {
  if [fields][project] == "nginx_err" {
    grok {
      match => {
        "message" => ["(?<datetime>\d\d\d\d/\d\d/\d\d \d\d:\d\d:\d\d) \[%{WORD:errtype}] %{DATA} %{DATA:errinfo}, client: %{IP:clientip}, server: %{NOTSPACE:daemon}, request: \"%{WORD:method} %{URIPATHPARAM:uri} HTTP/%{NUMBER:httpversion}\", upstream: \"%{NOTSPACE:url}\", host: \"%{NOTSPACE:host}\"(, referrer: %{QS:referrer}|)"]
      }
    }
  }
}

filter {
  if [fields][project] == "paperyy-pc-applog" { 
    grok {
      match => {
        "message" => [
          "%{TIMESTAMP_ISO8601:datetime}( |  )%{NOTSPACE:loglevel} %{NUMBER:process} \[%{NOTSPACE:thread}\] --- %{NOTSPACE:class}"
         ]
      }
    }
    date{
        match => ["datetime", "ISO8601"]
        timezone => "Asia/Shanghai" 
     }
    mutate {
      remove_field => ["tags","beat","@version","offset"]
    }
  }    
}

filter {
  if [fields][project] == "pack-center-applog" { 
    grok {
      match => {
        "message" => [
          "%{TIMESTAMP_ISO8601:datetime}( |  )%{NOTSPACE:loglevel} %{NUMBER:process} --- \[%{NOTSPACE:thread} %{NOTSPACE}\] %{NOTSPACE:class}",
          "%{TIMESTAMP_ISO8601:datetime}( |  )%{NOTSPACE:loglevel} %{NUMBER:process} --- \[%{NOTSPACE:thread}\] %{NOTSPACE:class}"
         ]
      }
    }
    date{
        match => ["datetime", "ISO8601"]
        timezone => "Asia/Shanghai" 
     }
    mutate {
      remove_field => ["tags","beat","@version","offset"]
    }
  }    
}

filter {
  if [fields][project] == "dispatch-center-log" { 
    grok {
      match => {
        "message" => [
          "%{TIMESTAMP_ISO8601:datetime}( |  )%{NOTSPACE:loglevel} %{NUMBER:process} --- \[%{NOTSPACE:thread} %{NOTSPACE}\] %{NOTSPACE:class}",
          "%{TIMESTAMP_ISO8601:datetime}( |  )%{NOTSPACE:loglevel} %{NUMBER:process} --- \[%{NOTSPACE:thread}\] %{NOTSPACE:class}"
         ]
      }
    }
    date{
        match => ["datetime", "ISO8601"]
        timezone => "Asia/Shanghai" 
     }
    mutate {
      remove_field => ["tags","beat","@version","offset"]
    }
  }    
}

filter {
  if [fields][project] == "unite-payment-api-log" { 
    grok {
      match => {
        "message" => [
          "%{TIMESTAMP_ISO8601:datetime}( |  )%{NOTSPACE:loglevel} %{NUMBER:process} --- \[%{NOTSPACE:thread} %{NOTSPACE}\] %{NOTSPACE:class}",
          "%{TIMESTAMP_ISO8601:datetime}( |  )%{NOTSPACE:loglevel} %{NUMBER:process} --- \[%{NOTSPACE:thread}\] %{NOTSPACE:class}"
         ]
      }
    }
    date{
        match => ["datetime", "ISO8601"]
        timezone => "Asia/Shanghai" 
     }
    mutate {
      remove_field => ["tags","beat","@version","offset"]
    }
  }
}

filter {
  if [fields][project] == "taobao-api-log" { 
    grok {
      match => {
        "message" => [
          "%{TIMESTAMP_ISO8601:datetime}( |  )%{NOTSPACE:loglevel} %{NUMBER:process} --- \[%{NOTSPACE:thread} %{NOTSPACE}\] %{NOTSPACE:class}",
          "%{TIMESTAMP_ISO8601:datetime}( |  )%{NOTSPACE:loglevel} %{NUMBER:process} --- \[%{NOTSPACE:thread}\] %{NOTSPACE:class}"
         ]
      }
    }
    date{
        match => ["datetime", "ISO8601"]
        timezone => "Asia/Shanghai" 
     }
    mutate {
      remove_field => ["tags","beat","@version","offset"]
    }
  }
}

filter {
  if [fields][project] == "pfsense-snort" {
    grok {
      match => {
        "message" => [
          "%{DATESTAMP:datetime} ,%{NUMBER},%{NUMBER},%{NUMBER},%{QS:class},%{WORD:protocol},%{IP:source_ip},%{NUMBER:source_port},%{IP:dest_ip},%{NUMBER:dest_port},%{NUMBER}"
        ]
      }
    }
    date {
        match => ["datetime", "ISO8601"]
        timezone => "Asia/Shanghai" 
    }
  }
}

output {
  if [app_name] {
    elasticsearch {
      hosts => ["elasticsearch-ingest:9200"]
      index => "prod-%{[@metadata][target_index]}"
    }
  }
  if [fields][type] == "nginxlog" {
    elasticsearch {
      hosts => ["elasticsearch-ingest:9200"]
      index => "%{[fields][project]}-%{+YYYY.MM.dd}"
      template_overwrite => true
    }
  }
  if [fields][project] == "sshlog" {
    elasticsearch {
      hosts => ["elasticsearch-ingest:9200"]
      index => "sshlog"
      template_overwrite => true
    }
  }
  if [fields][project] == "openresty-oss-obs" {
    elasticsearch {
      hosts => ["elasticsearch-ingest:9200"]
      index => "%{[fields][project]}-%{+YYYY.MM.dd}"
      template_overwrite => true
    }
  }

  if [fields][project] == "pfsense-snort" {
    elasticsearch {
      hosts => ["elasticsearch-ingest:9200"]
      index => "%{[fields][project]}"
      template_overwrite => true
    }
  }

  if [fields][project] == "nginx_err" {
    elasticsearch {
      hosts => ["elasticsearch-ingest:9200"]
      index => "nginx_err-%{[host]}"
      template_overwrite => true

    }
  }
  if [fields][project] == "ceph-rgw" {
    elasticsearch {
      hosts => ["elasticsearch-ingest:9200"]
      index => "%{[fields][project]}-%{+YYYY.MM.dd}"
      template_overwrite => true
    }
  }
  if [fields][type] == "applog" {
    elasticsearch {
      hosts => ["elasticsearch-ingest:9200"]
      index => "%{[fields][project]}-%{+YYYY.MM.dd}"
      template_overwrite => true
    }
  }
}

```







```yaml
    filebeat.inputs:
    - type: log
      enabled: true
      paths:
        - /nas/openresty-bigan/logs/access.www.bigan.net.log
      fields:
        project: bigan-ng
        type: nginxlog
      json.keys_under_root: true
      json.overwrite_keys: true
      tail_files: true
      timeout: 10s
    - type: log
      enabled: true
      paths:
        - /nas/openresty-bigan/logs/access.admin.bigan.net.log
        - /nas/openresty-bigan/logs/access.dispatch.laibokeji.com.log
        - /nas/openresty-bigan/logs/access.sba.laibokeji.com.log
        - /nas/openresty-bigan/logs/access.gateway.jiangchong.api.laibokeji.com.log
        - /nas/openresty-bigan/logs/access.m.bigan.net.log
        - /nas/openresty-bigan/logs/access.tunionpay.ixueshu.com.log
        - /nas/openresty-bigan/logs/access.prometheus.laibokeji.com.log
        - /nas/openresty-bigan/logs/access.grafana.laibokeji.com.log
        - /nas/openresty-bigan/logs/access.reduce.api.laibokeji.com.access.log
        - /nas/openresty-bigan/logs/access.www.laibokeji.com.log
      fields:
        project: bigan-smallstation-nginx
        type: nginxlog
      json.keys_under_root: true
      json.overwrite_keys: true
      tail_files: true
      timeout: 10s
    - type: log
      enabled: true
      paths:
        - /nas/openresty-oss-obs-log/access.log
        - /nas/openresty-oss-obs-log/error.log
      fields:
        project: openresty-oss-obs
        type: nginxlog
      json.keys_under_root: true
      json.overwrite_keys: true
      tail_files: true
      timeout: 10s
    - type: log
      enabled: true
      paths:
        - /nas/openresty-paperyy/logs/*-access.www.paperyy.com.log
      fields:
        project: yy-ng
        server: yy_nginx_temp01
        type: nginxlog
      json.keys_under_root: true
      json.overwrite_keys: true
      tail_files: true
      timeout: 10s
    - type: log
      enabled: true
      paths:
        - /nas/openresty-paperyy/logs/*-access.www.paperyy.com.cn.log
        - /nas/openresty-paperyy/logs/*-access.www.paperyy.cn.log
      fields:
        project: yy.cn.yy.com.cn-ng
        server: yy_nginx_temp01
        type: nginxlog
      json.keys_under_root: true
      json.overwrite_keys: true
      tail_files: true
      timeout: 10s
    - type: log
      enabled: true
      paths:
        - /nas/openresty-paperyy/logs/*-checkonline.paperyy.com.log
      fields:
        project: checkonline-paperyy-ng
        server: yy_nginx_temp01
        type: nginxlog
      json.keys_under_root: true
      json.overwrite_keys: true
      tail_files: true
      timeout: 10s

    - type: log
      enabled: true
      paths:
        - /nas/openresty-paperyy/logs/access.bd.paperyy.com.log
        - /nas/openresty-paperyy/logs/*-checkrealtime.similar.api.laibokeji.com.log
        - /nas/openresty-paperyy/logs/access.huodong.paperyy.com.log
        - /nas/openresty-paperyy/logs/icheck.paperyy.com.log
        - /nas/openresty-paperyy/logs/google.paperyy.com.log
        - /nas/openresty-paperyy/logs/*-access.m.paperyy.com.log
        - /nas/openresty-paperyy/logs/taobao.paperyy.com.log
        - /nas/openresty-paperyy/logs/taobaoapi.paperyy.com.log
        - /nas/openresty-paperyy/logs/vipcnkli.paperyy.com.log
      fields:
        project: yy-smallstation-nginx
        type: nginxlog
      json.keys_under_root: true
      json.overwrite_keys: true
      tail_files: true
      timeout: 10s
    - type: log
      enabled: true
      paths:
        - /nas/openresty-ixueshu-hongkong/logs/access/www.ixueshu.com.log
      fields:
        project: ixueshu-ng
        type: nginxlog
      json.keys_under_root: true
      json.overwrite_keys: true
      tail_files: true
      timeout: 10s

    - type: log
      enabled: true
      paths:
        - /nas/openresty-ixueshu-hongkong/logs/access/s.ixueshu.com.log
      fields:
        project: s-ixueshu-ng
        type: nginxlog
      json.keys_under_root: true
      json.overwrite_keys: true
      tail_files: true
      timeout: 10s

    - type: log
      enabled: true
      paths:
        - /nas/openresty-ixueshu-hongkong/logs/access/wechat.ixueshu.com.log
      fields:
        project: wechat-ixueshu-ng
        type: nginxlog
      json.keys_under_root: true
      json.overwrite_keys: true
      tail_files: true
      timeout: 10s

    - type: log
      enabled: true
      paths:
        - /nas/openresty-ixueshu-hongkong/logs/access/book.ixueshu.com.log
      fields:
        project: book-ixueshu-ng
        type: nginxlog
      json.keys_under_root: true
      json.overwrite_keys: true
      tail_files: true
      timeout: 10s

    - type: log
      enabled: true
      paths:
        - /nas/openresty-ixueshu-hongkong/logs/access/adapi.ixueshu.com.log
        - /nas/openresty-ixueshu-hongkong/logs/access/admin-ai-write.ixueshu.com.log
        - /nas/openresty-ixueshu-hongkong/logs/access/ai-write.ixueshu.com.log
        - /nas/openresty-ixueshu-hongkong/logs/access/aliyun-tword.ixueshu.com.log
        - /nas/openresty-ixueshu-hongkong/logs/access/blacklist.ixueshu.com.log
        - /nas/openresty-ixueshu-hongkong/logs/access/cnki.ixueshu.com.log
        - /nas/openresty-ixueshu-hongkong/logs/access/ijiangchong.com.log
        - /nas/openresty-ixueshu-hongkong/logs/access/m.ixueshu.com.log
      fields:
        project: ixueshu-smallstation-nginx
        type: nginxlog
      json.keys_under_root: true
      json.overwrite_keys: true
      tail_files: true
      timeout: 10s
    output.kafka:
      enabled: true
      hosts: ["kafka-0-svc.logging.svc.cluster.local:31090","kafka-1-svc.logging.svc.cluster.local:31091","kafka-2-svc.logging.svc.cluster.local:31092"]
      topic: 'logstash_nginxlog'

```







```yaml
filebeat.inputs:
   - type: log
      enabled: true
      paths:
        - /nas/openresty-bigan/logs/access.www.bigan.net.log
      fields:
        project: gitlab
        type: applog
      json.keys_under_root: true
      json.overwrite_keys: true
      tail_files: true
      timeout: 10s
output.kafka:
   enabled: true
   hosts: ["kafka-0-svc.logging.svc.cluster.local:31090","kafka-1-svc.logging.svc.cluster.local:31091","kafka-2-svc.logging.svc.cluster.local:31092"]
   topic: 'logstash_nginxlog'
```

