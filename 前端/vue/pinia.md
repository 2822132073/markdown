

[Pinia进阶：优雅的setup（函数式）写法+封装到你的企业项目 - 腾讯云开发者社区-腾讯云 (tencent.com)](https://cloud.tencent.com/developer/article/1945421)

[一文搞懂pinia状态管理（保姆级教程） - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/533233367)

[Pinia | The intuitive store for Vue.js (vuejs.org)](https://pinia.vuejs.org/zh/)

[pinia - 旺仔米苏的专栏 - 掘金 (juejin.cn)](https://juejin.cn/column/7087955772181020679)

# 三大概念

在了解三大概念之前,需要了解什么是store,按照官方的解释:

> Store (如 Pinia) 是一个保存状态和业务逻辑的实体，它并不与你的组件树绑定。换句话说，**它承载着全局状态**。它有点像一个永远存在的组件，每个组件都可以读取和写入它。它有**三个概念**，[state](https://pinia.vuejs.org/zh/core-concepts/state.html)、[getter](https://pinia.vuejs.org/zh/core-concepts/getters.html) 和 [action](https://pinia.vuejs.org/zh/core-concepts/actions.html)，我们可以假设这些概念相当于组件中的 `data`、 `computed` 和 `methods`。

可以这样理解的:store是实际存储数据的地方,其中state中存储着数据,因为state中存储着最原始的数据,而我们想要从这些数据过滤出一部分我们自己需要的数据的话,就需要使用到getter,getter可以对state中的数据进行处理,而action则是,可以对state中的数据进行修改

# 在vue项目中使用pinia

> 这里是使用的vite创建的项目,只需要修改`main.js`就可以了

```js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.mount('#app')
```

# 创建store

> 你可以定义任意多的 store，但为了让使用 pinia 的益处最大化(比如允许构建工具自动进行代码分割以及 TypeScript 推断)，**你应该在不同的文件中去定义 store**。所以在src目录下创建一个stores的目录,用来存放store

![image-20230308202044799](https://cdn.jsdelivr.net/gh/2822132073/image/202303082020297.png)

可以在stores中创建多个store,然后从其他的文件进行引用

## 选项式的写法

```js
// 引入defineStore
import {defineStore} from 'pinia'


// 你可以对 `defineStore()` 的返回值进行任意命名，但最好使用 store 的名字，同时以 `use` 开头且以 `Store` 结尾。(比如 `useUserStore`，`useCartStore`，`useProductStore`),这个规则最好遵守
// 第一个参数是你的应用中 Store 的唯一 ID。
// 
export const useTestStore = defineStore('test', {

    // 官方在这里建议使用箭头函数
    state: () => {
        return {
            count: 5
        }
    },
    // 这里可以写很多个这样的函数,可以使用箭头函数,也可以使用function关键字进行定义
    getters: {
        //double: (state) => state.count * 2
        // double: function (state) {
        //     return state.count * 2
        // }
        double(state) {
            return state.count * 2
        }
    },
    //和上面一样,上面可以定义的,这里也可以
    actions: {
        increment() {
            this.count++
        },
        deduce() {
            this.count--

        },

    }
})
```

## setup写法

> 这里的defineStore的第二个参数为一个箭头函数

```js
import {defineStore} from "pinia";
import {computed, ref} from "vue";

export const test2 = defineStore('test2', () => {
        const count = ref(0) //这相当于上面的state

        function increment() {  //相当于上面的action,可以对数据进行修改,可以定义多个函数
            count.value--
        }
    
        function deduce() {
            count.value--
        }

        const double = computed(() => {  //相当于上面的getter
            return count * 2
        })
        return {count, increment , reduce , double}  //在定义完成之后,需要将数据进行返回
    }
)
```

> 上面的代码表示创建一个id为test2的store,包含一个名为count的state,和一个名为increment和一个名为deduce的action,还有一个double的getter

# 使用

## store的定义

```js
import {defineStore} from "pinia";
import {computed, ref} from "vue";

export const test2 = defineStore('test2', () => {
        const count = ref()

        function increment() {
            count.value++
        }

        function deduce() {
            count.value--
        }

        const double = computed(() => {
            return count.value * 2
        })
        return {count, increment, deduce, double}
    }
)
```

> 通过setup的语法进行定义,在使用时,我觉得更加流畅

## store访问state数据

> 在我看来pinia像这样使用,非常的符合逻辑,用起来非常顺畅

```vue
<template>
  <!--直接使用store进行对state进行引用-->
  <h3>{{ test.count }}</h3>
  <!--使用store直接对getter进行引用,不需要额外的操作-->
  <h3>double: {{ test.double }}</h3>
  <!--使用store直接调用action-->
  <button type="button" @click="test.increment(1)">点我加一</button>
  <button type="button" @click="test.deduce(1)">点我减一</button>

</template>

<script setup>
import {useTestStore} from "../stores/Test.js";

const test = useTestStore()

</script>

<style scoped>

</style>
```

## 使用解构的方式进行访问数据

> 如果state**如果是普通数据类型,例如字符,数字等,那么在解构之后,就不会是响应式的变量**,如果state是**引用类型**的话,那么结构出来的state是**响应式**,如果需要将普通数据类型变为响应式变量,需要使用`storeToRefs`进行转换

```vue
<template>
  <!--
    这里使用使用结构出来的变量,这里的count不是响应式的,下面的按钮无法对这个count进行改变
  -->
  <h3>{{ count }}</h3>

  <h3>double: {{ double }}</h3>
  <!--和之前在store调用一样的效果-->
  <button type="button" @click="increment(1)">点我加一</button>
  <button type="button" @click="deduce(1)">点我减一</button>


</template>

<script setup>
import {useTestStore} from "../stores/Test.js";

const test = useTestStore()
const {count, double, increment, deduce} = test

</script>

<style scoped>

</style>
```

### 使用**storeToRefs**

> 注意,在使用**storeToRefs**时,需要将**getter**从中解构出来,不然,**getter**不会是响应式的,而**action**,无法从中解构出

```vue
<template>
  <!--
    这里使用使用结构出来的变量
  -->
  <h3>{{ count }}</h3>

  <h3>double: {{ double }}</h3>
  <!--和之前在store调用一样的效果-->
  <button type="button" @click="increment(1)">点我加一</button>
  <button type="button" @click="deduce(1)">点我减一</button>


</template>

<script setup>
import {useTestStore} from "../stores/Test.js";
import {storeToRefs} from "pinia";


const test = useTestStore()
// 这是错误的写法,action无法从storeToRefs解构出,写了之后,得出的结果为undefine
// const {count, double, increment, deduce} = storeToRefs(test)
const {count, double} = storeToRefs(test)
const {increment, deduce} = test


</script>

<style scoped>

</style>
```

### 使用computed给普通变量响应式

> 上面提到,当应用的变量是简单数据类型,在解构时需要使用`storeToRefs`,可以使用`computed`将其包裹,将其返回,在使用时,直接使用这个变量(isLogin),这个变量就是响应式的

```js
import {defineStore} from 'pinia'
import {computed, ref} from "vue"

export const useLoginStore = defineStore('login', () => {
    const login = ref(false);

    const isLogin = computed(() => {
        return login
    })

    function setLogin(bool) {
        login.value = bool
    }

    return {isLogin, setLogin}
})
```

