# reactive和ref

> 这两个都是在vue中创造响应式变量的方法,一般ref用于制作一些基本数据类型的响应式数据,而reactive一般用来做一些复杂的响应式数据,需要传入一个对象

## 实例

```vue
<script setup>
import {reactive, ref} from "vue";

const count = ref(0)
const user = reactive({name: "", age: 0, sex: ""})
const changeUser = () => {
  user.name = "fsl"
  user.age = 20
  user.sex = "男"
}
</script>

<template>
  <el-button @click="count++">count: {{ count }}</el-button>
  <el-button @click="changeUser">changeUser</el-button>
  <p>{{ user }}</p>
</template>

<style>
</style>

```

# 从reactive变量中复制

在vue3中,有时候使用`reactive`或者`ref`制作响应式的数据,在进行`computed`之后的数据,还可以对原始数据进行修改,这个时候,我就想对数据进行拷贝一份,可以使用

```js
JSON.parse(JSON.stringify(Object)) // 这样可以将对象先字符化,再将其解析,就可以得到一个新的对象  
```

# computed无法监听数组变化

对象：
向响应式对象中添加一个属性，并确保这个新属性同样是响应式的，且触发视图更新。它必须用于向响应式对象上添加新属性，因为 Vue 无法探测普通的新增属性 (比如 this.myObject.newProperty = ‘hi’)

数组：
Vue 不能检测以下数组的变动：
当你利用索引直接设置一个数组项时，例如：vm.items[indexOfItem] = newValue
当你修改数组的长度时，例如：vm.items.length = newLength

为了解决第一类问题，以下两种方式都可以实现和 vm.items[indexOfItem] = newValue 相同的效果，同时也将在响应式系统内触发状态更新：
```js
// Vue.set 好像在vue3中这种方法不生效了
Vue.set(vm.items, indexOfItem, newValue)

// Array.prototype.splice
vm.items.splice(indexOfItem, 1, newValue)
```

