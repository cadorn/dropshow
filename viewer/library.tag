
<gunshow-library>

    <div id="library-modal" class="mfp-hide white-popup-block">

        <table>
            <tr>
                <td colspan="2" class="">
                    <div class="ui top attached tabular menu">
                        <a class="active item">Unassigned</a>
                        <div class="right menu">
                          <a class="item" onclick={ requestLibrarySync }>
                            Sync Library
                          </a>
                            <a class="item" onclick={ requestClose }>
                              Close
                            </a>
                        </div>
                    </div>
                    
                    <div if={ navbar } class="ui right floated pagination menu">
                        <a if={ navbar.previous } class="icon item" onclick={ requestPage } data-id={ navbar.previous }>
                          <i class="left chevron icon" data-id={ navbar.previous }></i>
                        </a>
                        <a if={ !navbar.previous } class="disabled icon item">
                          <i class="left chevron icon"></i>
                        </a>
                        <a each={ navbar.pages } class={ item: true, active: selected } onclick={ requestPage } data-id={ number }>{ number }</a>
                        <a if={ navbar.next } class="icon item" onclick={ requestPage } data-id={ navbar.next }>
                          <i class="right chevron icon" data-id={ navbar.next }></i>
                        </a>
                        <a if={ !navbar.next } class="disabled icon item">
                          <i class="right chevron icon"></i>
                        </a>
                      </div>
                </td>
            </tr>
            <tr>
                <td colspan="2" class="content">
                    <div class="ui basic segment scrolling">

                        <div class="ui four cards">
                            <a class="card" each={ images } data-id={ id } onclick={ notifyClick }>
                                <div class="image">
                                    <div if={ pendingAddition } class="ui black ribbon label">
                                        Added
                                    </div>                                
                                    <gunshow-media url={ url } id={ id } width="275" height="180"></gunshow-media>
                                </div>
                            </a>
                        </div>

                    </div>
                </td>
            </tr>
<!--            
TODO: Optionally support drag and drop
            <tr>
                <td width="30%" class="footer">
                    <div class="ui segment dropzone dropzone-add-to-gallery">
                        Add to gallery
                    </div>    
                </td>
                <td width="70%" class="footer">
                    <div class="ui raised segment dropzone dropzone-keep-for-later">
                        Keep for later
                    </div>    
                </td>
            </tr>
-->
        </table>

    </div>

    <script>
        opts.impl.call(this, opts);
    </script>

    <style>
        #library-modal {
            max-width: 1000px !important;
        }
        #library-modal > table {
            width: 100%;
            height: 100%;
        }
        #library-modal > table td.footer {
            padding-top: 10px;
            padding-right: 10px;
        }
        #library-modal > table td.footer:last-child {
            padding-right: 0px;
        }
        #library-modal > table td.content {
            height: 100%;
        }
        #library-modal > table .scrolling {
            height: 100%;
            overflow-y: scroll;
        }
        #library-modal.white-popup-block {
          background: #FFF;
          padding: 20px 30px;
          text-align: left;
          max-width: 650px;
          margin: 40px auto;
          position: relative;
        }
        

/*        
        #library-modal .dropzone {
          border-radius: 4px;
          width: 100%;
          transition: background-color 0.3s;
        }
        
        #library-modal .drop-active {
          border-color: #aaa;
        }
        
        #library-modal .drop-target {
          background-color: #29e;
          border-color: #fff;
          border-style: solid;
        }
        
        #library-modal .drag-drop {
          display: inline-block;
          min-width: 40px;
          padding: 2em 0.5em;
        
          color: #fff;
          background-color: #29e;
          border: solid 2px #fff;
        
          -webkit-transform: translate(0px, 0px);
                  transform: translate(0px, 0px);
        
          transition: background-color 0.3s;
        }
        
        #library-modal .drag-drop.can-drop {
          color: #000;
          background-color: #4e4;
          border: 2px solid #4e4;
        }        
*/        
    </style>

    <script>
        opts.impl.call(this, opts);
    </script>
</gunshow-library>
