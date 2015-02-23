module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= pkg.version %> */\n'
            },
            build: {
                src: 'build/amoeba.io.js',
                dest: 'build/amoeba.io.min.js'
            }
        },
        browserify: {
            dist: {
                files: {
                    'build/amoeba.io.js': ['lib/*.js'],
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    // Default task(s).
    grunt.registerTask('default', ['browserify', 'uglify']);

};
