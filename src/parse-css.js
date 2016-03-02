var CSSParser = require(__dirname + '/css-parser');

function parseCSS(source){
  var cssNodes = new CSSParser({input:source}).parseRules();
  return cssNodes;
}

module.exports = parseCSS;
