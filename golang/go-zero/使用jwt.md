在做鉴权时,我们需要用到jwt,这里写一下,如何使用jwt

## 一、修改api文件

```api
@server(
	group: user
	prefix: user
)
service user-api {
	@doc "注册用户"
	@handler registerHandler
	post /register (registerReq) returns (baseResp)

	@doc "用户登录"
	@handler loginHandler
	post /login (loginReq) returns (loginResp)
}

@server(
	jwt: Auth
	group: user
	prefix: user
)
service user-api {
	@doc "update用户"
	@handler updateHandler
	post /update (updateReq) returns (updateResp)

	@doc "获取用户信息"
	@handler getInformHandler
	get /inform (getInformReq) returns (getInformResp)
}
```

将需要进行api认证得地方得service前面server之中加入`jwt：Auth`，这里设置的是到时候从config之中哪里拿到jwt相关的配置

写好以上文件之后，使用goctl生成相关文件

## 二、修改conf

```go
package config

import (
	"github.com/zeromicro/go-zero/rest"
)

type Config struct {
	rest.RestConf
	DB struct {
		Datasource string
	}
	Auth struct { // JWT 认证需要的密钥和过期时间配置
		AccessSecret string
		AccessExpire int64
	}
}
```

> 这里的Auth，填的是你在jwt之中填入的字符，官方也是这么填写的

```yaml
Name: user-api
Host: 0.0.0.0
Port: 8888
DB:
  datasource: root:123456789.@tcp(localhost:3306)/love_nest?charset=utf8mb4&parseTime=True&loc=Local
Auth:
  AccessSecret: "12312312"
  AccessExpire: 3600 
  #这里的时间单位是秒

```

## 三、编写具体逻辑

### login

登录获取token

```go
// @secretKey: JWT 加解密密钥
// @iat: 时间戳
// @seconds: 过期时间，单位秒
func (l *LoginLogic) getJwtToken(id, email string) (string, error) {
	claims := make(jwt.MapClaims)
	iat := time.Now().Unix()
	claims["exp"] = iat + l.svcCtx.Config.Auth.AccessExpire
	claims["iat"] = iat
	claims["id"] = id
	claims["email"] = email
	token := jwt.New(jwt.SigningMethodHS256)
	token.Claims = claims
	return token.SignedString([]byte(l.svcCtx.Config.Auth.AccessSecret))
}

func (l *LoginLogic) Login(req *types.LoginReq) (resp *types.LoginResp, err error) {
	resp = new(types.LoginResp)
	if !(req.Email != "" && req.Password != "") {
		resp.Msg = "密码或者邮箱为空"
		resp.Code = 400
		return
	}
	users, err := l.svcCtx.UserModel.Login(l.ctx, req.Email, req.Password)
	token, err := l.getJwtToken(
		strconv.FormatInt(users.Id, 10),
		users.Email.String)
	if err == nil && users != nil {
		resp.Msg = "登录成功"
		resp.Code = 200
		resp.Data = token
		return
	}
	resp.Msg = "密码或者用户名错误"
	resp.Code = 400
	return
}

```

### inform

获取具体的个人信息

```go

func (l *GetInformLogic) GetInform(req *types.GetInformReq) (resp *types.GetInformResp, err error) {
	value := l.ctx.Value("id").(string)
	resp = new(types.GetInformResp)
	id, err := strconv.ParseInt(value, 10, 64)
	if err != nil {
		resp.Msg = err.Error()
		resp.Code = 400
		return
	}
	one, err := l.svcCtx.UserModel.FindOne(l.ctx, id)
	if err != nil {
		resp.Msg = err.Error()
		resp.Code = 400
		return
	}
	err = copier.Copy(&resp.Data, one)
	if err != nil {
		resp.Msg = err.Error()
		resp.Code = 400
		return
	}
	resp.Msg = "获取成功"
	resp.Code = 200
	return
}

```

需要说明的是，我们只需要对生成jwt信息然后返回，然后在需要校验的请求上加上`jwt: Auth`，就可以了

go-zero是通过请求头`Authorization`获取对应的token的，也就是说前端需要将token放入`Authorization`里面，在go-zero校验完成之后，会将token携带的信息放在对应请求的Logic结构体的ctx之中，可以使用`l.ctx.Value("id")`获得，这里只是举例的是id字段，还可以写其他字段

## 四、测试

首先登录获取jwt

![image-20230716130525778](https://cdn.jsdelivr.net/gh/2822132073/image/202307161305385.png)





然后不加token，看看是否可以登录

![image-20230716130613779](https://cdn.jsdelivr.net/gh/2822132073/image/202307161306481.png)

然后加token，看看是否可以登录

![image-20230716130645560](https://cdn.jsdelivr.net/gh/2822132073/image/202307161306987.png)