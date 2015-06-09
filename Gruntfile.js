module.exports = function(grunt) {
    grunt.initConfig({
        watch: {
            src: '',
            files: '*.html',
            tasks: ['copy-part-of-file'],
            options: {
                nospawn: true
            }
        },
        imagemin: {
            // Task
            dynamic: {
                options: {
                    optimizationLevel: 5
                }, // Another target
                files: [{
                    expand: true, // Enable dynamic expansion
                    cwd: '<%=watch.src%>/', // Src matches are relative to this path
                    src: ['**/*.{png,jpg,gif}'], // Actual patterns to match
                    dest: '<%=watch.src%>/' // Destination path prefix
                }]
            }
        },
        spell: {
          files: '<%=watch.src%>/index.txt'
        }
    });
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.loadNpmTasks('grunt-spell');

    var tag = grunt.option('target') || 'dev';
    grunt.registerTask('coremetrics', function() {
        var cheerio = require('cheerio');
       
        var htmlContext = grunt.file.read(grunt.config.get("watch.src")+"/index2.html");
        $ = cheerio.load(htmlContext);
       
        $('area').each(function() {
            var alt = $(this).attr('alt');
            var href = $(this).attr('href');
            var desired = alt
            var baseReplace = "${baseUrl}";
            var isBaseUrl = /(http(s)?:\/\/)?(www)?1?.?macys.com/.test(href)  
            var isnum = /^\d+$/.test(href);
            var isStandardUrl = /standard/.test(href)
            
            if (isnum) {    
                var numberString = $(this).attr('href').toString()
                if (numberString.length <=5) {
                    $(this).attr('href', '${catUrl}' + href +'&${cm_re}'+ numberString + ':' + desired)
                }
                else {
                    $(this).attr('href', "javascript:pop('${baseUrl}/popup.ognc?popupID=" + numberString + "&${cm_re}:exclusions and details','myDynaPop','scrollbars=yes,width=365,height=600')")
                }

            }
            else if(isBaseUrl) {     
                 $(this).attr('href',href.replace(/(http(s)?:\/\/)?(www)?1?.?macys.com/, baseReplace));
                 href = $(this).attr('href')  
                 href.indexOf('?') === -1 ? $(this).attr('href', href +'?${cm_re}:'+ desired) : $(this).attr('href', href + '&${cm_re}:'+ desired)  
            } 
            else if(isStandardUrl) {
                $(this).attr('href', function(i, v) {
                     desired = desired.replace(/\s+/g, '');
                     return '${' + desired + '_SL}'

                })
            }   
            else {
                 href = $(this).attr('href');
                href.indexOf('?') === -1 ? $(this).attr('href', href +'?${cm_re}:'+ desired) : $(this).attr('href', href + '&${cm_re}:'+ desired)
            }                   
        })
        grunt.file.write(grunt.config.get("watch.src")+"/test.html", $.html());
        //grunt.log.write('Logging some stuff...'+grunt.config.process("jshint")).ok();

    });
    
    grunt.registerTask('spell-check', function() {
        var cheerio = require('cheerio');
        var htmlContext = grunt.file.read(grunt.config.get("watch.src")+"/index2.html");
        $ = cheerio.load(htmlContext);
        var imageAlt = "";
        $('img').each(function() {
            imageAlt = imageAlt + $(this).attr('alt') + '\n'
        })
        grunt.file.write(grunt.config.get("watch.src")+"/index.txt", imageAlt );
   


    })

    grunt.registerTask('unitTesting', function(val) {
    console.log(val);
    grunt.config.set('watch.src', val);
    grunt.task.run('imagemin'); 
    grunt.task.run('coremetrics');
    grunt.task.run('spell-check')
    grunt.task.run('spell');
    //grunt.task.run('watch'); 


  
  });
}