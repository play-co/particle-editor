import angular from 'angular';

import './pEffectEditorLayer';

/**
 * This is the editor for an individual effect.
 */
let module = angular.module('ParticleEditor.directives.particleEffectEditor', [
  'ParticleEditor.directives.pEffectEditorLayer'
]);

module.directive('particleEffectEditor', function(
) {
  return {
    restrict: 'E',
    templateUrl: 'templates/directives/particleEffectEditor.html',
    scope: {
      effect: '='
    },
    controller: function ($scope, $element, $attrs) {
      $scope.addLayer = () => {
        $scope.effect.addLayer();
        $scope.selectedLayerIndex = $scope.effect.data.layers.length - 1;
      };
    }
  };
});
