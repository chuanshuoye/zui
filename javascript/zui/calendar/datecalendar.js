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
        var self=this;
        self._settings = $.extend(settings, options);

        self.isInited = false;

        /*********************************
         * 以下变量请勿在类外操作
         ********************************/
        self._$input = $(self._settings.render);// 输入框
        self._$container = null;// 输入框
        self._innerFormat = 'yyyy.mm.dd';
       // this.init();
        self._$input.on("click",function(){
                self.init();
        });
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
        // if(this.isInited){
        //     return;
        // }

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

    Calendar.prototype.setOptions=function(options){
            var self=this;
            var settings=self.settings;
            self._settings = $.extend(settings, options);
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
            self._$mask.remove();
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
