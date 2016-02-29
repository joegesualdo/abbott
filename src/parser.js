var Element = require("./element.js")
var Text = require("./text.js")

function Parser(opts) {
  opts = opts || {}
  if (opts.input === undefined) {
    throw new Error("Must provide an input for the parser")
  }
  this.pos = opts.pos || 0
  this.input = opts.input
  var that = this;

  // Read the current character without consuming it.
  this.nextChar = function() {
    return that.input[that.pos]
  }
  // Do the next characters start with the given string?
  this.startsWith = function(s){
    return that.input.slice(that.pos).substring(0, s.length) === s
  }
  // Return true if all input is consumed.
  this.eof = function(){
    return that.pos >= that.input.length;
  }
  // Return the current character, and advance self.pos to the next character.
  this.consumeChar = function(){
    var consumedChar = that.input[that.pos];
    that.pos = that.pos + 1
    return consumedChar;
  }
  // Consume characters until `test` returns false.
  //   Often we will want to consume a string of consecutive characters. 
  //   The consumeWhile method consumes characters that meet a given condition, 
  //   and returns them as a string. This method’s argument is a function that 
  //   takes a char and returns a bool.
  this.consumeWhile = function(test){
    result = "";
    while (!that.eof() && test(that.nextChar())) {
      result = result + that.consumeChar()
    }
    return result;
  }
  // Consume and discard zero or more whitespace characters.
  //    uses consumeWhile to ignore a sequence of space characters
  this.consumeWhitespace = function() {
    function isWhitespace(character){
      return character === ' ';
    }

    that.consumeWhile(isWhitespace)
  }
  // Parse a tag or attribute name.
  //    uses consumeWhile to consume a string of alphanumeric characters:
  this.parseTagName = function() {
    tagName = that.consumeWhile(function(character){
      //return true if characer equals anything in this range:
      // This will return true if character is within any of these ranges:
      //   'a'...'z' | 'A'...'Z' | '0'...'9'
      //     source: http://stackoverflow.com/questions/23476532/check-if-string-contains-only-letters-in-javascript
      // TODO: improve this mehtod. At this point it will crash if you put a special character lik '!' in the string
      return (/^[a-zA-Z]+$/.test(character));
    })
    return tagName;
  }
  //
  // Actual parsing methods =========================
  //
  //  Parse a single node.
  //    To parse a single node, we look at its first character to see if it is an 
  //    element or a text node. In our simplified version of HTML, a text node can 
  //    contain any character except <.
  this.parseNode = function() {
    if (that.nextChar() == "<") {
      return that.parseElement()
    } else {
      return that.parseText()
    }
  }
  // Parse a text node.
  this.parseText = function() {
    var textValue = that.consumeWhile(function(character){
      return character !== '<'
    })
    // TODO: make textNode and actual TextNode type
    return new Text(textValue);
  }
  // Parse a single element, including its open tag, contents, and closing tag.
  //   An element is more complicated. It includes opening and closing tags, 
  //   and between them any number of child nodes:
  this.parseElement = function() {
    // Opening tag.===
    if (that.consumeChar() !== '<'){
      // TODO: Throw an error if the first character isn't a <
    }
    var tagName = that.parseTagName();
    var attrs = that.parseAttributes();
    if (that.consumeChar() !== '>') {
      // TODO: Throw an error if the last character isn't a >
    }
    // Content ===
    var children = that.parseNodes();
    // Closing tag =====
    if (that.consumeChar() !== '<'){
      // TODO: Throw an error if next character isn't a <
    }
    if (that.consumeChar() !== '/'){
      // TODO: Throw an error if next first character isn't a /
    }
    if (that.parseTagName() !== tagName ){
      // TODO: Throw an error if the closing tag name ins't the same as the opening 
    }
    if (that.consumeChar() !== '>'){
      // TODO: Throw an error if last first character isn't a >
    }
    // TODO: this should create an Element
    return new Element(tagName, attrs, children)
  }
  // Parse a single name="value" pair.
  this.parseAttr = function() {
    var name = that.parseTagName();
    if (that.consumeChar() !== '='){
      // TODO: Throw an error if the next character isn't a =
    }
    var value = that.parseAttrValue();
    return [name, value]
  }
  // Parse a quoted value.
  this.parseAttrValue = function() {
    var openQuote = that.consumeChar();
    if (openQuote !== '"' || openQuote !== "'"){
      // TODO: Throw an error if it's not a quote 
    }
    var value = that.consumeWhile(function(character){
      return character !== openQuote;
    })
    if (that.consumeChar() !== openQuote){
      // TODO: Throw an error if the last character isn't a closing quote
    }
    return value;
  }
  // Parse a list of name="value" pairs, separated by whitespace.
  this.parseAttributes = function() {
    var attributes = {};
    while(true){
      that.consumeWhitespace();
      if (that.nextChar() === '>') {
        break;
      }
      var attrArray = that.parseAttr();
      var name = attrArray[0]
      var value = attrArray[1]
      attributes[name] = value
    }
    return attributes;
  }
  // Parse a sequence of sibling nodes.
  //   To parse the child nodes, we recursively call parse_node in a loop until
  //   we reach the closing tag. This function returns a Vec, which is Rust’s 
  //   name for a growable array.
  this.parseNodes = function() {
    var nodes = [];
    while(true){
      that.consumeWhitespace();
      if (that.eof() || that.startsWith("</")) {
        break;
      }
      nodes.push(that.parseNode());
    }
    return nodes;
  }
}
module.exports = Parser;


