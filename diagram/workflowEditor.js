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

  const MouseState = Object.freeze({
    None:   Symbol("None"),
    Pressed:  Symbol("Pressed"),
    Dragged: Symbol("Dragged")
  });

class MouseHandler {

  constructor() {
    this.m_ptPress;
    this.m_ptMove;
    this.m_ptMoveDelta;
    this.m_ptRelease;
    this.m_eMouseState = MouseState.None;
  }

  OnMouseDown(oDiagram, pt) {
    this.m_eMouseState = MouseState.Pressed;
    this.m_ptPress = pt;
    this.m_ptMove = pt;
    //console.log("mousehandler onMouseDown", this.m_ptPress)
    return true;
  }

  OnMouseMove(oDiagram, pt) {
    if(this.m_eMouseState == MouseState.None) {
      return false
    }  else {
      this.m_eMouseState = MouseState.Dragged;
      this.m_ptMoveDelta = new Point(pt.x - this.m_ptMove.x, pt.y - this.m_ptMove.y);
      this.m_ptMove = pt;
      return true;
    }
  }

  OnMouseUp(oDiagram, pt) {
    this.m_eMouseState = MouseState.None;
    this.m_ptMoveDelta = new Point(pt.x - this.m_ptMove.x, pt.y - this.m_ptMove.y);
    this.m_ptRelease = pt;
    return true;
  }

  Draw(svg) {
    //
  }
}

class SelectHandler extends MouseHandler {
  constructor() {
    super()
  }
  // OnMouseDown(oDiagram, pt) {
  //   return base.OnMouseDown(oDiagram,pt)
  // }
  OnMouseUp(oDiagram, pt) {
      this.m_ptRelease = pt;

      if(this.m_eMouseState == MouseState.Pressed)  {
        oDiagram.Select(this.m_ptPress)
      } else {
        oDiagram.Select(
          new Rectangle(
            this.m_ptPress.x,
            this.m_ptPress.y,
            pt.x - this.m_ptPress.x,
            pt.y - this.m_ptPress.y
          ))
      }

      this.m_eMouseState = MouseState.None;
  }

  Draw(rect) {
    if(this.m_eMouseState == MouseState.None || this.m_eMouseState != MouseState.Dragged) {
      rect.setAttribute('height', 0);
      rect.setAttribute('width', 0);
      return
    }
    var minX = 0, maxX = 0, minY=0, maxY=0, height = 0, width = 0
    if( this.m_ptPress.x < this.m_ptMove.x) {
      minX = this.m_ptPress.x
      maxX = this.m_ptMove.x
    } else {
      maxX = this.m_ptPress.x
      minX = this.m_ptMove.x
    }
    if(this.m_ptPress.y < this.m_ptMove.y) {
      minY = this.m_ptPress.y
      maxY = this.m_ptMove.y
    } else {
      maxY = this.m_ptPress.y
      minY = this.m_ptMove.y
    }
    height = maxY - minY
    width = maxX - minX

    rect.setAttribute('x', minX);
    rect.setAttribute('y', minY);
    rect.setAttribute('height', height);
    rect.setAttribute('width', width);

    //console.log("select Draw", this.m_eMouseState, this.m_ptPress, this.m_ptMove)
  }

}

class MoveHandler extends MouseHandler {
  constructor() {
    super()
    this.m_arrBounds = [] //  array of svg rect
  }
  OnMouseDown(oDiagram, pt) {
    this.m_arrBounds.splice(0, this.m_arrBounds.length)
    var layer = workflowEditor.svg.querySelector('.movelayer')
    while(layer.firstChild) layer.removeChild(layer.firstChild)

    oDiagram.SelectedObjects.forEach((item, i) => {
      if( item instanceof Node) {
        var rect = createRect(item.x, item.y, item.width, item.height)
        //rect.setAttribute("storke", "blue")
        rect.style.stroke = "grey"
        //rect.style.strokeWidth = 3
        rect.setAttribute('fill', 'transparent')
        rect.style["stroke-width"] = 3
        rect.style["stroke-dasharray"] = "5,5"
        this.m_arrBounds.push(rect)
        //oDiagram.m_oElement.appendChild(rect)
        oDiagram.svg.querySelector(".movelayer").appendChild(rect)
      }
    });
    return super.OnMouseDown(oDiagram, pt)
  }
  OnMouseMove(oDiagram, pt) {
    var result = super.OnMouseMove(oDiagram, pt)
    if(result) {
      this.m_arrBounds.forEach((item, i) => {
        //item.x += this.m_ptMoveDelta.x
        var x = item.getAttribute('x')*1,
            y = item.getAttribute('y')*1
        item.setAttribute('x', x + this.m_ptMoveDelta.x)
        item.setAttribute('y', y + this.m_ptMoveDelta.y)
        //item.y += this.m_ptMoveDelta.y
        //console.log('move', item.x, item.y)
      });
    }
    return result
  }
  OnMouseUp(oDiagram, pt) {
    this.m_arrBounds.forEach((item, i) => {
      //oDiagram.m_oElement.removeChild(item)
      oDiagram.svg.querySelector(".movelayer").removeChild(item)
    });
    this.m_arrBounds.splice(0, this.m_arrBounds.length)

    var result = super.OnMouseUp(oDiagram, pt)
    if(result) {
      var ptDelta = new Point()
      ptDelta.x = this.m_ptRelease.x - this.m_ptPress.x
      ptDelta.y = this.m_ptRelease.y - this.m_ptPress.y

      oDiagram.MoveDelta(ptDelta.x, ptDelta.y)
    }
    //console.log("end of OnMouseUp MoveHandler")
    return result
  }
  Draw(svg) {
    //
  }
}

