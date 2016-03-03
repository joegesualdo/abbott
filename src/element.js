var Node = require("./node.js")

function Element(tag_name, attributes, children) {
  var that = this;
  this.children = children || [];
  this.tag_name = tag_name;
  this.attributes = attributes;
  // helpers to get class and id
  this.id = function(){
    return that.attributes.id
  }
  this.classes = function(){
    if (that.attributes.class === undefined) {
      return []
    } else {
      return that.attributes.class.split(" ")
    }
  }
}

Element.prototype = new Node();

module.exports = Element;
