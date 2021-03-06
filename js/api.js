/* ANALYSIS */

var video_thumbnails_lst = [];
var twitter_url = "https://twitter.com/search";
var tw_json = "";
var google_reverse_search_urls = [];
var yandex_reverse_search_urls = [];

/* Detect http link and make hyperlink */
function urlify(text) {
    if (text){
        var urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.replace(urlRegex, function(url) {
            return '<a href="' + url + '" target="_blank">' + url + '</a>';
        })
    }
    return "";
}

/*Create a title in the div argument*/
function makeTitle(title, div){
    h3 = document.createElement("h3");
    h3.innerHTML = title;
    div.appendChild(h3);
}

/*Create table: 
left column: name
right column: key value from json file*/
function make_table(json, key_lst, name_lst){
    var table = document.createElement("table");
    for (var index in key_lst){
        var tr = document.createElement("tr");
        var th = document.createElement("th");
        var td = document.createElement("td");
        th.innerHTML = name_lst[index];
        var content = json[key_lst[index]];
        content = (Array.isArray(content)) ? content.join("\n") : String(content);
        td.innerHTML = urlify(content);
        tr.appendChild(th);
        tr.appendChild(td);
        table.appendChild(tr);
    }
    return table
}

/* Update table created by the previous function */
function updateTable(json, key_lst, table)
{
    var list = table.getElementsByTagName("td");
    for (var index = 0; index < list.length; index++) {
        if (json[key_lst[index]]) {
            var content = json[key_lst[index]];
            content = (Array.isArray(content)) ? content.join("\n") : String(content);
            list[index].innerHTML = urlify(content);
        }
    }
}

function createTimeRow(title, time) {
    var regex = /(.*), (.*) \(?UTC\)?/;
    var row = makeRowTable(title, time);
    if (regex.test(time)) {
        var date_and_time = time.match(regex);
        var url = "http://www.timeanddate.com/worldclock/converter.html?iso=";
        var query = url + date_and_time[1].replace(/-/g, "") + "T" + date_and_time[2].replace(/:/g, "");
        var td = row.lastElementChild;
        appendLink(td, query, "<br>Convert to local time");
        td.lastElementChild.setAttribute("target", "_blank");
    }
    return row;
}

function updateTimeRow(table, nb, val) {
    var row = table.getElementsByTagName("tr")[nb];
    if (row.lastElementChild.innerHTML == "") {
        $(row).replaceWith(createTimeRow(row.firstElementChild.innerHTML, val));
    }
}

/* Diplay buttons "verification comments" and "maps"*/
function displayButtons(verif_number, locations, not_yt){
    var verif = document.getElementById("verif-content");
    var maps = document.getElementById("maps-content");
    var google = document.getElementById("google_search_btn");
    var yandex = document.getElementById("yandex_search_btn");
    var tineye = document.getElementById("tineye_search_btn")
    //var timeline = document.getElementById("twitter-shares-content");
    var twitter = document.getElementById("twitter_search_btn");
    if (verif_number == "0"){
        verif.setAttribute("style", "display: none;");
    } else {
        verif.setAttribute("style", "display: block;");
    }
    if (!locations || locations.length == 0){
        maps.setAttribute("style", "display: none;");
    } else {
        maps.setAttribute("style", "display: block;");
    }
    if (not_yt)
        twitter.setAttribute("style", "display: none;");
    //timeline.setAttribute("style", "");
    google.setAttribute("style", "");
    yandex.setAttribute("style", "");
    tineye.setAttribute("style", "");
}

function hideButtons() {
    var buttons_id = [ "verif-content", "maps-content", "google_search_btn", "yandex_search_btn",
        "twitter-shares-content", "twitter_search_btn", "tineye_search_btn"
    ]
    for (id of buttons_id) {
        document.getElementById(id).setAttribute("style", "display: none");
    }
}

/* Place verification comments */
function placeComments(analysis_json){
    cleanElement("place-comments");
    var div = document.getElementById("place-comments");
    var video_comments = analysis_json.video_comments;
    var video_author_comments = analysis_json.video_author_comments;
    var video_author_url_comments = analysis_json.video_author_url_comments
    var video_publishedAt_comments = analysis_json.video_publishedAt_comments;
    var verification_comments = analysis_json.verification_comments;
    for(var count in video_comments) {
        index = verification_comments.indexOf(video_comments[count]);
        if (index != -1){
            var elem = document.createElement("p");
            elem.setAttribute("class", "comment");
            var author_head = '<a href="'+video_author_url_comments[count]+'"><strong>'+video_author_comments[count]+'</strong></a>'+" at <strong>" + video_publishedAt_comments[count] +"</strong>:<br>";
            elem.innerHTML = author_head + video_comments[count];
            div.appendChild(elem);
        }
    }
}

