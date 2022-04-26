# time format



> 在`golang`中格式化字符串和其他语言有点不相同,其他语言使用 yyyy 这种字符来表示年份,在golang中却没有使用这种格式,它使用一串固定的时间来格式化字符,也就是说用一串固定的字符串来代替原来的字母,下面就是相关的对照表





## golang对于时间的定义

- 上午还是下午 PM,pm,AM,am
- 月份 1,01,Jan,January
- 日　 2,02,_2
- 时　 3,03,15
- 分　 4,04
- 秒　 5,05
- 年　 06,2006
- 时区 -07,-0700,Z0700,Z07:00,-07:00,MST
- 周几 Mon,Monday
- 3 用12小时制表示，去掉前导0
- 03 用12小时制表示，保留前导0
- 15 用24小时制表示，保留前导0
- 03pm 用24小时制am/pm表示上下午表示，保留前导0
- 3pm 用24小时制am/pm表示上下午表示，去掉前导0
- 1 数字表示月份，去掉前导0
- 01 数字表示月份，保留前导0
- Jan 缩写单词表示月份
- January 全单词表示月份

```go
package main

import (
	"fmt"
	"time"
)

func main() {
	fmt.Println(time.Now().Format("3:04:05.000 PM Mon Jan"))
	fmt.Println(time.Now().Format("2006-01-02 15:04:05.000 PM Mon Jan"))
	fmt.Println(time.Now().Format("2006-01-02 15:04:05"))
}
```

输出

> 4:11:57.858 PM Mon Oct
> 2021-10-25 16:11:57.885 PM Mon Oct
> 2021-10-25 16:11:57