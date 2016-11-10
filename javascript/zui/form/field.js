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