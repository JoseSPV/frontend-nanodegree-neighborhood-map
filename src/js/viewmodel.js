/**
* Object with the error messages displayed by the application.
*
* @global
*/
var errorMessages = {
  googleMaps: "Oops! We cannot coonnect with Google. Please check your internet connection :)",
  internetConnection: "Please check your internet connection :) ",
  foursquare: "No interest points where found. Please try a different address and check your internet connection :)",
};

/**
* Stores the animations and effects of the UI.
*
* @global
*/
var animations = {

  toggleMenu: function () {
    $("#menu-toggler").toggleClass('show-menu');
  },

  showList: function () {
    $('#sidebar').toggleClass('is-hidden col-xs-2');
    $('#main').toggleClass('col-xs-12 col-xs-10');
  },

  activateDeactivate: function (target) {
    target.toggleClass('is-active');
  },

  displayHidden: function () {
    $(".filter-box-wrapper,.buttons-list").removeClass('is-hidden');
  },

  removeBg: function () {
    $("#map").removeClass('show-bg');
  },

  showProgressbar: function () {
    $( ".progress" ).fadeIn( "fast");
  },

  hideProgressbar: function () {
    $( ".progress" ).delay(500).fadeOut( "fast", function() {
      $(".progress-bar").width('0%');
    });
  },

  alert: function (message) {
    $('#alert').modal('show');
    $("#alertMessage").text(message);
  }
};

/**
* @class WikiMediaApi
* @classdesc Stores the WikiMediaApi API credentials and a method to retrieve an article related to the term passed.
*/
var WikiMediaApi = function () {

  var self = this;
 /**
 * Request to get the data from the WikiMedia API.
 *
 * @param {string} term - The term we want to retrieve information about
 * @param {WikiMediaApi~populateArticles} callback - A callback to run.
 */
  self.getArticles = function (term, callback) {
    var wikiUrl = 'https://en.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages&format=json&exintro=&explaintext=&piprop=original&titles=' + term;
    var request = {
      status: 'ok',
      data: false,
      message: ''
    };

    $.ajax({
      url: wikiUrl,
      dataType: "jsonp",
      success: function( data ) {
        var info = {};

        for(var article in data.query.pages) {
          info = {
            title: data.query.pages[article].title,
            thumb: data.query.pages[article].hasOwnProperty('thumbnail')? data.query.pages[article].thumbnail.original : '',
            description: data.query.pages[article].hasOwnProperty('extract')? data.query.pages[article].extract  : ''
          };
        }
        request.status = 'ok';
        request.data = info;
        request.message = '';

        callback(request);
      },
      error: function () {
        request.status = 'error';
        request.data = false;

        callback(request);
      }
    });
  };
};

