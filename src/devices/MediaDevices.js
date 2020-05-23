import Env from './Env';
class MediaDevices{
	static getInstance( ctx ){
		ctx = ctx || Env.context;
		let instance = MediaDevices._instance;
		if( !instance ){
			instance = new MediaDevices( ctx )
			MediaDevices._instance = instance;
		}
		return instance;
	}
	/**
	 * @param {MediaStreamConstraints} [constraints] - 媒体配置
	 * 
		{
		  audio: true,
		  video: {
		    width: { min: 1024, ideal: 1280, max: 1920 },
		    height: { min: 776, ideal: 720, max: 1080 }
		  }
		}
	 */
	getDisplayMedia( constraints = null ){
		if( this.devices ){
			return this.devices.getDisplayMedia( constraints );
		}
		return null;
	}
	getUserMedia( constraints ){
		if( this.devices ){
			return this.devices.getUserMedia( constraints );
		}
		return null;
	}
	/**
	 * @exmaple {aspectRatio,channelCount}
	 */
	getSupportedConstraints(){
		if( this.devices ){
			return this.devices.getSupportedConstraints();
		}
		return {};
	}
	/**
	 * 得到设备信息
	 * @return {Promise}
	 */
	enumerateDevices(){
		if( this.devices ){
			return this.devices.enumerateDevices();
		}
		return Promise.resolve()
	}
	constructor( ctx ){
		this.context = ctx.navigator;
		this.devices = Env.getCompatAPI('mediaDevices', this.context);
	}
}

export default MediaDevices;