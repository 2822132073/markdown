# 安装

## 下载gin包

在安装gin之前需要先创建工作空间,在工作空间下执行安装命令:

```
go get -u github.com/gin-gonic/gin
```

## 导入包

```go
import (
	"github.com/gin-gonic/gin"
	"net/http"
)
```

> **net/http**是可选的,因为里面包含着一些需要用到的常量



# 示例



## 官方的示例:

```go
package main

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

func main() {
	r := gin.Default()   //创建默认的Engine,其中包含Logger和Recovery中间件
	r.GET("/ping", func(c *gin.Context) {   
		c.JSON(http.StatusOK, gin.H{
			"message": "pong",
		})
	})
    r.Run()  //默认运行到0.0.0.0:8080
  //  r.Run("127.0.0.1:9090") //运行到127.0.0.1:9090
  //  r.Run(":8888") //运行到0.0.0.0:8888
}
```



## 各种的API的使用



### GET,POST,PUT,DELETE,PATCH,HEAD,OPTION的使用

```go
package main

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

func getting(c *gin.Context) {
	c.JSON(http.StatusOK,gin.H{
		"message": "getting",
	})
}

func posting(c *gin.Context) {
	c.JSON(http.StatusOK,gin.H{
		"message": "posting",
	})
}

func putting(c *gin.Context) {
	c.JSON(http.StatusOK,gin.H{
		"message": "putting",
	})
}

func deleting(c *gin.Context) {
	c.JSON(http.StatusOK,gin.H{
		"message": "deleting",
	})
}

func patching(c *gin.Context) {
	c.JSON(http.StatusOK,gin.H{
		"message": "patching",
	})
}

func head(c *gin.Context) {
	c.JSON(http.StatusOK,gin.H{
		"message": "head",
	})
}

func options(c *gin.Context) {
	c.JSON(http.StatusOK,gin.H{
		"message": "options",
	})
}

func main() {
	router := gin.Default()
    //第一个参数为请求的路径,第二个参数为执行的函数,对于GET请求而言,下面的也一样,第二个的函数定义需要符合HandlerFunc的定义
	router.GET("/someGet", getting)  
	router.POST("/somePost", posting)
	router.PUT("/somePut", putting)
	router.DELETE("/someDelete", deleting)
	router.PATCH("/somePatch", patching)
	router.HEAD("/someHead", head)
	router.OPTIONS("/someOptions", options)

	router.Run()
}
```



### 路径参数

```go
package main

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
)


func main() {
	router := gin.Default()

	//会处理/user/fsl, /user/ 和 /user 都不会被处理
	router.GET("/user/:name", func(c *gin.Context) {
		name := c.Param("name")
		c.String(http.StatusOK, "Hello %s", name)
	})

	/*
		* 将会匹配后面所有的路径包括/
		/user/fsl/abcd/efg
		上面的这个url将会得到 name: fsl, action: /abcd/efg
	 */
	router.GET("/user/:name/*action", func(c *gin.Context) {
		name := c.Param("name")
		action := c.Param("action")
		message := name + " is " + action
		c.String(http.StatusOK, message)
	})

	// 每个Context都保存了路由匹配信息,使用c.FullPath()获取
	router.POST("/user/:name/*action", func(c *gin.Context) {
		fmt.Println(c.FullPath())
		b := c.FullPath() == "/user/:name/*action" // true
		c.String(http.StatusOK, "%t", b)
	})

	// 添加一个 /user/groups 路由,精确路由在参数路由之前解析,而不是按照被定义的顺序,开头为/user/groups的路由,不会被解释为/user/:name/
	router.GET("/user/groups", func(c *gin.Context) {
		c.String(http.StatusOK, "The available groups are [...]")
	})
	router.Run(":8080")
}
```

> `c.Param`返回路径参数的值

### 查询GET请求中url带的参数

```go
package main

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
)


func main() {
	router := gin.Default()

	/* 下面的案例使用了DefaultQuery()和Query()
	DefaultQuery(): 设置一个查询的默认值,当查询不到的时候,会返回该值
	Query():查询不到,直接返回空串
	QueryArray(): 查询指定的名称的切片,返回一个字符串切片
		例如:
			url:http://localhost:8080/welcome?list=Jane&list=fsl&list=asda
		代码:
			l := c.QueryArray("list")
		结果:
			[Jane fsl asda]
	QueryMap():把满足一定格式的URL查询参数，转换为一个map
		例如:
			http://localhost:8080/welcome?user[id]=1&user[age]=19&user[name]=fsl
		代码:
			m :=  c.QueryMap("user")
		结果:
			map[age:19 id:1 name:fsl]

	 */
	router.GET("/welcome", func(c *gin.Context) {
		l := c.QueryArray("list")
		fmt.Println(l)
		m :=  c.QueryMap("user")
		fmt.Println(m)
		firstname := c.DefaultQuery("firstname", "Guest")
		lastname := c.Query("lastname") 
		c.String(http.StatusOK, "Hello %s %s", firstname, lastname)
	})
	router.Run(":8080")
}
```

### 获取POST请求中form表单的参数

> 可以与上面提到的url带的参数进行混合使用