/* Thumbnails clickable */
/* Send to magnifier tab */
function activeThumbnail(thumbnails_id){
    // constants
    var SHOW_CLASS = 'show',
    HIDE_CLASS = 'hide',
    ACTIVE_CLASS = 'active';

    /* Change to magnifier tab */
    $( '#'+ thumbnails_id ).on( 'click', 'a', function(e){
        e.preventDefault();
        var $tab = $( this ),
        href = $tab.attr( 'href' );

        $( '.active' ).removeClass( ACTIVE_CLASS );
        $( '#magnifier_tab' ).addClass( ACTIVE_CLASS );

        $( '.show' )                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   
        .removeClass( SHOW_CLASS )
        .addClass( HIDE_CLASS )
        .hide();

        $(href)
        .removeClass( HIDE_CLASS )
        .addClass( SHOW_CLASS )
        .hide()
        .fadeIn( 550 );

        var url_img = $tab.children()[0].src;
        callMagnifier(url_img);
    });
}

/* Create Carousel html*/
function buildCarousel(carousel_id, thumbnails_id){
    var div = document.getElementById(carousel_id);
    var jssor1 = document.createElement("div");
    jssor1.setAttribute("id", "jssor_1");
    jssor1.setAttribute("style", "position:relative;margin:0 auto;top:0px;left:0px;width:800px;height:200px;overflow:hidden;visibility:hidden;background-color: #000000;");
    /* Loading div */
    var loading = document.createElement("div");
    loading.setAttribute("data-u", "loading");
    loading.setAttribute("style", "position:absolute;top:0px;left:0px;background-color:rgba(0,0,0,0.7);");
    var loading1 = document.createElement("div");
    loading1.setAttribute("style", "filter: alpha(opacity=70); opacity: 0.7; position: absolute; display: block; top: 0px; left: 0px; width: 100%; height: 100%;");
    var loading2 = document.createElement("div");
    loading2.setAttribute("style", "position:absolute;display:block;background:url('img/loading.gif') no-repeat center center;top:0px;left:0px;width:100%;height:100%;");
    loading.appendChild(loading1);
    loading.appendChild(loading2);
    jssor1.appendChild(loading);
    /* Thumbnails div */
    var thumb_div = document.createElement("div");
    thumb_div.setAttribute("id", thumbnails_id);
    thumb_div.setAttribute("data-u", "slides");
    thumb_div.setAttribute("style", "cursor:default;position:relative;top:25px;left:100px;width:600px;height:150px;overflow:hidden");
    jssor1.appendChild(thumb_div);
    /* Bullet Navigator */
    var b_navigator = document.createElement("div");
    b_navigator.setAttribute("data-u", "navigator");
    b_navigator.setAttribute("class", "jssorb03");
    b_navigator.setAttribute("style", "bottom:10px;right:10px;");
    var b_navigator1 = document.createElement("div");
    b_navigator1.setAttribute("data-u", "prototype");
    b_navigator1.setAttribute("style", "width:21px;height:21px;");
    var b_navigator2 = document.createElement("div");
    b_navigator2.setAttribute("data-u", "numbertemplate");
    b_navigator1.appendChild(b_navigator2);
    b_navigator.appendChild(b_navigator1);
    jssor1.appendChild(b_navigator);
    /*Arrow Navigator */
    var arrowleft = document.createElement("span");
    arrowleft.setAttribute("data-u", "arrowleft");
    arrowleft.setAttribute("class", "jssora03l");
    arrowleft.setAttribute("style", "top:0px;left:8px;width:55px;height:55px;");
    arrowleft.setAttribute("data-autocenter", "2");
    var arrowright = document.createElement("span");
    arrowright.setAttribute("data-u", "arrowright");
    arrowright.setAttribute("class", "jssora03r");
    arrowright.setAttribute("style", "top:0px;right:8px;width:55px;height:55px;");
    arrowright.setAttribute("data-autocenter", "2");
    jssor1.appendChild(arrowleft);
    jssor1.appendChild(arrowright);
    div.appendChild(jssor1);
}

/* Display or hide real size Thumbnail image */
function activePreview(){
    $(".mouse-preview").on(
    {
        mouseenter: function() 
        {
            var id = $(this).attr("name");
            var img = document.getElementById(id);
            img.style.display = "";
        },
        mouseleave: function()
        {
            var id = $(this).attr("name");
            var img = document.getElementById(id);
            img.style.display = "none";
        }
    });

}

/* place Thumbnails in the carousel */
function placeImages(carousel_id, thumbnails_id, preview_id, img_list){
    cleanElement(carousel_id);
    cleanElement(preview_id);
    buildCarousel(carousel_id, thumbnails_id);
    var prev = document.getElementById(preview_id);
    var div = document.getElementById(thumbnails_id);
    for (var count in img_list){
        //if (img_list[count].match(/https:\/\/i\.ytimg\.com\/*/) && !img_list[count].match(/maxresdefault\.jpg$/))
        //    continue;
        var id = "thumb-" + count;
        var div1 = document.createElement("div");
        var a = document.createElement("a");
        a.setAttribute("href", "#magnifier");
        a.setAttribute("name", id);
        a.setAttribute("class", "mouse-preview");
        var elem = document.createElement("img");
        elem.setAttribute("src", img_list[count]);
        elem.setAttribute("style", "max-height: 150px; max-width: 200px;");
        a.appendChild(elem);
        div1.appendChild(a);
        div.appendChild(div1);
        /*Add img preview*/
        var img = document.createElement("img");
        img.setAttribute("id", id);
        img.setAttribute("src", img_list[count]);
        img.setAttribute("style", "display: none; position: fixed; top: 0%; right: 0%; max-height: 250px;");
        prev.appendChild(img);
    }
    /* Thumbnails onclick */
    activeThumbnail(thumbnails_id);
    /* Preview onmouseover */
    activePreview();
    /* Active carousel */
    jssor_1_slider_init();

}

