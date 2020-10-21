"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioEngine = exports.playChord = void 0;
var lodash_1 = require("lodash");
var tone_1 = require("tone");
document.addEventListener("click", function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, tone_1.start()];
            case 1:
                _a.sent();
                console.log("context started");
                return [2 /*return*/];
        }
    });
}); });
var DURATION_VALUES = function (key) {
    switch (key.toLocaleLowerCase()) {
        case "w": return '1n';
        case "h": return '2n';
        case "q": return '4n';
        case "8": return '8n';
        case "16": return '16n';
        case "32": return '32n';
        default: return 0;
    }
};
var synth = new tone_1.PolySynth().toDestination();
function getToneNotes(notes) {
    var tone_notes = (notes).map(function (_note, i) {
        var accidentals = _note.accidentals.map(function (acc) { return acc === null || acc === void 0 ? void 0 : acc.replace("##", "x"); });
        return {
            notes: _note.keys.map(function (k, i) { return k.replace("/", accidentals[i] || ''); }),
            duration: DURATION_VALUES(_note.duration)
        };
    });
    return tone_notes;
}
function playChord(_notes) {
    return;
    var _now = tone_1.now();
    var notesToPlay = getToneNotes(_notes);
    notesToPlay.map(function (n) {
        var notes = n.notes, duration = n.duration;
        synth.triggerAttackRelease(notes, duration, _now);
    });
}
exports.playChord = playChord;
var AudioEngine = /** @class */ (function () {
    function AudioEngine(sheet, timeSig, BPM, onProgress) {
        this._numTracks = 0;
        this._tracks = {};
        this.seekBar = {
            bar: 0,
            beat: 0,
            sixteenth: 0,
            position: {
                current: 0,
                total: 0,
            }
        };
        this.bpm = BPM || 120;
        this.notes = [];
        this.timeSig = __spread(timeSig.split("/")).map((function (sig) { return parseInt(sig); }));
        tone_1.Transport.bpm.value = this.bpm;
        tone_1.Transport.timeSignature = this.timeSig;
        this.updateTrack(sheet);
        tone_1.Transport.on('stop', function () {
            console.log('transportEnded');
        });
        this._onProgress = onProgress;
    }
    AudioEngine.prototype._add = function () {
        this._tracks[this._numTracks] = [];
    };
    AudioEngine.prototype._getTime = function (staveIndex, noteIndex, duration) {
        return staveIndex + ":" + noteIndex + ":0";
    };
    AudioEngine.prototype.updateTrack = function (sheet) {
        var _this = this;
        this.stop();
        this.notes = [];
        sheet.staves
            .map(function (stave) { return stave.notes; })
            .map(function (_notes) { _this.notes = lodash_1.concat(_this.notes, _notes); });
        var _notes = this.notes;
        var partNotes = _notes.map(function (note, i) {
            var _a = getToneNotes([note])[0], notes = _a.notes, duration = _a.duration;
            var time = _this._getTime(note.staveIndex, note.noteIndex, note.duration);
            return { notes: notes, time: time, duration: duration, isRest: note.isRest };
        });
        var _loop_1 = function (index) {
            var pn = partNotes[index];
            tone_1.Transport.schedule(function (time) {
                if (!pn.isRest) {
                    synth.triggerAttackRelease(pn.notes, pn.duration, time);
                }
                _this.seekBar = {
                    bar: parseInt(pn.time.split(":")[0]),
                    beat: parseInt(pn.time.split(":")[1]),
                    sixteenth: parseInt(pn.time.split(":")[2]),
                    position: {
                        current: index,
                        total: partNotes.length
                    }
                };
            }, pn.time);
        };
        for (var index = 0; index < partNotes.length; index++) {
            _loop_1(index);
        }
        var start = partNotes[0].time;
        var end = partNotes[partNotes.length - 1].time;
        this.play(start, end);
    };
    AudioEngine.prototype.progress = function () {
        // scale it between 0-1
        var transport = tone_1.Transport;
        var progress = (this.seekBar.position.current + 1) / this.seekBar.position.total;
        console.log(progress * 100);
        this._onProgress && this._onProgress(this.seekBar);
        this.animationID = requestAnimationFrame(this.progress.bind(this));
    };
    AudioEngine.prototype.play = function (start, end) {
        tone_1.Transport.loopStart = start;
        tone_1.Transport.loopEnd = end;
        tone_1.Transport.start();
        this.animationID = requestAnimationFrame(this.progress.bind(this));
    };
    AudioEngine.prototype.stop = function () {
        tone_1.Transport.stop();
        tone_1.Transport.cancel();
        cancelAnimationFrame(this.animationID);
    };
    return AudioEngine;
}());
exports.AudioEngine = AudioEngine;
//# sourceMappingURL=AudioEngine.js.map