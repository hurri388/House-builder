var cameraControls;
var domEvents;
var renderer, scene;
var camera, cenital;
var upperheadSide;
var L = 100;
var floorGrain = 20;

var wallActual;
var startWall, finalWall;

var floorOrigin;

var paintOrigin;

var floor;

var wallWidth = 0.8, wallHeight = 10;

var materialBuildup = new THREE.MeshBasicMaterial({color: "black", wireframe: true});
var geometricPillar = new THREE.BoxGeometry(wallWidth, wallHeight, wallWidth);
var indicator = new THREE.Mesh(geometricPillar, materialBuildup);

var wallTextures = [];
var walls = [];
var wallMaterials = [];
var wallMaterialsInd = [];
var wallTams = [];
var wallsAllowed = [];

var floorTextures = [];
var floorTiles = [];
var floorTextures = [];

var doorModels = [undefined, undefined, undefined];
var doorCaracas = [undefined, undefined, undefined];
var door, doorTrap;
var doorChar;
var wallAllowedDoor = [];

var windowAsset, openPanel;
var windowHeight = 7;
var woodTexture;

var options;

var paintColorSelector;
var floorColorSelector;

var listeners = [];

var skyboxMats, sun;

var textureLoader, gltfLoader;

var objects = [];
var objectActual;
var objectGapX = []
var objectGapZ = []

var roof;
var roofTexture;
var minx = 1000, minz = 1000;
var maxx = -1000, maxz = -1000;

init();
setCameras();
loadMaterials();
loadScene();

function init(){
	// Configure the canvas and the render engine
	renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setClearColor(new THREE.Color(0x000000));
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	document.getElementById("container").appendChild(renderer.domElement);
	renderer.autoClear = false;
	renderer.domElement.setAttribute("tabIndex", "0");
	renderer.domElement.focus();

	// Instantiate a Scene data structure
	scene = new THREE.Scene();

	window.addEventListener('resize', updateAspectRatio);

	var keyboard = new THREEx.KeyboardState(renderer.domElement);
	keyboard.domElement.addEventListener('keydown', function(event){
		if( keyboard.eventMatches(event, 'r') && objectActual != undefined){
			objectActual.rotation.y += Math.PI / 4;
		}	
	});

	const loadingManager = new THREE.LoadingManager( () => {
		const loadingScreen = document.getElementById( 'loading-screen' );
		loadingScreen.classList.add( 'fade-out' );
		
		// optional: remove loader from DOM via event listener
		loadingScreen.addEventListener( 'transitionend', function(event){event.target.remove()} );
		loadAssets();
		setLights();
		setupGui();
		render();
	} );

	textureLoader = new THREE.TextureLoader(loadingManager);
	gltfLoader = new THREE.GLTFLoader(loadingManager);
}

function setLights(){
	var light = new THREE.HemisphereLight(0xFFFFFF, 0x080820, 0.5);
	scene.add(light);

	var luzAmbiente = new THREE.AmbientLight(0x333333);
	scene.add(luzAmbiente);

	sun = new THREE.DirectionalLight("white", 1);
	sun.position.set(0,200,0);
	sun.castShadow = true;
	sun.penumbra = 0.2;
	sun.name = "sol";
	scene.add(sun);
	sun.shadow.camera = new THREE.OrthographicCamera( -225, 225, 225, -225, 0.5, 400 );
}

function setCameras(){
	var aspectRatio = window.innerWidth / window.innerHeight;
	camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
	camera.position.set(0,50,75);
	camera.lookAt(new THREE.Vector3(0,0,0));
	camera.layers.enable(1);


	upperheadSide = Math.min(window.innerWidth, window.innerHeight) / 4;
	cenital = new THREE.OrthographicCamera(-L/2, L/2, L/2, -L/2, -1, 150 );
	cenital.position.set(0,100,0);
	cenital.up = new THREE.Vector3(0,0,-1);
	cenital.lookAt(new THREE.Vector3(0,0,0));

	scene.add(camera);
	scene.add(cenital);

	cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
	cameraControls.target.set(0,0,0);
	cameraControls.noKeys = true;

	domEvents = new THREEx.DomEvents(camera, renderer.domElement);
}

function loadMaterials(){
	var ind = 1;
	var complete = function(texture){
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		wallTextures.push(texture);
		if(ind == 1){
			muroMaterialDefecto = new THREE.MeshLambertMaterial({map:texture});
		}
		if(ind < 9){
			textureLoader.load("images/wall" + (ind++) + ".jpg", complete);
		}
	};
	textureLoader.load("images/wall0.jpg",	complete);

	var indS = 1
	var completeS = function(texture){
		floorTextures.push(texture);
		if(indS < 10){
			textureLoader.load("images/floor" + (indS++) + ".jpg", completeS);
		}
	};
	textureLoader.load("images/floor0.jpg", completeS);

	woodTexture = textureLoader.load("./images/wood512.jpg");

	roofTexture = textureLoader.load("images/roof.jpg");
	roofTexture.wrapS = THREE.RepeatWrapping;
	roofTexture.wrapT = THREE.RepeatWrapping;
}

