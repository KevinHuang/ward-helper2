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

	var resizeUI = function(){

		canvasWidth = $('#' + targetContainerID ).width() - 3;
		canvasHeight = $('#' + targetContainerID ).height() - 3;

		/* 若還沒有 Canvas */
		resetCanvas(canvasWidth, canvasHeight, targetCanvasID);	

		if (afterResizedHandler) {
			afterResizedHandler();
		}
	};

	var resetCanvas = function(canvasWidth, canvasHeight, canvasID) {
		$('#' + targetContainerID).html('');
		var canvasString = "<canvas id='" + canvasID + "' width='" + canvasWidth + "' height='" + canvasHeight + "' style='padding: 0px; margin: 0px; border: 0px; overflow: hidden;'></canvas>";
		$(canvasString).appendTo('#' + targetContainerID);
	};

	resizeUI();

}