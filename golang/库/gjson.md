# Gjson

> Golang自带的json解析太过复杂，麻烦，使用第三方json解析比较好用



### 验证字符串或字节切片是否有效

```go
func Valid(json string) bool
func ValidBytes(json []byte) bool
```





## Gjson.Result

> 可以使用 
>
> ```go
> func Parse(json string) Result
> func ParseBytes(json []byte) Result
> func Get(json, path string) Result
> func GetBytes(json []byte, path string) Result
> func GetMany(json string, path ...string) []Result  //可以得到一个Result的切片
> func GetManyBytes(json []byte, path ...string) []Result
> ```
>
> 将一串字符变成一个`Result`类型

```go
func (t Result) Array() []Result
func (t Result) Bool() bool
func (t Result) Exists() bool
func (t Result) Float() float64
func (t Result) ForEach(iterator func(key, value Result) bool)
func (t Result) Get(path string) Result
func (t Result) Int() int64
func (t Result) IsArray() bool
func (t Result) IsObject() bool
func (t Result) Less(token Result, caseSensitive bool) bool
func (t Result) Map() map[string]Result
func (t Result) String() string
func (t Result) Time() time.Time
func (t Result) Uint() uint64
func (t Result) Value() interface{}
```





原始字符:

```json
{
  "name": {"first": "Tom", "last": "Anderson"},
  "age":37,
  "children": ["Sara","Alex","Jack"],
  "fav.movie": "Deer Hunter",
  "friends": [
    {"first": "Dale", "last": "Murphy", "age": 44, "nets": ["ig", "fb", "tw"]},
    {"first": "Roger", "last": "Craig", "age": 68, "nets": ["fb", "tw"]},
    {"first": "Jane", "last": "Murphy", "age": 47, "nets": ["ig", "tw"]}
  ]
}
```



```go
name.last              "Anderson"
name.first             "Tom"
age                    37
children               ["Sara","Alex","Jack"]
children.0             "Sara"   //取children下,index为 0 的元素,只能对列表使用
children.1             "Alex"
friends.1              {"first": "Roger", "last": "Craig", "age": 68}
friends.1.first        "Roger" //去friends下的第一个元素下的first字段
child*.2               "Jack"   //这里的*是通配符的意思,匹配任意多个字符
c?ildren.0             "Sara"   // ? 在你这里的意思是配置任意一个字符
fav\.movie             "Deer Hunter"  //转义符
friends.#              3   //在数组元素后使用#表示数组元素个数
friends.#.age         [44,68,47] //变量元素下的age字段
//#(...) 和 #(...)# 中可以使用的计较字符有: ==,!=, <, <=, >, >= , % , !%
// #(...)会遍历列表,当查询到第一个元素时就返回,这里返回的是每个元素的first字段
friends.#(last=="Murphy").first     "Dale"  
// #(...)#会遍历列表,会查询所有列表中的元素,这里返回的是每个元素的first字段
friends.#(last=="Murphy")#.first    ["Dale","Jane"]
friends.#(age>45)#.last             ["Craig","Murphy"]
// 这里的表达式的意思是: 使用friends列表中的每个元素的first字段去匹配"D*",将可以匹配的元素的last字段返回,使用!%则反之
friends.#(first%"D*").last          "Murphy"
friends.#(first!%"D*").last         "Craig"
children.#(!%"*a*")                 "Alex"
children.#(%"*a*")#                 ["Sara","Jack"]
```











# GJSON Path Syntax

A GJSON Path is a text string syntax that describes a search pattern for quickly retreiving values from a JSON payload.

This document is designed to explain the structure of a GJSON Path through examples.

