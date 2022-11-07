[知乎文章](https://zhuanlan.zhihu.com/p/299048675)

## 库的一些方法

Go语言模板引擎的使用可以分为三部分：定义模板文件、解析模板文件和模板渲染.

### 定义模板文件

其中，定义模板文件时需要我们按照相关语法规则去编写

### 解析模板文件

上面定义好了模板文件之后，可以使用下面的常用方法去解析模板文件，得到模板对象：

```go
func (t *Template) Parse(src string) (*Template, error)
func ParseFiles(filenames ...string) (*Template, error)
func ParseGlob(pattern string) (*Template, error)
```

当然，你也可以使用`func New(name string) *Template`函数创建一个名为`name`的模板，然后对其调用上面的方法去解析模板字符串或模板文件。

### 模板渲染

渲染模板简单来说就是使用数据去填充模板，当然实际上可能会复杂很多。

```go
func (t *Template) Execute(wr io.Writer, data interface{}) error
func (t *Template) ExecuteTemplate(wr io.Writer, name string, data interface{}) error
```

## 第一个简单的示例

**main.go**

```go
package main

import (
	"net/http"
	"text/template"
)

func sayHello(w http.ResponseWriter, r *http.Request)  {
    // 解析文件为模板,ParseFiles可以传入多个文件,传入的第一个文件为template的名字
    // 如果有多个文件名相同,不同目录的文件,传入的最后一个将会是template的名字
    // 模板解析
	files, err := template.ParseFiles("templates/sayHello.tmpl")
	if err != nil {
		return
	}
    // 模板渲染
	err = files.Execute(w,"fsl")
	if err != nil {
		return
	}
}


func main() {
	http.HandleFunc("/",sayHello)
	http.ListenAndServe(":8080",nil)
}

```

> template.ParseFiles传入多个template,在使用时只能使用被当做名字的那个template,暂时将这个template称为主template,其它的template只能在主template中被引用.
>
> 关于哪个template是主template,
>
> 当每个模板的名称都不相同时,传入的第一个template就是
>
> 当模板名称相同但是在不同目录,就是最后一个

**sayHello.tmpl**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Hello</title>
</head>
<body>
<p>Hello {{.}}</p>
</body>
</html>
```



## 模板语法





### 分界符

在`go template`中默认的分界符使用两个大括号`{{}}`,这个分界符可以进行修改

### 取值

取值的作用主要是在页面中表示出来，或者使用一个变量保存

| 类型       | 方式             | 解释                                                         |
| ---------- | ---------------- | ------------------------------------------------------------ |
| 当前值     | `{{ . }}`        | 传什么值，就取什么值，假如直接在页面上输出的话，类似fmt.Println,类似于java里面的`self`,js里面的`this` |
| 结构体     | `{{ .Field }}`   | `Field`指的是字段名，假如结构体嵌套，还可以再使用`.`取值     |
| 变量       | `{{ $varName }}` | 以`$`开头，取出变量的值                                      |
| 字典       | `{{ .key }}`     | 取字典key对应的值，不需要首字母大写，嵌套时，可以再使用`.`取值 |
| 无参数方法 | `{{ .Method }}`  | 执行Method这个方法，第一个返回值作为取出的值                 |
| 无参数函数 | `{{ func }}`     | 执行func()，把返回值当做结果                                 |



```go
type Address struct {
	City string
	Country string
}

type User struct {
	Address
	Name string
	Age int
	Sex bool
}

```



### 注释

注释，执行时会忽略。可以多行。注释不能嵌套，并且必须紧贴分界符始止，就像这里表示的一样。
`{{/* 我是注释啊 */}}`

### with....end

**形式一**： `{{with pipeline}} T1 {{end}}`
如果pipeline不为nil,with...end的范围内的.的值将会被替换为pipeline的值,作用域仅仅在with...end中,外部.值不会被改变



```jinja
{{ with .Address }}
    {{.}}
{{end}}
```



**形式二**：`{{with pipeline}} T1 {{else}} T0 {{end}}`
如果pipeline为empty，不改变dot并执行T0，否则dot设为pipeline的值并执行T1。不修改外面的dot。
实际上这和上面的一样，就是多了个`{{ else }}`

```jinja
{{ with gt . 18}} result：{{ . }}, 嘿嘿嘿 {{else}} 才{{ . }}岁，未成年 {{end}}
```

### range

可以对数组,切片,map等进行遍历

`{{range pipeline}} T1 {{end}}`

可以在range中使用.取得遍历得到的数据,遍历数组切片map时,这样使用的结果为对象的值,如果想要取得索引或者key,需要使用下面这种方式

` {{range $k,$v := pipeline}} T1 {{end}}`

这样做,$k在pipeline为数组或者切片时,为索引,当pipeline为map时,$k为key值,$v为值

```go
package main

import (
	"os"
	"text/template"
)


func main() {
	m := map[string]string{
		"数学":"math",
		"语文":"chinese",
		"英语":"english",
	}
	s := make([]string,0)
	s = append(s,"一")
	s = append(s,"二")
	s = append(s,"三")
	s = append(s,"四")
	s = append(s,"五")
	s = append(s,"六")
	s = append(s,"七")
	s = append(s,"八")
	t, _ := template.ParseFiles("templates/test.tmpl")
	_ = t.Execute(os.Stdout, s)
	_ = t.Execute(os.Stdout,m)
}

```

模板文件:

```jinja2
{{range $k,$v := . -}}
    {{ $k }}:{{ $v }}
{{ end}}
```

输出:

```
0:一
1:二
2:三
3:四
4:五
5:六
6:七
7:八


数学:math
英语:english
语文:chinese
```

当模板文件换成:

```jinja2
{{range . -}}
    {{ . }}
{{ end}}
```

输出:

```
一
二
三
四
五
六
七
八

math
english
chinese
```

### template

`template`就是对`define`定义的模板或其他模板文件的引用。
**template的形式**

- `{{template "name"}}`
  执行名为name的模板,这个模板可以是另外一个文件,也可以是本文件中定义的，提供给模板的参数为nil，如模板不存在输出为""
- `{{template "name" pipeline}}`
  执行名为name的模板，提供给模板的参数为pipeline的值。

如，在当前文件中引用：

```jinja
{{ define "rd"}}
    <div>
    {{ range . }}
        <p>{{ . }}</p>
    {{ else }}
        <span>v2 no data</span>
    {{ end }}
</div>
{{ end }}
 
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <title>template</title>
</head>
 
<body>
{{/*引用*/}}
{{ template "rd"}}
</body>
</html>
```

**template引用其他文件注意：**

1. 如果模板定义在其他的文件中,千万注意，要在代码中把文件读进来。
   `t, _ := template.ParseFiles("./h1.tpl", "./h2.tpl")`
   也可以使用其他函数
2. 在引入多个文件时,如果其他的文件中没有使用define时,模板的名字就是文件的文件名,template后面跟的是完整的文件名
   在h1.tpl中：`{{ template "h2.tpl" }}`

**`{{template "name" pipeline}}`形式**
就是把define中或文件中的`.`替换成template传进去的值，假如不指定的话，使用当前文件的`.`

```jinja
{{ define "say"}}
    <h1>say {{ . }}</h1>
{{ end }}
{{ template "say" "hi"}}
```

结果：`<h1>say hi</h1>`

### define

> 一个tmpl文件中,可以使用多个`{{define}}...{{end}}`语句,就像下面这样
>
> ```jinja2
> {{ define "t1"}}
>     模板一
> {{end}}
> {{ define "t2"}}
>     模板二
> {{end}}
> 名字: {{.Name}}
> 年龄: {{.Age}}
> 性别: {{if .Sex}}男{{else}}女{{end}}
> 住址: {{ template "printAddress" .Address}}
> 
> {{template "t1"}}
> {{template "t2"}}
> 
> ```
>
> 

当解析模板时，可以定义另一个模板，该模板会和当前解析的模板相关联。**模板必须定义在当前模板的最顶层**，就像go程序里的全局变量一样。
这种定义模板的语法是将每一个子模板的声明放在"define"和"end" action内部。
如：

```jinja
{{ define "rd"}}
    <div>
    {{ range . }}
        <p>{{ . }}</p>
    {{ else }}
        <span>v2 no data</span>
    {{ end }}
</div>
{{ end }}
```

注意：结尾`{{ end }}`和`define`后面的是字符串

### if

有以下3种

1. `{{if pipeline}} T1 {{end}}`
   如果pipeline的值为empty，不产生输出，否则输出T1执行结果。不改变dot的值。
   Empty值包括false、0、任意nil指针或者nil接口，任意长度为0的数组、切片、字典。
   如：

```jinja
<p>{{ if . }}welcome{{ end }}</p>
```

在这里我传的是一个bool值，为true，因此p便签中的内容为welcom

2. `{{if pipeline}} T1 {{else}} T0 {{end}}`
   如果pipeline的值为empty，输出T0执行结果，否则输出T1执行结果。不改变dot的值。

```jinja
<p>{{ if . }}welcome{{ else }}  Get out!{{ end }}</p>
```

3. `{{if pipeline}} T1 {{else if pipeline}} T0 {{end}}`
   用于简化if-else链条，else action可以直接包含另一个if；等价于：
   `{{if pipeline}} T1 {{else}}{{if pipeline}} T0 {{end}}{{end}}`

```jinja
<p>{{ if eq . 1 }}count=1{{ else if eq . 2}}  count=2{{ else if eq . 3}}  count=3{{ end }}</p>
```

### 变量

有些值，我们可能需要重复使用，最好的方法就是使用一个变量来保存值减少重复求值的过程。

```golang
// 用到的数据
name := "abcdef"
```

假如我们把name传进来，那么假如要求其长度并将其保存起来，可以使用一个内置函数(见1.4)：`len`
在go template中，用`$`表示变量，有点类似shell，使用：

```jinja2
{{ $lenght := len . }}
<h1>长度：{{ $lenght }}</h1>
```

实际上，还可以这样写：

```jinja2
{{ $lenght := . | len }}
<h1>长度：{{ $lenght }}</h1>
```

还可以将我们传入的`.`赋给变量

```
{{$address := .Address}}
```





### block

block等价于define定义一个名为name的模板，并在"有需要"的地方执行这个模板，执行时将`.`设置为pipeline的值。

过程相当于 `block去找content` -- > `找到:直接进行引用,不需要管自己block..end中的内容`

--> `没有找到,自己定义一个,使用自己里面的内容`

在自己定义之后,其它地方也可以进行引用这里定义的

```jinja
{{define "default"}}找不到页面{{end}}

<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <title>Go Templates</title>
</head>
<body>
<div class="container-fluid">
    {{block "content" . }}{{template "default"}}{{end}}
</div>
</body>
</html>
```

> 在这个例子中block会先去找有没有已经定义过的content模板,如果有就直接拿过来用,如果没有这个,则自己定义一个并使用

而在其他的模板文件中：

```jinja
{{define "content"}}
	<!-- 写入自己的代码 -->
    <div>Hello world!</div>
{{end}}
```

**同样要注意，在解析文件时把多个模板文件传进来**

### 去空

`{{- . -}}`
使用`{{-`语法去除模板内容左侧的所有空白符号， 使用`-}}`去除模板内容右侧的所有空白符号。

## 函数

执行模板时，函数从两个函数字典中查找：首先是模板函数字典，然后是全局函数字典。一般不在模板内定义函数，而是使用Funcs方法添加函数到模板里。

### 一般函数

- and
  函数返回它的第一个empty参数如果全部都为非空时,返回最后一个值
  就是说"and x y"等价于"if x then y else x"；所有参数都会执行；
  *和上面一样：Empty值包括false、0、任意nil指针或者nil接口，任意长度为0的数组、切片、字典。下面再重复*

如：

```jinja
{{ and 1 0 }}
{{/* 返回0 */}}
 
{{ and 1 1 1}}
{{/* 返回1 */}}
```

- or
  返回第一个非empty参数或者最后一个参数；
  亦即"or x y"等价于"if x then x else y"；所有参数都会执行；

如：

```jinja
{{ or 1 0 }}
{{/* 返回1 */}}
 
{{ or 0 2 1}}
{{/* 返回2 */}}
```

- not
  返回它的单个参数的布尔值的否定

如：

```jinja
{{ not 1 }}
{{/* 返回false */}}
 
{{ not 0 }}
{{/* 返回true */}}
```

- len
  返回它的参数的整数类型长度

如：

```jinja
{{/*  . 为"abcdef"  */}}
{{ len . }}
 
{{/*  返回6  */}}
```

- index
  执行结果为第一个参数以剩下的参数为索引/键指向的值；
  如"index x 1 2 3"返回x\[1]\[2][3]的值；每个被索引的主体必须是数组、切片或者字典。

假如数据为：

```golang
	data := [][]int{
		{1, 2, 3, 4, 5,},
		{6, 7, 8, 9, 10，},
	}
{{ index . 0 1}}
 
{{/* 结果为2 */
```

- print
  即fmt.Sprint
  S系列函数会把传入的数据生成并返回一个字符串。以下两个相同。
- printf
  即fmt.Sprintf
- println
  即fmt.Sprintln
- html
  返回与其参数的文本表示形式等效的转义HTML。
  这个函数在`html/template`中**不可用**。
- urlquery
  以适合嵌入到网址查询中的形式返回其参数的文本表示的转义值。
  这个函数在`html/template`中**不可用**。
- js
  返回与其参数的文本表示形式等效的转义JavaScript。
- call
  执行结果是调用第一个参数的返回值，该参数必须是函数类型，其余参数作为调用该函数的参数；
  如`{{ call .X.Y 1 2 }}`等价于go语言里的`dot.X.Y(1, 2)`；
  其中Y是函数类型的字段或者字典的值，或者其他类似情况；
  call的第一个参数的执行结果必须是函数类型的值（和预定义函数如print明显不同）；
  该函数类型值必须有1到2个返回值，如果有2个则后一个必须是error接口类型；
  如果有2个返回值的方法返回的error非nil，模板执行会中断并返回给调用模板执行者该错误；

### 布尔函数

布尔函数会将任何类型的零值视为假，其余视为真。

| 函数 | 说明                     |
| ---- | ------------------------ |
| eq   | 如果arg1 == arg2则返回真 |
| ne   | 如果arg1 != arg2则返回真 |
| lt   | 如果arg1 < arg2则返回真  |
| le   | 如果arg1 <= arg2则返回真 |
| gt   | 如果arg1 > arg2则返回真  |
| ge   | 如果arg1 >= arg2则返回真 |

**注意:**
为了简化多参数相等检测，eq（只有eq）可以接受2个或更多个参数，它会将第一个参数和其余参数依次比较，返回下式的结果：

`arg1 == arg2 || arg1 ==arg3 || arg1==arg4 ...`
（和go的||不一样，不做惰性运算，所有参数都会执行）

比较函数只适用于基本类型（或重定义的基本类型，如"type Celsius float32"）。它们实现了go语言规则的值的比较，但具体的类型和大小会忽略掉，因此*任意类型有符号整数值都可以互相比较；任意类型无符号整数值都可以互相比较；等等。但是，整数和浮点数不能互相比较。*

### 自定义函数

使用`Funcs`方法，可以将自定义好的函数放入到模板中。
`Funcs`的签名：
`func (t *Template) Funcs(funcMap FuncMap) *Template`
Funcs方法向模板t的函数字典里加入参数funcMap内的键值对。
如果funcMap某个键值对的值不是函数类型或者返回值不符合要求会panic。
但是，可以对t函数列表的成员进行重写。方法返回t以便进行链式调用。

例子：
***例子中的使用的一些方法，见第2部分***

```golang
// 1. 定义函数，首字母可以小写，注意返回值
func SayHi(char string) (string, error) {
	return "Hi" + char, nil
 
}
 
func indexFunc(w http.ResponseWriter, r *http.Request) {
	// 2. new
	t := template.New("hello.tpl")
	// 3. 加入t的函数列表，需要替换掉t
	t = t.Funcs(template.FuncMap{"sayHi": SayHi})
	// 4. Parse 可以是文件也可以是字符串
	t, _ = t.ParseFiles("./hello.tpl")
 
	userName := "xxx"
	// 5. 渲染
	_ = t.Execute(w, userName)
}
```

上面代码的2-4步，可以使用一段链式调用完成：

```golang
t, _ := template.New("hello.tpl").Funcs(template.FuncMap{"sayHi": SayHi}).ParseFiles("./hello.tpl")
```

**注意事项**
`template.New`的文件名应该和要渲染的文件名一样
自定义函数有1-2个返回值，第一个值当做正式返回值。假如有第二个返回值：用来`panic`，其类型必须是`error`，当对应的值非`nil`时，`panic`