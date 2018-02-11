<?php

$s = "Name:" . $_FILES["image_file"]["name"]."<br />";
$s .= "Type: " . $_FILES["image_file"]["type"] . "<br />";
$s .= "Size: " . ceil($_FILES["image_file"]["size"] / 1024) . " Kb<br />";
echo $s;

if (file_exists("upload/" . $_FILES["image_file"]["name"])) {
    	echo $_FILES["image_file"]["name"] . " already exists. ";
    } else {
    	move_uploaded_file($_FILES["image_file"]["tmp_name"],"upload/" . $_FILES["image_file"]["name"]);
      	echo "Stored in: " . "upload/" . $_FILES["image_file"]["name"];
    }

?>