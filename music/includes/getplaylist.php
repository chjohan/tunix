<?php

    include_once("db.php");
    session_start();

    if (isset($_SESSION["user_id"])) {
        $userid = $_SESSION["user_id"];

        $sql = "SELECT id, name FROM playlist WHERE userid='$userid' ORDER BY name ASC";
        $res = mysql_query($sql);
       
        if (!$res) {
            echo 'Error.';
            exit();
        }
        
        $resultarray = array();
        while ($row = mysql_fetch_assoc($res)) {
            array_push($resultarray, $row);
        }
        
        echo json_encode($resultarray);

    }

?>
