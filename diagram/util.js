
function IntersectionPoint1(p1, p2, p3, p4){
    ret = new Point();
    ret.x = ((p1.x*p2.y - p1.y*p2.x)*(p3.x - p4.x) - (p1.x - p2.x)*(p3.x*p4.y - p3.y*p4.x))/( (p1.x - p2.x)*(p3.y - p4.y) - (p1.y - p2.y)*(p3.x - p4.x) );
    ret.y = ((p1.x*p2.y - p1.y*p2.x)*(p3.y - p4.y) - (p1.y - p2.y)*(p3.x*p4.y - p3.y*p4.x)) / ( (p1.x - p2.x)*(p3.y - p4.y) - (p1.y - p2.y)*(p3.x - p4.x) );
    return ret;
}

function IntersectionPoint(rect, p1, p2) {

  var tempRect = new Rectangle(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y)
  var p3 = new Point(rect.x, rect.y)
  var p4 = new Point(rect.x+rect.width, rect.y)
  var ret = IntersectionPoint1(p1, p2, p3, p4)
  if(rect.Contains(ret) && tempRect.Contains(ret)) return ret

  p3 = new Point(rect.x+rect.width, rect.y)
  p4 = new Point(rect.x+rect.width, rect.y + rect.height)
  ret = IntersectionPoint1(p1, p2, p3, p4)
  if(rect.Contains(ret) && tempRect.Contains(ret)) return ret

  p3 = new Point(rect.x, rect.y+rect.height)
  p4 = new Point(rect.x+rect.width, rect.y+rect.height)
  ret = IntersectionPoint1(p1, p2, p3, p4)
  if(rect.Contains(ret) && tempRect.Contains(ret)) return ret

  p3 = new Point(rect.x, rect.y)
  p4 = new Point(rect.x, rect.y + rect.height)
  ret = IntersectionPoint1(p1, p2, p3, p4)
  if(rect.Contains(ret) && tempRect.Contains(ret)) return ret

  return null
}
