angular.module('starter.controllers')
.controller('pointCtrl',['$scope', '$http','config', 'global', '$cordovaToast','$location' ,function($scope,$http, config, global, $cordovaToast,$location) {
		
  		$scope.points = {};
		$scope.imageNotAvail =  config.noImageSmall;
		$scope.NoPoints 		= "Fetching Points...";
		global.loader();
			
		$http.post(config.apiUrl+'/getPoints', { 'memberId' : config.userProfile.member_id }).
								success(function(response) {
									
												 if(response.status == 'ok')
												 	{
														$scope.points = response.result; 
														$scope.total_point = response.total_point; 
													}
													else
													{
														$scope.NoPoints = "Server Error..";
														$scope.total_point = 0;
													}
												 global.hideloader();		
									  }).
								  error(function(data) {
												 $scope.NoPoints = "Server Error..";
												 global.popup();
												 global.hideloader();
										});
		$scope.gotoPointsLis = function(){
			
			$location.path('/app/buypoints');
		}
		
		 $scope.go = function ( path ) {
				$location.path( path );
			  };
			  
		
			
}]);