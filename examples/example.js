var util = require('util');
var parseHTML = require("../src/parse-html.js")

var html = "<html><body><h1>Title</h1><div id='main' class='test'><p>Hello<em>world</em>!</p></div></body></html>"
var dom = parseHTML(html)

console.log(util.inspect(dom, false, null));


