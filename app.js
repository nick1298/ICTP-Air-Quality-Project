var app = angular.module('myApp', ['ngRoute', 'ui.bootstrap', 'd3']);

console.log("step 1");

app.config(function ($routeProvider, $locationProvider) {
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
			controller: 'civicCntrl',
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

app.controller('listController', function ($scope, $http) {
	console.log("step 2");
	$http.get("https://www.data.act.gov.au/resource/94a5-zqnn.json").then(function (response) {
		$scope.aqData = response.data;
		console.log($scope.aqData);
	})
});

app.controller('mapController', function ($scope, $rootScope, $compile) {
	console.log("map page");
	function initialize() {
		$scope.map = new google.maps.Map(document.getElementById('map'), {
			zoom: 5,
			center: { lat: -35.290287, lng: 149.126996 }
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

			google.maps.event.addListener(marker, 'click', (function (marker, content, scope) {
				return function () {
					scope.infowindow.setContent(content);
					scope.infowindow.open(scope.map, marker);
				};
			})(marker, compiledContent[0], $scope));
		}
	}

	$scope.cityDetail = function (index) {
		alert(JSON.stringify($scope.stations[index]));
	}

	google.maps.event.addDomListener(window, 'load', initialize);
});

app.controller('civicCntrl', ['d3', '$scope', '$http', function (d3, $scope, $http) {
	$scope.singleModel = 1;

	$scope.mode = "aqi_site";


	$http.get("https://www.data.act.gov.au/resource/94a5-zqnn.json?$limit=24&name='Civic'&$order=datetime DESC").then(function (response) {
		$scope.aqData = response.data;

		$scope.drawBarChart = function () {
			d3.selectAll('svg').remove();

			var margin = { top: 20, right: 20, bottom: 20, left: 20 },
				width = 960 - margin.left - margin.right,
				height = 500 - margin.top - margin.bottom;
			var x = d3.scaleBand()
				.rangeRound([0, width], .1)
				.paddingInner(0.1);
			var y = d3.scaleLinear()
				.range([height, 0]);
			var xAxis = d3.axisBottom()
				.scale(x)
				;
			var yAxis = d3.axisLeft()
				.scale(y)
				.ticks(10);
			var svg = d3.select("#bar-chart").append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
				.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

			/* d3.tsv("data.tsv", type, function(error, data) {
				  if (error) throw error; */
			/*  console.log($scope.aqData); */
			data = $scope.aqData;
			console.log(data);

			x.domain(data.map(function (d) { return d.time; }));
			y.domain([0, d3.max(data, function (d) { return d.aqi_site; })]);

			svg.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(0," + height + ")")
				.call(xAxis);
			svg.append("g")
				.attr("class", "y axis")
				.call(yAxis)
				.append("text")
				.attr("transform", "rotate(-90)")
				.attr("y", 6)
				.attr("dy", ".71em")
				.style("text-anchor", "end")
				.text("aqi_site");
			svg.selectAll(".bar")
				.data(data)
				.enter().append("rect")
				.attr("class", "bar")
				.attr("x", function (d) { return x(d.time); })
				.attr("width", x.bandwidth())
				.attr("y", function (d) {
					if ($scope.mode == "aqi_site") {
						return y(d.aqi_site);
					} else if ($scope.mode == "aqi_o3_1hr") {
						return y(d.aqi_o3_1hr);
					} else {
						return y(d.aqi_site);
					}
					//return y(d.aqi_site);
				})
				.attr("height", function (d) {
					if ($scope.mode == "aqi_site") {
						return height - y(d.aqi_site);
					} else if ($scope.mode == "aqi_o3_1hr") {
						return height - y(d.aqi_o3_1hr);
					} else {
						return height - y(d.aqi_site);
					}
					//return height - y(d.aqi_site);
				})
			/* }); */

			function type(d) {
				//d.aqi_site = +d.aqi_site;
				//d.aqi_o3_1hr = +d.aqi_o3_1hr;
				if ($scope.mode == "aqi_site") {
					d.aqi_site = +d.aqi_site;
				} else if ($scope.mode == "aqi_o3_1hr") {
					d.aqi_o3_1hr = +d.aqi_o3_1hr;
				} else {
					d.aqi_site = +d.aqi_site;
				}

				return d;
			}

		}
		$scope.updateData = function () {
			d3.select("#bar-chart").remove();
		}

		$scope.drawBarChart();
	})


}]);