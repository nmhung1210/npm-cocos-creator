
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'engine-dev/cocos2d/core/renderer/utils/dynamic-atlas/atlas.js';
                    var __require = nodeEnv ? function (request) {
                        return require(request);
                    } : function (request) {
                        return __quick_compile_engine__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_engine__.registerModule(__filename, module);}"use strict";

var RenderTexture = require('../../../assets/CCRenderTexture');

var space = 2;

function Atlas(width, height) {
  var texture = new RenderTexture();
  texture.initWithSize(width, height);
  texture.update();
  this._texture = texture;
  this._x = space;
  this._y = space;
  this._nexty = space;
  this._width = width;
  this._height = height;
  this._innerTextureInfos = {};
  this._innerSpriteFrames = [];
  this._count = 0;
}

Atlas.DEFAULT_HASH = new RenderTexture()._getHash();
cc.js.mixin(Atlas.prototype, {
  insertSpriteFrame: function insertSpriteFrame(spriteFrame) {
    var rect = spriteFrame._rect,
        texture = spriteFrame._texture,
        info = this._innerTextureInfos[texture._id];
    var sx = rect.x,
        sy = rect.y;

    if (info) {
      sx += info.x;
      sy += info.y;
    } else {
      var width = texture.width,
          height = texture.height;

      if (this._x + width + space > this._width) {
        this._x = space;
        this._y = this._nexty;
      }

      if (this._y + height + space > this._nexty) {
        this._nexty = this._y + height + space;
      }

      if (this._nexty > this._height) {
        return null;
      } // texture bleeding


      if (cc.dynamicAtlasManager.textureBleeding) {
        // Smaller frame is more likely to be affected by linear filter
        if (width <= 8 || height <= 8) {
          this._texture.drawTextureAt(texture, this._x - 1, this._y - 1);

          this._texture.drawTextureAt(texture, this._x - 1, this._y + 1);

          this._texture.drawTextureAt(texture, this._x + 1, this._y - 1);

          this._texture.drawTextureAt(texture, this._x + 1, this._y + 1);
        }

        this._texture.drawTextureAt(texture, this._x - 1, this._y);

        this._texture.drawTextureAt(texture, this._x + 1, this._y);

        this._texture.drawTextureAt(texture, this._x, this._y - 1);

        this._texture.drawTextureAt(texture, this._x, this._y + 1);
      }

      this._texture.drawTextureAt(texture, this._x, this._y);

      this._innerTextureInfos[texture._id] = {
        x: this._x,
        y: this._y,
        texture: texture
      };
      this._count++;
      sx += this._x;
      sy += this._y;
      this._x += width + space;
      this._dirty = true;
    }

    var frame = {
      x: sx,
      y: sy,
      texture: this._texture
    };

    this._innerSpriteFrames.push(spriteFrame);

    return frame;
  },
  update: function update() {
    if (!this._dirty) return;

    this._texture.update();

    this._dirty = false;
  },
  deleteInnerTexture: function deleteInnerTexture(texture) {
    if (texture && this._innerTextureInfos[texture._id]) {
      delete this._innerTextureInfos[texture._id];
      this._count--;
    }
  },
  isEmpty: function isEmpty() {
    return this._count <= 0;
  },
  reset: function reset() {
    this._x = space;
    this._y = space;
    this._nexty = space;
    var frames = this._innerSpriteFrames;

    for (var i = 0, l = frames.length; i < l; i++) {
      var frame = frames[i];

      if (!frame.isValid) {
        continue;
      }

      frame._resetDynamicAtlasFrame();
    }

    this._innerSpriteFrames.length = 0;
    this._innerTextureInfos = {};
  },
  destroy: function destroy() {
    this.reset();

    this._texture.destroy();
  }
});
module.exports = Atlas;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVuZ2luZS1kZXYvY29jb3MyZC9jb3JlL3JlbmRlcmVyL3V0aWxzL2R5bmFtaWMtYXRsYXMvYXRsYXMuanMiXSwibmFtZXMiOlsiUmVuZGVyVGV4dHVyZSIsInJlcXVpcmUiLCJzcGFjZSIsIkF0bGFzIiwid2lkdGgiLCJoZWlnaHQiLCJ0ZXh0dXJlIiwiaW5pdFdpdGhTaXplIiwidXBkYXRlIiwiX3RleHR1cmUiLCJfeCIsIl95IiwiX25leHR5IiwiX3dpZHRoIiwiX2hlaWdodCIsIl9pbm5lclRleHR1cmVJbmZvcyIsIl9pbm5lclNwcml0ZUZyYW1lcyIsIl9jb3VudCIsIkRFRkFVTFRfSEFTSCIsIl9nZXRIYXNoIiwiY2MiLCJqcyIsIm1peGluIiwicHJvdG90eXBlIiwiaW5zZXJ0U3ByaXRlRnJhbWUiLCJzcHJpdGVGcmFtZSIsInJlY3QiLCJfcmVjdCIsImluZm8iLCJfaWQiLCJzeCIsIngiLCJzeSIsInkiLCJkeW5hbWljQXRsYXNNYW5hZ2VyIiwidGV4dHVyZUJsZWVkaW5nIiwiZHJhd1RleHR1cmVBdCIsIl9kaXJ0eSIsImZyYW1lIiwicHVzaCIsImRlbGV0ZUlubmVyVGV4dHVyZSIsImlzRW1wdHkiLCJyZXNldCIsImZyYW1lcyIsImkiLCJsIiwibGVuZ3RoIiwiaXNWYWxpZCIsIl9yZXNldER5bmFtaWNBdGxhc0ZyYW1lIiwiZGVzdHJveSIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFBQSxJQUFNQSxhQUFhLEdBQUdDLE9BQU8sQ0FBQyxpQ0FBRCxDQUE3Qjs7QUFFQSxJQUFNQyxLQUFLLEdBQUcsQ0FBZDs7QUFFQSxTQUFTQyxLQUFULENBQWdCQyxLQUFoQixFQUF1QkMsTUFBdkIsRUFBK0I7QUFDM0IsTUFBSUMsT0FBTyxHQUFHLElBQUlOLGFBQUosRUFBZDtBQUNBTSxFQUFBQSxPQUFPLENBQUNDLFlBQVIsQ0FBcUJILEtBQXJCLEVBQTRCQyxNQUE1QjtBQUNBQyxFQUFBQSxPQUFPLENBQUNFLE1B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ZDtBQUNIO0FBOUd3QixDQUE3QjtBQWlIQUMsTUFBTSxDQUFDQyxPQUFQLEdBQWlCaEQsS0FBakIiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBSZW5kZXJUZXh0dXJlID0gcmVxdWlyZSgnLi4vLi4vLi4vYXNzZXRzL0NDUmVuZGVyVGV4dHVyZScpO1xuXG5jb25zdCBzcGFjZSA9IDI7XG5cbmZ1bmN0aW9uIEF0bGFzICh3aWR0aCwgaGVpZ2h0KSB7XG4gICAgbGV0IHRleHR1cmUgPSBuZXcgUmVuZGVyVGV4dHVyZSgpO1xuICAgIHRleHR1cmUuaW5pdFdpdGhTaXplKHdpZHRoLCBoZWlnaHQpO1xuICAgIHRleHR1cmUudXBkYXRlKCk7XG4gICAgXG4gICAgdGhpcy5fdGV4dHVyZSA9IHRleHR1cmU7XG5cbiAgICB0aGlzLl94ID0gc3BhY2U7XG4gICAgdGhpcy5feSA9IHNwYWNlO1xuICAgIHRoaXMuX25leHR5ID0gc3BhY2U7XG5cbiAgICB0aGlzLl93aWR0aCA9IHdpZHRoO1xuICAgIHRoaXMuX2hlaWdodCA9IGhlaWdodDtcblxuICAgIHRoaXMuX2lubmVyVGV4dHVyZUluZm9zID0ge307XG4gICAgdGhpcy5faW5uZXJTcHJpdGVGcmFtZXMgPSBbXTtcblxuICAgIHRoaXMuX2NvdW50ID0gMDtcbn1cblxuQXRsYXMuREVGQVVMVF9IQVNIID0gKG5ldyBSZW5kZXJUZXh0dXJlKCkpLl9nZXRIYXNoKCk7XG5cbmNjLmpzLm1peGluKEF0bGFzLnByb3RvdHlwZSwge1xuICAgIGluc2VydFNwcml0ZUZyYW1lIChzcHJpdGVGcmFtZSkge1xuICAgICAgICBsZXQgcmVjdCA9IHNwcml0ZUZyYW1lLl9yZWN0LFxuICAgICAgICAgICAgdGV4dHVyZSA9IHNwcml0ZUZyYW1lLl90ZXh0dXJlLFxuICAgICAgICAgICAgaW5mbyA9IHRoaXMuX2lubmVyVGV4dHVyZUluZm9zW3RleHR1cmUuX2lkXTtcblxuICAgICAgICBsZXQgc3ggPSByZWN0LngsIHN5ID0gcmVjdC55O1xuXG4gICAgICAgIGlmIChpbmZvKSB7XG4gICAgICAgICAgICBzeCArPSBpbmZvLng7XG4gICAgICAgICAgICBzeSArPSBpbmZvLnk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBsZXQgd2lkdGggPSB0ZXh0dXJlLndpZHRoLCBoZWlnaHQgPSB0ZXh0dXJlLmhlaWdodDsgICAgICAgIFxuXG4gICAgICAgICAgICBpZiAoKHRoaXMuX3ggKyB3aWR0aCArIHNwYWNlKSA+IHRoaXMuX3dpZHRoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5feCA9IHNwYWNlO1xuICAgICAgICAgICAgICAgIHRoaXMuX3kgPSB0aGlzLl9uZXh0eTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCh0aGlzLl95ICsgaGVpZ2h0ICsgc3BhY2UpID4gdGhpcy5fbmV4dHkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9uZXh0eSA9IHRoaXMuX3kgKyBoZWlnaHQgKyBzcGFjZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoaXMuX25leHR5ID4gdGhpcy5faGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIHRleHR1cmUgYmxlZWRpbmdcbiAgICAgICAgICAgIGlmIChjYy5keW5hbWljQXRsYXNNYW5hZ2VyLnRleHR1cmVCbGVlZGluZykge1xuICAgICAgICAgICAgICAgIC8vIFNtYWxsZXIgZnJhbWUgaXMgbW9yZSBsaWtlbHkgdG8gYmUgYWZmZWN0ZWQgYnkgbGluZWFyIGZpbHRlclxuICAgICAgICAgICAgICAgIGlmICh3aWR0aCA8PSA4IHx8IGhlaWdodCA8PSA4KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3RleHR1cmUuZHJhd1RleHR1cmVBdCh0ZXh0dXJlLCB0aGlzLl94LTEsIHRoaXMuX3ktMSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3RleHR1cmUuZHJhd1RleHR1cmVBdCh0ZXh0dXJlLCB0aGlzLl94LTEsIHRoaXMuX3krMSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3RleHR1cmUuZHJhd1RleHR1cmVBdCh0ZXh0dXJlLCB0aGlzLl94KzEsIHRoaXMuX3ktMSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3RleHR1cmUuZHJhd1RleHR1cmVBdCh0ZXh0dXJlLCB0aGlzLl94KzEsIHRoaXMuX3krMSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGhpcy5fdGV4dHVyZS5kcmF3VGV4dHVyZUF0KHRleHR1cmUsIHRoaXMuX3gtMSwgdGhpcy5feSk7XG4gICAgICAgICAgICAgICAgdGhpcy5fdGV4dHVyZS5kcmF3VGV4dHVyZUF0KHRleHR1cmUsIHRoaXMuX3grMSwgdGhpcy5feSk7XG4gICAgICAgICAgICAgICAgdGhpcy5fdGV4dHVyZS5kcmF3VGV4dHVyZUF0KHRleHR1cmUsIHRoaXMuX3gsIHRoaXMuX3ktMSk7XG4gICAgICAgICAgICAgICAgdGhpcy5fdGV4dHVyZS5kcmF3VGV4dHVyZUF0KHRleHR1cmUsIHRoaXMuX3gsIHRoaXMuX3krMSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX3RleHR1cmUuZHJhd1RleHR1cmVBdCh0ZXh0dXJlLCB0aGlzLl94LCB0aGlzLl95KTtcblxuICAgICAgICAgICAgdGhpcy5faW5uZXJUZXh0dXJlSW5mb3NbdGV4dHVyZS5faWRdID0ge1xuICAgICAgICAgICAgICAgIHg6IHRoaXMuX3gsXG4gICAgICAgICAgICAgICAgeTogdGhpcy5feSxcbiAgICAgICAgICAgICAgICB0ZXh0dXJlOiB0ZXh0dXJlXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB0aGlzLl9jb3VudCsrO1xuXG4gICAgICAgICAgICBzeCArPSB0aGlzLl94O1xuICAgICAgICAgICAgc3kgKz0gdGhpcy5feTtcblxuICAgICAgICAgICAgdGhpcy5feCArPSB3aWR0aCArIHNwYWNlO1xuXG4gICAgICAgICAgICB0aGlzLl9kaXJ0eSA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZnJhbWUgPSB7XG4gICAgICAgICAgICB4OiBzeCxcbiAgICAgICAgICAgIHk6IHN5LFxuICAgICAgICAgICAgdGV4dHVyZTogdGhpcy5fdGV4dHVyZVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB0aGlzLl9pbm5lclNwcml0ZUZyYW1lcy5wdXNoKHNwcml0ZUZyYW1lKTtcblxuICAgICAgICByZXR1cm4gZnJhbWU7XG4gICAgfSxcblxuICAgIHVwZGF0ZSAoKSB7XG4gICAgICAgIGlmICghdGhpcy5fZGlydHkpIHJldHVybjtcbiAgICAgICAgdGhpcy5fdGV4dHVyZS51cGRhdGUoKTtcbiAgICAgICAgdGhpcy5fZGlydHkgPSBmYWxzZTtcbiAgICB9LFxuXG4gICAgZGVsZXRlSW5uZXJUZXh0dXJlICh0ZXh0dXJlKSB7XG4gICAgICAgIGlmICh0ZXh0dXJlICYmIHRoaXMuX2lubmVyVGV4dHVyZUluZm9zW3RleHR1cmUuX2lkXSkge1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMuX2lubmVyVGV4dHVyZUluZm9zW3RleHR1cmUuX2lkXTtcbiAgICAgICAgICAgIHRoaXMuX2NvdW50LS07XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgaXNFbXB0eSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jb3VudCA8PSAwO1xuICAgIH0sXG4gICAgXG4gICAgcmVzZXQgKCkge1xuICAgICAgICB0aGlzLl94ID0gc3BhY2U7XG4gICAgICAgIHRoaXMuX3kgPSBzcGFjZTtcbiAgICAgICAgdGhpcy5fbmV4dHkgPSBzcGFjZTtcblxuICAgICAgICBsZXQgZnJhbWVzID0gdGhpcy5faW5uZXJTcHJpdGVGcmFtZXM7XG4gICAgICAgIGZvciAobGV0IGkgPSAwLCBsID0gZnJhbWVzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgbGV0IGZyYW1lID0gZnJhbWVzW2ldO1xuICAgICAgICAgICAgaWYgKCFmcmFtZS5pc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmcmFtZS5fcmVzZXREeW5hbWljQXRsYXNGcmFtZSgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2lubmVyU3ByaXRlRnJhbWVzLmxlbmd0aCA9IDA7XG4gICAgICAgIHRoaXMuX2lubmVyVGV4dHVyZUluZm9zID0ge307XG4gICAgfSxcblxuICAgIGRlc3Ryb3kgKCkge1xuICAgICAgICB0aGlzLnJlc2V0KCk7XG4gICAgICAgIHRoaXMuX3RleHR1cmUuZGVzdHJveSgpO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEF0bGFzO1xuIl0sInNvdXJjZVJvb3QiOiIvIn0=