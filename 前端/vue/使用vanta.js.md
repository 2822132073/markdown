[官网](https://www.vantajs.com/)

vanta.js提供了13种动态效果,下面写如何在vue3中使用vanta





## 安装相关包

```shell
npm i three
npm i vanta
```

> 安装thress.js和vanta相关包

## 使用

```vue
<template>
  <el-container class="login" ref="Area">
  </el-container>
</template>

<script setup>
// vanta.js 相关设置
import * as THREE from 'three'
import CLOUDS from 'vanta/src/vanta.clouds'  //想要换特效就要换这个导入的js文件
import {onMounted, onBeforeUnmount, ref} from 'vue'

// 在需要写入的元素上ref上这个变量
const Area = ref(null)

let vantaEffect = null;
//在两个生命周期钩子内创建vantaEffect
onMounted(() => {
  vantaEffect = CLOUDS({
    el: Area.value.$el, 
    THREE: THREE,
    //如果需要改变样式，要写在这里
    //因为这里vantaEffect是没有setOptions这个方法的
    // 具体有哪些样式可以设置可以去官网的每个特效的右上角的Customize & Get Code 可以进行查看
    color: 0x16212a,
  })
})

onBeforeUnmount(() => {
  if (vantaEffect) {
    vantaEffect.destroy()
  }
})
</script>

<style lang="less" scoped>
.login {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;

}

</style>
```