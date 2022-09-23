







## 环境说明



### java实体类

```java
public class User {
    private int id;
    private String name;
    private String gender;
    private String pwd;
}
```

> 还有一些省略

### SQL表结构

```sql
CREATE TABLE user(
    id int primary key not null,
    name varchar(10),
    sex varchar(1),
    password varchar(20)
);
```





```xml
<mapper namespace="com.fsl.dao.UserMapper">
    <resultMap id="UserMap" type="user">
        <id property="id" column="id"/>
        <result property="name" column="name"/>
        <result property="pwd" column="password"/>
        <result property="gender" column="sex"/>
    </resultMap>
        <select id="getAll" resultMap="UserMap">
            select id, password, sex,name
            from user;
        </select>
</mapper>
```

> 在resultMap中有很多便签,这里有两个
>
> `id`:一般指的是主键,这个不是必须的
>
> `result`:一般的字段
>
> `property`:指的是在实体类中的名称
>
> `column`:指的是查询出结果的字段名称
>
> 这样就可以将实体类和表中不相同的字段进行关联起来





```sql
-- student表
CREATE TABLE student(
	id int PRIMARY KEY NOT NULL,
	name VARCHAR(10) UNIQUE,
	chinese INT(3),
	english INT(3),
	math  INT(3),
	class INT(4)
);



-- class表
CREATE TABLE class_t(
	id int NOT NULL PRIMARY KEY,
	name VARCHAR(10)
);

```

```java
// Student实体类
public class Student {
    private  Integer id;
    private  String name;
    private  Integer chinese;
    private  Integer english;
    private  Integer math;
    private Integer class_t;
    private Classes c;
}


// class的实体类
public class Classes {
    private Integer id;
    private String name;
    private List<Student> students;
}

```

> student类中包含一个classes,这里需要用到`association`
>
> classes中包含一个studen的List,这里需要用到`collection`



## association

```xml
<resultMap id="studentWithClass" type="student">
    <result property="id" column="sid"/>
    <result property="name" column="sname"/>
    <result property="chinese" column="chinese"/>
    <result property="english" column="english"/>
    <result property="math" column="math"/>
    <result property="class_t" column="cid"/>
    <association property="c" javaType="classes">
        <id property="id" column="cid"/>
        <result property="name" column="cname"/>
    </association>
</resultMap>
```

> `association`中的`property`和之前的一致,指的是在实体类中值
>
> `javaType`:指的是`association`关联的`java`实体类,可以写全限定名,也可以写别名
>
> 其它就和普通一样,里面可以进行嵌套

## collection

```xml
<resultMap id="ClassStudnes" type="classes">
    <id property="id" column="id"/>
    <result property="name" column="name"/>
    <collection property="students" ofType="com.fsl.pojo.Student"
                select="com.fsl.dao.StudentMapper.getStudentByClass" column="id"/>
</resultMap>
    <!-- select:指的是对应xml的namespace + 对应xml中的代码片段的id -->
    <!-- ofType:指的是每个元素的类名.设置别名了,可以直接写别名 -->
    <!-- column:指上面的select方法的实参 -->
<select id="getClassStudents" resultMap="ClassStudnes">
    select id, name
    from classes
    where id=#{id};
</select>
```

