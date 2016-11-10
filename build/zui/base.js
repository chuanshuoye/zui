/*! weixin-ui 2015-06-02 */
/* author:zhanwangye */
define("zui/base",["zui/base/utils","zui/base/array","zui/base/json","zui/base/date"],function(a){var b=a("zui/base/utils"),c=a("zui/base/array"),d=a("zui/base/json"),e=a("zui/base/date");return{Utils:b,Array:c,JSON:d,Date:e}}),define("zui/base/utils",function(){var a={serializeToObject:function(a){var b=$(a).serializeArray(),c={};return $.each(b,function(a,b){var d=b.name;c[d]?($.isArray(c[d])||(c[d]=[c[d]]),c[d].push(b.value)):c[d]=b.value}),c},serializeToArray:function(a){return $(a).serializeArray()},clear:function(b){var c=$.makeArray(b.elements);a.each(c,function(a){"checkbox"===a.type||"radio"===a.type?$(a).attr("checked",!1):$(a).val(""),$(a).change()})},isFunction:function(a){return"function"==typeof a},isArray:"isArray"in Array?Array.isArray:function(a){return"[object Array]"===toString.call(a)},isDate:function(a){return"[object Date]"===toString.call(a)},isObject:"[object Object]"===toString.call(null)?function(a){return null!==a&&void 0!==a&&"[object Object]"===toString.call(a)&&void 0===a.ownerDocument}:function(a){return"[object Object]"===toString.call(a)},isNumeric:function(a){return!isNaN(parseFloat(a))&&isFinite(a)},cloneObject:function(b){var c=a.isArray(b)?[]:{};return a.mix(!0,c,b)},error:function(b){if(a.debug)throw b},guid:function(){var b={};return function(c){return c=c||a.prefix+GUID_DEFAULT,b[c]?b[c]+=1:b[c]=1,c+b[c]}}(),isString:function(a){return"string"==typeof a},isNumber:function(a){return"number"==typeof a},isBoolean:function(a){return"boolean"==typeof a},log:function(a){ZUI.debug&&window.console&&window.console.log&&window.console.log(a)},merge:function(){var b=$.makeArray(arguments),c=b[0];return a.isBoolean(c)?(b.shift(),b.unshift({}),b.unshift(c)):b.unshift({}),ZUI.mix.apply(null,b)},mix:function(){return $.extend.apply(null,arguments)},substitute:function(b,c,d){return a.isString(b)&&(a.isObject(c)||a.isArray(c))?b.replace(d||/\\?\{([^{}]+)\}/g,function(a,b){return"\\"===a.charAt(0)?a.slice(1):void 0===c[b]?"":c[b]}):b},parseTpl:function(a,b){var c="var __p=[];with(obj||{}){__p.push('"+a.replace(/\\/g,"\\\\").replace(/'/g,"\\'").replace(/<%=([\s\S]+?)%>/g,function(a,b){return"',"+b.replace(/\\'/,"'")+",'"}).replace(/<%([\s\S]+?)%>/g,function(a,b){return"');"+b.replace(/\\'/,"'").replace(/[\r\n\t]/g," ")+"__p.push('"}).replace(/\r/g,"\\r").replace(/\n/g,"\\n").replace(/\t/g,"\\t")+'\');}return __p.join("");',d=new Function("obj",c);return b?d(b):d},dataMapResult:function(b,c){if(!a.isObject(b)||!a.isObject(c))return b;var d=$.extend(b,{});for(var e in c)d[e]=c[e];return d},ucfirst:function(a){return a+="",a.charAt(0).toUpperCase()+a.substring(1)},isInView:function(b){var c=b.left,d=b.top,e=a.viewportWidth(),f=a.viewportHeight(),g=a.scrollTop(),h=a.scrollLeft();return h>c||c>h+e?!1:g>d||d>g+f?!1:!0},isInVerticalView:function(b){var c=a.viewportHeight(),d=a.scrollTop();return d>b||b>d+c?!1:!0},isInHorizontalView:function(b){var c=a.viewportWidth(),d=a.scrollLeft();return d>b||b>d+c?!1:!0},viewportWidth:function(){return $(window).width()},viewportHeight:function(){return $(window).height()},scrollLeft:function(){return $(window).scrollLeft()},scrollTop:function(){return $(window).scrollTop()},docWidth:function(){return Math.max(this.viewportWidth(),$(document).width())},docHeight:function(){return Math.max(this.viewportHeight(),$(document).height())},each:function(a,b){a&&$.each(a,function(a,c){return b(c,a)})}};return a}),define("zui/base/array",["zui/base/utils"],function(a){var b=a("zui/base/utils"),c={peek:function(a){return a[a.length-1]},indexOf:function(a,b,c){for(var d=null==c?0:0>c?Math.max(0,b.length+c):c,e=d;e<b.length;e++)if(e in b&&b[e]===a)return e;return-1},contains:function(a,b){return c.indexOf(a,b)>=0},each:b.each,equals:function(a,b){if(a==b)return!0;if(!a||!b)return!1;if(a.length!=b.length)return!1;for(var c=!0,d=0;d<a.length;d++)if(a[d]!==b[d]){c=!1;break}return c},filter:function(a,b){var d=[];return c.each(a,function(a,c){b(a,c)&&d.push(a)}),d},map:function(a,b){var d=[];return c.each(a,function(a,c){d.push(b(a,c))}),d},find:function(a,b){var d=c.findIndex(a,b);return 0>d?null:a[d]},findIndex:function(a,b){var d=-1;return c.each(a,function(a,c){return b(a,c)?(d=c,!1):void 0}),d},isEmpty:function(a){return 0==a.length},add:function(a,b){a.push(b)},addAt:function(a,b,d){c.splice(a,d,0,b)},empty:function(a){if(!(a instanceof Array))for(var b=a.length-1;b>=0;b--)delete a[b];a.length=0},remove:function(a,b){var d,e=c.indexOf(b,a);return(d=e>=0)&&c.removeAt(a,e),d},removeAt:function(a,b){return 1==c.splice(a,b,1).length},slice:function(a,b,c){return arguments.length<=2?Array.prototype.slice.call(a,b):Array.prototype.slice.call(a,b,c)},splice:function(a){return Array.prototype.splice.apply(a,c.slice(arguments,1))}};return c}),define("zui/base/date",["zui/base/utils"],function(a){function b(a,c){if(a instanceof Date)return a;if("undefined"==typeof c||null==c||""==c){for(var d=new Array("y-m-d","yyyy-mm-dd","yyyy-mm-dd HH:MM:ss","H:M:s"),e=0;e<d.length;e++){var f=b(a,d[e]);if(null!=f)return f}return null}a+="";var g,h,i=0,j=0,k="",l="",m=new Date,n=m.getYear(),o=m.getMonth()+1,p=1,q=0,r=0,s=0;for(this.isInteger=function(a){return/^\d*$/.test(a)},this.getInt=function(a,b,c,d){for(var e=d;e>=c;e--){var f=a.substring(b,b+e);if(f.length<c)return null;if(this.isInteger(f))return f}return null};j<c.length;){for(k=c.charAt(j),l="";c.charAt(j)==k&&j<c.length;)l+=c.charAt(j++);if("yyyy"==l||"yy"==l||"y"==l){if("yyyy"==l&&(g=4,h=4),"yy"==l&&(g=2,h=2),"y"==l&&(g=2,h=4),n=this.getInt(a,i,g,h),null==n)return null;i+=n.length,2==n.length&&(n=n>70?1900+(n-0):2e3+(n-0))}else if("mm"==l||"m"==l){if(o=this.getInt(a,i,l.length,2),null==o||1>o||o>12)return null;i+=o.length}else if("dd"==l||"d"==l){if(p=this.getInt(a,i,l.length,2),null==p||1>p||p>31)return null;i+=p.length}else if("hh"==l||"h"==l){if(q=this.getInt(a,i,l.length,2),null==q||1>q||q>12)return null;i+=q.length}else if("HH"==l||"H"==l){if(q=this.getInt(a,i,l.length,2),null==q||0>q||q>23)return null;i+=q.length}else if("MM"==l||"M"==l){if(r=this.getInt(a,i,l.length,2),null==r||0>r||r>59)return null;i+=r.length}else if("ss"==l||"s"==l){if(s=this.getInt(a,i,l.length,2),null==s||0>s||s>59)return null;i+=s.length}else{if(a.substring(i,i+l.length)!=l)return null;i+=l.length}}if(i!=a.length)return null;if(2==o)if(n%4==0&&n%100!=0||n%400==0){if(p>29)return null}else if(p>28)return null;return(4==o||6==o||9==o||11==o)&&p>30?null:new Date(n,o-1,p,q,r,s)}function c(a,b,c){var d=new Date(c);switch(isNaN(d)&&(d=new Date),b=parseInt(b,10),a){case"s":d=new Date(d.getTime()+1e3*b);break;case"n":d=new Date(d.getTime()+6e4*b);break;case"h":d=new Date(d.getTime()+36e5*b);break;case"d":d=new Date(d.getTime()+864e5*b);break;case"w":d=new Date(d.getTime()+6048e5*b);break;case"m":d=new Date(d.getFullYear(),d.getMonth()+b,d.getDate(),d.getHours(),d.getMinutes(),d.getSeconds());break;case"y":d=new Date(d.getFullYear()+b,d.getMonth(),d.getDate(),d.getHours(),d.getMinutes(),d.getSeconds())}return d}var d=a("zui/base/utils"),e=/^(?:(?!0000)[0-9]{4}([-/.]+)(?:(?:0?[1-9]|1[0-2])\1(?:0?[1-9]|1[0-9]|2[0-8])|(?:0?[13-9]|1[0-2])\1(?:29|30)|(?:0?[13578]|1[02])\1(?:31))|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)([-/.]?)0?2\2(?:29))(\s+([01]|([01][0-9]|2[0-3])):([0-9]|[0-5][0-9]):([0-9]|[0-5][0-9]))?$/,f=function(){var a=/w{1}|d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,b=/\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,c=/[^-+\dA-Z]/g,d=function(a,b){for(a=String(a),b=b||2;a.length<b;)a="0"+a;return a},e={"default":"ddd mmm dd yyyy HH:MM:ss",shortDate:"m/d/yy",longDate:"mmmm d, yyyy",fullDate:"dddd, mmmm d, yyyy",shortTime:"h:MM TT",longTime:"h:MM:ss TT Z",isoDate:"yyyy-mm-dd",isoTime:"HH:MM:ss",isoDateTime:"yyyy-mm-dd'T'HH:MM:ss",isoUTCDateTime:"UTC:yyyy-mm-dd'T'HH:MM:ss'Z'",localShortDate:"yy年mm月dd日",localShortDateTime:"yy年mm月dd日 hh:MM:ss TT",localLongDate:"yyyy年mm月dd日",localLongDateTime:"yyyy年mm月dd日 hh:MM:ss TT",localFullDate:"yyyy年mm月dd日 w",localFullDateTime:"yyyy年mm月dd日 w hh:MM:ss TT"},f={dayNames:["Sun","Mon","Tue","Wed","Thu","Fri","Sat","Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","星期日","星期一","星期二","星期三","星期四","星期五","星期六"],monthNames:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","January","February","March","April","May","June","July","August","September","October","November","December"]};return function(g,h,i){if(1!==arguments.length||"[object String]"!==Object.prototype.toString.call(g)||/\d/.test(g)||(h=g,g=void 0),g=g?new Date(g):new Date,isNaN(g))throw SyntaxError("invalid date");h=String(e[h]||h||e["default"]),"UTC:"===h.slice(0,4)&&(h=h.slice(4),i=!0);var j=i?"getUTC":"get",k=g[j+"Date"](),l=g[j+"Day"](),m=g[j+"Month"](),n=g[j+"FullYear"](),o=g[j+"Hours"](),p=g[j+"Minutes"](),q=g[j+"Seconds"](),r=g[j+"Milliseconds"](),s=i?0:g.getTimezoneOffset(),t={d:k,dd:d(k,void 0),ddd:f.dayNames[l],dddd:f.dayNames[l+7],w:f.dayNames[l+14],m:m+1,mm:d(m+1,void 0),mmm:f.monthNames[m],mmmm:f.monthNames[m+12],yy:String(n).slice(2),yyyy:n,h:o%12||12,hh:d(o%12||12,void 0),H:o,HH:d(o,void 0),M:p,MM:d(p,void 0),s:q,ss:d(q,void 0),l:d(r,3),L:d(r>99?Math.round(r/10):r,void 0),t:12>o?"a":"p",tt:12>o?"am":"pm",T:12>o?"A":"P",TT:12>o?"AM":"PM",Z:i?"UTC":(String(g).match(b)||[""]).pop().replace(c,""),o:(s>0?"-":"+")+d(100*Math.floor(Math.abs(s)/60)+Math.abs(s)%60,4),S:["th","st","nd","rd"][k%10>3?0:(k%100-k%10!==10)*k%10]};return h.replace(a,function(a){return a in t?t[a]:a.slice(1,a.length-1)})}}(),g={add:function(a,b,d){return c(a,b,d)},addHour:function(a,b){return c("h",a,b)},addMinute:function(a,b){return c("n",a,b)},addSecond:function(a,b){return c("s",a,b)},addDay:function(a,b){return c("d",a,b)},addWeek:function(a,b){return c("w",a,b)},addMonths:function(a,b){return c("m",a,b)},addYear:function(a,b){return c("y",a,b)},isDateEquals:function(a,b){return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate()},isEquals:function(a,b){return a==b?!0:a&&b&&a.getTime&&b.getTime?a.getTime()==b.getTime():!1},isDateString:function(a){return e.test(a)},format:function(a,b,c){return f(a,b,c)},parse:function(a,c){return d.isString(a)&&(a=a.replace("/","-")),b(a,c)},today:function(){var a=new Date;return new Date(a.getFullYear(),a.getMonth(),a.getDate())},getDate:function(a){return new Date(a.getFullYear(),a.getMonth(),a.getDate())},getDayDiff:function(a,b){var c;return c=parseInt(Math.abs(g.parse(a)-g.parse(b))/1e3/60/60/24)}};return g}),define("zui/base/json",function(){function a(a){return 10>a?"0"+a:a}function b(a){return j.lastIndex=0,j.test(a)?'"'+a.replace(j,function(a){var b=k[a];return"string"==typeof b?b:"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+a+'"'}function c(a,d){var e,f,j,k,l,m=g,n=d[a];switch(n&&"object"==typeof n&&"function"==typeof n.toJSON&&(n=n.toJSON(a)),"function"==typeof i&&(n=i.call(d,a,n)),typeof n){case"string":return b(n);case"number":return isFinite(n)?String(n):"null";case"boolean":case"null":return String(n);case"object":if(!n)return"null";if(g+=h,l=[],"[object Array]"===Object.prototype.toString.apply(n)){for(k=n.length,e=0;k>e;e+=1)l[e]=c(e,n)||"null";return j=0===l.length?"[]":g?"[\n"+g+l.join(",\n"+g)+"\n"+m+"]":"["+l.join(",")+"]",g=m,j}if(i&&"object"==typeof i)for(k=i.length,e=0;k>e;e+=1)f=i[e],"string"==typeof f&&(j=c(f,n),j&&l.push(b(f)+(g?": ":":")+j));else for(f in n)Object.hasOwnProperty.call(n,f)&&(j=c(f,n),j&&l.push(b(f)+(g?": ":":")+j));return j=0===l.length?"{}":g?"{\n"+g+l.join(",\n"+g)+"\n"+m+"}":"{"+l.join(",")+"}",g=m,j}}function d(a){try{return new Function("return "+a)()}catch(b){throw"Json parse error!"}}var e=window,f=e.JSON;"function"!=typeof Date.prototype.toJSON&&(Date.prototype.toJSON=function(){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+a(this.getUTCMonth()+1)+"-"+a(this.getUTCDate())+"T"+a(this.getUTCHours())+":"+a(this.getUTCMinutes())+":"+a(this.getUTCSeconds())+"Z":null},String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(){return this.valueOf()});var g,h,i,j=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,k={"\b":"\\b","	":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"};"function"!=typeof f.stringify&&(f.stringify=function(a,b,d){var e;if(g="",h="","number"==typeof d)for(e=0;d>e;e+=1)h+=" ";else"string"==typeof d&&(h=d);if(i=b,b&&"function"!=typeof b&&("object"!=typeof b||"number"!=typeof b.length))throw new Error("JSON.stringify");return c("",{"":a})});var f={parse:$.parseJSON,looseParse:d,stringify:f.stringify};return f});