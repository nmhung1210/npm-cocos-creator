
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'engine-dev/extensions/dragonbones/DragonBonesAsset.js';
                    var __require = nodeEnv ? function (request) {
                        return require(request);
                    } : function (request) {
                        return __quick_compile_engine__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_engine__.registerModule(__filename, module);}"use strict";

/****************************************************************************
 Copyright (c) 2016 Chukong Technologies Inc.
 Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.

 https://www.cocos.com/

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated engine source code (the "Software"), a limited,
 worldwide, royalty-free, non-assignable, revocable and non-exclusive license
 to use Cocos Creator solely to develop games on your target platforms. You shall
 not use Cocos Creator software for developing other software or tools that's
 used for developing games. You are not granted to publish, distribute,
 sublicense, and/or sell copies of Cocos Creator.

 The software or tools in this License Agreement are licensed, not sold.
 Xiamen Yaji Software Co., Ltd. reserves all rights not expressly granted to you.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

/**
 * @module dragonBones
 */
var ArmatureCache = !CC_JSB && require('./ArmatureCache').sharedCache;
/**
 * !#en The skeleton data of dragonBones.
 * !#zh dragonBones 的 骨骼数据。
 * @class DragonBonesAsset
 * @extends Asset
 */


var DragonBonesAsset = cc.Class({
  name: 'dragonBones.DragonBonesAsset',
  "extends": cc.Asset,
  ctor: function ctor() {
    this.reset();
  },
  properties: {
    _dragonBonesJson: '',

    /**
     * !#en See http://developer.egret.com/cn/github/egret-docs/DB/dbLibs/dataFormat/index.html
     * !#zh 可查看 DragonBones 官方文档 http://developer.egret.com/cn/github/egret-docs/DB/dbLibs/dataFormat/index.html
     * @property {string} dragonBonesJson
     */
    dragonBonesJson: {
      get: function get() {
        return this._dragonBonesJson;
      },
      set: function set(value) {
        this._dragonBonesJson = value;
        this._dragonBonesJsonData = JSON.parse(value);
        this.reset();
      }
    },
    _nativeAsset: {
      get: function get() {
        return this._buffer;
      },
      set: function set(bin) {
        this._buffer = bin.buffer || bin;
        this.reset();
      },
      override: true
    }
  },
  statics: {
    preventDeferredLoadDependents: true
  },
  createNode: CC_EDITOR && function (callback) {
    var node = new cc.Node(this.name);
    var armatureDisplay = node.addComponent(dragonBones.ArmatureDisplay);
    armatureDisplay.dragonAsset = this;
    return callback(null, node);
  },
  reset: function reset() {
    this._clear();

    if (CC_EDITOR) {
      this._armaturesEnum = null;
    }
  },
  init: function init(factory, atlasUUID) {
    if (CC_EDITOR) {
      this._factory = factory || new dragonBones.CCFactory();
    } else {
      this._factory = factory;
    }

    if (!this._dragonBonesJsonData && this.dragonBonesJson) {
      this._dragonBonesJsonData = JSON.parse(this.dragonBonesJson);
    }

    var rawData = null;

    if (this._dragonBonesJsonData) {
      rawData = this._dragonBonesJsonData;
    } else {
      rawData = this._nativeAsset;
    } // If create by manual, uuid is empty.


    if (!this._uuid) {
      var dbData = this._factory.getDragonBonesDataByRawData(rawData);

      if (dbData) {
        this._uuid = dbData.name;
      } else {
        cc.warn('dragonbones name is empty');
      }
    }

    var armatureKey = this._uuid + "#" + atlasUUID;

    var dragonBonesData = this._factory.getDragonBonesData(armatureKey);

    if (dragonBonesData) return armatureKey;

    this._factory.parseDragonBonesData(rawData, armatureKey);

    return armatureKey;
  },
  // EDITOR
  getArmatureEnum: CC_EDITOR && function () {
    if (this._armaturesEnum) {
      return this._armaturesEnum;
    }

    this.init();

    var dragonBonesData = this._factory.getDragonBonesDataByUUID(this._uuid);

    if (dragonBonesData) {
      var armatureNames = dragonBonesData.armatureNames;
      var enumDef = {};

      for (var i = 0; i < armatureNames.length; i++) {
        var name = armatureNames[i];
        enumDef[name] = i;
      }

      return this._armaturesEnum = cc.Enum(enumDef);
    }

    return null;
  },
  getAnimsEnum: CC_EDITOR && function (armatureName) {
    this.init();

    var dragonBonesData = this._factory.getDragonBonesDataByUUID(this._uuid);

    if (dragonBonesData) {
      var armature = dragonBonesData.getArmature(armatureName);

      if (!armature) {
        return null;
      }

      var enumDef = {
        '<None>': 0
      };
      var anims = armature.animations;
      var i = 0;

      for (var animName in anims) {
        if (anims.hasOwnProperty(animName)) {
          enumDef[animName] = i + 1;
          i++;
        }
      }

      return cc.Enum(enumDef);
    }

    return null;
  },
  _clear: function _clear() {
    if (this._factory) {
      ArmatureCache.resetArmature(this._uuid);

      this._factory.removeDragonBonesDataByUUID(this._uuid, true);
    }
  },
  destroy: function destroy() {
    this._clear();

    this._super();
  }
});
dragonBones.DragonBonesAsset = module.exports = DragonBonesAsset;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVuZ2luZS1kZXYvZXh0ZW5zaW9ucy9kcmFnb25ib25lcy9EcmFnb25Cb25lc0Fzc2V0LmpzIl0sIm5hbWVzIjpbIkFybWF0dXJlQ2FjaGUiLCJDQ19KU0IiLCJyZXF1aXJlIiwic2hhcmVkQ2FjaGUiLCJEcmFnb25Cb25lc0Fzc2V0IiwiY2MiLCJDbGFzcyIsIm5hbWUiLCJBc3NldCIsImN0b3IiLCJyZXNldCIsInByb3BlcnRpZXMiLCJfZHJhZ29uQm9uZXNKc29uIiwiZHJhZ29uQm9uZXNKc29uIiwiZ2V0Iiwic2V0IiwidmFsdWUiLCJfZHJhZ29uQm9uZXNKc29uRGF0YSIsIkpTT04iLCJwYXJzZSIsIl9uYXRpdmVBc3NldCIsIl9idWZmZXIiLCJiaW4iLCJidWZmZXIiLCJvdmVycmlkZSIsInN0YXRpY3MiLCJwcmV2ZW50RGVmZXJyZWRMb2FkRGVwZW5kZW50cyIsImNyZWF0ZU5vZGUiLCJDQ19FRElUT1IiLCJjYWxsYmFjayIsIm5vZGUiLCJOb2RlIiwiYXJtYXR1cmVEaXNwbGF5IiwiYWRkQ29tcG9uZW50IiwiZHJhZ29uQm9uZXMiLCJBcm1hdHVyZURpc3BsYXkiLCJkcmFnb25Bc3NldCIsIl9jbGVhciIsIl9hcm1hdHVyZXNFbnVtIiwiaW5pdCIsImZhY3RvcnkiLCJhdGxhc1VVSUQiLCJfZmFjdG9yeSIsIkNDRmFjdG9yeSIsInJhd0RhdGEiLCJfdXVpZCIsImRiRGF0YSIsImdldERyYWdvbkJvbmVzRGF0YUJ5UmF3RGF0YSIsIndhcm4iLCJhcm1hdHVyZUtleSIsImRyYWdvbkJvbmVzRGF0YSIsImdldERyYWdvbkJvbmVzRGF0YSIsInBhcnNlRHJhZ29uQm9uZXNEYXRhIiwiZ2V0QXJtYXR1cmVFbnVtIiwiZ2V0RHJhZ29uQm9uZXNEYXRhQnlVVUlEIiwiYXJtYXR1cmVOYW1lcyIsImVudW1EZWYiLCJpIiwibGVuZ3RoIiwiRW51bSIsImdldEFuaW1zRW51bSIsImFybWF0dXJlTmFtZSIsImFybWF0dXJlIiwiZ2V0QXJtYXR1cmUiLCJhbmltcyIsImFuaW1hdGlvbnMiLCJhbmltTmFtZSIsImhhc093blByb3BlcnR5IiwicmVzZXRBcm1hdHVyZSIsInJlbW92ZURyYWdvbkJvbmVzRGF0YUJ5VVVJRCIsImRlc3Ryb3kiLCJfc3VwZXIiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBMEJBOzs7QUFHQSxJQUFJQSxhQUFhLEdBQUcsQ0FBQ0MsTUFBRCxJQUFXQyxPQUFPLENBQUMsaUJBQUQsQ0FBUCxDQUEyQkMsV0FBMUQ7QUFFQTs7Ozs7Ozs7QUFNQSxJQUFJQyxnQkFBZ0IsR0FBR0MsRUFBRSxDQUFDQyxLQUFILENBQVM7QUFDNUJDLEVBQUFBLElBQUksRUFBRSw4QkFEc0I7QUFFNUIsYUFBU0YsRUFBRSxDQUFDRyxLQUZnQjtBQUk1QkMsRUFBQUEsSUFKNEIsa0JBSXBCO0FBQ0osU0FBS0MsS0FBTDtBQUNILEdBTjJCO0FBUTVCQyxFQUFBQSxVQUFVLEVBQUU7QUFDUkMsSUFBQUEsZ0JBQWdCLEVBQUcsRUFEWDs7QUFHUjs7Ozs7QUFLQUMsSUFBQUEsZUFBZSxFQUFHO0FBQ2RDLE1BQUFBLEdBQUcsRUFBRSxlQUFZO0FBQ2IsZUFBTyxLQUFLRixnQkFBWjtBQUNILE9BSGE7QUFJZEcsTUFBQUEsR0FBRyxFQUFFLGFBQVVDLEtBQVYsRUFBaUI7QUFDbEIsYUFBS0osZ0JBQUwsR0FBd0JJLEtBQXhCO0FBQ0EsYUFBS0Msb0JBQUwsR0FBNEJDLElBQUksQ0FBQ0MsS0FBTCxDQUFXSCxLQUFYLENBQTVCO0FBQ0EsYUFBS04sS0FBTDtBQUNIO0FBUmEsS0FSVjtBQW1CUlUsSUFBQUEsWUFBWSxFQUFFO0FBQ1ZOLE1BQUFBLEdBRFUsaUJBQ0g7QUFDSCxlQUFPLEtBQUtPLE9BQVo7QUFDSCxPQUhTO0FBSVZOLE1BQUFBLEdBSlUsZUFJTE8sR0FKSyxFQUlBO0FBQ04sYUFBS0QsT0FBTCxHQUFlQyxHQUFHLENBQUNDLE1BQUosSUFBY0QsR0FBN0I7QUFDQSxhQUFLWixLQUFMO0FBQ0gsT0FQUztBQVFWYyxNQUFBQSxRQUFRLEVBQUU7QUFSQTtBQW5CTixHQVJnQjtBQXVDNUJDLEVBQUFBLE9BQU8sRUFBRTtBQUNMQyxJQUFBQSw2QkFBNkIsRUFBRTtBQUQxQixHQXZDbUI7QUEyQzVCQyxFQUFBQSxVQUFVLEVBQUVDLFNBQVMsSUFBSyxVQUFVQyxRQUFWLEVBQW9CO0FBQzFDLFFBQUlDLElBQUksR0FBRyxJQUFJekIsRUFBRSxDQUFDMEIsSUFBUCxDQUFZLEtBQUt4QixJQUFqQixDQUFYO0FBQ0EsUUFBSXlCLGVBQWUsR0FBR0YsSUFBSSxDQUFDRyxZQUFMLENBQWtCQyxXQUFXLENBQUNDLGVBQTlCLENBQXRCO0FBQ0FILElBQUFBLGVBQWUsQ0FBQ0ksV0FBaEIsR0FBOEIsSUFBOUI7QUFFQSxXQUFPUCxRQUFRLENBQUMsSUFBRCxFQUFPQyxJQUFQLENBQWY7QUFDSCxHQWpEMkI7QUFtRDVCcEIsRUFBQUEsS0FuRDRCLG1CQW1EbkI7QUFDTCxTQUFLMkIsTUFBTDs7QUFDQSxRQUFJVCxTQUFKLEVBQWU7QUFDWCxXQUFLVSxjQUFMLEdBQXNCLElBQXRCO0FBQ0g7QUFDSixHQXhEMkI7QUEwRDVCQyxFQUFBQSxJQTFENEIsZ0JBMER0QkMsT0ExRHNCLEVBMERiQyxTQTFEYSxFQTBERjtBQUN0QixRQUFJYixTQUFKLEVBQWU7QUFDWCxXQUFLYyxRQUFMLEdBQWdCRixPQUFPLElBQUksSUFBSU4sV0FBVyxDQUFDUyxTQUFoQixFQUEzQjtBQUNILEtBRkQsTUFFTztBQUNILFdBQUtELFFBQUwsR0FBZ0JGLE9BQWhCO0FBQ0g7O0FBRUQsUUFBSSxDQUFDLEtBQUt2QixvQkFBTixJQUE4QixLQUFLSixlQUF2QyxFQUF3RDtBQUNwRCxXQUFLSSxvQkFBTCxHQUE0QkMsSUFBSSxDQUFDQyxLQUFMLENBQVcsS0FBS04sZUFBaEIsQ0FBNUI7QUFDSDs7QUFFRCxRQUFJK0IsT0FBTyxHQUFHLElBQWQ7O0FBQ0EsUUFBSSxLQUFLM0Isb0JBQVQsRUFBK0I7QUFDM0IyQixNQUFBQSxPQUFPLEdBQUcsS0FBSzNCLG9CQUFmO0FBQ0gsS0FGRCxNQUVPO0FBQ0gyQixNQUFBQSxPQUFPLEdBQUcsS0FBS3hCLFlBQWY7QUFDSCxLQWhCcUIsQ0FrQnRCOzs7QUFDQSxRQUFJLENBQUMsS0FBS3lCLEtBQVYsRUFBaUI7QUFDYixVQUFJQyxNQUFNLEdBQUcsS0FBS0osUUFBTCxDQUFjSywyQkFBZCxDQUEwQ0gsT0FBMUMsQ0FBYjs7QUFDQSxVQUFJRSxNQUFKLEVBQVk7QUFDUixhQUFLRCxLQUFMLEdBQWFDLE1BQU0sQ0FBQ3ZDLElBQXBCO0FBQ0gsT0FGRCxNQUVPO0FBQ0hGLFFBQUFBLEVBQUUsQ0FBQzJDLElBQUgsQ0FBUSwyQkFBUjtBQUNIO0FBQ0o7O0FBRUQsUUFBSUMsV0FBVyxHQUFHLEtBQUtKLEtBQUwsR0FBYSxHQUFiLEdBQW1CSixTQUFyQzs7QUFDQSxRQUFJUyxlQUFlLEdBQUcsS0FBS1IsUUFBTCxDQUFjUyxrQkFBZCxDQUFpQ0YsV0FBakMsQ0FBdEI7O0FBQ0EsUUFBSUMsZUFBSixFQUFxQixPQUFPRCxXQUFQOztBQUVyQixTQUFLUCxRQUFMLENBQWNVLG9CQUFkLENBQW1DUixPQUFuQyxFQUE0Q0ssV0FBNUM7O0FBQ0EsV0FBT0EsV0FBUDtBQUNILEdBNUYyQjtBQThGNUI7QUFFQUksRUFBQUEsZUFBZSxFQUFFekIsU0FBUyxJQUFJLFlBQVk7QUFDdEMsUUFBSSxLQUFLVSxjQUFULEVBQXlCO0FBQ3JCLGFBQU8sS0FBS0EsY0FBWjtBQUNIOztBQUNELFNBQUtDLElBQUw7O0FBQ0EsUUFBSVcsZUFBZSxHQUFHLEtBQUtSLFFBQUwsQ0FBY1ksd0JBQWQsQ0FBdUMsS0FBS1QsS0FBNUMsQ0FBdEI7O0FBQ0EsUUFBSUssZUFBSixFQUFxQjtBQUNqQixVQUFJSyxhQUFhLEdBQUdMLGVBQWUsQ0FBQ0ssYUFBcEM7QUFDQSxVQUFJQyxPQUFPLEdBQUcsRUFBZDs7QUFDQSxXQUFLLElBQUlDLENBQUMsR0FBRyxDQUFiLEVBQWdCQSxDQUFDLEdBQUdGLGFBQWEsQ0FBQ0csTUFBbEMsRUFBMENELENBQUMsRUFBM0MsRUFBK0M7QUFDM0MsWUFBSWxELElBQUksR0FBR2dELGFBQWEsQ0FBQ0UsQ0FBRCxDQUF4QjtBQUNBRCxRQUFBQSxPQUFPLENBQUNqRCxJQUFELENBQVAsR0FBZ0JrRCxDQUFoQjtBQUNIOztBQUNELGFBQU8sS0FBS25CLGNBQUwsR0FBc0JqQyxFQUFFLENBQUNzRCxJQUFILENBQVFILE9BQVIsQ0FBN0I7QUFDSDs7QUFDRCxXQUFPLElBQVA7QUFDSCxHQWhIMkI7QUFrSDVCSSxFQUFBQSxZQUFZLEVBQUVoQyxTQUFTLElBQUksVUFBVWlDLFlBQVYsRUFBd0I7QUFDL0MsU0FBS3RCLElBQUw7O0FBRUEsUUFBSVcsZUFBZSxHQUFHLEtBQUtSLFFBQUwsQ0FBY1ksd0JBQWQsQ0FBdUMsS0FBS1QsS0FBNUMsQ0FBdEI7O0FBQ0EsUUFBSUssZUFBSixFQUFxQjtBQUNqQixVQUFJWSxRQUFRLEdBQUdaLGVBQWUsQ0FBQ2EsV0FBaEIsQ0FBNEJGLFlBQTVCLENBQWY7O0FBQ0EsVUFBSSxDQUFDQyxRQUFMLEVBQWU7QUFDWCxlQUFPLElBQVA7QUFDSDs7QUFFRCxVQUFJTixPQUFPLEdBQUc7QUFBRSxrQkFBVTtBQUFaLE9BQWQ7QUFDQSxVQUFJUSxLQUFLLEdBQUdGLFFBQVEsQ0FBQ0csVUFBckI7QUFDQSxVQUFJUixDQUFDLEdBQUcsQ0FBUjs7QUFDQSxXQUFLLElBQUlTLFFBQVQsSUFBcUJGLEtBQXJCLEVBQTRCO0FBQ3hCLFlBQUlBLEtBQUssQ0FBQ0csY0FBTixDQUFxQkQsUUFBckIsQ0FBSixFQUFvQztBQUNoQ1YsVUFBQUEsT0FBTyxDQUFDVSxRQUFELENBQVAsR0FBb0JULENBQUMsR0FBRyxDQUF4QjtBQUNBQSxVQUFBQSxDQUFDO0FBQ0o7QUFDSjs7QUFDRCxhQUFPcEQsRUFBRSxDQUFDc0QsSUFBSCxDQUFRSCxPQUFSLENBQVA7QUFDSDs7QUFDRCxXQUFPLElBQVA7QUFDSCxHQXhJMkI7QUEwSTVCbkIsRUFBQUEsTUExSTRCLG9CQTBJbEI7QUFDTixRQUFJLEtBQUtLLFFBQVQsRUFBbUI7QUFDZjFDLE1BQUFBLGFBQWEsQ0FBQ29FLGFBQWQsQ0FBNEIsS0FBS3ZCLEtBQWpDOztBQUNBLFdBQUtILFFBQUwsQ0FBYzJCLDJCQUFkLENBQTBDLEtBQUt4QixLQUEvQyxFQUFzRCxJQUF0RDtBQUNIO0FBQ0osR0EvSTJCO0FBaUo1QnlCLEVBQUFBLE9Bako0QixxQkFpSmpCO0FBQ1AsU0FBS2pDLE1BQUw7O0FBQ0EsU0FBS2tDLE1BQUw7QUFDSDtBQXBKMkIsQ0FBVCxDQUF2QjtBQXVKQXJDLFdBQVcsQ0FBQzlCLGdCQUFaLEdBQStCb0UsTUFBTSxDQUFDQyxPQUFQLEdBQWlCckUsZ0JBQWhEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiBDb3B5cmlnaHQgKGMpIDIwMTYgQ2h1a29uZyBUZWNobm9sb2dpZXMgSW5jLlxuIENvcHlyaWdodCAoYykgMjAxNy0yMDE4IFhpYW1lbiBZYWppIFNvZnR3YXJlIENvLiwgTHRkLlxuXG4gaHR0cHM6Ly93d3cuY29jb3MuY29tL1xuXG4gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZW5naW5lIHNvdXJjZSBjb2RlICh0aGUgXCJTb2Z0d2FyZVwiKSwgYSBsaW1pdGVkLFxuIHdvcmxkd2lkZSwgcm95YWx0eS1mcmVlLCBub24tYXNzaWduYWJsZSwgcmV2b2NhYmxlIGFuZCBub24tZXhjbHVzaXZlIGxpY2Vuc2VcbiB0byB1c2UgQ29jb3MgQ3JlYXRvciBzb2xlbHkgdG8gZGV2ZWxvcCBnYW1lcyBvbiB5b3VyIHRhcmdldCBwbGF0Zm9ybXMuIFlvdSBzaGFsbFxuIG5vdCB1c2UgQ29jb3MgQ3JlYXRvciBzb2Z0d2FyZSBmb3IgZGV2ZWxvcGluZyBvdGhlciBzb2Z0d2FyZSBvciB0b29scyB0aGF0J3NcbiB1c2VkIGZvciBkZXZlbG9waW5nIGdhbWVzLiBZb3UgYXJlIG5vdCBncmFudGVkIHRvIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsXG4gc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIENvY29zIENyZWF0b3IuXG5cbiBUaGUgc29mdHdhcmUgb3IgdG9vbHMgaW4gdGhpcyBMaWNlbnNlIEFncmVlbWVudCBhcmUgbGljZW5zZWQsIG5vdCBzb2xkLlxuIFhpYW1lbiBZYWppIFNvZnR3YXJlIENvLiwgTHRkLiByZXNlcnZlcyBhbGwgcmlnaHRzIG5vdCBleHByZXNzbHkgZ3JhbnRlZCB0byB5b3UuXG5cbiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuIFRIRSBTT0ZUV0FSRS5cbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4vKipcbiAqIEBtb2R1bGUgZHJhZ29uQm9uZXNcbiAqL1xubGV0IEFybWF0dXJlQ2FjaGUgPSAhQ0NfSlNCICYmIHJlcXVpcmUoJy4vQXJtYXR1cmVDYWNoZScpLnNoYXJlZENhY2hlO1xuXG4vKipcbiAqICEjZW4gVGhlIHNrZWxldG9uIGRhdGEgb2YgZHJhZ29uQm9uZXMuXG4gKiAhI3poIGRyYWdvbkJvbmVzIOeahCDpqqjpqrzmlbDmja7jgIJcbiAqIEBjbGFzcyBEcmFnb25Cb25lc0Fzc2V0XG4gKiBAZXh0ZW5kcyBBc3NldFxuICovXG52YXIgRHJhZ29uQm9uZXNBc3NldCA9IGNjLkNsYXNzKHtcbiAgICBuYW1lOiAnZHJhZ29uQm9uZXMuRHJhZ29uQm9uZXNBc3NldCcsXG4gICAgZXh0ZW5kczogY2MuQXNzZXQsXG5cbiAgICBjdG9yICgpIHtcbiAgICAgICAgdGhpcy5yZXNldCgpO1xuICAgIH0sXG5cbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIF9kcmFnb25Cb25lc0pzb24gOiAnJyxcblxuICAgICAgICAvKipcbiAgICAgICAgICogISNlbiBTZWUgaHR0cDovL2RldmVsb3Blci5lZ3JldC5jb20vY24vZ2l0aHViL2VncmV0LWRvY3MvREIvZGJMaWJzL2RhdGFGb3JtYXQvaW5kZXguaHRtbFxuICAgICAgICAgKiAhI3poIOWPr+afpeeciyBEcmFnb25Cb25lcyDlrpjmlrnmlofmoaMgaHR0cDovL2RldmVsb3Blci5lZ3JldC5jb20vY24vZ2l0aHViL2VncmV0LWRvY3MvREIvZGJMaWJzL2RhdGFGb3JtYXQvaW5kZXguaHRtbFxuICAgICAgICAgKiBAcHJvcGVydHkge3N0cmluZ30gZHJhZ29uQm9uZXNKc29uXG4gICAgICAgICAqL1xuICAgICAgICBkcmFnb25Cb25lc0pzb24gOiB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fZHJhZ29uQm9uZXNKc29uO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZHJhZ29uQm9uZXNKc29uID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgdGhpcy5fZHJhZ29uQm9uZXNKc29uRGF0YSA9IEpTT04ucGFyc2UodmFsdWUpO1xuICAgICAgICAgICAgICAgIHRoaXMucmVzZXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBfbmF0aXZlQXNzZXQ6IHtcbiAgICAgICAgICAgIGdldCAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2J1ZmZlcjtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXQgKGJpbikge1xuICAgICAgICAgICAgICAgIHRoaXMuX2J1ZmZlciA9IGJpbi5idWZmZXIgfHwgYmluO1xuICAgICAgICAgICAgICAgIHRoaXMucmVzZXQoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvdmVycmlkZTogdHJ1ZVxuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICBzdGF0aWNzOiB7XG4gICAgICAgIHByZXZlbnREZWZlcnJlZExvYWREZXBlbmRlbnRzOiB0cnVlXG4gICAgfSxcblxuICAgIGNyZWF0ZU5vZGU6IENDX0VESVRPUiAmJiAgZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBub2RlID0gbmV3IGNjLk5vZGUodGhpcy5uYW1lKTtcbiAgICAgICAgdmFyIGFybWF0dXJlRGlzcGxheSA9IG5vZGUuYWRkQ29tcG9uZW50KGRyYWdvbkJvbmVzLkFybWF0dXJlRGlzcGxheSk7XG4gICAgICAgIGFybWF0dXJlRGlzcGxheS5kcmFnb25Bc3NldCA9IHRoaXM7XG5cbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKG51bGwsIG5vZGUpO1xuICAgIH0sXG5cbiAgICByZXNldCAoKSB7XG4gICAgICAgIHRoaXMuX2NsZWFyKCk7XG4gICAgICAgIGlmIChDQ19FRElUT1IpIHtcbiAgICAgICAgICAgIHRoaXMuX2FybWF0dXJlc0VudW0gPSBudWxsO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGluaXQgKGZhY3RvcnksIGF0bGFzVVVJRCkge1xuICAgICAgICBpZiAoQ0NfRURJVE9SKSB7XG4gICAgICAgICAgICB0aGlzLl9mYWN0b3J5ID0gZmFjdG9yeSB8fCBuZXcgZHJhZ29uQm9uZXMuQ0NGYWN0b3J5KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9mYWN0b3J5ID0gZmFjdG9yeTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5fZHJhZ29uQm9uZXNKc29uRGF0YSAmJiB0aGlzLmRyYWdvbkJvbmVzSnNvbikge1xuICAgICAgICAgICAgdGhpcy5fZHJhZ29uQm9uZXNKc29uRGF0YSA9IEpTT04ucGFyc2UodGhpcy5kcmFnb25Cb25lc0pzb24pO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHJhd0RhdGEgPSBudWxsO1xuICAgICAgICBpZiAodGhpcy5fZHJhZ29uQm9uZXNKc29uRGF0YSkge1xuICAgICAgICAgICAgcmF3RGF0YSA9IHRoaXMuX2RyYWdvbkJvbmVzSnNvbkRhdGE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByYXdEYXRhID0gdGhpcy5fbmF0aXZlQXNzZXQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiBjcmVhdGUgYnkgbWFudWFsLCB1dWlkIGlzIGVtcHR5LlxuICAgICAgICBpZiAoIXRoaXMuX3V1aWQpIHtcbiAgICAgICAgICAgIGxldCBkYkRhdGEgPSB0aGlzLl9mYWN0b3J5LmdldERyYWdvbkJvbmVzRGF0YUJ5UmF3RGF0YShyYXdEYXRhKTtcbiAgICAgICAgICAgIGlmIChkYkRhdGEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl91dWlkID0gZGJEYXRhLm5hbWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNjLndhcm4oJ2RyYWdvbmJvbmVzIG5hbWUgaXMgZW1wdHknKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBhcm1hdHVyZUtleSA9IHRoaXMuX3V1aWQgKyBcIiNcIiArIGF0bGFzVVVJRDtcbiAgICAgICAgbGV0IGRyYWdvbkJvbmVzRGF0YSA9IHRoaXMuX2ZhY3RvcnkuZ2V0RHJhZ29uQm9uZXNEYXRhKGFybWF0dXJlS2V5KTtcbiAgICAgICAgaWYgKGRyYWdvbkJvbmVzRGF0YSkgcmV0dXJuIGFybWF0dXJlS2V5O1xuXG4gICAgICAgIHRoaXMuX2ZhY3RvcnkucGFyc2VEcmFnb25Cb25lc0RhdGEocmF3RGF0YSwgYXJtYXR1cmVLZXkpO1xuICAgICAgICByZXR1cm4gYXJtYXR1cmVLZXk7XG4gICAgfSxcblxuICAgIC8vIEVESVRPUlxuXG4gICAgZ2V0QXJtYXR1cmVFbnVtOiBDQ19FRElUT1IgJiYgZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5fYXJtYXR1cmVzRW51bSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2FybWF0dXJlc0VudW07XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pbml0KCk7XG4gICAgICAgIGxldCBkcmFnb25Cb25lc0RhdGEgPSB0aGlzLl9mYWN0b3J5LmdldERyYWdvbkJvbmVzRGF0YUJ5VVVJRCh0aGlzLl91dWlkKTtcbiAgICAgICAgaWYgKGRyYWdvbkJvbmVzRGF0YSkge1xuICAgICAgICAgICAgdmFyIGFybWF0dXJlTmFtZXMgPSBkcmFnb25Cb25lc0RhdGEuYXJtYXR1cmVOYW1lcztcbiAgICAgICAgICAgIHZhciBlbnVtRGVmID0ge307XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFybWF0dXJlTmFtZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgbmFtZSA9IGFybWF0dXJlTmFtZXNbaV07XG4gICAgICAgICAgICAgICAgZW51bURlZltuYW1lXSA9IGk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fYXJtYXR1cmVzRW51bSA9IGNjLkVudW0oZW51bURlZik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSxcblxuICAgIGdldEFuaW1zRW51bTogQ0NfRURJVE9SICYmIGZ1bmN0aW9uIChhcm1hdHVyZU5hbWUpIHtcbiAgICAgICAgdGhpcy5pbml0KCk7XG5cbiAgICAgICAgbGV0IGRyYWdvbkJvbmVzRGF0YSA9IHRoaXMuX2ZhY3RvcnkuZ2V0RHJhZ29uQm9uZXNEYXRhQnlVVUlEKHRoaXMuX3V1aWQpO1xuICAgICAgICBpZiAoZHJhZ29uQm9uZXNEYXRhKSB7XG4gICAgICAgICAgICB2YXIgYXJtYXR1cmUgPSBkcmFnb25Cb25lc0RhdGEuZ2V0QXJtYXR1cmUoYXJtYXR1cmVOYW1lKTtcbiAgICAgICAgICAgIGlmICghYXJtYXR1cmUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGVudW1EZWYgPSB7ICc8Tm9uZT4nOiAwIH07XG4gICAgICAgICAgICB2YXIgYW5pbXMgPSBhcm1hdHVyZS5hbmltYXRpb25zO1xuICAgICAgICAgICAgdmFyIGkgPSAwO1xuICAgICAgICAgICAgZm9yICh2YXIgYW5pbU5hbWUgaW4gYW5pbXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoYW5pbXMuaGFzT3duUHJvcGVydHkoYW5pbU5hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGVudW1EZWZbYW5pbU5hbWVdID0gaSArIDE7XG4gICAgICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gY2MuRW51bShlbnVtRGVmKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9LFxuXG4gICAgX2NsZWFyICgpIHtcbiAgICAgICAgaWYgKHRoaXMuX2ZhY3RvcnkpIHtcbiAgICAgICAgICAgIEFybWF0dXJlQ2FjaGUucmVzZXRBcm1hdHVyZSh0aGlzLl91dWlkKTtcbiAgICAgICAgICAgIHRoaXMuX2ZhY3RvcnkucmVtb3ZlRHJhZ29uQm9uZXNEYXRhQnlVVUlEKHRoaXMuX3V1aWQsIHRydWUpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGRlc3Ryb3kgKCkge1xuICAgICAgICB0aGlzLl9jbGVhcigpO1xuICAgICAgICB0aGlzLl9zdXBlcigpO1xuICAgIH0sXG59KTtcblxuZHJhZ29uQm9uZXMuRHJhZ29uQm9uZXNBc3NldCA9IG1vZHVsZS5leHBvcnRzID0gRHJhZ29uQm9uZXNBc3NldDtcbiJdLCJzb3VyY2VSb290IjoiLyJ9