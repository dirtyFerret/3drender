/*
* render
* jquery plugin
* developped by Hoël Jacq
* pixelazur.com
* https://github.com/dirtyFerret/3drender
*/
$(function(){

    var viewport = $('#render-block');
	var radCnvt = 57.29578;//conversion radian/degré
	var shift = 400;// décalage
	var bright = [50,100]; // [0-100] // intervale éclairage

	// ajout des polygones dans la liste
	var polygons = [];
	var polyPositions = [];

	var mouseXPrev, mouseYprev = 0;
	var viewBox = [400,400];
	var scale = 4;

	// init de la position
	var xInit = 0.1;// radians
	var yInit = -0.5;
	var zInit = 3.14159;

	// Permet de connaître l'orientation du polygone face à une caméra orthogonale
	var getOrientation = function(p){
		var calc =  ((p[1][0]*p[2][1])+(p[0][0]*p[1][1])+(p[0][1]*p[2][0])) - ((p[0][1]*p[1][0])+(p[1][1]*p[2][0])+(p[0][0]*p[2][1]));
		if(calc>0){
			return 1;
		}else if(calc<0){
			return -1;
		}else{
			return 0;
		}
	}

	// retourne la valeur Z du barycentre d'un polygone
	var getZBarycentre = function(p){
		return (p[0][2]+p[1][2]+p[2][2])/3;
	}

	// mets à jour polyPositions[]
	var updatePolygonsPosition = function(){

		updatePolyOrder();
		polyPositions = [];
	    for (var i=0; i<polygons.length;i++){
			polyPositions.push([i,polygons[i][4]]);
		}

		polyPositions.sort(function(a, b) { // tri du tableau
		    return a[1] - b[1];
		});
	}

	// Mets à jour la position Z de chaque barycentre pour chaque polygone
	var updatePolyOrder = function(){
	    for (var i=0; i<polygons.length;i++){
	    	polygons[i][4] = getZBarycentre(polygons[i]);
	    }		
	}

	// Permet d'ajouter des éléments au svg passé en paramètre
	var svg = function(tag) {
	    return document.createElementNS('http://www.w3.org/2000/svg', tag);
	}

	// vérifie qu'une classe se trouve sur un élément
	var checkClass = function(selector, classname){

		var currentClasses = $(selector).attr('class');
		if(currentClasses.match(new RegExp(classname,'i'))===null){
			return false;
		}else{ return true; }
	}
	// supprime une classe d'un élément
	var eraseClass = function(selector,classname){
		var currentClasses = $(selector).attr('class');
		$(selector).attr('class',currentClasses.replace(classname,''));
	}

	var addClass = function(selector,classname){
		var currentClasses = $(selector).attr('class');
		$(selector).attr('class',currentClasses+' backface');
	}

	var initObject = function(){

		var data = {
			'object':'fox',
			'action':'init'
		};

        $.ajax({
            type : 'post',
            url  : 'ajax.php',
            data: data,
            success : function(data){
            	var result = jQuery.parseJSON(data);
            	initPolygons(result);
            }
        });		
	}

	var initPolygons = function(result){

		$.each(result.polygons,function(k,v){

			polygons.push(v);
		});

		initItems();
	}

	var initItems = function(){// mise en place des éléments visuels

		updatePolygonsPosition();
		rotateXaxis(xInit);
		rotateYaxis(yInit);
		rotateZaxis(zInit);

	    for (var i=0;i<polyPositions.length;i++){
	    	var p = polygons[polyPositions[i][0]];
    		if(getOrientation(p)>=0){// vérification de l'orientation du polygone

    			var vn = getNormalVector(p);
    			var shinyFactor = (( (bright[1]-bright[0]) * ((getYAngle(vn)+getXAngle(vn) + 180)/360) ) + bright[0])/100;
		    	var points = ((p[0][0]*scale)+shift)+','+((p[0][1]*scale)+shift)+' '+((p[1][0]*scale)+shift)+','+((p[1][1]*scale)+shift)+' '+((p[2][0]*scale)+shift)+','+((p[2][1]*scale)+shift);

		    	$(svg('polygon'))
		    		.attr('id',i)
		    		.attr('points',points)
		    		.attr('style','fill:rgb('+(p[3][0]*shinyFactor)+','+(p[3][1]*shinyFactor)+','+(p[3][2]*shinyFactor)+');stroke:rgb('+(p[3][0])+','+(p[3][1])+','+(p[3][2])+')')
		    		.appendTo(viewport);
    		}
	    }
	}

	var updateItems = function(){

		updatePolygonsPosition();
		$(viewport).empty();

	    for (var i=0;i<polyPositions.length;i++){

    		var p = polygons[polyPositions[i][0]];

    		if(getOrientation(p)>=0){

    			var vn = getNormalVector(p);
    			var shinyFactor = (( (bright[1]-bright[0]) * ((getYAngle(vn)+getXAngle(vn) + 180)/360) ) + bright[0])/100;
		    	var points = ((p[0][0]*scale)+shift)+','+((p[0][1]*scale)+shift)+' '+((p[1][0]*scale)+shift)+','+((p[1][1]*scale)+shift)+' '+((p[2][0]*scale)+shift)+','+((p[2][1]*scale)+shift);

		    	$(svg('polygon'))
		    		.attr('id',i)
		    		.attr('points',points)
		    		.attr('style','fill:rgb('+(p[3][0]*shinyFactor)+','+(p[3][1]*shinyFactor)+','+(p[3][2]*shinyFactor)+');stroke:rgb('+(p[3][0])+','+(p[3][1])+','+(p[3][2])+')')
		    		.appendTo(viewport);
		    }
    	}
	}

    //retourne le vecteur normal d'un polygone
    var getNormalVector = function(p){

	    var v1 = [p[1][0]-p[0][0], p[1][1]-p[0][1], p[1][2]-p[0][2]];
	    var v2 = [p[2][0]-p[0][0], p[2][1]-p[0][1], p[2][2]-p[0][2]];
	    return [ (v1[1]*v2[2])-(v1[2]*v2[1]), (v1[2]*v2[0])-(v1[0]*v2[2]), (v1[0]*v2[1])-(v1[1]*v2[0]) ];
    }
    // retourne l'angle formé entre le vecteur X du repère orthonormé et un vecteur (normal) 
    var getXAngle = function(vn){
    	return -(radCnvt * Math.atan(vn[1]/vn[2]));
    }
    // retourne l'angle formé entre le vecteur Z du repère orthonormé et un vecteur (normal) 
    var getYAngle = function(vn){
    	return radCnvt * Math.atan(vn[0]/vn[2]);
    }

	// fonctions de rotation des points selon le point de coordonnées [0,0,0]

	var rotateZaxis = function(angle) {

	    var sinangle = Math.sin(angle);
	    var cosangle = Math.cos(angle);
	    
	    for (var n=0; n<polygons.length; n++) {
	        var polygon = polygons[n];

	        for(var i=0; i<3;i++){

		        var x = polygon[i][0];
		        var y = polygon[i][1];
		        polygon[i][0] = x * cosangle - y * sinangle;
		        polygon[i][1] = y * cosangle + x * sinangle;
	        }
	    }
	    updateItems();
	};

	var rotateYaxis = function(angle) {

	    var sinangle = Math.sin(angle);
	    var cosangle = Math.cos(angle);
	    
	    for (var n=0; n<polygons.length; n++) {
	        var polygon = polygons[n];

	        for(var i=0; i<3;i++){
		        var x = polygon[i][0];
		        var z = polygon[i][2];
		        polygon[i][0] = x * cosangle - z * sinangle;
		        polygon[i][2] = z * cosangle + x * sinangle;
		    }
	    }
	    updateItems();
	};

	var rotateXaxis = function(angle) {

	    var sinangle = Math.sin(angle);
	    var cosangle = Math.cos(angle);
	    
	    for (var n=0; n<polygons.length; n++) {
	        var polygon = polygons[n];

	        for(var i=0; i<3;i++){

		        var y = polygon[i][1];
		        var z = polygon[i][2];
		        polygon[i][1] = y * cosangle - z * sinangle;
		        polygon[i][2] = z * cosangle + y * sinangle;
		    } 
	    }
	    updateItems();
	};

    $(viewport).mousemove(function(e){ // event sur le passage de la souris sur le viewport

        if(mouseXPrev > e.pageX){
            rotateYaxis(-0.05);
        }else if(mouseXPrev < e.pageX){
            rotateYaxis(0.05);
        }

        if(mouseYprev > e.pageY){
            rotateXaxis(-0.05);
        }else if(mouseYprev < e.pageY){
            rotateXaxis(0.05);
        }
        mouseXPrev = e.pageX;
        mouseYprev = e.pageY;
    });

    $(viewport).bind('mousewheel', function(e){ // event sur le scroll souris pour le zoom

        if(e.originalEvent.wheelDelta /120 > 0) {
        	if(scale <= 9){
	            scale++;
	            updateItems();
        	}        	
        }
        else{
        	if(scale >= 2){
	            scale--;
	            updateItems();
        	}
        }
    });

	initObject();

	setInterval(function(){
		rotateYaxis(0.001);
	},10);

});