angular.module('starter.controllers')
.controller('venueDetailsCtrl',['$scope', 'global', 'config', '$http', '$ionicLoading', '$ionicPopup', '$location',  '$state', 'venues', '$ionicHistory','$stateParams' ,function($scope, global, config, $http, $ionicLoading, $ionicPopup, $location,  $state, venues, $ionicHistory,$stateParams) {
	
		
	
		$scope.imageNotAvail	 = 'img/no_image.png';
		$scope.venues 			= venues;
		$scope.venue 			 = venues.venue;
		$scope.apiKey			= 'AIzaSyCSB01UwvVbd63eV_scq-rOD4AEirD8z9Q';
		//console.log($scope.venue);	
		//global.loader();
		
		/*$http.post(config.apiUrl+'/getVenue', { 'venue_id' : $stateParams.vid}).   //temp code 
			success(function(response) {
							console.log(response);
								if(response.status == 'success'){
									$scope.venues.venue.details = response.result;
									$location.path("/venuedetails");
								}
											
							}).error(function(data) {
									global.popup();
							}).finally(function(){
									$ionicLoading.hide();		
							});*/
							
		/*angular.forEach(selectedVenues, function(venue, key) {
				if(venue.place_id == venues.details.place_id){
					$scope.venues.details.selected = 'true';
				}
			});*/	
		
							
		
		$scope.goBack = function(){
			$ionicHistory.goBack();
		};
}]);