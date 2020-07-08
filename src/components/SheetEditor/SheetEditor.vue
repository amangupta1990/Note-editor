<template>
  <div class="text-gray-900">
    <nav class="border shadow-md p-4 w-full" id="fixed-header">
      <div class="container">
        <ul class="flex p4 mb-4" id="this-tabs">
          <li class="mr-6">
            <a v-on:click="tab='file'" data-toggle="tab">File</a>
          </li>
          <li class="mr-6">
            <a v-on:click=" tab = 'measure'; switchToMeasureMode();" data-toggle="tab">Measure</a>
          </li>
          <li class="mr-6">
            <a href="#note" v-on:click=" tab='note'; switchToNoteMode();" data-toggle="tab">Note</a>
          </li>
          <div id="play-bar">
            <button
              type="button"
              name="play"
              id="button-play"
              class="btn btn-success btn-sm play-button"
              v-on:click="play();"
            >
              <span class="glyphicon glyphicon-play" aria-hidden="true"></span>
            </button>
            <button
              type="button"
              name="stop"
              id="button-stop"
              class="btn btn-danger btn-sm play-button"
              v-on:click="stop();"
            >
              <span class="glyphicon glyphicon-stop" aria-hidden="true"></span>
            </button>
          </div>
        </ul>

        <div class="tab-content" id="control-panel">
          <div v-if="tab==='file'" class="tab-pane fade in" id="file">
            <div class="tool-section" style="position: relative; top: -5px;">
              <select id="examples-dropdown">
                <option value="default" selected>Choose example</option>
                <option value="./examples/Chant.xml">Chant.xml</option>
                <option value="./examples/Echigo-Jishi.xml">Echigo-Jishi.xml</option>
                <option value="./examples/Saltarello.xml">Saltarello.xml</option>
              </select>
            </div>
            <div class="tool-section" style="position: relative;top: 13px;">
              <input
                type="file"
                accept=".xml"
                id="fileInput"
                class="filestyle"
                data-button-before="true"
              >
            </div>
            <div class="tool-section">
              <a
                href
                id="link"
                v-on:click="setupDownloadLink(this)"
                download
                class="btn btn-default"
              >MusicXML export</a>
            </div>
          </div>

          <div v-if="tab==='measure'" class="flex" id="measure">
            <div class="tool-section flex-row">
              <label>Measure:</label>
              <button
                class="btn btn-default btn-lg"
                v-on:click="addMeasure();this.drawScore();"
              >+</button>
              <button
                class="btn btn-default btn-lg"
                v-on:click="deleteMeasure();this.drawScore();"
              >-</button>
            </div>
            <div class="tool-section ml-4">
              <label>Clef:</label>
              <select id="clef-dropdown">
                <option>treble</option>
                <option>bass</option>
                <option>alto</option>
                <option>tenor</option>
              </select>
            </div>
            <div class="tool-section ml-4">
              <label>Key Signature:</label>
              <select id="keySig-dropdown" v-model="keySig" v-on:change="addKeySignature(); drawScore()">
                <option>C</option>
                <option>G</option>
                <option>D</option>
                <option>A</option>
                <option>E</option>
                <option>B</option>
                <option>F#</option>
                <option>C#</option>
                <option>F</option>
                <option>Bb</option>
                <option>Eb</option>
                <option>Ab</option>
                <option>Db</option>
                <option>Gb</option>
                <option>Cb</option>
              </select>
            </div>
            <div class="tool-section ml-4">
              <label>Time Signature</label>
              <select id="timeSigTop">
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4" selected>4</option>
                <option value="5">5</option>
                <option value="6">6</option>
              </select>
              <select id="timeSigBottom">
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="4" selected>4</option>
                <option value="8">8</option>
                <option value="16">16</option>
              </select>
              <button class="rounded-lg shadow-xl ml-4 bg-gray-300 p-4 py-1" id="timeSig-button">set</button>
            </div>
          </div>

          <div v-if="tab==='note'" class="flex flex-row" id="note">
            <div class="tool-section flex flex-row px-2">
              <label>Pitch:</label>
              <button
                class="h-8 rounded-lg bg-gray-300 mx-2 px-4"
                v-on:click="editNotePitch(1); drawSelectedMeasure(false);"
              >Up</button>
              <button
                class="h-8 rounded-lg bg-gray-300 mx-2 px-4"
                v-on:click="editNotePitch(-1); drawSelectedMeasure(false);"
              >Down</button>
            </div>

            <div class="tool-section flex">
              <label class="mr-2">Duration:</label>
              
              <label for="note_1" v-on:click="noteValue='w'; editNoteDuration(); drawSelectedMeasure()" class="cursor-pointer">
                <img src="icons/note_1.svg" class="w-4 h-2 mt-2 mr-2" alt="whole note">
              </label>
              
              <label for="note_2" v-on:click="noteValue='h'; editNoteDuration(); drawSelectedMeasure() " class="cursor-pointer">
                <img src="icons/note_2.svg" class="w-4 h-10 -mt-2 mr-2" alt="half note">
              </label>
              
              <label for="note_4" v-on:click="noteValue='q'; editNoteDuration(); drawSelectedMeasure();" class="cursor-pointer">
                <img src="icons/note_4.svg" class="w-4 h-10 -mt-2 mr-2" alt="quarter note">
              </label>
              
              <label for="note_8" v-on:click="noteValue='8' ;editNoteDuration(); drawSelectedMeasure();" class="cursor-pointer">
                <img src="icons/note_8.svg" class="w-4 h-10 -mt-2 mr-2" alt="8th note">
              </label>
              
              <label for="note_16" v-on:click="noteValue='16'; editNoteDuration(); drawSelectedMeasure();" class="cursor-pointer">
                <img src="icons/note_16.svg" class="w-4 h-10 -mt-2 mr-2" alt="16th note">
              </label>
            </div>

            <div class="tool-section flex flex-row ml-4">
              <label>Dot:</label>
              <input
                class="mt-2 mx-2"
                type="checkbox"
                id="dotted-checkbox"
                name="note-dot"
                v-on:click="editNoteDot();drawSelectedMeasure(false);"
              >
            </div>

            <div class="tool-section flex">
              <label class="mr-2">Accidental:</label>
              
              <label for="double-flat" class="cursor-pointer" v-on:click="accidental='bb'; editNoteAccidental(accidental); drawSelectedMeasure();">
                <img src="icons/double-flat.svg" class="w-6 h-10 -mt-2 mr-2" alt="double-flat">
              </label>
              
              <label for="flat" class="cursor-pointer" v-on:click="accidental='b'; editNoteAccidental(accidental); drawSelectedMeasure();">
                <img src="icons/flat.svg" class="w-4 h-10 -mt-2 mr-2" alt="flat">
              </label>
              
              <label for="natural" class="w-4 h-10 mr-2" v-on:click="accidental='n'; editNoteAccidental(accidental); drawSelectedMeasure();">
                <img src="icons/natural.svg" class="w-4 h-8" alt="natural">
              </label>
              
              <label for="sharp" class="w-4 h-10 mr-2" v-on:click="accidental='#'; editNoteAccidental(accidental); drawSelectedMeasure();">
                <img src="icons/sharp.svg" class="w-4 h-10 -mt-2 mr-2" alt="sharp">
              </label>
              
              <label for="double-sharp" class="w-4 h-10 mr-2" v-on:click="accidental='##'; editNoteAccidental(accidental); drawSelectedMeasure();">
                <img src="icons/double-sharp.svg" class="w-4 h-8" alt="double-sharp">
              </label>
            </div>

            <div class="tool-section">
              <button
                class="btn btn-danger"
                v-on:click="deleteNote(); drawSelectedMeasure(false);"
              >
                <span class="glyphicon glyphicon-trash" aria-hidden="true"></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <div class="container-wrapper">
      <div class="container">
        <div class="row">
          <div class="col-xs-12">
            <div id="svg-wrapper">
              <!-- height of 3 stave heights(overriden by javascript anyway) -->
              <!-- use rather div, but before that resolve NaNs in viewbox problem -->
              <!-- <div id="svg-container" width="800" height="420"></div> -->
              <svg id="svg-container" class="w-full h-full" ref="svgcontainer"></svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import Vexflow from "vexflow";
