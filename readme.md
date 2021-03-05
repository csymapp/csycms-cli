# csycms CLI

A CLI for csycms. CSYCMS is a flat file content management sytem for nodejs.

# Dependancies

 - nginx
 - certbot
 - nodejs

Please make sure the dependencies are installed before proceeding.

# Installing

```
npm install -g csycms
```


# initializing

Should start service

```
sudo csycms init
```

# Starting service

```
sudo csycms start
```
# Stopping service

```
sudo csycms stop
```
# Starting restarting

```
sudo csycms restart
```

# Get help

```
csycms
```

# Configuration

Set configurations in `/etc/projectname/config/system.yml` with:
```yaml
sshKey: ~/.ssh/id_rsa # ssh key
PORT: 2121 # port for communication between csycms and sites
update: 86400 # system update interval in seconds
```