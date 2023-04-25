```yml
version: '3.8'
services:
  mysql:
    hostname: mysql
    environment:
      MYSQL_ROOT_PASSWORD: "123456789"
    image: bitnami/mysql:5.7
    volumes:
    - type: bind
    # 需要自己创建,而且需要给予777权限,或者给容器相关的权限
      source: /root/nacos/mysql
      target: /bitnami/mysql/data
      bind:
        create_host_path: true
    - type: bind
      source: /root/nacos/mysql-schema.sql
      # 需要初始化nacos所需要的数据库
      target: /docker-entrypoint-initdb.d/nacos-mysql.sql
      bind:
        create_host_path: true
    configs:
    # 需要关闭ssl,可以在nacos中设置,但是太麻烦了,所以在mysql中设置
      - source: mysql_custom_config
        target: /opt/bitnami/mysql/conf/my_custom.cnf
  nacos1:
    hostname: nacos1
    environment:
      MODE: cluster
      MYSQL_SERVICE_DB_NAME: nacos
      MYSQL_SERVICE_HOST: "mysql"
      MYSQL_SERVICE_PASSWORD: "123456789"
      MYSQL_SERVICE_PORT: "3306"
      MYSQL_SERVICE_USER: root
      NACOS_APPLICATION_PORT: "8848"
      # 这里的两边不能添加引号
      NACOS_SERVERS: nacos1:8848 nacos2:8848 nacos3:8848
      PREFER_HOST_MODE: hostname 
      SPRING_DATASOURCE_PLATFORM: mysql
    image: nacos/nacos-server:1.4.1
    ports:
    - mode: ingress
      target: 8848
      published: "8857"
      protocol: tcp
  nacos2:
    hostname: nacos2
    environment:
      MODE: cluster
      MYSQL_SERVICE_DB_NAME: nacos
      MYSQL_SERVICE_HOST: "mysql"
      MYSQL_SERVICE_PASSWORD: "123456789"
      MYSQL_SERVICE_PORT: "3306"
      MYSQL_SERVICE_USER: root
      NACOS_APPLICATION_PORT: "8848"
      NACOS_SERVERS: nacos1:8848 nacos2:8848 nacos3:8848
      PREFER_HOST_MODE: hostname 
      SPRING_DATASOURCE_PLATFORM: mysql
    image: nacos/nacos-server:1.4.1
    ports:
    - mode: ingress
      target: 8848
      published: "8858"
      protocol: tcp
  nacos3:
    hostname: nacos3
    environment:
      MODE: cluster
      MYSQL_SERVICE_DB_NAME: nacos
      MYSQL_SERVICE_HOST: "mysql"
      MYSQL_SERVICE_PASSWORD: "123456789"
      MYSQL_SERVICE_PORT: "3306"
      MYSQL_SERVICE_USER: root
      NACOS_APPLICATION_PORT: "8848"
      NACOS_SERVERS: nacos1:8848 nacos2:8848 nacos3:8848
      PREFER_HOST_MODE: hostname 
      SPRING_DATASOURCE_PLATFORM: mysql
    image: nacos/nacos-server:1.4.1
    ports:
    - mode: ingress
      target: 8848
      published: "8859"
      protocol: tcp
configs:
  mysql_custom_config:
    file: /root/nacos/my_custom.cnf
```

> 注意,在写的时候,需要设置hostname属性,和service的名字一致,而且必须符合域名的命令规范,不然会出现,三个节点,每个节点都只能看到自己,这是应为无法识别其他的节点(因为错误的域名,无法通过校验)