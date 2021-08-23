# Keepalived搭建

**这一步是在前面Galera集群和HAproxy后的步骤**

**需要编译安装keepalived,不然可能脚本无法执行**

**脚本无法执行的问题解决办法:将vrrp_script 放在vrrp_instance前面**

**还是建议编译安装**

**需要修改网卡名,这里用的是eth0**

## 编写keepalived健康检查脚本

### 设置脚本路径并且创建

```shell
script_dir="/etc/keepalived/scripts"
mkdir -p $script_dir
```

### 创建健康检查脚本

```shell
cat >${script_dir}/check_haproxy.sh<<EOF
#!/bin/bash
if [ \$(ps -C haproxy --no-header | wc -l) -eq 0 ]; then
   systemctl start haproxy.service
   if [ \$(ps -C haproxy --no-header | wc -l) -eq 0 ]; then
      exit 1
   else
      exit 0
   fi
else
   exit 0
fi
EOF
```

### 授权

```shell
chmod +x ${script_dir}/check_haproxy.sh
```

### 查看脚本

```shell
cat ${script_dir}/check_haproxy.sh
```

## 创建第一个keepalived节点配置文件

### 备份文件

```shell
test -f /etc/keepalived/keepalived.conf.bak || cp /etc/keepalived/keepalived.conf /etc/keepalived/keepalived.conf.bak
```

### 创建配置文件

```shell
cat > /etc/keepalived/keepalived.conf << EOF
global_defs {
    router_id $HOSTNAME
    script_user root
    enable_script_security 
}
## 1. 创建：健康跟踪脚本对象
vrrp_script check_haproxy {
    script "${script_dir}/check_haproxy.sh"
    interval 3
    rise 1
    fall 1
    weight 15
}
## 2. 定义：Group故障转移组
vrrp_sync_group VG01 {
    group {
        HA-HAproxy
    }
    global_tracking
}
## 3. 定义：发送<免费ARPs广播>到<邻居>的<时间延迟>
garp_group {
    garp_interval 1
    gna_interval 1
    interfaces {
        eth0
    }
}
## 4. 定义：vrrp 实例对象
vrrp_instance HA-HAproxy {
    state BACKUP                   ## 指定：BACKUP角色
    priority 100                   ## 设置：初始优先级
                                   ## 　　　● 请确保：这个<MASTER 初始优先级值>减去<weight 权重调整值>，一定要小于<BACKUP 初始优先级值>
    interface eth0                 ## 设置：VRRP接口
    unicast_src_ip 192.168.10.31   ## 采用：单播方式，设置<源IP地址>
    unicast_peer {                 ##                 设置<目标IP地址>
        192.168.10.32
        192.168.10.33
    }
    use_vmac
    vmac_xmit_base
    advert_int 2                   ## 设置：<VRRP心跳包>的<发送周期>，单位为秒(s)
    nopreempt                      ## 设为：非抢占模式 
    authentication {
        auth_type PASS
        auth_pass 1A123456B1
    }
    virtual_router_id 234          ## 注意：取值范围 1~255，广播模式下，广播域中不能存在相同的<virtual_router_id>，当单播模式下，则无碍
    virtual_ipaddress {
        192.168.10.36/24 dev eth0  ## 设置：VIP
    }
    track_interface {
        eth0
    }
    track_script {
        check_haproxy
    }
}
EOF
```

### 删除配置文件的空行

```shell
sed -i -r -e 's/\s+#+.*$//' -e '/^\s*($)/d' /etc/keepalived/keepalived.conf
```

### 启动并且让其开机自启

```shell
systemctl restart keepalived.service && systemctl enable keepalived.service && systemctl status keepalived
```

### 开放防火墙

```shell
## ★ 配置防火墙：开放VRRP协议
firewall-cmd --zone=public --add-protocol=vrrp --permanent
firewall-cmd --reload
```

## 创建第二个Keepalived节点

### 备份文件

```shell
test -f /etc/keepalived/keepalived.conf.bak || cp /etc/keepalived/keepalived.conf /etc/keepalived/keepalived.conf.bak
```

### 创建配置文件

