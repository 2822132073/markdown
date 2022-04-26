# Linux解压rar包

[TOC]





## [官网](https://www.rarlab.com/download.htm)



## 下载源码包

```shell
wget https://www.rarlab.com/rar/rarlinux-x64-6.1.b1.tar.gz --no-check-certificate
```

## 编译安装

```
cd rar
make && make install 
```

## 常用用法

```
1、rar a file file.ext
如果file.rar不存在将创建file.rar文件；如果file.rar压缩包中已有file.ext，将更新压缩包中的file.ext；还可用 d:\*.ext代替file.ext将d盘下所有ext文件（不包括自文件夹）添加到压缩包中。

2、rar a -r -v2000 -s -sfx -rr file
从当前文件夹和子文件夹压缩全部文件成为 2000000 字节大小、固实的、分卷自解压文件 file.part1.exe，file.part2.rar，file.part3.rar 等，并在每一个分卷中添加恢复记录；将命令a换成命令m可将文件压缩后删除

3、rar x Fonts *.ttf
会从压缩文件解压 *.ttf 字体文件到当前文件夹，但下面命令:
rar x Fonts *.ttf NewFonts\
会从压缩文件解压 *.ttf 字体文件到文件夹 NewFont

4、rar a -pZaBaToAd -r secret games\*.*
使用密码 ZaBaToAd 来将文件夹“games”的内容添加到压缩文件“secret”

5、rar a -r a.rar a/
递归的将a/下所有东西压缩到a.rar

 

rar常用命令主要有
a 添加文件到操作文档
例:rar a test.rar file1.txt 若test.rar文件不存在，则打包file1.txt文件成test.rar
例:rar a test.rar file2.txt 若test.rar文件已经存在，则添加file2.txt文件到test.rar中
(这样test.rar中就有两个文件了）
注，如果操作文档中已有某文件的一份拷贝，则a命令更新该文件，对目录也可以进行操作
例:rar a test.rar dir1

c 对操作文档添加说明注释
rar c test.rar
（会出现Reading comment from stdin字样，然后输入一行或多行注释，以ctrl+d结束）
cf 添加文件注释，类似上面的c，不过这个是对压缩文档中每个文件进行注释

cw 将文档注释写入文件
例:rar cw test.rar comment.txt

d 从文档中删除文件
例:rar d test.rar file1.txt

e 将文件解压到当前目录
例:rar e test.rar
注:用e解压的话，不仅原来的file1.txt和file2.txt被解压到当前目录，就连dir1里面的所有文件
也被解压到当前目录下，不能保持压缩前的目录结构，如果想保持压缩前的目录结构，用x解压

k 锁定文档
例:rar k test.rar 锁定文档后，该文档就无法进行任何更新操作了

r 修复文档
例:rar r test.rar
当rar文件有问题时，可以尝试用该命令进行修复（鬼知道有多少用）

s 转换文档成自解压文档
例:rar s test.rar
会生成一个test.sfx的可执行文档，运行它的效果就相当于rar x test.rar，
适合于向没有rar的用户传输文件

t 检测文档
例:rar t test.rar
检测test.rar的完整性，一般压缩完大型文件准备传输前最好用这个命令来确保文件的正确性

x 带路径解压文档中内容到当前目录
例:rar x test.rar
这样解压的话，dir1就会保持原来的目录结构

```

