# Tidb扩缩容

> tidb扩缩容需要对先前声明的`tidbcluster`进行修改,

## 扩容阶段是否可以进行插入操作

> 使用sql不停的向tidb进行插入,查看是否有中断





```sql
CREATE TABLE student(
  id INT PRIMARY KEY AUTO_INCREMENT,
  d VARCHAR(200),
);
```

