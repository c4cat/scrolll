module.exports=function(grunt){

    require('time-grunt')(grunt);
    
    grunt.initConfig({
        paths:{
            css:'./static/css/', 
            js:'./static/js'
        },
        buildType:'Build',

        pkg: grunt.file.readJSON('package.json'),
        //ur name
        archive_name: grunt.option('name') || 'ugly',
        // connect
        concat: {  
            dist: {  
              src: './js/*.js',  
              dest: './static/js/main.js' 
            },
        }, 
        less: {
          production: {
            options: {
              paths: ["./static/css"],
              cleancss: true
            },
            files: {
              "./static/css/less.css": "./static/css/less.less"
            }
          }
        },
        connect:{
            server:{
                options:{
                    port:5177,
                    //base:'html/', //use "html"
                    base:'./',
                    hostname:'*' //default,localhost
                }
            }
        },

        watch:{
            options:{
                //开启 livereload
                livereload:true,
                //显示日志
                dateFormate:function(time){
                    grunt.log.writeln('编译完成,用时'+time+'ms ' + (new Date()).toString());
                    grunt.log.writeln('Wating for more changes...');
                }
            },
            css:{
                files:'<%= paths.css %>/**/*.less',
                tasks:['less']
            },
            js:{
                 files:'./js/*.js',
                 tasks:['concat']
            },
            html:{
                files:'*.html'
            }
        }

    });

    //output log
    grunt.event.on('watch', function(action, filepath, target) {
      grunt.log.writeln(target + ': ' + '*file*: '+filepath + '*staus*: ' + action);
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-less');

    grunt.registerTask('default', []);
    grunt.registerTask('live', 'Start a custom static web server.',['connect','watch']);

};
