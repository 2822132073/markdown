# p7b格式证书转换为pem格式

## 脚本

> 后面第一个参数后面接.p7b格式文件,转换完成的文件的格式为源文件名加`.crt.bak`

```shell
#!/bin/bash
p7b_file="$1"
p7b_filename=$(echo ${p7b_file} |sed -r 's#(.*).p7b#\1#g')
usage ()
{
    echo "Usage:sh $0 p7b_file"
    exit 0
}
[ $# -ne 1 ] && usage
fold -w 64 ${p7b_file} > temp.p7b
openssl pkcs7 -print_certs -in temp.p7b |grep -Ev '^\s*$|subject|issuer' > ${p7b_filename}.crt.bak
```

## 证书转换网站

```
https://decoder.link/converter
https://www.chinassl.net/ssltools
```

