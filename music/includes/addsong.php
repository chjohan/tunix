<?php
    
    include_once("db.php");
    session_start();
    
    if (isset($_SESSION['user_id'])) {
        $userid = $_SESSION['user_id'];
        $playlistname;
        
        if (isset($_POST["playlist"])) {
            $playlistname = mysql_real_escape_string($_POST["playlist"]);
        } else {
            $playlistname = "Liked songs";
        }
        $songid = mysql_real_escape_string($_POST["songid"]);

        // Get playlist id from name and userid
        $query = "SELECT id FROM playlist WHERE name='$playlistname' AND userid='$userid'";
        $res = mysql_query($query);
        $row = mysql_fetch_row($res);

        $playlistid = $row[0];

        // Insert new song
        $sql = "INSERT INTO song VALUES('$playlistid', '$songid')";
        if (mysql_query($sql)) {
            echo 'Song successfully added to playlist';
        } else {
            echo 'Something went wrong.';
            echo 'userid: '.$userid;
            echo 'playlistname: '.$playlistname;
            echo 'songid: '.$songid;
        }

    }

?>
