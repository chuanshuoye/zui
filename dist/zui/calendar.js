define("zui/calendar",["zui/base","zui/calendar/calendar","zui/calendar/datepicker","zui/calendar/dateCalendar"],function(require,exports,modules){

		var Calendar={
			Calendar:require("zui/calendar/calendar"),
			Datepicker:require("zui/calendar/datepicker"),
			DateCalendar:require("zui/calendar/dateCalendar")
		}

		return Calendar;

});
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
	
	
	var calenderTpl='<div  class="z-ui-calendar hidden" >'+
						'<div class="calendar-header row">'+
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
					'</div>'+
					'</div>'+
					'<div class="calendar-mask ui-mask dialog-mask hidden" ></div>';

	function Calendar(options){
			var defaultOptions={
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
 		   this._options=$.extend(defaultOptions,options||{});
 		   // this._createCalendar();
		   this._init();
		  
	}

	Calendar.prototype={

			//初始化控件
			_init:function(){
				var _self=this;
				// _self.currentDate=new Date();
				// var cYear=_self.currentDate.getFullYear();
				// var cMonth=_self.currentDate.getMonth()+1;
				// _self.selectedDate=zDate.format(_self.currentDate,_self._options.format);
				$("body").append(zUtil.substitute(calenderTpl));
				_self.el=$(".z-ui-calendar");
				_self.inputRender=$(_self._options.render);
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
				//_self.open();
				
			},

			//构建日历模板
			_createCalendar:function(){
					

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
				// _self.yearScroll= new iScroll(".calendar-year-select", { mouseWheel: true ,click: true});
				_self.years=_years;
				_self.yearScroll= new iScroll(".calendar-year-select", { bounce: false ,click: true});
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
					return _self.el.find(".calendar-year-text").html();
			},
			setYear:function(year){
					var _self=this;
					 _self.el.find(".calendar-year-text").html(year);
			},

			getMonth:function(){
					var _self=this;
					var month=parseInt(_self.el.find(".calendar-month-text").html());
					
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
				_self.inputRender.on("click",function(){
						_self.open();
				});
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
				if((!inputDate||inputDate=="")&&_self._options.minDate){
					var d=zDate.parse(_self._options.minDate,_self._options.format);
					_self.setYear(d.getFullYear());
					_self.setMonth(d.getMonth()+1);
				}
				else{
					_self.setDate(inputDate);
				}
				
				zEvent.enableTouchMove(document,false); 	
				_self.el.next(".calendar-mask").css("height",zUtil.docHeight());
//				_setSelected(_self,zDate.format(_self._options.defaultDate,_self._options.format));
				_self._show();
				_self.refresh(_self.getDate());
				
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
				_self.el.next(".calendar-mask").html("").remove();
				_self.el.html("").remove();
				zEvent.enableTouchMove(document,true); 	
			},

			destory:function(){
				var _self=this;
				_self.el.remove();
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
define("zui/calendar/datecalendar",["zui/base"],function(require,exports,module){
    // var zArray=require("zui/array");
    // var zDate=require("zui/date");
    var zbase=require("zui/base");
    // var zUtil=zbase.Utils;
    var zArray=zbase.Array;
    var zDate=zbase.Date;
   

    var Calendar = function(options) {
        var settings = {
            input : '#', //绑定日历的控件
            format : 'yyyy-mm-dd', //显示的最小日期
            defaultDate : '', //显示的最小日期
            selectedSuffix : '', //选中日期显示的后缀
            minDate : '', //显示的最小日期
            maxDate : '', //显示的最大日期
            monthNum : 12, //显示几个月的日历
            yearGroup:[],//显示几年的日历
            cancelText : '取消', // "取消"按钮的文本
            onSelect : null
        };
        this._settings = $.extend(settings, options);

        this.isInited = false;

        /*********************************
         * 以下变量请勿在类外操作
         ********************************/
        this._$input = $(this._settings.input);// 输入框
        this._$container = null;// 输入框
        this._innerFormat = 'yyyy.mm.dd';
        this.init();
    };
    Calendar.STYLES = [
        '.g_calendar{z-index:1000; min-height:100%;background: #fff; position: absolute; top: 0; width: 100%; padding-bottom:20px;}',
        '.g_calendar .gc_item{text-align: center;}',
        '.g_calendar .gc_month{ color: #313131; font-size: 15px; padding: 15px 0; font-weight: bold;}',
        '.g_calendar .gc_date{ width: 100%; font-size: 15px;}',
        '.g_calendar .gc_date th{text-align:center; padding:5px 0;border-bottom: 1px solid #c9c9c9; width: 14.285714285714286%;vertical-align:middle;}',
        '.g_calendar .gc_date td{text-align:center; height: 45px; cursor: pointer; vertical-align:middle;}',
        '.g_calendar .gc_date td.gc_festival{color: #007aff; font-weight: bold;}',
        '.g_calendar .gc_date td.gc_selected{ background: #06c003; color: #fff; font-weight: bold;}',
        '.g_calendar .gc_date td.gc_invalid{ color: #c9c9c9; cursor:auto;}',
        '.g_calendar .gc_date td:hover{ background: #fafafa;}',
        '.g_calendar .gc_date td.gc_invalid:hover{ background:none;}',
        '.g_calendar .gc_date td.gc_selected:hover{ background:#06c003;}',
        '.g_calendar .gc_date td{ height: 45px; }',
        '.g_calendar .g_calendar_more{text-align:center;padding:15px 0;}',
        '.g_calendar_mask{display:none;background-color:#fff;position:fixed;height:100%;width:100%;z-index:999;top:0;bottom:0;}',
        '.g_calendar .g_calendar_year{border-bottom:1px solid #e3e3e3;padding: 15px;text-align: left;color: #666;display: block;background-color: #f2f2f2;font-weight: 800;}'
    ];
    Calendar.FESTIVAL = {
        "2015-02-14" : "情人",
        "2015-02-18" : "除夕",      
        "2015-06-20" : "端午",
        "2015-08-20" : "七夕",
        "2015-09-27" : "中秋",
        "01.01" : "元旦",
        "03.05" : "元宵",
        "04.05" : "清明",
        "05.01" : "劳动",
        "10.01" : "国庆",
        "11.11" : "光棍",
        "12.25" : "圣诞"
    };

    Calendar.FESTIVAL[zDate.format(new Date(),'yyyy-mm-dd')] = '今天';
    Calendar.FESTIVAL[zDate.format(new Date().getTime() + 86400000 * 1,'yyyy-mm-dd')] = '明天';
    Calendar.FESTIVAL[zDate.format(new Date().getTime() + 86400000 * 2,'yyyy-mm-dd')] = '后天';
    /********************************************************************************************
     * 显示对话框最底层接口
     *******************************************************************************************/
    Calendar.prototype.init = function() {
        var self = this;
        if(this.isInited){
            return;
        }

        self._$container = $('<div class="g_calendar" style="display: none"><div class="g_calendar_date"></div></div>');
        self._$container.appendTo($('body'));

        self._$mask=$('<div class="g_calendar_mask" ></div>');
        self._$mask.appendTo($('body'));

        var id = "__calendar_style_";
        var $style = $('#' + id);
        if ($style.length < 1) {
            $style = $('<style id="' + id + '" type="text/css" rel="stylesheet"></style>');
            $('head').eq(0).append($style);
            var style = $style[0];
            if (style.sheet && style.sheet.insertRule) {
                for ( var i = 0, len  = Calendar.STYLES.length; i < len; i++) {
                    style.sheet.insertRule(Calendar.STYLES[i], i);
                }
            } else {
                style.styleSheet.cssText = Calendar.STYLES.join('');
            }
        }
        self.isInited = true;
        self.show();
    };
    Calendar.prototype.onSelect = function(date){
        var self=this;
        self._$container.hide();
        if($.isFunction(self._settings.onSelect)){
            self._settings.onSelect(date);
        }else{
            self._$input.val(date);
        }

        self._$mask.hide();
    };
    Calendar.prototype.show = function(){
        var self=this;
        self._$input.blur();
      
        $(".g_calendar_date",self._$container).html("");
        self.yearGroup=[];
        self._$container.show();

        var date = new Date();
        self.createMonthItem(date);
        var len = Math.max(1, self._settings.monthNum);
        for(var i =0 ;i < len; i++){
            date=zDate.addMonths(1,date);
            self.createMonthItem(date);
        }

         self._$mask.show();
         $(window).scrollTop(0);

    };
     Calendar.prototype.close = function(){
            var self=this;
            self._$container.html("");
            self._$container.remove();
    } 
    /**
     @param cDate date
    */
    Calendar.prototype.createYearGroup=function(date,yeargroup){
             var self=this;
             var yearGroupToggle=$('<a href="javascript:;" class="g_calendar_year">'+yeargroup+'年</a>');
             var yearGroupContainer=$('<div class="g_calendar_year_'+yeargroup+' hidden"></div>');
             if(!zArray.contains(yeargroup,self.yearGroup)){
                self.yearGroup.push(yeargroup);
                self._$yearGroupContainer=yearGroupContainer;
                 $(".g_calendar_date",self._$container).append(yearGroupToggle);
                 $(".g_calendar_date",self._$container).append(self._$yearGroupContainer);
             }
             self.createMonthItem(date,self._$yearGroupContainer);
             
            
    };
    /**
     * @param cDate date
     */
    Calendar.prototype.createMonthItem = function(date,$yearGroup){
        var self=this;
        var date = new Date(date.getTime());
        var monthClass = "jDate_" + zDate.format(date,'yyyymm');
        if(self._$container.find('.' + monthClass).length > 0){
            return;
        }

        var dateHtml = [];
        var month = date.getMonth();
        var dateMonth = zDate.format(date,'yyyy年mm月');

        var dateCounter = 1;
        date.setDate(dateCounter);
        var startWeekDay = date.getDay();
        for(var i=0; i < 42; i++){
            if(i == 0){
                dateHtml.push('<tr>');
            }
            if(i < startWeekDay){
                dateHtml.push(self.makeCell(null));
                continue;
            }

            date.setDate(dateCounter++);
            var isCurrentMonth = (date.getMonth() == month);
            dateHtml.push(this.makeCell(isCurrentMonth ? date : null));
            if((i+1) % 7 == 0){
                dateHtml.push('</tr>');
                if(!isCurrentMonth){
                    break;
                }
            }
        }
        var $monthItem = $('\
        <div class="gc_item ' + monthClass + '">\
            <div class="gc_month">' + dateMonth + '</div>\
            <table class="gc_date">\
                <tr>\
                    <th>日</th>\
                    <th>一</th>\
                    <th>二</th>\
                    <th>三</th>\
                    <th>四</th>\
                    <th>五</th>\
                    <th>六</th>\
                </tr>\
                ' + dateHtml.join('') + '\
            </table>\
        </div>');


        $monthItem.find('td.gc_normal').on('click', function(){
            var $self = $(this);
            var date = zDate.parse($self.data('date'), self._settings.format);
            self.onSelect(zDate.format(date,self._settings.format));
            self.close();
        });
         this._$container.append($monthItem);
    };

    /**
        @param cDate|null date
    **/

    Calendar.prototype.openActiveYearGroup=function(date){
            var self=this;
            var selectedYear=date.getFullYear();
            $(".g_calendar_year_"+selectedYear,self._$container).removeClass("hidden");
    };

    /**
     *
     * @param cDate|null date
     */
    Calendar.prototype.makeCell = function(date){
        var self=this;
        if(date == null){
            return '<td class="gc_invalid"></td>';
        }
        var format = self._innerFormat;

        var currentDate = zDate.format(date,self._settings.format);
        var currentDate2 = zDate.format(date,"mm.dd");

        var selected = $.trim(self._$input.val()) || self._settings.defaultDate;

        var selectedDateOb = zDate.parse(selected, self._settings.format);
        var selectedDate = selectedDateOb ? zDate.format(selectedDateOb,self._settings.format) : '';

        var className = '';
        var dateText = date.getDate();
        if(Calendar.FESTIVAL[currentDate2]){
            className += ' gc_festival';
            dateText = Calendar.FESTIVAL[currentDate2];
        }
        if(Calendar.FESTIVAL[currentDate]){
            className += ' gc_festival';
            dateText = Calendar.FESTIVAL[currentDate];
        }
        if(currentDate == selectedDate){
            className += ' gc_selected';
            if(self._settings.selectedSuffix && dateText){
                dateText += '<br/>' + self._settings.selectedSuffix;
            }
        }

      

        var minDate = self._settings.minDate ? zDate.format(new Date(self._settings.minDate), self._settings.format) : null;
        var maxDate = self._settings.maxDate ?  zDate.format(new Date(self._settings.maxDate), self._settings.format) : null;

        if(minDate &&  zDate.parse(currentDate) < zDate.parse(minDate)){
            className += ' gc_invalid';
        }
        else if(maxDate &&  zDate.parse(currentDate) >  zDate.parse(maxDate)){
             className += ' gc_invalid';
        }
        else{
            className += ' gc_normal';
        }


        return '<td class="' + $.trim(className) + '" data-date="' + currentDate + '">' + dateText + '</td>';
    };
    

    return  Calendar;
    

});

define("zui/calendar/datepicker",['zui/base',"zui/mixin"],function(require){
	
	// var zUtils=require("zui/utils");
	// var zDate=require("zui/date");
	// var iScroll=require("zui/mixin/scrollbar");
	// var zEvent=require("zui/mixin/event");
	var zbase=require("zui/base");
	var mixin=require("zui/mixin");
	var zUtil=zbase;
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