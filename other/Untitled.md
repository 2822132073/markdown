```shell
#!/bin/bash
# 20201024

export wang_test='https://oapi.dingtalk.com/robot/send?access_token=be9338d1581803da4bd7a42fce694c657209171f095c3b8d88ac122afdc22d32'

function disk_message_dingding() {
    curl -s "$wang_test"       -H 'Content-Type: application/json' -d '{"msgtype": "text", "text": {"content": "'"$1"'"}}'
}

gcloud auth activate-service-account --key-file /root/json/k.json


a1=NONE
a2=NONE
a3=NONE
a4=NONE
a5=NONE

f1=NONE
f2=NONE
f3=NONE
f4=NONE
f5=NONE

m1=database21
m2=redis1

g1=redis2
g2=hosaax

for i in a1 a2 a3 a4 a5 f1 f2 f3 f4 f5 m1  m2 g1 g2
do
eval b=$(echo '$'"$i")
export ${i}_yes=`gsutil cp /root/uptestfile gs://${b}/ && echo yes || echo no`
done


# 桶分布
#global_num=`ansible global --list-hosts | grep -v h -c`

# 全局状态
ansible all -f8000 -a "cat /tmp/status" -o > /tmp/allstatus
cat /tmp/allstatus > /tmp/oldall
node_num=`cat /tmp/allstatus | grep CHANGED | wc -l`
up_speed=`cat /tmp/allstatus | awk '{print $(NF-6)}' | grep MB|cut -dM -f1 | awk '{sum+=$1} END {print sum/1000}'`
load_less=`cat /tmp/allstatus |grep CHANGED| awk '{if ($(NF-5)<6){print $1,$(NF-5)}}'`
plot_today=`cat /tmp/allstatus |grep CHANGED| awk '{sum+=$(NF-4)} END {print sum}'`
plot_num=`cat /tmp/allstatus |grep CHANGED| awk '{sum+=$(NF-3)} END {print sum}'`
tmp_num=`cat /tmp/allstatus |grep CHANGED| awk '{sum+=$(NF-2)} END {print sum}'`
disk_less=`cat /tmp/allstatus |grep CHANGED| awk '{if ($(NF-1)>=50){print $1,$(NF-1)}}'`
app_num=`cat /tmp/allstatus |grep CHANGED| awk '{if ($NF!=1){print $1,$NF}}'`
# 钱包
full_plot=`ansible all -f8000 -i /etc/ansible/fkj -mshell -a "cat /root/.chia/mainnet/log/debug.log |grep -v WA|grep eligible|tail -n1|awk '{print \\$(NF-1)}'" -o |awk '{sum+=$NF}END{print sum}'`
err_fullplot=`ansible all -i /etc/ansible/fkj -f300 -mshell -a "tail -n100 /root/.chia/mainnet/log/debug.log | grep eligible |grep -v 'Total 0' |wc -l" -o |awk '{if ($NF==0){print $1}}'`
recent_hit=`ansible all -f500 -i /etc/ansible/fkj -mshell -a "grep 'Found 1' /root/.chia/mainnet/log/debug.log" -o | grep CHANGED|awk '{print $8,$1}'|sort|tail -n10`
fullnode_num=`ansible all -i /etc/ansible/fkj --list-hosts | grep -v h -c`
fullnode_map=`ansible all -f8000  -i /etc/ansible/fkj -mshell -a "cat /root/.chia/mainnet/config/config.yaml | grep xch_target_address | head -n1" | grep xch_target_address | awk '{print $2}' | sort |uniq -c`
ansible all -i /etc/ansible/fkj -f500 -mshell -a "cat /root/.chia/mainnet/log/* | grep 'Found 1'" | grep Found >> /root/allxch
found_xch=`sort allxch |uniq -c | wc -l`


disk_message_dingding "全节点机器数量: $fullnode_num \n钱包分配: \n$fullnode_map \n找到的XCH数: $found_xch \n最近中奖信 息: \n$recent_hit \n全节点故障机器:\n$err_fullplot \n15分钟负载较低的机器:\n$load_less \n磁盘空间占用过高的机器:\n$disk_less \nP盘进程异常机器: \n$app_num \n全节点收割plot总数: $full_plot \n集群节点数: $node_num \n上传TD总带宽: $up_speed GB/s\n今日完成plot: $plot_today \n尚未上传plot文件数: $plot_num \n正在生成的plot文件数: $tmp_num \n桶状态:\na1 $a1 $a1_yes $a1_num\na2 $a2 $a2_yes $a2_num\na3 $a3 $a3_yes $a3_num\na4 $a4 $a4_yes $a4_num\na5 $a5 $a5_yes $a5_num\nf1 $f1 $f1_yes $f1_num\nf2 $f2 $f2_yes $f2_num\nf3 $f3 $f3_yes $f3_num\nf4 $f4 $f4_yes $f4_num\nf5 $f5 $f5_yes $f5_num\nm1 $m1 $m1_yes $m1_num\nm2 $m2 $m2_yes $m2_num\ng1 $g1 $g1_yes $g1_num \ng2 $g2 $g2_yes $g2_num"
```





```python
#!/usr/bin/env python3
import os
import sys
import time

