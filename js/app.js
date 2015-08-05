//"use strict";
/**
* Stores the available Google Maps Icons
*/
var googlMapsIcons = {
  main: 'images/map_icons/main_dot.png',
  point: 'images/map_icons/point.png'
};

var infoWindowMarkup = {
  header: '<div class="row infoWindow"><div class="col-xs-12"><h4>%data%</h4></div>',
  address: '<div class="col-xs-12 col-md-6 infoWindow-data-group"><i class="glyphicon glyphicon-map-marker infoWindow-data"></i><span>%data%</span></div>',
  phone: '<div class="col-xs-12 col-md-6 infoWindow-data-group"><i class="glyphicon glyphicon-earphone infoWindow-data"></i><span>%data%</span></div>',
  web: '<div class="col-xs-12"><a href="%data%" target="_blank" title="%data%">%data%</a></div>',
  end: '</div>'
};


var errorMessages = {
  googleMaps: "Oops! We cannot coonnect with Google. Please check your internet connection :)",
  foursquare: {
    getCategories: 'Caca cat'
  }
}

var request = {
  status: 'ok',
  data: false,
  message: ''
};

/* Stores the animations and effects of the UI */
var animations = {
  toggleMenu: function () {
    $("#menu-toggler").toggleClass('show-menu');
  },
  showList: function () {
    $('#sidebar').toggleClass('is-hidden col-xs-2');
    $('#main').toggleClass('col-xs-12 col-xs-10');
  },
  displayHidden: function () {
    $(".filter-box-wrapper,.buttons-list").removeClass('is-hidden');
  },
  removeBg: function () {
    $("#map").removeClass('show-bg');
  },
  showProgressBar: function() {
    $(".progress").fadeIn('fast');
  },
  progressbar: function (value) {
    if(value === 100) {
      $(".progress-bar").css('width', value+'%');
      $(".progress").delay(800).fadeOut('slow');
      //debugger;
    }
    else {
      $(".progress-bar").css('width', value+'%');
      //debugger;
    }
  },
  setWarning: function () {
    //$(".progress-bar").toggleClass('progress-bar-success','progress-bar progress-bar-warning');
  },
};

/**
* @class {FoursquareApi} Stores the Foursquare API data and some useful functions
*/
var FoursquareApi = function () {

  var self = this;

  self.clientId = 'TV0CTIVNSUNU01JHA1UT5ZJJUOMMZGOL5FDOPKFNYV5AS1X2';
  self.clientSecret = 'B5D1VLCQLL1ACDJG50NXK3U0BHJSKD3Y4X3ZGRPCEAEB3JFA';
  self.referenceDate = '20150715';
  self.baseUrl = 'https://api.foursquare.com/v2/venues/search?client_id=' + self.clientId + '&client_secret=' + self.clientSecret + '&v=' + self.referenceDate;

  /**
  * @function setRequest
  * @desc prepares an AJAX request to get same data from the Foursquare API
  * @param {string} where - The coordinates of the location to search
  * @param {int=} categoryId - Optional the category used to filter the results
  * @param {int=} resultsLimit - Optional the number of results we want to receive
  * @returns {string} FoursquareApi.baseUrl + query - The "url" for the request
  */
  self.setRequest = function(where, categoryId, resultsLimit) {

    if(where) {

      var query = '';
      var category = '&categoryId=' + categoryId || '';
      var limit = resultsLimit || 5; //Max limit 50;

      query = '&ll=' + where + category + '&limit=' + limit + '&llAcc=2000&radius=1000';

      return self.baseUrl + query;
    }

  };

  /**
  * Send a request to the Foursquare API to retrieve all the parent categories.
  * @param {FoursquareApi~requestCallback} callback - The callback that handles the response.
  */
  self.getCategories = function(callback){

    $.ajax({
      url: 'https://api.foursquare.com/v2/venues/categories?client_id=' + self.clientId + '&client_secret=' + self.clientSecret + '&v=' + self.referenceDate,
      dataType: "json",
      success: function( data ) {
        var categories = [];

        categoriesFound = data.response.categories.length;
        for(var i = 0; i < categoriesFound; i++){
          categories.push({
            id: data.response.categories[i].id,
            name: data.response.categories[i].name,
            icon: data.response.categories[i].icon.prefix + '32' + data.response.categories[i].icon.suffix
          });
        }

        // Preparing the request response (see {@linkg request})
        request.status = 'ok';
        request.data = categories;
        request.message = '';

        callback(request);
      },
      error: function () {

        // Preparing the request response (see {@linkg request})
        request.status = 'error';
        request.data = false;
        request.message = errorMessages.foursquare.getCategories;

        callback(request);
      }

    });

  };

  self.getVenues = function(formattedCoordinates,filters,limit,callback) {

    var requestUrl = '';
    var currentCategory = {};

    var filtersToApply = filters.length;
    for(var i = 0; i < filtersToApply; i++) {

      requestUrl = self.setRequest(formattedCoordinates,filters[i].id,limit);

      (function(index,category) {
        $.ajax({
          url: requestUrl,
          dataType: "json",
          success: function( data ) {

            // Preparing the request response (see {@linkg request})
            request.status = 'ok';
            request.data = data;

            callback(request,category);

          },
          error: function () {

            // Preparing the request response (see {@linkg request})
            request.status = 'error';
            request.data = false;
            request.message = errorMessages.foursquare.getCategories;

            callback(request,category);
          }
        });
      })(i,filters[i]);
    }

  };

};

