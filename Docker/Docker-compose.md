# Docker-compose

[TOC]

## Docker-compose介绍

> Docker-Compose将所管理的容器分为三层，分别是:
>
> - 工程（project）
> - 服务（service）
> - 容器（container）。

> Docker-Compose运行目录下的所有文件（docker-compose.yml，extends文件或环境变量文件等）组成一个工程，若无特殊指定工程名即为当前目录名。
>
> 一个工程当中可包含多个服务，每个服务中定义了容器运行的镜像，参数，依赖。一个服务当中可包括多个容器实例，Docker-Compose并没有解决负载均衡的问题，因此需要借助其它工具实现服务发现及负载均衡。
> Docker-Compose的工程配置文件默认为docker-compose.yml，可通过环境变量COMPOSE_FILE或-f参数自定义配置文件，其定义了多个有依赖关系的服务及每个服务运行的容器。
> 使用一个Dockerfile模板文件，可以让用户很方便的定义一个单独的应用容器。在工作中，经常会碰到需要多个容器相互配合来完成某项任务的情况。例如要实现一个Web项目，除了Web服务容器本身，往往还需要再加上后端的数据库服务容器，甚至还包括负载均衡容器等。
> Compose允许用户通过一个单独的docker-compose.yml模板文件（YAML 格式）来定义一组相关联的应用容器为一个项目（project）。
> Docker-Compose项目由Python编写，调用Docker服务提供的API来对容器进行管理。因此，只要所操作的平台支持Docker API，就可以在其上利用Compose来进行编排管理。

## Docker-compose模板文件

> Compose允许用户通过一个docker-compose.yml模板文件（YAML 格式）来定义一组相关联的应用容器为一个项目（project）。
> Compose模板文件是一个定义服务、网络和卷的YAML文件。Compose模板文件默认路径是当前目录下的docker-compose.yml，可以使用.yml或.yaml作为文件扩展名。
> Docker-Compose标准模板文件应该包含version、services、networks 三大部分，最关键的是services和networks两个部分。