```go
package main

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
)

func main() {
	router := gin.Default()
	/*
		PostForm可以解析Content-Type为application/x-www-urlencoded和multipart/form-data形式的传值,无法解析url中的显示传值
		PostForm和DefaultPostForm,PostFormArray,PostFormMap和上面的差不多,只不过将数据从url显示的表示,变成了再body里面
	*/
	router.POST("/form_post", func(c *gin.Context) {
		message := c.PostForm("message")
		nick := c.DefaultPostForm("nick", "anonymous")
		l := c.PostFormArray("list")
		fmt.Println(l)
		m := c.PostFormMap("user")
		fmt.Println(m)
		c.JSON(http.StatusOK, gin.H{
			"status":  "posted",
			"message": message,
			"nick":    nick,
		})
	})
	router.Run(":8080")
}

```

### 上传单个文件

```go
package main

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
)

func main() {
	router := gin.Default()
	// 设置解析 Multipart Form (form-data)时最大使用的内存，预设是 32 MiB
	router.MaxMultipartMemory = 8 << 20 // 8 MiB
	router.POST("/upload", func(c *gin.Context) {
		// 获取key为file的文件
		file, _ := c.FormFile("file")
		log.Println(file.Filename)

		// 上传文件到dst
		err := c.SaveUploadedFile(file, "./file")
		if err != nil {
			return
		}

		c.String(http.StatusOK, fmt.Sprintf("'%s' uploaded!", file.Filename))
	})
	router.Run(":8080")
}

```

### 上传多个文件

```go
package main

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
)

func main() {
	router := gin.Default()
	router.MaxMultipartMemory = 8 << 20  // 8 MiB
	router.POST("/upload", func(c *gin.Context) {
		// 与上传单个文件不同,这里使用MultipartForm进行读取文件
		form, _ := c.MultipartForm()
		//上传多个文件时,每个文件的key必须相同,这里就可以在这里形成一个文件切片
		files := form.File["file"]

		for _, file := range files {
			log.Println(file.Filename)

			// Upload the file to specific dst.
			err := c.SaveUploadedFile(file, file.Filename)
			if err != nil {
				return 
			}
		}
		c.String(http.StatusOK, fmt.Sprintf("%d files uploaded!", len(files)))
	})
	router.Run(":8080")
}
```



### 路由组

```go
package main

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
)

func loginEndpoint(c *gin.Context) {
	c.JSON(http.StatusOK,gin.H{"message":"loginEndpoint"})
}
func submitEndpoint(c *gin.Context) {
	c.JSON(http.StatusOK,gin.H{"message":"submitEndpoint"})

}

func readEndpoint(c *gin.Context) {
	fmt.Println(c.FullPath())
	c.JSON(http.StatusOK,gin.H{"message":"readEndpoint"})

}
func main() {
	router := gin.Default()

	// 新建一个路由组,他的路径为/v1
    v1 := router.Group("/v1")
    {
        //这样创建出来的路由,访问的路径为 /v1/login ,下面都是一样的
        v1.POST("/login", loginEndpoint)
        v1.POST("/submit", submitEndpoint)
        v1.POST("/read", readEndpoint)
    }

	// Simple group: v2
	v2 := router.Group("/v2")
	{
		v2.POST("/login", loginEndpoint)
		v2.POST("/submit", submitEndpoint)
		v2.POST("/read", readEndpoint)
	}

	router.Run(":8080")
}

```



### 使用中间件

```go
package main

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
)

func MyBenchLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		fmt.Println("MyBenchLogger")
	}
}

func benchEndpoint(c *gin.Context)  {
	fmt.Println("benchEndpoint")
	c.Next()
}

func AuthRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		fmt.Println("AuthRequired..............")
	}
}

func loginEndpoint(c *gin.Context) {
	c.JSON(http.StatusOK,gin.H{"message":"loginEndpoint"})
}
func submitEndpoint(c *gin.Context) {
	c.JSON(http.StatusOK,gin.H{"message":"submitEndpoint"})

}

func readEndpoint(c *gin.Context) {
	c.JSON(http.StatusOK,gin.H{"message":"readEndpoint"})

}

func analyticsEndpoint(c *gin.Context)  {
	c.JSON(http.StatusOK,gin.H{"message":"analyticsEndpoint"})

}

func main() {
	// 创建一个没有任何中间件的Engine
	r := gin.New()

	// 全局中间件
	// Logger中间件将会将日志写到gin.DefaultWriter,即使设置GIN_MODE=release.
	// 默认的gin.DefaultWriter=os.Stdout
	r.Use(gin.Logger())

	// Recovery将会从任何panic中恢复,并回复一个500错误
	r.Use(gin.Recovery())

	// 每个路由你都可以添加你想要的中间件,这里有MyBenchLogger()和benchEndpoint
	// MyBenchLogger()返回的结果必须是一个HandlerFunc
	// 而benchEndpoint直接自己就是一个HandlerFunc
	r.GET("/benchmark", MyBenchLogger(), benchEndpoint)

	// authorized := r.Group("/", AuthRequired())
	// 和下面的效果相同
	authorized := r.Group("/")
	// AuthRequired()只在authorized中使用
	authorized.Use(AuthRequired())
	{
		authorized.POST("/login", loginEndpoint)
		authorized.POST("/submit", submitEndpoint)
		authorized.POST("/read", readEndpoint)

		// 嵌套组
		testing := authorized.Group("testing")
		// 访问 0.0.0.0:8080/testing/analytics
		testing.GET("/analytics", analyticsEndpoint)
	}
	// Listen and serve on 0.0.0.0:8080
	r.Run(":8080")
}

```

