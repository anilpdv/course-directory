import { useVideoPlayer as useExpoVideoPlayer } from 'expo-video';
import { PLAYBACK_RATES } from '../constants';

interface UsePlayerInitOptions {
  videoPath: string;
  initialPosition: number;
  playbackRateIndex: number;
}

export function usePlayerInit({
  videoPath,
  initialPosition,
  playbackRateIndex,
}: UsePlayerInitOptions) {
  const player = useExpoVideoPlayer(videoPath, (player) => {
    player.loop = false;
    player.playbackRate = PLAYBACK_RATES[playbackRateIndex];
    player.staysActiveInBackground = true;
    player.showNowPlayingNotification = true;
    player.audioMixingMode = 'doNotMix';

    if (initialPosition > 0) {
      setTimeout(() => {
        player.currentTime = initialPosition;
      }, 500);
    }

    player.play();
  });

  return player;
}
