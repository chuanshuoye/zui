define("zui/ajax",["zui/base","zui/dialog"],function(require,exports,module){
	
		var zBase=require("zui/base");
		var zUtil=zBase.Utils;
		var zDialog=require("zui/dialog").Dialog;
		
		
		function zAjax(options,successCallback,errorCallback){

				var defaultOptions=$.extend({
					 type:"post",
					 dataType:"json",
					 mask:true,
					 cache:false,
					 contentType : "application/x-www-form-urlencoded; charset=utf-8",
					 timeout:20000,
					 beforeSend:function(xhr, settings){
					 	if(options.mask){
					 		zDialog.Loading();
					 	}
					 	  	 
					 },
					 success:function(data, status, xhr){
						if(options.mask){
					 		 zDialog.closeDialog();
					 	}
					 	if(zUtil.isFunction(successCallback))
						 	successCallback(data);
						 
					 },
					 error:function(jqXHR, textStatus, errorThrown){
						 	if(options.mask){
						 		 zDialog.closeDialog();
						 	}
					        var result = {
					            exception : {
					              status : textStatus,
					              errorThrown: errorThrown,
					              jqXHR : jqXHR
					            }
					          };
					         if(zUtil.isFunction(errorCallback)){
	   		  						  errorCallback(result);
	   		  				 }
					        
					 }
				},options?options:{});

				$.ajax(defaultOptions);

		};

	
		return zAjax;
});