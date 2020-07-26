/* eslint-disable */





import Vex from "vexflow";
import * as lodash from "lodash";



const REST_POSITIONS = (key:string)=>{

switch(key){
  case "q":  return "b/4";
  case "h":  return "b/4";
  case "w": return "e/5";
  case "8": return "b/4";
  case "16":  return "b/4";
  case "32":  return "b/4";
  default: return "";
}
};

const NOTE_VAlUES =  (key:string)=>{
    switch(key){ 
  case "c": return 1;
  case "d": return 2;
  case "e": return 3;
  case "f": return 4;
  case "g": return 5;
  case "a": return 6;
  case "b": return 7;
  default: return 0;
    }
}

const DURATION_VALUES =  (key:string)=>{
  switch(key){ 
case "w": return 32;
case "h": return 16;
case "q": return 8;
case "8": return 4;
case "16": return 2;
case "32": return 1;
default: return 0;
  }
}

// types  
interface ed_note{
    clef: any; 
    duration : string,
    keys: string[],
    accidentals: ( string | null )[],
    dotted?: boolean;
    isRest: boolean,
    staveIndex: number,
    noteIndex: number
 }

 interface ed_stave{
     notes:ed_note[]
 }

 interface ed_sheet{
     staves: ed_stave[]
 }

 interface cursor{
     _staveIndex?: number,
     _noteIndex?: number,
     noteIndex: any,
     staveIndex:any
 }

interface ed_selected {
    _staves?: any[]
    _notes?: ed_note[],
    cursor: cursor,
    notes: ed_note[],
    staves: number[],
}

 interface ed_state {
     sheet: string,
     selected: string
 }



class Editor {
  //eslint-disable-next-line

  private keySig:string = "C";
  private timeSigTop: number = 4;
  private timeSigBottom: number = 4;
  private clef:string = "treble";
  private accidental:(string | null) = "";
  private staveWidth:number = 400;
  private staveHeight:number = 140;
  private noteWidth:number = 100;
  private dotted:boolean = false;
  private eventsAdded = false;
  private shiftActive = false;
  private ctrlActive = false;
  private metaActive = false;
  private svgElm:HTMLElement;
  private renderer:any;
  private ctx:Vex.Flow.CanvasContext;
  private  sheet: ed_sheet= { 
    staves: [] 
  }



  private  states:ed_state[]= [];
  private  undoStates:ed_state[] = []

  

  private  selected: ed_selected = {
    _staves: [] as ed_stave[],
    _notes:[{staveIndex: 0 , noteIndex: 0, keys:[REST_POSITIONS("q")], isRest: true, duration: "q" , accidentals:[] , clef: this.clef }] as ed_note[],
    cursor:{
      _staveIndex: 0,
      _noteIndex:0,

      set noteIndex(value:any){ this._noteIndex = parseInt(value)},
      get noteIndex(){
        return this._noteIndex},
      set staveIndex(value:any){ this._staveIndex = parseInt(value)},
      get staveIndex(){ 
        return this._staveIndex
      }

    },

    get notes(){
        return this._notes?.map(n=> {
          return {...n, staveIndex: n.staveIndex, noteIndex: n.noteIndex } })
          .sort((a,b)=> a.noteIndex - b.noteIndex) as  ed_note[]
    },

    set notes(value){
      if(!lodash.isArray(value)) this._notes = this._notes;
      else this._notes = value;
    },

    get staves(){
      return this._staves?.map(s=> parseInt(s))
    },

    set staves(value:any) {
        this._staves = value;
    }

  };

  mousePos:any = {
    previous:{
      x:0,
      y:0,
    },
    current:{
      x:0,
      y:0
    }
  };


