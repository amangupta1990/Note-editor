<template>
  <div>
    <i
      class="mdi  control mdi-skip-previous text-2xl"
      v-on:click="playBackEvent('prev')"
    ></i>
    <i
      class="mdi control mdi-play text-2xl"
      v-if="!isPlaying"
      v-on:click="playBackEvent('play')"
    ></i>
    <i
      class="mdi control mdi-pause text-2xl"
      v-if="isPlaying"
      v-on:click="playBackEvent('pause')"
    ></i>
    <i
      class="mdi control mdi-skip-next text-2xl"
      v-on:click="playBackEvent('next')"
    ></i>
    <input
      type="range"
      min="0"
      :max="trackTotal"
      step="0.1"
      @input="onTrackbarSeek"
      :style="{ backgroundSize: backgroundSize }"
      ref="seekbar"
    />
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import { AudioEngine } from "./AudioEngine";
import { EventBus } from "@/main";
// eslint-disable-next-line @typescript-eslint/camelcase
import { au_seek, ed_sheet } from "@/shared/models";
export default Vue.extend({
  name: "PlaybackControls",
  data: function() {
    return {
      eventBus: EventBus,
      isPlaying: false,
      audioEngine: {} as AudioEngine,
      trackProgress: 0,
      trackTotal: 0,
      backgroundSize: "20% 100%"
    };
  },
  props: {
    play: Boolean
  },
  methods: {
    playBackEvent(eventName: string) {
      switch (eventName) {
        case "play":
          this.isPlaying = true;
          this.audioEngine.play();
          break;
        case "pause":
          this.isPlaying = false;
          this.audioEngine.stop();
          break;
      }
      this.$emit("playbackevent", eventName);
    },
    // eslint-disable-next-line @typescript-eslint/camelcase
    audioEngineOnProgress(seekbar: au_seek) {
      const trackbar = this.$refs["seekbar"] as any;
      trackbar.value = seekbar.position.current;
      this.trackTotal = seekbar.position.total;
      this.onTrackbarSeek({ target: this.$refs["seekbar"] });
    },
    audioEngineOnStop(){
      this.isPlaying = false;
    },
    onTrackbarSeek(e: Event ) {
      const clickedElement = e.target as HTMLInputElement,
        min = parseInt(clickedElement?.min),
        max = parseInt(clickedElement?.max),
        val = parseInt(clickedElement?.value);
      this.trackProgress = val;
      this.backgroundSize = ((val - min) * 100) / (max - min) + "% 100%";
    }
  },
  mounted() {
    this.eventBus.$on(
      "AE_INIT",
      // eslint-disable-next-line @typescript-eslint/camelcase
      (data: { sheet: ed_sheet; timeSig: string; bpm: number }) => {
        this.audioEngine = new AudioEngine(
          data.sheet,
          data.timeSig,
          data.bpm,
          this.audioEngineOnProgress,
          this.audioEngineOnStop
        );
      }
    );

    // not neeed as of now but for later

    this.eventBus.$on("AE_UPDATE", (data: any) =>
      this.audioEngine.updateTrack(data.sheet)
    );
    // this.eventBus.$on("AE_PAUSE", () => {
    //   /*TODO*/
    // });
    // this.eventBus.$on("AE_STOP", this.audioEngine.stop);
    // this.eventBus.$on("AE_NEXT", () => {
    //   /* TODO */
    // });
    // this.eventBus.$on("AE_PREV", () => {
    //   /* TODO */
    // });
  }
});
</script>
<style scoped>
.control {
  cursor: pointer;
}
</style>
