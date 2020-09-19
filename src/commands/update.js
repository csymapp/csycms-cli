

const command = {
  name: 'update',
  alias: 'u',
  description: 'Update csycms',
  run: async toolbox => {
    await toolbox.sysUpdate();
  }
}

module.exports = command