angular.module('starter.controllers')
.controller('LoginCtrl',['$scope', '$ionicPopup', '$cordovaOauth', '$http','config', '$location', '$ionicLoading', 'global','$cordovaDatePicker','$ionicViewService', function($scope, $ionicPopup, $cordovaOauth, $http, config, $location, $ionicLoading, global,$cordovaDatePicker,$ionicViewService) {
 		$ionicViewService.nextViewOptions({
									 disableBack: true
		});
		$scope.showmenuButton = true;			
		$scope.genders = [{value: '', name: ''},{value: 'Male', name: 'Male'},{value: 'Female', name: 'Female'}];
		$scope.excgenders = [{value: 'None', name: 'None'},{value: 'Male', name: 'Male'},{value: 'Female', name: 'Female'}];
		$scope.user = {email:'', gender: '', phoneNumber : '', excludePreviousMatches : 'N' , get_notification: '1' , notificationTime: '09:30 AM'};
		$scope.showNotficTime = true;
		$scope.field_required = false;
		
						
						
		if(config.userProfile.member_id){			
			global.loader();
			$http.post(config.apiUrl+'/getPreferences', {'member_id' : config.userProfile.member_id } ).success(function(response) {
				//console.log(response);	
				//console.log('=====');						
				if(response.status == 'ok'){
					response = response.result;
					$scope.user.gender 		= response.gender;
					$scope.user.email 		= response.email;
					$scope.user.phoneNumber   = response.contact_number;
					$scope.user.excludeGender = response.gender_exclude;
					$scope.user.excludePreviousMatches = response.exclude_pre_match;
					$scope.user.notificationTime	= response.notification_time;	
					$scope.user.get_notification 	= response.get_notification;														
					$scope.savedCompanies 	  = response.companies;
					$scope.field_required 	  = response.field_required;
					
					if($scope.user.get_notification == 1 || $scope.user.get_notification == '1')
						$scope.showNotficTime = true;
										
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
		
		$scope.more = true;
		$scope.searchKey = '';
		$scope.companies = [{}];
		$scope.companyTemp = [{}];
		$scope.page = 10;			  
  		$scope.url		='https://api.linkedin.com/v1/people/~:(id,first-name,last-name,maiden-name,formatted-name,site-standard-profile-request,industry,picture-url,picture-urls::(original),email-address,location:(name),headline,positions)?oauth2_access_token=' ;
		//email-address,location:(name),

		var today = new Date();
		var year = today.getYear();
		var month = today.getMonth();
		var day = today.getDay();
		var hour = '09';
		var min = '00';
		var defaulttime = new Date(year,month,day,hour,min);
			angular.element(document).ready(function () {
				// Select demo initialization
                $('#selction').mobiscroll().select({
                    theme: 'mobiscroll',     // Specify theme like: theme: 'ios' or omit setting to use default 
                    mode: 'scroller',  // Specify scroller mode like: mode: 'mixed' or omit setting to use default 
                    display: 'bottom' // Specify display mode like: display: 'bottom' or omit setting to use default 
                    
                });
				
				$('#notificationTime').mobiscroll().time({
                    theme: 'android-holo',
                    mode: 'scroller', 
                    display: 'bottom',
					stepMinute: 30,
					defaultValue: defaulttime ,
					timeWheels: 'HHii'
					/*invalid: [
						 { start: '12:01', end: '23:59' },	  
						 { start: '00:00', end: '05:59' }, // Every day   						
					]*/
                });
			});
		$scope.showValidationMessages = false;
		
// ***************************************** Function Declarations ***************************************/			  
			$scope.$on('$stateChangeSuccess', function() {
				$scope.showmenuButton = true;		
				var lmUserProfileJson = localStorage.getItem("lmUserProfile");
				if(lmUserProfileJson){
					var lmUserProfile 	= JSON.parse(lmUserProfileJson);						
					if( !lmUserProfile.contact_number){					
						$scope.showmenuButton = false;
					}
				}							
									
			});
			/*$scope.$on('$stateChangeSuccess', function() {
				if(typeof config.userProfile.preferences != 'undefined' && config.userProfile.preferences.companies != 'undefined'){
					if(typeof $scope.savedCompanies == 'undefined'){
						$scope.savedCompanies = config.userProfile.preferences.companies;
						console.log($scope.savedCompanies);
						console.log("3333333333333");
					}
					else if(typeof config.userProfile.preferences.companies == 'undefined'){
		console.log("22222222222");
					}
					else{	
					
						$scope.savedCompanies = $scope.savedCompanies.concat(config.userProfile.preferences.companies);
						console.log("1111111111");
						console.log($scope.savedCompanies);
					}		
					$scope.savedCompanies = $scope.arrUnique($scope.savedCompanies);		
				}	
			});*/
			$scope.toggleTime = function(){
				if($scope.user.get_notification == 1 || $scope.user.get_notification == '1')
					$scope.showNotficTime = true;
				else
					$scope.showNotficTime = false;
						
			};
// ***********searchCompany		
		    $scope.searchCompany = function(searchKey){
			  global.addTemp('searchKey',searchKey);
			  $location.path("/companies");
		    };
// ***********removeCompany	
  			$scope.removeCompany = function (id){	 
	 			var popup = global.confirm('Delete the selected company ?');	
	 			popup.then(function(res) {
			 		if(res) {  
						$http.post(config.apiUrl+'/deleteCompany', {'member_id':config.userProfile.member_id, 'company_id' : id})
						.success(function(response) {							
								angular.forEach($scope.savedCompanies, function(result,index) {
									if(result['id'] == id) {
										$scope.savedCompanies.splice(index, 1);
									}   					
								});													
						}).error(function(data) {
								global.popup('Company not removed. Please try again.');
																	
						}).finally(function () {
								$ionicLoading.hide();
								
						});
						   
										
			 		}
  	 			});
	 		};
// ***********doLogin	
 	 		$scope.doLogin = function(){
				var ldinClientId 	= config.ldinClientId;
				var ldinSecret 		= config.ldinSecret;
				var ldinScope 		= config.ldinScope;
				var ldinState 		= config.ldinState;
				var accessToken 	= config.accessToken;
				var requestURI 	 = 'http://www.lunchmatcher.com/callback.php';
			  	$cordovaOauth.linkedin(ldinClientId, ldinSecret, ldinScope, ldinState,requestURI).then(function(result) {
					accessToken 		= result.access_token;
					config.accessToken = accessToken;
					expiresIn 		  = result.expires_in;
					if(typeof(Storage) !== "undefined") {
						localStorage.setItem("lmAccessToken", accessToken);
					}
					
					$scope.getProfile(accessToken);
					
				}, function(error) {
					
					global.popup("Could not connect LinkedIn. Please try later.!");
				});
	  		};
// ***********arrUnique	
			$scope.arrUnique = function(origArr) {
				var newArr = [],found;
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
			};
// ***********updateProfile
			$scope.updateProfile  = function (){		
		   		
					url = $scope.url;
					url = url+config.userProfile.access_token+'&format=json';
					global.loader();
					
					$http.get(url).success(function(userProfile, status, headers, conf) {
						console.log(userProfile);
						if(userProfile.pictureUrls._total > 0)
							userProfile.pictureUrl = userProfile.pictureUrls.values[0];
						if(userProfile.siteStandardProfileRequest)
							userProfile.profile_url = userProfile.siteStandardProfileRequest.url;
						
						$http.post(config.apiUrl+'/updateProfile', {'member_id':config.userProfile.member_id, 'userProfile' : userProfile})
							.success(function(response) {							
								if(response.status == 'ok'){
									global.popup(response.message);
								}														
						}).error(function(data) {
								global.popup();
																	
						}).finally(function () {
								global.hideloader();
						});
				
					}).error(function(userProfile, status, headers, conf) {
							if(status == 401 ){
								global.popup('Your linkedIn session has expired. Please login to linkedIn.');
								$scope.doLogin();
							}
							else{
								global.popup('Unauthorised access to linkedin. Please try later');
							}
							global.hideloader();										
					});
						 
	  		};
// ***********regComplete
			$scope.regComplete  = function (form){		
		   		if(form.$valid){
					global.loader();
					$scope.user.notificationTime	= $('#notificationTime').val();
					config.userProfile.preferences 	= $scope.user;
					$scope.user.member_id			= config.userProfile.member_id;
					if($scope.user.excludeGender == null)
							$scope.user.excludeGender = 'N';
					if($scope.user.excludePreviousMatches == null)
							$scope.user.excludePreviousMatches = 'None';
					url = $scope.url;
					
					url = url+config.userProfile.access_token+'&format=json';
					global.loader();
					
					$http.get(url).success(function(userProfile, status, headers, conf) {
					console.log(userProfile);
						if(userProfile.pictureUrls._total > 0)
							userProfile.pictureUrl = userProfile.pictureUrls.values[0];
						if(userProfile.siteStandardProfileRequest)
							userProfile.profile_url = userProfile.siteStandardProfileRequest.url;
						
						$http.post(config.apiUrl+'/savePreferences', { 'preferenceData' : $scope.user, 'companiesData' :  $scope.savedCompanies , 'userProfile' : userProfile}).success(function(response) {
							
								if(response.status == 'ok'){
									lmUserProfile = JSON.parse(localStorage.getItem("lmUserProfile"));
									lmUserProfile.contact_number  = $scope.user.phoneNumber;
									lmUserProfile.gender  = $scope.user.gender;
									localStorage.setItem("lmUserProfile", JSON.stringify(lmUserProfile));
									$location.path("/app/availability");
								}														
						}).error(function(data) {
								global.popup();
																	
						}).finally(function () {
								global.hideloader();
						});
				
					}).error(function(userProfile, status, headers, conf) {
							if(status == 401 ){
								global.popup('Your linkedIn session has expired. Please login to linkedIn.');
								$scope.doLogin();
							}
							else{
								global.popup('Unauthorised access to linkedin. Please try later');
							}
																	
					});
				}
				else{
					$scope.showValidationMessages = true;	
				}		 
	  		};
// ***********getProfile
			$scope.getProfile = function(accessToken){
	 				url = $scope.url;
					url += accessToken+'&format=json';
					global.loader();
					$http.get(url).success(function(userProfile, status, headers, conf) {
						
						if(userProfile.pictureUrls._totals > 0)
							userProfile.pictureUrl = userProfile.pictureUrls.values[0];
						if(userProfile.siteStandardProfileRequest)
							userProfile.profile_url = userProfile.siteStandardProfileRequest.url;
							
						userProfile.accesToken 	= accessToken;
						userProfile.deviceToken =  localStorage.getItem('deviceToken');
						userProfile.devicePlatform =  localStorage.getItem('devicePlatform');
						userProfile.deviceId 	= localStorage.getItem("deviceId");
						
							$http.post(config.apiUrl+'/saveProfile', { 'profileData' : userProfile }).success(function(response) {
								
								if(response.status == 'ok'){
									if(response.result.is_block == 'Y'){
										global.popup('Sorry! Your Account Is Blocked!');
										$location.path("/login");
									}
									else{
										config.userProfile = response.result;
										localStorage.setItem("lmUserProfile", JSON.stringify(response.result));
										if(response.message == 'User Exists'){																	
											$location.path("/app/availability");
										}
										else{
											$location.path("/app/registration");
										}
									}															   
								}														
								$ionicLoading.hide();
							}).error(function(data) {
								global.popup("You profile informations not saved!. Please try again.");
								localStorage.removeItem("lmUserProfile");
								$ionicLoading.hide();
							});
					  					  									
					  }).error(function(data, status, headers, conf) {
								global.popup('Authentication failed ! Please login again !');								
								localStorage.removeItem("lmUserProfile");
								$scope.doLogin();
								$ionicLoading.hide();
					  });
	  };
	  
	
}]);