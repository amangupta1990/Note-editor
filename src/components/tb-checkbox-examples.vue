<template>
  <div class="mx-auto max-w-lg text-blue-900">
    <h1 class="text-3xl font-bold text-center mt-4">Checkbox Examples</h1>
    <p class="text-center">
      Shamelessly taken from
      <a
        href="https://github.com/buefy/buefy/blob/dev/src/components/checkbox/Checkbox.vue"
      >Buefy</a>.
    </p>

    <div class="my-8 rounded-lg overflow-hidden shadow-lg p-8">
      <h2 class="text-xl font-bold">Simple On/Off Checkbox</h2>
      <div class="mt-2">
        <tb-checkbox v-model="simpleCheckbox">{{ simpleCheckboxLabel }}</tb-checkbox>
      </div>
      <div class="bg-blue-100 text-blue-800 mt-6 p-6 -mx-8 -mb-8">
        <strong>Current Selection:</strong>
        <br>
        <pre class="mt-4 text-sm">{{ simpleCheckbox }}</pre>
      </div>
    </div>

    <div class="my-8 rounded-lg overflow-hidden shadow-lg p-8">
      <h2 class="text-xl font-bold">Checkbox Group</h2>
      <div class="mt-2">
        <tb-checkbox v-model="checkboxGroup" native-value="Monday">Monday</tb-checkbox>
        <tb-checkbox v-model="checkboxGroup" native-value="Tuesday">Tuesday</tb-checkbox>
        <tb-checkbox v-model="checkboxGroup" native-value="Wednesday">Wednesday</tb-checkbox>
        <tb-checkbox v-model="checkboxGroup" native-value="Thursday">Thursday</tb-checkbox>
        <tb-checkbox v-model="checkboxGroup" native-value="Friday">Friday</tb-checkbox>
        <tb-checkbox v-model="checkboxGroup" native-value="Saturday">Saturday</tb-checkbox>
        <tb-checkbox v-model="checkboxGroup" native-value="Sunday">Sunday</tb-checkbox>
      </div>
      <div class="bg-blue-100 text-blue-800 mt-6 p-6 -mx-8 -mb-8">
        <strong>Current Selection:</strong>
        <br>
        <pre class="mt-4 text-sm">{{ checkboxGroup }}</pre>
      </div>
    </div>

    <div class="my-8 rounded-lg overflow-hidden shadow-lg p-8">
      <h2 class="text-xl font-bold">Inverted Checkbox</h2>
      <p>Show a checked checkbox despite the data value being false (and vice versa).</p>
      <div class="mt-2">
        <tb-checkbox
          v-model="invertedCheckbox"
          true-value="false"
          false-value="true"
        >{{ invertedCheckboxLabel }}</tb-checkbox>
      </div>
      <div class="bg-blue-100 text-blue-800 mt-6 p-6 -mx-8 -mb-8">
        <strong>Current Selection:</strong>
        <br>
        <pre class="mt-4 text-sm">{{ invertedCheckbox }}</pre>
      </div>
    </div>
  </div>
</template>

<script>
import TbCheckbox from "./tb-checkbox.vue";

export default {
  components: {
    TbCheckbox
  },
  props: {
    msg: String
  },
  data() {
    return {
      simpleCheckbox: false,
      simpleCheckboxLabel: "Yes",
      checkboxGroup: ["Monday"],
      invertedCheckbox: false,
      invertedCheckboxLabel: "Yes"
    };
  }
};
</script>


<style scoped>
</style>