/**
* @class {Location} Stores a location
* @param {int} id - Id of the location
* @param {string} name - Name of the location
* @param {string} address - Address in Google Maps format of the location
* @param {array} coordinates - Coordinates of the location (geocoded address)
*/
var Location = function(id, name, address, coordinates) {
  var self = this;

  self.id = id;
  self.name = name;
  self.address = address;
  self.coordinates = coordinates;
};

/**
* @class {InterestPoint} - Stores an interest point
* @param {object} ipData - The interest point data
* @param {string} ipData.id - Id of the point
* @param {string} ipData.name - Name of the point
* @param {string} ipData.address - Address in Foursquare format of the point
* @param {array} ipData.coordinates - Coordinates of the location (geocoded address)
* @param {string} ipData.category - Category of the point (restaurant, hotel, etc)
* @param {marker} ipData.marker - @see {@link hideMapMarkers}
*/
var InterestPoint = function(ipData) {
  var self = this;

  self.id = ipData.id;
  self.name = ipData.name;
  self.address = ipData.address;
  self.coordinates = ipData.coordinates;
  self.category = ipData.category;
  self.marker = ipData.marker;

  /** @function openInfoWindow
  * Opens the info window on the map and sets its content. The function also centers the map on the point
  */
  self.openInfoWindow = function(point) {
    var marker = point.marker.marker;
    var map = point.marker.map;

    var infoWindow = point.marker.infoWindow.infoWindow;
    var infoWindowContent = point.marker.infoWindowContent();

    map.setCenter(marker.getPosition());
    infoWindow.setContent(infoWindowContent);
    infoWindow.open(map, marker);
  };
};

/**
* @class {WikiArticle} - Stores an article of the WikiPedia
* @param {object} wikiData - The Wiki article data
* @param {string} wikiData.title - Title of the article
* @param {string} wikiData.url - Url of the article
*/
var WikiArticle = function (wikiData) {
  var self = this;

  self.title = wikiData.title;
  self.url = wikiData.url;
};

