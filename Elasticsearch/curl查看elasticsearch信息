# Es的REST接口
## [官网](https://www.elastic.co/guide/en/elasticsearch/reference/current/rest-apis.html)



## 用curl命令操作elasticsearch
### 第一：_cat系列
> _cat系列提供了一系列查询elasticsearch集群状态的接口。你可以通过执行
curl -XGET localhost:9200/_cat
获取所有_cat系列的操作
```
/_cat/allocation
/_cat/shards
/_cat/shards/{index}
/_cat/master
/_cat/nodes
/_cat/indices
/_cat/indices/{index}
/_cat/segments
/_cat/segments/{index}
/_cat/count
/_cat/count/{index}
/_cat/recovery
/_cat/recovery/{index}
/_cat/health
/_cat/pending_tasks
/_cat/aliases
/_cat/aliases/{alias}
/_cat/thread_pool
/_cat/plugins
/_cat/fielddata
/_cat/fielddata/{fields}
```
你也可以后面加一个v，让输出内容表格显示表头，举例
> curl -XGET localhost:9200/_cat/allocation?v
```
ip            heap.percent ram.percent cpu load_1m load_5m load_15m node.role  master name
192.168.6.245           30          98   7    0.29    0.60     0.65 cdfhilrstw -      k8s-node-1
192.168.6.247           44          95   4    0.80    0.44     0.31 ilmr       *      rancher
192.168.6.246           49          47   5    0.76    0.67     0.44 ilr        -      k8s-node-2
```
### 第二：_cluster系列
#### 1、查询设置集群状态
```shell
curl -XGET localhost:9200/_cluster/health?pretty=true
pretty=true表示格式化输出
level=indices 表示显示索引状态
level=shards 表示显示分片信息
```
| 命令 | 作用 |
| - | - |
| curl -XGET localhost:9200/_cluster/stats?pretty=true | 显示集群系统信息，包括CPU JVM等等 |
| curl -XGET localhost:9200/_cluster/state?pretty=true | 集群的详细信息。包括节点、分片等。|
| curl -XGET localhost:9200/_cluster/pending_tasks?pretty=true | 获取集群堆积的任务 |

 2、修改集群配置
举例：
```json
curl -XPUT localhost:9200/_cluster/settings -d '{
    "persistent" : {
        "discovery.zen.minimum_master_nodes" : 2
    }
}'
```
### 第三：_nodes系列
#### 1、查询节点的状态
```shell
curl -XGET ‘http://localhost:9200/_nodes/stats?pretty=true’
curl -XGET ‘http://localhost:9200/_nodes/192.168.1.2/stats?pretty=true’
curl -XGET ‘http://localhost:9200/_nodes/process’
curl -XGET ‘http://localhost:9200/_nodes/_all/process’
curl -XGET ‘http://localhost:9200/_nodes/192.168.1.2,192.168.1.3/jvm,process’
curl -XGET ‘http://localhost:9200/_nodes/192.168.1.2,192.168.1.3/info/jvm,process’
curl -XGET ‘http://localhost:9200/_nodes/192.168.1.2,192.168.1.3/_all
curl -XGET ‘http://localhost:9200/_nodes/hot_threads
```
### 第四：索引操作
#### 1、获取索引
> curl -XGET ‘http://localhost:9200/{index}/{type}/{id}’
#### 2、索引数据
> curl -XPOST ‘http://localhost:9200/{index}/{type}/{id}’ -d'{“a”:”avalue”,”b”:”bvalue”}’
#### 3、删除索引
> curl -XDELETE ‘http://localhost:9200/{index}/{type}/{id}’
#### 4、设置mapping
> curl -XPUT http://localhost:9200/{index}/{type}/_mapping -d '{
  "{type}" : {
	"properties" : {
	  "date" : {
		"type" : "long"
	  },
	  "name" : {
		"type" : "string",
		"index" : "not_analyzed"
	  },
	  "status" : {
		"type" : "integer"
	  },
	  "type" : {
		"type" : "integer"
	  }
	}
  }
}'
### 5、获取mapping
> curl -XGET http://localhost:9200/{index}/{type}/_mapping
### 6、搜索

> curl -XGET 'http://localhost:9200/{index}/{type}/_search' -d '{
    "query" : {
        "term" : { "user" : "kimchy" } //查所有 "match_all": {}
    },
	"sort" : [{ "age" : {"order" : "asc"}},{ "name" : "desc" } ],
	"from":0,
	"size":100
}
curl -XGET 'http://localhost:9200/{index}/{type}/_search' -d '{
    "filter": {"and":{"filters":[{"term":{"age":"123"}},{"term":{"name":"张三"}}]},
	"sort" : [{ "age" : {"order" : "asc"}},{ "name" : "desc" } ],
	"from":0,
	"size":100
}
