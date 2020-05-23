const path = require('path')
const http = require('http')
const Koa = require('koa');
const Router = require('koa-router');
const static = require('koa-static')
const app = new Koa();
//WebServer默认端口
const port = 3000;





//请求方式 http://域名/product/123
let productRouter = new Router().get('/product/:aid',async (ctx)=>{
    console.log(ctx.params); //{ aid: '123' } //获取动态路由的数据
    ctx.body='这是商品页面';
})
//子路由1
let home = new Router();
home.get('/home', async(ctx)=>{
    ctx.body="Hello /home/home/";
});
//父级路由
let router = new Router().get('/home',async (ctx)=>{
  ctx.body = 'Hello /home'
});
router.use('/home',home.routes(),home.allowedMethods());

app.use(productRouter.routes(),productRouter.allowedMethods());   /*启动路由*/
app.use(router.routes(),router.allowedMethods());   /*启动路由*/
/*
 * router.allowedMethods()作用： 这是官方文档的推荐用法,我们可以
 * 看到 router.allowedMethods()用在了路由匹配 router.routes()之后,所以在当所有
 * 路由中间件最后调用.此时根据 ctx.status 设置 response 响应头 
 *
 */

app.use(static( path.join(__dirname,'./'), {"hidden":false} ));

app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
});
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}`);
});

app.use(async ctx => {  //console.log("ctx",ctx.request)
  ctx.body = 'Hello World';
});

app.on('error', err => {
  console.error('server error', err)
});

const server = http.createServer(app.callback())
var users = [];


var io = require("socket.io")(server);
io.on("connection",function(socket){
  /**
   * 添加用户
   * @param {User} user - 用户,{uid,sid}必备用户id和socketid
   */
  socket.onUserJoin = function( user ){
    users.push( user );
    this.emit('_update_userlist',{type:'_update_userlist',data:users})
    this.broadcast.emit('_update_userlist', {type:'_update_userlist',data:users})

    var idx = users.indexOf( u =>{
      return u.uid == user.id;
    })
    //is new user
    if( idx ==-1){
      this.broadcast.emit('_message',{type:'_message',data:{
        action:'user_join',data:user
      }})
    }
    
  }
  /**
   * 移除用户
   * @param {string} sid - socketid
   */
  socket.onUserExit = function( sid ){
    var u = [];
    var user = null
    for(var i=0;i<users.length;i++){
      if( users[i].sid != sid ){
        u.push( users[i])
      }else{
        user = users[i];
      }
    }
    users = u;
    this.emit('_update_userlist',{type:'_update_userlist',data:users})
    this.broadcast.emit('_update_userlist', {type:'_update_userlist',data:users})
    if( user ){
      this.broadcast.emit('_message',{type:'_message',data:{
        action:'user_exit',data:user
      }})
    }else{
      //server restart user is null
    }
    
  }
  socket.on("message", function(data){
    console.log("服务器收到请求(message)",data)
    var message = JSON.parse(data);
    if( message.type ){
      console.log(message.type)
    }else{
      console.log(message.event)
    }
    console.log("请求已经广播:", data)
    switch( message.type ){
      case '_join':
        let usr = message.data;
        usr.sid = socket.id;
        socket.onUserJoin( usr );
        break;
    }
    socket.on('disconnect', function () {
      socket.onUserExit( socket.id )
    });
    socket.broadcast.emit("message", message)
  })
})


server.listen(process.env.PORT || port, () => {
     console.log(`koa server run at : http://127.0.0.1:${port}`);
})
/*
app.listen(3000,()=>{
  console.log('koa server listen:3000')
});
*/