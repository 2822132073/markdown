```go
s := zrpc.MustNewServer(c.RpcServerConf, func(grpcServer *grpc.Server) {
    user.RegisterUserServer(grpcServer, server.NewUserServer(ctx))

    if c.Mode == service.DevMode || c.Mode == service.TestMode {
        reflection.Register(grpcServer)
    }
})
```



```go
func MustNewServer(c RpcServerConf, register internal.RegisterFn) *RpcServer {
	server, err := NewServer(c, register)
	logx.Must(err)
	return server
}
```

## Server

Server结构体，下面出现的Server都是这个

```go
Server interface {
    AddOptions(options ...grpc.ServerOption)
    AddStreamInterceptors(interceptors ...grpc.StreamServerInterceptor)
    AddUnaryInterceptors(interceptors ...grpc.UnaryServerInterceptor)
    SetName(string)
    Start(register RegisterFn) error
}
```



## Server的创建流程

只有最底层的rpcServer实现了Server接口

![未命名文件](https://cdn.jsdelivr.net/gh/2822132073/image/202307200001427.png)

最底层的调用的NewRpcServer真正实现Server接口的接口体，在这些方法之中传递的也是Server接口，而不是具体的结构体



## Server的启动流程

总体来说，还是调用了原本的grpc服务，做了一层封装，添加了健康检查和探针，启动逻辑也已经做好了

## RpcServer

这个结构体保存着具体的注册方法

返回RpcServer，具体结构体如下，这里的server是一个接口，实际的结构体取决于配置文件中是否配置了Etcd，配置了Etcd，返回的是一个KeepAliveServer，在Start时会将grpc注册到etcd中

```go
type RpcServer struct {
	server   internal.Server
	register internal.RegisterFn
}
```

### 创建

```go
// NewServer returns a RpcServer.
func NewServer(c RpcServerConf, register internal.RegisterFn) (*RpcServer, error) {
	var err error
	if err = c.Validate(); err != nil {
		return nil, err
	}

	var server internal.Server
	metrics := stat.NewMetrics(c.ListenOn)
	serverOptions := []internal.ServerOption{
		internal.WithMetrics(metrics),
		internal.WithRpcHealth(c.Health),
	}

	if c.HasEtcd() {
		server, err = internal.NewRpcPubServer(c.Etcd, c.ListenOn, c.Middlewares, serverOptions...)
		if err != nil {
			return nil, err
		}
	} else {
		server = internal.NewRpcServer(c.ListenOn, c.Middlewares, serverOptions...)
	}

	server.SetName(c.Name)
	if err = setupInterceptors(server, c, metrics); err != nil {
		return nil, err
	}

	rpcServer := &RpcServer{
		server:   server,
		register: register,
	}
	if err = c.SetUp(); err != nil {
		return nil, err
	}

	return rpcServer, nil
}
```

### 启动

```go
func (rs *RpcServer) Start() {
	if err := rs.server.Start(rs.register); err != nil {
		logx.Error(err)
		panic(err)
	}
}

```



## keepAliveServer

返回keepAliveServer，结构体如下，就是一个底层的rpcServer加上一个registerEtcd函数，主要应用在当配置了etcd的时候，在启动时会注册进去

```go
type keepAliveServer struct {
	registerEtcd func() error
	Server
}
```

### 创建

```go
func NewRpcPubServer(etcd discov.EtcdConf, listenOn string, middlewares ServerMiddlewaresConf,
	opts ...ServerOption) (Server, error) {
	registerEtcd := func() error {
		pubListenOn := figureOutListenOn(listenOn)
		var pubOpts []discov.PubOption
		if etcd.HasAccount() {
			pubOpts = append(pubOpts, discov.WithPubEtcdAccount(etcd.User, etcd.Pass))
		}
		if etcd.HasTLS() {
			pubOpts = append(pubOpts, discov.WithPubEtcdTLS(etcd.CertFile, etcd.CertKeyFile,
				etcd.CACertFile, etcd.InsecureSkipVerify))
		}
		if etcd.HasID() {
			pubOpts = append(pubOpts, discov.WithId(etcd.ID))
		}
		pubClient := discov.NewPublisher(etcd.Hosts, etcd.Key, pubListenOn, pubOpts...)
		return pubClient.KeepAlive()
	}
	server := keepAliveServer{
		registerEtcd: registerEtcd,
		Server:       NewRpcServer(listenOn, middlewares, opts...),
	}

	return server, nil
}
```

### 启动

```go
func (s keepAliveServer) Start(fn RegisterFn) error {
	if err := s.registerEtcd(); err != nil {
		return err
	}

	return s.Server.Start(fn)
}

```





## rpcServer

具体的Start函数，具体结构体如下，最底层的rpcServer，具体实现了Start接口

```go
	rpcServer struct {
		*baseRpcServer
		name          string
		middlewares   ServerMiddlewaresConf
		healthManager health.Probe
	}
```

### 创建

```go
func NewRpcServer(addr string, middlewares ServerMiddlewaresConf, opts ...ServerOption) Server {
	var options rpcServerOptions
	for _, opt := range opts {
		opt(&options)
	}
	if options.metrics == nil {
		options.metrics = stat.NewMetrics(addr)
	}

	return &rpcServer{
		baseRpcServer: newBaseRpcServer(addr, &options),
		middlewares:   middlewares,
		healthManager: health.NewHealthManager(fmt.Sprintf("%s-%s", probeNamePrefix, addr)),
	}
}
```

### 启动

最终的Start逻辑，添加了一些拦截器，和健康检查相关的东西，其他就是一些普通的grpc的代码，创建tcp连接，创建grpcServer，然后将请求注册到这个Server中，然后启动这个Server

```go
func (s *rpcServer) Start(register RegisterFn) error {
	lis, err := net.Listen("tcp", s.address)
	if err != nil {
		return err
	}

	unaryInterceptorOption := grpc.ChainUnaryInterceptor(s.buildUnaryInterceptors()...)
	streamInterceptorOption := grpc.ChainStreamInterceptor(s.buildStreamInterceptors()...)

	options := append(s.options, unaryInterceptorOption, streamInterceptorOption)
	server := grpc.NewServer(options...)
	register(server)

	// register the health check service
	if s.health != nil {
		grpc_health_v1.RegisterHealthServer(server, s.health)
		s.health.Resume()
	}
	s.healthManager.MarkReady()
	health.AddProbe(s.healthManager)

	// we need to make sure all others are wrapped up,
	// so we do graceful stop at shutdown phase instead of wrap up phase
	waitForCalled := proc.AddWrapUpListener(func() {
		if s.health != nil {
			s.health.Shutdown()
		}
		server.GracefulStop()
	})
	defer waitForCalled()

	return server.Serve(lis)
}

```

