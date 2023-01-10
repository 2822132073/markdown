# 安装`Clash`

[TOC]



> 系统环境`Centos7.5`
> 内核版本`3.10.0-862.el7.x86_64`
## 安装`clash`
[下载地址](https://github.com/Dreamacro/clash/releases)

### 安装`clash`

> 如果无法在`Linux`上进行下载,下载到win再将其传入Linux
```shell
gunzip clash-linux-amd64-*.gz  
sudo mv clash-linux-amd64-* /usr/local/bin/clash
sudo chmod +x /usr/local/bin/clash
clash

```
> 在执行最后一步后,clash会在`/root/.config`生成两个文件
```shell
/root/.config/
└── clash
    ├── config.yaml
    └── Country.mmdb
```


### 创建配置文件目录,并复制相关文件

```shell
mkdir /etc/clash
cp /root/.config/clash/* /etc/clash/
```

### 获取配置文件

```shell
wget https://openit.ml/Clash.yaml -O /etc/clash/config.yaml
```

> 这个文件是一个免费的翻墙网站提供的配置文件,想要进行相关修改,参照下面的配置文件说明

> 在我翻墙的网址,复制订阅链接,在链接最后加上`&flag=clash`,就可以复制到相应的`yaml`文件,请求出来的文件应该是一行文件,在浏览器中按`F12`进入调试模式,会找到的`Network`,刷新,会有一个文件,我们的文件的内容的那个文件会有一个preview选项,其中就有格式化好的`yaml`文件


> 如果需要web页面管理`clash`,需要将`config.yaml`中的`external-controller`设置为`host:port`而不是使用`127.0.0.1`,

```yaml
mixed-port: 7890  #本地监听用来代理的端口
allow-lan: true #允许lan进行连接代理
bind-address: '*' #代理监听地址,"*"为所有地址
mode: rule
secret: "fsl2000."  #web页面时的密码
log-level: info
external-controller: '0.0.0.0:9090'  # RESTful API端口,可以用来进行web管理
```



### 使用`systemd`管理`clash`

```shell
cat >/usr/lib/systemd/system/clash.service<<EOF
[Unit]
Description=clash
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/local/bin/clash -d /etc/clash/
Restart=on-failure
RestartSec=3s
LimitNOFILE=999999
[Install]
WantedBy=multi-user.target
EOF
```

## 配置`clash`实现翻墙
### 启动`clash`
```shell
systemctl daemon-reload 
systemctl start clash
systemctl enable clash
```
> 根据配置日志,可以看到一个`proxy listening at`,将这个端口设置为代理
### 在Linux主机上设置代理

> 想在登录时就自动设置,就在`$HOME/.bash_profile`下将其添加进去

```shell
IP=192.1
export http_proxy=$IP:7890
export https_proxy=$IP:7890
```

## `web`页面管理`clash`

>  访问`http://clash.razord.top/#/proxies`
>
>  如果之前登录过,需要修改clash的地址

```
cat >/lib/systemd/system/clash.service<<EOF
[Unit]
Description=clash
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/local/bin/clash -d /etc/clash/
Restart=on-failure
RestartSec=3s
LimitNOFILE=999999
[Install]
WantedBy=multi-user.target
EOF
```

