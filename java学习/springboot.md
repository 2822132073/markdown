# SpringBoot2项目的建立

![image-20221220153238226](https://cdn.jsdelivr.net/gh/2822132073/image/202212201533225.png)

![image-20221220153450354](https://cdn.jsdelivr.net/gh/2822132073/image/202212201534489.png)





>  新建完成之后,有很多没有用的文件,见他们删除,剩下src和pom文件

![image-20221220161621038](https://cdn.jsdelivr.net/gh/2822132073/image/202212201616333.png)

## 配置文件

![image-20221220163843244](https://cdn.jsdelivr.net/gh/2822132073/image/202212201638408.png)

> `application.properties`:原始的springboot配置文件
>
> `application.yaml`:springboot推荐的配置文件,使用yaml语法

# springboot给属性赋值的方式

## 使用@Value注解

```java
package com.fsl.pojo;


@Data
@AllArgsConstructor
@NoArgsConstructor
@Component
public class People {
    @Value("fsl")
    private String name;
    @Value("18")
    private Integer age;
    @Value("男")
    private String sex;
    private Dog dog;
}

```

```java
@SpringBootTest
class Springboot1TestApplicationTests {

    @Autowired
    private People people;
    @Test
    void contextLoads() {
        System.out.println(people);
    }

}
```



```
People(name=fsl, age=18, sex=男, dog=null)
```



## 使用@ConfigurationProperties注解

> 将数据写在`application.yaml`中,然后进行配置

## people

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
@Component
@ConfigurationProperties(prefix = "people")
public class People {
    private String name;
    private Integer age;
    private String sex;
    private Dog dog;
}

```

> People中嵌套了Dog,所以Dog也需要进行注入,当类写出有参构造方法时,需要显式写出无参构造方法,这样才能生效

## Dog

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
@Component
public class Dog {
    private String name;
}

```



## application.yaml

```yaml
people:
  name: "fsl555"
  age: 18
  sex: "男"
  dog:
    name: "小黑"
```



## test

```java
@SpringBootTest
class Springboot1TestApplicationTests {

    @Autowired
    private People people;
    @Test
    void contextLoads() {
        System.out.println(people);
    }

}
```



```
People(name=fsl555, age=18, sex=男, dog=Dog(name=小黑))
```

## 指定配置文件位置

> 主要是使用`@PropertySource`注解,指定对应的文件,默认指定的文件格式为`properties`格式,Yaml格式需要自己实现相关函数

### YamlPropertySourceFactory

> 将它放在utils包下

```java
package com.fsl.utils;

import org.springframework.beans.factory.config.YamlPropertiesFactoryBean;
import org.springframework.core.env.PropertiesPropertySource;
import org.springframework.core.env.PropertySource;
import org.springframework.core.io.support.EncodedResource;
import org.springframework.core.io.support.PropertySourceFactory;

import java.io.IOException;
import java.util.Properties;

public class YamlPropertySourceFactory implements PropertySourceFactory {

    @Override
    public PropertySource<?> createPropertySource(String name, EncodedResource encodedResource)
            throws IOException {
        YamlPropertiesFactoryBean factory = new YamlPropertiesFactoryBean();
        factory.setResources(encodedResource.getResource());

        Properties properties = factory.getObject();

        return new PropertiesPropertySource(encodedResource.getResource().getFilename(), properties);
    }
}

```

### 使用

```java
package com.fsl.pojo;


import com.fsl.utils.YamlPropertySourceFactory;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.PropertySource;
import org.springframework.stereotype.Component;


@Data
@AllArgsConstructor
@NoArgsConstructor
@Component
@ConfigurationProperties(prefix = "people")
@PropertySource(value = "classpath:application-people.yaml",factory = YamlPropertySourceFactory.class)
public class People {
    private String name;
    private Integer age;
    private String sex;
    private Dog dog;
}

```

> 通过value属性指定文件,classpath在spring差不多指的是resource目录,在编译时期,会将其中的文件拷贝到classes下
>
> ![image-20221220210752991](https://cdn.jsdelivr.net/gh/2822132073/image/202212202107445.png)
>
> 通过factory指定哪个类去处理







# 从application.yaml中导入其它值

> 文件名需要满足`application-{profile}.yaml`的格式

![image-20221220201629598](https://cdn.jsdelivr.net/gh/2822132073/image/202212202016820.png)

## application.yaml

```yaml
spring:
  profiles:
    include: people # 这里的people就是上面说的profile,这里的include指的是导入application-people.yaml文件
```

## application-people.yaml

```yaml
people:
  name: "fsl555"
  age: 18
  sex: "男"
  dog:
    name: "小黑"
```

# JSR303校验

## 可以使用的注解

### validator内置注解：

**@Null**：被注释的元素必须为null
**@NotNull**：被注释的元素必须不为null
**@AssertTrue**：被注释的元素必须为true
**@AssertFalse**：被注释的元素必须为false
**@Min(value)**：被注释的元素必须是一个数字，其值必须大于等于指定的最小值
**@Max(value)**：被注释的元素必须是一个数字，其值必须小于等于指定的最大值
**@DecimalMin(value)**：被注释的元素必须是一个数字，其值必须大于等于指定的最小值
**@DecimalMax(value)**：被注释的元素必须是一个数字，其值必须小于等于指定的最大值
**@Size(max, min)**：被注释的元素的大小必须在指定的范围内
**@Digits (integer, fraction)**：被注释的元素必须是一个数字，其值必须在可接受的范围内
**@Past**：被注释的元素必须是一个过去的日期
**@Future**：被注释的元素必须是一个将来的日期
**@Pattern(value)**：被注释的元素必须符合指定的正则表达式

### Hibernate Validator 附加的注解：

**@Email**：被注释的元素必须是电子邮箱地址

**@Length**：被注释的字符串的大小必须在指定的范围内

**@NotEmpty**：被注释的字符串的必须非空

**@Range**：被注释的元素必须在合适的范围内

**@NotBlank**：验证字符串非null，且长度必须大于0

`@NotNull，@NotEmpty和@NotBlank关于@NotNull，@NotEmpty和@NotBlank之间的区别如以下`

@NotNull 适用于任何类型，被标注的元素必须不能为null
@NotEmpty适用于String类型，Map类型或者数组，不能为null，且长度必须大于0
@NotBlank只能用于String类型，不能为null，且调用trim()后，长度必须大于0
添加完需要的校验注解之后，在请求处理方法中的接收的请求参数上添加@Valid注解，即可开启校验功能 如果是分组校验则需要 @Validated 注解

## 使用方法

### 导入依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```





### 在类上使用

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
@Component
@Validated  //这行代表开启Validated验证
public class People {
    @Size(min = 5,max = 10) // 上面写了之后,这里才可使用对应的注解
    private String name;
    private Integer age;
    private String sex;
    private Dog dog;
}
```

> 一般@Max这种注解,会有一个message属性,表示违反规则之后的报错输出的信息





# springboot配置文件顺序

![在这里插入图片描述](https://cdn.jsdelivr.net/gh/2822132073/image/202212211509804.png)

> 1. 项目根目录下的config文件夹下的**application.yaml**文件
> 2. 项目根目录下的**application.yaml**文件
> 3. classpath目录下config目录下的**application.yaml**
> 4. classpath目录下的**application.yaml**

# springboot多环境配置文件切换



## 单文件配置环境

### application.yaml

```yaml
spring:
  profiles:
    active: dev  #指定时那个环境运行

---
server:
  port: 8080
spring:
  profiles:
    default: dev  # 指定自己为哪个环境
---
server:
  port: 8081
spring:
  profiles:
    default: prod
---
server:
  port: 8082
spring:
  profiles:
    default: test

```

> `spring.profiles.default`:在springboot中不可以直接使用**spring.profiles**来指定自己是什么环境,需要使用**spring.profiles.default**
>
> `spring.profiles.active`:指定生效的是哪个环境

## 多文件配置环境

> 多文件配置环境和上面写的导入其它配置文件基本类似



### application.yaml

```yaml
spring:
  profiles:
    active: dev  
```

> 这样配置,springboot回去寻找**application-dev.yaml**文件,将其中的内容作为配置文件

# springboot整合mysql

## 默认数据源(hikari)

### 依赖

```xml
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-jdbc</artifactId>
</dependency>
```

### 配置

> 由于是默认的数据源,我们只需要在`application.yaml`中填写入相关的一些信息即可

```yaml
spring:
  datasource:
    username: root
    password: xxxx
    url: jdbc:mysql://xxxxxxxxxx/xxxx
    driver-class-name: com.mysql.cj.jdbc.Driver
```

### 测试



```java
package com.example.springboot02mysql;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;

@SpringBootTest
class Springboot02MysqlApplicationTests {

    @Autowired
    DataSource dataSource;  //自动装入数据源
    @Test
    void contextLoads() throws SQLException {
        JdbcTemplate template = new JdbcTemplate(dataSource);
        List<Map<String, Object>> m =  template.queryForList("sql语句");
        System.out.println(m);
    }
}

```





## Druid

### 依赖

> 需要`Druid`的依赖和`log4j`的依赖

```xml
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>druid</artifactId>
    <version>1.2.15</version>
</dependency>
<dependency>
    <groupId>log4j</groupId>
    <artifactId>log4j</artifactId>
    <version>1.2.17</version>
</dependency>
```

### 配置

> 与默认的数据源没啥区别,只是添加了一个**type**

```yaml
spring:
  datasource:
    username: root
    password: xxxx
    url: jdbc:mysql://xxxxxxxxxx/xxxx
    driver-class-name: com.mysql.cj.jdbc.Driver
    type: com.alibaba.druid.pool.DruidDataSource
```

### 测试

> 与上面没啥区别

### 设置一些其它的配置

```yaml
spring:
  datasource:
    username: root
    password: 123456
    url: jdbc:mysql://localhost:3306/mybatis?useUnicode=true&characterEncoding=utf-8
    driver-class-name: com.mysql.jdbc.Driver
    type: com.alibaba.druid.pool.DruidDataSource


    #Spring Boot 默认是不注入这些属性值的，需要自己绑定
    #druid 数据源专有配置

    #配置监控统计拦截的filters，stat:监控统计、log4j：日志记录、wall：防御sql注入
    filters: wall,stat,log4j

    #2.连接池配置
    #初始化连接池的连接数量 大小，最小，最大
    initial-size: 5
    min-idle: 5
    max-active: 20
    #配置获取连接等待超时的时间
    max-wait: 60000
    #配置间隔多久才进行一次检测，检测需要关闭的空闲连接，单位是毫秒
    time-between-eviction-runs-millis: 60000
    # 配置一个连接在池中最小生存的时间，单位是毫秒
    min-evictable-idle-time-millis: 30000
    validation-query: SELECT 1 FROM DUAL
    test-while-idle: true
    test-on-borrow: true
    test-on-return: false
    # 是否缓存preparedStatement，也就是PSCache  官方建议MySQL下建议关闭   个人建议如果想用SQL防火墙 建议打开
    pool-prepared-statements: true
    max-pool-prepared-statement-per-connection-size: 20
```



> 由于DruidDataSource需要使用上述的配置，在添加到容器中，就不能使用springboot自动生成，这时需要我们自己添加 DruidDataSource 组件到容器中，并绑定属性；代码如下

**编写配置类**

```java
package com.fsl.config;


import com.alibaba.druid.pool.DruidDataSource;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

@Configuration
public class DruidConfig {

    /*
       将自定义的 Druid数据源添加到容器中，不再让 Spring Boot 自动创建
       绑定全局配置文件中的 druid 数据源属性到 com.alibaba.druid.pool.DruidDataSource从而让它们生效
       @ConfigurationProperties(prefix = "spring.datasource")：作用就是将 全局配置文件中
       前缀为 spring.datasource的属性值注入到 com.alibaba.druid.pool.DruidDataSource 的同名参数中
     */
    @ConfigurationProperties(prefix = "spring.datasource")
    @Bean
    public DataSource druidDataSource() {
        return new DruidDataSource();
    }
}

```



### 配置Druid监控



## mybatis

[官方文档](http://www.mybatis.cn/category/mybatis-spring/)

### 依赖

```xml
<dependency>
    <groupId>org.mybatis.spring.boot</groupId>
    <artifactId>mybatis-spring-boot-starter</artifactId>
    <version>3.0.1</version>
</dependency>
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
</dependency>
```

### 配置

> 和原来在mvc中写mybatis的区别不大,依然是mapper文件与接口文件,但是在配置方面,需要在application.yaml中完成,原来mybatis-config.xml中的配置,几乎都可以在其中找到
>
> 在写接口是还需要加上`@Mapper`与`@Repository`
>
> 与之前的相比,现在不需要写SqlSession工具类,可以直接进行自动注入

**application.yaml**

```yaml
spring:
  datasource:
    username: root
    password: FengSiLin12345.
    url: jdbc:mysql://gz-cynosdbmysql-grp-56yht59x.sql.tencentcdb.com:21754/task_11_25
    driver-class-name: com.mysql.cj.jdbc.Driver
mybatis:
  mapper-locations: 'classpath:mapper/*.xml'  #设置mapper文件的位置,这里classpath的冒号后面不能有空格
  type-aliases-package: com.fsl.pojo # 设置别名包的位置
```



**com.fsl.pojo.Cla**

```java

package com.fsl.pojo;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Cla {
    private Integer id;
    private String name;
}

```

**com.fsl.pojo.ClaMapper**

> 这里的@Mapper标识这个接口为Mapper,也可以在使用注解`@MapperScan("com.fsl.dao")`,这个注解加在,springboot启动类的上面,`@SpringBootApplication`下面

```java
package com.fsl.dao;

import com.fsl.pojo.Cla;
import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;

import java.util.List;


@Mapper
@Repository
public interface ClaMapper {
    List<Cla> getAllCla();
}

```

**com.fsl.controller.HelloController**

```java

package com.fsl.controller;


import com.fsl.dao.ClaMapper;
import com.fsl.pojo.Cla;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class HelloController {
    @Autowired
    ClaMapper claMapper;

    @GetMapping("/cla")
    public List<Cla> clas(){
        return claMapper.getAllCla();
    }

}

```



**classpath:mapper.ClaMapper.xml**

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.fsl.dao.ClaMapper">
    <select id="getAllCla" resultType="cla">
        select *
        from cla;
    </select>
</mapper>
```





# Mybatis-plus

## [官网](https://baomidou.com/pages/24112f/)

```shel
D:.
│   mybatis-demo.iml
│   pom.xml
│
├───src
│   ├───main
│   │   ├───java
│   │   │   └───com
│   │   │       └───fsl
│   │   │           │   MybatisDemoApplication.java
│   │   │           │
│   │   │           ├───mapper
│   │   │           │       ClaMapper.java
│   │   │           │       StudentMapper.java
│   │   │           │
│   │   │           └───pojo
│   │   │                   Cla.java
│   │   │                   Student.java
│   │   │
│   │   └───resources
│   │           application.yaml
│   │
│   └───test
│       └───java
│           └───com
│               └───fsl
│                       MybatisDemoApplicationTests.java


```



## 依赖

```xml
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
</dependency>
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-boot-starter</artifactId>
    <version>3.4.3.1</version>
</dependency>
```

## 配置

**application.yaml**

> 和普通的mybatis配置没有区别

```yaml
spring:
  datasource:
    username: root
    password: FengSiLin12345.
    url: jdbc:mysql://gz-cynosdbmysql-grp-56yht59x.sql.tencentcdb.com:21754/task_11_25
    driver-class-name: com.mysql.cj.jdbc.Driver
```

## 使用

> mybatis-plus可以几乎完成所有单表操作,不需要写xml文件,但是对于联表操作,还是需要写xml

### 单表操作

**sql文件**

> 表结构

```sql
create table student
(
    id    int auto_increment primary key,
    name  varchar(10)            not null,
    sex   enum ('男', '女')      not null,
    age   int                    not null,
    major varchar(20) default '' null,
    grade int                    not null,
    claid int(10)                not null,
    constraint id unique (id),
    constraint class_fk foreign key (claid) references cla (id)
        on update cascade on delete cascade
);


create table cla
(
    id   int auto_increment primary key,
    name varchar(10) not null,
    constraint id unique (id)
);
```

#### 第一步:创建对应的pojo类

**Student.java**

```java
package com.fsl.pojo;


import com.baomidou.mybatisplus.annotation.TableField;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Student {
    private Integer id;
    private String name;
    private String sex;
    private Integer age;
    private String major;
    private Integer grade;
    private Integer claid;
}

```

**Cla.java**

```java
package com.fsl.pojo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cla {
    private Integer id;
    private String name;
}

```

#### 第二步: 创建对应的Mapper接口

> 只需要创建完成对应的接口,并且继承`BaseMapper<T>`,就可以进行单表操作,这里的T就是需要操作的实体类

**StudentMapper.java**

```java
package com.fsl.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.fsl.pojo.Student;
import org.springframework.stereotype.Repository;


@Repository
public interface StudentMapper extends BaseMapper<Student> {
}

```

#### 第三步: 在启动类上加上注释@MapperScan

> 需要指定Mapper的位置

```java
package com.fsl;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;


@MapperScan("com.fsl.mapper")
@SpringBootApplication
public class MybatisDemoApplication {

    public static void main(String[] args) {
        SpringApplication.run(MybatisDemoApplication.class, args);
    }

}

```



#### 第四步: 测试

```java
package com.fsl;

import com.fsl.mapper.StudentMapper;
import com.fsl.pojo.Student;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

@SpringBootTest
class MybatisDemoApplicationTests {

    @Autowired
    private StudentMapper studentMapper;

    @Test
    void mybatisplusTest(){
        List<Student> list = studentMapper.selectList(null);
        for (Student student : list) {
            System.out.println(student);
        }
    }
}

```

### 联表操作

> 这个的用法和之前写mybatis一样,需要xml文件

### 注释

#### @TableName

> 用在pojo类上,指定该类对应的是哪张表

#### @TableId

> 用在属性上,指定数据库的表对应哪个属性

#### @TableField

> 用在pojo类的属性上,指定对应的是哪个字段,在属性在数据库表中不存在时,可以将其设置为`exeist = false`

