import io from 'socket.io-client';
import MediaDevices from './devices/MediaDevices';
import Env from './devices/Env.js'

//api see:https://socket.io/docs/client-api/
import ui from "./ui"
let isOwner = false;
let localStream = null;
export default ()=>{
	let socket = io.connect('http://localhost:3000');

	
	let uid = location.search.replace("?","");
	if(uid){
		isOwner = true;
	}

	socket.on('connect', function(){
	    socket.emit('message', JSON.stringify({
	        type:'join',
	        name:uid
	    }))
	});

	socket.on('message',function( evt ){
		console.log("socket message:", evt )
		if( evt.type == 'offer'){
			if( !isOwner ){
				//step2
				//收到主播的offer
				//evt是一个description,保存远端offser
				pc.setRemoteDescription( evt )
				//应答
				pc.createAnswer(function(desc){
					pc.setLocalDescription(desc);
				    console.log('Answer -----', desc);
				    socket.emit('message',JSON.stringify(desc));
				}, function (error) {
		            console.log('Failure callback: ' + error);
		        });
			}
		}
		if( evt.type == 'answer'){
			if( isOwner ){
				//收到客户的应答,保存客户answer
				//step3
				pc.setRemoteDescription( evt );
			}
		}
		if( evt.event=='_ice_candidate'){
			/*
	    	 当在SDP信息的offer/answer流程中，ClientA和ClientB已经根据SDP信息创建好相应的音频Channel和视频Channel并开启Candidate数据的收集，Candidate数据可以简单地理解成Client端的IP地址信息（本地IP地址、公网IP地址、Relay服务端分配的地址）。
	    	 */
	        pc.addIceCandidate(new RTCIceCandidate(evt.data.candidate));
		}
	})
	// stun和turn服务器
	var iceServer = null;

	let RPC = Env.getCompatAPI('RTCPeerConnection')
	let mediaDevices = MediaDevices.getInstance();
	var pc = new RPC(iceServer);

	/**

	 当ClientA收集到Candidate信息后，PeerConnection会通过OnIceCandidate接口给ClientA发送通知，ClientA将收到的Candidate信息通过Signal服务器发送给ClientB，ClientB通过PeerConnection的AddIceCandidate方法保存起来。同样的操作ClientB对ClientA再来一次。
	*/
	pc.onicecandidate = function(evt){
		//step4
		console.log("event:onicecandidate", evt)
		if (evt.candidate !== null) {
			socket.emit('message',JSON.stringify({
	            "event": "_ice_candidate",
	            "data": {
	                "candidate": evt.candidate
	            }
	        }));
		}
	}
	pc.onicegatheringstatechange = function(evt){
		console.log('信令状态变化',evt)
		switch(evt.iceGatheringState){
			case 'gathering':
				//开始采集
				break;
			case 'complete':
				//完在采集
				break;
		}
	}
	pc.onaddstream = function( evt ){
		console.log('addStream', evt)
		let video = document.getElementById('remoteVideo');
		if ("srcObject" in video) {
			video.srcObject = event.stream;
		}else{
			video.src = URL.createObjectURL(event.stream);;
		}
	}
	pc.onremovestream = function(evt){
		console.log("移除远端流",evt)
	}
	let sendStream = function( stream ){
		let video = document.getElementById('localVideo');
		if ("srcObject" in video) {
			video.srcObject = stream;
		}else{
			video.src = createObjectURL(stream);
		}
		//pc.addStream( stream )
		if( isOwner ){
			//step1
			pc.createOffer(function( desc ){
				console.log("offser",desc)
				pc.setLocalDescription(desc);
				//owner不会收到message
				socket.emit('message',JSON.stringify(desc));
			},function(err){
				console.log('create offer error:',err)
			})
		}
	}

	let doSendStream = function(stream){
		pc.addStream( stream )
		if( isOwner ){
			//step1
			pc.createOffer(function( desc ){
				console.log("offser",desc)
				pc.setLocalDescription(desc);
				//owner不会收到message
				socket.emit('message',JSON.stringify(desc));
			},function(err){
				console.log('create offer error:',err)
			})
		}else{

		}
	}

	mediaDevices.getUserMedia({video:true}).then(stream=>{
		console.log('stream',stream)
		localStream = stream;
		sendStream( stream );
	})

	document.querySelector("#sendvideo").onclick=(e)=>{
		console.log('addStream',localStream)
		pc.addStream( localStream )
		//doSendStream(localStream)
	}
	
	document.querySelector("#closevideo").onclick=(e)=>{
		console.log('removeStream',localStream)
		pc.removeStream( localStream )
	}
}