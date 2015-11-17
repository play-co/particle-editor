angular.module('ParticleEditor.directives')
  .directive('collapsable', function() {
    return {
      template: "<div class='collapse-header' ng-click='toggle()'>{{header}}</div>" +
                "<div class='collapse-body' style='{{getStyle()}}'>" +
                "<ng-transclude></ng-transclude></div>",
      transclude: true,
      scope: {
        header: '='
      },
      link: function(scope, element, attrs) {
        scope.element = element;
      },
      controller: ['$scope', function($scope) {
        $scope.collapsed = true;
        $scope.toggle = function() {
          $scope.collapsed = !$scope.collapsed;
        };

        $scope.getStyle = function() {
          if ($scope.collapsed) {
            return "height: 0";
          } else {
            if ($scope.element) {
              var rects = $scope.element.find('ng-transclude')[0].getClientRects();
              var height = 0;
              for (var i = 0; i < rects.length; i++) {
                height = Math.max(rects[i].height, height);
              } 
              return "height: " + height + "px";
            }
            return "height: 100px";
          }
        };

      }]
    };
  });