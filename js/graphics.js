var SELECTED_NODE;

function selectNode(node) {
  if (SELECTED_NODE) {
    SELECTED_NODE.circle.cir.setStroke('black');
  }
  node.circle.cir.setStroke('blue');
  SELECTED_NODE = node;
  updateOptions(node);
  $("#value").focus();
  SHAPE_LAYER.draw();
}

function findParentNode(node, root) {
  if (!root) {
    root = ROOT_NODE;
  }
  if (!root.left) {return;}
  if (root.left == node || root.right == node) {
    return root;
  } else {
    var lRoot = findParentNode(node, root.left);
    if (lRoot) {return lRoot;}
    var rRoot = findParentNode(node, root.right);
    if (rRoot) {return rRoot;}
  }
}

function updateOptions(node) {
  console.log("update opts");
  var menu = $("#menu");
  menu.html(getOptionsForNode(node));
  $("#value").on('input', function(e) {
    console.log("Change");
    op_value();
  });
}

function getOptionsForNode(node) {
  if (!node) {
    return buildLinkForOption("clear");
  }
  return buildLinkForOption("commute") +
    buildLinkForOption("evaluate") +
    buildLinkForOption("clear") +
    buildNodeValueInput();
}

function buildLinkForOption(opt) {
  return "<a onclick='op_" + opt + "()'>" + opt + "</a><br>";
}

function buildNodeValueInput() {
  return "value:<input type='text' id='value'></input>"
}

function op_commute() {
  var left = SELECTED_NODE.left;
  var right = SELECTED_NODE.right;
  SELECTED_NODE.left = right;
  SELECTED_NODE.right = left;
  rebuildTree();
}

function op_evaluate() {
  if (SELECTED_NODE.left) {
    SELECTED_NODE.evaluate();
    rebuildTree();
  }
}

function op_clear() {
  ROOT_NODE = new Node(0);
  rebuildTree();
}

function op_value() {
  var val = $("#value").val();
  var num = Number(val);
  if (!isNaN(num)) {
    SELECTED_NODE.setSymbol(num);
  } else {
    var op = OP_SYMBOLS[val];
    console.log("found op:" + JSON.stringify(op));
    if (op) {
      SELECTED_NODE.setSymbol(op);
    }
  }
  rebuildTree();
}

function NodeCircle(x, y, node) {
  this.cir = new Kinetic.Circle({
    x: x,
    y: y,
    radius:35,
    fill: 'red',
    stroke: SELECTED_NODE == node ? 'blue' : 'black',
    strokeWidth: 4,
  });

  var display = "";
  if (node.left) {
    display = node.symbol.symbol;
  } else {
    display = node.symbol;
  }

  this.text = new Kinetic.Text({
    x: this.cir.getX(),
    y: this.cir.getY(),
    text: display,
    fontSize: 30,
    fontFamily: 'Calibri',
    fill: 'black'
  })
  this.text.setOffset({
    x: this.text.getWidth() / 2,
    y: this.text.getHeight() / 2
  });

  this.group = new Kinetic.Group({
    draggable:true
  })
  this.group.add(this.cir);
  this.group.add(this.text);

  this.group.on('mousedown', function() {
    console.log("click");
    selectNode(node);
  });
}

function buildTree(tree, x, y, hSpace, vSpace, parentCircle) {
  var circle = new NodeCircle(x, y, tree, parentCircle);
  tree.circle = circle;
  if (tree.left) {
    var leftWidth = getTreeWidth(tree.left);
    var rightWidth = getTreeWidth(tree.right);
    var lAmt = leftWidth / (leftWidth + rightWidth);
    var rAmt = 1 - lAmt;
    var newY = y + vSpace;
    var x1 = x - hSpace;
    var x2 = x + hSpace;
    var left = buildTree(tree.left, x1, newY, hSpace * lAmt, vSpace, circle);
    var right = buildTree(tree.right, x2, newY, hSpace * rAmt, vSpace, circle);
  }
  return circle;
}

