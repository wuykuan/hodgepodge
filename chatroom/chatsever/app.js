const ws = require("nodejs-websocket")
const PORT = 3000
const TYPE_ENTER = 0
const TYPE_LEAVE = 1
const TYPE_MSG   = 2
let count = 0

/**
 * 文档介绍
 * type：信息类型（0表示进入聊天室的消息，1表示用户离开聊天室的信息，2表示正常聊天信息）
 * mag：消息内容
 * time： 聊天的具体时间
 */

//创建一个服务,每次只要有用户连接，函数会执行，会给当前用户创建一个connect对象
const server = ws.createServer( conn => {
    console.log("有人链接");
    count++
    conn.userName = `用户${count}`
    broadcast({
        //广播谁进入了聊天
        type: TYPE_ENTER,
        msg: `${conn.userName}进入了聊天室`,
        time: new Date().toLocaleTimeString() 
    })

    conn.on('text', data => {
        //聊天信息
        broadcast({
            type: TYPE_MSG,
            msg: data,
            time: new Date().toLocaleTimeString()
        })
    })
    conn.on('close', () => {
        console.log('连接断开了');
        count--
        broadcast({
            type: TYPE_LEAVE,
            msg: `${conn.userName}离开了聊天室`,
            time: new Date().toLocaleTimeString()
        })
    })
    conn.on('error', () => {
        console.log("连接异常");
    })
})
function broadcast(msg){
    server.connections.forEach( item => {
        item.send(JSON.stringify(msg))
    })
}

server.listen(PORT, () => {
    console.log("websocket启动成功了");
})