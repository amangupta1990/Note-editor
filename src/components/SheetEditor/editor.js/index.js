/* eslint-disable no-console */
import Vex from "vexflow";
import * as lodash from "lodash";

const REST_POSITIONS = {
  q: "b/4",
  h: "b/4",
  w: "e/5",
  8: "b/4",
  16: "b/4",
  32: "b/4"
};



class Editor {
  //eslint-disable-next-line

  constructor(svgcontainer) {
    this.sheet = {};
    this.keySig = "C";
    this.timeSigTop = 4;
    this.timeSigBottom = 4;
    this.clef = "treble";
    this.tab = "note";
    this.mode = "measure";
    this.noteValue = "w";
    this.accidental = "bb";
    this.staveWidth = 400;
    this.staveHeight = 140;
    this.noteWidth = 40;
    this.dotted = "";
    this.eventsAdded = false;
    this.svgElem = svgcontainer;

    this.shiftActive = false;
    this.ctrlActive = false;

    this.renderer = new Vex.Flow.Renderer(
      svgcontainer,
      Vex.Flow.Renderer.Backends.SVG
    );
    this.ctx = this.renderer.getContext();

    this.selected = {
      staves: [],
      cursor:{
        _staveIndex: 0,
        _noteIndex:0,

        set noteIndex(value){ this._noteIndex = parseInt(value)},
        get noteIndex(){ return parseInt(this._noteIndex)},
        set staveIndex(value){ this._staveIndex = parseInt(value)},
        get staveIndex(){ return parseInt(this._staveIndex)}

      },
      notes:[]

    };
    this.mousePos = {
      previous:{
        x:0,
        y:0,
      },
      current:{
        x:0,
        y:0
      }
    };

    // event listerners

    // add first stave by default
    this.addStave();
    this.addStave();
    this.addNote(0, 0, "c/4", "q");
    this.addNote(0, 1, "c/4", "q");
    this.deleteNote(0, 0);
    this.Draw();
    if (!this.eventsAdded) {
      this.addEventListeners(this.svgElem);
      this.addKeyboardListeners();
      this.eventsAdded = true;
    }
    // this.addNote(this.sheet.staves[0],"c/4","q")
    //this.editNote(this.sheet.staves[0],1,"c/4","w")
  }

  addStave(index = this.sheet.staves ? this.sheet.staves.length : 0) {
    this.sheet.staves = this.sheet.staves || [];
    let stave = new Vex.Flow.Stave(
      10 + this.staveWidth * index,
      40,
      this.staveWidth
    );
    stave.setAttribute("id", "vf-" + index);
    stave.addClef(this.clef).addTimeSignature("4/4");

    //add selectable overlay

    // fill bar with rests

    stave.notes = new Array(4).fill("q");
    stave.notes = stave.notes.map((d, noteIndex) => {
      let n = new Vex.Flow.StaveNote({
        clef: this.clef,
        keys: [REST_POSITIONS[d]],
        duration: d + "r",
        auto_stem: true,
      });
      n.setAttribute("id", `${index}__${noteIndex}`);

      return n;
    });

    this.sheet.staves.splice(index, 0, stave);
  }

  addNote(staveIndex, noteIndex, noteName, duration) {
    // modify the rest of the stave to join the notes
    let stave = this.sheet.staves[staveIndex];
    let notes = stave.notes;
    let isRest = notes[noteIndex].isRest();
    duration = duration || notes[noteIndex].duration;

    let keys = stave.notes[noteIndex].keys;
    let n = new Vex.Flow.StaveNote({
      clef: this.clef,
      keys: isRest ? [noteName] : lodash.uniq([...keys, noteName]),
      duration,
      auto_stem: true,
    });
    n.setAttribute("id", `${staveIndex}__${noteIndex}`);

    notes[noteIndex] = n;
    
  }

  //TODO: implement 
  changeDuration(){
    
  
  }




