**PromQL 简介**



[数据查询相关文档](https://prometheus.io/docs/prometheus/latest/querying/basics/)

Prometheus 通过指标名称（metrics name）以及对应的一组标签（labelset）唯一定义一条时间序列。指标名称反映了监控样本的基本标识，而 label 则在这个基本特征上为采集到的数据提供了多种特征维度。用户可以基于这些特征维度过滤，聚合，统计从而产生新的计算后的一条时间序列。

Prometheus 提供了一种称为 **PromQL** 的功能查询语言，使用户可以实时选择和汇总时间序列数据。表达式的结果可以显示为图形，可以在 Prometheus 的表达式浏览器中显示为表格数据，也可以由外部系统通过 HTTP API 使用。

在 Prometheus 的表达语言中，一个表达式或子表达式可以计算为以下四种类型之一：

- 瞬时向量（Instant vector）：一组时间序列，每个时间序列包含一个样本，所有样本共享相同的时间戳。
- 范围向量（Range vector）：一组时间序列，其中包含每个时间序列随时间变化的一系列数据点。
- 标量（Scalar）：一个简单的数字浮点值。
- 字符串（String）：一个简单的字符串值，目前未使用。

**PromQL 基本使用**

时间序列选择器

**瞬时向量选择器**

瞬时向量选择器允许在给定的时间戳上选择一组时间序列和每个样本的单个采样值，返回值中只会包含该时间序列中的最新的一个样本值。

当我们直接使用监控指标名称查询时，可以查询包含该 metric 名称的所有时间序列。以下两种表达方式是等同的：

```javascript
http_requests_total
http_requests_total{}
```

复制

该表达式会返回指标名称为 **http_requests_total** 的所有时间序列。

```javascript
http_requests_total{code="200",handler="alerts",instance="localhost:9090",job="prometheus",method="get"}=(20889@1518096812.326)
http_requests_total{code="200",handler="graph",instance="localhost:9090",job="prometheus",method="get"}=(21287@1518096812.326)
```

复制

通过在花括号 **{}** 中添加逗号分隔的标签匹配器列表，可以进一步过滤这些时间序列。

如果我们只需要查询所有 **http_requests_total** 时间序列中满足标签 job 为 prometheus 且 group 为 canary 的时间序列，可以使用如下表达式。

```javascript
http_requests_total{job="prometheus",group="canary"}
```

复制

PromQL 还支持用户根据时间序列的标签匹配模式来对时间序列进行过滤，目前主要支持两种匹配模式：完全匹配和正则匹配。

- 通过使用 **label=value** 可以选择那些标签满足表达式定义的时间序列
- 反之使用 **label!=value** 则可以根据标签匹配排除时间序列
- 使用 **label=~regx** 表示选择那些标签符合正则表达式定义的时间序列
- 反之使用 **label!~regx** 进行排除

例如，如果想查询多个环节下的时间序列序列可以使用如下表达式：

```javascript
http_requests_total{environment=~"staging|testing|development",method!="GET"}
```

复制

在标签匹配中如果指定标签值为空，会匹配所有不包含该标签的时间序列，同一标签名称可有多个匹配器。

向量选择器必须指定一个名称或至少一个与空字符串不匹配的标签匹配器。

以下表达式是非法的，

```javascript
{job=~".*"}
```

复制

相反，这些表达式是有效的，因为它们都有一个与空标签值不匹配的选择器。

```javascript
{job=~".+"}
{job=~".*",method="get"}
```

复制

标签匹配还以使用内部的  **__name__**  标签应用到 metric 名称，如 **http_requests_total** 等同于 **{__name__="http_requests_total"}**， 下面的表达式会筛选出所有以 **job：**开头的 metric，

```javascript
{__name__=~"job:.*"}
```

复制

另外 metric 名称不能包含以下关键字：**bool**，**on**，**ignoring**，**group_left** 和 **group_right** 可使用如下方式代替，

```javascript
{__name__="on"}
```

复制

Prometheus 中的所有正则表达式都使用 RE2 syntax.

RE2 syntax：

https://github.com/google/re2/wiki/Syntax

**区间向量选择器**

范围向量文字的工作方式与即时向量文字相同，不同之处在于，它们从当前瞬间选择了一定范围的样本。语法上，将范围持续时间附加在向量选择器末尾的方括号（[]）中，以指定应为每个结果范围向量元素提取多远的时间值。

区间向量表达式和瞬时向量表达式之间的差异在于在区间向量表达式中我们需要定义时间选择的范围，时间范围通过时间范围选择器 **[]** 进行定义。

时间范围选择器内容指定为数字，紧随其后的是以下单位之一：

- s - seconds
- m - minutes
- h - hours
- d - days
- w - weeks
- y - years

例如，如通过以下表达式可以选择最近 5 分钟内的所有样本数据：

```javascript
http_requests_total{job="prometheus"}[5m]
```

复制

**时间偏移**

在瞬时向量表达式或者区间向量表达式中，都是以当前时间为基准。

```javascript
http_request_total{} # 瞬时向量表达式，选择当前最新的数据
http_request_total{}[5m] # 区间向量表达式，选择以当前时间为基准，5分钟内的数据
```

复制

而如果我们想查询，5 分钟前的瞬时样本数据，或昨天一天的区间内的样本数据呢？这个时候我们就可以使用位移操作，可以使用 **offset** 时间位移操作：

```javascript
http_request_total{} offset 5m
http_request_total{}[1d] offset 1d
```

复制

需要注意的是 **offset** 关键词需要紧跟在选择器之后。

```javascript
sum(http_requests_total{method="GET"} offset 5m) // 正确
sum(http_requests_total{method="GET"}) offset 5m // 错误
```

复制

**存储设计原理简介**

时序数据的存储分俩个维度，如下图所示，纵轴表示所有存储的序列数据，横轴表示数据的时间分布：

![img](https://ask.qcloudimg.com/http-save/yehe-7053949/wqbtx0n5bw.png?imageView2/2/w/1620)

promutheus 会定期拉取数据，从横轴的右侧垂直写入数据, 而我们在执行查询的时候，往往是查询图中任意矩形区域的数据，时序数据的存储和读取模式有着很大的差异，为了同时满足写入和查询两种不同需求，对存储层的时间有比较高的要求，如果在 k8s 环境，由于 pod 不断的新建和重启，时序数据会变成如下图的线性分布，更是提高了存储和查询难度。

![img](https://ask.qcloudimg.com/http-save/yehe-7053949/jsg5mfelj4.png?imageView2/2/w/1620)

**样本数据压缩**

**Prometheus** 每秒会采集大量的数据，数据压缩势在必行，**Prometheus** 基于同一个序列的数据相似度比较高，在内存可以把每个数据点压缩到平均 1.37 byte 大小。

**时间分片**

**Prometheus** 的存储层把数据划分成了不同的块，如下图所示：

![img](https://ask.qcloudimg.com/http-save/yehe-7053949/h1qadad5gf.png?imageView2/2/w/1620)

每个块保存了在该时间段内的序列数据，每个数据块可以单独行使[数据库](https://cloud.tencent.com/solution/database?from=10680)行为，优点如下：

- 在指定一个时间范围时只需要查询其中一些子块，能有效的减少查询时间。
- 解决了由于服务不断的新建和重启，时间序列数据呈线性分布的问题。
- 更方便的根据时间删除过期数据。

**倒排索引**

通常情况下用户会根据标签检索数据，但是由于标签是用户自定义不同的应用会有不同的标签，因此不能像传统数据库一样在标签上建立索引，为了提高查询效率，因此 **Prometheus** 把每个时序的描述当作一个小文档，建立了倒排索引，如：**requests_total{path="/status",method="GET", instance="10.0.0.1:80"}** 的文档包含如下关键词：**__name__="requests_total"**，**path="/status"**，**method="GET"**，**instance="10.0.0.1:80**，对于每个时序数据唯一的 label 会为其建立额外的索引行，每个索引行对应一个有序的 ID 列表，每个 ID 对应一条时序数据，这些列表可高效的合并或相交，以满足复杂的查询场景。

**常用函数和操作符介绍**

rate

**rate** 是专门搭配 **counter** 类型数据使用的函数，计算范围向量中时间序列的每秒平均增长率，当 **counter** 出现单调性中断会自动进行调整，计算时会根据有效值在时间范围内的比例扩大时间区间范围，从而允许数据丢失或时间范围与数据拉取的时间段不完全对齐。

如：计算 job 为 api-server 的请求在 5m 内增长率。

```javascript
rate(http_requests_total{job="api-server"}[5m])
```

复制

irate

**irate** 适用于变化频率高的 **counter** 类型数据，计算范围向量中时间序列的每秒平均增长率。基于最后两个数据点。当 **counter** 出现单调性中断会自动进行调整，与 **rate** 不同的是，**irate** 只会选取时间范围内最近的两个点计算，当选定的时间范围内仅包含两个数据点时，不考虑外推情况，**rate** 和 **irate** 并无明显区别。

如：计算 job 为 api-server 的请求在 5m 内增长率。

```javascript
irate(http_requests_total{job="api-server"}[5m])
```

复制

predict_linear **predict_linear** 可用于 **gauges** 类型数据，**predict_linear** 函数可以预测时间序列 v 在 t 秒后的值，它基于简单线性回归的方式，对时间窗口内的样本数据进行统计，从而可以对时间序列的变化趋势做出预测。例如，基于 2 小时的样本数据，来预测主机可用磁盘空间的是否在 4 个小时候被占满，可以使用如下表达式：

```javascript
predict_linear(node_filesystem_free{job="node"}[2h], 4 * 3600) < 0
```

复制

当资源占用不是平滑变化的使用 **predict_linear** 可以做到提前预警，可以有效避免基于资源用量是平滑增长的的阈值告警模式出现的告警还未来的及处理系统就不可用的情况。

聚合操作符

PrmoQL 提供了内置的聚合操作符，包括 **sum**、**min**、**max**、**avg**、**group**、**count** etc，表达方 **<aggr-op> [without|by (<label list>)] ([parameter,] <vector expression>)** 或  **<aggr-op>([parameter,] <vector expression>) [without|by (<label list>)]**，**without** 会从结果向量中删除列出的标签，而所有其他标签将保留输出。**by** 会执行相反的操作并删除 by 子句中未列出的标签，**paramer** 仅在使用 **count_values**，**quantile**，**topk** 和 **bottomk**，需要指定，举例如下：

```javascript
sum without (instance) (http_requests_total) // HTTP requests per application and group
sum by (application, group) (http_requests_total) //同上
topk(5, http_requests_total) // get the 5 largest HTTP requests counts
```

复制

**使用建议**

聚合操作符的使用顺序

- 先使用 **sum** 再使用 **rate**，原因是在[服务器](https://cloud.tencent.com/product/cvm?from=10680)重启的情况下 counter 会被置 0，如果先使用 **sum** 再使用 **rate**，重启现象会被掩盖，从而会出现假峰值，其它类似的操作符和函数还有 **min**，**max**，**avg**，**ceil**，**histogram_quantile**，**predict_linear** etc。
- 可直接安全的作用与 **counter** 的操作符有 **rate**，**irate**，**increase**，**resets** 其它都需要慎重考虑引起的其它问题。

避免慢查询和数据过载

- 当数据量很大时，对其直接进行查询或绘图时很有可能导致服务器或浏览器过载或超时，合理的做法是指定合理的时间范围和查询步长，可以在 Prometheus 自带的查询界面构建查询表达式增加标签进行筛选或聚合，直到获得一个合理的查询结果集。
- 当使用以上方式仍不能完全缓解查询压力，可以通过 Recording Rules 保存常用的查询数据以提高查询效率。 **Recording Rules：**https://prometheus.io/docs/prometheus/latest/configuration/recording_rules/#recording-rules

时间范围和数据拉取间隔

时间范围通常大于等于 4 倍数据拉取时间间隔，举例：当数据拉取间隔为 10s， **rate** 或 **irate** 至少需要两个样本点，所以需要 30s 来保证至少覆盖两个时间点，考虑到某个时间点拉取出错，所以 40s 是一个较为合理的时间范围，实际使用通常取整到 1m 举例：**irate(http_requests_total{job="api-server"}[1m])**

- 对于 **irate** 指定一个大的时间范围没有意义的，通常指定为四倍数据拉取时间间隔
- 对于 **rate** 没有明确的建议，需要考虑的是时间范围越大，会拉平出现的数据峰值，获得更为平缓的速率

irate 和 rate 和查询步长

- 当调用 **/api/v1/query_range** 获取绘[图数据](https://cloud.tencent.com/product/konisgraph?from=10680)时，需要指定参数 **query** 查询范围，指定获取时间序列样本量的大小，**step** 查询步长，查询步长决定了绘图点的个数，步长越小绘图点越多，考虑到图的直观及可读性需要选择合适的步长。
- **irate** 适合快速变化的计数器, 当查询步长大于 **irate** 时间范围时，由于其只取最后两个数据点，可能会导致在时间范围外的数据峰值点未能被捕获，查询步长与其时间范围越接近, 会捕获更多的数据峰值，曲线变化也更灵敏精确，推荐在重要且需要监测其细节变化的 metric 中使用。
- 大多数情况下我们可以使用 **rate**，但需要注意的是时间范围不应当小于步长，否则可能会漏掉数据。