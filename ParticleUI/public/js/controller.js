


angular.module('ParticleEditor.controllers', ['ngFileUpload', "isteven-multi-select"]).
  controller('EditorController', ['$scope', '$http', '$timeout', 'Upload',
   function($scope, $http, $timeout, Upload) {

    $scope.variableParameters = [
      "x",
      "y",
      "r",
      "scale",
      "scaleX",
      "scaleY",
      "opacity",
      "height",
      "width",
      "anchorX",
      "anchorY"
    ];

    $scope.tempParameters = [
    ];

    $scope.variablePolarParameters = [
      "r",
      "theta",
      "radius",
      "scale",
      "scaleX",
      "scaleY",
      "opacity",
      "x",
      "y",
      "height",
      "width",
      "anchorX",
      "anchorY"
    ];

    $scope.simpleParameters = [
      "continuous",
      "count",
      "compositeOperation",
      "parameters",
      "flipX",
      "flipY",
    ];

    $scope.lifespanParameters = [
      "ttl",
      "delay",
    ]


    $scope.carteseanSectionLayers = []
    $scope.polarSectionLayers = [];

    $scope.effectLayers = [];
    $scope.activeLayer = 0;

    $scope.availableFiles = [];

    $scope.generateInitialValue = function(value) {
      return {
        initialState: 'value',
        value: value,
        range: [value, value, null],
        evolution: 'state',
        targets: [],
        delta: null,
      };
    };

    $scope.availableImages = [];
    $scope.compositeOperations = ["", "lighter"];
    $scope.effectTitle = "effect";

    $scope.addStep = function(param) {
      $scope.effectData[param].targets.push({
          finalState: 'value',
          value: 0,
          range: [0, 0, null],
          delay: 0,
          duration: 1.0,
          easing: "linear",
        });
    };

    $scope.getSections = function(effectData) {
      if (effectData.polar) {
        return $scope.polarSections;
      } else {
        return $scope.carteseanSections;
      }
    };

    $scope.removeStep = function(param, index) {
      $scope.effectData[param].targets.splice(index, 1);
    }

    $scope.onEvolutionChange = function(section, param) {
      var parameter = $scope.effectData[param];
      $scope.addRemoveDeltaParam(section, param, parameter.evolution);
      $scope.applyAsync();
    };

    $scope.addRemoveDeltaParam = function(section, param, evolution, deltaState) {
      if (evolution == 'kinematic') {
        $scope.addParam(section, 'd' + param, param);
      } else {
        $scope.removeParam(section, 'd' + param);
      }
    };

    $scope.addParam = function(section, param, parentParam) {

      if ($scope.effectData[param] == undefined) {
        $scope.effectData[param] = $scope.generateInitialValue(0);
      }
      var sections = $scope.getSections($scope.effectData);
      if (sections[section].indexOf(param) < 0) {
        var index = sections[section].indexOf(parentParam);
        sections[section].splice(index + 1, 0, param);
      }

      if ($scope.effectData[param].evolution == 'kinematic') {
        $scope.addParam(section, 'd' + param, param);
      }
    };

    $scope.removeParam = function(section, param) {
      var sections = $scope.getSections($scope.effectData);
      var index = sections[section].indexOf(param);
      if (index >= 0) {
        sections[section].splice(index, 1);
        $scope.removeParam(section, 'd' + param);
      }
    };

    $scope.addParameter = function() {
      $scope.effectData.parameters.push({
        id: "0",
        distribution: "linear",
        random: false,
        resetInterval: 16
      });
    };

    $scope.removeParameter = function(index) {
      $scope.effectData.parameters.splice(index, 1);
    };

    $scope.update = function() {

      data = [];
      for (var i = 0; i < $scope.effectLayers.length; i++) {
        data.push($scope.buildEffectData(i));
      }

      $scope.updateDownloadLink(data);
      $http.post("http://localhost:3000/update",data);
    };

    $scope.buildEffectData = function(index) {
      var data = {};

      var effectData = $scope.effectLayers[index];
      // Copy the simple parameters first.
      for (var i = 0; i < $scope.simpleParameters.length; i++) {
        data[$scope.simpleParameters[i]] = effectData[$scope.simpleParameters[i]];
      }


      // Copying the variable parameters is somewhat more complex
      var variableParameters = $scope.variableParameters;
      if (effectData.polar) {
        variableParameters = $scope.variablePolarParameters;
      }
      for (var i = 0; i < variableParameters.length; i++) {
        var paramName = variableParameters[i];
        var param = effectData[paramName];
        data[paramName] = $scope.buildParameterData(param, paramName, effectData);
        // Prune any delta params that will always be zero.
        $scope.pruneDeltaParamIfZero(data[paramName]);
      }

      for (var i = 0; i < $scope.tempParameters.length; i++) {
        var paramName = $scope.tempParameters[i];
        data[paramName] = effectData[paramName].value;
      }

      for (var i = 0; i < $scope.lifespanParameters.length; i++) {
        var obj = {};
        var paramName = $scope.lifespanParameters[i];
        var param = effectData[paramName];        
        if (param.state == "value") {
          obj.value = param.value;
        } else {
          obj.range = $scope.trimRange(param.range);
        }

        data[paramName] = obj;
      }

      data.image = [];
      for (var i = 0; i < effectData.image.length; i++) {
        data.image.push(effectData.image[i].name);
      }

      return data;

    };

    $scope.pruneDeltaParamIfZero = function(param) {
      if (param.delta) {
        if ($scope.pruneDeltaParamIfZero(param.delta)) {
          delete param.delta;
          if ($scope.valueIsZero(param.value, param.range)) {
            return true;
          }
        }
        return false;
      } 
      if ($scope.valueIsZero(param.ralue, param.vange)) {
        if ($scope.finalSteps === undefined) {
          return true;
        }
        for (var i = 0; i < param.targets.length; i++) {
          if (!$scope.valueIsZero(param.targets[i].value, param.targets[i].range)) {
            return false;
          }
        }
        return true;
      }

      // If we've gotten here then the parameter must have at least some chance of being non-zero.
      return false;
    };

    $scope.valueIsZero = function(value, range) {
      if ((value !== undefined) && (value === 0)) {
        return true;
      } else {
        if ((range !== undefined) && ((range[0] == 0) && (range[1] == 0))) {
          return true;
        }
      }
      return false;
    };

    $scope.buildParameterData = function(param, paramName, effectData) {
      var obj = {};
      if (param.initialState == "value") {
        obj.value = param.value;
      } else {
        obj.range = $scope.trimRange(param.range);
      }

      if (param.evolution == "state") {
        if (param.targets.length > 0) {
          obj.targets = [];
        }
        for (var j = 0; j < param.targets.length; j++) {
          obj.targets.push($scope.buildStep(param.targets[j]));
        }
      } else {
        obj.delta = $scope.buildParameterData(
          effectData['d' + paramName], 'd' + paramName, effectData);
      }

      return obj;

    };

    $scope.buildStep = function(step) {
      var obj = {};
      if (step.finalState == 'value') {
        obj.value = step.value;
      } else {
        obj.range = $scope.trimRange(step.range);
      }
      obj.delay = step.delay;
      obj.duration = step.duration;
      obj.easing = step.easing;

      return obj;
    };

    $scope.trimRange = function(range) {
        var trimmedRange = [range[0], range[1]];

        if ((range[2] == null) || (range[2] == undefined)) {
          return trimmedRange;
        }

        trimmedRange.push(range[2]);
        return trimmedRange;
    }

    $scope.updateDownloadLink = function(data) {
      var content = JSON.stringify(data, null, 2);
      var blob = new Blob([ content ], { type : 'text/plain' });
      if ($scope.url) {
        (window.URL || window.webkitURL).revokeObjectURL($scope.url);
      }
      $scope.url = (window.URL || window.webkitURL).createObjectURL( blob );
    };


    $scope.updateFiles = function() {
      $scope.fileMap = {};
      $http.get("http://localhost:3000/files").then(function(response) {
        $scope.availableFiles = [];

        for (var i = 0; i < response.data.length; i++) {
          var fileObj = {name: response.data[i], ticked: false}
          $scope.availableFiles.push(fileObj);
          $scope.fileMap[fileObj.name] = fileObj;
        }

      }, function errorCallback(error) {
        console.log(error);
      });

    };

    $scope.onFileSelect = function($files) {
      //$files: an array of files selected, each file has name, size, and type.
      for (var i = 0; i < $files.length; i++) {
        var $file = $files[i];
        Upload.upload({
          url: 'http://localhost:3000/upload',
          file: $file,
          progress: function(e){}
        }).then(function(data, status, headers, config) {
          // file is uploaded successfully
          $scope.updateFiles();
        }); 
      }
    };

    $scope.uploadEffectFile = function() {
      var f = document.getElementById('effectFile').files[0],
          r = new FileReader();
      r.onloadend = function(e){
        var data = e.target.result;
        console.log("loading file with data", data);
        $scope.loadEffectJson(JSON.parse(data));
        $scope.clearSelectedFiles();
        //send you binary data via $http or $resource or do anything else with it
      }
      r.readAsBinaryString(f);

    };

    $scope.loadEffectJson = function(effectJSON) {
      $scope.effectLayers = [];
      $scope.resetSectionLayers();
      for (var i = 0; i < effectJSON.length; i++) {
        $scope.addLayer();
        $scope.parseLayerJson(effectJSON[i], i);
      }

      $timeout(function() {
        $scope.selectLayer(0);
      }, 500);

    };

    $scope.containsPolarCoords = function(json) {
      return (typeof json.radius === 'object') || (typeof json.theta === 'object'); 
    }


    $scope.parseLayerJson = function(effectJSON, index) {

      var effectData = $scope.effectLayers[index];

      for (var i = 0; i < $scope.simpleParameters.length; i++) {
        if (effectJSON[$scope.simpleParameters[i]] !== undefined) {
          effectData[$scope.simpleParameters[i]] = effectJSON[$scope.simpleParameters[i]];
        }
      }

      effectData.polar = $scope.containsPolarCoords(effectJSON);  

      // Copying the variable parameters is somewhat more complex
      var variableParameters = $scope.variableParameters;
      if (effectData.polar) {
        variableParameters = $scope.variablePolarParameters;
      }

      if (effectData.polar) {
        var sections = $scope.polarSectionLayers[index];
      } else {
        sections = $scope.carteseanSectionLayers[index];
      }

      for (var i = 0; i < variableParameters.length; i++) {
        var paramName = variableParameters[i];
        var param = effectJSON[paramName];
        var section = $scope.getParameterSection(paramName, sections);
        var sectionParameters = sections[section];
        if (param !== undefined) {
          $scope.buildParameterFromJSON(param, paramName, sectionParameters, effectData);
        }
      }

      for (var i = 0; i < $scope.lifespanParameters.length; i++) {
        var obj = {value: 0, range: [0, 0, null], state: "value"};
        var paramName = $scope.lifespanParameters[i];
        var param = effectJSON[paramName];  
        if (param === undefined) {
          continue;
        }
        if (param.value != undefined) {
          obj.state = "value";
          obj.value = param.value;
        } else {
          obj.state = "range";
          obj.range = param.range;
          if (param.range.length < 3) {
            obj.range[2] = null;
          }
        }

        effectData[paramName] = obj;
      }

      effectData.image = [];
      for (var i = 0; i < effectJSON.image.length; i++) {
        var image = $scope.fileMap[effectJSON.image[i]];
        effectData.image.push(image);
      }
    };

    $scope.getParameterSection = function(param, sections) {
      for (var key in sections) {
        if (sections[key].indexOf(param) >= 0) {
          return key;
        }
      }
      return null;
    }

    $scope.buildParameterFromJSON = function(param, paramName, sectionParameters, effectData) {
      var data = $scope.generateInitialValue(0);

      if (param.value !== undefined) {
        data.value = param.value;
        data.initialState = "value";
      } else {
        data.range = param.range;
        data.initialState = "range";
        if (data.range.length < 3) {
          data.range[2] = null;
        }
      }
      if (param.delta != undefined) {
        data.evolution = "kinematic";
        var index = sectionParameters.indexOf(paramName);
        sectionParameters.splice(index + 1, 0, "d" + paramName);
        $scope.buildParameterFromJSON(
          param.delta, "d" + paramName, sectionParameters, effectData);
      } else if (param.targets != undefined) {
        data.evolution = "state";
        data.targets = [];
        for (var i = 0; i < param.targets.length; i++) {
          data.targets.push($scope.buildStepFromJSON(param.targets[i]));
        }
      } else {
        data.evolution = "state";
      }

      effectData[paramName] = data;

    };

    $scope.buildStepFromJSON = function(stepJSON) {
      var data = {
        value: 0,
        range: [0, 0, null],
        finalState: 'value',
      };
      if (stepJSON.value !== undefined) {
        data.value = stepJSON.value;
        data.finalState = "value";
      } else {
        data.range = stepJSON.range;
        data.finalState = "range";
        if (data.range < 3) {
          data.range[2] = null;
        }
      }
      data.delay = stepJSON.delay;
      data.duration = stepJSON.duration;

      return data;
    };

    $scope.clearSelectedFiles = function() {
      for (var key in $scope.fileMap) {
        $scope.fileMap[key].ticked = false;
      }
    };

    $scope.resetSectionLayers = function() {
      $scope.carteseanSectionLayers = [];
      $scope.polarSectionLayers = [];
    }

    $scope.addLayer = function() {
      $scope.carteseanSectionLayers.push({
        "position": [
          "x",
          "y",
          "r",
        ],
        "display": [
          "scale",
          "scaleX",
          "scaleY",
          "opacity",
          "zIndex",
          "height",
          "width",
          "anchorX",
          "anchorY",
        ]
      });

      $scope.polarSectionLayers.push({
        "position": [
          "x",
          "y",
          "r",
          "theta",
          "radius"
        ],
        "display": [
          "scale",
          "scaleX",
          "scaleY",
          "opacity",
          "zIndex",
          "height",
          "width",
          "anchorX",
          "anchorY",
        ]
      });

      $scope.effectLayers.push({
        continuous: false,
        count: 1,
        polar: false,
        delay: {state: 'value', value: 0, range: [0, 0, null]},
        ttl: {state: 'value', value: 1000, range: [1000, 1000, null]},
        x: $scope.generateInitialValue(0),
        y: $scope.generateInitialValue(0),
        r: $scope.generateInitialValue(0),
        radius: $scope.generateInitialValue(0),
        theta: $scope.generateInitialValue(0),
        offsetX: $scope.generateInitialValue(0),
        offsetY: $scope.generateInitialValue(0),
        scale: $scope.generateInitialValue(1),
        scaleX: $scope.generateInitialValue(1),
        scaleY: $scope.generateInitialValue(1),
        zIndex: $scope.generateInitialValue(0),
        opacity: $scope.generateInitialValue(1),
        height: $scope.generateInitialValue(100),
        width: $scope.generateInitialValue(100),
        anchorX: $scope.generateInitialValue(50),
        anchorY: $scope.generateInitialValue(50),
        compositeOperation: "",
        flipX: false,
        flipY: false,
        image: [],
        parameters: [],
      });

    };


    $scope.applyAsync = function() {
      $timeout(function() {
        $scope.$apply();
      }, 0)
    }

    $scope.selectLayer = function(index) {
      $scope.activeLayer = index;
      $scope.effectData = $scope.effectLayers[index];
      $scope.carteseanSections = $scope.carteseanSectionLayers[index];
      $scope.polarSections = $scope.polarSectionLayers[index];
      $scope.clearSelectedFiles();

      for (var i = 0; i < $scope.effectData.image.length; i++) {
        $scope.fileMap[$scope.effectData.image[i].name].ticked = true;
      }
      $scope.applyAsync();
    };

    $scope.removeLayer = function(index) {
      $scope.effectLayers.splice(index, 1);
      $scope.carteseanSectionLayers.splice(index, 1);
      $scope.polarSectionLayers.splice(index, 1);
      $scope.selectLayer(0);
    };

    $scope.updateFiles();
    $scope.addLayer();
    $scope.selectLayer(0);

}]);
