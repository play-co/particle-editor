import angular from 'angular';
import nodejsPath from 'path';

let module = angular.module('ParticleEditor.factories.ParticleEffect', [
  'ngMaterial'
]);

let DEFAULT_LAYER_DATA = {
  "continuous": false,
  "count": 1,
  "compositeOperation": "",
  "flipX": false,
  "flipY": false,
  "filterType": "",
  "x": {
    "value": 0
  },
  "y": {
    "value": 0
  },
  "r": {
    "value": 0
  },
  "scale": {
    "value": 1
  },
  "scaleX": {
    "value": 1
  },
  "scaleY": {
    "value": 1
  },
  "opacity": {
    "value": 1
  },
  "height": {
    "value": 100
  },
  "width": {
    "value": 100
  },
  "anchorX": {
    "value": 50
  },
  "anchorY": {
    "value": 50
  },
  "ttl": {
    "value": 1000
  },
  "delay": {
    "value": 0
  },
  "parameters": [],
  "image": []
};

let newDefaultLayer = () => JSON.parse(JSON.stringify(DEFAULT_LAYER_DATA));

module.factory('ParticleEffect', function(
  $mdDialog
) {

  class ParticleEffect {
    constructor (path, data) {
      this.path = path;
      this.data = data;

      this.name = nodejsPath.basename(path);

      // Required data
      this.data.layers = this.data.layers || [];
    }

    save = () => {
      console.log('TODO: save effect', this.data.name);
    }

    getLayer = (index) => {
      if (index < 0 || index >= this.data.layers.length) {
        console.warn('invalid layer index', index);
        return null;
      }
      return this.data.layers[index];
    }

    addLayer = () => {
      this.data.layers.push(newDefaultLayer());
      this.save();
    }

    _validateLayer = (index) => {
      if (index === undefined || index === null) {
        throw new Error('must specify layer');
      }
      if (!this.canRemoveLayer()) {
        throw new Error('Cannot remove layer right now', index);
      }
    }

    removeLayer = (index) => {
      this._validateLayer(index);

      // Appending dialog to document.body to cover sidenav in docs app
      var confirm = $mdDialog.confirm()
            .title('Confirm Delete')
            .content('Are you sure you want to delete layer: ' + index)
            .ariaLabel('confirm delete layer')
            .ok('Yes')
            .cancel('No');
      return $mdDialog.show(confirm).then(() => {
        this.data.layers.splice(index, 1);
        this.save();
      }, () => {
        // No
      });
    }

    renameLayer = (index) => {
      this._validateLayer(index);

      let layer = this.getLayer(index);

      let DialogController = ($scope, $mdDialog) => {
        $scope.name = layer.name || 'noname';

        $scope.confirm = function() {
          $mdDialog.hide($scope.name);
        };
        $scope.cancel = function() {
          $mdDialog.cancel();
        };
      };

      $mdDialog.show({
        templateUrl: 'templates/renameLayerDialog.html',
         controller: DialogController
      })
      .then((answer) => {
        layer.name = answer;
        this.save();
      }, () => {
        // No
      });
    }

    canRemoveLayer = () => {
      return this.data.layers.length > 1;
    }

  };

  return ParticleEffect;
});
