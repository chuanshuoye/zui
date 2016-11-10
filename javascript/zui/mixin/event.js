define("zui/mixin/event",["zui/base"],function(require){
	  var  zBase=require("zui/base");
	  var  zUtil=zBase;
	  var zEvent={
	  			/**阻止默认行为*/
	  			preventDefault:function(ev){
	   				 ev.preventDefault();
	  			},
	  			/** 阻止事件蔓延 */
		        stopPropagation: function(ev) {
		             ev.stopPropagation();
		        },
	   			/*禁用document滚动事件*/
	   			enableTouchMove:function(dom,enableStatus){

	   				  if(enableStatus==false){
	   				  	 $(dom).on("touchmove",this.preventDefault);
	   				  }
	   				  if(enableStatus==true){
	   				  	 $(dom).off("touchmove",this.preventDefault);
	   				  }
	   				 
	   			},
	   			//移动转屏事件监听
	   			ortChange:function(func,args){
	   				$(window).on('onorientationchange' in window ? 'orientationchange' : 'resize',function(){
						if(zUtil.isFunction(func)){
							func(args);
						}
						
					});
	   			},
	   			//创建自定义事件
	   			createEvent:function(eventName,func,dom,args){
	   				if(zUtil.isFunction(func)){
	   					$(dom).on(eventName,function(){
	   						func(args);
	   					});
	   				}
	   			},
	   			//触发自定义事件
	   			trigger:function(eventName,dom,args){
	   				$(dom).trigger(eventName,args);
	   			},
	   			//移除自定义事件
	   			removeEvent:function(eventName,dom){
	   				$(dom).off(eventName);
	   			},
	   			isSuportAnimation:function(){
	   				var rAF = window.requestAnimationFrame	||
	   				window.webkitRequestAnimationFrame	||
	   				window.mozRequestAnimationFrame		||
	   				window.oRequestAnimationFrame		||
	   				window.msRequestAnimationFrame;
	   				return rAF;
	   			}
	   			/**禁止屏幕横竖屏切换**/
	   			// enableOrtChange:function(status){

	   			// 	  if(enableStatus==false){
	   			// 	  	 $(dom).on("onorientationchange",this._preventDefault);
	   			// 	  }
	   			// 	  if(enableStatus==true){
	   			// 	  	 $(dom).off("onorientationchange",this._preventDefault);
	   			// 	  }
	   			// }
	   			


	   }


	   return zEvent;


});