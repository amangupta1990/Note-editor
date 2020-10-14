
<template>
  <div
    class="bg-gray-800 text-gray-500 text-sm rounded-lg  overflow-hidden p-5  bottom-0 m-auto block" style="width:100vw"
  >
    <div class="flex flex-row justify-center">
      <button
        class="block w-24 h-auto mr-2 rounded bg-gray-700 hover:bg-indigo-600 hover:text-white shadow focus:outline-none text-center leading-none text-xs"
        v-on:click="onInput('leftArrow')" 
      >
        <i class="mdi  mdi-arrow-left-bold text-lg"></i>
      </button>

      <div>
        <div class="flex -mx-1 justify-center">
          <div class="key-wrapper">
            <button
              class="key"
              v-on:click="onInput('note', 'A')"
            >
              A
            </button>
          </div>
          <div class="key-wrapper">
            <button
              class="key"
              v-on:click="onInput('note', 'B')"
            >
              B
            </button>
          </div>
          <div class="key-wrapper">
            <button
              class="key"
              v-on:click="onInput('note', 'C')"
            >
              C
            </button>
          </div>
          <div class="key-wrapper">
            <button
              class="key"
              v-on:click="onInput('note', 'D')"
            >
              D
            </button>
          </div>
          <div class="key-wrapper">
            <button
              class="key"
              v-on:click="onInput('note', 'E')"
            >
              E
            </button>
          </div>
          <div class="key-wrapper">
            <button
              class="key"
              v-on:click="onInput('note', 'F')"
            >
              F
            </button>
          </div>
          <div class="key-wrapper">
            <button
              class="key"
              v-on:click="onInput('note', 'G')"
            >
              G
            </button>
          </div>
        </div>
        <div class="flex -mx-1">
          <div class="key-wrapper">
            <button
              class="block w-full h-10 rounded bg-gray-900 hover:bg-indigo-600 hover:text-white shadow focus:outline-none text-center leading-none"
              v-on:click="onInput('octaveChange', 1)"
            >
              +
            </button>
          </div>
          <div class="flex flex-1 justify-center">
            <div class="key-wrapper">
              <button
                v-bind:class="['key',accidental === 'b' ? 'accidentalOn' : '']"
                v-on:click="onInput('accidental', 'b')" 
              >
                b
              </button>
            </div>
            <div class="key-wrapper">
              <button
                v-bind:class="['key',accidental === 'bb' ? 'accidentalOn' : '']"
                v-on:click="onInput('accidental', 'bb')"
              >
                bb
              </button>
            </div>
            <div class="key-wrapper">
              <button
                v-bind:class="['key',accidental === '#' ? 'accidentalOn' : '']"
                v-on:click="onInput('accidental', '#')"
              >
                #
              </button>
            </div>
            <div class="key-wrapper">
              <button
                v-bind:class="['key',accidental === '##' ? 'accidentalOn' : '']"
                v-on:click="onInput('accidental', '##')"
              >
                ##
              </button>
            </div>
            <div class="key-wrapper">
              <button
                v-bind:class="['key',accidental === 'N' ? 'accidentalOn' : '']"
                v-on:click="onInput('accidental', 'N')"
              >
                N
              </button>
            </div>
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
        <div class="flex -mx-1">
          <div class="w-10 px-1">
            <button
              class="block w-full h-10 rounded bg-gray-900 hover:bg-indigo-600 hover:text-white shadow focus:outline-none text-center leading-none"
              v-on:click="onInput('octaveChange', -1)"
            >
              -
            </button>
          </div>

          <div class="w-20 px-1 float-right">
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
        </div>
      </div>
   

    <button
      class="block w-24 h-auto ml-2 rounded bg-gray-700 hover:bg-indigo-600 hover:text-white shadow focus:outline-none text-center leading-none text-xs"
      v-on:click="onInput('rightArrow')"
    >
      <i class="mdi  mdi-arrow-right-bold text-lg"></i>
    </button>
    </div>
  </div>
