
<gunshow-viewer>

    <div class="ui grid gunshow-viewer">
      <div class="four wide column">
        <div class="ui vertical fluid tabular menu galleries-menu">
          <a each={ galleries } class={ item: true, active: id == gallery.id } onclick={ requestGallery }>
            <div>{ title }</div>
            <div class="ui label">{ itemCount }</div>
            <div if={ type == "showcase" } class="ui horizontal blue label">SC</div>
          </a>
          <a if={ state.mode == "edit" } class="item" onclick={ requestGalleryNew }>
            <i class="plus icon"></i>
          </a>
        </div>
      </div>
      <div if={ gallery } class="twelve wide column" data-id={ gallery.id }>

        <h1 data-id="title" data-editable="true" class="ui header">{ gallery.title }</h1>
        <p data-id="description" data-editable="true">{ gallery.description }</p>

        
        <div class="ui menu">
          <a if={ state.mode == "edit" } class="item" onclick={ requestLibrary }>
            Add Photos from Library
          </a>
          <div class="right menu">
            <a if={ gallery.type == "showcase" } class="item" href="/Showcase/{ gallery.id }" target="_blank">
              Open Showcase
            </a>
            <a if={ gallery.type == "gallery" && !gallery.images } class="item" onclick={ requestMakeShowcase }>
              Make into Showcase
            </a>
          </div>
        </div>

          <br/>

        <div if={ gallery } class="ui four cards">

            <div class="card" each={ gallery.images } data-id={ id }>
                <div class="image">
                    <gunshow-media url={ url } width="275" height="180"></gunshow-media>
                </div>
                <div if={ parent.state.mode == "edit" }  class="content">
                    <a href="#" onclick={ requestItemRemove }>
                      <i class="minus icon"></i>
                    </a>
                </div>
            </div>
        </div>

      </div>
    </div>


    <script>
        opts.impl.call(this, opts);
    </script>
    
    <style>
      .gunshow-viewer .galleries-menu {
        min-width: 230px;
      }
      .gunshow-viewer .galleries-menu a.item {
        padding: 5px !important;
        white-space: nowrap !important;
        display: block !important;
      }
      .gunshow-viewer .galleries-menu a.item.active {
        border-width: 2px !important;
        background-color: #D4D4D5 !important;
      }
      .gunshow-viewer .galleries-menu a.item > div {
        display: inline-block !important;
        margin: 0px !important;
        white-space: nowrap !important;
      }
      .gunshow-viewer .galleries-menu a.item > div.label {
        margin-top: -3px !important;
      }
    </style>
    
</gunshow-viewer>