/* Create the google maps and and search Box*/
function createGoogleMaps(){
    var mapOptions = {
        center: new google.maps.LatLng(0, 0),
        zoom: 10,
        mapTypeId: google.maps.MapTypeId.HYBRID
    }
    var map = new google.maps.Map(document.getElementById("map"), mapOptions);

    /* get Current Location if possible */
     if (navigator.geolocation) {
     navigator.geolocation.getCurrentPosition(function (position) {
         initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
         map.setCenter(initialLocation);
     });
 }

// Create the search box and link it to the UI element.
  var input = document.getElementById('pac-input');
  var searchBox = new google.maps.places.SearchBox(input);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  var submit = document.getElementById("pac-button");
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(submit);
  submit.addEventListener("click", function(){
      if(searchBox){
         searchBox.focus();
        google.maps.event.trigger(input, 'keydown', { keyCode: 13 });
    }
  })

  // Bias the SearchBox results towards current map's viewport.
  map.addListener('bounds_changed', function() {
    searchBox.setBounds(map.getBounds());
  });

  var markers = [];
  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  searchBox.addListener('places_changed', function() {
    var places = searchBox.getPlaces();

    if (places.length == 0) {
      return;
    }

    // Clear out the old markers.
    markers.forEach(function(marker) {
      marker.setMap(null);
    });
    markers = [];

    // For each place, get the icon, name and location.
    var bounds = new google.maps.LatLngBounds();
    places.forEach(function(place) {
      var icon = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25)
      };

      // Create a marker for each place.
      markers.push(new google.maps.Marker({
        map: map,
        icon: icon,
        title: place.name,
        position: place.geometry.location
      }));

      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    map.fitBounds(bounds);
  });

}

/* change SearchBox value and submit it to the google map */
function updateMap(places){
    if (places != []){
        var searchBox = document.getElementById("pac-input");
        if(searchBox){
            searchBox.value =places;
            searchBox.focus();
            google.maps.event.trigger(searchBox, 'keydown', { keyCode: 13 });
        }
    }
}

/* update the map with current search box value (correct display none bug)*/
function triggerMap(){
    var searchBox = document.getElementById("pac-input");
    if(searchBox){
        searchBox.focus();
        google.maps.event.trigger(searchBox, 'keydown', { keyCode: 13 });
    }
}

var jsonTitleTableApi = {
    youtube: {
        en: {
            video: {
                title: "Video:",
                name1: ["Video title", "Video description"],
                name2: ["Video view count", "Like count", "Dislike count", "Duration", "Licensed content", "Description mentioned locations", "Recording location description", "Upload time"]
            },
            channel:{
                title: "Channel:",
                name: ["Channel description", "Channel created time", "Channel view count", "Channel page", "Channel location"]
            },
            comment: {
                title: "Comments",
                name: ["Video comment count", "Number verification comments"]
            }
        },
        fr:{
            video: {
                title: "Video:",
                name1: ["Titre de la vidéo", "Description de la vidéo"],
                name2: ["Nombre de vue", "Nombre de \"j'aime\"", "Nombre de \"je n'aime pas\"", "Durée", "Contenu sous license", "Localisations mentionnés dans la description", "Description de la localisation de l'enregistrement", "Date de mise en ligne"]
            },
            channel: {
                title: "Chaine:",
                name: ["Description de la chaine", "Date de la création de la chaine", "Nombre de vue de la chaine", "Page de la chaine", "Localisation de la chaine"]
            },
            comment: {
                title: "Commentaires:",
                name: ["Nombre de commentaire de la vidéo", "Nombre de commentaires vérifiés"]
            }
        }
    },
    facebook: {
        en: {
            video: {
                title: "Video:",
                name: ["Video id", "Video title", "Duration", "Content category", "Content tags", "Video description", "Like count", "Updated time", "Created time"]
            },
            page: {
                title: "Page:",
                name: ["Page", "About", "Verified account", "Category", "Link", "Fan count", "Description", "Location city", "Location country", "Website"]
            },
            comment: {
                title: "Comments",
                name: ["Video comment count", "Number verification comments"]
            }
        },
        fr: {
            video: {
                title: "Video:",
                name: ["Identifiant de la vidéo", "Titre de la vidéo", "Durée", "Catégorie du contenu", "Tag du contenu", "Description de la vidéo", "Nombre de \"j'aime\"", "Date de mise en ligne", "Date de création"]
            },
            page: {
                title: "Page:",
                name: ["Page", "A propos", "Compte vérifié", "Catégorie", "Lien", "Nombre de fan", "Description", "Ville", "Pays", "Site web"]
            },
            comment: {
                title: "Commentaires",
                name: ["Nombre de commentaire de la vidéo", "Nombre de commentaires vérifiés"]
            }
        }
    },
    twitter: {
        en: {
            video: {
                title:"Video",
                name: ["Identifiant", "Content", "Origin", "Likes count", "Retweets count", "Hashtags", "Urls included", "Mentionned by", "Language", "Thumbnail", "Size", "Duration", "Locations mentioned", "Created", "Video"]
            },
            user: {
                title: "user",
                name: ["Name", "Screen name", "Location", "Profile", "Description", "Protected user", "Verified user", "Followers", "Friends", "Lists", "Tweets liked", "Tweets count", "Created", "User language", "Locations mentioned", "Date de création", "Vidéo"]
            }/*,
            comment: {
                title: "Replies",
                name: ["Retweets count"]
            }*/
        },
        fr: {
            video: {
                title:"Vidéo",
                name: ["Identifiant", "Contenu", "Origine", "Nombre de \"J'aime\"", "Nombre de retweets", "Hashtags", "Urls incluses", "Mentionné par", "Langue", "Imagette", "Taille", "Durée", "Localisations mentionnées", "Date de création", "Vidéo"]
            },
            user: {
                title: "Utilisateur",
                name: ["Nom", "Pseudonyme", "Localisation", "Profil", "Description", "Utilisateur protégé", "Utilisateur vérifié", "Nombre de personne qui le suivent", "Nombre d'amis", "Lists", "Tweets \"aimé\"", "Nombre de tweet", "Date de création", "Langue de l'utilisateur", "Localisations mentionées"]
            }/*,
            comment: {
                title: "Réponse",
                name: ["Nombre de réponse"]
            }*/
        }
    }
}

