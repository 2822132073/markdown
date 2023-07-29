## JWT的组成

JWT（JSON Web Tokens）由三部分组成，它们分别是：header（头部）、payload（负载）、signature（签名）。

1. Header（头部）：JWT 的头部通常由两部分组成，第一部分是声明类型，这里固定为 `JWT`；第二部分是声明使用的签名算法，例如 `HS256`、`HS384` 或 `HS512` 等。

2. Payload（负载）：JWT 的负载部分包含了一些声明（claim），声明通常包含一些实体（subject，sub）、过期时间（expiration time，exp）、发布时间（issued at，iat）等信息，以及一些自定义的信息。对于用户身份验证，用户 ID 可以放在声明中。

3. Signature（签名）：JWT 的签名是使用头部和负载（使用 Base64 编码后的字符串）和一个密钥进行加密后得到的字符串。签名的目的是为了验证 JWT 的完整性，确保它没有被篡改过。

JWT 的三个部分使用 `.` 进行分隔，它们的完整格式如下：

```
xxxxx.yyyyy.zzzzz
```

其中，`xxxxx` 是头部，`yyyyy` 是负载，`zzzzz` 是签名。注意，JWT 中的每一部分都是使用 Base64 编码后的字符串。

**也就是说，前两个部分都只是经过BASE64编码后的字符，不需要secret解密**

JWT 的 Signature 是使用头部和负载（Base64 编码后的字符串）以及一个密钥进行加密后得到的字符串。加密的算法可以是对称加密（如 HMAC）或非对称加密（如 RSA）。

具体的签名生成过程如下：

1. 使用 Base64 编码头部和负载，将它们连接成一个字符串，中间用 `.` 分隔。

2. 使用指定的算法和密钥对上述字符串进行加密，生成 Signature。

3. 将上述加密后的 Signature 也进行 Base64 编码，得到最终的 JWT 字符串。

Hash(Base64(header)+Base64(payload),secret)



## github.com/golang-jwt/jwt/v5

### 生成jwt

在这个库中有两个已经写好的类型，一个是`RegisteredClaims`，另外一个是`MapClaims`

**RegisteredClaims**其中包含了RFC标准的许多字段，比如**Issuer**，**Subject**等信息

**MapClaims**则是一个`map[string]interface{}`类型数据

在我看来，直接使用**RegisteredClaims**最好，有很多的方法都已经实现了，只需要将对应的数据填入就行了

```go
type RegisteredClaims struct {
    // 该jwt的颁发者，不是必要的
	// the `iss` (Issuer) claim. 
	Issuer string `json:"iss,omitempty"`
	// 该jwt的主题，不是必要的
	// the `sub` (Subject) claim.
	Subject string `json:"sub,omitempty"`
	// Jwt的接收方，不是必要的
	// the `aud` (Audience) claim.
	Audience ClaimStrings `json:"aud,omitempty"`
	// Jwt的过去时间
	// the `exp` (Expiration Time) 
	ExpiresAt *NumericDate `json:"exp,omitempty"`
	// Jwt的生效时间
	// the `nbf` (Not Before) claim.
	NotBefore *NumericDate `json:"nbf,omitempty"`
	// 这个Jwt颁布的时间，决定了这个Jwt的寿命
	// the `iat` (Issued At) claim.
	IssuedAt *NumericDate `json:"iat,omitempty"`
	// 该jwt的id，最好不唯一，不是必要的
	// the `jti` (JWT ID) claim.
	ID string `json:"jti,omitempty"`
}
```

以上是**RegisteredClaims**的结构体，有时我们需要携带一些自己的信息，所以需要重新定义，下面写了一个示例，假设需要存储到Jwt中的内容是Emai和Uid，我们重生生成一个这样的结构体，然后声明就行，关于过期时间，就假设是从现在开始，要是需要修改的话，可以根据自己的情况修改

