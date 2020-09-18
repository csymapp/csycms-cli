

const command = {
  name: 'init',
  alias: 'i',
  description: 'Run this after csycms installation (npm install -g csycms) to:\n1. create csycms directories  in /var/www/html/csycms/ and /etc/csycms \n2.recreate csycms service file in /etc/systemd/system/csycms.service \n3. Start csycms service',
  run: async toolbox => {
    // shell.exec('systemctl start csycms')
    await toolbox.init();
  }
}

module.exports = command