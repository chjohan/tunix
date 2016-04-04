///////////////////////////////////
//
// YOUTUBE API INIT.
//
///////////////////////////////////

/** 
 * Code required by the Youtube api to get things going.
 */
var apikey = "AIzaSyDYwPzLevXauI-kTSVXTLroLyHEONuF9Rw";
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

////////////////////////////////
//
// GLOBAL VARIABLES
//
////////////////////////////////

/**
 * Settings
 */
var playing = false;
var autoPlay = true;
var songClick = false;
var nextPrevSongClick = false;
var newPage = true;
var addingS = false;

/**
 * Video variables
 */
var player;
var globvideoId = null;
var nextvideoId = null;

/**
 * Result data and playlist -variables.
 */
var resultArray = [];
var quedArray= [];
var resultArrayExt = [];
var quedArrayExt = [];

/**
 * Misc variables.
 */
var nextPageToken;
var prevPageToken;
var curPageToken;
var searchWord;
var songWord;
var globPlaylistname;
var menu = document.querySelector("#context-menu");
var menuPosition;
var menuPositionX;
var menuPositionY;

/**
 * Seeker element variables.
 */
var duration_sec;
var duration_formatted;
spele = document.getElementById("seek");
spele.value = 0;

/////////////////////////////////////
//
// YOUTUBE API CORE FUNCTIONS
//
/////////////////////////////////////

/**
 * Creates an instance of the YouTube player via iframe.
 */
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        heigth: '390',
        width: '640',
        videoId: globvideoId,
        events: {
            'onReady' : onPlayerReady,
            'onStateChange' : onPlayerStateChange
        }
    });
}

/**
 * Do this when the YouTube player is ready to go.
 *
 * @param   event   YouTube event.
 */
function onPlayerReady(event) {
    if (event.target.videoId != null) {
        playing = true;
    }
    console.log("Player is ready!");
}

var done = false;
var timer = null,
    interval = 1000,
    value = 0;

/**
 * Controlls the action on change of player state.
 *
 * @param   event   YouTube event.
 */
function onPlayerStateChange(event) {
    var playListIndex;
    if (event.data == YT.PlayerState.PLAYING && !done) {
        
        ele = document.getElementById("seek");
        if (timer !== null) return;
        timer = setInterval(function () {
            value += 1;
            //ele.stepUp();
            ele.value = value;
        }, interval);
    } else if (event.data == -1 && nextPrevSongClick) { // AND BUTTON IS CLICKED
        clearInterval(timer);
        timer = null;
        if (autoPlay) {
            playListIndex = player.getPlaylistIndex();
            playSong(quedArray[playListIndex]);
        }
        nextPrevSongClick = false;
    } else {
        clearInterval(timer);
        timer = null;

        if (autoPlay) {
            
        }
        
    }

    if (event.data == YT.PlayerState.ENDED) {
        clearInterval(timer);
        timer = null;

        if (autoPlay) {
            playListIndex = player.getPlaylistIndex();
            playSong(quedArray[playListIndex]);
        }
    }

    if (event.data == YT.PlayerState.PAUSED) {
        console.log("STATE : PAUSED");
    }

    if (event.data == YT.PlayerState.CUED) {
        console.log("STATE : CUED");
    }
    
    if (event.data == YT.PlayerState.BUFFERING) {
        console.log("STATE : BUFFERING");
    }

    if (event.data == -1) {
        console.log("STATE : UNSTARTED");
    }
}

//////////////////////////////////
//
// HELPER FUNCTIONS
//
//////////////////////////////////
/**
 * Get's duration of a video and sets the seeker's max attribute.
 *
 * @param   videoId a string containing a YouTube video id.
 */
function getDuration(videoId) {
    $.ajax({
      url: "https://www.googleapis.com/youtube/v3/videos?id=" + videoId + "&key="+ apikey + "&part=snippet,contentDetails", 
      dataType: "jsonp",
      success: function(data){
                duration_sec = convert_time(data.items[0].contentDetails.duration, 2);
                duration_formatted = convert_time(data.items[0].contentDetails.duration, 1);
                $("#seek").attr("max", parseInt(duration_sec, 10));           
      },
      error: function(jqXHR, textStatus, errorThrown) {
          alert (textStatus, + ' | ' + errorThrown);
      }
  });
}

