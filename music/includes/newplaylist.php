<?php

    include_once("db.php");
    session_start();

    if (isset($_SESSION['user_id'])) {
        $userid = $_SESSION['user_id'];
        $name = mysql_real_escape_string($_POST["new-playlist-name"]);
        
        $sql = "INSERT INTO playlist VALUES('', '$name', '', '$userid')";


        if (mysql_query($sql)) {
            //echo 'Playlist created.';
            $query = "SELECT id FROM playlist WHERE userid='$userid' AND name='$name'";
            $res = mysql_query($query);
            $row = mysql_fetch_row($res);
            echo $row[0];
        } else {
            echo 'Error.';
        }     
    }

?>
