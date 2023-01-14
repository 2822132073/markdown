想要连接k8s,必须先安装k8s的相关插件

> 可以点击系统管理-->节点管理-->`Configure Clouds`,按理来说,如果没有安装k8s插件,可以在这里安装k8s插件



# 获取相关证书文件

> 所有的内容差不多都可以在`$HOME/.kube/config`中找到,或者从其中的内容生成

```bash
grep certificate-authority-data $HOME/.kube/config  |awk  '{print $2}' |base64 -d  >/tmp/ca.crt
grep client-certificate-data $HOME/.kube/config  |awk  '{print $2}' |base64 -d  >/tmp/client.crt
grep client-key-data $HOME/.kube/config  |awk  '{print $2}' |base64 -d  >/tmp/client.key
openssl pkcs12 -export -out /tmp/client.pfx -inkey /tmp/client.key -in /tmp/client.crt -certfile /tmp/ca.crt
```

> 三条命令分别得到ca证书,客户端的证书与客户端的私钥,再生成一个pfx文件,这就是需要的所有文件了
>
> **在使用openssl生成client.pfx时,需要输入密码,这个密码要记好,等下需要使用**

# 进行相关设置

![image-20230112155350068](https://cdn.jsdelivr.net/gh/2822132073/image/202301121553975.png)

> 找不到地方的话,可以直接访问这个地址,ip为jenkins的ip,然后点击kubernetes,这样就可以出现相关的配置页面了

![image-20230112155545517](https://cdn.jsdelivr.net/gh/2822132073/image/202301121555450.png)

> 配置相关细节

![image-20230112155745241](https://cdn.jsdelivr.net/gh/2822132073/image/202301121557325.png)

> Kubernetes地址:`grep server /root/.kube/config  |awk '{print $2}'`可以获得
>
> Kubernetes服务证书key:之前生成的`ca.crt`的内容
>
> Kubernetess名称空间: 随便写一个

![image-20230112160028468](https://cdn.jsdelivr.net/gh/2822132073/image/202301121600781.png)

> 直接点击那个Jenkins

![image-20230112160208780](https://cdn.jsdelivr.net/gh/2822132073/image/202301121602779.png)

> 选择相应的类型,这里的证书就是,之前生成搞得`client.pfx`
>
> 这里到的黄色警告,是需要填之前生成client.prx时输入的密码的

![image-20230112160620064](https://cdn.jsdelivr.net/gh/2822132073/image/202301121606732.png)

> 这里的ID需要全局唯一,这里的描述需要能辨别出是哪个凭证

![image-20230112160924648](https://cdn.jsdelivr.net/gh/2822132073/image/202301121609877.png)

> 选择之前创建的凭证,然后测试连接