  deleteNote(staveIndex, noteIndex) {
    // convert the note into a rest
    let stave = this.sheet.staves[staveIndex];
    let oldNote = stave.notes[noteIndex];
    let n = new Vex.Flow.StaveNote({
      clef: this.clef,
      keys: [REST_POSITIONS[oldNote.duration]],
      duration: oldNote.duration + "r",
      auto_stem: true,
    });
    n.setAttribute("id", oldNote.attrs.id);
    stave.notes[noteIndex] = n;


    
  }

  Draw() {
    this.ctx.clear();
    this.sheet.staves.map((stave, staveIndex) => {
      stave.setContext(this.ctx).draw();

      //add selectable overlay
      this.ctx.rect(stave.getX(), stave.y, stave.getWidth(), this.staveHeight, {
        class: "vf-measureRect",
        id: "vf-" + staveIndex,
        fill: "transparent",
      });

      stave.voice = new Vex.Flow.Voice({ num_beats: 4, beat_value: 4 });
      stave.voice.addTickables(stave.notes);
      new Vex.Flow.Formatter().format([stave.voice], this.staveWidth);
      stave.voice.draw(this.ctx, stave);

      // if there are temp notes .. draw them too
      if (stave.tempNotes && stave.tempNotes.length) {
        let tempVoice = new Vex.Flow.Voice({ num_beats: 4, beat_value: 4 });
        tempVoice.addTickables(stave.tempNotes);
        new Vex.Flow.Formatter().format([tempVoice], this.staveWidth);
        tempVoice.draw(this.ctx, stave);
      }
    });

    // highlight the selected note
    if (this.selected.cursor) {
      let selectedNote = this.svgElem.querySelector(
        `#vf-${this.selected.cursor.staveIndex}__${
          this.selected.cursor.noteIndex
        }`
      );
      this._highlightNoteElement(selectedNote, "red");
    }
  }

  _getSelectedElement(event) {
    let ele = event.target;
    while (
      ele.classList.value.indexOf("vf-stavenote") < 0 &&
      ele.classList.value.indexOf("vf-measureRect") < 0
    ) {
      ele = ele.parentElement;
    }

    // prevent the cursor note form getting selected
    let id = ele.id;
    if (id.indexOf("auto") > -1) return [];

    id = id.split("-")[1].split("__");

    // return an element only if there is a valid id selected
    return [
      ele,
      ele.classList.value.indexOf("vf-stavenote") > -1 ? "note" : "stave",
      ...id,
    ];
  }

  _highlightNoteElement(ele, color = "black") {
    if (!ele) {
      console.warn("No element was passed");
      return;
    }
    ele.querySelectorAll("*").forEach((e) => {
      e.style.fill = color;
      e.style.stroke = color;
    });
  }

  // eslint-disable-next-line no-unused-vars
  _highlightStaveElement(ele, color = "transparent") {
    ele.style.fill = color;
    ele.style.opacity = "0.4";
  }

  addEventListeners(svgElem) {
    // helper function for finding the selected element:

    svgElem.addEventListener("click", (event) => {
      event.preventDefault();


      // eslint-disable-next-line no-unused-vars
      let [ele, type, staveIndex, noteIndex] = this._getSelectedElement(event);

      switch (type) {
        case "note": {



          // update current selection
          this.selected.cursor.staveIndex = staveIndex;
          this.selected.cursor.noteIndex = noteIndex;
          


          this.Draw();
          break;
        }

        case "stave": {
          if (this.selected.cursor) {
            let ele = this.svgElem.querySelector(
              `#vf-${this.selected.cursor.staveIndex}`
            );
            this._highlightStaveElement(ele);
          }

          this.selected.cursor.staveIndex = staveIndex;
          this.selected.cursor.noteIndex = this.selected.cursor.noteIndex || 0;

          this._highlightStaveElement(
            this.svgElem.querySelector(
              `#vf-${this.selected.cursor.staveIndex}`
            ),
            "lightblue"
          );

          break;
        }
      }
    });

    svgElem.addEventListener("blur", () => {
      this.Draw();
    });

  }

