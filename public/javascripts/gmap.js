function initialize() {
    var mapOptions = {
        center:new google.maps.LatLng(34.277077, 108.946609),
        zoom:11,
        minZoom:4,
        maxZoom:20,
        mapTypeId:google.maps.MapTypeId.ROADMAP
    };

    var map = new google.maps.Map($('.content')[0], mapOptions);

    var markers = [];
    var latLng1 = new google.maps.LatLng(34.277077, 108.946609);
//    var latLng2 = new google.maps.LatLng(34.283077, 108.946609);
//    var latLng3 = new google.maps.LatLng(34.203077, 108.946609);
//    var latLng4 = new google.maps.LatLng(34.233077, 108.856609);
//    var latLng5 = new google.maps.LatLng(34.333077, 109.006609);
//    var latLng6 = new google.maps.LatLng(34.049245451403976, 108.60088298681637);
//    var latLng7 = new google.maps.LatLng(34.5042927508917, 109.29061839941403);

    var infoBubble2 = new InfoBubble({
        map: map,
        content: '<div class="phoneytext">Some label</div>',
        position: new google.maps.LatLng(34.297077, 108.946609),
        shadowStyle: 0,
        padding: 0,
        backgroundColor: '#f8f8f8',
        borderRadius: 4,
        arrowSize: 10,
        borderWidth: 2,
        borderColor: '#bdbdbd',
        disableAutoPan: false,
        hideCloseButton: false,
        arrowPosition: 30,
        backgroundClassName: 'phoney',
        arrowStyle: 0,
        minWidth: 300,
        maxWidth: 300,
        minHeight: 200,
        maxHeight: 200,
        disableAnimation: true
    });

    var marker1 = new google.maps.Marker({'position':latLng1});
    marker1.setMap(map);
    google.maps.event.addListener(marker1, "click", markerClickHandler);

    var iw = new google.maps.InfoWindow({
        content: "Home For Sale"
    });

    function markerClickHandler() {
        infoBubble2.open();
//        console.log("marker clicked.");
//        iw.open(map, this);
    }


//    var marker2 = new google.maps.Marker({'position':latLng2});
//    var marker3 = new google.maps.Marker({'position':latLng3});
//    var marker4 = new google.maps.Marker({'position':latLng4});
//    var marker5 = new google.maps.Marker({'position':latLng5});
//    markers.push(marker1);
//    markers.push(marker2);
//    markers.push(marker3);
//    markers.push(marker4);
//    markers.push(marker5);

//    var mapClustererStyles = [
//        {
//            textColor:'#ffffff',
//            fontFamily:'Helvetica Neue, Helvetica, Arial, sans-serif',
//            textSize:16,
//            height:43,
//            width:42,
//            url:'/assets/images/rui/cluster-x1.png'
//        }
//    ];
//
//    var clusterIconCalculator = function (markers) {
//        var i = 1;
//        var text = markers.length.toString();
//        return {
//            text:text,
//            index:i
//        };
//    };
//
//    var clusterOptions = {
//        styles:mapClustererStyles,
//        averageCenter:true,
//        calculator:clusterIconCalculator,
//        maxZoom:12,
//        minimumClusterSize:1,
//        gridSize:40
//    };
//
//    var markerCluster = new MarkerClusterer(map, markers, clusterOptions);



    google.maps.event.addListener(markerCluster, "click", clusterClickHandler);
    function clusterClickHandler(c) {

        if (c.getSize() == 1) {
            map.setZoom(13);
        } else {
            map.setZoom(map.getZoom() + 2);
        }
        map.setCenter(c.getCenter());
        markerCluster.setZoomOnClick(false);
    }

    google.maps.event.addListener(map, 'idle', mapIdleHandler);

    function mapIdleHandler() {
    }

}

$(document).ready(function () {
    initialize();
});