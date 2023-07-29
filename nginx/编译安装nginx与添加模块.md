# 下载安装包

[官网](http://nginx.org/)

[下载页面](http://nginx.org/en/download.html)



# 需要的依赖

[博客](https://blog.csdn.net/weixin_56273432/article/details/124112515)

## Centos

```bash
yum install -y gcc-c++ pcre pcre-devel zlib zlib-devel openssl openssl-devel gd gd-devel

```

## Ubuntu

```bash
apt-get -y install build-essential libpcre3 libpcre3-dev zlib1g-dev openssl libssl-dev libxml2 libxml2-dev libxslt-dev  libgd-dev libgeoip-dev
```

# 安装

配置文件位置：/etc/nginx/nginx.conf

根目录位置：/usr/share/nginx/html

## 编译

```bash
root@template:~# wget http://nginx.org/download/nginx-1.20.2.tar.gz
root@template:~# tar xf nginx-1.20.2.tar.gz nginx-1.20.2/
root@template:~# cd nginx-1.20.2
root@template:~# mkdir /var/lib/nginx -p
root@template:~/nginx-1.20.2#./configure --prefix=/usr/share/nginx \
            --conf-path=/etc/nginx/nginx.conf \
            --http-log-path=/var/log/nginx/access.log \
            --error-log-path=/var/log/nginx/error.log \
            --lock-path=/var/lock/nginx.lock \
            --pid-path=/run/nginx.pid \
            --modules-path=/usr/lib/nginx/modules \
            --http-client-body-temp-path=/var/lib/nginx/body \
            --http-fastcgi-temp-path=/var/lib/nginx/fastcgi \
            --http-proxy-temp-path=/var/lib/nginx/proxy \
            --http-scgi-temp-path=/var/lib/nginx/scgi \
            --http-uwsgi-temp-path=/var/lib/nginx/uwsgi \
            --with-debug \
            --with-pcre-jit \
            --with-http_ssl_module \
            --with-http_stub_status_module \
            --with-http_realip_module \
            --with-http_auth_request_module \
            --with-http_v2_module \
            --with-http_dav_module \
            --with-http_slice_module \
            --with-threads \
            --with-http_addition_module \
            --with-http_geoip_module=dynamic \
            --with-http_gunzip_module \
            --with-http_gzip_static_module\
            --with-http_image_filter_module=dynamic \
            --with-http_sub_module \
            --with-http_xslt_module=dynamic \
            --with-stream=dynamic \
            --with-stream_ssl_module \
            --with-stream_ssl_preread_module \
            --with-mail=dynamic \
            --with-mail_ssl_module	
root@template:~/nginx-1.20.2# make && make install
root@template:~/nginx-1.20.2# ln -s /usr/share/nginx/sbin/nginx /usr/sbin/nginx
```



## 编写systemd启动脚本

```ini
root@template:/var/lib/nginx# cat >/lib/systemd/system/nginx.service<<EOF
[Unit]
Description=A high performance web server and a reverse proxy server
Documentation=man:nginx(8)
After=network.target

[Service]
Type=forking
PIDFile=/run/nginx.pid
ExecStartPre=/usr/sbin/nginx -t -q -g 'daemon on; master_process on;'
ExecStart=/usr/sbin/nginx -g 'daemon on; master_process on;'
ExecReload=/usr/sbin/nginx -g 'daemon on; master_process on;' -s reload
ExecStop=-/sbin/start-stop-daemon --quiet --stop --retry QUIT/5 --pidfile /run/nginx.pid
ExecStartPost=/bin/sleep 1
TimeoutStopSec=5
KillMode=mixed

[Install]
WantedBy=multi-user.target
EOF
```

> `start-stop-daemon`是系统自带的命令,用于关闭daemon
>
> 该配置文件是使用apt安装nginx复制出来的
>
> ExecStartPost是为了在启动nginx后,systemd等一秒再去检查pid文件,以免nginx还没起动,systemd就去检查pid文件

# 添加模块

## 过程

1. 通过现有nginx命令拿到编译参数和版本号
2. 去官网下载源码包
3. 使用原有编译参数加上想要添加模块
4. 编译
5. 在编译文件中找到新的nginx
6. 替换原来的nginx文件



![image-20230101143134981](https://cdn.jsdelivr.net/gh/2822132073/image/202301011431793.png)

### **创建第三方源码目录**

```shell
mkdir /root/third_module/
```

### **下载第三方模块源码**

> 这里以 `echo-nginx-module`为例子
>
> [源码地址](https://github.com/openresty/echo-nginx-module/tags)

```shell
cd third_module
wget https://github.com/openresty/echo-nginx-module/archive/refs/tags/v0.62.tar.gz
tar xf v0.62.tar.gz
mv echo-nginx-module-0.62/ echo-nginx-module
```

### **下载对应的源码解压后,进入目录**

```shell
root@template:~# cd nginx-1.20.2/
```

### **原来的参数加上想要添加的模块的源码路径,生成Makefile**

```shell
root@template:~/nginx-1.20.2#./configure --prefix=/usr/share/nginx \
            --conf-path=/etc/nginx/nginx.conf \
            --http-log-path=/var/log/nginx/access.log \
            --error-log-path=/var/log/nginx/error.log \
            --lock-path=/var/lock/nginx.lock \
            --pid-path=/run/nginx.pid \
            --modules-path=/usr/lib/nginx/modules \
            --http-client-body-temp-path=/var/lib/nginx/body \
            --http-fastcgi-temp-path=/var/lib/nginx/fastcgi \
            --http-proxy-temp-path=/var/lib/nginx/proxy \
            --http-scgi-temp-path=/var/lib/nginx/scgi \
            --http-uwsgi-temp-path=/var/lib/nginx/uwsgi \
            --with-debug \
            --with-pcre-jit \
            --with-http_ssl_module \
            --with-http_stub_status_module \
            --with-http_realip_module \
            --with-http_auth_request_module \
            --with-http_v2_module \
            --with-http_dav_module \
            --with-http_slice_module \
            --with-threads \
            --with-http_addition_module \
            --with-http_geoip_module=dynamic \
            --with-http_gunzip_module \
            --with-http_gzip_static_module\
            --with-http_image_filter_module=dynamic \
            --with-http_sub_module \
            --with-http_xslt_module=dynamic \
            --with-stream=dynamic \
            --with-stream_ssl_module \
            --with-stream_ssl_preread_module \
            --with-mail=dynamic \
            --with-mail_ssl_module \
            --add-module=/root/third_module/echo-nginx-module
```

> 这里`--add-module`指定的就是我们解压的源码目录

### 进行编译

> 这里只执行make,不执行make install,不然会覆盖原来的文件

```shell
make
```

```shell
root@template:~/nginx-1.20.2# ll
...
drwxr-xr-x 4 root root   4096 Jan  1 22:49 objs/
.....
```

> 编译之后会生成一个objs文件,里面存放这编译完成的文件

### 替换文件

> 这里的主要过程就是,将原来的文件备份,再将现有的文件拷贝过去,现有的文件在上述的objs文件夹下
