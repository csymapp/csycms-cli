const udp = require('dgram');

module.exports = toolbox => {
  toolbox.sendUDP = async (config) => {
    console.log(`Going to ${config.action} ${config.siteName} ${config.PORT?`at port ${config.PORT}`:'at default port'}`)
    let client = udp.createSocket('udp4');
    config = Buffer.from(JSON.stringify(config));


    let timeOut;
    client.on('message', function (msg, info) {
      msg = JSON.parse(msg.toString())
      let msgType = Object.keys(msg)[0]
      switch(msgType){
        case 'success':
          toolbox.print.success(msg[msgType]);
          break;
        case 'error':
          toolbox.print.error(msg[msgType]);
          process.exit();
          break;
        
      }
      clearTimeout(timeOut)
      setTimeout(() => { process.exit(); }, 2000)
    });

    //sending msg
    client.send(config, 2222, 'localhost', function (error) {
      if (error) {
        toolbox.print.error('Uknown error encoutered while executing command')
        client.close();
      } else {
        toolbox.print.success('command sent!')
      }
      let interval = 3000;
      timeOut = setTimeout(() => { toolbox.print.error(`Command timed out after ${interval}ms`); process.exit(); }, interval)
    });
  }
}