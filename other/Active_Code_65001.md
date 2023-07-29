问题：在使用修改注册表的方式将CMD的编码设置为utf-8（65001）后，每次使用CMD都会打印Active code page: 65001，导致在调试安卓设备日志的前需将该行去除，很麻烦，一不小心忘了就需要debug，最后找到是这个原因真是哭了，于是想从源头直接去掉。

解决方法：我是使用修改注册表的方式修改编码的，修改前如下：

```
计算机\HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Command Processor 
autorun
```



![image-20230711220846981](https://cdn.jsdelivr.net/gh/2822132073/image/202307112208984.png)

将chcp 65001 改成chcp 65001>nul，点击确定，重新打开CMD后不再显示了。

> chcp 65001 >nul

![image-20230711220949699](https://cdn.jsdelivr.net/gh/2822132073/image/202307112209507.png)

————————————————
版权声明：本文为CSDN博主「路西_」的原创文章，遵循CC 4.0 BY-SA版权协议，转载请附上原文出处链接及本声明。
原文链接：https://blog.csdn.net/qq_37925231/article/details/110824760