(function (window, undefined){

	var RECORDER_WORKER_PATH = '../assets/recorderWorker.js';
	var MP3_WORKER_PATH      = '../assets/mp3Worker.js';
	
	window.AudioContext      = (
								window.AudioContext 
								|| window.webkitAudioContext );
	navigator.getUserMedia   = (
								navigator.getUserMedia
								|| navigator.webkitGetUserMedia
								|| navigator.mozGetUserMedia
								|| navigator.msGetUserMedia );	
	

	var Recorder = function(cfg) {

		var _cfg = cfg || {};
		this.context = new AudioContext;

		this.pause = function(){
			console.log('pausing');
		}

		return this;
	}

	Recorder.prototype.play = function() {
		console.log('playing');
	}

	Recorder.prototype.stop = function() {
		console.log('stopping');
	}


	window.onload = function init() {
		try {

			window.URL			   = (
										window.URL
										|| window.webkitURL );

			console.info('getUserMedia = ' + (navigator.getUserMedia ? 'available' : 'UNAVAILABLE'));

		} catch (error) {
			console.warn('ERROR: web audio is not supported by this browser');
		}

		navigator.getUserMedia({
			audio: true, 
			video: false
			}, 
				startUserMedia, 
				function(error){
					console.warn('ERROR: unable to get user media: ' + error);
				})
	}

	//expose public methods
	window.Recorder = Recorder;

})(window);