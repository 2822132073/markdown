![image-20220516203713445](D:\markdown\golang\golang导入自己写的包.assets\image-20220516203713445.png)



![image-20220516203753726](D:\markdown\golang\golang导入自己写的包.assets\image-20220516203753726.png)

我们在GoMOD模式下,有一个main.go,想要调用 down包里面的 downloader中的函数,我们只需要这样

```go
package main

import (
	"Test/down"
	"fmt"
)

func main() {
	d, err := down.NewDownload("http://mirrors.163.com/deepin/dists/apricot/main/binary-i386/Packages")
	if err != nil {
		fmt.Println(err)
	}
	d.StartDownloadByThreadNumber()
}
```

而在Downloader.go文件中他的packge应该为它目录的地址

![image-20220516204051164](D:\markdown\golang\golang导入自己写的包.assets\image-20220516204051164.png)