在使用http拉取lfs存储内容时,每拉取一个文件都需要输入一次密码,需要设置记住密码,这样只需要输入一次密码

```shell
git config --global credential.helper store
```

