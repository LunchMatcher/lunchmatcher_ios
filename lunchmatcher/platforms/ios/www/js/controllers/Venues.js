angular.module('starter.controllers')
.controller('venuesCtrl', ['$scope', 'global', 'config', '$http', '$ionicLoading', '$ionicPopup', '$location',  '$state', 'venues', '$ionicHistory',function($scope, global, config, $http, $ionicLoading, $ionicPopup, $location,  $state, venues, $ionicHistory) {								  
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
		$scope.selectedVenues =  venues.selectedVenues;
		
		var latlon = venuesData.lat+','+venuesData.lon;
		var radius = venuesData.radius * 1000;
		$scope.nextPageToken = '';
		$scope.more = true;
		$scope.venues = venues;
		$scope.imageNotAvail	 = 'img/no_image.png';	
		
		$scope.nextPageToken	   = '';
		$scope.venues.venueDetails = [];
		$scope.blockeVenues 		= [];
		$scope.venuesImages 		= [];
				
		
//**************************************** Functions *************************************//
			
			
//******** gotoback
			$scope.getVenues = function (){
				
				$http.post(config.apiUrl+'/getVenues', { 'userId' : config.userProfile.member_id ,'venuesData' : venuesData, 'nextPageToken' : $scope.nextPageToken}).   //temp code 
						success(function(response) {
							$scope.fetchedOnce = true;
							
							$scope.venues.venueDetails = $scope.venues.venueDetails.concat(response.results);
							$scope.blockeVenues = $scope.blockeVenues.concat(response.blockedVenues); 
							$scope.venuesImages = $scope.venuesImages.concat(response.venuesImages); 
							//$scope.venuesImages = response.venuesImages;
							
							//console.log($scope.venuesImages[0]);
							
									angular.forEach($scope.venues.venueDetails, function(venue, key) {
										if($scope.selectedVenues.indexOf(venue.place_id) > -1){
												venue.selected = 'true';
											}		
										if(venue.favourite == true){	
											venue.selected = 'true';
											$scope.selectedVenues.push(venue.place_id);
										 }									
									});
																						  
									
									if(response.next_page_token == null){
										$scope.more = false;
										$scope.nextPageToken = '';
									}
									else if(typeof response.next_page_token != ''){
										$scope.nextPageToken 	 = response.next_page_token;
									}
									else{
										$scope.nextPageToken = '';
									}
									
									if($scope.venues.venueDetails.length){
										$scope.noRestaurants = $scope.venues.venueDetails.length;
									}
									else{
										$scope.noRestaurantText = 'There are no restaurants found..';
										$scope.noRestaurants = false;
										$scope.more = false;
									}
														
									$ionicLoading.hide();												
											
							}).error(function(data) {
									global.popup();
									$ionicLoading.hide();
							}).finally(function(){
									$scope.$broadcast('scroll.infiniteScrollComplete');
							});
							
			};
			global.loader();
			$scope.getVenues();
//******** gotoback
			$scope.gotoback = function(){
				$location.path("/app/availability");
			};
// ***********showDetails	
			$scope.showDetails = function(venue){
				global.loader();
		
			$http.post(config.apiUrl+'/getVenue', { 'venue_id' : venue.place_id, 'selected' : venue.selected, 'favourite' : venue.favourite}).   //temp code 
				success(function(response) {
							//console.log(response);
								if(response.status == 'success'){
									venues.venue = response.result;
									$location.path("/venuedetails");
								}
											
							}).error(function(data) {
									global.popup();
							}).finally(function(){
									$ionicLoading.hide();		
							});
				//venues.venue =  venue;
				//$location.path("/venuedetails");
			};
// ***********venueSelected
			$scope.venueSelected = function(){
				var count = 0;
				angular.forEach($scope.venues.venueDetails, function(venue, key) {						
					if(venue.selected === 'true'){
						count++;
					}							
				});
				if(count <= 0){
					global.popup('Please select at least one venue!');
					return;
				}
					
				global.loader();	
				/*### AJAX REQUEST #####*/
				$http.post(config.apiUrl+'/saveVenues', { 'venueDetails' : $scope.venues.venueDetails ,
						'availabilityId' : global.getTempVal('availabilityId'), 
						'memberId': config.userProfile.member_id  }).success(function(response) {
							if(response.status == 'ok'){
								global.popup(response.message);
							}
							$ionicLoading.hide();
							$location.path("/app/availability");
						}).error(function(data) {
							global.popup();
							$ionicLoading.hide();
						});
		  };
}]);