class ResizeHandler extends MouseHandler {
  constructor() {
    super()
    this.m_oNode = null
    this.m_rtBounds = null //
  }
  OnMouseDown(oDiagram, pt) {
    if( oDiagram.SelectedObjects.length > 0) {
      var oNode = oDiagram.SelectedObjects[0]
      console.log("Resize handler", oNode)
      this.m_oNode = oNode;
      var rect = createRect(oNode.x, oNode.y, oNode.width, oNode.height)
      //rect.setAttribute("storke", "blue")
      rect.style.stroke = "red"
      //rect.style.strokeWidth = 3
      rect.setAttribute('fill', 'transparent')
      rect.style["stroke-width"] = 3
      rect.style["stroke-dasharray"] = "5,5"
      this.m_rtBounds = rect
      oDiagram.svg.appendChild(rect)
    }
    return super.OnMouseDown(oDiagram, pt)
  }
  OnMouseMove(oDiagram, pt) {
    var result = super.OnMouseMove(oDiagram, pt)
    // this.m_rtBounds.Width += this.m_ptMoveDelta.x
    // this.m_rtBounds.Height += this.m_ptMoveDelta.y
    var item = this.m_rtBounds
    var w = item.getAttribute('width')*1,
        h = item.getAttribute('height')*1
    item.setAttribute('width', w + this.m_ptMoveDelta.x)
    item.setAttribute('height', h + this.m_ptMoveDelta.y)
    return result
  }

  OnMouseUp(oDiagram, pt) {
    var result = super.OnMouseUp(oDiagram, pt)
    if(result) {
      var w = this.m_rtBounds.getAttribute('width')*1,
          h = this.m_rtBounds.getAttribute('height')*1
      this.m_oNode.Width = w + this.m_ptMoveDelta.x
      this.m_oNode.Height = h + this.m_ptMoveDelta.y
    }
    oDiagram.svg.removeChild(this.m_rtBounds)
    return result
  }
}

class EdgeCreateHandler extends MouseHandler {
  constructor(bOutGoing) {
    super()
    this.m_oFromNode = null
    this.m_oToNode = null
    this.m_bConnectable = false
    this.m_bOutGoing = bOutGoing

    this.m_oElement = null
  }
  OnMouseDown(oDiagram, pt) {
    oDiagram.DeselectAll()

    var result = super.OnMouseDown(oDiagram, pt)

    var oPort = oDiagram.PickAt(this.m_ptPress.x, this.m_ptPress.y)
    var oNode = (oPort == null) ? null : oPort.Owner

    this.m_oFromNode = this.m_bOutGoing? oNode : null
    this.m_oToNode = this.m_bOutGoing? null : oNode

    this.m_bConnectable = false

    if(oNode != null) {
      //this.m_ptPress
    }

    this.m_oElement = createLine()
    oDiagram.svg.appendChild(this.m_oElement)
  }
  OnMouseMove(oDiagram, pt) {
    var result = super.OnMouseMove(oDiagram, pt)
    var oNode = oDiagram.PickAt(this.m_ptMove.x, this.m_ptMove.y)
    this.m_oFromNode = this.m_bOutGoing? this.m_oFromNode : oNode
    this.m_oToNode = this.m_bOutGoing? oNode : this.m_oToNode
    this.m_bConnectable = ( (this.m_oFromNode != null) && (this.m_oToNode != null)
              && this.IsConnectable(this.m_oFromNode, this.m_oToNode))

    if(this.m_bOutGoing) {
      this.m_oElement.setAttribute("x1", this.m_ptPress.x)
      this.m_oElement.setAttribute("y1", this.m_ptPress.y)
      this.m_oElement.setAttribute("x2", this.m_ptMove.x)
      this.m_oElement.setAttribute("y2", this.m_ptMove.y)
    } else {
      this.m_oElement.setAttribute("x1", this.m_ptMove.x)
      this.m_oElement.setAttribute("y1", this.m_ptMove.y)
      this.m_oElement.setAttribute("x2", this.m_ptPress.x)
      this.m_oElement.setAttribute("y2", this.m_ptPress.y)
    }

    return result
  }

