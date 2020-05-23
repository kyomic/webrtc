import io from 'socket.io-client';
//api see:https://socket.io/docs/client-api/
let ui = {}
let user = {};
ui.updateUserInfo = function(info){
	var dom_uid = document.querySelector("#uid");
	console.log("userInfo",info)
	for(var i in info){
		user[i] = info[i]
	}
	if( dom_uid ) dom_uid.innerHTML = info.uid;

	this.updateMessage({action:'user_join',data:info})
}
ui.updateUserList = function(list){
	var dom = document.querySelector("#users")
	let arr = []
	list.map(usr=>{
		if( usr.uid == user.uid ){
			arr.push("<div class='own'>"+usr.uid+"</div>")
		}else{
			arr.push("<div>"+usr.uid+"</div>")
		}
		
	})
	dom.innerHTML = arr.join("")
}
ui.updateMessage = function( msg ){
	var dom = document.querySelector("#msg")
	var code = '';
	var data = msg.data;
	switch( msg.action ){
		case 'user_join':
			code = "<div>"+data.uid+"加入</div>"
			break
		case 'user_exit':
			code = "<div>"+data.uid+"离开</div>"
			break
	}
	dom.innerHTML += code
}

export default ()=>{
	console.log('test socker')
	

	let socket = io.connect('http://localhost:3000');
	let uid = 'u-' + Math.floor(1000*Math.random());
	user.uid = uid;
	ui.updateUserInfo( {uid:uid })

	let sendSocketMessage = function( data ){
		socket.emit('message', JSON.stringify(data))
	}
	let onSocketEvent = (evt)=>{
		console.log('socket event:', evt.type, evt.data);
		let data = {
			uid: uid, 
			orignData: evt.data
		}
		switch( evt.type){
			case 'connect':
				sendSocketMessage({
					type:'_join',data
				})
				
				break;
			default:
				sendSocketMessage({
					type:'_' + evt.type, data
				})
				break;
		}
	}
	let events = ['connect','event','error','disconnect','connect_error','connect_timeout','reconnect','reconnect_attempt','reconnecting','reconnect_error','reconnect_failed','ping','pong'];

	events.map( key=>{
		socket.on( key , data =>{
			onSocketEvent( {
				type:key,
				data
			})
		})
	})
	
	socket.on('_update_userlist', evt=>{
		ui.updateUserList(evt.data)
	})
	socket.on('_message', evt=>{
		console.log('消息',evt)
		ui.updateMessage(evt.data)
	})


	document.querySelector("#exit").onclick=(e)=>{
		ui.updateMessage({action:'user_exit',data:user})
		socket.close();
		console.log("isConnect", socket)
	}
}