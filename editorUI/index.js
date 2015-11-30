var angular = require('angular');

// Import third party libs
require('ng-file-upload');
require('isteven-angular-multiselect/isteven-multi-select');

// Import our files so they are available in build
require('./js/controllers');
require('./js/directives');

// Init the angular app
var app = angular.module('ParticleEditor', [
  'ParticleEditor.controllers',
  'ParticleEditor.directives'
]);
