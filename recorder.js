(function (window, undefined){

	var RECORDER_WORKER_PATH = 'recorderWorker.js';
	var MP3_WORKER_PATH      = 'mp3Worker.js';
	
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

		this.play = function(){
			console.log('playing');
		}

		this.stop = function(){
			console.log('stopping');
		}

		this.record = function(){
			console.log('recording');
		}

		this.pause = function(){
			console.log('pausing');
		}

		return this;
	}

	Recorder.prototype.getAudioSrc = function() {
		navigator.getUserMedia( { audio: true, video: false },
								  this.onStreamSuccess.bind(this),
								  this.onStreamFailure.bind(this) );
	}

	Recorder.prototype.onStreamSuccess = function( stream ) {
		var input = this.context.createMediaStreamSource( stream );
	}

	Recorder.prototype.onStreamFailure = function ( error ) {
		console.error('ERROR: unable to get audio source (microphone)');
	}


	//expose public methods
	window.Recorder = Recorder;

})(window);