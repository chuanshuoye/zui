define("zui/form",["zui/base","zui/form/form","zui/form/field","zui/form/rules"],function(require,exports,module){
		var Form={
			Form:require("zui/form/form"),
			Field:require("zui/form/field"),
			Rules:require("zui/form/rules")
		}

		return Form;

	
})
define("zui/form/form",["zui/base","zui/dialog"],function(require,exports,module){

		var zBase=require("zui/base");
		var zRules=require("zui/form/rules");
		var zField=require("zui/form/field");
    	var zDialog=require("zui/dialog").Dialog;

    	var zUtils=zBase;
		var zJson=zBase.JSON;
		var zArray=zBase.Array;
		
		
		function ZForm(options){
			this.el=options.srcNode;
			this.validType=options.validType?options.validType:"dialog";
			this.proxy={
				method:"GET",
			 	contentType : "application/x-www-form-urlencoded; charset=utf-8",
				timeout:20000,
				dataType:"json"
			};
			this.submitMask=true;
			//自定义错误处理func
			this.validateFunc=options.validateFunc?options.validateFunc:null;

		};

		/***
			格式化校验规则

		**/

		function formatValidateRules(_self,fieldName){
				var elem=_self.getField(fieldName)
				if($(elem).attr("data-rules"))
					return zJson.looseParse($(elem).attr("data-rules"));
				else
					return {};
		}
		/***
			格式化校验提示信息

		**/

		function formatValidateMessage(_self,fieldName){
				var elem=_self.getField(fieldName)
				if($(elem).attr("data-messages"))
					return zJson.looseParse($(elem).attr("data-messages"));
				else
					return {};
		}

		/***
			显示错误提示信息
			提供popover，dialog方式两种
		**/
		ZForm.prototype.showError=function(field,errorMsg){
			var _self=this;

			if(_self.validType=="dialog"){
				zDialog.Alert({
					title:"提示",
					msg:errorMsg,
					callback:function(){
						$(field).focus();
					}
				})

			}
			if(_self.validType=="flash"){
				zDialog.Flash({
					msg:errorMsg,
					duration:2000
				})
			}
		}

		/***
			将表单格式化成键值对形式
		**/
		ZForm.prototype.serializeToObject=function(){
				return zUtils.serializeToObject(this.el);
		}
		
		/***
			将表单数据序列化成对象
		**/
		ZForm.prototype.serializeToArray=function(){
				return zUtils.serializeToArray(this.el);
		}

		/**
			重置表单
		**/
		ZForm.prototype.resetForm=function(){
			    zUtils.clear(this.el);
		}
		
		/**
			获取表单fields
			return array[]
		**/
		ZForm.prototype.getFields=function(){

				var _self=this;
				var el=_self.el;
				return $(el).find("input,textarea,select");
		}
		/**
		 获取表单元素
		**/
		ZForm.prototype.getField=function(fieldName){
			var _self=this;
			var el=_self.el;
			var field;
			if(!fieldName) return undefined;

			zUtils.each(_self.getFields(),function(element,index){

					if($(element).attr("name")==fieldName){
						field= element;
					}
			});
				
			return field;
		}

		ZForm.prototype.getRuleKey=function(validMessages,rule,fieldName,baseValue,value){
					var _self=this;
					if(validMessages[rule]&&validMessages[rule]!=""){
						var formatMsg=validMessages[rule];
						if(zUtils.isFunction(_self.validateFunc)){
							_self.validateFunc({"field":fieldName,"validateMsg":formatMsg});
						}
						else
							_self.showError(fieldName,formatMsg);
					}
					else{
						if(zUtils.isFunction(_self.validateFunc)){
							_self.validateFunc({"field":fieldName,"validateMsg":zRules.validField(rule,value,baseValue,fieldName,formatMsg)});
						}
						else
							_self.showError(fieldName,zRules.validField(rule,value,baseValue,fieldName,formatMsg));
					}
						
					return false;
		}

		/**
		 表单校验v1.1
		 单独校验
		**/
		ZForm.prototype.isValid=function(name){
			var _self=this,formatMsg,
				validateState=true;

			var validrule=formatValidateRules(_self,name);
			var  validMessages=formatValidateMessage(_self,name);
			fieldName=_self.getField(name);
			if(!fieldName) return true;
			var value=zField.getValue(fieldName);
			for(var key in validrule){
				var  rule=key,baseValue=validrule[key];
				
				if(!zRules.isValid(rule,value,baseValue,fieldName)){
					validateState=_self.getRuleKey(validMessages,rule,fieldName,baseValue,value);
					return validateState;
				}else{
					validateState= true;
				}

			}
			
			return validateState;
		}
	
		/**
		 表单校验v1.0
		**/
		ZForm.prototype.valid=function(){

			var _self=this,validateState=true;

			var  fieldList=_self.getFields();
			zUtils.each(fieldList,function(elem,index){
				var name=$(elem).attr("name");
				if(!_self.isValid(name)){
					validateState=false;
					return validateState
				}
			});
			return validateState;
		}

		/**ajax表单提交**/
		ZForm.prototype.ajaxSubmit=function(options){
		        var _self = this,
		        method = _self.proxy['method'],
		        action = _self['url'],
		        submitMask=_self['submitMask'],
		        data = zUtils.serializeToObject(_self.el), //获取表单数据
		        success,error,
		        ajaxParams = $.extend({ //合并请求参数
		          url : action,
		          type : method,
		          dataType : 'json',
		          data : data
		        },options);

		      if(options && options.success){
		        success = options.success;
		      };

		      if(options && options.error){
		        error = options.error;
		      };
		      ajaxParams.success = function(data){ //封装success方法
		        if(submitMask){
		           zDialog.closeDialog();
		        }
		        if(success){
		          success(data);
		        }
		      };
		      ajaxParams.error=function(jqXHR, textStatus, errorThrown){
		      		if(submitMask){
			           zDialog.closeDialog();
			        }
			        var result = {
			            exception : {
			              status : textStatus,
			              errorThrown: errorThrown,
			              jqXHR : jqXHR
			            }
			          };
			         if(zUtils.isFunction(error)){
		  						  error(result);
		  			 }
				};
		      if(submitMask){
		         zDialog.Loading();
		      }
		      $.ajax(ajaxParams); 

		}
		return ZForm;

});
define("zui/form/field",["zui/base"],function(require,exports,module){
	
	var zbase=require("zui/base");
	var zUtils=zbase;

	var Field={

			getValue:function(el){
				if(getFieldType(el)=="textarea"){
					return $(el).text();
				}
				else{
					var type=$(el).attr("type");
					if(type=='checkbox'||type=="radio"){
						return $(el).prop("checked");
					}
					return $(el).val();
				}
			},
			setValue:function(el,value){
				if(getFieldType(el)=="input"){
					var type=$(el).attr("type");
					if(type=='checkbox'||type=="radio"){
						$(el).prop("checked","checked");
					}
					$(el).val(value);
				}
				if(getFieldType(el)=="select"){
					var options=$(el).find("option");
					zUtils.each(options,function(element,index){
						if($(element).attr("value")==value){
							$(element).siblings().removeAttr("selected");
							$(element).attr("selected","selected");
						}
					});
				}
				if(getFieldType(el)=="textarea"){
					$(el).text(value);
				}
			},
			setDisabled:function(el,flag){
				if(flag==true){
					$(el).attr("disabled","disabled");
				}
				else{
					$(el).removeAttr("disabled");
				}
				
			},
			setReadonly:function(el,flag){
				if(flag==true){
					$(el).attr("readonly","readonly");
				}
				else{
					$(el).removeAttr("readonly");
				}
			}

	}


	function getFieldType(field){

		var type=$(field)[0].nodeName;
		if(type!=undefined){

			switch(type){

				case "INPUT":return "input";break;
				case "SELECT":return "select";break;
				case "TEXTAREA":return "textarea";break;
				default:return "input";break;

			}
		}

	}

	return Field;
})
define("zui/form/rules",["zui/base"],function(require,exports,module){

  var zbase=require("zui/base");
  var zUtil=zbase;
  var zDate=zbase.Date;

   var ruleMap = {

  };


  function toNumber(value){
    return parseFloat(value);
  }

  function toDate(value){
    return zDate.parse(value);
  }

  


  function parseParams(values){

    if(values == null){
      return {};
    }

    if($.isPlainObject(values)){
      return values;
    }

    var ars = values,
        rst = {};
    if(zUtil.isArray(values)){

      for(var i = 0; i < ars.length; i++){
        rst[i] = ars[i];
      }
      return rst;
    }

    return {'0' : values};
  }

  function formatError(self,values,msg){
    var ars = parseParams(values); 
    msg = msg || self['msg'];
    return zUtil.substitute(msg,ars);
  }

//是否通过验证
  function valid(self,value,baseValue,msg,control){

    if(zUtil.isArray(baseValue) && zUtil.isString(baseValue[1])){
      if(baseValue[1]){
        msg = baseValue[1];
      }
      baseValue = baseValue[0];
    }

    var _self = self,
      validator = _self['validator'],
      formatedMsg = formatError(_self,baseValue,msg),
      valid = true;
    value = value == null ? '' : value;
    return validator.call(_self,value,baseValue,formatedMsg,control);
  }

 
  /**
   * @class zUtil.Form.rules
   * @singleton
   * 表单验证的验证规则管理器
   */

  var rules = {
    /**
     * 添加验证规则
     * @param {Object|zUtil.Form.Rule} rule 验证规则配置项或者验证规则对象
     * @param  {String} name 规则名称
     */
    add:function(name,rule){
        ruleMap[name] = rule;
       return ruleMap[name];
    },
    /**
     * 删除验证规则
     * @param  {String} name 规则名称
     */
    remove:function(name){
      delete ruleMap[name];
    },
    /**
     * 获取验证规则
     * @param  {String} name 规则名称
     * @return {zUtil.Form.Rule}  验证规则
     */
    get:function(name){
      return ruleMap[name];
    },
    /**
     * 验证指定的规则
     * @param  {String} name 规则类型
     * @param  {*} value 验证值
     * @param  {*} [baseValue] 用于验证的基础值
     * @param  {String} [msg] 显示错误的模板
     * @param  {zUtil.Form.Field|zUtil.Form.Group} [control] 显示错误的模板
     * @return {String} 通过验证返回 null,否则返回错误信息
     */
    validField:function(name,value,baseValue,control){
      var rule = rules.get(name);
      if(rule){
        var msg=rule['msg'];
        return valid(rule,value,baseValue,msg,control);
      }
      return null;
    },
    /**
     * 验证指定的规则
     * @param  {String} name 规则类型
     * @param  {*} values 验证值
     * @param  {*} [baseValue] 用于验证的基础值
     * @param  {zUtil.Form.Field|zUtil.Form.Group} [control] 显示错误的模板
     * @return {Boolean} 是否通过验证
     */
    isValid:function(name,value,baseValue,control){
      return rules.validField(name,value,baseValue,control) == null;
    }
  };




  
  
  /**
   * 非空验证,会对值去除空格
   * <ol>
   *  <li>name: required</li>
   *  <li>msg: 不能为空！</li>
   *  <li>required: boolean 类型</li>
   * </ol>
   * @member zUtil.Form.zrules
   * @type {zUtil.Form.Rule}
   */
  var required = rules.add("required",{
    name : 'required',
    msg : '不能为空！',
    validator : function(value,required,formatedMsg){
      if(required !== false && /^\s*$/.test(value)){
        return formatedMsg;
      }
    }
  });

  /**
   * 相等验证
   * <ol>
   *  <li>name: equalTo</li>
   *  <li>msg: 两次输入不一致！</li>
   *  <li>equalTo: 一个字符串，id（#id_name) 或者 name</li>
   * </ol>
   *         {
   *           equalTo : '#password'
   *         }
   *         //或者
   *         {
   *           equalTo : 'password'
   *         } 
   * @member zUtil.Form.rules
   * @type {zUtil.Form.Rule}
   */
  var equalTo = rules.add("equalTo",{
    name : 'equalTo',
    msg : '两次输入不一致！',
    validator : function(value,equalTo,formatedMsg){
      var el = $(equalTo);
      if(el.length){
        equalTo = el.val();
      } 
      return value === equalTo ? undefined : formatedMsg;
    }
  });


  /**
   * 不小于验证
   * <ol>
   *  <li>name: min</li>
   *  <li>msg: 输入值不能小于{0}！</li>
   *  <li>min: 数字，字符串</li>
   * </ol>
   *         {
   *           min : 5
   *         }
   *         //字符串
   * @member zUtil.Form.rules
   * @type {zUtil.Form.Rule}
   */
  var min = rules.add("min",{
    name : 'min',
    msg : '输入值不能小于{0}！',
    validator : function(value,min,formatedMsg){
      if(value !== '' && toNumber(value) < toNumber(min)){
        return formatedMsg;
      }
    }
  });

  /**
   * 不小于验证,用于数值比较
   * <ol>
   *  <li>name: max</li>
   *  <li>msg: 输入值不能大于{0}！</li>
   *  <li>max: 数字、字符串</li>
   * </ol>
   *         {
   *           max : 100
   *         }
   *         //字符串
   *         {
   *           max : '100'
   *         }
   * @member zUtil.Form.rules
   * @type {zUtil.Form.Rule}
   */
  var max = rules.add("max",{
    name : 'max',
    msg : '输入值不能大于{0}！',
    validator : function(value,max,formatedMsg){
      if(value !== '' && toNumber(value) > toNumber(max)){
        return formatedMsg;
      }
    }
  });

  /**
   * 输入长度验证，必须是指定的长度
   * <ol>
   *  <li>name: length</li>
   *  <li>msg: 输入值长度为{0}！</li>
   *  <li>length: 数字</li>
   * </ol>
   * @member zUtil.Form.rules
   * @type {zUtil.Form.Rule}
   */
  var length = rules.add("length",{
    name : 'length',
    msg : '输入值长度为{0}！',
    validator : function(value,len,formatedMsg){
      if(value != null){
        value = $.trim(value.toString());
        if(len != value.length){
          return formatedMsg;
        }
      }
    }
  });
  /**
   * 最短长度验证,会对值去除空格
   * <ol>
   *  <li>name: minlength</li>
   *  <li>msg: 输入值长度不小于{0}！</li>
   *  <li>minlength: 数字</li>
   * </ol>
   *         {
   *           minlength : 5
   *         }
   * @member zUtil.Form.rules
   * @type {zUtil.Form.Rule}
   */
  var minlength = rules.add("minlength",{
    name : 'minlength',
    msg : '输入值长度不小于{0}！',
    validator : function(value,min,formatedMsg){
      if(value != null){
        value = $.trim(value.toString());
        var len = value.length;
        if(len < min){
          return formatedMsg;
        }
      }
    }
  });

  /**
   * 最短长度验证,会对值去除空格
   * <ol>
   *  <li>name: maxlength</li>
   *  <li>msg: 输入值长度不大于{0}！</li>
   *  <li>maxlength: 数字</li>
   * </ol>
   *         {
   *           maxlength : 10
   *         }
   * @member zUtil.Form.rules
   * @type {zUtil.Form.Rule}   
   */
  var maxlength = rules.add("maxlength",{
    name : 'maxlength',
    msg : '输入值长度不大于{0}！',
    validator : function(value,max,formatedMsg){
      if(value){
        value = $.trim(value.toString());
        var len = value.length;
        if(len > max){
          return formatedMsg;
        }
      }
    }
  });

  /**
   * 正则表达式验证,如果正则表达式为空，则不进行校验
   * <ol>
   *  <li>name: regexp</li>
   *  <li>msg: 输入值不符合{0}！</li>
   *  <li>regexp: 正则表达式</li>
   * </ol> 
   * @member zUtil.Form.rules
   * @type {zUtil.Form.Rule}
   */
  var regexp = rules.add("regexp",{
    name : 'regexp',
    msg : '输入值不符合{0}！',
    validator : function(value,regexp,formatedMsg){
      if(regexp){
        return regexp.test(value) ? undefined : formatedMsg;
      }
    }
  });

  /**
   * 邮箱验证,会对值去除空格，无数据不进行校验
   * <ol>
   *  <li>name: email</li>
   *  <li>msg: 不是有效的邮箱地址！</li>
   * </ol>
   * @member zUtil.Form.rules
   * @type {zUtil.Form.Rule}
   */
  var email = rules.add("email",{
    name : '"email",',
    msg : '不是有效的邮箱地址！',
    validator : function(value,baseValue,formatedMsg){
      value = $.trim(value);
      if(value){
        return /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(value) ? undefined : formatedMsg;
      }
    }
  });

  /**
   * 日期验证，会对值去除空格，无数据不进行校验，
   * 如果传入的值不是字符串，而是数字，则认为是有效值
   * <ol>
   *  <li>name: date</li>
   *  <li>msg: 不是有效的日期！</li>
   * </ol>
   * @member BUI.Form.rules
   * @type {BUI.Form.Rule}
   */
  var date = rules.add("date",{
    name : 'date',
    msg : '不是有效的日期！',
    validator : function(value,baseValue,formatedMsg){
      if(zUtil.isNumber(value)){ //数字认为是日期
        return;
      }
      if(zUtil.isDate(value)){
        return;
      }
      value = $.trim(value);
      if(value){
        return zUtil.Date.isDateString(value) ? undefined : formatedMsg;
      }
    }
  });

  /**
   * 不小于验证
   * <ol>
   *  <li>name: minDate</li>
   *  <li>msg: 输入日期不能小于{0}！</li>
   *  <li>minDate: 日期，字符串</li>
   * </ol>
   *         {
   *           minDate : '2001-01-01';
   *         }
   *         //字符串
   * @member zUtil.Form.rules
   * @type {zUtil.Form.Rule}
   */
  var minDate = rules.add('minDate',{
    name : 'minDate',
    msg : '输入日期不能小于{0}！',
    validator : function(value,minDate,formatedMsg){
      if(value){
        var date = toDate(value);
        if(date && date < toDate(minDate)){
           return formatedMsg;
        }
      }
    }
  });

  /**
   * 不小于验证,用于数值比较
   * <ol>
   *  <li>name: maxDate</li>
   *  <li>msg: 输入值不能大于{0}！</li>
   *  <li>maxDate: 日期、字符串</li>
   * </ol>
   *         {
   *           maxDate : '2001-01-01';
   *         }
   *         //或日期
   *         {
   *           maxDate : new Date('2001-01-01');
   *         }
   * @member zUtil.Form.rules
   * @type {zUtil.Form.Rule}
   */
  var maxDate = rules.add('maxDate',{
    name : 'maxDate',
    msg : '输入日期不能大于{0}！',
    validator : function(value,maxDate,formatedMsg){
      if(value){
        var date = toDate(value);
        if(date && date > toDate(maxDate)){
           return formatedMsg;
        }
      }
    }
  });

  /**
   * 结束日期不能小于开始日期
   * <ol>
   *  <li>name: maxDate</li>
   *  <li>msg: 输入值不能大于{0}！</li>
   *  <li>maxDate: 日期、字符串</li>
   * </ol>
   *         {
   *           maxDate : '2001-01-01';
   *         }
   *         //或日期
   *         {
   *           maxDate : new Date('2001-01-01');
   *         }
   * @member zUtil.Form.rules
   * @type {zUtil.Form.Rule}
   */
  var dateBigerTo = rules.add("dateBigerTo",{
    name : 'dateBigerTo',
    msg : '结束日期不能小于开始日期！',
    validator : function(value,dateBigerTo,formatedMsg){
      var el = $(dateBigerTo);
      if(el.length){
        var dateBigerToValue = toDate(el.val());
      } 
      if(dateBigerToValue && dateBigerToValue > toDate(value)){
           return formatedMsg;
      }
    }
  });


  /**
   * 数字验证，会对值去除空格，无数据不进行校验
   * 允许千分符，例如： 12,000,000的格式
   * <ol>
   *  <li>name: mobile</li>
   *  <li>msg: 不是有效的手机号码！</li>
   * </ol>
   * @member zUtil.Form.rules
   * @type {zUtil.Form.Rule}
   */
  var mobile = rules.add('mobile',{
    name : 'mobile',
    msg : '不是有效的手机号码！',
    validator : function(value,baseValue,formatedMsg){
      value = $.trim(value);
      if(value){
        return /^\d{11}$/.test(value) ? undefined : formatedMsg;
      }
    }
  });

  /**
   * 数字验证，会对值去除空格，无数据不进行校验
   * 允许千分符，例如： 12,000,000的格式
   * <ol>
   *  <li>name: number</li>
   *  <li>msg: 不是有效的数字！</li>
   * </ol>
   * @member zUtil.Form.rules
   * @type {zUtil.Form.Rule}
   */
  var number = rules.add('number',{
    name : 'number',
    msg : '不是有效的数字！',
    validator : function(value,baseValue,formatedMsg){
      if(zUtil.isNumber(value)){
        return;
      }
      value = value.replace(/\,/g,'');
      return !isNaN(value) ? undefined : formatedMsg;
    }
  });

    /**
   * url验证，会对值去除空格，无数据不进行校验
   * @member zUtil.Form.rules
   * @type {zUtil.Form.Rule}
   */
  var url = rules.add('url',{
    name : 'url',
    msg : '不是有效的URL地址！',
    validator : function(value,baseValue,formatedMsg){
     value = $.trim(value);
      if(value){
        return /^http(s?):\/\/[^\r\n]+$/i.test(value) ? undefined : formatedMsg;
      }
    }
  });


    /**
   * 证件号验证，会对值去除空格，无数据不进行校验
   * @member zUtil.Form.rules
   * @type {zUtil.Form.Rule}
   */
  var isIdCard = rules.add('isIdCard',{
    name : 'isIdCard',
    msg : '不是有效的证件号码！',
    validator : function(value,baseValue,formatedMsg){
     value = $.trim(value);
      if(value){
        return _isIdCard(value)? undefined : formatedMsg;
      }
    }
  });

   
               
   // 身份证，执行严格校验，注意：18位身份证最后一位如果是“X”，则必须是大写的“X”，否则校验不通过
    function _isIdCard(id){
        // 省份代码
        var prov = {
            11: "北京",
            12: "天津",
            13: "河北",
            14: "山西",
            15: "内蒙古",
            21: "辽宁",
            22: "吉林",
            23: "黑龙江",
            31: "上海",
            32: "江苏",
            33: "浙江",
            34: "安徽",
            35: "福建",
            36: "江西",
            37: "山东",
            41: "河南",
            42: "湖北",
            43: "湖南",
            44: "广东",
            45: "广西",
            46: "海南",
            50: "重庆",
            51: "四川",
            52: "贵州",
            53: "云南",
            54: "西藏",
            61: "陕西",
            62: "甘肃",
            63: "青海",
            64: "宁夏",
            65: "新疆",
            71: "台湾",
            81: "香港",
            82: "澳门",
            91: "国外"
        };

        var idChars = id.split("");
        if (!prov[parseInt(id.substr(0, 2))]) { // 省份检验
            return false;
        }
        var regExp;
        switch (id.length) {
            case 15:// 15位身份证号检测
                var year = parseInt(id.substr(6, 2)) + 1900;
                if (isLeapYear(year)) {// 闰年
                    regExp = /^[1-9][0-9]{5}[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|[1-2][0-9]))[0-9]{3}$/;
                } else {// 平年
                    regExp = /^[1-9][0-9]{5}[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|1[0-9]|2[0-8]))[0-9]{3}$/;
                }
                return regExp.test(id);
                break;

            case 18:// 18位身份号码检测
                var year = id.substr(6, 4);
                if (isLeapYear(year)) {// 闰年
                    regExp = /^[1-9][0-9]{5}[1-9][0-9]{3}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|[1-2][0-9]))[0-9]{3}[0-9Xx]$/;
                } else {// 平年
                    regExp = /^[1-9][0-9]{5}[1-9][0-9]{3}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|1[0-9]|2[0-8]))[0-9]{3}[0-9Xx]$/;
                }
                if (regExp.test(id)) {// 基本校验
                    var modulus, checkCodeList = '10X98765432';
                    var sum, code;
                    sum = (parseInt(idChars[0]) + parseInt(idChars[10])) * 7 + (parseInt(idChars[1]) + parseInt(idChars[11])) * 9 + (parseInt(idChars[2]) + parseInt(idChars[12])) * 10 + (parseInt(idChars[3]) + parseInt(idChars[13])) * 5 + (parseInt(idChars[4]) + parseInt(idChars[14])) * 8 + (parseInt(idChars[5]) + parseInt(idChars[15])) * 4 + (parseInt(idChars[6]) + parseInt(idChars[16])) * 2 +
                        parseInt(idChars[7]) * 1 +
                        parseInt(idChars[8]) * 6 +
                        parseInt(idChars[9]) * 3; // 计算校验位
                    modulus = sum % 11;
                    code = checkCodeList.substr(modulus, 1);// 找到校验位
                    if (code == idChars[17]) {// 检测ID的校验位
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    return false;
                }
                break;
            default:
                return false;
        }
    }


     //闰年判断
    function isLeapYear(val){
         var year = parseInt(val);
                if (isNaN(year)) {// 非数字
                    ret = false;
                }else{
                    ret = ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0);
          }

    }
  
  return rules;

});