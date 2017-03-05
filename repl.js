/**
 * Mavericks REPL
 * Copyright(c) 2015 Koreviz
 */
const repl = require('repl')

class Repl {
  constructor() {
    repl.start({
      prompt: 'mavericks> ',
      input: process.stdin,
      output: process.stdout,
      useColors: true
    })
  }
}

module.exports = () => {
  return new Repl()
}