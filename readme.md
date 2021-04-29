# csycms CLI

CSYCMS, acronym for **Csyber Systems Content Management System** is a:
1. Markdown powered (blog aware) static site generator, 
2. markdown powered knowledge-base, 
3. Flat-file CMS, and
3. API server for node.js

> If we had known about Jekyll in 2018 (3 years ago) when we began this project, we would probably have chosen to use it for building our sites. But now three years down the line we been able to add features that Jekyll does not have and it would be more expensive for us to switch over to it than to keep patching things up here an adding new features that we need along the way. <br>
> — Brian Onang'o, csycms developer.


# Table of Contents
- [Inspiration](#inspiration)
- [Features](#features)
- [Comparison with Other Systems](#comparison-with-other-systems)
- [Requirements](#requirements)
- [QuickStart](#quickstart)
 - [From GitHub](#from-github)
- [Features](#features)
 - [Common Features](#common-features)
 - [Unique Features](#unique-features)
 - [Other Advantages](#other-advantages)
- [Configuration](#configuration)
- [Updating](#updating)
- [Contributing](#contributing)
- [Security issues](#security-issues)
- [License](#license)
- [Todo](#todo)

## Inspiration
We received much inspiration for this project from [php's User Frosting](https://www.userfrosting.com/) and [node's Raneto](http://raneto.com/)

**[⬆ back home](#table-of-contents)**

## Features
- **Static Site Generation** - You can build your site and with one command generate a static site to be hosted for instance on github pages.
- **Static Site server** - You can also choose not to build run your site and server it using csycms.
- **API server** - You can also choose to have csycms server the API for your site, but have the front end hosted elsewhere or also from csycms.
- **Multiple sites** - You can build and server multiple sites using csycms

Visit [http://learn.csycms.csymapp.com](http://learn.csycms.csymapp.com) to see a demo and get started!

The underlying architecture of CSYCMS is designed to use well-established and _best-in-class_ technologies. Some of these key technologies include:

* [Markdown](http://en.wikipedia.org/wiki/Markdown): for easy content creation
* [Hogan Templating](http://twitter.github.io/hogan.js/): for powerful control of the user interface
* Microservices to make deployments of multiple sites more stable

Welcome to the world of [CSECO](https://www.cseco.co.ke) and [Csyber Systems](https://github.com/csymapp) where every other words begins with `cs`, pronouced `psy`. So that `csycms` is pronounced `psy cms`   

**[⬆ back home](#table-of-contents)**

## Comparison with Other Systems
### Jekyll
1. csycms is built with node, Jekyll with Ruby.
2. csycms has an api server, Jekyll seems not to have one.
3. both generate sites which can be hosted on github pages

### Grav
1. Grav is php, csycms is node.
2. Grav is a CPU gazzler especially when performing a search. csycms tries not to be.

### Raneto
1. csycms has an api server, Raneto seems not to have one.
2. csycms can host several sites.

> Therefore, while the other systems (listed above and more) are older and more stable, in our own little world here, csycms seems to have features that they lack.

**[⬆ back home](#table-of-contents)**

## Requirements

- OS: linux
- Node v12+

If you intend to use csycms to server your sites, then you'll need to install nginx to set up a reverse proxy.

**[⬆ back home](#table-of-contents)**

## QuickStart

```bash
npm install -g csycms
sudo csycms init
sudo csycms site --create -n "$SITENAME" -p "$PORT"
```

Edit site configurations in `/etc/csycms/sites-available/$SITENAME`

Once you have editted the configurations, you can restart the subprocess serving the site using `csycms site --restart -n $SITENAME`

# Configuration

Set configurations in `/etc/projectname/config/system.yml` with:
```yaml
sshKey: ~/.ssh/id_rsa # ssh key
PORT: 2121 # port for communication between csycms and sites
update: 86400 # system update interval in seconds
```

## todo
- [ ] protected content.