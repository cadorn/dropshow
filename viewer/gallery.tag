
<gunshow-gallery class="gunshow-gallery">

    <div if={ gallery } data-id={ gallery.id }>

        <h1 data-id="title" data-editable="true" class="ui header">{ gallery.title }</h1>
        
        <div class="ui basic very padded description segment">
        
            <gunshow-text text={ gallery.description }></gunshow-text>
        
        </div>
    </div>
    
    <div class="ui four cards">
    
        <div class="card" each={ gallery.images } data-id={ id }>
            <div class="image">
                <gunshow-media url={ urls.thumbnail }></gunshow-media>
            </div>
            <div if={ parent.state.mode == "edit" }  class="content">
                <a href="#" onclick={ requestItemRemove }>
                  <i class="minus icon"></i>
                </a>
            </div>
        </div>
    </div>

    <script>
        opts.impl.call(this, opts);
    </script>

    <style>
      .gunshow-gallery .description.segment {
        font-size: 120%;
      }
    </style>

</gunshow-gallery>
