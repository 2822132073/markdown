# Regexp

## 分组的使用

```go
func main() {

	st := "<p>【翻译】马克拉小提琴，然而他的哥哥更喜欢打棒球。</p><p>［考点］冠词的用法</p><p>【精析】B乐器前面应用定冠词the， play the violin意为“拉小提琴”；表示球类、棋类等体育运动和娱乐活动的名词之前，不加冠词，play baseball意为“打棒球”。故选B。</p>"
	r := regexp.MustCompile("［考点］(?P<type>.*)【精析】(.*)")
	i := r.FindAllStringSubmatch(st,-1)
	groupNames := r.SubexpNames()
 	fmt.Println(groupNames)
	fmt.Println(i)
}

```

![image-20211230174329751](D:\markdown\golang\Untitled.assets\image-20211230174329751.png)

> 我们可以根据`SubexpNames()`得出得数组得出，在`FindAllStringSubmatch()`返回得结果集中对应位置的命名组的名称,如果没有使用`(?<name>expr)`语法,那么在`SubexpNames()`中也不会有这个命名组,就上图来说`groupNames[1]`对应的就是`i[0][1]`的内容