  OnMouseUp(oDiagram, pt) {
    var result = super.OnMouseUp(oDiagram, pt)
    if(this.m_bConnectable) {
      //
      if(oDiagram.GetEdge(this.m_oFromNode, this.m_oToNode) == null) {
        var oEdge = new Edge()
        oEdge.From = this.m_oFromNode
        oEdge.To = this.m_oToNode
        oDiagram.addEdge(oEdge)
      } else {
        console.log("edge 가 이미 존재", this.m_oFromNode, this.m_oToNode)
      }
      //console.log("create edge", this.m_oFromNode, this.m_oToNode)
    }
    oDiagram.svg.removeChild(this.m_oElement)
    return result
  }

  IsConnectable(oFromNode, oToNode) {
    if(oFromNode == oToNode) return false
    return true
  }
}


class NodeCreateHandler extends MouseHandler {
  constructor() {
    super()
  }
  OnMouseDown(oDiagram, pt) {
    oDiagram.DeselectAll()

    var result = super.OnMouseDown(oDiagram, pt)
    var oNode = new Node()
    oNode.setPositon(this.m_ptPress.x, this.m_ptPress.y)
    oDiagram.addNode(oNode)
  }
}

class NodeEditHandler extends MouseHandler {
  constructor() {
    super()
  }
  OnMouseDown(oDiagram, pt) {
    var svgns = "http://www.w3.org/2000/svg";
    this.m_oElement = document.createElementNS(svgns, 'foreignObject')
    var textarea = document.createElement("textarea")
    this.m_oElement.appendChild(textarea)
    var oNode = oDiagram.SelectedObjects[0];
    this.m_oElement.setAttribute("x", oNode.X)
    this.m_oElement.setAttribute("y", oNode.Y)
    this.m_oElement.setAttribute("width", oNode.Width)
    this.m_oElement.setAttribute("height", oNode.Height)
    oDiagram.svg.appendChild(this.m_oElement)
    return true
  }
  OnMouseUp(oDiagram, pt) {
    return true;
  }
}

class MouseHandlerManager  extends MouseHandler {
    constructor() {
      super();
      this.m_oHandlers = {}

      this.m_oHandlers["select"] = new SelectHandler();
      this.m_oHandlers["move"] = new MoveHandler();
      this.m_oHandlers["resize"] = new ResizeHandler();
      this.m_oHandlers["outedgecreate"] = new EdgeCreateHandler(true);
      this.m_oHandlers["inedgecreate"] = new EdgeCreateHandler(false);
      this.m_oHandlers["nodecreate"] = new NodeCreateHandler();
      //this.m_oHandlers["edit"] = new NodeEditHandler();

      this.m_oActiveHandler = null;
      this.m_strActiveHandler = ""

      this.SetActiveHandler("select")
    }

    SetActiveHandler(name) {
      //console.log('SetActiveHandler', this.m_strActiveHandler, '->', name)
      this.m_strActiveHandler = name.toLowerCase();
      this.m_oActiveHandler = this.m_oHandlers[this.m_strActiveHandler]
    }

    OnMouseDown(oDiagram, pt) {
      this.DetermineActiveHandler(oDiagram, pt);
      if(this.m_oActiveHandler != null) {
        //console.log("call active handler", this.m_strActiveHandler)
        return this.m_oActiveHandler.OnMouseDown(oDiagram, pt);
      } else {
        return false;
      }

    }

    OnMouseMove(oDiagram, pt) {
      if(this.m_oActiveHandler != null) {
        return this.m_oActiveHandler.OnMouseMove(oDiagram, pt);
      } else {
        return false
      }
    }

