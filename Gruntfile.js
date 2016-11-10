module.exports = function (grunt) {

    // 构建任务配置
    grunt.initConfig({

        //读取package.json的内容，形成个json数据
        pkg: grunt.file.readJSON('package.json'),
		
		/**jshint: {
			files: ['gruntfile.js', 'zui/*.js', 'build/*.js'],
			options: {
				globals: {
					exports: true
				}
			}
		},**/
		bower: {   
		   install: { 
				options: {
						targetDir: "dist",
						layout: "byComponent",
						install: true,
						verbose: false,
						cleanTargetDir: false
					  }
				  }
        },
		concat: {  
			options: {  
				//定义一个字符串插入没个文件之间用于连接输出
				 // separator: ';',
				 // banner:"dist/"

			},  
			base: {  
			  src: ['javascript/zui/base.js','javascript/zui/base/utils.js','javascript/zui/base/array.js','javascript/zui/base/date.js','javascript/zui/base/json.js'],//src文件夹下包括子文件夹下的所有文件  
			  dest: 'dist/zui/base.js'//合并文件在dist下名为base.js的文件  
			},
			mixin: {  
			  src: ['javascript/zui/mixin.js','javascript/zui/mixin/scrollbar.js','javascript/zui/mixin/touch.js','javascript/zui/mixin/pagetransition.js','javascript/zui/mixin/event.js'],//src文件夹下包括子文件夹下的所有文件  
			  dest: 'dist/zui/mixin.js' 
			},
			form: {  
			  src: ['javascript/zui/form.js','javascript/zui/form/form.js','javascript/zui/form/field.js','javascript/zui/form/rules.js'],//src文件夹下包括子文件夹下的所有文件  
			  dest: 'dist/zui/form.js'
			},
			dialog: {  
			  src: ['javascript/zui/dialog.js','javascript/zui/dialog/overlay.js','javascript/zui/dialog/dialog.js','javascript/zui/dialog/mask.js'],//src文件夹下包括子文件夹下的所有文件  
			  dest: 'dist/zui/dialog.js'
			},
			calendar: {  
			  src: ['javascript/zui/calendar.js','javascript/zui/calendar/calendar.js','javascript/zui/calendar/datecalendar.js','javascript/zui/calendar/datepicker.js'],//src文件夹下包括子文件夹下的所有文件  
			  dest: 'dist/zui/calendar.js'
			},			
			list: {  
			  src: ['javascript/zui/list.js','javascript/zui/list/listselect.js','javascript/zui/list/listrefresh.js'],//src文件夹下包括子文件夹下的所有文件  
			  dest: 'dist/zui/list.js' 
			},
			store:{
			  src: ['javascript/zui/ajax.js'],//src文件夹下包括子文件夹下的所有文件  
			  dest: 'dist/zui/ajax.js' 
			},
			upload: {  
			  src: ['javascript/zui/upload.js','javascript/zui/upload/uploadimage.js'],//src文件夹下包括子文件夹下的所有文件  
			  dest: 'dist/zui/upload.js' 
			}
		  },  
        //压缩js
        uglify: {
            //文件头部输出信息
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n/* author:zhanwangye */\n'
            },
            my_target: {
                files: [
                    {
                        expand: true,
                        //相对路径
                        //cwd: 'zui/',
                        src: 'zui/*.js',
                        dest: 'build/',
						// ,ext: '.min.js'  
                        rename: function (dest, src) {  
							var folder = src.substring(0, src.lastIndexOf('/'));  
							var filename = src.substring(src.lastIndexOf('/'), src.length);  
							//  var filename=src;  
							filename = filename.substring(0, filename.lastIndexOf('.'));  
							var fileresult=dest + folder + filename + '.min.js';  
							grunt.log.writeln("现处理文件："+src+"  处理后文件："+fileresult);  
							return fileresult;  
							
						}  
                    }
                ]
            }
        },

        //压缩css
        cssmin: {
            //文件头部输出信息
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                //美化代码
                beautify: {
                    //中文ascii化，非常有用！防止中文乱码的神配置
                    ascii_only: true
                }
            },
            my_target: {
                files: [
                    {
                        expand: true,
                        //相对路径
                        cwd: 'stylesheets/',
                        src: '*.css',
                        dest: 'build/css/',
						// ,ext: '.min.css'  
                        rename: function (dest, src) {  
							var folder = src.substring(0, src.lastIndexOf('/'));  
							var filename = src.substring(src.lastIndexOf('/'), src.length);  
							//  var filename=src;  
							filename = filename.substring(0, filename.lastIndexOf('.'));  
							var fileresult=dest + folder + filename + '.min.css';  
							grunt.log.writeln("现处理文件："+src+"  处理后文件："+fileresult);  
							return fileresult;  
							
						}  
                    }
                ]
            }
        }

    });
	
    // 加载指定插件任务
	//grunt.loadNpmTasks('grunt-contrib-qunit');
	//grunt.loadNpmTasks('grunt-contrib-jshint');
	//grunt.loadNpmTasks('grunt-bower-task');  
	grunt.loadNpmTasks('grunt-contrib-concat');  
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    // 默认执行的任务
    //grunt.registerTask('default', ['jshint','concat','uglify', 'cssmin']);
	grunt.registerTask('default', ['concat','uglify', 'cssmin']);

};