var ischool = ischool || {};
ischool.WindowResizeHandler = {};
ischool.WindowResizeHandler.handle = function(afterWindowResize) {
  var rtime = new Date(1, 1, 2E3, 12, 0, 0);
  var timeout = false;
  var delta = 200;
  $(window).resize(function() {
    rtime = new Date;
    if(timeout === false) {
      timeout = true;
      setTimeout(resizeend, delta)
    }
  });
  var resizeend = function() {
    if(new Date - rtime < delta) {
      setTimeout(resizeend, delta)
    }else {
      timeout = false;
      if(afterWindowResize) {
        afterWindowResize()
      }
    }
  }
};
ischool.CanvasResizer = {};
ischool.CanvasResizer.handle = function(options) {
  var targetContainerID = options.containerID;
  var targetCanvasID = "myCanvas";
  var widthDiff = options.widthDiff ? options.widthDiff : 0;
  var heightDiff = options.heightDiff ? options.heightDiff : 0;
  var afterResizedHandler = options.afterResizedHandler;
  var canvasWidth = 0;
  var canvasHeight = 0;
  ischool.WindowResizeHandler.handle(function() {
    resizeUI()
  });
  var resizeUI = function() {
    canvasWidth = $("#" + targetContainerID).width() - 3;
    canvasHeight = $("#" + targetContainerID).height() - 3;
    resetCanvas(canvasWidth, canvasHeight, targetCanvasID);
    if(afterResizedHandler) {
      afterResizedHandler()
    }
  };
  var resetCanvas = function(canvasWidth, canvasHeight, canvasID) {
    $("#" + targetContainerID).html("");
    var canvasString = "<canvas id='" + canvasID + "' width='" + canvasWidth + "' height='" + canvasHeight + "' style='padding: 0px; margin: 0px; border: 0px; overflow: hidden;'></canvas>";
    $(canvasString).appendTo("#" + targetContainerID)
  };
  resizeUI()
};
ischool.StrokePlayer = {};
ischool.StrokePlayer.create = function(containerID) {
  var aryStrokes = [];
  var canvasID = "myCanvas";
  var playerQueue = [];
  var playInterval = 100;
  var speed = 1;
  ischool.CanvasResizer.handle({containerID:containerID, widthDiff:0, heightDiff:0, afterResizedHandler:function() {
    if(drawAllPoints) {
      drawAllPoints()
    }
  }});
  var playByOrder = function() {
    var isProcessing = false;
    var i = 0;
    for(i = 0;i < playerQueue.length;i++) {
      item = playerQueue[i];
      if(item.getStatus() == 1) {
        isProcessing = true;
        break
      }
    }
    if(!isProcessing) {
      for(i = 0;i < playerQueue.length;i++) {
        item = playerQueue[i];
        if(item.getStatus() == 0) {
          item.draw(speed, playInterval);
          break
        }
      }
    }
  };
  var drawAllPoints = function() {
    $(aryStrokes).each(function(index, stroke) {
      if(stroke) {
        if(stroke.points.length > 0) {
          var ctx = document.getElementById(canvasID).getContext("2d");
          ctx.beginPath();
          ctx.lineWidth = stroke.pen;
          ctx.strokeStyle = stroke.color;
          var initPt = stroke.points[0];
          ctx.moveTo(initPt.x, initPt.y);
          $(stroke.points).each(function(index, pt) {
            ctx.lineTo(pt.x, pt.y);
            ctx.stroke()
          })
        }
      }
    })
  };
  return{play:function(strokes, drawSpeed, drawInterval) {
    this.clean();
    this.stop();
    if(strokes) {
      aryStrokes = strokes;
      playerQueue = [];
      $(aryStrokes).each(function(index, stroke) {
        var painter = StrokePainter(canvasID, stroke, playByOrder);
        if(painter) {
          playerQueue.push(painter)
        }
      });
      if(drawInterval) {
        playInterval = drawInterval
      }
      if(drawSpeed) {
        speed = drawSpeed
      }
      playByOrder()
    }
  }, clean:function() {
    var el = document.getElementById(canvasID);
    var ctx = el.getContext("2d");
    ctx.clearRect(0, 0, el.width, el.height)
  }, drawNow:function(strokes) {
    this.clean();
    aryStrokes = strokes;
    drawAllPoints()
  }, stop:function() {
    for(i = 0;i < playerQueue.length;i++) {
      item = playerQueue[i];
      if(item.getStatus() != 2) {
        item.stop()
      }
    }
  }, getStrokeCount:function() {
    return aryStrokes.length
  }, addStroke:function(stroke) {
    aryStrokes.push(stroke);
    if(stroke.points.length == 0) {
      return
    }
    var painter = Painter(stroke, playByOrder);
    if(painter) {
      playerQueue.push(painter)
    }
    playByOrder()
  }, getCanvasID:function() {
    return canvasID
  }}
};
var StrokePainter = function(canvasID, stroke, finishHandler) {
  if(!stroke) {
    return null
  }
  if(stroke.points.length == 0) {
    return null
  }
  var status = 0;
  var ctx;
  var pts = stroke.points;
  var currentIndex = 0;
  var lineColor = stroke.color;
  var lineWidth = stroke.pen;
  var initPt = pts[0];
  var initTime = initPt.time;
  var beginPlayTime;
  var speed = 1;
  var playInterval = 100;
  var isInterrupted = false;
  var beginDraw = function() {
    status = 1;
    if(!beginPlayTime) {
      beginPlayTime = (new Date).getTime()
    }
    if(!ctx) {
      var el = document.getElementById(canvasID);
      ctx = el.getContext("2d");
      ctx.beginPath();
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = lineColor;
      ctx.moveTo(initPt.x, initPt.y);
      console.log(" move to (" + initPt.x + "," + initPt.y + ")")
    }
    console.log(" == beginDraw ==  currentIndex : " + currentIndex);
    if(pts.length == 0) {
      return
    }
    if(currentIndex > pts.length - 1) {
      return
    }
    var firstPt = pts[currentIndex];
    var i = currentIndex;
    var currentPlayTime = (new Date).getTime();
    var currentTimeDiff = (currentPlayTime - beginPlayTime) * speed;
    for(i = currentIndex;i < pts.length;i++) {
      if(isInterrupted) {
        status = 2;
        console.log(" == isInterrupted ==  currentIndex : " + currentIndex);
        if(finishHandler) {
          finishHandler()
        }
        return
      }
      var pt = pts[i];
      var timeDiff = pt.time - initTime;
      if(timeDiff < currentTimeDiff) {
        ctx.lineTo(pt.x, pt.y);
        ctx.stroke();
        console.log(i + " : (" + pt.x + "," + pt.y + ") , count :" + pts.length + "," + timeDiff + "," + currentTimeDiff)
      }else {
        break
      }
    }
    if(i >= pts.length) {
      status = 2;
      if(finishHandler) {
        finishHandler()
      }
    }else {
      currentIndex = i;
      window.setTimeout(beginDraw, playInterval)
    }
  };
  return{draw:function(drawSpeed, drawInterval) {
    speed = drawSpeed;
    playInterval = drawInterval;
    isInterrupted = false;
    beginDraw()
  }, getStatus:function() {
    return status
  }, stop:function() {
    isInterrupted = true
  }}
};
$.fn.drawTouch = function(option) {
  var defaults = {onDrawing:null, onStart:null, onEnd:null, lineWidth:4, lineColor:"#000000"};
  var _lineColor = option.lineColor ? option.lineColor : "#000000";
  var options = $.extend(defaults, option);
  return this.each(function() {
    var raiseDrawingCallback = function(x, y, color) {
      if(options.onDrawing) {
        options.onDrawing({time:(new Date).getTime(), x:x, y:y})
      }
    };
    var el = this;
    var ctx = el.getContext("2d");
    ctx.lineWidth = options.lineWidth;
    var canvasX = $(el).offset().left;
    var canvasY = $(el).offset().top;
    var start = function(e) {
      var touchEvent = e.originalEvent.changedTouches[0];
      ctx.beginPath();
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      var x = Math.floor(touchEvent.pageX - canvasX);
      var y = Math.floor(touchEvent.pageY - canvasY);
      ctx.moveTo(x, y);
      if(options.onStart) {
        options.onStart()
      }
      raiseDrawingCallback(x, y, _lineColor)
    };
    var move = function(e) {
      var touchEvent = e.originalEvent.changedTouches[0];
      e.preventDefault();
      var x = Math.floor(touchEvent.pageX - canvasX);
      var y = Math.floor(touchEvent.pageY - canvasY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = options.lineColor;
      ctx.stroke();
      raiseDrawingCallback(x, y, _lineColor)
    };
    var end = function(e) {
      if(options.onEnd) {
        options.onEnd()
      }
    };
    $(this).touchstart(start);
    $(this).touchmove(move);
    $(this).touchend(end)
  })
};
$.fn.drawMouse = function(option) {
  var defaults = {onDrawing:null, onStart:null, onEnd:null, lineWidth:4, lineColor:"#000000"};
  var options = $.extend(defaults, option);
  var _lineColor = option.lineColor ? option.lineColor : "#000000";
  return this.each(function() {
    var raiseDrawingCallback = function(x, y, color) {
      if(options.onDrawing) {
        options.onDrawing({time:(new Date).getTime(), x:x, y:y})
      }
    };
    var el = this;
    var ctx = el.getContext("2d");
    ctx.lineWidth = options.lineWidth;
    var canvasX = $(el).offset().left;
    var canvasY = $(el).offset().top;
    var clicked = 0;
    var previousX;
    var previousY;
    var start = function(e) {
      clicked = 1;
      ctx.beginPath();
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      var x = Math.floor(e.pageX - canvasX);
      var y = Math.floor(e.pageY - canvasY);
      previousX = x;
      previousY = y;
      ctx.moveTo(x, y);
      if(options.onStart) {
        options.onStart()
      }
      raiseDrawingCallback(x, y, options.lineColor)
    };
    var move = function(e) {
      if(clicked) {
        var x = Math.floor(e.pageX - canvasX);
        var y = Math.floor(e.pageY - canvasY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = options.lineColor;
        ctx.stroke();
        previousX = x;
        previousY = y;
        raiseDrawingCallback(x, y, _lineColor)
      }
    };
    var stop = function(e) {
      clicked = 0;
      if(options.onEnd) {
        options.onEnd()
      }
    };
    $(this).mousedown(start);
    $(this).mousemove(move);
    $(this).mouseup(stop)
  })
};
ischool.Painter = {};
ischool.Painter.create = function(options) {
  var containerID = options.containerID;
  var penSize = options.penSize;
  var penColor = options.penColor;
  var afterStrokeHandler = options.afterStroke;
  var strokePlayer = ischool.StrokePlayer.create(containerID);
  var canvasID = strokePlayer.getCanvasID();
  var strokes = [];
  var undoStrokes = [];
  var points = [];
  var registerMouseDrawing = function() {
    $("#" + canvasID).drawMouse({lineWidth:penSize, lineColor:penColor, onStart:function(evt) {
      points = []
    }, onDrawing:function(evt) {
      points.push(evt)
    }, onEnd:function() {
      var stroke = {color:penColor, pen:penSize, points:points};
      strokes.push(stroke);
      undoStrokes = [];
      if(afterStrokeHandler) {
        afterStrokeHandler(stroke)
      }
    }})
  };
  var registerTouchDrawing = function() {
    $("#" + canvasID).drawTouch({lineWidth:penSize, lineColor:penColor, onStart:function(evt) {
      points = []
    }, onDrawing:function(evt) {
      points.push(evt)
    }, onEnd:function() {
      var stroke = {color:penColor, pen:penSize, points:points};
      strokes.push(stroke);
      undoStrokes = [];
      if(afterStrokeHandler) {
        afterStrokeHandler(stroke)
      }
    }})
  };
  var initCanvasBehavior = function() {
    registerMouseDrawing();
    registerTouchDrawing()
  };
  initCanvasBehavior();
  var changeColorPen = function() {
    $("#" + canvasID).drawMouse({lineWidth:penSize, lineColor:penColor});
    $("#" + canvasID).drawTouch({lineWidth:penSize, lineColor:penColor})
  };
  return{replay:function(speed) {
    var theSpeed = speed ? speed : 1;
    strokePlayer.play(strokes, speed, 10)
  }, undo:function() {
    strokePlayer.clean();
    var s = strokes.pop();
    undoStrokes.push(s);
    strokePlayer.drawNow(strokes)
  }, redo:function() {
    strokePlayer.clean();
    var s = undoStrokes.pop();
    strokes.push(s);
    strokePlayer.drawNow(strokes)
  }, clean:function() {
    strokePlayer.clean();
    strokes = [];
    undoStrokes = []
  }, getStrokes:function() {
    return strokes
  }, setStrokes:function(theStrokes) {
    strokes = theStrokes
  }, setPenColor:function(color) {
    penColor = color;
    changeColorPen()
  }, setPenSize:function(size) {
    penSize = size;
    changeColorPen()
  }, getStrokePlayer:function() {
    return strokePlayer
  }}
};