function loadAssets(){
	var t0 = performance.now();
	var gltfLoaderModels = new THREE.GLTFLoader();
	gltfLoaderModels.load(
		'models/Door1/scene.gltf',
		function ( gltf ) {
			gltf.scene.scale.set(0.04,0.04,0.04);
			doorModels[0] = gltf.scene;
			doorCaracas[0] = [4.2,0.35,0.575,Math.PI/2]
		}
	);
	gltfLoaderModels.load(
		'models/Door2/scene.gltf',
		function ( gltf ) {
			gltf.scene.scale.set(3,3,3);
			doorModels[1] = gltf.scene;
			doorCaracas[1] = [0,0.35,0.35,0]
		}
	);

	gltfLoaderModels.load(
		'models/Table/scene.gltf',
		function ( gltf ) {
			var mesa = gltf.scene;
			mesa.scale.set(0.13,0.13,0.13);
			objects[0] = mesa;
			objectGapX[0] = -1.4;
			objectGapZ[0] = 0;
			
			mesa.traverse( function(node) {
        		if ( node instanceof THREE.Mesh ) { 
        			node.castShadow = true; 
        			node.receiveShadow = true; 
        		}
    		});
		}
	);

	gltfLoaderModels.load(
		'models/Chair/scene.gltf',
		function ( gltf ) {
			var silla = gltf.scene;
			silla.scale.set(5,5,5);
			objects[1] = silla;
			objectGapX[1] = 0;
			objectGapZ[1] = 0;
			
			silla.traverse( function(node) {
        		if ( node instanceof THREE.Mesh ) { 
        			node.castShadow = true; 
        			node.receiveShadow = true; 
        		}
    		});
		}
	);

	gltfLoaderModels.load(
		'models/Sofa/scene.gltf',
		function ( gltf ) {
			var sofa = gltf.scene;
			sofa.scale.set(0.8,0.8,0.8);
			objects[2] = sofa;
			objectGapX[2] = 0;
			objectGapZ[2] = 0;
			
			sofa.traverse( function(node) {
        		if ( node instanceof THREE.Mesh ) { 
        			node.castShadow = true; 
        			node.receiveShadow = true; 
        		}
    		});
		}
	);

	gltfLoaderModels.load(
		'models/LampFloor/scene.gltf',
		function ( gltf ) {
			var lamp = gltf.scene;
			lamp.scale.set(1.05,1.05,1.05);
			objects[3] = lamp;
			objectGapX[3] = 0;
			objectGapZ[3] = 0;

			var luz = new THREE.PointLight("white", 0.55, L/2, 2);
			luz.position.set(0,6,0);
			lamp.add(luz);

			lamp.traverse( function(node) {
        		if ( node instanceof THREE.Mesh ) { 
        			node.castShadow = true; 
        			node.receiveShadow = true; 
        		}
    		});
		}
	);

	gltfLoaderModels.load(
		'models/LampCeil/scene.gltf',
		function ( gltf ) {
			var lamp = gltf.scene;
			lamp.scale.set(0.035,0.018,0.035);
			lamp.position.y = 6.8;
			objects[4] = lamp;
			objectGapX[4] = -0.85;
			objectGapZ[4] = -0.2;

			var luz = new THREE.PointLight("white", 0.55, L/2, 2);
			luz.position.set(25,6,6);
			lamp.add(luz);
			
			lamp.traverse( function(node) {
        		if ( node instanceof THREE.Mesh ) { 
        			node.castShadow = true; 
        			node.receiveShadow = true; 
        		}
    		});
		}
	);
}

function loadScene(){
	//Material común
	var material = new THREE.MeshLambertMaterial( {color: 0x555555, side: THREE.DoubleSide} );
	var materialW = new THREE.MeshBasicMaterial( {color: 0xCCCCCC, wireframe: true, side: THREE.DoubleSide} );

	var floorWG = new THREE.PlaneGeometry( L, L, floorGrain, floorGrain);
	floor = new THREE.Mesh( floorWG, materialW );
	floor.layers.set(1);
	floor.rotation.set(Math.PI / 2, 0, 0);
	scene.add(floor);

	var step = L / floorGrain;
	var posX = -L/2 + step/2;
	var posZ = L/2 - step/2;
	for(var i = 0; i < floorGrain; i++){
		var rowM = [];
		var row = [];
		for(var j = 0; j < floorGrain; j++){
			var tileG = new THREE.PlaneGeometry( step, step, 1, 1);
			var tile = new THREE.Mesh( tileG, material ); 
			tile.rotation.set(Math.PI / 2, 0, 0);
			tile.position.set(posX, 0, posZ);
			scene.add(tile);
			rowM.push(material);
			tile.receiveShadow = true;
			row.push(tile);
			posX += step;
		}
		posZ -= step;
		posX = -L/2 + step/2;
		floorTiles.push(row);
		floorTextures.push(rowM);
	}

	

	var pre = "images/TropicalSunnyDay/TropicalSunnyDay";
	var directions  = ["Left", "Right", "Up", "Down", "Front", "Back"];
	var suf = "2048.jpg";
	skyboxMats = [];
	for(var j = 0; j < directions.length; j++){
		if(j == 3){
			skyboxMats.push(new THREE.MeshBasicMaterial());
		}
		else{
			skyboxMats.push(
				new THREE.MeshBasicMaterial({
					map: textureLoader.load(pre+directions[j]+suf), 
					side: THREE.BackSide, 
					transparent: true})
			);
		}
	}
	var skyGeometry = new THREE.CubeGeometry( 448, 448, 448 );
	skybox = new THREE.Mesh( skyGeometry, skyboxMats );
	skybox.position.y = 20;
	scene.add( skybox );
}

