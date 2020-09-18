async function runSite(config) {
    let sendMails = 0;
    // logic for
    // sending multiple mails
    // console.log(config)
    // console.log(config)
    // console.log(config)
    if(config.PORT===8799){
        console.log('gona exit.....')
        process.exit(1)
    }
    console.log('has JUST ++++++++++++++++++++++++++++++++')
    return sendMails;
}
// receive message from master process
process.on('message', async (message) => {
    if (typeof message !== 'object') {
        process.send({ error: 'wrong message type received' });
    }
    let messageType = Object.keys(message)[0];
    let messageTime = parseInt(message[messageType]) || 0
    let code = -1;
    switch (messageType) {
        case 'stop':
        case 'exit':
            code = 0;
            break;
        case 'restart':
            code = 130;
            break;
        case 'start':
            await runSite(message[messageType]);
            break;
    }
    if (code !== -1) {
        setTimeout(() => { process.exit(code) }, messageTime)
    }
});


'use strict';

const yargs = require("yargs")
  , argv = yargs.argv
  , site = argv.SITE || process.env.SITE



// Finally, we initialize csycms
// with our configuration object

// Load the HTTP Server
// let server = app.listen(app.get('port'), function () {
//   console.log('Express HTTP server listening on port ' + server.address().port);
// });


// let csycms = require('csycms-core-test');
// let csycms = require('../app/index.js');
// let csycms = require('csycms-core-test');

// Then, we load our configuration file
// This can be done inline, with a JSON file,
// or with a Node.js module as we do below.
// let config = require(`csycms-core/functions/config`)(site);
// let config = require(`csycms-core/functions/config`)(site);
// let config = require(`../config/${site}/system.config.js`)(__dirname);


// Finally, we initialize csycms
// with our configuration object
// let app = csycms(config);

// // Load the HTTP Server
// let server = app.listen(app.get('port'), function () {
//   console.log('Express HTTP server listening on port ' + server.address().port);
// });



// const process = fork(path.join(__dirname, '../_extensions/index.js'));
    // // const mails = request.body.emails;
    // // send list of e-mails to forked process
    // process.send({ 'mails': 'ashdkash' });
    // // listen for messages from forked process
    // process.on('message', (message) => {
    //   console.log(`Number of mails sent ${message.counter}`);
    // });
    // the threads are here...

    // let promises = siteNames.map(siteName => toolbox.readSiteConfig(false, siteName))
    // let [err, care] = await to(Promise.all(promises));
    // console.log(err)
    // console.log(care)
    /**
     * configure in yaml files...
     * commands:
     *  - create
     * ---- from scratch, from uploaded documents...
     *  domain::, port, 
     * PORT=$PORT SITE=$SITE node bin/app.js --SITE=$SITE 
     * - destroy
     * - configure
     * - upload
     * - download...
     */
    // return new Promise((resolve, reject) => {
    //   setInterval(function () { console.log('RUNNING'); }, 1000)
    // })