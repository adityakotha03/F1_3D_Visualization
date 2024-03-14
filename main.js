// Import necessary functions from api.js if using modules
import { fetchLocationData, fetchDriverDetails } from './api.js';

// Initialize scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Camera and lighting setup
camera.position.z = 100;
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enablePan = true;
controls.panSpeed = 0.5;
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);


// Driver IDs and colors
const drivers = [1, 44, 55, 4];
const colors = [0x3671C6, 0x27f4d2, 0xe8002d, 0xff8000]; // Red, Green, Blue, Yellow
const driverData = {};

// Function to create a cube for each driver
function createDriverCubes() {
    const loader = new THREE.GLTFLoader();
    
    Object.keys(driverData).forEach((driverId, index) => {
        loader.load('car/scene.gltf', function (gltf) {
            const model = gltf.scene;
            model.scale.set(3, 3, 3); // Scale the model down
            model.rotation.x = Math.PI / 2;
            model.rotation.y = -Math.PI;
            //model.rotation.z = -Math.PI/2;
            model.traverse(function (object) {
                if (object.isMesh) {
                    object.castShadow = true;
                    // Set the color of the mesh
                    object.material.color.setHex(colors[index % colors.length]);
                }
            });
            scene.add(model);
            driverData[driverId].model = model;
        }, undefined, function (error) {
            console.error(error);
        });
    });
}

// Function to create a plane
// Function to create a plane with texture
function createTexturedPlane(imageFile) {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(imageFile, function (texture) {
        const planeGeometry = new THREE.PlaneGeometry(130, 80); // Adjust size as needed
        const planeMaterial = new THREE.MeshBasicMaterial({ map: texture });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.rotation.z = -Math.PI / 2; // Rotate to make it horizontal
        plane.position.set(35, 25, 0); // Adjust position as needed
        scene.add(plane);
    });
}

// Inside your initAnimation function or after scene and renderer have been initialized
 // Make sure to use the correct path to the image file

 const axesHelper = new THREE.AxesHelper(5); // The parameter defines the size of the axes
 scene.add(axesHelper);

// Function to animate driver cubes
function animate() {
    requestAnimationFrame(animate);
    Object.values(driverData).forEach(driver => {
        if (driver.length > 0) {

            const newPosition = driver.shift();
            const oldPosition = driver.model.position;
            
            // Calculate the angle in radians between the old and new position
            const angle = Math.atan2(newPosition.y - oldPosition.y, newPosition.x - oldPosition.x);
            
            // Set the global rotation using quaternions
            const euler = new THREE.Euler(Math.PI/2, 0, angle + Math.PI/2, 'YZX');
            const quaternion = new THREE.Quaternion().setFromEuler(euler);
            driver.model.quaternion.copy(quaternion);
            //console.log(angle);
            
            // Move the model to the new position
            driver.model.position.set(newPosition.x, newPosition.y, 0);
        }
    });
    controls.update(); // Only required if damping or auto-rotation is enabled
    renderer.render(scene, camera);
}


// Modify the initAnimation function to use the user-selected times
async function initAnimation() {
    const sessionKey = '9472';
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;

    for (let driverId of drivers) {
        await fetchLocationData(sessionKey, driverData, driverId, startTime, endTime);
    }
    createDriverCubes();
    createTexturedPlane('map.png');
    animate();
}

document.getElementById('startTime').addEventListener('change', initAnimation);
document.getElementById('endTime').addEventListener('change', initAnimation);

initAnimation();