```go

type Claims struct {
	jwt.RegisteredClaims
	Email string `json:"email"`
	Uid   string `json:"uid"`
}

func getJwt() string {
	duration := time.Duration(time.Minute * 5)
    // 这里可以根据自己的需求定义为全局变量，或者放在其他地方，需要注意的是，secret的类型需要是[]byte
	secret := []byte("123123123")
    // 定义以这个claim
	claims := &Claims{
		Email: "2822132073@qq.com",
		Uid:   "99",
		RegisteredClaims: jwt.RegisteredClaims{
			NotBefore: jwt.NewNumericDate(time.Now()),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(duration)),
		},
	}
    // 声明用到的加密的算法，到这一步，需要生成的元素还缺secret
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
   	// 指定secret，生成jwt
	signedString, err := token.SignedString(secret)
	if err != nil {
		fmt.Println(err)
	}
	return signedString
}

```



### 解析jwt

需要用到`ParseWithClaims`，这个方法的第三个参数返回的就是**secret**，需要注意的是第二参数传入的是**Claim**的指针，这在`ParseWithClaims`的说明中有写到。这个返回的token是为了验证这个jwt是否有效的，claims是包含了其中的信息（生成时传入的信息）

```go
func parseJwt(jwtString string) (*jwt.Token, *Claims, error) {
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(jwtString, claims, func(token *jwt.Token) (interface{}, error) {
		return secret, nil
	})
	return token, claims, err
}
```

### 验证

这里使用的是**RegisteredClaims**，需要注意的是，必须设置：**NotBefore**，**IssuedAt**，**ExpiresAt**，RegisteredClaims使用的Vaild方法需要用到这些属性，如果不设置，默认为true

```go

func getJwt() string {
	duration := time.Minute * 5
	//now := time.Now().Add(time.Minute * -6)
	now := time.Now()
	claims := &Claims{
		Email: "2822132073@qq.com",
		Uid:   "99",
		RegisteredClaims: jwt.RegisteredClaims{
			NotBefore: jwt.NewNumericDate(now),
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(duration)),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedString, err := token.SignedString(secret)
	if err != nil {
		fmt.Println(err)
	}
	return signedString
}

func parseJwt(jwtString string) (*jwt.Token, *Claims, error) {
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(jwtString, claims, func(token *jwt.Token) (interface{}, error) {
		return secret, nil
	})
	return token, claims, err
}

func main() {
	fmt.Println(time.Now())
	s := getJwt()
	token, claims, _ := parseJwt(s)
	fmt.Println(token.Valid)
	fmt.Println(claims)
    // true
    // &{{  [] 2023-07-18 16:28:35 +0800 CST 2023-07-18 16:23:35 +0800 CST 2023-07-18 16:23:35 +0800 CST } 2822132073@qq.com 99}


}
```

正常设置，返回true

```go
package main

import (
	"fmt"
	"github.com/golang-jwt/jwt/v4"
	"time"
)

var secret = []byte("123123123")

type Claims struct {
	jwt.RegisteredClaims
	Email string `json:"email"`
	Uid   string `json:"uid"`
}

func getJwt() string {
	duration := time.Minute * 5
	now := time.Now().Add(time.Minute * -6)
	//now := time.Now()
	claims := &Claims{
		Email: "2822132073@qq.com",
		Uid:   "99",
		RegisteredClaims: jwt.RegisteredClaims{
			NotBefore: jwt.NewNumericDate(now),
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(duration)),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedString, err := token.SignedString(secret)
	if err != nil {
		fmt.Println(err)
	}
	return signedString
}

func parseJwt(jwtString string) (*jwt.Token, *Claims, error) {
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(jwtString, claims, func(token *jwt.Token) (interface{}, error) {
		return secret, nil
	})
	return token, claims, err
}

func main() {
	fmt.Println(time.Now())
	s := getJwt()
	token, claims, _ := parseJwt(s)
	fmt.Println(token.Valid)
	fmt.Println(claims)
    
   // false        
   // &{{  [] 2023-07-18 16:24:30 +0800 CST 2023-07-18 16:19:30 +0800 CST 2023-07-18 16:19:30 +0800 CST } 2822132073@qq.com 99}
}
```

将开始时间设置在现在时间的前6分钟，所以肯定会超时