    OnMouseUp(oDiagram, pt) {
      if(this.m_oActiveHandler != null) {
        //console.log("call active handler", this.m_strActiveHandler)
        return this.m_oActiveHandler.OnMouseUp(oDiagram, pt);
      } else {
        return false
      }

    }

    DetermineActiveHandler(oDiagram, point) {

      // 만약 현재 select handler이면
      if(this.m_strActiveHandler == "select" || this.m_strActiveHandler == "move") {
        var oDrawable = oDiagram.PickAt(point.x, point.y);
        if( oDrawable != null) {
          if(oDrawable instanceof Node) {
            if(oDiagram.SelectedObjects.indexOf(oDrawable) > -1) {
                this.SetActiveHandler("move")
                return
            } else {
              this.SetActiveHandler("move")
              oDiagram.DeselectAll()
              oDiagram.Select(oDrawable)
            }
          } else if(oDrawable instanceof Port) {
            var oPort = oDrawable
            if(oPort == oPort.Owner.OutPort) {
              oDiagram.DeselectAll();
              this.SetActiveHandler("outedgecreate")
            } else if(oPort == oPort.Owner.InPort) {
              oDiagram.DeselectAll();
              this.SetActiveHandler("inedgecreate")
            } else if(oPort == oPort.Owner.ResizePort) {
              this.SetActiveHandler("resize")
            }
          } else if(oDrawable instanceof Edge) {
            oDiagram.DeselectAll();
            oDiagram.Select(oDrawable)
          }
        } else {  //  아무것도 선택되지 않았다면
          oDiagram.DeselectAll()
        }
      }
    }

    Draw(rect) {
      if (this.m_oActiveHandler != null) {
        return this.m_oActiveHandler.Draw(rect)
      }
    }

}

function createRect( x, y, width, height) {
  var svgns = "http://www.w3.org/2000/svg";
  var rect = document.createElementNS(svgns, 'rect');
  rect.setAttribute('x', x);
  rect.setAttribute('y', y);
  rect.setAttribute('height', height);
  rect.setAttribute('width', width);
  return rect
}

function createLine() {
  var svgns = "http://www.w3.org/2000/svg";
  var element = document.createElementNS(svgns, 'line');
  // element.setAttribute("x1", oEdge.From.x)
  // element.setAttribute("y1", oEdge.From.y)
  // element.setAttribute("x2", oEdge.To.x)
  // element.setAttribute("y2", oEdge.To.y)
  element.setAttribute("stroke-width", 1)
  element.setAttribute("stroke", "black");
  element.setAttribute("marker-end", "url(#arrow)");
  return element
}
/*
  function createNodeElement(svg, oNode) {
    var svgns = "http://www.w3.org/2000/svg";
    var rect = document.createElementNS(svgns, 'rect');
    rect.setAttribute('x', oNode.x);
    rect.setAttribute('y', oNode.y);
    rect.setAttribute('height', oNode.height);
    rect.setAttribute('width', oNode.width);
    rect.tag = oNode;
    svg.appendChild(rect)
  }
  function createEdgeElement(svg, oEdge) {
    var svgns = "http://www.w3.org/2000/svg";
    var element = document.createElementNS(svgns, 'line');
    element.setAttribute("x1", oEdge.From.x)
    element.setAttribute("y1", oEdge.From.y)
    element.setAttribute("x2", oEdge.To.x)
    element.setAttribute("y2", oEdge.To.y)
    element.setAttribute("stroke-width", 1)
    element.setAttribute("stroke", "black");
    element.setAttribute("marker-end", "url(#arrow)");
    svg.appendChild(element)
  }
*/
class WorkflowEditor {
    constructor(svg) {
      this.m_oDiagram = null
      this.m_oMouseHandler = new MouseHandlerManager();
      //this.svg = null
      this.svg = svg

      var svgns = "http://www.w3.org/2000/svg";
      var g = document.createElementNS(svgns, 'g');
      g.classList.add('movelayer')
      this.svg.appendChild(g)

      var self = this
      svg.addEventListener('mousedown', (evt) => {self.handleMouseDown(evt)})
      svg.addEventListener('mouseup', (evt) => {self.handleMouseUp(evt)})
      svg.addEventListener('mousemove', (evt) => {self.handleMouseMove(evt)})
      svg.addEventListener('mouseleave', (evt) => {self.handleMouseLeave(evt)})
      svg.addEventListener('dblclick', (evt) => {self.handleDblClick(evt)})
      //document.querySelector("div.workflow").addEventListener('keydown', (evt) => {self.handleKeydown(evt)})
      svg.addEventListener('keydown', (evt) => {self.handleKeydown(evt)})

      this.m_oRect = createRect(0,0,0,0)
    }
    get Diagram() {
      return this.m_oDiagram
    }
    set Diagram(oDiagram) {
      this.m_oDiagram = oDiagram
      this.svg.appendChild(oDiagram.Element)
    }



