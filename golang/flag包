# Flag包



[TOC]

## flag.XXX

> `flag.XXX`将返回一个指针变量,在下面的`*host,*port`可以看到,我们获取值是将获取指针的值

```go
package main

import "fmt"
import "flag"

func main() {
	host := flag.String("host","127.0.0.1","Please input hosts")
	port := flag.Int("port",80,"please input Port")
	flag.Parse()
	fmt.Println(*host,*port)
}
```

```go
D:\awesomeProject\awesomeProject>flag.exe -host 127.0.0.1 -port 88
127.0.0.1 88
```



## flag.XXXVar

> 与之前不同的是,之前是声明好条件后,返回指针变量,而这种方式,是事先准备好变量,然后将变量的指针传入
>
> `Init()`函数会在函数执行前执行

```go
package main

import "fmt"
import "flag"


var (
	host string
	port int
)

func init() {
	flag.StringVar(&host,"host","127.0.0.1","Please input hosts")
	flag.IntVar(&port,"port",80,"please input Port")
}

// 这里的"127.0.0.1"为默认值,最后的为提示信息
func main() {
	flag.Parse()
	fmt.Println(host,port)
}
```

```go
D:\awesomeProject\awesomeProject>flag.exe -host 127.123123 -port 88
127.123123 88
```



## 自定义值

> 在使用过程中,我们可能需要使用稍微复杂一点的数据类型,比如数组,切片等,这就需要我们自定义数据类型,来进行传入
>
> `flag.Var`传入的值为一个`Value`的接口,这个接口需要实现两个方法:
>
> - `String()`: 将其字符串化
> - `Set()`: 控制其如何对字符串进行解析

```go
package main

import (
	"flag"
	"fmt"
	"strings"
)

type person_name []string

func (p *person_name) String() string {
	return fmt.Sprintf("%v", *p)
}

//按照,作为分隔符,将其放入一个数组
func (p *person_name) Set(s string) error {
	for _,v := range strings.Split(s,","){
		*p = append(*p,v)
	}
	return nil
}

var p person_name

func init() {
	flag.Var(&p,"name","123123")
}

func main() {
	flag.Parse()
	fmt.Println(p)
}
```

```go
D:\awesomeProject\awesomeProject>flag.exe -name fsl,fsq
[fsl fsq]

```

