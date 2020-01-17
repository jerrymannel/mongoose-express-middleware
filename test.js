function MyObject(_name){
	this.name = _name
}

MyObject.prototype = {
	name: null,
	getName: function(){
		console.log(this.name)
	}
}

let o1 = new MyObject("ONE")
let o2 = new MyObject("TWO")

o1.getName()
o2.getName()