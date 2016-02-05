
angular.module('starter.controllers', ['ionic'])
.controller('AppCtrl', function($scope) {
  		$scope.loginData = {};
})
.controller('matchdetailCtrl', function($scope,$stateParams, config, $http, global) {
		var availabilityInfo 	=  global.getTempVal('availabilityInfo');
		console.log(availabilityInfo);
		$scope.imageNotAvail =  config.noImage;
		var from_time = availabilityInfo.match_time_from.split(" ");
		var to_time = availabilityInfo.match_time_to.split(" ");
		$scope.matchedUser 		= {
					formatted_name  : 'Name',
					headline		: 'Headline',
					location		: 'Location',
					phone			: 'Phone',
					match_time_from : from_time[1],
					match_time_to   : to_time[1],
					picture_url		: config.noImage,				
			};
		$scope.$on('$stateChangeSuccess', function() {
					global.loader();
					$http.post(config.apiUrl+'/getUserDetailForMatchProfile', { 'member_id' : config.userProfile.member_id,  'user_id' : $stateParams.toid , 'logId' : $stateParams.logid}).
								success(function(response) {
												 var result = response.result;
												 $scope.matchedUser.formatted_name = result.formatted_name;
												 $scope.matchedUser.headline = result.headline;
												 $scope.matchedUser.location = result.location;
												 $scope.matchedUser.contact_number = result.contact_number;
												 $scope.matchedUser.picture_url = result.picture_url;
												 $scope.matchedUser.venue = result.venue;
												 }).
								  error(function(data) {
												 global.popup();
												 }).
								  finally(function(data){
												   global.hideloader();
												   });
	  });		
})
.controller('pointCtrl', function($scope) {
  		$scope.points = {};
		$scope.imageNotAvail 	= 'img/no_image.png';
		$scope.NoPoints 		= "Fetching Points...";
		global.loader();
		$http.post(config.apiUrl+'/getPoints', { 'memberId' : config.userProfile.member_id }).
								success(function(response) {
												 console.log(response);
												 if(response.status == 'ok')
												 	{
														$scope.points = response.result; 
													}
													else
													{
														$scope.NoPoints = "Server Error..";
													}
												 global.hideloader();		
									  }).
								  error(function(data) {
												 $scope.NoPoints = "Server Error..";
												 global.popup();
												 global.hideloader();
										});
})
.controller('matchHistoryCtrl', function($scope, global, config, $http) {
		$scope.matchHistory 	= {};
		$scope.imageNotAvail 	= 'img/no_image.png';
		$scope.NoMatchtext 		= "Fetching Match History...";
		global.loader();
		$http.post(config.apiUrl+'/getMatchHistory', { 'memberId' : config.userProfile.member_id }).
								success(function(response) {
												 console.log(response);
												 if(response.status == 'ok')
												 	{
														$scope.matchHistory = response.result; 
													}
													else
													{
														$scope.NoMatchtext = "No Match History..";
													}
												 global.hideloader();		
									  }).
								  error(function(data) {
												 $scope.NoMatchtext = "No Match History..";
												 global.popup();
												 global.hideloader();
										});
})
.controller('reviewCtrl', function($scope, global, config, $stateParams, $http ,matches,$location) {								   
		$scope.disableReview = true;
		$scope.matchedUser 		= {
						formatted_name  : 'Name',
						headline		: 'Headline',
						location		: 'Location',
						match_time_from : '00:00',
						match_time_to   : '00:00',
						score			: 0,
						picture_url		: config.noImage,
				};
		$scope.review = {
				 'given_user' : config.userProfile.member_id,
				 'scheduled_log_id' : $stateParams.logid,
				 'no_show'	: 'N',
		 };
	 	matches.getMatchReviewDetails($stateParams.logid,$stateParams.toid).success(function(response) {
				if(response.status == 'ok')
				{
					response.result.venue_details = JSON.parse(response.result.venue_details);
					
					console.log(response.result.venue_details.result.name);
					response.result.formatted_name  = global.toTitleCase(response.result.formatted_name);
					response.result.headline 		= global.toTitleCase(response.result.headline);
					$scope.review.member_id			= response.result.member_id;
					$scope.matchedUser 				= response.result;
					
					if(response.result.venue_sched.completed == '')
					{
						$scope.disableReview = false;
					}
					else if(response.result.venue_sched.completed == 'N')
					{
						$scope.disableReview = true;
					}
				}
				else if (response.status == 'error')
				{
					global.popup("The match we found for you is not available right now!");
					$location.path("/app/availability");
				}
				else  if (response.status == 'expired')
				{
					global.popup("Match Expired!");
					$location.path("/app/availability");
				}
				global.hideloader();
	  	});
		$scope.noShow = function(){					
		 		$scope.review.no_show = $scope.review.no_show === 'N' ? 'Y' : 'N';
				if($scope.review.no_show == 'Y')
				{
					$scope.review.rating 	= 1;
					$scope.disableReview 	= true;
					$scope.review.feed_back = '';
				}
				else
				{
					$scope.disableReview = false;
				}
		};	
		$scope.saveReview = function(){
				global.loader();
				$scope.review.no_show == 'Y';
				{
					$scope.review.rating = 0;
				}
				$http.post(config.apiUrl+'/saveReview', { 'reviewInfo' : $scope.review }).
								success(function(response) {
												 if(response.status='ok')
													global.popup('Review Saved!');
												 else
													global.popup('Error! Review Not Saved!');
												 global.hideloader();		
									  }).
								  error(function(data) {
												 global.popup();
												 global.hideloader();
										});			
			};
})
.controller('matchCtrl', function($scope, $timeout, $stateParams, $http, $ionicLoading, global, config, $ionicPopup, matches, $http, $location, $q) {			
			$scope.matchAccepted 	= false;
			$scope.matchExpired 	= false;
			//if($stateParams.status == 'accepted')
			
			if(global.getTempVal('status')  == 'accepted')
			{				
				$scope.matchAccepted 		  = true;
				$scope.showwaitingForResponse = true; 
			}
			/*else if($stateParams.status == 'notaccepted')
			{
				$scope.waitingForResponse
			}*/
			$scope.imageNotAvail 	= 'img/no_image.png';
			$scope.matchedUser 		= {
						formatted_name  : 'Name',
						headline		: 'Headline',
						location		: 'Location',
						match_time_from : '00:00',
						match_time_to   : '00:00',
						score			: 0,
						picture_url		: config.noImage,
						remaining_time	: 15,
				};
			var mapOptions = {
						mapTypeId: google.maps.MapTypeId.ROADMAP,
						draggable : true
				};
			var bounds 			= new google.maps.LatLngBounds();			
			var map 			= new google.maps.Map(document.getElementById("maps"), mapOptions);
			var markers 		= [];
			$scope.infoWindow 	= new google.maps.InfoWindow();
			$scope.bounds 		= bounds;
			$scope.map 			= map;
			
			var boundsListener 	= google.maps.event.addListener((map), 'bounds_changed', function(event) {
				this.setZoom(14);
				google.maps.event.removeListener(boundsListener);
			});
			var idleListener 	= google.maps.event.addListenerOnce(map, 'idle', function(){
				global.hideloader();
				google.maps.event.trigger($scope.map, 'resize');
  				google.maps.event.removeListener(idleListener);
			});		
			var venuePromise 		= $http.post(config.apiUrl+'/getMatchVenues', {  'logId' : $stateParams.logid , 'tomatchLogId'  : $stateParams.toid  });
			var matchPromise 		= matches.getMatchDetails($stateParams.logid,$stateParams.toid,config.userProfile.member_id,global.getTempVal('status'));
			global.removeTemp('status');
			
			$q.all(['venuePromise', 'matchPromise']).then(function (res) {
				venuePromise.success(function(response) {
				var i=0;
				angular.forEach(response.result, function(venue, key) {
													venue 	= JSON.parse(venue);
													var lat = venue.result.geometry.location.lat;
													var lon = venue.result.geometry.location.lng;													
													var position 	= new google.maps.LatLng(lat, lon);
													var marker;
													$scope.bounds.extend(position);
													marker = new google.maps.Marker({
														position: position,
														map: $scope.map,
														title: venue.result.name
													});													
													// Allow each marker to have an info window    
													google.maps.event.addListener(marker, 'click', (function(marker, i) {																												
														return function() {
															$scope.infoWindow.setContent(venue.result.name);
															$scope.infoWindow.open($scope.map, marker);
														}
													})(marker, i));
													
													if($scope.matchedUser.match_venue_id !=  venue.result.place_id)
													{
														marker.setIcon('http://maps.google.com/mapfiles/ms/icons/yellow-dot.png');													
													}
													else
													{
														$scope.matchVenueName = venue.result.name;
														$scope.infoWindow.setContent(venue.result.name);
														$scope.infoWindow.open($scope.map, marker);
													}
															
													// Automatically center the map fitting all markers on the screen
													$scope.map.fitBounds($scope.bounds);											
											i++;
										});																							
				});
				matchPromise.success(function(response) {
					if(response.status == 'ok')
						{					
							//$scope.matchAccepted = false;
							response.result.formatted_name  = global.toTitleCase(response.result.formatted_name);
							response.result.headline 		= global.toTitleCase(response.result.headline);
							response.result.score			= Math.round( response.result.score );
							$scope.matchedUser 				= response.result;					
							var mytimeout 					= $timeout($scope.onTimeout,60000);
						}
						else if (response.status == 'expired')
						{
							$scope.matchExpired = true;
							response.result.formatted_name  = global.toTitleCase(response.result.formatted_name);
							response.result.headline 		= global.toTitleCase(response.result.headline);
							response.result.score			= Math.round( response.result.score );
							$scope.matchedUser 				= response.result;	
							//global.popup("Sorry ! Match Expired!");
							//$location.path("/app/availability");
						}
						else if (response.status == 'error')
						{
							global.popup("The match we found for you is not available right now!");
							$location.path("/app/availability");
						}
						else
						{
							global.popup("Match Not Found!");
							$location.path("/app/availability");
						}
				});
			});
			$scope.onTimeout = function(){			
				if($scope.matchedUser.remaining_time == 1)
				{
					//$http.post(config.apiUrl+'/insertPointsForUser', { 'userId'  : config.userProfile.member_id , 'pointId'  : '4' });
					$scope.matchExpired = true;
					//global.popup("Sorry ! Match Expired!");
					//$location.path("/app/availability");
				}
				else
				{
					$scope.matchedUser.remaining_time = $scope.matchedUser.remaining_time-1;
					mytimeout = $timeout($scope.onTimeout,60000);
				}
			}		
		/*$http.post(config.apiUrl+'/getMatchDetails', { 'userId' : $stateParams.toid }).
						success(function(response) {
										response.result.formatted_name  = global.toTitleCase(response.result.formatted_name);
										response.result.headline 		= global.toTitleCase(response.result.headline);
										$scope.matchedUser 				= response.result;
							  }).
						  error(function(data) {
										 global.popup();
								});		*/
							
$scope.matchAcceptedFn = function(){
		global.loader();
		$http.post(config.apiUrl+'/matchAccepted', { 'logId' : $stateParams.logid , 'tomatchLogId'  : $stateParams.toid  , 'fromUserId'  : config.userProfile.member_id}).
										success(function(response) {
														 if(response.status == 'expired')
														 {
															 global.popup("Sorry ! Match Expired!");
															 $location.path("/app/availability");
														 }
														 if(response.status == 'ok')
														 {
															global.scrollTop();
															$scope.matchAccepted = true;
															global.popup("Match Accepted!");
														 }
														 else if (response.status == 'error')
														 {
															 global.popup();
														 }
														 global.hideloader();														 
											  }).
										  error(function(data) {
														 global.popup();
														 global.hideloader();
												});		
		};
	$scope.matchRejected = function(){
			var confirm = global.confirm('Are you sure ?');
			confirm.then(function(res){
									  if(res)
										{
											global.loader();
											$http.post(config.apiUrl+'/insertPointsForUser', { 'userId'  : config.userProfile.member_id , 'pointId'  : '3' }).
											success(function(response) {
															 if(response.status == 'ok')
															 {
																 $location.path("/app/availability");
															 }
															 else
															 {
																 global.popup();
															 }
															 global.hideloader();														 
												  }).
											  error(function(data) {
															 global.popup();
															 global.hideloader();
													});										
										}
								  });
		};										  
})
.controller('venueDetailsCtrl', function($scope, venues,$ionicHistory) {
		$scope.imageNotAvail	 = 'img/no_image.png';
		$scope.venues 			= venues;
		console.log($scope.venues.venue);
		$scope.apiKey			= 'AIzaSyCSB01UwvVbd63eV_scq-rOD4AEirD8z9Q';	
		$scope.goBack = function(){
			$ionicHistory.goBack();
			};
})
.controller('venuesCtrl', function($scope, global, config, $http, $ionicLoading, $ionicPopup, $location,  $state, venues, $ionicHistory) {								  
		$scope.noRestaurants	= true;
		$scope.noRestaurantText = 'Searching for resturants..';
		$scope.fetchedOnce		= false;
		$scope.apiKey			= 'AIzaSyCSB01UwvVbd63eV_scq-rOD4AEirD8z9Q';
		var availabilityInfo 	=  global.getTempVal('availabilityInfo');		
		var venuesData = {
				'lat' 	 : availabilityInfo.match_latitude,
				'lon'	 : availabilityInfo.match_longitude,
				'radius' : availabilityInfo.match_radius
			};
		var selectedVenues	=  global.getTemp('selectedVenues');
		selectedVenues = selectedVenues.selectedVenues;
		$scope.selectedVenues = [];
		angular.forEach(selectedVenues, function(venue, key) {
							console.log(venue);
							$scope.selectedVenues.push(venue.venue_id);					 
						//	$scope.venues.venueDetails.push(venue);																						
			});	
		var latlon = venuesData.lat+','+venuesData.lon;
		var radius = venuesData.radius * 1000;
		$scope.nextPageToken = '';
		$scope.more = true;
		$scope.venues = venues;
		$scope.imageNotAvail	 = 'img/no_image.png';		
		$scope.$on('$stateChangeSuccess', function(ev, to, toParams, from, fromParams) {			  
				var selectedVenues	=  global.getTemp('selectedVenues');
				selectedVenues = selectedVenues.selectedVenues;
				$scope.selectedVenues = [];
				angular.forEach(selectedVenues, function(venue, key) {
									console.log(venue);
									$scope.selectedVenues.push(venue.venue_id);					 
								//	$scope.venues.venueDetails.push(venue);																						
					});
					if(from.name != 'venuedetails') //to prevent loader firing on coming back from detail page
					{
						 global.loader();
						 var promise = $http.post(config.apiUrl+'/getFavVenues', { 'userId'  : config.userProfile.member_id }).
								  error(function(data) {
												 global.popup();
												 global.hideloader();
										});
						promise.success(function(response){
												 console.log(response);
												 	latlon = venuesData.lat+','+venuesData.lon;
													$scope.venues.venueDetails = [];
													$scope.favVenues = [];
													angular.forEach(response.result, function(venue, key) {																							
																venue.selected = 'true';
																venue.favourite = 'true';
																$scope.venues.venueDetails.push(venue);
																$scope.favVenues.push(venue.venue_id);
														});													
													$scope.nextPageToken = '';
													$scope.$apply();
													$scope.getVenues();
													$scope.$apply();
												 });						
					}			
	  });
		$scope.getVenues = function (){
			console.log('gettingvenuedetails');
				latlon = availabilityInfo.match_latitude+','+availabilityInfo.match_longitude;
				var url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location='+latlon+'&radius='+radius+'&types=restaurant&key='+$scope.apiKey;
				if($scope.nextPageToken != '')
						url = url+'&pagetoken='+$scope.nextPageToken;
						
				$http.post(url).
								  success(function(response) {
									  				$scope.fetchedOnce = true;
												   angular.forEach(response.results, function(venue, key) {																							
																if($scope.favVenues.indexOf(venue.place_id) == -1)
																{
																	if($scope.selectedVenues.indexOf(venue.place_id) > -1)
																	 {
																		venue.selected = 'true';
																	 }
																	 else
																	 {
																		 venue.selected = 'false';
																	 }
																	$scope.venues.venueDetails.push(venue);	
																}																													
																//$scope.selectedCompanyDetails.concat([company]);																						
												});
												  /*if($scope.venues.venueDetails == null)
												  	{
														$scope.venues.venueDetails = response.results;
												  	}
												  else
												  	{
														console.log(typeof $scope.venues.venueDetails);
														$scope.venues.venueDetails.concat(response.results);
														console.log(typeof response.results);
													}*/												  
												  if(typeof response.next_page_token != 'undefined')
												  {
												  		$scope.nextPageToken 	 = response.next_page_token;
												  }
												  else
												  {
													  $scope.nextPageToken = '';
													  $scope.more = false;
													  console.log('nomore');
												  }												   
												  if($scope.venues.venueDetails.length)
												  	{
														$scope.noRestaurants = $scope.venues.venueDetails.length;
												  	}
												  		
													else
													{
														$scope.noRestaurantText = 'No Restaurants Found';
														$scope.noRestaurants = false;
													}
														
												$ionicLoading.hide();												
												//$location.path("/app/venues");
								  }).
								  error(function(data) {
											global.popup();
											$ionicLoading.hide();
								}).
								finally(function(){
									$scope.$broadcast('scroll.infiniteScrollComplete');
								});
			};		
			$scope.showDetails = function(venue){
					$scope.venues.venue = venue;
					global.loader();
					$http.get('https://maps.googleapis.com/maps/api/place/details/json?placeid='+venue.place_id+'&key='+$scope.apiKey).
								  success(function(response) {
													 /*var popup = $ionicPopup.alert({
															  title: 'Success',
															  template: response.message
															});*/
												$scope.venues.venue.details = response.result;
												$ionicLoading.hide();
												$location.path("/venuedetails");
								  }).
								  error(function(data) {
											global.popup();
											$ionicLoading.hide();
								});					

				};
			$scope.venueSelected = function(){
				console.log($scope.venues.venueDetails);
				var count = 0;
				angular.forEach($scope.venues.venueDetails, function(venue, key) {						
							if(venue.selected === 'true')
							{
								count++;
							}							
				});
				if(count <= 0)
				{
					global.popup('Please select at least one venue!');
					return;
				}
					
				global.loader();	
				$http.post(config.apiUrl+'/saveVenues', { 'venueDetails' : $scope.venues.venueDetails , 'availabilityId' : global.getTempVal('availabilityId'), 'memberId': config.userProfile.member_id  }).
								  success(function(response) {
									 console.log(response); 		
												global.popup('You have set your availability and preferred venues ! We will notify you when a match is found for you !');
												$ionicLoading.hide();
												$location.path("/app/availability");
								  }).
								  error(function(data) {
											global.popup();
											$ionicLoading.hide();
								});
		};
})
.controller('CompaniesCtrl', function($scope, $http, $ionicPopup, $filter, global, config, $ionicHistory, $ionicLoading ) {

	var companyStart		 = 0;
	$scope.companyCount 	 = 50;
	$scope.searchKey 		 = '';	  
	//$scope.accessToken 		 = localStorage.getItem("lmAccessToken");
	$scope.accessToken 		 = config.userProfile.access_token;
	$scope.companies 		 = [];
	$scope.selectedCompanies = [];
	$scope.selectedCompanyDetails = [];
	$scope.more 			 = true;
	$scope.imageNotAvail	 = 'img/no_image.png';
	$scope.noCompanies 		 = true;	
	$scope.$on('$stateChangeSuccess', function() {
		$scope.searchKey = global.getTempVal('searchKey');
		global.loader();
		$scope.companies 		 = [];
		$scope.loadCompanies();
	  });

	$scope.toggleCompany = function (company) {
	  var tf = (company.selected === 'true') ? 'false' : 'true';
	  company.selected = tf;
	};	
  $scope.companySelected = function(){
	  		global.loader('Adding Companies..');
			angular.forEach($scope.companies, function(company, key) {						
							if(company.selected === 'true')
							{
								$scope.selectedCompanyDetails.push(company);
								//$scope.selectedCompanyDetails.concat([company]);
							}							
				});
			if( typeof config.userProfile.preferences == 'undefined')
				{
					config.userProfile.preferences = {};
					config.userProfile.preferences.companies = {};
					config.userProfile.preferences.companies = $scope.selectedCompanyDetails;
				}				
			else if( typeof config.userProfile.preferences.companies == 'undefined')
				{
					config.userProfile.preferences.companies = {};
					config.userProfile.preferences.companies = $scope.selectedCompanyDetails;
				}
			else
				{
					config.userProfile.preferences.companies.concat($scope.selectedCompanyDetails);
				}
			 $ionicLoading.hide();	
			$ionicHistory.goBack();
		};
  $scope.loadCompanies = function () {
      var searchCompanyURL = 'https://api.linkedin.com/v1/company-search:(companies:(id,name,logo_url,square-logo-url))?keywords='+$scope.searchKey+'&oauth2_access_token='+$scope.accessToken+'&format=json&start='+companyStart+'&count='+$scope.companyCount;
    // Load the data from the github api. 
					  
	$scope.noCompanies 		 = true;				  
    $http.get(searchCompanyURL)
    .success(function (companies, status, headers) {
      
      // Check Link header to determine if more pages are available.
      // If not, disable infinite scroll.
	  //companiesobj = JSON.parse(companies);
      if (companies.companies._total <= companyStart) {
        $scope.more = false;
      }
	  else
	  {
		  $scope.more = true;
	  }
	  console.log(companies.companies._total);
       if(companies.companies._total == 0)
	   	   {
			   $scope.noCompanies = false;
			   $scope.more = false;
		   }				
			else
			{
				$scope.noCompanies 		 = true;
			}

      // Push all of the companies from response into model.
      angular.forEach(companies.companies.values, function (company) {
        $scope.companies.push(company);
      });
	  $ionicLoading.hide();
    })
    
    .error (function (data, status, headers) {
      
      // Disable infinite scroll since we've got an error.
      $scope.more = false;
      $ionicLoading.hide();
      if (headers('x-ratelimit-remaining') == 0) {
        
        // Check if it is due to Github rate limiting.
        var popup = $ionicPopup.alert({
          title: 'You have exceeded LinkedIn\'s Rate Limit.',
          template: 'Try again after ' + $filter('date')(parseInt(headers('x-ratelimit-reset')) * 1000, 'short')
        });
        
      } else {
        
        // Otherwise show general alert.
        $ionicPopup.alert({
          title: 'LinkedIn did not respond.',
          template: 'Please try again.'
        });
      }
    })
    
    .finally(function () {
      
      // On finish, increment to next page and alert infiniteScroll to close.
	  companyStart = companyStart+$scope.companyCount;
      $scope.$broadcast('scroll.infiniteScrollComplete');
    });
	
  };
  
 })
