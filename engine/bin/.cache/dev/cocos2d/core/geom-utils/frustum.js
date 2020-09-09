
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'engine-dev/cocos2d/core/geom-utils/frustum.js';
                    var __require = nodeEnv ? function (request) {
                        return require(request);
                    } : function (request) {
                        return __quick_compile_engine__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_engine__.registerModule(__filename, module);}"use strict";

exports.__esModule = true;
exports["default"] = void 0;

var _valueTypes = require("../value-types");

var _enums = _interopRequireDefault(require("./enums"));

var _plane = _interopRequireDefault(require("./plane"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var _v = new Array(8);

_v[0] = new _valueTypes.Vec3(1, 1, 1);
_v[1] = new _valueTypes.Vec3(-1, 1, 1);
_v[2] = new _valueTypes.Vec3(-1, -1, 1);
_v[3] = new _valueTypes.Vec3(1, -1, 1);
_v[4] = new _valueTypes.Vec3(1, 1, -1);
_v[5] = new _valueTypes.Vec3(-1, 1, -1);
_v[6] = new _valueTypes.Vec3(-1, -1, -1);
_v[7] = new _valueTypes.Vec3(1, -1, -1);
/**
 * !#en frustum
 * !#zh 平截头体
 * @class geomUtils.Frustum
 */

var frustum = /*#__PURE__*/function () {
  /**
   * create a new frustum
   * @method create
   * @static
   * @return {Frustum}
   */
  frustum.create = function create() {
    return new frustum();
  }
  /**
   * Clone a frustum
   * @method clone
   * @param {Frustum} f
   * @static
   * @return {Frustum}
   */
  ;

  frustum.clone = function clone(f) {
    return frustum.copy(new frustum(), f);
  }
  /**
   * Copy the values from one frustum to another
   * @method copy
   * @param {Frustum} out
   * @param {Frustum} f
   * @return {Frustum}
   */
  ;

  frustum.copy = function copy(out, f) {
    out._type = f._type;

    for (var i = 0; i < 6; ++i) {
      _plane["default"].copy(out.planes[i], f.planes[i]);
    }

    for (var _i = 0; _i < 8; ++_i) {
      _valueTypes.Vec3.copy(out.vertices[_i], f.vertices[_i]);
    }

    return out;
  }
  /**
   * @property {Plane[]} planes
   */
  ;

  _createClass(frustum, [{
    key: "accurate",

    /**
     * Set whether to use accurate intersection testing function on this frustum
     * @property {boolean} accurate
     */
    set: function set(b) {
      this._type = b ? _enums["default"].SHAPE_FRUSTUM_ACCURATE : _enums["default"].SHAPE_FRUSTUM;
    }
  }]);

  function frustum() {
    this.planes = void 0;
    this.vertices = void 0;
    this._type = void 0;
    this._type = _enums["default"].SHAPE_FRUSTUM;
    this.planes = new Array(6);

    for (var i = 0; i < 6; ++i) {
      this.planes[i] = _plane["default"].create(0, 0, 0, 0);
    }

    this.vertices = new Array(8);

    for (var _i2 = 0; _i2 < 8; ++_i2) {
      this.vertices[_i2] = new _valueTypes.Vec3();
    }
  }
  /**
   * !#en Update the frustum information according to the given transform matrix.
   * Note that the resulting planes are not normalized under normal mode.
   * @method update
   * @param {Mat4} m the view-projection matrix
   * @param {Mat4} inv the inverse view-projection matrix
   */


  var _proto = frustum.prototype;

  _proto.update = function update(m, inv) {
    // RTR4, ch. 22.14.1, p. 983
    // extract frustum planes from view-proj matrix.
    var mm = m.m; // left plane

    _valueTypes.Vec3.set(this.planes[0].n, mm[3] + mm[0], mm[7] + mm[4], mm[11] + mm[8]);

    this.planes[0].d = -(mm[15] + mm[12]); // right plane

    _valueTypes.Vec3.set(this.planes[1].n, mm[3] - mm[0], mm[7] - mm[4], mm[11] - mm[8]);

    this.planes[1].d = -(mm[15] - mm[12]); // bottom plane

    _valueTypes.Vec3.set(this.planes[2].n, mm[3] + mm[1], mm[7] + mm[5], mm[11] + mm[9]);

    this.planes[2].d = -(mm[15] + mm[13]); // top plane

    _valueTypes.Vec3.set(this.planes[3].n, mm[3] - mm[1], mm[7] - mm[5], mm[11] - mm[9]);

    this.planes[3].d = -(mm[15] - mm[13]); // near plane

    _valueTypes.Vec3.set(this.planes[4].n, mm[3] + mm[2], mm[7] + mm[6], mm[11] + mm[10]);

    this.planes[4].d = -(mm[15] + mm[14]); // far plane

    _valueTypes.Vec3.set(this.planes[5].n, mm[3] - mm[2], mm[7] - mm[6], mm[11] - mm[10]);

    this.planes[5].d = -(mm[15] - mm[14]);

    if (this._type !== _enums["default"].SHAPE_FRUSTUM_ACCURATE) {
      return;
    } // normalize planes


    for (var i = 0; i < 6; i++) {
      var pl = this.planes[i];
      var invDist = 1 / pl.n.length();

      _valueTypes.Vec3.multiplyScalar(pl.n, pl.n, invDist);

      pl.d *= invDist;
    } // update frustum vertices


    for (var _i3 = 0; _i3 < 8; _i3++) {
      _valueTypes.Vec3.transformMat4(this.vertices[_i3], _v[_i3], inv);
    }
  }
  /**
   * !#en transform by matrix
   * @method transform
   * @param {Mat4} mat
   */
  ;

  _proto.transform = function transform(mat) {
    if (this._type !== _enums["default"].SHAPE_FRUSTUM_ACCURATE) {
      return;
    }

    for (var i = 0; i < 8; i++) {
      _valueTypes.Vec3.transformMat4(this.vertices[i], this.vertices[i], mat);
    }

    _plane["default"].fromPoints(this.planes[0], this.vertices[1], this.vertices[5], this.vertices[6]);

    _plane["default"].fromPoints(this.planes[1], this.vertices[3], this.vertices[7], this.vertices[4]);

    _plane["default"].fromPoints(this.planes[2], this.vertices[6], this.vertices[7], this.vertices[3]);

    _plane["default"].fromPoints(this.planes[3], this.vertices[0], this.vertices[4], this.vertices[5]);

    _plane["default"].fromPoints(this.planes[4], this.vertices[2], this.vertices[3], this.vertices[0]);

    _plane["default"].fromPoints(this.planes[0], this.vertices[7], this.vertices[6], this.vertices[5]);
  };

  return frustum;
}();

exports["default"] = frustum;

frustum.createOrtho = function () {
  var _temp_v3 = new _valueTypes.Vec3();

  return function (out, width, height, near, far, transform) {
    var halfWidth = width / 2;
    var halfHeight = height / 2;

    _valueTypes.Vec3.set(_temp_v3, halfWidth, halfHeight, near);

    _valueTypes.Vec3.transformMat4(out.vertices[0], _temp_v3, transform);

    _valueTypes.Vec3.set(_temp_v3, -halfWidth, halfHeight, near);

    _valueTypes.Vec3.transformMat4(out.vertices[1], _temp_v3, transform);

    _valueTypes.Vec3.set(_temp_v3, -halfWidth, -halfHeight, near);

    _valueTypes.Vec3.transformMat4(out.vertices[2], _temp_v3, transform);

    _valueTypes.Vec3.set(_temp_v3, halfWidth, -halfHeight, near);

    _valueTypes.Vec3.transformMat4(out.vertices[3], _temp_v3, transform);

    _valueTypes.Vec3.set(_temp_v3, halfWidth, halfHeight, far);

    _valueTypes.Vec3.transformMat4(out.vertices[4], _temp_v3, transform);

    _valueTypes.Vec3.set(_temp_v3, -halfWidth, halfHeight, far);

    _valueTypes.Vec3.transformMat4(out.vertices[5], _temp_v3, transform);

    _valueTypes.Vec3.set(_temp_v3, -halfWidth, -halfHeight, far);

    _valueTypes.Vec3.transformMat4(out.vertices[6], _temp_v3, transform);

    _valueTypes.Vec3.set(_temp_v3, halfWidth, -halfHeight, far);

    _valueTypes.Vec3.transformMat4(out.vertices[7], _temp_v3, transform);

    _plane["default"].fromPoints(out.planes[0], out.vertices[1], out.vertices[6], out.vertices[5]);

    _plane["default"].fromPoints(out.planes[1], out.vertices[3], out.vertices[4], out.vertices[7]);

    _plane["default"].fromPoints(out.planes[2], out.vertices[6], out.vertices[3], out.vertices[7]);

    _plane["default"].fromPoints(out.planes[3], out.vertices[0], out.vertices[5], out.vertices[4]);

    _plane["default"].fromPoints(out.planes[4], out.vertices[2], out.vertices[0], out.vertices[3]);

    _plane["default"].fromPoints(out.planes[0], out.vertices[7], out.vertices[5], out.vertices[6]);
  };
}();

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVuZ2luZS1kZXYvY29jb3MyZC9jb3JlL2dlb20tdXRpbHMvZnJ1c3R1bS50cyJdLCJuYW1lcyI6WyJfdiIsIkFycmF5IiwiVmVjMyIsImZydXN0dW0iLCJjcmVhdGUiLCJjbG9uZSIsImYiLCJjb3B5Iiwib3V0IiwiX3R5cGUiLCJpIiwicGxhbmUiLCJwbGFuZXMiLCJ2ZXJ0aWNlcyIsImIiLCJlbnVtcyIsIlNIQVBFX0ZSVVNUVU1fQUNDVVJBVEUiLCJTSEFQRV9GUlVTVFVNIiwidXBkYXRlIiwibSIsImludiIsIm1tIiwic2V0IiwibiIsImQiLCJwbCIsImludkRpc3QiLCJsZW5ndGgiLCJtdWx0aXBseVNjYWxhciIsInRyYW5zZm9ybU1hdDQiLCJ0cmFuc2Zvcm0iLCJtYXQiLCJmcm9tUG9pbnRzIiwiY3JlYXRlT3J0aG8iLCJfdGVtcF92MyIsIndpZHRoIiwiaGVpZ2h0IiwibmVhciIsImZhciIsImhhbGZXaWR0aCIsImhhbGZIZWlnaHQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUF5QkE7O0FBQ0E7O0FBQ0E7Ozs7Ozs7O0FBRUEsSUFBTUEsRUFBRSxHQUFHLElBQUlDLEtBQUosQ0FBVSxDQUFWLENBQVg7O0FBQ0FELEVBQUUsQ0FBQyxDQUFELENBQUYsR0FBUSxJQUFJRSxnQkFBSixDQUFTLENBQVQsRUFBWSxDQUFaLEVBQWUsQ0FBZixDQUFSO0FBQ0FGLEVBQUUsQ0FBQyxDQUFELENBQUYsR0FBUSxJQUFJRSxnQkFBSixDQUFTLENBQUMsQ0FBVixFQUFhLENBQWIsRUFBZ0IsQ0FBaEIsQ0FBUjtBQUNBRixFQUFFLENBQUMsQ0FBRCxDQUFGLEdBQVEsSUFBSUUsZ0JBQUosQ0FBUyxDQUFDLENBQVYsRUFBYSxDQUFDLENBQWQsRUFBaUIsQ0FBakIsQ0FBUjtBQUNBRixFQUFFLENBQUMsQ0FBRCxDQUFGLEdBQVEsSUFBSUUsZ0JBQUosQ0FBUyxDQUFULEVBQVksQ0FBQyxDQUFiLEVBQWdCLENBQWhCLENBQVI7QUFDQUYsRUFBRSxDQUFD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QUcsQ0FBQ0ssUUFBSixDQUFhLENBQWIsQ0FBaEMsRUFBaURMLEdBQUcsQ0FBQ0ssUUFBSixDQUFhLENBQWIsQ0FBakQsRUFBa0VMLEdBQUcsQ0FBQ0ssUUFBSixDQUFhLENBQWIsQ0FBbEU7O0FBQ0FGLHNCQUFNcUIsVUFBTixDQUFpQnhCLEdBQUcsQ0FBQ0ksTUFBSixDQUFXLENBQVgsQ0FBakIsRUFBZ0NKLEdBQUcsQ0FBQ0ssUUFBSixDQUFhLENBQWIsQ0FBaEMsRUFBaURMLEdBQUcsQ0FBQ0ssUUFBSixDQUFhLENBQWIsQ0FBakQsRUFBa0VMLEdBQUcsQ0FBQ0ssUUFBSixDQUFhLENBQWIsQ0FBbEU7O0FBQ0FGLHNCQUFNcUIsVUFBTixDQUFpQnhCLEdBQUcsQ0FBQ0ksTUFBSixDQUFXLENBQVgsQ0FBakIsRUFBZ0NKLEdBQUcsQ0FBQ0ssUUFBSixDQUFhLENBQWIsQ0FBaEMsRUFBaURMLEdBQUcsQ0FBQ0ssUUFBSixDQUFhLENBQWIsQ0FBakQsRUFBa0VMLEdBQUcsQ0FBQ0ssUUFBSixDQUFhLENBQWIsQ0FBbEU7O0FBQ0FGLHNCQUFNcUIsVUFBTixDQUFpQnhCLEdBQUcsQ0FBQ0ksTUFBSixDQUFXLENBQVgsQ0FBakIsRUFBZ0NKLEdBQUcsQ0FBQ0ssUUFBSixDQUFhLENBQWIsQ0FBaEMsRUFBaURMLEdBQUcsQ0FBQ0ssUUFBSixDQUFhLENBQWIsQ0FBakQsRUFBa0VMLEdBQUcsQ0FBQ0ssUUFBSixDQUFhLENBQWIsQ0FBbEU7O0FBQ0FGLHNCQUFNcUIsVUFBTixDQUFpQnhCLEdBQUcsQ0FBQ0ksTUFBSixDQUFXLENBQVgsQ0FBakIsRUFBZ0NKLEdBQUcsQ0FBQ0ssUUFBSixDQUFhLENBQWIsQ0FBaEMsRUFBaURMLEdBQUcsQ0FBQ0ssUUFBSixDQUFhLENBQWIsQ0FBakQsRUFBa0VMLEdBQUcsQ0FBQ0ssUUFBSixDQUFhLENBQWIsQ0FBbEU7O0FBQ0FGLHNCQUFNcUIsVUFBTixDQUFpQnhCLEdBQUcsQ0FBQ0ksTUFBSixDQUFXLENBQVgsQ0FBakIsRUFBZ0NKLEdBQUcsQ0FBQ0ssUUFBSixDQUFhLENBQWIsQ0FBaEMsRUFBaURMLEdBQUcsQ0FBQ0ssUUFBSixDQUFhLENBQWIsQ0FBakQsRUFBa0VMLEdBQUcsQ0FBQ0ssUUFBSixDQUFhLENBQWIsQ0FBbEU7QUFDSCxHQTFCRDtBQTJCSCxDQTdCMkIiLCJzb3VyY2VzQ29udGVudCI6WyIvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuIENvcHlyaWdodCAoYykgMjAxOSBYaWFtZW4gWWFqaSBTb2Z0d2FyZSBDby4sIEx0ZC5cblxuIGh0dHBzOi8vd3d3LmNvY29zLmNvbS9cblxuIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbiBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGVuZ2luZSBzb3VyY2UgY29kZSAodGhlIFwiU29mdHdhcmVcIiksIGEgbGltaXRlZCxcbiB3b3JsZHdpZGUsIHJveWFsdHktZnJlZSwgbm9uLWFzc2lnbmFibGUsIHJldm9jYWJsZSBhbmQgbm9uLWV4Y2x1c2l2ZSBsaWNlbnNlXG4gdG8gdXNlIENvY29zIENyZWF0b3Igc29sZWx5IHRvIGRldmVsb3AgZ2FtZXMgb24geW91ciB0YXJnZXQgcGxhdGZvcm1zLiBZb3Ugc2hhbGxcbiBub3QgdXNlIENvY29zIENyZWF0b3Igc29mdHdhcmUgZm9yIGRldmVsb3Bpbmcgb3RoZXIgc29mdHdhcmUgb3IgdG9vbHMgdGhhdCdzXG4gdXNlZCBmb3IgZGV2ZWxvcGluZyBnYW1lcy4gWW91IGFyZSBub3QgZ3JhbnRlZCB0byBwdWJsaXNoLCBkaXN0cmlidXRlLFxuIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiBDb2NvcyBDcmVhdG9yLlxuXG4gVGhlIHNvZnR3YXJlIG9yIHRvb2xzIGluIHRoaXMgTGljZW5zZSBBZ3JlZW1lbnQgYXJlIGxpY2Vuc2VkLCBub3Qgc29sZC5cbiBYaWFtZW4gWWFqaSBTb2Z0d2FyZSBDby4sIEx0ZC4gcmVzZXJ2ZXMgYWxsIHJpZ2h0cyBub3QgZXhwcmVzc2x5IGdyYW50ZWQgdG8geW91LlxuXG4gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbiBUSEUgU09GVFdBUkUuXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuaW1wb3J0IHsgTWF0NCwgVmVjMyB9IGZyb20gJy4uL3ZhbHVlLXR5cGVzJztcbmltcG9ydCBlbnVtcyBmcm9tICcuL2VudW1zJztcbmltcG9ydCBwbGFuZSBmcm9tICcuL3BsYW5lJztcblxuY29uc3QgX3YgPSBuZXcgQXJyYXkoOCk7XG5fdlswXSA9IG5ldyBWZWMzKDEsIDEsIDEpO1xuX3ZbMV0gPSBuZXcgVmVjMygtMSwgMSwgMSk7XG5fdlsyXSA9IG5ldyBWZWMzKC0xLCAtMSwgMSk7XG5fdlszXSA9IG5ldyBWZWMzKDEsIC0xLCAxKTtcbl92WzRdID0gbmV3IFZlYzMoMSwgMSwgLTEpO1xuX3ZbNV0gPSBuZXcgVmVjMygtMSwgMSwgLTEpO1xuX3ZbNl0gPSBuZXcgVmVjMygtMSwgLTEsIC0xKTtcbl92WzddID0gbmV3IFZlYzMoMSwgLTEsIC0xKTtcblxuLyoqXG4gKiAhI2VuIGZydXN0dW1cbiAqICEjemgg5bmz5oiq5aS05L2TXG4gKiBAY2xhc3MgZ2VvbVV0aWxzLkZydXN0dW1cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgZnJ1c3R1bSB7XG5cbiAgICAvKipcbiAgICAgKiBTZXQgd2hldGhlciB0byB1c2UgYWNjdXJhdGUgaW50ZXJzZWN0aW9uIHRlc3RpbmcgZnVuY3Rpb24gb24gdGhpcyBmcnVzdHVtXG4gICAgICogQHByb3BlcnR5IHtib29sZWFufSBhY2N1cmF0ZVxuICAgICAqL1xuICAgIHNldCBhY2N1cmF0ZSAoYjogYm9vbGVhbikge1xuICAgICAgICB0aGlzLl90eXBlID0gYiA/IGVudW1zLlNIQVBFX0ZSVVNUVU1fQUNDVVJBVEUgOiBlbnVtcy5TSEFQRV9GUlVTVFVNO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlT3J0aG8gPSAoKCkgPT4ge1xuICAgICAgICBjb25zdCBfdGVtcF92MyA9IG5ldyBWZWMzKCk7XG4gICAgICAgIHJldHVybiAob3V0OiBmcnVzdHVtLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciwgbmVhcjogbnVtYmVyLCBmYXI6IG51bWJlciwgdHJhbnNmb3JtOiBNYXQ0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBoYWxmV2lkdGggPSB3aWR0aCAvIDI7XG4gICAgICAgICAgICBjb25zdCBoYWxmSGVpZ2h0ID0gaGVpZ2h0IC8gMjtcbiAgICAgICAgICAgIFZlYzMuc2V0KF90ZW1wX3YzLCBoYWxmV2lkdGgsIGhhbGZIZWlnaHQsIG5lYXIpO1xuICAgICAgICAgICAgVmVjMy50cmFuc2Zvcm1NYXQ0KG91dC52ZXJ0aWNlc1swXSwgX3RlbXBfdjMsIHRyYW5zZm9ybSk7XG4gICAgICAgICAgICBWZWMzLnNldChfdGVtcF92MywgLWhhbGZXaWR0aCwgaGFsZkhlaWdodCwgbmVhcik7XG4gICAgICAgICAgICBWZWMzLnRyYW5zZm9ybU1hdDQob3V0LnZlcnRpY2VzWzFdLCBfdGVtcF92MywgdHJhbnNmb3JtKTtcbiAgICAgICAgICAgIFZlYzMuc2V0KF90ZW1wX3YzLCAtaGFsZldpZHRoLCAtaGFsZkhlaWdodCwgbmVhcik7XG4gICAgICAgICAgICBWZWMzLnRyYW5zZm9ybU1hdDQob3V0LnZlcnRpY2VzWzJdLCBfdGVtcF92MywgdHJhbnNmb3JtKTtcbiAgICAgICAgICAgIFZlYzMuc2V0KF90ZW1wX3YzLCBoYWxmV2lkdGgsIC1oYWxmSGVpZ2h0LCBuZWFyKTtcbiAgICAgICAgICAgIFZlYzMudHJhbnNmb3JtTWF0NChvdXQudmVydGljZXNbM10sIF90ZW1wX3YzLCB0cmFuc2Zvcm0pO1xuICAgICAgICAgICAgVmVjMy5zZXQoX3RlbXBfdjMsIGhhbGZXaWR0aCwgaGFsZkhlaWdodCwgZmFyKTtcbiAgICAgICAgICAgIFZlYzMudHJhbnNmb3JtTWF0NChvdXQudmVydGljZXNbNF0sIF90ZW1wX3YzLCB0cmFuc2Zvcm0pO1xuICAgICAgICAgICAgVmVjMy5zZXQoX3RlbXBfdjMsIC1oYWxmV2lkdGgsIGhhbGZIZWlnaHQsIGZhcik7XG4gICAgICAgICAgICBWZWMzLnRyYW5zZm9ybU1hdDQob3V0LnZlcnRpY2VzWzVdLCBfdGVtcF92MywgdHJhbnNmb3JtKTtcbiAgICAgICAgICAgIFZlYzMuc2V0KF90ZW1wX3YzLCAtaGFsZldpZHRoLCAtaGFsZkhlaWdodCwgZmFyKTtcbiAgICAgICAgICAgIFZlYzMudHJhbnNmb3JtTWF0NChvdXQudmVydGljZXNbNl0sIF90ZW1wX3YzLCB0cmFuc2Zvcm0pO1xuICAgICAgICAgICAgVmVjMy5zZXQoX3RlbXBfdjMsIGhhbGZXaWR0aCwgLWhhbGZIZWlnaHQsIGZhcik7XG4gICAgICAgICAgICBWZWMzLnRyYW5zZm9ybU1hdDQob3V0LnZlcnRpY2VzWzddLCBfdGVtcF92MywgdHJhbnNmb3JtKTtcblxuICAgICAgICAgICAgcGxhbmUuZnJvbVBvaW50cyhvdXQucGxhbmVzWzBdLCBvdXQudmVydGljZXNbMV0sIG91dC52ZXJ0aWNlc1s2XSwgb3V0LnZlcnRpY2VzWzVdKTtcbiAgICAgICAgICAgIHBsYW5lLmZyb21Qb2ludHMob3V0LnBsYW5lc1sxXSwgb3V0LnZlcnRpY2VzWzNdLCBvdXQudmVydGljZXNbNF0sIG91dC52ZXJ0aWNlc1s3XSk7XG4gICAgICAgICAgICBwbGFuZS5mcm9tUG9pbnRzKG91dC5wbGFuZXNbMl0sIG91dC52ZXJ0aWNlc1s2XSwgb3V0LnZlcnRpY2VzWzNdLCBvdXQudmVydGljZXNbN10pO1xuICAgICAgICAgICAgcGxhbmUuZnJvbVBvaW50cyhvdXQucGxhbmVzWzNdLCBvdXQudmVydGljZXNbMF0sIG91dC52ZXJ0aWNlc1s1XSwgb3V0LnZlcnRpY2VzWzRdKTtcbiAgICAgICAgICAgIHBsYW5lLmZyb21Qb2ludHMob3V0LnBsYW5lc1s0XSwgb3V0LnZlcnRpY2VzWzJdLCBvdXQudmVydGljZXNbMF0sIG91dC52ZXJ0aWNlc1szXSk7XG4gICAgICAgICAgICBwbGFuZS5mcm9tUG9pbnRzKG91dC5wbGFuZXNbMF0sIG91dC52ZXJ0aWNlc1s3XSwgb3V0LnZlcnRpY2VzWzVdLCBvdXQudmVydGljZXNbNl0pO1xuICAgICAgICB9O1xuICAgIH0pKCk7XG5cbiAgICAvKipcbiAgICAgKiBjcmVhdGUgYSBuZXcgZnJ1c3R1bVxuICAgICAqIEBtZXRob2QgY3JlYXRlXG4gICAgICogQHN0YXRpY1xuICAgICAqIEByZXR1cm4ge0ZydXN0dW19XG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBjcmVhdGUgKCkge1xuICAgICAgICByZXR1cm4gbmV3IGZydXN0dW0oKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDbG9uZSBhIGZydXN0dW1cbiAgICAgKiBAbWV0aG9kIGNsb25lXG4gICAgICogQHBhcmFtIHtGcnVzdHVtfSBmXG4gICAgICogQHN0YXRpY1xuICAgICAqIEByZXR1cm4ge0ZydXN0dW19XG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBjbG9uZSAoZjogZnJ1c3R1bSk6IGZydXN0dW0ge1xuICAgICAgICByZXR1cm4gZnJ1c3R1bS5jb3B5KG5ldyBmcnVzdHVtKCksIGYpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSBmcnVzdHVtIHRvIGFub3RoZXJcbiAgICAgKiBAbWV0aG9kIGNvcHlcbiAgICAgKiBAcGFyYW0ge0ZydXN0dW19IG91dFxuICAgICAqIEBwYXJhbSB7RnJ1c3R1bX0gZlxuICAgICAqIEByZXR1cm4ge0ZydXN0dW19XG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBjb3B5IChvdXQ6IGZydXN0dW0sIGY6IGZydXN0dW0pOiBmcnVzdHVtIHtcbiAgICAgICAgb3V0Ll90eXBlID0gZi5fdHlwZTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA2OyArK2kpIHtcbiAgICAgICAgICAgIHBsYW5lLmNvcHkob3V0LnBsYW5lc1tpXSwgZi5wbGFuZXNbaV0pO1xuICAgICAgICB9XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgODsgKytpKSB7XG4gICAgICAgICAgICBWZWMzLmNvcHkob3V0LnZlcnRpY2VzW2ldLCBmLnZlcnRpY2VzW2ldKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb3V0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwcm9wZXJ0eSB7UGxhbmVbXX0gcGxhbmVzXG4gICAgICovXG4gICAgcHVibGljIHBsYW5lczogcGxhbmVbXTtcbiAgICAvKipcbiAgICAgKiBAcHJvcGVydHkge1ZlYzNbXX0gcGxhbmVzXG4gICAgICovXG4gICAgcHVibGljIHZlcnRpY2VzOiBWZWMzW107XG4gICAgcHJpdmF0ZSBfdHlwZTogbnVtYmVyO1xuXG4gICAgY29uc3RydWN0b3IgKCkge1xuICAgICAgICB0aGlzLl90eXBlID0gZW51bXMuU0hBUEVfRlJVU1RVTTtcbiAgICAgICAgdGhpcy5wbGFuZXMgPSBuZXcgQXJyYXkoNik7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNjsgKytpKSB7XG4gICAgICAgICAgICB0aGlzLnBsYW5lc1tpXSA9IHBsYW5lLmNyZWF0ZSgwLCAwLCAwLCAwKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnZlcnRpY2VzID0gbmV3IEFycmF5KDgpO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDg7ICsraSkge1xuICAgICAgICAgICAgdGhpcy52ZXJ0aWNlc1tpXSA9IG5ldyBWZWMzKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAhI2VuIFVwZGF0ZSB0aGUgZnJ1c3R1bSBpbmZvcm1hdGlvbiBhY2NvcmRpbmcgdG8gdGhlIGdpdmVuIHRyYW5zZm9ybSBtYXRyaXguXG4gICAgICogTm90ZSB0aGF0IHRoZSByZXN1bHRpbmcgcGxhbmVzIGFyZSBub3Qgbm9ybWFsaXplZCB1bmRlciBub3JtYWwgbW9kZS5cbiAgICAgKiBAbWV0aG9kIHVwZGF0ZVxuICAgICAqIEBwYXJhbSB7TWF0NH0gbSB0aGUgdmlldy1wcm9qZWN0aW9uIG1hdHJpeFxuICAgICAqIEBwYXJhbSB7TWF0NH0gaW52IHRoZSBpbnZlcnNlIHZpZXctcHJvamVjdGlvbiBtYXRyaXhcbiAgICAgKi9cbiAgICBwdWJsaWMgdXBkYXRlIChtOiBNYXQ0LCBpbnY6IE1hdDQpIHtcbiAgICAgICAgLy8gUlRSNCwgY2guIDIyLjE0LjEsIHAuIDk4M1xuICAgICAgICAvLyBleHRyYWN0IGZydXN0dW0gcGxhbmVzIGZyb20gdmlldy1wcm9qIG1hdHJpeC5cblxuICAgICAgICBsZXQgbW0gPSBtLm07XG5cbiAgICAgICAgLy8gbGVmdCBwbGFuZVxuICAgICAgICBWZWMzLnNldCh0aGlzLnBsYW5lc1swXS5uLCBtbVszXSArIG1tWzBdLCBtbVs3XSArIG1tWzRdLCBtbVsxMV0gKyBtbVs4XSk7XG4gICAgICAgIHRoaXMucGxhbmVzWzBdLmQgPSAtKG1tWzE1XSArIG1tWzEyXSk7XG4gICAgICAgIC8vIHJpZ2h0IHBsYW5lXG4gICAgICAgIFZlYzMuc2V0KHRoaXMucGxhbmVzWzFdLm4sIG1tWzNdIC0gbW1bMF0sIG1tWzddIC0gbW1bNF0sIG1tWzExXSAtIG1tWzhdKTtcbiAgICAgICAgdGhpcy5wbGFuZXNbMV0uZCA9IC0obW1bMTVdIC0gbW1bMTJdKTtcbiAgICAgICAgLy8gYm90dG9tIHBsYW5lXG4gICAgICAgIFZlYzMuc2V0KHRoaXMucGxhbmVzWzJdLm4sIG1tWzNdICsgbW1bMV0sIG1tWzddICsgbW1bNV0sIG1tWzExXSArIG1tWzldKTtcbiAgICAgICAgdGhpcy5wbGFuZXNbMl0uZCA9IC0obW1bMTVdICsgbW1bMTNdKTtcbiAgICAgICAgLy8gdG9wIHBsYW5lXG4gICAgICAgIFZlYzMuc2V0KHRoaXMucGxhbmVzWzNdLm4sIG1tWzNdIC0gbW1bMV0sIG1tWzddIC0gbW1bNV0sIG1tWzExXSAtIG1tWzldKTtcbiAgICAgICAgdGhpcy5wbGFuZXNbM10uZCA9IC0obW1bMTVdIC0gbW1bMTNdKTtcbiAgICAgICAgLy8gbmVhciBwbGFuZVxuICAgICAgICBWZWMzLnNldCh0aGlzLnBsYW5lc1s0XS5uLCBtbVszXSArIG1tWzJdLCBtbVs3XSArIG1tWzZdLCBtbVsxMV0gKyBtbVsxMF0pO1xuICAgICAgICB0aGlzLnBsYW5lc1s0XS5kID0gLShtbVsxNV0gKyBtbVsxNF0pO1xuICAgICAgICAvLyBmYXIgcGxhbmVcbiAgICAgICAgVmVjMy5zZXQodGhpcy5wbGFuZXNbNV0ubiwgbW1bM10gLSBtbVsyXSwgbW1bN10gLSBtbVs2XSwgbW1bMTFdIC0gbW1bMTBdKTtcbiAgICAgICAgdGhpcy5wbGFuZXNbNV0uZCA9IC0obW1bMTVdIC0gbW1bMTRdKTtcblxuICAgICAgICBpZiAodGhpcy5fdHlwZSAhPT0gZW51bXMuU0hBUEVfRlJVU1RVTV9BQ0NVUkFURSkgeyByZXR1cm47IH1cblxuICAgICAgICAvLyBub3JtYWxpemUgcGxhbmVzXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNjsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBwbCA9IHRoaXMucGxhbmVzW2ldO1xuICAgICAgICAgICAgY29uc3QgaW52RGlzdCA9IDEgLyBwbC5uLmxlbmd0aCgpO1xuICAgICAgICAgICAgVmVjMy5tdWx0aXBseVNjYWxhcihwbC5uLCBwbC5uLCBpbnZEaXN0KTtcbiAgICAgICAgICAgIHBsLmQgKj0gaW52RGlzdDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHVwZGF0ZSBmcnVzdHVtIHZlcnRpY2VzXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgODsgaSsrKSB7XG4gICAgICAgICAgICBWZWMzLnRyYW5zZm9ybU1hdDQodGhpcy52ZXJ0aWNlc1tpXSwgX3ZbaV0sIGludik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAhI2VuIHRyYW5zZm9ybSBieSBtYXRyaXhcbiAgICAgKiBAbWV0aG9kIHRyYW5zZm9ybVxuICAgICAqIEBwYXJhbSB7TWF0NH0gbWF0XG4gICAgICovXG4gICAgcHVibGljIHRyYW5zZm9ybSAobWF0OiBNYXQ0KSB7XG4gICAgICAgIGlmICh0aGlzLl90eXBlICE9PSBlbnVtcy5TSEFQRV9GUlVTVFVNX0FDQ1VSQVRFKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA4OyBpKyspIHtcbiAgICAgICAgICAgIFZlYzMudHJhbnNmb3JtTWF0NCh0aGlzLnZlcnRpY2VzW2ldLCB0aGlzLnZlcnRpY2VzW2ldLCBtYXQpO1xuICAgICAgICB9XG4gICAgICAgIHBsYW5lLmZyb21Qb2ludHModGhpcy5wbGFuZXNbMF0sIHRoaXMudmVydGljZXNbMV0sIHRoaXMudmVydGljZXNbNV0sIHRoaXMudmVydGljZXNbNl0pO1xuICAgICAgICBwbGFuZS5mcm9tUG9pbnRzKHRoaXMucGxhbmVzWzFdLCB0aGlzLnZlcnRpY2VzWzNdLCB0aGlzLnZlcnRpY2VzWzddLCB0aGlzLnZlcnRpY2VzWzRdKTtcbiAgICAgICAgcGxhbmUuZnJvbVBvaW50cyh0aGlzLnBsYW5lc1syXSwgdGhpcy52ZXJ0aWNlc1s2XSwgdGhpcy52ZXJ0aWNlc1s3XSwgdGhpcy52ZXJ0aWNlc1szXSk7XG4gICAgICAgIHBsYW5lLmZyb21Qb2ludHModGhpcy5wbGFuZXNbM10sIHRoaXMudmVydGljZXNbMF0sIHRoaXMudmVydGljZXNbNF0sIHRoaXMudmVydGljZXNbNV0pO1xuICAgICAgICBwbGFuZS5mcm9tUG9pbnRzKHRoaXMucGxhbmVzWzRdLCB0aGlzLnZlcnRpY2VzWzJdLCB0aGlzLnZlcnRpY2VzWzNdLCB0aGlzLnZlcnRpY2VzWzBdKTtcbiAgICAgICAgcGxhbmUuZnJvbVBvaW50cyh0aGlzLnBsYW5lc1swXSwgdGhpcy52ZXJ0aWNlc1s3XSwgdGhpcy52ZXJ0aWNlc1s2XSwgdGhpcy52ZXJ0aWNlc1s1XSk7XG4gICAgfVxufVxuIl0sInNvdXJjZVJvb3QiOiIvIn0=