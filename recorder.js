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
	

	var Recorder = function( cfg ) {

		var _cfg      = cfg || {};
		var bufferLen = _cfg.bufferLen || 4096;
		var worker    = new Worker( _cfg.workerPath || RECORDER_WORKER_PATH );
		var recording = false;
		var currCallback;
		this.context  = new AudioContext;
		this.node     = ( this.context.createScriptProcessor
						  || this.context.createJavaScriptNode).call(this.context, bufferLen, 2, 2);


		(function init( recorder, worker ){
			recorder.getAudioStream();

			worker.postMessage({
				command: 'init',
				config: {
					sampleRate: recorder.context.sampleRate
				}
			});

		})(this, worker);

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

		this.clear = function(){
			console.log('cleared');
		}

		return this;
	}

	Recorder.prototype.getAudioStream = function() {
		navigator.getUserMedia( { audio: true, video: false },
								  this.onStreamSuccess.bind(this),
								  this.onStreamFailure.bind(this) );
	}

	Recorder.prototype.onStreamSuccess = function( stream ) {
		var input = this.context.createMediaStreamSource( stream );
		console.info('>> input = this.context.createMediaSource( stream )');
		console.log(input);
	}

	Recorder.prototype.onStreamFailure = function ( error ) {
		console.error('ERROR: unable to get audio source (microphone)');
	}


	//expose public methods
	window.Recorder = Recorder;

})(window);