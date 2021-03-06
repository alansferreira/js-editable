/*
MIT License

Copyright (c) 2017 Alan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

(function($) {
  
  /**
   * @namespace object defaultoptions
   * @property {boolean}  edtAutoUpdate             - Automatic update source contents during change.
   * @property {boolean}  edtAutoMetrics            - Automatic update metrics of editor during edition.
   * @property {string}  edtInfiniteNavigation      - Automatic jump to first editable elemente when press 'tab key' and it arrives in the last element.
   * @property {any} edtOnCommit                    - Commit event
   */
  var defaultOptions = {
    edtAutoUpdate: true, 
    edtAutoMetrics: true, 
    edtInfiniteNavigation: true, 
    edtOnCommit: null,
    edtInput: "<input type='text' class='editable-input-text'>"
  };
  
  var DATA_EDITABLE_SOURCE = 'editableSource';
  var DATA_EDITABLE_OPTIONS = 'editableOptions';
  var DATA_EDITABLE_INITIAL_VALUE = 'editableInitialValue';

  /**
   * 
   * @param {*} options 
   */
  function editable(options) {
    
    var _options = $.extend({}, defaultOptions, options);

    function input_change(e){
      var $input = $(e.target);
      
      var opt = $input.data(DATA_EDITABLE_OPTIONS);
      
      if(opt && opt.edtAutoUpdate) updateEditableSource($input);
      if(opt && opt.onchange) return opt.onchange(e);
      return true;
    };


    function startEdit(editable){
      var $target = $(editable);
      var $options = $target.data(DATA_EDITABLE_OPTIONS);
      var $input = $options.edtInput = $($options.edtInput);

      
      //$(document.body).append($input);
      $input.on('keydown', input_keydown);
      $input.on('blur', input_blur);
      $input.on('change', input_change);
      $input.on('focus', input_focus);

      $input.data(DATA_EDITABLE_INITIAL_VALUE, $target.text());
      $input.data(DATA_EDITABLE_OPTIONS, $options);
      $input.data(DATA_EDITABLE_SOURCE, $target);
      
      updateInputPosition($input);
      
      $input.val($target.text());
      $input.show();
      $input.focus();
      $input.select();
    };
    
    function endEdit($editable){
      var $options = $($editable).data(DATA_EDITABLE_OPTIONS);
      var $input = $options.edtInput = $($options.edtInput);

      updateEditableSource($input); 
      $input.hide();

      if($options.edtOnCommit) {
        var commit = eval($options.edtOnCommit);
        if (typeof commit == 'function') {
            commit($editable, $input, $options);
        }
      }
    };
    function cancelEdit($editable){
      var $options = $($editable).data(DATA_EDITABLE_OPTIONS);
      var $input = $options.edtInput = $($options.edtInput);


      var initialValue = $input.data(DATA_EDITABLE_INITIAL_VALUE);
      $input.hide();

      $input.val(initialValue);
      updateEditableSource($input);
    };



    function input_focus(e){};
    function input_keydown(e){
      var $input = $(e.target);
      var $editable = $input.data(DATA_EDITABLE_SOURCE);
      if(e.cancelBubble) return false;
      
      var next = null;
      var opt = $input.data(DATA_EDITABLE_OPTIONS);
      if(opt && opt.edtAutoUpdate) updateEditableSource($input);
      if(opt && opt.edtAutoMetrics) updateInputPosition($input);
      
      switch(e.keyCode){
        case 27: //ESCAPE
          return cancelEdit($editable);
      }
      
      if(e.keyCode==9){
        e.preventDefault();
        e.stopPropagation();
        e.cancelBubble=true;
        var index = $editable.data("edtIndex");
        
        next = $(".editable:gt("+((e.shiftKey?-2:0) +index)+"):first");
        if(!next.length && opt.edtInfiniteNavigation) next = $(".editable:first");
        
        if(next.length){
          endEdit($editable.get(0));
          startEdit(next.get(0));
        }

        return false;
      }
    }; 
    function updateInputPosition($input){
      var $target = $input.data(DATA_EDITABLE_SOURCE);
      $input.css({
        position: 'absolute',
        top: $target.offset().top + 'px',
        left: $target.offset().left + 'px', 
        "font-family": $target.css("font-family"), 
        "font-size": $target.css("font-size"), 
        "margin": $target.css("margin"), 
      });
      $input.width($target.width());
      $input.height($target.height());
    }
    function updateEditableSource($input){
      var $source = $input.data(DATA_EDITABLE_SOURCE);
      $source.html($input.val());
    };
    
    function input_blur(e){
      var $input = $(e.target);
      var $source = $input.data(DATA_EDITABLE_SOURCE);
      endEdit($source);
    };
    
    function editable_click(e){
      var $target = $(e.target);
      
      startEdit($target);
      
    }

    var ret = this.each(function() {
      var _this = $(this);
      
      _this.data(DATA_EDITABLE_OPTIONS, $.extend({}, _options, _this.data() ));

      _this.addClass( "editable" );
      _this.on("click", editable_click);
      this.startEdit = function(){ return startEdit(_this); };
      this.endEdit = function(){ return endEdit(_this); };
      this.cancelEdit = function(){ return cancelEdit(_this); };
      
      $(".editable").each(function(index, el) {$(el).data("edtIndex", index);});
    });

    return ret;
    
  }; 
  
  $.fn.editable = editable;
  $(".editable").editable()

  $(".editable").each(function(index, el) {$(el).data("edtIndex", index);});
}(jQuery));  
