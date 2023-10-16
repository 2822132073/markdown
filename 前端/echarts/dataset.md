[数据集官网说明](https://echarts.apache.org/handbook/zh/concepts/dataset)



`数据集（dataset）`是专门用来管理数据的组件。虽然每个系列都可以在 `series.data` 中设置数据，但是从 ECharts4 支持数据集开始，更推荐使用数据集来管理数据。因为这样，数据可以被多个组件复用，也方便进行 “数据和其他配置” 分离的配置风格。毕竟，在运行时，数据是最常改变的，而其他配置大多并不会改变。

## dataset与传统的数据管理方式对比

下面是一个类目上有多个数据的展示，可以看到，这样管理数据非常不方便，如果需要对数据进行修改，需要修改多个地方，所以使用数据集的方式

```js
option = {
  xAxis: {
    type: 'category',
    data: ['Matcha Latte', 'Milk Tea', 'Cheese Cocoa', 'Walnut Brownie']
  },
  yAxis: {},
  series: [
    {
      type: 'bar',
      name: '2015',
      data: [89.3, 92.1, 94.4, 85.4]
    },
    {
      type: 'bar',
      name: '2016',
      data: [95.8, 89.4, 91.2, 76.9]
    },
    {
      type: 'bar',
      name: '2017',
      data: [97.7, 83.1, 92.5, 78.1]
    }
  ]
};
```

![image-20230906225801669](https://cdn.jsdelivr.net/gh/2822132073/image/202309062258332.png)



```js
option = {
  legend: {},
  tooltip: {},
  dataset: {
    // 提供一份数据。
    source: [
      ['product', '2015', '2016', '2017'],
      ['Matcha Latte', 43.3, 85.8, 93.7],
      ['Milk Tea', 83.1, 73.4, 55.1],
      ['Cheese Cocoa', 86.4, 65.2, 82.5],
      ['Walnut Brownie', 72.4, 53.9, 39.1]
    ]
  },
  // 声明一个 X 轴，类目轴（category）。默认情况下，类目轴对应到 dataset 第一列，也就是第一个维度
  // 也就是 ['product', 'Matcha Latte', 'Milk Tea', 'Cheese Cocoa'] 这列
  xAxis: { type: 'category' },
  // 声明一个 Y 轴，数值轴。
  yAxis: { type: "value"},
  // 声明多个 bar 系列，默认情况下，每个系列会自动对应到 dataset 的每一列，会依次采用各个维度
  series: [{ type: 'bar' }, { type: 'bar' }, { type: 'bar' }]
};
```

```sql
['product', '2015', '2016', '2017']
['Matcha Latte', 43.3, 85.8, 93.7]
['Milk Tea', 83.1, 73.4, 55.1]
['Cheese Cocoa', 86.4, 65.2, 82.5]
['Walnut Brownie', 72.4, 53.9, 39.1]
  把这个想象成一个二维表，第一行可以当成一个字段名的集合，下面都是记录，这样理解起来好一点，上面说的类目轴，就去取一列当成x轴，可以把它当成主键，可以唯一的代表一行数据
  下面写了三个系列，也就是展示每个记录的一项数据，不指定默认是往后顺移的，也可以进行指定，可以在encode中进行指定
```

![image-20230906231931039](https://cdn.jsdelivr.net/gh/2822132073/image/202309062319571.png)

下面是具体指明了x轴和y轴的数据来源，可以不用指定x轴，只需要指定指定y轴，当然，都不指定也是可以的

```js
option = {
  legend: {},
  tooltip: {},
  dataset: {
    // 提供一份数据。
    source: [
      ['product', '2015', '2016', '2017'],
      ['Matcha Latte', 43.3, 85.8, 93.7],
      ['Milk Tea', 83.1, 73.4, 55.1],
      ['Cheese Cocoa', 86.4, 65.2, 82.5],
      ['Walnut Brownie', 72.4, 53.9, 39.1]
    ]
  },
  // 声明一个 X 轴，类目轴（category）。默认情况下，类目轴对应到 dataset 第一列。
  xAxis: { type: 'category' },
  // 声明一个 Y 轴，数值轴。
  yAxis: { type: "value"},
  // 声明多个 bar 系列，默认情况下，每个系列会自动对应到 dataset 的每一列。
  series: [
    { 
      // 相比于上面，指定了x轴的字段名和y轴的数
      // 相当于获取2015那一列上的数据
      type: 'bar' ,
      encode: {
         x: "product",
         y: '2015'
      }
    }, { 
      type: 'bar',
      encode: {
         x: "product",
         y: '2016'
      }
      
    }, { 
      type: 'bar',
      encode: {
         x: "product",
         y: '2017'
      }
    }]
};
```

## 对象数据方式

这个方式不需要是直接明示了各个维度，更加好理解

```js
option = {
  legend: {},
  tooltip: {},
  dataset: {
    // 用 dimensions 指定了维度的顺序。直角坐标系中，如果 X 轴 type 为 category，
    // 默认把第一个维度映射到 X 轴上，后面维度映射到 Y 轴上。
    // 如果不指定 dimensions，也可以通过指定 series.encode
    // 完成映射，参见后文。
    dimensions: ['product', '2015', '2016', '2017'],
    source: [
      { product: 'Matcha Latte', '2015': 43.3, '2016': 85.8, '2017': 93.7 },
      { product: 'Milk Tea', '2015': 83.1, '2016': 73.4, '2017': 55.1 },
      { product: 'Cheese Cocoa', '2015': 86.4, '2016': 65.2, '2017': 82.5 },
      { product: 'Walnut Brownie', '2015': 72.4, '2016': 53.9, '2017': 39.1 }
    ]
  },
  xAxis: { type: 'category' },
  yAxis: {},
  series: [{ type: 'bar' }, { type: 'bar' }, { type: 'bar' }]
};
```







## 把数据集（dataset）的行或列映射为系列（series）

```js
option = {
  legend: {},
  tooltip: {},
  dataset: {
    source: [
      ['product', '2012', '2013', '2014', '2015'],
      ['Matcha Latte', 41.1, 30.4, 65.1, 53.3],
      ['Milk Tea', 86.5, 92.1, 85.7, 83.1],
      ['Cheese Cocoa', 24.1, 67.2, 79.5, 86.4]
    ]
  },
  // 声明两个x轴，并指定所在网格的id
  xAxis: [
    { type: 'category', gridIndex: 0 },
    { type: 'category', gridIndex: 1 }
  ],
  // 声明两个y轴，并指定所在网格的id
  yAxis: [{ gridIndex: 0 }, { gridIndex: 1 }],
  // 设置网格的一些属性
  grid: [{ bottom: '55%' }, { top: '55%' }],
  series: [
    // 这几个系列会出现在第一个直角坐标系中，每个系列对应到 dataset 的每一行。
    // 默认不指定x和y轴的位置，那么默认为index为0
    { type: 'bar', seriesLayoutBy: 'row' },
    { type: 'bar', seriesLayoutBy: 'row' },
    { type: 'bar', seriesLayoutBy: 'row' },
    // 这几个系列会出现在第二个直角坐标系中，每个系列对应到 dataset 的每一列。
    { type: 'bar', xAxisIndex: 1, yAxisIndex: 1 },
    { type: 'bar', xAxisIndex: 1, yAxisIndex: 1 },
    { type: 'bar', xAxisIndex: 1, yAxisIndex: 1 },
    { type: 'bar', xAxisIndex: 1, yAxisIndex: 1 }
  ]
};
```

![image-20230906235801881](https://cdn.jsdelivr.net/gh/2822132073/image/202309062358223.png)

```js
['product', '2012', '2013', '2014', '2015'],
['Matcha Latte', 41.1, 30.4, 65.1, 53.3],
['Milk Tea', 86.5, 92.1, 85.7, 83.1],
['Cheese Cocoa', 24.1, 67.2, 79.5, 86.4]
以上的数据按照 seriesLayoutBy: 'row'，设置之后，就是把第一列当做字段名，而不是第一行
'product'  'Matcha Latte'  'Milk Tea' 'Cheese Cocoa'
'2012'		41.1			86.5		24.1
'2013'		30.4			92.1		67.2
'2014'		65.1			85.7		79.5
'2015'		53.3			83.1		86.4
```

## 数据到图形的映射（series.encode）

在有的时候，数据的类目不是在第一列（行），所以我们需要手动指定

```js
var option = {
  dataset: {
    source: [
      ['score', 'amount', 'product'],
      [89.3, 58212, 'Matcha Latte'],
      [57.1, 78254, 'Milk Tea'],
      [74.4, 41032, 'Cheese Cocoa'],
      [50.1, 12755, 'Cheese Brownie'],
      [89.7, 20145, 'Matcha Cocoa'],
      [68.1, 79146, 'Tea'],
      [19.6, 91852, 'Orange Juice'],
      [10.6, 101852, 'Lemon Juice'],
      [32.7, 20112, 'Walnut Brownie']
    ]
  },
  xAxis: {},
  yAxis: { type: 'category' },
  series: [
    {
      type: 'bar',
      encode: {
        // 将 "amount" 列映射到 X 轴。
        x: 'amount',
        // 将 "product" 列映射到 Y 轴。
        y: 'product'
      }
    }
  ]
};
```

![image-20230907112709562](https://cdn.jsdelivr.net/gh/2822132073/image/202309071127881.png)

想要将上面数据的**score**也展示上去，需要加上一个数据轴，也就是需要两个x轴

```js
var option = {
  dataset: {
    source: [
      ['score', 'amount', 'product'],
      [89.3, 58212, 'Matcha Latte'],
      [57.1, 78254, 'Milk Tea'],
      [74.4, 41032, 'Cheese Cocoa'],
      [50.1, 12755, 'Cheese Brownie'],
      [89.7, 20145, 'Matcha Cocoa'],
      [68.1, 79146, 'Tea'],
      [19.6, 91852, 'Orange Juice'],
      [10.6, 101852, 'Lemon Juice'],
      [32.7, 20112, 'Walnut Brownie']
    ]
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross'
    }
  },
  // 这里声明了两个x轴，都没有声明type，应为y轴为类目轴，所以这个的默认为数据轴
  xAxis: [{},{}],
  yAxis: { type: 'category' },
  series: [
    {
      type: 'bar',
      // 指定数据显示在那个x轴
      xAxisIndex: 0,
      encode: {
        // 将 "amount" 列映射到 X 轴。
        x: 'amount',
        // 将 "product" 列映射到 Y 轴。
        y: 'product'
      }
    },{
      type: 'bar',
      xAxisIndex: 1,
      encode: {
        x: 'score',
        // 将 "product" 列映射到 Y 轴。
        y: 'product'
      }
    }
  ]
};
```

![image-20230907113246722](https://cdn.jsdelivr.net/gh/2822132073/image/202309071132693.png)

encode有需要选项，每个图形都不一样，需要根据不同的图形来设置

```js
// 在任何坐标系和系列中，都支持：
encode: {
  // 使用 “名为 product 的维度” 和 “名为 score 的维度” 的值在 tooltip 中显示
  tooltip: ['product', 'score']
  // 使用 “维度 1” 和 “维度 3” 的维度名连起来作为系列名。（有时候名字比较长，这可以避免在 series.name 重复输入这些名字）
  seriesName: [1, 3],
  // 表示使用 “维度2” 中的值作为 id。这在使用 setOption 动态更新数据时有用处，可以使新老数据用 id 对应起来，从而能够产生合适的数据更新动画。
  itemId: 2,
  // 指定数据项的名称使用 “维度3” 在饼图等图表中有用，可以使这个名字显示在图例（legend）中。
  itemName: 3
}

// 直角坐标系（grid/cartesian）特有的属性：
encode: {
  // 把 “维度1”、“维度5”、“名为 score 的维度” 映射到 X 轴：
  x: [1, 5, 'score'],
  // 把“维度0”映射到 Y 轴。
  y: 0
}

// 单轴（singleAxis）特有的属性：
encode: {
  single: 3
}

// 极坐标系（polar）特有的属性：
encode: {
  radius: 3,
  angle: 2
}

// 地理坐标系（geo）特有的属性：
encode: {
  lng: 3,
  lat: 2
}

// 对于一些没有坐标系的图表，例如饼图、漏斗图等，可以是：
encode: {
  value: 3
}
```

## 多个 dataset 以及如何引用他们

可以同时定义多个 dataset。系列可以通过 [series.datasetIndex](https://echarts.apache.org/option.html#series.datasetIndex) 来指定引用哪个 dataset。例如：

```js
var option = {
  dataset: [
    {
      // 序号为 0 的 dataset。
      source: []
    },
    {
      // 序号为 1 的 dataset。
      source: []
    },
    {
      // 序号为 2 的 dataset。
      source: []
    }
  ],
  series: [
    {
      // 使用序号为 2 的 dataset。
      datasetIndex: 2
    },
    {
      // 使用序号为 1 的 dataset。
      datasetIndex: 1
    }
  ]
};
```
