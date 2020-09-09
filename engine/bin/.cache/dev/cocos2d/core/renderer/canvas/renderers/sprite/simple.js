
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'engine-dev/cocos2d/core/renderer/canvas/renderers/sprite/simple.js';
                    var __require = nodeEnv ? function (request) {
                        return require(request);
                    } : function (request) {
                        return __quick_compile_engine__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_engine__.registerModule(__filename, module);}"use strict";

exports.__esModule = true;
exports["default"] = void 0;

var _assembler = _interopRequireDefault(require("../../../assembler"));

var _renderData = _interopRequireDefault(require("../render-data"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var utils = require('../utils');

var CanvasSimpleSprite = /*#__PURE__*/function (_Assembler) {
  _inheritsLoose(CanvasSimpleSprite, _Assembler);

  function CanvasSimpleSprite() {
    return _Assembler.apply(this, arguments) || this;
  }

  var _proto = CanvasSimpleSprite.prototype;

  _proto.init = function init() {
    this._renderData = new _renderData["default"]();
    this._renderData.dataLength = 2;
  };

  _proto.updateRenderData = function updateRenderData(sprite) {
    if (sprite._vertsDirty) {
      this.updateUVs(sprite);
      this.updateVerts(sprite);
      sprite._vertsDirty = false;
    }
  };

  _proto.updateUVs = function updateUVs(sprite) {
    var frame = sprite.spriteFrame;
    var renderData = this._renderData;
    var verts = renderData.vertices;
    var rect = frame._rect;

    if (frame._rotated) {
      var l = rect.x;
      var r = rect.width;
      var b = rect.y;
      var t = rect.height;
      verts[0].u = l;
      verts[0].v = b;
      verts[1].u = t;
      verts[1].v = r;
    } else {
      var _l = rect.x;
      var _r = rect.width;
      var _b = rect.y;
      var _t = rect.height;
      verts[0].u = _l;
      verts[0].v = _b;
      verts[1].u = _r;
      verts[1].v = _t;
    }
  };

  _proto.updateVerts = function updateVerts(sprite) {
    var renderData = this._renderData,
        node = sprite.node,
        verts = renderData.vertices,
        frame = sprite.spriteFrame,
        cw = node.width,
        ch = node.height,
        appx = node.anchorX * cw,
        appy = node.anchorY * ch,
        l,
        b,
        r,
        t;

    if (sprite.trim) {
      l = -appx;
      b = -appy;
      r = cw;
      t = ch;
    } else {
      var ow = frame._originalSize.width,
          oh = frame._originalSize.height,
          rw = frame._rect.width,
          rh = frame._rect.height,
          offset = frame._offset,
          scaleX = cw / ow,
          scaleY = ch / oh;
      var trimLeft = offset.x + (ow - rw) / 2;
      var trimBottom = offset.y + (oh - rh) / 2;
      l = trimLeft * scaleX - appx;
      b = trimBottom * scaleY - appy;
      r = cw;
      t = ch;
    }

    if (frame._rotated) {
      verts[0].y = l;
      verts[0].x = b;
      verts[1].y = r;
      verts[1].x = t;
    } else {
      verts[0].x = l;
      verts[0].y = b;
      verts[1].x = r;
      verts[1].y = t;
    }

    renderData.vertDirty = false;
  };

  _proto.draw = function draw(ctx, comp) {
    var node = comp.node;
    var frame = comp._spriteFrame; // Transform

    var matrix = node._worldMatrix;
    var matrixm = matrix.m;
    var a = matrixm[0],
        b = matrixm[1],
        c = matrixm[4],
        d = matrixm[5],
        tx = matrixm[12],
        ty = matrixm[13];
    ctx.transform(a, b, c, d, tx, ty);
    ctx.scale(1, -1);

    if (frame._rotated) {
      ctx.rotate(-Math.PI / 2);
    } // TODO: handle blend function
    // opacity


    utils.context.setGlobalAlpha(ctx, node.opacity / 255);
    var tex = frame._texture,
        verts = this._renderData.vertices;
    var image = utils.getColorizedImage(tex, node._color);
    var x = verts[0].x;
    var y = verts[0].y;
    var w = verts[1].x;
    var h = verts[1].y;
    y = -y - h;
    var sx = verts[0].u;
    var sy = verts[0].v;
    var sw = verts[1].u;
    var sh = verts[1].v;
    ctx.drawImage(image, sx, sy, sw, sh, x, y, w, h);
    return 1;
  };

  return CanvasSimpleSprite;
}(_assembler["default"]);

exports["default"] = CanvasSimpleSprite;
module.exports = exports["default"];
                    }
                    if (nodeEnv) {
                        __define(__module.exports, __require, __module);
                    }
                    else {
                        __quick_compile_engine__.registerModuleFunc(__filename, function () {
                            __define(__module.exports, __require, __module);
                        });
                    }
                })();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVuZ2luZS1kZXYvY29jb3MyZC9jb3JlL3JlbmRlcmVyL2NhbnZhcy9yZW5kZXJlcnMvc3ByaXRlL3NpbXBsZS5qcyJdLCJuYW1lcyI6WyJ1dGlscyIsInJlcXVpcmUiLCJDYW52YXNTaW1wbGVTcHJpdGUiLCJpbml0IiwiX3JlbmRlckRhdGEiLCJSZW5kZXJEYXRhIiwiZGF0YUxlbmd0aCIsInVwZGF0ZVJlbmRlckRhdGEiLCJzcHJpdGUiLCJfdmVydHNEaXJ0eSIsInVwZGF0ZVVWcyIsInVwZGF0ZVZlcnRzIiwiZnJhbWUiLCJzcHJpdGVGcmFtZSIsInJlbmRlckRhdGEiLCJ2ZXJ0cyIsInZlcnRpY2VzIiwicmVjdCIsIl9yZWN0IiwiX3JvdGF0ZWQiLCJsIiwieCIsInIiLCJ3aWR0aCIsImIiLCJ5IiwidCIsImhlaWdodCIsInUiLCJ2Iiwibm9kZSIsImN3IiwiY2giLCJhcHB4IiwiYW5jaG9yWCIsImFwcHkiLCJhbmNob3JZIiwidHJpbSIsIm93IiwiX29yaWdpbmFsU2l6ZSIsIm9oIiwicnciLCJyaCIsIm9mZnNldCIsIl9vZmZzZXQiLCJzY2FsZVgiLCJzY2FsZVkiLCJ0cmltTGVmdCIsInRyaW1Cb3R0b20iLCJ2ZXJ0RGlydHkiLCJkcmF3IiwiY3R4IiwiY29tcCIsIl9zcHJpdGVGcmFtZSIsIm1hdHJpeCIsIl93b3JsZE1hdHJpeCIsIm1hdHJpeG0iLCJtIiwiYSIsImMiLCJkIiwidHgiLCJ0eSIsInRyYW5zZm9ybSIsInNjYWxlIiwicm90YXRlIiwiTWF0aCIsIlBJIiwiY29udGV4dCIsInNldEdsb2JhbEFscGhhIiwib3BhY2l0eSIsInRleCIsIl90ZXh0dXJlIiwiaW1hZ2UiLCJnZXRDb2xvcml6ZWRJbWFnZSIsIl9jb2xvciIsInciLCJoIiwic3giLCJzeSIsInN3Iiwic2giLCJkcmF3SW1hZ2UiLCJBc3NlbWJsZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUF5QkE7O0FBQ0E7Ozs7OztBQUNBLElBQU1BLEtBQUssR0FBR0Ms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QUFFLEdBQUdqRSxLQUFLLENBQUMsQ0FBRCxDQUFMLENBQVNhLENBQWxCO0FBQ0EsUUFBSXFELEVBQUUsR0FBR2xFLEtBQUssQ0FBQyxDQUFELENBQUwsQ0FBU2MsQ0FBbEI7QUFFQXNCLElBQUFBLEdBQUcsQ0FBQytCLFNBQUosQ0FBY1QsS0FBZCxFQUNJSyxFQURKLEVBQ1FDLEVBRFIsRUFDWUMsRUFEWixFQUNnQkMsRUFEaEIsRUFFSTVELENBRkosRUFFT0ksQ0FGUCxFQUVVbUQsQ0FGVixFQUVhQyxDQUZiO0FBR0EsV0FBTyxDQUFQO0FBQ0g7OztFQTNIMkNNIiwic291cmNlc0NvbnRlbnQiOlsiLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiBDb3B5cmlnaHQgKGMpIDIwMTggWGlhbWVuIFlhamkgU29mdHdhcmUgQ28uLCBMdGQuXG5cbiBodHRwczovL3d3dy5jb2Nvcy5jb20vXG5cbiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBlbmdpbmUgc291cmNlIGNvZGUgKHRoZSBcIlNvZnR3YXJlXCIpLCBhIGxpbWl0ZWQsXG4gd29ybGR3aWRlLCByb3lhbHR5LWZyZWUsIG5vbi1hc3NpZ25hYmxlLCByZXZvY2FibGUgYW5kIG5vbi1leGNsdXNpdmUgbGljZW5zZVxuIHRvIHVzZSBDb2NvcyBDcmVhdG9yIHNvbGVseSB0byBkZXZlbG9wIGdhbWVzIG9uIHlvdXIgdGFyZ2V0IHBsYXRmb3Jtcy4gWW91IHNoYWxsXG4gbm90IHVzZSBDb2NvcyBDcmVhdG9yIHNvZnR3YXJlIGZvciBkZXZlbG9waW5nIG90aGVyIHNvZnR3YXJlIG9yIHRvb2xzIHRoYXQnc1xuIHVzZWQgZm9yIGRldmVsb3BpbmcgZ2FtZXMuIFlvdSBhcmUgbm90IGdyYW50ZWQgdG8gcHVibGlzaCwgZGlzdHJpYnV0ZSxcbiBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgQ29jb3MgQ3JlYXRvci5cblxuIFRoZSBzb2Z0d2FyZSBvciB0b29scyBpbiB0aGlzIExpY2Vuc2UgQWdyZWVtZW50IGFyZSBsaWNlbnNlZCwgbm90IHNvbGQuXG4gWGlhbWVuIFlhamkgU29mdHdhcmUgQ28uLCBMdGQuIHJlc2VydmVzIGFsbCByaWdodHMgbm90IGV4cHJlc3NseSBncmFudGVkIHRvIHlvdS5cblxuIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbiBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4gVEhFIFNPRlRXQVJFLlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbmltcG9ydCBBc3NlbWJsZXIgZnJvbSAnLi4vLi4vLi4vYXNzZW1ibGVyJztcbmltcG9ydCBSZW5kZXJEYXRhIGZyb20gJy4uL3JlbmRlci1kYXRhJztcbmNvbnN0IHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2FudmFzU2ltcGxlU3ByaXRlIGV4dGVuZHMgQXNzZW1ibGVyIHtcbiAgICBpbml0ICgpIHtcbiAgICAgICAgdGhpcy5fcmVuZGVyRGF0YSA9IG5ldyBSZW5kZXJEYXRhKCk7XG4gICAgICAgIHRoaXMuX3JlbmRlckRhdGEuZGF0YUxlbmd0aCA9IDI7XG4gICAgfVxuXG4gICAgdXBkYXRlUmVuZGVyRGF0YSAoc3ByaXRlKSB7XG4gICAgICAgIGlmIChzcHJpdGUuX3ZlcnRzRGlydHkpIHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlVVZzKHNwcml0ZSk7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVZlcnRzKHNwcml0ZSk7XG4gICAgICAgICAgICBzcHJpdGUuX3ZlcnRzRGlydHkgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHVwZGF0ZVVWcyAoc3ByaXRlKSB7XG4gICAgICAgIGxldCBmcmFtZSA9IHNwcml0ZS5zcHJpdGVGcmFtZTtcbiAgICAgICAgbGV0IHJlbmRlckRhdGEgPSB0aGlzLl9yZW5kZXJEYXRhO1xuICAgICAgICBsZXQgdmVydHMgPSByZW5kZXJEYXRhLnZlcnRpY2VzO1xuICAgICAgICBsZXQgcmVjdCA9IGZyYW1lLl9yZWN0O1xuICAgICAgICBcbiAgICAgICAgaWYgKGZyYW1lLl9yb3RhdGVkKSB7XG4gICAgICAgICAgICBsZXQgbCA9IHJlY3QueDtcbiAgICAgICAgICAgIGxldCByID0gcmVjdC53aWR0aDtcbiAgICAgICAgICAgIGxldCBiID0gcmVjdC55O1xuICAgICAgICAgICAgbGV0IHQgPSByZWN0LmhlaWdodDtcbiAgICAgICAgICAgIHZlcnRzWzBdLnUgPSBsO1xuICAgICAgICAgICAgdmVydHNbMF0udiA9IGI7XG4gICAgICAgICAgICB2ZXJ0c1sxXS51ID0gdDtcbiAgICAgICAgICAgIHZlcnRzWzFdLnYgPSByO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbGV0IGwgPSByZWN0Lng7XG4gICAgICAgICAgICBsZXQgciA9IHJlY3Qud2lkdGg7XG4gICAgICAgICAgICBsZXQgYiA9IHJlY3QueTtcbiAgICAgICAgICAgIGxldCB0ID0gcmVjdC5oZWlnaHQ7XG4gICAgICAgICAgICB2ZXJ0c1swXS51ID0gbDtcbiAgICAgICAgICAgIHZlcnRzWzBdLnYgPSBiO1xuICAgICAgICAgICAgdmVydHNbMV0udSA9IHI7XG4gICAgICAgICAgICB2ZXJ0c1sxXS52ID0gdDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHVwZGF0ZVZlcnRzIChzcHJpdGUpIHtcbiAgICAgICAgbGV0IHJlbmRlckRhdGEgPSB0aGlzLl9yZW5kZXJEYXRhLFxuICAgICAgICAgICAgbm9kZSA9IHNwcml0ZS5ub2RlLFxuICAgICAgICAgICAgdmVydHMgPSByZW5kZXJEYXRhLnZlcnRpY2VzLFxuICAgICAgICAgICAgZnJhbWUgPSBzcHJpdGUuc3ByaXRlRnJhbWUsXG4gICAgICAgICAgICBjdyA9IG5vZGUud2lkdGgsIGNoID0gbm9kZS5oZWlnaHQsXG4gICAgICAgICAgICBhcHB4ID0gbm9kZS5hbmNob3JYICogY3csIGFwcHkgPSBub2RlLmFuY2hvclkgKiBjaCxcbiAgICAgICAgICAgIGwsIGIsIHIsIHQ7XG4gICAgICAgIGlmIChzcHJpdGUudHJpbSkge1xuICAgICAgICAgICAgbCA9IC1hcHB4O1xuICAgICAgICAgICAgYiA9IC1hcHB5O1xuICAgICAgICAgICAgciA9IGN3O1xuICAgICAgICAgICAgdCA9IGNoO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbGV0IG93ID0gZnJhbWUuX29yaWdpbmFsU2l6ZS53aWR0aCwgb2ggPSBmcmFtZS5fb3JpZ2luYWxTaXplLmhlaWdodCxcbiAgICAgICAgICAgICAgICBydyA9IGZyYW1lLl9yZWN0LndpZHRoLCByaCA9IGZyYW1lLl9yZWN0LmhlaWdodCxcbiAgICAgICAgICAgICAgICBvZmZzZXQgPSBmcmFtZS5fb2Zmc2V0LFxuICAgICAgICAgICAgICAgIHNjYWxlWCA9IGN3IC8gb3csIHNjYWxlWSA9IGNoIC8gb2g7XG4gICAgICAgICAgICBsZXQgdHJpbUxlZnQgPSBvZmZzZXQueCArIChvdyAtIHJ3KSAvIDI7XG4gICAgICAgICAgICBsZXQgdHJpbUJvdHRvbSA9IG9mZnNldC55ICsgKG9oIC0gcmgpIC8gMjtcbiAgICAgICAgICAgIGwgPSB0cmltTGVmdCAqIHNjYWxlWCAtIGFwcHg7XG4gICAgICAgICAgICBiID0gdHJpbUJvdHRvbSAqIHNjYWxlWSAtIGFwcHk7XG4gICAgICAgICAgICByID0gY3c7XG4gICAgICAgICAgICB0ID0gY2g7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmIChmcmFtZS5fcm90YXRlZCkge1xuICAgICAgICAgICAgdmVydHNbMF0ueSA9IGw7XG4gICAgICAgICAgICB2ZXJ0c1swXS54ID0gYjtcbiAgICAgICAgICAgIHZlcnRzWzFdLnkgPSByO1xuICAgICAgICAgICAgdmVydHNbMV0ueCA9IHQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2ZXJ0c1swXS54ID0gbDtcbiAgICAgICAgICAgIHZlcnRzWzBdLnkgPSBiO1xuICAgICAgICAgICAgdmVydHNbMV0ueCA9IHI7XG4gICAgICAgICAgICB2ZXJ0c1sxXS55ID0gdDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmVuZGVyRGF0YS52ZXJ0RGlydHkgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBkcmF3IChjdHgsIGNvbXApIHtcbiAgICAgICAgbGV0IG5vZGUgPSBjb21wLm5vZGU7XG4gICAgICAgIGxldCBmcmFtZSA9IGNvbXAuX3Nwcml0ZUZyYW1lO1xuICAgICAgICAvLyBUcmFuc2Zvcm1cbiAgICAgICAgbGV0IG1hdHJpeCA9IG5vZGUuX3dvcmxkTWF0cml4O1xuICAgICAgICBsZXQgbWF0cml4bSA9IG1hdHJpeC5tO1xuICAgICAgICBsZXQgYSA9IG1hdHJpeG1bMF0sIGIgPSBtYXRyaXhtWzFdLCBjID0gbWF0cml4bVs0XSwgZCA9IG1hdHJpeG1bNV0sXG4gICAgICAgICAgICB0eCA9IG1hdHJpeG1bMTJdLCB0eSA9IG1hdHJpeG1bMTNdO1xuICAgICAgICBjdHgudHJhbnNmb3JtKGEsIGIsIGMsIGQsIHR4LCB0eSk7XG4gICAgICAgIGN0eC5zY2FsZSgxLCAtMSk7XG4gICAgICAgIGlmIChmcmFtZS5fcm90YXRlZCkge1xuICAgICAgICAgICAgY3R4LnJvdGF0ZSgtIE1hdGguUEkgLyAyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRPRE86IGhhbmRsZSBibGVuZCBmdW5jdGlvblxuXG4gICAgICAgIC8vIG9wYWNpdHlcbiAgICAgICAgdXRpbHMuY29udGV4dC5zZXRHbG9iYWxBbHBoYShjdHgsIG5vZGUub3BhY2l0eSAvIDI1NSk7XG5cbiAgICAgICAgbGV0IHRleCA9IGZyYW1lLl90ZXh0dXJlLFxuICAgICAgICAgICAgdmVydHMgPSB0aGlzLl9yZW5kZXJEYXRhLnZlcnRpY2VzO1xuXG4gICAgICAgIGxldCBpbWFnZSA9IHV0aWxzLmdldENvbG9yaXplZEltYWdlKHRleCwgbm9kZS5fY29sb3IpO1xuXG4gICAgICAgIGxldCB4ID0gdmVydHNbMF0ueDtcbiAgICAgICAgbGV0IHkgPSB2ZXJ0c1swXS55O1xuICAgICAgICBsZXQgdyA9IHZlcnRzWzFdLng7XG4gICAgICAgIGxldCBoID0gdmVydHNbMV0ueTtcbiAgICAgICAgeSA9IC0geSAtIGg7XG5cbiAgICAgICAgbGV0IHN4ID0gdmVydHNbMF0udTtcbiAgICAgICAgbGV0IHN5ID0gdmVydHNbMF0udjtcbiAgICAgICAgbGV0IHN3ID0gdmVydHNbMV0udTtcbiAgICAgICAgbGV0IHNoID0gdmVydHNbMV0udjtcblxuICAgICAgICBjdHguZHJhd0ltYWdlKGltYWdlLFxuICAgICAgICAgICAgc3gsIHN5LCBzdywgc2gsXG4gICAgICAgICAgICB4LCB5LCB3LCBoKTtcbiAgICAgICAgcmV0dXJuIDE7XG4gICAgfVxufVxuXG4iXSwic291cmNlUm9vdCI6Ii8ifQ==