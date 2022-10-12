## 常用操作

### 对表结构修改





#### 添加字段

```sql
ALTER TABLE <表名> ADD <新字段名> <数据类型> [约束条件] [FIRST|AFTER 已存在的字段名];
```

#### 修改字段

```sql
ALTER TABLE <表名> MODIFY <字段名> <数据类型>;
```

>  其中，`表名`指要修改数据类型的字段所在表的名称，`字段名`指需要修改的字段，`数据类型`指修改后字段的新数据类型。

#### 重命名字段

```sql
ALTER TABLE table_name RENAME COLUMN old TO new;
```

#### 删除主键

```sql
ALTER  TABLE  table_name  DROP  PRIMARY  KEY;
```

> 要是主键带自增属性,需要将自增属性删除

#### 修改字段属性

```sql
ALTER  TABLE table_name MODIFY id data_type;
```

> 这里的意思就是去掉原来的自增属性

#### 删除字段

```sql
ALTER TABLE <表名> DROP <字段名>;
```

#### 修改表名

```sql
ALTER TABLE <旧表名> RENAME [TO] <新表名>;
```