  // Methods for drawing cursor note

  getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top,
    };
  }






  splitSelectedNote(){
    let stave = this.sheet.staves[this.selected.cursor.staveIndex];
    let notes = stave.notes;
    let selectedNote = stave.notes[this.selected.cursor.noteIndex];
    let duration = selectedNote.duration ;
    let keys = selectedNote.keys;
    let clef = selectedNote.clef;
    let newNotes = new Array(2).fill(null)
    // create a new duration

    switch(duration){
      case "q":  duration ="8"; break;
      case "8": duration = "16"; break;
      case "16": duration = "32"; break;
      default: return ;
    }

    newNotes = newNotes.map( () => { return new Vex.Flow.StaveNote({
      clef,
      keys,
      duration,
      auto_stem:true
    }) })

    notes.splice(this.selected.cursor.noteIndex,1,...newNotes);
    // remap ids 

    stave.notes.map((n,i) => n.setAttribute("id", `${this.selected.cursor.staveIndex}__${i}`) )
    this.setCursor(this.selected.cursor.staveIndex,this.selected.cursor.noteIndex);

    
  }

  // TODO: 
  mergeNotes(){}

  setCursor(staveIndex,noteIndex){
    this.selected.cursor ={
      staveIndex: staveIndex,
      noteIndex: noteIndex
    }
  }

  getCursorNote() {
    let staveIndex = this.selected.cursor.staveIndex;
    let noteIndex = this.selected.cursor.noteIndex;
    if (!staveIndex && noteIndex) return [];
    // find the mouse position and return the correct note for that position.
    var y = this.sheet.staves[staveIndex].y;
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
        if (found == true) {
          break;
        }
      }
      count++;
    }
    return [cursorNoteKey, staveIndex, noteIndex];
  }

  // cursor manipulation methods
  _cursorForward() {
    let sIndex = this.selected.cursor.staveIndex;
    let nIndex = this.selected.cursor.noteIndex;

    switch (true) {
      case nIndex < this.sheet.staves[sIndex].notes.length - 1: {
        nIndex = nIndex + 1;
        break;
      }
      case nIndex === this.sheet.staves[sIndex].notes.length - 1: {
        if (sIndex < this.sheet.staves.length - 1) {
          sIndex = sIndex + 1;
          nIndex = 0;
        }
        break;
      }
    }

    this.selected.cursor.staveIndex = sIndex;
    this.selected.cursor.noteIndex = nIndex;
  }

  _cursorBack() {
    let sIndex = this.selected.cursor.staveIndex;
    let nIndex = this.selected.cursor.noteIndex;

    switch (true) {
      case nIndex > 0: {
        nIndex = nIndex - 1;
        break;
      }
      case nIndex === 0 && sIndex > 0: {
        
          sIndex = sIndex - 1;
          nIndex = this.sheet.staves[sIndex].notes.length - 1;
        
        break;
      }
    }
    
    this.selected.cursor.staveIndex = sIndex;
    this.selected.cursor.noteIndex = nIndex;
  }

  // add keyboard controls
  addKeyboardListeners() {

  
    document.addEventListener("keyup", (event) => {

      console.log(event);

      let keyMatch = event.code.match(/[Key][abcdefg]+/g);

      switch (true) {
        case event.code === "ArrowRight": {
          this._cursorForward();
          
          break;
        }

        case event.code === "ArrowLeft": {
          this._cursorBack();
          
          break;
        }

        case event.code === "Backspace": {
          this.deleteNote(this.selected.cursor.staveIndex, this.selected.cursor.noteIndex);
          break;
        }

        case event.code === "KeyS": {
          this.splitSelectedNote();
          break
        }

        // for adding note s 
        case keyMatch && keyMatch.length === 1: {
          this.addNote(this.selected.cursor.staveIndex, this.selected.cursor.noteIndex, `${event.code.split("Key")[1].toLowerCase()}/4` )
        } 

      }

      this.Draw();
    });
  }
}

export default Editor;