- [Path structure](https://github.com/tidwall/gjson/blob/v1.9.4/SYNTAX.md#path-structure)
- [Basic](https://github.com/tidwall/gjson/blob/v1.9.4/SYNTAX.md#basic)
- [Wildcards](https://github.com/tidwall/gjson/blob/v1.9.4/SYNTAX.md#wildcards)
- [Escape Character](https://github.com/tidwall/gjson/blob/v1.9.4/SYNTAX.md#escape-character)
- [Arrays](https://github.com/tidwall/gjson/blob/v1.9.4/SYNTAX.md#arrays)
- [Queries](https://github.com/tidwall/gjson/blob/v1.9.4/SYNTAX.md#queries)
- [Dot vs Pipe](https://github.com/tidwall/gjson/blob/v1.9.4/SYNTAX.md#dot-vs-pipe)
- [Modifiers](https://github.com/tidwall/gjson/blob/v1.9.4/SYNTAX.md#modifiers)
- [Multipaths](https://github.com/tidwall/gjson/blob/v1.9.4/SYNTAX.md#multipaths)

The definitive implemenation is [github.com/tidwall/gjson](https://github.com/tidwall/gjson).
Use the [GJSON Playground](https://gjson.dev/) to experiment with the syntax online.

## Path structure

A GJSON Path is intended to be easily expressed as a series of components seperated by a `.` character.

Along with `.` character, there are a few more that have special meaning, including `|`, `#`, `@`, `\ `, `* ` , and `?`.

## Example

Given this JSON

```
{
  "name": {"first": "Tom", "last": "Anderson"},
  "age":37,
  "children": ["Sara","Alex","Jack"],
  "fav.movie": "Deer Hunter",
  "friends": [
    {"first": "Dale", "last": "Murphy", "age": 44, "nets": ["ig", "fb", "tw"]},
    {"first": "Roger", "last": "Craig", "age": 68, "nets": ["fb", "tw"]},
    {"first": "Jane", "last": "Murphy", "age": 47, "nets": ["ig", "tw"]}
  ]
}
```

The following GJSON Paths evaluate to the accompanying values.

### Basic

In many cases you'll just want to retreive values by object name or array index.

```
name.last              "Anderson"
name.first             "Tom"
age                    37
children               ["Sara","Alex","Jack"]
children.0             "Sara"
children.1             "Alex"
friends.1              {"first": "Roger", "last": "Craig", "age": 68}
friends.1.first        "Roger"
```

### Wildcards

A key may contain the special wildcard characters `*` and `?`. The `*` will match on any zero+ characters, and `?` matches on any one character.

```
child*.2               "Jack"
c?ildren.0             "Sara"
```

### Escape character

Special purpose characters, such as `.`, `*`, and `?` can be escaped with `\`.

```
fav\.movie             "Deer Hunter"
```

You'll also need to make sure that the `\` character is correctly escaped when hardcoding a path in you source code.

```
// Go
val := gjson.Get(json, "fav\\.movie")  // must escape the slash
val := gjson.Get(json, `fav\.movie`)   // no need to escape the slash 
```

### Arrays

The `#` character allows for digging into JSON Arrays.

To get the length of an array you'll just use the `#` all by itself.

```
friends.#              3
friends.#.age         [44,68,47]
```

### Queries

You can also query an array for the first match by using `#(...)`, or find all matches with `#(...)#`. Queries support the `==`, `!=`, `<`, `<=`, `>`, `>=` comparison operators, and the simple pattern matching `%` (like) and `!%` (not like) operators.

```
friends.#(last=="Murphy").first     "Dale"
friends.#(last=="Murphy")#.first    ["Dale","Jane"]
friends.#(age>45)#.last             ["Craig","Murphy"]
friends.#(first%"D*").last          "Murphy"
friends.#(first!%"D*").last         "Craig"
```

To query for a non-object value in an array, you can forgo the string to the right of the operator.

```
children.#(!%"*a*")                 "Alex"
children.#(%"*a*")#                 ["Sara","Jack"]
```

Nested queries are allowed.

```
friends.#(nets.#(=="fb"))#.first  >> ["Dale","Roger"]
```

*Please note that prior to v1.3.0, queries used the `#[...]` brackets. This was changed in v1.3.0 as to avoid confusion with the new [multipath](https://github.com/tidwall/gjson/blob/v1.9.4/SYNTAX.md#multipaths) syntax. For backwards compatibility, `#[...]` will continue to work until the next major release.*

The `~` (tilde) operator will convert a value to a boolean before comparison.

For example, using the following JSON:

```
{
  "vals": [
    { "a": 1, "b": true },
    { "a": 2, "b": true },
    { "a": 3, "b": false },
    { "a": 4, "b": "0" },
    { "a": 5, "b": 0 },
    { "a": 6, "b": "1" },
    { "a": 7, "b": 1 },
    { "a": 8, "b": "true" },
    { "a": 9, "b": false },
    { "a": 10, "b": null },
    { "a": 11 }
  ]
}
```

You can now query for all true(ish) or false(ish) values:

```
vals.#(b==~true)#.a    >> [1,2,6,7,8]
vals.#(b==~false)#.a   >> [3,4,5,9,10,11]
```

The last value which was non-existent is treated as `false`

### Dot vs Pipe

The `.` is standard separator, but it's also possible to use a `|`. In most cases they both end up returning the same results. The cases where`|` differs from `.` is when it's used after the `#` for [Arrays](https://github.com/tidwall/gjson/blob/v1.9.4/SYNTAX.md#arrays) and [Queries](https://github.com/tidwall/gjson/blob/v1.9.4/SYNTAX.md#queries).

Here are some examples

```
friends.0.first                     "Dale"
friends|0.first                     "Dale"
friends.0|first                     "Dale"
friends|0|first                     "Dale"
friends|#                           3
friends.#                           3
friends.#(last="Murphy")#           [{"first": "Dale", "last": "Murphy", "age": 44},{"first": "Jane", "last": "Murphy", "age": 47}]
friends.#(last="Murphy")#.first     ["Dale","Jane"]
friends.#(last="Murphy")#|first     <non-existent>
friends.#(last="Murphy")#.0         []
friends.#(last="Murphy")#|0         {"first": "Dale", "last": "Murphy", "age": 44}
friends.#(last="Murphy")#.#         []
friends.#(last="Murphy")#|#         2
```

Let's break down a few of these.

The path `friends.#(last="Murphy")#` all by itself results in

```
[{"first": "Dale", "last": "Murphy", "age": 44},{"first": "Jane", "last": "Murphy", "age": 47}]
```

The `.first` suffix will process the `first` path on each array element *before* returning the results. Which becomes

```
["Dale","Jane"]
```

But the `|first` suffix actually processes the `first` path *after* the previous result. Since the previous result is an array, not an object, it's not possible to process because `first` does not exist.

Yet, `|0` suffix returns

```
{"first": "Dale", "last": "Murphy", "age": 44}
```

Because `0` is the first index of the previous result.

### Modifiers

A modifier is a path component that performs custom processing on the JSON.

For example, using the built-in `@reverse` modifier on the above JSON payload will reverse the `children` array:

```
children.@reverse                   ["Jack","Alex","Sara"]
children.@reverse.0                 "Jack"
```

There are currently the following built-in modifiers:

- `@reverse`: Reverse an array or the members of an object.
- `@ugly`: Remove all whitespace from JSON.
- `@pretty`: Make the JSON more human readable.
- `@this`: Returns the current element. It can be used to retrieve the root element.
- `@valid`: Ensure the json document is valid.
- `@flatten`: Flattens an array.
- `@join`: Joins multiple objects into a single object.

#### Modifier arguments

A modifier may accept an optional argument. The argument can be a valid JSON payload or just characters.

For example, the `@pretty` modifier takes a json object as its argument.

```
@pretty:{"sortKeys":true}
```

Which makes the json pretty and orders all of its keys.

```
{
  "age":37,
  "children": ["Sara","Alex","Jack"],
  "fav.movie": "Deer Hunter",
  "friends": [
    {"age": 44, "first": "Dale", "last": "Murphy"},
    {"age": 68, "first": "Roger", "last": "Craig"},
    {"age": 47, "first": "Jane", "last": "Murphy"}
  ],
  "name": {"first": "Tom", "last": "Anderson"}
}
```

*The full list of `@pretty` options are `sortKeys`, `indent`, `prefix`, and `width`. Please see [Pretty Options](https://github.com/tidwall/pretty#customized-output) for more information.*

#### Custom modifiers

You can also add custom modifiers.

For example, here we create a modifier which makes the entire JSON payload upper or lower case.

```
gjson.AddModifier("case", func(json, arg string) string {
  if arg == "upper" {
    return strings.ToUpper(json)
  }
  if arg == "lower" {
    return strings.ToLower(json)
  }
  return json
})
"children.@case:upper"             ["SARA","ALEX","JACK"]
"children.@case:lower.@reverse"    ["jack","alex","sara"]
```

*Note: Custom modifiers are not yet available in the Rust version*

### Multipaths

Starting with v1.3.0, GJSON added the ability to join multiple paths together to form new documents. Wrapping comma-separated paths between `[...]` or `{...}` will result in a new array or object, respectively.

For example, using the given multipath

```
{name.first,age,"the_murphys":friends.#(last="Murphy")#.first}
```

Here we selected the first name, age, and the first name for friends with the last name "Murphy".

You'll notice that an optional key can be provided, in this case "the_murphys", to force assign a key to a value. Otherwise, the name of the actual field will be used, in this case "first". If a name cannot be determined, then "_" is used.

This results in

```
{"first":"Tom","age":37,"the_murphys":["Dale","Jane"]}
```