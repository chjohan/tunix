<?php
    session_start();
?>

<html>

<head>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css">
    <link href="style/css/style.css" rel="stylesheet" type="text/css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
    <title>Tunix</title>
</head>

<body>
    <noscript>
        <style type="text/css">
            .container {display:none;}
            .footer {display:none;}
        </style>
        
        <div class="noscriptmsg box">
            <h3>You need to enable javascript to view this page.</h3>
            <p>Make sure you have no add-ons blocking
            javascript from running and that you have javascript enabled in your browser settings.</p>
        </div>
    </noscript>
    
    <div class="header">
        <div id="site-title-container">
            <h1 id="site-title">tunix</h1>
        </div>
        
        <div id="search-container">
            <form id="search-form" name="search-form" onsubmit="return search()">
                <input type="search" id="search-input" class="search-input" placeholder="type &amp; hit enter">
                <i class="fa fa-search" onclick="return search()"></i>
            </form>
        </div>
        
        <?php
        if (!isset($_SESSION['user_name'])) {
        ?>
        
        <div id="menu">
            <ul>
                <a href="" id="login-link"><li>Log in</li></a>
                <a href="" id="about-link"><li>About</li></a>
            </ul>
        </div>
        
        <?php
        } else {
        ?>    

        <div id="message-container">
        </div>
        
        <div id="menu">
            <ul>
                <li>Welcome, <b><?php echo $_SESSION['user_name'];?>!</b></li>
                <a href="" id="playlist-link"><li>Your playlists</li></a>
                <a href="" id="about-link"><li>About</li></a>
                <a href="includes/logout.php" id="logout-link"><li>Log out</li></a>
            </ul>
        </div>
        
        <?php
        }
        ?>

    </div>

    <div class="left-bar"></div>
        
    <div class="right-bar"></div>
    
    <div id="title-container">
        <h1>Your new music interface</h1>
    </div>

    <div class="container">
        <ul class="songlist">
        </ul>

        <div id="prevnextButtons">
            <div id="prevPageButton" class="button">Back</div>
            <div id="nextPageButton" class="button">Next</div>
        </div>

        <div id="playlist-container">
            <div id="songs-cont">
                <form id="new-playlist" name="new-playlist" onsubmit="return addPlaylist()">
                    <ul>
                        <li id="new-playlist-input"><input type="text" id="new-playlist-name" name="new-playlist-name" placeholder="New playlist name"><span class="list-meta" id="newplaylist-icon" onclick="return addPlaylist()"><i class="fa fa-plus"></span></i></li>
                    </ul>
                </form>
            </div>
            <div id="name-cont">
                <ul id="playlist">
                </ul>
            </div>
        </diV>

        <div id="login-container">
            <div id="log-cont">
                <form id="login" name="login" onsubmit="return loginUser()">
                    <ul>
                        <li id="login-input"><i class="fa fa-user"></i><input type="text" id="login-username" name="login-username" class="login-input" placeholder="username"></li>
                        <li id="login-input"><i class="fa fa-key"></i><input type="password" id="login-password" name="login-password" class="login-input" placeholder="password"></li>
                        <li><button type="submit" id="submit" value="Log in">Log in</button>   |   <a href="#" id="new-account-link">New account</a></li>
                    </ul>
                </form>
            </div>
            
            <div id="reg-cont">
                <form id="register" name="register" onsubmit="return registerNewUser()">
                    <ul>
                        <li id="login-input"><i class="fa fa-envelope"></i><input type="text" id="email" name="email" class="login-input" placeholder="email"></li>
                        <li id="login-input"><i class="fa fa-user"></i><input type="text" id="username" name="username" class="login-input" placeholder="username"></li>
                        <li id="login-input"><i class="fa fa-key"></i><input type="password" id="password" name="password" class="login-input" placeholder="password"></li>
                        <li><button type="submit" id="submit" value="Register">Register</button></li>
                    </ul>
                </form>
            </div>
        </div>

        <div id="about"></div>
    </div>

    <div class="footer">
        <div class="footer-container">

            <span id="prevSongButton" class="fa-stack fa-lg">
                <i class="fa fa-step-backward fa-stack-1x"></i>
            </span>

            <span id="playpause_button" class="fa-stack fa-lg">
                <i class="fa fa-play fa-stack-1x" id="playpause_icon"></i>
            </span>

            <span id="nextSongButton" class="fa-stack fa-lg">
                <i class="fa fa-step-forward fa-stack-1x"></i>
            </span>

            <span id="song-image"><img src="style/images/blank.png" alt="" height="40px" width="40px"></span>
            <span id="song-title-small"></span>        
    
            <input type="range" id="seek" step=1 value="0" min=0 max=450>
        </div>
    </div>

    <nav class="context-menu" id="context-menu">
        <ul class="context-menu__items">
            <a href="#" class="context-menu__link">
                <li class="context-menu__item" id="remove">
                    Remove from playlist<i class="fa fa-times"></i>
                </li>
            </a>
            <a href="#" class="context-menu__link">
                <li class="context-menu__item" id="add">
                    Add to playlist<i class="fa fa-plus"></i>
                </li>
            </a>
        </ul>
    </nav>    

    <div id="player"></div>
    <script src="js/main.js"></script>
</body>

</html>
