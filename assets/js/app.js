const map = L.map("map", {
  zoomSnap: L.Browser.mobile ? 0 : 1,
  tap: false,
  maxZoom: 20,
  zoomControl: false,
  renderer: L.canvas({
    padding: 0.5,
    tolerance: 10
  })
}).fitBounds([[44.64, -72.81], [42.43, -77.72]]);
map.attributionControl.setPrefix("");

const layers = {
  basemaps: {
    "Streets": L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.@2xpng", {
      maxNativeZoom: 18,
      maxZoom: map.getMaxZoom(),
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attribution">CARTO</a>'
    }).addTo(map),
    "Aerial": L.tileLayer.wms("https://orthos.its.ny.gov/ArcGIS/services/wms/Latest/MapServer/WMSServer", {
      layers: "0,1,2,3",
      format: "image/png",
      transparent: true,
      maxNativeZoom: 18,
      maxZoom: map.getMaxZoom(),
      attribution: "NYS ITS - GPO"
    }),
    "Topo": L.tileLayer("https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}", {
      maxNativeZoom: 16,
      maxZoom: map.getMaxZoom(),
      attribution: "USGS",
    })
  },
  overlays: {
    "Labels": L.featureGroup().addTo(map),
    "Major Roads": L.featureGroup().addTo(map),
    "Public Land": L.featureGroup().addTo(map),
    "Sample Units": L.featureGroup().addTo(map)
  },
  measure: {
    group: L.featureGroup().addTo(map),
    line: L.polyline([], {
      interactive: false,
      weight: 3
    })
    .addTo(map)
    .showMeasurements({imperial: false, showTotalDistance: true, minDistance: 0})
  }
};

/*** Begin Zoom Extent Control ***/
L.Control.ZoomExtent = L.Control.extend({
  onAdd: function(map) {    
    const div = L.DomUtil.create("div", "leaflet-bar leaflet-control");
    div.innerHTML = `
      <a class='leaflet-bar-part leaflet-bar-part-single zoom-extent-btn' title='Zoom To Map' id='zoom-extent-btn'>
        <i class='icon-zoom_out_map'></i>
      </a>
    `;
    L.DomEvent.on(div, "click", function (e) {
      L.DomEvent.stopPropagation(e);
    });
    return div
  }
});

L.control.zoomextent = (opts) => {
  return new L.Control.ZoomExtent(opts);
}
/*** End custom control ***/

/*** Begin Measure Control ***/
L.Control.Measure = L.Control.extend({
  onAdd: function(map) {    
    const div = L.DomUtil.create("div", "leaflet-bar leaflet-control");
    div.innerHTML = `
      <a class='leaflet-bar-part leaflet-bar-part-single measure-btn' title='Zoom To Map' id='measure-btn'>
        <i class='icon-straighten'></i>
      </a>
    `;
    L.DomEvent.on(div, "click", function (e) {
      L.DomEvent.stopPropagation(e);
    });
    return div
  }
});

L.control.measure = (opts) => {
  return new L.Control.Measure(opts);
}
/*** End custom control ***/

const controls = {
  layerCtrl: L.control.layers(layers.basemaps, layers.overlays, {
    collapsed: true,
    position: "topright"
  }).addTo(map),

  measureCtrl: L.control.measure({
    position: "bottomright"
  }).addTo(map),

  zoomCtrl: L.control.zoomextent({
    position: "bottomright"
  }).addTo(map),

  locateCtrl: L.control.locate({
    icon: "icon-gps_fixed",
    iconLoading: "spinner icon-gps_fixed",
    setView: "untilPan",
    cacheLocation: true,
    position: "bottomright",
    flyTo: false,
    initialZoomLevel: 14,
    keepCurrentZoomLevel: false,
    circleStyle: {
      interactive: false
    },
    markerStyle: {
      interactive: true
    },
    metric: false,
    strings: {
      title: "My location",
      outsideMapBoundsMsg: "You seem to be located outside the New York State boundary!",
      popup: (options) => {
        const loc = controls.locateCtrl._marker.getLatLng();
        return `<div style="text-align: center;">You are within ${Number(options.distance).toLocaleString()} ${options.unit}<br>from <strong>${loc.lat.toFixed(6)}</strong>, <strong>${loc.lng.toFixed(6)}</strong></div>`;
      }
    },
    locateOptions: {
      enableHighAccuracy: true,
      maxZoom: 18
    },
    onLocationError: (e) => {
      hideLoader();
      document.querySelector(".leaflet-control-locate").getElementsByTagName("span")[0].className = "icon-gps_off";
      alert(e.message);
    }
  }).addTo(map),

  scaleCtrl: L.control.scale({
    position: "bottomleft"
  }).addTo(map)
};

function ZoomToExtent() {
  map.fitBounds(layers.overlays["Sample Units"].getBounds());
}

function showLoader() {
  document.getElementById("loader").style.display = "block";
}

function hideLoader() {
  document.getElementById("loader").style.display = "none";
}

function resize() {
  document.body.setAttribute("style", `padding-top:${document.getElementById("navbar").clientHeight}px;`);
  map.invalidateSize();
}

document.getElementById("zoom-extent-btn").onclick = function(){
  ZoomToExtent();
};

document.getElementById("measure-btn").onclick = function(){
  measure.startMeasurement();
};

document.getElementById("measure-toast").addEventListener("hidden.bs.toast", function () {
  measure.clearMeasure();
})

