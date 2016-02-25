import device;
import animate;
import ui.View as View;
import ui.TextView as TextView;
import ui.effectsEngine as effectsEngine;

var BG_WIDTH = 576;
var BG_HEIGHT = 1024;

exports = Class(GC.Application, function () {
  var PARTICLE_WINDOW_HEIGHT = device.height;
  var PARTICLE_WINDOW_WIDTH = device.width;

  this.initUI = function () {
    this._setScreenDimensions(BG_WIDTH > BG_HEIGHT);
    this._rootView = new View({
      parent: this.view,
      anchorX: this._baseWidth / 2,
      anchorY: this._baseHeight / 2,
      width: this._baseWidth,
      height: this._baseHeight,
      scale: this._scale
    });

    this._rootView.addSubview(effectsEngine);

    var paused = false;
    this._rootView.onInputSelect = bind(this, function () {
      paused = !paused;
      if (paused) {
        effectsEngine.pauseAllEffects();
      } else {
        effectsEngine.resumeAllEffects();
      }
    });

    this.particleCounter = new TextView({
      parent: this.view,
      width: this.view.style.width,
      height: this.view.style.height / 10,
      text: "test",
      fontSize: 32,
      color: "rgba(0, 255, 0, 1)",
      strokeColor: "rgba(0, 0, 255, 1)",
      strokeWidth: 4,
      backgroundColor: "rgba(25, 25, 25, 1)"
    });

    this.emitEffect();
    this.connectToServer();
  };

  /**
   * Scale-to-fit width or height based on portrait or landscape mode
   */
  this._setScreenDimensions = function (horz) {
    var ds = device.screen;
    this._baseWidth = horz ? ds.width * (BG_HEIGHT / ds.height) : BG_WIDTH;
    this._baseHeight = horz ? BG_HEIGHT : ds.height * (BG_WIDTH / ds.width);
    this._scale = horz ? ds.height / BG_HEIGHT : ds.width / BG_WIDTH;
  };

  this.connectToServer = function() {
    animate(this).clear();
    console.log("attempting to connect");
    if (this.connection) {
      return;
    }

    this.connection = new (WebSocket || function () {})('ws://localhost:8003');
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
      effectsEngine.clearAllEffects();
      effectsEngine.emitEffectsFromData(params, {
        id: "editor-effect",
        x: PARTICLE_WINDOW_WIDTH / 2,
        y: PARTICLE_WINDOW_HEIGHT / 2
      });
    });
  };

  this.emitEffect = function () {
    var size = 50;
    var ttl = 4500;
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
            duration: 1
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
            duration: 1
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
          duration: 1
        }]
      },
      ttl: ttl,
      image: "resources/images/particle_images/sparkle.png",
      compositeOperation: 'lighter'
    }, {
      id: "explosion",
      x: PARTICLE_WINDOW_WIDTH / 2,
      y: PARTICLE_WINDOW_HEIGHT / 2
    });
  };

  this.launchUI = function () {
    this.view.tick = bind(this, function () {
      this.particleCounter.setText(effectsEngine.getActiveParticleCount());
    });
  };
});
