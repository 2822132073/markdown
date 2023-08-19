### 脚本内设置标准输出和错误输出的文件

```shell
output_file="/root/log/${collection_name}.log"
exec > "$output_file" 2>&1
```

> 使用exec命令修改标准输出和错误输出

### 在容器内执行命令

```shell
docker exec mongo mongodump -u root -p123456789 -d haiju -c $collection_name  --authenticationDatabase=admin --archive=/bitnami/mongodb/data/$collection_name.bak
docker exec mongo mongosh "mongodb://root:123456789@127.0.0.1:27017/haiju" --authenticationDatabase admin --eval "db.getCollection('$collection_name').drop();"
```

> 不需要使用`-ti`，因为在脚本内没有tty终端，所以需要去掉这些参数