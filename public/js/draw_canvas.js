
	//定義 Touch drawing 行為的 jquery plugin
	var defineTouchDrawing = function() {
		$.fn.drawTouch = function(options) {
			var drawCallback ;
			var startCallback ;
			var endCallback ;
			var lineWidth = 4 ;

			if (options){
				drawCallback = options.onDrawing ;
				startCallback = options.onStart ;
				endCallback = options.onEnd ;

				if (options.lineWidth) {
					lineWidth = options.lineWidth ;
				}
			}

			var raiseDrawingCallback = function(x, y) {
				if (drawCallback) {
					drawCallback({time: (new Date()).getTime(), x: x, y: y, lw: lineWidth});
				}
			};

			var el = document.getElementsByTagName("canvas")[0];
		  	var ctx = el.getContext("2d");
		  	ctx.lineWidth = lineWidth;

		    var start = function(e) {
		        var touchEvent = e.originalEvent.changedTouches[0];
		        ctx.beginPath();  
		        ctx.moveTo(touchEvent.pageX, touchEvent.pageY);
		        
		        if (startCallback){
		        	startCallback();
		        }

		        raiseDrawingCallback(touchEvent.pageX, touchEvent.pageY);
		    };
		    var move = function(e) {
		        var touchEvent = e.originalEvent.changedTouches[0];
		        e.preventDefault();
		        ctx.lineTo(touchEvent.pageX, touchEvent.pageY);
		        ctx.stroke();
		        raiseDrawingCallback(touchEvent.pageX, touchEvent.pageY);
		    };

		    var end = function(e) {
		    	if (endCallback)
		    		endCallback();
		    }
		    $(this).touchstart(start);
		    $(this).touchmove(move);
		    $(this).touchend(end);
		};
	};

	//定義 mouse drawing 行為的 jquery plugin
	var defineMouseDrawing = function() {
		$.fn.drawMouse = function(options) {
			var drawCallback ;
			var startCallback ;
			var endCallback ;
			var lineWidth = 4 ;

			if (options){
				drawCallback = options.onDrawing ;
				startCallback = options.onStart ;
				endCallback = options.onEnd ;
				if (options.lineWidth) {
					lineWidth = options.lineWidth ;
				}
			}

			var raiseDrawingCallback = function(x, y) {
				if (drawCallback){
					drawCallback({time: (new Date()).getTime(), x: x, y: y, lw: lineWidth});
				}
			};

			var el = document.getElementsByTagName("canvas")[0];
		  	var ctx = el.getContext("2d");
		  	ctx.lineWidth = lineWidth ;
		    var clicked = 0;
		    var start = function(e) {
		        clicked = 1;
		        ctx.beginPath();
		        ctx.moveTo(e.pageX, e.pageY);

		        if (startCallback)
		        	startCallback();

		        raiseDrawingCallback(e.pageX, e.pageY);
		    };
		    var move = function(e) {
		        if(clicked){
		            ctx.lineTo(e.pageX, e.pageY);
		            ctx.stroke();
		            raiseDrawingCallback(e.pageX, e.pageY);
		        }
		    };
		    var stop = function(e) {
		        clicked = 0;

		        if (endCallback)
		        	endCallback();
		    };
		    $(this).mousedown(start);
		    $(this).mousemove(move);
		    $(this).mouseup(stop);
		};
	};