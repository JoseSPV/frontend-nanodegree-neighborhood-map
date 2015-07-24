/* HAY QUE AÑADIR COMPROBACIONES A LOS DATOS QUE SE PASAN A LAS FUNCIONES. SABER SI VIENEN VACÍOS Y TODO ESO NIGGER*/
 //"use strict";

var foursquareApi = {
  baseUrl: 'https://api.foursquare.com/v2/venues/search?client_id=TV0CTIVNSUNU01JHA1UT5ZJJUOMMZGOL5FDOPKFNYV5AS1X2&client_secret=B5D1VLCQLL1ACDJG50NXK3U0BHJSKD3Y4X3ZGRPCEAEB3JFA&v=20150715',

  setRequest: function(requestType, where, resultsLimit) {

    //mejorar esta comprobación
    if(requestType && where) {

      var limit = resultsLimit || 50; //no se puede más de 50;
      var query = '';

      switch (requestType) {
        case 'venue': query = '&near=' + where + '&limit=' + limit;
                      break;
        default:  query = '&near=' + where + '&limit=' + limit;
                  break;

      };

      return this.baseUrl + query;
    }

  }
};


// Class that stores a location
var Location = function(address, coordinates) {
  var self = this;
  self.address = address;
  self.coordinates = coordinates;
};


// Class that stores an interest point
var InterestPoint = function(ipData) {
  var self = this;
  self.name = ipData.name;
  self.address = ipData.address;
  self.coordinates = ipData.coordinates;
  self.category = ipData.category;
  self.marker = ipData.marker;

};

var MapMarker = function (map, name, lat, lon, text) {

  var self = this;

  self.name = ko.observable(name);
  self.lat  = ko.observable(lat);
  self.lon  = ko.observable(lon);
  self.text = ko.observable(text);
  self.isVisible = ko.observable(true);

  var marker = new google.maps.Marker({
    position : new google.maps.LatLng(lat, lon),
    animation: google.maps.Animation.DROP,
    title: name
  });

  self.showHideMarker = ko.computed(function() {
    if(self.isVisible()) {
      marker.setMap(map);
    } else {
      marker.setMap(null);
    }
  });
};

// Viewmodel class that holds the current location and manages the location change
var Search = function () {
  var self = this;


  // Stores the locations searched
  // TO-DO: Store in local cache and try to retrieve the information whenever the application is launched let it empty if no data is found
  self.locations = ko.observableArray([]);
  self.interestPoints = ko.observableArray([]);
  self.markers = ko.observableArray([]);

  self.address = ko.observable();
  self.coordinates = ko.observable(false);
  self.mapCreated = ko.observable(false);
  self.currentMap = ko.observable();
  self.searchTerm = ko.observable('');

  // used to update the map
  self.mapData = ko.computed(function() {
        return {
            center: self.coordinates,
            mapCreated: self.mapCreated,
            map: self.currentMap
        };
  });

 // used to update the ui
 self.filterResults = ko.computed(function() {
    // Represents a filtered list of planets
    // i.e., only those matching the "typeToShow" condition
    var query = self.searchTerm().toLowerCase();

    return ko.utils.arrayFilter(self.interestPoints(), function(point) {
      var isFiltered = point.name.toLowerCase().indexOf(query) >= 0;
      point.marker.isVisible(isFiltered);

      //console.log(self.interestPoints());

      return isFiltered;
    });

  });



  self.populateInterestPoints = function (address) {


    // OJO hay que usar coordenadas el near no funciona bien con ciertas direcciones de autocomplete
    var request = foursquareApi.setRequest('venue',address,20);

    self.interestPoints.removeAll();

    $.ajax({
      url: request,
      dataType: "json",
      success: function( data ) {

        var points = [];
        var markers = [];
        //Private variable to format the interest point data
        var pointData = {
          name: '',
          address: '',
          coordinates: [],
          map: '',
          category: ''
        };

        /*var markerData = {
          lat: 0,
          lng: 0,
          map: {},
          title: ''
        }*/

        for(var i = 0; i < data.response.venues.length; i++) {

          pointData.category = (data.response.venues[i].categories.length > 0) ? data.response.venues[i].categories[0].name: '';
          pointData.name = data.response.venues[i].name;
          pointData.address = data.response.venues[i].location.address;
          pointData.coordinates = [data.response.venues[i].location.lat, data.response.venues[i].location.lng];
          pointData.marker = new MapMarker(self.currentMap(),i.toString(),data.response.venues[i].location.lat,data.response.venues[i].location.lng,data.response.venues[i].name);

          //separar y poner en otra función
          /*markerData.lat = data.response.venues[i].location.lat;
          markerData.lng = data.response.venues[i].location.lng;
          markerData.title = data.response.venues[i].name;
          markerData.map = self.currentMap();*/
          //console.log(pointData);
          points.push(new InterestPoint(pointData));
          //markers.push(new MapMarker(self.currentMap(),i.toString(),data.response.venues[i].location.lat,data.response.venues[i].location.lng,data.response.venues[i].name));
        }

        self.interestPoints(points);
      },
      error: function () {
        console.log('falló');
      }
    });
  };

  // We store the new location into our array
  self.addLocation = function (location) {
    self.locations.push(location);
    self.address(location.address);
    self.coordinates(location.coordinates);

    self.populateInterestPoints(self.address());
  };
};

// Bind to create or update a map when an address is introduced
ko.bindingHandlers.updateMap = {
  update: function (element, valueAccessor, allBindings) {
    var self = this;

    self.mapStatus = valueAccessor();

    if(!self.mapStatus().mapCreated() && self.mapStatus().center() !== false) {

      console.log('create map');

      self.map = new google.maps.Map(element, {
        mapTypeId: google.maps.MapTypeId.ROADMAP
      });
      self.map.panTo(self.mapStatus().center());
      self.map.setZoom(15);

      self.mapStatus().mapCreated(true);
      self.mapStatus().map(self.map);

    } else if(self.mapStatus().mapCreated() && self.mapStatus().center() !== false) {

      console.log('update');

      self.map.panTo(self.mapStatus().center());
      self.map.setZoom(15);
    }

  }
};

// Bind autocomplete with our UI
ko.bindingHandlers.getLocation = {
    init: function (element, valueAccessor, allBindings) {

        // Get the serchfield text to be used by the Autocomplete

        var self = this;
        self.newLocation = valueAccessor();
        self.searchField = element;

        // Autocomplete settings
        self.defaultBounds = new google.maps.LatLngBounds(new google.maps.LatLng(-90, -180),new google.maps.LatLng(90, 1801));
        self.autocompleteOptions = {
          types: ['(cities)'],
          bounds: self.defaultBounds,
        };
        self.autocomplete = new google.maps.places.Autocomplete(self.searchField, self.autocompleteOptions);

        google.maps.event.addListener(self.autocomplete, 'place_changed', function() {

            var location = self.autocomplete.getPlace();

            if(location.geometry) {
              //comprobar que no queda vacío y añadir algo para prevenir usos incorrectos y feedback

              var locationData = new Location(location.formatted_address,location.geometry.location);
              self.newLocation(locationData);
            }
        });
    },
    update: function (element, valueAccessor, allBindingsAccessor) {
        ko.bindingHandlers.value.update(element, valueAccessor);
    }
};

$( document ).ready(function() {
  var currentSearch = new Search();

  ko.applyBindings(currentSearch);

});
