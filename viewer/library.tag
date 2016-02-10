
<library>

    <div id="library-modal" class="mfp-hide white-popup-block">

        <table>
            <tr>
                <td colspan="2" class="">
                    <div class="ui top attached tabular menu">
                        <a class="active item">Unassigned</a>
                        <a class="item">All</a>
                        <div class="right menu">
                            <a class="item" onclick={ requestClose }>
                              Close
                            </a>
                        </div>
                    </div>
                </td>
            </tr>
            <tr>
                <td colspan="2" class="content">
                    <div class="ui basic segment scrolling">
            
                        <p>ss</p>
                        <p>ss</p>
                        <p>ss</p>
                        <p>ss</p>
                        <p>ss</p>
                        <p>ss</p>
                        <p>ss</p>
                        <p>ss</p>
                        <p>ss</p>
                        <p>ss</p>
                        <p>ss</p>
                        <p>ss</p>
                        <p>ss</p>
                        <p>ss</p>
                        <p>ss</p>
                        <p>ss</p>
                        <p>ss</p>
                        <p>ss</p>
                        <p>ss</p>
                    </div>
                </td>
            </tr>
            <tr>
                <td class="footer">
                    <div class="ui segment">
                        Add to gallery
                    </div>    
                </td>
                <td class="footer">
                    <div class="ui raised segment">
                        Keep for later
                    </div>    
                </td>
            </tr>
        </table>

    </div>

    <script>
        opts.impl.call(this, opts);
    </script>

    <style>
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
    </style>

    <script>
        opts.impl.call(this, opts);
    </script>
</library>
