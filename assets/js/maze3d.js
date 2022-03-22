
(function() {
    var renderer, camera, scene,timeout,platformWidth,platformHeigh,newpositionX,newpositionY;
    var keyboardInput, miniMap, levelHelper, cameraHelper;
    var width = window.innerWidth * 0.995;
    var height = window.innerHeight * 0.995;
    var MessContent = document.createElement("div");
    var canvas_map_3D = document.getElementById("canvasContainer");
    var playsound=document.getElementById("bumpSound")
    var loader = new THREE.TextureLoader();
    var map = new Array();
    var running = true;

    function draw() {
        renderer.render(scene, camera);
    }

    function EngineMaze() {
        renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        renderer.setSize(width, height);
        renderer.clear();

        scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0x777777, 25, 1000);

        camera = new THREE.PerspectiveCamera(50, width / height, 1, 10000);
        camera.position.y = 50;

        canvas_map_3D.appendChild(renderer.domElement);

        keyboardInput = new Group5.Input();
        levelHelper = new Group5.GameHelper.LevelHelper();
        cameraHelper = new Group5.GameHelper.CameraHelper(camera);

        window.addEventListener("resize", function() {
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        Content()
        
    }

    function Content(){

        MessContent.style.position = "absolute";
        MessContent.style.backgroundColor = "#666";
        MessContent.style.border = "1px solid #333";

        var mess= document.createElement("h1");
        mess.innerHTML = "Use Up/Down/Left/Right arrows or the virtual pad to move and rotate the camera";
        mess.style.textAlign = "center";
        mess.style.color = "#ddd";
        mess.style.padding = "15px";
        MessContent.appendChild(mess);

        document.body.appendChild(MessContent);

        MessContent.style.left = (window.innerWidth / 2 - MessContent.offsetWidth / 2) + "px";
        MessContent.style.top = (window.innerHeight / 2 - MessContent.offsetHeight / 2) + "px";
        
        timeout = setTimeout(function() {
            clearTimeout(timeout);
            document.body.removeChild(MessContent);
        }, 1500);
   }

    function initializeScene() {

        miniMap = new Group5.Gui.MiniMap(map[0].length, map.length, "canvasContainer");
        miniMap.create();
        
        //  background of platform and sky
        platform_skyline()
        //  background of wall
        generation_wall()

        shaderLight()
    }

    function platform_skyline(){
        
        platformWidth = map[0].length * 100;
        platformHeight = map.length * 100;

        var platform_skyline_ground = new THREE.BoxGeometry(platformWidth, 8, platformHeight);
       
        // backgound of platform
        var ground_platform = new THREE.Mesh(platform_skyline_ground, new THREE.MeshPhongMaterial({
            map: loader.load("assets/images/textures/ground_diffuse.jpg"),
        }));

        generateTexture(ground_platform.material.map, 2);
        ground_platform.position.set(-50, 1, -50);
        scene.add(ground_platform);

       //  backgound of sky
        var ground_sky = new THREE.Mesh(platform_skyline_ground, new THREE.MeshPhongMaterial({
            map: loader.load("assets/images/textures/ground_sky.jpg")
        }));

        generateTexture(ground_sky.material.map, 16);
        ground_sky.position.set(-50, 100, -50);
        scene.add(ground_sky);
    }

    function generation_wall(){
        var size = {
            x: 100,
            y: 100,
            z: 100
        };

        var position = { 
            x: 0, 
            y: 0, 
            z: 0 
        };

        var wallGeometry = new THREE.BoxGeometry(size.x, size.y, size.z); /// three dimension 
        var wallMaterial = new THREE.MeshPhongMaterial({
            map: loader.load("assets/images/textures/wall_ground.jpg")
        });
        generateTexture(wallMaterial.map, 2);

        // Map generation
        for (var y = 0, ly = map.length; y < ly; y++) {
            for (var x = 0, lx = map[x].length; x < lx; x++) {
                position.x = -platformWidth / 2 + size.x * x;
                position.y = 50;
                position.z = -platformHeight / 2 + size.z * y;

                if (map[y][x] > 1) {
                    var wall3D = new THREE.Mesh(wallGeometry, wallMaterial);
                    wall3D.position.set(position.x, position.y, position.z);
                    scene.add(wall3D);
                }
                if (x == 0 && y == 0) {
                    cameraHelper.origin.x = position.x;
                    cameraHelper.origin.y = position.y;
                    cameraHelper.origin.z = position.z;
                }
                if (map[y][x] === "D") {
                    camera.position.set(position.x, position.y, position.z);
                    cameraHelper.origin.position.x = position.x;
                    cameraHelper.origin.position.y = position.y;
                    cameraHelper.origin.position.z = position.z;
                    cameraHelper.origin.position.mapX = x;
                    cameraHelper.origin.position.mapY = y;
                    cameraHelper.origin.position.mapZ = 0;
                }

                miniMap.draw(x, y, map[y][x]);
            }
        }
    }

    function shaderLight(){
        var directionalLight = new THREE.HemisphereLight(0x192F3F, 0x28343A, 2);
        directionalLight.position.set(1, 1, 0);
        scene.add(directionalLight);
    }

    function moveCamera(direction, delta) {
        var collides = false;
        var rotation = camera.rotation.y;
        var offset = 50;

        var position = {
            x: camera.position.x,
            z: camera.position.z
        };
        
        var supportmove = {
            translation: (typeof delta != "undefined") ? delta.translation : cameraHelper.translation,
            rotation: (typeof delta != "undefined") ? delta.rotation : cameraHelper.rotation
        };

        switch (direction) {
            case "up":
                position.x -= Math.sin(-camera.rotation.y) * -supportmove.translation;
                position.z -= Math.cos(-camera.rotation.y) * supportmove.translation;
                break;
            case "right":
                rotation -= supportmove.rotation;
                break;
            case "down":
                position.x -= Math.sin(camera.rotation.y) * -supportmove.translation;
                position.z += Math.cos(camera.rotation.y) * supportmove.translation;
                break;
            case "left":
                rotation += supportmove.rotation;
                break;
            
        }

        // next position
        newpositionX = Math.abs(Math.floor(((cameraHelper.origin.x + (position.x * -1) + (offset)) / 100)));
        newpositionY = Math.abs(Math.floor(((cameraHelper.origin.z + (position.z * -1) + (offset)) / 100)));

        // Stay on the map
        if (newpositionX >= map[0].length) {
            newpositionX = map[0].length;
        }
        if (newpositionX < 0) {
            newpositionX = 0;
        }
        if (newpositionY >= map.length) {
            newpositionY = map.length;
        }
        if (newpositionY < 0) {
            newpositionY = 0;
        }
        if (map[newpositionY][newpositionX] != 1 && !isNaN(map[newpositionY][newpositionX])) {
            collides = true;
        }
        else if (map[newpositionY][newpositionX] == "A") {
            // Game is over
            running = false;
        }
        if (collides == false) {
            camera.rotation.y = rotation;
            camera.position.x = position.x;
            camera.position.z = position.z;
            miniMap.update({
                x: newpositionX,
                y: newpositionY
            });
        }
        else {
            playsound.play();
        }
    }

    function update() {
        if (keyboardInput.keys.up) {
            moveCamera("up");
        } else if (keyboardInput.keys.down) {
            moveCamera("down");
        }

        if (keyboardInput.keys.left) {
            moveCamera("left");
        } else if (keyboardInput.keys.right) {
            moveCamera("right");
        }

        // Virtual pad
        var params = {
            rotation: 0.05,
            translation: 5
        };

        if (keyboardInput.joykeys.up) {
            moveCamera("up", params);
        } else if (keyboardInput.joykeys.down) {
            moveCamera("down", params);
        }

        if (keyboardInput.joykeys.left) {
            moveCamera("left", params);
        } else if (keyboardInput.joykeys.right) {
            moveCamera("right", params);
        }
    }


    function mainLoop() {
        if (running) {
            update();
            draw();
            window.requestAnimationFrame(mainLoop, renderer.domElement);
        } else {
            endScreen();
        }
    }

    function endScreen() {
        if (levelHelper.isFinished || levelHelper.isMobile) {
            alert("Good job, The game is over\n\nThanks you for playing!");
            document.location.href = "https://daohailong.github.io/Final_ComputerGraphic/";
        } else {
            // Remove all childrens.
            for (var i = 0, l = scene.children.length; i < l; i++) {
                scene.remove(scene.children[i]);
            }
            renderer.clear();
            scene = new THREE.Scene();
            loadLevel(levelHelper.getNext());
            running = true;
        }
    }
    
    function generateTexture(texture, size) {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.x = size;
        texture.repeat.y = size;
        return texture;
    }

    // Game starting
    function launch() {
        initializeScene();
        mainLoop();
    }

     // Level loading
     function loadLevel(level) {
        var ajax = new XMLHttpRequest();
        ajax.open("GET", "assets/maps/maze3d-" + level + ".json", true);
        ajax.onreadystatechange = function() {
            if (ajax.readyState == 3) {
                map = JSON.parse(ajax.responseText);
                launch();
            }
        }
        ajax.send(null);
    }

    window.onload = function() {
        EngineMaze();
        var level = 1; // Get parameter
        if (level > 0 || level <= levelHelper.count) {
            levelHelper.current = level;
            levelHelper.next = level + 1;
            loadLevel(level);
        } else {
            levelHelper.current = 1;
            levelHelper.next = 2;
            loadLevel(1);
        }
    };
})();