/**
* @class {MapMarker} - Stores a Google Maps map marker and the listeners associated to it
* @param {object} markerData - The Marker data
* @param {int} markerData.id - Id of the marker
* @param {string} markerData.name - Name used as title of the marker
* @param {string} markerData.text - Text description of the marker
* @param {LatLng} markerData.position - Google Maps LatLng object
* @param {InfoWindow} markerData.infoWindow - Google Maps InfoWindow object
* @param {string} markerData.icon - Image used to set the icon of the marker @see {@link googlMapsIcons}
* @param {array} markerData.markersArray - Holds the markers shown currently on the map
*/
var MapMarker = function (markerData) {
  var self = this;

  self.id = markerData.id;
  self.title = markerData.title;
  self.address = markerData.address;
  self.phone = markerData.phone;
  self.web = markerData.web;

  self.position = markerData.position;
  self.map = markerData.map;
  self.infoWindow = markerData.infoWindow;
  self.icon = markerData.icon;

  /* Sets the visibility of the marker on the map */
  self.isVisible = ko.observable(false);

  /* Creates a Google Maps Marker Object */
  self.marker = new google.maps.Marker({
    id: self.id,
    position : self.position,
    animation: google.maps.Animation.DROP,
    icon: self.icon,
    title: self.title
  });

  /* Adds the marker to the markers array used to control which markers are shown on map */
  if(markerData.markersArray) {
    markerData.markersArray.push(self.marker);
  }

  /**
  * @function infoWindowContent
  * @desc Generates the infoWindow content based on the title and text data
  * @param {string} title - The title
  * @param {string} text - The description
  */
  self.infoWindowContent = ko.computed(function() {

    var html = infoWindowMarkup.header.replace("%data%", self.title);

    if(self.address !== '') {
      html += infoWindowMarkup.address.replace("%data%", self.address);
    }

    if(self.phone !== '') {
      html += infoWindowMarkup.phone.replace("%data%", self.phone);
    }

    if(self.web !== '') {
      html += infoWindowMarkup.web.replace(/%data%/g, self.web);
    }

    html += infoWindowMarkup.end;

    return html;
  });

  /* Adds a google.maps.event listener to the marker in order to know when the marker is clicked */
  google.maps.event.addListener(self.marker, 'click', function () {

    /* Sets the infoWindow content and centers the map */
    self.map.setCenter(self.marker.getPosition());
    self.infoWindow.infoWindow.setContent(self.infoWindowContent());
    self.infoWindow.infoWindow.open(self.map, self.marker);

  });

  /**
  * @function showHideMarker
  * @des Hides or show the marker
  * @param {bool} isVIsible - ko.observable that controls the visibility of the marker
  */
  self.showHideMarker = ko.computed(function() {
    if(self.isVisible()) {
      self.marker.setMap(self.map);
    } else {
      self.marker.setMap(null);
    }
  });
};

