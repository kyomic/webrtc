let RoomOptions = {
	id:"",
	host:'http://localhost:3000'
}

class Room{
	constructor( option = null ){
		this.option = Object.assign(Object.assign({},RoomOptions), option||{});
		this.option.id = 'room-'+ Math.floor(Math.random() * 1000);

		this.initialize();
	}

	initialize(){
		this.connect( this.option.host );
	}

	connect( host ){
		
	}
}
export default Room;