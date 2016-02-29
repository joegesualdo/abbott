var Node = require("./node.js")

function Element(tag_name, attributes, children) {
  this.children = children || [];
  this.tag_name = tag_name;
  this.attributes = attributes;
}

Element.prototype = new Node();

module.exports = Element;
