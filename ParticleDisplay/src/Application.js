
import src.effectsEngine as effectsEngine;
import device;
import animate;

exports = Class(GC.Application, function () {

  var PARTICLE_WINDOW_HEIGHT = device.height;
  var PARTICLE_WINDOW_WIDTH = device.width;

  this.initUI = function () {

    /*this.particleResource = new ParticleResource({
      parent: this.view,
      baseImageUrl: "http://localhost:3000/images",
      x: PARTICLE_WINDOW_WIDTH / 2,
      y: PARTICLE_WINDOW_HEIGHT / 2,
    })

    this.particleResource.loadEffect({
      continuous: true,
      autoplay: true,
      maxScale: 1,
      ttl: {min: 3000, max: 3000},
      spawnRate: 10,

      emitter: {
        type: "anulus",
        radius: {min: 200, max: 250},
        radialVelocity: true,
        radialSpeed: {min: -100, max: 50},
      }
    }, true);*/
    this.view.addSubview(effectsEngine);
    this.emitEffect();
    this.view.onInputSelect = bind(this, this.emitTestEffect);
    this.connectToServer();

  };

  this.connectToServer = function() {
    animate(this).clear();
    console.log("attempting to connect");
    if (this.connection) {
      return;
    }

    this.connection = new WebSocket('ws://localhost:8003');
    this.connection.onopen = function() {
      console.log("connection open");
      animate(this).clear();
    };

    var self = this;

    this.connection.onclose = function() {
      console.log("connection closed");
      self.connection = null;
      animate(this)
        .clear()
        .wait(2000)
        .then(bind(self, function() {
          console.log(this);
          this.connectToServer();
        }));
    };

    this.connection.onerror = function() {
      console.log("connection closed");
      self.connection = null;
      animate(this)
        .clear()
        .wait(10000)
        .then(bind(self, function() {
          this.connectToServer();
        }));
    };

    this.connection.onmessage = bind(this, function(e) {
      var params = JSON.parse(e.data);
      console.log("got parameters", params);
      for (var i = 0; i < params.length; i++) {
        var effect = params[i];
        for (var j = 0; j < effect.image.length; j++) {
          effect.image[j] = "http://localhost:3000/" + effect.image[j];
        }
      }
      effectsEngine.clearEffects();
      effectsEngine.emitEffectsFromData(params, {
        id: "editor-effect",
        x: PARTICLE_WINDOW_WIDTH / 2,
        y: PARTICLE_WINDOW_HEIGHT / 2
      });
    });

  };

  this.emitTestEffect = function() {
    console.log('emitting');
    effectsEngine.emitEffectsFromData(
 {
    "count": 16,
    "compositeOperation": "lighter",
    "params": [],
    "flipX": false,
    "flipY": false,
    "r": {
      "value": 0
    },
    "theta": {
      "range": [
        0,
        6.28
      ],
      "delta": {
        "range": [
          -4,
          4
        ],
        "targets": [
          {
            "value": 0,
            "delay": 0,
            "duration": 450
          }
        ]
      }
    },
    "radius": {
      "range": [
        -5,
        5
      ],
      "delta": {
        "range": [
          0,
          400
        ],
        "targets": [
          {
            "value": 0,
            "delay": 0,
            "duration": 450
          }
        ]
      }
    },
    "scale": {
      "range": [
        0.25,
        2.5
      ],
      "targets": [
        {
          "value": 0,
          "delay": 0,
          "duration": 450
        }
      ]
    },
    "height": 100,
    "width": 100,
    "anchorX": 50,
    "anchorY": 50,
    "ttl": {
      "value": 450
    },
      image: ["http://localhost:3000/resources/images/explosions/explode_fireWaves_0001.png",
       "http://localhost:3000/resources/images/explosions/explode_fireWaves_0002.png",
        "http://localhost:3000/resources/images/explosions/explode_fireWaves_0003.png",
         "http://localhost:3000/resources/images/explosions/explode_fireWaves_0004.png"
      ]
  }, {
      id: "explosion",
      x: PARTICLE_WINDOW_WIDTH / 2,
      y: PARTICLE_WINDOW_HEIGHT / 2
    });
  }
  this.emitEffect = function () {
    console.log("emitting effect");
    var size = 50;
    var ttl = 450;
    var TAU = 2 * Math.PI;
    effectsEngine.emitEffectsFromData({
      parameters: [],
      count: 16,
      radius: {
        range: [-5, 5],
        delta: {
          range: [0, 400],
          targets: [{
            value: 0,
            delay: 0,
            duration: ttl
          }]
        }
      },
      theta: { range: [0, TAU] },
      r: {
        range: [0, TAU],
        delta: {
          range: [-4, 4],
          targets: [{
            value: 0,
            delay: 0,
            duration: ttl
          }]
        }
      },
      anchorX: size / 2,
      anchorY: size / 2,
      width: size,
      height: size,
      scale: {
        range: [0.25, 2.5],
        targets: [{
          value: 0,
          delay: 0,
          duration: ttl
        }]
      },
      ttl: ttl,
      image: ["http://localhost:3000/resources/images/explosions/explode_fireWaves_0001.png",
       "http://localhost:3000/resources/images/explosions/explode_fireWaves_0002.png",
        "http://localhost:3000/resources/images/explosions/explode_fireWaves_0003.png",
         "http://localhost:3000/resources/images/explosions/explode_fireWaves_0004.png"
      ],
      compositeOperation: 'lighter'
    }, {
      id: "explosion",
      x: PARTICLE_WINDOW_WIDTH / 2,
      y: PARTICLE_WINDOW_HEIGHT / 2
    });
  };

  this.launchUI = function () {

  };

});