var analysisType = "";

/* Parse the YouTube json */
function parseYTJson(json){
    /* bool value */
    var hasPlaceComments;
    var hasUpdateMap;
    var hasPlaceImages;
    var hasDisplayButtons;

    /* List of indexes */
    var key_list_video_a = ["video_title", "video_description"];
    var key_list_video_b = ["video_view_count", "video_like_count", "video_dislike_count", "video_duration", "video_licensed_content", "video_description_mentioned_locations", "video_recording_location_description"];
    var key_list_channel = ["channel_description", "channel_created_time", "channel_view_count", "channel_url", "channel_location"];
    var key_list_comment = ["video_comment_count", "num_verification_comments"];
    var jsonName = jsonTitleTableApi["youtube"][global_language];

    function start(json) {
        /* Video Infos*/
        var div = document.getElementById("place-table");
        /*Video table*/
        makeTitle(jsonName.video.title, div);
        var table = make_table(json, key_list_video_a, jsonName.video.name1);
        div.appendChild(table);
        div.appendChild(document.createElement("br"));
        table = make_table(json, key_list_video_b, jsonName.video.name2);
        var index = key_list_video_b.length;
        var rowTime = createTimeRow(jsonName.video.name2[index++], json["video_upload_time"]);
        table.appendChild(rowTime);
        div.appendChild(table);
        /*Channel table*/
        makeTitle(jsonName.channel.title, div);
        table = make_table(json, key_list_channel, jsonName.channel.name);
        div.appendChild(table);
        /* Comments*/
        makeTitle(jsonName.comment.title, div);
        table = make_table(json, key_list_comment, jsonName.comment.name);
        div.appendChild(table);

        /* Init variable */
        hasPlaceComments = false;
        hasUpdateMap = false;
        hasPlaceImages = false;
        video_thumbnails_lst = [];
        google_reverse_search_urls = [];
        yandex_reverse_search_urls = [];
        twitter_url = "";
        document.getElementById("twitter_search_btn").setAttribute("style", "display: none;");
        hasDisplayButtons = false;
    }

    function update(json) {
        var tables = document.getElementById("place-table").getElementsByTagName("table");
        /*Video table*/
        updateTable(json, key_list_video_a, tables[0]);
        updateTable(json, key_list_video_b, tables[1]);
        var index = key_list_video_b.length;
        updateTimeRow(tables[1], index++, json["video_upload_time"]);
        /*Channel table*/
        updateTable(json, key_list_channel, tables[2]);
        /* Comments*/
        updateTable(json, key_list_comment, tables[3]);
    }

    if (!document.getElementById("place-table").hasChildNodes())
        start(json);
    else
        update(json);

    /* Place verification comments */
    if (!hasPlaceComments && json.processing_status == "done")
    {
        placeComments(json);
        hasPlaceComments = true;
    }
    /* Update map*/
    if (!hasUpdateMap && json.video_description_mentioned_locations) {
        updateMap(json.video_description_mentioned_locations);
        hasUpdateMap = true;
    }

    if (!hasPlaceImages && json.video_thumbnails) {
        /* Place thumbnails */
        placeImages("place-carousel", "place-thumbnails", "place-preview", json.video_thumbnails);
        hasPlaceImages = true;
        /* Update reverse search button */
        video_thumbnails_lst = json.video_thumbnails;
        google_reverse_search_urls = json.reverse_image_thumbnails_search_url_google;
        yandex_reverse_search_urls = json.reverse_image_thumbnails_search_url_yandex;
    }
    /* Update Twitter search button */
    if (json.twitter_search_url && twitter_url == "")
    {
        twitter_url = json.twitter_search_url;
        document.getElementById("twitter_search_btn").setAttribute("style", "");
    }
    /* Display buttons*/
    if (!hasDisplayButtons && (json.processing_status == "done" || (json.num_verification_comments && json.video_description_mentioned_locations))) {
        displayButtons(json.num_verification_comments, json.video_description_mentioned_locations, false);
        hasDisplayButtons = true;
    }
}


