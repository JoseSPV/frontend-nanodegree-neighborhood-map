Neighborhood Map project / Version: 0.1.0 12/08/2015 / Author: José Sancho Pagola

# Neighborhood Map project project

>Project purpose: You will develop a single page application featuring a map of your neighborhood or a neighborhood you would like to visit. You will then add additional functionality to this map including highlighted locations, third-party data about those locations and various ways to browse the content.



####Index

1. How to run the project
  i. One-Clik
  ii. Run the application locally
2. Tools and Sources used
  i. Software
  ii. Webs and books
3. The Application
  i. What the application does
  ii. Third-Party APIs
  iii. Filter Tools
  iV. Interest Points
  vi. History function
4. Technichal documentation

---

## 1. How to run the project

### i. One-Clik

You don't need to install the application just click [here](http://josespv.github.io/frontend-nanodegree-neighborhood-map/)

### ii. Run the application locally

Internet connection is required in order to run the application otherwise you want be able to use it properly (you will only see a beautiful blurred photo of my city :)

You can download a .zip file with all the code using this link:

  [.zip file](https://github.com/JoseSPV/frontend-nanodegree-neighborhood-map/archive/master.zip)

Another option is to clone this repository using GIT sing the link below:

  [clone URL](https://github.com/JoseSPV/frontend-nanodegree-neighborhood-map.git)

After cloning the repository or downloading the .zip file several options for local debugging are available:

- Use WAMP, XAMPP or similars to set a local server and open the index.html file.

- Use Python to set a local server runinng on your consol the following instruction:

  `python -m SimpleHTTPServer #portnumber`

After that open the index.html file on your browser.

If a public addres is needed ngrok could be used to generate a public URL just install ngrok and type on your console:

 `ngrok http #portnumber`.

 You should run first the Python instruction `python -m SimpleHTTPServer #portnumber` where the `portnumer` should be the same for both cases.

## 2. Tools and Sources

To accomplish the requirements for this project the following tools and sources were used:

### i. Software

- GRUNT to automate the minification, inline and optimization processes for CSS, JavaScript, HTML and the images.
- Adobe Photoshop to customize the map markers and create background image.

### ii. Webs and books

- MDN network
- maps api
- foursquare api
- mediawiki api
- Codrops (for the bouncing menu inspiration)
- Stackoverflow

- speaking js

## 3. The Application

### i. What the application does

The application looks for a location and retrives the nearby interest points and information about this location. All the data will be presented using a Google Maps map including highlighted locations as markers on the map and as a list on the initially hidden sidebar. The application offers the posiblity to filter the results using category buttons and a search box.

#### ii. Third-Party APIs

The application uses the following third-party APis:

	- Foursquare: used to retrieve information about interest points near the given location.
	- WikiMedia: used to retrieve information about the given location.
	- Google Maps: used as a canvas to display the map of the given location and the nearby interest points.


#### iii. Filter Tools

The amount of category filters will vary depending on the interest points found in a certain location. If the application does not find interest points within a certain category the
associated category button will not be displayed.

A filter box tool is also available and can be used to filter the results by typing the name of the interest point we want to see.

This tools will update the results displayed on the map and on the sidebar list.

#### iv. Interest Points

Whenever an interest point is clicked (using the markers or the sidebar list) an info window is opened with some information about this place. The amount of information can vary depending on the data retrieved from Foursquare.

The blue big marker refers to the location searched. When clicked it will display an information window with an article obtained from the WikiPedia. If no article is retrieved only the location name will be displayed. The search on the WikiPedia will be done in english.

#### vi. History function

The application stores the locations searched (only during the current session) so the user can reload a previous visited location without downloading the interest points or related article data.

## 4. Technichal documentation

The original source files can be found inside the `/src` directory. A documentation page is also available in the doc folder [here](https://github.com/JoseSPV/frontend-nanodegree-neighborhood-map/doc/index.html)

Comments can be found inside the HTML, CSS and JavaScript files.
