

getFlickr = function(page) {
    var apiKey = '52adf1ca7399bda5110f61226739cb7b';
    var tag = 'matane';
    var perPage = '24';
    var position = "&lat=48.852&lon=-67.537&radius=32"
    var showOnPage = '24';
    var total;

    $.getJSON('http://api.flickr.com/services/rest/?format=json&method='+
        'flickr.photos.search&api_key=' + apiKey + 
        '&tags=' + tag + position + '&per_page=' + perPage + '&page=' + page + '&jsoncallback=?', 
    function(data){
        total = parseInt(data.photos.total);
        $('.lightbox').remove();
        //$("<img id=\"flickr-before\" src=\"lib/lightbox/images/prev.png\" width=\"36\" height=\"36\"></img>").appendTo("#flickr");
        var classHidden = 'class="lightbox-hidden lightbox-after"';
        var classShow = 'class="lightbox"';
        $.each(data.photos.photo, function(i, rPhoto){
          var basePhotoURL = 'http://farm' + rPhoto.farm + '.static.flickr.com/'
            + rPhoto.server + '/' + rPhoto.id + '_' + rPhoto.secret;            
            
            var thumbPhotoURL = basePhotoURL + '_s.jpg';
            var mediumPhotoURL = basePhotoURL + '.jpg';
            
            var photoStringStart = '<a rel=lightbox[matane] ';
            var photoStringEnd = 'title="' + rPhoto.title + '" href="'+ 
                mediumPhotoURL +'"><img src="' + thumbPhotoURL + '" alt="' + 
                rPhoto.title + '"/></a>;'                
            var photoString = (i < showOnPage) ? 
                photoStringStart + classShow + photoStringEnd : 
                photoStringStart + classHidden + photoStringEnd;
                                        
            $(photoString).insertBefore("#flickr-after");
        }); 
        //$("<img id=\"flickr-after\" src=\"lib/lightbox/images/next.png\" width=\"36\" height=\"36\"></img>").appendTo("#flickr");
    });
    
    $("#flickr-before").unbind();
    $("#flickr-before").bind('click',function() {
        if (page == 2){
            $('#flickr-before').css({ opacity: 0.3 });
        };
        
        if (page >= (total/perPage)){
            $('#flickr-after').css({ opacity: 1 });
        };

        if (page != 1){
            page = page-1;
            getFlickr(page);
        };
        /*$("#flickr .lightbox").removeClass("lightbox").addClass("lightbox-hidden lightbox-after");
        if ($("#flickr .lightbox-before").length!=0){
           $("#flickr .lightbox-before").slice(0,8).removeClass("lightbox-hidden lightbox-before").addClass("lightbox");
        }else{
            $("#flickr .lightbox-after").slice(perPage-8,perPage).removeClass("lightbox-hidden lightbox-after").addClass("lightbox");
            $("#flickr .lightbox-after").removeClass("lightbox-after").addClass("lightbox-before");
        }*/
    });

     $("#flickr-after").unbind();
    $("#flickr-after").bind('click',function() {
        if (page == 1){
            $('#flickr-before').css({ opacity: 1 });
        };

        if (page >= (total/perPage)-1){
            $('#flickr-after').css({ opacity: 0.3 });
        };
        
        if (page <= (total/perPage)){
            page = page+1;
            getFlickr(page); 
        };
    /*         $("#flickr .lightbox").removeClass("lightbox").addClass("lightbox-hidden lightbox-before");
         if ($("#flickr .lightbox-after").length!=0){
            $("#flickr .lightbox-after").slice(0,8).removeClass("lightbox-hidden lightbox-after").addClass("lightbox");
         }else{
            $("#flickr .lightbox-before").slice(perPage-8,perPage).removeClass("lightbox-hidden lightbox-before").addClass("lightbox");
            $("#flickr .lightbox-before").removeClass("lightbox-before").addClass("lightbox-after");
        }*/
    });

};
