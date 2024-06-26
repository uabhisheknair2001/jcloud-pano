/*
 * Copyright 2016 Google Inc. All Rights Reserved.
 * See ../LICENSES.txt for licenses of bundled libraries
 */
(function () {
  function r(e, n, t) {
    function o(i, f) {
      if (!n[i]) {
        if (!e[i]) {
          var c = "function" == typeof require && require;
          if (!f && c) return c(i, !0);
          if (u) return u(i, !0);
          var a = new Error("Cannot find module '" + i + "'");
          throw ((a.code = "MODULE_NOT_FOUND"), a);
        }
        var p = (n[i] = { exports: {} });
        e[i][0].call(
          p.exports,
          function (r) {
            var n = e[i][1][r];
            return o(n || r);
          },
          p,
          p.exports,
          r,
          e,
          n,
          t
        );
      }
      return n[i].exports;
    }
    for (
      var u = "function" == typeof require && require, i = 0;
      i < t.length;
      i++
    )
      o(t[i]);
    return o;
  }
  return r;
})()(
  {
    1: [
      function (require, module, exports) {
        "use strict";
        exports.byteLength = byteLength;
        exports.toByteArray = toByteArray;
        exports.fromByteArray = fromByteArray;
        var lookup = [];
        var revLookup = [];
        var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
        var code =
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        for (var i = 0, len = code.length; i < len; ++i) {
          lookup[i] = code[i];
          revLookup[code.charCodeAt(i)] = i;
        }
        revLookup["-".charCodeAt(0)] = 62;
        revLookup["_".charCodeAt(0)] = 63;
        function getLens(b64) {
          var len = b64.length;
          if (len % 4 > 0) {
            throw new Error("Invalid string. Length must be a multiple of 4");
          }
          var validLen = b64.indexOf("=");
          if (validLen === -1) validLen = len;
          var placeHoldersLen = validLen === len ? 0 : 4 - (validLen % 4);
          return [validLen, placeHoldersLen];
        }
        function byteLength(b64) {
          var lens = getLens(b64);
          var validLen = lens[0];
          var placeHoldersLen = lens[1];
          return ((validLen + placeHoldersLen) * 3) / 4 - placeHoldersLen;
        }
        function _byteLength(b64, validLen, placeHoldersLen) {
          return ((validLen + placeHoldersLen) * 3) / 4 - placeHoldersLen;
        }
        function toByteArray(b64) {
          var tmp;
          var lens = getLens(b64);
          var validLen = lens[0];
          var placeHoldersLen = lens[1];
          var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
          var curByte = 0;
          var len = placeHoldersLen > 0 ? validLen - 4 : validLen;
          for (var i = 0; i < len; i += 4) {
            tmp =
              (revLookup[b64.charCodeAt(i)] << 18) |
              (revLookup[b64.charCodeAt(i + 1)] << 12) |
              (revLookup[b64.charCodeAt(i + 2)] << 6) |
              revLookup[b64.charCodeAt(i + 3)];
            arr[curByte++] = (tmp >> 16) & 255;
            arr[curByte++] = (tmp >> 8) & 255;
            arr[curByte++] = tmp & 255;
          }
          if (placeHoldersLen === 2) {
            tmp =
              (revLookup[b64.charCodeAt(i)] << 2) |
              (revLookup[b64.charCodeAt(i + 1)] >> 4);
            arr[curByte++] = tmp & 255;
          }
          if (placeHoldersLen === 1) {
            tmp =
              (revLookup[b64.charCodeAt(i)] << 10) |
              (revLookup[b64.charCodeAt(i + 1)] << 4) |
              (revLookup[b64.charCodeAt(i + 2)] >> 2);
            arr[curByte++] = (tmp >> 8) & 255;
            arr[curByte++] = tmp & 255;
          }
          return arr;
        }
        function tripletToBase64(num) {
          return (
            lookup[(num >> 18) & 63] +
            lookup[(num >> 12) & 63] +
            lookup[(num >> 6) & 63] +
            lookup[num & 63]
          );
        }
        function encodeChunk(uint8, start, end) {
          var tmp;
          var output = [];
          for (var i = start; i < end; i += 3) {
            tmp =
              ((uint8[i] << 16) & 16711680) +
              ((uint8[i + 1] << 8) & 65280) +
              (uint8[i + 2] & 255);
            output.push(tripletToBase64(tmp));
          }
          return output.join("");
        }
        function fromByteArray(uint8) {
          var tmp;
          var len = uint8.length;
          var extraBytes = len % 3;
          var parts = [];
          var maxChunkLength = 16383;
          for (
            var i = 0, len2 = len - extraBytes;
            i < len2;
            i += maxChunkLength
          ) {
            parts.push(
              encodeChunk(
                uint8,
                i,
                i + maxChunkLength > len2 ? len2 : i + maxChunkLength
              )
            );
          }
          if (extraBytes === 1) {
            tmp = uint8[len - 1];
            parts.push(lookup[tmp >> 2] + lookup[(tmp << 4) & 63] + "==");
          } else if (extraBytes === 2) {
            tmp = (uint8[len - 2] << 8) + uint8[len - 1];
            parts.push(
              lookup[tmp >> 10] +
                lookup[(tmp >> 4) & 63] +
                lookup[(tmp << 2) & 63] +
                "="
            );
          }
          return parts.join("");
        }
      },
      {},
    ],
    2: [
      function (require, module, exports) {
        "use strict";
        var base64 = require("base64-js");
        var ieee754 = require("ieee754");
        exports.Buffer = Buffer;
        exports.SlowBuffer = SlowBuffer;
        exports.INSPECT_MAX_BYTES = 50;
        var K_MAX_LENGTH = 2147483647;
        exports.kMaxLength = K_MAX_LENGTH;
        Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport();
        if (
          !Buffer.TYPED_ARRAY_SUPPORT &&
          typeof console !== "undefined" &&
          typeof console.error === "function"
        ) {
          console.error(
            "This browser lacks typed array (Uint8Array) support which is required by " +
              "`buffer` v5.x. Use `buffer` v4.x if you require old browser support."
          );
        }
        function typedArraySupport() {
          try {
            var arr = new Uint8Array(1);
            arr.__proto__ = {
              __proto__: Uint8Array.prototype,
              foo: function () {
                return 42;
              },
            };
            return arr.foo() === 42;
          } catch (e) {
            return false;
          }
        }
        Object.defineProperty(Buffer.prototype, "parent", {
          get: function () {
            if (!(this instanceof Buffer)) {
              return undefined;
            }
            return this.buffer;
          },
        });
        Object.defineProperty(Buffer.prototype, "offset", {
          get: function () {
            if (!(this instanceof Buffer)) {
              return undefined;
            }
            return this.byteOffset;
          },
        });
        function createBuffer(length) {
          if (length > K_MAX_LENGTH) {
            throw new RangeError("Invalid typed array length");
          }
          var buf = new Uint8Array(length);
          buf.__proto__ = Buffer.prototype;
          return buf;
        }
        function Buffer(arg, encodingOrOffset, length) {
          if (typeof arg === "number") {
            if (typeof encodingOrOffset === "string") {
              throw new Error(
                "If encoding is specified then the first argument must be a string"
              );
            }
            return allocUnsafe(arg);
          }
          return from(arg, encodingOrOffset, length);
        }
        if (
          typeof Symbol !== "undefined" &&
          Symbol.species &&
          Buffer[Symbol.species] === Buffer
        ) {
          Object.defineProperty(Buffer, Symbol.species, {
            value: null,
            configurable: true,
            enumerable: false,
            writable: false,
          });
        }
        Buffer.poolSize = 8192;
        function from(value, encodingOrOffset, length) {
          if (typeof value === "number") {
            throw new TypeError('"value" argument must not be a number');
          }
          if (isArrayBuffer(value) || (value && isArrayBuffer(value.buffer))) {
            return fromArrayBuffer(value, encodingOrOffset, length);
          }
          if (typeof value === "string") {
            return fromString(value, encodingOrOffset);
          }
          return fromObject(value);
        }
        Buffer.from = function (value, encodingOrOffset, length) {
          return from(value, encodingOrOffset, length);
        };
        Buffer.prototype.__proto__ = Uint8Array.prototype;
        Buffer.__proto__ = Uint8Array;
        function assertSize(size) {
          if (typeof size !== "number") {
            throw new TypeError('"size" argument must be of type number');
          } else if (size < 0) {
            throw new RangeError('"size" argument must not be negative');
          }
        }
        function alloc(size, fill, encoding) {
          assertSize(size);
          if (size <= 0) {
            return createBuffer(size);
          }
          if (fill !== undefined) {
            return typeof encoding === "string"
              ? createBuffer(size).fill(fill, encoding)
              : createBuffer(size).fill(fill);
          }
          return createBuffer(size);
        }
        Buffer.alloc = function (size, fill, encoding) {
          return alloc(size, fill, encoding);
        };
        function allocUnsafe(size) {
          assertSize(size);
          return createBuffer(size < 0 ? 0 : checked(size) | 0);
        }
        Buffer.allocUnsafe = function (size) {
          return allocUnsafe(size);
        };
        Buffer.allocUnsafeSlow = function (size) {
          return allocUnsafe(size);
        };
        function fromString(string, encoding) {
          if (typeof encoding !== "string" || encoding === "") {
            encoding = "utf8";
          }
          if (!Buffer.isEncoding(encoding)) {
            throw new TypeError("Unknown encoding: " + encoding);
          }
          var length = byteLength(string, encoding) | 0;
          var buf = createBuffer(length);
          var actual = buf.write(string, encoding);
          if (actual !== length) {
            buf = buf.slice(0, actual);
          }
          return buf;
        }
        function fromArrayLike(array) {
          var length = array.length < 0 ? 0 : checked(array.length) | 0;
          var buf = createBuffer(length);
          for (var i = 0; i < length; i += 1) {
            buf[i] = array[i] & 255;
          }
          return buf;
        }
        function fromArrayBuffer(array, byteOffset, length) {
          if (byteOffset < 0 || array.byteLength < byteOffset) {
            throw new RangeError('"offset" is outside of buffer bounds');
          }
          if (array.byteLength < byteOffset + (length || 0)) {
            throw new RangeError('"length" is outside of buffer bounds');
          }
          var buf;
          if (byteOffset === undefined && length === undefined) {
            buf = new Uint8Array(array);
          } else if (length === undefined) {
            buf = new Uint8Array(array, byteOffset);
          } else {
            buf = new Uint8Array(array, byteOffset, length);
          }
          buf.__proto__ = Buffer.prototype;
          return buf;
        }
        function fromObject(obj) {
          if (Buffer.isBuffer(obj)) {
            var len = checked(obj.length) | 0;
            var buf = createBuffer(len);
            if (buf.length === 0) {
              return buf;
            }
            obj.copy(buf, 0, 0, len);
            return buf;
          }
          if (obj) {
            if (ArrayBuffer.isView(obj) || "length" in obj) {
              if (typeof obj.length !== "number" || numberIsNaN(obj.length)) {
                return createBuffer(0);
              }
              return fromArrayLike(obj);
            }
            if (obj.type === "Buffer" && Array.isArray(obj.data)) {
              return fromArrayLike(obj.data);
            }
          }
          throw new TypeError(
            "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object."
          );
        }
        function checked(length) {
          if (length >= K_MAX_LENGTH) {
            throw new RangeError(
              "Attempt to allocate Buffer larger than maximum " +
                "size: 0x" +
                K_MAX_LENGTH.toString(16) +
                " bytes"
            );
          }
          return length | 0;
        }
        function SlowBuffer(length) {
          if (+length != length) {
            length = 0;
          }
          return Buffer.alloc(+length);
        }
        Buffer.isBuffer = function isBuffer(b) {
          return b != null && b._isBuffer === true;
        };
        Buffer.compare = function compare(a, b) {
          if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
            throw new TypeError("Arguments must be Buffers");
          }
          if (a === b) return 0;
          var x = a.length;
          var y = b.length;
          for (var i = 0, len = Math.min(x, y); i < len; ++i) {
            if (a[i] !== b[i]) {
              x = a[i];
              y = b[i];
              break;
            }
          }
          if (x < y) return -1;
          if (y < x) return 1;
          return 0;
        };
        Buffer.isEncoding = function isEncoding(encoding) {
          switch (String(encoding).toLowerCase()) {
            case "hex":
            case "utf8":
            case "utf-8":
            case "ascii":
            case "latin1":
            case "binary":
            case "base64":
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              return true;
            default:
              return false;
          }
        };
        Buffer.concat = function concat(list, length) {
          if (!Array.isArray(list)) {
            throw new TypeError('"list" argument must be an Array of Buffers');
          }
          if (list.length === 0) {
            return Buffer.alloc(0);
          }
          var i;
          if (length === undefined) {
            length = 0;
            for (i = 0; i < list.length; ++i) {
              length += list[i].length;
            }
          }
          var buffer = Buffer.allocUnsafe(length);
          var pos = 0;
          for (i = 0; i < list.length; ++i) {
            var buf = list[i];
            if (ArrayBuffer.isView(buf)) {
              buf = Buffer.from(buf);
            }
            if (!Buffer.isBuffer(buf)) {
              throw new TypeError(
                '"list" argument must be an Array of Buffers'
              );
            }
            buf.copy(buffer, pos);
            pos += buf.length;
          }
          return buffer;
        };
        function byteLength(string, encoding) {
          if (Buffer.isBuffer(string)) {
            return string.length;
          }
          if (ArrayBuffer.isView(string) || isArrayBuffer(string)) {
            return string.byteLength;
          }
          if (typeof string !== "string") {
            string = "" + string;
          }
          var len = string.length;
          if (len === 0) return 0;
          var loweredCase = false;
          for (;;) {
            switch (encoding) {
              case "ascii":
              case "latin1":
              case "binary":
                return len;
              case "utf8":
              case "utf-8":
              case undefined:
                return utf8ToBytes(string).length;
              case "ucs2":
              case "ucs-2":
              case "utf16le":
              case "utf-16le":
                return len * 2;
              case "hex":
                return len >>> 1;
              case "base64":
                return base64ToBytes(string).length;
              default:
                if (loweredCase) return utf8ToBytes(string).length;
                encoding = ("" + encoding).toLowerCase();
                loweredCase = true;
            }
          }
        }
        Buffer.byteLength = byteLength;
        function slowToString(encoding, start, end) {
          var loweredCase = false;
          if (start === undefined || start < 0) {
            start = 0;
          }
          if (start > this.length) {
            return "";
          }
          if (end === undefined || end > this.length) {
            end = this.length;
          }
          if (end <= 0) {
            return "";
          }
          end >>>= 0;
          start >>>= 0;
          if (end <= start) {
            return "";
          }
          if (!encoding) encoding = "utf8";
          while (true) {
            switch (encoding) {
              case "hex":
                return hexSlice(this, start, end);
              case "utf8":
              case "utf-8":
                return utf8Slice(this, start, end);
              case "ascii":
                return asciiSlice(this, start, end);
              case "latin1":
              case "binary":
                return latin1Slice(this, start, end);
              case "base64":
                return base64Slice(this, start, end);
              case "ucs2":
              case "ucs-2":
              case "utf16le":
              case "utf-16le":
                return utf16leSlice(this, start, end);
              default:
                if (loweredCase)
                  throw new TypeError("Unknown encoding: " + encoding);
                encoding = (encoding + "").toLowerCase();
                loweredCase = true;
            }
          }
        }
        Buffer.prototype._isBuffer = true;
        function swap(b, n, m) {
          var i = b[n];
          b[n] = b[m];
          b[m] = i;
        }
        Buffer.prototype.swap16 = function swap16() {
          var len = this.length;
          if (len % 2 !== 0) {
            throw new RangeError("Buffer size must be a multiple of 16-bits");
          }
          for (var i = 0; i < len; i += 2) {
            swap(this, i, i + 1);
          }
          return this;
        };
        Buffer.prototype.swap32 = function swap32() {
          var len = this.length;
          if (len % 4 !== 0) {
            throw new RangeError("Buffer size must be a multiple of 32-bits");
          }
          for (var i = 0; i < len; i += 4) {
            swap(this, i, i + 3);
            swap(this, i + 1, i + 2);
          }
          return this;
        };
        Buffer.prototype.swap64 = function swap64() {
          var len = this.length;
          if (len % 8 !== 0) {
            throw new RangeError("Buffer size must be a multiple of 64-bits");
          }
          for (var i = 0; i < len; i += 8) {
            swap(this, i, i + 7);
            swap(this, i + 1, i + 6);
            swap(this, i + 2, i + 5);
            swap(this, i + 3, i + 4);
          }
          return this;
        };
        Buffer.prototype.toString = function toString() {
          var length = this.length;
          if (length === 0) return "";
          if (arguments.length === 0) return utf8Slice(this, 0, length);
          return slowToString.apply(this, arguments);
        };
        Buffer.prototype.toLocaleString = Buffer.prototype.toString;
        Buffer.prototype.equals = function equals(b) {
          if (!Buffer.isBuffer(b))
            throw new TypeError("Argument must be a Buffer");
          if (this === b) return true;
          return Buffer.compare(this, b) === 0;
        };
        Buffer.prototype.inspect = function inspect() {
          var str = "";
          var max = exports.INSPECT_MAX_BYTES;
          if (this.length > 0) {
            str = this.toString("hex", 0, max).match(/.{2}/g).join(" ");
            if (this.length > max) str += " ... ";
          }
          return "<Buffer " + str + ">";
        };
        Buffer.prototype.compare = function compare(
          target,
          start,
          end,
          thisStart,
          thisEnd
        ) {
          if (!Buffer.isBuffer(target)) {
            throw new TypeError("Argument must be a Buffer");
          }
          if (start === undefined) {
            start = 0;
          }
          if (end === undefined) {
            end = target ? target.length : 0;
          }
          if (thisStart === undefined) {
            thisStart = 0;
          }
          if (thisEnd === undefined) {
            thisEnd = this.length;
          }
          if (
            start < 0 ||
            end > target.length ||
            thisStart < 0 ||
            thisEnd > this.length
          ) {
            throw new RangeError("out of range index");
          }
          if (thisStart >= thisEnd && start >= end) {
            return 0;
          }
          if (thisStart >= thisEnd) {
            return -1;
          }
          if (start >= end) {
            return 1;
          }
          start >>>= 0;
          end >>>= 0;
          thisStart >>>= 0;
          thisEnd >>>= 0;
          if (this === target) return 0;
          var x = thisEnd - thisStart;
          var y = end - start;
          var len = Math.min(x, y);
          var thisCopy = this.slice(thisStart, thisEnd);
          var targetCopy = target.slice(start, end);
          for (var i = 0; i < len; ++i) {
            if (thisCopy[i] !== targetCopy[i]) {
              x = thisCopy[i];
              y = targetCopy[i];
              break;
            }
          }
          if (x < y) return -1;
          if (y < x) return 1;
          return 0;
        };
        function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
          if (buffer.length === 0) return -1;
          if (typeof byteOffset === "string") {
            encoding = byteOffset;
            byteOffset = 0;
          } else if (byteOffset > 2147483647) {
            byteOffset = 2147483647;
          } else if (byteOffset < -2147483648) {
            byteOffset = -2147483648;
          }
          byteOffset = +byteOffset;
          if (numberIsNaN(byteOffset)) {
            byteOffset = dir ? 0 : buffer.length - 1;
          }
          if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
          if (byteOffset >= buffer.length) {
            if (dir) return -1;
            else byteOffset = buffer.length - 1;
          } else if (byteOffset < 0) {
            if (dir) byteOffset = 0;
            else return -1;
          }
          if (typeof val === "string") {
            val = Buffer.from(val, encoding);
          }
          if (Buffer.isBuffer(val)) {
            if (val.length === 0) {
              return -1;
            }
            return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
          } else if (typeof val === "number") {
            val = val & 255;
            if (typeof Uint8Array.prototype.indexOf === "function") {
              if (dir) {
                return Uint8Array.prototype.indexOf.call(
                  buffer,
                  val,
                  byteOffset
                );
              } else {
                return Uint8Array.prototype.lastIndexOf.call(
                  buffer,
                  val,
                  byteOffset
                );
              }
            }
            return arrayIndexOf(buffer, [val], byteOffset, encoding, dir);
          }
          throw new TypeError("val must be string, number or Buffer");
        }
        function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
          var indexSize = 1;
          var arrLength = arr.length;
          var valLength = val.length;
          if (encoding !== undefined) {
            encoding = String(encoding).toLowerCase();
            if (
              encoding === "ucs2" ||
              encoding === "ucs-2" ||
              encoding === "utf16le" ||
              encoding === "utf-16le"
            ) {
              if (arr.length < 2 || val.length < 2) {
                return -1;
              }
              indexSize = 2;
              arrLength /= 2;
              valLength /= 2;
              byteOffset /= 2;
            }
          }
          function read(buf, i) {
            if (indexSize === 1) {
              return buf[i];
            } else {
              return buf.readUInt16BE(i * indexSize);
            }
          }
          var i;
          if (dir) {
            var foundIndex = -1;
            for (i = byteOffset; i < arrLength; i++) {
              if (
                read(arr, i) ===
                read(val, foundIndex === -1 ? 0 : i - foundIndex)
              ) {
                if (foundIndex === -1) foundIndex = i;
                if (i - foundIndex + 1 === valLength)
                  return foundIndex * indexSize;
              } else {
                if (foundIndex !== -1) i -= i - foundIndex;
                foundIndex = -1;
              }
            }
          } else {
            if (byteOffset + valLength > arrLength)
              byteOffset = arrLength - valLength;
            for (i = byteOffset; i >= 0; i--) {
              var found = true;
              for (var j = 0; j < valLength; j++) {
                if (read(arr, i + j) !== read(val, j)) {
                  found = false;
                  break;
                }
              }
              if (found) return i;
            }
          }
          return -1;
        }
        Buffer.prototype.includes = function includes(
          val,
          byteOffset,
          encoding
        ) {
          return this.indexOf(val, byteOffset, encoding) !== -1;
        };
        Buffer.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
          return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
        };
        Buffer.prototype.lastIndexOf = function lastIndexOf(
          val,
          byteOffset,
          encoding
        ) {
          return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
        };
        function hexWrite(buf, string, offset, length) {
          offset = Number(offset) || 0;
          var remaining = buf.length - offset;
          if (!length) {
            length = remaining;
          } else {
            length = Number(length);
            if (length > remaining) {
              length = remaining;
            }
          }
          var strLen = string.length;
          if (length > strLen / 2) {
            length = strLen / 2;
          }
          for (var i = 0; i < length; ++i) {
            var parsed = parseInt(string.substr(i * 2, 2), 16);
            if (numberIsNaN(parsed)) return i;
            buf[offset + i] = parsed;
          }
          return i;
        }
        function utf8Write(buf, string, offset, length) {
          return blitBuffer(
            utf8ToBytes(string, buf.length - offset),
            buf,
            offset,
            length
          );
        }
        function asciiWrite(buf, string, offset, length) {
          return blitBuffer(asciiToBytes(string), buf, offset, length);
        }
        function latin1Write(buf, string, offset, length) {
          return asciiWrite(buf, string, offset, length);
        }
        function base64Write(buf, string, offset, length) {
          return blitBuffer(base64ToBytes(string), buf, offset, length);
        }
        function ucs2Write(buf, string, offset, length) {
          return blitBuffer(
            utf16leToBytes(string, buf.length - offset),
            buf,
            offset,
            length
          );
        }
        Buffer.prototype.write = function write(
          string,
          offset,
          length,
          encoding
        ) {
          if (offset === undefined) {
            encoding = "utf8";
            length = this.length;
            offset = 0;
          } else if (length === undefined && typeof offset === "string") {
            encoding = offset;
            length = this.length;
            offset = 0;
          } else if (isFinite(offset)) {
            offset = offset >>> 0;
            if (isFinite(length)) {
              length = length >>> 0;
              if (encoding === undefined) encoding = "utf8";
            } else {
              encoding = length;
              length = undefined;
            }
          } else {
            throw new Error(
              "Buffer.write(string, encoding, offset[, length]) is no longer supported"
            );
          }
          var remaining = this.length - offset;
          if (length === undefined || length > remaining) length = remaining;
          if (
            (string.length > 0 && (length < 0 || offset < 0)) ||
            offset > this.length
          ) {
            throw new RangeError("Attempt to write outside buffer bounds");
          }
          if (!encoding) encoding = "utf8";
          var loweredCase = false;
          for (;;) {
            switch (encoding) {
              case "hex":
                return hexWrite(this, string, offset, length);
              case "utf8":
              case "utf-8":
                return utf8Write(this, string, offset, length);
              case "ascii":
                return asciiWrite(this, string, offset, length);
              case "latin1":
              case "binary":
                return latin1Write(this, string, offset, length);
              case "base64":
                return base64Write(this, string, offset, length);
              case "ucs2":
              case "ucs-2":
              case "utf16le":
              case "utf-16le":
                return ucs2Write(this, string, offset, length);
              default:
                if (loweredCase)
                  throw new TypeError("Unknown encoding: " + encoding);
                encoding = ("" + encoding).toLowerCase();
                loweredCase = true;
            }
          }
        };
        Buffer.prototype.toJSON = function toJSON() {
          return {
            type: "Buffer",
            data: Array.prototype.slice.call(this._arr || this, 0),
          };
        };
        function base64Slice(buf, start, end) {
          if (start === 0 && end === buf.length) {
            return base64.fromByteArray(buf);
          } else {
            return base64.fromByteArray(buf.slice(start, end));
          }
        }
        function utf8Slice(buf, start, end) {
          end = Math.min(buf.length, end);
          var res = [];
          var i = start;
          while (i < end) {
            var firstByte = buf[i];
            var codePoint = null;
            var bytesPerSequence =
              firstByte > 239
                ? 4
                : firstByte > 223
                ? 3
                : firstByte > 191
                ? 2
                : 1;
            if (i + bytesPerSequence <= end) {
              var secondByte, thirdByte, fourthByte, tempCodePoint;
              switch (bytesPerSequence) {
                case 1:
                  if (firstByte < 128) {
                    codePoint = firstByte;
                  }
                  break;
                case 2:
                  secondByte = buf[i + 1];
                  if ((secondByte & 192) === 128) {
                    tempCodePoint = ((firstByte & 31) << 6) | (secondByte & 63);
                    if (tempCodePoint > 127) {
                      codePoint = tempCodePoint;
                    }
                  }
                  break;
                case 3:
                  secondByte = buf[i + 1];
                  thirdByte = buf[i + 2];
                  if ((secondByte & 192) === 128 && (thirdByte & 192) === 128) {
                    tempCodePoint =
                      ((firstByte & 15) << 12) |
                      ((secondByte & 63) << 6) |
                      (thirdByte & 63);
                    if (
                      tempCodePoint > 2047 &&
                      (tempCodePoint < 55296 || tempCodePoint > 57343)
                    ) {
                      codePoint = tempCodePoint;
                    }
                  }
                  break;
                case 4:
                  secondByte = buf[i + 1];
                  thirdByte = buf[i + 2];
                  fourthByte = buf[i + 3];
                  if (
                    (secondByte & 192) === 128 &&
                    (thirdByte & 192) === 128 &&
                    (fourthByte & 192) === 128
                  ) {
                    tempCodePoint =
                      ((firstByte & 15) << 18) |
                      ((secondByte & 63) << 12) |
                      ((thirdByte & 63) << 6) |
                      (fourthByte & 63);
                    if (tempCodePoint > 65535 && tempCodePoint < 1114112) {
                      codePoint = tempCodePoint;
                    }
                  }
              }
            }
            if (codePoint === null) {
              codePoint = 65533;
              bytesPerSequence = 1;
            } else if (codePoint > 65535) {
              codePoint -= 65536;
              res.push(((codePoint >>> 10) & 1023) | 55296);
              codePoint = 56320 | (codePoint & 1023);
            }
            res.push(codePoint);
            i += bytesPerSequence;
          }
          return decodeCodePointsArray(res);
        }
        var MAX_ARGUMENTS_LENGTH = 4096;
        function decodeCodePointsArray(codePoints) {
          var len = codePoints.length;
          if (len <= MAX_ARGUMENTS_LENGTH) {
            return String.fromCharCode.apply(String, codePoints);
          }
          var res = "";
          var i = 0;
          while (i < len) {
            res += String.fromCharCode.apply(
              String,
              codePoints.slice(i, (i += MAX_ARGUMENTS_LENGTH))
            );
          }
          return res;
        }
        function asciiSlice(buf, start, end) {
          var ret = "";
          end = Math.min(buf.length, end);
          for (var i = start; i < end; ++i) {
            ret += String.fromCharCode(buf[i] & 127);
          }
          return ret;
        }
        function latin1Slice(buf, start, end) {
          var ret = "";
          end = Math.min(buf.length, end);
          for (var i = start; i < end; ++i) {
            ret += String.fromCharCode(buf[i]);
          }
          return ret;
        }
        function hexSlice(buf, start, end) {
          var len = buf.length;
          if (!start || start < 0) start = 0;
          if (!end || end < 0 || end > len) end = len;
          var out = "";
          for (var i = start; i < end; ++i) {
            out += toHex(buf[i]);
          }
          return out;
        }
        function utf16leSlice(buf, start, end) {
          var bytes = buf.slice(start, end);
          var res = "";
          for (var i = 0; i < bytes.length; i += 2) {
            res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
          }
          return res;
        }
        Buffer.prototype.slice = function slice(start, end) {
          var len = this.length;
          start = ~~start;
          end = end === undefined ? len : ~~end;
          if (start < 0) {
            start += len;
            if (start < 0) start = 0;
          } else if (start > len) {
            start = len;
          }
          if (end < 0) {
            end += len;
            if (end < 0) end = 0;
          } else if (end > len) {
            end = len;
          }
          if (end < start) end = start;
          var newBuf = this.subarray(start, end);
          newBuf.__proto__ = Buffer.prototype;
          return newBuf;
        };
        function checkOffset(offset, ext, length) {
          if (offset % 1 !== 0 || offset < 0)
            throw new RangeError("offset is not uint");
          if (offset + ext > length)
            throw new RangeError("Trying to access beyond buffer length");
        }
        Buffer.prototype.readUIntLE = function readUIntLE(
          offset,
          byteLength,
          noAssert
        ) {
          offset = offset >>> 0;
          byteLength = byteLength >>> 0;
          if (!noAssert) checkOffset(offset, byteLength, this.length);
          var val = this[offset];
          var mul = 1;
          var i = 0;
          while (++i < byteLength && (mul *= 256)) {
            val += this[offset + i] * mul;
          }
          return val;
        };
        Buffer.prototype.readUIntBE = function readUIntBE(
          offset,
          byteLength,
          noAssert
        ) {
          offset = offset >>> 0;
          byteLength = byteLength >>> 0;
          if (!noAssert) {
            checkOffset(offset, byteLength, this.length);
          }
          var val = this[offset + --byteLength];
          var mul = 1;
          while (byteLength > 0 && (mul *= 256)) {
            val += this[offset + --byteLength] * mul;
          }
          return val;
        };
        Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
          offset = offset >>> 0;
          if (!noAssert) checkOffset(offset, 1, this.length);
          return this[offset];
        };
        Buffer.prototype.readUInt16LE = function readUInt16LE(
          offset,
          noAssert
        ) {
          offset = offset >>> 0;
          if (!noAssert) checkOffset(offset, 2, this.length);
          return this[offset] | (this[offset + 1] << 8);
        };
        Buffer.prototype.readUInt16BE = function readUInt16BE(
          offset,
          noAssert
        ) {
          offset = offset >>> 0;
          if (!noAssert) checkOffset(offset, 2, this.length);
          return (this[offset] << 8) | this[offset + 1];
        };
        Buffer.prototype.readUInt32LE = function readUInt32LE(
          offset,
          noAssert
        ) {
          offset = offset >>> 0;
          if (!noAssert) checkOffset(offset, 4, this.length);
          return (
            (this[offset] |
              (this[offset + 1] << 8) |
              (this[offset + 2] << 16)) +
            this[offset + 3] * 16777216
          );
        };
        Buffer.prototype.readUInt32BE = function readUInt32BE(
          offset,
          noAssert
        ) {
          offset = offset >>> 0;
          if (!noAssert) checkOffset(offset, 4, this.length);
          return (
            this[offset] * 16777216 +
            ((this[offset + 1] << 16) |
              (this[offset + 2] << 8) |
              this[offset + 3])
          );
        };
        Buffer.prototype.readIntLE = function readIntLE(
          offset,
          byteLength,
          noAssert
        ) {
          offset = offset >>> 0;
          byteLength = byteLength >>> 0;
          if (!noAssert) checkOffset(offset, byteLength, this.length);
          var val = this[offset];
          var mul = 1;
          var i = 0;
          while (++i < byteLength && (mul *= 256)) {
            val += this[offset + i] * mul;
          }
          mul *= 128;
          if (val >= mul) val -= Math.pow(2, 8 * byteLength);
          return val;
        };
        Buffer.prototype.readIntBE = function readIntBE(
          offset,
          byteLength,
          noAssert
        ) {
          offset = offset >>> 0;
          byteLength = byteLength >>> 0;
          if (!noAssert) checkOffset(offset, byteLength, this.length);
          var i = byteLength;
          var mul = 1;
          var val = this[offset + --i];
          while (i > 0 && (mul *= 256)) {
            val += this[offset + --i] * mul;
          }
          mul *= 128;
          if (val >= mul) val -= Math.pow(2, 8 * byteLength);
          return val;
        };
        Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
          offset = offset >>> 0;
          if (!noAssert) checkOffset(offset, 1, this.length);
          if (!(this[offset] & 128)) return this[offset];
          return (255 - this[offset] + 1) * -1;
        };
        Buffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
          offset = offset >>> 0;
          if (!noAssert) checkOffset(offset, 2, this.length);
          var val = this[offset] | (this[offset + 1] << 8);
          return val & 32768 ? val | 4294901760 : val;
        };
        Buffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
          offset = offset >>> 0;
          if (!noAssert) checkOffset(offset, 2, this.length);
          var val = this[offset + 1] | (this[offset] << 8);
          return val & 32768 ? val | 4294901760 : val;
        };
        Buffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
          offset = offset >>> 0;
          if (!noAssert) checkOffset(offset, 4, this.length);
          return (
            this[offset] |
            (this[offset + 1] << 8) |
            (this[offset + 2] << 16) |
            (this[offset + 3] << 24)
          );
        };
        Buffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
          offset = offset >>> 0;
          if (!noAssert) checkOffset(offset, 4, this.length);
          return (
            (this[offset] << 24) |
            (this[offset + 1] << 16) |
            (this[offset + 2] << 8) |
            this[offset + 3]
          );
        };
        Buffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
          offset = offset >>> 0;
          if (!noAssert) checkOffset(offset, 4, this.length);
          return ieee754.read(this, offset, true, 23, 4);
        };
        Buffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
          offset = offset >>> 0;
          if (!noAssert) checkOffset(offset, 4, this.length);
          return ieee754.read(this, offset, false, 23, 4);
        };
        Buffer.prototype.readDoubleLE = function readDoubleLE(
          offset,
          noAssert
        ) {
          offset = offset >>> 0;
          if (!noAssert) checkOffset(offset, 8, this.length);
          return ieee754.read(this, offset, true, 52, 8);
        };
        Buffer.prototype.readDoubleBE = function readDoubleBE(
          offset,
          noAssert
        ) {
          offset = offset >>> 0;
          if (!noAssert) checkOffset(offset, 8, this.length);
          return ieee754.read(this, offset, false, 52, 8);
        };
        function checkInt(buf, value, offset, ext, max, min) {
          if (!Buffer.isBuffer(buf))
            throw new TypeError('"buffer" argument must be a Buffer instance');
          if (value > max || value < min)
            throw new RangeError('"value" argument is out of bounds');
          if (offset + ext > buf.length)
            throw new RangeError("Index out of range");
        }
        Buffer.prototype.writeUIntLE = function writeUIntLE(
          value,
          offset,
          byteLength,
          noAssert
        ) {
          value = +value;
          offset = offset >>> 0;
          byteLength = byteLength >>> 0;
          if (!noAssert) {
            var maxBytes = Math.pow(2, 8 * byteLength) - 1;
            checkInt(this, value, offset, byteLength, maxBytes, 0);
          }
          var mul = 1;
          var i = 0;
          this[offset] = value & 255;
          while (++i < byteLength && (mul *= 256)) {
            this[offset + i] = (value / mul) & 255;
          }
          return offset + byteLength;
        };
        Buffer.prototype.writeUIntBE = function writeUIntBE(
          value,
          offset,
          byteLength,
          noAssert
        ) {
          value = +value;
          offset = offset >>> 0;
          byteLength = byteLength >>> 0;
          if (!noAssert) {
            var maxBytes = Math.pow(2, 8 * byteLength) - 1;
            checkInt(this, value, offset, byteLength, maxBytes, 0);
          }
          var i = byteLength - 1;
          var mul = 1;
          this[offset + i] = value & 255;
          while (--i >= 0 && (mul *= 256)) {
            this[offset + i] = (value / mul) & 255;
          }
          return offset + byteLength;
        };
        Buffer.prototype.writeUInt8 = function writeUInt8(
          value,
          offset,
          noAssert
        ) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert) checkInt(this, value, offset, 1, 255, 0);
          this[offset] = value & 255;
          return offset + 1;
        };
        Buffer.prototype.writeUInt16LE = function writeUInt16LE(
          value,
          offset,
          noAssert
        ) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
          this[offset] = value & 255;
          this[offset + 1] = value >>> 8;
          return offset + 2;
        };
        Buffer.prototype.writeUInt16BE = function writeUInt16BE(
          value,
          offset,
          noAssert
        ) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
          this[offset] = value >>> 8;
          this[offset + 1] = value & 255;
          return offset + 2;
        };
        Buffer.prototype.writeUInt32LE = function writeUInt32LE(
          value,
          offset,
          noAssert
        ) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
          this[offset + 3] = value >>> 24;
          this[offset + 2] = value >>> 16;
          this[offset + 1] = value >>> 8;
          this[offset] = value & 255;
          return offset + 4;
        };
        Buffer.prototype.writeUInt32BE = function writeUInt32BE(
          value,
          offset,
          noAssert
        ) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
          this[offset] = value >>> 24;
          this[offset + 1] = value >>> 16;
          this[offset + 2] = value >>> 8;
          this[offset + 3] = value & 255;
          return offset + 4;
        };
        Buffer.prototype.writeIntLE = function writeIntLE(
          value,
          offset,
          byteLength,
          noAssert
        ) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert) {
            var limit = Math.pow(2, 8 * byteLength - 1);
            checkInt(this, value, offset, byteLength, limit - 1, -limit);
          }
          var i = 0;
          var mul = 1;
          var sub = 0;
          this[offset] = value & 255;
          while (++i < byteLength && (mul *= 256)) {
            if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
              sub = 1;
            }
            this[offset + i] = (((value / mul) >> 0) - sub) & 255;
          }
          return offset + byteLength;
        };
        Buffer.prototype.writeIntBE = function writeIntBE(
          value,
          offset,
          byteLength,
          noAssert
        ) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert) {
            var limit = Math.pow(2, 8 * byteLength - 1);
            checkInt(this, value, offset, byteLength, limit - 1, -limit);
          }
          var i = byteLength - 1;
          var mul = 1;
          var sub = 0;
          this[offset + i] = value & 255;
          while (--i >= 0 && (mul *= 256)) {
            if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
              sub = 1;
            }
            this[offset + i] = (((value / mul) >> 0) - sub) & 255;
          }
          return offset + byteLength;
        };
        Buffer.prototype.writeInt8 = function writeInt8(
          value,
          offset,
          noAssert
        ) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert) checkInt(this, value, offset, 1, 127, -128);
          if (value < 0) value = 255 + value + 1;
          this[offset] = value & 255;
          return offset + 1;
        };
        Buffer.prototype.writeInt16LE = function writeInt16LE(
          value,
          offset,
          noAssert
        ) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
          this[offset] = value & 255;
          this[offset + 1] = value >>> 8;
          return offset + 2;
        };
        Buffer.prototype.writeInt16BE = function writeInt16BE(
          value,
          offset,
          noAssert
        ) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
          this[offset] = value >>> 8;
          this[offset + 1] = value & 255;
          return offset + 2;
        };
        Buffer.prototype.writeInt32LE = function writeInt32LE(
          value,
          offset,
          noAssert
        ) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert)
            checkInt(this, value, offset, 4, 2147483647, -2147483648);
          this[offset] = value & 255;
          this[offset + 1] = value >>> 8;
          this[offset + 2] = value >>> 16;
          this[offset + 3] = value >>> 24;
          return offset + 4;
        };
        Buffer.prototype.writeInt32BE = function writeInt32BE(
          value,
          offset,
          noAssert
        ) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert)
            checkInt(this, value, offset, 4, 2147483647, -2147483648);
          if (value < 0) value = 4294967295 + value + 1;
          this[offset] = value >>> 24;
          this[offset + 1] = value >>> 16;
          this[offset + 2] = value >>> 8;
          this[offset + 3] = value & 255;
          return offset + 4;
        };
        function checkIEEE754(buf, value, offset, ext, max, min) {
          if (offset + ext > buf.length)
            throw new RangeError("Index out of range");
          if (offset < 0) throw new RangeError("Index out of range");
        }
        function writeFloat(buf, value, offset, littleEndian, noAssert) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert) {
            checkIEEE754(
              buf,
              value,
              offset,
              4,
              3.4028234663852886e38,
              -3.4028234663852886e38
            );
          }
          ieee754.write(buf, value, offset, littleEndian, 23, 4);
          return offset + 4;
        }
        Buffer.prototype.writeFloatLE = function writeFloatLE(
          value,
          offset,
          noAssert
        ) {
          return writeFloat(this, value, offset, true, noAssert);
        };
        Buffer.prototype.writeFloatBE = function writeFloatBE(
          value,
          offset,
          noAssert
        ) {
          return writeFloat(this, value, offset, false, noAssert);
        };
        function writeDouble(buf, value, offset, littleEndian, noAssert) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert) {
            checkIEEE754(
              buf,
              value,
              offset,
              8,
              1.7976931348623157e308,
              -1.7976931348623157e308
            );
          }
          ieee754.write(buf, value, offset, littleEndian, 52, 8);
          return offset + 8;
        }
        Buffer.prototype.writeDoubleLE = function writeDoubleLE(
          value,
          offset,
          noAssert
        ) {
          return writeDouble(this, value, offset, true, noAssert);
        };
        Buffer.prototype.writeDoubleBE = function writeDoubleBE(
          value,
          offset,
          noAssert
        ) {
          return writeDouble(this, value, offset, false, noAssert);
        };
        Buffer.prototype.copy = function copy(target, targetStart, start, end) {
          if (!Buffer.isBuffer(target))
            throw new TypeError("argument should be a Buffer");
          if (!start) start = 0;
          if (!end && end !== 0) end = this.length;
          if (targetStart >= target.length) targetStart = target.length;
          if (!targetStart) targetStart = 0;
          if (end > 0 && end < start) end = start;
          if (end === start) return 0;
          if (target.length === 0 || this.length === 0) return 0;
          if (targetStart < 0) {
            throw new RangeError("targetStart out of bounds");
          }
          if (start < 0 || start >= this.length)
            throw new RangeError("Index out of range");
          if (end < 0) throw new RangeError("sourceEnd out of bounds");
          if (end > this.length) end = this.length;
          if (target.length - targetStart < end - start) {
            end = target.length - targetStart + start;
          }
          var len = end - start;
          if (
            this === target &&
            typeof Uint8Array.prototype.copyWithin === "function"
          ) {
            this.copyWithin(targetStart, start, end);
          } else if (
            this === target &&
            start < targetStart &&
            targetStart < end
          ) {
            for (var i = len - 1; i >= 0; --i) {
              target[i + targetStart] = this[i + start];
            }
          } else {
            Uint8Array.prototype.set.call(
              target,
              this.subarray(start, end),
              targetStart
            );
          }
          return len;
        };
        Buffer.prototype.fill = function fill(val, start, end, encoding) {
          if (typeof val === "string") {
            if (typeof start === "string") {
              encoding = start;
              start = 0;
              end = this.length;
            } else if (typeof end === "string") {
              encoding = end;
              end = this.length;
            }
            if (encoding !== undefined && typeof encoding !== "string") {
              throw new TypeError("encoding must be a string");
            }
            if (typeof encoding === "string" && !Buffer.isEncoding(encoding)) {
              throw new TypeError("Unknown encoding: " + encoding);
            }
            if (val.length === 1) {
              var code = val.charCodeAt(0);
              if (
                (encoding === "utf8" && code < 128) ||
                encoding === "latin1"
              ) {
                val = code;
              }
            }
          } else if (typeof val === "number") {
            val = val & 255;
          }
          if (start < 0 || this.length < start || this.length < end) {
            throw new RangeError("Out of range index");
          }
          if (end <= start) {
            return this;
          }
          start = start >>> 0;
          end = end === undefined ? this.length : end >>> 0;
          if (!val) val = 0;
          var i;
          if (typeof val === "number") {
            for (i = start; i < end; ++i) {
              this[i] = val;
            }
          } else {
            var bytes = Buffer.isBuffer(val) ? val : new Buffer(val, encoding);
            var len = bytes.length;
            if (len === 0) {
              throw new TypeError(
                'The value "' + val + '" is invalid for argument "value"'
              );
            }
            for (i = 0; i < end - start; ++i) {
              this[i + start] = bytes[i % len];
            }
          }
          return this;
        };
        var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;
        function base64clean(str) {
          str = str.split("=")[0];
          str = str.trim().replace(INVALID_BASE64_RE, "");
          if (str.length < 2) return "";
          while (str.length % 4 !== 0) {
            str = str + "=";
          }
          return str;
        }
        function toHex(n) {
          if (n < 16) return "0" + n.toString(16);
          return n.toString(16);
        }
        function utf8ToBytes(string, units) {
          units = units || Infinity;
          var codePoint;
          var length = string.length;
          var leadSurrogate = null;
          var bytes = [];
          for (var i = 0; i < length; ++i) {
            codePoint = string.charCodeAt(i);
            if (codePoint > 55295 && codePoint < 57344) {
              if (!leadSurrogate) {
                if (codePoint > 56319) {
                  if ((units -= 3) > -1) bytes.push(239, 191, 189);
                  continue;
                } else if (i + 1 === length) {
                  if ((units -= 3) > -1) bytes.push(239, 191, 189);
                  continue;
                }
                leadSurrogate = codePoint;
                continue;
              }
              if (codePoint < 56320) {
                if ((units -= 3) > -1) bytes.push(239, 191, 189);
                leadSurrogate = codePoint;
                continue;
              }
              codePoint =
                (((leadSurrogate - 55296) << 10) | (codePoint - 56320)) + 65536;
            } else if (leadSurrogate) {
              if ((units -= 3) > -1) bytes.push(239, 191, 189);
            }
            leadSurrogate = null;
            if (codePoint < 128) {
              if ((units -= 1) < 0) break;
              bytes.push(codePoint);
            } else if (codePoint < 2048) {
              if ((units -= 2) < 0) break;
              bytes.push((codePoint >> 6) | 192, (codePoint & 63) | 128);
            } else if (codePoint < 65536) {
              if ((units -= 3) < 0) break;
              bytes.push(
                (codePoint >> 12) | 224,
                ((codePoint >> 6) & 63) | 128,
                (codePoint & 63) | 128
              );
            } else if (codePoint < 1114112) {
              if ((units -= 4) < 0) break;
              bytes.push(
                (codePoint >> 18) | 240,
                ((codePoint >> 12) & 63) | 128,
                ((codePoint >> 6) & 63) | 128,
                (codePoint & 63) | 128
              );
            } else {
              throw new Error("Invalid code point");
            }
          }
          return bytes;
        }
        function asciiToBytes(str) {
          var byteArray = [];
          for (var i = 0; i < str.length; ++i) {
            byteArray.push(str.charCodeAt(i) & 255);
          }
          return byteArray;
        }
        function utf16leToBytes(str, units) {
          var c, hi, lo;
          var byteArray = [];
          for (var i = 0; i < str.length; ++i) {
            if ((units -= 2) < 0) break;
            c = str.charCodeAt(i);
            hi = c >> 8;
            lo = c % 256;
            byteArray.push(lo);
            byteArray.push(hi);
          }
          return byteArray;
        }
        function base64ToBytes(str) {
          return base64.toByteArray(base64clean(str));
        }
        function blitBuffer(src, dst, offset, length) {
          for (var i = 0; i < length; ++i) {
            if (i + offset >= dst.length || i >= src.length) break;
            dst[i + offset] = src[i];
          }
          return i;
        }
        function isArrayBuffer(obj) {
          return (
            obj instanceof ArrayBuffer ||
            (obj != null &&
              obj.constructor != null &&
              obj.constructor.name === "ArrayBuffer" &&
              typeof obj.byteLength === "number")
          );
        }
        function numberIsNaN(obj) {
          return obj !== obj;
        }
      },
      { "base64-js": 1, ieee754: 3 },
    ],
    3: [
      function (require, module, exports) {
        exports.read = function (buffer, offset, isLE, mLen, nBytes) {
          var e, m;
          var eLen = nBytes * 8 - mLen - 1;
          var eMax = (1 << eLen) - 1;
          var eBias = eMax >> 1;
          var nBits = -7;
          var i = isLE ? nBytes - 1 : 0;
          var d = isLE ? -1 : 1;
          var s = buffer[offset + i];
          i += d;
          e = s & ((1 << -nBits) - 1);
          s >>= -nBits;
          nBits += eLen;
          for (
            ;
            nBits > 0;
            e = e * 256 + buffer[offset + i], i += d, nBits -= 8
          ) {}
          m = e & ((1 << -nBits) - 1);
          e >>= -nBits;
          nBits += mLen;
          for (
            ;
            nBits > 0;
            m = m * 256 + buffer[offset + i], i += d, nBits -= 8
          ) {}
          if (e === 0) {
            e = 1 - eBias;
          } else if (e === eMax) {
            return m ? NaN : (s ? -1 : 1) * Infinity;
          } else {
            m = m + Math.pow(2, mLen);
            e = e - eBias;
          }
          return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
        };
        exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
          var e, m, c;
          var eLen = nBytes * 8 - mLen - 1;
          var eMax = (1 << eLen) - 1;
          var eBias = eMax >> 1;
          var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
          var i = isLE ? 0 : nBytes - 1;
          var d = isLE ? 1 : -1;
          var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;
          value = Math.abs(value);
          if (isNaN(value) || value === Infinity) {
            m = isNaN(value) ? 1 : 0;
            e = eMax;
          } else {
            e = Math.floor(Math.log(value) / Math.LN2);
            if (value * (c = Math.pow(2, -e)) < 1) {
              e--;
              c *= 2;
            }
            if (e + eBias >= 1) {
              value += rt / c;
            } else {
              value += rt * Math.pow(2, 1 - eBias);
            }
            if (value * c >= 2) {
              e++;
              c /= 2;
            }
            if (e + eBias >= eMax) {
              m = 0;
              e = eMax;
            } else if (e + eBias >= 1) {
              m = (value * c - 1) * Math.pow(2, mLen);
              e = e + eBias;
            } else {
              m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
              e = 0;
            }
          }
          for (
            ;
            mLen >= 8;
            buffer[offset + i] = m & 255, i += d, m /= 256, mLen -= 8
          ) {}
          e = (e << mLen) | m;
          eLen += mLen;
          for (
            ;
            eLen > 0;
            buffer[offset + i] = e & 255, i += d, e /= 256, eLen -= 8
          ) {}
          buffer[offset + i - d] |= s * 128;
        };
      },
      {},
    ],
    4: [
      function (require, module, exports) {
        "use strict";
        var _keyStr =
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        exports.encode = function (input, utf8) {
          var output = "";
          var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
          var i = 0;
          while (i < input.length) {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);
            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;
            if (isNaN(chr2)) {
              enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
              enc4 = 64;
            }
            output =
              output +
              _keyStr.charAt(enc1) +
              _keyStr.charAt(enc2) +
              _keyStr.charAt(enc3) +
              _keyStr.charAt(enc4);
          }
          return output;
        };
        exports.decode = function (input, utf8) {
          var output = "";
          var chr1, chr2, chr3;
          var enc1, enc2, enc3, enc4;
          var i = 0;
          input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
          while (i < input.length) {
            enc1 = _keyStr.indexOf(input.charAt(i++));
            enc2 = _keyStr.indexOf(input.charAt(i++));
            enc3 = _keyStr.indexOf(input.charAt(i++));
            enc4 = _keyStr.indexOf(input.charAt(i++));
            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;
            output = output + String.fromCharCode(chr1);
            if (enc3 != 64) {
              output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
              output = output + String.fromCharCode(chr3);
            }
          }
          return output;
        };
      },
      {},
    ],
    5: [
      function (require, module, exports) {
        "use strict";
        function CompressedObject() {
          this.compressedSize = 0;
          this.uncompressedSize = 0;
          this.crc32 = 0;
          this.compressionMethod = null;
          this.compressedContent = null;
        }
        CompressedObject.prototype = {
          getContent: function () {
            return null;
          },
          getCompressedContent: function () {
            return null;
          },
        };
        module.exports = CompressedObject;
      },
      {},
    ],
    6: [
      function (require, module, exports) {
        "use strict";
        exports.STORE = {
          magic: "\0\0",
          compress: function (content) {
            return content;
          },
          uncompress: function (content) {
            return content;
          },
          compressInputType: null,
          uncompressInputType: null,
        };
        exports.DEFLATE = require("./flate");
      },
      { "./flate": 11 },
    ],
    7: [
      function (require, module, exports) {
        "use strict";
        var utils = require("./utils");
        var table = [
          0, 1996959894, 3993919788, 2567524794, 124634137, 1886057615,
          3915621685, 2657392035, 249268274, 2044508324, 3772115230, 2547177864,
          162941995, 2125561021, 3887607047, 2428444049, 498536548, 1789927666,
          4089016648, 2227061214, 450548861, 1843258603, 4107580753, 2211677639,
          325883990, 1684777152, 4251122042, 2321926636, 335633487, 1661365465,
          4195302755, 2366115317, 997073096, 1281953886, 3579855332, 2724688242,
          1006888145, 1258607687, 3524101629, 2768942443, 901097722, 1119000684,
          3686517206, 2898065728, 853044451, 1172266101, 3705015759, 2882616665,
          651767980, 1373503546, 3369554304, 3218104598, 565507253, 1454621731,
          3485111705, 3099436303, 671266974, 1594198024, 3322730930, 2970347812,
          795835527, 1483230225, 3244367275, 3060149565, 1994146192, 31158534,
          2563907772, 4023717930, 1907459465, 112637215, 2680153253, 3904427059,
          2013776290, 251722036, 2517215374, 3775830040, 2137656763, 141376813,
          2439277719, 3865271297, 1802195444, 476864866, 2238001368, 4066508878,
          1812370925, 453092731, 2181625025, 4111451223, 1706088902, 314042704,
          2344532202, 4240017532, 1658658271, 366619977, 2362670323, 4224994405,
          1303535960, 984961486, 2747007092, 3569037538, 1256170817, 1037604311,
          2765210733, 3554079995, 1131014506, 879679996, 2909243462, 3663771856,
          1141124467, 855842277, 2852801631, 3708648649, 1342533948, 654459306,
          3188396048, 3373015174, 1466479909, 544179635, 3110523913, 3462522015,
          1591671054, 702138776, 2966460450, 3352799412, 1504918807, 783551873,
          3082640443, 3233442989, 3988292384, 2596254646, 62317068, 1957810842,
          3939845945, 2647816111, 81470997, 1943803523, 3814918930, 2489596804,
          225274430, 2053790376, 3826175755, 2466906013, 167816743, 2097651377,
          4027552580, 2265490386, 503444072, 1762050814, 4150417245, 2154129355,
          426522225, 1852507879, 4275313526, 2312317920, 282753626, 1742555852,
          4189708143, 2394877945, 397917763, 1622183637, 3604390888, 2714866558,
          953729732, 1340076626, 3518719985, 2797360999, 1068828381, 1219638859,
          3624741850, 2936675148, 906185462, 1090812512, 3747672003, 2825379669,
          829329135, 1181335161, 3412177804, 3160834842, 628085408, 1382605366,
          3423369109, 3138078467, 570562233, 1426400815, 3317316542, 2998733608,
          733239954, 1555261956, 3268935591, 3050360625, 752459403, 1541320221,
          2607071920, 3965973030, 1969922972, 40735498, 2617837225, 3943577151,
          1913087877, 83908371, 2512341634, 3803740692, 2075208622, 213261112,
          2463272603, 3855990285, 2094854071, 198958881, 2262029012, 4057260610,
          1759359992, 534414190, 2176718541, 4139329115, 1873836001, 414664567,
          2282248934, 4279200368, 1711684554, 285281116, 2405801727, 4167216745,
          1634467795, 376229701, 2685067896, 3608007406, 1308918612, 956543938,
          2808555105, 3495958263, 1231636301, 1047427035, 2932959818,
          3654703836, 1088359270, 936918e3, 2847714899, 3736837829, 1202900863,
          817233897, 3183342108, 3401237130, 1404277552, 615818150, 3134207493,
          3453421203, 1423857449, 601450431, 3009837614, 3294710456, 1567103746,
          711928724, 3020668471, 3272380065, 1510334235, 755167117,
        ];
        module.exports = function crc32(input, crc) {
          if (typeof input === "undefined" || !input.length) {
            return 0;
          }
          var isArray = utils.getTypeOf(input) !== "string";
          if (typeof crc == "undefined") {
            crc = 0;
          }
          var x = 0;
          var y = 0;
          var b = 0;
          crc = crc ^ -1;
          for (var i = 0, iTop = input.length; i < iTop; i++) {
            b = isArray ? input[i] : input.charCodeAt(i);
            y = (crc ^ b) & 255;
            x = table[y];
            crc = (crc >>> 8) ^ x;
          }
          return crc ^ -1;
        };
      },
      { "./utils": 24 },
    ],
    8: [
      function (require, module, exports) {
        "use strict";
        var utils = require("./utils");
        function DataReader(data) {
          this.data = null;
          this.length = 0;
          this.index = 0;
        }
        DataReader.prototype = {
          checkOffset: function (offset) {
            this.checkIndex(this.index + offset);
          },
          checkIndex: function (newIndex) {
            if (this.length < newIndex || newIndex < 0) {
              throw new Error(
                "End of data reached (data length = " +
                  this.length +
                  ", asked index = " +
                  newIndex +
                  "). Corrupted zip ?"
              );
            }
          },
          setIndex: function (newIndex) {
            this.checkIndex(newIndex);
            this.index = newIndex;
          },
          skip: function (n) {
            this.setIndex(this.index + n);
          },
          byteAt: function (i) {},
          readInt: function (size) {
            var result = 0,
              i;
            this.checkOffset(size);
            for (i = this.index + size - 1; i >= this.index; i--) {
              result = (result << 8) + this.byteAt(i);
            }
            this.index += size;
            return result;
          },
          readString: function (size) {
            return utils.transformTo("string", this.readData(size));
          },
          readData: function (size) {},
          lastIndexOfSignature: function (sig) {},
          readDate: function () {
            var dostime = this.readInt(4);
            return new Date(
              ((dostime >> 25) & 127) + 1980,
              ((dostime >> 21) & 15) - 1,
              (dostime >> 16) & 31,
              (dostime >> 11) & 31,
              (dostime >> 5) & 63,
              (dostime & 31) << 1
            );
          },
        };
        module.exports = DataReader;
      },
      { "./utils": 24 },
    ],
    9: [
      function (require, module, exports) {
        "use strict";
        exports.base64 = false;
        exports.binary = false;
        exports.dir = false;
        exports.createFolders = false;
        exports.date = null;
        exports.compression = null;
        exports.comment = null;
      },
      {},
    ],
    10: [
      function (require, module, exports) {
        "use strict";
        var utils = require("./utils");
        exports.string2binary = function (str) {
          return utils.string2binary(str);
        };
        exports.string2Uint8Array = function (str) {
          return utils.transformTo("uint8array", str);
        };
        exports.uint8Array2String = function (array) {
          return utils.transformTo("string", array);
        };
        exports.string2Blob = function (str) {
          var buffer = utils.transformTo("arraybuffer", str);
          return utils.arrayBuffer2Blob(buffer);
        };
        exports.arrayBuffer2Blob = function (buffer) {
          return utils.arrayBuffer2Blob(buffer);
        };
        exports.transformTo = function (outputType, input) {
          return utils.transformTo(outputType, input);
        };
        exports.getTypeOf = function (input) {
          return utils.getTypeOf(input);
        };
        exports.checkSupport = function (type) {
          return utils.checkSupport(type);
        };
        exports.MAX_VALUE_16BITS = utils.MAX_VALUE_16BITS;
        exports.MAX_VALUE_32BITS = utils.MAX_VALUE_32BITS;
        exports.pretty = function (str) {
          return utils.pretty(str);
        };
        exports.findCompression = function (compressionMethod) {
          return utils.findCompression(compressionMethod);
        };
        exports.isRegExp = function (object) {
          return utils.isRegExp(object);
        };
      },
      { "./utils": 24 },
    ],
    11: [
      function (require, module, exports) {
        "use strict";
        var USE_TYPEDARRAY =
          typeof Uint8Array !== "undefined" &&
          typeof Uint16Array !== "undefined" &&
          typeof Uint32Array !== "undefined";
        var pako = require("pako");
        exports.uncompressInputType = USE_TYPEDARRAY ? "uint8array" : "array";
        exports.compressInputType = USE_TYPEDARRAY ? "uint8array" : "array";
        exports.magic = "\b\0";
        exports.compress = function (input) {
          return pako.deflateRaw(input);
        };
        exports.uncompress = function (input) {
          return pako.inflateRaw(input);
        };
      },
      { pako: 27 },
    ],
    12: [
      function (require, module, exports) {
        "use strict";
        var base64 = require("./base64");
        function JSZip(data, options) {
          if (!(this instanceof JSZip)) return new JSZip(data, options);
          this.files = {};
          this.comment = null;
          this.root = "";
          if (data) {
            this.load(data, options);
          }
          this.clone = function () {
            var newObj = new JSZip();
            for (var i in this) {
              if (typeof this[i] !== "function") {
                newObj[i] = this[i];
              }
            }
            return newObj;
          };
        }
        JSZip.prototype = require("./object");
        JSZip.prototype.load = require("./load");
        JSZip.support = require("./support");
        JSZip.defaults = require("./defaults");
        JSZip.utils = require("./deprecatedPublicUtils");
        JSZip.base64 = {
          encode: function (input) {
            return base64.encode(input);
          },
          decode: function (input) {
            return base64.decode(input);
          },
        };
        JSZip.compressions = require("./compressions");
        module.exports = JSZip;
      },
      {
        "./base64": 4,
        "./compressions": 6,
        "./defaults": 9,
        "./deprecatedPublicUtils": 10,
        "./load": 13,
        "./object": 16,
        "./support": 20,
      },
    ],
    13: [
      function (require, module, exports) {
        "use strict";
        var base64 = require("./base64");
        var ZipEntries = require("./zipEntries");
        module.exports = function (data, options) {
          var files, zipEntries, i, input;
          options = options || {};
          if (options.base64) {
            data = base64.decode(data);
          }
          zipEntries = new ZipEntries(data, options);
          files = zipEntries.files;
          for (i = 0; i < files.length; i++) {
            input = files[i];
            this.file(input.fileName, input.decompressed, {
              binary: true,
              optimizedBinaryString: true,
              date: input.date,
              dir: input.dir,
              comment: input.fileComment.length ? input.fileComment : null,
              createFolders: options.createFolders,
            });
          }
          if (zipEntries.zipComment.length) {
            this.comment = zipEntries.zipComment;
          }
          return this;
        };
      },
      { "./base64": 4, "./zipEntries": 25 },
    ],
    14: [
      function (require, module, exports) {
        (function (Buffer) {
          "use strict";
          module.exports = function (data, encoding) {
            return new Buffer(data, encoding);
          };
          module.exports.test = function (b) {
            return Buffer.isBuffer(b);
          };
        }).call(this, require("buffer").Buffer);
      },
      { buffer: 2 },
    ],
    15: [
      function (require, module, exports) {
        "use strict";
        var Uint8ArrayReader = require("./uint8ArrayReader");
        function NodeBufferReader(data) {
          this.data = data;
          this.length = this.data.length;
          this.index = 0;
        }
        NodeBufferReader.prototype = new Uint8ArrayReader();
        NodeBufferReader.prototype.readData = function (size) {
          this.checkOffset(size);
          var result = this.data.slice(this.index, this.index + size);
          this.index += size;
          return result;
        };
        module.exports = NodeBufferReader;
      },
      { "./uint8ArrayReader": 21 },
    ],
    16: [
      function (require, module, exports) {
        "use strict";
        var support = require("./support");
        var utils = require("./utils");
        var crc32 = require("./crc32");
        var signature = require("./signature");
        var defaults = require("./defaults");
        var base64 = require("./base64");
        var compressions = require("./compressions");
        var CompressedObject = require("./compressedObject");
        var nodeBuffer = require("./nodeBuffer");
        var utf8 = require("./utf8");
        var StringWriter = require("./stringWriter");
        var Uint8ArrayWriter = require("./uint8ArrayWriter");
        var getRawData = function (file) {
          if (file._data instanceof CompressedObject) {
            file._data = file._data.getContent();
            file.options.binary = true;
            file.options.base64 = false;
            if (utils.getTypeOf(file._data) === "uint8array") {
              var copy = file._data;
              file._data = new Uint8Array(copy.length);
              if (copy.length !== 0) {
                file._data.set(copy, 0);
              }
            }
          }
          return file._data;
        };
        var getBinaryData = function (file) {
          var result = getRawData(file),
            type = utils.getTypeOf(result);
          if (type === "string") {
            if (!file.options.binary) {
              if (support.nodebuffer) {
                return nodeBuffer(result, "utf-8");
              }
            }
            return file.asBinary();
          }
          return result;
        };
        var dataToString = function (asUTF8) {
          var result = getRawData(this);
          if (result === null || typeof result === "undefined") {
            return "";
          }
          if (this.options.base64) {
            result = base64.decode(result);
          }
          if (asUTF8 && this.options.binary) {
            result = out.utf8decode(result);
          } else {
            result = utils.transformTo("string", result);
          }
          if (!asUTF8 && !this.options.binary) {
            result = utils.transformTo("string", out.utf8encode(result));
          }
          return result;
        };
        var ZipObject = function (name, data, options) {
          this.name = name;
          this.dir = options.dir;
          this.date = options.date;
          this.comment = options.comment;
          this._data = data;
          this.options = options;
          this._initialMetadata = { dir: options.dir, date: options.date };
        };
        ZipObject.prototype = {
          asText: function () {
            return dataToString.call(this, true);
          },
          asBinary: function () {
            return dataToString.call(this, false);
          },
          asNodeBuffer: function () {
            var result = getBinaryData(this);
            return utils.transformTo("nodebuffer", result);
          },
          asUint8Array: function () {
            var result = getBinaryData(this);
            return utils.transformTo("uint8array", result);
          },
          asArrayBuffer: function () {
            return this.asUint8Array().buffer;
          },
        };
        var decToHex = function (dec, bytes) {
          var hex = "",
            i;
          for (i = 0; i < bytes; i++) {
            hex += String.fromCharCode(dec & 255);
            dec = dec >>> 8;
          }
          return hex;
        };
        var extend = function () {
          var result = {},
            i,
            attr;
          for (i = 0; i < arguments.length; i++) {
            for (attr in arguments[i]) {
              if (
                arguments[i].hasOwnProperty(attr) &&
                typeof result[attr] === "undefined"
              ) {
                result[attr] = arguments[i][attr];
              }
            }
          }
          return result;
        };
        var prepareFileAttrs = function (o) {
          o = o || {};
          if (
            o.base64 === true &&
            (o.binary === null || o.binary === undefined)
          ) {
            o.binary = true;
          }
          o = extend(o, defaults);
          o.date = o.date || new Date();
          if (o.compression !== null)
            o.compression = o.compression.toUpperCase();
          return o;
        };
        var fileAdd = function (name, data, o) {
          var dataType = utils.getTypeOf(data),
            parent;
          o = prepareFileAttrs(o);
          if (o.createFolders && (parent = parentFolder(name))) {
            folderAdd.call(this, parent, true);
          }
          if (o.dir || data === null || typeof data === "undefined") {
            o.base64 = false;
            o.binary = false;
            data = null;
          } else if (dataType === "string") {
            if (o.binary && !o.base64) {
              if (o.optimizedBinaryString !== true) {
                data = utils.string2binary(data);
              }
            }
          } else {
            o.base64 = false;
            o.binary = true;
            if (!dataType && !(data instanceof CompressedObject)) {
              throw new Error(
                "The data of '" + name + "' is in an unsupported format !"
              );
            }
            if (dataType === "arraybuffer") {
              data = utils.transformTo("uint8array", data);
            }
          }
          var object = new ZipObject(name, data, o);
          this.files[name] = object;
          return object;
        };
        var parentFolder = function (path) {
          if (path.slice(-1) == "/") {
            path = path.substring(0, path.length - 1);
          }
          var lastSlash = path.lastIndexOf("/");
          return lastSlash > 0 ? path.substring(0, lastSlash) : "";
        };
        var folderAdd = function (name, createFolders) {
          if (name.slice(-1) != "/") {
            name += "/";
          }
          createFolders =
            typeof createFolders !== "undefined" ? createFolders : false;
          if (!this.files[name]) {
            fileAdd.call(this, name, null, {
              dir: true,
              createFolders: createFolders,
            });
          }
          return this.files[name];
        };
        var generateCompressedObjectFrom = function (file, compression) {
          var result = new CompressedObject(),
            content;
          if (file._data instanceof CompressedObject) {
            result.uncompressedSize = file._data.uncompressedSize;
            result.crc32 = file._data.crc32;
            if (result.uncompressedSize === 0 || file.dir) {
              compression = compressions["STORE"];
              result.compressedContent = "";
              result.crc32 = 0;
            } else if (file._data.compressionMethod === compression.magic) {
              result.compressedContent = file._data.getCompressedContent();
            } else {
              content = file._data.getContent();
              result.compressedContent = compression.compress(
                utils.transformTo(compression.compressInputType, content)
              );
            }
          } else {
            content = getBinaryData(file);
            if (!content || content.length === 0 || file.dir) {
              compression = compressions["STORE"];
              content = "";
            }
            result.uncompressedSize = content.length;
            result.crc32 = crc32(content);
            result.compressedContent = compression.compress(
              utils.transformTo(compression.compressInputType, content)
            );
          }
          result.compressedSize = result.compressedContent.length;
          result.compressionMethod = compression.magic;
          return result;
        };
        var generateZipParts = function (name, file, compressedObject, offset) {
          var data = compressedObject.compressedContent,
            utfEncodedFileName = utils.transformTo(
              "string",
              utf8.utf8encode(file.name)
            ),
            comment = file.comment || "",
            utfEncodedComment = utils.transformTo(
              "string",
              utf8.utf8encode(comment)
            ),
            useUTF8ForFileName = utfEncodedFileName.length !== file.name.length,
            useUTF8ForComment = utfEncodedComment.length !== comment.length,
            o = file.options,
            dosTime,
            dosDate,
            extraFields = "",
            unicodePathExtraField = "",
            unicodeCommentExtraField = "",
            dir,
            date;
          if (file._initialMetadata.dir !== file.dir) {
            dir = file.dir;
          } else {
            dir = o.dir;
          }
          if (file._initialMetadata.date !== file.date) {
            date = file.date;
          } else {
            date = o.date;
          }
          dosTime = date.getHours();
          dosTime = dosTime << 6;
          dosTime = dosTime | date.getMinutes();
          dosTime = dosTime << 5;
          dosTime = dosTime | (date.getSeconds() / 2);
          dosDate = date.getFullYear() - 1980;
          dosDate = dosDate << 4;
          dosDate = dosDate | (date.getMonth() + 1);
          dosDate = dosDate << 5;
          dosDate = dosDate | date.getDate();
          if (useUTF8ForFileName) {
            unicodePathExtraField =
              decToHex(1, 1) +
              decToHex(crc32(utfEncodedFileName), 4) +
              utfEncodedFileName;
            extraFields +=
              "up" +
              decToHex(unicodePathExtraField.length, 2) +
              unicodePathExtraField;
          }
          if (useUTF8ForComment) {
            unicodeCommentExtraField =
              decToHex(1, 1) +
              decToHex(this.crc32(utfEncodedComment), 4) +
              utfEncodedComment;
            extraFields +=
              "uc" +
              decToHex(unicodeCommentExtraField.length, 2) +
              unicodeCommentExtraField;
          }
          var header = "";
          header += "\n\0";
          header += useUTF8ForFileName || useUTF8ForComment ? "\0\b" : "\0\0";
          header += compressedObject.compressionMethod;
          header += decToHex(dosTime, 2);
          header += decToHex(dosDate, 2);
          header += decToHex(compressedObject.crc32, 4);
          header += decToHex(compressedObject.compressedSize, 4);
          header += decToHex(compressedObject.uncompressedSize, 4);
          header += decToHex(utfEncodedFileName.length, 2);
          header += decToHex(extraFields.length, 2);
          var fileRecord =
            signature.LOCAL_FILE_HEADER +
            header +
            utfEncodedFileName +
            extraFields;
          var dirRecord =
            signature.CENTRAL_FILE_HEADER +
            "\0" +
            header +
            decToHex(utfEncodedComment.length, 2) +
            "\0\0" +
            "\0\0" +
            (dir === true ? "\0\0\0" : "\0\0\0\0") +
            decToHex(offset, 4) +
            utfEncodedFileName +
            extraFields +
            utfEncodedComment;
          return {
            fileRecord: fileRecord,
            dirRecord: dirRecord,
            compressedObject: compressedObject,
          };
        };
        var out = {
          load: function (stream, options) {
            throw new Error(
              "Load method is not defined. Is the file jszip-load.js included ?"
            );
          },
          filter: function (search) {
            var result = [],
              filename,
              relativePath,
              file,
              fileClone;
            for (filename in this.files) {
              if (!this.files.hasOwnProperty(filename)) {
                continue;
              }
              file = this.files[filename];
              fileClone = new ZipObject(
                file.name,
                file._data,
                extend(file.options)
              );
              relativePath = filename.slice(this.root.length, filename.length);
              if (
                filename.slice(0, this.root.length) === this.root &&
                search(relativePath, fileClone)
              ) {
                result.push(fileClone);
              }
            }
            return result;
          },
          file: function (name, data, o) {
            if (arguments.length === 1) {
              if (utils.isRegExp(name)) {
                var regexp = name;
                return this.filter(function (relativePath, file) {
                  return !file.dir && regexp.test(relativePath);
                });
              } else {
                return (
                  this.filter(function (relativePath, file) {
                    return !file.dir && relativePath === name;
                  })[0] || null
                );
              }
            } else {
              name = this.root + name;
              fileAdd.call(this, name, data, o);
            }
            return this;
          },
          folder: function (arg) {
            if (!arg) {
              return this;
            }
            if (utils.isRegExp(arg)) {
              return this.filter(function (relativePath, file) {
                return file.dir && arg.test(relativePath);
              });
            }
            var name = this.root + arg;
            var newFolder = folderAdd.call(this, name);
            var ret = this.clone();
            ret.root = newFolder.name;
            return ret;
          },
          remove: function (name) {
            name = this.root + name;
            var file = this.files[name];
            if (!file) {
              if (name.slice(-1) != "/") {
                name += "/";
              }
              file = this.files[name];
            }
            if (file && !file.dir) {
              delete this.files[name];
            } else {
              var kids = this.filter(function (relativePath, file) {
                return file.name.slice(0, name.length) === name;
              });
              for (var i = 0; i < kids.length; i++) {
                delete this.files[kids[i].name];
              }
            }
            return this;
          },
          generate: function (options) {
            options = extend(options || {}, {
              base64: true,
              compression: "STORE",
              type: "base64",
              comment: null,
            });
            utils.checkSupport(options.type);
            var zipData = [],
              localDirLength = 0,
              centralDirLength = 0,
              writer,
              i,
              utfEncodedComment = utils.transformTo(
                "string",
                this.utf8encode(options.comment || this.comment || "")
              );
            for (var name in this.files) {
              if (!this.files.hasOwnProperty(name)) {
                continue;
              }
              var file = this.files[name];
              var compressionName =
                file.options.compression || options.compression.toUpperCase();
              var compression = compressions[compressionName];
              if (!compression) {
                throw new Error(
                  compressionName + " is not a valid compression method !"
                );
              }
              var compressedObject = generateCompressedObjectFrom.call(
                this,
                file,
                compression
              );
              var zipPart = generateZipParts.call(
                this,
                name,
                file,
                compressedObject,
                localDirLength
              );
              localDirLength +=
                zipPart.fileRecord.length + compressedObject.compressedSize;
              centralDirLength += zipPart.dirRecord.length;
              zipData.push(zipPart);
            }
            var dirEnd = "";
            dirEnd =
              signature.CENTRAL_DIRECTORY_END +
              "\0\0" +
              "\0\0" +
              decToHex(zipData.length, 2) +
              decToHex(zipData.length, 2) +
              decToHex(centralDirLength, 4) +
              decToHex(localDirLength, 4) +
              decToHex(utfEncodedComment.length, 2) +
              utfEncodedComment;
            var typeName = options.type.toLowerCase();
            if (
              typeName === "uint8array" ||
              typeName === "arraybuffer" ||
              typeName === "blob" ||
              typeName === "nodebuffer"
            ) {
              writer = new Uint8ArrayWriter(
                localDirLength + centralDirLength + dirEnd.length
              );
            } else {
              writer = new StringWriter(
                localDirLength + centralDirLength + dirEnd.length
              );
            }
            for (i = 0; i < zipData.length; i++) {
              writer.append(zipData[i].fileRecord);
              writer.append(zipData[i].compressedObject.compressedContent);
            }
            for (i = 0; i < zipData.length; i++) {
              writer.append(zipData[i].dirRecord);
            }
            writer.append(dirEnd);
            var zip = writer.finalize();
            switch (options.type.toLowerCase()) {
              case "uint8array":
              case "arraybuffer":
              case "nodebuffer":
                return utils.transformTo(options.type.toLowerCase(), zip);
              case "blob":
                return utils.arrayBuffer2Blob(
                  utils.transformTo("arraybuffer", zip)
                );
              case "base64":
                return options.base64 ? base64.encode(zip) : zip;
              default:
                return zip;
            }
          },
          crc32: function (input, crc) {
            return crc32(input, crc);
          },
          utf8encode: function (string) {
            return utils.transformTo("string", utf8.utf8encode(string));
          },
          utf8decode: function (input) {
            return utf8.utf8decode(input);
          },
        };
        module.exports = out;
      },
      {
        "./base64": 4,
        "./compressedObject": 5,
        "./compressions": 6,
        "./crc32": 7,
        "./defaults": 9,
        "./nodeBuffer": 14,
        "./signature": 17,
        "./stringWriter": 19,
        "./support": 20,
        "./uint8ArrayWriter": 22,
        "./utf8": 23,
        "./utils": 24,
      },
    ],
    17: [
      function (require, module, exports) {
        "use strict";
        exports.LOCAL_FILE_HEADER = "PK";
        exports.CENTRAL_FILE_HEADER = "PK";
        exports.CENTRAL_DIRECTORY_END = "PK";
        exports.ZIP64_CENTRAL_DIRECTORY_LOCATOR = "PK";
        exports.ZIP64_CENTRAL_DIRECTORY_END = "PK";
        exports.DATA_DESCRIPTOR = "PK\b";
      },
      {},
    ],
    18: [
      function (require, module, exports) {
        "use strict";
        var DataReader = require("./dataReader");
        var utils = require("./utils");
        function StringReader(data, optimizedBinaryString) {
          this.data = data;
          if (!optimizedBinaryString) {
            this.data = utils.string2binary(this.data);
          }
          this.length = this.data.length;
          this.index = 0;
        }
        StringReader.prototype = new DataReader();
        StringReader.prototype.byteAt = function (i) {
          return this.data.charCodeAt(i);
        };
        StringReader.prototype.lastIndexOfSignature = function (sig) {
          return this.data.lastIndexOf(sig);
        };
        StringReader.prototype.readData = function (size) {
          this.checkOffset(size);
          var result = this.data.slice(this.index, this.index + size);
          this.index += size;
          return result;
        };
        module.exports = StringReader;
      },
      { "./dataReader": 8, "./utils": 24 },
    ],
    19: [
      function (require, module, exports) {
        "use strict";
        var utils = require("./utils");
        var StringWriter = function () {
          this.data = [];
        };
        StringWriter.prototype = {
          append: function (input) {
            input = utils.transformTo("string", input);
            this.data.push(input);
          },
          finalize: function () {
            return this.data.join("");
          },
        };
        module.exports = StringWriter;
      },
      { "./utils": 24 },
    ],
    20: [
      function (require, module, exports) {
        (function (Buffer) {
          "use strict";
          exports.base64 = true;
          exports.array = true;
          exports.string = true;
          exports.arraybuffer =
            typeof ArrayBuffer !== "undefined" &&
            typeof Uint8Array !== "undefined";
          exports.nodebuffer = typeof Buffer !== "undefined";
          exports.uint8array = typeof Uint8Array !== "undefined";
          if (typeof ArrayBuffer === "undefined") {
            exports.blob = false;
          } else {
            var buffer = new ArrayBuffer(0);
            try {
              exports.blob =
                new Blob([buffer], { type: "application/zip" }).size === 0;
            } catch (e) {
              try {
                var Builder =
                  window.BlobBuilder ||
                  window.WebKitBlobBuilder ||
                  window.MozBlobBuilder ||
                  window.MSBlobBuilder;
                var builder = new Builder();
                builder.append(buffer);
                exports.blob = builder.getBlob("application/zip").size === 0;
              } catch (e) {
                exports.blob = false;
              }
            }
          }
        }).call(this, require("buffer").Buffer);
      },
      { buffer: 2 },
    ],
    21: [
      function (require, module, exports) {
        "use strict";
        var DataReader = require("./dataReader");
        function Uint8ArrayReader(data) {
          if (data) {
            this.data = data;
            this.length = this.data.length;
            this.index = 0;
          }
        }
        Uint8ArrayReader.prototype = new DataReader();
        Uint8ArrayReader.prototype.byteAt = function (i) {
          return this.data[i];
        };
        Uint8ArrayReader.prototype.lastIndexOfSignature = function (sig) {
          var sig0 = sig.charCodeAt(0),
            sig1 = sig.charCodeAt(1),
            sig2 = sig.charCodeAt(2),
            sig3 = sig.charCodeAt(3);
          for (var i = this.length - 4; i >= 0; --i) {
            if (
              this.data[i] === sig0 &&
              this.data[i + 1] === sig1 &&
              this.data[i + 2] === sig2 &&
              this.data[i + 3] === sig3
            ) {
              return i;
            }
          }
          return -1;
        };
        Uint8ArrayReader.prototype.readData = function (size) {
          this.checkOffset(size);
          if (size === 0) {
            return new Uint8Array(0);
          }
          var result = this.data.subarray(this.index, this.index + size);
          this.index += size;
          return result;
        };
        module.exports = Uint8ArrayReader;
      },
      { "./dataReader": 8 },
    ],
    22: [
      function (require, module, exports) {
        "use strict";
        var utils = require("./utils");
        var Uint8ArrayWriter = function (length) {
          this.data = new Uint8Array(length);
          this.index = 0;
        };
        Uint8ArrayWriter.prototype = {
          append: function (input) {
            if (input.length !== 0) {
              input = utils.transformTo("uint8array", input);
              this.data.set(input, this.index);
              this.index += input.length;
            }
          },
          finalize: function () {
            return this.data;
          },
        };
        module.exports = Uint8ArrayWriter;
      },
      { "./utils": 24 },
    ],
    23: [
      function (require, module, exports) {
        "use strict";
        var utils = require("./utils");
        var support = require("./support");
        var nodeBuffer = require("./nodeBuffer");
        var _utf8len = new Array(256);
        for (var i = 0; i < 256; i++) {
          _utf8len[i] =
            i >= 252
              ? 6
              : i >= 248
              ? 5
              : i >= 240
              ? 4
              : i >= 224
              ? 3
              : i >= 192
              ? 2
              : 1;
        }
        _utf8len[254] = _utf8len[254] = 1;
        var string2buf = function (str) {
          var buf,
            c,
            c2,
            m_pos,
            i,
            str_len = str.length,
            buf_len = 0;
          for (m_pos = 0; m_pos < str_len; m_pos++) {
            c = str.charCodeAt(m_pos);
            if ((c & 64512) === 55296 && m_pos + 1 < str_len) {
              c2 = str.charCodeAt(m_pos + 1);
              if ((c2 & 64512) === 56320) {
                c = 65536 + ((c - 55296) << 10) + (c2 - 56320);
                m_pos++;
              }
            }
            buf_len += c < 128 ? 1 : c < 2048 ? 2 : c < 65536 ? 3 : 4;
          }
          if (support.uint8array) {
            buf = new Uint8Array(buf_len);
          } else {
            buf = new Array(buf_len);
          }
          for (i = 0, m_pos = 0; i < buf_len; m_pos++) {
            c = str.charCodeAt(m_pos);
            if ((c & 64512) === 55296 && m_pos + 1 < str_len) {
              c2 = str.charCodeAt(m_pos + 1);
              if ((c2 & 64512) === 56320) {
                c = 65536 + ((c - 55296) << 10) + (c2 - 56320);
                m_pos++;
              }
            }
            if (c < 128) {
              buf[i++] = c;
            } else if (c < 2048) {
              buf[i++] = 192 | (c >>> 6);
              buf[i++] = 128 | (c & 63);
            } else if (c < 65536) {
              buf[i++] = 224 | (c >>> 12);
              buf[i++] = 128 | ((c >>> 6) & 63);
              buf[i++] = 128 | (c & 63);
            } else {
              buf[i++] = 240 | (c >>> 18);
              buf[i++] = 128 | ((c >>> 12) & 63);
              buf[i++] = 128 | ((c >>> 6) & 63);
              buf[i++] = 128 | (c & 63);
            }
          }
          return buf;
        };
        var utf8border = function (buf, max) {
          var pos;
          max = max || buf.length;
          if (max > buf.length) {
            max = buf.length;
          }
          pos = max - 1;
          while (pos >= 0 && (buf[pos] & 192) === 128) {
            pos--;
          }
          if (pos < 0) {
            return max;
          }
          if (pos === 0) {
            return max;
          }
          return pos + _utf8len[buf[pos]] > max ? pos : max;
        };
        var buf2string = function (buf) {
          var str, i, out, c, c_len;
          var len = buf.length;
          var utf16buf = new Array(len * 2);
          for (out = 0, i = 0; i < len; ) {
            c = buf[i++];
            if (c < 128) {
              utf16buf[out++] = c;
              continue;
            }
            c_len = _utf8len[c];
            if (c_len > 4) {
              utf16buf[out++] = 65533;
              i += c_len - 1;
              continue;
            }
            c &= c_len === 2 ? 31 : c_len === 3 ? 15 : 7;
            while (c_len > 1 && i < len) {
              c = (c << 6) | (buf[i++] & 63);
              c_len--;
            }
            if (c_len > 1) {
              utf16buf[out++] = 65533;
              continue;
            }
            if (c < 65536) {
              utf16buf[out++] = c;
            } else {
              c -= 65536;
              utf16buf[out++] = 55296 | ((c >> 10) & 1023);
              utf16buf[out++] = 56320 | (c & 1023);
            }
          }
          if (utf16buf.length !== out) {
            if (utf16buf.subarray) {
              utf16buf = utf16buf.subarray(0, out);
            } else {
              utf16buf.length = out;
            }
          }
          return utils.applyFromCharCode(utf16buf);
        };
        exports.utf8encode = function utf8encode(str) {
          if (support.nodebuffer) {
            return nodeBuffer(str, "utf-8");
          }
          return string2buf(str);
        };
        exports.utf8decode = function utf8decode(buf) {
          if (support.nodebuffer) {
            return utils.transformTo("nodebuffer", buf).toString("utf-8");
          }
          buf = utils.transformTo(
            support.uint8array ? "uint8array" : "array",
            buf
          );
          var result = [],
            k = 0,
            len = buf.length,
            chunk = 65536;
          while (k < len) {
            var nextBoundary = utf8border(buf, Math.min(k + chunk, len));
            if (support.uint8array) {
              result.push(buf2string(buf.subarray(k, nextBoundary)));
            } else {
              result.push(buf2string(buf.slice(k, nextBoundary)));
            }
            k = nextBoundary;
          }
          return result.join("");
        };
      },
      { "./nodeBuffer": 14, "./support": 20, "./utils": 24 },
    ],
    24: [
      function (require, module, exports) {
        "use strict";
        var support = require("./support");
        var compressions = require("./compressions");
        var nodeBuffer = require("./nodeBuffer");
        exports.string2binary = function (str) {
          var result = "";
          for (var i = 0; i < str.length; i++) {
            result += String.fromCharCode(str.charCodeAt(i) & 255);
          }
          return result;
        };
        exports.arrayBuffer2Blob = function (buffer) {
          exports.checkSupport("blob");
          try {
            return new Blob([buffer], { type: "application/zip" });
          } catch (e) {
            try {
              var Builder =
                window.BlobBuilder ||
                window.WebKitBlobBuilder ||
                window.MozBlobBuilder ||
                window.MSBlobBuilder;
              var builder = new Builder();
              builder.append(buffer);
              return builder.getBlob("application/zip");
            } catch (e) {
              throw new Error("Bug : can't construct the Blob.");
            }
          }
        };
        function identity(input) {
          return input;
        }
        function stringToArrayLike(str, array) {
          for (var i = 0; i < str.length; ++i) {
            array[i] = str.charCodeAt(i) & 255;
          }
          return array;
        }
        function arrayLikeToString(array) {
          var chunk = 65536;
          var result = [],
            len = array.length,
            type = exports.getTypeOf(array),
            k = 0,
            canUseApply = true;
          try {
            switch (type) {
              case "uint8array":
                String.fromCharCode.apply(null, new Uint8Array(0));
                break;
              case "nodebuffer":
                String.fromCharCode.apply(null, nodeBuffer(0));
                break;
            }
          } catch (e) {
            canUseApply = false;
          }
          if (!canUseApply) {
            var resultStr = "";
            for (var i = 0; i < array.length; i++) {
              resultStr += String.fromCharCode(array[i]);
            }
            return resultStr;
          }
          while (k < len && chunk > 1) {
            try {
              if (type === "array" || type === "nodebuffer") {
                result.push(
                  String.fromCharCode.apply(
                    null,
                    array.slice(k, Math.min(k + chunk, len))
                  )
                );
              } else {
                result.push(
                  String.fromCharCode.apply(
                    null,
                    array.subarray(k, Math.min(k + chunk, len))
                  )
                );
              }
              k += chunk;
            } catch (e) {
              chunk = Math.floor(chunk / 2);
            }
          }
          return result.join("");
        }
        exports.applyFromCharCode = arrayLikeToString;
        function arrayLikeToArrayLike(arrayFrom, arrayTo) {
          for (var i = 0; i < arrayFrom.length; i++) {
            arrayTo[i] = arrayFrom[i];
          }
          return arrayTo;
        }
        var transform = {};
        transform["string"] = {
          string: identity,
          array: function (input) {
            return stringToArrayLike(input, new Array(input.length));
          },
          arraybuffer: function (input) {
            return transform["string"]["uint8array"](input).buffer;
          },
          uint8array: function (input) {
            return stringToArrayLike(input, new Uint8Array(input.length));
          },
          nodebuffer: function (input) {
            return stringToArrayLike(input, nodeBuffer(input.length));
          },
        };
        transform["array"] = {
          string: arrayLikeToString,
          array: identity,
          arraybuffer: function (input) {
            return new Uint8Array(input).buffer;
          },
          uint8array: function (input) {
            return new Uint8Array(input);
          },
          nodebuffer: function (input) {
            return nodeBuffer(input);
          },
        };
        transform["arraybuffer"] = {
          string: function (input) {
            return arrayLikeToString(new Uint8Array(input));
          },
          array: function (input) {
            return arrayLikeToArrayLike(
              new Uint8Array(input),
              new Array(input.byteLength)
            );
          },
          arraybuffer: identity,
          uint8array: function (input) {
            return new Uint8Array(input);
          },
          nodebuffer: function (input) {
            return nodeBuffer(new Uint8Array(input));
          },
        };
        transform["uint8array"] = {
          string: arrayLikeToString,
          array: function (input) {
            return arrayLikeToArrayLike(input, new Array(input.length));
          },
          arraybuffer: function (input) {
            return input.buffer;
          },
          uint8array: identity,
          nodebuffer: function (input) {
            return nodeBuffer(input);
          },
        };
        transform["nodebuffer"] = {
          string: arrayLikeToString,
          array: function (input) {
            return arrayLikeToArrayLike(input, new Array(input.length));
          },
          arraybuffer: function (input) {
            return transform["nodebuffer"]["uint8array"](input).buffer;
          },
          uint8array: function (input) {
            return arrayLikeToArrayLike(input, new Uint8Array(input.length));
          },
          nodebuffer: identity,
        };
        exports.transformTo = function (outputType, input) {
          if (!input) {
            input = "";
          }
          if (!outputType) {
            return input;
          }
          exports.checkSupport(outputType);
          var inputType = exports.getTypeOf(input);
          var result = transform[inputType][outputType](input);
          return result;
        };
        exports.getTypeOf = function (input) {
          if (typeof input === "string") {
            return "string";
          }
          if (Object.prototype.toString.call(input) === "[object Array]") {
            return "array";
          }
          if (support.nodebuffer && nodeBuffer.test(input)) {
            return "nodebuffer";
          }
          if (support.uint8array && input instanceof Uint8Array) {
            return "uint8array";
          }
          if (support.arraybuffer && input instanceof ArrayBuffer) {
            return "arraybuffer";
          }
        };
        exports.checkSupport = function (type) {
          var supported = support[type.toLowerCase()];
          if (!supported) {
            throw new Error(type + " is not supported by this browser");
          }
        };
        exports.MAX_VALUE_16BITS = 65535;
        exports.MAX_VALUE_32BITS = -1;
        exports.pretty = function (str) {
          var res = "",
            code,
            i;
          for (i = 0; i < (str || "").length; i++) {
            code = str.charCodeAt(i);
            res +=
              "\\x" + (code < 16 ? "0" : "") + code.toString(16).toUpperCase();
          }
          return res;
        };
        exports.findCompression = function (compressionMethod) {
          for (var method in compressions) {
            if (!compressions.hasOwnProperty(method)) {
              continue;
            }
            if (compressions[method].magic === compressionMethod) {
              return compressions[method];
            }
          }
          return null;
        };
        exports.isRegExp = function (object) {
          return Object.prototype.toString.call(object) === "[object RegExp]";
        };
      },
      { "./compressions": 6, "./nodeBuffer": 14, "./support": 20 },
    ],
    25: [
      function (require, module, exports) {
        "use strict";
        var StringReader = require("./stringReader");
        var NodeBufferReader = require("./nodeBufferReader");
        var Uint8ArrayReader = require("./uint8ArrayReader");
        var utils = require("./utils");
        var sig = require("./signature");
        var ZipEntry = require("./zipEntry");
        var support = require("./support");
        var jszipProto = require("./object");
        function ZipEntries(data, loadOptions) {
          this.files = [];
          this.loadOptions = loadOptions;
          if (data) {
            this.load(data);
          }
        }
        ZipEntries.prototype = {
          checkSignature: function (expectedSignature) {
            var signature = this.reader.readString(4);
            if (signature !== expectedSignature) {
              throw new Error(
                "Corrupted zip or bug : unexpected signature " +
                  "(" +
                  utils.pretty(signature) +
                  ", expected " +
                  utils.pretty(expectedSignature) +
                  ")"
              );
            }
          },
          readBlockEndOfCentral: function () {
            this.diskNumber = this.reader.readInt(2);
            this.diskWithCentralDirStart = this.reader.readInt(2);
            this.centralDirRecordsOnThisDisk = this.reader.readInt(2);
            this.centralDirRecords = this.reader.readInt(2);
            this.centralDirSize = this.reader.readInt(4);
            this.centralDirOffset = this.reader.readInt(4);
            this.zipCommentLength = this.reader.readInt(2);
            this.zipComment = this.reader.readString(this.zipCommentLength);
            this.zipComment = jszipProto.utf8decode(this.zipComment);
          },
          readBlockZip64EndOfCentral: function () {
            this.zip64EndOfCentralSize = this.reader.readInt(8);
            this.versionMadeBy = this.reader.readString(2);
            this.versionNeeded = this.reader.readInt(2);
            this.diskNumber = this.reader.readInt(4);
            this.diskWithCentralDirStart = this.reader.readInt(4);
            this.centralDirRecordsOnThisDisk = this.reader.readInt(8);
            this.centralDirRecords = this.reader.readInt(8);
            this.centralDirSize = this.reader.readInt(8);
            this.centralDirOffset = this.reader.readInt(8);
            this.zip64ExtensibleData = {};
            var extraDataSize = this.zip64EndOfCentralSize - 44,
              index = 0,
              extraFieldId,
              extraFieldLength,
              extraFieldValue;
            while (index < extraDataSize) {
              extraFieldId = this.reader.readInt(2);
              extraFieldLength = this.reader.readInt(4);
              extraFieldValue = this.reader.readString(extraFieldLength);
              this.zip64ExtensibleData[extraFieldId] = {
                id: extraFieldId,
                length: extraFieldLength,
                value: extraFieldValue,
              };
            }
          },
          readBlockZip64EndOfCentralLocator: function () {
            this.diskWithZip64CentralDirStart = this.reader.readInt(4);
            this.relativeOffsetEndOfZip64CentralDir = this.reader.readInt(8);
            this.disksCount = this.reader.readInt(4);
            if (this.disksCount > 1) {
              throw new Error("Multi-volumes zip are not supported");
            }
          },
          readLocalFiles: function () {
            var i, file;
            for (i = 0; i < this.files.length; i++) {
              file = this.files[i];
              this.reader.setIndex(file.localHeaderOffset);
              this.checkSignature(sig.LOCAL_FILE_HEADER);
              file.readLocalPart(this.reader);
              file.handleUTF8();
            }
          },
          readCentralDir: function () {
            var file;
            this.reader.setIndex(this.centralDirOffset);
            while (this.reader.readString(4) === sig.CENTRAL_FILE_HEADER) {
              file = new ZipEntry({ zip64: this.zip64 }, this.loadOptions);
              file.readCentralPart(this.reader);
              this.files.push(file);
            }
          },
          readEndOfCentral: function () {
            var offset = this.reader.lastIndexOfSignature(
              sig.CENTRAL_DIRECTORY_END
            );
            if (offset === -1) {
              throw new Error(
                "Corrupted zip : can't find end of central directory"
              );
            }
            this.reader.setIndex(offset);
            this.checkSignature(sig.CENTRAL_DIRECTORY_END);
            this.readBlockEndOfCentral();
            if (
              this.diskNumber === utils.MAX_VALUE_16BITS ||
              this.diskWithCentralDirStart === utils.MAX_VALUE_16BITS ||
              this.centralDirRecordsOnThisDisk === utils.MAX_VALUE_16BITS ||
              this.centralDirRecords === utils.MAX_VALUE_16BITS ||
              this.centralDirSize === utils.MAX_VALUE_32BITS ||
              this.centralDirOffset === utils.MAX_VALUE_32BITS
            ) {
              this.zip64 = true;
              offset = this.reader.lastIndexOfSignature(
                sig.ZIP64_CENTRAL_DIRECTORY_LOCATOR
              );
              if (offset === -1) {
                throw new Error(
                  "Corrupted zip : can't find the ZIP64 end of central directory locator"
                );
              }
              this.reader.setIndex(offset);
              this.checkSignature(sig.ZIP64_CENTRAL_DIRECTORY_LOCATOR);
              this.readBlockZip64EndOfCentralLocator();
              this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir);
              this.checkSignature(sig.ZIP64_CENTRAL_DIRECTORY_END);
              this.readBlockZip64EndOfCentral();
            }
          },
          prepareReader: function (data) {
            var type = utils.getTypeOf(data);
            if (type === "string" && !support.uint8array) {
              this.reader = new StringReader(
                data,
                this.loadOptions.optimizedBinaryString
              );
            } else if (type === "nodebuffer") {
              this.reader = new NodeBufferReader(data);
            } else {
              this.reader = new Uint8ArrayReader(
                utils.transformTo("uint8array", data)
              );
            }
          },
          load: function (data) {
            this.prepareReader(data);
            this.readEndOfCentral();
            this.readCentralDir();
            this.readLocalFiles();
          },
        };
        module.exports = ZipEntries;
      },
      {
        "./nodeBufferReader": 15,
        "./object": 16,
        "./signature": 17,
        "./stringReader": 18,
        "./support": 20,
        "./uint8ArrayReader": 21,
        "./utils": 24,
        "./zipEntry": 26,
      },
    ],
    26: [
      function (require, module, exports) {
        "use strict";
        var StringReader = require("./stringReader");
        var utils = require("./utils");
        var CompressedObject = require("./compressedObject");
        var jszipProto = require("./object");
        function ZipEntry(options, loadOptions) {
          this.options = options;
          this.loadOptions = loadOptions;
        }
        ZipEntry.prototype = {
          isEncrypted: function () {
            return (this.bitFlag & 1) === 1;
          },
          useUTF8: function () {
            return (this.bitFlag & 2048) === 2048;
          },
          prepareCompressedContent: function (reader, from, length) {
            return function () {
              var previousIndex = reader.index;
              reader.setIndex(from);
              var compressedFileData = reader.readData(length);
              reader.setIndex(previousIndex);
              return compressedFileData;
            };
          },
          prepareContent: function (
            reader,
            from,
            length,
            compression,
            uncompressedSize
          ) {
            return function () {
              var compressedFileData = utils.transformTo(
                compression.uncompressInputType,
                this.getCompressedContent()
              );
              var uncompressedFileData =
                compression.uncompress(compressedFileData);
              if (uncompressedFileData.length !== uncompressedSize) {
                throw new Error("Bug : uncompressed data size mismatch");
              }
              return uncompressedFileData;
            };
          },
          readLocalPart: function (reader) {
            var compression, localExtraFieldsLength;
            reader.skip(22);
            this.fileNameLength = reader.readInt(2);
            localExtraFieldsLength = reader.readInt(2);
            this.fileName = reader.readString(this.fileNameLength);
            reader.skip(localExtraFieldsLength);
            if (this.compressedSize == -1 || this.uncompressedSize == -1) {
              throw new Error(
                "Bug or corrupted zip : didn't get enough informations from the central directory " +
                  "(compressedSize == -1 || uncompressedSize == -1)"
              );
            }
            compression = utils.findCompression(this.compressionMethod);
            if (compression === null) {
              throw new Error(
                "Corrupted zip : compression " +
                  utils.pretty(this.compressionMethod) +
                  " unknown (inner file : " +
                  this.fileName +
                  ")"
              );
            }
            this.decompressed = new CompressedObject();
            this.decompressed.compressedSize = this.compressedSize;
            this.decompressed.uncompressedSize = this.uncompressedSize;
            this.decompressed.crc32 = this.crc32;
            this.decompressed.compressionMethod = this.compressionMethod;
            this.decompressed.getCompressedContent =
              this.prepareCompressedContent(
                reader,
                reader.index,
                this.compressedSize,
                compression
              );
            this.decompressed.getContent = this.prepareContent(
              reader,
              reader.index,
              this.compressedSize,
              compression,
              this.uncompressedSize
            );
            if (this.loadOptions.checkCRC32) {
              this.decompressed = utils.transformTo(
                "string",
                this.decompressed.getContent()
              );
              if (jszipProto.crc32(this.decompressed) !== this.crc32) {
                throw new Error("Corrupted zip : CRC32 mismatch");
              }
            }
          },
          readCentralPart: function (reader) {
            this.versionMadeBy = reader.readString(2);
            this.versionNeeded = reader.readInt(2);
            this.bitFlag = reader.readInt(2);
            this.compressionMethod = reader.readString(2);
            this.date = reader.readDate();
            this.crc32 = reader.readInt(4);
            this.compressedSize = reader.readInt(4);
            this.uncompressedSize = reader.readInt(4);
            this.fileNameLength = reader.readInt(2);
            this.extraFieldsLength = reader.readInt(2);
            this.fileCommentLength = reader.readInt(2);
            this.diskNumberStart = reader.readInt(2);
            this.internalFileAttributes = reader.readInt(2);
            this.externalFileAttributes = reader.readInt(4);
            this.localHeaderOffset = reader.readInt(4);
            if (this.isEncrypted()) {
              throw new Error("Encrypted zip are not supported");
            }
            this.fileName = reader.readString(this.fileNameLength);
            this.readExtraFields(reader);
            this.parseZIP64ExtraField(reader);
            this.fileComment = reader.readString(this.fileCommentLength);
            this.dir = this.externalFileAttributes & 16 ? true : false;
          },
          parseZIP64ExtraField: function (reader) {
            if (!this.extraFields[1]) {
              return;
            }
            var extraReader = new StringReader(this.extraFields[1].value);
            if (this.uncompressedSize === utils.MAX_VALUE_32BITS) {
              this.uncompressedSize = extraReader.readInt(8);
            }
            if (this.compressedSize === utils.MAX_VALUE_32BITS) {
              this.compressedSize = extraReader.readInt(8);
            }
            if (this.localHeaderOffset === utils.MAX_VALUE_32BITS) {
              this.localHeaderOffset = extraReader.readInt(8);
            }
            if (this.diskNumberStart === utils.MAX_VALUE_32BITS) {
              this.diskNumberStart = extraReader.readInt(4);
            }
          },
          readExtraFields: function (reader) {
            var start = reader.index,
              extraFieldId,
              extraFieldLength,
              extraFieldValue;
            this.extraFields = this.extraFields || {};
            while (reader.index < start + this.extraFieldsLength) {
              extraFieldId = reader.readInt(2);
              extraFieldLength = reader.readInt(2);
              extraFieldValue = reader.readString(extraFieldLength);
              this.extraFields[extraFieldId] = {
                id: extraFieldId,
                length: extraFieldLength,
                value: extraFieldValue,
              };
            }
          },
          handleUTF8: function () {
            if (this.useUTF8()) {
              this.fileName = jszipProto.utf8decode(this.fileName);
              this.fileComment = jszipProto.utf8decode(this.fileComment);
            } else {
              var upath = this.findExtraFieldUnicodePath();
              if (upath !== null) {
                this.fileName = upath;
              }
              var ucomment = this.findExtraFieldUnicodeComment();
              if (ucomment !== null) {
                this.fileComment = ucomment;
              }
            }
          },
          findExtraFieldUnicodePath: function () {
            var upathField = this.extraFields[28789];
            if (upathField) {
              var extraReader = new StringReader(upathField.value);
              if (extraReader.readInt(1) !== 1) {
                return null;
              }
              if (jszipProto.crc32(this.fileName) !== extraReader.readInt(4)) {
                return null;
              }
              return jszipProto.utf8decode(
                extraReader.readString(upathField.length - 5)
              );
            }
            return null;
          },
          findExtraFieldUnicodeComment: function () {
            var ucommentField = this.extraFields[25461];
            if (ucommentField) {
              var extraReader = new StringReader(ucommentField.value);
              if (extraReader.readInt(1) !== 1) {
                return null;
              }
              if (
                jszipProto.crc32(this.fileComment) !== extraReader.readInt(4)
              ) {
                return null;
              }
              return jszipProto.utf8decode(
                extraReader.readString(ucommentField.length - 5)
              );
            }
            return null;
          },
        };
        module.exports = ZipEntry;
      },
      {
        "./compressedObject": 5,
        "./object": 16,
        "./stringReader": 18,
        "./utils": 24,
      },
    ],
    27: [
      function (require, module, exports) {
        "use strict";
        var assign = require("./lib/utils/common").assign;
        var deflate = require("./lib/deflate");
        var inflate = require("./lib/inflate");
        var constants = require("./lib/zlib/constants");
        var pako = {};
        assign(pako, deflate, inflate, constants);
        module.exports = pako;
      },
      {
        "./lib/deflate": 28,
        "./lib/inflate": 29,
        "./lib/utils/common": 30,
        "./lib/zlib/constants": 33,
      },
    ],
    28: [
      function (require, module, exports) {
        "use strict";
        var zlib_deflate = require("./zlib/deflate");
        var utils = require("./utils/common");
        var strings = require("./utils/strings");
        var msg = require("./zlib/messages");
        var ZStream = require("./zlib/zstream");
        var toString = Object.prototype.toString;
        var Z_NO_FLUSH = 0;
        var Z_FINISH = 4;
        var Z_OK = 0;
        var Z_STREAM_END = 1;
        var Z_SYNC_FLUSH = 2;
        var Z_DEFAULT_COMPRESSION = -1;
        var Z_DEFAULT_STRATEGY = 0;
        var Z_DEFLATED = 8;
        function Deflate(options) {
          if (!(this instanceof Deflate)) return new Deflate(options);
          this.options = utils.assign(
            {
              level: Z_DEFAULT_COMPRESSION,
              method: Z_DEFLATED,
              chunkSize: 16384,
              windowBits: 15,
              memLevel: 8,
              strategy: Z_DEFAULT_STRATEGY,
              to: "",
            },
            options || {}
          );
          var opt = this.options;
          if (opt.raw && opt.windowBits > 0) {
            opt.windowBits = -opt.windowBits;
          } else if (opt.gzip && opt.windowBits > 0 && opt.windowBits < 16) {
            opt.windowBits += 16;
          }
          this.err = 0;
          this.msg = "";
          this.ended = false;
          this.chunks = [];
          this.strm = new ZStream();
          this.strm.avail_out = 0;
          var status = zlib_deflate.deflateInit2(
            this.strm,
            opt.level,
            opt.method,
            opt.windowBits,
            opt.memLevel,
            opt.strategy
          );
          if (status !== Z_OK) {
            throw new Error(msg[status]);
          }
          if (opt.header) {
            zlib_deflate.deflateSetHeader(this.strm, opt.header);
          }
          if (opt.dictionary) {
            var dict;
            if (typeof opt.dictionary === "string") {
              dict = strings.string2buf(opt.dictionary);
            } else if (
              toString.call(opt.dictionary) === "[object ArrayBuffer]"
            ) {
              dict = new Uint8Array(opt.dictionary);
            } else {
              dict = opt.dictionary;
            }
            status = zlib_deflate.deflateSetDictionary(this.strm, dict);
            if (status !== Z_OK) {
              throw new Error(msg[status]);
            }
            this._dict_set = true;
          }
        }
        Deflate.prototype.push = function (data, mode) {
          var strm = this.strm;
          var chunkSize = this.options.chunkSize;
          var status, _mode;
          if (this.ended) {
            return false;
          }
          _mode =
            mode === ~~mode ? mode : mode === true ? Z_FINISH : Z_NO_FLUSH;
          if (typeof data === "string") {
            strm.input = strings.string2buf(data);
          } else if (toString.call(data) === "[object ArrayBuffer]") {
            strm.input = new Uint8Array(data);
          } else {
            strm.input = data;
          }
          strm.next_in = 0;
          strm.avail_in = strm.input.length;
          do {
            if (strm.avail_out === 0) {
              strm.output = new utils.Buf8(chunkSize);
              strm.next_out = 0;
              strm.avail_out = chunkSize;
            }
            status = zlib_deflate.deflate(strm, _mode);
            if (status !== Z_STREAM_END && status !== Z_OK) {
              this.onEnd(status);
              this.ended = true;
              return false;
            }
            if (
              strm.avail_out === 0 ||
              (strm.avail_in === 0 &&
                (_mode === Z_FINISH || _mode === Z_SYNC_FLUSH))
            ) {
              if (this.options.to === "string") {
                this.onData(
                  strings.buf2binstring(
                    utils.shrinkBuf(strm.output, strm.next_out)
                  )
                );
              } else {
                this.onData(utils.shrinkBuf(strm.output, strm.next_out));
              }
            }
          } while (
            (strm.avail_in > 0 || strm.avail_out === 0) &&
            status !== Z_STREAM_END
          );
          if (_mode === Z_FINISH) {
            status = zlib_deflate.deflateEnd(this.strm);
            this.onEnd(status);
            this.ended = true;
            return status === Z_OK;
          }
          if (_mode === Z_SYNC_FLUSH) {
            this.onEnd(Z_OK);
            strm.avail_out = 0;
            return true;
          }
          return true;
        };
        Deflate.prototype.onData = function (chunk) {
          this.chunks.push(chunk);
        };
        Deflate.prototype.onEnd = function (status) {
          if (status === Z_OK) {
            if (this.options.to === "string") {
              this.result = this.chunks.join("");
            } else {
              this.result = utils.flattenChunks(this.chunks);
            }
          }
          this.chunks = [];
          this.err = status;
          this.msg = this.strm.msg;
        };
        function deflate(input, options) {
          var deflator = new Deflate(options);
          deflator.push(input, true);
          if (deflator.err) {
            throw deflator.msg;
          }
          return deflator.result;
        }
        function deflateRaw(input, options) {
          options = options || {};
          options.raw = true;
          return deflate(input, options);
        }
        function gzip(input, options) {
          options = options || {};
          options.gzip = true;
          return deflate(input, options);
        }
        exports.Deflate = Deflate;
        exports.deflate = deflate;
        exports.deflateRaw = deflateRaw;
        exports.gzip = gzip;
      },
      {
        "./utils/common": 30,
        "./utils/strings": 31,
        "./zlib/deflate": 35,
        "./zlib/messages": 40,
        "./zlib/zstream": 42,
      },
    ],
    29: [
      function (require, module, exports) {
        "use strict";
        var zlib_inflate = require("./zlib/inflate");
        var utils = require("./utils/common");
        var strings = require("./utils/strings");
        var c = require("./zlib/constants");
        var msg = require("./zlib/messages");
        var ZStream = require("./zlib/zstream");
        var GZheader = require("./zlib/gzheader");
        var toString = Object.prototype.toString;
        function Inflate(options) {
          if (!(this instanceof Inflate)) return new Inflate(options);
          this.options = utils.assign(
            { chunkSize: 16384, windowBits: 0, to: "" },
            options || {}
          );
          var opt = this.options;
          if (opt.raw && opt.windowBits >= 0 && opt.windowBits < 16) {
            opt.windowBits = -opt.windowBits;
            if (opt.windowBits === 0) {
              opt.windowBits = -15;
            }
          }
          if (
            opt.windowBits >= 0 &&
            opt.windowBits < 16 &&
            !(options && options.windowBits)
          ) {
            opt.windowBits += 32;
          }
          if (opt.windowBits > 15 && opt.windowBits < 48) {
            if ((opt.windowBits & 15) === 0) {
              opt.windowBits |= 15;
            }
          }
          this.err = 0;
          this.msg = "";
          this.ended = false;
          this.chunks = [];
          this.strm = new ZStream();
          this.strm.avail_out = 0;
          var status = zlib_inflate.inflateInit2(this.strm, opt.windowBits);
          if (status !== c.Z_OK) {
            throw new Error(msg[status]);
          }
          this.header = new GZheader();
          zlib_inflate.inflateGetHeader(this.strm, this.header);
        }
        Inflate.prototype.push = function (data, mode) {
          var strm = this.strm;
          var chunkSize = this.options.chunkSize;
          var dictionary = this.options.dictionary;
          var status, _mode;
          var next_out_utf8, tail, utf8str;
          var dict;
          var allowBufError = false;
          if (this.ended) {
            return false;
          }
          _mode =
            mode === ~~mode ? mode : mode === true ? c.Z_FINISH : c.Z_NO_FLUSH;
          if (typeof data === "string") {
            strm.input = strings.binstring2buf(data);
          } else if (toString.call(data) === "[object ArrayBuffer]") {
            strm.input = new Uint8Array(data);
          } else {
            strm.input = data;
          }
          strm.next_in = 0;
          strm.avail_in = strm.input.length;
          do {
            if (strm.avail_out === 0) {
              strm.output = new utils.Buf8(chunkSize);
              strm.next_out = 0;
              strm.avail_out = chunkSize;
            }
            status = zlib_inflate.inflate(strm, c.Z_NO_FLUSH);
            if (status === c.Z_NEED_DICT && dictionary) {
              if (typeof dictionary === "string") {
                dict = strings.string2buf(dictionary);
              } else if (toString.call(dictionary) === "[object ArrayBuffer]") {
                dict = new Uint8Array(dictionary);
              } else {
                dict = dictionary;
              }
              status = zlib_inflate.inflateSetDictionary(this.strm, dict);
            }
            if (status === c.Z_BUF_ERROR && allowBufError === true) {
              status = c.Z_OK;
              allowBufError = false;
            }
            if (status !== c.Z_STREAM_END && status !== c.Z_OK) {
              this.onEnd(status);
              this.ended = true;
              return false;
            }
            if (strm.next_out) {
              if (
                strm.avail_out === 0 ||
                status === c.Z_STREAM_END ||
                (strm.avail_in === 0 &&
                  (_mode === c.Z_FINISH || _mode === c.Z_SYNC_FLUSH))
              ) {
                if (this.options.to === "string") {
                  next_out_utf8 = strings.utf8border(
                    strm.output,
                    strm.next_out
                  );
                  tail = strm.next_out - next_out_utf8;
                  utf8str = strings.buf2string(strm.output, next_out_utf8);
                  strm.next_out = tail;
                  strm.avail_out = chunkSize - tail;
                  if (tail) {
                    utils.arraySet(
                      strm.output,
                      strm.output,
                      next_out_utf8,
                      tail,
                      0
                    );
                  }
                  this.onData(utf8str);
                } else {
                  this.onData(utils.shrinkBuf(strm.output, strm.next_out));
                }
              }
            }
            if (strm.avail_in === 0 && strm.avail_out === 0) {
              allowBufError = true;
            }
          } while (
            (strm.avail_in > 0 || strm.avail_out === 0) &&
            status !== c.Z_STREAM_END
          );
          if (status === c.Z_STREAM_END) {
            _mode = c.Z_FINISH;
          }
          if (_mode === c.Z_FINISH) {
            status = zlib_inflate.inflateEnd(this.strm);
            this.onEnd(status);
            this.ended = true;
            return status === c.Z_OK;
          }
          if (_mode === c.Z_SYNC_FLUSH) {
            this.onEnd(c.Z_OK);
            strm.avail_out = 0;
            return true;
          }
          return true;
        };
        Inflate.prototype.onData = function (chunk) {
          this.chunks.push(chunk);
        };
        Inflate.prototype.onEnd = function (status) {
          if (status === c.Z_OK) {
            if (this.options.to === "string") {
              this.result = this.chunks.join("");
            } else {
              this.result = utils.flattenChunks(this.chunks);
            }
          }
          this.chunks = [];
          this.err = status;
          this.msg = this.strm.msg;
        };
        function inflate(input, options) {
          var inflator = new Inflate(options);
          inflator.push(input, true);
          if (inflator.err) {
            throw inflator.msg;
          }
          return inflator.result;
        }
        function inflateRaw(input, options) {
          options = options || {};
          options.raw = true;
          return inflate(input, options);
        }
        exports.Inflate = Inflate;
        exports.inflate = inflate;
        exports.inflateRaw = inflateRaw;
        exports.ungzip = inflate;
      },
      {
        "./utils/common": 30,
        "./utils/strings": 31,
        "./zlib/constants": 33,
        "./zlib/gzheader": 36,
        "./zlib/inflate": 38,
        "./zlib/messages": 40,
        "./zlib/zstream": 42,
      },
    ],
    30: [
      function (require, module, exports) {
        "use strict";
        var TYPED_OK =
          typeof Uint8Array !== "undefined" &&
          typeof Uint16Array !== "undefined" &&
          typeof Int32Array !== "undefined";
        exports.assign = function (obj) {
          var sources = Array.prototype.slice.call(arguments, 1);
          while (sources.length) {
            var source = sources.shift();
            if (!source) {
              continue;
            }
            if (typeof source !== "object") {
              throw new TypeError(source + "must be non-object");
            }
            for (var p in source) {
              if (source.hasOwnProperty(p)) {
                obj[p] = source[p];
              }
            }
          }
          return obj;
        };
        exports.shrinkBuf = function (buf, size) {
          if (buf.length === size) {
            return buf;
          }
          if (buf.subarray) {
            return buf.subarray(0, size);
          }
          buf.length = size;
          return buf;
        };
        var fnTyped = {
          arraySet: function (dest, src, src_offs, len, dest_offs) {
            if (src.subarray && dest.subarray) {
              dest.set(src.subarray(src_offs, src_offs + len), dest_offs);
              return;
            }
            for (var i = 0; i < len; i++) {
              dest[dest_offs + i] = src[src_offs + i];
            }
          },
          flattenChunks: function (chunks) {
            var i, l, len, pos, chunk, result;
            len = 0;
            for (i = 0, l = chunks.length; i < l; i++) {
              len += chunks[i].length;
            }
            result = new Uint8Array(len);
            pos = 0;
            for (i = 0, l = chunks.length; i < l; i++) {
              chunk = chunks[i];
              result.set(chunk, pos);
              pos += chunk.length;
            }
            return result;
          },
        };
        var fnUntyped = {
          arraySet: function (dest, src, src_offs, len, dest_offs) {
            for (var i = 0; i < len; i++) {
              dest[dest_offs + i] = src[src_offs + i];
            }
          },
          flattenChunks: function (chunks) {
            return [].concat.apply([], chunks);
          },
        };
        exports.setTyped = function (on) {
          if (on) {
            exports.Buf8 = Uint8Array;
            exports.Buf16 = Uint16Array;
            exports.Buf32 = Int32Array;
            exports.assign(exports, fnTyped);
          } else {
            exports.Buf8 = Array;
            exports.Buf16 = Array;
            exports.Buf32 = Array;
            exports.assign(exports, fnUntyped);
          }
        };
        exports.setTyped(TYPED_OK);
      },
      {},
    ],
    31: [
      function (require, module, exports) {
        "use strict";
        var utils = require("./common");
        var STR_APPLY_OK = true;
        var STR_APPLY_UIA_OK = true;
        try {
          String.fromCharCode.apply(null, [0]);
        } catch (__) {
          STR_APPLY_OK = false;
        }
        try {
          String.fromCharCode.apply(null, new Uint8Array(1));
        } catch (__) {
          STR_APPLY_UIA_OK = false;
        }
        var _utf8len = new utils.Buf8(256);
        for (var q = 0; q < 256; q++) {
          _utf8len[q] =
            q >= 252
              ? 6
              : q >= 248
              ? 5
              : q >= 240
              ? 4
              : q >= 224
              ? 3
              : q >= 192
              ? 2
              : 1;
        }
        _utf8len[254] = _utf8len[254] = 1;
        exports.string2buf = function (str) {
          var buf,
            c,
            c2,
            m_pos,
            i,
            str_len = str.length,
            buf_len = 0;
          for (m_pos = 0; m_pos < str_len; m_pos++) {
            c = str.charCodeAt(m_pos);
            if ((c & 64512) === 55296 && m_pos + 1 < str_len) {
              c2 = str.charCodeAt(m_pos + 1);
              if ((c2 & 64512) === 56320) {
                c = 65536 + ((c - 55296) << 10) + (c2 - 56320);
                m_pos++;
              }
            }
            buf_len += c < 128 ? 1 : c < 2048 ? 2 : c < 65536 ? 3 : 4;
          }
          buf = new utils.Buf8(buf_len);
          for (i = 0, m_pos = 0; i < buf_len; m_pos++) {
            c = str.charCodeAt(m_pos);
            if ((c & 64512) === 55296 && m_pos + 1 < str_len) {
              c2 = str.charCodeAt(m_pos + 1);
              if ((c2 & 64512) === 56320) {
                c = 65536 + ((c - 55296) << 10) + (c2 - 56320);
                m_pos++;
              }
            }
            if (c < 128) {
              buf[i++] = c;
            } else if (c < 2048) {
              buf[i++] = 192 | (c >>> 6);
              buf[i++] = 128 | (c & 63);
            } else if (c < 65536) {
              buf[i++] = 224 | (c >>> 12);
              buf[i++] = 128 | ((c >>> 6) & 63);
              buf[i++] = 128 | (c & 63);
            } else {
              buf[i++] = 240 | (c >>> 18);
              buf[i++] = 128 | ((c >>> 12) & 63);
              buf[i++] = 128 | ((c >>> 6) & 63);
              buf[i++] = 128 | (c & 63);
            }
          }
          return buf;
        };
        function buf2binstring(buf, len) {
          if (len < 65537) {
            if (
              (buf.subarray && STR_APPLY_UIA_OK) ||
              (!buf.subarray && STR_APPLY_OK)
            ) {
              return String.fromCharCode.apply(null, utils.shrinkBuf(buf, len));
            }
          }
          var result = "";
          for (var i = 0; i < len; i++) {
            result += String.fromCharCode(buf[i]);
          }
          return result;
        }
        exports.buf2binstring = function (buf) {
          return buf2binstring(buf, buf.length);
        };
        exports.binstring2buf = function (str) {
          var buf = new utils.Buf8(str.length);
          for (var i = 0, len = buf.length; i < len; i++) {
            buf[i] = str.charCodeAt(i);
          }
          return buf;
        };
        exports.buf2string = function (buf, max) {
          var i, out, c, c_len;
          var len = max || buf.length;
          var utf16buf = new Array(len * 2);
          for (out = 0, i = 0; i < len; ) {
            c = buf[i++];
            if (c < 128) {
              utf16buf[out++] = c;
              continue;
            }
            c_len = _utf8len[c];
            if (c_len > 4) {
              utf16buf[out++] = 65533;
              i += c_len - 1;
              continue;
            }
            c &= c_len === 2 ? 31 : c_len === 3 ? 15 : 7;
            while (c_len > 1 && i < len) {
              c = (c << 6) | (buf[i++] & 63);
              c_len--;
            }
            if (c_len > 1) {
              utf16buf[out++] = 65533;
              continue;
            }
            if (c < 65536) {
              utf16buf[out++] = c;
            } else {
              c -= 65536;
              utf16buf[out++] = 55296 | ((c >> 10) & 1023);
              utf16buf[out++] = 56320 | (c & 1023);
            }
          }
          return buf2binstring(utf16buf, out);
        };
        exports.utf8border = function (buf, max) {
          var pos;
          max = max || buf.length;
          if (max > buf.length) {
            max = buf.length;
          }
          pos = max - 1;
          while (pos >= 0 && (buf[pos] & 192) === 128) {
            pos--;
          }
          if (pos < 0) {
            return max;
          }
          if (pos === 0) {
            return max;
          }
          return pos + _utf8len[buf[pos]] > max ? pos : max;
        };
      },
      { "./common": 30 },
    ],
    32: [
      function (require, module, exports) {
        "use strict";
        function adler32(adler, buf, len, pos) {
          var s1 = (adler & 65535) | 0,
            s2 = ((adler >>> 16) & 65535) | 0,
            n = 0;
          while (len !== 0) {
            n = len > 2e3 ? 2e3 : len;
            len -= n;
            do {
              s1 = (s1 + buf[pos++]) | 0;
              s2 = (s2 + s1) | 0;
            } while (--n);
            s1 %= 65521;
            s2 %= 65521;
          }
          return s1 | (s2 << 16) | 0;
        }
        module.exports = adler32;
      },
      {},
    ],
    33: [
      function (require, module, exports) {
        "use strict";
        module.exports = {
          Z_NO_FLUSH: 0,
          Z_PARTIAL_FLUSH: 1,
          Z_SYNC_FLUSH: 2,
          Z_FULL_FLUSH: 3,
          Z_FINISH: 4,
          Z_BLOCK: 5,
          Z_TREES: 6,
          Z_OK: 0,
          Z_STREAM_END: 1,
          Z_NEED_DICT: 2,
          Z_ERRNO: -1,
          Z_STREAM_ERROR: -2,
          Z_DATA_ERROR: -3,
          Z_BUF_ERROR: -5,
          Z_NO_COMPRESSION: 0,
          Z_BEST_SPEED: 1,
          Z_BEST_COMPRESSION: 9,
          Z_DEFAULT_COMPRESSION: -1,
          Z_FILTERED: 1,
          Z_HUFFMAN_ONLY: 2,
          Z_RLE: 3,
          Z_FIXED: 4,
          Z_DEFAULT_STRATEGY: 0,
          Z_BINARY: 0,
          Z_TEXT: 1,
          Z_UNKNOWN: 2,
          Z_DEFLATED: 8,
        };
      },
      {},
    ],
    34: [
      function (require, module, exports) {
        "use strict";
        function makeTable() {
          var c,
            table = [];
          for (var n = 0; n < 256; n++) {
            c = n;
            for (var k = 0; k < 8; k++) {
              c = c & 1 ? 3988292384 ^ (c >>> 1) : c >>> 1;
            }
            table[n] = c;
          }
          return table;
        }
        var crcTable = makeTable();
        function crc32(crc, buf, len, pos) {
          var t = crcTable,
            end = pos + len;
          crc ^= -1;
          for (var i = pos; i < end; i++) {
            crc = (crc >>> 8) ^ t[(crc ^ buf[i]) & 255];
          }
          return crc ^ -1;
        }
        module.exports = crc32;
      },
      {},
    ],
    35: [
      function (require, module, exports) {
        "use strict";
        var utils = require("../utils/common");
        var trees = require("./trees");
        var adler32 = require("./adler32");
        var crc32 = require("./crc32");
        var msg = require("./messages");
        var Z_NO_FLUSH = 0;
        var Z_PARTIAL_FLUSH = 1;
        var Z_FULL_FLUSH = 3;
        var Z_FINISH = 4;
        var Z_BLOCK = 5;
        var Z_OK = 0;
        var Z_STREAM_END = 1;
        var Z_STREAM_ERROR = -2;
        var Z_DATA_ERROR = -3;
        var Z_BUF_ERROR = -5;
        var Z_DEFAULT_COMPRESSION = -1;
        var Z_FILTERED = 1;
        var Z_HUFFMAN_ONLY = 2;
        var Z_RLE = 3;
        var Z_FIXED = 4;
        var Z_DEFAULT_STRATEGY = 0;
        var Z_UNKNOWN = 2;
        var Z_DEFLATED = 8;
        var MAX_MEM_LEVEL = 9;
        var MAX_WBITS = 15;
        var DEF_MEM_LEVEL = 8;
        var LENGTH_CODES = 29;
        var LITERALS = 256;
        var L_CODES = LITERALS + 1 + LENGTH_CODES;
        var D_CODES = 30;
        var BL_CODES = 19;
        var HEAP_SIZE = 2 * L_CODES + 1;
        var MAX_BITS = 15;
        var MIN_MATCH = 3;
        var MAX_MATCH = 258;
        var MIN_LOOKAHEAD = MAX_MATCH + MIN_MATCH + 1;
        var PRESET_DICT = 32;
        var INIT_STATE = 42;
        var EXTRA_STATE = 69;
        var NAME_STATE = 73;
        var COMMENT_STATE = 91;
        var HCRC_STATE = 103;
        var BUSY_STATE = 113;
        var FINISH_STATE = 666;
        var BS_NEED_MORE = 1;
        var BS_BLOCK_DONE = 2;
        var BS_FINISH_STARTED = 3;
        var BS_FINISH_DONE = 4;
        var OS_CODE = 3;
        function err(strm, errorCode) {
          strm.msg = msg[errorCode];
          return errorCode;
        }
        function rank(f) {
          return (f << 1) - (f > 4 ? 9 : 0);
        }
        function zero(buf) {
          var len = buf.length;
          while (--len >= 0) {
            buf[len] = 0;
          }
        }
        function flush_pending(strm) {
          var s = strm.state;
          var len = s.pending;
          if (len > strm.avail_out) {
            len = strm.avail_out;
          }
          if (len === 0) {
            return;
          }
          utils.arraySet(
            strm.output,
            s.pending_buf,
            s.pending_out,
            len,
            strm.next_out
          );
          strm.next_out += len;
          s.pending_out += len;
          strm.total_out += len;
          strm.avail_out -= len;
          s.pending -= len;
          if (s.pending === 0) {
            s.pending_out = 0;
          }
        }
        function flush_block_only(s, last) {
          trees._tr_flush_block(
            s,
            s.block_start >= 0 ? s.block_start : -1,
            s.strstart - s.block_start,
            last
          );
          s.block_start = s.strstart;
          flush_pending(s.strm);
        }
        function put_byte(s, b) {
          s.pending_buf[s.pending++] = b;
        }
        function putShortMSB(s, b) {
          s.pending_buf[s.pending++] = (b >>> 8) & 255;
          s.pending_buf[s.pending++] = b & 255;
        }
        function read_buf(strm, buf, start, size) {
          var len = strm.avail_in;
          if (len > size) {
            len = size;
          }
          if (len === 0) {
            return 0;
          }
          strm.avail_in -= len;
          utils.arraySet(buf, strm.input, strm.next_in, len, start);
          if (strm.state.wrap === 1) {
            strm.adler = adler32(strm.adler, buf, len, start);
          } else if (strm.state.wrap === 2) {
            strm.adler = crc32(strm.adler, buf, len, start);
          }
          strm.next_in += len;
          strm.total_in += len;
          return len;
        }
        function longest_match(s, cur_match) {
          var chain_length = s.max_chain_length;
          var scan = s.strstart;
          var match;
          var len;
          var best_len = s.prev_length;
          var nice_match = s.nice_match;
          var limit =
            s.strstart > s.w_size - MIN_LOOKAHEAD
              ? s.strstart - (s.w_size - MIN_LOOKAHEAD)
              : 0;
          var _win = s.window;
          var wmask = s.w_mask;
          var prev = s.prev;
          var strend = s.strstart + MAX_MATCH;
          var scan_end1 = _win[scan + best_len - 1];
          var scan_end = _win[scan + best_len];
          if (s.prev_length >= s.good_match) {
            chain_length >>= 2;
          }
          if (nice_match > s.lookahead) {
            nice_match = s.lookahead;
          }
          do {
            match = cur_match;
            if (
              _win[match + best_len] !== scan_end ||
              _win[match + best_len - 1] !== scan_end1 ||
              _win[match] !== _win[scan] ||
              _win[++match] !== _win[scan + 1]
            ) {
              continue;
            }
            scan += 2;
            match++;
            do {} while (
              _win[++scan] === _win[++match] &&
              _win[++scan] === _win[++match] &&
              _win[++scan] === _win[++match] &&
              _win[++scan] === _win[++match] &&
              _win[++scan] === _win[++match] &&
              _win[++scan] === _win[++match] &&
              _win[++scan] === _win[++match] &&
              _win[++scan] === _win[++match] &&
              scan < strend
            );
            len = MAX_MATCH - (strend - scan);
            scan = strend - MAX_MATCH;
            if (len > best_len) {
              s.match_start = cur_match;
              best_len = len;
              if (len >= nice_match) {
                break;
              }
              scan_end1 = _win[scan + best_len - 1];
              scan_end = _win[scan + best_len];
            }
          } while (
            (cur_match = prev[cur_match & wmask]) > limit &&
            --chain_length !== 0
          );
          if (best_len <= s.lookahead) {
            return best_len;
          }
          return s.lookahead;
        }
        function fill_window(s) {
          var _w_size = s.w_size;
          var p, n, m, more, str;
          do {
            more = s.window_size - s.lookahead - s.strstart;
            if (s.strstart >= _w_size + (_w_size - MIN_LOOKAHEAD)) {
              utils.arraySet(s.window, s.window, _w_size, _w_size, 0);
              s.match_start -= _w_size;
              s.strstart -= _w_size;
              s.block_start -= _w_size;
              n = s.hash_size;
              p = n;
              do {
                m = s.head[--p];
                s.head[p] = m >= _w_size ? m - _w_size : 0;
              } while (--n);
              n = _w_size;
              p = n;
              do {
                m = s.prev[--p];
                s.prev[p] = m >= _w_size ? m - _w_size : 0;
              } while (--n);
              more += _w_size;
            }
            if (s.strm.avail_in === 0) {
              break;
            }
            n = read_buf(s.strm, s.window, s.strstart + s.lookahead, more);
            s.lookahead += n;
            if (s.lookahead + s.insert >= MIN_MATCH) {
              str = s.strstart - s.insert;
              s.ins_h = s.window[str];
              s.ins_h =
                ((s.ins_h << s.hash_shift) ^ s.window[str + 1]) & s.hash_mask;
              while (s.insert) {
                s.ins_h =
                  ((s.ins_h << s.hash_shift) ^ s.window[str + MIN_MATCH - 1]) &
                  s.hash_mask;
                s.prev[str & s.w_mask] = s.head[s.ins_h];
                s.head[s.ins_h] = str;
                str++;
                s.insert--;
                if (s.lookahead + s.insert < MIN_MATCH) {
                  break;
                }
              }
            }
          } while (s.lookahead < MIN_LOOKAHEAD && s.strm.avail_in !== 0);
        }
        function deflate_stored(s, flush) {
          var max_block_size = 65535;
          if (max_block_size > s.pending_buf_size - 5) {
            max_block_size = s.pending_buf_size - 5;
          }
          for (;;) {
            if (s.lookahead <= 1) {
              fill_window(s);
              if (s.lookahead === 0 && flush === Z_NO_FLUSH) {
                return BS_NEED_MORE;
              }
              if (s.lookahead === 0) {
                break;
              }
            }
            s.strstart += s.lookahead;
            s.lookahead = 0;
            var max_start = s.block_start + max_block_size;
            if (s.strstart === 0 || s.strstart >= max_start) {
              s.lookahead = s.strstart - max_start;
              s.strstart = max_start;
              flush_block_only(s, false);
              if (s.strm.avail_out === 0) {
                return BS_NEED_MORE;
              }
            }
            if (s.strstart - s.block_start >= s.w_size - MIN_LOOKAHEAD) {
              flush_block_only(s, false);
              if (s.strm.avail_out === 0) {
                return BS_NEED_MORE;
              }
            }
          }
          s.insert = 0;
          if (flush === Z_FINISH) {
            flush_block_only(s, true);
            if (s.strm.avail_out === 0) {
              return BS_FINISH_STARTED;
            }
            return BS_FINISH_DONE;
          }
          if (s.strstart > s.block_start) {
            flush_block_only(s, false);
            if (s.strm.avail_out === 0) {
              return BS_NEED_MORE;
            }
          }
          return BS_NEED_MORE;
        }
        function deflate_fast(s, flush) {
          var hash_head;
          var bflush;
          for (;;) {
            if (s.lookahead < MIN_LOOKAHEAD) {
              fill_window(s);
              if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {
                return BS_NEED_MORE;
              }
              if (s.lookahead === 0) {
                break;
              }
            }
            hash_head = 0;
            if (s.lookahead >= MIN_MATCH) {
              s.ins_h =
                ((s.ins_h << s.hash_shift) ^
                  s.window[s.strstart + MIN_MATCH - 1]) &
                s.hash_mask;
              hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
              s.head[s.ins_h] = s.strstart;
            }
            if (
              hash_head !== 0 &&
              s.strstart - hash_head <= s.w_size - MIN_LOOKAHEAD
            ) {
              s.match_length = longest_match(s, hash_head);
            }
            if (s.match_length >= MIN_MATCH) {
              bflush = trees._tr_tally(
                s,
                s.strstart - s.match_start,
                s.match_length - MIN_MATCH
              );
              s.lookahead -= s.match_length;
              if (
                s.match_length <= s.max_lazy_match &&
                s.lookahead >= MIN_MATCH
              ) {
                s.match_length--;
                do {
                  s.strstart++;
                  s.ins_h =
                    ((s.ins_h << s.hash_shift) ^
                      s.window[s.strstart + MIN_MATCH - 1]) &
                    s.hash_mask;
                  hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
                  s.head[s.ins_h] = s.strstart;
                } while (--s.match_length !== 0);
                s.strstart++;
              } else {
                s.strstart += s.match_length;
                s.match_length = 0;
                s.ins_h = s.window[s.strstart];
                s.ins_h =
                  ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + 1]) &
                  s.hash_mask;
              }
            } else {
              bflush = trees._tr_tally(s, 0, s.window[s.strstart]);
              s.lookahead--;
              s.strstart++;
            }
            if (bflush) {
              flush_block_only(s, false);
              if (s.strm.avail_out === 0) {
                return BS_NEED_MORE;
              }
            }
          }
          s.insert = s.strstart < MIN_MATCH - 1 ? s.strstart : MIN_MATCH - 1;
          if (flush === Z_FINISH) {
            flush_block_only(s, true);
            if (s.strm.avail_out === 0) {
              return BS_FINISH_STARTED;
            }
            return BS_FINISH_DONE;
          }
          if (s.last_lit) {
            flush_block_only(s, false);
            if (s.strm.avail_out === 0) {
              return BS_NEED_MORE;
            }
          }
          return BS_BLOCK_DONE;
        }
        function deflate_slow(s, flush) {
          var hash_head;
          var bflush;
          var max_insert;
          for (;;) {
            if (s.lookahead < MIN_LOOKAHEAD) {
              fill_window(s);
              if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {
                return BS_NEED_MORE;
              }
              if (s.lookahead === 0) {
                break;
              }
            }
            hash_head = 0;
            if (s.lookahead >= MIN_MATCH) {
              s.ins_h =
                ((s.ins_h << s.hash_shift) ^
                  s.window[s.strstart + MIN_MATCH - 1]) &
                s.hash_mask;
              hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
              s.head[s.ins_h] = s.strstart;
            }
            s.prev_length = s.match_length;
            s.prev_match = s.match_start;
            s.match_length = MIN_MATCH - 1;
            if (
              hash_head !== 0 &&
              s.prev_length < s.max_lazy_match &&
              s.strstart - hash_head <= s.w_size - MIN_LOOKAHEAD
            ) {
              s.match_length = longest_match(s, hash_head);
              if (
                s.match_length <= 5 &&
                (s.strategy === Z_FILTERED ||
                  (s.match_length === MIN_MATCH &&
                    s.strstart - s.match_start > 4096))
              ) {
                s.match_length = MIN_MATCH - 1;
              }
            }
            if (s.prev_length >= MIN_MATCH && s.match_length <= s.prev_length) {
              max_insert = s.strstart + s.lookahead - MIN_MATCH;
              bflush = trees._tr_tally(
                s,
                s.strstart - 1 - s.prev_match,
                s.prev_length - MIN_MATCH
              );
              s.lookahead -= s.prev_length - 1;
              s.prev_length -= 2;
              do {
                if (++s.strstart <= max_insert) {
                  s.ins_h =
                    ((s.ins_h << s.hash_shift) ^
                      s.window[s.strstart + MIN_MATCH - 1]) &
                    s.hash_mask;
                  hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
                  s.head[s.ins_h] = s.strstart;
                }
              } while (--s.prev_length !== 0);
              s.match_available = 0;
              s.match_length = MIN_MATCH - 1;
              s.strstart++;
              if (bflush) {
                flush_block_only(s, false);
                if (s.strm.avail_out === 0) {
                  return BS_NEED_MORE;
                }
              }
            } else if (s.match_available) {
              bflush = trees._tr_tally(s, 0, s.window[s.strstart - 1]);
              if (bflush) {
                flush_block_only(s, false);
              }
              s.strstart++;
              s.lookahead--;
              if (s.strm.avail_out === 0) {
                return BS_NEED_MORE;
              }
            } else {
              s.match_available = 1;
              s.strstart++;
              s.lookahead--;
            }
          }
          if (s.match_available) {
            bflush = trees._tr_tally(s, 0, s.window[s.strstart - 1]);
            s.match_available = 0;
          }
          s.insert = s.strstart < MIN_MATCH - 1 ? s.strstart : MIN_MATCH - 1;
          if (flush === Z_FINISH) {
            flush_block_only(s, true);
            if (s.strm.avail_out === 0) {
              return BS_FINISH_STARTED;
            }
            return BS_FINISH_DONE;
          }
          if (s.last_lit) {
            flush_block_only(s, false);
            if (s.strm.avail_out === 0) {
              return BS_NEED_MORE;
            }
          }
          return BS_BLOCK_DONE;
        }
        function deflate_rle(s, flush) {
          var bflush;
          var prev;
          var scan, strend;
          var _win = s.window;
          for (;;) {
            if (s.lookahead <= MAX_MATCH) {
              fill_window(s);
              if (s.lookahead <= MAX_MATCH && flush === Z_NO_FLUSH) {
                return BS_NEED_MORE;
              }
              if (s.lookahead === 0) {
                break;
              }
            }
            s.match_length = 0;
            if (s.lookahead >= MIN_MATCH && s.strstart > 0) {
              scan = s.strstart - 1;
              prev = _win[scan];
              if (
                prev === _win[++scan] &&
                prev === _win[++scan] &&
                prev === _win[++scan]
              ) {
                strend = s.strstart + MAX_MATCH;
                do {} while (
                  prev === _win[++scan] &&
                  prev === _win[++scan] &&
                  prev === _win[++scan] &&
                  prev === _win[++scan] &&
                  prev === _win[++scan] &&
                  prev === _win[++scan] &&
                  prev === _win[++scan] &&
                  prev === _win[++scan] &&
                  scan < strend
                );
                s.match_length = MAX_MATCH - (strend - scan);
                if (s.match_length > s.lookahead) {
                  s.match_length = s.lookahead;
                }
              }
            }
            if (s.match_length >= MIN_MATCH) {
              bflush = trees._tr_tally(s, 1, s.match_length - MIN_MATCH);
              s.lookahead -= s.match_length;
              s.strstart += s.match_length;
              s.match_length = 0;
            } else {
              bflush = trees._tr_tally(s, 0, s.window[s.strstart]);
              s.lookahead--;
              s.strstart++;
            }
            if (bflush) {
              flush_block_only(s, false);
              if (s.strm.avail_out === 0) {
                return BS_NEED_MORE;
              }
            }
          }
          s.insert = 0;
          if (flush === Z_FINISH) {
            flush_block_only(s, true);
            if (s.strm.avail_out === 0) {
              return BS_FINISH_STARTED;
            }
            return BS_FINISH_DONE;
          }
          if (s.last_lit) {
            flush_block_only(s, false);
            if (s.strm.avail_out === 0) {
              return BS_NEED_MORE;
            }
          }
          return BS_BLOCK_DONE;
        }
        function deflate_huff(s, flush) {
          var bflush;
          for (;;) {
            if (s.lookahead === 0) {
              fill_window(s);
              if (s.lookahead === 0) {
                if (flush === Z_NO_FLUSH) {
                  return BS_NEED_MORE;
                }
                break;
              }
            }
            s.match_length = 0;
            bflush = trees._tr_tally(s, 0, s.window[s.strstart]);
            s.lookahead--;
            s.strstart++;
            if (bflush) {
              flush_block_only(s, false);
              if (s.strm.avail_out === 0) {
                return BS_NEED_MORE;
              }
            }
          }
          s.insert = 0;
          if (flush === Z_FINISH) {
            flush_block_only(s, true);
            if (s.strm.avail_out === 0) {
              return BS_FINISH_STARTED;
            }
            return BS_FINISH_DONE;
          }
          if (s.last_lit) {
            flush_block_only(s, false);
            if (s.strm.avail_out === 0) {
              return BS_NEED_MORE;
            }
          }
          return BS_BLOCK_DONE;
        }
        function Config(good_length, max_lazy, nice_length, max_chain, func) {
          this.good_length = good_length;
          this.max_lazy = max_lazy;
          this.nice_length = nice_length;
          this.max_chain = max_chain;
          this.func = func;
        }
        var configuration_table;
        configuration_table = [
          new Config(0, 0, 0, 0, deflate_stored),
          new Config(4, 4, 8, 4, deflate_fast),
          new Config(4, 5, 16, 8, deflate_fast),
          new Config(4, 6, 32, 32, deflate_fast),
          new Config(4, 4, 16, 16, deflate_slow),
          new Config(8, 16, 32, 32, deflate_slow),
          new Config(8, 16, 128, 128, deflate_slow),
          new Config(8, 32, 128, 256, deflate_slow),
          new Config(32, 128, 258, 1024, deflate_slow),
          new Config(32, 258, 258, 4096, deflate_slow),
        ];
        function lm_init(s) {
          s.window_size = 2 * s.w_size;
          zero(s.head);
          s.max_lazy_match = configuration_table[s.level].max_lazy;
          s.good_match = configuration_table[s.level].good_length;
          s.nice_match = configuration_table[s.level].nice_length;
          s.max_chain_length = configuration_table[s.level].max_chain;
          s.strstart = 0;
          s.block_start = 0;
          s.lookahead = 0;
          s.insert = 0;
          s.match_length = s.prev_length = MIN_MATCH - 1;
          s.match_available = 0;
          s.ins_h = 0;
        }
        function DeflateState() {
          this.strm = null;
          this.status = 0;
          this.pending_buf = null;
          this.pending_buf_size = 0;
          this.pending_out = 0;
          this.pending = 0;
          this.wrap = 0;
          this.gzhead = null;
          this.gzindex = 0;
          this.method = Z_DEFLATED;
          this.last_flush = -1;
          this.w_size = 0;
          this.w_bits = 0;
          this.w_mask = 0;
          this.window = null;
          this.window_size = 0;
          this.prev = null;
          this.head = null;
          this.ins_h = 0;
          this.hash_size = 0;
          this.hash_bits = 0;
          this.hash_mask = 0;
          this.hash_shift = 0;
          this.block_start = 0;
          this.match_length = 0;
          this.prev_match = 0;
          this.match_available = 0;
          this.strstart = 0;
          this.match_start = 0;
          this.lookahead = 0;
          this.prev_length = 0;
          this.max_chain_length = 0;
          this.max_lazy_match = 0;
          this.level = 0;
          this.strategy = 0;
          this.good_match = 0;
          this.nice_match = 0;
          this.dyn_ltree = new utils.Buf16(HEAP_SIZE * 2);
          this.dyn_dtree = new utils.Buf16((2 * D_CODES + 1) * 2);
          this.bl_tree = new utils.Buf16((2 * BL_CODES + 1) * 2);
          zero(this.dyn_ltree);
          zero(this.dyn_dtree);
          zero(this.bl_tree);
          this.l_desc = null;
          this.d_desc = null;
          this.bl_desc = null;
          this.bl_count = new utils.Buf16(MAX_BITS + 1);
          this.heap = new utils.Buf16(2 * L_CODES + 1);
          zero(this.heap);
          this.heap_len = 0;
          this.heap_max = 0;
          this.depth = new utils.Buf16(2 * L_CODES + 1);
          zero(this.depth);
          this.l_buf = 0;
          this.lit_bufsize = 0;
          this.last_lit = 0;
          this.d_buf = 0;
          this.opt_len = 0;
          this.static_len = 0;
          this.matches = 0;
          this.insert = 0;
          this.bi_buf = 0;
          this.bi_valid = 0;
        }
        function deflateResetKeep(strm) {
          var s;
          if (!strm || !strm.state) {
            return err(strm, Z_STREAM_ERROR);
          }
          strm.total_in = strm.total_out = 0;
          strm.data_type = Z_UNKNOWN;
          s = strm.state;
          s.pending = 0;
          s.pending_out = 0;
          if (s.wrap < 0) {
            s.wrap = -s.wrap;
          }
          s.status = s.wrap ? INIT_STATE : BUSY_STATE;
          strm.adler = s.wrap === 2 ? 0 : 1;
          s.last_flush = Z_NO_FLUSH;
          trees._tr_init(s);
          return Z_OK;
        }
        function deflateReset(strm) {
          var ret = deflateResetKeep(strm);
          if (ret === Z_OK) {
            lm_init(strm.state);
          }
          return ret;
        }
        function deflateSetHeader(strm, head) {
          if (!strm || !strm.state) {
            return Z_STREAM_ERROR;
          }
          if (strm.state.wrap !== 2) {
            return Z_STREAM_ERROR;
          }
          strm.state.gzhead = head;
          return Z_OK;
        }
        function deflateInit2(
          strm,
          level,
          method,
          windowBits,
          memLevel,
          strategy
        ) {
          if (!strm) {
            return Z_STREAM_ERROR;
          }
          var wrap = 1;
          if (level === Z_DEFAULT_COMPRESSION) {
            level = 6;
          }
          if (windowBits < 0) {
            wrap = 0;
            windowBits = -windowBits;
          } else if (windowBits > 15) {
            wrap = 2;
            windowBits -= 16;
          }
          if (
            memLevel < 1 ||
            memLevel > MAX_MEM_LEVEL ||
            method !== Z_DEFLATED ||
            windowBits < 8 ||
            windowBits > 15 ||
            level < 0 ||
            level > 9 ||
            strategy < 0 ||
            strategy > Z_FIXED
          ) {
            return err(strm, Z_STREAM_ERROR);
          }
          if (windowBits === 8) {
            windowBits = 9;
          }
          var s = new DeflateState();
          strm.state = s;
          s.strm = strm;
          s.wrap = wrap;
          s.gzhead = null;
          s.w_bits = windowBits;
          s.w_size = 1 << s.w_bits;
          s.w_mask = s.w_size - 1;
          s.hash_bits = memLevel + 7;
          s.hash_size = 1 << s.hash_bits;
          s.hash_mask = s.hash_size - 1;
          s.hash_shift = ~~((s.hash_bits + MIN_MATCH - 1) / MIN_MATCH);
          s.window = new utils.Buf8(s.w_size * 2);
          s.head = new utils.Buf16(s.hash_size);
          s.prev = new utils.Buf16(s.w_size);
          s.lit_bufsize = 1 << (memLevel + 6);
          s.pending_buf_size = s.lit_bufsize * 4;
          s.pending_buf = new utils.Buf8(s.pending_buf_size);
          s.d_buf = 1 * s.lit_bufsize;
          s.l_buf = (1 + 2) * s.lit_bufsize;
          s.level = level;
          s.strategy = strategy;
          s.method = method;
          return deflateReset(strm);
        }
        function deflateInit(strm, level) {
          return deflateInit2(
            strm,
            level,
            Z_DEFLATED,
            MAX_WBITS,
            DEF_MEM_LEVEL,
            Z_DEFAULT_STRATEGY
          );
        }
        function deflate(strm, flush) {
          var old_flush, s;
          var beg, val;
          if (!strm || !strm.state || flush > Z_BLOCK || flush < 0) {
            return strm ? err(strm, Z_STREAM_ERROR) : Z_STREAM_ERROR;
          }
          s = strm.state;
          if (
            !strm.output ||
            (!strm.input && strm.avail_in !== 0) ||
            (s.status === FINISH_STATE && flush !== Z_FINISH)
          ) {
            return err(
              strm,
              strm.avail_out === 0 ? Z_BUF_ERROR : Z_STREAM_ERROR
            );
          }
          s.strm = strm;
          old_flush = s.last_flush;
          s.last_flush = flush;
          if (s.status === INIT_STATE) {
            if (s.wrap === 2) {
              strm.adler = 0;
              put_byte(s, 31);
              put_byte(s, 139);
              put_byte(s, 8);
              if (!s.gzhead) {
                put_byte(s, 0);
                put_byte(s, 0);
                put_byte(s, 0);
                put_byte(s, 0);
                put_byte(s, 0);
                put_byte(
                  s,
                  s.level === 9
                    ? 2
                    : s.strategy >= Z_HUFFMAN_ONLY || s.level < 2
                    ? 4
                    : 0
                );
                put_byte(s, OS_CODE);
                s.status = BUSY_STATE;
              } else {
                put_byte(
                  s,
                  (s.gzhead.text ? 1 : 0) +
                    (s.gzhead.hcrc ? 2 : 0) +
                    (!s.gzhead.extra ? 0 : 4) +
                    (!s.gzhead.name ? 0 : 8) +
                    (!s.gzhead.comment ? 0 : 16)
                );
                put_byte(s, s.gzhead.time & 255);
                put_byte(s, (s.gzhead.time >> 8) & 255);
                put_byte(s, (s.gzhead.time >> 16) & 255);
                put_byte(s, (s.gzhead.time >> 24) & 255);
                put_byte(
                  s,
                  s.level === 9
                    ? 2
                    : s.strategy >= Z_HUFFMAN_ONLY || s.level < 2
                    ? 4
                    : 0
                );
                put_byte(s, s.gzhead.os & 255);
                if (s.gzhead.extra && s.gzhead.extra.length) {
                  put_byte(s, s.gzhead.extra.length & 255);
                  put_byte(s, (s.gzhead.extra.length >> 8) & 255);
                }
                if (s.gzhead.hcrc) {
                  strm.adler = crc32(strm.adler, s.pending_buf, s.pending, 0);
                }
                s.gzindex = 0;
                s.status = EXTRA_STATE;
              }
            } else {
              var header = (Z_DEFLATED + ((s.w_bits - 8) << 4)) << 8;
              var level_flags = -1;
              if (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2) {
                level_flags = 0;
              } else if (s.level < 6) {
                level_flags = 1;
              } else if (s.level === 6) {
                level_flags = 2;
              } else {
                level_flags = 3;
              }
              header |= level_flags << 6;
              if (s.strstart !== 0) {
                header |= PRESET_DICT;
              }
              header += 31 - (header % 31);
              s.status = BUSY_STATE;
              putShortMSB(s, header);
              if (s.strstart !== 0) {
                putShortMSB(s, strm.adler >>> 16);
                putShortMSB(s, strm.adler & 65535);
              }
              strm.adler = 1;
            }
          }
          if (s.status === EXTRA_STATE) {
            if (s.gzhead.extra) {
              beg = s.pending;
              while (s.gzindex < (s.gzhead.extra.length & 65535)) {
                if (s.pending === s.pending_buf_size) {
                  if (s.gzhead.hcrc && s.pending > beg) {
                    strm.adler = crc32(
                      strm.adler,
                      s.pending_buf,
                      s.pending - beg,
                      beg
                    );
                  }
                  flush_pending(strm);
                  beg = s.pending;
                  if (s.pending === s.pending_buf_size) {
                    break;
                  }
                }
                put_byte(s, s.gzhead.extra[s.gzindex] & 255);
                s.gzindex++;
              }
              if (s.gzhead.hcrc && s.pending > beg) {
                strm.adler = crc32(
                  strm.adler,
                  s.pending_buf,
                  s.pending - beg,
                  beg
                );
              }
              if (s.gzindex === s.gzhead.extra.length) {
                s.gzindex = 0;
                s.status = NAME_STATE;
              }
            } else {
              s.status = NAME_STATE;
            }
          }
          if (s.status === NAME_STATE) {
            if (s.gzhead.name) {
              beg = s.pending;
              do {
                if (s.pending === s.pending_buf_size) {
                  if (s.gzhead.hcrc && s.pending > beg) {
                    strm.adler = crc32(
                      strm.adler,
                      s.pending_buf,
                      s.pending - beg,
                      beg
                    );
                  }
                  flush_pending(strm);
                  beg = s.pending;
                  if (s.pending === s.pending_buf_size) {
                    val = 1;
                    break;
                  }
                }
                if (s.gzindex < s.gzhead.name.length) {
                  val = s.gzhead.name.charCodeAt(s.gzindex++) & 255;
                } else {
                  val = 0;
                }
                put_byte(s, val);
              } while (val !== 0);
              if (s.gzhead.hcrc && s.pending > beg) {
                strm.adler = crc32(
                  strm.adler,
                  s.pending_buf,
                  s.pending - beg,
                  beg
                );
              }
              if (val === 0) {
                s.gzindex = 0;
                s.status = COMMENT_STATE;
              }
            } else {
              s.status = COMMENT_STATE;
            }
          }
          if (s.status === COMMENT_STATE) {
            if (s.gzhead.comment) {
              beg = s.pending;
              do {
                if (s.pending === s.pending_buf_size) {
                  if (s.gzhead.hcrc && s.pending > beg) {
                    strm.adler = crc32(
                      strm.adler,
                      s.pending_buf,
                      s.pending - beg,
                      beg
                    );
                  }
                  flush_pending(strm);
                  beg = s.pending;
                  if (s.pending === s.pending_buf_size) {
                    val = 1;
                    break;
                  }
                }
                if (s.gzindex < s.gzhead.comment.length) {
                  val = s.gzhead.comment.charCodeAt(s.gzindex++) & 255;
                } else {
                  val = 0;
                }
                put_byte(s, val);
              } while (val !== 0);
              if (s.gzhead.hcrc && s.pending > beg) {
                strm.adler = crc32(
                  strm.adler,
                  s.pending_buf,
                  s.pending - beg,
                  beg
                );
              }
              if (val === 0) {
                s.status = HCRC_STATE;
              }
            } else {
              s.status = HCRC_STATE;
            }
          }
          if (s.status === HCRC_STATE) {
            if (s.gzhead.hcrc) {
              if (s.pending + 2 > s.pending_buf_size) {
                flush_pending(strm);
              }
              if (s.pending + 2 <= s.pending_buf_size) {
                put_byte(s, strm.adler & 255);
                put_byte(s, (strm.adler >> 8) & 255);
                strm.adler = 0;
                s.status = BUSY_STATE;
              }
            } else {
              s.status = BUSY_STATE;
            }
          }
          if (s.pending !== 0) {
            flush_pending(strm);
            if (strm.avail_out === 0) {
              s.last_flush = -1;
              return Z_OK;
            }
          } else if (
            strm.avail_in === 0 &&
            rank(flush) <= rank(old_flush) &&
            flush !== Z_FINISH
          ) {
            return err(strm, Z_BUF_ERROR);
          }
          if (s.status === FINISH_STATE && strm.avail_in !== 0) {
            return err(strm, Z_BUF_ERROR);
          }
          if (
            strm.avail_in !== 0 ||
            s.lookahead !== 0 ||
            (flush !== Z_NO_FLUSH && s.status !== FINISH_STATE)
          ) {
            var bstate =
              s.strategy === Z_HUFFMAN_ONLY
                ? deflate_huff(s, flush)
                : s.strategy === Z_RLE
                ? deflate_rle(s, flush)
                : configuration_table[s.level].func(s, flush);
            if (bstate === BS_FINISH_STARTED || bstate === BS_FINISH_DONE) {
              s.status = FINISH_STATE;
            }
            if (bstate === BS_NEED_MORE || bstate === BS_FINISH_STARTED) {
              if (strm.avail_out === 0) {
                s.last_flush = -1;
              }
              return Z_OK;
            }
            if (bstate === BS_BLOCK_DONE) {
              if (flush === Z_PARTIAL_FLUSH) {
                trees._tr_align(s);
              } else if (flush !== Z_BLOCK) {
                trees._tr_stored_block(s, 0, 0, false);
                if (flush === Z_FULL_FLUSH) {
                  zero(s.head);
                  if (s.lookahead === 0) {
                    s.strstart = 0;
                    s.block_start = 0;
                    s.insert = 0;
                  }
                }
              }
              flush_pending(strm);
              if (strm.avail_out === 0) {
                s.last_flush = -1;
                return Z_OK;
              }
            }
          }
          if (flush !== Z_FINISH) {
            return Z_OK;
          }
          if (s.wrap <= 0) {
            return Z_STREAM_END;
          }
          if (s.wrap === 2) {
            put_byte(s, strm.adler & 255);
            put_byte(s, (strm.adler >> 8) & 255);
            put_byte(s, (strm.adler >> 16) & 255);
            put_byte(s, (strm.adler >> 24) & 255);
            put_byte(s, strm.total_in & 255);
            put_byte(s, (strm.total_in >> 8) & 255);
            put_byte(s, (strm.total_in >> 16) & 255);
            put_byte(s, (strm.total_in >> 24) & 255);
          } else {
            putShortMSB(s, strm.adler >>> 16);
            putShortMSB(s, strm.adler & 65535);
          }
          flush_pending(strm);
          if (s.wrap > 0) {
            s.wrap = -s.wrap;
          }
          return s.pending !== 0 ? Z_OK : Z_STREAM_END;
        }
        function deflateEnd(strm) {
          var status;
          if (!strm || !strm.state) {
            return Z_STREAM_ERROR;
          }
          status = strm.state.status;
          if (
            status !== INIT_STATE &&
            status !== EXTRA_STATE &&
            status !== NAME_STATE &&
            status !== COMMENT_STATE &&
            status !== HCRC_STATE &&
            status !== BUSY_STATE &&
            status !== FINISH_STATE
          ) {
            return err(strm, Z_STREAM_ERROR);
          }
          strm.state = null;
          return status === BUSY_STATE ? err(strm, Z_DATA_ERROR) : Z_OK;
        }
        function deflateSetDictionary(strm, dictionary) {
          var dictLength = dictionary.length;
          var s;
          var str, n;
          var wrap;
          var avail;
          var next;
          var input;
          var tmpDict;
          if (!strm || !strm.state) {
            return Z_STREAM_ERROR;
          }
          s = strm.state;
          wrap = s.wrap;
          if (
            wrap === 2 ||
            (wrap === 1 && s.status !== INIT_STATE) ||
            s.lookahead
          ) {
            return Z_STREAM_ERROR;
          }
          if (wrap === 1) {
            strm.adler = adler32(strm.adler, dictionary, dictLength, 0);
          }
          s.wrap = 0;
          if (dictLength >= s.w_size) {
            if (wrap === 0) {
              zero(s.head);
              s.strstart = 0;
              s.block_start = 0;
              s.insert = 0;
            }
            tmpDict = new utils.Buf8(s.w_size);
            utils.arraySet(
              tmpDict,
              dictionary,
              dictLength - s.w_size,
              s.w_size,
              0
            );
            dictionary = tmpDict;
            dictLength = s.w_size;
          }
          avail = strm.avail_in;
          next = strm.next_in;
          input = strm.input;
          strm.avail_in = dictLength;
          strm.next_in = 0;
          strm.input = dictionary;
          fill_window(s);
          while (s.lookahead >= MIN_MATCH) {
            str = s.strstart;
            n = s.lookahead - (MIN_MATCH - 1);
            do {
              s.ins_h =
                ((s.ins_h << s.hash_shift) ^ s.window[str + MIN_MATCH - 1]) &
                s.hash_mask;
              s.prev[str & s.w_mask] = s.head[s.ins_h];
              s.head[s.ins_h] = str;
              str++;
            } while (--n);
            s.strstart = str;
            s.lookahead = MIN_MATCH - 1;
            fill_window(s);
          }
          s.strstart += s.lookahead;
          s.block_start = s.strstart;
          s.insert = s.lookahead;
          s.lookahead = 0;
          s.match_length = s.prev_length = MIN_MATCH - 1;
          s.match_available = 0;
          strm.next_in = next;
          strm.input = input;
          strm.avail_in = avail;
          s.wrap = wrap;
          return Z_OK;
        }
        exports.deflateInit = deflateInit;
        exports.deflateInit2 = deflateInit2;
        exports.deflateReset = deflateReset;
        exports.deflateResetKeep = deflateResetKeep;
        exports.deflateSetHeader = deflateSetHeader;
        exports.deflate = deflate;
        exports.deflateEnd = deflateEnd;
        exports.deflateSetDictionary = deflateSetDictionary;
        exports.deflateInfo = "pako deflate (from Nodeca project)";
      },
      {
        "../utils/common": 30,
        "./adler32": 32,
        "./crc32": 34,
        "./messages": 40,
        "./trees": 41,
      },
    ],
    36: [
      function (require, module, exports) {
        "use strict";
        function GZheader() {
          this.text = 0;
          this.time = 0;
          this.xflags = 0;
          this.os = 0;
          this.extra = null;
          this.extra_len = 0;
          this.name = "";
          this.comment = "";
          this.hcrc = 0;
          this.done = false;
        }
        module.exports = GZheader;
      },
      {},
    ],
    37: [
      function (require, module, exports) {
        "use strict";
        var BAD = 30;
        var TYPE = 12;
        module.exports = function inflate_fast(strm, start) {
          var state;
          var _in;
          var last;
          var _out;
          var beg;
          var end;
          var dmax;
          var wsize;
          var whave;
          var wnext;
          var s_window;
          var hold;
          var bits;
          var lcode;
          var dcode;
          var lmask;
          var dmask;
          var here;
          var op;
          var len;
          var dist;
          var from;
          var from_source;
          var input, output;
          state = strm.state;
          _in = strm.next_in;
          input = strm.input;
          last = _in + (strm.avail_in - 5);
          _out = strm.next_out;
          output = strm.output;
          beg = _out - (start - strm.avail_out);
          end = _out + (strm.avail_out - 257);
          dmax = state.dmax;
          wsize = state.wsize;
          whave = state.whave;
          wnext = state.wnext;
          s_window = state.window;
          hold = state.hold;
          bits = state.bits;
          lcode = state.lencode;
          dcode = state.distcode;
          lmask = (1 << state.lenbits) - 1;
          dmask = (1 << state.distbits) - 1;
          top: do {
            if (bits < 15) {
              hold += input[_in++] << bits;
              bits += 8;
              hold += input[_in++] << bits;
              bits += 8;
            }
            here = lcode[hold & lmask];
            dolen: for (;;) {
              op = here >>> 24;
              hold >>>= op;
              bits -= op;
              op = (here >>> 16) & 255;
              if (op === 0) {
                output[_out++] = here & 65535;
              } else if (op & 16) {
                len = here & 65535;
                op &= 15;
                if (op) {
                  if (bits < op) {
                    hold += input[_in++] << bits;
                    bits += 8;
                  }
                  len += hold & ((1 << op) - 1);
                  hold >>>= op;
                  bits -= op;
                }
                if (bits < 15) {
                  hold += input[_in++] << bits;
                  bits += 8;
                  hold += input[_in++] << bits;
                  bits += 8;
                }
                here = dcode[hold & dmask];
                dodist: for (;;) {
                  op = here >>> 24;
                  hold >>>= op;
                  bits -= op;
                  op = (here >>> 16) & 255;
                  if (op & 16) {
                    dist = here & 65535;
                    op &= 15;
                    if (bits < op) {
                      hold += input[_in++] << bits;
                      bits += 8;
                      if (bits < op) {
                        hold += input[_in++] << bits;
                        bits += 8;
                      }
                    }
                    dist += hold & ((1 << op) - 1);
                    if (dist > dmax) {
                      strm.msg = "invalid distance too far back";
                      state.mode = BAD;
                      break top;
                    }
                    hold >>>= op;
                    bits -= op;
                    op = _out - beg;
                    if (dist > op) {
                      op = dist - op;
                      if (op > whave) {
                        if (state.sane) {
                          strm.msg = "invalid distance too far back";
                          state.mode = BAD;
                          break top;
                        }
                      }
                      from = 0;
                      from_source = s_window;
                      if (wnext === 0) {
                        from += wsize - op;
                        if (op < len) {
                          len -= op;
                          do {
                            output[_out++] = s_window[from++];
                          } while (--op);
                          from = _out - dist;
                          from_source = output;
                        }
                      } else if (wnext < op) {
                        from += wsize + wnext - op;
                        op -= wnext;
                        if (op < len) {
                          len -= op;
                          do {
                            output[_out++] = s_window[from++];
                          } while (--op);
                          from = 0;
                          if (wnext < len) {
                            op = wnext;
                            len -= op;
                            do {
                              output[_out++] = s_window[from++];
                            } while (--op);
                            from = _out - dist;
                            from_source = output;
                          }
                        }
                      } else {
                        from += wnext - op;
                        if (op < len) {
                          len -= op;
                          do {
                            output[_out++] = s_window[from++];
                          } while (--op);
                          from = _out - dist;
                          from_source = output;
                        }
                      }
                      while (len > 2) {
                        output[_out++] = from_source[from++];
                        output[_out++] = from_source[from++];
                        output[_out++] = from_source[from++];
                        len -= 3;
                      }
                      if (len) {
                        output[_out++] = from_source[from++];
                        if (len > 1) {
                          output[_out++] = from_source[from++];
                        }
                      }
                    } else {
                      from = _out - dist;
                      do {
                        output[_out++] = output[from++];
                        output[_out++] = output[from++];
                        output[_out++] = output[from++];
                        len -= 3;
                      } while (len > 2);
                      if (len) {
                        output[_out++] = output[from++];
                        if (len > 1) {
                          output[_out++] = output[from++];
                        }
                      }
                    }
                  } else if ((op & 64) === 0) {
                    here = dcode[(here & 65535) + (hold & ((1 << op) - 1))];
                    continue dodist;
                  } else {
                    strm.msg = "invalid distance code";
                    state.mode = BAD;
                    break top;
                  }
                  break;
                }
              } else if ((op & 64) === 0) {
                here = lcode[(here & 65535) + (hold & ((1 << op) - 1))];
                continue dolen;
              } else if (op & 32) {
                state.mode = TYPE;
                break top;
              } else {
                strm.msg = "invalid literal/length code";
                state.mode = BAD;
                break top;
              }
              break;
            }
          } while (_in < last && _out < end);
          len = bits >> 3;
          _in -= len;
          bits -= len << 3;
          hold &= (1 << bits) - 1;
          strm.next_in = _in;
          strm.next_out = _out;
          strm.avail_in = _in < last ? 5 + (last - _in) : 5 - (_in - last);
          strm.avail_out = _out < end ? 257 + (end - _out) : 257 - (_out - end);
          state.hold = hold;
          state.bits = bits;
          return;
        };
      },
      {},
    ],
    38: [
      function (require, module, exports) {
        "use strict";
        var utils = require("../utils/common");
        var adler32 = require("./adler32");
        var crc32 = require("./crc32");
        var inflate_fast = require("./inffast");
        var inflate_table = require("./inftrees");
        var CODES = 0;
        var LENS = 1;
        var DISTS = 2;
        var Z_FINISH = 4;
        var Z_BLOCK = 5;
        var Z_TREES = 6;
        var Z_OK = 0;
        var Z_STREAM_END = 1;
        var Z_NEED_DICT = 2;
        var Z_STREAM_ERROR = -2;
        var Z_DATA_ERROR = -3;
        var Z_MEM_ERROR = -4;
        var Z_BUF_ERROR = -5;
        var Z_DEFLATED = 8;
        var HEAD = 1;
        var FLAGS = 2;
        var TIME = 3;
        var OS = 4;
        var EXLEN = 5;
        var EXTRA = 6;
        var NAME = 7;
        var COMMENT = 8;
        var HCRC = 9;
        var DICTID = 10;
        var DICT = 11;
        var TYPE = 12;
        var TYPEDO = 13;
        var STORED = 14;
        var COPY_ = 15;
        var COPY = 16;
        var TABLE = 17;
        var LENLENS = 18;
        var CODELENS = 19;
        var LEN_ = 20;
        var LEN = 21;
        var LENEXT = 22;
        var DIST = 23;
        var DISTEXT = 24;
        var MATCH = 25;
        var LIT = 26;
        var CHECK = 27;
        var LENGTH = 28;
        var DONE = 29;
        var BAD = 30;
        var MEM = 31;
        var SYNC = 32;
        var ENOUGH_LENS = 852;
        var ENOUGH_DISTS = 592;
        var MAX_WBITS = 15;
        var DEF_WBITS = MAX_WBITS;
        function zswap32(q) {
          return (
            ((q >>> 24) & 255) +
            ((q >>> 8) & 65280) +
            ((q & 65280) << 8) +
            ((q & 255) << 24)
          );
        }
        function InflateState() {
          this.mode = 0;
          this.last = false;
          this.wrap = 0;
          this.havedict = false;
          this.flags = 0;
          this.dmax = 0;
          this.check = 0;
          this.total = 0;
          this.head = null;
          this.wbits = 0;
          this.wsize = 0;
          this.whave = 0;
          this.wnext = 0;
          this.window = null;
          this.hold = 0;
          this.bits = 0;
          this.length = 0;
          this.offset = 0;
          this.extra = 0;
          this.lencode = null;
          this.distcode = null;
          this.lenbits = 0;
          this.distbits = 0;
          this.ncode = 0;
          this.nlen = 0;
          this.ndist = 0;
          this.have = 0;
          this.next = null;
          this.lens = new utils.Buf16(320);
          this.work = new utils.Buf16(288);
          this.lendyn = null;
          this.distdyn = null;
          this.sane = 0;
          this.back = 0;
          this.was = 0;
        }
        function inflateResetKeep(strm) {
          var state;
          if (!strm || !strm.state) {
            return Z_STREAM_ERROR;
          }
          state = strm.state;
          strm.total_in = strm.total_out = state.total = 0;
          strm.msg = "";
          if (state.wrap) {
            strm.adler = state.wrap & 1;
          }
          state.mode = HEAD;
          state.last = 0;
          state.havedict = 0;
          state.dmax = 32768;
          state.head = null;
          state.hold = 0;
          state.bits = 0;
          state.lencode = state.lendyn = new utils.Buf32(ENOUGH_LENS);
          state.distcode = state.distdyn = new utils.Buf32(ENOUGH_DISTS);
          state.sane = 1;
          state.back = -1;
          return Z_OK;
        }
        function inflateReset(strm) {
          var state;
          if (!strm || !strm.state) {
            return Z_STREAM_ERROR;
          }
          state = strm.state;
          state.wsize = 0;
          state.whave = 0;
          state.wnext = 0;
          return inflateResetKeep(strm);
        }
        function inflateReset2(strm, windowBits) {
          var wrap;
          var state;
          if (!strm || !strm.state) {
            return Z_STREAM_ERROR;
          }
          state = strm.state;
          if (windowBits < 0) {
            wrap = 0;
            windowBits = -windowBits;
          } else {
            wrap = (windowBits >> 4) + 1;
            if (windowBits < 48) {
              windowBits &= 15;
            }
          }
          if (windowBits && (windowBits < 8 || windowBits > 15)) {
            return Z_STREAM_ERROR;
          }
          if (state.window !== null && state.wbits !== windowBits) {
            state.window = null;
          }
          state.wrap = wrap;
          state.wbits = windowBits;
          return inflateReset(strm);
        }
        function inflateInit2(strm, windowBits) {
          var ret;
          var state;
          if (!strm) {
            return Z_STREAM_ERROR;
          }
          state = new InflateState();
          strm.state = state;
          state.window = null;
          ret = inflateReset2(strm, windowBits);
          if (ret !== Z_OK) {
            strm.state = null;
          }
          return ret;
        }
        function inflateInit(strm) {
          return inflateInit2(strm, DEF_WBITS);
        }
        var virgin = true;
        var lenfix, distfix;
        function fixedtables(state) {
          if (virgin) {
            var sym;
            lenfix = new utils.Buf32(512);
            distfix = new utils.Buf32(32);
            sym = 0;
            while (sym < 144) {
              state.lens[sym++] = 8;
            }
            while (sym < 256) {
              state.lens[sym++] = 9;
            }
            while (sym < 280) {
              state.lens[sym++] = 7;
            }
            while (sym < 288) {
              state.lens[sym++] = 8;
            }
            inflate_table(LENS, state.lens, 0, 288, lenfix, 0, state.work, {
              bits: 9,
            });
            sym = 0;
            while (sym < 32) {
              state.lens[sym++] = 5;
            }
            inflate_table(DISTS, state.lens, 0, 32, distfix, 0, state.work, {
              bits: 5,
            });
            virgin = false;
          }
          state.lencode = lenfix;
          state.lenbits = 9;
          state.distcode = distfix;
          state.distbits = 5;
        }
        function updatewindow(strm, src, end, copy) {
          var dist;
          var state = strm.state;
          if (state.window === null) {
            state.wsize = 1 << state.wbits;
            state.wnext = 0;
            state.whave = 0;
            state.window = new utils.Buf8(state.wsize);
          }
          if (copy >= state.wsize) {
            utils.arraySet(
              state.window,
              src,
              end - state.wsize,
              state.wsize,
              0
            );
            state.wnext = 0;
            state.whave = state.wsize;
          } else {
            dist = state.wsize - state.wnext;
            if (dist > copy) {
              dist = copy;
            }
            utils.arraySet(state.window, src, end - copy, dist, state.wnext);
            copy -= dist;
            if (copy) {
              utils.arraySet(state.window, src, end - copy, copy, 0);
              state.wnext = copy;
              state.whave = state.wsize;
            } else {
              state.wnext += dist;
              if (state.wnext === state.wsize) {
                state.wnext = 0;
              }
              if (state.whave < state.wsize) {
                state.whave += dist;
              }
            }
          }
          return 0;
        }
        function inflate(strm, flush) {
          var state;
          var input, output;
          var next;
          var put;
          var have, left;
          var hold;
          var bits;
          var _in, _out;
          var copy;
          var from;
          var from_source;
          var here = 0;
          var here_bits, here_op, here_val;
          var last_bits, last_op, last_val;
          var len;
          var ret;
          var hbuf = new utils.Buf8(4);
          var opts;
          var n;
          var order = [
            16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15,
          ];
          if (
            !strm ||
            !strm.state ||
            !strm.output ||
            (!strm.input && strm.avail_in !== 0)
          ) {
            return Z_STREAM_ERROR;
          }
          state = strm.state;
          if (state.mode === TYPE) {
            state.mode = TYPEDO;
          }
          put = strm.next_out;
          output = strm.output;
          left = strm.avail_out;
          next = strm.next_in;
          input = strm.input;
          have = strm.avail_in;
          hold = state.hold;
          bits = state.bits;
          _in = have;
          _out = left;
          ret = Z_OK;
          inf_leave: for (;;) {
            switch (state.mode) {
              case HEAD:
                if (state.wrap === 0) {
                  state.mode = TYPEDO;
                  break;
                }
                while (bits < 16) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                if (state.wrap & 2 && hold === 35615) {
                  state.check = 0;
                  hbuf[0] = hold & 255;
                  hbuf[1] = (hold >>> 8) & 255;
                  state.check = crc32(state.check, hbuf, 2, 0);
                  hold = 0;
                  bits = 0;
                  state.mode = FLAGS;
                  break;
                }
                state.flags = 0;
                if (state.head) {
                  state.head.done = false;
                }
                if (
                  !(state.wrap & 1) ||
                  (((hold & 255) << 8) + (hold >> 8)) % 31
                ) {
                  strm.msg = "incorrect header check";
                  state.mode = BAD;
                  break;
                }
                if ((hold & 15) !== Z_DEFLATED) {
                  strm.msg = "unknown compression method";
                  state.mode = BAD;
                  break;
                }
                hold >>>= 4;
                bits -= 4;
                len = (hold & 15) + 8;
                if (state.wbits === 0) {
                  state.wbits = len;
                } else if (len > state.wbits) {
                  strm.msg = "invalid window size";
                  state.mode = BAD;
                  break;
                }
                state.dmax = 1 << len;
                strm.adler = state.check = 1;
                state.mode = hold & 512 ? DICTID : TYPE;
                hold = 0;
                bits = 0;
                break;
              case FLAGS:
                while (bits < 16) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                state.flags = hold;
                if ((state.flags & 255) !== Z_DEFLATED) {
                  strm.msg = "unknown compression method";
                  state.mode = BAD;
                  break;
                }
                if (state.flags & 57344) {
                  strm.msg = "unknown header flags set";
                  state.mode = BAD;
                  break;
                }
                if (state.head) {
                  state.head.text = (hold >> 8) & 1;
                }
                if (state.flags & 512) {
                  hbuf[0] = hold & 255;
                  hbuf[1] = (hold >>> 8) & 255;
                  state.check = crc32(state.check, hbuf, 2, 0);
                }
                hold = 0;
                bits = 0;
                state.mode = TIME;
              case TIME:
                while (bits < 32) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                if (state.head) {
                  state.head.time = hold;
                }
                if (state.flags & 512) {
                  hbuf[0] = hold & 255;
                  hbuf[1] = (hold >>> 8) & 255;
                  hbuf[2] = (hold >>> 16) & 255;
                  hbuf[3] = (hold >>> 24) & 255;
                  state.check = crc32(state.check, hbuf, 4, 0);
                }
                hold = 0;
                bits = 0;
                state.mode = OS;
              case OS:
                while (bits < 16) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                if (state.head) {
                  state.head.xflags = hold & 255;
                  state.head.os = hold >> 8;
                }
                if (state.flags & 512) {
                  hbuf[0] = hold & 255;
                  hbuf[1] = (hold >>> 8) & 255;
                  state.check = crc32(state.check, hbuf, 2, 0);
                }
                hold = 0;
                bits = 0;
                state.mode = EXLEN;
              case EXLEN:
                if (state.flags & 1024) {
                  while (bits < 16) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  state.length = hold;
                  if (state.head) {
                    state.head.extra_len = hold;
                  }
                  if (state.flags & 512) {
                    hbuf[0] = hold & 255;
                    hbuf[1] = (hold >>> 8) & 255;
                    state.check = crc32(state.check, hbuf, 2, 0);
                  }
                  hold = 0;
                  bits = 0;
                } else if (state.head) {
                  state.head.extra = null;
                }
                state.mode = EXTRA;
              case EXTRA:
                if (state.flags & 1024) {
                  copy = state.length;
                  if (copy > have) {
                    copy = have;
                  }
                  if (copy) {
                    if (state.head) {
                      len = state.head.extra_len - state.length;
                      if (!state.head.extra) {
                        state.head.extra = new Array(state.head.extra_len);
                      }
                      utils.arraySet(state.head.extra, input, next, copy, len);
                    }
                    if (state.flags & 512) {
                      state.check = crc32(state.check, input, copy, next);
                    }
                    have -= copy;
                    next += copy;
                    state.length -= copy;
                  }
                  if (state.length) {
                    break inf_leave;
                  }
                }
                state.length = 0;
                state.mode = NAME;
              case NAME:
                if (state.flags & 2048) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  copy = 0;
                  do {
                    len = input[next + copy++];
                    if (state.head && len && state.length < 65536) {
                      state.head.name += String.fromCharCode(len);
                    }
                  } while (len && copy < have);
                  if (state.flags & 512) {
                    state.check = crc32(state.check, input, copy, next);
                  }
                  have -= copy;
                  next += copy;
                  if (len) {
                    break inf_leave;
                  }
                } else if (state.head) {
                  state.head.name = null;
                }
                state.length = 0;
                state.mode = COMMENT;
              case COMMENT:
                if (state.flags & 4096) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  copy = 0;
                  do {
                    len = input[next + copy++];
                    if (state.head && len && state.length < 65536) {
                      state.head.comment += String.fromCharCode(len);
                    }
                  } while (len && copy < have);
                  if (state.flags & 512) {
                    state.check = crc32(state.check, input, copy, next);
                  }
                  have -= copy;
                  next += copy;
                  if (len) {
                    break inf_leave;
                  }
                } else if (state.head) {
                  state.head.comment = null;
                }
                state.mode = HCRC;
              case HCRC:
                if (state.flags & 512) {
                  while (bits < 16) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  if (hold !== (state.check & 65535)) {
                    strm.msg = "header crc mismatch";
                    state.mode = BAD;
                    break;
                  }
                  hold = 0;
                  bits = 0;
                }
                if (state.head) {
                  state.head.hcrc = (state.flags >> 9) & 1;
                  state.head.done = true;
                }
                strm.adler = state.check = 0;
                state.mode = TYPE;
                break;
              case DICTID:
                while (bits < 32) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                strm.adler = state.check = zswap32(hold);
                hold = 0;
                bits = 0;
                state.mode = DICT;
              case DICT:
                if (state.havedict === 0) {
                  strm.next_out = put;
                  strm.avail_out = left;
                  strm.next_in = next;
                  strm.avail_in = have;
                  state.hold = hold;
                  state.bits = bits;
                  return Z_NEED_DICT;
                }
                strm.adler = state.check = 1;
                state.mode = TYPE;
              case TYPE:
                if (flush === Z_BLOCK || flush === Z_TREES) {
                  break inf_leave;
                }
              case TYPEDO:
                if (state.last) {
                  hold >>>= bits & 7;
                  bits -= bits & 7;
                  state.mode = CHECK;
                  break;
                }
                while (bits < 3) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                state.last = hold & 1;
                hold >>>= 1;
                bits -= 1;
                switch (hold & 3) {
                  case 0:
                    state.mode = STORED;
                    break;
                  case 1:
                    fixedtables(state);
                    state.mode = LEN_;
                    if (flush === Z_TREES) {
                      hold >>>= 2;
                      bits -= 2;
                      break inf_leave;
                    }
                    break;
                  case 2:
                    state.mode = TABLE;
                    break;
                  case 3:
                    strm.msg = "invalid block type";
                    state.mode = BAD;
                }
                hold >>>= 2;
                bits -= 2;
                break;
              case STORED:
                hold >>>= bits & 7;
                bits -= bits & 7;
                while (bits < 32) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                if ((hold & 65535) !== ((hold >>> 16) ^ 65535)) {
                  strm.msg = "invalid stored block lengths";
                  state.mode = BAD;
                  break;
                }
                state.length = hold & 65535;
                hold = 0;
                bits = 0;
                state.mode = COPY_;
                if (flush === Z_TREES) {
                  break inf_leave;
                }
              case COPY_:
                state.mode = COPY;
              case COPY:
                copy = state.length;
                if (copy) {
                  if (copy > have) {
                    copy = have;
                  }
                  if (copy > left) {
                    copy = left;
                  }
                  if (copy === 0) {
                    break inf_leave;
                  }
                  utils.arraySet(output, input, next, copy, put);
                  have -= copy;
                  next += copy;
                  left -= copy;
                  put += copy;
                  state.length -= copy;
                  break;
                }
                state.mode = TYPE;
                break;
              case TABLE:
                while (bits < 14) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                state.nlen = (hold & 31) + 257;
                hold >>>= 5;
                bits -= 5;
                state.ndist = (hold & 31) + 1;
                hold >>>= 5;
                bits -= 5;
                state.ncode = (hold & 15) + 4;
                hold >>>= 4;
                bits -= 4;
                if (state.nlen > 286 || state.ndist > 30) {
                  strm.msg = "too many length or distance symbols";
                  state.mode = BAD;
                  break;
                }
                state.have = 0;
                state.mode = LENLENS;
              case LENLENS:
                while (state.have < state.ncode) {
                  while (bits < 3) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  state.lens[order[state.have++]] = hold & 7;
                  hold >>>= 3;
                  bits -= 3;
                }
                while (state.have < 19) {
                  state.lens[order[state.have++]] = 0;
                }
                state.lencode = state.lendyn;
                state.lenbits = 7;
                opts = { bits: state.lenbits };
                ret = inflate_table(
                  CODES,
                  state.lens,
                  0,
                  19,
                  state.lencode,
                  0,
                  state.work,
                  opts
                );
                state.lenbits = opts.bits;
                if (ret) {
                  strm.msg = "invalid code lengths set";
                  state.mode = BAD;
                  break;
                }
                state.have = 0;
                state.mode = CODELENS;
              case CODELENS:
                while (state.have < state.nlen + state.ndist) {
                  for (;;) {
                    here = state.lencode[hold & ((1 << state.lenbits) - 1)];
                    here_bits = here >>> 24;
                    here_op = (here >>> 16) & 255;
                    here_val = here & 65535;
                    if (here_bits <= bits) {
                      break;
                    }
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  if (here_val < 16) {
                    hold >>>= here_bits;
                    bits -= here_bits;
                    state.lens[state.have++] = here_val;
                  } else {
                    if (here_val === 16) {
                      n = here_bits + 2;
                      while (bits < n) {
                        if (have === 0) {
                          break inf_leave;
                        }
                        have--;
                        hold += input[next++] << bits;
                        bits += 8;
                      }
                      hold >>>= here_bits;
                      bits -= here_bits;
                      if (state.have === 0) {
                        strm.msg = "invalid bit length repeat";
                        state.mode = BAD;
                        break;
                      }
                      len = state.lens[state.have - 1];
                      copy = 3 + (hold & 3);
                      hold >>>= 2;
                      bits -= 2;
                    } else if (here_val === 17) {
                      n = here_bits + 3;
                      while (bits < n) {
                        if (have === 0) {
                          break inf_leave;
                        }
                        have--;
                        hold += input[next++] << bits;
                        bits += 8;
                      }
                      hold >>>= here_bits;
                      bits -= here_bits;
                      len = 0;
                      copy = 3 + (hold & 7);
                      hold >>>= 3;
                      bits -= 3;
                    } else {
                      n = here_bits + 7;
                      while (bits < n) {
                        if (have === 0) {
                          break inf_leave;
                        }
                        have--;
                        hold += input[next++] << bits;
                        bits += 8;
                      }
                      hold >>>= here_bits;
                      bits -= here_bits;
                      len = 0;
                      copy = 11 + (hold & 127);
                      hold >>>= 7;
                      bits -= 7;
                    }
                    if (state.have + copy > state.nlen + state.ndist) {
                      strm.msg = "invalid bit length repeat";
                      state.mode = BAD;
                      break;
                    }
                    while (copy--) {
                      state.lens[state.have++] = len;
                    }
                  }
                }
                if (state.mode === BAD) {
                  break;
                }
                if (state.lens[256] === 0) {
                  strm.msg = "invalid code -- missing end-of-block";
                  state.mode = BAD;
                  break;
                }
                state.lenbits = 9;
                opts = { bits: state.lenbits };
                ret = inflate_table(
                  LENS,
                  state.lens,
                  0,
                  state.nlen,
                  state.lencode,
                  0,
                  state.work,
                  opts
                );
                state.lenbits = opts.bits;
                if (ret) {
                  strm.msg = "invalid literal/lengths set";
                  state.mode = BAD;
                  break;
                }
                state.distbits = 6;
                state.distcode = state.distdyn;
                opts = { bits: state.distbits };
                ret = inflate_table(
                  DISTS,
                  state.lens,
                  state.nlen,
                  state.ndist,
                  state.distcode,
                  0,
                  state.work,
                  opts
                );
                state.distbits = opts.bits;
                if (ret) {
                  strm.msg = "invalid distances set";
                  state.mode = BAD;
                  break;
                }
                state.mode = LEN_;
                if (flush === Z_TREES) {
                  break inf_leave;
                }
              case LEN_:
                state.mode = LEN;
              case LEN:
                if (have >= 6 && left >= 258) {
                  strm.next_out = put;
                  strm.avail_out = left;
                  strm.next_in = next;
                  strm.avail_in = have;
                  state.hold = hold;
                  state.bits = bits;
                  inflate_fast(strm, _out);
                  put = strm.next_out;
                  output = strm.output;
                  left = strm.avail_out;
                  next = strm.next_in;
                  input = strm.input;
                  have = strm.avail_in;
                  hold = state.hold;
                  bits = state.bits;
                  if (state.mode === TYPE) {
                    state.back = -1;
                  }
                  break;
                }
                state.back = 0;
                for (;;) {
                  here = state.lencode[hold & ((1 << state.lenbits) - 1)];
                  here_bits = here >>> 24;
                  here_op = (here >>> 16) & 255;
                  here_val = here & 65535;
                  if (here_bits <= bits) {
                    break;
                  }
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                if (here_op && (here_op & 240) === 0) {
                  last_bits = here_bits;
                  last_op = here_op;
                  last_val = here_val;
                  for (;;) {
                    here =
                      state.lencode[
                        last_val +
                          ((hold & ((1 << (last_bits + last_op)) - 1)) >>
                            last_bits)
                      ];
                    here_bits = here >>> 24;
                    here_op = (here >>> 16) & 255;
                    here_val = here & 65535;
                    if (last_bits + here_bits <= bits) {
                      break;
                    }
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  hold >>>= last_bits;
                  bits -= last_bits;
                  state.back += last_bits;
                }
                hold >>>= here_bits;
                bits -= here_bits;
                state.back += here_bits;
                state.length = here_val;
                if (here_op === 0) {
                  state.mode = LIT;
                  break;
                }
                if (here_op & 32) {
                  state.back = -1;
                  state.mode = TYPE;
                  break;
                }
                if (here_op & 64) {
                  strm.msg = "invalid literal/length code";
                  state.mode = BAD;
                  break;
                }
                state.extra = here_op & 15;
                state.mode = LENEXT;
              case LENEXT:
                if (state.extra) {
                  n = state.extra;
                  while (bits < n) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  state.length += hold & ((1 << state.extra) - 1);
                  hold >>>= state.extra;
                  bits -= state.extra;
                  state.back += state.extra;
                }
                state.was = state.length;
                state.mode = DIST;
              case DIST:
                for (;;) {
                  here = state.distcode[hold & ((1 << state.distbits) - 1)];
                  here_bits = here >>> 24;
                  here_op = (here >>> 16) & 255;
                  here_val = here & 65535;
                  if (here_bits <= bits) {
                    break;
                  }
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                if ((here_op & 240) === 0) {
                  last_bits = here_bits;
                  last_op = here_op;
                  last_val = here_val;
                  for (;;) {
                    here =
                      state.distcode[
                        last_val +
                          ((hold & ((1 << (last_bits + last_op)) - 1)) >>
                            last_bits)
                      ];
                    here_bits = here >>> 24;
                    here_op = (here >>> 16) & 255;
                    here_val = here & 65535;
                    if (last_bits + here_bits <= bits) {
                      break;
                    }
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  hold >>>= last_bits;
                  bits -= last_bits;
                  state.back += last_bits;
                }
                hold >>>= here_bits;
                bits -= here_bits;
                state.back += here_bits;
                if (here_op & 64) {
                  strm.msg = "invalid distance code";
                  state.mode = BAD;
                  break;
                }
                state.offset = here_val;
                state.extra = here_op & 15;
                state.mode = DISTEXT;
              case DISTEXT:
                if (state.extra) {
                  n = state.extra;
                  while (bits < n) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  state.offset += hold & ((1 << state.extra) - 1);
                  hold >>>= state.extra;
                  bits -= state.extra;
                  state.back += state.extra;
                }
                if (state.offset > state.dmax) {
                  strm.msg = "invalid distance too far back";
                  state.mode = BAD;
                  break;
                }
                state.mode = MATCH;
              case MATCH:
                if (left === 0) {
                  break inf_leave;
                }
                copy = _out - left;
                if (state.offset > copy) {
                  copy = state.offset - copy;
                  if (copy > state.whave) {
                    if (state.sane) {
                      strm.msg = "invalid distance too far back";
                      state.mode = BAD;
                      break;
                    }
                  }
                  if (copy > state.wnext) {
                    copy -= state.wnext;
                    from = state.wsize - copy;
                  } else {
                    from = state.wnext - copy;
                  }
                  if (copy > state.length) {
                    copy = state.length;
                  }
                  from_source = state.window;
                } else {
                  from_source = output;
                  from = put - state.offset;
                  copy = state.length;
                }
                if (copy > left) {
                  copy = left;
                }
                left -= copy;
                state.length -= copy;
                do {
                  output[put++] = from_source[from++];
                } while (--copy);
                if (state.length === 0) {
                  state.mode = LEN;
                }
                break;
              case LIT:
                if (left === 0) {
                  break inf_leave;
                }
                output[put++] = state.length;
                left--;
                state.mode = LEN;
                break;
              case CHECK:
                if (state.wrap) {
                  while (bits < 32) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold |= input[next++] << bits;
                    bits += 8;
                  }
                  _out -= left;
                  strm.total_out += _out;
                  state.total += _out;
                  if (_out) {
                    strm.adler = state.check = state.flags
                      ? crc32(state.check, output, _out, put - _out)
                      : adler32(state.check, output, _out, put - _out);
                  }
                  _out = left;
                  if ((state.flags ? hold : zswap32(hold)) !== state.check) {
                    strm.msg = "incorrect data check";
                    state.mode = BAD;
                    break;
                  }
                  hold = 0;
                  bits = 0;
                }
                state.mode = LENGTH;
              case LENGTH:
                if (state.wrap && state.flags) {
                  while (bits < 32) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  if (hold !== (state.total & 4294967295)) {
                    strm.msg = "incorrect length check";
                    state.mode = BAD;
                    break;
                  }
                  hold = 0;
                  bits = 0;
                }
                state.mode = DONE;
              case DONE:
                ret = Z_STREAM_END;
                break inf_leave;
              case BAD:
                ret = Z_DATA_ERROR;
                break inf_leave;
              case MEM:
                return Z_MEM_ERROR;
              case SYNC:
              default:
                return Z_STREAM_ERROR;
            }
          }
          strm.next_out = put;
          strm.avail_out = left;
          strm.next_in = next;
          strm.avail_in = have;
          state.hold = hold;
          state.bits = bits;
          if (
            state.wsize ||
            (_out !== strm.avail_out &&
              state.mode < BAD &&
              (state.mode < CHECK || flush !== Z_FINISH))
          ) {
            if (
              updatewindow(
                strm,
                strm.output,
                strm.next_out,
                _out - strm.avail_out
              )
            ) {
              state.mode = MEM;
              return Z_MEM_ERROR;
            }
          }
          _in -= strm.avail_in;
          _out -= strm.avail_out;
          strm.total_in += _in;
          strm.total_out += _out;
          state.total += _out;
          if (state.wrap && _out) {
            strm.adler = state.check = state.flags
              ? crc32(state.check, output, _out, strm.next_out - _out)
              : adler32(state.check, output, _out, strm.next_out - _out);
          }
          strm.data_type =
            state.bits +
            (state.last ? 64 : 0) +
            (state.mode === TYPE ? 128 : 0) +
            (state.mode === LEN_ || state.mode === COPY_ ? 256 : 0);
          if (
            ((_in === 0 && _out === 0) || flush === Z_FINISH) &&
            ret === Z_OK
          ) {
            ret = Z_BUF_ERROR;
          }
          return ret;
        }
        function inflateEnd(strm) {
          if (!strm || !strm.state) {
            return Z_STREAM_ERROR;
          }
          var state = strm.state;
          if (state.window) {
            state.window = null;
          }
          strm.state = null;
          return Z_OK;
        }
        function inflateGetHeader(strm, head) {
          var state;
          if (!strm || !strm.state) {
            return Z_STREAM_ERROR;
          }
          state = strm.state;
          if ((state.wrap & 2) === 0) {
            return Z_STREAM_ERROR;
          }
          state.head = head;
          head.done = false;
          return Z_OK;
        }
        function inflateSetDictionary(strm, dictionary) {
          var dictLength = dictionary.length;
          var state;
          var dictid;
          var ret;
          if (!strm || !strm.state) {
            return Z_STREAM_ERROR;
          }
          state = strm.state;
          if (state.wrap !== 0 && state.mode !== DICT) {
            return Z_STREAM_ERROR;
          }
          if (state.mode === DICT) {
            dictid = 1;
            dictid = adler32(dictid, dictionary, dictLength, 0);
            if (dictid !== state.check) {
              return Z_DATA_ERROR;
            }
          }
          ret = updatewindow(strm, dictionary, dictLength, dictLength);
          if (ret) {
            state.mode = MEM;
            return Z_MEM_ERROR;
          }
          state.havedict = 1;
          return Z_OK;
        }
        exports.inflateReset = inflateReset;
        exports.inflateReset2 = inflateReset2;
        exports.inflateResetKeep = inflateResetKeep;
        exports.inflateInit = inflateInit;
        exports.inflateInit2 = inflateInit2;
        exports.inflate = inflate;
        exports.inflateEnd = inflateEnd;
        exports.inflateGetHeader = inflateGetHeader;
        exports.inflateSetDictionary = inflateSetDictionary;
        exports.inflateInfo = "pako inflate (from Nodeca project)";
      },
      {
        "../utils/common": 30,
        "./adler32": 32,
        "./crc32": 34,
        "./inffast": 37,
        "./inftrees": 39,
      },
    ],
    39: [
      function (require, module, exports) {
        "use strict";
        var utils = require("../utils/common");
        var MAXBITS = 15;
        var ENOUGH_LENS = 852;
        var ENOUGH_DISTS = 592;
        var CODES = 0;
        var LENS = 1;
        var DISTS = 2;
        var lbase = [
          3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51,
          59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0,
        ];
        var lext = [
          16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18, 19,
          19, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 16, 72, 78,
        ];
        var dbase = [
          1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385,
          513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385,
          24577, 0, 0,
        ];
        var dext = [
          16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22, 23,
          23, 24, 24, 25, 25, 26, 26, 27, 27, 28, 28, 29, 29, 64, 64,
        ];
        module.exports = function inflate_table(
          type,
          lens,
          lens_index,
          codes,
          table,
          table_index,
          work,
          opts
        ) {
          var bits = opts.bits;
          var len = 0;
          var sym = 0;
          var min = 0,
            max = 0;
          var root = 0;
          var curr = 0;
          var drop = 0;
          var left = 0;
          var used = 0;
          var huff = 0;
          var incr;
          var fill;
          var low;
          var mask;
          var next;
          var base = null;
          var base_index = 0;
          var end;
          var count = new utils.Buf16(MAXBITS + 1);
          var offs = new utils.Buf16(MAXBITS + 1);
          var extra = null;
          var extra_index = 0;
          var here_bits, here_op, here_val;
          for (len = 0; len <= MAXBITS; len++) {
            count[len] = 0;
          }
          for (sym = 0; sym < codes; sym++) {
            count[lens[lens_index + sym]]++;
          }
          root = bits;
          for (max = MAXBITS; max >= 1; max--) {
            if (count[max] !== 0) {
              break;
            }
          }
          if (root > max) {
            root = max;
          }
          if (max === 0) {
            table[table_index++] = (1 << 24) | (64 << 16) | 0;
            table[table_index++] = (1 << 24) | (64 << 16) | 0;
            opts.bits = 1;
            return 0;
          }
          for (min = 1; min < max; min++) {
            if (count[min] !== 0) {
              break;
            }
          }
          if (root < min) {
            root = min;
          }
          left = 1;
          for (len = 1; len <= MAXBITS; len++) {
            left <<= 1;
            left -= count[len];
            if (left < 0) {
              return -1;
            }
          }
          if (left > 0 && (type === CODES || max !== 1)) {
            return -1;
          }
          offs[1] = 0;
          for (len = 1; len < MAXBITS; len++) {
            offs[len + 1] = offs[len] + count[len];
          }
          for (sym = 0; sym < codes; sym++) {
            if (lens[lens_index + sym] !== 0) {
              work[offs[lens[lens_index + sym]]++] = sym;
            }
          }
          if (type === CODES) {
            base = extra = work;
            end = 19;
          } else if (type === LENS) {
            base = lbase;
            base_index -= 257;
            extra = lext;
            extra_index -= 257;
            end = 256;
          } else {
            base = dbase;
            extra = dext;
            end = -1;
          }
          huff = 0;
          sym = 0;
          len = min;
          next = table_index;
          curr = root;
          drop = 0;
          low = -1;
          used = 1 << root;
          mask = used - 1;
          if (
            (type === LENS && used > ENOUGH_LENS) ||
            (type === DISTS && used > ENOUGH_DISTS)
          ) {
            return 1;
          }
          var i = 0;
          for (;;) {
            i++;
            here_bits = len - drop;
            if (work[sym] < end) {
              here_op = 0;
              here_val = work[sym];
            } else if (work[sym] > end) {
              here_op = extra[extra_index + work[sym]];
              here_val = base[base_index + work[sym]];
            } else {
              here_op = 32 + 64;
              here_val = 0;
            }
            incr = 1 << (len - drop);
            fill = 1 << curr;
            min = fill;
            do {
              fill -= incr;
              table[next + (huff >> drop) + fill] =
                (here_bits << 24) | (here_op << 16) | here_val | 0;
            } while (fill !== 0);
            incr = 1 << (len - 1);
            while (huff & incr) {
              incr >>= 1;
            }
            if (incr !== 0) {
              huff &= incr - 1;
              huff += incr;
            } else {
              huff = 0;
            }
            sym++;
            if (--count[len] === 0) {
              if (len === max) {
                break;
              }
              len = lens[lens_index + work[sym]];
            }
            if (len > root && (huff & mask) !== low) {
              if (drop === 0) {
                drop = root;
              }
              next += min;
              curr = len - drop;
              left = 1 << curr;
              while (curr + drop < max) {
                left -= count[curr + drop];
                if (left <= 0) {
                  break;
                }
                curr++;
                left <<= 1;
              }
              used += 1 << curr;
              if (
                (type === LENS && used > ENOUGH_LENS) ||
                (type === DISTS && used > ENOUGH_DISTS)
              ) {
                return 1;
              }
              low = huff & mask;
              table[low] =
                (root << 24) | (curr << 16) | (next - table_index) | 0;
            }
          }
          if (huff !== 0) {
            table[next + huff] = ((len - drop) << 24) | (64 << 16) | 0;
          }
          opts.bits = root;
          return 0;
        };
      },
      { "../utils/common": 30 },
    ],
    40: [
      function (require, module, exports) {
        "use strict";
        module.exports = {
          2: "need dictionary",
          1: "stream end",
          0: "",
          "-1": "file error",
          "-2": "stream error",
          "-3": "data error",
          "-4": "insufficient memory",
          "-5": "buffer error",
          "-6": "incompatible version",
        };
      },
      {},
    ],
    41: [
      function (require, module, exports) {
        "use strict";
        var utils = require("../utils/common");
        var Z_FIXED = 4;
        var Z_BINARY = 0;
        var Z_TEXT = 1;
        var Z_UNKNOWN = 2;
        function zero(buf) {
          var len = buf.length;
          while (--len >= 0) {
            buf[len] = 0;
          }
        }
        var STORED_BLOCK = 0;
        var STATIC_TREES = 1;
        var DYN_TREES = 2;
        var MIN_MATCH = 3;
        var MAX_MATCH = 258;
        var LENGTH_CODES = 29;
        var LITERALS = 256;
        var L_CODES = LITERALS + 1 + LENGTH_CODES;
        var D_CODES = 30;
        var BL_CODES = 19;
        var HEAP_SIZE = 2 * L_CODES + 1;
        var MAX_BITS = 15;
        var Buf_size = 16;
        var MAX_BL_BITS = 7;
        var END_BLOCK = 256;
        var REP_3_6 = 16;
        var REPZ_3_10 = 17;
        var REPZ_11_138 = 18;
        var extra_lbits = [
          0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4,
          4, 5, 5, 5, 5, 0,
        ];
        var extra_dbits = [
          0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10,
          10, 11, 11, 12, 12, 13, 13,
        ];
        var extra_blbits = [
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7,
        ];
        var bl_order = [
          16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15,
        ];
        var DIST_CODE_LEN = 512;
        var static_ltree = new Array((L_CODES + 2) * 2);
        zero(static_ltree);
        var static_dtree = new Array(D_CODES * 2);
        zero(static_dtree);
        var _dist_code = new Array(DIST_CODE_LEN);
        zero(_dist_code);
        var _length_code = new Array(MAX_MATCH - MIN_MATCH + 1);
        zero(_length_code);
        var base_length = new Array(LENGTH_CODES);
        zero(base_length);
        var base_dist = new Array(D_CODES);
        zero(base_dist);
        function StaticTreeDesc(
          static_tree,
          extra_bits,
          extra_base,
          elems,
          max_length
        ) {
          this.static_tree = static_tree;
          this.extra_bits = extra_bits;
          this.extra_base = extra_base;
          this.elems = elems;
          this.max_length = max_length;
          this.has_stree = static_tree && static_tree.length;
        }
        var static_l_desc;
        var static_d_desc;
        var static_bl_desc;
        function TreeDesc(dyn_tree, stat_desc) {
          this.dyn_tree = dyn_tree;
          this.max_code = 0;
          this.stat_desc = stat_desc;
        }
        function d_code(dist) {
          return dist < 256 ? _dist_code[dist] : _dist_code[256 + (dist >>> 7)];
        }
        function put_short(s, w) {
          s.pending_buf[s.pending++] = w & 255;
          s.pending_buf[s.pending++] = (w >>> 8) & 255;
        }
        function send_bits(s, value, length) {
          if (s.bi_valid > Buf_size - length) {
            s.bi_buf |= (value << s.bi_valid) & 65535;
            put_short(s, s.bi_buf);
            s.bi_buf = value >> (Buf_size - s.bi_valid);
            s.bi_valid += length - Buf_size;
          } else {
            s.bi_buf |= (value << s.bi_valid) & 65535;
            s.bi_valid += length;
          }
        }
        function send_code(s, c, tree) {
          send_bits(s, tree[c * 2], tree[c * 2 + 1]);
        }
        function bi_reverse(code, len) {
          var res = 0;
          do {
            res |= code & 1;
            code >>>= 1;
            res <<= 1;
          } while (--len > 0);
          return res >>> 1;
        }
        function bi_flush(s) {
          if (s.bi_valid === 16) {
            put_short(s, s.bi_buf);
            s.bi_buf = 0;
            s.bi_valid = 0;
          } else if (s.bi_valid >= 8) {
            s.pending_buf[s.pending++] = s.bi_buf & 255;
            s.bi_buf >>= 8;
            s.bi_valid -= 8;
          }
        }
        function gen_bitlen(s, desc) {
          var tree = desc.dyn_tree;
          var max_code = desc.max_code;
          var stree = desc.stat_desc.static_tree;
          var has_stree = desc.stat_desc.has_stree;
          var extra = desc.stat_desc.extra_bits;
          var base = desc.stat_desc.extra_base;
          var max_length = desc.stat_desc.max_length;
          var h;
          var n, m;
          var bits;
          var xbits;
          var f;
          var overflow = 0;
          for (bits = 0; bits <= MAX_BITS; bits++) {
            s.bl_count[bits] = 0;
          }
          tree[s.heap[s.heap_max] * 2 + 1] = 0;
          for (h = s.heap_max + 1; h < HEAP_SIZE; h++) {
            n = s.heap[h];
            bits = tree[tree[n * 2 + 1] * 2 + 1] + 1;
            if (bits > max_length) {
              bits = max_length;
              overflow++;
            }
            tree[n * 2 + 1] = bits;
            if (n > max_code) {
              continue;
            }
            s.bl_count[bits]++;
            xbits = 0;
            if (n >= base) {
              xbits = extra[n - base];
            }
            f = tree[n * 2];
            s.opt_len += f * (bits + xbits);
            if (has_stree) {
              s.static_len += f * (stree[n * 2 + 1] + xbits);
            }
          }
          if (overflow === 0) {
            return;
          }
          do {
            bits = max_length - 1;
            while (s.bl_count[bits] === 0) {
              bits--;
            }
            s.bl_count[bits]--;
            s.bl_count[bits + 1] += 2;
            s.bl_count[max_length]--;
            overflow -= 2;
          } while (overflow > 0);
          for (bits = max_length; bits !== 0; bits--) {
            n = s.bl_count[bits];
            while (n !== 0) {
              m = s.heap[--h];
              if (m > max_code) {
                continue;
              }
              if (tree[m * 2 + 1] !== bits) {
                s.opt_len += (bits - tree[m * 2 + 1]) * tree[m * 2];
                tree[m * 2 + 1] = bits;
              }
              n--;
            }
          }
        }
        function gen_codes(tree, max_code, bl_count) {
          var next_code = new Array(MAX_BITS + 1);
          var code = 0;
          var bits;
          var n;
          for (bits = 1; bits <= MAX_BITS; bits++) {
            next_code[bits] = code = (code + bl_count[bits - 1]) << 1;
          }
          for (n = 0; n <= max_code; n++) {
            var len = tree[n * 2 + 1];
            if (len === 0) {
              continue;
            }
            tree[n * 2] = bi_reverse(next_code[len]++, len);
          }
        }
        function tr_static_init() {
          var n;
          var bits;
          var length;
          var code;
          var dist;
          var bl_count = new Array(MAX_BITS + 1);
          length = 0;
          for (code = 0; code < LENGTH_CODES - 1; code++) {
            base_length[code] = length;
            for (n = 0; n < 1 << extra_lbits[code]; n++) {
              _length_code[length++] = code;
            }
          }
          _length_code[length - 1] = code;
          dist = 0;
          for (code = 0; code < 16; code++) {
            base_dist[code] = dist;
            for (n = 0; n < 1 << extra_dbits[code]; n++) {
              _dist_code[dist++] = code;
            }
          }
          dist >>= 7;
          for (; code < D_CODES; code++) {
            base_dist[code] = dist << 7;
            for (n = 0; n < 1 << (extra_dbits[code] - 7); n++) {
              _dist_code[256 + dist++] = code;
            }
          }
          for (bits = 0; bits <= MAX_BITS; bits++) {
            bl_count[bits] = 0;
          }
          n = 0;
          while (n <= 143) {
            static_ltree[n * 2 + 1] = 8;
            n++;
            bl_count[8]++;
          }
          while (n <= 255) {
            static_ltree[n * 2 + 1] = 9;
            n++;
            bl_count[9]++;
          }
          while (n <= 279) {
            static_ltree[n * 2 + 1] = 7;
            n++;
            bl_count[7]++;
          }
          while (n <= 287) {
            static_ltree[n * 2 + 1] = 8;
            n++;
            bl_count[8]++;
          }
          gen_codes(static_ltree, L_CODES + 1, bl_count);
          for (n = 0; n < D_CODES; n++) {
            static_dtree[n * 2 + 1] = 5;
            static_dtree[n * 2] = bi_reverse(n, 5);
          }
          static_l_desc = new StaticTreeDesc(
            static_ltree,
            extra_lbits,
            LITERALS + 1,
            L_CODES,
            MAX_BITS
          );
          static_d_desc = new StaticTreeDesc(
            static_dtree,
            extra_dbits,
            0,
            D_CODES,
            MAX_BITS
          );
          static_bl_desc = new StaticTreeDesc(
            new Array(0),
            extra_blbits,
            0,
            BL_CODES,
            MAX_BL_BITS
          );
        }
        function init_block(s) {
          var n;
          for (n = 0; n < L_CODES; n++) {
            s.dyn_ltree[n * 2] = 0;
          }
          for (n = 0; n < D_CODES; n++) {
            s.dyn_dtree[n * 2] = 0;
          }
          for (n = 0; n < BL_CODES; n++) {
            s.bl_tree[n * 2] = 0;
          }
          s.dyn_ltree[END_BLOCK * 2] = 1;
          s.opt_len = s.static_len = 0;
          s.last_lit = s.matches = 0;
        }
        function bi_windup(s) {
          if (s.bi_valid > 8) {
            put_short(s, s.bi_buf);
          } else if (s.bi_valid > 0) {
            s.pending_buf[s.pending++] = s.bi_buf;
          }
          s.bi_buf = 0;
          s.bi_valid = 0;
        }
        function copy_block(s, buf, len, header) {
          bi_windup(s);
          if (header) {
            put_short(s, len);
            put_short(s, ~len);
          }
          utils.arraySet(s.pending_buf, s.window, buf, len, s.pending);
          s.pending += len;
        }
        function smaller(tree, n, m, depth) {
          var _n2 = n * 2;
          var _m2 = m * 2;
          return (
            tree[_n2] < tree[_m2] ||
            (tree[_n2] === tree[_m2] && depth[n] <= depth[m])
          );
        }
        function pqdownheap(s, tree, k) {
          var v = s.heap[k];
          var j = k << 1;
          while (j <= s.heap_len) {
            if (
              j < s.heap_len &&
              smaller(tree, s.heap[j + 1], s.heap[j], s.depth)
            ) {
              j++;
            }
            if (smaller(tree, v, s.heap[j], s.depth)) {
              break;
            }
            s.heap[k] = s.heap[j];
            k = j;
            j <<= 1;
          }
          s.heap[k] = v;
        }
        function compress_block(s, ltree, dtree) {
          var dist;
          var lc;
          var lx = 0;
          var code;
          var extra;
          if (s.last_lit !== 0) {
            do {
              dist =
                (s.pending_buf[s.d_buf + lx * 2] << 8) |
                s.pending_buf[s.d_buf + lx * 2 + 1];
              lc = s.pending_buf[s.l_buf + lx];
              lx++;
              if (dist === 0) {
                send_code(s, lc, ltree);
              } else {
                code = _length_code[lc];
                send_code(s, code + LITERALS + 1, ltree);
                extra = extra_lbits[code];
                if (extra !== 0) {
                  lc -= base_length[code];
                  send_bits(s, lc, extra);
                }
                dist--;
                code = d_code(dist);
                send_code(s, code, dtree);
                extra = extra_dbits[code];
                if (extra !== 0) {
                  dist -= base_dist[code];
                  send_bits(s, dist, extra);
                }
              }
            } while (lx < s.last_lit);
          }
          send_code(s, END_BLOCK, ltree);
        }
        function build_tree(s, desc) {
          var tree = desc.dyn_tree;
          var stree = desc.stat_desc.static_tree;
          var has_stree = desc.stat_desc.has_stree;
          var elems = desc.stat_desc.elems;
          var n, m;
          var max_code = -1;
          var node;
          s.heap_len = 0;
          s.heap_max = HEAP_SIZE;
          for (n = 0; n < elems; n++) {
            if (tree[n * 2] !== 0) {
              s.heap[++s.heap_len] = max_code = n;
              s.depth[n] = 0;
            } else {
              tree[n * 2 + 1] = 0;
            }
          }
          while (s.heap_len < 2) {
            node = s.heap[++s.heap_len] = max_code < 2 ? ++max_code : 0;
            tree[node * 2] = 1;
            s.depth[node] = 0;
            s.opt_len--;
            if (has_stree) {
              s.static_len -= stree[node * 2 + 1];
            }
          }
          desc.max_code = max_code;
          for (n = s.heap_len >> 1; n >= 1; n--) {
            pqdownheap(s, tree, n);
          }
          node = elems;
          do {
            n = s.heap[1];
            s.heap[1] = s.heap[s.heap_len--];
            pqdownheap(s, tree, 1);
            m = s.heap[1];
            s.heap[--s.heap_max] = n;
            s.heap[--s.heap_max] = m;
            tree[node * 2] = tree[n * 2] + tree[m * 2];
            s.depth[node] =
              (s.depth[n] >= s.depth[m] ? s.depth[n] : s.depth[m]) + 1;
            tree[n * 2 + 1] = tree[m * 2 + 1] = node;
            s.heap[1] = node++;
            pqdownheap(s, tree, 1);
          } while (s.heap_len >= 2);
          s.heap[--s.heap_max] = s.heap[1];
          gen_bitlen(s, desc);
          gen_codes(tree, max_code, s.bl_count);
        }
        function scan_tree(s, tree, max_code) {
          var n;
          var prevlen = -1;
          var curlen;
          var nextlen = tree[0 * 2 + 1];
          var count = 0;
          var max_count = 7;
          var min_count = 4;
          if (nextlen === 0) {
            max_count = 138;
            min_count = 3;
          }
          tree[(max_code + 1) * 2 + 1] = 65535;
          for (n = 0; n <= max_code; n++) {
            curlen = nextlen;
            nextlen = tree[(n + 1) * 2 + 1];
            if (++count < max_count && curlen === nextlen) {
              continue;
            } else if (count < min_count) {
              s.bl_tree[curlen * 2] += count;
            } else if (curlen !== 0) {
              if (curlen !== prevlen) {
                s.bl_tree[curlen * 2]++;
              }
              s.bl_tree[REP_3_6 * 2]++;
            } else if (count <= 10) {
              s.bl_tree[REPZ_3_10 * 2]++;
            } else {
              s.bl_tree[REPZ_11_138 * 2]++;
            }
            count = 0;
            prevlen = curlen;
            if (nextlen === 0) {
              max_count = 138;
              min_count = 3;
            } else if (curlen === nextlen) {
              max_count = 6;
              min_count = 3;
            } else {
              max_count = 7;
              min_count = 4;
            }
          }
        }
        function send_tree(s, tree, max_code) {
          var n;
          var prevlen = -1;
          var curlen;
          var nextlen = tree[0 * 2 + 1];
          var count = 0;
          var max_count = 7;
          var min_count = 4;
          if (nextlen === 0) {
            max_count = 138;
            min_count = 3;
          }
          for (n = 0; n <= max_code; n++) {
            curlen = nextlen;
            nextlen = tree[(n + 1) * 2 + 1];
            if (++count < max_count && curlen === nextlen) {
              continue;
            } else if (count < min_count) {
              do {
                send_code(s, curlen, s.bl_tree);
              } while (--count !== 0);
            } else if (curlen !== 0) {
              if (curlen !== prevlen) {
                send_code(s, curlen, s.bl_tree);
                count--;
              }
              send_code(s, REP_3_6, s.bl_tree);
              send_bits(s, count - 3, 2);
            } else if (count <= 10) {
              send_code(s, REPZ_3_10, s.bl_tree);
              send_bits(s, count - 3, 3);
            } else {
              send_code(s, REPZ_11_138, s.bl_tree);
              send_bits(s, count - 11, 7);
            }
            count = 0;
            prevlen = curlen;
            if (nextlen === 0) {
              max_count = 138;
              min_count = 3;
            } else if (curlen === nextlen) {
              max_count = 6;
              min_count = 3;
            } else {
              max_count = 7;
              min_count = 4;
            }
          }
        }
        function build_bl_tree(s) {
          var max_blindex;
          scan_tree(s, s.dyn_ltree, s.l_desc.max_code);
          scan_tree(s, s.dyn_dtree, s.d_desc.max_code);
          build_tree(s, s.bl_desc);
          for (max_blindex = BL_CODES - 1; max_blindex >= 3; max_blindex--) {
            if (s.bl_tree[bl_order[max_blindex] * 2 + 1] !== 0) {
              break;
            }
          }
          s.opt_len += 3 * (max_blindex + 1) + 5 + 5 + 4;
          return max_blindex;
        }
        function send_all_trees(s, lcodes, dcodes, blcodes) {
          var rank;
          send_bits(s, lcodes - 257, 5);
          send_bits(s, dcodes - 1, 5);
          send_bits(s, blcodes - 4, 4);
          for (rank = 0; rank < blcodes; rank++) {
            send_bits(s, s.bl_tree[bl_order[rank] * 2 + 1], 3);
          }
          send_tree(s, s.dyn_ltree, lcodes - 1);
          send_tree(s, s.dyn_dtree, dcodes - 1);
        }
        function detect_data_type(s) {
          var black_mask = 4093624447;
          var n;
          for (n = 0; n <= 31; n++, black_mask >>>= 1) {
            if (black_mask & 1 && s.dyn_ltree[n * 2] !== 0) {
              return Z_BINARY;
            }
          }
          if (
            s.dyn_ltree[9 * 2] !== 0 ||
            s.dyn_ltree[10 * 2] !== 0 ||
            s.dyn_ltree[13 * 2] !== 0
          ) {
            return Z_TEXT;
          }
          for (n = 32; n < LITERALS; n++) {
            if (s.dyn_ltree[n * 2] !== 0) {
              return Z_TEXT;
            }
          }
          return Z_BINARY;
        }
        var static_init_done = false;
        function _tr_init(s) {
          if (!static_init_done) {
            tr_static_init();
            static_init_done = true;
          }
          s.l_desc = new TreeDesc(s.dyn_ltree, static_l_desc);
          s.d_desc = new TreeDesc(s.dyn_dtree, static_d_desc);
          s.bl_desc = new TreeDesc(s.bl_tree, static_bl_desc);
          s.bi_buf = 0;
          s.bi_valid = 0;
          init_block(s);
        }
        function _tr_stored_block(s, buf, stored_len, last) {
          send_bits(s, (STORED_BLOCK << 1) + (last ? 1 : 0), 3);
          copy_block(s, buf, stored_len, true);
        }
        function _tr_align(s) {
          send_bits(s, STATIC_TREES << 1, 3);
          send_code(s, END_BLOCK, static_ltree);
          bi_flush(s);
        }
        function _tr_flush_block(s, buf, stored_len, last) {
          var opt_lenb, static_lenb;
          var max_blindex = 0;
          if (s.level > 0) {
            if (s.strm.data_type === Z_UNKNOWN) {
              s.strm.data_type = detect_data_type(s);
            }
            build_tree(s, s.l_desc);
            build_tree(s, s.d_desc);
            max_blindex = build_bl_tree(s);
            opt_lenb = (s.opt_len + 3 + 7) >>> 3;
            static_lenb = (s.static_len + 3 + 7) >>> 3;
            if (static_lenb <= opt_lenb) {
              opt_lenb = static_lenb;
            }
          } else {
            opt_lenb = static_lenb = stored_len + 5;
          }
          if (stored_len + 4 <= opt_lenb && buf !== -1) {
            _tr_stored_block(s, buf, stored_len, last);
          } else if (s.strategy === Z_FIXED || static_lenb === opt_lenb) {
            send_bits(s, (STATIC_TREES << 1) + (last ? 1 : 0), 3);
            compress_block(s, static_ltree, static_dtree);
          } else {
            send_bits(s, (DYN_TREES << 1) + (last ? 1 : 0), 3);
            send_all_trees(
              s,
              s.l_desc.max_code + 1,
              s.d_desc.max_code + 1,
              max_blindex + 1
            );
            compress_block(s, s.dyn_ltree, s.dyn_dtree);
          }
          init_block(s);
          if (last) {
            bi_windup(s);
          }
        }
        function _tr_tally(s, dist, lc) {
          s.pending_buf[s.d_buf + s.last_lit * 2] = (dist >>> 8) & 255;
          s.pending_buf[s.d_buf + s.last_lit * 2 + 1] = dist & 255;
          s.pending_buf[s.l_buf + s.last_lit] = lc & 255;
          s.last_lit++;
          if (dist === 0) {
            s.dyn_ltree[lc * 2]++;
          } else {
            s.matches++;
            dist--;
            s.dyn_ltree[(_length_code[lc] + LITERALS + 1) * 2]++;
            s.dyn_dtree[d_code(dist) * 2]++;
          }
          return s.last_lit === s.lit_bufsize - 1;
        }
        exports._tr_init = _tr_init;
        exports._tr_stored_block = _tr_stored_block;
        exports._tr_flush_block = _tr_flush_block;
        exports._tr_tally = _tr_tally;
        exports._tr_align = _tr_align;
      },
      { "../utils/common": 30 },
    ],
    42: [
      function (require, module, exports) {
        "use strict";
        function ZStream() {
          this.input = null;
          this.next_in = 0;
          this.avail_in = 0;
          this.total_in = 0;
          this.output = null;
          this.next_out = 0;
          this.avail_out = 0;
          this.total_out = 0;
          this.msg = "";
          this.state = null;
          this.data_type = 2;
          this.adler = 0;
        }
        module.exports = ZStream;
      },
      {},
    ],
    43: [
      function (require, module, exports) {
        "use strict";
        var JSZip = require("jszip");
        var jsZip = new JSZip();
        self.addEventListener("message", function (e) {
          var data = e.data;
          if (data.cmd === "file") {
            var handle = jsZip;
            data.folders.forEach(function (folder) {
              handle = handle.folder(folder);
            });
            handle.file(data.name, data.data, data.opts);
          } else if (data.cmd === "generate") {
            var zipFile = jsZip.generate(data.opts);
            if (data.opts.type === "uint8array") {
              self.postMessage({ zipFile: zipFile }, [zipFile.buffer]);
            } else {
              self.postMessage({ zipFile: zipFile });
            }
          }
        });
      },
      { jszip: 12 },
    ],
  },
  {},
  [43]
);
