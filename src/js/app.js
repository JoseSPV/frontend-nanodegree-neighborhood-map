 /**
 * @file app.js
 * @fileoverview Neighborhood Map - Project 5 of the Udacity Front-End Nanodegree
 * @projectname Neighborhood Map
 * @author José Sancho Pagola
 */

/**
* Waits 800ms before showing an error message. If for example we lose the internet connection while trying to load the API this message will be displayed.
*
* @function
*/
var executionTimeController = setTimeout(function(){
  animations.alert(errorMessages.internetConnection); //ERROR
}, 800);
/**
* That function will display an error message if the application was not able to load the Google Maps library.
*
* @function
*/
function loadMapsEror() {
  animations.alert(errorMessages.googleMaps); //ERROR
}
/**
* Function triggered by {@link loadGoogleMaps} when the Google Maps script is loaded.
*
* @callback loadGoogleMaps.startApp
*/
function startApp () {

  // extra check for google maps
  if(typeof google === 'object' && typeof google.maps === 'object') {

    var app = new Search();
    app.initApp();
    ko.applyBindings(app);
    console.log('Welcome');

  } else {

    animations.alert(errorMessages.googleMaps); //ERROR

  }
}
/**
* Executed when the window.onload is ready loads asynchronously the Google Maps API. Writes the script tag for the Google Maps library. For more information {@link https://developers.google.com/maps/documentation/javascript/tutorial}
*
* @param {loadGoogleMaps~startApp} callback - This callback must be supplied within the src attribute of the script in order to make this method work.
*/
function loadGoogleMaps() {

  var gMaps = document.createElement('script');
  gMaps.type = 'text/javascript';
  gMaps.onerror = loadMapsEror;
  gMaps.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCyCv1QFoG6XyV3BaG57glUqc2mHFqZDvU&libraries=places&callback=startApp';
  document.body.appendChild(gMaps);

  clearTimeout(executionTimeController);
}

window.onload = loadGoogleMaps;