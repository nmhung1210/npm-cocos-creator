
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'engine-dev/extensions/dragonbones/CCFactory.js';
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

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/
var BaseObject = dragonBones.BaseObject,
    BaseFactory = dragonBones.BaseFactory;
/**
 * @module dragonBones
*/

/**
 * DragonBones factory
 * @class CCFactory
 * @extends BaseFactory
*/

var CCFactory = dragonBones.CCFactory = cc.Class({
  name: 'dragonBones.CCFactory',
  "extends": BaseFactory,

  /**
   * @method getInstance
   * @return {CCFactory}
   * @static
   * @example
   * let factory = dragonBones.CCFactory.getInstance();
  */
  statics: {
    _factory: null,
    getInstance: function getInstance() {
      if (!CCFactory._factory) {
        CCFactory._factory = new CCFactory();
      }

      return CCFactory._factory;
    }
  },
  ctor: function ctor() {
    var eventManager = new dragonBones.CCArmatureDisplay();
    this._dragonBones = new dragonBones.DragonBones(eventManager);

    if (!CC_NATIVERENDERER && !CC_EDITOR && cc.director._scheduler) {
      cc.game.on(cc.game.EVENT_RESTART, this.initUpdate, this);
      this.initUpdate();
    }
  },
  initUpdate: function initUpdate(dt) {
    cc.director._scheduler.enableForTarget(this);

    cc.director._scheduler.scheduleUpdate(this, cc.Scheduler.PRIORITY_SYSTEM, false);
  },
  update: function update(dt) {
    this._dragonBones.advanceTime(dt);
  },
  getDragonBonesDataByRawData: function getDragonBonesDataByRawData(rawData) {
    var dataParser = rawData instanceof ArrayBuffer ? BaseFactory._binaryParser : this._dataParser;
    return dataParser.parseDragonBonesData(rawData, 1.0);
  },
  // Build new aramture with a new display.
  buildArmatureDisplay: function buildArmatureDisplay(armatureName, dragonBonesName, skinName, textureAtlasName) {
    var armature = this.buildArmature(armatureName, dragonBonesName, skinName, textureAtlasName);
    return armature && armature._display;
  },
  // Build sub armature from an exist armature component.
  // It will share dragonAsset and dragonAtlasAsset.
  // But node can not share,or will cause render error.
  createArmatureNode: function createArmatureNode(comp, armatureName, node) {
    node = node || new cc.Node();
    var display = node.getComponent(dragonBones.ArmatureDisplay);

    if (!display) {
      display = node.addComponent(dragonBones.ArmatureDisplay);
    }

    node.name = armatureName;
    display._armatureName = armatureName;
    display._N$dragonAsset = comp.dragonAsset;
    display._N$dragonAtlasAsset = comp.dragonAtlasAsset;

    display._init();

    return display;
  },
  _buildTextureAtlasData: function _buildTextureAtlasData(textureAtlasData, textureAtlas) {
    if (textureAtlasData) {
      textureAtlasData.renderTexture = textureAtlas;
    } else {
      textureAtlasData = BaseObject.borrowObject(dragonBones.CCTextureAtlasData);
    }

    return textureAtlasData;
  },
  _sortSlots: function _sortSlots() {
    var slots = this._slots;
    var sortedSlots = [];

    for (var i = 0, l = slots.length; i < l; i++) {
      var slot = slots[i];
      var zOrder = slot._zOrder;
      var inserted = false;

      for (var j = sortedSlots.length - 1; j >= 0; j--) {
        if (zOrder >= sortedSlots[j]._zOrder) {
          sortedSlots.splice(j + 1, 0, slot);
          inserted = true;
          break;
        }
      }

      if (!inserted) {
        sortedSlots.splice(0, 0, slot);
      }
    }

    this._slots = sortedSlots;
  },
  _buildArmature: function _buildArmature(dataPackage) {
    var armature = BaseObject.borrowObject(dragonBones.Armature);
    armature._skinData = dataPackage.skin;
    armature._animation = BaseObject.borrowObject(dragonBones.Animation);
    armature._animation._armature = armature;
    armature._animation.animations = dataPackage.armature.animations;
    armature._isChildArmature = false; // fixed dragonbones sort issue
    // armature._sortSlots = this._sortSlots;

    var display = new dragonBones.CCArmatureDisplay();
    armature.init(dataPackage.armature, display, display, this._dragonBones);
    return armature;
  },
  _buildSlot: function _buildSlot(dataPackage, slotData, displays) {
    var slot = BaseObject.borrowObject(dragonBones.CCSlot);
    var display = slot;
    slot.init(slotData, displays, display, display);
    return slot;
  },
  getDragonBonesDataByUUID: function getDragonBonesDataByUUID(uuid) {
    for (var name in this._dragonBonesDataMap) {
      if (name.indexOf(uuid) != -1) {
        return this._dragonBonesDataMap[name];
      }
    }

    return null;
  },
  removeDragonBonesDataByUUID: function removeDragonBonesDataByUUID(uuid, disposeData) {
    if (disposeData === void 0) {
      disposeData = true;
    }

    for (var name in this._dragonBonesDataMap) {
      if (name.indexOf(uuid) === -1) continue;

      if (disposeData) {
        this._dragonBones.bufferObject(this._dragonBonesDataMap[name]);
      }

      delete this._dragonBonesDataMap[name];
    }
  }
});
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVuZ2luZS1kZXYvZXh0ZW5zaW9ucy9kcmFnb25ib25lcy9DQ0ZhY3RvcnkuanMiXSwibmFtZXMiOlsiQmFzZU9iamVjdCIsImRyYWdvbkJvbmVzIiwiQmFzZUZhY3RvcnkiLCJDQ0ZhY3RvcnkiLCJjYyIsIkNsYXNzIiwibmFtZSIsInN0YXRpY3MiLCJfZmFjdG9yeSIsImdldEluc3RhbmNlIiwiY3RvciIsImV2ZW50TWFuYWdlciIsIkNDQXJtYXR1cmVEaXNwbGF5IiwiX2RyYWdvbkJvbmVzIiwiRHJhZ29uQm9uZXMiLCJDQ19OQVRJVkVSRU5ERVJFUiIsIkNDX0VESVRPUiIsImRpcmVjdG9yIiwiX3NjaGVkdWxlciIsImdhbWUiLCJvbiIsIkVWRU5UX1JFU1RBUlQiLCJpbml0VXBkYXRlIiwiZHQiLCJlbmFibGVGb3JUYXJnZXQiLCJzY2hlZHVsZVVwZGF0ZSIsIlNjaGVkdWxlciIsIlBSSU9SSVRZX1NZU1RFTSIsInVwZGF0ZSIsImFkdmFuY2VUaW1lIiwiZ2V0RHJhZ29uQm9uZXNEYXRhQnlSYXdEYXRhIiwicmF3RGF0YSIsImRhdGFQYXJzZXIiLCJBcnJheUJ1ZmZlciIsIl9iaW5hcnlQYXJzZXIiLCJfZGF0YVBhcnNlciIsInBhcnNlRHJhZ29uQm9uZXNEYXRhIiwiYnVpbGRBcm1hdHVyZURpc3BsYXkiLCJhcm1hdHVyZU5hbWUiLCJkcmFnb25Cb25lc05hbWUiLCJza2luTmFtZSIsInRleHR1cmVBdGxhc05hbWUiLCJhcm1hdHVyZSIsImJ1aWxkQXJtYXR1cmUiLCJfZGlzcGxheSIsImNyZWF0ZUFybWF0dXJlTm9kZSIsImNvbXAiLCJub2RlIiwiTm9kZSIsImRpc3BsYXkiLCJnZXRDb21wb25lbnQiLCJBcm1hdHVyZURpc3BsYXkiLCJhZGRDb21wb25lbnQiLCJfYXJtYXR1cmVOYW1lIiwiX04kZHJhZ29uQXNzZXQiLCJkcmFnb25Bc3NldCIsIl9OJGRyYWdvbkF0bGFzQXNzZXQiLCJkcmFnb25BdGxhc0Fzc2V0IiwiX2luaXQiLCJfYnVpbGRUZXh0dXJlQXRsYXNEYXRhIiwidGV4dHVyZUF0bGFzRGF0YSIsInRleHR1cmVBdGxhcyIsInJlbmRlclRleHR1cmUiLCJib3Jyb3dPYmplY3QiLCJDQ1RleHR1cmVBdGxhc0RhdGEiLCJfc29ydFNsb3RzIiwic2xvdHMiLCJfc2xvdHMiLCJzb3J0ZWRTbG90cyIsImkiLCJsIiwibGVuZ3RoIiwic2xvdCIsInpPcmRlciIsIl96T3JkZXIiLCJpbnNlcnRlZCIsImoiLCJzcGxpY2UiLCJfYnVpbGRBcm1hdHVyZSIsImRhdGFQYWNrYWdlIiwiQXJtYXR1cmUiLCJfc2tpbkRhdGEiLCJza2luIiwiX2FuaW1hdGlvbiIsIkFuaW1hdGlvbiIsIl9hcm1hdHVyZSIsImFuaW1hdGlvbnMiLCJfaXNDaGlsZEFybWF0dXJlIiwiaW5pdCIsIl9idWlsZFNsb3QiLCJzbG90RGF0YSIsImRpc3BsYXlzIiwiQ0NTbG90IiwiZ2V0RHJhZ29uQm9uZXNEYXRhQnlVVUlEIiwidXVpZCIsIl9kcmFnb25Cb25lc0RhdGFNYXAiLCJpbmRleE9mIiwicmVtb3ZlRHJhZ29uQm9uZXNEYXRhQnlVVUlEIiwiZGlzcG9zZURhdGEiLCJidWZmZXJPYmplY3QiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBeUJBLElBQUlBLFVBQVUsR0FBR0MsV0FBVyxDQUFDRCxVQUE3QjtBQUFBLElBQ0lFLFdBQVcsR0FBR0QsV0FBVyxDQUFDQyxXQUQ5QjtBQUdBOzs7O0FBSUE7Ozs7OztBQUtBLElBQUlDLFNBQVMsR0FBR0YsV0FBVyxDQUFDRSxTQUFaLEdBQXdCQyxFQUFFLENBQUNDLEtBQUgsQ0FBUztBQUM3Q0MsRUFBQUEsSUFBSSxFQUFFLHVCQUR1QztBQUU3QyxhQUFTSixXQUZvQzs7QUFHN0M7Ozs7Ozs7QUFPQUssRUFBQUEsT0FBTyxFQUFFO0FBQ0xDLElBQUFBLFFBQVEsRUFBRSxJQURMO0FBRUxDLElBQUFBLFdBRksseUJBRVU7QUFDWCxVQUFJLENBQUNOLFNBQVMsQ0FBQ0ssUUFB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QixJQUFkO0FBQ0FBLElBQUFBLElBQUksQ0FBQ2dCLElBQUwsQ0FBVUUsUUFBVixFQUFvQkMsUUFBcEIsRUFBOEIxQyxPQUE5QixFQUF1Q0EsT0FBdkM7QUFDQSxXQUFPdUIsSUFBUDtBQUNILEdBaEk0QztBQWtJN0NxQixFQUFBQSx3QkFsSTZDLG9DQWtJbkJDLElBbEltQixFQWtJYjtBQUM1QixTQUFLLElBQUl4RixJQUFULElBQWlCLEtBQUt5RixtQkFBdEIsRUFBMkM7QUFDdkMsVUFBSXpGLElBQUksQ0FBQzBGLE9BQUwsQ0FBYUYsSUFBYixLQUFzQixDQUFDLENBQTNCLEVBQThCO0FBQzFCLGVBQU8sS0FBS0MsbUJBQUwsQ0FBeUJ6RixJQUF6QixDQUFQO0FBQ0g7QUFDSjs7QUFDRCxXQUFPLElBQVA7QUFDSCxHQXpJNEM7QUEySTdDMkYsRUFBQUEsMkJBM0k2Qyx1Q0EySWhCSCxJQTNJZ0IsRUEySVZJLFdBM0lVLEVBMklHO0FBQzVDLFFBQUlBLFdBQVcsS0FBSyxLQUFLLENBQXpCLEVBQTRCO0FBQUVBLE1BQUFBLFdBQVcsR0FBRyxJQUFkO0FBQXFCOztBQUNuRCxTQUFLLElBQUk1RixJQUFULElBQWlCLEtBQUt5RixtQkFBdEIsRUFBMkM7QUFDdkMsVUFBSXpGLElBQUksQ0FBQzBGLE9BQUwsQ0FBYUYsSUFBYixNQUF1QixDQUFDLENBQTVCLEVBQStCOztBQUMvQixVQUFJSSxXQUFKLEVBQWlCO0FBQ2IsYUFBS3JGLFlBQUwsQ0FBa0JzRixZQUFsQixDQUErQixLQUFLSixtQkFBTCxDQUF5QnpGLElBQXpCLENBQS9CO0FBQ0g7O0FBQ0QsYUFBTyxLQUFLeUYsbUJBQUwsQ0FBeUJ6RixJQUF6QixDQUFQO0FBQ0g7QUFDSjtBQXBKNEMsQ0FBVCxDQUF4QyIsInNvdXJjZXNDb250ZW50IjpbIi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gQ29weXJpZ2h0IChjKSAyMDE2IENodWtvbmcgVGVjaG5vbG9naWVzIEluYy5cbiBDb3B5cmlnaHQgKGMpIDIwMTctMjAxOCBYaWFtZW4gWWFqaSBTb2Z0d2FyZSBDby4sIEx0ZC5cblxuIGh0dHA6Ly93d3cuY29jb3MyZC14Lm9yZ1xuXG4gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbiBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG5cbiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG4gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbiBUSEUgU09GVFdBUkUuXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxubGV0IEJhc2VPYmplY3QgPSBkcmFnb25Cb25lcy5CYXNlT2JqZWN0LFxuICAgIEJhc2VGYWN0b3J5ID0gZHJhZ29uQm9uZXMuQmFzZUZhY3Rvcnk7XG5cbi8qKlxuICogQG1vZHVsZSBkcmFnb25Cb25lc1xuKi9cblxuLyoqXG4gKiBEcmFnb25Cb25lcyBmYWN0b3J5XG4gKiBAY2xhc3MgQ0NGYWN0b3J5XG4gKiBAZXh0ZW5kcyBCYXNlRmFjdG9yeVxuKi9cbnZhciBDQ0ZhY3RvcnkgPSBkcmFnb25Cb25lcy5DQ0ZhY3RvcnkgPSBjYy5DbGFzcyh7XG4gICAgbmFtZTogJ2RyYWdvbkJvbmVzLkNDRmFjdG9yeScsXG4gICAgZXh0ZW5kczogQmFzZUZhY3RvcnksXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBnZXRJbnN0YW5jZVxuICAgICAqIEByZXR1cm4ge0NDRmFjdG9yeX1cbiAgICAgKiBAc3RhdGljXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBsZXQgZmFjdG9yeSA9IGRyYWdvbkJvbmVzLkNDRmFjdG9yeS5nZXRJbnN0YW5jZSgpO1xuICAgICovXG4gICAgc3RhdGljczoge1xuICAgICAgICBfZmFjdG9yeTogbnVsbCxcbiAgICAgICAgZ2V0SW5zdGFuY2UgKCkge1xuICAgICAgICAgICAgaWYgKCFDQ0ZhY3RvcnkuX2ZhY3RvcnkpIHtcbiAgICAgICAgICAgICAgICBDQ0ZhY3RvcnkuX2ZhY3RvcnkgPSBuZXcgQ0NGYWN0b3J5KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gQ0NGYWN0b3J5Ll9mYWN0b3J5O1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGN0b3IgKCkge1xuICAgICAgICBsZXQgZXZlbnRNYW5hZ2VyID0gbmV3IGRyYWdvbkJvbmVzLkNDQXJtYXR1cmVEaXNwbGF5KCk7XG4gICAgICAgIHRoaXMuX2RyYWdvbkJvbmVzID0gbmV3IGRyYWdvbkJvbmVzLkRyYWdvbkJvbmVzKGV2ZW50TWFuYWdlcik7XG5cbiAgICAgICAgaWYgKCFDQ19OQVRJVkVSRU5ERVJFUiAmJiAhQ0NfRURJVE9SICYmIGNjLmRpcmVjdG9yLl9zY2hlZHVsZXIpIHtcbiAgICAgICAgICAgIGNjLmdhbWUub24oY2MuZ2FtZS5FVkVOVF9SRVNUQVJULCB0aGlzLmluaXRVcGRhdGUsIHRoaXMpO1xuICAgICAgICAgICAgdGhpcy5pbml0VXBkYXRlKCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgaW5pdFVwZGF0ZSAoZHQpIHtcbiAgICAgICAgY2MuZGlyZWN0b3IuX3NjaGVkdWxlci5lbmFibGVGb3JUYXJnZXQodGhpcyk7XG4gICAgICAgIGNjLmRpcmVjdG9yLl9zY2hlZHVsZXIuc2NoZWR1bGVVcGRhdGUodGhpcywgY2MuU2NoZWR1bGVyLlBSSU9SSVRZX1NZU1RFTSwgZmFsc2UpO1xuICAgIH0sXG5cbiAgICB1cGRhdGUgKGR0KSB7XG4gICAgICAgIHRoaXMuX2RyYWdvbkJvbmVzLmFkdmFuY2VUaW1lKGR0KTtcbiAgICB9LFxuXG4gICAgZ2V0RHJhZ29uQm9uZXNEYXRhQnlSYXdEYXRhIChyYXdEYXRhKSB7XG4gICAgICAgIHZhciBkYXRhUGFyc2VyID0gcmF3RGF0YSBpbnN0YW5jZW9mIEFycmF5QnVmZmVyID8gQmFzZUZhY3RvcnkuX2JpbmFyeVBhcnNlciA6IHRoaXMuX2RhdGFQYXJzZXI7XG4gICAgICAgIHJldHVybiBkYXRhUGFyc2VyLnBhcnNlRHJhZ29uQm9uZXNEYXRhKHJhd0RhdGEsIDEuMCk7XG4gICAgfSxcblxuICAgIC8vIEJ1aWxkIG5ldyBhcmFtdHVyZSB3aXRoIGEgbmV3IGRpc3BsYXkuXG4gICAgYnVpbGRBcm1hdHVyZURpc3BsYXkgKGFybWF0dXJlTmFtZSwgZHJhZ29uQm9uZXNOYW1lLCBza2luTmFtZSwgdGV4dHVyZUF0bGFzTmFtZSkge1xuICAgICAgICBsZXQgYXJtYXR1cmUgPSB0aGlzLmJ1aWxkQXJtYXR1cmUoYXJtYXR1cmVOYW1lLCBkcmFnb25Cb25lc05hbWUsIHNraW5OYW1lLCB0ZXh0dXJlQXRsYXNOYW1lKTtcbiAgICAgICAgcmV0dXJuIGFybWF0dXJlICYmIGFybWF0dXJlLl9kaXNwbGF5O1xuICAgIH0sXG5cbiAgICAvLyBCdWlsZCBzdWIgYXJtYXR1cmUgZnJvbSBhbiBleGlzdCBhcm1hdHVyZSBjb21wb25lbnQuXG4gICAgLy8gSXQgd2lsbCBzaGFyZSBkcmFnb25Bc3NldCBhbmQgZHJhZ29uQXRsYXNBc3NldC5cbiAgICAvLyBCdXQgbm9kZSBjYW4gbm90IHNoYXJlLG9yIHdpbGwgY2F1c2UgcmVuZGVyIGVycm9yLlxuICAgIGNyZWF0ZUFybWF0dXJlTm9kZSAoY29tcCwgYXJtYXR1cmVOYW1lLCBub2RlKSB7XG4gICAgICAgIG5vZGUgPSBub2RlIHx8IG5ldyBjYy5Ob2RlKCk7XG4gICAgICAgIGxldCBkaXNwbGF5ID0gbm9kZS5nZXRDb21wb25lbnQoZHJhZ29uQm9uZXMuQXJtYXR1cmVEaXNwbGF5KTtcbiAgICAgICAgaWYgKCFkaXNwbGF5KSB7XG4gICAgICAgICAgICBkaXNwbGF5ID0gbm9kZS5hZGRDb21wb25lbnQoZHJhZ29uQm9uZXMuQXJtYXR1cmVEaXNwbGF5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIG5vZGUubmFtZSA9IGFybWF0dXJlTmFtZTtcbiAgICAgICAgXG4gICAgICAgIGRpc3BsYXkuX2FybWF0dXJlTmFtZSA9IGFybWF0dXJlTmFtZTtcbiAgICAgICAgZGlzcGxheS5fTiRkcmFnb25Bc3NldCA9IGNvbXAuZHJhZ29uQXNzZXQ7XG4gICAgICAgIGRpc3BsYXkuX04kZHJhZ29uQXRsYXNBc3NldCA9IGNvbXAuZHJhZ29uQXRsYXNBc3NldDtcbiAgICAgICAgZGlzcGxheS5faW5pdCgpO1xuXG4gICAgICAgIHJldHVybiBkaXNwbGF5O1xuICAgIH0sXG4gICAgXG4gICAgX2J1aWxkVGV4dHVyZUF0bGFzRGF0YSAodGV4dHVyZUF0bGFzRGF0YSwgdGV4dHVyZUF0bGFzKSB7XG4gICAgICAgIGlmICh0ZXh0dXJlQXRsYXNEYXRhKSB7XG4gICAgICAgICAgICB0ZXh0dXJlQXRsYXNEYXRhLnJlbmRlclRleHR1cmUgPSB0ZXh0dXJlQXRsYXM7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0ZXh0dXJlQXRsYXNEYXRhID0gQmFzZU9iamVjdC5ib3Jyb3dPYmplY3QoZHJhZ29uQm9uZXMuQ0NUZXh0dXJlQXRsYXNEYXRhKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGV4dHVyZUF0bGFzRGF0YTtcbiAgICB9LFxuXG4gICAgX3NvcnRTbG90cyAoKSB7XG4gICAgICAgIGxldCBzbG90cyA9IHRoaXMuX3Nsb3RzO1xuICAgICAgICBsZXQgc29ydGVkU2xvdHMgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDAsIGwgPSBzbG90cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgIGxldCBzbG90ID0gc2xvdHNbaV07XG4gICAgICAgICAgICBsZXQgek9yZGVyID0gc2xvdC5fek9yZGVyO1xuICAgICAgICAgICAgbGV0IGluc2VydGVkID0gZmFsc2U7XG4gICAgICAgICAgICBmb3IgKGxldCBqID0gc29ydGVkU2xvdHMubGVuZ3RoIC0gMTsgaiA+PSAwOyBqLS0pIHtcbiAgICAgICAgICAgICAgICBpZiAoek9yZGVyID49IHNvcnRlZFNsb3RzW2pdLl96T3JkZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgc29ydGVkU2xvdHMuc3BsaWNlKGorMSwgMCwgc2xvdCk7XG4gICAgICAgICAgICAgICAgICAgIGluc2VydGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFpbnNlcnRlZCkge1xuICAgICAgICAgICAgICAgIHNvcnRlZFNsb3RzLnNwbGljZSgwLCAwLCBzbG90KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9zbG90cyA9IHNvcnRlZFNsb3RzO1xuICAgIH0sXG5cbiAgICBfYnVpbGRBcm1hdHVyZSAoZGF0YVBhY2thZ2UpIHtcbiAgICAgICAgbGV0IGFybWF0dXJlID0gQmFzZU9iamVjdC5ib3Jyb3dPYmplY3QoZHJhZ29uQm9uZXMuQXJtYXR1cmUpO1xuXG4gICAgICAgIGFybWF0dXJlLl9za2luRGF0YSA9IGRhdGFQYWNrYWdlLnNraW47XG4gICAgICAgIGFybWF0dXJlLl9hbmltYXRpb24gPSBCYXNlT2JqZWN0LmJvcnJvd09iamVjdChkcmFnb25Cb25lcy5BbmltYXRpb24pO1xuICAgICAgICBhcm1hdHVyZS5fYW5pbWF0aW9uLl9hcm1hdHVyZSA9IGFybWF0dXJlO1xuICAgICAgICBhcm1hdHVyZS5fYW5pbWF0aW9uLmFuaW1hdGlvbnMgPSBkYXRhUGFja2FnZS5hcm1hdHVyZS5hbmltYXRpb25zO1xuXG4gICAgICAgIGFybWF0dXJlLl9pc0NoaWxkQXJtYXR1cmUgPSBmYWxzZTtcblxuICAgICAgICAvLyBmaXhlZCBkcmFnb25ib25lcyBzb3J0IGlzc3VlXG4gICAgICAgIC8vIGFybWF0dXJlLl9zb3J0U2xvdHMgPSB0aGlzLl9zb3J0U2xvdHM7XG5cbiAgICAgICAgdmFyIGRpc3BsYXkgPSBuZXcgZHJhZ29uQm9uZXMuQ0NBcm1hdHVyZURpc3BsYXkoKTtcblxuICAgICAgICBhcm1hdHVyZS5pbml0KGRhdGFQYWNrYWdlLmFybWF0dXJlLFxuICAgICAgICAgICAgZGlzcGxheSwgZGlzcGxheSwgdGhpcy5fZHJhZ29uQm9uZXNcbiAgICAgICAgKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBhcm1hdHVyZTtcbiAgICB9LFxuXG4gICAgX2J1aWxkU2xvdCAoZGF0YVBhY2thZ2UsIHNsb3REYXRhLCBkaXNwbGF5cykge1xuICAgICAgICBsZXQgc2xvdCA9IEJhc2VPYmplY3QuYm9ycm93T2JqZWN0KGRyYWdvbkJvbmVzLkNDU2xvdCk7XG4gICAgICAgIGxldCBkaXNwbGF5ID0gc2xvdDtcbiAgICAgICAgc2xvdC5pbml0KHNsb3REYXRhLCBkaXNwbGF5cywgZGlzcGxheSwgZGlzcGxheSk7XG4gICAgICAgIHJldHVybiBzbG90O1xuICAgIH0sXG5cbiAgICBnZXREcmFnb25Cb25lc0RhdGFCeVVVSUQgKHV1aWQpIHtcbiAgICAgICAgZm9yICh2YXIgbmFtZSBpbiB0aGlzLl9kcmFnb25Cb25lc0RhdGFNYXApIHtcbiAgICAgICAgICAgIGlmIChuYW1lLmluZGV4T2YodXVpZCkgIT0gLTEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fZHJhZ29uQm9uZXNEYXRhTWFwW25hbWVdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH0sXG5cbiAgICByZW1vdmVEcmFnb25Cb25lc0RhdGFCeVVVSUQgKHV1aWQsIGRpc3Bvc2VEYXRhKSB7XG4gICAgICAgIGlmIChkaXNwb3NlRGF0YSA9PT0gdm9pZCAwKSB7IGRpc3Bvc2VEYXRhID0gdHJ1ZTsgfVxuICAgICAgICBmb3IgKHZhciBuYW1lIGluIHRoaXMuX2RyYWdvbkJvbmVzRGF0YU1hcCkge1xuICAgICAgICAgICAgaWYgKG5hbWUuaW5kZXhPZih1dWlkKSA9PT0gLTEpIGNvbnRpbnVlO1xuICAgICAgICAgICAgaWYgKGRpc3Bvc2VEYXRhKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZHJhZ29uQm9uZXMuYnVmZmVyT2JqZWN0KHRoaXMuX2RyYWdvbkJvbmVzRGF0YU1hcFtuYW1lXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5fZHJhZ29uQm9uZXNEYXRhTWFwW25hbWVdO1xuICAgICAgICB9XG4gICAgfVxufSk7XG4iXSwic291cmNlUm9vdCI6Ii8ifQ==