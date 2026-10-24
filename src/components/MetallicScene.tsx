import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import type { Mesh } from 'three'

function Sculpture() {
  const mesh = useRef<Mesh>(null)
  useFrame((state, delta) => {
    if (mesh.current) {
      mesh.current.rotation.y += Math.min(delta, 0.05) * 0.14
      mesh.current.rotation.x += (state.pointer.y * 0.18 - mesh.current.rotation.x) * 0.015
    }
  })
  return (
    <Float speed={1} rotationIntensity={0.12} floatIntensity={0.25}>
      <mesh ref={mesh} rotation={[0.2, 0, -0.2]}>
        <torusKnotGeometry args={[1.05, 0.27, 100, 14, 2, 3]} />
        <meshStandardMaterial color="#b8a783" metalness={0.82} roughness={0.28} />
      </mesh>
    </Float>
  )
}

export default function MetallicScene() {
  return (
    <Canvas
      dpr={[1, 1.4]}
      camera={{ position: [0, 0, 5.5], fov: 38 }}
      gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
      fallback={<div className="sculpture-fallback">✳</div>}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 5, 4]} intensity={3.8} color="#f8eee0" />
      <directionalLight position={[-4, -1, 2]} intensity={1.3} color="#8c8b84" />
      <Sculpture />
    </Canvas>
  )
}
