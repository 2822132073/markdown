# cron.daily下的任务执行时间

## `/etc/anacrontab`

```
# /etc/anacrontab: configuration file for anacron

# See anacron(8) and anacrontab(5) for details.

SHELL=/bin/sh
PATH=/sbin:/bin:/usr/sbin:/usr/bin
MAILTO=root
# 随机延迟时间,在强制延迟时间过完后,再进行随机延迟,45的意思是随机延迟0-45分钟
RANDOM_DELAY=45
# 指定任务会在3-22点之间执行
START_HOURS_RANGE=3-22

#period in days   delay in minutes   job-identifier   command
1	5	cron.daily		nice run-parts /etc/cron.daily
7	25	cron.weekly		nice run-parts /etc/cron.weekly
@monthly 45	cron.monthly		nice run-parts /etc/cron.monthly

```

> 下面的四行:
>
> - 第一行: 每多少天执行一次(可以使用宏定义:`@daily`:1,`@weekly`:7 )
> - 第二行: 强制延迟时间
> - 第三行: 指定运行任务,在日志文件中的名称(默认配置没有)
> - 第四行:`nice`指定运行命令的优先级,  `run-part`是一个命令.意思是执行目录下所有脚本

## `cron.daily`执行顺序

> 1. 读取` /var/spool/anacron/cron.daily` 文件中 anacron 上一次执行的时间。
> 2. 和当前时间比较，如果两个时间的差值超过 1 天，就执行 `cron.daily` 工作。 (这个第一行指定)
> 3. 只能在 03：00-22：00 执行这个工作。(这个在`START_HOURS_RANGE`指定)
> 4. 执行工作时强制延迟时间为 5 分钟，再随机延迟 0～45 分钟。 (这个在第二行指定)
> 5. 使用 nice 命令指定默认优先级，使用 run-parts 脚本执行 /etc/cron.daily 目录中所有的可执行文件。