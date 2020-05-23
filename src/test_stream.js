
import MediaDevices from './devices/MediaDevices';
import Env from './devices/Env.js'

let test = ()=>{
	console.log('teststream')
	// 同时有视频数据和音频数据
    let constrants = {
        video: {
            width: 640,
            height: 480,
            frameRate: 5,
            facingMode: 'environment',
            resizeMode: 'none'
        },
        audio: false
    }
    let devices = MediaDevices.getInstance();
    devices.getUserMedia(constrants).then( stream =>{
    	console.log('stream',stream)
    	let video = document.getElementById("localVideo");
    	let tracks = stream.getVideoTracks();
    	console.log("tracks",tracks)
    	if( tracks.length ){
    		let videoConstraints = tracks[0].getConstraints()
    		console.log("tracks0.setting", videoConstraints)
    	}
    	if( video ){
    		video.srcObject = stream;
    	}
    })
}

export default test;