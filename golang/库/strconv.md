## Strconv

> Strconv是一个golang内置的一种基本数据类型转换的库



## 最基本的使用

```golang
//将字符串转换成int型数据
func Atoi(s string) (i int, err error)
//将int数据转换成字符串类型
func Itoa(i int) string
```



## Parse系列方法

> 将字符类型的数据转换成其它类型的数据

```golang
//将字符串转换成bool类型的数据格式，会识别1，0，t,f,T,F,True,False,TRUE,FALSE
func ParseBool(str string) (value bool, err error)
//将字符串转换为int型数据，第一个参数是需要转化的字符串，第二个参数是字符串的进制，如果为0，会自动识别开头是0x就是十六进制，0是八进制，默认为十进制，第三个参数为转换后的数据格式，0,8,16,32,64，但是，返回的总是int64，只不过如果传参为8，后期进行数据类型转换时，不会造成精度丢失
func ParseInt(s string, base int, bitSize int) (i int64, err error)
// 将字符串转换为float类型，第二个参数为精度32,64，同样返回的也总是float64，但是后期进行数据格式转换时，不会造成精度丢失
func ParseFloat(s string, bitSize int) (f float64, err error)
//将字符串转换为uint类型，无符号类型，第二个参数为字符串的进制数，第三个参数为格式转换后的数据格式，0,8,16,32,64
func ParseUint(s string, base int, bitSize int) (n uint64, err error)
```

## Format系列

将其他类型的数据转换成字符型的数据

```golang
//将bool类型的值转化为字符串类型
func FormatBool(b bool) string
//将int类型的数据格式转化为string类型，第二个参数表示生成字符串的进制
func FormatInt(i int64, base int) string
//将无符号int转换为字符串，第二个参数为转换的字符串的进制
func FormatUint(i uint64, base int) string
//将小数转换为字符串
func FormatFloat(f float64, fmt byte, prec, bitSize int) string
```

## quote系列

将字符进行转义

```golang
// 双引号字面表示值，将不可打印的数据，进行转义
func Quote(s string) string
// fmt.Println(strconv.Quote(`"adsasdasdasd"`)) out: "\"adsasdasdasd\""
// 将rune数据类型转换为string类型。双引号字面的表示值，将不可打印的数据进行转义。
func QuoteRune(r rune) string
```

## append系列

```golang
//以AppendBool为例，底层都是使用append在切片中添加数据
//appendbool=append(slice , bool(true , false))
func AppendBool(dst []byte, b bool) []byte
```

