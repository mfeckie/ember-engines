/*jshint node:true*/

var path = require('path');
var InRepoAddon = require('ember-cli/blueprints/in-repo-addon/index');
var stringUtil = require('ember-cli-string-utils');
var fs = require('fs-extra');

module.exports = {
  description: 'Creates an Engine within the current repository.',

  locals: function(options) {
    var entity = options.entity;
    var rawName = entity.name;
    var name = stringUtil.dasherize(rawName);

    return {
      name: name,
      modulePrefix: name,
      hasLazyFlag: typeof options.lazy !== 'undefined',
      isLazy: !!options.lazy
    };
  },

  availableOptions: [
    {
      name: 'type',
      type: [ 'routable', 'routeless' ],
      default: 'routable',
      aliases: [
        { 'routable': 'routable' },
        { 'routeless': 'routeless' }
      ]
    },
    {
      name: 'lazy',
      type: Boolean,
      description: 'Whether this Engine should load lazily or not'
    }
  ],

  _setupRouteBlueprint: function() {
    this.routeBlueprint = this.lookupBlueprint('route');
    this.shouldTouchRouter = this.routeBlueprint.shouldTouchRouter;
    this.shouldEntityTouchRouter = this.routeBlueprint.shouldEntityTouchRouter;
  },

  install: function(options) {
    this.options = options;
    var superResult = this._super.install.apply(this, arguments);
    this._setupRouteBlueprint();
    return superResult;
  },

  uninstall: function(options) {
    this.options = options;
    var superResult = this._super.uninstall.apply(this, arguments);
    this._setupRouteBlueprint();
    return superResult;
  },

  filesPath: function() {
    var type = this.options && this.options.type || 'routable';
    return path.join(this.path, type + '-files');
  },

  // TODO: supportsAddon normally calls `files` which means that `filesPath`
  // gets called before options get set. Likely needs to be fixed upstream.
  supportsAddon: function() {
    return false;
  },

  beforeInstall: InRepoAddon.beforeInstall,

  afterInstall: function(options) {
    options.identifier = 'mount';
    InRepoAddon.afterInstall.call(this, options);
    this.routeBlueprint.afterInstall.call(this, options);
  },

  afterUninstall: function(options) {
    options.identifier = 'mount';
    this.routeBlueprint.afterUninstall.call(this, options);
  },

  _generatePackageJson: function(options, isInstall) {
    InRepoAddon._generatePackageJson.apply(this, arguments);
  },

  _readJsonSync(path) {
    return fs.readJsonSync(path);
  },

  _writeFileSync(path, content) {
    fs.writeFileSync(path, content);
  }
};
