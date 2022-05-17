# Goalng http包相关

> 在使用Golang的过程中,需要发起请求,现在在这里写一些示例,以便以后写程序

简单的发起请求就不写了,一般直接使用 http 包里面的 get ,Postform 就可以实现



## 需要修改Header,传入参数的情况

> 注意,如果传入的参数的格式为**json**,需要修改`req.Header.Set("Content-Type", "application/json")`,并且将传入的数据改为**json**,可以使用字符串进行传入,不过需要对字符串转换为**io.Reader**对象,再进行传入

```go
package main

import (
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"net/url"
	"strings"
)

func main() {
	urlSting := "www.baidu.com"
	//这里的client,req,resp都是指针对象,因为在执行的时候需要使用指针,也可以使用&
	client := &http.Client{}
	var req *http.Request
	var resp *http.Response
	var err error
	var body []byte
	//声明需要传入的参数这里的参数表示的是 http://xxx.xxx/search?id=1&name=fsl,是指的在?后面传入的参数,可以通过Add进行添加,前面一个参数是key,后面一个参数是value
	parameters := url.Values{}
	parameters.Add("id","1")
	parameters.Add("name","fsl")
	//在这里使用http.NewRequest创建一个request,在这里并没有执行,在这里我并没有进行错误处理,应该需要错误处理
	req, _ = http.NewRequest("POST", urlSting, strings.NewReader(parameters.Encode()))
	//在获得到request后,我们可以对这个request的header进行设置
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("User-Agent", "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0)")
	req.Header.Set("Connection", "Keep-Alive")
	//在设置完成request后,我们可以使用之前的client.Do来执行这个请求
	resp, err = client.Do(req)
	//这样我们就完成了一次请求,想要进行之后的操作,只需要对这个resp进行操作进行
	body, err = ioutil.ReadAll(resp.Body)
	if err != nil {
		fmt.Println(err)
	}
		
}

```





还有需要进行传入jar的情况,之后遇到了再写



## golang进行多协程下载大文件

```go
```



