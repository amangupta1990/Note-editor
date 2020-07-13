import Vex from "vexflow";
import * as lodash from "lodash";


const REST_POSITIONS = {
  q: "b/4",
  h: "b/4",
  w: "e/5",
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
    (this.formatter = Vex.Flow.Formatter), (this.svgElem = svgcontainer);
    this.renderer = new Vex.Flow.Renderer(
      svgcontainer,
      Vex.Flow.Renderer.Backends.SVG
    );
    this.ctx = this.renderer.getContext();

    this.selected = {
      staves:[],
      notes:[]
    };
    this.mousePos= {};

    // event listerners

    // add first stave by default
    this.addStave();
    this.addStave();
    this.addNote(0, 0, "c/4", "q");
    this.addNote(0, 1, "c/4", "q");
    this.deleteNote(0, 0);
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
      });
      n.setAttribute("id", `${index}__${noteIndex}`);

      return n;
    });

    this.sheet.staves.splice(index, 0, stave);
    this.Draw();
    this.addEventListeners(this.svgElem)
    // draw the notes;
  }

  addNote(staveIndex, noteIndex, noteName, duration) {
    // modify the rest of the stave to join the notes
    let stave = this.sheet.staves[staveIndex];
    let notes = stave.notes;
    let n = new Vex.Flow.StaveNote({
      clef: this.clef,
      keys: [noteName],
      duration,
    });
    n.setAttribute("id", `${staveIndex}__${noteIndex}`);

    notes[noteIndex] = n;
    this.Draw();
  }
  deleteNote(staveIndex, noteIndex) {
    // convert the note into a rest
    let stave = this.sheet.staves[staveIndex];
    let oldNote = stave.notes[noteIndex];
    let n = new Vex.Flow.StaveNote({
      clef: this.clef,
      keys: [REST_POSITIONS[oldNote.duration]],
      duration: oldNote.duration + "r",
    });
    n.setAttribute("id", oldNote.attrs.id);
    stave.notes[noteIndex] = n;
    //add event listener for 
    this.Draw();
    this.addEventListeners(this.svgElem)
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
      if(stave.tempNotes && stave.tempNotes.length){
        let tempVoice = new Vex.Flow.Voice({ num_beats: 4, beat_value: 4 });
        tempVoice.addTickables(stave.tempNotes);
        new Vex.Flow.Formatter().format([tempVoice], this.staveWidth);
        tempVoice.draw(this.ctx,stave)
      }


    });

      // highlight the selected note 
      if(this.selected.notes.length){
      let selectedNote = this.svgElem.querySelector(`#vf-${this.selected.notes[0].staveIndex}__${this.selected.notes[0].noteIndex}`)
      this._highlightNoteElement(selectedNote,"red")
      }


  }

  _getSelectedElement(event){
    let ele = event.target;
    while (
      ele.classList.value.indexOf("vf-stavenote") < 0 && ele.classList.value.indexOf("vf-measureRect") < 0  
    ){
      ele = ele.parentElement;
    }

    // prevent the cursor note form getting selected
     if(ele.id.indexOf('auto') > -1   ){
       return [];
     }
      
      let id = ele.id.split("-")[1].split("__");

      // return an element only if there is a valid id selected
      return [ele, ele.classList.value.indexOf("vf-stavenote") > -1 ? "note" : "stave", ... id ]
  }

  _highlightNoteElement(ele,color = "black"){
    ele.querySelectorAll("*")
    .forEach(e=>{
      e.style.fill = color;
      e.style.stroke = color;
    })
}

