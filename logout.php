<?php
// Logout Endpoint
session_start();
session_destroy();
header('Location: login.html');
exit;
?>
