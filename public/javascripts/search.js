$(function(){

    $(".search-arrow").on('click', function(){

        var input = $(".search-input").val();

        if(input=="default: all"){
            input = "";
        }

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


        if(matchedProjects.length==1){
            google.maps.event.trigger(matchedProjects[0].marker, 'click');
        }else{
            google.maps.event.trigger(map, 'click');
        }
    });
})