// const chalk = require('chalk'),
//   figlet = require('figlet'),
//   shell = require('shelljs'),
//   NginxConfFile = require('nginx-conf').NginxConfFile;
const to = require("await-to-js").to

let description = 'csycms site --action\nSite actions:\n--list list sites.\n--create Create a new Site. -n "site name" -d sitedomain -p PORT [-r siteRepository -d sitedomain -D remove documentation]\n--enable  -n "site name" Enable  site\n--disable  -n "site name" Disable site.\n--exists  -n "site name" Check if site exists.\n--remote:\n\t--add -N <name> -u <url>\n\t--remove -N <name>\n\t-v equivalent to git remote -v\n--rename  -n <site name> -N <new name>\n--delete  -n <site name>\n--duplicate  -n <site name> -d <destination>\n--pull  -n <site name>\n--sync  -n <site name> -m <message>\n--config  -n <site name>\n--start -n <site name> -p <PORT> -u <Update interval>. Don\'t use in development.\n\tIf port is not supplied, it uses the port in config file\n--stop -n <site name> -p <PORT> Provide either port or site name. If port is not supplied, it uses the port in config file\n--restart -n <site name> -p <PORT> Provide either port or site name. If port is not supplied, it uses the port in config file\n--getrunning  -n <site name> Get all ports on which site is being served.'

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
    // list sites. From where...
    // 
    // 1. clone site (if it does not exist)
    // console.log(toolbox.parameters)

    // console.log(NginxConfFile)

    // NginxConfFile.create('/etc/nginx/nginx.conf', function (err, conf) {
    //   if (err) {
    //     console.log(err);
    //     return;
    //   }

    //   //reading values
    //   console.log(conf.nginx.user._value); //www www
    //   console.log(conf.nginx.http.server); //one.example.com
    //   // console.log(conf.nginx.http.server.listen._value); //one.example.com

    //   //if there is more than one directive in a scope (e.g. location), then
    //   //you access them via array index rather than straight property access
    //   console.log(conf.nginx.http.server.location[3].root._value); // /spool/www

    //writing values
    //NginxConfFile.create() automatically sets up a sync, so that whenever
    //a value is changed, or a node is removed/added, the file gets updated
    //immediately

    // })
    // process.exit();
    // console.log(
    //   chalk.cyan(figlet.textSync('Initializing..', {
    //     horizontalLayout: 'full'
    //   }))
    // )
    // await toolbox.init();



    // shell.exec('sudo apt-get update --assume-yes')
    // // nginx
    // shell.exec('sudo apt install nginx --assume-yes')
    // // certbot
    // shell.exec('sudo apt-get install software-properties-common --assume-yes')
    // shell.exec('sudo add-apt-repository universe --assume-yes')
    // shell.exec('sudo add-apt-repository ppa:certbot/certbot --assume-yes')
    // shell.exec('sudo apt-get update --assume-yes')
    // shell.exec('sudo apt-get install certbot python3-certbot-nginx --assume-yes')
    // shell.exec('systemctl start csycms')
  }
}

module.exports = command