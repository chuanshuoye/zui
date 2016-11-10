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