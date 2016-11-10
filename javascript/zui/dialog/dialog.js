define("zui/dialog/dialog",['zui/base'],function(require,exports,module){
	var zBase=require("zui/base");
    var Overlay=require("zui/dialog/overlay");
    var zUtil=zBase;
    
	var zDialog={
			id:null,
			Dialog:function(id,options){
				this.dialog=new Overlay({
                    closeBtn:true,
                    width:270,
					title:$(id).attr("title"),
					content:$(id).html(),
                    buttons:{}

				});
				this.dialog.getWrap().prev(".ui-mask").addClass("dialog-mask");
				if(options&&options.ecls)
					zDialog.dialog.getWrap().addClass(options.ecls);
                if(options.animateCls){
                    this.dialog.getWrap().addClass(options.animateCls);
                 }else{
                    this.dialog.getWrap().addClass("animated fadeInUp");
                 }
			
				zDialog.delaytime=setTimeout(function(){
    				zDialog.dialog.open();
    				zDialog.dialog.refresh();
				},20);
				
			},
			Alert:function(options){
					var _self=this,title="",content="";
					var timeTemp=initDialogContainer();
				  	if(options&&options.title){
		            	 title=options.title
		         	 }
		         	 if(options&&options.msg){
		             	content=options.msg
		         	 }
					this.dialog=new Overlay({
				   		 autoOpen:false,
					     closeBtn: false,
					     title:title,
                         width:270,
					     content:content,
					     buttons: {
					         '确定': function(){
					             this.close();
					             this.destroy();
					             $("#dialog_"+timeTemp).remove();
					             if(zUtil.isFunction(options.callback)){
					             	options.callback();
					             }
					         }
					     }
					});
                     this.dialog.getWrap().addClass("alert-dialog");
                     this.dialog.getWrap().prev(".ui-mask").addClass("dialog-mask");
                    if(options.animateCls){
                        this.dialog.getWrap().addClass(options.animateCls);
                    }else{
                        this.dialog.getWrap().addClass("animated fadeInUp");
                     }
					showDialog(this,timeTemp);
					

			},
			Confirm:function(options){
					var _self=this,title="",content="";
					var timeTemp=initDialogContainer();
					  if(options&&options.title){
			             title=options.title
			          }
			          if(options&&options.msg){
			             content=options.msg
			          }
					this.dialog=new Overlay({
				   		 autoOpen:false,
					     closeBtn: false,
					     title:title,
                         width:270,
					     content:content,
					     buttons: {
					         '确定': function(){
					             this.close();
					            this.destroy();
					             $("#dialog_"+timeTemp).remove();
					              if(zUtil.isFunction(options.callback)){
					             	options.callback();
					             }
					         },
					         '取消': function(){
					             this.close();
					             this.destroy();
					             $("#dialog_"+timeTemp).remove();
					             
					         }
					     }
					});
                    this.dialog.getWrap().addClass("confirm-dialog");
                     this.dialog.getWrap().prev(".ui-mask").addClass("dialog-mask");
                    if(options.animateCls){
                        this.dialog.getWrap().addClass(options.animateCls);
                    }
                    else{
                        this.dialog.getWrap().addClass("animated fadeInUp");
                     }
					showDialog(this,timeTemp);


			},
			Loading:function(options){

					var timeTemp=initDialogContainer(),content,msg;
					zDialog.id="#dialog_"+timeTemp;
					
					var LoadMask={
							msg:"<p style='margin-top:5px;'>加载中</p>",
							loadingMsg:"<i class='ui-loading'></i>"
					}

					if(options&&options.msg){
						LoadMask.msg=options.msg
					}
					if(options&&options.loadingMsg){
						LoadMask.loadingMsg=options.loadingMsg
					}
					content=LoadMask.loadingMsg+formatMessage(LoadMask.msg,{title:msg});
					this.dialog=new Overlay({
									autoOpen:false,
							        closeBtn:false,
                                    width:100,
							        title:"",
							        buttons:[],
							        content:content

					});
                   
					this.dialog.getWrap().addClass("load-dialog");
					showDialog(this,timeTemp);
			},
			Flash:function(options){


					 var _self=this,title="",content="",delay=1500;
			          var timeTemp=initDialogContainer();
			          _self.id="#dialog_"+timeTemp;
			          if(options&&options.title){
			             title=options.title
			          }
			          if(options&&options.msg){
			             content=options.msg
			          }
			          if(options&&options.duration){
			              delay=options.duration
			          }
			          this.dialog=new Overlay({
			               closeBtn:false,
			               autoOpen:false,
			               title:title,
                           width:270,
			               buttons:[],
			               content:content
			          });
			          this.dialog.getWrap().addClass("flash-dialog");
                      if(options.animateCls){
                        this.dialog.getWrap().addClass(options.animateCls);
                       }
                       else{
                        this.dialog.getWrap().addClass("animated fadeInUp");
                        }
			          showDialog(this,timeTemp);
			          if(flashShow) clearTimeout(flashShow);
			          var flashShow=setTimeout(function(){
			             _self.closeDialog();
			             if(zUtil.isFunction(options.callback)){
				             	options.callback();
				          }
			          },delay);
			},
			closeDialog:function(){
				   var id=this.id;
				   this.dialog.destroy();
				   $(id).remove();
			}



	}

	/**移动开发弹出键盘状态对话框定位不准确的简便处理方法，
		做了延迟刷新重新定位的模式
	**/
	function showDialog(self,el){
		zDialog.delaytime=setTimeout(function(){
				self.dialog.open();
				self.dialog.refresh();
                clearTimeout(zDialog.delaytime);
		},20);
	}


	 function formatMessage(msg,value){
		 return zUtil.substitute(msg,value);
	 }

	function initDialogContainer(){
		var timeTemp=new Date().getTime();
		$("body").append("<div id='dialog_"+timeTemp+"'></div>");
		return timeTemp;
	}


	return {
		Alert:zDialog.Alert,
		Confirm:zDialog.Confirm,
		Flash:zDialog.Flash,
		Loading:zDialog.Loading,
		Dialog:zDialog.Dialog
	};

	
})