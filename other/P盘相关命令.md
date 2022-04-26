## 生成项目

```shell
wget http://hernryhu.top:65535/autocreate.py 
python3 autocreate.py 
```

> 后面加账号,例如:
>
> python3 autocreate.py  info@eklavyamodelgajadara.com

## 生成项目

```
wget http://hernryhu.top:65535/autocreate.py 
python3 autocreate.py 


```



echo 'Laibo2021' | sudo passwd --stdin root; sudo sed -i 's@PermitRootLogin no@PermitRootLogin yes@' /etc/ssh/sshd_config; sudo sed -i 's@PasswordAuthentication no@PasswordAuthentication yes@' /etc/ssh/sshd_config; sudo systemctl restart sshd

## 接验证码平台

>https://sms-activate.ru/cn/getNumber
>
>401387616@qq.com  AyCP2sEF@!f7!Hn

## rclone文件路径

> C:\Users\admin\AppData\Roaming\rclone\

## Java gitee地址

> https://gitee.com/whLaibo/auto-click-google

## 关闭Windows Denfer(需管理员权限)

> reg add “HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\Windows Defender” /v “DisableAntiSpyware” /d 1 /t REG_DWORD /f

## 换盘命令

```
ansible bucket1 -mshell -f30 -a"ps -ef | egrep 'gcs|rclone' | grep -v grep |awk '{print\$2}'|xargs kill -9"
tail -4 /root/gd_config/rclone-1.conf
ansible bucket1 -f 30 -m copy -a"src=/root/gd_config/rclone-1.conf dest=/root/.config/rclone/rclone.conf backup=yes"
ansible bucket1 -f 30 -m shell -a"rclone listremotes|wc -l" -o
ansible bucket1 -mshell -a"nohup python3 -u /root/gcs_upload_redis.py > 1.log &"
bash /root/toredis.sh 777
ansible bucket1 -f 30 -mshell -a"ps -ef|grep gcs |grep -v grep|wc -l" -o
sleep 10
ansible bucket1 -mshell -a"dstat -n 1 2 | tail -n 1"

ansible bucket2 -mshell -f30 -a"ps -ef | egrep 'gcs|rclone' | grep -v grep |awk '{print\$2}'|xargs kill -9"
tail -4 /root/gd_config/rclone-2.conf
ansible bucket2 -f 30 -m copy -a"src=/root/gd_config/rclone-2.conf dest=/root/.config/rclone/rclone.conf backup=yes"
ansible bucket2 -f 30 -m shell -a"rclone listremotes |wc -l" -o
ansible bucket2 -f 30 -mshell -a"nohup python3 -u /root/gcs_upload_redis_888.py > 1.log &"
bash /root/toredis.sh 888
ansible bucket2 -f 30 -mshell -a"ps -ef|grep gcs |grep -v grep|wc -l" -o
sleep 10
ansible bucket2 -mshell -a"dstat -n 1 2 | tail -n 1"



ansible bucket3 -mshell -f30 -a"ps -ef | egrep 'gcs|rclone' | grep -v grep |awk '{print\$2}'|xargs kill -9"
tail -4 /root/gd_config/rclone-3.conf
ansible bucket3 -f 30 -m copy -a"src=/root/gd_config/rclone-3.conf dest=/root/.config/rclone/rclone.conf backup=yes"
ansible bucket3 -f 30 -m shell -a"rclone listremotes |wc -l" -o
ansible bucket3 -f 30 -mshell -a"nohup python3 -u /root/gcs_upload_redis_999.py > 1.log &"
bash /root/toredis.sh 999
ansible bucket3 -f 30 -mshell -a"ps -ef|grep gcs |grep -v grep|wc -l" -o
sleep 10
ansible bucket3 -mshell -a"dstat -n 1 2 | tail -n 1"

ansible bucket5 -mshell -f30 -a"ps -ef | egrep 'gcs|rclone' | grep -v grep |awk '{print\$2}'|xargs kill -9"
tail -4 /root/gd_config/rclone-5.conf
ansible bucket5 -f 30 -m copy -a"src=/root/gd_config/rclone-5.conf dest=/root/.config/rclone/rclone.conf backup=yes"
ansible bucket5 -f 30 -m shell -a"rclone listremotes |wc -l" -o
ansible bucket5 -f 30 -mshell -a"nohup python3 -u /root/gcs_upload_redis_bucket5.py > 1.log &"
bash /root/toredis.sh 555
ansible bucket5 -f 30 -mshell -a"ps -ef|grep gcs |grep -v grep|wc -l" -o
sleep 10
ansible bucket5  -f 30 -mshell -a"dstat -n 1 2 | tail -n 1"
```



```
ansible bucket1 -f 10 -mshell -a"dstat -n 1 2 | tail -n 1"
ansible bucket2  -f 10 -mshell -a"dstat -n 1 2 | tail -n 1"
ansible bucket3  -f 10 -mshell -a"dstat -n 1 2 | tail -n 1"
ansible bucket5  -f 10 -mshell -a"dstat -n 1 2 | tail -n 1"

ansible bucket1 -mshell -a"nohup python3 -u /root/gcs_upload_redis.py > 1.log &"
ansible bucket2 -f 30 -mshell -a"nohup python3 -u /root/gcs_upload_redis_888.py > 1.log &"
ansible bucket3 -f 30 -mshell -a"nohup python3 -u /root/gcs_upload_redis_999.py > 1.log &"
ansible bucket5 -f 30 -mshell -a"nohup python3 -u /root/gcs_upload_redis_bucket5.py > 1.log &"
```







ACCBD 

BDBBC

ABACC

BCCCD

DCDCA

BCDCC

BBACC

ABACD





ps -ef|grep Swar-Chia-Plot-Manager |grep -v grep |awk '{print\$2}'|kill -9 

[all:vars]
ansible_ssh_port=22
ansible_ssh_user=root
ansible_ssh_pass=Laibo2021
