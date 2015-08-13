Neighborhood Map project / Version: 0.1.0 12/08/2015 / Author: José Sancho Pagola

# Neighborhood Map project project

>Project purpose: You will develop a single page application featuring a map of your neighborhood or a neighborhood you would like to visit. You will then add additional functionality to this map including highlighted locations, third-party data about those locations and various ways to browse the content.

---

####Index

1. How to run the project
  i. One-Clik
  ii. Run the application locally
2. Tools and Sources used
3. The Application
  i. What the application does
  ii. Technichal documentation

---

## 1. Installation

### i. One-Clik

Just click [here]():

>You will find the source files here: [.zip file](https://github.com/JoseSPV/p5/archive/master.zip).

### ii. Run the application locally

Internet connection is required in order to run the application otherwise you want be able to use it properly (you will only see a biutiful blurred photo of my city :)

You can download a .zip file with all the code using this link:

  [.zip file](https://github.com/JoseSPV/p5/archive/master.zip)

Another option is to clone this repository using GIT sing the link below:

  [clone URL](https://github.com/JoseSPV/p5.git)

After cloning the repository or downloading the .zip file several options for local debugging are available:

Use WAMP, XAMPP or similars to set a local server and open the index.html file.

Use Python to set a local server runinng on your consol the following instruction:

  `python -m SimpleHTTPServer #portnumber`

After that open the index.html file on your browser.

If a public addres is needed ngrok could be used to generate a public URL just install ngrok and type on your console:

 `ngrok http #portnumber`.

 You should run first the Python instruction `python -m SimpleHTTPServer #portnumber` where the `portnumer` should be the same for both cases.

## 2. Tools and Sources

To accomplish the requirements for this project the following tools and sources were used:

- GRUNT to automate the minification, inline and optimization processes for CSS, JavaScript, HTML and the images.
- Python and ngrok to set up a localhost server and public URL to be able to run the PageSpeed Insights tool.

- Stack Overflow.

## 3. The Application

### i. What the application does

The application looks for a location and retrives the nearby interest points and information about this location. All the data will be presented using a Google Maps map including highlighted locations as markers on the map and as a list on the initially hidden sidebar. The application offers the posiblity to filter the results using category buttons and a search box.

#### Third-Party APIs

The application uses the Foursquare API to retrieve interest points near the location and the WikiMedia APi in order to retrieve information about the location.

#### Filter Tools

The amount of category filters will vary depending on the interest points found in a certain location. If the application does no find interest points within a certain category the
associated category button will not be displayed.

The filter tools will update the results displayed on the map and on the sidebar list.

#### Points behaviour

Whenever an interest point is clicked (using the markers or the sidebar list) an info window is opened with some information about this place. The amount of information can vary depending on the data retrieved from Foursquare.

The blue big marker refers to the location searched. When clicked it will display an information window with an article obtained from the WikiPedia. If no article is retrieved only the location name will be displayed. The search on the WikiPedia will be done in english.

#### History

The application stores the locations searched (only during the current session) so the user can reload a previous visited location without downloading the interest points or related article data.

### ii. Technichal documentation

The original source files can be found inside the /dist directory with the commented code.

A documentation page is also available [here](https://github.com/JoseSPV/p5.git)