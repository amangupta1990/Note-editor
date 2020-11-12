<template>
  <div class="keyboard-container">
    <div class="tabs">
      <ul>
        <li
          v-bind:class="{ active: tab === 'KEYPAD' }"
          v-on:click="tab = 'KEYPAD'"
        >
          ABC..
        </li>
        <li
          v-bind:class="{ active: tab === 'DRAWER' }"
          v-on:click="tab = 'DRAWER'"
        >
          Chords
        </li>
        <li
          v-bind:class="{ active: tab === 'RYTHYM' }"
          v-on:click="tab = 'RYTHYM'"
        >
          Ryth
        </li>
      </ul>
    </div>
    <key-pad @onKey="onToolbarKey" v-if="tab === 'KEYPAD'" />
    <chord-drawer
      @onKey="onToolbarKey"
      v-if="keySig && tab === 'DRAWER'"
      v-bind:chordNote="keySig"
      v-bind:tonic="tonic"
      @chordselected="onChordSelected"
    />
  </div>
</template>
<script>
import KeyPad from "./KeyPad";
import ChordDrawer from "./ChordDrawer";

export default {
  name: "Keyboard",
  components: {
    KeyPad,
    ChordDrawer
  },
  data() {
    return {
      tab: "KEYPAD"
    };
  },
  props: {
    keySig: String,
    tonic: String
  },
  methods: {
    onChordSelected(chord) {
      this.$emit("chordselected", chord);
    },
    onToolbarKey(event) {
      this.$emit("onKey", event);
    }
  }
};
</script>
<style>
.keyboard-container {
  @apply bg-gray-800 text-gray-500 text-sm  shadow-lg overflow-hidden  absolute bottom-0 w-full;
}

.tabs ul {
  @apply flex flex-row justify-items-start list-none p-4;
}

.tabs ul li {
  @apply p-2;
}

.tabs ul li.active {
  @apply text-white;
}
</style>
