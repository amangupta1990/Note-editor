import __ from "underscore"
const editor = {};
editor.draw = {
  // clears svg and draws all measures (whole score) again
  drawScore: function() {

    var canvasWidth = this.$refs.svgcontainer.clientWidth;
    //var canvasHeight = document.getElementById('svg-wrapper').clientHeight;
    this.$refs.svgcontainer.style.width = canvasWidth;

    // to avoid NaNs in svg viewbox:
    // https://groups.google.com/forum/?fromgroups=#!topic/vexflow/RWtqOhQoXMI
    // this.ctx.svg.setAttribute("preserveAspectRatio", "xMinYMin meet");
    // this.ctx.scale(1, 1);

    // or resize ctx here and also on lines 43 - 49
    // this.ctx.resize(canvasWidth, canvasHeight);

    // or this:
    // this.ctx.width = this.ctx.svg.clientWidth;
    // this.ctx.height = this.ctx.svg.clientHeight;
    // this.ctx.width = canvasWidth;
    // this.ctx.height = canvasHeight;

    // or this:
    // this.ctx.svg.style.width = "100%";
    // this.ctx.svg.style.height = "100%";

    this.ctx.clear();
    // this.ctx.svg.setAttribute("preserveAspectRatio", "xMinYMin meet");

    // no cursor note will be displayed
    this.selected.cursorNoteKey = null;

    // var minWidth = noteWidth * maxLength;
    // var minWidth = this.noteWidth * 4;

    var attributes = {};
    // var count = 0;
    var staveX = 10,
      staveY = 0;

    // loop over all measures
    for (
      var staveIndex = 0;
      staveIndex < this.gl_VfStaves.length;
      staveIndex++
    ) {
      var stave = this.gl_VfStaves[staveIndex];

      var staveWidth = stave.getWidth();

      // add changes in attributes for current measure to attributes object
      attributes = this.mergeProperties(
        attributes,
        this.gl_StaveAttributes[staveIndex]
      );

      // calculate newline
      var staveEnd = staveX + staveWidth;
      if (staveEnd > canvasWidth) {
        staveX = 10;
        staveY = staveY + this.staveHeight;
        this.newLine = true;
        // gl_StaveAttributes[staveIndex].isFirstOnLine = true;
      } else {
        this.newLine = false;
        // gl_StaveAttributes[staveIndex].isFirstOnLine = false;
      }

      // gradually extend height of canvas
      // if((staveY + this.staveHeight) > $('#svg-container').attr('height'))
      //   $('#svg-container').attr('height', staveY + this.staveHeight);

      // if one measure is wider than canvas(e.g. in Chant.xml), extend canvas
      if (staveWidth > this.$refs.svgcontainer.clientWidth) {
        this.$refs.svgcontainer.style.width = staveWidth;
        // this.ctx.width = staveWidth;
        // this.ctx.resize(staveWidth, canvasHeight);
      }

      // set height of canvas after last rendered measure
      if (staveIndex === this.gl_VfStaves.length - 1) {
        this.$refs.svgcontainer.style.height = staveY + this.staveHeight;
        // this.ctx.height = staveY + this.staveHeight;
        // this.ctx.resize(canvasWidth, staveY + this.staveHeight);
      }

      // set position and width of stave
      stave.setX(staveX);
      stave.setY(staveY);
      // if measure doesn't have its own width(set as attribute in xml)
      // if(stave.getWidth() == this.staveWidth)
      //   stave.setWidth(staveWidth);
      // else
      // staveWidth = stave.getWidth();

      // set rendering context for stave
      stave.setContext(this.ctx);

      // clef and key signature must be rendered on every first measure on new line
      if (this.newLine === true && staveIndex === 0) {
        stave.setClef(attributes.vfClef);
        stave.setKeySignature(attributes.vfKeySpec);
        if (!this.newLine && attributes.vfTimeSpec)
          stave.setTimeSignature(attributes.vfTimeSpec);
        // number of accidentals in key signature
        var numOfAcc =
          this.SHARP_MAJOR_KEY_SIGNATURES.indexOf(attributes.vfKeySpec) +
          1;
        if (!numOfAcc)
          numOfAcc =
            this.FLAT_MAJOR_KEY_SIGNATURES.indexOf(attributes.vfKeySpec) +
            1;

        // TODO extend width of measure with clef | keysig | timesig
        // stave.setWidth(stave.getWidth() + 80 + numOfAcc * 20);
        // not good solution, it would grow after each draw call
      }
      // remove clef and key signature when not newline
      else {
        // vexflow extension
        stave.clef=null;
        stave.keySignature=null;
      }

      this.drawMeasure(staveIndex, false);

      // set start x position for next measure
      staveX = staveX + staveWidth;
    } // loop over measures

    // highlight selected note
    if (this.mode === "note"){    
        let note = this.$refs.svgcontainer.querySelector("#vf-" + this.selected.note.id);
        this.colourNote(note,"red");
    }
  },

  // removes particular measure(stave) from svg and draws it again
  drawMeasure: function(drawnMeasureIndex, cursorNoteEnabled) {
    // $('#vf-mg'+drawnMeasureIndex).empty();

    try{
    this.$refs.svgcontainer.querySelector("#vf-m" + drawnMeasureIndex).remove();
    }
    catch(e){
      //eslint-disable-next-line
      console.log("no measure")
    }

    var stave = this.gl_VfStaves[drawnMeasureIndex];

    // set stave properties
    var clef = this.gl_StaveAttributes[drawnMeasureIndex].vfClef;
    if (clef) stave.setClef(clef);
    var keySig = this.gl_StaveAttributes[drawnMeasureIndex].vfKeySpec;
    if (keySig) stave.setKeySignature(keySig);
    var timeSig = this.gl_StaveAttributes[drawnMeasureIndex].vfTimeSpec;
    if (timeSig) stave.setTimeSignature(timeSig);

    // svg stave(=measure) group
    this.ctx.openGroup("stave", "m" + drawnMeasureIndex, { pointerBBox: true });
    // draw stave
    stave.draw();

    // create svg <rect> element exactly overlapping stave for stave selection and highlight
    this.ctx.rect(stave.getX(), stave.y, stave.getWidth(), this.staveHeight, {
      class: "measureRect",
      id: "m" + drawnMeasureIndex,
      fill: "transparent"
    });

    // find time signature in Attributes for current Measure
    var beats = 4,
      beat_type = 4;
    for (var a = drawnMeasureIndex; a >= 0; a--) {
      // finds attributes of closest previous measure or current measure
      if (
        !__.isEmpty(this.gl_StaveAttributes[a]) &&
        this.gl_StaveAttributes[a].vfTimeSpec
      ) {
        var timeSplitted = this.gl_StaveAttributes[a].vfTimeSpec.split("/");
        beats = timeSplitted[0];
        beat_type = timeSplitted[1];
        break;
      }
    }

    var voice = new this.Vex.Flow.Voice({
      num_beats: beats,
      beat_value: beat_type,
      resolution: this.Vex.Flow.RESOLUTION
    });

    voice.setStrict(false); //TODO: let it be strict for check notes duration in measure

    voice.addTickables(this.gl_VfStaveNotes[drawnMeasureIndex]);

    //https://github.com/0xfe/vexflow/wiki/Automatic-Beaming:
    var beams =  this.Vex.Flow.Beam.generateBeams(
      this.gl_VfStaveNotes[drawnMeasureIndex],
      {
        groups: [new this.Vex.Flow.Fraction(beats, beat_type)]
      }
    );

    var selMeasureIndex = this.getSelectedMeasureIndex();
    var selNoteIndex = this.getSelectedNoteIndex();
    var selVFStaveNote = this.gl_VfStaveNotes[selMeasureIndex][selNoteIndex];

    // draw the cursor note, if drawing selected measure and cursor note is enabled
    if (
      this.mode === "note" &&
      +selMeasureIndex === drawnMeasureIndex &&
      cursorNoteEnabled
    ) {
      var noteValue = this.noteValue;
      var dot = this.dotted ? "d" : "";
      // get note properties
      // var noteValue = selVFStaveNote.getDuration();     //w, h, q, 8, 16
      // var dot = selVFStaveNote.isDotted() ? 'd' : '';

      // create cursor note
      var cursorNote = new this.Vex.Flow.StaveNote({
        keys: [this.selected.cursorNoteKey],
        duration: noteValue + dot,
        auto_stem: true
      });
      // console.log(cursorNote);
      if (dot === "d") cursorNote.addDotToAll();

      cursorNote.setStave(stave);

      // create separate voice for cursor note
      var cursorNoteVoice = new this.Vex.Flow.Voice({
        num_beats: beats,
        beat_value: beat_type,
        resolution: this.Vex.Flow.RESOLUTION
      });
      cursorNoteVoice.setStrict(false);
      cursorNoteVoice.addTickables([cursorNote]);

      new this.Vex.Flow.Formatter()
        .joinVoices([voice, cursorNoteVoice])
        .format([voice, cursorNoteVoice], stave.getWidth() * 0.8);

      // cursor note is only note in its voice, so it is on place of the very first note
      // we need to shift it to selected note x position
      var xShift = selVFStaveNote.getX();
      // shift back by width of accidentals on left side of first note in measure
      xShift -= this.gl_VfStaveNotes[drawnMeasureIndex][0].getMetrics()
        .modLeftPx;
      cursorNote.setXShift(xShift);

      cursorNoteVoice.draw(this.ctx, stave);
    }
    // measure mode, no cursor note
    else {
      // format and justify the notes to 80% of staveWidth
      new this.Vex.Flow.Formatter()
        .joinVoices([voice])
        .format([voice], stave.getWidth() * 0.8);
      // also exists method formatToStave()...
      // but it is rather helper function I guess, like FormatAndDraw() in Voice
    }

    // draw normal voice always
    voice.draw(this.ctx, stave);

    beams.forEach(function(beam) {
      beam.setContext(this.ctx).draw();
    });

    // mouse events listeners on <rect> for selecting measures
    if (this.mode === "measure") {
      this.$refs
        .svgcontainer.querySelectorAll(".measureRect#m" + drawnMeasureIndex)
        .forEach((ele)=> {
          this.attachListenersToMeasureRect(ele);
        });
      // highlight selected measure
      if (drawnMeasureIndex === selMeasureIndex)
        this.$refs.svgcontainer.querySelector(
          ".measureRect#m" + selMeasureIndex
        ).style = ` fill : ${this.measureColor}; opacity: 0.4`;
    }

    // if last note is behind width of stave, extend stave
    // var lastNoteX = gl_VfStaveNotes[m][gl_VfStaveNotes[m].length - 1].getNoteHeadEndX();
    // if((lastNoteX - stave.getX()) > staveWidth) {
    //   console.log('stave['+m+'] extended, lastNoteX: '+lastNoteX+'staveWidth: '+staveWidth);
    //   stave.setWidth(lastNoteX + 10);
    //   stave.draw();
    // }
    // TODO rather create function calculateStaveWidth(stave())

    // svg measure group
    this.ctx.closeGroup();

    // // adding event listeners to note objects
    this.gl_VfStaveNotes.map(collection=>  collection.map((note)=>{

      var item = this.$refs.svgcontainer.querySelector(`#vf-${note.attrs.id}`) ||  this.$refs.svgcontainer.querySelector(`#vf-auto1010`)      //this.gl_VfStaveNotes[drawnMeasureIndex][n].getElem();
      //eslint-disable-next-line
      console.log('note listeners->',item)
      this.attachListenersToNote(item);
    }  ) )

    

  },

  drawSelectedMeasure: function(cursorNoteEnabled) {
    var measureIndex = this.getSelectedMeasureIndex();

    //eslint-disable-next-line
    console.log("redraw measure[" + measureIndex + "]");

    this.drawMeasure(measureIndex, cursorNoteEnabled);

    // highlight selected note
    if (this.mode === "note")
      this.colourNote(this.$refs.svgcontainer.querySelector("#vf-" + this.selected.note.id),"red")
      
  }
};

const drawMixin = {
  methods: {
    ...editor.draw
  }
};

export default drawMixin;
