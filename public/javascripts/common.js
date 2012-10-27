var map;
var markers = [];
var projects = [];

var infoBubble = new InfoBubble({
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
