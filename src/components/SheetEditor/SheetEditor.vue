<template>
  <div class="text-gray-900">
    <new-sheet-dialog
      class="dialog"
      v-if="showNewSheetDialog"
      @onClickStart="initSheet"
    />
    <error-dialog
      class="dialog"
      v-if="showErrorDialog"
      @onClickYes="showErrorDialog = false"
      :message="errorMessage"
    />
    <nav class="menu-bar" id="fixed-header">
      <playback-controls style="float: right"></playback-controls>
    </nav>
    <div class="container-wrapper">
      <div class="container">
        <div class="row">
          <div class="col-xs-12">
            <div id="svg-wrapper">
              <!-- height of 3 stave heights(overriden by javascript anyway) -->
              <!-- use rather div, but before that resolve NaNs in viewbox problem -->
              <!-- <div id="svg-container" width="800" height="420"></div> -->
              <svg
                @contextmenu.prevent.stop="handleClick($event)"
                id="svg-container"
                class="svg-contatainer"
                ref="svgcontainer"
              ></svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <keyboard
      @onKey="onToolbarKey"
      @chordselected="onChordSelected"
      v-bind:keySig="keySig"
      tonic="major"
      v-if="editor"
    />
    <vue-simple-context-menu
      :elementId="'myUniqueId'"
      :options="contextMenuOpts"
      :ref="'vueSimpleContextMenu'"
      @option-clicked="optionClicked"
    />
  </div>
</template>

<script>
import Editor from "./SheetEditor";
import NewSheetDialog from "./newSheetDialog.vue";
import ErrorDialog from "./errorDialog.vue";
import { Keyboard } from "./keyboard";
import { playChord } from "./playback/AudioEngine";
import PlaybackControls from "./playback/playbackControls.vue";
import { EventBus } from "@/main";

export default {
  name: "SheetEditor",
  mixins: [],
  props: {},
  components: {
    NewSheetDialog,
    ErrorDialog,
    Keyboard,
    PlaybackControls
  },
  data() {
    return {
      editor: null,
      api: null,
      keySig: "",
      showNewSheetDialog: true,
      showErrorDialog: false,
      showChordDrawer: false,
      errorMessage: "",
      noteXPos: null,
      noteYpos: null,
      selectedNote: null,
      selectedStave: null,
      contextMenuOpts: [{ name: "Add Stave" }]
    };
  },
  mounted: function() {
    this.tab = "note";
    this.showChordDrawer = false;
    this.playbackEventHandler();
  },
  methods: {
    toggleChordDrawer: function(val) {
      this.showChordDrawer = val;
    },
    optionClicked(event) {
      switch (event.option.name) {
        case "Add Stave":
          this.api.addStave();
          break;

        default:
          break;
      }
    },
    initSheet: function(opts) {
      this.keySig = opts.key;
      opts.errorHandler = this.editorErrorHandler;
      opts.onNoteSelected = this.editorOnNoteSelected;
      opts.onRender = this.editorOnUpdate;
      this.$nextTick().then(() => {
        this.editor = new Editor(this.$refs.svgcontainer, opts);
        this.api = this.editor.API();
        const sheet = this.api.sheet();
        EventBus.$emit("AE_INIT", {
          sheet,
          timeSig: opts.timeSig,
          bpm: 120
        });
      });
      this.showNewSheetDialog = false;
    },

    editorErrorHandler: function(errorMessage) {
      this.errorMessage = errorMessage;
      this.showErrorDialog = true;
    },

    editorOnNoteSelected: function(notes) {
      this.selectedNote = notes[0];
      const { x, y } = notes[0];
      this.noteXPos = x;
      this.noteYpos = y;
    },
    editorOnUpdate: function(sheet) {
      EventBus.$emit("AE_UPDATE", { sheet });
    },
    handleClick(event) {
      this.$refs.vueSimpleContextMenu.showMenu(event, this.selectedNote);
    },

    onToolbarKey: function(event) {
      const { type, value } = event;

      switch (type) {
        case "undo":
          this.api.undo();
          break;
        case "redo":
          this.api.redo();
          break;
        case "delete":
          this.api.deleteNotes();
          break;
        case "note":
          // eslint-disable-next-line no-case-declarations
          const [note, acc1, acc2] = value.split("");
          // eslint-disable-next-line no-case-declarations
          const notes = this.api.addNote(
            note.toLowerCase(),
            `${acc1 || ""}${acc2 || ""}`
          );
          // eslint-disable-next-line no-debugger
          playChord(notes);
          break;
        case "rightArrow":
          this.api.cursorForward(value);
          break;
        case "leftArrow":
          this.api.cursorBack(value);
          break;
        case "addStave":
          this.api.addStave();
          break;
        case "splitNote":
          this.api.splitSelectedNote();
          break;
        case "mergeNote":
          this.api.mergeNotes();
          break;
      }
    },
    playbackEventHandler: function() {
      EventBus.$on("AE_PROGRESS", data => {
        const seekbar = data.seekbar;
        this.api.highlightStave(seekbar.bar);
      });
    },
    onChordSelected: function(chord) {
      const variation = chord.variation.replace(chord.tonic, "");
      const notes = this.api.addChord(chord.tonic, variation);
      playChord(notes);
    }
  }
};
</script>

<style>
#svg-wrapper {
  @apply overflow-x-scroll;
  width: 100vw;
}

.svg-contatainer {
  @apply w-full  outline-none;
  height: 94vh;
  z-index: 1;
}

.dialog {
  z-index: 10;
}

.menu-bar {
  @apply border shadow-md p-4 w-full bg-gray-100;
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
