/*
module for note/measure addition...
*/
const AddMixin = {
methods: {
    // inserts new measure filled with whole rest AFTER selected measure
    addMeasure: function(){
      // get and parse id of selected measure (id='m13')
      var measureIndex = +this.selected.measure.id.split('m')[1];
  
      // create new Vex.Flow.Stave, positions will be set in draw function
      var vfNewStave = new this.Vex.Flow.Stave(0, 0, this.staveWidth);
      // add measure to global array of Vex.Flow Staves
      // splice adds before, but we need to insert after - reason for measureIndex + 1
      // splice also takes higher index than biggest as biggest
      this.gl_VfStaves.splice(measureIndex + 1, 0, vfNewStave);
      // add empty attributes for measure
      this.gl_StaveAttributes.splice(measureIndex + 1, 0, {});
      // fill measure with whole rest
      var wholeRest = new this.Vex.Flow.StaveNote({ keys: ["b/4"], duration: "wr" , id:'m' + measureIndex + 'n0' });
      this.gl_VfStaveNotes.splice(measureIndex + 1, 0, [wholeRest]);
  
      // re-number all following notes ids in measures in part
      for(var m = measureIndex + 1; m < this.gl_VfStaveNotes.length; m++) {
        for(var n = 0; n < this.gl_VfStaveNotes[m].length; n++) {
          this.gl_VfStaveNotes[m][n].attrs.id = ('m' + m + 'n' + n);
        }
      }
  
      // add new measure to scoreJson
      var newMeasure = {
        '@number': measureIndex + 2,
        note: [
          {
            '@measure' : 'yes',
            rest: null,
            duration: 16  // TODO get duration from divisions in current attributes
          }
        ]
      };
      // insert new measure to json
      this.scoreJson["score-partwise"].part[0].measure.splice(measureIndex + 1, 0, newMeasure);
      
      // shift numbering for all following measures in part
      for(let m = measureIndex + 1; m < this.scoreJson["score-partwise"].part[0].measure.length; m++) {
        this.scoreJson["score-partwise"].part[0].measure[m]["@number"] = m + 1;
      }
    },
    addNote: function(){
      // get and parse id of selected note (id='m13n10')
      var measureIndex = this.getSelectedMeasureIndex();
      var noteIndex = this.getSelectedNoteIndex();
      //eslint-disable-next-line
      var vfStaveNote = this.gl_VfStaveNotes[measureIndex][noteIndex];
  
      var noteValue = this.noteValue;
      // var noteValue = vfStaveNote.getDuration();     //w, h, q, 8, 16
      var dot = this.dotted ? 'd' : '';
      // var dot = vfStaveNote.isDotted() ? 'd' : '';
  
      // create new Vex.Flow.StaveNote
      var newNote = new this.Vex.Flow.StaveNote({
        keys: [ this.selected.cursorNoteKey ],
        duration: noteValue + dot,
        auto_stem: true,
        id:this.selected.note.id
      });
      // set id for note DOM element in svg
     
  
      if(dot === 'd')
        newNote.addDotToAll();
  
      // put new note in place of selected rest
      this.gl_VfStaveNotes[measureIndex].splice(noteIndex, 1, newNote);
  
      // put new note into scoreJson also
      delete this.scoreJson["score-partwise"].part[0].measure[measureIndex].note[noteIndex].rest;
      delete this.scoreJson["score-partwise"].part[0].measure[measureIndex].note[noteIndex]['@measure'];
  
      this.scoreJson["score-partwise"].part[0].measure[measureIndex].note[noteIndex].pitch = {};
      this.scoreJson["score-partwise"].part[0].measure[measureIndex].note[noteIndex].pitch
        .step = this.selected.cursorNoteKey[0].toUpperCase();
      this.scoreJson["score-partwise"].part[0].measure[measureIndex].note[noteIndex].pitch
        .octave = this.selected.cursorNoteKey[this.selected.cursorNoteKey.length - 1];
  
      this.divisions = this.getCurAttrForMeasure(measureIndex, 'xmlDivisions');
      var xmlDuration = this.getDurationFromStaveNote(newNote, this.divisions);
      this.scoreJson["score-partwise"].part[0].measure[measureIndex].note[noteIndex].duration = xmlDuration;
  
      this.$refs.svgcontainer.removeEventListener('click', this.addNote, false); 
      this.drawSelectedMeasure(false);
  
      // fluent creating of score:
      // add new measure, if current one is the last one and the note is also the last one
      if(measureIndex === this.gl_VfStaves.length - 1 &&
         noteIndex === this.gl_VfStaveNotes[measureIndex].length - 1) {
        this.addMeasure();
        // select first note in added measure
        measureIndex++;
        this.selected.measure.id = 'm' + measureIndex;
        this.selected.note.id = 'm' + measureIndex + 'n0';
        this.drawScore();
      }
  
    },
    addClef: function(){
      var clefDropdown = this.clef
      // console.log('add clef: '+clefDropdown);
      var measureIndex = this.getSelectedMeasureIndex();
      //eslint-disable-next-line
      var noteIndex = this.getSelectedNoteIndex();
      var vfStave = this.gl_VfStaves[measureIndex];
  
      var currentClef = this.getCurAttrForMeasure(measureIndex, 'vfClef');
  
      // change clef only if new is different from current
      if(currentClef !== clefDropdown) {
        vfStave.setClef(clefDropdown);
        this.gl_StaveAttributes[measureIndex].vfClef = clefDropdown;
        var xmlClef = this.CLEF_VEX_TYPE_DICT[clefDropdown];
        this.gl_StaveAttributes[measureIndex].xmlClef = xmlClef;
        // put clef into measure attributes in json
        var xmlAttr = this.scoreJson["score-partwise"].part[0].measure[measureIndex].attributes || {};
        xmlAttr.clef = {};
        xmlAttr.clef.sign = xmlClef.split('/')[0];
        xmlAttr.clef.line = xmlClef.split('/')[1];
        this.scoreJson["score-partwise"].part[0].measure[measureIndex].attributes = xmlAttr;
      }
  
      // remove changed clef, if it is the same like previous
      if(measureIndex > 0) {
        var previousClef = this.getCurAttrForMeasure(measureIndex - 1, 'vfClef');
        if(clefDropdown === previousClef) {
          vfStave.clef = null;
          delete this.gl_StaveAttributes[measureIndex].vfClef;
          delete this.gl_StaveAttributes[measureIndex].xmlClef;
          if(this.scoreJson["score-partwise"].part[0].measure[measureIndex].attributes)
            delete this.scoreJson["score-partwise"].part[0].measure[measureIndex].attributes.clef;
        }
      }
    },
    addKeySignature: function(){ 
      var keySig = this.keySig;
  
      var measureIndex = this.getSelectedMeasureIndex();
      var vfStave = this.gl_VfStaves[measureIndex];
  
      var currentKeysig = this.getCurAttrForMeasure(measureIndex, 'vfKeySpec');
  
      if(keySig !== currentKeysig) {
        vfStave.setKeySignature(keySig);
  
        this.gl_StaveAttributes[measureIndex].vfKeySpec = keySig;
        var fifths = 0;
        fifths = this.SHARP_MAJOR_KEY_SIGNATURES.indexOf(keySig) + 1;
        if(!fifths)
          fifths = -(this.FLAT_MAJOR_KEY_SIGNATURES.indexOf(keySig) + 1);
        this.gl_StaveAttributes[measureIndex].xmlFifths = fifths;
  
        var xmlAttr = this.scoreJson["score-partwise"].part[0].measure[measureIndex].attributes || {};
        xmlAttr.key = {};
        xmlAttr.key.fifths = fifths;
        // mode is not mandatory (e.g. major, minor, dorian...)
  
        this.scoreJson["score-partwise"].part[0].measure[measureIndex].attributes = xmlAttr;
      }
  
      if(measureIndex > 0) {
        var previousKeysig = this.getCurAttrForMeasure(measureIndex - 1, 'vfKeySpec');
        if(keySig === previousKeysig) {
          vfStave.keySignature=null;
          delete this.gl_StaveAttributes[measureIndex].vfKeySpec;
          delete this.gl_StaveAttributes[measureIndex].xmlFifths;
          if(this.scoreJson["score-partwise"].part[0].measure[measureIndex].attributes)
            delete this.scoreJson["score-partwise"].part[0].measure[measureIndex].attributes.key;
        }
      }
    },
    addTimeSignature: function(){
      var top = this.timeSigTop
      var bottom = this.timeSigBottom
      var timeSig = top + '/' + bottom;
  
      var currentTimesig = this.getCurAttrForMeasure(measureIndex, 'vfTimeSpec');
  
      if(timeSig !== currentTimesig) {
        var measureIndex = this.getSelectedMeasureIndex();
        var vfStave = this.gl_VfStaves[measureIndex];
  
        vfStave.setTimeSignature(timeSig);
        this.gl_StaveAttributes[measureIndex].vfTimeSpec = timeSig;
  
        var xmlAttr = this.scoreJson["score-partwise"].part[0].measure[measureIndex].attributes || {};
        xmlAttr.time = {};
        xmlAttr.time.beats = top;
        xmlAttr.time['beat-type'] = bottom;
  
        this.scoreJson["score-partwise"].part[0].measure[measureIndex].attributes = xmlAttr;
      }
  
      if(measureIndex > 0) {
        var previousTimesig = this.getCurAttrForMeasure(measureIndex - 1, 'vfTimeSpec');
        if(timeSig === previousTimesig) {
          vfStave.removeTimeSignature();
          delete this.gl_StaveAttributes[measureIndex].vfTimeSpec;
          if(this.scoreJson["score-partwise"].part[0].measure[measureIndex].attributes)
            delete this.scoreJson["score-partwise"].part[0].measure[measureIndex].attributes.time;
        }
      }
    },
    addAccidental: function(){
      var vexAcc = this.accidental;
  
      var vfStaveNote = this.getSelectedNote();
  
      if(!vfStaveNote.isRest()) {
        // TODO change to setAccidental()
        vfStaveNote.addAccidental(0, new this.Vex.Flow.Accidental(vexAcc));
        // no support for chords currently
  
        // add accidental to json
        var xmlAcc = '';
        for(var xmlname in this.ACCIDENTAL_DICT)
          if(vexAcc === this.ACCIDENTAL_DICT[xmlname])
            xmlAcc = xmlname;
        this.scoreJson["score-partwise"].part[0].measure[this.measureIndex].note[this.noteIndex].accidental = xmlAcc;
      }
    }
  }
}

export default AddMixin;