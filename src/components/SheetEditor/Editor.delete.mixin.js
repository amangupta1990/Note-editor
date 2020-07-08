const deleteMixin = {
methods: {
    // removes selected measure
    deleteMeasure: function() {
      // protection from removing last remaining measure
      if(this.scoreJson["score-partwise"].part[0].measure.length <= 1) {
        // TODO error message "Could not remove last remaining measure"
        return;
      }
  
      var measureIndex = this.getSelectedMeasureIndex();
      // to avoid inconsistency between measure and note id
      this.selected.note.id = 'm' + measureIndex + 'n0';
  
      // merge attributes of measure being deleted with next measure attributes
      if(measureIndex !== this.gl_StaveAttributes.length - 1) {
        this.mergePropertiesInPlace(this.gl_StaveAttributes[measureIndex], this.gl_StaveAttributes[measureIndex + 1]);
      }
  
      // remove measure from global arrays
      this.gl_VfStaves.splice(measureIndex, 1);
      this.gl_StaveAttributes.splice(measureIndex, 1);
      this.gl_VfStaveNotes.splice(measureIndex, 1);
  
      // re-number all following notes ids in measures in part
      for(var m = measureIndex; m < this.gl_VfStaveNotes.length; m++) {
        for(var n = 0; n < this.gl_VfStaveNotes[m].length; n++) {
          this.gl_VfStaveNotes[m][n].setAttribute('id',('m' + m + 'n' + n));
        }
      }
  
      // TODO merge attributes in json like above in gl_StaveAttributes
  
      // remove measure from scoreJson
      this.scoreJson["score-partwise"].part[0].measure.splice(measureIndex, 1);
  
      // shift numbering for all following measures in part
      for(let m = measureIndex; m < this.scoreJson["score-partwise"].part[0].measure.length; m++) {
        this.scoreJson["score-partwise"].part[0].measure[m]["@number"] = m;
      }
      // if deleted measure was last, mark current last measure as selected
      if(measureIndex >= this.scoreJson["score-partwise"].part[0].measure.length - 1) {
        this.selected.measure.id = 'm'+(this.scoreJson["score-partwise"].part[0].measure.length - 1);
        // mark first note in that measure as selected
        this.selected.note.id = this.selected.measure.id + 'n0';
      }
    },
    // deletes note by replacing it with a rest of the same duration
    deleteNote: function(){
      // get and parse id of selected note (id='m13n10')
      var measureIndex = this.getSelectedMeasureIndex();
      var noteIndex = this.getSelectedNoteIndex();
      var vfStaveNote = this.gl_VfStaveNotes[measureIndex][noteIndex];
      // if note is already a rest, do nothing
      if(vfStaveNote.isRest())
        return;
      // get notes duration properties
      var duration = vfStaveNote.getDuration();
      // create new Vex.Flow.StaveNote for rest
      var vfRest = new this.Vex.Flow.StaveNote({
        keys: [ this.table.DEFAULT_REST_PITCH ],
        duration: duration + 'r'   // TODO add dots before 'r': /d*/
      });
      // set id for note DOM element in svg
      vfRest.setAttribute('id',(this.selected.note.id));
      // set dots for a rest, however, currently supports only one dot(see parse.js line 140)
      if(vfStaveNote.isDotted()) {
        var dots = vfStaveNote.getDots().length;
        for(var i = 0; i < dots; i++)
          vfRest.addDotToAll();
      }
      // replace deleted note with a rest
      this.gl_VfStaveNotes[measureIndex].splice(noteIndex, 1, vfRest);
      // delete pitch property from json
      delete this.scoreJson["score-partwise"].part[0].measure[measureIndex].note[noteIndex].pitch;
      // delete accidental if any
      delete this.scoreJson["score-partwise"].part[0].measure[measureIndex].note[noteIndex].accidental;
      // create empty rest property
      this.scoreJson["score-partwise"].part[0].measure[measureIndex].note[noteIndex]['rest'] = null;
      // I assume, that property order does not matter
      // also, currently I don't delete some non-rest elements, like stem, lyric, notations (e.g.slur)
      // uncheck checked accidental radio button
      this.accidental = false;
    },
    deleteAccidental: function(){
      var measureIndex = this.getSelectedMeasureIndex();
      var noteIndex = this.getSelectedNoteIndex();
      var vfStaveNote = this.gl_VfStaveNotes[measureIndex][noteIndex];
  
      vfStaveNote.removeAccidental();
  
      delete this.scoreJson["score-partwise"].part[0].measure[measureIndex].note[noteIndex].accidental;
    }
  }
}

export default deleteMixin;