const yaml = require('js-yaml');

let defaultConfig = {
  PORT: 0,
  domain: 'localhost',
  scheme:'http',
  // base_url: 'http://localhost:4000/', // The base URL of your site (can use %base_url% in Markdown files)
  documentation: true,
  repo: '',
  update: 1,
  site: {
    space: 'CSECO',
    title: 'cseco'
  },
  // site_space: 'CSECO',
  // site_title: 'adventhymnal',
  // search_scope: 'local',
  contacts: {
    support_email: ''// Used for the "Get in touch" page footer link
  },
  // Footer Text / Copyright
  copyright: {
    startYear: 2018,
    url: 'http://www.cseco.co.ke',
    name: 'CSECO'
    // 'Copyright &copy; 2018 - ' + new Date().getFullYear() + ' - <a href="http://www.gospelsounders.org">Gospel Sounders</a>',
  },
  social: {
    github: 'https://github.com/gospelsounders',
    facebook: false,
    youtube: false,
    telegram: false,
    whatsapp: false,
  },
  search: {
    search_scope: 'local',
    excerpt_length: 400
  },
  // whitelisted: ["gmail.com"],
  // externalLinks: false,
  // externalLinks: [
  // '<a href="">Login</a>',
  // '<a class="btn" href="">Button Link</a>'
  // ],
   // Excerpt length (used in search)
  // The meta value by which to sort pages (value should be an integer)
  // If this option is blank pages will be sorted alphabetically
  page_sort_meta: 'sort',
  // Should categories be sorted numerically (true) or alphabetically (false)
  // If true category folders need to contain a "sort" file with an integer value
  category_sort: true,
  // Controls behavior of home page if meta ShowOnHome is not present. If set to true
  // all categories or files that do not specify ShowOnHome meta property will be shown
  show_on_home_default: true,
  theme_name: 'default',// Which Theme to Use?
  analytics: '',
  // allow_editing: true, // enabled
  // authentication: true,
  // authentication_for_edit: true,  // If editing is enabled, set this to true to only authenticate for editing, not for viewing
  // authentication_for_read: false, // If authentication is enabled, set this to true to enable authentication for reading too
  // Google OAuth
  // googleoauth: false,
  oauth2: {
    client_id: '1cea90ac2661c6e3afa6',
    client_secret: '91c780a5b6e34ff1be72130280f369ee914599ab',
    callback: 'http://127.0.0.1:4000/login/callback',
    hostedDomain: 'google.com'
  },
  secret: 'someCoolSecretRightHere',
  locale: 'en', // Support search with extra languages
  searchExtraLanguages: ['ru'],
  datetime_format: 'Do MMM YYYY',// Sets the format for datetime's
  rtl_layout: false, // Set to true to render suitable layout for RTL languages
}

module.exports = toolbox => {
  toolbox.saveConfig = async (siteName, config = false) => {
    if (!config) {
      config = defaultConfig
    }
    let extendedConfig = JSON.parse(JSON.stringify(defaultConfig));
    for (let i in config) {
      extendedConfig[i] = config[i]
    }
    toolbox.filesystem.write(`/etc/csycms/sites-available/${siteName}.yml`, `${yaml.safeDump(extendedConfig)}`);
    return true;
  }
}