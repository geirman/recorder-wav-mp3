#Recorder-wav-mp3.js
Using HTML5 Web Audio API, access the user's microphone, record, then provide a preview player and exported WAV and MP3

##Steps to Run Demo
* clone repo
* `cd recorder-wav-mp3`
* run `gulp serve` (assumes you have gulp installed)

##Summary of Major Improvements
* Refactored to better seperate concerns
* Returns both WAV and MP3 
* Fixes issue which doubled length of MP3 output by ending with dead air [ref: nusofthq/Recordmp3js:#5](https://github.com/nusofthq/Recordmp3js/issues/5)
* No longer asks for mic access until after user clicks record
* Shows example of saving to Firebase

##Todo
* Add visualizer when recording
* Log debug data to console only when cfg.debug = true
* Allow user to replace download text with icons 
* Modify export functionality so that it exports just WAV (faster), skipping MP3 (slower)
* custom player (jPlayer perhaps)
* go through source repo pull requests and cherry pick

##Attribution and Dependencies
This project builds on the outstanding work of the following libraries...
* [matdiamond/recorderjs](https://github.com/mattdiamond/Recorderjs)
* [nusofthq/recordmp3js](https://github.com/nusofthq/Recordmp3js)
* [Book: Web Audio API by Boris Smus](http://www.amazon.com/gp/product/1449332684/ref=as_li_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=1449332684&linkCode=as2&tag=geirman-20&linkId=VY645FDM7KZZR2KO)


