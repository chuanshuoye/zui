define("zui/base",["zui/base/utils","zui/base/array","zui/base/json","zui/base/date"],function(require){
        
        var zUtils=require("zui/base/utils");
        var zArray=require('zui/base/array');
        var zJson=require("zui/base/json");
        var zDate=require("zui/base/date");
        zUtils.Array=zArray;
        zUtils.JSON=zJson;
        zUtils.Date=zDate;
        if(!window.ZUI) window.ZUI=zUtils;
        return zUtils;
});

      


define("zui/base/utils",function(require, exports, module) {



  var Utils={
  		/**
         * 将表单格式化成键值对形式
         * @param {HTMLElement} form 表单
         * @return {Object} 键值对的对象
         */
	serializeToObject:function(form){
	    var array = $(form).serializeArray(),
	        result = {};
	    $.each(array,function(index,item){
	        var name = item.name;
	        if(!result[name]){ //如果是单个值，直接赋值
	            result[name] = item.value;
	        }else{ //多值使用数组
	            if(!$.isArray(result[name])){
	                result[name] = [result[name]];
	            }
	            result[name].push(item.value);
	        }
	    });
	    return result;
    },
        /**
          * 将表单数据序列化成对象
          * @return {Object} 表单元素的
          */
    serializeToArray:function(form){

	    return $(form).serializeArray();
	  },
    /**
     * 清空表单
     * @param  {HTMLElement} form 表单元素
     */
    clear : function(form){
        var elements = $.makeArray(form.elements);

        Utils.each(elements,function(element){
            if(element.type === 'checkbox' || element.type === 'radio' ){
                $(element).attr('checked',false);
            }else{
                $(element).val('');
            }
            $(element).change();
        });
    },

    /**
     * 是否为函数
     * @param  {*} fn 对象
     * @return {Boolean}  是否函数
     */
    isFunction : function(fn){
        return typeof(fn) === 'function';
    },
    /**
     * 是否数组
     * @method
     * @param  {*}  obj 是否数组
     * @return {Boolean}  是否数组
     */
    isArray : ('isArray' in Array) ? Array.isArray : function(value) {
        return toString.call(value) === '[object Array]';
    },
    /**
     * 是否日期
     * @param  {*}  value 对象
     * @return {Boolean}  是否日期
     */
    isDate: function(value) {
        return toString.call(value) === '[object Date]';
    },
    /**
     * 是否是javascript对象
     * @param {Object} value The value to test
     * @return {Boolean}
     * @method
     */
    isObject: (toString.call(null) === '[object Object]') ?
        function(value) {
            // check ownerDocument here as well to exclude DOM nodes
            return value !== null && value !== undefined && toString.call(value) === '[object Object]' && value.ownerDocument === undefined;
        } :
        function(value) {
            return toString.call(value) === '[object Object]';
        },
     /**
     * 是否是数字或者数字字符串
     * @param  {String}  value 数字字符串
     * @return {Boolean}  是否是数字或者数字字符串
     */
    isNumeric: function(value) {
        return !isNaN(parseFloat(value)) && isFinite(value);
    },
     /**
     * 拷贝对象
     * @param  {Object} obj 要拷贝的对象
     * @return {Object} 拷贝生成的对象
     */
    cloneObject : function(obj){
        var result = Utils.isArray(obj) ? [] : {};

        return Utils.mix(true,result,obj);
    },
    /**
     * 抛出错误
     */
    error : function(msg){
        if(Utils.debug){
            throw msg;
        }
    },
     /**
     * 生成唯一的Id
     * @method
     * @param {String} prefix 前缀
     * @default 'Utils-guid'
     * @return {String} 唯一的编号
     */
    guid : (function(){
        var map = {};
        return function(prefix){
            prefix = prefix || Utils.prefix + GUID_DEFAULT;
            if(!map[prefix]){
                map[prefix] = 1;
            }else{
                map[prefix] += 1;
            }
            return prefix + map[prefix];
        };
    })(),
   /**
     * 判断是否是字符串
     * @return {Boolean} 是否是字符串
     */
    isString : function(value){
        return typeof value === 'string';
    },

    /**
     * 判断是否数字，由于$.isNumberic方法会把 '123'认为数字
     * @return {Boolean} 是否数字
     */
    isNumber : function(value){
        return typeof value === 'number';
    },
    /**
     * 是否是布尔类型
     *
     * @param {Object} 测试的值
     * @return {Boolean}
     */
    isBoolean: function(value) {
        return typeof value === 'boolean';
    },
    /**
     * 控制台输出日志
     * @param  {Object} obj 输出的数据
     */
    log : function(obj){
        if(ZUI.debug && window.console && window.console.log){
            window.console.log(obj);
        }
    },
    /**
     * 将多个对象的属性复制到一个新的对象
     */
    merge : function(){
        var args = $.makeArray(arguments),
            first = args[0];
        if(Utils.isBoolean(first)){
            args.shift();
            args.unshift({});
            args.unshift(first);
        }else{
            args.unshift({});
        }

        return ZUI.mix.apply(null,args);

    },
    /**
     * 封装 jQuery.extend 方法，将多个对象的属性merge到第一个对象中
     * @return {Object}
     */
    mix : function(){
        return $.extend.apply(null,arguments);
    },
   
    /**
     * 替换字符串中的字段.
     * @param {String} str 模版字符串
     * @param {Object} o json data
     * @param {RegExp} [regexp] 匹配字符串的正则表达式
     */
    substitute: function (str, o, regexp) {
        if (!Utils.isString(str)
            || (!Utils.isObject(o)) && !Utils.isArray(o)) {
            return str;
        }

        return str.replace(regexp || /\\?\{([^{}]+)\}/g, function (match, name) {
            if (match.charAt(0) === '\\') {
                return match.slice(1);
            }
            return (o[name] === undefined) ? '' : o[name];
        });
    },
     /**
     * 解析模版tpl。当data未传入时返回编译结果函数；当某个template需要多次解析时，建议保存编译结果函数，然后调用此函数来得到结果。
     * 
     * @method $.parseTpl
     * @grammar $.parseTpl(str, data)  ⇒ string
     * @grammar $.parseTpl(str)  ⇒ Function
     * @param {String} str 模板
     * @param {Object} data 数据
     * @example var str = "<p><%=name%></p>",
     * obj = {name: 'ajean'};
     * console.log($.parseTpl(str, data)); // => <p>ajean</p>
     */
     parseTpl :function( str, data ) {
        var tmpl = 'var __p=[];' + 'with(obj||{}){__p.push(\'' +
                str.replace( /\\/g, '\\\\' )
                .replace( /'/g, '\\\'' )
                .replace( /<%=([\s\S]+?)%>/g, function( match, code ) {
                    return '\',' + code.replace( /\\'/, '\'' ) + ',\'';
                } )
                .replace( /<%([\s\S]+?)%>/g, function( match, code ) {
                    return '\');' + code.replace( /\\'/, '\'' )
                            .replace( /[\r\n\t]/g, ' ' ) + '__p.push(\'';
                } )
                .replace( /\r/g, '\\r' )
                .replace( /\n/g, '\\n' )
                .replace( /\t/g, '\\t' ) +
                '\');}return __p.join("");',

            /* jsbint evil:true */
            func = new Function( 'obj', tmpl );
        
        return data ? func( data ) : func;
    },
    /**
    *数据映射类
    *var obj={
    *        
    *        pageSize:1,
    *        limit:10,
    *        start:0,
    *        totalCount:null,
    *}
    *var map={
    *        pageSize:"pagesize",
    *        limit:"pagelimit",
    *        start:"pagestart",
    *        totalCount:"pageTotalCounts"
    *}
    **/
     dataMapResult:function(obj,map){
          if(!Utils.isObject(obj)||!Utils.isObject(map)) 
          return obj;
          var resultMap=$.extend(obj,{});
          for(var key in map){  
                resultMap[key]=map[key];
          }

          return resultMap;


     },
     /**
     * 使第一个字母变成大写
     * @param  {String} s 字符串
     * @return {String} 首字母大写后的字符串
     */
    ucfirst : function(s){
        s += '';
        return s.charAt(0).toUpperCase() + s.substring(1);
    },
     /**
     * 页面上的一点是否在用户的视图内
     * @param {Object} offset 坐标，left,top
     * @return {Boolean} 是否在视图内
     */
    isInView : function(offset){
        var left = offset.left,
            top = offset.top,
            viewWidth = Utils.viewportWidth(),
            wiewHeight = Utils.viewportHeight(),
            scrollTop = Utils.scrollTop(),
            scrollLeft = Utils.scrollLeft();
        //判断横坐标
        if(left < scrollLeft ||left > scrollLeft + viewWidth){
            return false;
        }
        //判断纵坐标
        if(top < scrollTop || top > scrollTop + wiewHeight){
            return false;
        }
        return true;
    },
    /**
     * 页面上的一点纵向坐标是否在用户的视图内
     * @param {Object} top  纵坐标
     * @return {Boolean} 是否在视图内
     */
    isInVerticalView : function(top){
        var wiewHeight = Utils.viewportHeight(),
            scrollTop = Utils.scrollTop();

        //判断纵坐标
        if(top < scrollTop || top > scrollTop + wiewHeight){
            return false;
        }
        return true;
    },
    /**
     * 页面上的一点横向坐标是否在用户的视图内
     * @param {Object} left 横坐标
     * @return {Boolean} 是否在视图内
     */
    isInHorizontalView : function(left){
        var viewWidth = Utils.viewportWidth(),
            scrollLeft = Utils.scrollLeft();
        //判断横坐标
        if(left < scrollLeft ||left > scrollLeft + viewWidth){
            return false;
        }
        return true;
    },
     /**
     * 获取窗口可视范围宽度
     * @return {Number} 可视区宽度
     */
    viewportWidth : function(){
        return $(window).width();
    },
    /**
     * 获取窗口可视范围高度
     * @return {Number} 可视区高度
     */
    viewportHeight:function(){
        return $(window).height();
    },
    /**
     * 滚动到窗口的left位置
     */
    scrollLeft : function(){
        return $(window).scrollLeft();
    },
    /**
     * 滚动到横向位置
     */
    scrollTop : function(){
        return $(window).scrollTop();
    },
    /**
     * 窗口宽度
     * @return {Number} 窗口宽度
     */
    docWidth : function(){
        return Math.max(this.viewportWidth(), $(document).width());
    },
    /**
     * 窗口高度
     * @return {Number} 窗口高度
     */
    docHeight : function(){
        return Math.max(this.viewportHeight(), $(document).height());
    },
    /**
     * 遍历数组或者对象
     * @param {Object|Array} element/Object 数组中的元素或者对象的值
     * @param {Function} func 遍历的函数 function(elememt,index){} 或者 function(value,key){}
     */
    each : function (elements,func) {
        if(!elements){
            return;
        }
        $.each(elements,function(k,v){
            return func(v,k);
        });
    }


  };


 return Utils;



});
define("zui/base/array",['zui/base/utils'],function(require, exports, module) {

	var Utils=require('zui/base/utils');
  /**
   * @class ZUI.Array
   * 数组帮助类
   */
  var ArrayUtil ={
    /**
     * 返回数组的最后一个对象
     * @param {Array} array 数组或者类似于数组的对象.
     * @return {*} 数组的最后一项.
     */
    peek : function(array) {
      return array[array.length - 1];
    },
    /**
     * 查找记录所在的位置
     * @param  {*} value 值
     * @param  {Array} array 数组或者类似于数组的对象
     * @param  {Number} [fromIndex=0] 起始项，默认为0
     * @return {Number} 位置，如果为 -1则不在数组内
     */
    indexOf : function(value, array,opt_fromIndex){
       var fromIndex = opt_fromIndex == null ?
          0 : (opt_fromIndex < 0 ?
               Math.max(0, array.length + opt_fromIndex) : opt_fromIndex);

      for (var i = fromIndex; i < array.length; i++) {
        if (i in array && array[i] === value)
          return i;
      }
      return -1;
    },
    /**
     * 数组是否存在指定值
     * @param  {*} value 值
     * @param  {Array} array 数组或者类似于数组的对象
     * @return {Boolean} 是否存在于数组中
     */
    contains : function(value,array){
      return ArrayUtil.indexOf(value,array) >=0;
    },
    /**
     * 遍历数组或者对象
     * @method 
     * @param {Object|Array} element/Object 数组中的元素或者对象的值 
     * @param {Function} func 遍历的函数 function(elememt,index){} 或者 function(value,key){}
     */
    each :Utils.each,
    /**
     * 2个数组内部的值是否相等
     * @param  {Array} a1 数组1
     * @param  {Array} a2 数组2
     * @return {Boolean} 2个数组相等或者内部元素是否相等
     */
    equals : function(a1,a2){
      if(a1 == a2){
        return true;
      }
      if(!a1 || !a2){
        return false;
      }

      if(a1.length != a2.length){
        return false;
      }
      var rst = true;
      for(var i = 0 ;i < a1.length; i++){
        if(a1[i] !== a2[i]){
          rst = false;
          break;
        }
      }
      return rst;
    },

    /**
     * 过滤数组
     * @param {Object|Array} element/Object 数组中的元素或者对象的值 
     * @param {Function} func 遍历的函数 function(elememt,index){} 或者 function(value,key){},如果返回true则添加到结果集
     * @return {Array} 过滤的结果集
     */
    filter : function(array,func){
      var result = [];
      ArrayUtil.each(array,function(value,index){
        if(func(value,index)){
          result.push(value);
        }
      });
      return result;
    },
    /**
     * 转换数组数组
     * @param {Object|Array} element/Object 数组中的元素或者对象的值 
     * @param {Function} func 遍历的函数 function(elememt,index){} 或者 function(value,key){},将返回的结果添加到结果集
     * @return {Array} 过滤的结果集
     */
    map : function(array,func){
      var result = [];
      ArrayUtil.each(array,function(value,index){
        result.push(func(value,index));
      });
      return result;
    },
    /**
     * 获取第一个符合条件的数据
     * @param  {Array} array 数组
     * @param  {Function} func  匹配函数
     * @return {*}  符合条件的数据
     */
    find : function(array,func){
      var i = ArrayUtil.findIndex(array, func);
      return i < 0 ? null : array[i];
    },
    /**
     * 获取第一个符合条件的数据的索引值
    * @param  {Array} array 数组
     * @param  {Function} func  匹配函数
     * @return {Number} 符合条件的数据的索引值
     */
    findIndex : function(array,func){
      var result = -1;
      ArrayUtil.each(array,function(value,index){
        if(func(value,index)){
          result = index;
          return false;
        }
      });
      return result;
    },
    /**
     * 数组是否为空
     * @param  {Array}  array 数组
     * @return {Boolean}  是否为空
     */
    isEmpty : function(array){
      return array.length == 0;
    },
    /**
     * 插入数组
     * @param  {Array} array 数组
     * @param  {Number} index 位置
     * @param {*} value 插入的数据
     */
    add : function(array,value){
      array.push(value);
    },
    /**
     * 将数据插入数组指定的位置
     * @param  {Array} array 数组
     * @param {*} value 插入的数据
     * @param  {Number} index 位置
     */
    addAt : function(array,value,index){
      ArrayUtil.splice(array, index, 0, value);
    },
    /**
     * 清空数组
     * @param  {Array} array 数组
     * @return {Array}  清空后的数组
     */
    empty : function(array){
      if(!(array instanceof(Array))){
        for (var i = array.length - 1; i >= 0; i--) {
          delete array[i];
        }
      }
      array.length = 0;
    },
    /**
     * 移除记录
     * @param  {Array} array 数组
     * @param  {*} value 记录
     * @return {Boolean}   是否移除成功
     */
    remove : function(array,value){
      var i = ArrayUtil.indexOf(value, array);
      var rv;
      if ((rv = i >= 0)) {
        ArrayUtil.removeAt(array, i);
      }
      return rv;
    },
    /**
     * 移除指定位置的记录
     * @param  {Array} array 数组
     * @param  {Number} index 索引值
     * @return {Boolean}   是否移除成功
     */
    removeAt : function(array,index){
      return ArrayUtil.splice(array, index, 1).length == 1;
    },
    /**
     * @private
     */
    slice : function(arr, start, opt_end){
      if (arguments.length <= 2) {
        return Array.prototype.slice.call(arr, start);
      } else {
        return Array.prototype.slice.call(arr, start, opt_end);
      }
    },
    /**
     * @private
     */
    splice : function(arr, index, howMany, var_args){
      return Array.prototype.splice.apply(arr, ArrayUtil.slice(arguments, 1))
    }

  };
  return ArrayUtil;
});



