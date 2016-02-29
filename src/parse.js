var Parser = require("./parser.js") 
var Element = require("./element.js")

// Parse an HTML document and return the root element.
//   parse an entire HTML document into a DOM tree. This function will create 
//   a root node for the document if it doesn’t include one explicitly; this is 
//   similar to what a real HTML parser does.
function parse(source) {
  var nodes = new Parser({input:source}).parseNodes();
  // If the document contains a root element, just return it. 
  //   Otherwise, create one.
  if (nodes.length === 1) {
    return nodes[0]
  } else {
    // TODO: this should create a Element
    return Element("html", {}, nodes)
  }
}

module.exports = parse;
