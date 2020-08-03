
var url = "assets/data/data.csv"

console.log(statesData.features.length)

var array;

$.get(url, function(data, status) {
    array = $.csv.toObjects(data);

    for (var i = 0; i < array.length; i++) {
        statesData.features.forEach(function(feature) {
            if (array[i]["state"] == feature.properties.name) {
                feature.properties["abbr"] = array[i]["abbr"]
                feature.properties["age"] = array[i]["age"]
                feature.properties["healthcare"] = array[i]["healthcare"]
                feature.properties["income"] = array[i]["income"]
                feature.properties["obesity"] = array[i]["obesity"]
                feature.properties["poverty"] = array[i]["poverty"]
                feature.properties["smokes"] = array[i]["smokes"]
            };
        });
    };
});

console.log(statesData);