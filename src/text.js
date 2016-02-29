var Node = require("./node.js");

function Text(data) {
  // this.children = [];
  this.node_type = "#text"
  this.textContent = data;
}

Text.prototype = new Node();

module.exports = Text;
