
<template>

    <div class="bg-gray-800 text-gray-500 text-sm rounded-lg shadow-lg overflow-hidden p-5 absolute"  :style="style">
        <div class="flex -mx-1 justify-center">
            <div class="w-8 px-1 mb-2">
                <button class="block w-full h-10 rounded bg-gray-700 hover:bg-indigo-600 hover:text-white shadow focus:outline-none text-center leading-none"  v-on:click="onInput('note','A')"  >A</button>
            </div>
            <div class="w-8 px-1 mb-2">
                <button class="block w-full h-10 rounded bg-gray-700 hover:bg-indigo-600 hover:text-white shadow focus:outline-none text-center leading-none" v-on:click="onInput('note','B')" >B</button>
            </div>
            <div class="w-8 px-1 mb-2">
                <button class="block w-full h-10 rounded bg-gray-700 hover:bg-indigo-600 hover:text-white shadow focus:outline-none text-center leading-none" v-on:click="onInput('note','C')">C</button>
            </div>
            <div class="w-8 px-1 mb-2">
                <button class="block w-full h-10 rounded bg-gray-700 hover:bg-indigo-600 hover:text-white shadow focus:outline-none text-center leading-none" v-on:click="onInput('note','D')">D</button>
            </div>
            <div class="w-8 px-1 mb-2">
                <button class="block w-full h-10 rounded bg-gray-700 hover:bg-indigo-600 hover:text-white shadow focus:outline-none text-center leading-none" v-on:click="onInput('note','E')">E</button>
            </div>
            <div class="w-8 px-1 mb-2">
                <button class="block w-full h-10 rounded bg-gray-700 hover:bg-indigo-600 hover:text-white shadow focus:outline-none text-center leading-none" v-on:click="onInput('note','F')">F</button>
            </div>
            <div class="w-8 px-1 mb-2">
                <button class="block w-full h-10 rounded bg-gray-700 hover:bg-indigo-600 hover:text-white shadow focus:outline-none text-center leading-none" v-on:click="onInput('note','G')">G</button>
            </div>
        </div>
                <div class="flex -mx-1 justify-center" v-if="mode==='chord'">
            <div class="w-16 px-1 mb-2">
                <button class="block w-full h-10 rounded bg-gray-700 hover:bg-indigo-600 hover:text-white shadow focus:outline-none text-center leading-none" v-on:click="onInput('chord','Maj')">Maj</button>
            </div>
            <div class="w-16 px-1 mb-2">
                <button class="block w-full h-10 rounded bg-gray-700 hover:bg-indigo-600 hover:text-white shadow focus:outline-none text-center leading-none" v-on:click="onInput('chord','Min')" >Min</button>
            </div>
            <div class="w-16 px-1 mb-2">
                <button class="block w-full h-10 rounded bg-gray-700 hover:bg-indigo-600 hover:text-white shadow focus:outline-none text-center leading-none" v-on:click="onInput('chord','Maj7')">Maj7</button>
            </div>
            <div class="w-16 px-1 mb-2">
                <button class="block w-full h-10 rounded bg-gray-700 hover:bg-indigo-600 hover:text-white shadow focus:outline-none text-center leading-none" v-on:click="onInput('chord','7')" >7</button>
            </div>
            <div class="w-16 px-1 mb-2">
                <button class="block w-full h-10 rounded bg-gray-700 hover:bg-indigo-600 hover:text-white shadow focus:outline-none text-center leading-none" v-on:click="onInput('chord','Min7')" >Min7</button>
            </div>
            <div class="w-16 px-1 mb-2">
                <button class="block w-full h-10 rounded bg-gray-700 hover:bg-indigo-600 hover:text-white shadow focus:outline-none text-center leading-none" v-on:click="onInput('chord','MinMaj7')">MinMaj7</button>
            </div>
            <div class="w-16 px-1 mb-2">
                <button class="block w-full h-10 rounded bg-gray-700 hover:bg-indigo-600 hover:text-white shadow focus:outline-none text-center leading-none" v-on:click="onInput('chord','Sus2')">Sus2</button>
            </div>
                        <div class="w-16 px-1 mb-2">
                <button class="block w-full h-10 rounded bg-gray-700 hover:bg-indigo-600 hover:text-white shadow focus:outline-none text-center leading-none" v-on:click="onInput('chord','Sus4')" >Sus4</button>
            </div>
        </div>
        <div class="flex -mx-1">
            <div class="w-10 px-1 mb-2">
                <button class="block w-full h-10 rounded bg-gray-900 hover:bg-indigo-600 hover:text-white shadow focus:outline-none text-center leading-none">
                    <i class="mdi mdi-arrow-up-bold text-lg" v-on:click="onInput('octaveChange',1)"></i>
                </button>
            </div>
            <div class="flex flex-1 justify-center">
                <div class="w-8 px-1 mb-2">
                    <button class="block w-full h-10 rounded bg-gray-700 hover:bg-indigo-600 hover:text-white shadow focus:outline-none text-center leading-none"  v-on:click="onInput('accidental','b')" >b</button>
                </div>
                <div class="w-8 px-1 mb-2">
                    <button class="block w-full h-10 rounded bg-gray-700 hover:bg-indigo-600 hover:text-white shadow focus:outline-none text-center leading-none" v-on:click="onInput('accidental','bb')" >bb</button>
                </div>
                <div class="w-8 px-1 mb-2">
                    <button class="block w-full h-10 rounded bg-gray-700 hover:bg-indigo-600 hover:text-white shadow focus:outline-none text-center leading-none" v-on:click="onInput('accidental','#')" >#</button>
                </div>
                <div class="w-8 px-1 mb-2">
                    <button class="block w-full h-10 rounded bg-gray-700 hover:bg-indigo-600 hover:text-white shadow focus:outline-none text-center leading-none" v-on:click="onInput('accidental','##')" >##</button>
                </div>
                <div class="w-8 px-1 mb-2">
                    <button class="block w-full h-10 rounded bg-gray-700 hover:bg-indigo-600 hover:text-white shadow focus:outline-none text-center leading-none" v-on:click="onInput('accidental','N')" >N</button>
                </div>
            </div>
            <div class="w-10 px-1 mb-2">
                <button class="block w-full h-10 rounded bg-gray-900 hover:bg-indigo-600 hover:text-white shadow focus:outline-none text-center leading-none" v-on:click="onInput('delete')" >
                    <i class="mdi mdi-backspace-outline text-lg" ></i>
                </button>
            </div>
        </div>
        <div class="flex -mx-1">
            <div class="w-10 px-1">
                <button class="block w-full h-10 rounded bg-gray-900 hover:bg-indigo-600 hover:text-white shadow focus:outline-none text-center leading-none" v-on:click="onInput('octaveChange',-1)">
                     <i class="mdi mdi-arrow-down-bold text-lg" ></i>
                </button>
            </div>
            <div class="w-16 px-1">
                <button class="block w-full h-10 rounded bg-gray-900 hover:bg-indigo-600 hover:text-white shadow focus:outline-none text-center leading-none" v-on:click="mode = 'note'" v-if="mode != 'note'">
                    note
                </button>
                <button class="block w-full h-10 rounded bg-gray-900 hover:bg-indigo-600 hover:text-white shadow focus:outline-none text-center leading-none" v-on:click="mode = 'chord'" v-if="mode != 'chord'">
                    chord
                </button>
            </div>
            <div class="w-20 px-1 float-right">
                <button class="block w-full h-10 rounded bg-gray-700 hover:bg-indigo-600 hover:text-white shadow focus:outline-none text-center leading-none text-xs" v-on:click="onInput('undo')">
                     <i class="mdi  mdi-undo text-lg"></i>
                </button>
            </div>
            <div class="w-20 px-1">
                <button class="block w-full h-10 rounded bg-gray-900 hover:bg-indigo-600 hover:text-white shadow focus:outline-none text-center leading-none text-xs" v-on:click="onInput('redo',-1)">
                    <i class="mdi  mdi-redo text-lg"></i>
                </button>
            </div>
        </div>
    </div>

</template>
<script>
   export default {
  name: "FloatingToolbar",
  mixins: [],
  props: {
      visible: Boolean,
      x: Number,
      y: Number
  },
  components: {

  },
  data() {
    return {
        mode: "note",
        note: null,
    };
  },
  mounted: function() {
      this.visible = false;
  },
  methods: {
        onInput: function(type,value){

            switch(true){
                case this.mode === 'note' && type=== 'note':
                        this.$emit('onKey',{
                            type,
                            value
                        });
                        break;
                case this.mode === 'chord' && type === 'chordType':
                     break;
                case type === 'undo' || type ==='redo' || type === 'delete':
                
                     this.$emit('onKey',{type});
                     break;

            }
      
            
        }
  },
  computed: {
      style: function(){
          // eslint-disable-next-line no-debugger
          let s = `left: ${ Math.round(this.x || 0) }px ; top: ${ Math.round(this.y+100 || 0) }px`;
         return s;
      },

  }
};
</script>
<style>

@import url(https://cdnjs.cloudflare.com/ajax/libs/MaterialDesign-Webfont/5.3.45/css/materialdesignicons.min.css);
</style>


