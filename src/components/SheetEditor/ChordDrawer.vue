
<template>

 <div v-bind:class="[{ 'open': show }, 'drawer-container']" >
     

    <nav class="chord-scales" v-for="(grade, index) in scaleChords.grades" :key="index">
     <button class="chord-heading">
            {{grade}}
        </button>

    <div  class="chordVariations">
           <button v-for="(chordVariation, variationIndex ) in chordVariations(scaleChords.chords[index])" :key="variationIndex" class="chordVariation" >{{chordVariation}}</button> 
    </div>
    </nav>
 </div>
</template>
<script>
import { Scale, Chord, Key } from "@tonaljs/tonal";
  export default {
  name: "chordDrawer",
  mixins: [],
  props: {
      chordNote:String,
      tonic:String
  },
  components: {

  },
  data() {
    return {
        show: true,
        scales: []
    };
  },
  mounted: function() {

      
  },
  methods: {
      getChordName(chordName,index){
          if(!this.chordNote) return '';
          const scale = Scale.get(`${this.chordNote} ${this.tonic}`);
          const note = scale.notes[index];
          return Chord.getChord(chordName, note).name;
      },
      chordVariations:function(chord){
  
          const chords = [chord, ...Chord.extended(chord)];
          
          return chords;
      
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
        min-height: 50vh;
        
        
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
    @apply text-white rounded-md shadow-sm  bg-teal-500 m-2 p-2 flex-wrap;
}

</style>


