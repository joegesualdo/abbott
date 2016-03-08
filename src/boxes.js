function Dimensions() {
  // Position of the content area relative to the document origin:
  this.content = new Rect({x: 0.0, y: 0.0, width: 0.0, height: 0.0}); 
  // Surrounding edges:
  this.padding = new EdgeSize({left: 0.0, right: 0.0, top: 0.0, bottom: 0.0})
  this.border = new EdgeSize({left: 0.0, right: 0.0, top: 0.0, bottom: 0.0})
  this.margin = new EdgeSize({left: 0.0, right: 0.0, top: 0.0, bottom: 0.0})
}

function Rect(opts) {
  this.x = opts.x;
  this.y = opts.y;
  this.width = opts.width;
  this.height = opts.height;
}

function EdgeSize(opts) {
  this.left = opts.left;
  this.right = opts.right;
  this.top = opts.top;
  this.bottom = opts.bottom;
}

// The CSS display property determines which type of box an element generates. CSS defines several box types, each with its own layout rules.
// Each box must contain only block children, or only inline children. When an DOM element contains a mix of block and inline children, the layout engine inserts anonymous boxes to separate the two types. (These boxes are “anonymous” because they aren’t associated with nodes in the DOM tree.)
//

// The layout tree is a collection of boxes. A box has dimensions, and it may contain child boxes.
function LayoutBox(boxType) {
  var that = this;
  this.dimenstions = new Dimensions();
  this.boxType = boxType;
  this.children = []
  // If a block node contains an inline child, create an anonymous block box to contain it. If there are several inline children in a row, put them all in the same anonymous container.
  // // Where a new inline child should go.
  this.getInlineContainer = function(){
    if (that.boxType === "inline") {
      var lastChild = that.children[that.children.length - 1]
      if (lastChild !== undefined && lastChild.boxType === "anonymous") {
      } else {
        that.children.push(new LayoutBox('anonymous'))
      }
    }
    return that.children[that.children.length - 1]
  }
}

// A box can be a block node, an inline node, or an anonymous block box. (This will need to change when I implement text layout, because line wrapping can cause a single inline node to split into multiple boxes. But it will do for now.)
// 
// BoyTypes:
//    BlockNode
//    InlineNode
//    AnonymousBlock
// Display:
//    Inline
//    Block
//    None
//
// Build the tree of LayoutBoxes, but don't perform any layout calculations yet.
function buildLayoutTree(styleNode) {
  // Create the root box.
  var root = new LayoutBox(styleNode.display()) // TODO: Throw error if display is 'none
  // Create the descendant boxes.
  styleNode.children.forEach(function(child){
    if (child.display() === "block") {
      root.children.push(buildLayoutTree(child))
    } else if (child.display() === "inline") {
      root.getInlineContainer().children.push(buildLayoutTree(child))
    } else if (child.display() === "none") {
      // Skip nodes with `display: none;`
    }
  })
  return root;
}

module.exports = buildLayoutTree;
