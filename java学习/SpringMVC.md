# 通过注解进行开发

## 环境准备

### 依赖

![image-20221008231431338](https://cdn.jsdelivr.net/gh/2822132073/image/202210082314216.png)

### 目录结构

![image-20221008230557257](https://cdn.jsdelivr.net/gh/2822132073/image/202210082306033.png)

**web.xml**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="http://xmlns.jcp.org/xml/ns/javaee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/javaee
         http://xmlns.jcp.org/xml/ns/javaee/web-app_4_0.xsd"
         version="4.0">
    <!--1.注册servlet-->
    <servlet>
        <servlet-name>SpringMVC</servlet-name>
        <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
        <!--通过初始化参数指定SpringMVC配置文件的位置，进行关联-->
        <init-param>
            <param-name>contextConfigLocation</param-name>
            <param-value>classpath:springmvc-servlet.xml</param-value>
        </init-param>
        <!-- 启动顺序，数字越小，启动越早 -->
        <load-on-startup>1</load-on-startup>
    </servlet>

    <!--所有请求都会被springmvc拦截 -->
    <servlet-mapping>
        <servlet-name>SpringMVC</servlet-name>
        <url-pattern>/</url-pattern>
    </servlet-mapping>
</web-app>
```

> 这个文件一般是固定的,一般不需要进行改变

**springmvc-servlet.xml**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xmlns:mvc="http://www.springframework.org/schema/mvc"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
       http://www.springframework.org/schema/beans/spring-beans.xsd
       http://www.springframework.org/schema/context
       https://www.springframework.org/schema/context/spring-context.xsd
       http://www.springframework.org/schema/mvc
       https://www.springframework.org/schema/mvc/spring-mvc.xsd">

    <!-- 自动扫描包，让指定包下的注解生效,由IOC容器统一管理 -->
    <context:component-scan base-package="com.fsl.controller"/>
    <!-- 让Spring MVC不处理静态资源 -->
    <mvc:default-servlet-handler />
    <!--
    支持mvc注解驱动
        在spring中一般采用@RequestMapping注解来完成映射关系
        要想使@RequestMapping注解生效
        必须向上下文中注册DefaultAnnotationHandlerMapping
        和一个AnnotationMethodHandlerAdapter实例
        这两个实例分别在类级别和方法级别处理。
        而annotation-driven配置帮助我们自动完成上述两个实例的注入。
     -->
    <mvc:annotation-driven />

    <!-- 视图解析器 -->
    <!-- 这里指定的是视图的位置和相关的后缀 -->
    <bean class="org.springframework.web.servlet.view.InternalResourceViewResolver"
          id="internalResourceViewResolver">
        <!-- 前缀 -->
        <property name="prefix" value="/WEB-INF/jsp/" />
        <!-- 后缀 -->
        <property name="suffix" value=".jsp" />
    </bean>
</beans>
```

## 注解





### @Controller

> `@Controller`
> 类加上这个注解之后,其中的方法,只要返回值是String,那么就认为这个返回值是视图的位置
> 视图的位置 = `Prefix` + 这里方法的返回值 + `suffix`
> `Prefix`,`Suffix`指的是在`Spring`配置中的`internalResourceViewResolver`的属性

```java
@Controller
public class HelloAnnotation {
    /*
        @RequestMapping指定访问的路径
     */
    @RequestMapping("/hello")
    public String Hello(Model model){
        model.addAttribute("msg","helloSpringAnntation");
        return "hello"; // /WEB-INF/jsp/hello.jsp
    }
}

```



### @RequestMapping

> 一般直接在方法上面写,不在类上做定义

```java

@Controller
/*
    @RequestMapping指定访问的路径
    可以放在类和方法上,放在类上是为整个类的方法都添加上这个路径
 */
@RequestMapping("/test")
public class TestController01 { 
    //http://localhost:8080/test/t1
    @RequestMapping("/t1")
    public String t1(Model model){
        model.addAttribute("msg","t1");
        return "test";
    }
    //http://localhost:8080/test/t2
    @RequestMapping("/t2")
    public String t2(Model model){
        model.addAttribute("msg","t2");
        return "test";
    }
    //http://localhost:8080/test/t3
    @RequestMapping("/t3")
    public String t3(Model model){
        model.addAttribute("msg","t3");
        return "test";
    }
}

```

> 可以使用`RequestMapping`指定需要使用哪些方法进行访问

```java
@Controller
public class TestController03 {
    //使用 value 访问指定路径,使用method指定访问的方法,可以指定多个方法,需要使用大括号包含起来{}
    @RequestMapping(value = "/add/{a}/{b}",method = {RequestMethod.POST,RequestMethod.GET})
    public String add1(@PathVariable int a, @PathVariable int b, Model model){
        int res = a + b;
        model.addAttribute("msg",res);
        return "add";
    }
}

```



### @PathVariable

> 使用这个注解修饰变量可以从路径中取值

```java
@Controller
public class TestController02 {
    /*
      可以通过以下这种方式进行传参数,?后面的参数名必须和对应的参数一样
      http://127.0.0.1:8080/add?a=1&b=2
     */
    @RequestMapping("/add")
    public String add1(int a, int b, Model model) {
        int res = a + b;
        model.addAttribute("msg",res);
        return "add";
    }

    @RequestMapping("/add/{a}/{b}")
    public String add2(@PathVariable("a") int n1,@PathVariable("b") int n2,Model model){
        int res = n1 + n2;
        model.addAttribute("msg",res);
        return "add";
    }
}
```





### @RequestParam

> 指定**url**传入的参数名,到**java**中的映射

```java
@Controller
public class TestController02 {
/*
	http://localhost:8080/add3?n1=1&n2=2
	相当于url中的n1映射到方法中的a变量
         url中的n2映射到方法中的b变量
*/
    @RequestMapping("/add3")
    public String add3(@RequestParam("n1")int a,@RequestParam("n2")int b,Model model){
        int res = a + b;
        model.addAttribute("msg",res);
        return "add";
    }
}

```

> 这里使用的`@RequestParam`相当于把url中参数为list映射到方法中的list上





# 转发与重定向

## 区别

> 1. 转发在服务器端完成的;重定向是在客户端完成的
>
> 2. 转发的速度快;重定向速度慢
>
> 3. 转发的是同一次请求;重定向是两次不同请求
>
> 4. 转发不会执行转发后的代码;重定向会执行重定向之后的代码
>
> 5. 转发地址栏没有变化;重定向地址栏有变化
>
> 6. 转发必须是在同一台服务器下完成;重定向可以在不同的服务器下完成

## 环境说明

> 大部分与上一个相同,不同的在下面

![image-20221009221631759](https://cdn.jsdelivr.net/gh/2822132073/image/202210092216362.png)

**springmvc-servlet.xml**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xmlns:mvc="http://www.springframework.org/schema/mvc"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
       http://www.springframework.org/schema/beans/spring-beans.xsd
       http://www.springframework.org/schema/context
       https://www.springframework.org/schema/context/spring-context.xsd
       http://www.springframework.org/schema/mvc
       https://www.springframework.org/schema/mvc/spring-mvc.xsd">

    <!-- 自动扫描包，让指定包下的注解生效,由IOC容器统一管理 -->
    <context:component-scan base-package="com.fsl.controller"/>
    <mvc:default-servlet-handler />
    <mvc:annotation-driven />


</beans>
```

> 和上文不同的是,去掉了视图解析器

## 具体说明



**TestController01**

```java
@Controller
public class TestController01 {
    @RequestMapping("/forward")
    public String forward(){
        return "forward:/WEB-INF/jsp/test.jsp";
        //在返回值前面加上forward,可以将请求转发到这个位置
    }

    @RequestMapping("/redirect")
    public String redirect(){
        return "redirect:/index.jsp";
        //将访问地址重定向到这个地址,使用redirect会出现两次请求
        //一次是请求http:localhost:8080/redirect,另外一次是访问http:localhost:8080/index.jsp
        //浏览器的的链接地址会出现改变
    }
}

```





# 对象的处理

## 环境说明

> 使用的是**注解开发的环境**的环境,添加了一个pojo类,添加了一个**lombok**的包,在User类使用了相关注解

![image-20221009225742917](https://cdn.jsdelivr.net/gh/2822132073/image/202210092257271.png)

## 代码

**User.java**

```java
package com.fsl.pojo;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class User {
    private Integer id;
    private Integer age;
    private  String name;
}

```

**TestController04.java**

```java

/*
http://localhost:8080/t4?id=1&age=18&name=adsasd
在浏览器输入以上地址
会在控制台得到一下结果
User(id=1, age=18, name=adsasd)
*/

@Controller
public class TestController04 {
    @RequestMapping("/t4")
    public String test(User user){
        System.out.println(user);
        return "test";
    }
}

```

> 使用这种方式,在url中使用的参数名必须和pojo类中的属性名必须相同,不然无法进行映射





## 对象中包含对象

> 在有些情况下会存在类中的字段是另外一个类

**User**

```java
package com.fsl.pojo;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class User {
    private Integer id;
    private Integer age;
    private  String name;
    private Address address;
}

```



**Address**

```java
package com.fsl.pojo;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Address {
    private String country;
    private String city;
}

```



```java
package com.fsl.controller;


import com.fsl.pojo.User;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class TestController05 {
    @RequestMapping("/uploadUser")
    public String test01(User user, Model model){
        System.out.println(user);
    }
}
```

> `http://localhost:8080/uploadUser?id=1&age=18&name=fsl&address.country=中国&address.city=湖北`
>
> 在这种情况下,使用`.`的形式访问类的下级元素进行传入参数,与传入对象相同,字段的名称必须相同

## 对数组的处理

> 想要映射为数组,url的参数为必须要和数组的名字相同,例如这里的想要传入的数字的变量名为`list`,
>
> `http://localhost:8080/array?list=admin&list=root&list=asdasd&list=xiaoming`

```java
package com.fsl.controller;


import com.fsl.pojo.User;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@Controller
public class TestController05 {
    @RequestMapping("/array")
    public String arr(@RequestParam List<String> list, Model model){
        System.out.println(list);
        model.addAttribute("msg",list);
        return "test";
    }
}

```

> `http://localhost:8080/array?list=admin&list=root&list=asdasd&list=xiaoming`,输出为
>
> ```
> [admin, root, asdasd, xiaoming]
> ```





# 返回Json数据

## 依赖

```xml
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-core</artifactId>
    <version>2.9.8</version>
</dependency>
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
    <version>2.9.8</version>
</dependency>
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-annotations</artifactId>
    <version>2.9.8</version>
</dependency>
```

> 将这些依赖导入,还需要将包添加到`Project Structure`的`Artifacts`的`WEB-INF\lib`下

## 代码

```java
    @RequestMapping("/getuser")
    @ResponseBody
    public User getUser(){
        return new User(1,13,"fsl");
    }
```

> 导入这些包后,只需要直接返回对象,java就可以直接将对象转换成Json对象

# 乱码问题的处理

> 主要是对web.xml中添加一些一些配置

```xml
<filter>
   <filter-name>encoding</filter-name>
   <filter-class>org.springframework.web.filter.CharacterEncodingFilter</filter-class>
   <init-param>
       <param-name>encoding</param-name>
       <param-value>utf-8</param-value>
   </init-param>
</filter>
<filter-mapping>
   <filter-name>encoding</filter-name>
   <url-pattern>/*</url-pattern>
</filter-mapping>
```

> 如果无法还会出现问题可以尝试一下方法
>
> 1. 在**tomcat**的**server.xml**修改**Connector**信息,添加`URIEncoding="utf-8"`
>
> ```xml
> <Connector URIEncoding="utf-8" port="8080" protocol="HTTP/1.1"
>           connectionTimeout="20000"
>           redirectPort="8443" />
> ```
>
> 

# 整合SSM

## 依赖

```xml
<dependencies>
   <!--Junit-->
   <dependency>
       <groupId>junit</groupId>
       <artifactId>junit</artifactId>
       <version>4.12</version>
   </dependency>
   <!--数据库驱动-->
   <dependency>
       <groupId>mysql</groupId>
       <artifactId>mysql-connector-java</artifactId>
       <version>5.1.47</version>
   </dependency>
   <!-- 数据库连接池 -->
   <dependency>
       <groupId>com.mchange</groupId>
       <artifactId>c3p0</artifactId>
       <version>0.9.5.2</version>
   </dependency>

   <!--Servlet - JSP -->
   <dependency>
       <groupId>javax.servlet</groupId>
       <artifactId>servlet-api</artifactId>
       <version>2.5</version>
   </dependency>
   <dependency>
       <groupId>javax.servlet.jsp</groupId>
       <artifactId>jsp-api</artifactId>
       <version>2.2</version>
   </dependency>
   <dependency>
       <groupId>javax.servlet</groupId>
       <artifactId>jstl</artifactId>
       <version>1.2</version>
   </dependency>

   <!--Mybatis-->
   <dependency>
       <groupId>org.mybatis</groupId>
       <artifactId>mybatis</artifactId>
       <version>3.5.2</version>
   </dependency>
   <dependency>
       <groupId>org.mybatis</groupId>
       <artifactId>mybatis-spring</artifactId>
       <version>2.0.2</version>
   </dependency>

   <!--Spring-->
   <dependency>
       <groupId>org.springframework</groupId>
       <artifactId>spring-webmvc</artifactId>
       <version>5.1.9.RELEASE</version>
   </dependency>
   <dependency>
       <groupId>org.springframework</groupId>
       <artifactId>spring-jdbc</artifactId>
       <version>5.1.9.RELEASE</version>
   </dependency>
</dependencies>
```

