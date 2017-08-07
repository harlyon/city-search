var teleApp = {};

var googleMapStyle = [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#1d2c4d"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#8ec3b9"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#1a3646"
      }
    ]
  },
  {
    "featureType": "administrative.country",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#4b6878"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#64779e"
      }
    ]
  },
  {
    "featureType": "administrative.province",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#4b6878"
      }
    ]
  },
  {
    "featureType": "landscape.man_made",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#334e87"
      }
    ]
  },
  {
    "featureType": "landscape.natural",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#023e58"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#283d6a"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#6f9ba5"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#1d2c4d"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#023e58"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#3C7680"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#304a7d"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#98a5be"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#1d2c4d"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#2c6675"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#255763"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#b0d5ce"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#023e58"
      }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#98a5be"
      }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#1d2c4d"
      }
    ]
  },
  {
    "featureType": "transit.line",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#283d6a"
      }
    ]
  },
  {
    "featureType": "transit.station",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#3a4762"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#0e1626"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#4e6d70"
      }
    ]
  }
]

// wait for html to load before initializing js
$(function() {
     teleApp.init();
});

teleApp.init = function() {
	teleApp.initSearchBar();
}

// user city input field (Teleport API auto complete search bar)
teleApp.initSearchBar = function() {
	TeleportAutocomplete.init('.city-input').on('change', function(value) { 

		// remove any maps / buttons from prior searches
		$('#map').remove();
		$('.mapContainer').remove();
		$('button').remove();
		$('.fullWidth').remove();
		$('.searchNotFound').remove();

		// get city details only if they exist
		if (typeof value["teleport_city_url"] !== undefined) {
			teleApp.getCityNameViaID(value.geonameId);

			// remove "Get the scoop..." it takes up too much space
			$('.intro').remove();
		} else {

		// 	city details DNE, please check back later
			clearSearchField();
			$('h1').css('backgroundImage', 'url(images/heroImage.jpg)');
			$('.headerContainer').append($('<div class="searchNotFound">').text("City details currently not available. Please check back again."));

		}
		
	});
}

// retrieve user selected API city name details via API geoname ID
teleApp.getCityNameViaID = function(id) {
	
	$.ajax({
		url: `https://api.teleport.org/api/cities/geonameid:${id}/`,
		method: 'GET',
		dataType: 'json'
	}).then(function(cityNameData) {
		teleApp.fullName = cityNameData.full_name;
		teleApp.cityName = cityNameData.name;
		teleApp.latitude = cityNameData.location.latlon.latitude;
		teleApp.longitude = cityNameData.location.latlon.longitude;

		// activate summary section
		$('.summaryWithMap').append('<div id="map">');
		
		// append map to DOM
		teleApp.displaySummarySection(teleApp.fullName, teleApp.cityName);
		
		setTimeout(function() {
			teleApp.initMap(teleApp.latitude, teleApp.longitude);
		}, 500);	

		

		// activate map
		if (typeof cityNameData._links['city:urban_area'] !== "undefined") {
		var cityLink = cityNameData._links['city:urban_area'].href;
			// get city info via api url
			teleApp.getCityInfoViaLink(cityLink);

		} else {
			// 	city details DNE, please check back later
			clearSearchField();
			$('h1').css('backgroundImage', 'url(images/heroImage.jpg)');
			var message = $('<div class="searchNotFound">').html("In depth city data currently not available. Please check back again.");
			$('.headerContainer').append(message);

		}

	})
}

// compiles summary section and sends to DOM
teleApp.displaySummarySection = function(fullName, cityName) {
	// change header to city name
	$('h1').text(cityName);

	// create summary header
	var summaryContainerHeader = $('<h2>').text(fullName);

	// summary container blurb obtained later	
	$('div.summary').empty();

	// append header to summary section in DOM 
	$('div.summary').append(summaryContainerHeader);
}

// calls google maps
teleApp.initMap = function (latitude, longitude) {

	var cityLocation = {lat: latitude, lng: longitude};
	var map = new google.maps.Map(document.getElementById('map'), {
	  zoom: 4,
	  center: cityLocation,
	  styles: googleMapStyle
	});
	var marker = new google.maps.Marker({
	  position: cityLocation,
	  map: map
	});
}

