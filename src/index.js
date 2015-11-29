import animate;
import ui.View as View;
import ui.ParticleEngine as ParticleEngine;



var PI = Math.PI;
var TAU = 2 * PI;
var sin = Math.sin;
var cos = Math.cos;
var floor = Math.floor;
var random = Math.random;
var choose = function (a) { return a[floor(random() * a.length)]; };
var rollFloat = function (n, x) { return n + random() * (x - n); };
var rollInt = function (n, x) { return floor(n + random() * (1 + x - n)); };
var rollValue = function(param, s)  { 
  if (param.parameterized) {
    var alpha = (s / param.sRate) % 1;
  } else {
    alpha = random();
  } 
  return param.min + alpha * (param.max - param.min); 
};

DEFAULT_CONTINUOUS_JSON = {
  spawnRate: 100,
  ds: 1 / 1000,
  ttl: {min: 1000, max: 1000},
  fadeIn: true,
  fadeOut: true,
  fadeInTime: 200,
  fadeOutTime: 200,
  delay: {min: 0, max: 0},
  vx: {min: 0, max: 0},
  vy: {min: 0, max: 0},
  ax: {min: 0, max: 0},
  ay: {min: 0, max: 0},
  r: {min: 0, max: 0},
  vr: {min: 0, max: 0},
  ar: {min: 0, max: 0},
  scale: {min: 1, max: 1},
  dScale: {min: 0, max: 0},
  opacity: {min: 1, max: 1},
  dOpacity: {min: 0, max: 0},
  vAnchorX: {min: 0, max: 0},
  aAnchorX: {min: 0, max: 0},
  vAnchorY: {min: 0, max: 0},
  aAnchorY: {min: 0, max: 0},
  particleHeight: 35,
  particleWidth: 37,
  anchorX: 17,
  anchorY: 18,
  images: ["resources/images/particle_images/sparkle.png"],
  compositeOperation: "show-over"
};

DEFAULT_BURST_JSON = {
  clusterSize: 100,
  loop: false,
  ds: 1 / 1000,
  fadeIn: true,
  fadeOut: true,
  fadeInTime: 200,
  fadeOutTime: 200,
  ttl: {min: 1000, max: 1000},
  delay: {min: 0, max: 0},
  vx: {min: 0, max: 0},
  vy: {min: 0, max: 0},
  ax: {min: 0, max: 0},
  ay: {min: 0, max: 0},
  r: {min: 0, max: 0},
  vr: {min: 0, max: 0},
  ar: {min: 0, max: 0},
  scale: {min: 1, max: 1},
  dScale: {min: 0, max: 0},
  opacity: {min: 1, max: 1},
  dOpacity: {min: 0, max: 0},
  vAnchorX: {min: 0, max: 0},
  aAnchorX: {min: 0, max: 0},
  vAnchorY: {min: 0, max: 0},
  aAnchorY: {min: 0, max: 0},
  particleHeight: 35,
  particleWidth: 37,
  anchorX: 17,
  anchorY: 18,
  images: ["resources/images/particle_images/sparkle.png"],
  compositeOperation: "show-over"
};

DEFAULT_BOX_EMITTER_JSON = {
  type: "box",
  xPos: {min: -100, max: 100},
  yPos: {min: -10, max: 10},
  vx: {min: 0, max: 0},
  vy: {min: 0, max: 0},
  ax: {min: 0, max: 0},
  ay: {min: 0, max: 0},
};

DEFAULT_ANULUS_EMITTER_JSON = {
  type: "anulus",
  angle: {min: 0, max: 2 * PI},
  radius: {min: 0, max: 150},
  radialVelocity: true,
  radialSpeed: {min: 20, max: 50},
  radialAccel: {min: 0, max: 0},
  vx: {min: 0, max: 0},
  vy: {min: 0, max: 0},
  ax: {min: 0, max: 0},
  ay: {min: 0, max: 0},
  xSquash: 1,
  ySquash: 1,
};

