## go-redis介绍

[go-redis](https://github.com/redis/go-redis) 提供各种类型的客户端：

- [Redis 单节点客户端](https://redis.uptrace.dev/zh/guide/go-redis.html)
- [Redis 集群客户端](https://redis.uptrace.dev/zh/guide/go-redis-cluster.html)
- [Redis 哨兵客户端](https://redis.uptrace.dev/zh/guide/go-redis-sentinel.html)
- [Redis 分片客户端](https://redis.uptrace.dev/zh/guide/ring.html)
- [Redis 通用客户端](https://redis.uptrace.dev/zh/guide/universal.html)

go-redis 也可以用于 [kvrocks在新窗口打开](https://github.com/apache/incubator-kvrocks), kvrocks 是分布式键值 NoSQL 数据库，使用 RocksDB 作为存储引擎，兼容 redis 协议。

```bash
go get github.com/redis/go-redis/v9
```

## 连接到Redis

### 单节点

连接到 Redis 服务器示例，更多配置参数，请参照 [redis.Options](https://redis.uptrace.dev/zh/guide/go-redis-option.html#redis-client):

```go
import "github.com/redis/go-redis/v9"

rdb := redis.NewClient(&redis.Options{
	Addr:	  "localhost:6379",
	Password: "", // 没有密码，默认值
	DB:		  0,  // 默认DB 0
})
```

同时也支持另外一种常见的连接字符串:

```go
opt, err := redis.ParseURL("redis://<user>:<pass>@localhost:6379/<db>")
if err != nil {
	panic(err)
}

rdb := redis.NewClient(opt)
```





### 总结

大致看了一下，大部分api都有注释，和redis命令行是差不多的，只需要看文档就行，就没怎么写文档，感觉用处不大