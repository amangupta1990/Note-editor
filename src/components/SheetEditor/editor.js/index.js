import Vex from "vexflow";

const REST_POSITIONS = {
  "q": "b/4",
  "h": "b/4",
  "w": "e/5",
}



  
class Editor {

  //eslint-disable-next-line
  

  constructor(svgcontainer) {
    this.sheet = {}
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
    this.formatter = Vex.Flow.Formatter,
    this.svgElem = svgcontainer;
    this.renderer = new Vex.Flow.Renderer(
      svgcontainer,
      Vex.Flow.Renderer.Backends.SVG
    );
    this.ctx = this.renderer.getContext();

    this.selected = {
      cursorNoteKey: "b/4",
      measure: {
        id: "m0",
        previousId: "m0",
      },
      note: {
        id: "m0n0",
        previousId: "m0n0",
      },
    };

    // add first stave by default
    this.addStave()
    this.addNote(0,0,"c/4","q")
    this.addNote(0,1,"c/4","q")
    this.deleteNote(0,0)
    // this.addNote(this.sheet.staves[0],"c/4","q")
    //this.editNote(this.sheet.staves[0],1,"c/4","w")
  }

  

  addStave(index = this.sheet.staves ? this.sheet.staves.length : 0 ) {
    this.sheet.staves = this.sheet.staves ||  [];
    let stave = new Vex.Flow.Stave(10,40, this.staveWidth*(this.sheet.staves.length+1));
    stave.setAttribute("id",index)
    stave.addClef(this.clef).addTimeSignature("4/4");
    stave.notes = new Array(4).fill("q");

    // fill it up with rests 
    stave.notes =  stave.notes.map((d,noteIndex)=> { 
      let n =   new Vex.Flow.StaveNote({clef: this.clef, keys: [REST_POSITIONS[d]], duration:d+"r"})
      n.setAttribute("id",`${index}|${noteIndex}`);

      return n;
     } )
    
    var voice = new Vex.Flow.Voice({num_beats: 4,  beat_value: 4});
    voice.addTickables(stave.notes);
    new Vex.Flow.Formatter().joinVoices([voice]).format([voice], this.staveWidth);
    stave.voice = voice ;

    this.sheet.staves.splice(index,0,stave);
    stave.setContext(this.ctx).draw()
    voice.draw(this.ctx,stave)
    // draw the notes;
    
  }

  addNote(staveIndex,noteIndex,noteName,duration){
    // modify the rest of the stave to join the notes 
    let stave = this.sheet.staves[staveIndex]
    let notes = stave.notes;
    let n  = new Vex.Flow.StaveNote({clef: this.clef, keys: [noteName], duration });
    n.setAttribute("id",`${staveIndex}|${noteIndex}`);

    notes[noteIndex] = n;
    this.reDraw()
    

  }
  deleteNote(staveIndex,noteIndex){
    // convert the note into a rest 
    let stave = this.sheet.staves[staveIndex]
    let oldNote =  stave.notes[noteIndex];
    let n = new Vex.Flow.StaveNote({clef: this.clef, keys: [REST_POSITIONS[oldNote.duration]], duration: oldNote.duration+'r' });
    n.setAttribute("id",oldNote.id)
    stave.notes[noteIndex]= n;
    this.reDraw()
  }


  reDraw(){
    this.ctx.clear()
    this.sheet.staves.map((stave)=>{
      stave.setContext(this.ctx).draw();
      stave.voice  = new Vex.Flow.Voice({num_beats: 4,  beat_value: 4});
      stave.voice.addTickables(stave.notes);
      new Vex.Flow.Formatter().format([stave.voice], this.staveWidth);
      stave.voice.draw(this.ctx,stave);
    })
  }
  
  
  //  getMousePos(canvas, evt) {
  //   var rect = canvas.getBoundingClientRect();
  //     return {
  //       x: evt.clientX - rect.left,
  //       y: evt.clientY - rect.top
  //     };
  //   }

  //   isCursorInBoundingBox(bBox, cursorPos) {
  //     return cursorPos.x > bBox.getX() && cursorPos.x < bBox.getX() + bBox.getW() &&
  //            cursorPos.y > bBox.getY() && cursorPos.y < bBox.getY() + bBox.getH();
  //   }

  //   redrawMeasureWithCursorNote(event) {
  //     // get mouse position
  //     this.mousePos.current = getMousePos(this.svgElem, event);
    
  //     // get selected measure and note
  //     var vfStaveNote = getSelectedNote();
  //     var vfStave = getSelectedMeasure();
    
  //     // currently support only for replacing rest with a new note
  //     // building chords feature will be added soon
  //     if(!vfStaveNote.isRest()) return;
    
  //     // get column of selected note on stave
  //     var bb = vfStave.getBoundingBox();
  //     var begin = vfStaveNote.getNoteHeadBeginX() - 5;
  //     bb.setX(begin);
  //     bb.setW(vfStaveNote.getNoteHeadEndX() - begin + 5);
  //     // bb.setW(20);
  //     // bb.draw(this.ctx);
    
  //     // mouse cursor is within note column
  //     if(isCursorInBoundingBox(bb, this.mousePos.current) ) {
  //       // save mouse position
  //       this.mousePos.previous = this.mousePos.current;
  //       // get new note below mouse cursor
  //       this.selected.cursorNoteKey = getCursorNoteKey();
    
  //       this.svgElem.addEventListener('click', this.add.note, false); 
    
  //       // redraw only when cursor note changed pitch
  //       // (mouse changed y position between staff lines/spaces)
  //       if(this.lastCursorNote !== this.selected.cursorNoteKey) {
  //         // console.log(this.selected.cursorNoteKey);
  //         this.draw.selectedMeasure(true);
    
  //       }
  //       // save previous cursor note for latter comparison
  //       this.lastCursorNote = this.selected.cursorNoteKey;
  //     }
  //     // mouse cursor is NOT within note column
  //     else {
    
  //       this.svgElem.removeEventListener('click', this.add.note, false); 
    
  //       // mouse cursor just left note column(previous position was inside n.c.)
  //       if(isCursorInBoundingBox(bb, this.mousePos.previous) ) {
  //         // redraw measure to erase cursor note
  //         this.draw.selectedMeasure(false);
  //         this.mousePos.previous = this.mousePos.current;
  //         this.lastCursorNote = '';
  //       }
  //     }
    
  //   }
  
  
  


}

export default Editor;
