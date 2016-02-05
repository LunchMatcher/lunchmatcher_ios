angular.module('starter.controllers')
.controller('BuyPointCtrl',['$scope','$timeout', '$ionicLoading','global','$http','config','$ionicHistory', function($scope, $timeout, $ionicLoading, global, $http,config,$ionicHistory, $cordovaToast, $location,$state) {
  		
		$scope.pointList = [{title : 'points_50' , value : '50'},{title : 'points_120' , value : '120'},{title : 'points_250' , value : '250'},{title : 'points_500' , value : '500'}];
		
	
			var IAP = {};
			IAP.list = [];
			angular.forEach($scope.pointList, function(value, key) {
				IAP.list.push(value.title);
			});
					/*IAP = {
					  list: [ "points_50"]
					};*/
					
					IAP.load = function () {
			 
						 // Check availability of the storekit plugin
						 if (!window.storekit) {
							  console.log("In-App Purchases not available");
							  return;
						 }		 
						 // Initialize
						 storekit.init({
							  debug:    true, // Enable IAP messages on the console
							  ready:    IAP.onReady,
							  purchase: IAP.onPurchase,
							  restore:  IAP.onRestore,
							  error:    IAP.onError
						 });
					};
			
					IAP.onReady = function () {
						 storekit.load(IAP.list, function (products, invalidIds) {
							  IAP.products = products;
							  IAP.loaded = true;
							  for (var i = 0; i < invalidIds.length; ++i) {
								   console.log("Error: could not load " + invalidIds[i]);
							  }
						 });
					};
			
					

				IAP.buy = function(productId){
						 console.log(storekit);
						 storekit.purchase(productId);
						 
				};
				
				IAP.restore = function(){
						 storekit.restore();
				};
				IAP.onPurchase = function (transactionId, productId, receipt) {
					//alert(productId);
					global.loader();
					$scope.pointData = {};
				
					   if(productId == 'points_50'){
						  $scope.pointData.point    = 50;
					   }
					   else if(productId == 'points_120'){
						   $scope.pointData.point    = 120;
					   }
					   else if(productId == 'points_250'){
						   $scope.pointData.point    = 250;
					   }
					   else if(productId == 'points_500'){
						   $scope.pointData.point    = 500;
					   }
				   
					
					 $scope.pointData.memberId = config.userProfile.member_id;
					 
						if($scope.pointData.point > 0 ){
							$http.post(config.apiUrl+'/purchasePoint', { 'pointData' :  $scope.pointData }).
								success(function(response) {
									global.hideloader();
									if(response.status == 'ok'){
										global.popup(response.message);
										$location.path("/app/scorepoints");
									}
							}). error(function(data) {
								 global.hideloader();
								 $scope.NoPoints = "Server Error..";
								 global.popup();
								 
							});
						}
					
				};
		
				IAP.onError = function (errorCode, errorMessage) {
					 global.hideloader();	
					 global.popup(errorMessage);	
					 $window.location.reload(true)
					
				};
				
				IAP.load();
			//# END: Payment code ########################
		
		  
		$scope.buyAdFree = function(pointid) {
		
			if(!pointid) {
				global.popup("Invalid product selected!");	
				return false;
			}
			
			$scope.point = pointid;	
			//inappbilling.init(successHandler, errorHandler, {showLog:true});
			//if(window.device && device.platform.toLowerCase() == "ios" ) {
			global.loader();
			$timeout(function(){
				//$ionicLoading.hide();
				
				console.log(IAP);
				IAP.buy(pointid);
			}, 5000);
			
				
			
			/*}
			else
			{
				global.popup("Your device platform is not supporting to In-App Purchase.");
				//inappbilling.buy(successHandler, errorHandler,pointid);
			}*/
		};
		  
		$scope.goBack = function(){
			$ionicHistory.goBack();
		};
	
}]);