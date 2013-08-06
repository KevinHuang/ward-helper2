

var StrokePlayer = function(canvasID, playInterval) {

	var aryPoints = [];
	var playerQueue = [];
	//var playInterval = 100;	//millisecond

	var Painter = function(points, finishHandler) {
		if (points.length ==0)
			return null ;

		var status = 0 ;	//0: 尚未開始 , 1: 處理中 , 2: 已處理完成
		var ctx ;

		var pts = points ;
		var currentIndex = 0;

		var initPt = points[0];	
		var initTime = initPt.time ;	//第一個點的時間
		var beginPlayTime = (new Date()).getTime();	//開始play 的時間

		var beginDraw = function() {
			status = 1;

			/*  ctx : 因為這段程式碼速度慢，如果放在上面，到執行 beginDraw 會太慢，
			    導致兩個 Painter 同時執行，會造成贅連線的狀況，所以放在這裡判斷，讓前面的程式執行快一點，好更改 status 的狀態。 */
			if (!ctx) {
				var el = document.getElementById(canvasID)
				ctx = el.getContext("2d");
				ctx.beginPath(); 
				ctx.moveTo(initPt.x, initPt.y);
				console.log( " move to (" + initPt.x + "," + initPt.y + ")");
			}

			console.log(' == beginDraw ==  currentIndex : ' + currentIndex );
			if (points.length ==0)
				return ;

			if (currentIndex > points.length -1)
				return ;

			var firstPt = points[currentIndex];

			var i = currentIndex;
			var currentPlayTime = (new Date()).getTime();	//這一輪 play 的時間，因為每 playInterval 長度就 play 一輪。
			var currentTimeDiff = currentPlayTime - beginPlayTime ;	//這一輪距離開始 play已經過了多少時間？

			for (i=currentIndex; i<points.length; i++) {
				var pt = points[i];
				var timeDiff = pt.time - initTime;	//計算這個點的時間距離第一個點過了多少時間
				
				if (timeDiff < currentTimeDiff) {
					ctx.lineWidth = pt.lw ;
					ctx.lineTo(pt.x, pt.y);
					ctx.stroke();
					console.log(i + " : (" + pt.x + "," + pt.y + ") , count :" + points.length + "," + timeDiff + "," + currentTimeDiff);
				}
				else
					break;
			}
			if (i >= points.length) {
				status = 2 ;
				if (finishHandler)
					finishHandler();
			}
			else {
				currentIndex = i;
				window.setTimeout(beginDraw, playInterval);
			}
		}

		return {
			draw : function() {
				beginDraw();
			},
			//0: 尚未開始 , 1: 處理中 , 2: 已處理完成
			getStatus : function() {
				return status;
			}
		}
	};

	/* 此函數要確保這些 painter 物件可以按照順序執行，
		一個執行完畢後才可以執行下一個。
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
					item.draw();
					break ;
				}
			}
		}
	};


	return {

		play : function(points) {
			aryPoints.push(points);
			if (points.length ==0) 
				return ;

			/* 傳入要畫的點集合，以及畫完後要呼叫的函數 */
			var painter = Painter(points, playByOrder) ;
			if (painter) {
				playerQueue.push(painter);
			}

			playByOrder();

		},

		getCount : function() {
			return aryPoints.length ;
		}

	};
};