</template>
<script>
/* eslint-disable no-fallthrough */
export default {
  name: "KeyPad",
  mixins: [],
  props: {
    visible: Boolean,
    x: Number,
    y: Number,
  },
  components: {},
  data() {
    return {
      accidental: null,
      note: null,
    };
  },
  mounted: function() {
    this.visible = false;
    document.addEventListener("keyup",this.KeyboardListeners)
  }
,
  beforeDestroy: function(){
    document.removeEventListener('keyup',this.KeyboardListeners);
  },
  methods: {
    onInput: function(type, value) {
      switch (true) {
        case type === "note":
          this.$emit("onKey", {
            type,
            value: value+(this.accidental || ''),
          });
          break;
        case type === "undo" || type === "redo" || type === "delete" || type === "rightArrow" || type === "leftArrow" || type === "addStave":
          this.$emit("onKey", { type });
          break;
        case type === "accidental":
          this.accidental =  this.accidental !== value ? value : null;
          break;
      }
    },
    KeyboardListeners(event) {

      let noteMatch = event.key.length === 1 ? event.key.match(/[abcdefg]/) : null;

      switch (true) {
        case event.key === "ArrowRight": {
          this.onInput('rightArrow')
          break;
        }

        case event.key === "ArrowLeft": {
          this.onInput('leftArrow')
          break;
        }

        case event.key === "Backspace": {
         this.onInput('delete')
          break;
        }

        case event.key === "s": {
          if(event.ctrlKey) {
          this.saveState()
          this._splitSelectedNote();
          this.Draw();
          break;
          }
        }

        case event.key === "j": {
          if(event.ctrlKey) {
          this.saveState()
          this._mergeNotes();
          this.Draw();
          break;
          }
        }

        // undo and redo

        case event.key === "z": {
          if(event.ctrlKey || event.metaKey ) {
          this.onInput('undo')
          break;
          }
        }

        case event.key === "r": {
          if(event.ctrlKey || event.metaKey ){
          this.onInput('redo')
          break;
          }
        }

        case event.key === "t": {
          if(event.ctrlKey || event.metaKey ){
          this.onInput('tie')
          break;
          }
        }

        case event.key === "a": {
          if(event.ctrlKey || event.metaKey ) {
          this.onInput('addStave')
          break
          }
        }

        // enable accidentals accordingly 

        case event.key === "B"  || event.key === "#"  || event.key === "N" : {
          if(event.shiftKey ){
          
          let key = event.key.toLowerCase();

          switch(true){
            case this.accidental === null : this.accidental = key ; break;
            case this.accidental  && this.accidental.indexOf(key) < 0 : this.accidental = key; break;
            case key === "b":
                this.accidental = this.accidental === "b" && this.accidental === key ? this.accidental = "bb" :  null  ; break;
            case key === "#":
                this.accidental = this.accidental === "#" && this.accidental === key? this.accidental = "##" :  null; break;
            case key === "n":
                  this.accidental = this.accidental ==="n" ? this.accidental = null : this.accidental = "n" ; break;
            
          }
          

          break;
        }
        }

        // for adding note s 
        case noteMatch && noteMatch.length === 1: {
          
            this.onInput("note",event.key.toLowerCase())
          break;
        } 

        case event.key === "Control": this.ctrlActive = false; break;
        case event.key === "Shift": this.shiftActive = false; break;
        case event.key === "Meta": this.metaActive = false; break;

      }

      document.addEventListener("keydown",(event)=>{
        switch(true){
        case event.key === "Control": this.ctrlActive = true; break;
        case event.key === "Shift": this.shiftActive = true; break;
        case event.key === "Meta": this.metaActive = true; break;
        }
      })

      
  


  }
  },
  computed: {},
};
</script>
<style>
@import url(https://cdnjs.cloudflare.com/ajax/libs/MaterialDesign-Webfont/5.3.45/css/materialdesignicons.min.css);


.key-wrapper{
  @apply w-10 px-1 mb-2;
}

.key{
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
  @apply bg-orange-500
}

</style>
