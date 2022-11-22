# golang操作mysql

Go 语言中，使用 `database/sql` 包实现类 SQL 数据库的操作。`sql` 包是一个数据库抽象层，具体的数据库操作的实现要依赖于相应的驱动才可以。抽象层与驱动的关系，如下图所示:

![img](https://cdn.jsdelivr.net/gh/2822132073/image/202211162231445.png)





> 也就是说`database/sql`只是一个接口,具体操作需要其它的包来实现

# go-sql-driver/mysql

[github地址](https://github.com/go-sql-driver/mysql)

> 这个包是`database/sql/driver`的实现,使用这个包,只需要将其导入就行了,只需要使用`database/sql/driver`的API即可

## 安装

```shell
go get -u github.com/go-sql-driver/mysql
```

## 连接到数据库

> 其中`sql.DB`是表示连接的数据库对象（结构体实例），它保存了连接数据库相关的所有信息。它内部维护着一个具有零到多个底层连接的连接池，它可以安全地被多个goroutine同时使用。

```go
package main

import (
	"database/sql"
	_ "github.com/go-sql-driver/mysql"
	"log"
)

func main() {
    // 第一个参数为driverName,第二个参数为数据源名称,数据源名称的格式为
    // [username[:password]@][protocol[(address)]]/dbname[?param1=value1&...&paramN=valueN]
    // root:123456.@tcp(127.0.0.1:3306)/Test?charset=utf8mb4&parseTime=True&loc=Local
    db, err := sql.Open("mysql", "user:password@/dbname")
    if err != nil {
        panic(err)
    }
   	// 一些数据库相关的设置
    // db.SetConnMaxLifetime(time.Minute * 3)
    // db.SetMaxOpenConns(10)
    // db.SetMaxIdleConns(10)
    
    // 检测数据库是否可以进行连接,也可以查看数据库连接是否存活
    err = db.Ping()
	if err != nil {
		log.Println(err)
		return
	}
}
```

> 可以这样进行使用

```go
package main

import (
	"database/sql"
	"fmt"
	_ "github.com/go-sql-driver/mysql"
	"log"
	"time"
)

var db *sql.DB


func initDB() (err error) {
	dsn := "root:123123.@tcp(gz-cynosdbmysql-grp-56yht59x.sql.tencentcdb.com:21754)/Test?charset=utf8mb4&parseTime=True&loc=Local"
    // 注意这里要写 =,而不是:=,这样才可以将值赋给全局变量db
 	// 这里的err在上面的返回值写过,所以不需要进行声明
	db, err = sql.Open("mysql", dsn)
	if err != nil {
		panic(any(err))
		return err
	}

	//See "Important settings" section.
	db.SetConnMaxLifetime(time.Minute * 3) 
	db.SetMaxOpenConns(10)  // 设置与数据库建立连接的最大数目
	db.SetMaxIdleConns(10)  // 设置连接池中的最大闲置连接数
	err = db.Ping()
	if err != nil {
		return err
	}
	return nil
}
func main() {
	if err := initDB(); err != nil {
		log.Println(err)
		return
	}
	querySingleRow()
}

```

## Query

### 查询单行

```go
func querySingleRow() {
	var (
		id   int
		name string
	)
    // 执行查询语句,并使用Scan
	err := db.QueryRow("select * from class_t where id = ?", 1701).Scan(&id, &name)
	if err != nil {
		return
	}
	fmt.Println(id, name)
}
```

> 单行查询`db.QueryRow()`执行一次查询，并期望返回最多一行结果（即Row）。**QueryRow**总是返回非**nil**的值，直到返回值的**Scan**方法被调用时，才会返回被延迟的错误。（如：未找到结果）

### 查询多行

```go
func queryMultiRow()  {
	var (
		id   int
		name string
	)
	rows, err := db.Query("select * from class_t")
	// 最后释放rows所占用的数据库连接
	// 这个Close也会在Next函数返回False时执行
	defer rows.Close()
	if err != nil {
		log.Fatal(err)
		return
	}
    // Next函数会判断是否有下一个数据,如果没有的话就直接返回False,并执行Close函数
	for rows.Next() {
		err := rows.Scan(&id,&name)
		if err != nil {
			log.Println(err)
		}
		log.Println(id,name)
	}

}
```

## Exec

> 所有的插入,更新,删除操作都由`func (db *DB) Exec(query string, args ...interface{}) (Result, error)`执行

### 插入

```go
func insertData()  {
    // result中可以包含此次操作影响的函数
    // 如果插入的主机有自增约束的话,还可以返回id
	result, err := db.Exec("insert into class_t (id,name) values (?,?)", 997, "平行班")
	if err != nil {
		log.Fatal(err)
		return
	}
	affect,err := result.RowsAffected()
	fmt.Printf("affect row: %d\n",affect)
}
```

### 更新

```go
func updateData()  {
	result, err := db.Exec("update class_t set name = ? where id = ?;","修改之后", 999 )
	if err != nil {
		log.Fatal(err)
		return
	}
	affect,err := result.RowsAffected()
	fmt.Printf("affect row: %d\n",affect)
}
```

### 删除

```go
func deleteData() {
	result, err := db.Exec("delete from class_t where id=?;", 999 )
	if err != nil {
		log.Fatal(err)
		return
	}
	affect,err := result.RowsAffected()
	fmt.Printf("affect row: %d\n",affect)
}
```

## 预处理(Prepare)

### 什么是预处理？

普通SQL语句执行过程：

1. 客户端对SQL语句进行占位符替换得到完整的SQL语句。
2. 客户端发送完整SQL语句到MySQL服务端
3. MySQL服务端执行完整的SQL语句并将结果返回给客户端。

预处理执行过程：

1. 把SQL语句分成两部分，命令部分与数据部分。
2. 先把命令部分发送给MySQL服务端，MySQL服务端进行SQL预处理。
3. 然后把数据部分发送给MySQL服务端，MySQL服务端对SQL语句进行占位符替换。
4. MySQL服务端执行完整的SQL语句并将结果返回给客户端。

### 为什么要预处理？

1. 优化MySQL服务器重复执行SQL的方法，可以提升服务器性能，提前让服务器编译，一次编译多次执行，节省后续编译的成本。
2. 避免SQL注入问题。



`database/sql`中使用下面的`Prepare`方法来实现预处理操作。

```go
func (db *DB) Prepare(query string) (*Stmt, error)
```

`Prepare`方法会先将sql语句发送给MySQL服务端，返回一个准备好的状态用于之后的查询和命令。返回值可以同时执行多个查询和命令。

查询操作的预处理示例代码如下：

```go
// 预处理查询示例
func prepareQueryDemo() {
	sqlStr := "select id, name, age from user where id > ?"
	stmt, err := db.Prepare(sqlStr)
	if err != nil {
		fmt.Printf("prepare failed, err:%v\n", err)
		return
	}
	defer stmt.Close()
	rows, err := stmt.Query(0)
	if err != nil {
		fmt.Printf("query failed, err:%v\n", err)
		return
	}
	defer rows.Close()
	// 循环读取结果集中的数据
	for rows.Next() {
		var u user
		err := rows.Scan(&u.id, &u.name, &u.age)
		if err != nil {
			fmt.Printf("scan failed, err:%v\n", err)
			return
		}
		fmt.Printf("id:%d name:%s age:%d\n", u.id, u.name, u.age)
	}
}
```

插入、更新和删除操作的预处理十分类似，这里以插入操作的预处理为例：

```go
// 预处理插入示例
func prepareInsertDemo() {
	sqlStr := "insert into user(name, age) values (?,?)"
	stmt, err := db.Prepare(sqlStr)
	if err != nil {
		fmt.Printf("prepare failed, err:%v\n", err)
		return
	}
	defer stmt.Close()
	_, err = stmt.Exec("小王子", 18)
	if err != nil {
		fmt.Printf("insert failed, err:%v\n", err)
		return
	}
	_, err = stmt.Exec("沙河娜扎", 18)
	if err != nil {
		fmt.Printf("insert failed, err:%v\n", err)
		return
	}
	fmt.Println("insert success.")
}
```

> 任何时候都不要自己进行sql语句的拼接,这样容易有sql注入的问题

## 事务

### 事务相关方法

Go语言中使用以下三个方法实现MySQL中的事务操作。 开始事务

```go
func (db *DB) Begin() (*Tx, error)
```

提交事务

```go
func (tx *Tx) Commit() error
```

回滚事务

```go
func (tx *Tx) Rollback() error
```

### 事务示例

下面的代码演示了一个简单的事务操作，该事物操作能够确保两次更新操作要么同时成功要么同时失败，不会存在中间状态。

```go
// 事务操作示例
func transactionDemo() {
	tx, err := db.Begin() // 开启事务
	if err != nil {
		if tx != nil {
			tx.Rollback() // 回滚
		}
		fmt.Printf("begin trans failed, err:%v\n", err)
		return
	}
	sqlStr1 := "Update user set age=30 where id=?"
	ret1, err := tx.Exec(sqlStr1, 2)
	if err != nil {
		tx.Rollback() // 回滚
		fmt.Printf("exec sql1 failed, err:%v\n", err)
		return
	}
	affRow1, err := ret1.RowsAffected()
	if err != nil {
		tx.Rollback() // 回滚
		fmt.Printf("exec ret1.RowsAffected() failed, err:%v\n", err)
		return
	}

	sqlStr2 := "Update user set age=40 where id=?"
	ret2, err := tx.Exec(sqlStr2, 3)
	if err != nil {
		tx.Rollback() // 回滚
		fmt.Printf("exec sql2 failed, err:%v\n", err)
		return
	}
	affRow2, err := ret2.RowsAffected()
	if err != nil {
		tx.Rollback() // 回滚
		fmt.Printf("exec ret1.RowsAffected() failed, err:%v\n", err)
		return
	}

	fmt.Println(affRow1, affRow2)
	if affRow1 == 1 && affRow2 == 1 {
		fmt.Println("事务提交啦...")
		tx.Commit() // 提交事务
	} else {
		tx.Rollback()
		fmt.Println("事务回滚啦...")
	}

	fmt.Println("exec trans success!")
}
```





#  Sqlx

[博客](https://www.cnblogs.com/guyouyin123/p/14481196.html)

[官方文档](http://jmoiron.github.io/sqlx/)



```go
type class struct {
	Id int `db:"id"`
	Name string `db:"name"`
}
```

> 当需要将数据表字段映射到结构体的情况下,你可以使用`db`tag进行指定映射关系,如果没有进行指定,会使用默认的`NameMapper`函数进行对结构体的成员变量进行处理,默认为:`strings.ToLower`,也就是`Id`会变成`id`

## 安装

```shell
go get github.com/jmoiron/sqlx
```

## 连接到数据库

```go
func initDB() (err error) {
	dsn := "user:password@tcp(127.0.0.1:3306)/sql_test?charset=utf8mb4&parseTime=True"
	// 也可以使用MustConnect连接不成功就panic
	// 在连接时,进行验证,使用ping
	db, err = sqlx.Connect("mysql", dsn)
	if err != nil {
		fmt.Printf("connect DB failed, err:%v\n", err)
		return 
	}
	db.SetMaxOpenConns(20)
	db.SetMaxIdleConns(10)
	return
}
```

## 查询



### 单行

```go
func querySingleRow()  {
	var c class
    // 这里的Get相当于query与scan的结合
    // 在sqlx中,可以将返回的单行Rows直接赋值给结构体,还可以直接将多行赋值给结构体切片
    // 可以数据赋给结构体,可以查看StructScan函数
	err := db.Get(&c, "select id,name from class_t where id = ?", 1701)
	if err != nil {
		log.Println(err)
		return
	}
}

```

> 注意,结构体里面的成员变量需要对外暴露出来,不然会报错:
>
> `non-struct dest type struct with >1 columns (2)`



### 多行

```go
func queryMultiRow()  {
	var classes []class
	err := db.Select(&classes, "select id,name from class_t")
	if err != nil {
		log.Println(err)
		return
	}
	for _,c := range classes {
		fmt.Println(c)
	}
}
```

> 多行需要使用select函数

## 插入、更新和删除

sqlx中的exec方法与原生sql中的exec使用基本一致：

```go
// 插入数据
func insertRowDemo() {
	sqlStr := "insert into user(name, age) values (?,?)"
	ret, err := db.Exec(sqlStr, "沙河小王子", 19)
	if err != nil {
		fmt.Printf("insert failed, err:%v\n", err)
		return
	}
	theID, err := ret.LastInsertId() // 新插入数据的id
	if err != nil {
		fmt.Printf("get lastinsert ID failed, err:%v\n", err)
		return
	}
	fmt.Printf("insert success, the id is %d.\n", theID)
}

// 更新数据
func updateRowDemo() {
	sqlStr := "update user set age=? where id = ?"
	ret, err := db.Exec(sqlStr, 39, 6)
	if err != nil {
		fmt.Printf("update failed, err:%v\n", err)
		return
	}
	n, err := ret.RowsAffected() // 操作影响的行数
	if err != nil {
		fmt.Printf("get RowsAffected failed, err:%v\n", err)
		return
	}
	fmt.Printf("update success, affected rows:%d\n", n)
}

// 删除数据
func deleteRowDemo() {
	sqlStr := "delete from user where id = ?"
	ret, err := db.Exec(sqlStr, 6)
	if err != nil {
		fmt.Printf("delete failed, err:%v\n", err)
		return
	}
	n, err := ret.RowsAffected() // 操作影响的行数
	if err != nil {
		fmt.Printf("get RowsAffected failed, err:%v\n", err)
		return
	}
	fmt.Printf("delete success, affected rows:%d\n", n)
}
```

## NamedExec

`DB.NamedExec`方法用来绑定SQL语句与结构体或map中的同名字段。

```go
func insertUserDemo()(err error){
	sqlStr := "INSERT INTO user (name,age) VALUES (:name,:age)"
	_, err = db.NamedExec(sqlStr,
		map[string]interface{}{
			"name": "七米",
			"age": 28,
		})
	return
}
```

> 由于NameMapper的缘故,当使用结构体对象进行映射时,成员变量会被进行ToLower处理,变成小写字母,再进行绑定,NameMapper不对map生效,也就是说,map中的key直接与sql中变量的进行绑定

## NamedQuery

与`DB.NamedExec`同理，这里是支持查询。

> `NamedQuery`:从结构体变量或者map中去值进行查询,具体的值由占位符进行决定
>
> `StructScan`:将返回的数据一行,放到给定的结构体变量中,需要使用指针,会根据`db`tag觉得映射关系

```go
func namedQuery(){
	sqlStr := "SELECT * FROM user WHERE name=:name"
	// 使用map做命名查询
	rows, err := db.NamedQuery(sqlStr, map[string]interface{}{"name": "七米"})
	if err != nil {
		fmt.Printf("db.NamedQuery failed, err:%v\n", err)
		return
	}
	defer rows.Close()
	for rows.Next(){
		var u user
		err := rows.StructScan(&u)
		if err != nil {
			fmt.Printf("scan failed, err:%v\n", err)
			continue
		}
		fmt.Printf("user:%#v\n", u)
	}

	u := user{
		Name: "七米",
	}
	// 使用结构体命名查询，根据结构体字段的 db tag进行映射
	rows, err = db.NamedQuery(sqlStr, u)
	if err != nil {
		fmt.Printf("db.NamedQuery failed, err:%v\n", err)
		return
	}
	defer rows.Close()
	for rows.Next(){
		var u user
        // 自动的将一行数据与结构体的成员变量进行绑定
		err := rows.StructScan(&u)
		if err != nil {
			fmt.Printf("scan failed, err:%v\n", err)
			continue
		}
		fmt.Printf("user:%#v\n", u)
	}
}
```

## 事务操作

对于事务操作，我们可以使用`sqlx`中提供的`db.Beginx()`和`tx.Exec()`方法。示例代码如下：

```go
func transactionDemo2()(err error) {
	tx, err := db.Beginx() // 开启事务
	if err != nil {
		fmt.Printf("begin trans failed, err:%v\n", err)
		return err
	}
	defer func() {
		if p := recover(); p != nil {
			tx.Rollback()
			panic(p) // re-throw panic after Rollback
		} else if err != nil {
			fmt.Println("rollback")
			tx.Rollback() // err is non-nil; don't change it
		} else {
			err = tx.Commit() // err is nil; if Commit returns error update err
			fmt.Println("commit")
		}
	}()

	sqlStr1 := "Update user set age=20 where id=?"

	rs, err := tx.Exec(sqlStr1, 1)
	if err!= nil{
		return err
	}
	n, err := rs.RowsAffected()
	if err != nil {
		return err
	}
	if n != 1 {
		return errors.New("exec sqlStr1 failed")
	}
	sqlStr2 := "Update user set age=50 where i=?"
	rs, err = tx.Exec(sqlStr2, 5)
	if err!=nil{
		return err
	}
	n, err = rs.RowsAffected()
	if err != nil {
		return err
	}
	if n != 1 {
		return errors.New("exec sqlStr1 failed")
	}
	return err
}
```

## 批量操作

>  在某些时候,需要用到In关键在查询语句中时,需要根据传入参数的个数进行对执行语句的格式化,这个过程时动态的

### sqlx.In

#### 查询操作

```go
// QueryByIDs 根据给定ID查询
func QueryByIDs(ids []int)(users []User, err error){
	// 动态填充id
	query, args, err := sqlx.In("SELECT name, age FROM user WHERE id IN (?)", ids)
	if err != nil {
		return
	}
	// sqlx.In 返回带 `?` bindvar的查询语句,需要将其重新绑定为我们数据库所适用的形式
	query = DB.Rebind(query)

	err = DB.Select(&users, query, args...)
	return
}
```

#### 更新操作

```go
func (c class) Value() (driver.Value, error) {
	return []interface{}{c.Id, c.Name}, nil
}

func inUpdate() {
    // 这里的?问号的数量要与下面空接口数组的长度一致,这样才可以将参数一一对应上去
	s := "insert into class_t (id,name) values (?),(?),(?);"
	var classes = []interface{}{
		class{Id: 1705, Name: "name1705"},
		class{Id: 1706, Name: "name1706"},
		class{Id: 1707, Name: "name1707"},
	}
    
    // query: insert into class_t (id,name ) values (?, ?),(?, ?),(?, ?); 
    // 这里小括号中问号的数量,和Value方法返回的参数的数量有关
    // args: [1705 name1705 1706 name1706 1707 name1707]
    // 传入的第二个参数是空接口类型,需要注意
    // 传入的结构体需要实现Valuer结构,In会按照Value方法里面的顺序将其中的成员展开
    // 返回值需要将其放到Exec方法中执行
    // 如果arg实现了 driver.Valuer, sqlx.In 会通过调用 Value()来展开它
	query, args, err := sqlx.In(s, classes...)
	if err != nil {
		log.Println(err)
		return
	}
	_, err = db.Exec(query, args...)
}
```

### sqlx.Named

> 其实可以直接使用`sqlx.NamedExec`,直接执行,而不是返回数据让你自己去执行`Exec`

```go
func namedInsert()  {
    // 和In不同,Named更加智能,只需要写出需要绑定的字段在map或者结构体中的名称即可,它会自动根据传入数组的成员的数量来添加括号,并且不需要实现Valuer接口
	s := "insert into class_t (id,name) values (:id,:name);"
	var classes = []class{
		{Id: 1705, Name: "name1705"},
		{Id: 1706, Name: "name1706"},
		{Id: 1707, Name: "name1707"},
	}
    // insert into class_t (id,name) values (?,?),(?,?),(?,?);
	// [1705 name1705 1706 name1706 1707 name1707]
	query, args, err := sqlx.Named(s, classes)
	if err != nil {
		log.Println(err)
		return
	}
	fmt.Println(query)
	fmt.Println(args)
}
```

# GORM

[博客](https://www.cnblogs.com/beatleC/p/16211091.html)

[Githud地址](https://github.com/go-gorm/gorm)

[官方文档](https://gorm.cn/zh_CN/)

> gorm的中文文档比较全,可以直接查看