```shell
cat > /etc/keepalived/keepalived.conf << EOF
global_defs {
    router_id $HOSTNAME
    script_user root
    enable_script_security 
}
## 1. 创建：健康跟踪脚本对象
vrrp_script check_haproxy {
    script "${script_dir}/check_haproxy.sh"
    interval 3
    rise 1
    fall 1
    weight 15
}
## 2. 定义：Group故障转移组
vrrp_sync_group VG01 {
    group {
        HA-HAproxy
    }
    global_tracking
}
## 3. 定义：发送<免费ARPs广播>到<邻居>的<时间延迟>
garp_group {
    garp_interval 1
    gna_interval 1
    interfaces {
        eth0
    }
}
## 4. 定义：vrrp 实例对象
vrrp_instance HA-HAproxy {
    state BACKUP                   ## 指定：BACKUP角色
    priority 100                   ## 设置：初始优先级
                                   ## 　　　● 请确保：这个<MASTER 初始优先级值>减去<weight 权重调整值>，一定要小于<BACKUP 初始优先级值>
    interface eth0                 ## 设置：VRRP接口
    unicast_src_ip 192.168.10.32   ## 采用：单播方式，设置<源IP地址>
    unicast_peer {                 ##                 设置<目标IP地址>
        192.168.10.31
        192.168.10.33
    }
    use_vmac
    vmac_xmit_base
    advert_int 2                   ## 设置：<VRRP心跳包>的<发送周期>，单位为秒(s)
    nopreempt                      ## 设为：非抢占模式 
    authentication {
        auth_type PASS
        auth_pass 1A123456B1
    }
    virtual_router_id 234          ## 注意：取值范围 1~255，广播模式下，广播域中不能存在相同的<virtual_router_id>，当单播模式下，则无碍
    virtual_ipaddress {
        192.168.10.36/24 dev eth0  ## 设置：VIP
    }
    track_interface {
        eth0
    }
    track_script {
        check_haproxy
    }
}
EOF
```

### 删除配置文件的注释

```shell
sed -i -r -e 's/\s+#+.*$//' -e '/^\s*($)/d' /etc/keepalived/keepalived.conf
```

### 启动并且让其开机自启

```shell
systemctl restart keepalived.service && systemctl enable keepalived.service && systemctl status keepalived
```

### 开放防火墙

```shell
## ★ 配置防火墙：开放VRRP协议
firewall-cmd --zone=public --add-protocol=vrrp --permanent
firewall-cmd --reload
```



## 创建第三个Keepalived节点

### 备份文件

```shell
test -f /etc/keepalived/keepalived.conf.bak || cp /etc/keepalived/keepalived.conf /etc/keepalived/keepalived.conf.bak
```

### 创建配置文件

```shell
cat > /etc/keepalived/keepalived.conf << EOF
global_defs {
    router_id $HOSTNAME
    script_user root
    enable_script_security 
}
## 1. 创建：健康跟踪脚本对象
vrrp_script check_haproxy {
    script "${script_dir}/check_haproxy.sh"
    interval 3
    rise 1
    fall 1
    weight 15
}
## 2. 定义：Group故障转移组
vrrp_sync_group VG01 {
    group {
        HA-HAproxy
    }
    global_tracking
}
## 3. 定义：发送<免费ARPs广播>到<邻居>的<时间延迟>
garp_group {
    garp_interval 1
    gna_interval 1
    interfaces {
        eth0
    }
}
## 4. 定义：vrrp 实例对象
vrrp_instance HA-HAproxy {
    state BACKUP                   ## 指定：BACKUP角色
    priority 100                   ## 设置：初始优先级
                                   ## 　　　● 请确保：这个<MASTER 初始优先级值>减去<weight 权重调整值>，一定要小于<BACKUP 初始优先级值>
    interface eth0                 ## 设置：VRRP接口
    unicast_src_ip 192.168.10.33   ## 采用：单播方式，设置<源IP地址>
    unicast_peer {                 ##                 设置<目标IP地址>
        192.168.10.31
        192.168.10.32
    }
    use_vmac
    vmac_xmit_base
    advert_int 2                   ## 设置：<VRRP心跳包>的<发送周期>，单位为秒(s)
    nopreempt                      ## 设为：非抢占模式 
    authentication {
        auth_type PASS
        auth_pass 1A123456B1
    }
    virtual_router_id 234          ## 注意：取值范围 1~255，广播模式下，广播域中不能存在相同的<virtual_router_id>，当单播模式下，则无碍
    virtual_ipaddress {
        192.168.10.36/24 dev eth0  ## 设置：VIP
    }
    track_interface {
        eth0
    }
    track_script {
        check_haproxy
    }
}
EOF
```

### 删除配置文件的注释

```shell
sed -i -r -e 's/\s+#+.*$//' -e '/^\s*($)/d' /etc/keepalived/keepalived.conf
```

### 启动并且让其开机自启

```shell
systemctl restart keepalived.service && systemctl enable keepalived.service && systemctl status keepalived
```

### 开放防火墙

```shell
## ★ 配置防火墙：开放VRRP协议
firewall-cmd --zone=public --add-protocol=vrrp --permanent
firewall-cmd --reload
```

