## 相关配置文件



### maven依赖

```xml
        <!--mybatis-->
        <dependency>
            <groupId>org.mybatis</groupId>
            <artifactId>mybatis</artifactId>
            <version>3.5.10</version>
        </dependency>
        <!--mysql-->
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>8.0.30</version>
        </dependency>
```



### mybatis-config.xml

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE configuration
        PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-config.dtd">
<configuration>
    <properties resource="$FileName">
        <property name="test" value="123"/>
    </properties>
    <typeAliases>
        <package name="com.fsl.pojo"/>
    </typeAliases>
    <environments default="development">
        <environment id="development">
            <transactionManager type="JDBC"/>
            <dataSource type="POOLED">
                <property name="driver" value="${driver}" />
                <property name="url" value="${url}" />
                <property name="username" value="${username}" />
                <property name="password" value="${password}" />
            </dataSource>
        </environment>
    </environments>
    <mappers>
        <mapper resource="$mapperFilePath"/>
    </mappers>
</configuration>
```
> `environments`:可以设置多个环境,用于不同的环境,想要改变的话,在`SqlSessionFactory`对象调用`build`方法时,可以通过参数指定,不然就是`environments`的`default`的值
>
> `mappers`: 指定对应的mapper文件的位置
>
> `properties`: `resource`指定文件位置,将properties文件中的配置导入,在下面的配置中可以使用`${}`的形式访问,`property`可以指定键值对.`resource`中配置的优先级比`property`高
>
> `typeAliases`:其中的package指的是包的位置,它会将指定位置的所有的内容进行导入,并设置别名,例如:`com.fsl.pojo.User`那么它的别名是`user`

> `mybatis-config.xml`文件的配置是有顺序properties,settings,typeAliases,typeHandlers,objectFactory,objectWrapperFactory,reflectorFactory,plugins,environments,databaseIdProvider,mappers

### MybatisUtils

```java

import org.apache.ibatis.io.Resources;
import org.apache.ibatis.session.SqlSession;
import org.apache.ibatis.session.SqlSessionFactory;
import org.apache.ibatis.session.SqlSessionFactoryBuilder;

import java.io.IOException;
import java.io.InputStream;

public class MybatisUtils {
    public static SqlSessionFactory sqlSessionFactory;
    static {
        try {
            String configFile = "mybatis-config.xml";
            InputStream inputStream = Resources.getResourceAsStream(configFile);
            sqlSessionFactory = new SqlSessionFactoryBuilder().build(inputStream);
        }catch (IOException e){
            e.printStackTrace();
        }

    }
    public static SqlSession getSqlSession(){
        return sqlSessionFactory.openSession();
    }
}

```



### Mapper.xml

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="$javaInterfaceName">
    
</mapper>
```

> `namespace`:指定的java接口的全限定名

## resultMap

### collection

```xml
<resultMap id="ClassStudnes" type="classes">
    <id property="id" column="id"/>
    
    <result property="name" column="name"/>
    <collection property="students" ofType="com.fsl.pojo.Student"
                select="com.fsl.dao.StudentMapper.getStudentByClass" column="id"/>
</resultMap>
    <!-- select:指的是对应xml的namespace + 对应xml中的代码片段的id -->
    <!-- ofType:指的是每个元素的类名.设置别名了,可以直接写别名 -->
    <!-- column:指的是调用这个select语句,需要传入的参数 -->
<select id="getClassStudents" resultMap="ClassStudnes">
    select id, name
    from classes
    where id=#{id};
</select>
```









