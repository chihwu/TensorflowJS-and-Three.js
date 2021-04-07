$("#image-selector").change(function() {
    let reader = new FileReader();
    reader.onload = function() {
        let dataURL = reader.result;
        // console.log(dataURL);
        $("#selected-image").attr("src", dataURL);
        $("#prediction-list").empty();
    };

    let file = $("#image-selector").prop("files")[0];
    // console.log(file);
    reader.readAsDataURL(file)
});

let model;
(async function() {
    // console.log(tf.loadLayersModel);
    model = await tf.loadLayersModel("http://localhost:81/tuned_mobilenet_js/model.json");
    $(".progress-bar").hide();
})();

$("#predict-button").click(async function() {
    let image = $("#selected-image").get(0);
    // console.log("------------");
    // console.log(image);
    // console.log("------------");
    let offset = tf.scalar(127.5);
    let tensor = tf.browser.fromPixels(image)
                           .resizeNearestNeighbor([224, 224])
                           .toFloat()
                           .sub(offset)
                           .div(offset)
                           .expandDims();
    
    let predictions = await model.predict(tensor).data();
    console.log(predictions);
    let top5 = Array.from(predictions)
                    .map(function(p, i) {
                        return {
                            probability: p,
                            className: GESTURE_CLASSES[i]
                        };
                    }).sort(function(a, b) {
                        return b.probability - a.probability;
                    }).slice(0, 5);

    $("#prediction-list").empty();
    top5.forEach(function (p) {
        $("#prediction-list").append(`<li>${p.className}: ${p.probability.toFixed(6)}</li>`);
    });
});


const video = document.getElementById('webcam');
const liveView = document.getElementById('liveView');
const demosSection = document.getElementById('demos');
const enableWebcamButton = document.getElementById('webcamButton');

function getUserMediaSupported() {
    return !!(navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia);
}

if (getUserMediaSupported()) {
    enableWebcamButton.addEventListener('click', enableCam);
  } else {
    console.warn('getUserMedia() is not supported by your browser');
  }
  
  // Placeholder function for next step. Paste over this in the next step.
  function enableCam(event) {
    if (!model) {
        return;
    }

    event.target.classList.add('removed');  

    const constraints = {
        video: true
    };

    navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
        video.srcObject = stream;
        video.addEventListener('loadeddata', predictWebcam);
    });

    async function predictWebcam() {
         // Capture an image from the webcam using the Tensorflow.js data API
        //and store it as a tensor (resize to 224 x 224 size for mobilenet delivery).
        const webcam = await tf.data.webcam(video, {
            resizeWidth: 224,
            resizeHeight: 224,
        });

        // Capture an image tensor at a specific point in time.
        // const img = await webcam.capture();
        // Pass the data to the loaded mobilenet model.
        let offset = tf.scalar(127.5);
        let tensor = tf.browser.fromPixels(video)
                               .resizeNearestNeighbor([224, 224])
                               .toFloat()
                               .sub(offset)
                               .div(offset)
                               .expandDims();

        let predictions = await model.predict(tensor).data();
        // console.log(predictions);
        let top1 = Array.from(predictions)
                    .map(function(p, i) {
                        // console.log(GESTURE_CLASSES[i]);
                        return {
                            probability: p,
                            className: GESTURE_CLASSES[i]
                        };
                    }).sort(function(a, b) {
                        return b.probability - a.probability;
                    }).slice(0, 1);

        console.log(top1[0].className);

        window.requestAnimationFrame(predictWebcam);
    }

    demosSection.classList.remove('invisible');

  }