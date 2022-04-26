# VIM相关设置





[TOC]



## vim设置实现修改后自动备份

> 在`/etc/vimrc`下添加一下内容

```shell
function Bak()
  set backup
  " 开启自动备份
  set backupdir=/tmp
  " 设置备份文件的备份目录
  let &bex = '-' . strftime("%m-%d-%H:%M:%S") . '.bak'
  " 设置backupext(bex),这里的.是用来连接字符串的,这里的&是用来声明设置的是一个选项的值而不是一个变量
endfunction


:au BufWritePre *.sh  call Bak()
" BufWritePre 指的是在写入之前
" *.sh 指的是,所有以sh结尾的文件都会被匹配
" call Bak() 调用上面的函数
```



## vim修改`tab`为四个空格

```shell
set expandtab
" 使用空格将tab代替
set tabstop = 2
" 使用2个空格代表一个tab
```

## 修改特殊字符显示

```shell
set list
set listchars=tab:>-,eol:$,trail:-
" 设置显示一些特殊的字符
" eol为行尾符
" tab在设置tab转换为空格后不生效
" trail为行尾空格
```



## 突出当前行列显示

```shell
set cursorline
set cul          'cursorline的缩写形式'
set cursorcolumn
set cuc          'cursorcolumn的缩写形式'
```

## 启用鼠标

```shell
set mouse=a
```

## 禁止自动注释

> 有时候在复制文件时(<Ctrl>+V/右键复制),有一行有#或者<tab>下面都会有,设置之后就不会有了

```
set paste
```

