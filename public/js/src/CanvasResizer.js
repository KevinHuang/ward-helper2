var ischool = ischool || {};	//namespace : ischool

ischool.CanvasResizer = {};  //播放筆劃的物件，只負責播放筆劃

ischool.CanvasResizer.handle = function(options) {

	//containerID, widthDiff, heightDiff, afterResizedHandler

	var targetContainerID = options.containerID ;
	var targetCanvasID ='myCanvas';

	var widthDiff = (options.widthDiff) ? options.widthDiff : 0;
	var heightDiff = (options.heightDiff) ? options.heightDiff : 0;
	var afterResizedHandler = options.afterResizedHandler;

	var canvasWidth = 0;
	var canvasHeight = 0;

	/* 處理 Window Resize 事件，確定 Window Resize 後才會觸發事件，而不會在 Window Resize 過程中一直觸發，影響效能 */
	ischool.WindowResizeHandler.handle(function() {
		resizeUI();
	});

	/* 檢查 resize 是否結束了 */
	//var rtime = new Date(1, 1, 2000, 12,00,00);
	//var timeout = false;
	//var delta = 200;


	//$(document).ready(function() {

	/*
		在拖拉更改視窗大小的過程會一直觸發 window.resize 事件，造成效能慢，
		這段程式碼偵測使用者改變視窗大小的動作已結束之後，才呼叫 resizeUI()
	 */
	 /*
	$(window).resize(function() {
	    rtime = new Date();
	    if (timeout === false) {
	        timeout = true;
	        setTimeout(resizeend, delta);
	    }
	});

	var resizeend = function() {
	    if (new Date() - rtime < delta) {
	        setTimeout(resizeend, delta);
	    } else {
	        timeout = false;
	        resizeUI();
	    }               
	};
	*/

	//});

	var resizeUI = function(){

		//var boardWidth = $(window).width() - widthDiff -3;
		//var boardHeight = $(window).height() - heightDiff - 3 ;
		//$('#' + targetContainerID ).height(boardHeight).width(boardWidth);


		//canvasWidth = boardWidth;
		//canvasHeight = boardHeight ;
		canvasWidth = $('#' + targetContainerID ).width() - 3;
		canvasHeight = $('#' + targetContainerID ).height() - 3;
		/* 若還沒有 Canvas */
		//if ($('#' + targetContainerID + ' canvas').length == 0) {
		resetCanvas(canvasWidth, canvasHeight, targetCanvasID);	
		//}
		//else {
		//	redraw();
		//}

		if (afterResizedHandler) {
			afterResizedHandler();
		}
	};

	var resetCanvas = function(canvasWidth, canvasHeight, canvasID) {
		$('#' + targetContainerID).html('');
		var canvasString = "<canvas id='" + canvasID + "' width='" + canvasWidth + "' height='" + canvasHeight + "' style='padding: 0px; margin: 0px; border: 0px; overflow: hidden;'></canvas>";
		$(canvasString).appendTo('#' + targetContainerID);
		//initCanvasBehavior('#'+ targetCanvasID);
	};

	/* 重畫畫面 */
	//var redraw = function() {
	//	//改變 canvas 大小，會導致 reset canvas
	//	$('#' + targetContainerID).html('');
	//	resetCanvas(canvasWidth, canvasHeight, targetCanvasID);

		//再重劃所有點
		//strokePlayer.drawNow(strokes);
		//var player = StrokePlayer(targetCanvasID);
		//player.reDrawNow(strokes);
		
	//};

	resizeUI();

}