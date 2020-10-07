// add your CLI-specific functionality here, which will then be accessible
// to your commands
const service = require('service-systemd');
const shell = require('shelljs')
const path = require('path')
const packageJson = require(path.join(__dirname, '../..', 'package.json'))

module.exports = toolbox => {
  /**
   * @param {boolean} - reinstallService
   */
  toolbox.init = async (reinstallService = true) => {
    const {
      filesystem
    } = toolbox
    filesystem.dir('/var/www/html/csycms/'); // data directory
    // filesystem.dir('/var/www/html/csycms/content'); // data directory
    filesystem.dir('/var/www/html/csycms/themes');
    filesystem.dir('/var/www/html/csycms/templates');
    filesystem.dir('/var/www/html/csycms/public');
    filesystem.dir('/etc/csycms/sites-available');  // config directory
    filesystem.dir('/etc/csycms/sites-enabled');  // config directory
    filesystem.dir('/usr/share/csycms/data'); 
    filesystem.dir('/usr/share/csycms/bin');

    await toolbox.pullTheme(true, 'default');

    let serviceExists = await shell.exec(`systemctl status csycms`)
    if (serviceExists.stderr.includes('could not be found')) {
      serviceExists = false
    } else {
      serviceExists = true
    }

    if (serviceExists && reinstallService) {
      try {
        await service.remove('csycms')
        toolbox.print.success('csycms.service removed removed')
      } catch (error) {
        toolbox.print.error('csycms.service not removed. Maybe it does not exist', error.toString())
      }
    }
    let cyscmsLocation = await shell.exec(`which csycms`).stdout.split('/');
    cyscmsLocation.splice(-1).join('/')
    cyscmsLocation = cyscmsLocation.join('/')
    if (reinstallService || !serviceExists) {
      try {
        await service.add({
          "name": "csycms",
          "description": "csycms",
          "cwd": `${cyscmsLocation}`,
          "user": "root",
          "group": "root",
          "app": "csycms",
          "app.args": "run",
          "engine": "node",
          "engine.bin": "/usr/bin/node",
          "log": "/var/log/csycms/access.log",
          "error": "/var/log/csycms/error.log",
          "logrotate": true
        })
        toolbox.print.success('csycms.service created')
      } catch (error) {
        toolbox.print.error('Failed to create csycms.service', error)
      }
    }
    await toolbox.saveSystemConfig();
    shell.exec(`systemctl start csycms`)
  }

}