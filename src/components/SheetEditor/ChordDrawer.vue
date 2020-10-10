
<template>

 <div v-bind:class="[{ 'open': show }, 'drawer-container']" >

<button class="drawer-handler" v-on:click="toggle()">
   Chords
</button>
<div class="container-inner">  
    <nav class="chord-scales" v-for="(grade, index) in scaleChords.grades" :key="index">
     <button class="chord-heading">
            {{grade}}
        </button>

    <div  class="chordVariations">
           <button v-on:click="$emit('chordselected', { tonic: getChordTonic(scaleChords.chords[index]), variation: chordVariation})" v-for="(chordVariation, variationIndex ) in chordVariations(scaleChords.chords[index])" :key="variationIndex" class="chordVariation" >{{chordVariation}}</button> 
    </div>
    </nav>
 </div>
 </div>   
</template>
<script>
import {  Chord, Key } from "@tonaljs/tonal";
  export default {
  name: "chordDrawer",
  mixins: [],
  props: {
      chordNote:String,
      tonic:String,
      show: Boolean
  },
  components: {

  },
  data() {
    return {
        
        scales: []
    };
  },
  mounted: function() {
        
      
  },
  methods: {
      toggle: function(){
          this.$emit("toggle", !this.show);
      },
    //   getChordName(chordName,index){
    //       if(!this.chordNote) return '';
    //       const scale = Scale.get(`${this.chordNote} ${this.tonic}`);
    //       const note = scale.notes[index];
    //       return Chord.getChord(chordName, note).name;
    //   },
      chordVariations:function(chord){
          const chords = [chord, ...Chord.extended(chord)];
          return chords;
      },
      getChordTonic(chord){
          return Chord.get(chord).tonic;
      }

       
  },
  computed: {
      scaleChords: function() {
          const chords = this.tonic === "major" ? Key.majorKey(this.chordNote) : Key.minorKey(this.chordNote);
          return chords;
      },
      

  }
};
</script>
<style>
    .drawer-container{
        @apply w-full absolute bottom-0 bg-gray-700 shadow-lg transition-all transform translate-y-full duration-200;
        max-height: 50vh;
    }

    .container-inner{
         overflow-y:scroll;
         @apply w-full h-full;
         max-height: 50vh;
    }

    .open{
        @apply translate-y-0;
    }

    .chord-scales{
        @apply flex flex-row ;
    }

    .chord-heading{
        @apply text-white py-4 px-6 block border-b-2 font-medium border-blue-500;
        @apply w-16 mr-4;
    }

    .chord-heading:hover {
    @apply text-blue-500;
}

    .chord-heading:focus {
    @apply outline-none;
}

.chordVariation{
    @apply text-white rounded-md shadow-sm  bg-teal-500 m-2 p-2 flex-wrap ;
}

.chordVariation:focus {
    @apply outline-none;
    @apply border-none;
}

.drawer-handler{
    @apply bg-gray-900  text-white font-semibold py-2 px-4   absolute right-0 outline-none ;
    margin-top:-39px;
}

.drawer-handler:focus {
    @apply outline-none;
     @apply border-none;

}





</style>


