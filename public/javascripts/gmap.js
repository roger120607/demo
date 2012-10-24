function initialize() {
    var mapOptions = {
        center:new google.maps.LatLng(34.277077, 108.946609),
        zoom:11,
        minZoom:4,
        maxZoom:20,
        mapTypeId:google.maps.MapTypeId.ROADMAP
    };

    var map = new google.maps.Map($('.content')[0], mapOptions);

    var latLng1 = new google.maps.LatLng(34.192423,108.870649);
    var latLng2 = new google.maps.LatLng(34.246433,108.866959);

    var infoBubble2 = new InfoBubble({
        map:map,
        content:'<div class="phoneytext">Some label</div>',
        position:new google.maps.LatLng(34.297077, 108.946609),
        shadowStyle:0,
        padding:0,
        backgroundColor:'#f8f8f8',
        borderRadius:5,
        arrowSize:10,
        borderWidth:3,
        borderColor:'#bdbdbd',
        disableAutoPan:false,
        hideCloseButton:false,
        arrowPosition:30,
        backgroundClassName:'bubble',
        arrowStyle:0,
        minWidth:357,
        maxWidth:357,
        minHeight:180,
        maxHeight:180,
        disableAnimation:true
    });

    var marker1 = new google.maps.Marker({'position':latLng1});
    var marker2 = new google.maps.Marker({'position':latLng2});
    marker1.setMap(map);
    marker2.setMap(map);
    google.maps.event.addListener(marker1, "click", markerClickHandler);
    google.maps.event.addListener(marker2, "click", markerClickHandler);

    function markerClickHandler(d) {
        var lat = d.latLng.lat() + 0.02;
        var lng = d.latLng.lng();
        infoBubble2.setPosition(new google.maps.LatLng(lat, lng));
        infoBubble2.setContent($('#bubbleTemplate').html());
        infoBubble2.open();
    }

    google.maps.event.addListener(map, 'idle', mapIdleHandler);
    function mapIdleHandler() {
    }

    google.maps.event.addListener(map, 'click', mapClickHandler);
    function mapClickHandler() {
        infoBubble2.close();
    }

}

$(document).ready(function () {
    var test = {
        "title":"test"
    }
    var bubbleTemaplate = $('#bubbleTemplate').html();
    var to_html = Mustache.to_html(bubbleTemaplate, test);
    initialize();
//    var bubbleHtml = document.getElementById("bubble").innerHTML;
//    console.log(document.getElementById("bubble").src);
//    console.log(bubbleHtml);
});