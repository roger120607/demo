$(function(){

    $(".collapse").on('click', function(){

        if($(".panel").hasClass("closed")){
            $(".panel").animate({right:"0px"}, 300,function(){
                $(".panel").removeClass("closed");
                $('.canvas').width("811px");
                google.maps.event.trigger(map, 'resize');
            });
        }
        else{

            $(".panel").animate({right:"-333px"}, 300,function(){
                $('.canvas').width("100%");
                $(".panel").addClass("closed");
                google.maps.event.trigger(map, 'resize');
            });
        }

    });

    $(".search-arrow").on('click', function(){

        var input = $(".search-input").val();

        var matchedProjects = [];
        $(projects).each(function(index){
            if(projects[index].name.indexOf(input)>=0){
                matchedProjects.push(projects[index]);
            }
        });

        var resultTemplate = $("#result-template").html();
        $(".result-ul").html("");
        _.each(matchedProjects, function(project){
            var searchResult = Mustache.to_html(resultTemplate, project);
            $(".result-ul").append(searchResult);
        });

        $(".result-li").on('click', function() {
            var thisProjectName = $($(this).find('span')[0]).html();
            _.each(projects, function(project){
                if(project.name==thisProjectName){
                    google.maps.event.trigger(project.marker, 'click');
                }
            });
        });

        if(matchedProjects.length==1){
            google.maps.event.trigger(matchedProjects[0].marker, 'click');
        }else{
            google.maps.event.trigger(map, 'click');
        }

    });

    $('.search-input').on('keydown', function () {
        $('.cancel-search').show();
    });

    $('.cancel-search').on('click', function(){
        $('.search-input').val("");
        $('.search-arrow').click();
    });

})

function mouseOverResult(el) {
    el.style.backgroundColor = '#F2F2F2';
}
function mouseOutResult(el) {
    el.style.backgroundColor = '#ffffff';
}
