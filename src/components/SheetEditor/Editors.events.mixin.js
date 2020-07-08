// redraw whole score when window resizes
// debouncedResize = null;
// $(window).resize(function() {
//   if (! debouncedResize)
//     debouncedResize = setTimeout(function() {
//       this.draw.score();
//       debouncedResize = null;
//     }, 50);
// });
// $(window).resize(this.draw.score);

// for highlighting measures
const events = {
  methods: {
    attachListenersToMeasureRect: function(measureRectElem) {
      // to avoid multiple handlers attachment
      if (measureRectElem.getAttribute("handlers-added")) return true;
      measureRectElem.setAttribute("handlers-added", true);

      measureRectElem.addEventListener("click", ()=> {
          measureRectElem.style.fill = this.measureColor
          measureRectElem.style.opacity="0.4";
        
        
        // if it is not second click on already selected measure
        if (this.selected.measure.id !== measureRectElem.id) {
          // save currently selected id to previous
          this.selected.measure.previousId = this.selected.measure.id;
          this.selected.measure.id = measureRectElem.id ; // $(this).attr("id");
          this.selected.note.previousId = this.selected.note.id;
          this.selected.note.id = measureRectElem.id + "n0";
          var prevId = this.selected.measure.previousId;
          this.$refs.svgcontainer.querySelector(".measureRect#" + prevId).style.fill="transparent";
          this.$refs.svgcontainer.querySelector(".measureRect#" + this.selected.measure.id).style.fill=this.measureColor
          this.$refs.svgcontainer.querySelector(".measureRect#" + this.selected.measure.id).style.opacity="0.4"
          this.highlightSelectedMeasureProperties();
        }
      });
      measureRectElem.addEventListener("mouseenter", ()=> {
        if (this.selected.measure.id !== measureRectElem.id)
            measureRectElem.style.fill= this.measureColor;
            measureRectElem.style.opacity ="0.1";
         // $(this).css({ fill: this.measureColor, opacity: "0.1" });
      });
      measureRectElem.addEventListener("mouseleave", ()=> {
        if (this.selected.measure.id !== measureRectElem.id)
         measureRectElem.style.fill = "transparent"
   
      });
    },

    // for highlighting notes
    attachListenersToNote: function(noteElem) {

    if(!noteElem) return ;


      noteElem.addEventListener(
        "mouseover",
        ()=> {
          // if this is in mode for working with notes
          if (this.mode === "note") {
            // don't change colour of already selected note
            if (
              this.selected.note.id !==
              noteElem.id
                .split("-")[1]
            ) {
              // change colour for each note parts - stem, head, dot, accidental...
              this.colourNote(noteElem, "orange");
            }
          }
        },
        false
      );

      noteElem.addEventListener(
        "mouseout",
        ()=>{
          if (this.mode === "note") {
            if (
              this.selected.note.id !==
             noteElem.id
                .split("-")[1]
            ) {
              this.colourNote(noteElem, "black");
            }
          }
        },
        false
      );

      noteElem.addEventListener(
        "click",
        ()=> {
          if (this.mode === "note") {
            // if it is not second click on already selected note
            if (
              this.selected.note.id !==
              noteElem.id
                .split("-")[1]
            ) {
              this.colourNote(noteElem, "red");
              // save currently selected id to previous
              this.selected.measure.previousId = this.selected.measure.id;
              this.selected.note.previousId = this.selected.note.id;
              // format of id: id='vf-m13n10' - eleventh note in fourteenth measure(indexing from 0)
              var mnId = noteElem.id;
              // save id of newly selected note
              this.selected.measure.id = mnId.split("-")[1].split("n")[0]; // 'm13'
              this.selected.note.id = mnId.split("-")[1]; // 'm13n10'
              // unhighlight previous selected note
              let elm = this.$refs.svgcontainer.querySelector(
                "svg #vf-" + this.selected.note.previousId
              );
              this.colourNote(elm, "black");
              // highlight properties on control panel accordingly
              //highlightSelectedNoteProperties();
            }
          }
        },
        false
      );
    },

    

    // setting/removing accidental to/from note via radio buttons
    // $("input:radio[name='note-accidental']").on("click",function() {
    //   var radio = $(this);

    //   // get selected note
    //   var selNote = getSelectedNote();

    //   // don't set accidental for rest
    //   if(selNote.isRest()) {
    //     // uncheck this checked radio button after while
    //     setTimeout(function() {
    //       $("input:radio[name='note-accidental']:checked").prop("checked", false);
    //     }, 50);
    //     return;
    //   }

    //   // radio already checked, uncheck it
    //   if(radio.is(".selAcc")) {
    //     // console.log('uncheck');
    //     radio.prop("checked",false).removeClass("selAcc");
    //     this.delete.accidental();
    //   }
    //   // radio unchecked, check it
    //   else {
    //     // console.log('check');
    //     $("input:radio[name='"+radio.prop("name")+"'].selAcc").removeClass("selAcc");
    //     radio.addClass("selAcc");
    //     var vexAcc = $(this).prop("value");
    //     // console.log($(this).prop("value"));
    //     this.edit.noteAccidental(vexAcc);
    //   }
    //   this.draw.selectedMeasure();
    // });

    // changing note value(duration)
    // $("input:radio[name='note-value']").on("change",function() {
    //   this.edit.noteDuration();
    //   this.draw.selectedMeasure();
    // });
  },
};



export default events;
// call is already in HTML
// toggle notes dot
// $("#dotted-checkbox").on("change",function() {
//   console.log('dot checkbox change');
//   this.edit.noteDot();
//   this.draw.selectedMeasure();
// });
