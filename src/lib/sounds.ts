import coinsAsset from "@/assets/coins.mp3.asset.json";

let audio: HTMLAudioElement | null = null;

export function playCoinsSound() {
  if (typeof window === "undefined") return;
  try {
    if (!audio) {
      audio = new Audio(coinsAsset.url);
      audio.preload = "auto";
    }
    audio.currentTime = 0;
    audio.volume = 1;
    void audio.play();
  } catch {
    // sessizce yoksay
  }
}