// retrieve city info via url
teleApp.getCityInfoViaLink = function(cityUrl) {
		$.ajax({
		url: cityUrl,
		method: 'GET',
		dataType: 'json'
		}).then(function(cityInfo) {

			// declare urls for specific types of city details
			var detailsUrl = cityInfo._links['ua:details'].href;
			var imagesUrl = cityInfo._links['ua:images'].href;
			var scoresUrl = cityInfo._links['ua:scores'].href;

			// call the urls of specific types of city data
			teleApp.getData(detailsUrl, "details", "categories");
			teleApp.getData(imagesUrl, "photos", "photos");;
			teleApp.getData(scoresUrl, "scores", "categories");
		});
}

// retrieve specific types of city data
teleApp.getData = function(url, type, subtype) {
	$.ajax({
		url: url,
		method: 'GET',
		dataType: 'json'
		}).then(function(data) {

			// search returns an object {_Links: Object, type(ie. passed in argument): Array, other:...}
			var typeOfCityDetails = data;
			// remove section not of use
			delete typeOfCityDetails['_links'];

		// for DETAILS
			if (type == "details") {

				// select specified subtype
				var targetedDetailsArray = typeOfCityDetails[subtype];
		
				// filter the array
				// iterate over the array, look for key value pairs of 'id: "CLIMATE"', and only return whatever has that pairing
				
				// all climate data
				var climateField = $.grep(targetedDetailsArray, function( k ) {
					  return ( k.id == "CLIMATE" );
					});
				
				// if climate data exists
				if (climateField.length !== 0) {
					// pull out specific climate data into an array
					teleApp.climate = climateField[0].data.map(function(value) {
						if (typeof value.float_value !== "undefined") {
							return value.label + ":    " + value.float_value
						} else if (typeof value.string_value !== "undefined") {
							return value.label + ":    " + value.string_value
						}
					})

					var climateButton = $('<button class="climate">').text("climate");

					// generate climate button in DOM
					$('.buttonsContainer').append(climateButton);
					
				}

				// end of climate section

				// all healthcare data
				var healthCareField = $.grep(targetedDetailsArray, function( k ) {
					  return ( k.id == "HEALTHCARE" );
					});

				// if healthcare data exists
				if (healthCareField.length !== 0) {

					// pull out specific healthcare data into an array
					teleApp.healthCare = healthCareField[0].data.map(function(value) {
						if (typeof value.float_value !== "undefined") {
							// last 17 characters of "label" (target so can remove "[teleport score]" if it's at end of label)
							var lastSeventeenChar = value.label.substring(value.label.length-17);

							// round float value to 2 decimal places:
							var floatValueCleaned = (value.float_value).toFixed(2);
							
							// if string contains " [teleport score]"
							if (lastSeventeenChar === " [Teleport score]") {
								// remove " [teleport score]", and make score out of 10 (instead of 1)
								return value.label.slice(0, -17) + " score:    " + (floatValueCleaned * 10).toFixed(1).toString() + " / 10"
							} else {
								return value.label + ":    " + parseInt(floatValueCleaned).toFixed(0).toString(0);
							} 
						}
					}) // end of healthcare (pull out specific data)
					

					var healthCareButton = $('<button class="healthCare">').text("health care");

					// generate climate button in DOM
					$('.buttonsContainer').append(healthCareButton);

				} // end of check if healthcare data exists

				// all enviro data
				var enviroField = $.grep(targetedDetailsArray, function( k ) {
					  return ( k.id == "POLLUTION");
					});

					// if enviro data exists
				if (enviroField.length !== 0) { 

					// pull out specific enviro data into an array
					teleApp.enviro = enviroField[0].data.map(function(value) {
						if (typeof value.float_value !== "undefined") {
							// last 17 characters of "label" (target so can remove "[teleport score]" if it's at end of label)
							var lastSeventeenChar = value.label.substring(value.label.length-17);

							// round float value to 2 decimal places:
							// var floatValueCleaned = Math.round(value.float_value * 100) / 100;
							var floatValueCleaned = (value.float_value).toFixed(2);

							// if string contains " [teleport score]"
							if (lastSeventeenChar === " [Teleport score]") {
								// remove " [teleport score]", and make score out of 10 (instead of 1)
								// return (floatValueCleaned * 10).toFixed(1).toString();
								return value.label.slice(0, -17) + " score : " + (floatValueCleaned * 10).toFixed(1).toString() + " / 10"
							} 
							else {
								return value.label + ": " + floatValueCleaned 
							} 
						}
					})

					var pollutionButton = $('<button class="pollution">').text("pollution");

					// generate pollution button in DOM
					$('.buttonsContainer').append(pollutionButton);

				} // end of check if healthcare exists

				activateButtonListeners();

				} // end of DETAILS

			// for IMAGES

				else if (type == "photos") {

					// select specified subtype
					var targetedDetailsArray = typeOfCityDetails[subtype];
	
					var photosField = targetedDetailsArray[0];

					teleApp.cityPhotoWeb = photosField.image.web;
					teleApp.cityPhotoMobile = photosField.image.mobile;

					if (typeof teleApp.cityPhotoWeb !== undefined) {
						$('h1').css('backgroundImage', 'url(' + teleApp.cityPhotoWeb + ')');
					}

					else {
						$('h1').css('backgroundImage', 'url(images/pexels-photo-238333-filter.jpg)');
					}

				} //end of IMAGES

			// for SCORES

				else if (type == "scores") {

					// get summary and overall score
					var citySummary = $('<div class ="fullSummary">').html(typeOfCityDetails.summary);
					var cityScore =  $('<div class="cityScore">').text("Score: " + typeOfCityDetails.teleport_city_score.toFixed(0) + " / 100");

					// send summary and overall score to DOM
					$('div.summary').append(citySummary, cityScore);


					// select specified subtype
					var targetedDetailsArray = typeOfCityDetails[subtype];

					// all tasks complete, clear search field
					clearSearchField();


				} //end of IMAGES
		}); 
}

