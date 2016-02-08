
<editor>

      <div id="test-modal" class="mfp-hide white-popup-block">
        <h1>Modal dialog</h1>
        <p>You won't be able to dismiss this by usual means (escape or
          click button), but you can close it programatically based on
          user choices or actions.</p>

<textarea id="editor">HelloWorld</textarea>
          
        <p><a class="popup-modal-dismiss" href="#">Dismiss</a></p>
      </div>

    <script>
        var self = this;

console.log("EDITOR", $("#editor").get(0));

/*
var editor = CodeMirror.fromTextArea($("#editor").get(0), {
    lineNumbers: true
});

window.editor = editor;
*/

var myDomOutline = window.DomOutline({
    onClick: function (element) {

console.log('Clicked element:', element, $(element).html());

myDomOutline.stop();

editor.doc.setValue($(element).html());


        $.magnificPopup.open({
            items: {
                src: '#test-modal'
            },
          type: 'inline',
          preloader: false,
          focus: '#username',
          modal: true,
          callbacks: {
            open: function() {

console.log('Popup is opened', editor);
$('.CodeMirror').each(function(i, el){
    el.CodeMirror.refresh();
});
            }
          }
        });


    },
    filter: '[editable-data-id]'
});

// Start outline:
myDomOutline.start();

// Stop outline (also stopped on escape/backspace/delete keys):


    </script>


    <style>
.white-popup-block {
  background: #FFF;
  padding: 20px 30px;
  text-align: left;
  max-width: 650px;
  margin: 40px auto;
  position: relative;
}
    </style>

</editor>
