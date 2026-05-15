"use client"

import { useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { 
  Float,
  MeshDistortMaterial,
  Sparkles
} from "@react-three/drei"
import * as THREE from "three"

function FloatingCard({ position, rotation, delay }: { 
  position: [number, number, number]
  rotation: [number, number, number]
  delay: number 
}) {
  const ref = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + delay) * 0.2
    }
  })

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh ref={ref} position={position} rotation={rotation}>
        <boxGeometry args={[0.8, 0.5, 0.02]} />
        <meshStandardMaterial
          color="#1a1a1a"
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={0.9}
        />
      </mesh>
      {/* Edge glow */}
      <mesh position={position} rotation={rotation}>
        <boxGeometry args={[0.82, 0.52, 0.01]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.3} />
      </mesh>
    </Float>
  )
}

function DataStream({ start, end, speed }: { 
  start: [number, number, number]
  end: [number, number, number]
  speed: number 
}) {
  const ref = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (ref.current) {
      const t = ((state.clock.elapsedTime * speed) % 1)
      ref.current.position.x = start[0] + (end[0] - start[0]) * t
      ref.current.position.y = start[1] + (end[1] - start[1]) * t
      ref.current.position.z = start[2] + (end[2] - start[2]) * t
      ref.current.material.opacity = Math.sin(t * Math.PI)
    }
  })

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshBasicMaterial color="#10b981" transparent opacity={0.8} />
    </mesh>
  )
}

function CentralCore() {
  const meshRef = useRef<THREE.Mesh>(null)
  const ringRef1 = useRef<THREE.Mesh>(null)
  const ringRef2 = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
    if (ringRef1.current) {
      ringRef1.current.rotation.z += 0.01
    }
    if (ringRef2.current) {
      ringRef2.current.rotation.z -= 0.008
      ringRef2.current.rotation.x += 0.005
    }
  })

  return (
    <group>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[0.8, 1]} />
        <MeshDistortMaterial
          color="#0d3320"
          attach="material"
          distort={0.3}
          speed={3}
          roughness={0.2}
          metalness={0.9}
        />
      </mesh>
      
      {/* Inner ring */}
      <mesh ref={ringRef1} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.2, 0.02, 16, 64]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.6} />
      </mesh>
      
      {/* Outer ring */}
      <mesh ref={ringRef2} rotation={[Math.PI / 3, Math.PI / 4, 0]}>
        <torusGeometry args={[1.5, 0.015, 16, 64]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.4} />
      </mesh>
    </group>
  )
}

function HexGrid() {
  const hexes = useMemo(() => {
    const temp = []
    const size = 0.3
    const rows = 5
    const cols = 8
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * size * 1.8 - (cols * size * 0.9)
        const y = row * size * 1.5 - (rows * size * 0.75) + (col % 2 === 0 ? size * 0.75 : 0)
        temp.push({
          position: [x, y, -3] as [number, number, number],
          delay: Math.random() * 5
        })
      }
    }
    return temp
  }, [])

  return (
    <group>
      {hexes.map((hex, i) => (
        <HexCell key={i} position={hex.position} delay={hex.delay} />
      ))}
    </group>
  )
}

function HexCell({ position, delay }: { position: [number, number, number]; delay: number }) {
  const ref = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (ref.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2 + delay) > 0.8
      ref.current.material.opacity = pulse ? 0.3 : 0.1
    }
  })

  return (
    <mesh ref={ref} position={position}>
      <circleGeometry args={[0.15, 6]} />
      <meshBasicMaterial color="#10b981" transparent opacity={0.1} />
    </mesh>
  )
}

export function FeatureScene() {
  return (
    <div className="w-full h-full absolute inset-0">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={1} color="#10b981" />
        <pointLight position={[-5, -5, 5]} intensity={0.5} color="#3b82f6" />

        <CentralCore />
        
        <FloatingCard position={[-2, 1, 0]} rotation={[0, 0.3, 0]} delay={0} />
        <FloatingCard position={[2, 0.5, 0.5]} rotation={[0, -0.3, 0]} delay={1} />
        <FloatingCard position={[-1.5, -1, 0.3]} rotation={[0, 0.2, 0]} delay={2} />
        <FloatingCard position={[1.8, -0.8, 0]} rotation={[0, -0.2, 0]} delay={3} />

        <DataStream start={[-2, 1, 0]} end={[0, 0, 0]} speed={0.5} />
        <DataStream start={[2, 0.5, 0.5]} end={[0, 0, 0]} speed={0.4} />
        <DataStream start={[-1.5, -1, 0.3]} end={[0, 0, 0]} speed={0.6} />
        <DataStream start={[1.8, -0.8, 0]} end={[0, 0, 0]} speed={0.45} />

        <HexGrid />

        <Sparkles
          count={30}
          scale={6}
          size={0.8}
          speed={0.2}
          color="#10b981"
          opacity={0.5}
        />
      </Canvas>
    </div>
  )
}
