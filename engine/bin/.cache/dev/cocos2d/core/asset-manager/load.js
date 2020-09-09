
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'engine-dev/cocos2d/core/asset-manager/load.js';
                    var __require = nodeEnv ? function (request) {
                        return require(request);
                    } : function (request) {
                        return __quick_compile_engine__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_engine__.registerModule(__filename, module);}"use strict";

/****************************************************************************
 Copyright (c) 2019 Xiamen Yaji Software Co., Ltd.

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
var packManager = require('./pack-manager');

var Pipeline = require('./pipeline');

var parser = require('./parser');

var _require = require('./utilities'),
    getDepends = _require.getDepends,
    cache = _require.cache,
    gatherAsset = _require.gatherAsset,
    setProperties = _require.setProperties,
    forEach = _require.forEach,
    clear = _require.clear,
    checkCircleReference = _require.checkCircleReference;

var _require2 = require('./shared'),
    assets = _require2.assets,
    files = _require2.files,
    parsed = _require2.parsed,
    pipeline = _require2.pipeline;

var Task = require('./task');

function load(task, done) {
  if (!task.progress) {
    task.progress = {
      finish: 0,
      total: task.input.length
    };
  }

  var options = task.options,
      progress = task.progress;
  options.__exclude__ = options.__exclude__ || Object.create(null);
  task.output = [];
  forEach(task.input, function (item, cb) {
    var subTask = Task.create({
      input: item,
      onProgress: task.onProgress,
      options: options,
      progress: progress,
      onComplete: function onComplete(err, item) {
        if (err && !task.isFinish && !cc.assetManager.force) done(err);
        task.output.push(item);
        subTask.recycle();
        cb();
      }
    });
    loadOneAssetPipeline.async(subTask);
  }, function () {
    options.__exclude__ = null;

    if (task.isFinish) {
      clear(task, true);
      return task.dispatch('error');
    }

    gatherAsset(task);
    clear(task, true);
    done();
  });
}

var loadOneAssetPipeline = new Pipeline('loadOneAsset', [function fetch(task, done) {
  var item = task.output = task.input;
  var options = item.options,
      isNative = item.isNative,
      uuid = item.uuid,
      file = item.file;
  var reload = options.reload;
  if (file || !reload && !isNative && assets.has(uuid)) return done();
  packManager.load(item, task.options, function (err, data) {
    if (err) {
      if (cc.assetManager.force) {
        err = null;
      } else {
        cc.error(err.message, err.stack);
      }

      data = null;
    }

    item.file = data;
    done(err);
  });
}, function parse(task, done) {
  var item = task.output = task.input,
      progress = task.progress,
      exclude = task.options.__exclude__;
  var id = item.id,
      file = item.file,
      options = item.options;

  if (item.isNative) {
    parser.parse(id, file, item.ext, options, function (err, asset) {
      if (err) {
        if (!cc.assetManager.force) {
          cc.error(err.message, err.stack);
          return done(err);
        }
      }

      item.content = asset;
      task.dispatch('progress', ++progress.finish, progress.total, item);
      files.remove(id);
      parsed.remove(id);
      done();
    });
  } else {
    var uuid = item.uuid;

    if (uuid in exclude) {
      var _exclude$uuid = exclude[uuid],
          finish = _exclude$uuid.finish,
          content = _exclude$uuid.content,
          err = _exclude$uuid.err,
          callbacks = _exclude$uuid.callbacks;
      task.dispatch('progress', ++progress.finish, progress.total, item);

      if (finish || checkCircleReference(uuid, uuid, exclude)) {
        content && content.addRef();
        item.content = content;
        done(err);
      } else {
        callbacks.push({
          done: done,
          item: item
        });
      }
    } else {
      if (!options.reload && assets.has(uuid)) {
        var asset = assets.get(uuid);

        if (options.__asyncLoadAssets__ || !asset.__asyncLoadAssets__) {
          item.content = asset.addRef();
          task.dispatch('progress', ++progress.finish, progress.total, item);
          done();
        } else {
          loadDepends(task, asset, done, false);
        }
      } else {
        parser.parse(id, file, 'import', options, function (err, asset) {
          if (err) {
            if (cc.assetManager.force) {
              err = null;
            } else {
              cc.error(err.message, err.stack);
            }

            return done(err);
          }

          asset._uuid = uuid;
          loadDepends(task, asset, done, true);
        });
      }
    }
  }
}]);

function loadDepends(task, asset, done, init) {
  var item = task.input,
      progress = task.progress;
  var uuid = item.uuid,
      id = item.id,
      options = item.options,
      config = item.config;
  var __asyncLoadAssets__ = options.__asyncLoadAssets__,
      cacheAsset = options.cacheAsset;
  var depends = []; // add reference avoid being released during loading dependencies

  asset.addRef && asset.addRef();
  getDepends(uuid, asset, Object.create(null), depends, false, __asyncLoadAssets__, config);
  task.dispatch('progress', ++progress.finish, progress.total += depends.length, item);
  var repeatItem = task.options.__exclude__[uuid] = {
    content: asset,
    finish: false,
    callbacks: [{
      done: done,
      item: item
    }]
  };
  var subTask = Task.create({
    input: depends,
    options: task.options,
    onProgress: task.onProgress,
    onError: Task.prototype.recycle,
    progress: progress,
    onComplete: function onComplete(err) {
      asset.decRef && asset.decRef(false);
      asset.__asyncLoadAssets__ = __asyncLoadAssets__;
      repeatItem.finish = true;
      repeatItem.err = err;

      if (!err) {
        var assets = Array.isArray(subTask.output) ? subTask.output : [subTask.output];
        var map = Object.create(null);

        for (var _i = 0, _l = assets.length; _i < _l; _i++) {
          var dependAsset = assets[_i];
          dependAsset && (map[dependAsset instanceof cc.Asset ? dependAsset._uuid + '@import' : uuid + '@native'] = dependAsset);
        }

        if (!init) {
          if (asset.__nativeDepend__ && !asset._nativeAsset) {
            var missingAsset = setProperties(uuid, asset, map);

            if (!missingAsset) {
              try {
                asset.onLoad && asset.onLoad();
              } catch (e) {
                cc.error(e.message, e.stack);
              }
            }
          }
        } else {
          var missingAsset = setProperties(uuid, asset, map);

          if (!missingAsset) {
            try {
              asset.onLoad && asset.onLoad();
            } catch (e) {
              cc.error(e.message, e.stack);
            }
          }

          files.remove(id);
          parsed.remove(id);
          cache(uuid, asset, cacheAsset !== undefined ? cacheAsset : cc.assetManager.cacheAsset);
        }

        subTask.recycle();
      }

      var callbacks = repeatItem.callbacks;

      for (var i = 0, l = callbacks.length; i < l; i++) {
        var cb = callbacks[i];
        asset.addRef && asset.addRef();
        cb.item.content = asset;
        cb.done(err);
      }

      callbacks.length = 0;
    }
  });
  pipeline.async(subTask);
}

module.exports = load;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVuZ2luZS1kZXYvY29jb3MyZC9jb3JlL2Fzc2V0LW1hbmFnZXIvbG9hZC5qcyJdLCJuYW1lcyI6WyJwYWNrTWFuYWdlciIsInJlcXVpcmUiLCJQaXBlbGluZSIsInBhcnNlciIsImdldERlcGVuZHMiLCJjYWNoZSIsImdhdGhlckFzc2V0Iiwic2V0UHJvcGVydGllcyIsImZvckVhY2giLCJjbGVhciIsImNoZWNrQ2lyY2xlUmVmZXJlbmNlIiwiYXNzZXRzIiwiZmlsZXMiLCJwYXJzZWQiLCJwaXBlbGluZSIsIlRhc2siLCJsb2FkIiwidGFzayIsImRvbmUiLCJwcm9ncmVzcyIsImZpbmlzaCIsInRvdGFsIiwiaW5wdXQiLCJsZW5ndGgiLCJvcHRpb25zIiwiX19leGNsdWRlX18iLCJPYmplY3QiLCJjcmVhdGUiLCJvdXRwdXQiLCJpdGVtIiwiY2IiLCJzdWJUYXNrIiwib25Qcm9ncmVzcyIsIm9uQ29tcGxldGUiLCJlcnIiLCJpc0ZpbmlzaCIsImNjIiwiYXNzZXRNYW5hZ2VyIiwiZm9yY2UiLCJwdXNoIiwicmVjeWNsZSIsImxvYWRPbmVBc3NldFBpcGVsaW5lIiwiYXN5bmMiLCJkaXNwYXRjaCIsImZldGNoIiwiaXNOYXRpdmUiLCJ1dWlkIiwiZmlsZSIsInJlbG9hZCIsImhhcyIsImRhdGEiLCJlcnJvciIsIm1lc3NhZ2UiLCJzdGFjayIsInBhcnNlIiwiZXhjbHVkZSIsImlkIiwiZXh0IiwiYXNzZXQiLCJjb250ZW50IiwicmVtb3ZlIiwiY2FsbGJhY2tzIiwiYWRkUmVmIiwiZ2V0IiwiX19hc3luY0xvYWRBc3NldHNfXyIsImxvYWREZXBlbmRzIiwiX3V1aWQiLCJpbml0IiwiY29uZmlnIiwiY2FjaGVBc3NldCIsImRlcGVuZHMiLCJyZXBlYXRJdGVtIiwib25FcnJvciIsInByb3RvdHlwZSIsImRlY1JlZiIsIkFycmF5IiwiaXNBcnJheSIsIm1hcCIsImkiLCJsIiwiZGVwZW5kQXNzZXQiLCJBc3NldCIsIl9fbmF0aXZlRGVwZW5kX18iLCJfbmF0aXZlQXNzZXQiLCJtaXNzaW5nQXNzZXQiLCJvbkxvYWQiLCJlIiwidW5kZWZpbmVkIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF3QkEsSUFBTUEsV0FBVyxHQUFHQyxPQUFPLENBQUMsZ0JBQUQsQ0FBM0I7O0FBQ0EsSUFBTUMsUUFBUSxHQUFHRCxPQUFPLENBQUMsWUFBRCxDQUF4Qjs7QUFDQSxJQUFNRSxNQUFNLEdBQUdGLE9BQU8sQ0FBQyxVQUFELENBQXRCOztlQUNnR0EsT0FBTyxDQUFDLGFBQUQ7SUFBL0ZHLHNCQUFBQTtJQUFZQyxpQkFBQUE7SUFBT0MsdUJBQUFBO0lBQWFDLHlCQUFBQTtJQUFlQyxtQkFBQUE7SUFBU0MsaUJBQUFBO0lBQU9DLGdDQUFBQTs7Z0JBQzNCVCxPQUFPLENBQUMsVUFBRDtJQUEzQ1UsbUJBQUFBO0lBQVFDLGtCQUFBQTtJQUFPQyxtQkFBQUE7SUFBUUMscUJBQUFBOztBQUMvQixJQUFNQyxJQUFJLEdBQUdkLE9BQU8sQ0FBQyxRQUFELENBQXBCOztBQUVBLFNBQVNlLElBQVQsQ0FBZUMsSUFBZixFQUFxQkMsSUFBckIsRUFBMkI7QUFFdkIsTUFBSSxDQUFDRCxJQUFJLENBQUNFLFFBQVYsRUFBb0I7QUFDaEJGLElBQUFBLElBQUksQ0FBQ0UsUUFBTCxHQUFnQjtBQUFDQyxNQUFBQSxNQUFNLEVBQUUsQ0FBVDtBQUFZQyxNQUFBQSxLQUFLLEVBQUVKLElBQUksQ0FBQ0ssS0FBTCxDQUFXQztBQUE5QixLQUFoQjtBQUNIOztBQUVELE1BQUlDLE9BQU8sR0FBR1AsSUFBSSxDQUFDTyxPQUFuQjtBQUFBLE1BQTRCTCxRQUFRLEdBQUdGLElBQUksQ0FBQ0UsUUFBNUM7QUFFQUssRUFBQUEsT0FBTyxDQUFDQyxXQUFSLEdBQXNCRCxPQUFPLENBQUNDLFdBQVIsSUFBdUJDLE1BQU0sQ0FBQ0MsTUFBUCxDQUFjLElBQWQsQ0FBN0M7QUFFQVYsRUFBQUEsSUFBSSxDQUFDVyxNQUFM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QUEsS0FBSyxDQUFDZ0QsTUFBTixDQUFhSixFQUFiO0FBQ0EzQyxVQUFBQSxNQUFNLENBQUMrQyxNQUFQLENBQWNKLEVBQWQ7QUFDQW5ELFVBQUFBLEtBQUssQ0FBQ3lDLElBQUQsRUFBT1ksS0FBUCxFQUFjVyxVQUFVLEtBQUtrQixTQUFmLEdBQTJCbEIsVUFBM0IsR0FBd0NqQyxFQUFFLENBQUNDLFlBQUgsQ0FBZ0JnQyxVQUF0RSxDQUFMO0FBQ0g7O0FBQ0R0QyxRQUFBQSxPQUFPLENBQUNTLE9BQVI7QUFDSDs7QUFFRCxVQUFJcUIsU0FBUyxHQUFHVSxVQUFVLENBQUNWLFNBQTNCOztBQUVBLFdBQUssSUFBSWlCLENBQUMsR0FBRyxDQUFSLEVBQVdDLENBQUMsR0FBR2xCLFNBQVMsQ0FBQ3RDLE1BQTlCLEVBQXNDdUQsQ0FBQyxHQUFHQyxDQUExQyxFQUE2Q0QsQ0FBQyxFQUE5QyxFQUFrRDtBQUU5QyxZQUFJaEQsRUFBRSxHQUFHK0IsU0FBUyxDQUFDaUIsQ0FBRCxDQUFsQjtBQUNBcEIsUUFBQUEsS0FBSyxDQUFDSSxNQUFOLElBQWdCSixLQUFLLENBQUNJLE1BQU4sRUFBaEI7QUFDQWhDLFFBQUFBLEVBQUUsQ0FBQ0QsSUFBSCxDQUFROEIsT0FBUixHQUFrQkQsS0FBbEI7QUFDQTVCLFFBQUFBLEVBQUUsQ0FBQ1osSUFBSCxDQUFRZ0IsR0FBUjtBQUVIOztBQUVEMkIsTUFBQUEsU0FBUyxDQUFDdEMsTUFBVixHQUFtQixDQUFuQjtBQUNIO0FBL0RxQixHQUFaLENBQWQ7QUFrRUFULEVBQUFBLFFBQVEsQ0FBQzRCLEtBQVQsQ0FBZVgsT0FBZjtBQUNIOztBQUVEeUQsTUFBTSxDQUFDQyxPQUFQLEdBQWlCekUsSUFBakIiLCJzb3VyY2VzQ29udGVudCI6WyIvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuIENvcHlyaWdodCAoYykgMjAxOSBYaWFtZW4gWWFqaSBTb2Z0d2FyZSBDby4sIEx0ZC5cblxuIGh0dHBzOi8vd3d3LmNvY29zLmNvbS9cblxuIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbiBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGVuZ2luZSBzb3VyY2UgY29kZSAodGhlIFwiU29mdHdhcmVcIiksIGEgbGltaXRlZCxcbiAgd29ybGR3aWRlLCByb3lhbHR5LWZyZWUsIG5vbi1hc3NpZ25hYmxlLCByZXZvY2FibGUgYW5kIG5vbi1leGNsdXNpdmUgbGljZW5zZVxuIHRvIHVzZSBDb2NvcyBDcmVhdG9yIHNvbGVseSB0byBkZXZlbG9wIGdhbWVzIG9uIHlvdXIgdGFyZ2V0IHBsYXRmb3Jtcy4gWW91IHNoYWxsXG4gIG5vdCB1c2UgQ29jb3MgQ3JlYXRvciBzb2Z0d2FyZSBmb3IgZGV2ZWxvcGluZyBvdGhlciBzb2Z0d2FyZSBvciB0b29scyB0aGF0J3NcbiAgdXNlZCBmb3IgZGV2ZWxvcGluZyBnYW1lcy4gWW91IGFyZSBub3QgZ3JhbnRlZCB0byBwdWJsaXNoLCBkaXN0cmlidXRlLFxuICBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgQ29jb3MgQ3JlYXRvci5cblxuIFRoZSBzb2Z0d2FyZSBvciB0b29scyBpbiB0aGlzIExpY2Vuc2UgQWdyZWVtZW50IGFyZSBsaWNlbnNlZCwgbm90IHNvbGQuXG4gWGlhbWVuIFlhamkgU29mdHdhcmUgQ28uLCBMdGQuIHJlc2VydmVzIGFsbCByaWdodHMgbm90IGV4cHJlc3NseSBncmFudGVkIHRvIHlvdS5cblxuIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbiBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4gVEhFIFNPRlRXQVJFLlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5jb25zdCBwYWNrTWFuYWdlciA9IHJlcXVpcmUoJy4vcGFjay1tYW5hZ2VyJyk7XG5jb25zdCBQaXBlbGluZSA9IHJlcXVpcmUoJy4vcGlwZWxpbmUnKTtcbmNvbnN0IHBhcnNlciA9IHJlcXVpcmUoJy4vcGFyc2VyJyk7XG5jb25zdCB7IGdldERlcGVuZHMsIGNhY2hlLCBnYXRoZXJBc3NldCwgc2V0UHJvcGVydGllcywgZm9yRWFjaCwgY2xlYXIsIGNoZWNrQ2lyY2xlUmVmZXJlbmNlIH0gPSByZXF1aXJlKCcuL3V0aWxpdGllcycpO1xuY29uc3QgeyBhc3NldHMsIGZpbGVzLCBwYXJzZWQsIHBpcGVsaW5lIH0gPSByZXF1aXJlKCcuL3NoYXJlZCcpO1xuY29uc3QgVGFzayA9IHJlcXVpcmUoJy4vdGFzaycpO1xuXG5mdW5jdGlvbiBsb2FkICh0YXNrLCBkb25lKSB7XG5cbiAgICBpZiAoIXRhc2sucHJvZ3Jlc3MpIHtcbiAgICAgICAgdGFzay5wcm9ncmVzcyA9IHtmaW5pc2g6IDAsIHRvdGFsOiB0YXNrLmlucHV0Lmxlbmd0aH07XG4gICAgfVxuICAgIFxuICAgIHZhciBvcHRpb25zID0gdGFzay5vcHRpb25zLCBwcm9ncmVzcyA9IHRhc2sucHJvZ3Jlc3M7XG5cbiAgICBvcHRpb25zLl9fZXhjbHVkZV9fID0gb3B0aW9ucy5fX2V4Y2x1ZGVfXyB8fCBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG4gICAgdGFzay5vdXRwdXQgPSBbXTtcbiAgICBcbiAgICBmb3JFYWNoKHRhc2suaW5wdXQsIGZ1bmN0aW9uIChpdGVtLCBjYikge1xuXG4gICAgICAgIGxldCBzdWJUYXNrID0gVGFzay5jcmVhdGUoeyBcbiAgICAgICAgICAgIGlucHV0OiBpdGVtLCBcbiAgICAgICAgICAgIG9uUHJvZ3Jlc3M6IHRhc2sub25Qcm9ncmVzcywgXG4gICAgICAgICAgICBvcHRpb25zLCBcbiAgICAgICAgICAgIHByb2dyZXNzLCBcbiAgICAgICAgICAgIG9uQ29tcGxldGU6IGZ1bmN0aW9uIChlcnIsIGl0ZW0pIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyICYmICF0YXNrLmlzRmluaXNoICYmICFjYy5hc3NldE1hbmFnZXIuZm9yY2UpIGRvbmUoZXJyKTtcbiAgICAgICAgICAgICAgICB0YXNrLm91dHB1dC5wdXNoKGl0ZW0pO1xuICAgICAgICAgICAgICAgIHN1YlRhc2sucmVjeWNsZSgpO1xuICAgICAgICAgICAgICAgIGNiKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxvYWRPbmVBc3NldFBpcGVsaW5lLmFzeW5jKHN1YlRhc2spO1xuXG4gICAgfSwgZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIG9wdGlvbnMuX19leGNsdWRlX18gPSBudWxsO1xuXG4gICAgICAgIGlmICh0YXNrLmlzRmluaXNoKSB7XG4gICAgICAgICAgICBjbGVhcih0YXNrLCB0cnVlKTtcbiAgICAgICAgICAgIHJldHVybiB0YXNrLmRpc3BhdGNoKCdlcnJvcicpO1xuICAgICAgICB9XG5cbiAgICAgICAgZ2F0aGVyQXNzZXQodGFzayk7XG4gICAgICAgIGNsZWFyKHRhc2ssIHRydWUpO1xuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG59XG5cbnZhciBsb2FkT25lQXNzZXRQaXBlbGluZSA9IG5ldyBQaXBlbGluZSgnbG9hZE9uZUFzc2V0JywgW1xuXG4gICAgZnVuY3Rpb24gZmV0Y2ggKHRhc2ssIGRvbmUpIHtcbiAgICAgICAgdmFyIGl0ZW0gPSB0YXNrLm91dHB1dCA9IHRhc2suaW5wdXQ7XG4gICAgICAgIHZhciB7IG9wdGlvbnMsIGlzTmF0aXZlLCB1dWlkLCBmaWxlIH0gPSBpdGVtO1xuICAgICAgICB2YXIgeyByZWxvYWQgfSA9IG9wdGlvbnM7XG5cbiAgICAgICAgaWYgKGZpbGUgfHwgKCFyZWxvYWQgJiYgIWlzTmF0aXZlICYmIGFzc2V0cy5oYXModXVpZCkpKSByZXR1cm4gZG9uZSgpO1xuXG4gICAgICAgIHBhY2tNYW5hZ2VyLmxvYWQoaXRlbSwgdGFzay5vcHRpb25zLCBmdW5jdGlvbiAoZXJyLCBkYXRhKSB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNjLmFzc2V0TWFuYWdlci5mb3JjZSkge1xuICAgICAgICAgICAgICAgICAgICBlcnIgPSBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY2MuZXJyb3IoZXJyLm1lc3NhZ2UsIGVyci5zdGFjayk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGRhdGEgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaXRlbS5maWxlID0gZGF0YTtcbiAgICAgICAgICAgIGRvbmUoZXJyKTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGZ1bmN0aW9uIHBhcnNlICh0YXNrLCBkb25lKSB7XG5cbiAgICAgICAgdmFyIGl0ZW0gPSB0YXNrLm91dHB1dCA9IHRhc2suaW5wdXQsIHByb2dyZXNzID0gdGFzay5wcm9ncmVzcywgZXhjbHVkZSA9IHRhc2sub3B0aW9ucy5fX2V4Y2x1ZGVfXztcbiAgICAgICAgdmFyIHsgaWQsIGZpbGUsIG9wdGlvbnMgfSA9IGl0ZW07XG5cbiAgICAgICAgaWYgKGl0ZW0uaXNOYXRpdmUpIHtcbiAgICAgICAgICAgIHBhcnNlci5wYXJzZShpZCwgZmlsZSwgaXRlbS5leHQsIG9wdGlvbnMsIGZ1bmN0aW9uIChlcnIsIGFzc2V0KSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWNjLmFzc2V0TWFuYWdlci5mb3JjZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2MuZXJyb3IoZXJyLm1lc3NhZ2UsIGVyci5zdGFjayk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZG9uZShlcnIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGl0ZW0uY29udGVudCA9IGFzc2V0O1xuICAgICAgICAgICAgICAgIHRhc2suZGlzcGF0Y2goJ3Byb2dyZXNzJywgKytwcm9ncmVzcy5maW5pc2gsIHByb2dyZXNzLnRvdGFsLCBpdGVtKTtcbiAgICAgICAgICAgICAgICBmaWxlcy5yZW1vdmUoaWQpO1xuICAgICAgICAgICAgICAgIHBhcnNlZC5yZW1vdmUoaWQpO1xuICAgICAgICAgICAgICAgIGRvbmUoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdmFyIHsgdXVpZCB9ID0gaXRlbTtcbiAgICAgICAgICAgIGlmICh1dWlkIGluIGV4Y2x1ZGUpIHtcbiAgICBcbiAgICAgICAgICAgICAgICB2YXIgeyBmaW5pc2gsIGNvbnRlbnQsIGVyciwgY2FsbGJhY2tzIH0gPSBleGNsdWRlW3V1aWRdO1xuICAgICAgICAgICAgICAgIHRhc2suZGlzcGF0Y2goJ3Byb2dyZXNzJywgKytwcm9ncmVzcy5maW5pc2gsIHByb2dyZXNzLnRvdGFsLCBpdGVtKTtcbiAgICBcbiAgICAgICAgICAgICAgICBpZiAoZmluaXNoIHx8IGNoZWNrQ2lyY2xlUmVmZXJlbmNlKHV1aWQsIHV1aWQsIGV4Y2x1ZGUpICkge1xuICAgICAgICAgICAgICAgICAgICBjb250ZW50ICYmIGNvbnRlbnQuYWRkUmVmKCk7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uY29udGVudCA9IGNvbnRlbnQ7XG4gICAgICAgICAgICAgICAgICAgIGRvbmUoZXJyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrcy5wdXNoKHsgZG9uZSwgaXRlbSB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoIW9wdGlvbnMucmVsb2FkICYmIGFzc2V0cy5oYXModXVpZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGFzc2V0ID0gYXNzZXRzLmdldCh1dWlkKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuX19hc3luY0xvYWRBc3NldHNfXyB8fCAhYXNzZXQuX19hc3luY0xvYWRBc3NldHNfXykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5jb250ZW50ID0gYXNzZXQuYWRkUmVmKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0YXNrLmRpc3BhdGNoKCdwcm9ncmVzcycsICsrcHJvZ3Jlc3MuZmluaXNoLCBwcm9ncmVzcy50b3RhbCwgaXRlbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb25lKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2FkRGVwZW5kcyh0YXNrLCBhc3NldCwgZG9uZSwgZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBwYXJzZXIucGFyc2UoaWQsIGZpbGUsICdpbXBvcnQnLCBvcHRpb25zLCBmdW5jdGlvbiAoZXJyLCBhc3NldCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjYy5hc3NldE1hbmFnZXIuZm9yY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNjLmVycm9yKGVyci5tZXNzYWdlLCBlcnIuc3RhY2spO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZG9uZShlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NldC5fdXVpZCA9IHV1aWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2FkRGVwZW5kcyh0YXNrLCBhc3NldCwgZG9uZSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbl0pO1xuXG5mdW5jdGlvbiBsb2FkRGVwZW5kcyAodGFzaywgYXNzZXQsIGRvbmUsIGluaXQpIHtcblxuICAgIHZhciBpdGVtID0gdGFzay5pbnB1dCwgcHJvZ3Jlc3MgPSB0YXNrLnByb2dyZXNzO1xuICAgIHZhciB7IHV1aWQsIGlkLCBvcHRpb25zLCBjb25maWcgfSA9IGl0ZW07XG4gICAgdmFyIHsgX19hc3luY0xvYWRBc3NldHNfXywgY2FjaGVBc3NldCB9ID0gb3B0aW9ucztcblxuICAgIHZhciBkZXBlbmRzID0gW107XG4gICAgLy8gYWRkIHJlZmVyZW5jZSBhdm9pZCBiZWluZyByZWxlYXNlZCBkdXJpbmcgbG9hZGluZyBkZXBlbmRlbmNpZXNcbiAgICBhc3NldC5hZGRSZWYgJiYgYXNzZXQuYWRkUmVmKCk7XG4gICAgZ2V0RGVwZW5kcyh1dWlkLCBhc3NldCwgT2JqZWN0LmNyZWF0ZShudWxsKSwgZGVwZW5kcywgZmFsc2UsIF9fYXN5bmNMb2FkQXNzZXRzX18sIGNvbmZpZyk7XG4gICAgdGFzay5kaXNwYXRjaCgncHJvZ3Jlc3MnLCArK3Byb2dyZXNzLmZpbmlzaCwgcHJvZ3Jlc3MudG90YWwgKz0gZGVwZW5kcy5sZW5ndGgsIGl0ZW0pO1xuXG4gICAgdmFyIHJlcGVhdEl0ZW0gPSB0YXNrLm9wdGlvbnMuX19leGNsdWRlX19bdXVpZF0gPSB7IGNvbnRlbnQ6IGFzc2V0LCBmaW5pc2g6IGZhbHNlLCBjYWxsYmFja3M6IFt7IGRvbmUsIGl0ZW0gfV0gfTtcblxuICAgIGxldCBzdWJUYXNrID0gVGFzay5jcmVhdGUoeyBcbiAgICAgICAgaW5wdXQ6IGRlcGVuZHMsIFxuICAgICAgICBvcHRpb25zOiB0YXNrLm9wdGlvbnMsIFxuICAgICAgICBvblByb2dyZXNzOiB0YXNrLm9uUHJvZ3Jlc3MsIFxuICAgICAgICBvbkVycm9yOiBUYXNrLnByb3RvdHlwZS5yZWN5Y2xlLCBcbiAgICAgICAgcHJvZ3Jlc3MsIFxuICAgICAgICBvbkNvbXBsZXRlOiBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICBhc3NldC5kZWNSZWYgJiYgYXNzZXQuZGVjUmVmKGZhbHNlKTtcbiAgICAgICAgICAgIGFzc2V0Ll9fYXN5bmNMb2FkQXNzZXRzX18gPSBfX2FzeW5jTG9hZEFzc2V0c19fO1xuICAgICAgICAgICAgcmVwZWF0SXRlbS5maW5pc2ggPSB0cnVlO1xuICAgICAgICAgICAgcmVwZWF0SXRlbS5lcnIgPSBlcnI7XG5cbiAgICAgICAgICAgIGlmICghZXJyKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgYXNzZXRzID0gQXJyYXkuaXNBcnJheShzdWJUYXNrLm91dHB1dCkgPyBzdWJUYXNrLm91dHB1dCA6IFtzdWJUYXNrLm91dHB1dF07XG4gICAgICAgICAgICAgICAgdmFyIG1hcCA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDAsIGwgPSBhc3NldHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBkZXBlbmRBc3NldCA9IGFzc2V0c1tpXTtcbiAgICAgICAgICAgICAgICAgICAgZGVwZW5kQXNzZXQgJiYgKG1hcFtkZXBlbmRBc3NldCBpbnN0YW5jZW9mIGNjLkFzc2V0ID8gZGVwZW5kQXNzZXQuX3V1aWQgKyAnQGltcG9ydCcgOiB1dWlkICsgJ0BuYXRpdmUnXSA9IGRlcGVuZEFzc2V0KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoIWluaXQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFzc2V0Ll9fbmF0aXZlRGVwZW5kX18gJiYgIWFzc2V0Ll9uYXRpdmVBc3NldCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG1pc3NpbmdBc3NldCA9IHNldFByb3BlcnRpZXModXVpZCwgYXNzZXQsIG1hcCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIW1pc3NpbmdBc3NldCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2V0Lm9uTG9hZCAmJiBhc3NldC5vbkxvYWQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2MuZXJyb3IoZS5tZXNzYWdlLCBlLnN0YWNrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBtaXNzaW5nQXNzZXQgPSBzZXRQcm9wZXJ0aWVzKHV1aWQsIGFzc2V0LCBtYXApO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIW1pc3NpbmdBc3NldCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NldC5vbkxvYWQgJiYgYXNzZXQub25Mb2FkKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNjLmVycm9yKGUubWVzc2FnZSwgZS5zdGFjayk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZmlsZXMucmVtb3ZlKGlkKTtcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VkLnJlbW92ZShpZCk7XG4gICAgICAgICAgICAgICAgICAgIGNhY2hlKHV1aWQsIGFzc2V0LCBjYWNoZUFzc2V0ICE9PSB1bmRlZmluZWQgPyBjYWNoZUFzc2V0IDogY2MuYXNzZXRNYW5hZ2VyLmNhY2hlQXNzZXQpOyBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc3ViVGFzay5yZWN5Y2xlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBjYWxsYmFja3MgPSByZXBlYXRJdGVtLmNhbGxiYWNrcztcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBjYWxsYmFja3MubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgY2IgPSBjYWxsYmFja3NbaV07XG4gICAgICAgICAgICAgICAgYXNzZXQuYWRkUmVmICYmIGFzc2V0LmFkZFJlZigpO1xuICAgICAgICAgICAgICAgIGNiLml0ZW0uY29udGVudCA9IGFzc2V0O1xuICAgICAgICAgICAgICAgIGNiLmRvbmUoZXJyKTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjYWxsYmFja3MubGVuZ3RoID0gMDtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgcGlwZWxpbmUuYXN5bmMoc3ViVGFzayk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbG9hZDsiXSwic291cmNlUm9vdCI6Ii8ifQ==