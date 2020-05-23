import io from 'socket.io-client';
import MediaDevices from './devices/MediaDevices';
import Env from './devices/Env.js'
export default ()=>{
	var socket = io.connect('http://localhost:3000');
	var onSocketEvent = function(e){
		console.log("onsocket event:", e);
	}
	var isCaller = window.location.href.split('#')[1];

	socket.on('connect', function(){
	    socket.emit('message', JSON.stringify({
	        type:'join',
	        name:isCaller
	    }))
	});
	socket.on('event', onSocketEvent);
	socket.on('disconnect', onSocketEvent);
	// stun和turn服务器
	var iceServer = null;
	// iceServer在局域网下可以通讯
	let RPC = Env.getCompatAPI('RTCPeerConnection')

	var pc = new RPC(iceServer);

	/*
	// ------------   step 6 ----------------
	当ClientA收集到Candidate信息后，PeerConnection会通过OnIceCandidate接口给ClientA发送通知，ClientA将收到的Candidate信息通过Signal服务器发送给ClientB，ClientB通过PeerConnection的AddIceCandidate方法保存起来。同样的操作ClientB对ClientA再来一次。
	*/
	// 发送给的其他端通知
	// send any ice candidates to the other peer
	pc.onicecandidate = function(event){
		console.log("event:onicecandidate", event)
	    if (event.candidate !== null) {
	        //debugger
	        console.log('onicecandidate -----');
	        socket.emit('message',JSON.stringify({
	            "event": "_ice_candidate",
	            "data": {
	                "candidate": event.candidate
	            }
	        }));
	    }else{
	    	// All ICE candidates have been sent
	    }
	};

	function localDescCreated(desc) {
	    pc.setLocalDescription(desc, function () {
	        $(document).trigger("persistState", { mode: 'rtc', 'sdp': pc.localDescription });
	    }, logError);
	}
	//需要协商事件?
	// let the 'negotiationneeded' event trigger offer generation
	pc.onnegotiationneeded = function () {
	    //pc.createOffer(localDescCreated, logError);
	}
	// ------------   step 7 ----------------
	// 建立好p2p通道以后 会通过OnAddStream返回一个音视频流的对象
	/*ClientB接收到ClientA传送过来的音视频流，会通过PeerConnection的OnAddStream回调接口返回一个标识ClientA端音视频流的MediaStream对象，在ClientB端渲染出来即可。同样操作也适应ClientB到ClientA的音视频流的传输

	*/
	pc.onaddstream = function(event){
		console.log("event:onaddstream", event)
		let video = document.getElementById('remoteVideo');
		if ("srcObject" in video) {
			video.srcObject = event.stream;
		}else{
			video.src = URL.createObjectURL(event.stream);;
		}
	};

	// offer和answer
	var sendOfferFn = function(desc){
		// ------------   step 2 ----------------
		/*
		CreateOffer方法创建一个用于offer的SDP对象，SDP对象中保存当前音视频的相关参数
		如：{type: "offer", sdp: "v=0………"}
		*/
	    pc.setLocalDescription(desc);
	    console.log('Offer -----', desc);
	    /**
	     * 发送至其它端
	     */
	    socket.emit('message',JSON.stringify(desc));
	},
	sendAnswerFn = function(desc){
		//------------   step 4 ----------------
		//通过PeerConnection的SetLocalDescription的方法保存该应答SDP对象并将它通过Signal服务器发送给ClientA
	    pc.setLocalDescription(desc);
	    console.log('Answer -----', desc);
	    socket.emit('message',JSON.stringify(desc));
	};

	function createObjectURL(object) {
	    return (window.URL) ? window.URL.createObjectURL(object) : window.webkitURL.createObjectURL(object);
	}
	navigator.getUserMedia = navigator.getUserMedia ||
	                         navigator.webkitGetUserMedia ||
	                         navigator.mozGetUserMedia;

	// 获取本地音频和视频流
	if (navigator.getUserMedia) {
	   navigator.getUserMedia({ audio: true, video: { width: 1280, height: 720 } },
	      	function(stream) {
		        //在localVideo输出音视频
				let video = document.getElementById('localVideo');
				if ("srcObject" in video) {
					video.srcObject = stream;
				}else{
					video.src = createObjectURL(stream);
				}
				//把本地的媒体流绑定到PeerConnection
				pc.addStream(stream);
				// ------------   step 1 ----------------
				//发起端 发送offer
				console.log("是否发起端？", isCaller)
				if(isCaller){
					console.log("发送请求");
				    pc.createOffer(sendOfferFn, function (error) {
				        console.log('Failure callback: ' + error);
				    });
				}
			},
			function(err) {
				console.log("The following error occurred: " + err.name);
			}
	   );
	} else {
	   console.log("getUserMedia not supported");
	}



	socket.on('message',function(event){//处理socket请求
	    console.log("event:onsocket: message", event)
	    if(event.type){
	        console.log('请求已返回--------'+event.type);
	    }else{
	        console.log('--------')
	        console.log(event);
	    }

	    if(event.type=='offer' && !isCaller){
	    	// ------------   step 3 ----------------
	    	/** ClientB接收到ClientA发送过的offer SDP对象　*/
	    	/* SetRemoteDescription方法将其保存起来 */
	        pc.setRemoteDescription(event)
	        /*通过PeerConnection的SetLocalDescription的方法保存该应答SDP对象并将它通过Signal服务器发送给ClientA*/
	        pc.createAnswer(sendAnswerFn, function (error) {
	            console.log('Failure callback: ' + error);
	        });
	    }
	    if(event.type=='answer'  && isCaller){
	    	// ------------   step 5 ----------------
	    	//ClientA接收到ClientB发送过来的应答SDP对象，将其通过PeerConnection的SetRemoteDescription方法保存起来
	        pc.setRemoteDescription(event)
	    }
	    if(event.event=='_ice_candidate'){
	    	// ------------   step 6 ----------------
	    	/*
	    	 当在SDP信息的offer/answer流程中，ClientA和ClientB已经根据SDP信息创建好相应的音频Channel和视频Channel并开启Candidate数据的收集，Candidate数据可以简单地理解成Client端的IP地址信息（本地IP地址、公网IP地址、Relay服务端分配的地址）。
	    	 */
	        pc.addIceCandidate(new RTCIceCandidate(event.data.candidate));
	    }
	})
}