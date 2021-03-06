// Generated by CoffeeScript 1.3.3
(function() {

  Drupal.ShareJS = function(_editor, _docName, _editorType) {
    var assertLoadMathQuill, assertLoadShareJS, docName, editor, editorType, inMathEnvironment;
    editor = _editor;
    docName = _docName;
    editorType = _editorType;
    inMathEnvironment = function(callback) {
      var c, inMath, mathBegin, mathEnd, r, rDoc, range;
      range = editor.getCursorPosition();
      r = range.row;
      c = range.column;
      rDoc = editor.getSession().getDocument();
      inMath = 0;
      mathBegin = 0;
      mathEnd = 0;
      rDoc.getLine(r).replace(/\$/g, function(token, pos) {
        if (pos < c) {
          inMath ^= 1;
          if (inMath) {
            return mathBegin = pos + 1;
          }
        } else {
          if (mathEnd === 0) {
            return mathEnd = pos;
          }
        }
      });
      if (mathEnd < mathBegin) {
        mathEnd = rDoc.getLine(r).length;
      }
      if (inMath) {
        return callback(null, {
          start: {
            row: r,
            column: mathBegin
          },
          end: {
            row: r,
            column: mathEnd
          },
          isEmpty: function() {
            return false;
          },
          isMultiLine: function() {
            return false;
          }
        });
      } else {
        return callback(null, null);
      }
    };
    assertLoadMathQuill = function(_callback) {
      var libPath;
      libPath = Drupal.settings.basePath + "sites/all/libraries/mathquill/";
      return async.waterfall([
        function(callback) {
          return jQuery.getScript(libPath + "build/mathquill.js", function(success, textStatus, jqXHR) {
            return callback(null);
          });
        }, function(callback) {
          jQuery('head').append(jQuery('<link rel="stylesheet" type="text/css" />').attr('href', libPath + "mathquill.css"));
          return callback();
        }
      ], _callback);
    };
    assertLoadShareJS = function(_callback) {
      if (typeof ShareJS !== "undefined" && ShareJS !== null) {
        _callback();
        return;
      }
      return async.waterfall([
        function(callback) {
          return jQuery.getScript(Drupal.settings.ShareJSConfig.url + "channel/bcsocket.js", function(success, textStatus, jqXHR) {
            return callback(null);
          });
        }, function(callback) {
          return jQuery.getScript(Drupal.settings.ShareJSConfig.url + "share/AttributePool.js", function(success, textStatus, jqXHR) {
            return callback(null);
          });
        }, function(callback) {
          return jQuery.getScript(Drupal.settings.ShareJSConfig.url + "share/Changeset.js", function(success, textStatus, jqXHR) {
            return callback(null);
          });
        }, function(callback) {
          return jQuery.getScript(Drupal.settings.ShareJSConfig.url + "share/share.uncompressed.js", function(success, textStatus, jqXHR) {
            return callback(null);
          });
        }, function(callback) {
          return jQuery.getScript(Drupal.settings.ShareJSConfig.url + "share/ace.js", function(success, textStatus, jqXHR) {
            return callback(null);
          });
        }
      ], _callback);
    };
    this.initToolbar = function(_callback) {
      editor.addToolbarButton("Bold", "bold", function(data) {
        var rDoc, range;
        range = editor.getSelectionRange();
        rDoc = editor.getSession().getDocument();
        rDoc.insert(range.end, "}");
        return rDoc.insert(range.start, "\\bf{");
      });
      editor.addToolbarButton("Italic", "italic", function(data) {
        var rDoc, range;
        range = editor.getSelectionRange();
        rDoc = editor.getSession().getDocument();
        rDoc.insert(range.end, "}");
        return rDoc.insert(range.start, "\\em{");
      });
      editor.addToolbarButton("Add formula", "formula", function(data) {
        return async.waterfall([
          function(callback) {
            return assertLoadMathQuill(callback);
          }, function(callback) {
            return inMathEnvironment(callback);
          }, function(range, callback) {
            var formulaText, insertFormula, rDoc;
            rDoc = editor.getSession().getDocument();
            console.log("Range=", range);
            formulaText = "";
            if (range != null) {
              formulaText = rDoc.getTextRange(range);
            }
            insertFormula = function() {
              var txt;
              txt = jQuery("#mathedit span").mathquill("latex");
              if ((range != null)) {
                rDoc.replace(range, txt);
              } else {
                editor.insert("$" + txt + "$");
              }
              jQuery("#mathedit").dialog("close");
              return editor.focus();
            };
            if (jQuery("#mathedit").size() === 0) {
              jQuery("<div>").attr("id", "mathedit").appendTo("body");
              jQuery("<span>").text(formulaText).appendTo("#mathedit").mathquill("editable");
              jQuery("#mathedit span").bind('keydown', function(e) {
                var code;
                if ((e.keyCode != null)) {
                  code = e.keyCode;
                } else {
                  code = e.which;
                }
                if (code === 13) {
                  e.stopPropagation();
                  insertFormula();
                }
              });
            } else {
              jQuery("#mathedit span").mathquill("latex", formulaText);
            }
            jQuery("#mathedit").dialog({
              "title": "Edit math",
              buttons: [
                {
                  "text": "insert",
                  click: insertFormula
                }
              ]
            });
            return callback();
          }
        ]);
      });
      return editor.addToolbarButton("Share", "share", function() {
        return async.waterfall([
          function(callback) {
            return assertLoadShareJS(callback);
          }, function(callback) {
            return sharejs.open(docName, 'etherpad', Drupal.settings.ShareJSConfig.url + "channel", callback);
          }, function(doc, callback) {
            var choice, initText, sharetext;
            sharetext = doc.type.api.getText.apply(doc);
            initText = editor.getSession().getDocument().getValue();
            if (sharetext === initText) {
              return callback(null, doc, true);
            }
            choice = confirm("Somebody else is editing this document. Would you like to collaborate on it?");
            if (choice) {
              return callback(null, doc, true);
            }
            docName += Math.random();
            return sharejs.open(docName, 'etherpad', Drupal.settings.ShareJSConfig.url + "channel", callback);
          }, function(doc, keep, callback) {
            if ((callback != null)) {
              return doc["attach_" + editorType](editor, false);
            } else {
              return doc["attach_" + editorType](editor, true);
            }
          }
        ], function(err) {
          if (err != null) {
            return console.log(err);
          }
        });
      });
    };
    return this;
  };

}).call(this);