define('zui/base/date', ['zui/base/utils'],function(require, exports, module) {

    var ZUtils=require("zui/base/utils");

    var dateRegex = /^(?:(?!0000)[0-9]{4}([-/.]+)(?:(?:0?[1-9]|1[0-2])\1(?:0?[1-9]|1[0-9]|2[0-8])|(?:0?[13-9]|1[0-2])\1(?:29|30)|(?:0?[13578]|1[02])\1(?:31))|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)([-/.]?)0?2\2(?:29))(\s+([01]|([01][0-9]|2[0-3])):([0-9]|[0-5][0-9]):([0-9]|[0-5][0-9]))?$/;

    function dateParse(val, format) {
		if(val instanceof Date){
			return val;
		}
		if (typeof(format)=="undefined" || format==null || format=="") {
			var checkList=new Array('y-m-d','yyyy-mm-dd','yyyy-mm-dd HH:MM:ss','H:M:s');
			for (var i=0; i<checkList.length; i++) {
					var d=dateParse(val,checkList[i]);
					if (d!=null) { 
						return d; 
					}
			}
			return null;
		};
        val = val + "";
        var i_val = 0;
        var i_format = 0;
        var c = "";
        var token = "";
        var x, y;
        var now = new Date();
        var year = now.getYear();
        var month = now.getMonth() + 1;
        var date = 1;
        var hh = 00;
        var mm = 00;
        var ss = 00;
        this.isInteger = function(val) {
            return /^\d*$/.test(val);
		};
		this.getInt = function(str,i,minlength,maxlength) {
			for (var x=maxlength; x>=minlength; x--) {
				var token=str.substring(i,i+x);
				if (token.length < minlength) { 
					return null; 
				}
				if (this.isInteger(token)) { 
					return token; 
				}
			}
		return null;
		};

        while (i_format < format.length) {
            c = format.charAt(i_format);
            token = "";
            while ((format.charAt(i_format) == c) && (i_format < format.length)) {
                token += format.charAt(i_format++);
            }
            if (token=="yyyy" || token=="yy" || token=="y") {
				if (token=="yyyy") { 
					x=4;y=4; 
				}
				if (token=="yy") { 
					x=2;y=2; 
				}
				if (token=="y") { 
					x=2;y=4; 
				}
				year=this.getInt(val,i_val,x,y);
				if (year==null) { 
					return null; 
				}
				i_val += year.length;
				if (year.length==2) {
                    year = year>70?1900+(year-0):2000+(year-0);
				}
			}
            else if (token=="mm"||token=="m") {
				month=this.getInt(val,i_val,token.length,2);
				if(month==null||(month<1)||(month>12)){
					return null;
				}
				i_val+=month.length;
			}
			else if (token=="dd"||token=="d") {
				date=this.getInt(val,i_val,token.length,2);
				if(date==null||(date<1)||(date>31)){
					return null;
				}
				i_val+=date.length;
			}
			else if (token=="hh"||token=="h") {
				hh=this.getInt(val,i_val,token.length,2);
				if(hh==null||(hh<1)||(hh>12)){
					return null;
				}
				i_val+=hh.length;
			}
			else if (token=="HH"||token=="H") {
				hh=this.getInt(val,i_val,token.length,2);
				if(hh==null||(hh<0)||(hh>23)){
					return null;
				}
				i_val+=hh.length;
			}
			else if (token=="MM"||token=="M") {
				mm=this.getInt(val,i_val,token.length,2);
				if(mm==null||(mm<0)||(mm>59)){
					return null;
				}
				i_val+=mm.length;
			}
			else if (token=="ss"||token=="s") {
				ss=this.getInt(val,i_val,token.length,2);
				if(ss==null||(ss<0)||(ss>59)){
					return null;
				}
				i_val+=ss.length;
			}
			else {
				if (val.substring(i_val,i_val+token.length)!=token) {
					return null;
				}
				else {
					i_val+=token.length;
				}
			}
		}
		if (i_val != val.length) { 
			return null; 
		}
		if (month==2) {
			if ( ( (year%4==0)&&(year%100 != 0) ) || (year%400==0) ) { // leap year
				if (date > 29){ 
					return null; 
				}
			}
			else { 
				if (date > 28) { 
					return null; 
				} 
			}
		}
		if ((month==4)||(month==6)||(month==9)||(month==11)) {
			if (date > 30) { 
				return null; 
			}
		}
		return new Date(year,month-1,date,hh,mm,ss);
    }

    function DateAdd(strInterval, NumDay, dtDate) {
        var dtTmp = new Date(dtDate);
        if (isNaN(dtTmp)) {
            dtTmp = new Date();
        }
        NumDay = parseInt(NumDay,10);
        switch (strInterval) {
            case   's':
                dtTmp = new Date(dtTmp.getTime() + (1000 * NumDay));
                break;
            case   'n':
                dtTmp = new Date(dtTmp.getTime() + (60000 * NumDay));
                break;
            case   'h':
                dtTmp = new Date(dtTmp.getTime() + (3600000 * NumDay));
                break;
            case   'd':
                dtTmp = new Date(dtTmp.getTime() + (86400000 * NumDay));
                break;
            case   'w':
                dtTmp = new Date(dtTmp.getTime() + ((86400000 * 7) * NumDay));
                break;
            case   'm':
                dtTmp = new Date(dtTmp.getFullYear(), (dtTmp.getMonth()) + NumDay, dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds());
                break;
            case   'y':
                //alert(dtTmp.getFullYear());
                dtTmp = new Date(dtTmp.getFullYear() + NumDay, dtTmp.getMonth(), dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds());
                //alert(dtTmp);
                break;
        }
        return dtTmp;
    }

    var dateFormat = function () {
        var token = /w{1}|d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
            timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
            timezoneClip = /[^-+\dA-Z]/g,
            pad = function (val, len) {
                val = String(val);
                len = len || 2;
                while (val.length < len) {
                    val = '0' + val;
                }
                return val;
            },
            // Some common format strings
            masks = {
                'default':'ddd mmm dd yyyy HH:MM:ss',
                shortDate:'m/d/yy',
                //mediumDate:     'mmm d, yyyy',
                longDate:'mmmm d, yyyy',
                fullDate:'dddd, mmmm d, yyyy',
                shortTime:'h:MM TT',
                //mediumTime:     'h:MM:ss TT',
                longTime:'h:MM:ss TT Z',
                isoDate:'yyyy-mm-dd',
                isoTime:'HH:MM:ss',
                isoDateTime:"yyyy-mm-dd'T'HH:MM:ss",
                isoUTCDateTime:"UTC:yyyy-mm-dd'T'HH:MM:ss'Z'",

                //added by jayli
                localShortDate:'yy年mm月dd日',
                localShortDateTime:'yy年mm月dd日 hh:MM:ss TT',
                localLongDate:'yyyy年mm月dd日',
                localLongDateTime:'yyyy年mm月dd日 hh:MM:ss TT',
                localFullDate:'yyyy年mm月dd日 w',
                localFullDateTime:'yyyy年mm月dd日 w hh:MM:ss TT'

            },

            // Internationalization strings
            i18n = {
                dayNames:[
                    'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat',
                    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
                    '星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'
                ],
                monthNames:[
                    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
                    'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
                ]
            };

        // Regexes and supporting functions are cached through closure
        return function (date, mask, utc) {

            // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
            if (arguments.length === 1 && Object.prototype.toString.call(date) === '[object String]' && !/\d/.test(date)) {
                mask = date;
                date = undefined;
            }

            // Passing date through Date applies Date.parse, if necessary
            date = date ? new Date(date) : new Date();
            if (isNaN(date)) {
                throw SyntaxError('invalid date');
            }

            mask = String(masks[mask] || mask || masks['default']);

            // Allow setting the utc argument via the mask
            if (mask.slice(0, 4) === 'UTC:') {
                mask = mask.slice(4);
                utc = true;
            }

            var _ = utc ? 'getUTC' : 'get',
                d = date[_ + 'Date'](),
                D = date[_ + 'Day'](),
                m = date[_ + 'Month'](),
                y = date[_ + 'FullYear'](),
                H = date[_ + 'Hours'](),
                M = date[_ + 'Minutes'](),
                s = date[_ + 'Seconds'](),
                L = date[_ + 'Milliseconds'](),
                o = utc ? 0 : date.getTimezoneOffset(),
                flags = {
                    d:d,
                    dd:pad(d, undefined),
                    ddd:i18n.dayNames[D],
                    dddd:i18n.dayNames[D + 7],
                    w:i18n.dayNames[D + 14],
                    m:m + 1,
                    mm:pad(m + 1, undefined),
                    mmm:i18n.monthNames[m],
                    mmmm:i18n.monthNames[m + 12],
                    yy:String(y).slice(2),
                    yyyy:y,
                    h:H % 12 || 12,
                    hh:pad(H % 12 || 12, undefined),
                    H:H,
                    HH:pad(H, undefined),
                    M:M,
                    MM:pad(M, undefined),
                    s:s,
                    ss:pad(s, undefined),
                    l:pad(L, 3),
                    L:pad(L > 99 ? Math.round(L / 10) : L, undefined),
                    t:H < 12 ? 'a' : 'p',
                    tt:H < 12 ? 'am' : 'pm',
                    T:H < 12 ? 'A' : 'P',
                    TT:H < 12 ? 'AM' : 'PM',
                    Z:utc ? 'UTC' : (String(date).match(timezone) || ['']).pop().replace(timezoneClip, ''),
                    o:(o > 0 ? '-' : '+') + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                    S:['th', 'st', 'nd', 'rd'][d % 10 > 3 ? 0 : (d % 100 - d % 10 !== 10) * d % 10]
                };

            return mask.replace(token, function ($0) {
                return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
            });
        };
    }();

    /**
     * 日期的工具方法
     * @class BUI.Date
     */
    var DateUtil = {
        /**
         * 日期加法
         * @param {String} strInterval 加法的类型，s(秒),n(分),h(时),d(天),w(周),m(月),y(年)
         * @param {Number} Num         数量，如果为负数，则为减法
         * @param {Date} dtDate      起始日期，默认为此时
         */
        add: function (strInterval, Num, dtDate) {
            return DateAdd(strInterval, Num, dtDate);
        },
        /**
         * 小时的加法
         * @param {Number} hours 小时
         * @param {Date} date 起始日期
         */
        addHour: function (hours, date) {
            return DateAdd('h', hours, date);
        },
        /**
         * 分的加法
         * @param {Number} minutes 分
         * @param {Date} date 起始日期
         */
        addMinute: function (minutes, date) {
            return DateAdd('n', minutes, date);
        },
        /**
         * 秒的加法
         * @param {Number} seconds 秒
         * @param {Date} date 起始日期
         */
        addSecond: function (seconds, date) {
            return DateAdd('s', seconds, date);
        },
        /**
         * 天的加法
         * @param {Number} days 天数
         * @param {Date} date 起始日期
         */
        addDay: function (days, date) {
            return DateAdd('d', days, date);
        },
        /**
         * 增加周
         * @param {Number} weeks 周数
         * @param {Date} date  起始日期
         */
        addWeek: function (weeks, date) {
            return DateAdd('w', weeks, date);
        },
        /**
         * 增加月
         * @param {Number} months 月数
         * @param {Date} date  起始日期
         */
        addMonths: function (months, date) {
            return DateAdd('m', months, date);
        },
        /**
         * 增加年
         * @param {Number} years 年数
         * @param {Date} date  起始日期
         */
        addYear: function (years, date) {
            return DateAdd('y', years, date);
        },
        /**
         * 日期是否相等，忽略时间
         * @param  {Date}  d1 日期对象
         * @param  {Date}  d2 日期对象
         * @return {Boolean}    是否相等
         */
        isDateEquals: function (d1, d2) {

            return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
        },
        /**
         * 日期时间是否相等，包含时间
         * @param  {Date}  d1 日期对象
         * @param  {Date}  d2 日期对象
         * @return {Boolean}    是否相等
         */
        isEquals: function (d1, d2) {
            if (d1 == d2) {
                return true;
            }
            if (!d1 || !d2) {
                return false;
            }
            if (!d1.getTime || !d2.getTime) {
                return false;
            }
            return d1.getTime() == d2.getTime();
        },
        /**
         * 字符串是否是有效的日期类型
         * @param {String} str 字符串
         * @return 字符串是否能转换成日期
         */
        isDateString: function (str) {
            return dateRegex.test(str);
        },
        /**
         * 将日期格式化成字符串
         * @param  {Date} date 日期
         * @param  {String} mask 格式化方式
         * @param  {Date} utc  是否utc时间
         * @return {String}      日期的字符串
         */
        format: function (date, mask, utc) {
            return dateFormat(date, mask, utc);
        },
        /**
         * 转换成日期
         * @param  {String|Date} date 字符串或者日期
         * @param  {String} dateMask  日期的格式,如:yyyy-MM-dd
         * @return {Date}      日期对象
         */
        parse: function (date, s) {
            if(ZUtils.isString(date)){
                date = date.replace('\/','-');
            }
            return dateParse(date, s);
        },
        /**
         * 当前天
         * @return {Date} 当前天 00:00:00
         */
        today: function () {
            var now = new Date();
            return new Date(now.getFullYear(), now.getMonth(), now.getDate());
        },
        /**
         * 返回当前日期
         * @return {Date} 日期的 00:00:00
         */
        getDate: function (date) {
            return new Date(date.getFullYear(), date.getMonth(), date.getDate());
        },
        /**
         * 计算两个日期相隔天数
         * @return {Date} 日期的 00:00:00
         */
        getDayDiff: function (date1,date2) {
            var iDays;
            iDays = parseInt(Math.abs(DateUtil.parse(date1) -DateUtil.parse(date2))/1000/60/60/24);
            return iDays;
        }
    };


  

    return DateUtil;
});
define('zui/base/json',function(require, exports, module) {

  var win = window,
    JSON = win.JSON;

  function f(n) {
      // Format integers to have at least two digits.
      return n < 10 ? '0' + n : n;
  }

  if (typeof Date.prototype.toJSON !== 'function') {

      Date.prototype.toJSON = function (key) {

          return isFinite(this.valueOf()) ?
              this.getUTCFullYear() + '-' +
                  f(this.getUTCMonth() + 1) + '-' +
                  f(this.getUTCDate()) + 'T' +
                  f(this.getUTCHours()) + ':' +
                  f(this.getUTCMinutes()) + ':' +
                  f(this.getUTCSeconds()) + 'Z' : null;
      };

      String.prototype.toJSON =
          Number.prototype.toJSON =
              Boolean.prototype.toJSON = function (key) {
                  return this.valueOf();
              };
  }


  var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
    escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
    gap,
    indent,
    meta = {    // table of character substitutions
        '\b': '\\b',
        '\t': '\\t',
        '\n': '\\n',
        '\f': '\\f',
        '\r': '\\r',
        '"' : '\\"',
        '\\': '\\\\'
    },
    rep;

    function quote(string) {

      // If the string contains no control characters, no quote characters, and no
      // backslash characters, then we can safely slap some quotes around it.
      // Otherwise we must also replace the offending characters with safe escape
      // sequences.

      escapable['lastIndex'] = 0;
      return escapable.test(string) ?
          '"' + string.replace(escapable, function (a) {
              var c = meta[a];
              return typeof c === 'string' ? c :
                  '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
          }) + '"' :
          '"' + string + '"';
    }

    function str(key, holder) {

      // Produce a string from holder[key].

      var i,          // The loop counter.
          k,          // The member key.
          v,          // The member value.
          length,
          mind = gap,
          partial,
          value = holder[key];

      // If the value has a toJSON method, call it to obtain a replacement value.

      if (value && typeof value === 'object' &&
          typeof value.toJSON === 'function') {
          value = value.toJSON(key);
      }

      // If we were called with a replacer function, then call the replacer to
      // obtain a replacement value.

      if (typeof rep === 'function') {
          value = rep.call(holder, key, value);
      }

      // What happens next depends on the value's type.

      switch (typeof value) {
          case 'string':
              return quote(value);

          case 'number':

      // JSON numbers must be finite. Encode non-finite numbers as null.

              return isFinite(value) ? String(value) : 'null';

          case 'boolean':
          case 'null':

      // If the value is a boolean or null, convert it to a string. Note:
      // typeof null does not produce 'null'. The case is included here in
      // the remote chance that this gets fixed someday.

              return String(value);

      // If the type is 'object', we might be dealing with an object or an array or
      // null.

          case 'object':

      // Due to a specification blunder in ECMAScript, typeof null is 'object',
      // so watch out for that case.

              if (!value) {
                  return 'null';
              }

      // Make an array to hold the partial results of stringifying this object value.

              gap += indent;
              partial = [];

      // Is the value an array?

              if (Object.prototype.toString.apply(value) === '[object Array]') {

      // The value is an array. Stringify every element. Use null as a placeholder
      // for non-JSON values.

                  length = value.length;
                  for (i = 0; i < length; i += 1) {
                      partial[i] = str(i, value) || 'null';
                  }

      // Join all of the elements together, separated with commas, and wrap them in
      // brackets.

                  v = partial.length === 0 ? '[]' :
                      gap ? '[\n' + gap +
                          partial.join(',\n' + gap) + '\n' +
                          mind + ']' :
                          '[' + partial.join(',') + ']';
                  gap = mind;
                  return v;
              }

      // If the replacer is an array, use it to select the members to be stringified.

              if (rep && typeof rep === 'object') {
                  length = rep.length;
                  for (i = 0; i < length; i += 1) {
                      k = rep[i];
                      if (typeof k === 'string') {
                          v = str(k, value);
                          if (v) {
                              partial.push(quote(k) + (gap ? ': ' : ':') + v);
                          }
                      }
                  }
              } else {

      // Otherwise, iterate through all of the keys in the object.

                  for (k in value) {
                      if (Object.hasOwnProperty.call(value, k)) {
                          v = str(k, value);
                          if (v) {
                              partial.push(quote(k) + (gap ? ': ' : ':') + v);
                          }
                      }
                  }
              }

      // Join all of the member texts together, separated with commas,
      // and wrap them in braces.

              v = partial.length === 0 ? '{}' :
                  gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                      mind + '}' : '{' + partial.join(',') + '}';
              gap = mind;
              return v;
      }
  }

  if (typeof JSON.stringify !== 'function') {
    JSON.stringify = function (value, replacer, space) {

      // The stringify method takes a value and an optional replacer, and an optional
      // space parameter, and returns a JSON text. The replacer can be a function
      // that can replace values, or an array of strings that will select the keys.
      // A default replacer method can be provided. Use of the space parameter can
      // produce text that is more easily readable.

      var i;
      gap = '';
      indent = '';

      // If the space parameter is a number, make an indent string containing that
      // many spaces.

      if (typeof space === 'number') {
          for (i = 0; i < space; i += 1) {
              indent += ' ';
          }

      // If the space parameter is a string, it will be used as the indent string.

      } else if (typeof space === 'string') {
          indent = space;
      }

      // If there is a replacer, it must be a function or an array.
      // Otherwise, throw an error.

      rep = replacer;
      if (replacer && typeof replacer !== 'function' &&
          (typeof replacer !== 'object' ||
              typeof replacer.length !== 'number')) {
          throw new Error('JSON.stringify');
      }

      // Make a fake root object containing our value under the key of ''.
      // Return the result of stringifying the value.

      return str('', {'': value});
      };
    }

  function looseParse(data){
    try{
      return (new Function("return " + data))();
    }catch(e){
      throw 'Json parse error!';
    }
  }
 /**
  * JSON 格式化
  * @class BUI.JSON
  * @singleton
  */
  var JSON = {
    /**
     * 转成json 等同于$.parseJSON
     * @method
     * @param {String} jsonstring 合法的json 字符串
     */
    parse : $.parseJSON,
    /**
     * 业务中有些字符串组成的json数据不是严格的json数据，如使用单引号，或者属性名不是字符串
     * 如 ： {a:'abc'}
     * @method 
     * @param {String} jsonstring
     */
    looseParse : looseParse,
    /**
     * 将Json转成字符串
     * @method 
     * @param {Object} json json 对象
     */
    stringify : JSON.stringify
   
  }

 

  return JSON;
});