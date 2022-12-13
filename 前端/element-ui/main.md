# 设置el-menu鼠标悬浮后的颜色和选中之后的颜色

![image-20221201141655141](https://cdn.jsdelivr.net/gh/2822132073/image/202212011416469.png)

```less
.el-menu-item:hover {
   // item鼠标悬浮后背景的颜色
  outline: 0 !important;
    // item鼠标悬浮后字体的颜色
  color: #409EFF !important;
  //background: aqua;
}

.el-menu-item.is-active {
  // item被选中中字体的颜色
  color: #fff !important;
  // item被选中中背景的颜色
  background: #409EFF !important;
}
// 这个的作用还没发现
.el-submenu__title:focus, .el-submenu__title:hover {
  //outline: 0 !important;
  color: #409EFF !important;
  background: none !important;
}

```

# Elmessage样式失效,从底部出来

![image-20221205173557771](https://cdn.jsdelivr.net/gh/2822132073/image/202212051735917.png)

> 在`main.js`中添加
>
> ```js
> import 'element-plus/dist/index.css'
> ```
>
> 
