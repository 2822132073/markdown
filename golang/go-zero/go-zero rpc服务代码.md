

## proto文件

```protobuf
syntax = "proto3";

package server;

option go_package = "./user";

enum Gender {
  MAN = 0;
  WOMAN = 1;
}

message GetUserReq {
  int32 id = 1;
}
message GetUserResp {
  int32 id = 1;
  string name = 2;
  Gender gender = 3;
}

message Flag {
  bool flag = 1;
}
service User {
  rpc GetUser (GetUserReq) returns (GetUserResp);
}
```

这个命令需要结合生成的代码解释

```powershell
PS D:\awesomeProject\TestProject\go-zero-grpc> goctl rpc protoc ./pb/userService.proto --go_out=./common --go-grpc_out=./common --zrpc_out=./server
```

### 生成的代码结构

其中common/user下是protoc生成的代码，在server中是goctl生成的代码，其中protoc生成的代码：

- ***_grpc.pb.go**：后缀的是包含gRPC服务端和客户端代码的定义，以及用于创建gRPC客户端和服务器对象的代码。
- ***.pb.go**：包含protobuf消息类型的定义，以及用于序列化和反序列化这些消息的方法。

其中goctl生成的代码：

- logic：编写具体逻辑的位置
- server：对具体的server进行实现，在这里调用logic代码，相当于**handler**
- svc：依赖注入目录，所有 logic 层需要用到的依赖都要在这里进行显式注入，例如mysqlConn
- config：静态配置文件对应的结构体声明目录

与api的目录相比，少了types，关于类型的定义全部放在了protoc生成的文件中，将api中的handler换成了rpc中的server，都是调用logic中的代码

```shell
PS D:\awesomeProject\TestProject> tree /F .\go-zero-grpc\ 
D:\AWESOMEPROJECT\TESTPROJECT\GO-ZERO-GRPC
├───common
│   └───user
│           userService.pb.go
│           userService_grpc.pb.go
├───pb
│       userService.proto
└───server
    │   userservice.go
    ├───etc
    │       userservice.yaml
    ├───internal
    │   ├───config
    │   │       config.go
    │   ├───logic
    │   │       getuserlogic.go
    │   ├───server
    │   │       userserver.go
    │   └───svc
    │           servicecontext.go
    └───userclient
            user.go

```

根据生成的代码，以及上面的命令，可以得知，`--go_out`和`--go-grpc_out`指的是生成`common\user\userService.pb.go`和`common\user\userService_grpc.pb.go`，这两个文件必须在同一目录下，所以这两项必须相同，而这两项只是指定了外层的目录，里层的目录是根据**go_package**指定的目录来的，而还有一个`--zrpc_out`指定的是服务端生成的代码地址，同时包含了相应client的代码

## 普通的grpc的服务

**服务端实现代码，客户端调用代码**

在普通的grpc中，server的启动包括**实现具体的UserServer接口**->**创建tcp链接**->**创建grpcServer**->**将实现的结构体注册到grpcServer中**->**通过刚刚的连接启动grpcServer**

在client中则不需要进行对接口的实现，相对应的接口已经被实现了，只需要调用即可，步骤是这样的

1. 创建一个gRPC通道（channel），用于与服务端建立连接。这个通道可以使用`grpc.Dial`函数创建，参数包括服务端地址和连接选项（例如安全选项等）。
2. 使用通道创建一个gRPC客户端对象，该客户端对象是您在.proto文件中定义的服务的实现。
3. 准备请求数据。根据您在.proto文件中定义的服务方法和消息类型，创建请求消息对象并设置其字段值。
4. 调用您在客户端对象中实现的服务方法，并传递请求消息作为参数。gRPC客户端将请求消息编码为二进制格式并将其发送到服务器。
5. 服务器收到请求后，执行请求的服务方法，并返回响应消息。gRPC服务器将响应消息编码为二进制格式并将其发送回客户端。
6. 客户端接收到响应消息后，解码并处理响应消息，然后继续执行客户端代码。根据响应消息的内容和您的应用程序逻辑，可能需要进行进一步处理。
7. 当您完成与gRPC服务端的通信时，关闭gRPC通道以释放资源。

### Server端代码

> 需要在具体实现的结构体中内嵌**UnimplementedUserServer**，为了提高兼容性

```go
package main

type userService struct{
    user.UnimplementedUserServer
}

func (s *userService) GetUser(ctx context.Context, req *pb.GetUserReq) (*pb.GetUserResp, error) {
    // Here, you would implement the GetUser service method logic, e.g. fetching user data from a database
    // For this example, we'll simply return a hardcoded user
    if req.Id != 123 {
        return nil, status.Errorf(codes.NotFound, "User with ID %d was not found", req.Id)
    }
    return &pb.GetUserResp{
        Id:     123,
        Name:   "John Doe",
        Gender: pb.Gender_MAN,
    }, nil
}

func main() {
    // 创建tcp连接
    lis, err := net.Listen("tcp", ":50051")
    if err != nil {
        fmt.Println("Failed to listen:", err)
        return
    }

    // 创建rpcServer对象
    grpcServer := grpc.NewServer()

    // 注册User服务到grpcServer中
    pb.RegisterUserServer(grpcServer, &userService{})

    // 启动服务
    fmt.Println("Server started at localhost:50051")
    if err := grpcServer.Serve(lis); err != nil {
        fmt.Println("Failed to serve:", err)
        return
    }
}
```



### Client代码

```go
package main

func main() {
    // 创建tcp链接
    conn, err := grpc.Dial("localhost:50051", grpc.WithInsecure())
    if err != nil {
        log.Fatalf("Failed to connect: %v", err)
    }
    defer conn.Close()

    // 创建UserClient
    userClient := pb.NewUserClient(conn)

    // 调用GetUser方法
    resp, err := userClient.GetUser(context.Background(), &pb.GetUserReq{Id: 123})
    if err != nil {
        log.Fatalf("Failed to get user: %v", err)
    }

    // Print the response
    fmt.Printf("Got user: ID=%d, Name=%s, Gender=%v\n", resp.Id, resp.Name, resp.Gender)
}
```



## go-zero的rpc服务的启动

其实，go-zero也就是对grpc做了一层封装，不需要自己去写那些创建连接之类的工作，只需要写一个配置文件就可以解决问题和写出相对应的逻辑就可以，省去了许多麻烦

1. 解析配置文件，获取相对应的配置
2. 根据配置文件，创建rpcServer，对底层的rpcServer做了一层封装
3. 启动rpcServer，这个里面就是相对应的普通rpc的过程

```go
package main

var configFile = flag.String("f", "etc/userservice.yaml", "the config file")

func main() {
	flag.Parse()

	var c config.Config
	conf.MustLoad(*configFile, &c)
	ctx := svc.NewServiceContext(c)

	s := zrpc.MustNewServer(c.RpcServerConf, func(grpcServer *grpc.Server) {
		user.RegisterUserServer(grpcServer, server.NewUserServer(ctx))

		if c.Mode == service.DevMode || c.Mode == service.TestMode {
			reflection.Register(grpcServer)
		}
	})
	defer s.Stop()

	fmt.Printf("Starting rpc server at %s...\n", c.ListenOn)
	s.Start()
}

```