/**
* @class {Search} - ViewModel that stores the current location and all the necessary to update the interface and the models
*/
  var Search = function () {
    var self = this;

    self.initApp = function () {

      self.address = ko.observable('');
      self.locationId = ko.observable();
      self.coordinates = ko.observable(false);

      self.locations = ko.observableArray([]);
      self.storedPoints = {};
      self.visiblePoints = ko.observableArray([]);

      // Wikimedia
      self.wikiArticles = ko.observableArray([]);

      self.loadDataController = {///*****
        dataToLoad: 0,
        dataLoaded: 0,
        dataNotLoaded: 0,
        progressBarControl: {
          increase: 10,
          progress: 10
        },
        reset: function () {
          this.dataToLoad = 0;
          this.dataLoaded = 0;
          this.dataNotLoaded = 0;
          this.progressBarControl = {
            increase: 10,
            progress: 0
          };
        }
      };

      self.initUI();
      self.initFilters();
      self.initMap();
      self.initFoursquare(5);
    }

    /* Intializes the app UI controller */
    self.initUI = function () {
      self.appUI = {
        showList: ko.observable(false),
        showHidden: ko.observable(false),
        showFilters: ko.observable(false),
        allowFilters: ko.observable(false)
      };

      self.displayHiddenElements = ko.computed(function(){
        if(self.appUI.showHidden()) {
          animations.displayHidden();
        }
      });

      self.displayList = ko.computed(function(){
        if(self.appUI.showList()) {
          animations.showList();
        }
      });
    };

    self.initFilters = function () {
      'use strict';
      self.appFilters = {
        categoriesFilters: [],
        lastCategorySelected: '',
        searchTerm: ko.observable(''),
        visibleCategoriesFilters: ko.observableArray([]),

        reset: function () {
          this.visibleCategoriesFilters.removeAll();
          this.lastCategorySelected = '';
          this.searchTerm('');
        }

      };

      // used to update the ui
      self.filteredData = ko.computed(function() {
        var query = self.appFilters.searchTerm().toLowerCase();

        return ko.utils.arrayFilter(self.visiblePoints(), function(point) {
          var isFiltered = point.name.toLowerCase().indexOf(query) >= 0;
          point.marker.isVisible(isFiltered);

          return isFiltered;
        });

      });

    };

    self.initFoursquare = function (resultsLimit) {
      self.foursquareApi = new FoursquareApi();
      self.resultsLimit = resultsLimit;
      self.foursquareApi.getCategories(populateCategoriesFilters); //only once see documentation

      /**
      * Callback used by FoursquareApi.getCategories
      * @callback FoursquareApi.getCategories
      * @param {object} The categories of Foursquare
      */
      function populateCategoriesFilters(response) {
        if(response.status === 'ok') {
          self.appFilters.categoriesFilters = response.data;
          self.loadDataController.dataToLoad = self.appFilters.categoriesFilters.length - 1;
        } else {
          console.log('error');
        }

      }
    };

    self.initMap = function () {
      self.markers = [];
      self.mapCreated = ko.observable(false);
      self.currentMap = ko.observable();
      self.mapBounds = new google.maps.LatLngBounds();

      // used to update the map RENOMBRAR A CREATE MAP o a MAP
      self.mapData = ko.computed(function() {
        return {
          center: self.coordinates,
          mapCreated: self.mapCreated,
          map: self.currentMap
        };
      });

      self.infoWindowWrapper = {
        infoWindow: new google.maps.InfoWindow({
          maxWidht: 300
        }),
      };
    };



    /**
    * Callback used by FoursquareApi.getVenues
    * @callback FoursquareApi.getVenues
    * @param {object} The categories of Foursquare
    */
    function populateInterestPoints (response, category) {

      if(response.status === 'ok') {

        if(response.data.response.venues.length > 0) {

          var venues = $.map(response.data.response.venues, function(venue) {
            var point = new InterestPoint({
              // Interest Point
              id: venue.id,
              name: venue.name,
              address: venue.location.address || '',
              coordinates: [venue.location.lat, venue.location.lng],
              category: venue.categories[0].name,
              // Map marker
              marker: new MapMarker({
                id: 'marker_' + venue.id,
                map: self.currentMap(),
                title: venue.name,
                address: venue.location.formattedAddress,
                phone: venue.contact.formattedPhone || '',
                web: venue.url || '',
                position: new google.maps.LatLng(venue.location.lat, venue.location.lng),
                icon: googlMapsIcons.point,
                infoWindow: self.infoWindowWrapper,
                markersArray: self.markers
              })
            });

            self.mapBounds.extend(point.marker.position);
            return point;
          });

          self.storedPoints[category.id] = venues;
          self.appFilters.visibleCategoriesFilters.push(category);
        }

      } else {
        //animations.progressbar.setWarning(); // change progress color
        console.log('error');
        //loadDataController.dataNotLoaded++;
      }

      if(self.loadDataController.dataLoaded === self.loadDataController.dataToLoad) {
        self.currentMap().fitBounds(self.mapBounds);
        self.showAllGroups();
        self.appUI.allowFilters(true);
      } else {
        self.loadDataController.dataLoaded++;
        self.loadDataController.progressBarControl.progress += self.loadDataController.progressBarControl.increase;
        animations.progressbar(self.loadDataController.progressBarControl.progress);
      }

    }

    self.resetSearch = function () {
      // Elimina markers y vacía puntos de interés controlar por checkbox?
      self.hideMapMarkers(self.visiblePoints());
      self.markers = [];
      self.mapBounds = new google.maps.LatLngBounds();

      self.storedPoints = {};
      self.visiblePoints.removeAll();
      self.appFilters.visibleCategoriesFilters.removeAll();
      self.wikiArticles.removeAll();

      self.appFilters.searchTerm('');
      self.appFilters.lastCategorySelected = '';

      self.loadDataController.reset();
      self.loadDataController.dataToLoad = self.appFilters.categoriesFilters.length - 1;
    };

    self.hideMapMarkers = function (fromPoints) {
      var points = fromPoints.length;
      for(var i = 0; i < points; i++){
        fromPoints[i].marker.isVisible(false);
      }
    };

    self.showMapMarkers = function (fromPoints) {
      var points = fromPoints.length;
      for(var i = 0; i < points; i++){
        fromPoints[i].marker.isVisible(true);
      }
    };

    //retrieves the group value from the button and sets the visble group
    self.showGroup = function(categoryGroup) {
      //prevent refresh the same group
      if(categoryGroup.id !== self.appFilters.lastCategorySelected) {

        if(self.appFilters.lastCategorySelected ===  'all') {

          for(var group in self.storedPoints) {
            if(group !== categoryGroup.id) {
              self.hideMapMarkers(self.storedPoints[group]);
            }
          }

        } else {
          self.hideMapMarkers(self.storedPoints[self.appFilters.lastCategorySelected]);
          self.showMapMarkers(self.storedPoints[categoryGroup.id]);
        }
        // change the visual status of the pressed and no pressed before button
        $("#"+self.appFilters.lastCategorySelected).toggleClass('is-active');
        $("#"+categoryGroup.id).toggleClass('is-active');

        self.visiblePoints(self.storedPoints[categoryGroup.id]);
        self.appFilters.lastCategorySelected = categoryGroup.id;
      }

    };

    self.showAllGroups = function() {

      if(self.appFilters.lastCategorySelected !== 'all') {
        var groups = [];

        for(var group in self.storedPoints) {

          if(group !== self.appFilters.lastCategorySelected) {
            for(var i = 0; i < self.storedPoints[group].length; i++) {
              groups.push(self.storedPoints[group][i]);
            }
          }

        }

        $("#"+self.appFilters.lastCategorySelected).toggleClass('is-active');
        $("#all").toggleClass('is-active');

        self.visiblePoints(groups);
        self.showMapMarkers(self.visiblePoints());
        self.appFilters.lastCategorySelected = 'all';
      }
    };

    self.addLocation = function (location) {
      if(self.locations().length > 0) {
        self.resetSearch();
      }

      self.locations.push(location);
      self.locationId(location.id);
      self.address(location.address);
      self.coordinates(location.coordinates);

      self.appUI.showHidden(true);
      animations.showProgressBar();

      //comprobar si no llegan categorías
      var formattedCoordinates = location.coordinates.G + ',' + location.coordinates.K;
      self.foursquareApi.getVenues(formattedCoordinates,self.appFilters.categoriesFilters,self.resultsLimit,populateInterestPoints);
    };

    self.reloadLocation = function (location) {
      if(location.id !== self.locationId()) {
        self.resetSearch();
        self.locationId(location.id);
        self.address(location.address);
        self.coordinates(location.coordinates);

        animations.showProgressBar();

        //comprobar si no llegan categorías
        var formattedCoordinates = location.coordinates.G + ',' + location.coordinates.K;

        self.foursquareApi.getVenues(formattedCoordinates,self.appFilters.categoriesFilters,self.resultsLimit,populateInterestPoints);
      }
  };

};

