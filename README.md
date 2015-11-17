The Particle Editor

The particle editor ui has two components.  

Particle Display
The 'ParticleDisplay' folder contains a devkit project which will render particles.  That project can be installed and run just like any other devkit project.  When run, it will attempt to open a websocket connection to the particle editor UI.  Currently the location of that server is hardcoded to localhost:3000, but it should be made configurable.

ParticleUI
The ParticleUI project contains a simple nodejs project which hosts a ui for creating particle effects and forwards data to the devkit particle display application.

Running the editor:

Step 1:
  From the command line cd into the ParticleUI folder and install the server with the command 'npm install'

Step 2:
  Run the server with the command node server.js path  ('npm start path' works as well)
  where 'path' is the path to the devkit project you will be creating particle effects for.  The ParticleUI will look for
  a 'resources' folder in that directory then scan that directory (and all subdirectories) for images.  The images it finds will be available in the Particle UI

Step 3:
  Open the devkit ParticleDisplay app.  

Step 4:
  Point a browser at localhost:3000 to view the particle UI.  After you have adjusted the various parameters you can apply them to the ParticleDisplay app by hitting the 'update' button.  If the ParticleDisplay app is connected you should see
  it play the particle effect defined by the parameters set in the UI


Saving a particle effect
  Near the top of the UI there is an 'effect title' entry field.  Once the update button has been hit once, a link will apear next to this entry field.  That link can be used to download and save the current effect as a JSON file, with the default name of the file being whatever is in that box.  To put the file anywhere but 'downloads' right click and select 'save link as' from the menu.

Loading a particle effect
  Effect files can be loaded into the ui using the 'Upload Effect File'.  After choosing a fill click 'Load Effect' to load that effect into the ui.



