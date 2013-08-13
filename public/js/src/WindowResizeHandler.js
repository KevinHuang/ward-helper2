var ischool = ischool || {};	//namespace : ischool

ischool.WindowResizeHandler = {};  //播放筆劃的物件，只負責播放筆劃

/*
	在拖拉更改視窗大小的過程會一直觸發 window.resize 事件，造成效能慢，
	這段程式碼偵測使用者改變視窗大小的動作已結束之後，才觸發事件。
*/
ischool.WindowResizeHandler.handle = function(afterWindowResize) {


/* 檢查 resize 是否結束了 */
	var rtime = new Date(1, 1, 2000, 12,00,00);
	var timeout = false;
	var delta = 200;

	/*
		idea : 當window 經過 200 millisecond 都沒有觸發 resize 事件，
		就認定其已經完成調整視窗大小的動作。
	*/
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
	        if (afterWindowResize)
	        	afterWindowResize();	
	    }               
	};
}