/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/class-name-casing */
import { concat } from "lodash";
import { PolySynth, now, Transport, start as startAudio, Time } from "tone";
import { ed_note, ed_sheet, ed_stave, au_seek } from "../../../shared/models";

document.addEventListener("click", async () => {
  await startAudio();
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
      duration: DURATION_VALUES(_note.duration),
      dotted: _note.dotted,
      beat: _note.beat,
      subDivision: _note.subDivision
    };
  });
  return tone_notes;
}

export function playChord(_notes: ed_note[]) {
  const _now = now();
  const notesToPlay = getToneNotes(_notes);
  notesToPlay.map(n => {
    const { notes, duration } = n;
    synth.triggerAttackRelease(notes, duration, _now);
  });
}

// exact should be an exact replica of the sheet object in vexflow

export class AudioEngine {
  private bpm: number;
  private _isPlaying: boolean;
  private _isPaused: boolean;
  private timeSig: number[];
  private _numTracks = 0;
  private _tracks: any = {};
  private _startTime: string;
  private _endTime: string;
  private notes: ed_note[];
  private animationID: any;
  private seekBar: au_seek;
  private _onProgress: Function;
  private _onPlayEnd: Function;
  private loop: boolean;

  constructor(
    sheet: ed_sheet,
    timeSig: string,
    BPM: number,
    onProgress: Function,
    onPlayEnd: Function
  ) {
    this._onProgress = onProgress;
    this._onPlayEnd = onPlayEnd;
    this._isPlaying = false;
    this._isPaused = false;
    this.loop = false;
    this.seekBar = {
      bar: 0,
      beat: 0,
      sixteenth: 0,
      position: {
        currentNote: 0,
        currentBar: 0,
        totalBars: 0,
        total: 0
      }
    };
    this.bpm = BPM || 120;
    this.notes = [];
    this.timeSig = [...timeSig.split("/")].map(sig => parseInt(sig));
    Transport.bpm.value = this.bpm;
    Transport.timeSignature = this.timeSig;
    this._startTime = this._endTime = "";
    this.updateTrack(sheet);
  }

  _add() {
    this._tracks[this._numTracks] = [];
  }

  _getTime(staveIndex: number, beat: number, subDivision: number) {
    return `${staveIndex}:${beat}:${subDivision}`;
  }

  updateTrack(sheet: ed_sheet) {
    if (this._isPlaying) return;
    Transport.stop();
    Transport.cancel("0:0:0");
    this.notes = [];
    sheet.staves
      .map((stave: ed_stave) => stave.notes)
      .map((_notes: ed_note[]) => {
        this.notes = concat(this.notes, _notes);
      });
    const _notes = this.notes;

    const partNotes = _notes.map((note: ed_note) => {
      const { notes, duration, beat, subDivision, dotted } = getToneNotes([
        note
      ])[0];

      const time = this._getTime(note.staveIndex, beat, subDivision);
      return {
        notes,
        time,
        duration,
        dotted,
        isRest: note.isRest
      };
    });

    for (let index = 0; index < partNotes.length; index++) {
      const pn = partNotes[index];
      Transport.schedule(time => {
        if (!pn.isRest) {
          console.log(pn);

          // caulculate duration taking dotted note into account
          const duration = Time(
            (pn.duration as string) + (pn.dotted ? "." : "")
          ).toNotation();
          synth.triggerAttackRelease(pn.notes, duration, time);
        }
        this.seekBar = {
          bar: parseInt(pn.time.split(":")[0]),
          beat: parseInt(pn.time.split(":")[1]),
          sixteenth: parseInt(pn.time.split(":")[2]),
          position: {
            currentNote: index,
            currentBar: parseInt(pn.time.split(":")[0]),
            totalBars: Math.floor(partNotes.length / this.timeSig[1]),
            total: partNotes.length
          }
        };
      }, pn.time);
    }

    this._startTime = this._startTime || "0:0:0";
    this._endTime = `${partNotes.length / this.timeSig[0]}:0:0`;
  }
  progress() {
    // scale it between 0-1
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    if (this._isPlaying) {
      this._onProgress && this._onProgress(this.seekBar);
      this.animationID = requestAnimationFrame(this.progress.bind(this));
    }

    if (
      this.seekBar.position.currentNote === this.seekBar.position.total - 1 &&
      this._isPlaying &&
      !this.loop
    ) {
      this.stop();
    }
  }
  play() {
    this._isPlaying = true;
    // resume if paused

    Transport.loopStart = this._startTime;
    Transport.loopEnd = this._endTime;
    Transport.start(now(), this._startTime);
    this.animationID = requestAnimationFrame(this.progress.bind(this));
  }
  stop() {
    cancelAnimationFrame(this.animationID);
    this._isPlaying = false;
    Transport.stop();
    this._onProgress && this._onProgress(this.seekBar);
    this._onPlayEnd && this._onPlayEnd();
    this.seekBar.position.currentNote = 0;
    this._startTime = "0:0:0";
  }
  pause() {
    this._isPlaying = false;
    this._isPaused = true;
    Transport.pause();
    cancelAnimationFrame(this.animationID);
    this._startTime = `${this.seekBar.bar}:0:0`;
  }
  toggleLoop(toggle: boolean) {
    this.loop = toggle;
    Transport.loop = toggle;
  }

  setStart(bar: number) {
    this._startTime = `${bar}:0:0`;
  }
}
