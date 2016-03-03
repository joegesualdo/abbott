// This module takes DOM nodes and CSS rules as input, and matches them up to determine the value of each CSS property for any given node.
// returns a style tree: Each node in this tree includes a pointer to a DOM node, plus its CSS property values:
//   NOTE: We could add new fields to the dom::Node struct instead of creating a new tree, but I wanted to keep style code out of the earlier “lessons.” This also gives me an opportunity to talk about the parallel trees that inhabit most rendering engines.
function StyleNode() {
  this.node;
  this.specifiedValues = {}
  this.children = []
}

// Selector matching
//  You can tell whether a simple selector matches an element just by looking at the element itself. 
//  Matching compound selectors would require traversing the DOM tree to look at the element’s siblings, parents, etc.
function matches(elementData, selector) {
  return matchesSimpleSelector(elementData, selector)
}

// To test whether a simple selector matches an element, just look at each selector component, and return false if the element doesn’t have a matching class, ID, or tag name.
function matchesSimpleSelector(elementData, selector) {
   // Check type selector
  if (selector.tag_name === elementData.tag_name) {
    return true;
  } else if (selector.id === elementData.id){
    return true;
  } else if (elementData.classes().some(function(c){return selector.class === c})){
    return true;
  }
  return false;
  // Check ID selector
}

//traverse the DOM tree. For each element in the tree, we will search the stylesheet for matching rules.
// When comparing two rules that match the same element, we need to use the highest-specificity selector from each match. Because our CSS parser stores the selectors from most- to least-specific, we can stop as soon as we find a matching one, and return its specificity along with a pointer to the rule.
// // If `rule` matches `elem`, return a `MatchedRule`. Otherwise return `None`.
function matchRule(elementData, rule) {
  var matchedSelectors = rule.selectors.filter(function(selector){
    return matches(elementData, selector)
  })
 if (matchedSelectors.length === 0) {
   return []
 } else {
   var matchedRules = matchedSelectors.map(function(selector){
     return [selector.specificity(), rule]
   })
   return matchedRules;
 }
}

// To find all the rules that match an element we call filter_map, which does a linear scan through the style sheet, checking every rule and throwing out ones that don’t match. A real browser engine would speed this up by storing the rules in multiple hash tables based on tag name, id, class, etc.
// Find all CSS rules that match the given element.
function matchingRules(elementData, stylesheet) {
  var matchedRules = []
  stylesheet.forEach(function(rule){
    if (matchRule(elementData, rule).length === 0) {

    } else {
     matchedRules = matchRule(elementData, rule)
     matchedRules.forEach(function(matchedRule){
      matchedRules.push(matchedRule)
     })
      
    }
  })
  console.log(matchedRules)
  return matchedRules
}

// Apply styles to a single element, returning the specified values.
function specifiedValues(elementData, stylesheet) {
  var values = {}
  var rules = matchingRules(elementData, stylesheet)

  // Go through the rules from lowest to highest specificity.
    // rules.sort_by(|&(a, _), &(b, _)| a.cmp(&b));
    // for (_, rule) in rules {
    //     for declaration in &rule.declarations {
    //         values.insert(declaration.name.clone(), declaration.value.clone());
    //     }
    // }
    // TODO: SHould be the top instead of this
  rules.forEach(function(rule){
    // We use index one because the [0] is the specificity, but [1] in the actual rule
    rule[1].declarations.forEach(function(declaration){
      values[declaration.name] = declaration.value
    })
  });
  return values;
}

function styleTree(root, stylesheet){
  var styleNode = new StyleNode();
  styleNode.node = root;
  if (root.node_type === "#text") {
    styleNode.specifiedValues = {}
  } else {
    styleNode.specifiedValues = specifiedValues(root, stylesheet)
  }
  if (root.children !== undefined) {
    styleNode.children = root.children.map(function(child){
      return styleTree(child, stylesheet)
    });
  }
  return styleNode;
}

// Once we have the matching rules, we can find the specified values for the element. We insert each rule’s property values into a HashMap. We sort the matches by specificity, so the more-specific rules are processed after the less-specific ones, and can overwrite their values in the HashMap.

module.exports = styleTree;
