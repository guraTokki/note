
(function (factory) {
    if (typeof module == "object" &&  typeof module.exports === "object") {
      var v = factory(require, exports);
      if(v !== undefined) module.exports = v
    }
    else if( typeof define === "function" && define.amd) {
      define(["require", "exports"], factory)
    } else {
      factory(null, window)
    }
})(function (require, exports) {

function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

class Point {
  constructor(x, y) {
    this.x = x
    this.y = y
  }
  setPositon(x, y) {
    this.x = x
    this.y = y
  }
}
exports.Point = Point

class Rectangle {
  constructor(x, y, width, height) {
      if(width<0) {
        x = x + width
        width *= -1
      }
      if(height<0) {
        y = y + height
        height *= -1
      }
      this.x = x
      this.y = y
      this.width = width
      this.height = height
  }

  Contains(obj) {
    if(obj instanceof Point) {
      var x = obj.x, y = obj.y
      if( (this.x <= x && x <= this.x + this.width)
        && (this.y <= y && y <= this.y + this.height) ) {
          return true
        }
        return false
    } else if(obj instanceof Rectangle) {
      var rt = obj
      if(this.x < rt.x && this.y < rt.y
        && (this.x + this.width) > (rt.x + rt.width)
        && (this.y + this.height) > (rt.y + rt.height) ) {
          return true
        }
      return false
    } else {
      console.log("error rectangle Contains")
    }
  }
  get Left() { return this.x}
  get Right() { return this.x + this.width}
  get Top() { return this.y}
  get Bottom() {return this.y + this.height}

  get Center() {
    return new Point( this.x + this.width/2, this.y + this.height/2)
  }
}
exports.Rectangle = Rectangle

class Drawable {
  constructor() {
    this.m_bVisible = true;
    this.m_bSelected = false;
    this.m_oTag = null;
    this.m_oElement = null;
    this.m_bEditable = false;
  }

  get Visible() {return this.m_bVisible}
  set Visible(value) {this.m_bVisible=value}

  get Selected() { return this.m_bSelected}
  set Selected(value) {this.m_bSelected=value}

  get Tag() {return this.m_oTag}
  set Tag(value) {this.m_oTag=value}

  get Element() { return this.m_oElement}

  get Editable() { return this.m_bEditable}
  set Editable(value) {this.m_bEditable = value}
}

exports.Drawable = Drawable

class Port extends Drawable {
    constructor(owner) {
      super()
      this.PORT_SIZE = 10;
      this.m_oOwner = owner;
      this.m_rtBound = null;

      var svgns = "http://www.w3.org/2000/svg";
      var rect = document.createElementNS(svgns, 'rect');

      rect.setAttribute('fill', 'transparent')
      rect.style.stroke = "black"
      rect.style["stroke-width"] = 2
      this.m_oElement = rect;

      this.Owner.Element.appendChild(this.m_oElement)
    }
    get Owner() {
      return this.m_oOwner
    }

    GetBounds() { return this.m_rtBound}
    SetBounds(x, y, w, h) {
      this.m_rtBound = new Rectangle(x,y,w,h)
    }
    SetPosition(x, y) {
      this.m_rtBound.x = x - this.PORT_SIZE/2
      this.m_rtBound.y = y - this.PORT_SIZE/2
      this.m_rtBound.width = this.PORT_SIZE
      this.m_rtBound.height = this.PORT_SIZE
    }

    Draw() {
      if(this.Visible) {
        if(this.m_oElement == null) {

        }
        this.m_oElement.setAttribute('x', this.m_rtBound.x);
        this.m_oElement.setAttribute('y', this.m_rtBound.y);
        this.m_oElement.setAttribute('height', this.m_rtBound.height);
        this.m_oElement.setAttribute('width', this.m_rtBound.width);
        if(this.Owner.Selected) {
          this.Element.style.display = ''
        } else {
          this.Element.style.display = 'none'
        }

      } else {

      }
    }
}
exports.Port = Port

class Node extends Drawable {
  constructor(id) {
    super()
    if(id == null) {
      id = uuidv4()
    }
    this.m_oID = id
    this.key = null
    this.x = 0;
    this.y = 0
    this.width = 170
    this.height = 22
    this.tag = null

    this.m_value = ""

    var svgns = "http://www.w3.org/2000/svg";
    var g = document.createElementNS(svgns, 'g');
    this.m_oElement = g
    this.m_rtBound = new Rectangle(this.x, this.y, this.width, this.height)

    this.m_oInPort = new Port(this)
    this.m_oInPort.SetBounds(this.m_rtBound.Left-15, (this.m_rtBound.Top + this.m_rtBound.Bottom)/2, 15, 15)
    this.m_oOutPort = new Port(this)
    this.m_oOutPort.SetBounds(this.m_rtBound.Right+15, (this.m_rtBound.Top + this.m_rtBound.Bottom)/2, 15, 15)
    this.m_oResizePort = new Port(this)
    this.m_oResizePort.SetBounds(this.m_rtBound.Right+5, this.m_rtBound.Bottom+5, 15,15)

    this.m_arrPorts = []
    {
      var svgns = "http://www.w3.org/2000/svg";
      var rect1 = document.createElementNS(svgns, 'rect');
      rect1.setAttribute('fill', 'transparent')
      rect1.classList.add('selectedRect')
      rect1.style.stroke = "blue"
      rect1.style["stroke-width"] = 3
      //g.appendChild(rect1)
      this.Element.appendChild(rect1)

      this.selectedRect = rect1
    }
    {
      var svgns = "http://www.w3.org/2000/svg";
      var rect = document.createElementNS(svgns, 'rect');
      rect.setAttribute('fill', 'transparent')
      rect.style.stroke = "black"
      rect.style["stroke-width"] = 2
      rect.tag = this;
      this.m_oElement.appendChild(rect)
      this.rect = rect;

      var foreignObject = document.createElementNS(svgns, 'foreignObject')
      foreignObject.classList.add('node')
      foreignObject.setAttribute('x', this.x)
      foreignObject.setAttribute('y', this.y)
      foreignObject.setAttribute('height', this.height)
      foreignObject.setAttribute('width', this.width)
      this.m_oElement.appendChild(foreignObject)

      var div = document.createElement("div")
      div.className = 'view'
      //div.innerHTML = "test data"
      div.innerHTML = marked(this.Value)


      foreignObject.appendChild(div)

      var textarea = document.createElement("textarea")
      textarea.className = 'edit'
      textarea.style.width = "100%"
      textarea.style.height = '100%'
      textarea.placeholder = 'edit here'
      textarea.style.display = 'none'

      textarea.onmousedown = (e) => {e.stopPropagation()}
      textarea.onmousemove = (e) => {e.stopPropagation()}
      textarea.onmouseup = (e) => {e.stopPropagation()}
      textarea.onkeydown = (e) => {e.stopPropagation()}

      var self = this
      textarea.addEventListener('change', evt => self.UpdateValue(evt))
      foreignObject.appendChild(textarea)
    }

    //this.m_oElement = rect
  }

  get ID() {return this.m_oID}

  get Value() {return this.m_value}
  set Value(value) {
    this.m_value = value
    this.Element.querySelector(".view").innerHTML = marked(this.m_value)
  }

  UpdateValue(event) {
    this.Value = event.target.value
  }

  setPositon(x, y) {
    this.x = x
    this.y = y

    this.m_rtBound.x = this.x
    this.m_rtBound.y = this.y
/*
    this.rect.setAttribute("x", this.x)
    this.rect.setAttribute("y", this.y)

    this.selectedRect.setAttribute("x", this.x)
    this.selectedRect.setAttribute("y", this.y)
    */
    this.RecalcPortPosition()
  }

  get Name() {
    if (this.tag != undefined && this.tag.name != undefined) {
      return this.tag.name
    } else {
      return 'noname'
    }
  }

  get InPort() { return this.m_oInPort  }
  get OutPort() { return this.m_oOutPort }
  get ResizePort() { return this.m_oResizePort }

  get Ports() { return this.m_arrPorts}

  get X() { return this.x}
  set X(value) {
    this.x = value
    this.m_rtBound.x = value
    this.RecalcPortPosition()
  }
  get Y() {return this.y}
  set Y(value) {
    this.y = value
    this.m_rtBound.y = value
    this.RecalcPortPosition()
  }
  get Width() {return this.width}
  set Width(value) {
    this.width = value
    this.m_rtBound.width = value
    this.RecalcPortPosition()
  }
  get Height() {return this.height}
  set Height(value) {
    this.height = value
    this.m_rtBound.height = value
    this.RecalcPortPosition()
  }

  get Selected() {return this.m_bSelected}
  set Selected(value) {
    this.m_bSelected = value
    if(this.m_bSelected == false) {
      this.Editable = false
    }
  }

  get Editable() {return super.Editable}
  set Editable(value) {
      this.m_bEditable = value

      if(this.m_bEditable) {
        this.Element.querySelector('.view').style.display = 'none'
        this.Element.querySelector('.edit').style.display = ''
        this.Element.querySelector('.edit').value = this.m_value
      } else {
        this.Element.querySelector('.view').style.display = ''
        this.Element.querySelector('.edit').style.display = 'none'
      }

  }

  contains(x, y) {
    // console.log( this.x, this.x+this.width, this.y,  this.y+this.height)
    // console.log((this.x <= x && x < this.x + this.width))
    // console.log(this.y <= y && y < this.y + this.height)
    if( (this.x <= x && x < this.x + this.width)
      && (this.y <= y && y < this.y + this.height) ) {
        return true
      }

    return false
  }

  GetBounds() {
    return this.m_rtBound
  }

  SetBounds(x, y, w, h) {
    this.m_rtBound = new Rectangle(x, y, w, h)
    this.RecalcPortPosition();
  }

  MoveDelta(dx, dy) {
    this.setPositon(this.x+dx, this.y+dy)
    /*
      this.x += dx
      this.y += dy

      this.m_oElement.setAttribute("x", this.x)
      this.m_oElement.setAttribute("y", this.y)
      */
  }

  RecalcPortPosition() {
    this.InPort.SetPosition(this.m_rtBound.Left, (this.m_rtBound.Top + this.m_rtBound.Bottom)/2)
    this.OutPort.SetPosition(this.m_rtBound.Right, (this.m_rtBound.Top + this.m_rtBound.Bottom)/2)
    this.ResizePort.SetPosition(this.m_rtBound.Right+5, this.m_rtBound.Bottom+5)

    /*
    var nPortCount = this.m_arrPorts.length
    for(var ii = 0; ii < nPortCount; ii++) {
      var x = (this.m_rtBound.Right - this.m_rtBound.Left)/nPortCount * (ii+1)
      var y = (this.m_rtBound.Top - this.m_rtBound.Bottom)/nPortCount * (ii+1)
      this.Ports[ii].SetPosition(x, y)
    }
    */
  }

  Draw(svg) {
    // draw rectanle

    this.rect.setAttribute('x', this.x);
    this.rect.setAttribute('y', this.y);
    this.rect.setAttribute('height', this.height);
    this.rect.setAttribute('width', this.width);

    //foreignObject.classList.add('node')
    var foreignObject = this.Element.querySelector(".node")
    if(foreignObject != null) {
      foreignObject.setAttribute('x', this.x)
      foreignObject.setAttribute('y', this.y)
      foreignObject.setAttribute('height', this.height)
      foreignObject.setAttribute('width', this.width)
    }

    if(this.Selected) {
      this.selectedRect.setAttribute('x', this.x);
      this.selectedRect.setAttribute('y', this.y);
      this.selectedRect.setAttribute('height', this.height);
      this.selectedRect.setAttribute('width', this.width);
      this.selectedRect.style.display = ''
    } else {
      if(this.selectedRect != null) {
        this.selectedRect.style.display = 'none'
      }
    }
    this.InPort.Draw()
    this.OutPort.Draw()
    this.ResizePort.Draw()

    this.Ports.forEach((item, i) => {
      //item.Draw()

    });

  }

  handleDblClick(evt) {
    this.Editable = true;
  }
}
exports.Node = Node

class Edge extends Drawable {
  constructor() {
    super()
    this.From = null
    this.To = null

    this.m_oPoints = []

    var svgns = "http://www.w3.org/2000/svg";
    var element = document.createElementNS(svgns, 'line');
    //element.setAttribute("x1", this.From.x)
    //element.setAttribute("y1", this.From.y)
    //element.setAttribute("x2", this.To.x)
    //element.setAttribute("y2", this.To.y)
    element.setAttribute("stroke-width", 1)
    element.setAttribute("stroke", "black");
    element.setAttribute("marker-end", "url(#arrow)");
    //svg.appendChild(element)
    this.m_oElement = element
  }

  get From() {return this.m_oFromNode}
  set From(value) {
    if(value == null) {
      return
    }
    this.m_oFromNode = value
    value.Ports.push(new Port(value))

    var element = this.Element
    element.setAttribute("x1", (this.From.m_rtBound.Left + this.From.m_rtBound.Right)/2)
    element.setAttribute("y1", (this.From.m_rtBound.Top + this.From.m_rtBound.Bottom)/2)


  }

  get To() {return this.m_oToNode}
  set To(value) {
    if(value == null) {
      return
    }
    this.m_oToNode = value
    value.Ports.push()

    var element = this.Element
    element.setAttribute("x2", (this.To.m_rtBound.Left + this.To.m_rtBound.Right)/2)
    element.setAttribute("y2", (this.To.m_rtBound.Top + this.To.m_rtBound.Bottom)/2)
  }

  GetPointCount() { return this.m_oPoints.length}
  GetPointAt(i) {return this.m_oPoints[i]}
  AddPoint(pt) { this.m_oPoints.push(pt)}
  RemovePoint(pt) {/*todo */}
  RemovePointAt(i) {/*todo*/}
  IndexOfPoint(pt) {/*todo*/}
  ContainPoint(pt) {/*todo*/}

  Draw(svg) {
    /*
    var svgns = "http://www.w3.org/2000/svg";
    var element = document.createElementNS(svgns, 'line');
    element.setAttribute("x1", this.From.x)
    element.setAttribute("y1", this.From.y)
    element.setAttribute("x2", this.To.x)
    element.setAttribute("y2", this.To.y)
    element.setAttribute("stroke-width", 1)
    element.setAttribute("stroke", "black");
    element.setAttribute("marker-end", "url(#arrow)");
    svg.appendChild(element)
    this.m_oElement = element
    */

    var pt1 = this.From.m_rtBound.Center
    var pt2 = this.To.m_rtBound.Center

    var from = IntersectionPoint(this.From.m_rtBound, pt1, pt2)
    var to = IntersectionPoint(this.To.m_rtBound, pt1, pt2)

    this.m_oPoints[0] = from
    this.m_oPoints[1] = to

    this.Element.setAttribute("x1", from.x)
    this.Element.setAttribute("y1", from.y)
    this.Element.setAttribute("x2", to.x)
    this.Element.setAttribute("y2", to.y)
    if(this.Selected) {
      this.Element.setAttribute("stroke", "blue");
      this.Element.setAttribute("stroke-width", 3)
    } else {
      this.Element.setAttribute("stroke", "black");
      this.Element.setAttribute("stroke-width", 1)
    }

    if(this.Editable) {
      var textarea = document.createElement("textarea")
      this.Element.appendChild(textarea)
    }

  }
  MoveDelta() {
    this.m_oElement.setAttribute("x1", (this.From.m_rtBound.Left+this.From.m_rtBound.Right)/2)
    this.m_oElement.setAttribute("y1", (this.From.m_rtBound.Top + this.From.m_rtBound.Bottom)/2)
    this.m_oElement.setAttribute("x2", (this.To.m_rtBound.Left+this.To.m_rtBound.Right)/2)
    this.m_oElement.setAttribute("y2", (this.To.m_rtBound.Top + this.To.m_rtBound.Bottom)/2)
  }
}
exports.Edge = Edge

class PortEdge extends Edge {
    constructor() {
      super()
    }

    set From(value) {
      if(value == null) {
        return
      }
      this.m_oFromNode = value
      var element = this.Element


      //element.setAttribute("x1", this.From.m_rtBound.Right)
      //element.setAttribute("y1", (this.From.m_rtBound.Top + this.From.m_rtBound.Bottom)/2)
    }

    set To(value) {

    }
}
exports.PortEdge = PortEdge

class Diagram {
  constructor(svg) {
    this.Nodes = []
    this.Edges = []
    this.SelectedObjects = []
    this.svg = svg
    var svgns = "http://www.w3.org/2000/svg";
    var g = document.createElementNS(svgns, 'g');
    g.classList.add("diagramlayer")
    this.m_oElement = g
    //this.svg.appendChild(this.m_oElement)
  }

  get Element() {return this.m_oElement}

  makeSample() {
    for(var ii = 0; ii < 2; ii++) {
      var oNode = new Node()
      //oNode.setPositon(Math.floor(Math.random()*300), Math.floor(Math.random()*400))
      oNode.setPositon(ii*100 + 200, ii*100+100)
      this.addNode(oNode)
    }
    for(var ii= 0; ii < 2; ii++){
      var oEdge = new Edge()
      var ij = Math.floor(Math.random()*2)
      var ik = Math.floor(Math.random()*2)
      if(ij == ik) continue
      oEdge.From = this.Nodes[ij]
      oEdge.To = this.Nodes[ik]
      this.addEdge(oEdge)
    }
  }
  addNode(oNode) {
    this.Nodes.push(oNode)
    this.m_oElement.appendChild(oNode.Element)
  }
  addEdge(oEdge) {
    this.Edges.push(oEdge)
    this.m_oElement.appendChild(oEdge.Element)
  }

  RemoveNode(oNode) {
    var idx = this.Nodes.indexOf(oNode)
    if(idx > -1) {
      this.Nodes.splice(idx,1)
    }
    this.m_oElement.removeChild(oNode.Element)
  }
  RemoveNodeAt(index) {
    this.Nodes.splice(idx,1)
    this.m_oElement.removeChild(oNode.Element)
  }

  GetNode(uuid) {
      return this.Nodes.find(item => item.ID == uuid)
  }

  GetEdge(oFrom, oTo) {
    return this.Edges.find( item => item.From == oFrom && item.To == oTo )
  }

  RemoveEdge(oEdge) {
    var idx = this.Edges.indexOf(oEdge)
    if(idx > -1) {
      this.Edges.splice(idx,1)
      this.m_oElement.removeChild(oEdge.Element)
    }
  }

  PickAt(x, y) {
    //return this.Nodes.find( item => item.contains(x, y));

    for(var ii = 0; ii < this.Nodes.length; ii++) {
      var oNode = this.Nodes[ii]

      var oPort;
      oPort = oNode.InPort
      if(oPort.Visible) {
          var rtPort = oPort.GetBounds();
          if(rtPort.Contains(new Point(x, y))) {
            return oPort
          }
      }

      oPort = oNode.OutPort
      if(oPort.Visible) {
          var rtPort = oPort.GetBounds();
          if(rtPort.Contains(new Point(x, y))) {
            return oPort
          }
      }

      oPort = oNode.ResizePort
      if(oPort.Visible) {
        var rtPort = oPort.GetBounds()
        if(rtPort.Contains(new Point(x, y))) {
          return oPort
        }
      }

      var rtNode = oNode.GetBounds()
      if(rtNode.Contains(new Point(x,y))) {
        return oNode
      }
    }

    for(var ii = 0; ii < this.Edges.length; ii++) {
      var oEdge = this.Edges[ii]
      var bOnEdge = false
      for(var ix = 0; ix < oEdge.GetPointCount() -1; ix++) {
        var startp = oEdge.GetPointAt(ix)
        var endp = oEdge.GetPointAt(ix+1)
        //console.log("x:", x, "y:", y, "S.x:", startp.x, "S.y:", startp.y, "E.x:",endp.x, "E.y:", endp.y)

        if( (endp.x - startp.x) == 0) {
          if( (x - startp.x) == 0) {
            if( (y - startp.y) * (y - endp.y) < 0) {
              bOnEdge = true
              break
            }
          }
        } else if( (endp.y - startp.y) == 0) {
          if( (x - startp.x) * (x - endp.x) < 0) {
            bOnEdge = true
            break
          }
        } else{
          var d1 = (endp.y - startp.y)/(endp.x - startp.x)
          var d2 = (y - startp.y)/(x - startp.x)
          console.log("d2/d1:", d2/d1, d1, d2, d1-d2)

          //if( 0.9 < d2/d1 && d2/d1 < 1.1
          if( -0.15 < (d1 - d2) && (d1 -d2) < 0.15
            && (x - startp.x) * (x - endp.x) < 0
            && (y - startp.y) * (y - endp.y) < 0) {
            bOnEdge = true;
            break;
          } else {
            console.log("d1:", d1, "d2", d2, "d1-d2", d1-d2)
            console.log("(x - startp.x) * (x - endp.x)", (x - startp.x) * (x - endp.x))
            console.log("(y - startp.y) * (y - endp.y)", (y - startp.y) * (y - endp.y))
          }
        }
      }
      if(bOnEdge) {
        console.log("pick at edge", x, y)
        return oEdge
      }
    }

    //return null
  }

  MoveDelta(dx,  dy, bSelectedOnly = true) {
    this.Nodes.forEach((item, i) => {
      if(!bSelectedOnly || item.Selected) {
        item.MoveDelta(dx, dy)
      }
    });

    this.Edges.forEach((item, i) => {
      if(!bSelectedOnly || item.From.Selected || item.To.Selected) {
        item.MoveDelta()
      }
    });
  }

  Select(obj) {
    if( obj instanceof Rectangle) {
      this.SelectRange(obj)
    } else if(obj instanceof Point) {
      this.SelectPoint(obj)
    } else if(obj instanceof Node) {
      this.SelectDrawable(obj)
    } else if(obj instanceof Edge) {
      this.SelectDrawable(obj)
    }
  }
  SelectDrawable(oDrawable) {
    if(oDrawable != null) {
      oDrawable.Selected = true;
      this.SelectedObjects.push(oDrawable)
    }
  }

  SelectRange(oRectangle) {
    this.DeselectAll();
    for(var ii=this.Nodes.length-1; ii >= 0; --ii) {
      var oNode = this.Nodes[ii];
      var rtNode = oNode.GetBounds();
      console.log('x', oRectangle.x, 'y', oRectangle.y, 'rt: x:', rtNode.x, 'y:',  rtNode.y)
      if( oRectangle.Contains(rtNode)) {
        this.Select(oNode)
      }
    }
  }

  SelectPoint(pt, bFindFirst=true) {
    this.DeselectAll();
    for(var ii=this.Nodes.length-1; ii >= 0; --ii) {
      var oNode = this.Nodes[ii];
      var rtNode = this.GetBounds();
      if( rtNode.Contain(pt)) {
        this.Select(oNode)
        if(bFindFirst) break;
      }
    }
  }

  UnSelect(oDrawable) {
      if(oDrawable != null) {
        oDrawable.Selected = false;
        var idx = this.SelectedObjects.indexOf(oDrawable)
        if(idx > -1)
          this.SelectedObjects.splice(idx, 1)
      }
  }

  DeselectAll() {
    this.Nodes.forEach((item, i) => {
      this.UnSelect(item)
    });
    this.Edges.forEach((item, i) => {
      this.UnSelect(item)
    });
  }

  createDiagramElements(svg) {
    console.log('draw diagram')
    //var svg = d3.select("#diagram")
    this.Nodes.forEach((item, i) => {
      createNodeElement(svg, item)
    });
    this.Edges.forEach((item, i) => {
      createEdgeElement(svg, item)
    });
  }

  Store() {
    var tmp_diagram = {nodes:[], edges:[]}
    console.log(JSON.stringify(tmp_diagram))
    for(var ii =0; ii < this.Nodes.length; ii++) {
      var oNode = this.Nodes[ii]
      var node = {}
      node.id = oNode.ID
      node.x = oNode.X
      node.y = oNode.y
      node.width = oNode.Width
      node.height = oNode.Height
      node.value = oNode.Value
      tmp_diagram.nodes.push(node)
    }

    for(var ii=0; ii < this.Edges.length; ii++) {
      var oEdge = this.Edges[ii]
      var edge = {}
      edge.from = oEdge.From.ID
      edge.To = oEdge.To.ID
      tmp_diagram.edges.push(edge)
    }
    console.log(JSON.stringify(tmp_diagram, null, '\t'))
    return JSON.stringify(tmp_diagram, null, '\t')
  }

  LoadFromString(strDiagram) {
    var tmp_diagram = JSON.parse(strDiagram)
    console.log(tmp_diagram)

    for(var ii=0; ii < tmp_diagram.nodes.length; ii++) {
      var node = tmp_diagram.nodes[ii]
      var oNode = new Node(node.id)
      //oNode.setPositon(Math.floor(Math.random()*300), Math.floor(Math.random()*400))
      oNode.setPositon(node.X, node.Y)
      this.addNode(oNode)
    }
    for(var ii = 0; ii < tmp_diagram.edges.length; ii++) {
      var edge = tmp_diagram.edges[ii]
      var oEdge = new Edge()
    }
  }

}
exports.Diagrm = Diagram


});
