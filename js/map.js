// El objeto tendrá
/*
El elemento del DOM donde se va a generar.
EL objeto google maps generado.
Objeto con las opciones del mapa que se aplicarán al crear el objeto de google maps
La última ventana abierta
Métodos con funciones para el mapa
  Añadir marcadores
  Ocultar marcadores
  Eliminar marcadores
  Personalizar la ventana de información
*/

var map = {

  init: function (mapSettings) {

    this.mapCanvas = mapSettings.mapCanvas;
    this.latlng = new google.maps.LatLng(mapSettings.coordinates.lat,mapSettings.coordinates.lng);
    this.mapOptions = {
      center: {lat: mapSettings.coordinates.lat, lng: mapSettings.coordinates.lng},
      zoom: mapSettings.zoom
    };
    this.map =  new google.maps.Map(this.mapCanvas, this.mapOptions);

  }

};

/*function setMap() {

  var settings = {
    mapCanvas: document.getElementById('map'),
    coordinates: {lat:-34.397, lng:150.644},
    zoom: 8
  };

  map.init(settings);

}

function loadGoogleMaps() {

  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCyCv1QFoG6XyV3BaG57glUqc2mHFqZDvU&libraries=places&v=3.exp' +
      '&signed_in=true&callback=setMap';
  document.body.appendChild(script);

}*/