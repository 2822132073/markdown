# Docker

[TOC]

## 数据卷

### 创建数据卷

> 创建数据卷使用`docker volume create`命令,后面接数据卷名
>
> ```shell
> [root@manager ~]# docker volume create test
> test
> [root@manager ~]# docker volume ls
> DRIVER              VOLUME NAME
> local               test
> ```
>
> 而存储在`test`卷中的数据数据,存放在`/var/lib/docker/volumes/test/_data`中
>
> *`docker run --rm -v test:/test/ busybox echo "1">/test/1`无法写入文件,不知道为啥*
>
> *`/test/1.txt`*
>
> ```shell
> [root@manager ~]# docker run --rm -v test:/test/ busybox touch /test/1.txt
> [root@manager ~]# ls /var/lib/docker/volumes/test/_data/1.txt 
> /var/lib/docker/volumes/test/_data/1.txt
> ```

### 挂载数据卷

> 挂载数据卷在`docker run`中使用`-v`来指定挂载的数据卷
>
> ```shell
> docker run -v [volume_name]:container_path
> ```
>
> 可以指定主机路径挂载进去,也可以指定数据卷挂载进去
>
> ```shell
> [root@manager ~]# docker run --rm -v /test:/test busybox ls /test/1 
> /test/1
> ```
>
> 如果不指定,数据卷,会创建一个匿名卷
>
> ```
> [root@manager ~]# docker run -v /test busybox ls /test
> [root@manager ~]# docker volume ls
> DRIVER              VOLUME NAME
> local               07fdc6fd2db9dad4ef9c62b5546a05dda0a196a7300094d90f158029c3714507
> ```
>
> 可以先创建数据卷挂载进行,也可以直接写,如果不存在会自动创建`volume`
>
> ```shell
> [root@manager ~]# docker run -v test:/test busybox ls /test
> [root@manager ~]# docker volume ls
> DRIVER              VOLUME NAME
> .
> local               test
> ```

### 查看数据卷

> 使用`docker inspect `指定容器名或者容器ID,可以查看容器信息,可以通过`-f`指定`go`的`template`语法进行显示
>
> ```shell
> [root@manager ~]# docker inspect -f"{{range .Mounts}}{{.Name}}{{end}}" 8b28224cdb4a
> 07fdc6fd2db9dad4ef9c62b5546a05dda0a196a7300094d90f158029c3714507
> ```

### 删除数据卷

> 如果想要删除一个数据卷,需要先将其从容器上拔下来,再将其删除,不然会报错
>
> ```shell
> [root@manager ~]# docker volume rm test 
> Error response from daemon: remove test: volume is in use - [369efe3e0599800598593b7a6b8a60b6e7d3445ae7aa23886f2e13b7edc10c84]
> ```
>
> 停止一个容器
>
> ```shel
> [root@manager ~]# docker stop test
> test
> ```
>
> 再删除卷
>
> ```shell
> [root@manager ~]# docker volume rm test 
> test
> ```

### 备份数据卷

> 备份数据卷需要开启两个容器,一个正在运行的容器,一个备份的容器
>
> 例如:
>
> ```shell
> docker run --rm -dti --name test -v test:/test busybox sh
> docker exec test touch /test/1.txt
> ```
>
> 将`test`目录备份
>
> ```shell
> [root@manager /backup]# docker run --rm --volumes-from test  -v /backup:/backup busybox tar -czf /backup/backup.tar.gz /test
> tar: removing leading '/' from member names
> ```
>
> *下面的提示是正常的,`tar`默认使用绝路径备份,可以使用`-P`来使用绝对路径,但是在`busybox`的`tar`*好像是阉割版,无法使用`-P`
>
> 删除所有数据卷和容器
>
> ```shell
> [root@manager ~]# docker rm -f $(docker ps -qa)
> 0bb82facf5b7
> [root@manager ~]# docker volume prune 
> WARNING! This will remove all local volumes not used by at least one container.
> Are you sure you want to continue? [y/N] y
> Deleted Volumes:
> test
> 
> Total reclaimed space: 0B
> 
> ```
>
> 恢复数据
>
> ```shell
> [root@manager ~]# docker exec test tar xf /backup/backup.tar.gz 
> [root@manager ~]# docker exec test ls /test/1.txt
> /test/1.txt
> ```
>
> 

## Docker-Compose部署wordpress

### 先用Docker部署一遍

> 部署`wordpress`需要`Mysql`数据库,需要先安装数据库,并创建`wordpress`库,这个需求可以使用`Mysql`官方提供的镜像中的变量实现,在部署`wordpress`的需要指定后端数据的`User`,`DB_Name`,`Host`,后前两个可以实现,后面的主机,可以使用`--link`实现,将`Mysql`映射到`wordpress`容器的`hosts`文件中,通过主机名访问.

### 部署Mysql容器

> mysql容器中有许多官方提供官方提供的变量
>
> - `MYSQL_ROOT_PASSWORD`:指定`root`用户的密码
> - `MYSQL_USER`:新创建的用户
> - `MYSQL_PASSWORD`:新创建用户的密码
> - `MYSQL_DATABASE`:如果指定了上面的两个值,那么新创建的用户将会被授予这个**数据库**的最高权限

```shell
docker run --rm -d --name mysql -e MYSQL_ROOT_PASSWORD=123456 -e MYSQL_USER=wordpress -e MYSQL_PASSWORD=123456 -e MYSQL_DATABASE=wordpress mysql:5.7 
```

### 部署Wordpress

> `wordpress`使用的数据库,可以在启动时通过变量的形式写入容器,也可以后期在`web`页面写入
>
> - `WORDPRESS_DB_HOST`:wordpress使用的mysql的主机
> - `WORDPRESS_DB_USER`:wordpress使用的mysql的用户
> - `WORDPRESS_DB_PASSWORD`:wordpress使用的mysql的密码
> - `WORDPRESS_DB_NAME`:wordpress使用的mysql的名称

```shell
docker run --name wordpress -d --link mysql:db --rm -e WORDPRESS_DB_HOST=db -e WORDPRESS_DB_USER=wordpress -e WORDPRESS_DB_PASSWORD=123456 -e WORDPRESS_DB_NAME=wordpress -p80:80 wordpress
```

### 使用docker-compose部署

> 有了上面的基础,再写docker-compose文件就好写很多,对比来看就容易很多,需要注意的是,在`docker-compose`中的`service`中定义过`volume`后,需要在最后定义一遍,不然会报错

```shell
version: '3.1'
services:
  wordpress:
    image: wordpress
    restart: always
    ports:
      - 82:80
    environment:
      WORDPRESS_DB_HOST: db
      WORDPRESS_DB_USER: wordpress
      WORDPRESS_DB_PASSWORD: "123456"
      WORDPRESS_DB_NAME: wordpress
    volumes:
      - wordpress:/var/www/html
  db:
    image: mysql:5.7
    restart: always
    environment:
      MYSQL_DATABASE: wordpress
      MYSQL_USER: wordpress
      MYSQL_PASSWORD: "123456"
      MYSQL_ROOT_PASSWORD: "123456"
    volumes:
      - db:/var/lib/mysql
volumes:
  wordpress:
  db:
```

