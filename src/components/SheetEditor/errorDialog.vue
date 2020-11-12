<template>
  <div
    class="flex items-center justify-center h-screen w-full absolute top-0  bg-opacity-50 bg-black"
  >
    <div
      class="bg-indigo-500 text-white font-bold rounded-lg border shadow-lg p-10"
    >
      <h1 class="text-white text-xl m-4 text-center">Something went wrong !</h1>
      <!--Body-->
      <div>
        {{
          message ||
            " An error occurred while trying to perform this operation. "
        }}
      </div>
      <div class="flex justify-end pt-2">
        <button
          v-on:click="onClickHandler"
          class="modal-close px-4 bg-indigo-500 p-3 rounded-lg text-white hover:bg-indigo-400"
        >
          Ok
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ErrorDialog",
  mixins: [],
  props: {
    message: String
  },
  data: function() {
    return {};
  },
  mounted: function() {},
  methods: {
    onClickHandler: function() {
      this.$emit("onClickYes");
    }
  }
};
</script>
<style>
.modal {
  transition: opacity 0.25s ease;
}
</style>
