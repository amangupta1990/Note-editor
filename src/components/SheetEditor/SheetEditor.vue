<template>
  <div class="text-gray-900">
    <new-sheet-dialog
      class="dialog"
      v-if="showNewSheetDialog"
      @onClickStart="initSheet"
    />
    <error-dialog
      v-if="showErrorDialog"
      @onClickYes="showErrorDialog = false"
      :message="errorMessage"
    />
    <nav class="menu-bar" id="fixed-header"></nav>

    <div class="container-wrapper">
      <div class="container">
        <div class="row">
          <div class="col-xs-12">
            <div id="svg-wrapper">
              <!-- height of 3 stave heights(overriden by javascript anyway) -->
              <!-- use rather div, but before that resolve NaNs in viewbox problem -->
              <!-- <div id="svg-container" width="800" height="420"></div> -->
              <svg
                id="svg-container"
                class="svg-contatainer"
                ref="svgcontainer"
              ></svg>
            </div>
          </div>
        </div>
      </div>
    </div>
    <floating-toolbar v-bind:x="noteXPos"   v-bind:y="noteYpos"  />
  </div>
</template>

<script>
import Editor from "../../../editor/dist/";
import NewSheetDialog from "./newSheetDialog.vue";
import ErrorDialog from "./errorDialog.vue";
import FloatingToolbar from "./floatingToolbar.vue";

export default {
  name: "SheetEditor",
  mixins: [],
  props: {},
  components: {
    NewSheetDialog,
    ErrorDialog,
    FloatingToolbar
  },
  data() {
    return {
      editor: null,
      showNewSheetDialog: true,
      showErrorDialog: false,
      errorMessage: "",
      noteXPos: null,
      noteYpos: null,
    };
  },
  mounted: function() {
    this.tab = "note";
  },
  methods: {
    initSheet: function(opts) {
      opts.errorHandler = this.editorErrorHandler;
      opts.onNoteSelected = this.editorOnNoteSelected;
      this.$nextTick().then(
        () => (this.editor = new Editor(this.$refs.svgcontainer, opts))
      );
      this.showNewSheetDialog = false;
    },

    editorErrorHandler: function(errorMessage) {
      this.errorMessage = errorMessage;
      this.showErrorDialog = true;
    },

    editorOnNoteSelected: function(notes){
      // eslint-disable-next-line no-debugger
      const {x,y} = notes[0];
      this.noteXPos = x;
      this.noteYpos = y;
    }
  },
};
</script>

<style>
.svg-contatainer {
  @apply w-full  outline-none;
  height: 100vh;
  z-index: 1;
}

.dialog {
  z-index: 10;
}

.menu-bar {
  @apply border shadow-md p-4 w-full bg-gray-100;
}
</style>
