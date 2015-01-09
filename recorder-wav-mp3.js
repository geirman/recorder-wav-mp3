(function (window, undefined){

	var RECORDER_WORKER_PATH = 'lib/recorderWorker.js';
	var encoderWorker        = new Worker('lib/mp3Worker.js');
	
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
		var source;
		var recording = false;
		var currCallback;
		this.context  = new AudioContext;
		this.node     = ( this.context.createScriptProcessor
						  || this.context.createJavaScriptNode).call(this.context, bufferLen, 2, 2);

		console.info( '>> Recorder.node' );
		console.log( this.node );

		(function init( recorder, worker ){
			recorder.getAudioStream();

			worker.postMessage({
				command: 'init',
				config: {
					sampleRate: recorder.context.sampleRate
				}
			});

		})(this, worker);


		this.stop = function(){
			recording = false;
			console.log('recording stopped');
		}

		this.record = function(){
			recording = true;
			console.log('recording started');
		}

		this.clear = function(){
			worker.postMessage({
				command: 'clear'
			});
			console.log('recording cleared');
		}

		this.node.onaudioprocess = function( e ){
			if( !recording ) return ;

			worker.postMessage({
				command: 'record',
				buffer: [
					e.inputBuffer.getChannelData(0),
					// e.inputBuffer.getChannelData(1)
				]
			})
		}

		this.configure = function( cfg ){
			for( var prop in cfg ){
				if(cfg.hasOwnProperty( prop )){
					_cfg[ prop ] = cfg[ prop ];
				}
			}
		}

		this.getBuffer = function( callback ){
			currCallback = callback || _cfg.callback;
			worker.postMessage({
				command: 'getBuffer'
			});
		}

		this.export = function( callback, type ){
			currCallback = callback || _cfg.callback;
			type         = type || _cfg.type || 'audio/wav';

			if( !currCallback ) throw new Error('Callback is required but was not received by exportWav method');

			worker.postMessage({
				command: 'exportWAV',
				type: type
			});
		}

		// Convert to MP3
		worker.onmessage = function( e ){

		  var wav = {
		  	blob: e.data,
		  	url: 'undefined'
		  }
		  
		  console.info(">> wav.blob ");
		  console.log(wav.blob);
		  
		  var arrayBuffer;
		  var fileReader = new FileReader();
		  
		  fileReader.onload = function(){
			arrayBuffer = this.result;
			var buffer = new Uint8Array(arrayBuffer),
	        data = parseWav(buffer);

			console.info("MP3 Conversion: START");

	        encoderWorker.postMessage({ cmd: 'init', config:{
	            mode : 3,
				channels:1,
				samplerate: data.sampleRate,
				bitrate: data.bitsPerSample
	        }});

	        encoderWorker.postMessage({ cmd: 'encode', buf: Uint8ArrayToFloat32Array(data.samples) });
	        encoderWorker.postMessage({ cmd: 'finish'});
	        encoderWorker.onmessage = function( e ) {
	            if (e.data.cmd == 'data') {

	            	// this === worker
				
					// console.log(e);
					console.info("MP3 Conversion: COMPLETE");

					var mp3 = {
						blob: new Blob([new Uint8Array(e.data.buf)], {type: 'audio/mp3'}),
						url: 'data:audio/mp3;base64,'+ encode64(e.data.buf)
					};
					
					currCallback( mp3 );
					
	            }
	        };
		  };
		  fileReader.readAsArrayBuffer( wav.blob );
	      currCallback( wav );		
		}

	function encode64(buffer) {
		var binary = '',
			bytes = new Uint8Array( buffer ),
			len = bytes.byteLength;

		for (var i = 0; i < len; i++) {
			binary += String.fromCharCode( bytes[ i ] );
		}
		return window.btoa( binary );
	}

	function parseWav(wav) {
		function readInt(i, bytes) {
			var ret = 0,
				shft = 0;

			while (bytes) {
				ret += wav[i] << shft;
				shft += 8;
				i++;
				bytes--;
			}
			return ret;
		}
		if (readInt(20, 2) != 1) throw 'Invalid compression code, not PCM';
		if (readInt(22, 2) != 1) throw 'Invalid number of channels, not 1';
		return {
			sampleRate: readInt(24, 4),
			bitsPerSample: readInt(34, 2),
			samples: wav.subarray(44)
		};
	}

	function Uint8ArrayToFloat32Array(u8a){
		var f32Buffer = new Float32Array(u8a.length);
		for (var i = 0; i < u8a.length; i++) {
			var value = u8a[i<<1] + (u8a[(i<<1)+1]<<8);
			if (value >= 0x8000) value |= ~0x7FFF;
			f32Buffer[i] = value / 0x8000;
		}
		return f32Buffer;
	}
		
    //this should not be necessary
		return this;
	}

	Recorder.prototype.getAudioStream = function() {
		navigator.getUserMedia( { audio: true, video: false },
								  this.onStreamSuccess.bind(this),
								  this.onStreamFailure.bind(this) );
	}

	Recorder.prototype.onStreamSuccess = function( stream ) {
		var input = this.context.createMediaStreamSource( stream );
	    input.connect(this.node);
	    this.node.connect(this.context.destination);		
		
		console.info('>> input = this.context.createMediaSource( stream )');
		console.log(input);
	}

	Recorder.prototype.onStreamFailure = function ( error ) {
		console.error('ERROR: unable to get audio source (microphone)');
	}



	//expose public methods
	window.Recorder = Recorder;

})(window);