# Vite的优点

1. 快速的冷启动，不需要等待打包
2. 即时的热模块更新，真正的按需编译，不用等待整个项目编译完成 

# 前置条件

1. 在使用vite之前需要安装nodejs,并且安装yarn

```cmd
npm install --global yarn  #安装
yarn --version #查看版本
```

> 全局安装yarn

2. 直接使用时,会出现问题,需要进行一些配置
```cmd
[###############] 15/15文件名、目录名或卷标语法不正确。
error Command failed.
Exit code: 1
Command: D:\nodejs\node_global\bin\create-vite
Directory: D:\webstromProject\TuitionProject\01_helloVue\useTools
```

   ```
   yarn config set global-folder "D:\yarn\global"
   yarn config set cache-folder "D:\yarn\cache"
   ```

> 这两个目录需要自己进行创建

   

# 进行创建

```cmd
yarn create vite my-vue-app --template vue # 使用vite创建一个vue的手脚架
PS D:\webstromProject\TuitionProject\01_helloVue\useTools> yarn create vite my-vue-app --template vue
yarn create v1.22.19
[1/4] Resolving packages...
[2/4] Fetching packages...
[3/4] Linking dependencies...
[4/4] Building fresh packages...
success Installed "create-vite@4.1.0" with binaries:
      - create-vite
      - cva
[##] 2/2
Scaffolding project in D:\webstromProject\TuitionProject\01_helloVue\useTools\my-vue-app...

Done. Now run:

  cd my-vue-app
  yarn
  yarn dev

Done in 0.63s.

```

> 可以使用下面给出的命令进行启动

> 在使用之前,需要下载相关依赖使用`yarn install`