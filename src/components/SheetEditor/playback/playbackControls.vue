<template>
  <div class=" w-full ">
    <div class="controls">
    <i
      class="mdi  control mdi-repeat text-2xl"
      v-if="repeat"
      v-on:click="toggleRepeat(false)"
    ></i>
    <i
      class="mdi  control mdi-repeat-off text-2xl"
      v-if="!repeat"
      v-on:click="toggleRepeat(true)"
    ></i>
    <i
      class="mdi  control mdi-skip-previous text-2xl"
      v-on:click="skipPrev()"
    ></i>
    <i
      class="mdi control mdi-play text-2xl"
      v-if="!isPlaying"
      v-on:click="play()"
    ></i>
    <i
      class="mdi control mdi-pause text-2xl"
      v-if="isPlaying"
      v-on:click="pause()"
    ></i>
    <i class="mdi control mdi-skip-next text-2xl" v-on:click="skipNext()"></i>
    </div>
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
      backgroundSize: "20% 100%",
      repeat: false
    };
  },
  props: {},
  methods: {
    play() {
      this.isPlaying = true;
      this.audioEngine.play();
    },
    pause() {
      this.isPlaying = false;
      this.audioEngine.pause();
    },
    skipNext(){
      return;
    },
    skipPrev() {
      return;
    },
    toggleRepeat(repeat: boolean) {
      this.repeat = repeat;
      this.audioEngine.toggleLoop(repeat);
    },
    // eslint-disable-next-line @typescript-eslint/camelcase
    audioEngineOnProgress(seekbar: au_seek) {
      const trackbar = this.$refs["seekbar"] as any;
      trackbar.value = seekbar.position.currentBar+1;
      this.trackTotal = seekbar.position.totalBars;
      this.onTrackbarSeek({ target: this.$refs["seekbar"] });
      this.eventBus.$emit("AE_PROGRESS", { seekbar });
    },
    audioEngineOnStop(){
      this.isPlaying = false;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onTrackbarSeek(e: Event | { target: any }) {
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
.controls i {
  cursor: pointer;
}

/* Slider CSS */
input[type="range"] {
  -webkit-appearance: none;
  display: block;
  width: 100%;
  margin: 16px 0;
  margin-bottom: -2em;
  background: #3e3e3f;
  background-image: -webkit-gradient(
    linear,
    20% 0%,
    20% 100%,
    color-stop(0%, #add8e6),
    color-stop(100%, #add8e6)
  );
  background-image: -webkit-linear-gradient(left, #add8e6 0%, #add8e6 100%);
  background-image: -moz-linear-gradient(left, #add8e6 0%, #add8e6 100%);
  background-image: -o-linear-gradient(to right, #add8e6 0%, #add8e6 100%);
  background-image: linear-gradient(to right, #add8e6 0%, #add8e6 100%);
  background-repeat: no-repeat;
}
input[type="range"]:focus {
  outline: none;
}
input[type="range"]::-webkit-slider-runnable-track {
  width: 100%;
  height: 4px;
  cursor: pointer;
  box-shadow: none;
  background: transparent;
  border-radius: 0px;
  border: none;
}
input[type="range"]::-webkit-slider-thumb {
  box-shadow: none;
  border: 4px solid #add8e6;
  height: 16px;
  width: 16px;
  border-radius: 2px;
  background: #3e3e3f;
  cursor: pointer;
  -webkit-appearance: none;
  margin-top: -6px;
}
input[type="range"]:focus::-webkit-slider-runnable-track {
  background: transparent;
}
input[type="range"]::-moz-range-track {
  width: 100%;
  height: 4px;
  cursor: pointer;
  box-shadow: none;
  background: transparent;
  border-radius: 0px;
  border: none;
}
input[type="range"]::-moz-range-thumb {
  box-shadow: none;
  border: 4px solid #add8e6;
  height: 16px;
  width: 16px;
  border-radius: 2px;
  background: #ffffff;
  cursor: pointer;
}
input[type="range"]::-ms-track {
  width: 100%;
  height: 4px;
  cursor: pointer;
  background: transparent;
  border-color: transparent;
  color: transparent;
}
input[type="range"]::-ms-fill-lower {
  background: transparent;
  border: none;
  border-radius: 0px;
  box-shadow: none;
}
input[type="range"]::-ms-fill-upper {
  background: transparent;
  border: none;
  border-radius: 0px;
  box-shadow: none;
}
input[type="range"]::-ms-thumb {
  box-shadow: none;
  border: 4px solid #add8e6;
  height: 16px;
  width: 16px;
  border-radius: 2px;
  background: #ffffff;
  cursor: pointer;
  height: 4px;
}
input[type="range"]:focus::-ms-fill-lower {
  background: transparent;
}
input[type="range"]:focus::-ms-fill-upper {
  background: transparent;
}
/* End Range Slider */
</style>
