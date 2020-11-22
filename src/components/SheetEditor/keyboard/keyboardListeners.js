/* eslint-disable no-fallthrough */
export default function KeyboardListeners(event, cb) {
  const noteMatch =
    event.key.length === 1 ? event.key.match(/[abcdefg]/) : null;

  switch (true) {
    case event.key === "ArrowRight": {
      cb("rightArrow", event.shiftKey);
      break;
    }

    case event.key === "ArrowLeft": {
      cb("leftArrow", event.shiftKey);
      break;
    }

    case event.key === "Backspace": {
      cb("delete");
      break;
    }

    case event.key === "s": {
      if (event.ctrlKey) {
        cb("splitNote");
        break;
      }
    }

    case event.key === "j": {
      if (event.ctrlKey) {
        cb("mergeNote");
        break;
      }
    }

    // undo and redo

    case event.key === "z": {
      if (event.ctrlKey || event.metaKey) {
        cb("undo");
        break;
      }
    }

    case event.key === "r": {
      if (event.ctrlKey || event.metaKey) {
        cb("redo");
        break;
      }
    }

    case event.key === "t": {
      if (event.ctrlKey || event.metaKey) {
        cb("tieNotes");
        break;
      }
    }

    case event.key === "a": {
      if (event.ctrlKey || event.metaKey) {
        cb("addStave");
        break;
      }
    }

    // enable accidentals accordingly

    case event.key === "B" || event.key === "#" || event.key === "N": {
      if (event.shiftKey) {
        const key = event.key.toLowerCase();

        switch (true) {
          case this.accidental === null:
            this.accidental = key;
            break;
          case this.accidental && this.accidental.indexOf(key) < 0:
            this.accidental = key;
            break;
          case key === "b":
            this.accidental =
              this.accidental === "b" && this.accidental === key
                ? (this.accidental = "bb")
                : null;
            break;
          case key === "#":
            this.accidental =
              this.accidental === "#" && this.accidental === key
                ? (this.accidental = "##")
                : null;
            break;
          case key === "n":
            this.accidental =
              this.accidental === "n"
                ? (this.accidental = null)
                : (this.accidental = "n");
            break;
        }

        break;
      }
    }

    // for adding note s
    case noteMatch && noteMatch.length === 1: {
      cb("note", event.key.toLowerCase());
      break;
    }
  }
}
