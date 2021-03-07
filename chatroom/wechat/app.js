const app = require('express')()
const server = require('http').Server(app)
const io = require('socket.io')(server)

//记录已经登录的用户
const users = []
server.listen(3000, () => {
  console.log('服务器启动成功了')
})
//express处理静态资源
app.use(require('express').static('public'))
app.get('/', function(res, res){
  res.redirect('/index.html')
})
io.on('connection', function(socket){
    socket.on('login', data => {
        //1判断，如果data在users中，说明已登录，不允许登录，否则允许登录
      let user =   users.find( item => item.username === data.username)
      if(user){
          //用户存在，登录失败
            socket.emit('loginError', {msg: '登录失败'})
            console.log('失败');
      }else{
          users.push(data)
        // 登录成功
        socket.emit('loginSuccess', data)
        //广播消息给所有用户，有人进来了io.emit广播事件发射
        io.emit('addUser', data)
        //广播所有用户目前多少人聊天
        io.emit('userList', users)
        //把登录成功的用户名和头像存储起来
        socket.username = data.username
        socket.avatar = data.avatar
      }
    })
    //2 监听用户断开连接
socket.on('disconnect',() => {
  //把用户的信息从users删除，广播有人离开，userList发生更新
   let idx = users.findIndex(item => item.username === socket.username)
   users.splice(idx,1)
   io.emit('delUser',{
     username: socket.username,
     avatar: socket.avatar
   })
   io.emit('userList', users)
})
    //3监听用户聊天的信息
    socket.on('sendMessage', data => {
      io.emit('receiveMessage', data)
    })
    //4接收图片信息
    socket.on('sendImage', data => {
      io.emit('receiveImage', data)
    })
})

