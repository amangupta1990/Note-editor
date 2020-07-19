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
    this.lodash= lodash;
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
    this.noteWidth = 100;
    this.dotted = "";
    this.eventsAdded = false;
    this.svgElem = svgcontainer;

    this.shiftActive = false;
    this.ctrlActive = false;
    this.accidental = null;
    this.renderer = new Vex.Flow.Renderer(
      svgcontainer,
      Vex.Flow.Renderer.Backends.SVG
    );
    this.ctx = this.renderer.getContext();

    this.sheet ={
      staves: []
    }

    this.states = [];
    this.undoStates = []



    this.selected = {
      _staves: [],
      _notes:[{staveIndex: 0 , noteIndex: 0, keys:[REST_POSITIONS["q"]], isRest: true, duration: "q"  }],
      cursor:{
        _staveIndex: 0,
        _noteIndex:0,

        set noteIndex(value){ this._noteIndex = parseInt(value)},
        get noteIndex(){ return parseInt(this._noteIndex)},
        set staveIndex(value){ this._staveIndex = parseInt(value)},
        get staveIndex(){ return parseInt(this._staveIndex)}

      },

      get notes(){
          return this._notes.map(n=> {
            return {...n, staveIndex: parseInt(n.staveIndex), noteIndex: parseInt(n.noteIndex) } })
      },

      set notes(value){
        if(!lodash.isArray(value)) this._notes = this._notes;
        else this._notes = value;
      },

      get staves(){
        return this._staves.map(s=> parseInt(s))
      },

      set staves(value){
          this._staves = value;
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
    this.Draw();
    if (!this.eventsAdded) {
      this.addEventListeners(this.svgElem);
      this.addKeyboardListeners();
      this.eventsAdded = true;
    }
    // this.addNote(this.sheet.staves[0],"c/4","q")
    //this.editNote(this.sheet.staves[0],1,"c/4","w")
  }

  saveState(){
    const sheet = JSON.stringify(this.sheet);
    const selected = JSON.stringify(this.selected);
    this.states.push({sheet,selected}) ; console.log("state saved",this.states);
  }
  

  undo(){
    if(!this.states.length) return;
    const currState ={
      sheet: JSON.stringify(this.sheet),
      selected: JSON.stringify(this.selected)
    }

    this.undoStates.push(currState)

    const previousState = this.states.pop()
    if(previousState){
    this.sheet = JSON.parse(previousState.sheet)
    this.selected = JSON.parse(previousState.selected)
    this.Draw();
    }
  }

  redo(){
    if(!this.undoStates.length) return;
    this.saveState();
    const undoSate = this.undoStates.pop();
    this.sheet = JSON.parse(undoSate.sheet);
    this.selected = JSON.parse(undoSate.selected);

  }

  addStave(index = this.sheet.staves ? this.sheet.staves.length : 0) {
    this.sheet.staves = this.sheet.staves || [];
    
    // fill bar with rests

    let notes = new Array(4).fill({keys:[REST_POSITIONS["q"]] ,duration:"q",isRest:true})
                            .map((n,i)=> { return  {...n,staveIndex:index, noteIndex:i} })
    this.sheet.staves.splice(index, 0, {notes});
  }

  addNote(noteName) {
    // modify the rest of the stave to join the notes

    let notes = this.selected.notes;
    notes = notes.map((note)=>{
    let stave = this.sheet.staves[note.staveIndex];
    let isRest = note.isRest;
    let duration =  note.duration.replace('r','');
    let keys = isRest ? [noteName] :   lodash.sortBy( this.lodash.uniq([...note.keys, noteName]))
    let accidental = note.accidental || null;
   

    let newNote = {keys,duration,isRest:false,staveIndex:  note.staveIndex,noteIndex: note.noteIndex, accidental};
    stave.notes[note.noteIndex] = newNote;
    this.sheet.staves[note.staveIndex] = stave;
    return newNote;

  })
  this.selected.notes = notes;
  }

  //TODO: implement 
  changeDuration(){
    
  
  }


  deleteNotes() {
    // convert the note into a rest
    let notes = this.selected.notes;
    notes = notes.map(note=>{

    let stave = this.sheet.staves[note.staveIndex];
    let oldNote = stave.notes[note.noteIndex];
    let newNote = {
      keys: [REST_POSITIONS[oldNote.duration]],
      duration: oldNote.duration,
      isRest:true,
      staveIndex:oldNote.staveIndex,
      noteIndex: oldNote.noteIndex,
      accidental: null
    }
    stave.notes[note.noteIndex] = newNote;
    this.sheet.staves[note.staveIndex] = stave;
    return newNote;
  })

  this.selected.notes = notes;

    
  }

  Draw() {
    this.ctx.clear();
    let staveXpos = 10;
    let staveWidth = 0;
    this.sheet.staves.map((s, staveIndex) => {

      
      staveXpos += staveWidth;
      staveWidth = this.noteWidth*s.notes.length;
      // drave the stave first , add timesignature
      let stave = new Vex.Flow.Stave(
        staveXpos,
        40,
        staveWidth 
      );
      stave.setAttribute("id", "vf-" + staveIndex);
    

      if(staveIndex === 0){
          stave.addTimeSignature("4/4")
          .addClef(this.clef);
      }

      stave.setContext(this.ctx).draw(); 

      //add selectable overlay
      this.ctx.rect(stave.getX(), stave.y, stave.getWidth(), this.staveHeight, {
        class: "vf-measureRect",
        id: "vf-" + staveIndex,
        fill: "transparent",
      });

      // draw the notes 

      let staveNotes =  s.notes.map(n=>{

       let  staveNote = new Vex.Flow.StaveNote({
          clef: this.clef,
          keys: n.keys,
          duration: !n.isRest? n.duration : n.duration+"r",
          auto_stem: true,
        });
        staveNote.setAttribute("id", `${n.staveIndex}__${n.noteIndex}`);
        return staveNote
       })
    
      
    
      let voice = new Vex.Flow.Voice({ num_beats: staveNotes.length, beat_value: staveNotes.length });
      voice.addTickables(staveNotes);
      
      new Vex.Flow.Formatter().format([voice], staveWidth);
      voice.draw(this.ctx, stave);

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


    this.selected.staves.map((staveIndex)=>{
      this._highlightStaveElement(
        this.svgElem.querySelector(
          `#vf-${staveIndex}`
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
          
          this._addtoSelectedNotes(  this.sheet.staves[staveIndex].notes[noteIndex])
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

  _addtoSelectedNotes(note){
    if(this.shiftActive){
      let notes = lodash.clone(this.selected.notes);
      notes.push(note)
      notes = lodash.uniq(notes);
      this.selected.notes = notes;
    }
    else{
      this.selected.notes = [note];
    }
  }

  _addtoSelectedStaves(stave){
    if(this.shiftActive){
      let staves = lodash.clone(this.selected.staves);
      staves.push(stave)
      staves = lodash.uniq(  );
      this.selected.staves = staves;
    }
    else{
      this.selected.staves = [stave];
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
    let duration = selectedNote.duration.replace('r','') ;
    let keys = selectedNote.keys;
    let isRest = selectedNote.isRest;
    let clef = selectedNote.clef;
    let newNotes = new Array(2).fill(null)
    // create a new duration

    switch(duration){
      case "q":  duration ="8"; break;
      case "8": duration = "16"; break;
      case "16": duration = "32"; break;
      default: return ;
    }

    newNotes = newNotes.map( () => { return {
      clef,
      keys,
      duration,
      isRest

    }
    })

    notes.splice(this.selected.cursor.noteIndex,1,...newNotes);
    // remap ids 

    notes = notes.map((n,i) => {
    n.staveIndex = this.selected.cursor.staveIndex;
    n.noteIndex= i;
    return n 
    
  } )
  stave.notes = notes;
  this.setCursor(this.selected.cursor.staveIndex,this.selected.cursor.noteIndex+1);

    
  }

  // TODO: 
  mergeNotes(){

  }

  setCursor(staveIndex,noteIndex){
    this.selected.cursor ={
      staveIndex: staveIndex,
      noteIndex: noteIndex
    }
    let selectedNote = this.sheet.staves[staveIndex].notes[noteIndex]
    this._addtoSelectedNotes(selectedNote)
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
    let selectedNote = this.sheet.staves[sIndex].notes[nIndex]

    this._addtoSelectedNotes(selectedNote)




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
    let selectedNote = this.sheet.staves[sIndex].notes[nIndex]
    this._addtoSelectedNotes(selectedNote)
  }

  // add keyboard controls
  addKeyboardListeners() {

  
    document.addEventListener("keyup", (event) => {

      

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
          this.saveState()
          this.deleteNotes();
          this.Draw();
          break;
        }

        case event.key === "s": {
          if(!event.ctrlKey) return;
          this.saveState()
          this.splitSelectedNote();
          this.Draw();
          break
        }

        // undo and redo

        case event.key === "z": {
          if(!event.ctrlKey && !event.metaKey ) return;
          this.undo();
          this.Draw();
          break
        }

        case event.key === "r": {
          if(!event.ctrlKey && !event.metaKey ) return;
          this.redo();
          this.Draw();
          break
        }

        // enable accidentals accordingly 

        case event.key === "B"  || event.key === "#"  || event.key === "N" : {
          if(!event.shiftKey ) return;
          
          let key = event.key.toLowerCase();

          switch(true){
            case this.accidental === null : this.accidental = key ; break;
            case this.accidental  && this.accidental.indexOf(key) < 0 : this.accidental = key; break;
            case key === "b":
                this.accidental = this.accidental === "b" && this.accidental === key ? this.accidental = "bb" :  null  ; break;
            case key === "#":
                this.accidental = this.accidental === "#" && this.accidental === key? this.accidental = "##" :  null; break;
            case key === "n":
                  this.accidental = this.accidental ==="n" ? this.accidental = null : this.accidental = "n" ; break;
            
          }
          console.log(this.accidental)

          break;
        }

        // for adding note s 
        case noteMatch && noteMatch.length === 1: {
          this.saveState();
          this.addNote(`${event.key.toLowerCase()}/4` )
          this.Draw();
          break;
        } 

        case event.key === "Control": this.ctrlActive = false; break;
        case event.key === "Shift": this.shiftActive = false; break;
        case event.key === "Meta": this.MetaActive = false; break;

      }

      document.addEventListener("keydown",(event)=>{
        switch(true){
        case event.key === "Control": this.ctrlActive = true; break;
        case event.key === "Shift": this.shiftActive = true; break;
        case event.key === "Meta": this.MetaActive = true; break;
        }
      })

      
    });


  }
}

export default Editor;
