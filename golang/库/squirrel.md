> squirrel是一个sql的构建工具,可以使用它来进行构建sql语句

## Builder

squirrel中有6种builder的创建方式,分别是下面几种,一种返回5种builder

- func Select(*columns* ...string) SelectBuilder 
- func Insert(*into* string) InsertBuilder 
- func Replace(*into* string) InsertBuilder 
- func Update(*table* string) UpdateBuilder
- func Delete(*from* string) DeleteBuilder
- func Case(*what* ...interface{}) CaseBuilder

这里需要说明的是Replace和Insert的区别,Replace语句是**如果存在就先删除再更新，不存在则直接新增记录**。而Insert是直接插入

**这些builder可以调用ToSql,来将构造的语句变成可以执行的sql语句,并且放回参数列表,以契合golang的标准库**

这个CaseBuilder是构建case语句的,一般不会用到,太过于复杂,不如直接写sql

## Select

select生成SelectBuilder,用来生成select的相关语句,在我认为,简单的单表语句使用squirrel写,其他的手写sql,哈哈哈哈,select语句的话,由select,from,where,group by,order by等,在这里只写一些单表查询会使用到的用法,当然,也支持join,我就不想写太多了

### Select

第一个就是select方法,它会返回一个SelectBuilder ,用于构建select相关的字句,是构成Select语句的必选项

### From

第二个自然就是From,用来设置从哪个表查询

### Where

这个需要重点来说,就只有它的操作比较复杂一点,涉及到多个条件一起,其中就包含Or和And,还有一些其他的,总体来说其中可以用到的有这些,有一些没有,例如`Between`,`In`这些

- 比较操作符：`Eq`、`NotEq`、`Gt`、`GtOrEq`、`Lt`、`LtOrEq`。
- 逻辑操作符：`And`、`Or`。
- 匹配操作符：`Like`、`NotLike`。

有些不支持的可以使用Expr,来构造

```go
query, args, err := squirrel.Select("*").From("users").
        Where(squirrel.Expr("name IN (?, ?)", "John", "Jane")).
        ToSql()
// sql : SELECT * FROM users WHERE name IN (?, ?)
// args : [John Jane]
```



### GroupBy

就是分组,添加Group By 语句

### OrderBy

就是分组,添加Order By 语句,可以指定多个值的顺序

### Having

顾名思义,这就是sql中的having语句,需要配合查询的字符进行使用

### Columns

有时候不会一开始就设置Select的内容,可以先使用一个空的Select创建一个SelectBuilder,然后再使用Columns进行设置

```go
// Having
//query, args, err := squirrel.Select("gender", "AVG(age) AS avg_age").From("users").GroupBy("gender").Having("avg_age > ?", 30).ToSql()

// 使用 And 方法
//query, args, err := squirrel.Select("name", "age").From("users").Where(squirrel.And{squirrel.Eq{"gender": "male"}, squirrel.Gt{"age": 18}}).ToSql()
// sql : SELECT name, age FROM users WHERE (gender = ? AND age > ?)
// args : [male 18]

// 使用 Or 方法
//query, args, err := squirrel.Select("name", "age").From("users").Where(squirrel.Or{squirrel.Eq{"gender": "male"}, squirrel.Gt{"age": 18}}).ToSql()
// sql : SELECT name, age FROM users WHERE (gender = ? OR age > ?)
// args : [male 18]

// 使用 OrderBy 方法
//query, args, err := squirrel.Select("name", "age").From("users").Where(squirrel.Eq{"gender": "male"}).OrderBy("age DESC", "name ASC").Limit(10).ToSql()
// sql : SELECT name, age FROM users WHERE gender = ? ORDER BY age DESC, name ASC LIMIT 10
// args : [male]

// 使用 Like 方法
//query, args, err := squirrel.Select("name", "age").From("users").Where(squirrel.Like{"name": "%John%"}).ToSql()
//sql : SELECT name, age FROM users WHERE name LIKE ?
//args : [%John%]

// 使用 NotLike 方法
//query, args, err := squirrel.Select("name", "age").From("users").Where(squirrel.NotLike{"name": "%John%"}).ToSql()
// sql : SELECT name, age FROM users WHERE name NOT LIKE ?
// args : [%John%]

// 使用字符直接构造Between
// query, args, err := squirrel.Select("*").Where("age Between 1 And 10").From("User").ToSql()
//	sql : SELECT * FROM User WHERE age Between 1 And 10
//	args : []
```



## Insert

也是很简单的

### Values

设置插入的值,可以使用多次没相当于插入多个值



### Columns

如果需要设置插入那些值,需要用到这个,如果不进行声明,那么就要写出表中的每一个值

```go
query, args, err := squirrel.
        Insert("users").
        Columns("name", "age").
        Values("John", 30).
        Values("Jane", 25).
        ToSql()
// sql : INSERT INTO users (name,age) VALUES (?,?),(?,?)
// args : [John 30 Jane 25]
```



## Update

这个的操作简单很多,只有几个需要学习的

### Set

用于设置需要更新的列和对应的值。

### SetMap

用于设置一组需要更新的列和对应的值。

```go
data := map[string]interface{}{
	"age":   30,
	"email": "john@example.com",
}
query, args, err := squirrel.Update("users").SetMap(data).Where(squirrel.Eq{"name": "John"}).ToSql()
// sql : UPDATE users SET age = ?, email = ? WHERE name = ?
// args : [30 john@example.com John]
// 构造更新操作：使用 Set 方法
query, args, err := squirrel.Update("users").Set("age", 30).Where(squirrel.Eq{"name": "John"}).ToSql()
// sql : UPDATE users SET age = ? WHERE name = ?
// args : [30 John]
```

## Delete

没什么需要写的,delete一般就是删除指定的内容,所有一般只用到Where,要是删除全部的话,可以不加Where

```go
	query, args, err := squirrel.Delete("users").
		Where(squirrel.Eq{"name": "John"}).
		Where(squirrel.Lt{"age": 30}).
		ToSql()
	// sql : DELETE FROM users WHERE name = ? AND age < ?
	// args : [John 30]
```