function setupGui(){
	var currentFolder = undefined; 

	var actions = {
		Walls: function(){
			changeMode();
			if(currentFolder != undefined)
				removeFolder(gui, currentFolder);
			currentFolder = undefined;

			domEvents.addEventListener(floor, "mousemove", preContruct);
			domEvents.addEventListener(floor, "click", startWall);

			listeners.push([floor, "mousemove", preContruct]);
			listeners.push([floor, "click", startWall]);
		},
		Doors: function(){
			changeMode();
			if(currentFolder != undefined)
				removeFolder(gui, currentFolder);
			currentFolder = "Doors";
			var f = gui.addFolder("Doors");

			f.add(options, 'puerta', {Door1: 0, Door2: 1})
				.name("Door")
				.onChange( function(ind){
					door = doorModels[ind].clone()
					doorTrap = door.clone();
					doorChar = doorCaracas[ind];
				});
			
			door = doorModels[options.puerta].clone()
			doorTrap = door.clone();
			doorChar = doorCaracas[options.puerta];

			walls.forEach(function(muro, indx, array){
				muro.forEach(function(panel, indy, array){
					if(wallsAllowed[indx][indy] && wallAllowedDoor[indx][indy]){
						var prePuertaAux = function(event){prePutDoor(event, indx, indy);};
						var desPuertaAux = function(event){afterPutDoor(event, indx, indy);};
						var puertaAux = function(event){putDoor(event, indx, indy);};

						domEvents.addEventListener(panel, "mouseover", prePuertaAux);
						domEvents.addEventListener(panel, "mouseout", desPuertaAux);
						domEvents.addEventListener(panel, "mousedown", puertaAux);

						listeners.push([panel, "mouseover", prePuertaAux]);
						listeners.push([panel, "mouseout", desPuertaAux]);
						listeners.push([panel, "mousedown", puertaAux]);
					}
				});
			});
			f.open();
		},
		Windows: function(){
			changeMode();
			if(currentFolder != undefined)
				removeFolder(gui, currentFolder);
			currentFolder = undefined;
			if(windowAsset == undefined){
				windowAsset = new THREE.Object3D();
				var s = L / floorGrain;
				var alto = s - 1 - wallWidth;
				var marcoGH = new THREE.BoxGeometry(wallWidth/2, s, wallWidth);
				var marcoGV = new THREE.BoxGeometry(wallWidth/2, alto, wallWidth);
				var materialMarco = new THREE.MeshLambertMaterial({map: woodTexture})
				var marcoH = new THREE.Mesh(marcoGH, materialMarco);
				var marcoV = new THREE.Mesh(marcoGV, materialMarco);
				marcoH.receiveShadow = true;
				marcoH.castShadow = true;
				marcoV.receiveShadow = true;
				marcoV.castShadow = true;
				var marco1 = marcoV.clone();
				var marco2 = marcoV.clone();
				var marco3 = marcoH.clone();
				var marco4 = marcoH.clone();
				var marco5 = marcoV.clone();

				marco1.position.set(s/2 - wallWidth/4,0,0);
				marco2.position.set(wallWidth/4 - s/2,0,0);
				marco3.position.set(0,(s-1)/2 - wallWidth/4,0);
				marco4.position.set(0,wallWidth/4-(s-1)/2,0);

				marco3.rotation.set(0,0,Math.PI/2);
				marco4.rotation.set(0,0,Math.PI/2);

				windowAsset.add(marco1);
				windowAsset.add(marco2);
				windowAsset.add(marco3);
				windowAsset.add(marco4);
				windowAsset.add(marco5);

				var materialCristal = new THREE.MeshPhongMaterial({color: 0xFFFFFF, transparent: true, opacity: 0.3, shininess: 25, side: THREE.DoubleSide});
				var marcoCristal = new THREE.BoxGeometry(s - wallWidth/2, alto - wallWidth/2, 0.1);
				var cristal = new THREE.Mesh(marcoCristal, materialCristal);
				windowAsset.add(cristal);

				var altoVentana = L/floorGrain - 1;
				var altoB = windowHeight - altoVentana / 2;
				var altoT = wallHeight - windowHeight - altoVentana / 2;
				var panelBG = new THREE.BoxGeometry(L/floorGrain, altoB, wallWidth);
				var panelTG = new THREE.BoxGeometry(L/floorGrain, altoT, wallWidth);
				var panelB = new THREE.Mesh( panelBG, muroMaterialDefecto );
				var panelT = new THREE.Mesh( panelTG, muroMaterialDefecto );
				panelB.position.y = -(wallHeight-altoB) / 2;
				panelT.position.y = (wallHeight-altoT) / 2;
				panelB.receiveShadow = true;
				panelB.castShadow = true;
				panelT.receiveShadow = true;
				panelT.castShadow = true;

				openPanel = new THREE.Object3D();
				openPanel.add(panelB);
				openPanel.add(panelT);
			}

			walls.forEach(function(muro, indx, array){
				muro.forEach(function(panel, indy, array){
					if(wallsAllowed[indx][indy] && wallAllowedDoor[indx][indy]){
						var preVentanaAux = function(event){prePutWindow(event, indx, indy);};
						var desVentanaAux = function(event){afterPutWindow(event, indx, indy);};
						var ventanaAux = function(event){putWindow(event, indx, indy);};

						domEvents.addEventListener(panel, "mouseover", preVentanaAux);
						domEvents.addEventListener(panel, "mouseout", desVentanaAux);
						domEvents.addEventListener(panel, "mousedown", ventanaAux);

						listeners.push([panel, "mouseover", preVentanaAux]);
						listeners.push([panel, "mouseout", desVentanaAux]);
						listeners.push([panel, "mousedown", ventanaAux]);
					}
				});
			});
		},
		Paint: function(){
			changeMode();
			if(currentFolder != undefined)
				removeFolder(gui, currentFolder);
			currentFolder = "Paint";
			var f = gui.addFolder("Paint");
			f.add(options, 'paint', {Exterior1: 1, Exterior2: 2, Exterior3: 3, Exterior4: 4, Interior5: 5, Interior6: 6, Interior7: 7, Interior8: 8, Color: 9})
				.name("Paint")
				.onChange( function(ind){
					if(ind == 9){
						paintColorSelector = f.addColor(options, 'color').name("Color");
					}
					else if(paintColorSelector != undefined){
						f.remove(paintColorSelector);
						paintColorSelector = undefined;
					}
				} );
			walls.forEach(function(muro, indx, array){
				muro.forEach(function(panel, indy, array){
					var panels = []
					if(wallsAllowed[indx][indy]){
						panels = [panel]
					}
					else{
						panels = panel.children;
					}
					for(var i = 0; i < panels.length; i++){
						var prePintarAux = function(event){ prePaintedWall(event, indx, indy);};
						var desPintarAux = function(event){unpaintWall(event, indx, indy);};
						var empezarPintarAux = function(event){startWallPaint(event, indx, indy);};

						domEvents.addEventListener(panels[i], "mouseover", prePintarAux);
						domEvents.addEventListener(panels[i], "mouseout", desPintarAux);
						domEvents.addEventListener(panels[i], "mousedown", empezarPintarAux);

						listeners.push([panels[i], "mouseover", prePintarAux]);
						listeners.push([panels[i], "mouseout", desPintarAux]);
						listeners.push([panels[i], "mousedown", empezarPintarAux]);
					}
				});
			});
			if(options.paint == 9){
				paintColorSelector = f.addColor(options, 'color').name("Color");
			}
			f.open();
		},
		Floor: function(){
			changeMode();
			if(currentFolder != undefined)
				removeFolder(gui, currentFolder);
			currentFolder = "Floor";
			var f = gui.addFolder("Floor");
			f.add(options, 'floor', {Grass: 0, Exterior1: 1, Exterior2: 2, Exterior3: 3, Exterior4: 4, Interior5: 5, Interior6: 6, Interior7: 7, Interior8: 8, Interior9: 9, Color: 10})
				.name("Floor")
				.onChange( function(ind){
					if(ind == 10){
						floorColorSelector = f.addColor(options, 'colorFloor').name("Color");
					}
					else if(floorColorSelector != undefined){
						f.remove(floorColorSelector);
						floorColorSelector = undefined;
					}
				} );
			floorTiles.forEach(function(baldosaFila, indx, array){
				baldosaFila.forEach(function(baldosa, indy, array){
					domEvents.addEventListener(baldosa, "mouseover", prePutFloor);
					domEvents.addEventListener(baldosa, "mouseout", afterPutFloor);
					domEvents.addEventListener(baldosa, "mousedown", startFloor);

					listeners.push([baldosa, "mouseover", prePutFloor]);
					listeners.push([baldosa, "mouseout", afterPutFloor]);
					listeners.push([baldosa, "mousedown", startFloor]);
				});
			});
			if(options.floor == 10){
				floorColorSelector = f.addColor(options, 'colorFloor').name("Color");
			}
			f.open();

		},
		Decorate: function(){
			changeMode();
			if(currentFolder != undefined)
				removeFolder(gui, currentFolder);
			currentFolder = "Decorate";
			var f = gui.addFolder("Decorate");
			f.add(options, 'objetos', {Table: 0, Chair: 1, Sofa: 2, Floor_Lamp: 3, Ceiling_Lamp: 4})
				.name("Furniture")
				.onChange( function(ind){
					if(objectActual != undefined) scene.remove(objectActual);
					objectActual = objects[ind];
					scene.add(objectActual);
					renderer.domElement.focus();
				} );
			floorTiles.forEach(function(baldosaFila, indx, array){
				baldosaFila.forEach(function(baldosa, indy, array){
					domEvents.addEventListener(baldosa, "mouseover", prePutObject);
					domEvents.addEventListener(baldosa, "mousedown", putObject);

					listeners.push([baldosa, "mouseover", prePutObject]);
					listeners.push([baldosa, "mousedown", putObject]);
				});
			});
			objectActual = objects[options.objetos];
			scene.add(objectActual);
			f.open();
			renderer.domElement.focus();
		}
	};

	options = {
		paint: "1",
		color: "rgb(255,255,255)",
		floor: "0",
		colorFloor: "rgb(255,255,255)",
		puerta: "0",
		hora: 12,
		objetos: "0",
		ponerTejado: function(){
			if(roof == undefined){
				// Instancia de Geometry
				var malla = new THREE.Geometry();

				// Construir la lista de coordenadas y colores por vértice (8)
				var ajuste = 1;
				var distC = (maxx-minx)/5;
				var coordenadas = [ minx-ajuste,  wallHeight, minz-ajuste,
									minx-ajuste,  wallHeight, maxz+ajuste,
									maxx+ajuste,  wallHeight, maxz+ajuste,
									maxx+ajuste,  wallHeight, minz-ajuste,
									minx+distC,  2*wallHeight, (minz+maxz)/2,
									maxx-distC,  2*wallHeight, (minz+maxz)/2];

				// Triángulos por vértices en el sentido antihorario
				var indices = [ 
								1,2,4,//frente
								2,5,4,//frente
								2,3,5,//derecha
								1,4,0,//izquierda
								0,5,4,//detras
								0,3,5//detras
								];

				// Construye vértices y los inserta en la malla
				for(var i = 0; i < coordenadas.length; i += 3){
					var vertice = new THREE.Vector3(coordenadas[i], coordenadas[i + 1], coordenadas[i + 2]);
					malla.vertices.push(vertice);
				}

				// Construir las caras(triángulos) y los inserta en la malla
				for(var i = 0; i < indices.length; i += 3){
					// Cada media cara es un triángulo
					var triangulo = new THREE.Face3(indices[i], indices[i + 1], indices[i + 2]);
					malla.faces.push(triangulo);
				}

				malla.computeVertexNormals();
				malla.faceVertexUvs[0].push([new THREE.Vector2(1, 0),new THREE.Vector2(0, 0),new THREE.Vector2(4/5, 1)]);
				malla.faceVertexUvs[0].push([new THREE.Vector2(0, 0),new THREE.Vector2(1/5, 1),new THREE.Vector2(1, 1)]);
				malla.faceVertexUvs[0].push([new THREE.Vector2(1, 0),new THREE.Vector2(0, 0),new THREE.Vector2(0.5, 1)]);
				malla.faceVertexUvs[0].push([new THREE.Vector2(1, 0),new THREE.Vector2(0.5, 1),new THREE.Vector2(0, 0)]);
				malla.faceVertexUvs[0].push([new THREE.Vector2(0, 0),new THREE.Vector2(4/5, 1),new THREE.Vector2(1/5, 1)]);
				malla.faceVertexUvs[0].push([new THREE.Vector2(0, 0),new THREE.Vector2(1,0),new THREE.Vector2(4/5, 1)]);
				malla.uvsNeedUpdate = true;

				roofTexture.needsUpdate = true;
				roofTexture.repeat.set((maxx - minx) / (2*wallHeight), (maxz - minz) / (2*wallHeight));
				var tM = new THREE.MeshLambertMaterial({map:roofTexture, side: THREE.DoubleSide});	

				roof = new THREE.Mesh(malla, tM);
				roof.traverse( function(node) {
	        		if ( node instanceof THREE.Mesh ) { 
	        			node.castShadow = true; 
	        			node.receiveShadow = false; 
	        		}
	    		});
				scene.add(roof);
			}
			else{
				scene.remove(roof);
				roof = undefined;
			}
		},
	}

	var gui = new dat.GUI();
	gui.add(actions, 'Walls');
	gui.add(actions, 'Doors');
	gui.add(actions, 'Windows');
	gui.add(actions, 'Paint');
	gui.add(actions, 'Floor');
	gui.add(actions, 'Decorate');

	var common = gui.addFolder("General");
	common.add(options, "hora", 0, 24, 1).name("Hour of the day").onChange( function(h){
		changeHour(h);
	});
	common.add(options, "ponerTejado").name("Show/Hide ceiling");
	common.open();
}

