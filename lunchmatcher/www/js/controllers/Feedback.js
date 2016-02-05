angular.module('starter.controllers')
.controller('feedbackCtrl',['$scope', '$ionicLoading','global','$http','config', function($scope, $ionicLoading, global, $http,config) {
  		
		$scope.feed = {'feed_textarea' :  ''};
			
			
		$scope.sendFeedback = function(){
			    if($scope.feed.feed_textarea == '' ){
					global.popup('Please put your feedback!');
					return;
				}
				else{
					$http.post(config.apiUrl+'/sendFeedback', {'member_id' : config.userProfile.member_id, 'feed' : $scope.feed}).
						success(function(response) { 
						console.log(response);
							if(response.status == 'success'){
								$scope.feed.feed_textarea = ''	
							}
							global.popup(response.message);
						});
				}
		};
		
		
}]);