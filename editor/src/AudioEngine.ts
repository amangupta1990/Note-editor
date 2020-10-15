import { split } from "lodash";
import {PolySynth , now, Part } from "tone";
import {ed_note,
        ed_selected_note,
        ed_beam,
        ed_selected,
        ed_sheet,
        ed_state,
        ed_stave,
        ed_tie
        } from './models'


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

class AudioEngine {
        
        private _numTracks:number = 0;
        private _tracks:any = {};

        constructor(){
        }

         add(){
                this._tracks[this._numTracks] = []
        }
         updateTrack(staves:ed_stave){

         }

}