function changeHour(h){
	var int = Math.max(0, -0.02041*h*h+0.5714*h-3)
	for(var i = 0; i < skyboxMats.length; i++){
		skyboxMats[i].opacity = int;
	}
	var x = 200*((14-h)/7);
	var y = Math.sqrt(40000 - x * x);
	sun.position.set(x,y,0);
	sun.intensity = int;
	var color = new THREE.Color(1, 0.5*int+0.5, int);
	sun.color = color;
}

function changeMode(){
	removeListeners();
	scene.remove(indicator);
	if(wallActual != undefined){
		scene.remove(wallActual);
		wallActual = undefined;
	}

	if(floorOrigin != undefined){
		cleanupFloor(undefined);
		floorOrigin = undefined;
	}

	if(paintOrigin != undefined){
		cleanupWalls(undefined);
		paintOrigin = undefined;
	}

	if(objectActual != undefined){
		scene.remove(objectActual);
		objectActual = undefined;
	}

	if(door != undefined){
		scene.remove(door);
		scene.remove(doorTrap);
		door = undefined;
		doorTrap = undefined;
	}
}

function removeListeners(){
	for(var i = 0; i < listeners.length; i++){
		var l = listeners[i];
		domEvents.removeEventListener(l[0], l[1], l[2]);
	}
	listeners = [];
}

