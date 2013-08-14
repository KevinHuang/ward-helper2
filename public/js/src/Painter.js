var ischool = ischool || {};	//namespace : ischool

ischool.Painter = {};  //類似小畫家的物件，負責讓使用者書寫畫面，並收集筆劃資料，可 play, undo, redo, clean 等。

/* 宣告一個『建立小畫家物件』的方法 */
ischool.Painter.create = function(options) {

	var containerID = options.containerID;
	var penSize = options.penSize;
	var penColor = options.penColor ;
	var afterStrokeHandler = options.afterStroke;	//每一筆劃完成後就會觸發此事件

	//會建立 Canvas，並套用 resize，以及 play 的功能
	var strokePlayer = ischool.StrokePlayer.create(containerID);

	//處理 window.resize 事件
	strokePlayer.setCanvasResizeHandler(function() {
		initCanvasBehavior();
		strokePlayer.drawNow(strokes);
	});

	var canvasID = strokePlayer.getCanvasID();

	var strokes = []; //暫存所有的筆劃
	var undoStrokes = [];	//所有後悔的步驟
	var points =[];	//暫存一筆劃的所有點資訊(x,y,time)

	//套用 Mouse 畫圖行為 (適用 PC)
	var registerMouseDrawing = function() {
		$('#' + canvasID).drawMouse({
			
			lineWidth : penSize ,

			lineColor : penColor,

			onStart : function(evt) {
				points=[];
			},

			onDrawing : function(evt) {
				points.push(evt);
			},

			onEnd : function() {
				var stroke = { color: penColor , pen: penSize, points:points};
				strokes.push(stroke);
				undoStrokes =[];

				if (afterStrokeHandler)
					afterStrokeHandler(stroke);
			}
		});
	};

	//套用 Touch 畫圖行為(適用 行動裝置)
	var registerTouchDrawing = function() {
		$('#' + canvasID).drawTouch({
			
			lineWidth : penSize ,

			lineColor : penColor,

			onStart : function(evt) {
				points=[];	//reset 
			},

			onDrawing : function(evt) {
				points.push(evt);
			},

			onEnd : function() {
				var stroke = { color: penColor , pen: penSize, points:points};
				strokes.push(stroke);
				undoStrokes =[];

				if (afterStrokeHandler)
					afterStrokeHandler(stroke);
			}
		});
	};

	var initCanvasBehavior = function() {
		
		//1. 套用滑鼠繪圖的邏輯
		registerMouseDrawing();
		
		//2. 套用手指繪圖的邏輯 (適用平板)
		registerTouchDrawing();

	}

	/* 改變畫布的顏色和畫筆粗細 */
	var changeColorPen = function() {
		$('#' + canvasID).drawMouse({ lineWidth : penSize, lineColor : penColor });
		$('#' + canvasID).drawTouch({ lineWidth : penSize, lineColor : penColor });
	};


	return {

		replay : function(speed) {
			var theSpeed = (speed) ? speed : 1 ;
			strokePlayer.play( strokes, speed, 10);
		},

		undo : function() {
			strokePlayer.clean();	//清除畫面
	    	var s = strokes.pop();
	    	if (s)
	    		undoStrokes.push(s);
	    	strokePlayer.drawNow(strokes);
		},

		redo : function() {
			strokePlayer.clean();	//清除畫面
	    	var s = undoStrokes.pop();
	    	if (s)
	    		strokes.push(s);
	    	strokePlayer.drawNow(strokes);
		},

		clean : function() {
			strokePlayer.clean();	//清除畫面
			strokes =[];	//清除所有筆畫資料
	        undoStrokes = [];
		},

		getStrokes : function() {
			return strokes;
		},

		setStrokes : function(theStrokes) {
			strokes = theStrokes ;
		},

		setPenColor : function(color) {
			penColor = color ;
			changeColorPen();
		},

		setPenSize : function(size) {
			penSize = size ;
			changeColorPen();
		},

		getStrokePlayer : function() {
			return strokePlayer ;
		},

		setBackgroundImage : function( bgOptions ) {
			strokePlayer.setBackgroundImage(bgOptions);
		}
	}
}