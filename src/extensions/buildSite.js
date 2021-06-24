const shell = require('shelljs');
const minify = require('minify');
const { default: to } = require('await-to-js');
const fs = require('fs')
const axios = require('axios');
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


        let siteWasRunning = true;
        let [err, care] = await to(axios.get(siteUrl))
        if (err) siteWasRunning = false;
        if (!siteWasRunning) {
            await toolbox.startSite();
            await (new Promise((resolve) => setTimeout(() => { resolve() }, 3000)))
        }
        // download using links in the pages
        // shell.exec(`cd /tmp && mkdir -p csycmsBuilds && cd csycmsBuilds && wget -mpEk ${siteUrl}`)

        let escapedSiteUrl = escapeRegExp(siteUrl);
        let escapedStaticSiteLocation = escapeRegExp(staticSiteLocation);

        //these will be the missing files
        let sitemapList = shell.exec(`wget -q  ${siteUrl}/sitemap.xml -O - | egrep -o "<loc>[^<>]*</loc>" | sed -e 's:</*loc>::g'`).stdout.split('\n')
        // console.log(sitemapList);
        // let currentPath = sitemapList.shift();
        let allUrls = [...sitemapList]
        let index = 0;
        sitemapList = sitemapList.filter(currentPath => {
            try {
                let nextPath = sitemapList[++index];
                let split = nextPath.split(currentPath)
                if (split.length === 2 && split[1][0] === "/") {
                    return true
                }
            } catch (bug) { }
            return false
        });
        let sitemapListIndex = 0;
        let numSitemapList = sitemapList.length
        sitemapList = sitemapList.map(item => {
            return ++sitemapListIndex === numSitemapList ? item : item + '\n'
        }).join("")
        // console.log(sitemapList);
        // sitemapList = sitemapList.join("\n")
        // console.log(sitemapList);
        // download using sitemap
        // console.log({siteUrl, escapedSiteUrl, escapedStaticSiteLocation}); 
        // shell.exec(`cd /tmp && mkdir -p csycmsBuilds && cd csycmsBuilds && wget -q  ${siteUrl}/sitemap.xml -O - | egrep -o "<loc>[^<>]*</loc>" | sed -e 's:</*loc>::g' | parallel -j 100 '(wget   {} --no-parent --page-requisites --no-clobber -e robots=off --level=1  )'`);
        // allUrls = [allUrls[0]]
        // allUrls = allUrls.map(item => item + '\n').join("")
        allUrls = allUrls.filter(item => item !== "")
        let allUrlsListIndex = 0;
        let numAllUrlsList = allUrls.length
        allUrls = allUrls.map(item => {
            // console.log(allUrlsListIndex, numAllUrlsList, item)
            return ++allUrlsListIndex === numAllUrlsList ? item : item + '\n'
        }).join("")
        // console.log({ allUrls, sitemapList })
        /*
         * This fails:
         * shell.exec(`cd /tmp && mkdir -p csycmsBuilds && cd csycmsBuilds && echo "${allUrls}"  |parallel -j 50 '(wget   {} --no-parent --page-requisites --no-clobber --level=1 ; cp $(echo {} | cut -d "/" -f 3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20) $(echo {} | cut -d "/" -f 3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20).html && rm $(echo {} | cut -d "/" -f 3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20)  && mkdir -p $(echo {} | cut -d "/" -f 3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20) && mv $(echo {} | cut -d "/" -f 3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20).html $(echo {} | cut -d "/" -f 3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20)/index.html && sed -i "s/${escapedSiteUrl}/${escapedStaticSiteLocation}/g" $(echo {} | cut -d "/" -f 3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20)/index.html )'`)
         * Reason: we probably need to add wait.
         */
        shell.exec(`cd /tmp && mkdir -p csycmsBuilds && cd csycmsBuilds && wget -q  ${siteUrl}/sitemap.xml -O - | egrep -o "<loc>[^<>]*</loc>" | sed -e 's:</*loc>::g'  |parallel -j 100 '(wget   {} --no-parent --page-requisites --no-clobber --level=1 ; cp $(echo {} | cut -d "/" -f 3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20) $(echo {} | cut -d "/" -f 3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20).html && rm $(echo {} | cut -d "/" -f 3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20)  && mkdir -p $(echo {} | cut -d "/" -f 3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20) && mv $(echo {} | cut -d "/" -f 3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20).html $(echo {} | cut -d "/" -f 3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20)/index.html && sed -i "s/${escapedSiteUrl}/${escapedStaticSiteLocation}/g" $(echo {} | cut -d "/" -f 3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20)/index.html )'`)
        // shell.exec(`cd /tmp && mkdir -p csycmsBuilds && cd csycmsBuilds && echo "${allUrls}"  |parallel -j 50 '(wget   {} --no-parent --page-requisites --no-clobber --level=1 ; cp $(echo {} | cut -d "/" -f 3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20) $(echo {} | cut -d "/" -f 3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20).html && rm $(echo {} | cut -d "/" -f 3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20)  && mkdir -p $(echo {} | cut -d "/" -f 3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20) && mv $(echo {} | cut -d "/" -f 3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20).html $(echo {} | cut -d "/" -f 3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20)/index.html && sed -i "s/${escapedSiteUrl}/${escapedStaticSiteLocation}/g" $(echo {} | cut -d "/" -f 3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20)/index.html )'`)
        // shell.exec(`cd /tmp && mkdir -p csycmsBuilds && cd csycmsBuilds && echo ${allUrls} | sed -e 's:</*loc>::g' | parallel -j 100 '(wget   {} --no-parent --page-requisites --no-clobber --level=1 ; cp $(echo {} | cut -d "/" -f 3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20) $(echo {} | cut -d "/" -f 3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20).html && rm $(echo {} | cut -d "/" -f 3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20)  && mkdir -p $(echo {} | cut -d "/" -f 3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20) && mv $(echo {} | cut -d "/" -f 3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20).html $(echo {} | cut -d "/" -f 3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20)/index.html && sed -i "s/${escapedSiteUrl}/${escapedStaticSiteLocation}/g" $(echo {} | cut -d "/" -f 3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20)/index.html )'`)
        // shell.exec(`cd /tmp && mkdir -p csycmsBuilds && cd csycmsBuilds && wget -q  ${siteUrl}/sitemap.xml -O - | egrep -o "<loc>[^<>]*</loc>" |      | parallel -j 100 '(wget   {} --no-parent --page-requisites --no-clobber --level=1 ; cp $(echo {} | cut -d "/" -f 3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20) $(echo {} | cut -d "/" -f 3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20).html && rm $(echo {} | cut -d "/" -f 3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20)  && mkdir -p $(echo {} | cut -d "/" -f 3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20) && mv $(echo {} | cut -d "/" -f 3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20).html $(echo {} | cut -d "/" -f 3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20)/index.html && sed -i "s/${escapedSiteUrl}/${escapedStaticSiteLocation}/g" $(echo {} | cut -d "/" -f 3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20)/index.html )'`)
        // convert-links in index
        shell.exec(`cd /tmp/csycmsBuilds/${siteUrl.replace(/http[s]*:\/\//, '')} && sed -i "s/${escapedSiteUrl}/${escapedStaticSiteLocation}/g" index.html`)


        // shell.exec(`cd /tmp && mkdir -p csycmsBuilds && cd csycmsBuilds && wget -q  ${siteUrl}/sitemap.xml -O - | egrep -o "<loc>[^<>]*</loc>" | sed -e 's:</*loc>::g' | parallel -j 100 '(wget  -q {} --no-parent --convert-links --page-requisites -e robots=off --level=1 ; echo {} | cut -d "/" -f 3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20  )'`)
        // rename the files 
        shell.exec(`mkdir -p /var/www/html/csycms/csycmsBuilds`)
        shell.exec(`rm -rf /var/www/html/csycms/csycmsBuilds/${siteName}/docs && mkdir -p /var/www/html/csycms/csycmsBuilds/${siteName}`)
        shell.exec(`mv /tmp/csycmsBuilds/${siteUrl.replace(/http[s]*:\/\//, '')} /var/www/html/csycms/csycmsBuilds/${siteName}/docs`)

        // console.log("next...", sitemapList)
        // download missedFiles
        shell.exec(`cd /tmp && mkdir -p csycmsBuilds && cd csycmsBuilds && echo "${sitemapList}" | parallel -j 100 '(mkdir -p "/var/www/html/csycms/csycmsBuilds/${siteName}/docs/"$(echo {} | cut -d "/" -f 4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20) && echo "fetching {}" && wget   {} --no-clobber -O "/var/www/html/csycms/csycmsBuilds/${siteName}/docs/"$(echo {} | cut -d "/" -f 4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20)/index.html && sed -i "s/${escapedSiteUrl}/${escapedStaticSiteLocation}/g" "/var/www/html/csycms/csycmsBuilds/${siteName}/docs/"$(echo {} | cut -d "/" -f 4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20)/index.html )'`)
        // && sed -i "s/${escapedSiteUrl}/${escapedStaticSiteLocation}/g" "/var/www/html/csycms/csycmsBuilds/${siteName}/docs/"$(echo {} | cut -d "/" -f 3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20)/index.html
        // convert-links in index
        // shell.exec(`cd /tmp/csycmsBuilds/${siteUrl.replace(/http[s]*:\/\//, '')} && sed -i "s/${escapedSiteUrl}/${escapedStaticSiteLocation}/g" index.html`)
        // shell.exec(`cp -r /tmp/csycmsBuilds/${siteUrl.replace(/http[s]*:\/\//, '')}/* /var/www/html/csycms/csycmsBuilds/${siteName}/docs/`)
        // console.log(sitemapList);

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
        shell.exec(`cd /var/www/html/csycms/csycmsBuilds/${siteName}/docs && rm -r robots.txt && wget ${siteUrl}/robots.txt --no-clobber -O robots.txt && sed -i "s/${escapedSiteUrl}/${escapedStaticSiteLocation}/g" robots.txt`)


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

        // stdout.map(absolutePath => {
        //     if(absolutePath.match(/index\.html/))return
        //     let fileName = absolutePath.split("/").slice(-1)[0]           
        //     let dirNameToUse = fileName.replace(/\.html$/, '')
        //     let escapedString = `/${dirNameToUse}\.html/`;

        //     let dirFullPath = absolutePath.replace(/\/[^\/]*$/, `/${dirNameToUse}`)
        //     // console.log({fileName, dirNameToUse, dirFullPath})
        //     shell.exec(`mkdir -p "${dirFullPath}" && mv "${absolutePath}" "${dirFullPath}/index.html"`)
        //     escapedString =  escapeRegExp(fileName);
        //     // console.log({escapedString, escapedString1:escapedString.toString(), repls: escapeRegExp(siteUrl), siteUrl, dirNameToUse})
        //     /** fix hrefs */
        //     shell.exec(`find "${dirFullPath}/index.html" -type f -exec sed -i '/href="http/b; s/href="\\(.*\\)/href="..\\/\\1/g' {} +`)
        //     shell.exec(`find "${dirFullPath}/index.html" -type f -exec sed -i '/src="http/b; s/src="\\(.*\\)/src="..\\/\\1/g' {} +`)
        //     // shell.exec(`find /var/www/html/csycms/csycmsBuilds/${siteName}/docs -type f -exec sed -i 's/\\(src="\\)\\(^http\\)/\\1..\\2/g' {} +`)
        //     /** remove .html from links */

        //     shell.exec(`find /var/www/html/csycms/csycmsBuilds/${siteName}/docs -type f -exec sed -i 's/${escapedString}/${dirNameToUse}/g' {} +`)
        //     escapedString = escapedString.replace(/ /g, "&#32;")
        //     //   console.log('--------->'+escapedString, dirNameToUse)
        //     shell.exec(`find /var/www/html/csycms/csycmsBuilds/${siteName}/docs -type f -exec sed -i 's/${escapedString}/${dirNameToUse}/g' {} +`)
        //     // console.log(`find /var/www/html/csycms/csycmsBuilds/${siteName} -type f -exec sed -i 's/${escapedString}/${dirNameToUse}/g' {} +`)

        //     // console.log({dirNameToUse, dirFullPath, tmp: escapeRegExp(fileName), fileName, escapedString})
        // })

        // output = shell.exec(`find /var/www/html/csycms/csycmsBuilds/${siteName}/docs -type f -name "*" |grep "\.html$"`)
        // stdout = output.stdout.split('\n');
        // console.log(stdout)
        // stdout = stdout.filter(item => item !== '')
        // console.log(stdout)

        // return
        shell.exec(`cd /var/www/html/csycms/csycmsBuilds/${siteName}/docs && wget ${siteUrl}/sitemap.xml --no-clobber -O /sitemap.xml && sed -i "s/${escapedSiteUrl}/${escapedStaticSiteLocation}/g" sitemap.xml`)

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
        console.log({ siteUrl, escapedSiteUrl, escapedStaticSiteLocation });
    }
}