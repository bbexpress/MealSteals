'use strict';

// Declare app level module which depends on filters, and services
angular.module('config', [])

  // your Firebase data URL goes here, no trailing slash
  .constant('FBURL', 'https://mealsteals.firebaseio.com/');
