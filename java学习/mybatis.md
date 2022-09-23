## 相关配置文件

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









### [Mybatis注解开发相关](https://blog.csdn.net/weixin_43883917/article/details/113830667)

### [Expected one result (or null) to be returned by selectOne()，but found:](https://blog.csdn.net/qq_41536791/article/details/104246507)
