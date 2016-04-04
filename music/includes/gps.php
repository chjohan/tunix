<?php

    include_once("db.php");
    session_start();

    if (isset($_SESSION["user_id"])) {
        $userid = $_SESSION["user_id"];
        $listname = $_POST["playlistname"];
    
        //$sql = "SELECT s1.song_id FROM song s1, palylist p1 WHERE p1.userid='$userid' AND p1.name='$listname' AND p1.id=s1.playlist_id";
        $sql = "SELECT si.song_id FROM song si, (SELECT id FROM playlist WHERE userid='$userid' AND name='$listname') AS cur WHERE si.playlist_id=cur.id";
        $res = mysql_query($sql);

        if (!$res) {
            echo 'Error.';
        } else {

            $resultarray = array();
            while ($row = mysql_fetch_assoc($res)) {
                array_push($resultarray, $row);
            }
            //print_r($resultarray); 
            echo json_encode($resultarray);
        }

    }

?>
