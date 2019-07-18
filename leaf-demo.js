var map = L.map( 'map', {
  center: [54.505, -3],
  minZoom: 2,
  zoom: 6
});

var bounds = map.getBounds();

map.on('moveend', function() { 
    bounds = map.getBounds();
	updateAllData(drp.startDate, drp.endDate);
});

L.tileLayer( 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
 attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
 subdomains: ['a','b','c']
}).addTo( map );

var markerClusters = L.markerClusterGroup();

var drp = $('#daterange').data('daterangepicker');

var includingTags = [];

function addTag(tag){
	includingTags.push(tag);
	updateAllData(drp.startDate, drp.endDate);
}

function updateAllData(startDate, endDate){
	
	//$('.bootstrap-tagsinput').tagsinput('removeAll');
	
	$("#myTable").empty();
	
	markerClusters.clearLayers();
	
	var counts = {};

	for ( var i = 0; i < markers.length; ++i )
	{
		var marker_date = new moment(markers[i].datetime);
		
		var tags = markers[i].caption.toLowerCase().split(/#+|\s+/);
		var containsTag = true;
		
		
		for(var m = 0; m<includingTags.length; m++){
			
			$('select').tagsinput('add', includingTags[m]);		
			
			var tagIn = false;
			for(var k = 0; k<tags.length; k++){
				if(includingTags[m] === tags[k]){
					tagIn = true;
					break;
				}
			  }
			containsTag = containsTag && tagIn;
			}
		
		if(marker_date > startDate && marker_date < endDate && (containsTag || includingTags.length === 0) && ((markers[i].lat < bounds._northEast.lat && markers[i].lat > bounds._southWest.lat) && (markers[i].lng < bounds._northEast.lng && markers[i].lng > bounds._southWest.lng))){
		  var popup = '<img src="' + markers[i].url + '" style="height: 300px">' +
					  '<br/>' + markers[i].caption +
					  '<br/>' + markers[i].datetime;

		  var m = L.marker( [markers[i].lat, markers[i].lng] )
						  .bindPopup( popup, {maxWidth: "auto", autoPan: false});

		  markerClusters.addLayer( m );
		  
		  for(var k = 0; k<tags.length; k++){
				counts[tags[k].trim()] = counts[tags[k].trim()] ? counts[tags[k].trim()] + 1 : 1;
		  }
		}
	}


	var items = Object.keys(counts).map(function(key) {
	  return [key, counts[key]];
	});

	// Sort the array based on the second element
	items.sort(function(first, second) {
	  return second[1] - first[1];
	});

	// Find a <table> element with id="myTable":
	var table = document.getElementById("myTable");
		
	for(var e = 0; e<items.length; e++){
		
		if(items[e][0] !== ''){
			
			// Create an empty <tr> element and add it to the 1st position of the table:
			var row = table.insertRow();

			// Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
			var cell1 = row.insertCell(0);
			var cell2 = row.insertCell(1);

			// Add some text to the new cells:
			cell1.innerHTML = "<a href='#' onclick='addTag(\"" + items[e][0] + "\")'>" + items[e][0] + "</a> " + items[e][1];
		}
	}

}

$('select').on('itemRemoved', function(event) {
	includingTags.splice( includingTags.indexOf(event.item), 1 );
	updateAllData(drp.startDate, drp.endDate);
});

updateAllData(drp.startDate, drp.endDate);

map.addLayer( markerClusters );