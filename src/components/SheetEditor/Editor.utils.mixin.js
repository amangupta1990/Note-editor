const utilsMixin = {
  data: function() {
    return {
      keySig: String,
      timeSigTop: String,
      clef: String,
      timeSig: String
    };
  },
  methods: {
    // draws note, which is to be added, below mouse cursor when it is
    // moving in column of selected note(only rest currenly)
    redrawMeasureWithCursorNote: function(event) {
      // get mouse position
      this.mousePos.current = this.getMousePos(this.$refs.svgcontainer, event);
      debugger;
      // get selected measure and note
      var vfStaveNote = this.getSelectedNote();
      var vfStave = this.getSelectedMeasure();

      // currently support only for replacing rest with a new note
      // building chords feature will be added soon
      if (!vfStaveNote.isRest()) return;

      // get column of selected note on stave
      var bb = vfStave.getBoundingBox();
      var begin = vfStaveNote.getNoteHeadBeginX() - 5;
      bb.setX(begin);
      bb.setW(vfStaveNote.getNoteHeadEndX() - begin + 5);
      // bb.setW(20);
      // bb.draw(this.ctx);

      // mouse cursor is within note column
      if (this.isCursorInBoundingBox(bb, this.mousePos.current)) {
        // save mouse position
        this.mousePos.previous = this.mousePos.current;
        // get new note below mouse cursor
        this.selected.cursorNoteKey = this.getCursorNoteKey();

        this.svgElem.addEventListener("click", this.add.note, false);

        // redraw only when cursor note changed pitch
        // (mouse changed y position between staff lines/spaces)
        if (this.lastCursorNote !== this.selected.cursorNoteKey) {
          // console.log(this.selected.cursorNoteKey);
          this.draw.selectedMeasure(true);
        }
        // save previous cursor note for latter comparison
        this.lastCursorNote = this.selected.cursorNoteKey;
      }
      // mouse cursor is NOT within note column
      else {
        this.svgElem.removeEventListener("click", this.add.note, false);

        // mouse cursor just left note column(previous position was inside n.c.)
        if (this.isCursorInBoundingBox(bb, this.mousePos.previous)) {
          // redraw measure to erase cursor note
          this.draw.selectedMeasure(false);
          this.mousePos.previous = this.mousePos.current;
          this.lastCursorNote = "";
        }
      }
    },

    getMousePos: function(canvas, evt) {
      var rect = canvas.getBoundingClientRect();
      return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
      };
    },

    getRadioValue: function(name) {
      var radios = document.getElementsByName(name);
      for (var i = 0; i < radios.length; i++)
        if (radios[i].checked) return radios[i].value;
    },

    /*
TODO: documentary comment...
*/
    // TODO rewrite with use of vfStave.getLineForY(this.mousePos.current.y)
    getCursorNoteKey: function() {
      // find the mouse position and return the correct note for that position.
      var y = this.gl_VfStaves[this.selected.measure.id.split("m")[1]].y;
      // var y = this.selected.measure.y;
      var notesArray = ["c/", "d/", "e/", "f/", "g/", "a/", "b/"];
      var count = 0;

      for (var i = 5; i >= 0; i--) {
        for (var l = 0; l < notesArray.length; l++) {
          var noteOffset = count * 35 - (l * 5 - 17);
          if (
            this.mousePos.current.y >= y + noteOffset &&
            this.mousePos.current.y <= 5 + y + noteOffset
          ) {
            var cursorNoteKey = notesArray[l] + (i + 1);
            var found = true;
            break;
          }
          if (found === true) {
            break;
          }
        }
        count++;
      }
      return cursorNoteKey;
    },

    getSelectedNoteIndex: function() {
      var mnId = this.selected.note.id;
      return +mnId.split("n")[1];
    },

    getSelectedMeasureIndex: function() {
      var mnId = this.selected.note.id;
      return +mnId.split("n")[0].split("m")[1];
    },

    getSelectedNote: function() {
      var mnId = this.selected.note.id;
      var measureIndex = mnId.split("n")[0].split("m")[1];
      var noteIndex = mnId.split("n")[1];
      return this.gl_VfStaveNotes[measureIndex][noteIndex];
    },

    getSelectedMeasure: function() {
      var mnId = this.selected.note.id;
      var measureIndex = mnId.split("n")[0].split("m")[1];
      return this.gl_VfStaves[measureIndex];
    },

    // get current attribute for measure
    getCurAttrForMeasure: function(measureIndex, attrname) {
      for (var i = measureIndex; i >= 0; i--)
        if (this.gl_StaveAttributes[i][attrname])
          return this.gl_StaveAttributes[i][attrname];
    },

    // highlights properties of selected note on control panel
    highlightSelectedNoteProperties: function() {
      var vfStaveNote = this.getSelectedNote();
      if (vfStaveNote.getAccidentals())
        var accOfSelNote = vfStaveNote.getAccidentals()[0].type;
      // uncheck already checked radio button
      this.accidental = false;
      // set radio button for accidental of selected note
      if (accOfSelNote) this.accidental = true;
      // set radio button for duration of selected note
      var durOfSelNote = vfStaveNote.getDuration();
      this.noteValue = durOfSelNote;
      // set dotted checkbox
      this.dotted = vfStaveNote.isDotted();
    },

    // highlights properties of selected measure on control panel
    highlightSelectedMeasureProperties: function() {
      // in this function are set options for select boxes,
      // but selectBoxIt's setOption() triggers change event, which is not desired (jQuery's val() does not)
      // this is temporary ugly hack with global variable,
      // and should be replaced with better mechanism
      this.gl_selectBoxChangeOnMeasureSelect = true;

      var measureIndex = this.getSelectedMeasureIndex();
      var clef = this.gl_StaveAttributes[measureIndex].vfClef;
      if (!clef) clef = this.getCurAttrForMeasure(measureIndex, "vfClef");
      if (clef) this.clef = clef;
      // if(clef) $('#clef-dropdown').val(clef);
      var keySig = this.gl_StaveAttributes[measureIndex].vfKeySpec;
      if (!keySig)
        keySig = this.getCurAttrForMeasure(measureIndex, "vfKeySpec");
      if (keySig) this.keySig = keySig;
      // if(keySig) $('#keySig-dropdown').val(keySig);
      var timeSig = this.gl_StaveAttributes[measureIndex].vfTimeSpec;
      if (!timeSig)
        timeSig = this.getCurAttrForMeasure(measureIndex, "vfTimeSpec");
      if (timeSig) {
        this.timeSigTop.selectOption(timeSig.split("/")[0]);
        this.timeSigBottom.selectOption(timeSig.split("/")[1]);
        // $('#timeSigTop').val(timeSig.split('/')[0]);
        // $('#timeSigBottom').val(timeSig.split('/')[1]);
      }

      this.gl_selectBoxChangeOnMeasureSelect = false;
    },

    isCursorInBoundingBox: function(bBox, cursorPos) {
      return (
        cursorPos.x > bBox.getX() &&
        cursorPos.x < bBox.getX() + bBox.getW() &&
        cursorPos.y > bBox.getY() &&
        cursorPos.y < bBox.getY() + bBox.getH()
      );
    },

    /**
     * @param obj1 The first object
     * @param obj2 The second object
     * @returns A new object representing the merged objects. If both objects passed as param have the same prop, then obj2 property is returned.
     */
    // author Andre Bakker, VexUI: https://github.com/andrebakker/VexUI
    mergeProperties: function(obj1, obj2) {
      var merged = {};
      for (let attrname in obj1) {
        merged[attrname] = obj1[attrname];
      }
      for (let attrname in obj2) {
        merged[attrname] = obj2[attrname];
      }
      return merged;
    },

    // Merge `destination` hash with `source` hash, overwriting like keys
    // in `source` if necessary.
    mergePropertiesInPlace: function(source, destination) {
      for (var property in source) destination[property] = source[property];
    }
  }
};

export default utilsMixin;
