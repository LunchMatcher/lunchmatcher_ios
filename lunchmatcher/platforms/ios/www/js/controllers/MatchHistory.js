angular.module('starter.controllers')
.controller('matchHistoryCtrl', ['$scope', 'global', 'config', '$http' , function($scope, global, config, $http) {
		$scope.matchHistory 	= {};
		$scope.imageNotAvail 	= 'img/no_image.png';
		$scope.NoMatchtext 		= "Fetching Match History...";
		global.loader();
		$http.post(config.apiUrl+'/getMatchHistory', { 'memberId' : config.userProfile.member_id }).
								success(function(response) {
											console.log("-------");
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
}]);