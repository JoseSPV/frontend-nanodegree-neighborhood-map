/*var locationSearch = {

  init: function () {

    this.searchField = document.getElementById("searchTextField");
    this.defaultBounds = new google.maps.LatLngBounds(new google.maps.LatLng(-90, -180),new google.maps.LatLng(90, 1801));

    this.autocompleteOptions = {
      bounds: this.defaultBounds,
    };
    this.autocomplete = new google.maps.places.Autocomplete(this.searchField, this.autocompleteOptions);
  },

};
locationSearch.init();*/

var CurrentSearch = function () {
  this.address = ko.observable(''); //definir como false para mostrar cuando el usuario busque
  this.createMap = function () {
    console.log('se crea mapa');
  };
};

ko.bindingHandlers.getLocation = {
    init: function (element, valueAccessor, allBindings) {

        // We will hide the bar menu the first time using the toggle jequry function
        //this.value = valueAccessor(); // Get the current value of the current property we're bound to
        //$(element).toggle(value);

        // Get the serchfield text to be used by the Autocomplete
        this.newLocation = valueAccessor();
        this.searchField = document.getElementById("searchTextField");

        // Autocomplete settings
        this.defaultBounds = new google.maps.LatLngBounds(new google.maps.LatLng(-90, -180),new google.maps.LatLng(90, 1801));
        this.autocompleteOptions = {
          bounds: this.defaultBounds,
        };
        this.autocomplete = new google.maps.places.Autocomplete(this.searchField, this.autocompleteOptions);

        //if you need the poition while dragging
        google.maps.event.addListener(this.autocomplete, 'place_changed', function() {
            var location = this.autocomplete.getPlace();
            this.newLocation(location.formatted_address);
        }.bind(this));
    }
};
ko.applyBindings(new CurrentSearch());