> `/benchmark`不会使用到 **AuthRequired**中间件

### 定制恢复行为

```go
package main

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
)

func main() {
	r := gin.New()

	r.Use(gin.Logger())

	// 可以自定义一些恢复函数,这里的CustomRecovery传入的是一个RecoveryFunc,RecoveryFunc的第二个参数为捕获到的错误对象
	// 在本例中,这个recovered代表着panic函数中的参数any("foo")
	r.Use(gin.CustomRecovery(func(c *gin.Context, recovered interface{}) {
		fmt.Println(recovered)
		if err, ok := recovered.(string); ok {
			c.String(http.StatusInternalServerError, fmt.Sprintf("error: %s", err))
		}
		c.AbortWithStatus(http.StatusInternalServerError)
	}))

	r.GET("/panic", func(c *gin.Context) {
		// 定制的中间件可以捕获这个错误将其报告给用户
		panic(any("foo"))
	})

	r.GET("/", func(c *gin.Context) {
		c.String(http.StatusOK, "ohai")
	})

	// Listen and serve on 0.0.0.0:8080
	r.Run(":8080")
}
```

### 如何去写日志

```go
package main

import (
	"github.com/gin-gonic/gin"
	"io"
	"net/http"
	"os"
)
func main() {
	// 关闭控制台颜色
	gin.DisableConsoleColor()

	f, _ := os.Create("gin.log")
	// io.MultiWriter传入多个Writer,返回一个Writer,这个Writer可以同时将内容写入到这些Writer
	gin.DefaultWriter = io.MultiWriter(f)

	// 如果你需要将日志写入文件的同时,并且将其输出到控制台
	// gin.DefaultWriter = io.MultiWriter(f, os.Stdout)

	router := gin.Default()
	router.GET("/ping", func(c *gin.Context) {
		c.String(http.StatusOK, "pong")
	})
	router.Run(":8080")
}
```

### 定制日志格式

```go
package main

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
	"time"
)
func main() {
	router := gin.New()
	// 定制日志格式,LogFormatterParams可以获得request里面的信息,还有给出的一些信息,详情可以查看源码
	router.Use(gin.LoggerWithFormatter(func(param gin.LogFormatterParams) string {

		// 日志格式
		return fmt.Sprintf("%s - [%s] \"%s %s %s %d %s \"%s\" %s\"\n",
			param.ClientIP,
			param.TimeStamp.Format(time.RFC1123),
			param.Method,
			param.Path,
			param.Request.Proto,
			param.StatusCode,
			param.Latency,
			param.Request.UserAgent(),
			param.ErrorMessage,
		)
	}))
	router.Use(gin.Recovery())

	router.GET("/ping", func(c *gin.Context) {
		c.String(http.StatusOK, "pong")
	})

	router.Run(":8080")
}
```

输出示例:

```
::1 -  [Wed, 02 Nov 2022 21:43:15 CST] "GET /ping HTTP/1.1 200 525.7µs "PostmanRuntime/7.29.2" "
```

### 控制日志输出颜色

默认的输出的日志应该被上色,基于探测到的TTY控制台

```go
package main

import (
	"github.com/gin-gonic/gin"
	"net/http"
)
func main() {
	// 强制上色
	gin.ForceConsoleColor()
	// 进制上色
	gin.DisableConsoleColor()

	
	router := gin.Default()

	router.GET("/ping", func(c *gin.Context) {
		c.String(http.StatusOK, "pong")
	})

	router.Run(":8080")
}
```

### 模型绑定与验证

To bind a request body into a type, use model binding. We currently support binding of JSON, XML, YAML, TOML and standard form values (foo=bar&boo=baz).

绑定请求体到一个类型,使用模型绑定,我们现在支持JSON, XML, YAML, TOML和标准的url传值(foo=bar&boo=baz)

Note that you need to set the corresponding binding tag on all fields you want to bind. For example, when binding from JSON, set `json:"fieldname"`

注意,你需要设置相应的绑定tag到你想要绑定的所有字段,例如,当绑定json时设置`json:"fieldname"`

Gin提供两种绑定模式

- Must Bind

  - **Methods** - `Bind`, `BindJSON`, `BindXML`, `BindQuery`, `BindYAML`, `BindHeader`, `BindTOML`
  - **Behavior** : 这些方法在底层使用`MustBindWith`,如果有一个绑定错误,这个请求将会使用`c.AbortWithError(400, err).SetType(ErrorTypeBind)`中止,这将会设置响应的状态码到400并且将响应头`Content-Type`设置为`text/plain; charset=utf-8`,注意如果你想在响应头响应码,将会导致一个警告`[GIN-debug] [WARNING] Headers were already written. Wanted to override status code 400 with 422`,如果你想要对行为有更好的控制,考虑使用`ShouldBind`等效方法

-  Should bind

  - **Methods** - `ShouldBind`, `ShouldBindJSON`, `ShouldBindXML`, `ShouldBindQuery`, `ShouldBindYAML`, `ShouldBindHeader`, `ShouldBindTOML`,
  - **Behavior** 这些方法底层使用`ShouldBindWith`,如果出现绑定错误,这个错误将会被返回,合适的去处理这个请求和错误时开发者的责任

  当使用绑定方法时,Gin尝试推测这个Binder使用`Content-Type`请求头,如果你确定你要绑定的,你可以使用`MustBindWith` or `ShouldBindWith`

  你也可以指定指定的字段被需要,如果字段被`binding:"required"`修饰,并且有一个空值,一个错误将会被返回

