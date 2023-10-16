## 具体的参数

```shell
tr [options] [SET1] [SET2]
-c：使用SET1的补集  
-d：删除字符  
-s：压缩字符  
-t：截断SET1，使得SET1的长度和SET2的长度相同  
```

## SET1和SET2各种情况

下面所说的都是长度

### SET1==SET2

```shell
root@ecs-167956:~# echo "123456789abcdefg"|tr "12" "ab"
ab3456789abcdefg
```

> 当长度相等时，会将字符一一映射，按照上面来说，也就是将，1映射为a，2映射为b

### SET1>SET2

```shell
root@ecs-167956:~# echo "123456789abcdefg"|tr "123" "ab"
abb456789abcdefg
```

> 当长度大于时，会将长度相等的部分一一对应，而大于的部分，回映射成为SET2的最后一个字符，1映射为a，2映射为b，3映射为b

### SET1<SET2

```shell
root@ecs-167956:~# echo "123456789abcdefg"|tr "12" "abc"
ab3456789abcdefg
```

> 当长度小于的时候，会将SET2长度过多的部分进行忽略，也就是1映射为a，2映射为b，c进行忽略

## `-s`：压缩字符

当只指定SET1时，仅仅只是将SET1中的字符进行压缩，但是如果指定SET1和SET2，那么就会压缩并且映射

```shell
root@ecs-167956:~# echo "11223344" |tr -s "123"
12344
root@ecs-167956:~# echo "11223344" |tr -s "123" "abc"
abc44
```



## `-d`：删除字符

删除指定的字符集

```shell
root@ecs-167956:~# echo "11223344" |tr -d "123"
44
```



## `-t`：截断SET1，使得SET1的长度和SET2的长度相同  

简单来说，就是当SET1>SET2时，会把SET1阶段成和SET2相同的长度

```bash
root@ecs-167956:~# echo "123456789abcdefg"|tr "123" "ab"
abb456789abcdefg
root@ecs-167956:~# echo "123456789abcdefg"|tr -t "123" "ab"
ab3456789abcdefg
```

如上例子所示，会将SET1中的3去掉，只保留12与ab对应



## `-c`：使用SET1的补集

这里的补集就相当于，把输入字符作为全集，除去SET1中的字符外，其他的字符就相当于SET1的补集，替代原来的SET1



`tr -c SET1 SET2` 是将标准输入按照 SET1 求补集，并将补集部分的字符全部替换为 SET2，即将不在标准输入中存在但 SET1 中不存在的字符替换为 SET2 的字符。但是 SET2 如果指定的字符大于 1 个，则只取最后一个字符作为替换字符。使用 `-c` 的时候应该把 `-c SET1` 作为一个整体，不要将其分开。

```bash
root@ecs-167956:~#  echo "abcdefo"| tr -c "ao" "y"
ayyyyyoyroot@ecs-167956:~# 
```

标准输入 `abcdefo` 按照 `SET1="ao"` 求得的补集为 `bcdef`，将它们替换为 y，结果即为 `ayyyyyo`，但是结果的最后面多了一个 y 并且紧接着命令提示符。这是因为 `abcdefo` 尾部的 `\n` 也是 ao 的补集的一部分，并将其替换为 y 了。如果不想替换最后的 `\n`，可以在 SET1 中指定 `\n`。

```BASH
[root@xuexi tmp]# echo "abcdefo"| tr -c "ao\n" "y" 
ayyyyyo
```

如果 SET2 指定多个字符，将只取最后一个字符作为替换字符。

```BASH
[root@xuexi tmp]# echo "abcdefo"| tr -c "ao\n" "ay"
ayyyyyo
[root@xuexi tmp]# echo "abcdefo"| tr -c "ao\n" "yb"
abbbbbo
```

`-c` 常和 `-d` 一起使用，如 `tr -d -c SET1`。它先执行 `-c SET1` 求出 SET1 的补集，再对这个补集执行删除。也就是说，最终的结果是完全匹配 SET1 中的字符。注意，`-d` 一定是放在 `-c` 前面的，否则被解析为 `tr -c SET1 SET2`，执行的就不是删除补集，而是替换补集为 `-d` 的最后一个字符 d 了。

```BASH
# 对数字和分行符求补集，并删除这些补集符号
[root@xuexi tmp]# echo "one 1 two 2 three 3"| tr -d -c "[0-9]\n"
123
# 再加一个空格求补集
[root@xuexi tmp]# echo "one 1 two 2 three 3"| tr -d -c "[0-9] \n"
 1  2  3
 # -d选项放在-c选项的后面是替换行为
[root@xuexi tmp]# echo "one 1 two 2 three 3"| tr -c "[0-9]\n" -d
dddd1ddddd2ddddddd3
# 保留字母
[root@xuexi tmp]# echo "one 1 two 2 three 3"| tr -d -c "[a-zA-z]\n"
onetwothree
# 保留字母的同时保留空格
[root@xuexi tmp]# echo "one 1 two 2 three 3"| tr -d -c "[a-zA-z] \n"
one  two  three
```

从上面补集的实验中可以看到，其实指定的 `[0-9]` 和 `[a-z]` 是一个字符类，最终的结果显示的是这个类中的对象。

在 tr 中可以使用以下几种字符类。这些类也可以用在其他某些命令中。

```PLAINTEXT
[:alnum:]所有的数字和字母。  
[:alpha:]所有的字母。  
[:blank:]所有水平空白=空格+tab。  
[:cntrl:]所有控制字符（非打印字符），在ascii表中的八进制0-37对应的字符和177的del。  
[:digit:]所有数字。  
[:graph:]所有打印字符，不包含空格=数字+字母+标点。  
[:lower:]所有小写字母。  
[:print:]所有打印字符，包含空格=数字+字母+标点+空格。  
[:punct:]所有标点符号。  
[:space:]所有水平或垂直空白=空格+tab+分行符+垂直tab+分页符+回车键。  
[:upper:]所有大写字母。  
[:xdigit:]所有十六进制数字
```

使用方法例如下面的。例如 `[:upper:]` 等价于 `[A-Z]`，`[:digit:]` 等价于 `[0-9]`。

```BASH
[root@xuexi tmp]# echo "one ONE 1 two TWO 2 three THREE 3" | tr -d -c "[:upper:] \n"
 ONE   TWO   THREE 
[root@xuexi tmp]# echo "one ONE 1 two TWO 2 three THREE 3" | tr -d -c "[:alpha:] \n"
one ONE  two TWO  three THREE 
[root@xuexi tmp]# echo "one ONE 1 two TWO 2 three THREE 3" | tr -d -c "[:digit:] \n"
  1   2   3
```