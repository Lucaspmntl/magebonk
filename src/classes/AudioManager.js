/**
 * AudioManager - Gerencia áudio do jogo
 */
import * as THREE from 'three';

export class AudioManager {
  constructor(camera) {
    this.listener = new THREE.AudioListener();
    camera.add(this.listener);

    this.audioLoader = new THREE.AudioLoader();
    this.sounds = {};
    this.lastWalkTime = 0;
    this.walkInterval = 400;
  }

  loadSound(name, path) {
    return new Promise((resolve) => {
      this.audioLoader.load(path, (audioBuffer) => {
        const sound = new THREE.Audio(this.listener);
        sound.setBuffer(audioBuffer);
        sound.setVolume(0.7);
        this.sounds[name] = sound;
        resolve(sound);
      });
    });
  }

  playWalkSound() {
    const now = Date.now();
    if (now - this.lastWalkTime < this.walkInterval) {
      return;
    }

    this.lastWalkTime = now;

    if (this.sounds.walk) {
      if (this.sounds.walk.isPlaying) {
        this.sounds.walk.stop();
      }

      this.sounds.walk.currentTime = 0;
      this.sounds.walk.play();

      setTimeout(() => {
        if (this.sounds.walk && this.sounds.walk.isPlaying) {
          this.sounds.walk.stop();
        }
      }, 150);
    }
  }

  playJumpFallSound() {
    if (this.sounds.jumpFall) {
      if (this.sounds.jumpFall.isPlaying) {
        this.sounds.jumpFall.stop();
      }

      this.sounds.jumpFall.currentTime = 0;
      this.sounds.jumpFall.play();

      setTimeout(() => {
        if (this.sounds.jumpFall && this.sounds.jumpFall.isPlaying) {
          this.sounds.jumpFall.stop();
        }
      }, 200);
    }
  }

  playSound(name) {
    if (this.sounds[name] && !this.sounds[name].isPlaying) {
      this.sounds[name].currentTime = 0;
      this.sounds[name].play();
    }
  }

  stopSound(name) {
    if (this.sounds[name]) {
      this.sounds[name].stop();
    }
  }
}