*我在这里写几个常用的,其它的看[docker中文文档](https://vuepress.mirror.docker-practice.com/compose)  [docker官方文档](https://docs.docker.com/compose/compose-file/compose-file-v3)*

> `Docker-compose`可以通过服务名去访问其它的服务,而服务的`IP`地址不是通过`/etc/hosts`文件解析的,是通过

**先看一个示例**

> 在给service命名的时候,要尽可能的去遵守域名的命令规范,或者在设置容器的`hostname`的时候,也要遵循,有些软件在使用域名或者host解析的时候会特别严格,如果不写对,可能会出现问题,导致无法启动,或者无法解析到正确的容器上面
>
> 例如:
>
> nacos我在部署的时候使用服务名,无法启动,因为service的name为nacos_1,这是不符合域名规范的,在nacos_2去解析nacos_1时,就无法被解析,无法获得nacos_2的ip,所以启动失败

```shell
version: "3"   
services:
  redis:
    image: redis:alpine   #选择这个serveice的image为redis:alpine
    ports:
      - "6379"   #将container的这个端口暴露出去,主机的端口为随机端口
    networks:
      - frontend   #接入这个网络,这里是一个列表,可以接入多个网络,同时Container中也会有多张网卡
                   #网络需要在下面定义
  db:
    image: postgres:9.4
    volumes: 
      #将卷db-data映射到/var/lib/postgresql/data中,需要在下面定义这个volume
      - db-data:/var/lib/postgresql/data
    networks:
      - backend
  vote:
    image: dockersamples/examplevotingapp_vote:before
    ports:
      - "5000:80"  #将宿主机的5000端口映射到Container中的80上,可以指定映射带主机的那个IP上
    networks:
      - frontend
    depends_on:
      - redis  #需要redis这个service起来后,他才会起来
  result:
    image: dockersamples/examplevotingapp_result:before
    ports:
      - "5001:80"
    networks:
      - backend
    depends_on:
      - db
  worker:
    image: dockersamples/examplevotingapp_worker
    networks:   #同时接入两个网络
      - frontend
      - backend
  visualizer:
    image: dockersamples/visualizer:stable
    ports:
      - "8080:8080"
    stop_grace_period: 1m30s  
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock"
      ##将本机的/var/run/docker.sock映射到Container中


#定义两个网络和一个容器卷,这个时候,如果主机中有相同的卷,他不会去使用,
networks:
  frontend:
  backend:
volumes:
  db-data:
```

### Build

>  指定 `Dockerfile` 所在文件夹的路径（可以是绝对路径，或者相对 docker-compose.yml 文件的路径）。 `Compose` 将会利用它自动构建这个镜像，然后使用这个镜像。

```yaml
version: '3'
services:
  webapp:
    build: ./dir
```

> 你也可以使用 `context` 指令指定 `Dockerfile` 所在文件夹的路径。
>
> 使用 `dockerfile` 指令指定 `Dockerfile` 文件名。
>
> 使用 `arg` 指令指定构建镜像时的变量。



```yaml
version: '3'
services:
  webapp:
    build:
      context: ./dir
      dockerfile: Dockerfile-alternate
      args:
        buildno: 1
```

>  使用 `cache_from` 指定构建镜像的缓存

```yaml
build:
  context: .
  cache_from:
    - alpine:latest
    - corp/web_app:3.14
```

### Command

> 覆盖容器启动后默认执行的命令。

```shell
command: echo "hello world"
```

### ports

> 暴露端口信息。
>
> 使用宿主端口：容器端口 `(HOST:CONTAINER)` 格式，或者仅仅指定容器的端口（宿主将会随机选择端口）都可以。也可以指定宿主机的`IP`,用这种方式:`HOSTIP:HOST_PORT:CONTAINER_PORT`
>
> ```shell
> ports:
>  - "3000"
>  - "8000:8000"
>  - "49100:22"
>  - "127.0.0.1:8001:8001"
> ```

### volumes

> 数据卷所挂载路径设置。可以设置为宿主机路径(`HOST:CONTAINER`)或者数据卷名称(`VOLUME:CONTAINER`)，并且可以设置访问模式 （`HOST:CONTAINER:ro(或者rw)`）
>
> ```shell
> version: "3"
> services:
>   web:
>     image: nginx
>     ports:
>       - "80:80"
>     volumes:
>       - html:/usr/share/nginx/html/:ro
> volumes:
>   html:
> ```
>
> > 这样设置会创建在外面创建[project_name]_[volumes] 的volumes
>
> ```shell
> [root@docker ~]# docker volume ls
> DRIVER              VOLUME NAME
> local               test_html
> ```
>
> > 在volumes下加一个参数`external: true`
>
> ```shell
> version: "3"
> services:
>   web:
>     image: nginx
>     ports:
>       - "80:80"
>     volumes:
>       - html:/usr/share/nginx/html/:ro
> volumes:
>   html:
>    external: true
> ```
>
> 这样就可以使用外部的volumes

### networks

> 配置容器的网络
>
> ```shell
> version: "3"
> services:
>   some-service:
>     networks:
>      - some-network
>      - other-network
> 
> networks:
>   some-network:
>   other-network:
> ```
>
> > 这样设置会重新创建网络,
>
> ```shell
> [root@docker ~/test]# docker network ls
> NETWORK ID          NAME                  DRIVER              SCOPE
> eef5d1484448        bridge                bridge              local
> 5987468e9e42        host                  host                local
> e71fb6d1afcb        none                  null                local
> 9553e9f69faf        test_test-network-1   bridge              local
> 22e2620258fb        test_test-network-2   bridge              local
> ```
>
> > 需要向上面的`volumes`选项下加上`external:true`
>
> ```shell
> [root@docker ~/test]# cat docker-compose.yaml 
> version: "3"
> services:
>   test:
>     image: busybox
>     networks:
>       - test-network-1
>       - test-network-2
>     command: ip addr show
> networks:
>   test-network-1:
>     external: true
>   test-network-2:
>     external: true
> ```
>
> >  执行`docker-compose up`后,会报错
>
> ```shell
> [root@docker ~/test]# docker-compose up
> ERROR: Network test-network-1 declared as external, but could not be found. Please create the network manually using `docker network create test-network-1` and try again.
> ```
>
> > 未发现网络,需要我们手动在外部创建网络
>
> ```shell
> [root@docker ~/test]# docker network create test-network-1
> a81bbe0595c12466c07e0e473f3a40b09af072c333f44835f76c116dea9dbcf7
> [root@docker ~/test]# docker network create test-network-2
> 6df9082b8908a14f6885f0db01f6c1e08c6a9ca9c82fd9662f8477489b784966
> ```
>
> > 再次执行
>
> ```shell
> [root@docker ~/test]# docker-compose up
> Recreating test_test_1 ... done
> Attaching to test_test_1
> test_1  | 1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue qlen 1000
> test_1  |     link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
> test_1  |     inet 127.0.0.1/8 scope host lo
> test_1  |        valid_lft forever preferred_lft forever
> test_1  | 25: eth1@if26: <BROADCAST,MULTICAST,UP,LOWER_UP,M-DOWN> mtu 1500 qdisc noqueue 
> test_1  |     link/ether 02:42:ac:17:00:02 brd ff:ff:ff:ff:ff:ff
> test_1  |     inet 172.23.0.2/16 brd 172.23.255.255 scope global eth1
> test_1  |        valid_lft forever preferred_lft forever
> test_1  | 27: eth0@if28: <BROADCAST,MULTICAST,UP,LOWER_UP,M-DOWN> mtu 1500 qdisc noqueue 
> test_1  |     link/ether 02:42:ac:16:00:02 brd ff:ff:ff:ff:ff:ff
> test_1  |     inet 172.22.0.2/16 brd 172.22.255.255 scope global eth0
> test_1  |        valid_lft forever preferred_lft forever
> test_test_1 exited with code 0
> ```



### environment

> 设置环境变量。你可以使用数组或字典两种格式。
>
> 只给定名称的变量会自动获取运行 Compose 主机上对应变量的值，可以用来防止泄露不必要的数据。
>
> > `environment`有两种定义方法
>
> **第一种**
>
> ```shell
> version: "3"
> services:
>   test:
>     image: busybox
>     environment:
>       TEST_ENV: test
>     command: env
> ```
>
> **第二种**
>
> ```shell
> [root@docker ~/test]# cat docker-compose.yaml 
> version: "3"
> services:
>   test:
>     image: busybox
>     environment:
>       - TEST_ENV=test
>     command: env
> ```
>
> > 用列表的方式和字典的方式:
> >
> > 1. 列表需要加`=`,例如: 上面的`- TEST_ENV=test`
> > 2. 字典用应该用`:`,例如:上面的`TEST_ENV: test`
>
> > 一下docker-compose文件,在`command`无法获取环境变量,
> >
> > ```shell
> > version: "3"
> > services:
> > test:
> >  image: busybox
> >  environment:
> >       - TEST_ENV=test
> >     command: echo $TEST_ENV
> > ```
> >
> > 情况如下:
> >
> > ```shell
> > [root@docker ~/test]# docker-compose up
> > WARNING: The TEST_ENV variable is not set. Defaulting to a blank string.
> > Recreating test_test_1 ... done
> > Attaching to test_test_1
> > test_1  | 
> > test_test_1 exited with code 0
> > ```
> >
> > 在command无法获取环境变量
> >
> > **猜测**
> >
> > 我在使用`docker-compose config`查看配置文件时,发现`command`在`environment`上
> >
> > ```shell
> > [root@docker ~/test]# docker-compose config
> > WARNING: The TEST_ENV variable is not set. Defaulting to a blank string.
> > services:
> >   test:
> >     command: 'echo '
> >     environment:
> >       TEST_ENV: test
> >     image: busybox
> > version: '3.0'
> > ```
> >
> > 在执行之前已经被解析,我在宿主机定义一个`TEST_ENV`,也是无法无法获取,说明,这个变量不是从宿主机获取的,只能是在原来的`image`中获取的,我编写一个`Dockerfile`,加入了一个环境变量,在次执行,还是无法获取变量,又将`command`执行的命令改变为`echo $PATH`,发现`docker-compose config`的输出不为空了,我有理由怀疑是从环境变量中获取的变量,我将`TEST_ENV`设置为环境变量,最终可以获取到了
> >
> > **结论**
> >
> > > 在`docker-compose.yaml`中的`command`使用变量时,会先直接从宿主机的`环境变量`直接获取,不会将变量带到`Container`再解析
>
> 如果变量名称或者值中用到 `true|false，yes|no` 等表达 `布尔 (opens new window)`含义的词汇，最好放到引号里，避免 YAML 自动解析某些内容为对应的布尔语义。这些特定词汇，包括
>
> ```shell
> y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF
> ```
### env_file

> 从文件中获取环境变量，可以为单独的文件路径或列表。
>
> 如果通过 `docker-compose -f FILE` 方式来指定 Compose 模板文件，则 `env_file` 中变量的路径会基于模板文件路径。
>
> 如果有变量名称与 `environment` 指令冲突，则按照惯例，以后者为准。
>
> ```shell
> [root@docker ~/test]# cat docker-compose.yaml 
> version: "3.4"
> services:
>   test:
>     image: busybox
>     env_file: .env
>     command: env
>     restart: always
> ```
>
> ```shell
> [root@docker ~/test]# docker-compose up
> Recreating test_test_1 ... done
> Attaching to test_test_1
> test_1  | PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
> test_1  | HOSTNAME=f5b981a374fd
> test_1  | TEST_ENV=env
> test_1  | HOME=/root
> ```
>
> > 支持以`#`开头的注释


### extra_hosts

> 类似 Docker 中的 `--add-host` 参数，指定额外的 host 名称映射信息。
>
> ```shell
> extra_hosts:
>  - "googledns:8.8.8.8"
>  - "dockerhub:52.1.157.61"
> ```
>
> 会在启动后的服务容器中 `/etc/hosts` 文件中添加如下两条条目。
>
> ```shell
> 8.8.8.8 googledns
> 52.1.157.61 dockerhub
> ```

### healthcheck

> 通过命令检查容器是否健康运行。
>
> ```shell
> healthcheck:
> test: ["CMD", "curl", "-f", "http://localhost"]
> interval: 1m30s
> timeout: 10s
> retries: 3
> ```
>
> `test`必须是一个列表或者一串字符串,如果是一个列表,第一个选项必须是`NONE`,`CMD`,`CMD-SHELL`,如果是一个字符串,它等于是`CMD-shell`
>
> > 用来健康检查的命令需要在镜像中有,不然会直接`unhealthy`
>
> > `Container`状态为`unhealthy`,不会退出或者重启


### depends_on

> 解决容器的依赖、启动先后的问题。以下例子中会先启动 `redis` `db` 再启动 `web`
>
> ```shell
> version: '3'
> services:
>   web:
>     build: .
>     depends_on:
>       - db
>       - redis
>   redis:
>     image: redis
>   db:
>     image: postgres
> ```
>
> > 注意：`web` 服务不会等待 `redis` `db` 「完全启动」之后才启动。

### container_name

> 指定容器名称。默认将会使用 `项目名称_服务名称_序号` 这样的格式。
>
> ```shell
> container_name: docker-web-container
> ```
>
> > 注意: 指定容器名称后，该服务将无法进行扩展（scale），因为 Docker 不允许多个容器具有相同的名称。



