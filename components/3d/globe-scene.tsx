"use client"

import { useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { 
  Sphere, 
  OrbitControls, 
  Float,
  MeshDistortMaterial,
  Stars,
  Trail,
  Sparkles
} from "@react-three/drei"
import * as THREE from "three"

function GlobeCore() {
  const meshRef = useRef<THREE.Mesh>(null)
  const wireframeRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002
    }
    if (wireframeRef.current) {
      wireframeRef.current.rotation.y += 0.003
      wireframeRef.current.rotation.x += 0.001
    }
    if (glowRef.current) {
      glowRef.current.rotation.y -= 0.001
    }
  })

  return (
    <group>
      {/* Inner core sphere */}
      <Sphere ref={meshRef} args={[1.8, 64, 64]}>
        <MeshDistortMaterial
          color="#0a2540"
          attach="material"
          distort={0.2}
          speed={2}
          roughness={0.4}
          metalness={0.8}
        />
      </Sphere>

      {/* Wireframe overlay */}
      <Sphere ref={wireframeRef} args={[2, 32, 32]}>
        <meshBasicMaterial
          color="#10b981"
          wireframe
          transparent
          opacity={0.15}
        />
      </Sphere>

      {/* Outer glow sphere */}
      <Sphere ref={glowRef} args={[2.2, 32, 32]}>
        <meshBasicMaterial
          color="#10b981"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
        />
      </Sphere>
    </group>
  )
}

function SatelliteOrbit({ radius, speed, offset, color }: { 
  radius: number
  speed: number
  offset: number
  color: string 
}) {
  const ref = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime * speed + offset
      ref.current.position.x = Math.cos(t) * radius
      ref.current.position.z = Math.sin(t) * radius
      ref.current.position.y = Math.sin(t * 0.5) * 0.5
    }
  })

  return (
    <group ref={ref}>
      <Trail
        width={0.3}
        length={6}
        color={color}
        attenuation={(t) => t * t}
      >
        <mesh>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshBasicMaterial color={color} />
        </mesh>
      </Trail>
    </group>
  )
}

function DataPoints() {
  const points = useMemo(() => {
    const temp = []
    for (let i = 0; i < 100; i++) {
      const phi = Math.acos(-1 + (2 * i) / 100)
      const theta = Math.sqrt(100 * Math.PI) * phi
      temp.push({
        position: [
          2.1 * Math.cos(theta) * Math.sin(phi),
          2.1 * Math.sin(theta) * Math.sin(phi),
          2.1 * Math.cos(phi)
        ] as [number, number, number],
        delay: Math.random() * 2
      })
    }
    return temp
  }, [])

  return (
    <group>
      {points.map((point, i) => (
        <Float
          key={i}
          speed={2}
          rotationIntensity={0}
          floatIntensity={0.5}
          floatingRange={[-0.05, 0.05]}
        >
          <mesh position={point.position}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshBasicMaterial color="#10b981" transparent opacity={0.6} />
          </mesh>
        </Float>
      ))}
    </group>
  )
}

function ScanRing() {
  const ref = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = Math.PI / 2
      ref.current.rotation.z = state.clock.elapsedTime * 0.5
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1
      ref.current.scale.setScalar(scale)
    }
  })

  return (
    <mesh ref={ref}>
      <ringGeometry args={[2.8, 2.85, 64]} />
      <meshBasicMaterial color="#10b981" transparent opacity={0.3} side={THREE.DoubleSide} />
    </mesh>
  )
}

function GridPlane() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
      <planeGeometry args={[30, 30, 30, 30]} />
      <meshBasicMaterial
        color="#10b981"
        wireframe
        transparent
        opacity={0.05}
      />
    </mesh>
  )
}

export function GlobeScene() {
  return (
    <div className="w-full h-full absolute inset-0">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#10b981" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />

        <Stars
          radius={50}
          depth={50}
          count={2000}
          factor={4}
          saturation={0}
          fade
          speed={0.5}
        />

        <Float speed={1} rotationIntensity={0.2} floatIntensity={0.3}>
          <GlobeCore />
          <DataPoints />
        </Float>

        <SatelliteOrbit radius={3} speed={0.5} offset={0} color="#10b981" />
        <SatelliteOrbit radius={3.5} speed={0.3} offset={2} color="#3b82f6" />
        <SatelliteOrbit radius={2.8} speed={0.7} offset={4} color="#f59e0b" />

        <ScanRing />
        <GridPlane />

        <Sparkles
          count={50}
          scale={8}
          size={1}
          speed={0.3}
          color="#10b981"
          opacity={0.3}
        />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.3}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>
    </div>
  )
}
