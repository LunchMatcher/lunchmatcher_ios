angular.module('starter.controllers')
.controller('TutorialCtrl',['$scope', '$ionicPopup', '$cordovaOauth', '$http','config', '$location', '$ionicLoading', 'global','$cordovaDatePicker','$ionicViewService', function($scope, $ionicPopup, $cordovaOauth, $http, config, $location, $ionicLoading, global,$cordovaDatePicker,$ionicViewService) {// JavaScript Document

	$scope.initial_tutorial = 1;
	$scope.slideHasChanged =function($index)
	{
		if($index==19)
		{
			global.loader();
			$location.path("/login");	
			global.hideloader();
		}
	}
}]);