/* Custom Bindings Section */

// Bind to create or update a map when an address is introduced
ko.bindingHandlers.updateMap = {
  update: function (element, valueAccessor, allBindings) {
    var self = this;

    self.mapStatus = valueAccessor();

    if(!self.mapStatus().mapCreated() && self.mapStatus().center() !== false) {

      animations.removeBg();

      var mapOptions = {
        mapTypeControl: false,
        zoomControl: true,
        zoomControlOptions: {
            style: google.maps.ZoomControlStyle.LARGE,
            position: google.maps.ControlPosition.LEFT_CENTER
        },
        scaleControl: true,
        streetViewControl: false
      };

      self.mapStatus().map(
        new google.maps.Map(element, mapOptions)
      );
      self.mapStatus().mapCreated(true);
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
        self.autocompleteOptions = {
          bounds: new google.maps.LatLngBounds(new google.maps.LatLng(-90, -180),new google.maps.LatLng(90, 1801)),
        };
        self.autocomplete = new google.maps.places.Autocomplete(self.searchField, self.autocompleteOptions);

        google.maps.event.addListener(self.autocomplete, 'place_changed', function() {

            var location = self.autocomplete.getPlace();
            if(location.geometry) {
              //comprobar que no queda vacío y añadir algo para prevenir usos incorrectos y feedback
              var locationData = new Location(location.id,location.name,location.formatted_address,location.geometry.location);
              self.newLocation(locationData);
            }
        });
    },
    update: function (element, valueAccessor, allBindings) {
      ko.bindingHandlers.value.update(element, valueAccessor);
    }
};

function loadMapsEror() {
  $("#welcomeMsg").text(errorMessages.googleMaps);
}

function loadGoogleMaps() {
  var gMaps = document.createElement('script');
  gMaps.type = 'text/javascript';
  gMaps.onerror = loadMapsEror;
  gMaps.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCyCv1QFoG6XyV3BaG57glUqc2mHFqZDvU&libraries=places&callback=startApp';
  document.body.appendChild(gMaps);
}

function startApp () {
  var currentSearch = new Search();
  currentSearch.initApp();
  ko.applyBindings(currentSearch);
}

window.onload = loadGoogleMaps;