/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/class-name-casing */
import { concat } from "lodash";
import { PolySynth, now, Transport, start as startAudio } from "tone";
import { ed_note, ed_sheet, ed_stave } from "./models";

document.addEventListener("click", async () => {
  await startAudio();
  console.log("context started");
});

const DURATION_VALUES = (key: string) => {
  switch (key.toLocaleLowerCase()) {
    case "w":
      return "1n";
    case "h":
      return "2n";
    case "q":
      return "4n";
    case "8":
      return "8n";
    case "16":
      return "16n";
    case "32":
      return "32n";
    default:
      return 0;
  }
};

const synth = new PolySynth().toDestination();

function getToneNotes(notes: ed_note[]) {
  const tone_notes = notes.map((_note: ed_note) => {
    const accidentals = _note.accidentals.map(acc => acc?.replace("##", "x"));

    return {
      notes: _note.keys.map((k, i) => k.replace("/", accidentals[i] || "")),
      duration: DURATION_VALUES(_note.duration)
    };
  });
  return tone_notes;
}

export function playChord(_notes: ed_note[]) {
  return;
  const _now = now();
  const notesToPlay = getToneNotes(_notes);
  notesToPlay.map(n => {
    const { notes, duration } = n;
    synth.triggerAttackRelease(notes, duration, _now);
  });
}

// exact should be an exact replica of the sheet object in vexflow

interface au_seek {
  bar: number;
  beat: number;
  sixteenth: number;
  position: {
    current: number;
    total: number;
  };
}

export class AudioEngine {
  private bpm: number;
  private timeSig: number[];
  private _numTracks = 0;
  private _tracks: any = {};
  private notes: ed_note[];
  private animationID: any;
  private seekBar: au_seek;
  private _onProgress!: Function;

  constructor(
    sheet: ed_sheet,
    timeSig: string,
    BPM: number,
    onProgress: Function
  ) {
    this.seekBar = {
      bar: 0,
      beat: 0,
      sixteenth: 0,
      position: {
        current: 0,
        total: 0
      }
    };
    this.bpm = BPM || 120;
    this.notes = [];
    this.timeSig = [...timeSig.split("/")].map(sig => parseInt(sig));
    Transport.bpm.value = this.bpm;
    Transport.timeSignature = this.timeSig;
    this.updateTrack(sheet);
    Transport.on("stop", () => {
      console.log("transportEnded");
    });
    this._onProgress = onProgress;
  }

  _add() {
    this._tracks[this._numTracks] = [];
  }

  _getTime(staveIndex: number, noteIndex: number) {
    return `${staveIndex}:${noteIndex}:0`;
  }

  updateTrack(sheet: ed_sheet) {
    this.stop();
    this.notes = [];
    sheet.staves
      .map((stave: ed_stave) => stave.notes)
      .map((_notes: ed_note[]) => {
        this.notes = concat(this.notes, _notes);
      });
    const _notes = this.notes;

    const partNotes = _notes.map((note: ed_note) => {
      const { notes, duration } = getToneNotes([note])[0];

      const time = this._getTime(note.staveIndex, note.noteIndex);
      return { notes, time, duration, isRest: note.isRest };
    });

    for (let index = 0; index < partNotes.length; index++) {
      const pn = partNotes[index];
      Transport.schedule(time => {
        if (!pn.isRest) {
          synth.triggerAttackRelease(pn.notes, pn.duration, time);
        }
        this.seekBar = {
          bar: parseInt(pn.time.split(":")[0]),
          beat: parseInt(pn.time.split(":")[1]),
          sixteenth: parseInt(pn.time.split(":")[2]),
          position: {
            current: index,
            total: partNotes.length
          }
        };
      }, pn.time);
    }

    const start = partNotes[0].time;
    const end = partNotes[partNotes.length - 1].time;
    this.play(start, end);
  }
  progress() {
    // scale it between 0-1
    const progress =
      (this.seekBar.position.current + 1) / this.seekBar.position.total;
    console.log(progress * 100);
    this._onProgress && this._onProgress(this.seekBar);
    this.animationID = requestAnimationFrame(this.progress.bind(this));
  }
  play(start: string, end: string) {
    Transport.loopStart = start;
    Transport.loopEnd = end;
    Transport.start();
    this.animationID = requestAnimationFrame(this.progress.bind(this));
  }
  stop() {
    Transport.stop();
    Transport.cancel();
    cancelAnimationFrame(this.animationID);
  }
}
