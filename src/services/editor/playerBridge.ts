/**
 * OmniAI — Player Bridge
 * A global bridge to allow external components (Timeline, Trimmer, Toolbar)
 * to communicate with the active expo-video player without needing React context
 * or violating hooks rules.
 */

type PlayerBridgeAPI = {
  play: () => void;
  pause: () => void;
  seek: (ms: number) => void;
  getDuration: () => number;
};

let activePlayer: PlayerBridgeAPI | null = null;

export const playerBridge = {
  registerPlayer: (api: PlayerBridgeAPI) => {
    activePlayer = api;
  },

  unregisterPlayer: () => {
    activePlayer = null;
  },

  play: () => {
    activePlayer?.play();
  },

  pause: () => {
    activePlayer?.pause();
  },

  seek: (ms: number) => {
    activePlayer?.seek(ms);
  },

  getDuration: () => {
    return activePlayer?.getDuration() ?? 0;
  },
};
