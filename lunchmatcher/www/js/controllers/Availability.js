angular.module('starter.controllers')
.controller('AvailabilityCtrl',['$scope', '$ionicLoading', '$compile', '$http', 'config', 'global', '$ionicPopup', '$ionicScrollDelegate', '$location' ,'availability' ,'$q','$state','$rootScope', function($scope, $ionicLoading, $compile, $http, config, global, $ionicPopup, $ionicScrollDelegate, 
$location,availability,$q,$state,$rootScope) {
			//global.loader();
				 
			$scope.myFirstDeferred = $q.defer();
			$scope.circle 	= '';
			$scope.map 		= '';
			$scope.marker 	= '';
			$scope.time_zone_api_key = 'AIzaSyBq6JqQbFI3vSLrcCAY4dzvYeRhvCCp4J0';
			$scope.disableAvailability = false;
			$scope.timeSlotRestrictStartFrom = false;			
			$scope.userAvailability =  {
								match_radius 	: 0.5,
								match_time_from : '',
								match_time_to	: '',
								match_latitude	: '',
								match_longitude	: '',
								member_id		: config.userProfile.member_id,
								created_time	: '',
								availableToday	: false,
								location		: '',
			};
			if(config.userProfile.prev_lat == '' || config.userProfile.prev_lon == '' || typeof config.userProfile.prev_lat == undefined || typeof config.userProfile.prev_lon ==undefined || config.userProfile.prev_lat == null || config.userProfile.prev_lon == null){
					$scope.userAvailability.match_latitude 	= '25.2048';
					$scope.userAvailability.match_longitude = '55.2708';					
			}
			else{
					$scope.userAvailability.match_latitude = config.userProfile.prev_lat;
					$scope.userAvailability.match_longitude = config.userProfile.prev_lon;
			}					
			$scope.disable 	= {disableFields : true};
			$scope.timeRange  = {match_time_from : 0.00,match_time_to 	: 1.00 };				
			$scope.time 	   = {"0.00" : "11:00:00","0.50" : "11:30:00","1.00" : "12:00:00","1.50" : "12:30:00","2.00" : "13:00:00",
							     "2.50" : "13:30:00","3.00" : "14:00:00","11:00:00" : "0.00","11:30:00" : "0.50","12:00:00" : "1.00",
							     "12:30:00" : "1.50","13:00:00" : "2.00","13:30:00" : "2.50","14:00:00" : "3.00"};
			$scope.time12     = {"0.00" : "11:00 AM","0.50" : "11:30 AM","1.00" : "12:00 PM","1.50" : "12:30 PM","2.00" : "01:00 PM",
								 "2.50" : "01:30 PM","3.00" : "02:00 PM"};
			
			
			//Default loading for get previous availability
			global.loader();	
			//console.log(config.userProfile.member_id);		
			$http.post(config.apiUrl+'/getAvailability', { 'userId' : config.userProfile.member_id }).   //temp code 
				success(function(response) {
					
					global.hideloader();
					if(response.status == 'ok' && response.result.match_logid!= null){	
							if(response.nomatch){
								global.popup(response.message);
							}
							$scope.availabilityInit();
							
							result = response.result;
							if(result.is_previous)
								$scope.userAvailability.availableToday = false;
							else
								$scope.userAvailability.availableToday = true;
								
							$scope.disable.disableFields = false;
							$scope.userAvailability.match_radius = result.match_radius;
							$scope.userAvailability.old_radius = result.match_radius;
							$scope.userAvailability.old_location = result.location;
							$scope.userAvailability.prev_availid = response.prev_availid;
							$scope.userAvailability.match_latitude  = result.match_latitude;
							$scope.userAvailability.match_longitude = result.match_longitude;
							var myFirstPromise = $scope.myFirstDeferred.promise;
																		
							myFirstPromise.then(function(data){
								$scope.codeLatLng(result.match_latitude,result.match_longitude);
							});																		
							
							var latlng = new google.maps.LatLng(result.match_latitude, result.match_longitude);
							$scope.map.setCenter(latlng);																		
    						$scope.marker.setPosition(latlng);
							var from_time = result.match_time_from.split(" ");
							var to_time = result.match_time_to.split(" ");
							$scope.timeRange.match_time_from =  $scope.time[from_time[1]];																		
							$scope.timeRange.match_time_to = $scope.time[to_time[1]];
																		
							$scope.map.setOptions({draggable: true});
							$scope.marker.setOptions({draggable: true});																	
							radius = Number(result.match_radius) * 1000;
							$scope.circle.set('radius', parseInt(radius, 10) );		
					}
					else{
							response = result.result;																 		
					}
																   
					$scope.time = JSON.parse(result.time_range);
						
				}).error(function(response){
					global.popup();
					return;															 
			});
// ***********availabilityInit
			$scope.availabilityInit = function (){
					
					//$scope.fetchavailability();
				
					var latitude = $scope.userAvailability.match_latitude , longitude = $scope.userAvailability.match_longitude;
					var latLong = new google.maps.LatLng(latitude, longitude);
					var geocoder= new google.maps.Geocoder();
					var myStyles =[ {
									   featureType: "poi",
									   stylers: [{ visibility: "off" } ]
								    }];
					
					var mapOptions = {center: latLong,
										zoom: 11,
										mapTypeId: google.maps.MapTypeId.ROADMAP,
										mapTypeControl:false,
   										panControl:false,
										draggable : false,
										styles: myStyles,
					 					streetViewControl: false 
									};								
					var map = new google.maps.Map(document.getElementById("map"), mapOptions);	
					
					
					
					
					//######## popuphide ######
					
					$scope.map = map;
					$scope.codeLatLng (latitude,longitude);
					
					var input = document.getElementById('search');
					var marker = new google.maps.Marker({
							position: latLong,
							map: map,
							draggable:false,
						});
					$scope.marker = marker;	
					$scope.circle = new google.maps.Circle({
						strokeColor: "#FF0000",
						strokeOpacity: 0.8,
						strokeWeight: 2,
						fillColor: "#FF0000",
						fillOpacity: 0.35,
						map: map,
						radius: 500
					  });
							
					$scope.circle.bindTo('center', marker, 'position');			
					var idleListener = google.maps.event.addListenerOnce(map, 'idle', function(){
						$ionicLoading.hide();
						google.maps.event.trigger($scope.map, 'resize');
						google.maps.event.removeListener(idleListener);
					});
					
					
					google.maps.event.addListener(marker, 'dragend', function(evt){
							$scope.userAvailability.match_longitude = evt.latLng.lng().toFixed(3);
							$scope.userAvailability.match_latitude  = evt.latLng.lat().toFixed(3);							
							$scope.codeLatLng(evt.latLng.lat().toFixed(3),evt.latLng.lng().toFixed(3));
					});
					
					
			
					
					$scope.$on('g-places-autocomplete:select', function (event, place) {
									$scope.marker.setVisible(false);
									//var place = autocomplete.getPlace();
									if (!place.geometry) {
									  return;
									}
									$scope.marker.setPosition(place.geometry.location);
									$scope.marker.setVisible(true);
									
									$scope.userAvailability.match_latitude  = place.geometry.location.lat();
									$scope.userAvailability.match_longitude = place.geometry.location.lng();
									var address = '';									
									if (place.address_components) {
									  address = [
										(place.address_components[0] && place.address_components[0].short_name || ''),
										(place.address_components[1] && place.address_components[1].short_name || ''),
										(place.address_components[2] && place.address_components[2].short_name || '')
									  ].join(' ');
									  
									  $scope.userAvailability.location = address;
									}
									$scope.codeLatLng($scope.userAvailability.match_latitude,$scope.userAvailability.match_longitude);
									$scope.map.setCenter($scope.marker.getPosition());
									if ($scope.map.getZoom() > 16) $scope.map.setZoom(16); 
					});
										
			};	
// ***********fetchavailability								
			$scope.fetchavailability = function (){
				//### AJAX REQUEST #####//
				$http.post(config.apiUrl+'/getAvailability', { 'userId' : config.userProfile.member_id }).
					success(function(response) {
						//console.log(response); 
						if(response.status == 'ok' && response.result.match_logid!= null){	
							response = response.result;
							$scope.userAvailability.availableToday = true;
							$scope.disable.disableFields = false;
							$scope.userAvailability.match_radius = response.match_radius;
							$scope.userAvailability.match_latitude  = response.match_latitude;
							$scope.userAvailability.match_longitude = response.match_longitude;
							var myFirstPromise = $scope.myFirstDeferred.promise;
																		
							myFirstPromise.then(function(data){
								$scope.codeLatLng(response.match_latitude,response.match_longitude);
							});																		
							
							var latlng = new google.maps.LatLng(response.match_latitude, response.match_longitude);
							$scope.map.setCenter(latlng);																		
    						$scope.marker.setPosition(latlng);
							var from_time = response.match_time_from.split(" ");
							var to_time = response.match_time_to.split(" ");
							$scope.timeRange.match_time_from =  $scope.time[from_time[1]];																		
							$scope.timeRange.match_time_to = $scope.time[to_time[1]];
							
							
							/*if (response.temp_matches != 0 && response.temp_matches != null){
								global.addTemp('from','avail');
								availability.getLogDetailsFromTemp(response.match_logid);
							}*/
																		
							$scope.map.setOptions({draggable: true});
							$scope.marker.setOptions({draggable: true});																	
							radius = Number(response.match_radius) * 1000;
							$scope.circle.set('radius', parseInt(radius, 10) );																		
						}
						else{
							response = response.result;																 		
						}
																   
						$scope.time = JSON.parse(response.time_range);	
																  																	
					}).error(function(data) {
						global.popup();
					});		
					
			};	
			
	
// ***********viewVenuesList
			$scope.viewVenuesList = function(){
					
					if($scope.disableAvailability){											
						global.popup($scope.reason);
						return;
					}
					if(!$scope.userAvailability.availableToday){
						global.popup('Please enable Available for next lunch slot button!');
						return;
					}
										
					var date = $scope.getToday();
					$scope.userAvailability.match_time_from  = $scope.time[$scope.timeRange.match_time_from];
					$scope.userAvailability.match_time_to 	= $scope.time[$scope.timeRange.match_time_to];
					var time = $scope.getNow();
					var latlon = $scope.userAvailability.match_latitude+','+$scope.userAvailability.match_longitude;;						
					global.loader();
					var promise = $http.get('https://maps.googleapis.com/maps/api/timezone/json?location='+latlon+'&timestamp=1331161200&key='+$scope.time_zone_api_key);
					
					promise.success(function(response){
						
					$scope.userAvailability.timezone = response.timeZoneId;
					$scope.userAvailability.copy_previous	= 'no';								
								
					$http.post(config.apiUrl+'/saveAvailability', {'AvailabilityData' : $scope.userAvailability }).success(function(response) {
									
										$ionicLoading.hide();
										 if(typeof response.selected_venues != 'undefined'){
											global.addTemp('selectedVenues',response.selected_venues);
										}
																
										if(response.status == 'ok'){
											var availabilityInfo = {};
											availabilityInfo	= $scope.userAvailability;
											global.addTemp('availabilityInfo',availabilityInfo);
											global.addTemp('availabilityId',response.result);
											$location.path("/app/venues");
										}
										else if ( response.status == 'completed' ){
											global.popup(response.message);
										}
										else if ( response.status == 'cannotset' ){
											global.popup(response.message);
										}
										else{ 
											var availabilityInfo = {};
											availabilityInfo	= $scope.userAvailability;
											global.addTemp('availabilityInfo',availabilityInfo);
											global.addTemp('availabilityId',response.result);
											$location.path("/app/venues");
										}
							}).error(function(data) {
								global.popup();
								$ionicLoading.hide();
							});	
					
						
					
					
					
					});
					
					promise.error(function(response){
							global.popup();
							$ionicLoading.hide();
					});	
			};	
// ***********saveAvailability
			$scope.saveAvailability = function(){
					
					if($scope.disableAvailability){											
						global.popup($scope.reason);
						return;
					}
					if(!$scope.userAvailability.availableToday){
						global.popup('Please enable Available for next lunch slot button!');
						return;
					}
										
					var date = $scope.getToday();
					
					$scope.userAvailability.match_time_from  = $scope.time[$scope.timeRange.match_time_from];
					$scope.userAvailability.match_time_to 	= $scope.time[$scope.timeRange.match_time_to];
					
					var time = $scope.getNow();
					var latlon = $scope.userAvailability.match_latitude+','+$scope.userAvailability.match_longitude;;						
					global.loader();
					var promise = $http.get('https://maps.googleapis.com/maps/api/timezone/json?location='+latlon+'&timestamp=1331161200&key='+$scope.time_zone_api_key);
					
					promise.success(function(response){
					$scope.userAvailability.timezone = response.timeZoneId;
					
					if( ( $scope.userAvailability.old_location == $scope.userAvailability.location  &&
						$scope.userAvailability.old_radius == $scope.userAvailability.match_radius )
								&& $scope.userAvailability.prev_availid){
								$scope.userAvailability.copy_previous	= 'yes';
					}
					else{
								$scope.userAvailability.copy_previous	= 'no';
					}
							
								
					$http.post(config.apiUrl+'/saveAvailability', {'AvailabilityData' : $scope.userAvailability }).success(function(response) {
									
										$ionicLoading.hide();
										 if(typeof response.selected_venues != 'undefined'){
											global.addTemp('selectedVenues',response.selected_venues);
										}
											
										if(response.status == 'ok' && $scope.userAvailability.copy_previous	== 'no'){
											var availabilityInfo = {};
											availabilityInfo	= $scope.userAvailability;
											global.addTemp('availabilityInfo',availabilityInfo);
											global.addTemp('availabilityId',response.result);
											$location.path("/app/venues");
										}
										else if(response.status == 'ok' && $scope.userAvailability.copy_previous	== 'yes'){
											global.popup(response.message);
										}
										else if ( response.status == 'addvenues' ){
											var availabilityInfo = {};
											availabilityInfo	= $scope.userAvailability;
											global.addTemp('availabilityInfo',availabilityInfo);
											global.addTemp('availabilityId',response.result);
											$location.path("/app/venues");
										}	
										else if ( response.status == 'completed' ){
											global.popup(response.message);
										}
										else if ( response.status == 'cannotset' ){
											global.popup(response.message);
										}
										else{ 
											var availabilityInfo = {};
											availabilityInfo	= $scope.userAvailability;
											global.addTemp('availabilityInfo',availabilityInfo);
											global.addTemp('availabilityId',response.result);
											$location.path("/app/venues");
										}
							}).error(function(data) {
								global.popup();
								$ionicLoading.hide();
							});	
					
						
					
					
					
					});
					
					promise.error(function(response){
							global.popup();
							$ionicLoading.hide();
					});	
			};
// ***********codeLatLng
			$scope.codeLatLng = function (lat,lng) {
						if(lat == '') return false;
						if(lng == '') return false;
						var geocoder= new google.maps.Geocoder();
						var latlng = new google.maps.LatLng(lat, lng);
						geocoder.geocode({'latLng': latlng}, function(results, status) {
							$scope.myFirstDeferred.resolve();
							if (status == google.maps.GeocoderStatus.OK) {
								  if (results[1]) {
									document.getElementById('search').value = results[1].formatted_address;
									$scope.userAvailability.location = results[1].formatted_address;
								  }
								  else{
									  global.popup();
								  }
							} else {
									alert('No results found due to: ' + status);
							}
					   });
		   	};
	
// ***************************************** Function Declarations ***************************************/
			$scope.$on('$stateChangeSuccess', function() {
				 google.maps.event.trigger($scope.map, 'resize');
				 $scope.$broadcast('refreshSlider');
				// console.log($scope.map);
				 //if($scope.map != '')				 /*workaround to prevent triggering the call on first load*/
				 //		$scope.fetchavailability();
			  });
// ***********checkTime
			$scope.checkTime = function(){
						var today = new Date();										
						var hh = today.getHours();
						var mm = today.getMinutes();									
						if(hh <= 5 || hh >=11)
							return false;
						else
							return true;
			};
			
// ***********getToday
			$scope.getToday = function(){
						var today = new Date();
						var dd = today.getDate();
						var mm = today.getMonth()+1;
						var yyyy = today.getFullYear();							
						if(dd<10) {
							dd='0'+dd
						} 
							
						if(mm<10) {
							mm='0'+mm
						} 
							
						var date = yyyy+'-'+mm+'-'+dd;
							
						return date;	
			};	
// ***********checkifAvailable
			$scope.checkifAvailable = function(){
					if(!$scope.userAvailability.availableToday){
						global.popup("Please set available today !");
					}
			};
// ***********scrollBottom
			$scope.scrollBottom = function() {
						$ionicScrollDelegate.scrollBottom();
			};			
// ***********getNow				
			$scope.getNow = function(){
					var today = new Date();					
					var hh = today.getHours(); // => 9
					var mm = today.getMinutes(); // =>  30
					var ss = today.getSeconds(); // => 51
					var time   = hh+':'+mm+':'+ss;					
					return time;
			};
// ***********restrictAvailability
			$scope.restrictAvailability = function(value){
					if($scope.disableAvailability){
						if(value){
							$scope.userAvailability.availableToday = $scope.userAvailability.availableToday === true ? false : true;
						}
						 global.popup($scope.reason);
					}
			};

// ***********onSuccess									
			onSuccess = function(position){
				$scope.userAvailability.match_longitude  =  position.coords.longitude ;
				$scope.userAvailability.match_latitude 	 =  position.coords.latitude ;
				$scope.availabilityInit();
			};
// ***********onSuccessSetCurrent
			onSuccessSetCurrent = function(position){
				$scope.userAvailability.match_longitude  =  position.coords.longitude ;
				$scope.userAvailability.match_latitude 	 =  position.coords.latitude ;
				$scope.codeLatLng(position.coords.latitude,position.coords.longitude);																
				var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
				$scope.map.setCenter(latlng);																		
				$scope.marker.setPosition(latlng);	
				global.hideloader();
			};	
// ***********onError	 
			onError = function(error){
				$scope.availabilityInit();
			};
// ***********onErrorWithMessage
			onErrorWithMessage = function(){
				global.hideloader();
				var promise = global.confirm("Could not fetch current location ! Enable your GPS and click OK to try again!");
				promise.then(function(res){
					if(res){
						global.loader();
						navigator.geolocation.getCurrentPosition(onSuccess, onError, {
							timeout: 10000,
							maximumAge: 10000
						});
					}
										  
				});
			};
// ***********radiusChange	
			$scope.radiusChange = function(radius) {
				radius = radius * 1000;
				$scope.circle.set('radius', parseInt(radius, 10) );
			};
// ***********getCurrentLocation	
			$scope.getCurrentLocation = function (){
				if(!$scope.userAvailability.availableToday){
					global.popup('Please enable AVAILABLE TODAY button!');
					return;
				}
				global.loader();
				navigator.geolocation.getCurrentPosition(onSuccessSetCurrent, onErrorWithMessage, {
									  timeout: 10000,
									  maximumAge: 10000
				});	
			};
// ***********disableFields
			$scope.disableFields = function(value){
					if($scope.disableAvailability)
						return;						
					if(value==false)
						$scope.disable.disableFields = true;
					else{
						$scope.disable.disableFields = false;
						global.loader();
						$scope.availabilityInit();
					}							
							
					$scope.map.setOptions({draggable: value});
					$scope.marker.setOptions({draggable: value});
					$scope.radiusChange($scope.userAvailability.match_radius);
			};
		
		

}]);