## cast

cast提供一组容易使用的函数用来进行数据类型的转换





## TO

> To__后面接数据类型,例如ToString,ToBool等等等,这些方法传入一个空接口类型的数据,然后返回指定的数据类型,在数据类型无法转换时,不抛出错误,而是返回nil,或者空字符串
>
> 还有To__E函数,与上面不同的是,该函数种类会返回一个带err的返回值,告诉你错误在哪里

```golang

func ToBool(i interface{}) bool
func ToBoolE(i interface{}) (bool, error)
func ToBoolSlice(i interface{}) []bool
func ToBoolSliceE(i interface{}) ([]bool, error)
func ToDuration(i interface{}) time.Duration
func ToDurationE(i interface{}) (d time.Duration, err error)
func ToDurationSlice(i interface{}) []time.Duration
func ToDurationSliceE(i interface{}) ([]time.Duration, error)
func ToFloat32(i interface{}) float32
func ToFloat32E(i interface{}) (float32, error)
func ToFloat64(i interface{}) float64
func ToFloat64E(i interface{}) (float64, error)
func ToInt(i interface{}) int
func ToInt16(i interface{}) int16
func ToInt16E(i interface{}) (int16, error)
func ToInt32(i interface{}) int32
func ToInt32E(i interface{}) (int32, error)
func ToInt64(i interface{}) int64
func ToInt64E(i interface{}) (int64, error)
func ToInt8(i interface{}) int8
func ToInt8E(i interface{}) (int8, error)
func ToIntE(i interface{}) (int, error)
func ToIntSlice(i interface{}) []int
func ToIntSliceE(i interface{}) ([]int, error)
func ToSlice(i interface{}) []interface{}
func ToSliceE(i interface{}) ([]interface{}, error)
func ToString(i interface{}) string
func ToStringE(i interface{}) (string, error)
func ToStringMap(i interface{}) map[string]interface{}
func ToStringMapBool(i interface{}) map[string]bool
func ToStringMapBoolE(i interface{}) (map[string]bool, error)
func ToStringMapE(i interface{}) (map[string]interface{}, error)
func ToStringMapInt(i interface{}) map[string]int
func ToStringMapInt64(i interface{}) map[string]int64
func ToStringMapInt64E(i interface{}) (map[string]int64, error)
func ToStringMapIntE(i interface{}) (map[string]int, error)
func ToStringMapString(i interface{}) map[string]string
func ToStringMapStringE(i interface{}) (map[string]string, error)
func ToStringMapStringSlice(i interface{}) map[string][]string
func ToStringMapStringSliceE(i interface{}) (map[string][]string, error)
func ToStringSlice(i interface{}) []string
func ToStringSliceE(i interface{}) ([]string, error)
func ToTime(i interface{}) time.Time
func ToTimeE(i interface{}) (tim time.Time, err error)
func ToTimeInDefaultLocation(i interface{}, location *time.Location) time.Time
func ToTimeInDefaultLocationE(i interface{}, location *time.Location) (tim time.Time, err error)
func ToUint(i interface{}) uint
func ToUint16(i interface{}) uint16
func ToUint16E(i interface{}) (uint16, error)
func ToUint32(i interface{}) uint32
func ToUint32E(i interface{}) (uint32, error)
func ToUint64(i interface{}) uint64
func ToUint64E(i interface{}) (uint64, error)
func ToUint8(i interface{}) uint8
func ToUint8E(i interface{}) (uint8, error)
func ToUintE(i interface{}) (uint, error)
```





## func StringToDate(s string) (time.Time, error)

> 将字符串转换成Time类型,这个函数提供了一组时间格式,如果没有匹配,将会返回错误

### 支持的转换列表

```golang
timeFormats = []timeFormat{
		{time.RFC3339, timeFormatNumericTimezone},
		{"2006-01-02T15:04:05", timeFormatNoTimezone}, // iso8601 without timezone
		{time.RFC1123Z, timeFormatNumericTimezone},
		{time.RFC1123, timeFormatNamedTimezone},
		{time.RFC822Z, timeFormatNumericTimezone},
		{time.RFC822, timeFormatNamedTimezone},
		{time.RFC850, timeFormatNamedTimezone},
		{"2006-01-02 15:04:05.999999999 -0700 MST", timeFormatNumericAndNamedTimezone},
		{"2006-01-02T15:04:05-0700", timeFormatNumericTimezone},                        
		{"2006-01-02 15:04:05Z0700", timeFormatNumericTimezone},                      
		{"2006-01-02 15:04:05", timeFormatNoTimezone},
		{time.ANSIC, timeFormatNoTimezone},
		{time.UnixDate, timeFormatNamedTimezone},
		{time.RubyDate, timeFormatNumericTimezone},
		{"2006-01-02 15:04:05Z07:00", timeFormatNumericTimezone},
		{"2006-01-02", timeFormatNoTimezone},
		{"02 Jan 2006", timeFormatNoTimezone},
		{"2006-01-02 15:04:05 -07:00", timeFormatNumericTimezone},
		{"2006-01-02 15:04:05 -0700", timeFormatNumericTimezone},
		{time.Kitchen, timeFormatTimeOnly},
		{time.Stamp, timeFormatTimeOnly},
		{time.StampMilli, timeFormatTimeOnly},
		{time.StampMicro, timeFormatTimeOnly},
		{time.StampNano, timeFormatTimeOnly},
	}
```

### func StringToDateInDefaultLocation(s string, location *time.Location) (time.Time, error)

> 返回时间,用指定的时区

## func ToSliceE(i interface{}) ([]interface{}, error) 

> 将空接口类型转换为空接口数组

```golang
func ToSliceE(i interface{}) ([]interface{}, error) {
	var s []interface{}

	switch v := i.(type) {
	case []interface{}:
		return append(s, v...), nil
	case []map[string]interface{}:
		for _, u := range v {
			s = append(s, u)
		}
		return s, nil
	default:
		return s, fmt.Errorf("unable to cast %#v of type %T to []interface{}", i, i)
	}
}
```

> 可以通过源码看出,先使用断言的方式拿到类型,然后通过case进行不同的处理,后面有许多函数都是这样做的
>
> 如果类型为`[]interface{}`,将值拿出来,会再装入另外一个`[]interface{}`类型,然后返回
>
> 如果类型为`[]map[string]interface{}`,和上面的操作一样



## 总结

> 这个包里面,一些转Slice或者map类型的函数的做法都是这样,通过断言拿到类型,再对对应的类型做相应的处理,对于,一些ToString或者一些基本类型,有时候传入的是指针,会对指针进行取值,再进行相应的转换,这个包的源码不是很难,可以自己看源码来看看是如何做的