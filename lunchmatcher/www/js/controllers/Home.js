angular.module('starter.controllers',['ionic'])
.controller('HomeCtrl', ['$scope', '$http', 'config', '$location', '$ionicPopup',  '$ionicLoading', 'global', '$ionicViewService','availability','$cordovaDevice' , function($scope, $http, config, $location, $ionicPopup, $ionicLoading, global, $ionicViewService, availability, $cordovaDevice){
								 $ionicViewService.nextViewOptions({
									 disableBack: true
								  });
								  
								  
								// global.loader();
								
								  //$scope.lmUserProfile = localStorage.getItem("lmUserProfile");
								  //userProfile = JSON.parse($scope.lmUserProfile);
								  
								  //Device ready ###################
									
								  document.addEventListener("deviceready", function () {
									  
										
										deviceDetails = {};
										deviceDetails.device_token 	= localStorage.getItem("deviceToken");
										deviceDetails.device_platform = localStorage.getItem("devicePlatform");										
										deviceDetails.device_id	   = $cordovaDevice.getUUID();	//$cordovaDevice.getUUID();										
										localStorage.setItem("deviceId",deviceDetails.device_id);
												
											//var d = new Date();
											//var n = d.getTime();
											
											
										$http({
											method: 'POST',
											url: config.apiUrl+'/getProfile/',
											dataType: 'json',
											data: { 'deviceDetails' : deviceDetails}
										}).success(function(response) {
												
													global.hideloader();
													
													if(response.result){
														config.userProfile = response.result;
													}
													localStorage.setItem("lmUserProfile", JSON.stringify(response.result));
													if(localStorage.getItem("pushreceived")){
														var pushrecieved = localStorage.getItem("pushreceived");
														localStorage.removeItem("pushreceived");
														
														$location.path(pushrecieved);
														return false;
													}
													else{
														
														if(response.status == 'nouser'){
															
															if(localStorage.getItem("first_user")!=0)
															{
																$location.path("/inital_tutorial");
															}
															else{
																
																$location.path("/login");
															}
														}
														else if(response.status == 'trashed' || response.status == 'blocked'){
															global.popup(response.message);
															$location.path("/login");
														}
														else if(response.status == 'nocontact'){
															$location.path("/app/registration");
														}
														else if(response.status == 'setavailability'){
															
															$location.path("/app/availability");	
														}
														else if(response.status == 'nomatches'){
											
															global.popup(response.message);
															$location.path("/app/availability");	
														}
														else if(response.status == 'matchprofile'){
															
															$location.path("/app/matchprofile/"+response.result.tempLog.log_id+"/"+response.result.tempLog.matchuser_id);
														}
														else if(response.status == 'viewmatch'){
															
															global.addTemp('availabilityInfo',response.result.availability);																			
															$location.path("/app/matchdetail/"+response.result.availability.schedule_id+"/"+response.result.availability.matches);
														}
														else if(response.status == 'setreview'){
															
															$location.path("/app/profilereview/"+response.result.availability.schedule_id+"/"+response.result.availability.matches);
														}
														else{
															
															$location.path("/app/availability");	
														}
													}
											
									
										}).error(function(data) {
											global.popup();
											$location.path("/login");
											global.hideloader();
										});

											
								}, false);																											
						}]);