```go
package main

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

type Login struct {
	// binding指定为required时,如果没有进行绑定,就会报错,这些form,json等指定的是body中的字段
	User     string `form:"user" json:"user" xml:"user"  binding:"required"`
	Password string `form:"password" json:"password" xml:"password" binding:"required"`
}



// 要是request的Content-Type和Body中的数据一致,可以使用ShouldBind
// 要是request的Content-Type和Body中的数据不一致,例如:Content-Type为application/xml,Body为Json格式,可以使用ShouldBindJSON也可以进行识别
func main() {
	router := gin.Default()
	// Content-Type: application/json Body: {"user": "manu", "password": "123"}
	router.POST("/loginJSON", func(c *gin.Context) {
		var json Login
		if err := c.ShouldBindJSON(&json); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if json.User != "manu" || json.Password != "123" {
			c.JSON(http.StatusUnauthorized, gin.H{"status": "unauthorized"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"status": "you are logged in"})
	})

	// Content-Type:application/xml
	// Body:
	//  <?xml version="1.0" encoding="UTF-8"?>
	//  <root>
	//    <user>manu</user>
	//    <password>123</password>
	//  </root>
	router.POST("/loginXML", func(c *gin.Context) {
		var xml Login
		if err := c.ShouldBindXML(&xml); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if xml.User != "manu" || xml.Password != "123" {
			c.JSON(http.StatusUnauthorized, gin.H{"status": "unauthorized"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"status": "you are logged in"})
	})

	// Content-Type: multipart/form-data  Body:user=manu&password=123
	router.POST("/loginForm", func(c *gin.Context) {
		var form Login
		if err := c.ShouldBind(&form); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if form.User != "manu" || form.Password != "123" {
			c.JSON(http.StatusUnauthorized, gin.H{"status": "unauthorized"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"status": "you are logged in"})
	})

	// Listen and serve on 0.0.0.0:8080
	router.Run(":8080")
}
```

### 定制验证器

> 对于HTTP请求，我们要在脑子里有一个根深蒂固的概念，那就是任何客户端传过来的数据都是不可信任的。那么开发接口的时候需要对客户端传提交的参数进行参数校验，如果提交的参数只有一个两个，这样我们可以简单写个if判断，那么要是有很多的参数校验，那么满屏都是参数校验的if判断，效率不仅低还不美观，接下来我们介绍一个参数校验器`validator`。

```go
package main

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"github.com/go-playground/validator/v10"
)

// Booking contains binded and validated data.
// binding这个关键字与Validator中的validate有着相同的作用
type Booking struct {
	// 设置这个字段需要进行bookabledate的约束检查,time_format指定时间格式
	CheckIn  time.Time `form:"check_in" binding:"required,bookabledate" time_format:"2006-01-02"`
	CheckOut time.Time `form:"check_out" binding:"required,gtfield=CheckIn" time_format:"2006-01-02"`
}

var bookableDate validator.Func = func(fl validator.FieldLevel) bool {
	date, ok := fl.Field().Interface().(time.Time)
	if ok {
		today := time.Now()
		today.Format("")
		if today.After(date) {
			return false
		}
	}
	return true
}

func main() {
	route := gin.Default()

	if v, ok := binding.Validator.Engine().(*validator.Validate); ok {
		// 将bookableDate注册到bookabledate这个名称上,就是上面CheckIn用到的约束
		v.RegisterValidation("bookabledate", bookableDate)
	}

	route.GET("/bookable", getBookable)
	route.Run(":8085")
}

func getBookable(c *gin.Context) {
	var b Booking
	if err := c.ShouldBindWith(&b, binding.Query); err == nil {
		c.JSON(http.StatusOK, gin.H{"message": "Booking dates are valid!"})
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
	}
}
```



```
$ curl "localhost:8085/bookable?check_in=2030-04-16&check_out=2030-04-17"
{"message":"Booking dates are valid!"}

$ curl "localhost:8085/bookable?check_in=2030-03-10&check_out=2030-03-09"
{"error":"Key: 'Booking.CheckOut' Error:Field validation for 'CheckOut' failed on the 'gtfield' tag"}

$ curl "localhost:8085/bookable?check_in=2000-03-09&check_out=2000-03-10"
{"error":"Key: 'Booking.CheckIn' Error:Field validation for 'CheckIn' failed on the 'bookabledate' tag"}%
```





### 只绑定url中query的数据

> 

```go

package main

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

type Person struct {
	Name    string `form:"name"`
	Address string `form:"address"`
}

func main() {
	route := gin.Default()
	route.Any("/testing", startPage)
	route.Run(":8080")
}

func startPage(c *gin.Context) {
	var person Person
	// ShouldBindQuery只绑定url上带的参数,不对body进行查看
	if c.ShouldBindQuery(&person) == nil {
		log.Println("====== Only Bind By Query String ======")
		log.Println(person.Name)
		log.Println(person.Address)
	}
	c.String(http.StatusOK, "Success")
}

```

### 绑定查询字符或者post数据

