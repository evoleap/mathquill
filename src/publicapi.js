/*********************************************************
 * The actual jQuery plugin and document ready handlers.
 ********************************************************/

//The publicy exposed method of jQuery.prototype, available (and meant to be
//called) on jQuery-wrapped HTML DOM elements.
jQuery.fn.mathquill = function(cmd, latex) {
  var that=this;
  switch (cmd) {
  case 'redraw':
    return this.each(function() {
      var blockId = $(this).attr(mqBlockId),
        rootBlock = blockId && MathElement[blockId];
      if (rootBlock) {
        (function postOrderRedraw(el) {
          el.eachChild(postOrderRedraw);
          if (el.redraw) el.redraw();
        }(rootBlock));
      }
    });
  case 'revert':
    return this.each(function() {
      var blockId = $(this).attr(mqBlockId),
        block = blockId && MathElement[blockId];
      if (block && block.revert)
        block.revert();
    });
  case 'latex':
    if (arguments.length > 1) {
      return this.each(function() {
        var blockId = $(this).attr(mqBlockId),
          block = blockId && MathElement[blockId];
        if (block)
          block.renderLatex(latex);
      });
    }

    var blockId = $(this).attr(mqBlockId),
      block = blockId && MathElement[blockId];
    return block && block.latex();
  case 'text':
    var blockId = $(this).attr(mqBlockId),
      block = blockId && MathElement[blockId];
    return block && block.text();
  case 'html':
    return this.html().replace(/ ?hasCursor|hasCursor /, '')
      .replace(/ class=(""|(?= |>))/g, '')
      .replace(/<span class="?cursor( blink)?"?><\/span>/i, '')
      .replace(/<span class="?textarea"?><textarea><\/textarea><\/span>/i, '');
  case 'write':
    if (arguments.length > 1)
      return this.each(function() {
        var blockId = $(this).attr(mqBlockId),
          block = blockId && MathElement[blockId],
          cursor = block && block.cursor;

        if (cursor)
          cursor.writeLatex(latex).parent.blur();
      });
  case 'cmd':
    if (arguments.length > 1)
      return this.each(function() {
        var blockId = $(this).attr(mqBlockId),
          block = blockId && MathElement[blockId],
          cursor = block && block.cursor;

        if (cursor) {
          var seln = cursor.prepareWrite();
          if (/^\\[a-z]+$/i.test(latex)) cursor.insertCmd(latex.slice(1), seln);
          else cursor.insertCh(latex, seln);
          cursor.hide().parent.blur();
        }
      });
  case 'vars':
    return jQuery.unique(jQuery('var',this).map(function(i,el) { return $(el).text(); }).get());  
  default:
    var textbox = cmd === 'textbox',
      editable = textbox || cmd === 'editable',
      RootBlock = textbox ? RootTextBlock : RootMathBlock;
    var options = latex;
    return this.each(function() {
      createRoot($(this), RootBlock(), textbox, editable, options);
    });
  }
};
var mathquillify = function() {
  // PVP - We will want to add the callback function for when
  // the user input changes. That and the fact that turbolinks
  // requires us to call this on page:load as well as document.
  // ready, I am commenting this out.
  // jQuery('.mathquill-editable:not(.mathquill-rendered-math)').mathquill('editable');
  jQuery('.mathquill-textbox:not(.mathquill-rendered-math)').mathquill('textbox');
  jQuery('.mathquill-embedded-latex').mathquill();
}
//on document ready, mathquill-ify all `<tag class="mathquill-*">latex</tag>`
//elements according to their CSS class.
jQuery(function() {
  mathquillify();
});

