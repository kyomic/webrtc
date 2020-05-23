let ui = {}
ui.user = {};
ui.updateUserInfo = function(info){
	var dom_uid = document.querySelector("#uid");
	if( dom_uid ) dom_uid.innerHTML = info.uid;
	if( info.owner ){
		dom_uid.innerHTML += '<font style="color:red">房主</font>'
	}
	this.updateMessage({action:'user_join',data:info})
}
ui.updateUserList = function(list){
	let user = this.user;
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
export default ui;