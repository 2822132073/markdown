# reflect



[Golang的反射reflect深入理解和示例](https://juejin.cn/post/6844903559335526407)

> 在Go语言的反射机制中，任何接口值都由是`一个具体类型`和`具体类型的值`两部分组成的, 在Go语言中反射的相关功能由内置的reflect包提供，任意接口值在反射中都可以理解为由`reflect.Type`和`reflect.Value`两部分组成，并且reflect包提供了`reflect.TypeOf`和`reflect.ValueOf`两个函数来获取任意对象的Value和Type。

在 reflect 包中，主要通过两个函数 **TypeOf()** 和 **ValueOf()** 实现反射，TypeOf() 获取到的结果是 **reflect.Type** 类型，**ValueOf()** 获取到的结果是 **reflect.Value** 类型，这两种类型都有很多方法可以进一步获取相关的反射信息。

![Golang中的reflect原理](https://cdn.jsdelivr.net/gh/2822132073/image/202209261703037.jpeg)



## reflect.TypeOf

> `Typeof`返回的是一个`Type`接口的实现:`rtype`

### Kind和Type



> 在反射中关于类型还划分为两种：`类型（Type）`和`种类（Kind）`。因为在Go语言中我们可以使用type关键字构造很多自定义类型，而`种类（Kind）`就是指底层的类型，但在反射中，当需要区分指针、结构体等大品种的类型时，就会用到`种类（Kind）`。
> > 对于指针这样的引用类型,Name()的值就是空字符串,例如:`数组`,`slice`,`map`,`chan`等这些都是返回的是空字符串
>
> `Kind`的就是指的是数据类型的底层,可能结果有这些
>
> ```
>Bool
> Int
> Int8
> Int16
> Int32
> Int64
> Uint
> Uint8
> Uint16
> Uint32
> Uint64
> Uintptr
> Float32
> Float64
> Complex64
> Complex128
> Array
> Chan
> Func
> Interface
> Map
> Pointer
> Slice
> String
> Struct
> UnsafePointer
> 
> ```
> 






### 相关代码实践


```golang
package main

import (
	"fmt"
	"reflect"
)

func reflectType(x interface{}) {
	v := reflect.TypeOf(x)
	fmt.Printf("type: %v find: %v\n",v.Name(),v.Kind())

}

type Cat struct {
}

type Dog struct {
}
func main() {
	reflectType(123) //type: int find: int
	reflectType(Cat{})  //type: Cat find: struct
	var v float64
	reflectType(v) //type: float64 find: float64
	var floatP *float64
	reflectType(floatP) //type:  find: ptr
	reflectType(Dog{}) //type: Dog find: struct
}


```

### 通过索引获取结构体字段相关信息

> 根据`Type`的`Field`方法返回的`StructField`可以获取结构体的相关属性,主要是用来进行获取Tag的值

```go
type Dog struct {
	name string `json:"json_name" yaml:"yaml_name"`
	gender string `json:"json_gender" yaml:"yaml_gender"`
}

func main() {
	var d Dog
	reflectType(d)
	t := reflect.TypeOf(d)
	fmt.Printf("NumField: %v\n",t.NumField()) // 获取结构体的字段数
	for i := 0; i < t.NumField(); i++ {
		v := t.Field(i)   //过去指定索引位置的字段
		//Field返回的Tag里面的Get方法可以获取指定的Tag,还可以获取指定的属性的值
		fmt.Printf("Name: %v Type: %v PkgPath: %v jsonTag: %v\n",v.Name,v.Type,v.PkgPath,v.Tag.Get("json"))
	}
}
```

### 通过结构体字段名获取相关信息

> 可以通过`FieldByName`传入字段名获取相关的信息

```go
package main

import (
	"fmt"
	"reflect"
)


type Dog struct {
	name   string `json:"json_name" yaml:"yaml_name"`
	gender string `json:"json_gender" yaml:"yaml_gender"`
}

func (d Dog) Eat(s string) string {
	fmt.Printf("Dog is eating %s......\n",s)
	return "meat"
}


func main() {
	var d Dog
	t := reflect.TypeOf(d)
	field, ok := t.FieldByName("name")  //通过名称获取Field
	if !ok {
		fmt.Println(ok)
	}
	fmt.Printf("Name: %v Type: %v PkgPath: %v jsonTag: %v\n",field.Name,field.Type,field.PkgPath,field.Tag.Get("json"))
}


```











## reflect.Valueof

### 修改传入的接口值

> 想要修改传入的接口的值,需要传入指针,不然会在执行Elem()时会出现Panic,在使用Set方法时,传入的是reflect.Value类型的值,需要进行转换一下

```go
package main

import (
	"fmt"
	"reflect"
)
type Dog struct {
	name   string `json:"json_name" yaml:"yaml_name"`
	gender string `json:"json_gender" yaml:"yaml_gender"`
}

func (d Dog) eat() string {
	fmt.Println("Dog is eating meat......")
	return "meat"
}

func main() {
	var d Dog
	d.gender = "1"
	d.name = "2"
	v := reflect.ValueOf(&d)
	nv := reflect.ValueOf(Dog{name: "wsm",gender: "12"})
	v.Elem().Set(nv)
	fmt.Println(d)  //{wsm 12}
}

```

### 调用结构体的方法

> 注意方法名需要开头大写,不然reflect无法进行访问

```go
package main

import (
	"fmt"
	"reflect"
)

type Dog struct {
	name   string `json:"json_name" yaml:"yaml_name"`
	gender string `json:"json_gender" yaml:"yaml_gender"`
}

func (d Dog) Eat(s string) string {
	fmt.Printf("Dog is eating %s......\n",s)
	return "meat"
}

func main() {
	var d Dog
	v := reflect.ValueOf(d)  //获取reflect.Value对象
	method := v.MethodByName("Eat")  //通过方法名字获取方法
	args := []reflect.Value{reflect.ValueOf("meat")}  //在反射中执行方法时,需要调用Call,Call的参数为[]reflect.Value类型
	method.Call(args)  //执行方法
}

```



## 其它

### Type到Value的相互转换

> Value->Type：可以通过Value.Type()方法获得；而Type->Value是指创建一个Type的实例对象，则可以通过reflect.New(typ)等方法创建。