function render(time){

	requestAnimationFrame(render);

	update(time);

	renderer.clear();

	// Draw the frames
	renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
	renderer.render(scene, camera);

	renderer.setViewport(0, 0, upperheadSide, upperheadSide);
	renderer.render(scene, cenital);
}

function update(time){
	cameraControls.update();
	TWEEN.update(time);
}

function updateAspectRatio(){
	//Renew the dimensions of the viewport and the projection matrix
	renderer.setSize(window.innerWidth, window.innerHeight);
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	upperheadSide = Math.min(window.innerWidth, window.innerHeight) / 4;
}



function preContruct(event){
	indicator.position.set(roundPos(event.intersect.point.x), wallHeight/2, roundPos(event.intersect.point.z));
	scene.add(indicator);
}

function startWall(event){
	if(wallActual == undefined){
		scene.remove(indicator);

		removeListeners();

		domEvents.addEventListener(floor, "click", startWall);
		domEvents.addEventListener(floor, "mousemove", buildingWall);
		domEvents.addEventListener(floor, "mousedown", cancelWall);

		listeners.push([floor, "click", startWall]);
		listeners.push([floor, "mousemove", buildingWall]);
		listeners.push([floor, "mousedown", cancelWall]);
	}
	else{
		finalWall = [roundPos(event.intersect.point.x), roundPos(event.intersect.point.z)];

		minx = Math.min(minx, startWall[0]);
		minz = Math.min(minz, startWall[1]);
		maxx = Math.max(maxx, startWall[0]);
		maxz = Math.max(maxz, startWall[1]);
		minx = Math.min(minx, finalWall[0]);
		minz = Math.min(minz, finalWall[1]);
		maxx = Math.max(maxx, finalWall[0]);
		maxz = Math.max(maxz, finalWall[1]);

		var d = Math.sqrt((startWall[0]-finalWall[0])*(startWall[0]-finalWall[0]) + (startWall[1]-finalWall[1])*(startWall[1]-finalWall[1]));
		if(startWall[0] == finalWall[0] || startWall[1] == finalWall[1]) d += wallWidth - 0.01;
		
		var mats = [];
		var murs = [];
		var tam = d/Math.round(d * floorGrain / L);
		wallTams.push(tam);
		var iniX, iniZ, angulo;
		var ajuste = (startWall[0] == finalWall[0] || startWall[1] == finalWall[1]) ? wallWidth/2 + 0.005 : 0;
		var derecho = true;
		if(startWall[0] == finalWall[0]){
			angulo = -Math.PI / 2;
			if(startWall[1] < finalWall[1]){
				iniX = startWall[0];
				iniZ = startWall[1] - ajuste;
			}
			else{
				iniX = finalWall[0];
				iniZ = finalWall[1] - ajuste;
				derecho = false;
			}
		}
		else {
			angulo = -Math.atan((finalWall[1]-startWall[1])/(finalWall[0]-startWall[0]));
			if(startWall[0] < finalWall[0]){
				iniX = startWall[0] - ajuste;
				iniZ = startWall[1];
			}
			else{
				iniX = finalWall[0] - ajuste;
				iniZ = finalWall[1];
				derecho = false;
			}
		}
		iniX += tam * Math.cos(angulo)/2;
		iniZ -= tam * Math.sin(angulo)/2;
		var nuevoMuro = [];
		var muroMateriales = [];
		var muroMaterialesInd = [];
		var muroPermitido = [];
		for(var i = 0; i < d/tam; i++){
			muroPermitido.push(true);
			var muroG = new THREE.BoxGeometry(tam, wallHeight, wallWidth);
			var fragmento = new THREE.Mesh( muroG, materialBuildup );
			fragmento.position.set( iniX, wallHeight/2, iniZ );
			fragmento.rotation.set(0,angulo,0);
			iniX += tam * Math.cos(angulo);
			iniZ -= tam * Math.sin(angulo);

			muroMateriales.push([muroMaterialDefecto,muroMaterialDefecto,muroMaterialDefecto,muroMaterialDefecto,muroMaterialDefecto,muroMaterialDefecto]);
			muroMaterialesInd.push([0,0,0,0,0,0]);
			var fragmentoReal = fragmento.clone();
			fragmentoReal.castShadow = true;
			fragmentoReal.receiveShadow = true;
			fragmentoReal.material = muroMaterialDefecto;
			scene.add(fragmentoReal);
			nuevoMuro.push(fragmentoReal);
			fragmentoReal.position.y = -wallHeight/2 - 0.1;
			new TWEEN.Tween(fragmentoReal.position)
				.to({y: wallHeight/2}, 500)
				.delay(derecho ? 80 * i : 80 * (d / tam - i))
				.easing(TWEEN.Easing.Elastic.Out)
				.start();
		}
		wallsAllowed.push(muroPermitido);
		wallAllowedDoor.push(muroPermitido.slice(0));
		walls.push(nuevoMuro);
		wallMaterials.push(muroMateriales);
		wallMaterialsInd.push(muroMaterialesInd);
		scene.remove(wallActual);
	}

	startWall = [roundPos(event.intersect.point.x), roundPos(event.intersect.point.z)];
	wallActual = new THREE.Mesh(geometricPillar, materialBuildup);
	wallActual.position.set(startWall[0], wallHeight/2, startWall[1]);
	scene.add(wallActual);
}

