
<gunshow-editor-menu  class="ui inverted menu">

    <div class="ui container">

      <a href="https://github.com/cadorn/gunshow" class="header item">
        { config.editor.label }
      </a>

      <div class="right menu">

        <a if={ state.mode == "present" } class="item" onclick={ requestEdit }>
          Edit Page
        </a>
  
        <a if={ state.mode == "edit" } class="item" onclick={ requestPresent }>
          Preview Page
        </a>
      </div>

    </div>

    <script>
        opts.impl.call(this, opts);
    </script>

</gunshow-editor-menu>
