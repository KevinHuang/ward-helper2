
	//定義 Touch drawing 行為的 jquery plugin
	//var defineTouchDrawing = function() {
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
			  	var canvasX = $(el).offset().left;
			    var canvasY = $(el).offset().top;

			    var start = function(e) {
			        var touchEvent = e.originalEvent.changedTouches[0];
			        ctx.beginPath();  
			        ctx.lineJoin = 'round';
			        ctx.lineCap = "round";
			        //var x = touchEvent.pageX;
			        //var y = touchEvent.pageY;
			        var x = Math.floor(touchEvent.pageX - canvasX );
			        var y = Math.floor(touchEvent.pageY - canvasY );
			        ctx.moveTo(x, y);
			        
			        if (options.onStart){
			        	options.onStart();
			        }

			        raiseDrawingCallback(x, y, _lineColor);
			    };
			    var move = function(e) {
			        var touchEvent = e.originalEvent.changedTouches[0];
			        e.preventDefault();
			        var x = Math.floor(touchEvent.pageX - canvasX );
			        var y = Math.floor(touchEvent.pageY - canvasY );

			        ctx.lineTo(x, y);
			        ctx.strokeStyle = options.lineColor ;
			        ctx.stroke();
			        raiseDrawingCallback(x, y, _lineColor);
			        //console.log(options);
			        //alert("touchmove");
			    };

			    var end = function(e) {
			    	//alert("touchend");
			    	if (options.onEnd)
			    		options.onEnd();
			    }
			    $(this).on("touchstart", start);
			    $(this).on("touchmove", move);
			    $(this).on("touchend", end);
			});
		};
	//};


	//定義 mouse drawing 行為的 jquery plugin
	//var defineMouseDrawing = function() {
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
			  	var canvasX = $(el).offset().left;
			    var canvasY = $(el).offset().top;
			    var clicked = 0;

			    var previousX ;
			    var previousY;

			    var start = function(e) {
			        clicked = 1;
			        ctx.beginPath();
			        ctx.lineJoin = 'round';
			        ctx.lineCap = "round";
			        //var x = e.pageX - el.offsetX;
			        //var y = e.pageY - el.offsetY ;
			        var x = Math.floor(e.pageX - canvasX );
			        var y = Math.floor(e.pageY - canvasY );
			        previousX = x;
			        previousY = y;
			        ctx.moveTo(x, y);

			        if (options.onStart)
			        	options.onStart();

			        raiseDrawingCallback(x, y, options.lineColor);
			    };
			    
			    var move = function(e) {
			        if(clicked){
			        	//var x = e.pageX;
			        	//var y = e.pageY;
			        	var x = Math.floor(e.pageX - canvasX );
			        	var y = Math.floor(e.pageY - canvasY );

			            ctx.lineTo(x, y);
			            //ctx.arcTo(previousX, previousY, x, y , 5);
			            ctx.strokeStyle = options.lineColor ;
			            //console.log("color:" + _lineColor); //為什麼設定幾次就會有幾個值？
			            ctx.stroke();
			            previousX = x;
			        	previousY = y;
			            //console.log(x + "," + y);
			            raiseDrawingCallback(x, y, _lineColor);
			        }
			    };

			    var end = function(e) {
			        clicked = 0;

			        if (options.onEnd)
			        	options.onEnd();
			    };
			    $(this).on("mousedown", start);
			    $(this).on("mousemove", move);
			    $(this).on("mouseup", end);

			});
		};
	//};