var util = require('util');
var parseHTML = require("../src/parse-html.js")
var parseCSS = require("../src/parse-css.js")
var styleTree = require("../src/style.js")
var buildLayoutTree= require("../src/boxes.js")

//DOM
var html = "<html><body><h1>Title</h1><div id='main' class='test'><p>Hello<em>world</em>!</p></div></body></html>"
var dom = parseHTML(html)

console.log(util.inspect(dom, false, null));

// CSSOM
var css = "h1, h2, h3 { left: auto; margin: auto; color: #cc0000; } div.note { margin-bottom: 20px; padding: 10px; } #answer { display: none; }"
var cssNodes = parseCSS(css) 
// console.log(util.inspect(cssNodes, false, null));

var stree = styleTree(dom, cssNodes)
// console.log(util.inspect(stree, false, null));

// console.log(buildLayoutTree(stree))
