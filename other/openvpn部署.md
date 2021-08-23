# OpenVPN部署

| 系统版本 | centos7.5                   |
| -------- | --------------------------- |
| 软件版本 | openvpn2.4.11 easy-rsa3.0.8 |
|          |                             |

[TOC]





## 签发证书

*需要安装`easy-rsa`*

```shell
yum install -y easy-rsa openvpn
```

复制easy-rsa相关文件

```
cp -r /usr/share/easy-rsa/ /etc/openvpn/easy-rsa
```

删除相关链接文件

```
cd /etc/openvpn/easy-rsa/
\rm 3 3.0
```

找出变量样本文件,并改名

```
cd 3.0.8/
find / -type f -name "vars.example" | xargs -i cp {} . && mv vars.example vars
```

## 创建新的`PKI`和`CA`

*注意在`/etc/openvpn/easy-rsa/3.0.8`下*

```
./easyrsa init-pki  #创建空的pki
```

创建新的`CA`,并不使用密码

```
./easyrsa build-ca nopass   #一路回车

Note: using Easy-RSA configuration from: /etc/openvpn/easy-rsa/3.0.8/vars
Using SSL: openssl OpenSSL 1.0.2k-fips  26 Jan 2017
Generating RSA private key, 2048 bit long modulus
................................................+++
...................+++
e is 65537 (0x10001)
You are about to be asked to enter information that will be incorporated
into your certificate request.
What you are about to enter is what is called a Distinguished Name or a DN.
There are quite a few fields but you can leave some blank
For some fields there will be a default value,
If you enter '.', the field will be left blank.
-----
Common Name (eg: your user, host, or server name) [Easy-RSA CA]: 回车

CA creation complete and you may now import and sign cert requests.
Your new CA certificate file for publishing is at:
/etc/openvpn/easy-rsa/3.0.8/pki/ca.crt

```

## 签发服务端证书

### 创建服务端证书

```
[root@node02 /etc/openvpn/easy-rsa/3.0.8]# ./easyrsa gen-req server nopass #有一个回车

Note: using Easy-RSA configuration from: /etc/openvpn/easy-rsa/3.0.8/vars
Using SSL: openssl OpenSSL 1.0.2k-fips  26 Jan 2017
Generating a 2048 bit RSA private key
......+++
...........+++
writing new private key to '/etc/openvpn/easy-rsa/3.0.8/pki/easy-rsa-18004.BqQDlW/tmp.dMAAXh'
-----
You are about to be asked to enter information that will be incorporated
into your certificate request.
What you are about to enter is what is called a Distinguished Name or a DN.
There are quite a few fields but you can leave some blank
For some fields there will be a default value,
If you enter '.', the field will be left blank.
-----
Common Name (eg: your user, host, or server name) [server]: #回车

Keypair and certificate request completed. Your files are:
req: /etc/openvpn/easy-rsa/3.0.8/pki/reqs/server.req
key: /etc/openvpn/easy-rsa/3.0.8/pki/private/server.key

```

###  签发服务端证书

```
[root@node02 /etc/openvpn/easy-rsa/3.0.8]#  ./easyrsa sign server server  #有一个yes

Note: using Easy-RSA configuration from: /etc/openvpn/easy-rsa/3.0.8/vars
Using SSL: openssl OpenSSL 1.0.2k-fips  26 Jan 2017


You are about to sign the following certificate.
Please check over the details shown below for accuracy. Note that this request
has not been cryptographically verified. Please be sure it came from a trusted
source or that you have verified the request checksum with the sender.

Request subject, to be signed as a server certificate for 825 days:

subject=
    commonName                = server


Type the word 'yes' to continue, or any other input to abort.
  Confirm request details: yes
Using configuration from /etc/openvpn/easy-rsa/3.0.8/pki/easy-rsa-18097.3UDRbo/tmp.S6pWj6
Check that the request matches the signature
Signature ok
The Subject's Distinguished Name is as follows
commonName            :ASN.1 12:'server'
Certificate is to be certified until Sep 27 06:50:41 2023 GMT (825 days)

Write out database with 1 new entries
Data Base Updated

Certificate created at: /etc/openvpn/easy-rsa/3.0.8/pki/issued/server.crt
```

## 创建 Diffie-Hellman展开目录

```
./easyrsa gen-dh
```

## 创建客户端证书展开目录

### 创建`client`文件展开目录

```
cp -r /usr/share/easy-rsa/ /etc/openvpn/client/easy-rsa
cd /etc/openvpn/client/easy-rsa/
\rm 3 3.0
cd 3.0.8
find / -type f -name "vars.example" | xargs -i cp {} . && mv vars.example vars
```

### 创建证书展开目录

*`/etc/openvpn/client/easy-rsa/3.0.8`下*

```
cd /etc/openvpn/client/easy-rsa/3.0.8
./easyrsa init-pki
```

### 创建客户端证书

```
./easyrsa gen-req fsl nopass
```

### 签发证书(在ca的文件夹内导入证书,使用server对clienrt端进行签发证书)

