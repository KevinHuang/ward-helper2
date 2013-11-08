var ischool = ischool || {};
ischool.SimplePainter = {};
ischool.SimplePainter.create = function( options ) {

	var _canvasID = options.canvasID ;
	var _penType = options.penType || 'pen';
	var _penSize = options.penSize || 1 ;
	var _penColor = options.penColor || '#000000' ;

	var isDrawing = false ;		//是否正在畫圖中
	var oldPos = [0,0];			//前一個點的位置

	var elmCanvas = document.getElementById(_canvasID);
	var canvasBorderTop = parseInt($(elmCanvas).css("border-top-width"));
	var canvasBorderLeft = parseInt($(elmCanvas).css("border-left-width"));
	var canvasLeft = $(elmCanvas).offset().left;
	var canvasTop = $(elmCanvas).offset().top;

	// ischool.Util.log("Canvas Border top , left : " + canvasBorderTop + "," + canvasBorderLeft );
	// ischool.Util.log("Canvas top , left : " + canvasTop + "," + canvasLeft );
	//ischool.Util.log($(elmCanvas).css("border-top-width"));

	//定義『設定畫筆的屬性』
	var setupContext = function(elm) {
		var context = elm.getContext('2d');
		context.lineJoin = 'round';
		context.lineCap = "round";
		context.lineWidth = _penSize ;
		context.strokeStyle =  _penColor;

		return context ;
	}

	var ctx = setupContext(elmCanvas);	//執行設定畫筆的屬性

	//定義『畫線的邏輯』
	var drawLine = function(oldPos, newPos) {
		ctx.save();

		ctx.beginPath();
		ctx.moveTo(oldPos[0], oldPos[1]);
		ctx.lineTo(newPos[0], newPos[1]);
		ctx.closePath;
		ctx.stroke();
		ctx.restore();
	};

	//定義『清空某一點的邏輯』
	var eraseContent = function(newPos) {
		
		ctx.clearRect(newPos[0],newPos[1], _penSize , _penSize);

		// ischool.Util.log("earse : x,y,width, height = " + newPos[0] + "," + newPos[1] + "," + _penSize + "," + _penSize) ;
	};

	//判斷滑鼠左鍵是否被按下的方法
	var detectLeftButton = function(evt) {
		var result = false ;
		if ('buttons' in evt) {
	        return evt.buttons === 1;
	    } else if ('which' in evt) {
	        return evt.which === 1;
	    } else {
	        return evt.button === 1;
	    }

		return result ;
	}

	var registerMouseEvents

	//定義『設定滑鼠的事件處理函數』
	var registerMouseEvents = function() {

		//按下滑鼠，通常是一筆劃的開始 ....
		elmCanvas.addEventListener('mousedown', function(e) {
			// isDrawing = true;
			oldPos = [e.pageX- canvasLeft - canvasBorderLeft, e.pageY- canvasTop - canvasBorderTop];
		},false);

		//鬆開滑鼠按鈕，通常是一筆劃的結束 ....
		elmCanvas.addEventListener('mouseup', function(e) {
			// isDrawing = false;
		},false);

		//Mouse Over Event
		elmCanvas.addEventListener('mousemove', function(e) {
			e.preventDefault();
			e.stopPropagation();
			//如果滑鼠按下左鍵時才畫圖。
			if(detectLeftButton(e)) {
				//計算新的點的位置
				var newPos = [e.pageX- canvasLeft - canvasBorderLeft, e.pageY- canvasTop - canvasBorderTop];

				//判斷是否mouseout 之後又進來 ？ mouseout 之後 oldPos 會變成 [-1, -1]
				//如果是，就要把上一點的位置移到新的點位置，否則會拉出一條多餘的線 (從 mouseout 時的點，連到目前的新的點 ！！)
				if (oldPos[0] < 0) {
					oldPos = newPos ;
				}

				if (_penType != "eraser") {
					drawLine(oldPos, newPos);
				}
				else {
					eraseContent(newPos);
				}
				oldPos = newPos;
			}
			return false;
		},false);

		//Mouse Up Event
		elmCanvas.addEventListener('mouseout', function(e) {
			oldPos = [-1, -1] ; //如果 mouseout，就把上一個點設為 [-1, -1]
			//isDrawing = false;
		},false);

	};


	//定義『設定 Touch 的事件處理函數』
	var registerTouchEvents = function() {
		//alert('reg touch event !');
		//按下滑鼠，通常是一筆劃的開始 ....
		elmCanvas.addEventListener('touchstart', function(e) {
			//alert('touchstart');
			var touchEvent = e.changedTouches[0];
			oldPos = [touchEvent.pageX- canvasLeft - canvasBorderLeft, touchEvent.pageY- canvasTop - canvasBorderTop];

		},false);

		//鬆開滑鼠按鈕，通常是一筆劃的結束 ....
		elmCanvas.addEventListener('touchend', function(e) {
			// isDrawing = false;
		},false);

		//Mouse Over Event
		elmCanvas.addEventListener('touchmove', function(e) {
			e.preventDefault();
			e.stopPropagation();

			var touchEvent = e.changedTouches[0];

			//計算新的點的位置
			var newPos = [touchEvent.pageX- canvasLeft - canvasBorderLeft, touchEvent.pageY- canvasTop - canvasBorderTop];

			//判斷是否mouseout 之後又進來 ？ mouseout 之後 oldPos 會變成 [-1, -1]
			//如果是，就要把上一點的位置移到新的點位置，否則會拉出一條多餘的線 (從 mouseout 時的點，連到目前的新的點 ！！)
			if (oldPos[0] < 0) {
				oldPos = newPos ;
			}

			if (_penType != "eraser") {
				drawLine(oldPos, newPos);
			}
			else {
				eraseContent(newPos);
			}
			oldPos = newPos;
		
			return false;
		},false);

		//Mouse Up Event
		elmCanvas.addEventListener('touchcancel', function(e) {
			oldPos = [-1, -1] ; //如果 mouseout，就把上一個點設為 [-1, -1]
			//isDrawing = false;
		},false);

	};

	//執行『設定 Touch 事件處理函數』
	registerTouchEvents();
	//執行『設定滑鼠的事件處理函數』
	registerMouseEvents();
	

	return {

		//設定畫筆大小
		setPenSize : function(penSize) {
			_penSize = penSize || 4 ;
			ctx.lineWidth = _penSize ;
		},
		//設定畫筆顏色
		setPenColor : function(penColor) {
			_penColor = penColor ;
			ctx.strokeStyle =  _penColor;
		},
		//設定畫筆類型，有 'pen' 及 eraser 兩種
		setPenType : function(penType) {
			//只要不是橡皮擦，就一定是 pen
			_penType = (penType != 'eraser') ? 'pen' : 'eraser' ;
		},
		//清空畫面
		clean : function() {
			ctx.clearRect(0,0, $(elmCanvas).width() , $(elmCanvas).height());	
		},
		//取得 Base64 字串
		toDataURL : function() {
			if (elmCanvas)
				return elmCanvas.toDataURL();
		},
		//取得 Canvas 物件 (HTMLDom Element)
		getCanvasElement : function() {
			return elmCanvas ;
		}
	}
};

/* ===============    補充知識    ===================
---- 1. 關於 pageX , offsetLeft, offset().left 的差別 -----
MouseEvent 的 pageX : 滑鼠位置相對於 document 的水平距離
(https://developer.mozilla.org/en-US/docs/Web/API/event.pageX)

HTMLDomElement 的 offsetParent => 取得最近的 container 物件 ()
				  offsetLeft => 相對於 offsetParent 的水平距離
(https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement.offsetParent?redirectlocale=en-US&redirectslug=Web%2FAPI%2FElement.offsetParent, 
https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement.offsetLeft)

jquery 的  $(elm).offset() => 取得此物件左上角位置 (相對於 document)

---- 2. 關於 滑鼠按鈕的判斷  ----
http://javascript.info/tutorial/mouse-events#getting-the-button-info-which-button


---- 3. 關於 Touch 事件的介紹 ----
http://www.w3.org/TR/2013/REC-touch-events-20131010/#the-touchstart-event



*/