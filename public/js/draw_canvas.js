
	//定義 Touch drawing 行為的 jquery plugin
	var defineTouchDrawing = function() {
		$.fn.drawTouch = function(option) {


			var defaults = {
				onDrawing : null,
				onStart : null,
				onEnd : null,
				lineWidth : 4,
				lineColor : "#000000"
			};

			var _lineColor = (option.lineColor) ? (option.lineColor) : "#000000";


			var options = $.extend(defaults, option) ;

			return this.each(function(){

				var raiseDrawingCallback = function(x, y, color) {
					if (options.onDrawing) {
						options.onDrawing({time: (new Date()).getTime(), x: x, y: y }); //, lw: options.lineWidth, c: color});
					}
				};

				var el = this;
			  	var ctx = el.getContext("2d");
			  	ctx.lineWidth = options.lineWidth;

			    var start = function(e) {
			        var touchEvent = e.originalEvent.changedTouches[0];
			        ctx.beginPath();  
			        ctx.moveTo(touchEvent.pageX, touchEvent.pageY);
			        
			        if (options.onStart){
			        	options.onStart();
			        }

			        raiseDrawingCallback(touchEvent.pageX, touchEvent.pageY, _lineColor);
			    };
			    var move = function(e) {
			        var touchEvent = e.originalEvent.changedTouches[0];
			        e.preventDefault();
			        ctx.lineTo(touchEvent.pageX, touchEvent.pageY);
			        ctx.strokeStyle = options.lineColor ;
			        ctx.stroke();
			        raiseDrawingCallback(touchEvent.pageX, touchEvent.pageY, _lineColor);
			        console.log(options);
			    };

			    var end = function(e) {
			    	if (options.onEnd)
			    		options.onEnd();
			    }
			    $(this).touchstart(start);
			    $(this).touchmove(move);
			    $(this).touchend(end);
			});
		};
	};


	//定義 mouse drawing 行為的 jquery plugin
	var defineMouseDrawing = function() {
		$.fn.drawMouse = function(option) {

			var defaults = {
				onDrawing : null,
				onStart : null,
				onEnd : null,
				lineWidth : 4,
				lineColor : "#000000"
			};

			var options = $.extend(defaults, option) ;

			var _lineColor = (option.lineColor) ? (option.lineColor) : "#000000";

			return this.each(function(){

				var raiseDrawingCallback = function(x, y, color) {
					if (options.onDrawing){
						options.onDrawing({time: (new Date()).getTime(), x: x, y: y }); //, lw: options.lineWidth, c:color});
					}
				};

				var el = this;
			  	var ctx = el.getContext("2d");
			  	ctx.lineWidth = options.lineWidth ;
			    var clicked = 0;

			    var start = function(e) {
			        clicked = 1;
			        ctx.beginPath();
			        ctx.moveTo(e.pageX, e.pageY);

			        if (options.onStart)
			        	options.onStart();

			        raiseDrawingCallback(e.pageX, e.pageY, options.lineColor);
			    };
			    var move = function(e) {
			        if(clicked){
			            ctx.lineTo(e.pageX, e.pageY);
			            ctx.strokeStyle = options.lineColor ;
			            //console.log("color:" + _lineColor); //為什麼設定幾次就會有幾個值？
			            ctx.stroke();

			            raiseDrawingCallback(e.pageX, e.pageY, _lineColor);
			        }
			    };
			    var stop = function(e) {
			        clicked = 0;

			        if (options.onEnd)
			        	options.onEnd();
			    };
			    $(this).mousedown(start);
			    $(this).mousemove(move);
			    $(this).mouseup(stop);

			});
		};
	};