var util = require('util');
var parse = require("../src/parse.js")

var html = "<html><body><h1>Title</h1><div id='main' class='test'><p>Hello<em>world</em>!</p></div></body></html>"
var dom = parse(html)

console.log(util.inspect(dom, false, null));