![image-20220912133532853](https://cdn.jsdelivr.net/gh/2822132073/image/202209121335822.png)

> Mapper文件中的语句的`id`要和`Interface`中的方法名一致

### 一对多的单表多次查询

```xml
<resultMap id="ClassStudnes" type="classes">
    <id property="id" column="id"/>
    <result property="name" column="name"/>
    <collection property="students" ofType="com.fsl.pojo.Student"
                select="com.fsl.dao.StudentMapper.getStudentByClass" column="id"/>
</resultMap>
    <!-- select:指的是对应xml的namespace + 对应xml中的代码片段的id -->
    <!-- ofType:指的是每个元素的类名.设置别名了,可以直接写别名 -->
    <!-- column:指的是调用这个select语句,需要传入的参数 -->
<select id="getClassStudents" resultMap="ClassStudnes">
    select id, name
    from classes
    where id=#{id};
</select>
```

#### 在collection中使用select

```xml
<resultMap id="studentInfo" type="com.fsl.pojo.Student">
    <id property="id" column="id"/>
    <result property="name" column="name"/>
    <association property="classRef" javaType="com.fsl.pojo.ClassRef"
                 select="com.fsl.dao.ClassRefMapper.queryClassById" column="class_id">
    </association>
    <collection property="courseList" ofType="com.fsl.pojo.Course"
                select="queryStudentCourseBySid" column="id">
    </collection>
</resultMap>
```

> 在`collection`中使用`select`,我们需要对使用调用的方法的返回的数据进行处理,而不是在`collection`中进行处理,就像下面这样

```xml
<resultMap id="CourseMap" type="com.fsl.pojo.Course">
    <id column="cid" property="id"/>
    <result column="cname" property="name"/>
</resultMap>
<select id="queryStudentCourseBySid" parameterType="int" resultMap="CourseMap">
    select c.id as cid,c.name as cname
    from c_and_s cas
    join course c on c.id = cas.cid
    where cas.sid = #{id}
</select>
```

> 而不是

```xml
<collection property="courseList" ofType="com.fsl.pojo.Course"
            select="queryStudentCourseBySid" column="id">
    <id property="id" column="cid"/>
    <result property="name" column="cname"/>
</collection>
```



## 动态SQL

### if

[例子](http://m.biancheng.net/mybatis/if.html)

```sql
<if test="判断条件">
    SQL语句
</if>
```

> 一般条件是`type!=null`判断某个值是否为空

```xml
<select id="selectAllWebsite" resultMap="myResult">
    select id,name,url from website
    <if test="name != null">
        where name like #{name}
    </if>
</select>
```



### choose (when, otherwise)

[例子相关](http://m.biancheng.net/mybatis/choose-when-otherwise.html)

```xml
<choose>
    <when test="判断条件1">
        SQL语句1
    </when >
    <when test="判断条件2">
        SQL语句2
    </when >
    <when test="判断条件3">
        SQL语句3
    </when >
    <otherwise>
        SQL语句4
    </otherwise>
</choose>
```

> 当`when`中某一个条件成立,就不会向下判断了,相当于`switch-case`,最后的`otherwise`相当于`switch-case`中的`default`

```xml
<select id="selectWebsite"
        parameterType="net.biancheng.po.Website"
        resultType="net.biancheng.po.Website">
    SELECT id,name,url,age,country
    FROM website WHERE 1=1
    <choose>
        <when test="name != null and name !=''">
            AND name LIKE CONCAT('%',#{name},'%')
        </when>
        <when test="url != null and url !=''">
            AND url LIKE CONCAT('%',#{url},'%')
        </when>
        <otherwise>
            AND age is not null
        </otherwise>
    </choose>
</select>
```



### where

> zai执行where语句,用到if标签时,需要在后面写到`where 1=1`,以免if标签一个条件都不成立的情况出现,那样的话就会报错,where标签会自动添加where关键字,并且自动识别`AND|OR`关键字,删除多余的关键字

```xml
<where>
    <if test="判断条件">
        AND/OR ...
    </if>
</where>
```

> 注意:必须要写`and|or`,where标签可以做到自动删除,无法做到自动删除

```xml
<select id="selectWebsite" resultType="net.biancheng.po.Website">
    select id,name,url from website
    <where>
        <if test="name != null">
            AND name like #{name}
        </if>

        <if test="url!= null">
            AND url like #{url}
        </if>
    </where>
</select>
```



### set

> 相同的问题也会在update语句中出现,最后一个set后面不需要逗号,而哪一个是最后一个无法确定,所以有了set,
>
> set 标签可以为 SQL 语句动态的添加 set 关键字，剔除追加到条件末尾多余的逗号。

```xml
    <update id="updateStudentBySet" >
        update student
        <set>
            <if test="name != null">name = #{name},</if>
            <if test="chinese != null">chinese = #{chinese},</if>
            <if test="english != null">english = #{english},</if>
            <if test="math != null">math = #{math},</if>
            <if test="class != null">class = #{class}</if>
        </set>
        where id=#{id};
    </update>
```

> 注意,where条件需要写到最后,每个if标签里面的sql语句需要在末尾加上逗号





### trim (where, set)

```xml
<trim prefix="前缀" suffix="后缀" prefixOverrides="忽略前缀字符" suffixOverrides="忽略后缀字符">
    SQL语句
</trim>
```

> `prefix`:固定在sql前面添加一段字符 
>
> `suffix`:固定在sql后面添加一段字符
>
>  `prefixOverrides`:指定开头有哪些字符,就忽略哪些字符,如果需要指定多个字符,使用`|`分隔开,例如:`and|or|AND|OR`
>
> `suffixOverrides`:指定后面有哪些字符,就忽略哪些字符

```xml
<select id="queryByStudentTrimWhere" resultMap="studentMap">
    select *
    from student
    <trim prefixOverrides="AND|OR|and|or"  prefix="WHERE">
        <if test="math!=null">AND math>#{math}</if>
        <if test="english!=null">AND  english>#{english}</if>
    </trim>
</select>
```

> 实现where的功能

```xml
<update id="updateStudentByTrimSet">
    update student
    <trim prefix="set" suffixOverrides="," suffix="where id= #{id}">
        <if test="name != null">name = #{name},</if>
        <if test="chinese != null">chinese = #{chinese},</if>
        <if test="english != null">english = #{english},</if>
        <if test="math != null">math = #{math},</if>
        <if test="class != null">class = #{class},</if>
    </trim>
</update>

```

> 实现set标签的功能

### foreach

> `collection`: 表示迭代集合的名称，可以使用`@Param`注解指定,如果传入的参数是一个pojo,它里面有一个List,可以直接指定这个List的属性名.
> `item` :表示本次迭代获取的元素，若collection为List、Set或者数组，则表示其中的元素；若collection为map，则代表key-value的value，该参数为必选
> `open` :表示该语句以什么开始，最常用的是左括弧’(’，注意:mybatis会将该字符拼接到整体的sql语句之前，并且只拼接一次，该参数为可选项
> `close` :表示该语句以什么结束，最常用的是右括弧’)’，注意:mybatis会将该字符拼接到整体的sql语句之后，该参数为可选项
> `separator`: mybatis会在每次迭代后给sql语句append上separator属性指定的字符，该参数为可选项
> `index` :在list、Set和数组中,index表示当前迭代的位置，在map中，index代指是元素的key，该参数是可选项。

```xml
<insert id="addStudentByForeach">
    insert into student (id, name, chinese, english, math, class)
    <foreach collection="users" open="values" separator=","  item="item">
        (#{item.id},#{item.name},#{item.chinese},#{item.english},#{item.math},#{item.class_t})
    </foreach>

</insert>
```

传入的对象

```java
public class Student {
    private  Integer id;
    private  String name;
    private  Integer chinese;
    private  Integer english;
    private  Integer math;
    private Integer class_t;
}
```

接口

```java
int addStudentByForeach(@Param("users") List<Student> list);

```

### [Mybatis注解开发相关](https://blog.csdn.net/weixin_43883917/article/details/113830667)

### [Expected one result (or null) to be returned by selectOne()，but found:](https://blog.csdn.net/qq_41536791/article/details/104246507)
