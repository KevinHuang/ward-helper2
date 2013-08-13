	var currentColor = '#000000';
	var currentPen = "5";
	var currentSetting = '';
	var targetCanvasID = 'myCanvas';	//預設產生的 Canvas ID
	var strokes = []; //所有的筆劃
	var undoStrokes = [];	//所有後悔的步驟
	var points =[];

	var canvasWidth = 0;
	var canvasHeight = 0;

	/* 檢查 resize 是否結束了 */
	var rtime = new Date(1, 1, 2000, 12,00,00);
	var timeout = false;
	var delta = 200;

	var strokePlayer ;	//專門用來播放筆順的物件

	

	$(document).ready(function() {

		/*
			在拖拉更改視窗大小的過程會一直觸發 window.resize 事件，造成效能慢，
			這段程式碼偵測使用者改變視窗大小的動作已結束之後，才呼叫 resizeUI()
		 */
		$(window).resize(function() {
		    rtime = new Date();
		    if (timeout === false) {
		        timeout = true;
		        setTimeout(resizeend, delta);
		    }
		});
		function resizeend() {
		    if (new Date() - rtime < delta) {
		        setTimeout(resizeend, delta);
		    } else {
		        timeout = false;
		        resizeUI();
		    }               
		}

		strokePlayer = StrokePlayer(targetCanvasID, 50);	//初始化，每50 毫秒取資料一次畫點。
/*
		$(window).resize(function() {
			resizeUI();
		});
*/
		//1. 處理 展開 submenu 時
		handleShowSubmenu();

		//2. 處理選擇 color 時
		handleSelectColor();

		//3. 處理選擇筆觸時
		handleSelectPen();

		//4. 處理選擇設定時
		handleSelectSetting();

		//5. 處理 play, undo, redo 等動作
		handlePlayUndoRedo();

		//5. 調整畫面大小，並加入 Canvas
		resizeUI();
	});

	var handleShowSubmenu = function() {
		/* 展開 submenu */
		$('.toolbar  ul.navigation  li').click(function() {

			var hasSelected = $(this).hasClass('selected');
			$('.toolbar  ul.navigation > li').removeClass('selected').removeClass('showsubmenu');
			$('.toolbar  ul.navigation > li ul').hide();

			if (!hasSelected) {
				$(this).addClass('selected').addClass("showsubmenu");
				$(this).find('ul').show(300);
			}
			else {
				$(this).find('ul').hide();
			}
		});
	};

	var handleSelectColor = function() {
		/* 當選取某個顏色 */
		$('li.color ul li').click(function() {

			currentColor = $(this).attr('class').split(" ")[0] ;
			//alert(currentColor);

			$('li.color ul li').removeClass('selected').removeClass('showsubmenu');
			$(this).addClass('selected').addClass("showsubmenu");

			$(this).parent().parent().removeClass('selected').removeClass('showsubmenu');
			$(this).parent().hide();

			changeColorPen('#' + targetCanvasID); //調整畫筆顏色與粗細

			return false ;	//如無此行，則 parent 的 li 又會觸發 click 事件，所以這個 ul 又被顯示出來了。
		});
	};

	var handleSelectPen = function() {
		/* 當選取筆觸 */
		$('li.pen ul li').click(function() {

			currentPen = $(this).attr('class').split(" ")[0] ;
			if (currentPen == "thin")
				currentPen = 5;
			else if (currentPen == "medium")
				currentPen = 10;
			else if (currentPen == "thick")
				currentPen = 15;

			//alert(currentPen);

			$('li.pen ul li').removeClass('selected').removeClass('showsubmenu');
			$(this).addClass('selected').addClass("showsubmenu");

			$(this).parent().parent().removeClass('selected').removeClass('showsubmenu');
			$(this).parent().hide();

			changeColorPen('#' + targetCanvasID); //調整畫筆顏色與粗細

			return false ;  //如無此行，則 parent 的 li 又會觸發 click 事件，所以這個 ul 又被顯示出來了。
		});
	};

	var handleSelectSetting = function() {
		/* 當選取設定 */
		$('li.setting ul li').click(function() {

			currentSetting = $(this).attr('class').split(" ")[0] ;
			//alert(currentSetting);

			$('li.setting ul li').removeClass('selected').removeClass('showsubmenu');
			$(this).addClass('selected').addClass("showsubmenu");

			$(this).parent().parent().removeClass('selected').removeClass('showsubmenu');
			$(this).parent().hide();

			if (currentSetting == "clear")
				clearUCtx();
			else if (currentSetting == "replay") {
				replay();
			}
			else if (currentSetting == "save") {
				save();
			}


			return false ;  //如無此行，則 parent 的 li 又會觸發 click 事件，所以這個 ul 又被顯示出來了。
		});
	};

	var handlePlayUndoRedo = function() {
		/* 當選取play */
		$('div.toolbar > ul > li.play').click(function() {
			replay();
			$(this).removeClass('selected').removeClass('showsubmenu');
		});
		$('div.toolbar > ul > li.undo').click(function() {
			undo();
			$(this).removeClass('selected').removeClass('showsubmenu');
		});
		$('div.toolbar > ul > li.redo').click(function() {
			redo();
			$(this).removeClass('selected').removeClass('showsubmenu');
		});

	};
	
	var resizeUI = function() {
		//toolbar
		$('div.toolbar').height($(window).height()).width(70);

		//body
		var boardWidth = $(window).width() - $($('div.toolbar')[0]).width() -3;
		var boardHeight = $(window).height() - 3 ;
		$('div.whiteboard').height(boardHeight).width(boardWidth);

		canvasWidth = boardWidth;
		canvasHeight = boardHeight ;
		/* 因為若 Canvas */
		if ($('div.whiteboard canvas').length == 0) {
			resetCanvas(canvasWidth, canvasHeight, targetCanvasID);	
		}
		else {
			redraw();
		}
	};

	var resetCanvas = function(canvasWidth, canvasHeight, canvasID) {
		var canvasString = "<canvas id='" + canvasID + "' width='" + canvasWidth + "' height='" + canvasHeight + "' style='padding: 0px; margin: 0px; border: 0px; overflow: hidden;'></canvas>";
		$(canvasString).appendTo('div.whiteboard');
		initCanvasBehavior('#'+ targetCanvasID);
	};

	/* 重畫畫面 */
	var redraw = function() {
		//改變 canvas 大小，會導致 reset canvas
		$('div.whiteboard').html('');
		resetCanvas(canvasWidth, canvasHeight, targetCanvasID);

		//再重劃所有點
		strokePlayer.reDrawNow(strokes);
		//var player = StrokePlayer(targetCanvasID);
		//player.reDrawNow(strokes);
		
	};


	/* 改變畫布的顏色和畫筆粗細 */
	var changeColorPen = function(canvasID) {
		$(canvasID).drawMouse({ lineWidth : currentPen, lineColor : currentColor  });
		$(canvasID).drawTouch({ lineWidth : currentPen, lineColor : currentColor });
	};

	//套用 Mouse 畫圖行為 (適用 PC)
	var registerMouseDrawing = function(canvasID) {
		$(canvasID).drawMouse({
			
			lineWidth : currentPen ,

			lineColor : currentColor,

			onStart : function(evt) {
				$('#result').html('');
				var html = "<div> === Start  === </div>" ;
				$(html).appendTo('#result');
				points=[];
			},

			onDrawing : function(evt) {
				points.push(evt);
			},

			onEnd : function() {
				var stroke = { color: currentColor , pen: currentPen, points:points};
				strokes.push(stroke);
				var jsonString = JSON.stringify(stroke);
				//publish(jsonString);

				$('<div>' + jsonString + '</div>').appendTo('#result');

				var html = "<div> === End  === </div>" ;
				$(html).appendTo('#result');
			}
		});
	};

	//套用 Touch 畫圖行為(適用 行動裝置)
	var registerTouchDrawing = function(canvasID) {
		$(canvasID).drawTouch({
			
			lineWidth : currentPen ,

			lineColor : currentColor,

			onStart : function(evt) {
				//$('#result').html('');
				var html = "<div> === Start  === </div>" ;
				$(html).appendTo('#result');
				points=[];	//reset 
			},

			onDrawing : function(evt) {
				points.push(evt);
			},

			onEnd : function() {
				var stroke = { color: currentColor , pen: currentPen, points:points};
				strokes.push(stroke);
				undoStrokes =[];
				var jsonString = JSON.stringify(stroke);
				//publish(jsonString);

				$('<div>' + jsonString + '</div>').appendTo('#result');

				var html = "<div> === End  === </div>" ;
				$(html).appendTo('#result');
			}
		});
	};

	var initCanvasBehavior = function(canvasID) {
		
		//1. 套用滑鼠繪圖的邏輯
		registerMouseDrawing(canvasID);
		
		//2. 套用手指繪圖的邏輯 (適用平板)
		registerTouchDrawing(canvasID);

	}

	
	// SEND
    var publish = function(the_message) {
    	
    	$.ajax({
		  type: "POST",
		  url: '/canvas/save_points',
		  data: "points=" + the_message,
		  success: function(msg) {
		  	//alert(msg);
		  }
		});

    };

    var clearUCtx = function() {
    	var answer = confirm("確定要清除畫面嗎？")
		if (answer){
			$.get('/canvas/clear_points', function(data) {
				clearCanvasContent();	//清除畫布上的內容
	        	strokes =[];	//清除所有筆畫資料
	        	undoStrokes = [];
			});
			
		}
    	
    };

    //清除畫布上的內容
    var clearCanvasContent = function() {
    	strokePlayer.clear();
    	/*
    	//alert(data);
		var el = document.getElementById(targetCanvasID);
  		var ctx = el.getContext("2d");
    	//ctx.clearRect(0,0,canvasWidth,canvasHeight);
    	ctx.clearRect(0,0,el.width,el.height);
    	*/
    }

    /* 重新播放筆順過程 */ 
    var replay = function() {
    	clearCanvasContent();

    	strokePlayer.replay(strokes, 10);
    	//再重劃所有點，按當時筆劃順序及時間
		//var player = StrokePlayer(targetCanvasID);
		//player.replay(strokes,50);
    };

    var undo = function() {
    	clearCanvasContent();
    	var s = strokes.pop();
    	undoStrokes.push(s);
    	strokePlayer.reDrawNow(strokes);
    };

    var redo = function() {
    	clearCanvasContent();
    	var s = undoStrokes.pop();
    	strokes.push(s);
    	strokePlayer.reDrawNow(strokes);
    };

    var save = function() {
    	var jsonString = JSON.stringify(strokes);
    	$.ajax({
		  type: "POST",
		  url: '/canvas/save_points',
		  data: "points=" + jsonString,
		  success: function(msg) {
		  	alert(msg);
		  }
		});
    };





