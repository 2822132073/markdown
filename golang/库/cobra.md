# cobra的相关概念

先来简单看下cobra框架中主要概念：

```cmd
kubectl get pod|service [podName|serviceName] -n <namespace>
```

以上述**kubectl get**为例，cobra将**kubectl**称作做**rootcmd**(即根命令)，get称做**rootcmd**的**subcmd**，**pod|service**则是**get**的**subcmd**，**podName**、**serviceName**是**pod/service**的**args**，**-n/--namespace**称作**flag**。同时我们还观察到**-n**这个**flag**其实写在任意一个**cmd**之后都会正常生效，这说明这是一个**global flag**，**global flag**对于**rootcmd**及所有子命令生效。

Cobra 中有两种标志：持久标志 ( Persistent Flags ) 和 本地标志 ( Local Flags ) 。

持久标志：指所有的 commands 都可以使用该标志。比如：--verbose ，--namespace
本地标志：指特定的 commands 才可以使用该标志。

# 使用

官方给出的目录结构

```cmd
  ▾ appName/
    ▾ cmd/
        add.go
        your.go
        commands.go
        here.go
      main.go
```

> 也就是说在main中进行初始化,在cmd中编写相关代码

`main.go`

```go
package main

import "cobra/cmd"  

func main() {
	cmd.Execute()
}
```

`cmd/root.go`

```go
package cmd

import (
	"fmt"
	"github.com/spf13/cobra"
	"os"
)

var rootCmd = &cobra.Command{
	Use:   "myTools",   //命令名
	Short: "这是我的命令行工具包",                   //直接执行命令后,会出现的帮助提示
	Long:  "一个由自己编写的命令行工具包,后期加入自己需要的一些功能", //使用 -h/--help 会出现的提示
	Run: func(cmd *cobra.Command, args []string) { //执行的命令
		fmt.Println("查看帮助使用 -h 或者 --help")
		fmt.Println("rootCmd",args)
	},
}

func Execute() {
	if err := rootCmd.Execute(); err != nil {
		_, err := fmt.Fprintln(os.Stderr, err)
		if err != nil {
			return
		}
		os.Exit(1)
	}
}

```

## 子命令

我们创建在cmd下创建一个`create.go`

当前项目结构为：

```css
demo
├── cmd
│   ├── create.go
│   └── root.go
└── main.go
```

查看下 `create.go`，`init()` 说明了命令的层级关系:

```go
...
// init函数可以在所有程序执行开始前被调用，并且每个包下可以有多个init函数
func init() {
       rootCmd.AddCommand(createCmd)        
}
```

运行测试：

```csharp
# 输入正确
[root@localhost demo]# go run main.go create
create called

# 未知命令
[root@localhost demo]# go run main.go crea
Error: unknown command "crea" for "demo"

Did you mean this?
    create

Run 'demo --help' for usage.
unknown command "crea" for "demo"

Did you mean this?
    create
```

### 2.2 子命令嵌套

对于功能相对复杂的 CLI，通常会通过多级子命令，即：子命令嵌套的方式进行描述，那么该如何实现呢？

```
demo create rule
```

首先添加子命令 相关的go文件`rule.go` 

当前目录结构如下：

```css
demo
├── cmd
│   ├── create.go
│   ├── root.go
│   └── rule.go
├── LICENSE
└── main.go
```

`rule.go`

```go
package cmd

import (
	"fmt"
	"github.com/spf13/cobra"
)

var ruleCmd = &cobra.Command{
	Use:   "rule",
	Short: "rule create cmd",
	Long:  "规则创建命令",
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("rule called")
	},
}

func init() {
	createCmd.AddCommand(ruleCmd) //将ruleCmd加入到rootCmd下面
}
```

虽然调整了命令的层级关系，但是目前运行 `demo create` 会打印 `create called`，我希望运行时可以打印帮助提示。所以我们继续完善下代码，修改 `create.go`：

```go
...

var createCmd = &cobra.Command{
        Use:   "create",
        Short: "create",
        Long: "Create Command.",
        Run: func(cmd *cobra.Command, args []string) {
                // 如果 create 命令后没有参数，则提示帮助信息
                if len(args) == 0 {
                  cmd.Help()
                  return
                }
        },
}

...
```

运行测试：

- 直接运行 `create`，打印帮助提示：

```bash
[root@localhost demo]# go run main.go create
Create Command.

Usage:
  demo create [flags]
  demo create [command]

Available Commands:
  rule        A brief description of your command

Flags:
  -h, --help   help for create

Global Flags:
      --config string   config file (default is $HOME/.demo.yaml)

Use "demo create [command] --help" for more information about a command.
```

- 运行 `create rule`，输出 `rule called`：

```csharp
[root@localhost demo]# go run main.go create rule
rule called
```

### 2.3 参数

先说说参数。现在有个需求：给 CLI 加个位置参数，要求参数有且仅有一个。这个需求我们要如何实现呢？

```undefined
demo create rule foo 
```

实现前先说下，Command 结构体中有个 Args 的字段，接受类型为 `type PositionalArgs func(cmd *Command, args []string) error`

内置的验证方法如下：

- NoArgs：如果有任何参数，命令行将会报错
- ArbitraryArgs： 命令行将会接收任何参数
- OnlyValidArgs： 如果有如何参数不属于 Command 的 ValidArgs 字段，命令行将会报错
- MinimumNArgs(int)： 如果参数个数少于 N 个，命令行将会报错
- MaximumNArgs(int)： 如果参数个数多于 N 个，命令行将会报错
- ExactArgs(int)： 如果参数个数不等于 N 个，命令行将会报错
- RangeArgs(min, max)： 如果参数个数不在 min 和 max 之间, 命令行将会报错

