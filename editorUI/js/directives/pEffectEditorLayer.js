import angular from 'angular';

/**
 * This is the editor for an individual effect.
 */
let module = angular.module('ParticleEditor.directives.pEffectEditorLayer', [
]);

module.directive('pEffectEditorLayer', function(
) {
  return {
    restrict: 'E',
    templateUrl: 'templates/directives/pEffectEditorLayer.html',
    scope: {
      effect: '=',
      layerIndex: '='
    },
    controller: function ($scope, $element, $attrs) {
      // TODO: move these in to a service or something
      $scope.basicInfoToggles = [
        { name: 'Continuous', id: 'continuous' },
        { name: 'Polar', id: 'polar' },
        { name: 'Flip X', id: 'flipX' },
        { name: 'Flip Y', id: 'flipY' }
      ];
      $scope.compositeOperations = [
        { name: 'Source-Over', operation: '' },
        { name: 'Lighter', operation: 'lighter' }
      ];
      $scope.filterTypes = [
        { name: 'None', id: '' },
        { name: 'Linear Add', id: 'LinearAdd' },
        { name: 'Multiply', id: 'Multiply' },
        { name: 'Tint', id: 'Tint' }
      ];

      $scope.$watch('layerIndex', (newVal, oldVal) => {
        if (newVal >= 0) {
          $scope.layerData = $scope.effect.getLayer(newVal);
        }
      });

      $scope.renameLayer = () => {
        $scope.effect.renameLayer($scope.layerIndex);
      };

      $scope.removeLayer = () => {
        $scope.effect.removeLayer($scope.layerIndex);
      };
    }
  };
});
