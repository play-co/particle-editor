import angular from 'angular';

import '../services/EffectLoader';
import './particleEffectEditor';

/**
 * This is the main particle editor (for our purposes, the entry point to the app).
 */
let module = angular.module('ParticleEditor.directives.particleEditor', [
  'ParticleEditor.services.EffectLoader',
  'ParticleEditor.directives.particleEffectEditor'
]);

module.directive('particleEditor', function(
  EffectLoader
) {
  return {
    restrict: 'E',
    templateUrl: 'templates/directives/particleEditor.html',
    scope: {
    },
    link: function(scope, element, attrs) {
      scope.loading = true;
      EffectLoader.loadEffects()
        .then(function() {
          scope.$applyAsync(function() {
            scope.loading = false;

            if (!scope.selectedEffect) {
              scope.selectedEffect = EffectLoader.getFirst();
            }
          });
        });
    },
    controller: function ($scope, $element, $attrs) {
      $scope.EffectLoader = EffectLoader;

      $scope.selectedEffect = null;
      $scope.loading = false;
    }
  };
});
