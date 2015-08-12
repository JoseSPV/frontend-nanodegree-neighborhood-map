/**
* Bind to create or update a map when an address is introduced.
*
* @name Search#updateMap
*/
ko.bindingHandlers.updateMap = {
  update: function (element, valueAccessor, allBindings) {
    var self = this;

    self.mapStatus = valueAccessor();

    if(!self.mapStatus.mapCreated() && self.mapStatus.coordinates() !== false) {

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

      self.mapStatus.currentMap(
        new google.maps.Map(element, mapOptions)
      );

      self.mapStatus.mapCreated(true);

    }
  }
};

/**
* Bind autocomplete with our UI. {@link https://developers.google.com/maps/documentation/javascript/places-autocomplete}
*
* @name Search#getLocation
*/
ko.bindingHandlers.getLocation = {
  init: function (element, valueAccessor, allBindings) {

      // Get the serchfield text to be used by the Autocomplete
      var self = this;
      self.newLocation = valueAccessor();

      self.searchField = element;

      // Autocomplete settings
      self.autocompleteOptions = {
        bounds: new google.maps.LatLngBounds(new google.maps.LatLng(-90, -180),new google.maps.LatLng(90, 1801))
      };
      self.autocomplete = new google.maps.places.Autocomplete(self.searchField, self.autocompleteOptions);

      // Listener registered to detect whenthe user has introduced a new location
      google.maps.event.addListener(self.autocomplete, 'place_changed', function() {

          var location = self.autocomplete.getPlace();

          if(location.geometry) {
            var locationData = new Location({
              name: location.name,
              address: location.formatted_address,
              id: location.id,
              coordinates: location.geometry.location
            });

            self.newLocation(locationData);
          }

      });
  },
  update: function (element, valueAccessor, allBindings) {
    ko.bindingHandlers.value.update(element, valueAccessor);
  }
};