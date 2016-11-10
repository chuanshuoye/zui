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