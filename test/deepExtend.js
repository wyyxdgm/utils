var o1 = {
	a: {
		b: {
			c: "aaaa",
			d: "aaaa",
			e: 222,
			f: [{
				a: "bbb"
			}, {}],
			g: function() {
				return "ah";
			}
		}
	},
	b: {
		b: {
			c: "aaaa",
			d: function() {}
		}
	},
	d: null
};

var o2 = {
	a: {
		b: {
			c: "bbbbb",
			g: 22
		}
	},
	b: {},
	c: 1,
	d: {
		a: 1,
		b2: {
			c: 1
		}
	}
}
var util = require("util");
var objectUtils = require("../lib/object");

//set the third params as true to override when the types of each others is not the same
objectUtils.deepExtend(o2, o1, true);
console.log(util.inspect(o2, false, 10));