/**
* @class FoursquareApi
* @classdesc Stores the Foursquare API credentials and a number of methods to request the information about cateogories and venues using AJAX calls.
*/
var FoursquareApi = function () {

  var self = this;

  self.clientId = 'TV0CTIVNSUNU01JHA1UT5ZJJUOMMZGOL5FDOPKFNYV5AS1X2';
  self.clientSecret = 'B5D1VLCQLL1ACDJG50NXK3U0BHJSKD3Y4X3ZGRPCEAEB3JFA';
  self.referenceDate = '20150715';
  self.baseUrl = 'https://api.foursquare.com/v2/venues/search?client_id=' + self.clientId + '&client_secret=' + self.clientSecret + '&v=' + self.referenceDate;

  /**
  * Prepares an AJAX request using the credentials clientId, clientSecret and referenceDate. Reference link {@link https://developer.foursquare.com/start}
  *
  * @name FoursquareApi#setRequest
  * @method
  * @param {string} where - The coordinates of the location to search where we want to look for venues
  * @param {int=} categoryId - Optional: the category used to filter the results if no category is specified it won't be used to request the data
  * @param {int=} resultsLimit - Optional: the number of results we want to receive
  * @returns {string} baseUrl + query - The URL used for the AJAX request
  */
  self.setRequest = function(where, categoryId, resultsLimit) {

    var query = '';
    var category = '&categoryId=' + categoryId || '';
    var limit = resultsLimit || 5; //Max limit 50 per query established by the Foursquare's API;

    query = '&ll=' + where + category + '&limit=' + limit + '&llAcc=2000&radius=1000';

    return self.baseUrl + query;
  };

  /**
  * Send a request to the Foursquare API to retrieve all the parent categories available. This is only done once per session {@link https://developer.foursquare.com/docs/venues/categories}
  *
  * @name FoursquareApi#getCategories
  * @method
  * @param {FoursquareApi~populateCategoriesFilters} callback - The callback that handles the response
  * @returns {object} request - The request response
  */
  self.getCategories = function(callback) {

    // this is the response format the app uses
    var request = {
      status: 'ok',
      data: false,
      message: ''
    };

    $.ajax({
      url: 'https://api.foursquare.com/v2/venues/categories?client_id=' + self.clientId + '&client_secret=' + self.clientSecret + '&v=' + self.referenceDate,
      dataType: "json",
      success: function( data ) {
        var categories = [];

        var categoriesFound = data.response.categories.length;
        for(var i = 0; i < categoriesFound; i++){
          categories.push({
            id: data.response.categories[i].id,
            name: data.response.categories[i].name,
            icon: data.response.categories[i].icon.prefix + '32' + data.response.categories[i].icon.suffix //to retrieve another size change the 32
          });
        }
        request.status = 'ok';
        request.data = categories;
        request.message = '';

        callback(request);
      },
      error: function () {
        request.status = 'error';
        request.data = false;
        request.message = errorMessages.foursquare;

        callback(request);
      }
    });

  };

  /**
  * Request the venues within the categories stored using the getCategories method.
  *
  * @name FoursquareApi#getVenues
  * @method
  * @param {string} formattedCoordinates - Coordinates for prepared for the API request
  * @param {array} filters - Categories used to restrit de data
  * @param {int} limit - Number of results to retrieve (max 50)
  * @param {FoursquareApi~populateInterestPoints} callback - The callback that handles the response
  */
  self.getVenues = function(formattedCoordinates,filters,limit,callback) {

    var requestUrl = '';
    // this is the response format the app uses
    var request = {
      status: 'ok',
      data: false,
      message: ''
    };

    var filtersToApply = filters.length;
    for(var i = 0; i < filtersToApply; i++) {
      requestUrl = self.setRequest(formattedCoordinates,filters[i].id,limit);
      self.getVenuesData(requestUrl,filters[i],callback);
    } // ends for loop

  };

  /**
  * Request the venues data.
  *
  * @name FoursquareApi#getVenuesData
  * @method
  * @param {string} requestUrl - Coordinates for prepared for the API request
  * @param {array} category - Category used to restrit de data
  * @param {FoursquareApi~populateInterestPoints} callback - The callback that handles the response
  * @returns {object} request - The request response
  */
  self.getVenuesData = function(requestUrl,category,callback) {

    var request = {
      status: 'ok',
      data: false,
      message: ''
    };

    $.ajax({
      url: requestUrl,
      dataType: "json",
      success: function(data) {
        request.status = 'ok';
        request.data = data;
        callback(request,category);
      },
      error: function () {
        request.status = 'error';
        request.data = false;
        request.message = errorMessages.foursquare;

        callback(request,category);
      }

    }); // ends AJAX call
  };

};

/**
* @class Location
* @classdesc Creates an instance of Location. Stores the location data as well as the interest points and articles related to this location.
*
* @param {object} locationData
* @property {string} locationData.name
* @property {string} locationData.address
* @property {int} locationData.locationId
* @property {object} locationData.coordinates - Geocoded coordinates
* @property {object} storedPoints Interest Points near the location
* @property {object} locInfo WikiPedia article about the location
*/
var Location = function(locationData) {

  var self = this;

  self.name = locationData.name;
  self.address = locationData.address;
  self.locationId = locationData.id;
  self.coordinates = locationData.coordinates;
  self.storedPoints = {};
  self.storedCategories = []; //categories available for this location @see FoursquareApi#getCategories
  self.locInfo = {};

  /**
  * Stores the information found on WikiPedia related to this location.
  *
  * @name Location#storeLocationInfo
  * @method
  * @param {object} info
  */
  self.storeLocationInfo = function(info) {
    self.locInfo = info;
  };

  /**
  * Stores a category.
  *
  * @name Location#storeCategories
  * @method
  * @param {object} category
  */
  self.storeCategories = function(category) {
    self.storedCategories.push(category);
  };

  /**
  * Stores a group of Interest Points near this location.
  *
  * @name Location#storePoints
  * @method
  * @param {object} pointsToStore
  * @param {int} ID of the category that contains the Interest Points
  */
  self.storePoints = function(pointsToStore, index) {
    self.storedPoints[index] = pointsToStore;
  };
};