```go
package main

import (
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type Person struct {
	Name       string    `form:"name"`
	Address    string    `form:"address"`
	Birthday   time.Time `form:"birthday" time_format:"2006-01-02" time_utc:"1"`
	CreateTime time.Time `form:"createTime" time_format:"unixNano"`
	UnixTime   time.Time `form:"unixTime" time_format:"unix"`
}

func main() {
	route := gin.Default()
	route.GET("/testing", startPage)
	route.Run(":8085")
}

func startPage(c *gin.Context) {
	var person Person
	// If `GET`, only `Form` binding engine (`query`) used.
	// 如果是Get请求,仅仅 Form 绑定引擎 query 被使用
	// If `POST`, first checks the `content-type` for `JSON` or `XML`, then uses `Form` (`form-data`).
	// 如果是Post请求,检查content-type是否为JSON 或者 XML,然后使用 Form (form-data).
	if c.ShouldBind(&person) == nil {
		log.Println(person.Name)
		log.Println(person.Address)
		log.Println(person.Birthday)
		log.Println(person.CreateTime)
		log.Println(person.UnixTime)
	}

	c.String(http.StatusOK, "Success")
}
```



### 绑定URI

```go
package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type Person struct {
    // uri指定路径的变量
	ID string `uri:"id" binding:"required,uuid"`
	Name string `uri:"name" binding:"required"`
}

func main() {
	route := gin.Default()
	route.GET("/:name/:id", func(c *gin.Context) {
		var person Person
		if err := c.ShouldBindUri(&person); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"msg": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"name": person.Name, "uuid": person.ID})
	})
	route.Run(":8080")
}
```

### 绑定请求头

```go
package main

import (
  "fmt"
  "net/http"

  "github.com/gin-gonic/gin"
)

type testHeader struct {
  Rate   int    `header:"Rate"`
  Domain string `header:"Domain"`
}

func main() {
  r := gin.Default()
  r.GET("/", func(c *gin.Context) {
    h := testHeader{}

    if err := c.ShouldBindHeader(&h); err != nil {
      c.JSON(http.StatusOK, err)
    }

    fmt.Printf("%#v\n", h)
    c.JSON(http.StatusOK, gin.H{"Rate": h.Rate, "Domain": h.Domain})
  })

  r.Run()

// client
// curl -H "rate:300" -H "domain:music" 127.0.0.1:8080/
// output
// {"Domain":"music","Rate":300}
}
```

### 绑定checkbox

#### 目录结构

```
PS D:\awesomeProject\TestProject\gin> tree /f
Folder PATH listing for volume Data
Volume serial number is CA62-D87B
D:.
│   gin.log
│   go.mod
│   go.sum
│
├───.idea
│       .gitignore
│       gin.iml
│       modules.xml
│       workspace.xml
│
└───src
    │   main.go
    │
    └───html
            index.html

```

#### index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
<form action="/checkbox" method="POST">
    <p>Check some colors</p>
    <label for="red">Red</label>
    <input type="checkbox" name="colors[]" value="red" id="red">
    <label for="green">Green</label>
    <input type="checkbox" name="colors[]" value="green" id="green">
    <label for="blue">Blue</label>
    <input type="checkbox" name="colors[]" value="blue" id="blue">
    <input type="submit">
</form>
</body>
</html>
```

#### main.go

```go
package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type myForm struct {
	Colors []string `form:"colors[]"`
}


func formHandler(c *gin.Context) {
	var fakeForm myForm
	c.ShouldBind(&fakeForm)
	c.JSON(http.StatusOK, gin.H{"color": fakeForm.Colors})
}


func main() {
	route := gin.Default()

	//route.StaticFile("/index.html","index.html")
	// 使用 LoadHTMLFiles 和 LoadHTMLGlob 时,需要写全路径,不然无法找到文件,这两个方法在找文件时,是从包目录来找的,不能使用.这种写法或者..
	route.LoadHTMLFiles("src/html/index.html")
	route.GET("/index.html", func(c *gin.Context) {
        // 这里的第二个参数就是文件名,文件名肯定是有重复的,需要有手段进行修改
		c.HTML(http.StatusOK,"index.html",gin.H{})
	})

	route.POST("/checkbox",formHandler)
	route.Run(":8080")
}
```

### Multipart/Urlencoded绑定

```go
package main

import (
	"mime/multipart"
	"net/http"

	"github.com/gin-gonic/gin"
)

type ProfileForm struct {
	Name   string                `form:"name" binding:"required"`
	Avatar *multipart.FileHeader `form:"avatar" binding:"required"`

	// 存储多个文件可以用以下这种方式
	// Avatars []*multipart.FileHeader `form:"avatar" binding:"required"`
}

