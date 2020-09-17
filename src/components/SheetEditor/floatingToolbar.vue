
<template>

    <div class="bg-gray-800 text-gray-500 text-sm rounded-lg shadow-lg overflow-hidden p-5 absolute"  :style="style">
        <div class="flex -mx-1 justify-center">
            <div class="w-8 px-1 mb-2">
                <button class="block w-full h-10 rounded bg-gray-700 hover:bg-indigo-600 hover:text-white shadow focus:outline-none text-center leading-none">A</button>
            </div>
            <div class="w-8 px-1 mb-2">
                <button class="block w-full h-10 rounded bg-gray-700 hover:bg-indigo-600 hover:text-white shadow focus:outline-none text-center leading-none">B</button>
            </div>
            <div class="w-8 px-1 mb-2">
                <button class="block w-full h-10 rounded bg-gray-700 hover:bg-indigo-600 hover:text-white shadow focus:outline-none text-center leading-none">C</button>
            </div>
            <div class="w-8 px-1 mb-2">
                <button class="block w-full h-10 rounded bg-gray-700 hover:bg-indigo-600 hover:text-white shadow focus:outline-none text-center leading-none">D</button>
            </div>
            <div class="w-8 px-1 mb-2">
                <button class="block w-full h-10 rounded bg-gray-700 hover:bg-indigo-600 hover:text-white shadow focus:outline-none text-center leading-none">E</button>
            </div>
            <div class="w-8 px-1 mb-2">
                <button class="block w-full h-10 rounded bg-gray-700 hover:bg-indigo-600 hover:text-white shadow focus:outline-none text-center leading-none">F</button>
            </div>
            <div class="w-8 px-1 mb-2">
                <button class="block w-full h-10 rounded bg-gray-700 hover:bg-indigo-600 hover:text-white shadow focus:outline-none text-center leading-none">G</button>
            </div>
        </div>
        <div class="flex -mx-1">
            <div class="w-10 px-1 mb-2">
                <button class="block w-full h-10 rounded bg-gray-900 hover:bg-indigo-600 hover:text-white shadow focus:outline-none text-center leading-none">
                    <i class="mdi mdi-arrow-up-bold text-lg"></i>
                </button>
            </div>
            <div class="flex flex-1 justify-center">
                <div class="w-8 px-1 mb-2">
                    <button class="block w-full h-10 rounded bg-gray-700 hover:bg-indigo-600 hover:text-white shadow focus:outline-none text-center leading-none">b</button>
                </div>
                <div class="w-8 px-1 mb-2">
                    <button class="block w-full h-10 rounded bg-gray-700 hover:bg-indigo-600 hover:text-white shadow focus:outline-none text-center leading-none">bb</button>
                </div>
                <div class="w-8 px-1 mb-2">
                    <button class="block w-full h-10 rounded bg-gray-700 hover:bg-indigo-600 hover:text-white shadow focus:outline-none text-center leading-none">#</button>
                </div>
                <div class="w-8 px-1 mb-2">
                    <button class="block w-full h-10 rounded bg-gray-700 hover:bg-indigo-600 hover:text-white shadow focus:outline-none text-center leading-none">##</button>
                </div>
                <div class="w-8 px-1 mb-2">
                    <button class="block w-full h-10 rounded bg-gray-700 hover:bg-indigo-600 hover:text-white shadow focus:outline-none text-center leading-none">N</button>
                </div>
            </div>
            <div class="w-10 px-1 mb-2">
                <button class="block w-full h-10 rounded bg-gray-900 hover:bg-indigo-600 hover:text-white shadow focus:outline-none text-center leading-none">
                    <i class="mdi mdi-backspace-outline text-lg"></i>
                </button>
            </div>
        </div>
        <div class="flex -mx-1">
            <div class="w-10 px-1">
                <button class="block w-full h-10 rounded bg-gray-900 hover:bg-indigo-600 hover:text-white shadow focus:outline-none text-center leading-none">
                     <i class="mdi mdi-arrow-down-bold text-lg"></i>
                </button>
            </div>
            <div class="w-10 px-1">
                <button class="block w-full h-10 rounded bg-gray-900 hover:bg-indigo-600 hover:text-white shadow focus:outline-none text-center leading-none">
                    note
                </button>
            </div>
            <div class="flex-1 px-1">
                <button class="block w-full h-10 rounded bg-gray-700 hover:bg-indigo-600 hover:text-white shadow focus:outline-none text-center leading-none text-xs">
                     <i class="mdi  mdi-undo text-lg"></i>
                </button>
            </div>
            <div class="w-20 px-1">
                <button class="block w-full h-10 rounded bg-gray-900 hover:bg-indigo-600 hover:text-white shadow focus:outline-none text-center leading-none text-xs">
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
   
    };
  },
  mounted: function() {
      this.visible = false;
  },
  methods: {

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


