define("zui/calendar/calendar",['zui/base','zui/mixin'],function(require){
	'use strict';

	var zbase=require("zui/base");
	var mixin=require("zui/mixin");
	var zUtil=zbase;
	var zArray=zbase.Array;
	var zDate=zbase.Date;
	var iScroll=mixin.iScroll;
	var zEvent=mixin.Event;
	var Touch=mixin.Touch;
	var isAnimation=zEvent.isSuportAnimation();
	
	
	var calenderTpl='<div class="calendar-header row">'+
							'<div class="calendar-year col-two-1">'+
								'<div class="row">'+
								'<div class="calendar-year-prev col-three-1"><a href="javascript:;">&lt;</a></div>'+
								'<div class="calendar-year-text col-three-1"></div>'+
								'<div class="calendar-year-next col-three-1"><a href="javascript:;">&gt;</a></div>'+
								'</div>'+
							'</div>'+
							'<div class="calendar-month col-two-1">'+
								'<div class="row">'+
								'<div class="calendar-month-prev col-three-1"><a href="javascript:;">&lt;</a></div>'+
								'<div class="calendar-month-text col-three-1"></div>'+
								'<div class="calendar-month-next col-three-1"><a href="javascript:;">&gt;</a></div>'+
								'</div>'+
							'</div>'+
							'<table class=" calendar-weekday table table-border">'+
								'<tbody >'+
									'<tr>'+
										'<td>日</td>'+
										'<td>一</td>'+
										'<td>二</td>'+
										'<td>三</td>'+
										'<td>四</td>'+
										'<td>五</td>'+
										'<td>六</td>'+
									'</tr>'+
								'</tbody>'+
							'</table>'+
						'</div>'+
						'<div class="calendar-year-select hidden">'+
						'<ul class="row" ></ul>'+
						'</div>'+
						'<div class="calendar-month-select hidden ">'+
						'<ul class="row" ></ul>'+
						'</div>'+
						'<div class="calendar-content ">'+
						'<div class="calendar-scroller">'+
							'<div class="calendar-prev">'+
							'<table class=" table table-border">'+
								'<tbody>'+
								'</tbody>'+
							'</table>'+
							'</div>'+
							'<div class="calendar-actived ">'+
							'<table class=" table table-border">'+
								'<tbody>'+
								'</tbody>'+
							'</table>'+
							'</div>'+
							'<div class="calendar-next   ">'+
							'<table class=" table table-border">'+
								'<tbody>'+
								'</tbody>'+
							'</table>'+
						'</div>'+
						'</div>'+
					'</div>';

	function Calendar(options){
			this.defaultOptions={
					format:"yyyy-mm-dd",
					// shortFormat:"yyyy-mm",
					disabled:"calendar-disabled",
					selected:"calendar-selected",
					invalid:"calendar-invalid",
					normal:"calendar-normal",
					defaultDate:new Date(),
					disabledDates:[],
					eventDates:[],
					calendar:null,
					selectedTpl:null,
					years:[zDate.addYear(-100,new Date()).getFullYear(),zDate.addYear(100,new Date()).getFullYear()],//年份范围
					months:[1,12],//月份范围
					times:[],//时间范围
					minDate:null,
					maxDate:null,
					beforeSelectDate:function(){return true;},
					afterSelectDate:function(){return true;}

			};
 		   this._createOptions(options);
 		   this._createCalendar();
		  // this._init();
		  
	}

	Calendar.prototype={


			_init:function(){
				var _self=this;
				// _self.currentDate=new Date();
				// var cYear=_self.currentDate.getFullYear();
				// var cMonth=_self.currentDate.getMonth()+1;
				// _self.selectedDate=zDate.format(_self.currentDate,_self._options.format);
				
				
				//日期表头部容器
				_self.calendarHeader=_self.el.find(".calendar-header");

				_self.calendarYearPrev=_self.el.find(".calendar-year-prev");
				_self.calendarYearNext=_self.el.find(".calendar-year-next");

				_self.calendarMonthPrev=_self.el.find(".calendar-month-prev");
				_self.calendarMonthNext=_self.el.find(".calendar-month-next");



				//日期表容器
				_self.calendarContainer=_self.el.find(".calendar-content")
				
				//日期表容器上一月
				_self.calendarPrevWrapper=_self.el.find(".calendar-prev");
				//日期表容器当前月
				_self.calendarCurrentWrapper=_self.el.find(".calendar-actived");
				//日期表容器下一月
				_self.calendarNextWrapper=_self.el.find(".calendar-next");


				_self._createYearSelect(_self._options.years);
				_self._createMonthSelect(_self._options.months);

				if(!isAnimation){
					_self.calendarPrevWrapper.removeClass("calendar-animate left right").addClass("hidden");
					_self.calendarNextWrapper.removeClass("calendar-animate left right").addClass("hidden");
				}
				// _self.refresh(new Date());
				_self.eventhandler();
				
			},
			_createOptions:function(options){
				 var _self=this;
				 _self._options=$.extend(_self.defaultOptions,options||{});
			},
			//构建日历模板
			_createCalendar:function(){
				var _self=this,calendarTpl=zUtil.substitute(calenderTpl);
				_self.inputRender=$(_self._options.render);
				_self.inputRender.on("click",function(){
					//清除
					_self.destory();
					var calendar=$('<div class="z-ui-calendar hidden"></div>');
					$("body").append(calendar).append('<div class="calendar-mask ui-mask dialog-mask hidden" ></div>');	
					calendar.append(calenderTpl);
					_self.el=$(calendar);
					_self._init();
					_self.open();
				});
			},

			//生成可选年份
			_createYearSelect:function(years){
				var _self=this;
				var _years=[];
				var y_html="";
				for(var i=years[0];i<=years[1];i++){
						_years.push(i);
						y_html+=zUtil.substitute(_self._getYearTpl(),{year:i});
				}
				
				_self.el.find(".calendar-year-select ul").html(y_html);
				// console.log($(".calendar-year-select",_self.el)[0])
				// _self.yearScroll= new iScroll(".calendar-year-select", { mouseWheel: true ,click: true});
				_self.years=_years;
				_self.yearScroll= new iScroll($(".calendar-year-select",_self.el)[0],{ bounce: false ,click: true});
			},
			_hideYearMonthSelect:function(){
				var _self=this;
				_self.el.find(".calendar-year-select").addClass("hidden");
				_self.el.find(".calendar-month-select").addClass("hidden");
			},

			//生成可选月份
			_createMonthSelect:function(months){
				var _self=this;
				var _months=[];
				var y_html="";
				for(var i=months[0];i<=months[1];i++){
						_months.push(i);
						y_html+=zUtil.substitute(_self._getMonthTpl(),{month:i,monthText:i+"月"});
				}
				_self.el.find(".calendar-month-select ul").html(y_html);
				_self.months=_months;
			},

			//生成当月日期表
			_createCurrentMonthDays:function(date){
				var _self=this;
				var c_date=date;
				var htmlTpl=_makeDayCell(_self,c_date,"actived");
				_self.el.find(".calendar-actived tbody").html(htmlTpl);
				

			},
			//生成上一月日期表
			_createPrevMonthDays:function(date){
				var _self=this;
				var c_date=date;				
				var htmlTpl=_makeDayCell(_self,zDate.addMonths(-1,c_date),"prev");
				_self.el.find(".calendar-prev tbody").html(htmlTpl);


			},
			//生成下一月日期表
			_createNextMonthDays:function(date){
				var _self=this;
				var c_date=date;
				var htmlTpl=_makeDayCell(_self,zDate.addMonths(1,c_date),"next");
				_self.el.find(".calendar-next tbody").html(htmlTpl);
			},

			getYear:function(){
					var _self=this;
					return _self.selectedYear;
			},
			setYear:function(year){
					var _self=this;
					 _self.el.find(".calendar-year-text").html(year);
					 _self.selectedYear=year;
			},

			getMonth:function(){
					var _self=this;
					var month=parseInt(_self.selectedMonth);
					return month;
			},
			setMonth:function(month){
					var _self=this;
					if(month<1){
						month="12";
						_self.setYear(parseInt(_self.getYear())-1);
					}
					
					if(month>12){
						month="1";
						_self.setYear(parseInt(_self.getYear())+1);

					}

					 _self.el.find(".calendar-month-text").html(month);
					  _self.selectedMonth=month;
			},
			_getSelectedDate:function(){
					var _self=this;
					var selectedDate=_self.el.find("."+_self._options.selected).html();
					if(_self._getInputVal()!=""){
						_self._options.defaultDate=_self._getInputVal();
						return zDate.parse(_self._getInputVal(),_self._options.format).getDate();
					}
					if(selectedDate&&selectedDate!=""){
						if(_self._options.selectedTpl){
							var r_date=selectedDate.replace(/[^0-9,]*/g,"");
							if(r_date>=1&&r_date<10){
								r_date="0"+r_date;
							}
						}
						return r_date;
					}
					else{
						return new Date().getDate();;
					}
			},
			getDate:function(){
					var _self=this;
					var year= _self.getYear();
					var month=parseInt(_self.getMonth());
					// if(month>=1&&month<10){
					// 	 month="0"+month;
					// }
					
					var date=_self._getSelectedDate();
					
					if(date&&date!=""){
						 var c_date=new Date();
						 c_date.setYear(year);
						 c_date.setMonth(month-1);
						 c_date.setDate(date);
						return zDate.parse(c_date,_self._options.format);
					}
					
					else{
						
						 var c_date=new Date();
						 c_date.setYear(year);
						 c_date.setMonth(month-1);
						return zDate.parse(c_date,_self._options.format);
					}
						
			},

			setDate:function(inputDate){
				var _self=this;
				if(inputDate){
					var date=zDate.parse(inputDate,_self._options.format);
					_self.setYear(date.getFullYear());
					_self.setMonth(date.getMonth()+1);
					_self._options.defaultDate=zDate.parse(inputDate,_self._options.format);
				}
				else{
					var date=zDate.parse(new Date(),_self._options.format);
					_self.setYear(date.getFullYear());
					_self.setMonth(date.getMonth()+1);
				}

				
			},
			//日期表模板
			_getDayTpl:function(date){
				return zUtil.substitute("<td data-date='{date}' class='{cls}'>{day}</td>",date);
			},

			_getWeekTpl:function(week){
				return zUtil.substitute("<tr data-week='{week}'></tr>",week);
			},

			_getYearTpl:function(year){
				return zUtil.substitute("<li class='col-four-1 c-year' data-year='{year}'>{year}</li>",year);
			},

			_getMonthTpl:function(month){
				return zUtil.substitute("<li class='col-two-1 c-month' data-month='{month}'>{monthText}</li>",month);
			},

			//年份 月份选择事件监听
			eventhandler:function(){
				var _self=this;
				
				_self.calendarHeader.find(".calendar-year-text").on("click",function(){
						_self.el.find(".calendar-year-select").removeClass("hidden");
						_self.el.find(".calendar-month-select").addClass("hidden");
						_self.yearScroll.refresh();
						

				});
				_self.calendarHeader.find(".calendar-month-text").on("click",function(){
					 _self.el.find(".calendar-month-select").removeClass("hidden");
					 _self.el.find(".calendar-year-select").addClass("hidden");
					
				});
				_self.el.find(".calendar-year-select").on("click",function(ev){

						var domTarget=ev.target;
						if($(domTarget).hasClass("c-year")){
								_self.setYear($(domTarget).data("year"));
								_self.refresh(_self.getDate());
						}
						_self.el.find(".calendar-year-select").addClass("hidden");
				});

				_self.el.find(".calendar-month-select").on("click",function(ev){
						
						var domTarget=ev.target;
						if($(domTarget).hasClass("c-month")){
								_self.setMonth($(domTarget).data("month"));
								_self.refresh(_self.getDate());
						}
						_self.el.find(".calendar-month-select").addClass("hidden");
				});

				//上一年
				_self.calendarYearPrev.on("click",function(ev){

					ev.preventDefault();
					_self._hideYearMonthSelect();
					var prevYearDate=zDate.addYear(-1,_self.getDate());
					if(!_isYears(_self,prevYearDate.getFullYear())){
						return;
					}
					_self.setYear(prevYearDate.getFullYear());
					_self.refresh(prevYearDate);
//					_setSelected(_self,zDate.format(_self._options.defaultDate,_self._options.format));
				});

				//下一年
				_self.calendarYearNext.on("click",function(ev){
					ev.preventDefault();
					_self._hideYearMonthSelect();
					var nextYearDate=zDate.addYear(1,_self.getDate());
					if(!_isYears(_self,nextYearDate.getFullYear())){
						return;
					}
					_self.setYear(nextYearDate.getFullYear());
					// console.log(zDate.format(nextYearDate,"yyyy-mm-dd"));
					_self.refresh(nextYearDate);
//					_setSelected(_self,zDate.format(_self._options.defaultDate,_self._options.format));

				});

				//上一月
				_self.calendarMonthPrev.on("click",function(ev){
					ev.preventDefault();
					_self._hideYearMonthSelect();
					var c_month=parseInt(_self.getMonth());
					if(!_isYears(_self,zDate.addMonths(-1,_self.getDate()).getFullYear())){
						return;
					}
					_self.setMonth(c_month-1);
					_self.calendarCurrentWrapper.addClass("calendar-animate right");
					_self.calendarPrevWrapper.addClass("calendar-animate right");
					_animateEnd(_self,"right");

				});
				//下一月
				_self.calendarMonthNext.on("click",function(ev){
					ev.preventDefault();
					_self._hideYearMonthSelect();
					var c_month=parseInt(_self.getMonth());
					if(!_isYears(_self,zDate.addMonths(1,_self.getDate()).getFullYear())){
						return;
					}
					_self.setMonth(c_month+1);
					_self.calendarCurrentWrapper.addClass("calendar-animate left");
					_self.calendarNextWrapper.addClass("calendar-animate left");
					_animateEnd(_self,"left");
					

				});



				//swipe 滑动切换
				Touch.on(_self.calendarContainer,"swipe",function(e){
						
						if(e.direction=="left"){
							var c_month=parseInt(_self.getMonth());
							if(!_isYears(_self,zDate.addMonths(1,_self.getDate()).getFullYear())){
								return;
							}
							_self.setMonth(c_month+1);
							_self.calendarCurrentWrapper.addClass("calendar-animate left");
							_self.calendarNextWrapper.addClass("calendar-animate left");
							_animateEnd(_self,e.direction);
						


						}
						if(e.direction=="right"){
							var c_month=parseInt(_self.getMonth());
							if(!_isYears(_self,zDate.addMonths(-1,_self.getDate()).getFullYear())){
								return;
							}
							_self.setMonth(c_month-1);
							_self.calendarCurrentWrapper.addClass("calendar-animate right");
							_self.calendarPrevWrapper.addClass("calendar-animate right");
							_animateEnd(_self,e.direction);
							
						}

				});


				//日期点击事件
				_self.calendarContainer.on("click",function(ev){
						var domTarget=ev.target;
						if(!$(domTarget).hasClass("calendar-disabled")){
							var select_date=$(domTarget).data("date")||$(domTarget).attr("data-date");
							if(zUtil.isFunction(_self._options.beforeSelectDate)){
							 	var _res= _self._options.beforeSelectDate.call(this,{date:select_date});
							}
							if(!_res) {
								_self.close();
								return;
							} 

//							if(_self.inputRender[0].tagName=="INPUT"){
//								_self.inputRender.val(select_date);
//							}
//							else{
//								_self.inputRender.html(select_date);
//							}
							_self.inputRender.val(select_date)||_self.inputRender.html(select_date);
							_self.setDate(select_date);
							if(zUtil.isFunction(_self._options.afterSelectDate)){
								 _self._options.afterSelectDate.call(this,{date:select_date});
							}

							_self.close();
						}



				});

				//日历外点击隐藏
				_self.el.next(".calendar-mask").on("click",function(){
					_self.close();
				})

			},
			_isDisabled:function(date){
				var _self=this;
				return zArray.contains(zDate.format(date,_self._options.format),_self._options.disabledDates);

			},
			setOptions:function(options){
				 var _self=this,_options=this._options;
				 _self._options=$.extend(_options,options||{});
			},
			refresh:function(date){
				var _self=this;
				_self._createCurrentMonthDays(date);
				_self._createPrevMonthDays(date);
				_self._createNextMonthDays(date);
				_setSelected(_self,zDate.format(_self._options.defaultDate,_self._options.format));
				
			},
			_getInputVal:function(){
				var _self=this;
				return _self.inputRender.val()||_self.inputRender.html();
			},
			open:function(){
				var _self=this;
				var inputDate=_self._getInputVal();
				// if(!inputDate||inputDate==""){
				// 	var d=zDate.parse(_self._options.minDate,_self._options.format);
				// 	_self.setYear(d.getFullYear());
				// 	_self.setMonth(d.getMonth()+1);
				// }
				// else{
					_self.setDate(inputDate);
				// }
				
				zEvent.enableTouchMove(document,false); 	
				_self.el.next(".calendar-mask").css("height",zUtil.docHeight());
//				_setSelected(_self,zDate.format(_self._options.defaultDate,_self._options.format));
				console.log(inputDate)
				_self.refresh(_self.getDate());
				_self._show();
				
			},
			_show:function(){
				var _self=this;
				var delayShow=setTimeout(function(){
					_self.el.removeClass("hidden").addClass("animated slideInUp");
					_self.el.next(".calendar-mask").removeClass("hidden");
					$(window).scrollTop($(window).scrollTop());
					if(delayShow) clearTimeout(delayShow);
				},20);
			},
			close:function(){
				var _self=this;
				_self.el.next(".calendar-mask").addClass("hidden");
				_self.el.addClass("hidden");
				
				zEvent.enableTouchMove(document,true); 	
			},

			destory:function(){
				var _self=this;
				if(_self.el){
					_self.el.next(".calendar-mask").html("").remove();
					_self.el.html("").remove();
				}
				
			}

	}

	function _makeDayCell(_self,date,type){
		
		var mTpl="";
		var c_date=new Date(date);
		c_date.setDate(1);
		var startWeekDay=c_date.getDay();
		for(var i=(0-startWeekDay);i<(42-startWeekDay);i++){
			 var s_date=new Date(zDate.addDay(i,c_date));
			 // s_date.setHours(0);
			 // s_date.setMinutes(0);
			 // s_date.setSeconds(0);
			 var weekDay=s_date.getDay();

			 var isCurrentMonth=false;
			 

			 if(type=="actived"){
			 	if((s_date.getMonth()+1)==parseInt(_self.getMonth())){
			 		isCurrentMonth=true;
			 	}
			 }
			  if(type=="prev"){
			 	if((s_date.getMonth()+2)==parseInt(_self.getMonth())){
			 		isCurrentMonth=true;
			 	}
		 		else if(s_date.getFullYear()+1==parseInt(_self.getYear())){
		 			isCurrentMonth=true;
		 		}
			 }
			  if(type=="next"){
			 	if(s_date.getMonth()==parseInt(_self.getMonth())){
			 		isCurrentMonth=true;
			 	}
			 	else if(s_date.getFullYear()-1==parseInt(_self.getYear())){
		 			isCurrentMonth=true;
		 		}
			 }

			if((i+startWeekDay+1)%7==1){
			 	mTpl+="<tr>";
			 }
		
			mTpl=_createDateCell(_self,mTpl,s_date,isCurrentMonth);
		
			if((i+startWeekDay+1)%7==0){
			 	mTpl+="</tr>";
			 }
		}
		return mTpl;
	}


	function _createDateCell(_self,mTpl,s_date,isCurrentMonth){

		    if(_self._isDisabled(s_date)){
	 			mTpl+=_self._getDayTpl({cls:_self._options.disabled,date:zDate.format(s_date,_self._options.format),day:s_date.getDate()});
		 	}
		 	else if(_self._options.minDate&&zDate.parse(zDate.format(s_date,_self._options.format),_self._options.format)<zDate.parse(_self._options.minDate,_self._options.format)){
		 		mTpl+=_self._getDayTpl({cls:_self._options.disabled,date:zDate.format(s_date,_self._options.format),day:s_date.getDate()});
		 	}
		 	else if(_self._options.maxDate&&zDate.parse(zDate.format(s_date,_self._options.format),_self._options.format)>zDate.parse(_self._options.maxDate,_self._options.format)){
		 		mTpl+=_self._getDayTpl({cls:_self._options.disabled,date:zDate.format(s_date,_self._options.format),day:s_date.getDate()});
		 	}
		 	else if(isCurrentMonth){
		 		mTpl+=_self._getDayTpl({cls:_self._options.normal,date:zDate.format(s_date,_self._options.format),day:s_date.getDate()});
		 	}
		 	else{
		 		mTpl+=_self._getDayTpl({cls:_self._options.invalid,date:zDate.format(s_date,_self._options.format),day:s_date.getDate()});
		 	}

		 	return mTpl;

	}


	function _setSelected(_self,date){
			var dateList=_self.el.find("td"+"."+_self._options.normal);
			
			$("td",_self.calendarContainer).removeClass(_self._options.selected);
			
			zArray.each(dateList,function(elem,index){
					if($(elem).data("date")==date||$(elem).attr("data-date")==date){
						$(elem).addClass(_self._options.selected);
						if(_self._options.selectedTpl){
							$(elem).html(zUtil.substitute(_self._options.selectedTpl,{date:zDate.parse(date,_self._options.format).getDate()}));
							// _self.calendarContainer.css("min-height",_self.calendarCurrentWrapper.height());
						}
						return;
					}
			});
			
			

			
	}

	function _isYears(_self,year){
			var years=_self.years;
			if(zArray.contains(year,years)){
				return true;
			}
			return false;
	}

	function _animateEnd(_self,direction){
		
		if(isAnimation){

			//动画监听
			_self.calendarCurrentWrapper.on("transitionend   webkitTransitionEnd",function(e){
					_self.calendarCurrentWrapper.off("transitionend   webkitTransitionEnd");
					if(direction=="left"){
						_self.calendarCurrentWrapper.removeClass("calendar-animate left");
						_self.calendarPrevWrapper.removeClass("calendar-animate left");
						_self.calendarNextWrapper.removeClass("calendar-animate left ");
						
					}
					if(direction=="right"){
						_self.calendarCurrentWrapper.removeClass("calendar-animate right");
						_self.calendarPrevWrapper.removeClass("calendar-animate right");
						_self.calendarNextWrapper.removeClass("calendar-animate right ");

					}
					 _self.refresh(_self.getDate());
					_setSelected(_self,zDate.format(_self._options.defaultDate,_self._options.format));

			});
		}
		else{
					  _self.calendarCurrentWrapper.removeClass("calendar-animate left right");
						_self.calendarPrevWrapper.removeClass("calendar-animate left right" ).addClass("hidden");
						_self.calendarNextWrapper.removeClass("calendar-animate left right").addClass("hidden");
					 _self.refresh(_self.getDate());
					_setSelected(_self,zDate.format(_self._options.defaultDate,_self._options.format));
		}
	}

	return Calendar;

});