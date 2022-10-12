# 视图

[详细博客](https://www.yiibai.com/mysql/views.html)



## 什么是视图？

> 视图（view）是一种虚拟存在的表，是一个**逻辑表**，本身并不包含数据。作为一个**select**语句保存在数据字典中的。

## 视图是干什么用的？

> 通过视图，可以展现基表的部分数据；
> 视图数据来自定义视图的查询中使用的表，使用视图动态生成。
> 基表：用来创建视图的表叫做基表

## 为什么要使用视图？

因为视图的诸多优点，如下

> 1）**简单**：使用视图的用户完全不需要关心后面对应的表的结构、关联条件和筛选条件，对用户来说已经是过滤好的复合条件的结果集。
> 2）**安全**：使用视图的用户只能访问他们被允许查询的结果集，对表的权限管理并不能限制到某个行某个列，但是通过视图就可以简单的实现。
> 3）**数据独立**：一旦视图的结构确定了，可以屏蔽表结构变化对用户的影响，源表增加列对视图没有影响；源表修改列名，则可以通过修改视图来解决，不会造成对访问者的影响。
> 总而言之，使用视图的大部分情况是为了保障数据安全性，提高查询效率。





# 创建视图

```sql
create [or replace] [algorithm = { undefined | merge | temptable }]
view view_name [(column_list)]
as select_statement
[with [cascaded | local] check option]

参数说明：
（1）algorithm:可选项，表示视图选择的算法。
（2）view_name:表示要创建的视图名称。
（3）column_list:可选项，指定视图中各个属性的名词，默认情况下与SELECT语句中的查询的属性相同。
（4）select_statement:表示一个完整的查询语句，将查询记录导入视图中。
（5）[with [cascaded | local] check option]：可选项，表示更新视图时要保证在该视图的权限范围之内。

```



> 使用`MERGE`算法，MySQL首先将输入查询与定义视图的[SELECT语句](http://www.yiibai.com/mysql/select-statement-query-data.html)组合成单个查询。 然后MySQL执行组合查询返回结果集。 如果SELECT语句包含集合函数(如[MIN](http://www.yiibai.com/mysql/min.html)，[MAX](http://www.yiibai.com/mysql/max-function.html)，[SUM](http://www.yiibai.com/mysql/sum.html)，[COUNT](http://www.yiibai.com/mysql/count.html)，[AVG](http://www.yiibai.com/mysql/avg.html)等)或[DISTINCT](http://www.yiibai.com/mysql/distinct.html)，[GROUP BY](http://www.yiibai.com/mysql/group-by.html)，[HAVING](http://www.yiibai.com/mysql/having.html)，[LIMIT](http://www.yiibai.com/mysql/limit.html)，[UNION](http://www.yiibai.com/mysql/sql-union-mysql.html)，[UNION ALL](http://www.yiibai.com/mysql/sql-union-mysql.html)，[子查询](http://www.yiibai.com/mysql/subquery/)，则不允许使用`MERGE`算法。 如果SELECT语句无引用表，则也不允许使用`MERGE`算法。 如果不允许`MERGE`算法，MySQL将算法更改为`UNDEFINED`。请注意，将视图定义中的输入查询和查询组合成一个查询称为*视图分辨率*。
>
> 使用`TEMPTABLE`算法，MySQL首先根据定义视图的`SELECT`语句[创建一个临时表](http://www.yiibai.com/mysql/temporary-table.html)，然后针对该临时表执行输入查询。因为MySQL必须创建临时表来存储结果集并将数据从基表移动到临时表，所以`TEMPTABLE`算法的效率比`MERGE`算法效率低。 另外，使用`TEMPTABLE`算法的视图是不[可更新](http://www.yiibai.com/mysql/create-sql-updatable-views.html)的。
>
> 当您创建视图而不指定显式算法时，`UNDEFINED`是默认算法。 `UNDEFINED`算法使MySQL可以选择使用`MERGE`或`TEMPTABLE`算法。MySQL优先使用`MERGE`算法进行`TEMPTABLE`算法，因为`MERGE`算法效率更高。



##  check option

> 会在更新,插入,删除数据时,检查,此次修改后,修改后的数据,是否还可以被视图查询出来,或者插入的数据可以被视图查询出来

```sql
create or replace view  v_employees_man
AS
SELECT * FROM employees WHERE employees.employees.gender = 'M'
with check option ;
```

> 例如这个操作

```sql
insert into v_employees_man (emp_no, birth_date, first_name, last_name, gender, hire_date)
values (999999,'1999-12-12','fsl','silin','F','2000-2-2');
```

> 这条数据插入后,无法被视图查询,所以会报
>
> `[HY000][1369] CHECK OPTION failed 'employees.v_employees_man'`

```sql
insert into v_employees_man (emp_no, birth_date, first_name, last_name, gender, hire_date)
values (999999,'1999-12-12','fsl','silin','M','2000-2-2');

update v_employees_man
set gender = 'F'
where emp_no = 999999;
```

> 这个修改操作也无法执行,因为修改过后,视图无法查到这条数据





## 示例

> 这里使用的是mysql官方提供的示例数据库,**employees**

```sql
CREATE VIEW view_emplyess(emp_no,first_name,gender)
AS
	SELECT emp_no, first_name, gender
	FROM employees 
	WHERE gender="M";
```

> 注意,在视图列后列必须在`select`中的一致,不然会报错

> 这个视图的意思是指的是性别为男的取出`emp_no, first_name, gender`的列



# 查看视图

> 因为视图和表共享相同的命名空间。要知道哪个对象是视图或表，请使用`SHOW FULL TABLES`命令

```bash
mysql> SHOW FULL TABLES;
+----------------------+------------+
| Tables_in_employees  | Table_type |
+----------------------+------------+
| current_dept_emp     | VIEW       |
| departments          | BASE TABLE |
| dept_emp             | BASE TABLE |
| dept_emp_latest_date | VIEW       |
| dept_manager         | BASE TABLE |
| employees            | BASE TABLE |
| salaries             | BASE TABLE |
| titles               | BASE TABLE |
| view_emplyess        | VIEW       |
+----------------------+------------+
```

> `Table_type`类型为`VIEW`是视图



# 删除视图

```sql
drop view 视图名[,视图名…]
drop view if exists view_emplyess;
```

# 修改视图

```sql
alter view 视图名 as select 语句
```

# 通过视图修改数据

在MySQL中，视图不仅是可查询的，而且是可更新的。这意味着您可以使用INSERT或UPDATE语句通过可更新视图插入或更新基表的行。 另外，您可以使用DELETE语句通过视图删除底层表的行。

但是，要创建可更新视图，定义视图的SELECT语句不能包含以下任何元素：

- 聚合函数，如：MIN，MAX，SUM，AVG，COUNT等。
- DISTINCT子句
- GROUP BY子句
- HAVING子句
- **UNION**或`UNION ALL`子句
- 左连接或外连接。
- SELECT子句中的子查询或引用该表的WHERE子句中的子查询出现在`FROM`子句中。
- 引用`FROM`子句中的不可更新视图
- 仅引用文字值
- 对基表的任何列的多次引用

如果使用**TEMPTABLE算法**创建视图，则无法更新视图。

> 请注意，有时可以使用**内部连接**创建基于多个表的可更新视图。





```sql
SELECT
table_name, is_updatable
FROM
information_schema.views
WHERE
table_schema = '$DATABASE_NAME';
```

> 查看视图是否可以更新





```sql
CREATE VIEW view_s
AS
SELECT *
FROM c_and_s,student s
where c_and_s.sid = s.id;

insert into view_s (cid, sid, id, name, class_id, password)
values (1,9,9,'xiaosan',3,'asdasdasdas');
```

> 在上面的视图的基础上,进行insert语句,发现报错
>
> `[HY000][1393] Can not modify more than one base table through a join view 'task_10_1.view_s'`
>
> 通过一个视图无法修改多个基础表,只能进行单一基表的数据的添加

```sql
insert into view_s (id, name, class_id, password)
values (9,'xiaosan',3,'asdasdasdas');
```

> 可以对单一基表进行插入操作



```sql
update view_s
set cid = 2,password = 'ahkjhkjhkjhkhk'
where id = 9;
```

> 通过视图也无法同时对多张表进行修改操作

