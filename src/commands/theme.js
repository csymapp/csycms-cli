const to = require("await-to-js").to

let description = 'csycms theme --action\nTheme actions:\n--list list all themes.\n--listlocal list installed themes\n--deletelocal  -n <theme name>\n--delete  -n <theme name> Remove from index\n--pull -n <theme name> Install or update theme\n--exists  -n <theme name> Check if in index.\n--existslocal  -n <theme name> Check if installed.\n-add  -n <theme name> -u <theme url> Add to index\n--createlocal  -n <theme name>\n--copylocal  -n <theme name> -d <destination> [-f overwrite existing directory]\n--remote -n <theme name>\n\t--add -N <name> -u <url>\n\t--remove -N <name>\n\t-v equivalent to git remote -v\n--push  -n <theme name> -m <message>'

const command = {
  name: 'theme',
  description: description,
  run: async toolbox => {
    let action = ''
    try {
      action = toolbox.parameters.argv[3].replace(/^--/, '');
    } catch (err) {
      action = err
    }
    switch (action) {
      case "list": /** */
        await toolbox.listThemes(true);
        break;
      case "listlocal": /** */
        await toolbox.listThemesLocal(true);
        break;
      case "deletelocal": /** */
        await toolbox.deleteLocalTheme(true);
        break;
      case "delete": /** */
        await toolbox.deleteTheme(true);
        break;
      case "pull": /** */
        await toolbox.pullTheme(true);
        break;
      case "exists": /** */
        await toolbox.themeExists(true);
        break;
      case "add": /** */
        await toolbox.addTheme(true);
        break;
      case "createlocal": /** */
        await toolbox.createLocalTheme(true);
        break;
      case "existslocal": /** */
        await toolbox.themeExistsLocal(true);
        break;
      case "copylocal": /** */
        await toolbox.copyThemeLocal(true);
        break;
      case "remote": /** */
        await toolbox.themeRemote(true);
        break;
      case "push": /** */
      case "sync": /** */
        await toolbox.pushTheme(true);
        break;
      default:
        return toolbox.print.error(description)
    } 
  }
}

module.exports = command