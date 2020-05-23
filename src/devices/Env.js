/**
 * @author kyomic
 * @mail kyomic@163.com
 */
let Env = {}
Env.initialize = function( context ){
	this.context = context;
}

/**
 * 判断是否支持webrtc
 */
Env.isSuppprtWebRTC = function(){
	let support = true;
	['RTCPeerConnection','RTCSessionDescription'].forEach(name=>{
		let api = Env.getCompatAPI(name, this.context );
		if( !api ){
			support = false;
			console.error( name +"is not supported")
			return false;
		}
	});
	['mediaDevices'].forEach(name=>{
		let api = Env.getCompatAPI(name, this.context.navigator );
		if( !api ){
			support = false;
			console.error( name +"is not supported")
			return false;
		}
	})
	return support;
}

/** 
 * 查询兼容函数名
 *
 * @param {string} name - 函数名
 * @param {object} context - 函数作用域上下文
 * @example
 * getCompatAPI('getUserMedia',navigator)
 */
Env.getCompatAPI = (name, context ) =>{
	let prefix = ['','moz','webkit','o'];
	if( !context ) context = Env.context;
	if( !context ){
		throw new Error(" *** 找不到上下文 ***")
	}
	let api = null;
	prefix.forEach( n =>{
		let func = '';
		if( !n ){
			func = n + name;
		}else{
			func = n + name.replace(/^\w/ig,function(arg){
				return arg.toUpperCase()
			})
		}
		if( typeof context[func]!='undefined'){
			api = context[func];
			return true;
		}
		return false;
	})
	return api;
}
Env.initialize( this || self )
export default Env;