var ParticleResource = Class(View, function () {
  var superProto = View.prototype;

  this.init = function (opts) {

    superProto.init.call(this, opts);

    this.opts = opts;

    this.pEngine = new ParticleEngine({
      parent: this
    });

    this.pauseed = true;
  };

  this.clearEffect = function() {
    this.particleParameters = null;

    this.paused = true;
  }

  this.loadEffect = function(params, autoplay) {

    if (params.continuous) {
      this.particleParameters = merge(params, DEFAULT_CONTINUOUS_JSON);
    } else {
      this.particleParameters = merge(params, DEFAULT_BURST_JSON);
    }

    this.updateImageLinks(this.opts.baseImageUrl, params.images);

    this.particleParameters.emitParticle = this.createEmitterFunction(params.emitter);

    if (autoplay) {
      this.playEffect();
    }
  };

  this.updateImageLinks = function(baseImageUrl, images) {
    for (var i = 0; i < images.length; i++) {
      images[i] = baseImageUrl + '/' + images[i];
    }
  };

  this.createEmitterFunction = function(params) {
    if (params.type === "anulus") {
      var params = merge(params, DEFAULT_ANULUS_EMITTER_JSON);
      return function(p, s) {
        var theta = rollValue(params.angle, s);
        var radius = rollValue(params.radius, s);
        var costheta = cos(theta);
        var sintheta = sin(theta);
        p.x = costheta * radius * params.xSquash;
        p.y = sintheta * radius * params.ySquash;
        if (params.radialVelocity) {
          var speed = rollValue(params.radialSpeed, s);
          var accel = rollValue(params.radialAccel, s);
          p.dx = costheta * speed * params.xSquash;
          p.dy = sintheta * speed * params.ySquash;
          p.ddx = costheta * accel * params.xSquash;
          p.ddy = sintheta * accel * params.ySquash;
        } else {
          p.ddx = rollValue(params.ax, s);
          p.ddy = rollValue(params.ay, s);
          p.dx = rollValue(params.vx, s);
          p.dy = rollValue(params.vy, s);
        }

      };
    } else if (params.type === "box") {
      var params = merge(params, DEFAULT_BOX_EMITTER_JSON);
      return function(p, s) {
        p.x = rollValue(params.xPos, s);
        p.y = rollValue(params.yPos, s);
        p.dx = rollValue(params.vx, s);
        p.ddx = rollValue(params.ax, s);
        p.dy = rollValue(params.vy, s);
        p.ddy = rollValue(params.ay, s);
      };
    }
    return function(p) {
      p.x = 0,
      p.y = 0.
      p.dx = 100,
      p.dy = 100;
    };
  };

  this.playEffect = function() {
    this.paused = false;

    this.timeSinceLaunch = 0;

    this.s = 0;

    if ((this.particleParameters !== null) && (!this.particleParameters.continuous)) {
      this.launchParticles(this.particleParameters.clusterSize);

      if (this.particleParameters.loop) {
        animate(this.particleParameters)
          .clear()
          .wait(this.particleParameters.loopTime)
          .then(bind(this, function() {
            this.playEffect();
          }))
      }
    }


  };

  this.pauseEffect = function() {
    this.paused = true;
    animate(this.particleParameters).clear();
  };

  // Overwrite this function to perform additional action on particles each frame
  this.customParticleMotion = function(dt, params, pEngine) {

  };

  this.tick = function (dt) {
    if (this.paused) {
      return;
    }

    this.customParticleMotion(dt, this.particleParameters, this.pEngine);

    var params = this.particleParameters;
    if ((params !== null) && (params.continuous)) {
      this.timeSinceLaunch += dt;
      var numLaunched = this.timeSinceLaunch * params.spawnRate / 1000.0;
      if (numLaunched >= 1) {
        this.launchParticles(numLaunched);
        this.timeSinceLaunch = 0;
      }
    }

    this.pEngine.runTick(dt);
  };


  this.launchParticles = function(numParticles) {
    
    var data = this.pEngine.obtainParticleArray(numParticles);
    var params = this.particleParameters;

    for (var i = 0; i < numParticles; i++) {
      p = data[i];
      this.s += params.ds;
      p.ttl = rollValue(params.ttl, this.s);
      p.delay = rollValue(params.delay, this.s);
      params.emitParticle(p, this.s);
      p.dx += rollValue(params.vx, this.s);
      p.ddx += rollValue(params.ax, this.s);
      p.dy += rollValue(params.vy, this.s);
      p.ddy += rollValue(params.ay, this.s);
      p.r = rollValue(params.r, this.s);
      p.dr = rollValue(params.vr, this.s);
      p.ddr = rollValue(params.ar, this.s);
      p.image = choose(params.images);
      p.scale = rollValue(params.scale, this.s);
      p.dscale = rollValue(params.dScale, this.s);
      p.opacity = rollValue(params.opacity, this.s);
      p.dopacity = rollValue(params.dOpacity, this.s);
      p.height = params.particleHeight;
      p.width = params.particleWidth;
      p.anchorX = params.anchorX;
      p.anchorY = params.anchorY;
      p.dAnchorX = rollValue(params.vAnchorX, this.s);
      p.dAnchorY = rollValue(params.vAnchorY, this.s);
      p.ddAnchorX = rollValue(params.aAnchorX, this.s);
      p.ddAnchorY = rollValue(params.aAnchorY, this.s);
      p.compositeOperation = params.compositeOperation;

      if (params.fadeIn) {
        animate(p, 'fadeIn')
          .wait(p.delay)
          .then({opacity: p.opacity}, params.fadeInTime);

        p.opacity = 0;
        if (p.dopacity == 0) {
          p.dopacity = .00001;
        }
      }
      if (params.fadeOut) {
        animate(p, 'fadeOut')
          .wait(p.delay + p.ttl - params.fadeOutTime)
          .then({opacity: 0}, params.fadeOutTime);
      }
    }

    this.animateParticles(data);

    this.pEngine.emitParticles(data);

  };

  // This functon can be overwritten to add animation to particles 
  this.animateParticles = function(data) {

  };

});

exports = ParticleResource;
