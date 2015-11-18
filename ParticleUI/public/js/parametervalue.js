angular.module('ParticleEditor.directives', [])
  .directive('parametervalue', function() {
    return {
      templateUrl: '/views/parametervalue.html',
      scope: {
        state: "=state",
        value: "=singlevalue",
        range: "=rangevalue",
        param: "=paramvalue",
        name: "=paramname",
      },
      controller: ['$scope', function($scope) {
        $scope.hasParam = function() {

          if ($scope.name) {
            return true;
          }
          return false;
        };

        $scope.changeState = function() {
          if ($scope.name != undefined) {
            $scope.$emit('kinematic-state-change', $scope.state, $scope.name);
          }
        };

      }]
    };
  });
