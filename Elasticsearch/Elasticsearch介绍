# Elasticsearch安装

## 官方文档地址
```shell
https://www.elastic.co/guide/en/elasticsearch/reference/7.14/install-elasticsearch.html#_installing_elasticsearch_yourself
```

## 源地址,可以在这里下载对应的rpm包直接安装
> https://mirrors.tuna.tsinghua.edu.cn/elasticstack

## repo配置文件
```shell
cat >/etc/yum.repos.d/elasticsearch.repo <<EOF
[elasticsearch]
name=Elasticsearch repository for 7.x packages
baseurl=https://mirrors.tuna.tsinghua.edu.cn/elasticstack/yum/elastic-7.x
gpgcheck=0
enabled=0
autorefresh=1
type=rpm-md
EOF
```
## 安装elasticsearch
```shell
sudo yum install -y --enablerepo=elasticsearch elasticsearch
```

## 重载配置文件,启动ES
```shell
systemctl daemon-reload
systemctl enable elasticsearch.service
```
