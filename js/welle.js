// for legacy browsers
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();

// get the audio element
const audioElement = document.querySelector('audio');

// pass it into the audio context
const track = audioContext.createMediaElementSource(audioElement);
var analyser = audioContext.createAnalyser();
track.connect(analyser);
analyser.fftSize = 256;

//init dataArray for analysing and displaying audio freqs
var bufferLength = analyser.frequencyBinCount;
var dataArray = new Uint8Array(bufferLength);

const gainNode = audioContext.createGain();
gainNode.connect(audioContext.destination);

track.connect(gainNode);

gainNode.gain.value = 1.0;
// select our play button
const playButton = document.querySelector('button');

playButton.addEventListener('click', function() {

    // check if context is in suspended state (autoplay policy)
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    // play or pause track depending on state
    if (this.dataset.playing === 'false') {
        audioElement.play();
        this.dataset.playing = 'true';
    } else if (this.dataset.playing === 'true') {
        audioElement.pause();
        this.dataset.playing = 'false';
    }

}, false);

audioElement.addEventListener('ended', () => {
  playButton.dataset.playing = 'false';
}, false);

// select our volume button
const volumeValue = document.getElementById('volume');
const volumeSvg = document.getElementById('volume_svg');
const volumeSvgDiv = document.getElementById('volume_svg_div');

let svgMouseDowned = false; 

const startSvgRotation = () => {
    svgMouseDowned = true;
}

volumeSvg.addEventListener("mousedown", startSvgRotation);


let cursor_direction = "";
let old_x = 0
let old_y = 0
let deg = 200;  // Default value for volume
const deltaDeg = 12; // Increment or decrement 4, 8, 12

const doSvgRotation = e => {

    if(svgMouseDowned == true) {

        let mouse_x = e.pageX;     // Get the vertical mouse coordinate
        let mouse_y = e.pageY;     // Get the vertical mouse coordinate


        if (mouse_y < old_y ) {
            direction="pos!";
            if(deg < 360.0 - deltaDeg) {
                deg+=deltaDeg;
                volumeSvg.style.transform = 'rotate('+deg+'deg)'; 

                if(audioContext) { // control the volume
                    let scaledVolume = (deg * 10.0)/360.0;
                    gainNode.gain.value = scaledVolume;
                }
            }  
        }
        if (mouse_y > old_y) {
            direction="neg!";
            if(deg > deltaDeg) {
                deg-=deltaDeg;
                volumeSvg.style.transform = 'rotate('+deg+'deg)'; 
    
                if(audioContext) { 
                    let scaledVolume = (deg * 10.0)/360.0;
                    gainNode.gain.value = scaledVolume;
                }
            } else if(audioContext) {
                let scaledVolume = 0.0;
                gainNode.gain.value = scaledVolume;
            }
        }
  

        /* later!
        if (mouse_x > old_x ) {
            direction="pos!";
            if(deg < 348) {
                deg+=deltaDeg;
                volumeSvg.style.transform = 'rotate('+deg+'deg)'; 

                if(audioContext) { // control the volume
                    let scaledVolume = (deg * 10.0)/360.0;
                    gainNode.gain.value = scaledVolume;
                }
            }  
        }
        if (mouse_x < old_x) {
            direction="neg!";
            if(deg > 12) {
                deg-=deltaDeg;
                volumeSvg.style.transform = 'rotate('+deg+'deg)'; 
    
                if(audioContext) { 
                    let scaledVolume = (deg * 10.0)/360.0;
                    gainNode.gain.value = scaledVolume;
                }
            } else if(audioContext) {
                let scaledVolume = 0.0;
                gainNode.gain.value = scaledVolume;
            }
        }
        */

       // old_x = e.pageX; 
        old_y = e.pageY;
    }
}

const stopSvgRotation = () => {
    //console.log(`stopSvGRotation mouse downed ${svgMouseDowned}`)
    if(svgMouseDowned == true) {
        svgMouseDowned = false;
        //old_x = volumeSvgDiv.offsetLeft + volumeSvgDiv.offsetWidth / 2;
        //old_y = volumeSvgDiv.offsetTop + volumeSvgDiv.offsetHeight / 2;
    } else {
        //console.log('nothing to do with svg');
    }
    //svgMouseDowned = false;
}
document.addEventListener('mousemove', doSvgRotation);
document.addEventListener('mouseup', stopSvgRotation);


// main canvas function
const canvas = document.getElementById('canvas');
/*
canvas.width = window.screen.availWidth; //document.body.clientWidth; 
canvas.height = window.screen.availHeight; //document.body.clientHeight;
*/
//canvas.width = window.screen.availWidth; //document.body.clientWidth; 
canvas.width = 525;
canvas.height = 255;
canvasW = canvas.width;
canvasH = canvas.height;

const ctxCanvas = canvas.getContext('2d');
const colorsArray = ['#4A4940', '#33322C', '#3D3C35', '#8A8878', '#C9C6AF', '#545445', '#464A3D', '#545145',
                     '#4A463D', '#3A3D32', '#45394A', '#392F3D', '#2F2C3D', '#364761', '#2D404A', '#4A4926'];
const shuffledColors = shuffle(colorsArray); //shuffles colors every refresh

//Main draw function for bar graphs
function draw(){
    var sliceWidth = bufferLength/16/2; //WARNING: 
    
    ctxCanvas.clearRect(0, 0, canvas.width, canvas.height);
    analyser.getByteFrequencyData(dataArray);

    //16 rectangle loop
    for(let i = 0; i < 16; i++) {

        var sum = 0;
        for(let j = 0; j < sliceWidth; j++){
            sum += dataArray[j + i * sliceWidth];
        }
        sum = sum/sliceWidth/2;

        ctxCanvas.fillStyle = colorsArray[i];
        ctxCanvas.fillRect(i * 33, canvas.height, 30, -sum); // to view without pressing play change sum
    }
}
setInterval(draw, 16); //calls draw every X ms

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  
    return array;
}