import parserMixin from "./Editor.parser.mixin";
import tableMixin from "./Editor.table.mixin";
import drawMixin from "./Editor.draw.mixin";
import utilsMixin from "./Editor.utils.mixin";
import noteToolMixin from "./Editor.noteTool.mixin";
import addMixin from './Editor.add.mixin';
import eventsMixin from './Editors.events.mixin';
import editMixin from './Editor.edit.mixin';
import VexflowExtensions from './VexflowExtensions'



const scoreJson = {
  "score-partwise": {
    "@version": "3.0",
    "part-list": {
      "score-part": {
        "@id": "P1",
        "part-name": {}
      }
    },
    part: [
      {
        "@id": "P1",
        measure: [
          {
            "@number": 1,
            attributes: {
              divisions: 4,
              key: {
                fifths: 0,
                mode: "major"
              },
              time: {
                beats: 4,
                "beat-type": 4
              },
              clef: {
                sign: "G",
                line: 2
              }
            },
            note: [
              {
                rest: null,
                duration: 16
              }
            ]
          }
        ]
      }
    ]
  }
};

export default {
  name: "SheetEditor",
  mixins: [utilsMixin, noteToolMixin, parserMixin, tableMixin, drawMixin,addMixin, eventsMixin, editMixin],
  props: {},
  data() {
    return {
      Vex: Object,
      scoreJson: Object,
      renderer: Object,
      ctx: Object,
      this: Object,
      mode: String,
      tab: String,
      noteValue: String,
      dotted: Boolean,
      selected: Object,
      measureColor: "lightblue",
      mousePos: Object,
      accidental: String,
      staveWidth: Number,
      staveHeight: Number,
      noteWidth: Number,
      gl_VfStaves: Array, // array with currently rendered vexflow measures(Vex.Flow.Stave)
      gl_StaveAttributes: Array, // array of attributes for each measure
      gl_VfStaveNotes: Array, // array of arrays with notes to corresponding stave in gl_VfStaves
      newLine: Boolean,
            keySig: String,
      timeSigTop: String,
      timeSigBottom:String,
      clef: String,
      timeSig: String
    };
  },
  mounted: function() {
   this.$nextTick()
   .then(()=>this.initEditor())
  },
  methods: {
    initEditor: function(){
    this.Vex = VexflowExtensions(Vexflow);
    this.scoreJson = scoreJson;

    this.keySig="C";
    this.timeSigTop = 4;
    this.timeSigBottom = 4;
    this.clef="treble";



    this.tab = "note";
    this.mode = "measure";
    this.noteValue = "w";
    this.accidental = "bb";
    this.staveWidth = 150;
    this.staveHeight = 140;
    this.noteWidth = 40;
    this.gl_VfStaves = [];
    this.gl_StaveAttributes = [];
    this.gl_VfStaveNotes = [];
    this.dotted = '';
    this.renderer = new Vexflow.Flow.Renderer(
      this.$refs.svgcontainer,
      Vexflow.Flow.Renderer.Backends.SVG
    );
    this.ctx = this.renderer.getContext();

    this.selected = {
      cursorNoteKey: "b/4",
      measure: {
        id: "m0",
        previousId: "m0"
      },
      note: {
        id: "m0n0",
        previousId: "m0n0"
      }
    };

    this.mousePos = {
      current: {
        x: 0,
        y: 0
      },
      previous: {
        x: 0,
        y: 0
      }
    };


    this.parseAll();
    this.switchToNoteMode();
    },

    switchToNoteMode: function() {
      if (this.mode !== "note") {
        this.mode = "note";
        this.$refs.svgcontainer.addEventListener(
          "mousemove",
          this.redrawMeasureWithCursorNote,
          false
        );
        this.drawScore();
      }
    },

    switchToMeasureMode: function() {
      if (this.mode !== "measure") {
        this.mode = "measure";
        this.$refs.svgcontainer.removeEventListener(
          "mousemove",
          this.redrawMeasureWithCursorNote,
          false
        );
        this.drawScore();
      }
    }
  }
};
</script>
