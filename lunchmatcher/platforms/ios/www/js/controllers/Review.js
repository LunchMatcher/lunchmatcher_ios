angular.module('starter.controllers')
.controller('reviewCtrl',['$scope', 'global', 'config', '$stateParams', '$http' ,'matches','$location' , function($scope, global, config, $stateParams, $http ,matches,$location) {
		$scope.config = config;								   
		$scope.disableReview = true;
		$scope.showReview = true;
		$scope.noShowB1   = false;
		$scope.matchedUser 		= {
						formatted_name  : 'Name1',
						headline		: 'Headline1',
						location		: 'Location',
						match_time_from : '00:00',
						match_time_to   : '00:00',
						score			: 0
				};
		$scope.review = {
				 'given_user' : config.userProfile.member_id,
				 'scheduled_log_id' : $stateParams.logid,
				 'no_show'	: 'N',
				 'rating' : 3,
				 'feed_back'   : '',
				 'rating_val'   : 3,
				 'member_id'   : '',
				 'log_id'   : '',
				 'v_feed_back'   : '',
				 'v_rating_val'   : 3
		 };
		
		
			
	 	matches.getMatchReviewDetails($stateParams.logid,$stateParams.toid).success(function(response) {
					
				if(response.status == 'noshow'){					
					$scope.noShow = true;
					$scope.noReview = false;
					$scope.noShowMessage = response.result.message;
					$scope.review.feed_id = response.result.feed_id;
					$scope.review.member_id = response.result.member_id;
					$scope.review.log_id 	= response.result.log_id;
					$scope.review.rating_val = response.result.rating_val;
					$scope.review.feed_back 	= response.result.feed_back;
					$scope.review.no_show 	  = response.result.no_show?response.result.no_show:'N';
					$scope.disableReview = false;
					$scope.review.v_rating_val = response.result.v_rating_val;
					$scope.review.v_feed_back 	= response.result.v_feed_back;
					$scope.matchedUser 				= response.result;
					$scope.review.venue_id 			= response.result.venue_id;
					$scope.review.given_user 			= config.userProfile.member_id;
					//console.log($scope.matchedUser);
					//console.log($scope.review);
					
					
				}
				else if(response.status == 'ok')
				{
					$scope.noShow = false;
					$scope.noReview = true;
					$scope.review.feed_id = response.result.feed_id;
					$scope.review.member_id = response.result.member_id;
					$scope.review.log_id 	= response.result.log_id;
					$scope.review.rating_val = response.result.rating_val;
					$scope.review.feed_back 	= response.result.feed_back;
					$scope.review.no_show 	  = response.result.no_show?response.result.no_show:'N';
					$scope.disableReview = false;
					$scope.review.v_rating_val = response.result.v_rating_val;
					$scope.review.v_feed_back 	= response.result.v_feed_back;
					$scope.matchedUser 				= response.result;
					$scope.review.venue_id 			= response.result.venue_id;
					$scope.review.given_user 			= config.userProfile.member_id;
					
					if($scope.review.no_show == 'N')
					{
						$scope.showReview = true;
						$scope.noShowB1 = false; 
					}
					else if($scope.review.no_show == 'Y')
					{
						$scope.showReview = false;
						$scope.noShowB1 = true; 
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
		$scope.noShowUpdate = function(){	
					
			//$scope.review.no_show = $scope.review.no_show === 'N' ? 'Y' : 'N';
						
				if($scope.review.no_show == 'N'){					
										
					var confirm = global.confirm('Are you sure to update NO SHOW ?');
						confirm.then(function(res){
							if(res){
								$scope.showReview = false;	
								$scope.review.no_show = 'Y';
								$http.post(config.apiUrl+'/saveReview', { 'reviewInfo' : $scope.review}).
									success(function(response) { 
										if(response.status == 'noshow'){
											$scope.showReview = true;
											$scope.review.no_show = 'N';	
											global.popup(response.message);
										}
										else if(response.status == 'ok'){
											$scope.noShowB1 = true; 
											$scope.review.feed_id = response.feed_id;
											$location.path("/app/availability");		
										}
										
								});
							}
						});
				}
				
		
		};
			
		$scope.noFeedback = function(){
			global.popup("Since your matcher updated as NOSHOW, You cannot put any feedback.");
		};
		
		$scope.saveReview = function(){
				
				if($scope.review.rating_val == 0 ){
					global.popup('Please put your rating for user!');
				}
				else if($scope.review.feed_back == ''){
					global.popup('Please put your feedback for user!');
				}
				else if($scope.review.v_rating_val == 0 ){
					global.popup('Please put your rating for venue!');
				}
				else if($scope.review.v_feed_back == '' ){
					global.popup('Please put your feedback for venue!');
				}
				else{
					$http.post(config.apiUrl+'/saveReview', { 'reviewInfo' : $scope.review}).
									success(function(response) {
									$scope.review.feed_id = response.feed_id;		
						});
					$http.post(config.apiUrl+'/saveVenueReview', { 'reviewInfo' : $scope.review}).
									success(function(response) { 
								
						});
									
					global.popup('Your Feed back has been saved successfully!');
					$location.path("/app/availability");
				}
		};
		//######## Save rating...
		$scope.saveRating = function(rate) {
			$scope.review.rating_val = rate;
			angular.element('.userrate').removeClass('active')
			angular.forEach(angular.element('.userrate'), function(value, key){
				if(key <= rate-1){
					var a = angular.element(value);
					a.addClass('active');
				}
			});
			/*$http.post(config.apiUrl+'/saveReview', { 'reviewInfo' : $scope.review}).success(function(response) {
						$scope.review.feed_id = response.feed_id;		
				 });*/
			return;
		};
		$scope.saveVenueRating = function(rate) {
			$scope.review.v_rating_val = rate;
			//console.log($scope.review);
			
			angular.element('.venuerate').removeClass('active')
			angular.forEach(angular.element('.venuerate'), function(value, key){
				if(key <= rate-1){
					var a = angular.element(value);
					a.addClass('active');
				}
			});
			
			$http.post(config.apiUrl+'/saveVenueReview', { 'reviewInfo' : $scope.review}).
								success(function(response) { });
			return;
		};
		
	
		$scope.insertPoint = function(point_id,ref_id){
					if(!point_id) return false;
					$http.post(config.apiUrl+'/insertPointsForUser', {'userId' : config.userProfile.member_id, 'pointId' : point_id, 'ref_id' : ref_id }).
						success(function(response) {
							if(response.status == 'success'){
								console.log('Point Inserted');
							}
						});
				
		}
		
		$scope.share = function(share_type){		
						global.loader();	
						if(share_type == 'facebook'){
							$http.post(config.apiUrl+'/getShare', { 'ref_id' : $stateParams.logid, 'point_id': 9, 'member_id' : config.userProfile.member_id }).   //temp code 
								success(function(response) {
								if(response.status == 'success'){
									$scope.shareDesc 	= response.shareDesc	;
									$scope.shareURL 	 = response.shareURL	;
									window.plugins.socialsharing.shareViaFacebookWithPasteMessageHint($scope.shareDesc, null , $scope.shareURL ,'Click a long press to past your share content!'
									, function() {
										console.log('share ok');
										$scope.insertPoint(9,$stateParams.logid);
									}
									, function(errormsg){
										console.log('Please ensure you have installed facebbok')
									});
								}
								else{
									global.popup('Thank you, You have already shared today.');	
								}
										
						}).finally(function(){
							global.hideloader();
						});
			
									
						}
						if(share_type == 'twitter'){
							$http.post(config.apiUrl+'/getShare', { 'ref_id' : $stateParams.logid, 'point_id': 11, 'member_id' : config.userProfile.member_id}).   //temp code 
									success(function(response) {
									if(response.status == 'success'){
										$scope.shareDesc 	= response.shareDesc	;
										$scope.shareURL 	 = response.shareURL	;
										window.plugins.socialsharing.shareViaTwitter($scope.shareDesc, null , $scope.shareURL,
										function(msg) {	
										$scope.insertPoint(11,$stateParams.logid);							
										},				
										function(errormsg){						
											console.log('Please ensure you have installed Twitter');
										});
									}else{
										global.popup('Thank you, You have already shared today.');	
									}
											
							}).finally(function(){
								global.hideloader();
							});
									
						}
						if(share_type == 'linkedin'){
								$http.post(config.apiUrl+'/getShare', { 'ref_id' : $stateParams.logid, 'point_id': 12, 'member_id' : config.userProfile.member_id}).   //temp code 
									success(function(response) {
									if(response.status == 'success'){
										$scope.shareDesc 	= response.shareDesc	;
										$scope.shareURL 	 = response.shareURL	;
										window.plugins.socialsharing.shareVia('linkedin', $scope.shareDesc, null, null,$scope.shareURL, 
										 function(msg){
											console.log('share ok');
											$scope.insertPoint(12,$stateParams.logid);
										}, 
										 function(msg) {
											console.log('Please ensure you have installed LinkedIn.');	
										});
									}else{
										global.popup('Thank you, You have already shared today.');	
									}
											
							}).finally(function(){
								global.hideloader();
							});	
						}
	
			}	
}]);