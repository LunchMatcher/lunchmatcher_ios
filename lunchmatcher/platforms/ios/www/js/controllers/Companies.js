angular.module('starter.controllers')
.controller('CompaniesCtrl', ['$scope', '$http', '$ionicPopup', '$filter', 'global', 'config', '$ionicHistory', '$ionicLoading','$location' ,function($scope, $http, $ionicPopup, $filter, global, config, $ionicHistory, $ionicLoading, $location ) {

	var companyStart		 = 0;
	$scope.companyCount 	 = 50;
	$scope.searchKey 		 = '';	 
	$scope.accessToken 		 = config.userProfile.access_token;
	$scope.companies 		 = [];
	$scope.selectedCompanies = [];
	$scope.selectedCompanyDetails = [];
	$scope.more 			 = true;
	$scope.imageNotAvail	 = 'img/no_image.png';
	$scope.noCompanies 		 = true;	
	
// ***************************************** Function Declarations ***************************************/	
		$scope.$on('$stateChangeSuccess', function() {
			$scope.searchKey = global.getTempVal('searchKey');
			global.loader();
			$scope.companies 		 = [];
			$scope.loadCompanies();
	  	});
// ***********toggleCompany
		$scope.toggleCompany = function (company) {
	  		var tf = (company.selected === 'true') ? 'false' : 'true';
	  		company.selected = tf;
		};	
// ***********companySelected
  		$scope.companySelected = function(){
				
	  		global.loader('Adding Companies..');
			angular.forEach($scope.companies, function(company, key) {	
							
					if(company.selected === 'true'){
						$scope.selectedCompanyDetails.push(company);
					}							
			});
			
			$http.post(config.apiUrl+'/updateExeComp', {'member_id':config.userProfile.member_id, 'companies' : $scope.selectedCompanyDetails})
						.success(function(response) {							
								$ionicLoading.hide();
								$location.path('/app/registration');														
						}).error(function(data) {
								$ionicLoading.hide();
								global.popup('Companies not added. Please try again.');
																	
						}).finally(function () {
								$ionicLoading.hide();
								$location.path('/app/registration');
						});
			
		};
// ***********loadCompanies
  		$scope.loadCompanies = function () {
      		var searchCompanyURL = 'https://api.linkedin.com/v1/company-search:(companies:(id,name,logo_url,square-logo-url))?keywords='+$scope.searchKey+'&oauth2_access_token='+$scope.accessToken+'&format=json&start='+companyStart+'&count='+$scope.companyCount;
    	  
			$scope.noCompanies 		 = true;				  
    		$http.get(searchCompanyURL).success(function (companies, status, headers) {
				
			  if (companies.companies._total <= companyStart) {
				$scope.more = false;
			  }
			  else{
				  $scope.more = true;
			  }
       		
			if(companies.companies._total == 0){
			   $scope.noCompanies = false;
			   $scope.more = false;
		    }				
			else{
				$scope.noCompanies 		 = true;
			}

      
		  	angular.forEach(companies.companies.values, function (company) {
				$scope.companies.push(company);
		  	});
			
	  		$ionicLoading.hide();
    	}).error (function (data, status, headers) {
      		$scope.more = false;
     		$ionicLoading.hide();
      		if (headers('x-ratelimit-remaining') == 0) {
        		var popup = $ionicPopup.alert({
          		title: 'You have exceeded LinkedIn\'s Rate Limit.',
          		template: 'Try again after ' + $filter('date')(parseInt(headers('x-ratelimit-reset')) * 1000, 'short')
        		});
        
      		} 
			else {
				$ionicPopup.alert({
				  title: 'LinkedIn did not respond.',
				  template: 'Please try again.'
				});
      		}
    	}).finally(function () {
	  		companyStart = companyStart+$scope.companyCount;
      		$scope.$broadcast('scroll.infiniteScrollComplete');
    	});
  	};
  //******** gotoback
			$scope.gotoback = function(){
				$location.path("/app/registration");
			};
 }]);