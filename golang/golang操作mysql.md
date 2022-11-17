# golang操作mysql

Go 语言中，使用 `database/sql` 包实现类 SQL 数据库的操作。`sql` 包是一个数据库抽象层，具体的数据库操作的实现要依赖于相应的驱动才可以。抽象层与驱动的关系，如下图所示:

![img](https://cdn.jsdelivr.net/gh/2822132073/image/202211162231445.png)





> 也就是说`database/sql`只是一个接口,具体操作需要其它的包来实现

#  Sqlx

[博客](https://www.cnblogs.com/guyouyin123/p/14481196.html)

[官方文档](http://jmoiron.github.io/sqlx/)





# GORM

[博客](https://www.cnblogs.com/beatleC/p/16211091.html)

[Githud地址](https://github.com/go-sql-driver/mysql)

[官方文档](https://gorm.cn/zh_CN/)

# go-sql-driver/mysql

[github地址](https://github.com/go-sql-driver/mysql)