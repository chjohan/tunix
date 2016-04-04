<?php
    include_once('db.php');
    session_start();
    
    $username = mysql_real_escape_string($_POST["login-username"]);
    $password = mysql_real_escape_string(md5($_POST["login-password"]));

    $sql = "SELECT id, username FROM user WHERE(username='$username' AND password='$password')";
    $res = mysql_query($sql);
    $row = mysql_fetch_row($res);
    
    if ($row[0] == 0) {
        echo '<div class="alert-box">Username or password is incorrect. Please try again.</div>';
    } else if ($row[0] > 0) {
        $_SESSION['user_id'] = $row[0];
        $_SESSION['user_name'] = $username;
    }  
?>
