# [Collection Methods — MongoDB Manual](https://www.mongodb.com/docs/manual/reference/method/js-collection/)



# 创建一个collection

> 创建一个collection,可以使用`db.createCollection()`,也可以直接进行插入操作

```bash
test> db.createCollection("mycollection01")
{ ok: 1 }
test> show collections
mycollection01
```

> 在collection不存在的情况下进行插入操作,也可以生成对应的collection

```bash
test> db.mycollection02.insertOne({name: "fsl"})
{
  acknowledged: true,
  insertedId: ObjectId("64184b4cd1585a3c5852c9da")
}
test> show collections
mycollection01
mycollection02
```



# 删除collection

> db.COLLECTION_NAME.drop()

```bash
# 删除mycollection01
db.mycollection01.drop()
```



# 插入数据

## **db.collection.insertOne()**

> 这里的collection指的是,库中的collection的名字

```bash
test> db.mycollection02.insertOne({name: "fsl",age: 18})  # 插入其中的数据,使用mongo自动生成的ID
{
  acknowledged: true,
  insertedId: ObjectId("64184d71d1585a3c5852c9db")
}
test> db.mycollection02.insertOne({_id: 1000,name: "fsq",age: 18}) # 使用自己指定的_id,需要注意,这个_id不能重复
{ acknowledged: true, insertedId: 1000 }

# 重复的话,会出现这样的错误
test> db.mycollection02.insertOne({_id: 1000,name: "fsqasdasd",age: 18})
MongoServerError: E11000 duplicate key error collection: test.mycollection02 index: _id_ dup key: { _id: 1000 }
```

## db.collection.insertMany()

> 一次插入多条数据,也可以自己指定id,这里就不写了

```bash
test> db.mycollection02.insertMany(
... []
... 
test> db.mycollection02.insertMany(
... [
... {name: "asdasd",age: 123},
... {name: "aaaa",age: 45},
... {name: "asdgfg",age: 57}]
... )
{
  acknowledged: true,
  insertedIds: {
    '0': ObjectId("64184e57d1585a3c5852c9dc"),
    '1': ObjectId("64184e57d1585a3c5852c9dd"),
    '2': ObjectId("64184e57d1585a3c5852c9de")
  }
}

```





# 查询数据

> 这里只使用find作为示例,还有其他的方法,大多少只需要学会过滤的方法,就可以了

[MongoDB数据操作练习 - 一滴小小雨 - 博客园 (cnblogs.com)](https://www.cnblogs.com/py2019/p/11991883.html)

[MongoDB学习笔记-Mongo Shell 常用查询命令 (qq.com)](https://mp.weixin.qq.com/s?__biz=MzI4MjQzMDQzNw==&mid=2247484268&idx=4&sn=8dd3f835d548d123a2513388bcebcf9c&chksm=eb9b5de6dcecd4f09083f60811b15f15dd1ac3ab004cad3b8dc399502330e9e619c1cd7d73cb&token=1410098719&lang=zh_CN#rd)

## 生成示例数据

> 创建一年级的3个班，并随机添加 10 名学生

```bash
for(grade_index in (grade = ['grade_1_1', 'grade_1_2', 'grade_1_3'])) {
       hobbys=['draw', 'dance', 'running', 'sing', 'football', 'basketball', 'computer', 'python']   
       for (var i = 1; i <= 10; i++) {
           db[grade[grade_index]].insert({
               "name": "zhangsan" + i,
               "sex": Math.round(Math.random() * 10) % 2,
               "age": Math.round(Math.random() * 6) + 3,
               "hobby": [hobbys[Math.round(Math.random() * 6)]]
           });
       }
   }
```

### 查看一年级二班grade_1_2中的所有学生

```bash
test> db.grade_1_2.find()
```

### 查看一年级二班grade_1_2中sex为1,age为5

```bash
test> db.grade_1_2.find({age: 7,sex: 1})
[
  {
    _id: ObjectId("64185079d1585a3c5852c9eb"),
    name: 'zhangsan3',
    sex: 1,
    age: 7,
    hobby: [ 'basketball' ]
  }
]
```

### 查看一年级二班grade_1_2中所有年龄是 4 岁的学生

```bash
test> db.g
rade_1_2.find({age: 7})
```

### 查看一年级二班grade_1_2中所有年龄大于 4 岁的学生

```bash
test> db.grade_1_2.find({age: {$gt: 4}})
```

### 查看一年级二班grade_1_2中所有年龄大于 4 岁并且小于 7 岁的学生

```bash
test> db.grade_1_2.find({age: {$gt: 5,$lt: 7}})
```

### 查看一年级二班grade_1_2中所有年龄大于 4 岁并且性别值为0的学生

```bash
test> db.grade_1_2.find({"age": {$gt: 4}, "sex": 0})
```

### 查看一年级二班grade_1_2中所有年龄小于 4 岁或者大于 7 岁的学生

```bash
test> db.grade_1_2..find({$or: [{"age": {$lt: 4}}, {"age": {$gt: 6}}]})
```

### 查看一年级二班grade_1_2中所有年龄是 4 岁或 6 岁的学生

```bash
test> db.grade_1_2.find({"age":{$in:[4,6]}})
```

### 查看一年级二班grade_1_2中所有姓名带zhangsan1的学生

```bash
test> db.grade_1_2.find({"name": {$regex: "zhangsan1"}})
```

### 查看一年级二班grade_1_2中所有姓名带zhangsan1和zhangsan2的学生

```bash
test> db.grade_1_2.find({"name": {$in: [new RegExp("zhangsan1"), new RegExp("zhangsan2")]}})　

```

### 查看一年级二班grade_1_2中所有兴趣爱好有三项的学生

```bash
db.getCollection('grade_1_2').find({"hobby": {$size: 3}})　
```

### 查看一年级二班`grade_1_2`中所有兴趣爱好包括画画的学生

```
db.grade_1_2.find({"hobby": "drawing"})
```

### 查看一年级二班`grade_1_2`中所有兴趣爱好既包括画画又包括跳舞的学生

> 同时包含$all中的元素

```
db.grade_1_2.find({"hobby": {$all: ["drawing", "dance"]}})
```

### 查看一年级二班grade_1_2中所有兴趣爱好有三项的学生的学生数目

```
db.grade_1_2.find({"hobby": {$size: 3}}).count()
```

### 查看一年级二班的第二位学生

> skip()指的是,返回的结果从第一个进行返回(下标从0开始),也就是设置迁移量向前移动一次,然后再进行limit的运算

```
db.grade_1_2.find({}).limit(1).skip(1)
```

### 查看一年级二班的学生，按年纪升序

```
db.grade_1_2.find({}).sort({"age": 1})
```

### 查看一年级二班的学生，按年纪降序

> 和sql中的`order by`类似,这里的`-1`代表着倒叙,也就是说`1`是正序

```
db.grade_1_2.find({}).sort({"age": -1})
```

### 查看一年级二班的学生，年龄值有哪些

```
db.grade_1_2.distinct('age')
```

### 查看一年级二班的学生，兴趣覆盖范围有哪些

```
db.grade_1_2.distinct('hobby')
```

### 查看一年级二班的学生，男生（`sex`为 0）年龄值有哪些

```
db.grade_1_2.distinct('age', {"sex": 0})
```

# 删除数据

> `deleteOne`:只删除过滤出的文档的第一个
>
> `deleteMany`:删除所有过滤出来的文档
