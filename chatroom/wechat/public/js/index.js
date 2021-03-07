/* global io */
/* global $ */
/* 聊天室的主要功能 */
// 1、连接socketio服务
let socket = io('http://localhost:3000/')
let username,avatar
// 2、登录功能
$('#login_avatar li').on('click',function(){
  $(this).addClass('now').siblings().removeClass('now')
})
//点击登录
$('#loginBtn').on('click',function(){
  //获取用户名
  let username = $('#username').val().trim()
  if(!username){
    alert('请输入用户名')
    return
  }
  //获取头像
  let avatar = $('#login_avatar li.now img').attr('src')
 //发送socket io服务登录
 socket.emit('login',{
  username,
  avatar
 })
})

//监听登录失败的请求
socket.on('loginError', data => alert('登录失败了'))
//监听登录成功的请求
socket.on('loginSuccess', data => {
  $('.login_box').fadeOut()
  $('.container').fadeIn()
  //设置个人信息
  $('.avatar_url').attr('src',data.avatar)
  $('.user-list .username').text(data.username)
  username = data.username
  avatar   = data.avatar
})
//监听用户离开的信息
socket.on('delUser', data => {
  $('.box-bd').append(`
  <div class="system">
  <p class="message_system">
    <span class="content">${data.username}--离开了群聊</span>
  </p>
</div>
  `)
  scrollIntoView()
})

//监听添加用户的消息
socket.on('addUser', data => {
  //添加一条系统信息
  $('.box-bd').append(`
  <div class="system">
  <p class="message_system">
    <span class="content">${data.username}--加入群聊</span>
  </p>
</div>
  `)
  scrollIntoView()
})
//监听用户列表的消息
socket.on('userList', data => {
  //把userList
  $('.user-list ul').html('')
  data.forEach(item => {
    $('.user-list ul').append(`
        <li class="user">
              <div class="avatar"><img src="${item.avatar}" alt=""></div>
              <div class="name">${item.username}</div>
            </li>
    `)
  });
  $('#userCount').text(data.length)
})


//聊天功能函数
$('.btn-send').on('click', () =>　{
  //获取到聊天的内容
  let content = $('#content').html().trim()
  $('#content').html('')
  if(!content) return alert('请输入内容')
  //给服务器发消息
  socket.emit('sendMessage', {
    msg: content,
    username,
    avatar,
  })
})

//监听聊天的信息
socket.on('receiveMessage', data => {
  //把服务器给过来渲染添加dom
  if(data.username === username){
    //自己发的信息
    $('.box-bd').append(`
          <div class="message-box">
          <div class="my message">
            <img src="${data.avatar}" alt="" class="avatar">
            <div class="content">
              <div class="bubble">
                <div class="bubble_cont">${data.msg}</div>
              </div>
            </div>
          </div>
        </div>
    `)
  }else{
    //别人发的信息
    $('.box-bd').append(`
        <div class="message-box">
          <div class="other message">
            <img src="${data.avatar}" alt="" class="avatar">
            <div class="nickname">${data.username}</div>
            <div class="content">
              <div class="bubble">
                <div class="bubble_cont">${data.msg}</div>
              </div>
            </div>
          </div>
        </div>
      `)
  }
  
  scrollIntoView()
})

// 当有消息时，将滑动到底部
function scrollIntoView () {
  // 当前元素的底部滚动到可视区
  $('.box-bd').children(':last').get(0).scrollIntoView(false)
}
//发送图片功能
$('#file').on('change', function () {
  let file = this.files[0]
  // // 需要把这个图片发送到服务器，借助于H5新增的fileReader
  let fr = new window.FileReader()
  fr.readAsDataURL(file)
  fr.onload = function () {
    socket.emit('sendImage', {
      username,
      avatar,
      img: fr.result
    })
  }
})

//监听聊天信息
socket.on('receiveImage', data => {
  if (username === data.username) {
    // 自己的消息
    $('.box-bd').append(`
      <div class="message-box">
        <div class="my message">
          <img src="${data.avatar}" alt="" class="avatar">
          <div class="content">
            <div class="bubble">
              <div class="bubble_cont">
                <img src="${data.img}">
              </div>
            </div>
          </div>
        </div>
      </div>
    `)
  } else {
    // 别人的消息
    $('.box-bd').append(`
      <div class="message-box">
        <div class="other message">
          <img src="${data.avatar}" alt="" class="avatar">
          <div class="nickname">${data.username}</div>
          <div class="content">
            <div class="bubble">
              <div class="bubble_cont">
                <img src="${data.img}">
              </div>
            </div>
          </div>
        </div>
      </div>
    `)
  }
  // 等待图片加载完成
  $('.box-bd img:last').on('load', function () {
    scrollIntoView()
  })
})


//初始化jq表情包插件
$('.face').on('click', function () {
  $('#content').emoji({
    button: '.face',
    showTab: false,
    animation: 'slide',
    position: 'topRight',
    icons: [{
      name: 'QQ表情',
      path: 'lib/jquery-emoji/img/qq/',
      maxNum: 91,
      excludeNums: [41, 45, 54],
      file: '.gif'
    }]
  })
})