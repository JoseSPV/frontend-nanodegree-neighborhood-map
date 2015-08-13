module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jsdoc : {
        dist : {
            src: ['dist/js/app.js','dist/js/viewmodel.js','dist/js/custom-bindings.js'],
            options: {
                destination: 'doc'
            }
        }
    },
    clean: {
      dist: {
        src: ['dist/']
      },
      css: {
        src: [ 'dist/css/*.css', '!dist/css/<%= pkg.name %>.min.css' ]
      },
      js: {
        src: [ 'dist/js/*.js', '!dist/js/<%= pkg.name %>.min.js', '!dist/js/app.min.js' ]
      }
    },
    copy: {
      main: {
          files: [
              {expand: true, src: ['**'], dest: 'dist/', cwd: 'src/'},
          ]
      }
    },
    concat: {
      js: {
            src: ['dist/js/jquery-2.1.4.min.js','dist/js/bootstrap.min.js','dist/js/knockout.js','dist/js/viewmodel.min.js','dist/js/custom-bindings.min.js'],
            dest: 'dist/js/<%= pkg.name %>.min.js',
      },
      css: {
          src: ['dist/css/bootstrap.min.css','dist/css/style.min.css'],
          dest: 'dist/css/<%= pkg.name %>.min.css'
      }
    },
    uglify: {
      js: {
        files: {
            'dist/js/viewmodel.min.js': 'dist/js/viewmodel.js',
            'dist/js/custom-bindings.min.js': 'dist/js/custom-bindings.js',
            'dist/js/app.min.js': 'dist/js/app.js'
        },
        options: {
          banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
        }
      },
    },
    cssmin: {
      css: {
        files: {
            'dist/css/style.min.css': 'dist/css/style.css',
            'dist/css/bootstrap.min.css': 'dist/css/bootstrap.css'
        },
        options: {
          banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
        }
      }
    },
    htmlmin: {
      html: {
        src: ['dist/index.html'],
        dest: 'dist/index.html',
        options: {
          removeComments: true,
          collapseWhitespace: true
        },
      }
    },
    jshint: {
      files: ['src/js/app.js','src/js/viewmodel.js','src/js/custom-bindings.js'],
      options: {
        globals: {
          jQuery: true,
          console: true,
          module: true
        }
      }
    },
    imagemin: {
      dynamic: {
        files: [{
          expand: true,
          cwd: 'dist/images/',
          src: ['**/*.{png,jpg,gif}'],
          dest: 'dist/images/'
        }]
      }
    },
    processhtml: {
      dist: {
          files: {
             'dist/index.html': ['dist/index.html']
          }
      }
    },
    'ghpages': {
      options: {
        base: 'dist',
        branch: 'master',
        message: 'Updated from GRUNT'
      },
      src: ['**']
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint']
    }
  });

  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-processhtml');

  grunt.registerTask('deploy', ['ghpages']);
  grunt.registerTask('default', ['jshint','clean:dist','copy','jsdoc','uglify','cssmin','concat','processhtml','htmlmin','imagemin','clean:css','clean:js']);

};