/*Parse the Facebook Json*/
function parseFBJson(json){
    /* booleans values */
    var hasPlaceImages;
    var hasPlaceComments;
    var hasDisplayButtons;
    var hasUpdateMap;

    /* List of indexes */
    var key_list_video = ["video_id", "title", "length", "content_category", "content_tags", "video_description", "video_likes"];
    var key_list_from = ["from", "from_about", "from_is_verified", "from_category", "from_link", "from_fan_count", "from_description", "from_location_city", "from_location_country", "from_website"];
    var key_list_count = ["total_comment_count", "num_verification_comments"];
    var arrayTitle = jsonTitleTableApi["facebook"][global_language];

    function start(json) {
        /* Video Infos*/
        var div = document.getElementById("place-table")
        /*Video table*/
        makeTitle(arrayTitle.video.title, div);
        var table = make_table(json, key_list_video, arrayTitle.video.name);
        var index = key_list_video.length;
        var rowTime = createTimeRow(arrayTitle.video.name[index++], json["updated_time"]);
        table.appendChild(rowTime);
        rowTime = createTimeRow(arrayTitle.video.name[index++], json["created_time"]);
        table.appendChild(rowTime);
        div.appendChild(table);
        /*Page table*/
        makeTitle(arrayTitle.page.title, div);
        table = make_table(json, key_list_from, arrayTitle.page.name);
        div.appendChild(table);
        /* Comments */
        makeTitle(arrayTitle.comment.title, div);
        table = make_table(json, key_list_count, arrayTitle.comment.name);
        div.appendChild(table);
        hasPlaceImages = false;
        hasPlaceComments = false;
        hasDisplayButtons = false;
        hasUpdateMap = false;
        google_reverse_search_urls = [];
        yandex_reverse_search_urls = [];
    }

    function update(json) {
        var tables = document.getElementById("place-table").getElementsByTagName("table");
        /*Video table*/
        updateTable(json, key_list_video, tables[0]);
        var index = key_list_video.length;
        updateTimeRow(tables[0], index++, json["updated_time"]);
        updateTimeRow(tables[0], index++, json["created_time"]);
        /*Page table*/
        updateTable(json, key_list_from, tables[1]);
        /* Comments */
        updateTable(json, key_list_count, tables[2]);
    }

    if (!document.getElementById("place-table").hasChildNodes())
        start(json);
    else
        update(json);

    /* Place thumbnails */
    if (!hasPlaceImages && json.video_thumbnails) {
        placeImages("place-carousel", "place-thumbnails", "place-preview", json.video_thumbnails);
        hasPlaceImages = true;
    }
    /* Place verification comments */
    if (!hasPlaceComments && json.processing_status == "done") {
        placeComments(json);
        hasPlaceComments = true;
    }
    /* Update reverse search buttons */
    video_thumbnails_lst = json.video_thumbnails;
    google_reverse_search_urls = json.reverse_image_thumbnails_search_url_google;
    yandex_reverse_search_urls = json.reverse_image_thumbnails_search_url_yandex;
    /*Display buttons*/
    if (!hasDisplayButtons && (json.processing_status == 'done' || (json.num_verification_comments && json.video_description_mentioned_locations))) {
        displayButtons(json.num_verification_comments, json.video_description_mentioned_locations, true);
        hasDisplayButtons = true;
    }

    /* Update map*/
    if (!hasUpdateMap && json.video_description_mentioned_locations) {
        updateMap(json.video_description_mentioned_locations);
        hasUpdateMap = true;
    }
}

