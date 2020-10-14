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
    <keyboard  @onKey="onToolbarKey" @chordselected="onChordSelected" v-bind:keySig="keySig" tonic="major" v-if="editor" />
    <vue-simple-context-menu
  :elementId="'myUniqueId'"
  :options="contextMenuOpts"
  :ref="'vueSimpleContextMenu'"
  @option-clicked="optionClicked"/>

  </div>
</template>

<script>
import {Editor} from "../../../editor/dist/";
import NewSheetDialog from "./newSheetDialog.vue";
import ErrorDialog from "./errorDialog.vue";
import {Keyboard} from "./keyboard";



export default {
  name: "SheetEditor",
  mixins: [],
  props: {},
  components: {
    NewSheetDialog,
    ErrorDialog,
    Keyboard,
    
  },
  data() {
    return {
      editor: null,
      api: null,
      keySig: "",
      showNewSheetDialog: true,
      showErrorDialog: false,
      showChordDrawer:false,
      errorMessage: "",
      noteXPos: null,
      noteYpos: null,
      selectedNote:null,
      selectedStave:null,
      contextMenuOpts:[
        {name: 'Add Stave'},
      ],
    };
  },
  mounted: function() {
    this.tab = "note";
    this.showChordDrawer = false;
  },
  methods: {
    toggleChordDrawer: function(val){
      this.showChordDrawer=val;
    },
    optionClicked (event) {
        switch (event.option.name) {
          case 'Add Stave':
            this.api.addStave()
            break;
        
          default:
            break;
        }
},
    initSheet: function(opts) {
      this.keySig = opts.key;
      opts.errorHandler = this.editorErrorHandler;
      opts.onNoteSelected = this.editorOnNoteSelected;
      this.$nextTick().then(
        () => {
          this.editor = new Editor(this.$refs.svgcontainer, opts)
          this.api = this.editor.API();
          }
        
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
          case 'undo': this.api.undo(); break;
          case 'redo': this.api.redo(); break;
          case 'delete': this.api.deleteNotes();  break;
          case 'note':  
                  // eslint-disable-next-line no-case-declarations
                  const [note , acc1, acc2] = value.split('')
                  // eslint-disable-next-line no-case-declarations
                  const notes = this.api.addNote(note.toLowerCase(), `${acc1 || ''}${acc2 || ''}`); 
                  // eslint-disable-next-line no-debugger
                  notes.map(n=> this.api.playback(n.map(_n=>_n.replace("##","x"))   ))
                  break;
          case 'rightArrow': this.api.cursorForward(value); break;
          case 'leftArrow': this.api.cursorBack(value); break;
          case 'addStave': this.api.addStave();
        }

        

    },
    onChordSelected: function(chord){
      const variation = chord.variation.replace(chord.tonic,'');
      const notes =this.api.addChord(chord.tonic,variation);
      this.api.playback(notes);
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
  height: 94vh;
  z-index: 1;
}

.dialog {
  z-index: 10;
}

.menu-bar {
  @apply border shadow-md p-4 w-full bg-gray-100;
}
</style>