.controller('AvailabilityCtrl', function($scope, $ionicLoading, $compile, $http, config, global, $ionicPopup, $ionicScrollDelegate, $location) {
			global.loader();
			$scope.circle 	= '';
			$scope.map 		= '';
			$scope.marker 	= '';
			$scope.time_zone_api_key = 'AIzaSyBq6JqQbFI3vSLrcCAY4dzvYeRhvCCp4J0';
			$scope.disableAvailability = false;
			$scope.timeSlotRestrictStartFrom = false;
			$scope.userAvailability =  {
								match_radius 	: .5,
								match_time_from : '',
								match_time_to	: '',
								match_latitude	: '',
								match_longitude	: '',
								member_id		: config.userProfile.member_id,
								created_time	: '',
								availableToday	: false,
								location		: '',
								};
			$scope.disable 		 = 	{
								disableFields : true
								};
			
			$scope.timeRange 	 = {
									match_time_from : 0.00,
									match_time_to 	: 1.00
								 };				
			$scope.time = 	{
							"0.00" : "11:00:00",
							"0.50" : "11:30:00",
							"1.00" : "12:00:00",
							"1.50" : "12:30:00",
							"2.00" : "13:00:00",
							"2.50" : "13:30:00",
							"3.00" : "14:00:00",
							"11:00:00" : "0.00",
							"11:30:00" : "0.50",
							"12:00:00" : "1.00",
							"12:30:00" : "1.50",
							"13:00:00" : "2.00",
							"13:30:00" : "2.50",
							"14:00:00" : "3.00"
							};
			$scope.time12 = {
								"0.00" : "11:00 AM",
								"0.50" : "11:30 AM",
								"1.00" : "12:00 PM",
								"1.50" : "12:30 PM",
								"2.00" : "01:00 PM",
								"2.50" : "01:30 PM",
								"3.00" : "02:00 PM",			
							};
			$scope.checkTime = function(){
						var today = new Date();										
						var hh = today.getHours();
						var mm = today.getMinutes();									
						if(hh <= 5 || hh >=11)
							return false;
						else
							return true;
					};
			$scope.getToday = function(){
							var today = new Date();
							var dd = today.getDate();
							var mm = today.getMonth()+1;
							var yyyy = today.getFullYear();							
							if(dd<10) {
								dd='0'+dd
							} 
							
							if(mm<10) {
								mm='0'+mm
							} 
							
							var date = yyyy+'-'+mm+'-'+dd;
							
						return date;	
					};	
//alert($scope.checkTime());
			$scope.checkifAvailable = function(){
					if(!$scope.userAvailability.availableToday)
					{
						global.popup("Please set available today !");
					}
				};
			$scope.scrollBottom = function() {
						$ionicScrollDelegate.scrollBottom();
					  };
			$scope.disableFields = function(value){
						if($scope.disableAvailability)
							return;
							
						if(value==false)
							$scope.disable.disableFields = true;
						else
							$scope.disable.disableFields = false;
							
						$scope.map.setOptions({draggable: value});
						$scope.marker.setOptions({draggable: value});
					};
			$scope.$on('$stateChangeSuccess', function() {
				 google.maps.event.trigger($scope.map, 'resize');
				 $scope.$broadcast('refreshSlider');
			  });	
			$scope.getNow = function(){
					var today = new Date();					
					var hh = today.getHours(); // => 9
					var mm = today.getMinutes(); // =>  30
					var ss = today.getSeconds(); // => 51
					var time   = hh+':'+mm+':'+ss;					
					return time;
				};
			$scope.restrictAvailability = function(value){
					if($scope.disableAvailability){
						if(value)
						{
							$scope.userAvailability.availableToday = $scope.userAvailability.availableToday === true ? false : true;
						}
						 	global.popup($scope.reason);
						}
				};
			$scope.saveAvailability = function(){
						if($scope.disableAvailability){											
						 	global.popup($scope.reason);
							return;
						}
						if(!$scope.userAvailability.availableToday)
						{
							global.popup('Please set availability to view venues!');
							return;
						}
										
						var date = $scope.getToday();
						
						/*$scope.userAvailability.match_time_from = date+' '+$scope.time[$scope.timeRange.match_time_from];
						$scope.userAvailability.match_time_to 	= date+' '+$scope.time[$scope.timeRange.match_time_to];*/
						
						$scope.userAvailability.match_time_from = $scope.time[$scope.timeRange.match_time_from];
						$scope.userAvailability.match_time_to 	= $scope.time[$scope.timeRange.match_time_to];
						
						var time = $scope.getNow();
						var latlon = $scope.userAvailability.match_latitude+','+$scope.userAvailability.match_longitude;;						
						global.loader();
						var promise = $http.get('https://maps.googleapis.com/maps/api/timezone/json?location='+latlon+'&timestamp=1331161200&key='+$scope.time_zone_api_key);
						
						//date   = date+' '+time;
						//$scope.userAvailability.created_time = date;
						promise.success(function(response){
							$scope.userAvailability.timezone = response.timeZoneId;
							$http.post(config.apiUrl+'/saveAvailability', { 'AvailabilityData' : $scope.userAvailability }).
												  success(function(response) {
																$ionicLoading.hide();
																console.log(response.selected_venues);
																 if(typeof response.selected_venues != 'undefined')
																{
																	global.addTemp('selectedVenues',response.selected_venues);
																}
																 
																if(response.status == 'ok')
																{
																	var availabilityInfo = {};
																	availabilityInfo	= $scope.userAvailability;
																	global.addTemp('availabilityInfo',availabilityInfo);
																	global.addTemp('availabilityId',response.result);
																	$location.path("/app/venues");
																}
																else if ( response.status == 'cannotset' )
																{
																	global.popup(response.message);
																}
																else
																{ 
																	global.popup();
																}
												  }).
												  error(function(data) {
																 global.popup();
																$ionicLoading.hide();
												});
							});
						promise.error(function(response){
												   global.popup();
												   $ionicLoading.hide();
											   });	
				};
			$scope.$on('g-places-autocomplete:select', function (event, place) {  	
									$scope.marker.setVisible(false);
									//var place = autocomplete.getPlace();
									if (!place.geometry) {
									  return;
									}
									$scope.marker.setPosition(place.geometry.location);
									$scope.marker.setVisible(true);
									
									$scope.userAvailability.match_latitude  = place.geometry.location.lat();
									$scope.userAvailability.match_longitude = place.geometry.location.lng();
									
									var address = '';
									if (place.address_components) {
									  address = [
										(place.address_components[0] && place.address_components[0].short_name || ''),
										(place.address_components[1] && place.address_components[1].short_name || ''),
										(place.address_components[2] && place.address_components[2].short_name || '')
									  ].join(' ');
									  $scope.userAvailability.location = address;
									}
									$scope.map.setCenter($scope.marker.getPosition());
									if ($scope.map.getZoom() > 16) $scope.map.setZoom(16); 
			});	
		onSuccess = function(position){
				$scope.userAvailability.match_longitude  = position.coords.longitude, longitude = position.coords.longitude;
				$scope.userAvailability.match_latitude =  position.coords.latitude, latitude = position.coords.latitude;
				var latLong = new google.maps.LatLng(latitude, longitude);
				var geocoder= new google.maps.Geocoder();
				var mapOptions = {
					center: latLong,
					zoom: 13,
					mapTypeId: google.maps.MapTypeId.ROADMAP,
					draggable : false
				};
		 
		var map = new google.maps.Map(document.getElementById("map"), mapOptions);		
		$scope.map = map;							  
		codeLatLng (latitude,longitude);
		var input = (document.getElementById('search'));
		var marker = new google.maps.Marker({
				position: latLong,
				map: map,
				draggable:false,
			});
		$scope.marker = marker;	
		$scope.circle = new google.maps.Circle({
			strokeColor: "#FF0000",
			strokeOpacity: 0.8,
			strokeWeight: 2,
			fillColor: "#FF0000",
			fillOpacity: 0.35,
			map: map,
			radius: 500
		  });
				
		$scope.circle.bindTo('center', marker, 'position');			
		var idleListener = google.maps.event.addListenerOnce(map, 'idle', function(){
			$ionicLoading.hide();
			google.maps.event.trigger($scope.map, 'resize');
			google.maps.event.removeListener(idleListener);
		});		
		$http.post(config.apiUrl+'/getAvailability', { 'userId' : config.userProfile.member_id }).
												  success(function(response) {
																  
																   /*match_latitude: "59.20700000"
																	match_longitude: "-110.84000000"*/
																	console.log(response);
																	if(response.status == 'ok' && response.result.match_logid!= null)
																	{	
																		response = response.result;
																		console.log(response);																																					
																		$scope.userAvailability.availableToday = true;
																		$scope.disable.disableFields = false;
																		$scope.userAvailability.match_radius = response.match_radius;
																		$scope.userAvailability.match_latitude  = response.match_latitude;
																		$scope.userAvailability.match_longitude = response.match_longitude;
																		codeLatLng(response.match_latitude,response.match_longitude);																		
																		var latlng = new google.maps.LatLng(response.match_latitude, response.match_longitude);
																		$scope.map.setCenter(latlng);																		
    																	$scope.marker.setPosition(latlng);
																		var from_time = response.match_time_from.split(" ");
																		var to_time = response.match_time_to.split(" ");
																		$scope.timeRange.match_time_from =  $scope.time[from_time[1]];																		
																		$scope.timeRange.match_time_to = $scope.time[to_time[1]];
																		if(response.matches != null)
																		{
																			availabilityInfo	= $scope.userAvailability;
																			global.addTemp('availabilityInfo',response);																			
																			$location.path("/app/matchdetail/"+response.match_logid+"/"+response.matches);
																			//$location.path("/app/matchprofile/"+response.matchlogid+"/"+response.matches);
																			//$location.path("/app/matchprofile/1/491/matchscheduled");
																		}
																		else if (response.temp_matches != null)
																		{
																			$scope.match_logid = response.match_logid;
																			var getlogpromise = $http.post(config.apiUrl+'/getLogDetailsFromTemp', { 'match_logid' : response.match_logid , 'user_id' : config.userProfile.member_id });
																			getlogpromise.success(function(response){
																										   console.log(response);
																										   $scope.acceptStatus = '';
																										  if($scope.match_logid == response.result.from_match_logid)
																										  {
																											$scope.matchuser = response.result.to_match_logid;
																											if(response.result.from_match_status == 'Y')
																											  	$scope.acceptStatus = 'accepted';//waiting other match response
																											else
																												$scope.acceptStatus = 'notaccepted';
																										  }
																										  else
																										  {
																											  $scope.matchuser = response.result.from_match_logid;
																											  if(response.result.to_match_status == 'Y')
																											  	$scope.acceptStatus = 'accepted';//waiting other match response
																											else
																												$scope.acceptStatus = 'notaccepted';
																										  }
																										  global.addTemp('status',$scope.acceptStatus);
																							// $location.path("/app/matchprofile/"+response.result.log_id+"/"+$scope.matchuser+"/"+$scope.acceptStatus);
																							$location.path("/app/matchprofile/"+response.result.log_id+"/"+$scope.matchuser);
																							});
																		}
																		$scope.map.setOptions({draggable: true});
																		$scope.marker.setOptions({draggable: true});																	
																		radius = Number(response.match_radius) * 1000;
																		$scope.circle.set('radius', parseInt(radius, 10) );																		
																   }
																   else
																   {
																	 response = response.result;																 		
																   }																  
																   $scope.time = JSON.parse(response.time_range);																		
												  }).
											  error(function(data) {
															 global.popup();
														});	
				google.maps.event.addListener(marker, 'dragend', function(evt){
							$scope.userAvailability.match_longitude = evt.latLng.lng().toFixed(3);
							$scope.userAvailability.match_latitude  = evt.latLng.lat().toFixed(3);							
							codeLatLng(evt.latLng.lat().toFixed(3),evt.latLng.lng().toFixed(3));
				});
		
				function codeLatLng(lat,lng) {
							  var latlng = new google.maps.LatLng(lat, lng);
							  geocoder.geocode({'latLng': latlng}, function(results, status) {
								if (status == google.maps.GeocoderStatus.OK) {
								  if (results[1]) {
									//infowindow.setContent('<div><strong>' + results[1].formatted_address + '</strong><br>');
									document.getElementById('search').value = results[1].formatted_address;
									 $scope.userAvailability.location = results[1].formatted_address;
								//	infowindow.open(map, marker);
							
								  } else {
									global.popup('Could not fetch current location! Please try again later');
								  }
								} else {
									global.popup('Could not fetch current location! Please try again later');
								  //alert('No results found due to: ' + status);
								}
							  });
				}					
			};
		
		onError = function(error){
			global.hideloader();
				var promise = global.confirm("Looks like GPS on your phone is not enabled ! Enable it and click OK !");
				 promise.then(function(){
										   global.loader();
										   navigator.geolocation.getCurrentPosition(onSuccess, onError, {
											  timeout: 10000,
											  maximumAge: 10000
											});
									   }); 
			};
		$scope.radiusChange = function(radius) {
			radius = radius * 1000;
			$scope.circle.set('radius', parseInt(radius, 10) );
			};
navigator.geolocation.getCurrentPosition(onSuccess, onError, {
										  timeout: 10000,
										  maximumAge: 10000
										});					  
})
.controller('HomeCtrl', function($scope, $http, config, $location, $ionicPopup,  $ionicLoading, global, $ionicViewService){
	
								 $ionicViewService.nextViewOptions({
									 disableBack: true
								  });
								 global.loader();
								  $scope.lmUserProfile = localStorage.getItem("lmUserProfile");
								 if($scope.lmUserProfile){	
										userProfile = JSON.parse($scope.lmUserProfile);
										deviceDetails = {};
										deviceDetails.device_token 		= localStorage.getItem("deviceToken");
										deviceDetails.device_platform 	 = localStorage.getItem("devicePlatform");										
											$http.post(config.apiUrl+'/getProfile', { 'userId' : userProfile.member_id , 'deviceDetails' : deviceDetails}).
											  success(function(response) {							
															 global.hideloader();
															 if(response.result == null){
																 	global.hideloader();
																	$location.path("/login");
																	return;
															}
															if(response.result.is_block == 'Y'){
																global.hideloader();
																global.popup('Sorry! Your account has blocked . Please contact administrator !');
																$location.path("/login");
															}
															else if (response.status == 'ok')
															{
																global.hideloader();
																config.userProfile = response.result;
																localStorage.setItem("lmUserProfile", JSON.stringify(response.result));
																if(localStorage.getItem("pushreceived"))
																{
																	 $location.path(localStorage.getItem("pushreceived"));
																	 localStorage.removeItem("pushreceived");
																}
																else if(!response.result.contact_number)
																{
																	$location.path("/app/registration");
																}	
																else if(response.result.availabilitydata.match_logid == null )
																{
																	$location.path("/app/availability");
																}															
															}
															else
															{
																global.hideloader();
																global.popup();
																$location.path("/login");
															}
															
											  }).
										  error(function(data) {
														 global.popup();
														 $location.path("/login");
														 global.hideloader();
														/* navigator.app.exitApp();*/
													});											
										}
										else
										{
											global.hideloader();
											$location.path("/login");
										}							
								 })
