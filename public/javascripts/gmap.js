function initializeMap() {
    var mapOptions = {
        center:new google.maps.LatLng(34.277077, 108.946609),
        zoom:11,
        minZoom:4,
        maxZoom:20,
        mapTypeId:google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map($('.content')[0], mapOptions);

    google.maps.event.addListener(map, 'idle', mapIdleHandler);
    function mapIdleHandler() {
    }

    google.maps.event.addListener(map, 'click', mapClickHandler);
    function mapClickHandler() {
        infoBubble.close();
    }

}

function initializeMarkers() {
    $.ajax('/getProjects', {
        success: function (data) {
            _.each(data.projects, function(project){
                projects.push(project);

                var latLng = new google.maps.LatLng(project.lat, project.lng);
                var marker = new google.maps.Marker({'position':latLng});
                marker.setMap(map);
                google.maps.event.addListener(marker, "click", function(m){
                    var latOffset = 0.02 * Math.pow(0.5, map.getZoom() - 11);
                    var lat = m.latLng.lat() + latOffset;
                    var lng = m.latLng.lng();
                    infoBubble.setPosition(new google.maps.LatLng(lat, lng));

                    var bubbleTemaplate = $('#bubbleTemplate').html();
                    var bubbleContent = Mustache.to_html(bubbleTemaplate, project);
                    infoBubble.setContent(bubbleContent);

                    infoBubble.open(map);
                });
                markers.push(marker);
            });
        }
    });
}


$(document).ready(function () {
    initializeMap();
    initializeMarkers();
});