define("zui/list/listselect",["zui/base","zui/mixin"],function(require,exports,module){
	
	
	var zbase=require("zui/base");
	var mixin=require("zui/mixin");
	var zUtil=zbase;
	var zArray=zbase.Array;
	var iScroll=mixin.iScroll;
	var scrollTouch=mixin.Touch;

	
	var _selectScrollbar='<div id="zSelect" class="z-ui-select hidden"><div id="scroller"></div></div>';

	var _selectCls='<style id="selectCls"></style>';

	var  defaultOptions={
			render:"",
			// 数据源
			data:[],
			// 模拟滚动工具
			scrollbar:true,
			// 是否启用遮罩
			mask:true,
			// 定位模式top,center,bottom
			position:"bottom",
			//width  int参数
			width:null,
			//height 
			height:null,
			//sort
			sortField:null,
			// event
			eventType:"click",

			selected:function(){},
			//active
			activeCls:"active",
			//tplC
			tpl:'<ul class="list-group"></ul>',
			//itpl
			itemTpl:'<li data-index={index} class="list-group-item">{name}</li>'


	};

	function zSelect(options){
			var _self=this;
		    _self.options=$.extend(defaultOptions,options?options:{});
			_self._init();

			$(_self.options.render).on("click",function(){
					_self.open();
			});


			$(window).on('onorientationchange' in window ? 'orientationchange' : 'resize',function(){
					_setPosition(_self);
			});
	};


	function _setPosition(self){

			
			if(self.options.position=="bottom"){
				var _class="position:absolute;bottom:0;width:100%;height:"+self.options.height+"px;";
				self.el.attr("style",_class);
			}
			if(self.options.position=="top"){
				var _class="position:absolute;top:0;width:100%;height:"+self.options.height+"px;";
				self.el.attr("style",_class);
			}
			if(self.options.position=="center"){
				
				var windowHeight=zUtil.viewportHeight();
				var height=self.options.height?self.options.height:windowHeight-100;
				
				var windowWidth=zUtil.viewportWidth();
				var width=self.options.width?self.options.width:windowWidth-30;
				
				var m_left="-"+parseInt(width/2)+"px;";
				var m_top="-"+parseInt(height/2)+"px;";
				var _class="position:absolute;top:50%;left:50%;margin-top:"+m_top+"margin-left:"+m_left;
				self.el.attr("style",_class);
				self.el.css({"height":height,"width":width});

			}

	}
	
	zSelect.prototype._init=function(){
			var _self=this;
			

			$("body").append(_selectScrollbar);
		    $("head").append(_selectCls);
		    _self.el=$(".z-ui-select");
		    _setPosition(_self);

			var $scroller=$("#scroller",_self.el);
			$scroller.append(_self.options.tpl);
			_self.dataContainer=$scroller.children();
			var data=_self.options.data;
			var str="";
			zUtil.each(data,function(elem,index){
				elem.index=index;
				if(elem.isEnable!=false)
					str+=zUtil.substitute(_self.options.itemTpl,elem);
			});

			 _self.dataContainer.html(str);
			 var _itemList=_self.dataContainer.children();
			 zUtil.each(_itemList,function(elem,index){
			 	_self.eventHandler(elem);
			 });

			
			 if(_self.options.scrollbar)
				_self.iscroll= new iScroll("#"+_self.el.attr("id"), { mouseWheel: true ,click: true});
			// document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
			

	}


	zSelect.prototype.eventHandler=function(elem){
			var _self=this;
			$(elem).on(_self.options.eventType,function(e){
	 				var _item=_self.options.data[$(this).data('index')];
	 				
	 				$(this).siblings().removeClass(_self.options.activeCls);
	 				$(this).addClass(_self.options.activeCls);
	 				var _domTarget=e.target;
	 				_self.close();
					_self.options.selected({
		 				item:_item,
		 				domTarget:_domTarget
	 				});
			});
	 		
				
	}

	zSelect.prototype._destory=function(){
			$(".z-ui-select").remove();
			$("#selectCls").remove();
	}

	/**节点是否可用设置**/
	zSelect.prototype.setItemEnable=function(key,value,status){
			var _self=this;
 			var _itemList=_self.dataContainer.children();
			zUtil.each(_itemList,function(elem,index){
			 	if($(elem).data("item")[key]==value){
			 		if(!status)
			 			_self.options.data[index].isEnable=false;
			 		else
			 			_self.options.data[index].isEnable=true;
			 		//console.log(_self.options.data.length);
			 	}
			});

			_self.refresh();
	}


	/**删除节点**/
	zSelect.prototype.delItems=function(key,value){
			 var _self=this;
			 var _itemList=_self.dataContainer.children();
			 zUtil.each(_itemList,function(elem,index){
			 	if($(elem).data("item")[key]==value){
			 		_self.options.data=zArray.removeAt(_self.options.data,index);
			 		//console.log(_self.options.data.length);
			 	}
			 });

			 _self.refresh();
	}


	/**按规则排序**/
	zSelect.prototype.sortItems=function(sortField){
			var _self=this;
	}

	/***重置**/
	zSelect.prototype.refresh=function(){
			this._destory();
			this._init();
	}

	/**open **/
	zSelect.prototype.open=function(){
			this.el.removeClass("hidden");
			if(this.options.mask){
				this.maskbar=new zMask();
			 	this.maskbar.show("body",null,false);

			}
			
			this.iscroll.refresh();
			scrollTouch.enableTouchMove(document,false); 	
	}

	/**close **/
	zSelect.prototype.close=function(){
			this.el.addClass("hidden");
			this.maskbar.close();
			scrollTouch.enableTouchMove(document,true); 	
	}


	return zSelect;


});