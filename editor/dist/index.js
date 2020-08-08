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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var vexflow_1 = __importDefault(require("vexflow"));
var lodash = __importStar(require("lodash"));
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
    function Editor(svgcontainer) {
        //eslint-disable-next-line
        this.keySig = "C";
        this.timeSigTop = 4;
        this.timeSigBottom = 4;
        this.clef = "treble";
        this.accidental = "";
        this.staveWidth = 400;
        this.staveHeight = 140;
        this.noteWidth = 100;
        this.dotted = false;
        this.eventsAdded = false;
        this.shiftActive = false;
        this.ctrlActive = false;
        this.metaActive = false;
        this.sheet = {
            staves: []
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
        this.svgElm = svgcontainer;
        this.renderer = new vexflow_1.default.Flow.Renderer(svgcontainer, vexflow_1.default.Flow.Renderer.Backends.SVG);
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
        var notes = new Array(4).fill({ keys: [REST_POSITIONS("q")], duration: "q", isRest: true })
            .map(function (n, i) { return __assign(__assign({}, n), { accidentals: [null], staveIndex: index, noteIndex: i }); });
        this.sheet.staves.splice(index, 0, { notes: notes });
    };
    Editor.prototype.addNote = function (noteName) {
        // modify the rest of the stave to join the notes
        var _this = this;
        var notes = this.selected.notes;
        notes = notes.map(function (selectedNote) {
            var staveIndex = selectedNote.staveIndex;
            var noteIndex = selectedNote.noteIndex;
            var note = _this.sheet.staves[staveIndex].notes[noteIndex];
            // if key arledy exists then don't add it again;
            var stave = _this.sheet.staves[note.staveIndex];
            var isRest = note.isRest;
            var duration = note.duration.replace('r', '');
            var keys = isRest ? [noteName] : lodash.uniq(__spreadArrays(note.keys, [noteName]));
            var accidentals = note.accidentals ? __spreadArrays(note.accidentals, [_this.accidental]) : _this.accidental ? [_this.accidental] : [null];
            var newNote = { keys: keys, duration: duration, isRest: false, staveIndex: note.staveIndex, noteIndex: note.noteIndex, accidentals: accidentals, clef: note.clef };
            stave.notes[note.noteIndex] = newNote;
            _this.sheet.staves[note.staveIndex] = stave;
            return newNote;
        });
        this.selected.notes = notes;
    };
    //TODO: implement 
    Editor.prototype.changeDuration = function () {
    };
    // note editing functions 
    Editor.prototype.editOctave = function (octave, keyNote) {
        var _this = this;
        if (octave == 1 || octave !== -1) {
            console.error("supplied value for octave should be either 1 or -1");
            return;
        }
        this.selected.notes.map(function (selectedNote) {
            var staveIndex = selectedNote.staveIndex;
            var noteIndex = selectedNote.noteIndex;
            var keyIndex = _this.sheet.staves[staveIndex].notes[noteIndex].keys.indexOf(keyNote);
            var note = _this.sheet.staves[staveIndex].notes[noteIndex].keys[keyIndex];
            if (!note) {
                console.error("note not found");
                return;
            }
            var _a = note.split("/"), upper = _a[0], lower = _a[1];
            var newNote = upper + "/" + (lower + octave);
            // replace the note 
            _this.sheet.staves[staveIndex].notes[noteIndex].keys[keyIndex] = newNote;
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
        this.ctx.clear();
        var staveXpos = 10;
        var staveWidth = 0;
        this.sheet.staves.map(function (s, staveIndex) {
            staveXpos += staveWidth;
            staveWidth = _this.noteWidth * (s.notes.length < 4 ? 4 : s.notes.length);
            // drave the stave first , add timesignature
            var stave = new vexflow_1.default.Flow.Stave(staveXpos, 40, staveWidth);
            stave.setAttribute("id", "vf-" + staveIndex);
            if (staveIndex === 0) {
                stave.addTimeSignature("4/4");
                stave.addClef(_this.clef);
            }
            stave.setContext(_this.ctx).draw();
            //add selectable overlay
            _this.ctx.rect(stave.getX(), stave.y, stave.getWidth(), _this.staveHeight, {
                class: "vf-measureRect",
                id: "vf-" + staveIndex,
                fill: "transparent",
            });
            // draw the notes 
            var staveNotes = s.notes.map(function (n) {
                // sort notes according to keys
                n.accidentals = n.accidentals || [null];
                var keys = n.keys.map(function (k, i) { return { index: i, key: k, accidental: n.accidentals[i] }; });
                keys = keys.sort(function (a, b) { return _this.compareNotes(a.key.split("/").join(''), b.key.split("/").join('')); });
                var sortedKeys = keys.map(function (k) { return k.key; });
                var sortedAccidentals = keys.map(function (k) { return k.accidental; });
                console.log("unsorted", n.keys);
                console.log("sorted", sortedKeys);
                var staveNote = new vexflow_1.default.Flow.StaveNote({
                    clef: _this.clef,
                    keys: sortedKeys,
                    duration: !n.isRest ? n.duration : n.duration + "r",
                    auto_stem: true,
                });
                // add accidental 
                !n.isRest && sortedAccidentals.length && sortedAccidentals.map(function (accidental, index) {
                    if (accidental)
                        staveNote.addAccidental(index, new vexflow_1.default.Flow.Accidental(accidental));
                });
                // add dot if dotted
                if (n.dotted) {
                    staveNote.addDotToAll();
                }
                staveNote.setAttribute("id", n.staveIndex + "__" + n.noteIndex);
                return staveNote;
            });
            console.log("numb", staveNotes.length);
            console.log("bval", _this.timeSigBottom);
            var voice = new vexflow_1.default.Flow.Voice({ num_beats: _this.timeSigTop, beat_value: _this.timeSigBottom });
            voice.addTickables(staveNotes);
            vexflow_1.default.Flow.Formatter.FormatAndDraw(_this.ctx, stave, staveNotes);
        });
        // highlight the selected notes
        this.selected.notes.map(function (sn) {
            var selectedNote = _this.svgElm.querySelector("#vf-" + sn.staveIndex + "__" + sn.noteIndex);
            _this._highlightNoteElement(selectedNote, "red");
        });
        this.selected.staves.map(function (staveIndex) {
            _this._highlightStaveElement(_this.svgElm.querySelector("#vf-" + staveIndex), "lightblue");
        });
    };
    Editor.prototype._getSelectedElement = function (event) {
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
        return __spreadArrays([
            ele,
            ele.classList.value.indexOf("vf-stavenote") > -1 ? "note" : "stave"
        ], id);
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
            var _a = _this._getSelectedElement(event), ele = _a[0], type = _a[1], staveIndex = _a[2], noteIndex = _a[3];
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
        });
        svgElem.addEventListener("blur", function () {
            _this.Draw();
        });
    };
    // Methods for drawing cursor note
    Editor.prototype._addtoSelectedNotes = function (note) {
        if (this.shiftActive) {
            var notes = lodash.clone(this.selected.notes);
            notes.push(note);
            notes = lodash.uniq(notes);
            this.selected.notes = notes;
        }
        else {
            this.selected.notes = [note];
        }
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
    };
    Editor.prototype.getMousePos = function (canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top,
        };
    };
    Editor.prototype.splitSelectedNote = function () {
        var _this = this;
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
        notes.splice.apply(notes, __spreadArrays([this.selected.cursor.noteIndex, 1], newNotes));
        // remap ids 
        notes = notes.map(function (n, i) {
            n.staveIndex = _this.selected.cursor.staveIndex;
            n.noteIndex = i;
            return n;
        });
        stave.notes = notes;
        this.setCursor(this.selected.cursor.staveIndex, this.selected.cursor.noteIndex + 1);
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
            debugger;
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
            var keys1 = a.isRest ? [] : a.keys;
            var keys2 = b.isRest ? [] : b.keys;
            var keys = __spreadArrays(keys1, keys2);
            keys = keys.length ? lodash.uniq(keys) : [REST_POSITIONS(mergedDuration)];
            return __assign(__assign({}, a), { isRest: a.isRest && b.isRest, keys: keys, duration: mergedDuration, dotted: dotted });
        });
        newNote.staveIndex = this.selected.notes[0].staveIndex;
        newNote.noteIndex = this.selected.notes[0].noteIndex;
        this.sheet.staves[this.selected.notes[0].staveIndex].notes.splice(this.selected.notes[0].noteIndex, this.selected.notes.length, newNote);
        this.selected.notes = [newNote];
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
                    _this.addNote(event.key.toLowerCase() + "/4");
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
    return Editor;
}());
exports.default = Editor;
//# sourceMappingURL=index.js.map