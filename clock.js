let clockMesh;
const fontLoader = new THREE.FontLoader();
function updateClock(scene) {
    fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
        const timeStr = new Date().toLocaleTimeString();
        if (clockMesh) {
            scene.remove(clockMesh);
            clockMesh.geometry.dispose();
            clockMesh.material.dispose();

        }
        const textGeometry = new THREE.TextGeometry(timeString, {
            font: font,
            size: 0.5,      // Size of the text
            height: 0.2,    // Thickness of the text
            curveSegments: 12, // Number of curve segments for the text
            bevelEnabled: true, // Enable bevel effect on the text edges
            bevelThickness: 0.03, // Bevel thickness
            bevelSize: 0.02,      // Bevel size
            bevelOffset: 0,       // Bevel offset
            bevelSegments: 5      // Number of bevel segments
        });
        const textMaterial = new THREE.MeshStandardMaterial({ color: 'red'});
        clockMesh = new THREE.Mesh(textGeometry, textMaterial);
        clockMesh.castShadow = true;   // Text will cast a shadow
        clockMesh.receiveShadow = true; // Text will receive a shadow
        clockMesh.position.set(-2.5, -1.5, -2); // Adjust this position as needed to place the clock behind the cube
        scene.add(clockMesh);
    });
}
function startClock(scene) {
    updateClock(scene); // Initial clock update

    // Update clock every second
    setInterval(() => {
        updateClock(scene);
    }, 1000);
}