
<gunshow-viewer>

    <div class="ui grid">
      <div class="four wide column">
        <div class="ui vertical fluid tabular menu">
          <a each={ galleries } class={ item: true, active: id == gallery.id } onclick={ requestGallery }>{ title } ({ itemCount })</a>
          <a if={ state.mode == "edit" } class="item" onclick={ requestGalleryNew }>
            <i class="plus icon"></i>
          </a>
        </div>
      </div>
      <div if={ gallery } class="twelve wide column" data-id={ gallery.id }>

        <h1 data-id="title" data-editable="true" class="ui header">{ gallery.title }</h1>
        <p data-id="description" data-editable="true">{ gallery.description }</p>

        <div if={ gallery } class="ui four cards">

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

        <div class="ui container">
          <br/>
          <a href="#" if={ state.mode == "edit" } onclick={ requestLibrary }>
            <i class="big plus icon"></i>
          </a>
        </div>

      </div>
    </div>


    <script>
        opts.impl.call(this, opts);
    </script>
</gunshow-viewer>
