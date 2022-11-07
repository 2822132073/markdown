# Chromedp

[TOC]



## [官方文档](https://pkg.go.dev/github.com/chromedp/chromedp)

## [调用Linux下的Headless](https://mojotv.cn/2018/12/26/chromedp-tutorial-for-golang)

>  chromedp 使用程序化的语言去操作浏览器

## 创建浏览器对象

### `NewContext(parent context.Context, opts ...ContextOption) (context.Context, context.CancelFunc)`

>
> 可以创建一个`context`,可以理解为一个浏览器,这样生成的`context`,无法进行一些浏览器的设置,比如,chromedp是默认是headless模式的,也就是没有页面的,在使用`chromedp.NewContext`就无法设置

### `func NewExecAllocator(parent context.Context, opts ...ExecAllocatorOption) (context.Context, context.CancelFunc)`

> 注意,这些可以设置的Flag都是chrome的启动项设置参数,具体有很多[chrome启动参数](https://blog.csdn.net/qq_38776582/article/details/122426219),可以根据自己需要去设置
>
> 在这个函数中,可以对一些浏览器的启动参数选项进行设置,实际上chromedp调用的是`Chrome DevTools Protocol`的一些接口,从而对浏览器实现操作,例如:
>
> ```
> ctx, cancel := chromedp.NewExecAllocator(context.Background(), chromedp.Flag("headless", false))
> c1, _ := chromedp.NewContext(ctx)
> ```
>
> 这样就会创建一个会显示页面的context,**注意**:`NewExecAllocator`生成的Context是无法单独使用的,需要配合`NewContext`函数

### [chrome可设置的选项](https://developers.google.com/web/updates/2017/04/headless-chrome?hl=en)

#### 同时进行开启三个窗口

```go
chromedp.Navigate("http://www.baidu.com") //中间的链接需要以http/https开头
```



```
root, cancel := chromedp.NewExecAllocator(context.Background(), chromedp.Flag("headless", false))
defer cancel()
c1, _ := chromedp.NewContext(root)
c2, _ := chromedp.NewContext(root)
c3, _ := chromedp.NewContext(root)
_ = chromedp.Run(c1,chromedp.Navigate("http://www.baidu.com"))
_ = chromedp.Run(c2,chromedp.Navigate("http://www.baidu.com"))
_ = chromedp.Run(c3,chromedp.Navigate("http://www.baidu.com"))
```

> 在NewExecAllocator生成一个context后,再使用NewContext生成子Context,这三个Context都从属于父Context,是三个浏览器对象,会生成三个浏览窗口

#### 在一个窗口里面开启多个tab

```
root, cancel := chromedp.NewExecAllocator(context.Background(), chromedp.Flag("headless", false))
defer cancel()
c, _ := chromedp.NewContext(root)
_ = chromedp.Run(c,chromedp.Navigate("http://www.baidu.com"))
t1, _ := chromedp.NewContext(c)
t2, _ := chromedp.NewContext(c)
t3, _ := chromedp.NewContext(c)
_ = chromedp.Run(t1,chromedp.Navigate("http://www.baidu.com"))
_ = chromedp.Run(t2,chromedp.Navigate("http://www.baidu.com"))
_ = chromedp.Run(t3,chromedp.Navigate("http://www.baidu.com"))
```

> 当使用NewContext,生成新的Context,父Context是一个没有进行任何操作的Context(就是说没有进行Run操作),它生成的Context的会是一个浏览器,而如果父Context是一个进行过操作的Context,新生成的Context会是一个tab对象,按照上例来说,如果没有`chromedp.Run(c,chromedp.Navigate("http://www.baidu.com")`,下面所有的Context将会是浏览器,而有这一行,他将会是一个tab



## 对浏览器的一些操作





### 获取html元素

### func OuterHTML(sel interface{}, html *string, opts ...QueryOption) QueryAction

### func InnerHTML(sel interface{}, html *string, opts ...QueryOption) QueryAction

> 两者的区别在于,OuterHTNL,会将搜索的元素包含进去，而InnerHTML不会



> 第一个参数是选择器的写法,建议使用`jquery`写法
>
> 第二个参数是将选中的表达式选中的html元素写入哪个字符串变量
>
> 第三个参数是使用的那种表示匹配,一共有这几种:
>
> - func ByID(s *Selector) **直接使用ID来选择元素**
> - func ByJSPath(s *Selector)
> - func ByNodeID(s *Selector) **这个需要其它的一个包来实现**
> - func ByQuery(s *Selector)   **建议使用这种,使用的是DOM.querySelector(),详细与可以在other目录下找**
> - func ByQueryAll(s *Selector) **通过调用 DOM.querySelectorAll,和上面相同**
> - func BySearch(s *Selector) 
>
> 将HTML文本选择出来后，再将其使用`goquery`进行解析



### 设置元素的值

#### func SetValue(sel interface{}, value string, opts ...QueryOption) QueryAction

> 第一个参数是选择器,建议使用`jquery`写法
>
> 第二个参数是什么内容写入这个元素
>
> 第三个参数是与上面相同
>
> 这个可以对 `form`,` input`,` textarea`,` select`生效



#### func SendKeys(sel interface{}, v string, opts ...QueryOption) QueryAction

> 这个函数,是模拟的按键按下与抬起的过程





### 获取网页可以看见的内容

#### func Text(sel interface{}, text *string, opts ...QueryOption) QueryAction

> 获取网页可以看到的内容,也就是说的是可以看见的文件内容
>
> 第一个参数是选择器,建议使用`jquery`写法
>
> 第二个参数是将拿到的内容放在哪个变量中
>
> 第三个参数是与上面相同



#### func TextContent(sel interface{}, text *string, opts ...QueryOption) QueryAction

> 这个不太懂,没试出效果

### 点击元素

#### func Click(sel interface{}, opts ...QueryOption) QueryAction



#### func DoubleClick(sel interface{}, opts ...QueryOption) QueryAction



### 截图

#### func Screenshot(sel interface{}, picbuf *[]byte, opts ...QueryOption) QueryAction





### 等待元素操作

#### func WaitNotPresent(sel interface{}, opts ...QueryOption) QueryAction

#### func WaitNotVisible(sel interface{}, opts ...QueryOption) QueryAction





### 在chromedp.Run中进行输出日志

#### type ActionFunc func(context.Context) error

