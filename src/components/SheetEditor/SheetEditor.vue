<template>
  <div class="text-gray-900">
    <new-sheet-dialog class="dialog" v-if="showNewSheetDialog" @onClickStart="initSheet"  />
    <error-dialog v-if="showErrorDialog" @onClickYes="showErrorDialog = false;"/>>
    <nav class="menu-bar" id="fixed-header">
   
    

 
    </nav>

    <div class="container-wrapper">
      <div class="container">
        <div class="row">
          <div class="col-xs-12">
            <div id="svg-wrapper">
              <!-- height of 3 stave heights(overriden by javascript anyway) -->
              <!-- use rather div, but before that resolve NaNs in viewbox problem -->
              <!-- <div id="svg-container" width="800" height="420"></div> -->
              <svg id="svg-container" class="svg-contatainer" ref="svgcontainer"></svg>
            </div>
          </div>
        </div>
      </div>
    </div>
   
  </div>
</template>


<script>
import Editor from '../../../editor/dist/';
import NewSheetDialog from './newSheetDialog.vue';
import ErrorDialog from './errorDialog.vue';

export default {
  name: "SheetEditor",
  mixins: [],
  props: {

  },
  components:{
    NewSheetDialog,
    ErrorDialog
  },
  data() {
    return {
      editor: null,
      showNewSheetDialog: false,
      showErrorDialog: true
    };
  },
  mounted: function() {
   this.tab = "note"

  },
  methods: {
    initSheet: function(opts){

     this.$nextTick()
   .then(()=> this.editor = new Editor(this.$refs.svgcontainer,opts))
   this.showNewSheetDialog = false
    }
  },
  
};
</script>

<style > 

.svg-contatainer {
  @apply w-full  outline-none;
  height: 100vh;
  z-index:1;
}

.dialog {
  z-index:10
}

.menu-bar{
  @apply border shadow-md p-4 w-full bg-gray-100;
}

</style>


