## pgsql中的database与schema

与mysql的两级结构不同，pgsql是三级结构，由database->schema->table，而schema是多出来的那一级，用于将不同的表放入不同的schema，可以对表进行分类。默认pgsql中的database中包含一个public的schema，如果创建表时不进行指定，默认会放在public下。

![image.png](https://cdn.jsdelivr.net/gh/2822132073/image/202310162215739.png)