function getPointsFromNodes(parent, child) {
  var offset = 35 / Math.sqrt(2);
  var pCircle = parent.circle;
  var cCircle = child.circle;
  var pX = pCircle.cir.x() + pCircle.group.x();
  var pY = pCircle.cir.y() + pCircle.group.y();
  var cX = cCircle.cir.x() + cCircle.group.x();
  var cY = cCircle.cir.y() + cCircle.group.y();
  var goLeft = parent.left == child;
  var x1 = goLeft ? pX - offset : pX + offset;
  var y1 = pY + offset;
  var x2 = goLeft ? cX + offset : cX - offset;
  var y2 = cY - offset;
  //console.log(x1 + "," + y1 + "," + x2 + "," + y2)
  return [x1, y1, x2, y2];
}

function drawCircles(node) {
  if (!node) {return;}
  SHAPE_LAYER.add(node.circle.group);
  drawCircles(node.left);
  drawCircles(node.right);
}

function drawLines(node) {
  if (!node.left) {
    return;
  }
  var left = node.left;
  var right = node.right;
  var leftLine = new Kinetic.Line({
    points: getPointsFromNodes(node, left),
    strokeWidth: 4,
    stroke: 'black'
  });

  var rightLine = new Kinetic.Line({
    points: getPointsFromNodes(node, right),
    strokeWidth: 4,
    stroke: 'black'
  })

  LINE_LAYER.add(leftLine);
  LINE_LAYER.add(rightLine);
  drawLines(left);
  drawLines(right);
}

var ROOT_NODE;
var STAGE;
var SHAPE_LAYER;
var LINE_LAYER;
var MAIN_LAYER;

function buildStage() {
  STAGE = new Kinetic.Stage({
    container: 'container',
    width: 1000,
    height: 800
  });
  SHAPE_LAYER = new Kinetic.Layer();
  LINE_LAYER = new Kinetic.Layer();

  var n1 = new Node(OP_ADD, new Node(2), new Node(3));
  var n2 = new Node(OP_ADD, new Node(10), new Node(20));
  var n3 = new Node(OP_ADD, n1, n2);
  var n4 = new Node(OP_ADD, new Node(2), new Node(3));
  var n5 = new Node(OP_ADD, new Node(10), new Node(20));
  var n6 = new Node(OP_ADD, n4, n5);
  var n7 = new Node(OP_SUBTRACT, n3, n6);
  ROOT_NODE = n7;
  STAGE.add(SHAPE_LAYER);
  STAGE.add(LINE_LAYER);
  rebuildTree();
  SHAPE_LAYER.on("draw", function() {
    LINE_LAYER.removeChildren();
    drawLines(ROOT_NODE);
    LINE_LAYER.draw();
  });

  $(document).keydown(function(e) {
    var press = String.fromCharCode(e.keyCode);
    if (SELECTED_NODE) {
      if (SELECTED_NODE.left) {
        if (e.keyCode == 37) {
          console.log("LEFT!");
          selectNode(SELECTED_NODE.left);
        } else if (e.keyCode == 39) {
          console.log("RIGHT!");
          selectNode(SELECTED_NODE.right);
        }
      }
      if (e.keyCode == 38) {
        console.log("UP!");
        var parent = findParentNode(SELECTED_NODE);
        if (!parent) {
          console.log("new parent")
          parent = new Node(OP_ADD, new Node(0), SELECTED_NODE)
          SELECTED_NODE = parent;
          ROOT_NODE = parent;
          rebuildTree();
        } else {
          selectNode(parent);
        }
        console.log("parent:" + JSON.stringify(parent));
      }
      if (e.keyCode == 13) {
        op_evaluate();
      }
    }
  });

  updateOptions();
}

function rebuildTree() {
  SHAPE_LAYER.removeChildren();
  LINE_LAYER.removeChildren();
  if (ROOT_NODE) {
    var width = getTreeWidth(ROOT_NODE);
    console.log("width:" + width);

    buildTree(ROOT_NODE, 500, 50, width * 30, 70);
    drawCircles(ROOT_NODE);
    drawLines(ROOT_NODE);
    SHAPE_LAYER.setZIndex(10);
    LINE_LAYER.setZIndex(0);
  }
  STAGE.draw();
}
