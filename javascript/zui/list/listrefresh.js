define("zui/listrefresh",["zui/base"],function(require){

	"use strict";

	var zbase=require("zui/base");
  	var zUtil=zbase;
  	
	function ListRefresh(options){

			var  ListOptions={
				srcNode:document,
				scrollContainer:document,
				proxy:{
					dataType:"json",
					method:"get"
				},
				params:{
					/* start:0,//page start count
					 limit:20,//pagesize number
					 rows:"value"*/
				},
				
				itemTpl:"<li></li>",
				downTpl:"",
				upTpl:"",
				upRefresh:true,//is on uptouchevent
				downRefresh:false//is on downtouchevent
			}

			this.resultData=[];
			this.options=$.extend(ListOptions,options||{});
			this.init();
			this.handleEvent();

	}


	ListRefresh.prototype={

		   init:function(){
		   			
		   		 this.el=$(this.options.srcNode);
		   		 if(!this.el) return;
		   		 this.loadData();

		   },
		   loadData:function(){
		   		 var self=this;
 				 //load json data
		   		 $.ajax({
		   		 	async:false,
		   		 	type:self.options.proxy.method,
		   		 	data:self.params,
		   		 	dataType:self.options.proxy.dataType,
		   		 	contentType : "application/x-www-form-urlencoded; charset=utf-8",
		   		 	success:function(result){
		   		 			self.resultData.push(result[self.params.rows]);
		   		 			//self.start=result[self.params.start];
		   		 			self.render(result[self.params.rows]);

		   		 	}

		   		 });
		   },

		   render:function(data){
			   	var dataHtml="";
			   	for(var i=0;i<data.length;i++){
			   		dataHtml+=zUtil.substitute(this.options.itemTpl,data[i]);
			   	}
			   	this.el.append(dataHtml);
		   },
		   loadNextPage:function(){
		   		this.params.start=this.params.start+this.params.limit;
		   		this.loadData();
		   },
		   handleEvent:function(){
		   		var self=this;
		   		$(self.scrollContainer).on("scroll",function(){
		   				if(self.upRefresh&&($(self.el.height()-$(self.scrollContainer).scrollTop())<=$(self.scrollContainer)[0].clientHeight)){
							self.loadNextPage();
						}
						if(self.downRefresh&&$(self.scrollContainer).scrollTop()<=0){
							self.reload();
						}
		   		});
		   },
		   reload:function(){
		   		this.resultData=[];
		   		this.params.start=0;
		   		this.init();
		   }

	}


	//
	return ListRefresh;


});