<template>
  <div>
    <i
      class="mdi  control mdi-skip-previous text-2xl"
      v-on:click="playBackEvent('prev')"
    ></i>
    <i
      class="mdi control mdi-play text-2xl"
      v-if="!isPlaying || !play"
      v-on:click="playBackEvent('play')"
    ></i>
    <i
      class="mdi control mdi-pause text-2xl"
      v-if="isPlaying || play"
      v-on:click="playBackEvent('pause')"
    ></i>
    <i
      class="mdi control mdi-skip-next text-2xl"
      v-on:click="playBackEvent('next')"
    ></i>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  name: "PlaybackControls",
  data: function() {
    return {
      isPlaying: false
    };
  },
  props: {
    play: Boolean
  },
  methods: {
    playBackEvent: function(eventName: string) {
      switch (eventName) {
        case "play":
          this.isPlaying = true;
          break;
        case "pause":
          this.isPlaying = false;
          break;
      }
      this.$emit("playbackevent", eventName);
    }
  }
});
</script>
<style scoped>
.control {
  cursor: pointer;
}
</style>