由于需求里要求参数有且仅有一个，想想应该用哪个内置验证方法呢？相信你已经找到了 ExactArgs(int)。

改写下 `rule.go`：

```go
...

var ruleCmd = &cobra.Command{
        Use:   "rule",
        Short: "rule",
        Long: "Rule Command.",

        Args: cobra.ExactArgs(1),
        Run: func(cmd *cobra.Command, args []string) {           
          fmt.Printf("Create rule %s success.\n", args[0])
        },
}

...
```

运行测试：

- 不输入参数：

```csharp
[root@localhost demo]# go run main.go create rule
Error: accepts 1 arg(s), received 0
```

- 输入 1 个参数：

```csharp
[root@localhost demo]# go run main.go create rule foo
Create rule foo success.
```

- 输入 2 个参数：

```csharp
[root@localhost demo]# go run main.go create rule
Error: accepts 1 arg(s), received 2
```

从测试的情况看，运行的结果符合我们的预期。如果需要对参数进行复杂的验证，还可以自定义 Args，这里就不多做赘述了。

### 2.4 标志

再说说标志。现在要求 CLI 不接受参数，而是通过标志 `--name` 对 `rule` 进行描述。这个又该如何实现？

```undefined
demo create rule --name foo
```

Cobra 中有两种标志：持久标志 ( Persistent Flags ) 和 本地标志 ( Local Flags ) 。

> 持久标志：指所有的 commands 都可以使用该标志。比如：--verbose ，--namespace
>  本地标志：指特定的 commands 才可以使用该标志。

这个标志的作用是修饰和描述 `rule`的名字，所以选用本地标志。修改 `rule.go`：

```go
package cmd

import (
        "fmt"        
        "github.com/spf13/cobra"
)       

// 添加变量 name
var name string

var ruleCmd = &cobra.Command{
        Use:   "rule",
        Short: "rule",
        Long: "Rule Command.",
        Run: func(cmd *cobra.Command, args []string) {
          // 如果没有输入 name
          if len(name) == 0 {
            cmd.Help()
            return
          }     
          fmt.Printf("Create rule %s success.\n", name)
        },
}
func init() {
        createCmd.AddCommand(ruleCmd)
        // 添加本地标志
        ruleCmd.Flags().StringVarP(&name, "name", "n", "", "rule name")  
    	// 第一个参数为变量的指针
    	// 第二个为长名称
    	// 第三个为短名称
    	// 第四个为默认值
    	// 第五个为参数名称
}
```

说明：`StringVarP` 用来接收类型为字符串变量的标志。相较`StringVar`， `StringVarP` 支持标志短写。以我们的 CLI 为例：在指定标志时可以用 `--name`，也可以使用短写 `-n`。

运行测试：

```csharp
# 这几种写法都可以执行
[root@localhost demo]# go run main.go create rule -n foo
Create rule foo success.
[root@localhost demo]# go run main.go create rule --name foo
Create rule foo success.
[root@localhost demo]# go run main.go create -n foo rule
Create rule foo success.
```

### 2.5 读取配置

最后说说配置。需求：要求 `--name` 标志存在默认值，且该值是可配置的。

如果只需要标志提供默认值，我们只需要修改 `StringVarP` 的 `value` 参数就可以实现。但是这个需求关键在于标志是可配置的，所以需要借助配置文件。

很多情况下，CLI 是需要读取配置信息的，比如 kubectl 的`~/.kube/config`。在帮助提示里可以看到默认的配置文件为 `$HOME/.demo.yaml`：

```csharp
Global Flags:
      --config string   config file (default is $HOME/.demo.yaml)
```

配置库我们可以使用 Viper。Viper 是 Cobra 集成的配置文件读取库，支持 `YAML`，`JSON`， `TOML`， `HCL` 等格式的配置。

添加配置文件 `$HOME/.demo.yaml`，增加 name 字段：

```csharp
[root@localhost ~]# vim $HOME/.demo.yaml 
name: foo
```

修改 `rule.go`:

```go
package cmd

import (
        "fmt"
         // 导入 viper 包
        "github.com/spf13/viper"
        "github.com/spf13/cobra"
)

var name string

var ruleCmd = &cobra.Command{
        Use:   "rule",
        Short: "rule",
        Long: "Rule Command.",
        Run: func(cmd *cobra.Command, args []string) {
          // 不输入 --name 从配置文件中读取 name
          if len(name) == 0 {
            name = viper.GetString("name")
            // 配置文件中未读取到 name，打印帮助提示
            if len(name) == 0 {
              cmd.Help()
              return
            }
          }
          fmt.Printf("Create rule %s success.\n", name)
        },
}

func init() {
        createCmd.AddCommand(ruleCmd)
        ruleCmd.Flags().StringVarP(&name, "name", "n", "", "rule name")
}
```

运行测试：

```csharp
[root@localhost demo]# go run main.go create rule
Using config file: /root/.demo.yaml
Create rule foo success.
```

### 2.6 编译运行

编译生成命令行工具：

```csharp
[root@localhost demo]# go build -o demo
```

运行测试：

```csharp
[root@localhost demo]# ./demo create rule
Using config file: /root/.demo.yaml
Create rule foo success.
```