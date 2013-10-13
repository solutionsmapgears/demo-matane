var map={};
var page;
$(function() {
    /*-------------------------------------------------------
                            MAP
    -------------------------------------------------------*/
    map={
        move:false,
        latlon:[48.844836,-67.53057],
        zoom:14,
        iMapMove: null
    };
    
    map.map = L.map('map',{
        minZoom:12,
        maxBounds: new L.LatLngBounds(new L.LatLng(48.7, -68.1), new L.LatLng(49, -66.9))
    });

    map.map.setView(map.latlon,map.zoom);

    map.moveEffect = function(pActif){
        //set style after zoom
        var styleSetZoom = function() {
            setTimeout(function(){
                map.map.addLayer(geojsonLayer.layer);    
                if (pActif.layer != null) {
                    geojsonLayer.setHighlightStyle(pActif.layer);
                }else{
                    $.each(map.map._layers, function(index, value) {  
                        if (value.feature) {
                            geojsonLayer.setDefaultStyle(value);
                        };
                    });
                };
                map.move=false;
            },300);    
        };
        
        //set style if no zoom before
        var styleSet = function() {
            setTimeout(function(){
                if (pActif.layer != null) {
                    geojsonLayer.setHighlightStyle(pActif.layer);
                };
                map.move=false;
            },200);    
        };
        
        //move with effect
        var center = {
            center: map.map.getCenter(),
            zoom: map.map.getZoom()
        };

        var dz = pActif.zoom-center.zoom;
        
        var f=0.5;

        if ((center.zoom-15)>0){
            f=center.zoom-15;
        } else if (center.zoom-15<0){
            f=1/(-center.zoom+17);
        };
    
        var nMove = Math.round(((Math.sqrt((pActif.lon-center.center.lng)*(pActif.lon-center.center.lng)+(pActif.lat-center.center.lat)*(pActif.lat-center.center.lat)))*200*f));
        if (nMove > 10) {
            if (nMove > 100) {
                nMove =1;   
            };
            nMove = 10;
        };

        if (nMove<=1){
            map.map.panTo(new L.LatLng(pActif.lat,pActif.lon));
            if (dz!=0){
                map.map.removeLayer(geojsonLayer.layer);
                map.map.setZoom(pActif.zoom);
                styleSetZoom();
            }else{
                styleSet();
            };
        } else {
            var dx = ((pActif.lon-center.center.lng)/nMove);
            var dy = ((pActif.lat-center.center.lat)/nMove);

            map.map.panTo(new L.LatLng(dy+map.map.getCenter().lat,dx+map.map.getCenter().lng));    
            
            var move = function() {
                setTimeout(function(){
                    map.map.panTo(new L.LatLng(dy+map.map.getCenter().lat,dx+map.map.getCenter().lng));
                    if(map.iMapMove<nMove) {
                        map.iMapMove++;
                        move();
                    } else {
                        setTimeout(function(){
                            map.map.panTo(new L.LatLng(pActif.lat,pActif.lon));
                            if (dz!=0){
                                map.map.removeLayer(geojsonLayer.layer);
                                map.map.setZoom(pActif.zoom);
                                styleSetZoom();
                            }else{
                                styleSet();
                            };                                
                        },100);
                    };
                },100);
            };
            map.iMapMove=2;
            move();
        };
    };

    /*-------------------------------------------------------
                            LAYER
    -------------------------------------------------------*/
   // L.tileLayer('http://cartalib.mapgears.com/mapcache/tms/1.0.0/mgmap@g3857/{z}/{x}/{y}.png', {
    L.tileLayer('http://cartalibv2.mapgears.com/mapcache/tms/1.0.0/grayprint@g/{z}/{x}/{y}.png', {
        maxZoom: 18,
        tms: true,
        dragging: false,
        zoomAnimation:true
    }).addTo(map.map);


    /*-------------------------------------------------------
                            TRAJET
    -------------------------------------------------------*/
    $(".trajet, .trajet-pin").click(function(){
        map.trajet.show(map.geojsonLayer.selectedFeature);
    });

    map.trajet = {};
    map.trajet.show = function(feature){
        if (!map.trajet.json) {
            
            var myStyle = {
                "color": "#ff7800",
                "weight": 5,
                "opacity": 0.35
            };

            map.trajet.json = L.geoJson(feature.trajet, {
                style: myStyle
            }).addTo(map.map);
            
            $('.trajet').text('Cacher le trajet');
            $('#effect p a').text('Cacher le trajet');
        
            var depart = {
                lat: 48.85000,
                lon: -67.54910
            };
            
            var arrivee = {
                lat: feature.geometry.coordinates[1],
                lon: feature.geometry.coordinates[0]
            };

            if (depart.lat > arrivee.lat){
                depart.lat = depart.lat + 0.03;
                arrivee.lat = arrivee.lat - 0.03;
            } else {
                depart.lat = depart.lat - 0.03;
                arrivee.lat = arrivee.lat + 0.03;
            };

            if (depart.lon > depart.lon){
                depart.lon = depart.lon + 0.03;
                arrivee.lon = arrivee.lon - 0.03;
            } else {
                depart.lon = depart.lon - 0.03;
                arrivee.lon = arrivee.lon + 0.03;
            };
        
            var depart = new L.LatLng(depart.lat, depart.lon);
            var arrivee = new L.LatLng(arrivee.lat, arrivee.lon);
            var bounds = new L.LatLngBounds(depart, arrivee);
            map.map.fitBounds(bounds);   
        } else {
            $('.trajet').text('Montrer le trajet');
            $('#effect p a').text('Montrer le trajet');
            map.map.removeLayer(map.trajet.json);
            map.trajet.json = null;
        };
    };
    /*-------------------------------------------------------
                            GEOJSON
    -------------------------------------------------------*/
    map.geojsonLayer = {};
    var geojsonLayer = map.geojsonLayer;
    geojsonLayer.defaultStyle = {
        radius: 8,
        fillColor: "#00000",
        color: "#00000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.3

    };

    geojsonLayer.highlightStyle = {
        radius: 16,
        fillColor: "#00000",
        color: "#00000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };
    

    geojsonLayer.openInfoBox = function(feature){
            geojsonLayer.selectedFeature = feature;
            $( "#links" ).text("");
            if(feature.properties.facebook){
                $( "#links" ).append("<a target=\"_blank\" href="+feature.properties.facebook+"><img src=\"icons/facebook-icon.png\" width=\"24\" height=\"24\"></img></a>");
            };
            if(feature.properties.tripadvisor){
                $( "#links" ).append("<a target=\"_blank\" href="+feature.properties.tripadvisor+"><img src=\"icons/tripadvisor-icon.png\" width=\"24\" height=\"24\"></img></a>");
            };
            $( "#effect h2" ).text(feature.properties.name);
            $( "#effect p" ).text("");
            if(feature.trajet){
                $( "#effect p" ).append("<a href=\"#\" onclick=\"map.trajet.show(map.geojsonLayer.selectedFeature);\"><img src=\"icons/pin.png\" width=\"14\" height=\"22\"></img> Montrer le trajet</a>");
            };
            $( "#effect p" ).append(feature.properties.desc);
            
            
            /*$(".instagram").text("");
            var clientId = 'baee48560b984845974f6b85a07bf7d9';
            $(function() {
			  $(".instagram").instagram({
			  	//hash: 'matane',
			  	search: {
				  lat: 48.8445,
				  lng: -67.5305,
				  distance: 5000
				},
				show: 6,
				clientId: clientId
			  });
			});*/
			
            $( "#effect" ).show( 'fold', {}, 1000 );
    };

    geojsonLayer.setDefaultStyle = function(layer){ 
            if(layer.feature.properties.icon){
            var myIcon = L.icon({ 
                iconUrl: layer.feature.properties.icon.url,  
                iconSize: layer.feature.properties.icon.size
            });
            layer.setIcon(myIcon);
        } else {
            layer.setStyle(geojsonLayer.defaultStyle);
        };
     };    

    geojsonLayer.setHighlightStyle = function(layer){
        map.trajet.json = null;             
        if(layer.feature.properties.icon){
            var myIcon = L.icon({ 
                iconUrl: layer.feature.properties.icon.url,  
                iconSize: layer.feature.properties.icon.sizeSelected,
                className: "iconSelected"
            });
            layer.setIcon(myIcon);
            $('.iconSelected').css( "border-radius", layer.feature.properties.icon.sizeSelected[0]+"px");
        } else {
            layer.setStyle(geojsonLayer.highlightStyle);
        };
    };

    geojsonLayer.onEachFeature = function(feature, layer) {
        layer.on('click', function(feature) { 
            var feature = feature.target.feature;
            geojsonLayer.openInfoBox(feature);

               $.each(map.map._layers, function(index, value) {       
                if (value.feature) {
                   if (value.feature.properties.id == feature.properties.id){
                        geojsonLayer.setHighlightStyle(value);
                        scroll.jsonMoveTo(value.feature.properties.id);
                    } else {
                        geojsonLayer.setDefaultStyle(value);
                    };
                };
            });
        });
    };
    
    geojsonLayer.layer = L.geoJson(geojson, {
        pointToLayer: function (feature, latlng) {
            if(feature.properties.icon){
                var myIcon = L.icon({ 
                    iconUrl: feature.properties.icon.url,  
                    iconSize: feature.properties.icon.size
                });
                return L.marker(latlng, {icon: myIcon})    
            };
            return L.circleMarker(latlng, geojsonLayer.defaultStyle);
        },
        onEachFeature: geojsonLayer.onEachFeature
    }).addTo(map.map);
    

    /*-------------------------------------------------------
                            Scroll
    -------------------------------------------------------*/
    $('#list_section').focus();
    var scroll={
        timeoutScroll: null,
        timeoutActive: null,
        move:false,
        nSection:($('section').length-1)
    };    
    scroll.h = ($('#list_section').prop('scrollHeight')-$('#list_section').prop('clientHeight'))/scroll.nSection;

    scroll.jsonMoveTo = function(id) {
        $('.trajet').text('Montrer le trajet');
        map.trajet.json = null;
        var y;        
        $.each($('section'), function(index, value) {
            if (value.id == id) {
                y = scroll.h*(index-1)+(scroll.h/3);
            };
        });
        scroll.scrollBind.unbind();
        if (scroll.move==true) {
            $('#list_section').stop();
            clearTimeout(scroll.timeoutScroll);
            clearTimeout(scroll.timeoutActive);
            scroll.move=false;
            $('#list_section').animate({
                scrollTop: y
            }, 0);
            $('.active').removeClass('active');
            $('#'+id).addClass("active");
            setTimeout(function(){
                scroll.scrollBind = $('#list_section').scroll(function(){ 
                    scroll.scrollDetect();
                });
            }, 1);
        } else {
            scroll.move=true;
            $('#list_section').animate({
                scrollTop: y
            }, 1800);

            scroll.timeoutActive=setTimeout(function(){
                $('.active').removeClass('active');
                $('#'+id).addClass("active");
            }, 1000);
            scroll.timeoutScroll=setTimeout(function(){
                scroll.scrollBind = $('#list_section').scroll(function(){ 
                    scroll.scrollDetect();
                });
                scroll.move=false;
            }, 2000);
        };
    };

    scroll.setActive = function(id) {
        $('.trajet').text('Montrer le trajet');   
        map.trajet.json = null;
        map.move=true;

        $( "#effect" ).hide( 'fold', {}, 1000);
            
        $('.active').removeClass('active');
        $('#'+id).addClass("active");

        var pActif = {
            lat: map.latlon[0],
            lon: map.latlon[1],
            zoom: map.zoom,
            layer: null
        };

        $.each(map.map._layers, function(index, value) {  
            if (value.feature) {
               if (value.feature.properties.id == $('.active')[0].id){
                    pActif.lat = value.feature.geometry.coordinates[1];
                    pActif.lon = value.feature.geometry.coordinates[0];
                    pActif.zoom = value.feature.properties.zoom; 
                    pActif.layer = value;    
                } else {
                    geojsonLayer.setDefaultStyle(value);
                };
            };
        });    
    
        if((id == 'rafiot' || id == 'riotel') && pActif.layer != null) {
            geojsonLayer.openInfoBox(pActif.layer.feature);
        };    
        if(pActif.layer != null) {
            geojsonLayer.selectedFeature = pActif.layer.feature;
        };
        map.moveEffect(pActif);
        
        return true;
    };

    scroll.scrollBind = $('#list_section').scroll(function(){ 
        scroll.scrollDetect();
    });
    
    scroll.scrollDetect = function(){
        var y=$('#list_section').scrollTop();
        
        if (y == 0) return scroll.setActive($('section')[0].id);
        if (y >= (scroll.nSection-1) * scroll.h) return scroll.setActive($('section')[scroll.nSection].id);

        var index = Math.round((y/scroll.h)+0.7);
        //Do nothing if already active
        if($('section')[index].id != $('.active')[0].id){
            if (map.move==true) {
                map.iMapMove = 999;
                setTimeout(function(){scroll.scrollDetect();},200);
            }else{
                return scroll.setActive($('section')[index].id);
            };
        };
        return true;
    };


    $("section").on('click',function() {
        if (map.move==true) {
            map.iMapMove = 999;
            setTimeout(function(){scroll.scrollDetect();},200);
        } else {
            if(this.id != $('.active')[0].id){
                scroll.jsonMoveTo(this.id);     
                scroll.setActive(this.id);
            };
        };
    });
    
    /*-------------------------------------------------------
                      Close BOX
    -------------------------------------------------------*/
    $(document).on('click','.close_box',function(){
        $( "#effect" ).hide( 'fold', {}, 1000);
    });

    /*-------------------------------------------------------
                      Flickr
    -------------------------------------------------------*/
     $("#flickr-img").on('click',function() {
        //if($("#flickr a").length==0){
        page = 1;
        $('#flickr-before').show().css({ opacity: 0.3 });
        $('#flickr-after').show()
        getFlickr(1);
       // };
        $(function() {
            $( "#diporama" ).dialog({
                modal: true,
                height: 330,
                width: 720
            });
        });
    });

    /*-------------------------------------------------------
                      Avertissement
    -------------------------------------------------------*/    
    $(function() {
        $( "#diporama" ).dialog({
            modal: true,
            height: 'auto',
            width: 720
        });
    });
    
    $("#flickr-close").bind('click',function() {
        $( "#diporama" ).dialog( "close" );
    });

    $('#diporama').on('dialogclose',function() {
        $('#avertissement').remove();
    });
});
