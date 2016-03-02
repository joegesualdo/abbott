// A CSS stylesheet is a series of rules.
// Example:
//   ```
//   h1, h2, h3 { margin: auto; color: #cc0000; }
//   div.note { margin-bottom: 20px; padding: 10px; }
//   #answer { display: none; }
//   ```
function Stylesheet() {
  this.rules = []
}

// A rule includes one or more selectors separated by commas, followed by a series of declarations enclosed in braces.
function Rule() {
  this.selectors = []; // array of SElectors
  this.declarations = [] //array of Declarations
}
// A selector can be a simple selector (https://www.w3.org/TR/CSS2/selector.html#selector-syntax), or it can be a chain of selectors joined by combinators. 
//   We are only supporting simple selectors for now.
//   NOTE: Note: Confusingly, the newer Selectors Level 3 standard uses 
//     the same terms to mean slightly different things. In this article 
//     I’ll mostly refer to CSS2.1. Although outdated, it’s a useful starting 
//     point because it’s smaller and more self-contained (compared to CSS3, 
//     which is split into myriad specs that depend on each other and CSS2.1).
// In abbott, a simple selector can include a tag name, an ID prefixed by '#', 
// any number of class names prefixed by '.', or some combination of the above. 
// If the tag name is empty or '*' then it is a “universal selector” that can match any tag.
// There are many other types of selector (especially in CSS3), but this will do for now.
function SimpleSelector() {
  var that = this;
  this.tag_name = '';
  this.id = '';
  this.class = [];
  this.specificity = function(){
    return [that.id.length, that.class.length, that.tag_name.length] 
  }
}

// A declaration is just a name/value pair, separated by a colon and ending with 
//   a semicolon. For example, "margin: auto;" is a declaration.
function Declaration() {
  this.name = '';
  this.value = null; // Options: string, Unit, or Color 
}

var Unit = ["px"] // insert more units here
// var Color = [] // insert color options here
//
// should have this.r, this.g, this.b this.a
function Color(){
}

function CSSParser(opts){
  opts = opts || {}
  if (opts.input === undefined) {
    throw new Error("Must provide an input for the parser")
  }
  this.pos = opts.pos || 0
  this.input = opts.input
  var that = this;

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
  // Parse one simple selector, e.g.: `type#id.class1.class2.class3`
  //   Note the lack of error checking. Some malformed input like ### or *foo* 
  //   will parse successfully and produce weird results. A real CSS parser would 
  //   discard these invalid selectors.
  this.parseSimpleSelector = function() {
    var selector = new SimpleSelector()
    while (!that.eof()) {
      if (that.nextChar() === '#'){
        that.consumeChar()
        selector.id = that.parseIdentifier()
      } else if (that.nextChar() === '.'){
        that.consumeChar()
        selector.class.push(that.parseIdentifier())
      } else if (that.nextChar() === '*') {
        // Do something
        that.consumeChar()
      } else if (validIdentifierChar(that.nextChar())){
        selector.tag_name = that.parseIdentifier()
      } else {
        break;
      }
    }
    return selector;
  }
  this.parseIdentifier = function() {
    return that.consumeWhile(validIdentifierChar)
  }
  // Parse a rule set: `<selectors> { <declarations> }`.
  // returns a rule
  this.parseRule = function(){
    var rule = new Rule();
    rule.selectors = that.parseSelectors(),
    rule.declarations = that.parseDeclarations()
    return rule;
  }

  this.parseSelectors = function(){
    var selectors = [];
    while(true){
      selectors.push(that.parseSimpleSelector())
      that.consumeWhitespace();
      if (that.nextChar() == ','){
        that.consumeChar()
        that.consumeWhitespace();
      } else if (that.nextChar() == '{'){ // start of declarations
        break;
      } else {
        console.log("Unexpected character " + that.nextChar() + " in selector list")
      }
    }
    // TODO: Should sort selectors and Return selectors with highest specificity first, for use in matching.
    // selectors.sort_by(|a,b| b.specificity().cmp(&a.specificity()));
    return selectors

  }

  this.parseRules = function(){
    var rules = [];
    while(true){
      that.consumeWhitespace();
      if (that.eof()){
        break;
      }
      rules.push(that.parseRule());
    }
    return rules; 
  }
  // Parse a list of declarations enclosed in `{ ... }`.
  this.parseDeclarations = function(){
    if (that.consumeChar() !== '{'){
      // TODO: Throw an error 
    }
    var declarations = [];
    while(true){
      that.consumeWhitespace();
      if (that.nextChar() == '}') {
        that.consumeChar();
        break;
      }
      declarations.push(that.parseDeclaration());
    }
    return declarations;
  }
  // Parse one `<property>: <value>;` declaration.
  this.parseDeclaration = function(){
    var propertyName = that.parseIdentifier();
    that.consumeWhitespace();
    if (that.consumeChar() !== ':'){
      // TODO: Throw an error 
    }
    that.consumeWhitespace();
    var value = that.parseValue();
    that.consumeWhitespace();
    if (that.consumeChar() !== ';'){
      // TODO: Throw an error 
    }
    var declaration = new Declaration
    declaration.name = propertyName;
    declaration.value = value;
    return declaration
  }
  this.parseValue = function(){
    if (/^[0-9]+$/.test(that.nextChar())) {
      return that.parseLength()
    } else if (that.nextChar() == '#') {
      return that.parseColor()
    } else {
      return that.parseIdentifier()
    }
  }
  this.parseLength = function(){
    return [that.parseFloat(), that.parseUnit()]
  }
  //TODO Should i return a Nubmer
  this.parseFloat = function(){
    var s = that.consumeWhile(function(character){
     return /^[0-9]+$/.test(character)
    });
    return s;
  }
  //TODO: This should return a Unit type
  this.parseUnit = function(){
    var identifier = that.parseIdentifier()
    switch(identifier){
      case 'px':
        return 'px'
        break;
      default:
        // TODO: This should throw an error
        console.log("Unrecognized unit: " + identifier)
    }
  }
  this.parseColor = function(){
    if (that.consumeChar() !== '#'){
      // TODO: Throw an error 
    }
    var color = new Color()
    color.r = that.parseHexPair()
    color.g = that.parseHexPair()
    color.b = that.parseHexPair()
    color.a = 255
    return color;
  }
  // TODO: should return a Unit
  this.parseHexPair = function(){
    var s = that.input.slice(that.pos, that.pos + 2);
    that.pos = that.pos + 2;
    return s;
  }
}

function validIdentifierChar(character){
    return (/^[a-zA-Z0-9]+$/.test(character) || character === '-' || character === '_');
}

module.exports = CSSParser
