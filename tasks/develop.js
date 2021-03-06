
/*!
 *
 * grunt-develop
 * http://github.com/edwardhotchkiss/grunt-develop
 *
 * Copyright (c) 2013 Edward Hotchkiss
 * Licensed under the MIT license.
 *
 */

'use strict';

module.exports = function(grunt) {

  var child
    , fs = require('fs')
    , util = require('util');

  // kills child process (server)
  grunt.event.on('develop.kill', function() {
    grunt.log.warn('\nrestarting server');
    child.kill('SIGHUP');
  });

  // watches server and broadcasts restart on change
  grunt.event.on('develop.watch', function(filename) {
    fs.watchFile(filename, { interval: 250 }, function(change) {
      grunt.log.warn('\nfile changed');
      grunt.event.emit('develop.kill');
    });
  });

  // starts server
  grunt.event.on('develop.start', function(filename) {
    if (child && !child.killed) {
      return grunt.event.emit('develop.kill');
    }
    child = grunt.util.spawn({
      cmd: process.argv[0],
      args: [filename]
    }, function (error, result, code) {
      grunt.event.emit('develop.start', filename);
    });
    grunt.log.ok(util.format('succesfully started server "%s".', filename));
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', function(data) {
      grunt.log.write(data);
    });
    child.stderr.on('data', function(data) {
      grunt.log.write(data);
    });
    child.on('exit', function(code, signal) {
      grunt.log.warn(util.format('server exited with: "%s"', signal));
    });
    grunt.event.emit('develop.watch', filename);
  });

  // TASK. perform setup
  grunt.registerMultiTask('develop', 'init', function() {
    var done, filename = this.data.file;
    if (!grunt.file.exists(filename)) {
      grunt.fail.warn(util.format('server file "%s" not found!', filename));
      return false;
    }
    done = this.async();
    grunt.event.emit('develop.start', filename);
    done();
  });

};

/* EOF */