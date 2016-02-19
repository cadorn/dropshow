
<gunshow-gallery class="gunshow-gallery">


    <div if={ gallery } data-id={ gallery.id } class="ui basic padded segment">
        <h2 class="ui header" data-id="title">{ gallery.title }</h2>

        <gunshow-text text={ gallery.description }></gunshow-text>
        
    </div>
    
    <br/>

    <div class="ui cards lightbox-boundary">
    
        <div class="card" each={ gallery.images } data-id={ id } onclick={ requestLightbox }>
            <div class="image">
                <gunshow-media url={ url } id={ id } width="275" height="180"></gunshow-media>
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
      .gunshow-gallery P {
        font-size: 120%;
        margin-bottom: 8px;
      }
      .gunshow-gallery IMG:hover {
        cursor: pointer !important;
      }
    </style>

</gunshow-gallery>
