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
      _notes:[{staveIndex: 0 , noteIndex: 0}],
      cursor:{
        _staveIndex: 0,
        _noteIndex:0,

        set noteIndex(value){ this._noteIndex = parseInt(value)},
        get noteIndex(){ return parseInt(this._noteIndex)},
        set staveIndex(value){ this._staveIndex = parseInt(value)},
        get staveIndex(){ return parseInt(this._staveIndex)}

      },

      get notes(){
          return this._notes.map(n=> {return {staveIndex: parseInt(n.staveIndex), noteIndex: parseInt(n.noteIndex) } })
      },

      set notes(value){
        if(!lodash.isArray(value)) this._notes = this._notes;
        else this._notes = value;
      }

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
    this.addNote( "c/4");
    this.addNote( "c/4");
    this.deleteNotes();
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

  addNote(noteName) {
    // modify the rest of the stave to join the notes


    this.selected.notes.map((note)=>{
    let stave = this.sheet.staves[note.staveIndex];
    let notes = stave.notes;
    let isRest = notes[note.noteIndex].isRest();
    let duration =  notes[note.noteIndex].duration;

    let keys = stave.notes[note.noteIndex].keys;
    let n = new Vex.Flow.StaveNote({
      clef: this.clef,
      keys: isRest ? [noteName] : lodash.uniq([...keys, noteName]),
      duration,
      auto_stem: true,
    });
    n.setAttribute("id", `${note.staveIndex}__${note.noteIndex}`);

    notes[note.noteIndex] = n;

  })
    
  }

  //TODO: implement 
  changeDuration(){
    
  
  }




  deleteNotes() {
    // convert the note into a rest

    this.selected.notes.map(note=>{

    let stave = this.sheet.staves[note.staveIndex];
    let oldNote = stave.notes[note.noteIndex];
    let n = new Vex.Flow.StaveNote({
      clef: this.clef,
      keys: [REST_POSITIONS[oldNote.duration]],
      duration: oldNote.duration + "r",
      auto_stem: true,
    });
    n.setAttribute("id", oldNote.attrs.id);
    stave.notes[note.noteIndex] = n;

  })

    
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

    // highlight the selected notes
    this.selected.notes.map((sn)=>{
      let selectedNote = this.svgElem.querySelector(
        `#vf-${sn.staveIndex}__${
          sn.noteIndex
        }`
      );
      this._highlightNoteElement(selectedNote, "red");
    })


    this.selected.staves.map((ss)=>{
      this._highlightStaveElement(
        this.svgElem.querySelector(
          `#vf-${ss.staveIndex}`
        ),
        "lightblue"
      );
    })

    



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



          //  
          this.selected.cursor.staveIndex = staveIndex;
          this.selected.cursor.noteIndex = noteIndex;

          this._addtoSelectedNotes(staveIndex,noteIndex)
          break;
        }

        case "stave": {
     

          this._addtoSelectedStaves(staveIndex);
          break;
        }
      }
      this.Draw();

    });

    svgElem.addEventListener("blur", () => {
      this.Draw();
    });

  }

  // Methods for drawing cursor note

  _addtoSelectedNotes(staveIndex, noteIndex){
    if(this.shiftActive){
      let notes = lodash.clone(this.selected.notes);
      notes.push({staveIndex,noteIndex})
      notes = lodash.uniq( notes  );
      this.selected.notes = notes;
    }
    else{
      this.selected.notes = [{staveIndex,noteIndex}];
    }
  }

  _addtoSelectedStaves(staveIndex){
    if(this.shiftActive){
      let staves = lodash.clone(this.selected.staves);
      staves.push({staveIndex})
      staves = lodash.uniq(  );
      this.selected.notes = staves;
    }
    else{
      this.selected.staves = [{staveIndex}];
    }
  }

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
  mergeNotes(){

  }

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

    this._addtoSelectedNotes(sIndex,nIndex)




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

    this._addtoSelectedNotes(sIndex,nIndex)
  }

  // add keyboard controls
  addKeyboardListeners() {

  
    document.addEventListener("keyup", (event) => {

      console.log("keyup",event);

      let noteMatch = event.key.length === 1 ? event.key.match(/[abcdefg]/) : null;

      switch (true) {
        case event.key === "ArrowRight": {
          this._cursorForward();
          this.Draw();
          break;
        }

        case event.key === "ArrowLeft": {
          this._cursorBack();
          this.Draw();
          break;
        }

        case event.key === "Backspace": {
          this.deleteNotes();
          this.Draw();
          break;
        }

        case event.key === "s": {
          this.splitSelectedNote();
          this.Draw();
          break
        }

        // for adding note s 
        case noteMatch && noteMatch.length === 1: {
          this.addNote(`${event.key.toLowerCase()}/4` )
          this.Draw();
          break;
        } 

        case event.key === "Control": this.ctrlActive = false; break;
        case event.key === "Shift": this.shiftActive = false; break;
        case event.key === "Meta": this.MetaActive = false; break;

      }

      
    });


    document.addEventListener('keydown', (event)=>{
      console.log("keydown",event);
        switch(true){
          case event.key === "Control": this.ctrlActive = true; break;
          case event.key === "Shift": this.shiftActive = true; break;
          case event.key === "Meta": this.MetaActive = true; break;
        }
    })

  }
}

export default Editor;
