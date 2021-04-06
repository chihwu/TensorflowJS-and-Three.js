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
