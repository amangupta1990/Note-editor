"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.playChord = void 0;
var tone_1 = require("tone");
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
    var _now = tone_1.now();
    var notesToPlay = getToneNotes(_notes);
    notesToPlay.map(function (n) {
        var notes = n.notes, duration = n.duration;
        synth.triggerAttackRelease(notes, duration, _now);
    });
}
exports.playChord = playChord;
var AudioEngine = /** @class */ (function () {
    function AudioEngine() {
        this._numTracks = 0;
        this._tracks = {};
    }
    AudioEngine.prototype.add = function () {
        this._tracks[this._numTracks] = [];
    };
    AudioEngine.prototype.updateTrack = function (staves) {
    };
    return AudioEngine;
}());
//# sourceMappingURL=AudioEngine.js.map