.controller('LoginCtrl', function($scope, $ionicPopup, $cordovaOauth, $http, config, $location, $ionicLoading, global,$cordovaDatePicker,$ionicViewService) {
  // Form data for the login modal
/*  var options = {
    date: new Date(),
    mode: 'time', // or 'time'
    minTime: '09:00',
	maxTime:'13:00',
    doneButtonLabel: 'DONE',
    doneButtonColor: '#F2F3F4',
    cancelButtonLabel: 'CANCEL',
    cancelButtonColor: '#000000'
  };
  $cordovaDatePicker.show(options).then(function(date){
        alert(date);
    });*/
					$ionicViewService.nextViewOptions({
									 disableBack: true
								  });
					$scope.showmenuButton = true;			
					$scope.genders = [{value: 'Male', name: 'Male'},{value: 'Female', name: 'Female'}];
					$scope.user = { gender: '', phoneNumber : '', excludePreviousMatches : 'N' };
					if(config.userProfile.member_id){			
						global.loader();
						$http.post(config.apiUrl+'/getPreferences', {'member_id' : config.userProfile.member_id } ).
										  success(function(response) {														
														if(response.status == 'ok')
														{
															response = response.result;
															$scope.user.gender 				= response.gender;
															$scope.user.phoneNumber 		= parseInt(response.contact_number);
															$scope.user.excludeGender 		= response.gender_exclude;
															$scope.user.excludePreviousMatches = response.exclude_pre_match;
															/*if(response.exclude_pre_match === '1')
																$scope.user.excludePreviousMatches = true;				*/											
															$scope.user.notificationTime	= response.notification_time;															
															$scope.savedCompanies 			= response.companies;
														}
														else
														{
															global.popup();
														}
														
														global.hideloader();
										  }).
										  error(function(data) {
											 			global.popup();
														global.hideloader();
										 });	
					}				
			  $scope.more = true;
			  $scope.searchKey = '';
			  $scope.companies = [{}];
			  $scope.companyTemp = [{}];
			  $scope.page = 10;			  
  			  $scope.url		='https://api.linkedin.com/v1/people/~:(id,first-name,last-name,maiden-name,formatted-name,industry,picture-url,headline,email-address,location:(name),three-current-positions,interests,publications,languages,skills,educations,courses,date-of-birth)?oauth2_access_token=' ;
			  
$scope.$on('$stateChangeSuccess', function() {
							$scope.showmenuButton = true;		
							var lmUserProfileJson = localStorage.getItem("lmUserProfile");
							if(lmUserProfileJson){
								var lmUserProfile 		  = JSON.parse(lmUserProfileJson);						
								if( !lmUserProfile.contact_number)
								{					
									$scope.showmenuButton = false;
								}
							}							
								
						  });
			var today = new Date();
			var year = today.getYear();
			var month = today.getMonth();
			var day = today.getDay();
			var hour = '09';
			var min = '00';
			var defaulttime = new Date(year,month,day,hour,min);
			angular.element(document).ready(function () {
				$('#notificationTime').mobiscroll().time({
                    theme: 'android-holo',
                    mode: 'scroller', 
                    display: 'bottom',
					stepMinute: 30,
					defaultValue: defaulttime ,
					timeWheels: 'HHii',
					invalid: [
						 { start: '12:01', end: '23:59' },	  
						 { start: '00:00', end: '05:59' }, // Every day   						
					]
                });
			});
  $scope.searchCompany = function(searchKey){
	  global.addTemp('searchKey',searchKey);
	  $location.path("/companies");
  };
  $scope.removeCompany = function (id){	 
	 var popup = global.confirm('Delete the selected company ?');	
	 popup.then(function(res) {
			 if(res) {     
					angular.forEach($scope.savedCompanies, function(result,index) {
										if(result['id'] == id) {
											  $scope.savedCompanies.splice(index, 1);
										  }   					
							});				
			 }
  	 });

			/* $.each(array, function(index, result) {
				  if(result[property] == value) {
					  array.splice(index, 1);
				  }    
		   });*/
	 };
  $scope.doLogin = function(){
			var ldinClientId 	= config.ldinClientId;
			var ldinSecret 		= config.ldinSecret;
			var ldinScope 		= config.ldinScope;
			var ldinState 		= config.ldinState;
			var accessToken 	= config.accessToken;
				/*if(localStorage.getItem("lmAccessToken"))
				{
				accessToken = localStorage.getItem("lmAccessToken");
				console.log("access");
				console.log(accessToken);
				$scope.getProfile(accessToken);
				return;
				}*/

			  $cordovaOauth.linkedin(ldinClientId, ldinSecret, ldinScope, ldinState).then(function(result) {
																								   
					//alert(JSON.stringify(result));
					accessToken 		= result.access_token;
					config.accessToken	= accessToken;
					expiresIn 			= result.expires_in;
					if(typeof(Storage) !== "undefined") {
					localStorage.setItem("lmAccessToken", accessToken);
					} else {
					}
					
					$scope.getProfile(accessToken);
					
				}, function(error) {
					// error
				});
	  };
	$scope.showValidationMessages = false;
	$scope.$on('$stateChangeSuccess', function() {
	if(typeof config.userProfile.preferences != 'undefined' && config.userProfile.preferences.companies != 'undefined')
	{
		if(typeof $scope.savedCompanies == 'undefined')
			{
				$scope.savedCompanies = config.userProfile.preferences.companies;
			}
			else if(typeof config.userProfile.preferences.companies == 'undefined')
			{

			}
			else
			{	
				$scope.savedCompanies = $scope.savedCompanies.concat(config.userProfile.preferences.companies);
			}		
		//$scope.savedCompanies = config.userProfile.preferences.companies;
		$scope.savedCompanies = $scope.arrUnique($scope.savedCompanies);		
	}	
  });
	$scope.arrUnique = function(origArr) {
		var newArr = [],
        found;
		angular.forEach(origArr, function(object, key) {
							found = undefined;							
							angular.forEach(newArr, function(object2, key) {									
									if(object.id == object2.id){
										found = true;
										}
							});
							if (!found) {
									newArr.push(object);
								}							
				});
    return newArr;
	}
	$scope.regComplete  = function (form){
		
		   if(form.$valid) 
			{
				global.loader();
				$scope.user.notificationTime	= $('#notificationTime').val();
				config.userProfile.preferences 	= $scope.user;
				$scope.user.member_id			= config.userProfile.member_id;
				if($scope.user.excludeGender == null)
					$scope.user.excludeGender = 'N';
				if($scope.user.excludePreviousMatches == null)
					$scope.user.excludePreviousMatches = 'None';
				
				$http.post(config.apiUrl+'/savePreferences', { 'preferenceData' : $scope.user, 'companiesData' :  $scope.savedCompanies}).
										  success(function(response) {
											  
														   if(response.status == 'ok')
														   {
															   
															   lmUserProfile = JSON.parse(localStorage.getItem("lmUserProfile"));
															   lmUserProfile.contact_number  = $scope.user.phoneNumber;
															   lmUserProfile.gender  = $scope.user.gender;
															   localStorage.setItem("lmUserProfile", JSON.stringify(lmUserProfile));
															   console.log(localStorage.getItem("lmUserProfile"));
															   $location.path("/app/availability");
														    }														
										  }).
										  error(function(data) {
											// alert(JSON.stringify(data));
											 			global.popup();
														
										}).finally(function () {
											global.hideloader();
										});
				
				
			}
			else
			{
				$scope.showValidationMessages = true;	
			}		 
	  }
	$scope.getProfile = function(accessToken){
	 				url = $scope.url;
					url += accessToken+'&format=json';
					global.loader();
					$http.get(url).
					  success(function(userProfile, status, headers, conf) {
									userProfile.accesToken 	= accessToken;
									userProfile.deviceToken =  localStorage.getItem('deviceToken');
									userProfile.devicePlatform =  localStorage.getItem('devicePlatform');
									
									$http.post(config.apiUrl+'/saveProfile', { 'profileData' : userProfile }).
										  success(function(response) {
														   if(response.status == 'ok')
														   {
															   if(response.result.is_block == 'Y')
																{
																	global.popup('Sorry! Your Account Is Blocked!');
																	$location.path("/login");
																}
																else
																{
																	config.userProfile = response.result;
																   localStorage.setItem("lmUserProfile", JSON.stringify(response.result));
																   if(response.message == 'User Exists')
																	{																	
																		$location.path("/app/availability");
																	}
																	else
																	{
																		//$location.path("/app/availability");
																		$location.path("/app/registration");
																	}
																}															   
															}														
														$ionicLoading.hide();
														//$location.path("/app/registration");
										  }).
										  error(function(data) {
											// alert(JSON.stringify(data));
											 			global.popup();
														localStorage.removeItem("lmUserProfile");
														$scope.doLogin();
														$ionicLoading.hide();
								});
					  					  									
					  }).
					  error(function(data, status, headers, conf) {
						// alert(JSON.stringify(data));
								global.popup('Authentication failed ! Please login again !');								
								localStorage.removeItem("lmUserProfile");
								$scope.doLogin();
								$ionicLoading.hide();
					  });
	  };
})