const shell = require('shelljs')
const conf = require('node-etc');
const update = require('automatic-updates');
const automaticUpdates = require('automatic-updates');


const command = {
  name: 'tester',
  description: 'testing development logic and dependencies',
  run: async toolbox => {
    // await toolbox.init(false);
    // shell.exec(`systemctl start csycms`)
    // console.log(conf.packageJson())
    automaticUpdates.init({source:'github'});
  }
}

module.exports = command
