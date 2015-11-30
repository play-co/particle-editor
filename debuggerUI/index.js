var ParticleEditorUI = Class(function() {

  this.init = function() {
    devkit.addModuleButton({
      iconClassName: 'glyphicon glyphicon-certificate'
    }).on('Select', bind(this, 'toggleVisibility'));
  };

  this.toggleVisibility = function() {
    console.log('TOGGLE')
  };

});

module.exports = new ParticleEditorUI();