func main() {
	router := gin.Default()
	router.POST("/profile", func(c *gin.Context) {
		// you can bind multipart form with explicit binding declaration:
		// 你可以绑定multipart form用清楚的绑定声明:
		// c.ShouldBindWith(&form, binding.Form)
		// or you can simply use autobinding with ShouldBind method:
		// 或者你可以使用ShouldBind自动绑定
		var form ProfileForm
		// in this case proper binding will be automatically selected
		// 在这个例子中,合适的绑定将会被选择
		if err := c.ShouldBind(&form); err != nil {
			c.String(http.StatusBadRequest, "bad request")
			return
		}

		err := c.SaveUploadedFile(form.Avatar, form.Avatar.Filename)
		if err != nil {
			c.String(http.StatusInternalServerError, "unknown error")
			return
		}
		c.String(http.StatusOK, "ok")
	})
	router.Run(":8080")
}
```

```
curl -X POST -v --form name=user --form "avatar=@./avatar.png" http://localhost:8080/profile
```

### XML, JSON, YAML  展示

```go
package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)
func main() {
	r := gin.Default()

	// gin.H 是map[string]interface{}的缩写
	r.GET("/someJSON", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "hey", "status": http.StatusOK})
	})

	r.GET("/moreJSON", func(c *gin.Context) {
		// 也可以使用结构体
		var msg struct {
			Name    string `json:"user"`
			Message string
			Number  int
		}
		msg.Name = "Lena"
		msg.Message = "hey"
		msg.Number = 123
		// Note that msg.Name becomes "user" in the JSON
		// 注意,在JSON 中 msg.Name将会变成user
		// Will output  :   {"user": "Lena", "Message": "hey", "Number": 123}
		c.JSON(http.StatusOK, msg)
	})

	r.GET("/someXML", func(c *gin.Context) {
		c.XML(http.StatusOK, gin.H{"message": "hey", "status": http.StatusOK})
	})

	r.GET("/someYAML", func(c *gin.Context) {
		c.YAML(http.StatusOK, gin.H{"message": "hey", "status": http.StatusOK})
	})

	// Listen and serve on 0.0.0.0:8080
	r.Run(":8080")
}
```

### 安全json

使用SecureJSON去预防json劫持,如果指明的结构是数组值默认前置"while(1)"到相应头

> 不是很懂这个JSON劫持,看不是很懂

```go
package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	// You can also use your own secure json prefix
	// 你也可以使用自己的安全json前缀
	// r.SecureJsonPrefix(")]}',\n")

	r.GET("/someJSON", func(c *gin.Context) {
		names := []string{"lena", "austin", "foo"}

		// Will output  :   while(1);["lena","austin","foo"]
		c.SecureJSON(http.StatusOK, names)
	})

	// Listen and serve on 0.0.0.0:8080
	r.Run(":8080")
}

