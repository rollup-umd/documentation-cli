const fs = require('fs');
const { spawn: spawnDefault, exec: execDefault } = require('child_process');

const exec = (command, cb) => {
  execDefault(command, {
    maxBuffer: 1024 * 1024,
  }, cb);
};
const spawn = (command, cb) => {
  const split = command.split(' ');
  const program = split[0];
  const args = split.slice(1);
  const child = spawnDefault(program, args || []);
  const outputList = [];
  child.stdout.setEncoding('utf8');
  child.stderr.setEncoding('utf8');
  child.stdout.on('data', (data) => outputList.push(data) && console.log(data.replace(/\n$/, '')));
  child.stderr.on('data', (data) => outputList.push(data) && console.log(data.replace(/\n$/, '')));
  child.on('close', (code) => code === 1 ? cb(new Error(`child process exited with code ${code}`, [outputList.join('')])) : cb(null, [outputList.join('')]));
};

const sedReplace = (input, before, after, output, cb = () => {}) => {
  const file = fs.readFileSync(input, 'utf8');
  const re = new RegExp(escapeRegExp(before), 'gm');
  const newFile = file.replace(re, after);
  fs.writeFileSync(output, newFile, 'utf8');
  cb();
};

function escapeRegExp(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

module.exports = {
  exec,
  spawn,
  sedReplace,
};
