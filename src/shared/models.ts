// types
export interface ed_note {
  clef: any;
  duration: string;
  keys: string[];
  accidentals: (string | null)[];
  dotted?: boolean;
  isRest: boolean;
  staveIndex: number;
  noteIndex: number;
  beat: number;
  subDivision: number;
}

export interface ed_tie {
  [x: string]: any;
  first_note: ed_selected_note;
  last_note: ed_selected_note;
  first_indices: number[];
  last_indices: number[];
}

export interface ed_beam {
  notes: ed_note[];
}

export interface ed_selected_note {
  staveIndex: number;
  noteIndex: number;
}

export interface ed_stave {
  notes: ed_note[];
}

export interface ed_sheet {
  staves: ed_stave[];
  ties: ed_tie[];
  beams: ed_beam[];
}

export interface cursor {
  _staveIndex?: number;
  _noteIndex?: number;
  noteIndex: any;
  staveIndex: any;
}

export interface ed_selected {
  _staves?: any[];
  _notes?: { staveIndex: number; noteIndex: number }[];
  cursor: cursor;
  notes: { staveIndex: number; noteIndex: number }[];
  staves: number[];
}

export interface ed_state {
  sheet: string;
  selected: string;
}

export interface au_seek {
  bar: number;
  beat: number;
  sixteenth: number;
  position: {
    current: number;
    total: number;
  };
}