function buildingWall(event){
	scene.remove(wallActual);

	finalWall = [roundPos(event.intersect.point.x), roundPos(event.intersect.point.z)];
	var d = Math.sqrt((startWall[0]-finalWall[0])*(startWall[0]-finalWall[0]) + (startWall[1]-finalWall[1])*(startWall[1]-finalWall[1]));
	if(d == 0) d = wallWidth;
	var muroG = new THREE.BoxGeometry(d, wallHeight, wallWidth);

	wallActual = new THREE.Mesh( muroG, materialBuildup );

	wallActual.position.set((startWall[0]+finalWall[0])/2, wallHeight/2, (startWall[1]+finalWall[1])/2);

	var dir = Math.PI / 2;
	if(finalWall[0]-startWall[0] != 0)
		dir = Math.atan((finalWall[1]-startWall[1])/(finalWall[0]-startWall[0]));
	wallActual.rotation.set(0,-dir,0);

	scene.add(wallActual);
}

function cancelWall(event){
	if(event.origDomEvent.which == 3){
		scene.remove(wallActual);
		wallActual = undefined;

		removeListeners();

		domEvents.addEventListener(floor, "mousemove", preContruct);
		domEvents.addEventListener(floor, "click", startWall);

		listeners.push([floor, "mousemove", preContruct]);
		listeners.push([floor, "click", startWall]);
	}
}

function roundPos(x){
	var aux = L / floorGrain;
	return aux * Math.round(x/aux);
}

// paint

function prePaintedWall(event, indx, indy){
	if(options.paint > 0){
		var muro = event.target;
		var cara = event.intersect.face.materialIndex;
		var wallNormal = wallsAllowed[indx][indy];

		if(wallNormal){
			var material;
			if(options.paint == 9){
				material = new THREE.MeshLambertMaterial( {color: options.color, side: THREE.DoubleSide} );
			}
			else{
				var t = wallTextures[options.paint].clone();
				t.needsUpdate = true;
				var ancho = muro.geometry.parameters.width;
				t.repeat.set(ancho/wallHeight,1);
				material = new THREE.MeshLambertMaterial({map:t});
			}
			var materialesProvisionales = wallMaterials[indx][indy].slice(0);
			materialesProvisionales[cara] = material;
			muro.material = materialesProvisionales;
		}
		else{
			var subPanel1 = walls[indx][indy].children[0];
			var subPanel2 = walls[indx][indy].children[1];
			var height1 = subPanel1.geometry.parameters.height;
			var height2 = subPanel2.geometry.parameters.height;
			var material1, material2;
			if(options.paint == 9){
				material1 = new THREE.MeshLambertMaterial( {color: options.color, side: THREE.DoubleSide} );
				material2 = material1.clone()
			}
			else{
				var ancho = muro.geometry.parameters.width;
				var t1 = wallTextures[options.paint].clone();
				t1.needsUpdate = true;
				var t2 = t1.clone()
				t2.needsUpdate = true;
				t1.repeat.set(ancho/wallHeight,height1/wallHeight);
				t2.repeat.set(ancho/wallHeight,height2/wallHeight);
				t2.offset.y = (wallHeight - height2) / wallHeight;
				material1 = new THREE.MeshLambertMaterial({map:t1});
				material2 = new THREE.MeshLambertMaterial({map:t2});
			}
			var materialesProvisionales1 = wallMaterials[indx][indy][0].slice(0);
			var materialesProvisionales2 = wallMaterials[indx][indy][1].slice(0);
			materialesProvisionales1[cara] = material1;
			materialesProvisionales2[cara] = material2;
			subPanel1.material = materialesProvisionales1;
			subPanel2.material = materialesProvisionales2;
		}
	}
}

function unpaintWall(event, indx, indy){
	var muroNormal = wallsAllowed[indx][indy];
	if(muroNormal)
		event.target.material = wallMaterials[indx][indy];
	else{
		var subPanel1 = walls[indx][indy].children[0];
		var subPanel2 = walls[indx][indy].children[1];
		subPanel1.material = wallMaterials[indx][indy][0];
		subPanel2.material = wallMaterials[indx][indy][1];
	}
}

function startWallPaint(event, indx, indy){
	if(options.paint > 0){
		paintOrigin = [indx, indy];

		removeListeners();
		walls[indx].forEach(function(panel, ind, array){
			panels = [];
			if(wallsAllowed[indx][ind])
				panels = [panel]
			else
				panels = panel.children;
			for(var i = 0; i < panels.length; i++){
				var pintandoAux = function(event){paintingWall(event, ind);};
				var terminarPintarAux = function(event){finishedPaintedWall(event, ind);};

				domEvents.addEventListener(panels[i], "mouseover", pintandoAux);
				domEvents.addEventListener(panels[i], "mousedown", terminarPintarAux);

				listeners.push([panels[i], "mouseover", pintandoAux]);
				listeners.push([panels[i], "mousedown", terminarPintarAux]);
			}
		});
	}
}