gd_list = os.popen("""rclone listremotes""").read().splitlines()
gd_file = '/root/json/gd_file'
gd_used = '/root/json/gd_used'

try:
    kj_ip = sys.argv[1]
    gd_set = set()
    with open(gd_file) as gd_file_obj:
        for line in gd_file_obj:
            if int(line.strip().split()[1]) >= 700:
                gd_set.add(line.strip().split()[0])

    os.system('touch %s' % gd_used)
    gd_used_set = set()
    with open(gd_used) as gd_used_obj:
        for line in gd_used_obj:
            gd_used_set.add(line.strip().split()[0])

    addwait_gd = list(gd_set - gd_used_set)
    if len(addwait_gd) < 6:
        pass
    else:
        new_gd = addwait_gd[:6]
        # 发送rclone配置文件
        os.system('scp /root/.config/rclone/rclone.conf root@%s:/root/.config/rclone/' % kj_ip)
        # 挂载rclone
        for mount_dir in range(1, 7):
            raw_name = new_gd[mount_dir-1].strip()
            os.system('''ssh root@%s "rclone mount %s /mnt/%s --allow-other --vfs-cache-mode off --daemon --no-checksum --fast-list --transfers 128 --checkers 32 --vfs-read-chunk-size 1M --vfs-read-chunk-size-limit 0 --no-modtime"''' % (kj_ip, raw_name, mount_dir))
        time.sleep(3)
        # 记录rclone日志
        os.system('''ssh root@%s "ps -ef | grep rclone | grep -v grep | cut -b53- > /rclone"''' % kj_ip)
        # 修改主机名
        os.system("""ssh root@%s 'sed -i "s@main-34@$(hostname)@" /root/.chia/mainnet/config/config.yaml'""" % kj_ip)
        # 增加记录
        os.system("""echo '%s' >> /etc/ansible/fkj""" % kj_ip)
        # 保存状态
        os.system('''ssh root@%s "cat /rclone" > /root/json/state/%s''' % (kj_ip, kj_ip))
        # 启动
        os.system("""ssh root@%s 'source /root/chia-blockchain/venv/bin/activate && chia init && chia init -c /root/ca && chia configure --enable-upnp false && chia start farmer -r &>/dev/null &'""" % kj_ip)
        # 记录
        with open(gd_used, 'a') as gd_used_obj:
            for line in new_gd:
                gd_used_obj.write(line + '\n')
        exit(0)

except Exception as e:
    count = 0
    print('''重新加载所有Google Drive...''')
    os.system('''> {}'''.format(gd_file))
    for gd in gd_list:
        os.system('''printf "%s %s\n" {} `rclone size {} | head -n 1 | cut -d: -f2` >> {} &'''.format(gd, gd, gd_file))

    while True:
        if len(gd_list) == int(os.popen("""cat {} | wc -l""".format(gd_file)).read()):
            plot_num = os.popen("""cat %s | awk '{sum+=$2} END {print sum}'""" % gd_file).read().strip()
            print('''已重新加载所有Google Drive，共{}个Google Drive，合计{}个Plot文件'''.format(len(gd_list), plot_num))
            break

    gd_set = set()
    with open(gd_file) as gd_file:
        for line in gd_file:
            if int(line.strip().split()[1]) >= 700:
                gd_set.add(line.strip().split()[0])

    os.system('touch %s' % gd_used)
    gd_used_set = set()
    with open(gd_used) as gd_used:
        for line in gd_used:
            gd_used_set.add(line.strip().split()[0])

    addwait_gd = list(gd_set - gd_used_set)
    if len(addwait_gd) < 6:
        pass
    else:
        count = int(len(addwait_gd) / 6)
    print('剩余%s个Google Drive大于700个Plot，可新增%s台收割机，请准备好机器' % (len(addwait_gd), count))
    exit(0)
```