/*Parse the Twitter Json*/
function parseTWJson(json){
    /* booleans values */
    var hasPlaceImages;
    // var hasPlaceComments; when verified comments added by iti
    var hasDisplayButtons;
    var hasUpdateMapText;
    var hasUpdateMapDesc;

    /* List of indexes */
    var key_list_video = ["id_str", "full_text", "source",  "favorite_count", "retweet_count", "hashtags", "urls", "user_mentions", "lang", "media_url", "video_info_aspect_ratio", "video_info_duration", "tweet_text_mentioned_locations"];
    var key_list_user = ["user_name", "user_screen_name", "user_location", "user_url", "user_description", "user_protected", "user_verified", "user_followers_count", "user_friends_count", "user_listed_count", "user_favourites_count", "user_statuses_count", "user_created_at", "user_lang", "user_description_mentioned_locations"];
    /*var key_list_comment = ["retweet_count"];*/
    var arrayTitle = jsonTitleTableApi["twitter"][global_language];

    function chooseVideoUrl(urls) {
        var max = 0;
        var res = urls[0];
        for (var url of urls) {
            var regex = /\/([0-9])+x([0-9])+/;
            if (regex.test(url)) {
                var matches = url.match(regex);
                var current = matches[1] * matches[2];
                if (current > max) {
                    max = current
                    td.innerHTML = url;
                }
            }
        }
        return res;
    }

    function start(json) {
        /* Video Infos*/
        var div = document.getElementById("place-table")
        /*Video table*/
        makeTitle(arrayTitle.video.title, div);
        var table = make_table(json, key_list_video, arrayTitle.video.name);
        var index = key_list_video.length;
        var rowTime = createTimeRow(arrayTitle.video.name[index++], json["created_at"]);
        table.appendChild(rowTime);
        var urls = json["video_info_url"];
        var row = makeRowTable(arrayTitle.video.name[index++], urlify(chooseVideoUrl(urls)));
        table.appendChild(row);
        div.appendChild(table);
        
        /*Page table*/
        makeTitle(arrayTitle.user.title, div);
        table = make_table(json, key_list_user, arrayTitle.user.name);
        div.appendChild(table);
        /* Comments */
        /*makeTitle("Retweets:", div);
        table = make_table(json, key_list_comment, name_list_comment); when verified comments added by iti
        div.appendChild(table);*/
        hasPlaceImages = false;
        google_reverse_search_urls = [];
        yandex_reverse_search_urls = [];
        // hasPlaceComments = false; when verified comments added by iti
        hasDisplayButtons = false;
        hasUpdateMapText = false;
        hasUpdateMapDesc = false;
    }

    function update(json) {
        var tables = document.getElementById("place-table").getElementsByTagName("table");
        /*Video table*/
        updateTable(json, key_list_video, tables[0]);
        var index = key_list_video.length;
        updateTimeRow(tables[0], index++, json["created_at"]);
        /*Page table*/
        updateTable(json, key_list_user, tables[1]);
        /* Comments */
        //updateTable(json, key_list_comment, tables[2]); when verified comments added by iti
    }

    if (!document.getElementById("place-table").hasChildNodes())
        start(json);
    else
        update(json);

    /* Place thumbnails */
    if (!hasPlaceImages && json.user_profile_image_url_https_original) {
        placeImages("place-carousel", "place-thumbnails", "place-preview", [json.user_profile_image_url_https_original]);
        hasPlaceImages = true;
    }

    /* Update reverse search buttons */
    video_thumbnails_lst = json.user_profile_image_url_https_original;
    google_reverse_search_urls = json.reverse_image_thumbnails_search_url_google;
    yandex_reverse_search_urls = json.reverse_image_thumbnails_search_url_yandex;

    /* Display buttons */
    if (!hasDisplayButtons && (json.processing_status == 'done' || (json.tweet_text_mentioned_locations.length && json.user_description_mentioned_locations.length))) {
        var tmp = [];
        if (json.user_description_mentioned_locations.length || json.tweet_text_mentioned_locations.length)
            tmp.push("");
        displayButtons(0/*json.num_verification_comments when added by iti*/, tmp, true);
        hasDisplayButtons = true;
    }

    /* Update map*/
    if ((!hasUpdateMapText && json.tweet_text_mentioned_locations.length) || (!hasUpdateMapDesc && json.user_description_mentioned_locations.length)) {
        var tmp = [];
        if (json.tweet_text_mentioned_locations) {
            tmp = tmp.concat(json.tweet_text_mentioned_locations);
            hasUpdateMapText = true;
        }
        if (json.user_description_mentioned_locations) {
            tmp = tmp.concat(json.user_description_mentioned_locations);
            hasUpdateMapDesc = true;
        }
        updateMap(tmp);
        hasUpdateMap = true;
    }

    // when verified comments added by iti
    // /* Place verification comments */
    // if (!hasPlaceComments && json.processing_status == "done") {
    //     placeComments(json);
    //     hasPlaceComments = true;
    // }

    
}

var analysisUrls = {};

