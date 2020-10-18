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
        updateTrack(sheet:ed_sheet){
                this.notes = [];
                let _now = now();
                sheet.staves
                .map((stave:ed_stave)=>stave.notes)
                .map((_notes:ed_note[])=>  { this.notes = concat( this.notes ,_notes) } );
                const _notes = this.notes;

                
                
                
                let t =  Transport.now();                     
                const partNotes =   _notes.map((note: ed_note,i:number)=>{

                        const {notes ,duration} = getToneNotes([note])[0];
                 
                           const notesToPlay =    notes.map((_note)=>{
                                const n = {"time" : t , "note" : _note  , "velocity":  note.isRest? 0 :   0.5 , duration }
                                return n;
                                })

                                
                                
                                return {notesToPlay, time : t};
                                
                       })
                       
                                console.log(t);
                                t += Time(t).toMilliseconds();
                                             
                                            
                                               
                partNotes.map(pn=>{
                        new Part(function(time, value){
                                //the value is an object which contains both the note and the velocity
                                
                                synth.triggerAttackRelease(value.note, value.duration, '' , value.velocity);
                        }, pn).start(0);
                })

                Transport.start();
                
         }

}