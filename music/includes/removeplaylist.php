<?php

    include_once("db.php");
    session_start();

    if (isset($_SESSION['user_id'])) {
        $userid = $_SESSION['user_id'];
        $id = mysql_real_escape_string($_POST["id"]);
        
        $sql = "DELETE FROM playlist WHERE userid='$userid' AND id='$id'";
        if (mysql_query($sql)) {
            //echo 'Playlist removed.';
        } else {
            echo 'Error.';
        }     
    }

?>
