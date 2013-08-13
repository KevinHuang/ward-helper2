
/* 
	專門用來播放(重畫出)筆劃的物件。 
	canvasID : 
*/
var StrokePlayer = function(canvasID, drawInterval, drawSpeed) {

	var aryStrokes = [];
	var playerQueue = [];	//放置 Painter 的集合。一筆劃(stroke)由一個 Painter 物件處理。
	var playInterval = (drawInterval) ? drawInterval :  100;	//millisecond, 每隔多少時間取一次筆劃的點資料來畫圖。
	var speed = (drawSpeed) ? drawSpeed : 1 ;	//播放速度，浮點數。
	if (speed <=0)
		speed = 1;

	/*  factory function to create a player object for replay points */
	var Painter = function(stroke, finishHandler) {

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

	var drawAllPoints = function() {
//再重劃所有點
		$(strokes).each(function(index, stroke) {
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

		/* 播放一筆畫的動作 */
		playStroke : function(stroke) {
			aryStrokes.push(stroke);
			if (stroke.points.length ==0) 
				return ;

			/* 傳入要畫的點集合，以及畫完後要呼叫的函數 */
			var painter = Painter(stroke, playByOrder) ;
			if (painter) {
				playerQueue.push(painter);
			}

			playByOrder();
		},

		/* 取得有多少筆劃 */
		getStrokeCount : function() {
			return aryStrokes.length ;
		},

		/* 
			全部立刻重劃，不需要按時間重劃。
			若傳入筆劃（strokes)，就畫出傳入的筆劃。否則畫出內部儲存的筆劃 (aryStrokes)。
			若 wantSubstitute 參數為 true，則已傳入的 strokes 取代內部的 aryStrokes 變數。但如果傳入的 strokes 為 null，則不取代。
		*/
		reDrawNow : function( strokes ) {

			if (strokes) {

				drawAllPoints(strokes);
			}
			else
				drawAllPoints(aryStrokes);
		},

		/* 清除畫面，恢復空白畫布 */
		clear : function() {
			//alert(data);
			var el = document.getElementById(canvasID);
	  		var ctx = el.getContext("2d");
	    	ctx.clearRect(0,0,el.width,el.height);
		},

		replay : function( strokes , draw_interval, drawSpeed) {

			if (strokes) {
				aryStrokes = strokes;
				playerQueue = [];
				$(aryStrokes).each(function(index, stroke) {
					
					/* 傳入要畫的點集合，以及畫完後要呼叫的函數 */
					var painter = Painter(stroke, playByOrder) ;
					if (painter) {
						playerQueue.push(painter);
					}
				});

				if (draw_interval)
					playInterval = draw_interval ;	//重設取點資料畫出的時間間隔

				if (drawSpeed)
					speed = drawSpeed ;

				playByOrder();
			}
		}

	};
};