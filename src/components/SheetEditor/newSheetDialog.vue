<template>
  <div class="flex items-center justify-center h-screen w-full absolute top-0">
    <div
      class="bg-indigo-500 text-white font-bold rounded-lg border shadow-lg p-10"
    >
    <h1 class="text-white text-xl m-4 text-center" > New Sheet</h1>
      <!--Body-->

      <form class="bg-white  rounded px-8 pt-6 pb-8 mb-4">
        <div class="mb-4">
          <label
            class="block text-gray-700 text-sm font-bold mb-2"
            for="username"
          >
            Key
          </label>
          <input
            v-model="key"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="username"
            type="text"
            placeholder="c"
          />
        </div>
        <div class="mb-6">
          <label
            class="block text-gray-700 text-sm font-bold mb-2"
            for="password"
          >
            Time Signature
          </label>
          <input
            v-model="time"
            class="shadow appearance-none border border-red-500 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            id="password"
            type="text"
            placeholder="4/4"
          />
          <p v-if="timeSigError" class="text-red-500 text-xs italic"> valid signatures : 4/4 , 3/4 , 6/8 etc </p>
        </div>

        <div class="flex justify-end pt-2">
          <button v-on:click="onClickHandler"
            class="modal-close px-4 bg-indigo-500 p-3 rounded-lg text-white hover:bg-indigo-400"
          >
            start
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: "NewSheetDialog",
  mixins: [],
  props: {

  },
  data: function() {
    return {
      key: "c",
      time: "4/4",
      timeSigError: false,
    };
  },
  mounted: function() {},
  methods: {
    onClickHandler:function(event) {
      event.preventDefault();

      if(this.time.indexOf("/") === -1  ) {
        this.timeSigError = true;
        return ;
      }

      
      const opts = {
        key: this.key,
        timeSig: this.time
      };

     this.$emit('onClickStart',opts)
    },
  },
};
</script>
<style>
.modal {
  transition: opacity 0.25s ease;
}
</style>
