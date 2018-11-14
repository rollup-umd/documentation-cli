#!/usr/bin/env node
// eslint-disable-next-line no-unused-expressions
require('yargs').commandDir('cmds')
  .demandCommand()
  .help()
  .wrap(100)
  .epilog('Copyright 2018. Yeutech Company Limited.')
  .argv;
