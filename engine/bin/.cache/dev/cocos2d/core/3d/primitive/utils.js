
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'engine-dev/cocos2d/core/3d/primitive/utils.js';
                    var __require = nodeEnv ? function (request) {
                        return require(request);
                    } : function (request) {
                        return __quick_compile_engine__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_engine__.registerModule(__filename, module);}"use strict";

exports.__esModule = true;
exports.wireframe = wireframe;
exports.invWinding = invWinding;
exports.toWavefrontOBJ = toWavefrontOBJ;
exports.normals = normals;
exports.calcNormals = calcNormals;

var _vec = _interopRequireDefault(require("../../value-types/vec3"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function wireframe(indices) {
  var offsets = [[0, 1], [1, 2], [2, 0]];
  var lines = [];
  var lineIDs = {};

  for (var i = 0; i < indices.length; i += 3) {
    for (var k = 0; k < 3; ++k) {
      var i1 = indices[i + offsets[k][0]];
      var i2 = indices[i + offsets[k][1]]; // check if we already have the line in our lines

      var id = i1 > i2 ? i2 << 16 | i1 : i1 << 16 | i2;

      if (lineIDs[id] === undefined) {
        lineIDs[id] = 0;
        lines.push(i1, i2);
      }
    }
  }

  return lines;
}

function invWinding(indices) {
  var newIB = [];

  for (var i = 0; i < indices.length; i += 3) {
    newIB.push(indices[i], indices[i + 2], indices[i + 1]);
  }

  return newIB;
}

function toWavefrontOBJ(primitive, scale) {
  if (scale === void 0) {
    scale = 1;
  }

  var v = primitive.positions,
      t = primitive.uvs,
      n = primitive.normals,
      IB = primitive.indices;

  var V = function V(i) {
    return IB[i] + 1 + "/" + (IB[i] + 1) + "/" + (IB[i] + 1);
  };

  var content = '';

  for (var i = 0; i < v.length; i += 3) {
    content += "v " + v[i] * scale + " " + v[i + 1] * scale + " " + v[i + 2] * scale + "\n";
  }

  for (var _i = 0; _i < t.length; _i += 2) {
    content += "vt " + t[_i] + " " + t[_i + 1] + "\n";
  }

  for (var _i2 = 0; _i2 < n.length; _i2 += 3) {
    content += "vn " + n[_i2] + " " + n[_i2 + 1] + " " + n[_i2 + 2] + "\n";
  }

  for (var _i3 = 0; _i3 < IB.length; _i3 += 3) {
    content += "f " + V(_i3) + " " + V(_i3 + 1) + " " + V(_i3 + 2) + "\n";
  }

  return content;
}

function normals(positions, normals, length) {
  if (length === void 0) {
    length = 1;
  }

  var verts = new Array(2 * positions.length);

  for (var i = 0; i < positions.length / 3; ++i) {
    var i3 = 3 * i;
    var i6 = 6 * i; // line start

    verts[i6 + 0] = positions[i3 + 0];
    verts[i6 + 1] = positions[i3 + 1];
    verts[i6 + 2] = positions[i3 + 2]; // line end

    verts[i6 + 3] = positions[i3 + 0] + normals[i3 + 0] * length;
    verts[i6 + 4] = positions[i3 + 1] + normals[i3 + 1] * length;
    verts[i6 + 5] = positions[i3 + 2] + normals[i3 + 2] * length;
  }

  return verts;
}

function fromArray(out, a, offset) {
  out.x = a[offset];
  out.y = a[offset + 1];
  out.z = a[offset + 2];
}

function calcNormals(positions, indices, normals) {
  normals = normals || new Array(positions.length);

  for (var i = 0, l = normals.length; i < l; i++) {
    normals[i] = 0;
  }

  var vA, vB, vC;
  var pA = cc.v3(),
      pB = cc.v3(),
      pC = cc.v3();
  var cb = cc.v3(),
      ab = cc.v3();

  for (var _i4 = 0, il = indices.length; _i4 < il; _i4 += 3) {
    vA = indices[_i4 + 0] * 3;
    vB = indices[_i4 + 1] * 3;
    vC = indices[_i4 + 2] * 3;
    fromArray(pA, positions, vA);
    fromArray(pB, positions, vB);
    fromArray(pC, positions, vC);

    _vec["default"].subtract(cb, pC, pB);

    _vec["default"].subtract(ab, pA, pB);

    _vec["default"].cross(cb, cb, ab);

    normals[vA] += cb.x;
    normals[vA + 1] += cb.y;
    normals[vA + 2] += cb.z;
    normals[vB] += cb.x;
    normals[vB + 1] += cb.y;
    normals[vB + 2] += cb.z;
    normals[vC] += cb.x;
    normals[vC + 1] += cb.y;
    normals[vC + 2] += cb.z;
  }

  var tempNormal = cc.v3();

  for (var _i5 = 0, _l = normals.length; _i5 < _l; _i5 += 3) {
    tempNormal.x = normals[_i5];
    tempNormal.y = normals[_i5 + 1];
    tempNormal.z = normals[_i5 + 2];
    tempNormal.normalizeSelf();
    normals[_i5] = tempNormal.x;
    normals[_i5 + 1] = tempNormal.y;
    normals[_i5 + 2] = tempNormal.z;
  }

  return normals;
}
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVuZ2luZS1kZXYvY29jb3MyZC9jb3JlLzNkL3ByaW1pdGl2ZS91dGlscy50cyJdLCJuYW1lcyI6WyJ3aXJlZnJhbWUiLCJpbmRpY2VzIiwib2Zmc2V0cyIsImxpbmVzIiwibGluZUlEcyIsImkiLCJsZW5ndGgiLCJrIiwiaTEiLCJpMiIsImlkIiwidW5kZWZpbmVkIiwicHVzaCIsImludldpbmRpbmciLCJuZXdJQiIsInRvV2F2ZWZyb250T0JKIiwicHJpbWl0aXZlIiwic2NhbGUiLCJ2IiwicG9zaXRpb25zIiwidCIsInV2cyIsIm4iLCJub3JtYWxzIiwiSUIiLCJWIiwiY29udGVudCIsInZlcnRzIiwiQXJyYXkiLCJpMyIsImk2IiwiZnJvbUFycmF5Iiwib3V0IiwiYSIsIm9mZnNldCIsIngiLCJ5IiwieiIsImNhbGNOb3JtYWxzIiwibCIsInZBIiwidkIiLCJ2QyIsInBBIiwiY2MiLCJ2MyIsInBCIiwicEMiLCJjYiIsImFiIiwiaWwiLCJWZWMzIiwic3VidHJhY3QiLCJjcm9zcyIsInRlbXBOb3JtYWwiLCJub3JtYWxpemVTZWxmIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOzs7O0FBRU8sU0FBU0EsU0FBVCxDQUFtQkMsT0FBbkIsRUFBNEI7QUFDakMsTUFBTUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFELEVBQVMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFULEVBQWlCLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBakIsQ0FBaEI7QUFDQSxNQUFJQyxLQUFlLEdBQUcsRUFBdEI7QUFDQSxNQUFJQyxPQUFPLEdBQUcsRUFBZDs7QUFFQSxPQUFLLElBQUlDLENBQUMsR0FBRyxDQUFiLEVBQWdCQSxDQUFDLEdBQUdKLE9BQU8sQ0FBQ0ssTUFBNUIsRUFBb0NELENBQUMsSUFBSSxDQUF6QyxFQUE0QztBQUMxQyxTQUFLLElBQUlFLENBQUMsR0FBRyxDQUFiLEVBQWdCQSxDQUFDLEdBQUcsQ0FBcEIsRUFB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QyxHQUFDLEdBQUcsQ0FBUixFQUFXa0MsRUFBQyxHQUFHaEIsT0FBTyxDQUFDakIsTUFBNUIsRUFBb0NELEdBQUMsR0FBR2tDLEVBQXhDLEVBQTJDbEMsR0FBQyxJQUFFLENBQTlDLEVBQWlEO0FBQzdDaUQsSUFBQUEsVUFBVSxDQUFDbkIsQ0FBWCxHQUFlWixPQUFPLENBQUNsQixHQUFELENBQXRCO0FBQ0FpRCxJQUFBQSxVQUFVLENBQUNsQixDQUFYLEdBQWViLE9BQU8sQ0FBQ2xCLEdBQUMsR0FBQyxDQUFILENBQXRCO0FBQ0FpRCxJQUFBQSxVQUFVLENBQUNqQixDQUFYLEdBQWVkLE9BQU8sQ0FBQ2xCLEdBQUMsR0FBQyxDQUFILENBQXRCO0FBRUFpRCxJQUFBQSxVQUFVLENBQUNDLGFBQVg7QUFFQWhDLElBQUFBLE9BQU8sQ0FBQ2xCLEdBQUQsQ0FBUCxHQUFhaUQsVUFBVSxDQUFDbkIsQ0FBeEI7QUFDQVosSUFBQUEsT0FBTyxDQUFDbEIsR0FBQyxHQUFDLENBQUgsQ0FBUCxHQUFlaUQsVUFBVSxDQUFDbEIsQ0FBMUI7QUFDQWIsSUFBQUEsT0FBTyxDQUFDbEIsR0FBQyxHQUFDLENBQUgsQ0FBUCxHQUFlaUQsVUFBVSxDQUFDakIsQ0FBMUI7QUFDSDs7QUFFRCxTQUFPZCxPQUFQO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgVmVjMyBmcm9tICcuLi8uLi92YWx1ZS10eXBlcy92ZWMzJztcblxuZXhwb3J0IGZ1bmN0aW9uIHdpcmVmcmFtZShpbmRpY2VzKSB7XG4gIGNvbnN0IG9mZnNldHMgPSBbWzAsIDFdLCBbMSwgMl0sIFsyLCAwXV07XG4gIGxldCBsaW5lczogbnVtYmVyW10gPSBbXTtcbiAgbGV0IGxpbmVJRHMgPSB7fTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGluZGljZXMubGVuZ3RoOyBpICs9IDMpIHtcbiAgICBmb3IgKGxldCBrID0gMDsgayA8IDM7ICsraykge1xuICAgICAgbGV0IGkxID0gaW5kaWNlc1tpICsgb2Zmc2V0c1trXVswXV07XG4gICAgICBsZXQgaTIgPSBpbmRpY2VzW2kgKyBvZmZzZXRzW2tdWzFdXTtcblxuICAgICAgLy8gY2hlY2sgaWYgd2UgYWxyZWFkeSBoYXZlIHRoZSBsaW5lIGluIG91ciBsaW5lc1xuICAgICAgbGV0IGlkID0gKGkxID4gaTIpID8gKChpMiA8PCAxNikgfCBpMSkgOiAoKGkxIDw8IDE2KSB8IGkyKTtcbiAgICAgIGlmIChsaW5lSURzW2lkXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxpbmVJRHNbaWRdID0gMDtcbiAgICAgICAgbGluZXMucHVzaChpMSwgaTIpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBsaW5lcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGludldpbmRpbmcoaW5kaWNlcykge1xuICBsZXQgbmV3SUIgOiBudW1iZXJbXSA9IFtdO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGluZGljZXMubGVuZ3RoOyBpICs9IDMpXG4gICAgbmV3SUIucHVzaChpbmRpY2VzW2ldLCBpbmRpY2VzW2kgKyAyXSwgaW5kaWNlc1tpICsgMV0pO1xuICByZXR1cm4gbmV3SUI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0b1dhdmVmcm9udE9CSihwcmltaXRpdmUsIHNjYWxlID0gMSkge1xuICBsZXQgdiA9IHByaW1pdGl2ZS5wb3NpdGlvbnMsIHQgPSBwcmltaXRpdmUudXZzLCBuID0gcHJpbWl0aXZlLm5vcm1hbHMsIElCID0gcHJpbWl0aXZlLmluZGljZXM7XG4gIGxldCBWID0gaSA9PiBgJHtJQltpXSsxfS8ke0lCW2ldKzF9LyR7SUJbaV0rMX1gO1xuICBsZXQgY29udGVudCA9ICcnO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHYubGVuZ3RoOyBpICs9IDMpXG4gICAgY29udGVudCArPSBgdiAke3ZbaV0qc2NhbGV9ICR7dltpKzFdKnNjYWxlfSAke3ZbaSsyXSpzY2FsZX1cXG5gO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHQubGVuZ3RoOyBpICs9IDIpXG4gICAgY29udGVudCArPSBgdnQgJHt0W2ldfSAke3RbaSsxXX1cXG5gO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IG4ubGVuZ3RoOyBpICs9IDMpXG4gICAgY29udGVudCArPSBgdm4gJHtuW2ldfSAke25baSsxXX0gJHtuW2krMl19XFxuYDtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBJQi5sZW5ndGg7IGkgKz0gMylcbiAgICBjb250ZW50ICs9IGBmICR7VihpKX0gJHtWKGkrMSl9ICR7VihpKzIpfVxcbmA7XG4gIHJldHVybiBjb250ZW50O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFscyhwb3NpdGlvbnMsIG5vcm1hbHMsIGxlbmd0aCA9IDEpIHtcbiAgbGV0IHZlcnRzID0gbmV3IEFycmF5KDIgKiBwb3NpdGlvbnMubGVuZ3RoKTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IHBvc2l0aW9ucy5sZW5ndGgvMzsgKytpKSB7XG4gICAgbGV0IGkzID0gMyppO1xuICAgIGxldCBpNiA9IDYqaTtcblxuICAgIC8vIGxpbmUgc3RhcnRcbiAgICB2ZXJ0c1tpNiArIDBdID0gcG9zaXRpb25zW2kzICsgMF07XG4gICAgdmVydHNbaTYgKyAxXSA9IHBvc2l0aW9uc1tpMyArIDFdO1xuICAgIHZlcnRzW2k2ICsgMl0gPSBwb3NpdGlvbnNbaTMgKyAyXTtcblxuICAgIC8vIGxpbmUgZW5kXG4gICAgdmVydHNbaTYgKyAzXSA9IHBvc2l0aW9uc1tpMyArIDBdICsgbm9ybWFsc1tpMyArIDBdICogbGVuZ3RoO1xuICAgIHZlcnRzW2k2ICsgNF0gPSBwb3NpdGlvbnNbaTMgKyAxXSArIG5vcm1hbHNbaTMgKyAxXSAqIGxlbmd0aDtcbiAgICB2ZXJ0c1tpNiArIDVdID0gcG9zaXRpb25zW2kzICsgMl0gKyBub3JtYWxzW2kzICsgMl0gKiBsZW5ndGg7XG4gIH1cblxuICByZXR1cm4gdmVydHM7XG59XG5cblxuZnVuY3Rpb24gZnJvbUFycmF5IChvdXQsIGEsIG9mZnNldCkge1xuICBvdXQueCA9IGFbb2Zmc2V0XTtcbiAgb3V0LnkgPSBhW29mZnNldCsxXTtcbiAgb3V0LnogPSBhW29mZnNldCsyXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbGNOb3JtYWxzIChwb3NpdGlvbnMsIGluZGljZXMsIG5vcm1hbHMpIHtcbiAgbm9ybWFscyA9IG5vcm1hbHMgfHwgbmV3IEFycmF5KHBvc2l0aW9ucy5sZW5ndGgpO1xuICBmb3IgKGxldCBpID0gMCwgbCA9IG5vcm1hbHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBub3JtYWxzW2ldID0gMDtcbiAgfVxuXG4gIGxldCB2QSwgdkIsIHZDO1xuICBsZXQgcEEgPSBjYy52MygpLCBwQiA9IGNjLnYzKCksIHBDID0gY2MudjMoKTtcbiAgbGV0IGNiID0gY2MudjMoKSwgYWIgPSBjYy52MygpO1xuXG4gIGZvciAobGV0IGkgPSAwLCBpbCA9IGluZGljZXMubGVuZ3RoOyBpIDwgaWw7IGkgKz0gMykge1xuXG4gICAgICB2QSA9IGluZGljZXNbaSArIDBdICogMztcbiAgICAgIHZCID0gaW5kaWNlc1tpICsgMV0gKiAzO1xuICAgICAgdkMgPSBpbmRpY2VzW2kgKyAyXSAqIDM7XG5cbiAgICAgIGZyb21BcnJheShwQSwgcG9zaXRpb25zLCB2QSk7XG4gICAgICBmcm9tQXJyYXkocEIsIHBvc2l0aW9ucywgdkIpO1xuICAgICAgZnJvbUFycmF5KHBDLCBwb3NpdGlvbnMsIHZDKTtcblxuICAgICAgVmVjMy5zdWJ0cmFjdChjYiwgcEMsIHBCKTtcbiAgICAgIFZlYzMuc3VidHJhY3QoYWIsIHBBLCBwQik7XG4gICAgICBWZWMzLmNyb3NzKGNiLCBjYiwgYWIpO1xuXG4gICAgICBub3JtYWxzW3ZBXSArPSBjYi54O1xuICAgICAgbm9ybWFsc1t2QSArIDFdICs9IGNiLnk7XG4gICAgICBub3JtYWxzW3ZBICsgMl0gKz0gY2IuejtcblxuICAgICAgbm9ybWFsc1t2Ql0gKz0gY2IueDtcbiAgICAgIG5vcm1hbHNbdkIgKyAxXSArPSBjYi55O1xuICAgICAgbm9ybWFsc1t2QiArIDJdICs9IGNiLno7XG5cbiAgICAgIG5vcm1hbHNbdkNdICs9IGNiLng7XG4gICAgICBub3JtYWxzW3ZDICsgMV0gKz0gY2IueTtcbiAgICAgIG5vcm1hbHNbdkMgKyAyXSArPSBjYi56O1xuICB9XG5cbiAgbGV0IHRlbXBOb3JtYWwgPSBjYy52MygpO1xuICBmb3IgKGxldCBpID0gMCwgbCA9IG5vcm1hbHMubGVuZ3RoOyBpIDwgbDsgaSs9Mykge1xuICAgICAgdGVtcE5vcm1hbC54ID0gbm9ybWFsc1tpXTtcbiAgICAgIHRlbXBOb3JtYWwueSA9IG5vcm1hbHNbaSsxXTtcbiAgICAgIHRlbXBOb3JtYWwueiA9IG5vcm1hbHNbaSsyXTtcblxuICAgICAgdGVtcE5vcm1hbC5ub3JtYWxpemVTZWxmKCk7XG5cbiAgICAgIG5vcm1hbHNbaV0gPSB0ZW1wTm9ybWFsLng7XG4gICAgICBub3JtYWxzW2krMV0gPSB0ZW1wTm9ybWFsLnk7XG4gICAgICBub3JtYWxzW2krMl0gPSB0ZW1wTm9ybWFsLno7XG4gIH1cblxuICByZXR1cm4gbm9ybWFscztcbn1cbiJdLCJzb3VyY2VSb290IjoiLyJ9