const shell = require('shelljs');
const minify = require('minify');
const { default: to } = require('await-to-js');
const fs = require('fs')
// const escapeStringRegexp = require('escape-string-regexp')


let specials = [
    // order matters for these
    "-"
    , "["
    , "]"
    // order doesn't matter for any of these
    , "/"
    , "{"
    , "}"
    , "("
    , ")"
    , "*"
    , "+"
    , "?"
    , "."
    , "\\"
    , "^"
    , "$"
    , "|"
]

    // I choose to escape every character with '\'
    // even though only some strictly require it when inside of []
    , regex = RegExp('[' + specials.join('\\') + ']', 'g')
    ;

const escapeRegExp = function (str) {
    return str.replace(regex, "\\$&");
};

module.exports = toolbox => {
    let description = `csycms site --build  -n "site name"`
    toolbox.buildSite = async (print = true) => {
        if (
            !toolbox.parameters.options.n
        ) {
            return toolbox.print.error(description)
        }
        let siteName = toolbox.parameters.options.n
        let siteExists = await toolbox.siteExists(false, siteName);
        if (!siteExists) {
            if (print) { toolbox.print.error(`${siteName} does not exist!`) }
            return false
        }
        let siteConfig = await toolbox.readSiteConfig(false, siteName);
        let { PORT, domain, scheme, staticSiteRepo, staticSiteLocation } = siteConfig;
        if (!scheme.match(/http[s]*/)) scheme = http
        let siteUrl = `${scheme}://`
        if (domain.match(/[0-9]*\.[0-9]*\.[0-9]*\.[0-9]*/) || domain === "localhost") {
            siteUrl += `${domain}:${PORT}`
        } else siteUrl += domain;

        shell.exec(`cd /tmp && mkdir -p csycmsBuilds && cd csycmsBuilds && wget -mpEk ${siteUrl}`)
        shell.exec(`mkdir -p /var/www/html/csycms/csycmsBuilds`)
        shell.exec(`rm -rf /var/www/html/csycms/csycmsBuilds/${siteName}/docs && mkdir -p /var/www/html/csycms/csycmsBuilds/${siteName}`)
        shell.exec(`mv /tmp/csycmsBuilds/${siteUrl.replace(/http[s]*:\/\//, '')} /var/www/html/csycms/csycmsBuilds/${siteName}/docs`)
        // shell.exec(`cd /tmp && mkdir -p csycmsBuilds && cd csycmsBuilds && wget -mpEk ${siteUrl}`)
        let output = shell.exec(`find /var/www/html/csycms/csycmsBuilds/${siteName}/docs -type f -name "*" |grep "\.js$"`)

        let stdout = output.stdout.split('\n');
        output = shell.exec(`find /var/www/html/csycms/csycmsBuilds/${siteName}/docs -type f -name "*" |grep "\.css$"`)
        stdout = stdout.concat(output.stdout.split('\n')).filter(item => item !== '')

        const options = {
            html: {
                removeAttributeQuotes: false,
                removeOptionalTags: false,
            },
        };

        const minifyAndSave = async (file) => {
            let [err, care] = await to(new Promise((resolve, reject) => {
                minify(file, options).then(data => resolve(data)).catch(error => reject(error))
            }))
            if (err) return;
            if (care) {
                fs.writeFileSync(file, care)
            }
        }
        let promises = stdout.map(minifyAndSave);
        await to(Promise.all(promises))



        let staticSiteDomain = staticSiteLocation.split("://").slice(-1)[0]
        shell.exec(`echo ${staticSiteDomain} > /var/www/html/csycms/csycmsBuilds/${siteName}/CNAME`)
        shell.exec(`echo ${staticSiteDomain} > /var/www/html/csycms/csycmsBuilds/${siteName}/docs/CNAME`)
        shell.exec(`cd /var/www/html/csycms/csycmsBuilds/${siteName}/docs && wget ${siteUrl}/robots.txt`)

        output = shell.exec(`find /var/www/html/csycms/csycmsBuilds/${siteName}/docs -type f -name "*" |grep "\.html$"`)
        stdout = output.stdout.split('\n');
        stdout.map(file => {
            if (file.match(/robots\.txt\.html$/)) shell.exec(`rm ${file}`)
        })
        output = shell.exec(`find /var/www/html/csycms/csycmsBuilds/${siteName}/docs -type f -name "*" |grep "\.html$"`)
        stdout = output.stdout.split('\n');
        // console.log(stdout)
        stdout = stdout.filter(item => item !== '')
        // console.log(stdout)

        stdout.map(absolutePath => {
            if(absolutePath.match(/index\.html/))return
            let fileName = absolutePath.split("/").slice(-1)[0]           
            let dirNameToUse = fileName.replace(/\.html$/, '')
            let escapedString = `/${dirNameToUse}\.html/`;
           
            let dirFullPath = absolutePath.replace(/\/[^\/]*$/, `/${dirNameToUse}`)
            // console.log({fileName, dirNameToUse, dirFullPath})
            shell.exec(`mkdir -p "${dirFullPath}" && mv "${absolutePath}" "${dirFullPath}/index.html"`)
            escapedString =  escapeRegExp(fileName);
            // console.log({escapedString, escapedString1:escapedString.toString(), repls: escapeRegExp(siteUrl), siteUrl, dirNameToUse})
            /** fix hrefs */
            shell.exec(`find "${dirFullPath}/index.html" -type f -exec sed -i '/href="http/b; s/href="\\(.*\\)/href="..\\/\\1/g' {} +`)
            shell.exec(`find "${dirFullPath}/index.html" -type f -exec sed -i '/src="http/b; s/src="\\(.*\\)/src="..\\/\\1/g' {} +`)
            // shell.exec(`find /var/www/html/csycms/csycmsBuilds/${siteName}/docs -type f -exec sed -i 's/\\(src="\\)\\(^http\\)/\\1..\\2/g' {} +`)
            /** remove .html from links */
          
            shell.exec(`find /var/www/html/csycms/csycmsBuilds/${siteName}/docs -type f -exec sed -i 's/${escapedString}/${dirNameToUse}/g' {} +`)
            escapedString = escapedString.replace(/ /g, "&#32;")
            //   console.log('--------->'+escapedString, dirNameToUse)
            shell.exec(`find /var/www/html/csycms/csycmsBuilds/${siteName}/docs -type f -exec sed -i 's/${escapedString}/${dirNameToUse}/g' {} +`)
            // console.log(`find /var/www/html/csycms/csycmsBuilds/${siteName} -type f -exec sed -i 's/${escapedString}/${dirNameToUse}/g' {} +`)

            // console.log({dirNameToUse, dirFullPath, tmp: escapeRegExp(fileName), fileName, escapedString})
        })

        // output = shell.exec(`find /var/www/html/csycms/csycmsBuilds/${siteName}/docs -type f -name "*" |grep "\.html$"`)
        // stdout = output.stdout.split('\n');
        // console.log(stdout)
        // stdout = stdout.filter(item => item !== '')
        // console.log(stdout)

        // return
        shell.exec(`cd /var/www/html/csycms/csycmsBuilds/${siteName}/docs && wget ${siteUrl}/sitemap.xml`)

        if (staticSiteRepo !== '') {
            let key = await toolbox.readSystemConfig()
            key = key.sshKey
            let message = `site build ${new Date().toISOString()}`
            // console.log(siteUrl.replace(/\//g, "\\/"))

            const escapedString = escapeRegExp(siteUrl);
            shell.exec(`find /var/www/html/csycms/csycmsBuilds/${siteName}/docs -type f -exec sed -i 's/${escapedString}/${staticSiteLocation}/g' {} +`)

            shell.exec(`rm -rf /tmp/csycmsBuilds/${siteName}-swagger && mkdir -p  /tmp/csycmsBuilds/${siteName}-swagger && cd /tmp/csycmsBuilds/${siteName}-swagger && wget -mpEk ${siteUrl}/swagger-ui.html/ && cd /tmp/csycmsBuilds/${siteName}-swagger/${siteUrl.replace(/http[s]*:\/\//, '')} && mv swagger-ui.html  /var/www/html/csycms/csycmsBuilds/${siteName}/docs/`)

            shell.exec(`cd /var/www/html/csycms/csycmsBuilds/${siteName}  && git init `)
            shell.exec(`cd /var/www/html/csycms/csycmsBuilds/${siteName}  &&  git remote add origin ${staticSiteRepo} `)
            shell.exec(`cd /var/www/html/csycms/csycmsBuilds/${siteName}  && git add . && git commit -m "${message}" && GIT_SSH_COMMAND='ssh -i ${key} -o IdentitiesOnly=yes' git push origin master`)
        }
    }
}