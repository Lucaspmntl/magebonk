import * as THREE from 'three';

export class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];

    this.particleGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    this.materials = {
      fire: new THREE.MeshBasicMaterial({ color: 0xff4500 }),
      smoke: new THREE.MeshBasicMaterial({ color: 0x555555, transparent: true, opacity: 0.8 }),
      magic: new THREE.MeshBasicMaterial({ color: 0x8800ff }),
      spark: new THREE.MeshBasicMaterial({ color: 0xffff00 }),
      ice: new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.8 })
    };
  }

  emit(position, type, count = 5, options = {}) {
    const material = this.materials[type] || this.materials.fire;

    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(this.particleGeometry, material);
      mesh.position.copy(position);

      mesh.position.x += (Math.random() - 0.5) * 0.5;
      mesh.position.y += (Math.random() - 0.5) * 0.5;
      mesh.position.z += (Math.random() - 0.5) * 0.5;

      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );

      const speed = options.speed || 0.1;
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * speed,
        (Math.random() - 0.5) * speed + (Math.random() * speed),
        (Math.random() - 0.5) * speed
      );

      this.scene.add(mesh);

      const initialScale = options.scale || 1.0;
      mesh.scale.setScalar(initialScale);

      this.particles.push({
        mesh,
        velocity,
        life: 1.0,
        decay: options.decay || 0.02,
        initialScale,
        type
      });
    }
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      p.mesh.position.add(p.velocity);
      p.mesh.rotation.x += 0.1;
      p.mesh.rotation.y += 0.1;

      p.life -= p.decay;
      p.mesh.scale.setScalar(p.life * p.initialScale);

      if (p.type === 'smoke') {
        p.velocity.y += 0.002;
      }

      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        this.particles.splice(i, 1);
      }
    }
  }

  dispose() {
    this.particles.forEach(p => this.scene.remove(p.mesh));
    this.particles = [];
  }
}
