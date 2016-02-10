
<viewer>

    <div class="ui grid">
      <div class="four wide column">
        <div class="ui vertical fluid tabular menu">
          <a each={ galleries } class={ item: true, active: id == gallery.id } onclick={ requestGallery }>{ title }</a>
          <a if={ state.mode == "edit" } class="item" onclick={ requestGalleryNew }>
            <i class="plus icon"></i>
          </a>
        </div>
      </div>
      <div if={ state.selected.gallery } class="twelve wide column" data-id={ gallery.id }>

        <h1 data-id="title" data-editable="true" class="ui header">{ gallery.title }</h1>
        <p data-id="description" data-editable="true">{ gallery.description }</p>

        <div class="ui four cards">

            <a class="card" each={ images } data-id={ id }>
                <div class="image">
                    <media url={ urls.thumbnail }></media>
                </div>
                <div class="content" data-id="caption" data-editable="true">
                    { caption }
                </div>
            </a>

            <a if={ state.mode == "edit" } class="item">
                <i class="circular huge plus icon"></i>
            </a>

        </div>

      </div>
    </div>


    <script>
        opts.impl.call(this, opts);
    </script>
</viewer>