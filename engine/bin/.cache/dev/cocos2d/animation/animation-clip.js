
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'engine-dev/cocos2d/animation/animation-clip.js';
                    var __require = nodeEnv ? function (request) {
                        return require(request);
                    } : function (request) {
                        return __quick_compile_engine__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_engine__.registerModule(__filename, module);}"use strict";

/****************************************************************************
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
var WrapMode = require('./types').WrapMode;

var _require = require('./animation-curves'),
    DynamicAnimCurve = _require.DynamicAnimCurve,
    quickFindIndex = _require.quickFindIndex;

var sampleMotionPaths = require('./motion-path-helper').sampleMotionPaths;

var binarySearch = require('../core/utils/binary-search').binarySearchEpsilon;
/**
 * !#en Class for animation data handling.
 * !#zh 动画剪辑，用于存储动画数据。
 * @class AnimationClip
 * @extends Asset
 */


var AnimationClip = cc.Class({
  name: 'cc.AnimationClip',
  "extends": cc.Asset,
  properties: {
    _duration: {
      "default": 0,
      type: cc.Float
    },

    /**
     * !#en Duration of this animation.
     * !#zh 动画的持续时间。
     * @property duration
     * @type {Number}
     */
    duration: {
      get: function get() {
        return this._duration;
      }
    },

    /**
     * !#en FrameRate of this animation.
     * !#zh 动画的帧速率。
     * @property sample
     * @type {Number}
     */
    sample: {
      "default": 60
    },

    /**
     * !#en Speed of this animation.
     * !#zh 动画的播放速度。
     * @property speed
     * @type {Number}
     */
    speed: {
      "default": 1
    },

    /**
     * !#en WrapMode of this animation.
     * !#zh 动画的循环模式。
     * @property wrapMode
     * @type {WrapMode}
     */
    wrapMode: {
      "default": WrapMode.Normal
    },

    /**
     * !#en Curve data.
     * !#zh 曲线数据。
     * @property curveData
     * @type {Object}
     * @example {@link cocos2d/core/animation-clip/curve-data.js}
     */
    curveData: {
      "default": {},
      visible: false
    },

    /**
     * !#en Event data.
     * !#zh 事件数据。
     * @property events
     * @type {Object[]}
     * @example {@link cocos2d/core/animation-clip/event-data.js}
     * @typescript events: {frame: number, func: string, params: string[]}[]
     */
    events: {
      "default": [],
      visible: false
    }
  },
  statics: {
    /**
     * !#en Crate clip with a set of sprite frames
     * !#zh 使用一组序列帧图片来创建动画剪辑
     * @method createWithSpriteFrames
     * @param {[SpriteFrame]} spriteFrames
     * @param {Number} sample
     * @return {AnimationClip}
     * @static
     * @example
     *
     * var clip = cc.AnimationClip.createWithSpriteFrames(spriteFrames, 10);
     *
     */
    createWithSpriteFrames: function createWithSpriteFrames(spriteFrames, sample) {
      if (!Array.isArray(spriteFrames)) {
        cc.errorID(3905);
        return null;
      }

      var clip = new AnimationClip();
      clip.sample = sample || clip.sample;
      clip._duration = spriteFrames.length / clip.sample;
      var frames = [];
      var step = 1 / clip.sample;

      for (var i = 0, l = spriteFrames.length; i < l; i++) {
        frames[i] = {
          frame: i * step,
          value: spriteFrames[i]
        };
      }

      clip.curveData = {
        comps: {
          // component
          'cc.Sprite': {
            // component properties
            'spriteFrame': frames
          }
        }
      };
      return clip;
    }
  },
  onLoad: function onLoad() {
    this._duration = Number.parseFloat(this.duration);
    this.speed = Number.parseFloat(this.speed);
    this.wrapMode = Number.parseInt(this.wrapMode);
    this.frameRate = Number.parseFloat(this.sample);
  },
  createPropCurve: function createPropCurve(target, propPath, keyframes) {
    var motionPaths = [];
    var isMotionPathProp = target instanceof cc.Node && propPath === 'position';
    var curve = new DynamicAnimCurve(); // 缓存目标对象，所以 Component 必须一开始都创建好并且不能运行时动态替换……

    curve.target = target;
    curve.prop = propPath; // for each keyframes

    for (var i = 0, l = keyframes.length; i < l; i++) {
      var keyframe = keyframes[i];
      var ratio = keyframe.frame / this.duration;
      curve.ratios.push(ratio);

      if (isMotionPathProp) {
        motionPaths.push(keyframe.motionPath);
      }

      var curveValue = keyframe.value;
      curve.values.push(curveValue);
      var curveTypes = keyframe.curve;

      if (curveTypes) {
        if (typeof curveTypes === 'string') {
          curve.types.push(curveTypes);
          continue;
        } else if (Array.isArray(curveTypes)) {
          if (curveTypes[0] === curveTypes[1] && curveTypes[2] === curveTypes[3]) {
            curve.types.push(DynamicAnimCurve.Linear);
          } else {
            curve.types.push(DynamicAnimCurve.Bezier(curveTypes));
          }

          continue;
        }
      }

      curve.types.push(DynamicAnimCurve.Linear);
    }

    if (isMotionPathProp) {
      sampleMotionPaths(motionPaths, curve, this.duration, this.sample, target);
    } // if every piece of ratios are the same, we can use the quick function to find frame index.


    var ratios = curve.ratios;
    var currRatioDif, lastRatioDif;
    var canOptimize = true;
    var EPSILON = 1e-6;

    for (var _i = 1, _l = ratios.length; _i < _l; _i++) {
      currRatioDif = ratios[_i] - ratios[_i - 1];

      if (_i === 1) {
        lastRatioDif = currRatioDif;
      } else if (Math.abs(currRatioDif - lastRatioDif) > EPSILON) {
        canOptimize = false;
        break;
      }
    }

    curve._findFrameIndex = canOptimize ? quickFindIndex : binarySearch; // find the lerp function

    var firstValue = curve.values[0];

    if (firstValue !== undefined && firstValue !== null && !curve._lerp) {
      if (typeof firstValue === 'number') {
        curve._lerp = DynamicAnimCurve.prototype._lerpNumber;
      } else if (firstValue instanceof cc.Quat) {
        curve._lerp = DynamicAnimCurve.prototype._lerpQuat;
      } else if (firstValue instanceof cc.Vec2) {
        curve._lerp = DynamicAnimCurve.prototype._lerpVector2;
      } else if (firstValue instanceof cc.Vec3) {
        curve._lerp = DynamicAnimCurve.prototype._lerpVector3;
      } else if (firstValue.lerp) {
        curve._lerp = DynamicAnimCurve.prototype._lerpObject;
      }
    }

    return curve;
  },
  createTargetCurves: function createTargetCurves(target, curveData, curves) {
    var propsData = curveData.props;
    var compsData = curveData.comps;

    if (propsData) {
      for (var propPath in propsData) {
        var data = propsData[propPath];
        var curve = this.createPropCurve(target, propPath, data);
        curves.push(curve);
      }
    }

    if (compsData) {
      for (var compName in compsData) {
        var comp = target.getComponent(compName);

        if (!comp) {
          continue;
        }

        var compData = compsData[compName];

        for (var _propPath in compData) {
          var _data = compData[_propPath];

          var _curve = this.createPropCurve(comp, _propPath, _data);

          curves.push(_curve);
        }
      }
    }
  },
  createCurves: function createCurves(state, root) {
    var curveData = this.curveData;
    var childrenCurveDatas = curveData.paths;
    var curves = [];
    this.createTargetCurves(root, curveData, curves);

    for (var namePath in childrenCurveDatas) {
      var target = cc.find(namePath, root);

      if (!target) {
        continue;
      }

      var childCurveDatas = childrenCurveDatas[namePath];
      this.createTargetCurves(target, childCurveDatas, curves);
    }

    return curves;
  }
});
cc.AnimationClip = module.exports = AnimationClip;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVuZ2luZS1kZXYvY29jb3MyZC9hbmltYXRpb24vYW5pbWF0aW9uLWNsaXAuanMiXSwibmFtZXMiOlsiV3JhcE1vZGUiLCJyZXF1aXJlIiwiRHluYW1pY0FuaW1DdXJ2ZSIsInF1aWNrRmluZEluZGV4Iiwic2FtcGxlTW90aW9uUGF0aHMiLCJiaW5hcnlTZWFyY2giLCJiaW5hcnlTZWFyY2hFcHNpbG9uIiwiQW5pbWF0aW9uQ2xpcCIsImNjIiwiQ2xhc3MiLCJuYW1lIiwiQXNzZXQiLCJwcm9wZXJ0aWVzIiwiX2R1cmF0aW9uIiwidHlwZSIsIkZsb2F0IiwiZHVyYXRpb24iLCJnZXQiLCJzYW1wbGUiLCJzcGVlZCIsIndyYXBNb2RlIiwiTm9ybWFsIiwiY3VydmVEYXRhIiwidmlzaWJsZSIsImV2ZW50cyIsInN0YXRpY3MiLCJjcmVhdGVXaXRoU3ByaXRlRnJhbWVzIiwic3ByaXRlRnJhbWVzIiwiQXJyYXkiLCJpc0FycmF5IiwiZXJyb3JJRCIsImNsaXAiLCJsZW5ndGgiLCJmcmFtZXMiLCJzdGVwIiwiaSIsImwiLCJmcmFtZSIsInZhbHVlIiwiY29tcHMiLCJvbkxvYWQiLCJOdW1iZXIiLCJwYXJzZUZsb2F0IiwicGFyc2VJbnQiLCJmcmFtZVJhdGUiLCJjcmVhdGVQcm9wQ3VydmUiLCJ0YXJnZXQiLCJwcm9wUGF0aCIsImtleWZyYW1lcyIsIm1vdGlvblBhdGhzIiwiaXNNb3Rpb25QYXRoUHJvcCIsIk5vZGUiLCJjdXJ2ZSIsInByb3AiLCJrZXlmcmFtZSIsInJhdGlvIiwicmF0aW9zIiwicHVzaCIsIm1vdGlvblBhdGgiLCJjdXJ2ZVZhbHVlIiwidmFsdWVzIiwiY3VydmVUeXBlcyIsInR5cGVzIiwiTGluZWFyIiwiQmV6aWVyIiwiY3VyclJhdGlvRGlmIiwibGFzdFJhdGlvRGlmIiwiY2FuT3B0aW1pemUiLCJFUFNJTE9OIiwiTWF0aCIsImFicyIsIl9maW5kRnJhbWVJbmRleCIsImZpcnN0VmFsdWUiLCJ1bmRlZmluZWQiLCJfbGVycCIsInByb3RvdHlwZSIsIl9sZXJwTnVtYmVyIiwiUXVhdCIsIl9sZXJwUXVhdCIsIlZlYzIiLCJfbGVycFZlY3RvcjIiLCJWZWMzIiwiX2xlcnBWZWN0b3IzIiwibGVycCIsIl9sZXJwT2JqZWN0IiwiY3JlYXRlVGFyZ2V0Q3VydmVzIiwiY3VydmVzIiwicHJvcHNEYXRhIiwicHJvcHMiLCJjb21wc0RhdGEiLCJkYXRhIiwiY29tcE5hbWUiLCJjb21wIiwiZ2V0Q29tcG9uZW50IiwiY29tcERhdGEiLCJjcmVhdGVDdXJ2ZXMiLCJzdGF0ZSIsInJvb3QiLCJjaGlsZHJlbkN1cnZlRGF0YXMiLCJwYXRocyIsIm5hbWVQYXRoIiwiZmluZCIsImNoaWxkQ3VydmVEYXRhcyIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBeUJBLElBQU1BLFFBQVEsR0FBR0MsT0FBTyxDQUFDLFNBQUQsQ0FBUCxDQUFtQkQsUUFBcEM7O2VBQzZDQyxPQUFPLENBQUMsb0JBQUQ7SUFBNUNDLDRCQUFBQTtJQUFrQkMsMEJBQUFBOztBQUMxQixJQUFNQyxpQkFBaUIsR0FBR0gsT0FBTyxDQUFDLHNCQUFELENBQVAsQ0FBZ0NHLGlCQUExRDs7QUFDQSxJQUFNQyxZQUFZLEdBQUdKLE9BQU8sQ0FBQyw2QkFBRCxDQUFQLENBQXVDSyxtQkFBNUQ7QUFFQTs7Ozs7Ozs7QUFNQSxJQUFJQyxhQUFhLEdBQUdDLEVBQUUsQ0FBQ0MsS0FBSCxDQUFTO0FBQ3pCQyxFQUFBQSxJQUFJLEVBQUUsa0JBRG1CO0FBRXpCLGFBQVNGLEVBQUUsQ0FBQ0csS0FGYTtBQUl6QkMsRUFBQUEsVUFBVSxFQUFFO0FBQ1JDLElBQUFBLFNBQVMsRUFBRTtBQUNQLGlCQUFTLENBREY7QUFFUEMsTUFBQUEsSUFBSSxFQUFFTixFQUFFLENBQUNPO0FBRkYsS0FESDs7QUFNUjs7Ozs7O0FBTUFDLElBQUFBLFFBQVEsRUFBRTtBQUNOQyxNQUFBQSxHQUFHLEVBQUUsZUFBWTtBQUFFLGVBQU8s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QW5DO0FBQ0EsUUFBSWIsTUFBTSxHQUFHLEVBQWI7QUFFQSxTQUFLRCxrQkFBTCxDQUF3QlksSUFBeEIsRUFBOEIzRSxTQUE5QixFQUF5Q2dFLE1BQXpDOztBQUVBLFNBQUssSUFBSWMsUUFBVCxJQUFxQkYsa0JBQXJCLEVBQXlDO0FBQ3JDLFVBQUlwRCxNQUFNLEdBQUd0QyxFQUFFLENBQUM2RixJQUFILENBQVFELFFBQVIsRUFBa0JILElBQWxCLENBQWI7O0FBRUEsVUFBSSxDQUFDbkQsTUFBTCxFQUFhO0FBQ1Q7QUFDSDs7QUFFRCxVQUFJd0QsZUFBZSxHQUFHSixrQkFBa0IsQ0FBQ0UsUUFBRCxDQUF4QztBQUNBLFdBQUtmLGtCQUFMLENBQXdCdkMsTUFBeEIsRUFBZ0N3RCxlQUFoQyxFQUFpRGhCLE1BQWpEO0FBQ0g7O0FBRUQsV0FBT0EsTUFBUDtBQUNIO0FBNVF3QixDQUFULENBQXBCO0FBK1FBOUUsRUFBRSxDQUFDRCxhQUFILEdBQW1CZ0csTUFBTSxDQUFDQyxPQUFQLEdBQWlCakcsYUFBcEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuIENvcHlyaWdodCAoYykgMjAxNy0yMDE4IFhpYW1lbiBZYWppIFNvZnR3YXJlIENvLiwgTHRkLlxuXG4gaHR0cHM6Ly93d3cuY29jb3MuY29tL1xuXG4gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZW5naW5lIHNvdXJjZSBjb2RlICh0aGUgXCJTb2Z0d2FyZVwiKSwgYSBsaW1pdGVkLFxuIHdvcmxkd2lkZSwgcm95YWx0eS1mcmVlLCBub24tYXNzaWduYWJsZSwgcmV2b2NhYmxlIGFuZCBub24tZXhjbHVzaXZlIGxpY2Vuc2VcbiB0byB1c2UgQ29jb3MgQ3JlYXRvciBzb2xlbHkgdG8gZGV2ZWxvcCBnYW1lcyBvbiB5b3VyIHRhcmdldCBwbGF0Zm9ybXMuIFlvdSBzaGFsbFxuIG5vdCB1c2UgQ29jb3MgQ3JlYXRvciBzb2Z0d2FyZSBmb3IgZGV2ZWxvcGluZyBvdGhlciBzb2Z0d2FyZSBvciB0b29scyB0aGF0J3NcbiB1c2VkIGZvciBkZXZlbG9waW5nIGdhbWVzLiBZb3UgYXJlIG5vdCBncmFudGVkIHRvIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsXG4gc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIENvY29zIENyZWF0b3IuXG5cbiBUaGUgc29mdHdhcmUgb3IgdG9vbHMgaW4gdGhpcyBMaWNlbnNlIEFncmVlbWVudCBhcmUgbGljZW5zZWQsIG5vdCBzb2xkLlxuIFhpYW1lbiBZYWppIFNvZnR3YXJlIENvLiwgTHRkLiByZXNlcnZlcyBhbGwgcmlnaHRzIG5vdCBleHByZXNzbHkgZ3JhbnRlZCB0byB5b3UuXG5cbiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuIFRIRSBTT0ZUV0FSRS5cbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG5jb25zdCBXcmFwTW9kZSA9IHJlcXVpcmUoJy4vdHlwZXMnKS5XcmFwTW9kZTtcbmNvbnN0IHsgRHluYW1pY0FuaW1DdXJ2ZSwgcXVpY2tGaW5kSW5kZXggfSA9IHJlcXVpcmUoJy4vYW5pbWF0aW9uLWN1cnZlcycpO1xuY29uc3Qgc2FtcGxlTW90aW9uUGF0aHMgPSByZXF1aXJlKCcuL21vdGlvbi1wYXRoLWhlbHBlcicpLnNhbXBsZU1vdGlvblBhdGhzO1xuY29uc3QgYmluYXJ5U2VhcmNoID0gcmVxdWlyZSgnLi4vY29yZS91dGlscy9iaW5hcnktc2VhcmNoJykuYmluYXJ5U2VhcmNoRXBzaWxvbjtcblxuLyoqXG4gKiAhI2VuIENsYXNzIGZvciBhbmltYXRpb24gZGF0YSBoYW5kbGluZy5cbiAqICEjemgg5Yqo55S75Ymq6L6R77yM55So5LqO5a2Y5YKo5Yqo55S75pWw5o2u44CCXG4gKiBAY2xhc3MgQW5pbWF0aW9uQ2xpcFxuICogQGV4dGVuZHMgQXNzZXRcbiAqL1xudmFyIEFuaW1hdGlvbkNsaXAgPSBjYy5DbGFzcyh7XG4gICAgbmFtZTogJ2NjLkFuaW1hdGlvbkNsaXAnLFxuICAgIGV4dGVuZHM6IGNjLkFzc2V0LFxuXG4gICAgcHJvcGVydGllczoge1xuICAgICAgICBfZHVyYXRpb246IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IDAsXG4gICAgICAgICAgICB0eXBlOiBjYy5GbG9hdCxcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogISNlbiBEdXJhdGlvbiBvZiB0aGlzIGFuaW1hdGlvbi5cbiAgICAgICAgICogISN6aCDliqjnlLvnmoTmjIHnu63ml7bpl7TjgIJcbiAgICAgICAgICogQHByb3BlcnR5IGR1cmF0aW9uXG4gICAgICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICAgICAqL1xuICAgICAgICBkdXJhdGlvbjoge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLl9kdXJhdGlvbjsgfSxcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogISNlbiBGcmFtZVJhdGUgb2YgdGhpcyBhbmltYXRpb24uXG4gICAgICAgICAqICEjemgg5Yqo55S755qE5bin6YCf546H44CCXG4gICAgICAgICAqIEBwcm9wZXJ0eSBzYW1wbGVcbiAgICAgICAgICogQHR5cGUge051bWJlcn1cbiAgICAgICAgICovXG4gICAgICAgIHNhbXBsZToge1xuICAgICAgICAgICAgZGVmYXVsdDogNjAsXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqICEjZW4gU3BlZWQgb2YgdGhpcyBhbmltYXRpb24uXG4gICAgICAgICAqICEjemgg5Yqo55S755qE5pKt5pS+6YCf5bqm44CCXG4gICAgICAgICAqIEBwcm9wZXJ0eSBzcGVlZFxuICAgICAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAgICAgKi9cbiAgICAgICAgc3BlZWQ6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IDFcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogISNlbiBXcmFwTW9kZSBvZiB0aGlzIGFuaW1hdGlvbi5cbiAgICAgICAgICogISN6aCDliqjnlLvnmoTlvqrnjq/mqKHlvI/jgIJcbiAgICAgICAgICogQHByb3BlcnR5IHdyYXBNb2RlXG4gICAgICAgICAqIEB0eXBlIHtXcmFwTW9kZX1cbiAgICAgICAgICovXG4gICAgICAgIHdyYXBNb2RlOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBXcmFwTW9kZS5Ob3JtYWxcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogISNlbiBDdXJ2ZSBkYXRhLlxuICAgICAgICAgKiAhI3poIOabsue6v+aVsOaNruOAglxuICAgICAgICAgKiBAcHJvcGVydHkgY3VydmVEYXRhXG4gICAgICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICAgICAqIEBleGFtcGxlIHtAbGluayBjb2NvczJkL2NvcmUvYW5pbWF0aW9uLWNsaXAvY3VydmUtZGF0YS5qc31cbiAgICAgICAgICovXG4gICAgICAgIGN1cnZlRGF0YToge1xuICAgICAgICAgICAgZGVmYXVsdDoge30sXG4gICAgICAgICAgICB2aXNpYmxlOiBmYWxzZSxcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogISNlbiBFdmVudCBkYXRhLlxuICAgICAgICAgKiAhI3poIOS6i+S7tuaVsOaNruOAglxuICAgICAgICAgKiBAcHJvcGVydHkgZXZlbnRzXG4gICAgICAgICAqIEB0eXBlIHtPYmplY3RbXX1cbiAgICAgICAgICogQGV4YW1wbGUge0BsaW5rIGNvY29zMmQvY29yZS9hbmltYXRpb24tY2xpcC9ldmVudC1kYXRhLmpzfVxuICAgICAgICAgKiBAdHlwZXNjcmlwdCBldmVudHM6IHtmcmFtZTogbnVtYmVyLCBmdW5jOiBzdHJpbmcsIHBhcmFtczogc3RyaW5nW119W11cbiAgICAgICAgICovXG4gICAgICAgIGV2ZW50czoge1xuICAgICAgICAgICAgZGVmYXVsdDogW10sXG4gICAgICAgICAgICB2aXNpYmxlOiBmYWxzZSxcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBzdGF0aWNzOiB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiAhI2VuIENyYXRlIGNsaXAgd2l0aCBhIHNldCBvZiBzcHJpdGUgZnJhbWVzXG4gICAgICAgICAqICEjemgg5L2/55So5LiA57uE5bqP5YiX5bin5Zu+54mH5p2l5Yib5bu65Yqo55S75Ymq6L6RXG4gICAgICAgICAqIEBtZXRob2QgY3JlYXRlV2l0aFNwcml0ZUZyYW1lc1xuICAgICAgICAgKiBAcGFyYW0ge1tTcHJpdGVGcmFtZV19IHNwcml0ZUZyYW1lc1xuICAgICAgICAgKiBAcGFyYW0ge051bWJlcn0gc2FtcGxlXG4gICAgICAgICAqIEByZXR1cm4ge0FuaW1hdGlvbkNsaXB9XG4gICAgICAgICAqIEBzdGF0aWNcbiAgICAgICAgICogQGV4YW1wbGVcbiAgICAgICAgICpcbiAgICAgICAgICogdmFyIGNsaXAgPSBjYy5BbmltYXRpb25DbGlwLmNyZWF0ZVdpdGhTcHJpdGVGcmFtZXMoc3ByaXRlRnJhbWVzLCAxMCk7XG4gICAgICAgICAqXG4gICAgICAgICAqL1xuICAgICAgICBjcmVhdGVXaXRoU3ByaXRlRnJhbWVzOiBmdW5jdGlvbiAoc3ByaXRlRnJhbWVzLCBzYW1wbGUpIHtcbiAgICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheShzcHJpdGVGcmFtZXMpKSB7XG4gICAgICAgICAgICAgICAgY2MuZXJyb3JJRCgzOTA1KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGNsaXAgPSBuZXcgQW5pbWF0aW9uQ2xpcCgpO1xuICAgICAgICAgICAgY2xpcC5zYW1wbGUgPSBzYW1wbGUgfHwgY2xpcC5zYW1wbGU7XG5cbiAgICAgICAgICAgIGNsaXAuX2R1cmF0aW9uID0gc3ByaXRlRnJhbWVzLmxlbmd0aCAvIGNsaXAuc2FtcGxlO1xuXG4gICAgICAgICAgICB2YXIgZnJhbWVzID0gW107XG4gICAgICAgICAgICB2YXIgc3RlcCA9IDEgLyBjbGlwLnNhbXBsZTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBzcHJpdGVGcmFtZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgZnJhbWVzW2ldID0geyBmcmFtZTogKGkgKiBzdGVwKSwgdmFsdWU6IHNwcml0ZUZyYW1lc1tpXSB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjbGlwLmN1cnZlRGF0YSA9IHtcbiAgICAgICAgICAgICAgICBjb21wczoge1xuICAgICAgICAgICAgICAgICAgICAvLyBjb21wb25lbnRcbiAgICAgICAgICAgICAgICAgICAgJ2NjLlNwcml0ZSc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNvbXBvbmVudCBwcm9wZXJ0aWVzXG4gICAgICAgICAgICAgICAgICAgICAgICAnc3ByaXRlRnJhbWUnOiBmcmFtZXNcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiBjbGlwO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIG9uTG9hZCAoKSB7XG4gICAgICAgIHRoaXMuX2R1cmF0aW9uID0gTnVtYmVyLnBhcnNlRmxvYXQodGhpcy5kdXJhdGlvbik7XG4gICAgICAgIHRoaXMuc3BlZWQgPSBOdW1iZXIucGFyc2VGbG9hdCh0aGlzLnNwZWVkKTtcbiAgICAgICAgdGhpcy53cmFwTW9kZSA9IE51bWJlci5wYXJzZUludCh0aGlzLndyYXBNb2RlKTtcbiAgICAgICAgdGhpcy5mcmFtZVJhdGUgPSBOdW1iZXIucGFyc2VGbG9hdCh0aGlzLnNhbXBsZSk7XG4gICAgfSxcblxuICAgIGNyZWF0ZVByb3BDdXJ2ZSAodGFyZ2V0LCBwcm9wUGF0aCwga2V5ZnJhbWVzKSB7XG4gICAgICAgIGxldCBtb3Rpb25QYXRocyA9IFtdO1xuICAgICAgICBsZXQgaXNNb3Rpb25QYXRoUHJvcCA9IHRhcmdldCBpbnN0YW5jZW9mIGNjLk5vZGUgJiYgcHJvcFBhdGggPT09ICdwb3NpdGlvbic7XG5cbiAgICAgICAgbGV0IGN1cnZlID0gbmV3IER5bmFtaWNBbmltQ3VydmUoKTtcblxuICAgICAgICAvLyDnvJPlrZjnm67moIflr7nosaHvvIzmiYDku6UgQ29tcG9uZW50IOW/hemhu+S4gOW8gOWni+mDveWIm+W7uuWlveW5tuS4lOS4jeiDvei/kOihjOaXtuWKqOaAgeabv+aNouKApuKAplxuICAgICAgICBjdXJ2ZS50YXJnZXQgPSB0YXJnZXQ7XG4gICAgICAgIGN1cnZlLnByb3AgPSBwcm9wUGF0aDtcblxuICAgICAgICAvLyBmb3IgZWFjaCBrZXlmcmFtZXNcbiAgICAgICAgZm9yIChsZXQgaSA9IDAsIGwgPSBrZXlmcmFtZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICBsZXQga2V5ZnJhbWUgPSBrZXlmcmFtZXNbaV07XG4gICAgICAgICAgICBsZXQgcmF0aW8gPSBrZXlmcmFtZS5mcmFtZSAvIHRoaXMuZHVyYXRpb247XG4gICAgICAgICAgICBjdXJ2ZS5yYXRpb3MucHVzaChyYXRpbyk7XG5cbiAgICAgICAgICAgIGlmIChpc01vdGlvblBhdGhQcm9wKSB7XG4gICAgICAgICAgICAgICAgbW90aW9uUGF0aHMucHVzaChrZXlmcmFtZS5tb3Rpb25QYXRoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IGN1cnZlVmFsdWUgPSBrZXlmcmFtZS52YWx1ZTtcbiAgICAgICAgICAgIGN1cnZlLnZhbHVlcy5wdXNoKGN1cnZlVmFsdWUpO1xuXG4gICAgICAgICAgICBsZXQgY3VydmVUeXBlcyA9IGtleWZyYW1lLmN1cnZlO1xuICAgICAgICAgICAgaWYgKGN1cnZlVHlwZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGN1cnZlVHlwZXMgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgIGN1cnZlLnR5cGVzLnB1c2goY3VydmVUeXBlcyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChBcnJheS5pc0FycmF5KGN1cnZlVHlwZXMpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJ2ZVR5cGVzWzBdID09PSBjdXJ2ZVR5cGVzWzFdICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJ2ZVR5cGVzWzJdID09PSBjdXJ2ZVR5cGVzWzNdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJ2ZS50eXBlcy5wdXNoKER5bmFtaWNBbmltQ3VydmUuTGluZWFyKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnZlLnR5cGVzLnB1c2goRHluYW1pY0FuaW1DdXJ2ZS5CZXppZXIoY3VydmVUeXBlcykpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGN1cnZlLnR5cGVzLnB1c2goRHluYW1pY0FuaW1DdXJ2ZS5MaW5lYXIpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAoaXNNb3Rpb25QYXRoUHJvcCkge1xuICAgICAgICAgICAgc2FtcGxlTW90aW9uUGF0aHMobW90aW9uUGF0aHMsIGN1cnZlLCB0aGlzLmR1cmF0aW9uLCB0aGlzLnNhbXBsZSwgdGFyZ2V0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGlmIGV2ZXJ5IHBpZWNlIG9mIHJhdGlvcyBhcmUgdGhlIHNhbWUsIHdlIGNhbiB1c2UgdGhlIHF1aWNrIGZ1bmN0aW9uIHRvIGZpbmQgZnJhbWUgaW5kZXguXG4gICAgICAgIGxldCByYXRpb3MgPSBjdXJ2ZS5yYXRpb3M7XG4gICAgICAgIGxldCBjdXJyUmF0aW9EaWYsIGxhc3RSYXRpb0RpZjtcbiAgICAgICAgbGV0IGNhbk9wdGltaXplID0gdHJ1ZTtcbiAgICAgICAgbGV0IEVQU0lMT04gPSAxZS02O1xuICAgICAgICBmb3IgKGxldCBpID0gMSwgbCA9IHJhdGlvcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgIGN1cnJSYXRpb0RpZiA9IHJhdGlvc1tpXSAtIHJhdGlvc1tpLTFdO1xuICAgICAgICAgICAgaWYgKGkgPT09IDEpIHtcbiAgICAgICAgICAgICAgICBsYXN0UmF0aW9EaWYgPSBjdXJyUmF0aW9EaWY7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChNYXRoLmFicyhjdXJyUmF0aW9EaWYgLSBsYXN0UmF0aW9EaWYpID4gRVBTSUxPTikge1xuICAgICAgICAgICAgICAgIGNhbk9wdGltaXplID0gZmFsc2U7ICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY3VydmUuX2ZpbmRGcmFtZUluZGV4ID0gY2FuT3B0aW1pemUgPyBxdWlja0ZpbmRJbmRleCA6IGJpbmFyeVNlYXJjaDtcblxuICAgICAgICAvLyBmaW5kIHRoZSBsZXJwIGZ1bmN0aW9uXG4gICAgICAgIGxldCBmaXJzdFZhbHVlID0gY3VydmUudmFsdWVzWzBdO1xuICAgICAgICBpZiAoZmlyc3RWYWx1ZSAhPT0gdW5kZWZpbmVkICYmIGZpcnN0VmFsdWUgIT09IG51bGwgJiYgIWN1cnZlLl9sZXJwKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGZpcnN0VmFsdWUgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICAgICAgY3VydmUuX2xlcnAgPSBEeW5hbWljQW5pbUN1cnZlLnByb3RvdHlwZS5fbGVycE51bWJlcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGZpcnN0VmFsdWUgaW5zdGFuY2VvZiBjYy5RdWF0KSB7XG4gICAgICAgICAgICAgICAgY3VydmUuX2xlcnAgPSBEeW5hbWljQW5pbUN1cnZlLnByb3RvdHlwZS5fbGVycFF1YXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChmaXJzdFZhbHVlIGluc3RhbmNlb2YgY2MuVmVjMikge1xuICAgICAgICAgICAgICAgIGN1cnZlLl9sZXJwID0gRHluYW1pY0FuaW1DdXJ2ZS5wcm90b3R5cGUuX2xlcnBWZWN0b3IyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoZmlyc3RWYWx1ZSBpbnN0YW5jZW9mIGNjLlZlYzMpIHtcbiAgICAgICAgICAgICAgICBjdXJ2ZS5fbGVycCA9IER5bmFtaWNBbmltQ3VydmUucHJvdG90eXBlLl9sZXJwVmVjdG9yMztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGZpcnN0VmFsdWUubGVycCkge1xuICAgICAgICAgICAgICAgIGN1cnZlLl9sZXJwID0gRHluYW1pY0FuaW1DdXJ2ZS5wcm90b3R5cGUuX2xlcnBPYmplY3Q7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY3VydmU7XG4gICAgfSxcblxuICAgIGNyZWF0ZVRhcmdldEN1cnZlcyAodGFyZ2V0LCBjdXJ2ZURhdGEsIGN1cnZlcykge1xuICAgICAgICBsZXQgcHJvcHNEYXRhID0gY3VydmVEYXRhLnByb3BzO1xuICAgICAgICBsZXQgY29tcHNEYXRhID0gY3VydmVEYXRhLmNvbXBzO1xuXG4gICAgICAgIGlmIChwcm9wc0RhdGEpIHtcbiAgICAgICAgICAgIGZvciAobGV0IHByb3BQYXRoIGluIHByb3BzRGF0YSkge1xuICAgICAgICAgICAgICAgIGxldCBkYXRhID0gcHJvcHNEYXRhW3Byb3BQYXRoXTtcbiAgICAgICAgICAgICAgICBsZXQgY3VydmUgPSB0aGlzLmNyZWF0ZVByb3BDdXJ2ZSh0YXJnZXQsIHByb3BQYXRoLCBkYXRhKTtcblxuICAgICAgICAgICAgICAgIGN1cnZlcy5wdXNoKGN1cnZlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjb21wc0RhdGEpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGNvbXBOYW1lIGluIGNvbXBzRGF0YSkge1xuICAgICAgICAgICAgICAgIGxldCBjb21wID0gdGFyZ2V0LmdldENvbXBvbmVudChjb21wTmFtZSk7XG5cbiAgICAgICAgICAgICAgICBpZiAoIWNvbXApIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbGV0IGNvbXBEYXRhID0gY29tcHNEYXRhW2NvbXBOYW1lXTtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBwcm9wUGF0aCBpbiBjb21wRGF0YSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgZGF0YSA9IGNvbXBEYXRhW3Byb3BQYXRoXTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGN1cnZlID0gdGhpcy5jcmVhdGVQcm9wQ3VydmUoY29tcCwgcHJvcFBhdGgsIGRhdGEpO1xuXG4gICAgICAgICAgICAgICAgICAgIGN1cnZlcy5wdXNoKGN1cnZlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgY3JlYXRlQ3VydmVzIChzdGF0ZSwgcm9vdCkge1xuICAgICAgICBsZXQgY3VydmVEYXRhID0gdGhpcy5jdXJ2ZURhdGE7XG4gICAgICAgIGxldCBjaGlsZHJlbkN1cnZlRGF0YXMgPSBjdXJ2ZURhdGEucGF0aHM7XG4gICAgICAgIGxldCBjdXJ2ZXMgPSBbXTtcblxuICAgICAgICB0aGlzLmNyZWF0ZVRhcmdldEN1cnZlcyhyb290LCBjdXJ2ZURhdGEsIGN1cnZlcyk7XG5cbiAgICAgICAgZm9yIChsZXQgbmFtZVBhdGggaW4gY2hpbGRyZW5DdXJ2ZURhdGFzKSB7XG4gICAgICAgICAgICBsZXQgdGFyZ2V0ID0gY2MuZmluZChuYW1lUGF0aCwgcm9vdCk7XG5cbiAgICAgICAgICAgIGlmICghdGFyZ2V0KSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCBjaGlsZEN1cnZlRGF0YXMgPSBjaGlsZHJlbkN1cnZlRGF0YXNbbmFtZVBhdGhdO1xuICAgICAgICAgICAgdGhpcy5jcmVhdGVUYXJnZXRDdXJ2ZXModGFyZ2V0LCBjaGlsZEN1cnZlRGF0YXMsIGN1cnZlcyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY3VydmVzO1xuICAgIH1cbn0pO1xuXG5jYy5BbmltYXRpb25DbGlwID0gbW9kdWxlLmV4cG9ydHMgPSBBbmltYXRpb25DbGlwO1xuIl0sInNvdXJjZVJvb3QiOiIvIn0=