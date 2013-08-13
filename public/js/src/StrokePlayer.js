
var ischool = ischool || {};	//namespace : ischool

ischool.StrokePlayer = {};  //播放筆劃的物件，只負責播放筆劃

/* 宣告一個『建立播放筆劃物件』的方法 */
ischool.StrokePlayer.create = function(containerID) {

	var aryStrokes = [];	//記錄所有筆劃
	var canvasID = "myCanvas";	//預設建立的 canvas 的 ID
	var playerQueue = [];	//放置 Painter 的集合。一筆劃(stroke)由一個 Painter 物件處理。
	var playInterval =  100;	//millisecond, 每隔多少時間取一次筆劃的點資料來畫圖。
	var speed =  1 ;	//播放速度，浮點數。
	var afterCanvasResize ;	//將 Canvas Resize 事件廣播出去。因為 window resize 時會把 Canvas 重設，所以把。

	ischool.CanvasResizer.handle({
		containerID : containerID,
		widthDiff : 0,
		heightDiff : 0,
		afterResizedHandler : function() {
			//重劃所有的筆劃
			if (drawAllPoints)
				drawAllPoints();

			//將 Canvas Resize 事件廣播出去。
			if (afterCanvasResize)
				afterCanvasResize();
		}
	});

	/* 此函數要確保這些 painter 物件可以按照順序執行，
		一個 stroke 執行完畢後才可以執行下一個 stroke 。
	*/
	var playByOrder = function() {
		var isProcessing = false 
		var i=0;
		for(i=0; i<playerQueue.length; i++) {
			item = playerQueue[i] ;
			if (item.getStatus() == 1){	//處理中 
				isProcessing = true ;
				break ;
			}
		}

		if (!isProcessing) {
			for(i=0; i<playerQueue.length; i++) {
				item = playerQueue[i] ;
				if (item.getStatus() == 0){	//尚未處理
					item.draw( speed, playInterval );
					break ;
				}
			}
		}
	};

	var drawAllPoints = function() {
		//再重劃所有點
		$(aryStrokes).each(function(index, stroke) {
			if (stroke) {
				if (stroke.points.length > 0) {
					var ctx = document.getElementById(canvasID).getContext('2d');
					ctx.beginPath();  //若不加此行則全部會變成最後的顏色及粗細
					ctx.lineWidth = stroke.pen;
					ctx.strokeStyle = stroke.color ;

					var initPt = stroke.points[0]
					ctx.moveTo(initPt.x, initPt.y);

					$(stroke.points).each(function(index, pt) {
						ctx.lineTo(pt.x, pt.y);
			            //console.log("color:" + _lineColor); //為什麼設定幾次就會有幾個值？
			            ctx.stroke();	
					});
	            }
        	}
		});
	}


	return {

		/* 
			播放所有筆劃，按照順序與時間。
			strokes : 所有筆劃資料
			drawSpeed : 播放速度， float number
			drawInterval : 取得點資料的時間間隔，值越小畫面越順暢(不會 lag)。 millisecond。
		*/
		play : function(strokes, drawSpeed, drawInterval) {
			this.clean();	//清空畫面
			this.stop();	//停止目前所有播放動作
			if (strokes) {
				aryStrokes = strokes;
				playerQueue = [];
				$(aryStrokes).each(function(index, stroke) {
					
					/* 傳入要畫的點集合，以及畫完後要呼叫的函數 */
					var painter = StrokePainter(canvasID, stroke, playByOrder) ;
					if (painter) {
						playerQueue.push(painter);
					}
				});

				if (drawInterval)
					playInterval = drawInterval ;	//重設取點資料畫出的時間間隔

				if (drawSpeed)
					speed = drawSpeed ;

				playByOrder();
			}
		},

		/* 清除畫面成為空白 */
		clean : function() {
			//alert(data);
			var el = document.getElementById(canvasID);
	  		var ctx = el.getContext("2d");
	    	ctx.clearRect(0,0,el.width,el.height);
		},

		/* 
			全部立刻重劃，不需要按時間重劃。
			若傳入筆劃（strokes)，就畫出傳入的筆劃。否則畫出內部儲存的筆劃 (aryStrokes)。
		*/
		drawNow : function(strokes) {
			this.clean();
			aryStrokes = strokes ;
			drawAllPoints();
		},

		/* 立刻停止 */
		stop : function() {
			for(i=0; i<playerQueue.length; i++) {
				item = playerQueue[i] ;
				if (item.getStatus() != 2){	//尚未完成
					item.stop();
				}
			}
		},

		/* 取得有多少筆劃 */
		getStrokeCount : function() {
			return aryStrokes.length ;
		},

		/* 播放單一筆劃。 */
		addStroke : function(stroke) {
			aryStrokes.push(stroke);
			if (stroke.points.length ==0) 
				return ;

			/* 傳入要畫的點集合，以及畫完後要呼叫的函數 */
			var painter = StrokePainter(canvasID,stroke, playByOrder) ;
			if (painter) {
				playerQueue.push(painter);
			}

			playByOrder();
		},

		/* 取得系統建立的 CanvasID  */
		getCanvasID : function() {
			return canvasID;
		},

		setCanvasResizeHandler : function(afterCanvasResizedHandler) {
			afterCanvasResize = afterCanvasResizedHandler
		}
	};
}

