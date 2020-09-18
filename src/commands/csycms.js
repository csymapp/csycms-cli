const chalk = require('chalk'),
  figlet = require('figlet')

const command = {
  name: 'csycms',
  run: async toolbox => {
    console.log(
      chalk.cyan(figlet.textSync('csycms', { horizontalLayout: 'full' }))
    )
    const { printHelp } = toolbox.print
    printHelp(toolbox)
  }
}

module.exports = command
