import { concat, flatten } from "lodash";
import {PolySynth , now  , Transport, Part, start as startAudio, TransportTime, Time, } from "tone";
import { Tone } from "tone/build/esm/core/Tone";
import {ed_note,
        ed_selected_note,
        ed_beam,
        ed_selected,
        ed_sheet,
        ed_state,
        ed_stave,
        ed_tie
        } from './models'


        document.addEventListener("click", async () => {
                
                await startAudio();
                console.log("context started");
            });

        const DURATION_VALUES =  (key:string)=>{
                switch(key.toLocaleLowerCase()){ 
              case "w": return '1n';
              case "h": return '2n';
              case "q": return '4n';
              case "8": return '8n';
              case "16": return '16n';
              case "32": return '32n';
              default: return 0;
                }
              }

const synth = new PolySynth().toDestination();

function getToneNotes(notes:ed_note[]){
      
        const tone_notes = (notes).map((_note:ed_note, i:number)=> {
                const accidentals = _note.accidentals.map(acc=> acc?.replace("##","x"));
                
                return {
                        notes: _note.keys.map((k,i)=> k.replace("/",accidentals[i] || '') ),
                        duration: DURATION_VALUES(_note.duration)
                }
          })
          return tone_notes;
        }

export function playChord(_notes:ed_note[]) {
        return
        const _now = now()
        const notesToPlay = getToneNotes(_notes);
        notesToPlay.map(n=>{
                const { notes , duration } = n;
                synth.triggerAttackRelease(notes, duration, _now)

        })
        
    

}

// exact should be an exact replica of the sheet object in vexflow 


interface au_track  {
        
}

export class  AudioEngine {
        
        private bpm: number;
        private timeSig : number [];
        private _numTracks:number = 0;
        private _tracks:any = {}; 
        private notes: ed_note[];

        constructor(sheet:ed_sheet, timeSig: string,  BPM : number ,){
                this.bpm = BPM || 120 ;
                this.notes = [];
                this.timeSig = [ ... timeSig.split("/")].map((sig=> parseInt(sig)));
                Transport.bpm.value = this.bpm;
                Transport.timeSignature = this.timeSig;
                this.updateTrack(sheet);
                Transport.on('stop',()=>{
                        console.log('transportEnded')
                })


                
        }

        _add(){
                this._tracks[this._numTracks] = []
        }

        _getTime(staveIndex: number, noteIndex: number , duration: string){
                
                
                return `${staveIndex}:${noteIndex}:0`;
                

        }

        updateTrack(sheet:ed_sheet){
                Transport.stop();
                Transport.cancel();
                this.notes = [];
                sheet.staves
                .map((stave:ed_stave)=>stave.notes)
                .map((_notes:ed_note[])=>  { this.notes = concat( this.notes ,_notes) } );
                const _notes = this.notes;

                
                                  
                const partNotes =   _notes.map((note: ed_note,i:number)=>{

                        const {notes ,duration} = getToneNotes([note])[0];
                 
                
                                const time = this._getTime(note.staveIndex, note.noteIndex, note.duration  )
                                return { notes, time , duration , isRest : note.isRest};
                                
                       })
                       

                                             
                                            
                for (const pn of partNotes) {
                        Transport.schedule((time) => {
                                if(!pn.isRest)
                                synth.triggerAttackRelease(pn.notes, pn.duration ,time);
                        }, pn.time);
                }                      
       
                Transport.start();
                
         }

}