
<editor-menu  class="ui fixed inverted menu">

    <div class="ui container">

      <a href="https://github.com/cadorn/gunshow" class="header item">
        Gunshow Editor
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

</editor-menu>
