<template>
  <div
    class="bg-gray-800 text-gray-500 text-sm   overflow-hidden p-5  bottom-0 m-auto  absolute flex grid-flow-col justify-items-center"
    style="width:100vw;"
  >


        <div class="flex -mx-1">
          <div class="key-wrapper">
            <button
              class="block w-full h-10 rounded bg-gray-900 hover:bg-indigo-600 hover:text-white shadow focus:outline-none text-center leading-none"
              v-on:click="onInput('leftArrow')"
            >
              <i class="mdi  mdi-arrow-left-bold text-lg"></i>
            </button>
          </div>
        </div>

        <div class="key-wrapper">
          <button
            class="block w-full h-10 rounded bg-gray-900 hover:bg-indigo-600 hover:text-white shadow focus:outline-none text-center leading-none"
            v-on:click="onInput('rightArrow')"
          >
            <i class="mdi  mdi-arrow-right-bold text-lg"></i>
          </button>
        </div>

        <div class="w-20 px-1 ">
          <button
            class="block w-full h-10 rounded bg-gray-700 hover:bg-indigo-600 hover:text-white shadow focus:outline-none text-center leading-none text-xs"
            v-on:click="onInput('undo')"
          >
            <i class="mdi  mdi-undo text-lg"></i>
          </button>
        </div>
        <div class="w-20 px-1">
          <button
            class="block w-full h-10 rounded bg-gray-900 hover:bg-indigo-600 hover:text-white shadow focus:outline-none text-center leading-none text-xs"
            v-on:click="onInput('redo')"
          >
            <i class="mdi  mdi-redo text-lg"></i>
          </button>
        </div>
        <div class="key-wrapper">
            <button
              class="block w-full h-10 rounded bg-gray-900 hover:bg-indigo-600 hover:text-white shadow focus:outline-none text-center leading-none"
              v-on:click="onInput('delete')"
            >
              <i class="mdi mdi-backspace-outline text-lg"></i>
            </button>
          </div>
      </div>
</template>
<script>
/* eslint-disable no-fallthrough */
import KeyboardListeners from './keyboardListeners.js';
export default {
  name: "MiniKeyPad",
  mixins: [],
  props: {
    x: Number,
    y: Number,
  },
  components: {},
  data() {
    return {

    };
  },
  mounted: function() {
    document.addEventListener("keyup",(e)=>KeyboardListeners(e,this.onInput));
  },
  beforeDestroy: function() {
    document.removeEventListener("keyup", this.KeyboardListeners);
  },
  methods: {

    onInput: function(type, value) {
      // eslint-disable-next-line no-debugger

      switch (true) {
        case type === "note":
          this.$emit("onKey", {
            type,
            value: value + (this.accidental || ""),
          });
          break;
        case type === "undo" ||
          type === "redo" ||
          type === "delete" ||
          type === "rightArrow" ||
          type === "leftArrow" ||
          type === "addStave":
          this.$emit("onKey", { type, value });
          break;
        case type === "accidental":
          this.accidental = this.accidental !== value ? value : null;
          break;
      }
    },
  },
  computed: {},
};
</script>
<style>
@import url(https://cdnjs.cloudflare.com/ajax/libs/MaterialDesign-Webfont/5.3.45/css/materialdesignicons.min.css);

.key-wrapper {
  @apply w-10 px-1 mb-2;
}

.key {
  @apply block w-full h-10 rounded bg-gray-900 shadow text-center leading-none;
}

.key:focus {
  @apply outline-none;
}

.key:hover {
  @apply text-white;
}

.key:hover {
  @apply bg-indigo-600;
}

.accidentalOn {
  @apply bg-orange-500;
}
</style>
