
<gunshow-editor>

      <div id="editor-modal" class="mfp-hide white-popup-block">

        <div class="ui menu">
            <div class="ui container">
              <div class="right menu">
                <a class="item" onclick={ requestClose }>
                  Close
                </a>
              </div>
            </div>
        </div>

        <textarea id="editor">HelloWorld</textarea>

      </div>


    <script>
        opts.impl.call(this, opts);
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
        .gunshow-editable {
          border: 2px dotted #BA00CC !important;
        }
    </style>

</gunshow-editor>
