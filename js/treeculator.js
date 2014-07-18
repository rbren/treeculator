function Node(operator, left, right, parent) {
  this.symbol = operator;
  this.left = left;
  this.right = right;

  this.setSymbol = function(sym) {
    console.log("setsym:" + typeof sym);
    if (typeof sym == "number") {
      this.left = null;
      this.right = null;
    } else if (!this.left) {
      this.left = new Node(0);
      this.right = new Node(0);
    }
    this.symbol = sym;
  }

  this.evaluate = function() {
    console.log("eval!");
    if (left.left) {
      console.log("l!");
      left = left.evaluate();
    }
    if (right.left) {
      console.log("r!");
      right = right.evaluate();
    }
    if (typeof left.symbol == "number" && typeof right.symbol == "number") {
      this.setSymbol(this.symbol.apply(left.symbol, right.symbol));
    }
    return this;
  }

  this.print = function() {
    var a = left;
    if (a.print) {
      a = a.print();
    }
    var b = right;
    if (b.print) {
      b = b.print();
    }
    return (a + " " + operator.symbol + " " + b);
  }
}

OP_SYMBOLS = {};

function Operator(symbol, applyFunc, getOptions) {
  this.symbol = symbol;
  this.apply = applyFunc;
  this.getOptions = getOptions;
  OP_SYMBOLS[symbol] = this;
}

var OP_ADD = new Operator("+",
  function(a,b){return a + b;},
  function() {
    return ["commute"];
  }
);

var OP_SUBTRACT = new Operator("-",
  function(a,b){return a - b;},
  function() {
    return ["commute"];
  }
);

var OP_MULTIPLY = new Operator("*",
  function(a,b){return a * b;},
  function() {
    return ["commute"];
  }
);

var OP_DIVIDE = new Operator("/",
  function(a,b){return a * b;},
  function() {
    return [];
  }
);

function getTreeWidth(node) {
  var cur = node;
  var right = 0;
  while (cur.right) {
    right++;
    cur = cur.right;
  }

  cur = node;
  var left = 0;
  while (cur.left) {
    left++;
    cur = cur.left;
  }
  return left + right;
}
