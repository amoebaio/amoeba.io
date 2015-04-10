module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jsdoc: {
            dist: {
                src: ['../amoeba.io/lib/*.js'],
                options: {
                    destination: 'api'
                }
            }
        },
        assemble: {
            options: {
                layout: "default.hbs",
                layoutdir: 'src/layouts',
                data: 'src/data/*.json',
                flatten: true
            },
            pages: {
                files: {
                    '.': ['src/pages/*.hbs']
                }
            },
            demos: {
                files: {
                    '.': ['src/demos/*.hbs']
                }
            },
            docs: {
                options: {
                    layout: 'docs.hbs'
                },
                files: {
                    '.': ['src/docs/*.hbs']
                }
            },

        }
    });
    grunt.loadNpmTasks('assemble');
    grunt.loadNpmTasks('grunt-jsdoc');

    grunt.registerTask('default', ['jsdoc', 'assemble']);
};
