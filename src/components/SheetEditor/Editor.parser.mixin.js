/*
performs transformation from scoreJson to gl_VfStaves[] and gl_VfStaveNotes[]
prepares gl_VfStaves[] and gl_VfStaveNotes[] for editor.drawScore() function
*/
import __ from "underscore";
const parserMixin = {
  methods: {
    parseAll: function() {
      // clear global arrays
      this.gl_VfStaves = [];
      this.gl_VfStaveNotes = [];
      this.gl_StaveAttributes = [];

      var vfStave;
      // loop over all <measures>(MusicXML measures) and make Vex.Flow.Staves from them
      for (
        var i = 0;
        i < this.scoreJson["score-partwise"].part[0].measure.length;
        i++
      ) {
        vfStave = this.parseAttributes(i);

        vfStave = this.parseMeasure(
          this.scoreJson["score-partwise"].part[0].measure[i],
          i,
          vfStave
        );

        // push measure to global array, draw() will read from it
        this.gl_VfStaves.push(vfStave);
      }
    },

    parseMeasure: function(measure, index, vfStave) {
      var vfStaveNote,
        vfStaveNotesPerMeasure = [];
      if (measure.note) {
        // loop over all notes in measure
        for (var i = 0; i < measure.note.length; i++) {
          vfStaveNote = this.parseNote(measure.note[i], index, i);
          vfStaveNotesPerMeasure.push(vfStaveNote);
        }
        this.gl_VfStaveNotes.push(vfStaveNotesPerMeasure);
        // width of measure directly proportional to number of notes
        vfStave.setWidth(vfStaveNotesPerMeasure.length * this.noteWidth);
        if (vfStave.getWidth() < this.staveWidth)
          vfStave.setWidth(this.staveWidth);
      } // measure doesn't have notes
      else this.gl_VfStaveNotes.push([]);

      if (measure["@width"]) {
        // in MusicXML measure width unit is one tenth of interline space
        vfStave.setWidth(
          measure["@width"] * (vfStave.getSpacingBetweenLines() / 10)
        );
      }

      return vfStave;
    },

    parseAttributes: function(measureIndex) {
      var xmlAttributes =
        this.scoreJson["score-partwise"].part[0].measure[measureIndex][
          "attributes"
        ] || {};

      var staveAttributes = {
        // intentionally commented, by default is this object empty
        // just to show which properties object may contain
        // xmlClef: '',
        // vfClef: '',
        // xmlFifths: 0,
        // xmlDivisions: 4,
        // vfKeySpec: '',
        // vfTimeSpec: ''
      };

      // create one Vex.Flow.Stave, it corresponds to one <measure>
      var vfStave = new this.Vex.Flow.Stave(0, 0, this.staveWidth);

      // setting attributes for measure
      if (!__.isEmpty(xmlAttributes)) {
        if (xmlAttributes.clef) {
          let clef;
          if (__.isArray(xmlAttributes.clef)) {
            //eslint-disable-next-line
            console.warn("Multiple clefs for measure currently not supported.");
            clef = xmlAttributes.clef[0];
          } else clef = xmlAttributes.clef;

          staveAttributes.xmlClef = clef.sign + "/" + clef.line;
          staveAttributes.vfClef = this.CLEF_TYPE_DICT[
            staveAttributes.xmlClef
          ];
          vfStave.setClef(staveAttributes.vfClef);
          vfStave.setWidth(vfStave.getWidth() + 80);
          // editor.currentClef = vfClefType;
        }

        if (xmlAttributes.key) {
          if (xmlAttributes.key.hasOwnProperty("fifths")) {
            var fifths = +xmlAttributes.key.fifths;
            if (fifths === 0) this.keySpec = "C";
            else if (fifths > 0)
              this.keySpec = this.SHARP_MAJOR_KEY_SIGNATURES[fifths - 1];
            else
              this.keySpec = this.FLAT_MAJOR_KEY_SIGNATURES[-fifths - 1];
            vfStave.setKeySignature(this.keySpec);
            vfStave.setWidth(vfStave.getWidth() + Math.abs(fifths) * 30);
            staveAttributes.vfKeySpec = this.keySpec;
            staveAttributes.xmlFifths = fifths;
            // editor.currentKeySig = keySpec;
          }
        }

        if (xmlAttributes.time) {
          let time;
          if (__.isArray(xmlAttributes.time)) {
            //eslint-disable-next-line
            console.warn(
              "Multiple pairs of beats and beat-type elements in time signature not supported."
            );
            time = xmlAttributes.time[0];
          } else time = xmlAttributes.time;

          var timeSpec = time.beats + "/" + time["beat-type"];
          vfStave.setTimeSignature(timeSpec);
          vfStave.setWidth(vfStave.getWidth() + 80);
          staveAttributes.vfTimeSpec = timeSpec;
          // editor.currentTimeSig = timeSpec;
        }

        if (xmlAttributes.divisions) {
          staveAttributes.xmlDivisions = xmlAttributes.divisions;
        }
      }

      // push attributes to global array
      this.gl_StaveAttributes.push(staveAttributes);

      return vfStave;
    },

    parseNote: function(note, measureIndex, noteIndex) {
      // eslint-disable-next-line
      var rest = "",
        step = "",
        oct = "",
        //eslint-disable-next-line
        dot = "",
        vfAcc = "";
      // get MusicXML divisions from attributes for current measure
      var divisions = 4;
      // for(var i = 0; i <= measureIndex; i++) {
      //   if(gl_StaveAttributes[i].xmlDivisions !== undefined)
      //     divisions = gl_StaveAttributes[i].xmlDivisions;
      // }
      divisions = this.getCurAttrForMeasure(measureIndex, "xmlDivisions");

      // get note length from divisions and duration
      var staveNoteDuration = this.getStaveNoteTypeFromDuration(
        note.duration,
        divisions
      );
      // to get also dots, add third argument to function - true
      // but currently dots calculating algorithm doesn't work correctly
      // and dot is taken from <dot/> element

      // console.log(step+'/'+oct+', '+'divisions:'+divisions
      //   +', '+'duration:'+note.duration+' -> '+staveNoteDuration);

      // rest is empty element in MusicXML, to json it is converted as {rest: null}
      if (note.hasOwnProperty("rest")) {
        rest = "r";
        // key = editor.table.DEFAULT_REST_PITCH;
        step = "b";
        oct = "4";
        // whole measure rest
        if (note.rest && note.rest["@measure"] === "yes")
          staveNoteDuration = "w";
      } else if (note.pitch) {
        // key = note.pitch.step.toLowerCase() + '/' + note.pitch.octave;
        step = note.pitch.step.toLowerCase();
        oct = note.pitch.octave;
        // since this project is yet not interested in how note sounds,
        // alter element is not needed; accidental is read from accidental element
        // TODO: parse also alter element and save it, we are playing also now
      }

      if (note.accidental) {
        // accidental element can have attributes
        var mXmlAcc =
          typeof note.accidental === "string"
            ? note.accidental
            : note.accidental["#text"];
        vfAcc = this.ACCIDENTAL_DICT[mXmlAcc];
      }

      // get current clef
      var currentClef = this.getCurAttrForMeasure(measureIndex, "vfClef");

      var vfStaveNote = new this.Vex.Flow.StaveNote({
        keys: [step + vfAcc + "/" + oct],
        duration: staveNoteDuration + rest,
        clef: rest === "" ? currentClef : "treble",
        auto_stem: true,
        
      });
        vfStaveNote.setAttribute("id",this.formatNoteId(measureIndex,noteIndex))
      // console.log(vfStaveNote.getKeys().toString()+' '+staveNoteDuration);

      // set id for note DOM element in svg
      //vfStaveNote.attrs.id=;

      // set accidental
      if (vfAcc !== "")
        vfStaveNote.addAccidental(0, new this.Vex.Flow.Accidental(vfAcc));

      // // set dots with dots calculated from duration and divisions
      // var dotsArray = staveNoteDuration.match(/d/g);
      // // how many dots, format of vf duration: 'hdd' - half note with 2 dots
      // if(dotsArray) {
      //   dots = dotsArray.length;
      //   for(var i = 0; i < dots; i++) {
      //     vfStaveNote.addDotToAll();
      //   }
      // }

      // currently support for only one dot
      // to support more dots, xml2json.js needs to be changed -
      // (or use this improved one: https://github.com/henrikingo/xml2json)
      // - currently it is eating up more dots:
      // e.g. from <dot/><dot/><dot/> it makes only one {dot: null}
      if (note.hasOwnProperty("dot")) {
        vfStaveNote.addDotToAll();
        // console.log('dot');
      }

      return vfStaveNote;
    }
  }
};

export default parserMixin;
