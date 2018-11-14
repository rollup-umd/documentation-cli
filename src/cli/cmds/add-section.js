/* eslint-disable no-undef, no-param-reassign, global-require, no-unused-vars, no-console, no-underscore-dangle, prefer-destructuring */
const path = require('path');
const fs = require('fs');

exports.command = ['add-section', 'section'];
exports.desc = 'Add a section to section/styleguide.ext.json';
exports.builder = (yargs) => yargs
  .option('name', {
    alias: 'n',
    describe: 'name of the section.',
  })
  .option('content', {
    alias: 'c',
    describe: 'location of the markdown file.',
  })
  .option('before', {
    alias: 'b',
    describe: 'append before the section with name.',
  })
  .option('after', {
    alias: 'a',
    describe: 'append after the section with name.',
  })
  .option('collapsed', {
    describe: 'If true, the content will be collapsed in a details tag.',
    default: false,
  })
  .option('force', {
    alias: 'f',
    describe: 'If the file does already exist, it will be overwritten.',
    default: false,
  })
  .option('path', {
    alias: 'p',
    describe: 'path',
    default: process.cwd(),
  });
exports.handler = (argv) => {
  switch (argv.path[0]) {
    case '/':
      break;
    default:
      argv.path = argv.path[1] === '/' ? path.join(process.cwd(), argv.path.slice(2)) : path.join(process.cwd(), argv.path);
      break;
  }
  const configPath = path.join(argv.path, 'styleguide/styleguide.ext.json');
  const config = require(configPath);

  const {
    before, after, name, content, collapsed, force,
  } = argv;
  const section = {
    name,
    content,
  };

  let previousInd;
  config.sections.forEach((s, m) => {
    if (s.name.toLowerCase() === name.toLowerCase()) {
      if (force) {
        previousInd = m;
      } else {
        throw new Error(`Section with name ${name} already exist!`);
      }
    }
  });

  const filePath = path.join(argv.path, content);
  if (!fs.existsSync(filePath)) {
    throw new Error(`File cannot be found at location ${filePath}.`);
  }
  let fileContent = fs.readFileSync(filePath, { encoding: 'utf8' });
  if (collapsed && fileContent.split('\n')[0] !== '<details>') {
    fileContent = `<details>
<summary>View ${name}</summary>
<p>

${fileContent}

</p>
</details>`;
    fs.writeFileSync(filePath, fileContent, { encoding: 'utf8' });
  }

  if (before && after) {
    throw new Error('You cannot use --before and --after together.');
  }

  let pos;
  const compare = before || after;
  if (compare) {
    config.sections.forEach((s, i) => {
      if (s.name.toLowerCase() === compare.toLowerCase()) {
        pos = i;
      }
    });
  }

  if (!previousInd) {
    if ((before || after) && !pos) {
      throw Error(`Section with name "${name}" can't be found!`);
    }
  } else if (previousInd && pos) {
    throw Error(`Can't move existing section with name "${name}", remove --before or --after first!`);
  }

  if (previousInd) {
    config.sections[previousInd] = section;
  } else if (before) {
    config.sections = config.sections.slice(0, pos).concat([section]).concat(config.sections.slice(pos));
  } else if (after) {
    config.sections = config.sections.slice(0, pos + 1).concat([section]).concat(config.sections.slice(pos + 1));
  } else {
    config.sections.push(section);
  }

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), { encoding: 'utf8' });
};
