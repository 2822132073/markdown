[教程](https://blog.csdn.net/m0_46313726/article/details/124187527)

# [原文](https://blog.csdn.net/m0_46313726/article/details/124187527)

[TOC]

# 一、什么是MybatisPlus

>   为什么要学MybatisPlus？


MybatisPlus可以节省大量时间，所有的CRUD代码都可以自动化完成


MyBatis-Plus是一个MyBatis的增强工具，在 MyBatis 的基础上只做增强不做改变，为简化开发、提高效率而生。

**特性：**

 -  **无侵入**：只做增强不做改变，引入它不会对现有工程产生影响，如丝般顺滑

 -  **损耗小**：启动即会自动注入基本 CURD，性能基本无损耗，直接面向对象操作

 -  **强大的 CRUD 操作**：内置通用 Mapper、通用 Service，仅仅通过少量配置即可实现单表大部分 CRUD 操作，更有强大的条件构造器，满足各类使用需求

 -  **支持 Lambda 形式调用**：通过 Lambda 表达式，方便的编写各类查询条件，无需再担心字段写错

 -  **支持主键自动生成**：支持多达 4 种主键策略（内含分布式唯一 ID 生成器 - Sequence），可自由配置，完美解决主键问题

 -  **支持 ActiveRecord 模式**：支持 ActiveRecord 形式调用，实体类只需继承 Model 类即可进行强大的 CRUD 操作

 -  **支持自定义全局通用操作**：支持全局通用方法注入（ Write once, use anywhere ）


 -  **内置代码生成器**：采用代码或者 Maven 插件可快速生成 Mapper 、 Model 、 Service 、 Controller 层代码，支持模板引擎，更有超多自定义配置等您来使用


 -  **内置分页插件**：基于 MyBatis 物理分页，开发者无需关心具体操作，配置好插件之后，写分页等同于普通 List 查询


 -  **分页插件支持多种数据库**：支持 MySQL、MariaDB、Oracle、DB2、H2、HSQL、SQLite、Postgre、SQLServer 等多种数据库

 -  **内置性能分析插件**：可输出 SQL 语句以及其执行时间，建议开发测试时启用该功能，能快速揪出慢查询

 -  **内置全局拦截插件**：提供全表 delete 、 update 操作智能分析阻断，也可自定义拦截规则，预防误操作

# 二、快速入门



## 2.1、创建数据库mybatis_plus

 

## 2.2、创建user表


```sql
DROP TABLE IF EXISTS user;
CREATE TABLE user
(
    id BIGINT(20) NOT NULL COMMENT '主键ID',
    name VARCHAR(30) NULL DEFAULT NULL COMMENT '姓名',
    age INT(11) NULL DEFAULT NULL COMMENT '年龄',
    email VARCHAR(50) NULL DEFAULT NULL COMMENT '邮箱',
    PRIMARY KEY (id)
);
```


## 2.3、插入数据


```sql
DELETE FROM user;

INSERT INTO user (id, name, age, email) VALUES
(1, 'Jone', 18, 'test1@baomidou.com'),
(2, 'Jack', 20, 'test2@baomidou.com'),
(3, 'Tom', 28, 'test3@baomidou.com'),
(4, 'Sandy', 21, 'test4@baomidou.com'),
(5, 'Billie', 24, 'test5@baomidou.com');
```


## 2.4、初始化项目


快速初始化一个空的spring boot 项目

## 2.5、添加依赖


引用spring boot starter 父工程


```XML
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>2.6.5</version>
    <relativePath/>
</parent>
```

引入spring-boot-starter、spring-boot-starter-test、mybatis-plus-boot-starter、h2依赖：


```XML
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>com.baomidou</groupId>
        <artifactId>mybatis-plus-boot-starter</artifactId>
        <version>3.5.1</version>
    </dependency>
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
    </dependency>
</dependencies>
```

注意：尽量不要同时导入mybatis和mybatis_plus,版本差异

## 2.6、配置(连接数据库)


在application.yml配置文件中添加MySQL数据库的相关配置：


```yaml
# DataSource Config
spring:
  datasource:
    username: root
    password: 123456
    url: jdbc:mysql:///mybatis_plus?userUnicode=true&characterEncoding=utf-8
    driver-class-name: com.mysql.cj.jdbc.Driver
```



在spring boot启动类中添加@MapperScan注解，扫描Mapper文件夹：


```java
@SpringBootApplication
@MapperScan("com.wen.mybatis_plus.mapper")  //扫描mapper
public class MybatisPlusApplication {
    public static void main(String[] args) {
        SpringApplication.run(MybatisPlusApplication.class, args);
    }
}
```


## 2.7、编码


编写实体类User.java（此处使用Lombok简化代码）


```java
import lombok.Data;
@Data
public class User {
    private Long id;
    private String name;
    private Integer age;
    private String email;
}
```

编写Mapper包下的UserMapper接口


```java
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.wen.mybatis_plus.pojo.User;
import org.apache.ibatis.annotations.Mapper;
//再对应的mapper上面实现基本的接口 BaseMapper
@Mapper
public interface UserMapper extends BaseMapper<User> {
    //所有的CRUD都已经完成
    //不需要像以前一样配置一大堆文件：pojo-dao（连接mybatis，配置mapper.xml文件）==>service-controller
}
```


>   **注意：**


 **要在主启动类上去扫描mapper包下的所有接口：@MapperScan("com.wen.mybatis_plus.mapper")**

 

 

## 2.8、开始使用


添加测试类，进行功能测试：


```java
@SpringBootTest
class MybatisPlusApplicationTests {
    //继承了BaseMapper所有的方法，可以编写自己的扩展方法
    @Autowired
    private UserMapper userMapper;
    @Test
    public void testSelect(){
        System.out.println("--------selectAll method test-------");
        //查询全部用户，参数是一个Wrapper，条件构造器，先不使用为null
        List<User> userList = userMapper.selectList(null);
        userList.forEach(System.out::println);
    }
```


>   **提示： **UserMapper中的selectList()方法的参数为MP内置的条件封装器Wrapper，所以不填写就是无任何条件.

**控制台输出：**

> User(id=1, name=Jone, age=18, email=[test1@baomidou.com](mailto:test1@baomidou.com )) User(id=2, name=Jack, age=20, email=[test2@baomidou.com](mailto:test2@baomidou.com )) User(id=3, name=Tom, age=28, email=[test3@baomidou.com](mailto:test3@baomidou.com )) User(id=4, name=Sandy, age=21, email=[test4@baomidou.com](mailto:test4@baomidou.com )) User(id=5, name=Billie, age=24, email=[test5@baomidou.com](mailto:test5@baomidou.com ))
>
> 

## 2.9、小结


以上几个步骤就已经实现User表的CRUD功能，甚至连XML文件都不用编写，以上步骤可以看出集成MyBatis-Plus非常的简单，只需要引入starter工程，并配置mapper扫描路径即可。方法都是MyBatis-Plus写好的，直接引用即可。

# 三、配置日志

>所有的SQL都是不可见的，所以在后台是希望看到SQL是怎么执行的，就必须要配置日志。


在.yml配置文件中配置日志：


```XML
#配置日志
mybatis-plus:
  configuration:
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
```



 ![](https://cdn.jsdelivr.net/gh/2822132073/image/202212282053834.png )

# 四、CRUD

 

## 4.1、插入测试


```java
//测试插入
@Test
public void testInsert(){
    User user = new User();
    user.setName("小文");
    user.setAge(21);
    user.setEmail("2312103645@qq.com");
    int insert = userMapper.insert(user);//如果没有设置id，那么会自动生成id
    System.out.println(insert);//受影响行数
    System.out.println(user);//id会自动回填
}
```

&nbsp;![](https://cdn.jsdelivr.net/gh/2822132073/image/202212282054802.png )



>   数据库插入ID默认值为全局唯一ID

## 4.2、自定义ID生成器


在复杂分布式系统中，往往需要大量的数据和消息进行唯一标识。比如支付宝每一个账号在数据库分表后都需要有一个**唯一**ID做标识。此时一个能够生成全局唯一ID的系统是非常必要的。


所以，生成的ID需要具备一下特点：

1.  全局唯一性：不能出现重复的ID号，既然是唯一标识，这是最基本的要求。


2.  趋势递增：在MySQL InnoDB引擎中使用的是聚集索引，由于多数RDBMS使用B-tree的数据结构来存储索引数据，在主键的选择上面我们应该尽量使用有序的主键保证写入性能。


3.  单调递增：保证下一个ID一定大于上一个ID，例如事务版本号、IM增量消息、排序等特殊需求。


4.  信息安全：如果ID是连续的，恶意用户的扒取工作就非常容易做了，直接按照顺序下载指定URL即可；如果是订单号就更危险了，竞对可以直接知道我们一天的单量。所以在一些应用场景下，会需要ID无规则、不规则。

 

>   上述123对应三类不同的场景，3和4需求还是互斥的，无法使用同一个方案满足。

>   在这里只讲两种自动生成ID的方案UUID和[SnowFlake](https://so.csdn.net/so/search?q=SnowFlake&amp;spm=1001.2101.3001.7020 


可以查看有哪些方法，查看源码：


在用户ID上添加@TableId注解，里面的值便是使用主键自动生成的方法

>   自 3.3.0 开始,默认使用[雪花算法](https://so.csdn.net/so/search?q=%E9%9B%AA%E8%8A%B1%E7%AE%97%E6%B3%95&amp;spm=1001.2101.3001.7020 )+UUID(不含中划线)


```java
@Data
public class User {
    //对应数据库中的主键（UUID、自增id、雪花算法、redis、zookeeper）
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;
    private String name;
    private Integer age;
    private String email;
}
```


>   点击 IdType查看源码看有哪些自动生成方法


```java
/**
 * 生成ID类型枚举类
 *
 * @author hubin
 * @since 2015-11-10
 */
@Getter
public enum IdType {
    /**
     * 数据库ID自增
     * <p>该类型请确保数据库设置了 ID自增 否则无效</p>
     */
    AUTO(0),
    /**
     * 该类型为未设置主键类型(注解里等于跟随全局,全局里约等于 INPUT)
     */
    NONE(1),
    /**
     * 用户输入ID
     * <p>该类型可以通过自己注册自动填充插件进行填充</p>
     */
    INPUT(2),
​
    /* 以下3种类型、只有当插入对象ID 为空，才自动填充。 */
    /**
     * 分配ID (主键类型为number或string）,
     * 默认实现类 {@link com.baomidou.mybatisplus.core.incrementer.DefaultIdentifierGenerator}(雪花算法)
     *
     * @since 3.3.0
     */
    ASSIGN_ID(3),
    /**
     * 分配UUID (主键类型为 string)
     * 默认实现类 {@link com.baomidou.mybatisplus.core.incrementer.DefaultIdentifierGenerator}(UUID.replace("-",""))
     */
    ASSIGN_UUID(4);
​
    private final int key;
​
    IdType(int key) {
        this.key = key;
    }
}   
```


### 4.2.1、UUID


UUID(Universally Unique Identifier)的标准型式包含32个16进制数字，以连字号分为五段，形式为8-4-4-4-12的36个字符，示例： ` 550e8400-e29b-41d4-a716-446655440000 ` ，到目前为止业界一共有5种方式生成UUID，详情见IETF发布的UUID规范 [A Universally Unique IDentifier (UUID) URN Namespace](http://www.ietf.org/rfc/rfc4122.txt "A Universally Unique IDentifier (UUID) URN Namespace")。


优点：

 -  性能非常高：本地生成，没有网络消耗。

缺点：

 -  没有排序，无法保证趋势递增。

 -  UUID往往使用字符串存储，查询的效率比较低。

 -  不易于存储：UUID太长，16字节128位，通常以36长度的字符串表示，很多场景不适用。

 -  信息不安全：基于MAC地址生成UUID的算法可能会造成MAC地址泄露，这个漏洞曾被用于寻找梅丽莎病毒的制作者位置。

 -  ID作为主键时在特定的环境会存在一些问题，比如做DB主键的场景下，UUID就非常不适用：

 -  MySQL官方有明确的建议主键要尽量越短越好[4]，36个字符长度的UUID不符合要求。

 -  对MySQL索引不利：如果作为数据库主键，在InnoDB引擎下，UUID的无序性可能会引起数据位置频繁变动，严重影响性能。

### 4.2.2、SnowFlake（雪花算法）


这种方案大致来说是一种以划分命名空间（UUID也算，由于比较常见，所以单独分析）来生成ID的一种算法，这种方案把64-bit分别划分成多段，分开来标示机器、时间等，比如在snowflake中的64-bit分别表示如下图（图片来自网络）所示：


![](https://img-blog.csdnimg.cn/a57dd106bc1a4f68bbb48aff6974c358.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAQ29kZV9CYWxk,size_20,color_FFFFFF,t_70,g_se,x_16 )

 

 

41-bit的时间可以表示（1L<<41）/(1000L*3600*24*365)=69年的时间，10-bit机器可以分别表示1024台机器。如果我们对IDC划分有需求，还可以将10-bit分5-bit给IDC，分5-bit给工作机器。这样就可以表示32个IDC，每个IDC下可以有32台机器，可以根据自身需求定义。12个自增序列号可以表示2^12个ID，理论上snowflake方案的QPS约为409.6w/s，这种分配方式可以保证在任何一个IDC的任何一台机器在任意毫秒内生成的ID都是不同的。

>   核心思想：


 使用41bit作为毫秒数，10bit作为机器的ID(5个bit是数据中心，5个bit的机器ID)，12bit作为毫秒内的流水号（意味着每个节点在每毫秒可以产生4096个ID），最后还有一个符号位，永远是0,。


优点：

 -  毫秒数在高位，自增序列在低位，整个ID都是趋势递增的。

 -  不依赖数据库等第三方系统，以服务的方式部署，稳定性更高，生成ID的性能也是非常高的。

 -  可以根据自身业务特性分配bit位，非常灵活。

缺点：

 -  强依赖机器时钟，如果机器上时钟回拨，会导致发号重复或者服务会处于不可用状态。

## 4.3、更新操作

>   所有的SQL都是自动配置的


```java
//测试更新
@Test
public void testUpdate(){
    User user = new User();
    //可以通过条件自动拼接动态SQL
    user.setId(5L);
    user.setName("id:5,修改过后");
    //updateById 参数是一个对象！
    int i = userMapper.updateById(user);
    System.out.println(i);
}
```


>   注意：updateById 参数是一个对象！而不是ID

 


![](https://cdn.jsdelivr.net/gh/2822132073/image/202212282056961.png )

 

 


![](https://img-blog.csdnimg.cn/658d373b8b4b4496b62779065b43dfe6.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAQ29kZV9CYWxk,size_20,color_FFFFFF,t_70,g_se,x_16 )


&nbsp;![](https://cdn.jsdelivr.net/gh/2822132073/image/202212282056163.png )

 

 

 

# 五、自动填充

## 5.1、什么是自动填充


在常用业务中有些属性需要配置一些默认值，MyBatis-Plus提供了实现此功能的插件,也就是自动填充功能。比如创建时间、修改时间这些操作一般都是自动化完成的，是不用去手动更新的。

## 5.2、自动填充方式

>   **方式一：数据库级别（不建议使用）**


1、在表中新增字段create_time,update_time


![](https://cdn.jsdelivr.net/gh/2822132073/image/202212282057423.png )

 

 

 

>   注意：在create_time里除了没有勾选根据当前时间戳更新外其他步骤都一样！

 


2、在此测试插入方法，需要将实体类同步！！


```java
private Data createTime;private Data updateTime;
```

3、在此更新查看


```java
//测试更新@Testpublic void testUpdate(){  &nbsp;User user = new User();  &nbsp;//可以通过条件自动拼接动态SQL  &nbsp;user.setId(5l);  &nbsp;user.setName("id:5,修改过后");  &nbsp;user.setAge(25);  &nbsp;//updateById 参数是一个对象！  &nbsp;int i = userMapper.updateById(user);  &nbsp;System.out.println(i);}
```

4、查看时间戳是否更新


![](https://img-blog.csdnimg.cn/4c4ce5cfa40b47ef975b2a2101b47fe8.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAQ29kZV9CYWxk,size_20,color_FFFFFF,t_70,g_se,x_16 )

 

>   **方式二：代码级别**


1、删除数据库的默认值，更新操作


![](https://cdn.jsdelivr.net/gh/2822132073/image/202212282057162.png )

 

 


2、注解填充字段  ` @TableField(.. fill = FieldFill.INSERT) `  生成器策略部分也可以配置！


```java
private Data createTime;
private Data updateTime;
```

3、自定义实现类 MyMetaObjectHandler 处理这个注解


![](https://img-blog.csdnimg.cn/a2b678b5a0e040e19cd882203bc6b430.png )

 

 


```java
//测试更新
@Test
public void testUpdate(){
    User user = new User();
    //可以通过条件自动拼接动态SQL
    user.setId(5l);
    user.setName("id:5,修改过后");
    user.setAge(25);
    //updateById 参数是一个对象！
    int i = userMapper.updateById(user);
    System.out.println(i);
}
```

# 六、[乐观锁](https://so.csdn.net/so/search?q=%E4%B9%90%E8%A7%82%E9%94%81&amp;spm=1001.2101.3001.7020 )和悲观锁

## 6.1、什么是乐观锁

>   乐观锁：十分乐观，认为不会出现问题，无论干什么都不会去上锁，如果出现问题，就再次更新测试值


乐观锁是对于数据冲突保持一种乐观态度，操作数据时不会对操作的数据进行加锁（这使得多个任务可以并行的对数据进行操作），只有到数据提交的时候才通过一种机制来验证数据是否存在冲突(一般实现方式是通过加版本号然后进行版本号的对比方式实现);


特点：乐观锁是一种并发类型的锁，其本身不对数据进行加锁而是通过业务实现锁的功能，不对数据进行加锁就意味着允许多个请求同时访问数据，同时也省掉了对数据加锁和解锁的过程，这种方式因为节省了悲观锁加锁的操作，所以可以一定程度的的提高操作的性能，不过在并发非常高的情况下，会导致大量的请求冲突，冲突导致大部分操作无功而返而浪费资源，所以在高并发的场景下，乐观锁的性能却反而不如悲观锁。

## 6.2、什么是悲观锁

>   悲观锁：十分悲观，认为总是出现问题，无论干什么都会上锁，再去操


悲观锁是基于一种悲观的态度类来防止一切数据冲突，它是以一种预防的姿态在修改数据之前把数据锁住，然后再对数据进行读写，在它释放锁之前任何人都不能对其数据进行操作，直到前面一个人把锁释放后下一个人数据加锁才可对数据进行加锁，然后才可以对数据进行操作，一般数据库本身锁的机制都是基于悲观锁的机制实现的;


特点：可以完全保证数据的独占性和正确性，因为每次请求都会先对数据进行加锁， 然后进行数据操作，最后再解锁，而加锁释放锁的过程会造成消耗，所以性能不高;

## 6.3、配置乐观锁

>   本文主要讲解乐观锁机制


乐观锁实现方式：

 -  取出记录时，获取当前version

 -  更新时，带上这个version

 -  执行更新时，set version = newVersion where version = oldVersion

 -  如果version不对，就更新失败

>   当要更新一条记录时，是希望这条记录没有被更新的


```sql
-- 乐观锁：1、先查询，获取版本号 version=1
-- A线程
update user name = "tian" ,version = version +1
where id = 2 and version = 1
-- 如果B线程抢先完成，这个时候version=2，就会导致A线程修改失败
-- B线程
update user name = "tian" ,version = version +1
where id = 2 and version = 1
```


>   测试MP的乐观锁插件



### 6.3.1、数据库中添加version字段


![](https://cdn.jsdelivr.net/gh/2822132073/image/202212282059768.png )

 

 


添加完成后查看是否更改完成


![](https://cdn.jsdelivr.net/gh/2822132073/image/202212282059366.png )

 

 

 

### 6.3.2、同步实体类

 

>   记得在实体类上加上@Version注解

 


```java
@Version    //乐观锁version注解
private Integer version;
```

![](https://cdn.jsdelivr.net/gh/2822132073/image/202212282059499.png )

 

 

 

### 6.3.3、配置插件


spring xml 方式：


```XML
<bean class="com.baomidou.mybatisplus.extension.plugins.inner.OptimisticLockerInnerInterceptor" id="optimisticLockerInnerInterceptor"/>
<bean id="mybatisPlusInterceptor" class="com.baomidou.mybatisplus.extension.plugins.MybatisPlusInterceptor">
    <property name="interceptors">
        <list>
            <ref bean="optimisticLockerInnerInterceptor"/>
        </list>
    </property>
</bean>
```




>   这里讲解的是springboot的注解方式

 


spring boot 的注解方式


```java
@Bean
public MybatisPlusInterceptor mybatisPlusInterceptor() {
    MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
    interceptor.addInnerInterceptor(new OptimisticLockerInnerInterceptor());
    return interceptor;
}
```

首先创建配置类文件config，在该文件下创建配置类MyBatisPlusConfig，该类需要添加三个注解：


```java
@Configuration  //配置类
@MapperScan("com.wen.mybatis_plus.mapper")  //扫描mapper
@EnableTransactionManagement    //自动管理事务，默认是开启的
```


>   @MapperScan()是将原先MybatisPlusApplication中的扫描换到这里的,所以MybatisPlusApplication中就不需要@MapperScan()，在该配置类里添加@MapperScan()即可

 


创建完MyBatisPlusConfig类并添加完注解后，就可以将上面的组件的注解方式填入进来


```java
@Configuration  //配置类
@MapperScan("com.wen.mybatis_plus.mapper")  //扫描mapper
@EnableTransactionManagement
public class MyBatisPlusConfig {
    //注册乐观锁插件
    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        interceptor.addInnerInterceptor(new OptimisticLockerInnerInterceptor());
        return interceptor;
    }
}
```

此时乐观锁就已经配置完成了！


![](https://cdn.jsdelivr.net/gh/2822132073/image/202212282100345.png )

 

 

 

### 6.3.4、测试乐观锁


在测试类中分别对成功与失败进行测试


测试成功：


```java
//测试成功的乐观锁@Testvoid testOptimisticLocker_success() {  &nbsp;//1.查询用户信息  &nbsp;User user = userMapper.selectById(1l);  &nbsp;//2.修改用户信息  &nbsp;user.setName("tian");  &nbsp;user.setAge(21);  &nbsp;//3.执行更新操作  &nbsp;userMapper.updateById(user);}
```

结果如下：


![](https://img-blog.csdnimg.cn/6a5824ec48ab493dbdad2e41e1aab84e.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAQ29kZV9CYWxk,size_20,color_FFFFFF,t_70,g_se,x_16 )

 

 


测试失败：

 

>   模拟多线程的方式执行插队操作

 


```java
//测试成功的乐观锁
@Test
void testOptimisticLocker_success() {
    //1.查询用户信息
    User user = userMapper.selectById(1l);
    //2.修改用户信息
    user.setName("tian");
    user.setAge(21);
    //3.执行更新操作
    userMapper.updateById(user);
}
```

查看控制台输出：


![](https://cdn.jsdelivr.net/gh/2822132073/image/202212282100392.png )

 


从数据库看结果：


![](https://cdn.jsdelivr.net/gh/2822132073/image/202212282100631.png )

 

 

# 七、增删改查

 

## 7.1、查询操作


1.通过Id查询用户


```java
//测试查询
@Test
public void testSelectById(){
    User user = userMapper.selectById(1L);
    System.out.println(user);
}
```

结果：


![](https://cdn.jsdelivr.net/gh/2822132073/image/202212282100681.png )

 


2.批量查询


```java
//批量查询
@Test
public void selectBatchIds(){
    List<User> users = userMapper.selectBatchIds(Arrays.asList(1, 2, 3));
    users.forEach(System.out::println);
}
```


>   批量查询通过selectBatchIds方法，方法内放入的是集合，可以通过源码看

 


selectBatchIds方法源码：


```java
/**
 * 查询（根据ID 批量查询）
 *
 * @param idList 主键ID列表(不能为 null 以及 empty)
 */
List<T> selectBatchIds(@Param(Constants.COLLECTION) Collection<? extends Serializable> idList);
```


>   可以看到参数是Collection也就是集合，这里使用的是Arrays集合

 


结果：![](https://cdn.jsdelivr.net/gh/2822132073/image/202212282101700.png )

 

3.条件查询 

>   通过自定义条件查询


```java
//条件查询
@Test
public void selectByMap(){
    HashMap<String,Object> map = new HashMap<>();
    //自定义查询
    map.put("name","小文");
    map.put("age",20);
    List<User> users = userMapper.selectByMap(map);
    users.forEach(System.out::println);
}
```


>   可以看出，map类的参数（字段名，参数）会被MySQLPlus自动组合成查询条件


&nbsp;![](https://cdn.jsdelivr.net/gh/2822132073/image/202212282101655.png )

 

 

 

## 7.2、分页查询

 

 -  原始的limit进行分页

 -  pageHelper第三方插件

 -  MyBatisPlus内置分页插件

>   支持数据库：

 -  mysql，oracle，db2，h2，hsql，sqlite，postgresql，sqlserver，Phoenix，Gauss ，clickhouse，Sybase，OceanBase，Firebird，cubrid，goldilocks，csiidb

 -  达梦数据库，虚谷数据库，人大金仓数据库，南大通用(华库)数据库，南大通用数据库，神通数据库，瀚高数据库

>   属性介绍

 


|  属性名  |   类型   | 默认值 |                   描述                   |
| :------: | :------: | :----: | :--------------------------------------: |
| overflow | boolean  | false  |   溢出总页数后是否进行处理(默认不处理)   |
| maxLimit |   Long   |        |       单页分页条数限制(默认无限制)       |
|  dbType  |  DbType  |        | 数据库类型(根据类型获取应使用的分页方言) |
| dialect  | IDialect |        |                方言实现类                |

>   建议单一数据库类型的均设置 dbType

>   如何使用MyBatisPlus内页插件？


1、配置拦截器组件即可


```java
/**
 * 注册插件
 */
@Bean
public MybatisPlusInterceptor paginationInterceptor() {
    MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
    // 添加分页插件
    PaginationInnerInterceptor pageInterceptor = new PaginationInnerInterceptor();
    // 设置请求的页面大于最大页后操作，true调回到首页，false继续请求。默认false
    pageInterceptor.setOverflow(false);
    // 单页分页条数限制，默认无限制
    pageInterceptor.setMaxLimit(500L);
    // 设置数据库类型
    pageInterceptor.setDbType(DbType.MYSQL);
    interceptor.addInnerInterceptor(pageInterceptor);
    return interceptor;
}
```

2、分页组件测试


```java
//测试MybatisPlus分页插件
@Test
public void testMybatisPlus_Page(){
    // 两个参数：current的值默认是1，从1开始，不是0。size是每一页的条数。
    Page<User> page = new Page<>(1, 4);
    userMapper.selectPage(page,null);
    page.getRecords().forEach(System.out::println);
}
```

结果分析：


![](https://cdn.jsdelivr.net/gh/2822132073/image/202212282102238.png )

 


查询第二页试试看


![](https://cdn.jsdelivr.net/gh/2822132073/image/202212282102233.png )

 

 

>   除此之外，Page 的方法还有很多比如：

 


```java
//page的其他方法
System.out.println("当前页：" + page.getCurrent());
System.out.println("总页数：" + page.getPages());
System.out.println("记录数：" + page.getTotal());
System.out.println("是否有上一页：" + page.hasPrevious());
System.out.println("是否有下一页：" + page.hasNext());
```

结果：


&nbsp;![](https://cdn.jsdelivr.net/gh/2822132073/image/202212282103283.png )

 

 

## 7.3、删除操作

>   跟查询操作相似，就不详细讲解，直接上代码了 


```java
//测试删除
@Test
public void testDeleteById(){
    userMapper.deleteById(4L);
}
​
//批量删除
@Test
public void testDeleteBatchId(){
    userMapper.deleteBatchIds(Arrays.asList(1L,2L));
}
​
//通过map删除
@Test
public void testdeleteByMap(){
    Map<String, Object> map = new HashMap<>();
    map.put("name","xiaotian");
    userMapper.deleteByMap(map);
}
```

## 7.4、逻辑删除

>   物理删除：从数据库中直接删除
>
>   逻辑删除：在数据库中没有被删除，而是通过一个变量来让它失效。 deleted=0 ==》deleted=1


管理员可以查看被删除的记录，防止数据丢失，相当于回收站。


测试：


1、在数据表中增加一个deleted字段


![](https://cdn.jsdelivr.net/gh/2822132073/image/202212282104520.png )

 


2、同步实体类，在实体类上加上@TableLogic 注解


```java
@TableLogic //逻辑删除
private Integer deleted;
```

3、配置application.yml文件


```yaml
#配置日志
mybatis-plus:
  global-config:
    db-config:
      logic-delete-field: flag # 全局逻辑删除的实体字段名(since 3.3.0,配置后可以忽略不配置步骤2)
      logic-delete-value: 1 # 逻辑已删除值(默认为 1)
      logic-not-delete-value: 0 # 逻辑未删除值(默认为 0)
```

4、测试


在这里直接使用之前的delete测试


```java
//测试删除
@Test
public void testDeleteById(){
    userMapper.deleteById(4L);
}
```


>   查看日志输出可以看到，delete的语句以经发生了更改


 实质上就是update（修改）语句，将deleted字段从1修改为0

 


![](https://cdn.jsdelivr.net/gh/2822132073/image/202212282104116.png )&nbsp;&nbsp;

 

5、对Id为4的用户进行查询


```java
//测试查询
@Test
public void testSelectById(){
    User user = userMapper.selectById(4L);
    System.out.println(user);
}
```


>   查看日志输出可以看到，seletc的语句以经发生了更改


 增加了deleted的判断语句，判断deleted是否为1，为1则能搜索，0则不能


&nbsp;![](https://cdn.jsdelivr.net/gh/2822132073/image/202212282104355.png )

 


6、小结


只对自动注入的SQL有效：

 -  插入: 不作限制

 -  查找: 追加 where 条件过滤掉已删除数据,且使用 wrapper.entity 生成的 where 条件会忽略该字段

 -  更新: 追加 where 条件防止更新到已删除数据,且使用 wrapper.entity 生成的 where 条件会忽略该字段

 -  删除: 转变为 更新

比如：


删除语句转化为：update user set deleted=1 where id = 1 and deleted=0


查找语句转化为：select id,name,deleted from user where deleted=0

 

>注意事项： 
>
>  -  逻辑删除是为了方便数据恢复和保护数据本身价值等等的一种方案，但实际就是删除。
>
>  -  如果你需要频繁查出来看就不应使用逻辑删除，而是以一个状态去表示。



 

# 八、执行SQL分析打印

 

>   可输出 SQL 语句以及其执⾏时间，建议开发测试时启⽤该功能，能快速揪出慢查询
>
>   注意：PerformanceInterceptor在3.2.0被移除了，如果想进⾏性能分析，⽤第三⽅的，官⽅这样写的“该插件 3.2.0 以上版本移除 推荐使⽤第三⽅扩展 执⾏SQL分析打印 功能”。也就是p6spy。


使用步骤：

## 8.1、p6spy依赖引入


Maven:


```XML
<dependency>
  <groupId>p6spy</groupId>
  <artifactId>p6spy</artifactId>
  <version>最新版本</version> <!--这里用的是>3.9.1版本-->
</dependency>
```


## 8.2、application.yml配置


```yaml
spring:
  datasource:
    driver-class-name: com.p6spy.engine.spy.P6SpyDriver
    url: jdbc:p6spy:h2:mem:test
    ...
```


>   注意： driver-class-name 为 p6spy 提供的驱动类 url 前缀为 jdbc:p6spy 跟着冒号为对应数据库连接地址


实际配置为：


```yaml
spring:
  datasource:
    username: root
    password: 123456
    driver-class-name: com.p6spy.engine.spy.P6SpyDriver
    url: jdbc:p6spy:mysql:///mybatis_plus?userUnicode=true&characterEncoding=utf-8
```

&nbsp;![](https://cdn.jsdelivr.net/gh/2822132073/image/202212282106224.png )

 

 

## 8.3、spy.properties配置


```properties
#3.2.1以上使用
modulelist=com.baomidou.mybatisplus.extension.p6spy.MybatisPlusLogFactory,com.p6spy.engine.outage.P6OutageFactory
#3.2.1以下使用或者不配置
#modulelist=com.p6spy.engine.logging.P6LogFactory,com.p6spy.engine.outage.P6OutageFactory
# 自定义日志打印
logMessageFormat=com.baomidou.mybatisplus.extension.p6spy.P6SpyLogger
#日志输出到控制台
appender=com.baomidou.mybatisplus.extension.p6spy.StdoutLogger
# 使用日志系统记录 sql
#appender=com.p6spy.engine.spy.appender.Slf4JLogger
# 设置 p6spy driver 代理
deregisterdrivers=true
# 取消JDBC URL前缀
useprefix=true
# 配置记录 Log 例外,可去掉的结果集有error,info,batch,debug,statement,commit,rollback,result,resultset.
excludecategories=info,debug,result,commit,resultset
# 日期格式
dateformat=yyyy-MM-dd HH:mm:ss
# 实际驱动可多个
#driverlist=org.h2.Driver
# 是否开启慢SQL记录
outagedetection=true
# 慢SQL记录标准 2 秒
outagedetectioninterval=2
```

![](https://cdn.jsdelivr.net/gh/2822132073/image/202212282106817.png )

 

 

## 8.4、测试


这里使用之前的分页查询来测试一下


```java
//测试MybatisPlus分页插件
@Test
public void testMybatisPlus_Page(){
    // 两个参数：current的值默认是1，从1开始，不是0。size是每一页的条数。
    Page<User> page = new Page<>(2, 4);
    userMapper.selectPage(page,null);
    page.getRecords().forEach(System.out::println);
    //page的其他方法
    System.out.println("当前页：" + page.getCurrent());
    System.out.println("总页数：" + page.getPages());
    System.out.println("记录数：" + page.getTotal());
    System.out.println("是否有上一页：" + page.hasPrevious());
    System.out.println("是否有下一页：" + page.hasNext());
}
```

查看日志输出


&nbsp;![](https://cdn.jsdelivr.net/gh/2822132073/image/202212282106566.png )

 

>   因为在配置文件中设置了慢SQL的检查，为2s，所以这里的查询可以通过 但是只要超过了时长就会抛出异常







![](https://cdn.jsdelivr.net/gh/2822132073/image/202212282106506.png )

 

 

 

# 九、条件构造器

>   Wrapper，可以通过其构造复杂的SQL

 


![](https://img-blog.csdnimg.cn/b21f51efab564f7a97c3e1485c2b8258.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAQ29kZV9CYWxk,size_4,color_FFFFFF,t_70,g_se,x_16 )

 

 

 

>   注意： 
>
>   1、耦合性高
>
>
>   2、传输wrapper相当于conroller用map接收值，后期维护极为困难
>
>
>   所以这里只是采取少量代码进行演示
>
>   



 

## 9.1、代码演示


1、查询name、邮箱不为空且年龄大于等于20的用户


```java
@Test
void WrapperTest(){
    //查询name、邮箱不为空且年龄大于等于20的用户
    QueryWrapper<User> wrapper = new QueryWrapper<>();
    wrapper
            .isNotNull("name")
            .isNotNull("email")
            .ge("age",12);
    userMapper.selectList(wrapper).forEach(System.out::println);
}
```

![](https://cdn.jsdelivr.net/gh/2822132073/image/202212282107299.png )

 

 


2、查询姓名为小文的用户


```java
@Test
void WrapperTest3(){
    //查询年龄在19-23之间的用户
    QueryWrapper<User> wrapper = new QueryWrapper<>();
    wrapper.between("age", 19, 23);
    Long count = userMapper.selectCount(wrapper);//查询结果数
    System.out.println(count);
}
```

![](https://img-blog.csdnimg.cn/d6685095f47047b384e80b1afb590ae9.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAQ29kZV9CYWxk,size_20,color_FFFFFF,t_70,g_se,x_16 )

 

>注意： 查询一个数据出现多个结果就使用List或map



3、查询年龄在19-23之间的用户


```java
@Test
void WrapperTest3(){
    //查询年龄在19-23之间的用户
    QueryWrapper<User> wrapper = new QueryWrapper<>();
    wrapper.between("age", 19, 23);
    Long count = userMapper.selectCount(wrapper);//查询结果数
    System.out.println(count);
}
```



4、查询年龄在19-23之间的用户


```java
@Test
void WrapperTest3(){
    //查询年龄在19-23之间的用户
    QueryWrapper<User> wrapper = new QueryWrapper<>();
    wrapper.between("age", 19, 23);
    Long count = userMapper.selectCount(wrapper);//查询结果数
    System.out.println(count);
}
```

&nbsp;![](https://cdn.jsdelivr.net/gh/2822132073/image/202212282108142.png )

 

>   这里的方法取值范围是左开右闭！

 


5、模糊查询


```java
@Test
void WrapperTest4(){
    QueryWrapper<User> wrapper = new QueryWrapper<>();
    wrapper
            .notLike("name","a")    //查询姓名中不包含a的用户
            .likeRight("email","t");   //左和右是代表%的位置 两边都要匹配则为%e%，这里是email以t开头的 t%
    List<Map<String, Object>> maps = userMapper.selectMaps(wrapper);
    maps.forEach(System.out::println);
}
```

&nbsp;![](https://cdn.jsdelivr.net/gh/2822132073/image/202212282108627.png )

 

 


6、联表查询


```java
//联表查询@Testvoid WrapperTest5(){  &nbsp;QueryWrapper<User> wrapper = new QueryWrapper<>();  &nbsp;wrapper.inSql("id","select id from user where id < 4");  &nbsp;List<Object> objects = userMapper.selectObjs(wrapper);  &nbsp;objects.forEach(System.out::println);}
```

&nbsp;![](https://img-blog.csdnimg.cn/d88bff5a32e94bcaa4c835233425a908.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAQ29kZV9CYWxk,size_20,color_FFFFFF,t_70,g_se,x_16 )

 

 


7、通过ID进行排序


```java
//联表查询
@Test
void WrapperTest5(){
    QueryWrapper<User> wrapper = new QueryWrapper<>();
    wrapper.inSql("id","select id from user where id < 4");
    List<Object> objects = userMapper.selectObjs(wrapper);
    objects.forEach(System.out::println);
}
```

![](https://cdn.jsdelivr.net/gh/2822132073/image/202212282108461.png )

 

 

 

# 十、代码自动生成器

>   MybatisPlus看官方文档即可，这里讲一个Idea插件Easy Code代码生成器

## 10.1、EasyCode


EasyCode是基于IntelliJ IDEA Ultimate版开发的一个代码生成插件，主要通过自定义模板（基于velocity）来生成各种你想要的代码。通常用于生成Entity、Dao、Service、Controller。如果你动手能力强还可以用于生成HTML、JS、PHP等代码。理论上来说只要是与数据有关的代码都是可以生成的。


**支持的数据库类型：**

 

>  1.  MySQL
>
>
>  2.  SQL Server
>
>
>  3.  Oracle
>
>
>  4.  PostgreSQL
>
>
>  5.  Sqlite
>
>
>  6.  Sybase
>
>
>  7.  Derby
>
>
>  8.  DB2
>
>
>  9.  HSQLDB
>
>
>  10. H2
>
>  
>
>  
>
>  
>
>      当然支持的数据库类型也会随着Database Tool插件的更新同步更新。
>
>  



 

## 10.2、功能

 -  支持多表同时操作

 -  支持同时生成多个模板

 -  支持自定义模板

 -  支持自定义类型映射（支持正则）

 -  支持自定义附加列

 -  支持列附加属性

 -  所有配置项目支持分组模式，在不同项目（或选择不同数据库时），只需要切换对应的分组，所有配置统一变化

 

## 10.3、操作


1、安装EasyCode


![](https://cdn.jsdelivr.net/gh/2822132073/image/202212282109801.png )

 


2、建立数据库


这里就不再多说了，就用之前的数据库即可


3、在IDEA配置连接数据库


![](https://cdn.jsdelivr.net/gh/2822132073/image/202212282109770.png )

>   这里也不多说了，就是idea连接自己的数据库 


4、使用EasyCode


在对应的字段上右键，就可以看到多出一个EasyCode，点击然后选择生成![](https://cdn.jsdelivr.net/gh/2822132073/image/202212282110178.png )

 


5、开始生成代码


![](https://img-blog.csdnimg.cn/efbefe9b43fd4f9db3dd693276d1c58e.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAQ29kZV9CYWxk,size_16,color_FFFFFF,t_70,g_se,x_16 )

 


勾选需要生成的代码，点击OK即可


![](https://cdn.jsdelivr.net/gh/2822132073/image/202212282110725.png )

 

 


6、效果图

 


![](https://cdn.jsdelivr.net/gh/2822132073/image/202212282110111.png )

 

 

>   这些就是自动生成的代码了，代码你成熟了，应该自己生成了<狗头>

 

​                

