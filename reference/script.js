// var sample = new MicrophoneSample();


// shim layer with setTimeout fallback
window.requestAnimFrame = (function() {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

function __log(e, data) {
    console.log(e + " " + (data || ''));
}

var audio_context;
var recorder;
var analyser;
var filter;

function startUserMedia(stream) {
    var input = audio_context.createMediaStreamSource(stream);
    __log("Media stream input sample rate " + input.context.sampleRate);

    // filter = audio_context.createBiquadFilter();
    // filter.frequency.value = 800.0;
    // filter.type = filter.NOTCH;
    // filter.Q = 10.0;
    // input.connect(filter);
    // __log('Biquad Filter connected');

    // analyser = audio_context.createAnalyser();
    // filter.connect(analyser);
    // __log('Analyser connected to filter');
    // requestAnimFrame(visualize());

    recorder = new Recorder(input);
    __log('Recorder initialised.');

}

// function visualize() {
//     var canvas = document.querySelector('canvas');
//     var drawContext = canvas.getContext('2d');

//     var times = new Uint8Array(analyser.frequencyBinCount);
//     analyser.getByteTimeDomainData(times);
//     for(var i = 0; i < times.length; i++) {
//         var value = times[i];
//         var percentage = value / 256;
//         var height = canvas.HEIGHT * percentage;
//         var offset = canvas.HEIGHT - height - 1;
//         var barWidth = canvas.WIDTH/times.length;
//         drawContext.fillStyle = 'black';
//         drawContext.fillRect(i * barWidth, offset, 1, 2);
//     }
//     requestAnimFrame(visualize());
// }


function startRecording(button) {
    // init();
    recorder && recorder.record();
    button.disabled = true;
    button.nextElementSibling.disabled = false;
    __log('Recording...');
}

function stopRecording(button) {
    recorder && recorder.stop();
    button.disabled = true;
    button.previousElementSibling.disabled = false;
    __log('Stopped recording.');
    // console.log(recorder);
    // create WAV download link using audio data blob
    createDownloadLink();

    recorder.clear();
}

function createDownloadLink() {
    recorder && recorder.exportWAV(function(blob) {
        /*var url = URL.createObjectURL(blob);
        var li = document.createElement('li');
        var au = document.createElement('audio');
        var hf = document.createElement('a');
      
        au.controls = true;
        au.src = url;
        hf.href = url;
        hf.download = new Date().toISOString() + '.wav';
        hf.innerHTML = hf.download;
        li.appendChild(au);
        li.appendChild(hf);
        recordingslist.appendChild(li);*/
    });
}

function saveMP3(b64str){
    __log('saving to firebase');
    ref = new Firebase('https://luminous-fire-443.firebaseio.com/audio/1');
    ref.set({
        filetype: 'audio/mp3',
        base64Str: b64str
    });
}

window.onload = function init() {
    try {
        // webkit shim
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        navigator.getUserMedia = (navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia);
        window.URL = window.URL || window.webkitURL;

        audio_context = new AudioContext;
        __log('Audio context set up.');
        __log('navigator.getUserMedia ' + (navigator.getUserMedia ? 'available.' : 'not present!'));
    } catch (e) {
        alert('No web audio support in this browser!');
    }

    navigator.getUserMedia({
        audio: true
    }, startUserMedia, function(e) {
        __log('No live audio input: ' + e);
    });

};

