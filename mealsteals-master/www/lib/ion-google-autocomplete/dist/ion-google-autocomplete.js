angular.module('ion-google-autocomplete', [])
.directive('googleAutocompleteSuggestion', [
    '$document', '$ionicModal', '$ionicPopup', '$ionicTemplateLoader', 'googleAutocompleteService',
    function($document, $ionicModal, $ionicPopup, $ionicTemplateLoader, googleAutocompleteService) {
    return {
        restrict: 'A',
        scope: {
            location: '=',//Required
            countryCode: '@',//Optional
            onSelection: '&',//Optional
            place: '@'//optional
        },
        link: function($scope, element) {
        
            $scope.search = {};
            $scope.search.suggestions = [];
            $scope.search.query = '';

            
            /*var template = [
                '<ion-modal-view>',
                '<ion-header-bar class="item-input-inset">',
                '<label class="item-input-wrapper">',
                '<i class="icon ion-search placeholder-icon"></i>',
                '<input type="search" ng-model="search.query" placeholder="Search">',
                '</label>',
                '<button class="ion-autocomplete-cancel button button-clear button-dark ng-binding" ng-click="close()" translate>Done</button>',
                '</ion-header-bar>',
                '<ion-content>',
                '<ion-list>',
                '<ion-item ng-show="search.error">',
                '{{search.error}}',
                '</ion-item>',
                '<ion-item ng-repeat="suggestion in search.suggestions" ng-click="choosePlace(suggestion)">',
                '{{suggestion.description}}',
                '</ion-item>',
                '</ion-list>',
                '<div class="padding">',
                '<img src="https://developers.google.com/maps/documentation/places/images/powered-by-google-on-white.png" style="margin-left: 5px" alt="" />',
                '</div>',
                '</ion-content>',
                '</ion-modal-view>'
            ].join('')*/        

            $scope.modal = $ionicModal.fromTemplate(template, {
                scope: $scope,
                animation: 'slide-in-up'
            })

            var searchInputElement = angular.element($scope.modal.$el.find('input'));
            
            element[0].addEventListener('focus', function(event) {
                
                $scope.search.query = '';
                $scope.open();
            });
                
            
            /*$scope.open = function() {
                
                $scope.modal.show();
                searchInputElement[0].focus();
            };
            
            $scope.close = function() {
                
                $scope.modal.hide();
            };
            */
            
            var template = [
                
                '<ion-header-bar style="padding:0px;border:none!important;background-image:none!important;" class="item-input-inset">',
                '<label style="border-radius:10px;" class="item-input-wrapper">',
                '<i class="icon ion-search placeholder-icon"></i>',
                '<input type="search" ng-model="search.query" placeholder="Search">',
                '</label>',
                '<button style="color: #444 !important;" class="ion-autocomplete-cancel button button-clear button-dark ng-binding" ng-click="close()" translate>Cancel</button>',
                '</ion-header-bar>',
                '<ion-content style="top:108px;border-top: 1px solid #d8d8d8;padding-top:0px;">',
                '<ion-list>',
                '<ion-item ng-show="search.error">',
                '{{search.error}}',
                '</ion-item>',
                '<ion-item ng-repeat="suggestion in search.suggestions" ng-click="choosePlace(suggestion)">',
                '{{suggestion.description}}',
                '</ion-item>',
                '</ion-list>',
                '<div class="padding">',
                '<img src="https://developers.google.com/maps/documentation/places/images/powered-by-google-on-white.png" style="margin-left: 5px" alt="" />',
                '</div>',
                '</ion-content>',
            ].join('')
            
            var searchPopup;
    
            $scope.open = function(){
                console.log('open!')
                searchPopup = $ionicPopup.show({
                  cssClass: 'search-biz-popup',
                  //okText: 'Close',
                  scope: $scope,
                  template: template,
                });
                searchInputElement[0].focus();
             };

            $scope.close = function() {
                console.log('close');
                searchPopup.close();
            };
            
            
            $scope.choosePlace = function(place) {
                
                googleAutocompleteService.getDetails(place.place_id).then(function(location) {
                    
                    $scope.location = location;
                    $scope.close();
                    
                    if ($scope.onSelection !== undefined)
                        $scope.onSelection({ location: location });
                });
            };
            
            $scope.$watch('search.query', function(newValue) {
                
                if (newValue) {
                    
                    googleAutocompleteService.searchAddress(newValue, $scope.countryCode, $scope.place).then(function(result) {
                        
                        $scope.search.error = null;
                        $scope.search.suggestions = result;
                    }, function(status) {
                        
                        $scope.search.error = "There was an error :( " + status;
                    });
                }
            });
        }
    }
}])
angular.module('ion-google-autocomplete')
.factory('googleAutocompleteService', ['$q', function ($q) {

  var autocompleteService = new google.maps.places.AutocompleteService();
  var detailsService = new google.maps.places.PlacesService(document.createElement("button"));

  return {
    /**
     * Search an address from an input and and option country restriction
     * @param required input string
     * @param optional countryCode two letters code
     */
    searchAddress: function(input, countryCode, place) {
        console.log(place);
        console.log(countryCode);

      var dfd = $q.defer();

      autocompleteService.getPlacePredictions({
        input: input,
        //types: ['establishment'],  
        types: [place],
        componentRestrictions: countryCode ? { country: countryCode } : undefined
      }, function(result, status) {
          
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            
          console.log(status);
          dfd.resolve(result);
        }
        else
          dfd.reject(status);
      });

      return dfd.promise;
    },
    /**
     * Gets the details of a placeId
     * @param required placeId
     */
    getDetails: function(placeId) {
        
      var dfd = $q.defer();
      
      detailsService.getDetails({ placeId: placeId }, function(result) {
          
        dfd.resolve(result);
      });
      
      return dfd.promise;
    }
  };
}])

