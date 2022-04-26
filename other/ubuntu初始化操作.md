## 允许Root远程登陆

```bash
sed -ir  '/^#PermitRootLogin/a PermitRootLogin yes' sshd_config
```

