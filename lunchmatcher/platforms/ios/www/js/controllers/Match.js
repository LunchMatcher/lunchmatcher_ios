angular.module('starter.controllers')
.controller('matchCtrl', ['$scope', '$timeout', '$stateParams', '$http', '$ionicLoading', 'global', 'config', '$ionicPopup', 'matches', '$http', '$location', '$q','$ionicViewService',function($scope, $timeout, $stateParams, $http, $ionicLoading, global, config, $ionicPopup, matches, $http, 
$location, $q,$ionicViewService) {
	

			$ionicViewService.nextViewOptions({
									 disableBack: true
								  });
			$scope.responseReceived = false;
			$scope.init = function(){
					$scope.matchAccepted 		= false;
					$scope.matchExpired 		= false;
					$scope.otherUserRejected 	= false;
					$scope.matchRejected 		= false;
					$scope.showwaitingForResponse = false;
					//if($stateParams.status == 'accepted')
					if($stateParams.status == 'rejected')
					{
						$scope.otherUserRejected = true;
					}
					if(global.getTempVal('status')  == 'accepted')
					{				
						$scope.matchAccepted 		  = true;
						$scope.showwaitingForResponse = true; 
					}
					if(global.getTempVal('status')  == 'currentUserRejected')
					{
						$scope.matchRejected = true;
					}
				};
			$scope.init();
			$scope.imageNotAvail 	= 'img/no_image.png';
			$scope.matchedUser 		= {
						formatted_name  : '',
						headline		: '',
						location		: '',
						match_time_from : '',
						match_time_to   : '',
						score			: 0,
						picture_url		: config.noImage,
						remaining_time	: 15,
				};
				
			
				//global.loader();
				
				$http({
						method: 'POST',
						url: config.apiUrl+'/getMatchDetails',
						data: { 'logId' : $stateParams.logid , 'tomatchLogId'  : $stateParams.toid , 'userId'  : config.userProfile.member_id  }
				}).success(function(response) {
						
					    $scope.responseReceived = true;
					    if(response.status == 'ok'){
							response.result.formatted_name  = global.toTitleCase(response.result.formatted_name);
							response.result.headline 		= global.toTitleCase(response.result.headline);
							response.result.score			= Math.round( response.result.score );
							$scope.matchedUser 				= response.result;					
							var mytimeout 					= $timeout($scope.onTimeout,20000);
							
						}
						else{
							global.popup(response.message);
							$location.path("/app/availability");
						}
						
					
				}).error(function(data) {
					global.popup();
				}).finally(function(){
						global.hideloader();
				});
					
										
				
				
				
// ***************************************** Function Declarations ***************************************/	

// ***********onTimeout			
		$scope.onTimeout = function(){
			$http.post(config.apiUrl+'/getMatchRemainingTime', { 'tempLog' : $stateParams.logid }).success(function(response) {
					$scope.matchedUser.remaining_time = response.result;
					
					if(response.result <= 0)										
						$scope.matchExpired = true;										
					else
						mytimeout = $timeout($scope.onTimeout,20000);
			});
		};		
// ***********matchAcceptedFn	
		$scope.matchAcceptedFn = function(){
			global.loader();
			
			$http({
				method: 'POST',
				url: config.apiUrl+'/matchAccepted',
				data: { 'logId' : $stateParams.logid , 'tomatchLogId'  : $stateParams.toid  , 'fromUserId'  : config.userProfile.member_id},
				headers: {'Content-Type': 'application/x-www-form-urlencoded'}
			}).success(function(response) {
				global.hideloader();
				if(response.status == 'expired'){
					global.popup(response.message);
				}
				if(response.status == 'ok'){
					$scope.matchedUser.my_status = 'Y';
					//global.scrollTop();
					//$location.path("home");
				}
				else if (response.status == 'error'){
					global.popup();
				}
				global.hideloader();														 
			}) //<-- damn ")"
			.error(function(data) {
				global.popup();
			})  //<-- damn ")"	
		};
// ***********matchRejectedFn
		$scope.matchRejectedFn = function(){
			var confirm = global.confirm('Are you sure ?');
			confirm.then(function(res){
					if(res){
						global.loader();
						$http({
							method: 'POST',
							url: config.apiUrl+'/matchRejected',
							data: {'userId'  : config.userProfile.member_id , 'logId' : $stateParams.logid , 'tomatchLogId'  : $stateParams.toid }
						}).success(function(response) {
							
							if(response.status == 'ok'){
								$location.path("/app/scorepoints");
							}
							else if(response.status == 'expired'){
								global.popup(response.message);
							}
							else if(response.status == 'cannotset'){
								global.popup(response.message);
							}
							else{
								global.popup();
							}
							global.hideloader();														 
					    }).error(function(data) {
							global.popup();
							global.hideloader();
						});										
					}
			});
		};
// ***********dialPhone
		$scope.dialPhone = function(number){
			window.open('tel:'+number, '_system');
		};	
}])


.controller('nomatchCtrl', ['$scope', '$timeout', '$stateParams', '$http', '$ionicLoading', 'global', 'config', '$ionicPopup', 'matches', '$http', '$location', '$q','$ionicViewService',function($scope, $timeout, $stateParams, $http, $ionicLoading, global, config, $ionicPopup, matches, $http, 
$location, $q,$ionicViewService) {
	
					$http.post(config.apiUrl+'/noMatches', { 'userId'  : config.userProfile.member_id }).success(function(response) {
							return true;												 
					    }).error(function(data) {
							global.popup();
							global.hideloader();
						});	
						
			$scope.goToAvailityPage = function(){
				$location.path("/app/availability");
			};
	}]);