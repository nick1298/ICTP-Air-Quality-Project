var app = angular.module('myApp', ['ngRoute', 'ui.bootstrap']);

console.log("step 1");
app.config(function($routeProvider, $locationProvider) {
	$routeProvider
		.when('/', {
			templateUrl: 'views/list.html',
			controller: 'listController'
		})
		.when('/map', {
			templateUrl: 'views/map.html',
			controller: 'mapController'
		})
		.otherwise({
			redirectTo: '/'
		});

		$locationProvider.html5Mode(true);
});

app.controller('listController', function($scope, $http) {
	console.log("step 2");
	$http.get("https://www.data.act.gov.au/resource/94a5-zqnn.json").then(function(response) {
		$scope.aqData = response.data;
		console.log($scope.aqData);
	})
})

app.controller('mapController', function($scope, $rootScope, $compile) {
	console.log("map page");
	function initialize() {
		$scope.map = new google.maps.Map(document.getElementById('map'), {
			zoom: 4,
			center: {lat: -25.363, lng: 131.044}
		});

		$scope.stations = [
			{ title: 'Sydney', lat: -33.873033, lng: 151.231397 },
			{ title: 'Melbourne', lat: -37.81228, lng: 144.968355 }
		];

		$scope.infowindow = new google.maps.InfoWindow({
			content: ''
		});

		for (var i = 0; i < $scope.stations.length; i++) {
			var marker = new google.maps.Marker({
				position: new google.maps.LatLng($scope.stations[i].lat, $scope.stations[i].lng),
				map: $scope.map,
				title: $scope.stations[i].title
			});

			var content = '<a ng-click="cityDetail(' + i + ')" class=btn-defualt">View details<a/>';
			var compiledContent = $compile(content)($scope)

			google.maps.event.addListener(marker, 'click', (function(marker, content, scope){
				return function() {
					scope.infowindow.setContent(content);
					scope.infowindow.open(scope.map, marker);
				};
			})(marker, compiledContent[0], $scope));
		}
	}

	$scope.cityDetail = function(index) {
		alert(JSON.stringify($scope.stations[index]));
	}

	google.maps.event.addDomListener(window, 'load', initialize);
})