function paintingWall(event, ind){
	if(options.paint > 0){
		var wallContainer = walls[paintOrigin[0]];
		var min = Math.min(ind, paintOrigin[1]);
		var max = Math.max(ind, paintOrigin[1]);
		var indx = paintOrigin[0];

		var cara = event.intersect.face.materialIndex;

		var material;
		var ancho = event.target.geometry.parameters.width;
		if(options.paint == 9){
			material = new THREE.MeshLambertMaterial( {color: options.color, side: THREE.DoubleSide} );
		}
		else{
			var t = wallTextures[options.paint].clone();
			t.needsUpdate = true;
			t.repeat.set(ancho/wallHeight,1);
			material = new THREE.MeshLambertMaterial({map:t});
		}

		for(var i = 0; i < wallContainer.length; i++){
			if(i >= min && i <= max){
				if(wallsAllowed[paintOrigin[0]][i]){
					var materialesProvisionales = wallMaterials[indx][i].slice(0);
					materialesProvisionales[cara] = material;
					wallContainer[i].material = materialesProvisionales;
				}
				else{
					var material1, material2;
					var frag1 = wallContainer[i].children[0];
					var frag2 = wallContainer[i].children[1];
					if(options.paint == 9){
						material1 = material.clone();
						material2 = material.clone();
					}
					else{
						var alto1 = frag1.geometry.parameters.height;
						var alto2 = frag2.geometry.parameters.height;
						var t1 = wallTextures[options.paint].clone();
						t1.needsUpdate = true;
						var t2 = t1.clone()
						t2.needsUpdate = true;
						t1.repeat.set(ancho/wallHeight,alto1/wallHeight);
						t2.repeat.set(ancho/wallHeight,alto2/wallHeight);
						t2.offset.y = (wallHeight - alto2) / wallHeight;
						material1 = new THREE.MeshLambertMaterial({map:t1});
						material2 = new THREE.MeshLambertMaterial({map:t2});
					}
					var materialesProvisionales1 = wallMaterials[indx][i][0].slice(0);
					var materialesProvisionales2 = wallMaterials[indx][i][1].slice(0);
					materialesProvisionales1[cara] = material1;
					materialesProvisionales2[cara] = material2;
					frag1.material = materialesProvisionales1;
					frag2.material = materialesProvisionales2;
				}
			}
			else{
				if(wallsAllowed[paintOrigin[0]][i]){
					wallContainer[i].material = wallMaterials[paintOrigin[0]][i];
				}
				else{
					wallContainer[i].children[0].material = wallMaterials[paintOrigin[0]][i][0];
					wallContainer[i].children[1].material = wallMaterials[paintOrigin[0]][i][1];
				}
			}
		}
	}
}

function finishedPaintedWall(event, ind){
	if(event != undefined && event.origDomEvent.which == 1){
		var min = Math.min(ind, paintOrigin[1]);
		var max = Math.max(ind, paintOrigin[1]);
		var cara = event.intersect.face.materialIndex;
		var indx = paintOrigin[0];

		var muroContenedor = walls[paintOrigin[0]];
		for(var i = min; i <= max; i++){
			if(wallsAllowed[indx][i]){
				wallMaterials[indx][i] = muroContenedor[i].material;
			}
			else{
				wallMaterials[indx][i] = [muroContenedor[i].children[0].material, muroContenedor[i].children[1].material];
			}
			wallMaterialsInd[indx][i][cara] = options.paint;
		}
	}
	else{
		cleanupWalls();
	}
	paintOrigin = undefined;
	removeListeners();

	walls.forEach(function(wall, indx, array){
		wall.forEach(function(panel, indy, array){
			var panels = []
			if(wallsAllowed[indx][indy]){
				panels = [panel]
			}
			else{
				panels = panel.children;
			}
			for(var i = 0; i < panels.length; i++){
				var prePintarAux = function(event){ prePaintedWall(event, indx, indy);};
				var desPintarAux = function(event){unpaintWall(event, indx, indy);};
				var empezarPintarAux = function(event){startWallPaint(event, indx, indy);};

				domEvents.addEventListener(panels[i], "mouseover", prePintarAux);
				domEvents.addEventListener(panels[i], "mouseout", desPintarAux);
				domEvents.addEventListener(panels[i], "mousedown", empezarPintarAux);

				listeners.push([panels[i], "mouseover", prePintarAux]);
				listeners.push([panels[i], "mouseout", desPintarAux]);
				listeners.push([panels[i], "mousedown", empezarPintarAux]);
			}
		});
	});
}

function cleanupWalls(){
	var indx = paintOrigin[0];
	var muroContenedor = walls[indx];
	for(var i = 0; i < muroContenedor.length; i++){
		if(wallsAllowed[indx][i])
			muroContenedor[i].material = wallMaterials[indx][i];
		else{
			muroContenedor[i].children[0].material = wallMaterials[indx][i][0];
			muroContenedor[i].children[1].material = wallMaterials[indx][i][1];
		}
	}
}

// Floor

function prePutFloor(event){
	if(typeof(options.floor) == "string" && options.floor >= 0){
		var baldosa = event.target;

		var material;
		if(options.floor == 10){
			material = new THREE.MeshLambertMaterial( {color: options.colorFloor, side: THREE.DoubleSide} );
		}
		else{
			var t = floorTextures[options.floor].clone();
			t.needsUpdate = true;
			material = new THREE.MeshLambertMaterial({map:t, side: THREE.DoubleSide});
		}
		event.target.material = material;
	}
}

function afterPutFloor(event){
	var w = L / floorGrain; 
	var lim = L/2 - (w / 2);
	var x1 = (event.target.position.x + lim) / w;
	var z1 = (event.target.position.z - lim) / -w;
	event.target.material = floorTextures[z1][x1];
}

function startFloor(event){
	if(typeof(options.floor) == "string" && options.floor >= 0){
		floorOrigin = event.target;

		removeListeners();
		floorTiles.forEach(function(baldosaFila, indx, array){
			baldosaFila.forEach(function(baldosa, indy, array){
				domEvents.addEventListener(baldosa, "mouseover", puttingupFloor);
				domEvents.addEventListener(baldosa, "mousedown", endFloor);

				listeners.push([baldosa, "mouseover", puttingupFloor]);
				listeners.push([baldosa, "mousedown", endFloor]);
			});
		});
	}
}

function puttingupFloor(event){
	cleanupFloor();
	if(typeof(options.floor) == "string" && options.floor >= 0){
		var baldosa = event.target;

		var material;
		if(options.floor == 10){
			material = new THREE.MeshLambertMaterial( {color: options.colorFloor, side: THREE.DoubleSide} );
		}
		else{
			var t = floorTextures[options.floor].clone();
			t.needsUpdate = true;
			material = new THREE.MeshLambertMaterial({map:t, side: THREE.DoubleSide});
		}

		var w = L / floorGrain; 
		var lim = L/2 - (w / 2);
		var x1 = (floorOrigin.position.x + lim) / w;
		var z1 = (floorOrigin.position.z - lim) / -w;

		var x2 = (baldosa.position.x + lim) / w;
		var z2 = (baldosa.position.z - lim) / -w;

		var finx = Math.max(x1,x2);
		var inix = Math.min(x1,x2);
		var finz = Math.max(z1,z2);
		var iniz = Math.min(z1,z2);

		for(var z = iniz; z <= finz; z++){
			for(var x = inix; x <= finx; x++){
				floorTiles[z][x].material = material;	
			}
		}
	}
}

