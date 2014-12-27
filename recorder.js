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
			console.log('stopping');
		}

		this.record = function(){
			recording = true;
			console.log('recording');
		}

		this.clear = function(){
			worker.postMessage({
				command: 'clear'
			});
			console.log('cleared');
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

		this.exportWAV = function( callback, type ){
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
	      var blob = event.data;
		  console.log("the blob " +  blob + " " + blob.size + " " + blob.type);
		  
		  var arrayBuffer;
		  var fileReader = new FileReader();
		  
		  fileReader.onload = function(){
			arrayBuffer = this.result;
			var buffer = new Uint8Array(arrayBuffer),
	        data = parseWav(buffer);
	        
	        console.log(data);
			// console.log("Converting to Mp3");
			console.info("Converting to Mp3");

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
				
					// console.log(e);
					console.info("Done converting to Mp3");
					
					/*var audio = new Audio();
					audio.src = 'data:audio/mp3;base64,'+encode64(e.data.buf);
					audio.play();*/
	                
					//console.log ("The Mp3 data " + e.data.buf);
					
					var mp3Blob = new Blob([new Uint8Array(e.data.buf)], {type: 'audio/mp3'});
					uploadAudio(mp3Blob);
					
					var url = 'data:audio/mp3;base64,'+encode64(e.data.buf);
					var li = document.createElement('li');
					var au = document.createElement('audio');
					var hf = document.createElement('a');

					console.log(mp3Blob);
					  
					au.controls = true;
					au.src = url;
					hf.href = url;
					hf.download = 'audio_recording_' + new Date().getTime() + '.mp3';
					hf.innerHTML = hf.download;
					li.appendChild(au);
					li.appendChild(hf);
					recordings.appendChild(li);
					
	            }
	        };
		  };
		  fileReader.readAsArrayBuffer(blob);
	      currCallback(blob);		
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
	
	function uploadAudio(mp3Data){
		var reader = new FileReader();
		reader.onload = function(event){
			console.log('uploadAudio event');
			console.log(event);
			var fd = new FormData();
			var mp3Name = encodeURIComponent('audio_recording_' + new Date().getTime() + '.mp3');
			console.log("mp3name = " + mp3Name);
			fd.append('fname', mp3Name);
			fd.append('data', event.target.result);
			// This is where I'd upload to fireBase
			// saveMP3(event.target.result);
		};      
		reader.readAsDataURL(mp3Data);
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