    draw(svg) {
      // this.svg = svg
      // var self = this
      // svg.addEventListener('mousedown', (evt) => {self.handleMouseDown(evt)})
      // svg.addEventListener('mouseup', (evt) => {self.handleMouseUp(evt)})
      // svg.addEventListener('mousemove', (evt) => {self.handleMouseMove(evt)})
      // svg.addEventListener('mouseleave', (evt) => {self.handleMouseLeave(evt)})

      //console.log('draw diagram', this)
      this.m_oDiagram.Nodes.forEach((item, i) => {
        //createNodeElement(svg, item)
        item.Draw(svg)
      });
      this.m_oDiagram.Edges.forEach((item, i) => {
        //createEdgeElement(svg, item)
        item.Draw(svg)
      });

      this.svg.appendChild(this.m_oRect)
      //this.m_oDiagram.createDiagramElements(svg)
    }

    getMousePosition(evt) {
      var CTM = this.svg.getScreenCTM()
      return {
        x: (evt.clientX - CTM.e) / CTM.a,
        y: (evt.clientY - CTM.f) / CTM.d
      }
    }

    handleMouseDown(evt) {

      //console.log("handleMouseDown", this)
      var point = this.getMousePosition(evt)
      this.m_oMouseHandler.OnMouseDown(this.m_oDiagram, point)
      //console.log("handleMouseDown", evt, point, evt.target)
      //console.log(' pickAt', this.m_oDiagram.pickAt(point.x, point.y))
      this.draw(this.svg)
    }

    handleMouseMove(evt) {
      //console.log("workflowEditor handleMouseMove", evt)
      var point = this.getMousePosition(evt)
      this.m_oMouseHandler.OnMouseMove(this.m_oDiagram, point)
      this.m_oMouseHandler.Draw(this.m_oRect)
      //this.draw(this.svg)
    }
    handleMouseUp(evt) {
      //console.log("handleMouseUp", evt)
      var point = this.getMousePosition(evt)
      this.m_oMouseHandler.OnMouseUp(this.m_oDiagram, point)
      this.draw(this.svg)
      //console.log("handleMouseUp : call SetActiveHandler select")
      this.m_oMouseHandler.SetActiveHandler("select")
      return true
    }
    handleMouseLeave(evt) {
      //console.log("handleMouseLeave", evt)
    }

    handleDblClick(evt) {
      console.log("handleDblClick", evt.path)
      var point = this.getMousePosition(evt)
      //this.m_oMouseHandler.SetActiveHandler("edit")
      var oDrawable = this.m_oDiagram.PickAt(point.x, point.y);
      if( oDrawable != null) {
        if(oDrawable instanceof Node) {

          if(oDrawable.Selected) {
            oDrawable.Editable = true
            return
          }
        }
      } else {
        var oNode = new Node()
        oNode.setPositon(point.x, point.y)
        this.Diagram.addNode(oNode)
        oNode.Selected = true
        oNode.Editable = true
        oNode.Draw()

      }
    }

    handleKeydown(evt) {
      console.log('handleKeydown', evt)
      //evt.cancelBubble = true;
      if(evt.key == "Delete") {
        for(var ii = 0; ii < this.Diagram.SelectedObjects.length; ii++){
          var oDrawable = this.Diagram.SelectedObjects[ii]
          if( oDrawable instanceof Node) {
            var oNode = this.Diagram.SelectedObjects[ii]
            if( oNode.Editable) continue
            /* remove edge */
            for(var ij = 0; ij < this.Diagram.Edges.length; ij++) {
              var oEdge = this.Diagram.Edges[ij]
              if(oNode == oEdge.From || oNode == oEdge.To) {
                this.Diagram.RemoveEdge(oEdge)
              }
            }
            /* remove node */
            this.Diagram.RemoveNode(oNode)
          } else if(oDrawable instanceof Edge) {
            this.Diagram.RemoveEdge(oEdge)
          }
        }
        this.Diagram.SelectedObjects.splice(0, this.Diagram.SelectedObjects.length)
      }
    }
  }
  exports.WorkflowEditor = WorkflowEditor

});
