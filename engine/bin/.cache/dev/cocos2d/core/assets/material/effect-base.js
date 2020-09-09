
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'engine-dev/cocos2d/core/assets/material/effect-base.js';
                    var __require = nodeEnv ? function (request) {
                        return require(request);
                    } : function (request) {
                        return __quick_compile_engine__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_engine__.registerModule(__filename, module);}"use strict";

exports.__esModule = true;
exports["default"] = void 0;

var _pass = _interopRequireDefault(require("../../../renderer/core/pass"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var gfx = cc.gfx;

var EffectBase = /*#__PURE__*/function () {
  function EffectBase() {
    this._dirty = true;
    this._name = '';
    this._technique = null;
  }

  var _proto = EffectBase.prototype;

  _proto._createPassProp = function _createPassProp(name, pass) {
    var prop = pass._properties[name];

    if (!prop) {
      return;
    }

    var uniform = Object.create(null);
    uniform.name = name;
    uniform.type = prop.type;

    if (prop.value instanceof Float32Array) {
      uniform.value = new Float32Array(prop.value);
    } else {
      uniform.value = prop.value;
    }

    pass._properties[name] = uniform;
    return uniform;
  };

  _proto._setPassProperty = function _setPassProperty(name, value, pass, directly) {
    var properties = pass._properties;
    var uniform = properties.hasOwnProperty(name);

    if (!uniform) {
      uniform = this._createPassProp(name, pass);
    } else if (uniform.value === value) return;

    this._dirty = true;
    return _pass["default"].prototype.setProperty.call(pass, name, value, directly);
  };

  _proto.setProperty = function setProperty(name, value, passIdx, directly) {
    var success = false;
    var passes = this.passes;
    var start = 0,
        end = passes.length;

    if (passIdx !== undefined) {
      start = passIdx, end = passIdx + 1;
    }

    for (var i = start; i < end; i++) {
      if (this._setPassProperty(name, value, passes[i], directly)) {
        success = true;
      }
    }

    if (!success) {
      cc.warnID(9103, this.name, name);
    }
  };

  _proto.getProperty = function getProperty(name, passIdx) {
    var passes = this.passes;
    if (passIdx >= passes.length) return;
    var start = 0,
        end = passes.length;

    if (passIdx !== undefined) {
      start = passIdx, end = passIdx + 1;
    }

    for (var i = start; i < end; i++) {
      var value = passes[i].getProperty(name);

      if (value !== undefined) {
        return value;
      }
    }
  };

  _proto.define = function define(name, value, passIdx, force) {
    var success = false;
    var passes = this.passes;
    var start = 0,
        end = passes.length;

    if (passIdx !== undefined) {
      start = passIdx, end = passIdx + 1;
    }

    for (var i = start; i < end; i++) {
      if (passes[i].define(name, value, force)) {
        success = true;
      }
    }

    if (!success) {
      cc.warnID(9104, this.name, name);
    }
  };

  _proto.getDefine = function getDefine(name, passIdx) {
    var passes = this.passes;
    if (passIdx >= passes.length) return;
    var start = 0,
        end = passes.length;

    if (passIdx !== undefined) {
      start = passIdx, end = passIdx + 1;
    }

    for (var i = start; i < end; i++) {
      var value = passes[i].getDefine(name);

      if (value !== undefined) {
        return value;
      }
    }
  };

  _proto.setCullMode = function setCullMode(cullMode, passIdx) {
    if (cullMode === void 0) {
      cullMode = gfx.CULL_BACK;
    }

    var passes = this.passes;
    var start = 0,
        end = passes.length;

    if (passIdx !== undefined) {
      start = passIdx, end = passIdx + 1;
    }

    for (var i = start; i < end; i++) {
      passes[i].setCullMode(cullMode);
    }

    this._dirty = true;
  };

  _proto.setDepth = function setDepth(depthTest, depthWrite, depthFunc, passIdx) {
    var passes = this.passes;
    var start = 0,
        end = passes.length;

    if (passIdx !== undefined) {
      start = passIdx, end = passIdx + 1;
    }

    for (var i = start; i < end; i++) {
      passes[i].setDepth(depthTest, depthWrite, depthFunc);
    }

    this._dirty = true;
  };

  _proto.setBlend = function setBlend(enabled, blendEq, blendSrc, blendDst, blendAlphaEq, blendSrcAlpha, blendDstAlpha, blendColor, passIdx) {
    var passes = this.passes;
    var start = 0,
        end = passes.length;

    if (passIdx !== undefined) {
      start = passIdx, end = passIdx + 1;
    }

    for (var i = start; i < end; i++) {
      passes[i].setBlend(enabled, blendEq, blendSrc, blendDst, blendAlphaEq, blendSrcAlpha, blendDstAlpha, blendColor);
    }

    this._dirty = true;
  };

  _proto.setStencilEnabled = function setStencilEnabled(stencilTest, passIdx) {
    if (stencilTest === void 0) {
      stencilTest = gfx.STENCIL_INHERIT;
    }

    var passes = this.passes;
    var start = 0,
        end = passes.length;

    if (passIdx !== undefined) {
      start = passIdx, end = passIdx + 1;
    }

    for (var i = start; i < end; i++) {
      passes[i].setStencilEnabled(stencilTest);
    }

    this._dirty = true;
  };

  _proto.setStencil = function setStencil(enabled, stencilFunc, stencilRef, stencilMask, stencilFailOp, stencilZFailOp, stencilZPassOp, stencilWriteMask, passIdx) {
    var passes = this.passes;
    var start = 0,
        end = passes.length;

    if (passIdx !== undefined) {
      start = passIdx, end = passIdx + 1;
    }

    for (var i = start; i < end; i++) {
      var pass = passes[i];
      pass.setStencilFront(enabled, stencilFunc, stencilRef, stencilMask, stencilFailOp, stencilZFailOp, stencilZPassOp, stencilWriteMask);
      pass.setStencilBack(enabled, stencilFunc, stencilRef, stencilMask, stencilFailOp, stencilZFailOp, stencilZPassOp, stencilWriteMask);
    }

    this._dirty = true;
  };

  _createClass(EffectBase, [{
    key: "name",
    get: function get() {
      return this._name;
    }
  }, {
    key: "technique",
    get: function get() {
      return this._technique;
    }
  }, {
    key: "passes",
    get: function get() {
      return [];
    }
  }]);

  return EffectBase;
}();

exports["default"] = EffectBase;
cc.EffectBase = EffectBase;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVuZ2luZS1kZXYvY29jb3MyZC9jb3JlL2Fzc2V0cy9tYXRlcmlhbC9lZmZlY3QtYmFzZS50cyJdLCJuYW1lcyI6WyJnZngiLCJjYyIsIkVmZmVjdEJhc2UiLCJfZGlydHkiLCJfbmFtZSIsIl90ZWNobmlxdWUiLCJfY3JlYXRlUGFzc1Byb3AiLCJuYW1lIiwicGFzcyIsInByb3AiLCJfcHJvcGVydGllcyIsInVuaWZvcm0iLCJPYmplY3QiLCJjcmVhdGUiLCJ0eXBlIiwidmFsdWUiLCJGbG9hdDMyQXJyYXkiLCJfc2V0UGFzc1Byb3BlcnR5IiwiZGlyZWN0bHkiLCJwcm9wZXJ0aWVzIiwiaGFzT3duUHJvcGVydHkiLCJQYXNzIiwicHJvdG90eXBlIiwic2V0UHJvcGVydHkiLCJjYWxsIiwicGFzc0lkeCIsInN1Y2Nlc3MiLCJwYXNzZXMiLCJzdGFydCIsImVuZCIsImxlbmd0aCIsInVuZGVmaW5lZCIsImkiLCJ3YXJuSUQiLCJnZXRQcm9wZXJ0eSIsImRlZmluZSIsImZvcmNlIiwiZ2V0RGVmaW5lIiwic2V0Q3VsbE1vZGUiLCJjdWxsTW9kZSIsIkNVTExfQkFDSyIsInNldERlcHRoIiwiZGVwdGhUZXN0IiwiZGVwdGhXcml0ZSIsImRlcHRoRnVuYyIsInNldEJsZW5kIiwiZW5hYmxlZCIsImJsZW5kRXEiLCJibGVuZFNyYyIsImJsZW5kRHN0IiwiYmxlbmRBbHBoYUVxIiwiYmxlbmRTcmNBbHBoYSIsImJsZW5kRHN0QWxwaGEiLCJibGVuZENvbG9yIiwic2V0U3RlbmNpbEVuYWJsZWQiLCJzdGVuY2lsVGVzdCIsIlNURU5DSUxfSU5IRVJJVCIsInNldFN0ZW5jaWwiLCJzdGVuY2lsRnVuYyIsInN0ZW5jaWxSZWYiLCJzdGVuY2lsTWFzayIsInN0ZW5jaWxGYWlsT3AiLCJzdGVuY2lsWkZhaWxPcCIsInN0ZW5jaWxaUGFzc09wIiwic3RlbmNpbFdyaXRlTWFzayIsInNldFN0ZW5jaWxGcm9udCIsInNldFN0ZW5jaWxCYWNrIl0sIm1hcHBpbmdzIjoiOzs7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S0MsVUFBWjtBQUNIOzs7d0JBRXFCO0FBQ2xCLGFBQU8sRUFBUDtBQUNIOzs7Ozs7O0FBd0tMSixFQUFFLENBQUNDLFVBQUgsR0FBZ0JBLFVBQWhCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFBhc3MgZnJvbSAnLi4vLi4vLi4vcmVuZGVyZXIvY29yZS9wYXNzJztcblxuY29uc3QgZ2Z4ID0gY2MuZ2Z4O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFZmZlY3RCYXNlIHtcbiAgICBfZGlydHkgPSB0cnVlO1xuXG4gICAgX25hbWUgPSAnJztcbiAgICBnZXQgbmFtZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9uYW1lO1xuICAgIH1cblxuICAgIF90ZWNobmlxdWUgPSBudWxsO1xuICAgIGdldCB0ZWNobmlxdWUgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdGVjaG5pcXVlO1xuICAgIH1cblxuICAgIGdldCBwYXNzZXMgKCk6IFBhc3NbXSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICBfY3JlYXRlUGFzc1Byb3AgKG5hbWUsIHBhc3MpIHtcbiAgICAgICAgbGV0IHByb3AgPSBwYXNzLl9wcm9wZXJ0aWVzW25hbWVdO1xuICAgICAgICBpZiAoIXByb3ApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCB1bmlmb3JtID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICAgICAgdW5pZm9ybS5uYW1lID0gbmFtZTtcbiAgICAgICAgdW5pZm9ybS50eXBlID0gcHJvcC50eXBlO1xuICAgICAgICBpZiAocHJvcC52YWx1ZSBpbnN0YW5jZW9mIEZsb2F0MzJBcnJheSkge1xuICAgICAgICAgICAgdW5pZm9ybS52YWx1ZSA9IG5ldyBGbG9hdDMyQXJyYXkocHJvcC52YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB1bmlmb3JtLnZhbHVlID0gcHJvcC52YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBwYXNzLl9wcm9wZXJ0aWVzW25hbWVdID0gdW5pZm9ybTtcblxuICAgICAgICByZXR1cm4gdW5pZm9ybTtcbiAgICB9XG5cbiAgICBfc2V0UGFzc1Byb3BlcnR5IChuYW1lLCB2YWx1ZSwgcGFzcywgZGlyZWN0bHkpIHtcbiAgICAgICAgbGV0IHByb3BlcnRpZXMgPSBwYXNzLl9wcm9wZXJ0aWVzO1xuICAgICAgICBsZXQgdW5pZm9ybSA9IHByb3BlcnRpZXMuaGFzT3duUHJvcGVydHkobmFtZSk7XG4gICAgICAgIGlmICghdW5pZm9ybSkge1xuICAgICAgICAgICAgdW5pZm9ybSA9IHRoaXMuX2NyZWF0ZVBhc3NQcm9wKG5hbWUsIHBhc3MpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHVuaWZvcm0udmFsdWUgPT09IHZhbHVlKSByZXR1cm47XG5cbiAgICAgICAgdGhpcy5fZGlydHkgPSB0cnVlO1xuICAgICAgICByZXR1cm4gUGFzcy5wcm90b3R5cGUuc2V0UHJvcGVydHkuY2FsbChwYXNzLCBuYW1lLCB2YWx1ZSwgZGlyZWN0bHkpO1xuICAgIH1cblxuICAgIHNldFByb3BlcnR5IChuYW1lLCB2YWx1ZSwgcGFzc0lkeCwgZGlyZWN0bHkpIHtcbiAgICAgICAgbGV0IHN1Y2Nlc3MgPSBmYWxzZTtcbiAgICAgICAgbGV0IHBhc3NlcyA9IHRoaXMucGFzc2VzO1xuICAgICAgICBsZXQgc3RhcnQgPSAwLCBlbmQgPSBwYXNzZXMubGVuZ3RoO1xuICAgICAgICBpZiAocGFzc0lkeCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBzdGFydCA9IHBhc3NJZHgsIGVuZCA9IHBhc3NJZHggKyAxO1xuICAgICAgICB9XG4gICAgICAgIGZvciAobGV0IGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fc2V0UGFzc1Byb3BlcnR5KG5hbWUsIHZhbHVlLCBwYXNzZXNbaV0sIGRpcmVjdGx5KSkge1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3MgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghc3VjY2Vzcykge1xuICAgICAgICAgICAgY2Mud2FybklEKDkxMDMsIHRoaXMubmFtZSwgbmFtZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRQcm9wZXJ0eSAobmFtZSwgcGFzc0lkeCkge1xuICAgICAgICBsZXQgcGFzc2VzID0gdGhpcy5wYXNzZXM7XG4gICAgICAgIGlmIChwYXNzSWR4ID49IHBhc3Nlcy5sZW5ndGgpIHJldHVybjtcblxuICAgICAgICBsZXQgc3RhcnQgPSAwLCBlbmQgPSBwYXNzZXMubGVuZ3RoO1xuICAgICAgICBpZiAocGFzc0lkeCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBzdGFydCA9IHBhc3NJZHgsIGVuZCA9IHBhc3NJZHggKyAxO1xuICAgICAgICB9XG4gICAgICAgIGZvciAobGV0IGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgICAgICAgICBsZXQgdmFsdWUgPSBwYXNzZXNbaV0uZ2V0UHJvcGVydHkobmFtZSk7XG4gICAgICAgICAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGRlZmluZSAobmFtZSwgdmFsdWUsIHBhc3NJZHgsIGZvcmNlKSB7XG4gICAgICAgIGxldCBzdWNjZXNzID0gZmFsc2U7XG4gICAgICAgIGxldCBwYXNzZXMgPSB0aGlzLnBhc3NlcztcbiAgICAgICAgbGV0IHN0YXJ0ID0gMCwgZW5kID0gcGFzc2VzLmxlbmd0aDtcbiAgICAgICAgaWYgKHBhc3NJZHggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgc3RhcnQgPSBwYXNzSWR4LCBlbmQgPSBwYXNzSWR4ICsgMTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGxldCBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgICAgICAgICAgaWYgKHBhc3Nlc1tpXS5kZWZpbmUobmFtZSwgdmFsdWUsIGZvcmNlKSkge1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3MgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghc3VjY2Vzcykge1xuICAgICAgICAgICAgY2Mud2FybklEKDkxMDQsIHRoaXMubmFtZSwgbmFtZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXREZWZpbmUgKG5hbWUsIHBhc3NJZHgpIHtcbiAgICAgICAgbGV0IHBhc3NlcyA9IHRoaXMucGFzc2VzO1xuICAgICAgICBpZiAocGFzc0lkeCA+PSBwYXNzZXMubGVuZ3RoKSByZXR1cm47XG4gICAgICAgIGxldCBzdGFydCA9IDAsIGVuZCA9IHBhc3Nlcy5sZW5ndGg7XG4gICAgICAgIGlmIChwYXNzSWR4ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHN0YXJ0ID0gcGFzc0lkeCwgZW5kID0gcGFzc0lkeCArIDE7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChsZXQgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IHBhc3Nlc1tpXS5nZXREZWZpbmUobmFtZSk7XG4gICAgICAgICAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNldEN1bGxNb2RlIChjdWxsTW9kZSA9IGdmeC5DVUxMX0JBQ0ssIHBhc3NJZHgpIHtcbiAgICAgICAgbGV0IHBhc3NlcyA9IHRoaXMucGFzc2VzO1xuICAgICAgICBsZXQgc3RhcnQgPSAwLCBlbmQgPSBwYXNzZXMubGVuZ3RoO1xuICAgICAgICBpZiAocGFzc0lkeCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBzdGFydCA9IHBhc3NJZHgsIGVuZCA9IHBhc3NJZHggKyAxO1xuICAgICAgICB9XG4gICAgICAgIGZvciAobGV0IGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgICAgICAgICBwYXNzZXNbaV0uc2V0Q3VsbE1vZGUoY3VsbE1vZGUpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2RpcnR5ID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBzZXREZXB0aCAoZGVwdGhUZXN0LCBkZXB0aFdyaXRlLCBkZXB0aEZ1bmMsIHBhc3NJZHgpIHtcbiAgICAgICAgbGV0IHBhc3NlcyA9IHRoaXMucGFzc2VzO1xuICAgICAgICBsZXQgc3RhcnQgPSAwLCBlbmQgPSBwYXNzZXMubGVuZ3RoO1xuICAgICAgICBpZiAocGFzc0lkeCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBzdGFydCA9IHBhc3NJZHgsIGVuZCA9IHBhc3NJZHggKyAxO1xuICAgICAgICB9XG4gICAgICAgIGZvciAobGV0IGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgICAgICAgICBwYXNzZXNbaV0uc2V0RGVwdGgoZGVwdGhUZXN0LCBkZXB0aFdyaXRlLCBkZXB0aEZ1bmMpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2RpcnR5ID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBzZXRCbGVuZCAoZW5hYmxlZCwgYmxlbmRFcSwgYmxlbmRTcmMsIGJsZW5kRHN0LCBibGVuZEFscGhhRXEsIGJsZW5kU3JjQWxwaGEsIGJsZW5kRHN0QWxwaGEsIGJsZW5kQ29sb3IsIHBhc3NJZHgpIHtcbiAgICAgICAgbGV0IHBhc3NlcyA9IHRoaXMucGFzc2VzO1xuICAgICAgICBsZXQgc3RhcnQgPSAwLCBlbmQgPSBwYXNzZXMubGVuZ3RoO1xuICAgICAgICBpZiAocGFzc0lkeCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBzdGFydCA9IHBhc3NJZHgsIGVuZCA9IHBhc3NJZHggKyAxO1xuICAgICAgICB9XG4gICAgICAgIGZvciAobGV0IGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgICAgICAgICBwYXNzZXNbaV0uc2V0QmxlbmQoXG4gICAgICAgICAgICAgICAgZW5hYmxlZCxcbiAgICAgICAgICAgICAgICBibGVuZEVxLFxuICAgICAgICAgICAgICAgIGJsZW5kU3JjLCBibGVuZERzdCxcbiAgICAgICAgICAgICAgICBibGVuZEFscGhhRXEsXG4gICAgICAgICAgICAgICAgYmxlbmRTcmNBbHBoYSwgYmxlbmREc3RBbHBoYSwgYmxlbmRDb2xvclxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9kaXJ0eSA9IHRydWU7XG4gICAgfVxuXG4gICAgc2V0U3RlbmNpbEVuYWJsZWQgKHN0ZW5jaWxUZXN0ID0gZ2Z4LlNURU5DSUxfSU5IRVJJVCwgcGFzc0lkeCkge1xuICAgICAgICBsZXQgcGFzc2VzID0gdGhpcy5wYXNzZXM7XG4gICAgICAgIGxldCBzdGFydCA9IDAsIGVuZCA9IHBhc3Nlcy5sZW5ndGg7XG4gICAgICAgIGlmIChwYXNzSWR4ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHN0YXJ0ID0gcGFzc0lkeCwgZW5kID0gcGFzc0lkeCArIDE7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChsZXQgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICAgICAgICAgIHBhc3Nlc1tpXS5zZXRTdGVuY2lsRW5hYmxlZChzdGVuY2lsVGVzdCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fZGlydHkgPSB0cnVlO1xuICAgIH1cblxuICAgIHNldFN0ZW5jaWwgKGVuYWJsZWQsIHN0ZW5jaWxGdW5jLCBzdGVuY2lsUmVmLCBzdGVuY2lsTWFzaywgc3RlbmNpbEZhaWxPcCwgc3RlbmNpbFpGYWlsT3AsIHN0ZW5jaWxaUGFzc09wLCBzdGVuY2lsV3JpdGVNYXNrLCBwYXNzSWR4KSB7XG4gICAgICAgIGxldCBwYXNzZXMgPSB0aGlzLnBhc3NlcztcbiAgICAgICAgbGV0IHN0YXJ0ID0gMCwgZW5kID0gcGFzc2VzLmxlbmd0aDtcbiAgICAgICAgaWYgKHBhc3NJZHggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgc3RhcnQgPSBwYXNzSWR4LCBlbmQgPSBwYXNzSWR4ICsgMTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGxldCBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgICAgICAgICAgbGV0IHBhc3MgPSBwYXNzZXNbaV07XG4gICAgICAgICAgICBwYXNzLnNldFN0ZW5jaWxGcm9udChlbmFibGVkLCBzdGVuY2lsRnVuYywgc3RlbmNpbFJlZiwgc3RlbmNpbE1hc2ssIHN0ZW5jaWxGYWlsT3AsIHN0ZW5jaWxaRmFpbE9wLCBzdGVuY2lsWlBhc3NPcCwgc3RlbmNpbFdyaXRlTWFzayk7XG4gICAgICAgICAgICBwYXNzLnNldFN0ZW5jaWxCYWNrKGVuYWJsZWQsIHN0ZW5jaWxGdW5jLCBzdGVuY2lsUmVmLCBzdGVuY2lsTWFzaywgc3RlbmNpbEZhaWxPcCwgc3RlbmNpbFpGYWlsT3AsIHN0ZW5jaWxaUGFzc09wLCBzdGVuY2lsV3JpdGVNYXNrKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9kaXJ0eSA9IHRydWU7XG4gICAgfVxufVxuXG5jYy5FZmZlY3RCYXNlID0gRWZmZWN0QmFzZTtcbiJdLCJzb3VyY2VSb290IjoiLyJ9