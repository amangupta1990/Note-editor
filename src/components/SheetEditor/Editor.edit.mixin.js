 
const editMixin= {
methods: {
    // changes selected notes pitch
    editNotePitch: function(interval){
      // get and parse id of selected note (id='m13n10')
      var measureIndex = this.getSelectedMeasureIndex();
      var noteIndex = this.getSelectedNoteIndex();
      var vfStaveNote = this.gl_VfStaveNotes[measureIndex][noteIndex];
      // if note is rest, do nothing
      if(vfStaveNote.isRest())
        return;
      // get notes duration
      var duration = vfStaveNote.getDuration();
      // get notes pitch; currently no chord support
      var key = vfStaveNote.getKeys()[0];   // e.g. 'g##/4'
      // transpose note
      var newKey = this.transposeNote(key, interval);
      // get current clef
      var currentClef = this.getCurAttrForMeasure(measureIndex, 'vfClef');
      // create new Vex.Flow.StaveNote
      var newNote = new this.Vex.Flow.StaveNote({
        keys: [ newKey ],
        duration: duration,   // TODO add dots: /d*/
        clef: currentClef,
        auto_stem: true
      });
      // set id for note DOM element in svg
      newNote.setAttribute("id",'m' + measureIndex + 'n'+noteIndex )
      // set dots for a rest, however, currently supports only one dot(see parse.js line 140)
      if(vfStaveNote.isDotted()) {
        var dots = vfStaveNote.getDots().length;
        for(var i = 0; i < dots; i++)
          newNote.addDotToAll();
      }
      // replace old note with a transposed one
      this.gl_VfStaveNotes[measureIndex].splice(noteIndex, 1, newNote);
      // change pitch property in json
      this.scoreJson["score-partwise"].part[0].measure[measureIndex].note[noteIndex].pitch
        .step = newKey[0].toUpperCase();
      this.scoreJson["score-partwise"].part[0].measure[measureIndex].note[noteIndex].pitch
        .octave = newKey[newKey.length - 1];
      // delete accidental if any
      delete this.scoreJson["score-partwise"].part[0].measure[measureIndex].note[noteIndex].accidental;
      // uncheck checked accidental radio button
      this.accidental= '';
    },
  
    // TODO change duration in json also
    editNoteDuration: function() {
      var measureIndex = this.getSelectedMeasureIndex();
      var noteIndex = this.getSelectedNoteIndex();
      var vfStaveNote = this.gl_VfStaveNotes[measureIndex][noteIndex];
  
      var noteDuration = this.noteValue;
  
      // get notes pitch; currently no chord support
      var key = vfStaveNote.getKeys()[0];   // e.g. 'g##/4'
      var rest = vfStaveNote.isRest() ? 'r' : '';
  
      if(vfStaveNote.getAccidentals())
        var accOfSelNote = vfStaveNote.getAccidentals()[0].type;
  
      // get current clef
      var currentClef = this.getCurAttrForMeasure(measureIndex, 'vfClef');
  
      // create new Vex.Flow.StaveNote
      var newNote = new this.Vex.Flow.StaveNote({
        keys: [ key ],
        duration: noteDuration + rest,   // TODO add dots: /d*/
        clef: currentClef,
        auto_stem: true
      });
  
      if(accOfSelNote)
        newNote.addAccidental(0, new this.Vex.Flow.Accidental(accOfSelNote));
  
      // set id for note DOM element in svg
      newNote.setId(this.selected.note.id);
      // set dots for a rest, however, currently supports only one dot(see parse.js line 140)
      if(vfStaveNote.isDotted()) {
        var dots = vfStaveNote.getDots().length;
        for(var i = 0; i < dots; i++)
          newNote.addDotToAll();
      }
      // replace old note with a transposed one
      this.gl_VfStaveNotes[measureIndex].splice(noteIndex, 1, newNote);
  
      // change duration in json
      // get divisions
      var divisions = 0;
      // finds attributes of closest previous measure or current measure
      divisions = this.getCurAttrForMeasure(measureIndex, 'xmlDivisions');
      // for(var a = 0; a <= measureIndex; a++)
      //   if(! $.isEmptyObject(gl_StaveAttributes[a]) && gl_StaveAttributes[a].xmlDivisions)
      //     divisions = gl_StaveAttributes[a].xmlDivisions;
  
      if(!divisions)
      //eslint-disable-next-line
        console.error('divisions for measures 1 to '+(measureIndex+1)+' are not set');
  
      var xmlDuration = this.getDurationFromStaveNote(newNote, divisions);
      this.scoreJson["score-partwise"].part[0].measure[measureIndex].note[noteIndex].duration = xmlDuration;
  
    },
  
    editNoteDot: function() {
      var measureIndex = this.getSelectedMeasureIndex();
      var noteIndex = this.getSelectedNoteIndex();
      var vfStaveNote = this.gl_VfStaveNotes[measureIndex][noteIndex];
  
      if(vfStaveNote.isDotted()) {
        vfStaveNote.removeDot();
        delete this.scoreJson["score-partwise"].part[0].measure[measureIndex].note[noteIndex].dot;
      }
      else {
        vfStaveNote.setDot();
        this.scoreJson["score-partwise"].part[0].measure[measureIndex].note[noteIndex].dot = null;
      }
    },
  
    editNoteAccidental: function(vexAcc) {
      var measureIndex = this.getSelectedMeasureIndex();
      var noteIndex = this.getSelectedNoteIndex();
      var vfStaveNote = this.gl_VfStaveNotes[measureIndex][noteIndex];
  
      vfStaveNote.setAccidental(0, new this.Vex.Flow.Accidental(vexAcc));
  
      // add accidental to json
      var xmlAcc = '';
      for(var xmlname in this.ACCIDENTAL_DICT)
        if(vexAcc === this.ACCIDENTAL_DICT[xmlname])
          xmlAcc = xmlname;
      this.scoreJson["score-partwise"].part[0].measure[measureIndex].note[noteIndex].accidental = xmlAcc;
    }
  
  }
}

export default editMixin