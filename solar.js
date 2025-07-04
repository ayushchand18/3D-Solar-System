// Scene setup
const scene = new THREE.Scene();
const container = document.getElementById('canvas-container');
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

// Camera setup
const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
);
camera.position.set(0, 50, 100);

// Orbit controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 3, 5);
scene.add(directionalLight);

// Create stars background
function createStars() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.1,
        transparent: true
    });

    const starsVertices = [];
    for (let i = 0; i < 5000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starsVertices.push(x, y, z);
    }

    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
}

createStars();

// Celestial bodies data
const planetsData = [
    { name: "Sun", radius: 10, color: 0xffff00, distance: 0, speed: 0, rotationSpeed: 0.005 },
    { name: "Mercury", radius: 1.5, color: 0xaaaaaa, distance: 20, speed: 0.04, rotationSpeed: 0.004 },
    { name: "Venus", radius: 3.7, color: 0xffaa66, distance: 30, speed: 0.015, rotationSpeed: 0.002 },
    { name: "Earth", radius: 3.9, color: 0x3366ff, distance: 40, speed: 0.01, rotationSpeed: 0.02 },
    { name: "Mars", radius: 2.1, color: 0xff3300, distance: 50, speed: 0.008, rotationSpeed: 0.018 },
    { name: "Jupiter", radius: 8, color: 0xffcc99, distance: 70, speed: 0.002, rotationSpeed: 0.04 },
    { name: "Saturn", radius: 7, color: 0xffdd55, distance: 90, speed: 0.0009, rotationSpeed: 0.038 },
    { name: "Uranus", radius: 5, color: 0x66ccff, distance: 110, speed: 0.0004, rotationSpeed: 0.03 },
    { name: "Neptune", radius: 4.8, color: 0x3366ff, distance: 130, speed: 0.0001, rotationSpeed: 0.032 }
];

// Create planets
const planets = [];
const orbitLines = [];

planetsData.forEach((planetData, index) => {
    // Create planet
    const geometry = new THREE.SphereGeometry(planetData.radius, 32, 32);
    const material = new THREE.MeshPhongMaterial({ 
        color: planetData.color,
        shininess: 10
    });
    const planet = new THREE.Mesh(geometry, material);
    
    if (index > 0) { 
        const orbitGeometry = new THREE.BufferGeometry();
        const orbitMaterial = new THREE.LineBasicMaterial({ 
            color: 0x888888,
            transparent: true,
            opacity: 0.3
        });
        
        const points = [];
        const segments = 100;
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            points.push(new THREE.Vector3(
                Math.cos(angle) * planetData.distance,
                0,
                Math.sin(angle) * planetData.distance
            ));
        }
        
        orbitGeometry.setFromPoints(points);
        const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
        scene.add(orbitLine);
        orbitLines.push(orbitLine);
    }
    
    // Add rings to Saturn
    if (planetData.name === "Saturn") {
        const ringGeometry = new THREE.RingGeometry(planetData.radius + 3, planetData.radius + 8, 32);
        const ringMaterial = new THREE.MeshPhongMaterial({
            color: 0xddbb88,
            side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        planet.add(ring);
    }
    
    scene.add(planet);
    planets.push({
        mesh: planet,
        data: planetData,
        angle: Math.random() * Math.PI * 2,
        speedMultiplier: 1,
        originalSpeed: planetData.speed
    });
});

// Animation state
let isPaused = false;
let clock = new THREE.Clock();

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    const delta = clock.getDelta();
    
    if (!isPaused) {
        planets.forEach((planet, index) => {
            if (index > 0) { // Skip the Sun
                // Update planet position based on orbit
                planet.angle += planet.data.speed * planet.speedMultiplier * delta;
                planet.mesh.position.x = Math.cos(planet.angle) * planet.data.distance;
                planet.mesh.position.z = Math.sin(planet.angle) * planet.data.distance;
                
                // Rotate planet
                planet.mesh.rotation.y += planet.data.rotationSpeed * delta;
            } else {
                // Rotate the Sun
                planet.mesh.rotation.y += planet.data.rotationSpeed * delta;
            }
        });
    }
    
    controls.update();
    renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});

// Speed control event listeners
document.getElementById('mercury-speed').addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    planets[1].speedMultiplier = value;
    document.querySelector('#mercury-speed + .speed-value').textContent = value.toFixed(1) + 'x';
});

document.getElementById('venus-speed').addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    planets[2].speedMultiplier = value;
    document.querySelector('#venus-speed + .speed-value').textContent = value.toFixed(1) + 'x';
});

document.getElementById('earth-speed').addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    planets[3].speedMultiplier = value;
    document.querySelector('#earth-speed + .speed-value').textContent = value.toFixed(1) + 'x';
});

document.getElementById('mars-speed').addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    planets[4].speedMultiplier = value;
    document.querySelector('#mars-speed + .speed-value').textContent = value.toFixed(1) + 'x';
});

document.getElementById('jupiter-speed').addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    planets[5].speedMultiplier = value;
    document.querySelector('#jupiter-speed + .speed-value').textContent = value.toFixed(1) + 'x';
});

document.getElementById('saturn-speed').addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    planets[6].speedMultiplier = value;
    document.querySelector('#saturn-speed + .speed-value').textContent = value.toFixed(1) + 'x';
});

document.getElementById('uranus-speed').addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    planets[7].speedMultiplier = value;
    document.querySelector('#uranus-speed + .speed-value').textContent = value.toFixed(1) + 'x';
});

document.getElementById('neptune-speed').addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    planets[8].speedMultiplier = value;
    document.querySelector('#neptune-speed + .speed-value').textContent = value.toFixed(1) + 'x';
});

// Pause/resume button
document.getElementById('pause-resume').addEventListener('click', () => {
    isPaused = !isPaused;
    document.getElementById('pause-resume').textContent = isPaused ? 'Resume' : 'Pause';
});

// Reset speeds button
document.getElementById('reset-speeds').addEventListener('click', () => {
    const sliders = document.querySelectorAll('input[type="range"]');
    sliders.forEach(slider => {
        slider.value = 1;
        const event = new Event('input');
        slider.dispatchEvent(event);
    });
});

// Theme toggle
document.getElementById('theme-toggle').addEventListener('click', () => {
    document.body.style.backgroundColor = document.body.style.backgroundColor === 'rgb(0, 0, 0)' ? '#fff' : '#000';
    document.body.style.color = document.body.style.color === 'rgb(255, 255, 255)' ? '#000' : '#fff';
    document.getElementById('theme-toggle').textContent = 
        document.body.style.backgroundColor === 'rgb(0, 0, 0)' ? 'Light Mode' : 'Dark Mode';
});

// Planet hover info
const planetInfo = document.getElementById('planet-info');
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseMove(event) {
    // Calculate mouse position in normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Update the raycaster
    raycaster.setFromCamera(mouse, camera);
    
    // Calculate objects intersecting the ray
    const intersects = raycaster.intersectObjects(planets.map(p => p.mesh));
    
    if (intersects.length > 0) {
        const planet = planets.find(p => p.mesh === intersects[0].object);
        planetInfo.style.display = 'block';
        planetInfo.textContent = planet.data.name;
        planetInfo.style.left = `${event.clientX + 10}px`;
        planetInfo.style.top = `${event.clientY + 10}px`;
    } else {
        planetInfo.style.display = 'none';
    }
}

window.addEventListener('mousemove', onMouseMove, false);