/* Send requests for video analysis*/
function video_api_analysis(video_url, isProcess){
    cleanElement("fb-content");
    document.getElementById("fb-content").style.display = "none";
    var analysis_url = "http://caa.iti.gr/verify_videoV2?url=" + video_url;
    if (isProcess)
        analysis_url += "&reprocess=1"
    loaded_tw = false;
    document.getElementById("loader").style.display = "block";
    document.getElementById("api-content").style.display = "none";
    var response_done = false;

    /* return the error message for the error which occur */
    function get_error_message(err) {
        switch (err) {
            case "ERROR3":
            case "ERROR4":
                return "Sorry but we cannot process this video link";
            case "ERROR2":
                return "This is a wrong url. Please check it and try again.";
            case "share":
                return "An error occured with the reception of Twitter shares.";
            case "ERROR5":
                return "No video found in this tweet";
            default:
                return "There were an error while trying to process this video. Please check the link and try again.";
        }
    }

    /* Get response every 2 second until process done */
    function parse_response(data, url, callback) {
        if (analysisUrls.response != url)
            return;
        callback(data);
        if (data["processing_status"] != "done")
        {
            $.getJSON(url, function(data) {
                setTimeout(function() {
                    parse_response(data, url, callback)
                }, 2000);
            }).fail(function( jqxhr, textStatus, error ) {
                console.error("parse_response : " + url);
                console.error(textStatus + ", " + error);
                request_fail(get_error_message(""));
            });
        }
        else {
            response_done = true;
            document.getElementById("loader").style.display = "none";
        }
    }

    function request_fail(msg) {
        document.getElementById("api-content").style.display = "none";
        document.getElementById("loader").style.display = "none";
        document.getElementById("loader_tw").style.display = "none";
        var errorElement = document.getElementById("error-content");
        errorElement.innerHTML = msg;
        errorElement.style.display = "block";
    }

    function share_fail(msg) {
        document.getElementById("loader_tw").style.display = "none";
        document.getElementById("verif-content").style.display = "none";
        document.getElementById("twitter-shares-content").style.display = "none";
        var errorElement = document.getElementById("error-content-share");
        errorElement.innerHTML = msg;
        errorElement.style.display = "block";
    }

    /* Start Analysis */
    analysisUrls.submit = analysis_url;
    $.getJSON(analysis_url, function(data) {
        document.getElementById("api-content").style.display = "block";
        /* Error Gestion */
        if (data["status"].startsWith("ERROR"))
        {
            console.error("error return : " + analysis_url);
            console.error(data["message"]);
            request_fail(get_error_message(data["status"]));
            return;
        }
        $.getJSON(analysis_url, function(data) {
            /* Analysis Response */
            var url;
            var callback;
            if (data["youtube_response"] !== undefined)
            { // YouTube
                url = data["youtube_response"];
                callback = parseYTJson;
                analysisType = "youtube";
            }
            else if (data["facebook_response"] !== undefined)
            { // Facebook
                url = data["facebook_response"];
                callback = parseFBJson;
                analysisType = "facebook";
            }
            else 
            { // Twitter
                url = data["twitter_response"];
                callback = parseTWJson;
                analysisType = "twitter";
            }
            analysisUrls.response = url;
            $.getJSON(url, function(data) {
                parse_response(data, url, callback);
            }).fail(function(jqxhr, textStatus, error) {
                console.error("start response : " + url);
                console.error(textStatus + ", " + error);
                request_fail(get_error_message(""));
            })
            /* Twitter Part response */
            var url_twitter = data["twitter_shares"];
            analysisUrls.tweets = url_twitter;
            $.getJSON(url_twitter, function parse_tw(data) {
                if (analysisUrls.tweets != url_twitter)
                    return;
                tw_json = makeJSON(data);
                if (data["processing_status"] != "done") {
                    $.getJSON(url_twitter, function(data) {
                        setTimeout(function() {
                            parse_tw(data);
                        }, 2000);
                    }).fail(function (jqxhr, textStatus, error) {
                        console.error("parse share : " + url_twitter);
                        console.error(textStatus + ", " + error);
                        share_fail(get_error_message("share"));
                    });
                }
                else {
                    loaded_tw = true;
                    loadTimeline();
                    document.getElementById("loader_tw").style.display = "none";
                }
            }).fail(function( jqxhr, textStatus, error ) {
                console.error("start share : " + url_twitter);
                console.error(textStatus + ", " + error);
                share_fail(get_error_message("share"));
            });
        }).fail(function(jqxhr, textStatus, error) {
            console.error("get urls : " + analysis_url);
            console.error(textStatus + ", " + error);
            request_fail(get_error_message(""));
        });
    }).fail(function( jqxhr, textStatus, error ) {
        console.error("start analysis : " + analysis_url);
        console.error(textStatus + ", " + error);
        request_fail(get_error_message(""));
    });
}



/*Get the video url and start youtube or facebook analysis*/
function submit_form(){
    //var youtube_url = "https://www.youtube.com/watch?v=";
    var facebook_url = "https://www.facebook.com";
    var twitter_url = "https://twitter.com"
	var url = $("[name=video_url2]").val();
    var reprocessChecked = document.getElementById("api_reprocess").checked;
    document.getElementById("error-content").style.display = "none";
    document.getElementById("error-content-share").style.display = "none";
    hideButtons();
	if (url != "") {
        cleanElement("place-table");
        if (isYtUrl(url) || url.startsWith(facebook_url) || url.startsWith(twitter_url)) {
            video_api_analysis(url, reprocessChecked);
        }
        else {
            document.getElementById("api-content").style.display = "none";
            var errorElement = document.getElementById("error-content");
            errorElement.innerHTML = "Please enter a Youtube, Facebook or Twitter URL";
            errorElement.style.display = "block";
        }
    }
}

var form = document.getElementById("api");
if (form.addEventListener){
	form.addEventListener("submit", submit_form, false);
}
form.addEventListener("submit", function(e){
	e.preventDefault();
});

/* Google button : thumbnails reverse search */
document.getElementById("google_search_btn").onclick = function() {
    openTab(google_reverse_search_urls);
}

