# 为什么要validator

对于HTTP请求，我们要在脑子里有一个根深蒂固的概念，那就是任何客户端传过来的数据都是不可信任的。那么开发接口的时候需要对客户端传提交的参数进行参数校验，如果提交的参数只有一个两个，这样我们可以简单写个if判断，那么要是有很多的参数校验，那么满屏都是参数校验的if判断，效率不仅低还不美观，接下来我们介绍一个参数校验器`validator`。





# 快速开始

[详细英文文档](https://pkg.go.dev/github.com/go-playground/validator/v10#section-readme)

## 安装

```shell
 go get gopkg.in/go-playground/validator.v10
```





## 入门示例

```go
package main

import (
	"fmt"
	"github.com/go-playground/validator/v10"
)

type User struct {
    // 在validate中定义验证约束设置Name长度区间为[6,10]
	Name string `validate:"min=6,max=10"` 
	Age  int    `validate:"min=1,max=100"`
}

func main() {
	// 新建一个validate实例,这个实例将会用于验证数据的有效性
	validate := validator.New()
    // 创建一个User类型实例
	u1 := User{Name: "lidajun", Age: 18}
	// 使用Struct方法去验证这个User对象各个字段的有效性
	// 具体的约束在类型的Tag里面
	err := validate.Struct(u1)
	fmt.Println(err)

	u2 := User{Name: "dj", Age: 101}
	err = validate.Struct(u2)
	fmt.Println(err)
}

```

输出:

```
<nil>
Key: 'User.Name' Error:Field validation for 'Name' failed on the 'min' tag
Key: 'User.Age' Error:Field validation for 'Age' failed on the 'max' tag
```

> 报错非常清晰,说明了哪个字段违反了哪个约束,所以在使用的时候,只需要判断返回值为nil就行

​	



## 约束

### 范围约束

我们上面已经看到了使用`min`和`max`来约束字符串的长度或数值的范围，下面再介绍其它的范围约束。范围约束的字段类型有以下几种：

- 对于数值，则约束其值；
- 对于字符串，则约束其长度；
- 对于切片、数组和`map`，则约束其长度。

下面如未特殊说明，则是根据上面各个类型对应的值与参数值比较。

- `len`：等于参数值，例如`len=10`；
- `max`：小于等于参数值，例如`max=10`；
- `min`：大于等于参数值，例如`min=10`；
- `eq`：等于参数值，注意与`len`不同。对于字符串，`eq`约束字符串本身的值，而`len`约束字符串长度。例如`eq=10`；
- `ne`：不等于参数值，例如`ne=10`；
- `gt`：大于参数值，例如`gt=10`；
- `gte`：大于等于参数值，例如`gte=10`；
- `lt`：小于参数值，例如`lt=10`；
- `lte`：小于等于参数值，例如`lte=10`；
- `oneof`：只能是列举出的值其中一个，这些值必须是数值或字符串，以空格分隔，如果字符串中有空格，将字符串用单引号包围，例如`oneof=red green`。

大部分还是比较直观的，我们通过一个例子看看其中几个约束如何使用：

```go
package main

import (
	"fmt"
	"github.com/go-playground/validator/v10"
	"time"
)

type User struct {
    // 用户名不可以为admin
	Name    string    `validate:"ne=admin"`
    // 年龄必须大于等于18
	Age     int       `validate:"gte=18"`
    // 必须为male female 其中一个
	Sex     string    `validate:"oneof=male female"`
    // 注册时间必须小于当前的 UTC 时间，注意如果字段类型是time.Time，使用gt/gte/lt/lte等约束时不用指定参数值，默认与当前的 UTC 时间比较。
	RegTime time.Time `validate:"lte"`
}

func main() {
	validate := validator.New()

	u1 := User{Name: "dj", Age: 18, Sex: "male", RegTime: time.Now().UTC()}
	err := validate.Struct(u1)
	if err != nil {
		fmt.Println(err)
	}

	u2 := User{Name: "admin", Age: 15, Sex: "none", RegTime: time.Now().UTC().Add(1 * time.Hour)}
	err = validate.Struct(u2)
	if err != nil {
		fmt.Println(err)
	}
}
```

输出:

```
Key: 'User.Name' Error:Field validation for 'Name' failed on the 'ne' tag
Key: 'User.Age' Error:Field validation for 'Age' failed on the 'gte' tag
Key: 'User.Sex' Error:Field validation for 'Sex' failed on the 'oneof' tag
Key: 'User.RegTime' Error:Field validation for 'RegTime' failed on the 'lte' tag
```

### 跨字段约束

`validator`允许定义跨字段的约束，即该字段与其他字段之间的关系。这种约束实际上分为两种，一种是参数字段就是同一个结构中的平级字段，另一种是参数字段为结构中其他字段的字段。约束语法很简单，要想使用上面的约束语义，只需要稍微修改一下。例如**相等约束**（`eq`），如果是约束同一个结构中的字段，则在后面添加一个`field`，使用`eqfield`定义字段间的相等约束。如果是更深层次的字段，在`field`之前还需要加上`cs`（可以理解为`cross-struct`），`eq`就变为`eqcsfield`。它们的参数值都是需要比较的字段名，内层的还需要加上字段的类型：

```go
eqfield=ConfirmPassword
eqcsfield=InnerStructField.Field
```

#### 示例一:

```go
package main

import (
	"fmt"
	"github.com/go-playground/validator/v10"
)
type RegisterForm struct {
	Name      string `validate:"min=2"`
	Age       int    `validate:"min=18"`
	Password  string `validate:"min=10"`
	// 指定了两个字段必须一致
	Password2 string `validate:"eqfield=Password"`
}

func main() {
	validate := validator.New()

	f1 := RegisterForm{
		Name:      "dj",
		Age:       18,
		Password:  "1234567890",
		Password2: "1234567890",
	}
	err := validate.Struct(f1)
	if err != nil {
		fmt.Println(err)
	}

	f2 := RegisterForm{
		Name:      "dj",
		Age:       18,
		Password:  "1234567890",
		Password2: "123",
	}
	err = validate.Struct(f2)
	if err != nil {
		fmt.Println(err)
	}
}
```

输出:

```
Key: 'RegisterForm.Password2' Error:Field validation for 'Password2' failed on the 'eqfield' tag
```

#### 示例二

```go
package main

import (
	"fmt"
	"github.com/go-playground/validator/v10"
)
type Test struct {
	Name      string `validate:"min=5,eqfield=Name2.Name"`
	Name2 struct{
		Name string
	}
}

func main() {
	validate := validator.New()

	t1 := Test{
		Name:      "fengsilin",
		Name2: struct{ Name string }{Name: "fengsilin"},
	}
	err := validate.Struct(t1)
	if err != nil {
		fmt.Println(err)
	}

	t2 := Test{
		Name:      "fengsilin",
		Name2: struct{ Name string }{Name: "fengsilin1"},
	}
	err = validate.Struct(t2)
	if err != nil {
		fmt.Println(err)
	}
}
```

输出:

```
Key: 'Test.Name' Error:Field validation for 'Name' failed on the 'eqfield' tag
```

### 字符串

`validator`中关于字符串的约束有很多，这里介绍几个：

- `contains=`：包含参数子串，例如`contains=email`；
- `containsany`：包含参数中任意的 UNICODE 字符，例如`containsany=abcd`；
- `containsrune`：包含参数表示的 rune 字符，例如`containsrune=☻`；
- `excludes`：不包含参数子串，例如`excludes=email`；
- `excludesall`：不包含参数中任意的 UNICODE 字符，例如`excludesall=abcd`；
- `excludesrune`：不包含参数表示的 rune 字符，`excludesrune=☻`；
- `startswith`：以参数子串为前缀，例如`startswith=hello`；
- `endswith`：以参数子串为后缀，例如`endswith=bye`。

### 唯一性

使用`unqiue`来指定唯一性约束，对不同类型的处理如下：

- 对于数组和切片，`unique`约束没有重复的元素；
- 对于`map`，`unique`约束没有重复的**值**；
- 对于元素类型为结构体的切片，`unique`约束结构体对象的某个字段不重复，通过`unqiue=field`指定这个字段名。

例如：

```go
type User struct {
  Name    string   `validate:"min=2"`
  Age     int      `validate:"min=18"`
  Hobbies []string `validate:"unique"`
  Friends []User   `validate:"unique=Name"`
}

func main() {
  validate := validator.New()

  f1 := User{
    Name: "dj2",
    Age:  18,
  }
  f2 := User{
    Name: "dj3",
    Age:  18,
  }

  u1 := User{
    Name:    "dj",
    Age:     18,
    Hobbies: []string{"pingpong", "chess", "programming"},
    Friends: []User{f1, f2},
  }
  err := validate.Struct(u1)
  if err != nil {
    fmt.Println(err)
  }

  u2 := User{
    Name:    "dj",
    Age:     18,
    Hobbies: []string{"programming", "programming"},
    Friends: []User{f1, f1},
  }
  err = validate.Struct(u2)
  if err != nil {
    fmt.Println(err)
  }
}
```

限制爱好`Hobbies`中不能有重复元素，好友`Friends`的各个元素不能有同样的名字`Name`。第一个对象满足约束，第二个对象的`Hobbies`字段包含了重复的`"programming"`，`Friends`字段中两个元素的`Name`字段都是`dj2`。程序输出：

```
Key: 'User.Hobbies' Error:Field validation for 'Hobbies' failed on the 'unique' tag
Key: 'User.Friends' Error:Field validation for 'Friends' failed on the 'unique' tag
```

### 邮件

```go
type User struct {
  Name  string `validate:"min=2"`
  Age   int    `validate:"min=18"`
  Email string `validate:"email"`
}

func main() {
  validate := validator.New()

  u1 := User{
    Name:  "dj",
    Age:   18,
    Email: "dj@example.com",
  }
  err := validate.Struct(u1)
  if err != nil {
    fmt.Println(err)
  }

  u2 := User{
    Name:  "dj",
    Age:   18,
    Email: "djexample.com",
  }
  err = validate.Struct(u2)
  if err != nil {
    fmt.Println(err)
  }
}
```

上面我们约束`Email`字段必须是邮件的格式，第一个对象满足约束，第二个对象不满足，程序输出：

```

Key: 'User.Email' Error:Field validation for 'Email' failed on the 'email' tag
```

### 特殊

有一些比较特殊的约束：

- `-`：跳过该字段，不检验；
- `|`：使用多个约束，只需要满足其中一个，例如`rgb|rgba`；
- `required`：字段必须设置，不能为默认值；
- `omitempty`：如果字段未设置，则忽略它。

### 其他

`validator`提供了大量的、各个方面的、丰富的约束，如`ASCII/UNICODE`字母、数字、十六进制、十六进制颜色值、大小写、RBG 颜色值，HSL 颜色值、HSLA 颜色值、JSON 格式、文件路径、URL、base64 编码串、ip 地址、ipv4、ipv6、UUID、经纬度等等等等等等等等等等等。限于篇幅这里就不一一介绍了。感兴趣自行去文档中挖掘。





## 自定义约束

除了使用`validator`提供的约束外，还可以定义自己的约束。例如现在有个奇葩的需求，产品同学要求用户必须使用回文串作为用户名，我们可以自定义这个约束：

```go

type RegisterForm struct {
  Name string `validate:"palindrome"`
  Age  int    `validate:"min=18"`
}

func reverseString(s string) string {
  runes := []rune(s)
  for from, to := 0, len(runes)-1; from < to; from, to = from+1, to-1 {
    runes[from], runes[to] = runes[to], runes[from]
  }

  return string(runes)
}

func CheckPalindrome(fl validator.FieldLevel) bool {
  value := fl.Field().String()
  return value == reverseString(value)
}

func main() {
  validate := validator.New()
  validate.RegisterValidation("palindrome", CheckPalindrome)

  f1 := RegisterForm{
    Name: "djd",
    Age:  18,
  }
  err := validate.Struct(f1)
  if err != nil {
    fmt.Println(err)
  }

  f2 := RegisterForm{
    Name: "dj",
    Age:  18,
  }
  err = validate.Struct(f2)
  if err != nil {
    fmt.Println(err)
  }
}
```

首先定义一个类型为`func (validator.FieldLevel) bool`的函数检查约束是否满足，可以通过`FieldLevel`取出要检查的字段的信息。然后，调用验证器的`RegisterValidation()`方法将该约束注册到指定的名字上。最后我们就可以在结构体中使用该约束。上面程序中，第二个对象不满足约束`palindrome`，输出：

```
Key: 'RegisterForm.Name' Error:Field validation for 'Name' failed on the 'palindrome' tag
```

## 错误处理

`validator`返回的错误实际上只有两种，一种是参数错误，一种是校验错误。参数错误时，返回`InvalidValidationError`类型；校验错误时返回`ValidationErrors`，它们都实现了`error`接口。而且`ValidationErrors`是一个错误切片，它保存了每个字段违反的每个约束信息：

```go
// src/gopkg.in/validator.v10/errors.go
type InvalidValidationError struct {
  Type reflect.Type
}

// Error returns InvalidValidationError message
func (e *InvalidValidationError) Error() string {
  if e.Type == nil {
    return "validator: (nil)"
  }

  return "validator: (nil " + e.Type.String() + ")"
}

type ValidationErrors []FieldError

func (ve ValidationErrors) Error() string {
  buff := bytes.NewBufferString("")
  var fe *fieldError

  for i := 0; i < len(ve); i++ {
    fe = ve[i].(*fieldError)
    buff.WriteString(fe.Error())
    buff.WriteString("\n")
  }
  return strings.TrimSpace(buff.String())
}
```

所以`validator`校验返回的结果只有 3 种情况：

- `nil`：没有错误；
- `InvalidValidationError`：输入参数错误,在传入的类型不是一个结构体也不是`time.Time{}`对象时出现
- `ValidationErrors`：字段违反约束。

我们可以在程序中判断`err != nil`时，依次将`err`转换为`InvalidValidationError`和`ValidationErrors`以获取更详细的信息：



```go
func processErr(err error) {
  if err == nil {
    return
  }

  invalid, ok := err.(*validator.InvalidValidationError)
  if ok {
    fmt.Println("param error:", invalid)
    return
  }

  validationErrs := err.(validator.ValidationErrors)
  for _, validationErr := range validationErrs {
    fmt.Println(validationErr)
  }
}

func main() {
  validate := validator.New()

  err := validate.Struct(1)
  processErr(err)

  err = validate.VarWithValue(1, 2, "eqfield")
  processErr(err)
}
```

