# viper



[TOC]

## 介绍

> 一款`golang`的配置文件解析库,可以解析一下格式文件
>
> ```go
> "json", "toml", "yaml", "yml", "properties", "props", "prop", "hcl", "tfvars", "dotenv", "env", "ini"
> ```
>
> 还可以从环境变量，etcd，等中提取配置，实时监控配置文件的变化





## 使用

### 初始化viper类型

> viper是一个优先级的配置注册表,它的优先级如下:
>
> 
> 1. overrides
> 2. flags
> 3. env. variables
> 4. config file
> 5. key/value store
> 6. defaults
> 

```go
cf = viper.New()  //需要修改viper中的值,这里的cf的类型为 *viper
```

### 添加配置文件相关内容

```go
cf.SetConfigName("test")   //设置配置文件名称
cf.SetConfigType("yaml")   //设置配置文件类型
cf.AddConfigPath("./")   //设置配置文件文件,可以设置多个,直到搜索到一个可用
cf.SetConfigFile("test.yaml") //直接设置配置配置文件路径,viper直接从其中解析出路径,文件名,文件类型
```

### 获取值



> Get相关的函数,会根据key来进行获取配置文件
>
> ```yaml
> all:
>   a: 1
>   b: 2
>   c: 3
> ```
>
> 这个配置文件,使用`GetString("all.a")`去获取内容会获取到`1`,这个`.`是一个定界符,可以在一个`viper`初始化的时候进行设置
>
> ```go
> v := viper.NewWithOptions(viper.KeyDelimiter("::")) //将界定符修改为"::"
> ```
>
> 当要获取一个数组的一个值,可以这样使用
>
> ```yaml
> all:
>   - a
>   - b
>   - c
>   - d
>   - e
> ```
>
> 这样的配置,可以使用`GetString("all.0")`获取到`a`
>
> 

```go
Get(key string) : interface{}
GetBool(key string) : bool
GetFloat64(key string) : float64
GetInt(key string) : int
GetIntSlice(key string) : []int
GetString(key string) : string
GetStringMap(key string) : map[string]interface{}
GetStringMapString(key string) : map[string]string 
GetStringSlice(key string) : []string
GetTime(key string) : time.Time
GetDuration(key string) : time.Duration
```



### 设置默认值

```go
cf.Set()    //设置配置文件的某个键值对
cf.SetDefault()  //设置键值对的默认值
```



### 将现有的配置文件写入磁盘

> 当在使用`Set`更改过配置后,有时候需要将配置文件写入到磁盘,需要使用到
>
> ```go
> viper.WriteConfig() //写入配置文件到读取数据的配置文件,会直接覆盖原来的配置文件
> viper.SafeWriteConfig()  //当配置文件存在时,会报错,不会直接覆盖,而会报错
> viper.WriteConfigAs("/path/to/my/.config")  //将存为另外一个文件,直接覆盖 
> viper.SafeWriteConfigAs("/path/to/my/.config") 
> ```

