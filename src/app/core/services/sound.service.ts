import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

const STORAGE_KEY = 'sound-enabled';

@Injectable({ providedIn: 'root' })
export class SoundService {
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);
  private ctx: AudioContext | null = null;

  get isEnabled(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    return localStorage.getItem(STORAGE_KEY) !== 'false';
  }

  toggle(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const next = !this.isEnabled;
    localStorage.setItem(STORAGE_KEY, String(next));
  }

  init(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.pageTurn());
  }

  pageTurn(): void {
    if (!this.isEnabled) return;
    const ctx = this.getCtx();
    if (!ctx) return;

    // Soft paper "whoosh" — a short band-pass noise burst
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.12, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 3);
    }

    const src = ctx.createBufferSource();
    src.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1800;
    filter.Q.value = 0.8;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start();
  }

  typewriterClick(): void {
    if (!this.isEnabled) return;
    const ctx = this.getCtx();
    if (!ctx) return;

    // Brief mechanical tick
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.02);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  }

  private getCtx(): AudioContext | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    if (!this.ctx) {
      try {
        this.ctx = new AudioContext();
      } catch {
        return null;
      }
    }
    // Resume if suspended (browser autoplay policy)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }
}
