module.exports = function(grunt) {
    grunt.initConfig({
        jshint: {
            all: ['lib/*.js', 'test/*.js', 'Gruntfile.js']
        }
    });
    grunt.loadNpmTasks('grunt-contrib-jshint');
    var tag = grunt.option('target') || 'dev';
    grunt.registerTask('default', function() {
        var cheerio = require('cheerio');
        var htmlContext=grunt.file.read("index2.html");
        $ = cheerio.load(htmlContext);
        $('img').each(function() {
			var alt = $(this).attr('alt');
			var href = $(this).attr('href');
			var desired = alt.replace(/[^\w\s]/gi, '');
			
			var isnum = /^\d+$/.test(href);

			if (isnum) {	
				$(this).attr('href', function(i,v) {
					var cat = href.match(/^\d+$/).toString();
					return "${catUrl}" + href +'&${cm_re}'+ cat + ':' + desired;
				})

			}
			else if(href.indexOf('?') == -1) {
				$(this).attr('href', href + '?${cm_re}:'+ desired);
			}
			else if(href.indexOf('?') != -1) {
				$(this).attr('href', href + '&${cm_re}:'+ desired);
			}			
		})
		grunt.file.write("test.html", $.html());
        //grunt.log.write('Logging some stuff...'+grunt.config.process("jshint")).ok();
        
    });
}