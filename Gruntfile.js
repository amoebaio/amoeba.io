module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
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
    grunt.registerTask('default', ['assemble']);
};
