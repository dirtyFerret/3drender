<?php

class Engine {

	public function __construct(){

		$this->objects = $this->getObjects();
		$this->materials = $this->getMaterials();
	}

	public function getMaterialLibrary($name){

		$materials = array();

		if(in_array($name,$this->materials)){

			$mat = 'assets/materials/'.$name.'.mtl';

			if(file_exists($mat)){

				$handle = fopen($mat, "r");

				if ($handle) {

					$material = '';

				    while (($line = fgets($handle)) !== false) {

						if(preg_match('/^newmtl\s.*$/',$line)){// récupération du matériau

				        	preg_match('/(?<=newmtl\s)[^\s]*/',$line,$matches);
				        	$material = $matches[0];

						}elseif(preg_match('/^\tKd\s\d\.\d{4}\s\d\.\d{4}\s\d\.\d{4}\s$/',$line)){

				        	preg_match_all('/\d\.\d{4}/', $line,$matches);
				        	$matches = $matches[0];

				        	$materials[$material] = array(
				        		0	=>	round($matches[0]*255),
				        		1	=>	round($matches[1]*255),
				        		2	=>	round($matches[2]*255)
				        	);
						}
				    }
					fclose($handle);
				}
			}
		}
		return $materials;
	}


	public function getObject($name){

		$object_name = '';
		$object = array();
		$vertices = array();
		$polygons = array();


		if(in_array($name,$this->objects)){

			$obj = 'assets/objects/'.$name.'.obj';

			if(file_exists($obj)){

				$handle = fopen($obj, "r");
				if ($handle) {

					$vertices_count = 1;
					$polygons_count = 1;
					$material = 'default';

				    while (($line = fgets($handle)) !== false) {
				        
				        if(preg_match('/^v\s{2}-?\d+\.\d{4}\s-?\d+\.\d{4}\s-?\d+\.\d{4}\s\s$/', $line)===1){// récupération des points

				        	preg_match_all('/-?\d+\.\d{4}/', $line,$matches);
				        	$matches = $matches[0];
				        	$vertices[$vertices_count] = array(
				        		0	=>	$matches[0],
				        		1	=>	$matches[1],
				        		2	=>	$matches[2]
				        	);
				        	$vertices_count++;

				        }elseif(preg_match('/^usemtl\s.*$/',$line)){// récupération du matériau

				        	preg_match('/(?<=usemtl\s)[^\s]*/',$line,$matches);
				        	$material = $matches[0];

				        }elseif(preg_match('/^f\s\d+\s\d+\s\d+\s\s$/',$line)){ // récupération des polygones

				        	preg_match_all('/(?<=\s)\d+(?=\s)/', $line, $matches);
				        	$matches = $matches[0];
				        	$polygons[] = array(
				        		0	=>	$matches[0],
				        		1	=>	$matches[1],
				        		2	=>	$matches[2],
				        		3	=>	$material
				        	);
				        }elseif(preg_match('/^#\sobject\s/',$line)){
				        	
				        	if(preg_match('/(?<=^#\sobject\s)(\w*)/', $line, $matches)===1){
				        		$object_name = $matches[0];
				        	}
				        }
				    }
					fclose($handle);
				}
			}
		}

		if(!empty($vertices) && !empty($polygons) && $object_name !== ''){

			$object['name'] = $object_name;

			$materials = $this->getMaterialLibrary($name);

			foreach ($polygons as $polygon) {
				
				$object['polygons'][] = array(
					0	=>	array( $vertices[$polygon[0]][0], $vertices[$polygon[0]][1], $vertices[$polygon[0]][2] ),
					1	=>	array( $vertices[$polygon[1]][0], $vertices[$polygon[1]][1], $vertices[$polygon[1]][2] ),
					2	=>	array( $vertices[$polygon[2]][0], $vertices[$polygon[2]][1], $vertices[$polygon[2]][2] ),
					3	=>	(isset($materials[$polygon[3]])?$materials[$polygon[3]]:$this->colors['red'])
				);
			}
		}
		return $object;
	}


	public function getObjects(){

		$folder = 'assets/objects/';
		$cdir = scandir($folder);
		$object_list = array();

		foreach ($cdir as $file) {
			
			if(preg_match('/\w+\.obj$/', $file)===1){

				$object_list[] = preg_replace('/.obj$/','',$file);
			}
		}
		return $object_list;
	}

	public function getMaterials(){

		$folder = 'assets/materials/';
		$cdir = scandir($folder);
		$mat_list = array();

		foreach ($cdir as $file) {
			
			if(preg_match('/\w+\.mtl$/', $file)===1){

				$mat_list[] =  preg_replace('/.mtl$/','',$file);
			}
		}
		return $mat_list;		
	}
}
?>