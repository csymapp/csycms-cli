// const to = require('await-to-js').to
// const shell = require('shelljs')
const fs = require("fs-extra")
const yaml = require('js-yaml')

module.exports = toolbox => {
  let description = `csycms site --config -n <site name>`
  toolbox.configSite = async (print = false) => {
    if (!toolbox.parameters.options.n) {
      return toolbox.print.error(description)
    }
    const siteName = toolbox.parameters.options.n
    let siteExists = await toolbox.siteExists(false);
    if (!siteExists) {
      toolbox.print.error(`${siteName} does not exist!`)
      return
    }
    let savedConfigs = fs.readFileSync(
      `/etc/csycms/sites-available/${siteName}.yml`,
      'utf-8'
    )
    let yamlObject = {}
    try {
      yamlObject = yaml.safeLoad(savedConfigs)
    } catch (err) {
      console.log(err)
    }
    let vals = [];
    let index = 1;
    for (let key of Object.keys(yamlObject)) {
      console.log(`${index++}:${key}=>${yamlObject[key]}`)
      vals.push(key)
    }
    let result = await toolbox.prompt.ask({
      type: 'input',
      name: 'index',
      message: 'Enter the number of the value you want to change from the list. Enter 0 to add new field not in list',
    })
    let rawIndex = result.index
    index = parseInt(result.index)
    if (isNaN(index) || index > (vals.length)) {
      return toolbox.print.error(`${rawIndex} is an invalid option`)
    }
    // console.log(result.index)
    let field = ''
    if (index === 0) {
      result = await toolbox.prompt.ask({
        type: 'input',
        name: 'field',
        message: 'Enter new field',
      })
      field = result.field
    } else {
      field = vals[index - 1]
    }
    result = await toolbox.prompt.ask({
      type: 'input',
      name: 'value',
      message: `Enter the new value for ${field}`,
    })
    let value = result.value
    yamlObject[field] = value;

    vals = [];
    index = 1;
    for (let key of Object.keys(yamlObject)) {
      console.log(`${index++}:${key}=>${yamlObject[key]}`)
      vals.push(key)
    }
    result = await toolbox.prompt.confirm(`Is this correct?`)
    if (result) {
      for (let key in yamlObject) {
        let value = yamlObject[key]
        // console.log(value)

        if (typeof value === 'string') {
          let intValue;
          let floatValue;
          let boolValue;

          try {
            floatValue = parseFloat(value)
          } catch (error) {
            console.log(error)
          }
          try {
            intValue = parseInt(value)
          } catch (error) {
            console.log(error)
          }
          try {
            value === 'false' ? boolValue = false : false;
            value === 'true' ? boolValue = true : false;
          } catch (error) {
            console.log(error)
          }
          if (boolValue !== undefined) {
            value = boolValue
          } else {
            if (floatValue !== undefined && !isNaN(floatValue)) {
              let floatLen = floatValue.toString().length;
              if (floatLen === value.length) {
                value = floatValue
              }
            }
            if (intValue !== undefined && !isNaN(intValue)) {
              let intLen = intValue.toString().length;
              if (intLen === value.length) {
                value = intValue
              }
            }
          }
        }
        yamlObject[key] = value
      }
      await toolbox.saveConfig(siteName, yamlObject)
      yamlObject = {}
      savedConfigs = fs.readFileSync(
        `/etc/csycms/sites-available/${siteName}.yml`,
        'utf-8'
      )
      try {
        yamlObject = yaml.safeLoad(savedConfigs)
      } catch (err) {
        console.log(err)
      }
      vals = [];
      index = 1;
      for (let key of Object.keys(yamlObject)) {
        console.log(`${index++}:${key}=>${yamlObject[key]}`)
        vals.push(key)
      }
      toolbox.print.success(`configuration saved`)
    } else {
      toolbox.print.error(`configuration not saved`)
    }
    // console.log(field)
  }
}