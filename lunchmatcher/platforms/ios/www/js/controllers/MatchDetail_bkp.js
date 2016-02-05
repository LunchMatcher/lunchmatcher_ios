angular.module('starter.controllers')
.controller('matchdetailCtrl',['$scope','$stateParams', 'config', '$http', 'global', '$location', '$ionicModal',
function($scope,$stateParams, config, $http, global, $location, $ionicModal) {
	//alert(config.baseUrl+'/'+config.noVenuImage);
		$scope.imageNotAvail =  config.noImage;
		$scope.venuImageNotAvail =  config.noVenuImage;
		$scope.noImageLink 		=  config.noImageLink; 
		$scope.responseReceived = false;
		$scope.apiKey			= 'AIzaSyCSB01UwvVbd63eV_scq-rOD4AEirD8z9Q';
		$scope.matchedUser 		= {
					formatted_name  : '',
					headline		: '',
					location		: '',
					phone			: '',
					match_time_from : '',
					match_time_to   : '',
					picture_url		: config.noImage,				
			};
		$scope.$on('$stateChangeSuccess', function() {
					global.loader();
					$http({
							method: 'POST',
							url: config.apiUrl+'/getUserDetailForMatchProfile',
							dataType: 'json',
							data: {'member_id' : config.userProfile.member_id,  'user_id' : $stateParams.toid , 'logId' : $stateParams.logid}
						}).success(function(response) {			
									if(response.status == 'setavailability'){
										$location.path("/app/availability");	
									}
									else if(response.status == 'setreview'){
										$location.path("/app/profilereview/"+response.result.availability.schedule_id+"/"+response.result.availability.matches);
									}
									else if(response.status == 'success'){
											$scope.responseReceived = true;
											var result = response.result;
											$scope.message = response.message;
											$scope.matchedUser.formatted_name = result.matcherName ;
											$scope.matchedUser.headline = result.matcherHeadline ;
											$scope.matchedUser.location = result.matcherLocation;
											$scope.matchedUser.contact_number = result.matcherPhone ;
											$scope.matchedUser.picture_url = result.matcherPicture;
											$scope.matchedUser.company = result.matcherCompany;											
											$scope.matchedUser.venue = result.venue;
											$scope.matchedUser.match_time_from = result.match_time_from;
											$scope.matchedUser.match_time_to = result.match_time_to;
											$scope.iMgSrc  = $scope.matchedUser.venue.image?$scope.matchedUser.venue.image:
													($scope.matchedUser.venue.photo_reference != null ? 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference='+ $scope.matchedUser.venue.photo_reference+ '&key='+$scope.apiKey:$scope.noImageLink);
									}
									else{
										global.popup();
									}
								}).error(function(data) {
												 global.popup();
												 }).
								  finally(function(data){
												   global.hideloader();
								});
	  });
	$scope.dialPhone = function(number){
			window.open('tel:'+number, '_system');
		};
	
	 $ionicModal.fromTemplateUrl('image-modal.html', {
		  scope: $scope,
		  animation: 'slide-in-up'
		}).then(function(modal) {
		  $scope.modal = modal;
		});

    $scope.openModal = function() {
      $scope.modal.show();
    };

    $scope.closeModal = function() {
      $scope.modal.hide();
    };

    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });
    // Execute action on hide modal
    $scope.$on('modal.hide', function() {
      // Execute action
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function() {
      // Execute action
    });
    $scope.$on('modal.shown', function() {
      console.log('Modal is shown!');
    });

    $scope.showImage = function() {
		
         $scope.imageSrc = $scope.iMgSrc;
      $scope.openModal();
    }
}]);