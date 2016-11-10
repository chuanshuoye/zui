define("zui/calendar/datepicker",['zui/base',"zui/mixin"],function(require){
	
	// var zUtils=require("zui/utils");
	// var zDate=require("zui/date");
	// var iScroll=require("zui/mixin/scrollbar");
	// var zEvent=require("zui/mixin/event");
	var zbase=require("zui/base");
	var mixin=require("zui/mixin");
	var zUtils=zbase;
	var zDate=zbase.Date;
	var iScroll=mixin.iScroll;
	var zEvent=mixin.Event;

	var datepickerTpl='<div class="date-picker hidden">'+
						      '<div class="date-header">'+
						        '<h1></h1>'+
						      '</div>'+
						      '<div class="date-content box box-horizontal ">'+
						        '<div class="date-mask-up  box box-horizontal">'+
						           '<div class="box-flex-1"> <div class="year-b-t "><div class="b-border"></div></div></div>'+
						            '<div class="box-flex-1"><div class="month-b-t"><div class="b-border"></div></div></div>'+
						           '<div class="box-flex-1"> <div class="day-b-t"><div class="b-border"></div></div></div>'+
						        '</div>'+
						        '<div class="date-mask-down  box box-horizontal">'+
						            '<div class="box-flex-1"><div class="year-b-t "><div class="b-border"></div></div></div>'+
						            '<div class="box-flex-1"><div class="month-b-t "><div class="b-border"></div></div></div>'+
						            '<div class="box-flex-1"><div class="day-b-t "><div class="b-border"></div></div></div>'+
						        '</div>'+
						        '<div class="year-wrapper box-flex-1">'+
						          '<div class="date-year">'+
						            '<ul class="scroller date-list">'+
						            '</ul>'+
						          '</div>'+
						        '</div>'+
						        '<div class="month-wrapper box-flex-1">'+
						             '<div class="date-month">'+
						            '<ul class="scroller date-list">'+						            
						            '</ul>'+
						          '</div>'+
						        '</div>'+
						        '<div class="day-wrapper  box-flex-1">'+
						             '<div class="date-day">'+
						            '<ul class="scroller date-list">'+						           
						            '</ul>'+
						         ' </div>'+
						        '</div>'+
						     ' </div>'+
						      '<div class="date-action box box-horizontal ">'+
						     	 '<div class="box-flex-1">'+
						            ' <a href="javascript:;" class="date-ok z-btn-block btn-default">确定</a>'+
						         '</div>'+
						         ' <div class="box-flex-1">'+
						            '<a href="javascript:;" class="date-cancel z-btn-block btn-default">取消</a>'+
						          '</div>'+
						          
						      '</div>'+
						'</div>'+
						'<div class="date-picker-mask hidden"></div>';

	var yearTpl="<li class='{isEnable} {selected}' data-year='{year}'>{year}</li>";
	var monthTpl="<li class='{isEnable} {selected}' data-month='{month}'>{month}</li>";
	var dayTpl="<li class='{isEnable} {selected}' data-day='{day}'>{day}</li>";

	var _now=new Date();
	var _years=[new Date().getFullYear()-50,new Date().getFullYear()+50];
	var _minDate=zDate.format(_getMinDate(),"yyyy-mm-dd");
	var _maxDate=zDate.format(_getMaxDate(),"yyyy-mm-dd");



	function _getMinDate(){
		var minDate=zDate.addYear(-50,_now);
		minDate.setMonth(0);
		minDate.setDate(1);
		return minDate;

	}

	function _getMaxDate(){
		var maxDate=zDate.addYear(50,_now);
		maxDate.setMonth(11);
		maxDate.setDate(31);
		return maxDate;
	}


	var DatePicker=function(options){

			var defaults={
				render:null, //关联文本框元素
				enableYears:_years,//可选年份范围
				disabledCls:"date-disabled",//禁止选择class
				selectedCls:"date-selected",
				buttons:[],
				offset:2,
				liHeight:40,
				dateFormat:"yyyy-mm-dd",
				minDate:_minDate,
				maxDate:_maxDate

			}

			this.options=$.extend(defaults,options||{});
			if(!this.options.isSelectedDate){
				this.options.isSelectedDate=zDate.format(new Date(),this.options.dateFormat);
			}
			this.createDate();
	}

	DatePicker.prototype={

			getSelectedYear:function(){
				var year=$(".date-picker .date-year").find(".date-list li.date-selected").data("year")||
				$(".date-picker .date-year").find(".date-list li.date-selected").attr("data-year");
				return parseInt(year);
			},
			getSelectedMonth:function(){
				var month=$(".date-picker .date-month").find(".date-list li.date-selected").data("month")||
				$(".date-picker .date-month").find(".date-list li.date-selected").attr("data-month");
				return parseInt(month);
			},
			getSelectedDay:function(){
				var day=$(".date-picker .date-day").find(".date-list li.date-selected").data("day")||
				$(".date-picker .date-day").find(".date-list li.date-selected").attr("data-day");
				return parseInt(day);
			},
			setSelectedDate:function(){
				var self=this;
				var date=new Date(this.options.isSelectedDate);
				var old_date=self.getSelectedDay()?self.getSelectedDay():date.getDate();
				date.setYear(self.getSelectedYear());
				date.setMonth(self.getSelectedMonth()-1);
				// console.log(date);
				var day=function(){
				
					if (self.getSelectedMonth()==2) {
						if ( ( (self.getSelectedYear()%4==0)&&(self.getSelectedYear()%100 != 0) ) || (self.getSelectedYear()%400==0) ) { // leap year
							if (old_date> 29){ 
								return 29; 
							}
							else{
								return old_date ;
							}
						}
						else { 
							if (old_date > 28) { 
								return 28; 
							} 
							else{
								return old_date ;
							}
						}
					}
					if ((self.getSelectedMonth()==4)||(self.getSelectedMonth()==6)||(self.getSelectedMonth()==9)||(self.getSelectedMonth()==11)) {
						if (old_date >  30) { 
							return 30; 
						}
						else{
							return old_date ;
						}
					}
					else{
						return old_date ;
					}
				}();
				
				date.setDate(day);
				// console.log(date)
				this.options.isSelectedDate=zDate.format(date,this.options.dateFormat);
				$(".date-picker  .date-header h1").html(this.options.isSelectedDate);
			},
			_createYears:function(){
				var self=this;
				var years=[];
				if(!this.options.enableYears[0]||!this.options.enableYears[1]){
					return;
				}
				for(var i=this.options.enableYears[0];i<=this.options.enableYears[1];i++){
					years.push(i);
				}
				var htmlStr=[];
				for(var i=0;i<self.options.offset;i++){
					htmlStr.push("<li></li>");
				}
				
				zUtils.each(years,function(value,index){
					 var yearObj={year:value};

					 if(value<self.options.minYear||value>self.options.maxYear){
					 	yearObj.isEnable=self.options.disabledCls;
					 }
					 if(zDate.parse(self.options.isSelectedDate).getFullYear()==value){
					 	yearObj.selected=self.options.selectedCls;
					 }
					 htmlStr.push(zUtils.substitute(yearTpl,yearObj));
				});
				for(var i=0;i<self.options.offset;i++){
					htmlStr.push("<li></li>");
				}
				$(".date-picker .date-year").find(".date-list").html(htmlStr.join(""));
				
			},
			_createMonth:function(){
				var self=this;
				var months=[1,2,3,4,5,6,7,8,9,10,11,12];
				var htmlStr=[];
				for(var i=0;i<self.options.offset;i++){
					htmlStr.push("<li></li>");
				}
				zUtils.each(months,function(value,index){
					 var monthObj={month:value};
					 var year=parseInt(self.getSelectedYear());

					 if(year<self.options.minYear||year>self.options.maxYear){
					 	monthObj.isEnable=self.options.disabledCls;
					 }
					 if(year==self.options.minYear&&value<self.options.minMonth){
					 		monthObj.isEnable=self.options.disabledCls;
					 }
					 if(year==self.options.maxYear&&value>self.options.maxMonth){
					 		monthObj.isEnable=self.options.disabledCls;
					 }
					 if(zDate.parse(self.options.isSelectedDate).getMonth()+1==value){
					 	monthObj.selected=self.options.selectedCls;
					 }

					 htmlStr.push(zUtils.substitute(monthTpl,monthObj));
				});
				for(var i=0;i<self.options.offset;i++){
					htmlStr.push("<li></li>");
				}
				$(".date-picker .date-month").find(".date-list").html(htmlStr.join(""));
				
			},
			_createDay:function(){
				var self=this;
				var days=[];
				var year=parseInt(this.getSelectedYear());
				var month=parseInt(this.getSelectedMonth());
				var date=new Date();
				date.setYear(year);
				date.setMonth(month-1);
				for(var i=1;i<=31;i++){
					var curr_date=new Date(date.setDate(i));
					var isCurrentMonth=function(){
						  if(curr_date.getFullYear()!=year) return false;
						  if(curr_date.getMonth()+1!=month) return false;
						  return true;
					}();
					if(isCurrentMonth){
						days.push(i);
					}
				}
				var htmlStr=[];
				for(var i=0;i<self.options.offset;i++){
					htmlStr.push("<li></li>");
				}
				zUtils.each(days,function(value,index){
					 var dayObj={day:value};
					 var year=parseInt(self.getSelectedYear());
					 var month=parseInt(self.getSelectedMonth());

					 if(year<self.options.minYear||year>self.options.maxYear){
					 	dayObj.isEnable=self.options.disabledCls;
					 }
					 if(year==self.options.minYear){
					 	if(month<self.options.minMonth){
					 		dayObj.isEnable=self.options.disabledCls;
					 	}
					 	else if(month==self.options.minMonth&&value<self.options.minDay){
					 			dayObj.isEnable=self.options.disabledCls;
					 	}
					 	
					 }

					  if(year==self.options.maxYear){

					 	if(month>self.options.maxMonth){
					 		dayObj.isEnable=self.options.disabledCls;
					 	}
					 	else if(month==self.options.maxMonth&&value>self.options.maxDay){
					 			dayObj.isEnable=self.options.disabledCls;
					 		
					 	}
					 	
					 }

					 if(zDate.parse(self.options.isSelectedDate).getDate()==value){
					 	dayObj.selected=self.options.selectedCls;
					 }
					 htmlStr.push(zUtils.substitute(dayTpl,dayObj));
				});
				for(var i=0;i<self.options.offset;i++){
					htmlStr.push("<li></li>");
				}
				$(".date-picker .date-day").find(".date-list").html(htmlStr.join(""));

			},
			createDate:function(){
				var self=this;

				$("body").append(datepickerTpl);
				$(".date-picker-mask").css("height",zUtils.docHeight());
				if($(self.options.render).val()!=="")
				self.options.isSelectedDate=$(self.options.render).val();

				$(".date-picker .date-year").find(".date-list").html("");
				$(".date-picker .date-month").find(".date-list").html("");
				$(".date-picker .date-day").find(".date-list").html("");

				// this.setSelectedDate(this.options.isSelectedDate);
				$(".date-picker  .date-header h1").html(this.options.isSelectedDate);

				if(this.options.minDate){
					var minDate=zDate.parse(this.options.minDate);
					this.options.minYear=minDate.getFullYear();
					this.options.minMonth=minDate.getMonth()+1;
					this.options.minDay=minDate.getDate();
				}
				if(this.options.maxDate){
					var maxDate=zDate.parse(this.options.maxDate);
					this.options.maxYear=maxDate.getFullYear();
					this.options.maxMonth= maxDate.getMonth()+1;
					this.options.maxDay=maxDate.getDate();
				}

				this._createYears();
				this._createMonth();
				this._createDay();

				this.createScroller();
				
				this.initCurrentDate();

				
				$(".date-picker .date-cancel").on("click",function(){
					self.close();
				});
				$(".date-picker .date-ok").on("click",function(){
					if($(this).hasClass("bg-disabled")) return;
					self.close();
					$(self.options.render).val(self.options.isSelectedDate);
				});

				self.open();
			},
			initCurrentDate:function(){
				var self=this;
				if(self.options.isSelectedDate){
			  		var year=zDate.parse(self.options.isSelectedDate,self.options.dateFormat).getFullYear();
			  		var month=zDate.parse(self.options.isSelectedDate,self.options.dateFormat).getMonth()+1;
			  		var day=zDate.parse(self.options.isSelectedDate,self.options.dateFormat).getDate();
			  	}

			  	var year_node_index=$(".date-picker .date-year").find("li[data-year='"+year+"']").index()-self.options.offset;
			  	var month_node_index=$(".date-picker .date-month").find("li[data-month='"+month+"']").index()-self.options.offset;
			  	var day_node_index=$(".date-picker .date-day").find("li[data-day='"+day+"']").index()-self.options.offset;
			


		  	  self.yearScroller.scrollTo(0,-year_node_index*self.options.liHeight,300);
		  	  self.monthScroller.scrollTo(0,-month_node_index*self.options.liHeight,300);
		  	  self.dayScroller.scrollTo(0,-day_node_index*self.options.liHeight,300);


			},
			createScroller:function(){
				var self=this;
				self.yearScroller=new iScroll(".date-picker .date-year");
				self.monthScroller=new iScroll(".date-picker .date-month");
				self.dayScroller=new iScroll(".date-picker .date-day");


				var start,end,offsetY;
				

				self.yearScroller.on("scrollStart",function(){
					 start=this.y;
				});
			    self.yearScroller.on("scrollEnd",function(){
			    	end=this.y;
		            offsetY=Math.round(this.y/self.options.liHeight);
		            $(".date-picker .date-year").find("li").removeClass(self.options.selectedCls);
		            $(".date-picker .date-year").find("li:eq("+Math.abs(offsetY-self.options.offset)+")").addClass(self.options.selectedCls);
			   		self._createMonth();
			   		self._createDay();
			   		self.monthScroller.refresh();
			   		self.dayScroller.refresh();
			   		self.setSelectedDate();
			   		isDisabledBtn(self);
			   		self.yearScroller.scrollTo(0,offsetY*self.options.liHeight,300);
			    });
			    self.monthScroller.on("scrollStart",function(){
					 start=this.y;
				});
			    self.monthScroller.on("scrollEnd",function(){
			    	end=this.y;
		            offsetY=Math.round(this.y/self.options.liHeight);
		          
		            $(".date-picker .date-month").find("li").removeClass(self.options.selectedCls);
		            $(".date-picker .date-month").find("li:eq("+Math.abs(offsetY-self.options.offset)+")").addClass(self.options.selectedCls);
			   		self._createDay();
			   		self.dayScroller.refresh();
			   		self.setSelectedDate();
					isDisabledBtn(self);
					self.monthScroller.scrollTo(0,offsetY*self.options.liHeight,300);
			    });
			    self.dayScroller.on("scrollStart",function(){
					 start=this.y;
				});
			    self.dayScroller.on("scrollEnd",function(){
			    	end=this.y;
		            offsetY=Math.round(this.y/self.options.liHeight);
		            $(".date-picker .date-day").find("li").removeClass(self.options.selectedCls);
		            $(".date-picker .date-day").find("li:eq("+Math.abs(offsetY-self.options.offset)+")").addClass(self.options.selectedCls);
		   			self.setSelectedDate();
		   			isDisabledBtn(self);
		   			self.dayScroller.scrollTo(0,offsetY*self.options.liHeight,300);
		   			
			    });


			},
			open:function(){
				var self=this;
				
				$(".date-picker").removeClass("hidden");
				$(".date-picker-mask").removeClass("hidden");
				zEvent.enableTouchMove(document,false); 	
				self.yearScroller.refresh();
				self.monthScroller.refresh();
			   	self.dayScroller.refresh();

			},
			close:function(){
				$(".date-picker").addClass("hidden");
				$(".date-picker-mask").addClass("hidden");
				$(".date-picker").remove();
				$(".date-picker-mask").remove();
				zEvent.enableTouchMove(document,true); 	
			}


	}


	function isDisabledBtn(self){
		// console.log($(".date-picker .date-year").find("li."+self.options.selectedCls))
		// console.log($(".date-picker .date-month").find("li."+self.options.selectedCls))
		// console.log($(".date-picker .date-day").find("li."+self.options.selectedCls))
		if($(".date-picker .date-year").find("li."+self.options.selectedCls).hasClass(self.options.disabledCls)||
			$(".date-picker .date-month").find("li."+self.options.selectedCls).hasClass(self.options.disabledCls)||
			$(".date-picker .date-day").find("li."+self.options.selectedCls).hasClass(self.options.disabledCls)){
	   		$(".date-picker .date-ok").addClass("bg-disabled");	
   		}else{
   			$(".date-picker .date-ok").removeClass("bg-disabled");	
   			
   		}	
	}


	return DatePicker;

});