<?php 

	require('Engine.class.php');

	if(!empty($_POST)) {

		if(!empty($_POST['object']) && !empty($_POST['action'])){

			$object = htmlspecialchars($_POST['object']);
			$action = htmlspecialchars($_POST['action']);
			$engine_ctrl = new Engine();
			$object_content = $engine_ctrl->getObject($object);

			if(!empty($object_content)){

				echo json_encode($object_content);
			}else{

			}
		}
	}		
	
?>