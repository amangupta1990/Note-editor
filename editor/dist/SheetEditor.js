"use strict";
/* eslint-disable */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var vexflow_1 = __importDefault(require("vexflow"));
var lodash = __importStar(require("lodash"));
var tonal_1 = require("@tonaljs/tonal");
var AudioEngine_1 = require("./AudioEngine");
var REST_POSITIONS = function (key) {
    switch (key) {
        case "q": return "b/4";
        case "h": return "b/4";
        case "w": return "e/5";
        case "8": return "b/4";
        case "16": return "b/4";
        case "32": return "b/4";
        default: return "";
    }
};
var NOTE_VAlUES = function (key) {
    switch (key) {
        case "c": return 1;
        case "d": return 2;
        case "e": return 3;
        case "f": return 4;
        case "g": return 5;
        case "a": return 6;
        case "b": return 7;
        default: return 0;
    }
};
var DURATION_VALUES = function (key) {
    switch (key) {
        case "w": return 32;
        case "h": return 16;
        case "q": return 8;
        case "8": return 4;
        case "16": return 2;
        case "32": return 1;
        default: return 0;
    }
};
;
var Editor = /** @class */ (function () {
    function Editor(svgcontainer, opts) {
        this.keySig = "C";
        this.timeSigTop = 4;
        this.timeSigBottom = 4;
        this.clef = "treble";
        this.accidental = "";
        this.mode = "note";
        this.staveWidth = 400;
        this.staveHeight = 140;
        this.noteWidth = 100;
        this.dotted = false;
        this.eventsAdded = false;
        this.shiftActive = false;
        this.ctrlActive = false;
        this.metaActive = false;
        this.sheet = {
            staves: [],
            ties: [],
            beams: []
        };
        this.states = [];
        this.undoStates = [];
        this.selected = {
            _staves: [],
            _notes: [{ staveIndex: 0, noteIndex: 0 }],
            cursor: {
                _staveIndex: 0,
                _noteIndex: 0,
                set noteIndex(value) { this._noteIndex = parseInt(value); },
                get noteIndex() {
                    return this._noteIndex;
                },
                set staveIndex(value) { this._staveIndex = parseInt(value); },
                get staveIndex() {
                    return this._staveIndex;
                }
            },
            get notes() {
                var _a;
                return (_a = this._notes) === null || _a === void 0 ? void 0 : _a.map(function (n) {
                    return __assign(__assign({}, n), { staveIndex: n.staveIndex, noteIndex: n.noteIndex });
                });
            },
            set notes(value) {
                if (!lodash.isArray(value))
                    this._notes = this._notes;
                else {
                    var sortedNotes = value.sort(function (a, b) { return a.noteIndex - b.noteIndex; });
                    this._notes = sortedNotes;
                }
            },
            get staves() {
                var _a;
                return (_a = this._staves) === null || _a === void 0 ? void 0 : _a.map(function (s) { return parseInt(s); });
            },
            set staves(value) {
                this._staves = value;
            }
        };
        this.mousePos = {
            previous: {
                x: 0,
                y: 0,
            },
            current: {
                x: 0,
                y: 0
            }
        };
        var time = opts === null || opts === void 0 ? void 0 : opts.timeSig.split("/");
        this.timeSigTop = time ? parseInt(time[0]) : this.timeSigTop;
        this.timeSigBottom = time ? parseInt(time[1]) : this.timeSigBottom;
        this.keySig = (opts === null || opts === void 0 ? void 0 : opts.key) || this.keySig;
        this.svgElm = svgcontainer;
        this.onError = opts === null || opts === void 0 ? void 0 : opts.errorHandler;
        this.onRender = opts === null || opts === void 0 ? void 0 : opts.onRender;
        this.onNoteSelected = opts === null || opts === void 0 ? void 0 : opts.onNoteSelected;
        this.onStaveSelected = opts === null || opts === void 0 ? void 0 : opts.onStaveSelected;
        this.renderer = new vexflow_1.default.Flow.Renderer(svgcontainer, vexflow_1.default.Flow.Renderer.Backends.SVG);
        this.ctx = this.renderer.getContext();
        // event listerners
        // add first stave by default
        this.addStave();
        if (!this.eventsAdded) {
            this.addEventListeners(this.svgElm);
            this.addKeyboardListeners();
            this.eventsAdded = true;
        }
        this.Draw();
    }
    Editor.prototype.saveState = function () {
        var sheet = JSON.stringify(this.sheet);
        var selected = JSON.stringify(this.selected);
        this.states.push({ sheet: sheet, selected: selected });
        console.log("state saved", this.states);
    };
    Editor.prototype.undo = function () {
        if (!this.states.length)
            return;
        var currState = {
            sheet: JSON.stringify(this.sheet),
            selected: JSON.stringify(this.selected)
        };
        this.undoStates.push(currState);
        var previousState = this.states.pop();
        if (previousState) {
            this.sheet = JSON.parse(previousState.sheet);
            this.selected = JSON.parse(previousState.selected);
            this.Draw();
        }
    };
    Editor.prototype.redo = function () {
        if (!this.undoStates.length)
            return;
        this.saveState();
        var undoSate = this.undoStates.pop();
        this.sheet = JSON.parse(undoSate.sheet);
        this.selected = JSON.parse(undoSate.selected);
    };
    Editor.prototype.addStave = function (index) {
        if (index === void 0) { index = this.sheet.staves ? this.sheet.staves.length : 0; }
        this.sheet.staves = this.sheet.staves || [];
        // fill bar with rests
        var durationValue = this.timeSigBottom == 4 ? "q" : "8";
        var notes = new Array(this.timeSigTop).fill({ keys: [REST_POSITIONS(durationValue)], duration: durationValue, isRest: true })
            .map(function (n, i) { return __assign(__assign({}, n), { accidentals: [null], staveIndex: index, noteIndex: i }); });
        this.sheet.staves.splice(index, 0, { notes: notes });
    };
    Editor.prototype.setMode = function (mode) {
        this.mode = mode;
    };
    Editor.prototype.addNote = function (noteName, accidental) {
        // modify the rest of the stave to join the notes
        var _this = this;
        var notes = this.selected.notes;
        notes = notes.map(function (selectedNote) {
            var staveIndex = selectedNote.staveIndex;
            var noteIndex = selectedNote.noteIndex;
            var note = _this.sheet.staves[staveIndex].notes[noteIndex];
            // if key arledy exists then don't add it again;
            var noteToAdd;
            if (noteName.indexOf("/") == -1) {
                var currOctave = note.keys.map(function (k) { return parseInt(k.split("/")[1]); }).sort(function (a, b) { return b - a; })[0];
                var currentKey = note.keys.map(function (k) { return (k.split("/")[0]); }).sort()[0];
                var oct = noteName <= currentKey ? currOctave + 1 : currOctave;
                noteToAdd = noteName + "/" + oct;
            }
            else {
                noteToAdd = noteName;
            }
            var stave = _this.sheet.staves[note.staveIndex];
            var isRest = note.isRest;
            var duration = note.duration.replace('r', '');
            var keys = isRest ? [noteToAdd] : lodash.uniq(__spread(note.keys, [noteToAdd]));
            var accidentals = note.accidentals ? __spread(note.accidentals, [accidental || _this.accidental]) : accidental || _this.accidental ? [accidental || _this.accidental] : [null];
            var newNote = { keys: keys, duration: duration, isRest: false, staveIndex: note.staveIndex, noteIndex: note.noteIndex, accidentals: accidentals, clef: note.clef, dotted: note.dotted };
            stave.notes[note.noteIndex] = newNote;
            _this.sheet.staves[note.staveIndex] = stave;
            return newNote;
        });
        this.selected.notes = notes;
        // play the notes:
        return notes;
    };
    Editor.prototype.playback = function (notes) {
        var tone_notes = (notes).map(function (n, i) { return n.keys.map(function (k) {
            var accidental = n.accidentals[i] || '';
            var _a = __read(k.split("/"), 2), note = _a[0], oct = _a[1];
            return "" + note + accidental + oct;
        }); });
        tone_notes.map(function (tn) { return AudioEngine_1.playChord(tn); });
    };
    Editor.prototype.addChord = function (tonic, chord) {
        var _this = this;
        this.deleteNotes();
        var tone_chords = [];
        var _chord = tonal_1.Chord.getChord(chord, tonic + "4");
        var root = _chord.tonic;
        _chord.intervals.map(function (interval, index) {
            var n = tonal_1.Note.transpose(root, interval);
            var _a = __read(n.split(/(?=[0-9])/g), 2), _note = _a[0], octave = _a[1];
            var _b = __read(_note.split(''), 2), note = _b[0], accidental = _b[1];
            _this.addNote(note + "/" + octave, accidental);
            tone_chords.push("" + note + octave);
        });
        this.Draw();
        AudioEngine_1.playChord(tone_chords);
    };
    Editor.prototype.tieNotes = function () {
        var getId = function (a, b) {
            return "" + a.staveIndex + b.staveIndex + "_" + a.noteIndex + b.noteIndex;
        };
        var ties = [];
        if (this.selected.notes.length <= 1) {
            this.throwError("a tie must be between two notes atleast");
            return;
        }
        // if a tie already exists then remove it 
        for (var i = 0; i < this.selected.notes.length - 1; i++) {
            ties.push({
                id: getId(this.selected.notes[i], this.selected.notes[i + 1]),
                first_note: this.selected.notes[i],
                last_note: this.selected.notes[i + 1],
                first_indices: [0],
                last_indices: [0]
            });
        }
        var existingTies = this.sheet.ties.filter(function (st) { return ties.find(function (t) { return t.id === st.id; }) != null; });
        if (existingTies.length) {
            this.sheet.ties = this.sheet.ties.filter(function (t) { return existingTies.find(function (et) { return et.id === t.id; }) == null; });
        }
        else {
            var concatedTies = lodash.concat(this.sheet.ties, ties);
            this.sheet.ties = concatedTies;
        }
    };
    // note editing functions 
    Editor.prototype.changeOctave = function (octave, keyNote) {
        var _this = this;
        this.selected.notes.map(function (selectedNote) {
            var staveIndex = selectedNote.staveIndex;
            var noteIndex = selectedNote.noteIndex;
            var keyIndex = _this.sheet.staves[staveIndex].notes[noteIndex].keys.indexOf(keyNote);
            var note = _this.sheet.staves[staveIndex].notes[noteIndex].keys[keyIndex];
            if (!note) {
                _this.throwError("note not found");
                return;
            }
            var _a = __read(note.split("/"), 2), upper = _a[0], lower = _a[1];
            var newNote = upper + "/" + (parseInt(lower) + octave);
            // replace the note 
            _this.sheet.staves[staveIndex].notes[noteIndex].keys[keyIndex] = newNote;
        });
    };
    Editor.prototype.replaceNote = function (currentNote, newNote) {
        var _this = this;
        this.selected.notes.map(function (selectedNote) {
            var staveIndex = selectedNote.staveIndex;
            var noteIndex = selectedNote.noteIndex;
            var keyIndex = _this.sheet.staves[staveIndex].notes[noteIndex].keys.indexOf(currentNote);
            var note = _this.sheet.staves[staveIndex].notes[noteIndex].keys[keyIndex];
            if (!note) {
                _this.throwError("note not found");
                return;
            }
            // replace the note 
            _this.sheet.staves[staveIndex].notes[noteIndex].keys[keyIndex] = newNote;
        });
    };
    Editor.prototype.changeaccidental = function (key, accidental) {
        // check if accidental type is invalid
        var _this = this;
        switch (true) {
            case accidental === "n":
            case accidental === "b":
            case accidental === "bb":
            case accidental === "#":
            case accidental === "##":
            case accidental === null: break;
            default: {
                this.throwError("incorrect accidnetal value");
                return;
            }
        }
        this.selected.notes.map(function (selectedNote) {
            var staveIndex = selectedNote.staveIndex;
            var noteIndex = selectedNote.noteIndex;
            var keyIndex = _this.sheet.staves[staveIndex].notes[noteIndex].keys.indexOf(key);
            var accidentalIndex = keyIndex;
            var note = _this.sheet.staves[staveIndex].notes[noteIndex].keys[keyIndex];
            if (!note) {
                _this.throwError("note not found");
                return;
            }
            // replace the note 
            _this.sheet.staves[staveIndex].notes[noteIndex].accidentals[accidentalIndex] = accidental;
        });
    };
    Editor.prototype.deleteNotes = function () {
        var _this = this;
        // convert the note into a rest
        var notes = this.selected.notes;
        notes = notes.map(function (note) {
            var stave = _this.sheet.staves[note.staveIndex];
            var oldNote = stave.notes[note.noteIndex];
            var newNote = {
                keys: [REST_POSITIONS(oldNote.duration)],
                duration: oldNote.duration,
                isRest: true,
                staveIndex: oldNote.staveIndex,
                noteIndex: oldNote.noteIndex,
                accidentals: [],
                clef: oldNote.clef
            };
            stave.notes[note.noteIndex] = newNote;
            _this.sheet.staves[note.staveIndex] = stave;
            return newNote;
        });
        this.selected.notes = notes;
    };
    // note sorting fuction 
    Editor.prototype.compareNotes = function (noteA, noteB) {
        var toneA = noteA.charAt(0);
        var toneB = noteB.charAt(0);
        var octaveA = parseInt(noteA.charAt(1));
        var octaveB = parseInt(noteB.charAt(1));
        if (octaveA === octaveB) {
            // console.log('same octave');
            if (NOTE_VAlUES(toneA) > NOTE_VAlUES(toneB)) {
                return 1;
            }
            else if (toneA == toneB) {
                return 0;
            }
            else {
                return -1;
            }
        }
        else if (octaveA > octaveB) {
            return 1;
        }
        else {
            return -1;
        }
    };
    Editor.prototype.Draw = function () {
        var _this = this;
        try {
            this.ctx.clear();
            var staveXpos_1 = 10;
            var staveWidth_1 = 0;
            // increase the width of the svg element to fit staves
            this.svgElm.style.width = "" + (this.sheet.staves.length) * (this.timeSigTop * 200);
            var renderedStaves_1 = this.sheet.staves.map(function (s, staveIndex) {
                staveXpos_1 += staveWidth_1;
                staveWidth_1 = _this.noteWidth * (s.notes.length < _this.timeSigBottom ? _this.timeSigBottom : s.notes.length);
                // drave the stave first , add timesignature
                var stave = new vexflow_1.default.Flow.Stave(staveXpos_1, 40, staveWidth_1);
                stave.setAttribute("id", "vf-" + staveIndex);
                if (staveIndex === 0) {
                    stave.addTimeSignature(_this.timeSigTop + "/" + _this.timeSigBottom);
                    stave.addClef(_this.clef);
                    stave.addKeySignature(lodash.capitalize(_this.keySig));
                }
                stave.setContext(_this.ctx).draw();
                //add selectable overlay
                _this.ctx.rect(stave.getX(), stave.y, stave.getWidth(), _this.staveHeight, {
                    class: "vf-measureRect",
                    id: "vf-" + staveIndex,
                    fill: "transparent",
                });
                // draw the notes 
                var renderedNotes = s.notes.map(function (n) {
                    // sort notes according to keys
                    n.accidentals = n.accidentals || [null];
                    var keys = n.keys.map(function (k, i) { return { index: i, key: k, accidental: n.accidentals[i] }; });
                    keys = keys.sort(function (a, b) { return _this.compareNotes(a.key.split("/").join(''), b.key.split("/").join('')); });
                    var sortedKeys = keys.map(function (k) { return k.key; });
                    var sortedAccidentals = keys.map(function (k) { return k.accidental; });
                    var staveNote = new vexflow_1.default.Flow.StaveNote({
                        clef: _this.clef,
                        keys: sortedKeys,
                        duration: !n.isRest ? n.duration : n.duration + "r",
                        auto_stem: true,
                    });
                    // add accidental 
                    !n.isRest && sortedAccidentals.length && keys.map(function (accidental, index) {
                        if (sortedAccidentals[index])
                            staveNote.addAccidental(index, new vexflow_1.default.Flow.Accidental(sortedAccidentals[index]));
                    });
                    // add dot if dotted
                    if (n.dotted) {
                        staveNote.addDotToAll();
                    }
                    staveNote.setAttribute("id", n.staveIndex + "__" + n.noteIndex);
                    return staveNote;
                });
                //automatic beaming 
                var formatter = new vexflow_1.default.Flow.Formatter();
                var notes = renderedNotes;
                var voice = new vexflow_1.default.Flow.Voice({ num_beats: _this.timeSigTop, beat_value: _this.timeSigBottom, resolution: vexflow_1.default.Flow.RESOLUTION }).setMode(renderedNotes.length);
                voice.addTickables(notes);
                formatter.joinVoices([voice]).formatToStave([voice], stave);
                var beams = vexflow_1.default.Flow.Beam.generateBeams(notes, {
                    beam_rests: true,
                    beam_middle_only: true
                });
                voice.draw(_this.ctx, stave);
                beams.map(function (b) { return b.setContext(_this.ctx).draw(); });
                return {
                    notes: renderedNotes
                };
            });
            var ties = this.sheet.ties.map(function (t) {
                return new vexflow_1.default.Flow.StaveTie({
                    first_note: renderedStaves_1[t.first_note.staveIndex].notes[t.first_note.noteIndex],
                    last_note: renderedStaves_1[t.last_note.staveIndex].notes[t.last_note.noteIndex],
                    first_indices: t.first_indices,
                    last_indices: t.last_indices
                });
            });
            ties.map(function (t) { t.setContext(_this.ctx).draw(); });
            // highlight the selected notes
            this.selected.notes.map(function (sn) {
                var selectedNote = _this.svgElm.querySelector("#vf-" + sn.staveIndex + "__" + sn.noteIndex);
                _this._highlightNoteElement(selectedNote, "red");
            });
            this.selected.staves.map(function (staveIndex) {
                _this._highlightStaveElement(_this.svgElm.querySelector("#vf-" + staveIndex), "lightblue");
            });
        }
        catch (e) {
            this.throwError(e.message);
            this.undo();
        }
    };
    Editor.prototype._getSelectedElement = function (event) {
        try {
            var ele = event.target;
            while (ele.classList.value.indexOf("vf-stavenote") < 0 &&
                ele.classList.value.indexOf("vf-measureRect") < 0) {
                ele = ele.parentElement;
            }
            // prevent the cursor note form getting selected
            var id = ele.id;
            if (id.indexOf("auto") > -1)
                return [];
            id = id.split("-")[1].split("__");
            // return an element only if there is a valid id selected
            return __spread([
                ele,
                ele.classList.value.indexOf("vf-stavenote") > -1 ? "note" : "stave"
            ], id);
        }
        catch (e) {
            console.error(e);
        }
    };
    Editor.prototype._highlightNoteElement = function (ele, color) {
        if (color === void 0) { color = "black"; }
        if (!ele) {
            console.warn("No element was passed");
            return;
        }
        ele.querySelectorAll("*").forEach(function (e) {
            e.style.fill = color;
            e.style.stroke = color;
        });
    };
    // eslint-disable-next-line no-unused-vars
    Editor.prototype._highlightStaveElement = function (ele, color) {
        if (color === void 0) { color = "transparent"; }
        ele.style.fill = color;
        ele.style.opacity = "0.4";
    };
    Editor.prototype.addEventListeners = function (svgElem) {
        // helper function for finding the selected element:
        var _this = this;
        svgElem.addEventListener("click", function (event) {
            event.preventDefault();
            // eslint-disable-next-line no-unused-vars
            var _a = __read(_this._getSelectedElement(event), 4), ele = _a[0], type = _a[1], staveIndex = _a[2], noteIndex = _a[3];
            switch (type) {
                case "note": {
                    //  
                    _this.selected.cursor.staveIndex = staveIndex;
                    _this.selected.cursor.noteIndex = noteIndex;
                    _this._addtoSelectedNotes(_this.sheet.staves[staveIndex].notes[noteIndex]);
                    break;
                }
                case "stave": {
                    _this._addtoSelectedStaves(staveIndex);
                    break;
                }
            }
            _this.Draw();
        }, false);
        svgElem.addEventListener("blur", function () {
            _this.Draw();
        });
    };
    // Methods for drawing cursor note
    Editor.prototype._addtoSelectedNotes = function (note) {
        var _this = this;
        if (this.shiftActive) {
            var notes_1 = lodash.clone(this.selected.notes);
            notes_1.push(note);
            notes_1 = lodash.uniq(notes_1);
            this.selected.notes = notes_1;
        }
        else {
            this.selected.notes = [note];
        }
        // get the xy of the ntoes and output them 
        var notes = this.selected.notes.map(function (sn) {
            var ele = _this.svgElm.querySelector("#vf-" + sn.staveIndex + "__" + sn.noteIndex);
            var bbox = ele === null || ele === void 0 ? void 0 : ele.getBBox();
            return __assign(__assign({}, sn), { x: bbox.x, y: bbox.y });
        });
        this.onNoteSelected && this.onNoteSelected(notes);
    };
    Editor.prototype._addtoSelectedStaves = function (stave) {
        if (this.shiftActive) {
            var staves = lodash.clone(this.selected.staves);
            staves.push(stave);
            staves = lodash.uniq(staves);
            this.selected.staves = staves;
        }
        else {
            this.selected.staves = [stave];
        }
        this.onStaveSelected && this.onStaveSelected(this.selected.staves);
    };
    Editor.prototype.getMousePos = function (canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top,
        };
    };
    Editor.prototype.splitSelectedNote = function () {
        var stave = this.sheet.staves[this.selected.cursor.staveIndex];
        var notes = stave.notes;
        var selectedNote = stave.notes[this.selected.cursor.noteIndex];
        var duration = selectedNote.duration.replace('r', '');
        var keys = selectedNote.keys;
        var accidentals = selectedNote.accidentals;
        var isRest = selectedNote.isRest;
        var clef = selectedNote.clef;
        var newNotes = new Array(2).fill(null);
        // create a new duration
        switch (duration) {
            case "w":
                duration = "h";
                break;
            case "h":
                duration = "q";
                break;
            case "q":
                duration = "8";
                break;
            case "8":
                duration = "16";
                break;
            case "16":
                duration = "32";
                break;
            default: return;
        }
        newNotes = newNotes.map(function () {
            return {
                clef: clef,
                keys: keys,
                duration: duration,
                isRest: isRest,
                accidentals: accidentals
            };
        });
        notes.splice.apply(notes, __spread([this.selected.cursor.noteIndex, 1], newNotes));
        stave.notes = notes;
        this._remapIds();
        // this.setCursor(this.selected.cursor.staveIndex,this.selected.cursor.noteIndex+1);
    };
    Editor.prototype._remapIds = function () {
        var staves = this.sheet.staves.map(function (stave, staveIndex) {
            var notes = stave.notes.map(function (note, noteIndex) {
                note.staveIndex = staveIndex;
                note.noteIndex = noteIndex;
                return note;
            });
            stave.notes = notes;
            return stave;
        });
        this.sheet.staves = staves;
    };
    // TODO:  handle case for merge which creates dotted notes 
    Editor.prototype.mergeNotes = function () {
        var _this = this;
        var selectedNotes = this.selected.notes.map(function (sn) {
            var staveIndex = sn.staveIndex;
            var noteIndex = sn.noteIndex;
            var note = _this.sheet.staves[staveIndex].notes[noteIndex];
            return note;
        });
        var newNote = selectedNotes.reduce(function (a, b) {
            var mergedDuration = '';
            var mergedDurationValue = DURATION_VALUES(a.duration) + DURATION_VALUES(b.duration);
            var dotted = false;
            switch (mergedDurationValue) {
                // cases for regular notes 
                case 2:
                    mergedDuration = "16";
                    break;
                case 4:
                    mergedDuration = "8";
                    break;
                case 8:
                    mergedDuration = "q";
                    break;
                case 16:
                    mergedDuration = "h";
                    break;
                case 32:
                    mergedDuration = "w";
                    break;
                // handle cases for dotted notes 
                //dotted 16th note
                case 3:
                    mergedDuration = "16";
                    dotted = true;
                    break;
                //dotted 8th note
                case 6:
                    mergedDuration = "8";
                    dotted = true;
                    break;
                // dotted quater ntoe 
                case 12:
                    mergedDuration = "q";
                    dotted = true;
                    break;
                // dotted half note  
                case 24:
                    mergedDuration = "h";
                    dotted = true;
                    break;
            }
            if (!mergedDuration) {
                console.warn("cannot merge");
                return;
            }
            var keys1 = a.isRest ? [] : a.keys;
            var keys2 = b.isRest ? [] : b.keys;
            var keys = __spread(keys1, keys2);
            keys = keys.length ? lodash.uniq(keys) : [REST_POSITIONS(mergedDuration)];
            return __assign(__assign({}, a), { isRest: a.isRest && b.isRest, keys: keys, duration: mergedDuration, dotted: dotted });
        });
        newNote.staveIndex = this.selected.notes[0].staveIndex;
        newNote.noteIndex = this.selected.notes[0].noteIndex;
        this.sheet.staves[this.selected.notes[0].staveIndex].notes.splice(this.selected.notes[0].noteIndex, this.selected.notes.length, newNote);
        this.selected.notes = [newNote];
        // re-calcualte note id's 
        this._remapIds();
    };
    Editor.prototype.setCursor = function (staveIndex, noteIndex) {
        this.selected.cursor = {
            staveIndex: staveIndex,
            noteIndex: noteIndex
        };
        var selectedNote = this.sheet.staves[staveIndex].notes[noteIndex];
        this._addtoSelectedNotes(selectedNote);
    };
    Editor.prototype.getCursorNote = function () {
        //TODO this is depricated;
        var staveIndex = this.selected.cursor.staveIndex;
        var noteIndex = this.selected.cursor.noteIndex;
        if (!staveIndex && noteIndex)
            return [];
        // find the mouse position and return the correct note for that position.
        var y = 0;
        var found;
        var cursorNoteKey;
        // var y = this.selected.measure.y;
        var notesArray = ["c/", "d/", "e/", "f/", "g/", "a/", "b/"];
        var count = 0;
        for (var i = 5; i >= 0; i--) {
            for (var l = 0; l < notesArray.length; l++) {
                var noteOffset = count * 35 - (l * 5 - 17);
                if (this.mousePos.current.y >= y + noteOffset &&
                    this.mousePos.current.y <= 5 + y + noteOffset) {
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
    };
    // cursor manipulation methods
    Editor.prototype._cursorForward = function () {
        var sIndex = this.selected.cursor.staveIndex;
        var nIndex = this.selected.cursor.noteIndex;
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
        var selectedNote = this.sheet.staves[sIndex].notes[nIndex];
        this._addtoSelectedNotes(selectedNote);
    };
    Editor.prototype._cursorBack = function () {
        var sIndex = this.selected.cursor.staveIndex;
        var nIndex = this.selected.cursor.noteIndex;
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
        var selectedNote = this.sheet.staves[sIndex].notes[nIndex];
        this._addtoSelectedNotes(selectedNote);
    };
    // add keyboard controls
    Editor.prototype.addKeyboardListeners = function () {
        var _this = this;
        document.addEventListener("keyup", function (event) {
            var noteMatch = event.key.length === 1 ? event.key.match(/[abcdefg]/) : null;
            switch (true) {
                case event.key === "ArrowRight": {
                    _this._cursorForward();
                    _this.Draw();
                    break;
                }
                case event.key === "ArrowLeft": {
                    _this._cursorBack();
                    _this.Draw();
                    break;
                }
                case event.key === "Backspace": {
                    _this.saveState();
                    _this.deleteNotes();
                    _this.Draw();
                    break;
                }
                case event.key === "s": {
                    if (!event.ctrlKey)
                        return;
                    _this.saveState();
                    _this.splitSelectedNote();
                    _this.Draw();
                    break;
                }
                case event.key === "j": {
                    if (!event.ctrlKey)
                        return;
                    _this.saveState();
                    _this.mergeNotes();
                    _this.Draw();
                    break;
                }
                // undo and redo
                case event.key === "z": {
                    if (!event.ctrlKey && !event.metaKey)
                        return;
                    _this.undo();
                    _this.Draw();
                    break;
                }
                case event.key === "r": {
                    if (!event.ctrlKey && !event.metaKey)
                        return;
                    _this.redo();
                    _this.Draw();
                    break;
                }
                case event.key === "t": {
                    if (!event.ctrlKey && !event.metaKey)
                        return;
                    _this.tieNotes();
                    _this.Draw();
                    break;
                }
                case event.key === "a": {
                    if (!event.ctrlKey && !event.metaKey)
                        return;
                    _this.saveState();
                    _this.addStave();
                    _this.Draw();
                    break;
                }
                // enable accidentals accordingly 
                case event.key === "B" || event.key === "#" || event.key === "N": {
                    if (!event.shiftKey)
                        return;
                    var key = event.key.toLowerCase();
                    switch (true) {
                        case _this.accidental === null:
                            _this.accidental = key;
                            break;
                        case _this.accidental && _this.accidental.indexOf(key) < 0:
                            _this.accidental = key;
                            break;
                        case key === "b":
                            _this.accidental = _this.accidental === "b" && _this.accidental === key ? _this.accidental = "bb" : null;
                            break;
                        case key === "#":
                            _this.accidental = _this.accidental === "#" && _this.accidental === key ? _this.accidental = "##" : null;
                            break;
                        case key === "n":
                            _this.accidental = _this.accidental === "n" ? _this.accidental = null : _this.accidental = "n";
                            break;
                    }
                    console.log(_this.accidental);
                    break;
                }
                // for adding note s 
                case noteMatch && noteMatch.length === 1: {
                    _this.saveState();
                    if (_this.mode === "note") {
                        var notes = _this.addNote(event.key.toLowerCase());
                        _this.playback(notes);
                    }
                    else {
                        // TODO: add chord function
                    }
                    _this.Draw();
                    break;
                }
                case event.key === "Control":
                    _this.ctrlActive = false;
                    break;
                case event.key === "Shift":
                    _this.shiftActive = false;
                    break;
                case event.key === "Meta":
                    _this.metaActive = false;
                    break;
            }
            document.addEventListener("keydown", function (event) {
                switch (true) {
                    case event.key === "Control":
                        _this.ctrlActive = true;
                        break;
                    case event.key === "Shift":
                        _this.shiftActive = true;
                        break;
                    case event.key === "Meta":
                        _this.metaActive = true;
                        break;
                }
            });
        });
    };
    //
    Editor.prototype.update = function () {
        this.saveState();
        this.Draw();
    };
    Editor.prototype.throwError = function (message) {
        this.onError && this.onError(message);
    };
    return Editor;
}());
exports.default = Editor;
//# sourceMappingURL=SheetEditor.js.map