```go
// Copyright 2015 The Gorilla WebSocket Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

//go:build ignore
// +build ignore

package main

import (
	"flag"
	"html/template"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

var addr = flag.String("addr", "localhost:8080", "http service address")

// 如果是在借助一些websocket进行一些websocket的测试,需要修改 CheckOrigin,不然无法进行连接
var upgrader = websocket.Upgrader{} // use default options

// 主要的处理代码
func echo(w http.ResponseWriter, r *http.Request) {
    // 升级请求到websocket
	c, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Print("upgrade:", err)
		return
	}
    // 一定要记得关闭连接
	defer c.Close()
    // 死循环,从连接中读取消息,然后将消息写入连接
	for {
		mt, message, err := c.ReadMessage()
		if err != nil {
			log.Println("read:", err)
			break
		}
		log.Printf("recv: %s", message)
		err = c.WriteMessage(mt, message)
		if err != nil {
			log.Println("write:", err)
			break
		}
	}
}

// 当访问 / 路径时,将给出html代码解析之后,将 websocket 地址填入
func home(w http.ResponseWriter, r *http.Request) {
	homeTemplate.Execute(w, "ws://"+r.Host+"/echo")
}

func main() {
	flag.Parse()
	log.SetFlags(0)
	http.HandleFunc("/echo", echo)
	http.HandleFunc("/", home)
	log.Fatal(http.ListenAndServe(*addr, nil))
}

// 这里面是一些html代码,就不写出来了
var homeTemplate = template.Must(template.New("").Parse(``))

```

> 这段代码主要是将客户端发送过来的消息重新的发送回去