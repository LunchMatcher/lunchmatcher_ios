angular.module('starter.controllers')
.controller('pointsListCtrl',['$scope', '$http','config', 'global', '$cordovaToast' ,'$location',function($scope,$http, config, global, $cordovaToast,$location) {
		$scope.pointList = [{title : 'point100' , value : '100'},{title : 'point200' , value : '200'}];
		$scope.buyAdFree = function(pointid) {
			//inappbilling.init(successHandler, errorHandler, {showLog:true});
			if(window.device && device.platform.toLowerCase() == "ios" ) {
			//	console.log(IAP);
			//	console.log(storekit);
				IAP.buy(pointid);
			}
			else
			{
				inappbilling.buy(successHandler, errorHandler,pointid);
			}
		}
	
		if(window.device && device.platform.toLowerCase() == "ios" ) {
				angular.forEach($scope.pointList, function(value, key) {
					  IAP.list.push(value.title);
					});
					//IAP = {
					//  list: [ "point100"]
					//};
					
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
			
					//IAP.onPurchase = function (transactionId, productId, receipt) {
						// if(productId === 'adfree'){
							 // alert("Ads Removed!");
						// }
					//};
				/*
					IAP.onRestore = function (transactionId, productId, transactionReceipt) {
						 if(productId == 'adfree'){
						 }
					};
				
					IAP.onError = function (errorCode, errorMessage) {
						 console.log(errorCode);
						 console.log(errorMessage);
						 $cordovaToast.show(errorMessage, 'long', 'center');
					};*/

				IAP.buy = function(productId){
						 storekit.purchase(productId);
				};
				
				IAP.restore = function(){
						 storekit.restore();
				};
				IAP.onPurchase = function (transactionId, productId, receipt) {
					// if(productId === 'point100'){
						 $cordovaToast.show('Purchase success', 'long', 'center');
						 global.loader();
						 successHandler(null);
					 //}
				};
		
				IAP.onError = function (errorCode, errorMessage) {
					 console.log(errorCode);
					 console.log(errorMessage);
					 $cordovaToast.show(errorMessage, 'long', 'center');
				};
				
				IAP.load();
			//# END: Payment code ########################
		}
		    
			
			function successHandler (result) {
                var strResult = "";
               /* if(typeof result === 'object') {
                    strResult = JSON.stringify(result);
                } else {
                    strResult = result;
                }
                alert("SUCCESS: \r\n"+strResult );*/
				$scope.pointData = {};
				 $scope.pointData.memberId = config.userProfile.member_id;
 				 $scope.pointData.point    = 100;
				// $cordovaToast.show(error, 'long', 'center');
				$http.post(config.apiUrl+'/purchasePoint', { 'pointData' :  $scope.pointData }).
						success(function(response) {
							if(response.status == 'ok'){
								$cordovaToast.show(response.message, 'long', 'center');
								global.hideloader();
								$location.path('/app/scorepoints');
							}
						}). error(function(data) {
							 $scope.NoPoints = "Server Error..";
							 global.popup();
							 global.hideloader();
						});
            }

            function errorHandler (error) {
				$cordovaToast.show(error, 'long', 'center');				
            }
			
}]);