```
cd /etc/openvpn/easy-rsa/3.0.8/
./easyrsa import-req /etc/openvpn/client/easy-rsa/3.0.8/pki/reqs/fsl.req fsl
./easyrsa sign client fsl
```

## 整理证书

### 服务端证书

```
mkdir /etc/openvpn/certs
cp /etc/openvpn/easy-rsa/3.0.8/pki/dh.pem /etc/openvpn/certs
cp /etc/openvpn/easy-rsa/3.0.8/pki/ca.crt /etc/openvpn/certs
cp /etc/openvpn/easy-rsa/3.0.8/pki/issued/server.crt /etc/openvpn/certs
cp /etc/openvpn/easy-rsa/3.0.8/pki/private/server.key /etc/openvpn/certs
```

### 客户端证书

```
mkdir /etc/openvpn/client/fsl -p
cp /etc/openvpn/easy-rsa/3.0.8/pki/ca.crt /etc/openvpn/client/fsl/
cp /etc/openvpn/client/easy-rsa/3.0.8/pki/private/fsl.key /etc/openvpn/client/fsl/
/etc/openvpn/easy-rsa/3.0.8/pki/issued/fsl.crt /etc/openvpn/client/fsl/
```



## 服务端配置

### 开启内核转发(想要访问服务端的其他网段,需要开启)

```
echo "net.ipv4.ip_forward=1" >>/etc/sysctl.conf
sysctl -p
```

### 服务端配置文件

```
local 10.0.0.93  #监听的本地IP
port 1194   #监听的端口
proto tcp   #使用的协议,有tcp/udp
dev tun    #虚拟的设备类型,有tun/tap两种类型

ca /etc/openvpn/certs/ca.crt  #ca证书的位置
cert /etc/openvpn/certs/server.crt  #服务端证书位置
key /etc/openvpn/certs/server.key  #服务端私匙
dh /etc/openvpn/certs/dh.pem  #dh文件

ifconfig-pool-persist /etc/openvpn/ipp.txt #记录着客户端对应的IP

server 172.16.0.0 255.255.255.0 #定义服务端与客户端通信的网段
push "route 192.168.91.0 255.255.255.0" #向客户端推送的路由信息，假如客户端的IP地址为10.8.0.2，要访问192.168.10.0网段的话，使用这条命令就可以了。
push "redirect-gateway def1 bypass-dhcp"
client-to-client #允许客户端与客户端通信
   
keepalive 20 120
comp-lzo #启用允许数据压缩，客户端配置文件也需要有这项。
#duplicate-cn

user openvpn
group openvpn

persist-key                        
persist-tun
status openvpn-status.log    
log-append  openvpn.log     
verb 1
mute 20
```

### 启动openvpn

```
systemctl start openvpn@server
```



*想要让客户端访问服务器那段的网段,需要添加`iptables`规则,例如,我想让客户端可以访问`192.168.91.0/24`网段,不只是需要在配置文件中声明路由,还需要在openvpn服务器上添加这样一条iptables规则*

```
iptables -t nat -A POSTROUTING -s 172.16.0.0/24 -o ens32 -j MASQUERADE
```

*这里的`ens32`为`192.168.91.0/24`网段的网卡*

如果不做以上操作,将无法访问到除服务器机器以外的网段

## 客户端安装部署

### 安装openvpn

```
yum install -y openvpn
```

### 传输客户端证书

*将服务端的客户端需要的证书传输到客户端的`/etc/openvpn`*

```
scp /etc/openvpn/client/fsl/* manager:/etc/openvpn
```



## 客户端配置

```
client
dev tun
proto tcp
remote 10.0.0.93 1194 #远端的IP与端口
resolv-retry infinite
nobind
persist-key
persist-tun
ca ca.crt
cert fsl.crt  #这里的fsl要与上面的证书相对应
key fsl.key 
remote-cert-tls server
cipher AES-256-CBC
verb 3
compress 'lzo'
```

### 启动openvpn客户端

```
openvpn --config client.conf 
```



## 创建openvpn新用户

### 创建一个新的`PKI`(这步骤可以省略)

```
cd /etc/openvpn/client/easy-rsa/3.0.8/
./easyrsa init-pki
```

### 创建一个无密码用户client(创建有密码的用户,只需要不加`nopass`,然后交互式的输入密码就可以)

```
./easyrsa gen-req client nopass #这里的client可以换成其它字符
```

### 签发客户端证书

```
cd /etc/openvpn/easy-rsa/3.0.8/
./easyrsa import-req /etc/openvpn/client/easy-rsa/3.0.8/pki/reqs/client.req client #这里的client与上面的client对应
./easyrsa sign client client ##第一个为证书类型,第二个为文件基名,第二个可以修改,第一个不可以修改
```

### 整理客户端证书

```
mkdir /etc/openvpn/client/client
cp /etc/openvpn/easy-rsa/3.0.8/pki/ca.crt /etc/openvpn/client/client/
cp /etc/openvpn/easy-rsa/3.0.8/pki/issued/client.crt /etc/openvpn/client/client/
cp /etc/openvpn/client/easy-rsa/3.0.8/pki/private/client.key /etc/openvpn/client/client/
```