/* Yandex button : thumbnails reverse search */
document.getElementById("yandex_search_btn").onclick = function() {
    openTab(yandex_reverse_search_urls);
};


/* Tineye button : thumbnails reverse search */
document.getElementById("tineye_search_btn").onclick = function() {
    reverseImgSearch("tineye", video_thumbnails_lst);
};

/* Twitter button : search video in twitter */
document.getElementById("twitter_search_btn").onclick = function() {
  openTab(twitter_url);
};

/* Twitter timeline */
function convertDate(date){
    var new_date = new Object();
    lst = String(date).split(" ");
    var new_month = "";
    var new_day = "";
    if (lst[2].charAt(0) == "0") {
        new_day = lst[2].replace("0", "");
    }
    else {
        new_day = lst[2];
    }
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    for (var index in months){
        if(lst[1] == months[index])
            new_month = parseInt(index) + 1;
    }
    new_date.month = new_month;
    new_date.day = new_day;
    new_date.year = lst[5];
    var hour = lst[3].split(":");
    new_date.hour = hour[0];
    new_date.minute = hour[1];
    new_date.second = hour[2];
    return new_date;
}

/* parse the json from twitter api and make json for the timeline */
function makeJSON(data){
    var json = "";
    var obj = new Object();
    obj.title = new Object();
    obj.title.media = new Object();
    obj.title.media.url = "img/invid_logo.png";
    obj.title.text = new Object();
    obj.title.text.headline = "Twitter timeline";
    obj.events = [];
    for (var index in data.tweets) {
        obj_ex = new Object();
        obj_ex.media = new Object();
        obj_ex.media.thumbnail = "img/twitter_logo.png";
        obj_ex.start_date = convertDate(data.tweets[index].created_at);
        obj_ex.text = new Object();
        var user =  data.tweets[index].user.screen_name;
        var user_name = data.tweets[index].user.name;
        var user_img = '<img src="' + data.tweets[index].user.profile_image_url_normal + '" />';
        obj_ex.text.headline = user_name + '<a href="https://twitter.com/'+ user + '" target="_blank"> @' + user + "</a>" + " " + user_img;
        obj_ex.text.text = data.tweets[index].text;
        obj.events.push(obj_ex);
    }
    json = obj;
    return json;
}

var loaded_tw = false;

/* display timeline (correct display none bug timeline js) */
function loadTimeline(){
    cleanElement("place-timeline");
    var div = document.getElementById("place-timeline");
    var loader = document.createElement("div");
    loader.setAttribute("id", "loader_tw");
    loader.setAttribute("class", "loader");
    var tl = document.createElement("div");
    tl.setAttribute("id", "timeline-embed");
    tl.setAttribute("style", "width: 100%; height: 600px");
    if (loaded_tw) {
        loader.setAttribute("style", "display: none;");
        /* timeline disable */
        document.getElementById("twitter-shares-content").setAttribute("style", "display: none");
        /*
        if (tw_json.events.length)
            document.getElementById("twitter-shares-content").setAttribute("style", "");
        else
            document.getElementById("twitter-shares-content").setAttribute("style", "display: none");*/
    } else {
        loader.setAttribute("style", "display: block;");
        tl.setAttribute("style", "width: 100%; height: 600px; display: none;");
    }
    div.appendChild(loader);
    div.appendChild(tl);
    timeline = new TL.Timeline('timeline-embed', tw_json);
}

/* Use for contextual menu */
function callApi(url){
    document.getElementById("apibox").value = url;
    submit_form();
}
var video_thumbnails_lst = [];
var twitter_url = "https://twitter.com/search";
var tw_json = "";


function updateTableLanguageAnalysis(lang) {
    if (!document.getElementById("place-table").hasChildNodes())
        return;
    var partNames = [];
    var titles = [];
    switch (analysisType) {
        case "youtube":
            var jsonName = jsonTitleTableApi["youtube"][lang];
            partNames = [jsonName["video"].title, jsonName["channel"].title, jsonName["comment"].title]
            titles = titles.concat(jsonName["video"]["name1"]);
            titles = titles.concat(jsonName["video"]["name2"]);
            titles = titles.concat(jsonName["channel"]["name"]);
            titles = titles.concat(jsonName["comment"]["name"]);
            break;
        case "facebook":
            var jsonName = jsonTitleTableApi["facebook"][lang];
            partNames = [jsonName["video"].title, jsonName["page"].title, jsonName["comment"].title]
            titles = titles.concat(jsonName["video"]["name"]);
            titles = titles.concat(jsonName["page"]["name"]);
            titles = titles.concat(jsonName["comment"]["name"]);
            break;
        case "twitter":
            var jsonName = jsonTitleTableApi["twitter"][lang];
            partNames = [jsonName["video"].title, jsonName["user"].title/*, jsonName["comment"].title*/]
            titles = titles.concat(jsonName["video"]["name"]);
            titles = titles.concat(jsonName["user"]["name"]);
            //titles = titles.concat(jsonName["comment"]["name"]);
            break;
        default:
            return;
    }
    $("#place-table").find("h3").html(function (index) {
        return partNames[index];
    })
    updateTitleTable("place-table", titles);
}