/**
 * Callback function for getting contents of a playlist.
 */
function choosePlaylist(callback) {
        $("#playlist-container").show();
        var listObj = $("#playlist");

        if (listObj.children().length < 1) {
        // Fetch playlist elements
            $.get("includes/getplaylist.php", function(data) {
                var song = JSON.parse(data);
                        
                for(var i in song) {
                    $("#playlist").append('<li>'+song[i].name+'<span class="list-meta" id="remove-icon"><i class="fa fa-times" id="'+song[i].id+'"></i></span></li>');
                }
            });        
        }
        
        //  - Do this When a li element (song) is clicked.
        $("#playlist").off("click").on("click", "li", function () {
            callback($(this).text());
        });
        
        //  - Do this When a i element (song) is clicked.
        $("#playlist").on("click", "i", function () {
            // Remove playlist
            var that = $(this);
            that.off('click');
            var value = "id="+this.id;
            var iObject = this;
        $.ajax({
            url: "includes/removeplaylist.php",
            type: "post",
            data: value,
            success: function (response) {
                // you will get response from your php page (what you echo or print)    
                if (response != "Error.") {
                    // Success!!
                    $(iObject).closest('li').remove();
                } else {
                    console.log("Something went wrong.");
                    console.log("Response: " + response);
                }


            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });

        });
        
        $(document).mouseup(function (e) {
                var container = $("#playlist-container");

                if (!container.is(e.target) // if the target of the click isn't the container...
                && container.has(e.target).length === 0) // ... nor a descendant of the container
                {
                    container.hide();
                    container.unbind('click', $(document));
                }
        });
}

/**
 * Play's a single song by id.
 *
 * @param   id  a Youtube id.
 */
function playSingleSong(id) {
    player.loadVideoById(id, 0, "default");
}

/**
 * Play's a song from the qeuedplaylist by id.
 *
 * @param   id  a YouTube id.
 */
function playQeuedSong(id) {
    // Find index of song id
    var index;
    for (var i = 0; i < quedArray.length; i++) {
        if (quedArray[i] === id) {
            index = i;
            break;
        }
    }

    if (typeof index !== 'undefined') {
        player.loadPlaylist(quedArray, index, 0, "default");
    }
}

///////////////////////////////////
//
// CORE FUNCTIONS
//
///////////////////////////////////

/**
 * Core function handling flow of action and visuals when a new song is about to be played.
 */
var footerVisible = 0;
function playSong(id) {
    if (footerVisible === 0) {
        $(".footer-container").css('display', 'table');
        footerVisible = 1;
    }
    
    var elementIdd = "#"+id;
    pele = document.getElementById("seek");
    pele.value = 0;
    value = 0;    

    globvideoId = id;
    getDuration(id);
    $(".songlist li").removeClass("active");
    $(elementIdd).toggleClass('active');
    var spanElem = elementIdd + " span#musicimg";
    var imgurl = $(spanElem).text();
    $("#song-image img").attr("src", quedArrayExt[id].imgurl);

    
    // Generate BIG song title text
    var titleoutput = "<h1>__</h1><h1 id='title'>"+quedArrayExt[id].title+"</h1><h1 id='both1'>__</h1><span id='likeButton' class='fa-stack fa-lg'><i class='fa fa-heart-o fa-stack-1x'></i></span><span id='addButton' class='fa-stack fa-lg'><i class='fa fa-plus fa-stack-1x'></i></span>";
    $("#title-container").html(titleoutput);

    $("#song-title-small").text(quedArrayExt[id].title);
    
    playing = true;
    play_icon_controller(playing);
    $("#title-container").off('click').on("click", "span#likeButton", function () {
        // Add song to Liked songs
        $.post("includes/addsong.php", {songid: globvideoId})
            .done(function(data) {
                $("#message-container").html(data);
                $("#message-container").fadeIn().delay(3000).fadeOut(400);
            });
    });
    
    $("#title-container").off('click').on("click", "span#addButton", function () {
        choosePlaylist(function(playlistName) {
            $.post("includes/addsong.php", {songid: globvideoId, playlist: playlistName})
                .done(function(data) {
                    $("#playlist-container").hide();
                    $("#message-container").text(data);
                    $("#message-container").fadeIn().delay(3000).fadeOut(400);
                });
            
        });
    });
}


/**
 * Monitors change in the seeker.
 */
$("#seek").bind("change", function() {
        value = parseInt($(this).val(), 10);
        player.seekTo(value);
});

/**
 * Performs visual change on play/pause button.
 */
function play_icon_controller(playing) {
    if (!playing && !$("#playpause_icon").is(".fa-play")) {
            $("#playpause_icon").removeClass("fa-pause");
            $("#playpause_icon").addClass("fa-play");
    } else if (playing && !$("#playpause_icon").is(".fa-pause")) {
            $("#playpause_icon").removeClass("fa-play");
            $("#playpause_icon").addClass("fa-pause");
    }
}

/**
 * Performs play/stop actions.
 */
function playstop() {
    if(!playing) {
        player.playVideo();
        playing = true;
        play_icon_controller(playing);
    } else {
        player.pauseVideo();
        playing = false;
        play_icon_controller(playing);
    }
}

/**
 * Click-handler for play/pause button.
 *
 * @param   playstop    function that performs play/stop action.
 */
$("#playpause_button").click(playstop);


/**
 * Click-handler for li-element in songlist.
 */
$(".songlist").off("click").on("click", "li", function () {
    if(autoPlay) {
        if (newPage) {
            quedArray = resultArray.slice(0);
            quedArrayExt = jQuery.extend({}, resultArrayExt);
            // Play new que array
            playSong(this.id);
            playQeuedSong(this.id);
            newPage = false;
        } else {
            // Play same que array, but change index.
            playSong(this.id);
            playQeuedSong(this.id);
        }
    } else {
        playSong(this.id);
        playSingleSong(this.id);
    }
});

$("#nextSongButton").off("click").on("click", nextSong);

/**
 * Plays next song from list.
 */
function nextSong() {
    var curIndex = player.getPlaylistIndex();
    if (playing && curIndex < (quedArray.length - 1)) { 
        playQeuedSong(quedArray[++curIndex]);
        nextPrevSongClick = true;
    }
}

$("#prevSongButton").off("click").on("click", prevSong);

/**
 * Plays previous song from list.
 */
function prevSong() {
    var curIndex = player.getPlaylistIndex();
    if (playing && curIndex > 0) { 
        playQeuedSong(quedArray[--curIndex]);
        nextPrevSongClick = true;
    }
}

/**
 *    #################################
 *    ### Search and list functions ###
 *    #################################
 */

$("#nextPageButton").click(nextPage);

function nextPage() {
    renderPageByToken(nextPageToken);
}

function prevPage() {
    renderPageByToken(prevPageToken);
}

/**
 * Renders a list of songs when given a YouTube-token.
 *
 * $param   token   a string containing a YouTube-token, identifying a specific search result.
 */
function renderPageByToken(token) {
    $('.songlist').html('');
    curPageToken = token;
    
    resultArrayExt = [];
    $.get(
        "https://www.googleapis.com/youtube/v3/search", {
            part: 'snippet,id',
            q: searchWord,
            maxResults: 30,
            type: 'video',
            videoSyndicated: 'true',
            videoEmbeddable: 'true',
            videoCategoryId: '10',
            pageToken: token,
            key: apikey
        },
        function(data) {
            nextPageToken = data.nextPageToken;
            prevPageToken = data.prevPageToken;

            if (typeof prevPageToken === 'undefined') {
                $('#prevPageButton').hide();
            } else {
                $('#prevPageButton').show();
            }
            
            
            if (typeof nextPageToken === 'undefined') {    
                $('#nextPageButton').hide();
            } else {
                $('#nextPageButton').show();
            }

            for (var i = 0; i < data.items.length; i++) {
                var url1 = "https://www.googleapis.com/youtube/v3/videos?id=" + data.items[i].id.videoId + "&key=AIzaSyDYwPzLevXauI-kTSVXTLroLyHEONuF9Rw&part=snippet,contentDetails";
                $.ajax({
                    async: false,
                    type: 'GET',
                    url: url1,
                    success: function(data) {
                        if (data.items.length > 0) {
                            var output = getResults(data.items[0]);
                            $('.songlist').append(output);
                            var ele = $('.songlist li:last-child');
                            contextMenuListener(ele);
                            resultArray.push(data.items[0].id);
                            newPage = true;
                        }
                    }
                });
            }
            
            function contextMenuListener(el) {
                el[0].addEventListener("contextmenu", function(e) {
                    e.preventDefault();
                    toggleMenu(el, "search");
                    positionMenu(e);
                    el[0].classList.add("rc");
                });
            }
        });
}
$("#prevPageButton").click(prevPage);

/**
 * Preventing default action of from submission.
 */
$(function() {
    $('#new-playlist').submit(function(e) {
        e.preventDefault();
    });
});

/**
 * Core function that handles adding a song to the playlist
 */
function addPlaylist() {
    var listname = $('input#new-playlist-name').val();

    if (listname != "") {
        var values = $('form#new-playlist').serialize();
        $.ajax({
            url: "includes/newplaylist.php",
            type: "post",
            data: values,
            success: function (response) {
                if (response != "Error.") {
                    // Success!!
                    $('ul#playlist').prepend('<li>'+listname+'<span class="list-meta" id="remove-icon"><i class="fa fa-times" id="'+response+'"></i></span></li>');
                    $('input#new-playlist-name').val("");
                } else {
                    console.log("Something went wrong.");
                    console.log("Response: " + response);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }

        });
    }
}

/**
 * Preventing default action of form submission.
 */
$(function() {
    $('#login').submit(function(e) {
        e.preventDefault();
    });
});

/**
 * Core function that handles logging in a user.
 */
function loginUser() {
    var username = $('input#login-username').val();
    var password = $('input#login-password').val();
    var mssingResponse;

    if (username == "" || password == "") {
        $('#login-container .alert-box').remove();
        missingResponse = '<div class="alert-box">Please fill out all the fields.</div>';
        $('form#login').append(missingResponse);
    } else {
        $('#login-container .alert-box').remove();
        /* Get from elements values */
        var values = $('form#login').serialize();
        $.ajax({
            url: "includes/login.php",
            type: "post",
            data: values ,
            success: function (response) {
            // you will get response from your php page (what you echo or print)                 
            clearForm("login");

            // Success!!
            $('form#login').append(response);

            // Get current session
            $.ajax({
                url: "includes/get_session.php",
                cache: false
            })
            .done(function(result){
                var session_credentials = $.parseJSON(result);
                if (typeof session_credentials.user_name != "undefined") {
                    window.location.replace("index.php");
                }
            });

            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }


        });
    }
}

/**
 * Preventing default action of form submission.
 */
$(function() {
    $('#register').submit(function(e) {
        e.preventDefault();
    });
});

/**
 * Core function that handles registration of a new user.
 */
function registerNewUser() {
    var email = $('input#email').val();
    var username = $('input#username').val();
    var password = $('input#password').val();
    var mssingResponse;

    if (email == "" || username == "" || password == "") {
        $('#login-container .alert-box').remove();
        missingResponse = '<div class="alert-box">Please fill out all the fields.</div>';
        $('form#register').append(missingResponse);
    } else if (username.length > 32) {
        $('#login-container .alert-box').remove();
        missingResponse = '<div class="alert-box">Username must be less than 33 characters.</div>';
        $('form#register').append(missingResponse);
    } else if (password.length > 32) {
        $('#login-container .alert-box').remove();
        missingResponse = '<div class="alert-box">Password must be less than 33 characters.</div>';
        $('form#register').append(missingResponse);
    } else if (email.length > 240) {
        $('#login-container .alert-box').remove();
        missingResponse = '<div class="alert-box">Email must be less than 241 characters.</div>';
        $('form#register').append(missingResponse);
    } else {
        $('#login-container .alert-box').remove();
        var values = $('form#register').serialize();
        
        $.ajax({
            url: "includes/process.php",
            type: "post",
            data: values ,
            success: function (response) {
            clearForm("register");
            $('#reg-cont').hide();
            $('#log-cont').show();
            $('form#login').append(response);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }

        });
    }
}

/**
 * Clear a form element.
 */
function clearForm(formId) {
    var selectString = "#"+formId+" :input";
    $(selectString).each( function() {
        $(this).val("");
    });
    $('#login-container .alert-box').remove();
}

/**
 * Saves search input value and prevents default submit action.
 */
$(function() {
    var searchField = $('#search-input');

    $('#search-form').submit(function(e) {
        e.preventDefault();
    });
});

/**
 * Render song list by playlist array.
 *
 * @param   playlist    an array containing YouTube video id's.
 */
function renderPlayList(playlist) {
    if (typeof curPageToken === 'undefined') {
        $('#prevPageButton').hide();
    } else {
        prevPageToken = curPageToken;
        $('#prevPageButton').show();
    }
    $('#nextPageButton').hide();
 
    resultArrayExt = [];
    $('.songlist').html('');
    for (var i = 0; i < playlist.length; i++) {
                var url1 = "https://www.googleapis.com/youtube/v3/videos?id=" + playlist[i].song_id + "&key=AIzaSyDYwPzLevXauI-kTSVXTLroLyHEONuF9Rw&part=snippet,contentDetails";
                $.ajax({
                    async: false,
                    type: 'GET',
                    url: url1,
                    success: function(data) {
                        if (data.items.length > 0) {
                            var output = getResults(data.items[0]);
                            $('.songlist').append(output);
                            var ele = $('.songlist li:last-child');
                            contextMenuListener(ele);
                            resultArray.push(data.items[0].id);
                            newPage = true;
                        }
                    }
                });
            }

    function contextMenuListener(el) {
        el[0].addEventListener("contextmenu", function(e) {
            e.preventDefault();
            toggleMenu(el, "playlist");
            positionMenu(e);
            el[0].classList.add("rc");
        });
    }
}

/**
 * Get position of click.
 * 
 * @param   e   window event.
 * @return      object containing x, y coordinates.
 */
function getPosition(e) {
  var posx = 0;
  var posy = 0;

  if (!e) var e = window.event;

  if (e.pageX || e.pageY) {
    posx = e.pageX;
    posy = e.pageY;
  } else if (e.clientX || e.clientY) {
    posx = e.clientX + document.body.scrollLeft + 
                       document.documentElement.scrollLeft;
    posy = e.clientY + document.body.scrollTop + 
                       document.documentElement.scrollTop;
  }

  return {
    x: posx,
    y: posy
  }
}

/**
 * Sets position of menu.
 *
 * @param   e   window event.
 */
function positionMenu(e) {
    menuPosition = getPosition(e);
    menuPositionX = menuPosition.x+"px";
    menuPositionY = menuPosition.y+"px";

    menu.style.left = menuPositionX;
    menu.style.top = menuPositionY;
}

/**
 * Core function for custom right-click menu. Toggle's menu.
 */
var menuState = 0;
function toggleMenu(el, area) {
    
    if (menuState !== 1) {
        if (area === "search") {
            $("#context-menu li#remove").hide();
        } else {
            $("#context-menu li#remove").show();
        }
        menuState = 1;
        menu.classList.add("context-menu--active"); 
    }

            
        $("#context-menu").off("click").on("click", "li", function () {
            var choice = $(this).attr('id');
            
            if (choice === "add") {
                // Adding song
                var songId = el.attr('id');
                menuState = 0;
                menu.classList.remove("context-menu--active");
                
                choosePlaylist(function(playlistName) {
                    $.post("includes/addsong.php", {songid: songId, playlist: playlistName})
                        .done(function(data) {
                            $("#playlist-container").hide();
                            $("#message-container").text(data);
                            $("#message-container").fadeIn().delay(3000).fadeOut(400);
                            $(".songlist li").removeClass("rc");
                        });
            
                });
            } else {
                // Removing song
                var songId = el.attr('id');
               
                $.post( "includes/removesong.php", { playlistname: globPlaylistname, sid: songId })
                    .done(function( data ) {
                        
                        $(el).animate({
                            height: '0px'
                        }, {
                            duration: 500,
                            complete: function() {
                                $(this).remove();
                                menuState = 0;
                                menu.classList.remove("context-menu--active");
                            }
                        });
                        
                }); 
                
            }
        });

        $(document).mouseup(function (e) {
                var container = $("#context-menu");

                if (!container.is(e.target) // if the target of the click isn't the container...
                && container.has(e.target).length === 0 && menuState === 1) // ... nor a descendant of the container
                {
                    menuState = 0;
                    menu.classList.remove("context-menu--active");
                    $(".songlist li").removeClass("rc");
                    container.unbind('click', $(document));
                }
        });
        return false;
}

/**
 * Uses search query to get data from YouTube and appends html result to ul songlist.
 */
function search() {
    $('.songlist').html('');

    q = $('#search-input').val();
    searchWord = q; 
    
    $.get(
        "https://www.googleapis.com/youtube/v3/search", {
            part: 'snippet,id',
            q: q,
            maxResults: 30,
            type: 'video',
            videoSyndicated: 'true',
            videoEmbeddable: 'true',
            videoCategoryId: '10',
            key: apikey
        },
        function(data) {
            nextPageToken = data.nextPageToken;
            prevPageToken = data.prevPageToken;
            resultArrayExt = [];
            $('#nextPageButton').show();
            for (var i = 0; i < data.items.length; i++) {
                var url1 = "https://www.googleapis.com/youtube/v3/videos?id=" + data.items[i].id.videoId + "&key=AIzaSyDYwPzLevXauI-kTSVXTLroLyHEONuF9Rw&part=snippet,contentDetails,status,player";
                $.ajax({
                    async: false,
                    type: 'GET',
                    url: url1,
                    success: function(data) {
                        if (data.items.length > 0) {
                            //if (data.items[0].contentDetails.licensedContent !== true) {
                                //console.log(data.items[0].id + " is not licenced.");
                                var output = getResults(data.items[0]);
                                $('.songlist').append(output);
                                var ele = $('.songlist li:last-child');
                                contextMenuListener(ele);
                                resultArray.push(data.items[0].id);
                                newPage = true;
                        }
                    }
                });
            }
            
            function contextMenuListener(el) {
                el[0].addEventListener("contextmenu", function(e) {
                    e.preventDefault();
                    toggleMenu(el, "search");
                    positionMenu(e);
                    el[0].classList.add("rc");
                });
            }
        });
}


/**
 * Converts and returns time from H:M to either s or h:m
 */
function convert_time(duration, format) {
    var a = duration.match(/\d+/g);

    if (duration.indexOf('M') >= 0 && duration.indexOf('H') == -1 && duration.indexOf('S') == -1) {
        a = [0, a[0], 0];
    }

    if (duration.indexOf('H') >= 0 && duration.indexOf('M') == -1) {
        a = [a[0], 0, a[1]];
    }
    if (duration.indexOf('H') >= 0 && duration.indexOf('M') == -1 && duration.indexOf('S') == -1) {
        a = [a[0], 0, 0];
    }

    duration = 0;

    if (a.length == 3) {
        duration = duration + parseInt(a[0]) * 3600;
        duration = duration + parseInt(a[1]) * 60;
        duration = duration + parseInt(a[2]);
    }

    if (a.length == 2) {
        duration = duration + parseInt(a[0]) * 60;
        duration = duration + parseInt(a[1]);
    }

    if (a.length == 1) {
        duration = duration + parseInt(a[0]);
    }
    var h = Math.floor(duration / 3600);
    var m = Math.floor(duration % 3600 / 60);
    var s = Math.floor(duration % 3600 % 60);

    if (format === 1) {
        return ((h > 0 ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (s < 10 ? "0" : "") + s);
    } else if (format === 2) {
        return duration;
    }
}


/**
 * Formats an item and returns html result.
 * 
 * @param   item    an object representation of a video, containing trivial information.
 * @return          a string containing html for a <li>-element.
 */
function getResults(item) {
    var videoID = item.id;
    var title = item.snippet.title;
    var thumb = item.snippet.thumbnails.high.url;
    var duration = convert_time(item.contentDetails.duration, 1);
    
    var songObject = {title: title, imgurl: thumb};
    resultArrayExt[videoID] = songObject;

    var output = '<li id="' + videoID + '">' + title + '<span id="duration" class="list-meta">' + duration + '</span><span id="musicimg">' + thumb  + '</span></li>'+'';

    return output;
}


/**
 * Display and control playlist container and contents.
 */
$(function() {
    $("#playlist-link").unbind().click(function() {
        $("#playlist-container").show();

        var listObj = $("#playlist");

        if (listObj.children().length < 1) {
        // Fetch playlist elements
            $.get("includes/getplaylist.php", function(data) {
                var song = JSON.parse(data);
                        
                for(var i in song) {
                    if (song[i].name !== "Liked songs") {
                        $("#playlist").append('<li>'+song[i].name+'<span class="list-meta" id="remove-icon"><i class="fa fa-times" id="'+song[i].id+'"></i></span></li>');
                    } else {
                        $("#playlist").append('<li>'+song[i].name+'</li>');
                    }
                }
            });        
        }

        $("#playlist").off("click").on("click", "li", function () {
            // Remove playlist
            globPlaylistname = $(this).text();
            var playlistname = "playlistname="+globPlaylistname;
            $("#playlist-container").hide();
        $.ajax({
            url: "includes/gps.php",
            type: "post",
            data: playlistname,
            success: function (songlist) {
                // you will get response from your php page (what you echo or print)    
                if (songlist != "Error.") {
                    // Success!!
                    $(".songlist").html("");
                    // Call to render playlist
                    var songs = JSON.parse(songlist);
                    renderPlayList(songs);
                } else {
                    console.log("Something went wrong.");
                    console.log("Response: " + response);
                }


            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }


        });

        });

        $("#playlist").on("click", "i", function () {
            var value = "id="+this.id;
            var iObject = this;
        $.ajax({
            url: "includes/removeplaylist.php",
            type: "post",
            data: value,
            success: function (response) {
                if (response != "Error.") {
                    // Success!!
                    $(iObject).closest('li').remove();
                } else {
                    console.log("Something went wrong.");
                    console.log("Response: " + response);
                }


            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }

        });

        });
        
        $(document).mouseup(function (e) {
                var container = $("#playlist-container");

                if (!container.is(e.target) // if the target of the click isn't the container...
                && container.has(e.target).length === 0) // ... nor a descendant of the container
                {
                    container.hide();
                    container.unbind('click', $(document));
                }
        });

        return false;
    });
});

/**
 * Display and control login-container
 */
$(function() {
    $("#login-link").click(function() {
        $("#login-container").show();

        $("#new-account-link").click(function() {
            $("#log-cont").hide();
            $("#reg-cont").show();
        });
        
        $(document).mouseup(function (e) {
                var container = $("#login-container");

                if (!container.is(e.target) // if the target of the click isn't the container...
                && container.has(e.target).length === 0) // ... nor a descendant of the container
                {
                    $("#reg-cont").hide();
                    $("#log-cont").show();
                    $("#login .alert-box").remove();
                    container.hide();
                    container.unbind('click', $(document));
                }
        });

        return false;
    });
});

/**
 * Display and control about-container
 */
$(function() {
    $("#about-link").click(function() {
        $(".songlist").hide();
        $("#about").show();
        $.ajax({
            url: "about.html",
            success: function (data) { $('#about').append(data); },
            dataType: 'html'
        });
 
        $(document).mouseup(function (e) {
                var container = $("#about");

                if (!container.is(e.target) // if the target of the click isn't the container...
                && container.has(e.target).length === 0) // ... nor a descendant of the container
                {
                    $("#about .column-s-12").remove();
                    container.hide();
                    container.unbind('click', $(document));
                    $(".songlist").show();
                }
        });

        return false;    
    });
});
