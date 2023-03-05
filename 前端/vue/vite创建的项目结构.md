```
D:.
│   .gitignore
│   index.html
│   package.json
│   README.md
│   vite.config.js
├───.vscode
│       extensions.json
├───public
│       vite.svg
└───src
    │   App.vue
    │   main.js
    │   style.css
    ├───assets
    │       vue.svg

    └───components
            HelloWorld.vue

```

> `index.html`:在其中写根元素,这个文件一般不需要改动
>
> `src/App.vue`:这个为根组件,后期写好其他组件在其中进行拼装
>
> `src/main.js`:完成将根组件挂载到根元素的工作
>
> `src/components`:以后写的组件都写在这个地方
>
> `public`:静态资源目录
