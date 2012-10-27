function initializeMap() {

    var mapOptions = {
        center:new google.maps.LatLng(34.277077, 108.946609),
        zoom:11,
        minZoom:4,
        maxZoom:20,
        overviewMapControl:true,
        mapTypeId:google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map($('.canvas')[0], mapOptions);

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

                var latLng = new google.maps.LatLng(project.lat, project.lng);
                var marker = new google.maps.Marker({'position':latLng});
                marker.setMap(map);

                project.marker = marker;
                projects.push(project);

                google.maps.event.addListener(marker, "click", function(){
                    var latOffset = 0.02 * Math.pow(0.5, map.getZoom() - 11);
                    var lat = marker.getPosition().lat() + latOffset;
                    var lng = marker.getPosition().lng();
                    infoBubble.setPosition(new google.maps.LatLng(lat, lng));

                    var bubbleTemaplate = $('#bubbleTemplate').html();
                    var bubbleContent = Mustache.to_html(bubbleTemaplate, project);
                    infoBubble.setContent(bubbleContent);

                    infoBubble.open(map);
                });
                markers.push(marker);
            });

            initializeSearchResult();
        }
    });
}

function initializeSearchResult () {
    $('.search-arrow').click();
}


$(document).ready(function () {
    initializeMap();
    initializeMarkers();
});