```
screen -dmS sh /opt/uam/uam --pk DF66E08BAF67A292CB25A739FF8ADEDADA3F399EF44F4FA57F37AF2296D70D1C
```

```
for i in {3..9};do docker run --rm -d --cap-add=IPC_LOCK -p127.0.0.1:100$i:1984/udp crp_fsl:v4; done
```





```bash
#!/bin/bash
docker rm -f create
docker run -d --cap-add=IPC_LOCK --name create crp:v1
for i in {1..100}
do
  if [ `docker logs create |grep acceptor |wc -l` == 1 ];
  then 
  IP=`docker logs create |grep acceptor |egrep -o '([0-9]{0,3}\.){3}[0-9]{0,3}'`
  PORT=`docker logs create |grep acceptor |grep -Po '(?<=:)[0-9]*$'`
  break
  fi
done
 echo $IP:$PORT
docker commit -m$IP:$PORT create crp:$PORT
docker rm -f create
docker run -d --name test_$PORT -p$PORT:$PORT -p127.0.0.1::1984/udp --cap-add=IPC_LOCK crp:$PORT

```




