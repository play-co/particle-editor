import ui.TextView as TextView;
import ui.View 
import .ParticleResource;
import device;

exports = Class(GC.Application, function () {

  var PARTICLE_WINDOW_HEIGHT = device.height;
  var PARTICLE_WINDOW_WIDTH = device.width;

  this.initUI = function () {

    this.particleResource = new ParticleResource({
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
    }, true);


    // TODO(dbarnard): Add retry logic to this websocket connection.  Also
    // the host and port should be configurable.
    var connection = new WebSocket('ws://localhost:8003');
    connection.onopen = function() {
      console.log("connection open");
    };

    connection.onmessage = bind(this, function(e) {
      var params = JSON.parse(e.data);
      console.log("got parameters", params);
      this.particleResource.loadEffect(params, true);
    });

  };

  this.launchUI = function () {

  };

});
