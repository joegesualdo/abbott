var util = require('util');
var parse = require("../src/parse.js")

var dom = parse("<html><body><div>Hello, world</div></body></html>")

console.log(util.inspect(dom, false, null));