/**
* @class InterestPoint
* @classdesc Creates an instance of InterestPoint. Stores an Interest Point and the infoWindow function to set the content of the application InfoWindow.

* @param {object} ipData
* @property {string} ipData.id
* @property {string} ipData.name
* @property {string} ipData.address - Address in Foursquare format of the point
* @property {array} ipData.coordinates - Coordinates of the location (geocoded address)
* @property {string} ipData.category - Category of the point (restaurant, hotel, etc)
* @property {MapMarker} ipData.marker - @see {@link MapMarker}
*/
var InterestPoint = function(ipData) {

  var self = this;

  self.id = ipData.id;
  self.name = ipData.name;
  self.address = ipData.address;
  self.coordinates = ipData.coordinates;
  self.category = ipData.category;
  self.marker = ipData.marker;

  /**
  * Opens the info window on the map and sets its content. The function also centers the map on the point.
  *
  * @name InterestPoint#openInfoWindow
  * @method
  * @param {InterestPoint} point
  */
  self.openInfoWindow = function(point) {

    var marker = point.marker.marker;
    var map = point.marker.map;

    var infoWindow = point.marker.infoWindow.object;
    var infoWindowContent = point.marker.infoWindowContent();

    map.setCenter(marker.getPosition());
    infoWindow.setContent(infoWindowContent);
    infoWindow.open(map, marker);
  };
};

