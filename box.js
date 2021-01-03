import * as THREE from './three.module.js';
import { PointerLockControls } from './pointerLockControls.js';
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
var prevTime;
var renderer;
var scene;
rendererResize();
start();
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
function addEventListeners() {
    window.addEventListener("resize", rendererResize, false);
    // @ts-ignore
    document.getElementById('my_canvas').addEventListener('click', pointerLockRequest, false);
    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('keyup', onKeyUp, false);
}
function addThreeJsContent() {
    var crosshair;
    var geometry;
    var light;
    var material;
    // @ts-ignore
    scene = new THREE.Scene();
    // @ts-ignore
    light = new THREE.AmbientLight(0xffffff);
    // @ts-ignore
    scene.add(light);
    // @ts-ignore
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 1000);
    // @ts-ignore
    controls = new PointerLockControls(camera, document.body);
    controls.getObject().position.set(-4.0, 1.9, -4.0);
    controls.getObject().rotation.set(3.141, -0.785, 3.141);
    scene.add(camera);
    // @ts-ignore
    geometry = new THREE.Geometry();
    // @ts-ignore
    geometry.vertices.push(new THREE.Vector3(0, 0.001, -0.1));
    // @ts-ignore
    geometry.vertices.push(new THREE.Vector3(0, -0.001, -0.1));
    // @ts-ignore
    geometry.vertices.push(new THREE.Vector3(0.001, 0, -0.1));
    // @ts-ignore
    geometry.vertices.push(new THREE.Vector3(-0.001, 0, -0.1));
    // @ts-ignore
    material = new THREE.LineBasicMaterial({ color: 0x000000 });
    // @ts-ignore
    crosshair = new THREE.LineSegments(geometry, material);
    camera.add(crosshair);
    // @ts-ignore
    renderer = new THREE.WebGLRenderer({ antialias: true, canvas: document.getElementById('my_canvas') });
    renderer.setClearColor(0xf0f3f4);
}
function buildRacks() {
    var countRow;
    var countRack;
    var edges;
    var geometry;
    var line;
    var material;
    var mesh;
    for (countRow = 0; countRow < 10; countRow++) {
        for (countRack = 0; countRack < 10; countRack++) {
            // @ts-ignore
            geometry = new THREE.BoxGeometry(1, 3, 1);
            // @ts-ignore
            material = new THREE.MeshStandardMaterial();
            material.color.setRGB(1, 1, 1);
            // @ts-ignore
            mesh = new THREE.Mesh(geometry, material);
            mesh.position.x = countRack + 2;
            ;
            mesh.position.y = 1.5;
            mesh.position.z = (countRow * 2) + 2;
            mesh.name = "rack_" + countRow + "+" + countRack;
            scene.add(mesh);
            // @ts-ignore
            edges = new THREE.EdgesGeometry(geometry);
            // @ts-ignore
            material = new THREE.LineBasicMaterial();
            material.color.setRGB(0, 0, 0);
            // @ts-ignore
            line = new THREE.LineSegments(edges, material);
            mesh.add(line);
        }
    }
}
function rendererResize() {
    var canvasHeight;
    var canvasWidth;
    var divElement;
    canvasWidth = window.innerWidth - 2;
    canvasHeight = window.innerHeight - 2;
    // @ts-ignore
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
function animate() {
    var closestDistance;
    var lineOfSightResult;
    var velocity;
    var time;
    var delta;
    // @ts-ignore
    velocity = new THREE.Vector3();
    requestAnimationFrame(animate);
    lineOfSightResult = animationFindLineOfSight();
    closestDistance = lineOfSightResult["closestDistance"];
    objectInLineOfSightCurrent = lineOfSightResult["closest"];
    if (controlsEnabled) {
        time = performance.now();
        delta = (time - prevTime) / 200;
        velocity.x = 0;
        velocity.z = 0;
        if (moveForward)
            velocity.z = delta * -1;
        if (moveBackward)
            velocity.z = delta;
        if (moveLeft)
            velocity.x = delta * -1;
        if (moveRight)
            velocity.x = delta;
        controls.getObject().translateX(velocity.x);
        controls.getObject().translateZ(velocity.z);
        if (moveDown) {
            controls.getObject().position.y -= (delta);
        }
        if (moveUp) {
            controls.getObject().position.y += (delta);
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
    var raycaster;
    var intersects;
    var objectLoop;
    // @ts-ignore
    raycaster = new THREE.Raycaster();
    // @ts-ignore
    cameraPostion = new THREE.Vector3();
    // @ts-ignore
    cameraDirection = new THREE.Vector3();
    closestDistance = -1;
    camera.getWorldPosition(cameraPostion);
    camera.getWorldDirection(cameraDirection);
    // @ts-ignore
    raycaster.set(cameraPostion, cameraDirection);
    // @ts-ignore
    intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0) {
        for (objectLoop = 0; objectLoop < intersects.length; objectLoop++) {
            if (closestDistance == -1) {
                closestDistance = intersects[objectLoop].distance;
                closest = intersects[objectLoop].object;
            }
            else {
                if (intersects[objectLoop].distance < closestDistance) {
                    closestDistance = intersects[objectLoop].distance;
                    closest = intersects[objectLoop].object;
                }
            }
        }
    }
    return ({
        closest: closest,
        closestDistance: closestDistance
    });
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
    }
}
function mouseClick(event) {
    if (event.button == 0) {
        console.log(objectInLineOfSightCurrent);
    }
}
function pointerLockRequest() {
    var element = document.body;
    // @ts-ignore
    element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
    element.requestPointerLock();
}
function pointerlockchange() {
    var element = document.body;
    // @ts-ignore
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
