
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'engine-dev/cocos2d/core/renderer/webgl/assemblers/mask-assembler.js';
                    var __require = nodeEnv ? function (request) {
                        return require(request);
                    } : function (request) {
                        return __quick_compile_engine__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_engine__.registerModule(__filename, module);}"use strict";

exports.__esModule = true;
exports.MaskAssembler = void 0;

var _assembler = _interopRequireDefault(require("../../assembler"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var Mask = require('../../../components/CCMask');

var RenderFlow = require('../../render-flow');

var SimpleSpriteAssembler = require('./sprite/2d/simple');

var GraphicsAssembler = require('./graphics');

var gfx = require('../../../../renderer/gfx');

var vfmtPos = require('../vertex-format').vfmtPos; // todo: 8 is least Stencil depth supported by webGL device, it could be adjusted to vendor implementation value


var _maxLevel = 8; // Current mask

var _maskStack = [];

function getWriteMask() {
  return 0x01 << _maskStack.length - 1;
}

function getStencilRef() {
  var result = 0;

  for (var i = 0; i < _maskStack.length; ++i) {
    result += 0x01 << i;
  }

  return result;
}

function applyStencil(material, func, failOp, ref, stencilMask, writeMask) {
  var effect = material.effect;
  var zFailOp = gfx.STENCIL_OP_KEEP,
      zPassOp = gfx.STENCIL_OP_KEEP;
  effect.setStencil(gfx.STENCIL_ENABLE, func, ref, stencilMask, failOp, zFailOp, zPassOp, writeMask);
}

function pushMask(mask) {
  if (_maskStack.length + 1 > _maxLevel) {
    cc.errorID(9000, _maxLevel);
  }

  _maskStack.push(mask);
}

function exitMask(mask, renderer) {
  if (_maskStack.length === 0) {
    cc.errorID(9001);
  }

  _maskStack.pop();

  if (_maskStack.length === 0) {
    renderer._flushMaterial(mask._exitMaterial);
  } else {
    enableMask(renderer);
  }
}

function applyClearMask(mask, renderer) {
  var func = gfx.DS_FUNC_NEVER;
  var ref = getWriteMask();
  var stencilMask = ref;
  var writeMask = ref;
  var failOp = mask.inverted ? gfx.STENCIL_OP_REPLACE : gfx.STENCIL_OP_ZERO;
  applyStencil(mask._clearMaterial, func, failOp, ref, stencilMask, writeMask);
  var buffer = renderer.getBuffer('mesh', vfmtPos);
  var offsetInfo = buffer.request(4, 6);
  var indiceOffset = offsetInfo.indiceOffset,
      vertexOffset = offsetInfo.byteOffset >> 2,
      vertexId = offsetInfo.vertexOffset,
      vbuf = buffer._vData,
      ibuf = buffer._iData;
  vbuf[vertexOffset++] = -1;
  vbuf[vertexOffset++] = -1;
  vbuf[vertexOffset++] = -1;
  vbuf[vertexOffset++] = 1;
  vbuf[vertexOffset++] = 1;
  vbuf[vertexOffset++] = 1;
  vbuf[vertexOffset++] = 1;
  vbuf[vertexOffset++] = -1;
  ibuf[indiceOffset++] = vertexId;
  ibuf[indiceOffset++] = vertexId + 3;
  ibuf[indiceOffset++] = vertexId + 1;
  ibuf[indiceOffset++] = vertexId + 1;
  ibuf[indiceOffset++] = vertexId + 3;
  ibuf[indiceOffset++] = vertexId + 2;
  renderer.node = renderer._dummyNode;
  renderer.material = mask._clearMaterial;

  renderer._flush();
}

function applyAreaMask(mask, renderer) {
  var func = gfx.DS_FUNC_NEVER;
  var ref = getWriteMask();
  var stencilMask = ref;
  var writeMask = ref;
  var failOp = mask.inverted ? gfx.STENCIL_OP_ZERO : gfx.STENCIL_OP_REPLACE;
  applyStencil(mask._materials[0], func, failOp, ref, stencilMask, writeMask); // vertex buffer

  renderer.material = mask._materials[0];

  if (mask._type === Mask.Type.IMAGE_STENCIL) {
    renderer.node = renderer._dummyNode;
    SimpleSpriteAssembler.prototype.fillBuffers.call(mask._assembler, mask, renderer);

    renderer._flush();
  } else {
    renderer.node = mask.node;
    GraphicsAssembler.prototype.fillBuffers.call(mask._graphics._assembler, mask._graphics, renderer);
  }
}

function enableMask(renderer) {
  var func = gfx.DS_FUNC_EQUAL;
  var failOp = gfx.STENCIL_OP_KEEP;
  var ref = getStencilRef();
  var stencilMask = ref;
  var writeMask = getWriteMask();
  var mask = _maskStack[_maskStack.length - 1];
  applyStencil(mask._enableMaterial, func, failOp, ref, stencilMask, writeMask);

  renderer._flushMaterial(mask._enableMaterial);
}

var MaskAssembler = /*#__PURE__*/function (_SimpleSpriteAssemble) {
  _inheritsLoose(MaskAssembler, _SimpleSpriteAssemble);

  function MaskAssembler() {
    return _SimpleSpriteAssemble.apply(this, arguments) || this;
  }

  var _proto = MaskAssembler.prototype;

  _proto.updateRenderData = function updateRenderData(mask) {
    if (mask._type === Mask.Type.IMAGE_STENCIL) {
      if (mask.spriteFrame) {
        SimpleSpriteAssembler.prototype.updateRenderData.call(this, mask);
      } else {
        mask.setMaterial(0, null);
      }
    } else {
      mask._graphics.setMaterial(0, mask._materials[0]);

      GraphicsAssembler.prototype.updateRenderData.call(mask._graphics._assembler, mask._graphics, mask._graphics);
    }
  };

  _proto.fillBuffers = function fillBuffers(mask, renderer) {
    // Invalid state
    if (mask._type !== Mask.Type.IMAGE_STENCIL || mask.spriteFrame) {
      // HACK: Must push mask after batch, so we can only put this logic in fillVertexBuffer or fillIndexBuffer
      pushMask(mask);
      applyClearMask(mask, renderer);
      applyAreaMask(mask, renderer);
      enableMask(renderer);
    }

    mask.node._renderFlag |= RenderFlow.FLAG_UPDATE_RENDER_DATA;
  };

  _proto.postFillBuffers = function postFillBuffers(mask, renderer) {
    // Invalid state
    if (mask._type !== Mask.Type.IMAGE_STENCIL || mask.spriteFrame) {
      // HACK: Must pop mask after batch, so we can only put this logic in fillBuffers
      exitMask(mask, renderer);
    }

    mask.node._renderFlag |= RenderFlow.FLAG_UPDATE_RENDER_DATA;
  };

  return MaskAssembler;
}(SimpleSpriteAssembler);

exports.MaskAssembler = MaskAssembler;
;

_assembler["default"].register(Mask, MaskAssembler);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVuZ2luZS1kZXYvY29jb3MyZC9jb3JlL3JlbmRlcmVyL3dlYmdsL2Fzc2VtYmxlcnMvbWFzay1hc3NlbWJsZXIuanMiXSwibmFtZXMiOlsiTWFzayIsInJlcXVpcmUiLCJSZW5kZXJGbG93IiwiU2ltcGxlU3ByaXRlQXNzZW1ibGVyIiwiR3JhcGhpY3NBc3NlbWJsZXIiLCJnZngiLCJ2Zm10UG9zIiwiX21heExldmVsIiwiX21hc2tTdGFjayIsImdldFdyaXRlTWFzayIsImxlbmd0aCIsImdldFN0ZW5jaWxSZWYiLCJyZXN1bHQiLCJpIiwiYXBwbHlTdGVuY2lsIiwibWF0ZXJpYWwiLCJmdW5jIiwiZmFpbE9wIiwicmVmIiwic3RlbmNpbE1hc2siLCJ3cml0ZU1hc2siLCJlZmZlY3QiLCJ6RmFpbE9wIiwiU1RFTkNJTF9PUF9LRUVQIiwielBhc3NPcCIsInNldFN0ZW5jaWwiLCJTVEVOQ0lMX0VOQUJMRSIsInB1c2hNYXNrIiwibWFzayIsImNjIiwiZXJyb3JJRCIsInB1c2giLCJleGl0TWFzayIsInJlbmRlcmVyIiwicG9wIiwiX2ZsdXNoTWF0ZXJpYWwiLCJfZXhpdE1hdGVyaWFsIiwiZW5hYmxlTWFzayIsImFwcGx5Q2xlYXJNYXNrIiwiRFNfRlVOQ19ORVZFUiIsImludmVydGVkIiwiU1RFTkNJTF9PUF9SRVBMQUNFIiwiU1RFTkNJTF9PUF9aRVJPIiwiX2NsZWFyTWF0ZXJpYWwiLCJidWZmZXIiLCJnZXRCdWZmZXIiLCJvZmZzZXRJbmZvIiwicmVxdWVzdCIsImluZGljZU9mZnNldCIsInZlcnRleE9mZnNldCIsImJ5dGVPZmZzZXQiLCJ2ZXJ0ZXhJZCIsInZidWYiLCJfdkRhdGEiLCJpYnVmIiwiX2lEYXRhIiwibm9kZSIsIl9kdW1teU5vZGUiLCJfZmx1c2giLCJhcHBseUFyZWFNYXNrIiwiX21hdGVyaWFscyIsIl90eXBlIiwiVHlwZSIsIklNQUdFX1NURU5DSUwiLCJwcm90b3R5cGUiLCJmaWxsQnVmZmVycyIsImNhbGwiLCJfYXNzZW1ibGVyIiwiX2dyYXBoaWNzIiwiRFNfRlVOQ19FUVVBTCIsIl9lbmFibGVNYXRlcmlhbCIsIk1hc2tBc3NlbWJsZXIiLCJ1cGRhdGVSZW5kZXJEYXRhIiwic3ByaXRlRnJhbWUiLCJzZXRNYXRlcmlhbCIsIl9yZW5kZXJGbGFnIiwiRkxBR19VUERBVEVfUkVOREVSX0RBVEEiLCJwb3N0RmlsbEJ1ZmZlcnMiLCJBc3NlbWJsZXIiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztBQXlCQTs7Ozs7O0FBRUEsSUFBTUEsSUFBSSxHQUFHQyxPQUFPLENBQUMsNEJBQUQsQ0FBcEI7O0FBQ0EsSUFBTUMsVUFBVSxHQUFHRCxPQUFPLENBQUMsbUJBQUQsQ0FBMUI7O0FBQ0EsSUFBTUUscUJBQXFCLEdBQUdGLE9BQU8sQ0FBQyxvQkFBRCxDQUFyQzs7QUFDQSxJQUFNRyxpQkFBaUIsR0FBR0gsT0FBTyxDQUFDLFlBQUQsQ0FBakM7O0FBQ0EsSUFBTUksR0FBRyxHQUFHSixPQUFPLENBQUMsMEJBQUQsQ0FBbkI7O0FBQ0EsSUFBTUssT0FBTyxHQUFHTCxPQUFPLENBQUMsa0JBQUQsQ0FBUCxDQUE0QkssT0FBNUMsRUFFQTs7O0FBQ0EsSUFBSUMsU0FBUyxHQUFHLENBQWhCLEVBQ0E7O0FBQ0EsSUFBSUMsVUFBVSxHQUFHLEVBQWpCOztBQUVBLFNBQVNDLFlBQVQsR0FBeUI7QUFDckIsU0FBTyxRQUFTRCxVQUFVLENBQUNFLE1BQVgsR0FBb0IsQ0FBcEM7QUFDSDs7QUFFRCxTQUFTQyxhQUFULEdBQTBCO0FBQ3RCLE1BQUlDLE1BQU0sR0FBRyxDQUFiOztBQUNBLE9BQUssSUFBSUMsQ0FBQyxHQUFHLENBQWIsRUFBZ0JBLENBQUMsR0FBR0wsVUFBVSxDQUFDRSxNQUEvQixFQUF1QyxFQUFFRyxDQUF6QyxFQUE0QztBQUN4Q0QsSUFBQUEsTUFBTSxJQUFLLFFBQVFDLENBQW5CO0FBQ0g7O0FBQ0QsU0FBT0QsTUFBUDtBQUNIOztBQUVELFNBQVNFLFlBQVQsQ0FBdUJDLFFBQXZCLEVBQWlDQyxJQUFq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QUFDd0MsU0FBbEc7QUFDSDtBQUNKOztTQUVESCxjQUFBLHFCQUFhckMsSUFBYixFQUFtQkssUUFBbkIsRUFBNkI7QUFDekI7QUFDQSxRQUFJTCxJQUFJLENBQUNpQyxLQUFMLEtBQWU3RCxJQUFJLENBQUM4RCxJQUFMLENBQVVDLGFBQXpCLElBQTBDbkMsSUFBSSxDQUFDNkMsV0FBbkQsRUFBZ0U7QUFDNUQ7QUFDQTlDLE1BQUFBLFFBQVEsQ0FBQ0MsSUFBRCxDQUFSO0FBRUFVLE1BQUFBLGNBQWMsQ0FBQ1YsSUFBRCxFQUFPSyxRQUFQLENBQWQ7QUFDQTBCLE1BQUFBLGFBQWEsQ0FBQy9CLElBQUQsRUFBT0ssUUFBUCxDQUFiO0FBRUFJLE1BQUFBLFVBQVUsQ0FBQ0osUUFBRCxDQUFWO0FBQ0g7O0FBRURMLElBQUFBLElBQUksQ0FBQzRCLElBQUwsQ0FBVW1CLFdBQVYsSUFBeUJ6RSxVQUFVLENBQUMwRSx1QkFBcEM7QUFDSDs7U0FFREMsa0JBQUEseUJBQWlCakQsSUFBakIsRUFBdUJLLFFBQXZCLEVBQWlDO0FBQzdCO0FBQ0EsUUFBSUwsSUFBSSxDQUFDaUMsS0FBTCxLQUFlN0QsSUFBSSxDQUFDOEQsSUFBTCxDQUFVQyxhQUF6QixJQUEwQ25DLElBQUksQ0FBQzZDLFdBQW5ELEVBQWdFO0FBQzVEO0FBQ0F6QyxNQUFBQSxRQUFRLENBQUNKLElBQUQsRUFBT0ssUUFBUCxDQUFSO0FBQ0g7O0FBRURMLElBQUFBLElBQUksQ0FBQzRCLElBQUwsQ0FBVW1CLFdBQVYsSUFBeUJ6RSxVQUFVLENBQUMwRSx1QkFBcEM7QUFDSDs7O0VBdkMrQnpFOzs7QUF3Q25DOztBQUVEMkUsc0JBQVVDLFFBQVYsQ0FBbUIvRSxJQUFuQixFQUF5QnVFLGFBQXpCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiBDb3B5cmlnaHQgKGMpIDIwMTctMjAxOCBYaWFtZW4gWWFqaSBTb2Z0d2FyZSBDby4sIEx0ZC5cblxuIGh0dHBzOi8vd3d3LmNvY29zLmNvbS9cblxuIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbiBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGVuZ2luZSBzb3VyY2UgY29kZSAodGhlIFwiU29mdHdhcmVcIiksIGEgbGltaXRlZCxcbiB3b3JsZHdpZGUsIHJveWFsdHktZnJlZSwgbm9uLWFzc2lnbmFibGUsIHJldm9jYWJsZSBhbmQgbm9uLWV4Y2x1c2l2ZSBsaWNlbnNlXG4gdG8gdXNlIENvY29zIENyZWF0b3Igc29sZWx5IHRvIGRldmVsb3AgZ2FtZXMgb24geW91ciB0YXJnZXQgcGxhdGZvcm1zLiBZb3Ugc2hhbGxcbiBub3QgdXNlIENvY29zIENyZWF0b3Igc29mdHdhcmUgZm9yIGRldmVsb3Bpbmcgb3RoZXIgc29mdHdhcmUgb3IgdG9vbHMgdGhhdCdzXG4gdXNlZCBmb3IgZGV2ZWxvcGluZyBnYW1lcy4gWW91IGFyZSBub3QgZ3JhbnRlZCB0byBwdWJsaXNoLCBkaXN0cmlidXRlLFxuIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiBDb2NvcyBDcmVhdG9yLlxuXG4gVGhlIHNvZnR3YXJlIG9yIHRvb2xzIGluIHRoaXMgTGljZW5zZSBBZ3JlZW1lbnQgYXJlIGxpY2Vuc2VkLCBub3Qgc29sZC5cbiBYaWFtZW4gWWFqaSBTb2Z0d2FyZSBDby4sIEx0ZC4gcmVzZXJ2ZXMgYWxsIHJpZ2h0cyBub3QgZXhwcmVzc2x5IGdyYW50ZWQgdG8geW91LlxuXG4gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbiBUSEUgU09GVFdBUkUuXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuaW1wb3J0IEFzc2VtYmxlciBmcm9tICcuLi8uLi9hc3NlbWJsZXInO1xuXG5jb25zdCBNYXNrID0gcmVxdWlyZSgnLi4vLi4vLi4vY29tcG9uZW50cy9DQ01hc2snKTtcbmNvbnN0IFJlbmRlckZsb3cgPSByZXF1aXJlKCcuLi8uLi9yZW5kZXItZmxvdycpO1xuY29uc3QgU2ltcGxlU3ByaXRlQXNzZW1ibGVyID0gcmVxdWlyZSgnLi9zcHJpdGUvMmQvc2ltcGxlJyk7XG5jb25zdCBHcmFwaGljc0Fzc2VtYmxlciA9IHJlcXVpcmUoJy4vZ3JhcGhpY3MnKTtcbmNvbnN0IGdmeCA9IHJlcXVpcmUoJy4uLy4uLy4uLy4uL3JlbmRlcmVyL2dmeCcpO1xuY29uc3QgdmZtdFBvcyA9IHJlcXVpcmUoJy4uL3ZlcnRleC1mb3JtYXQnKS52Zm10UG9zO1xuXG4vLyB0b2RvOiA4IGlzIGxlYXN0IFN0ZW5jaWwgZGVwdGggc3VwcG9ydGVkIGJ5IHdlYkdMIGRldmljZSwgaXQgY291bGQgYmUgYWRqdXN0ZWQgdG8gdmVuZG9yIGltcGxlbWVudGF0aW9uIHZhbHVlXG5sZXQgX21heExldmVsID0gODtcbi8vIEN1cnJlbnQgbWFza1xubGV0IF9tYXNrU3RhY2sgPSBbXTtcblxuZnVuY3Rpb24gZ2V0V3JpdGVNYXNrICgpIHtcbiAgICByZXR1cm4gMHgwMSA8PCAoX21hc2tTdGFjay5sZW5ndGggLSAxKTtcbn1cblxuZnVuY3Rpb24gZ2V0U3RlbmNpbFJlZiAoKSB7XG4gICAgbGV0IHJlc3VsdCA9IDA7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBfbWFza1N0YWNrLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHJlc3VsdCArPSAoMHgwMSA8PCBpKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gYXBwbHlTdGVuY2lsIChtYXRlcmlhbCwgZnVuYywgZmFpbE9wLCByZWYsIHN0ZW5jaWxNYXNrLCB3cml0ZU1hc2spIHtcbiAgICBsZXQgZWZmZWN0ID0gbWF0ZXJpYWwuZWZmZWN0O1xuICAgIGxldCB6RmFpbE9wID0gZ2Z4LlNURU5DSUxfT1BfS0VFUCxcbiAgICAgICAgelBhc3NPcCA9IGdmeC5TVEVOQ0lMX09QX0tFRVA7XG4gICAgZWZmZWN0LnNldFN0ZW5jaWwoZ2Z4LlNURU5DSUxfRU5BQkxFLCBmdW5jLCByZWYsIHN0ZW5jaWxNYXNrLCBmYWlsT3AsIHpGYWlsT3AsIHpQYXNzT3AsIHdyaXRlTWFzayk7XG59XG5cblxuZnVuY3Rpb24gcHVzaE1hc2sgKG1hc2spIHtcbiAgICBpZiAoX21hc2tTdGFjay5sZW5ndGggKyAxID4gX21heExldmVsKSB7XG4gICAgICAgIGNjLmVycm9ySUQoOTAwMCwgX21heExldmVsKTtcbiAgICB9XG4gICAgX21hc2tTdGFjay5wdXNoKG1hc2spO1xufVxuXG5mdW5jdGlvbiBleGl0TWFzayAobWFzaywgcmVuZGVyZXIpIHtcbiAgICBpZiAoX21hc2tTdGFjay5sZW5ndGggPT09IDApIHtcbiAgICAgICAgY2MuZXJyb3JJRCg5MDAxKTtcbiAgICB9XG4gICAgX21hc2tTdGFjay5wb3AoKTtcbiAgICBpZiAoX21hc2tTdGFjay5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmVuZGVyZXIuX2ZsdXNoTWF0ZXJpYWwobWFzay5fZXhpdE1hdGVyaWFsKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGVuYWJsZU1hc2socmVuZGVyZXIpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gYXBwbHlDbGVhck1hc2sgKG1hc2ssIHJlbmRlcmVyKSB7XG4gICAgbGV0IGZ1bmMgPSBnZnguRFNfRlVOQ19ORVZFUjtcbiAgICBsZXQgcmVmID0gZ2V0V3JpdGVNYXNrKCk7XG4gICAgbGV0IHN0ZW5jaWxNYXNrID0gcmVmO1xuICAgIGxldCB3cml0ZU1hc2sgPSByZWY7XG4gICAgbGV0IGZhaWxPcCA9IG1hc2suaW52ZXJ0ZWQgPyBnZnguU1RFTkNJTF9PUF9SRVBMQUNFIDogZ2Z4LlNURU5DSUxfT1BfWkVSTztcblxuICAgIGFwcGx5U3RlbmNpbChtYXNrLl9jbGVhck1hdGVyaWFsLCBmdW5jLCBmYWlsT3AsIHJlZiwgc3RlbmNpbE1hc2ssIHdyaXRlTWFzayk7XG5cbiAgICBsZXQgYnVmZmVyID0gcmVuZGVyZXIuZ2V0QnVmZmVyKCdtZXNoJywgdmZtdFBvcyk7XG4gICAgbGV0IG9mZnNldEluZm8gPSBidWZmZXIucmVxdWVzdCg0LCA2KTtcbiAgICBsZXQgaW5kaWNlT2Zmc2V0ID0gb2Zmc2V0SW5mby5pbmRpY2VPZmZzZXQsXG4gICAgICAgIHZlcnRleE9mZnNldCA9IG9mZnNldEluZm8uYnl0ZU9mZnNldCA+PiAyLFxuICAgICAgICB2ZXJ0ZXhJZCA9IG9mZnNldEluZm8udmVydGV4T2Zmc2V0LFxuICAgICAgICB2YnVmID0gYnVmZmVyLl92RGF0YSxcbiAgICAgICAgaWJ1ZiA9IGJ1ZmZlci5faURhdGE7XG4gICAgXG4gICAgdmJ1Zlt2ZXJ0ZXhPZmZzZXQrK10gPSAtMTtcbiAgICB2YnVmW3ZlcnRleE9mZnNldCsrXSA9IC0xO1xuICAgIHZidWZbdmVydGV4T2Zmc2V0KytdID0gLTE7XG4gICAgdmJ1Zlt2ZXJ0ZXhPZmZzZXQrK10gPSAxO1xuICAgIHZidWZbdmVydGV4T2Zmc2V0KytdID0gMTtcbiAgICB2YnVmW3ZlcnRleE9mZnNldCsrXSA9IDE7XG4gICAgdmJ1Zlt2ZXJ0ZXhPZmZzZXQrK10gPSAxO1xuICAgIHZidWZbdmVydGV4T2Zmc2V0KytdID0gLTE7XG5cbiAgICBpYnVmW2luZGljZU9mZnNldCsrXSA9IHZlcnRleElkO1xuICAgIGlidWZbaW5kaWNlT2Zmc2V0KytdID0gdmVydGV4SWQgKyAzO1xuICAgIGlidWZbaW5kaWNlT2Zmc2V0KytdID0gdmVydGV4SWQgKyAxO1xuICAgIGlidWZbaW5kaWNlT2Zmc2V0KytdID0gdmVydGV4SWQgKyAxO1xuICAgIGlidWZbaW5kaWNlT2Zmc2V0KytdID0gdmVydGV4SWQgKyAzO1xuICAgIGlidWZbaW5kaWNlT2Zmc2V0KytdID0gdmVydGV4SWQgKyAyO1xuXG4gICAgcmVuZGVyZXIubm9kZSA9IHJlbmRlcmVyLl9kdW1teU5vZGU7XG4gICAgcmVuZGVyZXIubWF0ZXJpYWwgPSBtYXNrLl9jbGVhck1hdGVyaWFsO1xuICAgIHJlbmRlcmVyLl9mbHVzaCgpO1xufVxuXG5mdW5jdGlvbiBhcHBseUFyZWFNYXNrIChtYXNrLCByZW5kZXJlcikge1xuICAgIGxldCBmdW5jID0gZ2Z4LkRTX0ZVTkNfTkVWRVI7XG4gICAgbGV0IHJlZiA9IGdldFdyaXRlTWFzaygpO1xuICAgIGxldCBzdGVuY2lsTWFzayA9IHJlZjtcbiAgICBsZXQgd3JpdGVNYXNrID0gcmVmO1xuICAgIGxldCBmYWlsT3AgPSBtYXNrLmludmVydGVkID8gZ2Z4LlNURU5DSUxfT1BfWkVSTyA6IGdmeC5TVEVOQ0lMX09QX1JFUExBQ0U7XG5cbiAgICBhcHBseVN0ZW5jaWwobWFzay5fbWF0ZXJpYWxzWzBdLCBmdW5jLCBmYWlsT3AsIHJlZiwgc3RlbmNpbE1hc2ssIHdyaXRlTWFzayk7XG5cbiAgICAvLyB2ZXJ0ZXggYnVmZmVyXG4gICAgcmVuZGVyZXIubWF0ZXJpYWwgPSBtYXNrLl9tYXRlcmlhbHNbMF07XG5cbiAgICBpZiAobWFzay5fdHlwZSA9PT0gTWFzay5UeXBlLklNQUdFX1NURU5DSUwpIHtcbiAgICAgICAgcmVuZGVyZXIubm9kZSA9IHJlbmRlcmVyLl9kdW1teU5vZGU7XG4gICAgICAgIFNpbXBsZVNwcml0ZUFzc2VtYmxlci5wcm90b3R5cGUuZmlsbEJ1ZmZlcnMuY2FsbChtYXNrLl9hc3NlbWJsZXIsIG1hc2ssIHJlbmRlcmVyKTtcbiAgICAgICAgcmVuZGVyZXIuX2ZsdXNoKCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZW5kZXJlci5ub2RlID0gbWFzay5ub2RlO1xuICAgICAgICBHcmFwaGljc0Fzc2VtYmxlci5wcm90b3R5cGUuZmlsbEJ1ZmZlcnMuY2FsbChtYXNrLl9ncmFwaGljcy5fYXNzZW1ibGVyLCBtYXNrLl9ncmFwaGljcywgcmVuZGVyZXIpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZW5hYmxlTWFzayAocmVuZGVyZXIpIHtcbiAgICBsZXQgZnVuYyA9IGdmeC5EU19GVU5DX0VRVUFMO1xuICAgIGxldCBmYWlsT3AgPSBnZnguU1RFTkNJTF9PUF9LRUVQO1xuICAgIGxldCByZWYgPSBnZXRTdGVuY2lsUmVmKCk7XG4gICAgbGV0IHN0ZW5jaWxNYXNrID0gcmVmO1xuICAgIGxldCB3cml0ZU1hc2sgPSBnZXRXcml0ZU1hc2soKTtcbiAgICBcbiAgICBsZXQgbWFzayA9IF9tYXNrU3RhY2tbX21hc2tTdGFjay5sZW5ndGggLSAxXTtcbiAgICBhcHBseVN0ZW5jaWwobWFzay5fZW5hYmxlTWF0ZXJpYWwsIGZ1bmMsIGZhaWxPcCwgcmVmLCBzdGVuY2lsTWFzaywgd3JpdGVNYXNrKTtcbiAgICByZW5kZXJlci5fZmx1c2hNYXRlcmlhbChtYXNrLl9lbmFibGVNYXRlcmlhbCk7XG59XG5cbmV4cG9ydCBjbGFzcyBNYXNrQXNzZW1ibGVyICBleHRlbmRzIFNpbXBsZVNwcml0ZUFzc2VtYmxlciB7XG4gICAgdXBkYXRlUmVuZGVyRGF0YSAobWFzaykge1xuICAgICAgICBpZiAobWFzay5fdHlwZSA9PT0gTWFzay5UeXBlLklNQUdFX1NURU5DSUwpIHtcbiAgICAgICAgICAgIGlmIChtYXNrLnNwcml0ZUZyYW1lKSB7XG4gICAgICAgICAgICAgICAgU2ltcGxlU3ByaXRlQXNzZW1ibGVyLnByb3RvdHlwZS51cGRhdGVSZW5kZXJEYXRhLmNhbGwodGhpcywgbWFzayk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBtYXNrLnNldE1hdGVyaWFsKDAsIG51bGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbWFzay5fZ3JhcGhpY3Muc2V0TWF0ZXJpYWwoMCwgbWFzay5fbWF0ZXJpYWxzWzBdKTtcbiAgICAgICAgICAgIEdyYXBoaWNzQXNzZW1ibGVyLnByb3RvdHlwZS51cGRhdGVSZW5kZXJEYXRhLmNhbGwobWFzay5fZ3JhcGhpY3MuX2Fzc2VtYmxlciwgbWFzay5fZ3JhcGhpY3MsIG1hc2suX2dyYXBoaWNzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZpbGxCdWZmZXJzIChtYXNrLCByZW5kZXJlcikge1xuICAgICAgICAvLyBJbnZhbGlkIHN0YXRlXG4gICAgICAgIGlmIChtYXNrLl90eXBlICE9PSBNYXNrLlR5cGUuSU1BR0VfU1RFTkNJTCB8fCBtYXNrLnNwcml0ZUZyYW1lKSB7XG4gICAgICAgICAgICAvLyBIQUNLOiBNdXN0IHB1c2ggbWFzayBhZnRlciBiYXRjaCwgc28gd2UgY2FuIG9ubHkgcHV0IHRoaXMgbG9naWMgaW4gZmlsbFZlcnRleEJ1ZmZlciBvciBmaWxsSW5kZXhCdWZmZXJcbiAgICAgICAgICAgIHB1c2hNYXNrKG1hc2spO1xuXG4gICAgICAgICAgICBhcHBseUNsZWFyTWFzayhtYXNrLCByZW5kZXJlcik7XG4gICAgICAgICAgICBhcHBseUFyZWFNYXNrKG1hc2ssIHJlbmRlcmVyKTtcblxuICAgICAgICAgICAgZW5hYmxlTWFzayhyZW5kZXJlcik7XG4gICAgICAgIH1cblxuICAgICAgICBtYXNrLm5vZGUuX3JlbmRlckZsYWcgfD0gUmVuZGVyRmxvdy5GTEFHX1VQREFURV9SRU5ERVJfREFUQTtcbiAgICB9XG5cbiAgICBwb3N0RmlsbEJ1ZmZlcnMgKG1hc2ssIHJlbmRlcmVyKSB7XG4gICAgICAgIC8vIEludmFsaWQgc3RhdGVcbiAgICAgICAgaWYgKG1hc2suX3R5cGUgIT09IE1hc2suVHlwZS5JTUFHRV9TVEVOQ0lMIHx8IG1hc2suc3ByaXRlRnJhbWUpIHtcbiAgICAgICAgICAgIC8vIEhBQ0s6IE11c3QgcG9wIG1hc2sgYWZ0ZXIgYmF0Y2gsIHNvIHdlIGNhbiBvbmx5IHB1dCB0aGlzIGxvZ2ljIGluIGZpbGxCdWZmZXJzXG4gICAgICAgICAgICBleGl0TWFzayhtYXNrLCByZW5kZXJlcik7XG4gICAgICAgIH1cblxuICAgICAgICBtYXNrLm5vZGUuX3JlbmRlckZsYWcgfD0gUmVuZGVyRmxvdy5GTEFHX1VQREFURV9SRU5ERVJfREFUQTtcbiAgICB9XG59O1xuXG5Bc3NlbWJsZXIucmVnaXN0ZXIoTWFzaywgTWFza0Fzc2VtYmxlcik7XG4iXSwic291cmNlUm9vdCI6Ii8ifQ==