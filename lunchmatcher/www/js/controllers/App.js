angular.module('starter.controllers')
.controller('AppCtrl',['$scope', '$ionicLoading','global','$http','config','$state', function($scope, $ionicLoading, global, $http,config,$state) {
          $scope.loginData = {};
        $scope.share = function(){

                    window.plugins.socialsharing.share('test', null, null, 'lunchmatcher.com'
                    , function(msg){
                        if(msg == true)
                            global.popup('Successully shared!'); 
                        else
                             global.popup('Error: Sharing failed. Please try later!');
                        });
        }

}]);