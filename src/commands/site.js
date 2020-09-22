// const chalk = require('chalk'),
//   figlet = require('figlet'),
//   shell = require('shelljs'),
//   NginxConfFile = require('nginx-conf').NginxConfFile;
const to = require("await-to-js").to

let description = 'csycms site --action\nSite actions:\n--list [-s split the list -n show only site names].\n--create Create a new Site. -n <site name> -p <PORT> [-r <siteRepository> -d <sitedomain> -D remove documentation]\n--enable  -n <site name> Enable  site\n--disable  -n <site name> Disable site. Stops if running.\n--exists  -n <site name> Check if site exists.\n--remote:\n\t--add -N <name> -u <url>\n\t--remove -N <name>\n\t-v equivalent to git remote -v\n--rename  -n <site name> -N <new name> Rename site.\n--delete  -n <site name> Delete site. Stops if running.\n--duplicate  -n <site name> -d <destination> Copy site instead of creating from scratch.\n--pull  -n <site name> Pull from repo.\n--sync  -n <site name> -m <message> Commit and push to repo.\n--config  -n <site name> Edit site config values.\n--start -n <site name> -p <PORT> -u <Update interval in secs. Don\'t use in development.>\n\tIf port is not supplied, it uses the port in config file\n\tWill start disabled sites for development.\n--stop -n <site name> -p <PORT> Provide either port or site name. If port is not supplied, it uses the port in config file\n--restart -n <site name> -p <PORT> Provide either port or site name. If port is not supplied, it uses the port in config file\n--getrunning  -n <site name> Get all ports on which site is being served.'

const command = {
  name: 'site',
  description: description,
  run: async toolbox => {
    let action = ''
    try {
      action = toolbox.parameters.argv[3].replace(/^--/, '');
    } catch (err) {
      action = err
    }
    switch (action) {
      case "new":
      case "create":
        await toolbox.createSite();
        break;
      case "list": /** */
        await toolbox.listSites(true);
        break;
      case "enable": /** */
        await toolbox.enableSite();
        break;
      case "disable":/** */
        await toolbox.disableSite();
        break;
      case "exists":/** */
        await toolbox.siteExists(true);
        break;
      case "remote":/** */
        await toolbox.siteRemote(true);
        break;
      case "rename":/** */
        await toolbox.renameSite(true);
        break;
      case "duplicate":/** */
      case "copy":/** */
        await toolbox.copySite(true);
        break;
      case "drop":/** */
      case "delete":/** */
      case "remove":/** */
        await toolbox.deleteSite(true);
        break;
      case "pull":/** */
        await toolbox.pullSite(true);
        break;
      case "readconfig":/** */
        await toolbox.readSiteConfig(true);
        break;
      case "sync":/** */
      case "push":/** */
        await toolbox.syncSite(true);
        break;
      case "config":/** */
        await toolbox.configSite(true);
        break;
      case "start":/** */
        await to(toolbox.startSite(true));
        break;
      case "stop":/** */
        await toolbox.stopSite(true);
        break;
      case "running":/** */
      case "getrunning":/** */
        await toolbox.getRunning(true);
        break;
      case "restart":/** */
        await toolbox.restartSite(true);
        break;
      default:
        return toolbox.print.error(description)
    }
  }
}

module.exports = command