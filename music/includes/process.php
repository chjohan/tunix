<?php

    include_once("db.php");

    $email = mysql_real_escape_string($_POST['email']);
    $username = mysql_real_escape_string($_POST['username']);
    $password = mysql_real_escape_string(md5($_POST['password']));
    
    $res = mysql_query("SELECT username FROM user WHERE username='$username'");
    $row = mysql_fetch_row($res);

    if ($row > 0) {
        echo '<div class="alert-box">Username <b>'.$username.'</b> is taken. Please try another username.</div>';
    } else {

        $sql = "INSERT INTO user VALUES('', '$username', '$password', '$email')";
    
        if (mysql_query($sql)) {
            // Fetch username
            $userid = mysql_insert_id();
            mysql_query("INSERT INTO playlist VALUES('', 'Liked songs', '', '$userid')");    
            echo '<div class="alert-box">Thank you for registering, <b>'.$username.'</b>!<br>You can log in now.</div>';
        } else {
            echo "Insertion failed!";
        }
    }

?>
