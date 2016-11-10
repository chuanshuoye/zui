module.exports = function (grunt) {

    // ������������
    grunt.initConfig({

        //��ȡpackage.json�����ݣ��γɸ�json����
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
				//����һ���ַ�������û���ļ�֮�������������
				 // separator: ';',
				 // banner:"dist/"

			},  
			base: {  
			  src: ['javascript/zui/base.js','javascript/zui/base/utils.js','javascript/zui/base/array.js','javascript/zui/base/date.js','javascript/zui/base/json.js'],//src�ļ����°������ļ����µ������ļ�  
			  dest: 'dist/zui/base.js'//�ϲ��ļ���dist����Ϊbase.js���ļ�  
			},
			mixin: {  
			  src: ['javascript/zui/mixin.js','javascript/zui/mixin/scrollbar.js','javascript/zui/mixin/touch.js','javascript/zui/mixin/pagetransition.js','javascript/zui/mixin/event.js'],//src�ļ����°������ļ����µ������ļ�  
			  dest: 'dist/zui/mixin.js' 
			},
			form: {  
			  src: ['javascript/zui/form.js','javascript/zui/form/form.js','javascript/zui/form/field.js','javascript/zui/form/rules.js'],//src�ļ����°������ļ����µ������ļ�  
			  dest: 'dist/zui/form.js'
			},
			dialog: {  
			  src: ['javascript/zui/dialog.js','javascript/zui/dialog/overlay.js','javascript/zui/dialog/dialog.js','javascript/zui/dialog/mask.js'],//src�ļ����°������ļ����µ������ļ�  
			  dest: 'dist/zui/dialog.js'
			},
			calendar: {  
			  src: ['javascript/zui/calendar.js','javascript/zui/calendar/calendar.js','javascript/zui/calendar/datecalendar.js','javascript/zui/calendar/datepicker.js'],//src�ļ����°������ļ����µ������ļ�  
			  dest: 'dist/zui/calendar.js'
			},			
			list: {  
			  src: ['javascript/zui/list.js','javascript/zui/list/listselect.js','javascript/zui/list/listrefresh.js'],//src�ļ����°������ļ����µ������ļ�  
			  dest: 'dist/zui/list.js' 
			},
			store:{
			  src: ['javascript/zui/ajax.js'],//src�ļ����°������ļ����µ������ļ�  
			  dest: 'dist/zui/ajax.js' 
			},
			upload: {  
			  src: ['javascript/zui/upload.js','javascript/zui/upload/uploadimage.js'],//src�ļ����°������ļ����µ������ļ�  
			  dest: 'dist/zui/upload.js' 
			}
		  },  
        //ѹ��js
        uglify: {
            //�ļ�ͷ�������Ϣ
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n/* author:zhanwangye */\n'
            },
            my_target: {
                files: [
                    {
                        expand: true,
                        //���·��
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
							grunt.log.writeln("�ִ����ļ���"+src+"  ������ļ���"+fileresult);  
							return fileresult;  
							
						}  
                    }
                ]
            }
        },

        //ѹ��css
        cssmin: {
            //�ļ�ͷ�������Ϣ
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                //��������
                beautify: {
                    //����ascii�����ǳ����ã���ֹ���������������
                    ascii_only: true
                }
            },
            my_target: {
                files: [
                    {
                        expand: true,
                        //���·��
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
							grunt.log.writeln("�ִ����ļ���"+src+"  ������ļ���"+fileresult);  
							return fileresult;  
							
						}  
                    }
                ]
            }
        }

    });
	
    // ����ָ���������
	//grunt.loadNpmTasks('grunt-contrib-qunit');
	//grunt.loadNpmTasks('grunt-contrib-jshint');
	//grunt.loadNpmTasks('grunt-bower-task');  
	grunt.loadNpmTasks('grunt-contrib-concat');  
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    // Ĭ��ִ�е�����
    //grunt.registerTask('default', ['jshint','concat','uglify', 'cssmin']);
	grunt.registerTask('default', ['concat','uglify', 'cssmin']);

};