# Channel

[TOC]

- `channel`被关闭时,也可以读出值,为`chaneel`类型的0值
- `channel`有带缓冲区和不带缓冲区（相当于缓冲区容量为0）两种类型。当缓冲区已满时会阻塞发送者，当缓冲区已空时会阻塞接受者。
- `channel`是线程安全的。

## channel定义方法

```go
ch := make(chan <type>,<buffer_size>)
```

> `buffer_size`可以为0,为0时为无缓冲channel,在使用无缓冲channel时,在写数据时必须保证,通道的另外一端正在读取数据,不然会造成死锁情况

```go
package main
func main() {
	ch := make(chan int)
	ch <- 1
}
```

> fatal error: all goroutines are asleep - deadlock!

```go
package main
func main() {
	ch := make(chan int)
	go func() {
		<-ch 
	}()
	ch <- 1
}
```



## channel使用

### for

> 使用`range`循环`channel`会一直循环下去,直到`channel`关闭,如果`chaneel`没有关闭,会造成死锁问题

```go
package main

import (
	"fmt"
	"time"
)

func main() {
	ch := make(chan int, 10)
	for i := 1; i <= 10; i++ {
		ch <- i
		time.Sleep(500 * time.Millisecond)
	}
	close(ch)
	for i := range ch {
		fmt.Println(i)
	}
}

```



### select

> 使用`select`可对多个`chaneel`进行读取,但是同一时间只能有一个`chaneel`被读取,如果没有任何一个`channel`可以被读取,那么`select`将会被阻塞,如果有`default`分支将直接执行`default`分支的内容,`select`无法循环,只能通过外部添加循环来达到目的
>
> 1. 如果所有等待的`channel`都被关闭,那么`select`也将退出阻塞

```go
package main

import (
	"fmt"
	"time"
)

func main() {
	c := make(chan int)
	c2 := make(chan int)
	go func() {
		time.Sleep(2 * time.Second)
		c <- 1
	}()
	go func() {
		time.Sleep(1 * time.Second)
		c2 <- 2
	}()

	select {
	case i := <-c:
		fmt.Printf("receive from c: %d\n", i)
	case i := <- c2:
		fmt.Printf("receive from c2: %d\n", i)
	default:
		fmt.Println("default")
	}
}
```

输出:

> default



