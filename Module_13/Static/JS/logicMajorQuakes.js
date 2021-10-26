// Add console.log to check to see if our code is working.
console.log("working");


// We create the tile layer that will be the background of our map.
let satelliteStreets = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/satellite-streets-v11',
    accessToken: API_KEY
});

// to change map style, chage id: mapbox/dark-v10  /  mapbox/light-v10   /   mapbox/satellite-v9 / mapbox/streets-v11  mapbox/satellite-streets-v11


let dark = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/dark-v10',
    accessToken: API_KEY    
});

let light = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/light-v10',
    accessToken: API_KEY    
});




// Create a base layer for the maps
let baseMaps = {
    "Satellite Streets": satelliteStreets,
    "Dark": dark,
    "Light": light
};

// Create the map object with center, zoom leve, and default layer
let map = L.map('mapid', {
  center: [39.5, -98.5],
  zoom: 3,
  layers: [dark]
});


// Create Layer for earthquakes
let allEarthquakes = new L.layerGroup();
// Create layer for tectonic plates
let tectonic = new L.layerGroup();
// Create Major Earthquake Layer
let majorQuakes = new L.layerGroup();


// We define an object that contains the overlays.
// This overlay will be visible all the time.
let overlays = {
  "Recent 7-day Earthquakes": allEarthquakes,
  "Tectonic Plate Boundaries": tectonic,
  "Major Quakes over 4.5": majorQuakes
};

// Then we add a control to the map that will allow the user to change
// which layers are visible.
L.control.layers(baseMaps, overlays).addTo(map);


// Add GeoJSON data.
// JSON data must be read from a URL for security
let earthQuakeDataSevenDay = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
let tectonicData = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Retrieve the earthquake GeoJSON data.
d3.json(earthQuakeDataSevenDay).then(function(data) {

  // This function returns the style data for each of the earthquakes we plot on
  // the map. We pass the magnitude of the earthquake into two separate functions
  // to calculate the color and radius.
  function styleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: getColor(feature.properties.mag),
      color: "#000000",
      radius: getRadius(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
  }

  // This function determines the color of the marker based on the magnitude of the earthquake.
  function getColor(magnitude) {
    if (magnitude > 5) {
      return "#ea2c2c";
    }
    if (magnitude > 4) {
      return "#ea822c";
    }
    if (magnitude > 3) {
      return "#ee9c00";
    }
    if (magnitude > 2) {
      return "#eecc00";
    }
    if (magnitude > 1) {
      return "#d4ee00";
    }
    return "#98ee00";
  }

  // This function determines the radius of the earthquake marker based on its magnitude.
  // Earthquakes with a magnitude of 0 were being plotted with the wrong radius.
  function getRadius(magnitude) {
    if (magnitude === 0) {
      return 1;
    }
    return magnitude * 4;
  }

  // Creating a GeoJSON layer with the retrieved data.
  L.geoJson(data, {
    	// We turn each feature into a circleMarker on the map.
    	pointToLayer: function(feature, latlng) {
      		// console.log(data);
      		return L.circleMarker(latlng);
        },
      // We set the style for each circleMarker using our styleInfo function.
    style: styleInfo,
     // We create a popup for each circleMarker to display the magnitude and location of the earthquake
     //  after the marker has been created and styled.
     onEachFeature: function(feature, layer) {
      layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
    }
  }).addTo(allEarthquakes);

  // Then we add the earthquake layer to our map.
  allEarthquakes.addTo(map);
}); 



// Tectonic Plates
d3.json(tectonicData).then(function(data) {
  // Tectonic plate style
  let tectonicStyle = {
    color: "lightblue",
    weight: 1.5
  }

  // Add tectonic plates to the map
  L.geoJson(data, {
    style: tectonicStyle,
    onEachFeature: function(feature, layer){
      // console.log(layer);
    }
  }).addTo(tectonic);

  tectonic.addTo(map);
});






// Large Earth Quakes
d3.json(earthQuakeDataSevenDay).then(function(data) {

  // style for Large Eath Quakes
  function largeQuakeStyle(feature) {
    return {
      opacity: 1,
      fillOpacity: .75,
      fillColor: getColorMajorQuake(feature.properties.mag),
      color: "#000000",
      radius: getRadiusMajorQuake(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
  }


  function getColorMajorQuake(magnitude) {
    if (magnitude > 6) {
      return "#EC1C23";
    }
    if (magnitude > 5) {
      return "#54044D";
    }
    return "#990BFE";
  }

  function getRadiusMajorQuake(magnitude) {
    if (magnitude === 0) {
      return 0;
    }
    return magnitude ** 2;
  }


  // // Add Major Quakes to the map
  L.geoJson(data, {
    filter: function(feature) {
      if (feature.properties.mag > 4.5)
      return true;
    },
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng);
    },
    style: largeQuakeStyle,
    onEachFeature: function(feature, layer) {
      layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: "+ feature.properties.place);
    }
  }).addTo(majorQuakes);
  majorQuakes.addTo(map);
});





// Custom Legend Control
var legend = L.control({
  position: 'bottomright'
});

legend.onAdd = function() {
  let div = L.DomUtil.create('div', 'info legend');
  const magnitudes = [0, 1, 2, 3, 4, 5];
  const colors = [
    "#98ee00",
    "#d4ee00",
    "#eecc00",
    "#ee9c00",
    "#ea822c",
    "#ea2c2c"
  ];

// Looping through our intervals to generate a label with a colored square for each interval.
for (var i = 0; i < magnitudes.length; i++) {
  console.log(colors[i]);
  div.innerHTML +=
    "<i style='background: " + colors[i] + "'></i> " +
    magnitudes[i] + (magnitudes[i + 1] ? "&ndash;" + magnitudes[i + 1] + "<br>" : "+");
}
return div;
};

legend.addTo(map);