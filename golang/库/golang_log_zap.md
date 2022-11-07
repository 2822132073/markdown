# zap

[TOC]



## 简单使用zap

```go
package main

import (
	"go.uber.org/zap"
)

var (
	ProductionLogger *zap.Logger
	DevelLogger *zap.Logger
)
func init() {
    //NewProduction会输出json格式的日志,适合向各种收集平台进行发送并进行解析
	ProductionLogger, _ = zap.NewProduction()  
    //NewDevelopment会输出人类可读的日志,对人比较友好,适合于开发
	DevelLogger, _ = zap.NewDevelopment()
}

func main() {
	ProductionLogger.Info("aaaaa")
	DevelLogger.Info("aaaaa")
}
```

输出:

```
{"level":"info","ts":1635838117.4135783,"caller":"experiment/main.go:17","msg":"aaaaa"}
2021-11-02T15:28:37.413+0800	INFO	experiment/main.go:18	aaaaa
```





## Sugard

> 可以从一个Logger实例生成一个Sugard,Sugard是Logger的语法糖,可以做很多便捷操作

```go
// 生成Sugard
ProductionLogger, _ := zap.NewProduction()
Sugar:= ProductionLogger.Sugar()
```



```go
DeveSugar.Infow("test","time","12:03")  //第一个为msg,后面的项的个数必须为双数,前面的key,后面为value
DeveSugar.Info("test")  //直接打印
DeveSugar.Infof("test %s\n","test") //可以格式化日志输出的内容
//还有很多这种函数比如
Warnw()
Warnf()
Warn()
.......
```

输出:

```
2021-11-02T16:54:54.962+0800	INFO	experiment/main.go:22	test	{"time": "12:03"}
2021-11-02T16:54:54.987+0800	INFO	experiment/main.go:23	test
2021-11-02T16:54:54.987+0800	INFO	experiment/main.go:24	test test
```





## 定制化

> Config和logger的关系:
>
> > logger由Config 建立,config中有许多config的配置项,config调用Build方法,生成一个logger,
>
> 
>
> 有时候需要定制化一些日志的选项,我们需要用到 zap.Config类型,在日常使用中,我们可以通过`zap.NewDevelopmentConfig()`和`zap.NewProductionConfig()`,来生成一个config的模板
>
> `zap.NewProductionConfig()`: 生成一个和`zap.NewProduction()`配置相同的config
>
> 我们可以在这个config的基础上面进行修改,config一共包含这些项

```go
Level: zap.NewAtomicLevelAt(zap.DebugLevel) //日志显示的级别
Development: true,  //是否开启开发模式
DisableCaller: false,  //是否禁用打印调用者
DisableStacktrace: true, //是否禁用堆栈信息显示
Sampling: nil, 
Encoding: "json",  //解码格式,console和json , console是普通的格式
EncoderConfig: zapcore.EncoderConfig{},  //解析的相关配置
OutputPaths: []string{"stderr"}, //输出到的文件,可以写多个文件,也可以写stdout和stderr
ErrorOutputPaths: []string{"stderr"}, //错误输出输出到的文件,可以写多个文件,也可以写stdout和stderr
InitialFields: map[string]interface{}{}, 
```



## 定制日志的时间格式

> 在`zap.config`的`EncoderConfig`字段定义了logger的解析格式,这个`EncoderConfig`是一个`zapcore.EncoderConfig`类型,这个类型里面有一个`EncodeTime`字段,它是一个接口类型,他的定义是
>
> ```go
> type TimeEncoder func(time.Time, PrimitiveArrayEncoder)
> ```
>
> 在zapcore包中有一个`encodeTimeLayout`函数,我们想要实现自己的时间样式可以借用这个函数
>
> 在zapcore包中有着这样一个函数
>
> ```go
> func ISO8601TimeEncoder(t time.Time, enc PrimitiveArrayEncoder) {
> 	encodeTimeLayout(t, "2006-01-02T15:04:05.000Z0700", enc)
> }
> ```
>
> 他输出的格式是这样的:
>
> ```
> 2021-11-02T16:54:54.962+0800
> ```
>
> 我们想要更换时间格式的话,我们可以在`zapcore`库下`encoder.go`进行添加一下函数
>
> ```go
> func MyTime(t time.Time, enc PrimitiveArrayEncoder) {
> 	encodeTimeLayout(t, "2006-01-02 15:04", enc)
> }
> ```
>
> 然后,我们自己的函数中添加,创建一个`zap.Config`类型,再通过修改`zap.config`类型中的`EncoderConfig`,这个属性是`zap.core`的一个类型,它定义了如何进行解析内容,其中就包含了时间的格式`TimeEncoder`,他的定义是这样的:
>
> ```go
> type TimeEncoder func(time.Time, PrimitiveArrayEncoder)
> ```
>
> 所以我们在其中添加我们自己的函数,定义自己想要的时间格式,可以通过修改这个属性完成
>
> 最后,在`zapcore.encoder.go`添加自己函数后,就可以在这里进行使用
>
> ```go
> func init() {
> 	cf := zap.NewDevelopmentConfig()
> 	for _, f := range Files {
> 		cf.OutputPaths = append(cf.OutputPaths, f)
> 	}
> 	cf.EncoderConfig.EncodeTime = zapcore.MyTime
> 	for _, f := range ErrFiles {
> 		cf.ErrorOutputPaths = append(cf.ErrorOutputPaths, f)
> 	}
> 	Logger,err := cf.Build()
> 	if err != nil {
> 		log.Fatal("logger Error: ",err)
> 	}
> 	Sugar = Logger.Sugar()
> }
> ```
>
> 





## 常用的案例

```go
//在Files中填写需要将日志写入的文件
//ErrFiles中填写错误日志写入的位置
//如果不需要可以不填
var (
	Logger   *zap.Logger
	Sugar    *zap.SugaredLogger
	Files    = []string{}
	ErrFiles = []string{}
)

func init() {
	cf := zap.NewDevelopmentConfig()
	for _, f := range Files {
		cf.OutputPaths = append(cf.OutputPaths, f)
	}
	for _, f := range ErrFiles {
		cf.ErrorOutputPaths = append(cf.ErrorOutputPaths, f)
	}
    Logger,err := cf.Build()
	if err != nil {
		log.Fatal("logger Error: ",err)
	}
	Sugar = Logger.Sugar()
}
```

