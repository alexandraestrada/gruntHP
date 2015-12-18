var cheerio = require('cheerio');
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
            // dynamic: {
            //     options: {
            //         optimizationLevel: 5
            //     }, // Another target
            //     files: [{
            //         expand: true, // Enable dynamic expansion
            //         cwd: '<%=watch.src%>/', // Src matches are relative to this path
            //         src: ['**/*.{png,jpg,gif}'], // Actual patterns to match
            //         dest: '<%=watch.src%>/' // Destination path prefix
            //     }]
            // }
            dynamic: {                         // Another target
                 files: [{
                   expand: true,                  // Enable dynamic expansion
                   cwd: '<%=watch.src%>/',                   // Src matches are relative to this path
                   src: ['**/*.{png,jpg,gif}'],   // Actual patterns to match
                   dest: '<%=watch.src%>/'                  // Destination path prefix
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
    grunt.registerTask('hpCoremetrics', function() {


        var htmlContext = grunt.file.read(grunt.config.get("watch.src")+"/index.html");
        $ = cheerio.load(htmlContext);

        $('area').each(function() {
            var alt = $(this).attr('alt').replace(/[^\w\s]/gi, '');
                href = $(this).attr('href'),
                baseReplace = "${baseUrl}",
                isBaseUrl = /(http(s)?:\/\/(?=.macys.com))|(www(?=.macys.com))|(www1(?=.macys.com))/.test(href),
                isnum = /^\d+$/.test(href),
                isStandardUrl = /standard/.test(href),
                hasHash = /#/.test(href),
                cmTag = "?${cm_re}:",
                isEmptyLink = /href=""/.test($(this));

            if (isnum) {
                var numberString = $(this).attr('href').toString()
                if (numberString.length <=5) {
                    $(this).attr('href', '${catUrl}' + href +'&${cm_re}'+ numberString + ':' + alt);
                }
                else {
                    $(this).attr('href', "javascript:pop('${baseUrl}/popup.ognc?popupID=" + numberString + "&${cm_re}:exclusions and details','myDynaPop','scrollbars=yes,width=365,height=600')");
                }

            }
            else if(isBaseUrl) {
                 $(this).attr('href',href.replace(/(http(s)?:\/\/)?(www)?1?.?macys.com/, baseReplace));
                 href = $(this).attr('href')
                 href.indexOf('?') === -1 ? $(this).attr('href', href +'?${cm_re}:'+ alt) : $(this).attr('href', href + '&${cm_re}:'+ alt)
            }
            else if(isStandardUrl) {
                $(this).attr('href', function(i, v) {
                     alt = alt.replace(/\s+/g, '');
                     return '${' + alt + '_SL}'

                })
            }
            else if(isEmptyLink) {
                var comment = '<!-- missing link here! -->'
                $(this).prepend(comment)

            }
            else if(hasHash) {
              var hashIndex = href.indexOf("#");
              var startString = href.slice(0, hashIndex);
              var endString = href.slice(hashIndex);
              $(this).attr('href', startString + cmTag + alt + '/' + endString)
            }
            else {
                 href = $(this).attr('href');
                href.indexOf('?') === -1 ? $(this).attr('href', href +'?${cm_re}:'+ alt) : $(this).attr('href', href + '&${cm_re}:'+ alt)
            }
        })
        grunt.file.write(grunt.config.get("watch.src")+"/updated.html", $.html());

    });
    grunt.registerTask('grunt-check', function() {
        var htmlContext = grunt.file.read(grunt.config.get("watch.src")+"/updated.html");
        $ = cheerio.load(htmlContext);

        var completeComment = '<!-- Grunt has run successfully -->'
        $('body').append(completeComment);
        console.log(completeComment)
        grunt.file.write(grunt.config.get("watch.src")+"/updated.html", $.html() );
    });

    grunt.registerTask('spell-check', function() {
        var htmlContext = grunt.file.read(grunt.config.get("watch.src")+"/index.html");
        $ = cheerio.load(htmlContext);
        var imageAlt = "";
        var areaAlt = "";
        $('img').each(function() {
            imageAlt = imageAlt + $(this).attr('alt') + '\n'
        });
        $('area').each(function() {
            imageAlt = imageAlt + $(this).attr('alt') + '\n'
        });
        grunt.file.write(grunt.config.get("watch.src")+"/index.txt", imageAlt,areaAlt );
    })

    grunt.registerTask('homepage', function(val) {
    grunt.config.set('watch.src', val);
    // grunt.task.run('imagemin');
    grunt.task.run('hpCoremetrics');
    grunt.task.run('grunt-check');

    grunt.task.run('spell-check');
    grunt.task.run('spell');



  });
}
