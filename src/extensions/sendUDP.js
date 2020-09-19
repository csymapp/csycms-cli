const udp = require('dgram');

module.exports = toolbox => {
  toolbox.sendUDP = async (config, immediate = false) => {
    return new Promise(async (resolve, reject) => {
      console.log(`Going to ${config.action} ${config.siteName} ${config.PORT ? `at port ${config.PORT}` : 'at default port'}`)
      let client = udp.createSocket('udp4');
      config = Buffer.from(JSON.stringify(config));

      let timeOut;
      client.on('message', (msg, info) => {
        msg = JSON.parse(msg.toString())
        let msgType = Object.keys(msg)[0]
        switch (msgType) {
          case 'success':
            toolbox.print.success(msg[msgType]);
            if (immediate) {
              client.close();
              clearTimeout(timeOut)
              return resolve(msg[msgType]);
            }
            break;
          case 'error':
            toolbox.print.error(msg[msgType]);
            if (!immediate) {
              process.exit();
            }
            client.close();
            clearTimeout(timeOut)
            return reject(msg[msgType]);
            break;

        }
        clearTimeout(timeOut)
        if (!immediate) {
          setTimeout(() => { process.exit(); }, 2000)
        }
      });

      //sending msg
      let sysConfig = await toolbox.readSystemConfig()
      client.send(config, sysConfig.PORT, 'localhost', function (error) {
        if (error) {
          toolbox.print.error('Uknown error encoutered while executing command')
          client.close();
        } else {
          toolbox.print.success('command sent!')
        }
        let interval = 3000;
        timeOut = setTimeout(() => {
          let errMsg = `Command timed out after ${interval}ms`
          if (!immediate) {
            toolbox.print.error(errMsg);
            process.exit();
          } else {
            clearTimeout(timeOut)
            client.close();
            reject(errMsg);
          }
        }, interval)
      });
    })
  }
}