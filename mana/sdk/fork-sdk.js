// \0rolldown/runtime.js
var e = Object.create, t = Object.defineProperty, n = Object.getOwnPropertyDescriptor, r = Object.getOwnPropertyNames, i = Object.getPrototypeOf, a = Object.prototype.hasOwnProperty, o = (e, t) => () => (t || (e((t = { exports: {} }).exports, t, t.exports), e = null), t.exports), s = (e, i, o, s) => {
	if (i && typeof i == "object" || typeof i == "function") for (var c = r(i), l = 0, u = c.length, d; l < u; l++) d = c[l], !a.call(e, d) && d !== o && t(e, d, {
		get: ((e) => i[e]).bind(null, d),
		enumerable: !(s = n(i, d)) || s.enumerable
	});
	return e;
}, c = (n, r, o) => (o = n == null ? {} : e(i(n)), s(r || !n || !n.__esModule || !a.call(n, "default") ? t(o, "default", {
	value: n,
	enumerable: !0
}) : o, n)), l = /* @__PURE__ */ o(((e) => {
	e.fromByteArray = c;
	for (var t = [], n = [], r = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", i = 0, a = r.length; i < a; ++i) t[i] = r[i], n[r.charCodeAt(i)] = i;
	n[45] = 62, n[95] = 63;
	function o(e) {
		return t[e >> 18 & 63] + t[e >> 12 & 63] + t[e >> 6 & 63] + t[e & 63];
	}
	function s(e, t, n) {
		for (var r, i = [], a = t; a < n; a += 3) r = (e[a] << 16 & 16711680) + (e[a + 1] << 8 & 65280) + (e[a + 2] & 255), i.push(o(r));
		return i.join("");
	}
	function c(e) {
		for (var n, r = e.length, i = r % 3, a = [], o = 16383, c = 0, l = r - i; c < l; c += o) a.push(s(e, c, c + o > l ? l : c + o));
		return i === 1 ? (n = e[r - 1], a.push(t[n >> 2] + t[n << 4 & 63] + "==")) : i === 2 && (n = (e[r - 2] << 8) + e[r - 1], a.push(t[n >> 10] + t[n >> 4 & 63] + t[n << 2 & 63] + "=")), a.join("");
	}
})), u = /* @__PURE__ */ o(((e, t) => {
	var { hasOwnProperty: n } = Object.prototype, r = _();
	r.configure = _, r.stringify = r, r.default = r, e.stringify = r, e.configure = _, t.exports = r;
	var i = /[\u0000-\u001f\u0022\u005c\ud800-\udfff]/;
	function a(e) {
		return e.length < 5e3 && !i.test(e) ? `"${e}"` : JSON.stringify(e);
	}
	function o(e, t) {
		if (e.length > 200 || t) return e.sort(t);
		for (let t = 1; t < e.length; t++) {
			let n = e[t], r = t;
			for (; r !== 0 && e[r - 1] > n;) e[r] = e[r - 1], r--;
			e[r] = n;
		}
		return e;
	}
	var s = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(Object.getPrototypeOf(/* @__PURE__ */ new Int8Array())), Symbol.toStringTag).get;
	function c(e) {
		return s.call(e) !== void 0 && e.length !== 0;
	}
	function l(e, t, n) {
		e.length < n && (n = e.length);
		let r = t === "," ? "" : " ", i = `"0":${r}${e[0]}`;
		for (let a = 1; a < n; a++) i += `${t}"${a}":${r}${e[a]}`;
		return i;
	}
	function u(e) {
		if (n.call(e, "circularValue")) {
			let t = e.circularValue;
			if (typeof t == "string") return `"${t}"`;
			if (t == null) return t;
			if (t === Error || t === TypeError) return { toString() {
				throw TypeError("Converting circular structure to JSON");
			} };
			throw TypeError("The \"circularValue\" argument must be of type string or the value null or undefined");
		}
		return "\"[Circular]\"";
	}
	function d(e) {
		let t;
		if (n.call(e, "deterministic") && (t = e.deterministic, typeof t != "boolean" && typeof t != "function")) throw TypeError("The \"deterministic\" argument must be of type boolean or comparator function");
		return t === void 0 || t;
	}
	function f(e, t) {
		let r;
		if (n.call(e, t) && (r = e[t], typeof r != "boolean")) throw TypeError(`The "${t}" argument must be of type boolean`);
		return r === void 0 || r;
	}
	function p(e, t) {
		let r;
		if (n.call(e, t)) {
			if (r = e[t], typeof r != "number") throw TypeError(`The "${t}" argument must be of type number`);
			if (!Number.isInteger(r)) throw TypeError(`The "${t}" argument must be an integer`);
			if (r < 1) throw RangeError(`The "${t}" argument must be >= 1`);
		}
		return r === void 0 ? Infinity : r;
	}
	function m(e) {
		return e === 1 ? "1 item" : `${e} items`;
	}
	function h(e) {
		let t = /* @__PURE__ */ new Set();
		for (let n of e) (typeof n == "string" || typeof n == "number") && t.add(String(n));
		return t;
	}
	function g(e) {
		if (n.call(e, "strict")) {
			let t = e.strict;
			if (typeof t != "boolean") throw TypeError("The \"strict\" argument must be of type boolean");
			if (t) return (e) => {
				let t = `Object can not safely be stringified. Received type ${typeof e}`;
				throw typeof e != "function" && (t += ` (${e.toString()})`), Error(t);
			};
		}
	}
	function _(e) {
		e = { ...e };
		let t = g(e);
		t && (e.bigint === void 0 && (e.bigint = !1), "circularValue" in e || (e.circularValue = Error));
		let n = u(e), r = f(e, "bigint"), i = d(e), s = typeof i == "function" ? i : void 0, _ = p(e, "maximumDepth"), v = p(e, "maximumBreadth");
		function y(e, l, u, d, f, p) {
			let h = l[e];
			switch (typeof h == "object" && h && typeof h.toJSON == "function" && (h = h.toJSON(e)), h = d.call(l, e, h), typeof h) {
				case "string": return a(h);
				case "object": {
					if (h === null) return "null";
					if (u.indexOf(h) !== -1) return n;
					let e = "", t = ",", r = p;
					if (Array.isArray(h)) {
						if (h.length === 0) return "[]";
						if (_ < u.length + 1) return "\"[Array]\"";
						u.push(h), f !== "" && (p += f, e += `\n${p}`, t = `,\n${p}`);
						let n = Math.min(h.length, v), i = 0;
						for (; i < n - 1; i++) {
							let n = y(String(i), h, u, d, f, p);
							e += n === void 0 ? "null" : n, e += t;
						}
						let a = y(String(i), h, u, d, f, p);
						if (e += a === void 0 ? "null" : a, h.length - 1 > v) {
							let n = h.length - v - 1;
							e += `${t}"... ${m(n)} not stringified"`;
						}
						return f !== "" && (e += `\n${r}`), u.pop(), `[${e}]`;
					}
					let l = Object.keys(h), g = l.length;
					if (g === 0) return "{}";
					if (_ < u.length + 1) return "\"[Object]\"";
					let b = "", x = "";
					f !== "" && (p += f, t = `,\n${p}`, b = " ");
					let S = Math.min(g, v);
					i && !c(h) && (l = o(l, s)), u.push(h);
					for (let n = 0; n < S; n++) {
						let r = l[n], i = y(r, h, u, d, f, p);
						i !== void 0 && (e += `${x}${a(r)}:${b}${i}`, x = t);
					}
					if (g > v) {
						let n = g - v;
						e += `${x}"...":${b}"${m(n)} not stringified"`, x = t;
					}
					return f !== "" && x.length > 1 && (e = `\n${p}${e}\n${r}`), u.pop(), `{${e}}`;
				}
				case "number": return isFinite(h) ? String(h) : t ? t(h) : "null";
				case "boolean": return h === !0 ? "true" : "false";
				case "undefined": return;
				case "bigint": if (r) return String(h);
				default: return t ? t(h) : void 0;
			}
		}
		function b(e, i, o, s, c, l) {
			switch (typeof i == "object" && i && typeof i.toJSON == "function" && (i = i.toJSON(e)), typeof i) {
				case "string": return a(i);
				case "object": {
					if (i === null) return "null";
					if (o.indexOf(i) !== -1) return n;
					let e = l, t = "", r = ",";
					if (Array.isArray(i)) {
						if (i.length === 0) return "[]";
						if (_ < o.length + 1) return "\"[Array]\"";
						o.push(i), c !== "" && (l += c, t += `\n${l}`, r = `,\n${l}`);
						let n = Math.min(i.length, v), a = 0;
						for (; a < n - 1; a++) {
							let e = b(String(a), i[a], o, s, c, l);
							t += e === void 0 ? "null" : e, t += r;
						}
						let u = b(String(a), i[a], o, s, c, l);
						if (t += u === void 0 ? "null" : u, i.length - 1 > v) {
							let e = i.length - v - 1;
							t += `${r}"... ${m(e)} not stringified"`;
						}
						return c !== "" && (t += `\n${e}`), o.pop(), `[${t}]`;
					}
					o.push(i);
					let u = "";
					c !== "" && (l += c, r = `,\n${l}`, u = " ");
					let d = "";
					for (let e of s) {
						let n = b(e, i[e], o, s, c, l);
						n !== void 0 && (t += `${d}${a(e)}:${u}${n}`, d = r);
					}
					return c !== "" && d.length > 1 && (t = `\n${l}${t}\n${e}`), o.pop(), `{${t}}`;
				}
				case "number": return isFinite(i) ? String(i) : t ? t(i) : "null";
				case "boolean": return i === !0 ? "true" : "false";
				case "undefined": return;
				case "bigint": if (r) return String(i);
				default: return t ? t(i) : void 0;
			}
		}
		function x(e, u, d, f, p) {
			switch (typeof u) {
				case "string": return a(u);
				case "object": {
					if (u === null) return "null";
					if (typeof u.toJSON == "function") {
						if (u = u.toJSON(e), typeof u != "object") return x(e, u, d, f, p);
						if (u === null) return "null";
					}
					if (d.indexOf(u) !== -1) return n;
					let t = p;
					if (Array.isArray(u)) {
						if (u.length === 0) return "[]";
						if (_ < d.length + 1) return "\"[Array]\"";
						d.push(u), p += f;
						let e = `\n${p}`, n = `,\n${p}`, r = Math.min(u.length, v), i = 0;
						for (; i < r - 1; i++) {
							let t = x(String(i), u[i], d, f, p);
							e += t === void 0 ? "null" : t, e += n;
						}
						let a = x(String(i), u[i], d, f, p);
						if (e += a === void 0 ? "null" : a, u.length - 1 > v) {
							let t = u.length - v - 1;
							e += `${n}"... ${m(t)} not stringified"`;
						}
						return e += `\n${t}`, d.pop(), `[${e}]`;
					}
					let r = Object.keys(u), h = r.length;
					if (h === 0) return "{}";
					if (_ < d.length + 1) return "\"[Object]\"";
					p += f;
					let g = `,\n${p}`, y = "", b = "", S = Math.min(h, v);
					c(u) && (y += l(u, g, v), r = r.slice(u.length), S -= u.length, b = g), i && (r = o(r, s)), d.push(u);
					for (let e = 0; e < S; e++) {
						let t = r[e], n = x(t, u[t], d, f, p);
						n !== void 0 && (y += `${b}${a(t)}: ${n}`, b = g);
					}
					if (h > v) {
						let e = h - v;
						y += `${b}"...": "${m(e)} not stringified"`, b = g;
					}
					return b !== "" && (y = `\n${p}${y}\n${t}`), d.pop(), `{${y}}`;
				}
				case "number": return isFinite(u) ? String(u) : t ? t(u) : "null";
				case "boolean": return u === !0 ? "true" : "false";
				case "undefined": return;
				case "bigint": if (r) return String(u);
				default: return t ? t(u) : void 0;
			}
		}
		function S(e, u, d) {
			switch (typeof u) {
				case "string": return a(u);
				case "object": {
					if (u === null) return "null";
					if (typeof u.toJSON == "function") {
						if (u = u.toJSON(e), typeof u != "object") return S(e, u, d);
						if (u === null) return "null";
					}
					if (d.indexOf(u) !== -1) return n;
					let t = "", r = u.length !== void 0;
					if (r && Array.isArray(u)) {
						if (u.length === 0) return "[]";
						if (_ < d.length + 1) return "\"[Array]\"";
						d.push(u);
						let e = Math.min(u.length, v), n = 0;
						for (; n < e - 1; n++) {
							let e = S(String(n), u[n], d);
							t += e === void 0 ? "null" : e, t += ",";
						}
						let r = S(String(n), u[n], d);
						if (t += r === void 0 ? "null" : r, u.length - 1 > v) {
							let e = u.length - v - 1;
							t += `,"... ${m(e)} not stringified"`;
						}
						return d.pop(), `[${t}]`;
					}
					let f = Object.keys(u), p = f.length;
					if (p === 0) return "{}";
					if (_ < d.length + 1) return "\"[Object]\"";
					let h = "", g = Math.min(p, v);
					r && c(u) && (t += l(u, ",", v), f = f.slice(u.length), g -= u.length, h = ","), i && (f = o(f, s)), d.push(u);
					for (let e = 0; e < g; e++) {
						let n = f[e], r = S(n, u[n], d);
						r !== void 0 && (t += `${h}${a(n)}:${r}`, h = ",");
					}
					if (p > v) {
						let e = p - v;
						t += `${h}"...":"${m(e)} not stringified"`;
					}
					return d.pop(), `{${t}}`;
				}
				case "number": return isFinite(u) ? String(u) : t ? t(u) : "null";
				case "boolean": return u === !0 ? "true" : "false";
				case "undefined": return;
				case "bigint": if (r) return String(u);
				default: return t ? t(u) : void 0;
			}
		}
		function C(e, t, n) {
			if (arguments.length > 1) {
				let r = "";
				if (typeof n == "number" ? r = " ".repeat(Math.min(n, 10)) : typeof n == "string" && (r = n.slice(0, 10)), t != null) {
					if (typeof t == "function") return y("", { "": e }, [], t, r, "");
					if (Array.isArray(t)) return b("", e, [], h(t), r, "");
				}
				if (r.length !== 0) return x("", e, [], r, "");
			}
			return S("", e, []);
		}
		return C;
	}
})), d = l(), f = /* @__PURE__ */ c(u());
f.configure;
var p = f.default, m = new TextDecoder("utf-8"), h = class {
	view;
	offset = 0;
	constructor(e) {
		this.view = e instanceof DataView ? e : new DataView(e.buffer, e.byteOffset, e.byteLength), this.offset = 0;
	}
	reset(e) {
		this.view = e instanceof DataView ? e : new DataView(e.buffer, e.byteOffset, e.byteLength), this.offset = 0;
	}
	get remaining() {
		return this.view.byteLength - this.offset;
	}
	#e(e) {
		if (this.offset + e > this.view.byteLength) throw RangeError(`Tried to read ${e} byte(s) at relative offset ${this.offset}, but only ${this.remaining} byte(s) remain`);
	}
	readUInt8Array() {
		let e = this.readU32();
		return this.#e(e), this.readBytes(e).slice();
	}
	readBool() {
		let e = this.view.getUint8(this.offset);
		return this.offset += 1, e !== 0;
	}
	readByte() {
		let e = this.view.getUint8(this.offset);
		return this.offset += 1, e;
	}
	readBytes(e) {
		let t = new Uint8Array(this.view.buffer, this.view.byteOffset + this.offset, e);
		return this.offset += e, t;
	}
	readI8() {
		let e = this.view.getInt8(this.offset);
		return this.offset += 1, e;
	}
	readU8() {
		return this.readByte();
	}
	readI16() {
		let e = this.view.getInt16(this.offset, !0);
		return this.offset += 2, e;
	}
	readU16() {
		let e = this.view.getUint16(this.offset, !0);
		return this.offset += 2, e;
	}
	readI32() {
		let e = this.view.getInt32(this.offset, !0);
		return this.offset += 4, e;
	}
	readU32() {
		let e = this.view.getUint32(this.offset, !0);
		return this.offset += 4, e;
	}
	readI64() {
		let e = this.view.getBigInt64(this.offset, !0);
		return this.offset += 8, e;
	}
	readU64() {
		let e = this.view.getBigUint64(this.offset, !0);
		return this.offset += 8, e;
	}
	readU128() {
		let e = this.view.getBigUint64(this.offset, !0), t = this.view.getBigUint64(this.offset + 8, !0);
		return this.offset += 16, (t << BigInt(64)) + e;
	}
	readI128() {
		let e = this.view.getBigUint64(this.offset, !0), t = this.view.getBigInt64(this.offset + 8, !0);
		return this.offset += 16, (t << BigInt(64)) + e;
	}
	readU256() {
		let e = this.view.getBigUint64(this.offset, !0), t = this.view.getBigUint64(this.offset + 8, !0), n = this.view.getBigUint64(this.offset + 16, !0), r = this.view.getBigUint64(this.offset + 24, !0);
		return this.offset += 32, (r << BigInt(192)) + (n << BigInt(128)) + (t << BigInt(64)) + e;
	}
	readI256() {
		let e = this.view.getBigUint64(this.offset, !0), t = this.view.getBigUint64(this.offset + 8, !0), n = this.view.getBigUint64(this.offset + 16, !0), r = this.view.getBigInt64(this.offset + 24, !0);
		return this.offset += 32, (r << BigInt(192)) + (n << BigInt(128)) + (t << BigInt(64)) + e;
	}
	readF32() {
		let e = this.view.getFloat32(this.offset, !0);
		return this.offset += 4, e;
	}
	readF64() {
		let e = this.view.getFloat64(this.offset, !0);
		return this.offset += 8, e;
	}
	readString() {
		let e = this.readU32();
		this.#e(e);
		let t = this.readBytes(e);
		return m.decode(t);
	}
}, g = new TextEncoder(), _ = ArrayBuffer.prototype.transfer ?? function(e) {
	if (e === void 0) return this.slice();
	if (e <= this.byteLength) return this.slice(0, e);
	{
		let t = new Uint8Array(e);
		return t.set(new Uint8Array(this)), t.buffer;
	}
}, v = class {
	buffer;
	view;
	constructor(e) {
		this.buffer = typeof e == "number" ? new ArrayBuffer(e) : e, this.view = new DataView(this.buffer);
	}
	get capacity() {
		return this.buffer.byteLength;
	}
	grow(e) {
		e <= this.buffer.byteLength || (this.buffer = _.call(this.buffer, e), this.view = new DataView(this.buffer));
	}
}, y = class {
	buffer;
	offset = 0;
	constructor(e) {
		this.buffer = typeof e == "number" ? new v(e) : e;
	}
	clear() {
		this.offset = 0;
	}
	reset(e) {
		this.buffer = e, this.offset = 0;
	}
	expandBuffer(e) {
		let t = this.offset + e + 1;
		if (t <= this.buffer.capacity) return;
		let n = this.buffer.capacity * 2;
		n < t && (n = t), this.buffer.grow(n);
	}
	toBase64() {
		return (0, d.fromByteArray)(this.getBuffer());
	}
	getBuffer() {
		return new Uint8Array(this.buffer.buffer, 0, this.offset);
	}
	get view() {
		return this.buffer.view;
	}
	writeUInt8Array(e) {
		let t = e.length;
		this.expandBuffer(4 + t), this.writeU32(t), new Uint8Array(this.buffer.buffer, this.offset).set(e), this.offset += t;
	}
	writeBool(e) {
		this.expandBuffer(1), this.view.setUint8(this.offset, +!!e), this.offset += 1;
	}
	writeByte(e) {
		this.expandBuffer(1), this.view.setUint8(this.offset, e), this.offset += 1;
	}
	writeBytes(e) {
		this.expandBuffer(e.length), new Uint8Array(this.buffer.buffer, this.offset, e.length).set(e), this.offset += e.length;
	}
	writeI8(e) {
		this.expandBuffer(1), this.view.setInt8(this.offset, e), this.offset += 1;
	}
	writeU8(e) {
		this.expandBuffer(1), this.view.setUint8(this.offset, e), this.offset += 1;
	}
	writeI16(e) {
		this.expandBuffer(2), this.view.setInt16(this.offset, e, !0), this.offset += 2;
	}
	writeU16(e) {
		this.expandBuffer(2), this.view.setUint16(this.offset, e, !0), this.offset += 2;
	}
	writeI32(e) {
		this.expandBuffer(4), this.view.setInt32(this.offset, e, !0), this.offset += 4;
	}
	writeU32(e) {
		this.expandBuffer(4), this.view.setUint32(this.offset, e, !0), this.offset += 4;
	}
	writeI64(e) {
		this.expandBuffer(8), this.view.setBigInt64(this.offset, e, !0), this.offset += 8;
	}
	writeU64(e) {
		this.expandBuffer(8), this.view.setBigUint64(this.offset, e, !0), this.offset += 8;
	}
	writeU128(e) {
		this.expandBuffer(16);
		let t = e & BigInt("0xFFFFFFFFFFFFFFFF"), n = e >> BigInt(64);
		this.view.setBigUint64(this.offset, t, !0), this.view.setBigUint64(this.offset + 8, n, !0), this.offset += 16;
	}
	writeI128(e) {
		this.expandBuffer(16);
		let t = e & BigInt("0xFFFFFFFFFFFFFFFF"), n = e >> BigInt(64);
		this.view.setBigInt64(this.offset, t, !0), this.view.setBigInt64(this.offset + 8, n, !0), this.offset += 16;
	}
	writeU256(e) {
		this.expandBuffer(32);
		let t = BigInt("0xFFFFFFFFFFFFFFFF"), n = e & t, r = e >> BigInt(64) & t, i = e >> BigInt(128) & t, a = e >> BigInt(192);
		this.view.setBigUint64(this.offset + 0, n, !0), this.view.setBigUint64(this.offset + 8, r, !0), this.view.setBigUint64(this.offset + 16, i, !0), this.view.setBigUint64(this.offset + 24, a, !0), this.offset += 32;
	}
	writeI256(e) {
		this.expandBuffer(32);
		let t = BigInt("0xFFFFFFFFFFFFFFFF"), n = e & t, r = e >> BigInt(64) & t, i = e >> BigInt(128) & t, a = e >> BigInt(192);
		this.view.setBigUint64(this.offset + 0, n, !0), this.view.setBigUint64(this.offset + 8, r, !0), this.view.setBigUint64(this.offset + 16, i, !0), this.view.setBigInt64(this.offset + 24, a, !0), this.offset += 32;
	}
	writeF32(e) {
		this.expandBuffer(4), this.view.setFloat32(this.offset, e, !0), this.offset += 4;
	}
	writeF64(e) {
		this.expandBuffer(8), this.view.setFloat64(this.offset, e, !0), this.offset += 8;
	}
	writeString(e) {
		let t = e.length;
		this.expandBuffer(4 + t);
		let n = new Uint8Array(this.buffer.buffer), r = this.offset + 4, i = 0;
		for (; i < t; i++) {
			let t = e.charCodeAt(i);
			if (t >= 128) break;
			n[r++] = t;
		}
		i === t ? (this.view.setUint32(this.offset, t, !0), this.offset = r) : this.writeUInt8Array(g.encode(e));
	}
};
function b(e, t) {
	if (e === t) return !0;
	if (typeof e != "object" || !e || typeof t != "object" || !t) return !1;
	let n = 0;
	if (e instanceof Uint8Array && t instanceof Uint8Array) {
		if (e.length !== t.length) return !1;
		for (let n = 0; n < e.length; n++) if (e[n] !== t[n]) return !1;
		n = e.length;
	}
	let r = Object.keys(e), i = Object.keys(t);
	if (r.length !== i.length) return !1;
	let a = e, o = t;
	for (let e = n; e < r.length; e++) {
		let n = r[e];
		if (!Object.prototype.propertyIsEnumerable.call(t, n) || !b(a[n], o[n])) return !1;
	}
	return !0;
}
function x(e) {
	return Array.prototype.map.call(e.reverse(), (e) => ("00" + e.toString(16)).slice(-2)).join("");
}
function S(e) {
	if (e.length != 16) throw Error(`Uint8Array is not 16 bytes long: ${e}`);
	return new h(e).readU128();
}
function C(e) {
	if (e.length != 32) throw Error(`Uint8Array is not 32 bytes long: [${e}]`);
	return new h(e).readU256();
}
function w(e) {
	e.startsWith("0x") && (e = e.slice(2));
	let t = e.match(/.{1,2}/g) || [];
	return Uint8Array.from(t.map((e) => parseInt(e, 16))).reverse();
}
function T(e) {
	return S(w(e));
}
function E(e) {
	return C(w(e));
}
function D(e) {
	let t = new y(16);
	return t.writeU128(e), t.getBuffer();
}
function O(e) {
	return x(D(e));
}
function k(e) {
	let t = new y(32);
	return t.writeU256(e), t.getBuffer();
}
function A(e) {
	return x(k(e));
}
function j(e, t) {
	if (typeof e == "bigint") return e;
	if (typeof e == "number" || typeof e == "string" && e.trim() !== "") return BigInt(e);
	throw TypeError(`Cannot convert ${typeof e} to ${t}: expected bigint, integer number, or decimal string`);
}
function ee(e) {
	let t = M(e);
	return t.charAt(0).toUpperCase() + t.slice(1);
}
function M(e) {
	let t = e.replace(/[-_]+/g, "_").replace(/_([a-zA-Z0-9])/g, (e, t) => t.toUpperCase());
	return t.charAt(0).toLowerCase() + t.slice(1);
}
function te(e) {
	return Object.fromEntries(Object.entries(e).map(([e, t]) => [e, "typeBuilder" in t ? t.typeBuilder : t]));
}
var ne = Object.hasOwn, N = class e {
	__time_duration_micros__;
	static MICROS_PER_MILLIS = 1000n;
	static getAlgebraicType() {
		return F.Product({ elements: [{
			name: "__time_duration_micros__",
			algebraicType: F.I64
		}] });
	}
	static isTimeDuration(e) {
		if (e.tag !== "Product") return !1;
		let t = e.value.elements;
		if (t.length !== 1) return !1;
		let n = t[0];
		return n.name === "__time_duration_micros__" && n.algebraicType.tag === "I64";
	}
	get micros() {
		return this.__time_duration_micros__;
	}
	get millis() {
		return Number(this.micros / e.MICROS_PER_MILLIS);
	}
	constructor(e) {
		this.__time_duration_micros__ = j(e, "TimeDuration");
	}
	static fromMillis(t) {
		return new e(BigInt(t) * e.MICROS_PER_MILLIS);
	}
	toString() {
		let e = this.micros, t = e < 0 ? "-" : "+", n = e < 0 ? -e : e, r = n / 1000000n, i = n % 1000000n;
		return `${t}${r}.${String(i).padStart(6, "0")}`;
	}
}, re = class e {
	__timestamp_micros_since_unix_epoch__;
	static MICROS_PER_MILLIS = 1000n;
	get microsSinceUnixEpoch() {
		return this.__timestamp_micros_since_unix_epoch__;
	}
	constructor(e) {
		this.__timestamp_micros_since_unix_epoch__ = j(e, "Timestamp");
	}
	static getAlgebraicType() {
		return F.Product({ elements: [{
			name: "__timestamp_micros_since_unix_epoch__",
			algebraicType: F.I64
		}] });
	}
	static isTimestamp(e) {
		if (e.tag !== "Product") return !1;
		let t = e.value.elements;
		if (t.length !== 1) return !1;
		let n = t[0];
		return n.name === "__timestamp_micros_since_unix_epoch__" && n.algebraicType.tag === "I64";
	}
	static UNIX_EPOCH = new e(0n);
	static now() {
		return e.fromDate(/* @__PURE__ */ new Date());
	}
	toMillis() {
		return this.microsSinceUnixEpoch / 1000n;
	}
	static fromDate(t) {
		let n = t.getTime(), r = BigInt(n) * e.MICROS_PER_MILLIS;
		return new e(r);
	}
	toDate() {
		let t = this.__timestamp_micros_since_unix_epoch__ / e.MICROS_PER_MILLIS;
		if (t > BigInt(2 ** 53 - 1) || t < BigInt(-(2 ** 53 - 1))) throw RangeError("Timestamp is outside of the representable range of JS's Date");
		return new Date(Number(t));
	}
	toISOString() {
		let t = this.__timestamp_micros_since_unix_epoch__, n = t / e.MICROS_PER_MILLIS;
		if (n > BigInt(2 ** 53 - 1) || n < BigInt(-(2 ** 53 - 1))) throw RangeError("Timestamp is outside of the representable range for ISO string formatting");
		let r = new Date(Number(n)).toISOString(), i = Math.abs(Number(t % 1000000n)), a = String(i).padStart(6, "0");
		return r.replace(/\.\d{3}Z$/, `.${a}Z`);
	}
	since(e) {
		return new N(this.__timestamp_micros_since_unix_epoch__ - e.__timestamp_micros_since_unix_epoch__);
	}
}, ie = class e {
	__uuid__;
	static NIL = new e(0n);
	static MAX_UUID_BIGINT = 340282366920938463463374607431768211455n;
	static MAX = new e(e.MAX_UUID_BIGINT);
	constructor(t) {
		let n = j(t, "Uuid");
		if (n < 0n || n > e.MAX_UUID_BIGINT) throw Error("Invalid UUID: must be between 0 and `MAX_UUID_BIGINT`");
		this.__uuid__ = n;
	}
	static fromRandomBytesV4(t) {
		if (t.length !== 16) throw Error("UUID v4 requires 16 bytes");
		let n = new Uint8Array(t);
		return n[6] = n[6] & 15 | 64, n[8] = n[8] & 63 | 128, new e(e.bytesToBigInt(n));
	}
	static fromCounterV7(t, n, r) {
		if (r.length !== 4) throw Error("`fromCounterV7` requires `randomBytes.length == 4`");
		if (t.value < 0) throw Error("`fromCounterV7` uuid `counter` must be non-negative");
		if (n.__timestamp_micros_since_unix_epoch__ < 0) throw Error("`fromCounterV7` `timestamp` before unix epoch");
		let i = t.value;
		t.value = i + 1 & 2147483647;
		let a = n.toMillis() & 281474976710655n, o = /* @__PURE__ */ new Uint8Array(16);
		return o[0] = Number(a >> 40n & 255n), o[1] = Number(a >> 32n & 255n), o[2] = Number(a >> 24n & 255n), o[3] = Number(a >> 16n & 255n), o[4] = Number(a >> 8n & 255n), o[5] = Number(a & 255n), o[7] = i >>> 23 & 255, o[9] = i >>> 15 & 255, o[10] = i >>> 7 & 255, o[11] = (i & 127) << 1 & 255, o[12] |= r[0] & 127, o[13] = r[1], o[14] = r[2], o[15] = r[3], o[6] = o[6] & 15 | 112, o[8] = o[8] & 63 | 128, new e(e.bytesToBigInt(o));
	}
	static parse(t) {
		let n = t.replace(/-/g, "");
		if (n.length !== 32) throw Error("Invalid hex UUID");
		let r = 0n;
		for (let e = 0; e < 32; e += 2) r = r << 8n | BigInt(parseInt(n.slice(e, e + 2), 16));
		return new e(r);
	}
	toHexString() {
		return O(this.asBigInt());
	}
	toString() {
		let e = this.toHexString();
		return e.slice(0, 8) + "-" + e.slice(8, 12) + "-" + e.slice(12, 16) + "-" + e.slice(16, 20) + "-" + e.slice(20);
	}
	asBigInt() {
		return this.__uuid__;
	}
	toBytes() {
		return e.bigIntToBytes(this.__uuid__);
	}
	static bytesToBigInt(e) {
		let t = 0n;
		for (let n of e) t = t << 8n | BigInt(n);
		return t;
	}
	static bigIntToBytes(e) {
		let t = /* @__PURE__ */ new Uint8Array(16);
		for (let n = 15; n >= 0; n--) t[n] = Number(e & 255n), e >>= 8n;
		return t;
	}
	getVersion() {
		let t = this.toBytes()[6] >> 4 & 15;
		switch (t) {
			case 4: return "V4";
			case 7: return "V7";
			default:
				if (this == e.NIL) return "Nil";
				if (this == e.MAX) return "Max";
				throw Error(`Unsupported UUID version: ${t}`);
		}
	}
	getCounter() {
		let e = this.toBytes(), t = e[7], n = e[9], r = e[10], i = e[11] >>> 1;
		return t << 23 | n << 15 | r << 7 | i;
	}
	compareTo(e) {
		return this.__uuid__ < e.__uuid__ ? -1 : +(this.__uuid__ > e.__uuid__);
	}
	static getAlgebraicType() {
		return F.Product({ elements: [{
			name: "__uuid__",
			algebraicType: F.U128
		}] });
	}
}, ae = class e {
	__identity__;
	constructor(e) {
		this.__identity__ = typeof e == "string" ? E(e) : j(e, "Identity");
	}
	static getAlgebraicType() {
		return F.Product({ elements: [{
			name: "__identity__",
			algebraicType: F.U256
		}] });
	}
	isEqual(e) {
		return this.toHexString() === e.toHexString();
	}
	equals(e) {
		return this.isEqual(e);
	}
	toHexString() {
		return A(this.__identity__);
	}
	toUint8Array() {
		return k(this.__identity__);
	}
	static fromString(t) {
		return new e(t);
	}
	static zero() {
		return new e(0n);
	}
	toString() {
		return this.toHexString();
	}
}, oe = /* @__PURE__ */ new Map(), P = /* @__PURE__ */ new Map(), F = {
	Ref: (e) => ({
		tag: "Ref",
		value: e
	}),
	Sum: (e) => ({
		tag: "Sum",
		value: e
	}),
	Product: (e) => ({
		tag: "Product",
		value: e
	}),
	Array: (e) => ({
		tag: "Array",
		value: e
	}),
	String: { tag: "String" },
	Bool: { tag: "Bool" },
	I8: { tag: "I8" },
	U8: { tag: "U8" },
	I16: { tag: "I16" },
	U16: { tag: "U16" },
	I32: { tag: "I32" },
	U32: { tag: "U32" },
	I64: { tag: "I64" },
	U64: { tag: "U64" },
	I128: { tag: "I128" },
	U128: { tag: "U128" },
	I256: { tag: "I256" },
	U256: { tag: "U256" },
	F32: { tag: "F32" },
	F64: { tag: "F64" },
	makeSerializer(e, t) {
		if (e.tag === "Ref") {
			if (!t) throw Error("cannot serialize refs without a typespace");
			for (; e.tag === "Ref";) e = t.types[e.value];
		}
		switch (e.tag) {
			case "Product": return ye.makeSerializer(e.value, t);
			case "Sum": return be.makeSerializer(e.value, t);
			case "Array":
				if (e.value.tag === "U8") return ce;
				{
					let n = F.makeSerializer(e.value, t);
					return (e, t) => {
						e.writeU32(t.length);
						for (let r of t) n(e, r);
					};
				}
			default: return se[e.tag];
		}
	},
	serializeValue(e, t, n, r) {
		F.makeSerializer(t, r)(e, n);
	},
	makeDeserializer(e, t) {
		if (e.tag === "Ref") {
			if (!t) throw Error("cannot deserialize refs without a typespace");
			for (; e.tag === "Ref";) e = t.types[e.value];
		}
		switch (e.tag) {
			case "Product": return ye.makeDeserializer(e.value, t);
			case "Sum": return be.makeDeserializer(e.value, t);
			case "Array":
				if (e.value.tag === "U8") return ue;
				{
					let n = F.makeDeserializer(e.value, t);
					return (e) => {
						let t = e.readU32(), r = Array(t);
						for (let i = 0; i < t; i++) r[i] = n(e);
						return r;
					};
				}
			default: return le[e.tag];
		}
	},
	deserializeValue(e, t, n) {
		return F.makeDeserializer(t, n)(e);
	},
	intoMapKey: function(e, t) {
		switch (e.tag) {
			case "U8":
			case "U16":
			case "U32":
			case "U64":
			case "U128":
			case "U256":
			case "I8":
			case "I16":
			case "I32":
			case "I64":
			case "I128":
			case "I256":
			case "F32":
			case "F64":
			case "String":
			case "Bool": return t;
			case "Product": return ye.intoMapKey(e.value, t);
			default: {
				let n = new y(10);
				return F.serializeValue(n, e, t), n.toBase64();
			}
		}
	}
};
function I(e) {
	return Function.prototype.call.bind(e);
}
var se = {
	Bool: I(y.prototype.writeBool),
	I8: I(y.prototype.writeI8),
	U8: I(y.prototype.writeU8),
	I16: I(y.prototype.writeI16),
	U16: I(y.prototype.writeU16),
	I32: I(y.prototype.writeI32),
	U32: I(y.prototype.writeU32),
	I64: I(y.prototype.writeI64),
	U64: I(y.prototype.writeU64),
	I128: I(y.prototype.writeI128),
	U128: I(y.prototype.writeU128),
	I256: I(y.prototype.writeI256),
	U256: I(y.prototype.writeU256),
	F32: I(y.prototype.writeF32),
	F64: I(y.prototype.writeF64),
	String: I(y.prototype.writeString)
};
Object.freeze(se);
var ce = I(y.prototype.writeUInt8Array), le = {
	Bool: I(h.prototype.readBool),
	I8: I(h.prototype.readI8),
	U8: I(h.prototype.readU8),
	I16: I(h.prototype.readI16),
	U16: I(h.prototype.readU16),
	I32: I(h.prototype.readI32),
	U32: I(h.prototype.readU32),
	I64: I(h.prototype.readI64),
	U64: I(h.prototype.readU64),
	I128: I(h.prototype.readI128),
	U128: I(h.prototype.readU128),
	I256: I(h.prototype.readI256),
	U256: I(h.prototype.readU256),
	F32: I(h.prototype.readF32),
	F64: I(h.prototype.readF64),
	String: I(h.prototype.readString)
};
Object.freeze(le);
var ue = I(h.prototype.readUInt8Array), de = {
	Bool: 1,
	I8: 1,
	U8: 1,
	I16: 2,
	U16: 2,
	I32: 4,
	U32: 4,
	I64: 8,
	U64: 8,
	I128: 16,
	U128: 16,
	I256: 32,
	U256: 32,
	F32: 4,
	F64: 8
}, fe = new Set(Object.keys(de)), pe = (e) => e.elements.every(({ algebraicType: e }) => fe.has(e.tag)), me = (e) => e.elements.reduce((e, { algebraicType: t }) => e + de[t.tag], 0), he = {
	Bool: "Uint8",
	I8: "Int8",
	U8: "Uint8",
	I16: "Int16",
	U16: "Uint16",
	I32: "Int32",
	U32: "Uint32",
	I64: "BigInt64",
	U64: "BigUint64",
	F32: "Float32",
	F64: "Float64"
}, ge = {
	__time_duration_micros__: (e) => new N(e.readI64()),
	__timestamp_micros_since_unix_epoch__: (e) => new re(e.readI64()),
	__identity__: (e) => new ae(e.readU256()),
	__connection_id__: (e) => new L(e.readU128()),
	__uuid__: (e) => new ie(e.readU128())
};
Object.freeze(ge);
var _e = () => ({}), ve = (e) => {
	let t;
	switch (e.algebraicType.tag) {
		case "String":
			t = "''";
			break;
		case "Bool":
			t = "false";
			break;
		case "I8":
		case "U8":
		case "I16":
		case "U16":
		case "I32":
		case "U32":
			t = "0";
			break;
		case "I64":
		case "U64":
		case "I128":
		case "U128":
		case "I256":
		case "U256":
			t = "0n";
			break;
		case "F32":
		case "F64":
			t = "0.0";
			break;
		default: t = "undefined";
	}
	return `${e.name}: ${t}`;
}, ye = {
	makeSerializer(e, t) {
		let n = oe.get(e);
		if (n != null) return n;
		if (pe(e)) {
			let t = `"use strict";
writer.expandBuffer(${me(e)});
const view = writer.view;
${e.elements.map(({ name: e, algebraicType: { tag: t } }) => t in he ? `view.set${he[t]}(writer.offset, value.${e}, ${de[t] > 1 ? "true" : ""});
writer.offset += ${de[t]};` : `writer.write${t}(value.${e});`).join("\n")}`;
			return n = Function("writer", "value", t), oe.set(e, n), n;
		}
		let r = {}, i = "\"use strict\";\n" + e.elements.map((e) => `this.${e.name}(writer, value.${e.name});`).join("\n");
		n = Function("writer", "value", i).bind(r), oe.set(e, n);
		for (let { name: n, algebraicType: i } of e.elements) r[n] = F.makeSerializer(i, t);
		return Object.freeze(r), n;
	},
	serializeValue(e, t, n, r) {
		ye.makeSerializer(t, r)(e, n);
	},
	makeDeserializer(e, t) {
		switch (e.elements.length) {
			case 0: return _e;
			case 1: {
				let t = e.elements[0].name;
				if (ne(ge, t)) return ge[t];
			}
		}
		let n = P.get(e);
		if (n != null) return n;
		if (pe(e)) {
			let t = `"use strict";
const result = { ${e.elements.map(ve).join(", ")} };
const view = reader.view;
${e.elements.map(({ name: e, algebraicType: { tag: t } }) => t in he ? t === "Bool" ? `result.${e} = view.getUint8(reader.offset) !== 0;
reader.offset += 1;` : `result.${e} = view.get${he[t]}(reader.offset, ${de[t] > 1 ? "true" : ""});
reader.offset += ${de[t]};` : `result.${e} = reader.read${t}();`).join("\n")}
return result;`;
			return n = Function("reader", t), P.set(e, n), n;
		}
		let r = {};
		n = Function("reader", `"use strict";
const result = { ${e.elements.map(ve).join(", ")} };
${e.elements.map(({ name: e }) => `result.${e} = this.${e}(reader);`).join("\n")}
return result;`).bind(r), P.set(e, n);
		for (let { name: n, algebraicType: i } of e.elements) r[n] = F.makeDeserializer(i, t);
		return Object.freeze(r), n;
	},
	deserializeValue(e, t, n) {
		return ye.makeDeserializer(t, n)(e);
	},
	intoMapKey(e, t) {
		if (e.elements.length === 1) {
			let n = e.elements[0].name;
			if (ne(ge, n)) return t[n];
		}
		let n = new y(10);
		return F.serializeValue(n, F.Product(e), t), n.toBase64();
	}
}, be = {
	makeSerializer(e, t) {
		if (e.variants.length == 2 && e.variants[0].name === "some" && e.variants[1].name === "none") {
			let n = F.makeSerializer(e.variants[0].algebraicType, t);
			return (e, t) => {
				t == null ? e.writeByte(1) : (e.writeByte(0), n(e, t));
			};
		}
		if (e.variants.length == 2 && e.variants[0].name === "ok" && e.variants[1].name === "err") {
			let n = F.makeSerializer(e.variants[0].algebraicType, t), r = F.makeSerializer(e.variants[1].algebraicType, t);
			return (e, t) => {
				if ("ok" in t) e.writeU8(0), n(e, t.ok);
				else if ("err" in t) e.writeU8(1), r(e, t.err);
				else throw TypeError("could not serialize result: object had neither a `ok` nor an `err` field");
			};
		}
		{
			let n = oe.get(e);
			if (n != null) return n;
			let r = {}, i = `switch (value.tag) {
${e.variants.map(({ name: e }, t) => `  case ${JSON.stringify(e)}:
    writer.writeByte(${t});
    return this.${e}(writer, value.value);`).join("\n")}
  default:
    throw new TypeError(
      \`Could not serialize sum type; unknown tag \${value.tag}\`
    )
}
`;
			n = Function("writer", "value", i).bind(r), oe.set(e, n);
			for (let { name: n, algebraicType: i } of e.variants) r[n] = F.makeSerializer(i, t);
			return Object.freeze(r), n;
		}
	},
	serializeValue(e, t, n, r) {
		be.makeSerializer(t, r)(e, n);
	},
	makeDeserializer(e, t) {
		if (e.variants.length == 2 && e.variants[0].name === "some" && e.variants[1].name === "none") {
			let n = F.makeDeserializer(e.variants[0].algebraicType, t);
			return (e) => {
				let t = e.readU8();
				if (t === 0) return n(e);
				if (t !== 1) throw `Can't deserialize an option type, couldn't find ${t} tag`;
			};
		}
		if (e.variants.length == 2 && e.variants[0].name === "ok" && e.variants[1].name === "err") {
			let n = F.makeDeserializer(e.variants[0].algebraicType, t), r = F.makeDeserializer(e.variants[1].algebraicType, t);
			return (e) => {
				let t = e.readByte();
				if (t === 0) return { ok: n(e) };
				if (t === 1) return { err: r(e) };
				throw `Can't deserialize a result type, couldn't find ${t} tag`;
			};
		}
		{
			let n = P.get(e);
			if (n != null) return n;
			let r = {};
			n = Function("reader", `switch (reader.readU8()) {
${e.variants.map(({ name: e }, t) => `case ${t}: return { tag: ${JSON.stringify(e)}, value: this.${e}(reader) };`).join("\n")} }`).bind(r), P.set(e, n);
			for (let { name: n, algebraicType: i } of e.variants) r[n] = F.makeDeserializer(i, t);
			return Object.freeze(r), n;
		}
	},
	deserializeValue(e, t, n) {
		return be.makeDeserializer(t, n)(e);
	}
}, L = class e {
	__connection_id__;
	constructor(e) {
		this.__connection_id__ = j(e, "ConnectionId");
	}
	static getAlgebraicType() {
		return F.Product({ elements: [{
			name: "__connection_id__",
			algebraicType: F.U128
		}] });
	}
	isZero() {
		return this.__connection_id__ === BigInt(0);
	}
	static nullIfZero(e) {
		return e.isZero() ? null : e;
	}
	static random() {
		function t() {
			return Math.floor(Math.random() * 255);
		}
		let n = BigInt(0);
		for (let e = 0; e < 16; e++) n = n << BigInt(8) | BigInt(t());
		return new e(n);
	}
	isEqual(e) {
		return this.__connection_id__ == e.__connection_id__;
	}
	equals(e) {
		return this.isEqual(e);
	}
	toHexString() {
		return O(this.__connection_id__);
	}
	toUint8Array() {
		return D(this.__connection_id__);
	}
	static fromString(t) {
		return new e(T(t));
	}
	static fromStringOrNull(t) {
		let n = e.fromString(t);
		return n.isZero() ? null : n;
	}
}, xe = class extends Error {
	constructor(e) {
		super(e);
	}
	get name() {
		return "SenderError";
	}
}, Se = class extends Error {
	constructor(e) {
		super(e);
	}
	get name() {
		return "InternalError";
	}
}, Ce = class extends Error {
	constructor(e = "Not connected to SpacetimeDB") {
		super(e);
	}
	get name() {
		return "DisconnectedError";
	}
}, R = class extends Error {
	constructor(e = "Connection lost before the call was acknowledged; it may or may not have run") {
		super(e);
	}
	get name() {
		return "UnknownCallResultError";
	}
}, we = class extends Error {
	constructor(e = "Reconnected with a different identity; the token was revoked or replaced") {
		super(e);
	}
	get name() {
		return "IdentityChangedError";
	}
}, z = {
	interval(e) {
		return B(e);
	},
	time(e) {
		return Te(e);
	},
	getAlgebraicType() {
		return F.Sum({ variants: [{
			name: "Interval",
			algebraicType: N.getAlgebraicType()
		}, {
			name: "Time",
			algebraicType: re.getAlgebraicType()
		}] });
	},
	isScheduleAt(e) {
		if (e.tag !== "Sum") return !1;
		let t = e.value.variants;
		if (t.length !== 2) return !1;
		let n = t.find((e) => e.name === "Interval"), r = t.find((e) => e.name === "Time");
		return !n || !r ? !1 : N.isTimeDuration(n.algebraicType) && re.isTimestamp(r.algebraicType);
	}
}, B = (e) => ({
	tag: "Interval",
	value: new N(e)
}), Te = (e) => ({
	tag: "Time",
	value: new re(e)
}), Ee = z, De = { getAlgebraicType(e) {
	return F.Sum({ variants: [{
		name: "some",
		algebraicType: e
	}, {
		name: "none",
		algebraicType: F.Product({ elements: [] })
	}] });
} }, Oe = { getAlgebraicType(e, t) {
	return F.Sum({ variants: [{
		name: "ok",
		algebraicType: e
	}, {
		name: "err",
		algebraicType: t
	}] });
} }, ke = Symbol("QueryBrand"), Ae = (e) => !!e && typeof e == "object" && ke in e;
function je(e) {
	return e.toSql();
}
var Me = class e {
	constructor(e, t, n) {
		if (this.sourceQuery = e, this.filterQuery = t, this.joinCondition = n, e.table.sourceName === t.table.sourceName) throw Error("Cannot semijoin a table to itself");
	}
	[ke] = !0;
	type = "semijoin";
	build() {
		return this;
	}
	where(t) {
		let n = this.sourceQuery.where(t);
		return new e(n, this.filterQuery, this.joinCondition);
	}
	toSql() {
		let e = this.filterQuery, t = this.sourceQuery, n = Ye(e.table.sourceName), r = Ye(t.table.sourceName), i = `SELECT ${r}.* FROM ${n} JOIN ${r} ON ${Ge(this.joinCondition)}`, a = [];
		if (e.whereClause && a.push(Ge(e.whereClause)), t.whereClause && a.push(Ge(t.whereClause)), a.length > 0) {
			let e = a.length === 1 ? a[0] : a.map(Ke).join(" AND ");
			i += ` WHERE ${e}`;
		}
		return i;
	}
}, Ne = class e {
	constructor(e, t) {
		this.table = e, this.whereClause = t;
	}
	[ke] = !0;
	where(t) {
		let n = Ue(t(this.table.cols)), r = this.whereClause ? this.whereClause.and(n) : n;
		return new e(this.table, r);
	}
	rightSemijoin(t, n) {
		let r = new e(t), i = n(this.table.indexedCols, t.indexedCols);
		return new Me(r, this, i);
	}
	leftSemijoin(t, n) {
		let r = new e(t), i = n(this.table.indexedCols, t.indexedCols);
		return new Me(this, r, i);
	}
	toSql() {
		return ze(this.table, this.whereClause);
	}
	build() {
		return this;
	}
}, Pe = class {
	[ke] = !0;
	type = "table";
	sourceName;
	accessorName;
	cols;
	indexedCols;
	tableDef;
	get columns() {
		return this.tableDef.columns;
	}
	get indexes() {
		return this.tableDef.indexes;
	}
	get rowType() {
		return this.tableDef.rowType;
	}
	get constraints() {
		return this.tableDef.constraints;
	}
	constructor(e) {
		this.sourceName = e.sourceName, this.accessorName = e.accessorName, this.cols = Re(e), this.indexedCols = this.cols, this.tableDef = e, Object.freeze(this);
	}
	asFrom() {
		return new Ne(this);
	}
	rightSemijoin(e, t) {
		return this.asFrom().rightSemijoin(e, t);
	}
	leftSemijoin(e, t) {
		return this.asFrom().leftSemijoin(e, t);
	}
	build() {
		return this.asFrom().build();
	}
	toSql() {
		return this.asFrom().toSql();
	}
	where(e) {
		return this.asFrom().where(e);
	}
};
function Fe(e) {
	return new Pe(e);
}
function Ie(e) {
	let t = /* @__PURE__ */ Object.create(null);
	for (let n of Object.values(e.tables)) {
		let e = Fe(n);
		t[n.accessorName] = e;
	}
	return Object.freeze(t);
}
function Le(e) {
	let t = /* @__PURE__ */ Object.create(null), n = /* @__PURE__ */ Object.create(null);
	for (let r of Object.values(e)) {
		let e = r.sourceName.indexOf(".");
		if (e === -1) t[r.accessorName] = Fe(r);
		else {
			let t = r.sourceName.slice(0, e), i = r.sourceName.slice(e + 1);
			(n[t] ??= /* @__PURE__ */ Object.create(null))[i] = Fe(r);
		}
	}
	for (let [e, r] of Object.entries(n)) t[e] = Object.freeze(r);
	return Object.freeze(t);
}
function Re(e) {
	let t = {};
	for (let n of Object.keys(e.columns)) {
		let r = e.columns[n], i = new Be(e.sourceName, n, r.typeBuilder.algebraicType, r.columnMetadata.name);
		t[n] = Object.freeze(i);
	}
	return Object.freeze(t);
}
function ze(e, t, n = []) {
	let r = `SELECT * FROM ${Ye(e.sourceName)}`, i = [];
	return t && i.push(Ge(t)), i.push(...n), i.length === 0 ? r : `${r} WHERE ${i.length === 1 ? i[0] : i.map(Ke).join(" AND ")}`;
}
var Be = class {
	type = "column";
	column;
	columnName;
	table;
	tsValueType;
	spacetimeType;
	constructor(e, t, n, r) {
		this.table = e, this.column = t, this.columnName = r || t, this.spacetimeType = n;
	}
	eq(e) {
		return new We({
			type: "eq",
			left: this,
			right: He(e)
		});
	}
	ne(e) {
		return new We({
			type: "ne",
			left: this,
			right: He(e)
		});
	}
	lt(e) {
		return new We({
			type: "lt",
			left: this,
			right: He(e)
		});
	}
	lte(e) {
		return new We({
			type: "lte",
			left: this,
			right: He(e)
		});
	}
	gt(e) {
		return new We({
			type: "gt",
			left: this,
			right: He(e)
		});
	}
	gte(e) {
		return new We({
			type: "gte",
			left: this,
			right: He(e)
		});
	}
};
function Ve(e) {
	return {
		type: "literal",
		value: e
	};
}
function He(e) {
	return e.type === "literal" || typeof e == "object" && e && "type" in e && e.type === "column" ? e : Ve(e);
}
function Ue(e) {
	return e instanceof We ? e : typeof e == "boolean" ? new We({
		type: "eq",
		left: Ve(e),
		right: Ve(!0)
	}) : new We({
		type: "eq",
		left: e,
		right: Ve(!0)
	});
}
var We = class e {
	constructor(e) {
		this.data = e;
	}
	and(t) {
		return new e({
			type: "and",
			clauses: [this.data, t.data]
		});
	}
	or(t) {
		return new e({
			type: "or",
			clauses: [this.data, t.data]
		});
	}
	not() {
		return new e({
			type: "not",
			clause: this.data
		});
	}
};
function Ge(e, t) {
	let n = e instanceof We ? e.data : e;
	switch (n.type) {
		case "eq": return `${qe(n.left)} = ${qe(n.right)}`;
		case "ne": return `${qe(n.left)} <> ${qe(n.right)}`;
		case "gt": return `${qe(n.left)} > ${qe(n.right)}`;
		case "gte": return `${qe(n.left)} >= ${qe(n.right)}`;
		case "lt": return `${qe(n.left)} < ${qe(n.right)}`;
		case "lte": return `${qe(n.left)} <= ${qe(n.right)}`;
		case "and": return n.clauses.map((e) => Ge(e)).map(Ke).join(" AND ");
		case "or": return n.clauses.map((e) => Ge(e)).map(Ke).join(" OR ");
		case "not": return `NOT ${Ke(Ge(n.clause))}`;
	}
}
function Ke(e) {
	return `(${e})`;
}
function qe(e, t) {
	if (Xe(e)) return Je(e.value);
	let n = e.table;
	return `${Ye(n)}.${Ye(e.columnName)}`;
}
function Je(e) {
	if (e == null) return "NULL";
	if (e instanceof ae || e instanceof L || e instanceof ie) return `0x${e.toHexString()}`;
	if (e instanceof re) return `'${e.toISOString()}'`;
	switch (typeof e) {
		case "number":
		case "bigint": return String(e);
		case "boolean": return e ? "TRUE" : "FALSE";
		case "string": return `'${e.replace(/'/g, "''")}'`;
		default: return `'${JSON.stringify(e).replace(/'/g, "''")}'`;
	}
}
function Ye(e) {
	return e.split(".").map((e) => `"${e.replace(/"/g, "\"\"")}"`).join(".");
}
function Xe(e) {
	return e.type === "literal";
}
function Ze(e, t) {
	let n = t.split("."), r = n.pop(), i = e;
	for (let e of n) i = i[e] ??= /* @__PURE__ */ Object.create(null);
	return [i, r];
}
function V(e, t) {
	return {
		...e,
		...t
	};
}
var Qe = class {
	type;
	algebraicType;
	constructor(e) {
		this.algebraicType = e;
	}
	optional() {
		return new _t(this);
	}
	serialize(e, t) {
		(this.serialize = F.makeSerializer(this.algebraicType))(e, t);
	}
	deserialize(e) {
		return (this.deserialize = F.makeDeserializer(this.algebraicType))(e);
	}
}, $e = class extends Qe {
	constructor() {
		super(F.U8);
	}
	index(e = "btree") {
		return new Mt(this, V(H, { indexType: e }));
	}
	unique() {
		return new Mt(this, V(H, { isUnique: !0 }));
	}
	primaryKey() {
		return new Mt(this, V(H, { isPrimaryKey: !0 }));
	}
	autoInc() {
		return new Mt(this, V(H, { isAutoIncrement: !0 }));
	}
	default(e) {
		return new Mt(this, V(H, { defaultValue: e }));
	}
	name(e) {
		return new Mt(this, V(H, { name: e }));
	}
}, et = class extends Qe {
	constructor() {
		super(F.U16);
	}
	index(e = "btree") {
		return new Nt(this, V(H, { indexType: e }));
	}
	unique() {
		return new Nt(this, V(H, { isUnique: !0 }));
	}
	primaryKey() {
		return new Nt(this, V(H, { isPrimaryKey: !0 }));
	}
	autoInc() {
		return new Nt(this, V(H, { isAutoIncrement: !0 }));
	}
	default(e) {
		return new Nt(this, V(H, { defaultValue: e }));
	}
	name(e) {
		return new Nt(this, V(H, { name: e }));
	}
}, tt = class extends Qe {
	constructor() {
		super(F.U32);
	}
	index(e = "btree") {
		return new Pt(this, V(H, { indexType: e }));
	}
	unique() {
		return new Pt(this, V(H, { isUnique: !0 }));
	}
	primaryKey() {
		return new Pt(this, V(H, { isPrimaryKey: !0 }));
	}
	autoInc() {
		return new Pt(this, V(H, { isAutoIncrement: !0 }));
	}
	default(e) {
		return new Pt(this, V(H, { defaultValue: e }));
	}
	name(e) {
		return new Pt(this, V(H, { name: e }));
	}
}, nt = class extends Qe {
	constructor() {
		super(F.U64);
	}
	index(e = "btree") {
		return new Ft(this, V(H, { indexType: e }));
	}
	unique() {
		return new Ft(this, V(H, { isUnique: !0 }));
	}
	primaryKey() {
		return new Ft(this, V(H, { isPrimaryKey: !0 }));
	}
	autoInc() {
		return new Ft(this, V(H, { isAutoIncrement: !0 }));
	}
	default(e) {
		return new Ft(this, V(H, { defaultValue: e }));
	}
	name(e) {
		return new Ft(this, V(H, { name: e }));
	}
}, rt = class extends Qe {
	constructor() {
		super(F.U128);
	}
	index(e = "btree") {
		return new It(this, V(H, { indexType: e }));
	}
	unique() {
		return new It(this, V(H, { isUnique: !0 }));
	}
	primaryKey() {
		return new It(this, V(H, { isPrimaryKey: !0 }));
	}
	autoInc() {
		return new It(this, V(H, { isAutoIncrement: !0 }));
	}
	default(e) {
		return new It(this, V(H, { defaultValue: e }));
	}
	name(e) {
		return new It(this, V(H, { name: e }));
	}
}, it = class extends Qe {
	constructor() {
		super(F.U256);
	}
	index(e = "btree") {
		return new Lt(this, V(H, { indexType: e }));
	}
	unique() {
		return new Lt(this, V(H, { isUnique: !0 }));
	}
	primaryKey() {
		return new Lt(this, V(H, { isPrimaryKey: !0 }));
	}
	autoInc() {
		return new Lt(this, V(H, { isAutoIncrement: !0 }));
	}
	default(e) {
		return new Lt(this, V(H, { defaultValue: e }));
	}
	name(e) {
		return new Lt(this, V(H, { name: e }));
	}
}, at = class extends Qe {
	constructor() {
		super(F.I8);
	}
	index(e = "btree") {
		return new Rt(this, V(H, { indexType: e }));
	}
	unique() {
		return new Rt(this, V(H, { isUnique: !0 }));
	}
	primaryKey() {
		return new Rt(this, V(H, { isPrimaryKey: !0 }));
	}
	autoInc() {
		return new Rt(this, V(H, { isAutoIncrement: !0 }));
	}
	default(e) {
		return new Rt(this, V(H, { defaultValue: e }));
	}
	name(e) {
		return new Rt(this, V(H, { name: e }));
	}
}, ot = class extends Qe {
	constructor() {
		super(F.I16);
	}
	index(e = "btree") {
		return new zt(this, V(H, { indexType: e }));
	}
	unique() {
		return new zt(this, V(H, { isUnique: !0 }));
	}
	primaryKey() {
		return new zt(this, V(H, { isPrimaryKey: !0 }));
	}
	autoInc() {
		return new zt(this, V(H, { isAutoIncrement: !0 }));
	}
	default(e) {
		return new zt(this, V(H, { defaultValue: e }));
	}
	name(e) {
		return new zt(this, V(H, { name: e }));
	}
}, st = class extends Qe {
	constructor() {
		super(F.I32);
	}
	index(e = "btree") {
		return new Bt(this, V(H, { indexType: e }));
	}
	unique() {
		return new Bt(this, V(H, { isUnique: !0 }));
	}
	primaryKey() {
		return new Bt(this, V(H, { isPrimaryKey: !0 }));
	}
	autoInc() {
		return new Bt(this, V(H, { isAutoIncrement: !0 }));
	}
	default(e) {
		return new Bt(this, V(H, { defaultValue: e }));
	}
	name(e) {
		return new Bt(this, V(H, { name: e }));
	}
}, ct = class extends Qe {
	constructor() {
		super(F.I64);
	}
	index(e = "btree") {
		return new Vt(this, V(H, { indexType: e }));
	}
	unique() {
		return new Vt(this, V(H, { isUnique: !0 }));
	}
	primaryKey() {
		return new Vt(this, V(H, { isPrimaryKey: !0 }));
	}
	autoInc() {
		return new Vt(this, V(H, { isAutoIncrement: !0 }));
	}
	default(e) {
		return new Vt(this, V(H, { defaultValue: e }));
	}
	name(e) {
		return new Vt(this, V(H, { name: e }));
	}
}, lt = class extends Qe {
	constructor() {
		super(F.I128);
	}
	index(e = "btree") {
		return new Ht(this, V(H, { indexType: e }));
	}
	unique() {
		return new Ht(this, V(H, { isUnique: !0 }));
	}
	primaryKey() {
		return new Ht(this, V(H, { isPrimaryKey: !0 }));
	}
	autoInc() {
		return new Ht(this, V(H, { isAutoIncrement: !0 }));
	}
	default(e) {
		return new Ht(this, V(H, { defaultValue: e }));
	}
	name(e) {
		return new Ht(this, V(H, { name: e }));
	}
}, ut = class extends Qe {
	constructor() {
		super(F.I256);
	}
	index(e = "btree") {
		return new Ut(this, V(H, { indexType: e }));
	}
	unique() {
		return new Ut(this, V(H, { isUnique: !0 }));
	}
	primaryKey() {
		return new Ut(this, V(H, { isPrimaryKey: !0 }));
	}
	autoInc() {
		return new Ut(this, V(H, { isAutoIncrement: !0 }));
	}
	default(e) {
		return new Ut(this, V(H, { defaultValue: e }));
	}
	name(e) {
		return new Ut(this, V(H, { name: e }));
	}
}, dt = class extends Qe {
	constructor() {
		super(F.F32);
	}
	default(e) {
		return new Wt(this, V(H, { defaultValue: e }));
	}
	name(e) {
		return new Wt(this, V(H, { name: e }));
	}
}, ft = class extends Qe {
	constructor() {
		super(F.F64);
	}
	default(e) {
		return new Gt(this, V(H, { defaultValue: e }));
	}
	name(e) {
		return new Gt(this, V(H, { name: e }));
	}
}, pt = class extends Qe {
	constructor() {
		super(F.Bool);
	}
	index(e = "btree") {
		return new Kt(this, V(H, { indexType: e }));
	}
	unique() {
		return new Kt(this, V(H, { isUnique: !0 }));
	}
	primaryKey() {
		return new Kt(this, V(H, { isPrimaryKey: !0 }));
	}
	default(e) {
		return new Kt(this, V(H, { defaultValue: e }));
	}
	name(e) {
		return new Kt(this, V(H, { name: e }));
	}
}, mt = class extends Qe {
	constructor() {
		super(F.String);
	}
	index(e = "btree") {
		return new qt(this, V(H, { indexType: e }));
	}
	unique() {
		return new qt(this, V(H, { isUnique: !0 }));
	}
	primaryKey() {
		return new qt(this, V(H, { isPrimaryKey: !0 }));
	}
	default(e) {
		return new qt(this, V(H, { defaultValue: e }));
	}
	name(e) {
		return new qt(this, V(H, { name: e }));
	}
}, ht = class extends Qe {
	element;
	constructor(e) {
		super(F.Array(e.algebraicType)), this.element = e;
	}
	default(e) {
		return new Jt(this, V(H, { defaultValue: e }));
	}
	name(e) {
		return new Jt(this, V(H, { name: e }));
	}
}, gt = class extends Qe {
	constructor() {
		super(F.Array(F.U8));
	}
	default(e) {
		return new Yt(V(H, { defaultValue: e }));
	}
	name(e) {
		return new Yt(V(H, { name: e }));
	}
}, _t = class extends Qe {
	value;
	constructor(e) {
		super(De.getAlgebraicType(e.algebraicType)), this.value = e;
	}
	default(e) {
		return new Xt(this, V(H, { defaultValue: e }));
	}
	name(e) {
		return new Xt(this, V(H, { name: e }));
	}
}, vt = class extends Qe {
	typeName;
	elements;
	constructor(e, t) {
		function n(e) {
			return Object.keys(e).map((t) => ({
				name: t,
				get algebraicType() {
					return e[t].algebraicType;
				}
			}));
		}
		super(F.Product({ elements: n(e) })), this.typeName = t, this.elements = e;
	}
	default(e) {
		return new Qt(this, V(H, { defaultValue: e }));
	}
	name(e) {
		return new Qt(this, V(H, { name: e }));
	}
}, yt = class extends Qe {
	ok;
	err;
	constructor(e, t) {
		super(Oe.getAlgebraicType(e.algebraicType, t.algebraicType)), this.ok = e, this.err = t;
	}
	default(e) {
		return new Zt(this, V(H, { defaultValue: e }));
	}
}, bt = class extends Qe {
	constructor() {
		super({
			tag: "Product",
			value: { elements: [] }
		});
	}
}, xt = class extends Qe {
	row;
	typeName;
	constructor(e, t) {
		let n = Object.fromEntries(Object.entries(e).map(([e, t]) => [e, t instanceof jt ? t : new jt(t, {})])), r = Object.keys(n).map((e) => ({
			name: e,
			get algebraicType() {
				return n[e].typeBuilder.algebraicType;
			}
		}));
		super(F.Product({ elements: r })), this.row = n, this.typeName = t;
	}
}, St = class extends Qe {
	variants;
	typeName;
	constructor(e, t) {
		function n(e) {
			return Object.keys(e).map((t) => ({
				name: t,
				get algebraicType() {
					return e[t].algebraicType;
				}
			}));
		}
		super(F.Sum({ variants: n(e) })), this.variants = e, this.typeName = t;
		for (let t of Object.keys(e)) {
			let n = Object.getOwnPropertyDescriptor(e, t), r = !!n && (typeof n.get == "function" || typeof n.set == "function"), i = !1;
			if (r || (i = e[t] instanceof bt), i) {
				let e = this.create(t);
				Object.defineProperty(this, t, {
					value: e,
					writable: !1,
					enumerable: !0,
					configurable: !1
				});
			} else Object.defineProperty(this, t, {
				value: ((e) => this.create(t, e)),
				writable: !1,
				enumerable: !0,
				configurable: !1
			});
		}
	}
	create(e, t) {
		return t === void 0 ? { tag: e } : {
			tag: e,
			value: t
		};
	}
	default(e) {
		return new $t(this, V(H, { defaultValue: e }));
	}
	name(e) {
		return new $t(this, V(H, { name: e }));
	}
	index(e = "btree") {
		return new $t(this, V(H, { indexType: e }));
	}
	primaryKey() {
		return new $t(this, V(H, { isPrimaryKey: !0 }));
	}
}, Ct = St, wt = class extends St {
	index(e = "btree") {
		return new en(this, V(H, { indexType: e }));
	}
	primaryKey() {
		return new en(this, V(H, { isPrimaryKey: !0 }));
	}
}, Tt = class extends Qe {
	constructor() {
		super(Ee.getAlgebraicType());
	}
	default(e) {
		return new tn(this, V(H, { defaultValue: e }));
	}
	name(e) {
		return new tn(this, V(H, { name: e }));
	}
}, Et = class extends Qe {
	constructor() {
		super(ae.getAlgebraicType());
	}
	index(e = "btree") {
		return new nn(this, V(H, { indexType: e }));
	}
	unique() {
		return new nn(this, V(H, { isUnique: !0 }));
	}
	primaryKey() {
		return new nn(this, V(H, { isPrimaryKey: !0 }));
	}
	autoInc() {
		return new nn(this, V(H, { isAutoIncrement: !0 }));
	}
	default(e) {
		return new nn(this, V(H, { defaultValue: e }));
	}
	name(e) {
		return new nn(this, V(H, { name: e }));
	}
}, Dt = class extends Qe {
	constructor() {
		super(L.getAlgebraicType());
	}
	index(e = "btree") {
		return new rn(this, V(H, { indexType: e }));
	}
	unique() {
		return new rn(this, V(H, { isUnique: !0 }));
	}
	primaryKey() {
		return new rn(this, V(H, { isPrimaryKey: !0 }));
	}
	autoInc() {
		return new rn(this, V(H, { isAutoIncrement: !0 }));
	}
	default(e) {
		return new rn(this, V(H, { defaultValue: e }));
	}
	name(e) {
		return new rn(this, V(H, { name: e }));
	}
}, Ot = class extends Qe {
	constructor() {
		super(re.getAlgebraicType());
	}
	index(e = "btree") {
		return new an(this, V(H, { indexType: e }));
	}
	unique() {
		return new an(this, V(H, { isUnique: !0 }));
	}
	primaryKey() {
		return new an(this, V(H, { isPrimaryKey: !0 }));
	}
	autoInc() {
		return new an(this, V(H, { isAutoIncrement: !0 }));
	}
	default(e) {
		return new an(this, V(H, { defaultValue: e }));
	}
	name(e) {
		return new an(this, V(H, { name: e }));
	}
}, kt = class extends Qe {
	constructor() {
		super(N.getAlgebraicType());
	}
	index(e = "btree") {
		return new on(this, V(H, { indexType: e }));
	}
	unique() {
		return new on(this, V(H, { isUnique: !0 }));
	}
	primaryKey() {
		return new on(this, V(H, { isPrimaryKey: !0 }));
	}
	autoInc() {
		return new on(this, V(H, { isAutoIncrement: !0 }));
	}
	default(e) {
		return new on(this, V(H, { defaultValue: e }));
	}
	name(e) {
		return new on(this, V(H, { name: e }));
	}
}, At = class extends Qe {
	constructor() {
		super(ie.getAlgebraicType());
	}
	index(e = "btree") {
		return new sn(this, V(H, { indexType: e }));
	}
	unique() {
		return new sn(this, V(H, { isUnique: !0 }));
	}
	primaryKey() {
		return new sn(this, V(H, { isPrimaryKey: !0 }));
	}
	autoInc() {
		return new sn(this, V(H, { isAutoIncrement: !0 }));
	}
	default(e) {
		return new sn(this, V(H, { defaultValue: e }));
	}
	name(e) {
		return new sn(this, V(H, { name: e }));
	}
}, H = {}, jt = class {
	typeBuilder;
	columnMetadata;
	constructor(e, t) {
		this.typeBuilder = e, this.columnMetadata = t;
	}
	serialize(e, t) {
		this.typeBuilder.serialize(e, t);
	}
	deserialize(e) {
		return this.typeBuilder.deserialize(e);
	}
}, Mt = class e extends jt {
	index(t = "btree") {
		return new e(this.typeBuilder, V(this.columnMetadata, { indexType: t }));
	}
	unique() {
		return new e(this.typeBuilder, V(this.columnMetadata, { isUnique: !0 }));
	}
	primaryKey() {
		return new e(this.typeBuilder, V(this.columnMetadata, { isPrimaryKey: !0 }));
	}
	autoInc() {
		return new e(this.typeBuilder, V(this.columnMetadata, { isAutoIncrement: !0 }));
	}
	default(t) {
		return new e(this.typeBuilder, V(this.columnMetadata, { defaultValue: t }));
	}
	name(t) {
		return new e(this.typeBuilder, V(this.columnMetadata, { name: t }));
	}
}, Nt = class e extends jt {
	index(t = "btree") {
		return new e(this.typeBuilder, V(this.columnMetadata, { indexType: t }));
	}
	unique() {
		return new e(this.typeBuilder, V(this.columnMetadata, { isUnique: !0 }));
	}
	primaryKey() {
		return new e(this.typeBuilder, V(this.columnMetadata, { isPrimaryKey: !0 }));
	}
	autoInc() {
		return new e(this.typeBuilder, V(this.columnMetadata, { isAutoIncrement: !0 }));
	}
	default(t) {
		return new e(this.typeBuilder, V(this.columnMetadata, { defaultValue: t }));
	}
	name(t) {
		return new e(this.typeBuilder, V(this.columnMetadata, { name: t }));
	}
}, Pt = class e extends jt {
	index(t = "btree") {
		return new e(this.typeBuilder, V(this.columnMetadata, { indexType: t }));
	}
	unique() {
		return new e(this.typeBuilder, V(this.columnMetadata, { isUnique: !0 }));
	}
	primaryKey() {
		return new e(this.typeBuilder, V(this.columnMetadata, { isPrimaryKey: !0 }));
	}
	autoInc() {
		return new e(this.typeBuilder, V(this.columnMetadata, { isAutoIncrement: !0 }));
	}
	default(t) {
		return new e(this.typeBuilder, V(this.columnMetadata, { defaultValue: t }));
	}
	name(t) {
		return new e(this.typeBuilder, V(this.columnMetadata, { name: t }));
	}
}, Ft = class e extends jt {
	index(t = "btree") {
		return new e(this.typeBuilder, V(this.columnMetadata, { indexType: t }));
	}
	unique() {
		return new e(this.typeBuilder, V(this.columnMetadata, { isUnique: !0 }));
	}
	primaryKey() {
		return new e(this.typeBuilder, V(this.columnMetadata, { isPrimaryKey: !0 }));
	}
	autoInc() {
		return new e(this.typeBuilder, V(this.columnMetadata, { isAutoIncrement: !0 }));
	}
	default(t) {
		return new e(this.typeBuilder, V(this.columnMetadata, { defaultValue: t }));
	}
	name(t) {
		return new e(this.typeBuilder, V(this.columnMetadata, { name: t }));
	}
}, It = class e extends jt {
	index(t = "btree") {
		return new e(this.typeBuilder, V(this.columnMetadata, { indexType: t }));
	}
	unique() {
		return new e(this.typeBuilder, V(this.columnMetadata, { isUnique: !0 }));
	}
	primaryKey() {
		return new e(this.typeBuilder, V(this.columnMetadata, { isPrimaryKey: !0 }));
	}
	autoInc() {
		return new e(this.typeBuilder, V(this.columnMetadata, { isAutoIncrement: !0 }));
	}
	default(t) {
		return new e(this.typeBuilder, V(this.columnMetadata, { defaultValue: t }));
	}
	name(t) {
		return new e(this.typeBuilder, V(this.columnMetadata, { name: t }));
	}
}, Lt = class e extends jt {
	index(t = "btree") {
		return new e(this.typeBuilder, V(this.columnMetadata, { indexType: t }));
	}
	unique() {
		return new e(this.typeBuilder, V(this.columnMetadata, { isUnique: !0 }));
	}
	primaryKey() {
		return new e(this.typeBuilder, V(this.columnMetadata, { isPrimaryKey: !0 }));
	}
	autoInc() {
		return new e(this.typeBuilder, V(this.columnMetadata, { isAutoIncrement: !0 }));
	}
	default(t) {
		return new e(this.typeBuilder, V(this.columnMetadata, { defaultValue: t }));
	}
	name(t) {
		return new e(this.typeBuilder, V(this.columnMetadata, { name: t }));
	}
}, Rt = class e extends jt {
	index(t = "btree") {
		return new e(this.typeBuilder, V(this.columnMetadata, { indexType: t }));
	}
	unique() {
		return new e(this.typeBuilder, V(this.columnMetadata, { isUnique: !0 }));
	}
	primaryKey() {
		return new e(this.typeBuilder, V(this.columnMetadata, { isPrimaryKey: !0 }));
	}
	autoInc() {
		return new e(this.typeBuilder, V(this.columnMetadata, { isAutoIncrement: !0 }));
	}
	default(t) {
		return new e(this.typeBuilder, V(this.columnMetadata, { defaultValue: t }));
	}
	name(t) {
		return new e(this.typeBuilder, V(this.columnMetadata, { name: t }));
	}
}, zt = class e extends jt {
	index(t = "btree") {
		return new e(this.typeBuilder, V(this.columnMetadata, { indexType: t }));
	}
	unique() {
		return new e(this.typeBuilder, V(this.columnMetadata, { isUnique: !0 }));
	}
	primaryKey() {
		return new e(this.typeBuilder, V(this.columnMetadata, { isPrimaryKey: !0 }));
	}
	autoInc() {
		return new e(this.typeBuilder, V(this.columnMetadata, { isAutoIncrement: !0 }));
	}
	default(t) {
		return new e(this.typeBuilder, V(this.columnMetadata, { defaultValue: t }));
	}
	name(t) {
		return new e(this.typeBuilder, V(this.columnMetadata, { name: t }));
	}
}, Bt = class e extends jt {
	index(t = "btree") {
		return new e(this.typeBuilder, V(this.columnMetadata, { indexType: t }));
	}
	unique() {
		return new e(this.typeBuilder, V(this.columnMetadata, { isUnique: !0 }));
	}
	primaryKey() {
		return new e(this.typeBuilder, V(this.columnMetadata, { isPrimaryKey: !0 }));
	}
	autoInc() {
		return new e(this.typeBuilder, V(this.columnMetadata, { isAutoIncrement: !0 }));
	}
	default(t) {
		return new e(this.typeBuilder, V(this.columnMetadata, { defaultValue: t }));
	}
	name(t) {
		return new e(this.typeBuilder, V(this.columnMetadata, { name: t }));
	}
}, Vt = class e extends jt {
	index(t = "btree") {
		return new e(this.typeBuilder, V(this.columnMetadata, { indexType: t }));
	}
	unique() {
		return new e(this.typeBuilder, V(this.columnMetadata, { isUnique: !0 }));
	}
	primaryKey() {
		return new e(this.typeBuilder, V(this.columnMetadata, { isPrimaryKey: !0 }));
	}
	autoInc() {
		return new e(this.typeBuilder, V(this.columnMetadata, { isAutoIncrement: !0 }));
	}
	default(t) {
		return new e(this.typeBuilder, V(this.columnMetadata, { defaultValue: t }));
	}
	name(t) {
		return new e(this.typeBuilder, V(this.columnMetadata, { name: t }));
	}
}, Ht = class e extends jt {
	index(t = "btree") {
		return new e(this.typeBuilder, V(this.columnMetadata, { indexType: t }));
	}
	unique() {
		return new e(this.typeBuilder, V(this.columnMetadata, { isUnique: !0 }));
	}
	primaryKey() {
		return new e(this.typeBuilder, V(this.columnMetadata, { isPrimaryKey: !0 }));
	}
	autoInc() {
		return new e(this.typeBuilder, V(this.columnMetadata, { isAutoIncrement: !0 }));
	}
	default(t) {
		return new e(this.typeBuilder, V(this.columnMetadata, { defaultValue: t }));
	}
	name(t) {
		return new e(this.typeBuilder, V(this.columnMetadata, { name: t }));
	}
}, Ut = class e extends jt {
	index(t = "btree") {
		return new e(this.typeBuilder, V(this.columnMetadata, { indexType: t }));
	}
	unique() {
		return new e(this.typeBuilder, V(this.columnMetadata, { isUnique: !0 }));
	}
	primaryKey() {
		return new e(this.typeBuilder, V(this.columnMetadata, { isPrimaryKey: !0 }));
	}
	autoInc() {
		return new e(this.typeBuilder, V(this.columnMetadata, { isAutoIncrement: !0 }));
	}
	default(t) {
		return new e(this.typeBuilder, V(this.columnMetadata, { defaultValue: t }));
	}
	name(t) {
		return new e(this.typeBuilder, V(this.columnMetadata, { name: t }));
	}
}, Wt = class e extends jt {
	default(t) {
		return new e(this.typeBuilder, V(this.columnMetadata, { defaultValue: t }));
	}
	name(t) {
		return new e(this.typeBuilder, V(this.columnMetadata, { name: t }));
	}
}, Gt = class e extends jt {
	default(t) {
		return new e(this.typeBuilder, V(this.columnMetadata, { defaultValue: t }));
	}
	name(t) {
		return new e(this.typeBuilder, V(this.columnMetadata, { name: t }));
	}
}, Kt = class e extends jt {
	index(t = "btree") {
		return new e(this.typeBuilder, V(this.columnMetadata, { indexType: t }));
	}
	unique() {
		return new e(this.typeBuilder, V(this.columnMetadata, { isUnique: !0 }));
	}
	primaryKey() {
		return new e(this.typeBuilder, V(this.columnMetadata, { isPrimaryKey: !0 }));
	}
	default(t) {
		return new e(this.typeBuilder, V(this.columnMetadata, { defaultValue: t }));
	}
	name(t) {
		return new e(this.typeBuilder, V(this.columnMetadata, { name: t }));
	}
}, qt = class e extends jt {
	index(t = "btree") {
		return new e(this.typeBuilder, V(this.columnMetadata, { indexType: t }));
	}
	unique() {
		return new e(this.typeBuilder, V(this.columnMetadata, { isUnique: !0 }));
	}
	primaryKey() {
		return new e(this.typeBuilder, V(this.columnMetadata, { isPrimaryKey: !0 }));
	}
	default(t) {
		return new e(this.typeBuilder, V(this.columnMetadata, { defaultValue: t }));
	}
	name(t) {
		return new e(this.typeBuilder, V(this.columnMetadata, { name: t }));
	}
}, Jt = class e extends jt {
	default(t) {
		return new e(this.typeBuilder, V(this.columnMetadata, { defaultValue: t }));
	}
	name(t) {
		return new e(this.typeBuilder, V(this.columnMetadata, { name: t }));
	}
}, Yt = class e extends jt {
	constructor(e) {
		super(new Qe(F.Array(F.U8)), e);
	}
	default(t) {
		return new e(V(this.columnMetadata, { defaultValue: t }));
	}
	name(t) {
		return new e(V(this.columnMetadata, { name: t }));
	}
}, Xt = class e extends jt {
	default(t) {
		return new e(this.typeBuilder, V(this.columnMetadata, { defaultValue: t }));
	}
	name(t) {
		return new e(this.typeBuilder, V(this.columnMetadata, { name: t }));
	}
}, Zt = class e extends jt {
	constructor(e, t) {
		super(e, t);
	}
	default(t) {
		return new e(this.typeBuilder, V(this.columnMetadata, { defaultValue: t }));
	}
}, Qt = class e extends jt {
	default(t) {
		return new e(this.typeBuilder, V(this.columnMetadata, { defaultValue: t }));
	}
	name(t) {
		return new e(this.typeBuilder, V(this.columnMetadata, { name: t }));
	}
}, $t = class e extends jt {
	default(t) {
		return new e(this.typeBuilder, V(this.columnMetadata, { defaultValue: t }));
	}
	name(t) {
		return new e(this.typeBuilder, V(this.columnMetadata, { name: t }));
	}
	index(t = "btree") {
		return new e(this.typeBuilder, V(this.columnMetadata, { indexType: t }));
	}
	primaryKey() {
		return new e(this.typeBuilder, V(this.columnMetadata, { isPrimaryKey: !0 }));
	}
}, en = class e extends $t {
	index(t = "btree") {
		return new e(this.typeBuilder, V(this.columnMetadata, { indexType: t }));
	}
	primaryKey() {
		return new e(this.typeBuilder, V(this.columnMetadata, { isPrimaryKey: !0 }));
	}
}, tn = class e extends jt {
	default(t) {
		return new e(this.typeBuilder, V(this.columnMetadata, { defaultValue: t }));
	}
	name(t) {
		return new e(this.typeBuilder, V(this.columnMetadata, { name: t }));
	}
}, nn = class e extends jt {
	index(t = "btree") {
		return new e(this.typeBuilder, V(this.columnMetadata, { indexType: t }));
	}
	unique() {
		return new e(this.typeBuilder, V(this.columnMetadata, { isUnique: !0 }));
	}
	primaryKey() {
		return new e(this.typeBuilder, V(this.columnMetadata, { isPrimaryKey: !0 }));
	}
	default(t) {
		return new e(this.typeBuilder, V(this.columnMetadata, { defaultValue: t }));
	}
	name(t) {
		return new e(this.typeBuilder, V(this.columnMetadata, { name: t }));
	}
}, rn = class e extends jt {
	index(t = "btree") {
		return new e(this.typeBuilder, V(this.columnMetadata, { indexType: t }));
	}
	unique() {
		return new e(this.typeBuilder, V(this.columnMetadata, { isUnique: !0 }));
	}
	primaryKey() {
		return new e(this.typeBuilder, V(this.columnMetadata, { isPrimaryKey: !0 }));
	}
	default(t) {
		return new e(this.typeBuilder, V(this.columnMetadata, { defaultValue: t }));
	}
	name(t) {
		return new e(this.typeBuilder, V(this.columnMetadata, { name: t }));
	}
}, an = class e extends jt {
	index(t = "btree") {
		return new e(this.typeBuilder, V(this.columnMetadata, { indexType: t }));
	}
	unique() {
		return new e(this.typeBuilder, V(this.columnMetadata, { isUnique: !0 }));
	}
	primaryKey() {
		return new e(this.typeBuilder, V(this.columnMetadata, { isPrimaryKey: !0 }));
	}
	default(t) {
		return new e(this.typeBuilder, V(this.columnMetadata, { defaultValue: t }));
	}
	name(t) {
		return new e(this.typeBuilder, V(this.columnMetadata, { name: t }));
	}
}, on = class e extends jt {
	index(t = "btree") {
		return new e(this.typeBuilder, V(this.columnMetadata, { indexType: t }));
	}
	unique() {
		return new e(this.typeBuilder, V(this.columnMetadata, { isUnique: !0 }));
	}
	primaryKey() {
		return new e(this.typeBuilder, V(this.columnMetadata, { isPrimaryKey: !0 }));
	}
	default(t) {
		return new e(this.typeBuilder, V(this.columnMetadata, { defaultValue: t }));
	}
	name(t) {
		return new e(this.typeBuilder, V(this.columnMetadata, { name: t }));
	}
}, sn = class e extends jt {
	index(t = "btree") {
		return new e(this.typeBuilder, V(this.columnMetadata, { indexType: t }));
	}
	unique() {
		return new e(this.typeBuilder, V(this.columnMetadata, { isUnique: !0 }));
	}
	primaryKey() {
		return new e(this.typeBuilder, V(this.columnMetadata, { isPrimaryKey: !0 }));
	}
	default(t) {
		return new e(this.typeBuilder, V(this.columnMetadata, { defaultValue: t }));
	}
	name(t) {
		return new e(this.typeBuilder, V(this.columnMetadata, { name: t }));
	}
}, cn = class extends Qe {
	ref;
	__spacetimeType;
	constructor(e) {
		super(F.Ref(e)), this.ref = e;
	}
}, U = {
	bool: () => new pt(),
	string: () => new mt(),
	number: () => new ft(),
	i8: () => new at(),
	u8: () => new $e(),
	i16: () => new ot(),
	u16: () => new et(),
	i32: () => new st(),
	u32: () => new tt(),
	i64: () => new ct(),
	u64: () => new nt(),
	i128: () => new lt(),
	u128: () => new rt(),
	i256: () => new ut(),
	u256: () => new it(),
	f32: () => new dt(),
	f64: () => new ft(),
	object: ((e, t) => {
		if (typeof e == "string") {
			if (!t) throw TypeError("When providing a name, you must also provide the object.");
			return new vt(t, e);
		}
		return new vt(e, void 0);
	}),
	row: ((e, t) => {
		let [n, r] = typeof e == "string" ? [t, e] : [e, void 0];
		return new xt(n, r);
	}),
	array(e) {
		return new ht(e);
	},
	enum: ((e, t) => {
		let n = e, r;
		if (typeof e == "string") {
			if (!t) throw TypeError("When providing a name, you must also provide the variants object or array.");
			n = t, r = e;
		}
		if (Array.isArray(n)) {
			let e = {};
			for (let t of n) e[t] = new bt();
			return new wt(e, r);
		}
		return new Ct(n, r);
	}),
	unit() {
		return new bt();
	},
	lazy(e) {
		let t = null, n = () => t ??= e();
		return new Proxy({}, {
			get(e, t, r) {
				let i = n(), a = Reflect.get(i, t, r);
				return typeof a == "function" ? a.bind(i) : a;
			},
			set(e, t, r, i) {
				return Reflect.set(n(), t, r, i);
			},
			has(e, t) {
				return t in n();
			},
			ownKeys() {
				return Reflect.ownKeys(n());
			},
			getOwnPropertyDescriptor(e, t) {
				return Object.getOwnPropertyDescriptor(n(), t);
			},
			getPrototypeOf() {
				return Object.getPrototypeOf(n());
			}
		});
	},
	scheduleAt: () => new Tt(),
	option(e) {
		return new _t(e);
	},
	result(e, t) {
		return new yt(e, t);
	},
	identity: () => new Et(),
	connectionId: () => new Dt(),
	timestamp: () => new Ot(),
	timeDuration: () => new kt(),
	uuid: () => new At(),
	byteArray: () => new gt()
}, ln = U.object("BsatnRowList", {
	get sizeHint() {
		return En;
	},
	rowsData: U.byteArray()
}), un = U.object("CallProcedure", {
	requestId: U.u32(),
	flags: U.u8(),
	procedure: U.string(),
	args: U.byteArray()
}), dn = U.object("CallReducer", {
	requestId: U.u32(),
	flags: U.u8(),
	reducer: U.string(),
	args: U.byteArray()
}), fn = U.enum("ClientMessage", {
	get Subscribe() {
		return kn;
	},
	get Unsubscribe() {
		return Bn;
	},
	get OneOffQuery() {
		return hn;
	},
	get CallReducer() {
		return dn;
	},
	get CallProcedure() {
		return un;
	},
	get SubscribeBatch() {
		return jn;
	}
}), pn = U.object("EventTableRows", { get events() {
	return ln;
} }), mn = U.object("InitialConnection", {
	identity: U.identity(),
	connectionId: U.connectionId(),
	token: U.string()
}), hn = U.object("OneOffQuery", {
	requestId: U.u32(),
	queryString: U.string()
}), gn = U.object("OneOffQueryResult", {
	requestId: U.u32(),
	get result() {
		return U.result(bn, U.string());
	}
}), _n = U.object("PersistentTableRows", {
	get inserts() {
		return ln;
	},
	get deletes() {
		return ln;
	}
}), vn = U.object("ProcedureResult", {
	get status() {
		return yn;
	},
	timestamp: U.timestamp(),
	totalHostExecutionDuration: U.timeDuration(),
	requestId: U.u32()
}), yn = U.enum("ProcedureStatus", {
	Returned: U.byteArray(),
	InternalError: U.string()
}), bn = U.object("QueryRows", { get tables() {
	return U.array(On);
} }), xn = U.object("QuerySetId", { id: U.u32() }), Sn = U.object("QuerySetUpdate", {
	get querySetId() {
		return xn;
	},
	get tables() {
		return U.array(Ln);
	}
}), Cn = U.object("ReducerOk", {
	retValue: U.byteArray(),
	get transactionUpdate() {
		return zn;
	}
}), wn = U.enum("ReducerOutcome", {
	get Ok() {
		return Cn;
	},
	OkEmpty: U.unit(),
	Err: U.byteArray(),
	InternalError: U.string()
}), Tn = U.object("ReducerResult", {
	requestId: U.u32(),
	timestamp: U.timestamp(),
	get result() {
		return wn;
	}
}), En = U.enum("RowSizeHint", {
	FixedSize: U.u16(),
	RowOffsets: U.array(U.u64())
}), Dn = U.enum("ServerMessage", {
	get InitialConnection() {
		return mn;
	},
	get SubscribeApplied() {
		return An;
	},
	get UnsubscribeApplied() {
		return Vn;
	},
	get SubscriptionError() {
		return In;
	},
	get TransactionUpdate() {
		return zn;
	},
	get OneOffQueryResult() {
		return gn;
	},
	get ReducerResult() {
		return Tn;
	},
	get ProcedureResult() {
		return vn;
	},
	get SubscribeBatchApplied() {
		return Mn;
	}
}), On = U.object("SingleTableRows", {
	table: U.string(),
	get rows() {
		return ln;
	}
}), kn = U.object("Subscribe", {
	requestId: U.u32(),
	get querySetId() {
		return xn;
	},
	queryStrings: U.array(U.string())
}), An = U.object("SubscribeApplied", {
	requestId: U.u32(),
	get querySetId() {
		return xn;
	},
	get rows() {
		return bn;
	}
}), jn = U.object("SubscribeBatch", {
	requestId: U.u32(),
	get sets() {
		return U.array(Nn);
	}
}), Mn = U.object("SubscribeBatchApplied", {
	requestId: U.u32(),
	get results() {
		return U.array(Fn);
	}
}), Nn = U.object("SubscribeSet", {
	get querySetId() {
		return xn;
	},
	queryStrings: U.array(U.string())
}), Pn = U.enum("SubscribeSetOutcome", {
	get Applied() {
		return bn;
	},
	Error: U.string()
}), Fn = U.object("SubscribeSetResult", {
	get querySetId() {
		return xn;
	},
	get outcome() {
		return Pn;
	}
}), In = U.object("SubscriptionError", {
	requestId: U.option(U.u32()),
	get querySetId() {
		return xn;
	},
	error: U.string()
}), Ln = U.object("TableUpdate", {
	tableName: U.string(),
	get rows() {
		return U.array(Rn);
	}
}), Rn = U.enum("TableUpdateRows", {
	get PersistentTable() {
		return _n;
	},
	get EventTable() {
		return pn;
	}
}), zn = U.object("TransactionUpdate", { get querySets() {
	return U.array(Sn);
} }), Bn = U.object("Unsubscribe", {
	requestId: U.u32(),
	get querySetId() {
		return xn;
	},
	get flags() {
		return Hn;
	}
}), Vn = U.object("UnsubscribeApplied", {
	requestId: U.u32(),
	get querySetId() {
		return xn;
	},
	get rows() {
		return U.option(bn);
	}
}), Hn = U.enum("UnsubscribeFlags", {
	Default: U.unit(),
	SendDroppedRows: U.unit()
}), Un = class {
	#e = /* @__PURE__ */ new Map();
	on(e, t) {
		let n = this.#e.get(e);
		n || (n = /* @__PURE__ */ new Set(), this.#e.set(e, n)), n.add(t);
	}
	off(e, t) {
		let n = this.#e.get(e);
		n && n.delete(t);
	}
	emit(e, ...t) {
		let n = this.#e.get(e);
		if (n) for (let e of n) e(...t);
	}
}, Wn = {
	component: "📦",
	info: "ℹ️",
	warn: "⚠️",
	error: "❌",
	debug: "🐛",
	trace: "🔍"
}, Gn = {
	component: "color: #fff; background-color: #8D6FDD; padding: 2px 5px; border-radius: 3px;",
	info: "color: #fff; background-color: #007bff; padding: 2px 5px; border-radius: 3px;",
	warn: "color: #fff; background-color: #ffc107; padding: 2px 5px; border-radius: 3px;",
	error: "color: #fff; background-color: #dc3545; padding: 2px 5px; border-radius: 3px;",
	debug: "color: #fff; background-color: #28a745; padding: 2px 5px; border-radius: 3px;",
	trace: "color: #fff; background-color: #17a2b8; padding: 2px 5px; border-radius: 3px;"
}, Kn = {
	component: "color: #8D6FDD;",
	info: "color: #007bff;",
	warn: "color: #ffc107;",
	error: "color: #dc3545;",
	debug: "color: #28a745;",
	trace: "color: #17a2b8;"
}, qn = {
	error: 0,
	warn: 1,
	info: 2,
	debug: 3,
	trace: 4
}, Jn = "info", Yn = (e) => qn[e] <= qn[Jn], Xn = (e) => typeof e == "function" ? e() : e, Zn = (e) => Array.from(e).map((e) => e.toString(16).padStart(2, "0")).join(""), Qn = 25, $n = 10, er = /* @__PURE__ */ new Set([
	"token",
	"authToken",
	"authorization",
	"accessToken",
	"refreshToken"
]), tr = (e) => p(e, (e, t) => {
	if (er.has(e)) return "[REDACTED]";
	if (t && typeof t == "object" && "__identity__" in t && typeof t.__identity__ == "bigint") return A(t.__identity__);
	if (t && typeof t == "object" && "__connection_id__" in t && typeof t.__connection_id__ == "bigint") return O(t.__connection_id__);
	if (t instanceof Uint8Array) {
		if (t.length < 25) return `0x${Zn(t)}`;
		let e = t.subarray(0, 10);
		return `Uint8Array(len=${t.length}, head=0x${Zn(e)})`;
	}
	if (Array.isArray(t) && t.length >= Qn) {
		let e = p(t.slice(0, $n));
		return `Array(len=${t.length}, head=${e ?? "[]"})`;
	}
	return t;
}), nr = (e, t, ...n) => {
	if (!Yn(e)) return;
	let r = Xn(t), i = n.map(Xn);
	console.log(`%c${Wn[e]} ${e.toUpperCase()}%c ${r}`, Gn[e], Kn[e], ...i);
}, rr = (e, t) => e === t ? 0 : e < t ? -1 : 1, ir = class {
	hasPrimaryKey;
	rows;
	tableDef;
	emitter;
	constructor(e) {
		this.tableDef = e, this.rows = /* @__PURE__ */ new Map(), this.emitter = new Un(), this.hasPrimaryKey = Object.values(this.tableDef.columns).some((e) => e.columnMetadata.isPrimaryKey === !0);
		for (let e of this.tableDef.resolvedIndexes) {
			let t = this.#e(this.tableDef, e);
			this[e.name] = t;
		}
	}
	#e(e, t) {
		if (t.algorithm !== "btree") throw Error("Only btree indexes are supported in TableCacheImpl");
		let n = t.columns, r = (e) => n.map((t) => e[t]), i = (e, t) => {
			let n = r(e), i = Array.isArray(t) ? t : [t], a = Math.max(0, i.length - 1);
			for (let e = 0; e < a; e++) if (!b(n[e], i[e])) return !1;
			let o = i[i.length - 1], s = n[a];
			if (o && typeof o == "object" && "from" in o && "to" in o) {
				let e = o.from, t = o.to;
				if (e.tag !== "unbounded") {
					let t = rr(s, e.value);
					if (t < 0 || t === 0 && e.tag === "excluded") return !1;
				}
				if (t.tag !== "unbounded") {
					let e = rr(s, t.value);
					if (e > 0 || e === 0 && t.tag === "excluded") return !1;
				}
				return !0;
			}
			return !!b(s, o);
		}, a = e.constraints.some((e) => e.constraint === "unique" && b(e.columns, t.columns)), o = this;
		return a ? { find: (e) => {
			let t = Array.isArray(e) ? e : [e];
			for (let e of o.iter()) if (b(r(e), t)) return e;
			return null;
		} } : { *filter(e) {
			for (let t of o.iter()) i(t, e) && (yield t);
		} };
	}
	count() {
		return BigInt(this.rows.size);
	}
	iter() {
		function* e(e) {
			for (let [t] of e.values()) yield t;
		}
		return e(this.rows);
	}
	[Symbol.iterator]() {
		return this.iter();
	}
	snapshotDeleteOperations = () => {
		let e = [];
		for (let [t, [n, r]] of this.rows) for (let i = 0; i < r; i++) e.push({
			type: "delete",
			rowId: t,
			row: n
		});
		return e;
	};
	applyOperations = (e, t, n) => {
		let r = [];
		if (this.tableDef.isEvent) {
			for (let n of e) n.type === "insert" && r.push({
				type: "insert",
				table: this.tableDef.sourceName,
				cb: () => {
					this.emitter.emit("insert", t, n.row);
				}
			});
			return r;
		}
		if (this.hasPrimaryKey || n?.skipIdenticalUpdates) {
			let i = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Map();
			for (let t of e) if (t.type === "insert") {
				let [e, n] = i.get(t.rowId) || [t, 0];
				i.set(t.rowId, [t, n + 1]);
			} else {
				let [e, n] = a.get(t.rowId) || [t, 0];
				a.set(t.rowId, [t, n + 1]);
			}
			for (let [e, [o, s]] of i) {
				let i = a.get(e);
				if (i) {
					let [c, l] = i, u = s - l, d = this.update(t, e, o.row, u, n?.skipIdenticalUpdates);
					d && r.push(d), a.delete(e);
				} else {
					let e = this.insert(t, o, s);
					e && r.push(e);
				}
			}
			for (let [e, n] of a.values()) {
				let i = this.delete(t, e, n);
				i && r.push(i);
			}
		} else for (let n of e) if (n.type === "insert") {
			let e = this.insert(t, n);
			e && r.push(e);
		} else {
			let e = this.delete(t, n);
			e && r.push(e);
		}
		return r;
	};
	update = (e, t, n, r = 0, i = !1) => {
		let a = this.rows.get(t);
		if (!a) {
			nr("error", `Updating a row that was not present in the cache. Table: ${this.tableDef.sourceName}, RowId: ${t}`);
			return;
		}
		let [o, s] = a, c = Math.max(1, s + r);
		if (s + r <= 0) nr("error", `Negative reference count for in table ${this.tableDef.sourceName} row ${t} (${s} + ${r})`);
		else if (this.rows.set(t, [n, c]), !(i && b(o, n))) return s === 0 ? (nr("error", `Updating a row id in table ${this.tableDef.sourceName} which was not present in the cache (rowId: ${t})`), {
			type: "insert",
			table: this.tableDef.sourceName,
			cb: () => {
				this.emitter.emit("insert", e, n);
			}
		}) : {
			type: "update",
			table: this.tableDef.sourceName,
			cb: () => {
				this.emitter.emit("update", e, o, n);
			}
		};
	};
	insert = (e, t, n = 1) => {
		let [r, i] = this.rows.get(t.rowId) || [t.row, 0];
		if (this.rows.set(t.rowId, [t.row, i + n]), i === 0) return {
			type: "insert",
			table: this.tableDef.sourceName,
			cb: () => {
				this.emitter.emit("insert", e, t.row);
			}
		};
	};
	delete = (e, t, n = 1) => {
		let [r, i] = this.rows.get(t.rowId) || [t.row, 0];
		if (i === 0) nr("warn", "Deleting a row that was not present in the cache");
		else {
			if (i <= n) return this.rows.delete(t.rowId), {
				type: "delete",
				table: this.tableDef.sourceName,
				cb: () => {
					this.emitter.emit("delete", e, t.row);
				}
			};
			this.rows.set(t.rowId, [t.row, i - n]);
		}
	};
	onInsert = (e) => {
		this.emitter.on("insert", e);
	};
	onDelete = (e) => {
		this.emitter.on("delete", e);
	};
	onUpdate = (e) => {
		this.emitter.on("update", e);
	};
	removeOnInsert = (e) => {
		this.emitter.off("insert", e);
	};
	removeOnDelete = (e) => {
		this.emitter.off("delete", e);
	};
	removeOnUpdate = (e) => {
		this.emitter.off("update", e);
	};
}, ar = class {
	map = /* @__PURE__ */ new Map();
	get(e) {
		return this.map.get(e);
	}
	set(e, t) {
		return this.map.set(e, t), this;
	}
	has(e) {
		return this.map.has(e);
	}
	delete(e) {
		return this.map.delete(e);
	}
	keys() {
		return this.map.keys();
	}
	values() {
		return this.map.values();
	}
	entries() {
		return this.map.entries();
	}
	[Symbol.iterator]() {
		return this.entries();
	}
}, or = class {
	tables = new ar();
	getTable(e) {
		let t = this.tables.get(e);
		if (!t) throw console.error("The table has not been registered for this client. Please register the table before using it. If you have registered global tables using the SpacetimeDBClient.registerTables() or `registerTable()` method, please make sure that is executed first!"), Error(`Table ${String(e)} does not exist`);
		return t;
	}
	getOrCreateTable(e) {
		let t = e.accessorName, n = this.tables.get(t);
		if (n) return n;
		let r = new ir(e);
		return this.tables.set(t, r), r;
	}
};
function sr(e, t) {
	let n = Math.min(e.length, t.length);
	for (let r = 0; r < n; r++) {
		let n = e[r], i = t[r];
		if (n !== i) return typeof n == "number" && typeof i == "number" ? n - i : typeof n == "string" && typeof i == "string" ? n.localeCompare(i) : typeof n == "string" ? 1 : -1;
	}
	return e.length - t.length;
}
var cr = class e {
	major;
	minor;
	patch;
	preRelease;
	buildInfo;
	constructor(e, t, n, r = null, i = null) {
		this.major = e, this.minor = t, this.patch = n, this.preRelease = r, this.buildInfo = i;
	}
	toString() {
		let e = `${this.major}.${this.minor}.${this.patch}`;
		return this.preRelease && (e += `-${this.preRelease.join(".")}`), this.buildInfo && (e += `+${this.buildInfo}`), e;
	}
	compare(e) {
		return this.major === e.major ? this.minor === e.minor ? this.patch === e.patch ? this.preRelease && e.preRelease ? sr(this.preRelease, e.preRelease) : this.preRelease || e.preRelease ? -1 : 0 : this.patch - e.patch : this.minor - e.minor : this.major - e.major;
	}
	clone() {
		return new e(this.major, this.minor, this.patch, this.preRelease ? [...this.preRelease] : null, this.buildInfo);
	}
	static parseVersionString(t) {
		let n = t.match(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([\da-zA-Z-]+(?:\.[\da-zA-Z-]+)*))?(?:\+([\da-zA-Z-]+(?:\.[\da-zA-Z-]+)*))?$/);
		if (!n) throw Error(`Invalid version string: ${t}`);
		let r = parseInt(n[1], 10), i = parseInt(n[2], 10), a = parseInt(n[3], 10), o = n[4] ? n[4].split(".").map((e) => isNaN(Number(e)) ? e : Number(e)) : null, s = n[5] || null;
		return new e(r, i, a, o, s);
	}
}, lr = new cr(1, 4, 0);
function ur(e) {
	if (e === void 0 || cr.parseVersionString(e).compare(lr) < 0) throw Error(dr(e));
}
function dr(e) {
	return `Module code was generated with an incompatible version of the spacetimedb cli (${e}). Update the cli version to at least ${lr.toString()} and regenerate the bindings. You can upgrade to the latest cli version by running: spacetime version upgrade`;
}
async function fr(e, t, n = 131072) {
	let r = 0, i = new ReadableStream({ pull(t) {
		if (r < e.length) {
			let i = e.subarray(r, Math.min(r + n, e.length));
			t.enqueue(i), r += n;
		} else t.close();
	} }), a = new DecompressionStream(t), o = i.pipeThrough(a).getReader(), s = [], c = 0, l;
	for (; !(l = await o.read()).done;) s.push(l.value), c += l.value.length;
	let u = new Uint8Array(c), d = 0;
	for (let e of s) u.set(e, d), d += e.length;
	return u;
}
async function pr() {
	if (typeof WebSocket < "u") return WebSocket;
	let e = Function("m", "return import(m)");
	try {
		let { WebSocket: t } = await e("undici");
		return t;
	} catch (e) {
		throw nr("warn", "[spacetimedb-sdk] No global WebSocket found. On Node 18–21, please install `undici` (npm install undici) to enable WebSocket support."), e;
	}
}
var mr = class extends Error {
	constructor(e, t) {
		super(`Failed to verify token: ${e} ${t}`), this.status = e, this.name = "WebSocketTokenError";
	}
};
async function hr({ url: e, nameOrAddress: t, wsProtocol: n, authToken: r, compression: i, lightMode: a, confirmedReads: o, connectionId: s, sessionId: c }) {
	let l = new Headers(), u = await pr(), d;
	if (r) {
		l.set("Authorization", `Bearer ${r}`);
		let t = new URL("v1/identity/websocket-token", e);
		t.protocol = e.protocol === "wss:" ? "https:" : "http:";
		let n = await fetch(t, {
			method: "POST",
			headers: l
		});
		if (n.ok) {
			let { token: e } = await n.json();
			d = e;
		} else throw new mr(n.status, n.statusText);
	}
	let f = new URL(`v1/database/${t}/subscribe`, e);
	d && f.searchParams.set("token", d), f.searchParams.set("compression", {
		gzip: "Gzip",
		brotli: "Brotli",
		none: "None"
	}[i] ?? "None"), a && f.searchParams.set("light", "true"), o !== void 0 && f.searchParams.set("confirmed", o.toString()), s && f.searchParams.set("connection_id", s), c && f.searchParams.set("session_id", c);
	let p = new u(f.toString(), n);
	return p.binaryType = "arraybuffer", p;
}
var gr = class e {
	get protocol() {
		return this.#e.protocol;
	}
	get readyState() {
		return this.#e.readyState;
	}
	set onclose(e) {
		this.#e.onclose = e;
	}
	set onopen(e) {
		this.#e.onopen = e;
	}
	set onmessage(e) {
		let t = Promise.resolve();
		this.#e.onmessage = async (n) => {
			let r = this.#t(new Uint8Array(n.data));
			r.catch(() => {});
			let i = t, a;
			t = new Promise((e) => {
				a = e;
			});
			try {
				await i;
				let t;
				try {
					t = await r;
				} catch (e) {
					console.error("[SpacetimeDB] WebSocket decompress failed, closing socket:", e), this.#e.close();
					return;
				}
				e({ data: t });
			} finally {
				a();
			}
		};
	}
	set onerror(e) {
		this.#e.onerror = e;
	}
	#e;
	async #t(e) {
		let t = e[0], n = e.subarray(1);
		switch (t) {
			case 0: return n;
			case 1: return await fr(n, "brotli");
			case 2: return await fr(n, "gzip");
			default: throw Error("Unexpected Compression Algorithm. Please use `gzip` or `none`");
		}
	}
	send(e) {
		this.#e.send(e);
	}
	close() {
		this.#e.close();
	}
	constructor(e) {
		this.#e = e;
	}
	static async openWebSocket(t) {
		return new e(await hr(t));
	}
}, _r = class {
	constructor(e, t) {
		this.remoteModule = e, this.dbConnectionCtor = t, this.#d = gr.openWebSocket;
	}
	#e;
	#t;
	#n;
	#r;
	#i = new Un();
	#a = "gzip";
	#o = !1;
	#s;
	#c = !1;
	#l;
	#u;
	#d;
	withUri(e) {
		return this.#e = new URL(e), this;
	}
	withDatabaseName(e) {
		return this.#t = e, this;
	}
	withToken(e) {
		return this.#r = e, this;
	}
	withWSFn(e) {
		return this.#d = e, this;
	}
	withCompression(e) {
		if (e === "brotli") try {
			new DecompressionStream("brotli");
		} catch (e) {
			throw TypeError("Brotli compression is not supported by the runtime. Please choose a different compression method.", { cause: e });
		}
		return this.#a = e, this;
	}
	withLightMode(e) {
		return this.#o = e, this;
	}
	withConfirmedReads(e) {
		return this.#s = e, this;
	}
	withAutomaticReconnect(e) {
		return this.#c = !0, e && (this.#l = Rr(e)), this;
	}
	withTokenProvider(e) {
		return this.#u = e, this;
	}
	onConnect(e) {
		return this.#i.on("connect", e), this;
	}
	onAutomaticReconnect(e) {
		return this.#i.on("automaticReconnect", e), this;
	}
	onConnectError(e) {
		return this.#i.on("connectError", e), this;
	}
	onDisconnect(e) {
		return this.#i.on("disconnect", e), this;
	}
	getUri() {
		return this.#e?.toString() ?? "";
	}
	getModuleName() {
		return this.#t ?? "";
	}
	build() {
		if (!this.#e) throw Error("URI is required to connect to SpacetimeDB");
		if (!this.#t) throw Error("Database name or address is required to connect to SpacetimeDB");
		return ur(this.remoteModule.versionInfo?.cliVersion), this.dbConnectionCtor({
			uri: this.#e,
			nameOrAddress: this.#t,
			identity: this.#n,
			token: this.#r,
			emitter: this.#i,
			compression: this.#a,
			lightMode: this.#o,
			confirmedReads: this.#s,
			createWSFn: this.#d,
			remoteModule: this.remoteModule,
			automaticReconnect: this.#c,
			reconnectPolicy: this.#l,
			tokenProvider: this.#u
		});
	}
}, vr = Symbol("INTERNAL_REMOTE_MODULE"), yr = class {
	constructor(e) {
		this.db = e;
	}
	#e = void 0;
	#t = void 0;
	onApplied(e) {
		return this.#e = e, this;
	}
	onError(e) {
		return this.#t = e, this;
	}
	subscribe(e) {
		let t;
		if (typeof e == "function") {
			let n = e(this.db.getFromBuilder());
			t = Array.isArray(n) ? n : [n];
		} else t = Array.isArray(e) ? e : [e];
		if (t.length === 0) throw Error("Subscriptions must have at least one query");
		let n = t.map((e) => {
			if (typeof e == "string") return e;
			if (Ae(e)) return je(e);
			throw Error("Subscriptions must be SQL strings or typed queries");
		});
		return new xr(this.db, n, this.#e, this.#t);
	}
	subscribeToAllTables() {
		let e = this.db[vr](), t = new Set(e.viewsWithArgs), n = Object.values(e.tables).filter((e) => !t.has(e.sourceName)).map((e) => `SELECT * FROM ${e.sourceName}`);
		this.subscribe(n);
	}
}, br = class {
	subscriptions = /* @__PURE__ */ new Map();
}, xr = class {
	constructor(e, t, n, r) {
		this.db = e, this.#i.on("applied", (e) => {
			this.#r = !0, n && n(e);
		}), this.#i.on("error", (e, t) => {
			this.#r = !1, this.#n = !0, r && r(e, t);
		}), this.#e = this.db.registerSubscription(this, this.#i, t);
	}
	#e;
	#t = !1;
	#n = !1;
	#r = !1;
	#i = new Un();
	rebindQuerySetId(e) {
		this.#e = e;
	}
	unsubscribe() {
		if (this.#t) throw Error("Unsubscribe has already been called");
		this.#t = !0, this.#i.on("end", (e) => {
			this.#n = !0, this.#r = !1;
		}), this.db.unregisterSubscription(this.#e);
	}
	unsubscribeThen(e) {
		if (this.#n) throw Error("Subscription has already ended");
		if (this.#t) throw Error("Unsubscribe has already been called");
		this.#t = !0, this.#i.on("end", (t) => {
			this.#n = !0, this.#r = !1, e(t);
		}), this.db.unregisterSubscription(this.#e);
	}
	isEnded() {
		return this.#n;
	}
	isActive() {
		return this.#r;
	}
}, Sr = "v2.bsatn.spacetimedb", Cr = "v3.bsatn.spacetimedb", wr = [Cr, Sr];
function Tr(e) {
	return e === Cr ? Cr : (e === "" || e === Sr || nr("warn", `Unexpected websocket subprotocol "${e}", falling back to ${Sr}.`), Sr);
}
var Er = "v3 websocket payloads must contain at least one message";
function Dr(e) {
	if (e.length === 0) throw RangeError(Er);
}
function Or(e, t) {
	if (Dr(e), t < 1 || t > e.length) throw RangeError(`v3 websocket payload requested ${t} messages from ${e.length}`);
}
function kr(e, t, n = t.length) {
	Or(t, n), e.clear();
	for (let r = 0; r < n; r++) e.writeBytes(t[r]);
	return e.getBuffer();
}
function Ar(e, t) {
	Dr(e);
	let n = e[0];
	if (n.length > t) return 1;
	let r = 1, i = n.length;
	for (; r < e.length;) {
		let n = e[r], a = i + n.length;
		if (a > t) break;
		i = a, r += 1;
	}
	return r;
}
function jr(e, t, n = t.length) {
	return kr(e, t, n);
}
function Mr(e, t, n) {
	if (e.reset(t), e.remaining === 0) throw RangeError(Er);
	let r = 0;
	for (; e.remaining > 0;) n(Dn.deserialize(e)), r += 1;
	return r;
}
var Nr = 1e3, Pr = 3e4, Fr = .5, Ir = 1e3, Lr = {
	minDelayMs: Nr,
	maxDelayMs: Pr
};
function Rr(e = {}) {
	let { minDelayMs: t = Nr, maxDelayMs: n = Pr } = e;
	t >= 500 || (nr("warn", `Reconnect minDelayMs ${t} is below the 500 ms floor; using 500 ms.`), t = 500);
	let r = Math.max(Ir, t);
	return n >= r || (nr("warn", `Reconnect maxDelayMs ${n} is below the ${r} ms floor; using ${r} ms.`), n = r), {
		minDelayMs: t,
		maxDelayMs: n
	};
}
var zr = .05, Br = 3e4;
function Vr(e, t = Math.random, { minDelayMs: n, maxDelayMs: r } = Lr) {
	let i = Math.min(n * 2 ** Math.max(0, e - 1), r) * (1 + Fr * (2 * t() - 1));
	return Math.max(n, Math.min(i, r));
}
function Hr(e, t = Date.now()) {
	if (!e) return !0;
	let n = Jr(e);
	if (n === void 0 || n.exp === void 0) return !0;
	let r = n.exp * 1e3, i = n.iat === void 0 ? void 0 : r - n.iat * 1e3, a = Math.max(Br, i === void 0 ? 0 : i * zr);
	return r - t <= a;
}
function Ur(e, t) {
	if (e instanceof Error) return e;
	if (typeof e == "object" && e) {
		let t = "message" in e ? e.message : void 0, n = "error" in e ? e.error : void 0;
		if (n instanceof Error) return n;
		if (typeof t == "string" && t.length > 0) return Error(t, { cause: e });
	}
	return Error(t, { cause: e });
}
function Wr(e) {
	return e instanceof we || e instanceof Kr;
}
function Gr(e) {
	return e instanceof mr && (e.status === 401 || e.status === 403);
}
var Kr = class extends Error {}, qr = 4e3;
function Jr(e) {
	let t = e.split(".");
	if (!(t.length < 2)) try {
		let e = t[1].replace(/-/g, "+").replace(/_/g, "/"), n = e.padEnd(e.length + (4 - e.length % 4) % 4, "="), r = typeof atob == "function" ? atob(n) : Buffer.from(n, "base64").toString("binary"), i = JSON.parse(r);
		if (typeof i != "object" || !i) return;
		let a = "exp" in i ? i.exp : void 0, o = "iat" in i ? i.iat : void 0;
		return {
			exp: typeof a == "number" && Number.isFinite(a) ? a : void 0,
			iat: typeof o == "number" && Number.isFinite(o) ? o : void 0
		};
	} catch {
		return;
	}
}
var Yr = new TextEncoder();
function Xr() {
	let e, t;
	return {
		promise: new Promise((n, r) => {
			e = n, t = r;
		}),
		resolve: e,
		reject: t
	};
}
function Zr(e) {
	if (fn.algebraicType.tag !== "Sum") throw TypeError("ClientMessage must be a sum type");
	let t = fn.algebraicType.value.variants.findIndex((t) => t.name === e);
	if (t === -1) throw RangeError(`Unknown ClientMessage variant: ${e}`);
	return t;
}
var Qr = Zr("CallReducer"), $r = Zr("CallProcedure"), ei = 262144, ti = 2, ni = 3, ri = class {
	isActive = !1;
	isDisconnectRequested = !1;
	#e = void 0;
	get isSocketClosed() {
		let e = this.ws;
		return e ? e.readyState === ti || e.readyState === ni : !1;
	}
	identity = void 0;
	token = void 0;
	[vr]() {
		return this.#P;
	}
	db;
	reducers;
	procedures;
	connectionId = L.random();
	#t = this.connectionId.toHexString();
	#n = L.random().toHexString();
	#r;
	#i;
	#a;
	#o;
	#s;
	#c;
	#l;
	#u;
	#d;
	#f = 0;
	#p = !1;
	#m = !1;
	#h = 0;
	#g;
	#_ = !1;
	#v = !1;
	#y;
	#b;
	#x = !1;
	#S = !1;
	#C = 0;
	#w = 0;
	#T = 0;
	#E;
	#D = [];
	#O = 0;
	#k = !1;
	#A = [];
	#j = !1;
	#M = Sr;
	#N = new br();
	#P;
	#F = /* @__PURE__ */ new Map();
	#I = /* @__PURE__ */ new Map();
	#L = /* @__PURE__ */ new Map();
	#R = /* @__PURE__ */ new Map();
	#z;
	#B;
	#V;
	#H;
	#U;
	#W;
	#G;
	#K = new h(/* @__PURE__ */ new Uint8Array());
	#q = new h(/* @__PURE__ */ new Uint8Array());
	#J = new y(1024);
	#Y;
	#X;
	clientCache;
	ws;
	wsPromise;
	constructor({ uri: e, nameOrAddress: t, identity: n, token: r, emitter: i, remoteModule: a, createWSFn: o, compression: s, lightMode: c, confirmedReads: l, automaticReconnect: u, tokenProvider: d, reconnectPolicy: f }) {
		nr("info", "Connecting to SpacetimeDB WS...");
		let p = new URL(e.toString());
		/^wss?:/.test(e.protocol) || (p.protocol = p.protocol === "https:" ? "wss:" : "ws:"), this.identity = n, this.token = r, this.#P = a, this.#E = i, this.#Y = this.subscriptionBuilder.bind(this), this.#X = this.disconnect.bind(this), this.#z = /* @__PURE__ */ Object.create(null), this.#B = /* @__PURE__ */ Object.create(null), this.#G = /* @__PURE__ */ Object.create(null);
		for (let e of Object.values(a.tables)) {
			this.#z[e.sourceName] = ye.makeDeserializer(e.rowType), this.#G[e.sourceName] = e;
			let t = Object.entries(e.columns).find(([, e]) => e.columnMetadata.isPrimaryKey);
			this.#B[e.sourceName] = t ? {
				primaryKeyColName: t[0],
				primaryKeyColType: t[1].typeBuilder.algebraicType
			} : {};
		}
		this.#V = /* @__PURE__ */ Object.create(null), this.#U = /* @__PURE__ */ Object.create(null);
		for (let e of a.reducers) this.#V[e.name] = {
			serialize: ye.makeSerializer(e.paramsType),
			deserialize: ye.makeDeserializer(e.paramsType)
		}, this.#U[e.name] = Yr.encode(e.name);
		this.#H = /* @__PURE__ */ Object.create(null), this.#W = /* @__PURE__ */ Object.create(null);
		for (let e of a.procedures) this.#H[e.name] = {
			serializeArgs: ye.makeSerializer(new vt(e.params).algebraicType.value),
			deserializeReturn: F.makeDeserializer(e.returnType.algebraicType)
		}, this.#W[e.name] = Yr.encode(e.name);
		this.clientCache = new or(), this.db = this.#fe(), this.reducers = this.#pe(a), this.procedures = this.#me(a), this.#r = u ?? !1, this.#x = this.#r, this.#i = f ?? Lr, this.#a = d, this.#o = p, this.#s = t, this.#c = o, this.#l = s, this.#u = c, this.#d = l, this.wsPromise = this.#Z();
	}
	async #Z() {
		let e = ++this.#f;
		this.#p && this.#Re(L.random()), this.#v = !1;
		let t = new URL(this.#o.toString());
		t.searchParams.set("connection_id", this.#t);
		try {
			let n = await this.#Q();
			if (e !== this.#f || this.#m) return;
			this.token = n;
			let r = await this.#c({
				url: t,
				nameOrAddress: this.#s,
				wsProtocol: [...wr],
				authToken: n,
				compression: this.#l,
				lightMode: this.#u,
				confirmedReads: this.#d,
				connectionId: this.#t,
				sessionId: this.#r ? this.#n : void 0
			});
			if (e !== this.#f || this.#m) {
				r.close();
				return;
			}
			this.ws = r, this.#S = !1;
			let i = () => e === this.#f && !this.#m, a = (e, t) => {
				i() && (this.isActive = !1, this.#r ? this.#S ? this.#$(e) : this.#ee(e) : this.#E.emit(t ? "connectError" : "disconnect", this, t ? e : this.#e));
			};
			return r.onclose = (e) => {
				if (!i()) return;
				if (this.#r && this.#p && !this.#S && e.code === qr) {
					this.#oe();
					let e = this.#te(1);
					this.#E.emit("connectError", this, /* @__PURE__ */ Error("Session busy"), this.#h, e), this.#ne(this.#h, e);
					return;
				}
				let t = `WebSocket closed (code ${e.code}${e.reason ? `: ${e.reason}` : ""})`, n = [
					1002,
					1003,
					1007,
					1008
				].includes(e.code) ? new Kr(t) : Error(t);
				a(n, !1);
			}, r.onerror = (e) => {
				if (!i()) return;
				let t = Ur(e, "WebSocket error");
				!this.#r && this.#p ? (this.isActive = !1, this.#e = t, r.close()) : a(t, !0);
			}, r.onopen = () => {
				i() && this.#Be();
			}, r.onmessage = (e) => {
				i() && this.#Je(e);
			}, r;
		} catch (t) {
			if (e !== this.#f || this.#m) return;
			nr("error", "Error connecting to SpacetimeDB WS"), this.isActive = !1, this.#ee(Ur(t, "Failed to connect"));
			return;
		}
	}
	async #Q() {
		if (!this.#a || !this.#p || !this.#_ && !Hr(this.token)) return this.token;
		let e = await this.#a();
		return this.#_ = !1, this.#v = !0, e;
	}
	#$(e) {
		if (this.#m) return;
		if (this.#oe(), this.#ae(new R()), !(this.#r && !this.isDisconnectRequested && !(e instanceof Kr))) {
			this.#ie(e);
			return;
		}
		let t = this.#h + 1, n = this.#te(t);
		try {
			this.#E.emit("disconnect", this, e, t, n);
		} finally {
			this.#ne(t, n);
		}
	}
	#ee(e) {
		if (this.#m) return;
		if (this.#oe(), this.#ae(new R()), !(this.#r && this.#p && !this.isDisconnectRequested && !Wr(e) && !(Gr(e) && (!this.#a || this.#v)))) {
			this.#ie(void 0, { alreadyReported: !0 }), this.#E.emit("connectError", this, e);
			return;
		}
		this.#a && Gr(e) && (this.#_ = !0);
		let t = this.#h + 1, n = this.#te(t);
		try {
			this.#E.emit("connectError", this, e, t, n);
		} finally {
			this.#ne(t, n);
		}
	}
	#te(e) {
		return Vr(e, Math.random, this.#i);
	}
	#ne(e, t) {
		this.#m || this.isDisconnectRequested || (this.#h = e, this.#re(), this.#g = setTimeout(() => {
			this.#g = void 0, !(this.#m || this.isDisconnectRequested) && (this.wsPromise = this.#Z());
		}, t));
	}
	#re() {
		this.#g !== void 0 && (clearTimeout(this.#g), this.#g = void 0);
	}
	#ie(e, t) {
		this.#m || (this.#m = !0, this.isActive = !1, this.#re(), this.#oe(), this.#ce(), this.#ae(new R()), t?.alreadyReported || this.#E.emit("disconnect", this, e));
	}
	#ae(e) {
		let t = [...this.#R.values()];
		this.#R.clear(), this.#F.clear(), this.#I.clear(), this.#L.clear();
		for (let n of t) n(e);
	}
	get isReconnecting() {
		return this.#r && this.#p && !this.isActive && !this.#m;
	}
	#oe() {
		this.#f += 1, this.isActive = !1, this.#S = !1, this.#b = void 0, this.#x = this.#p, this.#A.length = 0, this.#D.length = 0;
		let e = this.ws;
		this.ws = void 0, e?.close();
		for (let [e, t] of this.#N.subscriptions) t.unsubscribeRequested && this.#ye(e);
	}
	#se() {
		if (!this.#r || this.#y) return;
		let e = typeof document < "u" ? document : void 0, t = typeof window < "u" ? window : void 0;
		if (!e && !t) return;
		let n = () => this.#le(), r = () => {
			e?.visibilityState === "visible" && n();
		};
		e?.addEventListener("visibilitychange", r), t?.addEventListener("focus", n), t?.addEventListener("online", n), t?.addEventListener("pageshow", n), this.#y = () => {
			e?.removeEventListener("visibilitychange", r), t?.removeEventListener("focus", n), t?.removeEventListener("online", n), t?.removeEventListener("pageshow", n), this.#y = void 0;
		};
	}
	#ce() {
		this.#y?.();
	}
	#le() {
		if (!(this.#m || this.isDisconnectRequested)) {
			if (this.isSocketClosed) {
				let e = /* @__PURE__ */ Error("WebSocket closed while suspended");
				this.#S ? this.#$(e) : this.#ee(e);
			} else this.#g !== void 0 && (this.#re(), this.wsPromise = this.#Z());
		}
	}
	#ue = () => {
		let e = this.#C;
		return this.#C += 1, e;
	};
	#de = () => this.#w++;
	#fe() {
		let e = /* @__PURE__ */ Object.create(null);
		for (let t of Object.values(this.#G)) {
			let [n, r] = Ze(e, t.accessorName);
			Object.defineProperty(n, r, {
				enumerable: !0,
				configurable: !1,
				get: () => this.clientCache.getOrCreateTable(t)
			});
		}
		return e;
	}
	#pe(e) {
		let t = {};
		for (let n of e.reducers) {
			let e = n.name, r = this.#U[e], [i, a] = Ze(t, n.accessorName), { serialize: o } = this.#V[e];
			i[a] = (t) => {
				let n = this.#je;
				n.clear(), o(n, t);
				let i = n.getBuffer();
				return this.#Ye(e, r, i, t);
			};
		}
		return t;
	}
	#me(e) {
		let t = {}, n = new y(1024);
		for (let r of e.procedures) {
			let e = r.name, i = this.#W[e], [a, o] = Ze(t, r.accessorName), { serializeArgs: s, deserializeReturn: c } = this.#H[e];
			a[o] = (t) => {
				n.clear(), s(n, t);
				let r = n.getBuffer();
				return this.#Ze(e, i, r).then((e) => c(new h(e)));
			};
		}
		return t;
	}
	#he(e) {
		return {
			db: this.db,
			reducers: this.reducers,
			isActive: this.isActive,
			subscriptionBuilder: this.#Y,
			disconnect: this.#X,
			event: e
		};
	}
	subscriptionBuilder = () => new yr(this);
	getFromBuilder() {
		return Le(this.#P.tables);
	}
	registerSubscription(e, t, n) {
		let r = this.#ue();
		return this.#N.subscriptions.set(r, {
			handle: e,
			emitter: t,
			querySql: [...n]
		}), this.#x || this.#ge(r, n), r;
	}
	#ge(e, t) {
		let n = this.#de();
		this.#Fe(fn.Subscribe({
			queryStrings: t,
			querySetId: { id: e },
			requestId: n
		}));
	}
	#_e() {
		let e = [...this.#N.subscriptions.entries()], t = [], n = /* @__PURE__ */ new Map();
		for (let [, r] of e) {
			let e = this.#ue();
			r.handle.rebindQuerySetId(e), n.set(e, r), t.push({
				querySetId: { id: e },
				queryStrings: r.querySql
			});
		}
		this.#N.subscriptions = n;
		let r = this.#de();
		this.#b = {
			requestId: r,
			querySetIds: new Set(n.keys())
		}, this.#x = !1, t.length === 0 ? this.#ve({
			requestId: r,
			results: []
		}) : this.#Fe(fn.SubscribeBatch({
			requestId: r,
			sets: t
		}));
	}
	#ve(e) {
		let t = this.#b, n = new Set(e.results.map((e) => e.querySetId.id));
		if (!t || t.requestId !== e.requestId || n.size !== e.results.length || n.size !== t.querySetIds.size || [...n].some((e) => !t.querySetIds.has(e))) {
			this.#qe(/* @__PURE__ */ Error("Unexpected subscription replay response"));
			return;
		}
		this.#b = void 0;
		let r = {
			id: this.#ze(),
			tag: "SubscribeApplied"
		}, i = this.#he(r), a = [];
		for (let e of Object.values(this.#G)) {
			let t = this.clientCache.tables.get(e.accessorName)?.snapshotDeleteOperations() ?? [];
			t.length > 0 && a.push({
				tableName: e.sourceName,
				operations: t
			});
		}
		let o = [];
		for (let t of e.results) {
			let e = this.#N.subscriptions.get(t.querySetId.id);
			e && (t.outcome.tag === "Error" ? (this.#N.subscriptions.delete(t.querySetId.id), o.push({
				entry: e,
				error: t.outcome.value
			})) : a.push(...this.#Se(t.outcome.value, "insert")));
		}
		let s = this.#xe(a), c = this.#Ve(s, i, { skipIdenticalUpdates: !0 }), { event: l, ...u } = i;
		for (let [e, n] of this.#N.subscriptions) t.querySetIds.has(e) && n.emitter.emit("applied", u);
		for (let { entry: e, error: t } of o) {
			let n = Error(t), r = this.#he({
				id: this.#ze(),
				tag: "Error",
				value: n
			});
			e.emitter.emit("error", {
				...r,
				event: n
			}, n);
		}
		this.#Ue(c);
	}
	#ye(e) {
		let t = this.#N.subscriptions.get(e);
		this.#N.subscriptions.delete(e);
		let { event: n, ...r } = this.#he({
			id: this.#ze(),
			tag: "UnsubscribeApplied"
		});
		t?.emitter.emit("end", r);
	}
	unregisterSubscription(e) {
		let t = this.#N.subscriptions.get(e);
		if (!t) return;
		if (t.unsubscribeRequested = !0, this.#r && (!this.isActive || this.#x)) {
			this.#ye(e);
			return;
		}
		let n = this.#de();
		this.#Fe(fn.Unsubscribe({
			querySetId: { id: e },
			requestId: n,
			flags: Hn.SendDroppedRows
		}));
	}
	#be(e, t, n) {
		let r = n.rowsData, i = this.#q;
		i.reset(r);
		let a = [], o = this.#z[t], { primaryKeyColName: s, primaryKeyColType: c } = this.#B[t], l = 0;
		for (; i.remaining > 0;) {
			let t = o(i), n;
			if (s !== void 0 && c !== void 0) n = F.intoMapKey(c, t[s]);
			else {
				let e = r.subarray(l, i.offset);
				n = (0, d.fromByteArray)(e);
			}
			l = i.offset, a.push({
				type: e,
				rowId: n,
				row: t
			});
		}
		return a;
	}
	#xe(e) {
		let t = /* @__PURE__ */ new Map();
		for (let n of e) {
			let e = t.get(n.tableName);
			if (e) for (let t of n.operations) e.push(t);
			else t.set(n.tableName, n.operations.slice());
		}
		return Array.from(t, ([e, t]) => ({
			tableName: e,
			operations: t
		}));
	}
	#Se(e, t) {
		let n = [];
		for (let r of e.tables) n.push({
			tableName: r.table,
			operations: this.#be(t, r.table, r.rows)
		});
		return this.#xe(n);
	}
	#Ce(e, t) {
		if (t.tag === "PersistentTable") {
			let n = this.#be("insert", e, t.value.inserts), r = this.#be("delete", e, t.value.deletes);
			return n.concat(r);
		}
		return t.tag === "EventTable" ? this.#be("insert", e, t.value.events) : [];
	}
	#we(e) {
		let t = [];
		for (let n of e.tables) {
			let e = [];
			for (let t of n.rows) e = e.concat(this.#Ce(n.tableName, t));
			t.push({
				tableName: n.tableName,
				operations: e
			});
		}
		return this.#xe(t);
	}
	#Te(e) {
		this.#M === Cr ? this.#De(e) : this.#Ee(e);
	}
	#Ee(e) {
		let t = this.#A.splice(0);
		for (let n of t) e.send(n);
	}
	#De(e) {
		if (this.#A.length === 0) return;
		let t = Ar(this.#A, ei);
		e.send(jr(this.#J, this.#A, t)), t === this.#A.length ? this.#A.length = 0 : (this.#A.copyWithin(0, t), this.#A.length -= t, this.#A.length > 0 && this.#ke());
	}
	#Oe() {
		this.#Ae("microtask");
	}
	#ke() {
		this.#Ae("next-task");
	}
	#Ae(e) {
		if (this.#j) return;
		this.#j = !0;
		let t = () => {
			this.#j = !1, this.ws && this.isActive && this.#Te(this.ws);
		};
		e === "next-task" ? setTimeout(t, 0) : queueMicrotask(t);
	}
	#je = new y(1024);
	#Me = new y(1024);
	#Ne(e, t) {
		if (nr("trace", t), this.ws && this.isActive) {
			if (this.#M === Sr) {
				this.#A.length && this.#Te(this.ws), this.ws.send(e);
				return;
			}
			this.#A.push(e.slice()), this.#Oe();
		} else this.#A.push(e.slice());
	}
	#Pe() {
		return this.#r && !this.isActive ? new Ce() : void 0;
	}
	#Fe(e) {
		let t = this.#Me;
		t.clear(), fn.serialize(t, e);
		let n = t.getBuffer(), r = !!(this.ws && this.isActive);
		this.#Ne(n, () => r ? `Sending message to server: ${tr(e)}` : `Queuing message to server: ${tr(e)}`);
	}
	#Ie(e, t, n) {
		let r = this.#Me;
		r.clear(), r.writeByte(Qr), r.writeU32(e), r.writeU8(0), r.writeUInt8Array(t), r.writeUInt8Array(n);
		let i = r.getBuffer();
		this.#Ne(i, () => `Sending reducer call message to server: requestId=${e}`);
	}
	#Le(e, t, n) {
		let r = this.#Me;
		r.clear(), r.writeByte($r), r.writeU32(e), r.writeU8(0), r.writeUInt8Array(t), r.writeUInt8Array(n);
		let i = r.getBuffer();
		this.#Ne(i, () => `Sending procedure call message to server: requestId=${e}`);
	}
	#Re(e) {
		this.connectionId = e, this.#t = e.toHexString();
	}
	#ze() {
		return this.#T += 1, `${this.#t}:${this.#T}`;
	}
	#Be() {
		this.ws && (this.#M = Tr(this.ws.protocol)), this.isActive = !this.#r, this.#se(), this.ws && this.isActive && this.#Te(this.ws);
	}
	#Ve(e, t, n) {
		let r = [];
		for (let i of e) {
			let e = i.tableName, a = this.#G[e], o = this.clientCache.getOrCreateTable(a).applyOperations(i.operations, t, n);
			for (let e of o) r.push(e);
		}
		return r;
	}
	#He(e, t) {
		let n = [];
		for (let e of t.querySets) {
			let t = this.#we(e);
			for (let e of t) n.push(e);
		}
		return this.#Ve(this.#xe(n), e);
	}
	#Ue(e) {
		nr("trace", () => `Calling ${e.length} triggered row callbacks`);
		for (let t of e) t.cb();
	}
	#We(e) {
		if (nr("trace", () => `Processing server message: ${tr(e)}`), this.#r && e.tag === "InitialConnection" === this.#S) this.#qe(/* @__PURE__ */ Error("Unexpected message during connection handshake"));
		else switch (e.tag) {
			case "InitialConnection": {
				let t = this.#p;
				if (t && this.identity && !this.identity.isEqual(e.value.identity)) {
					let e = new we();
					this.#ie(void 0, { alreadyReported: !0 }), this.#E.emit("connectError", this, e);
					break;
				}
				if (this.identity = e.value.identity, !this.token && e.value.token && (this.token = e.value.token), this.#Re(e.value.connectionId), this.isActive = !0, this.#p = !0, this.#S = !0, this.#h = 0, this.#E.emit(t ? "automaticReconnect" : "connect", this, this.identity, this.token), this.#m) break;
				if (t) this.#_e();
				else if (this.#x) {
					this.#x = !1;
					for (let [e, t] of this.#N.subscriptions) this.#ge(e, t.querySql);
				}
				this.ws && this.#Te(this.ws);
				break;
			}
			case "SubscribeApplied": {
				let t = e.value.querySetId.id, n = this.#N.subscriptions.get(t);
				if (!n) {
					nr("error", `Received SubscribeApplied for unknown querySetId ${t}.`);
					return;
				}
				let r = {
					id: this.#ze(),
					tag: "SubscribeApplied"
				}, i = this.#he(r), a = this.#Se(e.value.rows, "insert"), o = this.#Ve(a, i), { event: s, ...c } = i;
				n.emitter.emit("applied", c), this.#Ue(o);
				break;
			}
			case "UnsubscribeApplied": {
				let t = e.value.querySetId.id, n = this.#N.subscriptions.get(t);
				if (!n) {
					nr("error", `Received UnsubscribeApplied for unknown querySetId ${t}.`);
					return;
				}
				let r = {
					id: this.#ze(),
					tag: "UnsubscribeApplied"
				}, i = this.#he(r), a = e.value.rows ? this.#Se(e.value.rows, "delete") : [], o = this.#Ve(a, i), { event: s, ...c } = i;
				n.emitter.emit("end", c), this.#N.subscriptions.delete(t), this.#Ue(o);
				break;
			}
			case "SubscriptionError": {
				let t = e.value.querySetId.id, n = e.value.requestId, r = Error(e.value.error), i = {
					id: this.#ze(),
					tag: "Error",
					value: r
				}, a = {
					...this.#he(i),
					event: r
				};
				if (n == null) {
					nr("error", `Disconnecting due to error for a previously applied subscription: ${e.value.error}`), this.disconnect();
					break;
				}
				let o = this.#N.subscriptions.get(t);
				o ? (o.emitter.emit("error", a, r), this.#N.subscriptions.delete(t)) : nr("error", `Received SubscriptionError for unknown querySetId ${t}:`, r);
				break;
			}
			case "TransactionUpdate": {
				let t = {
					id: this.#ze(),
					tag: "Transaction"
				}, n = this.#he(t), r = this.#He(n, e.value);
				this.#Ue(r);
				break;
			}
			case "ReducerResult": {
				let { requestId: t, result: n } = e.value;
				if (n.tag === "Ok") {
					let r = this.#I.get(t), i = this.#ze(), a = r ? {
						id: i,
						tag: "Reducer",
						value: {
							timestamp: e.value.timestamp,
							outcome: n,
							reducer: {
								name: r.name,
								args: r.args
							}
						}
					} : {
						id: i,
						tag: "Transaction"
					}, o = this.#he(a), s = this.#He(o, n.value.transactionUpdate);
					this.#Ue(s);
				}
				this.#I.delete(t);
				let r = this.#F.get(t);
				this.#F.delete(t), r?.(n);
				break;
			}
			case "ProcedureResult": {
				let { status: t, requestId: n } = e.value, r = t.tag === "Returned" ? {
					tag: "Ok",
					value: t.value
				} : {
					tag: "Err",
					value: t.value
				}, i = this.#L.get(n);
				this.#L.delete(n), i?.(r);
				break;
			}
			case "OneOffQueryResult":
				nr("warn", "Received OneOffQueryResult but SDK does not expose one-off query APIs yet.");
				break;
			case "SubscribeBatchApplied": this.#ve(e.value);
		}
	}
	#Ge(e) {
		let t = this.#K;
		t.reset(e);
		let n;
		try {
			n = Dn.deserialize(t);
		} catch (e) {
			this.#qe(e);
			return;
		}
		this.#We(n);
	}
	#Ke(e) {
		if (this.#M !== Cr) {
			this.#Ge(e);
			return;
		}
		let t = !1, n = this.#f;
		try {
			Mr(this.#K, e, (e) => {
				n === this.#f && (t = !0, this.#We(e), t = !1);
			});
		} catch (e) {
			if (t) throw e;
			this.#qe(e);
		}
	}
	#qe(e) {
		if (!this.#r) throw e;
		let t = new Kr("Invalid server message", { cause: e });
		this.#S ? this.#$(t) : this.#ee(t);
	}
	#Je(e) {
		if (this.#D.push(e.data), !this.#k) {
			this.#k = !0;
			try {
				for (; this.#O < this.#D.length;) {
					let e = this.#D[this.#O];
					this.#O += 1, e && this.#Ke(e);
				}
			} finally {
				this.#O >= this.#D.length ? this.#D.length = 0 : this.#O > 0 && (this.#D = this.#D.slice(this.#O)), this.#O = 0, this.#k = !1;
			}
		}
	}
	callReducer(e, t, n) {
		let r = this.#U[e];
		return r ? this.#Ye(e, r, t, n) : this.#Xe(e, t, n);
	}
	#Ye(e, t, n, r) {
		let i = this.#Pe();
		if (i) return Promise.reject(i);
		let { promise: a, resolve: o, reject: s } = Xr(), c = this.#de();
		return this.#Ie(c, t, n), r && this.#I.set(c, {
			name: e,
			args: r
		}), this.#R.set(c, s), this.#F.set(c, (e) => {
			if (this.#R.delete(c), e.tag === "Ok" || e.tag === "OkEmpty") o();
			else if (e.tag === "Err") {
				let t = new h(e.value).readString();
				s(new xe(t));
			} else e.tag === "InternalError" ? s(new Se(e.value)) : s(/* @__PURE__ */ Error("Unexpected reducer result"));
		}), a;
	}
	#Xe(e, t, n) {
		let r = this.#Pe();
		if (r) return Promise.reject(r);
		let { promise: i, resolve: a, reject: o } = Xr(), s = this.#de(), c = fn.CallReducer({
			reducer: e,
			args: t,
			requestId: s,
			flags: 0
		});
		return this.#Fe(c), n && this.#I.set(s, {
			name: e,
			args: n
		}), this.#R.set(s, o), this.#F.set(s, (e) => {
			if (this.#R.delete(s), e.tag === "Ok" || e.tag === "OkEmpty") a();
			else if (e.tag === "Err") {
				let t = new h(e.value).readString();
				o(new xe(t));
			} else e.tag === "InternalError" ? o(new Se(e.value)) : o(/* @__PURE__ */ Error("Unexpected reducer result"));
		}), i;
	}
	callReducerWithParams(e, t, n) {
		let r = this.#je;
		r.clear(), this.#V[e].serialize(r, n);
		let i = r.getBuffer();
		return this.callReducer(e, i, n);
	}
	callProcedure(e, t) {
		let n = this.#W[e];
		return n ? this.#Ze(e, n, t) : this.#Qe(e, t);
	}
	#Ze(e, t, n) {
		let r = this.#Pe();
		if (r) return Promise.reject(r);
		let { promise: i, resolve: a, reject: o } = Xr(), s = this.#de();
		return this.#Le(s, t, n), this.#R.set(s, o), this.#L.set(s, (e) => {
			this.#R.delete(s), e.tag === "Ok" ? a(e.value) : o(e.value);
		}), i;
	}
	#Qe(e, t) {
		let n = this.#Pe();
		if (n) return Promise.reject(n);
		let { promise: r, resolve: i, reject: a } = Xr(), o = this.#de(), s = fn.CallProcedure({
			procedure: e,
			args: t,
			requestId: o,
			flags: 0
		});
		return this.#Fe(s), this.#R.set(o, a), this.#L.set(o, (e) => {
			this.#R.delete(o), e.tag === "Ok" ? i(e.value) : a(e.value);
		}), r;
	}
	callProcedureWithParams(e, t, n, r) {
		let i = new y(1024), { serializeArgs: a, deserializeReturn: o } = this.#H[e];
		a(i, n);
		let s = i.getBuffer();
		return this.callProcedure(e, s).then((e) => o(new h(e)));
	}
	disconnect() {
		this.isDisconnectRequested = !0, this.#r ? this.#m ? this.#E.emit("disconnect", this) : this.#ie(void 0) : this.wsPromise.then((e) => e?.close());
	}
	on(e, t) {
		this.#E.on(e, t);
	}
	off(e, t) {
		this.#E.off(e, t);
	}
	onConnect(e) {
		this.#E.on("connect", e);
	}
	onAutomaticReconnect(e) {
		this.#E.on("automaticReconnect", e);
	}
	onDisconnect(e) {
		this.#E.on("disconnect", e);
	}
	onConnectError(e) {
		this.#E.on("connectError", e);
	}
	removeOnConnect(e) {
		this.#E.off("connect", e);
	}
	removeOnAutomaticReconnect(e) {
		this.#E.off("automaticReconnect", e);
	}
	removeOnDisconnect(e) {
		this.#E.off("disconnect", e);
	}
	removeOnConnectError(e) {
		this.#E.off("connectError", e);
	}
};
function ii(e, t) {
	let n = /* @__PURE__ */ Object.create(null);
	for (let [r, i] of Object.entries(t)) n[r] = ai(r, i, i.tableDef(e, r));
	return { tables: n };
}
function ai(e, t, n) {
	let r = (e) => t.rowType.algebraicType.value.elements[e].name, i = n.indexes.map((e) => {
		let t = e.accessorName;
		if (typeof t != "string" || t.length === 0) throw TypeError(`Index '${e.sourceName ?? "<unknown>"}' on table '${n.sourceName}' is missing accessor name`);
		let i = e.algorithm.tag === "Direct" ? [e.algorithm.value] : e.algorithm.value;
		return {
			name: t,
			unique: n.constraints.some((e) => e.data.tag === "Unique" && e.data.value.columns.every((e) => i.includes(e))),
			algorithm: {
				BTree: "btree",
				Hash: "hash",
				Direct: "direct"
			}[e.algorithm.tag],
			columns: i.map(r)
		};
	});
	return {
		sourceName: t.tableName || e,
		accessorName: e,
		columns: t.rowType.row,
		rowType: t.rowSpacetimeType,
		indexes: t.idxs,
		constraints: n.constraints.map((e) => ({
			name: e.sourceName,
			constraint: "unique",
			columns: e.data.value.columns.map(r)
		})),
		resolvedIndexes: i,
		tableDef: n,
		...n.isEvent ? { isEvent: !0 } : {}
	};
}
var oi = class {
	#e = /* @__PURE__ */ new Map();
	#t = {
		typespace: { types: [] },
		tables: [],
		reducers: [],
		types: [],
		rowLevelSecurity: [],
		schedules: [],
		procedures: [],
		views: [],
		viewPrimaryKeys: [],
		lifeCycleReducers: [],
		httpHandlers: [],
		httpRoutes: [],
		caseConversionPolicy: { tag: "SnakeCase" },
		explicitNames: { entries: [] },
		submodules: [],
		environment: []
	};
	get moduleDef() {
		return this.#t;
	}
	rawModuleDefV10() {
		let e = [], t = (t) => {
			t && e.push(t);
		}, n = this.#t;
		return t(n.typespace && {
			tag: "Typespace",
			value: n.typespace
		}), t(n.types && {
			tag: "Types",
			value: n.types
		}), t(n.tables && {
			tag: "Tables",
			value: n.tables
		}), t(n.reducers && {
			tag: "Reducers",
			value: n.reducers
		}), t(n.procedures && {
			tag: "Procedures",
			value: n.procedures
		}), t(n.views && {
			tag: "Views",
			value: n.views
		}), t(n.viewPrimaryKeys && {
			tag: "ViewPrimaryKeys",
			value: n.viewPrimaryKeys
		}), t(n.schedules && {
			tag: "Schedules",
			value: n.schedules
		}), t(n.lifeCycleReducers && {
			tag: "LifeCycleReducers",
			value: n.lifeCycleReducers
		}), t(n.httpHandlers && {
			tag: "HttpHandlers",
			value: n.httpHandlers
		}), t(n.httpRoutes && {
			tag: "HttpRoutes",
			value: n.httpRoutes
		}), t(n.rowLevelSecurity && {
			tag: "RowLevelSecurity",
			value: n.rowLevelSecurity
		}), t(n.explicitNames && {
			tag: "ExplicitNames",
			value: n.explicitNames
		}), t(n.caseConversionPolicy && {
			tag: "CaseConversionPolicy",
			value: n.caseConversionPolicy
		}), t(n.submodules && {
			tag: "Submodules",
			value: n.submodules
		}), t({
			tag: "Environment",
			value: n.environment
		}), { sections: e };
	}
	addSubmodule(e) {
		this.#t.submodules.push(e);
	}
	setCaseConversionPolicy(e) {
		this.#t.caseConversionPolicy = e;
	}
	get typespace() {
		return this.#t.typespace;
	}
	resolveType(e) {
		let t = e.algebraicType;
		for (; t.tag === "Ref";) t = this.typespace.types[t.value];
		return t;
	}
	registerTypesRecursively(e) {
		return e instanceof vt && !si(e) || e instanceof Ct || e instanceof xt ? this.#n(e) : e instanceof _t ? new _t(this.registerTypesRecursively(e.value)) : e instanceof yt ? new yt(this.registerTypesRecursively(e.ok), this.registerTypesRecursively(e.err)) : e instanceof ht ? new ht(this.registerTypesRecursively(e.element)) : e;
	}
	#n(e) {
		let t = e.algebraicType, n = e.typeName;
		if (n === void 0) throw Error(`Missing type name for ${e.constructor.name ?? "TypeBuilder"} ${JSON.stringify(e)}`);
		let r = this.#e.get(t);
		if (r != null) return r;
		let i = e instanceof xt || e instanceof vt ? {
			tag: "Product",
			value: { elements: [] }
		} : {
			tag: "Sum",
			value: { variants: [] }
		};
		if (r = new cn(this.#t.typespace.types.length), this.#t.typespace.types.push(i), this.#e.set(t, r), e instanceof xt) for (let [t, n] of Object.entries(e.row)) i.value.elements.push({
			name: t,
			algebraicType: this.registerTypesRecursively(n.typeBuilder).algebraicType
		});
		else if (e instanceof vt) for (let [t, n] of Object.entries(e.elements)) i.value.elements.push({
			name: t,
			algebraicType: this.registerTypesRecursively(n).algebraicType
		});
		else if (e instanceof Ct) for (let [t, n] of Object.entries(e.variants)) i.value.variants.push({
			name: t,
			algebraicType: this.registerTypesRecursively(n).algebraicType
		});
		return this.#t.types.push({
			sourceName: ci(n),
			ty: r.ref,
			customOrdering: !0
		}), r;
	}
};
function si(e) {
	return e.typeName == null && e.algebraicType.value.elements.length === 0;
}
function ci(e) {
	let t = e.split(".");
	return {
		sourceName: t.pop(),
		scope: t
	};
}
var li = class {
	constructor(e) {
		this.schemaType = e;
	}
};
function ui(e) {
	return new li(ii(new oi(), e));
}
function di(e) {
	return Object.fromEntries(e.map((e) => [e.accessorName, e]));
}
var fi = U.enum("AlgebraicType", {
	Ref: U.u32(),
	get Sum() {
		return va;
	},
	get Product() {
		return Oi;
	},
	get Array() {
		return fi;
	},
	String: U.unit(),
	Bool: U.unit(),
	I8: U.unit(),
	U8: U.unit(),
	I16: U.unit(),
	U16: U.unit(),
	I32: U.unit(),
	U32: U.unit(),
	I64: U.unit(),
	U64: U.unit(),
	I128: U.unit(),
	U128: U.unit(),
	I256: U.unit(),
	U256: U.unit(),
	F32: U.unit(),
	F64: U.unit()
}), pi = U.enum("CaseConversionPolicy", {
	None: U.unit(),
	SnakeCase: U.unit()
}), mi = U.enum("EnvVarType", {
	String: U.unit(),
	StringLiteral: U.string(),
	Union: U.array(U.string())
}), hi = U.object("EnvironmentDeclaration", {
	name: U.string(),
	get ty() {
		return mi;
	},
	optional: U.bool()
}), gi = U.enum("ExplicitNameEntry", {
	get Table() {
		return Di;
	},
	get Function() {
		return Di;
	},
	get Index() {
		return Di;
	},
	get Namespace() {
		return Di;
	}
}), _i = U.object("ExplicitNames", { get entries() {
	return U.array(gi);
} }), vi = U.enum("FunctionVisibility", {
	Private: U.unit(),
	ClientCallable: U.unit()
}), yi = U.object("HttpHeaderPair", {
	name: U.string(),
	value: U.byteArray()
}), bi = U.object("HttpHeaders", { get entries() {
	return U.array(yi);
} }), xi = U.enum("HttpMethod", {
	Get: U.unit(),
	Head: U.unit(),
	Post: U.unit(),
	Put: U.unit(),
	Delete: U.unit(),
	Connect: U.unit(),
	Options: U.unit(),
	Trace: U.unit(),
	Patch: U.unit(),
	Extension: U.string()
});
U.object("HttpRequest", {
	get method() {
		return xi;
	},
	get headers() {
		return bi;
	},
	timeout: U.option(U.timeDuration()),
	uri: U.string(),
	get version() {
		return Si;
	}
}), U.object("HttpResponse", {
	get headers() {
		return bi;
	},
	get version() {
		return Si;
	},
	code: U.u16()
});
var Si = U.enum("HttpVersion", {
	Http09: U.unit(),
	Http10: U.unit(),
	Http11: U.unit(),
	Http2: U.unit(),
	Http3: U.unit()
}), Ci = U.enum("IndexType", {
	BTree: U.unit(),
	Hash: U.unit()
}), wi = U.enum("Lifecycle", {
	Init: U.unit(),
	OnConnect: U.unit(),
	OnDisconnect: U.unit()
}), Ti = U.enum("MethodOrAny", {
	Any: U.unit(),
	get Method() {
		return xi;
	}
}), Ei = U.enum("MiscModuleExport", { get TypeAlias() {
	return Ca;
} }), Di = U.object("NameMapping", {
	sourceName: U.string(),
	canonicalName: U.string()
}), Oi = U.object("ProductType", { get elements() {
	return U.array(ki);
} }), ki = U.object("ProductTypeElement", {
	name: U.option(U.string()),
	get algebraicType() {
		return fi;
	}
}), Ai = U.object("RawColumnDefV8", {
	colName: U.string(),
	get colType() {
		return fi;
	}
}), ji = U.object("RawColumnDefaultValueV10", {
	colId: U.u16(),
	value: U.byteArray()
}), Mi = U.object("RawColumnDefaultValueV9", {
	table: U.string(),
	colId: U.u16(),
	value: U.byteArray()
}), Ni = U.enum("RawConstraintDataV9", { get Unique() {
	return pa;
} }), Pi = U.object("RawConstraintDefV10", {
	sourceName: U.option(U.string()),
	get data() {
		return Ni;
	}
}), Fi = U.object("RawConstraintDefV8", {
	constraintName: U.string(),
	constraints: U.u8(),
	columns: U.array(U.u16())
}), Ii = U.object("RawConstraintDefV9", {
	name: U.option(U.string()),
	get data() {
		return Ni;
	}
}), Li = U.object("RawHttpHandlerDefV10", { sourceName: U.string() }), Ri = U.object("RawHttpRouteDefV10", {
	handlerFunction: U.string(),
	get method() {
		return Ti;
	},
	path: U.string()
}), zi = U.enum("RawIndexAlgorithm", {
	BTree: U.array(U.u16()),
	Hash: U.array(U.u16()),
	Direct: U.u16()
}), Bi = U.object("RawIndexDefV10", {
	sourceName: U.option(U.string()),
	accessorName: U.option(U.string()),
	get algorithm() {
		return zi;
	}
}), Vi = U.object("RawIndexDefV8", {
	indexName: U.string(),
	isUnique: U.bool(),
	get indexType() {
		return Ci;
	},
	columns: U.array(U.u16())
}), Hi = U.object("RawIndexDefV9", {
	name: U.option(U.string()),
	accessorName: U.option(U.string()),
	get algorithm() {
		return zi;
	}
}), Ui = U.object("RawLifeCycleReducerDefV10", {
	get lifecycleSpec() {
		return wi;
	},
	functionName: U.string()
}), Wi = U.enum("RawMiscModuleExportV9", {
	get ColumnDefaultValue() {
		return Mi;
	},
	get Procedure() {
		return Xi;
	},
	get View() {
		return ha;
	}
});
U.enum("RawModuleDef", {
	get V8BackCompat() {
		return qi;
	},
	get V9() {
		return Ji;
	},
	get V10() {
		return Gi;
	}
});
var Gi = U.object("RawModuleDefV10", { get sections() {
	return U.array(Ki);
} }), Ki = U.enum("RawModuleDefV10Section", {
	get Typespace() {
		return wa;
	},
	get Types() {
		return U.array(da);
	},
	get Tables() {
		return U.array(ca);
	},
	get Reducers() {
		return U.array(Zi);
	},
	get Procedures() {
		return U.array(Yi);
	},
	get Views() {
		return U.array(ma);
	},
	get Schedules() {
		return U.array(ea);
	},
	get LifeCycleReducers() {
		return U.array(Ui);
	},
	get RowLevelSecurity() {
		return U.array($i);
	},
	get CaseConversionPolicy() {
		return pi;
	},
	get ExplicitNames() {
		return _i;
	},
	get HttpHandlers() {
		return U.array(Li);
	},
	get HttpRoutes() {
		return U.array(Ri);
	},
	get ViewPrimaryKeys() {
		return U.array(ga);
	},
	get Submodules() {
		return U.array(sa);
	},
	get Environment() {
		return U.array(hi);
	}
}), qi = U.object("RawModuleDefV8", {
	get typespace() {
		return wa;
	},
	get tables() {
		return U.array(xa);
	},
	get reducers() {
		return U.array(_a);
	},
	get miscExports() {
		return U.array(Ei);
	}
}), Ji = U.object("RawModuleDefV9", {
	get typespace() {
		return wa;
	},
	get tables() {
		return U.array(ua);
	},
	get reducers() {
		return U.array(Qi);
	},
	get types() {
		return U.array(fa);
	},
	get miscExports() {
		return U.array(Wi);
	},
	get rowLevelSecurity() {
		return U.array($i);
	}
}), Yi = U.object("RawProcedureDefV10", {
	sourceName: U.string(),
	get params() {
		return Oi;
	},
	get returnType() {
		return fi;
	},
	get visibility() {
		return vi;
	}
}), Xi = U.object("RawProcedureDefV9", {
	name: U.string(),
	get params() {
		return Oi;
	},
	get returnType() {
		return fi;
	}
}), Zi = U.object("RawReducerDefV10", {
	sourceName: U.string(),
	get params() {
		return Oi;
	},
	get visibility() {
		return vi;
	},
	get okReturnType() {
		return fi;
	},
	get errReturnType() {
		return fi;
	}
}), Qi = U.object("RawReducerDefV9", {
	name: U.string(),
	get params() {
		return Oi;
	},
	get lifecycle() {
		return U.option(wi);
	}
}), $i = U.object("RawRowLevelSecurityDefV9", { sql: U.string() }), ea = U.object("RawScheduleDefV10", {
	sourceName: U.option(U.string()),
	tableName: U.string(),
	scheduleAtCol: U.u16(),
	functionName: U.string()
}), ta = U.object("RawScheduleDefV9", {
	name: U.option(U.string()),
	reducerName: U.string(),
	scheduledAtColumn: U.u16()
}), na = U.object("RawScopedTypeNameV10", {
	scope: U.array(U.string()),
	sourceName: U.string()
}), ra = U.object("RawScopedTypeNameV9", {
	scope: U.array(U.string()),
	name: U.string()
}), ia = U.object("RawSequenceDefV10", {
	sourceName: U.option(U.string()),
	column: U.u16(),
	start: U.option(U.i128()),
	minValue: U.option(U.i128()),
	maxValue: U.option(U.i128()),
	increment: U.i128()
}), aa = U.object("RawSequenceDefV8", {
	sequenceName: U.string(),
	colPos: U.u16(),
	increment: U.i128(),
	start: U.option(U.i128()),
	minValue: U.option(U.i128()),
	maxValue: U.option(U.i128()),
	allocated: U.i128()
}), oa = U.object("RawSequenceDefV9", {
	name: U.option(U.string()),
	column: U.u16(),
	start: U.option(U.i128()),
	minValue: U.option(U.i128()),
	maxValue: U.option(U.i128()),
	increment: U.i128()
}), sa = U.object("RawSubmoduleV10", {
	namespace: U.string(),
	get module() {
		return Gi;
	}
}), ca = U.object("RawTableDefV10", {
	sourceName: U.string(),
	productTypeRef: U.u32(),
	primaryKey: U.array(U.u16()),
	get indexes() {
		return U.array(Bi);
	},
	get constraints() {
		return U.array(Pi);
	},
	get sequences() {
		return U.array(ia);
	},
	get tableType() {
		return Sa;
	},
	get tableAccess() {
		return ba;
	},
	get defaultValues() {
		return U.array(ji);
	},
	isEvent: U.bool()
}), la = U.object("RawTableDefV8", {
	tableName: U.string(),
	get columns() {
		return U.array(Ai);
	},
	get indexes() {
		return U.array(Vi);
	},
	get constraints() {
		return U.array(Fi);
	},
	get sequences() {
		return U.array(aa);
	},
	tableType: U.string(),
	tableAccess: U.string(),
	scheduled: U.option(U.string())
}), ua = U.object("RawTableDefV9", {
	name: U.string(),
	productTypeRef: U.u32(),
	primaryKey: U.array(U.u16()),
	get indexes() {
		return U.array(Hi);
	},
	get constraints() {
		return U.array(Ii);
	},
	get sequences() {
		return U.array(oa);
	},
	get schedule() {
		return U.option(ta);
	},
	get tableType() {
		return Sa;
	},
	get tableAccess() {
		return ba;
	}
}), da = U.object("RawTypeDefV10", {
	get sourceName() {
		return na;
	},
	ty: U.u32(),
	customOrdering: U.bool()
}), fa = U.object("RawTypeDefV9", {
	get name() {
		return ra;
	},
	ty: U.u32(),
	customOrdering: U.bool()
}), pa = U.object("RawUniqueConstraintDataV9", { columns: U.array(U.u16()) }), ma = U.object("RawViewDefV10", {
	sourceName: U.string(),
	index: U.u32(),
	isPublic: U.bool(),
	isAnonymous: U.bool(),
	get params() {
		return Oi;
	},
	get returnType() {
		return fi;
	}
}), ha = U.object("RawViewDefV9", {
	name: U.string(),
	index: U.u32(),
	isPublic: U.bool(),
	isAnonymous: U.bool(),
	get params() {
		return Oi;
	},
	get returnType() {
		return fi;
	}
}), ga = U.object("RawViewPrimaryKeyDefV10", {
	viewSourceName: U.string(),
	columns: U.array(U.string())
}), _a = U.object("ReducerDef", {
	name: U.string(),
	get args() {
		return U.array(ki);
	}
}), va = U.object("SumType", { get variants() {
	return U.array(ya);
} }), ya = U.object("SumTypeVariant", {
	name: U.option(U.string()),
	get algebraicType() {
		return fi;
	}
}), ba = U.enum("TableAccess", {
	Public: U.unit(),
	Private: U.unit()
}), xa = U.object("TableDesc", {
	get schema() {
		return la;
	},
	data: U.u32()
}), Sa = U.enum("TableType", {
	System: U.unit(),
	User: U.unit()
}), Ca = U.object("TypeAlias", {
	name: U.string(),
	ty: U.u32()
}), wa = U.object("Typespace", { get types() {
	return U.array(fi);
} });
U.enum("ViewResultHeader", {
	RowData: U.unit(),
	RawSql: U.string()
});
function Ta(e, t, ...n) {
	let { name: r, public: i = !1, indexes: a = [], scheduled: o, event: s = !1 } = e, c = /* @__PURE__ */ new Map(), l = [];
	t instanceof xt || (t = new xt(t)), t.algebraicType.value.elements.forEach((e, t) => {
		c.set(e.name, t), l.push(e.name);
	});
	let u = [], d = [], f = [], p = [], m, h = [];
	for (let [e, n] of Object.entries(t.row)) {
		let t = n.columnMetadata;
		t.isPrimaryKey && u.push(c.get(e));
		let r = t.isUnique || t.isPrimaryKey;
		if (t.indexType || r) {
			let n = t.indexType ?? "btree", r = c.get(e), i;
			switch (n) {
				case "btree":
					i = zi.BTree([r]);
					break;
				case "hash":
					i = zi.Hash([r]);
					break;
				case "direct": i = zi.Direct(r);
			}
			d.push({
				sourceName: void 0,
				accessorName: e,
				algorithm: i
			});
		}
		if (r && f.push({
			sourceName: void 0,
			data: {
				tag: "Unique",
				value: { columns: [c.get(e)] }
			}
		}), t.isAutoIncrement && p.push({
			sourceName: void 0,
			start: void 0,
			minValue: void 0,
			maxValue: void 0,
			column: c.get(e),
			increment: 1n
		}), Object.prototype.hasOwnProperty.call(t, "defaultValue")) {
			let r = new y(16);
			n.serialize(r, t.defaultValue), h.push({
				colId: c.get(e),
				value: r.getBuffer()
			});
		}
		let i = n.typeBuilder.algebraicType;
		Ee.isScheduleAt(i) && (m = c.get(e));
	}
	for (let e of a ?? []) {
		let t = e.accessor;
		if (typeof t != "string" || t.length === 0) {
			let t = r ?? "<unnamed>", n = e.name ?? "<unnamed>";
			throw TypeError(`Index '${n}' on table '${t}' must define a non-empty 'accessor'`);
		}
		let n;
		switch (e.algorithm) {
			case "btree":
				n = {
					tag: "BTree",
					value: e.columns.map((e) => c.get(e))
				};
				break;
			case "hash":
				n = {
					tag: "Hash",
					value: e.columns.map((e) => c.get(e))
				};
				break;
			case "direct": n = {
				tag: "Direct",
				value: c.get(e.column)
			};
		}
		d.push({
			sourceName: void 0,
			accessorName: t,
			algorithm: n,
			canonicalName: e.name
		});
	}
	for (let t of e.constraints ?? []) if (t.constraint === "unique") {
		let e = {
			tag: "Unique",
			value: { columns: t.columns.map((e) => c.get(e)) }
		};
		f.push({
			sourceName: t.name,
			data: e
		});
		continue;
	}
	let g = t.algebraicType.value;
	return {
		rowType: t,
		tableName: r,
		rowSpacetimeType: g,
		tableDef: (e, n) => {
			let a = r ?? n;
			t.typeName === void 0 && (t.typeName = ee(a));
			for (let t of d) {
				let r = t.sourceName = `${n}_${(t.algorithm.tag === "Direct" ? [t.algorithm.value] : t.algorithm.value).map((e) => l[e]).join("_")}_idx_${t.algorithm.tag.toLowerCase()}`, { canonicalName: i } = t;
				i !== void 0 && e.moduleDef.explicitNames.entries.push(gi.Index({
					sourceName: r,
					canonicalName: i
				}));
			}
			return {
				sourceName: n,
				productTypeRef: e.registerTypesRecursively(t).ref,
				primaryKey: u,
				indexes: d,
				constraints: f,
				sequences: p,
				tableType: { tag: "User" },
				tableAccess: { tag: i ? "Public" : "Private" },
				defaultValues: h,
				isEvent: s
			};
		},
		idxs: a,
		constraints: f,
		scheduleAtCol: m,
		schedule: o && m !== void 0 ? {
			scheduleAtCol: m,
			reducer: o
		} : void 0
	};
}
var Ea = class {
	reducersType;
	constructor(e) {
		this.reducersType = Da(e);
	}
};
function Da(e) {
	return { reducers: e.map((e) => {
		let t = e.params.row;
		return {
			name: e.reducerName,
			accessorName: e.accessorName,
			params: t,
			paramsType: e.paramsSpacetimeType
		};
	}) };
}
function Oa(...e) {
	return new Ea(e.length === 1 && Array.isArray(e[0]) ? e[0] : e);
}
function ka(e, t, n) {
	let r = { elements: Object.entries(t).map(([e, t]) => ({
		name: e,
		algebraicType: "typeBuilder" in t ? t.typeBuilder.algebraicType : t.algebraicType
	})) };
	return {
		reducerName: e,
		accessorName: n ?? M(e),
		params: new xt(t),
		paramsSpacetimeType: r,
		reducerDef: {
			name: e,
			params: r,
			lifecycle: void 0
		}
	};
}
function Aa(...e) {
	return { procedures: e.length === 1 && Array.isArray(e[0]) ? e[0] : e };
}
function ja(e, t, n, r) {
	return {
		name: e,
		accessorName: r ?? M(e),
		params: te(t),
		returnType: n
	};
}
// src/module_bindings/claim_admin_reducer.ts
var Ma = { key: U.string() }, Na = { onlyFallbacks: U.bool() }, Pa = { buildId: U.u64() }, Fa = { twinJson: U.string() }, Ia = { universeId: U.u64() }, La = { buildId: U.u64() }, Ra = { buildId: U.u64() }, za = {}, Ba = { buildId: U.u64() }, Va = {
	universeId: U.u64(),
	days: U.u32()
}, Ha = {
	universeId: U.u64(),
	pricesJson: U.string()
}, Ua = { everyMs: U.u32() }, Wa = {
	baseUniverseId: U.u64(),
	label: U.string(),
	optionsJson: U.string(),
	copies: U.u32(),
	days: U.u32(),
	brain: U.string()
}, Ga = {
	baseUniverseId: U.u64(),
	label: U.string(),
	optionsJson: U.string(),
	copies: U.u32(),
	days: U.u32(),
	brain: U.string(),
	radiusM: U.u32()
}, Ka = { query: U.string() }, qa = {
	query: U.string(),
	label: U.string(),
	menuJson: U.string(),
	cutoffDate: U.string()
}, Ja = {}, Ya = { buildId: U.u64() }, Xa = U.string(), Za = U.row({ identity: U.identity().primaryKey() }), Qa = U.row({
	id: U.u64().primaryKey(),
	universeId: U.u64().name("universe_id"),
	key: U.string(),
	name: U.string(),
	archetype: U.string(),
	priceSensitivity: U.f64().name("price_sensitivity"),
	visitsPerWeek: U.f64().name("visits_per_week"),
	loyalty: U.f64(),
	usualOrder: U.string().name("usual_order"),
	cares: U.string(),
	refPriceCents: U.u32().name("ref_price_cents"),
	pHere: U.f64().name("p_here"),
	pCompetitor: U.f64().name("p_competitor"),
	pSkip: U.f64().name("p_skip"),
	satisfaction: U.f64(),
	lastNoticeTick: U.i32().name("last_notice_tick"),
	lastNoticePct: U.f64().name("last_notice_pct"),
	noticeReview: U.string().name("notice_review"),
	visitsHere: U.u32().name("visits_here")
}), $a = U.row({
	buildId: U.u64().primaryKey().name("build_id"),
	status: U.string(),
	detail: U.string(),
	mapJson: U.string().name("map_json")
}), eo = U.row({
	universeId: U.u64().primaryKey().name("universe_id"),
	name: U.string(),
	openHour: U.u32().name("open_hour"),
	closeHour: U.u32().name("close_hour"),
	servicePerHour: U.u32().name("service_per_hour"),
	customerScale: U.u32().name("customer_scale"),
	rentPerDayCents: U.u32().name("rent_per_day_cents"),
	wagesPerDayCents: U.u32().name("wages_per_day_cents"),
	cashCents: U.i64().name("cash_cents")
}), to = U.row({
	id: U.u64().primaryKey(),
	universeId: U.u64().name("universe_id"),
	key: U.string(),
	name: U.string(),
	priceIndex: U.f64().name("price_index"),
	rating: U.f64()
}), no = U.row({
	id: U.u64().primaryKey(),
	universeId: U.u64().name("universe_id"),
	tick: U.u32(),
	revenueCents: U.i64().name("revenue_cents"),
	profitCents: U.i64().name("profit_cents"),
	visits: U.u32(),
	competitorVisits: U.u32().name("competitor_visits"),
	avgWaitMin: U.f64().name("avg_wait_min"),
	regularsActive: U.u32().name("regulars_active"),
	avgSatisfaction: U.f64().name("avg_satisfaction"),
	reviews: U.u32(),
	starsSum: U.u32().name("stars_sum"),
	priceMentions: U.u32().name("price_mentions"),
	notices: U.u32()
}), ro = U.row({
	situationKey: U.string().primaryKey().name("situation_key"),
	agentKey: U.string().name("agent_key"),
	pHere: U.f64().name("p_here"),
	pCompetitor: U.f64().name("p_competitor"),
	pSkip: U.f64().name("p_skip"),
	satisfaction: U.f64(),
	memory: U.string(),
	reviewText: U.string().name("review_text"),
	source: U.string()
}), io = U.row({
	situationKey: U.string().primaryKey().name("situation_key"),
	agentKey: U.string().name("agent_key"),
	contextJson: U.string().name("context_json")
}), ao = U.row({
	id: U.u64().primaryKey(),
	universeId: U.u64().name("universe_id"),
	tick: U.u32(),
	kind: U.string(),
	agentKey: U.string().name("agent_key"),
	detail: U.string()
}), oo = U.row({
	id: U.u64().primaryKey(),
	baseUniverseId: U.u64().name("base_universe_id"),
	label: U.string(),
	optionsJson: U.string().name("options_json"),
	copies: U.u32(),
	days: U.u32(),
	status: U.string()
}), so = U.row({
	experimentId: U.u64().primaryKey().name("experiment_id"),
	radiusM: U.u32().name("radius_m")
}), co = U.row({
	id: U.u64().primaryKey(),
	experimentId: U.u64().name("experiment_id"),
	optionLabel: U.string().name("option_label"),
	copies: U.u32(),
	meanRevenueCents: U.i64().name("mean_revenue_cents"),
	meanProfitCents: U.i64().name("mean_profit_cents"),
	meanVisits: U.f64().name("mean_visits"),
	meanStars: U.f64().name("mean_stars"),
	priceMentionShare: U.f64().name("price_mention_share"),
	revenueWins: U.u32().name("revenue_wins"),
	profitWins: U.u32().name("profit_wins"),
	ratingDrops: U.u32().name("rating_drops")
}), lo = U.row({
	id: U.u64().primaryKey(),
	ok: U.bool(),
	situations: U.u32(),
	inputTokens: U.u32().name("input_tokens"),
	outputTokens: U.u32().name("output_tokens"),
	startedMs: U.u64().name("started_ms"),
	finishedMs: U.u64().name("finished_ms"),
	note: U.string()
}), uo = U.row({
	id: U.u64().primaryKey(),
	universeId: U.u64().name("universe_id"),
	agentKey: U.string().name("agent_key"),
	tick: U.i32(),
	text: U.string()
}), fo = U.row({
	id: U.u64().primaryKey(),
	universeId: U.u64().name("universe_id"),
	key: U.string(),
	name: U.string(),
	category: U.string(),
	priceCents: U.u32().name("price_cents"),
	unitCostCents: U.u32().name("unit_cost_cents")
}), po = U.row({
	buildId: U.u64().primaryKey().name("build_id"),
	status: U.string(),
	source: U.string(),
	url: U.string(),
	runId: U.string().name("run_id"),
	detail: U.string()
}), mo = U.row({
	id: U.u64().primaryKey(),
	universeId: U.u64().name("universe_id"),
	tick: U.u32(),
	agentKey: U.string().name("agent_key"),
	stars: U.u32(),
	mentionsPrice: U.bool().name("mentions_price"),
	text: U.string()
}), ho = U.row({
	id: U.u64().primaryKey(),
	buildId: U.u64().name("build_id"),
	key: U.string(),
	name: U.string(),
	x: U.f64(),
	y: U.f64(),
	distanceM: U.u32().name("distance_m"),
	rating: U.f64(),
	reviewsCount: U.u32().name("reviews_count"),
	priceIndex: U.f64().name("price_index"),
	category: U.string()
}), go = U.row({
	buildId: U.u64().primaryKey().name("build_id"),
	status: U.string(),
	runId: U.string().name("run_id"),
	detail: U.string()
}), _o = U.row({
	id: U.u64().primaryKey(),
	universeId: U.u64().name("universe_id"),
	rivalKey: U.string().name("rival_key"),
	visits: U.u32()
}), vo = U.row({ universeId: U.u64().primaryKey().name("universe_id") }), yo = U.row({
	id: U.u64().primaryKey(),
	query: U.string(),
	label: U.string(),
	cutoffDate: U.string().name("cutoff_date"),
	menuJson: U.string().name("menu_json"),
	status: U.string(),
	detail: U.string(),
	placeRunId: U.string().name("place_run_id"),
	reviewsRunId: U.string().name("reviews_run_id"),
	competitorsRunId: U.string().name("competitors_run_id"),
	placeJson: U.string().name("place_json"),
	reviewsJson: U.string().name("reviews_json"),
	competitorsJson: U.string().name("competitors_json"),
	batchesTotal: U.u32().name("batches_total"),
	batchesDone: U.u32().name("batches_done"),
	twinJson: U.string().name("twin_json"),
	universeId: U.u64().name("universe_id")
}), bo = U.row({
	id: U.u64().primaryKey(),
	buildId: U.u64().name("build_id"),
	reviewIndex: U.u32().name("review_index"),
	profileJson: U.string().name("profile_json")
}), xo = U.row({
	id: U.u64().primaryKey(),
	parentId: U.u64().name("parent_id"),
	experimentId: U.u64().name("experiment_id"),
	optionLabel: U.string().name("option_label"),
	copyNumber: U.u32().name("copy_number"),
	seed: U.u64(),
	forkTick: U.u32().name("fork_tick"),
	currentTick: U.u32().name("current_tick"),
	maxTick: U.u32().name("max_tick"),
	status: U.string(),
	brain: U.string()
}), So = U.row({
	universeId: U.u64().primaryKey().name("universe_id"),
	buildId: U.u64().name("build_id")
}), Co = U.row({
	id: U.u64().primaryKey(),
	universeId: U.u64().name("universe_id"),
	tick: U.u32(),
	agentKey: U.string().name("agent_key"),
	place: U.string()
}), wo = ui({
	admin: Ta({
		name: "admin",
		indexes: [{
			accessor: "identity",
			name: "admin_identity_idx_btree",
			algorithm: "btree",
			columns: ["identity"]
		}],
		constraints: [{
			name: "admin_identity_key",
			constraint: "unique",
			columns: ["identity"]
		}]
	}, Za),
	agent: Ta({
		name: "agent",
		indexes: [{
			accessor: "id",
			name: "agent_id_idx_btree",
			algorithm: "btree",
			columns: ["id"]
		}, {
			accessor: "universeId",
			name: "agent_universe_id_idx_btree",
			algorithm: "btree",
			columns: ["universeId"]
		}],
		constraints: [{
			name: "agent_id_key",
			constraint: "unique",
			columns: ["id"]
		}]
	}, Qa),
	areaMap: Ta({
		name: "area_map",
		indexes: [{
			accessor: "buildId",
			name: "area_map_build_id_idx_btree",
			algorithm: "btree",
			columns: ["buildId"]
		}],
		constraints: [{
			name: "area_map_build_id_key",
			constraint: "unique",
			columns: ["buildId"]
		}]
	}, $a),
	cafe: Ta({
		name: "cafe",
		indexes: [{
			accessor: "universeId",
			name: "cafe_universe_id_idx_btree",
			algorithm: "btree",
			columns: ["universeId"]
		}],
		constraints: [{
			name: "cafe_universe_id_key",
			constraint: "unique",
			columns: ["universeId"]
		}]
	}, eo),
	competitor: Ta({
		name: "competitor",
		indexes: [{
			accessor: "id",
			name: "competitor_id_idx_btree",
			algorithm: "btree",
			columns: ["id"]
		}, {
			accessor: "universeId",
			name: "competitor_universe_id_idx_btree",
			algorithm: "btree",
			columns: ["universeId"]
		}],
		constraints: [{
			name: "competitor_id_key",
			constraint: "unique",
			columns: ["id"]
		}]
	}, to),
	dailyMetric: Ta({
		name: "daily_metric",
		indexes: [{
			accessor: "id",
			name: "daily_metric_id_idx_btree",
			algorithm: "btree",
			columns: ["id"]
		}, {
			accessor: "universeId",
			name: "daily_metric_universe_id_idx_btree",
			algorithm: "btree",
			columns: ["universeId"]
		}],
		constraints: [{
			name: "daily_metric_id_key",
			constraint: "unique",
			columns: ["id"]
		}]
	}, no),
	decisionCache: Ta({
		name: "decision_cache",
		indexes: [{
			accessor: "situationKey",
			name: "decision_cache_situation_key_idx_btree",
			algorithm: "btree",
			columns: ["situationKey"]
		}],
		constraints: [{
			name: "decision_cache_situation_key_key",
			constraint: "unique",
			columns: ["situationKey"]
		}]
	}, ro),
	decisionRequest: Ta({
		name: "decision_request",
		indexes: [{
			accessor: "situationKey",
			name: "decision_request_situation_key_idx_btree",
			algorithm: "btree",
			columns: ["situationKey"]
		}],
		constraints: [{
			name: "decision_request_situation_key_key",
			constraint: "unique",
			columns: ["situationKey"]
		}]
	}, io),
	event: Ta({
		name: "event",
		indexes: [{
			accessor: "id",
			name: "event_id_idx_btree",
			algorithm: "btree",
			columns: ["id"]
		}, {
			accessor: "universeId",
			name: "event_universe_id_idx_btree",
			algorithm: "btree",
			columns: ["universeId"]
		}],
		constraints: [{
			name: "event_id_key",
			constraint: "unique",
			columns: ["id"]
		}]
	}, ao),
	experiment: Ta({
		name: "experiment",
		indexes: [{
			accessor: "id",
			name: "experiment_id_idx_btree",
			algorithm: "btree",
			columns: ["id"]
		}],
		constraints: [{
			name: "experiment_id_key",
			constraint: "unique",
			columns: ["id"]
		}]
	}, oo),
	experimentRadius: Ta({
		name: "experiment_radius",
		indexes: [{
			accessor: "experimentId",
			name: "experiment_radius_experiment_id_idx_btree",
			algorithm: "btree",
			columns: ["experimentId"]
		}],
		constraints: [{
			name: "experiment_radius_experiment_id_key",
			constraint: "unique",
			columns: ["experimentId"]
		}]
	}, so),
	experimentResult: Ta({
		name: "experiment_result",
		indexes: [{
			accessor: "experimentId",
			name: "experiment_result_experiment_id_idx_btree",
			algorithm: "btree",
			columns: ["experimentId"]
		}, {
			accessor: "id",
			name: "experiment_result_id_idx_btree",
			algorithm: "btree",
			columns: ["id"]
		}],
		constraints: [{
			name: "experiment_result_id_key",
			constraint: "unique",
			columns: ["id"]
		}]
	}, co),
	llmLog: Ta({
		name: "llm_log",
		indexes: [{
			accessor: "id",
			name: "llm_log_id_idx_btree",
			algorithm: "btree",
			columns: ["id"]
		}],
		constraints: [{
			name: "llm_log_id_key",
			constraint: "unique",
			columns: ["id"]
		}]
	}, lo),
	memory: Ta({
		name: "memory",
		indexes: [{
			accessor: "id",
			name: "memory_id_idx_btree",
			algorithm: "btree",
			columns: ["id"]
		}, {
			accessor: "universeId",
			name: "memory_universe_id_idx_btree",
			algorithm: "btree",
			columns: ["universeId"]
		}],
		constraints: [{
			name: "memory_id_key",
			constraint: "unique",
			columns: ["id"]
		}]
	}, uo),
	menuItem: Ta({
		name: "menu_item",
		indexes: [{
			accessor: "id",
			name: "menu_item_id_idx_btree",
			algorithm: "btree",
			columns: ["id"]
		}, {
			accessor: "universeId",
			name: "menu_item_universe_id_idx_btree",
			algorithm: "btree",
			columns: ["universeId"]
		}],
		constraints: [{
			name: "menu_item_id_key",
			constraint: "unique",
			columns: ["id"]
		}]
	}, fo),
	menuSource: Ta({
		name: "menu_source",
		indexes: [{
			accessor: "buildId",
			name: "menu_source_build_id_idx_btree",
			algorithm: "btree",
			columns: ["buildId"]
		}],
		constraints: [{
			name: "menu_source_build_id_key",
			constraint: "unique",
			columns: ["buildId"]
		}]
	}, po),
	review: Ta({
		name: "review",
		indexes: [{
			accessor: "id",
			name: "review_id_idx_btree",
			algorithm: "btree",
			columns: ["id"]
		}, {
			accessor: "universeId",
			name: "review_universe_id_idx_btree",
			algorithm: "btree",
			columns: ["universeId"]
		}],
		constraints: [{
			name: "review_id_key",
			constraint: "unique",
			columns: ["id"]
		}]
	}, mo),
	rival: Ta({
		name: "rival",
		indexes: [{
			accessor: "buildId",
			name: "rival_build_id_idx_btree",
			algorithm: "btree",
			columns: ["buildId"]
		}, {
			accessor: "id",
			name: "rival_id_idx_btree",
			algorithm: "btree",
			columns: ["id"]
		}],
		constraints: [{
			name: "rival_id_key",
			constraint: "unique",
			columns: ["id"]
		}]
	}, ho),
	rivalScan: Ta({
		name: "rival_scan",
		indexes: [{
			accessor: "buildId",
			name: "rival_scan_build_id_idx_btree",
			algorithm: "btree",
			columns: ["buildId"]
		}],
		constraints: [{
			name: "rival_scan_build_id_key",
			constraint: "unique",
			columns: ["buildId"]
		}]
	}, go),
	rivalTally: Ta({
		name: "rival_tally",
		indexes: [{
			accessor: "id",
			name: "rival_tally_id_idx_btree",
			algorithm: "btree",
			columns: ["id"]
		}, {
			accessor: "universeId",
			name: "rival_tally_universe_id_idx_btree",
			algorithm: "btree",
			columns: ["universeId"]
		}],
		constraints: [{
			name: "rival_tally_id_key",
			constraint: "unique",
			columns: ["id"]
		}]
	}, _o),
	traced: Ta({
		name: "traced",
		indexes: [{
			accessor: "universeId",
			name: "traced_universe_id_idx_btree",
			algorithm: "btree",
			columns: ["universeId"]
		}],
		constraints: [{
			name: "traced_universe_id_key",
			constraint: "unique",
			columns: ["universeId"]
		}]
	}, vo),
	twinBuild: Ta({
		name: "twin_build",
		indexes: [{
			accessor: "id",
			name: "twin_build_id_idx_btree",
			algorithm: "btree",
			columns: ["id"]
		}],
		constraints: [{
			name: "twin_build_id_key",
			constraint: "unique",
			columns: ["id"]
		}]
	}, yo),
	twinProfile: Ta({
		name: "twin_profile",
		indexes: [{
			accessor: "buildId",
			name: "twin_profile_build_id_idx_btree",
			algorithm: "btree",
			columns: ["buildId"]
		}, {
			accessor: "id",
			name: "twin_profile_id_idx_btree",
			algorithm: "btree",
			columns: ["id"]
		}],
		constraints: [{
			name: "twin_profile_id_key",
			constraint: "unique",
			columns: ["id"]
		}]
	}, bo),
	universe: Ta({
		name: "universe",
		indexes: [{
			accessor: "id",
			name: "universe_id_idx_btree",
			algorithm: "btree",
			columns: ["id"]
		}],
		constraints: [{
			name: "universe_id_key",
			constraint: "unique",
			columns: ["id"]
		}]
	}, xo),
	universeBuild: Ta({
		name: "universe_build",
		indexes: [{
			accessor: "universeId",
			name: "universe_build_universe_id_idx_btree",
			algorithm: "btree",
			columns: ["universeId"]
		}],
		constraints: [{
			name: "universe_build_universe_id_key",
			constraint: "unique",
			columns: ["universeId"]
		}]
	}, So),
	visit: Ta({
		name: "visit",
		indexes: [{
			accessor: "id",
			name: "visit_id_idx_btree",
			algorithm: "btree",
			columns: ["id"]
		}, {
			accessor: "universeId",
			name: "visit_universe_id_idx_btree",
			algorithm: "btree",
			columns: ["universeId"]
		}],
		constraints: [{
			name: "visit_id_key",
			constraint: "unique",
			columns: ["id"]
		}]
	}, Co)
}), To = Oa(ka("claim_admin", Ma), ka("clear_cache", Na), ka("fetch_area_map", Pa), ka("load_twin", Fa), ka("pause_universe", Ia), ka("reassemble_build", La), ka("refresh_rivals", Ra), ka("reset_all", za), ka("retry_build", Ba), ka("run_universe", Va), ka("set_prices", Ha), ka("start_clock", Ua), ka("start_experiment", Wa), ka("start_experiment_r", Ga), ka("start_review_scan", Ka), ka("start_twin_build", qa), ka("stop_clock", Ja)), Eo = Aa(ja("inspect_menu_crawl", Ya, Xa)), Do = {
	versionInfo: { cliVersion: "2.13.0" },
	tables: wo.schemaType.tables,
	reducers: To.reducersType.reducers,
	...Eo
};
Ie(wo.schemaType), di(To.reducersType.reducers), di(Eo.procedures);
var Oo = class extends yr {}, ko = class extends _r {}, Ao = class e extends ri {
	static builder = () => new ko(Do, (t) => new e(t));
	subscriptionBuilder = () => new Oo(this);
};
// src/geo.ts
function jo(e) {
	let t = 0, n = 0, r = e.length / 2;
	for (let r = 0; r < e.length; r += 2) t += e[r], n += e[r + 1];
	return [t / r, n / r];
}
function Mo(...e) {
	let t = 2166136261;
	for (let n of e) {
		let e = String(n);
		for (let n = 0; n < e.length; n++) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
		t ^= 2654435769;
	}
	return t = Math.imul(t ^ t >>> 15, 2246822507), t = Math.imul(t ^ t >>> 13, 3266489909), ((t ^ t >>> 16) >>> 0) / 4294967296;
}
var No = class {
	pts = [];
	adj = [];
	index = /* @__PURE__ */ new Map();
	node(e, t) {
		let n = `${Math.round(e * 2)},${Math.round(t * 2)}`, r = this.index.get(n);
		return r === void 0 && (r = this.pts.length, this.pts.push([e, t]), this.adj.push([]), this.index.set(n, r)), r;
	}
	link(e, t) {
		if (e === t) return;
		let n = Math.hypot(this.pts[e][0] - this.pts[t][0], this.pts[e][1] - this.pts[t][1]);
		this.adj[e].push({
			to: t,
			d: n
		}), this.adj[t].push({
			to: e,
			d: n
		});
	}
	nearest(e, t) {
		let n = 0, r = Infinity;
		for (let i = 0; i < this.pts.length; i++) {
			let a = (this.pts[i][0] - e) ** 2 + (this.pts[i][1] - t) ** 2;
			a < r && (r = a, n = i);
		}
		return n;
	}
	treeTo(e) {
		let t = this.pts.length, n = new Float64Array(t).fill(Infinity), r = new Int32Array(t).fill(-1), i = new Uint8Array(t);
		n[e] = 0;
		for (let e = 0; e < t; e++) {
			let e = -1, a = Infinity;
			for (let r = 0; r < t; r++) !i[r] && n[r] < a && (a = n[r], e = r);
			if (e < 0) break;
			i[e] = 1;
			for (let { to: t, d: i } of this.adj[e]) n[e] + i < n[t] && (n[t] = n[e] + i, r[t] = e);
		}
		return r;
	}
};
function Po(e) {
	let t = [0];
	for (let n = 1; n < e.length; n++) t.push(t[n - 1] + Math.hypot(e[n][0] - e[n - 1][0], e[n][1] - e[n - 1][1]));
	return {
		pts: e,
		cum: t,
		length: t[t.length - 1]
	};
}
function Fo(e, t) {
	let n = Math.max(0, Math.min(1, t)) * e.length, r = 1;
	for (; r < e.cum.length - 1 && e.cum[r] < n;) r++;
	let i = e.cum[r] - e.cum[r - 1] || 1, a = (n - e.cum[r - 1]) / i, o = e.pts[r - 1], s = e.pts[r];
	return [o[0] + (s[0] - o[0]) * a, o[1] + (s[1] - o[1]) * a];
}
var Io = class {
	map;
	homes = [];
	homeDoors = [];
	cafeDoor;
	rivalDoor;
	graph = new No();
	toCafe;
	toRival;
	routeCache = /* @__PURE__ */ new Map();
	constructor(e) {
		this.map = e;
		for (let t of e.roads) {
			if (!t.walk) continue;
			let e = -1;
			for (let n = 0; n < t.p.length; n += 2) {
				let r = this.graph.node(t.p[n], t.p[n + 1]);
				e >= 0 && this.graph.link(e, r), e = r;
			}
		}
		this.cafeDoor = [e.cafe.x, e.cafe.y], this.rivalDoor = e.competitors[0] ? [e.competitors[0].x, e.competitors[0].y] : null;
		let t = this.graph.nearest(...this.cafeDoor);
		this.toCafe = this.graph.treeTo(t), this.toRival = this.rivalDoor ? this.graph.treeTo(this.graph.nearest(...this.rivalDoor)) : null, e.buildings.forEach((e, t) => {
			e.home && (this.homes.push(t), this.homeDoors.push(jo(e.p)));
		});
	}
	homeOf(e) {
		return Math.floor(Mo("home", e) * this.homes.length);
	}
	trees = /* @__PURE__ */ new Map();
	inside(e, t) {
		return Math.abs(e) <= this.map.radius && Math.abs(t) <= this.map.radius;
	}
	edgeToward(e, t) {
		let n = this.map.radius * .98 / Math.max(Math.abs(e), Math.abs(t), 1e-6);
		return [e * n, t * n];
	}
	routeToward(e, t, n, r) {
		let i = `${e}:${t}`, a = this.routeCache.get(i);
		if (a) return a;
		let o = this.inside(n, r) ? [n, r] : this.edgeToward(n, r), s = this.trees.get(t);
		!s && this.graph.pts.length && (s = this.graph.treeTo(this.graph.nearest(o[0], o[1])), this.trees.set(t, s));
		let c = this.homeDoors[e] ?? [0, 0], l = [c], u = this.graph.pts.length ? this.graph.nearest(...c) : -1, d = 0;
		for (; s && u >= 0 && d++ < 5e3;) {
			l.push(this.graph.pts[u]);
			let e = s[u];
			if (e < 0) break;
			u = e;
		}
		l.push(o);
		let f = Po(l);
		return this.routeCache.set(i, f), f;
	}
	route(e, t) {
		let n = `${e}:${t}`, r = this.routeCache.get(n);
		if (r) return r;
		let i = this.homeDoors[e] ?? [0, 0], a = t === "here" ? this.cafeDoor : this.rivalDoor ?? this.cafeDoor, o = t === "here" ? this.toCafe : this.toRival ?? this.toCafe, s = [i], c = this.graph.pts.length ? this.graph.nearest(...i) : -1, l = 0;
		for (; c >= 0 && l++ < 5e3;) {
			s.push(this.graph.pts[c]);
			let e = o[c];
			if (e < 0) break;
			c = e;
		}
		s.push(a);
		let u = Po(s);
		return this.routeCache.set(n, u), u;
	}
}, Lo = 1e3, Ro = 1001, zo = 1002, Bo = 1003, Vo = 1004, Ho = 1005, Uo = 1006, Wo = 1007, Go = 1008, Ko = 1009, qo = 1010, Jo = 1011, Yo = 1012, Xo = 1013, Zo = 1014, Qo = 1015, $o = 1016, es = 1017, ts = 1018, ns = 1020, rs = 35902, is = 35899, as = 1021, os = 1022, ss = 1023, cs = 1026, ls = 1027, us = 1028, ds = 1029, fs = 1030, ps = 1031, ms = 1033, hs = 33776, gs = 33777, _s = 33778, vs = 33779, ys = 35840, bs = 35841, xs = 35842, Ss = 35843, Cs = 36196, ws = 37492, Ts = 37496, Es = 37488, Ds = 37489, Os = 37490, ks = 37491, As = 37808, js = 37809, Ms = 37810, Ns = 37811, Ps = 37812, Fs = 37813, Is = 37814, Ls = 37815, Rs = 37816, zs = 37817, Bs = 37818, Vs = 37819, Hs = 37820, Us = 37821, Ws = 36492, Gs = 36494, Ks = 36495, qs = 36283, Js = 36284, Ys = 36285, Xs = 36286, Zs = 2300, Qs = 2301, $s = 2302, ec = 2303, tc = 2400, nc = 2401, rc = 2402, ic = 3200, ac = "srgb", oc = "srgb-linear", sc = "linear", cc = "srgb", lc = 7680, uc = 35044, dc = 35048, fc = 2e3;
function pc(e) {
	for (let t = e.length - 1; t >= 0; --t) if (e[t] >= 65535) return !0;
	return !1;
}
function mc(e) {
	return ArrayBuffer.isView(e) && !(e instanceof DataView);
}
function hc(e) {
	return document.createElementNS("http://www.w3.org/1999/xhtml", e);
}
function gc() {
	let e = hc("canvas");
	return e.style.display = "block", e;
}
var _c = {};
function vc(...e) {
	let t = "THREE." + e.shift();
	console.log(t, ...e);
}
function yc(e) {
	let t = e[0];
	if (typeof t == "string" && t.startsWith("TSL:")) {
		let t = e[1];
		t && t.isStackTrace ? e[0] += " " + t.getLocation() : e[1] = "Stack trace not available. Enable \"THREE.Node.captureStackTrace\" to capture stack traces.";
	}
	return e;
}
function W(...e) {
	e = yc(e);
	let t = "THREE." + e.shift();
	{
		let n = e[0];
		n && n.isStackTrace ? console.warn(n.getError(t)) : console.warn(t, ...e);
	}
}
function G(...e) {
	e = yc(e);
	let t = "THREE." + e.shift();
	{
		let n = e[0];
		n && n.isStackTrace ? console.error(n.getError(t)) : console.error(t, ...e);
	}
}
function bc(...e) {
	let t = e.join(" ");
	t in _c || (_c[t] = !0, W(...e));
}
function xc(e, t, n) {
	return new Promise(function(r, i) {
		function a() {
			switch (e.clientWaitSync(t, e.SYNC_FLUSH_COMMANDS_BIT, 0)) {
				case e.WAIT_FAILED:
					i();
					break;
				case e.TIMEOUT_EXPIRED:
					setTimeout(a, n);
					break;
				default: r();
			}
		}
		setTimeout(a, n);
	});
}
var Sc = {
	0: 1,
	2: 6,
	4: 7,
	3: 5,
	1: 0,
	6: 2,
	7: 4,
	5: 3
}, Cc = class {
	addEventListener(e, t) {
		this._listeners === void 0 && (this._listeners = {});
		let n = this._listeners;
		n[e] === void 0 && (n[e] = []), n[e].indexOf(t) === -1 && n[e].push(t);
	}
	hasEventListener(e, t) {
		let n = this._listeners;
		return n !== void 0 && n[e] !== void 0 && n[e].indexOf(t) !== -1;
	}
	removeEventListener(e, t) {
		let n = this._listeners;
		if (n === void 0) return;
		let r = n[e];
		if (r !== void 0) {
			let e = r.indexOf(t);
			e !== -1 && r.splice(e, 1);
		}
	}
	dispatchEvent(e) {
		let t = this._listeners;
		if (t === void 0) return;
		let n = t[e.type];
		if (n !== void 0) {
			e.target = this;
			let t = n.slice(0);
			for (let n = 0, r = t.length; n < r; n++) t[n].call(this, e);
			e.target = null;
		}
	}
}, wc = /* @__PURE__ */ "00.01.02.03.04.05.06.07.08.09.0a.0b.0c.0d.0e.0f.10.11.12.13.14.15.16.17.18.19.1a.1b.1c.1d.1e.1f.20.21.22.23.24.25.26.27.28.29.2a.2b.2c.2d.2e.2f.30.31.32.33.34.35.36.37.38.39.3a.3b.3c.3d.3e.3f.40.41.42.43.44.45.46.47.48.49.4a.4b.4c.4d.4e.4f.50.51.52.53.54.55.56.57.58.59.5a.5b.5c.5d.5e.5f.60.61.62.63.64.65.66.67.68.69.6a.6b.6c.6d.6e.6f.70.71.72.73.74.75.76.77.78.79.7a.7b.7c.7d.7e.7f.80.81.82.83.84.85.86.87.88.89.8a.8b.8c.8d.8e.8f.90.91.92.93.94.95.96.97.98.99.9a.9b.9c.9d.9e.9f.a0.a1.a2.a3.a4.a5.a6.a7.a8.a9.aa.ab.ac.ad.ae.af.b0.b1.b2.b3.b4.b5.b6.b7.b8.b9.ba.bb.bc.bd.be.bf.c0.c1.c2.c3.c4.c5.c6.c7.c8.c9.ca.cb.cc.cd.ce.cf.d0.d1.d2.d3.d4.d5.d6.d7.d8.d9.da.db.dc.dd.de.df.e0.e1.e2.e3.e4.e5.e6.e7.e8.e9.ea.eb.ec.ed.ee.ef.f0.f1.f2.f3.f4.f5.f6.f7.f8.f9.fa.fb.fc.fd.fe.ff".split("."), Tc = Math.PI / 180, Ec = 180 / Math.PI;
function Dc() {
	let e = Math.random() * 4294967295 | 0, t = Math.random() * 4294967295 | 0, n = Math.random() * 4294967295 | 0, r = Math.random() * 4294967295 | 0;
	return (wc[e & 255] + wc[e >> 8 & 255] + wc[e >> 16 & 255] + wc[e >> 24 & 255] + "-" + wc[t & 255] + wc[t >> 8 & 255] + "-" + wc[t >> 16 & 15 | 64] + wc[t >> 24 & 255] + "-" + wc[n & 63 | 128] + wc[n >> 8 & 255] + "-" + wc[n >> 16 & 255] + wc[n >> 24 & 255] + wc[r & 255] + wc[r >> 8 & 255] + wc[r >> 16 & 255] + wc[r >> 24 & 255]).toLowerCase();
}
function K(e, t, n) {
	return Math.max(t, Math.min(n, e));
}
function Oc(e, t) {
	return (e % t + t) % t;
}
function kc(e, t, n) {
	return (1 - n) * e + n * t;
}
function Ac(e, t) {
	switch (t.constructor) {
		case Float32Array: return e;
		case Uint32Array: return e / 4294967295;
		case Uint16Array: return e / 65535;
		case Uint8Array:
		case Uint8ClampedArray: return e / 255;
		case Int32Array: return Math.max(e / 2147483647, -1);
		case Int16Array: return Math.max(e / 32767, -1);
		case Int8Array: return Math.max(e / 127, -1);
		default: throw Error("THREE.MathUtils: Invalid component type.");
	}
}
function jc(e, t) {
	switch (t.constructor) {
		case Float32Array: return e;
		case Uint32Array: return Math.round(e * 4294967295);
		case Uint16Array: return Math.round(e * 65535);
		case Uint8Array:
		case Uint8ClampedArray: return Math.round(e * 255);
		case Int32Array: return Math.round(e * 2147483647);
		case Int16Array: return Math.round(e * 32767);
		case Int8Array: return Math.round(e * 127);
		default: throw Error("THREE.MathUtils: Invalid component type.");
	}
}
var q = class e {
	static {
		e.prototype.isVector2 = !0;
	}
	constructor(e = 0, t = 0) {
		this.x = e, this.y = t;
	}
	get width() {
		return this.x;
	}
	set width(e) {
		this.x = e;
	}
	get height() {
		return this.y;
	}
	set height(e) {
		this.y = e;
	}
	set(e, t) {
		return this.x = e, this.y = t, this;
	}
	setScalar(e) {
		return this.x = e, this.y = e, this;
	}
	setX(e) {
		return this.x = e, this;
	}
	setY(e) {
		return this.y = e, this;
	}
	setComponent(e, t) {
		switch (e) {
			case 0:
				this.x = t;
				break;
			case 1:
				this.y = t;
				break;
			default: throw Error("THREE.Vector2: index is out of range: " + e);
		}
		return this;
	}
	getComponent(e) {
		switch (e) {
			case 0: return this.x;
			case 1: return this.y;
			default: throw Error("THREE.Vector2: index is out of range: " + e);
		}
	}
	clone() {
		return new this.constructor(this.x, this.y);
	}
	copy(e) {
		return this.x = e.x, this.y = e.y, this;
	}
	add(e) {
		return this.x += e.x, this.y += e.y, this;
	}
	addScalar(e) {
		return this.x += e, this.y += e, this;
	}
	addVectors(e, t) {
		return this.x = e.x + t.x, this.y = e.y + t.y, this;
	}
	addScaledVector(e, t) {
		return this.x += e.x * t, this.y += e.y * t, this;
	}
	sub(e) {
		return this.x -= e.x, this.y -= e.y, this;
	}
	subScalar(e) {
		return this.x -= e, this.y -= e, this;
	}
	subVectors(e, t) {
		return this.x = e.x - t.x, this.y = e.y - t.y, this;
	}
	multiply(e) {
		return this.x *= e.x, this.y *= e.y, this;
	}
	multiplyScalar(e) {
		return this.x *= e, this.y *= e, this;
	}
	divide(e) {
		return this.x /= e.x, this.y /= e.y, this;
	}
	divideScalar(e) {
		return this.multiplyScalar(1 / e);
	}
	applyMatrix3(e) {
		let t = this.x, n = this.y, r = e.elements;
		return this.x = r[0] * t + r[3] * n + r[6], this.y = r[1] * t + r[4] * n + r[7], this;
	}
	min(e) {
		return this.x = Math.min(this.x, e.x), this.y = Math.min(this.y, e.y), this;
	}
	max(e) {
		return this.x = Math.max(this.x, e.x), this.y = Math.max(this.y, e.y), this;
	}
	clamp(e, t) {
		return this.x = K(this.x, e.x, t.x), this.y = K(this.y, e.y, t.y), this;
	}
	clampScalar(e, t) {
		return this.x = K(this.x, e, t), this.y = K(this.y, e, t), this;
	}
	clampLength(e, t) {
		let n = this.length();
		return this.divideScalar(n || 1).multiplyScalar(K(n, e, t));
	}
	floor() {
		return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this;
	}
	ceil() {
		return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this;
	}
	round() {
		return this.x = Math.round(this.x), this.y = Math.round(this.y), this;
	}
	roundToZero() {
		return this.x = Math.trunc(this.x), this.y = Math.trunc(this.y), this;
	}
	negate() {
		return this.x = -this.x, this.y = -this.y, this;
	}
	dot(e) {
		return this.x * e.x + this.y * e.y;
	}
	cross(e) {
		return this.x * e.y - this.y * e.x;
	}
	lengthSq() {
		return this.x * this.x + this.y * this.y;
	}
	length() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}
	manhattanLength() {
		return Math.abs(this.x) + Math.abs(this.y);
	}
	normalize() {
		return this.divideScalar(this.length() || 1);
	}
	angle() {
		return Math.atan2(-this.y, -this.x) + Math.PI;
	}
	angleTo(e) {
		let t = Math.sqrt(this.lengthSq() * e.lengthSq());
		if (t === 0) return Math.PI / 2;
		let n = this.dot(e) / t;
		return Math.acos(K(n, -1, 1));
	}
	distanceTo(e) {
		return Math.sqrt(this.distanceToSquared(e));
	}
	distanceToSquared(e) {
		let t = this.x - e.x, n = this.y - e.y;
		return t * t + n * n;
	}
	manhattanDistanceTo(e) {
		return Math.abs(this.x - e.x) + Math.abs(this.y - e.y);
	}
	setLength(e) {
		return this.normalize().multiplyScalar(e);
	}
	lerp(e, t) {
		return this.x += (e.x - this.x) * t, this.y += (e.y - this.y) * t, this;
	}
	lerpVectors(e, t, n) {
		return this.x = e.x + (t.x - e.x) * n, this.y = e.y + (t.y - e.y) * n, this;
	}
	equals(e) {
		return e.x === this.x && e.y === this.y;
	}
	fromArray(e, t = 0) {
		return this.x = e[t], this.y = e[t + 1], this;
	}
	toArray(e = [], t = 0) {
		return e[t] = this.x, e[t + 1] = this.y, e;
	}
	fromBufferAttribute(e, t) {
		return this.x = e.getX(t), this.y = e.getY(t), this;
	}
	rotateAround(e, t) {
		let n = Math.cos(t), r = Math.sin(t), i = this.x - e.x, a = this.y - e.y;
		return this.x = i * n - a * r + e.x, this.y = i * r + a * n + e.y, this;
	}
	random() {
		return this.x = Math.random(), this.y = Math.random(), this;
	}
	*[Symbol.iterator]() {
		yield this.x, yield this.y;
	}
}, Mc = class {
	constructor(e = 0, t = 0, n = 0, r = 1) {
		this.isQuaternion = !0, this._x = e, this._y = t, this._z = n, this._w = r;
	}
	static slerpFlat(e, t, n, r, i, a, o) {
		let s = n[r + 0], c = n[r + 1], l = n[r + 2], u = n[r + 3], d = i[a + 0], f = i[a + 1], p = i[a + 2], m = i[a + 3];
		if (u !== m || s !== d || c !== f || l !== p) {
			let e = s * d + c * f + l * p + u * m;
			e < 0 && (d = -d, f = -f, p = -p, m = -m, e = -e);
			let t = 1 - o;
			if (e < .9995) {
				let n = Math.acos(e), r = Math.sin(n);
				t = Math.sin(t * n) / r, o = Math.sin(o * n) / r, s = s * t + d * o, c = c * t + f * o, l = l * t + p * o, u = u * t + m * o;
			} else {
				s = s * t + d * o, c = c * t + f * o, l = l * t + p * o, u = u * t + m * o;
				let e = 1 / Math.sqrt(s * s + c * c + l * l + u * u);
				s *= e, c *= e, l *= e, u *= e;
			}
		}
		e[t] = s, e[t + 1] = c, e[t + 2] = l, e[t + 3] = u;
	}
	static multiplyQuaternionsFlat(e, t, n, r, i, a) {
		let o = n[r], s = n[r + 1], c = n[r + 2], l = n[r + 3], u = i[a], d = i[a + 1], f = i[a + 2], p = i[a + 3];
		return e[t] = o * p + l * u + s * f - c * d, e[t + 1] = s * p + l * d + c * u - o * f, e[t + 2] = c * p + l * f + o * d - s * u, e[t + 3] = l * p - o * u - s * d - c * f, e;
	}
	get x() {
		return this._x;
	}
	set x(e) {
		this._x = e, this._onChangeCallback();
	}
	get y() {
		return this._y;
	}
	set y(e) {
		this._y = e, this._onChangeCallback();
	}
	get z() {
		return this._z;
	}
	set z(e) {
		this._z = e, this._onChangeCallback();
	}
	get w() {
		return this._w;
	}
	set w(e) {
		this._w = e, this._onChangeCallback();
	}
	set(e, t, n, r) {
		return this._x = e, this._y = t, this._z = n, this._w = r, this._onChangeCallback(), this;
	}
	clone() {
		return new this.constructor(this._x, this._y, this._z, this._w);
	}
	copy(e) {
		return this._x = e.x, this._y = e.y, this._z = e.z, this._w = e.w, this._onChangeCallback(), this;
	}
	setFromEuler(e, t = !0) {
		let n = e._x, r = e._y, i = e._z, a = e._order, o = Math.cos, s = Math.sin, c = o(n / 2), l = o(r / 2), u = o(i / 2), d = s(n / 2), f = s(r / 2), p = s(i / 2);
		switch (a) {
			case "XYZ":
				this._x = d * l * u + c * f * p, this._y = c * f * u - d * l * p, this._z = c * l * p + d * f * u, this._w = c * l * u - d * f * p;
				break;
			case "YXZ":
				this._x = d * l * u + c * f * p, this._y = c * f * u - d * l * p, this._z = c * l * p - d * f * u, this._w = c * l * u + d * f * p;
				break;
			case "ZXY":
				this._x = d * l * u - c * f * p, this._y = c * f * u + d * l * p, this._z = c * l * p + d * f * u, this._w = c * l * u - d * f * p;
				break;
			case "ZYX":
				this._x = d * l * u - c * f * p, this._y = c * f * u + d * l * p, this._z = c * l * p - d * f * u, this._w = c * l * u + d * f * p;
				break;
			case "YZX":
				this._x = d * l * u + c * f * p, this._y = c * f * u + d * l * p, this._z = c * l * p - d * f * u, this._w = c * l * u - d * f * p;
				break;
			case "XZY":
				this._x = d * l * u - c * f * p, this._y = c * f * u - d * l * p, this._z = c * l * p + d * f * u, this._w = c * l * u + d * f * p;
				break;
			default: W("Quaternion: .setFromEuler() encountered an unknown order: " + a);
		}
		return t === !0 && this._onChangeCallback(), this;
	}
	setFromAxisAngle(e, t) {
		let n = t / 2, r = Math.sin(n);
		return this._x = e.x * r, this._y = e.y * r, this._z = e.z * r, this._w = Math.cos(n), this._onChangeCallback(), this;
	}
	setFromRotationMatrix(e) {
		let t = e.elements, n = t[0], r = t[4], i = t[8], a = t[1], o = t[5], s = t[9], c = t[2], l = t[6], u = t[10], d = n + o + u;
		if (d > 0) {
			let e = .5 / Math.sqrt(d + 1);
			this._w = .25 / e, this._x = (l - s) * e, this._y = (i - c) * e, this._z = (a - r) * e;
		} else if (n > o && n > u) {
			let e = 2 * Math.sqrt(1 + n - o - u);
			this._w = (l - s) / e, this._x = .25 * e, this._y = (r + a) / e, this._z = (i + c) / e;
		} else if (o > u) {
			let e = 2 * Math.sqrt(1 + o - n - u);
			this._w = (i - c) / e, this._x = (r + a) / e, this._y = .25 * e, this._z = (s + l) / e;
		} else {
			let e = 2 * Math.sqrt(1 + u - n - o);
			this._w = (a - r) / e, this._x = (i + c) / e, this._y = (s + l) / e, this._z = .25 * e;
		}
		return this._onChangeCallback(), this;
	}
	setFromUnitVectors(e, t) {
		let n = e.dot(t) + 1;
		return n < 1e-8 ? (n = 0, Math.abs(e.x) > Math.abs(e.z) ? (this._x = -e.y, this._y = e.x, this._z = 0, this._w = n) : (this._x = 0, this._y = -e.z, this._z = e.y, this._w = n)) : (this._x = e.y * t.z - e.z * t.y, this._y = e.z * t.x - e.x * t.z, this._z = e.x * t.y - e.y * t.x, this._w = n), this.normalize();
	}
	angleTo(e) {
		return 2 * Math.acos(Math.abs(K(this.dot(e), -1, 1)));
	}
	rotateTowards(e, t) {
		let n = this.angleTo(e);
		if (n === 0) return this;
		let r = Math.min(1, t / n);
		return this.slerp(e, r), this;
	}
	identity() {
		return this.set(0, 0, 0, 1);
	}
	invert() {
		return this.conjugate();
	}
	conjugate() {
		return this._x *= -1, this._y *= -1, this._z *= -1, this._onChangeCallback(), this;
	}
	dot(e) {
		return this._x * e._x + this._y * e._y + this._z * e._z + this._w * e._w;
	}
	lengthSq() {
		return this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w;
	}
	length() {
		return Math.sqrt(this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w);
	}
	normalize() {
		let e = this.length();
		return e === 0 ? (this._x = 0, this._y = 0, this._z = 0, this._w = 1) : (e = 1 / e, this._x *= e, this._y *= e, this._z *= e, this._w *= e), this._onChangeCallback(), this;
	}
	multiply(e) {
		return this.multiplyQuaternions(this, e);
	}
	premultiply(e) {
		return this.multiplyQuaternions(e, this);
	}
	multiplyQuaternions(e, t) {
		let n = e._x, r = e._y, i = e._z, a = e._w, o = t._x, s = t._y, c = t._z, l = t._w;
		return this._x = n * l + a * o + r * c - i * s, this._y = r * l + a * s + i * o - n * c, this._z = i * l + a * c + n * s - r * o, this._w = a * l - n * o - r * s - i * c, this._onChangeCallback(), this;
	}
	slerp(e, t) {
		let n = e._x, r = e._y, i = e._z, a = e._w, o = this.dot(e);
		o < 0 && (n = -n, r = -r, i = -i, a = -a, o = -o);
		let s = 1 - t;
		if (o < .9995) {
			let e = Math.acos(o), c = Math.sin(e);
			s = Math.sin(s * e) / c, t = Math.sin(t * e) / c, this._x = this._x * s + n * t, this._y = this._y * s + r * t, this._z = this._z * s + i * t, this._w = this._w * s + a * t, this._onChangeCallback();
		} else this._x = this._x * s + n * t, this._y = this._y * s + r * t, this._z = this._z * s + i * t, this._w = this._w * s + a * t, this.normalize();
		return this;
	}
	slerpQuaternions(e, t, n) {
		return this.copy(e).slerp(t, n);
	}
	random() {
		let e = 2 * Math.PI * Math.random(), t = 2 * Math.PI * Math.random(), n = Math.random(), r = Math.sqrt(1 - n), i = Math.sqrt(n);
		return this.set(r * Math.sin(e), r * Math.cos(e), i * Math.sin(t), i * Math.cos(t));
	}
	equals(e) {
		return e._x === this._x && e._y === this._y && e._z === this._z && e._w === this._w;
	}
	fromArray(e, t = 0) {
		return this._x = e[t], this._y = e[t + 1], this._z = e[t + 2], this._w = e[t + 3], this._onChangeCallback(), this;
	}
	toArray(e = [], t = 0) {
		return e[t] = this._x, e[t + 1] = this._y, e[t + 2] = this._z, e[t + 3] = this._w, e;
	}
	fromBufferAttribute(e, t) {
		return this._x = e.getX(t), this._y = e.getY(t), this._z = e.getZ(t), this._w = e.getW(t), this._onChangeCallback(), this;
	}
	toJSON() {
		return this.toArray();
	}
	_onChange(e) {
		return this._onChangeCallback = e, this;
	}
	_onChangeCallback() {}
	*[Symbol.iterator]() {
		yield this._x, yield this._y, yield this._z, yield this._w;
	}
}, J = class e {
	static {
		e.prototype.isVector3 = !0;
	}
	constructor(e = 0, t = 0, n = 0) {
		this.x = e, this.y = t, this.z = n;
	}
	set(e, t, n) {
		return n === void 0 && (n = this.z), this.x = e, this.y = t, this.z = n, this;
	}
	setScalar(e) {
		return this.x = e, this.y = e, this.z = e, this;
	}
	setX(e) {
		return this.x = e, this;
	}
	setY(e) {
		return this.y = e, this;
	}
	setZ(e) {
		return this.z = e, this;
	}
	setComponent(e, t) {
		switch (e) {
			case 0:
				this.x = t;
				break;
			case 1:
				this.y = t;
				break;
			case 2:
				this.z = t;
				break;
			default: throw Error("THREE.Vector3: index is out of range: " + e);
		}
		return this;
	}
	getComponent(e) {
		switch (e) {
			case 0: return this.x;
			case 1: return this.y;
			case 2: return this.z;
			default: throw Error("THREE.Vector3: index is out of range: " + e);
		}
	}
	clone() {
		return new this.constructor(this.x, this.y, this.z);
	}
	copy(e) {
		return this.x = e.x, this.y = e.y, this.z = e.z, this;
	}
	add(e) {
		return this.x += e.x, this.y += e.y, this.z += e.z, this;
	}
	addScalar(e) {
		return this.x += e, this.y += e, this.z += e, this;
	}
	addVectors(e, t) {
		return this.x = e.x + t.x, this.y = e.y + t.y, this.z = e.z + t.z, this;
	}
	addScaledVector(e, t) {
		return this.x += e.x * t, this.y += e.y * t, this.z += e.z * t, this;
	}
	sub(e) {
		return this.x -= e.x, this.y -= e.y, this.z -= e.z, this;
	}
	subScalar(e) {
		return this.x -= e, this.y -= e, this.z -= e, this;
	}
	subVectors(e, t) {
		return this.x = e.x - t.x, this.y = e.y - t.y, this.z = e.z - t.z, this;
	}
	multiply(e) {
		return this.x *= e.x, this.y *= e.y, this.z *= e.z, this;
	}
	multiplyScalar(e) {
		return this.x *= e, this.y *= e, this.z *= e, this;
	}
	multiplyVectors(e, t) {
		return this.x = e.x * t.x, this.y = e.y * t.y, this.z = e.z * t.z, this;
	}
	applyEuler(e) {
		return this.applyQuaternion(Pc.setFromEuler(e));
	}
	applyAxisAngle(e, t) {
		return this.applyQuaternion(Pc.setFromAxisAngle(e, t));
	}
	applyMatrix3(e) {
		let t = this.x, n = this.y, r = this.z, i = e.elements;
		return this.x = i[0] * t + i[3] * n + i[6] * r, this.y = i[1] * t + i[4] * n + i[7] * r, this.z = i[2] * t + i[5] * n + i[8] * r, this;
	}
	applyNormalMatrix(e) {
		return this.applyMatrix3(e).normalize();
	}
	applyMatrix4(e) {
		let t = this.x, n = this.y, r = this.z, i = e.elements, a = 1 / (i[3] * t + i[7] * n + i[11] * r + i[15]);
		return this.x = (i[0] * t + i[4] * n + i[8] * r + i[12]) * a, this.y = (i[1] * t + i[5] * n + i[9] * r + i[13]) * a, this.z = (i[2] * t + i[6] * n + i[10] * r + i[14]) * a, this;
	}
	applyQuaternion(e) {
		let t = this.x, n = this.y, r = this.z, i = e.x, a = e.y, o = e.z, s = e.w, c = 2 * (a * r - o * n), l = 2 * (o * t - i * r), u = 2 * (i * n - a * t);
		return this.x = t + s * c + a * u - o * l, this.y = n + s * l + o * c - i * u, this.z = r + s * u + i * l - a * c, this;
	}
	project(e) {
		return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix);
	}
	unproject(e) {
		return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld);
	}
	transformDirection(e) {
		let t = this.x, n = this.y, r = this.z, i = e.elements;
		return this.x = i[0] * t + i[4] * n + i[8] * r, this.y = i[1] * t + i[5] * n + i[9] * r, this.z = i[2] * t + i[6] * n + i[10] * r, this.normalize();
	}
	divide(e) {
		return this.x /= e.x, this.y /= e.y, this.z /= e.z, this;
	}
	divideScalar(e) {
		return this.multiplyScalar(1 / e);
	}
	min(e) {
		return this.x = Math.min(this.x, e.x), this.y = Math.min(this.y, e.y), this.z = Math.min(this.z, e.z), this;
	}
	max(e) {
		return this.x = Math.max(this.x, e.x), this.y = Math.max(this.y, e.y), this.z = Math.max(this.z, e.z), this;
	}
	clamp(e, t) {
		return this.x = K(this.x, e.x, t.x), this.y = K(this.y, e.y, t.y), this.z = K(this.z, e.z, t.z), this;
	}
	clampScalar(e, t) {
		return this.x = K(this.x, e, t), this.y = K(this.y, e, t), this.z = K(this.z, e, t), this;
	}
	clampLength(e, t) {
		let n = this.length();
		return this.divideScalar(n || 1).multiplyScalar(K(n, e, t));
	}
	floor() {
		return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this.z = Math.floor(this.z), this;
	}
	ceil() {
		return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this.z = Math.ceil(this.z), this;
	}
	round() {
		return this.x = Math.round(this.x), this.y = Math.round(this.y), this.z = Math.round(this.z), this;
	}
	roundToZero() {
		return this.x = Math.trunc(this.x), this.y = Math.trunc(this.y), this.z = Math.trunc(this.z), this;
	}
	negate() {
		return this.x = -this.x, this.y = -this.y, this.z = -this.z, this;
	}
	dot(e) {
		return this.x * e.x + this.y * e.y + this.z * e.z;
	}
	lengthSq() {
		return this.x * this.x + this.y * this.y + this.z * this.z;
	}
	length() {
		return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
	}
	manhattanLength() {
		return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
	}
	normalize() {
		return this.divideScalar(this.length() || 1);
	}
	setLength(e) {
		return this.normalize().multiplyScalar(e);
	}
	lerp(e, t) {
		return this.x += (e.x - this.x) * t, this.y += (e.y - this.y) * t, this.z += (e.z - this.z) * t, this;
	}
	lerpVectors(e, t, n) {
		return this.x = e.x + (t.x - e.x) * n, this.y = e.y + (t.y - e.y) * n, this.z = e.z + (t.z - e.z) * n, this;
	}
	cross(e) {
		return this.crossVectors(this, e);
	}
	crossVectors(e, t) {
		let n = e.x, r = e.y, i = e.z, a = t.x, o = t.y, s = t.z;
		return this.x = r * s - i * o, this.y = i * a - n * s, this.z = n * o - r * a, this;
	}
	projectOnVector(e) {
		let t = e.lengthSq();
		if (t === 0) return this.set(0, 0, 0);
		let n = e.dot(this) / t;
		return this.copy(e).multiplyScalar(n);
	}
	projectOnPlane(e) {
		return Nc.copy(this).projectOnVector(e), this.sub(Nc);
	}
	reflect(e) {
		return this.sub(Nc.copy(e).multiplyScalar(2 * this.dot(e)));
	}
	angleTo(e) {
		let t = Math.sqrt(this.lengthSq() * e.lengthSq());
		if (t === 0) return Math.PI / 2;
		let n = this.dot(e) / t;
		return Math.acos(K(n, -1, 1));
	}
	distanceTo(e) {
		return Math.sqrt(this.distanceToSquared(e));
	}
	distanceToSquared(e) {
		let t = this.x - e.x, n = this.y - e.y, r = this.z - e.z;
		return t * t + n * n + r * r;
	}
	manhattanDistanceTo(e) {
		return Math.abs(this.x - e.x) + Math.abs(this.y - e.y) + Math.abs(this.z - e.z);
	}
	setFromSpherical(e) {
		return this.setFromSphericalCoords(e.radius, e.phi, e.theta);
	}
	setFromSphericalCoords(e, t, n) {
		let r = Math.sin(t) * e;
		return this.x = r * Math.sin(n), this.y = Math.cos(t) * e, this.z = r * Math.cos(n), this;
	}
	setFromCylindrical(e) {
		return this.setFromCylindricalCoords(e.radius, e.theta, e.y);
	}
	setFromCylindricalCoords(e, t, n) {
		return this.x = e * Math.sin(t), this.y = n, this.z = e * Math.cos(t), this;
	}
	setFromMatrixPosition(e) {
		let t = e.elements;
		return this.x = t[12], this.y = t[13], this.z = t[14], this;
	}
	setFromMatrixScale(e) {
		let t = this.setFromMatrixColumn(e, 0).length(), n = this.setFromMatrixColumn(e, 1).length(), r = this.setFromMatrixColumn(e, 2).length();
		return this.x = t, this.y = n, this.z = r, this;
	}
	setFromMatrixColumn(e, t) {
		return this.fromArray(e.elements, t * 4);
	}
	setFromMatrix3Column(e, t) {
		return this.fromArray(e.elements, t * 3);
	}
	setFromEuler(e) {
		return this.x = e._x, this.y = e._y, this.z = e._z, this;
	}
	setFromColor(e) {
		return this.x = e.r, this.y = e.g, this.z = e.b, this;
	}
	equals(e) {
		return e.x === this.x && e.y === this.y && e.z === this.z;
	}
	fromArray(e, t = 0) {
		return this.x = e[t], this.y = e[t + 1], this.z = e[t + 2], this;
	}
	toArray(e = [], t = 0) {
		return e[t] = this.x, e[t + 1] = this.y, e[t + 2] = this.z, e;
	}
	fromBufferAttribute(e, t) {
		return this.x = e.getX(t), this.y = e.getY(t), this.z = e.getZ(t), this;
	}
	random() {
		return this.x = Math.random(), this.y = Math.random(), this.z = Math.random(), this;
	}
	randomDirection() {
		let e = Math.random() * Math.PI * 2, t = Math.random() * 2 - 1, n = Math.sqrt(1 - t * t);
		return this.x = n * Math.cos(e), this.y = t, this.z = n * Math.sin(e), this;
	}
	*[Symbol.iterator]() {
		yield this.x, yield this.y, yield this.z;
	}
}, Nc = /*@__PURE__*/ new J(), Pc = /*@__PURE__*/ new Mc(), Y = class e {
	static {
		e.prototype.isMatrix3 = !0;
	}
	constructor(e, t, n, r, i, a, o, s, c) {
		this.elements = [
			1,
			0,
			0,
			0,
			1,
			0,
			0,
			0,
			1
		], e !== void 0 && this.set(e, t, n, r, i, a, o, s, c);
	}
	set(e, t, n, r, i, a, o, s, c) {
		let l = this.elements;
		return l[0] = e, l[1] = r, l[2] = o, l[3] = t, l[4] = i, l[5] = s, l[6] = n, l[7] = a, l[8] = c, this;
	}
	identity() {
		return this.set(1, 0, 0, 0, 1, 0, 0, 0, 1), this;
	}
	copy(e) {
		let t = this.elements, n = e.elements;
		return t[0] = n[0], t[1] = n[1], t[2] = n[2], t[3] = n[3], t[4] = n[4], t[5] = n[5], t[6] = n[6], t[7] = n[7], t[8] = n[8], this;
	}
	extractBasis(e, t, n) {
		return e.setFromMatrix3Column(this, 0), t.setFromMatrix3Column(this, 1), n.setFromMatrix3Column(this, 2), this;
	}
	setFromMatrix4(e) {
		let t = e.elements;
		return this.set(t[0], t[4], t[8], t[1], t[5], t[9], t[2], t[6], t[10]), this;
	}
	multiply(e) {
		return this.multiplyMatrices(this, e);
	}
	premultiply(e) {
		return this.multiplyMatrices(e, this);
	}
	multiplyMatrices(e, t) {
		let n = e.elements, r = t.elements, i = this.elements, a = n[0], o = n[3], s = n[6], c = n[1], l = n[4], u = n[7], d = n[2], f = n[5], p = n[8], m = r[0], h = r[3], g = r[6], _ = r[1], v = r[4], y = r[7], b = r[2], x = r[5], S = r[8];
		return i[0] = a * m + o * _ + s * b, i[3] = a * h + o * v + s * x, i[6] = a * g + o * y + s * S, i[1] = c * m + l * _ + u * b, i[4] = c * h + l * v + u * x, i[7] = c * g + l * y + u * S, i[2] = d * m + f * _ + p * b, i[5] = d * h + f * v + p * x, i[8] = d * g + f * y + p * S, this;
	}
	multiplyScalar(e) {
		let t = this.elements;
		return t[0] *= e, t[3] *= e, t[6] *= e, t[1] *= e, t[4] *= e, t[7] *= e, t[2] *= e, t[5] *= e, t[8] *= e, this;
	}
	determinant() {
		let e = this.elements, t = e[0], n = e[1], r = e[2], i = e[3], a = e[4], o = e[5], s = e[6], c = e[7], l = e[8];
		return t * a * l - t * o * c - n * i * l + n * o * s + r * i * c - r * a * s;
	}
	invert() {
		let e = this.elements, t = e[0], n = e[1], r = e[2], i = e[3], a = e[4], o = e[5], s = e[6], c = e[7], l = e[8], u = l * a - o * c, d = o * s - l * i, f = c * i - a * s, p = t * u + n * d + r * f;
		if (p === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0);
		let m = 1 / p;
		return e[0] = u * m, e[1] = (r * c - l * n) * m, e[2] = (o * n - r * a) * m, e[3] = d * m, e[4] = (l * t - r * s) * m, e[5] = (r * i - o * t) * m, e[6] = f * m, e[7] = (n * s - c * t) * m, e[8] = (a * t - n * i) * m, this;
	}
	transpose() {
		let e, t = this.elements;
		return e = t[1], t[1] = t[3], t[3] = e, e = t[2], t[2] = t[6], t[6] = e, e = t[5], t[5] = t[7], t[7] = e, this;
	}
	getNormalMatrix(e) {
		return this.setFromMatrix4(e).invert().transpose();
	}
	transposeIntoArray(e) {
		let t = this.elements;
		return e[0] = t[0], e[1] = t[3], e[2] = t[6], e[3] = t[1], e[4] = t[4], e[5] = t[7], e[6] = t[2], e[7] = t[5], e[8] = t[8], this;
	}
	setUvTransform(e, t, n, r, i, a, o) {
		let s = Math.cos(i), c = Math.sin(i);
		return this.set(n * s, n * c, -n * (s * a + c * o) + a + e, -r * c, r * s, -r * (-c * a + s * o) + o + t, 0, 0, 1), this;
	}
	scale(e, t) {
		return bc("Matrix3: .scale() is deprecated. Use .makeScale() instead."), this.premultiply(Fc.makeScale(e, t)), this;
	}
	rotate(e) {
		return bc("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."), this.premultiply(Fc.makeRotation(-e)), this;
	}
	translate(e, t) {
		return bc("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."), this.premultiply(Fc.makeTranslation(e, t)), this;
	}
	makeTranslation(e, t) {
		return e.isVector2 ? this.set(1, 0, e.x, 0, 1, e.y, 0, 0, 1) : this.set(1, 0, e, 0, 1, t, 0, 0, 1), this;
	}
	makeRotation(e) {
		let t = Math.cos(e), n = Math.sin(e);
		return this.set(t, -n, 0, n, t, 0, 0, 0, 1), this;
	}
	makeScale(e, t) {
		return this.set(e, 0, 0, 0, t, 0, 0, 0, 1), this;
	}
	equals(e) {
		let t = this.elements, n = e.elements;
		for (let e = 0; e < 9; e++) if (t[e] !== n[e]) return !1;
		return !0;
	}
	fromArray(e, t = 0) {
		for (let n = 0; n < 9; n++) this.elements[n] = e[n + t];
		return this;
	}
	toArray(e = [], t = 0) {
		let n = this.elements;
		return e[t] = n[0], e[t + 1] = n[1], e[t + 2] = n[2], e[t + 3] = n[3], e[t + 4] = n[4], e[t + 5] = n[5], e[t + 6] = n[6], e[t + 7] = n[7], e[t + 8] = n[8], e;
	}
	clone() {
		return new this.constructor().fromArray(this.elements);
	}
}, Fc = /*@__PURE__*/ new Y(), Ic = /*@__PURE__*/ new Y().set(.4123908, .3575843, .1804808, .212639, .7151687, .0721923, .0193308, .1191948, .9505322), Lc = /*@__PURE__*/ new Y().set(3.2409699, -1.5373832, -.4986108, -.9692436, 1.8759675, .0415551, .0556301, -.203977, 1.0569715);
function Rc() {
	let e = {
		enabled: !0,
		workingColorSpace: oc,
		spaces: {},
		convert: function(e, t, n) {
			return this.enabled === !1 || t === n || !t || !n || (this.spaces[t].transfer === "srgb" && (e.r = zc(e.r), e.g = zc(e.g), e.b = zc(e.b)), this.spaces[t].primaries !== this.spaces[n].primaries && (e.applyMatrix3(this.spaces[t].toXYZ), e.applyMatrix3(this.spaces[n].fromXYZ)), this.spaces[n].transfer === "srgb" && (e.r = Bc(e.r), e.g = Bc(e.g), e.b = Bc(e.b))), e;
		},
		workingToColorSpace: function(e, t) {
			return this.convert(e, this.workingColorSpace, t);
		},
		colorSpaceToWorking: function(e, t) {
			return this.convert(e, t, this.workingColorSpace);
		},
		getPrimaries: function(e) {
			return this.spaces[e].primaries;
		},
		getTransfer: function(e) {
			return e === "" ? sc : this.spaces[e].transfer;
		},
		getToneMappingMode: function(e) {
			return this.spaces[e].outputColorSpaceConfig.toneMappingMode || "standard";
		},
		getLuminanceCoefficients: function(e, t = this.workingColorSpace) {
			return e.fromArray(this.spaces[t].luminanceCoefficients);
		},
		define: function(e) {
			Object.assign(this.spaces, e);
		},
		_getMatrix: function(e, t, n) {
			return e.copy(this.spaces[t].toXYZ).multiply(this.spaces[n].fromXYZ);
		},
		_getDrawingBufferColorSpace: function(e) {
			return this.spaces[e].outputColorSpaceConfig.drawingBufferColorSpace;
		},
		_getUnpackColorSpace: function(e = this.workingColorSpace) {
			return this.spaces[e].workingColorSpaceConfig.unpackColorSpace;
		},
		fromWorkingColorSpace: function(t, n) {
			return bc("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."), e.workingToColorSpace(t, n);
		},
		toWorkingColorSpace: function(t, n) {
			return bc("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."), e.colorSpaceToWorking(t, n);
		}
	}, t = [
		.64,
		.33,
		.3,
		.6,
		.15,
		.06
	], n = [
		.2126,
		.7152,
		.0722
	], r = [.3127, .329];
	return e.define({
		[oc]: {
			primaries: t,
			whitePoint: r,
			transfer: sc,
			toXYZ: Ic,
			fromXYZ: Lc,
			luminanceCoefficients: n,
			workingColorSpaceConfig: { unpackColorSpace: ac },
			outputColorSpaceConfig: { drawingBufferColorSpace: ac }
		},
		[ac]: {
			primaries: t,
			whitePoint: r,
			transfer: cc,
			toXYZ: Ic,
			fromXYZ: Lc,
			luminanceCoefficients: n,
			outputColorSpaceConfig: { drawingBufferColorSpace: ac }
		}
	}), e;
}
var X = /*@__PURE__*/ Rc();
function zc(e) {
	return e < .04045 ? e * .0773993808 : (e * .9478672986 + .0521327014) ** 2.4;
}
function Bc(e) {
	return e < .0031308 ? e * 12.92 : 1.055 * e ** .41666 - .055;
}
var Vc, Hc = class {
	static getDataURL(e, t = "image/png") {
		if (/^data:/i.test(e.src) || typeof HTMLCanvasElement > "u") return e.src;
		let n;
		if (e instanceof HTMLCanvasElement) n = e;
		else {
			Vc === void 0 && (Vc = hc("canvas")), Vc.width = e.width, Vc.height = e.height;
			let t = Vc.getContext("2d");
			e instanceof ImageData ? t.putImageData(e, 0, 0) : t.drawImage(e, 0, 0, e.width, e.height), n = Vc;
		}
		return n.toDataURL(t);
	}
	static sRGBToLinear(e) {
		if (typeof HTMLImageElement < "u" && e instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && e instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && e instanceof ImageBitmap) {
			let t = hc("canvas");
			t.width = e.width, t.height = e.height;
			let n = t.getContext("2d");
			n.drawImage(e, 0, 0, e.width, e.height);
			let r = n.getImageData(0, 0, e.width, e.height), i = r.data;
			for (let e = 0; e < i.length; e++) i[e] = zc(i[e] / 255) * 255;
			return n.putImageData(r, 0, 0), t;
		}
		if (e.data) {
			let t = e.data.slice(0);
			for (let e = 0; e < t.length; e++) t instanceof Uint8Array || t instanceof Uint8ClampedArray ? t[e] = Math.floor(zc(t[e] / 255) * 255) : t[e] = zc(t[e]);
			return {
				data: t,
				width: e.width,
				height: e.height
			};
		}
		return W("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."), e;
	}
}, Uc = 0, Wc = class {
	constructor(e = null) {
		this.isTextureSource = !0, Object.defineProperty(this, "id", { value: Uc++ }), this.uuid = Dc(), this.data = e, this.dataReady = !0, this.version = 0;
	}
	getSize(e) {
		let t = this.data;
		return typeof HTMLVideoElement < "u" && t instanceof HTMLVideoElement ? e.set(t.videoWidth, t.videoHeight, 0) : typeof VideoFrame < "u" && t instanceof VideoFrame ? e.set(t.displayWidth, t.displayHeight, 0) : t === null ? e.set(0, 0, 0) : e.set(t.width, t.height, t.depth || 0), e;
	}
	set needsUpdate(e) {
		e === !0 && this.version++;
	}
	toJSON(e) {
		let t = e === void 0 || typeof e == "string";
		if (!t && e.images[this.uuid] !== void 0) return e.images[this.uuid];
		let n = {
			uuid: this.uuid,
			url: ""
		}, r = this.data;
		if (r !== null) {
			let e;
			if (Array.isArray(r)) {
				e = [];
				for (let t = 0, n = r.length; t < n; t++) r[t].isDataTexture ? e.push(Gc(r[t].image)) : e.push(Gc(r[t]));
			} else e = Gc(r);
			n.url = e;
		}
		return t || (e.images[this.uuid] = n), n;
	}
};
function Gc(e) {
	return typeof HTMLImageElement < "u" && e instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && e instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && e instanceof ImageBitmap ? Hc.getDataURL(e) : e.data ? {
		data: Array.from(e.data),
		width: e.width,
		height: e.height,
		type: e.data.constructor.name
	} : (W("Texture: Unable to serialize Texture."), {});
}
var Kc = 0, qc = /*@__PURE__*/ new J(), Jc = class e extends Cc {
	constructor(t = e.DEFAULT_IMAGE, n = e.DEFAULT_MAPPING, r = Ro, i = Ro, a = Uo, o = Go, s = ss, c = Ko, l = e.DEFAULT_ANISOTROPY, u = "") {
		super(), this.isTexture = !0, Object.defineProperty(this, "id", { value: Kc++ }), this.uuid = Dc(), this.name = "", this.source = new Wc(t), this.mipmaps = [], this.mapping = n, this.channel = 0, this.wrapS = r, this.wrapT = i, this.magFilter = a, this.minFilter = o, this.anisotropy = l, this.format = s, this.internalFormat = null, this.type = c, this.offset = new q(0, 0), this.repeat = new q(1, 1), this.center = new q(0, 0), this.rotation = 0, this.matrixAutoUpdate = !0, this.matrix = new Y(), this.generateMipmaps = !0, this.premultiplyAlpha = !1, this.flipY = !0, this.unpackAlignment = 4, this.colorSpace = u, this.userData = {}, this.updateRanges = [], this.version = 0, this.onUpdate = null, this.renderTarget = null, this.isRenderTargetTexture = !1, this.isArrayTexture = !!(t && t.depth && t.depth > 1), this.pmremVersion = 0, this.normalized = !1;
	}
	get width() {
		return this.source.getSize(qc).x;
	}
	get height() {
		return this.source.getSize(qc).y;
	}
	get depth() {
		return this.source.getSize(qc).z;
	}
	get image() {
		return this.source.data;
	}
	set image(e) {
		this.source.data = e;
	}
	updateMatrix() {
		this.matrix.setUvTransform(this.offset.x, this.offset.y, this.repeat.x, this.repeat.y, this.rotation, this.center.x, this.center.y);
	}
	addUpdateRange(e, t) {
		this.updateRanges.push({
			start: e,
			count: t
		});
	}
	clearUpdateRanges() {
		this.updateRanges.length = 0;
	}
	clone() {
		return new this.constructor().copy(this);
	}
	copy(e) {
		return this.name = e.name, this.source = e.source, this.mipmaps = e.mipmaps.slice(0), this.mapping = e.mapping, this.channel = e.channel, this.wrapS = e.wrapS, this.wrapT = e.wrapT, this.magFilter = e.magFilter, this.minFilter = e.minFilter, this.anisotropy = e.anisotropy, this.format = e.format, this.internalFormat = e.internalFormat, this.type = e.type, this.normalized = e.normalized, this.offset.copy(e.offset), this.repeat.copy(e.repeat), this.center.copy(e.center), this.rotation = e.rotation, this.matrixAutoUpdate = e.matrixAutoUpdate, this.matrix.copy(e.matrix), this.generateMipmaps = e.generateMipmaps, this.premultiplyAlpha = e.premultiplyAlpha, this.flipY = e.flipY, this.unpackAlignment = e.unpackAlignment, this.colorSpace = e.colorSpace, this.renderTarget = e.renderTarget, this.isRenderTargetTexture = e.isRenderTargetTexture, this.isArrayTexture = e.isArrayTexture, this.userData = JSON.parse(JSON.stringify(e.userData)), this.needsUpdate = !0, this;
	}
	setValues(e) {
		for (let t in e) {
			let n = e[t];
			if (n === void 0) {
				W(`Texture.setValues(): parameter '${t}' has value of undefined.`);
				continue;
			}
			let r = this[t];
			r === void 0 ? W(`Texture.setValues(): property '${t}' does not exist.`) : r && n && r.isVector2 && n.isVector2 || r && n && r.isVector3 && n.isVector3 || r && n && r.isMatrix3 && n.isMatrix3 ? r.copy(n) : this[t] = n;
		}
	}
	toJSON(e) {
		let t = e === void 0 || typeof e == "string";
		if (!t && e.textures[this.uuid] !== void 0) return e.textures[this.uuid];
		let n = {
			metadata: {
				version: 4.7,
				type: "Texture",
				generator: "Texture.toJSON"
			},
			uuid: this.uuid,
			name: this.name,
			image: this.source.toJSON(e).uuid,
			mapping: this.mapping,
			channel: this.channel,
			repeat: [this.repeat.x, this.repeat.y],
			offset: [this.offset.x, this.offset.y],
			center: [this.center.x, this.center.y],
			rotation: this.rotation,
			wrap: [this.wrapS, this.wrapT],
			format: this.format,
			internalFormat: this.internalFormat,
			type: this.type,
			normalized: this.normalized,
			colorSpace: this.colorSpace,
			minFilter: this.minFilter,
			magFilter: this.magFilter,
			anisotropy: this.anisotropy,
			flipY: this.flipY,
			generateMipmaps: this.generateMipmaps,
			premultiplyAlpha: this.premultiplyAlpha,
			unpackAlignment: this.unpackAlignment
		};
		return Object.keys(this.userData).length > 0 && (n.userData = this.userData), t || (e.textures[this.uuid] = n), n;
	}
	dispose() {
		this.dispatchEvent({ type: "dispose" });
	}
	transformUv(e) {
		if (this.mapping !== 300) return e;
		if (e.applyMatrix3(this.matrix), e.x < 0 || e.x > 1) switch (this.wrapS) {
			case Lo:
				e.x -= Math.floor(e.x);
				break;
			case Ro:
				e.x = e.x < 0 ? 0 : 1;
				break;
			case zo: Math.abs(Math.floor(e.x) % 2) === 1 ? e.x = Math.ceil(e.x) - e.x : e.x -= Math.floor(e.x);
		}
		if (e.y < 0 || e.y > 1) switch (this.wrapT) {
			case Lo:
				e.y -= Math.floor(e.y);
				break;
			case Ro:
				e.y = e.y < 0 ? 0 : 1;
				break;
			case zo: Math.abs(Math.floor(e.y) % 2) === 1 ? e.y = Math.ceil(e.y) - e.y : e.y -= Math.floor(e.y);
		}
		return this.flipY && (e.y = 1 - e.y), e;
	}
	set needsUpdate(e) {
		e === !0 && (this.version++, this.source.needsUpdate = !0);
	}
	set needsPMREMUpdate(e) {
		e === !0 && this.pmremVersion++;
	}
};
Jc.DEFAULT_IMAGE = null, Jc.DEFAULT_MAPPING = 300, Jc.DEFAULT_ANISOTROPY = 1;
var Yc = class e {
	static {
		e.prototype.isVector4 = !0;
	}
	constructor(e = 0, t = 0, n = 0, r = 1) {
		this.x = e, this.y = t, this.z = n, this.w = r;
	}
	get width() {
		return this.z;
	}
	set width(e) {
		this.z = e;
	}
	get height() {
		return this.w;
	}
	set height(e) {
		this.w = e;
	}
	set(e, t, n, r) {
		return this.x = e, this.y = t, this.z = n, this.w = r, this;
	}
	setScalar(e) {
		return this.x = e, this.y = e, this.z = e, this.w = e, this;
	}
	setX(e) {
		return this.x = e, this;
	}
	setY(e) {
		return this.y = e, this;
	}
	setZ(e) {
		return this.z = e, this;
	}
	setW(e) {
		return this.w = e, this;
	}
	setComponent(e, t) {
		switch (e) {
			case 0:
				this.x = t;
				break;
			case 1:
				this.y = t;
				break;
			case 2:
				this.z = t;
				break;
			case 3:
				this.w = t;
				break;
			default: throw Error("THREE.Vector4: index is out of range: " + e);
		}
		return this;
	}
	getComponent(e) {
		switch (e) {
			case 0: return this.x;
			case 1: return this.y;
			case 2: return this.z;
			case 3: return this.w;
			default: throw Error("THREE.Vector4: index is out of range: " + e);
		}
	}
	clone() {
		return new this.constructor(this.x, this.y, this.z, this.w);
	}
	copy(e) {
		return this.x = e.x, this.y = e.y, this.z = e.z, this.w = e.w === void 0 ? 1 : e.w, this;
	}
	add(e) {
		return this.x += e.x, this.y += e.y, this.z += e.z, this.w += e.w, this;
	}
	addScalar(e) {
		return this.x += e, this.y += e, this.z += e, this.w += e, this;
	}
	addVectors(e, t) {
		return this.x = e.x + t.x, this.y = e.y + t.y, this.z = e.z + t.z, this.w = e.w + t.w, this;
	}
	addScaledVector(e, t) {
		return this.x += e.x * t, this.y += e.y * t, this.z += e.z * t, this.w += e.w * t, this;
	}
	sub(e) {
		return this.x -= e.x, this.y -= e.y, this.z -= e.z, this.w -= e.w, this;
	}
	subScalar(e) {
		return this.x -= e, this.y -= e, this.z -= e, this.w -= e, this;
	}
	subVectors(e, t) {
		return this.x = e.x - t.x, this.y = e.y - t.y, this.z = e.z - t.z, this.w = e.w - t.w, this;
	}
	multiply(e) {
		return this.x *= e.x, this.y *= e.y, this.z *= e.z, this.w *= e.w, this;
	}
	multiplyScalar(e) {
		return this.x *= e, this.y *= e, this.z *= e, this.w *= e, this;
	}
	applyMatrix4(e) {
		let t = this.x, n = this.y, r = this.z, i = this.w, a = e.elements;
		return this.x = a[0] * t + a[4] * n + a[8] * r + a[12] * i, this.y = a[1] * t + a[5] * n + a[9] * r + a[13] * i, this.z = a[2] * t + a[6] * n + a[10] * r + a[14] * i, this.w = a[3] * t + a[7] * n + a[11] * r + a[15] * i, this;
	}
	divide(e) {
		return this.x /= e.x, this.y /= e.y, this.z /= e.z, this.w /= e.w, this;
	}
	divideScalar(e) {
		return this.multiplyScalar(1 / e);
	}
	setAxisAngleFromQuaternion(e) {
		this.w = 2 * Math.acos(e.w);
		let t = Math.sqrt(1 - e.w * e.w);
		return t < 1e-4 ? (this.x = 1, this.y = 0, this.z = 0) : (this.x = e.x / t, this.y = e.y / t, this.z = e.z / t), this;
	}
	setAxisAngleFromRotationMatrix(e) {
		let t, n, r, i, a = .01, o = .1, s = e.elements, c = s[0], l = s[4], u = s[8], d = s[1], f = s[5], p = s[9], m = s[2], h = s[6], g = s[10];
		if (Math.abs(l - d) < a && Math.abs(u - m) < a && Math.abs(p - h) < a) {
			if (Math.abs(l + d) < o && Math.abs(u + m) < o && Math.abs(p + h) < o && Math.abs(c + f + g - 3) < o) return this.set(1, 0, 0, 0), this;
			t = Math.PI;
			let e = (c + 1) / 2, s = (f + 1) / 2, _ = (g + 1) / 2, v = (l + d) / 4, y = (u + m) / 4, b = (p + h) / 4;
			return e > s && e > _ ? e < a ? (n = 0, r = .707106781, i = .707106781) : (n = Math.sqrt(e), r = v / n, i = y / n) : s > _ ? s < a ? (n = .707106781, r = 0, i = .707106781) : (r = Math.sqrt(s), n = v / r, i = b / r) : _ < a ? (n = .707106781, r = .707106781, i = 0) : (i = Math.sqrt(_), n = y / i, r = b / i), this.set(n, r, i, t), this;
		}
		let _ = Math.sqrt((h - p) * (h - p) + (u - m) * (u - m) + (d - l) * (d - l));
		return Math.abs(_) < .001 && (_ = 1), this.x = (h - p) / _, this.y = (u - m) / _, this.z = (d - l) / _, this.w = Math.acos((c + f + g - 1) / 2), this;
	}
	setFromMatrixPosition(e) {
		let t = e.elements;
		return this.x = t[12], this.y = t[13], this.z = t[14], this.w = t[15], this;
	}
	min(e) {
		return this.x = Math.min(this.x, e.x), this.y = Math.min(this.y, e.y), this.z = Math.min(this.z, e.z), this.w = Math.min(this.w, e.w), this;
	}
	max(e) {
		return this.x = Math.max(this.x, e.x), this.y = Math.max(this.y, e.y), this.z = Math.max(this.z, e.z), this.w = Math.max(this.w, e.w), this;
	}
	clamp(e, t) {
		return this.x = K(this.x, e.x, t.x), this.y = K(this.y, e.y, t.y), this.z = K(this.z, e.z, t.z), this.w = K(this.w, e.w, t.w), this;
	}
	clampScalar(e, t) {
		return this.x = K(this.x, e, t), this.y = K(this.y, e, t), this.z = K(this.z, e, t), this.w = K(this.w, e, t), this;
	}
	clampLength(e, t) {
		let n = this.length();
		return this.divideScalar(n || 1).multiplyScalar(K(n, e, t));
	}
	floor() {
		return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this.z = Math.floor(this.z), this.w = Math.floor(this.w), this;
	}
	ceil() {
		return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this.z = Math.ceil(this.z), this.w = Math.ceil(this.w), this;
	}
	round() {
		return this.x = Math.round(this.x), this.y = Math.round(this.y), this.z = Math.round(this.z), this.w = Math.round(this.w), this;
	}
	roundToZero() {
		return this.x = Math.trunc(this.x), this.y = Math.trunc(this.y), this.z = Math.trunc(this.z), this.w = Math.trunc(this.w), this;
	}
	negate() {
		return this.x = -this.x, this.y = -this.y, this.z = -this.z, this.w = -this.w, this;
	}
	dot(e) {
		return this.x * e.x + this.y * e.y + this.z * e.z + this.w * e.w;
	}
	lengthSq() {
		return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
	}
	length() {
		return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
	}
	manhattanLength() {
		return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z) + Math.abs(this.w);
	}
	normalize() {
		return this.divideScalar(this.length() || 1);
	}
	setLength(e) {
		return this.normalize().multiplyScalar(e);
	}
	lerp(e, t) {
		return this.x += (e.x - this.x) * t, this.y += (e.y - this.y) * t, this.z += (e.z - this.z) * t, this.w += (e.w - this.w) * t, this;
	}
	lerpVectors(e, t, n) {
		return this.x = e.x + (t.x - e.x) * n, this.y = e.y + (t.y - e.y) * n, this.z = e.z + (t.z - e.z) * n, this.w = e.w + (t.w - e.w) * n, this;
	}
	equals(e) {
		return e.x === this.x && e.y === this.y && e.z === this.z && e.w === this.w;
	}
	fromArray(e, t = 0) {
		return this.x = e[t], this.y = e[t + 1], this.z = e[t + 2], this.w = e[t + 3], this;
	}
	toArray(e = [], t = 0) {
		return e[t] = this.x, e[t + 1] = this.y, e[t + 2] = this.z, e[t + 3] = this.w, e;
	}
	fromBufferAttribute(e, t) {
		return this.x = e.getX(t), this.y = e.getY(t), this.z = e.getZ(t), this.w = e.getW(t), this;
	}
	random() {
		return this.x = Math.random(), this.y = Math.random(), this.z = Math.random(), this.w = Math.random(), this;
	}
	*[Symbol.iterator]() {
		yield this.x, yield this.y, yield this.z, yield this.w;
	}
}, Xc = class extends Cc {
	constructor(e = 1, t = 1, n = {}) {
		super(), n = Object.assign({
			generateMipmaps: !1,
			internalFormat: null,
			minFilter: Uo,
			depthBuffer: !0,
			stencilBuffer: !1,
			resolveColorBuffer: !0,
			resolveDepthBuffer: !0,
			resolveStencilBuffer: !0,
			storeMultisampledColorBuffer: !0,
			storeMultisampledDepthBuffer: !0,
			storeMultisampledStencilBuffer: !0,
			depthTexture: null,
			samples: 0,
			count: 1,
			depth: 1,
			multiview: !1,
			useArrayDepthTexture: !1
		}, n), this.isRenderTarget = !0, this.width = e, this.height = t, this.depth = n.depth, this.scissor = new Yc(0, 0, e, t), this.scissorTest = !1, this.viewport = new Yc(0, 0, e, t), this.textures = [];
		let r = new Jc({
			width: e,
			height: t,
			depth: n.depth
		}), i = n.count;
		for (let e = 0; e < i; e++) this.textures[e] = r.clone(), this.textures[e].isRenderTargetTexture = !0, this.textures[e].renderTarget = this;
		this._setTextureOptions(n), this.depthBuffer = n.depthBuffer, this.stencilBuffer = n.stencilBuffer, this.resolveColorBuffer = n.resolveColorBuffer, this.resolveDepthBuffer = n.resolveDepthBuffer, this.resolveStencilBuffer = n.resolveStencilBuffer, this.storeMultisampledColorBuffer = n.storeMultisampledColorBuffer, this.storeMultisampledDepthBuffer = n.storeMultisampledDepthBuffer, this.storeMultisampledStencilBuffer = n.storeMultisampledStencilBuffer, this._depthTexture = null, this.depthTexture = n.depthTexture, this.samples = n.samples, this.multiview = n.multiview, this.useArrayDepthTexture = n.useArrayDepthTexture;
	}
	_setTextureOptions(e = {}) {
		let t = {
			minFilter: Uo,
			generateMipmaps: !1,
			flipY: !1,
			internalFormat: null
		};
		e.mapping !== void 0 && (t.mapping = e.mapping), e.wrapS !== void 0 && (t.wrapS = e.wrapS), e.wrapT !== void 0 && (t.wrapT = e.wrapT), e.wrapR !== void 0 && (t.wrapR = e.wrapR), e.magFilter !== void 0 && (t.magFilter = e.magFilter), e.minFilter !== void 0 && (t.minFilter = e.minFilter), e.format !== void 0 && (t.format = e.format), e.type !== void 0 && (t.type = e.type), e.anisotropy !== void 0 && (t.anisotropy = e.anisotropy), e.colorSpace !== void 0 && (t.colorSpace = e.colorSpace), e.flipY !== void 0 && (t.flipY = e.flipY), e.generateMipmaps !== void 0 && (t.generateMipmaps = e.generateMipmaps), e.internalFormat !== void 0 && (t.internalFormat = e.internalFormat);
		for (let e = 0; e < this.textures.length; e++) this.textures[e].setValues(t);
	}
	get texture() {
		return this.textures[0];
	}
	set texture(e) {
		this.textures[0] = e;
	}
	set depthTexture(e) {
		this._depthTexture !== null && this._depthTexture.renderTarget === this && (this._depthTexture.renderTarget = null), e !== null && e.renderTarget === null && (e.renderTarget = this), this._depthTexture = e;
	}
	get depthTexture() {
		return this._depthTexture;
	}
	setSize(e, t, n = 1) {
		if (this.width !== e || this.height !== t || this.depth !== n) {
			this.width = e, this.height = t, this.depth = n;
			for (let r = 0, i = this.textures.length; r < i; r++) this.textures[r].image.width = e, this.textures[r].image.height = t, this.textures[r].image.depth = n, this.textures[r].isData3DTexture !== !0 && (this.textures[r].isArrayTexture = this.textures[r].image.depth > 1);
			this.dispose();
		}
		this.viewport.set(0, 0, e, t), this.scissor.set(0, 0, e, t);
	}
	clone() {
		return new this.constructor().copy(this);
	}
	copy(e) {
		this.width = e.width, this.height = e.height, this.depth = e.depth, this.scissor.copy(e.scissor), this.scissorTest = e.scissorTest, this.viewport.copy(e.viewport), this.textures.length = 0;
		for (let t = 0, n = e.textures.length; t < n; t++) {
			this.textures[t] = e.textures[t].clone(), this.textures[t].isRenderTargetTexture = !0, this.textures[t].renderTarget = this;
			let n = Object.assign({}, e.textures[t].image);
			this.textures[t].source = new Wc(n);
		}
		if (this.depthBuffer = e.depthBuffer, this.stencilBuffer = e.stencilBuffer, this.resolveColorBuffer = e.resolveColorBuffer, this.resolveDepthBuffer = e.resolveDepthBuffer, this.resolveStencilBuffer = e.resolveStencilBuffer, this.storeMultisampledColorBuffer = e.storeMultisampledColorBuffer, this.storeMultisampledDepthBuffer = e.storeMultisampledDepthBuffer, this.storeMultisampledStencilBuffer = e.storeMultisampledStencilBuffer, e.depthTexture !== null) {
			if (e.depthTexture.renderTarget === e) {
				let t = e.depthTexture.clone();
				t.renderTarget = null, this.depthTexture = t;
			} else this.depthTexture = e.depthTexture;
		}
		return this.samples = e.samples, this.multiview = e.multiview, this.useArrayDepthTexture = e.useArrayDepthTexture, this;
	}
	dispose() {
		this.dispatchEvent({ type: "dispose" });
	}
}, Zc = class extends Xc {
	constructor(e = 1, t = 1, n = {}) {
		super(e, t, n), this.isWebGLRenderTarget = !0;
	}
}, Qc = class extends Jc {
	constructor(e = null, t = 1, n = 1, r = 1) {
		super(null), this.isDataArrayTexture = !0, this.image = {
			data: e,
			width: t,
			height: n,
			depth: r
		}, this.magFilter = Bo, this.minFilter = Bo, this.wrapR = Ro, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1, this.layerUpdates = /* @__PURE__ */ new Set();
	}
	copy(e) {
		return super.copy(e), this.wrapR = e.wrapR, this;
	}
	addLayerUpdate(e) {
		this.layerUpdates.add(e);
	}
	clearLayerUpdates() {
		this.layerUpdates.clear();
	}
}, $c = class extends Jc {
	constructor(e = null, t = 1, n = 1, r = 1) {
		super(null), this.isData3DTexture = !0, this.image = {
			data: e,
			width: t,
			height: n,
			depth: r
		}, this.magFilter = Bo, this.minFilter = Bo, this.wrapR = Ro, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1;
	}
	copy(e) {
		return super.copy(e), this.wrapR = e.wrapR, this;
	}
}, el = class e {
	static {
		e.prototype.isMatrix4 = !0;
	}
	constructor(e, t, n, r, i, a, o, s, c, l, u, d, f, p, m, h) {
		this.elements = [
			1,
			0,
			0,
			0,
			0,
			1,
			0,
			0,
			0,
			0,
			1,
			0,
			0,
			0,
			0,
			1
		], e !== void 0 && this.set(e, t, n, r, i, a, o, s, c, l, u, d, f, p, m, h);
	}
	set(e, t, n, r, i, a, o, s, c, l, u, d, f, p, m, h) {
		let g = this.elements;
		return g[0] = e, g[4] = t, g[8] = n, g[12] = r, g[1] = i, g[5] = a, g[9] = o, g[13] = s, g[2] = c, g[6] = l, g[10] = u, g[14] = d, g[3] = f, g[7] = p, g[11] = m, g[15] = h, this;
	}
	identity() {
		return this.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1), this;
	}
	clone() {
		return new e().fromArray(this.elements);
	}
	copy(e) {
		let t = this.elements, n = e.elements;
		return t[0] = n[0], t[1] = n[1], t[2] = n[2], t[3] = n[3], t[4] = n[4], t[5] = n[5], t[6] = n[6], t[7] = n[7], t[8] = n[8], t[9] = n[9], t[10] = n[10], t[11] = n[11], t[12] = n[12], t[13] = n[13], t[14] = n[14], t[15] = n[15], this;
	}
	copyPosition(e) {
		let t = this.elements, n = e.elements;
		return t[12] = n[12], t[13] = n[13], t[14] = n[14], this;
	}
	setFromMatrix3(e) {
		let t = e.elements;
		return this.set(t[0], t[3], t[6], 0, t[1], t[4], t[7], 0, t[2], t[5], t[8], 0, 0, 0, 0, 1), this;
	}
	extractBasis(e, t, n) {
		return this.determinantAffine() === 0 ? (e.set(1, 0, 0), t.set(0, 1, 0), n.set(0, 0, 1), this) : (e.setFromMatrixColumn(this, 0), t.setFromMatrixColumn(this, 1), n.setFromMatrixColumn(this, 2), this);
	}
	makeBasis(e, t, n) {
		return this.set(e.x, t.x, n.x, 0, e.y, t.y, n.y, 0, e.z, t.z, n.z, 0, 0, 0, 0, 1), this;
	}
	extractRotation(e) {
		if (e.determinantAffine() === 0) return this.identity();
		let t = this.elements, n = e.elements, r = 1 / tl.setFromMatrixColumn(e, 0).length(), i = 1 / tl.setFromMatrixColumn(e, 1).length(), a = 1 / tl.setFromMatrixColumn(e, 2).length();
		return t[0] = n[0] * r, t[1] = n[1] * r, t[2] = n[2] * r, t[3] = 0, t[4] = n[4] * i, t[5] = n[5] * i, t[6] = n[6] * i, t[7] = 0, t[8] = n[8] * a, t[9] = n[9] * a, t[10] = n[10] * a, t[11] = 0, t[12] = 0, t[13] = 0, t[14] = 0, t[15] = 1, this;
	}
	makeRotationFromEuler(e) {
		let t = this.elements, n = e.x, r = e.y, i = e.z, a = Math.cos(n), o = Math.sin(n), s = Math.cos(r), c = Math.sin(r), l = Math.cos(i), u = Math.sin(i);
		if (e.order === "XYZ") {
			let e = a * l, n = a * u, r = o * l, i = o * u;
			t[0] = s * l, t[4] = -s * u, t[8] = c, t[1] = n + r * c, t[5] = e - i * c, t[9] = -o * s, t[2] = i - e * c, t[6] = r + n * c, t[10] = a * s;
		} else if (e.order === "YXZ") {
			let e = s * l, n = s * u, r = c * l, i = c * u;
			t[0] = e + i * o, t[4] = r * o - n, t[8] = a * c, t[1] = a * u, t[5] = a * l, t[9] = -o, t[2] = n * o - r, t[6] = i + e * o, t[10] = a * s;
		} else if (e.order === "ZXY") {
			let e = s * l, n = s * u, r = c * l, i = c * u;
			t[0] = e - i * o, t[4] = -a * u, t[8] = r + n * o, t[1] = n + r * o, t[5] = a * l, t[9] = i - e * o, t[2] = -a * c, t[6] = o, t[10] = a * s;
		} else if (e.order === "ZYX") {
			let e = a * l, n = a * u, r = o * l, i = o * u;
			t[0] = s * l, t[4] = r * c - n, t[8] = e * c + i, t[1] = s * u, t[5] = i * c + e, t[9] = n * c - r, t[2] = -c, t[6] = o * s, t[10] = a * s;
		} else if (e.order === "YZX") {
			let e = a * s, n = a * c, r = o * s, i = o * c;
			t[0] = s * l, t[4] = i - e * u, t[8] = r * u + n, t[1] = u, t[5] = a * l, t[9] = -o * l, t[2] = -c * l, t[6] = n * u + r, t[10] = e - i * u;
		} else if (e.order === "XZY") {
			let e = a * s, n = a * c, r = o * s, i = o * c;
			t[0] = s * l, t[4] = -u, t[8] = c * l, t[1] = e * u + i, t[5] = a * l, t[9] = n * u - r, t[2] = r * u - n, t[6] = o * l, t[10] = i * u + e;
		}
		return t[3] = 0, t[7] = 0, t[11] = 0, t[12] = 0, t[13] = 0, t[14] = 0, t[15] = 1, this;
	}
	makeRotationFromQuaternion(e) {
		return this.compose(rl, e, il);
	}
	lookAt(e, t, n) {
		let r = this.elements;
		return sl.subVectors(e, t), sl.lengthSq() === 0 && (sl.z = 1), sl.normalize(), al.crossVectors(n, sl), al.lengthSq() === 0 && (Math.abs(n.z) === 1 ? sl.x += 1e-4 : sl.z += 1e-4, sl.normalize(), al.crossVectors(n, sl)), al.normalize(), ol.crossVectors(sl, al), r[0] = al.x, r[4] = ol.x, r[8] = sl.x, r[1] = al.y, r[5] = ol.y, r[9] = sl.y, r[2] = al.z, r[6] = ol.z, r[10] = sl.z, this;
	}
	multiply(e) {
		return this.multiplyMatrices(this, e);
	}
	premultiply(e) {
		return this.multiplyMatrices(e, this);
	}
	multiplyMatrices(e, t) {
		let n = e.elements, r = t.elements, i = this.elements, a = n[0], o = n[4], s = n[8], c = n[12], l = n[1], u = n[5], d = n[9], f = n[13], p = n[2], m = n[6], h = n[10], g = n[14], _ = n[3], v = n[7], y = n[11], b = n[15], x = r[0], S = r[4], C = r[8], w = r[12], T = r[1], E = r[5], D = r[9], O = r[13], k = r[2], A = r[6], j = r[10], ee = r[14], M = r[3], te = r[7], ne = r[11], N = r[15];
		return i[0] = a * x + o * T + s * k + c * M, i[4] = a * S + o * E + s * A + c * te, i[8] = a * C + o * D + s * j + c * ne, i[12] = a * w + o * O + s * ee + c * N, i[1] = l * x + u * T + d * k + f * M, i[5] = l * S + u * E + d * A + f * te, i[9] = l * C + u * D + d * j + f * ne, i[13] = l * w + u * O + d * ee + f * N, i[2] = p * x + m * T + h * k + g * M, i[6] = p * S + m * E + h * A + g * te, i[10] = p * C + m * D + h * j + g * ne, i[14] = p * w + m * O + h * ee + g * N, i[3] = _ * x + v * T + y * k + b * M, i[7] = _ * S + v * E + y * A + b * te, i[11] = _ * C + v * D + y * j + b * ne, i[15] = _ * w + v * O + y * ee + b * N, this;
	}
	multiplyScalar(e) {
		let t = this.elements;
		return t[0] *= e, t[4] *= e, t[8] *= e, t[12] *= e, t[1] *= e, t[5] *= e, t[9] *= e, t[13] *= e, t[2] *= e, t[6] *= e, t[10] *= e, t[14] *= e, t[3] *= e, t[7] *= e, t[11] *= e, t[15] *= e, this;
	}
	determinant() {
		let e = this.elements, t = e[0], n = e[4], r = e[8], i = e[12], a = e[1], o = e[5], s = e[9], c = e[13], l = e[2], u = e[6], d = e[10], f = e[14], p = e[3], m = e[7], h = e[11], g = e[15], _ = s * f - c * d, v = o * f - c * u, y = o * d - s * u, b = a * f - c * l, x = a * d - s * l, S = a * u - o * l;
		return t * (m * _ - h * v + g * y) - n * (p * _ - h * b + g * x) + r * (p * v - m * b + g * S) - i * (p * y - m * x + h * S);
	}
	determinantAffine() {
		let e = this.elements, t = e[0], n = e[4], r = e[8], i = e[1], a = e[5], o = e[9], s = e[2], c = e[6], l = e[10];
		return t * (a * l - o * c) - n * (i * l - o * s) + r * (i * c - a * s);
	}
	transpose() {
		let e = this.elements, t;
		return t = e[1], e[1] = e[4], e[4] = t, t = e[2], e[2] = e[8], e[8] = t, t = e[6], e[6] = e[9], e[9] = t, t = e[3], e[3] = e[12], e[12] = t, t = e[7], e[7] = e[13], e[13] = t, t = e[11], e[11] = e[14], e[14] = t, this;
	}
	setPosition(e, t, n) {
		let r = this.elements;
		return e.isVector3 ? (r[12] = e.x, r[13] = e.y, r[14] = e.z) : (r[12] = e, r[13] = t, r[14] = n), this;
	}
	invert() {
		let e = this.elements, t = e[0], n = e[1], r = e[2], i = e[3], a = e[4], o = e[5], s = e[6], c = e[7], l = e[8], u = e[9], d = e[10], f = e[11], p = e[12], m = e[13], h = e[14], g = e[15], _ = t * o - n * a, v = t * s - r * a, y = t * c - i * a, b = n * s - r * o, x = n * c - i * o, S = r * c - i * s, C = l * m - u * p, w = l * h - d * p, T = l * g - f * p, E = u * h - d * m, D = u * g - f * m, O = d * g - f * h, k = _ * O - v * D + y * E + b * T - x * w + S * C;
		if (k === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
		let A = 1 / k;
		return e[0] = (o * O - s * D + c * E) * A, e[1] = (r * D - n * O - i * E) * A, e[2] = (m * S - h * x + g * b) * A, e[3] = (d * x - u * S - f * b) * A, e[4] = (s * T - a * O - c * w) * A, e[5] = (t * O - r * T + i * w) * A, e[6] = (h * y - p * S - g * v) * A, e[7] = (l * S - d * y + f * v) * A, e[8] = (a * D - o * T + c * C) * A, e[9] = (n * T - t * D - i * C) * A, e[10] = (p * x - m * y + g * _) * A, e[11] = (u * y - l * x - f * _) * A, e[12] = (o * w - a * E - s * C) * A, e[13] = (t * E - n * w + r * C) * A, e[14] = (m * v - p * b - h * _) * A, e[15] = (l * b - u * v + d * _) * A, this;
	}
	scale(e) {
		let t = this.elements, n = e.x, r = e.y, i = e.z;
		return t[0] *= n, t[4] *= r, t[8] *= i, t[1] *= n, t[5] *= r, t[9] *= i, t[2] *= n, t[6] *= r, t[10] *= i, t[3] *= n, t[7] *= r, t[11] *= i, this;
	}
	getMaxScaleOnAxis() {
		let e = this.elements, t = e[0] * e[0] + e[1] * e[1] + e[2] * e[2], n = e[4] * e[4] + e[5] * e[5] + e[6] * e[6], r = e[8] * e[8] + e[9] * e[9] + e[10] * e[10];
		return Math.sqrt(Math.max(t, n, r));
	}
	makeTranslation(e, t, n) {
		return e.isVector3 ? this.set(1, 0, 0, e.x, 0, 1, 0, e.y, 0, 0, 1, e.z, 0, 0, 0, 1) : this.set(1, 0, 0, e, 0, 1, 0, t, 0, 0, 1, n, 0, 0, 0, 1), this;
	}
	makeRotationX(e) {
		let t = Math.cos(e), n = Math.sin(e);
		return this.set(1, 0, 0, 0, 0, t, -n, 0, 0, n, t, 0, 0, 0, 0, 1), this;
	}
	makeRotationY(e) {
		let t = Math.cos(e), n = Math.sin(e);
		return this.set(t, 0, n, 0, 0, 1, 0, 0, -n, 0, t, 0, 0, 0, 0, 1), this;
	}
	makeRotationZ(e) {
		let t = Math.cos(e), n = Math.sin(e);
		return this.set(t, -n, 0, 0, n, t, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1), this;
	}
	makeRotationAxis(e, t) {
		let n = Math.cos(t), r = Math.sin(t), i = 1 - n, a = e.x, o = e.y, s = e.z, c = i * a, l = i * o;
		return this.set(c * a + n, c * o - r * s, c * s + r * o, 0, c * o + r * s, l * o + n, l * s - r * a, 0, c * s - r * o, l * s + r * a, i * s * s + n, 0, 0, 0, 0, 1), this;
	}
	makeScale(e, t, n) {
		return this.set(e, 0, 0, 0, 0, t, 0, 0, 0, 0, n, 0, 0, 0, 0, 1), this;
	}
	makeShear(e, t, n, r, i, a) {
		return this.set(1, n, i, 0, e, 1, a, 0, t, r, 1, 0, 0, 0, 0, 1), this;
	}
	compose(e, t, n) {
		let r = this.elements, i = t._x, a = t._y, o = t._z, s = t._w, c = i + i, l = a + a, u = o + o, d = i * c, f = i * l, p = i * u, m = a * l, h = a * u, g = o * u, _ = s * c, v = s * l, y = s * u, b = n.x, x = n.y, S = n.z;
		return r[0] = (1 - (m + g)) * b, r[1] = (f + y) * b, r[2] = (p - v) * b, r[3] = 0, r[4] = (f - y) * x, r[5] = (1 - (d + g)) * x, r[6] = (h + _) * x, r[7] = 0, r[8] = (p + v) * S, r[9] = (h - _) * S, r[10] = (1 - (d + m)) * S, r[11] = 0, r[12] = e.x, r[13] = e.y, r[14] = e.z, r[15] = 1, this;
	}
	decompose(e, t, n) {
		let r = this.elements;
		e.x = r[12], e.y = r[13], e.z = r[14];
		let i = this.determinantAffine();
		if (i === 0) return n.set(1, 1, 1), t.identity(), this;
		let a = tl.set(r[0], r[1], r[2]).length(), o = tl.set(r[4], r[5], r[6]).length(), s = tl.set(r[8], r[9], r[10]).length();
		i < 0 && (a = -a), nl.copy(this);
		let c = 1 / a, l = 1 / o, u = 1 / s;
		return nl.elements[0] *= c, nl.elements[1] *= c, nl.elements[2] *= c, nl.elements[4] *= l, nl.elements[5] *= l, nl.elements[6] *= l, nl.elements[8] *= u, nl.elements[9] *= u, nl.elements[10] *= u, t.setFromRotationMatrix(nl), n.x = a, n.y = o, n.z = s, this;
	}
	makePerspective(e, t, n, r, i, a, o = fc, s = !1) {
		let c = this.elements, l = 2 * i / (t - e), u = 2 * i / (n - r), d = (t + e) / (t - e), f = (n + r) / (n - r), p, m;
		if (s) p = i / (a - i), m = a * i / (a - i);
		else if (o === 2e3) p = -(a + i) / (a - i), m = -2 * a * i / (a - i);
		else if (o === 2001) p = -a / (a - i), m = -a * i / (a - i);
		else throw Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: " + o);
		return c[0] = l, c[4] = 0, c[8] = d, c[12] = 0, c[1] = 0, c[5] = u, c[9] = f, c[13] = 0, c[2] = 0, c[6] = 0, c[10] = p, c[14] = m, c[3] = 0, c[7] = 0, c[11] = -1, c[15] = 0, this;
	}
	makeOrthographic(e, t, n, r, i, a, o = fc, s = !1) {
		let c = this.elements, l = 2 / (t - e), u = 2 / (n - r), d = -(t + e) / (t - e), f = -(n + r) / (n - r), p, m;
		if (s) p = 1 / (a - i), m = a / (a - i);
		else if (o === 2e3) p = -2 / (a - i), m = -(a + i) / (a - i);
		else if (o === 2001) p = -1 / (a - i), m = -i / (a - i);
		else throw Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: " + o);
		return c[0] = l, c[4] = 0, c[8] = 0, c[12] = d, c[1] = 0, c[5] = u, c[9] = 0, c[13] = f, c[2] = 0, c[6] = 0, c[10] = p, c[14] = m, c[3] = 0, c[7] = 0, c[11] = 0, c[15] = 1, this;
	}
	equals(e) {
		let t = this.elements, n = e.elements;
		for (let e = 0; e < 16; e++) if (t[e] !== n[e]) return !1;
		return !0;
	}
	fromArray(e, t = 0) {
		for (let n = 0; n < 16; n++) this.elements[n] = e[n + t];
		return this;
	}
	toArray(e = [], t = 0) {
		let n = this.elements;
		return e[t] = n[0], e[t + 1] = n[1], e[t + 2] = n[2], e[t + 3] = n[3], e[t + 4] = n[4], e[t + 5] = n[5], e[t + 6] = n[6], e[t + 7] = n[7], e[t + 8] = n[8], e[t + 9] = n[9], e[t + 10] = n[10], e[t + 11] = n[11], e[t + 12] = n[12], e[t + 13] = n[13], e[t + 14] = n[14], e[t + 15] = n[15], e;
	}
}, tl = /*@__PURE__*/ new J(), nl = /*@__PURE__*/ new el(), rl = /*@__PURE__*/ new J(0, 0, 0), il = /*@__PURE__*/ new J(1, 1, 1), al = /*@__PURE__*/ new J(), ol = /*@__PURE__*/ new J(), sl = /*@__PURE__*/ new J(), cl = /*@__PURE__*/ new el(), ll = /*@__PURE__*/ new Mc(), ul = class e {
	constructor(t = 0, n = 0, r = 0, i = e.DEFAULT_ORDER) {
		this.isEuler = !0, this._x = t, this._y = n, this._z = r, this._order = i;
	}
	get x() {
		return this._x;
	}
	set x(e) {
		this._x = e, this._onChangeCallback();
	}
	get y() {
		return this._y;
	}
	set y(e) {
		this._y = e, this._onChangeCallback();
	}
	get z() {
		return this._z;
	}
	set z(e) {
		this._z = e, this._onChangeCallback();
	}
	get order() {
		return this._order;
	}
	set order(e) {
		this._order = e, this._onChangeCallback();
	}
	set(e, t, n, r = this._order) {
		return this._x = e, this._y = t, this._z = n, this._order = r, this._onChangeCallback(), this;
	}
	clone() {
		return new this.constructor(this._x, this._y, this._z, this._order);
	}
	copy(e) {
		return this._x = e._x, this._y = e._y, this._z = e._z, this._order = e._order, this._onChangeCallback(), this;
	}
	setFromRotationMatrix(e, t = this._order, n = !0) {
		let r = e.elements, i = r[0], a = r[4], o = r[8], s = r[1], c = r[5], l = r[9], u = r[2], d = r[6], f = r[10];
		switch (t) {
			case "XYZ":
				this._y = Math.asin(K(o, -1, 1)), Math.abs(o) < .9999999 ? (this._x = Math.atan2(-l, f), this._z = Math.atan2(-a, i)) : (this._x = Math.atan2(d, c), this._z = 0);
				break;
			case "YXZ":
				this._x = Math.asin(-K(l, -1, 1)), Math.abs(l) < .9999999 ? (this._y = Math.atan2(o, f), this._z = Math.atan2(s, c)) : (this._y = Math.atan2(-u, i), this._z = 0);
				break;
			case "ZXY":
				this._x = Math.asin(K(d, -1, 1)), Math.abs(d) < .9999999 ? (this._y = Math.atan2(-u, f), this._z = Math.atan2(-a, c)) : (this._y = 0, this._z = Math.atan2(s, i));
				break;
			case "ZYX":
				this._y = Math.asin(-K(u, -1, 1)), Math.abs(u) < .9999999 ? (this._x = Math.atan2(d, f), this._z = Math.atan2(s, i)) : (this._x = 0, this._z = Math.atan2(-a, c));
				break;
			case "YZX":
				this._z = Math.asin(K(s, -1, 1)), Math.abs(s) < .9999999 ? (this._x = Math.atan2(-l, c), this._y = Math.atan2(-u, i)) : (this._x = 0, this._y = Math.atan2(o, f));
				break;
			case "XZY":
				this._z = Math.asin(-K(a, -1, 1)), Math.abs(a) < .9999999 ? (this._x = Math.atan2(d, c), this._y = Math.atan2(o, i)) : (this._x = Math.atan2(-l, f), this._y = 0);
				break;
			default: W("Euler: .setFromRotationMatrix() encountered an unknown order: " + t);
		}
		return this._order = t, n === !0 && this._onChangeCallback(), this;
	}
	setFromQuaternion(e, t, n) {
		return cl.makeRotationFromQuaternion(e), this.setFromRotationMatrix(cl, t, n);
	}
	setFromVector3(e, t = this._order) {
		return this.set(e.x, e.y, e.z, t);
	}
	reorder(e) {
		return ll.setFromEuler(this), this.setFromQuaternion(ll, e);
	}
	equals(e) {
		return e._x === this._x && e._y === this._y && e._z === this._z && e._order === this._order;
	}
	fromArray(e) {
		return this._x = e[0], this._y = e[1], this._z = e[2], e[3] !== void 0 && (this._order = e[3]), this._onChangeCallback(), this;
	}
	toArray(e = [], t = 0) {
		return e[t] = this._x, e[t + 1] = this._y, e[t + 2] = this._z, e[t + 3] = this._order, e;
	}
	_onChange(e) {
		return this._onChangeCallback = e, this;
	}
	_onChangeCallback() {}
	*[Symbol.iterator]() {
		yield this._x, yield this._y, yield this._z, yield this._order;
	}
};
ul.DEFAULT_ORDER = "XYZ";
var dl = class {
	constructor() {
		this.mask = 1;
	}
	set(e) {
		this.mask = 1 << e >>> 0;
	}
	enable(e) {
		this.mask |= 1 << e;
	}
	enableAll() {
		this.mask = -1;
	}
	toggle(e) {
		this.mask ^= 1 << e;
	}
	disable(e) {
		this.mask &= ~(1 << e);
	}
	disableAll() {
		this.mask = 0;
	}
	test(e) {
		return (this.mask & e.mask) !== 0;
	}
	isEnabled(e) {
		return !!(this.mask & 1 << e);
	}
}, fl = 0, pl = /*@__PURE__*/ new J(), ml = /*@__PURE__*/ new Mc(), hl = /*@__PURE__*/ new el(), gl = /*@__PURE__*/ new J(), _l = /*@__PURE__*/ new J(), vl = /*@__PURE__*/ new J(), yl = /*@__PURE__*/ new Mc(), bl = /*@__PURE__*/ new J(1, 0, 0), xl = /*@__PURE__*/ new J(0, 1, 0), Sl = /*@__PURE__*/ new J(0, 0, 1), Cl = { type: "added" }, wl = { type: "removed" }, Tl = {
	type: "childadded",
	child: null
}, El = {
	type: "childremoved",
	child: null
}, Dl = class e extends Cc {
	constructor() {
		super(), this.isObject3D = !0, Object.defineProperty(this, "id", { value: fl++ }), this.uuid = Dc(), this.name = "", this.type = "Object3D", this.parent = null, this.children = [], this.up = e.DEFAULT_UP.clone();
		let t = new J(), n = new ul(), r = new Mc(), i = new J(1, 1, 1);
		function a() {
			r.setFromEuler(n, !1);
		}
		function o() {
			n.setFromQuaternion(r, void 0, !1);
		}
		n._onChange(a), r._onChange(o), Object.defineProperties(this, {
			position: {
				configurable: !0,
				enumerable: !0,
				value: t
			},
			rotation: {
				configurable: !0,
				enumerable: !0,
				value: n
			},
			quaternion: {
				configurable: !0,
				enumerable: !0,
				value: r
			},
			scale: {
				configurable: !0,
				enumerable: !0,
				value: i
			},
			modelViewMatrix: { value: new el() },
			normalMatrix: { value: new Y() }
		}), this.matrix = new el(), this.matrixWorld = new el(), this.matrixAutoUpdate = e.DEFAULT_MATRIX_AUTO_UPDATE, this.matrixWorldAutoUpdate = e.DEFAULT_MATRIX_WORLD_AUTO_UPDATE, this.matrixWorldNeedsUpdate = !1, this.layers = new dl(), this.visible = !0, this.castShadow = !1, this.receiveShadow = !1, this.frustumCulled = !0, this.renderOrder = 0, this.animations = [], this.customDepthMaterial = void 0, this.customDistanceMaterial = void 0, this.static = !1, this.userData = {}, this.pivot = null;
	}
	onBeforeShadow() {}
	onAfterShadow() {}
	onBeforeRender() {}
	onAfterRender() {}
	applyMatrix4(e) {
		this.matrixAutoUpdate && this.updateMatrix(), this.matrix.premultiply(e), this.matrix.decompose(this.position, this.quaternion, this.scale);
	}
	applyQuaternion(e) {
		return this.quaternion.premultiply(e), this;
	}
	setRotationFromAxisAngle(e, t) {
		this.quaternion.setFromAxisAngle(e, t);
	}
	setRotationFromEuler(e) {
		this.quaternion.setFromEuler(e, !0);
	}
	setRotationFromMatrix(e) {
		this.quaternion.setFromRotationMatrix(e);
	}
	setRotationFromQuaternion(e) {
		this.quaternion.copy(e);
	}
	rotateOnAxis(e, t) {
		return ml.setFromAxisAngle(e, t), this.quaternion.multiply(ml), this;
	}
	rotateOnWorldAxis(e, t) {
		return ml.setFromAxisAngle(e, t), this.quaternion.premultiply(ml), this;
	}
	rotateX(e) {
		return this.rotateOnAxis(bl, e);
	}
	rotateY(e) {
		return this.rotateOnAxis(xl, e);
	}
	rotateZ(e) {
		return this.rotateOnAxis(Sl, e);
	}
	translateOnAxis(e, t) {
		return pl.copy(e).applyQuaternion(this.quaternion), this.position.add(pl.multiplyScalar(t)), this;
	}
	translateX(e) {
		return this.translateOnAxis(bl, e);
	}
	translateY(e) {
		return this.translateOnAxis(xl, e);
	}
	translateZ(e) {
		return this.translateOnAxis(Sl, e);
	}
	localToWorld(e) {
		return this.updateWorldMatrix(!0, !1), e.applyMatrix4(this.matrixWorld);
	}
	worldToLocal(e) {
		return this.updateWorldMatrix(!0, !1), e.applyMatrix4(hl.copy(this.matrixWorld).invert());
	}
	lookAt(e, t, n) {
		e.isVector3 ? gl.copy(e) : gl.set(e, t, n);
		let r = this.parent;
		this.updateWorldMatrix(!0, !1), _l.setFromMatrixPosition(this.matrixWorld), this.isCamera || this.isLight ? hl.lookAt(_l, gl, this.up) : hl.lookAt(gl, _l, this.up), this.quaternion.setFromRotationMatrix(hl), r && (hl.extractRotation(r.matrixWorld), ml.setFromRotationMatrix(hl), this.quaternion.premultiply(ml.invert()));
	}
	add(e) {
		if (arguments.length > 1) {
			for (let e = 0; e < arguments.length; e++) this.add(arguments[e]);
			return this;
		}
		return e === this ? (G("Object3D.add: object can't be added as a child of itself.", e), this) : (e && e.isObject3D ? (e.removeFromParent(), e.parent = this, this.children.push(e), e.dispatchEvent(Cl), Tl.child = e, this.dispatchEvent(Tl), Tl.child = null) : G("Object3D.add: object not an instance of THREE.Object3D.", e), this);
	}
	remove(e) {
		if (arguments.length > 1) {
			for (let e = 0; e < arguments.length; e++) this.remove(arguments[e]);
			return this;
		}
		let t = this.children.indexOf(e);
		return t !== -1 && (e.parent = null, this.children.splice(t, 1), e.dispatchEvent(wl), El.child = e, this.dispatchEvent(El), El.child = null), this;
	}
	removeFromParent() {
		let e = this.parent;
		return e !== null && e.remove(this), this;
	}
	clear() {
		return this.remove(...this.children);
	}
	attach(e) {
		return this.updateWorldMatrix(!0, !1), hl.copy(this.matrixWorld).invert(), e.parent !== null && (e.parent.updateWorldMatrix(!0, !1), hl.multiply(e.parent.matrixWorld)), e.applyMatrix4(hl), e.removeFromParent(), e.parent = this, this.children.push(e), e.updateWorldMatrix(!1, !0), e.dispatchEvent(Cl), Tl.child = e, this.dispatchEvent(Tl), Tl.child = null, this;
	}
	getObjectById(e) {
		return this.getObjectByProperty("id", e);
	}
	getObjectByName(e) {
		return this.getObjectByProperty("name", e);
	}
	getObjectByProperty(e, t) {
		if (this[e] === t) return this;
		for (let n = 0, r = this.children.length; n < r; n++) {
			let r = this.children[n].getObjectByProperty(e, t);
			if (r !== void 0) return r;
		}
	}
	getObjectsByProperty(e, t, n = []) {
		this[e] === t && n.push(this);
		let r = this.children;
		for (let i = 0, a = r.length; i < a; i++) r[i].getObjectsByProperty(e, t, n);
		return n;
	}
	getWorldPosition(e) {
		return this.updateWorldMatrix(!0, !1), e.setFromMatrixPosition(this.matrixWorld);
	}
	getWorldQuaternion(e) {
		return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(_l, e, vl), e;
	}
	getWorldScale(e) {
		return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(_l, yl, e), e;
	}
	getWorldDirection(e) {
		this.updateWorldMatrix(!0, !1);
		let t = this.matrixWorld.elements;
		return e.set(t[8], t[9], t[10]).normalize();
	}
	raycast() {}
	intersectsFrustum() {}
	traverse(e) {
		e(this);
		let t = this.children;
		for (let n = 0, r = t.length; n < r; n++) t[n].traverse(e);
	}
	traverseVisible(e) {
		if (this.visible === !1) return;
		e(this);
		let t = this.children;
		for (let n = 0, r = t.length; n < r; n++) t[n].traverseVisible(e);
	}
	traverseAncestors(e) {
		let t = this.parent;
		t !== null && (e(t), t.traverseAncestors(e));
	}
	updateMatrix() {
		this.matrix.compose(this.position, this.quaternion, this.scale);
		let e = this.pivot;
		if (e !== null) {
			let t = e.x, n = e.y, r = e.z, i = this.matrix.elements;
			i[12] += t - i[0] * t - i[4] * n - i[8] * r, i[13] += n - i[1] * t - i[5] * n - i[9] * r, i[14] += r - i[2] * t - i[6] * n - i[10] * r;
		}
		this.matrixWorldNeedsUpdate = !0;
	}
	updateMatrixWorld(e) {
		this.matrixAutoUpdate && this.updateMatrix(), (this.matrixWorldNeedsUpdate || e) && (this.matrixWorldAutoUpdate === !0 && (this.parent === null ? this.matrixWorld.copy(this.matrix) : this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix)), this.matrixWorldNeedsUpdate = !1, e = !0);
		let t = this.children;
		for (let n = 0, r = t.length; n < r; n++) t[n].updateMatrixWorld(e);
	}
	updateWorldMatrix(e, t, n = !1) {
		let r = this.parent;
		if (e === !0 && r !== null && r.updateWorldMatrix(!0, !1), this.matrixAutoUpdate && this.updateMatrix(), (this.matrixWorldNeedsUpdate || n) && (this.matrixWorldAutoUpdate === !0 && (this.parent === null ? this.matrixWorld.copy(this.matrix) : this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix)), this.matrixWorldNeedsUpdate = !1, n = !0), t === !0) {
			let e = this.children;
			for (let t = 0, r = e.length; t < r; t++) e[t].updateWorldMatrix(!1, !0, n);
		}
	}
	toJSON(e) {
		let t = e === void 0 || typeof e == "string", n = {};
		t && (e = {
			geometries: {},
			materials: {},
			textures: {},
			images: {},
			shapes: {},
			skeletons: {},
			animations: {},
			nodes: {}
		}, n.metadata = {
			version: 4.7,
			type: "Object",
			generator: "Object3D.toJSON"
		});
		let r = {};
		r.uuid = this.uuid, r.type = this.type, r.name = this.name, r.castShadow = this.castShadow, r.receiveShadow = this.receiveShadow, r.visible = this.visible, r.frustumCulled = this.frustumCulled, r.renderOrder = this.renderOrder, r.static = this.static, r.matrixAutoUpdate = this.matrixAutoUpdate, Object.keys(this.userData).length > 0 && (r.userData = this.userData), r.layers = this.layers.mask, r.matrix = this.matrix.toArray(), r.up = this.up.toArray(), this.pivot !== null && (r.pivot = this.pivot.toArray()), this.morphTargetDictionary !== void 0 && (r.morphTargetDictionary = Object.assign({}, this.morphTargetDictionary)), this.morphTargetInfluences !== void 0 && (r.morphTargetInfluences = this.morphTargetInfluences.slice()), this.isInstancedMesh && (r.type = "InstancedMesh", r.count = this.count, r.instanceMatrix = this.instanceMatrix.toJSON(), this.instanceColor !== null && (r.instanceColor = this.instanceColor.toJSON())), this.isBatchedMesh && (r.type = "BatchedMesh", r.perObjectFrustumCulled = this.perObjectFrustumCulled, r.sortObjects = this.sortObjects, r.drawRanges = this._drawRanges, r.reservedRanges = this._reservedRanges, r.geometryInfo = this._geometryInfo.map((e) => ({
			...e,
			boundingBox: e.boundingBox ? e.boundingBox.toJSON() : void 0,
			boundingSphere: e.boundingSphere ? e.boundingSphere.toJSON() : void 0
		})), r.instanceInfo = this._instanceInfo.map((e) => ({ ...e })), r.availableInstanceIds = this._availableInstanceIds.slice(), r.availableGeometryIds = this._availableGeometryIds.slice(), r.nextIndexStart = this._nextIndexStart, r.nextVertexStart = this._nextVertexStart, r.geometryCount = this._geometryCount, r.maxInstanceCount = this._maxInstanceCount, r.maxVertexCount = this._maxVertexCount, r.maxIndexCount = this._maxIndexCount, r.geometryInitialized = this._geometryInitialized, r.matricesTexture = this._matricesTexture.toJSON(e), r.indirectTexture = this._indirectTexture.toJSON(e), this._colorsTexture !== null && (r.colorsTexture = this._colorsTexture.toJSON(e)), this.boundingSphere !== null && (r.boundingSphere = this.boundingSphere.toJSON()), this.boundingBox !== null && (r.boundingBox = this.boundingBox.toJSON()));
		function i(t, n) {
			return t[n.uuid] === void 0 && (t[n.uuid] = n.toJSON(e)), n.uuid;
		}
		if (this.isScene) this.background && (this.background.isColor ? r.background = this.background.toJSON() : this.background.isTexture && (r.background = this.background.toJSON(e).uuid)), this.environment && this.environment.isTexture && this.environment.isRenderTargetTexture !== !0 && (r.environment = this.environment.toJSON(e).uuid);
		else if (this.isMesh || this.isLine || this.isPoints) {
			r.geometry = i(e.geometries, this.geometry);
			let t = this.geometry.parameters;
			if (t !== void 0 && t.shapes !== void 0) {
				let n = t.shapes;
				if (Array.isArray(n)) for (let t = 0, r = n.length; t < r; t++) {
					let r = n[t];
					i(e.shapes, r);
				}
				else i(e.shapes, n);
			}
		}
		if (this.isSkinnedMesh && (r.bindMode = this.bindMode, r.bindMatrix = this.bindMatrix.toArray(), this.skeleton !== void 0 && (i(e.skeletons, this.skeleton), r.skeleton = this.skeleton.uuid)), this.material !== void 0) {
			if (Array.isArray(this.material)) {
				let t = [];
				for (let n = 0, r = this.material.length; n < r; n++) t.push(i(e.materials, this.material[n]));
				r.material = t;
			} else r.material = i(e.materials, this.material);
		}
		if (this.children.length > 0) {
			r.children = [];
			for (let t = 0; t < this.children.length; t++) r.children.push(this.children[t].toJSON(e).object);
		}
		if (this.animations.length > 0) {
			r.animations = [];
			for (let t = 0; t < this.animations.length; t++) {
				let n = this.animations[t];
				r.animations.push(i(e.animations, n));
			}
		}
		if (t) {
			let t = a(e.geometries), r = a(e.materials), i = a(e.textures), o = a(e.images), s = a(e.shapes), c = a(e.skeletons), l = a(e.animations), u = a(e.nodes);
			t.length > 0 && (n.geometries = t), r.length > 0 && (n.materials = r), i.length > 0 && (n.textures = i), o.length > 0 && (n.images = o), s.length > 0 && (n.shapes = s), c.length > 0 && (n.skeletons = c), l.length > 0 && (n.animations = l), u.length > 0 && (n.nodes = u);
		}
		return n.object = r, n;
		function a(e) {
			let t = [];
			for (let n in e) {
				let r = e[n];
				delete r.metadata, t.push(r);
			}
			return t;
		}
	}
	clone(e) {
		return new this.constructor().copy(this, e);
	}
	copy(e, t = !0) {
		if (this.name = e.name, this.up.copy(e.up), this.position.copy(e.position), this.rotation.order = e.rotation.order, this.quaternion.copy(e.quaternion), this.scale.copy(e.scale), this.pivot = e.pivot === null ? null : e.pivot.clone(), this.matrix.copy(e.matrix), this.matrixWorld.copy(e.matrixWorld), this.matrixAutoUpdate = e.matrixAutoUpdate, this.matrixWorldAutoUpdate = e.matrixWorldAutoUpdate, this.matrixWorldNeedsUpdate = e.matrixWorldNeedsUpdate, this.layers.mask = e.layers.mask, this.visible = e.visible, this.castShadow = e.castShadow, this.receiveShadow = e.receiveShadow, this.frustumCulled = e.frustumCulled, this.renderOrder = e.renderOrder, this.static = e.static, this.animations = e.animations.slice(), this.userData = JSON.parse(JSON.stringify(e.userData)), t === !0) for (let t = 0; t < e.children.length; t++) {
			let n = e.children[t];
			this.add(n.clone());
		}
		return this;
	}
	dispose() {
		this.dispatchEvent({ type: "dispose" });
	}
};
Dl.DEFAULT_UP = /*@__PURE__*/ new J(0, 1, 0), Dl.DEFAULT_MATRIX_AUTO_UPDATE = !0, Dl.DEFAULT_MATRIX_WORLD_AUTO_UPDATE = !0;
var Ol = class extends Dl {
	constructor() {
		super(), this.isGroup = !0, this.type = "Group";
	}
}, kl = { type: "move" }, Al = class {
	constructor() {
		this._targetRay = null, this._grip = null, this._hand = null;
	}
	getHandSpace() {
		return this._hand === null && (this._hand = new Ol(), this._hand.matrixAutoUpdate = !1, this._hand.visible = !1, this._hand.joints = {}, this._hand.inputState = { pinching: !1 }), this._hand;
	}
	getTargetRaySpace() {
		return this._targetRay === null && (this._targetRay = new Ol(), this._targetRay.matrixAutoUpdate = !1, this._targetRay.visible = !1, this._targetRay.hasLinearVelocity = !1, this._targetRay.linearVelocity = new J(), this._targetRay.hasAngularVelocity = !1, this._targetRay.angularVelocity = new J()), this._targetRay;
	}
	getGripSpace() {
		return this._grip === null && (this._grip = new Ol(), this._grip.matrixAutoUpdate = !1, this._grip.visible = !1, this._grip.hasLinearVelocity = !1, this._grip.linearVelocity = new J(), this._grip.hasAngularVelocity = !1, this._grip.angularVelocity = new J(), this._grip.eventsEnabled = !1), this._grip;
	}
	dispatchEvent(e) {
		return this._targetRay !== null && this._targetRay.dispatchEvent(e), this._grip !== null && this._grip.dispatchEvent(e), this._hand !== null && this._hand.dispatchEvent(e), this;
	}
	connect(e) {
		if (e && e.hand) {
			let t = this._hand;
			if (t) for (let n of e.hand.values()) this._getHandJoint(t, n);
		}
		return this.dispatchEvent({
			type: "connected",
			data: e
		}), this;
	}
	disconnect(e) {
		return this.dispatchEvent({
			type: "disconnected",
			data: e
		}), this._targetRay !== null && (this._targetRay.visible = !1), this._grip !== null && (this._grip.visible = !1), this._hand !== null && (this._hand.visible = !1), this;
	}
	update(e, t, n) {
		let r = null, i = null, a = null, o = this._targetRay, s = this._grip, c = this._hand;
		if (e && t.session.visibilityState !== "visible-blurred") {
			if (c && e.hand) {
				a = !0;
				for (let r of e.hand.values()) {
					let e = t.getJointPose(r, n), i = this._getHandJoint(c, r);
					e !== null && (i.matrix.fromArray(e.transform.matrix), i.matrix.decompose(i.position, i.rotation, i.scale), i.matrixWorldNeedsUpdate = !0, i.jointRadius = e.radius), i.visible = e !== null;
				}
				let r = c.joints["index-finger-tip"], i = c.joints["thumb-tip"], o = r.position.distanceTo(i.position);
				c.inputState.pinching && o > .025 ? (c.inputState.pinching = !1, this.dispatchEvent({
					type: "pinchend",
					handedness: e.handedness,
					target: this
				})) : !c.inputState.pinching && o <= .015 && (c.inputState.pinching = !0, this.dispatchEvent({
					type: "pinchstart",
					handedness: e.handedness,
					target: this
				}));
			} else s !== null && e.gripSpace && (i = t.getPose(e.gripSpace, n), i !== null && (s.matrix.fromArray(i.transform.matrix), s.matrix.decompose(s.position, s.rotation, s.scale), s.matrixWorldNeedsUpdate = !0, i.linearVelocity ? (s.hasLinearVelocity = !0, s.linearVelocity.copy(i.linearVelocity)) : s.hasLinearVelocity = !1, i.angularVelocity ? (s.hasAngularVelocity = !0, s.angularVelocity.copy(i.angularVelocity)) : s.hasAngularVelocity = !1, s.eventsEnabled && s.dispatchEvent({
				type: "gripUpdated",
				data: e,
				target: this
			})));
			o !== null && (r = t.getPose(e.targetRaySpace, n), r === null && i !== null && (r = i), r !== null && (o.matrix.fromArray(r.transform.matrix), o.matrix.decompose(o.position, o.rotation, o.scale), o.matrixWorldNeedsUpdate = !0, r.linearVelocity ? (o.hasLinearVelocity = !0, o.linearVelocity.copy(r.linearVelocity)) : o.hasLinearVelocity = !1, r.angularVelocity ? (o.hasAngularVelocity = !0, o.angularVelocity.copy(r.angularVelocity)) : o.hasAngularVelocity = !1, this.dispatchEvent(kl)));
		}
		return o !== null && (o.visible = r !== null), s !== null && (s.visible = i !== null), c !== null && (c.visible = a !== null), this;
	}
	_getHandJoint(e, t) {
		if (e.joints[t.jointName] === void 0) {
			let n = new Ol();
			n.matrixAutoUpdate = !1, n.visible = !1, e.joints[t.jointName] = n, e.add(n);
		}
		return e.joints[t.jointName];
	}
}, jl = {
	aliceblue: 15792383,
	antiquewhite: 16444375,
	aqua: 65535,
	aquamarine: 8388564,
	azure: 15794175,
	beige: 16119260,
	bisque: 16770244,
	black: 0,
	blanchedalmond: 16772045,
	blue: 255,
	blueviolet: 9055202,
	brown: 10824234,
	burlywood: 14596231,
	cadetblue: 6266528,
	chartreuse: 8388352,
	chocolate: 13789470,
	coral: 16744272,
	cornflowerblue: 6591981,
	cornsilk: 16775388,
	crimson: 14423100,
	cyan: 65535,
	darkblue: 139,
	darkcyan: 35723,
	darkgoldenrod: 12092939,
	darkgray: 11119017,
	darkgreen: 25600,
	darkgrey: 11119017,
	darkkhaki: 12433259,
	darkmagenta: 9109643,
	darkolivegreen: 5597999,
	darkorange: 16747520,
	darkorchid: 10040012,
	darkred: 9109504,
	darksalmon: 15308410,
	darkseagreen: 9419919,
	darkslateblue: 4734347,
	darkslategray: 3100495,
	darkslategrey: 3100495,
	darkturquoise: 52945,
	darkviolet: 9699539,
	deeppink: 16716947,
	deepskyblue: 49151,
	dimgray: 6908265,
	dimgrey: 6908265,
	dodgerblue: 2003199,
	firebrick: 11674146,
	floralwhite: 16775920,
	forestgreen: 2263842,
	fuchsia: 16711935,
	gainsboro: 14474460,
	ghostwhite: 16316671,
	gold: 16766720,
	goldenrod: 14329120,
	gray: 8421504,
	green: 32768,
	greenyellow: 11403055,
	grey: 8421504,
	honeydew: 15794160,
	hotpink: 16738740,
	indianred: 13458524,
	indigo: 4915330,
	ivory: 16777200,
	khaki: 15787660,
	lavender: 15132410,
	lavenderblush: 16773365,
	lawngreen: 8190976,
	lemonchiffon: 16775885,
	lightblue: 11393254,
	lightcoral: 15761536,
	lightcyan: 14745599,
	lightgoldenrodyellow: 16448210,
	lightgray: 13882323,
	lightgreen: 9498256,
	lightgrey: 13882323,
	lightpink: 16758465,
	lightsalmon: 16752762,
	lightseagreen: 2142890,
	lightskyblue: 8900346,
	lightslategray: 7833753,
	lightslategrey: 7833753,
	lightsteelblue: 11584734,
	lightyellow: 16777184,
	lime: 65280,
	limegreen: 3329330,
	linen: 16445670,
	magenta: 16711935,
	maroon: 8388608,
	mediumaquamarine: 6737322,
	mediumblue: 205,
	mediumorchid: 12211667,
	mediumpurple: 9662683,
	mediumseagreen: 3978097,
	mediumslateblue: 8087790,
	mediumspringgreen: 64154,
	mediumturquoise: 4772300,
	mediumvioletred: 13047173,
	midnightblue: 1644912,
	mintcream: 16121850,
	mistyrose: 16770273,
	moccasin: 16770229,
	navajowhite: 16768685,
	navy: 128,
	oldlace: 16643558,
	olive: 8421376,
	olivedrab: 7048739,
	orange: 16753920,
	orangered: 16729344,
	orchid: 14315734,
	palegoldenrod: 15657130,
	palegreen: 10025880,
	paleturquoise: 11529966,
	palevioletred: 14381203,
	papayawhip: 16773077,
	peachpuff: 16767673,
	peru: 13468991,
	pink: 16761035,
	plum: 14524637,
	powderblue: 11591910,
	purple: 8388736,
	rebeccapurple: 6697881,
	red: 16711680,
	rosybrown: 12357519,
	royalblue: 4286945,
	saddlebrown: 9127187,
	salmon: 16416882,
	sandybrown: 16032864,
	seagreen: 3050327,
	seashell: 16774638,
	sienna: 10506797,
	silver: 12632256,
	skyblue: 8900331,
	slateblue: 6970061,
	slategray: 7372944,
	slategrey: 7372944,
	snow: 16775930,
	springgreen: 65407,
	steelblue: 4620980,
	tan: 13808780,
	teal: 32896,
	thistle: 14204888,
	tomato: 16737095,
	turquoise: 4251856,
	violet: 15631086,
	wheat: 16113331,
	white: 16777215,
	whitesmoke: 16119285,
	yellow: 16776960,
	yellowgreen: 10145074
}, Ml = {
	h: 0,
	s: 0,
	l: 0
}, Nl = {
	h: 0,
	s: 0,
	l: 0
};
function Pl(e, t, n) {
	return n < 0 && (n += 1), n > 1 && --n, n < 1 / 6 ? e + (t - e) * 6 * n : n < 1 / 2 ? t : n < 2 / 3 ? e + (t - e) * 6 * (2 / 3 - n) : e;
}
var Z = class {
	constructor(e, t, n) {
		return this.isColor = !0, this.r = 1, this.g = 1, this.b = 1, this.set(e, t, n);
	}
	set(e, t, n) {
		if (t === void 0 && n === void 0) {
			let t = e;
			t && t.isColor ? this.copy(t) : typeof t == "number" ? this.setHex(t) : typeof t == "string" && this.setStyle(t);
		} else this.setRGB(e, t, n);
		return this;
	}
	setScalar(e) {
		return this.r = e, this.g = e, this.b = e, this;
	}
	setHex(e, t = ac) {
		return e = Math.floor(e), this.r = (e >> 16 & 255) / 255, this.g = (e >> 8 & 255) / 255, this.b = (e & 255) / 255, X.colorSpaceToWorking(this, t), this;
	}
	setRGB(e, t, n, r = X.workingColorSpace) {
		return this.r = e, this.g = t, this.b = n, X.colorSpaceToWorking(this, r), this;
	}
	setHSL(e, t, n, r = X.workingColorSpace) {
		if (e = Oc(e, 1), t = K(t, 0, 1), n = K(n, 0, 1), t === 0) this.r = this.g = this.b = n;
		else {
			let r = n <= .5 ? n * (1 + t) : n + t - n * t, i = 2 * n - r;
			this.r = Pl(i, r, e + 1 / 3), this.g = Pl(i, r, e), this.b = Pl(i, r, e - 1 / 3);
		}
		return X.colorSpaceToWorking(this, r), this;
	}
	setStyle(e, t = ac) {
		function n(t) {
			t !== void 0 && parseFloat(t) < 1 && W("Color: Alpha component of " + e + " will be ignored.");
		}
		let r;
		if (r = /^(\w+)\(([^\)]*)\)/.exec(e)) {
			let i, a = r[1], o = r[2];
			switch (a) {
				case "rgb":
				case "rgba":
					if (i = /^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o)) return n(i[4]), this.setRGB(Math.min(255, parseInt(i[1], 10)) / 255, Math.min(255, parseInt(i[2], 10)) / 255, Math.min(255, parseInt(i[3], 10)) / 255, t);
					if (i = /^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o)) return n(i[4]), this.setRGB(Math.min(100, parseInt(i[1], 10)) / 100, Math.min(100, parseInt(i[2], 10)) / 100, Math.min(100, parseInt(i[3], 10)) / 100, t);
					break;
				case "hsl":
				case "hsla":
					if (i = /^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o)) return n(i[4]), this.setHSL(parseFloat(i[1]) / 360, parseFloat(i[2]) / 100, parseFloat(i[3]) / 100, t);
					break;
				default: W("Color: Unknown color model " + e);
			}
		} else if (r = /^\#([A-Fa-f\d]+)$/.exec(e)) {
			let n = r[1], i = n.length;
			if (i === 3) return this.setRGB(parseInt(n.charAt(0), 16) / 15, parseInt(n.charAt(1), 16) / 15, parseInt(n.charAt(2), 16) / 15, t);
			if (i === 6) return this.setHex(parseInt(n, 16), t);
			W("Color: Invalid hex color " + e);
		} else if (e && e.length > 0) return this.setColorName(e, t);
		return this;
	}
	setColorName(e, t = ac) {
		let n = jl[e.toLowerCase()];
		return n === void 0 ? W("Color: Unknown color " + e) : this.setHex(n, t), this;
	}
	clone() {
		return new this.constructor(this.r, this.g, this.b);
	}
	copy(e) {
		return this.r = e.r, this.g = e.g, this.b = e.b, this;
	}
	copySRGBToLinear(e) {
		return this.r = zc(e.r), this.g = zc(e.g), this.b = zc(e.b), this;
	}
	copyLinearToSRGB(e) {
		return this.r = Bc(e.r), this.g = Bc(e.g), this.b = Bc(e.b), this;
	}
	convertSRGBToLinear() {
		return this.copySRGBToLinear(this), this;
	}
	convertLinearToSRGB() {
		return this.copyLinearToSRGB(this), this;
	}
	getHex(e = ac) {
		return X.workingToColorSpace(Fl.copy(this), e), Math.round(K(Fl.r * 255, 0, 255)) * 65536 + Math.round(K(Fl.g * 255, 0, 255)) * 256 + Math.round(K(Fl.b * 255, 0, 255));
	}
	getHexString(e = ac) {
		return ("000000" + this.getHex(e).toString(16)).slice(-6);
	}
	getHSL(e, t = X.workingColorSpace) {
		X.workingToColorSpace(Fl.copy(this), t);
		let n = Fl.r, r = Fl.g, i = Fl.b, a = Math.max(n, r, i), o = Math.min(n, r, i), s, c, l = (o + a) / 2;
		if (o === a) s = 0, c = 0;
		else {
			let e = a - o;
			switch (c = l <= .5 ? e / (a + o) : e / (2 - a - o), a) {
				case n:
					s = (r - i) / e + (r < i ? 6 : 0);
					break;
				case r:
					s = (i - n) / e + 2;
					break;
				case i: s = (n - r) / e + 4;
			}
			s /= 6;
		}
		return e.h = s, e.s = c, e.l = l, e;
	}
	getRGB(e, t = X.workingColorSpace) {
		return X.workingToColorSpace(Fl.copy(this), t), e.r = Fl.r, e.g = Fl.g, e.b = Fl.b, e;
	}
	getStyle(e = ac) {
		X.workingToColorSpace(Fl.copy(this), e);
		let t = Fl.r, n = Fl.g, r = Fl.b;
		return e === "srgb" ? `rgb(${Math.round(t * 255)},${Math.round(n * 255)},${Math.round(r * 255)})` : `color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`;
	}
	offsetHSL(e, t, n) {
		return this.getHSL(Ml), this.setHSL(Ml.h + e, Ml.s + t, Ml.l + n);
	}
	add(e) {
		return this.r += e.r, this.g += e.g, this.b += e.b, this;
	}
	addColors(e, t) {
		return this.r = e.r + t.r, this.g = e.g + t.g, this.b = e.b + t.b, this;
	}
	addScalar(e) {
		return this.r += e, this.g += e, this.b += e, this;
	}
	sub(e) {
		return this.r = Math.max(0, this.r - e.r), this.g = Math.max(0, this.g - e.g), this.b = Math.max(0, this.b - e.b), this;
	}
	multiply(e) {
		return this.r *= e.r, this.g *= e.g, this.b *= e.b, this;
	}
	multiplyScalar(e) {
		return this.r *= e, this.g *= e, this.b *= e, this;
	}
	lerp(e, t) {
		return this.r += (e.r - this.r) * t, this.g += (e.g - this.g) * t, this.b += (e.b - this.b) * t, this;
	}
	lerpColors(e, t, n) {
		return this.r = e.r + (t.r - e.r) * n, this.g = e.g + (t.g - e.g) * n, this.b = e.b + (t.b - e.b) * n, this;
	}
	lerpHSL(e, t) {
		this.getHSL(Ml), e.getHSL(Nl);
		let n = kc(Ml.h, Nl.h, t), r = kc(Ml.s, Nl.s, t), i = kc(Ml.l, Nl.l, t);
		return this.setHSL(n, r, i), this;
	}
	setFromVector3(e) {
		return this.r = e.x, this.g = e.y, this.b = e.z, this;
	}
	applyMatrix3(e) {
		let t = this.r, n = this.g, r = this.b, i = e.elements;
		return this.r = i[0] * t + i[3] * n + i[6] * r, this.g = i[1] * t + i[4] * n + i[7] * r, this.b = i[2] * t + i[5] * n + i[8] * r, this;
	}
	equals(e) {
		return e.r === this.r && e.g === this.g && e.b === this.b;
	}
	fromArray(e, t = 0) {
		return this.r = e[t], this.g = e[t + 1], this.b = e[t + 2], this;
	}
	toArray(e = [], t = 0) {
		return e[t] = this.r, e[t + 1] = this.g, e[t + 2] = this.b, e;
	}
	fromBufferAttribute(e, t) {
		return this.r = e.getX(t), this.g = e.getY(t), this.b = e.getZ(t), this;
	}
	toJSON() {
		return this.getHex();
	}
	*[Symbol.iterator]() {
		yield this.r, yield this.g, yield this.b;
	}
}, Fl = /*@__PURE__*/ new Z();
Z.NAMES = jl;
var Il = class extends Dl {
	constructor() {
		super(), this.isScene = !0, this.type = "Scene", this.background = null, this.environment = null, this.fog = null, this.backgroundBlurriness = 0, this.backgroundIntensity = 1, this.backgroundRotation = new ul(), this.environmentIntensity = 1, this.environmentRotation = new ul(), this.overrideMaterial = null, typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", { detail: this }));
	}
	copy(e, t) {
		return super.copy(e, t), e.background !== null && (this.background = e.background.clone()), e.environment !== null && (this.environment = e.environment.clone()), e.fog !== null && (this.fog = e.fog.clone()), this.backgroundBlurriness = e.backgroundBlurriness, this.backgroundIntensity = e.backgroundIntensity, this.backgroundRotation.copy(e.backgroundRotation), this.environmentIntensity = e.environmentIntensity, this.environmentRotation.copy(e.environmentRotation), e.overrideMaterial !== null && (this.overrideMaterial = e.overrideMaterial.clone()), this.matrixAutoUpdate = e.matrixAutoUpdate, this;
	}
	toJSON(e) {
		let t = super.toJSON(e);
		return this.fog !== null && (t.object.fog = this.fog.toJSON()), t.object.backgroundBlurriness = this.backgroundBlurriness, t.object.backgroundIntensity = this.backgroundIntensity, t.object.backgroundRotation = this.backgroundRotation.toArray(), t.object.environmentIntensity = this.environmentIntensity, t.object.environmentRotation = this.environmentRotation.toArray(), t;
	}
}, Ll = /*@__PURE__*/ new J(), Rl = /*@__PURE__*/ new J(), zl = /*@__PURE__*/ new J(), Bl = /*@__PURE__*/ new J(), Vl = /*@__PURE__*/ new J(), Hl = /*@__PURE__*/ new J(), Ul = /*@__PURE__*/ new J(), Wl = /*@__PURE__*/ new J(), Gl = /*@__PURE__*/ new J(), Kl = /*@__PURE__*/ new J(), ql = /*@__PURE__*/ new Yc(), Jl = /*@__PURE__*/ new Yc(), Yl = /*@__PURE__*/ new Yc(), Xl = class e {
	constructor(e = new J(), t = new J(), n = new J()) {
		this.a = e, this.b = t, this.c = n;
	}
	static getNormal(e, t, n, r) {
		r.subVectors(n, t), Ll.subVectors(e, t), r.cross(Ll);
		let i = r.lengthSq();
		return i > 0 ? r.multiplyScalar(1 / Math.sqrt(i)) : r.set(0, 0, 0);
	}
	static getBarycoord(e, t, n, r, i) {
		Ll.subVectors(r, t), Rl.subVectors(n, t), zl.subVectors(e, t);
		let a = Ll.dot(Ll), o = Ll.dot(Rl), s = Ll.dot(zl), c = Rl.dot(Rl), l = Rl.dot(zl), u = a * c - o * o;
		if (u === 0) return i.set(0, 0, 0), null;
		let d = 1 / u, f = (c * s - o * l) * d, p = (a * l - o * s) * d;
		return i.set(1 - f - p, p, f);
	}
	static containsPoint(e, t, n, r) {
		return this.getBarycoord(e, t, n, r, Bl) !== null && Bl.x >= 0 && Bl.y >= 0 && Bl.x + Bl.y <= 1;
	}
	static getInterpolation(e, t, n, r, i, a, o, s) {
		return this.getBarycoord(e, t, n, r, Bl) === null ? (s.x = 0, s.y = 0, "z" in s && (s.z = 0), "w" in s && (s.w = 0), null) : (s.setScalar(0), s.addScaledVector(i, Bl.x), s.addScaledVector(a, Bl.y), s.addScaledVector(o, Bl.z), s);
	}
	static getInterpolatedAttribute(e, t, n, r, i, a) {
		return ql.setScalar(0), Jl.setScalar(0), Yl.setScalar(0), ql.fromBufferAttribute(e, t), Jl.fromBufferAttribute(e, n), Yl.fromBufferAttribute(e, r), a.setScalar(0), a.addScaledVector(ql, i.x), a.addScaledVector(Jl, i.y), a.addScaledVector(Yl, i.z), a;
	}
	static isFrontFacing(e, t, n, r) {
		return Ll.subVectors(n, t), Rl.subVectors(e, t), Ll.cross(Rl).dot(r) < 0;
	}
	set(e, t, n) {
		return this.a.copy(e), this.b.copy(t), this.c.copy(n), this;
	}
	setFromPointsAndIndices(e, t, n, r) {
		return this.a.copy(e[t]), this.b.copy(e[n]), this.c.copy(e[r]), this;
	}
	setFromAttributeAndIndices(e, t, n, r) {
		return this.a.fromBufferAttribute(e, t), this.b.fromBufferAttribute(e, n), this.c.fromBufferAttribute(e, r), this;
	}
	clone() {
		return new this.constructor().copy(this);
	}
	copy(e) {
		return this.a.copy(e.a), this.b.copy(e.b), this.c.copy(e.c), this;
	}
	getArea() {
		return Ll.subVectors(this.c, this.b), Rl.subVectors(this.a, this.b), Ll.cross(Rl).length() * .5;
	}
	getMidpoint(e) {
		return e.addVectors(this.a, this.b).add(this.c).multiplyScalar(1 / 3);
	}
	getNormal(t) {
		return e.getNormal(this.a, this.b, this.c, t);
	}
	getPlane(e) {
		return e.setFromCoplanarPoints(this.a, this.b, this.c);
	}
	getBarycoord(t, n) {
		return e.getBarycoord(t, this.a, this.b, this.c, n);
	}
	getInterpolation(t, n, r, i, a) {
		return e.getInterpolation(t, this.a, this.b, this.c, n, r, i, a);
	}
	containsPoint(t) {
		return e.containsPoint(t, this.a, this.b, this.c);
	}
	isFrontFacing(t) {
		return e.isFrontFacing(this.a, this.b, this.c, t);
	}
	intersectsBox(e) {
		return e.intersectsTriangle(this);
	}
	closestPointToPoint(e, t) {
		let n = this.a, r = this.b, i = this.c, a, o;
		Vl.subVectors(r, n), Hl.subVectors(i, n), Wl.subVectors(e, n);
		let s = Vl.dot(Wl), c = Hl.dot(Wl);
		if (s <= 0 && c <= 0) return t.copy(n);
		Gl.subVectors(e, r);
		let l = Vl.dot(Gl), u = Hl.dot(Gl);
		if (l >= 0 && u <= l) return t.copy(r);
		let d = s * u - l * c;
		if (d <= 0 && s >= 0 && l <= 0) return a = s / (s - l), t.copy(n).addScaledVector(Vl, a);
		Kl.subVectors(e, i);
		let f = Vl.dot(Kl), p = Hl.dot(Kl);
		if (p >= 0 && f <= p) return t.copy(i);
		let m = f * c - s * p;
		if (m <= 0 && c >= 0 && p <= 0) return o = c / (c - p), t.copy(n).addScaledVector(Hl, o);
		let h = l * p - f * u;
		if (h <= 0 && u - l >= 0 && f - p >= 0) return Ul.subVectors(i, r), o = (u - l) / (u - l + (f - p)), t.copy(r).addScaledVector(Ul, o);
		let g = 1 / (h + m + d);
		return a = m * g, o = d * g, t.copy(n).addScaledVector(Vl, a).addScaledVector(Hl, o);
	}
	equals(e) {
		return e.a.equals(this.a) && e.b.equals(this.b) && e.c.equals(this.c);
	}
}, Zl = class {
	constructor(e = new J(Infinity, Infinity, Infinity), t = new J(-Infinity, -Infinity, -Infinity)) {
		this.isBox3 = !0, this.min = e, this.max = t;
	}
	set(e, t) {
		return this.min.copy(e), this.max.copy(t), this;
	}
	setFromArray(e) {
		this.makeEmpty();
		for (let t = 0, n = e.length; t < n; t += 3) this.expandByPoint($l.fromArray(e, t));
		return this;
	}
	setFromBufferAttribute(e) {
		this.makeEmpty();
		for (let t = 0, n = e.count; t < n; t++) this.expandByPoint($l.fromBufferAttribute(e, t));
		return this;
	}
	setFromPoints(e) {
		this.makeEmpty();
		for (let t = 0, n = e.length; t < n; t++) this.expandByPoint(e[t]);
		return this;
	}
	setFromCenterAndSize(e, t) {
		let n = $l.copy(t).multiplyScalar(.5);
		return this.min.copy(e).sub(n), this.max.copy(e).add(n), this;
	}
	setFromObject(e, t = !1) {
		return this.makeEmpty(), this.expandByObject(e, t);
	}
	clone() {
		return new this.constructor().copy(this);
	}
	copy(e) {
		return this.min.copy(e.min), this.max.copy(e.max), this;
	}
	makeEmpty() {
		return this.min.x = this.min.y = this.min.z = Infinity, this.max.x = this.max.y = this.max.z = -Infinity, this;
	}
	isEmpty() {
		return this.max.x < this.min.x || this.max.y < this.min.y || this.max.z < this.min.z;
	}
	getCenter(e) {
		return this.isEmpty() ? e.set(0, 0, 0) : e.addVectors(this.min, this.max).multiplyScalar(.5);
	}
	getSize(e) {
		return this.isEmpty() ? e.set(0, 0, 0) : e.subVectors(this.max, this.min);
	}
	expandByPoint(e) {
		return this.min.min(e), this.max.max(e), this;
	}
	expandByVector(e) {
		return this.min.sub(e), this.max.add(e), this;
	}
	expandByScalar(e) {
		return this.min.addScalar(-e), this.max.addScalar(e), this;
	}
	expandByObject(e, t = !1) {
		e.updateWorldMatrix(!1, !1);
		let n = e.geometry;
		if (n !== void 0) {
			let r = n.getAttribute("position");
			if (t === !0 && r !== void 0 && e.isInstancedMesh !== !0) for (let t = 0, n = r.count; t < n; t++) e.isMesh === !0 ? e.getVertexPosition(t, $l) : $l.fromBufferAttribute(r, t), $l.applyMatrix4(e.matrixWorld), this.expandByPoint($l);
			else e.boundingBox === void 0 ? (n.boundingBox === null && n.computeBoundingBox(), eu.copy(n.boundingBox)) : (e.boundingBox === null && e.computeBoundingBox(), eu.copy(e.boundingBox)), eu.applyMatrix4(e.matrixWorld), this.union(eu);
		}
		let r = e.children;
		for (let e = 0, n = r.length; e < n; e++) this.expandByObject(r[e], t);
		return this;
	}
	containsPoint(e) {
		return e.x >= this.min.x && e.x <= this.max.x && e.y >= this.min.y && e.y <= this.max.y && e.z >= this.min.z && e.z <= this.max.z;
	}
	containsBox(e) {
		return this.min.x <= e.min.x && e.max.x <= this.max.x && this.min.y <= e.min.y && e.max.y <= this.max.y && this.min.z <= e.min.z && e.max.z <= this.max.z;
	}
	getParameter(e, t) {
		return t.set((e.x - this.min.x) / (this.max.x - this.min.x), (e.y - this.min.y) / (this.max.y - this.min.y), (e.z - this.min.z) / (this.max.z - this.min.z));
	}
	intersectsBox(e) {
		return e.max.x >= this.min.x && e.min.x <= this.max.x && e.max.y >= this.min.y && e.min.y <= this.max.y && e.max.z >= this.min.z && e.min.z <= this.max.z;
	}
	intersectsSphere(e) {
		return this.clampPoint(e.center, $l), $l.distanceToSquared(e.center) <= e.radius * e.radius;
	}
	intersectsPlane(e) {
		let t, n;
		return e.normal.x > 0 ? (t = e.normal.x * this.min.x, n = e.normal.x * this.max.x) : (t = e.normal.x * this.max.x, n = e.normal.x * this.min.x), e.normal.y > 0 ? (t += e.normal.y * this.min.y, n += e.normal.y * this.max.y) : (t += e.normal.y * this.max.y, n += e.normal.y * this.min.y), e.normal.z > 0 ? (t += e.normal.z * this.min.z, n += e.normal.z * this.max.z) : (t += e.normal.z * this.max.z, n += e.normal.z * this.min.z), t <= -e.constant && n >= -e.constant;
	}
	intersectsTriangle(e) {
		if (this.isEmpty()) return !1;
		this.getCenter(su), cu.subVectors(this.max, su), tu.subVectors(e.a, su), nu.subVectors(e.b, su), ru.subVectors(e.c, su), iu.subVectors(nu, tu), au.subVectors(ru, nu), ou.subVectors(tu, ru);
		let t = [
			0,
			-iu.z,
			iu.y,
			0,
			-au.z,
			au.y,
			0,
			-ou.z,
			ou.y,
			iu.z,
			0,
			-iu.x,
			au.z,
			0,
			-au.x,
			ou.z,
			0,
			-ou.x,
			-iu.y,
			iu.x,
			0,
			-au.y,
			au.x,
			0,
			-ou.y,
			ou.x,
			0
		];
		return !du(t, tu, nu, ru, cu) || (t = [
			1,
			0,
			0,
			0,
			1,
			0,
			0,
			0,
			1
		], !du(t, tu, nu, ru, cu)) ? !1 : (lu.crossVectors(iu, au), t = [
			lu.x,
			lu.y,
			lu.z
		], du(t, tu, nu, ru, cu));
	}
	clampPoint(e, t) {
		return t.copy(e).clamp(this.min, this.max);
	}
	distanceToPoint(e) {
		return this.clampPoint(e, $l).distanceTo(e);
	}
	getBoundingSphere(e) {
		return this.isEmpty() ? e.makeEmpty() : (this.getCenter(e.center), e.radius = this.getSize($l).length() * .5), e;
	}
	intersect(e) {
		return this.min.max(e.min), this.max.min(e.max), this.isEmpty() && this.makeEmpty(), this;
	}
	union(e) {
		return this.min.min(e.min), this.max.max(e.max), this;
	}
	applyMatrix4(e) {
		return this.isEmpty() || (Ql[0].set(this.min.x, this.min.y, this.min.z).applyMatrix4(e), Ql[1].set(this.min.x, this.min.y, this.max.z).applyMatrix4(e), Ql[2].set(this.min.x, this.max.y, this.min.z).applyMatrix4(e), Ql[3].set(this.min.x, this.max.y, this.max.z).applyMatrix4(e), Ql[4].set(this.max.x, this.min.y, this.min.z).applyMatrix4(e), Ql[5].set(this.max.x, this.min.y, this.max.z).applyMatrix4(e), Ql[6].set(this.max.x, this.max.y, this.min.z).applyMatrix4(e), Ql[7].set(this.max.x, this.max.y, this.max.z).applyMatrix4(e), this.setFromPoints(Ql)), this;
	}
	translate(e) {
		return this.min.add(e), this.max.add(e), this;
	}
	equals(e) {
		return e.min.equals(this.min) && e.max.equals(this.max);
	}
	toJSON() {
		return {
			min: this.min.toArray(),
			max: this.max.toArray()
		};
	}
	fromJSON(e) {
		return this.min.fromArray(e.min), this.max.fromArray(e.max), this;
	}
}, Ql = [
	/*@__PURE__*/ new J(),
	/*@__PURE__*/ new J(),
	/*@__PURE__*/ new J(),
	/*@__PURE__*/ new J(),
	/*@__PURE__*/ new J(),
	/*@__PURE__*/ new J(),
	/*@__PURE__*/ new J(),
	/*@__PURE__*/ new J()
], $l = /*@__PURE__*/ new J(), eu = /*@__PURE__*/ new Zl(), tu = /*@__PURE__*/ new J(), nu = /*@__PURE__*/ new J(), ru = /*@__PURE__*/ new J(), iu = /*@__PURE__*/ new J(), au = /*@__PURE__*/ new J(), ou = /*@__PURE__*/ new J(), su = /*@__PURE__*/ new J(), cu = /*@__PURE__*/ new J(), lu = /*@__PURE__*/ new J(), uu = /*@__PURE__*/ new J();
function du(e, t, n, r, i) {
	for (let a = 0, o = e.length - 3; a <= o; a += 3) {
		uu.fromArray(e, a);
		let o = i.x * Math.abs(uu.x) + i.y * Math.abs(uu.y) + i.z * Math.abs(uu.z), s = t.dot(uu), c = n.dot(uu), l = r.dot(uu);
		if (Math.max(-Math.max(s, c, l), Math.min(s, c, l)) > o) return !1;
	}
	return !0;
}
var fu = /*@__PURE__*/ new J(), pu = /*@__PURE__*/ new q(), mu = 0, hu = class extends Cc {
	constructor(e, t, n = !1) {
		if (super(), Array.isArray(e)) throw TypeError("THREE.BufferAttribute: array should be a Typed Array.");
		this.isBufferAttribute = !0, Object.defineProperty(this, "id", { value: mu++ }), this.name = "", this.array = e, this.itemSize = t, this.count = e === void 0 ? 0 : e.length / t, this.normalized = n, this.usage = uc, this.updateRanges = [], this.gpuType = Qo, this.version = 0;
	}
	onUploadCallback() {}
	set needsUpdate(e) {
		e === !0 && this.version++;
	}
	setUsage(e) {
		return this.usage = e, this;
	}
	addUpdateRange(e, t) {
		this.updateRanges.push({
			start: e,
			count: t
		});
	}
	clearUpdateRanges() {
		this.updateRanges.length = 0;
	}
	copy(e) {
		return this.name = e.name, this.array = new e.array.constructor(e.array), this.itemSize = e.itemSize, this.count = e.count, this.normalized = e.normalized, this.usage = e.usage, this.gpuType = e.gpuType, this;
	}
	copyAt(e, t, n) {
		e *= this.itemSize, n *= t.itemSize;
		for (let r = 0, i = this.itemSize; r < i; r++) this.array[e + r] = t.array[n + r];
		return this;
	}
	copyArray(e) {
		return this.array.set(e), this;
	}
	applyMatrix3(e) {
		if (this.itemSize === 2) for (let t = 0, n = this.count; t < n; t++) pu.fromBufferAttribute(this, t), pu.applyMatrix3(e), this.setXY(t, pu.x, pu.y);
		else if (this.itemSize === 3) for (let t = 0, n = this.count; t < n; t++) fu.fromBufferAttribute(this, t), fu.applyMatrix3(e), this.setXYZ(t, fu.x, fu.y, fu.z);
		return this;
	}
	applyMatrix4(e) {
		for (let t = 0, n = this.count; t < n; t++) fu.fromBufferAttribute(this, t), fu.applyMatrix4(e), this.setXYZ(t, fu.x, fu.y, fu.z);
		return this;
	}
	applyNormalMatrix(e) {
		for (let t = 0, n = this.count; t < n; t++) fu.fromBufferAttribute(this, t), fu.applyNormalMatrix(e), this.setXYZ(t, fu.x, fu.y, fu.z);
		return this;
	}
	transformDirection(e) {
		for (let t = 0, n = this.count; t < n; t++) fu.fromBufferAttribute(this, t), fu.transformDirection(e), this.setXYZ(t, fu.x, fu.y, fu.z);
		return this;
	}
	set(e, t = 0) {
		return this.array.set(e, t), this;
	}
	getComponent(e, t) {
		let n = this.array[e * this.itemSize + t];
		return this.normalized && (n = Ac(n, this.array)), n;
	}
	setComponent(e, t, n) {
		return this.normalized && (n = jc(n, this.array)), this.array[e * this.itemSize + t] = n, this;
	}
	getX(e) {
		let t = this.array[e * this.itemSize];
		return this.normalized && (t = Ac(t, this.array)), t;
	}
	setX(e, t) {
		return this.normalized && (t = jc(t, this.array)), this.array[e * this.itemSize] = t, this;
	}
	getY(e) {
		let t = this.array[e * this.itemSize + 1];
		return this.normalized && (t = Ac(t, this.array)), t;
	}
	setY(e, t) {
		return this.normalized && (t = jc(t, this.array)), this.array[e * this.itemSize + 1] = t, this;
	}
	getZ(e) {
		let t = this.array[e * this.itemSize + 2];
		return this.normalized && (t = Ac(t, this.array)), t;
	}
	setZ(e, t) {
		return this.normalized && (t = jc(t, this.array)), this.array[e * this.itemSize + 2] = t, this;
	}
	getW(e) {
		let t = this.array[e * this.itemSize + 3];
		return this.normalized && (t = Ac(t, this.array)), t;
	}
	setW(e, t) {
		return this.normalized && (t = jc(t, this.array)), this.array[e * this.itemSize + 3] = t, this;
	}
	setXY(e, t, n) {
		return e *= this.itemSize, this.normalized && (t = jc(t, this.array), n = jc(n, this.array)), this.array[e + 0] = t, this.array[e + 1] = n, this;
	}
	setXYZ(e, t, n, r) {
		return e *= this.itemSize, this.normalized && (t = jc(t, this.array), n = jc(n, this.array), r = jc(r, this.array)), this.array[e + 0] = t, this.array[e + 1] = n, this.array[e + 2] = r, this;
	}
	setXYZW(e, t, n, r, i) {
		return e *= this.itemSize, this.normalized && (t = jc(t, this.array), n = jc(n, this.array), r = jc(r, this.array), i = jc(i, this.array)), this.array[e + 0] = t, this.array[e + 1] = n, this.array[e + 2] = r, this.array[e + 3] = i, this;
	}
	onUpload(e) {
		return this.onUploadCallback = e, this;
	}
	clone() {
		return new this.constructor(this.array, this.itemSize).copy(this);
	}
	toJSON() {
		let e = {
			itemSize: this.itemSize,
			type: this.array.constructor.name,
			array: Array.from(this.array),
			normalized: this.normalized
		};
		return e.name = this.name, e.usage = this.usage, e.gpuType = this.gpuType, e;
	}
	dispose() {
		this.dispatchEvent({ type: "dispose" });
	}
}, gu = class extends hu {
	constructor(e, t, n) {
		super(new Uint16Array(e), t, n);
	}
}, _u = class extends hu {
	constructor(e, t, n) {
		super(new Uint32Array(e), t, n);
	}
}, vu = class extends hu {
	constructor(e, t, n) {
		super(new Float32Array(e), t, n);
	}
}, yu = /*@__PURE__*/ new Zl(), bu = /*@__PURE__*/ new J(), xu = /*@__PURE__*/ new J(), Su = class {
	constructor(e = new J(), t = -1) {
		this.isSphere = !0, this.center = e, this.radius = t;
	}
	set(e, t) {
		return this.center.copy(e), this.radius = t, this;
	}
	setFromPoints(e, t) {
		let n = this.center;
		t === void 0 ? yu.setFromPoints(e).getCenter(n) : n.copy(t);
		let r = 0;
		for (let t = 0, i = e.length; t < i; t++) r = Math.max(r, n.distanceToSquared(e[t]));
		return this.radius = Math.sqrt(r), this;
	}
	copy(e) {
		return this.center.copy(e.center), this.radius = e.radius, this;
	}
	isEmpty() {
		return this.radius < 0;
	}
	makeEmpty() {
		return this.center.set(0, 0, 0), this.radius = -1, this;
	}
	containsPoint(e) {
		return e.distanceToSquared(this.center) <= this.radius * this.radius;
	}
	distanceToPoint(e) {
		return e.distanceTo(this.center) - this.radius;
	}
	intersectsSphere(e) {
		let t = this.radius + e.radius;
		return e.center.distanceToSquared(this.center) <= t * t;
	}
	intersectsBox(e) {
		return e.intersectsSphere(this);
	}
	intersectsPlane(e) {
		return Math.abs(e.distanceToPoint(this.center)) <= this.radius;
	}
	clampPoint(e, t) {
		let n = this.center.distanceToSquared(e);
		return t.copy(e), n > this.radius * this.radius && (t.sub(this.center).normalize(), t.multiplyScalar(this.radius).add(this.center)), t;
	}
	getBoundingBox(e) {
		return this.isEmpty() ? (e.makeEmpty(), e) : (e.set(this.center, this.center), e.expandByScalar(this.radius), e);
	}
	applyMatrix4(e) {
		return this.center.applyMatrix4(e), this.radius *= e.getMaxScaleOnAxis(), this;
	}
	translate(e) {
		return this.center.add(e), this;
	}
	expandByPoint(e) {
		if (this.isEmpty()) return this.center.copy(e), this.radius = 0, this;
		bu.subVectors(e, this.center);
		let t = bu.lengthSq();
		if (t > this.radius * this.radius) {
			let e = Math.sqrt(t), n = (e - this.radius) * .5;
			this.center.addScaledVector(bu, n / e), this.radius += n;
		}
		return this;
	}
	union(e) {
		return e.isEmpty() ? this : this.isEmpty() ? (this.copy(e), this) : (this.center.equals(e.center) === !0 ? this.radius = Math.max(this.radius, e.radius) : (xu.subVectors(e.center, this.center).setLength(e.radius), this.expandByPoint(bu.copy(e.center).add(xu)), this.expandByPoint(bu.copy(e.center).sub(xu))), this);
	}
	equals(e) {
		return e.center.equals(this.center) && e.radius === this.radius;
	}
	clone() {
		return new this.constructor().copy(this);
	}
	toJSON() {
		return {
			radius: this.radius,
			center: this.center.toArray()
		};
	}
	fromJSON(e) {
		return this.radius = e.radius, this.center.fromArray(e.center), this;
	}
}, Cu = 0, wu = /*@__PURE__*/ new el(), Tu = /*@__PURE__*/ new Dl(), Eu = /*@__PURE__*/ new J(), Du = /*@__PURE__*/ new Zl(), Ou = /*@__PURE__*/ new Zl(), ku = /*@__PURE__*/ new J(), Au = class e extends Cc {
	constructor() {
		super(), this.isBufferGeometry = !0, Object.defineProperty(this, "id", { value: Cu++ }), this.uuid = Dc(), this.name = "", this.type = "BufferGeometry", this.index = null, this.indirect = null, this.indirectOffset = 0, this.attributes = {}, this.morphAttributes = {}, this.morphTargetsRelative = !1, this.groups = [], this.boundingBox = null, this.boundingSphere = null, this.drawRange = {
			start: 0,
			count: Infinity
		}, this.userData = {}, this._transformed = !1;
	}
	getIndex() {
		return this.index;
	}
	setIndex(e) {
		return this.index = Array.isArray(e) ? new (pc(e) ? _u : gu)(e, 1) : e, this;
	}
	setIndirect(e, t = 0) {
		return this.indirect = e, this.indirectOffset = t, this;
	}
	getIndirect() {
		return this.indirect;
	}
	getAttribute(e) {
		return this.attributes[e];
	}
	setAttribute(e, t) {
		return this.attributes[e] = t, this;
	}
	deleteAttribute(e) {
		return delete this.attributes[e], this;
	}
	hasAttribute(e) {
		return this.attributes[e] !== void 0;
	}
	addGroup(e, t, n = 0) {
		this.groups.push({
			start: e,
			count: t,
			materialIndex: n
		});
	}
	clearGroups() {
		this.groups = [];
	}
	setDrawRange(e, t) {
		this.drawRange.start = e, this.drawRange.count = t;
	}
	applyMatrix4(e) {
		let t = this.attributes.position;
		t !== void 0 && (t.applyMatrix4(e), t.needsUpdate = !0);
		let n = this.attributes.normal;
		if (n !== void 0) {
			let t = new Y().getNormalMatrix(e);
			n.applyNormalMatrix(t), n.needsUpdate = !0;
		}
		let r = this.attributes.tangent;
		return r !== void 0 && (r.transformDirection(e), r.needsUpdate = !0), this.boundingBox !== null && this.computeBoundingBox(), this.boundingSphere !== null && this.computeBoundingSphere(), this._transformed = !0, this;
	}
	applyQuaternion(e) {
		return wu.makeRotationFromQuaternion(e), this.applyMatrix4(wu), this;
	}
	rotateX(e) {
		return wu.makeRotationX(e), this.applyMatrix4(wu), this;
	}
	rotateY(e) {
		return wu.makeRotationY(e), this.applyMatrix4(wu), this;
	}
	rotateZ(e) {
		return wu.makeRotationZ(e), this.applyMatrix4(wu), this;
	}
	translate(e, t, n) {
		return wu.makeTranslation(e, t, n), this.applyMatrix4(wu), this;
	}
	scale(e, t, n) {
		return wu.makeScale(e, t, n), this.applyMatrix4(wu), this;
	}
	lookAt(e) {
		return Tu.lookAt(e), Tu.updateMatrix(), this.applyMatrix4(Tu.matrix), this;
	}
	center() {
		return this.computeBoundingBox(), this.boundingBox.getCenter(Eu).negate(), this.translate(Eu.x, Eu.y, Eu.z), this;
	}
	setFromPoints(e) {
		let t = this.getAttribute("position");
		if (t === void 0) {
			let t = [];
			for (let n = 0, r = e.length; n < r; n++) {
				let r = e[n];
				t.push(r.x, r.y, r.z || 0);
			}
			this.setAttribute("position", new vu(t, 3));
		} else {
			let n = Math.min(e.length, t.count);
			for (let r = 0; r < n; r++) {
				let n = e[r];
				t.setXYZ(r, n.x, n.y, n.z || 0);
			}
			e.length > t.count && W("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."), t.needsUpdate = !0;
		}
		return this;
	}
	computeBoundingBox() {
		this.boundingBox === null && (this.boundingBox = new Zl());
		let e = this.attributes.position, t = this.morphAttributes.position;
		if (e && e.isGLBufferAttribute) G("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.", this), this.boundingBox.set(new J(-Infinity, -Infinity, -Infinity), new J(Infinity, Infinity, Infinity));
		else {
			if (e !== void 0) {
				if (this.boundingBox.setFromBufferAttribute(e), t) for (let e = 0, n = t.length; e < n; e++) {
					let n = t[e];
					Du.setFromBufferAttribute(n), this.morphTargetsRelative ? (ku.addVectors(this.boundingBox.min, Du.min), this.boundingBox.expandByPoint(ku), ku.addVectors(this.boundingBox.max, Du.max), this.boundingBox.expandByPoint(ku)) : (this.boundingBox.expandByPoint(Du.min), this.boundingBox.expandByPoint(Du.max));
				}
			} else this.boundingBox.makeEmpty();
			(isNaN(this.boundingBox.min.x) || isNaN(this.boundingBox.min.y) || isNaN(this.boundingBox.min.z)) && G("BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The \"position\" attribute is likely to have NaN values.", this);
		}
	}
	computeBoundingSphere() {
		this.boundingSphere === null && (this.boundingSphere = new Su());
		let e = this.attributes.position, t = this.morphAttributes.position;
		if (e && e.isGLBufferAttribute) G("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.", this), this.boundingSphere.set(new J(), Infinity);
		else if (e) {
			let n = this.boundingSphere.center;
			if (Du.setFromBufferAttribute(e), t) for (let e = 0, n = t.length; e < n; e++) {
				let n = t[e];
				Ou.setFromBufferAttribute(n), this.morphTargetsRelative ? (ku.addVectors(Du.min, Ou.min), Du.expandByPoint(ku), ku.addVectors(Du.max, Ou.max), Du.expandByPoint(ku)) : (Du.expandByPoint(Ou.min), Du.expandByPoint(Ou.max));
			}
			Du.getCenter(n);
			let r = 0;
			for (let t = 0, i = e.count; t < i; t++) ku.fromBufferAttribute(e, t), r = Math.max(r, n.distanceToSquared(ku));
			if (t) for (let i = 0, a = t.length; i < a; i++) {
				let a = t[i], o = this.morphTargetsRelative;
				for (let t = 0, i = a.count; t < i; t++) ku.fromBufferAttribute(a, t), o && (Eu.fromBufferAttribute(e, t), ku.add(Eu)), r = Math.max(r, n.distanceToSquared(ku));
			}
			this.boundingSphere.radius = Math.sqrt(r), isNaN(this.boundingSphere.radius) && G("BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The \"position\" attribute is likely to have NaN values.", this);
		}
	}
	computeTangents() {
		let e = this.index, t = this.attributes;
		if (e === null || t.position === void 0 || t.normal === void 0 || t.uv === void 0) {
			G("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");
			return;
		}
		let n = t.position, r = t.normal, i = t.uv, a = this.getAttribute("tangent");
		(a === void 0 || a.count !== n.count) && (a = new hu(new Float32Array(4 * n.count), 4), this.setAttribute("tangent", a));
		let o = [], s = [];
		for (let e = 0; e < n.count; e++) o[e] = new J(), s[e] = new J();
		let c = new J(), l = new J(), u = new J(), d = new q(), f = new q(), p = new q(), m = new J(), h = new J();
		function g(e, t, r) {
			c.fromBufferAttribute(n, e), l.fromBufferAttribute(n, t), u.fromBufferAttribute(n, r), d.fromBufferAttribute(i, e), f.fromBufferAttribute(i, t), p.fromBufferAttribute(i, r), l.sub(c), u.sub(c), f.sub(d), p.sub(d);
			let a = 1 / (f.x * p.y - p.x * f.y);
			isFinite(a) && (m.copy(l).multiplyScalar(p.y).addScaledVector(u, -f.y).multiplyScalar(a), h.copy(u).multiplyScalar(f.x).addScaledVector(l, -p.x).multiplyScalar(a), o[e].add(m), o[t].add(m), o[r].add(m), s[e].add(h), s[t].add(h), s[r].add(h));
		}
		let _ = this.groups;
		_.length === 0 && (_ = [{
			start: 0,
			count: e.count
		}]);
		for (let t = 0, n = _.length; t < n; ++t) {
			let n = _[t], r = n.start, i = n.count;
			for (let t = r, n = r + i; t < n; t += 3) g(e.getX(t + 0), e.getX(t + 1), e.getX(t + 2));
		}
		let v = new J(), y = new J(), b = new J(), x = new J();
		function S(e) {
			b.fromBufferAttribute(r, e), x.copy(b);
			let t = o[e];
			v.copy(t), v.sub(b.multiplyScalar(b.dot(t))).normalize(), y.crossVectors(x, t);
			let n = y.dot(s[e]) < 0 ? -1 : 1;
			a.setXYZW(e, v.x, v.y, v.z, n);
		}
		for (let t = 0, n = _.length; t < n; ++t) {
			let n = _[t], r = n.start, i = n.count;
			for (let t = r, n = r + i; t < n; t += 3) S(e.getX(t + 0)), S(e.getX(t + 1)), S(e.getX(t + 2));
		}
		this._transformed = !0;
	}
	computeVertexNormals() {
		let e = this.index, t = this.getAttribute("position");
		if (t !== void 0) {
			let n = this.getAttribute("normal");
			if (n === void 0 || n.count !== t.count) n = new hu(new Float32Array(t.count * 3), 3), this.setAttribute("normal", n);
			else for (let e = 0, t = n.count; e < t; e++) n.setXYZ(e, 0, 0, 0);
			let r = new J(), i = new J(), a = new J(), o = new J(), s = new J(), c = new J(), l = new J(), u = new J();
			if (e) for (let d = 0, f = e.count; d < f; d += 3) {
				let f = e.getX(d + 0), p = e.getX(d + 1), m = e.getX(d + 2);
				r.fromBufferAttribute(t, f), i.fromBufferAttribute(t, p), a.fromBufferAttribute(t, m), l.subVectors(a, i), u.subVectors(r, i), l.cross(u), o.fromBufferAttribute(n, f), s.fromBufferAttribute(n, p), c.fromBufferAttribute(n, m), o.add(l), s.add(l), c.add(l), n.setXYZ(f, o.x, o.y, o.z), n.setXYZ(p, s.x, s.y, s.z), n.setXYZ(m, c.x, c.y, c.z);
			}
			else for (let e = 0, o = t.count; e < o; e += 3) r.fromBufferAttribute(t, e + 0), i.fromBufferAttribute(t, e + 1), a.fromBufferAttribute(t, e + 2), l.subVectors(a, i), u.subVectors(r, i), l.cross(u), n.setXYZ(e + 0, l.x, l.y, l.z), n.setXYZ(e + 1, l.x, l.y, l.z), n.setXYZ(e + 2, l.x, l.y, l.z);
			this.normalizeNormals(), n.needsUpdate = !0;
		}
	}
	normalizeNormals() {
		let e = this.attributes.normal;
		for (let t = 0, n = e.count; t < n; t++) ku.fromBufferAttribute(e, t), ku.normalize(), e.setXYZ(t, ku.x, ku.y, ku.z);
	}
	toNonIndexed() {
		function t(e, t) {
			let n = e.array, r = e.itemSize, i = e.normalized, a = new n.constructor(t.length * r), o = 0, s = 0;
			for (let i = 0, c = t.length; i < c; i++) {
				o = e.isInterleavedBufferAttribute ? t[i] * e.data.stride + e.offset : t[i] * r;
				for (let e = 0; e < r; e++) a[s++] = n[o++];
			}
			return new hu(a, r, i);
		}
		if (this.index === null) return W("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."), this;
		let n = new e(), r = this.index.array, i = this.attributes;
		for (let e in i) {
			let a = i[e], o = t(a, r);
			n.setAttribute(e, o);
		}
		let a = this.morphAttributes;
		for (let e in a) {
			let i = [], o = a[e];
			for (let e = 0, n = o.length; e < n; e++) {
				let n = o[e], a = t(n, r);
				i.push(a);
			}
			n.morphAttributes[e] = i;
		}
		n.morphTargetsRelative = this.morphTargetsRelative;
		let o = this.groups;
		for (let e = 0, t = o.length; e < t; e++) {
			let t = o[e];
			n.addGroup(t.start, t.count, t.materialIndex);
		}
		return n;
	}
	toJSON() {
		let e = { metadata: {
			version: 4.7,
			type: "BufferGeometry",
			generator: "BufferGeometry.toJSON"
		} };
		if (e.uuid = this.uuid, e.type = this.parameters !== void 0 && this._transformed === !0 ? "BufferGeometry" : this.type, e.name = this.name, Object.keys(this.userData).length > 0 && (e.userData = this.userData), this.parameters !== void 0 && this._transformed !== !0) {
			let t = this.parameters;
			for (let n in t) t[n] !== void 0 && (e[n] = t[n]);
			return e;
		}
		e.data = { attributes: {} };
		let t = this.index;
		t !== null && (e.data.index = {
			type: t.array.constructor.name,
			array: Array.prototype.slice.call(t.array)
		});
		let n = this.attributes;
		for (let t in n) {
			let r = n[t];
			e.data.attributes[t] = r.toJSON(e.data);
		}
		let r = {}, i = !1;
		for (let t in this.morphAttributes) {
			let n = this.morphAttributes[t], a = [];
			for (let t = 0, r = n.length; t < r; t++) {
				let r = n[t];
				a.push(r.toJSON(e.data));
			}
			a.length > 0 && (r[t] = a, i = !0);
		}
		i && (e.data.morphAttributes = r, e.data.morphTargetsRelative = this.morphTargetsRelative);
		let a = this.groups;
		a.length > 0 && (e.data.groups = JSON.parse(JSON.stringify(a)));
		let o = this.boundingSphere;
		return o !== null && (e.data.boundingSphere = o.toJSON()), e;
	}
	clone() {
		return new this.constructor().copy(this);
	}
	copy(e) {
		this.index = null, this.attributes = {}, this.morphAttributes = {}, this.groups = [], this.boundingBox = null, this.boundingSphere = null;
		let t = {};
		this.name = e.name;
		let n = e.index;
		n !== null && this.setIndex(n.clone());
		let r = e.attributes;
		for (let e in r) {
			let n = r[e];
			this.setAttribute(e, n.clone(t));
		}
		let i = e.morphAttributes;
		for (let e in i) {
			let n = [], r = i[e];
			for (let e = 0, i = r.length; e < i; e++) n.push(r[e].clone(t));
			this.morphAttributes[e] = n;
		}
		this.morphTargetsRelative = e.morphTargetsRelative;
		let a = e.groups;
		for (let e = 0, t = a.length; e < t; e++) {
			let t = a[e];
			this.addGroup(t.start, t.count, t.materialIndex);
		}
		let o = e.boundingBox;
		o !== null && (this.boundingBox = o.clone());
		let s = e.boundingSphere;
		return s !== null && (this.boundingSphere = s.clone()), this.drawRange.start = e.drawRange.start, this.drawRange.count = e.drawRange.count, this.userData = e.userData, this._transformed = e._transformed, this;
	}
	dispose() {
		this.dispatchEvent({ type: "dispose" });
	}
}, ju = /*@__PURE__*/ new J(), Mu = /*@__PURE__*/ new J(), Nu = /*@__PURE__*/ new Y(), Pu = class {
	constructor(e = new J(1, 0, 0), t = 0) {
		this.isPlane = !0, this.normal = e, this.constant = t;
	}
	set(e, t) {
		return this.normal.copy(e), this.constant = t, this;
	}
	setComponents(e, t, n, r) {
		return this.normal.set(e, t, n), this.constant = r, this;
	}
	setFromNormalAndCoplanarPoint(e, t) {
		return this.normal.copy(e), this.constant = -t.dot(this.normal), this;
	}
	setFromCoplanarPoints(e, t, n) {
		let r = ju.subVectors(n, t).cross(Mu.subVectors(e, t)).normalize();
		return this.setFromNormalAndCoplanarPoint(r, e), this;
	}
	copy(e) {
		return this.normal.copy(e.normal), this.constant = e.constant, this;
	}
	normalize() {
		let e = 1 / this.normal.length();
		return this.normal.multiplyScalar(e), this.constant *= e, this;
	}
	negate() {
		return this.constant *= -1, this.normal.negate(), this;
	}
	distanceToPoint(e) {
		return this.normal.dot(e) + this.constant;
	}
	distanceToSphere(e) {
		return this.distanceToPoint(e.center) - e.radius;
	}
	projectPoint(e, t) {
		return t.copy(e).addScaledVector(this.normal, -this.distanceToPoint(e));
	}
	intersectLine(e, t, n = !0) {
		let r = e.delta(ju), i = this.normal.dot(r);
		if (i === 0) return this.distanceToPoint(e.start) === 0 ? t.copy(e.start) : null;
		let a = -(e.start.dot(this.normal) + this.constant) / i;
		return n === !0 && (a < 0 || a > 1) ? null : t.copy(e.start).addScaledVector(r, a);
	}
	intersectsLine(e) {
		let t = this.distanceToPoint(e.start), n = this.distanceToPoint(e.end);
		return t < 0 && n > 0 || n < 0 && t > 0;
	}
	intersectsBox(e) {
		return e.intersectsPlane(this);
	}
	intersectsSphere(e) {
		return e.intersectsPlane(this);
	}
	coplanarPoint(e) {
		return e.copy(this.normal).multiplyScalar(-this.constant);
	}
	applyMatrix4(e, t) {
		let n = t || Nu.getNormalMatrix(e), r = this.coplanarPoint(ju).applyMatrix4(e), i = this.normal.applyMatrix3(n).normalize();
		return this.constant = -r.dot(i), this;
	}
	translate(e) {
		return this.constant -= e.dot(this.normal), this;
	}
	equals(e) {
		return e.normal.equals(this.normal) && e.constant === this.constant;
	}
	clone() {
		return new this.constructor().copy(this);
	}
	toJSON() {
		return {
			normal: this.normal.toArray(),
			constant: this.constant
		};
	}
	fromJSON(e) {
		return this.normal.fromArray(e.normal), this.constant = e.constant, this;
	}
}, Fu = 0, Iu = class extends Cc {
	constructor() {
		super(), this.isMaterial = !0, Object.defineProperty(this, "id", { value: Fu++ }), this.uuid = Dc(), this.name = "", this.type = "Material", this.blending = 1, this.side = 0, this.vertexColors = !1, this.opacity = 1, this.transparent = !1, this.alphaHash = !1, this.blendSrc = 204, this.blendDst = 205, this.blendEquation = 100, this.blendSrcAlpha = null, this.blendDstAlpha = null, this.blendEquationAlpha = null, this.blendColor = new Z(0, 0, 0), this.blendAlpha = 0, this.depthFunc = 3, this.depthTest = !0, this.depthWrite = !0, this.stencilWriteMask = 255, this.stencilFunc = 519, this.stencilRef = 0, this.stencilFuncMask = 255, this.stencilFail = lc, this.stencilZFail = lc, this.stencilZPass = lc, this.stencilWrite = !1, this.clippingPlanes = null, this.clipIntersection = !1, this.clipShadows = !1, this.shadowSide = null, this.colorWrite = !0, this.precision = null, this.polygonOffset = !1, this.polygonOffsetFactor = 0, this.polygonOffsetUnits = 0, this.dithering = !1, this.alphaToCoverage = !1, this.premultipliedAlpha = !1, this.forceSinglePass = !1, this.allowOverride = !0, this.visible = !0, this.toneMapped = !0, this.userData = {}, this.version = 0, this._alphaTest = 0;
	}
	get alphaTest() {
		return this._alphaTest;
	}
	set alphaTest(e) {
		this._alphaTest > 0 != e > 0 && this.version++, this._alphaTest = e;
	}
	onBeforeRender() {}
	onBeforeCompile() {}
	customProgramCacheKey() {
		return this.onBeforeCompile.toString();
	}
	setValues(e) {
		if (e !== void 0) for (let t in e) {
			let n = e[t];
			if (n === void 0) {
				W(`Material: parameter '${t}' has value of undefined.`);
				continue;
			}
			let r = this[t];
			r === void 0 ? W(`Material: '${t}' is not a property of THREE.${this.type}.`) : r && r.isColor ? r.set(n) : r && r.isVector2 && n && n.isVector2 || r && r.isEuler && n && n.isEuler || r && r.isVector3 && n && n.isVector3 ? r.copy(n) : this[t] = n;
		}
	}
	toJSON(e) {
		let t = e === void 0 || typeof e == "string";
		t && (e = {
			textures: {},
			images: {}
		});
		let n = { metadata: {
			version: 4.7,
			type: "Material",
			generator: "Material.toJSON"
		} };
		n.uuid = this.uuid, n.type = this.type, n.blending = this.blending, n.side = this.side, n.shadowSide = this.shadowSide, n.vertexColors = this.vertexColors, n.opacity = this.opacity, n.transparent = this.transparent, n.blendSrc = this.blendSrc, n.blendDst = this.blendDst, n.blendEquation = this.blendEquation, n.blendSrcAlpha = this.blendSrcAlpha, n.blendDstAlpha = this.blendDstAlpha, n.blendEquationAlpha = this.blendEquationAlpha, n.blendColor = this.blendColor.getHex(), n.blendAlpha = this.blendAlpha, n.depthFunc = this.depthFunc, n.depthTest = this.depthTest, n.depthWrite = this.depthWrite, n.colorWrite = this.colorWrite, n.clipIntersection = this.clipIntersection, n.clipShadows = this.clipShadows, n.stencilWriteMask = this.stencilWriteMask, n.stencilFunc = this.stencilFunc, n.stencilRef = this.stencilRef, n.stencilFuncMask = this.stencilFuncMask, n.stencilFail = this.stencilFail, n.stencilZFail = this.stencilZFail, n.stencilZPass = this.stencilZPass, n.stencilWrite = this.stencilWrite, n.polygonOffset = this.polygonOffset, n.polygonOffsetFactor = this.polygonOffsetFactor, n.polygonOffsetUnits = this.polygonOffsetUnits, n.dithering = this.dithering, n.alphaTest = this.alphaTest, n.alphaHash = this.alphaHash, n.alphaToCoverage = this.alphaToCoverage, n.premultipliedAlpha = this.premultipliedAlpha, n.forceSinglePass = this.forceSinglePass, n.allowOverride = this.allowOverride, n.visible = this.visible, n.toneMapped = this.toneMapped, n.name = this.name, this.color && this.color.isColor && (n.color = this.color.getHex()), this.roughness !== void 0 && (n.roughness = this.roughness), this.metalness !== void 0 && (n.metalness = this.metalness), this.sheen !== void 0 && (n.sheen = this.sheen), this.sheenColor && this.sheenColor.isColor && (n.sheenColor = this.sheenColor.getHex()), this.sheenRoughness !== void 0 && (n.sheenRoughness = this.sheenRoughness), this.emissive && this.emissive.isColor && (n.emissive = this.emissive.getHex()), this.emissiveIntensity !== void 0 && (n.emissiveIntensity = this.emissiveIntensity), this.specular && this.specular.isColor && (n.specular = this.specular.getHex()), this.specularIntensity !== void 0 && (n.specularIntensity = this.specularIntensity), this.specularColor && this.specularColor.isColor && (n.specularColor = this.specularColor.getHex()), this.shininess !== void 0 && (n.shininess = this.shininess), this.clearcoat !== void 0 && (n.clearcoat = this.clearcoat), this.clearcoatRoughness !== void 0 && (n.clearcoatRoughness = this.clearcoatRoughness), this.clearcoatMap && this.clearcoatMap.isTexture && (n.clearcoatMap = this.clearcoatMap.toJSON(e).uuid), this.clearcoatRoughnessMap && this.clearcoatRoughnessMap.isTexture && (n.clearcoatRoughnessMap = this.clearcoatRoughnessMap.toJSON(e).uuid), this.clearcoatNormalMap && this.clearcoatNormalMap.isTexture && (n.clearcoatNormalMap = this.clearcoatNormalMap.toJSON(e).uuid, n.clearcoatNormalScale = this.clearcoatNormalScale.toArray()), this.sheenColorMap && this.sheenColorMap.isTexture && (n.sheenColorMap = this.sheenColorMap.toJSON(e).uuid), this.sheenRoughnessMap && this.sheenRoughnessMap.isTexture && (n.sheenRoughnessMap = this.sheenRoughnessMap.toJSON(e).uuid), this.dispersion !== void 0 && (n.dispersion = this.dispersion), this.retroreflectivity !== void 0 && (n.retroreflectivity = this.retroreflectivity), this.iridescence !== void 0 && (n.iridescence = this.iridescence), this.iridescenceIOR !== void 0 && (n.iridescenceIOR = this.iridescenceIOR), this.iridescenceThicknessRange !== void 0 && (n.iridescenceThicknessRange = this.iridescenceThicknessRange), this.iridescenceMap && this.iridescenceMap.isTexture && (n.iridescenceMap = this.iridescenceMap.toJSON(e).uuid), this.iridescenceThicknessMap && this.iridescenceThicknessMap.isTexture && (n.iridescenceThicknessMap = this.iridescenceThicknessMap.toJSON(e).uuid), this.anisotropy !== void 0 && (n.anisotropy = this.anisotropy), this.anisotropyRotation !== void 0 && (n.anisotropyRotation = this.anisotropyRotation), this.anisotropyMap && this.anisotropyMap.isTexture && (n.anisotropyMap = this.anisotropyMap.toJSON(e).uuid), this.map && this.map.isTexture && (n.map = this.map.toJSON(e).uuid), this.matcap && this.matcap.isTexture && (n.matcap = this.matcap.toJSON(e).uuid), this.alphaMap && this.alphaMap.isTexture && (n.alphaMap = this.alphaMap.toJSON(e).uuid), this.lightMap && this.lightMap.isTexture && (n.lightMap = this.lightMap.toJSON(e).uuid, n.lightMapIntensity = this.lightMapIntensity), this.aoMap && this.aoMap.isTexture && (n.aoMap = this.aoMap.toJSON(e).uuid, n.aoMapIntensity = this.aoMapIntensity), this.bumpMap && this.bumpMap.isTexture && (n.bumpMap = this.bumpMap.toJSON(e).uuid, n.bumpScale = this.bumpScale), this.normalMap && this.normalMap.isTexture && (n.normalMap = this.normalMap.toJSON(e).uuid, n.normalMapType = this.normalMapType, n.normalScale = this.normalScale.toArray()), this.displacementMap && this.displacementMap.isTexture && (n.displacementMap = this.displacementMap.toJSON(e).uuid, n.displacementScale = this.displacementScale, n.displacementBias = this.displacementBias), this.roughnessMap && this.roughnessMap.isTexture && (n.roughnessMap = this.roughnessMap.toJSON(e).uuid), this.metalnessMap && this.metalnessMap.isTexture && (n.metalnessMap = this.metalnessMap.toJSON(e).uuid), this.emissiveMap && this.emissiveMap.isTexture && (n.emissiveMap = this.emissiveMap.toJSON(e).uuid), this.specularMap && this.specularMap.isTexture && (n.specularMap = this.specularMap.toJSON(e).uuid), this.specularIntensityMap && this.specularIntensityMap.isTexture && (n.specularIntensityMap = this.specularIntensityMap.toJSON(e).uuid), this.specularColorMap && this.specularColorMap.isTexture && (n.specularColorMap = this.specularColorMap.toJSON(e).uuid), this.envMap && this.envMap.isTexture && (n.envMap = this.envMap.toJSON(e).uuid, this.combine !== void 0 && (n.combine = this.combine)), this.envMapRotation !== void 0 && (n.envMapRotation = this.envMapRotation.toArray()), this.envMapIntensity !== void 0 && (n.envMapIntensity = this.envMapIntensity), this.reflectivity !== void 0 && (n.reflectivity = this.reflectivity), this.refractionRatio !== void 0 && (n.refractionRatio = this.refractionRatio), this.gradientMap && this.gradientMap.isTexture && (n.gradientMap = this.gradientMap.toJSON(e).uuid), this.transmission !== void 0 && (n.transmission = this.transmission), this.transmissionMap && this.transmissionMap.isTexture && (n.transmissionMap = this.transmissionMap.toJSON(e).uuid), this.thickness !== void 0 && (n.thickness = this.thickness), this.thicknessMap && this.thicknessMap.isTexture && (n.thicknessMap = this.thicknessMap.toJSON(e).uuid), this.attenuationDistance !== void 0 && (n.attenuationDistance = this.attenuationDistance), this.attenuationColor !== void 0 && (n.attenuationColor = this.attenuationColor.getHex()), this.size !== void 0 && (n.size = this.size), this.sizeAttenuation !== void 0 && (n.sizeAttenuation = this.sizeAttenuation), Array.isArray(this.clippingPlanes) && this.clippingPlanes.length > 0 && (n.clippingPlanes = this.clippingPlanes.map((e) => e.toJSON())), this.rotation !== void 0 && (n.rotation = this.rotation), this.depthPacking !== void 0 && (n.depthPacking = this.depthPacking), this.linewidth !== void 0 && (n.linewidth = this.linewidth), this.linecap !== void 0 && (n.linecap = this.linecap), this.linejoin !== void 0 && (n.linejoin = this.linejoin), this.dashSize !== void 0 && (n.dashSize = this.dashSize), this.gapSize !== void 0 && (n.gapSize = this.gapSize), this.scale !== void 0 && (n.scale = this.scale), this.wireframe !== void 0 && (n.wireframe = this.wireframe), this.wireframeLinewidth !== void 0 && (n.wireframeLinewidth = this.wireframeLinewidth), this.wireframeLinecap !== void 0 && (n.wireframeLinecap = this.wireframeLinecap), this.wireframeLinejoin !== void 0 && (n.wireframeLinejoin = this.wireframeLinejoin), this.flatShading !== void 0 && (n.flatShading = this.flatShading), this.fog !== void 0 && (n.fog = this.fog), Object.keys(this.userData).length > 0 && (n.userData = this.userData);
		function r(e) {
			let t = [];
			for (let n in e) {
				let r = e[n];
				delete r.metadata, t.push(r);
			}
			return t;
		}
		if (t) {
			let t = r(e.textures), i = r(e.images);
			t.length > 0 && (n.textures = t), i.length > 0 && (n.images = i);
		}
		return n;
	}
	fromJSON(e, t) {
		if (e.uuid !== void 0 && (this.uuid = e.uuid), e.name !== void 0 && (this.name = e.name), e.color !== void 0 && this.color !== void 0 && this.color.setHex(e.color), e.roughness !== void 0 && (this.roughness = e.roughness), e.metalness !== void 0 && (this.metalness = e.metalness), e.sheen !== void 0 && (this.sheen = e.sheen), e.sheenColor !== void 0 && (this.sheenColor = new Z().setHex(e.sheenColor)), e.sheenRoughness !== void 0 && (this.sheenRoughness = e.sheenRoughness), e.emissive !== void 0 && this.emissive !== void 0 && this.emissive.setHex(e.emissive), e.specular !== void 0 && this.specular !== void 0 && this.specular.setHex(e.specular), e.specularIntensity !== void 0 && (this.specularIntensity = e.specularIntensity), e.specularColor !== void 0 && this.specularColor !== void 0 && this.specularColor.setHex(e.specularColor), e.shininess !== void 0 && (this.shininess = e.shininess), e.clearcoat !== void 0 && (this.clearcoat = e.clearcoat), e.clearcoatRoughness !== void 0 && (this.clearcoatRoughness = e.clearcoatRoughness), e.dispersion !== void 0 && (this.dispersion = e.dispersion), e.retroreflectivity !== void 0 && (this.retroreflectivity = e.retroreflectivity), e.iridescence !== void 0 && (this.iridescence = e.iridescence), e.iridescenceIOR !== void 0 && (this.iridescenceIOR = e.iridescenceIOR), e.iridescenceThicknessRange !== void 0 && (this.iridescenceThicknessRange = e.iridescenceThicknessRange), e.transmission !== void 0 && (this.transmission = e.transmission), e.thickness !== void 0 && (this.thickness = e.thickness), e.attenuationDistance !== void 0 && (this.attenuationDistance = e.attenuationDistance), e.attenuationColor !== void 0 && this.attenuationColor !== void 0 && this.attenuationColor.setHex(e.attenuationColor), e.anisotropy !== void 0 && (this.anisotropy = e.anisotropy), e.anisotropyRotation !== void 0 && (this.anisotropyRotation = e.anisotropyRotation), e.fog !== void 0 && (this.fog = e.fog), e.flatShading !== void 0 && (this.flatShading = e.flatShading), e.blending !== void 0 && (this.blending = e.blending), e.combine !== void 0 && (this.combine = e.combine), e.side !== void 0 && (this.side = e.side), e.shadowSide !== void 0 && (this.shadowSide = e.shadowSide), e.opacity !== void 0 && (this.opacity = e.opacity), e.transparent !== void 0 && (this.transparent = e.transparent), e.alphaTest !== void 0 && (this.alphaTest = e.alphaTest), e.alphaHash !== void 0 && (this.alphaHash = e.alphaHash), e.depthFunc !== void 0 && (this.depthFunc = e.depthFunc), e.depthTest !== void 0 && (this.depthTest = e.depthTest), e.depthWrite !== void 0 && (this.depthWrite = e.depthWrite), e.colorWrite !== void 0 && (this.colorWrite = e.colorWrite), e.clippingPlanes !== void 0 && (this.clippingPlanes = e.clippingPlanes.map((e) => new Pu().fromJSON(e))), e.clipIntersection !== void 0 && (this.clipIntersection = e.clipIntersection), e.clipShadows !== void 0 && (this.clipShadows = e.clipShadows), e.depthPacking !== void 0 && (this.depthPacking = e.depthPacking), e.blendSrc !== void 0 && (this.blendSrc = e.blendSrc), e.blendDst !== void 0 && (this.blendDst = e.blendDst), e.blendEquation !== void 0 && (this.blendEquation = e.blendEquation), e.blendSrcAlpha !== void 0 && (this.blendSrcAlpha = e.blendSrcAlpha), e.blendDstAlpha !== void 0 && (this.blendDstAlpha = e.blendDstAlpha), e.blendEquationAlpha !== void 0 && (this.blendEquationAlpha = e.blendEquationAlpha), e.blendColor !== void 0 && this.blendColor !== void 0 && this.blendColor.setHex(e.blendColor), e.blendAlpha !== void 0 && (this.blendAlpha = e.blendAlpha), e.stencilWriteMask !== void 0 && (this.stencilWriteMask = e.stencilWriteMask), e.stencilFunc !== void 0 && (this.stencilFunc = e.stencilFunc), e.stencilRef !== void 0 && (this.stencilRef = e.stencilRef), e.stencilFuncMask !== void 0 && (this.stencilFuncMask = e.stencilFuncMask), e.stencilFail !== void 0 && (this.stencilFail = e.stencilFail), e.stencilZFail !== void 0 && (this.stencilZFail = e.stencilZFail), e.stencilZPass !== void 0 && (this.stencilZPass = e.stencilZPass), e.stencilWrite !== void 0 && (this.stencilWrite = e.stencilWrite), e.wireframe !== void 0 && (this.wireframe = e.wireframe), e.wireframeLinewidth !== void 0 && (this.wireframeLinewidth = e.wireframeLinewidth), e.wireframeLinecap !== void 0 && (this.wireframeLinecap = e.wireframeLinecap), e.wireframeLinejoin !== void 0 && (this.wireframeLinejoin = e.wireframeLinejoin), e.rotation !== void 0 && (this.rotation = e.rotation), e.linewidth !== void 0 && (this.linewidth = e.linewidth), e.linecap !== void 0 && (this.linecap = e.linecap), e.linejoin !== void 0 && (this.linejoin = e.linejoin), e.dashSize !== void 0 && (this.dashSize = e.dashSize), e.gapSize !== void 0 && (this.gapSize = e.gapSize), e.scale !== void 0 && (this.scale = e.scale), e.polygonOffset !== void 0 && (this.polygonOffset = e.polygonOffset), e.polygonOffsetFactor !== void 0 && (this.polygonOffsetFactor = e.polygonOffsetFactor), e.polygonOffsetUnits !== void 0 && (this.polygonOffsetUnits = e.polygonOffsetUnits), e.dithering !== void 0 && (this.dithering = e.dithering), e.alphaToCoverage !== void 0 && (this.alphaToCoverage = e.alphaToCoverage), e.premultipliedAlpha !== void 0 && (this.premultipliedAlpha = e.premultipliedAlpha), e.forceSinglePass !== void 0 && (this.forceSinglePass = e.forceSinglePass), e.allowOverride !== void 0 && (this.allowOverride = e.allowOverride), e.visible !== void 0 && (this.visible = e.visible), e.toneMapped !== void 0 && (this.toneMapped = e.toneMapped), e.userData !== void 0 && (this.userData = e.userData), e.vertexColors !== void 0 && (this.vertexColors = typeof e.vertexColors == "number" ? e.vertexColors > 0 : e.vertexColors), e.size !== void 0 && (this.size = e.size), e.sizeAttenuation !== void 0 && (this.sizeAttenuation = e.sizeAttenuation), e.map !== void 0 && (this.map = t[e.map] || null), e.matcap !== void 0 && (this.matcap = t[e.matcap] || null), e.alphaMap !== void 0 && (this.alphaMap = t[e.alphaMap] || null), e.bumpMap !== void 0 && (this.bumpMap = t[e.bumpMap] || null), e.bumpScale !== void 0 && (this.bumpScale = e.bumpScale), e.normalMap !== void 0 && (this.normalMap = t[e.normalMap] || null), e.normalMapType !== void 0 && (this.normalMapType = e.normalMapType), e.normalScale !== void 0) {
			let t = e.normalScale;
			Array.isArray(t) === !1 && (t = [t, t]), this.normalScale = new q().fromArray(t);
		}
		return e.displacementMap !== void 0 && (this.displacementMap = t[e.displacementMap] || null), e.displacementScale !== void 0 && (this.displacementScale = e.displacementScale), e.displacementBias !== void 0 && (this.displacementBias = e.displacementBias), e.roughnessMap !== void 0 && (this.roughnessMap = t[e.roughnessMap] || null), e.metalnessMap !== void 0 && (this.metalnessMap = t[e.metalnessMap] || null), e.emissiveMap !== void 0 && (this.emissiveMap = t[e.emissiveMap] || null), e.emissiveIntensity !== void 0 && (this.emissiveIntensity = e.emissiveIntensity), e.specularMap !== void 0 && (this.specularMap = t[e.specularMap] || null), e.specularIntensityMap !== void 0 && (this.specularIntensityMap = t[e.specularIntensityMap] || null), e.specularColorMap !== void 0 && (this.specularColorMap = t[e.specularColorMap] || null), e.envMap !== void 0 && (this.envMap = t[e.envMap] || null), e.envMapRotation !== void 0 && this.envMapRotation.fromArray(e.envMapRotation), e.envMapIntensity !== void 0 && (this.envMapIntensity = e.envMapIntensity), e.reflectivity !== void 0 && (this.reflectivity = e.reflectivity), e.refractionRatio !== void 0 && (this.refractionRatio = e.refractionRatio), e.lightMap !== void 0 && (this.lightMap = t[e.lightMap] || null), e.lightMapIntensity !== void 0 && (this.lightMapIntensity = e.lightMapIntensity), e.aoMap !== void 0 && (this.aoMap = t[e.aoMap] || null), e.aoMapIntensity !== void 0 && (this.aoMapIntensity = e.aoMapIntensity), e.gradientMap !== void 0 && (this.gradientMap = t[e.gradientMap] || null), e.clearcoatMap !== void 0 && (this.clearcoatMap = t[e.clearcoatMap] || null), e.clearcoatRoughnessMap !== void 0 && (this.clearcoatRoughnessMap = t[e.clearcoatRoughnessMap] || null), e.clearcoatNormalMap !== void 0 && (this.clearcoatNormalMap = t[e.clearcoatNormalMap] || null), e.clearcoatNormalScale !== void 0 && (this.clearcoatNormalScale = new q().fromArray(e.clearcoatNormalScale)), e.iridescenceMap !== void 0 && (this.iridescenceMap = t[e.iridescenceMap] || null), e.iridescenceThicknessMap !== void 0 && (this.iridescenceThicknessMap = t[e.iridescenceThicknessMap] || null), e.transmissionMap !== void 0 && (this.transmissionMap = t[e.transmissionMap] || null), e.thicknessMap !== void 0 && (this.thicknessMap = t[e.thicknessMap] || null), e.anisotropyMap !== void 0 && (this.anisotropyMap = t[e.anisotropyMap] || null), e.sheenColorMap !== void 0 && (this.sheenColorMap = t[e.sheenColorMap] || null), e.sheenRoughnessMap !== void 0 && (this.sheenRoughnessMap = t[e.sheenRoughnessMap] || null), this;
	}
	clone() {
		return new this.constructor().copy(this);
	}
	copy(e) {
		this.name = e.name, this.blending = e.blending, this.side = e.side, this.vertexColors = e.vertexColors, this.opacity = e.opacity, this.transparent = e.transparent, this.blendSrc = e.blendSrc, this.blendDst = e.blendDst, this.blendEquation = e.blendEquation, this.blendSrcAlpha = e.blendSrcAlpha, this.blendDstAlpha = e.blendDstAlpha, this.blendEquationAlpha = e.blendEquationAlpha, this.blendColor.copy(e.blendColor), this.blendAlpha = e.blendAlpha, this.depthFunc = e.depthFunc, this.depthTest = e.depthTest, this.depthWrite = e.depthWrite, this.stencilWriteMask = e.stencilWriteMask, this.stencilFunc = e.stencilFunc, this.stencilRef = e.stencilRef, this.stencilFuncMask = e.stencilFuncMask, this.stencilFail = e.stencilFail, this.stencilZFail = e.stencilZFail, this.stencilZPass = e.stencilZPass, this.stencilWrite = e.stencilWrite;
		let t = e.clippingPlanes, n = null;
		if (t !== null) {
			let e = t.length;
			n = Array(e);
			for (let r = 0; r !== e; ++r) n[r] = t[r].clone();
		}
		return this.clippingPlanes = n, this.clipIntersection = e.clipIntersection, this.clipShadows = e.clipShadows, this.shadowSide = e.shadowSide, this.colorWrite = e.colorWrite, this.precision = e.precision, this.polygonOffset = e.polygonOffset, this.polygonOffsetFactor = e.polygonOffsetFactor, this.polygonOffsetUnits = e.polygonOffsetUnits, this.dithering = e.dithering, this.alphaTest = e.alphaTest, this.alphaHash = e.alphaHash, this.alphaToCoverage = e.alphaToCoverage, this.premultipliedAlpha = e.premultipliedAlpha, this.forceSinglePass = e.forceSinglePass, this.allowOverride = e.allowOverride, this.visible = e.visible, this.toneMapped = e.toneMapped, this.userData = JSON.parse(JSON.stringify(e.userData)), this;
	}
	dispose() {
		this.dispatchEvent({ type: "dispose" });
	}
	set needsUpdate(e) {
		e === !0 && this.version++;
	}
}, Lu = /*@__PURE__*/ new J(), Ru = /*@__PURE__*/ new J(), zu = /*@__PURE__*/ new J(), Bu = /*@__PURE__*/ new J(), Vu = class {
	constructor(e = new J(), t = new J(0, 0, -1)) {
		this.origin = e, this.direction = t;
	}
	set(e, t) {
		return this.origin.copy(e), this.direction.copy(t), this;
	}
	copy(e) {
		return this.origin.copy(e.origin), this.direction.copy(e.direction), this;
	}
	at(e, t) {
		return t.copy(this.origin).addScaledVector(this.direction, e);
	}
	lookAt(e) {
		return this.direction.copy(e).sub(this.origin).normalize(), this;
	}
	recast(e) {
		return this.origin.copy(this.at(e, Lu)), this;
	}
	closestPointToPoint(e, t) {
		t.subVectors(e, this.origin);
		let n = t.dot(this.direction);
		return n < 0 ? t.copy(this.origin) : t.copy(this.origin).addScaledVector(this.direction, n);
	}
	distanceToPoint(e) {
		return Math.sqrt(this.distanceSqToPoint(e));
	}
	distanceSqToPoint(e) {
		let t = Lu.subVectors(e, this.origin).dot(this.direction);
		return t < 0 ? this.origin.distanceToSquared(e) : (Lu.copy(this.origin).addScaledVector(this.direction, t), Lu.distanceToSquared(e));
	}
	distanceSqToSegment(e, t, n, r) {
		Ru.copy(e).add(t).multiplyScalar(.5), zu.copy(t).sub(e).normalize(), Bu.copy(this.origin).sub(Ru);
		let i = e.distanceTo(t) * .5, a = -this.direction.dot(zu), o = Bu.dot(this.direction), s = -Bu.dot(zu), c = Bu.lengthSq(), l = Math.abs(1 - a * a), u, d, f, p;
		if (l > 0) {
			if (u = a * s - o, d = a * o - s, p = i * l, u >= 0) {
				if (d >= -p) {
					if (d <= p) {
						let e = 1 / l;
						u *= e, d *= e, f = u * (u + a * d + 2 * o) + d * (a * u + d + 2 * s) + c;
					} else d = i, u = Math.max(0, -(a * d + o)), f = -u * u + d * (d + 2 * s) + c;
				} else d = -i, u = Math.max(0, -(a * d + o)), f = -u * u + d * (d + 2 * s) + c;
			} else d <= -p ? (u = Math.max(0, -(-a * i + o)), d = u > 0 ? -i : Math.min(Math.max(-i, -s), i), f = -u * u + d * (d + 2 * s) + c) : d <= p ? (u = 0, d = Math.min(Math.max(-i, -s), i), f = d * (d + 2 * s) + c) : (u = Math.max(0, -(a * i + o)), d = u > 0 ? i : Math.min(Math.max(-i, -s), i), f = -u * u + d * (d + 2 * s) + c);
		} else d = a > 0 ? -i : i, u = Math.max(0, -(a * d + o)), f = -u * u + d * (d + 2 * s) + c;
		return n && n.copy(this.origin).addScaledVector(this.direction, u), r && r.copy(Ru).addScaledVector(zu, d), f;
	}
	intersectSphere(e, t) {
		if (e.radius < 0) return null;
		Lu.subVectors(e.center, this.origin);
		let n = Lu.dot(this.direction), r = Lu.dot(Lu) - n * n, i = e.radius * e.radius;
		if (r > i) return null;
		let a = Math.sqrt(i - r), o = n - a, s = n + a;
		return s < 0 ? null : o < 0 ? this.at(s, t) : this.at(o, t);
	}
	intersectsSphere(e) {
		return e.radius < 0 ? !1 : this.distanceSqToPoint(e.center) <= e.radius * e.radius;
	}
	distanceToPlane(e) {
		let t = e.normal.dot(this.direction);
		if (t === 0) return e.distanceToPoint(this.origin) === 0 ? 0 : null;
		let n = -(this.origin.dot(e.normal) + e.constant) / t;
		return n >= 0 ? n : null;
	}
	intersectPlane(e, t) {
		let n = this.distanceToPlane(e);
		return n === null ? null : this.at(n, t);
	}
	intersectsPlane(e) {
		let t = e.distanceToPoint(this.origin);
		return t === 0 || e.normal.dot(this.direction) * t < 0;
	}
	intersectBox(e, t) {
		let n, r, i, a, o, s, c = 1 / this.direction.x, l = 1 / this.direction.y, u = 1 / this.direction.z, d = this.origin;
		return c >= 0 ? (n = (e.min.x - d.x) * c, r = (e.max.x - d.x) * c) : (n = (e.max.x - d.x) * c, r = (e.min.x - d.x) * c), l >= 0 ? (i = (e.min.y - d.y) * l, a = (e.max.y - d.y) * l) : (i = (e.max.y - d.y) * l, a = (e.min.y - d.y) * l), n > a || i > r || ((i > n || isNaN(n)) && (n = i), (a < r || isNaN(r)) && (r = a), u >= 0 ? (o = (e.min.z - d.z) * u, s = (e.max.z - d.z) * u) : (o = (e.max.z - d.z) * u, s = (e.min.z - d.z) * u), n > s || o > r) || ((o > n || n !== n) && (n = o), (s < r || r !== r) && (r = s), r < 0) ? null : this.at(n >= 0 ? n : r, t);
	}
	intersectsBox(e) {
		return this.intersectBox(e, Lu) !== null;
	}
	intersectTriangle(e, t, n, r, i) {
		let a = this.origin, o = this.direction, s = o.x, c = o.y, l = o.z, u = e.x - a.x, d = e.y - a.y, f = e.z - a.z, p = t.x - a.x, m = t.y - a.y, h = t.z - a.z, g = n.x - a.x, _ = n.y - a.y, v = n.z - a.z, y = Math.abs(s), b = Math.abs(c), x = Math.abs(l), S, C, w, T, E, D, O, k, A, j, ee, M;
		if (y >= b && y >= x ? (w = s, D = u, A = p, M = g, s >= 0 ? (S = c, C = l, T = d, E = f, O = m, k = h, j = _, ee = v) : (S = l, C = c, T = f, E = d, O = h, k = m, j = v, ee = _)) : b >= x ? (w = c, D = d, A = m, M = _, c >= 0 ? (S = l, C = s, T = f, E = u, O = h, k = p, j = v, ee = g) : (S = s, C = l, T = u, E = f, O = p, k = h, j = g, ee = v)) : (w = l, D = f, A = h, M = v, l >= 0 ? (S = s, C = c, T = u, E = d, O = p, k = m, j = g, ee = _) : (S = c, C = s, T = d, E = u, O = m, k = p, j = _, ee = g)), w === 0) return null;
		let te = S / w, ne = C / w, N = 1 / w, re = T - te * D, ie = E - ne * D, ae = O - te * A, oe = k - ne * A, P = j - te * M, F = ee - ne * M, I = P * oe - F * ae, se = re * F - ie * P, ce = ae * ie - oe * re;
		if (r) {
			if (I < 0 || se < 0 || ce < 0) return null;
		} else if ((I < 0 || se < 0 || ce < 0) && (I > 0 || se > 0 || ce > 0)) return null;
		let le = I + se + ce;
		if (le === 0) return null;
		let ue = N * (I * D + se * A + ce * M);
		return (le > 0 ? ue < 0 : ue > 0) ? null : this.at(ue / le, i);
	}
	applyMatrix4(e) {
		return this.origin.applyMatrix4(e), this.direction.transformDirection(e), this;
	}
	equals(e) {
		return e.origin.equals(this.origin) && e.direction.equals(this.direction);
	}
	clone() {
		return new this.constructor().copy(this);
	}
}, Hu = class extends Iu {
	constructor(e) {
		super(), this.isMeshBasicMaterial = !0, this.type = "MeshBasicMaterial", this.color = new Z(16777215), this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.specularMap = null, this.alphaMap = null, this.envMap = null, this.envMapRotation = new ul(), this.combine = 0, this.reflectivity = 1, this.refractionRatio = .98, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.fog = !0, this.setValues(e);
	}
	copy(e) {
		return super.copy(e), this.color.copy(e.color), this.map = e.map, this.lightMap = e.lightMap, this.lightMapIntensity = e.lightMapIntensity, this.aoMap = e.aoMap, this.aoMapIntensity = e.aoMapIntensity, this.specularMap = e.specularMap, this.alphaMap = e.alphaMap, this.envMap = e.envMap, this.envMapRotation.copy(e.envMapRotation), this.combine = e.combine, this.reflectivity = e.reflectivity, this.refractionRatio = e.refractionRatio, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.wireframeLinecap = e.wireframeLinecap, this.wireframeLinejoin = e.wireframeLinejoin, this.fog = e.fog, this;
	}
}, Uu = /*@__PURE__*/ new el(), Wu = /*@__PURE__*/ new Vu(), Gu = /*@__PURE__*/ new Su(), Ku = /*@__PURE__*/ new J(), qu = /*@__PURE__*/ new J(), Ju = /*@__PURE__*/ new J(), Yu = /*@__PURE__*/ new J(), Xu = /*@__PURE__*/ new J(), Zu = /*@__PURE__*/ new J(), Qu = /*@__PURE__*/ new J(), $u = /*@__PURE__*/ new J(), ed = class extends Dl {
	constructor(e = new Au(), t = new Hu()) {
		super(), this.isMesh = !0, this.type = "Mesh", this.geometry = e, this.material = t, this.morphTargetDictionary = void 0, this.morphTargetInfluences = void 0, this.count = 1, this.updateMorphTargets();
	}
	copy(e, t) {
		return super.copy(e, t), e.morphTargetInfluences !== void 0 && (this.morphTargetInfluences = e.morphTargetInfluences.slice()), e.morphTargetDictionary !== void 0 && (this.morphTargetDictionary = Object.assign({}, e.morphTargetDictionary)), this.material = Array.isArray(e.material) ? e.material.slice() : e.material, this.geometry = e.geometry, this;
	}
	updateMorphTargets() {
		let e = this.geometry.morphAttributes, t = Object.keys(e);
		if (t.length > 0) {
			let n = e[t[0]];
			if (n !== void 0) {
				this.morphTargetInfluences = [], this.morphTargetDictionary = {};
				for (let e = 0, t = n.length; e < t; e++) {
					let t = n[e].name || String(e);
					this.morphTargetInfluences.push(0), this.morphTargetDictionary[t] = e;
				}
			}
		}
	}
	getVertexPosition(e, t) {
		let n = this.geometry, r = n.attributes.position, i = n.morphAttributes.position, a = n.morphTargetsRelative;
		t.fromBufferAttribute(r, e);
		let o = this.morphTargetInfluences;
		if (i && o) {
			Zu.set(0, 0, 0);
			for (let n = 0, r = i.length; n < r; n++) {
				let r = o[n], s = i[n];
				r !== 0 && (Xu.fromBufferAttribute(s, e), a ? Zu.addScaledVector(Xu, r) : Zu.addScaledVector(Xu.sub(t), r));
			}
			t.add(Zu);
		}
		return t;
	}
	intersectsFrustum(e) {
		return e.intersectsObject(this);
	}
	raycast(e, t) {
		let n = this.geometry, r = this.material, i = this.matrixWorld;
		r !== void 0 && (n.boundingSphere === null && n.computeBoundingSphere(), Gu.copy(n.boundingSphere), Gu.applyMatrix4(i), Wu.copy(e.ray).recast(e.near), !(Gu.containsPoint(Wu.origin) === !1 && (Wu.intersectSphere(Gu, Ku) === null || Wu.origin.distanceToSquared(Ku) > (e.far - e.near) ** 2)) && (Uu.copy(i).invert(), Wu.copy(e.ray).applyMatrix4(Uu), (n.boundingBox === null || Wu.intersectsBox(n.boundingBox) !== !1) && this._computeIntersections(e, t, Wu)));
	}
	_computeIntersections(e, t, n) {
		let r, i = this.geometry, a = this.material, o = i.index, s = i.attributes.position, c = i.attributes.uv, l = i.attributes.uv1, u = i.attributes.normal, d = i.groups, f = i.drawRange;
		if (o !== null) {
			if (Array.isArray(a)) for (let i = 0, s = d.length; i < s; i++) {
				let s = d[i], p = a[s.materialIndex], m = Math.max(s.start, f.start), h = Math.min(o.count, Math.min(s.start + s.count, f.start + f.count));
				for (let i = m, a = h; i < a; i += 3) {
					let a = o.getX(i), d = o.getX(i + 1), f = o.getX(i + 2);
					r = nd(this, p, e, n, c, l, u, a, d, f), r && (r.faceIndex = Math.floor(i / 3), r.face.materialIndex = s.materialIndex, t.push(r));
				}
			}
			else {
				let i = Math.max(0, f.start), s = Math.min(o.count, f.start + f.count);
				for (let d = i, f = s; d < f; d += 3) {
					let i = o.getX(d), s = o.getX(d + 1), f = o.getX(d + 2);
					r = nd(this, a, e, n, c, l, u, i, s, f), r && (r.faceIndex = Math.floor(d / 3), t.push(r));
				}
			}
		} else if (s !== void 0) {
			if (Array.isArray(a)) for (let i = 0, o = d.length; i < o; i++) {
				let o = d[i], p = a[o.materialIndex], m = Math.max(o.start, f.start), h = Math.min(s.count, Math.min(o.start + o.count, f.start + f.count));
				for (let i = m, a = h; i < a; i += 3) {
					let a = i, s = i + 1, d = i + 2;
					r = nd(this, p, e, n, c, l, u, a, s, d), r && (r.faceIndex = Math.floor(i / 3), r.face.materialIndex = o.materialIndex, t.push(r));
				}
			}
			else {
				let i = Math.max(0, f.start), o = Math.min(s.count, f.start + f.count);
				for (let s = i, d = o; s < d; s += 3) {
					let i = s, o = s + 1, d = s + 2;
					r = nd(this, a, e, n, c, l, u, i, o, d), r && (r.faceIndex = Math.floor(s / 3), t.push(r));
				}
			}
		}
	}
};
function td(e, t, n, r, i, a, o, s) {
	let c;
	if (c = t.side === 1 ? r.intersectTriangle(o, a, i, !0, s) : r.intersectTriangle(i, a, o, t.side === 0, s), c === null) return null;
	$u.copy(s), $u.applyMatrix4(e.matrixWorld);
	let l = n.ray.origin.distanceTo($u);
	return l < n.near || l > n.far ? null : {
		distance: l,
		point: $u.clone(),
		object: e
	};
}
function nd(e, t, n, r, i, a, o, s, c, l) {
	e.getVertexPosition(s, qu), e.getVertexPosition(c, Ju), e.getVertexPosition(l, Yu);
	let u = td(e, t, n, r, qu, Ju, Yu, Qu);
	if (u) {
		let e = new J();
		Xl.getBarycoord(Qu, qu, Ju, Yu, e), i && (u.uv = Xl.getInterpolatedAttribute(i, s, c, l, e, new q())), a && (u.uv1 = Xl.getInterpolatedAttribute(a, s, c, l, e, new q())), o && (u.normal = Xl.getInterpolatedAttribute(o, s, c, l, e, new J()), u.normal.dot(r.direction) > 0 && u.normal.multiplyScalar(-1));
		let t = {
			a: s,
			b: c,
			c: l,
			normal: new J(),
			materialIndex: 0
		};
		Xl.getNormal(qu, Ju, Yu, t.normal), u.face = t, u.barycoord = e;
	}
	return u;
}
var rd = class extends Jc {
	constructor(e = null, t = 1, n = 1, r, i, a, o, s, c = Bo, l = Bo, u, d) {
		super(null, a, o, s, c, l, r, i, u, d), this.isDataTexture = !0, this.image = {
			data: e,
			width: t,
			height: n
		}, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1;
	}
}, id = class extends hu {
	constructor(e, t, n, r = 1) {
		super(e, t, n), this.isInstancedBufferAttribute = !0, this.meshPerAttribute = r;
	}
	copy(e) {
		return super.copy(e), this.meshPerAttribute = e.meshPerAttribute, this;
	}
	toJSON() {
		let e = super.toJSON();
		return e.meshPerAttribute = this.meshPerAttribute, e.isInstancedBufferAttribute = !0, e;
	}
}, ad = /*@__PURE__*/ new el(), od = /*@__PURE__*/ new el(), sd = [], cd = /*@__PURE__*/ new Zl(), ld = /*@__PURE__*/ new el(), ud = /*@__PURE__*/ new ed(), dd = /*@__PURE__*/ new Su(), fd = class extends ed {
	constructor(e, t, n) {
		super(e, t), this.isInstancedMesh = !0, this.instanceMatrix = new id(new Float32Array(n * 16), 16), this.instanceColor = null, this.morphTexture = null, this.count = n, this.boundingBox = null, this.boundingSphere = null;
		for (let e = 0; e < n; e++) this.setMatrixAt(e, ld);
	}
	computeBoundingBox() {
		let e = this.geometry, t = this.count;
		this.boundingBox === null && (this.boundingBox = new Zl()), e.boundingBox === null && e.computeBoundingBox(), this.boundingBox.makeEmpty();
		for (let n = 0; n < t; n++) this.getMatrixAt(n, ad), cd.copy(e.boundingBox).applyMatrix4(ad), this.boundingBox.union(cd);
	}
	computeBoundingSphere() {
		let e = this.geometry, t = this.count;
		this.boundingSphere === null && (this.boundingSphere = new Su()), e.boundingSphere === null && e.computeBoundingSphere(), this.boundingSphere.makeEmpty();
		for (let n = 0; n < t; n++) this.getMatrixAt(n, ad), dd.copy(e.boundingSphere).applyMatrix4(ad), this.boundingSphere.union(dd);
	}
	copy(e, t) {
		return super.copy(e, t), this.instanceMatrix.copy(e.instanceMatrix), e.morphTexture !== null && (this.morphTexture = e.morphTexture.clone()), e.instanceColor !== null && (this.instanceColor = e.instanceColor.clone()), this.count = e.count, e.boundingBox !== null && (this.boundingBox = e.boundingBox.clone()), e.boundingSphere !== null && (this.boundingSphere = e.boundingSphere.clone()), this;
	}
	getColorAt(e, t) {
		return this.instanceColor === null ? t.setRGB(1, 1, 1) : t.fromArray(this.instanceColor.array, e * 3);
	}
	getMatrixAt(e, t) {
		return t.fromArray(this.instanceMatrix.array, e * 16);
	}
	getMorphAt(e, t) {
		let n = t.morphTargetInfluences, r = this.morphTexture.source.data.data, i = e * (n.length + 1) + 1;
		for (let e = 0; e < n.length; e++) n[e] = r[i + e];
	}
	raycast(e, t) {
		let n = this.matrixWorld, r = this.count;
		if (ud.geometry = this.geometry, ud.material = this.material, ud.material !== void 0 && (this.boundingSphere === null && this.computeBoundingSphere(), dd.copy(this.boundingSphere), dd.applyMatrix4(n), e.ray.intersectsSphere(dd) !== !1)) for (let i = 0; i < r; i++) {
			this.getMatrixAt(i, ad), od.multiplyMatrices(n, ad), ud.matrixWorld = od, ud.raycast(e, sd);
			for (let e = 0, n = sd.length; e < n; e++) {
				let n = sd[e];
				n.instanceId = i, n.object = this, t.push(n);
			}
			sd.length = 0;
		}
	}
	setColorAt(e, t) {
		return this.instanceColor === null && (this.instanceColor = new id(new Float32Array(this.instanceMatrix.count * 3).fill(1), 3)), t.toArray(this.instanceColor.array, e * 3), this;
	}
	setMatrixAt(e, t) {
		return t.toArray(this.instanceMatrix.array, e * 16), this;
	}
	setMorphAt(e, t) {
		let n = t.morphTargetInfluences, r = n.length + 1;
		this.morphTexture === null && (this.morphTexture = new rd(new Float32Array(r * this.count), r, this.count, us, Qo));
		let i = this.morphTexture.source.data.data, a = 0;
		for (let e = 0; e < n.length; e++) a += n[e];
		let o = this.geometry.morphTargetsRelative ? 1 : 1 - a, s = r * e;
		return i[s] = o, i.set(n, s + 1), this;
	}
	updateMorphTargets() {}
	dispose() {
		super.dispose(), this.morphTexture !== null && (this.morphTexture.dispose(), this.morphTexture = null);
	}
}, pd = /*@__PURE__*/ new Su(), md = /*@__PURE__*/ new q(.5, .5), hd = /*@__PURE__*/ new J(), gd = class {
	constructor(e = new Pu(), t = new Pu(), n = new Pu(), r = new Pu(), i = new Pu(), a = new Pu()) {
		this.planes = [
			e,
			t,
			n,
			r,
			i,
			a
		];
	}
	set(e, t, n, r, i, a) {
		let o = this.planes;
		return o[0].copy(e), o[1].copy(t), o[2].copy(n), o[3].copy(r), o[4].copy(i), o[5].copy(a), this;
	}
	copy(e) {
		let t = this.planes;
		for (let n = 0; n < 6; n++) t[n].copy(e.planes[n]);
		return this;
	}
	setFromProjectionMatrix(e, t = fc, n = !1) {
		let r = this.planes, i = e.elements, a = i[0], o = i[1], s = i[2], c = i[3], l = i[4], u = i[5], d = i[6], f = i[7], p = i[8], m = i[9], h = i[10], g = i[11], _ = i[12], v = i[13], y = i[14], b = i[15];
		if (r[0].setComponents(c - a, f - l, g - p, b - _).normalize(), r[1].setComponents(c + a, f + l, g + p, b + _).normalize(), r[2].setComponents(c + o, f + u, g + m, b + v).normalize(), r[3].setComponents(c - o, f - u, g - m, b - v).normalize(), n) r[4].setComponents(s, d, h, y).normalize(), r[5].setComponents(c - s, f - d, g - h, b - y).normalize();
		else if (r[4].setComponents(c - s, f - d, g - h, b - y).normalize(), t === 2e3) r[5].setComponents(c + s, f + d, g + h, b + y).normalize();
		else if (t === 2001) r[5].setComponents(s, d, h, y).normalize();
		else throw Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: " + t);
		return this;
	}
	intersectsObject(e) {
		if (e.boundingSphere !== void 0) e.boundingSphere === null && e.computeBoundingSphere(), pd.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);
		else {
			let t = e.geometry;
			t.boundingSphere === null && t.computeBoundingSphere(), pd.copy(t.boundingSphere).applyMatrix4(e.matrixWorld);
		}
		return this.intersectsSphere(pd);
	}
	intersectsSprite(e) {
		return pd.center.set(0, 0, 0), pd.radius = .7071067811865476 + md.distanceTo(e.center), pd.applyMatrix4(e.matrixWorld), this.intersectsSphere(pd);
	}
	intersectsSphere(e) {
		let t = this.planes, n = e.center, r = -e.radius;
		for (let e = 0; e < 6; e++) if (t[e].distanceToPoint(n) < r) return !1;
		return !0;
	}
	intersectsBox(e) {
		let t = this.planes;
		for (let n = 0; n < 6; n++) {
			let r = t[n];
			if (hd.x = r.normal.x > 0 ? e.max.x : e.min.x, hd.y = r.normal.y > 0 ? e.max.y : e.min.y, hd.z = r.normal.z > 0 ? e.max.z : e.min.z, r.distanceToPoint(hd) < 0) return !1;
		}
		return !0;
	}
	containsPoint(e) {
		let t = this.planes;
		for (let n = 0; n < 6; n++) if (t[n].distanceToPoint(e) < 0) return !1;
		return !0;
	}
	clone() {
		return new this.constructor().copy(this);
	}
}, _d = class extends Iu {
	constructor(e) {
		super(), this.isLineBasicMaterial = !0, this.type = "LineBasicMaterial", this.color = new Z(16777215), this.map = null, this.linewidth = 1, this.linecap = "round", this.linejoin = "round", this.fog = !0, this.setValues(e);
	}
	copy(e) {
		return super.copy(e), this.color.copy(e.color), this.map = e.map, this.linewidth = e.linewidth, this.linecap = e.linecap, this.linejoin = e.linejoin, this.fog = e.fog, this;
	}
}, vd = /*@__PURE__*/ new J(), yd = /*@__PURE__*/ new J(), bd = /*@__PURE__*/ new el(), xd = /*@__PURE__*/ new Vu(), Sd = /*@__PURE__*/ new Su(), Cd = /*@__PURE__*/ new J(), wd = /*@__PURE__*/ new J(), Td = class extends Dl {
	constructor(e = new Au(), t = new _d()) {
		super(), this.isLine = !0, this.type = "Line", this.geometry = e, this.material = t, this.morphTargetDictionary = void 0, this.morphTargetInfluences = void 0, this.updateMorphTargets();
	}
	copy(e, t) {
		return super.copy(e, t), this.material = Array.isArray(e.material) ? e.material.slice() : e.material, this.geometry = e.geometry, this;
	}
	computeLineDistances() {
		let e = this.geometry;
		if (e.index === null) {
			let t = e.attributes.position, n = [0];
			for (let e = 1, r = t.count; e < r; e++) vd.fromBufferAttribute(t, e - 1), yd.fromBufferAttribute(t, e), n[e] = n[e - 1], n[e] += vd.distanceTo(yd);
			e.setAttribute("lineDistance", new vu(n, 1));
		} else W("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");
		return this;
	}
	intersectsFrustum(e) {
		return e.intersectsObject(this);
	}
	raycast(e, t) {
		let n = this.geometry, r = this.matrixWorld, i = e.params.Line.threshold, a = n.drawRange;
		if (n.boundingSphere === null && n.computeBoundingSphere(), Sd.copy(n.boundingSphere), Sd.applyMatrix4(r), Sd.radius += i, e.ray.intersectsSphere(Sd) === !1) return;
		bd.copy(r).invert(), xd.copy(e.ray).applyMatrix4(bd);
		let o = i / ((this.scale.x + this.scale.y + this.scale.z) / 3), s = o * o, c = this.isLineSegments ? 2 : 1, l = n.index, u = n.attributes.position;
		if (l !== null) {
			let n = Math.max(0, a.start), r = Math.min(l.count, a.start + a.count);
			for (let i = n, a = r - 1; i < a; i += c) {
				let n = l.getX(i), r = l.getX(i + 1), a = Ed(this, e, xd, s, n, r, i);
				a && t.push(a);
			}
			if (this.isLineLoop) {
				let i = l.getX(r - 1), a = l.getX(n), o = Ed(this, e, xd, s, i, a, r - 1);
				o && t.push(o);
			}
		} else {
			let n = Math.max(0, a.start), r = Math.min(u.count, a.start + a.count);
			for (let i = n, a = r - 1; i < a; i += c) {
				let n = Ed(this, e, xd, s, i, i + 1, i);
				n && t.push(n);
			}
			if (this.isLineLoop) {
				let i = Ed(this, e, xd, s, r - 1, n, r - 1);
				i && t.push(i);
			}
		}
	}
	updateMorphTargets() {
		let e = this.geometry.morphAttributes, t = Object.keys(e);
		if (t.length > 0) {
			let n = e[t[0]];
			if (n !== void 0) {
				this.morphTargetInfluences = [], this.morphTargetDictionary = {};
				for (let e = 0, t = n.length; e < t; e++) {
					let t = n[e].name || String(e);
					this.morphTargetInfluences.push(0), this.morphTargetDictionary[t] = e;
				}
			}
		}
	}
};
function Ed(e, t, n, r, i, a, o) {
	let s = e.geometry.attributes.position;
	if (vd.fromBufferAttribute(s, i), yd.fromBufferAttribute(s, a), n.distanceSqToSegment(vd, yd, Cd, wd) > r) return;
	Cd.applyMatrix4(e.matrixWorld);
	let c = t.ray.origin.distanceTo(Cd);
	if (!(c < t.near || c > t.far)) return {
		distance: c,
		point: wd.clone().applyMatrix4(e.matrixWorld),
		index: o,
		face: null,
		faceIndex: null,
		barycoord: null,
		object: e
	};
}
var Dd = /*@__PURE__*/ new J(), Od = /*@__PURE__*/ new J(), kd = class extends Td {
	constructor(e, t) {
		super(e, t), this.isLineSegments = !0, this.type = "LineSegments";
	}
	computeLineDistances() {
		let e = this.geometry;
		if (e.index === null) {
			let t = e.attributes.position, n = [];
			for (let e = 0, r = t.count; e < r; e += 2) Dd.fromBufferAttribute(t, e), Od.fromBufferAttribute(t, e + 1), n[e] = e === 0 ? 0 : n[e - 1], n[e + 1] = n[e] + Dd.distanceTo(Od);
			e.setAttribute("lineDistance", new vu(n, 1));
		} else W("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");
		return this;
	}
}, Ad = class extends Jc {
	constructor(e = [], t = 301, n, r, i, a, o, s, c, l) {
		super(e, t, n, r, i, a, o, s, c, l), this.isCubeTexture = !0, this.flipY = !1;
	}
	get images() {
		return this.image;
	}
	set images(e) {
		this.image = e;
	}
}, jd = class extends Jc {
	constructor(e, t, n = Zo, r, i, a, o = Bo, s = Bo, c, l = cs, u = 1) {
		if (l !== 1026 && l !== 1027) throw Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");
		super({
			width: e,
			height: t,
			depth: u
		}, r, i, a, o, s, l, n, c), this.isDepthTexture = !0, this.flipY = !1, this.generateMipmaps = !1, this.compareFunction = null;
	}
	copy(e) {
		return super.copy(e), this.source = new Wc(Object.assign({}, e.image)), this.compareFunction = e.compareFunction, this;
	}
	toJSON(e) {
		let t = super.toJSON(e);
		return t.compareFunction = this.compareFunction, t;
	}
}, Md = class extends jd {
	constructor(e, t = Zo, n = 301, r, i, a = Bo, o = Bo, s, c = cs) {
		let l = {
			width: e,
			height: e,
			depth: 1
		}, u = [
			l,
			l,
			l,
			l,
			l,
			l
		];
		super(e, e, t, n, r, i, a, o, s, c), this.image = u, this.isCubeDepthTexture = !0, this.isCubeTexture = !0;
	}
	get images() {
		return this.image;
	}
	set images(e) {
		this.image = e;
	}
}, Nd = class extends Jc {
	constructor(e = null) {
		super(), this.sourceTexture = e, this.isExternalTexture = !0;
	}
	copy(e) {
		return super.copy(e), this.sourceTexture = e.sourceTexture, this;
	}
}, Pd = class e extends Au {
	constructor(e = 1, t = 1, n = 1, r = 1, i = 1, a = 1) {
		super(), this.type = "BoxGeometry", this.parameters = {
			width: e,
			height: t,
			depth: n,
			widthSegments: r,
			heightSegments: i,
			depthSegments: a
		};
		let o = this;
		r = Math.floor(r), i = Math.floor(i), a = Math.floor(a);
		let s = [], c = [], l = [], u = [], d = 0, f = 0;
		p("z", "y", "x", -1, -1, n, t, e, a, i, 0), p("z", "y", "x", 1, -1, n, t, -e, a, i, 1), p("x", "z", "y", 1, 1, e, n, t, r, a, 2), p("x", "z", "y", 1, -1, e, n, -t, r, a, 3), p("x", "y", "z", 1, -1, e, t, n, r, i, 4), p("x", "y", "z", -1, -1, e, t, -n, r, i, 5), this.setIndex(s), this.setAttribute("position", new vu(c, 3)), this.setAttribute("normal", new vu(l, 3)), this.setAttribute("uv", new vu(u, 2));
		function p(e, t, n, r, i, a, p, m, h, g, _) {
			let v = a / h, y = p / g, b = a / 2, x = p / 2, S = m / 2, C = h + 1, w = g + 1, T = 0, E = 0, D = new J();
			for (let a = 0; a < w; a++) {
				let o = a * y - x;
				for (let s = 0; s < C; s++) D[e] = (s * v - b) * r, D[t] = o * i, D[n] = S, c.push(D.x, D.y, D.z), D[e] = 0, D[t] = 0, D[n] = m > 0 ? 1 : -1, l.push(D.x, D.y, D.z), u.push(s / h), u.push(1 - a / g), T += 1;
			}
			for (let e = 0; e < g; e++) for (let t = 0; t < h; t++) {
				let n = d + t + C * e, r = d + t + C * (e + 1), i = d + (t + 1) + C * (e + 1), a = d + (t + 1) + C * e;
				s.push(n, r, a), s.push(r, i, a), E += 6;
			}
			o.addGroup(f, E, _), f += E, d += T;
		}
	}
	copy(e) {
		return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
	}
	static fromJSON(t) {
		return new e(t.width, t.height, t.depth, t.widthSegments, t.heightSegments, t.depthSegments);
	}
}, Fd = class e extends Au {
	constructor(e = 1, t = 1, n = 4, r = 8, i = 1) {
		super(), this.type = "CapsuleGeometry", this.parameters = {
			radius: e,
			height: t,
			capSegments: n,
			radialSegments: r,
			heightSegments: i
		}, t = Math.max(0, t), n = Math.max(1, Math.floor(n)), r = Math.max(3, Math.floor(r)), i = Math.max(1, Math.floor(i));
		let a = [], o = [], s = [], c = [], l = t / 2, u = Math.PI / 2 * e, d = t, f = 2 * u + d, p = n * 2 + i, m = r + 1, h = new J(), g = new J();
		for (let _ = 0; _ <= p; _++) {
			let v = 0, y = 0, b = 0, x = 0;
			if (_ <= n) {
				let t = _ / n, r = t * Math.PI / 2;
				y = -l - e * Math.cos(r), b = e * Math.sin(r), x = -e * Math.cos(r), v = t * u;
			} else if (_ <= n + i) {
				let r = (_ - n) / i;
				y = -l + r * t, b = e, x = 0, v = u + r * d;
			} else {
				let t = (_ - n - i) / n, r = t * Math.PI / 2;
				y = l + e * Math.sin(r), b = e * Math.cos(r), x = e * Math.sin(r), v = u + d + t * u;
			}
			let S = Math.max(0, Math.min(1, v / f)), C = 0;
			_ === 0 ? C = .5 / r : _ === p && (C = -.5 / r);
			for (let e = 0; e <= r; e++) {
				let t = e / r, n = t * Math.PI * 2, i = Math.sin(n), a = Math.cos(n);
				g.x = -b * a, g.y = y, g.z = b * i, o.push(g.x, g.y, g.z), h.set(-b * a, x, b * i), h.normalize(), s.push(h.x, h.y, h.z), c.push(t + C, S);
			}
			if (_ > 0) {
				let e = (_ - 1) * m;
				for (let t = 0; t < r; t++) {
					let n = e + t, r = e + t + 1, i = _ * m + t, o = _ * m + t + 1;
					a.push(n, r, i), a.push(r, o, i);
				}
			}
		}
		this.setIndex(a), this.setAttribute("position", new vu(o, 3)), this.setAttribute("normal", new vu(s, 3)), this.setAttribute("uv", new vu(c, 2));
	}
	copy(e) {
		return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
	}
	static fromJSON(t) {
		return new e(t.radius, t.height, t.capSegments, t.radialSegments, t.heightSegments);
	}
}, Id = class e extends Au {
	constructor(e = 1, t = 32, n = 0, r = Math.PI * 2) {
		super(), this.type = "CircleGeometry", this.parameters = {
			radius: e,
			segments: t,
			thetaStart: n,
			thetaLength: r
		}, t = Math.max(3, t);
		let i = [], a = [], o = [], s = [], c = new J(), l = new q();
		a.push(0, 0, 0), o.push(0, 0, 1), s.push(.5, .5);
		for (let i = 0, u = 3; i <= t; i++, u += 3) {
			let d = n + i / t * r;
			c.x = e * Math.cos(d), c.y = e * Math.sin(d), a.push(c.x, c.y, c.z), o.push(0, 0, 1), l.x = (a[u] / e + 1) / 2, l.y = (a[u + 1] / e + 1) / 2, s.push(l.x, l.y);
		}
		for (let e = 1; e <= t; e++) i.push(e, e + 1, 0);
		this.setIndex(i), this.setAttribute("position", new vu(a, 3)), this.setAttribute("normal", new vu(o, 3)), this.setAttribute("uv", new vu(s, 2));
	}
	copy(e) {
		return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
	}
	static fromJSON(t) {
		return new e(t.radius, t.segments, t.thetaStart, t.thetaLength);
	}
}, Ld = class e extends Au {
	constructor(e = 1, t = 1, n = 1, r = 32, i = 1, a = !1, o = 0, s = Math.PI * 2) {
		super(), this.type = "CylinderGeometry", this.parameters = {
			radiusTop: e,
			radiusBottom: t,
			height: n,
			radialSegments: r,
			heightSegments: i,
			openEnded: a,
			thetaStart: o,
			thetaLength: s
		};
		let c = this;
		r = Math.floor(r), i = Math.floor(i);
		let l = [], u = [], d = [], f = [], p = 0, m = [], h = n / 2, g = 0;
		_(), a === !1 && (e > 0 && v(!0), t > 0 && v(!1)), this.setIndex(l), this.setAttribute("position", new vu(u, 3)), this.setAttribute("normal", new vu(d, 3)), this.setAttribute("uv", new vu(f, 2));
		function _() {
			let a = new J(), _ = new J(), v = 0, y = (t - e) / n;
			for (let c = 0; c <= i; c++) {
				let l = [], g = c / i, v = g * (t - e) + e;
				for (let e = 0; e <= r; e++) {
					let t = e / r, i = t * s + o, c = Math.sin(i), m = Math.cos(i);
					_.x = v * c, _.y = -g * n + h, _.z = v * m, u.push(_.x, _.y, _.z), a.set(c, y, m).normalize(), d.push(a.x, a.y, a.z), f.push(t, 1 - g), l.push(p++);
				}
				m.push(l);
			}
			for (let n = 0; n < r; n++) for (let r = 0; r < i; r++) {
				let a = m[r][n], o = m[r + 1][n], s = m[r + 1][n + 1], c = m[r][n + 1];
				(e > 0 || r !== 0) && (l.push(a, o, c), v += 3), (t > 0 || r !== i - 1) && (l.push(o, s, c), v += 3);
			}
			c.addGroup(g, v, 0), g += v;
		}
		function v(n) {
			let i = p, a = new q(), m = new J(), _ = 0, v = n === !0 ? e : t, y = n === !0 ? 1 : -1;
			for (let e = 1; e <= r; e++) u.push(0, h * y, 0), d.push(0, y, 0), f.push(.5, .5), p++;
			let b = p;
			for (let e = 0; e <= r; e++) {
				let t = e / r * s + o, n = Math.cos(t), i = Math.sin(t);
				m.x = v * i, m.y = h * y, m.z = v * n, u.push(m.x, m.y, m.z), d.push(0, y, 0), a.x = n * .5 + .5, a.y = i * .5 * y + .5, f.push(a.x, a.y), p++;
			}
			for (let e = 0; e < r; e++) {
				let t = i + e, r = b + e;
				n === !0 ? l.push(r, r + 1, t) : l.push(r + 1, r, t), _ += 3;
			}
			c.addGroup(g, _, n === !0 ? 1 : 2), g += _;
		}
	}
	copy(e) {
		return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
	}
	static fromJSON(t) {
		return new e(t.radiusTop, t.radiusBottom, t.height, t.radialSegments, t.heightSegments, t.openEnded, t.thetaStart, t.thetaLength);
	}
}, Rd = /*@__PURE__*/ new J(), zd = /*@__PURE__*/ new J(), Bd = /*@__PURE__*/ new J(), Vd = /*@__PURE__*/ new Xl(), Hd = class extends Au {
	constructor(e = null, t = 1) {
		if (super(), this.type = "EdgesGeometry", this.parameters = {
			geometry: e,
			thresholdAngle: t
		}, e !== null) {
			let n = 1e4, r = Math.cos(Tc * t), i = e.getIndex(), a = e.getAttribute("position"), o = i ? i.count : a.count, s = [
				0,
				0,
				0
			], c = [
				"a",
				"b",
				"c"
			], l = [
				,
				,
				,
			], u = {}, d = [];
			for (let e = 0; e < o; e += 3) {
				i ? (s[0] = i.getX(e), s[1] = i.getX(e + 1), s[2] = i.getX(e + 2)) : (s[0] = e, s[1] = e + 1, s[2] = e + 2);
				let { a: t, b: o, c: f } = Vd;
				if (t.fromBufferAttribute(a, s[0]), o.fromBufferAttribute(a, s[1]), f.fromBufferAttribute(a, s[2]), Vd.getNormal(Bd), l[0] = `${Math.round(t.x * n)},${Math.round(t.y * n)},${Math.round(t.z * n)}`, l[1] = `${Math.round(o.x * n)},${Math.round(o.y * n)},${Math.round(o.z * n)}`, l[2] = `${Math.round(f.x * n)},${Math.round(f.y * n)},${Math.round(f.z * n)}`, l[0] !== l[1] && l[1] !== l[2] && l[2] !== l[0]) for (let e = 0; e < 3; e++) {
					let t = (e + 1) % 3, n = l[e], i = l[t], a = Vd[c[e]], o = Vd[c[t]], f = `${n}_${i}`, p = `${i}_${n}`;
					p in u && u[p] ? (Bd.dot(u[p].normal) <= r && (d.push(a.x, a.y, a.z), d.push(o.x, o.y, o.z)), u[p] = null) : f in u || (u[f] = {
						index0: s[e],
						index1: s[t],
						normal: Bd.clone()
					});
				}
			}
			for (let e in u) if (u[e]) {
				let { index0: t, index1: n } = u[e];
				Rd.fromBufferAttribute(a, t), zd.fromBufferAttribute(a, n), d.push(Rd.x, Rd.y, Rd.z), d.push(zd.x, zd.y, zd.z);
			}
			this.setAttribute("position", new vu(d, 3));
		}
	}
	copy(e) {
		return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
	}
}, Ud = class {
	constructor() {
		this.type = "Curve", this.arcLengthDivisions = 200, this.needsUpdate = !1, this.cacheArcLengths = null;
	}
	getPoint() {
		W("Curve: .getPoint() not implemented.");
	}
	getPointAt(e, t) {
		let n = this.getUtoTmapping(e);
		return this.getPoint(n, t);
	}
	getPoints(e = 5) {
		let t = [];
		for (let n = 0; n <= e; n++) t.push(this.getPoint(n / e));
		return t;
	}
	getSpacedPoints(e = 5) {
		let t = [];
		for (let n = 0; n <= e; n++) t.push(this.getPointAt(n / e));
		return t;
	}
	getLength() {
		let e = this.getLengths();
		return e[e.length - 1];
	}
	getLengths(e = this.arcLengthDivisions) {
		if (this.cacheArcLengths && this.cacheArcLengths.length === e + 1 && !this.needsUpdate) return this.cacheArcLengths;
		this.needsUpdate = !1;
		let t = [], n, r = this.getPoint(0), i = 0;
		t.push(0);
		for (let a = 1; a <= e; a++) n = this.getPoint(a / e), i += n.distanceTo(r), t.push(i), r = n;
		return this.cacheArcLengths = t, t;
	}
	updateArcLengths() {
		this.needsUpdate = !0, this.getLengths();
	}
	getUtoTmapping(e, t = null) {
		let n = this.getLengths(), r = 0, i = n.length, a;
		a = t || e * n[i - 1];
		let o = 0, s = i - 1, c;
		for (; o <= s;) if (r = Math.floor(o + (s - o) / 2), c = n[r] - a, c < 0) o = r + 1;
		else if (c > 0) s = r - 1;
		else {
			s = r;
			break;
		}
		if (r = s, n[r] === a) return r / (i - 1);
		let l = n[r], u = n[r + 1] - l, d = (a - l) / u;
		return (r + d) / (i - 1);
	}
	getTangent(e, t) {
		let n = 1e-4, r = e - n, i = e + n;
		r < 0 && (r = 0), i > 1 && (i = 1);
		let a = this.getPoint(r), o = this.getPoint(i), s = t || (a.isVector2 ? new q() : new J());
		return s.copy(o).sub(a).normalize(), s;
	}
	getTangentAt(e, t) {
		let n = this.getUtoTmapping(e);
		return this.getTangent(n, t);
	}
	computeFrenetFrames(e, t = !1) {
		let n = new J(), r = [], i = [], a = [], o = new J(), s = new el();
		for (let t = 0; t <= e; t++) {
			let n = t / e;
			r[t] = this.getTangentAt(n, new J());
		}
		i[0] = new J(), a[0] = new J();
		let c = Number.MAX_VALUE, l = Math.abs(r[0].x), u = Math.abs(r[0].y), d = Math.abs(r[0].z);
		l <= c && (c = l, n.set(1, 0, 0)), u <= c && (c = u, n.set(0, 1, 0)), d <= c && n.set(0, 0, 1), o.crossVectors(r[0], n).normalize(), i[0].crossVectors(r[0], o), a[0].crossVectors(r[0], i[0]);
		for (let t = 1; t <= e; t++) {
			if (i[t] = i[t - 1].clone(), a[t] = a[t - 1].clone(), o.crossVectors(r[t - 1], r[t]), o.length() > 2 ** -52) {
				o.normalize();
				let e = Math.acos(K(r[t - 1].dot(r[t]), -1, 1));
				i[t].applyMatrix4(s.makeRotationAxis(o, e));
			}
			a[t].crossVectors(r[t], i[t]);
		}
		if (t === !0) {
			let t = Math.acos(K(i[0].dot(i[e]), -1, 1));
			t /= e, r[0].dot(o.crossVectors(i[0], i[e])) > 0 && (t = -t);
			for (let n = 1; n <= e; n++) i[n].applyMatrix4(s.makeRotationAxis(r[n], t * n)), a[n].crossVectors(r[n], i[n]);
		}
		return {
			tangents: r,
			normals: i,
			binormals: a
		};
	}
	clone() {
		return new this.constructor().copy(this);
	}
	copy(e) {
		return this.arcLengthDivisions = e.arcLengthDivisions, this;
	}
	toJSON() {
		let e = { metadata: {
			version: 4.7,
			type: "Curve",
			generator: "Curve.toJSON"
		} };
		return e.arcLengthDivisions = this.arcLengthDivisions, e.type = this.type, e;
	}
	fromJSON(e) {
		return this.arcLengthDivisions = e.arcLengthDivisions, this;
	}
}, Wd = class extends Ud {
	constructor(e = 0, t = 0, n = 1, r = 1, i = 0, a = Math.PI * 2, o = !1, s = 0) {
		super(), this.isEllipseCurve = !0, this.type = "EllipseCurve", this.aX = e, this.aY = t, this.xRadius = n, this.yRadius = r, this.aStartAngle = i, this.aEndAngle = a, this.aClockwise = o, this.aRotation = s;
	}
	getPoint(e, t = new q()) {
		let n = t, r = Math.PI * 2, i = this.aEndAngle - this.aStartAngle, a = Math.abs(i) < 2 ** -52;
		for (; i < 0;) i += r;
		for (; i > r;) i -= r;
		i < 2 ** -52 && (i = a ? 0 : r), this.aClockwise === !0 && !a && (i === r ? i = -r : i -= r);
		let o = this.aStartAngle + e * i, s = this.aX + this.xRadius * Math.cos(o), c = this.aY + this.yRadius * Math.sin(o);
		if (this.aRotation !== 0) {
			let e = Math.cos(this.aRotation), t = Math.sin(this.aRotation), n = s - this.aX, r = c - this.aY;
			s = n * e - r * t + this.aX, c = n * t + r * e + this.aY;
		}
		return n.set(s, c);
	}
	copy(e) {
		return super.copy(e), this.aX = e.aX, this.aY = e.aY, this.xRadius = e.xRadius, this.yRadius = e.yRadius, this.aStartAngle = e.aStartAngle, this.aEndAngle = e.aEndAngle, this.aClockwise = e.aClockwise, this.aRotation = e.aRotation, this;
	}
	toJSON() {
		let e = super.toJSON();
		return e.aX = this.aX, e.aY = this.aY, e.xRadius = this.xRadius, e.yRadius = this.yRadius, e.aStartAngle = this.aStartAngle, e.aEndAngle = this.aEndAngle, e.aClockwise = this.aClockwise, e.aRotation = this.aRotation, e;
	}
	fromJSON(e) {
		return super.fromJSON(e), this.aX = e.aX, this.aY = e.aY, this.xRadius = e.xRadius, this.yRadius = e.yRadius, this.aStartAngle = e.aStartAngle, this.aEndAngle = e.aEndAngle, this.aClockwise = e.aClockwise, this.aRotation = e.aRotation, this;
	}
}, Gd = class extends Wd {
	constructor(e, t, n, r, i, a) {
		super(e, t, n, n, r, i, a), this.isArcCurve = !0, this.type = "ArcCurve";
	}
};
function Kd() {
	let e = 0, t = 0, n = 0, r = 0;
	function i(i, a, o, s) {
		e = i, t = o, n = -3 * i + 3 * a - 2 * o - s, r = 2 * i - 2 * a + o + s;
	}
	return {
		initCatmullRom: function(e, t, n, r, a) {
			i(t, n, a * (n - e), a * (r - t));
		},
		initNonuniformCatmullRom: function(e, t, n, r, a, o, s) {
			let c = (t - e) / a - (n - e) / (a + o) + (n - t) / o, l = (n - t) / o - (r - t) / (o + s) + (r - n) / s;
			c *= o, l *= o, i(t, n, c, l);
		},
		calc: function(i) {
			let a = i * i, o = a * i;
			return e + t * i + n * a + r * o;
		}
	};
}
var qd = /*@__PURE__*/ new J(), Jd = /*@__PURE__*/ new J(), Yd = /*@__PURE__*/ new Kd(), Xd = /*@__PURE__*/ new Kd(), Zd = /*@__PURE__*/ new Kd(), Qd = class extends Ud {
	constructor(e = [], t = !1, n = "centripetal", r = .5) {
		super(), this.isCatmullRomCurve3 = !0, this.type = "CatmullRomCurve3", this.points = e, this.closed = t, this.curveType = n, this.tension = r;
	}
	getPoint(e, t = new J()) {
		let n = t, r = this.points, i = r.length, a = (i - +!this.closed) * e, o = Math.floor(a), s = a - o;
		this.closed ? o += o > 0 ? 0 : (Math.floor(Math.abs(o) / i) + 1) * i : s === 0 && o === i - 1 && (o = i - 2, s = 1);
		let c, l;
		this.closed || o > 0 ? c = r[(o - 1) % i] : (Jd.subVectors(r[0], r[1]).add(r[0]), c = Jd);
		let u = r[o % i], d = r[(o + 1) % i];
		if (this.closed || o + 2 < i ? l = r[(o + 2) % i] : (qd.subVectors(r[i - 1], r[i - 2]).add(r[i - 1]), l = qd), this.curveType === "centripetal" || this.curveType === "chordal") {
			let e = this.curveType === "chordal" ? .5 : .25, t = c.distanceToSquared(u) ** +e, n = u.distanceToSquared(d) ** +e, r = d.distanceToSquared(l) ** +e;
			n < 1e-4 && (n = 1), t < 1e-4 && (t = n), r < 1e-4 && (r = n), Yd.initNonuniformCatmullRom(c.x, u.x, d.x, l.x, t, n, r), Xd.initNonuniformCatmullRom(c.y, u.y, d.y, l.y, t, n, r), Zd.initNonuniformCatmullRom(c.z, u.z, d.z, l.z, t, n, r);
		} else this.curveType === "catmullrom" && (Yd.initCatmullRom(c.x, u.x, d.x, l.x, this.tension), Xd.initCatmullRom(c.y, u.y, d.y, l.y, this.tension), Zd.initCatmullRom(c.z, u.z, d.z, l.z, this.tension));
		return n.set(Yd.calc(s), Xd.calc(s), Zd.calc(s)), n;
	}
	copy(e) {
		super.copy(e), this.points = [];
		for (let t = 0, n = e.points.length; t < n; t++) {
			let n = e.points[t];
			this.points.push(n.clone());
		}
		return this.closed = e.closed, this.curveType = e.curveType, this.tension = e.tension, this;
	}
	toJSON() {
		let e = super.toJSON();
		e.points = [];
		for (let t = 0, n = this.points.length; t < n; t++) {
			let n = this.points[t];
			e.points.push(n.toArray());
		}
		return e.closed = this.closed, e.curveType = this.curveType, e.tension = this.tension, e;
	}
	fromJSON(e) {
		super.fromJSON(e), this.points = [];
		for (let t = 0, n = e.points.length; t < n; t++) {
			let n = e.points[t];
			this.points.push(new J().fromArray(n));
		}
		return this.closed = e.closed, this.curveType = e.curveType, this.tension = e.tension, this;
	}
};
function $d(e, t, n, r, i) {
	let a = (r - t) * .5, o = (i - n) * .5, s = e * e, c = e * s;
	return (2 * n - 2 * r + a + o) * c + (-3 * n + 3 * r - 2 * a - o) * s + a * e + n;
}
function ef(e, t) {
	let n = 1 - e;
	return n * n * t;
}
function tf(e, t) {
	return 2 * (1 - e) * e * t;
}
function nf(e, t) {
	return e * e * t;
}
function rf(e, t, n, r) {
	return ef(e, t) + tf(e, n) + nf(e, r);
}
function af(e, t) {
	let n = 1 - e;
	return n * n * n * t;
}
function of(e, t) {
	let n = 1 - e;
	return 3 * n * n * e * t;
}
function sf(e, t) {
	return 3 * (1 - e) * e * e * t;
}
function cf(e, t) {
	return e * e * e * t;
}
function lf(e, t, n, r, i) {
	return af(e, t) + of(e, n) + sf(e, r) + cf(e, i);
}
var uf = class extends Ud {
	constructor(e = new q(), t = new q(), n = new q(), r = new q()) {
		super(), this.isCubicBezierCurve = !0, this.type = "CubicBezierCurve", this.v0 = e, this.v1 = t, this.v2 = n, this.v3 = r;
	}
	getPoint(e, t = new q()) {
		let n = t, r = this.v0, i = this.v1, a = this.v2, o = this.v3;
		return n.set(lf(e, r.x, i.x, a.x, o.x), lf(e, r.y, i.y, a.y, o.y)), n;
	}
	copy(e) {
		return super.copy(e), this.v0.copy(e.v0), this.v1.copy(e.v1), this.v2.copy(e.v2), this.v3.copy(e.v3), this;
	}
	toJSON() {
		let e = super.toJSON();
		return e.v0 = this.v0.toArray(), e.v1 = this.v1.toArray(), e.v2 = this.v2.toArray(), e.v3 = this.v3.toArray(), e;
	}
	fromJSON(e) {
		return super.fromJSON(e), this.v0.fromArray(e.v0), this.v1.fromArray(e.v1), this.v2.fromArray(e.v2), this.v3.fromArray(e.v3), this;
	}
}, df = class extends Ud {
	constructor(e = new J(), t = new J(), n = new J(), r = new J()) {
		super(), this.isCubicBezierCurve3 = !0, this.type = "CubicBezierCurve3", this.v0 = e, this.v1 = t, this.v2 = n, this.v3 = r;
	}
	getPoint(e, t = new J()) {
		let n = t, r = this.v0, i = this.v1, a = this.v2, o = this.v3;
		return n.set(lf(e, r.x, i.x, a.x, o.x), lf(e, r.y, i.y, a.y, o.y), lf(e, r.z, i.z, a.z, o.z)), n;
	}
	copy(e) {
		return super.copy(e), this.v0.copy(e.v0), this.v1.copy(e.v1), this.v2.copy(e.v2), this.v3.copy(e.v3), this;
	}
	toJSON() {
		let e = super.toJSON();
		return e.v0 = this.v0.toArray(), e.v1 = this.v1.toArray(), e.v2 = this.v2.toArray(), e.v3 = this.v3.toArray(), e;
	}
	fromJSON(e) {
		return super.fromJSON(e), this.v0.fromArray(e.v0), this.v1.fromArray(e.v1), this.v2.fromArray(e.v2), this.v3.fromArray(e.v3), this;
	}
}, ff = class extends Ud {
	constructor(e = new q(), t = new q()) {
		super(), this.isLineCurve = !0, this.type = "LineCurve", this.v1 = e, this.v2 = t;
	}
	getPoint(e, t = new q()) {
		let n = t;
		return e === 1 ? n.copy(this.v2) : (n.copy(this.v2).sub(this.v1), n.multiplyScalar(e).add(this.v1)), n;
	}
	getPointAt(e, t) {
		return this.getPoint(e, t);
	}
	getTangent(e, t = new q()) {
		return t.subVectors(this.v2, this.v1).normalize();
	}
	getTangentAt(e, t) {
		return this.getTangent(e, t);
	}
	copy(e) {
		return super.copy(e), this.v1.copy(e.v1), this.v2.copy(e.v2), this;
	}
	toJSON() {
		let e = super.toJSON();
		return e.v1 = this.v1.toArray(), e.v2 = this.v2.toArray(), e;
	}
	fromJSON(e) {
		return super.fromJSON(e), this.v1.fromArray(e.v1), this.v2.fromArray(e.v2), this;
	}
}, pf = class extends Ud {
	constructor(e = new J(), t = new J()) {
		super(), this.isLineCurve3 = !0, this.type = "LineCurve3", this.v1 = e, this.v2 = t;
	}
	getPoint(e, t = new J()) {
		let n = t;
		return e === 1 ? n.copy(this.v2) : (n.copy(this.v2).sub(this.v1), n.multiplyScalar(e).add(this.v1)), n;
	}
	getPointAt(e, t) {
		return this.getPoint(e, t);
	}
	getTangent(e, t = new J()) {
		return t.subVectors(this.v2, this.v1).normalize();
	}
	getTangentAt(e, t) {
		return this.getTangent(e, t);
	}
	copy(e) {
		return super.copy(e), this.v1.copy(e.v1), this.v2.copy(e.v2), this;
	}
	toJSON() {
		let e = super.toJSON();
		return e.v1 = this.v1.toArray(), e.v2 = this.v2.toArray(), e;
	}
	fromJSON(e) {
		return super.fromJSON(e), this.v1.fromArray(e.v1), this.v2.fromArray(e.v2), this;
	}
}, mf = class extends Ud {
	constructor(e = new q(), t = new q(), n = new q()) {
		super(), this.isQuadraticBezierCurve = !0, this.type = "QuadraticBezierCurve", this.v0 = e, this.v1 = t, this.v2 = n;
	}
	getPoint(e, t = new q()) {
		let n = t, r = this.v0, i = this.v1, a = this.v2;
		return n.set(rf(e, r.x, i.x, a.x), rf(e, r.y, i.y, a.y)), n;
	}
	copy(e) {
		return super.copy(e), this.v0.copy(e.v0), this.v1.copy(e.v1), this.v2.copy(e.v2), this;
	}
	toJSON() {
		let e = super.toJSON();
		return e.v0 = this.v0.toArray(), e.v1 = this.v1.toArray(), e.v2 = this.v2.toArray(), e;
	}
	fromJSON(e) {
		return super.fromJSON(e), this.v0.fromArray(e.v0), this.v1.fromArray(e.v1), this.v2.fromArray(e.v2), this;
	}
}, hf = class extends Ud {
	constructor(e = new J(), t = new J(), n = new J()) {
		super(), this.isQuadraticBezierCurve3 = !0, this.type = "QuadraticBezierCurve3", this.v0 = e, this.v1 = t, this.v2 = n;
	}
	getPoint(e, t = new J()) {
		let n = t, r = this.v0, i = this.v1, a = this.v2;
		return n.set(rf(e, r.x, i.x, a.x), rf(e, r.y, i.y, a.y), rf(e, r.z, i.z, a.z)), n;
	}
	copy(e) {
		return super.copy(e), this.v0.copy(e.v0), this.v1.copy(e.v1), this.v2.copy(e.v2), this;
	}
	toJSON() {
		let e = super.toJSON();
		return e.v0 = this.v0.toArray(), e.v1 = this.v1.toArray(), e.v2 = this.v2.toArray(), e;
	}
	fromJSON(e) {
		return super.fromJSON(e), this.v0.fromArray(e.v0), this.v1.fromArray(e.v1), this.v2.fromArray(e.v2), this;
	}
}, gf = class extends Ud {
	constructor(e = []) {
		super(), this.isSplineCurve = !0, this.type = "SplineCurve", this.points = e;
	}
	getPoint(e, t = new q()) {
		let n = t, r = this.points, i = (r.length - 1) * e, a = Math.floor(i), o = i - a, s = r[a === 0 ? a : a - 1], c = r[a], l = r[a > r.length - 2 ? r.length - 1 : a + 1], u = r[a > r.length - 3 ? r.length - 1 : a + 2];
		return n.set($d(o, s.x, c.x, l.x, u.x), $d(o, s.y, c.y, l.y, u.y)), n;
	}
	copy(e) {
		super.copy(e), this.points = [];
		for (let t = 0, n = e.points.length; t < n; t++) {
			let n = e.points[t];
			this.points.push(n.clone());
		}
		return this;
	}
	toJSON() {
		let e = super.toJSON();
		e.points = [];
		for (let t = 0, n = this.points.length; t < n; t++) {
			let n = this.points[t];
			e.points.push(n.toArray());
		}
		return e;
	}
	fromJSON(e) {
		super.fromJSON(e), this.points = [];
		for (let t = 0, n = e.points.length; t < n; t++) {
			let n = e.points[t];
			this.points.push(new q().fromArray(n));
		}
		return this;
	}
}, _f = /*#__PURE__*/ Object.freeze({
	__proto__: null,
	ArcCurve: Gd,
	CatmullRomCurve3: Qd,
	CubicBezierCurve: uf,
	CubicBezierCurve3: df,
	EllipseCurve: Wd,
	LineCurve: ff,
	LineCurve3: pf,
	QuadraticBezierCurve: mf,
	QuadraticBezierCurve3: hf,
	SplineCurve: gf
}), vf = class extends Ud {
	constructor() {
		super(), this.type = "CurvePath", this.curves = [], this.autoClose = !1;
	}
	add(e) {
		this.curves.push(e);
	}
	closePath() {
		let e = this.curves[0].getPoint(0), t = this.curves[this.curves.length - 1].getPoint(1);
		if (!e.equals(t)) {
			let n = e.isVector2 === !0 ? "LineCurve" : "LineCurve3";
			this.curves.push(new _f[n](t, e));
		}
		return this;
	}
	getPoint(e, t) {
		let n = e * this.getLength(), r = this.getCurveLengths(), i = 0;
		for (; i < r.length;) {
			if (r[i] >= n) {
				let e = r[i] - n, a = this.curves[i], o = a.getLength(), s = o === 0 ? 0 : 1 - e / o;
				return a.getPointAt(s, t);
			}
			i++;
		}
		return null;
	}
	getLength() {
		let e = this.getCurveLengths();
		return e[e.length - 1];
	}
	updateArcLengths() {
		this.needsUpdate = !0, this.cacheLengths = null, this.getCurveLengths();
	}
	getCurveLengths() {
		if (this.cacheLengths && this.cacheLengths.length === this.curves.length) return this.cacheLengths;
		let e = [], t = 0;
		for (let n = 0, r = this.curves.length; n < r; n++) t += this.curves[n].getLength(), e.push(t);
		return this.cacheLengths = e, e;
	}
	getSpacedPoints(e = 40) {
		let t = [];
		for (let n = 0; n <= e; n++) t.push(this.getPoint(n / e));
		return this.autoClose && t.push(t[0]), t;
	}
	getPoints(e = 12) {
		let t = [], n;
		for (let r = 0, i = this.curves; r < i.length; r++) {
			let a = i[r], o = a.isEllipseCurve ? e * 2 : a.isLineCurve || a.isLineCurve3 ? 1 : a.isSplineCurve ? e * a.points.length : e, s = a.getPoints(o);
			for (let e = 0; e < s.length; e++) {
				let r = s[e];
				n && n.equals(r) || (t.push(r), n = r);
			}
		}
		return this.autoClose && t.length > 1 && !t[t.length - 1].equals(t[0]) && t.push(t[0]), t;
	}
	copy(e) {
		super.copy(e), this.curves = [];
		for (let t = 0, n = e.curves.length; t < n; t++) {
			let n = e.curves[t];
			this.curves.push(n.clone());
		}
		return this.autoClose = e.autoClose, this;
	}
	toJSON() {
		let e = super.toJSON();
		e.autoClose = this.autoClose, e.curves = [];
		for (let t = 0, n = this.curves.length; t < n; t++) {
			let n = this.curves[t];
			e.curves.push(n.toJSON());
		}
		return e;
	}
	fromJSON(e) {
		super.fromJSON(e), this.autoClose = e.autoClose, this.curves = [];
		for (let t = 0, n = e.curves.length; t < n; t++) {
			let n = e.curves[t];
			this.curves.push(new _f[n.type]().fromJSON(n));
		}
		return this;
	}
}, yf = class extends vf {
	constructor(e) {
		super(), this.type = "Path", this.currentPoint = new q(), e && this.setFromPoints(e);
	}
	setFromPoints(e) {
		this.moveTo(e[0].x, e[0].y);
		for (let t = 1, n = e.length; t < n; t++) this.lineTo(e[t].x, e[t].y);
		return this;
	}
	moveTo(e, t) {
		return this.currentPoint.set(e, t), this;
	}
	lineTo(e, t) {
		let n = new ff(this.currentPoint.clone(), new q(e, t));
		return this.curves.push(n), this.currentPoint.set(e, t), this;
	}
	quadraticCurveTo(e, t, n, r) {
		let i = new mf(this.currentPoint.clone(), new q(e, t), new q(n, r));
		return this.curves.push(i), this.currentPoint.set(n, r), this;
	}
	bezierCurveTo(e, t, n, r, i, a) {
		let o = new uf(this.currentPoint.clone(), new q(e, t), new q(n, r), new q(i, a));
		return this.curves.push(o), this.currentPoint.set(i, a), this;
	}
	splineThru(e) {
		let t = new gf([this.currentPoint.clone()].concat(e));
		return this.curves.push(t), this.currentPoint.copy(e[e.length - 1]), this;
	}
	arc(e, t, n, r, i, a) {
		let o = this.currentPoint.x, s = this.currentPoint.y;
		return this.absarc(e + o, t + s, n, r, i, a), this;
	}
	absarc(e, t, n, r, i, a) {
		return this.absellipse(e, t, n, n, r, i, a), this;
	}
	ellipse(e, t, n, r, i, a, o, s) {
		let c = this.currentPoint.x, l = this.currentPoint.y;
		return this.absellipse(e + c, t + l, n, r, i, a, o, s), this;
	}
	absellipse(e, t, n, r, i, a, o, s) {
		let c = new Wd(e, t, n, r, i, a, o, s);
		if (this.curves.length > 0) {
			let e = c.getPoint(0);
			e.equals(this.currentPoint) || this.lineTo(e.x, e.y);
		}
		this.curves.push(c);
		let l = c.getPoint(1);
		return this.currentPoint.copy(l), this;
	}
	copy(e) {
		return super.copy(e), this.currentPoint.copy(e.currentPoint), this;
	}
	toJSON() {
		let e = super.toJSON();
		return e.currentPoint = this.currentPoint.toArray(), e;
	}
	fromJSON(e) {
		return super.fromJSON(e), this.currentPoint.fromArray(e.currentPoint), this;
	}
}, bf = class extends yf {
	constructor(e) {
		super(e), this.uuid = Dc(), this.type = "Shape", this.holes = [];
	}
	getPointsHoles(e) {
		let t = [];
		for (let n = 0, r = this.holes.length; n < r; n++) t[n] = this.holes[n].getPoints(e);
		return t;
	}
	extractPoints(e) {
		return {
			shape: this.getPoints(e),
			holes: this.getPointsHoles(e)
		};
	}
	copy(e) {
		super.copy(e), this.holes = [];
		for (let t = 0, n = e.holes.length; t < n; t++) {
			let n = e.holes[t];
			this.holes.push(n.clone());
		}
		return this;
	}
	toJSON() {
		let e = super.toJSON();
		e.uuid = this.uuid, e.holes = [];
		for (let t = 0, n = this.holes.length; t < n; t++) {
			let n = this.holes[t];
			e.holes.push(n.toJSON());
		}
		return e;
	}
	fromJSON(e) {
		super.fromJSON(e), this.uuid = e.uuid, this.holes = [];
		for (let t = 0, n = e.holes.length; t < n; t++) {
			let n = e.holes[t];
			this.holes.push(new yf().fromJSON(n));
		}
		return this;
	}
};
function xf(e, t, n = 2) {
	let r = t && t.length, i = r ? t[0] * n : e.length, a = Sf(e, 0, i, n, !0), o = [];
	if (!a || a.next === a.prev) return o;
	let s, c, l;
	if (r && (a = kf(e, t, a, n)), e.length > 80 * n) {
		s = e[0], c = e[1];
		let t = s, r = c;
		for (let a = n; a < i; a += n) {
			let n = e[a], i = e[a + 1];
			n < s && (s = n), i < c && (c = i), n > t && (t = n), i > r && (r = i);
		}
		l = Math.max(t - s, r - c), l = l === 0 ? 0 : 32767 / l;
	}
	return wf(a, o, n, s, c, l, 0), o;
}
function Sf(e, t, n, r, i) {
	let a;
	if (i === $f(e, t, n, r) > 0) for (let i = t; i < n; i += r) a = Xf(i / r | 0, e[i], e[i + 1], a);
	else for (let i = n - r; i >= t; i -= r) a = Xf(i / r | 0, e[i], e[i + 1], a);
	return a && Hf(a, a.next) && (Zf(a), a = a.next), a;
}
function Cf(e, t) {
	if (!e) return e;
	t ||= e;
	let n = e, r;
	do
		if (r = !1, !n.steiner && (Hf(n, n.next) || Vf(n.prev, n, n.next) === 0)) {
			if (Zf(n), n = t = n.prev, n === n.next) break;
			r = !0;
		} else n = n.next;
	while (r || n !== t);
	return t;
}
function wf(e, t, n, r, i, a, o) {
	if (!e) return;
	!o && a && Pf(e, r, i, a);
	let s = e;
	for (; e.prev !== e.next;) {
		let c = e.prev, l = e.next;
		if (a ? Ef(e, r, i, a) : Tf(e)) t.push(c.i, e.i, l.i), Zf(e), e = l.next, s = l.next;
		else if (e = l, e === s) {
			o ? o === 1 ? (e = Df(Cf(e), t), wf(e, t, n, r, i, a, 2)) : o === 2 && Of(e, t, n, r, i, a) : wf(Cf(e), t, n, r, i, a, 1);
			break;
		}
	}
}
function Tf(e) {
	let t = e.prev, n = e, r = e.next;
	if (Vf(t, n, r) >= 0) return !1;
	let i = t.x, a = n.x, o = r.x, s = t.y, c = n.y, l = r.y, u = Math.min(i, a, o), d = Math.min(s, c, l), f = Math.max(i, a, o), p = Math.max(s, c, l), m = r.next;
	for (; m !== t;) {
		if (m.x >= u && m.x <= f && m.y >= d && m.y <= p && zf(i, s, a, c, o, l, m.x, m.y) && Vf(m.prev, m, m.next) >= 0) return !1;
		m = m.next;
	}
	return !0;
}
function Ef(e, t, n, r) {
	let i = e.prev, a = e, o = e.next;
	if (Vf(i, a, o) >= 0) return !1;
	let s = i.x, c = a.x, l = o.x, u = i.y, d = a.y, f = o.y, p = Math.min(s, c, l), m = Math.min(u, d, f), h = Math.max(s, c, l), g = Math.max(u, d, f), _ = If(p, m, t, n, r), v = If(h, g, t, n, r), y = e.prevZ, b = e.nextZ;
	for (; y && y.z >= _ && b && b.z <= v;) {
		if (y.x >= p && y.x <= h && y.y >= m && y.y <= g && y !== i && y !== o && zf(s, u, c, d, l, f, y.x, y.y) && Vf(y.prev, y, y.next) >= 0 || (y = y.prevZ, b.x >= p && b.x <= h && b.y >= m && b.y <= g && b !== i && b !== o && zf(s, u, c, d, l, f, b.x, b.y) && Vf(b.prev, b, b.next) >= 0)) return !1;
		b = b.nextZ;
	}
	for (; y && y.z >= _;) {
		if (y.x >= p && y.x <= h && y.y >= m && y.y <= g && y !== i && y !== o && zf(s, u, c, d, l, f, y.x, y.y) && Vf(y.prev, y, y.next) >= 0) return !1;
		y = y.prevZ;
	}
	for (; b && b.z <= v;) {
		if (b.x >= p && b.x <= h && b.y >= m && b.y <= g && b !== i && b !== o && zf(s, u, c, d, l, f, b.x, b.y) && Vf(b.prev, b, b.next) >= 0) return !1;
		b = b.nextZ;
	}
	return !0;
}
function Df(e, t) {
	let n = e;
	do {
		let r = n.prev, i = n.next.next;
		!Hf(r, i) && Uf(r, n, n.next, i) && qf(r, i) && qf(i, r) && (t.push(r.i, n.i, i.i), Zf(n), Zf(n.next), n = e = i), n = n.next;
	} while (n !== e);
	return Cf(n);
}
function Of(e, t, n, r, i, a) {
	let o = e;
	do {
		let e = o.next.next;
		for (; e !== o.prev;) {
			if (o.i !== e.i && Bf(o, e)) {
				let s = Yf(o, e);
				o = Cf(o, o.next), s = Cf(s, s.next), wf(o, t, n, r, i, a, 0), wf(s, t, n, r, i, a, 0);
				return;
			}
			e = e.next;
		}
		o = o.next;
	} while (o !== e);
}
function kf(e, t, n, r) {
	let i = [];
	for (let n = 0, a = t.length; n < a; n++) {
		let o = Sf(e, t[n] * r, n < a - 1 ? t[n + 1] * r : e.length, r, !1);
		o === o.next && (o.steiner = !0), i.push(Lf(o));
	}
	i.sort(Af);
	for (let e = 0; e < i.length; e++) n = jf(i[e], n);
	return n;
}
function Af(e, t) {
	let n = e.x - t.x;
	return n === 0 && (n = e.y - t.y, n === 0 && (n = (e.next.y - e.y) / (e.next.x - e.x) - (t.next.y - t.y) / (t.next.x - t.x))), n;
}
function jf(e, t) {
	let n = Mf(e, t);
	if (!n) return t;
	let r = Yf(n, e);
	return Cf(r, r.next), Cf(n, n.next);
}
function Mf(e, t) {
	let n = t, r = e.x, i = e.y, a = -Infinity, o;
	if (Hf(e, n)) return n;
	do {
		if (Hf(e, n.next)) return n.next;
		if (i <= n.y && i >= n.next.y && n.next.y !== n.y) {
			let e = n.x + (i - n.y) * (n.next.x - n.x) / (n.next.y - n.y);
			if (e <= r && e > a && (a = e, o = n.x < n.next.x ? n : n.next, e === r)) return o;
		}
		n = n.next;
	} while (n !== t);
	if (!o) return null;
	let s = o, c = o.x, l = o.y, u = Infinity;
	n = o;
	do {
		if (r >= n.x && n.x >= c && r !== n.x && Rf(i < l ? r : a, i, c, l, i < l ? a : r, i, n.x, n.y)) {
			let t = Math.abs(i - n.y) / (r - n.x);
			qf(n, e) && (t < u || t === u && (n.x > o.x || n.x === o.x && Nf(o, n))) && (o = n, u = t);
		}
		n = n.next;
	} while (n !== s);
	return o;
}
function Nf(e, t) {
	return Vf(e.prev, e, t.prev) < 0 && Vf(t.next, e, e.next) < 0;
}
function Pf(e, t, n, r) {
	let i = e;
	do
		i.z === 0 && (i.z = If(i.x, i.y, t, n, r)), i.prevZ = i.prev, i.nextZ = i.next, i = i.next;
	while (i !== e);
	i.prevZ.nextZ = null, i.prevZ = null, Ff(i);
}
function Ff(e) {
	let t, n = 1;
	do {
		let r = e, i;
		e = null;
		let a = null;
		for (t = 0; r;) {
			t++;
			let o = r, s = 0;
			for (let e = 0; e < n && (s++, o = o.nextZ, o); e++);
			let c = n;
			for (; s > 0 || c > 0 && o;) s !== 0 && (c === 0 || !o || r.z <= o.z) ? (i = r, r = r.nextZ, s--) : (i = o, o = o.nextZ, c--), a ? a.nextZ = i : e = i, i.prevZ = a, a = i;
			r = o;
		}
		a.nextZ = null, n *= 2;
	} while (t > 1);
	return e;
}
function If(e, t, n, r, i) {
	return e = (e - n) * i | 0, t = (t - r) * i | 0, e = (e | e << 8) & 16711935, e = (e | e << 4) & 252645135, e = (e | e << 2) & 858993459, e = (e | e << 1) & 1431655765, t = (t | t << 8) & 16711935, t = (t | t << 4) & 252645135, t = (t | t << 2) & 858993459, t = (t | t << 1) & 1431655765, e | t << 1;
}
function Lf(e) {
	let t = e, n = e;
	do
		(t.x < n.x || t.x === n.x && t.y < n.y) && (n = t), t = t.next;
	while (t !== e);
	return n;
}
function Rf(e, t, n, r, i, a, o, s) {
	return (i - o) * (t - s) >= (e - o) * (a - s) && (e - o) * (r - s) >= (n - o) * (t - s) && (n - o) * (a - s) >= (i - o) * (r - s);
}
function zf(e, t, n, r, i, a, o, s) {
	return (e !== o || t !== s) && Rf(e, t, n, r, i, a, o, s);
}
function Bf(e, t) {
	return e.next.i !== t.i && e.prev.i !== t.i && !Kf(e, t) && (qf(e, t) && qf(t, e) && Jf(e, t) && (Vf(e.prev, e, t.prev) || Vf(e, t.prev, t)) || Hf(e, t) && Vf(e.prev, e, e.next) > 0 && Vf(t.prev, t, t.next) > 0);
}
function Vf(e, t, n) {
	return (t.y - e.y) * (n.x - t.x) - (t.x - e.x) * (n.y - t.y);
}
function Hf(e, t) {
	return e.x === t.x && e.y === t.y;
}
function Uf(e, t, n, r) {
	let i = Gf(Vf(e, t, n)), a = Gf(Vf(e, t, r)), o = Gf(Vf(n, r, e)), s = Gf(Vf(n, r, t));
	return !!(i !== a && o !== s || i === 0 && Wf(e, n, t) || a === 0 && Wf(e, r, t) || o === 0 && Wf(n, e, r) || s === 0 && Wf(n, t, r));
}
function Wf(e, t, n) {
	return t.x <= Math.max(e.x, n.x) && t.x >= Math.min(e.x, n.x) && t.y <= Math.max(e.y, n.y) && t.y >= Math.min(e.y, n.y);
}
function Gf(e) {
	return e > 0 ? 1 : e < 0 ? -1 : 0;
}
function Kf(e, t) {
	let n = e;
	do {
		if (n.i !== e.i && n.next.i !== e.i && n.i !== t.i && n.next.i !== t.i && Uf(n, n.next, e, t)) return !0;
		n = n.next;
	} while (n !== e);
	return !1;
}
function qf(e, t) {
	return Vf(e.prev, e, e.next) < 0 ? Vf(e, t, e.next) >= 0 && Vf(e, e.prev, t) >= 0 : Vf(e, t, e.prev) < 0 || Vf(e, e.next, t) < 0;
}
function Jf(e, t) {
	let n = e, r = !1, i = (e.x + t.x) / 2, a = (e.y + t.y) / 2;
	do
		n.y > a != n.next.y > a && n.next.y !== n.y && i < (n.next.x - n.x) * (a - n.y) / (n.next.y - n.y) + n.x && (r = !r), n = n.next;
	while (n !== e);
	return r;
}
function Yf(e, t) {
	let n = Qf(e.i, e.x, e.y), r = Qf(t.i, t.x, t.y), i = e.next, a = t.prev;
	return e.next = t, t.prev = e, n.next = i, i.prev = n, r.next = n, n.prev = r, a.next = r, r.prev = a, r;
}
function Xf(e, t, n, r) {
	let i = Qf(e, t, n);
	return r ? (i.next = r.next, i.prev = r, r.next.prev = i, r.next = i) : (i.prev = i, i.next = i), i;
}
function Zf(e) {
	e.next.prev = e.prev, e.prev.next = e.next, e.prevZ && (e.prevZ.nextZ = e.nextZ), e.nextZ && (e.nextZ.prevZ = e.prevZ);
}
function Qf(e, t, n) {
	return {
		i: e,
		x: t,
		y: n,
		prev: null,
		next: null,
		z: 0,
		prevZ: null,
		nextZ: null,
		steiner: !1
	};
}
function $f(e, t, n, r) {
	let i = 0;
	for (let a = t, o = n - r; a < n; a += r) i += (e[o] - e[a]) * (e[a + 1] + e[o + 1]), o = a;
	return i;
}
var ep = class {
	static triangulate(e, t, n = 2) {
		return xf(e, t, n);
	}
}, tp = class e {
	static area(e) {
		let t = e.length, n = 0;
		for (let r = t - 1, i = 0; i < t; r = i++) n += e[r].x * e[i].y - e[i].x * e[r].y;
		return n * .5;
	}
	static isClockWise(t) {
		return e.area(t) < 0;
	}
	static triangulateShape(e, t) {
		let n = [], r = [], i = [];
		np(e), rp(n, e);
		let a = e.length;
		t.forEach(np);
		for (let e = 0; e < t.length; e++) r.push(a), a += t[e].length, rp(n, t[e]);
		let o = ep.triangulate(n, r);
		for (let e = 0; e < o.length; e += 3) i.push(o.slice(e, e + 3));
		return i;
	}
};
function np(e) {
	let t = e.length;
	t > 2 && e[t - 1].equals(e[0]) && e.pop();
}
function rp(e, t) {
	for (let n = 0; n < t.length; n++) e.push(t[n].x), e.push(t[n].y);
}
var ip = class e extends Au {
	constructor(e = new bf([
		new q(.5, .5),
		new q(-.5, .5),
		new q(-.5, -.5),
		new q(.5, -.5)
	]), t = {}) {
		super(), this.type = "ExtrudeGeometry", this.parameters = {
			shapes: e,
			options: t
		}, e = Array.isArray(e) ? e : [e];
		let n = this, r = [], i = [];
		for (let t = 0, n = e.length; t < n; t++) {
			let n = e[t];
			a(n);
		}
		this.setAttribute("position", new vu(r, 3)), this.setAttribute("uv", new vu(i, 2)), this.computeVertexNormals();
		function a(e) {
			let a = [], o = t.curveSegments === void 0 ? 12 : t.curveSegments, s = t.steps === void 0 ? 1 : t.steps, c = t.depth === void 0 ? 1 : t.depth, l = t.bevelEnabled === void 0 || t.bevelEnabled, u = t.bevelThickness === void 0 ? .2 : t.bevelThickness, d = t.bevelSize === void 0 ? u - .1 : t.bevelSize, f = t.bevelOffset === void 0 ? 0 : t.bevelOffset, p = t.bevelSegments === void 0 ? 3 : t.bevelSegments, m = t.extrudePath, h = t.UVGenerator === void 0 ? ap : t.UVGenerator, g, _ = !1, v, y, b, x;
			if (m) {
				g = m.getSpacedPoints(s), _ = !0, l = !1;
				let e = m.isCatmullRomCurve3 ? m.closed : !1;
				v = m.computeFrenetFrames(s, e), y = new J(), b = new J(), x = new J();
			}
			l || (p = 0, u = 0, d = 0, f = 0);
			let S = e.extractPoints(o), C = S.shape, w = S.holes;
			if (!tp.isClockWise(C)) {
				C = C.reverse();
				for (let e = 0, t = w.length; e < t; e++) {
					let t = w[e];
					tp.isClockWise(t) && (w[e] = t.reverse());
				}
			}
			function T(e) {
				let t = e[0];
				for (let n = 1; n <= e.length; n++) {
					let r = n % e.length, i = e[r], a = i.x - t.x, o = i.y - t.y, s = a * a + o * o, c = Math.max(Math.abs(i.x), Math.abs(i.y), Math.abs(t.x), Math.abs(t.y));
					s <= 10000000000000001e-36 * c * c ? (e.splice(r, 1), n--) : t = i;
				}
			}
			T(C), w.forEach(T);
			let E = w.length, D = C;
			for (let e = 0; e < E; e++) {
				let t = w[e];
				C = C.concat(t);
			}
			function O(e, t, n) {
				return t || G("ExtrudeGeometry: vec does not exist"), e.clone().addScaledVector(t, n);
			}
			let k = C.length;
			function A(e, t, n) {
				let r, i, a, o = e.x - t.x, s = e.y - t.y, c = n.x - e.x, l = n.y - e.y, u = o * o + s * s, d = o * l - s * c;
				if (Math.abs(d) > 2 ** -52) {
					let d = Math.sqrt(u), f = Math.sqrt(c * c + l * l), p = t.x - s / d, m = t.y + o / d, h = n.x - l / f, g = n.y + c / f, _ = ((h - p) * l - (g - m) * c) / (o * l - s * c);
					r = p + o * _ - e.x, i = m + s * _ - e.y;
					let v = r * r + i * i;
					if (v <= 2) return new q(r, i);
					a = Math.sqrt(v / 2);
				} else {
					let e = !1;
					o > 2 ** -52 ? c > 2 ** -52 && (e = !0) : o < -(2 ** -52) ? c < -(2 ** -52) && (e = !0) : Math.sign(s) === Math.sign(l) && (e = !0), e ? (r = -s, i = o, a = Math.sqrt(u)) : (r = o, i = s, a = Math.sqrt(u / 2));
				}
				return new q(r / a, i / a);
			}
			let j = [];
			for (let e = 0, t = D.length, n = t - 1, r = e + 1; e < t; e++, n++, r++) n === t && (n = 0), r === t && (r = 0), j[e] = A(D[e], D[n], D[r]);
			let ee = [], M, te = j.concat();
			for (let e = 0, t = E; e < t; e++) {
				let t = w[e];
				M = [];
				for (let e = 0, n = t.length, r = n - 1, i = e + 1; e < n; e++, r++, i++) r === n && (r = 0), i === n && (i = 0), M[e] = A(t[e], t[r], t[i]);
				ee.push(M), te = te.concat(M);
			}
			let ne;
			if (p === 0) ne = tp.triangulateShape(D, w);
			else {
				let e = [], t = [];
				for (let n = 0; n < p; n++) {
					let r = n / p, i = u * Math.cos(r * Math.PI / 2), a = d * Math.sin(r * Math.PI / 2) + f;
					for (let t = 0, n = D.length; t < n; t++) {
						let n = O(D[t], j[t], a);
						P(n.x, n.y, -i), r === 0 && e.push(n);
					}
					for (let e = 0, n = E; e < n; e++) {
						let n = w[e];
						M = ee[e];
						let o = [];
						for (let e = 0, t = n.length; e < t; e++) {
							let t = O(n[e], M[e], a);
							P(t.x, t.y, -i), r === 0 && o.push(t);
						}
						r === 0 && t.push(o);
					}
				}
				ne = tp.triangulateShape(e, t);
			}
			let N = ne.length, re = d + f;
			for (let e = 0; e < k; e++) {
				let t = l ? O(C[e], te[e], re) : C[e];
				_ ? (b.copy(v.normals[0]).multiplyScalar(t.x), y.copy(v.binormals[0]).multiplyScalar(t.y), x.copy(g[0]).add(b).add(y), P(x.x, x.y, x.z)) : P(t.x, t.y, 0);
			}
			for (let e = 1; e <= s; e++) for (let t = 0; t < k; t++) {
				let n = l ? O(C[t], te[t], re) : C[t];
				_ ? (b.copy(v.normals[e]).multiplyScalar(n.x), y.copy(v.binormals[e]).multiplyScalar(n.y), x.copy(g[e]).add(b).add(y), P(x.x, x.y, x.z)) : P(n.x, n.y, c / s * e);
			}
			for (let e = p - 1; e >= 0; e--) {
				let t = e / p, n = u * Math.cos(t * Math.PI / 2), r = d * Math.sin(t * Math.PI / 2) + f;
				for (let e = 0, t = D.length; e < t; e++) {
					let t = O(D[e], j[e], r);
					P(t.x, t.y, c + n);
				}
				for (let e = 0, t = w.length; e < t; e++) {
					let t = w[e];
					M = ee[e];
					for (let e = 0, i = t.length; e < i; e++) {
						let i = O(t[e], M[e], r);
						_ ? P(i.x, i.y + g[s - 1].y, g[s - 1].x + n) : P(i.x, i.y, c + n);
					}
				}
			}
			ie(), ae();
			function ie() {
				let e = r.length / 3;
				if (l) {
					let e = 0, t = k * e;
					for (let e = 0; e < N; e++) {
						let n = ne[e];
						F(n[2] + t, n[1] + t, n[0] + t);
					}
					e = s + p * 2, t = k * e;
					for (let e = 0; e < N; e++) {
						let n = ne[e];
						F(n[0] + t, n[1] + t, n[2] + t);
					}
				} else {
					for (let e = 0; e < N; e++) {
						let t = ne[e];
						F(t[2], t[1], t[0]);
					}
					for (let e = 0; e < N; e++) {
						let t = ne[e];
						F(t[0] + k * s, t[1] + k * s, t[2] + k * s);
					}
				}
				n.addGroup(e, r.length / 3 - e, 0);
			}
			function ae() {
				let e = r.length / 3, t = 0;
				oe(D, t), t += D.length;
				for (let e = 0, n = w.length; e < n; e++) {
					let n = w[e];
					oe(n, t), t += n.length;
				}
				n.addGroup(e, r.length / 3 - e, 1);
			}
			function oe(e, t) {
				let n = e.length;
				for (; --n >= 0;) {
					let r = n, i = n - 1;
					i < 0 && (i = e.length - 1);
					for (let e = 0, n = s + p * 2; e < n; e++) {
						let n = k * e, a = k * (e + 1);
						I(t + r + n, t + i + n, t + i + a, t + r + a);
					}
				}
			}
			function P(e, t, n) {
				a.push(e), a.push(t), a.push(n);
			}
			function F(e, t, i) {
				se(e), se(t), se(i);
				let a = r.length / 3, o = h.generateTopUV(n, r, a - 3, a - 2, a - 1);
				ce(o[0]), ce(o[1]), ce(o[2]);
			}
			function I(e, t, i, a) {
				se(e), se(t), se(a), se(t), se(i), se(a);
				let o = r.length / 3, s = h.generateSideWallUV(n, r, o - 6, o - 3, o - 2, o - 1);
				ce(s[0]), ce(s[1]), ce(s[3]), ce(s[1]), ce(s[2]), ce(s[3]);
			}
			function se(e) {
				r.push(a[e * 3 + 0]), r.push(a[e * 3 + 1]), r.push(a[e * 3 + 2]);
			}
			function ce(e) {
				i.push(e.x), i.push(e.y);
			}
		}
	}
	copy(e) {
		return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
	}
	toJSON() {
		let e = super.toJSON(), t = this.parameters.shapes, n = this.parameters.options;
		return op(t, n, e);
	}
	static fromJSON(t, n) {
		let r = [];
		for (let e = 0, i = t.shapes.length; e < i; e++) {
			let i = n[t.shapes[e]];
			r.push(i);
		}
		let i = t.options.extrudePath;
		return i !== void 0 && (t.options.extrudePath = new _f[i.type]().fromJSON(i)), new e(r, t.options);
	}
}, ap = {
	generateTopUV: function(e, t, n, r, i) {
		let a = t[n * 3], o = t[n * 3 + 1], s = t[r * 3], c = t[r * 3 + 1], l = t[i * 3], u = t[i * 3 + 1];
		return [
			new q(a, o),
			new q(s, c),
			new q(l, u)
		];
	},
	generateSideWallUV: function(e, t, n, r, i, a) {
		let o = t[n * 3], s = t[n * 3 + 1], c = t[n * 3 + 2], l = t[r * 3], u = t[r * 3 + 1], d = t[r * 3 + 2], f = t[i * 3], p = t[i * 3 + 1], m = t[i * 3 + 2], h = t[a * 3], g = t[a * 3 + 1], _ = t[a * 3 + 2];
		return Math.abs(s - u) < Math.abs(o - l) ? [
			new q(o, 1 - c),
			new q(l, 1 - d),
			new q(f, 1 - m),
			new q(h, 1 - _)
		] : [
			new q(s, 1 - c),
			new q(u, 1 - d),
			new q(p, 1 - m),
			new q(g, 1 - _)
		];
	}
};
function op(e, t, n) {
	if (n.shapes = [], Array.isArray(e)) for (let t = 0, r = e.length; t < r; t++) {
		let r = e[t];
		n.shapes.push(r.uuid);
	}
	else n.shapes.push(e.uuid);
	return n.options = Object.assign({}, t), t.extrudePath !== void 0 && (n.options.extrudePath = t.extrudePath.toJSON()), n;
}
var sp = class e extends Au {
	constructor(e = 1, t = 1, n = 1, r = 1) {
		super(), this.type = "PlaneGeometry", this.parameters = {
			width: e,
			height: t,
			widthSegments: n,
			heightSegments: r
		};
		let i = e / 2, a = t / 2, o = Math.floor(n), s = Math.floor(r), c = o + 1, l = s + 1, u = e / o, d = t / s, f = [], p = [], m = [], h = [];
		for (let e = 0; e < l; e++) {
			let t = e * d - a;
			for (let n = 0; n < c; n++) {
				let r = n * u - i;
				p.push(r, -t, 0), m.push(0, 0, 1), h.push(n / o), h.push(1 - e / s);
			}
		}
		for (let e = 0; e < s; e++) for (let t = 0; t < o; t++) {
			let n = t + c * e, r = t + c * (e + 1), i = t + 1 + c * (e + 1), a = t + 1 + c * e;
			f.push(n, r, a), f.push(r, i, a);
		}
		this.setIndex(f), this.setAttribute("position", new vu(p, 3)), this.setAttribute("normal", new vu(m, 3)), this.setAttribute("uv", new vu(h, 2));
	}
	copy(e) {
		return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
	}
	static fromJSON(t) {
		return new e(t.width, t.height, t.widthSegments, t.heightSegments);
	}
}, cp = class e extends Au {
	constructor(e = .5, t = 1, n = 32, r = 1, i = 0, a = Math.PI * 2) {
		super(), this.type = "RingGeometry", this.parameters = {
			innerRadius: e,
			outerRadius: t,
			thetaSegments: n,
			phiSegments: r,
			thetaStart: i,
			thetaLength: a
		}, n = Math.max(3, n), r = Math.max(1, r);
		let o = [], s = [], c = [], l = [], u = e, d = (t - e) / r, f = new J(), p = new q();
		for (let e = 0; e <= r; e++) {
			for (let e = 0; e <= n; e++) {
				let r = i + e / n * a;
				f.x = u * Math.cos(r), f.y = u * Math.sin(r), s.push(f.x, f.y, f.z), c.push(0, 0, 1), p.x = (f.x / t + 1) / 2, p.y = (f.y / t + 1) / 2, l.push(p.x, p.y);
			}
			u += d;
		}
		for (let e = 0; e < r; e++) {
			let t = e * (n + 1);
			for (let e = 0; e < n; e++) {
				let r = e + t, i = r, a = r + n + 1, s = r + n + 2, c = r + 1;
				o.push(i, a, c), o.push(a, s, c);
			}
		}
		this.setIndex(o), this.setAttribute("position", new vu(s, 3)), this.setAttribute("normal", new vu(c, 3)), this.setAttribute("uv", new vu(l, 2));
	}
	copy(e) {
		return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
	}
	static fromJSON(t) {
		return new e(t.innerRadius, t.outerRadius, t.thetaSegments, t.phiSegments, t.thetaStart, t.thetaLength);
	}
}, lp = class e extends Au {
	constructor(e = new bf([
		new q(0, .5),
		new q(-.5, -.5),
		new q(.5, -.5)
	]), t = 12) {
		super(), this.type = "ShapeGeometry", this.parameters = {
			shapes: e,
			curveSegments: t
		};
		let n = [], r = [], i = [], a = [], o = 0, s = 0;
		if (Array.isArray(e) === !1) c(e);
		else for (let t = 0; t < e.length; t++) c(e[t]), this.addGroup(o, s, t), o += s, s = 0;
		this.setIndex(n), this.setAttribute("position", new vu(r, 3)), this.setAttribute("normal", new vu(i, 3)), this.setAttribute("uv", new vu(a, 2));
		function c(e) {
			let o = r.length / 3, c = e.extractPoints(t), l = c.shape, u = c.holes;
			tp.isClockWise(l) === !1 && (l = l.reverse());
			for (let e = 0, t = u.length; e < t; e++) {
				let t = u[e];
				tp.isClockWise(t) === !0 && (u[e] = t.reverse());
			}
			let d = tp.triangulateShape(l, u);
			for (let e = 0, t = u.length; e < t; e++) {
				let t = u[e];
				l = l.concat(t);
			}
			for (let e = 0, t = l.length; e < t; e++) {
				let t = l[e];
				r.push(t.x, t.y, 0), i.push(0, 0, 1), a.push(t.x, t.y);
			}
			for (let e = 0, t = d.length; e < t; e++) {
				let t = d[e], r = t[0] + o, i = t[1] + o, a = t[2] + o;
				n.push(r, i, a), s += 3;
			}
		}
	}
	copy(e) {
		return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
	}
	toJSON() {
		let e = super.toJSON(), t = this.parameters.shapes;
		return up(t, e);
	}
	static fromJSON(t, n) {
		let r = [];
		for (let e = 0, i = t.shapes.length; e < i; e++) {
			let i = n[t.shapes[e]];
			r.push(i);
		}
		return new e(r, t.curveSegments);
	}
};
function up(e, t) {
	if (t.shapes = [], Array.isArray(e)) for (let n = 0, r = e.length; n < r; n++) {
		let r = e[n];
		t.shapes.push(r.uuid);
	}
	else t.shapes.push(e.uuid);
	return t;
}
var dp = class e extends Au {
	constructor(e = 1, t = 32, n = 16, r = 0, i = Math.PI * 2, a = 0, o = Math.PI) {
		super(), this.type = "SphereGeometry", this.parameters = {
			radius: e,
			widthSegments: t,
			heightSegments: n,
			phiStart: r,
			phiLength: i,
			thetaStart: a,
			thetaLength: o
		}, t = Math.max(3, Math.floor(t)), n = Math.max(2, Math.floor(n));
		let s = Math.min(a + o, Math.PI), c = 0, l = [], u = new J(), d = new J(), f = [], p = [], m = [], h = [];
		for (let f = 0; f <= n; f++) {
			let g = [], _ = f / n, v = a + _ * o, y = e * Math.cos(v), b = Math.sqrt(e * e - y * y), x = 0;
			f === 0 && a === 0 ? x = .5 / t : f === n && s === Math.PI && (x = -.5 / t);
			for (let e = 0; e <= t; e++) {
				let n = e / t, a = r + n * i;
				u.x = -b * Math.cos(a), u.y = y, u.z = b * Math.sin(a), p.push(u.x, u.y, u.z), d.copy(u).normalize(), m.push(d.x, d.y, d.z), h.push(n + x, 1 - _), g.push(c++);
			}
			l.push(g);
		}
		for (let e = 0; e < n; e++) for (let r = 0; r < t; r++) {
			let t = l[e][r + 1], i = l[e][r], o = l[e + 1][r], c = l[e + 1][r + 1];
			(e !== 0 || a > 0) && f.push(t, i, c), (e !== n - 1 || s < Math.PI) && f.push(i, o, c);
		}
		this.setIndex(f), this.setAttribute("position", new vu(p, 3)), this.setAttribute("normal", new vu(m, 3)), this.setAttribute("uv", new vu(h, 2));
	}
	copy(e) {
		return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
	}
	static fromJSON(t) {
		return new e(t.radius, t.widthSegments, t.heightSegments, t.phiStart, t.phiLength, t.thetaStart, t.thetaLength);
	}
};
function fp(e) {
	let t = {};
	for (let n in e) {
		t[n] = {};
		for (let r in e[n]) {
			let i = e[n][r];
			if (mp(i)) i.isRenderTargetTexture ? (W("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."), t[n][r] = null) : t[n][r] = i.clone();
			else if (Array.isArray(i)) {
				if (mp(i[0])) {
					let e = [];
					for (let t = 0, n = i.length; t < n; t++) e[t] = i[t].clone();
					t[n][r] = e;
				} else t[n][r] = i.slice();
			} else t[n][r] = i;
		}
	}
	return t;
}
function pp(e) {
	let t = {};
	for (let n = 0; n < e.length; n++) {
		let r = fp(e[n]);
		for (let e in r) t[e] = r[e];
	}
	return t;
}
function mp(e) {
	return e && (e.isColor || e.isMatrix3 || e.isMatrix4 || e.isVector2 || e.isVector3 || e.isVector4 || e.isTexture || e.isQuaternion);
}
function hp(e) {
	let t = [];
	for (let n = 0; n < e.length; n++) t.push(e[n].clone());
	return t;
}
function gp(e) {
	let t = e.getRenderTarget();
	return t === null ? e.outputColorSpace : t.isXRRenderTarget === !0 ? t.texture.colorSpace : X.workingColorSpace;
}
var _p = {
	clone: fp,
	merge: pp
}, vp = "void main() {\n	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n}", yp = "void main() {\n	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );\n}", bp = class extends Iu {
	constructor(e) {
		super(), this.isShaderMaterial = !0, this.type = "ShaderMaterial", this.defines = {}, this.uniforms = {}, this.uniformsGroups = [], this.vertexShader = vp, this.fragmentShader = yp, this.linewidth = 1, this.wireframe = !1, this.wireframeLinewidth = 1, this.fog = !1, this.lights = !1, this.clipping = !1, this.forceSinglePass = !0, this.extensions = {
			clipCullDistance: !1,
			multiDraw: !1
		}, this.defaultAttributeValues = {
			color: [
				1,
				1,
				1
			],
			uv: [0, 0],
			uv1: [0, 0]
		}, this.index0AttributeName = void 0, this.uniformsNeedUpdate = !1, this.glslVersion = null, e !== void 0 && this.setValues(e);
	}
	copy(e) {
		return super.copy(e), this.fragmentShader = e.fragmentShader, this.vertexShader = e.vertexShader, this.uniforms = fp(e.uniforms), this.uniformsGroups = hp(e.uniformsGroups), this.defines = Object.assign({}, e.defines), this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.fog = e.fog, this.lights = e.lights, this.clipping = e.clipping, this.extensions = Object.assign({}, e.extensions), this.glslVersion = e.glslVersion, this.defaultAttributeValues = Object.assign({}, e.defaultAttributeValues), this.index0AttributeName = e.index0AttributeName, this.uniformsNeedUpdate = e.uniformsNeedUpdate, this;
	}
	toJSON(e) {
		let t = super.toJSON(e);
		t.glslVersion = this.glslVersion, t.uniforms = {};
		for (let n in this.uniforms) {
			let r = this.uniforms[n].value;
			r && r.isTexture ? t.uniforms[n] = {
				type: "t",
				value: r.toJSON(e).uuid
			} : r && r.isColor ? t.uniforms[n] = {
				type: "c",
				value: r.getHex()
			} : r && r.isVector2 ? t.uniforms[n] = {
				type: "v2",
				value: r.toArray()
			} : r && r.isVector3 ? t.uniforms[n] = {
				type: "v3",
				value: r.toArray()
			} : r && r.isVector4 ? t.uniforms[n] = {
				type: "v4",
				value: r.toArray()
			} : r && r.isMatrix3 ? t.uniforms[n] = {
				type: "m3",
				value: r.toArray()
			} : r && r.isMatrix4 ? t.uniforms[n] = {
				type: "m4",
				value: r.toArray()
			} : t.uniforms[n] = { value: r };
		}
		Object.keys(this.defines).length > 0 && (t.defines = this.defines), t.vertexShader = this.vertexShader, t.fragmentShader = this.fragmentShader, t.lights = this.lights, t.clipping = this.clipping;
		let n = {};
		for (let e in this.extensions) this.extensions[e] === !0 && (n[e] = !0);
		return Object.keys(n).length > 0 && (t.extensions = n), t;
	}
	fromJSON(e, t) {
		if (super.fromJSON(e, t), e.uniforms !== void 0) for (let n in e.uniforms) {
			let r = e.uniforms[n];
			switch (this.uniforms[n] = {}, r.type) {
				case "t":
					this.uniforms[n].value = t[r.value] || null;
					break;
				case "c":
					this.uniforms[n].value = new Z().setHex(r.value);
					break;
				case "v2":
					this.uniforms[n].value = new q().fromArray(r.value);
					break;
				case "v3":
					this.uniforms[n].value = new J().fromArray(r.value);
					break;
				case "v4":
					this.uniforms[n].value = new Yc().fromArray(r.value);
					break;
				case "m3":
					this.uniforms[n].value = new Y().fromArray(r.value);
					break;
				case "m4":
					this.uniforms[n].value = new el().fromArray(r.value);
					break;
				default: this.uniforms[n].value = r.value;
			}
		}
		if (e.defines !== void 0 && (this.defines = e.defines), e.vertexShader !== void 0 && (this.vertexShader = e.vertexShader), e.fragmentShader !== void 0 && (this.fragmentShader = e.fragmentShader), e.glslVersion !== void 0 && (this.glslVersion = e.glslVersion), e.extensions !== void 0) for (let t in e.extensions) this.extensions[t] = e.extensions[t];
		return e.lights !== void 0 && (this.lights = e.lights), e.clipping !== void 0 && (this.clipping = e.clipping), this;
	}
}, xp = class extends bp {
	constructor(e) {
		super(e), this.isRawShaderMaterial = !0, this.type = "RawShaderMaterial";
	}
}, Sp = class extends Iu {
	constructor(e) {
		super(), this.isMeshLambertMaterial = !0, this.type = "MeshLambertMaterial", this.color = new Z(16777215), this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.emissive = new Z(0), this.emissiveIntensity = 1, this.emissiveMap = null, this.bumpMap = null, this.bumpScale = 1, this.normalMap = null, this.normalMapType = 0, this.normalScale = new q(1, 1), this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.specularMap = null, this.alphaMap = null, this.envMap = null, this.envMapRotation = new ul(), this.combine = 0, this.reflectivity = 1, this.envMapIntensity = 1, this.refractionRatio = .98, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.flatShading = !1, this.fog = !0, this.setValues(e);
	}
	copy(e) {
		return super.copy(e), this.color.copy(e.color), this.map = e.map, this.lightMap = e.lightMap, this.lightMapIntensity = e.lightMapIntensity, this.aoMap = e.aoMap, this.aoMapIntensity = e.aoMapIntensity, this.emissive.copy(e.emissive), this.emissiveMap = e.emissiveMap, this.emissiveIntensity = e.emissiveIntensity, this.bumpMap = e.bumpMap, this.bumpScale = e.bumpScale, this.normalMap = e.normalMap, this.normalMapType = e.normalMapType, this.normalScale.copy(e.normalScale), this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this.specularMap = e.specularMap, this.alphaMap = e.alphaMap, this.envMap = e.envMap, this.envMapRotation.copy(e.envMapRotation), this.combine = e.combine, this.reflectivity = e.reflectivity, this.envMapIntensity = e.envMapIntensity, this.refractionRatio = e.refractionRatio, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.wireframeLinecap = e.wireframeLinecap, this.wireframeLinejoin = e.wireframeLinejoin, this.flatShading = e.flatShading, this.fog = e.fog, this;
	}
}, Cp = class extends Iu {
	constructor(e) {
		super(), this.isMeshDepthMaterial = !0, this.type = "MeshDepthMaterial", this.depthPacking = ic, this.map = null, this.alphaMap = null, this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.wireframe = !1, this.wireframeLinewidth = 1, this.setValues(e);
	}
	copy(e) {
		return super.copy(e), this.depthPacking = e.depthPacking, this.map = e.map, this.alphaMap = e.alphaMap, this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this;
	}
}, wp = class extends Iu {
	constructor(e) {
		super(), this.isMeshDistanceMaterial = !0, this.type = "MeshDistanceMaterial", this.map = null, this.alphaMap = null, this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.setValues(e);
	}
	copy(e) {
		return super.copy(e), this.map = e.map, this.alphaMap = e.alphaMap, this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this;
	}
};
function Tp(e, t) {
	return !e || e.constructor === t ? e : typeof t.BYTES_PER_ELEMENT == "number" ? new t(e) : Array.prototype.slice.call(e);
}
function Ep(e) {
	return e !== void 0 && e.inTangents !== void 0 && e.outTangents !== void 0;
}
var Dp = class {
	constructor(e, t, n, r) {
		this.parameterPositions = e, this._cachedIndex = 0, this.resultBuffer = r === void 0 ? new t.constructor(n) : r, this.sampleValues = t, this.valueSize = n, this.settings = null, this.DefaultSettings_ = {};
	}
	evaluate(e) {
		let t = this.parameterPositions, n = this._cachedIndex, r = t[n], i = t[n - 1];
		validate_interval: {
			seek: {
				let a;
				linear_scan: {
					forward_scan: if (!(e < r)) {
						for (let a = n + 2;;) {
							if (r === void 0) {
								if (e < i) break forward_scan;
								return n = t.length, this._cachedIndex = n, this.copySampleValue_(n - 1);
							}
							if (n === a) break;
							if (i = r, r = t[++n], e < r) break seek;
						}
						a = t.length;
						break linear_scan;
					}
					if (!(e >= i)) {
						let o = t[1];
						e < o && (n = 2, i = o);
						for (let a = n - 2;;) {
							if (i === void 0) return this._cachedIndex = 0, this.copySampleValue_(0);
							if (n === a) break;
							if (r = i, i = t[--n - 1], e >= i) break seek;
						}
						a = n, n = 0;
						break linear_scan;
					}
					break validate_interval;
				}
				for (; n < a;) {
					let r = n + a >>> 1;
					e < t[r] ? a = r : n = r + 1;
				}
				if (r = t[n], i = t[n - 1], i === void 0) return this._cachedIndex = 0, this.copySampleValue_(0);
				if (r === void 0) return n = t.length, this._cachedIndex = n, this.copySampleValue_(n - 1);
			}
			this._cachedIndex = n, this.intervalChanged_(n, i, r);
		}
		return this.interpolate_(n, i, e, r);
	}
	getSettings_() {
		return this.settings || this.DefaultSettings_;
	}
	copySampleValue_(e) {
		let t = this.resultBuffer, n = this.sampleValues, r = this.valueSize, i = e * r;
		for (let e = 0; e !== r; ++e) t[e] = n[i + e];
		return t;
	}
	interpolate_() {
		throw Error("THREE.Interpolant: Call to abstract method.");
	}
	intervalChanged_() {}
}, Op = class extends Dp {
	constructor(e, t, n, r) {
		super(e, t, n, r), this._weightPrev = -0, this._offsetPrev = -0, this._weightNext = -0, this._offsetNext = -0, this.DefaultSettings_ = {
			endingStart: tc,
			endingEnd: tc
		};
	}
	intervalChanged_(e, t, n) {
		let r = this.parameterPositions, i = e - 2, a = e + 1, o = r[i], s = r[a];
		if (o === void 0) switch (this.getSettings_().endingStart) {
			case nc:
				i = e, o = 2 * t - n;
				break;
			case rc:
				i = r.length - 2, o = t + r[i] - r[i + 1];
				break;
			default: i = e, o = n;
		}
		if (s === void 0) switch (this.getSettings_().endingEnd) {
			case nc:
				a = e, s = 2 * n - t;
				break;
			case rc:
				a = 1, s = n + r[1] - r[0];
				break;
			default: a = e - 1, s = t;
		}
		let c = (n - t) * .5, l = this.valueSize;
		this._weightPrev = c / (t - o), this._weightNext = c / (s - n), this._offsetPrev = i * l, this._offsetNext = a * l;
	}
	interpolate_(e, t, n, r) {
		let i = this.resultBuffer, a = this.sampleValues, o = this.valueSize, s = e * o, c = s - o, l = this._offsetPrev, u = this._offsetNext, d = this._weightPrev, f = this._weightNext, p = (n - t) / (r - t), m = p * p, h = m * p, g = -d * h + 2 * d * m - d * p, _ = (1 + d) * h + (-1.5 - 2 * d) * m + (-.5 + d) * p + 1, v = (-1 - f) * h + (1.5 + f) * m + .5 * p, y = f * h - f * m;
		for (let e = 0; e !== o; ++e) i[e] = g * a[l + e] + _ * a[c + e] + v * a[s + e] + y * a[u + e];
		return i;
	}
}, kp = class extends Dp {
	constructor(e, t, n, r) {
		super(e, t, n, r);
	}
	interpolate_(e, t, n, r) {
		let i = this.resultBuffer, a = this.sampleValues, o = this.valueSize, s = e * o, c = s - o, l = (n - t) / (r - t), u = 1 - l;
		for (let e = 0; e !== o; ++e) i[e] = a[c + e] * u + a[s + e] * l;
		return i;
	}
}, Ap = class extends Dp {
	constructor(e, t, n, r) {
		super(e, t, n, r);
	}
	interpolate_(e) {
		return this.copySampleValue_(e - 1);
	}
}, jp = class extends Dp {
	interpolate_(e, t, n, r) {
		let i = this.resultBuffer, a = this.sampleValues, o = this.valueSize, s = e * o, c = s - o, l = this.inTangents, u = this.outTangents;
		if (!l || !u) {
			let e = (n - t) / (r - t), l = 1 - e;
			for (let t = 0; t !== o; ++t) i[t] = a[c + t] * l + a[s + t] * e;
			return i;
		}
		let d = o * 2, f = e - 1;
		for (let p = 0; p !== o; ++p) {
			let o = a[c + p], m = a[s + p], h = f * d + p * 2, g = u[h], _ = u[h + 1], v = e * d + p * 2, y = l[v], b = l[v + 1], x = Pp(n, t, g, y, r);
			i[p] = Mp(x, o, _, b, m);
		}
		return i;
	}
};
function Mp(e, t, n, r, i) {
	let a = 1 - e;
	return a * a * a * t + 3 * a * a * e * n + 3 * a * e * e * r + e * e * e * i;
}
function Np(e, t, n, r, i) {
	let a = 1 - e;
	return 3 * a * a * (n - t) + 6 * a * e * (r - n) + 3 * e * e * (i - r);
}
function Pp(e, t, n, r, i) {
	let a = (e - t) / (i - t);
	for (let o = 0; o < 8; o++) {
		let o = Mp(a, t, n, r, i) - e;
		if (Math.abs(o) < 1e-10) break;
		let s = Np(a, t, n, r, i);
		if (Math.abs(s) < 1e-10) break;
		a = Math.max(0, Math.min(1, a - o / s));
	}
	return a;
}
var Fp = class {
	constructor(e, t, n, r) {
		if (e === void 0) throw Error("THREE.KeyframeTrack: track name is undefined");
		if (t === void 0 || t.length === 0) throw Error("THREE.KeyframeTrack: no keyframes in track named " + e);
		this.name = e, this.times = Tp(t, this.TimeBufferType), this.values = Tp(n, this.ValueBufferType), this.setInterpolation(r || this.DefaultInterpolation);
	}
	static toJSON(e) {
		let t = e.constructor, n;
		if (t.toJSON !== this.toJSON) n = t.toJSON(e);
		else {
			n = {
				name: e.name,
				times: Tp(e.times, Array),
				values: Tp(e.values, Array)
			};
			let t = e.getInterpolation();
			t !== e.DefaultInterpolation && (n.interpolation = t), Ep(e.settings) && (n.settings = {
				inTangents: Tp(e.settings.inTangents, Array),
				outTangents: Tp(e.settings.outTangents, Array)
			});
		}
		return n.type = e.ValueTypeName, n;
	}
	InterpolantFactoryMethodDiscrete(e) {
		return new Ap(this.times, this.values, this.getValueSize(), e);
	}
	InterpolantFactoryMethodLinear(e) {
		return new kp(this.times, this.values, this.getValueSize(), e);
	}
	InterpolantFactoryMethodSmooth(e) {
		return new Op(this.times, this.values, this.getValueSize(), e);
	}
	InterpolantFactoryMethodBezier(e) {
		let t = new jp(this.times, this.values, this.getValueSize(), e);
		return this.settings && (t.inTangents = this.settings.inTangents, t.outTangents = this.settings.outTangents), t;
	}
	setInterpolation(e) {
		let t;
		switch (e) {
			case Zs:
				t = this.InterpolantFactoryMethodDiscrete;
				break;
			case Qs:
				t = this.InterpolantFactoryMethodLinear;
				break;
			case $s:
				t = this.InterpolantFactoryMethodSmooth;
				break;
			case ec: t = this.InterpolantFactoryMethodBezier;
		}
		if (t === void 0) {
			let t = "unsupported interpolation for " + this.ValueTypeName + " keyframe track named " + this.name;
			if (this.createInterpolant === void 0) {
				if (e !== this.DefaultInterpolation) this.setInterpolation(this.DefaultInterpolation);
				else throw Error(t);
			}
			return W("KeyframeTrack:", t), this;
		}
		return this.createInterpolant = t, this;
	}
	getInterpolation() {
		switch (this.createInterpolant) {
			case this.InterpolantFactoryMethodDiscrete: return Zs;
			case this.InterpolantFactoryMethodLinear: return Qs;
			case this.InterpolantFactoryMethodSmooth: return $s;
			case this.InterpolantFactoryMethodBezier: return ec;
		}
	}
	getValueSize() {
		return this.values.length / this.times.length;
	}
	shift(e) {
		if (e !== 0) {
			let t = this.times;
			for (let n = 0, r = t.length; n !== r; ++n) t[n] += e;
		}
		return this;
	}
	scale(e) {
		if (e !== 1) {
			let t = this.times;
			for (let n = 0, r = t.length; n !== r; ++n) t[n] *= e;
			Ep(this.settings) && (Ip(this.settings.inTangents, e), Ip(this.settings.outTangents, e));
		}
		return this;
	}
	trim(e, t) {
		let n = this.times, r = n.length, i = 0, a = r - 1;
		for (; i !== r && n[i] < e;) ++i;
		for (; a !== -1 && n[a] > t;) --a;
		if (++a, i !== 0 || a !== r) {
			i >= a && (a = Math.max(a, 1), i = a - 1);
			let e = this.getValueSize();
			this.times = n.slice(i, a), this.values = this.values.slice(i * e, a * e);
		}
		return this;
	}
	validate() {
		let e = !0, t = this.getValueSize();
		t - Math.floor(t) !== 0 && (G("KeyframeTrack: Invalid value size in track.", this), e = !1);
		let n = this.times, r = this.values, i = n.length;
		i === 0 && (G("KeyframeTrack: Track is empty.", this), e = !1);
		let a = null;
		for (let t = 0; t !== i; t++) {
			let r = n[t];
			if (typeof r == "number" && isNaN(r)) {
				G("KeyframeTrack: Time is not a valid number.", this, t, r), e = !1;
				break;
			}
			if (a !== null && a > r) {
				G("KeyframeTrack: Out of order keys.", this, t, r, a), e = !1;
				break;
			}
			a = r;
		}
		if (r !== void 0 && mc(r)) for (let t = 0, n = r.length; t !== n; ++t) {
			let n = r[t];
			if (isNaN(n)) {
				G("KeyframeTrack: Value is not a valid number.", this, t, n), e = !1;
				break;
			}
		}
		return e;
	}
	optimize() {
		let e = this.times.slice(), t = this.values.slice(), n = this.getValueSize(), r = this.getInterpolation() === $s, i = e.length - 1, a = 1;
		for (let o = 1; o < i; ++o) {
			let i = !1, s = e[o];
			if (s !== e[o + 1] && (o !== 1 || s !== e[0])) {
				if (r) i = !0;
				else {
					let e = o * n, r = e - n, a = e + n;
					for (let o = 0; o !== n; ++o) {
						let n = t[e + o];
						if (n !== t[r + o] || n !== t[a + o]) {
							i = !0;
							break;
						}
					}
				}
			}
			if (i) {
				if (o !== a) {
					e[a] = e[o];
					let r = o * n, i = a * n;
					for (let e = 0; e !== n; ++e) t[i + e] = t[r + e];
				}
				++a;
			}
		}
		if (i > 0) {
			e[a] = e[i];
			for (let e = i * n, r = a * n, o = 0; o !== n; ++o) t[r + o] = t[e + o];
			++a;
		}
		return a === e.length ? (this.times = e, this.values = t) : (this.times = e.slice(0, a), this.values = t.slice(0, a * n)), this;
	}
	clone() {
		let e = this.times.slice(), t = this.values.slice(), n = this.constructor, r = new n(this.name, e, t);
		return r.createInterpolant = this.createInterpolant, Ep(this.settings) && (r.settings = {
			inTangents: this.settings.inTangents.slice(),
			outTangents: this.settings.outTangents.slice()
		}), r;
	}
};
function Ip(e, t) {
	for (let n = 0, r = e.length; n !== r; n += 2) e[n] *= t;
}
Fp.prototype.ValueTypeName = "", Fp.prototype.TimeBufferType = Float32Array, Fp.prototype.ValueBufferType = Float32Array, Fp.prototype.DefaultInterpolation = Qs;
var Lp = class extends Fp {
	constructor(e, t, n) {
		super(e, t, n);
	}
};
Lp.prototype.ValueTypeName = "bool", Lp.prototype.ValueBufferType = Array, Lp.prototype.DefaultInterpolation = Zs, Lp.prototype.InterpolantFactoryMethodLinear = void 0, Lp.prototype.InterpolantFactoryMethodSmooth = void 0;
var Rp = class extends Fp {
	constructor(e, t, n, r) {
		super(e, t, n, r);
	}
};
Rp.prototype.ValueTypeName = "color";
var zp = class extends Fp {
	constructor(e, t, n, r) {
		super(e, t, n, r);
	}
};
zp.prototype.ValueTypeName = "number";
var Bp = class extends Dp {
	constructor(e, t, n, r) {
		super(e, t, n, r);
	}
	interpolate_(e, t, n, r) {
		let i = this.resultBuffer, a = this.sampleValues, o = this.valueSize, s = (n - t) / (r - t), c = e * o;
		for (let e = c + o; c !== e; c += 4) Mc.slerpFlat(i, 0, a, c - o, a, c, s);
		return i;
	}
}, Vp = class extends Fp {
	constructor(e, t, n, r) {
		super(e, t, n, r);
	}
	InterpolantFactoryMethodLinear(e) {
		return new Bp(this.times, this.values, this.getValueSize(), e);
	}
};
Vp.prototype.ValueTypeName = "quaternion", Vp.prototype.InterpolantFactoryMethodSmooth = void 0;
var Hp = class extends Fp {
	constructor(e, t, n) {
		super(e, t, n);
	}
};
Hp.prototype.ValueTypeName = "string", Hp.prototype.ValueBufferType = Array, Hp.prototype.DefaultInterpolation = Zs, Hp.prototype.InterpolantFactoryMethodLinear = void 0, Hp.prototype.InterpolantFactoryMethodSmooth = void 0;
var Up = class extends Fp {
	constructor(e, t, n, r) {
		super(e, t, n, r);
	}
};
Up.prototype.ValueTypeName = "vector";
var Wp = class extends Dl {
	constructor(e, t = 1) {
		super(), this.isLight = !0, this.type = "Light", this.color = new Z(e), this.intensity = t;
	}
	copy(e, t) {
		return super.copy(e, t), this.color.copy(e.color), this.intensity = e.intensity, this;
	}
	toJSON(e) {
		let t = super.toJSON(e);
		return t.object.color = this.color.getHex(), t.object.intensity = this.intensity, t;
	}
}, Gp = class extends Wp {
	constructor(e, t, n) {
		super(e, n), this.isHemisphereLight = !0, this.type = "HemisphereLight", this.position.copy(Dl.DEFAULT_UP), this.updateMatrix(), this.groundColor = new Z(t);
	}
	copy(e, t) {
		return super.copy(e, t), this.groundColor.copy(e.groundColor), this;
	}
	toJSON(e) {
		let t = super.toJSON(e);
		return t.object.groundColor = this.groundColor.getHex(), t;
	}
}, Kp = /*@__PURE__*/ new el(), qp = /*@__PURE__*/ new J(), Jp = /*@__PURE__*/ new J(), Yp = class {
	constructor(e) {
		this.camera = e, this.intensity = 1, this.bias = 0, this.biasNode = null, this.normalBias = 0, this.radius = 1, this.blurSamples = 8, this.mapSize = new q(512, 512), this.mapType = Ko, this.map = null, this.mapPass = null, this.matrix = new el(), this.autoUpdate = !0, this.needsUpdate = !1, this._frustum = new gd(), this._frameExtents = new q(1, 1), this._viewportCount = 1, this._viewports = [new Yc(0, 0, 1, 1)];
	}
	getViewportCount() {
		return this._viewportCount;
	}
	getCamera() {
		return this.camera;
	}
	getFrustum() {
		return this._frustum;
	}
	updateMatrices(e) {
		let t = this.camera;
		qp.setFromMatrixPosition(e.matrixWorld), t.position.copy(qp), Jp.setFromMatrixPosition(e.target.matrixWorld), t.lookAt(Jp), t.updateMatrixWorld(), this._updateMatrix(t, this.matrix, this._frustum);
	}
	_updateMatrix(e, t, n, r) {
		Kp.multiplyMatrices(e.projectionMatrix, e.matrixWorldInverse), n.setFromProjectionMatrix(Kp, e.coordinateSystem, e.reversedDepth);
		let i = this._frameExtents, a = r ? r.z / i.x : 1, o = r ? r.w / i.y : 1, s = r ? r.x / i.x : 0, c = r ? r.y / i.y : 0;
		e.coordinateSystem === 2001 || e.reversedDepth ? t.set(.5 * a, 0, 0, .5 * a + s, 0, .5 * o, 0, .5 * o + c, 0, 0, 1, 0, 0, 0, 0, 1) : t.set(.5 * a, 0, 0, .5 * a + s, 0, .5 * o, 0, .5 * o + c, 0, 0, .5, .5, 0, 0, 0, 1), t.multiply(Kp);
	}
	getViewport(e) {
		return this._viewports[e];
	}
	getFrameExtents() {
		return this._frameExtents;
	}
	dispose() {
		this.map && this.map.dispose(), this.mapPass && this.mapPass.dispose();
	}
	copy(e) {
		return this.camera = e.camera.clone(), this.intensity = e.intensity, this.bias = e.bias, this.radius = e.radius, this.autoUpdate = e.autoUpdate, this.needsUpdate = e.needsUpdate, this.normalBias = e.normalBias, this.blurSamples = e.blurSamples, this.mapSize.copy(e.mapSize), this.biasNode = e.biasNode, this;
	}
	clone() {
		return new this.constructor().copy(this);
	}
	toJSON() {
		let e = {};
		return e.intensity = this.intensity, e.bias = this.bias, e.normalBias = this.normalBias, e.radius = this.radius, e.blurSamples = this.blurSamples, e.mapSize = this.mapSize.toArray(), e.camera = this.camera.toJSON(!1).object, delete e.camera.matrix, e;
	}
}, Xp = /*@__PURE__*/ new J(), Zp = /*@__PURE__*/ new Mc(), Qp = /*@__PURE__*/ new J(), $p = class extends Dl {
	constructor() {
		super(), this.isCamera = !0, this.type = "Camera", this.matrixWorldInverse = new el(), this.projectionMatrix = new el(), this.projectionMatrixInverse = new el(), this.coordinateSystem = fc, this._reversedDepth = !1;
	}
	get reversedDepth() {
		return this._reversedDepth;
	}
	copy(e, t) {
		return super.copy(e, t), this.matrixWorldInverse.copy(e.matrixWorldInverse), this.projectionMatrix.copy(e.projectionMatrix), this.projectionMatrixInverse.copy(e.projectionMatrixInverse), this.coordinateSystem = e.coordinateSystem, this;
	}
	getWorldDirection(e) {
		return super.getWorldDirection(e).negate();
	}
	updateMatrixWorld(e) {
		super.updateMatrixWorld(e), this.matrixWorld.decompose(Xp, Zp, Qp), Qp.x === 1 && Qp.y === 1 && Qp.z === 1 ? this.matrixWorldInverse.copy(this.matrixWorld).invert() : this.matrixWorldInverse.compose(Xp, Zp, Qp.set(1, 1, 1)).invert();
	}
	updateWorldMatrix(e, t, n = !1) {
		super.updateWorldMatrix(e, t, n), this.matrixWorld.decompose(Xp, Zp, Qp), Qp.x === 1 && Qp.y === 1 && Qp.z === 1 ? this.matrixWorldInverse.copy(this.matrixWorld).invert() : this.matrixWorldInverse.compose(Xp, Zp, Qp.set(1, 1, 1)).invert();
	}
	clone() {
		return new this.constructor().copy(this);
	}
}, em = /*@__PURE__*/ new J(), tm = /*@__PURE__*/ new q(), nm = /*@__PURE__*/ new q(), rm = class extends $p {
	constructor(e = 50, t = 1, n = .1, r = 2e3) {
		super(), this.isPerspectiveCamera = !0, this.type = "PerspectiveCamera", this.fov = e, this.zoom = 1, this.near = n, this.far = r, this.focus = 10, this.aspect = t, this.view = null, this.filmGauge = 35, this.filmOffset = 0, this.updateProjectionMatrix();
	}
	copy(e, t) {
		return super.copy(e, t), this.fov = e.fov, this.zoom = e.zoom, this.near = e.near, this.far = e.far, this.focus = e.focus, this.aspect = e.aspect, this.view = e.view === null ? null : Object.assign({}, e.view), this.filmGauge = e.filmGauge, this.filmOffset = e.filmOffset, this;
	}
	setFocalLength(e) {
		let t = .5 * this.getFilmHeight() / e;
		this.fov = Ec * 2 * Math.atan(t), this.updateProjectionMatrix();
	}
	getFocalLength() {
		let e = Math.tan(Tc * .5 * this.fov);
		return .5 * this.getFilmHeight() / e;
	}
	getEffectiveFOV() {
		return Ec * 2 * Math.atan(Math.tan(Tc * .5 * this.fov) / this.zoom);
	}
	getFilmWidth() {
		return this.filmGauge * Math.min(this.aspect, 1);
	}
	getFilmHeight() {
		return this.filmGauge / Math.max(this.aspect, 1);
	}
	getViewBounds(e, t, n) {
		em.set(-1, -1, .5).applyMatrix4(this.projectionMatrixInverse), t.set(em.x, em.y).multiplyScalar(-e / em.z), em.set(1, 1, .5).applyMatrix4(this.projectionMatrixInverse), n.set(em.x, em.y).multiplyScalar(-e / em.z);
	}
	getViewSize(e, t) {
		return this.getViewBounds(e, tm, nm), t.subVectors(nm, tm);
	}
	setViewOffset(e, t, n, r, i, a) {
		this.aspect = e / t, this.view === null && (this.view = {
			enabled: !0,
			fullWidth: 1,
			fullHeight: 1,
			offsetX: 0,
			offsetY: 0,
			width: 1,
			height: 1
		}), this.view.enabled = !0, this.view.fullWidth = e, this.view.fullHeight = t, this.view.offsetX = n, this.view.offsetY = r, this.view.width = i, this.view.height = a, this.updateProjectionMatrix();
	}
	clearViewOffset() {
		this.view !== null && (this.view.enabled = !1), this.updateProjectionMatrix();
	}
	updateProjectionMatrix() {
		let e = this.near, t = e * Math.tan(Tc * .5 * this.fov) / this.zoom, n = 2 * t, r = this.aspect * n, i = -.5 * r, a = this.view;
		if (this.view !== null && this.view.enabled) {
			let e = a.fullWidth, o = a.fullHeight;
			i += a.offsetX * r / e, t -= a.offsetY * n / o, r *= a.width / e, n *= a.height / o;
		}
		let o = this.filmOffset;
		o !== 0 && (i += e * o / this.getFilmWidth()), this.projectionMatrix.makePerspective(i, i + r, t, t - n, e, this.far, this.coordinateSystem, this.reversedDepth), this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
	}
	toJSON(e) {
		let t = super.toJSON(e);
		return t.object.fov = this.fov, t.object.zoom = this.zoom, t.object.near = this.near, t.object.far = this.far, t.object.focus = this.focus, t.object.aspect = this.aspect, this.view !== null && (t.object.view = Object.assign({}, this.view)), t.object.filmGauge = this.filmGauge, t.object.filmOffset = this.filmOffset, t;
	}
}, im = class extends $p {
	constructor(e = -1, t = 1, n = 1, r = -1, i = .1, a = 2e3) {
		super(), this.isOrthographicCamera = !0, this.type = "OrthographicCamera", this.zoom = 1, this.view = null, this.left = e, this.right = t, this.top = n, this.bottom = r, this.near = i, this.far = a, this.updateProjectionMatrix();
	}
	copy(e, t) {
		return super.copy(e, t), this.left = e.left, this.right = e.right, this.top = e.top, this.bottom = e.bottom, this.near = e.near, this.far = e.far, this.zoom = e.zoom, this.view = e.view === null ? null : Object.assign({}, e.view), this;
	}
	setViewOffset(e, t, n, r, i, a) {
		this.view === null && (this.view = {
			enabled: !0,
			fullWidth: 1,
			fullHeight: 1,
			offsetX: 0,
			offsetY: 0,
			width: 1,
			height: 1
		}), this.view.enabled = !0, this.view.fullWidth = e, this.view.fullHeight = t, this.view.offsetX = n, this.view.offsetY = r, this.view.width = i, this.view.height = a, this.updateProjectionMatrix();
	}
	clearViewOffset() {
		this.view !== null && (this.view.enabled = !1), this.updateProjectionMatrix();
	}
	updateProjectionMatrix() {
		let e = (this.right - this.left) / (2 * this.zoom), t = (this.top - this.bottom) / (2 * this.zoom), n = (this.right + this.left) / 2, r = (this.top + this.bottom) / 2, i = n - e, a = n + e, o = r + t, s = r - t;
		if (this.view !== null && this.view.enabled) {
			let e = (this.right - this.left) / this.view.fullWidth / this.zoom, t = (this.top - this.bottom) / this.view.fullHeight / this.zoom;
			i += e * this.view.offsetX, a = i + e * this.view.width, o -= t * this.view.offsetY, s = o - t * this.view.height;
		}
		this.projectionMatrix.makeOrthographic(i, a, o, s, this.near, this.far, this.coordinateSystem, this.reversedDepth), this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
	}
	toJSON(e) {
		let t = super.toJSON(e);
		return t.object.zoom = this.zoom, t.object.left = this.left, t.object.right = this.right, t.object.top = this.top, t.object.bottom = this.bottom, t.object.near = this.near, t.object.far = this.far, this.view !== null && (t.object.view = Object.assign({}, this.view)), t;
	}
}, am = class extends Yp {
	constructor() {
		super(new im(-5, 5, 5, -5, .5, 500)), this.isDirectionalLightShadow = !0;
	}
}, om = class extends Wp {
	constructor(e, t) {
		super(e, t), this.isDirectionalLight = !0, this.type = "DirectionalLight", this.position.copy(Dl.DEFAULT_UP), this.updateMatrix(), this.target = new Dl(), this.shadow = new am();
	}
	dispose() {
		super.dispose(), this.shadow.dispose();
	}
	copy(e) {
		return super.copy(e), this.target = e.target.clone(), this.shadow = e.shadow.clone(), this;
	}
	toJSON(e) {
		let t = super.toJSON(e);
		return t.object.shadow = this.shadow.toJSON(), t.object.target = this.target.uuid, t;
	}
}, sm = -90, cm = 1, lm = class extends Dl {
	constructor(e, t, n) {
		super(), this.type = "CubeCamera", this.renderTarget = n, this.coordinateSystem = null, this.activeMipmapLevel = 0;
		let r = new rm(sm, cm, e, t);
		r.layers = this.layers, this.add(r);
		let i = new rm(sm, cm, e, t);
		i.layers = this.layers, this.add(i);
		let a = new rm(sm, cm, e, t);
		a.layers = this.layers, this.add(a);
		let o = new rm(sm, cm, e, t);
		o.layers = this.layers, this.add(o);
		let s = new rm(sm, cm, e, t);
		s.layers = this.layers, this.add(s);
		let c = new rm(sm, cm, e, t);
		c.layers = this.layers, this.add(c);
	}
	updateCoordinateSystem() {
		let e = this.coordinateSystem, t = this.children.concat(), [n, r, i, a, o, s] = t;
		for (let e of t) this.remove(e);
		if (e === 2e3) n.up.set(0, 1, 0), n.lookAt(1, 0, 0), r.up.set(0, 1, 0), r.lookAt(-1, 0, 0), i.up.set(0, 0, -1), i.lookAt(0, 1, 0), a.up.set(0, 0, 1), a.lookAt(0, -1, 0), o.up.set(0, 1, 0), o.lookAt(0, 0, 1), s.up.set(0, 1, 0), s.lookAt(0, 0, -1);
		else if (e === 2001) n.up.set(0, -1, 0), n.lookAt(-1, 0, 0), r.up.set(0, -1, 0), r.lookAt(1, 0, 0), i.up.set(0, 0, 1), i.lookAt(0, 1, 0), a.up.set(0, 0, -1), a.lookAt(0, -1, 0), o.up.set(0, -1, 0), o.lookAt(0, 0, 1), s.up.set(0, -1, 0), s.lookAt(0, 0, -1);
		else throw Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: " + e);
		for (let e of t) this.add(e), e.updateMatrixWorld();
	}
	update(e, t) {
		this.parent === null && this.updateMatrixWorld();
		let { renderTarget: n, activeMipmapLevel: r } = this;
		this.coordinateSystem !== e.coordinateSystem && (this.coordinateSystem = e.coordinateSystem, this.updateCoordinateSystem());
		let [i, a, o, s, c, l] = this.children, u = e.getRenderTarget(), d = e.getActiveCubeFace(), f = e.getActiveMipmapLevel(), p = e.xr.enabled;
		e.xr.enabled = !1;
		let m = n.texture.generateMipmaps;
		n.texture.generateMipmaps = !1;
		let h = !1;
		h = e.isWebGLRenderer === !0 ? e.state.buffers.depth.getReversed() : e.reversedDepthBuffer, e.setRenderTarget(n, 0, r), h && e.autoClear === !1 && e.clearDepth(), e.render(t, i), e.setRenderTarget(n, 1, r), h && e.autoClear === !1 && e.clearDepth(), e.render(t, a), e.setRenderTarget(n, 2, r), h && e.autoClear === !1 && e.clearDepth(), e.render(t, o), e.setRenderTarget(n, 3, r), h && e.autoClear === !1 && e.clearDepth(), e.render(t, s), e.setRenderTarget(n, 4, r), h && e.autoClear === !1 && e.clearDepth(), e.render(t, c), n.texture.generateMipmaps = m, e.setRenderTarget(n, 5, r), h && e.autoClear === !1 && e.clearDepth(), e.render(t, l), e.setRenderTarget(u, d, f), e.xr.enabled = p, n.texture.needsPMREMUpdate = !0;
	}
}, um = class extends rm {
	constructor(e = []) {
		super(), this.isArrayCamera = !0, this.isMultiViewCamera = !1, this.cameras = e;
	}
}, dm = "\\[\\]\\.:\\/", fm = /* @__PURE__ */ RegExp("[\\[\\]\\.:\\/]", "g"), pm = "[^\\[\\]\\.:\\/]", mm = "[^" + dm.replace("\\.", "") + "]", hm = /*@__PURE__*/ "((?:WC+[\\/:])*)".replace("WC", pm), gm = /*@__PURE__*/ "(WCOD+)?".replace("WCOD", mm), _m = /*@__PURE__*/ "(?:\\.(WC+)(?:\\[(.+)\\])?)?".replace("WC", pm), vm = /*@__PURE__*/ "\\.(WC+)(?:\\[(.+)\\])?".replace("WC", pm), ym = RegExp("^" + hm + gm + _m + vm + "$"), bm = [
	"material",
	"materials",
	"bones",
	"map"
], xm = class {
	constructor(e, t, n) {
		let r = n || Sm.parseTrackName(t);
		this._targetGroup = e, this._bindings = e.subscribe_(t, r);
	}
	getValue(e, t) {
		this.bind();
		let n = this._targetGroup.nCachedObjects_, r = this._bindings[n];
		r !== void 0 && r.getValue(e, t);
	}
	setValue(e, t) {
		let n = this._bindings;
		for (let r = this._targetGroup.nCachedObjects_, i = n.length; r !== i; ++r) n[r].setValue(e, t);
	}
	bind() {
		let e = this._bindings;
		for (let t = this._targetGroup.nCachedObjects_, n = e.length; t !== n; ++t) e[t].bind();
	}
	unbind() {
		let e = this._bindings;
		for (let t = this._targetGroup.nCachedObjects_, n = e.length; t !== n; ++t) e[t].unbind();
	}
}, Sm = class e {
	constructor(t, n, r) {
		this.path = n, this.parsedPath = r || e.parseTrackName(n), this.node = e.findNode(t, this.parsedPath.nodeName), this.rootNode = t, this.getValue = this._getValue_unbound, this.setValue = this._setValue_unbound;
	}
	static create(t, n, r) {
		return t && t.isAnimationObjectGroup ? new e.Composite(t, n, r) : new e(t, n, r);
	}
	static sanitizeNodeName(e) {
		return e.replace(/\s/g, "_").replace(fm, "");
	}
	static parseTrackName(e) {
		let t = ym.exec(e);
		if (t === null) throw Error("THREE.PropertyBinding: Cannot parse trackName: " + e);
		let n = {
			nodeName: t[2],
			objectName: t[3],
			objectIndex: t[4],
			propertyName: t[5],
			propertyIndex: t[6]
		}, r = n.nodeName && n.nodeName.lastIndexOf(".");
		if (r !== void 0 && r !== -1) {
			let e = n.nodeName.substring(r + 1);
			bm.indexOf(e) !== -1 && (n.nodeName = n.nodeName.substring(0, r), n.objectName = e);
		}
		if (n.propertyName === null || n.propertyName.length === 0) throw Error("THREE.PropertyBinding: can not parse propertyName from trackName: " + e);
		return n;
	}
	static findNode(e, t) {
		if (t === void 0 || t === "" || t === "." || t === -1 || t === e.name || t === e.uuid) return e;
		if (e.skeleton) {
			let n = e.skeleton.getBoneByName(t);
			if (n !== void 0) return n;
		}
		if (e.children) {
			let n = function(e) {
				for (let r = 0; r < e.length; r++) {
					let i = e[r];
					if (i.name === t || i.uuid === t) return i;
					let a = n(i.children);
					if (a) return a;
				}
				return null;
			}, r = n(e.children);
			if (r) return r;
		}
		return null;
	}
	_getValue_unavailable() {}
	_setValue_unavailable() {}
	_getValue_direct(e, t) {
		e[t] = this.targetObject[this.propertyName];
	}
	_getValue_array(e, t) {
		let n = this.resolvedProperty;
		for (let r = 0, i = n.length; r !== i; ++r) e[t++] = n[r];
	}
	_getValue_arrayElement(e, t) {
		e[t] = this.resolvedProperty[this.propertyIndex];
	}
	_getValue_toArray(e, t) {
		this.resolvedProperty.toArray(e, t);
	}
	_setValue_direct(e, t) {
		this.targetObject[this.propertyName] = e[t];
	}
	_setValue_direct_setNeedsUpdate(e, t) {
		this.targetObject[this.propertyName] = e[t], this.targetObject.needsUpdate = !0;
	}
	_setValue_direct_setMatrixWorldNeedsUpdate(e, t) {
		this.targetObject[this.propertyName] = e[t], this.targetObject.matrixWorldNeedsUpdate = !0;
	}
	_setValue_array(e, t) {
		let n = this.resolvedProperty;
		for (let r = 0, i = n.length; r !== i; ++r) n[r] = e[t++];
	}
	_setValue_array_setNeedsUpdate(e, t) {
		let n = this.resolvedProperty;
		for (let r = 0, i = n.length; r !== i; ++r) n[r] = e[t++];
		this.targetObject.needsUpdate = !0;
	}
	_setValue_array_setMatrixWorldNeedsUpdate(e, t) {
		let n = this.resolvedProperty;
		for (let r = 0, i = n.length; r !== i; ++r) n[r] = e[t++];
		this.targetObject.matrixWorldNeedsUpdate = !0;
	}
	_setValue_arrayElement(e, t) {
		this.resolvedProperty[this.propertyIndex] = e[t];
	}
	_setValue_arrayElement_setNeedsUpdate(e, t) {
		this.resolvedProperty[this.propertyIndex] = e[t], this.targetObject.needsUpdate = !0;
	}
	_setValue_arrayElement_setMatrixWorldNeedsUpdate(e, t) {
		this.resolvedProperty[this.propertyIndex] = e[t], this.targetObject.matrixWorldNeedsUpdate = !0;
	}
	_setValue_fromArray(e, t) {
		this.resolvedProperty.fromArray(e, t);
	}
	_setValue_fromArray_setNeedsUpdate(e, t) {
		this.resolvedProperty.fromArray(e, t), this.targetObject.needsUpdate = !0;
	}
	_setValue_fromArray_setMatrixWorldNeedsUpdate(e, t) {
		this.resolvedProperty.fromArray(e, t), this.targetObject.matrixWorldNeedsUpdate = !0;
	}
	_getValue_unbound(e, t) {
		this.bind(), this.getValue(e, t);
	}
	_setValue_unbound(e, t) {
		this.bind(), this.setValue(e, t);
	}
	bind() {
		let t = this.node, n = this.parsedPath, r = n.objectName, i = n.propertyName, a = n.propertyIndex;
		if (t || (t = e.findNode(this.rootNode, n.nodeName), this.node = t), this.getValue = this._getValue_unavailable, this.setValue = this._setValue_unavailable, !t) {
			W("PropertyBinding: No target node found for track: " + this.path + ".");
			return;
		}
		if (r) {
			let e = n.objectIndex;
			switch (r) {
				case "materials":
					if (!t.material) {
						G("PropertyBinding: Can not bind to material as node does not have a material.", this);
						return;
					}
					if (!t.material.materials) {
						G("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.", this);
						return;
					}
					t = t.material.materials;
					break;
				case "bones":
					if (!t.skeleton) {
						G("PropertyBinding: Can not bind to bones as node does not have a skeleton.", this);
						return;
					}
					t = t.skeleton.bones;
					for (let n = 0; n < t.length; n++) if (t[n].name === e) {
						e = n;
						break;
					}
					break;
				case "map":
					if ("map" in t) {
						t = t.map;
						break;
					}
					if (!t.material) {
						G("PropertyBinding: Can not bind to material as node does not have a material.", this);
						return;
					}
					if (!t.material.map) {
						G("PropertyBinding: Can not bind to material.map as node.material does not have a map.", this);
						return;
					}
					t = t.material.map;
					break;
				default:
					if (t[r] === void 0) {
						G("PropertyBinding: Can not bind to objectName of node undefined.", this);
						return;
					}
					t = t[r];
			}
			if (e !== void 0) {
				if (t[e] === void 0) {
					G("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.", this, t);
					return;
				}
				t = t[e];
			}
		}
		let o = t[i];
		if (o === void 0) {
			let e = n.nodeName;
			G("PropertyBinding: Trying to update property for track: " + e + "." + i + " but it wasn't found.", t);
			return;
		}
		let s = this.Versioning.None;
		this.targetObject = t, t.isMaterial === !0 ? s = this.Versioning.NeedsUpdate : t.isObject3D === !0 && (s = this.Versioning.MatrixWorldNeedsUpdate);
		let c = this.BindingType.Direct;
		if (a !== void 0) {
			if (i === "morphTargetInfluences") {
				if (!t.geometry) {
					G("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.", this);
					return;
				}
				if (!t.geometry.morphAttributes) {
					G("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.", this);
					return;
				}
				t.morphTargetDictionary[a] !== void 0 && (a = t.morphTargetDictionary[a]);
			}
			c = this.BindingType.ArrayElement, this.resolvedProperty = o, this.propertyIndex = a;
		} else o.fromArray !== void 0 && o.toArray !== void 0 ? (c = this.BindingType.HasFromToArray, this.resolvedProperty = o) : Array.isArray(o) ? (c = this.BindingType.EntireArray, this.resolvedProperty = o) : this.propertyName = i;
		this.getValue = this.GetterByBindingType[c], this.setValue = this.SetterByBindingTypeAndVersioning[c][s];
	}
	unbind() {
		this.node = null, this.getValue = this._getValue_unbound, this.setValue = this._setValue_unbound;
	}
};
Sm.Composite = xm, Sm.prototype.BindingType = {
	Direct: 0,
	EntireArray: 1,
	ArrayElement: 2,
	HasFromToArray: 3
}, Sm.prototype.Versioning = {
	None: 0,
	NeedsUpdate: 1,
	MatrixWorldNeedsUpdate: 2
}, Sm.prototype.GetterByBindingType = [
	Sm.prototype._getValue_direct,
	Sm.prototype._getValue_array,
	Sm.prototype._getValue_arrayElement,
	Sm.prototype._getValue_toArray
], Sm.prototype.SetterByBindingTypeAndVersioning = [
	[
		Sm.prototype._setValue_direct,
		Sm.prototype._setValue_direct_setNeedsUpdate,
		Sm.prototype._setValue_direct_setMatrixWorldNeedsUpdate
	],
	[
		Sm.prototype._setValue_array,
		Sm.prototype._setValue_array_setNeedsUpdate,
		Sm.prototype._setValue_array_setMatrixWorldNeedsUpdate
	],
	[
		Sm.prototype._setValue_arrayElement,
		Sm.prototype._setValue_arrayElement_setNeedsUpdate,
		Sm.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate
	],
	[
		Sm.prototype._setValue_fromArray,
		Sm.prototype._setValue_fromArray_setNeedsUpdate,
		Sm.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate
	]
];
var Cm = /*@__PURE__*/ new el(), wm = class {
	constructor(e, t, n = 0, r = Infinity) {
		this.ray = new Vu(e, t), this.near = n, this.far = r, this.camera = null, this.layers = new dl(), this.params = {
			Mesh: {},
			Line: { threshold: 1 },
			LOD: {},
			Points: { threshold: 1 },
			Sprite: {}
		};
	}
	set(e, t) {
		this.ray.set(e, t);
	}
	setFromCamera(e, t) {
		t.isPerspectiveCamera ? (this.ray.origin.setFromMatrixPosition(t.matrixWorld), this.ray.direction.set(e.x, e.y, .5).unproject(t).sub(this.ray.origin).normalize(), this.camera = t) : t.isOrthographicCamera ? (this.ray.origin.set(e.x, e.y, t.projectionMatrix.elements[14]).unproject(t), this.ray.direction.set(0, 0, -1).transformDirection(t.matrixWorld), this.camera = t) : G("Raycaster: Unsupported camera type: " + t.type);
	}
	setFromXRController(e) {
		return Cm.identity().extractRotation(e.matrixWorld), this.ray.origin.setFromMatrixPosition(e.matrixWorld), this.ray.direction.set(0, 0, -1).applyMatrix4(Cm), this;
	}
	intersectObject(e, t = !0, n = []) {
		return Em(e, this, n, t), n.sort(Tm), n;
	}
	intersectObjects(e, t = !0, n = []) {
		for (let r = 0, i = e.length; r < i; r++) Em(e[r], this, n, t);
		return n.sort(Tm), n;
	}
};
function Tm(e, t) {
	return e.distance - t.distance;
}
function Em(e, t, n, r) {
	let i = !0;
	if (e.layers.test(t.layers) && e.raycast(t, n) === !1 && (i = !1), i === !0 && r === !0) {
		let r = e.children;
		for (let e = 0, i = r.length; e < i; e++) Em(r[e], t, n, !0);
	}
}
(class e {
	static {
		e.prototype.isMatrix2 = !0;
	}
	constructor(e, t, n, r) {
		this.elements = [
			1,
			0,
			0,
			1
		], e !== void 0 && this.set(e, t, n, r);
	}
	identity() {
		return this.set(1, 0, 0, 1), this;
	}
	fromArray(e, t = 0) {
		for (let n = 0; n < 4; n++) this.elements[n] = e[n + t];
		return this;
	}
	set(e, t, n, r) {
		let i = this.elements;
		return i[0] = e, i[2] = t, i[1] = n, i[3] = r, this;
	}
});
function Dm(e, t, n, r) {
	let i = Om(r);
	switch (n) {
		case as: return e * t;
		case us: return e * t / i.components * i.byteLength;
		case ds: return e * t / i.components * i.byteLength;
		case fs: return e * t * 2 / i.components * i.byteLength;
		case ps: return e * t * 2 / i.components * i.byteLength;
		case os: return e * t * 3 / i.components * i.byteLength;
		case ss: return e * t * 4 / i.components * i.byteLength;
		case ms: return e * t * 4 / i.components * i.byteLength;
		case hs:
		case gs: return Math.floor((e + 3) / 4) * Math.floor((t + 3) / 4) * 8;
		case _s:
		case vs: return Math.floor((e + 3) / 4) * Math.floor((t + 3) / 4) * 16;
		case bs:
		case Ss: return Math.max(e, 16) * Math.max(t, 8) / 4;
		case ys:
		case xs: return Math.max(e, 8) * Math.max(t, 8) / 2;
		case Cs:
		case ws:
		case Es:
		case Ds: return Math.floor((e + 3) / 4) * Math.floor((t + 3) / 4) * 8;
		case Ts:
		case Os:
		case ks: return Math.floor((e + 3) / 4) * Math.floor((t + 3) / 4) * 16;
		case As: return Math.floor((e + 3) / 4) * Math.floor((t + 3) / 4) * 16;
		case js: return Math.floor((e + 4) / 5) * Math.floor((t + 3) / 4) * 16;
		case Ms: return Math.floor((e + 4) / 5) * Math.floor((t + 4) / 5) * 16;
		case Ns: return Math.floor((e + 5) / 6) * Math.floor((t + 4) / 5) * 16;
		case Ps: return Math.floor((e + 5) / 6) * Math.floor((t + 5) / 6) * 16;
		case Fs: return Math.floor((e + 7) / 8) * Math.floor((t + 4) / 5) * 16;
		case Is: return Math.floor((e + 7) / 8) * Math.floor((t + 5) / 6) * 16;
		case Ls: return Math.floor((e + 7) / 8) * Math.floor((t + 7) / 8) * 16;
		case Rs: return Math.floor((e + 9) / 10) * Math.floor((t + 4) / 5) * 16;
		case zs: return Math.floor((e + 9) / 10) * Math.floor((t + 5) / 6) * 16;
		case Bs: return Math.floor((e + 9) / 10) * Math.floor((t + 7) / 8) * 16;
		case Vs: return Math.floor((e + 9) / 10) * Math.floor((t + 9) / 10) * 16;
		case Hs: return Math.floor((e + 11) / 12) * Math.floor((t + 9) / 10) * 16;
		case Us: return Math.floor((e + 11) / 12) * Math.floor((t + 11) / 12) * 16;
		case Ws:
		case Gs:
		case Ks: return Math.ceil(e / 4) * Math.ceil(t / 4) * 16;
		case qs:
		case Js: return Math.ceil(e / 4) * Math.ceil(t / 4) * 8;
		case Ys:
		case Xs: return Math.ceil(e / 4) * Math.ceil(t / 4) * 16;
	}
	throw Error(`Unable to determine texture byte length for ${n} format.`);
}
function Om(e) {
	switch (e) {
		case Ko:
		case qo: return {
			byteLength: 1,
			components: 1
		};
		case Yo:
		case Jo:
		case $o: return {
			byteLength: 2,
			components: 1
		};
		case es:
		case ts: return {
			byteLength: 2,
			components: 4
		};
		case Zo:
		case Xo:
		case Qo: return {
			byteLength: 4,
			components: 1
		};
		case rs:
		case is: return {
			byteLength: 4,
			components: 3
		};
	}
	throw Error(`THREE.TextureUtils: Unknown texture type ${e}.`);
}
typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register", { detail: { revision: "186" } })), typeof window < "u" && (window.__THREE__ ? W("WARNING: Multiple instances of Three.js being imported.") : window.__THREE__ = "186");
// node_modules/three/build/three.module.js
function km() {
	let e = null, t = !1, n = null, r = null;
	function i(t, a) {
		r = e.requestAnimationFrame(i), n(t, a);
	}
	return {
		start: function() {
			t !== !0 && n !== null && e !== null && (r = e.requestAnimationFrame(i), t = !0);
		},
		stop: function() {
			e !== null && e.cancelAnimationFrame(r), t = !1;
		},
		setAnimationLoop: function(e) {
			n = e;
		},
		setContext: function(t) {
			e = t;
		}
	};
}
function Am(e) {
	let t = /* @__PURE__ */ new WeakMap();
	function n(t, n) {
		let r = t.array, i = t.usage, a = r.byteLength, o = e.createBuffer();
		e.bindBuffer(n, o), e.bufferData(n, r, i), t.onUploadCallback();
		let s;
		if (r instanceof Float32Array) s = e.FLOAT;
		else if (typeof Float16Array < "u" && r instanceof Float16Array) s = e.HALF_FLOAT;
		else if (r instanceof Uint16Array) s = t.isFloat16BufferAttribute ? e.HALF_FLOAT : e.UNSIGNED_SHORT;
		else if (r instanceof Int16Array) s = e.SHORT;
		else if (r instanceof Uint32Array) s = e.UNSIGNED_INT;
		else if (r instanceof Int32Array) s = e.INT;
		else if (r instanceof Int8Array) s = e.BYTE;
		else if (r instanceof Uint8Array) s = e.UNSIGNED_BYTE;
		else if (r instanceof Uint8ClampedArray) s = e.UNSIGNED_BYTE;
		else throw Error("THREE.WebGLAttributes: Unsupported buffer data format: " + r);
		return {
			buffer: o,
			type: s,
			bytesPerElement: r.BYTES_PER_ELEMENT,
			version: t.version,
			size: a
		};
	}
	function r(t, n, r) {
		let i = n.array, a = n.updateRanges;
		if (e.bindBuffer(r, t), a.length === 0) e.bufferSubData(r, 0, i);
		else {
			a.sort((e, t) => e.start - t.start);
			let t = 0;
			for (let e = 1; e < a.length; e++) {
				let n = a[t], r = a[e];
				r.start <= n.start + n.count + 1 ? n.count = Math.max(n.count, r.start + r.count - n.start) : (++t, a[t] = r);
			}
			a.length = t + 1;
			for (let t = 0, n = a.length; t < n; t++) {
				let n = a[t];
				e.bufferSubData(r, n.start * i.BYTES_PER_ELEMENT, i, n.start, n.count);
			}
			n.clearUpdateRanges();
		}
		n.onUploadCallback();
	}
	function i(e) {
		return e.isInterleavedBufferAttribute && (e = e.data), t.get(e);
	}
	function a(n) {
		n.isInterleavedBufferAttribute && (n = n.data);
		let r = t.get(n);
		r && (e.deleteBuffer(r.buffer), t.delete(n));
	}
	function o(e, i) {
		if (e.isInterleavedBufferAttribute && (e = e.data), e.isGLBufferAttribute) {
			let n = t.get(e);
			(!n || n.version < e.version) && t.set(e, {
				buffer: e.buffer,
				type: e.type,
				bytesPerElement: e.elementSize,
				version: e.version
			});
			return;
		}
		let a = t.get(e);
		if (a === void 0) t.set(e, n(e, i));
		else if (a.version < e.version) {
			if (a.size !== e.array.byteLength) throw Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");
			r(a.buffer, e, i), a.version = e.version;
		}
	}
	return {
		get: i,
		remove: a,
		update: o
	};
}
var Q = {
	alphahash_fragment: "#ifdef USE_ALPHAHASH\n	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;\n#endif",
	alphahash_pars_fragment: "#ifdef USE_ALPHAHASH\n	const float ALPHA_HASH_SCALE = 0.05;\n	float hash2D( vec2 value ) {\n		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );\n	}\n	float hash3D( vec3 value ) {\n		return hash2D( vec2( hash2D( value.xy ), value.z ) );\n	}\n	float getAlphaHashThreshold( vec3 position ) {\n		float maxDeriv = max(\n			length( dFdx( position.xyz ) ),\n			length( dFdy( position.xyz ) )\n		);\n		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );\n		vec2 pixScales = vec2(\n			exp2( floor( log2( pixScale ) ) ),\n			exp2( ceil( log2( pixScale ) ) )\n		);\n		vec2 alpha = vec2(\n			hash3D( floor( pixScales.x * position.xyz ) ),\n			hash3D( floor( pixScales.y * position.xyz ) )\n		);\n		float lerpFactor = fract( log2( pixScale ) );\n		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;\n		float a = min( lerpFactor, 1.0 - lerpFactor );\n		vec3 cases = vec3(\n			x * x / ( 2.0 * a * ( 1.0 - a ) ),\n			( x - 0.5 * a ) / ( 1.0 - a ),\n			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )\n		);\n		float threshold = ( x < ( 1.0 - a ) )\n			? ( ( x < a ) ? cases.x : cases.y )\n			: cases.z;\n		return clamp( threshold , 1.0e-6, 1.0 );\n	}\n#endif",
	alphamap_fragment: "#ifdef USE_ALPHAMAP\n	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;\n#endif",
	alphamap_pars_fragment: "#ifdef USE_ALPHAMAP\n	uniform sampler2D alphaMap;\n#endif",
	alphatest_fragment: "#ifdef USE_ALPHATEST\n	#ifdef ALPHA_TO_COVERAGE\n	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );\n	if ( diffuseColor.a == 0.0 ) discard;\n	#else\n	if ( diffuseColor.a < alphaTest ) discard;\n	#endif\n#endif",
	alphatest_pars_fragment: "#ifdef USE_ALPHATEST\n	uniform float alphaTest;\n#endif",
	aomap_fragment: "#ifdef USE_AOMAP\n	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;\n	reflectedLight.indirectDiffuse *= ambientOcclusion;\n	#if defined( USE_CLEARCOAT ) \n		clearcoatSpecularIndirect *= ambientOcclusion;\n	#endif\n	#if defined( USE_SHEEN ) \n		sheenSpecularIndirect *= ambientOcclusion;\n	#endif\n	#if defined( USE_ENVMAP ) && defined( STANDARD )\n		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );\n		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );\n	#endif\n#endif",
	aomap_pars_fragment: "#ifdef USE_AOMAP\n	uniform sampler2D aoMap;\n	uniform float aoMapIntensity;\n#endif",
	batching_pars_vertex: "#ifdef USE_BATCHING\n	#if ! defined( GL_ANGLE_multi_draw )\n	#define gl_DrawID _gl_DrawID\n	uniform int _gl_DrawID;\n	#endif\n	uniform highp sampler2D batchingTexture;\n	uniform highp usampler2D batchingIdTexture;\n	mat4 getBatchingMatrix( const in float i ) {\n		int size = textureSize( batchingTexture, 0 ).x;\n		int j = int( i ) * 4;\n		int x = j % size;\n		int y = j / size;\n		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );\n		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );\n		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );\n		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );\n		return mat4( v1, v2, v3, v4 );\n	}\n	float getIndirectIndex( const in int i ) {\n		int size = textureSize( batchingIdTexture, 0 ).x;\n		int x = i % size;\n		int y = i / size;\n		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );\n	}\n#endif\n#ifdef USE_BATCHING_COLOR\n	uniform sampler2D batchingColorTexture;\n	vec4 getBatchingColor( const in float i ) {\n		int size = textureSize( batchingColorTexture, 0 ).x;\n		int j = int( i );\n		int x = j % size;\n		int y = j / size;\n		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );\n	}\n#endif",
	batching_vertex: "#ifdef USE_BATCHING\n	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );\n#endif",
	begin_vertex: "vec3 transformed = vec3( position );\n#ifdef USE_ALPHAHASH\n	vPosition = vec3( position );\n#endif",
	beginnormal_vertex: "vec3 objectNormal = vec3( normal );\n#ifdef USE_TANGENT\n	vec3 objectTangent = vec3( tangent.xyz );\n#endif",
	bsdfs: "float G_BlinnPhong_Implicit( ) {\n	return 0.25;\n}\nfloat D_BlinnPhong( const in float shininess, const in float dotNH ) {\n	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );\n}\nvec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {\n	vec3 halfDir = normalize( lightDir + viewDir );\n	float dotNH = saturate( dot( normal, halfDir ) );\n	float dotVH = saturate( dot( viewDir, halfDir ) );\n	vec3 F = F_Schlick( specularColor, 1.0, dotVH );\n	float G = G_BlinnPhong_Implicit( );\n	float D = D_BlinnPhong( shininess, dotNH );\n	return F * ( G * D );\n} // validated",
	iridescence_fragment: "#ifdef USE_IRIDESCENCE\n	const mat3 XYZ_TO_REC709 = mat3(\n		 3.2404542, -0.9692660,  0.0556434,\n		-1.5371385,  1.8760108, -0.2040259,\n		-0.4985314,  0.0415560,  1.0572252\n	);\n	vec3 Fresnel0ToIor( vec3 fresnel0 ) {\n		vec3 sqrtF0 = sqrt( fresnel0 );\n		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );\n	}\n	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {\n		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );\n	}\n	float IorToFresnel0( float transmittedIor, float incidentIor ) {\n		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));\n	}\n	vec3 evalSensitivity( float OPD, vec3 shift ) {\n		float phase = 2.0 * PI * OPD * 1.0e-9;\n		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );\n		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );\n		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );\n		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );\n		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );\n		xyz /= 1.0685e-7;\n		vec3 rgb = XYZ_TO_REC709 * xyz;\n		return rgb;\n	}\n	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {\n		vec3 I;\n		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );\n		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );\n		float cosTheta2Sq = 1.0 - sinTheta2Sq;\n		if ( cosTheta2Sq < 0.0 ) {\n			return vec3( 1.0 );\n		}\n		float cosTheta2 = sqrt( cosTheta2Sq );\n		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );\n		float R12 = F_Schlick( R0, 1.0, cosTheta1 );\n		float T121 = 1.0 - R12;\n		float phi12 = 0.0;\n		if ( iridescenceIOR < outsideIOR ) phi12 = PI;\n		float phi21 = PI - phi12;\n		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );\n		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );\n		vec3 phi23 = vec3( 0.0 );\n		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;\n		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;\n		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;\n		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;\n		vec3 phi = vec3( phi21 ) + phi23;\n		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );\n		vec3 r123 = sqrt( R123 );\n		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );\n		vec3 C0 = R12 + Rs;\n		I = C0;\n		vec3 Cm = Rs - T121;\n		for ( int m = 1; m <= 2; ++ m ) {\n			Cm *= r123;\n			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );\n			I += Cm * Sm;\n		}\n		return max( I, vec3( 0.0 ) );\n	}\n#endif",
	bumpmap_pars_fragment: "#ifdef USE_BUMPMAP\n	uniform sampler2D bumpMap;\n	uniform float bumpScale;\n	vec2 dHdxy_fwd() {\n		vec2 dSTdx = dFdx( vBumpMapUv );\n		vec2 dSTdy = dFdy( vBumpMapUv );\n		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;\n		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;\n		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;\n		return vec2( dBx, dBy );\n	}\n	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {\n		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );\n		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );\n		vec3 vN = surf_norm;\n		vec3 R1 = cross( vSigmaY, vN );\n		vec3 R2 = cross( vN, vSigmaX );\n		float fDet = dot( vSigmaX, R1 ) * faceDirection;\n		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );\n		return normalize( abs( fDet ) * surf_norm - vGrad );\n	}\n#endif",
	clipping_planes_fragment: "#if NUM_CLIPPING_PLANES > 0\n	vec4 plane;\n	#ifdef ALPHA_TO_COVERAGE\n		float distanceToPlane, distanceGradient;\n		float clipOpacity = 1.0;\n		#pragma unroll_loop_start\n		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {\n			plane = clippingPlanes[ i ];\n			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;\n			distanceGradient = fwidth( distanceToPlane ) / 2.0;\n			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );\n			if ( clipOpacity == 0.0 ) discard;\n		}\n		#pragma unroll_loop_end\n		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES\n			float unionClipOpacity = 1.0;\n			#pragma unroll_loop_start\n			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {\n				plane = clippingPlanes[ i ];\n				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;\n				distanceGradient = fwidth( distanceToPlane ) / 2.0;\n				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );\n			}\n			#pragma unroll_loop_end\n			clipOpacity *= 1.0 - unionClipOpacity;\n		#endif\n		diffuseColor.a *= clipOpacity;\n		if ( diffuseColor.a == 0.0 ) discard;\n	#else\n		#pragma unroll_loop_start\n		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {\n			plane = clippingPlanes[ i ];\n			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;\n		}\n		#pragma unroll_loop_end\n		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES\n			bool clipped = true;\n			#pragma unroll_loop_start\n			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {\n				plane = clippingPlanes[ i ];\n				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;\n			}\n			#pragma unroll_loop_end\n			if ( clipped ) discard;\n		#endif\n	#endif\n#endif",
	clipping_planes_pars_fragment: "#if NUM_CLIPPING_PLANES > 0\n	varying vec3 vClipPosition;\n	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];\n#endif",
	clipping_planes_pars_vertex: "#if NUM_CLIPPING_PLANES > 0\n	varying vec3 vClipPosition;\n#endif",
	clipping_planes_vertex: "#if NUM_CLIPPING_PLANES > 0\n	vClipPosition = - mvPosition.xyz;\n#endif",
	color_fragment: "#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )\n	diffuseColor *= vColor;\n#endif",
	color_pars_fragment: "#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )\n	varying vec4 vColor;\n#endif",
	color_pars_vertex: "#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )\n	varying vec4 vColor;\n#endif",
	color_vertex: "#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )\n	vColor = vec4( 1.0 );\n#endif\n#ifdef USE_COLOR_ALPHA\n	vColor *= color;\n#elif defined( USE_COLOR )\n	vColor.rgb *= color;\n#endif\n#ifdef USE_INSTANCING_COLOR\n	vColor.rgb *= instanceColor.rgb;\n#endif\n#ifdef USE_BATCHING_COLOR\n	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );\n#endif",
	common: "#define PI 3.141592653589793\n#define PI2 6.283185307179586\n#define PI_HALF 1.5707963267948966\n#define RECIPROCAL_PI 0.3183098861837907\n#define RECIPROCAL_PI2 0.15915494309189535\n#define EPSILON 1e-6\n#ifndef saturate\n#define saturate( a ) clamp( a, 0.0, 1.0 )\n#endif\n#define whiteComplement( a ) ( 1.0 - saturate( a ) )\nfloat pow2( const in float x ) { return x*x; }\nvec3 pow2( const in vec3 x ) { return x*x; }\nfloat pow3( const in float x ) { return x*x*x; }\nfloat pow4( const in float x ) { float x2 = x*x; return x2*x2; }\nfloat max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }\nfloat average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }\nhighp float rand( const in vec2 uv ) {\n	const highp float a = 12.9898, b = 78.233, c = 43758.5453;\n	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );\n	return fract( sin( sn ) * c );\n}\n#ifdef HIGH_PRECISION\n	float precisionSafeLength( vec3 v ) { return length( v ); }\n#else\n	float precisionSafeLength( vec3 v ) {\n		float maxComponent = max3( abs( v ) );\n		return length( v / maxComponent ) * maxComponent;\n	}\n#endif\nstruct IncidentLight {\n	vec3 color;\n	vec3 direction;\n	bool visible;\n};\nstruct ReflectedLight {\n	vec3 directDiffuse;\n	vec3 directSpecular;\n	vec3 indirectDiffuse;\n	vec3 indirectSpecular;\n};\n#ifdef USE_ALPHAHASH\n	varying vec3 vPosition;\n#endif\nvec3 transformDirection( in vec3 dir, in mat4 matrix ) {\n	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );\n}\n#define inverseTransformDirection transformDirectionByInverseViewMatrix\nvec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {\n	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );\n}\nvec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {\n	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );\n}\nbool isPerspectiveMatrix( mat4 m ) {\n	return m[ 2 ][ 3 ] == - 1.0;\n}\nvec2 equirectUv( in vec3 dir ) {\n	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;\n	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;\n	return vec2( u, v );\n}\nvec3 BRDF_Lambert( const in vec3 diffuseColor ) {\n	return RECIPROCAL_PI * diffuseColor;\n}\nvec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {\n	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );\n	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );\n}\nfloat F_Schlick( const in float f0, const in float f90, const in float dotVH ) {\n	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );\n	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );\n} // validated",
	cube_uv_reflection_fragment: "#ifdef ENVMAP_TYPE_CUBE_UV\n	#define cubeUV_minMipLevel 4.0\n	#define cubeUV_minTileSize 16.0\n	float getFace( vec3 direction ) {\n		vec3 absDirection = abs( direction );\n		float face = - 1.0;\n		if ( absDirection.x > absDirection.z ) {\n			if ( absDirection.x > absDirection.y )\n				face = direction.x > 0.0 ? 0.0 : 3.0;\n			else\n				face = direction.y > 0.0 ? 1.0 : 4.0;\n		} else {\n			if ( absDirection.z > absDirection.y )\n				face = direction.z > 0.0 ? 2.0 : 5.0;\n			else\n				face = direction.y > 0.0 ? 1.0 : 4.0;\n		}\n		return face;\n	}\n	vec2 getUV( vec3 direction, float face ) {\n		vec2 uv;\n		if ( face == 0.0 ) {\n			uv = vec2( direction.z, direction.y ) / abs( direction.x );\n		} else if ( face == 1.0 ) {\n			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );\n		} else if ( face == 2.0 ) {\n			uv = vec2( - direction.x, direction.y ) / abs( direction.z );\n		} else if ( face == 3.0 ) {\n			uv = vec2( - direction.z, direction.y ) / abs( direction.x );\n		} else if ( face == 4.0 ) {\n			uv = vec2( - direction.x, direction.z ) / abs( direction.y );\n		} else {\n			uv = vec2( direction.x, direction.y ) / abs( direction.z );\n		}\n		return 0.5 * ( uv + 1.0 );\n	}\n	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {\n		float face = getFace( direction );\n		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );\n		mipInt = max( mipInt, cubeUV_minMipLevel );\n		float faceSize = exp2( mipInt );\n		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;\n		if ( face > 2.0 ) {\n			uv.y += faceSize;\n			face -= 3.0;\n		}\n		uv.x += face * faceSize;\n		uv.x += filterInt * 3.0 * cubeUV_minTileSize;\n		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );\n		uv.x *= CUBEUV_TEXEL_WIDTH;\n		uv.y *= CUBEUV_TEXEL_HEIGHT;\n		#ifdef texture2DGradEXT\n			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;\n		#else\n			return texture2D( envMap, uv ).rgb;\n		#endif\n	}\n	#define cubeUV_r0 1.0\n	#define cubeUV_m0 - 2.0\n	#define cubeUV_r1 0.8\n	#define cubeUV_m1 - 1.0\n	#define cubeUV_r4 0.4\n	#define cubeUV_m4 2.0\n	#define cubeUV_r5 0.305\n	#define cubeUV_m5 3.0\n	#define cubeUV_r6 0.21\n	#define cubeUV_m6 4.0\n	float roughnessToMip( float roughness ) {\n		float mip = 0.0;\n		if ( roughness >= cubeUV_r1 ) {\n			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;\n		} else if ( roughness >= cubeUV_r4 ) {\n			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;\n		} else if ( roughness >= cubeUV_r5 ) {\n			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;\n		} else if ( roughness >= cubeUV_r6 ) {\n			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;\n		} else {\n			mip = - 2.0 * log2( 1.16 * roughness );		}\n		return mip;\n	}\n	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {\n		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );\n		float mipF = fract( mip );\n		float mipInt = floor( mip );\n		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );\n		if ( mipF == 0.0 ) {\n			return vec4( color0, 1.0 );\n		} else {\n			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );\n			return vec4( mix( color0, color1, mipF ), 1.0 );\n		}\n	}\n#endif",
	defaultnormal_vertex: "vec3 transformedNormal = objectNormal;\n#ifdef USE_TANGENT\n	vec3 transformedTangent = objectTangent;\n#endif\n#ifdef USE_BATCHING\n	mat3 bm = mat3( batchingMatrix );\n	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );\n	transformedNormal = bm * transformedNormal;\n	#ifdef USE_TANGENT\n		transformedTangent = bm * transformedTangent;\n	#endif\n#endif\n#ifdef USE_INSTANCING\n	mat3 im = mat3( instanceMatrix );\n	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );\n	transformedNormal = im * transformedNormal;\n	#ifdef USE_TANGENT\n		transformedTangent = im * transformedTangent;\n	#endif\n#endif\ntransformedNormal = normalMatrix * transformedNormal;\n#ifdef FLIP_SIDED\n	transformedNormal = - transformedNormal;\n#endif\n#ifdef USE_TANGENT\n	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;\n#endif",
	displacementmap_pars_vertex: "#ifdef USE_DISPLACEMENTMAP\n	uniform sampler2D displacementMap;\n	uniform float displacementScale;\n	uniform float displacementBias;\n#endif",
	displacementmap_vertex: "#ifdef USE_DISPLACEMENTMAP\n	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );\n#endif",
	emissivemap_fragment: "#ifdef USE_EMISSIVEMAP\n	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );\n	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE\n		emissiveColor = sRGBTransferEOTF( emissiveColor );\n	#endif\n	totalEmissiveRadiance *= emissiveColor.rgb;\n#endif",
	emissivemap_pars_fragment: "#ifdef USE_EMISSIVEMAP\n	uniform sampler2D emissiveMap;\n#endif",
	colorspace_fragment: "gl_FragColor = linearToOutputTexel( gl_FragColor );",
	colorspace_pars_fragment: "vec4 LinearTransferOETF( in vec4 value ) {\n	return value;\n}\nvec4 sRGBTransferEOTF( in vec4 value ) {\n	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );\n}\nvec4 sRGBTransferOETF( in vec4 value ) {\n	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );\n}",
	envmap_fragment: "#ifdef USE_ENVMAP\n	#ifdef ENV_WORLDPOS\n		vec3 cameraToFrag;\n		if ( isOrthographic ) {\n			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );\n		} else {\n			cameraToFrag = normalize( vWorldPosition - cameraPosition );\n		}\n		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );\n		#ifdef ENVMAP_MODE_REFLECTION\n			vec3 reflectVec = reflect( cameraToFrag, worldNormal );\n		#else\n			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );\n		#endif\n	#else\n		vec3 reflectVec = vReflect;\n	#endif\n	#ifdef ENVMAP_TYPE_CUBE\n		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );\n		#ifdef ENVMAP_BLENDING_MULTIPLY\n			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );\n		#elif defined( ENVMAP_BLENDING_MIX )\n			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );\n		#elif defined( ENVMAP_BLENDING_ADD )\n			outgoingLight += envColor.xyz * specularStrength * reflectivity;\n		#endif\n	#endif\n#endif",
	envmap_common_pars_fragment: "#ifdef USE_ENVMAP\n	uniform float envMapIntensity;\n	uniform mat3 envMapRotation;\n	#ifdef ENVMAP_TYPE_CUBE\n		uniform samplerCube envMap;\n	#else\n		uniform sampler2D envMap;\n	#endif\n#endif",
	envmap_pars_fragment: "#ifdef USE_ENVMAP\n	uniform float reflectivity;\n	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )\n		#define ENV_WORLDPOS\n	#endif\n	#ifdef ENV_WORLDPOS\n		varying vec3 vWorldPosition;\n		uniform float refractionRatio;\n	#else\n		varying vec3 vReflect;\n	#endif\n#endif",
	envmap_pars_vertex: "#ifdef USE_ENVMAP\n	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )\n		#define ENV_WORLDPOS\n	#endif\n	#ifdef ENV_WORLDPOS\n		\n		varying vec3 vWorldPosition;\n	#else\n		varying vec3 vReflect;\n		uniform float refractionRatio;\n	#endif\n#endif",
	envmap_physical_pars_fragment: "#ifdef USE_ENVMAP\n	vec3 getIBLIrradiance( const in vec3 normal ) {\n		#ifdef ENVMAP_TYPE_CUBE_UV\n			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );\n			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );\n			return PI * envMapColor.rgb * envMapIntensity;\n		#else\n			return vec3( 0.0 );\n		#endif\n	}\n	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {\n		#ifdef ENVMAP_TYPE_CUBE_UV\n			vec3 reflectVec = reflect( - viewDir, normal );\n			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );\n			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );\n			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );\n			return envMapColor.rgb * envMapIntensity;\n		#else\n			return vec3( 0.0 );\n		#endif\n	}\n	#ifdef USE_RETROREFLECTION\n		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {\n			#ifdef ENVMAP_TYPE_CUBE_UV\n				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );\n				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );\n				vec4 envMapColor = textureCubeUV( envMap, envMapRotation * retroVec, roughness );\n				return envMapColor.rgb * envMapIntensity;\n			#else\n				return vec3( 0.0 );\n			#endif\n		}\n	#endif\n	#ifdef USE_ANISOTROPY\n		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {\n			#ifdef ENVMAP_TYPE_CUBE_UV\n				vec3 bentNormal = cross( bitangent, viewDir );\n				bentNormal = normalize( cross( bentNormal, bitangent ) );\n				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );\n				return getIBLRadiance( viewDir, bentNormal, roughness );\n			#else\n				return vec3( 0.0 );\n			#endif\n		}\n		#ifdef USE_RETROREFLECTION\n			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {\n				#ifdef ENVMAP_TYPE_CUBE_UV\n					vec3 bentNormal = cross( bitangent, viewDir );\n					bentNormal = normalize( cross( bentNormal, bitangent ) );\n					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );\n					return getIBLRetroRadiance( viewDir, bentNormal, roughness );\n				#else\n					return vec3( 0.0 );\n				#endif\n			}\n		#endif\n	#endif\n#endif",
	envmap_vertex: "#ifdef USE_ENVMAP\n	#ifdef ENV_WORLDPOS\n		vWorldPosition = worldPosition.xyz;\n	#else\n		vec3 cameraToVertex;\n		if ( isOrthographic ) {\n			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );\n		} else {\n			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );\n		}\n		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );\n		#ifdef ENVMAP_MODE_REFLECTION\n			vReflect = reflect( cameraToVertex, worldNormal );\n		#else\n			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );\n		#endif\n	#endif\n#endif",
	fog_vertex: "#ifdef USE_FOG\n	vFogDepth = - mvPosition.z;\n#endif",
	fog_pars_vertex: "#ifdef USE_FOG\n	varying float vFogDepth;\n#endif",
	fog_fragment: "#ifdef USE_FOG\n	#ifdef FOG_EXP2\n		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );\n	#else\n		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );\n	#endif\n	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );\n#endif",
	fog_pars_fragment: "#ifdef USE_FOG\n	uniform vec3 fogColor;\n	varying float vFogDepth;\n	#ifdef FOG_EXP2\n		uniform float fogDensity;\n	#else\n		uniform float fogNear;\n		uniform float fogFar;\n	#endif\n#endif",
	gradientmap_pars_fragment: "#ifdef USE_GRADIENTMAP\n	uniform sampler2D gradientMap;\n#endif\nvec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {\n	float dotNL = dot( normal, lightDirection );\n	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );\n	#ifdef USE_GRADIENTMAP\n		return vec3( texture2D( gradientMap, coord ).r );\n	#else\n		vec2 fw = fwidth( coord ) * 0.5;\n		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );\n	#endif\n}",
	lightmap_pars_fragment: "#ifdef USE_LIGHTMAP\n	uniform sampler2D lightMap;\n	uniform float lightMapIntensity;\n#endif",
	lights_lambert_fragment: "LambertMaterial material;\nmaterial.diffuseColor = diffuseColor.rgb;\nmaterial.specularStrength = specularStrength;",
	lights_lambert_pars_fragment: "varying vec3 vViewPosition;\nstruct LambertMaterial {\n	vec3 diffuseColor;\n	float specularStrength;\n};\nvoid RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {\n	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );\n	vec3 irradiance = dotNL * directLight.color;\n	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );\n}\nvoid RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {\n	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );\n}\n#define RE_Direct				RE_Direct_Lambert\n#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert",
	lights_pars_begin: "uniform bool receiveShadow;\nuniform vec3 ambientLightColor;\n#if defined( USE_LIGHT_PROBES )\n	uniform vec3 lightProbe[ 9 ];\n#endif\nvec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {\n	float x = normal.x, y = normal.y, z = normal.z;\n	vec3 result = shCoefficients[ 0 ] * 0.886227;\n	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;\n	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;\n	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;\n	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;\n	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;\n	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );\n	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;\n	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );\n	return result;\n}\nvec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {\n	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );\n	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );\n	return irradiance;\n}\nvec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {\n	vec3 irradiance = ambientLightColor;\n	return irradiance;\n}\nfloat getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {\n	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );\n	if ( cutoffDistance > 0.0 ) {\n		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );\n	}\n	return distanceFalloff;\n}\nfloat getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {\n	return smoothstep( coneCosine, penumbraCosine, angleCosine );\n}\n#if NUM_SUN_LIGHTS > 0\n	struct SunLight {\n		vec3 direction;\n		vec3 color;\n	};\n	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];\n	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {\n		light.color = sunLight.color;\n		light.direction = sunLight.direction;\n		light.visible = true;\n	}\n#endif\n#if NUM_DIR_LIGHTS > 0\n	struct DirectionalLight {\n		vec3 direction;\n		vec3 color;\n	};\n	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];\n	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {\n		light.color = directionalLight.color;\n		light.direction = directionalLight.direction;\n		light.visible = true;\n	}\n#endif\n#if NUM_POINT_LIGHTS > 0\n	struct PointLight {\n		vec3 position;\n		vec3 color;\n		float distance;\n		float decay;\n	};\n	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];\n	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {\n		vec3 lVector = pointLight.position - geometryPosition;\n		light.direction = normalize( lVector );\n		float lightDistance = length( lVector );\n		light.color = pointLight.color;\n		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );\n		light.visible = ( light.color != vec3( 0.0 ) );\n	}\n#endif\n#if NUM_SPOT_LIGHTS > 0\n	struct SpotLight {\n		vec3 position;\n		vec3 direction;\n		vec3 color;\n		float distance;\n		float decay;\n		float coneCos;\n		float penumbraCos;\n	};\n	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];\n	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {\n		vec3 lVector = spotLight.position - geometryPosition;\n		light.direction = normalize( lVector );\n		float angleCos = dot( light.direction, spotLight.direction );\n		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );\n		if ( spotAttenuation > 0.0 ) {\n			float lightDistance = length( lVector );\n			light.color = spotLight.color * spotAttenuation;\n			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );\n			light.visible = ( light.color != vec3( 0.0 ) );\n		} else {\n			light.color = vec3( 0.0 );\n			light.visible = false;\n		}\n	}\n#endif\n#if NUM_RECT_AREA_LIGHTS > 0\n	struct RectAreaLight {\n		vec3 color;\n		vec3 position;\n		vec3 halfWidth;\n		vec3 halfHeight;\n	};\n	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;\n	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];\n#endif\n#if NUM_HEMI_LIGHTS > 0\n	struct HemisphereLight {\n		vec3 direction;\n		vec3 skyColor;\n		vec3 groundColor;\n	};\n	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];\n	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {\n		float dotNL = dot( normal, hemiLight.direction );\n		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;\n		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );\n		return irradiance;\n	}\n#endif\n#include <lightprobes_pars_fragment>",
	lights_toon_fragment: "ToonMaterial material;\nmaterial.diffuseColor = diffuseColor.rgb;",
	lights_toon_pars_fragment: "varying vec3 vViewPosition;\nstruct ToonMaterial {\n	vec3 diffuseColor;\n};\nvoid RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {\n	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;\n	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );\n}\nvoid RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {\n	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );\n}\n#define RE_Direct				RE_Direct_Toon\n#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon",
	lights_phong_fragment: "BlinnPhongMaterial material;\nmaterial.diffuseColor = diffuseColor.rgb;\nmaterial.specularColor = specular;\nmaterial.specularShininess = shininess;\nmaterial.specularStrength = specularStrength;",
	lights_phong_pars_fragment: "varying vec3 vViewPosition;\nstruct BlinnPhongMaterial {\n	vec3 diffuseColor;\n	vec3 specularColor;\n	float specularShininess;\n	float specularStrength;\n};\nvoid RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {\n	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );\n	vec3 irradiance = dotNL * directLight.color;\n	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );\n	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;\n}\nvoid RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {\n	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );\n}\n#define RE_Direct				RE_Direct_BlinnPhong\n#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong",
	lights_physical_fragment: "PhysicalMaterial material;\nmaterial.diffuseColor = diffuseColor.rgb;\nmaterial.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );\nmaterial.metalness = metalnessFactor;\nvec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );\nfloat geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );\nmaterial.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;\nmaterial.roughness = min( material.roughness, 1.0 );\n#ifdef IOR\n	material.ior = ior;\n	#ifdef USE_SPECULAR\n		float specularIntensityFactor = specularIntensity;\n		vec3 specularColorFactor = specularColor;\n		#ifdef USE_SPECULAR_COLORMAP\n			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;\n		#endif\n		#ifdef USE_SPECULAR_INTENSITYMAP\n			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;\n		#endif\n		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );\n	#else\n		float specularIntensityFactor = 1.0;\n		vec3 specularColorFactor = vec3( 1.0 );\n		material.specularF90 = 1.0;\n	#endif\n	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;\n	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );\n#else\n	material.specularColor = vec3( 0.04 );\n	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );\n	material.specularF90 = 1.0;\n#endif\n#ifdef USE_CLEARCOAT\n	material.clearcoat = clearcoat;\n	material.clearcoatRoughness = clearcoatRoughness;\n	material.clearcoatF0 = vec3( 0.04 );\n	material.clearcoatF90 = 1.0;\n	#ifdef USE_CLEARCOATMAP\n		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;\n	#endif\n	#ifdef USE_CLEARCOAT_ROUGHNESSMAP\n		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;\n	#endif\n	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );\n	material.clearcoatRoughness += geometryRoughness;\n	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );\n#endif\n#ifdef USE_DISPERSION\n	material.dispersion = dispersion;\n#endif\n#ifdef USE_RETROREFLECTION\n	material.retroreflectivity = retroreflectivity;\n#endif\n#ifdef USE_IRIDESCENCE\n	material.iridescence = iridescence;\n	material.iridescenceIOR = iridescenceIOR;\n	#ifdef USE_IRIDESCENCEMAP\n		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;\n	#endif\n	#ifdef USE_IRIDESCENCE_THICKNESSMAP\n		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;\n	#else\n		material.iridescenceThickness = iridescenceThicknessMaximum;\n	#endif\n#endif\n#ifdef USE_SHEEN\n	material.sheenColor = sheenColor;\n	#ifdef USE_SHEEN_COLORMAP\n		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;\n	#endif\n	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );\n	#ifdef USE_SHEEN_ROUGHNESSMAP\n		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;\n	#endif\n#endif\n#ifdef USE_ANISOTROPY\n	#ifdef USE_ANISOTROPYMAP\n		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );\n		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;\n		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;\n	#else\n		vec2 anisotropyV = anisotropyVector;\n	#endif\n	material.anisotropy = length( anisotropyV );\n	if( material.anisotropy == 0.0 ) {\n		anisotropyV = vec2( 1.0, 0.0 );\n	} else {\n		anisotropyV /= material.anisotropy;\n		material.anisotropy = saturate( material.anisotropy );\n	}\n	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );\n	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;\n	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;\n#endif",
	lights_physical_pars_fragment: "uniform sampler2D dfgLUT;\nstruct PhysicalMaterial {\n	vec3 diffuseColor;\n	vec3 diffuseContribution;\n	vec3 specularColor;\n	vec3 specularColorBlended;\n	float roughness;\n	float metalness;\n	float specularF90;\n	float dispersion;\n	vec2 dfg;\n	vec3 multiScatteringCompensation;\n	#ifdef USE_RETROREFLECTION\n		float retroreflectivity;\n	#endif\n	#ifdef USE_CLEARCOAT\n		float clearcoat;\n		float clearcoatRoughness;\n		vec3 clearcoatF0;\n		float clearcoatF90;\n	#endif\n	#ifdef USE_IRIDESCENCE\n		float iridescence;\n		float iridescenceIOR;\n		float iridescenceThickness;\n		vec3 iridescenceFresnel;\n		vec3 iridescenceF0Dielectric;\n		vec3 iridescenceF0Metallic;\n	#endif\n	#ifdef USE_SHEEN\n		vec3 sheenColor;\n		float sheenRoughness;\n	#endif\n	#ifdef IOR\n		float ior;\n	#endif\n	#ifdef USE_TRANSMISSION\n		float transmission;\n		float transmissionAlpha;\n		float thickness;\n		float attenuationDistance;\n		vec3 attenuationColor;\n	#endif\n	#ifdef USE_ANISOTROPY\n		float anisotropy;\n		float alphaT;\n		vec3 anisotropyT;\n		vec3 anisotropyB;\n	#endif\n};\nvec3 clearcoatSpecularDirect = vec3( 0.0 );\nvec3 clearcoatSpecularIndirect = vec3( 0.0 );\nvec3 sheenSpecularDirect = vec3( 0.0 );\nvec3 sheenSpecularIndirect = vec3(0.0 );\nvec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {\n    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );\n    float x2 = x * x;\n    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );\n    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );\n}\nfloat V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {\n	float a2 = pow2( alpha );\n	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );\n	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );\n	return 0.5 / max( gv + gl, EPSILON );\n}\nfloat D_GGX( const in float alpha, const in float dotNH ) {\n	float a2 = pow2( alpha );\n	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;\n	return RECIPROCAL_PI * a2 / pow2( denom );\n}\n#ifdef USE_ANISOTROPY\n	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {\n		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );\n		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );\n		return 0.5 / max( gv + gl, EPSILON );\n	}\n	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {\n		float a2 = alphaT * alphaB;\n		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );\n		highp float v2 = dot( v, v );\n		float w2 = a2 / v2;\n		return RECIPROCAL_PI * a2 * pow2 ( w2 );\n	}\n#endif\n#ifdef USE_CLEARCOAT\n	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {\n		vec3 f0 = material.clearcoatF0;\n		float f90 = material.clearcoatF90;\n		float roughness = material.clearcoatRoughness;\n		float alpha = pow2( roughness );\n		vec3 halfDir = normalize( lightDir + viewDir );\n		float dotNL = saturate( dot( normal, lightDir ) );\n		float dotNV = saturate( dot( normal, viewDir ) );\n		float dotNH = saturate( dot( normal, halfDir ) );\n		float dotVH = saturate( dot( viewDir, halfDir ) );\n		vec3 F = F_Schlick( f0, f90, dotVH );\n		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );\n		float D = D_GGX( alpha, dotNH );\n		return F * ( V * D );\n	}\n#endif\nvec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {\n	vec3 f0 = material.specularColorBlended;\n	float f90 = material.specularF90;\n	float roughness = material.roughness;\n	float alpha = pow2( roughness );\n	vec3 halfDir = normalize( lightDir + viewDir );\n	float dotNL = saturate( dot( normal, lightDir ) );\n	float dotNV = saturate( dot( normal, viewDir ) );\n	float dotNH = saturate( dot( normal, halfDir ) );\n	float dotVH = saturate( dot( viewDir, halfDir ) );\n	vec3 F = F_Schlick( f0, f90, dotVH );\n	#ifdef USE_IRIDESCENCE\n		F = mix( F, material.iridescenceFresnel, material.iridescence );\n	#endif\n	#ifdef USE_ANISOTROPY\n		float dotTL = dot( material.anisotropyT, lightDir );\n		float dotTV = dot( material.anisotropyT, viewDir );\n		float dotTH = dot( material.anisotropyT, halfDir );\n		float dotBL = dot( material.anisotropyB, lightDir );\n		float dotBV = dot( material.anisotropyB, viewDir );\n		float dotBH = dot( material.anisotropyB, halfDir );\n		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );\n		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );\n	#else\n		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );\n		float D = D_GGX( alpha, dotNH );\n	#endif\n	return F * ( V * D );\n}\nvec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {\n	const float LUT_SIZE = 64.0;\n	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;\n	const float LUT_BIAS = 0.5 / LUT_SIZE;\n	float dotNV = saturate( dot( N, V ) );\n	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );\n	uv = uv * LUT_SCALE + LUT_BIAS;\n	return uv;\n}\nfloat LTC_ClippedSphereFormFactor( const in vec3 f ) {\n	float l = length( f );\n	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );\n}\nvec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {\n	float x = dot( v1, v2 );\n	float y = abs( x );\n	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;\n	float b = 3.4175940 + ( 4.1616724 + y ) * y;\n	float v = a / b;\n	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;\n	return cross( v1, v2 ) * theta_sintheta;\n}\nvec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {\n	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];\n	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];\n	vec3 lightNormal = cross( v1, v2 );\n	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );\n	vec3 T1, T2;\n	T1 = normalize( V - N * dot( V, N ) );\n	T2 = - cross( N, T1 );\n	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );\n	vec3 coords[ 4 ];\n	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );\n	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );\n	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );\n	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );\n	coords[ 0 ] = normalize( coords[ 0 ] );\n	coords[ 1 ] = normalize( coords[ 1 ] );\n	coords[ 2 ] = normalize( coords[ 2 ] );\n	coords[ 3 ] = normalize( coords[ 3 ] );\n	vec3 vectorFormFactor = vec3( 0.0 );\n	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );\n	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );\n	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );\n	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );\n	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );\n	return vec3( result );\n}\n#if defined( USE_SHEEN )\nfloat D_Charlie( float roughness, float dotNH ) {\n	float alpha = pow2( roughness );\n	float invAlpha = 1.0 / alpha;\n	float cos2h = dotNH * dotNH;\n	float sin2h = max( 1.0 - cos2h, 0.0078125 );\n	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );\n}\nfloat V_Neubelt( float dotNV, float dotNL ) {\n	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );\n}\nvec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {\n	vec3 halfDir = normalize( lightDir + viewDir );\n	float dotNL = saturate( dot( normal, lightDir ) );\n	float dotNV = saturate( dot( normal, viewDir ) );\n	float dotNH = saturate( dot( normal, halfDir ) );\n	float D = D_Charlie( sheenRoughness, dotNH );\n	float V = V_Neubelt( dotNV, dotNL );\n	return sheenColor * ( D * V );\n}\n#endif\nfloat IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {\n	float dotNV = saturate( dot( normal, viewDir ) );\n	float r2 = roughness * roughness;\n	float rInv = 1.0 / ( roughness + 0.1 );\n	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;\n	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;\n	float DG = exp( a * dotNV + b );\n	return saturate( DG );\n}\nvec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {\n	float dotNV = saturate( dot( normal, viewDir ) );\n	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;\n	return specularColor * fab.x + specularF90 * fab.y;\n}\n#ifdef USE_IRIDESCENCE\nvoid computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {\n#else\nvoid computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {\n#endif\n	#ifdef USE_IRIDESCENCE\n		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );\n	#else\n		vec3 Fr = specularColor;\n	#endif\n	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;\n	float Ess = fab.x + fab.y;\n	float Ems = 1.0 - Ess;\n	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );\n	singleScatter += FssEss;\n	multiScatter += Fms * Ems;\n}\n#if NUM_RECT_AREA_LIGHTS > 0\n	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {\n		vec3 normal = geometryNormal;\n		vec3 viewDir = geometryViewDir;\n		vec3 position = geometryPosition;\n		vec3 lightPos = rectAreaLight.position;\n		vec3 halfWidth = rectAreaLight.halfWidth;\n		vec3 halfHeight = rectAreaLight.halfHeight;\n		vec3 lightColor = rectAreaLight.color;\n		float roughness = material.roughness;\n		vec3 rectCoords[ 4 ];\n		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;\n		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;\n		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;\n		vec2 uv = LTC_Uv( normal, viewDir, roughness );\n		vec4 t1 = texture2D( ltc_1, uv );\n		vec4 t2 = texture2D( ltc_2, uv );\n		mat3 mInv = mat3(\n			vec3( t1.x, 0, t1.y ),\n			vec3(    0, 1,    0 ),\n			vec3( t1.z, 0, t1.w )\n		);\n		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );\n		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );\n		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );\n		#ifdef USE_CLEARCOAT\n			vec3 Ncc = geometryClearcoatNormal;\n			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );\n			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );\n			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );\n			mat3 mInvClearcoat = mat3(\n				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),\n				vec3(             0, 1,             0 ),\n				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )\n			);\n			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;\n			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );\n		#endif\n	}\n#endif\nvoid RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {\n	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );\n	vec3 irradiance = dotNL * directLight.color;\n	#ifdef USE_CLEARCOAT\n		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );\n		vec3 ccIrradiance = dotNLcc * directLight.color;\n		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );\n	#endif\n	#ifdef USE_SHEEN\n \n 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );\n \n 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );\n 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );\n \n 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );\n \n 		irradiance *= sheenEnergyComp;\n \n 	#endif\n	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );\n	#ifdef USE_RETROREFLECTION\n		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );\n		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );\n		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );\n	#endif\n	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;\n	vec3 halfDir = normalize( directLight.direction + geometryViewDir );\n	float dotVH = saturate( dot( geometryViewDir, halfDir ) );\n	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );\n	#ifdef USE_RETROREFLECTION\n		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );\n		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );\n		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );\n		F = mix( F, retroF, saturate( material.retroreflectivity ) );\n	#endif\n	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - F );\n}\nvoid RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {\n	vec3 singleScattering = vec3( 0.0 );\n	vec3 multiScattering = vec3( 0.0 );\n	#ifdef USE_IRIDESCENCE\n		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );\n	#else\n		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );\n	#endif\n	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );\n	#ifdef USE_SHEEN\n		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );\n		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;\n		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;\n		diffuse *= sheenEnergyComp;\n	#endif\n	reflectedLight.indirectDiffuse += diffuse;\n}\nvoid RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {\n	#ifdef USE_CLEARCOAT\n		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );\n	#endif\n	#ifdef USE_SHEEN\n		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;\n 	#endif\n	vec3 singleScatteringDielectric = vec3( 0.0 );\n	vec3 multiScatteringDielectric = vec3( 0.0 );\n	vec3 singleScatteringMetallic = vec3( 0.0 );\n	vec3 multiScatteringMetallic = vec3( 0.0 );\n	#ifdef USE_IRIDESCENCE\n		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );\n		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );\n	#else\n		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );\n		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );\n	#endif\n	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );\n	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );\n	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;\n	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );\n	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;\n	vec3 indirectSpecular = radiance * singleScattering;\n	indirectSpecular += multiScattering * cosineWeightedIrradiance;\n	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;\n	#ifdef USE_SHEEN\n		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );\n		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;\n		indirectSpecular *= sheenEnergyComp;\n		indirectDiffuse *= sheenEnergyComp;\n	#endif\n	reflectedLight.indirectSpecular += indirectSpecular;\n	reflectedLight.indirectDiffuse += indirectDiffuse;\n}\n#define RE_Direct				RE_Direct_Physical\n#define RE_Direct_RectArea		RE_Direct_RectArea_Physical\n#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical\n#define RE_IndirectSpecular		RE_IndirectSpecular_Physical\nfloat computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {\n	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );\n}",
	lights_fragment_begin: "\nvec3 geometryPosition = - vViewPosition;\nvec3 geometryNormal = normal;\nvec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );\nvec3 geometryClearcoatNormal = vec3( 0.0 );\n#ifdef USE_CLEARCOAT\n	geometryClearcoatNormal = clearcoatNormal;\n#endif\n#ifdef USE_IRIDESCENCE\n	float dotNVi = saturate( dot( normal, geometryViewDir ) );\n	if ( material.iridescenceThickness == 0.0 ) {\n		material.iridescence = 0.0;\n	} else {\n		material.iridescence = saturate( material.iridescence );\n	}\n	if ( material.iridescence > 0.0 ) {\n		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );\n		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );\n		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );\n		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );\n		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );\n	}\n#endif\n#ifdef STANDARD\n	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );\n	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;\n	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )\n		float EssMs = material.dfg.x + material.dfg.y;\n		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );\n	#endif\n#endif\nIncidentLight directLight;\n#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )\n	PointLight pointLight;\n	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0\n	PointLightShadow pointLightShadow;\n	#endif\n	#pragma unroll_loop_start\n	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {\n		pointLight = pointLights[ i ];\n		getPointLightInfo( pointLight, geometryPosition, directLight );\n		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )\n		pointLightShadow = pointLightShadows[ i ];\n		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;\n		#endif\n		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );\n	}\n	#pragma unroll_loop_end\n#endif\n#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )\n	SpotLight spotLight;\n	vec4 spotColor;\n	vec3 spotLightCoord;\n	bool inSpotLightMap;\n	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0\n	SpotLightShadow spotLightShadow;\n	#endif\n	#pragma unroll_loop_start\n	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {\n		spotLight = spotLights[ i ];\n		getSpotLightInfo( spotLight, geometryPosition, directLight );\n		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )\n		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX\n		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )\n		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS\n		#else\n		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )\n		#endif\n		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )\n			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;\n			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );\n			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );\n			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;\n		#endif\n		#undef SPOT_LIGHT_MAP_INDEX\n		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )\n		spotLightShadow = spotLightShadows[ i ];\n		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;\n		#endif\n		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );\n	}\n	#pragma unroll_loop_end\n#endif\n#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )\n	SunLight sunLight;\n	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0\n	SunLightShadow sunLightShadow;\n	#endif\n	#pragma unroll_loop_start\n	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {\n		sunLight = sunLights[ i ];\n		getSunLightInfo( sunLight, directLight );\n		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )\n		sunLightShadow = sunLightShadows[ i ];\n		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;\n		#endif\n		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );\n	}\n	#pragma unroll_loop_end\n#endif\n#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )\n	DirectionalLight directionalLight;\n	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0\n	DirectionalLightShadow directionalLightShadow;\n	#endif\n	#pragma unroll_loop_start\n	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {\n		directionalLight = directionalLights[ i ];\n		getDirectionalLightInfo( directionalLight, directLight );\n		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )\n		directionalLightShadow = directionalLightShadows[ i ];\n		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;\n		#endif\n		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );\n	}\n	#pragma unroll_loop_end\n#endif\n#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )\n	RectAreaLight rectAreaLight;\n	#pragma unroll_loop_start\n	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {\n		rectAreaLight = rectAreaLights[ i ];\n		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );\n	}\n	#pragma unroll_loop_end\n#endif\n#if defined( RE_IndirectDiffuse )\n	vec3 iblIrradiance = vec3( 0.0 );\n	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );\n	#if defined( USE_LIGHT_PROBES )\n		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );\n	#endif\n	#if ( NUM_HEMI_LIGHTS > 0 )\n		#pragma unroll_loop_start\n		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {\n			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );\n		}\n		#pragma unroll_loop_end\n	#endif\n	#ifdef USE_LIGHT_PROBES_GRID\n		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;\n		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );\n		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );\n	#endif\n#endif\n#if defined( RE_IndirectSpecular )\n	vec3 radiance = vec3( 0.0 );\n	vec3 clearcoatRadiance = vec3( 0.0 );\n#endif",
	lights_fragment_maps: "#if defined( RE_IndirectDiffuse )\n	#ifdef USE_LIGHTMAP\n		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );\n		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;\n		irradiance += lightMapIrradiance;\n	#endif\n	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )\n		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )\n			iblIrradiance += getIBLIrradiance( geometryNormal );\n		#endif\n	#endif\n#endif\n#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )\n	#ifdef USE_ANISOTROPY\n		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );\n	#else\n		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );\n	#endif\n	#ifdef USE_RETROREFLECTION\n		#ifdef USE_ANISOTROPY\n			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );\n		#else\n			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );\n		#endif\n		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );\n	#endif\n	radiance += iblRadiance;\n	#ifdef USE_CLEARCOAT\n		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );\n	#endif\n#endif",
	lights_fragment_end: "#if defined( RE_IndirectDiffuse )\n	#if defined( LAMBERT ) || defined( PHONG )\n		irradiance += iblIrradiance;\n	#endif\n	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );\n#endif\n#if defined( RE_IndirectSpecular )\n	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );\n#endif",
	lightprobes_pars_fragment: "#ifdef USE_LIGHT_PROBES_GRID\nuniform highp sampler3D probesSH;\nuniform vec3 probesMin;\nuniform vec3 probesMax;\nuniform vec3 probesResolution;\nvec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {\n	vec3 res = probesResolution;\n	vec3 gridRange = probesMax - probesMin;\n	vec3 resMinusOne = res - 1.0;\n	vec3 probeSpacing = gridRange / resMinusOne;\n	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;\n	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );\n	uvw = uvw * resMinusOne / res + 0.5 / res;\n	float nz          = res.z;\n	float paddedSlices = nz + 2.0;\n	float atlasDepth  = 7.0 * paddedSlices;\n	float uvZBase     = uvw.z * nz + 1.0;\n	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );\n	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );\n	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );\n	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );\n	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );\n	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );\n	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );\n	vec3 c0 = s0.xyz;\n	vec3 c1 = vec3( s0.w, s1.xy );\n	vec3 c2 = vec3( s1.zw, s2.x );\n	vec3 c3 = s2.yzw;\n	vec3 c4 = s3.xyz;\n	vec3 c5 = vec3( s3.w, s4.xy );\n	vec3 c6 = vec3( s4.zw, s5.x );\n	vec3 c7 = s5.yzw;\n	vec3 c8 = s6.xyz;\n	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;\n	vec3 result = c0 * 0.886227;\n	result += c1 * 2.0 * 0.511664 * y;\n	result += c2 * 2.0 * 0.511664 * z;\n	result += c3 * 2.0 * 0.511664 * x;\n	result += c4 * 2.0 * 0.429043 * x * y;\n	result += c5 * 2.0 * 0.429043 * y * z;\n	result += c6 * ( 0.743125 * z * z - 0.247708 );\n	result += c7 * 2.0 * 0.429043 * x * z;\n	result += c8 * 0.429043 * ( x * x - y * y );\n	return max( result, vec3( 0.0 ) );\n}\n#endif",
	logdepthbuf_fragment: "#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )\n	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;\n#endif",
	logdepthbuf_pars_fragment: "#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )\n	uniform float logDepthBufFC;\n	varying float vFragDepth;\n	varying float vIsPerspective;\n#endif",
	logdepthbuf_pars_vertex: "#ifdef USE_LOGARITHMIC_DEPTH_BUFFER\n	varying float vFragDepth;\n	varying float vIsPerspective;\n#endif",
	logdepthbuf_vertex: "#ifdef USE_LOGARITHMIC_DEPTH_BUFFER\n	vFragDepth = 1.0 + gl_Position.w;\n	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );\n#endif",
	map_fragment: "#ifdef USE_MAP\n	vec4 sampledDiffuseColor = texture2D( map, vMapUv );\n	#ifdef DECODE_VIDEO_TEXTURE\n		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );\n	#endif\n	diffuseColor *= sampledDiffuseColor;\n#endif",
	map_pars_fragment: "#ifdef USE_MAP\n	uniform sampler2D map;\n#endif",
	map_particle_fragment: "#if defined( USE_MAP ) || defined( USE_ALPHAMAP )\n	#if defined( USE_POINTS_UV )\n		vec2 uv = vUv;\n	#else\n		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;\n	#endif\n#endif\n#ifdef USE_MAP\n	diffuseColor *= texture2D( map, uv );\n#endif\n#ifdef USE_ALPHAMAP\n	diffuseColor.a *= texture2D( alphaMap, uv ).g;\n#endif",
	map_particle_pars_fragment: "#if defined( USE_POINTS_UV )\n	varying vec2 vUv;\n#else\n	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )\n		uniform mat3 uvTransform;\n	#endif\n#endif\n#ifdef USE_MAP\n	uniform sampler2D map;\n#endif\n#ifdef USE_ALPHAMAP\n	uniform sampler2D alphaMap;\n#endif",
	metalnessmap_fragment: "float metalnessFactor = metalness;\n#ifdef USE_METALNESSMAP\n	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );\n	metalnessFactor *= texelMetalness.b;\n#endif",
	metalnessmap_pars_fragment: "#ifdef USE_METALNESSMAP\n	uniform sampler2D metalnessMap;\n#endif",
	morphinstance_vertex: "#ifdef USE_INSTANCING_MORPH\n	float morphTargetInfluences[ MORPHTARGETS_COUNT ];\n	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;\n	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {\n		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;\n	}\n#endif",
	morphcolor_vertex: "#if defined( USE_MORPHCOLORS )\n	vColor *= morphTargetBaseInfluence;\n	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {\n		#if defined( USE_COLOR_ALPHA )\n			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];\n		#elif defined( USE_COLOR )\n			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];\n		#endif\n	}\n#endif",
	morphnormal_vertex: "#ifdef USE_MORPHNORMALS\n	objectNormal *= morphTargetBaseInfluence;\n	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {\n		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];\n	}\n#endif",
	morphtarget_pars_vertex: "#ifdef USE_MORPHTARGETS\n	#ifndef USE_INSTANCING_MORPH\n		uniform float morphTargetBaseInfluence;\n		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];\n	#endif\n	uniform sampler2DArray morphTargetsTexture;\n	uniform ivec2 morphTargetsTextureSize;\n	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {\n		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;\n		int y = texelIndex / morphTargetsTextureSize.x;\n		int x = texelIndex - y * morphTargetsTextureSize.x;\n		ivec3 morphUV = ivec3( x, y, morphTargetIndex );\n		return texelFetch( morphTargetsTexture, morphUV, 0 );\n	}\n#endif",
	morphtarget_vertex: "#ifdef USE_MORPHTARGETS\n	transformed *= morphTargetBaseInfluence;\n	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {\n		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];\n	}\n#endif",
	normal_fragment_begin: "float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;\n#ifdef FLAT_SHADED\n	vec3 fdx = dFdx( vViewPosition );\n	vec3 fdy = dFdy( vViewPosition );\n	vec3 normal = normalize( cross( fdx, fdy ) );\n#else\n	vec3 normal = normalize( vNormal );\n	#ifdef DOUBLE_SIDED\n		normal *= faceDirection;\n	#endif\n#endif\n#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )\n	#ifdef USE_TANGENT\n		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );\n	#else\n		mat3 tbn = getTangentFrame( - vViewPosition, normal,\n		#if defined( USE_NORMALMAP )\n			vNormalMapUv\n		#elif defined( USE_CLEARCOAT_NORMALMAP )\n			vClearcoatNormalMapUv\n		#else\n			vUv\n		#endif\n		);\n	#endif\n	#ifdef DOUBLE_SIDED\n		tbn[0] *= faceDirection;\n		tbn[1] *= faceDirection;\n	#endif\n#endif\n#ifdef USE_CLEARCOAT_NORMALMAP\n	#ifdef USE_TANGENT\n		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );\n	#else\n		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );\n	#endif\n	#ifdef DOUBLE_SIDED\n		tbn2[0] *= faceDirection;\n		tbn2[1] *= faceDirection;\n	#endif\n#endif\nvec3 nonPerturbedNormal = normal;",
	normal_fragment_maps: "#ifdef USE_NORMALMAP_OBJECTSPACE\n	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;\n	#ifdef FLIP_SIDED\n		normal = - normal;\n	#endif\n	#ifdef DOUBLE_SIDED\n		normal = normal * faceDirection;\n	#endif\n	normal = normalize( normalMatrix * normal );\n#elif defined( USE_NORMALMAP_TANGENTSPACE )\n	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;\n	#if defined( USE_PACKED_NORMALMAP )\n		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );\n	#endif\n	mapN.xy *= normalScale;\n	normal = normalize( tbn * mapN );\n#elif defined( USE_BUMPMAP )\n	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );\n#endif",
	normal_pars_fragment: "#ifndef FLAT_SHADED\n	varying vec3 vNormal;\n	#ifdef USE_TANGENT\n		varying vec3 vTangent;\n		varying vec3 vBitangent;\n	#endif\n#endif",
	normal_pars_vertex: "#ifndef FLAT_SHADED\n	varying vec3 vNormal;\n	#ifdef USE_TANGENT\n		varying vec3 vTangent;\n		varying vec3 vBitangent;\n	#endif\n#endif",
	normal_vertex: "#ifndef FLAT_SHADED\n	vNormal = normalize( transformedNormal );\n	#ifdef USE_TANGENT\n		vTangent = normalize( transformedTangent );\n		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );\n		#ifdef FLIP_SIDED\n			vBitangent = - vBitangent;\n		#endif\n	#endif\n#endif",
	normalmap_pars_fragment: "#ifdef USE_NORMALMAP\n	uniform sampler2D normalMap;\n	uniform vec2 normalScale;\n#endif\n#ifdef USE_NORMALMAP_OBJECTSPACE\n	uniform mat3 normalMatrix;\n#endif\n#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )\n	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {\n		vec3 q0 = dFdx( eye_pos.xyz );\n		vec3 q1 = dFdy( eye_pos.xyz );\n		vec2 st0 = dFdx( uv.st );\n		vec2 st1 = dFdy( uv.st );\n		vec3 N = surf_norm;\n		vec3 q1perp = cross( q1, N );\n		vec3 q0perp = cross( N, q0 );\n		vec3 T = q1perp * st0.x + q0perp * st1.x;\n		vec3 B = q1perp * st0.y + q0perp * st1.y;\n		float det = max( dot( T, T ), dot( B, B ) );\n		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );\n		return mat3( T * scale, B * scale, N );\n	}\n#endif",
	clearcoat_normal_fragment_begin: "#ifdef USE_CLEARCOAT\n	vec3 clearcoatNormal = nonPerturbedNormal;\n#endif",
	clearcoat_normal_fragment_maps: "#ifdef USE_CLEARCOAT_NORMALMAP\n	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;\n	clearcoatMapN.xy *= clearcoatNormalScale;\n	clearcoatNormal = normalize( tbn2 * clearcoatMapN );\n#endif",
	clearcoat_pars_fragment: "#ifdef USE_CLEARCOATMAP\n	uniform sampler2D clearcoatMap;\n#endif\n#ifdef USE_CLEARCOAT_NORMALMAP\n	uniform sampler2D clearcoatNormalMap;\n	uniform vec2 clearcoatNormalScale;\n#endif\n#ifdef USE_CLEARCOAT_ROUGHNESSMAP\n	uniform sampler2D clearcoatRoughnessMap;\n#endif",
	iridescence_pars_fragment: "#ifdef USE_IRIDESCENCEMAP\n	uniform sampler2D iridescenceMap;\n#endif\n#ifdef USE_IRIDESCENCE_THICKNESSMAP\n	uniform sampler2D iridescenceThicknessMap;\n#endif",
	opaque_fragment: "#ifdef OPAQUE\ndiffuseColor.a = 1.0;\n#endif\n#ifdef USE_TRANSMISSION\ndiffuseColor.a *= material.transmissionAlpha;\n#endif\ngl_FragColor = vec4( outgoingLight, diffuseColor.a );",
	packing: "vec3 packNormalToRGB( const in vec3 normal ) {\n	return normalize( normal ) * 0.5 + 0.5;\n}\nvec3 unpackRGBToNormal( const in vec3 rgb ) {\n	return 2.0 * rgb.xyz - 1.0;\n}\nconst float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;\nconst float Inv255 = 1. / 255.;\nconst vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );\nconst vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );\nconst vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );\nconst vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );\nvec4 packDepthToRGBA( const in float v ) {\n	if( v <= 0.0 )\n		return vec4( 0., 0., 0., 0. );\n	if( v >= 1.0 )\n		return vec4( 1., 1., 1., 1. );\n	float vuf;\n	float af = modf( v * PackFactors.a, vuf );\n	float bf = modf( vuf * ShiftRight8, vuf );\n	float gf = modf( vuf * ShiftRight8, vuf );\n	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );\n}\nvec3 packDepthToRGB( const in float v ) {\n	if( v <= 0.0 )\n		return vec3( 0., 0., 0. );\n	if( v >= 1.0 )\n		return vec3( 1., 1., 1. );\n	float vuf;\n	float bf = modf( v * PackFactors.b, vuf );\n	float gf = modf( vuf * ShiftRight8, vuf );\n	return vec3( vuf * Inv255, gf * PackUpscale, bf );\n}\nvec2 packDepthToRG( const in float v ) {\n	if( v <= 0.0 )\n		return vec2( 0., 0. );\n	if( v >= 1.0 )\n		return vec2( 1., 1. );\n	float vuf;\n	float gf = modf( v * 256., vuf );\n	return vec2( vuf * Inv255, gf );\n}\nfloat unpackRGBAToDepth( const in vec4 v ) {\n	return dot( v, UnpackFactors4 );\n}\nfloat unpackRGBToDepth( const in vec3 v ) {\n	return dot( v, UnpackFactors3 );\n}\nfloat unpackRGToDepth( const in vec2 v ) {\n	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;\n}\nvec4 pack2HalfToRGBA( const in vec2 v ) {\n	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );\n	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );\n}\nvec2 unpackRGBATo2Half( const in vec4 v ) {\n	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );\n}\nfloat viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {\n	return ( viewZ + near ) / ( near - far );\n}\nfloat orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {\n	#ifdef USE_REVERSED_DEPTH_BUFFER\n	\n		return depth * ( far - near ) - far;\n	#else\n		return depth * ( near - far ) - near;\n	#endif\n}\nfloat viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {\n	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );\n}\nfloat perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {\n	\n	#ifdef USE_REVERSED_DEPTH_BUFFER\n		return ( near * far ) / ( ( near - far ) * depth - near );\n	#else\n		return ( near * far ) / ( ( far - near ) * depth - far );\n	#endif\n}",
	premultiplied_alpha_fragment: "#ifdef PREMULTIPLIED_ALPHA\n	gl_FragColor.rgb *= gl_FragColor.a;\n#endif",
	project_vertex: "vec4 mvPosition = vec4( transformed, 1.0 );\n#ifdef USE_BATCHING\n	mvPosition = batchingMatrix * mvPosition;\n#endif\n#ifdef USE_INSTANCING\n	mvPosition = instanceMatrix * mvPosition;\n#endif\nmvPosition = modelViewMatrix * mvPosition;\ngl_Position = projectionMatrix * mvPosition;",
	dithering_fragment: "#ifdef DITHERING\n	gl_FragColor.rgb = dithering( gl_FragColor.rgb );\n#endif",
	dithering_pars_fragment: "#ifdef DITHERING\n	vec3 dithering( vec3 color ) {\n		float grid_position = rand( gl_FragCoord.xy );\n		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );\n		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );\n		return color + dither_shift_RGB;\n	}\n#endif",
	roughnessmap_fragment: "float roughnessFactor = roughness;\n#ifdef USE_ROUGHNESSMAP\n	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );\n	roughnessFactor *= texelRoughness.g;\n#endif",
	roughnessmap_pars_fragment: "#ifdef USE_ROUGHNESSMAP\n	uniform sampler2D roughnessMap;\n#endif",
	shadowmap_pars_fragment: "#if NUM_SPOT_LIGHT_COORDS > 0\n	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];\n#endif\n#if NUM_SPOT_LIGHT_MAPS > 0\n	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];\n#endif\n#ifdef USE_SHADOWMAP\n	#if NUM_SUN_LIGHT_SHADOWS > 0\n		#define SUN_LIGHT_CASCADES 2\n		#if defined( SHADOWMAP_TYPE_PCF )\n			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];\n		#else\n			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];\n		#endif\n		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];\n		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];\n		varying vec4 vSunShadowWorldPosition;\n		varying vec3 vSunShadowWorldNormal;\n		struct SunLightShadow {\n			float shadowIntensity;\n			float shadowBias;\n			float shadowNormalBias;\n			float shadowRadius;\n			vec2 shadowMapSize;\n		};\n		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];\n	#endif\n	#if NUM_DIR_LIGHT_SHADOWS > 0\n		#if defined( SHADOWMAP_TYPE_PCF )\n			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];\n		#else\n			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];\n		#endif\n		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];\n		struct DirectionalLightShadow {\n			float shadowIntensity;\n			float shadowBias;\n			float shadowNormalBias;\n			float shadowRadius;\n			vec2 shadowMapSize;\n		};\n		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];\n	#endif\n	#if NUM_SPOT_LIGHT_SHADOWS > 0\n		#if defined( SHADOWMAP_TYPE_PCF )\n			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];\n		#else\n			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];\n		#endif\n		struct SpotLightShadow {\n			float shadowIntensity;\n			float shadowBias;\n			float shadowNormalBias;\n			float shadowRadius;\n			vec2 shadowMapSize;\n		};\n		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];\n	#endif\n	#if NUM_POINT_LIGHT_SHADOWS > 0\n		#if defined( SHADOWMAP_TYPE_PCF )\n			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];\n		#elif defined( SHADOWMAP_TYPE_BASIC )\n			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];\n		#endif\n		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];\n		struct PointLightShadow {\n			float shadowIntensity;\n			float shadowBias;\n			float shadowNormalBias;\n			float shadowRadius;\n			vec2 shadowMapSize;\n			float shadowCameraNear;\n			float shadowCameraFar;\n		};\n		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];\n	#endif\n	#if defined( SHADOWMAP_TYPE_PCF )\n		float interleavedGradientNoise( vec2 position ) {\n			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );\n		}\n		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {\n			const float goldenAngle = 2.399963229728653;\n			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );\n			float theta = float( sampleIndex ) * goldenAngle + phi;\n			return vec2( cos( theta ), sin( theta ) ) * r;\n		}\n	#endif\n	#if defined( SHADOWMAP_TYPE_PCF )\n		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {\n			float shadow = 1.0;\n			shadowCoord.xyz /= shadowCoord.w;\n			shadowCoord.z += shadowBias;\n			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;\n			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;\n			if ( frustumTest ) {\n				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;\n				float radius = shadowRadius * texelSize.x;\n				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;\n				shadow = (\n					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +\n					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +\n					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +\n					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +\n					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )\n				) * 0.2;\n			}\n			return mix( 1.0, shadow, shadowIntensity );\n		}\n	#elif defined( SHADOWMAP_TYPE_VSM )\n		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {\n			float shadow = 1.0;\n			shadowCoord.xyz /= shadowCoord.w;\n			#ifdef USE_REVERSED_DEPTH_BUFFER\n				shadowCoord.z -= shadowBias;\n			#else\n				shadowCoord.z += shadowBias;\n			#endif\n			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;\n			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;\n			if ( frustumTest ) {\n				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;\n				float mean = distribution.x;\n				float variance = distribution.y * distribution.y;\n				#ifdef USE_REVERSED_DEPTH_BUFFER\n					float hard_shadow = step( mean, shadowCoord.z );\n				#else\n					float hard_shadow = step( shadowCoord.z, mean );\n				#endif\n				\n				if ( hard_shadow == 1.0 ) {\n					shadow = 1.0;\n				} else {\n					variance = max( variance, 0.0000001 );\n					float d = shadowCoord.z - mean;\n					float p_max = variance / ( variance + d * d );\n					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );\n					shadow = max( hard_shadow, p_max );\n				}\n			}\n			return mix( 1.0, shadow, shadowIntensity );\n		}\n	#else\n		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {\n			float shadow = 1.0;\n			shadowCoord.xyz /= shadowCoord.w;\n			#ifdef USE_REVERSED_DEPTH_BUFFER\n				shadowCoord.z -= shadowBias;\n			#else\n				shadowCoord.z += shadowBias;\n			#endif\n			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;\n			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;\n			if ( frustumTest ) {\n				float depth = texture2D( shadowMap, shadowCoord.xy ).r;\n				#ifdef USE_REVERSED_DEPTH_BUFFER\n					shadow = step( depth, shadowCoord.z );\n				#else\n					shadow = step( shadowCoord.z, depth );\n				#endif\n			}\n			return mix( 1.0, shadow, shadowIntensity );\n		}\n	#endif\n	#if NUM_SUN_LIGHT_SHADOWS > 0\n		float getSunShadow(\n			#if defined( SHADOWMAP_TYPE_PCF )\n				sampler2DShadow shadowMap,\n			#else\n				sampler2D shadowMap,\n			#endif\n			SunLightShadow sunLightShadow,\n			int shadowIndex\n		) {\n			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );\n			float viewDepth = vSunShadowWorldPosition.w;\n			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;\n			float shadow = 1.0;\n			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {\n				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];\n				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {\n					float cascadeShadow = getShadow(\n						shadowMap,\n						sunLightShadow.shadowMapSize,\n						sunLightShadow.shadowIntensity,\n						sunLightShadow.shadowBias,\n						sunLightShadow.shadowRadius,\n						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition\n					);\n					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );\n				}\n			}\n			return shadow;\n		}\n	#endif\n	#if NUM_POINT_LIGHT_SHADOWS > 0\n	#if defined( SHADOWMAP_TYPE_PCF )\n	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {\n		float shadow = 1.0;\n		vec3 lightToPosition = shadowCoord.xyz;\n		vec3 bd3D = normalize( lightToPosition );\n		vec3 absVec = abs( lightToPosition );\n		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );\n		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {\n			#ifdef USE_REVERSED_DEPTH_BUFFER\n				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );\n				dp -= shadowBias;\n			#else\n				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );\n				dp += shadowBias;\n			#endif\n			float texelSize = shadowRadius / shadowMapSize.x;\n			vec3 absDir = abs( bd3D );\n			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );\n			tangent = normalize( cross( bd3D, tangent ) );\n			vec3 bitangent = cross( bd3D, tangent );\n			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;\n			vec2 sample0 = vogelDiskSample( 0, 5, phi );\n			vec2 sample1 = vogelDiskSample( 1, 5, phi );\n			vec2 sample2 = vogelDiskSample( 2, 5, phi );\n			vec2 sample3 = vogelDiskSample( 3, 5, phi );\n			vec2 sample4 = vogelDiskSample( 4, 5, phi );\n			shadow = (\n				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +\n				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +\n				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +\n				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +\n				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )\n			) * 0.2;\n		}\n		return mix( 1.0, shadow, shadowIntensity );\n	}\n	#elif defined( SHADOWMAP_TYPE_BASIC )\n	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {\n		float shadow = 1.0;\n		vec3 lightToPosition = shadowCoord.xyz;\n		vec3 absVec = abs( lightToPosition );\n		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );\n		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {\n			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );\n			dp += shadowBias;\n			vec3 bd3D = normalize( lightToPosition );\n			float depth = textureCube( shadowMap, bd3D ).r;\n			#ifdef USE_REVERSED_DEPTH_BUFFER\n				depth = 1.0 - depth;\n			#endif\n			shadow = step( dp, depth );\n		}\n		return mix( 1.0, shadow, shadowIntensity );\n	}\n	#endif\n	#endif\n#endif",
	shadowmap_pars_vertex: "#if NUM_SPOT_LIGHT_COORDS > 0\n	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];\n	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];\n#endif\n#ifdef USE_SHADOWMAP\n	#if NUM_SUN_LIGHT_SHADOWS > 0\n		varying vec4 vSunShadowWorldPosition;\n		varying vec3 vSunShadowWorldNormal;\n	#endif\n	#if NUM_DIR_LIGHT_SHADOWS > 0\n		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];\n		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];\n		struct DirectionalLightShadow {\n			float shadowIntensity;\n			float shadowBias;\n			float shadowNormalBias;\n			float shadowRadius;\n			vec2 shadowMapSize;\n		};\n		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];\n	#endif\n	#if NUM_SPOT_LIGHT_SHADOWS > 0\n		struct SpotLightShadow {\n			float shadowIntensity;\n			float shadowBias;\n			float shadowNormalBias;\n			float shadowRadius;\n			vec2 shadowMapSize;\n		};\n		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];\n	#endif\n	#if NUM_POINT_LIGHT_SHADOWS > 0\n		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];\n		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];\n		struct PointLightShadow {\n			float shadowIntensity;\n			float shadowBias;\n			float shadowNormalBias;\n			float shadowRadius;\n			vec2 shadowMapSize;\n			float shadowCameraNear;\n			float shadowCameraFar;\n		};\n		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];\n	#endif\n#endif",
	shadowmap_vertex: "#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )\n	#ifdef HAS_NORMAL\n		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );\n	#else\n		vec3 shadowWorldNormal = vec3( 0.0 );\n	#endif\n	vec4 shadowWorldPosition;\n#endif\n#if defined( USE_SHADOWMAP )\n	#if NUM_SUN_LIGHT_SHADOWS > 0\n		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );\n		vSunShadowWorldNormal = shadowWorldNormal;\n	#endif\n	#if NUM_DIR_LIGHT_SHADOWS > 0\n		#pragma unroll_loop_start\n		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {\n			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );\n			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;\n		}\n		#pragma unroll_loop_end\n	#endif\n	#if NUM_POINT_LIGHT_SHADOWS > 0\n		#pragma unroll_loop_start\n		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {\n			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );\n			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;\n		}\n		#pragma unroll_loop_end\n	#endif\n#endif\n#if NUM_SPOT_LIGHT_COORDS > 0\n	#pragma unroll_loop_start\n	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {\n		shadowWorldPosition = worldPosition;\n		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )\n			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;\n		#endif\n		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;\n	}\n	#pragma unroll_loop_end\n#endif",
	shadowmask_pars_fragment: "float getShadowMask() {\n	float shadow = 1.0;\n	#ifdef USE_SHADOWMAP\n	#if NUM_SUN_LIGHT_SHADOWS > 0\n	SunLightShadow sunLight;\n	#pragma unroll_loop_start\n	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {\n		sunLight = sunLightShadows[ i ];\n		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;\n	}\n	#pragma unroll_loop_end\n	#endif\n	#if NUM_DIR_LIGHT_SHADOWS > 0\n	DirectionalLightShadow directionalLight;\n	#pragma unroll_loop_start\n	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {\n		directionalLight = directionalLightShadows[ i ];\n		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;\n	}\n	#pragma unroll_loop_end\n	#endif\n	#if NUM_SPOT_LIGHT_SHADOWS > 0\n	SpotLightShadow spotLight;\n	#pragma unroll_loop_start\n	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {\n		spotLight = spotLightShadows[ i ];\n		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;\n	}\n	#pragma unroll_loop_end\n	#endif\n	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )\n	PointLightShadow pointLight;\n	#pragma unroll_loop_start\n	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {\n		pointLight = pointLightShadows[ i ];\n		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;\n	}\n	#pragma unroll_loop_end\n	#endif\n	#endif\n	return shadow;\n}",
	skinbase_vertex: "#ifdef USE_SKINNING\n	mat4 boneMatX = getBoneMatrix( skinIndex.x );\n	mat4 boneMatY = getBoneMatrix( skinIndex.y );\n	mat4 boneMatZ = getBoneMatrix( skinIndex.z );\n	mat4 boneMatW = getBoneMatrix( skinIndex.w );\n#endif",
	skinning_pars_vertex: "#ifdef USE_SKINNING\n	uniform mat4 bindMatrix;\n	uniform mat4 bindMatrixInverse;\n	uniform highp sampler2D boneTexture;\n	mat4 getBoneMatrix( const in float i ) {\n		int size = textureSize( boneTexture, 0 ).x;\n		int j = int( i ) * 4;\n		int x = j % size;\n		int y = j / size;\n		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );\n		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );\n		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );\n		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );\n		return mat4( v1, v2, v3, v4 );\n	}\n#endif",
	skinning_vertex: "#ifdef USE_SKINNING\n	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );\n	vec4 skinned = vec4( 0.0 );\n	skinned += boneMatX * skinVertex * skinWeight.x;\n	skinned += boneMatY * skinVertex * skinWeight.y;\n	skinned += boneMatZ * skinVertex * skinWeight.z;\n	skinned += boneMatW * skinVertex * skinWeight.w;\n	transformed = ( bindMatrixInverse * skinned ).xyz;\n#endif",
	skinnormal_vertex: "#ifdef USE_SKINNING\n	mat4 skinMatrix = mat4( 0.0 );\n	skinMatrix += skinWeight.x * boneMatX;\n	skinMatrix += skinWeight.y * boneMatY;\n	skinMatrix += skinWeight.z * boneMatZ;\n	skinMatrix += skinWeight.w * boneMatW;\n	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;\n	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;\n	#ifdef USE_TANGENT\n		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;\n	#endif\n#endif",
	specularmap_fragment: "float specularStrength;\n#ifdef USE_SPECULARMAP\n	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );\n	specularStrength = texelSpecular.r;\n#else\n	specularStrength = 1.0;\n#endif",
	specularmap_pars_fragment: "#ifdef USE_SPECULARMAP\n	uniform sampler2D specularMap;\n#endif",
	tonemapping_fragment: "#if defined( TONE_MAPPING )\n	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );\n#endif",
	tonemapping_pars_fragment: "#ifndef saturate\n#define saturate( a ) clamp( a, 0.0, 1.0 )\n#endif\nuniform float toneMappingExposure;\nvec3 LinearToneMapping( vec3 color ) {\n	return saturate( toneMappingExposure * color );\n}\nvec3 ReinhardToneMapping( vec3 color ) {\n	color *= toneMappingExposure;\n	return saturate( color / ( vec3( 1.0 ) + color ) );\n}\nvec3 CineonToneMapping( vec3 color ) {\n	color *= toneMappingExposure;\n	color = max( vec3( 0.0 ), color - 0.004 );\n	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );\n}\nvec3 RRTAndODTFit( vec3 v ) {\n	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;\n	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;\n	return a / b;\n}\nvec3 ACESFilmicToneMapping( vec3 color ) {\n	const mat3 ACESInputMat = mat3(\n		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),\n		vec3( 0.04823, 0.01566, 0.83777 )\n	);\n	const mat3 ACESOutputMat = mat3(\n		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),\n		vec3( -0.07367, -0.00605,  1.07602 )\n	);\n	color *= toneMappingExposure / 0.6;\n	color = ACESInputMat * color;\n	color = RRTAndODTFit( color );\n	color = ACESOutputMat * color;\n	return saturate( color );\n}\nconst mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(\n	vec3( 1.6605, - 0.1246, - 0.0182 ),\n	vec3( - 0.5876, 1.1329, - 0.1006 ),\n	vec3( - 0.0728, - 0.0083, 1.1187 )\n);\nconst mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(\n	vec3( 0.6274, 0.0691, 0.0164 ),\n	vec3( 0.3293, 0.9195, 0.0880 ),\n	vec3( 0.0433, 0.0113, 0.8956 )\n);\nvec3 agxDefaultContrastApprox( vec3 x ) {\n	vec3 x2 = x * x;\n	vec3 x4 = x2 * x2;\n	return + 15.5 * x4 * x2\n		- 40.14 * x4 * x\n		+ 31.96 * x4\n		- 6.868 * x2 * x\n		+ 0.4298 * x2\n		+ 0.1191 * x\n		- 0.00232;\n}\nvec3 AgXToneMapping( vec3 color ) {\n	const mat3 AgXInsetMatrix = mat3(\n		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),\n		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),\n		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )\n	);\n	const mat3 AgXOutsetMatrix = mat3(\n		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),\n		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),\n		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )\n	);\n	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;\n	color *= toneMappingExposure;\n	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;\n	color = AgXInsetMatrix * color;\n	color = max( color, 1e-10 );	color = log2( color );\n	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );\n	color = clamp( color, 0.0, 1.0 );\n	color = agxDefaultContrastApprox( color );\n	color = AgXOutsetMatrix * color;\n	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );\n	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;\n	color = clamp( color, 0.0, 1.0 );\n	return color;\n}\nvec3 NeutralToneMapping( vec3 color ) {\n	const float StartCompression = 0.8 - 0.04;\n	const float Desaturation = 0.15;\n	color *= toneMappingExposure;\n	float x = min( color.r, min( color.g, color.b ) );\n	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;\n	color -= offset;\n	float peak = max( color.r, max( color.g, color.b ) );\n	if ( peak < StartCompression ) return color;\n	float d = 1. - StartCompression;\n	float newPeak = 1. - d * d / ( peak + d - StartCompression );\n	color *= newPeak / peak;\n	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );\n	return mix( color, vec3( newPeak ), g );\n}\nvec3 CustomToneMapping( vec3 color ) { return color; }",
	transmission_fragment: "#ifdef USE_TRANSMISSION\n	material.transmission = transmission;\n	material.transmissionAlpha = 1.0;\n	material.thickness = thickness;\n	material.attenuationDistance = attenuationDistance;\n	material.attenuationColor = attenuationColor;\n	#ifdef USE_TRANSMISSIONMAP\n		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;\n	#endif\n	#ifdef USE_THICKNESSMAP\n		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;\n	#endif\n	vec3 pos = vWorldPosition;\n	vec3 v = normalize( cameraPosition - pos );\n	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );\n	vec4 transmitted = getIBLVolumeRefraction(\n		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,\n		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,\n		material.attenuationColor, material.attenuationDistance );\n	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );\n	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );\n#endif",
	transmission_pars_fragment: "#ifdef USE_TRANSMISSION\n	uniform float transmission;\n	uniform float thickness;\n	uniform float attenuationDistance;\n	uniform vec3 attenuationColor;\n	#ifdef USE_TRANSMISSIONMAP\n		uniform sampler2D transmissionMap;\n	#endif\n	#ifdef USE_THICKNESSMAP\n		uniform sampler2D thicknessMap;\n	#endif\n	uniform vec2 transmissionSamplerSize;\n	uniform sampler2D transmissionSamplerMap;\n	uniform mat4 modelMatrix;\n	uniform mat4 projectionMatrix;\n	varying vec3 vWorldPosition;\n	float w0( float a ) {\n		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );\n	}\n	float w1( float a ) {\n		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );\n	}\n	float w2( float a ){\n		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );\n	}\n	float w3( float a ) {\n		return ( 1.0 / 6.0 ) * ( a * a * a );\n	}\n	float g0( float a ) {\n		return w0( a ) + w1( a );\n	}\n	float g1( float a ) {\n		return w2( a ) + w3( a );\n	}\n	float h0( float a ) {\n		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );\n	}\n	float h1( float a ) {\n		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );\n	}\n	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {\n		uv = uv * texelSize.zw + 0.5;\n		vec2 iuv = floor( uv );\n		vec2 fuv = fract( uv );\n		float g0x = g0( fuv.x );\n		float g1x = g1( fuv.x );\n		float h0x = h0( fuv.x );\n		float h1x = h1( fuv.x );\n		float h0y = h0( fuv.y );\n		float h1y = h1( fuv.y );\n		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;\n		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;\n		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;\n		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;\n		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +\n			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );\n	}\n	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {\n		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );\n		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );\n		vec2 fLodSizeInv = 1.0 / fLodSize;\n		vec2 cLodSizeInv = 1.0 / cLodSize;\n		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );\n		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );\n		return mix( fSample, cSample, fract( lod ) );\n	}\n	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {\n		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );\n		vec3 modelScale;\n		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );\n		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );\n		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );\n		return normalize( refractionVector ) * thickness * modelScale;\n	}\n	float applyIorToRoughness( const in float roughness, const in float ior ) {\n		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );\n	}\n	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {\n		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );\n		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );\n	}\n	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {\n		if ( isinf( attenuationDistance ) ) {\n			return vec3( 1.0 );\n		} else {\n			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;\n			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;\n		}\n	}\n	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,\n		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,\n		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,\n		const in vec3 attenuationColor, const in float attenuationDistance ) {\n		vec4 transmittedLight;\n		vec3 transmittance;\n		#ifdef USE_DISPERSION\n			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;\n			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );\n			for ( int i = 0; i < 3; i ++ ) {\n				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );\n				vec3 refractedRayExit = position + transmissionRay;\n				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );\n				vec2 refractionCoords = ndcPos.xy / ndcPos.w;\n				refractionCoords += 1.0;\n				refractionCoords /= 2.0;\n				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );\n				transmittedLight[ i ] = transmissionSample[ i ];\n				transmittedLight.a += transmissionSample.a;\n				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];\n			}\n			transmittedLight.a /= 3.0;\n		#else\n			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );\n			vec3 refractedRayExit = position + transmissionRay;\n			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );\n			vec2 refractionCoords = ndcPos.xy / ndcPos.w;\n			refractionCoords += 1.0;\n			refractionCoords /= 2.0;\n			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );\n			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );\n		#endif\n		vec3 attenuatedColor = transmittance * transmittedLight.rgb;\n		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );\n		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;\n		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );\n	}\n#endif",
	uv_pars_fragment: "#if defined( USE_UV ) || defined( USE_ANISOTROPY )\n	varying vec2 vUv;\n#endif\n#ifdef USE_MAP\n	varying vec2 vMapUv;\n#endif\n#ifdef USE_ALPHAMAP\n	varying vec2 vAlphaMapUv;\n#endif\n#ifdef USE_LIGHTMAP\n	varying vec2 vLightMapUv;\n#endif\n#ifdef USE_AOMAP\n	varying vec2 vAoMapUv;\n#endif\n#ifdef USE_BUMPMAP\n	varying vec2 vBumpMapUv;\n#endif\n#ifdef USE_NORMALMAP\n	varying vec2 vNormalMapUv;\n#endif\n#ifdef USE_EMISSIVEMAP\n	varying vec2 vEmissiveMapUv;\n#endif\n#ifdef USE_METALNESSMAP\n	varying vec2 vMetalnessMapUv;\n#endif\n#ifdef USE_ROUGHNESSMAP\n	varying vec2 vRoughnessMapUv;\n#endif\n#ifdef USE_ANISOTROPYMAP\n	varying vec2 vAnisotropyMapUv;\n#endif\n#ifdef USE_CLEARCOATMAP\n	varying vec2 vClearcoatMapUv;\n#endif\n#ifdef USE_CLEARCOAT_NORMALMAP\n	varying vec2 vClearcoatNormalMapUv;\n#endif\n#ifdef USE_CLEARCOAT_ROUGHNESSMAP\n	varying vec2 vClearcoatRoughnessMapUv;\n#endif\n#ifdef USE_IRIDESCENCEMAP\n	varying vec2 vIridescenceMapUv;\n#endif\n#ifdef USE_IRIDESCENCE_THICKNESSMAP\n	varying vec2 vIridescenceThicknessMapUv;\n#endif\n#ifdef USE_SHEEN_COLORMAP\n	varying vec2 vSheenColorMapUv;\n#endif\n#ifdef USE_SHEEN_ROUGHNESSMAP\n	varying vec2 vSheenRoughnessMapUv;\n#endif\n#ifdef USE_SPECULARMAP\n	varying vec2 vSpecularMapUv;\n#endif\n#ifdef USE_SPECULAR_COLORMAP\n	varying vec2 vSpecularColorMapUv;\n#endif\n#ifdef USE_SPECULAR_INTENSITYMAP\n	varying vec2 vSpecularIntensityMapUv;\n#endif\n#ifdef USE_TRANSMISSIONMAP\n	uniform mat3 transmissionMapTransform;\n	varying vec2 vTransmissionMapUv;\n#endif\n#ifdef USE_THICKNESSMAP\n	uniform mat3 thicknessMapTransform;\n	varying vec2 vThicknessMapUv;\n#endif",
	uv_pars_vertex: "#if defined( USE_UV ) || defined( USE_ANISOTROPY )\n	varying vec2 vUv;\n#endif\n#ifdef USE_MAP\n	uniform mat3 mapTransform;\n	varying vec2 vMapUv;\n#endif\n#ifdef USE_ALPHAMAP\n	uniform mat3 alphaMapTransform;\n	varying vec2 vAlphaMapUv;\n#endif\n#ifdef USE_LIGHTMAP\n	uniform mat3 lightMapTransform;\n	varying vec2 vLightMapUv;\n#endif\n#ifdef USE_AOMAP\n	uniform mat3 aoMapTransform;\n	varying vec2 vAoMapUv;\n#endif\n#ifdef USE_BUMPMAP\n	uniform mat3 bumpMapTransform;\n	varying vec2 vBumpMapUv;\n#endif\n#ifdef USE_NORMALMAP\n	uniform mat3 normalMapTransform;\n	varying vec2 vNormalMapUv;\n#endif\n#ifdef USE_DISPLACEMENTMAP\n	uniform mat3 displacementMapTransform;\n	varying vec2 vDisplacementMapUv;\n#endif\n#ifdef USE_EMISSIVEMAP\n	uniform mat3 emissiveMapTransform;\n	varying vec2 vEmissiveMapUv;\n#endif\n#ifdef USE_METALNESSMAP\n	uniform mat3 metalnessMapTransform;\n	varying vec2 vMetalnessMapUv;\n#endif\n#ifdef USE_ROUGHNESSMAP\n	uniform mat3 roughnessMapTransform;\n	varying vec2 vRoughnessMapUv;\n#endif\n#ifdef USE_ANISOTROPYMAP\n	uniform mat3 anisotropyMapTransform;\n	varying vec2 vAnisotropyMapUv;\n#endif\n#ifdef USE_CLEARCOATMAP\n	uniform mat3 clearcoatMapTransform;\n	varying vec2 vClearcoatMapUv;\n#endif\n#ifdef USE_CLEARCOAT_NORMALMAP\n	uniform mat3 clearcoatNormalMapTransform;\n	varying vec2 vClearcoatNormalMapUv;\n#endif\n#ifdef USE_CLEARCOAT_ROUGHNESSMAP\n	uniform mat3 clearcoatRoughnessMapTransform;\n	varying vec2 vClearcoatRoughnessMapUv;\n#endif\n#ifdef USE_SHEEN_COLORMAP\n	uniform mat3 sheenColorMapTransform;\n	varying vec2 vSheenColorMapUv;\n#endif\n#ifdef USE_SHEEN_ROUGHNESSMAP\n	uniform mat3 sheenRoughnessMapTransform;\n	varying vec2 vSheenRoughnessMapUv;\n#endif\n#ifdef USE_IRIDESCENCEMAP\n	uniform mat3 iridescenceMapTransform;\n	varying vec2 vIridescenceMapUv;\n#endif\n#ifdef USE_IRIDESCENCE_THICKNESSMAP\n	uniform mat3 iridescenceThicknessMapTransform;\n	varying vec2 vIridescenceThicknessMapUv;\n#endif\n#ifdef USE_SPECULARMAP\n	uniform mat3 specularMapTransform;\n	varying vec2 vSpecularMapUv;\n#endif\n#ifdef USE_SPECULAR_COLORMAP\n	uniform mat3 specularColorMapTransform;\n	varying vec2 vSpecularColorMapUv;\n#endif\n#ifdef USE_SPECULAR_INTENSITYMAP\n	uniform mat3 specularIntensityMapTransform;\n	varying vec2 vSpecularIntensityMapUv;\n#endif\n#ifdef USE_TRANSMISSIONMAP\n	uniform mat3 transmissionMapTransform;\n	varying vec2 vTransmissionMapUv;\n#endif\n#ifdef USE_THICKNESSMAP\n	uniform mat3 thicknessMapTransform;\n	varying vec2 vThicknessMapUv;\n#endif",
	uv_vertex: "#if defined( USE_UV ) || defined( USE_ANISOTROPY )\n	vUv = vec3( uv, 1 ).xy;\n#endif\n#ifdef USE_MAP\n	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_ALPHAMAP\n	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_LIGHTMAP\n	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_AOMAP\n	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_BUMPMAP\n	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_NORMALMAP\n	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_DISPLACEMENTMAP\n	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_EMISSIVEMAP\n	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_METALNESSMAP\n	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_ROUGHNESSMAP\n	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_ANISOTROPYMAP\n	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_CLEARCOATMAP\n	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_CLEARCOAT_NORMALMAP\n	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_CLEARCOAT_ROUGHNESSMAP\n	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_IRIDESCENCEMAP\n	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_IRIDESCENCE_THICKNESSMAP\n	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_SHEEN_COLORMAP\n	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_SHEEN_ROUGHNESSMAP\n	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_SPECULARMAP\n	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_SPECULAR_COLORMAP\n	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_SPECULAR_INTENSITYMAP\n	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_TRANSMISSIONMAP\n	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_THICKNESSMAP\n	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;\n#endif",
	worldpos_vertex: "#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0\n	vec4 worldPosition = vec4( transformed, 1.0 );\n	#ifdef USE_BATCHING\n		worldPosition = batchingMatrix * worldPosition;\n	#endif\n	#ifdef USE_INSTANCING\n		worldPosition = instanceMatrix * worldPosition;\n	#endif\n	worldPosition = modelMatrix * worldPosition;\n#endif",
	background_vert: "varying vec2 vUv;\nuniform mat3 uvTransform;\nvoid main() {\n	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;\n	gl_Position = vec4( position.xy, 1.0, 1.0 );\n}",
	background_frag: "uniform sampler2D t2D;\nuniform float backgroundIntensity;\nvarying vec2 vUv;\nvoid main() {\n	vec4 texColor = texture2D( t2D, vUv );\n	#ifdef DECODE_VIDEO_TEXTURE\n		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );\n	#endif\n	texColor.rgb *= backgroundIntensity;\n	gl_FragColor = texColor;\n	#include <tonemapping_fragment>\n	#include <colorspace_fragment>\n}",
	backgroundCube_vert: "varying vec3 vWorldDirection;\n#include <common>\nvoid main() {\n	vWorldDirection = transformDirection( position, modelMatrix );\n	#include <begin_vertex>\n	#include <project_vertex>\n	gl_Position.z = gl_Position.w;\n}",
	backgroundCube_frag: "#ifdef ENVMAP_TYPE_CUBE\n	uniform samplerCube envMap;\n#elif defined( ENVMAP_TYPE_CUBE_UV )\n	uniform sampler2D envMap;\n#endif\nuniform float backgroundBlurriness;\nuniform float backgroundIntensity;\nuniform mat3 backgroundRotation;\nvarying vec3 vWorldDirection;\n#include <cube_uv_reflection_fragment>\nvoid main() {\n	#ifdef ENVMAP_TYPE_CUBE\n		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );\n	#elif defined( ENVMAP_TYPE_CUBE_UV )\n		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );\n	#else\n		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );\n	#endif\n	texColor.rgb *= backgroundIntensity;\n	gl_FragColor = texColor;\n	#include <tonemapping_fragment>\n	#include <colorspace_fragment>\n}",
	cube_vert: "varying vec3 vWorldDirection;\n#include <common>\nvoid main() {\n	vWorldDirection = transformDirection( position, modelMatrix );\n	#include <begin_vertex>\n	#include <project_vertex>\n	gl_Position.z = gl_Position.w;\n}",
	cube_frag: "uniform samplerCube tCube;\nuniform float tFlip;\nuniform float opacity;\nvarying vec3 vWorldDirection;\nvoid main() {\n	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );\n	gl_FragColor = texColor;\n	gl_FragColor.a *= opacity;\n	#include <tonemapping_fragment>\n	#include <colorspace_fragment>\n}",
	depth_vert: "#include <common>\n#include <batching_pars_vertex>\n#include <uv_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvarying vec2 vHighPrecisionZW;\nvoid main() {\n	#include <uv_vertex>\n	#include <batching_vertex>\n	#include <skinbase_vertex>\n	#include <morphinstance_vertex>\n	#ifdef USE_DISPLACEMENTMAP\n		#include <beginnormal_vertex>\n		#include <morphnormal_vertex>\n		#include <skinnormal_vertex>\n	#endif\n	#include <begin_vertex>\n	#include <morphtarget_vertex>\n	#include <skinning_vertex>\n	#include <displacementmap_vertex>\n	#include <project_vertex>\n	#include <logdepthbuf_vertex>\n	#include <clipping_planes_vertex>\n	vHighPrecisionZW = gl_Position.zw;\n}",
	depth_frag: "#if DEPTH_PACKING == 3200\n	uniform float opacity;\n#endif\n#include <common>\n#include <packing>\n#include <uv_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <alphatest_pars_fragment>\n#include <alphahash_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvarying vec2 vHighPrecisionZW;\nvoid main() {\n	vec4 diffuseColor = vec4( 1.0 );\n	#include <clipping_planes_fragment>\n	#if DEPTH_PACKING == 3200\n		diffuseColor.a = opacity;\n	#endif\n	#include <map_fragment>\n	#include <alphamap_fragment>\n	#include <alphatest_fragment>\n	#include <alphahash_fragment>\n	#include <logdepthbuf_fragment>\n	#ifdef USE_REVERSED_DEPTH_BUFFER\n		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];\n	#else\n		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;\n	#endif\n	#if DEPTH_PACKING == 3200\n		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );\n	#elif DEPTH_PACKING == 3201\n		gl_FragColor = packDepthToRGBA( fragCoordZ );\n	#elif DEPTH_PACKING == 3202\n		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );\n	#elif DEPTH_PACKING == 3203\n		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );\n	#endif\n}",
	distance_vert: "#define DISTANCE\nvarying vec3 vWorldPosition;\n#include <common>\n#include <batching_pars_vertex>\n#include <uv_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n	#include <uv_vertex>\n	#include <batching_vertex>\n	#include <skinbase_vertex>\n	#include <morphinstance_vertex>\n	#ifdef USE_DISPLACEMENTMAP\n		#include <beginnormal_vertex>\n		#include <morphnormal_vertex>\n		#include <skinnormal_vertex>\n	#endif\n	#include <begin_vertex>\n	#include <morphtarget_vertex>\n	#include <skinning_vertex>\n	#include <displacementmap_vertex>\n	#include <project_vertex>\n	#include <worldpos_vertex>\n	#include <clipping_planes_vertex>\n	vWorldPosition = worldPosition.xyz;\n}",
	distance_frag: "#define DISTANCE\nuniform vec3 referencePosition;\nuniform float nearDistance;\nuniform float farDistance;\nvarying vec3 vWorldPosition;\n#include <common>\n#include <uv_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <alphatest_pars_fragment>\n#include <alphahash_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n	vec4 diffuseColor = vec4( 1.0 );\n	#include <clipping_planes_fragment>\n	#include <map_fragment>\n	#include <alphamap_fragment>\n	#include <alphatest_fragment>\n	#include <alphahash_fragment>\n	float dist = length( vWorldPosition - referencePosition );\n	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );\n	dist = saturate( dist );\n	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );\n}",
	equirect_vert: "varying vec3 vWorldDirection;\n#include <common>\nvoid main() {\n	vWorldDirection = transformDirection( position, modelMatrix );\n	#include <begin_vertex>\n	#include <project_vertex>\n}",
	equirect_frag: "uniform sampler2D tEquirect;\nvarying vec3 vWorldDirection;\n#include <common>\nvoid main() {\n	vec3 direction = normalize( vWorldDirection );\n	vec2 sampleUV = equirectUv( direction );\n	gl_FragColor = texture2D( tEquirect, sampleUV );\n	#include <tonemapping_fragment>\n	#include <colorspace_fragment>\n}",
	linedashed_vert: "uniform float scale;\nattribute float lineDistance;\nvarying float vLineDistance;\n#include <common>\n#include <uv_pars_vertex>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n	vLineDistance = scale * lineDistance;\n	#include <uv_vertex>\n	#include <color_vertex>\n	#include <morphinstance_vertex>\n	#include <morphcolor_vertex>\n	#include <begin_vertex>\n	#include <morphtarget_vertex>\n	#include <project_vertex>\n	#include <logdepthbuf_vertex>\n	#include <clipping_planes_vertex>\n	#include <fog_vertex>\n}",
	linedashed_frag: "uniform vec3 diffuse;\nuniform float opacity;\nuniform float dashSize;\nuniform float totalSize;\nvarying float vLineDistance;\n#include <common>\n#include <color_pars_fragment>\n#include <uv_pars_fragment>\n#include <map_pars_fragment>\n#include <fog_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n	vec4 diffuseColor = vec4( diffuse, opacity );\n	#include <clipping_planes_fragment>\n	if ( mod( vLineDistance, totalSize ) > dashSize ) {\n		discard;\n	}\n	vec3 outgoingLight = vec3( 0.0 );\n	#include <logdepthbuf_fragment>\n	#include <map_fragment>\n	#include <color_fragment>\n	outgoingLight = diffuseColor.rgb;\n	#include <opaque_fragment>\n	#include <tonemapping_fragment>\n	#include <colorspace_fragment>\n	#include <fog_fragment>\n	#include <premultiplied_alpha_fragment>\n}",
	meshbasic_vert: "#include <common>\n#include <batching_pars_vertex>\n#include <uv_pars_vertex>\n#include <envmap_pars_vertex>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n	#include <uv_vertex>\n	#include <color_vertex>\n	#include <morphinstance_vertex>\n	#include <morphcolor_vertex>\n	#include <batching_vertex>\n	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )\n		#include <beginnormal_vertex>\n		#include <morphnormal_vertex>\n		#include <skinbase_vertex>\n		#include <skinnormal_vertex>\n		#include <defaultnormal_vertex>\n	#endif\n	#include <begin_vertex>\n	#include <morphtarget_vertex>\n	#include <skinning_vertex>\n	#include <project_vertex>\n	#include <logdepthbuf_vertex>\n	#include <clipping_planes_vertex>\n	#include <worldpos_vertex>\n	#include <envmap_vertex>\n	#include <fog_vertex>\n}",
	meshbasic_frag: "uniform vec3 diffuse;\nuniform float opacity;\n#ifndef FLAT_SHADED\n	varying vec3 vNormal;\n#endif\n#include <common>\n#include <dithering_pars_fragment>\n#include <color_pars_fragment>\n#include <uv_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <alphatest_pars_fragment>\n#include <alphahash_pars_fragment>\n#include <aomap_pars_fragment>\n#include <lightmap_pars_fragment>\n#include <envmap_common_pars_fragment>\n#include <envmap_pars_fragment>\n#include <fog_pars_fragment>\n#include <specularmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n	vec4 diffuseColor = vec4( diffuse, opacity );\n	#include <clipping_planes_fragment>\n	#include <logdepthbuf_fragment>\n	#include <map_fragment>\n	#include <color_fragment>\n	#include <alphamap_fragment>\n	#include <alphatest_fragment>\n	#include <alphahash_fragment>\n	#include <specularmap_fragment>\n	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );\n	#ifdef USE_LIGHTMAP\n		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );\n		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;\n	#else\n		reflectedLight.indirectDiffuse += vec3( 1.0 );\n	#endif\n	#include <aomap_fragment>\n	reflectedLight.indirectDiffuse *= diffuseColor.rgb;\n	vec3 outgoingLight = reflectedLight.indirectDiffuse;\n	#include <envmap_fragment>\n	#include <opaque_fragment>\n	#include <tonemapping_fragment>\n	#include <colorspace_fragment>\n	#include <fog_fragment>\n	#include <premultiplied_alpha_fragment>\n	#include <dithering_fragment>\n}",
	meshlambert_vert: "#define LAMBERT\nvarying vec3 vViewPosition;\n#include <common>\n#include <batching_pars_vertex>\n#include <uv_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <envmap_pars_vertex>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <normal_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <shadowmap_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n	#include <uv_vertex>\n	#include <color_vertex>\n	#include <morphinstance_vertex>\n	#include <morphcolor_vertex>\n	#include <batching_vertex>\n	#include <beginnormal_vertex>\n	#include <morphnormal_vertex>\n	#include <skinbase_vertex>\n	#include <skinnormal_vertex>\n	#include <defaultnormal_vertex>\n	#include <normal_vertex>\n	#include <begin_vertex>\n	#include <morphtarget_vertex>\n	#include <skinning_vertex>\n	#include <displacementmap_vertex>\n	#include <project_vertex>\n	#include <logdepthbuf_vertex>\n	#include <clipping_planes_vertex>\n	vViewPosition = - mvPosition.xyz;\n	#include <worldpos_vertex>\n	#include <envmap_vertex>\n	#include <shadowmap_vertex>\n	#include <fog_vertex>\n}",
	meshlambert_frag: "#define LAMBERT\nuniform vec3 diffuse;\nuniform vec3 emissive;\nuniform float opacity;\n#include <common>\n#include <dithering_pars_fragment>\n#include <color_pars_fragment>\n#include <uv_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <alphatest_pars_fragment>\n#include <alphahash_pars_fragment>\n#include <aomap_pars_fragment>\n#include <lightmap_pars_fragment>\n#include <emissivemap_pars_fragment>\n#include <cube_uv_reflection_fragment>\n#include <envmap_common_pars_fragment>\n#include <envmap_pars_fragment>\n#include <envmap_physical_pars_fragment>\n#include <fog_pars_fragment>\n#include <bsdfs>\n#include <lights_pars_begin>\n#include <normal_pars_fragment>\n#include <lights_lambert_pars_fragment>\n#include <shadowmap_pars_fragment>\n#include <bumpmap_pars_fragment>\n#include <normalmap_pars_fragment>\n#include <specularmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n	vec4 diffuseColor = vec4( diffuse, opacity );\n	#include <clipping_planes_fragment>\n	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );\n	vec3 totalEmissiveRadiance = emissive;\n	#include <logdepthbuf_fragment>\n	#include <map_fragment>\n	#include <color_fragment>\n	#include <alphamap_fragment>\n	#include <alphatest_fragment>\n	#include <alphahash_fragment>\n	#include <specularmap_fragment>\n	#include <normal_fragment_begin>\n	#include <normal_fragment_maps>\n	#include <emissivemap_fragment>\n	#include <lights_lambert_fragment>\n	#include <lights_fragment_begin>\n	#include <lights_fragment_maps>\n	#include <lights_fragment_end>\n	#include <aomap_fragment>\n	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;\n	#include <envmap_fragment>\n	#include <opaque_fragment>\n	#include <tonemapping_fragment>\n	#include <colorspace_fragment>\n	#include <fog_fragment>\n	#include <premultiplied_alpha_fragment>\n	#include <dithering_fragment>\n}",
	meshmatcap_vert: "#define MATCAP\nvarying vec3 vViewPosition;\n#include <common>\n#include <batching_pars_vertex>\n#include <uv_pars_vertex>\n#include <color_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <fog_pars_vertex>\n#include <normal_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n	#include <uv_vertex>\n	#include <color_vertex>\n	#include <morphinstance_vertex>\n	#include <morphcolor_vertex>\n	#include <batching_vertex>\n	#include <beginnormal_vertex>\n	#include <morphnormal_vertex>\n	#include <skinbase_vertex>\n	#include <skinnormal_vertex>\n	#include <defaultnormal_vertex>\n	#include <normal_vertex>\n	#include <begin_vertex>\n	#include <morphtarget_vertex>\n	#include <skinning_vertex>\n	#include <displacementmap_vertex>\n	#include <project_vertex>\n	#include <logdepthbuf_vertex>\n	#include <clipping_planes_vertex>\n	#include <fog_vertex>\n	vViewPosition = - mvPosition.xyz;\n}",
	meshmatcap_frag: "#define MATCAP\nuniform vec3 diffuse;\nuniform float opacity;\nuniform sampler2D matcap;\nvarying vec3 vViewPosition;\n#include <common>\n#include <dithering_pars_fragment>\n#include <color_pars_fragment>\n#include <uv_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <alphatest_pars_fragment>\n#include <alphahash_pars_fragment>\n#include <fog_pars_fragment>\n#include <normal_pars_fragment>\n#include <bumpmap_pars_fragment>\n#include <normalmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n	vec4 diffuseColor = vec4( diffuse, opacity );\n	#include <clipping_planes_fragment>\n	#include <logdepthbuf_fragment>\n	#include <map_fragment>\n	#include <color_fragment>\n	#include <alphamap_fragment>\n	#include <alphatest_fragment>\n	#include <alphahash_fragment>\n	#include <normal_fragment_begin>\n	#include <normal_fragment_maps>\n	vec3 viewDir = normalize( vViewPosition );\n	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );\n	vec3 y = cross( viewDir, x );\n	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;\n	#ifdef USE_MATCAP\n		vec4 matcapColor = texture2D( matcap, uv );\n	#else\n		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );\n	#endif\n	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;\n	#include <opaque_fragment>\n	#include <tonemapping_fragment>\n	#include <colorspace_fragment>\n	#include <fog_fragment>\n	#include <premultiplied_alpha_fragment>\n	#include <dithering_fragment>\n}",
	meshnormal_vert: "#define NORMAL\n#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )\n	varying vec3 vViewPosition;\n#endif\n#include <common>\n#include <batching_pars_vertex>\n#include <uv_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <normal_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n	#include <uv_vertex>\n	#include <batching_vertex>\n	#include <beginnormal_vertex>\n	#include <morphinstance_vertex>\n	#include <morphnormal_vertex>\n	#include <skinbase_vertex>\n	#include <skinnormal_vertex>\n	#include <defaultnormal_vertex>\n	#include <normal_vertex>\n	#include <begin_vertex>\n	#include <morphtarget_vertex>\n	#include <skinning_vertex>\n	#include <displacementmap_vertex>\n	#include <project_vertex>\n	#include <logdepthbuf_vertex>\n	#include <clipping_planes_vertex>\n#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )\n	vViewPosition = - mvPosition.xyz;\n#endif\n}",
	meshnormal_frag: "#define NORMAL\nuniform float opacity;\n#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )\n	varying vec3 vViewPosition;\n#endif\n#include <uv_pars_fragment>\n#include <normal_pars_fragment>\n#include <bumpmap_pars_fragment>\n#include <normalmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );\n	#include <clipping_planes_fragment>\n	#include <logdepthbuf_fragment>\n	#include <normal_fragment_begin>\n	#include <normal_fragment_maps>\n	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );\n	#ifdef OPAQUE\n		gl_FragColor.a = 1.0;\n	#endif\n}",
	meshphong_vert: "#define PHONG\nvarying vec3 vViewPosition;\n#include <common>\n#include <batching_pars_vertex>\n#include <uv_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <envmap_pars_vertex>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <normal_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <shadowmap_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n	#include <uv_vertex>\n	#include <color_vertex>\n	#include <morphcolor_vertex>\n	#include <batching_vertex>\n	#include <beginnormal_vertex>\n	#include <morphinstance_vertex>\n	#include <morphnormal_vertex>\n	#include <skinbase_vertex>\n	#include <skinnormal_vertex>\n	#include <defaultnormal_vertex>\n	#include <normal_vertex>\n	#include <begin_vertex>\n	#include <morphtarget_vertex>\n	#include <skinning_vertex>\n	#include <displacementmap_vertex>\n	#include <project_vertex>\n	#include <logdepthbuf_vertex>\n	#include <clipping_planes_vertex>\n	vViewPosition = - mvPosition.xyz;\n	#include <worldpos_vertex>\n	#include <envmap_vertex>\n	#include <shadowmap_vertex>\n	#include <fog_vertex>\n}",
	meshphong_frag: "#define PHONG\nuniform vec3 diffuse;\nuniform vec3 emissive;\nuniform vec3 specular;\nuniform float shininess;\nuniform float opacity;\n#include <common>\n#include <dithering_pars_fragment>\n#include <color_pars_fragment>\n#include <uv_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <alphatest_pars_fragment>\n#include <alphahash_pars_fragment>\n#include <aomap_pars_fragment>\n#include <lightmap_pars_fragment>\n#include <emissivemap_pars_fragment>\n#include <cube_uv_reflection_fragment>\n#include <envmap_common_pars_fragment>\n#include <envmap_pars_fragment>\n#include <envmap_physical_pars_fragment>\n#include <fog_pars_fragment>\n#include <bsdfs>\n#include <lights_pars_begin>\n#include <normal_pars_fragment>\n#include <lights_phong_pars_fragment>\n#include <shadowmap_pars_fragment>\n#include <bumpmap_pars_fragment>\n#include <normalmap_pars_fragment>\n#include <specularmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n	vec4 diffuseColor = vec4( diffuse, opacity );\n	#include <clipping_planes_fragment>\n	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );\n	vec3 totalEmissiveRadiance = emissive;\n	#include <logdepthbuf_fragment>\n	#include <map_fragment>\n	#include <color_fragment>\n	#include <alphamap_fragment>\n	#include <alphatest_fragment>\n	#include <alphahash_fragment>\n	#include <specularmap_fragment>\n	#include <normal_fragment_begin>\n	#include <normal_fragment_maps>\n	#include <emissivemap_fragment>\n	#include <lights_phong_fragment>\n	#include <lights_fragment_begin>\n	#include <lights_fragment_maps>\n	#include <lights_fragment_end>\n	#include <aomap_fragment>\n	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;\n	#include <envmap_fragment>\n	#include <opaque_fragment>\n	#include <tonemapping_fragment>\n	#include <colorspace_fragment>\n	#include <fog_fragment>\n	#include <premultiplied_alpha_fragment>\n	#include <dithering_fragment>\n}",
	meshphysical_vert: "#define STANDARD\nvarying vec3 vViewPosition;\n#ifdef USE_TRANSMISSION\n	varying vec3 vWorldPosition;\n#endif\n#include <common>\n#include <batching_pars_vertex>\n#include <uv_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <normal_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <shadowmap_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n	#include <uv_vertex>\n	#include <color_vertex>\n	#include <morphinstance_vertex>\n	#include <morphcolor_vertex>\n	#include <batching_vertex>\n	#include <beginnormal_vertex>\n	#include <morphnormal_vertex>\n	#include <skinbase_vertex>\n	#include <skinnormal_vertex>\n	#include <defaultnormal_vertex>\n	#include <normal_vertex>\n	#include <begin_vertex>\n	#include <morphtarget_vertex>\n	#include <skinning_vertex>\n	#include <displacementmap_vertex>\n	#include <project_vertex>\n	#include <logdepthbuf_vertex>\n	#include <clipping_planes_vertex>\n	vViewPosition = - mvPosition.xyz;\n	#include <worldpos_vertex>\n	#include <shadowmap_vertex>\n	#include <fog_vertex>\n#ifdef USE_TRANSMISSION\n	vWorldPosition = worldPosition.xyz;\n#endif\n}",
	meshphysical_frag: "#define STANDARD\n#ifdef PHYSICAL\n	#define IOR\n	#define USE_SPECULAR\n#endif\nuniform vec3 diffuse;\nuniform vec3 emissive;\nuniform float roughness;\nuniform float metalness;\nuniform float opacity;\n#ifdef IOR\n	uniform float ior;\n#endif\n#ifdef USE_SPECULAR\n	uniform float specularIntensity;\n	uniform vec3 specularColor;\n	#ifdef USE_SPECULAR_COLORMAP\n		uniform sampler2D specularColorMap;\n	#endif\n	#ifdef USE_SPECULAR_INTENSITYMAP\n		uniform sampler2D specularIntensityMap;\n	#endif\n#endif\n#ifdef USE_CLEARCOAT\n	uniform float clearcoat;\n	uniform float clearcoatRoughness;\n#endif\n#ifdef USE_DISPERSION\n	uniform float dispersion;\n#endif\n#ifdef USE_RETROREFLECTION\n	uniform float retroreflectivity;\n#endif\n#ifdef USE_IRIDESCENCE\n	uniform float iridescence;\n	uniform float iridescenceIOR;\n	uniform float iridescenceThicknessMinimum;\n	uniform float iridescenceThicknessMaximum;\n#endif\n#ifdef USE_SHEEN\n	uniform vec3 sheenColor;\n	uniform float sheenRoughness;\n	#ifdef USE_SHEEN_COLORMAP\n		uniform sampler2D sheenColorMap;\n	#endif\n	#ifdef USE_SHEEN_ROUGHNESSMAP\n		uniform sampler2D sheenRoughnessMap;\n	#endif\n#endif\n#ifdef USE_ANISOTROPY\n	uniform vec2 anisotropyVector;\n	#ifdef USE_ANISOTROPYMAP\n		uniform sampler2D anisotropyMap;\n	#endif\n#endif\nvarying vec3 vViewPosition;\n#include <common>\n#include <dithering_pars_fragment>\n#include <color_pars_fragment>\n#include <uv_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <alphatest_pars_fragment>\n#include <alphahash_pars_fragment>\n#include <aomap_pars_fragment>\n#include <lightmap_pars_fragment>\n#include <emissivemap_pars_fragment>\n#include <iridescence_fragment>\n#include <cube_uv_reflection_fragment>\n#include <envmap_common_pars_fragment>\n#include <envmap_physical_pars_fragment>\n#include <fog_pars_fragment>\n#include <lights_pars_begin>\n#include <normal_pars_fragment>\n#include <lights_physical_pars_fragment>\n#include <transmission_pars_fragment>\n#include <shadowmap_pars_fragment>\n#include <bumpmap_pars_fragment>\n#include <normalmap_pars_fragment>\n#include <clearcoat_pars_fragment>\n#include <iridescence_pars_fragment>\n#include <roughnessmap_pars_fragment>\n#include <metalnessmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n	vec4 diffuseColor = vec4( diffuse, opacity );\n	#include <clipping_planes_fragment>\n	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );\n	vec3 totalEmissiveRadiance = emissive;\n	#include <logdepthbuf_fragment>\n	#include <map_fragment>\n	#include <color_fragment>\n	#include <alphamap_fragment>\n	#include <alphatest_fragment>\n	#include <alphahash_fragment>\n	#include <roughnessmap_fragment>\n	#include <metalnessmap_fragment>\n	#include <normal_fragment_begin>\n	#include <normal_fragment_maps>\n	#include <clearcoat_normal_fragment_begin>\n	#include <clearcoat_normal_fragment_maps>\n	#include <emissivemap_fragment>\n	#include <lights_physical_fragment>\n	#include <lights_fragment_begin>\n	#include <lights_fragment_maps>\n	#include <lights_fragment_end>\n	#include <aomap_fragment>\n	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;\n	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;\n	#include <transmission_fragment>\n	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;\n	#ifdef USE_SHEEN\n \n		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;\n \n 	#endif\n	#ifdef USE_CLEARCOAT\n		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );\n		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );\n		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;\n	#endif\n	#include <opaque_fragment>\n	#include <tonemapping_fragment>\n	#include <colorspace_fragment>\n	#include <fog_fragment>\n	#include <premultiplied_alpha_fragment>\n	#include <dithering_fragment>\n}",
	meshtoon_vert: "#define TOON\nvarying vec3 vViewPosition;\n#include <common>\n#include <batching_pars_vertex>\n#include <uv_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <normal_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <shadowmap_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n	#include <uv_vertex>\n	#include <color_vertex>\n	#include <morphinstance_vertex>\n	#include <morphcolor_vertex>\n	#include <batching_vertex>\n	#include <beginnormal_vertex>\n	#include <morphnormal_vertex>\n	#include <skinbase_vertex>\n	#include <skinnormal_vertex>\n	#include <defaultnormal_vertex>\n	#include <normal_vertex>\n	#include <begin_vertex>\n	#include <morphtarget_vertex>\n	#include <skinning_vertex>\n	#include <displacementmap_vertex>\n	#include <project_vertex>\n	#include <logdepthbuf_vertex>\n	#include <clipping_planes_vertex>\n	vViewPosition = - mvPosition.xyz;\n	#include <worldpos_vertex>\n	#include <shadowmap_vertex>\n	#include <fog_vertex>\n}",
	meshtoon_frag: "#define TOON\nuniform vec3 diffuse;\nuniform vec3 emissive;\nuniform float opacity;\n#include <common>\n#include <dithering_pars_fragment>\n#include <color_pars_fragment>\n#include <uv_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <alphatest_pars_fragment>\n#include <alphahash_pars_fragment>\n#include <aomap_pars_fragment>\n#include <lightmap_pars_fragment>\n#include <emissivemap_pars_fragment>\n#include <gradientmap_pars_fragment>\n#include <fog_pars_fragment>\n#include <bsdfs>\n#include <lights_pars_begin>\n#include <normal_pars_fragment>\n#include <lights_toon_pars_fragment>\n#include <shadowmap_pars_fragment>\n#include <bumpmap_pars_fragment>\n#include <normalmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n	vec4 diffuseColor = vec4( diffuse, opacity );\n	#include <clipping_planes_fragment>\n	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );\n	vec3 totalEmissiveRadiance = emissive;\n	#include <logdepthbuf_fragment>\n	#include <map_fragment>\n	#include <color_fragment>\n	#include <alphamap_fragment>\n	#include <alphatest_fragment>\n	#include <alphahash_fragment>\n	#include <normal_fragment_begin>\n	#include <normal_fragment_maps>\n	#include <emissivemap_fragment>\n	#include <lights_toon_fragment>\n	#include <lights_fragment_begin>\n	#include <lights_fragment_maps>\n	#include <lights_fragment_end>\n	#include <aomap_fragment>\n	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;\n	#include <opaque_fragment>\n	#include <tonemapping_fragment>\n	#include <colorspace_fragment>\n	#include <fog_fragment>\n	#include <premultiplied_alpha_fragment>\n	#include <dithering_fragment>\n}",
	points_vert: "uniform float size;\nuniform float scale;\n#include <common>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\n#ifdef USE_POINTS_UV\n	varying vec2 vUv;\n	uniform mat3 uvTransform;\n#endif\nvoid main() {\n	#ifdef USE_POINTS_UV\n		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;\n	#endif\n	#include <color_vertex>\n	#include <morphinstance_vertex>\n	#include <morphcolor_vertex>\n	#include <begin_vertex>\n	#include <morphtarget_vertex>\n	#include <project_vertex>\n	gl_PointSize = size;\n	#ifdef USE_SIZEATTENUATION\n		bool isPerspective = isPerspectiveMatrix( projectionMatrix );\n		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );\n	#endif\n	#include <logdepthbuf_vertex>\n	#include <clipping_planes_vertex>\n	#include <worldpos_vertex>\n	#include <fog_vertex>\n}",
	points_frag: "uniform vec3 diffuse;\nuniform float opacity;\n#include <common>\n#include <color_pars_fragment>\n#include <map_particle_pars_fragment>\n#include <alphatest_pars_fragment>\n#include <alphahash_pars_fragment>\n#include <fog_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n	vec4 diffuseColor = vec4( diffuse, opacity );\n	#include <clipping_planes_fragment>\n	vec3 outgoingLight = vec3( 0.0 );\n	#include <logdepthbuf_fragment>\n	#include <map_particle_fragment>\n	#include <color_fragment>\n	#include <alphatest_fragment>\n	#include <alphahash_fragment>\n	outgoingLight = diffuseColor.rgb;\n	#include <opaque_fragment>\n	#include <tonemapping_fragment>\n	#include <colorspace_fragment>\n	#include <fog_fragment>\n	#include <premultiplied_alpha_fragment>\n}",
	shadow_vert: "#include <common>\n#include <batching_pars_vertex>\n#include <fog_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <shadowmap_pars_vertex>\nvoid main() {\n	#include <batching_vertex>\n	#include <beginnormal_vertex>\n	#include <morphinstance_vertex>\n	#include <morphnormal_vertex>\n	#include <skinbase_vertex>\n	#include <skinnormal_vertex>\n	#include <defaultnormal_vertex>\n	#include <begin_vertex>\n	#include <morphtarget_vertex>\n	#include <skinning_vertex>\n	#include <project_vertex>\n	#include <logdepthbuf_vertex>\n	#include <worldpos_vertex>\n	#include <shadowmap_vertex>\n	#include <fog_vertex>\n}",
	shadow_frag: "uniform vec3 color;\nuniform float opacity;\n#include <common>\n#include <fog_pars_fragment>\n#include <bsdfs>\n#include <lights_pars_begin>\n#include <logdepthbuf_pars_fragment>\n#include <shadowmap_pars_fragment>\n#include <shadowmask_pars_fragment>\nvoid main() {\n	#include <logdepthbuf_fragment>\n	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );\n	#include <tonemapping_fragment>\n	#include <colorspace_fragment>\n	#include <fog_fragment>\n	#include <premultiplied_alpha_fragment>\n}",
	sprite_vert: "uniform float rotation;\nuniform vec2 center;\n#include <common>\n#include <uv_pars_vertex>\n#include <fog_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n	#include <uv_vertex>\n	vec4 mvPosition = modelViewMatrix[ 3 ];\n	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );\n	#ifndef USE_SIZEATTENUATION\n		bool isPerspective = isPerspectiveMatrix( projectionMatrix );\n		if ( isPerspective ) scale *= - mvPosition.z;\n	#endif\n	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;\n	vec2 rotatedPosition;\n	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;\n	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;\n	mvPosition.xy += rotatedPosition;\n	gl_Position = projectionMatrix * mvPosition;\n	#include <logdepthbuf_vertex>\n	#include <clipping_planes_vertex>\n	#include <fog_vertex>\n}",
	sprite_frag: "uniform vec3 diffuse;\nuniform float opacity;\n#include <common>\n#include <uv_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <alphatest_pars_fragment>\n#include <alphahash_pars_fragment>\n#include <fog_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n	vec4 diffuseColor = vec4( diffuse, opacity );\n	#include <clipping_planes_fragment>\n	vec3 outgoingLight = vec3( 0.0 );\n	#include <logdepthbuf_fragment>\n	#include <map_fragment>\n	#include <alphamap_fragment>\n	#include <alphatest_fragment>\n	#include <alphahash_fragment>\n	outgoingLight = diffuseColor.rgb;\n	#include <opaque_fragment>\n	#include <tonemapping_fragment>\n	#include <colorspace_fragment>\n	#include <fog_fragment>\n}"
}, $ = {
	common: {
		diffuse: { value: /*@__PURE__*/ new Z(16777215) },
		opacity: { value: 1 },
		map: { value: null },
		mapTransform: { value: /*@__PURE__*/ new Y() },
		alphaMap: { value: null },
		alphaMapTransform: { value: /*@__PURE__*/ new Y() },
		alphaTest: { value: 0 }
	},
	specularmap: {
		specularMap: { value: null },
		specularMapTransform: { value: /*@__PURE__*/ new Y() }
	},
	envmap: {
		envMap: { value: null },
		envMapRotation: { value: /*@__PURE__*/ new Y() },
		reflectivity: { value: 1 },
		ior: { value: 1.5 },
		refractionRatio: { value: .98 },
		dfgLUT: { value: null }
	},
	aomap: {
		aoMap: { value: null },
		aoMapIntensity: { value: 1 },
		aoMapTransform: { value: /*@__PURE__*/ new Y() }
	},
	lightmap: {
		lightMap: { value: null },
		lightMapIntensity: { value: 1 },
		lightMapTransform: { value: /*@__PURE__*/ new Y() }
	},
	bumpmap: {
		bumpMap: { value: null },
		bumpMapTransform: { value: /*@__PURE__*/ new Y() },
		bumpScale: { value: 1 }
	},
	normalmap: {
		normalMap: { value: null },
		normalMapTransform: { value: /*@__PURE__*/ new Y() },
		normalScale: { value: /*@__PURE__*/ new q(1, 1) }
	},
	displacementmap: {
		displacementMap: { value: null },
		displacementMapTransform: { value: /*@__PURE__*/ new Y() },
		displacementScale: { value: 1 },
		displacementBias: { value: 0 }
	},
	emissivemap: {
		emissiveMap: { value: null },
		emissiveMapTransform: { value: /*@__PURE__*/ new Y() }
	},
	metalnessmap: {
		metalnessMap: { value: null },
		metalnessMapTransform: { value: /*@__PURE__*/ new Y() }
	},
	roughnessmap: {
		roughnessMap: { value: null },
		roughnessMapTransform: { value: /*@__PURE__*/ new Y() }
	},
	gradientmap: { gradientMap: { value: null } },
	fog: {
		fogDensity: { value: 25e-5 },
		fogNear: { value: 1 },
		fogFar: { value: 2e3 },
		fogColor: { value: /*@__PURE__*/ new Z(16777215) }
	},
	lights: {
		ambientLightColor: { value: [] },
		lightProbe: { value: [] },
		sunLights: {
			value: [],
			properties: {
				direction: {},
				color: {}
			}
		},
		sunLightShadows: {
			value: [],
			properties: {
				shadowIntensity: 1,
				shadowBias: {},
				shadowNormalBias: {},
				shadowRadius: {},
				shadowMapSize: {}
			}
		},
		sunShadowMatrix: { value: [] },
		sunShadowCascade: { value: [] },
		directionalLights: {
			value: [],
			properties: {
				direction: {},
				color: {}
			}
		},
		directionalLightShadows: {
			value: [],
			properties: {
				shadowIntensity: 1,
				shadowBias: {},
				shadowNormalBias: {},
				shadowRadius: {},
				shadowMapSize: {}
			}
		},
		directionalShadowMatrix: { value: [] },
		spotLights: {
			value: [],
			properties: {
				color: {},
				position: {},
				direction: {},
				distance: {},
				coneCos: {},
				penumbraCos: {},
				decay: {}
			}
		},
		spotLightShadows: {
			value: [],
			properties: {
				shadowIntensity: 1,
				shadowBias: {},
				shadowNormalBias: {},
				shadowRadius: {},
				shadowMapSize: {}
			}
		},
		spotLightMap: { value: [] },
		spotLightMatrix: { value: [] },
		pointLights: {
			value: [],
			properties: {
				color: {},
				position: {},
				decay: {},
				distance: {}
			}
		},
		pointLightShadows: {
			value: [],
			properties: {
				shadowIntensity: 1,
				shadowBias: {},
				shadowNormalBias: {},
				shadowRadius: {},
				shadowMapSize: {},
				shadowCameraNear: {},
				shadowCameraFar: {}
			}
		},
		pointShadowMatrix: { value: [] },
		hemisphereLights: {
			value: [],
			properties: {
				direction: {},
				skyColor: {},
				groundColor: {}
			}
		},
		rectAreaLights: {
			value: [],
			properties: {
				color: {},
				position: {},
				width: {},
				height: {}
			}
		},
		ltc_1: { value: null },
		ltc_2: { value: null },
		probesSH: { value: null },
		probesMin: { value: /*@__PURE__*/ new J() },
		probesMax: { value: /*@__PURE__*/ new J() },
		probesResolution: { value: /*@__PURE__*/ new J() }
	},
	points: {
		diffuse: { value: /*@__PURE__*/ new Z(16777215) },
		opacity: { value: 1 },
		size: { value: 1 },
		scale: { value: 1 },
		map: { value: null },
		alphaMap: { value: null },
		alphaMapTransform: { value: /*@__PURE__*/ new Y() },
		alphaTest: { value: 0 },
		uvTransform: { value: /*@__PURE__*/ new Y() }
	},
	sprite: {
		diffuse: { value: /*@__PURE__*/ new Z(16777215) },
		opacity: { value: 1 },
		center: { value: /*@__PURE__*/ new q(.5, .5) },
		rotation: { value: 0 },
		map: { value: null },
		mapTransform: { value: /*@__PURE__*/ new Y() },
		alphaMap: { value: null },
		alphaMapTransform: { value: /*@__PURE__*/ new Y() },
		alphaTest: { value: 0 }
	}
}, jm = {
	basic: {
		uniforms: /*@__PURE__*/ pp([
			$.common,
			$.specularmap,
			$.envmap,
			$.aomap,
			$.lightmap,
			$.fog
		]),
		vertexShader: Q.meshbasic_vert,
		fragmentShader: Q.meshbasic_frag
	},
	lambert: {
		uniforms: /*@__PURE__*/ pp([
			$.common,
			$.specularmap,
			$.envmap,
			$.aomap,
			$.lightmap,
			$.emissivemap,
			$.bumpmap,
			$.normalmap,
			$.displacementmap,
			$.fog,
			$.lights,
			{
				emissive: { value: /*@__PURE__*/ new Z(0) },
				envMapIntensity: { value: 1 }
			}
		]),
		vertexShader: Q.meshlambert_vert,
		fragmentShader: Q.meshlambert_frag
	},
	phong: {
		uniforms: /*@__PURE__*/ pp([
			$.common,
			$.specularmap,
			$.envmap,
			$.aomap,
			$.lightmap,
			$.emissivemap,
			$.bumpmap,
			$.normalmap,
			$.displacementmap,
			$.fog,
			$.lights,
			{
				emissive: { value: /*@__PURE__*/ new Z(0) },
				specular: { value: /*@__PURE__*/ new Z(1118481) },
				shininess: { value: 30 },
				envMapIntensity: { value: 1 }
			}
		]),
		vertexShader: Q.meshphong_vert,
		fragmentShader: Q.meshphong_frag
	},
	standard: {
		uniforms: /*@__PURE__*/ pp([
			$.common,
			$.envmap,
			$.aomap,
			$.lightmap,
			$.emissivemap,
			$.bumpmap,
			$.normalmap,
			$.displacementmap,
			$.roughnessmap,
			$.metalnessmap,
			$.fog,
			$.lights,
			{
				emissive: { value: /*@__PURE__*/ new Z(0) },
				roughness: { value: 1 },
				metalness: { value: 0 },
				envMapIntensity: { value: 1 }
			}
		]),
		vertexShader: Q.meshphysical_vert,
		fragmentShader: Q.meshphysical_frag
	},
	toon: {
		uniforms: /*@__PURE__*/ pp([
			$.common,
			$.aomap,
			$.lightmap,
			$.emissivemap,
			$.bumpmap,
			$.normalmap,
			$.displacementmap,
			$.gradientmap,
			$.fog,
			$.lights,
			{ emissive: { value: /*@__PURE__*/ new Z(0) } }
		]),
		vertexShader: Q.meshtoon_vert,
		fragmentShader: Q.meshtoon_frag
	},
	matcap: {
		uniforms: /*@__PURE__*/ pp([
			$.common,
			$.bumpmap,
			$.normalmap,
			$.displacementmap,
			$.fog,
			{ matcap: { value: null } }
		]),
		vertexShader: Q.meshmatcap_vert,
		fragmentShader: Q.meshmatcap_frag
	},
	points: {
		uniforms: /*@__PURE__*/ pp([$.points, $.fog]),
		vertexShader: Q.points_vert,
		fragmentShader: Q.points_frag
	},
	dashed: {
		uniforms: /*@__PURE__*/ pp([
			$.common,
			$.fog,
			{
				scale: { value: 1 },
				dashSize: { value: 1 },
				totalSize: { value: 2 }
			}
		]),
		vertexShader: Q.linedashed_vert,
		fragmentShader: Q.linedashed_frag
	},
	depth: {
		uniforms: /*@__PURE__*/ pp([$.common, $.displacementmap]),
		vertexShader: Q.depth_vert,
		fragmentShader: Q.depth_frag
	},
	normal: {
		uniforms: /*@__PURE__*/ pp([
			$.common,
			$.bumpmap,
			$.normalmap,
			$.displacementmap,
			{ opacity: { value: 1 } }
		]),
		vertexShader: Q.meshnormal_vert,
		fragmentShader: Q.meshnormal_frag
	},
	sprite: {
		uniforms: /*@__PURE__*/ pp([$.sprite, $.fog]),
		vertexShader: Q.sprite_vert,
		fragmentShader: Q.sprite_frag
	},
	background: {
		uniforms: {
			uvTransform: { value: /*@__PURE__*/ new Y() },
			t2D: { value: null },
			backgroundIntensity: { value: 1 }
		},
		vertexShader: Q.background_vert,
		fragmentShader: Q.background_frag
	},
	backgroundCube: {
		uniforms: {
			envMap: { value: null },
			backgroundBlurriness: { value: 0 },
			backgroundIntensity: { value: 1 },
			backgroundRotation: { value: /*@__PURE__*/ new Y() }
		},
		vertexShader: Q.backgroundCube_vert,
		fragmentShader: Q.backgroundCube_frag
	},
	cube: {
		uniforms: {
			tCube: { value: null },
			tFlip: { value: -1 },
			opacity: { value: 1 }
		},
		vertexShader: Q.cube_vert,
		fragmentShader: Q.cube_frag
	},
	equirect: {
		uniforms: { tEquirect: { value: null } },
		vertexShader: Q.equirect_vert,
		fragmentShader: Q.equirect_frag
	},
	distance: {
		uniforms: /*@__PURE__*/ pp([
			$.common,
			$.displacementmap,
			{
				referencePosition: { value: /*@__PURE__*/ new J() },
				nearDistance: { value: 1 },
				farDistance: { value: 1e3 }
			}
		]),
		vertexShader: Q.distance_vert,
		fragmentShader: Q.distance_frag
	},
	shadow: {
		uniforms: /*@__PURE__*/ pp([
			$.lights,
			$.fog,
			{
				color: { value: /*@__PURE__*/ new Z(0) },
				opacity: { value: 1 }
			}
		]),
		vertexShader: Q.shadow_vert,
		fragmentShader: Q.shadow_frag
	}
};
jm.physical = {
	uniforms: /*@__PURE__*/ pp([jm.standard.uniforms, {
		clearcoat: { value: 0 },
		clearcoatMap: { value: null },
		clearcoatMapTransform: { value: /*@__PURE__*/ new Y() },
		clearcoatNormalMap: { value: null },
		clearcoatNormalMapTransform: { value: /*@__PURE__*/ new Y() },
		clearcoatNormalScale: { value: /*@__PURE__*/ new q(1, 1) },
		clearcoatRoughness: { value: 0 },
		clearcoatRoughnessMap: { value: null },
		clearcoatRoughnessMapTransform: { value: /*@__PURE__*/ new Y() },
		dispersion: { value: 0 },
		retroreflectivity: { value: 0 },
		iridescence: { value: 0 },
		iridescenceMap: { value: null },
		iridescenceMapTransform: { value: /*@__PURE__*/ new Y() },
		iridescenceIOR: { value: 1.3 },
		iridescenceThicknessMinimum: { value: 100 },
		iridescenceThicknessMaximum: { value: 400 },
		iridescenceThicknessMap: { value: null },
		iridescenceThicknessMapTransform: { value: /*@__PURE__*/ new Y() },
		sheen: { value: 0 },
		sheenColor: { value: /*@__PURE__*/ new Z(0) },
		sheenColorMap: { value: null },
		sheenColorMapTransform: { value: /*@__PURE__*/ new Y() },
		sheenRoughness: { value: 1 },
		sheenRoughnessMap: { value: null },
		sheenRoughnessMapTransform: { value: /*@__PURE__*/ new Y() },
		transmission: { value: 0 },
		transmissionMap: { value: null },
		transmissionMapTransform: { value: /*@__PURE__*/ new Y() },
		transmissionSamplerSize: { value: /*@__PURE__*/ new q() },
		transmissionSamplerMap: { value: null },
		thickness: { value: 0 },
		thicknessMap: { value: null },
		thicknessMapTransform: { value: /*@__PURE__*/ new Y() },
		attenuationDistance: { value: 0 },
		attenuationColor: { value: /*@__PURE__*/ new Z(0) },
		specularColor: { value: /*@__PURE__*/ new Z(1, 1, 1) },
		specularColorMap: { value: null },
		specularColorMapTransform: { value: /*@__PURE__*/ new Y() },
		specularIntensity: { value: 1 },
		specularIntensityMap: { value: null },
		specularIntensityMapTransform: { value: /*@__PURE__*/ new Y() },
		anisotropyVector: { value: /*@__PURE__*/ new q() },
		anisotropyMap: { value: null },
		anisotropyMapTransform: { value: /*@__PURE__*/ new Y() }
	}]),
	vertexShader: Q.meshphysical_vert,
	fragmentShader: Q.meshphysical_frag
};
var Mm = {
	r: 0,
	b: 0,
	g: 0
}, Nm = /*@__PURE__*/ new el(), Pm = /*@__PURE__*/ new Y();
Pm.set(-1, 0, 0, 0, 1, 0, 0, 0, 1);
function Fm(e, t, n, r, i, a) {
	let o = new Z(0), s = i === !0 ? 0 : 1, c, l, u = null, d = 0, f = null;
	function p(e) {
		let n = e.isScene === !0 ? e.background : null;
		if (n && n.isTexture) {
			let r = e.backgroundBlurriness > 0;
			n = t.get(n, r);
		}
		return n;
	}
	function m(t) {
		let r = !1, i = p(t);
		i === null ? g(o, s) : i && i.isColor && (g(i, 1), r = !0);
		let c = e.xr.getEnvironmentBlendMode();
		c === "additive" ? n.buffers.color.setClear(0, 0, 0, 1, a) : c === "alpha-blend" && n.buffers.color.setClear(0, 0, 0, 0, a), (e.autoClear || r) && (n.buffers.depth.setTest(!0), n.buffers.depth.setMask(!0), n.buffers.color.setMask(!0), e.clear(e.autoClearColor, e.autoClearDepth, e.autoClearStencil));
	}
	function h(t, n) {
		let i = p(n);
		i && (i.isCubeTexture || i.mapping === 306) ? (l === void 0 && (l = new ed(new Pd(1, 1, 1), new bp({
			name: "BackgroundCubeMaterial",
			uniforms: fp(jm.backgroundCube.uniforms),
			vertexShader: jm.backgroundCube.vertexShader,
			fragmentShader: jm.backgroundCube.fragmentShader,
			side: 1,
			depthTest: !1,
			depthWrite: !1,
			fog: !1,
			allowOverride: !1
		})), l.geometry.deleteAttribute("normal"), l.geometry.deleteAttribute("uv"), l.onBeforeRender = function(e, t, n) {
			this.matrixWorld.copyPosition(n.matrixWorld);
		}, Object.defineProperty(l.material, "envMap", { get: function() {
			return this.uniforms.envMap.value;
		} }), r.update(l)), l.material.uniforms.envMap.value = i, l.material.uniforms.backgroundBlurriness.value = n.backgroundBlurriness, l.material.uniforms.backgroundIntensity.value = n.backgroundIntensity, l.material.uniforms.backgroundRotation.value.setFromMatrix4(Nm.makeRotationFromEuler(n.backgroundRotation)).transpose(), i.isCubeTexture && i.isRenderTargetTexture === !1 && l.material.uniforms.backgroundRotation.value.premultiply(Pm), l.material.toneMapped = X.getTransfer(i.colorSpace) !== cc, (u !== i || d !== i.version || f !== e.toneMapping) && (l.material.needsUpdate = !0, u = i, d = i.version, f = e.toneMapping), l.layers.enableAll(), t.unshift(l, l.geometry, l.material, 0, 0, null)) : i && i.isTexture && (c === void 0 && (c = new ed(new sp(2, 2), new bp({
			name: "BackgroundMaterial",
			uniforms: fp(jm.background.uniforms),
			vertexShader: jm.background.vertexShader,
			fragmentShader: jm.background.fragmentShader,
			side: 0,
			depthTest: !1,
			depthWrite: !1,
			fog: !1,
			allowOverride: !1
		})), c.geometry.deleteAttribute("normal"), Object.defineProperty(c.material, "map", { get: function() {
			return this.uniforms.t2D.value;
		} }), r.update(c)), c.material.uniforms.t2D.value = i, c.material.uniforms.backgroundIntensity.value = n.backgroundIntensity, c.material.toneMapped = X.getTransfer(i.colorSpace) !== cc, i.matrixAutoUpdate === !0 && i.updateMatrix(), c.material.uniforms.uvTransform.value.copy(i.matrix), (u !== i || d !== i.version || f !== e.toneMapping) && (c.material.needsUpdate = !0, u = i, d = i.version, f = e.toneMapping), c.layers.enableAll(), t.unshift(c, c.geometry, c.material, 0, 0, null));
	}
	function g(t, r) {
		t.getRGB(Mm, gp(e)), n.buffers.color.setClear(Mm.r, Mm.g, Mm.b, r, a);
	}
	function _() {
		l !== void 0 && (l.geometry.dispose(), l.material.dispose(), l = void 0), c !== void 0 && (c.geometry.dispose(), c.material.dispose(), c = void 0);
	}
	return {
		getClearColor: function() {
			return o;
		},
		setClearColor: function(e, t = 1) {
			o.set(e), s = t, g(o, s);
		},
		getClearAlpha: function() {
			return s;
		},
		setClearAlpha: function(e) {
			s = e, g(o, s);
		},
		render: m,
		addToRenderList: h,
		dispose: _
	};
}
function Im(e, t) {
	let n = e.getParameter(e.MAX_VERTEX_ATTRIBS), r = {}, i = f(null), a = i, o = !1;
	function s(n, r, i, s, c) {
		let u = !1, f = d(n, s, i, r);
		a !== f && (a = f, l(a.object)), u = p(n, s, i, c), u && m(n, s, i, c), c !== null && t.update(c, e.ELEMENT_ARRAY_BUFFER), (u || o) && (o = !1, b(n, r, i, s), c !== null && e.bindBuffer(e.ELEMENT_ARRAY_BUFFER, t.get(c).buffer));
	}
	function c() {
		return e.createVertexArray();
	}
	function l(t) {
		return e.bindVertexArray(t);
	}
	function u(t) {
		return e.deleteVertexArray(t);
	}
	function d(e, t, n, i) {
		let a = i.wireframe === !0, o = r[t.id];
		o === void 0 && (o = {}, r[t.id] = o);
		let s = e.isInstancedMesh === !0 ? e.id : 0, l = o[s];
		l === void 0 && (l = {}, o[s] = l);
		let u = l[n.id];
		u === void 0 && (u = {}, l[n.id] = u);
		let d = u[a];
		return d === void 0 && (d = f(c()), u[a] = d), d;
	}
	function f(e) {
		let t = [], r = [], i = [];
		for (let e = 0; e < n; e++) t[e] = 0, r[e] = 0, i[e] = 0;
		return {
			geometry: null,
			program: null,
			wireframe: !1,
			newAttributes: t,
			enabledAttributes: r,
			attributeDivisors: i,
			object: e,
			attributes: {},
			index: null
		};
	}
	function p(e, t, n, r) {
		let i = a.attributes, o = t.attributes, s = 0, c = n.getAttributes();
		for (let t in c) if (c[t].location >= 0) {
			let n = i[t], r = o[t];
			if (r === void 0 && (t === "instanceMatrix" && e.instanceMatrix && (r = e.instanceMatrix), t === "instanceColor" && e.instanceColor && (r = e.instanceColor)), n === void 0 || n.attribute !== r || r && n.data !== r.data) return !0;
			s++;
		}
		return a.attributesNum !== s || a.index !== r;
	}
	function m(e, t, n, r) {
		let i = {}, o = t.attributes, s = 0, c = n.getAttributes();
		for (let t in c) if (c[t].location >= 0) {
			let n = o[t];
			n === void 0 && (t === "instanceMatrix" && e.instanceMatrix && (n = e.instanceMatrix), t === "instanceColor" && e.instanceColor && (n = e.instanceColor));
			let r = {};
			r.attribute = n, n && n.data && (r.data = n.data), i[t] = r, s++;
		}
		a.attributes = i, a.attributesNum = s, a.index = r;
	}
	function h() {
		let e = a.newAttributes;
		for (let t = 0, n = e.length; t < n; t++) e[t] = 0;
	}
	function g(e) {
		_(e, 0);
	}
	function _(t, n) {
		let r = a.newAttributes, i = a.enabledAttributes, o = a.attributeDivisors;
		r[t] = 1, i[t] === 0 && (e.enableVertexAttribArray(t), i[t] = 1), o[t] !== n && (e.vertexAttribDivisor(t, n), o[t] = n);
	}
	function v() {
		let t = a.newAttributes, n = a.enabledAttributes;
		for (let r = 0, i = n.length; r < i; r++) n[r] !== t[r] && (e.disableVertexAttribArray(r), n[r] = 0);
	}
	function y(t, n, r, i, a, o, s) {
		s === !0 ? e.vertexAttribIPointer(t, n, r, a, o) : e.vertexAttribPointer(t, n, r, i, a, o);
	}
	function b(n, r, i, a) {
		h();
		let o = a.attributes, s = i.getAttributes(), c = r.defaultAttributeValues;
		for (let r in s) {
			let i = s[r];
			if (i.location >= 0) {
				let s = o[r];
				if (s === void 0 && (r === "instanceMatrix" && n.instanceMatrix && (s = n.instanceMatrix), r === "instanceColor" && n.instanceColor && (s = n.instanceColor)), s !== void 0) {
					let r = s.normalized, o = s.itemSize, c = t.get(s);
					if (c === void 0) continue;
					let l = c.buffer, u = c.type, d = c.bytesPerElement, f = u === e.INT || u === e.UNSIGNED_INT || s.gpuType === 1013;
					if (s.isInterleavedBufferAttribute) {
						let t = s.data, c = t.stride, p = s.offset;
						if (t.isInstancedInterleavedBuffer) {
							for (let e = 0; e < i.locationSize; e++) _(i.location + e, t.meshPerAttribute);
							n.isInstancedMesh !== !0 && a._maxInstanceCount === void 0 && (a._maxInstanceCount = t.meshPerAttribute * t.count);
						} else for (let e = 0; e < i.locationSize; e++) g(i.location + e);
						e.bindBuffer(e.ARRAY_BUFFER, l);
						for (let e = 0; e < i.locationSize; e++) y(i.location + e, o / i.locationSize, u, r, c * d, (p + o / i.locationSize * e) * d, f);
					} else {
						if (s.isInstancedBufferAttribute) {
							for (let e = 0; e < i.locationSize; e++) _(i.location + e, s.meshPerAttribute);
							n.isInstancedMesh !== !0 && a._maxInstanceCount === void 0 && (a._maxInstanceCount = s.meshPerAttribute * s.count);
						} else for (let e = 0; e < i.locationSize; e++) g(i.location + e);
						e.bindBuffer(e.ARRAY_BUFFER, l);
						for (let e = 0; e < i.locationSize; e++) y(i.location + e, o / i.locationSize, u, r, o * d, o / i.locationSize * e * d, f);
					}
				} else if (c !== void 0) {
					let t = c[r];
					if (t !== void 0) switch (t.length) {
						case 2:
							e.vertexAttrib2fv(i.location, t);
							break;
						case 3:
							e.vertexAttrib3fv(i.location, t);
							break;
						case 4:
							e.vertexAttrib4fv(i.location, t);
							break;
						default: e.vertexAttrib1fv(i.location, t);
					}
				}
			}
		}
		v();
	}
	function x() {
		T();
		for (let e in r) {
			let t = r[e];
			for (let e in t) {
				let n = t[e];
				for (let e in n) {
					let t = n[e];
					for (let e in t) u(t[e].object), delete t[e];
					delete n[e];
				}
			}
			delete r[e];
		}
	}
	function S(e) {
		if (r[e.id] === void 0) return;
		let t = r[e.id];
		for (let e in t) {
			let n = t[e];
			for (let e in n) {
				let t = n[e];
				for (let e in t) u(t[e].object), delete t[e];
				delete n[e];
			}
		}
		delete r[e.id];
	}
	function C(e) {
		for (let t in r) {
			let n = r[t];
			for (let t in n) {
				let r = n[t];
				if (r[e.id] === void 0) continue;
				let i = r[e.id];
				for (let e in i) u(i[e].object), delete i[e];
				delete r[e.id];
			}
		}
	}
	function w(e) {
		for (let t in r) {
			let n = r[t], i = e.isInstancedMesh === !0 ? e.id : 0, a = n[i];
			if (a !== void 0) {
				for (let e in a) {
					let t = a[e];
					for (let e in t) u(t[e].object), delete t[e];
					delete a[e];
				}
				delete n[i], Object.keys(n).length === 0 && delete r[t];
			}
		}
	}
	function T() {
		E(), o = !0, a !== i && (a = i, l(a.object));
	}
	function E() {
		i.geometry = null, i.program = null, i.wireframe = !1;
	}
	return {
		setup: s,
		reset: T,
		resetDefaultState: E,
		dispose: x,
		releaseStatesOfGeometry: S,
		releaseStatesOfObject: w,
		releaseStatesOfProgram: C,
		initAttributes: h,
		enableAttribute: g,
		disableUnusedAttributes: v
	};
}
function Lm(e, t, n) {
	let r;
	function i(e) {
		r = e;
	}
	function a(t, i) {
		e.drawArrays(r, t, i), n.update(i, r, 1);
	}
	function o(t, i, a) {
		a !== 0 && (e.drawArraysInstanced(r, t, i, a), n.update(i, r, a));
	}
	function s(e, i, a) {
		if (a === 0) return;
		t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(r, e, 0, i, 0, a);
		let o = 0;
		for (let e = 0; e < a; e++) o += i[e];
		n.update(o, r, 1);
	}
	this.setMode = i, this.render = a, this.renderInstances = o, this.renderMultiDraw = s;
}
function Rm(e, t, n, r) {
	let i;
	function a() {
		if (i !== void 0) return i;
		if (t.has("EXT_texture_filter_anisotropic") === !0) {
			let n = t.get("EXT_texture_filter_anisotropic");
			i = e.getParameter(n.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
		} else i = 0;
		return i;
	}
	function o(t) {
		return t === 1023 || r.convert(t) === e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT);
	}
	function s(n) {
		let i = n === 1016 && (t.has("EXT_color_buffer_half_float") || t.has("EXT_color_buffer_float"));
		return !(n !== 1009 && n !== 1015 && !i && r.convert(n) !== e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE));
	}
	function c(t) {
		if (t === "highp") {
			if (e.getShaderPrecisionFormat(e.VERTEX_SHADER, e.HIGH_FLOAT).precision > 0 && e.getShaderPrecisionFormat(e.FRAGMENT_SHADER, e.HIGH_FLOAT).precision > 0) return "highp";
			t = "mediump";
		}
		return t === "mediump" && e.getShaderPrecisionFormat(e.VERTEX_SHADER, e.MEDIUM_FLOAT).precision > 0 && e.getShaderPrecisionFormat(e.FRAGMENT_SHADER, e.MEDIUM_FLOAT).precision > 0 ? "mediump" : "lowp";
	}
	let l = n.precision === void 0 ? "highp" : n.precision, u = c(l);
	u !== l && (W("WebGLRenderer:", l, "not supported, using", u, "instead."), l = u);
	let d = n.logarithmicDepthBuffer === !0, f = n.reversedDepthBuffer === !0 && t.has("EXT_clip_control");
	n.reversedDepthBuffer === !0 && f === !1 && W("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");
	let p = e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS), m = e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS), h = e.getParameter(e.MAX_TEXTURE_SIZE), g = e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE), _ = e.getParameter(e.MAX_VERTEX_ATTRIBS), v = e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS), y = e.getParameter(e.MAX_VARYING_VECTORS), b = e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS), x = e.getParameter(e.MAX_SAMPLES), S = e.getParameter(e.SAMPLES);
	return {
		isWebGL2: !0,
		getMaxAnisotropy: a,
		getMaxPrecision: c,
		textureFormatReadable: o,
		textureTypeReadable: s,
		precision: l,
		logarithmicDepthBuffer: d,
		reversedDepthBuffer: f,
		maxTextures: p,
		maxVertexTextures: m,
		maxTextureSize: h,
		maxCubemapSize: g,
		maxAttributes: _,
		maxVertexUniforms: v,
		maxVaryings: y,
		maxFragmentUniforms: b,
		maxSamples: x,
		samples: S
	};
}
function zm(e) {
	let t = this, n = null, r = 0, i = !1, a = !1, o = new Pu(), s = new Y(), c = {
		value: null,
		needsUpdate: !1
	};
	this.uniform = c, this.numPlanes = 0, this.numIntersection = 0, this.init = function(e, t) {
		let n = e.length !== 0 || t || r !== 0 || i;
		return i = t, r = e.length, n;
	}, this.beginShadows = function() {
		a = !0, u(null);
	}, this.endShadows = function() {
		a = !1;
	}, this.setGlobalState = function(e, t) {
		n = u(e, t, 0);
	}, this.setState = function(t, o, s) {
		let d = t.clippingPlanes, f = t.clipIntersection, p = t.clipShadows, m = e.get(t);
		if (!i || d === null || d.length === 0 || a && !p) a ? u(null) : l();
		else {
			let e = a ? 0 : r, t = e * 4, i = m.clippingState || null;
			c.value = i, i = u(d, o, t, s);
			for (let e = 0; e !== t; ++e) i[e] = n[e];
			m.clippingState = i, this.numIntersection = f ? this.numPlanes : 0, this.numPlanes += e;
		}
	};
	function l() {
		c.value !== n && (c.value = n, c.needsUpdate = r > 0), t.numPlanes = r, t.numIntersection = 0;
	}
	function u(e, n, r, i) {
		let a = e === null ? 0 : e.length, l = null;
		if (a !== 0) {
			if (l = c.value, i !== !0 || l === null) {
				let t = r + a * 4, i = n.matrixWorldInverse;
				s.getNormalMatrix(i), (l === null || l.length < t) && (l = new Float32Array(t));
				for (let t = 0, n = r; t !== a; ++t, n += 4) o.copy(e[t]).applyMatrix4(i, s), o.normal.toArray(l, n), l[n + 3] = o.constant;
			}
			c.value = l, c.needsUpdate = !0;
		}
		return t.numPlanes = a, t.numIntersection = 0, l;
	}
}
var Bm = 4, Vm = 6, Hm = 20, Um = 256, Wm = /*@__PURE__*/ new im(), Gm = /*@__PURE__*/ new Z(), Km = null, qm = 0, Jm = 0, Ym = !1, Xm = /*@__PURE__*/ new J(), Zm = /*@__PURE__*/ new J(), Qm = class {
	constructor(e) {
		this._renderer = e, this._pingPongRenderTarget = null, this._lodMax = 0, this._cubeSize = 0, this._sizeLods = [], this._lodMeshes = [], this._backgroundBox = null, this._cubemapMaterial = null, this._equirectMaterial = null, this._blurMaterial = null, this._ggxMaterial = null;
	}
	fromScene(e, t = 0, n = .1, r = 100, i = {}) {
		let { size: a = 256, position: o = Xm } = i;
		Km = this._renderer.getRenderTarget(), qm = this._renderer.getActiveCubeFace(), Jm = this._renderer.getActiveMipmapLevel(), Ym = this._renderer.xr.enabled, this._renderer.xr.enabled = !1, this._setSize(a);
		let s = this._allocateTargets();
		return s.depthBuffer = !0, this._sceneToCubeUV(e, n, r, s, o), t > 0 && this._blur(s, 0, 0, t), this._applyPMREM(s), this._cleanup(s), s;
	}
	fromEquirectangular(e, t = null) {
		return this._fromTexture(e, t);
	}
	fromCubemap(e, t = null) {
		return this._fromTexture(e, t);
	}
	compileCubemapShader() {
		this._cubemapMaterial === null && (this._cubemapMaterial = ah(), this._compileMaterial(this._cubemapMaterial));
	}
	compileEquirectangularShader() {
		this._equirectMaterial === null && (this._equirectMaterial = ih(), this._compileMaterial(this._equirectMaterial));
	}
	dispose() {
		this._dispose(), this._cubemapMaterial !== null && this._cubemapMaterial.dispose(), this._equirectMaterial !== null && this._equirectMaterial.dispose(), this._backgroundBox !== null && (this._backgroundBox.geometry.dispose(), this._backgroundBox.material.dispose());
	}
	_setSize(e) {
		this._lodMax = Math.floor(Math.log2(e)), this._cubeSize = 2 ** this._lodMax;
	}
	_dispose() {
		this._blurMaterial !== null && this._blurMaterial.dispose(), this._ggxMaterial !== null && this._ggxMaterial.dispose(), this._pingPongRenderTarget !== null && this._pingPongRenderTarget.dispose();
		for (let e = 0; e < this._lodMeshes.length; e++) this._lodMeshes[e].geometry.dispose();
	}
	_cleanup(e) {
		this._renderer.setRenderTarget(Km, qm, Jm), this._renderer.xr.enabled = Ym, e.scissorTest = !1, th(e, 0, 0, e.width, e.height);
	}
	_fromTexture(e, t) {
		e.mapping === 301 || e.mapping === 302 ? this._setSize(e.image.length === 0 ? 16 : e.image[0].width || e.image[0].image.width) : this._setSize(e.image.width / 4), Km = this._renderer.getRenderTarget(), qm = this._renderer.getActiveCubeFace(), Jm = this._renderer.getActiveMipmapLevel(), Ym = this._renderer.xr.enabled, this._renderer.xr.enabled = !1;
		let n = t || this._allocateTargets();
		return this._textureToCubeUV(e, n), this._applyPMREM(n), this._cleanup(n), n;
	}
	_allocateTargets() {
		let e = 3 * Math.max(this._cubeSize, 112), t = 4 * this._cubeSize, n = {
			magFilter: Uo,
			minFilter: Uo,
			generateMipmaps: !1,
			type: $o,
			format: ss,
			colorSpace: oc,
			depthBuffer: !1
		}, r = eh(e, t, n);
		if (this._pingPongRenderTarget === null || this._pingPongRenderTarget.width !== e || this._pingPongRenderTarget.height !== t) {
			this._pingPongRenderTarget !== null && this._dispose(), this._pingPongRenderTarget = eh(e, t, n);
			let { _lodMax: r } = this;
			({lodMeshes: this._lodMeshes, sizeLods: this._sizeLods} = $m(r)), this._blurMaterial = rh(r, e, t), this._ggxMaterial = nh(r, e, t);
		}
		return r;
	}
	_compileMaterial(e) {
		let t = new ed(new Au(), e);
		this._renderer.compile(t, Wm);
	}
	_sceneToCubeUV(e, t, n, r, i) {
		let a = new rm(90, 1, t, n), o = [
			1,
			-1,
			1,
			1,
			1,
			1
		], s = [
			1,
			1,
			1,
			-1,
			-1,
			-1
		], c = this._renderer, l = c.autoClear, u = c.toneMapping;
		c.getClearColor(Gm), c.toneMapping = 0, c.autoClear = !1, c.state.buffers.depth.getReversed() && (c.setRenderTarget(r), c.clearDepth(), c.setRenderTarget(null)), this._backgroundBox === null && (this._backgroundBox = new ed(new Pd(), new Hu({
			name: "PMREM.Background",
			side: 1,
			depthWrite: !1,
			depthTest: !1
		})));
		let d = this._backgroundBox, f = d.material, p = !1, m = e.background;
		m ? m.isColor && (f.color.copy(m), e.background = null, p = !0) : (f.color.copy(Gm), p = !0);
		for (let t = 0; t < 6; t++) {
			let n = t % 3;
			n === 0 ? (a.up.set(0, o[t], 0), a.position.set(i.x, i.y, i.z), a.lookAt(i.x + s[t], i.y, i.z)) : n === 1 ? (a.up.set(0, 0, o[t]), a.position.set(i.x, i.y, i.z), a.lookAt(i.x, i.y + s[t], i.z)) : (a.up.set(0, o[t], 0), a.position.set(i.x, i.y, i.z), a.lookAt(i.x, i.y, i.z + s[t]));
			let l = this._cubeSize;
			th(r, n * l, t > 2 ? l : 0, l, l), c.setRenderTarget(r), p && c.render(d, a), c.render(e, a);
		}
		c.toneMapping = u, c.autoClear = l, e.background = m;
	}
	_textureToCubeUV(e, t) {
		let n = this._renderer, r = e.mapping === 301 || e.mapping === 302;
		r ? (this._cubemapMaterial === null && (this._cubemapMaterial = ah()), this._cubemapMaterial.uniforms.flipEnvMap.value = e.isRenderTargetTexture === !1 ? -1 : 1) : this._equirectMaterial === null && (this._equirectMaterial = ih());
		let i = r ? this._cubemapMaterial : this._equirectMaterial, a = this._lodMeshes[0];
		a.material = i;
		let o = i.uniforms;
		o.envMap.value = e;
		let s = this._cubeSize;
		th(t, 0, 0, 3 * s, 2 * s), n.setRenderTarget(t), n.render(a, Wm);
	}
	_applyPMREM(e) {
		let t = this._renderer, n = t.autoClear;
		t.autoClear = !1;
		let r = this._lodMeshes.length;
		for (let t = 1; t < r; t++) this._applyGGXFilter(e, t - 1, t);
		t.autoClear = n;
	}
	_applyGGXFilter(e, t, n) {
		let r = this._renderer, i = this._pingPongRenderTarget, a = this._ggxMaterial, o = this._lodMeshes[n];
		o.material = a;
		let s = a.uniforms, c = n / (this._lodMeshes.length - 1), l = t / (this._lodMeshes.length - 1), u = Math.sqrt(c * c - l * l) * (c * 1.25), { _lodMax: d } = this, f = this._sizeLods[n], p = 3 * f * (n > d - Bm ? n - d + Bm : 0), m = 4 * (this._cubeSize - f);
		s.envMap.value = e.texture, s.roughness.value = u, s.mipInt.value = d - t, th(i, p, m, 3 * f, 2 * f), r.setRenderTarget(i), r.render(o, Wm), s.envMap.value = i.texture, s.roughness.value = 0, s.mipInt.value = d - n, th(e, p, m, 3 * f, 2 * f), r.setRenderTarget(e), r.render(o, Wm);
	}
	_blur(e, t, n, r) {
		let i = this._pingPongRenderTarget, a = Math.min(r, Math.PI) / Math.SQRT2;
		this._blurPass(e, i, t, n, a), this._blurPass(i, e, n, n, a);
	}
	_blurPass(e, t, n, r, i) {
		let a = this._renderer, o = this._blurMaterial, s = this._lodMeshes[r];
		s.material = o;
		let c = o.uniforms;
		c.envMap.value = e.texture, c.sigma.value = i, c.mipInt.value = this._lodMax - n;
		let l = this._sizeLods[r];
		th(t, 3 * l * (r > this._lodMax - Bm ? r - this._lodMax + Bm : 0), 4 * (this._cubeSize - l), 3 * l, 2 * l), a.setRenderTarget(t), a.render(s, Wm);
	}
};
function $m(e) {
	let t = [], n = [], r = e, i = e - Bm + 1 + Vm;
	for (let e = 0; e < i; e++) {
		let e = 2 ** r;
		t.push(e);
		let i = 1 / (e - 2), a = -i, o = 1 + i, s = [
			a,
			a,
			o,
			a,
			o,
			o,
			a,
			a,
			o,
			o,
			a,
			o
		], c = /* @__PURE__ */ new Float32Array(108), l = /* @__PURE__ */ new Float32Array(108);
		for (let e = 0; e < 6; e++) {
			let t = e % 3 * 2 / 3 - 1, n = e > 2 ? 0 : -1, r = [
				t,
				n,
				0,
				t + 2 / 3,
				n,
				0,
				t + 2 / 3,
				n + 1,
				0,
				t,
				n,
				0,
				t + 2 / 3,
				n + 1,
				0,
				t,
				n + 1,
				0
			];
			c.set(r, 18 * e);
			for (let t = 0; t < 6; t++) {
				let n = s[t * 2] * 2 - 1, r = s[t * 2 + 1] * 2 - 1;
				e === 0 ? Zm.set(1, r, n) : e === 1 ? Zm.set(-n, 1, -r) : e === 2 ? Zm.set(-n, r, 1) : e === 3 ? Zm.set(-1, r, -n) : e === 4 ? Zm.set(-n, -1, r) : Zm.set(n, r, -1), Zm.toArray(l, (e * 6 + t) * 3);
			}
		}
		let u = new Au();
		u.setAttribute("position", new hu(c, 3)), u.setAttribute("outputDirection", new hu(l, 3)), n.push(new ed(u, null)), r > Bm && r--;
	}
	return {
		lodMeshes: n,
		sizeLods: t
	};
}
function eh(e, t, n) {
	let r = new Zc(e, t, n);
	return r.texture.mapping = 306, r.texture.name = "PMREM.cubeUv", r.scissorTest = !0, r;
}
function th(e, t, n, r, i) {
	e.viewport.set(t, n, r, i), e.scissor.set(t, n, r, i);
}
function nh(e, t, n) {
	return new bp({
		name: "PMREMGGXConvolution",
		defines: {
			GGX_SAMPLES: Um,
			CUBEUV_TEXEL_WIDTH: 1 / t,
			CUBEUV_TEXEL_HEIGHT: 1 / n,
			CUBEUV_MAX_MIP: `${e}.0`
		},
		uniforms: {
			envMap: { value: null },
			roughness: { value: 0 },
			mipInt: { value: 0 }
		},
		vertexShader: oh(),
		fragmentShader: "\n\n			precision highp float;\n			precision highp int;\n\n			varying vec3 vOutputDirection;\n\n			uniform sampler2D envMap;\n			uniform float roughness;\n			uniform float mipInt;\n\n			#define ENVMAP_TYPE_CUBE_UV\n			#include <cube_uv_reflection_fragment>\n\n			#define PI 3.14159265359\n\n			// Van der Corput radical inverse\n			float radicalInverse_VdC(uint bits) {\n				bits = (bits << 16u) | (bits >> 16u);\n				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);\n				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);\n				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);\n				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);\n				return float(bits) * 2.3283064365386963e-10; // / 0x100000000\n			}\n\n			// Hammersley sequence\n			vec2 hammersley(uint i, uint N) {\n				return vec2(float(i) / float(N), radicalInverse_VdC(i));\n			}\n\n			// GGX VNDF importance sampling (Eric Heitz 2018)\n			// \"Sampling the GGX Distribution of Visible Normals\"\n			// https://jcgt.org/published/0007/04/01/\n			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {\n				float alpha = roughness * roughness;\n\n				// Section 4.1: Orthonormal basis\n				vec3 T1 = vec3(1.0, 0.0, 0.0);\n				vec3 T2 = cross(V, T1);\n\n				// Section 4.2: Parameterization of projected area\n				float r = sqrt(Xi.x);\n				float phi = 2.0 * PI * Xi.y;\n				float t1 = r * cos(phi);\n				float t2 = r * sin(phi);\n				float s = 0.5 * (1.0 + V.z);\n				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;\n\n				// Section 4.3: Reprojection onto hemisphere\n				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;\n\n				// Section 3.4: Transform back to ellipsoid configuration\n				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));\n			}\n\n			void main() {\n				vec3 N = normalize(vOutputDirection);\n				vec3 V = N; // Assume view direction equals normal for pre-filtering\n\n				vec3 prefilteredColor = vec3(0.0);\n				float totalWeight = 0.0;\n\n				// For very low roughness, just sample the environment directly\n				if (roughness < 0.001) {\n					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);\n					return;\n				}\n\n				// Tangent space basis for VNDF sampling\n				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);\n				vec3 tangent = normalize(cross(up, N));\n				vec3 bitangent = cross(N, tangent);\n\n				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {\n					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));\n\n					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)\n					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);\n\n					// Transform H back to world space\n					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);\n					vec3 L = normalize(2.0 * dot(V, H) * H - V);\n\n					float NdotL = max(dot(N, L), 0.0);\n\n					if(NdotL > 0.0) {\n						// Sample environment at fixed mip level\n						// VNDF importance sampling handles the distribution filtering\n						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);\n\n						// Weight by NdotL for the split-sum approximation\n						// VNDF PDF naturally accounts for the visible microfacet distribution\n						prefilteredColor += sampleColor * NdotL;\n						totalWeight += NdotL;\n					}\n				}\n\n				if (totalWeight > 0.0) {\n					prefilteredColor = prefilteredColor / totalWeight;\n				}\n\n				gl_FragColor = vec4(prefilteredColor, 1.0);\n			}\n		",
		blending: 0,
		depthTest: !1,
		depthWrite: !1
	});
}
function rh(e, t, n) {
	return new bp({
		name: "SphericalGaussianBlur",
		defines: {
			SAMPLES: Hm,
			CUBEUV_TEXEL_WIDTH: 1 / t,
			CUBEUV_TEXEL_HEIGHT: 1 / n,
			CUBEUV_MAX_MIP: `${e}.0`
		},
		uniforms: {
			envMap: { value: null },
			sigma: { value: 0 },
			mipInt: { value: 0 }
		},
		vertexShader: oh(),
		fragmentShader: "\n\n			precision highp float;\n			precision highp int;\n\n			varying vec3 vOutputDirection;\n\n			uniform sampler2D envMap;\n			uniform float sigma;\n			uniform float mipInt;\n\n			#define ENVMAP_TYPE_CUBE_UV\n			#include <cube_uv_reflection_fragment>\n\n			#define PI 3.14159265359\n			#define GOLDEN_ANGLE 2.39996322973\n\n			void main() {\n\n				if ( sigma == 0.0 ) {\n\n					gl_FragColor = vec4( bilinearCubeUV( envMap, vOutputDirection, mipInt ), 1.0 );\n					return;\n\n				}\n\n				vec3 outputDirection = normalize( vOutputDirection );\n\n				vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );\n				vec3 tangent = normalize( cross( up, outputDirection ) );\n				vec3 bitangent = cross( outputDirection, tangent );\n\n				// Truncate the kernel at three standard deviations or at the antipode.\n				float thetaMax = min( 3.0 * sigma, PI );\n				float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );\n\n				vec3 accumColor = vec3( 0.0 );\n				float accumWeight = 0.0;\n\n				for ( int i = 0; i < SAMPLES; i ++ ) {\n\n					// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.\n					float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );\n					float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );\n					float phi = float( i ) * GOLDEN_ANGLE;\n\n					vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;\n					vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;\n\n					// Correct the planar sample density to solid angle.\n					float weight = sin( theta ) / theta;\n\n					accumColor += weight * bilinearCubeUV( envMap, sampleDirection, mipInt );\n					accumWeight += weight;\n\n				}\n\n				gl_FragColor = vec4( accumColor / accumWeight, 1.0 );\n\n			}\n		",
		blending: 0,
		depthTest: !1,
		depthWrite: !1
	});
}
function ih() {
	return new bp({
		name: "EquirectangularToCubeUV",
		uniforms: { envMap: { value: null } },
		vertexShader: oh(),
		fragmentShader: "\n\n			precision mediump float;\n			precision mediump int;\n\n			varying vec3 vOutputDirection;\n\n			uniform sampler2D envMap;\n\n			#include <common>\n\n			void main() {\n\n				vec3 outputDirection = normalize( vOutputDirection );\n				vec2 uv = equirectUv( outputDirection );\n\n				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );\n\n			}\n		",
		blending: 0,
		depthTest: !1,
		depthWrite: !1
	});
}
function ah() {
	return new bp({
		name: "CubemapToCubeUV",
		uniforms: {
			envMap: { value: null },
			flipEnvMap: { value: -1 }
		},
		vertexShader: oh(),
		fragmentShader: "\n\n			precision mediump float;\n			precision mediump int;\n\n			uniform float flipEnvMap;\n\n			varying vec3 vOutputDirection;\n\n			uniform samplerCube envMap;\n\n			void main() {\n\n				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );\n\n			}\n		",
		blending: 0,
		depthTest: !1,
		depthWrite: !1
	});
}
function oh() {
	return "\n\n		precision mediump float;\n		precision mediump int;\n\n		attribute vec3 outputDirection;\n\n		varying vec3 vOutputDirection;\n\n		void main() {\n\n			vOutputDirection = outputDirection;\n			gl_Position = vec4( position, 1.0 );\n\n		}\n	";
}
var sh = class extends Zc {
	constructor(e = 1, t = {}) {
		super(e, e, t), this.isWebGLCubeRenderTarget = !0;
		let n = {
			width: e,
			height: e,
			depth: 1
		}, r = [
			n,
			n,
			n,
			n,
			n,
			n
		];
		this.texture = new Ad(r), this._setTextureOptions(t), this.texture.isRenderTargetTexture = !0;
	}
	fromEquirectangularTexture(e, t) {
		this.texture.type = t.type, this.texture.colorSpace = t.colorSpace, this.texture.generateMipmaps = t.generateMipmaps, this.texture.minFilter = t.minFilter, this.texture.magFilter = t.magFilter;
		let n = {
			uniforms: { tEquirect: { value: null } },
			vertexShader: "\n\n				varying vec3 vWorldDirection;\n\n				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {\n\n					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );\n\n				}\n\n				void main() {\n\n					vWorldDirection = transformDirection( position, modelMatrix );\n\n					#include <begin_vertex>\n					#include <project_vertex>\n\n				}\n			",
			fragmentShader: "\n\n				uniform sampler2D tEquirect;\n\n				varying vec3 vWorldDirection;\n\n				#include <common>\n\n				void main() {\n\n					vec3 direction = normalize( vWorldDirection );\n\n					vec2 sampleUV = equirectUv( direction );\n\n					gl_FragColor = texture2D( tEquirect, sampleUV );\n\n				}\n			"
		}, r = new Pd(5, 5, 5), i = new bp({
			name: "CubemapFromEquirect",
			uniforms: fp(n.uniforms),
			vertexShader: n.vertexShader,
			fragmentShader: n.fragmentShader,
			side: 1,
			blending: 0
		});
		i.uniforms.tEquirect.value = t;
		let a = new ed(r, i), o = t.minFilter;
		return t.minFilter === 1008 && (t.minFilter = Uo), new lm(1, 10, this).update(e, a), t.minFilter = o, a.geometry.dispose(), a.material.dispose(), this;
	}
	clear(e, t = !0, n = !0, r = !0) {
		let i = e.getRenderTarget();
		for (let i = 0; i < 6; i++) e.setRenderTarget(this, i), e.clear(t, n, r);
		e.setRenderTarget(i);
	}
};
function ch(e) {
	let t = /* @__PURE__ */ new WeakMap(), n = /* @__PURE__ */ new WeakMap(), r = null;
	function i(e, t = !1) {
		return e == null ? null : t ? o(e) : a(e);
	}
	function a(n) {
		if (n && n.isTexture) {
			let r = n.mapping;
			if (r === 303 || r === 304) {
				if (t.has(n)) {
					let e = t.get(n).texture;
					return s(e, n.mapping);
				}
				{
					let r = n.image;
					if (r && r.height > 0) {
						let i = new sh(r.height);
						return i.fromEquirectangularTexture(e, n), t.set(n, i), n.addEventListener("dispose", l), s(i.texture, n.mapping);
					}
					return null;
				}
			}
		}
		return n;
	}
	function o(t) {
		if (t && t.isTexture) {
			let i = t.mapping, a = i === 303 || i === 304, o = i === 301 || i === 302;
			if (a || o) {
				let i = n.get(t), s = i === void 0 ? 0 : i.texture.pmremVersion;
				if (t.isRenderTargetTexture && t.pmremVersion !== s) return r === null && (r = new Qm(e)), i = a ? r.fromEquirectangular(t, i) : r.fromCubemap(t, i), i.texture.pmremVersion = t.pmremVersion, n.set(t, i), i.texture;
				if (i !== void 0) return i.texture;
				{
					let s = t.image;
					return a && s && s.height > 0 || o && s && c(s) ? (r === null && (r = new Qm(e)), i = a ? r.fromEquirectangular(t) : r.fromCubemap(t), i.texture.pmremVersion = t.pmremVersion, n.set(t, i), t.addEventListener("dispose", u), i.texture) : null;
				}
			}
		}
		return t;
	}
	function s(e, t) {
		return t === 303 ? e.mapping = 301 : t === 304 && (e.mapping = 302), e;
	}
	function c(e) {
		let t = 0;
		for (let n = 0; n < 6; n++) e[n] !== void 0 && t++;
		return t === 6;
	}
	function l(e) {
		let n = e.target;
		n.removeEventListener("dispose", l);
		let r = t.get(n);
		r !== void 0 && (t.delete(n), r.dispose());
	}
	function u(e) {
		let t = e.target;
		t.removeEventListener("dispose", u);
		let r = n.get(t);
		r !== void 0 && (n.delete(t), r.dispose());
	}
	function d() {
		t = /* @__PURE__ */ new WeakMap(), n = /* @__PURE__ */ new WeakMap(), r !== null && (r.dispose(), r = null);
	}
	return {
		get: i,
		dispose: d
	};
}
function lh(e) {
	let t = {};
	function n(n) {
		if (t[n] !== void 0) return t[n];
		let r = e.getExtension(n);
		return t[n] = r, r;
	}
	return {
		has: function(e) {
			return n(e) !== null;
		},
		init: function() {
			n("EXT_color_buffer_float"), n("WEBGL_clip_cull_distance"), n("OES_texture_float_linear"), n("EXT_color_buffer_half_float"), n("WEBGL_multisampled_render_to_texture"), n("WEBGL_render_shared_exponent");
		},
		get: function(e) {
			let t = n(e);
			return t === null && bc("WebGLRenderer: " + e + " extension not supported."), t;
		}
	};
}
function uh(e, t, n, r) {
	let i = {}, a = /* @__PURE__ */ new WeakMap();
	function o(e) {
		let s = e.target;
		s.index !== null && t.remove(s.index);
		for (let e in s.attributes) t.remove(s.attributes[e]);
		s.removeEventListener("dispose", o), delete i[s.id];
		let c = a.get(s);
		c && (t.remove(c), a.delete(s)), r.releaseStatesOfGeometry(s), s.isInstancedBufferGeometry === !0 && delete s._maxInstanceCount, n.memory.geometries--;
	}
	function s(e, t) {
		return i[t.id] === !0 || (t.addEventListener("dispose", o), i[t.id] = !0, n.memory.geometries++), t;
	}
	function c(n) {
		let r = n.attributes;
		for (let n in r) t.update(r[n], e.ARRAY_BUFFER);
	}
	function l(e) {
		let n = [], r = e.index, i = e.attributes.position, o = 0;
		if (i === void 0) return;
		if (r !== null) {
			let e = r.array;
			o = r.version;
			for (let t = 0, r = e.length; t < r; t += 3) {
				let r = e[t + 0], i = e[t + 1], a = e[t + 2];
				n.push(r, i, i, a, a, r);
			}
		} else {
			let e = i.array;
			o = i.version;
			for (let t = 0, r = e.length / 3 - 1; t < r; t += 3) {
				let e = t + 0, r = t + 1, i = t + 2;
				n.push(e, r, r, i, i, e);
			}
		}
		let s = new (i.count >= 65535 ? _u : gu)(n, 1);
		s.version = o;
		let c = a.get(e);
		c && t.remove(c), a.set(e, s);
	}
	function u(e) {
		let t = a.get(e);
		if (t) {
			let n = e.index;
			n !== null && t.version < n.version && l(e);
		} else l(e);
		return a.get(e);
	}
	return {
		get: s,
		update: c,
		getWireframeAttribute: u
	};
}
function dh(e, t, n) {
	let r;
	function i(e) {
		r = e;
	}
	let a, o;
	function s(e) {
		a = e.type, o = e.bytesPerElement;
	}
	function c(t, i) {
		e.drawElements(r, i, a, t * o), n.update(i, r, 1);
	}
	function l(t, i, s) {
		s !== 0 && (e.drawElementsInstanced(r, i, a, t * o, s), n.update(i, r, s));
	}
	function u(e, i, o) {
		if (o === 0) return;
		t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(r, i, 0, a, e, 0, o);
		let s = 0;
		for (let e = 0; e < o; e++) s += i[e];
		n.update(s, r, 1);
	}
	this.setMode = i, this.setIndex = s, this.render = c, this.renderInstances = l, this.renderMultiDraw = u;
}
function fh(e) {
	let t = {
		geometries: 0,
		textures: 0
	}, n = {
		frame: 0,
		calls: 0,
		triangles: 0,
		points: 0,
		lines: 0
	};
	function r(t, r, i) {
		switch (n.calls++, r) {
			case e.TRIANGLES:
				n.triangles += t / 3 * i;
				break;
			case e.LINES:
				n.lines += t / 2 * i;
				break;
			case e.LINE_STRIP:
				n.lines += i * (t - 1);
				break;
			case e.LINE_LOOP:
				n.lines += i * t;
				break;
			case e.POINTS:
				n.points += i * t;
				break;
			default: G("WebGLInfo: Unknown draw mode:", r);
		}
	}
	function i() {
		n.calls = 0, n.triangles = 0, n.points = 0, n.lines = 0;
	}
	return {
		memory: t,
		render: n,
		programs: null,
		autoReset: !0,
		reset: i,
		update: r
	};
}
function ph(e, t, n) {
	let r = /* @__PURE__ */ new WeakMap(), i = new Yc();
	function a(a, o, s) {
		let c = a.morphTargetInfluences, l = o.morphAttributes.position || o.morphAttributes.normal || o.morphAttributes.color, u = l === void 0 ? 0 : l.length, d = r.get(o);
		if (d === void 0 || d.count !== u) {
			d !== void 0 && d.texture.dispose();
			let e = o.morphAttributes.position !== void 0, n = o.morphAttributes.normal !== void 0, a = o.morphAttributes.color !== void 0, s = o.morphAttributes.position || [], c = o.morphAttributes.normal || [], l = o.morphAttributes.color || [], f = 0;
			e === !0 && (f = 1), n === !0 && (f = 2), a === !0 && (f = 3);
			let p = o.attributes.position.count * f, m = 1;
			p > t.maxTextureSize && (m = Math.ceil(p / t.maxTextureSize), p = t.maxTextureSize);
			let h = new Float32Array(p * m * 4 * u), g = new Qc(h, p, m, u);
			g.type = Qo, g.needsUpdate = !0;
			let _ = f * 4;
			for (let t = 0; t < u; t++) {
				let r = s[t], o = c[t], u = l[t], d = p * m * 4 * t;
				for (let t = 0; t < r.count; t++) {
					let s = t * _;
					e === !0 && (i.fromBufferAttribute(r, t), h[d + s + 0] = i.x, h[d + s + 1] = i.y, h[d + s + 2] = i.z, h[d + s + 3] = 0), n === !0 && (i.fromBufferAttribute(o, t), h[d + s + 4] = i.x, h[d + s + 5] = i.y, h[d + s + 6] = i.z, h[d + s + 7] = 0), a === !0 && (i.fromBufferAttribute(u, t), h[d + s + 8] = i.x, h[d + s + 9] = i.y, h[d + s + 10] = i.z, h[d + s + 11] = u.itemSize === 4 ? i.w : 1);
				}
			}
			d = {
				count: u,
				texture: g,
				size: new q(p, m)
			}, r.set(o, d);
			function v() {
				g.dispose(), r.delete(o), o.removeEventListener("dispose", v);
			}
			o.addEventListener("dispose", v);
		}
		if (a.isInstancedMesh === !0 && a.morphTexture !== null) s.getUniforms().setValue(e, "morphTexture", a.morphTexture, n);
		else {
			let t = 0;
			for (let e = 0; e < c.length; e++) t += c[e];
			let n = o.morphTargetsRelative ? 1 : 1 - t;
			s.getUniforms().setValue(e, "morphTargetBaseInfluence", n), s.getUniforms().setValue(e, "morphTargetInfluences", c);
		}
		s.getUniforms().setValue(e, "morphTargetsTexture", d.texture, n), s.getUniforms().setValue(e, "morphTargetsTextureSize", d.size);
	}
	return { update: a };
}
function mh(e, t, n, r, i) {
	let a = /* @__PURE__ */ new WeakMap();
	function o(r) {
		let o = i.render.frame, s = r.geometry, l = t.get(r, s);
		if (a.get(l) !== o && (t.update(l), a.set(l, o)), r.isInstancedMesh && (r.hasEventListener("dispose", c) === !1 && r.addEventListener("dispose", c), a.get(r) !== o && (n.update(r.instanceMatrix, e.ARRAY_BUFFER), r.instanceColor !== null && n.update(r.instanceColor, e.ARRAY_BUFFER), a.set(r, o))), r.isSkinnedMesh) {
			let e = r.skeleton;
			a.get(e) !== o && (e.update(), a.set(e, o));
		}
		return l;
	}
	function s() {
		a = /* @__PURE__ */ new WeakMap();
	}
	function c(e) {
		let t = e.target;
		t.removeEventListener("dispose", c), r.releaseStatesOfObject(t), n.remove(t.instanceMatrix), t.instanceColor !== null && n.remove(t.instanceColor);
	}
	return {
		update: o,
		dispose: s
	};
}
var hh = {
	1: "LINEAR_TONE_MAPPING",
	2: "REINHARD_TONE_MAPPING",
	3: "CINEON_TONE_MAPPING",
	4: "ACES_FILMIC_TONE_MAPPING",
	6: "AGX_TONE_MAPPING",
	7: "NEUTRAL_TONE_MAPPING",
	5: "CUSTOM_TONE_MAPPING"
};
function gh(e, t, n, r, i, a) {
	let o = new Zc(t, n, {
		type: e,
		depthBuffer: i,
		stencilBuffer: a,
		samples: r ? 4 : 0,
		storeMultisampledDepthBuffer: !1,
		storeMultisampledStencilBuffer: !1,
		resolveDepthBuffer: !1,
		resolveStencilBuffer: !1
	}), s = null, c = null, l = new Au();
	l.setAttribute("position", new vu([
		-1,
		3,
		0,
		-1,
		-1,
		0,
		3,
		-1,
		0
	], 3)), l.setAttribute("uv", new vu([
		0,
		2,
		0,
		0,
		2,
		0
	], 2));
	let u = new xp({
		uniforms: { tDiffuse: { value: null } },
		vertexShader: "\n			precision highp float;\n\n			uniform mat4 modelViewMatrix;\n			uniform mat4 projectionMatrix;\n\n			attribute vec3 position;\n			attribute vec2 uv;\n\n			varying vec2 vUv;\n\n			void main() {\n				vUv = uv;\n				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n			}",
		fragmentShader: "\n			precision highp float;\n\n			uniform sampler2D tDiffuse;\n\n			varying vec2 vUv;\n\n			#include <tonemapping_pars_fragment>\n			#include <colorspace_pars_fragment>\n\n			void main() {\n				gl_FragColor = texture2D( tDiffuse, vUv );\n\n				#ifdef LINEAR_TONE_MAPPING\n					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );\n				#elif defined( REINHARD_TONE_MAPPING )\n					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );\n				#elif defined( CINEON_TONE_MAPPING )\n					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );\n				#elif defined( ACES_FILMIC_TONE_MAPPING )\n					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );\n				#elif defined( AGX_TONE_MAPPING )\n					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );\n				#elif defined( NEUTRAL_TONE_MAPPING )\n					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );\n				#elif defined( CUSTOM_TONE_MAPPING )\n					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );\n				#endif\n\n				#ifdef SRGB_TRANSFER\n					gl_FragColor = sRGBTransferOETF( gl_FragColor );\n				#endif\n			}",
		depthTest: !1,
		depthWrite: !1
	}), d = new ed(l, u), f = new im(-1, 1, 1, -1, 0, 1), p = null, m = null, h = !1, g, _ = null, v = [], y = !1;
	this.setSize = function(e, t) {
		o.setSize(e, t), s !== null && s.setSize(e, t), c !== null && c.setSize(e, t);
		for (let n = 0; n < v.length; n++) {
			let r = v[n];
			r.setSize && r.setSize(e, t);
		}
	}, this.setEffects = function(e) {
		v = e, y = v.length > 0 && v[0].isRenderPass === !0;
		let t = o.width, n = o.height;
		v.length > 0 && s === null && (s = new Zc(t, n, {
			type: $o,
			depthBuffer: !1,
			stencilBuffer: !1
		}), c = new Zc(t, n, {
			type: $o,
			depthBuffer: !1,
			stencilBuffer: !1
		}));
		for (let e = 0; e < v.length; e++) {
			let r = v[e];
			r.setSize && r.setSize(t, n);
		}
	}, this.begin = function(e, t) {
		if (h || e.toneMapping === 0 && v.length === 0) return !1;
		if (_ = t, t !== null) {
			let e = t.width, n = t.height;
			(o.width !== e || o.height !== n) && this.setSize(e, n);
		}
		return y === !1 && e.setRenderTarget(o), g = e.toneMapping, e.toneMapping = 0, !0;
	}, this.hasRenderPass = function() {
		return y;
	}, this.end = function(e, t) {
		e.toneMapping = g, h = !0;
		let n = o, r = s;
		for (let i = 0; i < v.length; i++) {
			let a = v[i];
			a.enabled !== !1 && (a.render(e, r, n, t), a.needsSwap !== !1 && (n = r, r = r === s ? c : s));
		}
		if (p !== e.outputColorSpace || m !== e.toneMapping) {
			p = e.outputColorSpace, m = e.toneMapping, u.defines = {}, X.getTransfer(p) === "srgb" && (u.defines.SRGB_TRANSFER = "");
			let t = hh[m];
			t && (u.defines[t] = ""), u.needsUpdate = !0;
		}
		u.uniforms.tDiffuse.value = n.texture, e.setRenderTarget(_), e.render(d, f), _ = null, h = !1;
	}, this.isCompositing = function() {
		return h;
	}, this.dispose = function() {
		o.dispose(), s !== null && s.dispose(), c !== null && c.dispose(), l.dispose(), u.dispose();
	};
}
var _h = /*@__PURE__*/ new Jc(), vh = /*@__PURE__*/ new jd(1, 1), yh = /*@__PURE__*/ new Qc(), bh = /*@__PURE__*/ new $c(), xh = /*@__PURE__*/ new Ad(), Sh = [], Ch = [], wh = /* @__PURE__ */ new Float32Array(16), Th = /* @__PURE__ */ new Float32Array(9), Eh = /* @__PURE__ */ new Float32Array(4);
function Dh(e, t, n) {
	let r = e[0];
	if (r <= 0 || r > 0) return e;
	let i = t * n, a = Sh[i];
	if (a === void 0 && (a = new Float32Array(i), Sh[i] = a), t !== 0) {
		r.toArray(a, 0);
		for (let r = 1, i = 0; r !== t; ++r) i += n, e[r].toArray(a, i);
	}
	return a;
}
function Oh(e, t) {
	if (e.length !== t.length) return !1;
	for (let n = 0, r = e.length; n < r; n++) if (e[n] !== t[n]) return !1;
	return !0;
}
function kh(e, t) {
	for (let n = 0, r = t.length; n < r; n++) e[n] = t[n];
}
function Ah(e, t) {
	let n = Ch[t];
	n === void 0 && (n = new Int32Array(t), Ch[t] = n);
	for (let r = 0; r !== t; ++r) n[r] = e.allocateTextureUnit();
	return n;
}
function jh(e, t) {
	let n = this.cache;
	n[0] !== t && (e.uniform1f(this.addr, t), n[0] = t);
}
function Mh(e, t) {
	let n = this.cache;
	if (t.x !== void 0) (n[0] !== t.x || n[1] !== t.y) && (e.uniform2f(this.addr, t.x, t.y), n[0] = t.x, n[1] = t.y);
	else {
		if (Oh(n, t)) return;
		e.uniform2fv(this.addr, t), kh(n, t);
	}
}
function Nh(e, t) {
	let n = this.cache;
	if (t.x !== void 0) (n[0] !== t.x || n[1] !== t.y || n[2] !== t.z) && (e.uniform3f(this.addr, t.x, t.y, t.z), n[0] = t.x, n[1] = t.y, n[2] = t.z);
	else if (t.r !== void 0) (n[0] !== t.r || n[1] !== t.g || n[2] !== t.b) && (e.uniform3f(this.addr, t.r, t.g, t.b), n[0] = t.r, n[1] = t.g, n[2] = t.b);
	else {
		if (Oh(n, t)) return;
		e.uniform3fv(this.addr, t), kh(n, t);
	}
}
function Ph(e, t) {
	let n = this.cache;
	if (t.x !== void 0) (n[0] !== t.x || n[1] !== t.y || n[2] !== t.z || n[3] !== t.w) && (e.uniform4f(this.addr, t.x, t.y, t.z, t.w), n[0] = t.x, n[1] = t.y, n[2] = t.z, n[3] = t.w);
	else {
		if (Oh(n, t)) return;
		e.uniform4fv(this.addr, t), kh(n, t);
	}
}
function Fh(e, t) {
	let n = this.cache, r = t.elements;
	if (r === void 0) {
		if (Oh(n, t)) return;
		e.uniformMatrix2fv(this.addr, !1, t), kh(n, t);
	} else {
		if (Oh(n, r)) return;
		Eh.set(r), e.uniformMatrix2fv(this.addr, !1, Eh), kh(n, r);
	}
}
function Ih(e, t) {
	let n = this.cache, r = t.elements;
	if (r === void 0) {
		if (Oh(n, t)) return;
		e.uniformMatrix3fv(this.addr, !1, t), kh(n, t);
	} else {
		if (Oh(n, r)) return;
		Th.set(r), e.uniformMatrix3fv(this.addr, !1, Th), kh(n, r);
	}
}
function Lh(e, t) {
	let n = this.cache, r = t.elements;
	if (r === void 0) {
		if (Oh(n, t)) return;
		e.uniformMatrix4fv(this.addr, !1, t), kh(n, t);
	} else {
		if (Oh(n, r)) return;
		wh.set(r), e.uniformMatrix4fv(this.addr, !1, wh), kh(n, r);
	}
}
function Rh(e, t) {
	let n = this.cache;
	n[0] !== t && (e.uniform1i(this.addr, t), n[0] = t);
}
function zh(e, t) {
	let n = this.cache;
	if (t.x !== void 0) (n[0] !== t.x || n[1] !== t.y) && (e.uniform2i(this.addr, t.x, t.y), n[0] = t.x, n[1] = t.y);
	else {
		if (Oh(n, t)) return;
		e.uniform2iv(this.addr, t), kh(n, t);
	}
}
function Bh(e, t) {
	let n = this.cache;
	if (t.x !== void 0) (n[0] !== t.x || n[1] !== t.y || n[2] !== t.z) && (e.uniform3i(this.addr, t.x, t.y, t.z), n[0] = t.x, n[1] = t.y, n[2] = t.z);
	else {
		if (Oh(n, t)) return;
		e.uniform3iv(this.addr, t), kh(n, t);
	}
}
function Vh(e, t) {
	let n = this.cache;
	if (t.x !== void 0) (n[0] !== t.x || n[1] !== t.y || n[2] !== t.z || n[3] !== t.w) && (e.uniform4i(this.addr, t.x, t.y, t.z, t.w), n[0] = t.x, n[1] = t.y, n[2] = t.z, n[3] = t.w);
	else {
		if (Oh(n, t)) return;
		e.uniform4iv(this.addr, t), kh(n, t);
	}
}
function Hh(e, t) {
	let n = this.cache;
	n[0] !== t && (e.uniform1ui(this.addr, t), n[0] = t);
}
function Uh(e, t) {
	let n = this.cache;
	if (t.x !== void 0) (n[0] !== t.x || n[1] !== t.y) && (e.uniform2ui(this.addr, t.x, t.y), n[0] = t.x, n[1] = t.y);
	else {
		if (Oh(n, t)) return;
		e.uniform2uiv(this.addr, t), kh(n, t);
	}
}
function Wh(e, t) {
	let n = this.cache;
	if (t.x !== void 0) (n[0] !== t.x || n[1] !== t.y || n[2] !== t.z) && (e.uniform3ui(this.addr, t.x, t.y, t.z), n[0] = t.x, n[1] = t.y, n[2] = t.z);
	else {
		if (Oh(n, t)) return;
		e.uniform3uiv(this.addr, t), kh(n, t);
	}
}
function Gh(e, t) {
	let n = this.cache;
	if (t.x !== void 0) (n[0] !== t.x || n[1] !== t.y || n[2] !== t.z || n[3] !== t.w) && (e.uniform4ui(this.addr, t.x, t.y, t.z, t.w), n[0] = t.x, n[1] = t.y, n[2] = t.z, n[3] = t.w);
	else {
		if (Oh(n, t)) return;
		e.uniform4uiv(this.addr, t), kh(n, t);
	}
}
function Kh(e, t, n) {
	let r = this.cache, i = n.allocateTextureUnit();
	r[0] !== i && (e.uniform1i(this.addr, i), r[0] = i);
	let a;
	this.type === e.SAMPLER_2D_SHADOW ? (vh.compareFunction = n.isReversedDepthBuffer() ? 518 : 515, a = vh) : a = _h, n.setTexture2D(t || a, i);
}
function qh(e, t, n) {
	let r = this.cache, i = n.allocateTextureUnit();
	r[0] !== i && (e.uniform1i(this.addr, i), r[0] = i), n.setTexture3D(t || bh, i);
}
function Jh(e, t, n) {
	let r = this.cache, i = n.allocateTextureUnit();
	r[0] !== i && (e.uniform1i(this.addr, i), r[0] = i), n.setTextureCube(t || xh, i);
}
function Yh(e, t, n) {
	let r = this.cache, i = n.allocateTextureUnit();
	r[0] !== i && (e.uniform1i(this.addr, i), r[0] = i), n.setTexture2DArray(t || yh, i);
}
function Xh(e) {
	switch (e) {
		case 5126: return jh;
		case 35664: return Mh;
		case 35665: return Nh;
		case 35666: return Ph;
		case 35674: return Fh;
		case 35675: return Ih;
		case 35676: return Lh;
		case 5124:
		case 35670: return Rh;
		case 35667:
		case 35671: return zh;
		case 35668:
		case 35672: return Bh;
		case 35669:
		case 35673: return Vh;
		case 5125: return Hh;
		case 36294: return Uh;
		case 36295: return Wh;
		case 36296: return Gh;
		case 35678:
		case 36198:
		case 36298:
		case 36306:
		case 35682: return Kh;
		case 35679:
		case 36299:
		case 36307: return qh;
		case 35680:
		case 36300:
		case 36308:
		case 36293: return Jh;
		case 36289:
		case 36303:
		case 36311:
		case 36292: return Yh;
	}
}
function Zh(e, t) {
	e.uniform1fv(this.addr, t);
}
function Qh(e, t) {
	let n = Dh(t, this.size, 2);
	e.uniform2fv(this.addr, n);
}
function $h(e, t) {
	let n = Dh(t, this.size, 3);
	e.uniform3fv(this.addr, n);
}
function eg(e, t) {
	let n = Dh(t, this.size, 4);
	e.uniform4fv(this.addr, n);
}
function tg(e, t) {
	let n = Dh(t, this.size, 4);
	e.uniformMatrix2fv(this.addr, !1, n);
}
function ng(e, t) {
	let n = Dh(t, this.size, 9);
	e.uniformMatrix3fv(this.addr, !1, n);
}
function rg(e, t) {
	let n = Dh(t, this.size, 16);
	e.uniformMatrix4fv(this.addr, !1, n);
}
function ig(e, t) {
	e.uniform1iv(this.addr, t);
}
function ag(e, t) {
	e.uniform2iv(this.addr, t);
}
function og(e, t) {
	e.uniform3iv(this.addr, t);
}
function sg(e, t) {
	e.uniform4iv(this.addr, t);
}
function cg(e, t) {
	e.uniform1uiv(this.addr, t);
}
function lg(e, t) {
	e.uniform2uiv(this.addr, t);
}
function ug(e, t) {
	e.uniform3uiv(this.addr, t);
}
function dg(e, t) {
	e.uniform4uiv(this.addr, t);
}
function fg(e, t, n) {
	let r = this.cache, i = t.length, a = Ah(n, i);
	Oh(r, a) || (e.uniform1iv(this.addr, a), kh(r, a));
	let o;
	o = this.type === e.SAMPLER_2D_SHADOW ? vh : _h;
	for (let e = 0; e !== i; ++e) n.setTexture2D(t[e] || o, a[e]);
}
function pg(e, t, n) {
	let r = this.cache, i = t.length, a = Ah(n, i);
	Oh(r, a) || (e.uniform1iv(this.addr, a), kh(r, a));
	for (let e = 0; e !== i; ++e) n.setTexture3D(t[e] || bh, a[e]);
}
function mg(e, t, n) {
	let r = this.cache, i = t.length, a = Ah(n, i);
	Oh(r, a) || (e.uniform1iv(this.addr, a), kh(r, a));
	for (let e = 0; e !== i; ++e) n.setTextureCube(t[e] || xh, a[e]);
}
function hg(e, t, n) {
	let r = this.cache, i = t.length, a = Ah(n, i);
	Oh(r, a) || (e.uniform1iv(this.addr, a), kh(r, a));
	for (let e = 0; e !== i; ++e) n.setTexture2DArray(t[e] || yh, a[e]);
}
function gg(e) {
	switch (e) {
		case 5126: return Zh;
		case 35664: return Qh;
		case 35665: return $h;
		case 35666: return eg;
		case 35674: return tg;
		case 35675: return ng;
		case 35676: return rg;
		case 5124:
		case 35670: return ig;
		case 35667:
		case 35671: return ag;
		case 35668:
		case 35672: return og;
		case 35669:
		case 35673: return sg;
		case 5125: return cg;
		case 36294: return lg;
		case 36295: return ug;
		case 36296: return dg;
		case 35678:
		case 36198:
		case 36298:
		case 36306:
		case 35682: return fg;
		case 35679:
		case 36299:
		case 36307: return pg;
		case 35680:
		case 36300:
		case 36308:
		case 36293: return mg;
		case 36289:
		case 36303:
		case 36311:
		case 36292: return hg;
	}
}
var _g = class {
	constructor(e, t, n) {
		this.id = e, this.addr = n, this.cache = [], this.type = t.type, this.setValue = Xh(t.type);
	}
}, vg = class {
	constructor(e, t, n) {
		this.id = e, this.addr = n, this.cache = [], this.type = t.type, this.size = t.size, this.setValue = gg(t.type);
	}
}, yg = class {
	constructor(e) {
		this.id = e, this.seq = [], this.map = {};
	}
	setValue(e, t, n) {
		let r = this.seq;
		for (let i = 0, a = r.length; i !== a; ++i) {
			let a = r[i];
			a.setValue(e, t[a.id], n);
		}
	}
}, bg = /(\w+)(\])?(\[|\.)?/g;
function xg(e, t) {
	e.seq.push(t), e.map[t.id] = t;
}
function Sg(e, t, n) {
	let r = e.name, i = r.length;
	for (bg.lastIndex = 0;;) {
		let a = bg.exec(r), o = bg.lastIndex, s = a[1], c = a[2] === "]", l = a[3];
		if (c && (s |= 0), l === void 0 || l === "[" && o + 2 === i) {
			xg(n, l === void 0 ? new _g(s, e, t) : new vg(s, e, t));
			break;
		}
		{
			let e = n.map[s];
			e === void 0 && (e = new yg(s), xg(n, e)), n = e;
		}
	}
}
var Cg = class {
	constructor(e, t) {
		this.seq = [], this.map = {};
		let n = e.getProgramParameter(t, e.ACTIVE_UNIFORMS);
		for (let r = 0; r < n; ++r) {
			let n = e.getActiveUniform(t, r);
			Sg(n, e.getUniformLocation(t, n.name), this);
		}
		let r = [], i = [];
		for (let t of this.seq) t.type === e.SAMPLER_2D_SHADOW || t.type === e.SAMPLER_CUBE_SHADOW || t.type === e.SAMPLER_2D_ARRAY_SHADOW ? r.push(t) : i.push(t);
		r.length > 0 && (this.seq = r.concat(i));
	}
	setValue(e, t, n, r) {
		let i = this.map[t];
		i !== void 0 && i.setValue(e, n, r);
	}
	setOptional(e, t, n) {
		let r = t[n];
		r !== void 0 && this.setValue(e, n, r);
	}
	static upload(e, t, n, r) {
		for (let i = 0, a = t.length; i !== a; ++i) {
			let a = t[i], o = n[a.id];
			o.needsUpdate !== !1 && a.setValue(e, o.value, r);
		}
	}
	static seqWithValue(e, t) {
		let n = [];
		for (let r = 0, i = e.length; r !== i; ++r) {
			let i = e[r];
			i.id in t && n.push(i);
		}
		return n;
	}
};
function wg(e, t, n) {
	let r = e.createShader(t);
	return e.shaderSource(r, n), e.compileShader(r), r;
}
var Tg = 37297, Eg = 0;
function Dg(e, t) {
	let n = e.split("\n"), r = [], i = Math.max(t - 6, 0), a = Math.min(t + 6, n.length);
	for (let e = i; e < a; e++) {
		let i = e + 1;
		r.push(`${i === t ? ">" : " "} ${i}: ${n[e]}`);
	}
	return r.join("\n");
}
var Og = /*@__PURE__*/ new Y();
function kg(e) {
	X._getMatrix(Og, X.workingColorSpace, e);
	let t = `mat3( ${Og.elements.map((e) => e.toFixed(4))} )`;
	switch (X.getTransfer(e)) {
		case sc: return [t, "LinearTransferOETF"];
		case cc: return [t, "sRGBTransferOETF"];
		default: return W("WebGLProgram: Unsupported color space: ", e), [t, "LinearTransferOETF"];
	}
}
function Ag(e, t, n) {
	let r = e.getShaderParameter(t, e.COMPILE_STATUS), i = (e.getShaderInfoLog(t) || "").trim();
	if (r && i === "") return "";
	let a = /ERROR: 0:(\d+)/.exec(i);
	if (a) {
		let r = parseInt(a[1]);
		return n.toUpperCase() + "\n\n" + i + "\n\n" + Dg(e.getShaderSource(t), r);
	}
	return i;
}
function jg(e, t) {
	let n = kg(t);
	return [
		`vec4 ${e}( vec4 value ) {`,
		`	return ${n[1]}( vec4( value.rgb * ${n[0]}, value.a ) );`,
		"}"
	].join("\n");
}
var Mg = {
	1: "Linear",
	2: "Reinhard",
	3: "Cineon",
	4: "ACESFilmic",
	6: "AgX",
	7: "Neutral",
	5: "Custom"
};
function Ng(e, t) {
	let n = Mg[t];
	return n === void 0 ? (W("WebGLProgram: Unsupported toneMapping:", t), "vec3 " + e + "( vec3 color ) { return LinearToneMapping( color ); }") : "vec3 " + e + "( vec3 color ) { return " + n + "ToneMapping( color ); }";
}
var Pg = /*@__PURE__*/ new J();
function Fg() {
	return X.getLuminanceCoefficients(Pg), [
		"float luminance( const in vec3 rgb ) {",
		`	const vec3 weights = vec3( ${Pg.x.toFixed(4)}, ${Pg.y.toFixed(4)}, ${Pg.z.toFixed(4)} );`,
		"	return dot( weights, rgb );",
		"}"
	].join("\n");
}
function Ig(e) {
	return [e.extensionClipCullDistance ? "#extension GL_ANGLE_clip_cull_distance : require" : "", e.extensionMultiDraw ? "#extension GL_ANGLE_multi_draw : require" : ""].filter(zg).join("\n");
}
function Lg(e) {
	let t = [];
	for (let n in e) {
		let r = e[n];
		r !== !1 && t.push("#define " + n + " " + r);
	}
	return t.join("\n");
}
function Rg(e, t) {
	let n = {}, r = e.getProgramParameter(t, e.ACTIVE_ATTRIBUTES);
	for (let i = 0; i < r; i++) {
		let r = e.getActiveAttrib(t, i), a = r.name, o = 1;
		r.type === e.FLOAT_MAT2 && (o = 2), r.type === e.FLOAT_MAT3 && (o = 3), r.type === e.FLOAT_MAT4 && (o = 4), n[a] = {
			type: r.type,
			location: e.getAttribLocation(t, a),
			locationSize: o
		};
	}
	return n;
}
function zg(e) {
	return e !== "";
}
function Bg(e, t) {
	let n = t.numSpotLightShadows + t.numSpotLightMaps - t.numSpotLightShadowsWithMaps;
	return e.replace(/NUM_SUN_LIGHTS/g, t.numSunLights).replace(/NUM_DIR_LIGHTS/g, t.numDirLights).replace(/NUM_SPOT_LIGHTS/g, t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g, t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g, n).replace(/NUM_RECT_AREA_LIGHTS/g, t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g, t.numPointLights).replace(/NUM_HEMI_LIGHTS/g, t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g, t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g, t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g, t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g, t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g, t.numPointLightShadows);
}
function Vg(e, t) {
	return e.replace(/NUM_CLIPPING_PLANES/g, t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g, t.numClippingPlanes - t.numClipIntersection);
}
var Hg = /^[ \t]*#include +<([\w\d./]+)>/gm;
function Ug(e) {
	return e.replace(Hg, Gg);
}
var Wg = /* @__PURE__ */ new Map();
function Gg(e, t) {
	let n = Q[t];
	if (n === void 0) {
		let e = Wg.get(t);
		if (e !== void 0) n = Q[e], W("WebGLRenderer: Shader chunk \"%s\" has been deprecated. Use \"%s\" instead.", t, e);
		else throw Error("THREE.WebGLProgram: Can not resolve #include <" + t + ">");
	}
	return Ug(n);
}
var Kg = /#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;
function qg(e) {
	return e.replace(Kg, Jg);
}
function Jg(e, t, n, r) {
	let i = "";
	for (let e = parseInt(t); e < parseInt(n); e++) i += r.replace(/\[\s*i\s*\]/g, "[ " + e + " ]").replace(/UNROLLED_LOOP_INDEX/g, e);
	return i;
}
function Yg(e) {
	let t = `precision ${e.precision} float;
	precision ${e.precision} int;
	precision ${e.precision} sampler2D;
	precision ${e.precision} samplerCube;
	precision ${e.precision} sampler3D;
	precision ${e.precision} sampler2DArray;
	precision ${e.precision} sampler2DShadow;
	precision ${e.precision} samplerCubeShadow;
	precision ${e.precision} sampler2DArrayShadow;
	precision ${e.precision} isampler2D;
	precision ${e.precision} isampler3D;
	precision ${e.precision} isamplerCube;
	precision ${e.precision} isampler2DArray;
	precision ${e.precision} usampler2D;
	precision ${e.precision} usampler3D;
	precision ${e.precision} usamplerCube;
	precision ${e.precision} usampler2DArray;
	`;
	return e.precision === "highp" ? t += "\n#define HIGH_PRECISION" : e.precision === "mediump" ? t += "\n#define MEDIUM_PRECISION" : e.precision === "lowp" && (t += "\n#define LOW_PRECISION"), t;
}
var Xg = {
	1: "SHADOWMAP_TYPE_PCF",
	3: "SHADOWMAP_TYPE_VSM"
};
function Zg(e) {
	return Xg[e.shadowMapType] || "SHADOWMAP_TYPE_BASIC";
}
var Qg = {
	301: "ENVMAP_TYPE_CUBE",
	302: "ENVMAP_TYPE_CUBE",
	306: "ENVMAP_TYPE_CUBE_UV"
};
function $g(e) {
	return e.envMap === !1 ? "ENVMAP_TYPE_CUBE" : Qg[e.envMapMode] || "ENVMAP_TYPE_CUBE";
}
var e_ = { 302: "ENVMAP_MODE_REFRACTION" };
function t_(e) {
	return e.envMap === !1 ? "ENVMAP_MODE_REFLECTION" : e_[e.envMapMode] || "ENVMAP_MODE_REFLECTION";
}
var n_ = {
	0: "ENVMAP_BLENDING_MULTIPLY",
	1: "ENVMAP_BLENDING_MIX",
	2: "ENVMAP_BLENDING_ADD"
};
function r_(e) {
	return e.envMap === !1 ? "ENVMAP_BLENDING_NONE" : n_[e.combine] || "ENVMAP_BLENDING_NONE";
}
function i_(e) {
	let t = e.envMapCubeUVHeight;
	if (t === null) return null;
	let n = Math.log2(t) - 2, r = 1 / t;
	return {
		texelWidth: 1 / (3 * Math.max(2 ** n, 112)),
		texelHeight: r,
		maxMip: n
	};
}
function a_(e, t, n, r) {
	let i = e.getContext(), a = n.defines, o = n.vertexShader, s = n.fragmentShader, c = Zg(n), l = $g(n), u = t_(n), d = r_(n), f = i_(n), p = Ig(n), m = Lg(a), h = i.createProgram(), g, _, v = n.glslVersion ? "#version " + n.glslVersion + "\n" : "";
	n.isRawShaderMaterial ? (g = [
		"#define SHADER_TYPE " + n.shaderType,
		"#define SHADER_NAME " + n.shaderName,
		m
	].filter(zg).join("\n"), g.length > 0 && (g += "\n"), _ = [
		"#define SHADER_TYPE " + n.shaderType,
		"#define SHADER_NAME " + n.shaderName,
		m
	].filter(zg).join("\n"), _.length > 0 && (_ += "\n")) : (g = [
		Yg(n),
		"#define SHADER_TYPE " + n.shaderType,
		"#define SHADER_NAME " + n.shaderName,
		m,
		n.extensionClipCullDistance ? "#define USE_CLIP_DISTANCE" : "",
		n.batching ? "#define USE_BATCHING" : "",
		n.batchingColor ? "#define USE_BATCHING_COLOR" : "",
		n.instancing ? "#define USE_INSTANCING" : "",
		n.instancingColor ? "#define USE_INSTANCING_COLOR" : "",
		n.instancingMorph ? "#define USE_INSTANCING_MORPH" : "",
		n.useFog && n.fog ? "#define USE_FOG" : "",
		n.useFog && n.fogExp2 ? "#define FOG_EXP2" : "",
		n.map ? "#define USE_MAP" : "",
		n.envMap ? "#define USE_ENVMAP" : "",
		n.envMap ? "#define " + u : "",
		n.lightMap ? "#define USE_LIGHTMAP" : "",
		n.aoMap ? "#define USE_AOMAP" : "",
		n.bumpMap ? "#define USE_BUMPMAP" : "",
		n.normalMap ? "#define USE_NORMALMAP" : "",
		n.normalMapObjectSpace ? "#define USE_NORMALMAP_OBJECTSPACE" : "",
		n.normalMapTangentSpace ? "#define USE_NORMALMAP_TANGENTSPACE" : "",
		n.displacementMap ? "#define USE_DISPLACEMENTMAP" : "",
		n.emissiveMap ? "#define USE_EMISSIVEMAP" : "",
		n.anisotropy ? "#define USE_ANISOTROPY" : "",
		n.anisotropyMap ? "#define USE_ANISOTROPYMAP" : "",
		n.clearcoatMap ? "#define USE_CLEARCOATMAP" : "",
		n.clearcoatRoughnessMap ? "#define USE_CLEARCOAT_ROUGHNESSMAP" : "",
		n.clearcoatNormalMap ? "#define USE_CLEARCOAT_NORMALMAP" : "",
		n.iridescenceMap ? "#define USE_IRIDESCENCEMAP" : "",
		n.iridescenceThicknessMap ? "#define USE_IRIDESCENCE_THICKNESSMAP" : "",
		n.specularMap ? "#define USE_SPECULARMAP" : "",
		n.specularColorMap ? "#define USE_SPECULAR_COLORMAP" : "",
		n.specularIntensityMap ? "#define USE_SPECULAR_INTENSITYMAP" : "",
		n.roughnessMap ? "#define USE_ROUGHNESSMAP" : "",
		n.metalnessMap ? "#define USE_METALNESSMAP" : "",
		n.alphaMap ? "#define USE_ALPHAMAP" : "",
		n.alphaHash ? "#define USE_ALPHAHASH" : "",
		n.transmission ? "#define USE_TRANSMISSION" : "",
		n.transmissionMap ? "#define USE_TRANSMISSIONMAP" : "",
		n.thicknessMap ? "#define USE_THICKNESSMAP" : "",
		n.sheenColorMap ? "#define USE_SHEEN_COLORMAP" : "",
		n.sheenRoughnessMap ? "#define USE_SHEEN_ROUGHNESSMAP" : "",
		n.mapUv ? "#define MAP_UV " + n.mapUv : "",
		n.alphaMapUv ? "#define ALPHAMAP_UV " + n.alphaMapUv : "",
		n.lightMapUv ? "#define LIGHTMAP_UV " + n.lightMapUv : "",
		n.aoMapUv ? "#define AOMAP_UV " + n.aoMapUv : "",
		n.emissiveMapUv ? "#define EMISSIVEMAP_UV " + n.emissiveMapUv : "",
		n.bumpMapUv ? "#define BUMPMAP_UV " + n.bumpMapUv : "",
		n.normalMapUv ? "#define NORMALMAP_UV " + n.normalMapUv : "",
		n.displacementMapUv ? "#define DISPLACEMENTMAP_UV " + n.displacementMapUv : "",
		n.metalnessMapUv ? "#define METALNESSMAP_UV " + n.metalnessMapUv : "",
		n.roughnessMapUv ? "#define ROUGHNESSMAP_UV " + n.roughnessMapUv : "",
		n.anisotropyMapUv ? "#define ANISOTROPYMAP_UV " + n.anisotropyMapUv : "",
		n.clearcoatMapUv ? "#define CLEARCOATMAP_UV " + n.clearcoatMapUv : "",
		n.clearcoatNormalMapUv ? "#define CLEARCOAT_NORMALMAP_UV " + n.clearcoatNormalMapUv : "",
		n.clearcoatRoughnessMapUv ? "#define CLEARCOAT_ROUGHNESSMAP_UV " + n.clearcoatRoughnessMapUv : "",
		n.iridescenceMapUv ? "#define IRIDESCENCEMAP_UV " + n.iridescenceMapUv : "",
		n.iridescenceThicknessMapUv ? "#define IRIDESCENCE_THICKNESSMAP_UV " + n.iridescenceThicknessMapUv : "",
		n.sheenColorMapUv ? "#define SHEEN_COLORMAP_UV " + n.sheenColorMapUv : "",
		n.sheenRoughnessMapUv ? "#define SHEEN_ROUGHNESSMAP_UV " + n.sheenRoughnessMapUv : "",
		n.specularMapUv ? "#define SPECULARMAP_UV " + n.specularMapUv : "",
		n.specularColorMapUv ? "#define SPECULAR_COLORMAP_UV " + n.specularColorMapUv : "",
		n.specularIntensityMapUv ? "#define SPECULAR_INTENSITYMAP_UV " + n.specularIntensityMapUv : "",
		n.transmissionMapUv ? "#define TRANSMISSIONMAP_UV " + n.transmissionMapUv : "",
		n.thicknessMapUv ? "#define THICKNESSMAP_UV " + n.thicknessMapUv : "",
		n.vertexTangents && n.flatShading === !1 ? "#define USE_TANGENT" : "",
		n.vertexNormals ? "#define HAS_NORMAL" : "",
		n.vertexColors ? "#define USE_COLOR" : "",
		n.vertexAlphas ? "#define USE_COLOR_ALPHA" : "",
		n.vertexUv1s ? "#define USE_UV1" : "",
		n.vertexUv2s ? "#define USE_UV2" : "",
		n.vertexUv3s ? "#define USE_UV3" : "",
		n.pointsUvs ? "#define USE_POINTS_UV" : "",
		n.flatShading ? "#define FLAT_SHADED" : "",
		n.skinning ? "#define USE_SKINNING" : "",
		n.morphTargets ? "#define USE_MORPHTARGETS" : "",
		n.morphNormals && n.flatShading === !1 ? "#define USE_MORPHNORMALS" : "",
		n.morphColors ? "#define USE_MORPHCOLORS" : "",
		n.morphTargetsCount > 0 ? "#define MORPHTARGETS_TEXTURE_STRIDE " + n.morphTextureStride : "",
		n.morphTargetsCount > 0 ? "#define MORPHTARGETS_COUNT " + n.morphTargetsCount : "",
		n.doubleSided ? "#define DOUBLE_SIDED" : "",
		n.flipSided ? "#define FLIP_SIDED" : "",
		n.shadowMapEnabled ? "#define USE_SHADOWMAP" : "",
		n.shadowMapEnabled ? "#define " + c : "",
		n.sizeAttenuation ? "#define USE_SIZEATTENUATION" : "",
		n.numLightProbes > 0 ? "#define USE_LIGHT_PROBES" : "",
		n.logarithmicDepthBuffer ? "#define USE_LOGARITHMIC_DEPTH_BUFFER" : "",
		n.reversedDepthBuffer ? "#define USE_REVERSED_DEPTH_BUFFER" : "",
		"uniform mat4 modelMatrix;",
		"uniform mat4 modelViewMatrix;",
		"uniform mat4 projectionMatrix;",
		"uniform mat4 viewMatrix;",
		"uniform mat3 normalMatrix;",
		"uniform vec3 cameraPosition;",
		"uniform bool isOrthographic;",
		"#ifdef USE_INSTANCING",
		"	attribute mat4 instanceMatrix;",
		"#endif",
		"#ifdef USE_INSTANCING_COLOR",
		"	attribute vec3 instanceColor;",
		"#endif",
		"#ifdef USE_INSTANCING_MORPH",
		"	uniform sampler2D morphTexture;",
		"#endif",
		"attribute vec3 position;",
		"attribute vec3 normal;",
		"attribute vec2 uv;",
		"#ifdef USE_UV1",
		"	attribute vec2 uv1;",
		"#endif",
		"#ifdef USE_UV2",
		"	attribute vec2 uv2;",
		"#endif",
		"#ifdef USE_UV3",
		"	attribute vec2 uv3;",
		"#endif",
		"#ifdef USE_TANGENT",
		"	attribute vec4 tangent;",
		"#endif",
		"#if defined( USE_COLOR_ALPHA )",
		"	attribute vec4 color;",
		"#elif defined( USE_COLOR )",
		"	attribute vec3 color;",
		"#endif",
		"#ifdef USE_SKINNING",
		"	attribute vec4 skinIndex;",
		"	attribute vec4 skinWeight;",
		"#endif",
		"\n"
	].filter(zg).join("\n"), _ = [
		Yg(n),
		"#define SHADER_TYPE " + n.shaderType,
		"#define SHADER_NAME " + n.shaderName,
		m,
		n.useFog && n.fog ? "#define USE_FOG" : "",
		n.useFog && n.fogExp2 ? "#define FOG_EXP2" : "",
		n.alphaToCoverage ? "#define ALPHA_TO_COVERAGE" : "",
		n.map ? "#define USE_MAP" : "",
		n.matcap ? "#define USE_MATCAP" : "",
		n.envMap ? "#define USE_ENVMAP" : "",
		n.envMap ? "#define " + l : "",
		n.envMap ? "#define " + u : "",
		n.envMap ? "#define " + d : "",
		f ? "#define CUBEUV_TEXEL_WIDTH " + f.texelWidth : "",
		f ? "#define CUBEUV_TEXEL_HEIGHT " + f.texelHeight : "",
		f ? "#define CUBEUV_MAX_MIP " + f.maxMip + ".0" : "",
		n.lightMap ? "#define USE_LIGHTMAP" : "",
		n.aoMap ? "#define USE_AOMAP" : "",
		n.bumpMap ? "#define USE_BUMPMAP" : "",
		n.normalMap ? "#define USE_NORMALMAP" : "",
		n.normalMapObjectSpace ? "#define USE_NORMALMAP_OBJECTSPACE" : "",
		n.normalMapTangentSpace ? "#define USE_NORMALMAP_TANGENTSPACE" : "",
		n.packedNormalMap ? "#define USE_PACKED_NORMALMAP" : "",
		n.emissiveMap ? "#define USE_EMISSIVEMAP" : "",
		n.anisotropy ? "#define USE_ANISOTROPY" : "",
		n.anisotropyMap ? "#define USE_ANISOTROPYMAP" : "",
		n.clearcoat ? "#define USE_CLEARCOAT" : "",
		n.clearcoatMap ? "#define USE_CLEARCOATMAP" : "",
		n.clearcoatRoughnessMap ? "#define USE_CLEARCOAT_ROUGHNESSMAP" : "",
		n.clearcoatNormalMap ? "#define USE_CLEARCOAT_NORMALMAP" : "",
		n.dispersion ? "#define USE_DISPERSION" : "",
		n.retroreflection ? "#define USE_RETROREFLECTION" : "",
		n.iridescence ? "#define USE_IRIDESCENCE" : "",
		n.iridescenceMap ? "#define USE_IRIDESCENCEMAP" : "",
		n.iridescenceThicknessMap ? "#define USE_IRIDESCENCE_THICKNESSMAP" : "",
		n.specularMap ? "#define USE_SPECULARMAP" : "",
		n.specularColorMap ? "#define USE_SPECULAR_COLORMAP" : "",
		n.specularIntensityMap ? "#define USE_SPECULAR_INTENSITYMAP" : "",
		n.roughnessMap ? "#define USE_ROUGHNESSMAP" : "",
		n.metalnessMap ? "#define USE_METALNESSMAP" : "",
		n.alphaMap ? "#define USE_ALPHAMAP" : "",
		n.alphaTest ? "#define USE_ALPHATEST" : "",
		n.alphaHash ? "#define USE_ALPHAHASH" : "",
		n.sheen ? "#define USE_SHEEN" : "",
		n.sheenColorMap ? "#define USE_SHEEN_COLORMAP" : "",
		n.sheenRoughnessMap ? "#define USE_SHEEN_ROUGHNESSMAP" : "",
		n.transmission ? "#define USE_TRANSMISSION" : "",
		n.transmissionMap ? "#define USE_TRANSMISSIONMAP" : "",
		n.thicknessMap ? "#define USE_THICKNESSMAP" : "",
		n.vertexTangents && n.flatShading === !1 ? "#define USE_TANGENT" : "",
		n.vertexColors || n.instancingColor ? "#define USE_COLOR" : "",
		n.vertexAlphas || n.batchingColor ? "#define USE_COLOR_ALPHA" : "",
		n.vertexUv1s ? "#define USE_UV1" : "",
		n.vertexUv2s ? "#define USE_UV2" : "",
		n.vertexUv3s ? "#define USE_UV3" : "",
		n.pointsUvs ? "#define USE_POINTS_UV" : "",
		n.gradientMap ? "#define USE_GRADIENTMAP" : "",
		n.flatShading ? "#define FLAT_SHADED" : "",
		n.doubleSided ? "#define DOUBLE_SIDED" : "",
		n.flipSided ? "#define FLIP_SIDED" : "",
		n.shadowMapEnabled ? "#define USE_SHADOWMAP" : "",
		n.shadowMapEnabled ? "#define " + c : "",
		n.premultipliedAlpha ? "#define PREMULTIPLIED_ALPHA" : "",
		n.numLightProbes > 0 ? "#define USE_LIGHT_PROBES" : "",
		n.numLightProbeGrids > 0 ? "#define USE_LIGHT_PROBES_GRID" : "",
		n.decodeVideoTexture ? "#define DECODE_VIDEO_TEXTURE" : "",
		n.decodeVideoTextureEmissive ? "#define DECODE_VIDEO_TEXTURE_EMISSIVE" : "",
		n.logarithmicDepthBuffer ? "#define USE_LOGARITHMIC_DEPTH_BUFFER" : "",
		n.reversedDepthBuffer ? "#define USE_REVERSED_DEPTH_BUFFER" : "",
		"uniform mat4 viewMatrix;",
		"uniform vec3 cameraPosition;",
		"uniform bool isOrthographic;",
		n.toneMapping === 0 ? "" : "#define TONE_MAPPING",
		n.toneMapping === 0 ? "" : Q.tonemapping_pars_fragment,
		n.toneMapping === 0 ? "" : Ng("toneMapping", n.toneMapping),
		n.dithering ? "#define DITHERING" : "",
		n.opaque ? "#define OPAQUE" : "",
		Q.colorspace_pars_fragment,
		jg("linearToOutputTexel", n.outputColorSpace),
		Fg(),
		n.useDepthPacking ? "#define DEPTH_PACKING " + n.depthPacking : "",
		"\n"
	].filter(zg).join("\n")), o = Ug(o), o = Bg(o, n), o = Vg(o, n), s = Ug(s), s = Bg(s, n), s = Vg(s, n), o = qg(o), s = qg(s), n.isRawShaderMaterial !== !0 && (v = "#version 300 es\n", g = [
		p,
		"#define attribute in",
		"#define varying out",
		"#define texture2D texture"
	].join("\n") + "\n" + g, _ = [
		"#define varying in",
		n.glslVersion === "300 es" ? "" : "layout(location = 0) out highp vec4 pc_fragColor;",
		n.glslVersion === "300 es" ? "" : "#define gl_FragColor pc_fragColor",
		"#define gl_FragDepthEXT gl_FragDepth",
		"#define texture2D texture",
		"#define textureCube texture",
		"#define texture2DProj textureProj",
		"#define texture2DLodEXT textureLod",
		"#define texture2DProjLodEXT textureProjLod",
		"#define textureCubeLodEXT textureLod",
		"#define texture2DGradEXT textureGrad",
		"#define texture2DProjGradEXT textureProjGrad",
		"#define textureCubeGradEXT textureGrad"
	].join("\n") + "\n" + _);
	let y = v + g + o, b = v + _ + s, x = wg(i, i.VERTEX_SHADER, y), S = wg(i, i.FRAGMENT_SHADER, b);
	i.attachShader(h, x), i.attachShader(h, S), n.index0AttributeName === void 0 ? n.hasPositionAttribute === !0 && i.bindAttribLocation(h, 0, "position") : i.bindAttribLocation(h, 0, n.index0AttributeName), i.linkProgram(h);
	function C(t) {
		if (e.debug.checkShaderErrors) {
			let n = i.getProgramInfoLog(h) || "", r = i.getShaderInfoLog(x) || "", a = i.getShaderInfoLog(S) || "", o = n.trim(), s = r.trim(), c = a.trim(), l = !0, u = !0;
			if (i.getProgramParameter(h, i.LINK_STATUS) === !1) {
				if (l = !1, typeof e.debug.onShaderError == "function") e.debug.onShaderError(i, h, x, S);
				else {
					let e = Ag(i, x, "vertex"), n = Ag(i, S, "fragment");
					G("WebGLProgram: Shader Error " + i.getError() + " - VALIDATE_STATUS " + i.getProgramParameter(h, i.VALIDATE_STATUS) + "\n\nMaterial Name: " + t.name + "\nMaterial Type: " + t.type + "\n\nProgram Info Log: " + o + "\n" + e + "\n" + n);
				}
			} else o === "" ? (s === "" || c === "") && (u = !1) : W("WebGLProgram: Program Info Log:", o);
			u && (t.diagnostics = {
				runnable: l,
				programLog: o,
				vertexShader: {
					log: s,
					prefix: g
				},
				fragmentShader: {
					log: c,
					prefix: _
				}
			});
		}
		i.deleteShader(x), i.deleteShader(S), w = new Cg(i, h), T = Rg(i, h);
	}
	let w;
	this.getUniforms = function() {
		return w === void 0 && C(this), w;
	};
	let T;
	this.getAttributes = function() {
		return T === void 0 && C(this), T;
	};
	let E = n.rendererExtensionParallelShaderCompile === !1;
	return this.isReady = function() {
		return E === !1 && (E = i.getProgramParameter(h, Tg)), E;
	}, this.destroy = function() {
		r.releaseStatesOfProgram(this), i.deleteProgram(h), this.program = void 0;
	}, this.type = n.shaderType, this.name = n.shaderName, this.id = Eg++, this.cacheKey = t, this.usedTimes = 1, this.program = h, this.vertexShader = x, this.fragmentShader = S, this;
}
var o_ = 0, s_ = class {
	constructor() {
		this.shaderCache = /* @__PURE__ */ new Map(), this.materialCache = /* @__PURE__ */ new Map();
	}
	update(e, t, n) {
		let r = this._getShaderCacheForMaterial(e);
		return r.has(t) === !1 && (r.add(t), t.usedTimes++), r.has(n) === !1 && (r.add(n), n.usedTimes++), this;
	}
	remove(e) {
		let t = this.materialCache.get(e);
		for (let e of t) e.usedTimes--, e.usedTimes === 0 && this.shaderCache.delete(e.code);
		return this.materialCache.delete(e), this;
	}
	getVertexShaderStage(e) {
		return this._getShaderStage(e.vertexShader);
	}
	getFragmentShaderStage(e) {
		return this._getShaderStage(e.fragmentShader);
	}
	dispose() {
		this.shaderCache.clear(), this.materialCache.clear();
	}
	_getShaderCacheForMaterial(e) {
		let t = this.materialCache, n = t.get(e);
		return n === void 0 && (n = /* @__PURE__ */ new Set(), t.set(e, n)), n;
	}
	_getShaderStage(e) {
		let t = this.shaderCache, n = t.get(e);
		return n === void 0 && (n = new c_(e), t.set(e, n)), n;
	}
}, c_ = class {
	constructor(e) {
		this.id = o_++, this.code = e, this.usedTimes = 0;
	}
};
function l_(e) {
	return e === 1030 || e === 37490 || e === 36285;
}
function u_(e, t, n, r, i, a) {
	let o = new dl(), s = new s_(), c = /* @__PURE__ */ new Set(), l = [], u = /* @__PURE__ */ new Map(), d = r.logarithmicDepthBuffer, f = r.precision, p = {
		MeshDepthMaterial: "depth",
		MeshDistanceMaterial: "distance",
		MeshNormalMaterial: "normal",
		MeshBasicMaterial: "basic",
		MeshLambertMaterial: "lambert",
		MeshPhongMaterial: "phong",
		MeshToonMaterial: "toon",
		MeshStandardMaterial: "physical",
		MeshPhysicalMaterial: "physical",
		MeshMatcapMaterial: "matcap",
		LineBasicMaterial: "basic",
		LineDashedMaterial: "dashed",
		PointsMaterial: "points",
		ShadowMaterial: "shadow",
		SpriteMaterial: "sprite"
	};
	function m(e) {
		return c.add(e), e === 0 ? "uv" : `uv${e}`;
	}
	function h(i, o, l, u, h, g) {
		let _ = u.fog, v = h.geometry, y = i.isMeshStandardMaterial || i.isMeshLambertMaterial || i.isMeshPhongMaterial ? u.environment : null, b = i.isMeshStandardMaterial || i.isMeshLambertMaterial && !i.envMap || i.isMeshPhongMaterial && !i.envMap, x = t.get(i.envMap || y, b), S = x && x.mapping === 306 ? x.image.height : null, C = p[i.type];
		i.precision !== null && (f = r.getMaxPrecision(i.precision), f !== i.precision && W("WebGLProgram.getParameters:", i.precision, "not supported, using", f, "instead."));
		let w = v.morphAttributes.position || v.morphAttributes.normal || v.morphAttributes.color, T = w === void 0 ? 0 : w.length, E = 0;
		v.morphAttributes.position !== void 0 && (E = 1), v.morphAttributes.normal !== void 0 && (E = 2), v.morphAttributes.color !== void 0 && (E = 3);
		let D, O, k, A;
		if (C) {
			let e = jm[C];
			D = e.vertexShader, O = e.fragmentShader;
		} else {
			D = i.vertexShader, O = i.fragmentShader;
			let e = s.getVertexShaderStage(i), t = s.getFragmentShaderStage(i);
			s.update(i, e, t), k = e.id, A = t.id;
		}
		let j = e.getRenderTarget(), ee = e.state.buffers.depth.getReversed(), M = h.isInstancedMesh === !0, te = h.isBatchedMesh === !0, ne = !!i.map, N = !!i.matcap, re = !!x, ie = !!i.aoMap, ae = !!i.lightMap, oe = !!i.bumpMap && i.wireframe === !1, P = !!i.normalMap, F = !!i.displacementMap, I = !!i.emissiveMap, se = !!i.metalnessMap, ce = !!i.roughnessMap, le = i.anisotropy > 0, ue = i.clearcoat > 0, de = i.dispersion > 0, fe = i.retroreflectivity > 0, pe = i.iridescence > 0, me = i.sheen > 0, he = i.transmission > 0, ge = le && !!i.anisotropyMap, _e = ue && !!i.clearcoatMap, ve = ue && !!i.clearcoatNormalMap, ye = ue && !!i.clearcoatRoughnessMap, be = pe && !!i.iridescenceMap, L = pe && !!i.iridescenceThicknessMap, xe = me && !!i.sheenColorMap, Se = me && !!i.sheenRoughnessMap, Ce = !!i.specularMap, R = !!i.specularColorMap, we = !!i.specularIntensityMap, z = he && !!i.transmissionMap, B = he && !!i.thicknessMap, Te = !!i.gradientMap, Ee = !!i.alphaMap, De = i.alphaTest > 0, Oe = !!i.alphaHash, ke = !!i.extensions, Ae = 0;
		i.toneMapped && (j === null || j.isXRRenderTarget === !0) && (Ae = e.toneMapping);
		let je = {
			shaderID: C,
			shaderType: i.type,
			shaderName: i.name,
			vertexShader: D,
			fragmentShader: O,
			defines: i.defines,
			customVertexShaderID: k,
			customFragmentShaderID: A,
			isRawShaderMaterial: i.isRawShaderMaterial === !0,
			glslVersion: i.glslVersion,
			precision: f,
			batching: te,
			batchingColor: te && h._colorsTexture !== null,
			instancing: M,
			instancingColor: M && h.instanceColor !== null,
			instancingMorph: M && h.morphTexture !== null,
			outputColorSpace: j === null ? e.outputColorSpace : j.isXRRenderTarget === !0 ? j.texture.colorSpace : X.workingColorSpace,
			alphaToCoverage: !!i.alphaToCoverage,
			map: ne,
			matcap: N,
			envMap: re,
			envMapMode: re && x.mapping,
			envMapCubeUVHeight: S,
			aoMap: ie,
			lightMap: ae,
			bumpMap: oe,
			normalMap: P,
			displacementMap: F,
			emissiveMap: I,
			normalMapObjectSpace: P && i.normalMapType === 1,
			normalMapTangentSpace: P && i.normalMapType === 0,
			packedNormalMap: P && i.normalMapType === 0 && l_(i.normalMap.format),
			metalnessMap: se,
			roughnessMap: ce,
			anisotropy: le,
			anisotropyMap: ge,
			clearcoat: ue,
			clearcoatMap: _e,
			clearcoatNormalMap: ve,
			clearcoatRoughnessMap: ye,
			dispersion: de,
			retroreflection: fe,
			iridescence: pe,
			iridescenceMap: be,
			iridescenceThicknessMap: L,
			sheen: me,
			sheenColorMap: xe,
			sheenRoughnessMap: Se,
			specularMap: Ce,
			specularColorMap: R,
			specularIntensityMap: we,
			transmission: he,
			transmissionMap: z,
			thicknessMap: B,
			gradientMap: Te,
			opaque: i.transparent === !1 && i.blending === 1 && i.alphaToCoverage === !1,
			alphaMap: Ee,
			alphaTest: De,
			alphaHash: Oe,
			combine: i.combine,
			mapUv: ne && m(i.map.channel),
			aoMapUv: ie && m(i.aoMap.channel),
			lightMapUv: ae && m(i.lightMap.channel),
			bumpMapUv: oe && m(i.bumpMap.channel),
			normalMapUv: P && m(i.normalMap.channel),
			displacementMapUv: F && m(i.displacementMap.channel),
			emissiveMapUv: I && m(i.emissiveMap.channel),
			metalnessMapUv: se && m(i.metalnessMap.channel),
			roughnessMapUv: ce && m(i.roughnessMap.channel),
			anisotropyMapUv: ge && m(i.anisotropyMap.channel),
			clearcoatMapUv: _e && m(i.clearcoatMap.channel),
			clearcoatNormalMapUv: ve && m(i.clearcoatNormalMap.channel),
			clearcoatRoughnessMapUv: ye && m(i.clearcoatRoughnessMap.channel),
			iridescenceMapUv: be && m(i.iridescenceMap.channel),
			iridescenceThicknessMapUv: L && m(i.iridescenceThicknessMap.channel),
			sheenColorMapUv: xe && m(i.sheenColorMap.channel),
			sheenRoughnessMapUv: Se && m(i.sheenRoughnessMap.channel),
			specularMapUv: Ce && m(i.specularMap.channel),
			specularColorMapUv: R && m(i.specularColorMap.channel),
			specularIntensityMapUv: we && m(i.specularIntensityMap.channel),
			transmissionMapUv: z && m(i.transmissionMap.channel),
			thicknessMapUv: B && m(i.thicknessMap.channel),
			alphaMapUv: Ee && m(i.alphaMap.channel),
			vertexTangents: !!v.attributes.tangent && (P || le),
			vertexNormals: !!v.attributes.normal,
			vertexColors: i.vertexColors,
			vertexAlphas: i.vertexColors === !0 && !!v.attributes.color && v.attributes.color.itemSize === 4,
			pointsUvs: h.isPoints === !0 && !!v.attributes.uv && (ne || Ee),
			fog: !!_,
			useFog: i.fog === !0,
			fogExp2: !!_ && _.isFogExp2,
			flatShading: i.wireframe === !1 && (i.flatShading === !0 || v.attributes.normal === void 0 && P === !1 && (i.isMeshLambertMaterial || i.isMeshPhongMaterial || i.isMeshStandardMaterial || i.isMeshPhysicalMaterial)),
			sizeAttenuation: i.sizeAttenuation === !0,
			logarithmicDepthBuffer: d,
			reversedDepthBuffer: ee,
			skinning: h.isSkinnedMesh === !0,
			hasPositionAttribute: v.attributes.position !== void 0,
			morphTargets: v.morphAttributes.position !== void 0,
			morphNormals: v.morphAttributes.normal !== void 0,
			morphColors: v.morphAttributes.color !== void 0,
			morphTargetsCount: T,
			morphTextureStride: E,
			numSunLights: o.sun.length,
			numDirLights: o.directional.length,
			numPointLights: o.point.length,
			numSpotLights: o.spot.length,
			numSpotLightMaps: o.spotLightMap.length,
			numRectAreaLights: o.rectArea.length,
			numHemiLights: o.hemi.length,
			numSunLightShadows: o.sunShadowMap.length,
			numDirLightShadows: o.directionalShadowMap.length,
			numPointLightShadows: o.pointShadowMap.length,
			numSpotLightShadows: o.spotShadowMap.length,
			numSpotLightShadowsWithMaps: o.numSpotLightShadowsWithMaps,
			numLightProbes: o.numLightProbes,
			numLightProbeGrids: g.length,
			numClippingPlanes: a.numPlanes,
			numClipIntersection: a.numIntersection,
			dithering: i.dithering,
			shadowMapEnabled: e.shadowMap.enabled && l.length > 0,
			shadowMapType: e.shadowMap.type,
			toneMapping: Ae,
			decodeVideoTexture: ne && i.map.isVideoTexture === !0 && X.getTransfer(i.map.colorSpace) === "srgb",
			decodeVideoTextureEmissive: I && i.emissiveMap.isVideoTexture === !0 && X.getTransfer(i.emissiveMap.colorSpace) === "srgb",
			premultipliedAlpha: i.premultipliedAlpha,
			doubleSided: i.side === 2,
			flipSided: i.side === 1,
			useDepthPacking: i.depthPacking >= 0,
			depthPacking: i.depthPacking || 0,
			index0AttributeName: i.index0AttributeName,
			extensionClipCullDistance: ke && i.extensions.clipCullDistance === !0 && n.has("WEBGL_clip_cull_distance"),
			extensionMultiDraw: (ke && i.extensions.multiDraw === !0 || te) && n.has("WEBGL_multi_draw"),
			rendererExtensionParallelShaderCompile: n.has("KHR_parallel_shader_compile"),
			customProgramCacheKey: i.customProgramCacheKey()
		};
		return je.vertexUv1s = c.has(1), je.vertexUv2s = c.has(2), je.vertexUv3s = c.has(3), c.clear(), je;
	}
	function g(t) {
		let n = [];
		if (t.shaderID ? n.push(t.shaderID) : (n.push(t.customVertexShaderID), n.push(t.customFragmentShaderID)), t.defines !== void 0) for (let e in t.defines) n.push(e), n.push(t.defines[e]);
		return t.isRawShaderMaterial === !1 && (_(n, t), v(n, t), n.push(e.outputColorSpace)), n.push(t.customProgramCacheKey), n.join();
	}
	function _(e, t) {
		e.push(t.precision), e.push(t.outputColorSpace), e.push(t.envMapMode), e.push(t.envMapCubeUVHeight), e.push(t.mapUv), e.push(t.alphaMapUv), e.push(t.lightMapUv), e.push(t.aoMapUv), e.push(t.bumpMapUv), e.push(t.normalMapUv), e.push(t.displacementMapUv), e.push(t.emissiveMapUv), e.push(t.metalnessMapUv), e.push(t.roughnessMapUv), e.push(t.anisotropyMapUv), e.push(t.clearcoatMapUv), e.push(t.clearcoatNormalMapUv), e.push(t.clearcoatRoughnessMapUv), e.push(t.iridescenceMapUv), e.push(t.iridescenceThicknessMapUv), e.push(t.sheenColorMapUv), e.push(t.sheenRoughnessMapUv), e.push(t.specularMapUv), e.push(t.specularColorMapUv), e.push(t.specularIntensityMapUv), e.push(t.transmissionMapUv), e.push(t.thicknessMapUv), e.push(t.combine), e.push(t.fogExp2), e.push(t.sizeAttenuation), e.push(t.morphTargetsCount), e.push(t.morphAttributeCount), e.push(t.numSunLights), e.push(t.numDirLights), e.push(t.numPointLights), e.push(t.numSpotLights), e.push(t.numSpotLightMaps), e.push(t.numHemiLights), e.push(t.numRectAreaLights), e.push(t.numSunLightShadows), e.push(t.numDirLightShadows), e.push(t.numPointLightShadows), e.push(t.numSpotLightShadows), e.push(t.numSpotLightShadowsWithMaps), e.push(t.numLightProbes), e.push(t.shadowMapType), e.push(t.toneMapping), e.push(t.numClippingPlanes), e.push(t.numClipIntersection), e.push(t.depthPacking);
	}
	function v(e, t) {
		o.disableAll(), t.instancing && o.enable(0), t.instancingColor && o.enable(1), t.instancingMorph && o.enable(2), t.matcap && o.enable(3), t.envMap && o.enable(4), t.normalMapObjectSpace && o.enable(5), t.normalMapTangentSpace && o.enable(6), t.clearcoat && o.enable(7), t.iridescence && o.enable(8), t.alphaTest && o.enable(9), t.vertexColors && o.enable(10), t.vertexAlphas && o.enable(11), t.vertexUv1s && o.enable(12), t.vertexUv2s && o.enable(13), t.vertexUv3s && o.enable(14), t.vertexTangents && o.enable(15), t.anisotropy && o.enable(16), t.alphaHash && o.enable(17), t.batching && o.enable(18), t.dispersion && o.enable(19), t.retroreflection && o.enable(24), t.batchingColor && o.enable(20), t.gradientMap && o.enable(21), t.packedNormalMap && o.enable(22), t.vertexNormals && o.enable(23), e.push(o.mask), o.disableAll(), t.fog && o.enable(0), t.useFog && o.enable(1), t.flatShading && o.enable(2), t.logarithmicDepthBuffer && o.enable(3), t.reversedDepthBuffer && o.enable(4), t.skinning && o.enable(5), t.morphTargets && o.enable(6), t.morphNormals && o.enable(7), t.morphColors && o.enable(8), t.premultipliedAlpha && o.enable(9), t.shadowMapEnabled && o.enable(10), t.doubleSided && o.enable(11), t.flipSided && o.enable(12), t.useDepthPacking && o.enable(13), t.dithering && o.enable(14), t.transmission && o.enable(15), t.sheen && o.enable(16), t.opaque && o.enable(17), t.pointsUvs && o.enable(18), t.decodeVideoTexture && o.enable(19), t.decodeVideoTextureEmissive && o.enable(20), t.alphaToCoverage && o.enable(21), t.numLightProbeGrids > 0 && o.enable(22), t.hasPositionAttribute && o.enable(23), e.push(o.mask);
	}
	function y(e) {
		let t = p[e.type], n;
		if (t) {
			let e = jm[t];
			n = _p.clone(e.uniforms);
		} else n = e.uniforms;
		return n;
	}
	function b(t, n) {
		let r = u.get(n);
		return r === void 0 ? (r = new a_(e, n, t, i), l.push(r), u.set(n, r)) : ++r.usedTimes, r;
	}
	function x(e) {
		if (--e.usedTimes === 0) {
			let t = l.indexOf(e);
			l[t] = l[l.length - 1], l.pop(), u.delete(e.cacheKey), e.destroy();
		}
	}
	function S(e) {
		s.remove(e);
	}
	function C() {
		s.dispose();
	}
	return {
		getParameters: h,
		getProgramCacheKey: g,
		getUniforms: y,
		acquireProgram: b,
		releaseProgram: x,
		releaseShaderCache: S,
		programs: l,
		dispose: C
	};
}
function d_() {
	let e = /* @__PURE__ */ new WeakMap();
	function t(t) {
		return e.has(t);
	}
	function n(t) {
		let n = e.get(t);
		return n === void 0 && (n = {}, e.set(t, n)), n;
	}
	function r(t) {
		e.delete(t);
	}
	function i(t, n, r) {
		e.get(t)[n] = r;
	}
	function a() {
		e = /* @__PURE__ */ new WeakMap();
	}
	return {
		has: t,
		get: n,
		remove: r,
		update: i,
		dispose: a
	};
}
function f_(e, t) {
	return e.groupOrder === t.groupOrder ? e.renderOrder === t.renderOrder ? e.material.id === t.material.id ? e.materialVariant === t.materialVariant ? e.z === t.z ? e.id - t.id : e.z - t.z : e.materialVariant - t.materialVariant : e.material.id - t.material.id : e.renderOrder - t.renderOrder : e.groupOrder - t.groupOrder;
}
function p_(e, t) {
	return e.groupOrder === t.groupOrder ? e.renderOrder === t.renderOrder ? e.z === t.z ? e.id - t.id : t.z - e.z : e.renderOrder - t.renderOrder : e.groupOrder - t.groupOrder;
}
function m_() {
	let e = [], t = 0, n = [], r = [], i = [];
	function a() {
		t = 0, n.length = 0, r.length = 0, i.length = 0;
	}
	function o(e) {
		let t = 0;
		return e.isInstancedMesh && (t += 2), e.isSkinnedMesh && (t += 1), t;
	}
	function s(n, r, i, a, s, c) {
		let l = e[t];
		return l === void 0 ? (l = {
			id: n.id,
			object: n,
			geometry: r,
			material: i,
			materialVariant: o(n),
			groupOrder: a,
			renderOrder: n.renderOrder,
			z: s,
			group: c
		}, e[t] = l) : (l.id = n.id, l.object = n, l.geometry = r, l.material = i, l.materialVariant = o(n), l.groupOrder = a, l.renderOrder = n.renderOrder, l.z = s, l.group = c), t++, l;
	}
	function c(e, t, a, o, c, l, u) {
		u.reversedDepth === !0 && (c = -c);
		let d = s(e, t, a, o, c, l);
		a.transmission > 0 ? r.push(d) : a.transparent === !0 ? i.push(d) : n.push(d);
	}
	function l(e, t, a, o, c, l) {
		let u = s(e, t, a, o, c, l);
		a.transmission > 0 ? r.unshift(u) : a.transparent === !0 ? i.unshift(u) : n.unshift(u);
	}
	function u(e, t) {
		n.length > 1 && n.sort(e || f_), r.length > 1 && r.sort(t || p_), i.length > 1 && i.sort(t || p_);
	}
	function d() {
		for (let n = t, r = e.length; n < r; n++) {
			let t = e[n];
			if (t.id === null) break;
			t.id = null, t.object = null, t.geometry = null, t.material = null, t.group = null;
		}
	}
	return {
		opaque: n,
		transmissive: r,
		transparent: i,
		init: a,
		push: c,
		unshift: l,
		finish: d,
		sort: u
	};
}
function h_() {
	let e = /* @__PURE__ */ new WeakMap();
	function t(t, n) {
		let r = e.get(t), i;
		return r === void 0 ? (i = new m_(), e.set(t, [i])) : n >= r.length ? (i = new m_(), r.push(i)) : i = r[n], i;
	}
	function n() {
		e = /* @__PURE__ */ new WeakMap();
	}
	return {
		get: t,
		dispose: n
	};
}
function g_() {
	let e = {};
	return { get: function(t) {
		if (e[t.id] !== void 0) return e[t.id];
		let n;
		switch (t.type) {
			case "SunLight":
			case "DirectionalLight":
				n = {
					direction: new J(),
					color: new Z()
				};
				break;
			case "SpotLight":
				n = {
					position: new J(),
					direction: new J(),
					color: new Z(),
					distance: 0,
					coneCos: 0,
					penumbraCos: 0,
					decay: 0
				};
				break;
			case "PointLight":
				n = {
					position: new J(),
					color: new Z(),
					distance: 0,
					decay: 0
				};
				break;
			case "HemisphereLight":
				n = {
					direction: new J(),
					skyColor: new Z(),
					groundColor: new Z()
				};
				break;
			case "RectAreaLight": n = {
				color: new Z(),
				position: new J(),
				halfWidth: new J(),
				halfHeight: new J()
			};
		}
		return e[t.id] = n, n;
	} };
}
function __() {
	let e = {};
	return { get: function(t) {
		if (e[t.id] !== void 0) return e[t.id];
		let n;
		switch (t.type) {
			case "SunLight":
			case "DirectionalLight":
				n = {
					shadowIntensity: 1,
					shadowBias: 0,
					shadowNormalBias: 0,
					shadowRadius: 1,
					shadowMapSize: new q()
				};
				break;
			case "SpotLight":
				n = {
					shadowIntensity: 1,
					shadowBias: 0,
					shadowNormalBias: 0,
					shadowRadius: 1,
					shadowMapSize: new q()
				};
				break;
			case "PointLight": n = {
				shadowIntensity: 1,
				shadowBias: 0,
				shadowNormalBias: 0,
				shadowRadius: 1,
				shadowMapSize: new q(),
				shadowCameraNear: 1,
				shadowCameraFar: 1e3
			};
		}
		return e[t.id] = n, n;
	} };
}
var v_ = 0;
function y_(e, t) {
	return (t.castShadow ? 2 : 0) - (e.castShadow ? 2 : 0) + +!!t.map - !!e.map;
}
function b_(e) {
	let t = new g_(), n = __(), r = {
		version: 0,
		hash: {
			sunLength: -1,
			directionalLength: -1,
			pointLength: -1,
			spotLength: -1,
			rectAreaLength: -1,
			hemiLength: -1,
			numSunShadows: -1,
			numDirectionalShadows: -1,
			numPointShadows: -1,
			numSpotShadows: -1,
			numSpotMaps: -1,
			numLightProbes: -1
		},
		ambient: [
			0,
			0,
			0
		],
		probe: [],
		sun: [],
		sunShadow: [],
		sunShadowMap: [],
		sunShadowMatrix: [],
		sunShadowCascade: [],
		directional: [],
		directionalShadow: [],
		directionalShadowMap: [],
		directionalShadowMatrix: [],
		spot: [],
		spotLightMap: [],
		spotShadow: [],
		spotShadowMap: [],
		spotLightMatrix: [],
		rectArea: [],
		rectAreaLTC1: null,
		rectAreaLTC2: null,
		point: [],
		pointShadow: [],
		pointShadowMap: [],
		pointShadowMatrix: [],
		hemi: [],
		numSpotLightShadowsWithMaps: 0,
		numLightProbes: 0
	};
	for (let e = 0; e < 9; e++) r.probe.push(new J());
	let i = new J(), a = new el(), o = new el();
	function s(i) {
		let a = 0, o = 0, s = 0;
		for (let e = 0; e < 9; e++) r.probe[e].set(0, 0, 0);
		let c = 0, l = 0, u = 0, d = 0, f = 0, p = 0, m = 0, h = 0, g = 0, _ = 0, v = 0, y = 0, b = 0, x = 0;
		i.sort(y_);
		for (let e = 0, S = i.length; e < S; e++) {
			let S = i[e], C = S.color, w = S.intensity, T = S.distance, E = null;
			if (S.shadow && S.shadow.map && (E = S.shadow.map.texture.format === 1030 ? S.shadow.map.texture : S.shadow.map.depthTexture || S.shadow.map.texture), S.isAmbientLight) a += C.r * w, o += C.g * w, s += C.b * w;
			else if (S.isLightProbe) {
				for (let e = 0; e < 9; e++) r.probe[e].addScaledVector(S.sh.coefficients[e], w);
				x++;
			} else if (S.isSunLight) {
				let e = t.get(S);
				if (e.color.copy(S.color).multiplyScalar(S.intensity), S.castShadow) {
					let e = S.shadow, t = n.get(S);
					t.shadowIntensity = e.intensity, t.shadowBias = e.bias, t.shadowNormalBias = e.normalBias, t.shadowRadius = e.radius, t.shadowMapSize.copy(e.mapSize).multiply(e.getFrameExtents()), r.sunShadow[l] = t, r.sunShadowMap[l] = E;
					let i = e.getViewportCount();
					for (let t = 0; t < i; t++) r.sunShadowMatrix[u + t] = e.getMatrix(t), r.sunShadowCascade[u + t] = e._cascadeData[t];
					u += i, l++;
				}
				r.sun[c] = e, c++;
			} else if (S.isDirectionalLight) {
				let e = t.get(S);
				if (e.color.copy(S.color).multiplyScalar(S.intensity), S.castShadow) {
					let e = S.shadow, t = n.get(S);
					t.shadowIntensity = e.intensity, t.shadowBias = e.bias, t.shadowNormalBias = e.normalBias, t.shadowRadius = e.radius, t.shadowMapSize = e.mapSize, r.directionalShadow[d] = t, r.directionalShadowMap[d] = E, r.directionalShadowMatrix[d] = S.shadow.matrix, g++;
				}
				r.directional[d] = e, d++;
			} else if (S.isSpotLight) {
				let e = t.get(S);
				e.position.setFromMatrixPosition(S.matrixWorld), e.color.copy(C).multiplyScalar(w), e.distance = T, e.coneCos = Math.cos(S.angle), e.penumbraCos = Math.cos(S.angle * (1 - S.penumbra)), e.decay = S.decay, r.spot[p] = e;
				let i = S.shadow;
				if (S.map && (r.spotLightMap[y] = S.map, y++, i.updateMatrices(S), S.castShadow && b++), r.spotLightMatrix[p] = i.matrix, S.castShadow) {
					let e = n.get(S);
					e.shadowIntensity = i.intensity, e.shadowBias = i.bias, e.shadowNormalBias = i.normalBias, e.shadowRadius = i.radius, e.shadowMapSize = i.mapSize, r.spotShadow[p] = e, r.spotShadowMap[p] = E, v++;
				}
				p++;
			} else if (S.isRectAreaLight) {
				let e = t.get(S);
				e.color.copy(C).multiplyScalar(w), e.halfWidth.set(S.width * .5, 0, 0), e.halfHeight.set(0, S.height * .5, 0), r.rectArea[m] = e, m++;
			} else if (S.isPointLight) {
				let e = t.get(S);
				if (e.color.copy(S.color).multiplyScalar(S.intensity), e.distance = S.distance, e.decay = S.decay, S.castShadow) {
					let e = S.shadow, t = n.get(S);
					t.shadowIntensity = e.intensity, t.shadowBias = e.bias, t.shadowNormalBias = e.normalBias, t.shadowRadius = e.radius, t.shadowMapSize = e.mapSize, t.shadowCameraNear = e.camera.near, t.shadowCameraFar = e.camera.far, r.pointShadow[f] = t, r.pointShadowMap[f] = E, r.pointShadowMatrix[f] = S.shadow.matrix, _++;
				}
				r.point[f] = e, f++;
			} else if (S.isHemisphereLight) {
				let e = t.get(S);
				e.skyColor.copy(S.color).multiplyScalar(w), e.groundColor.copy(S.groundColor).multiplyScalar(w), r.hemi[h] = e, h++;
			}
		}
		m > 0 && (e.has("OES_texture_float_linear") === !0 ? (r.rectAreaLTC1 = $.LTC_FLOAT_1, r.rectAreaLTC2 = $.LTC_FLOAT_2) : (r.rectAreaLTC1 = $.LTC_HALF_1, r.rectAreaLTC2 = $.LTC_HALF_2)), r.ambient[0] = a, r.ambient[1] = o, r.ambient[2] = s;
		let S = r.hash;
		(S.sunLength !== c || S.directionalLength !== d || S.pointLength !== f || S.spotLength !== p || S.rectAreaLength !== m || S.hemiLength !== h || S.numSunShadows !== l || S.numDirectionalShadows !== g || S.numPointShadows !== _ || S.numSpotShadows !== v || S.numSpotMaps !== y || S.numLightProbes !== x) && (r.sun.length = c, r.directional.length = d, r.spot.length = p, r.rectArea.length = m, r.point.length = f, r.hemi.length = h, r.sunShadow.length = l, r.sunShadowMap.length = l, r.sunShadowMatrix.length = u, r.sunShadowCascade.length = u, r.directionalShadow.length = g, r.directionalShadowMap.length = g, r.directionalShadowMatrix.length = g, r.pointShadow.length = _, r.pointShadowMap.length = _, r.pointShadowMatrix.length = _, r.spotShadow.length = v, r.spotShadowMap.length = v, r.spotLightMatrix.length = v + y - b, r.spotLightMap.length = y, r.numSpotLightShadowsWithMaps = b, r.numLightProbes = x, S.sunLength = c, S.directionalLength = d, S.pointLength = f, S.spotLength = p, S.rectAreaLength = m, S.hemiLength = h, S.numSunShadows = l, S.numDirectionalShadows = g, S.numPointShadows = _, S.numSpotShadows = v, S.numSpotMaps = y, S.numLightProbes = x, r.version = v_++);
	}
	function c(e, t) {
		let n = 0, s = 0, c = 0, l = 0, u = 0, d = 0, f = t.matrixWorldInverse;
		for (let t = 0, p = e.length; t < p; t++) {
			let p = e[t];
			if (p.isSunLight) {
				let e = r.sun[n];
				e.direction.setFromMatrixPosition(p.matrixWorld), e.direction.transformDirection(f), n++;
			} else if (p.isDirectionalLight) {
				let e = r.directional[s];
				e.direction.setFromMatrixPosition(p.matrixWorld), i.setFromMatrixPosition(p.target.matrixWorld), e.direction.sub(i), e.direction.transformDirection(f), s++;
			} else if (p.isSpotLight) {
				let e = r.spot[l];
				e.position.setFromMatrixPosition(p.matrixWorld), e.position.applyMatrix4(f), e.direction.setFromMatrixPosition(p.matrixWorld), i.setFromMatrixPosition(p.target.matrixWorld), e.direction.sub(i), e.direction.transformDirection(f), l++;
			} else if (p.isRectAreaLight) {
				let e = r.rectArea[u];
				e.position.setFromMatrixPosition(p.matrixWorld), e.position.applyMatrix4(f), o.identity(), a.copy(p.matrixWorld), a.premultiply(f), o.extractRotation(a), e.halfWidth.set(p.width * .5, 0, 0), e.halfHeight.set(0, p.height * .5, 0), e.halfWidth.applyMatrix4(o), e.halfHeight.applyMatrix4(o), u++;
			} else if (p.isPointLight) {
				let e = r.point[c];
				e.position.setFromMatrixPosition(p.matrixWorld), e.position.applyMatrix4(f), c++;
			} else if (p.isHemisphereLight) {
				let e = r.hemi[d];
				e.direction.setFromMatrixPosition(p.matrixWorld), e.direction.transformDirection(f), d++;
			}
		}
	}
	return {
		setup: s,
		setupView: c,
		state: r
	};
}
function x_(e) {
	let t = new b_(e), n = [], r = [], i = [];
	function a(e) {
		d.camera = e, n.length = 0, r.length = 0, i.length = 0;
	}
	function o(e) {
		n.push(e);
	}
	function s(e) {
		r.push(e);
	}
	function c(e) {
		i.push(e);
	}
	function l() {
		t.setup(n);
	}
	function u(e) {
		t.setupView(n, e);
	}
	let d = {
		lightsArray: n,
		shadowsArray: r,
		lightProbeGridArray: i,
		camera: null,
		lights: t,
		transmissionRenderTarget: {},
		textureUnits: 0
	};
	return {
		init: a,
		state: d,
		setupLights: l,
		setupLightsView: u,
		pushLight: o,
		pushShadow: s,
		pushLightProbeGrid: c
	};
}
function S_(e) {
	let t = /* @__PURE__ */ new WeakMap();
	function n(n, r = 0) {
		let i = t.get(n), a;
		return i === void 0 ? (a = new x_(e), t.set(n, [a])) : r >= i.length ? (a = new x_(e), i.push(a)) : a = i[r], a;
	}
	function r() {
		t = /* @__PURE__ */ new WeakMap();
	}
	return {
		get: n,
		dispose: r
	};
}
var C_ = "void main() {\n	gl_Position = vec4( position, 1.0 );\n}", w_ = "uniform sampler2D shadow_pass;\nuniform vec2 resolution;\nuniform float radius;\nvoid main() {\n	const float samples = float( VSM_SAMPLES );\n	float mean = 0.0;\n	float squared_mean = 0.0;\n	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );\n	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;\n	for ( float i = 0.0; i < samples; i ++ ) {\n		float uvOffset = uvStart + i * uvStride;\n		#ifdef HORIZONTAL_PASS\n			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;\n			mean += distribution.x;\n			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;\n		#else\n			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;\n			mean += depth;\n			squared_mean += depth * depth;\n		#endif\n	}\n	mean = mean / samples;\n	squared_mean = squared_mean / samples;\n	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );\n	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );\n}", T_ = [
	/*@__PURE__*/ new J(1, 0, 0),
	/*@__PURE__*/ new J(-1, 0, 0),
	/*@__PURE__*/ new J(0, 1, 0),
	/*@__PURE__*/ new J(0, -1, 0),
	/*@__PURE__*/ new J(0, 0, 1),
	/*@__PURE__*/ new J(0, 0, -1)
], E_ = [
	/*@__PURE__*/ new J(0, -1, 0),
	/*@__PURE__*/ new J(0, -1, 0),
	/*@__PURE__*/ new J(0, 0, 1),
	/*@__PURE__*/ new J(0, 0, -1),
	/*@__PURE__*/ new J(0, -1, 0),
	/*@__PURE__*/ new J(0, -1, 0)
], D_ = /*@__PURE__*/ new el(), O_ = /*@__PURE__*/ new J(), k_ = /*@__PURE__*/ new J();
function A_(e, t, n) {
	let r = new gd(), i = new q(), a = new q(), o = new Yc(), s = new Cp(), c = new wp(), l = {}, u = n.maxTextureSize, d = {
		0: 1,
		1: 0,
		2: 2
	}, f = new bp({
		defines: { VSM_SAMPLES: 8 },
		uniforms: {
			shadow_pass: { value: null },
			resolution: { value: new q() },
			radius: { value: 4 }
		},
		vertexShader: C_,
		fragmentShader: w_
	}), p = f.clone();
	p.defines.HORIZONTAL_PASS = 1;
	let m = new Au();
	m.setAttribute("position", new hu(new Float32Array([
		-1,
		-1,
		.5,
		3,
		-1,
		.5,
		-1,
		3,
		.5
	]), 3));
	let h = new ed(m, f), g = this;
	this.enabled = !1, this.autoUpdate = !0, this.needsUpdate = !1, this.type = 1;
	let _ = this.type;
	this.render = function(t, n, s) {
		if (g.enabled === !1 || g.autoUpdate === !1 && g.needsUpdate === !1 || t.length === 0) return;
		this.type === 2 && (W("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."), this.type = 1);
		let c = e.getRenderTarget(), l = e.getActiveCubeFace(), d = e.getActiveMipmapLevel(), f = e.state;
		f.setBlending(0), f.buffers.depth.getReversed() === !0 ? f.buffers.color.setClear(0, 0, 0, 0) : f.buffers.color.setClear(1, 1, 1, 1), f.buffers.depth.setTest(!0), f.setScissorTest(!1);
		let p = _ !== this.type;
		p && n.traverse(function(e) {
			e.material && (Array.isArray(e.material) ? e.material.forEach((e) => e.needsUpdate = !0) : e.material.needsUpdate = !0);
		});
		for (let c = 0, l = t.length; c < l; c++) {
			let l = t[c], d = l.shadow;
			if (d === void 0) {
				W("WebGLShadowMap:", l, "has no shadow.");
				continue;
			}
			if (d.autoUpdate === !1 && d.needsUpdate === !1) continue;
			i.copy(d.mapSize);
			let m = d.getFrameExtents();
			i.multiply(m), a.copy(d.mapSize), (i.x > u || i.y > u) && (i.x > u && (a.x = Math.floor(u / m.x), i.x = a.x * m.x, d.mapSize.x = a.x), i.y > u && (a.y = Math.floor(u / m.y), i.y = a.y * m.y, d.mapSize.y = a.y));
			let h = e.state.buffers.depth.getReversed();
			if (d.camera._reversedDepth = h, d.map === null || p === !0) {
				if (d.map !== null && (d.map.depthTexture !== null && (d.map.depthTexture.dispose(), d.map.depthTexture = null), d.map.dispose()), this.type === 3) {
					if (l.isPointLight) {
						W("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");
						continue;
					}
					d.map = new Zc(i.x, i.y, {
						format: fs,
						type: $o,
						minFilter: Uo,
						magFilter: Uo,
						generateMipmaps: !1
					}), d.map.texture.name = l.name + ".shadowMap", d.map.depthTexture = new jd(i.x, i.y, Qo), d.map.depthTexture.name = l.name + ".shadowMapDepth", d.map.depthTexture.format = cs, d.map.depthTexture.compareFunction = null, d.map.depthTexture.minFilter = Bo, d.map.depthTexture.magFilter = Bo;
				} else l.isPointLight ? (d.map = new sh(i.x), d.map.depthTexture = new Md(i.x, Zo)) : (d.map = new Zc(i.x, i.y), d.map.depthTexture = new jd(i.x, i.y, Zo)), d.map.depthTexture.name = l.name + ".shadowMap", d.map.depthTexture.format = cs, this.type === 1 ? (d.map.depthTexture.compareFunction = h ? 518 : 515, d.map.depthTexture.minFilter = Uo, d.map.depthTexture.magFilter = Uo) : (d.map.depthTexture.compareFunction = null, d.map.depthTexture.minFilter = Bo, d.map.depthTexture.magFilter = Bo);
				d.camera.updateProjectionMatrix();
			}
			d.map.isWebGLCubeRenderTarget !== !0 && (d.map.width !== i.x || d.map.height !== i.y) && d.map.setSize(i.x, i.y);
			let g = d.map.isWebGLCubeRenderTarget ? 6 : d.getViewportCount();
			l.isPointLight !== !0 && d.updateMatrices(l, s);
			for (let t = 0; t < g; t++) {
				let i = d.getCamera(t);
				if (l.isPointLight) {
					let e = d.camera, n = d.matrix, r = l.distance || e.far;
					r !== e.far && (e.far = r, e.updateProjectionMatrix()), O_.setFromMatrixPosition(l.matrixWorld), e.position.copy(O_), k_.copy(e.position), k_.add(T_[t]), e.up.copy(E_[t]), e.lookAt(k_), e.updateMatrixWorld(), n.makeTranslation(-O_.x, -O_.y, -O_.z), D_.multiplyMatrices(e.projectionMatrix, e.matrixWorldInverse), d._frustum.setFromProjectionMatrix(D_, e.coordinateSystem, e.reversedDepth);
				}
				if (d.map.isWebGLCubeRenderTarget) e.setRenderTarget(d.map, t), e.clear();
				else {
					t === 0 && (e.setRenderTarget(d.map), e.clear());
					let n = d.getViewport(t);
					o.set(a.x * n.x, a.y * n.y, a.x * n.z, a.y * n.w), f.viewport(o);
				}
				r = d.getFrustum(t), b(n, s, i, l, this.type);
			}
			d.isPointLightShadow !== !0 && this.type === 3 && v(d, s), d.needsUpdate = !1;
		}
		_ = this.type, g.needsUpdate = !1, e.setRenderTarget(c, l, d);
	};
	function v(n, r) {
		let a = t.update(h);
		f.defines.VSM_SAMPLES !== n.blurSamples && (f.defines.VSM_SAMPLES = n.blurSamples, p.defines.VSM_SAMPLES = n.blurSamples, f.needsUpdate = !0, p.needsUpdate = !0), n.mapPass === null ? n.mapPass = new Zc(i.x, i.y, {
			format: fs,
			type: $o
		}) : (n.mapPass.width !== n.map.width || n.mapPass.height !== n.map.height) && n.mapPass.setSize(n.map.width, n.map.height), f.uniforms.shadow_pass.value = n.map.depthTexture, f.uniforms.resolution.value.set(n.map.width, n.map.height), f.uniforms.radius.value = n.radius, e.setRenderTarget(n.mapPass), e.clear(), e.renderBufferDirect(r, null, a, f, h, null), p.uniforms.shadow_pass.value = n.mapPass.texture, p.uniforms.resolution.value.set(n.map.width, n.map.height), p.uniforms.radius.value = n.radius, e.setRenderTarget(n.map), e.clear(), e.renderBufferDirect(r, null, a, p, h, null);
	}
	function y(t, n, r, i) {
		let a = null, o = r.isPointLight === !0 ? t.customDistanceMaterial : t.customDepthMaterial;
		if (o !== void 0) a = o;
		else if (a = r.isPointLight === !0 ? c : s, e.localClippingEnabled && n.clipShadows === !0 && Array.isArray(n.clippingPlanes) && n.clippingPlanes.length !== 0 || n.displacementMap && n.displacementScale !== 0 || n.alphaMap && n.alphaTest > 0 || n.map && n.alphaTest > 0 || n.alphaToCoverage === !0) {
			let e = a.uuid, t = n.uuid, r = l[e];
			r === void 0 && (r = {}, l[e] = r);
			let i = r[t];
			i === void 0 && (i = a.clone(), r[t] = i, n.addEventListener("dispose", x)), a = i;
		}
		if (a.visible = n.visible, a.wireframe = n.wireframe, i === 3 ? a.side = n.shadowSide === null ? n.side : n.shadowSide : a.side = n.shadowSide === null ? d[n.side] : n.shadowSide, a.alphaMap = n.alphaMap, a.alphaTest = n.alphaToCoverage === !0 ? .5 : n.alphaTest, a.map = n.map, a.clipShadows = n.clipShadows, a.clippingPlanes = n.clippingPlanes, a.clipIntersection = n.clipIntersection, a.displacementMap = n.displacementMap, a.displacementScale = n.displacementScale, a.displacementBias = n.displacementBias, a.wireframeLinewidth = n.wireframeLinewidth, a.linewidth = n.linewidth, r.isPointLight === !0 && a.isMeshDistanceMaterial === !0) {
			let t = e.properties.get(a);
			t.light = r;
		}
		return a;
	}
	function b(n, i, a, o, s) {
		if (n.visible === !1) return;
		if (n.layers.test(i.layers) && (n.isMesh || n.isLine || n.isPoints) && (n.castShadow || n.receiveShadow && s === 3) && (!n.frustumCulled || n.intersectsFrustum(r))) {
			n.modelViewMatrix.multiplyMatrices(a.matrixWorldInverse, n.matrixWorld);
			let r = t.update(n), c = n.material;
			if (Array.isArray(c)) {
				let t = r.groups;
				for (let l = 0, u = t.length; l < u; l++) {
					let u = t[l], d = c[u.materialIndex];
					if (d && d.visible) {
						let t = y(n, d, o, s);
						n.onBeforeShadow(e, n, i, a, r, t, u), e.renderBufferDirect(a, null, r, t, n, u), n.onAfterShadow(e, n, i, a, r, t, u);
					}
				}
			} else if (c.visible) {
				let t = y(n, c, o, s);
				n.onBeforeShadow(e, n, i, a, r, t, null), e.renderBufferDirect(a, null, r, t, n, null), n.onAfterShadow(e, n, i, a, r, t, null);
			}
		}
		let c = n.children;
		for (let e = 0, t = c.length; e < t; e++) b(c[e], i, a, o, s);
	}
	function x(e) {
		e.target.removeEventListener("dispose", x);
		for (let t in l) {
			let n = l[t], r = e.target.uuid;
			r in n && (n[r].dispose(), delete n[r]);
		}
	}
}
function j_(e, t) {
	function n() {
		let t = !1, n = new Yc(), r = null, i = new Yc(0, 0, 0, 0);
		return {
			setMask: function(n) {
				r !== n && !t && (e.colorMask(n, n, n, n), r = n);
			},
			setLocked: function(e) {
				t = e;
			},
			setClear: function(t, r, a, o, s) {
				s === !0 && (t *= o, r *= o, a *= o), n.set(t, r, a, o), i.equals(n) === !1 && (e.clearColor(t, r, a, o), i.copy(n));
			},
			reset: function() {
				t = !1, r = null, i.set(-1, 0, 0, 0);
			}
		};
	}
	function r() {
		let n = !1, r = !1, i = null, a = null, o = null;
		return {
			setReversed: function(e) {
				if (r !== e) {
					let n = t.get("EXT_clip_control");
					e ? n.clipControlEXT(n.LOWER_LEFT_EXT, n.ZERO_TO_ONE_EXT) : n.clipControlEXT(n.LOWER_LEFT_EXT, n.NEGATIVE_ONE_TO_ONE_EXT), r = e;
					let i = o;
					o = null, this.setClear(i);
				}
			},
			getReversed: function() {
				return r;
			},
			setTest: function(t) {
				t ? se(e.DEPTH_TEST) : ce(e.DEPTH_TEST);
			},
			setMask: function(t) {
				i !== t && !n && (e.depthMask(t), i = t);
			},
			setFunc: function(t) {
				if (r && (t = Sc[t]), a !== t) {
					switch (t) {
						case 0:
							e.depthFunc(e.NEVER);
							break;
						case 1:
							e.depthFunc(e.ALWAYS);
							break;
						case 2:
							e.depthFunc(e.LESS);
							break;
						case 3:
							e.depthFunc(e.LEQUAL);
							break;
						case 4:
							e.depthFunc(e.EQUAL);
							break;
						case 5:
							e.depthFunc(e.GEQUAL);
							break;
						case 6:
							e.depthFunc(e.GREATER);
							break;
						case 7:
							e.depthFunc(e.NOTEQUAL);
							break;
						default: e.depthFunc(e.LEQUAL);
					}
					a = t;
				}
			},
			setLocked: function(e) {
				n = e;
			},
			setClear: function(t) {
				o !== t && (o = t, r && (t = 1 - t), e.clearDepth(t));
			},
			reset: function() {
				n = !1, i = null, a = null, o = null, r = !1;
			}
		};
	}
	function i() {
		let t = !1, n = null, r = null, i = null, a = null, o = null, s = null, c = null, l = null;
		return {
			setTest: function(n) {
				t || (n ? se(e.STENCIL_TEST) : ce(e.STENCIL_TEST));
			},
			setMask: function(r) {
				n !== r && !t && (e.stencilMask(r), n = r);
			},
			setFunc: function(t, n, o) {
				(r !== t || i !== n || a !== o) && (e.stencilFunc(t, n, o), r = t, i = n, a = o);
			},
			setOp: function(t, n, r) {
				(o !== t || s !== n || c !== r) && (e.stencilOp(t, n, r), o = t, s = n, c = r);
			},
			setLocked: function(e) {
				t = e;
			},
			setClear: function(t) {
				l !== t && (e.clearStencil(t), l = t);
			},
			reset: function() {
				t = !1, n = null, r = null, i = null, a = null, o = null, s = null, c = null, l = null;
			}
		};
	}
	let a = new n(), o = new r(), s = new i(), c = /* @__PURE__ */ new WeakMap(), l = /* @__PURE__ */ new WeakMap(), u = {}, d = {}, f = {}, p = /* @__PURE__ */ new WeakMap(), m = [], h = null, g = !1, _ = null, v = null, y = null, b = null, x = null, S = null, C = null, w = new Z(0, 0, 0), T = 0, E = !1, D = null, O = null, k = null, A = null, j = null, ee = e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS), M = !1, te = 0, ne = e.getParameter(e.VERSION);
	ne.indexOf("WebGL") === -1 ? ne.indexOf("OpenGL ES") !== -1 && (te = parseFloat(/^OpenGL ES (\d)/.exec(ne)[1]), M = te >= 2) : (te = parseFloat(/^WebGL (\d)/.exec(ne)[1]), M = te >= 1);
	let N = null, re = {}, ie = e.getParameter(e.SCISSOR_BOX), ae = e.getParameter(e.VIEWPORT), oe = new Yc().fromArray(ie), P = new Yc().fromArray(ae);
	function F(t, n, r, i) {
		let a = /* @__PURE__ */ new Uint8Array(4), o = e.createTexture();
		e.bindTexture(t, o), e.texParameteri(t, e.TEXTURE_MIN_FILTER, e.NEAREST), e.texParameteri(t, e.TEXTURE_MAG_FILTER, e.NEAREST);
		for (let o = 0; o < r; o++) t === e.TEXTURE_3D || t === e.TEXTURE_2D_ARRAY ? e.texImage3D(n, 0, e.RGBA, 1, 1, i, 0, e.RGBA, e.UNSIGNED_BYTE, a) : e.texImage2D(n + o, 0, e.RGBA, 1, 1, 0, e.RGBA, e.UNSIGNED_BYTE, a);
		return o;
	}
	let I = {};
	I[e.TEXTURE_2D] = F(e.TEXTURE_2D, e.TEXTURE_2D, 1), I[e.TEXTURE_CUBE_MAP] = F(e.TEXTURE_CUBE_MAP, e.TEXTURE_CUBE_MAP_POSITIVE_X, 6), I[e.TEXTURE_2D_ARRAY] = F(e.TEXTURE_2D_ARRAY, e.TEXTURE_2D_ARRAY, 1, 1), I[e.TEXTURE_3D] = F(e.TEXTURE_3D, e.TEXTURE_3D, 1, 1), a.setClear(0, 0, 0, 1), o.setClear(1), s.setClear(0), se(e.DEPTH_TEST), o.setFunc(3), ge(!1), _e(1), se(e.CULL_FACE), me(0);
	function se(t) {
		u[t] !== !0 && (e.enable(t), u[t] = !0);
	}
	function ce(t) {
		u[t] !== !1 && (e.disable(t), u[t] = !1);
	}
	function le(t, n) {
		return f[t] !== n && (e.bindFramebuffer(t, n), f[t] = n, t === e.DRAW_FRAMEBUFFER && (f[e.FRAMEBUFFER] = n), t === e.FRAMEBUFFER && (f[e.DRAW_FRAMEBUFFER] = n), !0);
	}
	function ue(t, n) {
		let r = m, i = !1;
		if (t) {
			r = p.get(n), r === void 0 && (r = [], p.set(n, r));
			let a = t.textures;
			if (r.length !== a.length || r[0] !== e.COLOR_ATTACHMENT0) {
				for (let t = 0, n = a.length; t < n; t++) r[t] = e.COLOR_ATTACHMENT0 + t;
				r.length = a.length, i = !0;
			}
		} else r[0] !== e.BACK && (r[0] = e.BACK, i = !0);
		i && e.drawBuffers(r);
	}
	function de(t) {
		return h !== t && (e.useProgram(t), h = t, !0);
	}
	let fe = {
		100: e.FUNC_ADD,
		101: e.FUNC_SUBTRACT,
		102: e.FUNC_REVERSE_SUBTRACT
	};
	fe[103] = e.MIN, fe[104] = e.MAX;
	let pe = {
		200: e.ZERO,
		201: e.ONE,
		202: e.SRC_COLOR,
		204: e.SRC_ALPHA,
		210: e.SRC_ALPHA_SATURATE,
		208: e.DST_COLOR,
		206: e.DST_ALPHA,
		203: e.ONE_MINUS_SRC_COLOR,
		205: e.ONE_MINUS_SRC_ALPHA,
		209: e.ONE_MINUS_DST_COLOR,
		207: e.ONE_MINUS_DST_ALPHA,
		211: e.CONSTANT_COLOR,
		212: e.ONE_MINUS_CONSTANT_COLOR,
		213: e.CONSTANT_ALPHA,
		214: e.ONE_MINUS_CONSTANT_ALPHA
	};
	function me(t, n, r, i, a, o, s, c, l, u) {
		if (t === 0) g === !0 && (ce(e.BLEND), g = !1);
		else if (g === !1 && (se(e.BLEND), g = !0), t !== 5) {
			if (t !== _ || u !== E) {
				if ((v !== 100 || x !== 100) && (e.blendEquation(e.FUNC_ADD), v = 100, x = 100), u) switch (t) {
					case 1:
						e.blendFuncSeparate(e.ONE, e.ONE_MINUS_SRC_ALPHA, e.ONE, e.ONE_MINUS_SRC_ALPHA);
						break;
					case 2:
						e.blendFunc(e.ONE, e.ONE);
						break;
					case 3:
						e.blendFuncSeparate(e.ZERO, e.ONE_MINUS_SRC_COLOR, e.ZERO, e.ONE);
						break;
					case 4:
						e.blendFuncSeparate(e.DST_COLOR, e.ONE_MINUS_SRC_ALPHA, e.ZERO, e.ONE);
						break;
					default: G("WebGLState: Invalid blending: ", t);
				}
				else switch (t) {
					case 1:
						e.blendFuncSeparate(e.SRC_ALPHA, e.ONE_MINUS_SRC_ALPHA, e.ONE, e.ONE_MINUS_SRC_ALPHA);
						break;
					case 2:
						e.blendFuncSeparate(e.SRC_ALPHA, e.ONE, e.ONE, e.ONE);
						break;
					case 3:
						G("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");
						break;
					case 4:
						G("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");
						break;
					default: G("WebGLState: Invalid blending: ", t);
				}
				y = null, b = null, S = null, C = null, w.set(0, 0, 0), T = 0, _ = t, E = u;
			}
		} else a ||= n, o ||= r, s ||= i, (n !== v || a !== x) && (e.blendEquationSeparate(fe[n], fe[a]), v = n, x = a), (r !== y || i !== b || o !== S || s !== C) && (e.blendFuncSeparate(pe[r], pe[i], pe[o], pe[s]), y = r, b = i, S = o, C = s), (c.equals(w) === !1 || l !== T) && (e.blendColor(c.r, c.g, c.b, l), w.copy(c), T = l), _ = t, E = !1;
	}
	function he(t, n) {
		t.side === 2 ? ce(e.CULL_FACE) : se(e.CULL_FACE);
		let r = t.side === 1;
		n && (r = !r), ge(r), t.blending === 1 && t.transparent === !1 ? me(0) : me(t.blending, t.blendEquation, t.blendSrc, t.blendDst, t.blendEquationAlpha, t.blendSrcAlpha, t.blendDstAlpha, t.blendColor, t.blendAlpha, t.premultipliedAlpha), o.setFunc(t.depthFunc), o.setTest(t.depthTest), o.setMask(t.depthWrite), a.setMask(t.colorWrite);
		let i = t.stencilWrite;
		s.setTest(i), i && (s.setMask(t.stencilWriteMask), s.setFunc(t.stencilFunc, t.stencilRef, t.stencilFuncMask), s.setOp(t.stencilFail, t.stencilZFail, t.stencilZPass)), ye(t.polygonOffset, t.polygonOffsetFactor, t.polygonOffsetUnits), t.alphaToCoverage === !0 ? se(e.SAMPLE_ALPHA_TO_COVERAGE) : ce(e.SAMPLE_ALPHA_TO_COVERAGE);
	}
	function ge(t) {
		D !== t && (t ? e.frontFace(e.CW) : e.frontFace(e.CCW), D = t);
	}
	function _e(t) {
		t === 0 ? ce(e.CULL_FACE) : (se(e.CULL_FACE), t !== O && (t === 1 ? e.cullFace(e.BACK) : t === 2 ? e.cullFace(e.FRONT) : e.cullFace(e.FRONT_AND_BACK))), O = t;
	}
	function ve(t) {
		t !== k && (M && e.lineWidth(t), k = t);
	}
	function ye(t, n, r) {
		t ? (se(e.POLYGON_OFFSET_FILL), (A !== n || j !== r) && (A = n, j = r, o.getReversed() && (n = -n), e.polygonOffset(n, r))) : ce(e.POLYGON_OFFSET_FILL);
	}
	function be(t) {
		t ? se(e.SCISSOR_TEST) : ce(e.SCISSOR_TEST);
	}
	function L(t) {
		t === void 0 && (t = e.TEXTURE0 + ee - 1), N !== t && (e.activeTexture(t), N = t);
	}
	function xe(t, n, r) {
		r === void 0 && (r = N === null ? e.TEXTURE0 + ee - 1 : N);
		let i = re[r];
		i === void 0 && (i = {
			type: void 0,
			texture: void 0
		}, re[r] = i), (i.type !== t || i.texture !== n) && (N !== r && (e.activeTexture(r), N = r), e.bindTexture(t, n || I[t]), i.type = t, i.texture = n);
	}
	function Se() {
		let t = re[N];
		t !== void 0 && t.type !== void 0 && (e.bindTexture(t.type, null), t.type = void 0, t.texture = void 0);
	}
	function Ce() {
		try {
			e.compressedTexImage2D(...arguments);
		} catch (e) {
			G("WebGLState:", e);
		}
	}
	function R() {
		try {
			e.compressedTexImage3D(...arguments);
		} catch (e) {
			G("WebGLState:", e);
		}
	}
	function we() {
		try {
			e.texSubImage2D(...arguments);
		} catch (e) {
			G("WebGLState:", e);
		}
	}
	function z() {
		try {
			e.texSubImage3D(...arguments);
		} catch (e) {
			G("WebGLState:", e);
		}
	}
	function B() {
		try {
			e.compressedTexSubImage2D(...arguments);
		} catch (e) {
			G("WebGLState:", e);
		}
	}
	function Te() {
		try {
			e.compressedTexSubImage3D(...arguments);
		} catch (e) {
			G("WebGLState:", e);
		}
	}
	function Ee() {
		try {
			e.texStorage2D(...arguments);
		} catch (e) {
			G("WebGLState:", e);
		}
	}
	function De() {
		try {
			e.texStorage3D(...arguments);
		} catch (e) {
			G("WebGLState:", e);
		}
	}
	function Oe() {
		try {
			e.texImage2D(...arguments);
		} catch (e) {
			G("WebGLState:", e);
		}
	}
	function ke() {
		try {
			e.texImage3D(...arguments);
		} catch (e) {
			G("WebGLState:", e);
		}
	}
	function Ae(t) {
		return d[t] === void 0 ? e.getParameter(t) : d[t];
	}
	function je(t, n) {
		d[t] !== n && (e.pixelStorei(t, n), d[t] = n);
	}
	function Me(t) {
		oe.equals(t) === !1 && (e.scissor(t.x, t.y, t.z, t.w), oe.copy(t));
	}
	function Ne(t) {
		P.equals(t) === !1 && (e.viewport(t.x, t.y, t.z, t.w), P.copy(t));
	}
	function Pe(t, n) {
		let r = l.get(n);
		r === void 0 && (r = /* @__PURE__ */ new WeakMap(), l.set(n, r));
		let i = r.get(t);
		i === void 0 && (i = e.getUniformBlockIndex(n, t.name), r.set(t, i));
	}
	function Fe(t, n) {
		let r = l.get(n).get(t);
		c.get(n) !== r && (e.uniformBlockBinding(n, r, t.__bindingPointIndex), c.set(n, r));
	}
	function Ie() {
		e.disable(e.BLEND), e.disable(e.CULL_FACE), e.disable(e.DEPTH_TEST), e.disable(e.POLYGON_OFFSET_FILL), e.disable(e.SCISSOR_TEST), e.disable(e.STENCIL_TEST), e.disable(e.SAMPLE_ALPHA_TO_COVERAGE), e.blendEquation(e.FUNC_ADD), e.blendFunc(e.ONE, e.ZERO), e.blendFuncSeparate(e.ONE, e.ZERO, e.ONE, e.ZERO), e.blendColor(0, 0, 0, 0), e.colorMask(!0, !0, !0, !0), e.clearColor(0, 0, 0, 0), e.depthMask(!0), e.depthFunc(e.LESS), o.setReversed(!1), e.clearDepth(1), e.stencilMask(4294967295), e.stencilFunc(e.ALWAYS, 0, 4294967295), e.stencilOp(e.KEEP, e.KEEP, e.KEEP), e.clearStencil(0), e.cullFace(e.BACK), e.frontFace(e.CCW), e.polygonOffset(0, 0), e.activeTexture(e.TEXTURE0), e.bindFramebuffer(e.FRAMEBUFFER, null), e.bindFramebuffer(e.DRAW_FRAMEBUFFER, null), e.bindFramebuffer(e.READ_FRAMEBUFFER, null), e.useProgram(null), e.lineWidth(1), e.scissor(0, 0, e.canvas.width, e.canvas.height), e.viewport(0, 0, e.canvas.width, e.canvas.height), e.pixelStorei(e.PACK_ALIGNMENT, 4), e.pixelStorei(e.UNPACK_ALIGNMENT, 4), e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL, !1), e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL, !1), e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL, e.BROWSER_DEFAULT_WEBGL), e.pixelStorei(e.PACK_ROW_LENGTH, 0), e.pixelStorei(e.PACK_SKIP_PIXELS, 0), e.pixelStorei(e.PACK_SKIP_ROWS, 0), e.pixelStorei(e.UNPACK_ROW_LENGTH, 0), e.pixelStorei(e.UNPACK_IMAGE_HEIGHT, 0), e.pixelStorei(e.UNPACK_SKIP_PIXELS, 0), e.pixelStorei(e.UNPACK_SKIP_ROWS, 0), e.pixelStorei(e.UNPACK_SKIP_IMAGES, 0), u = {}, d = {}, N = null, re = {}, f = {}, p = /* @__PURE__ */ new WeakMap(), m = [], h = null, g = !1, _ = null, v = null, y = null, b = null, x = null, S = null, C = null, w = new Z(0, 0, 0), T = 0, E = !1, D = null, O = null, k = null, A = null, j = null, oe.set(0, 0, e.canvas.width, e.canvas.height), P.set(0, 0, e.canvas.width, e.canvas.height), a.reset(), o.reset(), s.reset();
	}
	return {
		buffers: {
			color: a,
			depth: o,
			stencil: s
		},
		enable: se,
		disable: ce,
		bindFramebuffer: le,
		drawBuffers: ue,
		useProgram: de,
		setBlending: me,
		setMaterial: he,
		setFlipSided: ge,
		setCullFace: _e,
		setLineWidth: ve,
		setPolygonOffset: ye,
		setScissorTest: be,
		activeTexture: L,
		bindTexture: xe,
		unbindTexture: Se,
		compressedTexImage2D: Ce,
		compressedTexImage3D: R,
		texImage2D: Oe,
		texImage3D: ke,
		pixelStorei: je,
		getParameter: Ae,
		updateUBOMapping: Pe,
		uniformBlockBinding: Fe,
		texStorage2D: Ee,
		texStorage3D: De,
		texSubImage2D: we,
		texSubImage3D: z,
		compressedTexSubImage2D: B,
		compressedTexSubImage3D: Te,
		scissor: Me,
		viewport: Ne,
		reset: Ie
	};
}
function M_(e, t, n, r, i, a, o) {
	let s = t.has("WEBGL_multisampled_render_to_texture") ? t.get("WEBGL_multisampled_render_to_texture") : null, c = typeof navigator > "u" ? !1 : /OculusBrowser/g.test(navigator.userAgent), l = new q(), u = /* @__PURE__ */ new WeakMap(), d = /* @__PURE__ */ new Set(), f, p = /* @__PURE__ */ new WeakMap(), m = !1;
	try {
		m = typeof OffscreenCanvas < "u" && new OffscreenCanvas(1, 1).getContext("2d") !== null;
	} catch {}
	function h(e, t) {
		return m ? new OffscreenCanvas(e, t) : hc("canvas");
	}
	function g(e, t, n) {
		let r = 1, i = Ce(e);
		if ((i.width > n || i.height > n) && (r = n / Math.max(i.width, i.height)), r < 1) {
			if (typeof HTMLImageElement < "u" && e instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && e instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && e instanceof ImageBitmap || typeof VideoFrame < "u" && e instanceof VideoFrame) {
				let n = Math.floor(r * i.width), a = Math.floor(r * i.height);
				f === void 0 && (f = h(n, a));
				let o = t ? h(n, a) : f;
				return o.width = n, o.height = a, o.getContext("2d").drawImage(e, 0, 0, n, a), W("WebGLRenderer: Texture has been resized from (" + i.width + "x" + i.height + ") to (" + n + "x" + a + ")."), o;
			}
			return "data" in e && W("WebGLRenderer: Image in DataTexture is too big (" + i.width + "x" + i.height + ")."), e;
		}
		return e;
	}
	function _(e) {
		return e.generateMipmaps;
	}
	function v(t) {
		e.generateMipmap(t);
	}
	function y(t) {
		return t.isWebGLCubeRenderTarget ? e.TEXTURE_CUBE_MAP : t.isWebGL3DRenderTarget ? e.TEXTURE_3D : t.isWebGLArrayRenderTarget || t.isCompressedArrayTexture ? e.TEXTURE_2D_ARRAY : e.TEXTURE_2D;
	}
	function b(n, r, i, a, o, s = !1) {
		if (n !== null) {
			if (e[n] !== void 0) return e[n];
			W("WebGLRenderer: Attempt to use non-existing WebGL internal format '" + n + "'");
		}
		let c;
		a && (c = t.get("EXT_texture_norm16"), c || W("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));
		let l = r;
		if (r === e.RED && (i === e.FLOAT && (l = e.R32F), i === e.HALF_FLOAT && (l = e.R16F), i === e.UNSIGNED_BYTE && (l = e.R8), i === e.UNSIGNED_SHORT && c && (l = c.R16_EXT), i === e.SHORT && c && (l = c.R16_SNORM_EXT)), r === e.RED_INTEGER && (i === e.UNSIGNED_BYTE && (l = e.R8UI), i === e.UNSIGNED_SHORT && (l = e.R16UI), i === e.UNSIGNED_INT && (l = e.R32UI), i === e.BYTE && (l = e.R8I), i === e.SHORT && (l = e.R16I), i === e.INT && (l = e.R32I)), r === e.RG && (i === e.FLOAT && (l = e.RG32F), i === e.HALF_FLOAT && (l = e.RG16F), i === e.UNSIGNED_BYTE && (l = e.RG8), i === e.UNSIGNED_SHORT && c && (l = c.RG16_EXT), i === e.SHORT && c && (l = c.RG16_SNORM_EXT)), r === e.RG_INTEGER && (i === e.UNSIGNED_BYTE && (l = e.RG8UI), i === e.UNSIGNED_SHORT && (l = e.RG16UI), i === e.UNSIGNED_INT && (l = e.RG32UI), i === e.BYTE && (l = e.RG8I), i === e.SHORT && (l = e.RG16I), i === e.INT && (l = e.RG32I)), r === e.RGB_INTEGER && (i === e.UNSIGNED_BYTE && (l = e.RGB8UI), i === e.UNSIGNED_SHORT && (l = e.RGB16UI), i === e.UNSIGNED_INT && (l = e.RGB32UI), i === e.BYTE && (l = e.RGB8I), i === e.SHORT && (l = e.RGB16I), i === e.INT && (l = e.RGB32I)), r === e.RGBA_INTEGER && (i === e.UNSIGNED_BYTE && (l = e.RGBA8UI), i === e.UNSIGNED_SHORT && (l = e.RGBA16UI), i === e.UNSIGNED_INT && (l = e.RGBA32UI), i === e.BYTE && (l = e.RGBA8I), i === e.SHORT && (l = e.RGBA16I), i === e.INT && (l = e.RGBA32I)), r === e.RGB && (i === e.UNSIGNED_SHORT && c && (l = c.RGB16_EXT), i === e.SHORT && c && (l = c.RGB16_SNORM_EXT), i === e.UNSIGNED_INT_5_9_9_9_REV && (l = e.RGB9_E5), i === e.UNSIGNED_INT_10F_11F_11F_REV && (l = e.R11F_G11F_B10F)), r === e.RGBA) {
			let t = s ? sc : X.getTransfer(o);
			i === e.FLOAT && (l = e.RGBA32F), i === e.HALF_FLOAT && (l = e.RGBA16F), i === e.UNSIGNED_BYTE && (l = t === "srgb" ? e.SRGB8_ALPHA8 : e.RGBA8), i === e.UNSIGNED_SHORT && c && (l = c.RGBA16_EXT), i === e.SHORT && c && (l = c.RGBA16_SNORM_EXT), i === e.UNSIGNED_SHORT_4_4_4_4 && (l = e.RGBA4), i === e.UNSIGNED_SHORT_5_5_5_1 && (l = e.RGB5_A1);
		}
		return (l === e.R16F || l === e.R32F || l === e.RG16F || l === e.RG32F || l === e.RGBA16F || l === e.RGBA32F) && t.get("EXT_color_buffer_float"), l;
	}
	function x(t, n) {
		let r;
		return t ? n === null || n === 1014 || n === 1020 ? r = e.DEPTH24_STENCIL8 : n === 1015 ? r = e.DEPTH32F_STENCIL8 : n === 1012 && (r = e.DEPTH24_STENCIL8, W("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")) : n === null || n === 1014 || n === 1020 ? r = e.DEPTH_COMPONENT24 : n === 1015 ? r = e.DEPTH_COMPONENT32F : n === 1012 && (r = e.DEPTH_COMPONENT16), r;
	}
	function S(e, t) {
		return _(e) === !0 || e.isFramebufferTexture && e.minFilter !== 1003 && e.minFilter !== 1006 ? Math.log2(Math.max(t.width, t.height)) + 1 : e.mipmaps !== void 0 && e.mipmaps.length > 0 ? e.mipmaps.length : e.isCompressedTexture && Array.isArray(e.image) ? t.mipmaps.length : 1;
	}
	function C(e) {
		let t = e.target;
		t.removeEventListener("dispose", C), T(t), t.isVideoTexture && u.delete(t), t.isHTMLTexture && d.delete(t);
	}
	function w(e) {
		let t = e.target;
		t.removeEventListener("dispose", w), D(t);
	}
	function T(e) {
		let t = r.get(e);
		if (t.__webglInit === void 0) return;
		let n = e.source, i = p.get(n);
		if (i) {
			let r = i[t.__cacheKey];
			r.usedTimes--, r.usedTimes === 0 && E(e), Object.keys(i).length === 0 && p.delete(n);
		}
		r.remove(e);
	}
	function E(t) {
		let n = r.get(t);
		e.deleteTexture(n.__webglTexture);
		let i = t.source, a = p.get(i);
		delete a[n.__cacheKey], o.memory.textures--;
	}
	function D(t) {
		let n = r.get(t);
		if (t.depthTexture && (t.depthTexture.dispose(), r.remove(t.depthTexture)), t.isWebGLCubeRenderTarget) for (let t = 0; t < 6; t++) {
			if (Array.isArray(n.__webglFramebuffer[t])) for (let r = 0; r < n.__webglFramebuffer[t].length; r++) e.deleteFramebuffer(n.__webglFramebuffer[t][r]);
			else e.deleteFramebuffer(n.__webglFramebuffer[t]);
			n.__webglDepthbuffer && e.deleteRenderbuffer(n.__webglDepthbuffer[t]);
		}
		else {
			if (Array.isArray(n.__webglFramebuffer)) for (let t = 0; t < n.__webglFramebuffer.length; t++) e.deleteFramebuffer(n.__webglFramebuffer[t]);
			else e.deleteFramebuffer(n.__webglFramebuffer);
			if (n.__webglDepthbuffer && e.deleteRenderbuffer(n.__webglDepthbuffer), n.__webglMultisampledFramebuffer && e.deleteFramebuffer(n.__webglMultisampledFramebuffer), n.__webglColorRenderbuffer) for (let t = 0; t < n.__webglColorRenderbuffer.length; t++) n.__webglColorRenderbuffer[t] && e.deleteRenderbuffer(n.__webglColorRenderbuffer[t]);
			n.__webglDepthRenderbuffer && e.deleteRenderbuffer(n.__webglDepthRenderbuffer);
		}
		let i = t.textures;
		for (let t = 0, n = i.length; t < n; t++) {
			let n = r.get(i[t]);
			n.__webglTexture && (e.deleteTexture(n.__webglTexture), o.memory.textures--), r.remove(i[t]);
		}
		r.remove(t);
	}
	let O = 0;
	function k() {
		O = 0;
	}
	function A() {
		return O;
	}
	function j(e) {
		O = e;
	}
	function ee() {
		let e = O;
		return e >= i.maxTextures && W("WebGLTextures: Trying to use " + (e + 1) + " texture units while this GPU supports only " + i.maxTextures), O += 1, e;
	}
	function M(e) {
		let t = [];
		return t.push(e.wrapS), t.push(e.wrapT), t.push(e.wrapR || 0), t.push(e.magFilter), t.push(e.minFilter), t.push(e.anisotropy), t.push(e.internalFormat), t.push(e.format), t.push(e.type), t.push(e.generateMipmaps), t.push(e.premultiplyAlpha), t.push(e.flipY), t.push(e.unpackAlignment), t.push(e.colorSpace), t.join();
	}
	function te(t, i) {
		let a = r.get(t);
		if (t.isVideoTexture && xe(t), t.isRenderTargetTexture === !1 && t.isExternalTexture !== !0 && t.version > 0 && a.__version !== t.version) {
			let e = t.image;
			if (e === null) W("WebGLRenderer: Texture marked for update but no image data found.");
			else if (e.complete === !1) W("WebGLRenderer: Texture marked for update but image is incomplete");
			else {
				ce(a, t, i);
				return;
			}
		} else t.isExternalTexture && (a.__webglTexture = t.sourceTexture ? t.sourceTexture : null);
		n.bindTexture(e.TEXTURE_2D, a.__webglTexture, e.TEXTURE0 + i);
	}
	function ne(t, i) {
		let a = r.get(t);
		t.isRenderTargetTexture === !1 && t.version > 0 && a.__version !== t.version ? ce(a, t, i) : (t.isExternalTexture && (a.__webglTexture = t.sourceTexture ? t.sourceTexture : null), n.bindTexture(e.TEXTURE_2D_ARRAY, a.__webglTexture, e.TEXTURE0 + i));
	}
	function N(t, i) {
		let a = r.get(t);
		t.isRenderTargetTexture === !1 && t.version > 0 && a.__version !== t.version ? ce(a, t, i) : n.bindTexture(e.TEXTURE_3D, a.__webglTexture, e.TEXTURE0 + i);
	}
	function re(t, i) {
		let a = r.get(t);
		t.isCubeDepthTexture !== !0 && t.version > 0 && a.__version !== t.version ? le(a, t, i) : n.bindTexture(e.TEXTURE_CUBE_MAP, a.__webglTexture, e.TEXTURE0 + i);
	}
	let ie = {
		[Lo]: e.REPEAT,
		[Ro]: e.CLAMP_TO_EDGE,
		[zo]: e.MIRRORED_REPEAT
	}, ae = {
		[Bo]: e.NEAREST,
		[Vo]: e.NEAREST_MIPMAP_NEAREST,
		[Ho]: e.NEAREST_MIPMAP_LINEAR,
		[Uo]: e.LINEAR,
		[Wo]: e.LINEAR_MIPMAP_NEAREST,
		[Go]: e.LINEAR_MIPMAP_LINEAR
	}, oe = {
		512: e.NEVER,
		519: e.ALWAYS,
		513: e.LESS,
		515: e.LEQUAL,
		514: e.EQUAL,
		518: e.GEQUAL,
		516: e.GREATER,
		517: e.NOTEQUAL
	};
	function P(n, a) {
		if (a.type === 1015 && t.has("OES_texture_float_linear") === !1 && (a.magFilter === 1006 || a.magFilter === 1007 || a.magFilter === 1005 || a.magFilter === 1008 || a.minFilter === 1006 || a.minFilter === 1007 || a.minFilter === 1005 || a.minFilter === 1008) && W("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."), e.texParameteri(n, e.TEXTURE_WRAP_S, ie[a.wrapS]), e.texParameteri(n, e.TEXTURE_WRAP_T, ie[a.wrapT]), (n === e.TEXTURE_3D || n === e.TEXTURE_2D_ARRAY) && e.texParameteri(n, e.TEXTURE_WRAP_R, ie[a.wrapR]), e.texParameteri(n, e.TEXTURE_MAG_FILTER, ae[a.magFilter]), e.texParameteri(n, e.TEXTURE_MIN_FILTER, ae[a.minFilter]), a.compareFunction && (e.texParameteri(n, e.TEXTURE_COMPARE_MODE, e.COMPARE_REF_TO_TEXTURE), e.texParameteri(n, e.TEXTURE_COMPARE_FUNC, oe[a.compareFunction])), t.has("EXT_texture_filter_anisotropic") === !0) {
			if (a.magFilter === 1003 || a.minFilter !== 1005 && a.minFilter !== 1008 || a.type === 1015 && t.has("OES_texture_float_linear") === !1) return;
			if (a.anisotropy > 1 || r.get(a).__currentAnisotropy) {
				let o = t.get("EXT_texture_filter_anisotropic");
				e.texParameterf(n, o.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(a.anisotropy, i.getMaxAnisotropy())), r.get(a).__currentAnisotropy = a.anisotropy;
			}
		}
	}
	function F(t, n) {
		let r = !1;
		t.__webglInit === void 0 && (t.__webglInit = !0, n.addEventListener("dispose", C));
		let i = n.source, a = p.get(i);
		a === void 0 && (a = {}, p.set(i, a));
		let s = M(n);
		if (s !== t.__cacheKey) {
			a[s] === void 0 && (a[s] = {
				texture: e.createTexture(),
				usedTimes: 0
			}, o.memory.textures++, r = !0), a[s].usedTimes++;
			let i = a[t.__cacheKey];
			i !== void 0 && (a[t.__cacheKey].usedTimes--, i.usedTimes === 0 && E(n)), t.__cacheKey = s, t.__webglTexture = a[s].texture;
		}
		return r;
	}
	function I(e, t, n) {
		return Math.floor(Math.floor(e / n) / t);
	}
	function se(t, r, i, a) {
		let o = t.updateRanges;
		if (o.length === 0) n.texSubImage2D(e.TEXTURE_2D, 0, 0, 0, r.width, r.height, i, a, r.data);
		else {
			o.sort((e, t) => e.start - t.start);
			let s = 0;
			for (let e = 1; e < o.length; e++) {
				let t = o[s], n = o[e], i = t.start + t.count, a = I(n.start, r.width, 4), c = I(t.start, r.width, 4);
				n.start <= i + 1 && a === c && I(n.start + n.count - 1, r.width, 4) === a ? t.count = Math.max(t.count, n.start + n.count - t.start) : (++s, o[s] = n);
			}
			o.length = s + 1;
			let c = n.getParameter(e.UNPACK_ROW_LENGTH), l = n.getParameter(e.UNPACK_SKIP_PIXELS), u = n.getParameter(e.UNPACK_SKIP_ROWS);
			n.pixelStorei(e.UNPACK_ROW_LENGTH, r.width);
			for (let t = 0, s = o.length; t < s; t++) {
				let s = o[t], c = Math.floor(s.start / 4), l = Math.ceil(s.count / 4), u = c % r.width, d = Math.floor(c / r.width), f = l;
				n.pixelStorei(e.UNPACK_SKIP_PIXELS, u), n.pixelStorei(e.UNPACK_SKIP_ROWS, d), n.texSubImage2D(e.TEXTURE_2D, 0, u, d, f, 1, i, a, r.data);
			}
			t.clearUpdateRanges(), n.pixelStorei(e.UNPACK_ROW_LENGTH, c), n.pixelStorei(e.UNPACK_SKIP_PIXELS, l), n.pixelStorei(e.UNPACK_SKIP_ROWS, u);
		}
	}
	function ce(t, o, s) {
		let c = e.TEXTURE_2D;
		(o.isDataArrayTexture || o.isCompressedArrayTexture) && (c = e.TEXTURE_2D_ARRAY), o.isData3DTexture && (c = e.TEXTURE_3D);
		let l = F(t, o), u = o.source;
		n.bindTexture(c, t.__webglTexture, e.TEXTURE0 + s);
		let f = r.get(u);
		if (u.version !== f.__version || l === !0) {
			if (n.activeTexture(e.TEXTURE0 + s), !(typeof ImageBitmap < "u" && o.image instanceof ImageBitmap)) {
				let t = X.getPrimaries(X.workingColorSpace), r = o.colorSpace === "" ? null : X.getPrimaries(o.colorSpace), i = o.colorSpace === "" || t === r ? e.NONE : e.BROWSER_DEFAULT_WEBGL;
				n.pixelStorei(e.UNPACK_FLIP_Y_WEBGL, o.flipY), n.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL, o.premultiplyAlpha), n.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL, i);
			}
			n.pixelStorei(e.UNPACK_ALIGNMENT, o.unpackAlignment);
			let t = g(o.image, !1, i.maxTextureSize);
			t = Se(o, t);
			let r = a.convert(o.format, o.colorSpace), p = a.convert(o.type), m = b(o.internalFormat, r, p, o.normalized, o.colorSpace, o.isVideoTexture);
			P(c, o);
			let h, y = o.mipmaps, C = o.isVideoTexture !== !0, w = f.__version === void 0 || l === !0, T = u.dataReady, E = S(o, t);
			if (o.isDepthTexture) m = x(o.format === ls, o.type), w && (C ? n.texStorage2D(e.TEXTURE_2D, 1, m, t.width, t.height) : n.texImage2D(e.TEXTURE_2D, 0, m, t.width, t.height, 0, r, p, null));
			else if (o.isDataTexture) {
				if (y.length > 0) {
					C && w && n.texStorage2D(e.TEXTURE_2D, E, m, y[0].width, y[0].height);
					for (let t = 0, i = y.length; t < i; t++) h = y[t], C ? T && n.texSubImage2D(e.TEXTURE_2D, t, 0, 0, h.width, h.height, r, p, h.data) : n.texImage2D(e.TEXTURE_2D, t, m, h.width, h.height, 0, r, p, h.data);
					o.generateMipmaps = !1;
				} else C ? (w && n.texStorage2D(e.TEXTURE_2D, E, m, t.width, t.height), T && se(o, t, r, p)) : n.texImage2D(e.TEXTURE_2D, 0, m, t.width, t.height, 0, r, p, t.data);
			} else if (o.isCompressedTexture) {
				if (o.isCompressedArrayTexture) {
					C && w && n.texStorage3D(e.TEXTURE_2D_ARRAY, E, m, y[0].width, y[0].height, t.depth);
					for (let i = 0, a = y.length; i < a; i++) if (h = y[i], o.format !== 1023) {
						if (r !== null) {
							if (C) {
								if (T) {
									if (o.layerUpdates.size > 0) {
										let t = Dm(h.width, h.height, o.format, o.type);
										for (let a of o.layerUpdates) {
											let o = h.data.subarray(a * t / h.data.BYTES_PER_ELEMENT, (a + 1) * t / h.data.BYTES_PER_ELEMENT);
											n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY, i, 0, 0, a, h.width, h.height, 1, r, o);
										}
									} else n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY, i, 0, 0, 0, h.width, h.height, t.depth, r, h.data);
								}
							} else n.compressedTexImage3D(e.TEXTURE_2D_ARRAY, i, m, h.width, h.height, t.depth, 0, h.data, 0, 0);
						} else W("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");
					} else C ? T && n.texSubImage3D(e.TEXTURE_2D_ARRAY, i, 0, 0, 0, h.width, h.height, t.depth, r, p, h.data) : n.texImage3D(e.TEXTURE_2D_ARRAY, i, m, h.width, h.height, t.depth, 0, r, p, h.data);
					o.layerUpdates.size > 0 && o.clearLayerUpdates();
				} else {
					C && w && n.texStorage2D(e.TEXTURE_2D, E, m, y[0].width, y[0].height);
					for (let t = 0, i = y.length; t < i; t++) h = y[t], o.format === 1023 ? C ? T && n.texSubImage2D(e.TEXTURE_2D, t, 0, 0, h.width, h.height, r, p, h.data) : n.texImage2D(e.TEXTURE_2D, t, m, h.width, h.height, 0, r, p, h.data) : r === null ? W("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()") : C ? T && n.compressedTexSubImage2D(e.TEXTURE_2D, t, 0, 0, h.width, h.height, r, h.data) : n.compressedTexImage2D(e.TEXTURE_2D, t, m, h.width, h.height, 0, h.data);
				}
			} else if (o.isDataArrayTexture) {
				if (C) {
					if (w && n.texStorage3D(e.TEXTURE_2D_ARRAY, E, m, t.width, t.height, t.depth), T) {
						if (o.layerUpdates.size > 0) {
							let i = Dm(t.width, t.height, o.format, o.type);
							for (let a of o.layerUpdates) {
								let o = t.data.subarray(a * i / t.data.BYTES_PER_ELEMENT, (a + 1) * i / t.data.BYTES_PER_ELEMENT);
								n.texSubImage3D(e.TEXTURE_2D_ARRAY, 0, 0, 0, a, t.width, t.height, 1, r, p, o);
							}
							o.clearLayerUpdates();
						} else n.texSubImage3D(e.TEXTURE_2D_ARRAY, 0, 0, 0, 0, t.width, t.height, t.depth, r, p, t.data);
					}
				} else n.texImage3D(e.TEXTURE_2D_ARRAY, 0, m, t.width, t.height, t.depth, 0, r, p, t.data);
			} else if (o.isData3DTexture) C ? (w && n.texStorage3D(e.TEXTURE_3D, E, m, t.width, t.height, t.depth), T && n.texSubImage3D(e.TEXTURE_3D, 0, 0, 0, 0, t.width, t.height, t.depth, r, p, t.data)) : n.texImage3D(e.TEXTURE_3D, 0, m, t.width, t.height, t.depth, 0, r, p, t.data);
			else if (o.isFramebufferTexture) {
				if (w) {
					if (C) n.texStorage2D(e.TEXTURE_2D, E, m, t.width, t.height);
					else {
						let i = t.width, a = t.height;
						for (let t = 0; t < E; t++) n.texImage2D(e.TEXTURE_2D, t, m, i, a, 0, r, p, null), i >>= 1, a >>= 1;
					}
				}
			} else if (o.isHTMLTexture) {
				if ("texElementImage2D" in e) {
					let n = e.canvas;
					if (n.hasAttribute("layoutsubtree") || n.setAttribute("layoutsubtree", "true"), t.parentNode !== n) {
						n.appendChild(t), d.add(o), n.onpaint = (e) => {
							let t = e.changedElements;
							for (let e of d) t.includes(e.image) && (e.needsUpdate = !0);
						}, n.requestPaint();
						return;
					}
					if (e.texElementImage2D.length === 3) e.texElementImage2D(e.TEXTURE_2D, e.RGBA8, t);
					else {
						let n = e.RGBA, r = e.RGBA, i = e.UNSIGNED_BYTE;
						e.texElementImage2D(e.TEXTURE_2D, 0, n, r, i, t);
					}
					e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, e.LINEAR), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, e.CLAMP_TO_EDGE);
				}
			} else if (y.length > 0) {
				if (C && w) {
					let t = Ce(y[0]);
					n.texStorage2D(e.TEXTURE_2D, E, m, t.width, t.height);
				}
				for (let t = 0, i = y.length; t < i; t++) h = y[t], C ? T && n.texSubImage2D(e.TEXTURE_2D, t, 0, 0, r, p, h) : n.texImage2D(e.TEXTURE_2D, t, m, r, p, h);
				o.generateMipmaps = !1;
			} else if (C) {
				if (w) {
					let r = Ce(t);
					n.texStorage2D(e.TEXTURE_2D, E, m, r.width, r.height);
				}
				T && n.texSubImage2D(e.TEXTURE_2D, 0, 0, 0, r, p, t);
			} else n.texImage2D(e.TEXTURE_2D, 0, m, r, p, t);
			_(o) && v(c), f.__version = u.version, o.onUpdate && o.onUpdate(o);
		}
		t.__version = o.version;
	}
	function le(t, o, s) {
		if (o.image.length !== 6) return;
		let c = F(t, o), l = o.source;
		n.bindTexture(e.TEXTURE_CUBE_MAP, t.__webglTexture, e.TEXTURE0 + s);
		let u = r.get(l);
		if (l.version !== u.__version || c === !0) {
			n.activeTexture(e.TEXTURE0 + s);
			let t = X.getPrimaries(X.workingColorSpace), r = o.colorSpace === "" ? null : X.getPrimaries(o.colorSpace), d = o.colorSpace === "" || t === r ? e.NONE : e.BROWSER_DEFAULT_WEBGL;
			n.pixelStorei(e.UNPACK_FLIP_Y_WEBGL, o.flipY), n.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL, o.premultiplyAlpha), n.pixelStorei(e.UNPACK_ALIGNMENT, o.unpackAlignment), n.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL, d);
			let f = o.isCompressedTexture || o.image[0].isCompressedTexture, p = o.image[0] && o.image[0].isDataTexture, m = [];
			for (let e = 0; e < 6; e++) !f && !p ? m[e] = g(o.image[e], !0, i.maxCubemapSize) : m[e] = p ? o.image[e].image : o.image[e], m[e] = Se(o, m[e]);
			let h = m[0], y = a.convert(o.format, o.colorSpace), x = a.convert(o.type), C = b(o.internalFormat, y, x, o.normalized, o.colorSpace), w = o.isVideoTexture !== !0, T = u.__version === void 0 || c === !0, E = l.dataReady, D = S(o, h);
			P(e.TEXTURE_CUBE_MAP, o);
			let O;
			if (f) {
				w && T && n.texStorage2D(e.TEXTURE_CUBE_MAP, D, C, h.width, h.height);
				for (let t = 0; t < 6; t++) {
					O = m[t].mipmaps;
					for (let r = 0; r < O.length; r++) {
						let i = O[r];
						o.format === 1023 ? w ? E && n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + t, r, 0, 0, i.width, i.height, y, x, i.data) : n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + t, r, C, i.width, i.height, 0, y, x, i.data) : y === null ? W("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()") : w ? E && n.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + t, r, 0, 0, i.width, i.height, y, i.data) : n.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + t, r, C, i.width, i.height, 0, i.data);
					}
				}
			} else {
				if (O = o.mipmaps, w && T) {
					O.length > 0 && D++;
					let t = Ce(m[0]);
					n.texStorage2D(e.TEXTURE_CUBE_MAP, D, C, t.width, t.height);
				}
				for (let t = 0; t < 6; t++) if (p) {
					w ? E && n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + t, 0, 0, 0, m[t].width, m[t].height, y, x, m[t].data) : n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + t, 0, C, m[t].width, m[t].height, 0, y, x, m[t].data);
					for (let r = 0; r < O.length; r++) {
						let i = O[r].image[t].image;
						w ? E && n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + t, r + 1, 0, 0, i.width, i.height, y, x, i.data) : n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + t, r + 1, C, i.width, i.height, 0, y, x, i.data);
					}
				} else {
					w ? E && n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + t, 0, 0, 0, y, x, m[t]) : n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + t, 0, C, y, x, m[t]);
					for (let r = 0; r < O.length; r++) {
						let i = O[r];
						w ? E && n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + t, r + 1, 0, 0, y, x, i.image[t]) : n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + t, r + 1, C, y, x, i.image[t]);
					}
				}
			}
			_(o) && v(e.TEXTURE_CUBE_MAP), u.__version = l.version, o.onUpdate && o.onUpdate(o);
		}
		t.__version = o.version;
	}
	function ue(t, i, o, c, l, u) {
		let d = a.convert(o.format, o.colorSpace), f = a.convert(o.type), p = b(o.internalFormat, d, f, o.normalized, o.colorSpace), m = r.get(i), h = r.get(o);
		if (h.__renderTarget = i, !m.__hasExternalTextures) {
			let t = Math.max(1, i.width >> u), r = Math.max(1, i.height >> u);
			l === e.TEXTURE_3D || l === e.TEXTURE_2D_ARRAY ? n.texImage3D(l, u, p, t, r, i.depth, 0, d, f, null) : n.texImage2D(l, u, p, t, r, 0, d, f, null);
		}
		n.bindFramebuffer(e.FRAMEBUFFER, t), L(i) ? s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER, c, l, h.__webglTexture, 0, be(i)) : (l === e.TEXTURE_2D || l >= e.TEXTURE_CUBE_MAP_POSITIVE_X && l <= e.TEXTURE_CUBE_MAP_NEGATIVE_Z) && e.framebufferTexture2D(e.FRAMEBUFFER, c, l, h.__webglTexture, u), n.bindFramebuffer(e.FRAMEBUFFER, null);
	}
	function de(t, n, r) {
		if (e.bindRenderbuffer(e.RENDERBUFFER, t), n.depthBuffer) {
			let i = n.depthTexture, a = i && i.isDepthTexture ? i.type : null, o = x(n.stencilBuffer, a), c = n.stencilBuffer ? e.DEPTH_STENCIL_ATTACHMENT : e.DEPTH_ATTACHMENT;
			L(n) ? s.renderbufferStorageMultisampleEXT(e.RENDERBUFFER, be(n), o, n.width, n.height) : r ? e.renderbufferStorageMultisample(e.RENDERBUFFER, be(n), o, n.width, n.height) : e.renderbufferStorage(e.RENDERBUFFER, o, n.width, n.height), e.framebufferRenderbuffer(e.FRAMEBUFFER, c, e.RENDERBUFFER, t);
		} else {
			let t = n.textures;
			for (let i = 0; i < t.length; i++) {
				let o = t[i], c = a.convert(o.format, o.colorSpace), l = a.convert(o.type), u = b(o.internalFormat, c, l, o.normalized, o.colorSpace);
				L(n) ? s.renderbufferStorageMultisampleEXT(e.RENDERBUFFER, be(n), u, n.width, n.height) : r ? e.renderbufferStorageMultisample(e.RENDERBUFFER, be(n), u, n.width, n.height) : e.renderbufferStorage(e.RENDERBUFFER, u, n.width, n.height);
			}
		}
		e.bindRenderbuffer(e.RENDERBUFFER, null);
	}
	function fe(t, i, o) {
		let c = i.isWebGLCubeRenderTarget === !0;
		if (n.bindFramebuffer(e.FRAMEBUFFER, t), !(i.depthTexture && i.depthTexture.isDepthTexture)) throw Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");
		let l = r.get(i.depthTexture);
		if (l.__renderTarget = i, l.__webglTexture && i.depthTexture.image.width === i.width && i.depthTexture.image.height === i.height || (i.depthTexture.image.width = i.width, i.depthTexture.image.height = i.height, i.depthTexture.needsUpdate = !0), c) {
			if (l.__webglInit === void 0 && (l.__webglInit = !0, i.depthTexture.addEventListener("dispose", C)), l.__webglTexture === void 0) {
				l.__webglTexture = e.createTexture(), n.bindTexture(e.TEXTURE_CUBE_MAP, l.__webglTexture), P(e.TEXTURE_CUBE_MAP, i.depthTexture);
				let t = a.convert(i.depthTexture.format), r = a.convert(i.depthTexture.type), o;
				i.depthTexture.format === 1026 ? o = e.DEPTH_COMPONENT24 : i.depthTexture.format === 1027 && (o = e.DEPTH24_STENCIL8);
				for (let n = 0; n < 6; n++) e.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + n, 0, o, i.width, i.height, 0, t, r, null);
			}
		} else te(i.depthTexture, 0);
		let u = l.__webglTexture, d = be(i), f = c ? e.TEXTURE_CUBE_MAP_POSITIVE_X + o : e.TEXTURE_2D, p = i.depthTexture.format === 1027 ? e.DEPTH_STENCIL_ATTACHMENT : e.DEPTH_ATTACHMENT;
		if (i.depthTexture.format === 1026) L(i) ? s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER, p, f, u, 0, d) : e.framebufferTexture2D(e.FRAMEBUFFER, p, f, u, 0);
		else if (i.depthTexture.format === 1027) L(i) ? s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER, p, f, u, 0, d) : e.framebufferTexture2D(e.FRAMEBUFFER, p, f, u, 0);
		else throw Error("THREE.WebGLTextures: Unknown depthTexture format.");
	}
	function pe(t) {
		let i = r.get(t), a = t.isWebGLCubeRenderTarget === !0;
		if (i.__boundDepthTexture !== t.depthTexture) {
			let e = t.depthTexture;
			if (i.__depthDisposeCallback && i.__depthDisposeCallback(), e) {
				let t = () => {
					delete i.__boundDepthTexture, delete i.__depthDisposeCallback, e.removeEventListener("dispose", t);
				};
				e.addEventListener("dispose", t), i.__depthDisposeCallback = t;
			}
			i.__boundDepthTexture = e;
		}
		if (t.depthTexture && !i.__autoAllocateDepthBuffer) {
			if (a) for (let e = 0; e < 6; e++) fe(i.__webglFramebuffer[e], t, e);
			else {
				let e = t.texture.mipmaps;
				e && e.length > 0 ? fe(i.__webglFramebuffer[0], t, 0) : fe(i.__webglFramebuffer, t, 0);
			}
		} else if (a) {
			i.__webglDepthbuffer = [];
			for (let r = 0; r < 6; r++) if (n.bindFramebuffer(e.FRAMEBUFFER, i.__webglFramebuffer[r]), i.__webglDepthbuffer[r] === void 0) i.__webglDepthbuffer[r] = e.createRenderbuffer(), de(i.__webglDepthbuffer[r], t, !1);
			else {
				let n = t.stencilBuffer ? e.DEPTH_STENCIL_ATTACHMENT : e.DEPTH_ATTACHMENT, a = i.__webglDepthbuffer[r];
				e.bindRenderbuffer(e.RENDERBUFFER, a), e.framebufferRenderbuffer(e.FRAMEBUFFER, n, e.RENDERBUFFER, a);
			}
		} else {
			let r = t.texture.mipmaps;
			if (r && r.length > 0 ? n.bindFramebuffer(e.FRAMEBUFFER, i.__webglFramebuffer[0]) : n.bindFramebuffer(e.FRAMEBUFFER, i.__webglFramebuffer), i.__webglDepthbuffer === void 0) i.__webglDepthbuffer = e.createRenderbuffer(), de(i.__webglDepthbuffer, t, !1);
			else {
				let n = t.stencilBuffer ? e.DEPTH_STENCIL_ATTACHMENT : e.DEPTH_ATTACHMENT, r = i.__webglDepthbuffer;
				e.bindRenderbuffer(e.RENDERBUFFER, r), e.framebufferRenderbuffer(e.FRAMEBUFFER, n, e.RENDERBUFFER, r);
			}
		}
		n.bindFramebuffer(e.FRAMEBUFFER, null);
	}
	function me(t, n, i) {
		let a = r.get(t);
		n !== void 0 && ue(a.__webglFramebuffer, t, t.texture, e.COLOR_ATTACHMENT0, e.TEXTURE_2D, 0), i !== void 0 && pe(t);
	}
	function he(t) {
		let i = t.texture, s = r.get(t), c = r.get(i);
		t.addEventListener("dispose", w);
		let l = t.textures, u = t.isWebGLCubeRenderTarget === !0, d = l.length > 1;
		if (d || (c.__webglTexture === void 0 && (c.__webglTexture = e.createTexture()), c.__version = i.version, o.memory.textures++), u) {
			s.__webglFramebuffer = [];
			for (let t = 0; t < 6; t++) if (i.mipmaps && i.mipmaps.length > 0) {
				s.__webglFramebuffer[t] = [];
				for (let n = 0; n < i.mipmaps.length; n++) s.__webglFramebuffer[t][n] = e.createFramebuffer();
			} else s.__webglFramebuffer[t] = e.createFramebuffer();
		} else {
			if (i.mipmaps && i.mipmaps.length > 0) {
				s.__webglFramebuffer = [];
				for (let t = 0; t < i.mipmaps.length; t++) s.__webglFramebuffer[t] = e.createFramebuffer();
			} else s.__webglFramebuffer = e.createFramebuffer();
			if (d) for (let t = 0, n = l.length; t < n; t++) {
				let n = r.get(l[t]);
				n.__webglTexture === void 0 && (n.__webglTexture = e.createTexture(), o.memory.textures++);
			}
			if (t.samples > 0 && L(t) === !1) {
				s.__webglMultisampledFramebuffer = e.createFramebuffer(), s.__webglColorRenderbuffer = [], n.bindFramebuffer(e.FRAMEBUFFER, s.__webglMultisampledFramebuffer);
				for (let n = 0; n < l.length; n++) {
					let r = l[n];
					s.__webglColorRenderbuffer[n] = e.createRenderbuffer(), e.bindRenderbuffer(e.RENDERBUFFER, s.__webglColorRenderbuffer[n]);
					let i = a.convert(r.format, r.colorSpace), o = a.convert(r.type), c = b(r.internalFormat, i, o, r.normalized, r.colorSpace, t.isXRRenderTarget === !0), u = be(t);
					e.renderbufferStorageMultisample(e.RENDERBUFFER, u, c, t.width, t.height), e.framebufferRenderbuffer(e.FRAMEBUFFER, e.COLOR_ATTACHMENT0 + n, e.RENDERBUFFER, s.__webglColorRenderbuffer[n]);
				}
				e.bindRenderbuffer(e.RENDERBUFFER, null), t.depthBuffer && (s.__webglDepthRenderbuffer = e.createRenderbuffer(), de(s.__webglDepthRenderbuffer, t, !0)), n.bindFramebuffer(e.FRAMEBUFFER, null);
			}
		}
		if (u) {
			n.bindTexture(e.TEXTURE_CUBE_MAP, c.__webglTexture), P(e.TEXTURE_CUBE_MAP, i);
			for (let n = 0; n < 6; n++) if (i.mipmaps && i.mipmaps.length > 0) for (let r = 0; r < i.mipmaps.length; r++) ue(s.__webglFramebuffer[n][r], t, i, e.COLOR_ATTACHMENT0, e.TEXTURE_CUBE_MAP_POSITIVE_X + n, r);
			else ue(s.__webglFramebuffer[n], t, i, e.COLOR_ATTACHMENT0, e.TEXTURE_CUBE_MAP_POSITIVE_X + n, 0);
			_(i) && v(e.TEXTURE_CUBE_MAP), n.unbindTexture();
		} else if (d) {
			for (let i = 0, a = l.length; i < a; i++) {
				let a = l[i], o = r.get(a), c = e.TEXTURE_2D;
				(t.isWebGL3DRenderTarget || t.isWebGLArrayRenderTarget) && (c = t.isWebGL3DRenderTarget ? e.TEXTURE_3D : e.TEXTURE_2D_ARRAY), n.bindTexture(c, o.__webglTexture), P(c, a), ue(s.__webglFramebuffer, t, a, e.COLOR_ATTACHMENT0 + i, c, 0), _(a) && v(c);
			}
			n.unbindTexture();
		} else {
			let r = e.TEXTURE_2D;
			if ((t.isWebGL3DRenderTarget || t.isWebGLArrayRenderTarget) && (r = t.isWebGL3DRenderTarget ? e.TEXTURE_3D : e.TEXTURE_2D_ARRAY), n.bindTexture(r, c.__webglTexture), P(r, i), i.mipmaps && i.mipmaps.length > 0) for (let n = 0; n < i.mipmaps.length; n++) ue(s.__webglFramebuffer[n], t, i, e.COLOR_ATTACHMENT0, r, n);
			else ue(s.__webglFramebuffer, t, i, e.COLOR_ATTACHMENT0, r, 0);
			_(i) && v(r), n.unbindTexture();
		}
		t.depthBuffer && pe(t);
	}
	function ge(e) {
		let t = e.textures;
		for (let i = 0, a = t.length; i < a; i++) {
			let a = t[i];
			if (_(a)) {
				let t = y(e), i = r.get(a).__webglTexture;
				n.bindTexture(t, i), v(t), n.unbindTexture();
			}
		}
	}
	let _e = [], ve = [];
	function ye(t) {
		if (t.samples > 0) {
			if (L(t) === !1) {
				let i = t.textures, a = t.width, o = t.height, s = e.COLOR_BUFFER_BIT, l = t.stencilBuffer ? e.DEPTH_STENCIL_ATTACHMENT : e.DEPTH_ATTACHMENT, u = r.get(t), d = i.length > 1;
				if (d) for (let t = 0; t < i.length; t++) n.bindFramebuffer(e.FRAMEBUFFER, u.__webglMultisampledFramebuffer), e.framebufferRenderbuffer(e.FRAMEBUFFER, e.COLOR_ATTACHMENT0 + t, e.RENDERBUFFER, null), n.bindFramebuffer(e.FRAMEBUFFER, u.__webglFramebuffer), e.framebufferTexture2D(e.DRAW_FRAMEBUFFER, e.COLOR_ATTACHMENT0 + t, e.TEXTURE_2D, null, 0);
				n.bindFramebuffer(e.READ_FRAMEBUFFER, u.__webglMultisampledFramebuffer);
				let f = t.texture.mipmaps;
				f && f.length > 0 ? n.bindFramebuffer(e.DRAW_FRAMEBUFFER, u.__webglFramebuffer[0]) : n.bindFramebuffer(e.DRAW_FRAMEBUFFER, u.__webglFramebuffer);
				for (let n = 0; n < i.length; n++) {
					if (t.resolveDepthBuffer && (t.depthBuffer && (s |= e.DEPTH_BUFFER_BIT), t.stencilBuffer && t.resolveStencilBuffer && (s |= e.STENCIL_BUFFER_BIT)), d) {
						e.framebufferRenderbuffer(e.READ_FRAMEBUFFER, e.COLOR_ATTACHMENT0, e.RENDERBUFFER, u.__webglColorRenderbuffer[n]);
						let t = r.get(i[n]).__webglTexture;
						e.framebufferTexture2D(e.DRAW_FRAMEBUFFER, e.COLOR_ATTACHMENT0, e.TEXTURE_2D, t, 0);
					}
					e.blitFramebuffer(0, 0, a, o, 0, 0, a, o, s, e.NEAREST), c === !0 && (_e.length = 0, ve.length = 0, _e.push(e.COLOR_ATTACHMENT0 + n), t.depthBuffer && t.storeMultisampledDepthBuffer === !1 && (_e.push(l), ve.push(l), e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER, ve)), e.invalidateFramebuffer(e.READ_FRAMEBUFFER, _e));
				}
				if (n.bindFramebuffer(e.READ_FRAMEBUFFER, null), n.bindFramebuffer(e.DRAW_FRAMEBUFFER, null), d) for (let t = 0; t < i.length; t++) {
					n.bindFramebuffer(e.FRAMEBUFFER, u.__webglMultisampledFramebuffer), e.framebufferRenderbuffer(e.FRAMEBUFFER, e.COLOR_ATTACHMENT0 + t, e.RENDERBUFFER, u.__webglColorRenderbuffer[t]);
					let a = r.get(i[t]).__webglTexture;
					n.bindFramebuffer(e.FRAMEBUFFER, u.__webglFramebuffer), e.framebufferTexture2D(e.DRAW_FRAMEBUFFER, e.COLOR_ATTACHMENT0 + t, e.TEXTURE_2D, a, 0);
				}
				n.bindFramebuffer(e.DRAW_FRAMEBUFFER, u.__webglMultisampledFramebuffer);
			} else if (t.depthBuffer && t.storeMultisampledDepthBuffer === !1 && c) {
				let n = t.stencilBuffer ? e.DEPTH_STENCIL_ATTACHMENT : e.DEPTH_ATTACHMENT;
				e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER, [n]);
			}
		}
	}
	function be(e) {
		return Math.min(i.maxSamples, e.samples);
	}
	function L(e) {
		let n = r.get(e);
		return e.samples > 0 && t.has("WEBGL_multisampled_render_to_texture") === !0 && n.__useRenderToTexture !== !1;
	}
	function xe(e) {
		let t = o.render.frame;
		u.get(e) !== t && (u.set(e, t), e.update());
	}
	function Se(e, t) {
		let n = e.colorSpace, r = e.format, i = e.type;
		return e.isCompressedTexture === !0 || e.isVideoTexture === !0 || n !== "srgb-linear" && n !== "" && (X.getTransfer(n) === "srgb" ? (r !== 1023 || i !== 1009) && W("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.") : G("WebGLTextures: Unsupported texture color space:", n)), t;
	}
	function Ce(e) {
		return typeof HTMLImageElement < "u" && e instanceof HTMLImageElement ? (l.width = e.naturalWidth || e.width, l.height = e.naturalHeight || e.height) : typeof VideoFrame < "u" && e instanceof VideoFrame ? (l.width = e.displayWidth, l.height = e.displayHeight) : (l.width = e.width, l.height = e.height), l;
	}
	this.allocateTextureUnit = ee, this.resetTextureUnits = k, this.getTextureUnits = A, this.setTextureUnits = j, this.setTexture2D = te, this.setTexture2DArray = ne, this.setTexture3D = N, this.setTextureCube = re, this.rebindTextures = me, this.setupRenderTarget = he, this.updateRenderTargetMipmap = ge, this.updateMultisampleRenderTarget = ye, this.setupDepthRenderbuffer = pe, this.setupFrameBufferTexture = ue, this.useMultisampledRTT = L, this.isReversedDepthBuffer = function() {
		return n.buffers.depth.getReversed();
	};
}
function N_(e, t) {
	function n(n, r = "") {
		let i, a = X.getTransfer(r);
		if (n === 1009) return e.UNSIGNED_BYTE;
		if (n === 1017) return e.UNSIGNED_SHORT_4_4_4_4;
		if (n === 1018) return e.UNSIGNED_SHORT_5_5_5_1;
		if (n === 35902) return e.UNSIGNED_INT_5_9_9_9_REV;
		if (n === 35899) return e.UNSIGNED_INT_10F_11F_11F_REV;
		if (n === 1010) return e.BYTE;
		if (n === 1011) return e.SHORT;
		if (n === 1012) return e.UNSIGNED_SHORT;
		if (n === 1013) return e.INT;
		if (n === 1014) return e.UNSIGNED_INT;
		if (n === 1015) return e.FLOAT;
		if (n === 1016) return e.HALF_FLOAT;
		if (n === 1021) return e.ALPHA;
		if (n === 1022) return e.RGB;
		if (n === 1023) return e.RGBA;
		if (n === 1026) return e.DEPTH_COMPONENT;
		if (n === 1027) return e.DEPTH_STENCIL;
		if (n === 1028) return e.RED;
		if (n === 1029) return e.RED_INTEGER;
		if (n === 1030) return e.RG;
		if (n === 1031) return e.RG_INTEGER;
		if (n === 1033) return e.RGBA_INTEGER;
		if (n === 33776 || n === 33777 || n === 33778 || n === 33779) {
			if (a === "srgb") {
				if (i = t.get("WEBGL_compressed_texture_s3tc_srgb"), i !== null) {
					if (n === 33776) return i.COMPRESSED_SRGB_S3TC_DXT1_EXT;
					if (n === 33777) return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;
					if (n === 33778) return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;
					if (n === 33779) return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT;
				} else return null;
			} else if (i = t.get("WEBGL_compressed_texture_s3tc"), i !== null) {
				if (n === 33776) return i.COMPRESSED_RGB_S3TC_DXT1_EXT;
				if (n === 33777) return i.COMPRESSED_RGBA_S3TC_DXT1_EXT;
				if (n === 33778) return i.COMPRESSED_RGBA_S3TC_DXT3_EXT;
				if (n === 33779) return i.COMPRESSED_RGBA_S3TC_DXT5_EXT;
			} else return null;
		}
		if (n === 35840 || n === 35841 || n === 35842 || n === 35843) {
			if (i = t.get("WEBGL_compressed_texture_pvrtc"), i !== null) {
				if (n === 35840) return i.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
				if (n === 35841) return i.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
				if (n === 35842) return i.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
				if (n === 35843) return i.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;
			} else return null;
		}
		if (n === 36196 || n === 37492 || n === 37496 || n === 37488 || n === 37489 || n === 37490 || n === 37491) {
			if (i = t.get("WEBGL_compressed_texture_etc"), i !== null) {
				if (n === 36196 || n === 37492) return a === "srgb" ? i.COMPRESSED_SRGB8_ETC2 : i.COMPRESSED_RGB8_ETC2;
				if (n === 37496) return a === "srgb" ? i.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC : i.COMPRESSED_RGBA8_ETC2_EAC;
				if (n === 37488) return i.COMPRESSED_R11_EAC;
				if (n === 37489) return i.COMPRESSED_SIGNED_R11_EAC;
				if (n === 37490) return i.COMPRESSED_RG11_EAC;
				if (n === 37491) return i.COMPRESSED_SIGNED_RG11_EAC;
			} else return null;
		}
		if (n === 37808 || n === 37809 || n === 37810 || n === 37811 || n === 37812 || n === 37813 || n === 37814 || n === 37815 || n === 37816 || n === 37817 || n === 37818 || n === 37819 || n === 37820 || n === 37821) {
			if (i = t.get("WEBGL_compressed_texture_astc"), i !== null) {
				if (n === 37808) return a === "srgb" ? i.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR : i.COMPRESSED_RGBA_ASTC_4x4_KHR;
				if (n === 37809) return a === "srgb" ? i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR : i.COMPRESSED_RGBA_ASTC_5x4_KHR;
				if (n === 37810) return a === "srgb" ? i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR : i.COMPRESSED_RGBA_ASTC_5x5_KHR;
				if (n === 37811) return a === "srgb" ? i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR : i.COMPRESSED_RGBA_ASTC_6x5_KHR;
				if (n === 37812) return a === "srgb" ? i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR : i.COMPRESSED_RGBA_ASTC_6x6_KHR;
				if (n === 37813) return a === "srgb" ? i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR : i.COMPRESSED_RGBA_ASTC_8x5_KHR;
				if (n === 37814) return a === "srgb" ? i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR : i.COMPRESSED_RGBA_ASTC_8x6_KHR;
				if (n === 37815) return a === "srgb" ? i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR : i.COMPRESSED_RGBA_ASTC_8x8_KHR;
				if (n === 37816) return a === "srgb" ? i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR : i.COMPRESSED_RGBA_ASTC_10x5_KHR;
				if (n === 37817) return a === "srgb" ? i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR : i.COMPRESSED_RGBA_ASTC_10x6_KHR;
				if (n === 37818) return a === "srgb" ? i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR : i.COMPRESSED_RGBA_ASTC_10x8_KHR;
				if (n === 37819) return a === "srgb" ? i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR : i.COMPRESSED_RGBA_ASTC_10x10_KHR;
				if (n === 37820) return a === "srgb" ? i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR : i.COMPRESSED_RGBA_ASTC_12x10_KHR;
				if (n === 37821) return a === "srgb" ? i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR : i.COMPRESSED_RGBA_ASTC_12x12_KHR;
			} else return null;
		}
		if (n === 36492 || n === 36494 || n === 36495) {
			if (i = t.get("EXT_texture_compression_bptc"), i !== null) {
				if (n === 36492) return a === "srgb" ? i.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT : i.COMPRESSED_RGBA_BPTC_UNORM_EXT;
				if (n === 36494) return i.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;
				if (n === 36495) return i.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT;
			} else return null;
		}
		if (n === 36283 || n === 36284 || n === 36285 || n === 36286) {
			if (i = t.get("EXT_texture_compression_rgtc"), i !== null) {
				if (n === 36283) return i.COMPRESSED_RED_RGTC1_EXT;
				if (n === 36284) return i.COMPRESSED_SIGNED_RED_RGTC1_EXT;
				if (n === 36285) return i.COMPRESSED_RED_GREEN_RGTC2_EXT;
				if (n === 36286) return i.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT;
			} else return null;
		}
		return n === 1020 ? e.UNSIGNED_INT_24_8 : e[n] === void 0 ? null : e[n];
	}
	return { convert: n };
}
var P_ = "\nvoid main() {\n\n	gl_Position = vec4( position, 1.0 );\n\n}", F_ = "\nuniform sampler2DArray depthColor;\nuniform float depthWidth;\nuniform float depthHeight;\n\nvoid main() {\n\n	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );\n\n	if ( coord.x >= 1.0 ) {\n\n		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;\n\n	} else {\n\n		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;\n\n	}\n\n}", I_ = class {
	constructor() {
		this.texture = null, this.mesh = null, this.depthNear = 0, this.depthFar = 0;
	}
	init(e, t) {
		if (this.texture === null) {
			let n = new Nd(e.texture);
			(e.depthNear !== t.depthNear || e.depthFar !== t.depthFar) && (this.depthNear = e.depthNear, this.depthFar = e.depthFar), this.texture = n;
		}
	}
	getMesh(e) {
		if (this.texture !== null && this.mesh === null) {
			let t = e.cameras[0].viewport, n = new bp({
				vertexShader: P_,
				fragmentShader: F_,
				uniforms: {
					depthColor: { value: this.texture },
					depthWidth: { value: t.z },
					depthHeight: { value: t.w }
				}
			});
			this.mesh = new ed(new sp(20, 20), n);
		}
		return this.mesh;
	}
	reset() {
		this.texture = null, this.mesh = null;
	}
	getDepthTexture() {
		return this.texture;
	}
}, L_ = class extends Cc {
	constructor(e, t) {
		super();
		let n = this, r = null, i = 1, a = null, o = "local-floor", s = 1, c = null, l = null, u = null, d = null, f = null, p = null, m = typeof XRWebGLBinding < "u", h = new I_(), g = {}, _ = t.getContextAttributes(), v = null, y = null, b = [], x = [], S = new q(), C = null, w = null, T = new rm();
		T.viewport = new Yc();
		let E = new rm();
		E.viewport = new Yc();
		let D = [T, E], O = new um(), k = null, A = null;
		this.cameraAutoUpdate = !0, this.enabled = !1, this.isPresenting = !1, this.getController = function(e) {
			let t = b[e];
			return t === void 0 && (t = new Al(), b[e] = t), t.getTargetRaySpace();
		}, this.getControllerGrip = function(e) {
			let t = b[e];
			return t === void 0 && (t = new Al(), b[e] = t), t.getGripSpace();
		}, this.getHand = function(e) {
			let t = b[e];
			return t === void 0 && (t = new Al(), b[e] = t), t.getHandSpace();
		};
		function j(e) {
			let t = x.indexOf(e.inputSource);
			if (t === -1) return;
			let n = b[t];
			n !== void 0 && (n.update(e.inputSource, e.frame, c || a), n.dispatchEvent({
				type: e.type,
				data: e.inputSource
			}));
		}
		function ee() {
			r.removeEventListener("select", j), r.removeEventListener("selectstart", j), r.removeEventListener("selectend", j), r.removeEventListener("squeeze", j), r.removeEventListener("squeezestart", j), r.removeEventListener("squeezeend", j), r.removeEventListener("end", ee), r.removeEventListener("inputsourceschange", M);
			for (let e = 0; e < b.length; e++) {
				let t = x[e];
				t !== null && (x[e] = null, b[e].disconnect(t));
			}
			k = null, A = null, h.reset();
			for (let e in g) delete g[e];
			if (e.setRenderTarget(v), f = null, d = null, u = null, r = null, y = null, P.stop(), n.isPresenting = !1, e.setPixelRatio(C), e.setSize(S.width, S.height, !1), w !== null) {
				let e = w.camera;
				e.fov = w.fov, e.zoom = w.zoom, e.updateProjectionMatrix(), w = null;
			}
			n.dispatchEvent({ type: "sessionend" });
		}
		this.setFramebufferScaleFactor = function(e) {
			i = e, n.isPresenting === !0 && W("WebXRManager: Cannot change framebuffer scale while presenting.");
		}, this.setReferenceSpaceType = function(e) {
			o = e, n.isPresenting === !0 && W("WebXRManager: Cannot change reference space type while presenting.");
		}, this.getReferenceSpace = function() {
			return c || a;
		}, this.setReferenceSpace = function(e) {
			c = e;
		}, this.getBaseLayer = function() {
			return d === null ? f : d;
		}, this.getBinding = function() {
			return u === null && m && (u = new XRWebGLBinding(r, t)), u;
		}, this.getFrame = function() {
			return p;
		}, this.getSession = function() {
			return r;
		}, this.setSession = async function(l) {
			if (r = l, r !== null) {
				if (v = e.getRenderTarget(), r.addEventListener("select", j), r.addEventListener("selectstart", j), r.addEventListener("selectend", j), r.addEventListener("squeeze", j), r.addEventListener("squeezestart", j), r.addEventListener("squeezeend", j), r.addEventListener("end", ee), r.addEventListener("inputsourceschange", M), _.xrCompatible !== !0 && await t.makeXRCompatible(), C = e.getPixelRatio(), e.getSize(S), m && "createProjectionLayer" in XRWebGLBinding.prototype) {
					let n = null, a = null, o = null;
					_.depth && (o = _.stencil ? t.DEPTH24_STENCIL8 : t.DEPTH_COMPONENT24, n = _.stencil ? ls : cs, a = _.stencil ? ns : Zo);
					let s = {
						colorFormat: t.RGBA8,
						depthFormat: o,
						scaleFactor: i
					};
					u = this.getBinding(), d = u.createProjectionLayer(s), r.updateRenderState({ layers: [d] }), e.setPixelRatio(1), e.setSize(d.textureWidth, d.textureHeight, !1), y = new Zc(d.textureWidth, d.textureHeight, {
						format: ss,
						type: Ko,
						depthTexture: new jd(d.textureWidth, d.textureHeight, a, void 0, void 0, void 0, void 0, void 0, void 0, n),
						stencilBuffer: _.stencil,
						colorSpace: e.outputColorSpace,
						samples: _.antialias ? 4 : 0,
						resolveDepthBuffer: d.ignoreDepthValues === !1,
						resolveStencilBuffer: d.ignoreDepthValues === !1,
						storeMultisampledDepthBuffer: d.ignoreDepthValues === !1,
						storeMultisampledStencilBuffer: d.ignoreDepthValues === !1
					});
				} else {
					let n = {
						antialias: _.antialias,
						alpha: !0,
						depth: _.depth,
						stencil: _.stencil,
						framebufferScaleFactor: i
					};
					f = new XRWebGLLayer(r, t, n), r.updateRenderState({ baseLayer: f }), e.setPixelRatio(1), e.setSize(f.framebufferWidth, f.framebufferHeight, !1), y = new Zc(f.framebufferWidth, f.framebufferHeight, {
						format: ss,
						type: Ko,
						colorSpace: e.outputColorSpace,
						stencilBuffer: _.stencil,
						resolveDepthBuffer: f.ignoreDepthValues === !1,
						resolveStencilBuffer: f.ignoreDepthValues === !1,
						storeMultisampledDepthBuffer: f.ignoreDepthValues === !1,
						storeMultisampledStencilBuffer: f.ignoreDepthValues === !1
					});
				}
				y.isXRRenderTarget = !0, this.setFoveation(s), c = null, a = await r.requestReferenceSpace(o), P.setContext(r), P.start(), n.isPresenting = !0, n.dispatchEvent({ type: "sessionstart" });
			}
		}, this.getEnvironmentBlendMode = function() {
			if (r !== null) return r.environmentBlendMode;
		}, this.getDepthTexture = function() {
			return h.getDepthTexture();
		};
		function M(e) {
			for (let t = 0; t < e.removed.length; t++) {
				let n = e.removed[t], r = x.indexOf(n);
				r >= 0 && (x[r] = null, b[r].disconnect(n));
			}
			for (let t = 0; t < e.added.length; t++) {
				let n = e.added[t], r = x.indexOf(n);
				if (r === -1) {
					for (let e = 0; e < b.length; e++) if (e >= x.length) {
						x.push(n), r = e;
						break;
					} else if (x[e] === null) {
						x[e] = n, r = e;
						break;
					}
					if (r === -1) break;
				}
				let i = b[r];
				i && i.connect(n);
			}
		}
		let te = new J(), ne = new J();
		function N(e, t, n) {
			te.setFromMatrixPosition(t.matrixWorld), ne.setFromMatrixPosition(n.matrixWorld);
			let r = te.distanceTo(ne), i = t.projectionMatrix.elements, a = n.projectionMatrix.elements, o = i[14] / (i[10] - 1), s = i[14] / (i[10] + 1), c = (i[9] + 1) / i[5], l = (i[9] - 1) / i[5], u = (i[8] - 1) / i[0], d = (a[8] + 1) / a[0], f = o * u, p = o * d, m = r / (-u + d), h = m * -u;
			if (t.matrixWorld.decompose(e.position, e.quaternion, e.scale), e.translateX(h), e.translateZ(m), e.matrixWorld.compose(e.position, e.quaternion, e.scale), e.matrixWorldInverse.copy(e.matrixWorld).invert(), i[10] === -1) e.projectionMatrix.copy(t.projectionMatrix), e.projectionMatrixInverse.copy(t.projectionMatrixInverse);
			else {
				let t = o + m, n = s + m, i = f - h, a = p + (r - h), u = c * s / n * t, d = l * s / n * t;
				e.projectionMatrix.makePerspective(i, a, u, d, t, n), e.projectionMatrixInverse.copy(e.projectionMatrix).invert();
			}
		}
		function re(e, t) {
			t === null ? e.matrixWorld.copy(e.matrix) : e.matrixWorld.multiplyMatrices(t.matrixWorld, e.matrix), e.matrixWorldInverse.copy(e.matrixWorld).invert();
		}
		this.updateCamera = function(e) {
			if (r === null) return;
			let t = e.near, n = e.far;
			h.texture !== null && (h.depthNear > 0 && (t = h.depthNear), h.depthFar > 0 && (n = h.depthFar)), O.near = E.near = T.near = t, O.far = E.far = T.far = n, (k !== O.near || A !== O.far) && (r.updateRenderState({
				depthNear: O.near,
				depthFar: O.far
			}), k = O.near, A = O.far), O.layers.mask = e.layers.mask | 6, T.layers.mask = O.layers.mask & -5, E.layers.mask = O.layers.mask & -3;
			let i = e.parent, a = O.cameras;
			re(O, i);
			for (let e = 0; e < a.length; e++) re(a[e], i);
			a.length === 2 ? N(O, T, E) : O.projectionMatrix.copy(T.projectionMatrix), w === null && e.isPerspectiveCamera && (w = {
				camera: e,
				fov: e.fov,
				zoom: e.zoom
			}), ie(e, O, i);
		};
		function ie(e, t, n) {
			n === null ? e.matrix.copy(t.matrixWorld) : (e.matrix.copy(n.matrixWorld), e.matrix.invert(), e.matrix.multiply(t.matrixWorld)), e.matrix.decompose(e.position, e.quaternion, e.scale), e.updateMatrixWorld(!0), e.projectionMatrix.copy(t.projectionMatrix), e.projectionMatrixInverse.copy(t.projectionMatrixInverse), e.isPerspectiveCamera && (e.fov = Ec * 2 * Math.atan(1 / e.projectionMatrix.elements[5]), e.zoom = 1);
		}
		this.getCamera = function() {
			return O;
		}, this.getFoveation = function() {
			if (d !== null || f !== null) return s;
		}, this.setFoveation = function(e) {
			s = e, d !== null && (d.fixedFoveation = e), f !== null && f.fixedFoveation !== void 0 && (f.fixedFoveation = e);
		}, this.hasDepthSensing = function() {
			return h.texture !== null;
		}, this.getDepthSensingMesh = function() {
			return h.getMesh(O);
		}, this.getCameraTexture = function(e) {
			return g[e];
		};
		let ae = null;
		function oe(t, i) {
			if (l = i.getViewerPose(c || a), p = i, l !== null) {
				let t = l.views;
				f !== null && (e.setRenderTargetFramebuffer(y, f.framebuffer), e.setRenderTarget(y));
				let i = !1;
				t.length !== O.cameras.length && (O.cameras.length = 0, i = !0);
				for (let n = 0; n < t.length; n++) {
					let r = t[n], a = null;
					if (f !== null) a = f.getViewport(r);
					else {
						let t = u.getViewSubImage(d, r);
						a = t.viewport, n === 0 && (e.setRenderTargetTextures(y, t.colorTexture, t.depthStencilTexture), e.setRenderTarget(y));
					}
					let o = D[n];
					o === void 0 && (o = new rm(), o.layers.enable(n), o.viewport = new Yc(), D[n] = o), o.matrix.fromArray(r.transform.matrix), o.matrix.decompose(o.position, o.quaternion, o.scale), o.projectionMatrix.fromArray(r.projectionMatrix), o.projectionMatrixInverse.copy(o.projectionMatrix).invert(), o.viewport.set(a.x, a.y, a.width, a.height), n === 0 && (O.matrix.copy(o.matrix), O.matrix.decompose(O.position, O.quaternion, O.scale)), i === !0 && O.cameras.push(o);
				}
				let a = r.enabledFeatures;
				if (a && a.includes("depth-sensing") && r.depthUsage == "gpu-optimized" && m) {
					u = n.getBinding();
					let e = u.getDepthInformation(t[0]);
					e && e.isValid && e.texture && h.init(e, r.renderState);
				}
				if (a && a.includes("camera-access") && m) {
					e.state.unbindTexture(), u = n.getBinding();
					for (let e = 0; e < t.length; e++) {
						let n = t[e].camera;
						if (n) {
							let e = g[n];
							e || (e = new Nd(), g[n] = e);
							let t = u.getCameraImage(n);
							e.sourceTexture = t;
						}
					}
				}
			}
			for (let e = 0; e < b.length; e++) {
				let t = x[e], n = b[e];
				t !== null && n !== void 0 && n.update(t, i, c || a);
			}
			ae && ae(t, i), i.detectedPlanes && n.dispatchEvent({
				type: "planesdetected",
				data: i
			}), p = null;
		}
		let P = new km();
		P.setAnimationLoop(oe), this.setAnimationLoop = function(e) {
			ae = e;
		}, this.dispose = function() {};
	}
}, R_ = /*@__PURE__*/ new el(), z_ = /*@__PURE__*/ new Y();
z_.set(-1, 0, 0, 0, 1, 0, 0, 0, 1);
function B_(e, t) {
	function n(e, t) {
		e.matrixAutoUpdate === !0 && e.updateMatrix(), t.value.copy(e.matrix);
	}
	function r(t, n) {
		n.color.getRGB(t.fogColor.value, gp(e)), n.isFog ? (t.fogNear.value = n.near, t.fogFar.value = n.far) : n.isFogExp2 && (t.fogDensity.value = n.density);
	}
	function i(e, t, n, r, i) {
		t.isNodeMaterial ? t.uniformsNeedUpdate = !1 : t.isMeshBasicMaterial ? a(e, t) : t.isMeshLambertMaterial ? (a(e, t), t.envMap && (e.envMapIntensity.value = t.envMapIntensity)) : t.isMeshToonMaterial ? (a(e, t), d(e, t)) : t.isMeshPhongMaterial ? (a(e, t), u(e, t), t.envMap && (e.envMapIntensity.value = t.envMapIntensity)) : t.isMeshStandardMaterial ? (a(e, t), f(e, t), t.isMeshPhysicalMaterial && p(e, t, i)) : t.isMeshMatcapMaterial ? (a(e, t), m(e, t)) : t.isMeshDepthMaterial ? a(e, t) : t.isMeshDistanceMaterial ? (a(e, t), h(e, t)) : t.isMeshNormalMaterial ? a(e, t) : t.isLineBasicMaterial ? (o(e, t), t.isLineDashedMaterial && s(e, t)) : t.isPointsMaterial ? c(e, t, n, r) : t.isSpriteMaterial ? l(e, t) : t.isShadowMaterial ? (e.color.value.copy(t.color), e.opacity.value = t.opacity) : t.isShaderMaterial && (t.uniformsNeedUpdate = !1);
	}
	function a(e, r) {
		e.opacity.value = r.opacity, r.color && e.diffuse.value.copy(r.color), r.emissive && e.emissive.value.copy(r.emissive).multiplyScalar(r.emissiveIntensity), r.map && (e.map.value = r.map, n(r.map, e.mapTransform)), r.alphaMap && (e.alphaMap.value = r.alphaMap, n(r.alphaMap, e.alphaMapTransform)), r.bumpMap && (e.bumpMap.value = r.bumpMap, n(r.bumpMap, e.bumpMapTransform), e.bumpScale.value = r.bumpScale, r.side === 1 && (e.bumpScale.value *= -1)), r.normalMap && (e.normalMap.value = r.normalMap, n(r.normalMap, e.normalMapTransform), e.normalScale.value.copy(r.normalScale), r.side === 1 && e.normalScale.value.negate()), r.displacementMap && (e.displacementMap.value = r.displacementMap, n(r.displacementMap, e.displacementMapTransform), e.displacementScale.value = r.displacementScale, e.displacementBias.value = r.displacementBias), r.emissiveMap && (e.emissiveMap.value = r.emissiveMap, n(r.emissiveMap, e.emissiveMapTransform)), r.specularMap && (e.specularMap.value = r.specularMap, n(r.specularMap, e.specularMapTransform)), r.alphaTest > 0 && (e.alphaTest.value = r.alphaTest);
		let i = t.get(r), a = i.envMap, o = i.envMapRotation;
		a && (e.envMap.value = a, e.envMapRotation.value.setFromMatrix4(R_.makeRotationFromEuler(o)).transpose(), a.isCubeTexture && a.isRenderTargetTexture === !1 && e.envMapRotation.value.premultiply(z_), e.reflectivity.value = r.reflectivity, e.ior.value = r.ior, e.refractionRatio.value = r.refractionRatio), r.lightMap && (e.lightMap.value = r.lightMap, e.lightMapIntensity.value = r.lightMapIntensity, n(r.lightMap, e.lightMapTransform)), r.aoMap && (e.aoMap.value = r.aoMap, e.aoMapIntensity.value = r.aoMapIntensity, n(r.aoMap, e.aoMapTransform));
	}
	function o(e, t) {
		e.diffuse.value.copy(t.color), e.opacity.value = t.opacity, t.map && (e.map.value = t.map, n(t.map, e.mapTransform));
	}
	function s(e, t) {
		e.dashSize.value = t.dashSize, e.totalSize.value = t.dashSize + t.gapSize, e.scale.value = t.scale;
	}
	function c(e, t, r, i) {
		e.diffuse.value.copy(t.color), e.opacity.value = t.opacity, e.size.value = t.size * r, e.scale.value = i * .5, t.map && (e.map.value = t.map, n(t.map, e.uvTransform)), t.alphaMap && (e.alphaMap.value = t.alphaMap, n(t.alphaMap, e.alphaMapTransform)), t.alphaTest > 0 && (e.alphaTest.value = t.alphaTest);
	}
	function l(e, t) {
		e.diffuse.value.copy(t.color), e.opacity.value = t.opacity, e.rotation.value = t.rotation, t.map && (e.map.value = t.map, n(t.map, e.mapTransform)), t.alphaMap && (e.alphaMap.value = t.alphaMap, n(t.alphaMap, e.alphaMapTransform)), t.alphaTest > 0 && (e.alphaTest.value = t.alphaTest);
	}
	function u(e, t) {
		e.specular.value.copy(t.specular), e.shininess.value = Math.max(t.shininess, 1e-4);
	}
	function d(e, t) {
		t.gradientMap && (e.gradientMap.value = t.gradientMap);
	}
	function f(e, t) {
		e.metalness.value = t.metalness, t.metalnessMap && (e.metalnessMap.value = t.metalnessMap, n(t.metalnessMap, e.metalnessMapTransform)), e.roughness.value = t.roughness, t.roughnessMap && (e.roughnessMap.value = t.roughnessMap, n(t.roughnessMap, e.roughnessMapTransform)), t.envMap && (e.envMapIntensity.value = t.envMapIntensity);
	}
	function p(e, t, r) {
		e.ior.value = t.ior, t.sheen > 0 && (e.sheenColor.value.copy(t.sheenColor).multiplyScalar(t.sheen), e.sheenRoughness.value = t.sheenRoughness, t.sheenColorMap && (e.sheenColorMap.value = t.sheenColorMap, n(t.sheenColorMap, e.sheenColorMapTransform)), t.sheenRoughnessMap && (e.sheenRoughnessMap.value = t.sheenRoughnessMap, n(t.sheenRoughnessMap, e.sheenRoughnessMapTransform))), t.clearcoat > 0 && (e.clearcoat.value = t.clearcoat, e.clearcoatRoughness.value = t.clearcoatRoughness, t.clearcoatMap && (e.clearcoatMap.value = t.clearcoatMap, n(t.clearcoatMap, e.clearcoatMapTransform)), t.clearcoatRoughnessMap && (e.clearcoatRoughnessMap.value = t.clearcoatRoughnessMap, n(t.clearcoatRoughnessMap, e.clearcoatRoughnessMapTransform)), t.clearcoatNormalMap && (e.clearcoatNormalMap.value = t.clearcoatNormalMap, n(t.clearcoatNormalMap, e.clearcoatNormalMapTransform), e.clearcoatNormalScale.value.copy(t.clearcoatNormalScale), t.side === 1 && e.clearcoatNormalScale.value.negate())), t.dispersion > 0 && (e.dispersion.value = t.dispersion), t.retroreflectivity > 0 && (e.retroreflectivity.value = t.retroreflectivity), t.iridescence > 0 && (e.iridescence.value = t.iridescence, e.iridescenceIOR.value = t.iridescenceIOR, e.iridescenceThicknessMinimum.value = t.iridescenceThicknessRange[0], e.iridescenceThicknessMaximum.value = t.iridescenceThicknessRange[1], t.iridescenceMap && (e.iridescenceMap.value = t.iridescenceMap, n(t.iridescenceMap, e.iridescenceMapTransform)), t.iridescenceThicknessMap && (e.iridescenceThicknessMap.value = t.iridescenceThicknessMap, n(t.iridescenceThicknessMap, e.iridescenceThicknessMapTransform))), t.transmission > 0 && (e.transmission.value = t.transmission, e.transmissionSamplerMap.value = r.texture, e.transmissionSamplerSize.value.set(r.width, r.height), t.transmissionMap && (e.transmissionMap.value = t.transmissionMap, n(t.transmissionMap, e.transmissionMapTransform)), e.thickness.value = t.thickness, t.thicknessMap && (e.thicknessMap.value = t.thicknessMap, n(t.thicknessMap, e.thicknessMapTransform)), e.attenuationDistance.value = t.attenuationDistance, e.attenuationColor.value.copy(t.attenuationColor)), t.anisotropy > 0 && (e.anisotropyVector.value.set(t.anisotropy * Math.cos(t.anisotropyRotation), t.anisotropy * Math.sin(t.anisotropyRotation)), t.anisotropyMap && (e.anisotropyMap.value = t.anisotropyMap, n(t.anisotropyMap, e.anisotropyMapTransform))), e.specularIntensity.value = t.specularIntensity, e.specularColor.value.copy(t.specularColor), t.specularColorMap && (e.specularColorMap.value = t.specularColorMap, n(t.specularColorMap, e.specularColorMapTransform)), t.specularIntensityMap && (e.specularIntensityMap.value = t.specularIntensityMap, n(t.specularIntensityMap, e.specularIntensityMapTransform));
	}
	function m(e, t) {
		t.matcap && (e.matcap.value = t.matcap);
	}
	function h(e, n) {
		let r = t.get(n).light;
		e.referencePosition.value.setFromMatrixPosition(r.matrixWorld), e.nearDistance.value = r.shadow.camera.near, e.farDistance.value = r.shadow.camera.far;
	}
	return {
		refreshFogUniforms: r,
		refreshMaterialUniforms: i
	};
}
function V_(e, t, n, r) {
	let i = {}, a = {}, o = [], s = e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS);
	function c(e, t) {
		let n = t.program;
		r.uniformBlockBinding(e, n);
	}
	function l(e, n) {
		let o = i[e.id];
		o === void 0 && (g(e), o = u(e), i[e.id] = o, e.addEventListener("dispose", v));
		let s = n.program;
		r.updateUBOMapping(e, s);
		let c = t.render.frame;
		a[e.id] !== c && (f(e), a[e.id] = c);
	}
	function u(t) {
		let n = d();
		t.__bindingPointIndex = n;
		let r = e.createBuffer(), i = t.__size, a = t.usage;
		return e.bindBuffer(e.UNIFORM_BUFFER, r), e.bufferData(e.UNIFORM_BUFFER, i, a), e.bindBuffer(e.UNIFORM_BUFFER, null), e.bindBufferBase(e.UNIFORM_BUFFER, n, r), r;
	}
	function d() {
		for (let e = 0; e < s; e++) if (o.indexOf(e) === -1) return o.push(e), e;
		return G("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."), 0;
	}
	function f(t) {
		let n = i[t.id], r = t.uniforms, a = t.__cache;
		e.bindBuffer(e.UNIFORM_BUFFER, n);
		for (let e = 0, t = r.length; e < t; e++) {
			let t = r[e];
			if (Array.isArray(t)) for (let n = 0, r = t.length; n < r; n++) p(t[n], e, n, a);
			else p(t, e, 0, a);
		}
		e.bindBuffer(e.UNIFORM_BUFFER, null);
	}
	function p(t, n, r, i) {
		if (h(t, n, r, i) === !0) {
			let n = t.__offset, r = t.value;
			if (Array.isArray(r)) {
				let e = 0;
				for (let n = 0; n < r.length; n++) {
					let i = r[n], a = _(i);
					m(i, t.__data, e), typeof i != "number" && typeof i != "boolean" && !i.isMatrix3 && !ArrayBuffer.isView(i) && (e += a.storage / Float32Array.BYTES_PER_ELEMENT);
				}
			} else m(r, t.__data, 0);
			e.bufferSubData(e.UNIFORM_BUFFER, n, t.__data);
		}
	}
	function m(e, t, n) {
		typeof e == "number" || typeof e == "boolean" ? t[0] = e : e.isMatrix3 ? (t[0] = e.elements[0], t[1] = e.elements[1], t[2] = e.elements[2], t[3] = 0, t[4] = e.elements[3], t[5] = e.elements[4], t[6] = e.elements[5], t[7] = 0, t[8] = e.elements[6], t[9] = e.elements[7], t[10] = e.elements[8], t[11] = 0) : ArrayBuffer.isView(e) ? t.set(new e.constructor(e.buffer, e.byteOffset, t.length)) : e.toArray(t, n);
	}
	function h(e, t, n, r) {
		let i = e.value, a = t + "_" + n;
		if (r[a] === void 0) return r[a] = typeof i == "number" || typeof i == "boolean" ? i : ArrayBuffer.isView(i) ? i.slice() : i.clone(), !0;
		{
			let e = r[a];
			if (typeof i == "number" || typeof i == "boolean") {
				if (e !== i) return r[a] = i, !0;
			} else if (ArrayBuffer.isView(i)) return !0;
			else if (e.equals(i) === !1) return e.copy(i), !0;
		}
		return !1;
	}
	function g(e) {
		let t = e.uniforms, n = 0;
		for (let e = 0, r = t.length; e < r; e++) {
			let r = Array.isArray(t[e]) ? t[e] : [t[e]];
			for (let e = 0, t = r.length; e < t; e++) {
				let t = r[e], i = Array.isArray(t.value) ? t.value : [t.value];
				for (let e = 0, r = i.length; e < r; e++) {
					let r = i[e], a = _(r), o = n % 16, s = o % a.boundary, c = o + s;
					n += s, c !== 0 && 16 - c < a.storage && (n += 16 - c), t.__data = new Float32Array(a.storage / Float32Array.BYTES_PER_ELEMENT), t.__offset = n, n += a.storage;
				}
			}
		}
		let r = n % 16;
		return r > 0 && (n += 16 - r), e.__size = n, e.__cache = {}, this;
	}
	function _(e) {
		let t = {
			boundary: 0,
			storage: 0
		};
		return typeof e == "number" || typeof e == "boolean" ? (t.boundary = 4, t.storage = 4) : e.isVector2 ? (t.boundary = 8, t.storage = 8) : e.isVector3 || e.isColor ? (t.boundary = 16, t.storage = 12) : e.isVector4 ? (t.boundary = 16, t.storage = 16) : e.isMatrix3 ? (t.boundary = 48, t.storage = 48) : e.isMatrix4 ? (t.boundary = 64, t.storage = 64) : e.isTexture ? W("WebGLRenderer: Texture samplers can not be part of an uniforms group.") : ArrayBuffer.isView(e) ? (t.boundary = 16, t.storage = e.byteLength) : W("WebGLRenderer: Unsupported uniform value type.", e), t;
	}
	function v(t) {
		let n = t.target;
		n.removeEventListener("dispose", v);
		let r = o.indexOf(n.__bindingPointIndex);
		o.splice(r, 1), e.deleteBuffer(i[n.id]), delete i[n.id], delete a[n.id];
	}
	function y() {
		for (let t in i) e.deleteBuffer(i[t]);
		o = [], i = {}, a = {};
	}
	return {
		bind: c,
		update: l,
		dispose: y
	};
}
var H_ = new Uint16Array([
	12469,
	15057,
	12620,
	14925,
	13266,
	14620,
	13807,
	14376,
	14323,
	13990,
	14545,
	13625,
	14713,
	13328,
	14840,
	12882,
	14931,
	12528,
	14996,
	12233,
	15039,
	11829,
	15066,
	11525,
	15080,
	11295,
	15085,
	10976,
	15082,
	10705,
	15073,
	10495,
	13880,
	14564,
	13898,
	14542,
	13977,
	14430,
	14158,
	14124,
	14393,
	13732,
	14556,
	13410,
	14702,
	12996,
	14814,
	12596,
	14891,
	12291,
	14937,
	11834,
	14957,
	11489,
	14958,
	11194,
	14943,
	10803,
	14921,
	10506,
	14893,
	10278,
	14858,
	9960,
	14484,
	14039,
	14487,
	14025,
	14499,
	13941,
	14524,
	13740,
	14574,
	13468,
	14654,
	13106,
	14743,
	12678,
	14818,
	12344,
	14867,
	11893,
	14889,
	11509,
	14893,
	11180,
	14881,
	10751,
	14852,
	10428,
	14812,
	10128,
	14765,
	9754,
	14712,
	9466,
	14764,
	13480,
	14764,
	13475,
	14766,
	13440,
	14766,
	13347,
	14769,
	13070,
	14786,
	12713,
	14816,
	12387,
	14844,
	11957,
	14860,
	11549,
	14868,
	11215,
	14855,
	10751,
	14825,
	10403,
	14782,
	10044,
	14729,
	9651,
	14666,
	9352,
	14599,
	9029,
	14967,
	12835,
	14966,
	12831,
	14963,
	12804,
	14954,
	12723,
	14936,
	12564,
	14917,
	12347,
	14900,
	11958,
	14886,
	11569,
	14878,
	11247,
	14859,
	10765,
	14828,
	10401,
	14784,
	10011,
	14727,
	9600,
	14660,
	9289,
	14586,
	8893,
	14508,
	8533,
	15111,
	12234,
	15110,
	12234,
	15104,
	12216,
	15092,
	12156,
	15067,
	12010,
	15028,
	11776,
	14981,
	11500,
	14942,
	11205,
	14902,
	10752,
	14861,
	10393,
	14812,
	9991,
	14752,
	9570,
	14682,
	9252,
	14603,
	8808,
	14519,
	8445,
	14431,
	8145,
	15209,
	11449,
	15208,
	11451,
	15202,
	11451,
	15190,
	11438,
	15163,
	11384,
	15117,
	11274,
	15055,
	10979,
	14994,
	10648,
	14932,
	10343,
	14871,
	9936,
	14803,
	9532,
	14729,
	9218,
	14645,
	8742,
	14556,
	8381,
	14461,
	8020,
	14365,
	7603,
	15273,
	10603,
	15272,
	10607,
	15267,
	10619,
	15256,
	10631,
	15231,
	10614,
	15182,
	10535,
	15118,
	10389,
	15042,
	10167,
	14963,
	9787,
	14883,
	9447,
	14800,
	9115,
	14710,
	8665,
	14615,
	8318,
	14514,
	7911,
	14411,
	7507,
	14279,
	7198,
	15314,
	9675,
	15313,
	9683,
	15309,
	9712,
	15298,
	9759,
	15277,
	9797,
	15229,
	9773,
	15166,
	9668,
	15084,
	9487,
	14995,
	9274,
	14898,
	8910,
	14800,
	8539,
	14697,
	8234,
	14590,
	7790,
	14479,
	7409,
	14367,
	7067,
	14178,
	6621,
	15337,
	8619,
	15337,
	8631,
	15333,
	8677,
	15325,
	8769,
	15305,
	8871,
	15264,
	8940,
	15202,
	8909,
	15119,
	8775,
	15022,
	8565,
	14916,
	8328,
	14804,
	8009,
	14688,
	7614,
	14569,
	7287,
	14448,
	6888,
	14321,
	6483,
	14088,
	6171,
	15350,
	7402,
	15350,
	7419,
	15347,
	7480,
	15340,
	7613,
	15322,
	7804,
	15287,
	7973,
	15229,
	8057,
	15148,
	8012,
	15046,
	7846,
	14933,
	7611,
	14810,
	7357,
	14682,
	7069,
	14552,
	6656,
	14421,
	6316,
	14251,
	5948,
	14007,
	5528,
	15356,
	5942,
	15356,
	5977,
	15353,
	6119,
	15348,
	6294,
	15332,
	6551,
	15302,
	6824,
	15249,
	7044,
	15171,
	7122,
	15070,
	7050,
	14949,
	6861,
	14818,
	6611,
	14679,
	6349,
	14538,
	6067,
	14398,
	5651,
	14189,
	5311,
	13935,
	4958,
	15359,
	4123,
	15359,
	4153,
	15356,
	4296,
	15353,
	4646,
	15338,
	5160,
	15311,
	5508,
	15263,
	5829,
	15188,
	6042,
	15088,
	6094,
	14966,
	6001,
	14826,
	5796,
	14678,
	5543,
	14527,
	5287,
	14377,
	4985,
	14133,
	4586,
	13869,
	4257,
	15360,
	1563,
	15360,
	1642,
	15358,
	2076,
	15354,
	2636,
	15341,
	3350,
	15317,
	4019,
	15273,
	4429,
	15203,
	4732,
	15105,
	4911,
	14981,
	4932,
	14836,
	4818,
	14679,
	4621,
	14517,
	4386,
	14359,
	4156,
	14083,
	3795,
	13808,
	3437,
	15360,
	122,
	15360,
	137,
	15358,
	285,
	15355,
	636,
	15344,
	1274,
	15322,
	2177,
	15281,
	2765,
	15215,
	3223,
	15120,
	3451,
	14995,
	3569,
	14846,
	3567,
	14681,
	3466,
	14511,
	3305,
	14344,
	3121,
	14037,
	2800,
	13753,
	2467,
	15360,
	0,
	15360,
	1,
	15359,
	21,
	15355,
	89,
	15346,
	253,
	15325,
	479,
	15287,
	796,
	15225,
	1148,
	15133,
	1492,
	15008,
	1749,
	14856,
	1882,
	14685,
	1886,
	14506,
	1783,
	14324,
	1608,
	13996,
	1398,
	13702,
	1183
]), U_ = null;
function W_() {
	return U_ === null && (U_ = new rd(H_, 16, 16, fs, $o), U_.name = "DFG_LUT", U_.minFilter = Uo, U_.magFilter = Uo, U_.wrapS = Ro, U_.wrapT = Ro, U_.generateMipmaps = !1, U_.needsUpdate = !0), U_;
}
var G_ = class {
	constructor(e = {}) {
		let { canvas: t = gc(), context: n = null, depth: r = !0, stencil: i = !1, alpha: a = !1, antialias: o = !1, premultipliedAlpha: s = !0, preserveDrawingBuffer: c = !1, powerPreference: l = "default", failIfMajorPerformanceCaveat: u = !1, reversedDepthBuffer: d = !1, outputBufferType: f = Ko } = e;
		this.isWebGLRenderer = !0;
		let p;
		if (n !== null) {
			if (typeof WebGLRenderingContext < "u" && n instanceof WebGLRenderingContext) throw Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");
			p = n.getContextAttributes().alpha;
		} else p = a;
		let m = f, h = /* @__PURE__ */ new Set([
			ms,
			ps,
			ds
		]), g = /* @__PURE__ */ new Set([
			Ko,
			Zo,
			Yo,
			ns,
			es,
			ts
		]), _ = /* @__PURE__ */ new Uint32Array(4), v = /* @__PURE__ */ new Int32Array(4), y = new J(), b = null, x = null, S = [], C = [], w = null;
		this.domElement = t, this.debug = {
			checkShaderErrors: !0,
			diagnostics: { keywords: !1 },
			onShaderError: null
		}, this.autoClear = !0, this.autoClearColor = !0, this.autoClearDepth = !0, this.autoClearStencil = !0, this.sortObjects = !0, this.clippingPlanes = [], this.localClippingEnabled = !1, this.toneMapping = 0, this.toneMappingExposure = 1, this.transmissionResolutionScale = 1;
		let T = this, E = !1, D = null, O = null, k = null, A = null;
		this._outputColorSpace = ac;
		let j = 0, ee = 0, M = null, te = -1, ne = null, N = new Yc(), re = new Yc(), ie = null, ae = new Z(0), oe = 0, P = t.width, F = t.height, I = 1, se = null, ce = null, le = new Yc(0, 0, P, F), ue = new Yc(0, 0, P, F), de = !1, fe = new gd(), pe = !1, me = !1, he = new el(), ge = new J(), _e = new Yc(), ve = {
			background: null,
			fog: null,
			environment: null,
			overrideMaterial: null,
			isScene: !0
		}, ye = !1;
		function be() {
			return M === null ? I : 1;
		}
		let L = n;
		function xe(e, n) {
			return t.getContext(e, n);
		}
		let Se, Ce, R, we, z, B, Te, Ee, De, Oe, ke, Ae, je, Me, Ne, Pe, Fe, Ie, Le, Re, ze, Be, Ve;
		try {
			let e = {
				alpha: !0,
				depth: r,
				stencil: i,
				antialias: o,
				premultipliedAlpha: s,
				preserveDrawingBuffer: c,
				powerPreference: l,
				failIfMajorPerformanceCaveat: u
			};
			if ("setAttribute" in t && t.setAttribute("data-engine", "three.js r186"), t.addEventListener("webglcontextlost", We, !1), t.addEventListener("webglcontextrestored", Ge, !1), t.addEventListener("webglcontextcreationerror", Ke, !1), L === null) {
				let t = "webgl2";
				if (L = xe(t, e), L === null) throw xe(t) ? Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes.") : Error("THREE.WebGLRenderer: Error creating WebGL context.");
			}
			He();
		} catch (e) {
			throw t.removeEventListener("webglcontextlost", We, !1), t.removeEventListener("webglcontextrestored", Ge, !1), t.removeEventListener("webglcontextcreationerror", Ke, !1), G("WebGLRenderer: " + e.message), e;
		}
		function He() {
			Se = new lh(L), Se.init(), ze = new N_(L, Se), Ce = new Rm(L, Se, e, ze), R = new j_(L, Se), Ce.reversedDepthBuffer && d && R.buffers.depth.setReversed(!0), O = L.createFramebuffer(), k = L.createFramebuffer(), A = L.createFramebuffer(), we = new fh(L), z = new d_(), B = new M_(L, Se, R, z, Ce, ze, we), Te = new ch(T), Ee = new Am(L), Be = new Im(L, Ee), De = new uh(L, Ee, we, Be), Oe = new mh(L, De, Ee, Be, we), Ie = new ph(L, Ce, B), Ne = new zm(z), ke = new u_(T, Te, Se, Ce, Be, Ne), Ae = new B_(T, z), je = new h_(), Me = new S_(Se), Fe = new Fm(T, Te, R, Oe, p, s), Pe = new A_(T, Oe, Ce), Ve = new V_(L, we, Ce, R), Le = new Lm(L, Se, we), Re = new dh(L, Se, we), we.programs = ke.programs, T.capabilities = Ce, T.extensions = Se, T.properties = z, T.renderLists = je, T.shadowMap = Pe, T.state = R, T.info = we;
		}
		m !== 1009 && (w = new gh(m, t.width, t.height, o, r, i));
		let Ue = new L_(T, L);
		this.xr = Ue, this.getContext = function() {
			return L;
		}, this.getContextAttributes = function() {
			return L.getContextAttributes();
		}, this.forceContextLoss = function() {
			let e = Se.get("WEBGL_lose_context");
			e && e.loseContext();
		}, this.forceContextRestore = function() {
			let e = Se.get("WEBGL_lose_context");
			e && e.restoreContext();
		}, this.getPixelRatio = function() {
			return I;
		}, this.setPixelRatio = function(e) {
			e !== void 0 && (I = e, this.setSize(P, F, !1));
		}, this.getSize = function(e) {
			return e.set(P, F);
		}, this.setSize = function(e, n, r = !0) {
			Ue.isPresenting ? W("WebGLRenderer: Can't change size while VR device is presenting.") : (P = e, F = n, t.width = Math.floor(e * I), t.height = Math.floor(n * I), r === !0 && (t.style.width = e + "px", t.style.height = n + "px"), w !== null && w.setSize(t.width, t.height), this.setViewport(0, 0, e, n));
		}, this.getDrawingBufferSize = function(e) {
			return e.set(P * I, F * I).floor();
		}, this.setDrawingBufferSize = function(e, n, r) {
			P = e, F = n, I = r, t.width = Math.floor(e * r), t.height = Math.floor(n * r), this.setViewport(0, 0, e, n);
		}, this.setEffects = function(e) {
			if (m === 1009) G("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");
			else {
				if (e) {
					for (let t = 0; t < e.length; t++) if (e[t].isOutputPass === !0) {
						W("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");
						break;
					}
				}
				w.setEffects(e || []);
			}
		}, this.getCurrentViewport = function(e) {
			return e.copy(N);
		}, this.getViewport = function(e) {
			return e.copy(le);
		}, this.setViewport = function(e, t, n, r) {
			e.isVector4 ? le.set(e.x, e.y, e.z, e.w) : le.set(e, t, n, r), R.viewport(N.copy(le).multiplyScalar(I).round());
		}, this.getScissor = function(e) {
			return e.copy(ue);
		}, this.setScissor = function(e, t, n, r) {
			e.isVector4 ? ue.set(e.x, e.y, e.z, e.w) : ue.set(e, t, n, r), R.scissor(re.copy(ue).multiplyScalar(I).round());
		}, this.getScissorTest = function() {
			return de;
		}, this.setScissorTest = function(e) {
			R.setScissorTest(de = e);
		}, this.setOpaqueSort = function(e) {
			se = e;
		}, this.setTransparentSort = function(e) {
			ce = e;
		}, this.getClearColor = function(e) {
			return e.copy(Fe.getClearColor());
		}, this.setClearColor = function() {
			Fe.setClearColor(...arguments);
		}, this.getClearAlpha = function() {
			return Fe.getClearAlpha();
		}, this.setClearAlpha = function() {
			Fe.setClearAlpha(...arguments);
		}, this.clear = function(e = !0, t = !0, n = !0) {
			let r = 0;
			if (e) {
				let e = !1;
				if (M !== null) {
					let t = M.texture.format;
					e = h.has(t);
				}
				if (e) {
					let e = M.texture.type, t = g.has(e), n = Fe.getClearColor(), r = Fe.getClearAlpha(), i = n.r, a = n.g, o = n.b;
					t ? (_[0] = i, _[1] = a, _[2] = o, _[3] = r, L.clearBufferuiv(L.COLOR, 0, _)) : (v[0] = i, v[1] = a, v[2] = o, v[3] = r, L.clearBufferiv(L.COLOR, 0, v));
				} else r |= L.COLOR_BUFFER_BIT;
			}
			t && (r |= L.DEPTH_BUFFER_BIT, this.state.buffers.depth.setMask(!0)), n && (r |= L.STENCIL_BUFFER_BIT, this.state.buffers.stencil.setMask(4294967295)), r !== 0 && L.clear(r);
		}, this.clearColor = function() {
			this.clear(!0, !1, !1);
		}, this.clearDepth = function() {
			this.clear(!1, !0, !1);
		}, this.clearStencil = function() {
			this.clear(!1, !1, !0);
		}, this.setNodesHandler = function(e) {
			e.setRenderer(this), D = e;
		}, this.dispose = function() {
			t.removeEventListener("webglcontextlost", We, !1), t.removeEventListener("webglcontextrestored", Ge, !1), t.removeEventListener("webglcontextcreationerror", Ke, !1), Fe.dispose(), je.dispose(), Me.dispose(), z.dispose(), Te.dispose(), Oe.dispose(), Be.dispose(), Ve.dispose(), ke.dispose(), Ue.dispose(), Ue.removeEventListener("sessionstart", Qe), Ue.removeEventListener("sessionend", $e), et.stop();
		};
		function We(e) {
			e.preventDefault(), vc("WebGLRenderer: Context Lost."), E = !0;
		}
		function Ge() {
			vc("WebGLRenderer: Context Restored."), E = !1;
			let e = we.autoReset, t = Pe.enabled, n = Pe.autoUpdate, r = Pe.needsUpdate, i = Pe.type;
			He(), we.autoReset = e, Pe.enabled = t, Pe.autoUpdate = n, Pe.needsUpdate = r, Pe.type = i;
		}
		function Ke(e) {
			G("WebGLRenderer: A WebGL context could not be created. Reason: ", e.statusMessage);
		}
		function qe(e) {
			let t = e.target;
			t.removeEventListener("dispose", qe), Je(t);
		}
		function Je(e) {
			Ye(e), z.remove(e);
		}
		function Ye(e) {
			let t = z.get(e).programs;
			t !== void 0 && (t.forEach(function(e) {
				ke.releaseProgram(e);
			}), e.isShaderMaterial && ke.releaseShaderCache(e));
		}
		this.renderBufferDirect = function(e, t, n, r, i, a) {
			t === null && (t = ve);
			let o = i.isMesh && i.matrixWorld.determinantAffine() < 0, s = ut(e, t, n, r, i);
			R.setMaterial(r, o);
			let c = n.index, l = 1;
			if (r.wireframe === !0) {
				if (c = De.getWireframeAttribute(n), c === void 0) return;
				l = 2;
			}
			let u = n.drawRange, d = n.attributes.position, f = u.start * l, p = (u.start + u.count) * l;
			a !== null && (f = Math.max(f, a.start * l), p = Math.min(p, (a.start + a.count) * l)), c === null ? d != null && (f = Math.max(f, 0), p = Math.min(p, d.count)) : (f = Math.max(f, 0), p = Math.min(p, c.count));
			let m = p - f;
			if (m < 0 || m === Infinity) return;
			Be.setup(i, r, s, n, c);
			let h, g = Le;
			if (c !== null && (h = Ee.get(c), g = Re, g.setIndex(h)), i.isMesh) r.wireframe === !0 ? (R.setLineWidth(r.wireframeLinewidth * be()), g.setMode(L.LINES)) : g.setMode(L.TRIANGLES);
			else if (i.isLine) {
				let e = r.linewidth;
				e === void 0 && (e = 1), R.setLineWidth(e * be()), i.isLineSegments ? g.setMode(L.LINES) : i.isLineLoop ? g.setMode(L.LINE_LOOP) : g.setMode(L.LINE_STRIP);
			} else i.isPoints ? g.setMode(L.POINTS) : i.isSprite && g.setMode(L.TRIANGLES);
			if (i.isBatchedMesh) {
				if (Se.get("WEBGL_multi_draw")) g.renderMultiDraw(i._multiDrawStarts, i._multiDrawCounts, i._multiDrawCount);
				else {
					let e = i._multiDrawStarts, t = i._multiDrawCounts, n = i._multiDrawCount, a = c ? Ee.get(c).bytesPerElement : 1, o = z.get(r).currentProgram.getUniforms();
					for (let r = 0; r < n; r++) o.setValue(L, "_gl_DrawID", r), g.render(e[r] / a, t[r]);
				}
			} else if (i.isInstancedMesh) g.renderInstances(f, m, i.count);
			else if (n.isInstancedBufferGeometry) {
				let e = n._maxInstanceCount === void 0 ? Infinity : n._maxInstanceCount, t = Math.min(n.instanceCount, e);
				g.renderInstances(f, m, t);
			} else g.render(f, m);
		};
		function Xe(e, t, n, r) {
			D !== null && e.isNodeMaterial && D.setObject(r, e), pe === !0 && Ne.setState(e, n, !1), e.transparent === !0 && e.side === 2 && e.forceSinglePass === !1 ? (e.side = 1, e.needsUpdate = !0, ot(e, t, r), e.side = 0, e.needsUpdate = !0, ot(e, t, r), e.side = 2) : ot(e, t, r);
		}
		this.compile = function(e, t, n = null) {
			n === null && (n = e), D !== null && D.renderStart(e, t, n), x = Me.get(n), x.init(t), C.push(x), n.traverseVisible(function(e) {
				e.isLight && e.layers.test(t.layers) && (x.pushLight(e), e.castShadow && x.pushShadow(e));
			}), e !== n && e.traverseVisible(function(e) {
				e.isLight && e.layers.test(t.layers) && (x.pushLight(e), e.castShadow && x.pushShadow(e));
			}), x.setupLights(), D !== null && D.updateLights(x.state.lightsArray), me = this.localClippingEnabled, pe = Ne.init(this.clippingPlanes, me), pe === !0 && Ne.setGlobalState(this.clippingPlanes, t), D !== null && Pe.render(x.state.shadowsArray, n, t);
			let r = /* @__PURE__ */ new Set();
			return e.traverse(function(e) {
				if (!(e.isMesh || e.isPoints || e.isLine || e.isSprite)) return;
				let i = e.material;
				if (i) {
					if (Array.isArray(i)) for (let a = 0; a < i.length; a++) {
						let o = i[a];
						Xe(o, n, t, e), r.add(o);
					}
					else Xe(i, n, t, e), r.add(i);
				}
			}), x = C.pop(), D !== null && D.renderEnd(), r;
		}, this.compileAsync = function(e, t, n = null) {
			let r = this.compile(e, t, n);
			return new Promise((t) => {
				function n() {
					r.forEach(function(e) {
						let t = z.get(e).currentProgram;
						(t === void 0 || t.isReady()) && r.delete(e);
					}), r.size === 0 ? t(e) : setTimeout(n, 10);
				}
				Se.get("KHR_parallel_shader_compile") === null ? setTimeout(n, 10) : n();
			});
		};
		let Ze = null;
		function V(e) {
			Ze && Ze(e);
		}
		function Qe() {
			et.stop();
		}
		function $e() {
			et.start();
		}
		let et = new km();
		et.setAnimationLoop(V), typeof self < "u" && et.setContext(self), this.setAnimationLoop = function(e) {
			Ze = e, Ue.setAnimationLoop(e), e === null ? et.stop() : et.start();
		}, Ue.addEventListener("sessionstart", Qe), Ue.addEventListener("sessionend", $e), this.render = function(e, t) {
			if (t !== void 0 && t.isCamera !== !0) {
				G("WebGLRenderer.render: camera is not an instance of THREE.Camera.");
				return;
			}
			if (E === !0) return;
			D !== null && D.renderStart(e, t);
			let n = Ue.enabled === !0 && Ue.isPresenting === !0, r = w !== null && (M === null || n) && w.begin(T, M);
			if (e.matrixWorldAutoUpdate === !0 && e.updateMatrixWorld(), t.parent === null && t.matrixWorldAutoUpdate === !0 && t.updateMatrixWorld(), Ue.enabled === !0 && Ue.isPresenting === !0 && (w === null || w.isCompositing() === !1) && (Ue.cameraAutoUpdate === !0 && Ue.updateCamera(t), t = Ue.getCamera()), e.isScene === !0 && e.onBeforeRender(T, e, t, M), x = Me.get(e, C.length), x.init(t), x.state.textureUnits = B.getTextureUnits(), C.push(x), he.multiplyMatrices(t.projectionMatrix, t.matrixWorldInverse), fe.setFromProjectionMatrix(he, fc, t.reversedDepth), me = this.localClippingEnabled, pe = Ne.init(this.clippingPlanes, me), b = je.get(e, S.length), b.init(), S.push(b), Ue.enabled === !0 && Ue.isPresenting === !0) {
				let e = T.xr.getDepthSensingMesh();
				e !== null && tt(e, t, -Infinity, T.sortObjects);
			}
			tt(e, t, 0, T.sortObjects), b.finish(), D !== null && D.updateLights(x.state.lightsArray), T.sortObjects === !0 && b.sort(se, ce), ye = Ue.enabled === !1 || Ue.isPresenting === !1 || Ue.hasDepthSensing() === !1, ye && Fe.addToRenderList(b, e), this.info.render.frame++, this.info.autoReset === !0 && this.info.reset(), pe === !0 && Ne.beginShadows();
			let i = x.state.shadowsArray;
			if (Pe.render(i, e, t), pe === !0 && Ne.endShadows(), (r && w.hasRenderPass()) === !1) {
				let n = b.opaque, r = b.transmissive;
				if (x.setupLights(), t.isArrayCamera) {
					let i = t.cameras;
					if (r.length > 0) for (let t = 0, a = i.length; t < a; t++) {
						let a = i[t];
						rt(n, r, e, a);
					}
					ye && Fe.render(e);
					for (let t = 0, n = i.length; t < n; t++) {
						let n = i[t];
						nt(b, e, n, n.viewport);
					}
				} else r.length > 0 && rt(n, r, e, t), ye && Fe.render(e), nt(b, e, t);
			}
			M !== null && ee === 0 && (B.updateMultisampleRenderTarget(M), B.updateRenderTargetMipmap(M)), r && w.end(T), e.isScene === !0 && e.onAfterRender(T, e, t), Be.resetDefaultState(), te = -1, ne = null, C.pop(), C.length > 0 ? (x = C[C.length - 1], B.setTextureUnits(x.state.textureUnits), pe === !0 && Ne.setGlobalState(T.clippingPlanes, x.state.camera)) : x = null, S.pop(), b = S.length > 0 ? S[S.length - 1] : null, D !== null && D.renderEnd();
		};
		function tt(e, t, n, r) {
			if (e.visible === !1) return;
			if (e.layers.test(t.layers)) {
				if (e.isGroup) n = e.renderOrder;
				else if (e.isLOD) e.autoUpdate === !0 && e.update(t);
				else if (e.isLightProbeGrid) x.pushLightProbeGrid(e);
				else if (e.isLight) x.pushLight(e), e.castShadow && x.pushShadow(e);
				else if (e.isSprite) {
					if (!e.frustumCulled || e.intersectsFrustum(fe)) {
						r && _e.setFromMatrixPosition(e.matrixWorld).applyMatrix4(he);
						let i = Oe.update(e), a = e.material;
						a.visible && b.push(e, i, a, n, _e.z, null, t);
					}
				} else if ((e.isMesh || e.isLine || e.isPoints) && (!e.frustumCulled || e.intersectsFrustum(fe))) {
					let i = Oe.update(e), a = e.material;
					if (r && (e.boundingSphere === void 0 ? (i.boundingSphere === null && i.computeBoundingSphere(), _e.copy(i.boundingSphere.center)) : (e.boundingSphere === null && e.computeBoundingSphere(), _e.copy(e.boundingSphere.center)), _e.applyMatrix4(e.matrixWorld).applyMatrix4(he)), Array.isArray(a)) {
						let r = i.groups;
						for (let o = 0, s = r.length; o < s; o++) {
							let s = r[o], c = a[s.materialIndex];
							c && c.visible && b.push(e, i, c, n, _e.z, s, t);
						}
					} else a.visible && b.push(e, i, a, n, _e.z, null, t);
				}
			}
			let i = e.children;
			for (let e = 0, a = i.length; e < a; e++) tt(i[e], t, n, r);
		}
		function nt(e, t, n, r) {
			let { opaque: i, transmissive: a, transparent: o } = e;
			x.setupLightsView(n), pe === !0 && Ne.setGlobalState(T.clippingPlanes, n), r && R.viewport(N.copy(r)), i.length > 0 && it(i, t, n), a.length > 0 && it(a, t, n), o.length > 0 && it(o, t, n), R.buffers.depth.setTest(!0), R.buffers.depth.setMask(!0), R.buffers.color.setMask(!0), R.setPolygonOffset(!1);
		}
		function rt(e, t, n, r) {
			if ((n.isScene === !0 ? n.overrideMaterial : null) !== null) return;
			if (x.state.transmissionRenderTarget[r.id] === void 0) {
				let e = Se.has("EXT_color_buffer_half_float") || Se.has("EXT_color_buffer_float");
				x.state.transmissionRenderTarget[r.id] = new Zc(1, 1, {
					generateMipmaps: !0,
					type: e ? $o : Ko,
					minFilter: Go,
					samples: Math.max(4, Ce.samples),
					stencilBuffer: i,
					resolveDepthBuffer: !1,
					resolveStencilBuffer: !1,
					storeMultisampledDepthBuffer: !1,
					storeMultisampledStencilBuffer: !1,
					colorSpace: X.workingColorSpace
				});
			}
			let a = x.state.transmissionRenderTarget[r.id], o = r.viewport || N;
			a.setSize(o.z * T.transmissionResolutionScale, o.w * T.transmissionResolutionScale);
			let s = T.getRenderTarget(), c = T.getActiveCubeFace(), l = T.getActiveMipmapLevel();
			T.setRenderTarget(a), T.getClearColor(ae), oe = T.getClearAlpha(), oe < 1 && T.setClearColor(16777215, .5), T.clear(), ye && Fe.render(n);
			let u = T.toneMapping;
			T.toneMapping = 0;
			let d = r.viewport;
			if (r.viewport !== void 0 && (r.viewport = void 0), x.setupLightsView(r), pe === !0 && Ne.setGlobalState(T.clippingPlanes, r), it(e, n, r), B.updateMultisampleRenderTarget(a), B.updateRenderTargetMipmap(a), Se.has("WEBGL_multisampled_render_to_texture") === !1) {
				let e = !1;
				for (let i = 0, a = t.length; i < a; i++) {
					let { object: a, geometry: o, material: s, group: c } = t[i];
					if (s.side === 2 && a.layers.test(r.layers)) {
						let t = s.side;
						s.side = 1, s.needsUpdate = !0, at(a, n, r, o, s, c), s.side = t, s.needsUpdate = !0, e = !0;
					}
				}
				e === !0 && (B.updateMultisampleRenderTarget(a), B.updateRenderTargetMipmap(a));
			}
			T.setRenderTarget(s, c, l), T.setClearColor(ae, oe), d !== void 0 && (r.viewport = d), T.toneMapping = u;
		}
		function it(e, t, n) {
			let r = t.isScene === !0 ? t.overrideMaterial : null;
			for (let i = 0, a = e.length; i < a; i++) {
				let a = e[i], { object: o, geometry: s, group: c } = a, l = a.material;
				l.allowOverride === !0 && r !== null && (l = r), o.layers.test(n.layers) && at(o, t, n, s, l, c);
			}
		}
		function at(e, t, n, r, i, a) {
			D !== null && i.isNodeMaterial && D.setObject(e, i), e.onBeforeRender(T, t, n, r, i, a), e.modelViewMatrix.multiplyMatrices(n.matrixWorldInverse, e.matrixWorld), e.normalMatrix.getNormalMatrix(e.modelViewMatrix), i.onBeforeRender(T, t, n, r, e, a), i.transparent === !0 && i.side === 2 && i.forceSinglePass === !1 ? (i.side = 1, i.needsUpdate = !0, T.renderBufferDirect(n, t, r, i, e, a), i.side = 0, i.needsUpdate = !0, T.renderBufferDirect(n, t, r, i, e, a), i.side = 2) : T.renderBufferDirect(n, t, r, i, e, a), e.onAfterRender(T, t, n, r, i, a);
		}
		function ot(e, t, n) {
			t.isScene !== !0 && (t = ve);
			let r = z.get(e), i = x.state.lights, a = x.state.shadowsArray, o = i.state.version, s = ke.getParameters(e, i.state, a, t, n, x.state.lightProbeGridArray), c = ke.getProgramCacheKey(s), l = r.programs;
			r.environment = e.isMeshStandardMaterial || e.isMeshLambertMaterial || e.isMeshPhongMaterial ? t.environment : null, r.fog = t.fog;
			let u = e.isMeshStandardMaterial || e.isMeshLambertMaterial && !e.envMap || e.isMeshPhongMaterial && !e.envMap;
			r.envMap = Te.get(e.envMap || r.environment, u), r.envMapRotation = r.environment !== null && e.envMap === null ? t.environmentRotation : e.envMapRotation, l === void 0 && (e.addEventListener("dispose", qe), l = /* @__PURE__ */ new Map(), r.programs = l);
			let d = l.get(c);
			if (d !== void 0) {
				if (r.currentProgram === d && r.lightsStateVersion === o) return ct(e, s), d;
			} else s.uniforms = ke.getUniforms(e), D !== null && e.isNodeMaterial && D.build(e, n, s), e.onBeforeCompile(s, T), d = ke.acquireProgram(s, c), l.set(c, d), r.uniforms = s.uniforms;
			let f = r.uniforms;
			return (!e.isShaderMaterial && !e.isRawShaderMaterial || e.clipping === !0) && (f.clippingPlanes = Ne.uniform), ct(e, s), r.needsLights = ft(e), r.lightsStateVersion = o, r.needsLights && (f.ambientLightColor.value = i.state.ambient, f.lightProbe.value = i.state.probe, f.sunLights.value = i.state.sun, f.sunLightShadows.value = i.state.sunShadow, f.directionalLights.value = i.state.directional, f.directionalLightShadows.value = i.state.directionalShadow, f.spotLights.value = i.state.spot, f.spotLightShadows.value = i.state.spotShadow, f.rectAreaLights.value = i.state.rectArea, f.ltc_1.value = i.state.rectAreaLTC1, f.ltc_2.value = i.state.rectAreaLTC2, f.pointLights.value = i.state.point, f.pointLightShadows.value = i.state.pointShadow, f.hemisphereLights.value = i.state.hemi, f.sunShadowMatrix.value = i.state.sunShadowMatrix, f.sunShadowCascade.value = i.state.sunShadowCascade, f.directionalShadowMatrix.value = i.state.directionalShadowMatrix, f.spotLightMatrix.value = i.state.spotLightMatrix, f.spotLightMap.value = i.state.spotLightMap, f.pointShadowMatrix.value = i.state.pointShadowMatrix), r.lightProbeGrid = x.state.lightProbeGridArray.length > 0, r.currentProgram = d, r.uniformsList = null, d;
		}
		function st(e) {
			if (e.uniformsList === null) {
				let t = e.currentProgram.getUniforms();
				e.uniformsList = Cg.seqWithValue(t.seq, e.uniforms);
			}
			return e.uniformsList;
		}
		function ct(e, t) {
			let n = z.get(e);
			n.outputColorSpace = t.outputColorSpace, n.batching = t.batching, n.batchingColor = t.batchingColor, n.instancing = t.instancing, n.instancingColor = t.instancingColor, n.instancingMorph = t.instancingMorph, n.skinning = t.skinning, n.morphTargets = t.morphTargets, n.morphNormals = t.morphNormals, n.morphColors = t.morphColors, n.morphTargetsCount = t.morphTargetsCount, n.numClippingPlanes = t.numClippingPlanes, n.numIntersection = t.numClipIntersection, n.vertexAlphas = t.vertexAlphas, n.vertexTangents = t.vertexTangents, n.toneMapping = t.toneMapping;
		}
		function lt(e, t) {
			if (e.length === 0) return null;
			if (e.length === 1) return e[0].texture === null ? null : e[0];
			y.setFromMatrixPosition(t.matrixWorld);
			for (let t = 0, n = e.length; t < n; t++) {
				let n = e[t];
				if (n.texture !== null && n.boundingBox.containsPoint(y)) return n;
			}
			return null;
		}
		function ut(e, t, n, r, i) {
			t.isScene !== !0 && (t = ve), B.resetTextureUnits();
			let a = t.fog, o = r.isMeshStandardMaterial || r.isMeshLambertMaterial || r.isMeshPhongMaterial ? t.environment : null, s = M === null ? T.outputColorSpace : M.isXRRenderTarget === !0 ? M.texture.colorSpace : X.workingColorSpace, c = r.isMeshStandardMaterial || r.isMeshLambertMaterial && !r.envMap || r.isMeshPhongMaterial && !r.envMap, l = Te.get(r.envMap || o, c), u = r.vertexColors === !0 && !!n.attributes.color && n.attributes.color.itemSize === 4, d = !!n.attributes.tangent && (!!r.normalMap || r.anisotropy > 0), f = !!n.morphAttributes.position, p = !!n.morphAttributes.normal, m = !!n.morphAttributes.color, h = 0;
			r.toneMapped && (M === null || M.isXRRenderTarget === !0) && (h = T.toneMapping);
			let g = n.morphAttributes.position || n.morphAttributes.normal || n.morphAttributes.color, _ = g === void 0 ? 0 : g.length, v = z.get(r), y = x.state.lights;
			if (pe === !0 && (me === !0 || e !== ne)) {
				let t = e === ne && r.id === te;
				Ne.setState(r, e, t);
			}
			let b = !1;
			r.version === v.__version ? v.needsLights && v.lightsStateVersion !== y.state.version ? b = !0 : v.outputColorSpace === s ? i.isBatchedMesh && v.batching === !1 || !i.isBatchedMesh && v.batching === !0 || i.isBatchedMesh && v.batchingColor === !0 && i._colorsTexture === null || i.isBatchedMesh && v.batchingColor === !1 && i._colorsTexture !== null || i.isInstancedMesh && v.instancing === !1 || !i.isInstancedMesh && v.instancing === !0 || i.isSkinnedMesh && v.skinning === !1 || !i.isSkinnedMesh && v.skinning === !0 || i.isInstancedMesh && v.instancingColor === !0 && i.instanceColor === null || i.isInstancedMesh && v.instancingColor === !1 && i.instanceColor !== null || i.isInstancedMesh && v.instancingMorph === !0 && i.morphTexture === null || i.isInstancedMesh && v.instancingMorph === !1 && i.morphTexture !== null ? b = !0 : v.envMap === l ? r.fog === !0 && v.fog !== a || v.numClippingPlanes !== void 0 && (v.numClippingPlanes !== Ne.numPlanes || v.numIntersection !== Ne.numIntersection) ? b = !0 : v.vertexAlphas === u && v.vertexTangents === d && v.morphTargets === f && v.morphNormals === p && v.morphColors === m && v.toneMapping === h && v.morphTargetsCount === _ ? !!v.lightProbeGrid != x.state.lightProbeGridArray.length > 0 && (b = !0) : b = !0 : b = !0 : b = !0 : (b = !0, v.__version = r.version);
			let S = v.currentProgram;
			b === !0 && (S = ot(r, t, i), D && r.isNodeMaterial && D.onUpdateProgram(r, S, v));
			let C = !1, w = !1, E = !1, O = S.getUniforms(), k = v.uniforms;
			if (R.useProgram(S.program) && (C = !0, w = !0, E = !0), r.id !== te && (te = r.id, w = !0), v.needsLights) {
				let e = lt(x.state.lightProbeGridArray, i);
				v.lightProbeGrid !== e && (v.lightProbeGrid = e, w = !0);
			}
			if (C || ne !== e) {
				R.buffers.depth.getReversed() && e.reversedDepth !== !0 && (e._reversedDepth = !0, e.updateProjectionMatrix()), O.setValue(L, "projectionMatrix", e.projectionMatrix), O.setValue(L, "viewMatrix", e.matrixWorldInverse);
				let t = O.map.cameraPosition;
				t !== void 0 && t.setValue(L, ge.setFromMatrixPosition(e.matrixWorld)), Ce.logarithmicDepthBuffer && O.setValue(L, "logDepthBufFC", 2 / (Math.log(e.far + 1) / Math.LN2)), (r.isMeshPhongMaterial || r.isMeshToonMaterial || r.isMeshLambertMaterial || r.isMeshBasicMaterial || r.isMeshStandardMaterial || r.isShaderMaterial) && O.setValue(L, "isOrthographic", e.isOrthographicCamera === !0), ne !== e && (ne = e, w = !0, E = !0);
			}
			if (v.needsLights && (y.state.sunShadowMap.length > 0 && O.setValue(L, "sunShadowMap", y.state.sunShadowMap, B), y.state.directionalShadowMap.length > 0 && O.setValue(L, "directionalShadowMap", y.state.directionalShadowMap, B), y.state.spotShadowMap.length > 0 && O.setValue(L, "spotShadowMap", y.state.spotShadowMap, B), y.state.pointShadowMap.length > 0 && O.setValue(L, "pointShadowMap", y.state.pointShadowMap, B)), i.isSkinnedMesh) {
				O.setOptional(L, i, "bindMatrix"), O.setOptional(L, i, "bindMatrixInverse");
				let e = i.skeleton;
				e && (e.boneTexture === null && e.computeBoneTexture(), O.setValue(L, "boneTexture", e.boneTexture, B));
			}
			i.isBatchedMesh && (O.setOptional(L, i, "batchingTexture"), O.setValue(L, "batchingTexture", i._matricesTexture, B), O.setOptional(L, i, "batchingIdTexture"), O.setValue(L, "batchingIdTexture", i._indirectTexture, B), O.setOptional(L, i, "batchingColorTexture"), i._colorsTexture !== null && O.setValue(L, "batchingColorTexture", i._colorsTexture, B));
			let A = n.morphAttributes;
			if ((A.position !== void 0 || A.normal !== void 0 || A.color !== void 0) && Ie.update(i, n, S), (w || v.receiveShadow !== i.receiveShadow) && (v.receiveShadow = i.receiveShadow, O.setValue(L, "receiveShadow", i.receiveShadow)), (r.isMeshStandardMaterial || r.isMeshLambertMaterial || r.isMeshPhongMaterial) && r.envMap === null && t.environment !== null && (k.envMapIntensity.value = t.environmentIntensity), k.dfgLUT !== void 0 && (k.dfgLUT.value = W_()), w) {
				if (O.setValue(L, "toneMappingExposure", T.toneMappingExposure), v.needsLights && dt(k, E), a && r.fog === !0 && Ae.refreshFogUniforms(k, a), Ae.refreshMaterialUniforms(k, r, I, F, x.state.transmissionRenderTarget[e.id]), v.needsLights && v.lightProbeGrid) {
					let e = v.lightProbeGrid;
					k.probesSH.value = e.texture, k.probesMin.value.copy(e.boundingBox.min), k.probesMax.value.copy(e.boundingBox.max), k.probesResolution.value.copy(e.resolution);
				}
				Cg.upload(L, st(v), k, B);
			}
			if (r.isShaderMaterial && r.uniformsNeedUpdate === !0 && (Cg.upload(L, st(v), k, B), r.uniformsNeedUpdate = !1), r.isSpriteMaterial && O.setValue(L, "center", i.center), O.setValue(L, "modelViewMatrix", i.modelViewMatrix), O.setValue(L, "normalMatrix", i.normalMatrix), O.setValue(L, "modelMatrix", i.matrixWorld), r.uniformsGroups !== void 0) {
				let e = r.uniformsGroups;
				for (let t = 0, n = e.length; t < n; t++) {
					let n = e[t];
					Ve.update(n, S), Ve.bind(n, S);
				}
			}
			return S;
		}
		function dt(e, t) {
			e.ambientLightColor.needsUpdate = t, e.lightProbe.needsUpdate = t, e.sunLights.needsUpdate = t, e.sunLightShadows.needsUpdate = t, e.directionalLights.needsUpdate = t, e.directionalLightShadows.needsUpdate = t, e.pointLights.needsUpdate = t, e.pointLightShadows.needsUpdate = t, e.spotLights.needsUpdate = t, e.spotLightShadows.needsUpdate = t, e.rectAreaLights.needsUpdate = t, e.hemisphereLights.needsUpdate = t;
		}
		function ft(e) {
			return e.isMeshLambertMaterial || e.isMeshToonMaterial || e.isMeshPhongMaterial || e.isMeshStandardMaterial || e.isShadowMaterial || e.isShaderMaterial && e.lights === !0;
		}
		this.getActiveCubeFace = function() {
			return j;
		}, this.getActiveMipmapLevel = function() {
			return ee;
		}, this.getRenderTarget = function() {
			return M;
		}, this.setRenderTargetTextures = function(e, t, n) {
			let r = z.get(e);
			r.__autoAllocateDepthBuffer = e.resolveDepthBuffer === !1, r.__autoAllocateDepthBuffer === !1 && (r.__useRenderToTexture = !1), z.get(e.texture).__webglTexture = t, z.get(e.depthTexture).__webglTexture = r.__autoAllocateDepthBuffer ? void 0 : n, r.__hasExternalTextures = !0;
		}, this.setRenderTargetFramebuffer = function(e, t) {
			let n = z.get(e);
			n.__webglFramebuffer = t, n.__useDefaultFramebuffer = t === void 0;
		}, this.setRenderTarget = function(e, t = 0, n = 0) {
			M = e, j = t, ee = n;
			let r = null, i = !1, a = !1;
			if (e) {
				let o = z.get(e);
				if (o.__useDefaultFramebuffer !== void 0) {
					R.bindFramebuffer(L.FRAMEBUFFER, o.__webglFramebuffer), N.copy(e.viewport), re.copy(e.scissor), ie = e.scissorTest, R.viewport(N), R.scissor(re), R.setScissorTest(ie), te = -1;
					return;
				}
				if (o.__webglFramebuffer === void 0) B.setupRenderTarget(e);
				else if (o.__hasExternalTextures) B.rebindTextures(e, z.get(e.texture).__webglTexture, z.get(e.depthTexture).__webglTexture);
				else if (e.depthBuffer) {
					let t = e.depthTexture;
					if (o.__boundDepthTexture !== t) {
						if (t !== null && z.has(t) && (e.width !== t.image.width || e.height !== t.image.height)) throw Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");
						B.setupDepthRenderbuffer(e);
					}
				}
				let s = e.texture;
				(s.isData3DTexture || s.isDataArrayTexture || s.isCompressedArrayTexture) && (a = !0);
				let c = z.get(e).__webglFramebuffer;
				e.isWebGLCubeRenderTarget ? (r = Array.isArray(c[t]) ? c[t][n] : c[t], i = !0) : r = e.samples > 0 && B.useMultisampledRTT(e) === !1 ? z.get(e).__webglMultisampledFramebuffer : Array.isArray(c) ? c[n] : c, N.copy(e.viewport), re.copy(e.scissor), ie = e.scissorTest;
			} else N.copy(le).multiplyScalar(I).floor(), re.copy(ue).multiplyScalar(I).floor(), ie = de;
			if (n !== 0 && (r = O), R.bindFramebuffer(L.FRAMEBUFFER, r) && R.drawBuffers(e, r), R.viewport(N), R.scissor(re), R.setScissorTest(ie), i) {
				let r = z.get(e.texture);
				L.framebufferTexture2D(L.FRAMEBUFFER, L.COLOR_ATTACHMENT0, L.TEXTURE_CUBE_MAP_POSITIVE_X + t, r.__webglTexture, n);
			} else if (a) {
				let r = t;
				for (let t = 0; t < e.textures.length; t++) {
					let i = z.get(e.textures[t]);
					L.framebufferTextureLayer(L.FRAMEBUFFER, L.COLOR_ATTACHMENT0 + t, i.__webglTexture, n, r);
				}
			} else if (e !== null && n !== 0) {
				let t = z.get(e.texture);
				L.framebufferTexture2D(L.FRAMEBUFFER, L.COLOR_ATTACHMENT0, L.TEXTURE_2D, t.__webglTexture, n);
			}
			te = -1;
		};
		function pt(e) {
			let t = z.get(e);
			return (t.__readFormat !== e.format || t.__readType !== e.type) && (t.__readFormat = e.format, t.__readType = e.type, t.__formatReadable = Ce.textureFormatReadable(e.format), t.__typeReadable = Ce.textureTypeReadable(e.type)), t;
		}
		this.readRenderTargetPixels = function(e, t, n, r, i, a, o, s = 0) {
			if (!(e && e.isWebGLRenderTarget)) {
				G("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
				return;
			}
			let c = z.get(e).__webglFramebuffer;
			if (e.isWebGLCubeRenderTarget && o !== void 0 && (c = c[o]), c) {
				R.bindFramebuffer(L.FRAMEBUFFER, c);
				try {
					let o = e.textures[s], c = o.format, l = o.type;
					e.textures.length > 1 && L.readBuffer(L.COLOR_ATTACHMENT0 + s);
					let u = pt(o);
					if (u.__formatReadable === !1) {
						G("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");
						return;
					}
					if (u.__typeReadable === !1) {
						G("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");
						return;
					}
					t >= 0 && t <= e.width - r && n >= 0 && n <= e.height - i && L.readPixels(t, n, r, i, ze.convert(c), ze.convert(l), a);
				} finally {
					let e = M === null ? null : z.get(M).__webglFramebuffer;
					R.bindFramebuffer(L.FRAMEBUFFER, e);
				}
			}
		}, this.readRenderTargetPixelsAsync = async function(e, t, n, r, i, a, o, s = 0) {
			if (!(e && e.isWebGLRenderTarget)) throw Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
			let c = z.get(e).__webglFramebuffer;
			if (e.isWebGLCubeRenderTarget && o !== void 0 && (c = c[o]), c) {
				if (t >= 0 && t <= e.width - r && n >= 0 && n <= e.height - i) {
					R.bindFramebuffer(L.FRAMEBUFFER, c);
					let o = e.textures[s], l = o.format, u = o.type;
					e.textures.length > 1 && L.readBuffer(L.COLOR_ATTACHMENT0 + s);
					let d = pt(o);
					if (d.__formatReadable === !1) throw Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");
					if (d.__typeReadable === !1) throw Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");
					let f = L.createBuffer();
					L.bindBuffer(L.PIXEL_PACK_BUFFER, f), L.bufferData(L.PIXEL_PACK_BUFFER, a.byteLength, L.STREAM_READ), L.readPixels(t, n, r, i, ze.convert(l), ze.convert(u), 0), L.bindBuffer(L.PIXEL_PACK_BUFFER, null);
					let p = M === null ? null : z.get(M).__webglFramebuffer;
					R.bindFramebuffer(L.FRAMEBUFFER, p);
					let m = L.fenceSync(L.SYNC_GPU_COMMANDS_COMPLETE, 0);
					return L.flush(), await xc(L, m, 4), L.bindBuffer(L.PIXEL_PACK_BUFFER, f), L.getBufferSubData(L.PIXEL_PACK_BUFFER, 0, a), L.bindBuffer(L.PIXEL_PACK_BUFFER, null), L.deleteBuffer(f), L.deleteSync(m), a;
				}
				throw Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.");
			}
		}, this.copyFramebufferToTexture = function(e, t = null, n = 0) {
			let r = 2 ** -n, i = Math.floor(e.image.width * r), a = Math.floor(e.image.height * r), o = t === null ? 0 : t.x, s = t === null ? 0 : t.y;
			B.setTexture2D(e, 0), L.copyTexSubImage2D(L.TEXTURE_2D, n, 0, 0, o, s, i, a), R.unbindTexture();
		}, this.copyTextureToTexture = function(e, t, n = null, r = null, i = 0, a = 0) {
			let o, s, c, l, u, d, f, p, m, h = e.isCompressedTexture ? e.mipmaps[a] : e.image;
			if (n !== null) o = n.max.x - n.min.x, s = n.max.y - n.min.y, c = n.isBox3 ? n.max.z - n.min.z : 1, l = n.min.x, u = n.min.y, d = n.isBox3 ? n.min.z : 0;
			else {
				let t = 2 ** -i;
				o = Math.floor(h.width * t), s = Math.floor(h.height * t), c = e.isDataArrayTexture ? h.depth : e.isData3DTexture ? Math.floor(h.depth * t) : 1, l = 0, u = 0, d = 0;
			}
			r === null ? (f = 0, p = 0, m = 0) : (f = r.x, p = r.y, m = r.z);
			let g = ze.convert(t.format), _ = ze.convert(t.type), v;
			t.isData3DTexture ? (B.setTexture3D(t, 0), v = L.TEXTURE_3D) : t.isDataArrayTexture || t.isCompressedArrayTexture ? (B.setTexture2DArray(t, 0), v = L.TEXTURE_2D_ARRAY) : (B.setTexture2D(t, 0), v = L.TEXTURE_2D), R.activeTexture(L.TEXTURE0), R.pixelStorei(L.UNPACK_FLIP_Y_WEBGL, t.flipY), R.pixelStorei(L.UNPACK_PREMULTIPLY_ALPHA_WEBGL, t.premultiplyAlpha), R.pixelStorei(L.UNPACK_ALIGNMENT, t.unpackAlignment);
			let y = R.getParameter(L.UNPACK_ROW_LENGTH), b = R.getParameter(L.UNPACK_IMAGE_HEIGHT), x = R.getParameter(L.UNPACK_SKIP_PIXELS), S = R.getParameter(L.UNPACK_SKIP_ROWS), C = R.getParameter(L.UNPACK_SKIP_IMAGES);
			R.pixelStorei(L.UNPACK_ROW_LENGTH, h.width), R.pixelStorei(L.UNPACK_IMAGE_HEIGHT, h.height), R.pixelStorei(L.UNPACK_SKIP_PIXELS, l), R.pixelStorei(L.UNPACK_SKIP_ROWS, u), R.pixelStorei(L.UNPACK_SKIP_IMAGES, d);
			let w = e.isDataArrayTexture || e.isData3DTexture, T = t.isDataArrayTexture || t.isData3DTexture;
			if (e.isDepthTexture) {
				let n = z.get(e), r = z.get(t), h = z.get(n.__renderTarget), g = z.get(r.__renderTarget);
				R.bindFramebuffer(L.READ_FRAMEBUFFER, h.__webglFramebuffer), R.bindFramebuffer(L.DRAW_FRAMEBUFFER, g.__webglFramebuffer);
				for (let n = 0; n < c; n++) w && (L.framebufferTextureLayer(L.READ_FRAMEBUFFER, L.COLOR_ATTACHMENT0, z.get(e).__webglTexture, i, d + n), L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER, L.COLOR_ATTACHMENT0, z.get(t).__webglTexture, a, m + n)), L.blitFramebuffer(l, u, o, s, f, p, o, s, L.DEPTH_BUFFER_BIT, L.NEAREST);
				R.bindFramebuffer(L.READ_FRAMEBUFFER, null), R.bindFramebuffer(L.DRAW_FRAMEBUFFER, null);
			} else if (i !== 0 || e.isRenderTargetTexture || z.has(e)) {
				let n = z.get(e), r = z.get(t);
				R.bindFramebuffer(L.READ_FRAMEBUFFER, k), R.bindFramebuffer(L.DRAW_FRAMEBUFFER, A);
				for (let e = 0; e < c; e++) w ? L.framebufferTextureLayer(L.READ_FRAMEBUFFER, L.COLOR_ATTACHMENT0, n.__webglTexture, i, d + e) : L.framebufferTexture2D(L.READ_FRAMEBUFFER, L.COLOR_ATTACHMENT0, L.TEXTURE_2D, n.__webglTexture, i), T ? L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER, L.COLOR_ATTACHMENT0, r.__webglTexture, a, m + e) : L.framebufferTexture2D(L.DRAW_FRAMEBUFFER, L.COLOR_ATTACHMENT0, L.TEXTURE_2D, r.__webglTexture, a), i === 0 ? T ? L.copyTexSubImage3D(v, a, f, p, m + e, l, u, o, s) : L.copyTexSubImage2D(v, a, f, p, l, u, o, s) : L.blitFramebuffer(l, u, o, s, f, p, o, s, L.COLOR_BUFFER_BIT, L.NEAREST);
				R.bindFramebuffer(L.READ_FRAMEBUFFER, null), R.bindFramebuffer(L.DRAW_FRAMEBUFFER, null);
			} else T ? e.isDataTexture || e.isData3DTexture ? L.texSubImage3D(v, a, f, p, m, o, s, c, g, _, h.data) : t.isCompressedArrayTexture ? L.compressedTexSubImage3D(v, a, f, p, m, o, s, c, g, h.data) : L.texSubImage3D(v, a, f, p, m, o, s, c, g, _, h) : e.isDataTexture ? L.texSubImage2D(L.TEXTURE_2D, a, f, p, o, s, g, _, h.data) : e.isCompressedTexture ? L.compressedTexSubImage2D(L.TEXTURE_2D, a, f, p, h.width, h.height, g, h.data) : L.texSubImage2D(L.TEXTURE_2D, a, f, p, o, s, g, _, h);
			R.pixelStorei(L.UNPACK_ROW_LENGTH, y), R.pixelStorei(L.UNPACK_IMAGE_HEIGHT, b), R.pixelStorei(L.UNPACK_SKIP_PIXELS, x), R.pixelStorei(L.UNPACK_SKIP_ROWS, S), R.pixelStorei(L.UNPACK_SKIP_IMAGES, C), a === 0 && t.generateMipmaps && L.generateMipmap(v), R.unbindTexture();
		}, this.initRenderTarget = function(e) {
			z.get(e).__webglFramebuffer === void 0 && B.setupRenderTarget(e);
		}, this.initTexture = function(e) {
			e.isCubeTexture ? B.setTextureCube(e, 0) : e.isData3DTexture ? B.setTexture3D(e, 0) : e.isDataArrayTexture || e.isCompressedArrayTexture ? B.setTexture2DArray(e, 0) : B.setTexture2D(e, 0), R.unbindTexture();
		}, this.resetState = function() {
			j = 0, ee = 0, M = null, R.reset(), Be.reset();
		}, typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", { detail: this }));
	}
	get coordinateSystem() {
		return fc;
	}
	get outputColorSpace() {
		return this._outputColorSpace;
	}
	set outputColorSpace(e) {
		this._outputColorSpace = e;
		let t = this.getContext();
		t.drawingBufferColorSpace = X._getDrawingBufferColorSpace(e), t.unpackColorSpace = X._getUnpackColorSpace();
	}
};
// node_modules/three/examples/jsm/utils/BufferGeometryUtils.js
function K_(e, t = !1) {
	let n = e[0].index !== null, r = new Set(Object.keys(e[0].attributes)), i = new Set(Object.keys(e[0].morphAttributes)), a = {}, o = {}, s = e[0].morphTargetsRelative, c = new Au(), l = 0;
	for (let u = 0; u < e.length; ++u) {
		let d = e[u], f = 0;
		if (n !== (d.index !== null)) return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + u + ". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."), null;
		for (let e in d.attributes) {
			if (!r.has(e)) return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + u + ". All geometries must have compatible attributes; make sure \"" + e + "\" attribute exists among all geometries, or in none of them."), null;
			a[e] === void 0 && (a[e] = []), a[e].push(d.attributes[e]), f++;
		}
		if (f !== r.size) return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + u + ". Make sure all geometries have the same number of attributes."), null;
		if (s !== d.morphTargetsRelative) return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + u + ". .morphTargetsRelative must be consistent throughout all geometries."), null;
		for (let e in d.morphAttributes) {
			if (!i.has(e)) return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + u + ".  .morphAttributes must be consistent throughout all geometries."), null;
			o[e] === void 0 && (o[e] = []), o[e].push(d.morphAttributes[e]);
		}
		if (t) {
			let e;
			if (n) e = d.index.count;
			else if (d.attributes.position !== void 0) e = d.attributes.position.count;
			else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + u + ". The geometry must have either an index or a position attribute"), null;
			c.addGroup(l, e, u), l += e;
		}
	}
	if (n) {
		let t = 0, n = [];
		for (let r = 0; r < e.length; ++r) {
			let i = e[r].index;
			for (let e = 0; e < i.count; ++e) n.push(i.getX(e) + t);
			t += e[r].attributes.position.count;
		}
		c.setIndex(n);
	}
	for (let e in a) {
		let t = q_(a[e]);
		if (!t) return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the " + e + " attribute."), null;
		c.setAttribute(e, t);
	}
	for (let e in o) {
		let t = o[e][0].length;
		if (t !== 0) {
			c.morphAttributes = c.morphAttributes || {}, c.morphAttributes[e] = [];
			for (let n = 0; n < t; ++n) {
				let t = [];
				for (let r = 0; r < o[e].length; ++r) t.push(o[e][r][n]);
				let r = q_(t);
				if (!r) return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the " + e + " morphAttribute."), null;
				c.morphAttributes[e].push(r);
			}
		}
	}
	return c;
}
function q_(e) {
	let t, n, r, i = -1, a = 0;
	for (let o = 0; o < e.length; ++o) {
		let s = e[o];
		if (t === void 0 && (t = s.array.constructor), t !== s.array.constructor) return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."), null;
		if (n === void 0 && (n = s.itemSize), n !== s.itemSize) return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."), null;
		if (r === void 0 && (r = s.normalized), r !== s.normalized) return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."), null;
		if (i === -1 && (i = s.gpuType), i !== s.gpuType) return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."), null;
		a += s.count * n;
	}
	let o = new t(a), s = new hu(o, n, r), c = 0;
	for (let t = 0; t < e.length; ++t) {
		let r = e[t];
		if (r.isInterleavedBufferAttribute) {
			let e = c / n;
			for (let t = 0, i = r.count; t < i; t++) for (let i = 0; i < n; i++) {
				let n = r.getComponent(t, i);
				s.setComponent(t + e, i, n);
			}
		} else o.set(r.array, c);
		c += r.count * n;
	}
	return i !== void 0 && (s.gpuType = i), s;
}
// src/scene.ts
var J_ = Math.atan(1 / Math.SQRT2), Y_ = {
	paper: 15986404,
	ground: 15459283,
	plinthSide: 12168082,
	road: 14273976,
	park: 12963752,
	home: 15854559,
	other: 14800578,
	edge: 8220764,
	cafe: 14239531,
	rival: 2060139
}, X_ = {
	toCafe: new Z(14239531),
	toRival: new Z(2060139),
	noticed: new Z(15769632)
}, Z_ = (e, t, n = 0) => new J(e, n, -t);
function Q_(e) {
	let t = [];
	for (let n = 0; n < e.length; n += 2) t.push(new q(e[n], e[n + 1]));
	return t.length > 3 && t[0].distanceTo(t[t.length - 1]) < .01 && t.pop(), t.length < 3 ? null : new bf(t);
}
function $_(e, t) {
	let n = Q_(e);
	if (!n) return null;
	let r = new ip(n, {
		depth: t,
		bevelEnabled: !1
	});
	return r.rotateX(-Math.PI / 2), r;
}
function ev(e, t, n) {
	let r = [], i = t / 2;
	for (let t = 0; t + 3 < e.length; t += 2) {
		let a = e[t], o = e[t + 1], s = e[t + 2], c = e[t + 3], l = Math.hypot(s - a, c - o);
		if (l < .01) continue;
		let u = -(c - o) / l * i, d = (s - a) / l * i, f = Z_(a + u, o + d, n), p = Z_(a - u, o - d, n), m = Z_(s + u, c + d, n), h = Z_(s - u, c - d, n);
		r.push(f.x, f.y, f.z, m.x, m.y, m.z, p.x, p.y, p.z), r.push(p.x, p.y, p.z, m.x, m.y, m.z, h.x, h.y, h.z);
	}
	if (!r.length) return null;
	let a = new Au();
	return a.setAttribute("position", new vu(r, 3)), a.computeVertexNormals(), a;
}
var tv = class {
	host;
	renderer;
	scene = new Il();
	camera;
	target = new J();
	azimuth = Math.PI / 4;
	azimuthGoal = Math.PI / 4;
	viewSize = 300;
	viewSizeGoal = 300;
	mapRadius = 300;
	model = new Ol();
	region = new Ol();
	rivalPins = [];
	pawns = null;
	selectedRing;
	dummy = new Dl();
	pins = [];
	onPick = () => {};
	onFrame = () => {};
	constructor(e) {
		this.host = e, this.renderer = new G_({ antialias: !0 }), this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio)), this.renderer.setClearColor(Y_.paper), this.renderer.shadowMap.enabled = !0, this.renderer.shadowMap.type = 2, e.appendChild(this.renderer.domElement), this.camera = new im(-1, 1, 1, -1, -4e4, 4e4), this.scene.add(this.model), this.scene.add(this.region);
		let t = new Gp(16775920, 12101768, 1.15);
		this.scene.add(t);
		let n = new om(16773596, 1.6);
		n.position.set(-260, 420, 180), n.castShadow = !0, n.shadow.mapSize.set(2048, 2048), n.shadow.bias = -5e-4, n.shadow.camera.left = n.shadow.camera.bottom = -700, n.shadow.camera.right = n.shadow.camera.top = 700, n.shadow.camera.far = 2e3, this.scene.add(n), this.selectedRing = new ed(new cp(4.5, 6, 32).rotateX(-Math.PI / 2), new Hu({
			color: 2038808,
			transparent: !0,
			opacity: .85
		})), this.selectedRing.visible = !1, this.scene.add(this.selectedRing), this.bindControls(), window.addEventListener("resize", () => this.resize()), this.resize();
		let r = performance.now(), i = (e) => {
			let t = Math.min(.1, (e - r) / 1e3);
			r = e, this.azimuth += (this.azimuthGoal - this.azimuth) * Math.min(1, t * 8), Math.abs(this.viewSizeGoal - this.viewSize) > .5 && (this.viewSize += (this.viewSizeGoal - this.viewSize) * Math.min(1, t * 5), this.resize()), this.placeCamera(), this.onFrame(t), this.renderer.render(this.scene, this.camera), this.updatePins(), requestAnimationFrame(i);
		};
		requestAnimationFrame(i);
	}
	rotate(e) {
		this.azimuthGoal += e * Math.PI / 2;
	}
	resize() {
		let e = this.host.clientWidth, t = this.host.clientHeight;
		this.renderer.setSize(e, t);
		let n = e / t;
		this.camera.left = -this.viewSize * n / 2, this.camera.right = this.viewSize * n / 2, this.camera.top = this.viewSize / 2, this.camera.bottom = -this.viewSize / 2, this.camera.updateProjectionMatrix();
	}
	placeCamera() {
		let e = 1e3;
		this.camera.position.set(this.target.x + e * Math.cos(J_) * Math.cos(this.azimuth), this.target.y + e * Math.sin(J_), this.target.z + e * Math.cos(J_) * Math.sin(this.azimuth)), this.camera.lookAt(this.target);
	}
	bindControls() {
		let e = this.renderer.domElement, t = !1, n = 0, r = 0, i = 0;
		e.addEventListener("pointerdown", (a) => {
			t = !0, n = 0, r = a.clientX, i = a.clientY, e.setPointerCapture(a.pointerId);
		}), e.addEventListener("pointermove", (a) => {
			if (!t) return;
			let o = a.clientX - r, s = a.clientY - i;
			r = a.clientX, i = a.clientY, n += Math.abs(o) + Math.abs(s);
			let c = (this.camera.top - this.camera.bottom) / this.camera.zoom / e.clientHeight, l = new J(-Math.sin(this.azimuth), 0, Math.cos(this.azimuth)), u = new J(-Math.cos(this.azimuth), 0, -Math.sin(this.azimuth));
			this.target.addScaledVector(l, -o * c), this.target.addScaledVector(u, s * c / Math.sin(J_));
		}), e.addEventListener("pointerup", (e) => {
			t = !1, n < 5 && this.pick(e);
		}), e.addEventListener("wheel", (e) => {
			e.preventDefault(), this.camera.zoom = Math.max(.5, Math.min(8, this.camera.zoom * Math.exp(-e.deltaY * .0012))), this.camera.updateProjectionMatrix();
		}, { passive: !1 }), window.addEventListener("keydown", (e) => {
			e.target.closest("input, textarea, select") || ((e.key === "q" || e.key === "Q") && this.rotate(-1), (e.key === "e" || e.key === "E") && this.rotate(1));
		});
	}
	pick(e) {
		if (!this.pawns) return;
		let t = this.renderer.domElement.getBoundingClientRect(), n = new q((e.clientX - t.left) / t.width * 2 - 1, -((e.clientY - t.top) / t.height) * 2 + 1), r = new wm();
		r.setFromCamera(n, this.camera);
		let i = r.intersectObject(this.pawns)[0];
		this.onPick(i?.instanceId ?? null);
	}
	setMap(e) {
		this.model.clear(), this.clearPins();
		let t = e.radius, n = new ed(new Pd(t * 2 + 24, 8, t * 2 + 24), [
			new Sp({ color: Y_.plinthSide }),
			new Sp({ color: Y_.plinthSide }),
			new Sp({ color: Y_.ground }),
			new Sp({ color: Y_.plinthSide }),
			new Sp({ color: Y_.plinthSide }),
			new Sp({ color: Y_.plinthSide })
		]);
		n.position.y = -4, n.receiveShadow = !0, this.model.add(n);
		let r = (e) => {
			for (let n = 0; n < e.length; n += 2) if (Math.abs(e[n]) > t + 10 || Math.abs(e[n + 1]) > t + 10) return !1;
			return !0;
		}, i = e.parks.map((e) => Q_(e.p)).filter((e) => !!e).map((e) => new lp(e).rotateX(-Math.PI / 2).translate(0, .05, 0));
		if (i.length) {
			let e = new ed(K_(i), new Sp({ color: Y_.park }));
			e.receiveShadow = !0, this.model.add(e);
		}
		let a = e.roads.map((e) => ev(e.p, e.w, .12)).filter((e) => !!e);
		if (a.length) {
			let e = new ed(K_(a), new Sp({ color: Y_.road }));
			e.receiveShadow = !0, this.model.add(e);
		}
		let o = {
			home: [],
			other: [],
			cafe: [],
			rival: []
		}, s = [], c = new Set(e.competitors.map((e) => e.building));
		e.buildings.forEach((t, n) => {
			if (!r(t.p)) return;
			let i = n === e.cafe.building ? "cafe" : c.has(n) ? "rival" : null, a = $_(t.p, i ? Math.max(t.h, 8) : t.h);
			a && (o[i ?? (t.home ? "home" : "other")].push(a), s.push(new Hd(a, 25)));
		});
		for (let [e, t] of Object.entries(o)) {
			if (!t.length) continue;
			let n = new ed(K_(t), new Sp({ color: Y_[e] }));
			n.castShadow = n.receiveShadow = !0, this.model.add(n);
		}
		s.length && this.model.add(new kd(K_(s), new _d({
			color: Y_.edge,
			transparent: !0,
			opacity: .28
		})));
		let l = (e, t, n) => {
			let r = new ed(new Pd(10, 9, 10), new Sp({ color: n }));
			r.position.copy(Z_(e, t, 4.5)), r.castShadow = !0, this.model.add(r);
		};
		e.cafe.building < 0 && l(e.cafe.x, e.cafe.y, Y_.cafe);
		for (let t of e.competitors) t.building < 0 && l(t.x, t.y, Y_.rival);
		this.addPin("cafe", e.cafe.name, "", Z_(e.cafe.x, e.cafe.y, this.heightAt(e, e.cafe.building) + 4));
		for (let t of e.competitors) this.addPin("rival", t.name, "rival", Z_(t.x, t.y, this.heightAt(e, t.building) + 4));
		this.target.set(0, 0, 0), this.mapRadius = t, this.viewSize = this.viewSizeGoal = t * 1.35, this.camera.zoom = 1, this.region.clear(), this.resize();
	}
	setRivals(e, t) {
		this.region.clear();
		for (let e of this.rivalPins) e.remove();
		this.rivalPins = [];
		for (let e of this.pins.filter((e) => e.el.classList.contains("rival"))) e.el.remove();
		this.pins = this.pins.filter((e) => !e.el.classList.contains("rival"));
		let n = this.mapRadius, r = new ed(new Id(Math.max(t * 1.08, n * 1.6), 96).rotateX(-Math.PI / 2), new Hu({ color: 15459542 }));
		r.position.y = -8.2, this.region.add(r);
		let i = new ed(new cp(t - Math.max(2, t * .006), t, 128).rotateX(-Math.PI / 2), new Hu({
			color: Y_.rival,
			transparent: !0,
			opacity: .55
		}));
		i.position.y = t > n ? -8.1 : .4, this.region.add(i);
		let a = Math.max(1, t / 600), o = new Ld(.9 * a, .9 * a, 16 * a, 8).translate(0, 8 * a, 0), s = new dp(3 * a, 12, 8).translate(0, 17 * a, 0), c = new Sp({ color: Y_.rival }), l = [...e].sort((e, t) => t.weight - e.weight).slice(0, 6);
		for (let t of e) {
			let e = Math.abs(t.x) <= n && Math.abs(t.y) <= n ? 10 : -8;
			for (let n of [o, s]) {
				let r = new ed(n, c);
				r.position.copy(Z_(t.x, t.y, e)), r.castShadow = !0, this.region.add(r);
			}
			if (l.includes(t)) {
				let n = t.distanceM / 1609;
				this.addPin("rival", t.name, n < 1 ? `${n.toFixed(2)} mi` : `${n.toFixed(1)} mi`, Z_(t.x, t.y, e + 22 * a)), this.rivalPins.push(this.pins[this.pins.length - 1].el);
			}
		}
		this.viewSizeGoal = Math.max(n * 1.35, t * 2.3);
	}
	heightAt(e, t) {
		return t >= 0 ? Math.max(8, e.buildings[t].h) : 9;
	}
	addPin(e, t, n, r) {
		let i = document.createElement("div");
		if (i.className = `pin ${e}`, i.textContent = t, n) {
			let e = document.createElement("span");
			e.textContent = n, i.appendChild(e);
		}
		document.body.appendChild(i), this.pins.push({
			el: i,
			world: r
		});
	}
	clearPins() {
		for (let e of this.pins) e.el.remove();
		this.pins = [];
	}
	setPinNote(e, t) {
		for (let n of this.pins) {
			if (!n.el.classList.contains(e)) continue;
			let r = n.el.querySelector("span");
			r || (r = document.createElement("span"), n.el.appendChild(r)), r.textContent = t;
		}
	}
	updatePins() {
		let e = this.renderer.domElement.getBoundingClientRect();
		for (let t of this.pins) {
			let n = t.world.clone().project(this.camera);
			t.el.style.left = `${e.left + (n.x + 1) / 2 * e.width}px`, t.el.style.top = `${e.top + (1 - n.y) / 2 * e.height - 6}px`;
		}
	}
	setPeopleCount(e) {
		this.pawns && (this.scene.remove(this.pawns), this.pawns.dispose());
		let t = new Fd(2.4, 4.2, 4, 12).translate(0, 4.5, 0);
		this.pawns = new fd(t, new Sp(), Math.max(1, e)), this.pawns.castShadow = !0, this.pawns.instanceMatrix.setUsage(dc);
		for (let t = 0; t < e; t++) this.pawns.setColorAt(t, X_.toCafe), this.hidePerson(t);
		this.scene.add(this.pawns);
	}
	placePerson(e, t, n, r) {
		this.pawns && (this.dummy.position.copy(Z_(t, n, .2)), this.dummy.scale.setScalar(1), this.dummy.updateMatrix(), this.pawns.setMatrixAt(e, this.dummy.matrix), this.pawns.setColorAt(e, r));
	}
	hidePerson(e) {
		this.pawns && (this.dummy.position.set(0, -50, 0), this.dummy.scale.setScalar(1e-4), this.dummy.updateMatrix(), this.pawns.setMatrixAt(e, this.dummy.matrix));
	}
	commitPeople() {
		this.pawns && (this.pawns.instanceMatrix.needsUpdate = !0, this.pawns.instanceColor && (this.pawns.instanceColor.needsUpdate = !0));
	}
	ringAt(e, t = 0) {
		this.selectedRing.visible = e !== null, e !== null && this.selectedRing.position.copy(Z_(e, t, .3));
	}
}, nv = new Z(.55, .5, .45), rv = class {
	scene;
	hood;
	keys = [];
	homeSlot = [];
	visits = /* @__PURE__ */ new Map();
	notices = /* @__PURE__ */ new Map();
	rivals = /* @__PURE__ */ new Map();
	positions = /* @__PURE__ */ new Map();
	constructor(e, t) {
		this.scene = e, this.hood = t;
	}
	setAgents(e) {
		this.keys = [...e].sort(), this.homeSlot = this.keys.map((e) => this.hood.homeOf(e)), this.scene.setPeopleCount(this.keys.length);
	}
	setRivals(e) {
		this.rivals = new Map(e.map((e) => [e.key, e]));
	}
	setVisits(e) {
		this.visits.clear();
		for (let t of e) {
			let e = this.visits.get(t.tick);
			e || this.visits.set(t.tick, e = /* @__PURE__ */ new Map()), e.set(t.agentKey, t.place === "here" ? { kind: "here" } : {
				kind: "rival",
				key: t.place.startsWith("rival:") ? t.place.slice(6) : null
			});
		}
	}
	setNotices(e) {
		this.notices.clear();
		for (let t of e) {
			let e = this.notices.get(t.tick);
			e || this.notices.set(t.tick, e = /* @__PURE__ */ new Set()), e.add(t.agentKey);
		}
	}
	routeFor(e, t) {
		if (t.kind === "here") return this.hood.route(this.homeSlot[e], "here");
		let n = t.key ? this.rivals.get(t.key) : void 0;
		return n ? this.hood.routeToward(this.homeSlot[e], n.key, n.x, n.y) : this.hood.route(this.homeSlot[e], "competitor");
	}
	update(e, t) {
		let n = {
			toCafe: 0,
			inCafe: 0,
			toRival: 0,
			inRival: 0,
			home: 0,
			inRivalByKey: /* @__PURE__ */ new Map()
		}, r = this.visits.get(e), i = this.notices.get(e), a = this.hood.map.radius * 2 / .2;
		return this.positions.clear(), this.keys.forEach((o, s) => {
			let c = r?.get(o);
			if (!c) {
				n.home++, this.scene.hidePerson(s);
				return;
			}
			let l = this.routeFor(s, c), u = Math.max(.03, l.length / a), d = .04 + Mo("leave", o, e) * Math.max(.05, .9 - 2 * u - .1), f = .05 + Mo("stay", o, e) * .07, p = d + u, m = p + f, h = m + u, g = c.kind === "here", _ = g ? X_.toCafe : X_.toRival;
			i?.has(o) && t > p && (_ = X_.noticed);
			let v = null;
			t >= d && t < p ? v = Fo(l, (t - d) / u) : t >= m && t < h && (v = Fo(l, 1 - (t - m) / u), _ = _.clone().lerp(nv, .25)), v ? (this.scene.placePerson(s, v[0], v[1], _), this.positions.set(s, v), g ? n.toCafe++ : n.toRival++) : (this.scene.hidePerson(s), t >= p && t < m ? g ? n.inCafe++ : (n.inRival++, c.kind === "rival" && c.key && n.inRivalByKey.set(c.key, (n.inRivalByKey.get(c.key) ?? 0) + 1)) : n.home++);
		}), this.scene.commitPeople(), n;
	}
}, iv = 2414, av = 11265, ov = 5, sv = (e) => (Math.max(1, e.rating) / 4.5) ** 3 * Math.exp(-e.distanceM / 1200) * (e.priceIndex < .95 ? 1.15 : e.priceIndex > 1.05 ? .85 : 1);
function cv(e = {}) {
	let t = e.host ?? "wss://maincloud.spacetimedb.com", n = e.db ?? "fork-calhacks", r = `fork-sdk-token:${t}/${n}`, i;
	try {
		i = localStorage.getItem(r) ?? void 0;
	} catch {}
	return new Promise((e, a) => {
		let o = (i) => Ao.builder().withUri(t).withDatabaseName(n).withToken(i).onConnect((t, n, i) => {
			try {
				localStorage.setItem(r, i);
			} catch {}
			let a = lv(t, n.toHexString());
			a.subscribe("base", [
				"SELECT * FROM twin_build",
				"SELECT * FROM area_map",
				"SELECT * FROM universe",
				"SELECT * FROM experiment",
				"SELECT * FROM experiment_result",
				"SELECT * FROM experiment_radius",
				"SELECT * FROM cafe",
				"SELECT * FROM menu_item",
				"SELECT * FROM menu_source",
				"SELECT * FROM rival"
			]).then(() => e(a));
		}).onConnectError((e, t) => i ? o(void 0) : a(t)).build();
		o(i);
	});
}
function lv(e, t) {
	let n = /* @__PURE__ */ new Set(), r = !1, i = () => {
		r || (r = !0, requestAnimationFrame(() => {
			r = !1;
			for (let e of n) e();
		}));
	};
	for (let t of Object.values(e.db)) t?.onInsert?.(i), t?.onUpdate?.(i), t?.onDelete?.(i);
	let a = /* @__PURE__ */ new Map(), o = (t) => [...e.db.universe.iter()].filter((e) => e.experimentId === t), s = {
		conn: e,
		identity: t,
		onChange(e) {
			return n.add(e), () => n.delete(e);
		},
		subscribe(t, n) {
			return a.get(t)?.unsubscribe(), a.delete(t), n.length ? new Promise((r) => {
				a.set(t, e.subscriptionBuilder().onApplied(() => (i(), r())).subscribe(n));
			}) : Promise.resolve();
		},
		cafes() {
			return [...e.db.twinBuild.iter()].filter((e) => e.status === "done" && e.universeId !== 0n).map((t) => {
				let n = t.placeJson ? JSON.parse(t.placeJson) : {};
				return {
					buildId: t.id,
					universeId: t.universeId,
					name: e.db.cafe.universeId.find(t.universeId)?.name ?? n.title ?? t.query,
					address: n.address ?? "",
					rating: n.totalScore ?? null,
					reviewsCount: n.reviewsCount ?? null,
					backtestCutoff: t.cutoffDate === "scan" ? "" : t.cutoffDate,
					menuSource: e.db.menuSource.buildId.find(t.id)?.source ?? "provided",
					mapReady: e.db.areaMap.buildId.find(t.id)?.status === "ready"
				};
			});
		},
		menu(t) {
			return [...e.db.menuItem.iter()].filter((e) => e.universeId === t).map((e) => ({
				key: e.key,
				name: e.name,
				category: e.category,
				priceCents: e.priceCents
			}));
		},
		rivals(t) {
			return [...e.db.rival.iter()].filter((e) => e.buildId === t).map((e) => ({
				key: e.key,
				name: e.name,
				x: e.x,
				y: e.y,
				distanceM: e.distanceM,
				rating: e.rating,
				priceIndex: e.priceIndex,
				weight: sv(e)
			})).sort((e, t) => e.distanceM - t.distanceM);
		},
		experiments(t) {
			return [...e.db.experiment.iter()].filter((e) => e.baseUniverseId === t).sort((e, t) => Number(t.id - e.id)).map((t) => ({
				id: t.id,
				label: t.label,
				status: t.status,
				copies: t.copies,
				days: t.days,
				radiusM: e.db.experimentRadius.experimentId.find(t.id)?.radiusM ?? 2414
			}));
		},
		results(t) {
			let n = e.db.experiment.id.find(t);
			if (!n) return null;
			let r = [...e.db.experimentResult.iter()].filter((e) => e.experimentId === t), i = r.find((e) => e.optionLabel === "no change") ?? r[0], a = r.find((e) => e !== i);
			return {
				label: n.label,
				status: n.status,
				copies: n.copies,
				profitWins: a?.profitWins ?? 0,
				visitsChangePct: a && i ? (a.meanVisits / (i.meanVisits || 1) - 1) * 100 : 0,
				starsChange: a && i ? a.meanStars - i.meanStars : 0,
				priceMentionShare: a?.priceMentionShare ?? 0,
				profitChangePerMonth: a && i ? Number(a.meanProfitCents - i.meanProfitCents) / 100 / n.days * 30 : 0,
				revenueChangePerMonth: a && i ? Number(a.meanRevenueCents - i.meanRevenueCents) / 100 / n.days * 30 : 0,
				baselineProfitPerMonth: i ? Number(i.meanProfitCents) / 100 / n.days * 30 : 0
			};
		},
		dailyRevenue(t) {
			let n = /* @__PURE__ */ new Map(), r = [...e.db.dailyMetric.iter()];
			for (let e of o(t)) {
				let t = r.filter((t) => t.universeId === e.id).sort((e, t) => e.tick - t.tick).map((e) => Number(e.revenueCents) / 100);
				t.length && (n.has(e.optionLabel) || n.set(e.optionLabel, []), n.get(e.optionLabel).push(t));
			}
			return n;
		},
		gainers(t) {
			let n = e.db.experiment.id.find(t), r = o(t);
			if (!n || !r.length) return [];
			let i = e.db.universeBuild.universeId.find(n.baseUniverseId)?.buildId, a = new Map([...e.db.rival.iter()].filter((e) => e.buildId === i).map((e) => [e.key, e.name])), s = e.db.cafe.universeId.find(n.baseUniverseId)?.customerScale ?? 4, c = /* @__PURE__ */ new Map(), l = /* @__PURE__ */ new Map();
			for (let t of r) {
				l.set(t.optionLabel, (l.get(t.optionLabel) ?? 0) + 1);
				let n = c.get(t.optionLabel) ?? /* @__PURE__ */ new Map();
				for (let r of e.db.rivalTally.iter()) r.universeId === t.id && n.set(r.rivalKey, (n.get(r.rivalKey) ?? 0) + r.visits);
				c.set(t.optionLabel, n);
			}
			let u = (e, t) => e / (l.get(t) || 1) / Math.max(1, n.days) * s, d = c.get("no change") ?? /* @__PURE__ */ new Map();
			return [...c.get("price change") ?? /* @__PURE__ */ new Map()].map(([e, t]) => ({
				name: a.get(e) ?? e,
				perDay: u(t, "price change") - u(d.get(e) ?? 0, "no change")
			})).filter((e) => e.perDay >= .5).sort((e, t) => t.perDay - e.perDay);
		},
		watchExperiment(e) {
			return s.subscribe(`exp:${e}`, o(e).flatMap((e) => [`SELECT * FROM daily_metric WHERE universe_id = ${e.id}`, `SELECT * FROM rival_tally WHERE universe_id = ${e.id}`]));
		},
		runExperiment(t) {
			return e.reducers.startExperimentR({
				baseUniverseId: t.rootUniverseId,
				label: t.label,
				optionsJson: JSON.stringify([{
					label: "no change",
					prices: {}
				}, {
					label: "price change",
					prices: t.prices
				}]),
				copies: t.copies ?? 10,
				days: t.days ?? 60,
				brain: "ai",
				radiusM: t.radiusM ?? 2414
			});
		}
	};
	return s;
}
var uv = class {
	fork;
	scene;
	hood = null;
	crowd = null;
	buildId = null;
	root = null;
	universeId = null;
	dayFloat = 0;
	selected = null;
	dirty = !0;
	playing = !1;
	speed = 1;
	radiusM = iv;
	onDay = () => {};
	onPick = () => {};
	constructor(e, t) {
		this.fork = t, dv(), this.scene = new tv(e), this.scene.onFrame = (e) => this.frame(e), this.scene.onPick = (e) => {
			this.selected = e, this.onPick(e === null ? null : this.customer(e));
		}, t.onChange(() => this.dirty = !0);
	}
	async showCafe(e) {
		let t = this.fork.conn, n = t.db.twinBuild.id.find(e), r = t.db.areaMap.buildId.find(e);
		if (!n || !r || r.status !== "ready") throw Error("This café has no neighborhood map yet.");
		this.buildId = e, this.root = n.universeId, this.universeId = null;
		let i = JSON.parse(r.mapJson);
		this.hood = new Io(i), this.scene.setMap(i), this.crowd = new rv(this.scene, this.hood), await this.fork.subscribe("map-root", [`SELECT * FROM agent WHERE universe_id = ${this.root}`]), this.crowd.setAgents([...t.db.agent.iter()].filter((e) => e.universeId === this.root).map((e) => e.key)), this.setRadius(this.radiusM);
	}
	setRadius(e) {
		if (this.radiusM = e, !this.crowd || this.buildId === null) return;
		let t = this.fork.rivals(this.buildId);
		this.crowd.setRivals(t.map((e) => ({
			key: e.key,
			x: e.x,
			y: e.y
		}))), this.scene.setRivals(t.filter((t) => t.distanceM <= e), e);
	}
	async showExperiment(e, t = "price change") {
		let n = [...this.fork.conn.db.universe.iter()].find((n) => n.experimentId === e && n.optionLabel === t && n.copyNumber === 1);
		if (!n) throw Error("That experiment has no animated copy.");
		let r = this.fork.conn.db.experimentRadius.experimentId.find(e)?.radiusM;
		r && this.setRadius(r), this.universeId = n.id, this.dayFloat = n.forkTick + 1, this.selected = null, await this.fork.subscribe("map-play", [
			`SELECT * FROM visit WHERE universe_id = ${n.id}`,
			`SELECT * FROM event WHERE universe_id = ${n.id}`,
			`SELECT * FROM agent WHERE universe_id = ${n.id}`,
			`SELECT * FROM memory WHERE universe_id = ${n.id}`,
			`SELECT * FROM review WHERE universe_id = ${n.id}`
		]), this.dirty = !0;
	}
	play() {
		this.playing = !0;
	}
	pause() {
		this.playing = !1;
	}
	seek(e) {
		let t = this.universe();
		t && (this.dayFloat = t.forkTick + Math.max(1, e) + .001);
	}
	setSpeed(e) {
		this.speed = e;
	}
	rotate(e) {
		this.scene.rotate(e);
	}
	universe() {
		return this.universeId === null ? void 0 : this.fork.conn.db.universe.id.find(this.universeId);
	}
	frame(e) {
		let t = this.universe();
		if (!this.crowd || !t) return;
		let n = t.forkTick + 1, r = t.currentTick;
		if (r < n) return;
		if (this.playing && (this.dayFloat += e * this.speed / ov), this.dayFloat >= r + 1 && (this.dayFloat = this.playing ? n : r + .999), this.dayFloat < n && (this.dayFloat = n), this.dirty) {
			this.dirty = !1;
			let e = this.fork.conn.db;
			this.crowd.setVisits([...e.visit.iter()].filter((e) => e.universeId === t.id)), this.crowd.setNotices([...e.event.iter()].filter((e) => e.universeId === t.id && e.kind === "notice_price"));
		}
		let i = Math.floor(this.dayFloat), a = this.crowd.update(i, this.dayFloat - i), o = this.selected === null ? void 0 : this.crowd.positions.get(this.selected);
		this.scene.ringAt(o ? o[0] : null, o ? o[1] : 0), this.scene.setPinNote("cafe", `${a.inCafe} inside`), this.onDay({
			day: i - n + 1,
			of: r - n + 1,
			tally: a
		});
	}
	customer(e) {
		let t = this.universe(), n = this.crowd?.keys[e];
		if (!t || !n) return null;
		let r = this.fork.conn.db, i = [...r.agent.iter()].find((e) => e.universeId === t.id && e.key === n);
		if (!i) return null;
		let a = new Map([...r.menuItem.iter()].filter((e) => e.universeId === t.id).map((e) => [e.key, e.name]));
		return {
			key: n,
			name: i.name,
			type: i.archetype,
			visitsPerWeek: i.visitsPerWeek,
			priceSensitivity: i.priceSensitivity,
			shareHere: i.pHere / (i.pHere + i.pCompetitor || 1),
			mood: i.satisfaction,
			usualOrder: JSON.parse(i.usualOrder).map((e) => a.get(e) ?? e),
			memories: [...r.memory.iter()].filter((e) => e.universeId === t.id && e.agentKey === n).sort((e, t) => e.tick - t.tick).map((e) => ({
				day: e.tick < 0 ? null : e.tick - t.forkTick,
				text: e.text
			})),
			reviews: [...r.review.iter()].filter((e) => e.universeId === t.id && e.agentKey === n).map((e) => ({
				day: e.tick - t.forkTick,
				stars: e.stars,
				text: e.text
			}))
		};
	}
};
function dv() {
	if (document.getElementById("fork-sdk-styles")) return;
	let e = document.createElement("style");
	e.id = "fork-sdk-styles", e.textContent = "\n.pin{position:fixed;pointer-events:none;transform:translate(-50%,-100%);font:600 11px ui-monospace,'IBM Plex Mono',monospace;letter-spacing:.06em;text-transform:uppercase;padding:4px 8px;border-radius:4px;color:#fff;white-space:nowrap;z-index:3}\n.pin.cafe{background:#d9472b}.pin.rival{background:#1f6f6b}.pin span{opacity:.8;font-weight:400;margin-left:6px}", document.head.appendChild(e);
}
export { iv as DEFAULT_RADIUS_M, uv as ForkMap, av as MAX_RADIUS_M, cv as connectFork, sv as pull };
