# Kibana-timelion



[TOC]

## [Es官网Timelion介绍](https://www.elastic.co/guide/en/kibana/current/timelion.html)

## [Es官网查询字符介绍](https://www.elastic.co/guide/en/elasticsearch/reference/7.15/query-dsl-query-string-query.html)

## [Lucene语法官网介绍](https://lucene.apache.org/core/6_6_0/queryparser/org/apache/lucene/queryparser/classic/package-summary.html)



## [Lucene语法简易介绍](https://segmentfault.com/a/1190000002972420?utm_source=com.alibaba.android.rimet&utm_medium=social&utm_oi=956946400240537600)

```json
.es(index=ixueshu-ng-*,
	q="!status:403 and uri:\/search\/index.html",
	split=remote_addr.keyword:10,
	)
```

> 1. timelion表达式的q字段需要使用lucene格式
> 2. 在使用这些字符时需要转义:`\+ - = && || > < ! ( ) { } [ ] ^ " ~ * ? : \ /`
> 3. 在查询字段中有空格时,需要使用双引号
> 4. 使用split的字段必须是 `aggregatable` 的,每个字段的后面加上`keyword`一般就是了,是否是 `aggregatable` 可以在kibana的`Index pattern `查看,比如 `ua.os`是不可以`aggregatable`的,但是`ua.os.keyword`是可行的

