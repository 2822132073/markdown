总共三个部分,第一个部分Copy函数,以及它的弊端,第二部分DeepCopy,第三部分IgnoreEmpty,第四部分Converters

copier没有什么复杂的操作,可以做文章只有Option这个来说,所以后面几乎都是围绕这个来说的

```shell
go get github.com/jinzhu/copier
```

## 参考

[Golang Copier 从入门到入坑](https://learnku.com/articles/73338)

## Copy

- 调用同名方法为字段赋值；
- 以源对象字段为参数调用目标对象的方法，从而为目标对象赋值（当然也可以做其它的任何事情）；
- 将切片赋值给切片（可以是不同类型哦）；
- 将结构体追加到切片中。

以上部分是抄这里[知乎文章](https://zhuanlan.zhihu.com/p/113301827),详细功能也在里面

```go
type SC struct {
	C uint8
}

type Map1 struct {
	M map[string]int32
	A []int32
	C *SC
}

func main() {
	var src = Map1{map[string]int32{"C:": 3, "d": 4}, []int32{9, 8}, &SC{32}}
	var dst1 = Map1{}
	fmt.Printf("src %+v\ndst %+v\n", src, dst1)
	copier.Copy(&dst1, src)
	dst1.M["F"] = 5
	dst1.M["g"] = 6
	dst1.M["C"] = 999
	dst1.A[0] = 7
	dst1.C.C = 27
	fmt.Printf("src %+v\ndst %+v\n", src, dst1)
}
//src {M:map[C::3 d:4] A:[9 8] C:0xc0000180e0}
//dst {M:map[] A:[] C:<nil>}
//src {M:map[C:999 C::3 F:5 d:4 g:6] A:[7 8] C:0xc0000180e0}
//dst {M:map[C:999 C::3 F:5 d:4 g:6] A:[7 8] C:0xc0000181d8}
// 这里可以看出,对于引用型变量,使用Copy会直接将变量的地址进行Copy,而不是将实际的值,所以需要DeepCopy

```



## DeepCopy

需要注意的是,操作的结构体的**成员变量首字母必须大写**,不然由于copier无法访问这些结构体变量,从而无法深拷贝成功

```go
type SC struct {
	C uint8
}

type Map1 struct {
	M map[string]int32
	A []int32
	C *SC
}

func main() {
	var src = Map1{map[string]int32{"C:": 3, "d": 4}, []int32{9, 8}, &SC{32}}
	var dst1 = Map1{}
	fmt.Printf("src %+v\ndst %+v\n", src, dst1)
	copier.CopyWithOption(&dst1, src, copier.Option{DeepCopy: true})
	//copier.Copy(&dst1, src)
	dst1.M["F"] = 5
	dst1.M["g"] = 6
	dst1.M["C"] = 999
	dst1.A[0] = 7
	dst1.C.C = 27
	fmt.Printf("src %+v\ndst %+v\n", src, dst1)
}

//src {M:map[C::3 d:4] A:[9 8] C:0xc0000180e0}
//dst {M:map[] A:[] C:<nil>}
//src {M:map[C::3 d:4] A:[9 8] C:0xc0000180e0}
//dst {M:map[C:999 C::3 F:5 d:4 g:6] A:[7 8] C:0xc000018210}
// 使用DeepCopy会将其中的值进行拷贝,而不是复制地址
```

## IgnoreEmpty

就是将src复制给dst,如果src的某个成员变量为空,那么就不将其复制过去,保持dst原来的值

```go
type ArrTC struct {
	Name [2]string
	C    *ArrTC
}

type ArrT struct {
	A  [3]int32
	S  []int32
	E  []int32
	C  string
	V  string
	M  map[string]int32
	AC ArrTC
	s  bool
}

func main() {
	var src = ArrT{
		[3]int32{9, 10, 0},
		[]int32{12, 0},
		[]int32{},
		"",
		"val",
		map[string]int32{"A:": 1, "b": 0},
		ArrTC{},
		true,
	}
	var dst = ArrT{
		[3]int32{1, 2, 3},
		[]int32{4, 5, 6, 7},
		[]int32{9, 10},
		"char",
		"ha",
		map[string]int32{"C:": 3, "b": 4, ".": 0},
		ArrTC{[2]string{"Y", "Z"}, nil},
		false,
	}
	fmt.Printf("before src %+v\tdst %+v\n", src, dst)
	copier.CopyWithOption(&dst, src, copier.Option{IgnoreEmpty: true, DeepCopy: true})
	fmt.Printf("after  src %+v\tdst %+v\n", src, dst)
	src.M["b"] = 99
	src.S[1] = 1
	dst.S[0] = 2
	fmt.Printf("last  src %+v\tdst %+v\n\n", src, dst)
}
//before src {A:[9 10 0] S:[12 0] E:[] C: V:val M:map[A::1 b:0] AC:{Name:[ ] C:<nil>} s:true}     dst {A:[1 2 3] S:[4 5 6 7] E:[9 10] C:char V:ha M:map[.:0 C::3 b:4] AC:{Name:[Y Z] C:<nil>} s:false}
//after  src {A:[9 10 0] S:[12 0] E:[] C: V:val M:map[A::1 b:0] AC:{Name:[ ] C:<nil>} s:true}     dst {A:[9 10 0] S:[12 0 6 7] E:[9 10] C:char V:val M:map[.:0 A::1 C::3 b:0] AC:{Name:[Y Z] C:<nil>} s:true}
//last  src {A:[9 10 0] S:[12 1] E:[] C: V:val M:map[A::1 b:99] AC:{Name:[ ] C:<nil>} s:true}     dst {A:[9 10 0] S:[2 0 6 7] E:[9 10] C:char V:val M:map[.:0 A::1 C::3 b:0] AC:{Name:[Y Z] C:<nil>} s:true} 
// 
```



## Converters

有的时候,**struct1**和**struct2**有着相同的成员变量名称,但是这个成员变量的类型不同,就比如下面,这个例子,就需要用到**converts**

需要注意这里的TypeConverter的定义,传入的是接口,返回的也是接口,还有这里的SrcType和DstType,传入的这个类型的**任意一个值**就行,不是传入字符串

```go
type People1 struct {
	Name     string
	Birthday time.Time
	T        time.Time
}
type People2 struct {
	Name     string
	Birthday int64
	T        time.Time
}

func UnixToTime(unix any) (any, error) {
	milli := time.UnixMilli(unix.(int64))
	return milli, nil
}

func TimeToUnix(t any) (any, error) {
	fmt.Println(t)
	milli := t.(time.Time).UnixMilli()
	return milli, nil
}

func main() {
	var p1 = People1{Name: "fsl", Birthday: time.UnixMilli(1689423165871), T: time.UnixMilli(1689423165871)}
	var p2 = People2{}
	err := copier.CopyWithOption(&p2, &p1, copier.Option{Converters: []copier.TypeConverter{
		{
			SrcType: time.Time{},
			DstType: int64(99999),
			Fn:      TimeToUnix,
		},
	}})
	if err != nil {
		fmt.Println(err)
		return
	}
	fmt.Println(p1, p2)
	//{fsl 2023-07-15 20:12:45.871 +0800 CST 2023-07-15 20:12:45.871 +0800 CST} {fsl 1689423165871 2023-07-15 20:12:45.871 +0800 CST}

}
```