// eslint-disable-next-line no-unused-vars
_highlightStaveElement(ele,color = "transparent"){
    ele.style.fill = color;
    ele.style.opacity = "0.4"      

}

  addEventListeners(svgElem) {
    // helper function for finding the selected element:






    svgElem.addEventListener("click", (event) => {
      event.preventDefault();
      // eslint-disable-next-line no-unused-vars
      let [ ele ,type, staveIndex, noteIndex ] = this._getSelectedElement(event);


      // if there is 

      switch(type){
      case 'note':{

      
      
      // unhighlight exsiting selection
     if( this.selected.notes.length ) this.selected.notes.map(note=>{
        if(note) {
        let ele = this.svgElem.querySelector(`#vf-${note.staveIndex}__${note.noteIndex}`)
        this._highlightNoteElement(ele);
        }
   

      }) 

      // update current selection
      this.selected.notes= [{
        staveIndex,
        noteIndex
      }]

      this.selected.notes.map(e=> this._highlightNoteElement(this.svgElem.querySelector(`#vf-${e.staveIndex}__${e.noteIndex}`),"red"))

      break;
    }

    case "stave": 
      {
       if(this.selected.staves.length) this.selected.staves.map(note=>{
          if(note) {
          let ele = this.svgElem.querySelector(`#vf-${note.staveIndex}`)
          this._highlightStaveElement(ele);
          }
        }) 

        this.selected.staves = [{
          staveIndex:staveIndex
        }]

        this.selected.staves.map(s=> this._highlightStaveElement(this.svgElem.querySelector(`#vf-${s.staveIndex}`),"lightblue"))

        break;

      }
    
    }


    });


    svgElem.addEventListener("mousemove",(e)=>this.DrawMeasureWithCursorNote(e) , false)



  }

   // Methods for drawing cursor note 

   getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
      return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
      };
    }

    isCursorInBoundingBox(bBox, cursorPos) {
      return cursorPos.x > bBox.getX() && cursorPos.x < bBox.getX() + bBox.getW() &&
             cursorPos.y > bBox.getY() && cursorPos.y < bBox.getY() + bBox.getH();
    }

    DrawMeasureWithCursorNote(event) {

      if(!this.selected.notes.length) return ;

      // get mouse position
      this.mousePos.current = this.getMousePos(this.svgElem, event);

      
      // get selected measure and note
      var vfStave = this.sheet.staves[ this.selected.notes[0].staveIndex ]
      var vfStaveNote = vfStave.notes[ this.selected.notes[0].noteIndex ]
      

      // currently support only for replacing rest with a new note
      // building chords feature will be added soon
      
      // get column of selected note on stave
      var bb = vfStave.getBoundingBox();
      var begin = vfStaveNote.getNoteHeadBeginX() - 5;
      bb.setX(begin);
      bb.setW(vfStaveNote.getNoteHeadEndX() - begin + 5);
      // bb.setW(20);
      // bb.draw(this.ctx);

      // mouse cursor is within note column
      if(this.isCursorInBoundingBox(bb, this.mousePos.current) ) {
        // save mouse position
        this.mousePos.previous = this.mousePos.current;
        // get new note below mouse cursor
        this.selected.cursorNoteKey = this.getCursorNoteKey();

        //this.vfSTave.addEventListener('click', this.addCursorNote , false);

        // Draw only when cursor note changed pitch
        // (mouse changed y position between staff lines/spaces)
        if(this.selected.lastCursorNoteKey !== this.selected.cursorNoteKey) {
          // console.log(this.selected.cursorNoteKey);
        
          this.drawCursorNote(this.selected.notes[0].staveIndex, this.selected.notes[0].noteIndex);
          this.Draw();

        }
        // save previous cursor note for latter comparison
        this.selected.lastCursorNoteKey = this.selected.cursorNoteKey;
      }
      // mouse cursor is NOT within note column
      else {

        //this.svgElem.removeEventListener('click', this.addCursorNote, false);

        // mouse cursor just left note column(previous position was inside n.c.)
        if(this.isCursorInBoundingBox(bb, this.mousePos.previous) ) {
          // Draw measure to erase cursor note
          this.removeCursorNote();
          this.Draw();
          this.mousePos.previous = this.mousePos.current;
          this.lastCursorNote = '';
        }
      }

    }

    
    removeCursorNote(){
      this.selected.lastCursorNoteKey = null;
      this.selected.cursorNoteKey = null;
      this.sheet.staves[this.selected.notes[0].staveIndex].tempNotes = [];
    }

    drawCursorNote(staveIndex, noteIndex){
      if(!this.selected.cursorNoteKey) return ;
      let tempNotes =lodash.cloneDeep(this.sheet.staves[staveIndex].notes)
      let tempNote = new Vex.Flow.StaveNote({
        clef: this.clef,
        keys: [this.selected.cursorNoteKey],
        duration: tempNotes[noteIndex].duration,
      });
      tempNotes[noteIndex]  =  tempNote
      


      this.sheet.staves[staveIndex].tempNotes = tempNotes
      this.Draw()

      // first remove the existing cursor note 
      


    }

   getCursorNoteKey() {
     let staveIndex = this.selected.notes[0].staveIndex; 
     let noteIndex = this.selected.notes[0].noteIndex;
     if(!staveIndex && noteIndex) return;
    // find the mouse position and return the correct note for that position.
    var y = this.sheet.staves[staveIndex].y;
    // var y = this.selected.measure.y;
    var notesArray = ['c/','d/','e/','f/','g/','a/','b/'];
    var count = 0;

    for(var i = 5; i >= 0; i--){
      for(var l = 0; l < notesArray.length; l++){
        var noteOffset = (count * 35) - (l * 5 - 17);
        if(this.mousePos.current.y >= y + noteOffset && this.mousePos.current.y <= 5 + y + noteOffset){
          var cursorNoteKey = notesArray[l] + (i+1);
          var found = true;
          break;
        }
        if(found == true){
          break;
        }
      }
      count++;
    }
    return cursorNoteKey;
  }
}

export default Editor;
