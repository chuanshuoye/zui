define("zui/mixin/position",["zui/base"],function(require){

	 var zbase=require("zui/base");
	var zUtil=zbase;
	
	  function Position(options){

	  		this.options=$.extend({},options);
	  }


	  Position.prototype={

	  		setPosition:function(args,dom){

	  		},
	  		setCenter:function(dom){
	  			setCenter(dom,this.options.animate);
	  		}
	  }


	  function setCenter($node,animateType){

	  		//var $parent=$node.parent();
	  		var viewHeight=zUtil.viewportHeight();
	  		var viewWidth=zUtil.viewportWidth();

	  		var c_height=$node.height()>0?$node.height():$node.css("height").replace(/[^0-9,]*/g,"");
	  		var c_width=$node.width()>0?$node.width():$node.css("width").replace(/[^0-9,]*/g,"");

	  		var c_mh=c_height/2;
	  		var c_ml=c_width/2;


	  		$node.css({
	  			"position":"absolute",
	  			"left":"50%",
	  			"top":"50%",
	  			"margin-left":"-"+c_ml+"px",
	  			"margin-top":"-"+c_mh+"px"
	  		});

	  }

	  return Position;

});