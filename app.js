var app = angular.module('myApp', ['ngRoute', 'ui.bootstrap']);

console.log("step 1");

app.config(function($routeProvider, $locationProvider) {
	$routeProvider
		.when('/', {
			templateUrl: 'views/map.html',
			controller: 'mapController',
			activetab: "map"
		})
		.when('/list', {
			templateUrl: 'views/list.html',
			controller: 'listController',
			activetab: "list"
		})
		.when('/civic', {
			templateUrl: 'views/civic.html',
			controller: 'mapController',
			activetab: "civic"
		})
		.when('/florey', {
			templateUrl: 'views/florey.html',
			controller: 'mapController',
			activetab: "florey"
		})
		.when('/monash', {
			templateUrl: 'views/monash.html',
			controller: 'mapController',
			activetab: "monash"
		})
		.otherwise({
			redirectTo: '/'
		});

		$locationProvider.html5Mode(true);
}).run(function ($rootScope, $route) {
    $rootScope.$route = $route;
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
			zoom: 5,
			center: {lat: -35.290287, lng: 149.126996}
		});

		$scope.stations = [
			{ title: 'Civic', lat: -35.285307, lng: 149.131579 },
			{ title: 'Florey', lat: -35.220606, lng: 149.043539 },
			{ title: 'Monash', lat: -35.418302, lng: 149.094018 }
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