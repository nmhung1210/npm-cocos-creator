
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'engine-dev/cocos2d/core/components/CCCanvas.js';
                    var __require = nodeEnv ? function (request) {
                        return require(request);
                    } : function (request) {
                        return __quick_compile_engine__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_engine__.registerModule(__filename, module);}"use strict";

/****************************************************************************
 Copyright (c) 2013-2016 Chukong Technologies Inc.
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
var Camera = require('../camera/CCCamera');

var Component = require('./CCComponent'); // Screen adaptation strategy for Canvas + Widget


function resetWidgetComponent(canvas) {
  var widget = canvas.node.getComponent(cc.Widget);

  if (!widget) {
    widget = canvas.node.addComponent(cc.Widget);
  }

  widget.isAlignTop = true;
  widget.isAlignBottom = true;
  widget.isAlignLeft = true;
  widget.isAlignRight = true;
  widget.top = 0;
  widget.bottom = 0;
  widget.left = 0;
  widget.right = 0;
}
/**
 * !#zh: 作为 UI 根节点，为所有子节点提供视窗四边的位置信息以供对齐，另外提供屏幕适配策略接口，方便从编辑器设置。
 * 注：由于本节点的尺寸会跟随屏幕拉伸，所以 anchorPoint 只支持 (0.5, 0.5)，否则适配不同屏幕时坐标会有偏差。
 *
 * @class Canvas
 * @extends Component
 */


