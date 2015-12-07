import angular from 'angular';
import Promise from 'bluebird';

import remoteFS from 'http-fs/src/clients/fs';

import '../factories/ParticleEffect';

let module = angular.module('ParticleEditor.services.EffectLoader', [
  'ParticleEditor.factories.ParticleEffect'
]);

module.factory('EffectLoader', function(
  ParticleEffect
) {

  let basePath = '/resources/effects/';

  // Initialize the fs promise
  let appPath = location.href.split('modules')[0];
  this._fsMountPoint = appPath + 'http-fs';
  this._fs = remoteFS(this._fsMountPoint, {
    // cwd: '/resources/effects'
  })
    .tap(
      (fs) => {
        // Ensure that the effects folder exists
        return fs.exists(basePath).then((exists) => {
          if (!exists) {
            return fs.mkdir(basePath);
          }
          return Promise.resolve();
        });
      },
      (err) => {
        console.error('Failed to connect:', err);
      }
    );

  // Loaded effects
  this.effects = {};

  this.loadEffects = () => {
    return this._fs.then((fs) => {
      return fs.glob(basePath + '**/*.json').then((files) => {
        console.log('Found effects:', files);
        let tasks = [];
        files.forEach((filePath) => {
          tasks.push(fs.readFile(filePath, 'utf-8').then(contents => {
            console.log('Loaded:', filePath);
            this.effects[filePath] = new ParticleEffect(filePath, JSON.parse(contents));
          }));
        });
        return Promise.all(tasks);
      });
    });
  };

  this.getFirst = () => {
    var keys = Object.keys(this.effects);
    if (keys.length > 0) {
      return this.effects[keys[0]];
    }
    return null;
  };

  return this;
});
