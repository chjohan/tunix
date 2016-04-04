<?php

    include_once("db.php");
    session_start();

    if (isset($_SESSION['user_id'])) {
        $userid = $_SESSION['user_id'];

        $playlistname = mysql_real_escape_string($_POST['playlistname']);
        $pid = "";
        $sid = mysql_real_escape_string($_POST["sid"]);

        // OR //

        // Getting playlist_id by using playlistname
        $query = "SELECT id FROM playlist WHERE userid='$userid' AND name='$playlistname'";
        if ($res = mysql_query($query)) {
            echo "Found pid";
            $row = mysql_fetch_row($res);
            $pid = $row[0];
            
            $sql = "DELETE FROM song WHERE playlist_id='$pid' AND song_id='$sid'";
            if (mysql_query($sql)) {
                echo 'Song removed.';
            } else {
                echo 'Error.';
            }     
        }
                

    }

?>
