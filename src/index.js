import io from 'socket.io-client';
import MediaDevices from './devices/MediaDevices';
import Env from './devices/Env.js'
import Room from './app/Room';

let isSupported = Env.isSuppprtWebRTC();
console.log("是否支持RTC", isSupported)
let media = MediaDevices.getInstance();
console.log("media",media)
let supported = media.enumerateDevices().then(res=>{
    console.log(res)
})
console.log('supported',supported)

import test_stream from './test_socker'
test_stream();
