# Golang格式化字符串

> 在python中我我们可以使用`f`来格式化字符串,在golang中无法使用这种便捷的方式,而我们可以使用`fmt.Sprintf`来进行格式化字符串

```go
package main

import (
	"fmt"
)
func main() {
	user := "13477812045"
	password := "fsl2000."
	data := fmt.Sprintf("{\"mobile\":%s,\"password\":\"%s\"}",user,password)
}
```