/*  factory function to create a player object for replay points */
var StrokePainter = function(canvasID, stroke, finishHandler) {

	if (! stroke)
		return null;

	if (stroke.points.length ==0)
		return null ;

	var status = 0 ;	//0: 尚未開始 , 1: 處理中 , 2: 已處理完成
	var ctx ;

	var pts = stroke.points ;
	var currentIndex = 0;
	var lineColor = stroke.color;
	var lineWidth = stroke.pen;

	var initPt = pts[0];	
	var initTime = initPt.time ;	//第一個點的時間
	var beginPlayTime ;	//開始play 的時間

	var speed = 1;	//播放速度
	var playInterval =100;	//取樣時間

	var isInterrupted = false ;	//是否中斷。當執行 stop 時，會將此變數設為 true。

	var beginDraw = function() {
		status = 1;
		/* 這筆劃開始畫點時的時間 */
		if (!beginPlayTime)
			beginPlayTime = (new Date()).getTime();

		/*  ctx : 因為這段程式碼速度慢，如果放在上面，到執行 beginDraw 會太慢，
		    導致兩個 Painter 同時執行，會造成贅連線的狀況，所以放在這裡判斷，讓前面的程式執行快一點，好更改 status 的狀態。 */
		if (!ctx) {
			var el = document.getElementById(canvasID)
			ctx = el.getContext("2d");
			ctx.beginPath(); 
			ctx.lineWidth = lineWidth;
			ctx.strokeStyle = lineColor ;
			ctx.moveTo(initPt.x, initPt.y);
			console.log( " move to (" + initPt.x + "," + initPt.y + ")");
		}

		console.log(' == beginDraw ==  currentIndex : ' + currentIndex );
		if (pts.length ==0)
			return ;

		if (currentIndex > pts.length -1)
			return ;

		var firstPt = pts[currentIndex];

		var i = currentIndex;
		var currentPlayTime = (new Date()).getTime();	//這一輪 play 的時間，因為每 playInterval 長度就 play 一輪。
		var currentTimeDiff = (currentPlayTime - beginPlayTime) * speed ;	//這一輪距離開始 play已經過了多少時間？

		for (i=currentIndex; i<pts.length; i++) {
			//判斷是否中斷
			if (isInterrupted) {
				status = 2;
				console.log(' == isInterrupted ==  currentIndex : ' + currentIndex );
				if (finishHandler)
					finishHandler();
				return ;
			}

			var pt = pts[i];
			var timeDiff = pt.time - initTime;	//計算這個點的時間距離第一個點過了多少時間
			
			if (timeDiff < currentTimeDiff) {  
				//ctx.lineWidth = pt.lw ;
				ctx.lineTo(pt.x, pt.y);
				ctx.stroke();
				console.log(i + " : (" + pt.x + "," + pt.y + ") , count :" + pts.length + "," + timeDiff + "," + currentTimeDiff);
			}
			else
				break;
		}
		if (i >= pts.length) {
			status = 2 ;
			if (finishHandler)
				finishHandler();
		}
		else {
			currentIndex = i;
			window.setTimeout(beginDraw, playInterval);	//每隔多少時間取一次筆劃的點資料畫圖
		}
	}

	return {
		draw : function(drawSpeed, drawInterval) {
			speed =drawSpeed ;
			playInterval = drawInterval ;
			isInterrupted = false ;
			beginDraw();
		},
		//0: 尚未開始 , 1: 處理中 , 2: 已處理完成
		getStatus : function() {
			return status;
		},

		stop : function() {
			isInterrupted = true ;
		}
	}
};
