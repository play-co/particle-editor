var ParticleEditorUI = Class(function() {

  this.init = function() {
    this._childWindow = null;

    devkit.addModuleButton({
      iconClassName: 'glyphicon glyphicon-certificate'
    }).on('Select', this.toggleVisibility.bind(this));
  };

  this.toggleVisibility = function() {
    if (this._childWindow && !this._childWindow.closed) {
      this._childWindow.focus();
    } else {
      var url = location.protocol + '//' + location.host;
      url += devkit.getSimulator().getURL();
      url += 'modules/devkit-particles/extension/particle-editor/';
      this._childWindow = window.open(url, '_blank');
    }
  };

});

module.exports = new ParticleEditorUI();
