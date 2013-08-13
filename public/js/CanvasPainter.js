var ischool = ischool || {};
ischool.WindowResizeHandler = {};
ischool.WindowResizeHandler.handle = function(f) {
  var a = new Date(1, 1, 2E3, 12, 0, 0), d = !1;
  $(window).resize(function() {
    a = new Date;
    !1 === d && (d = !0, setTimeout(g, 200))
  });
  var g = function() {
    200 > new Date - a ? setTimeout(g, 200) : (d = !1, f && f())
  }
};
ischool = ischool || {};
ischool.CanvasResizer = {};
ischool.CanvasResizer.handle = function(f) {
  var a = f.containerID, d = f.afterResizedHandler, g = 0, e = 0;
  ischool.WindowResizeHandler.handle(function() {
    c()
  });
  var c = function() {
    g = $("#" + a).width() - 3;
    e = $("#" + a).height() - 3;
    var b = g, c = e;
    $("#" + a).html("");
    $("<canvas id='myCanvas' width='" + b + "' height='" + c + "' style='padding: 0px; margin: 0px; border: 0px; overflow: hidden;'></canvas>").appendTo("#" + a);
    d && d()
  };
  c()
};
ischool = ischool || {};
ischool.StrokePlayer = {};
ischool.StrokePlayer.create = function(f) {
  var a = [], d = [], g = 100, e = 1, c;
  ischool.CanvasResizer.handle({containerID:f, widthDiff:0, heightDiff:0, afterResizedHandler:function() {
    h && h();
    c && c()
  }});
  var b = function() {
    for(var a = !1, b = 0, b = 0;b < d.length;b++) {
      if(item = d[b], 1 == item.getStatus()) {
        a = !0;
        break
      }
    }
    if(!a) {
      for(b = 0;b < d.length;b++) {
        if(item = d[b], 0 == item.getStatus()) {
          item.draw(e, g);
          break
        }
      }
    }
  }, h = function() {
    $(a).each(function(b, a) {
      if(a && 0 < a.points.length) {
        var d = document.getElementById("myCanvas").getContext("2d");
        d.beginPath();
        d.lineWidth = a.pen;
        d.strokeStyle = a.color;
        var c = a.points[0];
        d.moveTo(c.x, c.y);
        $(a.points).each(function(a, b) {
          d.lineTo(b.x, b.y);
          d.stroke()
        })
      }
    })
  };
  return{play:function(c, f, h) {
    this.clean();
    this.stop();
    c && (a = c, d = [], $(a).each(function(a, c) {
      var e = StrokePainter("myCanvas", c, b);
      e && d.push(e)
    }), h && (g = h), f && (e = f), b())
  }, clean:function() {
    var b = document.getElementById("myCanvas");
    b.getContext("2d").clearRect(0, 0, b.width, b.height)
  }, drawNow:function(b) {
    this.clean();
    a = b;
    h()
  }, stop:function() {
    for(i = 0;i < d.length;i++) {
      item = d[i], 2 != item.getStatus() && item.stop()
    }
  }, getStrokeCount:function() {
    return a.length
  }, addStroke:function(c) {
    a.push(c);
    0 != c.points.length && ((c = StrokePainter("myCanvas", c, b)) && d.push(c), b())
  }, getCanvasID:function() {
    return"myCanvas"
  }, setCanvasResizeHandler:function(b) {
    c = b
  }}
};
var StrokePainter = function(f, a, d) {
  if(!a || 0 == a.points.length) {
    return null
  }
  var g = 0, e, c = a.points, b = 0, h = a.color, k = a.pen, l = c[0], p = l.time, m, r = 1, s = 100, q = !1, v = function() {
    g = 1;
    m || (m = (new Date).getTime());
    e || (e = document.getElementById(f).getContext("2d"), e.beginPath(), e.lineWidth = k, e.strokeStyle = h, e.moveTo(l.x, l.y), console.log(" move to (" + l.x + "," + l.y + ")"));
    console.log(" == beginDraw ==  currentIndex : " + b);
    if(0 != c.length && !(b > c.length - 1)) {
      for(var a = b, t = ((new Date).getTime() - m) * r, a = b;a < c.length;a++) {
        if(q) {
          g = 2;
          console.log(" == isInterrupted ==  currentIndex : " + b);
          d && d();
          return
        }
        var n = c[a], u = n.time - p;
        if(u < t) {
          e.lineTo(n.x, n.y), e.stroke(), console.log(a + " : (" + n.x + "," + n.y + ") , count :" + c.length + "," + u + "," + t)
        }else {
          break
        }
      }
      a >= c.length ? (g = 2, d && d()) : (b = a, window.setTimeout(v, s))
    }
  };
  return{draw:function(b, a) {
    r = b;
    s = a;
    q = !1;
    v()
  }, getStatus:function() {
    return g
  }, stop:function() {
    q = !0
  }}
};
$.fn.drawTouch = function(f) {
  var a = $.extend({onDrawing:null, onStart:null, onEnd:null, lineWidth:4, lineColor:"#000000"}, f);
  return this.each(function() {
    var d = this.getContext("2d");
    d.lineWidth = a.lineWidth;
    var g = $(this).offset().left, e = $(this).offset().top;
    $(this).touchstart(function(c) {
      var b = c.originalEvent.changedTouches[0];
      d.beginPath();
      d.lineJoin = "round";
      d.lineCap = "round";
      c = Math.floor(b.pageX - g);
      b = Math.floor(b.pageY - e);
      d.moveTo(c, b);
      if(a.onStart) {
        a.onStart()
      }
      if(a.onDrawing) {
        a.onDrawing({time:(new Date).getTime(), x:c, y:b})
      }
    });
    $(this).touchmove(function(c) {
      var b = c.originalEvent.changedTouches[0];
      c.preventDefault();
      c = Math.floor(b.pageX - g);
      b = Math.floor(b.pageY - e);
      d.lineTo(c, b);
      d.strokeStyle = a.lineColor;
      d.stroke();
      if(a.onDrawing) {
        a.onDrawing({time:(new Date).getTime(), x:c, y:b})
      }
    });
    $(this).touchend(function(d) {
      if(a.onEnd) {
        a.onEnd()
      }
    })
  })
};
$.fn.drawMouse = function(f) {
  var a = $.extend({onDrawing:null, onStart:null, onEnd:null, lineWidth:4, lineColor:"#000000"}, f);
  return this.each(function() {
    var d = this.getContext("2d");
    d.lineWidth = a.lineWidth;
    var g = $(this).offset().left, e = $(this).offset().top, c = 0;
    $(this).mousedown(function(b) {
      c = 1;
      d.beginPath();
      d.lineJoin = "round";
      d.lineCap = "round";
      var f = Math.floor(b.pageX - g);
      b = Math.floor(b.pageY - e);
      d.moveTo(f, b);
      if(a.onStart) {
        a.onStart()
      }
      if(a.onDrawing) {
        a.onDrawing({time:(new Date).getTime(), x:f, y:b})
      }
    });
    $(this).mousemove(function(b) {
      if(c) {
        var f = Math.floor(b.pageX - g);
        b = Math.floor(b.pageY - e);
        d.lineTo(f, b);
        d.strokeStyle = a.lineColor;
        d.stroke();
        if(a.onDrawing) {
          a.onDrawing({time:(new Date).getTime(), x:f, y:b})
        }
      }
    });
    $(this).mouseup(function(b) {
      c = 0;
      if(a.onEnd) {
        a.onEnd()
      }
    })
  })
};
ischool = ischool || {};
ischool.Painter = {};
ischool.Painter.create = function(f) {
  var a = f.penSize, d = f.penColor, g = f.afterStroke, e = ischool.StrokePlayer.create(f.containerID);
  e.setCanvasResizeHandler(function() {
    l();
    p();
    e.drawNow(b)
  });
  var c = e.getCanvasID(), b = [], h = [], k = [], l = function() {
    $("#" + c).drawMouse({lineWidth:a, lineColor:d, onStart:function(b) {
      k = []
    }, onDrawing:function(b) {
      k.push(b)
    }, onEnd:function() {
      var c = {color:d, pen:a, points:k};
      b.push(c);
      h = [];
      g && g(c)
    }})
  }, p = function() {
    $("#" + c).drawTouch({lineWidth:a, lineColor:d, onStart:function(b) {
      k = []
    }, onDrawing:function(b) {
      k.push(b)
    }, onEnd:function() {
      var c = {color:d, pen:a, points:k};
      b.push(c);
      h = [];
      g && g(c)
    }})
  }, m = function() {
    $("#" + c).drawMouse({lineWidth:a, lineColor:d});
    $("#" + c).drawTouch({lineWidth:a, lineColor:d})
  };
  return{replay:function(a) {
    e.play(b, a, 10)
  }, undo:function() {
    e.clean();
    var a = b.pop();
    a && h.push(a);
    e.drawNow(b)
  }, redo:function() {
    e.clean();
    var a = h.pop();
    a && b.push(a);
    e.drawNow(b)
  }, clean:function() {
    e.clean();
    b = [];
    h = []
  }, getStrokes:function() {
    return b
  }, setStrokes:function(a) {
    b = a
  }, setPenColor:function(a) {
    d = a;
    m()
  }, setPenSize:function(b) {
    a = b;
    m()
  }, getStrokePlayer:function() {
    return e
  }}
};