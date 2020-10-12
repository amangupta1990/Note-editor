import * as Tone from "tone";

const synth = new Tone.PolySynth().toDestination();

export function playChord(notes:string[]){

    

        const now = Tone.now()
        synth.triggerAttackRelease(notes, "8n", now)

    
    

}