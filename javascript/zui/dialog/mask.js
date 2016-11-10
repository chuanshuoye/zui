define("zui/dialog/mask",['zui/base'],function(require,exports,module){

		var zbase=require("zui/base");
		var zUtil=zbase;
		function Mask(){
				//this.el=null,
				//this.delaytime=null,
				//this.loading="";
		}
		Mask.prototype={
				show:function(parent,type,loadFlag){
					var _self=this;
					if(type=="parent"){
						_self.type="parent"//目前支持parent元素和全屏元素
					}
					if(!loadFlag){
						_self.el=$('<div class="ui-mask dialog-mask"></div>');
						$(parent).append(_self.el);
						setSize(_self);
					}
					else{
						_self.el=$('<div class="ui-mask dialog-mask">'+_self.loading+'</div>');
						$(parent).append(_self.el);
						setSize(_self);
					}
					$(window).on('onorientationchange' in window ? 'orientationchange' : 'resize',function(){
						setSize(_self);
						// console.log("resize1");
					});
				},
				close:function(){
					var _self=this;
					_self.el.remove();
				}

		}
		function setSize(self){
			var pHeight=self.el.parent().height();
			if(pHeight&&self.type=="parent")
				self.el.css({"min-height":pHeight});
			else
				pHeight=Math.max(zUtil.docHeight(),zUtil.viewportHeight());
			var pWidth=self.el.parent().width();
			self.el.css({"height":pHeight,"width":pWidth,"display":"block"});
		}
		 function formatMessage(msg,value){
		    return zUtil.substitute(msg,value);
		  }

		return Mask;

})