Jetbrains系列软件一共分为两个目录，我们需要修改的也是这两个，一个是Conf，一个是system

conf

```
C:\Users\xxx\AppData\Roaming\JetBrains
例如：C:\Users\86134\AppData\Roaming\JetBrains\IntelliJIdea2022.2
```

system

```
C:\Users\xxx\AppData\Roaming\JetBrains
例如：C:\Users\86134\AppData\Local\JetBrains\IntelliJIdea2022.2
```



把这两个目录复制到你想要迁移的地方，先不要删除，所有操作做完之后再删除，我是将他们复制到对应D盘相对的路径，也就是D:\Users\86134\AppData\Local\JetBrains\IntelliJIdea2022.2，这个过程就不写了



修改对应软件的**idea.properties**，一般存储在软件的安装目录下，需要注意的是，修改这个文件需要管理员打开才可以，可以先在开始菜单里面用管理员打开记事本，再使用这个程序打开那个文件。

![image-20230718115536976](https://cdn.jsdelivr.net/gh/2822132073/image/202307181155352.png)

![image-20230718115621747](https://cdn.jsdelivr.net/gh/2822132073/image/202307181156909.png)

这样就可以修改了

添加如下信息到最后：

```pro
#修改你存放config的位置
# idea.config.path=${user.home}/.IntelliJIdea/config 
idea.config.path=D:\Users\86134\AppData\Roaming\JetBrains\IntelliJIdea2022.2
#修改你存放system的位置
# idea.system.path=${user.home}/.IntelliJIdea/system
idea.system.path=D:\Users\86134\AppData\Local\JetBrains\IntelliJIdea2022.2
```

重新启动idea就可以了