var Canvas = cc.Class({
  name: 'cc.Canvas',
  "extends": Component,
  editor: CC_EDITOR && {
    menu: 'i18n:MAIN_MENU.component.ui/Canvas',
    help: 'i18n:COMPONENT.help_url.canvas',
    executeInEditMode: true,
    disallowMultiple: true
  },
  resetInEditor: CC_EDITOR && function () {
    _Scene._applyCanvasPreferences(this);

    resetWidgetComponent(this);
  },
  statics: {
    /**
     * !#en Current active canvas, the scene should only have one active canvas at the same time.
     * !#zh 当前激活的画布组件，场景同一时间只能有一个激活的画布。
     * @property {Canvas} instance
     * @static
     */
    instance: null
  },
  properties: {
    /**
     * !#en The desigin resolution for current scene.
     * !#zh 当前场景设计分辨率。
     * @property {Size} designResolution
     * @default new cc.Size(960, 640)
     */
    _designResolution: cc.size(960, 640),
    designResolution: {
      get: function get() {
        return cc.size(this._designResolution);
      },
      set: function set(value) {
        this._designResolution.width = value.width;
        this._designResolution.height = value.height;
        this.applySettings();
      },
      tooltip: CC_DEV && 'i18n:COMPONENT.canvas.design_resolution'
    },
    _fitWidth: false,
    _fitHeight: true,

    /**
     * !#en TODO
     * !#zh: 是否优先将设计分辨率高度撑满视图高度。
     * @property {Boolean} fitHeight
     * @default false
     */
    fitHeight: {
      get: function get() {
        return this._fitHeight;
      },
      set: function set(value) {
        if (this._fitHeight !== value) {
          this._fitHeight = value;
          this.applySettings();
        }
      },
      tooltip: CC_DEV && 'i18n:COMPONENT.canvas.fit_height'
    },

    /**
     * !#en TODO
     * !#zh: 是否优先将设计分辨率宽度撑满视图宽度。
     * @property {Boolean} fitWidth
     * @default false
     */
    fitWidth: {
      get: function get() {
        return this._fitWidth;
      },
      set: function set(value) {
        if (this._fitWidth !== value) {
          this._fitWidth = value;
          this.applySettings();
        }
      },
      tooltip: CC_DEV && 'i18n:COMPONENT.canvas.fit_width'
    }
  },
  // fit canvas node to design resolution
  _fitDesignResolution: CC_EDITOR && function () {
    // TODO: support paddings of locked widget
    var designSize = cc.engine.getDesignResolutionSize();
    this.node.setPosition(designSize.width * 0.5, designSize.height * 0.5);
    this.node.setContentSize(designSize);
  },
  __preload: function __preload() {
    if (CC_DEV) {
      var Flags = cc.Object.Flags;
      this._objFlags |= Flags.IsPositionLocked | Flags.IsAnchorLocked | Flags.IsSizeLocked;
    }

    if (Canvas.instance) {
      return cc.warnID(6700, this.node.name, Canvas.instance.node.name);
    }

    Canvas.instance = this; // Align node to fit the screen

    this.applySettings(); // Stretch to matched size during the scene initialization

    var widget = this.getComponent(cc.Widget);

    if (widget) {
      widget.updateAlignment();
    } else if (CC_EDITOR) {
      this._fitDesignResolution();
    } // Constantly align canvas node in edit mode


    if (CC_EDITOR) {
      cc.director.on(cc.Director.EVENT_AFTER_UPDATE, this._fitDesignResolution, this);
      cc.engine.on('design-resolution-changed', this._fitDesignResolution, this);
    }
  },
  start: function start() {
    if (!Camera.main && cc.game.renderType !== cc.game.RENDER_TYPE_CANVAS) {
      // Create default Main Camera
      var cameraNode = new cc.Node('Main Camera');
      cameraNode.parent = this.node;
      cameraNode.setSiblingIndex(0);
      var camera = cameraNode.addComponent(Camera);
      var ClearFlags = Camera.ClearFlags;
      camera.clearFlags = ClearFlags.COLOR | ClearFlags.DEPTH | ClearFlags.STENCIL;
      camera.depth = -1;
    }
  },
  onDestroy: function onDestroy() {
    if (CC_EDITOR) {
      cc.director.off(cc.Director.EVENT_AFTER_UPDATE, this._fitDesignResolution, this);
      cc.engine.off('design-resolution-changed', this._fitDesignResolution, this);
    }

    if (Canvas.instance === this) {
      Canvas.instance = null;
    }
  },
  applySettings: function applySettings() {
    var ResolutionPolicy = cc.ResolutionPolicy;
    var policy;

    if (this.fitHeight && this.fitWidth) {
      policy = ResolutionPolicy.SHOW_ALL;
    } else if (!this.fitHeight && !this.fitWidth) {
      policy = ResolutionPolicy.NO_BORDER;
    } else if (this.fitWidth) {
      policy = ResolutionPolicy.FIXED_WIDTH;
    } else {
      // fitHeight
      policy = ResolutionPolicy.FIXED_HEIGHT;
    }

    var designRes = this._designResolution;

    if (CC_EDITOR) {
      cc.engine.setDesignResolutionSize(designRes.width, designRes.height);
    } else {
      cc.view.setDesignResolutionSize(designRes.width, designRes.height, policy);
    }
  }
});
cc.Canvas = module.exports = Canvas;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVuZ2luZS1kZXYvY29jb3MyZC9jb3JlL2NvbXBvbmVudHMvQ0NDYW52YXMuanMiXSwibmFtZXMiOlsiQ2FtZXJhIiwicmVxdWlyZSIsIkNvbXBvbmVudCIsInJlc2V0V2lkZ2V0Q29tcG9uZW50IiwiY2FudmFzIiwid2lkZ2V0Iiwibm9kZSIsImdldENvbXBvbmVudCIsImNjIiwiV2lkZ2V0IiwiYWRkQ29tcG9uZW50IiwiaXNBbGlnblRvcCIsImlzQWxpZ25Cb3R0b20iLCJpc0FsaWduTGVmdCIsImlzQWxpZ25SaWdodCIsInRvcCIsImJvdHRvbSIsImxlZnQiLCJyaWdodCIsIkNhbnZhcyIsIkNsYXNzIiwibmFtZSIsImVkaXRvciIsIkNDX0VESVRPUiIsIm1lbnUiLCJoZWxwIiwiZXhlY3V0ZUluRWRpdE1vZGUiLCJkaXNhbGxvd011bHRpcGxlIiwicmVzZXRJbkVkaXRvciIsIl9TY2VuZSIsIl9hcHBseUNhbnZhc1ByZWZlcmVuY2VzIiwic3RhdGljcyIsImluc3RhbmNlIiwicHJvcGVydGllcyIsIl9kZXNpZ25SZXNvbHV0aW9uIiwic2l6ZSIsImRlc2lnblJlc29sdXRpb24iLCJnZXQiLCJzZXQiLCJ2YWx1ZSIsIndpZHRoIiwiaGVpZ2h0IiwiYXBwbHlTZXR0aW5ncyIsInRvb2x0aXAiLCJDQ19ERVYiLCJfZml0V2lkdGgiLCJfZml0SGVpZ2h0IiwiZml0SGVpZ2h0IiwiZml0V2lkdGgiLCJfZml0RGVzaWduUmVzb2x1dGlvbiIsImRlc2lnblNpemUiLCJlbmdpbmUiLCJnZXREZXNpZ25SZXNvbHV0aW9uU2l6ZSIsInNldFBvc2l0aW9uIiwic2V0Q29udGVudFNpemUiLCJfX3ByZWxvYWQiLCJGbGFncyIsIk9iamVjdCIsIl9vYmpGbGFncyIsIklzUG9zaXRpb25Mb2NrZWQiLCJJc0FuY2hvckxvY2tlZCIsIklzU2l6ZUxvY2tlZCIsIndhcm5JRCIsInVwZGF0ZUFsaWdubWVudCIsImRpcmVjdG9yIiwib24iLCJEaXJlY3RvciIsIkVWRU5UX0FGVEVSX1VQREFURSIsInN0YXJ0IiwibWFpbiIsImdhbWUiLCJyZW5kZXJUeXBlIiwiUkVOREVSX1RZUEVfQ0FOVkFTIiwiY2FtZXJhTm9kZSIsIk5vZGUiLCJwYXJlbnQiLCJzZXRTaWJsaW5nSW5kZXgiLCJjYW1lcmEiLCJDbGVhckZsYWdzIiwiY2xlYXJGbGFncyIsIkNPTE9SIiwiREVQVEgiLCJTVEVOQ0lMIiwiZGVwdGgiLCJvbkRlc3Ryb3kiLCJvZmYiLCJSZXNvbHV0aW9uUG9saWN5IiwicG9saWN5IiwiU0hPV19BTEwiLCJOT19CT1JERVIiLCJGSVhFRF9XSURUSCIsIkZJWEVEX0hFSUdIVCIsImRlc2lnblJlcyIsInNldERlc2lnblJlc29sdXRpb25TaXplIiwidmlldyIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTBCQSxJQUFJQSxNQUFNLEdBQUdDLE9BQU8sQ0FBQyxvQkFBRCxDQUFwQjs7QUFDQSxJQUFJQyxTQUFTLEdBQUdELE9BQU8sQ0FBQyxlQUFELENBQXZCLEVBRUE7OztBQUNBLFNBQVNFLG9CQUFULENBQStCQyxNQUEvQixFQUF1QztBQUNuQyxNQUFJQyxNQUFNLEdBQUdELE1BQU0sQ0FBQ0UsSUFBUCxDQUFZQyxZQUFaLENBQXlCQyxFQUFFLENBQUNDLE1BQTVCLENBQWI7O0FBQ0EsTUFBSSxDQUFDSixNQUFMLEVBQWE7QUFDVEEsSUFBQUEsTUFBTSxHQUFHRCxNQUFNLENBQUNFLElBQVAsQ0FBWUksWUFBWixDQUF5QkYsRUFBRSxDQUFDQyxNQUE1QixDQUFUO0FBQ0g7O0FBQ0RKLEVBQUFBLE1BQU0sQ0FBQ00sVUFBUCxHQUFvQixJQUFwQjtBQUNBTixFQUFBQSxNQUFNLENBQUNPLGFBQVAsR0FBdUIsSUFBdkI7QUFDQVAsRUFBQUEsTUFBTSxDQUFDUSxXQUFQLEdBQXFCLElBQXJCO0FBQ0FSLEVBQUFBLE1BQU0sQ0FBQ1MsWUFBUCxHQUFzQixJQUF0QjtBQUNBVCxFQUFBQSxNQUFN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ZXNDb250ZW50IjpbIi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gQ29weXJpZ2h0IChjKSAyMDEzLTIwMTYgQ2h1a29uZyBUZWNobm9sb2dpZXMgSW5jLlxuIENvcHlyaWdodCAoYykgMjAxNy0yMDE4IFhpYW1lbiBZYWppIFNvZnR3YXJlIENvLiwgTHRkLlxuXG4gaHR0cHM6Ly93d3cuY29jb3MuY29tL1xuXG4gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZW5naW5lIHNvdXJjZSBjb2RlICh0aGUgXCJTb2Z0d2FyZVwiKSwgYSBsaW1pdGVkLFxuICB3b3JsZHdpZGUsIHJveWFsdHktZnJlZSwgbm9uLWFzc2lnbmFibGUsIHJldm9jYWJsZSBhbmQgbm9uLWV4Y2x1c2l2ZSBsaWNlbnNlXG4gdG8gdXNlIENvY29zIENyZWF0b3Igc29sZWx5IHRvIGRldmVsb3AgZ2FtZXMgb24geW91ciB0YXJnZXQgcGxhdGZvcm1zLiBZb3Ugc2hhbGxcbiAgbm90IHVzZSBDb2NvcyBDcmVhdG9yIHNvZnR3YXJlIGZvciBkZXZlbG9waW5nIG90aGVyIHNvZnR3YXJlIG9yIHRvb2xzIHRoYXQnc1xuICB1c2VkIGZvciBkZXZlbG9waW5nIGdhbWVzLiBZb3UgYXJlIG5vdCBncmFudGVkIHRvIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsXG4gIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiBDb2NvcyBDcmVhdG9yLlxuXG4gVGhlIHNvZnR3YXJlIG9yIHRvb2xzIGluIHRoaXMgTGljZW5zZSBBZ3JlZW1lbnQgYXJlIGxpY2Vuc2VkLCBub3Qgc29sZC5cbiBYaWFtZW4gWWFqaSBTb2Z0d2FyZSBDby4sIEx0ZC4gcmVzZXJ2ZXMgYWxsIHJpZ2h0cyBub3QgZXhwcmVzc2x5IGdyYW50ZWQgdG8geW91LlxuXG4gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbiBUSEUgU09GVFdBUkUuXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxudmFyIENhbWVyYSA9IHJlcXVpcmUoJy4uL2NhbWVyYS9DQ0NhbWVyYScpO1xudmFyIENvbXBvbmVudCA9IHJlcXVpcmUoJy4vQ0NDb21wb25lbnQnKTtcblxuLy8gU2NyZWVuIGFkYXB0YXRpb24gc3RyYXRlZ3kgZm9yIENhbnZhcyArIFdpZGdldFxuZnVuY3Rpb24gcmVzZXRXaWRnZXRDb21wb25lbnQgKGNhbnZhcykge1xuICAgIGxldCB3aWRnZXQgPSBjYW52YXMubm9kZS5nZXRDb21wb25lbnQoY2MuV2lkZ2V0KTtcbiAgICBpZiAoIXdpZGdldCkge1xuICAgICAgICB3aWRnZXQgPSBjYW52YXMubm9kZS5hZGRDb21wb25lbnQoY2MuV2lkZ2V0KTtcbiAgICB9XG4gICAgd2lkZ2V0LmlzQWxpZ25Ub3AgPSB0cnVlO1xuICAgIHdpZGdldC5pc0FsaWduQm90dG9tID0gdHJ1ZTtcbiAgICB3aWRnZXQuaXNBbGlnbkxlZnQgPSB0cnVlO1xuICAgIHdpZGdldC5pc0FsaWduUmlnaHQgPSB0cnVlO1xuICAgIHdpZGdldC50b3AgPSAwO1xuICAgIHdpZGdldC5ib3R0b20gPSAwO1xuICAgIHdpZGdldC5sZWZ0ID0gMDtcbiAgICB3aWRnZXQucmlnaHQgPSAwO1xufVxuXG4vKipcbiAqICEjemg6IOS9nOS4uiBVSSDmoLnoioLngrnvvIzkuLrmiYDmnInlrZDoioLngrnmj5Dkvpvop4bnqpflm5vovrnnmoTkvY3nva7kv6Hmga/ku6Xkvpvlr7npvZDvvIzlj6blpJbmj5DkvpvlsY/luZXpgILphY3nrZbnlaXmjqXlj6PvvIzmlrnkvr/ku47nvJbovpHlmajorr7nva7jgIJcbiAqIOazqO+8mueUseS6juacrOiKgueCueeahOWwuuWvuOS8mui3n+maj+Wxj+W5leaLieS8uO+8jOaJgOS7pSBhbmNob3JQb2ludCDlj6rmlK/mjIEgKDAuNSwgMC41Ke+8jOWQpuWImemAgumFjeS4jeWQjOWxj+W5leaXtuWdkOagh+S8muacieWBj+W3ruOAglxuICpcbiAqIEBjbGFzcyBDYW52YXNcbiAqIEBleHRlbmRzIENvbXBvbmVudFxuICovXG52YXIgQ2FudmFzID0gY2MuQ2xhc3Moe1xuICAgIG5hbWU6ICdjYy5DYW52YXMnLFxuICAgIGV4dGVuZHM6IENvbXBvbmVudCxcblxuICAgIGVkaXRvcjogQ0NfRURJVE9SICYmIHtcbiAgICAgICAgbWVudTogJ2kxOG46TUFJTl9NRU5VLmNvbXBvbmVudC51aS9DYW52YXMnLFxuICAgICAgICBoZWxwOiAnaTE4bjpDT01QT05FTlQuaGVscF91cmwuY2FudmFzJyxcbiAgICAgICAgZXhlY3V0ZUluRWRpdE1vZGU6IHRydWUsXG4gICAgICAgIGRpc2FsbG93TXVsdGlwbGU6IHRydWUsXG4gICAgfSxcblxuICAgIHJlc2V0SW5FZGl0b3I6IENDX0VESVRPUiAmJiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIF9TY2VuZS5fYXBwbHlDYW52YXNQcmVmZXJlbmNlcyh0aGlzKTtcbiAgICAgICAgcmVzZXRXaWRnZXRDb21wb25lbnQodGhpcyk7XG4gICAgfSxcblxuICAgIHN0YXRpY3M6IHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqICEjZW4gQ3VycmVudCBhY3RpdmUgY2FudmFzLCB0aGUgc2NlbmUgc2hvdWxkIG9ubHkgaGF2ZSBvbmUgYWN0aXZlIGNhbnZhcyBhdCB0aGUgc2FtZSB0aW1lLlxuICAgICAgICAgKiAhI3poIOW9k+WJjea/gOa0u+eahOeUu+W4g+e7hOS7tu+8jOWcuuaZr+WQjOS4gOaXtumXtOWPquiDveacieS4gOS4qua/gOa0u+eahOeUu+W4g+OAglxuICAgICAgICAgKiBAcHJvcGVydHkge0NhbnZhc30gaW5zdGFuY2VcbiAgICAgICAgICogQHN0YXRpY1xuICAgICAgICAgKi9cbiAgICAgICAgaW5zdGFuY2U6IG51bGxcbiAgICB9LFxuXG4gICAgcHJvcGVydGllczoge1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiAhI2VuIFRoZSBkZXNpZ2luIHJlc29sdXRpb24gZm9yIGN1cnJlbnQgc2NlbmUuXG4gICAgICAgICAqICEjemgg5b2T5YmN5Zy65pmv6K6+6K6h5YiG6L6o546H44CCXG4gICAgICAgICAqIEBwcm9wZXJ0eSB7U2l6ZX0gZGVzaWduUmVzb2x1dGlvblxuICAgICAgICAgKiBAZGVmYXVsdCBuZXcgY2MuU2l6ZSg5NjAsIDY0MClcbiAgICAgICAgICovXG4gICAgICAgIF9kZXNpZ25SZXNvbHV0aW9uOiBjYy5zaXplKDk2MCwgNjQwKSxcbiAgICAgICAgZGVzaWduUmVzb2x1dGlvbjoge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNjLnNpemUodGhpcy5fZGVzaWduUmVzb2x1dGlvbik7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9kZXNpZ25SZXNvbHV0aW9uLndpZHRoID0gdmFsdWUud2lkdGg7XG4gICAgICAgICAgICAgICAgdGhpcy5fZGVzaWduUmVzb2x1dGlvbi5oZWlnaHQgPSB2YWx1ZS5oZWlnaHQ7XG4gICAgICAgICAgICAgICAgdGhpcy5hcHBseVNldHRpbmdzKCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdG9vbHRpcDogQ0NfREVWICYmICdpMThuOkNPTVBPTkVOVC5jYW52YXMuZGVzaWduX3Jlc29sdXRpb24nXG4gICAgICAgIH0sXG5cbiAgICAgICAgX2ZpdFdpZHRoOiBmYWxzZSxcbiAgICAgICAgX2ZpdEhlaWdodDogdHJ1ZSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogISNlbiBUT0RPXG4gICAgICAgICAqICEjemg6IOaYr+WQpuS8mOWFiOWwhuiuvuiuoeWIhui+qOeOh+mrmOW6puaSkea7oeinhuWbvumrmOW6puOAglxuICAgICAgICAgKiBAcHJvcGVydHkge0Jvb2xlYW59IGZpdEhlaWdodFxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICAgICAgZml0SGVpZ2h0OiB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fZml0SGVpZ2h0O1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX2ZpdEhlaWdodCAhPT0gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZml0SGVpZ2h0ID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYXBwbHlTZXR0aW5ncygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0b29sdGlwOiBDQ19ERVYgJiYgJ2kxOG46Q09NUE9ORU5ULmNhbnZhcy5maXRfaGVpZ2h0J1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiAhI2VuIFRPRE9cbiAgICAgICAgICogISN6aDog5piv5ZCm5LyY5YWI5bCG6K6+6K6h5YiG6L6o546H5a695bqm5pKR5ruh6KeG5Zu+5a695bqm44CCXG4gICAgICAgICAqIEBwcm9wZXJ0eSB7Qm9vbGVhbn0gZml0V2lkdGhcbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgICAgIGZpdFdpZHRoOiB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fZml0V2lkdGg7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fZml0V2lkdGggIT09IHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2ZpdFdpZHRoID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYXBwbHlTZXR0aW5ncygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0b29sdGlwOiBDQ19ERVYgJiYgJ2kxOG46Q09NUE9ORU5ULmNhbnZhcy5maXRfd2lkdGgnXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gZml0IGNhbnZhcyBub2RlIHRvIGRlc2lnbiByZXNvbHV0aW9uXG4gICAgX2ZpdERlc2lnblJlc29sdXRpb246IENDX0VESVRPUiAmJiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIFRPRE86IHN1cHBvcnQgcGFkZGluZ3Mgb2YgbG9ja2VkIHdpZGdldFxuICAgICAgICB2YXIgZGVzaWduU2l6ZSA9IGNjLmVuZ2luZS5nZXREZXNpZ25SZXNvbHV0aW9uU2l6ZSgpO1xuICAgICAgICB0aGlzLm5vZGUuc2V0UG9zaXRpb24oZGVzaWduU2l6ZS53aWR0aCAqIDAuNSwgZGVzaWduU2l6ZS5oZWlnaHQgKiAwLjUpO1xuICAgICAgICB0aGlzLm5vZGUuc2V0Q29udGVudFNpemUoZGVzaWduU2l6ZSk7XG4gICAgfSxcblxuICAgIF9fcHJlbG9hZDogZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoQ0NfREVWKSB7XG4gICAgICAgICAgICB2YXIgRmxhZ3MgPSBjYy5PYmplY3QuRmxhZ3M7XG4gICAgICAgICAgICB0aGlzLl9vYmpGbGFncyB8PSAoRmxhZ3MuSXNQb3NpdGlvbkxvY2tlZCB8IEZsYWdzLklzQW5jaG9yTG9ja2VkIHwgRmxhZ3MuSXNTaXplTG9ja2VkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChDYW52YXMuaW5zdGFuY2UpIHtcbiAgICAgICAgICAgIHJldHVybiBjYy53YXJuSUQoNjcwMCxcbiAgICAgICAgICAgICAgICB0aGlzLm5vZGUubmFtZSwgQ2FudmFzLmluc3RhbmNlLm5vZGUubmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgQ2FudmFzLmluc3RhbmNlID0gdGhpcztcblxuICAgICAgICAvLyBBbGlnbiBub2RlIHRvIGZpdCB0aGUgc2NyZWVuXG4gICAgICAgIHRoaXMuYXBwbHlTZXR0aW5ncygpO1xuXG4gICAgICAgIC8vIFN0cmV0Y2ggdG8gbWF0Y2hlZCBzaXplIGR1cmluZyB0aGUgc2NlbmUgaW5pdGlhbGl6YXRpb25cbiAgICAgICAgbGV0IHdpZGdldCA9IHRoaXMuZ2V0Q29tcG9uZW50KGNjLldpZGdldCk7XG4gICAgICAgIGlmICh3aWRnZXQpIHtcbiAgICAgICAgICAgIHdpZGdldC51cGRhdGVBbGlnbm1lbnQoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChDQ19FRElUT1IpIHtcbiAgICAgICAgICAgIHRoaXMuX2ZpdERlc2lnblJlc29sdXRpb24oKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENvbnN0YW50bHkgYWxpZ24gY2FudmFzIG5vZGUgaW4gZWRpdCBtb2RlXG4gICAgICAgIGlmIChDQ19FRElUT1IpIHtcbiAgICAgICAgICAgIGNjLmRpcmVjdG9yLm9uKGNjLkRpcmVjdG9yLkVWRU5UX0FGVEVSX1VQREFURSwgdGhpcy5fZml0RGVzaWduUmVzb2x1dGlvbiwgdGhpcyk7XG4gICAgICAgICAgICBjYy5lbmdpbmUub24oJ2Rlc2lnbi1yZXNvbHV0aW9uLWNoYW5nZWQnLCB0aGlzLl9maXREZXNpZ25SZXNvbHV0aW9uLCB0aGlzKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBzdGFydCAoKSB7XG4gICAgICAgIGlmICghQ2FtZXJhLm1haW4gJiYgY2MuZ2FtZS5yZW5kZXJUeXBlICE9PSBjYy5nYW1lLlJFTkRFUl9UWVBFX0NBTlZBUykge1xuICAgICAgICAgICAgLy8gQ3JlYXRlIGRlZmF1bHQgTWFpbiBDYW1lcmFcbiAgICAgICAgICAgIGxldCBjYW1lcmFOb2RlID0gbmV3IGNjLk5vZGUoJ01haW4gQ2FtZXJhJyk7XG4gICAgICAgICAgICBjYW1lcmFOb2RlLnBhcmVudCA9IHRoaXMubm9kZTtcbiAgICAgICAgICAgIGNhbWVyYU5vZGUuc2V0U2libGluZ0luZGV4KDApO1xuXG4gICAgICAgICAgICBsZXQgY2FtZXJhID0gY2FtZXJhTm9kZS5hZGRDb21wb25lbnQoQ2FtZXJhKTtcbiAgICAgICAgICAgIGxldCBDbGVhckZsYWdzID0gQ2FtZXJhLkNsZWFyRmxhZ3M7XG4gICAgICAgICAgICBjYW1lcmEuY2xlYXJGbGFncyA9IENsZWFyRmxhZ3MuQ09MT1IgfCBDbGVhckZsYWdzLkRFUFRIIHwgQ2xlYXJGbGFncy5TVEVOQ0lMO1xuICAgICAgICAgICAgY2FtZXJhLmRlcHRoID0gLTE7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgb25EZXN0cm95OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmIChDQ19FRElUT1IpIHtcbiAgICAgICAgICAgIGNjLmRpcmVjdG9yLm9mZihjYy5EaXJlY3Rvci5FVkVOVF9BRlRFUl9VUERBVEUsIHRoaXMuX2ZpdERlc2lnblJlc29sdXRpb24sIHRoaXMpO1xuICAgICAgICAgICAgY2MuZW5naW5lLm9mZignZGVzaWduLXJlc29sdXRpb24tY2hhbmdlZCcsIHRoaXMuX2ZpdERlc2lnblJlc29sdXRpb24sIHRoaXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKENhbnZhcy5pbnN0YW5jZSA9PT0gdGhpcykge1xuICAgICAgICAgICAgQ2FudmFzLmluc3RhbmNlID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBhcHBseVNldHRpbmdzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBSZXNvbHV0aW9uUG9saWN5ID0gY2MuUmVzb2x1dGlvblBvbGljeTtcbiAgICAgICAgdmFyIHBvbGljeTtcblxuICAgICAgICBpZiAodGhpcy5maXRIZWlnaHQgJiYgdGhpcy5maXRXaWR0aCkge1xuICAgICAgICAgICAgcG9saWN5ID0gUmVzb2x1dGlvblBvbGljeS5TSE9XX0FMTDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICghdGhpcy5maXRIZWlnaHQgJiYgIXRoaXMuZml0V2lkdGgpIHtcbiAgICAgICAgICAgIHBvbGljeSA9IFJlc29sdXRpb25Qb2xpY3kuTk9fQk9SREVSO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHRoaXMuZml0V2lkdGgpIHtcbiAgICAgICAgICAgIHBvbGljeSA9IFJlc29sdXRpb25Qb2xpY3kuRklYRURfV0lEVEg7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7ICAgICAgLy8gZml0SGVpZ2h0XG4gICAgICAgICAgICBwb2xpY3kgPSBSZXNvbHV0aW9uUG9saWN5LkZJWEVEX0hFSUdIVDtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBkZXNpZ25SZXMgPSB0aGlzLl9kZXNpZ25SZXNvbHV0aW9uO1xuICAgICAgICBpZiAoQ0NfRURJVE9SKSB7XG4gICAgICAgICAgICBjYy5lbmdpbmUuc2V0RGVzaWduUmVzb2x1dGlvblNpemUoZGVzaWduUmVzLndpZHRoLCBkZXNpZ25SZXMuaGVpZ2h0KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNjLnZpZXcuc2V0RGVzaWduUmVzb2x1dGlvblNpemUoZGVzaWduUmVzLndpZHRoLCBkZXNpZ25SZXMuaGVpZ2h0LCBwb2xpY3kpO1xuICAgICAgICB9XG4gICAgfVxufSk7XG5cblxuY2MuQ2FudmFzID0gbW9kdWxlLmV4cG9ydHMgPSBDYW52YXM7XG4iXSwic291cmNlUm9vdCI6Ii8ifQ==