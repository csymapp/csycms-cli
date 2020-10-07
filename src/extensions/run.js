const { fork } = require("child_process")
const path = require("path")
const udp = require('dgram');
const events = require('events');
const eventEmitter = new events.EventEmitter();

module.exports = toolbox => {
  toolbox.run = async () => {
    let sites = await toolbox.listSites(false)
    let siteNames = Object.keys(sites);
    // remove sites that are not enabled
    siteNames = siteNames.filter(siteName => sites[siteName][0] === true)
    let tmp = {};
    siteNames.map(siteName => tmp[siteName] = sites[siteName])
    sites = JSON.parse(JSON.stringify(tmp))
    siteNames = Object.keys(sites);

    let forks = {}
    let scheduledSiteUpdates = {}

    let scheduleUpdate = (siteIdentifier, config) => {
      let siteName = siteIdentifier.replace(/:[0-9]*$/, '')
      if (config.update && config.update > 0) {
        scheduledSiteUpdates[siteIdentifier] = setInterval(() => { toolbox.pullSite(true, siteName) }, config.update * 1000) // interval in ms
      }
    }

    let unscheduleUpdate = (siteIdentifier) => {
      if (scheduledSiteUpdates[siteIdentifier]) {
        clearInterval(scheduledSiteUpdates[siteIdentifier])
        delete scheduledSiteUpdates[siteIdentifier];
      }
    }

    let monitorFork = (siteName, config) => {
      let port = config.PORT
      let siteIdentifier = `${siteName}:${port}`
      const process = fork(path.join(__dirname, '../_extensions/index.js'));
      forks[siteIdentifier] = process
      config.directory = `/var/www/html/csycms/${siteName}`
      config.content_dir = `/var/www/html/csycms/${siteName}/content`
      config.themes_dir = `/var/www/html/csycms/themes/`
      config.scheme = config.scheme ? config.scheme : 'http'
      if(config.domain === 'localhost' || config.domain.match(/[0-9]*\.[0-9]*\.[0-9]*\.[0-9]/)){
        config.domain = `${config.domain}:${port}`
      }
      config.base_url = `${config.scheme}://${config.domain}`
      config.thisYear = new Date().getFullYear();
      scheduleUpdate(siteIdentifier, config)

      process.send({ 'start': config });// config...
      eventEmitter.emit('started', siteIdentifier);
      return process;
    }

    let forkSiteProcess = async (siteName, configStdIn = {}/*, port*/) => { //add config here to the one we read from file... (1)
      let config = await toolbox.readSiteConfig(false, siteName)
      for (let key in configStdIn) {
        config[key] = configStdIn[key]
      }
      // await toolbox.fixMissingSiteDir(true, siteName, config)
      let port = config.PORT
      let siteIdentifier = `${siteName}:${port}`
      let process = monitorFork(siteName, config);
      process.on('close', (code) => {
        delete forks[siteIdentifier];
        unscheduleUpdate(siteIdentifier);
        let interval = 0;
        code === 1 ? interval = 5000 :
          code === 130 ? interval = 50 : false;
        switch (code) {
          case 1:
          case 130:
            setTimeout(() => { forkSiteProcess(siteName, config) }, interval)
            break;
        }
        let eventType;
        switch (code) {
          case 0:
            eventType = 'stopped';
            break;
          case 1:
            eventType = 'failed';
            break;
          case 130:
            eventType = 'restarted';
            break;
        }
        eventEmitter.emit(eventType, siteIdentifier);
      });
    }
    let promises = siteNames.map(forkSiteProcess)
    await Promise.all(promises)

    let server = udp.createSocket('udp4');
    server.on('message', async (msg, info) => {
      let config = JSON.parse(msg.toString())
      let port;
      if (!config.PORT) {
        let siteConfig = await toolbox.readSiteConfig(false, config.siteName)
        port = siteConfig.PORT
      } else {
        port = config.PORT
      }
      let siteName = config.siteName;
      let siteIdentifier = `${siteName}:${port}`

      let sendMessage = (msg) => {
        server.send(msg, info.port, 'localhost', () => { });
      }
      let action = config.action
      switch (action) {
        case 'start':
          if (forks[siteIdentifier] !== undefined) {
            sendMessage(JSON.stringify({ error: `${siteIdentifier} has already been started. Can't start` }))
            break;
          }
          forkSiteProcess(siteName, config)
          eventEmitter.once('started', (message) => {
            if (message === siteIdentifier) {
              let message = `${siteIdentifier} started`
              message = JSON.stringify({ success: message })
              sendMessage(message)
            }
          });
          eventEmitter.once('failed', (message) => {
            if (message === siteIdentifier) {
              let message = `${siteIdentifier} failed to start. Please check that the port is not in use, and we will keep trying.`
              message = JSON.stringify({ error: message })
              sendMessage(message)
            }
          });
          break;
        case 'restart':
          if (forks[siteIdentifier] === undefined) {
            sendMessage(JSON.stringify({ error: `${siteIdentifier} has not yet been started. Can't restart.` }))
            break;
          }
          forks[siteIdentifier].send({ "restart": 1 })
          eventEmitter.once('restarted', (message) => {
            if (message === siteIdentifier) {
              let message = `${siteIdentifier} restarted`
              message = JSON.stringify({ success: message })
              sendMessage(message)
            }
          });
          eventEmitter.once('failed', (message) => {
            if (message === siteIdentifier) {
              let message = `${siteIdentifier} failed to start. Please check that the port is not in use, and we will keep trying.`
              message = JSON.stringify({ error: message })
              sendMessage(message)
            }
          });
          break;
        case 'stop':
          if (forks[siteIdentifier] === undefined) {
            sendMessage(JSON.stringify({ error: `${siteIdentifier} has not yet been started. Can't stop.` }))
            break;
          }
          forks[siteIdentifier].send({ "stop": 1 })
          eventEmitter.once('stopped', (message) => {
            if (message === siteIdentifier) {
              let message = `${siteIdentifier} stopped`
              message = JSON.stringify({ success: message })
              sendMessage(message)
            }
          });
          break;
        case 'running':
          let runningSitePorts = [];
          for (let siteIdentifierInner in forks) {
            let runningSiteName = siteIdentifierInner.replace(/:[0-9]*$/, '');
            if (runningSiteName === siteName) {
              runningSitePorts.push(siteIdentifierInner)
            }
          }
          sendMessage(JSON.stringify({ success: runningSitePorts }))
          break;
      }
    });
    let sysConfig = await toolbox.readSystemConfig()
    server.on('listening', function () {
      let address = server.address();
      let port = address.port;
      let family = address.family;
      let ipaddr = address.address;
      console.log('Server is listening at port' + port);
      console.log('Server ip :' + ipaddr);
      console.log('Server is IP4/IP6 : ' + family);
    });
    server.on('close', function () {
      console.log('Socket is closed !');
    });
    server.bind(sysConfig.PORT);

    if (sysConfig.update && sysConfig.update > 0) {
      toolbox.sysUpdate()
      setInterval(() => { toolbox.sysUpdate() }, parseInt(sysConfig.update) * 1000)// * 10000
    }
  }
}