const measure = {
  toast: new bootstrap.Toast(document.getElementById("measure-toast")),
  startMeasurement: function() {
    measure.toast.show();
    document.getElementById("crosshair").style.visibility = "visible";
    map.on("click", measure.clickListener);
    map.on("drag", measure.dragListener);
    map.on("zoom", measure.dragListener);
  },
  clearMeasure: function() {
    layers.measure.group.clearLayers();
    layers.measure.line.setLatLngs([]);
    map.off("click", measure.clickListener);
    map.off("drag", measure.dragListener);
    map.off("zoom", measure.dragListener);
    document.getElementById("crosshair").style.visibility = "hidden";
    document.getElementById("total-distance").innerHTML = "0";
  },
  getTotalMeasurement: function () {
    const measureSegments = layers.measure.line._measurementLayer.getLayers();
    const totalSegments = measureSegments.length;
    if (totalSegments > 0) {
      const lastSegment = measureSegments[totalSegments - 1];
      const totalDist = lastSegment._measurement;
      layers.measure.line._measurementLayer.removeLayer(lastSegment._leaflet_id);
      return(totalDist);
    }
  },
  clickListener: function() {
    layers.measure.line.addLatLng(map.getCenter());
    layers.measure.line.updateMeasurements();
    layers.measure.group.addLayer(
      L.circleMarker(map.getCenter(), {
        interactive: false,
        color: "#2A93EE",
        fillColor: "#fff",
        fillOpacity: 1,
        interactive: false,
        opacity: 1,
        radius: 5,
        weight: 2
      })
    )
    measure.getTotalMeasurement();
  },
  dragListener: function() {
    let points = layers.measure.line.getLatLngs();
    if (points.length > 0) {
      if (points.length > 1) {
        points.pop(); 
      }
      points.push(map.getCenter());
      layers.measure.line.setLatLngs(points);
      document.getElementById("total-distance").innerHTML = measure.getTotalMeasurement();
    }
  }
}

map.on("moveend", function(e) {
  layers.overlays["Labels"].clearLayers();
  if (map.getZoom() >= 12) {
    layers.overlays["Sample Units"].eachLayer(function (layer) {
      const mapBounds = map.getBounds();
      const layerBounds = layer.getBounds();
      if (mapBounds.intersects(layerBounds)) {
        const feature = layer.toGeoJSON().features[0];
        const bboxPoly = turf.helpers.polygon([[
          [mapBounds.getSouthWest().lng, mapBounds.getSouthWest().lat],
          [mapBounds.getSouthEast().lng, mapBounds.getSouthEast().lat],
          [mapBounds.getNorthEast().lng, mapBounds.getNorthEast().lat],
          [mapBounds.getNorthWest().lng, mapBounds.getNorthWest().lat],
          [mapBounds.getSouthWest().lng, mapBounds.getSouthWest().lat]
        ]]);
        const intersection = turf.intersect(feature, bboxPoly);
        if (intersection) {
          const centroid = turf.centroid(intersection);
          L.marker([centroid.geometry.coordinates[1], centroid.geometry.coordinates[0]], {
            icon: L.divIcon({
              iconSize: null,
              html: `<div style="border: unset; background: unset; font-size: 16px; font-weight: bold; color: #ff7a50; text-shadow: 1px 1px white;">${layer.getLayers()[0].feature.properties["id"]}</div>`,
              className: '',
              iconAnchor:[25,15]
            }),
            interactive: false
          }).addTo(layers.overlays["Labels"]);
        }      
      }
    });
  }
});

window.addEventListener("resize", (e) => {
  resize();
});


document.addEventListener("DOMContentLoaded", async () => {
  resize();

  const infoModal = new bootstrap.Modal(document.getElementById("info-modal")).toggle();
  const response = await fetch("data/samplegrid.fgb");
  const response2 = await fetch("data/publicland.fgb");
  const response3 = await fetch("data/roads.fgb");
  for await (let feature of flatgeobuf.deserialize(response2.body, undefined, null)) {
    const defaultStyle2 = {
      color: "green",
      weight: 1,
      fillOpacity: 0.2
    };

    const layer2 = L.geoJSON(feature, {
      style: defaultStyle2,
      interactive: false
    })
    layers.overlays["Public Land"].addLayer(layer2);
  }

  for await (let feature of flatgeobuf.deserialize(response3.body, undefined, null)) {
    const defaultStyle3 = {
      color: "black",
      weight: 1
    };

    const layer3 = L.geoJSON(feature, {
      style: defaultStyle3,
      interactive: false
    })
    layers.overlays["Major Roads"].addLayer(layer3);
  }


  for await (let feature of flatgeobuf.deserialize(response.body, undefined, null)) {
    const defaultStyle = {
      color: "#ff7a50",
      weight: 2,
      fillOpacity: 0
    };

    const layer = L.geoJSON(feature, {
      style: defaultStyle,
      interactive: false
    }).on({
      // "mouseover": function (e) {
      //   const layer = e.target;
      //   layer.setStyle({
      //     color: 'blue',
      //     weight: 4,
      //     fillOpacity: 0.7,
      //   });
      //   layer.bringToFront();
      // },
      // "mouseout": function (e) {
      //   const layer = e.target;
      //   layer.setStyle(defaultStyle);
      // },
      "click": function (e) {
        // console.log(feature.properties["id"].toString());
      }
    }).bindPopup(`<div style="font-size: 16px; font-weight: bold; color: #ff7a50;">'${feature.properties["id"].toString()}'</div>`)
    layers.overlays["Sample Units"].addLayer(layer);
  }


  

 // ZoomToExtent();
  hideLoader();
});