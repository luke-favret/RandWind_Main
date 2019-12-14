Repo Organization:

node_modules - contains all necessary modules for running node.js
python - holds all needed python files for the website
  frames - contains pictures of each frame being used
  cfd.mp4 - the video used to obtain each frame
  driver.py - is called from server.js and returns a random String
  getFrames.py - extracts all frames from any video
  getRandomContours.py - used for testing to find the contours of the wind
  random10.txt - used for testing before getRandomContours.py was finished
resources - contains all css and images for the website
sql - contains all the sql statements that went into creating the database on a text files
views/pages - contains all .pug fiiles
requirements.txt - contains all the python modules needed to be used in the heroku python buildpack
runtime.txt - specifies which version of python needs to be used in the heroku python buildpack



Repo build/test
Steps to push to your personal heroku account:
1. heroku login

if you need to clone the ropository first:
1. heroku git:clone -a randwind
2. cd randwind

To deploy changes:
1. git init
2. heroku git:remote -a randwind
3. git add .
4. git commit -am "message"
5. git push heroku master


Website can be found at:
https://randwind.herokuapp.com