/**
* @class MapMarker
* @classdesc Creates an instance of MapMarker. Stores a Google Maps marker and the listeners associated to it.
*
* @param {object} markerData
* @property {int} markerData.id
* @property {string} markerData.type - Marker type the options are interestPoint || mainPoint
* @property {string} markerData.title - This will be used to set the marker title and the infoWindow title
* @property {string=} markerData.web - Optional: WikePedia information with the web address
* @property {string=} markerData.phone - Optional: WikePedia information with the phone
* @property {string=} markerData.thumb - Optional: WikePedia information with the thumb
* @property {string=} markerData.description - Optional: WikePedia information with the description
* @property {string=} markerData.address with the address
* @property {google.maps.Map} markerData.map - Optional: Target map for this marker
* @property {google.maps.LaLnt} markerData.position - Geoposition of the marker
* @property {google.maps.InfoWindow} markerData.infoWindow
* @property {string} markerData.icon
* @property {array} markerData.markersArray - Array to store the marker @see Search
* @property {google.maps.Marker} marker - Stores the google.maps.Marker object. Is created using the markerData
*/
var MapMarker = function(markerData) {

  var self = this;

  self.id = markerData.id;
  self.pointType = markerData.type;

  // The information below will be used to set the content of the associated infoWindow
  self.title = markerData.title;
  self.web = markerData.web || '';
  self.phone = markerData.phone || '';
  self.thumb = markerData.thumb  || '';
  self.description = markerData.description  || '';
  self.address = markerData.address || '';

  // This will be used to register the listeners and to customize the marker
  self.map = markerData.map;
  self.position = markerData.position;
  self.infoWindow = markerData.infoWindow;
  self.icon = markerData.icon;

  self.marker = new google.maps.Marker({
    id: self.id,
    position : self.position,
    animation: google.maps.Animation.DROP,
    icon: self.icon,
    title: self.title
  });

  /**
  * Sets the visibility of the marker.
  *
  * @name MapMarker#isVisible
  * @method
  */
  self.isVisible = ko.observable(false);

  // Adds the marker to the markers array used to control which markers are displayed on the map
  if(markerData.markersArray) {
    markerData.markersArray.push(self.marker);
  }

  /**
  * Generates the infoWindow content based on pointType.
  *
  * @name MapMarker#infoWindowContent
  * @method
  * @returns {object} The HTML markup for the infoWindow
  */
  self.infoWindowContent = ko.computed(function() {

    var html = '';

    if(self.pointType === 'interestPoint') {
      html = self.infoWindow.htmlMarkupIp.header.replace("%data%", self.title);

      if(self.address !== '') {
        html += self.infoWindow.htmlMarkupIp.address.replace("%data%", self.address);
      }
      if(self.phone !== '') {
        html += self.infoWindow.htmlMarkupIp.phone.replace("%data%", self.phone);
      }
      if(self.web !== '') {
        html += self.infoWindow.htmlMarkupIp.web.replace(/%data%/g, self.web);
      }

      html += self.infoWindow.htmlMarkupIp.end;

    } else if(self.pointType === 'mainPoint') {
      html = self.infoWindow.htmlMarkupLocation.header.replace("%data%", self.title);

      if(self.thumb !== '') {
        html += self.infoWindow.htmlMarkupLocation.thumb.replace("%data%", self.thumb);
      }
      if(self.description !== '') {
        html += self.infoWindow.htmlMarkupLocation.description.replace("%data%", self.description);
      }

      html += self.infoWindow.htmlMarkupLocation.end;
    }

    return html;
  });

  // Registers a google.maps.event listener to the marker in order to know when the marker is clicked
  google.maps.event.addListener(self.marker, 'click', function() {

    // Sets the infoWindow content and centers the map
    self.map.setCenter(self.marker.getPosition());
    self.infoWindow.object.setContent(self.infoWindowContent());
    self.infoWindow.object.open(self.map, self.marker);

  });

  /**
  * Whether this marker is visible or not.
  *
  * @name MapMarker#showHideMarker
  * @method
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
* @class Search
* @classdesc Creates an instance of Search. This is the most important class. This class has several data structures and methods used to update the application and
* control the user interaction. The class has a method "initApp" that initializes all the necessary in order to make the application work.
* The properties currentSearch, loadDataController, appUI, appFilters and map have their own reset methods to restore their default values.
*
* @property {int} currentLocation - Pointer to the last location selected
* @property {array} history - Array with all the locations the user has searched
* @property {object} currentSearch - Stores the information of the current visible data
* @property {object} loadDataController - Controlls the loading data process updating its status and triggering different functions of the application
* @property {object} appUI - Stores the state of interactive parts of the application UI
* @property {object} appFilters - Stores the state of the available filters and the actions the user can do
* @property {object} map - Stores all the necessary to work with the google.maps.Map associated to the current performed search
* @property {FoursquareApi} foursquareApi - Used as a tool to get information from Foursquare {@link https://developer.foursquare.com/start}
* @property {WikiMediaApi} wikiMediaApi - Used as a tool to get information from the WikiMedia API {@link https://www.mediawiki.org/wiki/API:Main_page/es}
*/
var Search = function() {

  'use strict';
  var self = this;

  /**
  * Initializes the application.
  *
  * @name Search#initApp
  * @method
  */
  self.initApp = function() {
    self.history = ko.observableArray([]);
    self.currentLocation = 0;
    self.currentSearch = {
      resultsLimit: 5,
      visiblePoints: ko.observableArray([]),

      reset: function() {
        this.visiblePoints.removeAll();
      }
    };

    /**
    * Check the load data process updating its status and triggering different functions of the application.
    *
    * @namespace Search.loadDataController
    */
    self.loadDataController = {
      dataToLoad: ko.observable(1),
      dataParsed: ko.observable(0),
      dataNotLoaded: ko.observable(0),
      loadingFinished: ko.observable(false),

      reset: function() {
        this.dataToLoad(self.appFilters.categoriesFilters.length + 1);
        this.dataParsed(0);
        this.dataNotLoaded(0);
        this.loadingFinished(false);
      }
    };

    /**
    * This method will be invoked when all the data is loaded. If no interest points were loaded a error message will be displayed. Some categories can be empty it only displays the error message when all the categories are empty.
    *
    * @memberOf Search.loadDataController
    * @method
    * @returns {bool} Returns true if the loading process is finished otherwise returns false
    */
    self.loadDataController.finishLoad = ko.computed(function() {

      if(self.loadDataController.dataParsed() === self.loadDataController.dataToLoad() && !self.loadDataController.loadingFinished()) {

        if(self.loadDataController.dataNotLoaded() < self.loadDataController.dataToLoad()) {

          if(self.history()[self.currentLocation].storedCategories.length > 0) {
            self.appFilters.visibleCategoriesFilters(self.history()[self.currentLocation].storedCategories);
            self.appFilters.visibleCategoriesFilters.push({id:'all', name:'all', icon:'images/all.png'});
          }
          self.appFilters.showGroup({id: 'all'});
          self.appUI.allowFilters(true);

        } else {
          animations.alert(errorMessages.foursquare);
        }
        return true;
      } else {
        return false;
      }

    });

    // Call the init methods
    initUI();
    initFilters();
    initMap();
    initWikiMedia();
    initFoursquare();
  };

  /**
  * Invokes the reset methods.
  *
  * @name Search#resetApp
  * @method
  */
  self.resetApp = function() {
    self.appUI.reset();
    self.loadDataController.reset();
    self.appFilters.reset();
    self.map.reset();
    self.currentSearch.reset();
  };

  /**
  * The functions receive a location from the google.maps.Autocomplete function and starts the data loading process.
  *
  * @name Search#addLocation
  * @method
  * @param {object} location
  */
  self.addLocation = function(location) {

    // only reset the app if we already have stored a location
    if(self.history().length > 0) {
      self.resetApp();
    } else {
       self.appUI.showHidden(true); // enable the manipulation of the by hidden elements only at the
    }

    self.map.coordinates(location.coordinates);
    self.history.push(location);
    self.currentLocation = self.history().length - 1;

    self.appUI.showProgress(true);

    var formattedCoordinates = location.coordinates.lat() + ',' + location.coordinates.lng();
    self.wikiMediaApi.getArticles(self.history()[self.currentLocation].name,populateArticles); // get the data from WikiPedia

    if(self.appFilters.categoriesFilters.length > 0) {
      self.foursquareApi.getVenues(formattedCoordinates,self.appFilters.categoriesFilters,self.currentSearch.resultsLimit,populateInterestPoints); // get the data from Foursquare
    }
  };

  /**
  * Reloads a previous searched location. The location must be in the @param history stored.
  *
  * @name Search#reloadLocation
  * @method
  * @param {object} location
  */
  self.reloadLocation = function(location) {

    //do not load the location if it is already loaded
    if(location.locationId !== self.history()[self.currentLocation].locationId) {
      self.resetApp();

      // get the index of the elemente stored in history to be used as our @param currentLocation pointer
      var context = ko.contextFor(event.target);
      self.currentLocation = context.$index();

      self.map.coordinates(location.coordinates);
      // load the information for the main marke. This is usuall done here {@link addLocation}
      self.map.mainMarker(location.locInfo);

      // TODO: Improve the entire process. I know this is not the ideal way to do this :(  I have to work harder on it
      var categoriesStored = self.appFilters.categoriesFilters.length;
      var pointsInGroup = 0;
      var group = 0;

      // Updates the element stored in @param history with the applicable categories this is done when the storedCategories property is empty
      if(self.history()[self.currentLocation].storedCategories.length <= 0) {

        for(group in location.storedPoints) {

          for(var indexCategories = 0; indexCategories < categoriesStored; indexCategories++) {
            if(self.appFilters.categoriesFilters[indexCategories].id === group) {
              self.history()[self.currentLocation].storeCategories(self.appFilters.categoriesFilters[indexCategories]);
            }
          }

        }

      }
      // Set the bounds for the google.maps.Map object. This is usually done in addLocation
      for(group in location.storedPoints) {

        pointsInGroup = location.storedPoints[group].length;
        for(var indexPoints = 0; indexPoints < pointsInGroup; indexPoints++) {
          self.map.mapBounds.push(location.storedPoints[group][indexPoints].marker.position);
        }

      }
      // trigger manually the showGroup and fitmap functions
      self.loadDataController.dataParsed(self.loadDataController.dataToLoad());
    }

  };

  /**
  * Initializes the appUI object.
  *
  * @name Search#initUI
  * @method
  */
  function initUI() {
    /**
    * Stores the state of the interactive parts of the application UI.
    *
    * @namespace Search.appUI
    */
    self.appUI = {
      showList: ko.observable(),
      showHidden: ko.observable(false), //this is used only for the first time to prevent the falshing of the non visible elements
      showFilters: ko.observable(false),
      allowFilters: ko.observable(false),
      showProgress: ko.observable(false),

      reset: function() {
        this.allowFilters(false);
        this.showProgress(false);
      }
    };

    /**
    * Updates the bar progress.
    *
    * @memberOf Search.appUI
    * @method
    * @returns {string} The new width for the progress bar element
    */
    self.appUI.barWidth = ko.computed(function() {
      if(self.appUI.showProgress()) {

        animations.showProgressbar();
        var newWidth = (self.loadDataController.dataParsed() / self.loadDataController.dataToLoad()) * 100;

        if(self.loadDataController.dataParsed() === self.loadDataController.dataToLoad()) {
          animations.hideProgressbar();
        }
        return newWidth + '%';
      }
    });

    /**
    * Removes the is-hidden class when triggered.
    *
    * @memberOf Search.appUI
    * @method
    */
    self.appUI.displayHiddenElements = ko.computed(function() {
      if(self.appUI.showHidden()) {
        animations.displayHidden();
      }
    });

    /**
    * Show and hide the sidebar with the interest points list.
    *
    * @memberOf Search.appUI
    * @method
    */
    self.appUI.displayList = ko.computed(function() {
      if(self.appUI.showList() === true) {
        animations.showList();
      } else if(self.appUI.showList() === false) {
        animations.showList();
      }
    });

  } // ENDS initUI

  /**
  * Initializes the appFilters object.
  *
  * @method
  */
  function initFilters() {

    /**
    * Stores the state of the available filters and the actions the user can do.
    *
    * @namespace Search.appFilters
    */
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

    /**
    * Filters the visiblePoints results using the filter box from the UI.
    *
    * @memberOf Search.appFilters
    * @method
    * @param {string} - searchTerm
    * @returns {array} - Filters the visiblePoints using the searchTerm param array and returns the new filtered array
    */
    self.appFilters.filteredData = ko.computed(function() {
      var query = self.appFilters.searchTerm().toLowerCase();

      return ko.utils.arrayFilter(self.currentSearch.visiblePoints(), function(point) {
        var isFiltered = point.name.toLowerCase().indexOf(query) >= 0;
        point.marker.isVisible(isFiltered);

        return isFiltered;
      });
    });

    /**
    * Display the selected group. The method will also hide and show the map markers.
    *
    * @memberOf Search.appFilters
    * @method
    * @param {object} categoryGroup - Contains all the information related to a category @see {@link getCategories}
    */
    self.appFilters.showGroup = function(categoryGroup) {

        var group = '';

        if(categoryGroup.id === 'all') {
          var groups = [];
          for(group in self.history()[self.currentLocation].storedPoints) {

            if(group !== self.appFilters.lastCategorySelected) {

              var storedPointsInGroup = self.history()[self.currentLocation].storedPoints[group].length;
              for(var i = 0; i < storedPointsInGroup; i++) {
                groups.push(self.history()[self.currentLocation].storedPoints[group][i]);
              }

            }

          }
          self.currentSearch.visiblePoints(groups);
          self.map.showMapMarkers(self.currentSearch.visiblePoints());

        } else {

          if(self.appFilters.lastCategorySelected ===  'all') {
            self.map.hideMapMarkers(self.currentSearch.visiblePoints());

          } else {
            self.map.hideMapMarkers(self.history()[self.currentLocation].storedPoints[self.appFilters.lastCategorySelected]);
          }

          self.currentSearch.visiblePoints(self.history()[self.currentLocation].storedPoints[categoryGroup.id]);
          self.map.showMapMarkers(self.history()[self.currentLocation].storedPoints[categoryGroup.id]);
        }

        animations.activateDeactivate($("#"+self.appFilters.lastCategorySelected));
        animations.activateDeactivate($("#"+categoryGroup.id));

        self.appFilters.lastCategorySelected = categoryGroup.id;
        self.appFilters.searchTerm('');
    };

  } // ENDS initFilters

  /**
  * Initializes the wikiMediApi object.
  *
  * @method
  */
  function initWikiMedia() {
    self.wikiMediaApi = new WikiMediaApi();
  }

  /**
  * Initializes the foursquareApi object and retrieves the categories provided by the Foursquare API.
  *
  * @method
  */
  function initFoursquare() {

    self.foursquareApi = new FoursquareApi();
    self.foursquareApi.getCategories(populateCategoriesFilters);

    /**
    * Callback used by FoursquareApi.getCategories.
    *
    * @callback FoursquareApi.populateCategoriesFilters
    * @access private
    * @param {object} The categories of Foursquare
    */
    function populateCategoriesFilters(response) {
      if(response.status === 'ok') {
        self.appFilters.categoriesFilters = response.data;
        self.loadDataController.dataToLoad(self.appFilters.categoriesFilters.length + 1);
      } else {
        self.appFilters.categoriesFilters = [];
      }

    }
  }

  /**
  * Initializes the map object.
  *
  * @method
  */
  function initMap() {

    /**
    * Stores all the necessary to work with the google.maps.Map associated to the current performed search.
    *
    * @namespace Search.map
    */
    self.map = {
      coordinates: ko.observable(false),
      mapCreated: ko.observable(false),
      currentMap: ko.observable(), // stores a google.maps.Map object it was generated here {@link updateMap}
      mapBounds: [], // the bounds stored here will be later extended in order to fit the map to this bounds
      markers: [],
      mainMarker: ko.observable(), // this is the marker of the location this is not an interest point
      infoWindow: {
        object: new google.maps.InfoWindow({
          maxWidht: 300
        }),
        htmlMarkupIp: {
          header: '<div class="infoWindow"><div class="col-xs-12"><h4>%data%</h4></div>',
          address: '<div class="col-xs-12 infoWindow-data-group"><i class="glyphicon glyphicon-map-marker infoWindow-data"></i><span>%data%</span></div>',
          phone: '<div class="col-xs-12 infoWindow-data-group"><i class="glyphicon glyphicon-earphone infoWindow-data"></i><span>%data%</span></div>',
          web: '<div class="col-xs-12"><a href="%data%" target="_blank" title="%data%">%data%</a></div>',
          end: '</div>'
        },
        htmlMarkupLocation: {
          header: '<div class="infoWindow"><div class="col-xs-12"><h3>%data%</h3></div>',
          thumb: '<div class="col-xs-3"><img src="%data%" class="infoWindow-img pull-left"></div>',
          description: '<div class="col-xs-9"><h4>A brief description of this place</h4><p class="pull-left">%data%</p></div>',
          end: '</div>'
        }
      },
      mapCustomStyles: {
        googlMapsIcons: {
          main: 'images/map_icons/main_dot.png',
          point: 'images/map_icons/point.png'
        }
      },
      /**
      * Display the markers of the fromPoints array.
      *
      * @memberOf Search.map
      * @method
      * @param {array} fromPoints - Points with the markers we want to display
      */
      showMapMarkers: function(fromPoints) {
        var points = fromPoints.length;
        for(var i = 0; i < points; i++){
          fromPoints[i].marker.isVisible(true);
        }
      },
      /**
      * Hide the markers of the fromPoints array.
      *
      * @memberOf Search.map
      * @method
      * @param {array} fromPoints - Points with the markers we want to hide
      */
      hideMapMarkers: function(fromPoints) {
        var points = fromPoints.length;
        for(var i = 0; i < points; i++){
          fromPoints[i].marker.isVisible(false);
        }
      },

      reset: function () {
        this.markers = [];
        this.mapBounds = [];
        this.hideMapMarkers(self.currentSearch.visiblePoints());
      }
    };

    /**
    * Fits the map to the new bounds and makes visible the location marker.
    *
    * @memberOf Search.map
    * @method
    */
    self.map.fitToBounds = ko.computed(function () {

      if(self.loadDataController.finishLoad()) {

        var bounds = self.map.mapBounds.length;
        var extendedBounds = new google.maps.LatLngBounds();

        for(var i = 0; i < bounds; i++) {
          extendedBounds.extend(self.map.mapBounds[i]);
        }

        extendedBounds.extend(self.map.mainMarker().position);
        self.map.mainMarker().isVisible(true);
        self.map.currentMap().fitBounds(extendedBounds);
        self.loadDataController.loadingFinished(true); // prevent from entering here {@link finishLoad} when the process is finished
      }

    });
  }

  /**
  * Callback used by FoursquareApi.getVenues. The method will stored the interest points (here venues) and updates the dataLoad controller.
  *
  * @callback FoursquareApi.populateInterestPoints
  * @access private
  * @param {object} response - The data and status of the performed AJAX called
  * @param {object} category - The category of the venues group obtained
  */
  function populateInterestPoints(response, category) {

    if(response.status === 'ok') {

      if(response.data.response.venues.length > 0) {

        // parses the data and returns the created interest point
        var venues = $.map(response.data.response.venues, function(venue) {
          // Interest Point@see {@link InterestPoint}
          var point = new InterestPoint({
            id: venue.id,
            name: venue.name,
            address: venue.location.address || '',
            coordinates: [venue.location.lat, venue.location.lng],
            category: venue.categories[0].name,
            // Map marker @see {@link MapMarker}
            marker: new MapMarker({
              id: 'marker_' + venue.id,
              type: 'interestPoint',
              map: self.map.currentMap(),
              title: venue.name,
              address: venue.location.formattedAddress,
              phone: venue.contact.formattedPhone || '',
              web: venue.url || '',
              position: new google.maps.LatLng(venue.location.lat, venue.location.lng),
              icon: self.map.mapCustomStyles.googlMapsIcons.point,
              infoWindow: self.map.infoWindow,
              markersArray: self.map.markers
            })
          });

          self.map.mapBounds.push(point.marker.position);
          return point;
        });

        // stores the venues or interest points

        self.history()[self.currentLocation].storePoints(venues, category.id);
        self.history()[self.currentLocation].storeCategories(category);
      }

    } else {
      self.loadDataController.dataNotLoaded(self.loadDataController.dataNotLoaded + 1);
    }

    self.loadDataController.dataParsed(self.loadDataController.dataParsed() + 1);

  }

 /**
 * Callback used by WikiMediaApi.getArticles. The method stores the related article from the WikiPedia and updates the main marker with the article content. If no article is recevied the marker will only display the location name.
 *
 * @callback WikiMediaApi.populateArticles
 * @access private
 * @param {object} response - The data and status of the performed AJAX called
 */
  function populateArticles(response) {

    var articleData = {
      title: '',
      description: '',
      thumb: ''
    };

    if(response.status === 'ok') {
      articleData.title = response.data.title;
      articleData.description = response.data.description;
      articleData.thumb = response.data.thumb;
    } else {
      self.loadDataController.dataNotLoaded++;
    }

    // @see {@link MapMarker}
    var locationInfo = new MapMarker ({
      id: self.history()[self.currentLocation].name,
      type: 'mainPoint',
      map: self.map.currentMap(),
      title: articleData.title,
      description: articleData.description,
      thumb: articleData.thumb,
      position: self.map.coordinates(),
      icon: self.map.mapCustomStyles.googlMapsIcons.main,
      infoWindow: self.map.infoWindow,
      markersArray: self.map.markers
    });

    self.map.mainMarker(locationInfo); // update the mainMarker
    self.history()[self.currentLocation].storeLocationInfo(locationInfo);
    self.loadDataController.dataParsed(self.loadDataController.dataParsed() + 1);
  }
};