[博客](https://blog.csdn.net/Sihang_Xie/article/details/124851399)

[replace使用场景](https://segmentfault.com/a/1190000040179648)

# 使用要求

> 使用go mod必须要要求go的版本在`1.14`以上
>
> ```shell
> go version //检查golang版本
> ```

# 设置

```shell
go env -w GO111MODULE=on
go env -w GOPROXY=https://goproxy.cn,direct
```

> `go`需要设置proxy去下载包,不然难下载

> `go env -w`会将配置写到`$GOENV`指向的路径
>
> 例如,我的电脑上,`GOENV`环境变量指向`C:\Users\86134\AppData\Roaming\go\env`
>
> ```sh
> PS D:\awesomeProject\TestProject\gin> go env GOENV
> C:\Users\86134\AppData\Roaming\go\env
> ```
>
> 所以上面的配置将会在文件中呈现为下面这样
>
> ```
> GO111MODULE=on
> GOPROXY=https://goproxy.cn,direct
> ```

# 使用

| 命令     | 说明                                                         |
| -------- | ------------------------------------------------------------ |
| download | download modules to local cache(下载依赖包)                  |
| edit     | edit go.mod from tools or scripts（编辑go.mod)               |
| graph    | print module requirement graph (打印模块依赖图)              |
| verify   | initialize new module in current directory（在当前目录初始化mod） |
| tidy     | add missing and remove unused modules(拉取缺少的模块，移除不用的模块) |
| vendor   | make vendored copy of dependencies(将依赖复制到vendor下)     |
| verify   | verify dependencies have expected content (验证依赖是否正确） |
| why      | explain why packages or modules are needed(解释为什么需要依赖) |
| init     | initialize new module in current directory(在当前目录初始化新的module) |

> 常用的命令有`init`,`tidy`, `edit`





# go.mod

在执行`go init [模块名]`之后,目录下会生成一个go.mod文件,里面记录着该模块的依赖关系

go.mod 提供了module, require、replace和exclude 四个命令

- `module` 语句指定包的名字（路径）
- `require` 语句指定的依赖项模块
- `replace` 语句可以替换依赖项模块
- `exclude` 语句可以忽略依赖项模块





# 问题

## 将模块导入后,go.mod所有模块都显示`indirect`

![image-20221031235753514](https://cdn.jsdelivr.net/gh/2822132073/image/202210312357532.png)

> 后面注释这`indirect`表示这些包都是间接依赖,但是我直接引用了`github.com/gin-gonic/gin`,上面还是显示的是间接引用

### 解决:

> 这个问题对包的使用没有问题,原因是,在刚开始下载这个包的时候,我们并没有使用这个包,所有就标记为了间接引用,我们使用之后,使用`go build`编译之后,`go.mod`还是没有进行改变,原因是:`go build`无法对**go.mod**进行改变,准确的来说,在**go1.14**之后,只有**go tidy**可以对**go.mod**进行修改,所有,我们需要使用`go tidy`对**go.mod**进行刷新