function endFloor(event){
	if(event != undefined && event.origDomEvent.which == 1){
		for(var z = 0; z < floorTextures.length; z++){
			for(var x = 0; x < floorTextures[z].length; x++){
				floorTextures[z][x] = floorTiles[z][x].material;
			}
		}
	}
	else{
		cleanupFloor();
	}
	floorOrigin = undefined;

	removeListeners();
	floorTiles.forEach(function(baldosaFila, indx, array){
		baldosaFila.forEach(function(baldosa, indy, array){
			domEvents.addEventListener(baldosa, "mouseover", prePutFloor);
			domEvents.addEventListener(baldosa, "mouseout", afterPutFloor);
			domEvents.addEventListener(baldosa, "mousedown", startFloor);

			listeners.push([baldosa, "mouseover", prePutFloor]);
			listeners.push([baldosa, "mouseout", afterPutFloor]);
			listeners.push([baldosa, "mousedown", startFloor]);
		});
	});
}

function cleanupFloor(){
	for(var z = 0; z < floorTiles.length; z++){
		for(var x = 0; x < floorTiles[z].length; x++){
			floorTiles[z][x].material = floorTextures[z][x];	
		}
	}
}

// Doors
function prePutDoor(event, indx, indy){
	var panel = walls[indx][indy];
	var rotPanel = panel.rotation.y;
	var hip = doorChar[1];
	var hipt = doorChar[2]
	var co = hip * Math.sin(rotPanel);
	var cc = hip * Math.cos(rotPanel);
	var cot = hipt * Math.sin(rotPanel);
	var cct = hipt * Math.cos(rotPanel);

	scene.add(door);
	scene.add(doorTrap);

	door.position.set(panel.position.x + co, doorChar[0], panel.position.z + cc);
	doorTrap.position.set(panel.position.x - cot, doorChar[0], panel.position.z - cct);

	var ang = rotPanel + doorChar[3];
	if(ang >= Math.PI) ang -= Math.PI;
	else if(ang <= -Math.PI) ang += Math.PI;
	door.rotation.y = ang
	doorTrap.rotation.y = ang;

}
function afterPutDoor(event, indx, indy){
	var panel = walls[indx][indy];
	var rotPanel = panel.rotation.y;
	var hip = doorChar[1];
	var co = hip * Math.sin(rotPanel);
	var cc = hip * Math.cos(rotPanel);

	if(door.position.x==panel.position.x + co && door.position.z==panel.position.z + cc){
		scene.remove(door);
		scene.remove(doorTrap);
	}
}
function putDoor(event, indx, indy){
	door = door.clone();
	doorTrap = doorTrap.clone();
	wallAllowedDoor[indx][indy] = false;
	var panel = walls[indx][indy];
	for(var i = 0; i < listeners.length; i++){
		var l = listeners[i];
		if(l[0] == panel){
			domEvents.removeEventListener(l[0], l[1], l[2]);
			listeners.splice(i, 1);
			i--;
		}
	}
}

// Ventanas
function prePutWindow(event, indx, indy){
	var panel = walls[indx][indy];
	var rotPanel = panel.rotation.y;
	var scalex = wallTams[indx] * floorGrain / L;

	windowAsset.position.set(panel.position.x, windowHeight, panel.position.z);
	windowAsset.rotation.y = rotPanel;
	windowAsset.scale.x = scalex;
	scene.add(windowAsset);

	openPanel.position.set(panel.position.x, panel.position.y, panel.position.z);
	openPanel.rotation.y = panel.rotation.y;
	openPanel.scale.x = scalex;
	scene.add(openPanel);
	openPanel.material = wallMaterials[indx][indy];
	openPanel.traverse( function(node) {
        if ( node instanceof THREE.Mesh ) { 
        	materiales = [];
			var ancho = node.geometry.parameters.width;
			var alto = node.geometry.parameters.height;
        	for(var i = 0; i < 6; i++){
        		var texInd = wallMaterialsInd[indx][indy][i]
        		if(texInd == 11)
        			materiales.push(wallMaterials[indx][indy][i])
        		else{
					var t = wallTextures[texInd].clone();
					t.needsUpdate = true;
					t.repeat.set(ancho/wallHeight, alto/wallHeight);
					if(node.position.y > 0){
						t.offset.y = (wallHeight - alto) / wallHeight;
					}
					materiales.push(new THREE.MeshLambertMaterial({map:t}));
        		}
        	}
        	node.material = materiales;
        }
    });

	scene.remove(panel);
}

function afterPutWindow(event, indx, indy){
	var panel = walls[indx][indy];
	if(windowAsset.position.x == panel.position.x && windowAsset.position.z == panel.position.z){
		scene.remove(windowAsset);
		scene.remove(openPanel);
	}
	scene.add(panel);
}

function putWindow(event, indx, indy){
	wallsAllowed[indx][indy] = false;
	var panel = walls[indx][indy];
	for(var i = 0; i < listeners.length; i++){
		var l = listeners[i];
		if(l[0] == panel){
			domEvents.removeEventListener(l[0], l[1], l[2]);
			listeners.splice(i, 1);
			i--;
		}
	}
	walls[indx][indy] = openPanel;
	wallMaterials[indx][indy] = []
	openPanel.traverse( function(node) {
        if ( node instanceof THREE.Mesh ) { 
        	wallMaterials[indx][indy].push(node.material);
        }
    });

	windowAsset = windowAsset.clone();
	openPanel = openPanel.clone();
}

// Objects

function prePutObject(event){
	objectActual.position.x = event.intersect.point.x + objectGapX[options.objetos]
	objectActual.position.z = event.intersect.point.z + objectGapZ[options.objetos]
}
function putObject(event){
	objetoAColocar = objectActual.clone();
	scene.add(objetoAColocar);
}


function removeFolder(gui, name){
	var folder = gui.__folders[name];
  	if (!folder) {
    	return;
  	}
  	folder.close();
  	gui.__ul.removeChild(folder.domElement.parentNode);
  	delete gui.__folders[name];
  	gui.onResize();
}