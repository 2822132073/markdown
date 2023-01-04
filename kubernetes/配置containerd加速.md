# 说明

在使用k8s的过程中,会用到很多镜像,大部分都在国外的镜像站,一般的措施无非两种,科学上网和加速站,现在k8s采用的oci是containerd,所以需要配置一下containerd

[github配置说明](https://github.com/containerd/containerd/blob/main/docs/hosts.md)

> 下面的配置会在crictl拉取镜像时默认使用,而ctr命令行工具指定才可以使用
>
> ```bash
> ctr images pull --hosts-dir "/etc/containerd/certs.d" myregistry.io:5000/image_name:tag
> ```



```shell
sed -i "s#config_path\ \=\ \"\"#config_path\ \=\ \"/etc/containerd/certs.d\"#g" /etc/containerd/config.toml
# 将[plugins."io.containerd.grpc.v1.cri".registry]下的config_path指向/etc/containerd/certs.d
mkdir /etc/containerd/certs.d/docker.io -pv
# 在/etc/containerd/certs.d下创建一个和想要加速网站同名的文件夹
cat > /etc/containerd/certs.d/docker.io/hosts.toml << EOF
server = "https://docker.io"  #指定想要加速的地址
[host."https://hub-mirror.c.163.com"]  #指定加速的地址
  capabilities = ["pull", "resolve"]   # 指定可以什么样的功能经过该网站
EOF
#在该文件夹下创建一个hosts.toml文件,
```

> 还可以在 `[host."https://hub-mirror.c.163.com"]`下添加配置
>
> - skip_verify = true
>
> 还有很多选项,可以在github页面查看