```

### JSONP

[jsonp跨域原理json劫持 ](https://blog.csdn.net/weixin_39830225/article/details/110793601)

使用JSONP从不同的域中请求数据,如果query参数中存在callback 参数,会将callback添加到响应体中

```go
package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	r.GET("/JSONP", func(c *gin.Context) {
		data := gin.H{
			"foo": "bar",
		}

		//callback is x
		// Will output  :   x({\"foo\":\"bar\"})
		c.JSONP(http.StatusOK, data)
	})

	// Listen and serve on 0.0.0.0:8080
	r.Run(":8080")

	// client
	// curl http://127.0.0.1:8080/JSONP?callback=x
}
```



> 这里返回的是 `x({\"foo\":\"bar\"})`,是因为客户端请求的query参数callback的值为x,如果curl http://127.0.0.1:8080/JSONP?callback=hello,那么将会返回`hello({\"foo\":\"bar\"})`



### AsciiJSON

> 使用AsciiJSON将会把非Ascii字符转义

```go
func main() {
  r := gin.Default()

  r.GET("/someJSON", func(c *gin.Context) {
    data := gin.H{
      "lang": "GO语言",
      "tag":  "<br>",
    }

    // will output : {"lang":"GO\u8bed\u8a00","tag":"\u003cbr\u003e"}
    c.AsciiJSON(http.StatusOK, data)
  })

  // Listen and serve on 0.0.0.0:8080
  r.Run(":8080")
}
```

```shell
root@LAPTOP-R9AHVUA3:~# curl 172.25.32.1:8080/json
{"html":"\u003cb\u003eHello, world!\u003c/b\u003e"}
root@LAPTOP-R9AHVUA3:~# curl 172.25.32.1:8080/purejson
{"html":"<b>Hello, world!</b>"}
```

### 文件服务器

#### 目录结构

```
PS D:\awesomeProject\TestProject\gin> tree /f
Folder PATH listing for volume Data
Volume serial number is CA62-D87B
D:.
│   gin.log
│   go.mod
│   go.sum
│   imsdk_config_0
│
├───.idea
│       .gitignore
│       gin.iml
│       modules.xml
│       workspace.xml
│
├───img
│       鬼刀.jpg
│       鬼刀2.png
│       鬼刀4.png
│       鬼刀5.png
│       鬼刀6.jpg
│
└───src
    │   main.go
    │
    └───html
            index.html


```

#### main.go

```go
package main

import (
	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()
	// 将相当于img下的文件映射到/img下
	// http://127.0.0.1:8080/img/鬼刀.jpg 相当于 访问img/鬼刀.jpg
	//router.Static("/img", "img")
	// 访问 http://127.0.0.1:8080/img 会将img文件夹下的文件显式的暴露出来
	//router.StaticFS("/img", http.Dir("img"))
	// 映射单个文件,将img/鬼刀.jpg映射到/img路径
	//router.StaticFile("/img", "img/鬼刀.jpg")
	// 和StaticFile的效果相同,但是可以自定义 http.FileSystem,虽然不知道是啥,写一下
	//router.StaticFileFS("/img", "img/鬼刀.jpg", http.Dir("img"))

	// Listen and serve on 0.0.0.0:8080
	router.Run(":8080")
}
```

### 返回的数据从文件中获取

```go
package main

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

func main() {
	router := gin.Default()
	// 当访问/img时,会将返回gin.log中的内容
	//router.GET("/img", func(c *gin.Context) {
	//	c.File("gin.log")
	//})
	// 使用gin.Dir创建一个http.FileSystem接口的示例fs
	// 下面的意思是相当于把img目录打开
	var fs http.FileSystem = gin.Dir("img",false)
	router.GET("/fs/file", func(c *gin.Context) {
		// 从fs中读取指定的文件写到响应头中
		c.FileFromFS("鬼刀2.png", fs)
	})
	router.Run(":8080")
}

```

### 从Reader中获取数据

```go
package main

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

func main() {
	router := gin.Default()
	router.GET("/someDataFromReader", func(c *gin.Context) {
		response, err := http.Get("https://raw.githubusercontent.com/gin-gonic/logo/master/color.png")
		if err != nil || response.StatusCode != http.StatusOK {
			c.Status(http.StatusServiceUnavailable)
			return
		}

		reader := response.Body
		defer reader.Close()
		contentLength := response.ContentLength
		contentType := response.Header.Get("Content-Type")

		extraHeaders := map[string]string{
			"Content-Disposition": `attachment; filename="gopher.png"`,
		}
		// 指定返回数据的大小,类型,从哪个reader中获取,还有额外的头部
		c.DataFromReader(http.StatusOK, contentLength, contentType, reader, extraHeaders)
	})
	router.Run(":8080")
}
```

> 这个例子中,数据是从外部的url中获取的

### HTML渲染

#### 目录结构

```shell
D:.
│   go.mod
│   go.sum
│
├───src
│   │   main.go
│   │
│   └───html
│           index.html
│
└───templates
        index.tmpl

```



#### 使用LoadHTMLGlob() or LoadHTMLFiles()

main.go

```go
package main

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

func main() {
	router := gin.Default()
	// 使用通配符去匹配HTML文件
	router.LoadHTMLGlob("templates/*")
	// router.LoadHTMLFiles 列出需要导入的html文件
	//router.LoadHTMLFiles("templates/template1.html", "templates/template2.html")
	router.GET("/index", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index.tmpl", gin.H{
			"title": "Main website",
		})
	})
	router.Run(":8080")
}
```

templates/index.tmpl

```html
<html>
  <h1>
    {{ .title }}
  </h1>
</html>
```

> 如果没有进行设置,*.tmpl可能在goland中没有语法提示,需要进行设置
>
> ![img](https://cdn.jsdelivr.net/gh/2822132073/image/202211052223028.png)

#### 使用名字相同,目录不同的模板文件

main.go

```go
package main

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

func main() {
	router := gin.Default()
	// 取得templates目录下所有目录下的说有文件,但是并不会匹配到templates下的文件
	router.LoadHTMLGlob("templates/**/*")
	router.GET("/posts/index", func(c *gin.Context) {
		c.HTML(http.StatusOK, "posts/index.tmpl", gin.H{
			"title": "Posts",
		})
	})
	router.GET("/users/index", func(c *gin.Context) {
		c.HTML(http.StatusOK, "users/index.tmpl", gin.H{
			"title": "Users",
		})
	})
	router.Run(":8080")
}
```

templates/posts/index.tmpl

```html
{{ define "posts/index.tmpl" }}
<html>
<h1>
  {{ .title }}
</h1>
<p>Using posts/index.tmpl</p>
</html>
{{ end }}
```

templates/users/index.tmpl

```html
{{ define "users/index.tmpl" }}
<html>
<h1>
  {{ .title }}
</h1>
<p>Using users/index.tmpl</p>
</html>
{{ end }}
```



#### 定制分隔符

Go标准库的模板引擎使用的花括号`{{`和`}}`作为标识，而许多前端框架（如Vue和 AngularJS）也使用`{{`和`}}`作为标识符，所以当我们同时使用Go语言模板引擎和以上前端框架时就会出现冲突，这个时候我们需要修改标识符，修改前端的或者修改Go语言的。这里演示如何修改Go语言模板引擎默认的标识符：

```go
  r := gin.Default()
  r.Delims("{[{", "}]}")
  r.LoadHTMLGlob("/path/to/templates")
```

#### 定制模板参数

main.go

```go
import (
    "fmt"
    "html/template"
    "net/http"
    "time"

    "github.com/gin-gonic/gin"
)

func formatAsDate(t time.Time) string {
    year, month, day := t.Date()
    return fmt.Sprintf("%d/%02d/%02d", year, month, day)
}

func main() {
    router := gin.Default()
    router.Delims("{[{", "}]}")
    // key为函数在模板中的内容,value为对应的函数
    router.SetFuncMap(template.FuncMap{
        "formatAsDate": formatAsDate,
    })
    router.LoadHTMLFiles("./testdata/template/raw.tmpl")

    router.GET("/raw", func(c *gin.Context) {
        c.HTML(http.StatusOK, "raw.tmpl", gin.H{
            "now": time.Date(2017, 07, 01, 0, 0, 0, 0, time.UTC),
        })
    })

    router.Run(":8080")
}
```

raw.tmpl

```
Date: {[{.now | formatAsDate}]}
```

Result:

```
Date: 2017/07/01
```

### 重定向

生成一个http重定向是很容易的

```go
// 发生在本地的重定向
r.GET("/test", func(c *gin.Context) {
    c.Redirect(http.StatusMovedPermanently, "/test2")
})
r.GET("/test2", func(c *gin.Context) {
    c.JSON(http.StatusOK,"重定向成功")
})
// 发生在外部的重定向
r.GET("/test", func(c *gin.Context) {
  c.Redirect(http.StatusMovedPermanently, "http://www.google.com/")
})
```

对于post请求,重定向的状态码需要使用302状态码

```go
r.POST("/test", func(c *gin.Context) {
  c.Redirect(http.StatusFound, "/foo")
})
```

使用`HandleContext`的方式进行重定向

```go
r.GET("/test", func(c *gin.Context) {
    c.Request.URL.Path = "/test2"
    r.HandleContext(c)
})
r.GET("/test2", func(c *gin.Context) {
    c.JSON(http.StatusOK, gin.H{"hello": "world"})
})
```



### 自定义中间件

```go
package main

import (
	"github.com/gin-gonic/gin"
	"log"
	"time"
)

func Logger() gin.HandlerFunc {
	return func(c *gin.Context) {
		t := time.Now()

		// 设置示例数据
		c.Set("example", "12345")

		// 相当执行接下来的所有操作,例如其它的中间件,还有清楚处理的过程

		c.Next()

		// 相当于请求完成之后
		latency := time.Since(t)
		log.Print(latency)
		// 获得我们将要发送的状态码
		status := c.Writer.Status()
		log.Println(status)
	}
}

func main() {
	r := gin.New()
	r.Use(Logger())

	r.GET("/test", func(c *gin.Context) {

		// 获取上面设置的值
		example := c.MustGet("example").(string)

		// 这里将会打印出12345,说明在中间件中设置的值可以在下面的流程中获取
		log.Println(example)
	})

	// Listen and serve on 0.0.0.0:8080
	r.Run(":8080")
}

```



### 使用BasicAuth进行认证

> Basic Auth简单点说明就是每次请求API时都提供用户的username和password。
>
> 没有进行显示的传输,而是将这些信息在请求头中提现
>
> Authorization: base64encode(username+":"+password)

```go
package main

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

// simulate some private data
var secrets = gin.H{
	"foo":    gin.H{"email": "foo@bar.com", "phone": "123433"},
	"austin": gin.H{"email": "austin@example.com", "phone": "666"},
	"lena":   gin.H{"email": "lena@guapa.com", "phone": "523443"},
}

func main() {
	r := gin.Default()

	// Group using gin.BasicAuth() middleware
	// 定义一个路由组使用BasicAuth中间件
	// gin.Accounts is a shortcut for map[string]string
	// gin.Accounts是数据类型map[string]string的缩写
	authorized := r.Group("/admin", gin.BasicAuth(gin.Accounts{
		"foo":    "bar",
		"austin": "1234",
		"lena":   "hello2",
		"manu":   "4321",
	}))

	// 访问 "localhost:8080/admin/secrets 进行Basic认证
	authorized.GET("/secrets", func(c *gin.Context) {
		// 获得user,这个值被BasicAuth中间件进行设置
		user := c.MustGet(gin.AuthUserKey).(string)
		if secret, ok := secrets[user]; ok {
			c.JSON(http.StatusOK, gin.H{"user": user, "secret": secret})
		} else {
			c.JSON(http.StatusOK, gin.H{"user": user, "secret": "NO SECRET :("})
		}
	})

	// Listen and serve on 0.0.0.0:8080
	r.Run(":8080")
}
```



### 尝试将请求体绑定到多个结构体

正常绑定请求体的方法消耗`c.Request.Body`,而且它只能被调用一次,无法被调用多次

```go
type formA struct {
  Foo string `json:"foo" xml:"foo" binding:"required"`
}

type formB struct {
  Bar string `json:"bar" xml:"bar" binding:"required"`
}

func SomeHandler(c *gin.Context) {
  objA := formA{}
  objB := formB{}
  // c.ShouldBind消耗c.Request.Body,将不会被使用第二次
  if errA := c.ShouldBind(&objA); errA == nil {
    c.String(http.StatusOK, `the body should be formA`)
  // 错误EOF将一直出现在这个地方
  } else if errB := c.ShouldBind(&objB); errB == nil {
    c.String(http.StatusOK, `the body should be formB`)
  } else {
    ...
  }
}
```

对于这种情况,你可以使用`c.ShouldBindBodyWith`

```go
func SomeHandler(c *gin.Context) {
  objA := formA{}
  objB := formB{}
  // This reads c.Request.Body and stores the result into the context.
  // ShouldBindBodyWith将会事先将c.Request.Body保存到context中
  if errA := c.ShouldBindBodyWith(&objA, binding.Form); errA == nil {
    c.String(http.StatusOK, `the body should be formA`)
  // 这样就不会出现EOF错误了
  } else if errB := c.ShouldBindBodyWith(&objB, binding.JSON); errB == nil {
    c.String(http.StatusOK, `the body should be formB JSON`)
  // 可以接受其他值的绑定
  } else if errB2 := c.ShouldBindBodyWith(&objB, binding.XML); errB2 == nil {
    c.String(http.StatusOK, `the body should be formB XML`)
  } else {
    ...
  }
}
```

1. c.ShouldBindBodyWith在绑定之前将body存储到上下文中。这对性能有轻微影响，因此如果您可以立即调用绑定，则不应该使用此方法。
2. 这个特性只需要一些格式——JSON, XML, MsgPack, ProtoBuf。对于其他格式，如Query, Form, FormPost, FormMultipart，可以由c.ShouldBind()多次调用，而不会对性能造成任何损害
