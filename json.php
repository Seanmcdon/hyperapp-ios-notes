<?php
include($_SERVER["DOCUMENT_ROOT"]."/php/includes.php"); 
$data = json_decode(file_get_contents('php://input'), true);

switch($data["func"]){
	case 'get-data'      : getData(); break;
	case 'create_folder' : createFolder($data); break;
	case 'create_file'   : createFile($data); break;
	case 'update_folder' : updateFolder($data); break;
	case 'update_file'   : updateFile($data); break;
	case 'delete_folder' : deleteFolder($data); break;
	case 'delete_file'   : deleteFile($data); break;
}

function getData(){
	global $mysqli;
	
	//SELECT ALL FOLDERS
	//SELECT ALL FILES THAT MATCH THAT INDEX
	
	
	$folders = [];
  $this_folder = [];
 
	$get_folders = $mysqli->query("SELECT * FROM `notes_folders`");
	while($arr = $get_folders->fetch_assoc()){
		
		$this_folder["index"] = $arr["id"];
		$this_folder["title"] = $arr["folder"];
		
		$get_files = $mysqli->query("SELECT * FROM `notes_files` WHERE `folder` = '".$arr['id']."' ");
		
		$this_folder["files"] = [];
		
		while($files_arr = $get_files->fetch_assoc()){
			
			$this_folder["files"][] = Array(index => $files_arr["id"], content => $files_arr["content"]);
			
		}
		
		$folders[] = $this_folder;
		
	}
	
	echo json_encode($folders);
	
}

//create folder name
function createFolder($data){

global $mysqli;

$name = filter_var($data["data"], FILTER_SANITIZE_STRING);
$result = $mysqli->query("INSERT INTO `notes_folders` (`folder`) 
                          VALUES ( '".$name."' ) " );
if($result) echo json_encode([pageId => $mysqli->insert_id]);
}

//create note "new note"
function createFile($data){

global $mysqli;

$id = filter_var($data["folder"], FILTER_SANITIZE_STRING);
$result = $mysqli->query("INSERT INTO `notes_files` (`folder`, `content`) 
                          VALUES ( '".$id."', 'new note' ) " );
echo json_encode([data => $mysqli->insert_id, folderId => $id]);
}

//update folder folder
function updateFolder($data){

global $mysqli;
$name = filter_var($data["name"], FILTER_SANITIZE_STRING);
$id = filter_var($data["id"], FILTER_SANITIZE_STRING);
$result = $mysqli->query("UPDATE `notes_folders` SET 
                          `folder` = '".$name."' WHERE
                          `id` = '".$id."' " );
if($result) echo json_encode([data => "OK"]);
}

//update note content
function updateFile($data){

global $mysqli;

$content = filter_var($data["content"], FILTER_SANITIZE_STRING);
$id = filter_var($data["note"], FILTER_SANITIZE_STRING);
$result = $mysqli->query("UPDATE `notes_files` SET `content` =  
                         '".$content."' WHERE `id` = '".$id."' " );
if($result) echo json_encode([data => "OK"]);
}

//delete folder
function deleteFolder($data){

global $mysqli;

foreach($data["data"] as $id){

$id_to_delete = filter_var($id, FILTER_SANITIZE_STRING);
$result = $mysqli->query("DELETE FROM `notes_folders`  
                          WHERE `id` =  '".$id_to_delete."' " );
$result = $mysqli->query("DELETE FROM `notes_files`  
                          WHERE `folder` =  '".$id_to_delete."' " );                          
                          
}

echo json_encode([data => "OK"]);


}

//delete note
function deleteFile($data){

global $mysqli;

foreach($data["data"] as $id){

$id_to_delete = filter_var($id, FILTER_SANITIZE_STRING);
$result = $mysqli->query("DELETE FROM `notes_files`  
                          WHERE `id` =  '".$id_to_delete."' " );                          
                          
}

echo json_encode([data => "OK"]);

}
