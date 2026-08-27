// Sound Effects completely disabled as per user request
// No Web Audio API context or background audio resources allocated

class DisabledSoundEngine {
  public toggleMute(): boolean {
    return true;
  }

  public getIsMuted(): boolean {
    return true;
  }

  public playReedScrape(_intensity?: number): void {
    // Disabled
  }

  public playInkDip(): void {
    // Disabled
  }

  public playSnap(): void {
    // Disabled
  }

  public playStampHit(): void {
    // Disabled
  }

  public playChime(): void {
    // Disabled
  }
}

export const SoundEngine = new DisabledSoundEngine();
