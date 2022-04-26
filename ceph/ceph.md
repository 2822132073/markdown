![图片](D:\markdown\ceph\ceph.assets\640.webp)

1. pool和pg(placement group)都是逻辑上的概念,实际数据都是存在于osd上的
2. ceph内部的冗余是在pg层上进行的

> 存储池的类型就是管理存储池冗余数据的，数据冗余无非是做数据分片的副本，这儿不叫分片，叫 PG，我们叫主 PG，也叫活动 PG 和副本 PG，我们这样来称呼就行了，一个 PG 里面的对象是统一被管理的，写的时候，一定是先写主 PG，然后再由主 PG 同步给副本 PG

