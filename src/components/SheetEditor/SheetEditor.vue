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
    <chord-drawer chordNote="C" tonic= "major" ></chord-drawer>
    <vue-simple-context-menu
  :elementId="'myUniqueId'"
  :options="contextMenuOpts"
  :ref="'vueSimpleContextMenu'"
  @option-clicked="optionClicked"
/>
    <!-- <floating-toolbar v-bind:x="noteXPos"   v-bind:y="noteYpos" @onKey="onToolbarKey"  /> -->
  </div>
</template>

<script>
import Editor from "../../../editor/dist/";
import NewSheetDialog from "./newSheetDialog.vue";
import ErrorDialog from "./errorDialog.vue";
import ChordDrawer from "./ChordDrawer";


export default {
  name: "SheetEditor",
  mixins: [],
  props: {},
  components: {
    NewSheetDialog,
    ErrorDialog,
    ChordDrawer
    
  },
  data() {
    return {
      editor: null,
      showNewSheetDialog: true,
      showErrorDialog: false,
      errorMessage: "",
      noteXPos: null,
      noteYpos: null,
      selectedNote:null,
      selectedStave:null,
      contextMenuOpts:[
        {name: 'chord'},
        {name: 'rythm'},
      ],
    };
  },
  mounted: function() {
    this.tab = "note";
  },
  methods: {
    optionClicked (event) {
  window.alert(JSON.stringify(event))
},
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
      this.selectedNote = notes[0];
      const {x,y} = notes[0];
      this.noteXPos = x;
      this.noteYpos = y;
      
    },
    handleClick (event) {
      this.$refs.vueSimpleContextMenu.showMenu(event, this.selectedNote)
    },

    onToolbarKey: function(event){
        const {type , value} = event;
        
        switch(type){
          case 'undo': this.editor.undo(); break;
          case 'redo': this.editor.redo(); break;
          case 'delete': this.editor.deleteNotes(); this.editor.update(); break;
          case 'note': this.editor.addNote(`${value.toLowerCase()}/4`); this.editor.update(); break;
        }

        

    }
  },
};
</script>

<style>

#svg-wrapper{
  @apply overflow-x-scroll;
  width:100vw;
}

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
