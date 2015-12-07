import angular from 'angular';

// Import third party libs
require('ng-file-upload');
require('isteven-angular-multiselect/isteven-multi-select');

// Import our files so they are available in build
require('./js/controllers');
require('./js/directives');

require('./js/factories/ParticleEffect');
require('./js/directives/editor');

// Init the angular app
let app = angular.module('ParticleEditor', [
  'ngMaterial',

  'ParticleEditor.controllers',
  'ParticleEditor.directives',

  'ParticleEditor.directives.particleEditor'
]);

app.config(function($mdThemingProvider) {
  $mdThemingProvider.theme('default');
});
