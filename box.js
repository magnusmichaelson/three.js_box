import * as THREE from './three.module.js'; 
import { PointerLockControls } from './PointerLockControls.js';
var camera;
var controls;
var controlsEnabled = false;
var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var moveUp = false;
var moveDown = false;
var objectInLineOfSightCurrent;
var objectInLineOfSightPrevious;
var prevTime;
var renderer;
var scene;
var speed = 6;
var speedBoost = false;
var velocity;
rendererResize();
window.addEventListener("resize", rendererResize, false);
start();
function mouseClick(event) {
    if (event.button == 0) {
        console.log(objectInLineOfSightCurrent);
    }
}
function animate() {
    var closestDistance;
    var lineOfSightResult;
    requestAnimationFrame(animate);
    lineOfSightResult = animationFindLineOfSight();
    closestDistance = lineOfSightResult["closestDistance"];
    objectInLineOfSightCurrent = lineOfSightResult["closest"];
    if (controlsEnabled) {
        var time = performance.now();
        var delta = (time - prevTime);
        if (speedBoost) {
            delta = delta * 5 / 1000;
        }
        else {
            delta = delta / 1000;
        }
        velocity.x = 0;
        velocity.z = 0;
        if (moveForward)
            velocity.z = -speed * delta;
        if (moveBackward)
            velocity.z = speed * delta;
        if (moveLeft)
            velocity.x = -speed * delta;
        if (moveRight)
            velocity.x = speed * delta;
        controls.getObject().translateX(velocity.x);
        controls.getObject().translateZ(velocity.z);
        if (moveDown) {
            controls.getObject().position.y -= (speed * delta);
        }
        if (moveUp) {
            controls.getObject().position.y += (speed * delta);
        }
        prevTime = time;
    }
    renderer.render(scene, camera);
}
function animationFindLineOfSight() {
    var cameraDirection;
    var cameraPostion;
    var closest;
    var closestDistance;
    var intersects;
    var raycaster = new THREE.Raycaster();
    cameraPostion = new THREE.Vector3();
    cameraDirection = new THREE.Vector3();
    closestDistance = -1;
    camera.getWorldPosition(cameraPostion);
    camera.getWorldDirection(cameraDirection);
    raycaster.set(cameraPostion, cameraDirection);
    var intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0) {
        for (var i = 0; i < intersects.length; i++) {
            if (closestDistance == -1) {
                closestDistance = intersects[i].distance;
                closest = intersects[i].object;
            }
            else {
                if (intersects[i].distance < closestDistance) {
                    closestDistance = intersects[i].distance;
                    closest = intersects[i].object;
                }
            }
        }
    }
    return ({
        closest: closest,
        closestDistance: closestDistance
    });
}
function start() {
    var havePointerLock;
    havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
    if (havePointerLock) {
        document.addEventListener('pointerlockchange', pointerlockchange, false);
        document.addEventListener('mozpointerlockchange', pointerlockchange, false);
        document.addEventListener('webkitpointerlockchange', pointerlockchange, false);
        generateScene();
        animate();
    }
    else {
        console.log('Your browser doesn\'t seem to support Pointer Lock API');
    }
}
function generateScene() {
    addEventListeners();
    addThreeJsContent();
    buildRacks();
    rendererResize();
}
function buildRacks() {
    var edges;
    var geometry;
    var line;
    var material;
    var mesh;
    var countRow;
    var countRack;
    for (countRow = 0; countRow < 10; countRow++){
        for (countRack = 0; countRack < 10; countRack++){
            geometry = new THREE.BoxGeometry(1, 3, 1);
            material = new THREE.MeshStandardMaterial();
            material.color.setRGB(1, 1, 1);
            mesh = new THREE.Mesh(geometry, material);
            mesh.position.x = countRack + 2;;
            mesh.position.y = 1.5;
            mesh.position.z = (countRow * 2) + 2;
            mesh.name = "rack_" + countRow + "+" + countRack;
            scene.add(mesh);
            edges = new THREE.EdgesGeometry(geometry);
            material = new THREE.LineBasicMaterial();
            material.color.setRGB(0,0,0);
            line = new THREE.LineSegments(edges, material);
            mesh.add(line);
        }
    }
}
function addCuboid(blockName, blockSysid, color, highlightable, type, lineColor, xCenter, xSize, yCenter, ySize, zCenter, zSize) {
    var edges;
    var geometry;
    var line;
    var material;
    var mesh;
    geometry = new THREE.BoxGeometry(ySize, zSize, xSize);
    material = new THREE.MeshStandardMaterial();
    material.color.setRGB(color["red"], color["green"], color["blue"]);
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = yCenter;
    mesh.position.y = zCenter;
    mesh.position.z = xCenter;
    mesh.name = blockName;
    mesh.userData.highlightable = highlightable;
    mesh.userData.sysid = blockSysid;
    mesh.userData.type = type;
    scene.add(mesh);
    edges = new THREE.EdgesGeometry(geometry);
    material = new THREE.LineBasicMaterial();
    material.color.setRGB(lineColor["red"], lineColor["green"], lineColor["blue"]);
    line = new THREE.LineSegments(edges, material);
    mesh.add(line);
}
function addThreeJsContent() {
    var cameraPositionX = -4.0;
    var cameraPositionY = 1.9;
    var cameraPositionZ = -4.0;
    var cameraRotationX = 3.141;
    var cameraRotationY = -0.785;
    var cameraRotationZ = 3.141;
    var crosshair;
    var geometry;
    var light;
    var material;
    velocity = new THREE.Vector3();
    scene = new THREE.Scene();
    light = new THREE.AmbientLight(0xffffff);
    scene.add(light);
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 1000);
    controls = new PointerLockControls( camera, document.body );
    controls.getObject().position.set(cameraPositionX, cameraPositionY, cameraPositionZ);
    controls.getObject().rotation.set(cameraRotationX, cameraRotationY, cameraRotationZ);
    scene.add(camera);
    geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(0, 0.001, -0.1));
    geometry.vertices.push(new THREE.Vector3(0, -0.001, -0.1));
    geometry.vertices.push(new THREE.Vector3(0.001, 0, -0.1));
    geometry.vertices.push(new THREE.Vector3(-0.001, 0, -0.1));
    material = new THREE.LineBasicMaterial({ color: 0x000000 });
    crosshair = new THREE.LineSegments(geometry, material);
    camera.add(crosshair);
    renderer = new THREE.WebGLRenderer({ antialias: true, canvas: document.getElementById('my_canvas') });
    renderer.setClearColor(0xf0f3f4);
}
function addEventListeners() {
    document.getElementById('my_canvas').addEventListener('click', pointerLockRequest, false);
    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('keyup', onKeyUp, false);
}
function pointerLockRequest() {
    var element = document.body;
    element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
    element.requestPointerLock();
}
function pointerlockchange() {
    var element = document.body;
    if (document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element) {
        controlsEnabled = true;
        moveForward = false;
        moveBackward = false;
        moveLeft = false;
        moveRight = false;
        moveUp = false;
        moveDown = false;
        prevTime = performance.now();
        document.addEventListener('click', mouseClick, false);
    }
    else {
        document.removeEventListener('click', mouseClick, false);
        controlsEnabled = false;
    }
}
function onKeyDown(event) {
    switch (event.keyCode) {
        case 38: // up
        case 87: // w
            moveForward = true;
            break;
        case 37: // left
        case 65: // a
            moveLeft = true;
            break;
        case 40: // down
        case 83: // s
            moveBackward = true;
            break;
        case 39: // right
        case 68: // d
            moveRight = true;
            break;
        case 16: // left shift
            moveDown = true;
            break;
        case 32: // space
            moveUp = true;
            break;
        case 69: // e
            speedBoost = true;
            break;
    }
}
function onKeyUp(event) {
    switch (event.keyCode) {
        case 38: // up
        case 87: // w
            moveForward = false;
            break;
        case 37: // left
        case 65: // a
            moveLeft = false;
            break;
        case 40: // down
        case 83: // s
            moveBackward = false;
            break;
        case 39: // right
        case 68: // d
            moveRight = false;
            break;
        case 16: // left shift
            moveDown = false;
            break;
        case 32: // space
            moveUp = false;
            break;
        case 69: // e
            speedBoost = false;
            break;
    }
}
function rendererResize() {
    var canvasHeight;
    var canvasWidth;
    var divElement;
    canvasWidth = window.innerWidth - 16;
    canvasHeight = window.innerHeight - 16;
    divElement = document.getElementById("my_canvas");
    divElement.style.position = 'absolute';
    divElement.style.left = "0px";
    divElement.style.top = "0px";
    divElement.style.width = canvasWidth + "px";
    divElement.style.height = canvasHeight + "px";
    if (camera) {
        camera.aspect = canvasWidth / canvasHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvasWidth, canvasHeight);
    }
}