// button listeners & content appender
var activateButtonListeners = function () {
	
	//climate button
	$('.climate').click(function() {
		$('.fullWidth').remove();
		$('.climate').addClass('currentButton');
		$('.healthCare').removeClass('currentButton');
		$('.pollution').removeClass('currentButton');


		// create box
		var fullWidth = $('<ul>').addClass('fullWidth');

		// add box to button container
		$('.buttonInfoContainer').append(fullWidth);

		teleApp.climate.forEach(function(element) {
			var climateSnippet = $('<li>').text(element);
			if (typeof element !== "undefined") {
				$('.fullWidth').append(climateSnippet);
			}
		})

	}); // end of climate button

	// health care button
	$('.healthCare').click(function() {
		$('.fullWidth').remove();
		$('.climate').removeClass('currentButton');
		$('.healthCare').addClass('currentButton');
		$('.pollution').removeClass('currentButton');
		// create box
		var fullWidth = $('<ul>').addClass('fullWidth');

		// add box to button container
		$('.buttonInfoContainer').append(fullWidth);

		teleApp.healthCare.forEach(function(element) {
			var healthSnippet = $('<li>').text(element);
			if (typeof element !==  "undefined") {
				$('.fullWidth').append(healthSnippet);
			}
		})
	}); // end of health care button

	// enviro button
	$('.pollution').click(function() {
		$('.fullWidth').remove();
		$('.climate').removeClass('currentButton');
		$('.healthCare').removeClass('currentButton');
		$('.pollution').addClass('currentButton');
		// create box
		var fullWidth = $('<ul>').addClass('fullWidth');

		// add box to button container
		$('.buttonInfoContainer').append(fullWidth);

		teleApp.enviro.forEach(function(element) {
			var enviroSnippet = $('<li>').text(element);
			if (typeof element !==  "undefined") {
				$('.fullWidth').append(enviroSnippet);
			}
		})
	}); // end of health care button

}

// clear search field
clearSearchField = function() {
	$('.city-input').val('');
}

	
