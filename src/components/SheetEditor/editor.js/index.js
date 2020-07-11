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
    this.addNote(this.sheet.staves[0],0,"c/4","q")
    this.addNote(this.sheet.staves[0],1,"c/4","q")
    this.deleteNote(this.sheet.staves[0],0)
    // this.addNote(this.sheet.staves[0],"c/4","q")
    //this.editNote(this.sheet.staves[0],1,"c/4","w")
  }

  

  addStave(index = this.sheet.staves ? this.sheet.staves.length : 0 ) {
    this.sheet.staves = this.sheet.staves ||  [];
    let stave = new Vex.Flow.Stave(10,40, this.staveWidth*(this.sheet.staves.length+1));
    stave.setAttribute("measureID",index)
    stave.addClef(this.clef).addTimeSignature("4/4");
    stave.notes = new Array(4).fill("q");

    // fill it up with rests 
    stave.notes =  stave.notes.map((d)=> { 
      return  new Vex.Flow.StaveNote({clef: this.clef, keys: [REST_POSITIONS[d]], duration:d+"r"})
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

  addNote(stave,index,note,duration){
    // modify the rest of the stave to join the notes 
    let notes = stave.notes;
    let n  = new Vex.Flow.StaveNote({clef: this.clef, keys: [note], duration });
    n.setAttribute("noteID",index);
    n.setAttribute("MeasureID",index);
    notes[index] = n;
    this.reDraw()
    

  }
  editNote(stave,noteIndex,note,newDuration){
    let newNote  = new Vex.Flow.StaveNote({clef: this.clef, keys: [note], duration: newDuration });
    stave.notes[noteIndex] = newNote;
    this.reDraw();


  }

  deleteNote(stave,index){
    // convert the note into a rest 
    let oldNote =  stave.notes[index];
    let n = new Vex.Flow.StaveNote({clef: this.clef, keys: [REST_POSITIONS[oldNote.duration]], duration: oldNote.duration+'r' });
    stave.notes[index]= n;
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
  
  


}

export default Editor;
