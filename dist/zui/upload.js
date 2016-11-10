define("zui/upload",["zui/base","zui/upload/uploadImage"],function(require,exports,modules){

		var Upload={
			UploadImage:require("zui/upload/uploadImage")
		};
		return Upload;

});
define("zui/uploadimage",['zui/base','zui/dialog','zui/form'],function(require){
	var zbase=require("zui/base");
	var zForm=require("zui/form");
	var zDialog=require("zui/dialog").Dialog;
	var zUtil=zbase;
	var zArray=zbase.Array;
	
	function zUpload(options){
			var options=options||{};
			var self=this;
			self.fileInput=document.getElementById(options.file);
			self.progress=document.getElementById(options.progress);
			self.uploadForm=document.getElementById(options.uploadForm);
			if(window.FileReader) {  
			    self.holder=document.getElementById(options.holder);
			    self.imageShow=options.imageshow;
		        self.loaded = 0;  
		        //每次读取1M  
		        self.step = 1024 * 1024;  
		        self.times = 0;  
		        self.fileInput.onchange=function(ev){
						self.file= this.files;
						if(!/image\/\w+/.test(this.files[0].type)){
							 self.fileInput.value="";
							 zDialog.Alert({msg:"请确保文件为图像类型"});
							return false;
						}
						if(options.autoLoad){
							self.uploadFile(options);
						}
						if(options.readImage){
							self.readFile();
						}
						
				};
			}  
			else {  
			    alert("Not supported by your browser!");  
			} 
	}

	zUpload.prototype={
			uploadFile:function(options){
				var self = this;  
				var xhr = new XMLHttpRequest();
				xhr.open('post', options.url);
				xhr.timeout = 20000;
				 xhr.overrideMimeType("text/plain; charset=utf-8");
				if(options.responseType){
					xhr.responseType=options.responseType;
				}
				//超时
				xhr.ontimeout = function(event){
					 zDialog.Alert({msg:"请求超时！"});
				};
			 	xhr.onreadystatechange = function(){
			 		//成功返回
					if ( xhr.readyState == 4  ) {
						zDialog.closeDialog();
						 switch(xhr.status){

						 	case 200:if(zUtil.isFunction(options.callback)){
										  options.callback(xhr);
									 }
									 break;
							default:break;
						 }

					}
			 	}; 
			 	xhr.onprogress=function(event){
			 			if (event.lengthComputable) {
				　　　　　　var percentComplete = event.loaded / event.total;
				　　　　} 
			 			
			 	};
			 	xhr.oncomplete=function(event){
			 		zDialog.closeDialog();
			 	};
			 	//表单数据封装对象
			 	var formData = new FormData(self.uploadForm);
			 	zDialog.Loading({msg:"<p style='margin-top:5px;'>上传中</p>"});
				xhr.send(formData);
			},
			writeFile:function(){
				var reader = new FileReader();
				return reader.readAsBinaryString(this.file);
			},
			getFiles:function(){
				return this.file;
			},
			readFile: function() {  
		        var self = this;  
		           
		        var file = self.file[0];  
		           
		        var reader = self.reader = new FileReader();  
		        reader.readAsDataURL(file);    
		        //  
		        self.total = file.size;  
		           
		        reader.onloadstart = function(){
		        	self.onLoadStart();
		        };  
		        if(self.progress){
		        	 reader.onprogress =function(event){
		        	 	self.onProgress(event);
		        	 }; 
		        }
		        
		        reader.onabort = function(event){
		        	self.onAbort(event);
		        };  
		        reader.onerror = function(event){
		        	self.onerror(event);
		        };  
		        reader.onload = function(event){
		        	self.onLoad(event);  
		        };
		        reader.onloadend = function(event){
		        	self.onLoadEnd(event); 

		        }; 
		      
		        //读取第一块  
		        self.readBlob(file, 0);  
		    },  
		    onLoadStart: function() {  
		        var self = this;  
		    },  
		    onProgress: function(e) {  
		        var self = this;  
		           
		        self.loaded= e.loaded;
		        if (e.lengthComputable) { 
			        //更新进度条  
			        self.progress.value = (self.loaded / self.total) * 100;  
		   		}
		   		else{

		   		}
		    },  
		    onAbort: function() {  
		        var self = this;  
		    },  
		    onError: function() {  
		        var self = this;  
		           
		    },  
		    onLoad: function(event) {  
		        var self = this;  
		        if(self.holder){
		        	if(event.loaded < self.total) {
			            self.readBlob(event.loaded);
			        } else {
			            self.loaded = self.total;
			            self.holder.innerHTML = '<img style="height:auto;width:100%;display:block;" src="'+self.reader.result+'" alt=""/>' 
			        }
		        }
		       
   				
		    },  
		    onLoadEnd: function() {  
		        var self = this;  
		        //self.loaded = self.total;  
		        //self.progress.value=100; 

		    },  
		    readBlob: function(start) {  
		        var self = this;  
		           
		        var blob,  
		            file = self.file[0];  
		           
		        self.times += 1;  
		        //alert(file.webkitSlice)
		        if(file.slice) {  
		            blob = file.slice(start, start + self.step + 1);  
		        } 
		        else if(file.webkitSlice){
		        	blob = file.webkitSlice(start, start + self.step + 1);
		        }
		        else if(file.mozSlice){
		        	blob = file.mozSlice(start, start + self.step + 1);
		        }
		        else{
		        	zDialog.Alert({msg:"浏览器不支持分段读取文件!"});
		        }  
		       //self.reader.readAsText(blob,"utf-8");  
		    },  
		    abortHandler: function() {  
		        var self = this;  
		           
		        if(self.reader) {  
		            self.reader.abort();  
		        }  
		    }  


	}

	return zUpload;


});