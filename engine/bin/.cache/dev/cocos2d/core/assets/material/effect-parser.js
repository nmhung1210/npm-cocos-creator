
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'engine-dev/cocos2d/core/assets/material/effect-parser.js';
                    var __require = nodeEnv ? function (request) {
                        return require(request);
                    } : function (request) {
                        return __quick_compile_engine__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_engine__.registerModule(__filename, module);}"use strict";

exports.__esModule = true;
exports.parseEffect = parseEffect;

var _pass = _interopRequireDefault(require("../../../renderer/core/pass"));

var _types = require("../../../renderer/types");

var _enums = _interopRequireDefault(require("../../../renderer/enums"));

var _effect = _interopRequireDefault(require("./effect"));

var _technique = _interopRequireDefault(require("../../../renderer/core/technique"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function getInvolvedProgram(programName) {
  var lib = cc.renderer._forward._programLib;
  return lib.getTemplate(programName);
} // extract properties from each passes and check whether properties is defined but not used.


function parseProperties(effectAsset, passJson) {
  var propertiesJson = passJson.properties || {};
  var program = getInvolvedProgram(passJson.program); // check whether properties are defined in the shaders 

  var _loop = function _loop(prop) {
    var uniformInfo = program.uniforms.find(function (u) {
      return u.name === prop;
    }); // the property is not defined in all the shaders used in techs

    if (!uniformInfo) {
      cc.warnID(9107, effectAsset.name, prop);
      return "continue";
    }
  };

  for (var prop in propertiesJson) {
    var _ret = _loop(prop);

    if (_ret === "continue") continue;
  } // create properties


  var properties = {};
  program.uniforms.forEach(function (u) {
    var name = u.name,
        prop = properties[name] = Object.assign({}, u),
        propInfo = propertiesJson[name];
    var value = _types.enums2default[u.type];

    if (propInfo) {
      if (propInfo.type === _enums["default"].PARAM_TEXTURE_2D) {
        value = null;
      } else if (propInfo.type === _enums["default"].PARAM_INT || propInfo.type === _enums["default"].PARAM_FLOAT) {
        value = Array.isArray(propInfo.value) ? propInfo.value[0] : propInfo.value;
      } else {
        value = new Float32Array(propInfo.value);
      }
    } else {
      value = _types.enums2default[u.type];
    }

    prop.value = value;
  });
  return properties;
}

;

function passDefines(pass) {
  var defines = {};
  var program = getInvolvedProgram(pass.program);
  program.defines.forEach(function (d) {
    defines[d.name] = _types.enums2default[d.type];
  });
  return defines;
}

function parseTechniques(effectAsset) {
  var techNum = effectAsset.techniques.length;
  var techniques = new Array(techNum);

  for (var j = 0; j < techNum; ++j) {
    var tech = effectAsset.techniques[j];
    var techName = tech.name || j;
    var passNum = tech.passes.length;
    var passes = new Array(passNum);

    for (var k = 0; k < passNum; ++k) {
      var pass = tech.passes[k];
      var passName = pass.name || k;
      var detailName = effectAsset.name + "-" + techName + "-" + passName;
      var stage = pass.stage || 'opaque';
      var properties = parseProperties(effectAsset, pass);
      var defines = passDefines(pass);
      var newPass = passes[k] = new _pass["default"](passName, detailName, pass.program, stage, properties, defines); // rasterizer state

      if (pass.rasterizerState) {
        newPass.setCullMode(pass.rasterizerState.cullMode);
      } // blend state


      var blendState = pass.blendState && pass.blendState.targets[0];

      if (blendState) {
        newPass.setBlend(blendState.blend, blendState.blendEq, blendState.blendSrc, blendState.blendDst, blendState.blendAlphaEq, blendState.blendSrcAlpha, blendState.blendDstAlpha, blendState.blendColor);
      } // depth stencil state


      var depthStencilState = pass.depthStencilState;

      if (depthStencilState) {
        newPass.setDepth(depthStencilState.depthTest, depthStencilState.depthWrite, depthStencilState.depthFunc);
        newPass.setStencilFront(depthStencilState.stencilTest, depthStencilState.stencilFuncFront, depthStencilState.stencilRefFront, depthStencilState.stencilMaskFront, depthStencilState.stencilFailOpFront, depthStencilState.stencilZFailOpFront, depthStencilState.stencilZPassOpFront, depthStencilState.stencilWriteMaskFront);
        newPass.setStencilBack(depthStencilState.stencilTest, depthStencilState.stencilFuncBack, depthStencilState.stencilRefBack, depthStencilState.stencilMaskBack, depthStencilState.stencilFailOpBack, depthStencilState.stencilZFailOpBack, depthStencilState.stencilZPassOpBack, depthStencilState.stencilWriteMaskBack);
      }
    }

    techniques[j] = new _technique["default"](techName, passes);
  }

  return techniques;
}

;

function parseEffect(effect) {
  var techniques = parseTechniques(effect);
  return new _effect["default"](effect.name, techniques, 0, effect);
}

;

if (CC_EDITOR) {
  // inspector only need properties defined in CCEffect
  _effect["default"].parseForInspector = function (effectAsset) {
    return effectAsset.techniques.map(function (tech, techIdx) {
      var passes = tech.passes.map(function (pass, passIdx) {
        var program = getInvolvedProgram(pass.program);
        var newProps = {};
        var props = pass.properties;

        var _loop2 = function _loop2(name) {
          newProps[name] = (0, _types.getInspectorProps)(props[name]);
          var u = program.uniforms.find(function (u) {
            return u.name === name;
          });
          newProps[name].defines = u.defines || [];
        };

        for (var name in props) {
          _loop2(name);
        }

        var newDefines = {};
        program.defines.map(function (def) {
          newDefines[def.name] = (0, _types.getInspectorProps)(def);
        });
        return {
          name: pass.name || passIdx,
          props: newProps,
          defines: newDefines
        };
      });
      return {
        name: tech.name || techIdx,
        passes: passes
      };
    });
  };
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVuZ2luZS1kZXYvY29jb3MyZC9jb3JlL2Fzc2V0cy9tYXRlcmlhbC9lZmZlY3QtcGFyc2VyLnRzIl0sIm5hbWVzIjpbImdldEludm9sdmVkUHJvZ3JhbSIsInByb2dyYW1OYW1lIiwibGliIiwiY2MiLCJyZW5kZXJlciIsIl9mb3J3YXJkIiwiX3Byb2dyYW1MaWIiLCJnZXRUZW1wbGF0ZSIsInBhcnNlUHJvcGVydGllcyIsImVmZmVjdEFzc2V0IiwicGFzc0pzb24iLCJwcm9wZXJ0aWVzSnNvbiIsInByb3BlcnRpZXMiLCJwcm9ncmFtIiwicHJvcCIsInVuaWZvcm1JbmZvIiwidW5pZm9ybXMiLCJmaW5kIiwidSIsIm5hbWUiLCJ3YXJuSUQiLCJmb3JFYWNoIiwiT2JqZWN0IiwiYXNzaWduIiwicHJvcEluZm8iLCJ2YWx1ZSIsImVudW1zMmRlZmF1bHQiLCJ0eXBlIiwiZW51bXMiLCJQQVJBTV9URVhUVVJFXzJEIiwiUEFSQU1fSU5UIiwiUEFSQU1fRkxPQVQiLCJBcnJheSIsImlzQXJyYXkiLCJGbG9hdDMyQXJyYXkiLCJwYXNzRGVmaW5lcyIsInBhc3MiLCJkZWZpbmVzIiwiZCIsInBhcnNlVGVjaG5pcXVlcyIsInRlY2hOdW0iLCJ0ZWNobmlxdWVzIiwibGVuZ3RoIiwiaiIsInRlY2giLCJ0ZWNoTmFtZSIsInBhc3NOdW0iLCJwYXNzZXMiLCJrIiwicGFzc05hbWUiLCJkZXRhaWxOYW1lIiwic3RhZ2UiLCJuZXdQYXNzIiwiUGFzcyIsInJhc3Rlcml6ZXJTdGF0ZSIsInNldEN1bGxNb2RlIiwiY3VsbE1vZGUiLCJibGVuZFN0YXRlIiwidGFyZ2V0cyIsInNldEJsZW5kIiwiYmxlbmQiLCJibGVuZEVxIiwiYmxlbmRTcmMiLCJibGVuZERzdCIsImJsZW5kQWxwaGFFcSIsImJsZW5kU3JjQWxwaGEiLCJibGVuZERzdEFscGhhIiwiYmxlbmRDb2xvciIsImRlcHRoU3RlbmNpbFN0YXRlIiwic2V0RGVwdGgiLCJkZXB0aFRlc3QiLCJkZXB0aFdyaXRlIiwiZGVwdGhGdW5jIiwic2V0U3RlbmNpbEZyb250Iiwic3RlbmNpbFRlc3QiLCJzdGVuY2lsRnVuY0Zyb250Iiwic3RlbmNpbFJlZkZyb250Iiwic3RlbmNpbE1hc2tGcm9udCIsInN0ZW5jaWxGYWlsT3BGcm9udCIsInN0ZW5jaWxaRmFpbE9wRnJvbnQiLCJzdGVuY2lsWlBhc3NPcEZyb250Iiwic3RlbmNpbFdyaXRlTWFza0Zyb250Iiwic2V0U3RlbmNpbEJhY2siLCJzdGVuY2lsRnVuY0JhY2siLCJzdGVuY2lsUmVmQmFjayIsInN0ZW5jaWxNYXNrQmFjayIsInN0ZW5jaWxGYWlsT3BCYWNrIiwic3RlbmNpbFpGYWlsT3BCYWNrIiwic3RlbmNpbFpQYXNzT3BCYWNrIiwic3RlbmNpbFdyaXRlTWFza0JhY2siLCJUZWNobmlxdWUiLCJwYXJzZUVmZmVjdCIsImVmZmVjdCIsIkVmZmVjdCIsIkNDX0VESVRPUiIsInBhcnNlRm9ySW5zcGVjdG9yIiwibWFwIiwidGVjaElkeCIsInBhc3NJZHgiLCJuZXdQcm9wcyIsInByb3BzIiwibmV3RGVmaW5lcyIsImRlZiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7O0FBRUEsU0FBU0Esa0JBQVQsQ0FBNkJDLFdBQTdCLEVBQTBDO0FBQ3RDLE1BQUlDLEdBQUcsR0FBR0MsRUFBRSxDQUFDQyxRQUFILENBQVlDLFFBQVosQ0FBcUJDLFdBQS9CO0FBQ0EsU0FBT0osR0FBRyxDQUFDSyxXQUFKLENBQWdCTixXQUFoQixDQUFQO0FBQ0gsRUFFRDs7O0FBQ0EsU0FBU08sZUFBVCxDQUEwQkMsV0FBMUIsRUFBdUNDLFFBQXZDLEVBQWlEO0FBQzdDLE1BQUlDLGNBQWMsR0FBR0QsUUFBUSxDQUFDRSxVQUFULElBQXVCLEVBQTVDO0FBQ0EsTUFBSUMsT0FBTyxHQUFHYixrQkFBa0IsQ0FBQ1UsUUFBUSxDQUFDRyxPQUFWLENBQWhDLENBRjZDLENBSTdDOztBQUo2Qyw2QkFLcENDLElBTG9DO0FBTXpDLFFBQUlD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UUFBUixDQUFpQkMsSUFBakIsQ0FBc0IsVUFBQUMsQ0FBQztBQUFBLG1CQUFJQSxDQUFDLENBQUNDLElBQUYsS0FBV0EsSUFBZjtBQUFBLFdBQXZCLENBQVI7QUFDQWdGLFVBQUFBLFFBQVEsQ0FBQ2hGLElBQUQsQ0FBUixDQUFla0IsT0FBZixHQUF5Qm5CLENBQUMsQ0FBQ21CLE9BQUYsSUFBYSxFQUF0QztBQVR3Qzs7QUFLNUMsYUFBSyxJQUFJbEIsSUFBVCxJQUFpQmlGLEtBQWpCLEVBQXdCO0FBQUEsaUJBQWZqRixJQUFlO0FBS3ZCOztBQUVELFlBQUlrRixVQUFVLEdBQUcsRUFBakI7QUFDQXhGLFFBQUFBLE9BQU8sQ0FBQ3dCLE9BQVIsQ0FBZ0IyRCxHQUFoQixDQUFvQixVQUFBTSxHQUFHLEVBQUk7QUFDdkJELFVBQUFBLFVBQVUsQ0FBQ0MsR0FBRyxDQUFDbkYsSUFBTCxDQUFWLEdBQXVCLDhCQUFrQm1GLEdBQWxCLENBQXZCO0FBQ0gsU0FGRDtBQUlBLGVBQU87QUFDSG5GLFVBQUFBLElBQUksRUFBRWlCLElBQUksQ0FBQ2pCLElBQUwsSUFBYStFLE9BRGhCO0FBRUhFLFVBQUFBLEtBQUssRUFBRUQsUUFGSjtBQUdIOUQsVUFBQUEsT0FBTyxFQUFFZ0U7QUFITixTQUFQO0FBS0gsT0F0QlksQ0FBYjtBQXdCQSxhQUFPO0FBQ0hsRixRQUFBQSxJQUFJLEVBQUV5QixJQUFJLENBQUN6QixJQUFMLElBQWE4RSxPQURoQjtBQUVIbEQsUUFBQUEsTUFBTSxFQUFFQTtBQUZMLE9BQVA7QUFJSCxLQTdCTSxDQUFQO0FBOEJILEdBL0JEO0FBZ0NIIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFBhc3MgZnJvbSAnLi4vLi4vLi4vcmVuZGVyZXIvY29yZS9wYXNzJztcbmltcG9ydCB7IGdldEluc3BlY3RvclByb3BzLCBlbnVtczJkZWZhdWx0IH0gZnJvbSAnLi4vLi4vLi4vcmVuZGVyZXIvdHlwZXMnO1xuaW1wb3J0IGVudW1zIGZyb20gJy4uLy4uLy4uL3JlbmRlcmVyL2VudW1zJztcbmltcG9ydCBFZmZlY3QgZnJvbSAnLi9lZmZlY3QnO1xuaW1wb3J0IFRlY2huaXF1ZSBmcm9tICcuLi8uLi8uLi9yZW5kZXJlci9jb3JlL3RlY2huaXF1ZSc7XG5cbmZ1bmN0aW9uIGdldEludm9sdmVkUHJvZ3JhbSAocHJvZ3JhbU5hbWUpIHtcbiAgICBsZXQgbGliID0gY2MucmVuZGVyZXIuX2ZvcndhcmQuX3Byb2dyYW1MaWI7XG4gICAgcmV0dXJuIGxpYi5nZXRUZW1wbGF0ZShwcm9ncmFtTmFtZSk7XG59XG5cbi8vIGV4dHJhY3QgcHJvcGVydGllcyBmcm9tIGVhY2ggcGFzc2VzIGFuZCBjaGVjayB3aGV0aGVyIHByb3BlcnRpZXMgaXMgZGVmaW5lZCBidXQgbm90IHVzZWQuXG5mdW5jdGlvbiBwYXJzZVByb3BlcnRpZXMgKGVmZmVjdEFzc2V0LCBwYXNzSnNvbikge1xuICAgIGxldCBwcm9wZXJ0aWVzSnNvbiA9IHBhc3NKc29uLnByb3BlcnRpZXMgfHwge307XG4gICAgbGV0IHByb2dyYW0gPSBnZXRJbnZvbHZlZFByb2dyYW0ocGFzc0pzb24ucHJvZ3JhbSk7XG5cbiAgICAvLyBjaGVjayB3aGV0aGVyIHByb3BlcnRpZXMgYXJlIGRlZmluZWQgaW4gdGhlIHNoYWRlcnMgXG4gICAgZm9yIChsZXQgcHJvcCBpbiBwcm9wZXJ0aWVzSnNvbikge1xuICAgICAgICBsZXQgdW5pZm9ybUluZm8gPSBwcm9ncmFtLnVuaWZvcm1zLmZpbmQodSA9PiB1Lm5hbWUgPT09IHByb3ApO1xuICAgICAgICAvLyB0aGUgcHJvcGVydHkgaXMgbm90IGRlZmluZWQgaW4gYWxsIHRoZSBzaGFkZXJzIHVzZWQgaW4gdGVjaHNcbiAgICAgICAgaWYgKCF1bmlmb3JtSW5mbykge1xuICAgICAgICAgICAgY2Mud2FybklEKDkxMDcsIGVmZmVjdEFzc2V0Lm5hbWUsIHByb3ApO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBjcmVhdGUgcHJvcGVydGllc1xuICAgIGxldCBwcm9wZXJ0aWVzID0ge307XG4gICAgcHJvZ3JhbS51bmlmb3Jtcy5mb3JFYWNoKHUgPT4ge1xuICAgICAgICBsZXQgbmFtZSA9IHUubmFtZSxcbiAgICAgICAgICAgIHByb3AgPSBwcm9wZXJ0aWVzW25hbWVdID0gT2JqZWN0LmFzc2lnbih7fSwgdSksXG4gICAgICAgICAgICBwcm9wSW5mbyA9IHByb3BlcnRpZXNKc29uW25hbWVdO1xuXG4gICAgICAgIGxldCB2YWx1ZSA9IGVudW1zMmRlZmF1bHRbdS50eXBlXTtcbiAgICAgICAgaWYgKHByb3BJbmZvKSB7XG4gICAgICAgICAgICBpZiAocHJvcEluZm8udHlwZSA9PT0gZW51bXMuUEFSQU1fVEVYVFVSRV8yRCkge1xuICAgICAgICAgICAgICAgIHZhbHVlID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHByb3BJbmZvLnR5cGUgPT09IGVudW1zLlBBUkFNX0lOVCB8fCBwcm9wSW5mby50eXBlID09PSBlbnVtcy5QQVJBTV9GTE9BVCkge1xuICAgICAgICAgICAgICAgIHZhbHVlID0gQXJyYXkuaXNBcnJheShwcm9wSW5mby52YWx1ZSkgPyBwcm9wSW5mby52YWx1ZVswXSA6IHByb3BJbmZvLnZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBuZXcgRmxvYXQzMkFycmF5KHByb3BJbmZvLnZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHZhbHVlID0gZW51bXMyZGVmYXVsdFt1LnR5cGVdO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvcC52YWx1ZSA9IHZhbHVlO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHByb3BlcnRpZXM7XG59O1xuXG5mdW5jdGlvbiBwYXNzRGVmaW5lcyAocGFzcykge1xuICAgIGxldCBkZWZpbmVzID0ge307XG4gICAgbGV0IHByb2dyYW0gPSBnZXRJbnZvbHZlZFByb2dyYW0ocGFzcy5wcm9ncmFtKTtcbiAgICBwcm9ncmFtLmRlZmluZXMuZm9yRWFjaChkID0+IHtcbiAgICAgICAgZGVmaW5lc1tkLm5hbWVdID0gZW51bXMyZGVmYXVsdFtkLnR5cGVdO1xuICAgIH0pXG4gICAgcmV0dXJuIGRlZmluZXM7XG59XG5cbmZ1bmN0aW9uIHBhcnNlVGVjaG5pcXVlcyAoZWZmZWN0QXNzZXQpIHtcbiAgICBsZXQgdGVjaE51bSA9IGVmZmVjdEFzc2V0LnRlY2huaXF1ZXMubGVuZ3RoO1xuICAgIGxldCB0ZWNobmlxdWVzID0gbmV3IEFycmF5KHRlY2hOdW0pO1xuICAgIGZvciAobGV0IGogPSAwOyBqIDwgdGVjaE51bTsgKytqKSB7XG4gICAgICAgIGxldCB0ZWNoID0gZWZmZWN0QXNzZXQudGVjaG5pcXVlc1tqXTtcbiAgICAgICAgbGV0IHRlY2hOYW1lID0gdGVjaC5uYW1lIHx8IGo7XG5cbiAgICAgICAgbGV0IHBhc3NOdW0gPSB0ZWNoLnBhc3Nlcy5sZW5ndGg7XG4gICAgICAgIGxldCBwYXNzZXMgPSBuZXcgQXJyYXkocGFzc051bSk7XG4gICAgICAgIGZvciAobGV0IGsgPSAwOyBrIDwgcGFzc051bTsgKytrKSB7XG4gICAgICAgICAgICBsZXQgcGFzcyA9IHRlY2gucGFzc2VzW2tdO1xuXG4gICAgICAgICAgICBsZXQgcGFzc05hbWUgPSBwYXNzLm5hbWUgfHwgaztcbiAgICAgICAgICAgIGxldCBkZXRhaWxOYW1lID0gYCR7ZWZmZWN0QXNzZXQubmFtZX0tJHt0ZWNoTmFtZX0tJHtwYXNzTmFtZX1gO1xuICAgICAgICAgICAgbGV0IHN0YWdlID0gcGFzcy5zdGFnZSB8fCAnb3BhcXVlJztcbiAgICAgICAgICAgIGxldCBwcm9wZXJ0aWVzID0gcGFyc2VQcm9wZXJ0aWVzKGVmZmVjdEFzc2V0LCBwYXNzKTtcbiAgICAgICAgICAgIGxldCBkZWZpbmVzID0gcGFzc0RlZmluZXMocGFzcyk7XG5cbiAgICAgICAgICAgIGxldCBuZXdQYXNzID0gcGFzc2VzW2tdID0gbmV3IFBhc3MocGFzc05hbWUsIGRldGFpbE5hbWUsIHBhc3MucHJvZ3JhbSwgc3RhZ2UsIHByb3BlcnRpZXMsIGRlZmluZXMpO1xuXG4gICAgICAgICAgICAvLyByYXN0ZXJpemVyIHN0YXRlXG4gICAgICAgICAgICBpZiAocGFzcy5yYXN0ZXJpemVyU3RhdGUpIHtcbiAgICAgICAgICAgICAgICBuZXdQYXNzLnNldEN1bGxNb2RlKHBhc3MucmFzdGVyaXplclN0YXRlLmN1bGxNb2RlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gYmxlbmQgc3RhdGVcbiAgICAgICAgICAgIGxldCBibGVuZFN0YXRlID0gcGFzcy5ibGVuZFN0YXRlICYmIHBhc3MuYmxlbmRTdGF0ZS50YXJnZXRzWzBdO1xuICAgICAgICAgICAgaWYgKGJsZW5kU3RhdGUpIHtcbiAgICAgICAgICAgICAgICBuZXdQYXNzLnNldEJsZW5kKGJsZW5kU3RhdGUuYmxlbmQsIGJsZW5kU3RhdGUuYmxlbmRFcSwgYmxlbmRTdGF0ZS5ibGVuZFNyYyxcbiAgICAgICAgICAgICAgICAgICAgYmxlbmRTdGF0ZS5ibGVuZERzdCwgYmxlbmRTdGF0ZS5ibGVuZEFscGhhRXEsIGJsZW5kU3RhdGUuYmxlbmRTcmNBbHBoYSwgYmxlbmRTdGF0ZS5ibGVuZERzdEFscGhhLCBibGVuZFN0YXRlLmJsZW5kQ29sb3IpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBkZXB0aCBzdGVuY2lsIHN0YXRlXG4gICAgICAgICAgICBsZXQgZGVwdGhTdGVuY2lsU3RhdGUgPSBwYXNzLmRlcHRoU3RlbmNpbFN0YXRlO1xuICAgICAgICAgICAgaWYgKGRlcHRoU3RlbmNpbFN0YXRlKSB7XG4gICAgICAgICAgICAgICAgbmV3UGFzcy5zZXREZXB0aChkZXB0aFN0ZW5jaWxTdGF0ZS5kZXB0aFRlc3QsIGRlcHRoU3RlbmNpbFN0YXRlLmRlcHRoV3JpdGUsIGRlcHRoU3RlbmNpbFN0YXRlLmRlcHRoRnVuYyk7XG4gICAgICAgICAgICAgICAgbmV3UGFzcy5zZXRTdGVuY2lsRnJvbnQoZGVwdGhTdGVuY2lsU3RhdGUuc3RlbmNpbFRlc3QsIGRlcHRoU3RlbmNpbFN0YXRlLnN0ZW5jaWxGdW5jRnJvbnQsIGRlcHRoU3RlbmNpbFN0YXRlLnN0ZW5jaWxSZWZGcm9udCwgZGVwdGhTdGVuY2lsU3RhdGUuc3RlbmNpbE1hc2tGcm9udCxcbiAgICAgICAgICAgICAgICAgICAgZGVwdGhTdGVuY2lsU3RhdGUuc3RlbmNpbEZhaWxPcEZyb250LCBkZXB0aFN0ZW5jaWxTdGF0ZS5zdGVuY2lsWkZhaWxPcEZyb250LCBkZXB0aFN0ZW5jaWxTdGF0ZS5zdGVuY2lsWlBhc3NPcEZyb250LCBkZXB0aFN0ZW5jaWxTdGF0ZS5zdGVuY2lsV3JpdGVNYXNrRnJvbnQpO1xuICAgICAgICAgICAgICAgIG5ld1Bhc3Muc2V0U3RlbmNpbEJhY2soZGVwdGhTdGVuY2lsU3RhdGUuc3RlbmNpbFRlc3QsIGRlcHRoU3RlbmNpbFN0YXRlLnN0ZW5jaWxGdW5jQmFjaywgZGVwdGhTdGVuY2lsU3RhdGUuc3RlbmNpbFJlZkJhY2ssIGRlcHRoU3RlbmNpbFN0YXRlLnN0ZW5jaWxNYXNrQmFjayxcbiAgICAgICAgICAgICAgICAgICAgZGVwdGhTdGVuY2lsU3RhdGUuc3RlbmNpbEZhaWxPcEJhY2ssIGRlcHRoU3RlbmNpbFN0YXRlLnN0ZW5jaWxaRmFpbE9wQmFjaywgZGVwdGhTdGVuY2lsU3RhdGUuc3RlbmNpbFpQYXNzT3BCYWNrLCBkZXB0aFN0ZW5jaWxTdGF0ZS5zdGVuY2lsV3JpdGVNYXNrQmFjayk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGVjaG5pcXVlc1tqXSA9IG5ldyBUZWNobmlxdWUodGVjaE5hbWUsIHBhc3Nlcyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRlY2huaXF1ZXM7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VFZmZlY3QgKGVmZmVjdCkge1xuICAgIGxldCB0ZWNobmlxdWVzID0gcGFyc2VUZWNobmlxdWVzKGVmZmVjdCk7XG4gICAgcmV0dXJuIG5ldyBFZmZlY3QoZWZmZWN0Lm5hbWUsIHRlY2huaXF1ZXMsIDAsIGVmZmVjdCk7XG59O1xuXG5pZiAoQ0NfRURJVE9SKSB7XG4gICAgLy8gaW5zcGVjdG9yIG9ubHkgbmVlZCBwcm9wZXJ0aWVzIGRlZmluZWQgaW4gQ0NFZmZlY3RcbiAgICBFZmZlY3QucGFyc2VGb3JJbnNwZWN0b3IgPSBmdW5jdGlvbiAoZWZmZWN0QXNzZXQpIHtcbiAgICAgICAgcmV0dXJuIGVmZmVjdEFzc2V0LnRlY2huaXF1ZXMubWFwKCh0ZWNoLCB0ZWNoSWR4KSA9PiB7XG4gICAgICAgICAgICBsZXQgcGFzc2VzID0gdGVjaC5wYXNzZXMubWFwKChwYXNzLCBwYXNzSWR4KSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IHByb2dyYW0gPSBnZXRJbnZvbHZlZFByb2dyYW0ocGFzcy5wcm9ncmFtKTtcblxuICAgICAgICAgICAgICAgIGxldCBuZXdQcm9wcyA9IHt9O1xuICAgICAgICAgICAgICAgIGxldCBwcm9wcyA9IHBhc3MucHJvcGVydGllcztcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBuYW1lIGluIHByb3BzKSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld1Byb3BzW25hbWVdID0gZ2V0SW5zcGVjdG9yUHJvcHMocHJvcHNbbmFtZV0pO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgbGV0IHUgPSBwcm9ncmFtLnVuaWZvcm1zLmZpbmQodSA9PiB1Lm5hbWUgPT09IG5hbWUpO1xuICAgICAgICAgICAgICAgICAgICBuZXdQcm9wc1tuYW1lXS5kZWZpbmVzID0gdS5kZWZpbmVzIHx8IFtdO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxldCBuZXdEZWZpbmVzID0ge307XG4gICAgICAgICAgICAgICAgcHJvZ3JhbS5kZWZpbmVzLm1hcChkZWYgPT4ge1xuICAgICAgICAgICAgICAgICAgICBuZXdEZWZpbmVzW2RlZi5uYW1lXSA9IGdldEluc3BlY3RvclByb3BzKGRlZik7XG4gICAgICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IHBhc3MubmFtZSB8fCBwYXNzSWR4LFxuICAgICAgICAgICAgICAgICAgICBwcm9wczogbmV3UHJvcHMsXG4gICAgICAgICAgICAgICAgICAgIGRlZmluZXM6IG5ld0RlZmluZXMsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgbmFtZTogdGVjaC5uYW1lIHx8IHRlY2hJZHgsXG4gICAgICAgICAgICAgICAgcGFzc2VzOiBwYXNzZXMsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KVxuICAgIH07XG59XG4iXSwic291cmNlUm9vdCI6Ii8ifQ==