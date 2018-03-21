'use strict';

const EventEmitter = require('events');
const {fork} = require('child_process');
const fs = require('fs-extra');
const tempy = require('tempy');

const VM = fs.readFileSync(`${__dirname}/vm.js`, 'utf8');

function Worker(script, cwd) {
  const emitter = new EventEmitter();

  const path = tempy.file({name: 'code.js'});
  const code = VM.replace('/* CODE */', script);
  fs.writeFileSync(path, code);
  const child = fork(path, {windowsHide: true, cwd});

  child.on('message', async message => {
    if (message.event === 'error') {
      const err = new Error('unable to execute');
      err.stack = `${err.stack}\nCaused By: ${message.error.stack}`;
      emitter.emit(message.event, err);
    } else if (message.event === 'after') {
      emitter.emit(message.event, message.start, message.end);
    } else {
      emitter.emit(message.event);
    }
  });

  child.on('error', error => {
    const err = new Error('unable to execute');
    err.stack = `${err.stack}\nCaused By: ${error.stack}`;
    emitter.emit('error', err);
  });

  emitter.pid = () => child.pid;
  emitter.run = () => {
    child.send({event: 'run'});
  };
  emitter.kill = () => {
    child.kill();
  };
  return emitter;
}

module.exports = Worker;
