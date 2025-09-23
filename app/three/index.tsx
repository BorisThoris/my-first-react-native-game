// app/three/index.tsx
import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';

export default function ThreeDemo() {
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        return () => {
            if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    return (
        <View style={{ flex: 1, backgroundColor: '#000' }}>
            <GLView
                style={{ flex: 1 }}
                onContextCreate={async (gl) => {
                    const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;

                    const renderer = new Renderer({ gl, antialias: true });
                    renderer.setSize(width, height);
                    renderer.setClearColor('#101014');

                    const scene = new THREE.Scene();

                    const camera = new THREE.PerspectiveCamera(70, width / height, 0.01, 1000);
                    camera.position.z = 3;

                    const light = new THREE.DirectionalLight(0xffffff, 1);
                    light.position.set(3, 3, 3);
                    scene.add(light);

                    const ambient = new THREE.AmbientLight(0x404040);
                    scene.add(ambient);

                    const geometry = new THREE.BoxGeometry(1, 1, 1);
                    const material = new THREE.MeshStandardMaterial({
                        color: 0x4e9cff,
                        metalness: 0.1,
                        roughness: 0.4
                    });
                    const cube = new THREE.Mesh(geometry, material);
                    scene.add(cube);

                    const onResize = () => {
                        const w = gl.drawingBufferWidth;
                        const h = gl.drawingBufferHeight;
                        camera.aspect = w / h;
                        camera.updateProjectionMatrix();
                        renderer.setSize(w, h);
                    };

                    let last = 0;
                    const renderLoop = (time: number) => {
                        const dt = (time - last) / 1000;
                        last = time;
                        cube.rotation.x += dt * 0.8;
                        cube.rotation.y += dt * 1.2;
                        renderer.render(scene, camera);
                        gl.endFrameEXP();
                        rafRef.current = requestAnimationFrame(renderLoop);
                    };

                    // Kick off
                    onResize();
                    rafRef.current = requestAnimationFrame(renderLoop);

                    // Basic resize handling on web
                    if (typeof window !== 'undefined') {
                        const handler = () => onResize();
                        window.addEventListener('resize', handler);
                        return () => window.removeEventListener('resize', handler);
                    }
                }}
            />
        </View>
    );
}