  constructor(svgcontainer:HTMLElement) {
  
    this.svgElm = svgcontainer;
     this.renderer   = new Vex.Flow.Renderer(
        svgcontainer,
        Vex.Flow.Renderer.Backends.SVG
      );

     this.ctx = this.renderer.getContext();

    // event listerners

    // add first stave by default
    this.addStave();
    this.addStave();
    this.Draw();
    if (!this.eventsAdded) {
      this.addEventListeners(this.svgElm);
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
    const undoSate:any = this.undoStates.pop();
    this.sheet = JSON.parse(undoSate.sheet);
    this.selected = JSON.parse(undoSate.selected);

  }

  addStave(index = this.sheet.staves ? this.sheet.staves.length : 0) {
    this.sheet.staves = this.sheet.staves || [];
    
    // fill bar with rests

    let notes:ed_note[] = new Array(4).fill({keys:[REST_POSITIONS("q")] ,duration:"q",isRest:true})
                            .map((n,i)=> { return  {...n,accidentals:[null],staveIndex:index, noteIndex:i} })
    this.sheet.staves.splice(index, 0, {notes});
  }

  addNote(noteName:string) {
    // modify the rest of the stave to join the notes

    let notes = this.selected.notes;
    notes = notes.map((note:ed_note)=>{

    // if key arledy exists then don't add it again;


    let stave = this.sheet.staves[note.staveIndex];
    let isRest = note.isRest;
    let duration =  note.duration.replace('r','');
    let keys = isRest ? [noteName] :   lodash.uniq([...note.keys, noteName]);
    let accidentals =  note.accidentals ? [...note.accidentals, this.accidental]: this.accidental? [this.accidental] : [null];
   

    let newNote = {keys,duration,isRest:false,staveIndex:  note.staveIndex,noteIndex: note.noteIndex, accidentals, clef: note.clef};
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
    notes = notes.map((note:ed_note)=>{

    let stave = this.sheet.staves[note.staveIndex];
    let oldNote = stave.notes[note.noteIndex];
    let newNote:ed_note = {
      keys: [REST_POSITIONS(oldNote.duration)],
      duration: oldNote.duration,
      isRest:true,
      staveIndex:oldNote.staveIndex,
      noteIndex: oldNote.noteIndex,
      accidentals: [],
      clef: oldNote.clef
    }
    stave.notes[note.noteIndex] = newNote;
    this.sheet.staves[note.staveIndex] = stave;
    return newNote;
  })

  this.selected.notes = notes;

    
  }

  // note sorting fuction 

 private   compareNotes (noteA:string, noteB:String) {
    const toneA = noteA.charAt(0);
    const toneB = noteB.charAt(0);
    const octaveA = parseInt(noteA.charAt(1));
    const octaveB = parseInt(noteB.charAt(1));
  
    if (octaveA === octaveB) {
      // console.log('same octave');
      if ( NOTE_VAlUES(toneA) > NOTE_VAlUES(toneB)) {
        return 1;
      } else if ( toneA == toneB) {
        return 0;
      } else {
        return -1;
      }
    } else if (octaveA > octaveB) {
      return 1;
    } else {
      return -1;
    }
  }

  Draw() {
    this.ctx.clear();
    let staveXpos = 10;
    let staveWidth = 0;
    this.sheet.staves.map((s, staveIndex) => {

      
      staveXpos += staveWidth;
      staveWidth = this.noteWidth*(s.notes.length  < 4 ? 4 :  s.notes.length   );
      // drave the stave first , add timesignature
      let stave = new Vex.Flow.Stave(
        staveXpos,
        40,
        staveWidth 
      );
      (stave as unknown as HTMLElement).setAttribute("id", "vf-" + staveIndex);
    

      if(staveIndex === 0){
          stave.addTimeSignature("4/4");
          stave.addClef(this.clef);
      }

      stave.setContext(this.ctx).draw(); 

      //add selectable overlay
      (this.ctx as any).rect(stave.getX(), (stave as any).y , stave.getWidth(), this.staveHeight, {
        class: "vf-measureRect",
        id: "vf-" + staveIndex,
        fill: "transparent",
      });

      // draw the notes 

      let staveNotes =  s.notes.map(n=>{


       // sort notes according to keys
       n.accidentals = n.accidentals || [null];
       let keys = n.keys.map((k,i)=> {return { index:i, key: k, accidental: n.accidentals[i]  }})
       keys = keys.sort((a,b)=> this.compareNotes( a.key.split("/").join('') , b.key.split("/").join('') ) );

       let sortedKeys = keys.map(k=>k.key);
       let sortedAccidentals = keys.map(k=>k.accidental)

       console.log("unsorted",n.keys)
       console.log("sorted",sortedKeys)

     
       

       let  staveNote: Vex.Flow.StaveNote | any = new Vex.Flow.StaveNote({
          clef: this.clef,
          keys: sortedKeys,
          duration: !n.isRest? n.duration : n.duration+"r",
          auto_stem: true,
        });

        // add accidental 
        !n.isRest && sortedAccidentals.length && sortedAccidentals.map((accidental,index)=>{
          if(accidental)
          staveNote.addAccidental(index, new Vex.Flow.Accidental(accidental))
        })

        // add dot if dotted
        
        if (n.dotted){
            (staveNote as Vex.Flow.StaveNote).addDotToAll();
        }

        staveNote.setAttribute("id", `${n.staveIndex}__${n.noteIndex}`);
        return staveNote
       })
    
      
    
      let voice = new Vex.Flow.Voice({ num_beats: 4, beat_value: 4 });
      voice.addTickables(staveNotes);
      
      new Vex.Flow.Formatter().format([voice], staveWidth);
      voice.draw(this.ctx, stave);

    });

    // highlight the selected notes
    this.selected.notes.map((sn:ed_note)=>{
      let selectedNote:any = this.svgElm.querySelector(
        `#vf-${sn.staveIndex}__${
          sn.noteIndex
        }`
      );
      this._highlightNoteElement(selectedNote, "red");
    })


    this.selected.staves.map((staveIndex:number)=>{
      this._highlightStaveElement(
        this.svgElm.querySelector(
          `#vf-${staveIndex}`
        ),
        "lightblue"
      );
    })

    



  }

 private  _getSelectedElement(event:any) {
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

 private  _highlightNoteElement(ele:(HTMLElement | null), color:string = "black") {
    if (!ele) {
      console.warn("No element was passed");
      return;
    }
    ele.querySelectorAll("*").forEach((e:any) => {
      e.style.fill = color;
      e.style.stroke = color;
    });
  }

  // eslint-disable-next-line no-unused-vars
 private _highlightStaveElement(ele:any, color = "transparent") {
    ele.style.fill = color;
    ele.style.opacity = "0.4";
  }

  addEventListeners(svgElem:HTMLElement) {
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

  private _addtoSelectedNotes(note:ed_note){
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

  private _addtoSelectedStaves(stave:number){
    if(this.shiftActive){
      let staves = lodash.clone(this.selected.staves);
      staves.push(stave)
      staves = lodash.uniq( staves );
      this.selected.staves = staves;
    }
    else{
      this.selected.staves = [stave];
    }
  }

  getMousePos(canvas:HTMLElement, evt:MouseEvent) {
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
    let accidentals = selectedNote.accidentals;
    let isRest = selectedNote.isRest;
    let clef = selectedNote.clef;
    let newNotes = new Array(2).fill(null)
    // create a new duration

    switch(duration){
      case "w": duration = "2"; break;
      case "h": duration= "4"; break;
      case "q":  duration ="8"; break;
      case "8": duration = "16"; break;
      case "16": duration = "32"; break;
      default: return ;
    }

    newNotes = newNotes.map( () => { return {
      clef,
      keys,
      duration,
      isRest,
      accidentals

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



  // TODO:  handle case for merge which creates dotted notes 
  mergeNotes(){

      const newNote:ed_note = this.selected.notes.reduce((a:any,b:any)=>{

          let mergedDuration:string='';
          let mergedDurationValue: number =
            DURATION_VALUES(a.duration) + DURATION_VALUES(b.duration)
            let dotted = false;

          switch(mergedDurationValue){

          // cases for regular notes 

            case 2 : mergedDuration = "16"; break;
            case 4 : mergedDuration =  "8"; break;
            case 8 : mergedDuration = "q"; break;
            case 16: mergedDuration = "h"; break;
            case 32: mergedDuration = "w"; break;

          // handle cases for dotted notes 

          //dotted 16th note
          case 3: mergedDuration = "16" ; dotted = true; break;
          //dotted 8th note
          case 6: mergedDuration = "8"; dotted = true; break;
          // dotted quater ntoe 
          case 12: mergedDuration = "q"; dotted = true; break;
          // dotted half note  
          case 24: mergedDuration = "h"; dotted = true; break;
          

          }

         

          return {
            ...a,
            isRest: a.isREst || b.isRest,
            keys: !(a.isRest || b.isRest) ? [REST_POSITIONS(mergedDuration)] : lodash.uniq([...a.keys,...b.keys]),
            duration:mergedDuration,
            dotted,
        }
          
      })


      newNote.staveIndex =  this.selected.notes[0].staveIndex;
      newNote.noteIndex = this.selected.notes[0].noteIndex;

      this.sheet.staves[this.selected.notes[0].staveIndex].notes.splice(this.selected.notes[0].noteIndex,this.selected.notes.length,newNote)
      this.selected.notes = [newNote]


  }

  setCursor(staveIndex:number,noteIndex:number){
    this.selected.cursor ={
      staveIndex: staveIndex,
      noteIndex: noteIndex
    }
    let selectedNote = this.sheet.staves[staveIndex].notes[noteIndex]
    this._addtoSelectedNotes(selectedNote)
  }

  getCursorNote() {
      //TODO this is depricated;
    let staveIndex = this.selected.cursor.staveIndex;
    let noteIndex = this.selected.cursor.noteIndex;
    if (!staveIndex && noteIndex) return [];
    // find the mouse position and return the correct note for that position.
    var y= 0;
    var found;
    var cursorNoteKey;
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
          cursorNoteKey = notesArray[l] + (i + 1);
          found = true;
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

        case event.key === "j": {
          if(!event.ctrlKey) return;
          this.saveState()
          this.mergeNotes();
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
        case event.key === "Meta": this.metaActive = false; break;

      }

      document.addEventListener("keydown",(event)=>{
        switch(true){
        case event.key === "Control": this.ctrlActive = true; break;
        case event.key === "Shift": this.shiftActive = true; break;
        case event.key === "Meta": this.metaActive = true; break;
        }
      })

      
    });


  }
}

export default Editor;
