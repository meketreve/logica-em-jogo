(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=1e3,t=1001,n=1002,r=1003,i=1004,a=1005,o=1006,s=1007,c=1008,l=1009,u=1010,d=1011,f=1012,p=1013,m=1014,h=1015,g=1016,_=1017,v=1018,y=1020,b=35902,x=35899,S=1021,C=1022,w=1023,T=1026,E=1027,D=1028,ee=1029,O=1030,k=1031,te=1033,A=33776,j=33777,ne=33778,re=33779,M=35840,ie=35841,ae=35842,oe=35843,se=36196,ce=37492,le=37496,ue=37488,N=37489,de=37490,fe=37491,pe=37808,me=37809,he=37810,ge=37811,_e=37812,ve=37813,ye=37814,be=37815,xe=37816,Se=37817,Ce=37818,we=37819,Te=37820,Ee=37821,De=36492,Oe=36494,ke=36495,Ae=36283,je=36284,Me=36285,Ne=36286,Pe=2300,P=2301,Fe=2302,Ie=2303,Le=2400,F=2401,Re=2402,I=3200,ze=`srgb`,Be=`srgb-linear`,Ve=`linear`,He=`srgb`,Ue=7680,We=35044,Ge=2e3;function Ke(e){for(let t=e.length-1;t>=0;--t)if(e[t]>=65535)return!0;return!1}function qe(e){return ArrayBuffer.isView(e)&&!(e instanceof DataView)}function Je(e){return document.createElementNS(`http://www.w3.org/1999/xhtml`,e)}function Ye(){let e=Je(`canvas`);return e.style.display=`block`,e}var Xe={};function Ze(...e){let t=`THREE.`+e.shift();console.log(t,...e)}function Qe(e){let t=e[0];if(typeof t==`string`&&t.startsWith(`TSL:`)){let t=e[1];t&&t.isStackTrace?e[0]+=` `+t.getLocation():e[1]=`Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.`}return e}function L(...e){e=Qe(e);let t=`THREE.`+e.shift();{let n=e[0];n&&n.isStackTrace?console.warn(n.getError(t)):console.warn(t,...e)}}function R(...e){e=Qe(e);let t=`THREE.`+e.shift();{let n=e[0];n&&n.isStackTrace?console.error(n.getError(t)):console.error(t,...e)}}function $e(...e){let t=e.join(` `);t in Xe||(Xe[t]=!0,L(...e))}function et(e,t,n){return new Promise(function(r,i){function a(){switch(e.clientWaitSync(t,e.SYNC_FLUSH_COMMANDS_BIT,0)){case e.WAIT_FAILED:i();break;case e.TIMEOUT_EXPIRED:setTimeout(a,n);break;default:r()}}setTimeout(a,n)})}var tt={0:1,2:6,4:7,3:5,1:0,6:2,7:4,5:3},nt=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n!==void 0&&n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let r=n[e];if(r!==void 0){let e=r.indexOf(t);e!==-1&&r.splice(e,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let t=n.slice(0);for(let n=0,r=t.length;n<r;n++)t[n].call(this,e);e.target=null}}},rt=`00.01.02.03.04.05.06.07.08.09.0a.0b.0c.0d.0e.0f.10.11.12.13.14.15.16.17.18.19.1a.1b.1c.1d.1e.1f.20.21.22.23.24.25.26.27.28.29.2a.2b.2c.2d.2e.2f.30.31.32.33.34.35.36.37.38.39.3a.3b.3c.3d.3e.3f.40.41.42.43.44.45.46.47.48.49.4a.4b.4c.4d.4e.4f.50.51.52.53.54.55.56.57.58.59.5a.5b.5c.5d.5e.5f.60.61.62.63.64.65.66.67.68.69.6a.6b.6c.6d.6e.6f.70.71.72.73.74.75.76.77.78.79.7a.7b.7c.7d.7e.7f.80.81.82.83.84.85.86.87.88.89.8a.8b.8c.8d.8e.8f.90.91.92.93.94.95.96.97.98.99.9a.9b.9c.9d.9e.9f.a0.a1.a2.a3.a4.a5.a6.a7.a8.a9.aa.ab.ac.ad.ae.af.b0.b1.b2.b3.b4.b5.b6.b7.b8.b9.ba.bb.bc.bd.be.bf.c0.c1.c2.c3.c4.c5.c6.c7.c8.c9.ca.cb.cc.cd.ce.cf.d0.d1.d2.d3.d4.d5.d6.d7.d8.d9.da.db.dc.dd.de.df.e0.e1.e2.e3.e4.e5.e6.e7.e8.e9.ea.eb.ec.ed.ee.ef.f0.f1.f2.f3.f4.f5.f6.f7.f8.f9.fa.fb.fc.fd.fe.ff`.split(`.`),it=Math.PI/180,at=180/Math.PI;function ot(){let e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0,r=Math.random()*4294967295|0;return(rt[e&255]+rt[e>>8&255]+rt[e>>16&255]+rt[e>>24&255]+`-`+rt[t&255]+rt[t>>8&255]+`-`+rt[t>>16&15|64]+rt[t>>24&255]+`-`+rt[n&63|128]+rt[n>>8&255]+`-`+rt[n>>16&255]+rt[n>>24&255]+rt[r&255]+rt[r>>8&255]+rt[r>>16&255]+rt[r>>24&255]).toLowerCase()}function st(e,t,n){return Math.max(t,Math.min(n,e))}function ct(e,t){return(e%t+t)%t}function lt(e,t,n){return(1-n)*e+n*t}function ut(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return e/4294967295;case Uint16Array:return e/65535;case Uint8Array:return e/255;case Int32Array:return Math.max(e/2147483647,-1);case Int16Array:return Math.max(e/32767,-1);case Int8Array:return Math.max(e/127,-1);default:throw Error(`THREE.MathUtils: Invalid component type.`)}}function dt(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return Math.round(e*4294967295);case Uint16Array:return Math.round(e*65535);case Uint8Array:return Math.round(e*255);case Int32Array:return Math.round(e*2147483647);case Int16Array:return Math.round(e*32767);case Int8Array:return Math.round(e*127);default:throw Error(`THREE.MathUtils: Invalid component type.`)}}var z=class e{static{e.prototype.isVector2=!0}constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw Error(`THREE.Vector2: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw Error(`THREE.Vector2: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6],this.y=r[1]*t+r[4]*n+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=st(this.x,e.x,t.x),this.y=st(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=st(this.x,e,t),this.y=st(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(st(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(st(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),r=Math.sin(t),i=this.x-e.x,a=this.y-e.y;return this.x=i*n-a*r+e.x,this.y=i*r+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},ft=class{constructor(e=0,t=0,n=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=r}static slerpFlat(e,t,n,r,i,a,o){let s=n[r+0],c=n[r+1],l=n[r+2],u=n[r+3],d=i[a+0],f=i[a+1],p=i[a+2],m=i[a+3];if(u!==m||s!==d||c!==f||l!==p){let e=s*d+c*f+l*p+u*m;e<0&&(d=-d,f=-f,p=-p,m=-m,e=-e);let t=1-o;if(e<.9995){let n=Math.acos(e),r=Math.sin(n);t=Math.sin(t*n)/r,o=Math.sin(o*n)/r,s=s*t+d*o,c=c*t+f*o,l=l*t+p*o,u=u*t+m*o}else{s=s*t+d*o,c=c*t+f*o,l=l*t+p*o,u=u*t+m*o;let e=1/Math.sqrt(s*s+c*c+l*l+u*u);s*=e,c*=e,l*=e,u*=e}}e[t]=s,e[t+1]=c,e[t+2]=l,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,r,i,a){let o=n[r],s=n[r+1],c=n[r+2],l=n[r+3],u=i[a],d=i[a+1],f=i[a+2],p=i[a+3];return e[t]=o*p+l*u+s*f-c*d,e[t+1]=s*p+l*d+c*u-o*f,e[t+2]=c*p+l*f+o*d-s*u,e[t+3]=l*p-o*u-s*d-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,r){return this._x=e,this._y=t,this._z=n,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,r=e._y,i=e._z,a=e._order,o=Math.cos,s=Math.sin,c=o(n/2),l=o(r/2),u=o(i/2),d=s(n/2),f=s(r/2),p=s(i/2);switch(a){case`XYZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`YXZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`ZXY`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`ZYX`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`YZX`:this._x=d*l*u+c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u-d*f*p;break;case`XZY`:this._x=d*l*u-c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u+d*f*p;break;default:L(`Quaternion: .setFromEuler() encountered an unknown order: `+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,r=Math.sin(n);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],r=t[4],i=t[8],a=t[1],o=t[5],s=t[9],c=t[2],l=t[6],u=t[10],d=n+o+u;if(d>0){let e=.5/Math.sqrt(d+1);this._w=.25/e,this._x=(l-s)*e,this._y=(i-c)*e,this._z=(a-r)*e}else if(n>o&&n>u){let e=2*Math.sqrt(1+n-o-u);this._w=(l-s)/e,this._x=.25*e,this._y=(r+a)/e,this._z=(i+c)/e}else if(o>u){let e=2*Math.sqrt(1+o-n-u);this._w=(i-c)/e,this._x=(r+a)/e,this._y=.25*e,this._z=(s+l)/e}else{let e=2*Math.sqrt(1+u-n-o);this._w=(a-r)/e,this._x=(i+c)/e,this._y=(s+l)/e,this._z=.25*e}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(st(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let r=Math.min(1,t/n);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x*=e,this._y*=e,this._z*=e,this._w*=e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,r=e._y,i=e._z,a=e._w,o=t._x,s=t._y,c=t._z,l=t._w;return this._x=n*l+a*o+r*c-i*s,this._y=r*l+a*s+i*o-n*c,this._z=i*l+a*c+n*s-r*o,this._w=a*l-n*o-r*s-i*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,r=e._y,i=e._z,a=e._w,o=this.dot(e);o<0&&(n=-n,r=-r,i=-i,a=-a,o=-o);let s=1-t;if(o<.9995){let e=Math.acos(o),c=Math.sin(e);s=Math.sin(s*e)/c,t=Math.sin(t*e)/c,this._x=this._x*s+n*t,this._y=this._y*s+r*t,this._z=this._z*s+i*t,this._w=this._w*s+a*t,this._onChangeCallback()}else this._x=this._x*s+n*t,this._y=this._y*s+r*t,this._z=this._z*s+i*t,this._w=this._w*s+a*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),r=Math.sqrt(1-n),i=Math.sqrt(n);return this.set(r*Math.sin(e),r*Math.cos(e),i*Math.sin(t),i*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},B=class e{static{e.prototype.isVector3=!0}constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw Error(`THREE.Vector3: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw Error(`THREE.Vector3: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(mt.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(mt.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6]*r,this.y=i[1]*t+i[4]*n+i[7]*r,this.z=i[2]*t+i[5]*n+i[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=e.elements,a=1/(i[3]*t+i[7]*n+i[11]*r+i[15]);return this.x=(i[0]*t+i[4]*n+i[8]*r+i[12])*a,this.y=(i[1]*t+i[5]*n+i[9]*r+i[13])*a,this.z=(i[2]*t+i[6]*n+i[10]*r+i[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,r=this.z,i=e.x,a=e.y,o=e.z,s=e.w,c=2*(a*r-o*n),l=2*(o*t-i*r),u=2*(i*n-a*t);return this.x=t+s*c+a*u-o*l,this.y=n+s*l+o*c-i*u,this.z=r+s*u+i*l-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[4]*n+i[8]*r,this.y=i[1]*t+i[5]*n+i[9]*r,this.z=i[2]*t+i[6]*n+i[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=st(this.x,e.x,t.x),this.y=st(this.y,e.y,t.y),this.z=st(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=st(this.x,e,t),this.y=st(this.y,e,t),this.z=st(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(st(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,r=e.y,i=e.z,a=t.x,o=t.y,s=t.z;return this.x=r*s-i*o,this.y=i*a-n*s,this.z=n*o-r*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return pt.copy(this).projectOnVector(e),this.sub(pt)}reflect(e){return this.sub(pt.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(st(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,r=this.z-e.z;return t*t+n*n+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let r=Math.sin(t)*e;return this.x=r*Math.sin(n),this.y=Math.cos(t)*e,this.z=r*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},pt=new B,mt=new ft,V=class e{static{e.prototype.isMatrix3=!0}constructor(e,t,n,r,i,a,o,s,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,r,i,a,o,s,c)}set(e,t,n,r,i,a,o,s,c){let l=this.elements;return l[0]=e,l[1]=r,l[2]=o,l[3]=t,l[4]=i,l[5]=s,l[6]=n,l[7]=a,l[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[3],s=n[6],c=n[1],l=n[4],u=n[7],d=n[2],f=n[5],p=n[8],m=r[0],h=r[3],g=r[6],_=r[1],v=r[4],y=r[7],b=r[2],x=r[5],S=r[8];return i[0]=a*m+o*_+s*b,i[3]=a*h+o*v+s*x,i[6]=a*g+o*y+s*S,i[1]=c*m+l*_+u*b,i[4]=c*h+l*v+u*x,i[7]=c*g+l*y+u*S,i[2]=d*m+f*_+p*b,i[5]=d*h+f*v+p*x,i[8]=d*g+f*y+p*S,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8];return t*a*l-t*o*c-n*i*l+n*o*s+r*i*c-r*a*s}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=l*a-o*c,d=o*s-l*i,f=c*i-a*s,p=t*u+n*d+r*f;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);let m=1/p;return e[0]=u*m,e[1]=(r*c-l*n)*m,e[2]=(o*n-r*a)*m,e[3]=d*m,e[4]=(l*t-r*s)*m,e[5]=(r*i-o*t)*m,e[6]=f*m,e[7]=(n*s-c*t)*m,e[8]=(a*t-n*i)*m,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,r,i,a,o){let s=Math.cos(i),c=Math.sin(i);return this.set(n*s,n*c,-n*(s*a+c*o)+a+e,-r*c,r*s,-r*(-c*a+s*o)+o+t,0,0,1),this}scale(e,t){return $e(`Matrix3: .scale() is deprecated. Use .makeScale() instead.`),this.premultiply(ht.makeScale(e,t)),this}rotate(e){return $e(`Matrix3: .rotate() is deprecated. Use .makeRotation() instead.`),this.premultiply(ht.makeRotation(-e)),this}translate(e,t){return $e(`Matrix3: .translate() is deprecated. Use .makeTranslation() instead.`),this.premultiply(ht.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<9;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},ht=new V,gt=new V().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),_t=new V().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function vt(){let e={enabled:!0,workingColorSpace:Be,spaces:{},convert:function(e,t,n){return this.enabled===!1||t===n||!t||!n?e:(this.spaces[t].transfer===`srgb`&&(e.r=bt(e.r),e.g=bt(e.g),e.b=bt(e.b)),this.spaces[t].primaries!==this.spaces[n].primaries&&(e.applyMatrix3(this.spaces[t].toXYZ),e.applyMatrix3(this.spaces[n].fromXYZ)),this.spaces[n].transfer===`srgb`&&(e.r=xt(e.r),e.g=xt(e.g),e.b=xt(e.b)),e)},workingToColorSpace:function(e,t){return this.convert(e,this.workingColorSpace,t)},colorSpaceToWorking:function(e,t){return this.convert(e,t,this.workingColorSpace)},getPrimaries:function(e){return this.spaces[e].primaries},getTransfer:function(e){return e===``?Ve:this.spaces[e].transfer},getToneMappingMode:function(e){return this.spaces[e].outputColorSpaceConfig.toneMappingMode||`standard`},getLuminanceCoefficients:function(e,t=this.workingColorSpace){return e.fromArray(this.spaces[t].luminanceCoefficients)},define:function(e){Object.assign(this.spaces,e)},_getMatrix:function(e,t,n){return e.copy(this.spaces[t].toXYZ).multiply(this.spaces[n].fromXYZ)},_getDrawingBufferColorSpace:function(e){return this.spaces[e].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(e=this.workingColorSpace){return this.spaces[e].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(t,n){return $e(`ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace().`),e.workingToColorSpace(t,n)},toWorkingColorSpace:function(t,n){return $e(`ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking().`),e.colorSpaceToWorking(t,n)}},t=[.64,.33,.3,.6,.15,.06],n=[.2126,.7152,.0722],r=[.3127,.329];return e.define({[Be]:{primaries:t,whitePoint:r,transfer:Ve,toXYZ:gt,fromXYZ:_t,luminanceCoefficients:n,workingColorSpaceConfig:{unpackColorSpace:ze},outputColorSpaceConfig:{drawingBufferColorSpace:ze}},[ze]:{primaries:t,whitePoint:r,transfer:He,toXYZ:gt,fromXYZ:_t,luminanceCoefficients:n,outputColorSpaceConfig:{drawingBufferColorSpace:ze}}}),e}var yt=vt();function bt(e){return e<.04045?e*.0773993808:(e*.9478672986+.0521327014)**2.4}function xt(e){return e<.0031308?e*12.92:1.055*e**.41666-.055}var St,Ct=class{static getDataURL(e,t=`image/png`){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>`u`)return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{St===void 0&&(St=Je(`canvas`)),St.width=e.width,St.height=e.height;let t=St.getContext(`2d`);e instanceof ImageData?t.putImageData(e,0,0):t.drawImage(e,0,0,e.width,e.height),n=St}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap){let t=Je(`canvas`);t.width=e.width,t.height=e.height;let n=t.getContext(`2d`);n.drawImage(e,0,0,e.width,e.height);let r=n.getImageData(0,0,e.width,e.height),i=r.data;for(let e=0;e<i.length;e++)i[e]=bt(i[e]/255)*255;return n.putImageData(r,0,0),t}else if(e.data){let t=e.data.slice(0);for(let e=0;e<t.length;e++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[e]=Math.floor(bt(t[e]/255)*255):t[e]=bt(t[e]);return{data:t,width:e.width,height:e.height}}else return L(`ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied.`),e}},wt=0,Tt=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:wt++}),this.uuid=ot(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<`u`&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<`u`&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t===null?e.set(0,0,0):e.set(t.width,t.height,t.depth||0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:``},r=this.data;if(r!==null){let e;if(Array.isArray(r)){e=[];for(let t=0,n=r.length;t<n;t++)r[t].isDataTexture?e.push(Et(r[t].image)):e.push(Et(r[t]))}else e=Et(r);n.url=e}return t||(e.images[this.uuid]=n),n}};function Et(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap?Ct.getDataURL(e):e.data?{data:Array.from(e.data),width:e.width,height:e.height,type:e.data.constructor.name}:(L(`Texture: Unable to serialize Texture.`),{})}var Dt=0,Ot=new B,kt=class r extends nt{constructor(e=r.DEFAULT_IMAGE,n=r.DEFAULT_MAPPING,i=t,a=t,s=o,u=c,d=w,f=l,p=r.DEFAULT_ANISOTROPY,m=``){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Dt++}),this.uuid=ot(),this.name=``,this.source=new Tt(e),this.mipmaps=[],this.mapping=n,this.channel=0,this.wrapS=i,this.wrapT=a,this.magFilter=s,this.minFilter=u,this.anisotropy=p,this.format=d,this.internalFormat=null,this.type=f,this.offset=new z(0,0),this.repeat=new z(1,1),this.center=new z(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new V,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=m,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(Ot).x}get height(){return this.source.getSize(Ot).y}get depth(){return this.source.getSize(Ot).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){L(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){L(`Texture.setValues(): property '${t}' does not exist.`);continue}r&&n&&r.isVector2&&n.isVector2||r&&n&&r.isVector3&&n.isVector3||r&&n&&r.isMatrix3&&n.isMatrix3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:`Texture`,generator:`Texture.toJSON`},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:`dispose`})}transformUv(r){if(this.mapping!==300)return r;if(r.applyMatrix3(this.matrix),r.x<0||r.x>1)switch(this.wrapS){case e:r.x-=Math.floor(r.x);break;case t:r.x=r.x<0?0:1;break;case n:Math.abs(Math.floor(r.x)%2)===1?r.x=Math.ceil(r.x)-r.x:r.x-=Math.floor(r.x);break}if(r.y<0||r.y>1)switch(this.wrapT){case e:r.y-=Math.floor(r.y);break;case t:r.y=r.y<0?0:1;break;case n:Math.abs(Math.floor(r.y)%2)===1?r.y=Math.ceil(r.y)-r.y:r.y-=Math.floor(r.y);break}return this.flipY&&(r.y=1-r.y),r}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};kt.DEFAULT_IMAGE=null,kt.DEFAULT_MAPPING=300,kt.DEFAULT_ANISOTROPY=1;var At=class e{static{e.prototype.isVector4=!0}constructor(e=0,t=0,n=0,r=1){this.x=e,this.y=t,this.z=n,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,r){return this.x=e,this.y=t,this.z=n,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw Error(`THREE.Vector4: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw Error(`THREE.Vector4: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w===void 0?1:e.w,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*r+a[12]*i,this.y=a[1]*t+a[5]*n+a[9]*r+a[13]*i,this.z=a[2]*t+a[6]*n+a[10]*r+a[14]*i,this.w=a[3]*t+a[7]*n+a[11]*r+a[15]*i,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,r,i,a=.01,o=.1,s=e.elements,c=s[0],l=s[4],u=s[8],d=s[1],f=s[5],p=s[9],m=s[2],h=s[6],g=s[10];if(Math.abs(l-d)<a&&Math.abs(u-m)<a&&Math.abs(p-h)<a){if(Math.abs(l+d)<o&&Math.abs(u+m)<o&&Math.abs(p+h)<o&&Math.abs(c+f+g-3)<o)return this.set(1,0,0,0),this;t=Math.PI;let e=(c+1)/2,s=(f+1)/2,_=(g+1)/2,v=(l+d)/4,y=(u+m)/4,b=(p+h)/4;return e>s&&e>_?e<a?(n=0,r=.707106781,i=.707106781):(n=Math.sqrt(e),r=v/n,i=y/n):s>_?s<a?(n=.707106781,r=0,i=.707106781):(r=Math.sqrt(s),n=v/r,i=b/r):_<a?(n=.707106781,r=.707106781,i=0):(i=Math.sqrt(_),n=y/i,r=b/i),this.set(n,r,i,t),this}let _=Math.sqrt((h-p)*(h-p)+(u-m)*(u-m)+(d-l)*(d-l));return Math.abs(_)<.001&&(_=1),this.x=(h-p)/_,this.y=(u-m)/_,this.z=(d-l)/_,this.w=Math.acos((c+f+g-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=st(this.x,e.x,t.x),this.y=st(this.y,e.y,t.y),this.z=st(this.z,e.z,t.z),this.w=st(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=st(this.x,e,t),this.y=st(this.y,e,t),this.z=st(this.z,e,t),this.w=st(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(st(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},jt=class extends nt{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:o,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new At(0,0,e,t),this.scissorTest=!1,this.viewport=new At(0,0,e,t),this.textures=[];let r=new kt({width:e,height:t,depth:n.depth}),i=n.count;for(let e=0;e<i;e++)this.textures[e]=r.clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:o,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let e=0;e<this.textures.length;e++)this.textures[e].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let r=0,i=this.textures.length;r<i;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=n,this.textures[r].isData3DTexture!==!0&&(this.textures[r].isArrayTexture=this.textures[r].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let n=Object.assign({},e.textures[t].image);this.textures[t].source=new Tt(n)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:`dispose`})}},Mt=class extends jt{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},Nt=class extends kt{constructor(e=null,n=1,i=1,a=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:n,height:i,depth:a},this.magFilter=r,this.minFilter=r,this.wrapR=t,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}},Pt=class extends kt{constructor(e=null,n=1,i=1,a=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:n,height:i,depth:a},this.magFilter=r,this.minFilter=r,this.wrapR=t,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},Ft=class e{static{e.prototype.isMatrix4=!0}constructor(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h)}set(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h){let g=this.elements;return g[0]=e,g[4]=t,g[8]=n,g[12]=r,g[1]=i,g[5]=a,g[9]=o,g[13]=s,g[2]=c,g[6]=l,g[10]=u,g[14]=d,g[3]=f,g[7]=p,g[11]=m,g[15]=h,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new e().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,n=e.elements,r=1/It.setFromMatrixColumn(e,0).length(),i=1/It.setFromMatrixColumn(e,1).length(),a=1/It.setFromMatrixColumn(e,2).length();return t[0]=n[0]*r,t[1]=n[1]*r,t[2]=n[2]*r,t[3]=0,t[4]=n[4]*i,t[5]=n[5]*i,t[6]=n[6]*i,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,r=e.y,i=e.z,a=Math.cos(n),o=Math.sin(n),s=Math.cos(r),c=Math.sin(r),l=Math.cos(i),u=Math.sin(i);if(e.order===`XYZ`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=-s*u,t[8]=c,t[1]=n+r*c,t[5]=e-i*c,t[9]=-o*s,t[2]=i-e*c,t[6]=r+n*c,t[10]=a*s}else if(e.order===`YXZ`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e+i*o,t[4]=r*o-n,t[8]=a*c,t[1]=a*u,t[5]=a*l,t[9]=-o,t[2]=n*o-r,t[6]=i+e*o,t[10]=a*s}else if(e.order===`ZXY`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e-i*o,t[4]=-a*u,t[8]=r+n*o,t[1]=n+r*o,t[5]=a*l,t[9]=i-e*o,t[2]=-a*c,t[6]=o,t[10]=a*s}else if(e.order===`ZYX`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=r*c-n,t[8]=e*c+i,t[1]=s*u,t[5]=i*c+e,t[9]=n*c-r,t[2]=-c,t[6]=o*s,t[10]=a*s}else if(e.order===`YZX`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=i-e*u,t[8]=r*u+n,t[1]=u,t[5]=a*l,t[9]=-o*l,t[2]=-c*l,t[6]=n*u+r,t[10]=e-i*u}else if(e.order===`XZY`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=-u,t[8]=c*l,t[1]=e*u+i,t[5]=a*l,t[9]=n*u-r,t[2]=r*u-n,t[6]=o*l,t[10]=i*u+e}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Rt,e,zt)}lookAt(e,t,n){let r=this.elements;return Ht.subVectors(e,t),Ht.lengthSq()===0&&(Ht.z=1),Ht.normalize(),Bt.crossVectors(n,Ht),Bt.lengthSq()===0&&(Math.abs(n.z)===1?Ht.x+=1e-4:Ht.z+=1e-4,Ht.normalize(),Bt.crossVectors(n,Ht)),Bt.normalize(),Vt.crossVectors(Ht,Bt),r[0]=Bt.x,r[4]=Vt.x,r[8]=Ht.x,r[1]=Bt.y,r[5]=Vt.y,r[9]=Ht.y,r[2]=Bt.z,r[6]=Vt.z,r[10]=Ht.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[4],s=n[8],c=n[12],l=n[1],u=n[5],d=n[9],f=n[13],p=n[2],m=n[6],h=n[10],g=n[14],_=n[3],v=n[7],y=n[11],b=n[15],x=r[0],S=r[4],C=r[8],w=r[12],T=r[1],E=r[5],D=r[9],ee=r[13],O=r[2],k=r[6],te=r[10],A=r[14],j=r[3],ne=r[7],re=r[11],M=r[15];return i[0]=a*x+o*T+s*O+c*j,i[4]=a*S+o*E+s*k+c*ne,i[8]=a*C+o*D+s*te+c*re,i[12]=a*w+o*ee+s*A+c*M,i[1]=l*x+u*T+d*O+f*j,i[5]=l*S+u*E+d*k+f*ne,i[9]=l*C+u*D+d*te+f*re,i[13]=l*w+u*ee+d*A+f*M,i[2]=p*x+m*T+h*O+g*j,i[6]=p*S+m*E+h*k+g*ne,i[10]=p*C+m*D+h*te+g*re,i[14]=p*w+m*ee+h*A+g*M,i[3]=_*x+v*T+y*O+b*j,i[7]=_*S+v*E+y*k+b*ne,i[11]=_*C+v*D+y*te+b*re,i[15]=_*w+v*ee+y*A+b*M,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],r=e[8],i=e[12],a=e[1],o=e[5],s=e[9],c=e[13],l=e[2],u=e[6],d=e[10],f=e[14],p=e[3],m=e[7],h=e[11],g=e[15],_=s*f-c*d,v=o*f-c*u,y=o*d-s*u,b=a*f-c*l,x=a*d-s*l,S=a*u-o*l;return t*(m*_-h*v+g*y)-n*(p*_-h*b+g*x)+r*(p*v-m*b+g*S)-i*(p*y-m*x+h*S)}determinantAffine(){let e=this.elements,t=e[0],n=e[4],r=e[8],i=e[1],a=e[5],o=e[9],s=e[2],c=e[6],l=e[10];return t*(a*l-o*c)-n*(i*l-o*s)+r*(i*c-a*s)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=e[9],d=e[10],f=e[11],p=e[12],m=e[13],h=e[14],g=e[15],_=t*o-n*a,v=t*s-r*a,y=t*c-i*a,b=n*s-r*o,x=n*c-i*o,S=r*c-i*s,C=l*m-u*p,w=l*h-d*p,T=l*g-f*p,E=u*h-d*m,D=u*g-f*m,ee=d*g-f*h,O=_*ee-v*D+y*E+b*T-x*w+S*C;if(O===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let k=1/O;return e[0]=(o*ee-s*D+c*E)*k,e[1]=(r*D-n*ee-i*E)*k,e[2]=(m*S-h*x+g*b)*k,e[3]=(d*x-u*S-f*b)*k,e[4]=(s*T-a*ee-c*w)*k,e[5]=(t*ee-r*T+i*w)*k,e[6]=(h*y-p*S-g*v)*k,e[7]=(l*S-d*y+f*v)*k,e[8]=(a*D-o*T+c*C)*k,e[9]=(n*T-t*D-i*C)*k,e[10]=(p*x-m*y+g*_)*k,e[11]=(u*y-l*x-f*_)*k,e[12]=(o*w-a*E-s*C)*k,e[13]=(t*E-n*w+r*C)*k,e[14]=(m*v-p*b-h*_)*k,e[15]=(l*b-u*v+d*_)*k,this}scale(e){let t=this.elements,n=e.x,r=e.y,i=e.z;return t[0]*=n,t[4]*=r,t[8]*=i,t[1]*=n,t[5]*=r,t[9]*=i,t[2]*=n,t[6]*=r,t[10]*=i,t[3]*=n,t[7]*=r,t[11]*=i,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,r))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),r=Math.sin(t),i=1-n,a=e.x,o=e.y,s=e.z,c=i*a,l=i*o;return this.set(c*a+n,c*o-r*s,c*s+r*o,0,c*o+r*s,l*o+n,l*s-r*a,0,c*s-r*o,l*s+r*a,i*s*s+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,r,i,a){return this.set(1,n,i,0,e,1,a,0,t,r,1,0,0,0,0,1),this}compose(e,t,n){let r=this.elements,i=t._x,a=t._y,o=t._z,s=t._w,c=i+i,l=a+a,u=o+o,d=i*c,f=i*l,p=i*u,m=a*l,h=a*u,g=o*u,_=s*c,v=s*l,y=s*u,b=n.x,x=n.y,S=n.z;return r[0]=(1-(m+g))*b,r[1]=(f+y)*b,r[2]=(p-v)*b,r[3]=0,r[4]=(f-y)*x,r[5]=(1-(d+g))*x,r[6]=(h+_)*x,r[7]=0,r[8]=(p+v)*S,r[9]=(h-_)*S,r[10]=(1-(d+m))*S,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,n){let r=this.elements;e.x=r[12],e.y=r[13],e.z=r[14];let i=this.determinantAffine();if(i===0)return n.set(1,1,1),t.identity(),this;let a=It.set(r[0],r[1],r[2]).length(),o=It.set(r[4],r[5],r[6]).length(),s=It.set(r[8],r[9],r[10]).length();i<0&&(a=-a),Lt.copy(this);let c=1/a,l=1/o,u=1/s;return Lt.elements[0]*=c,Lt.elements[1]*=c,Lt.elements[2]*=c,Lt.elements[4]*=l,Lt.elements[5]*=l,Lt.elements[6]*=l,Lt.elements[8]*=u,Lt.elements[9]*=u,Lt.elements[10]*=u,t.setFromRotationMatrix(Lt),n.x=a,n.y=o,n.z=s,this}makePerspective(e,t,n,r,i,a,o=Ge,s=!1){let c=this.elements,l=2*i/(t-e),u=2*i/(n-r),d=(t+e)/(t-e),f=(n+r)/(n-r),p,m;if(s)p=i/(a-i),m=a*i/(a-i);else if(o===2e3)p=-(a+i)/(a-i),m=-2*a*i/(a-i);else if(o===2001)p=-a/(a-i),m=-a*i/(a-i);else throw Error(`THREE.Matrix4.makePerspective(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=u,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,r,i,a,o=Ge,s=!1){let c=this.elements,l=2/(t-e),u=2/(n-r),d=-(t+e)/(t-e),f=-(n+r)/(n-r),p,m;if(s)p=1/(a-i),m=a/(a-i);else if(o===2e3)p=-2/(a-i),m=-(a+i)/(a-i);else if(o===2001)p=-1/(a-i),m=-i/(a-i);else throw Error(`THREE.Matrix4.makeOrthographic(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=u,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<16;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},It=new B,Lt=new Ft,Rt=new B(0,0,0),zt=new B(1,1,1),Bt=new B,Vt=new B,Ht=new B,Ut=new Ft,Wt=new ft,Gt=class e{constructor(t=0,n=0,r=0,i=e.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=n,this._z=r,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,r=this._order){return this._x=e,this._y=t,this._z=n,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let r=e.elements,i=r[0],a=r[4],o=r[8],s=r[1],c=r[5],l=r[9],u=r[2],d=r[6],f=r[10];switch(t){case`XYZ`:this._y=Math.asin(st(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-l,f),this._z=Math.atan2(-a,i)):(this._x=Math.atan2(d,c),this._z=0);break;case`YXZ`:this._x=Math.asin(-st(l,-1,1)),Math.abs(l)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(s,c)):(this._y=Math.atan2(-u,i),this._z=0);break;case`ZXY`:this._x=Math.asin(st(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(s,i));break;case`ZYX`:this._y=Math.asin(-st(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(s,i)):(this._x=0,this._z=Math.atan2(-a,c));break;case`YZX`:this._z=Math.asin(st(s,-1,1)),Math.abs(s)<.9999999?(this._x=Math.atan2(-l,c),this._y=Math.atan2(-u,i)):(this._x=0,this._y=Math.atan2(o,f));break;case`XZY`:this._z=Math.asin(-st(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,i)):(this._x=Math.atan2(-l,f),this._y=0);break;default:L(`Euler: .setFromRotationMatrix() encountered an unknown order: `+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Ut.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Ut,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Wt.setFromEuler(this),this.setFromQuaternion(Wt,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Gt.DEFAULT_ORDER=`XYZ`;var Kt=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!=0}},qt=0,Jt=new B,Yt=new ft,Xt=new Ft,Zt=new B,Qt=new B,$t=new B,en=new ft,tn=new B(1,0,0),nn=new B(0,1,0),rn=new B(0,0,1),an={type:`added`},on={type:`removed`},sn={type:`childadded`,child:null},cn={type:`childremoved`,child:null},ln=class e extends nt{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:qt++}),this.uuid=ot(),this.name=``,this.type=`Object3D`,this.parent=null,this.children=[],this.up=e.DEFAULT_UP.clone();let t=new B,n=new Gt,r=new ft,i=new B(1,1,1);function a(){r.setFromEuler(n,!1)}function o(){n.setFromQuaternion(r,void 0,!1)}n._onChange(a),r._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:n},quaternion:{configurable:!0,enumerable:!0,value:r},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new Ft},normalMatrix:{value:new V}}),this.matrix=new Ft,this.matrixWorld=new Ft,this.matrixAutoUpdate=e.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=e.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Kt,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Yt.setFromAxisAngle(e,t),this.quaternion.multiply(Yt),this}rotateOnWorldAxis(e,t){return Yt.setFromAxisAngle(e,t),this.quaternion.premultiply(Yt),this}rotateX(e){return this.rotateOnAxis(tn,e)}rotateY(e){return this.rotateOnAxis(nn,e)}rotateZ(e){return this.rotateOnAxis(rn,e)}translateOnAxis(e,t){return Jt.copy(e).applyQuaternion(this.quaternion),this.position.add(Jt.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(tn,e)}translateY(e){return this.translateOnAxis(nn,e)}translateZ(e){return this.translateOnAxis(rn,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Xt.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Zt.copy(e):Zt.set(e,t,n);let r=this.parent;this.updateWorldMatrix(!0,!1),Qt.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Xt.lookAt(Qt,Zt,this.up):Xt.lookAt(Zt,Qt,this.up),this.quaternion.setFromRotationMatrix(Xt),r&&(Xt.extractRotation(r.matrixWorld),Yt.setFromRotationMatrix(Xt),this.quaternion.premultiply(Yt.invert()))}add(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return e===this?(R(`Object3D.add: object can't be added as a child of itself.`,e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(an),sn.child=e,this.dispatchEvent(sn),sn.child=null):R(`Object3D.add: object not an instance of THREE.Object3D.`,e),this)}remove(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.remove(arguments[e]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(on),cn.child=e,this.dispatchEvent(cn),cn.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Xt.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Xt.multiply(e.parent.matrixWorld)),e.applyMatrix4(Xt),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(an),sn.child=e,this.dispatchEvent(sn),sn.child=null,this}getObjectById(e){return this.getObjectByProperty(`id`,e)}getObjectByName(e){return this.getObjectByProperty(`name`,e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,r=this.children.length;n<r;n++){let r=this.children[n].getObjectByProperty(e,t);if(r!==void 0)return r}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let r=this.children;for(let i=0,a=r.length;i<a;i++)r[i].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Qt,e,$t),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Qt,en,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,n=e.y,r=e.z,i=this.matrix.elements;i[12]+=t-i[0]*t-i[4]*n-i[8]*r,i[13]+=n-i[1]*t-i[5]*n-i[9]*r,i[14]+=r-i[2]*t-i[6]*n-i[10]*r}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){let r=this.parent;if(e===!0&&r!==null&&r.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){let e=this.children;for(let t=0,r=e.length;t<r;t++)e[t].updateWorldMatrix(!1,!0,n)}}toJSON(e){let t=e===void 0||typeof e==`string`,n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:`Object`,generator:`Object3D.toJSON`});let r={};r.uuid=this.uuid,r.type=this.type,this.name!==``&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),this.static!==!1&&(r.static=this.static),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.pivot!==null&&(r.pivot=this.pivot.toArray()),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.morphTargetDictionary!==void 0&&(r.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(r.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(r.type=`InstancedMesh`,r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type=`BatchedMesh`,r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.geometryInfo=this._geometryInfo.map(e=>({...e,boundingBox:e.boundingBox?e.boundingBox.toJSON():void 0,boundingSphere:e.boundingSphere?e.boundingSphere.toJSON():void 0})),r.instanceInfo=this._instanceInfo.map(e=>({...e})),r.availableInstanceIds=this._availableInstanceIds.slice(),r.availableGeometryIds=this._availableGeometryIds.slice(),r.nextIndexStart=this._nextIndexStart,r.nextVertexStart=this._nextVertexStart,r.geometryCount=this._geometryCount,r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.matricesTexture=this._matricesTexture.toJSON(e),r.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(r.boundingBox=this.boundingBox.toJSON()));function i(t,n){return t[n.uuid]===void 0&&(t[n.uuid]=n.toJSON(e)),n.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=i(e.geometries,this.geometry);let t=this.geometry.parameters;if(t!==void 0&&t.shapes!==void 0){let n=t.shapes;if(Array.isArray(n))for(let t=0,r=n.length;t<r;t++){let r=n[t];i(e.shapes,r)}else i(e.shapes,n)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(i(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let t=[];for(let n=0,r=this.material.length;n<r;n++)t.push(i(e.materials,this.material[n]));r.material=t}else r.material=i(e.materials,this.material);if(this.children.length>0){r.children=[];for(let t=0;t<this.children.length;t++)r.children.push(this.children[t].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let t=0;t<this.animations.length;t++){let n=this.animations[t];r.animations.push(i(e.animations,n))}}if(t){let t=a(e.geometries),r=a(e.materials),i=a(e.textures),o=a(e.images),s=a(e.shapes),c=a(e.skeletons),l=a(e.animations),u=a(e.nodes);t.length>0&&(n.geometries=t),r.length>0&&(n.materials=r),i.length>0&&(n.textures=i),o.length>0&&(n.images=o),s.length>0&&(n.shapes=s),c.length>0&&(n.skeletons=c),l.length>0&&(n.animations=l),u.length>0&&(n.nodes=u)}return n.object=r,n;function a(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot===null?null:e.pivot.clone(),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let t=0;t<e.children.length;t++){let n=e.children[t];this.add(n.clone())}return this}};ln.DEFAULT_UP=new B(0,1,0),ln.DEFAULT_MATRIX_AUTO_UPDATE=!0,ln.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var un=class extends ln{constructor(){super(),this.isGroup=!0,this.type=`Group`}},dn={type:`move`},fn=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new un,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new un,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new B,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new B),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new un,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new B,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new B,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:`connected`,data:e}),this}disconnect(e){return this.dispatchEvent({type:`disconnected`,data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let r=null,i=null,a=null,o=this._targetRay,s=this._grip,c=this._hand;if(e&&t.session.visibilityState!==`visible-blurred`){if(c&&e.hand){a=!0;for(let r of e.hand.values()){let e=t.getJointPose(r,n),i=this._getHandJoint(c,r);e!==null&&(i.matrix.fromArray(e.transform.matrix),i.matrix.decompose(i.position,i.rotation,i.scale),i.matrixWorldNeedsUpdate=!0,i.jointRadius=e.radius),i.visible=e!==null}let r=c.joints[`index-finger-tip`],i=c.joints[`thumb-tip`],o=r.position.distanceTo(i.position);c.inputState.pinching&&o>.025?(c.inputState.pinching=!1,this.dispatchEvent({type:`pinchend`,handedness:e.handedness,target:this})):!c.inputState.pinching&&o<=.015&&(c.inputState.pinching=!0,this.dispatchEvent({type:`pinchstart`,handedness:e.handedness,target:this}))}else s!==null&&e.gripSpace&&(i=t.getPose(e.gripSpace,n),i!==null&&(s.matrix.fromArray(i.transform.matrix),s.matrix.decompose(s.position,s.rotation,s.scale),s.matrixWorldNeedsUpdate=!0,i.linearVelocity?(s.hasLinearVelocity=!0,s.linearVelocity.copy(i.linearVelocity)):s.hasLinearVelocity=!1,i.angularVelocity?(s.hasAngularVelocity=!0,s.angularVelocity.copy(i.angularVelocity)):s.hasAngularVelocity=!1,s.eventsEnabled&&s.dispatchEvent({type:`gripUpdated`,data:e,target:this})));o!==null&&(r=t.getPose(e.targetRaySpace,n),r===null&&i!==null&&(r=i),r!==null&&(o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,r.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(r.linearVelocity)):o.hasLinearVelocity=!1,r.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(r.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(dn)))}return o!==null&&(o.visible=r!==null),s!==null&&(s.visible=i!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new un;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},pn={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},mn={h:0,s:0,l:0},hn={h:0,s:0,l:0};function gn(e,t,n){return n<0&&(n+=1),n>1&&--n,n<1/6?e+(t-e)*6*n:n<1/2?t:n<2/3?e+(t-e)*6*(2/3-n):e}var H=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let t=e;t&&t.isColor?this.copy(t):typeof t==`number`?this.setHex(t):typeof t==`string`&&this.setStyle(t)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=ze){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,yt.colorSpaceToWorking(this,t),this}setRGB(e,t,n,r=yt.workingColorSpace){return this.r=e,this.g=t,this.b=n,yt.colorSpaceToWorking(this,r),this}setHSL(e,t,n,r=yt.workingColorSpace){if(e=ct(e,1),t=st(t,0,1),n=st(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,i=2*n-r;this.r=gn(i,r,e+1/3),this.g=gn(i,r,e),this.b=gn(i,r,e-1/3)}return yt.colorSpaceToWorking(this,r),this}setStyle(e,t=ze){function n(t){t!==void 0&&parseFloat(t)<1&&L(`Color: Alpha component of `+e+` will be ignored.`)}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let i,a=r[1],o=r[2];switch(a){case`rgb`:case`rgba`:if(i=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(255,parseInt(i[1],10))/255,Math.min(255,parseInt(i[2],10))/255,Math.min(255,parseInt(i[3],10))/255,t);if(i=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(100,parseInt(i[1],10))/100,Math.min(100,parseInt(i[2],10))/100,Math.min(100,parseInt(i[3],10))/100,t);break;case`hsl`:case`hsla`:if(i=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setHSL(parseFloat(i[1])/360,parseFloat(i[2])/100,parseFloat(i[3])/100,t);break;default:L(`Color: Unknown color model `+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){let n=r[1],i=n.length;if(i===3)return this.setRGB(parseInt(n.charAt(0),16)/15,parseInt(n.charAt(1),16)/15,parseInt(n.charAt(2),16)/15,t);if(i===6)return this.setHex(parseInt(n,16),t);L(`Color: Invalid hex color `+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=ze){let n=pn[e.toLowerCase()];return n===void 0?L(`Color: Unknown color `+e):this.setHex(n,t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=bt(e.r),this.g=bt(e.g),this.b=bt(e.b),this}copyLinearToSRGB(e){return this.r=xt(e.r),this.g=xt(e.g),this.b=xt(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=ze){return yt.workingToColorSpace(_n.copy(this),e),Math.round(st(_n.r*255,0,255))*65536+Math.round(st(_n.g*255,0,255))*256+Math.round(st(_n.b*255,0,255))}getHexString(e=ze){return(`000000`+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=yt.workingColorSpace){yt.workingToColorSpace(_n.copy(this),t);let n=_n.r,r=_n.g,i=_n.b,a=Math.max(n,r,i),o=Math.min(n,r,i),s,c,l=(o+a)/2;if(o===a)s=0,c=0;else{let e=a-o;switch(c=l<=.5?e/(a+o):e/(2-a-o),a){case n:s=(r-i)/e+(r<i?6:0);break;case r:s=(i-n)/e+2;break;case i:s=(n-r)/e+4;break}s/=6}return e.h=s,e.s=c,e.l=l,e}getRGB(e,t=yt.workingColorSpace){return yt.workingToColorSpace(_n.copy(this),t),e.r=_n.r,e.g=_n.g,e.b=_n.b,e}getStyle(e=ze){yt.workingToColorSpace(_n.copy(this),e);let t=_n.r,n=_n.g,r=_n.b;return e===`srgb`?`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(r*255)})`:`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`}offsetHSL(e,t,n){return this.getHSL(mn),this.setHSL(mn.h+e,mn.s+t,mn.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(mn),e.getHSL(hn);let n=lt(mn.h,hn.h,t),r=lt(mn.s,hn.s,t),i=lt(mn.l,hn.l,t);return this.setHSL(n,r,i),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,r=this.b,i=e.elements;return this.r=i[0]*t+i[3]*n+i[6]*r,this.g=i[1]*t+i[4]*n+i[7]*r,this.b=i[2]*t+i[5]*n+i[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},_n=new H;H.NAMES=pn;var vn=class e{constructor(e,t=25e-5){this.isFogExp2=!0,this.name=``,this.color=new H(e),this.density=t}clone(){return new e(this.color,this.density)}toJSON(){return{type:`FogExp2`,name:this.name,color:this.color.getHex(),density:this.density}}},yn=class extends ln{constructor(){super(),this.isScene=!0,this.type=`Scene`,this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Gt,this.environmentIntensity=1,this.environmentRotation=new Gt,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}},bn=new B,xn=new B,Sn=new B,Cn=new B,wn=new B,Tn=new B,En=new B,Dn=new B,On=new B,kn=new B,An=new At,jn=new At,Mn=new At,Nn=class e{constructor(e=new B,t=new B,n=new B){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,r){r.subVectors(n,t),bn.subVectors(e,t),r.cross(bn);let i=r.lengthSq();return i>0?r.multiplyScalar(1/Math.sqrt(i)):r.set(0,0,0)}static getBarycoord(e,t,n,r,i){bn.subVectors(r,t),xn.subVectors(n,t),Sn.subVectors(e,t);let a=bn.dot(bn),o=bn.dot(xn),s=bn.dot(Sn),c=xn.dot(xn),l=xn.dot(Sn),u=a*c-o*o;if(u===0)return i.set(0,0,0),null;let d=1/u,f=(c*s-o*l)*d,p=(a*l-o*s)*d;return i.set(1-f-p,p,f)}static containsPoint(e,t,n,r){return this.getBarycoord(e,t,n,r,Cn)!==null&&Cn.x>=0&&Cn.y>=0&&Cn.x+Cn.y<=1}static getInterpolation(e,t,n,r,i,a,o,s){return this.getBarycoord(e,t,n,r,Cn)===null?(s.x=0,s.y=0,`z`in s&&(s.z=0),`w`in s&&(s.w=0),null):(s.setScalar(0),s.addScaledVector(i,Cn.x),s.addScaledVector(a,Cn.y),s.addScaledVector(o,Cn.z),s)}static getInterpolatedAttribute(e,t,n,r,i,a){return An.setScalar(0),jn.setScalar(0),Mn.setScalar(0),An.fromBufferAttribute(e,t),jn.fromBufferAttribute(e,n),Mn.fromBufferAttribute(e,r),a.setScalar(0),a.addScaledVector(An,i.x),a.addScaledVector(jn,i.y),a.addScaledVector(Mn,i.z),a}static isFrontFacing(e,t,n,r){return bn.subVectors(n,t),xn.subVectors(e,t),bn.cross(xn).dot(r)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,r){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,n,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return bn.subVectors(this.c,this.b),xn.subVectors(this.a,this.b),bn.cross(xn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return e.getNormal(this.a,this.b,this.c,t)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,n){return e.getBarycoord(t,this.a,this.b,this.c,n)}getInterpolation(t,n,r,i,a){return e.getInterpolation(t,this.a,this.b,this.c,n,r,i,a)}containsPoint(t){return e.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return e.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,r=this.b,i=this.c,a,o;wn.subVectors(r,n),Tn.subVectors(i,n),Dn.subVectors(e,n);let s=wn.dot(Dn),c=Tn.dot(Dn);if(s<=0&&c<=0)return t.copy(n);On.subVectors(e,r);let l=wn.dot(On),u=Tn.dot(On);if(l>=0&&u<=l)return t.copy(r);let d=s*u-l*c;if(d<=0&&s>=0&&l<=0)return a=s/(s-l),t.copy(n).addScaledVector(wn,a);kn.subVectors(e,i);let f=wn.dot(kn),p=Tn.dot(kn);if(p>=0&&f<=p)return t.copy(i);let m=f*c-s*p;if(m<=0&&c>=0&&p<=0)return o=c/(c-p),t.copy(n).addScaledVector(Tn,o);let h=l*p-f*u;if(h<=0&&u-l>=0&&f-p>=0)return En.subVectors(i,r),o=(u-l)/(u-l+(f-p)),t.copy(r).addScaledVector(En,o);let g=1/(h+m+d);return a=m*g,o=d*g,t.copy(n).addScaledVector(wn,a).addScaledVector(Tn,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},Pn=class{constructor(e=new B(1/0,1/0,1/0),t=new B(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(In.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(In.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=In.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute(`position`);if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let t=0,n=r.count;t<n;t++)e.isMesh===!0?e.getVertexPosition(t,In):In.fromBufferAttribute(r,t),In.applyMatrix4(e.matrixWorld),this.expandByPoint(In);else e.boundingBox===void 0?(n.boundingBox===null&&n.computeBoundingBox(),Ln.copy(n.boundingBox)):(e.boundingBox===null&&e.computeBoundingBox(),Ln.copy(e.boundingBox)),Ln.applyMatrix4(e.matrixWorld),this.union(Ln)}let r=e.children;for(let e=0,n=r.length;e<n;e++)this.expandByObject(r[e],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,In),In.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Wn),Gn.subVectors(this.max,Wn),Rn.subVectors(e.a,Wn),zn.subVectors(e.b,Wn),Bn.subVectors(e.c,Wn),Vn.subVectors(zn,Rn),Hn.subVectors(Bn,zn),Un.subVectors(Rn,Bn);let t=[0,-Vn.z,Vn.y,0,-Hn.z,Hn.y,0,-Un.z,Un.y,Vn.z,0,-Vn.x,Hn.z,0,-Hn.x,Un.z,0,-Un.x,-Vn.y,Vn.x,0,-Hn.y,Hn.x,0,-Un.y,Un.x,0];return!Jn(t,Rn,zn,Bn,Gn)||(t=[1,0,0,0,1,0,0,0,1],!Jn(t,Rn,zn,Bn,Gn))?!1:(Kn.crossVectors(Vn,Hn),t=[Kn.x,Kn.y,Kn.z],Jn(t,Rn,zn,Bn,Gn))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,In).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(In).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Fn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Fn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Fn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Fn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Fn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Fn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Fn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Fn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Fn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},Fn=[new B,new B,new B,new B,new B,new B,new B,new B],In=new B,Ln=new Pn,Rn=new B,zn=new B,Bn=new B,Vn=new B,Hn=new B,Un=new B,Wn=new B,Gn=new B,Kn=new B,qn=new B;function Jn(e,t,n,r,i){for(let a=0,o=e.length-3;a<=o;a+=3){qn.fromArray(e,a);let o=i.x*Math.abs(qn.x)+i.y*Math.abs(qn.y)+i.z*Math.abs(qn.z),s=t.dot(qn),c=n.dot(qn),l=r.dot(qn);if(Math.max(-Math.max(s,c,l),Math.min(s,c,l))>o)return!1}return!0}var Yn=new B,Xn=new z,Zn=0,Qn=class extends nt{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw TypeError(`THREE.BufferAttribute: array should be a Typed Array.`);this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Zn++}),this.name=``,this.array=e,this.itemSize=t,this.count=e===void 0?0:e.length/t,this.normalized=n,this.usage=We,this.updateRanges=[],this.gpuType=h,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let r=0,i=this.itemSize;r<i;r++)this.array[e+r]=t.array[n+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Xn.fromBufferAttribute(this,t),Xn.applyMatrix3(e),this.setXY(t,Xn.x,Xn.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Yn.fromBufferAttribute(this,t),Yn.applyMatrix3(e),this.setXYZ(t,Yn.x,Yn.y,Yn.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Yn.fromBufferAttribute(this,t),Yn.applyMatrix4(e),this.setXYZ(t,Yn.x,Yn.y,Yn.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Yn.fromBufferAttribute(this,t),Yn.applyNormalMatrix(e),this.setXYZ(t,Yn.x,Yn.y,Yn.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Yn.fromBufferAttribute(this,t),Yn.transformDirection(e),this.setXYZ(t,Yn.x,Yn.y,Yn.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=ut(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=dt(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=ut(t,this.array)),t}setX(e,t){return this.normalized&&(t=dt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=ut(t,this.array)),t}setY(e,t){return this.normalized&&(t=dt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=ut(t,this.array)),t}setZ(e,t){return this.normalized&&(t=dt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=ut(t,this.array)),t}setW(e,t){return this.normalized&&(t=dt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=dt(t,this.array),n=dt(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,r){return e*=this.itemSize,this.normalized&&(t=dt(t,this.array),n=dt(n,this.array),r=dt(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this}setXYZW(e,t,n,r,i){return e*=this.itemSize,this.normalized&&(t=dt(t,this.array),n=dt(n,this.array),r=dt(r,this.array),i=dt(i,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this.array[e+3]=i,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==``&&(e.name=this.name),this.usage!==35044&&(e.usage=this.usage),e}dispose(){this.dispatchEvent({type:`dispose`})}},$n=class extends Qn{constructor(e,t,n){super(new Uint16Array(e),t,n)}},er=class extends Qn{constructor(e,t,n){super(new Uint32Array(e),t,n)}},tr=class extends Qn{constructor(e,t,n){super(new Float32Array(e),t,n)}},nr=new Pn,rr=new B,ir=new B,ar=class{constructor(e=new B,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t===void 0?nr.setFromPoints(e).getCenter(n):n.copy(t);let r=0;for(let t=0,i=e.length;t<i;t++)r=Math.max(r,n.distanceToSquared(e[t]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius*=e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;rr.subVectors(e,this.center);let t=rr.lengthSq();if(t>this.radius*this.radius){let e=Math.sqrt(t),n=(e-this.radius)*.5;this.center.addScaledVector(rr,n/e),this.radius+=n}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(ir.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(rr.copy(e.center).add(ir)),this.expandByPoint(rr.copy(e.center).sub(ir))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},or=0,sr=new Ft,cr=new ln,lr=new B,ur=new Pn,dr=new Pn,fr=new B,pr=class e extends nt{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:or++}),this.uuid=ot(),this.name=``,this.type=`BufferGeometry`,this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Ke(e)?er:$n)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let t=new V().getNormalMatrix(e);n.applyNormalMatrix(t),n.needsUpdate=!0}let r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return sr.makeRotationFromQuaternion(e),this.applyMatrix4(sr),this}rotateX(e){return sr.makeRotationX(e),this.applyMatrix4(sr),this}rotateY(e){return sr.makeRotationY(e),this.applyMatrix4(sr),this}rotateZ(e){return sr.makeRotationZ(e),this.applyMatrix4(sr),this}translate(e,t,n){return sr.makeTranslation(e,t,n),this.applyMatrix4(sr),this}scale(e,t,n){return sr.makeScale(e,t,n),this.applyMatrix4(sr),this}lookAt(e){return cr.lookAt(e),cr.updateMatrix(),this.applyMatrix4(cr.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(lr).negate(),this.translate(lr.x,lr.y,lr.z),this}setFromPoints(e){let t=this.getAttribute(`position`);if(t===void 0){let t=[];for(let n=0,r=e.length;n<r;n++){let r=e[n];t.push(r.x,r.y,r.z||0)}this.setAttribute(`position`,new tr(t,3))}else{let n=Math.min(e.length,t.count);for(let r=0;r<n;r++){let n=e[r];t.setXYZ(r,n.x,n.y,n.z||0)}e.length>t.count&&L(`BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry.`),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Pn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){R(`BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.`,this),this.boundingBox.set(new B(-1/0,-1/0,-1/0),new B(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];ur.setFromBufferAttribute(n),this.morphTargetsRelative?(fr.addVectors(this.boundingBox.min,ur.min),this.boundingBox.expandByPoint(fr),fr.addVectors(this.boundingBox.max,ur.max),this.boundingBox.expandByPoint(fr)):(this.boundingBox.expandByPoint(ur.min),this.boundingBox.expandByPoint(ur.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&R(`BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.`,this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new ar);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){R(`BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.`,this),this.boundingSphere.set(new B,1/0);return}if(e){let n=this.boundingSphere.center;if(ur.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];dr.setFromBufferAttribute(n),this.morphTargetsRelative?(fr.addVectors(ur.min,dr.min),ur.expandByPoint(fr),fr.addVectors(ur.max,dr.max),ur.expandByPoint(fr)):(ur.expandByPoint(dr.min),ur.expandByPoint(dr.max))}ur.getCenter(n);let r=0;for(let t=0,i=e.count;t<i;t++)fr.fromBufferAttribute(e,t),r=Math.max(r,n.distanceToSquared(fr));if(t)for(let i=0,a=t.length;i<a;i++){let a=t[i],o=this.morphTargetsRelative;for(let t=0,i=a.count;t<i;t++)fr.fromBufferAttribute(a,t),o&&(lr.fromBufferAttribute(e,t),fr.add(lr)),r=Math.max(r,n.distanceToSquared(fr))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&R(`BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.`,this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){R(`BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)`);return}let n=t.position,r=t.normal,i=t.uv,a=this.getAttribute(`tangent`);(a===void 0||a.count!==n.count)&&(a=new Qn(new Float32Array(4*n.count),4),this.setAttribute(`tangent`,a));let o=[],s=[];for(let e=0;e<n.count;e++)o[e]=new B,s[e]=new B;let c=new B,l=new B,u=new B,d=new z,f=new z,p=new z,m=new B,h=new B;function g(e,t,r){c.fromBufferAttribute(n,e),l.fromBufferAttribute(n,t),u.fromBufferAttribute(n,r),d.fromBufferAttribute(i,e),f.fromBufferAttribute(i,t),p.fromBufferAttribute(i,r),l.sub(c),u.sub(c),f.sub(d),p.sub(d);let a=1/(f.x*p.y-p.x*f.y);isFinite(a)&&(m.copy(l).multiplyScalar(p.y).addScaledVector(u,-f.y).multiplyScalar(a),h.copy(u).multiplyScalar(f.x).addScaledVector(l,-p.x).multiplyScalar(a),o[e].add(m),o[t].add(m),o[r].add(m),s[e].add(h),s[t].add(h),s[r].add(h))}let _=this.groups;_.length===0&&(_=[{start:0,count:e.count}]);for(let t=0,n=_.length;t<n;++t){let n=_[t],r=n.start,i=n.count;for(let t=r,n=r+i;t<n;t+=3)g(e.getX(t+0),e.getX(t+1),e.getX(t+2))}let v=new B,y=new B,b=new B,x=new B;function S(e){b.fromBufferAttribute(r,e),x.copy(b);let t=o[e];v.copy(t),v.sub(b.multiplyScalar(b.dot(t))).normalize(),y.crossVectors(x,t);let n=y.dot(s[e])<0?-1:1;a.setXYZW(e,v.x,v.y,v.z,n)}for(let t=0,n=_.length;t<n;++t){let n=_[t],r=n.start,i=n.count;for(let t=r,n=r+i;t<n;t+=3)S(e.getX(t+0)),S(e.getX(t+1)),S(e.getX(t+2))}this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute(`position`);if(t!==void 0){let n=this.getAttribute(`normal`);if(n===void 0||n.count!==t.count)n=new Qn(new Float32Array(t.count*3),3),this.setAttribute(`normal`,n);else for(let e=0,t=n.count;e<t;e++)n.setXYZ(e,0,0,0);let r=new B,i=new B,a=new B,o=new B,s=new B,c=new B,l=new B,u=new B;if(e)for(let d=0,f=e.count;d<f;d+=3){let f=e.getX(d+0),p=e.getX(d+1),m=e.getX(d+2);r.fromBufferAttribute(t,f),i.fromBufferAttribute(t,p),a.fromBufferAttribute(t,m),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),o.fromBufferAttribute(n,f),s.fromBufferAttribute(n,p),c.fromBufferAttribute(n,m),o.add(l),s.add(l),c.add(l),n.setXYZ(f,o.x,o.y,o.z),n.setXYZ(p,s.x,s.y,s.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let e=0,o=t.count;e<o;e+=3)r.fromBufferAttribute(t,e+0),i.fromBufferAttribute(t,e+1),a.fromBufferAttribute(t,e+2),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),n.setXYZ(e+0,l.x,l.y,l.z),n.setXYZ(e+1,l.x,l.y,l.z),n.setXYZ(e+2,l.x,l.y,l.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)fr.fromBufferAttribute(e,t),fr.normalize(),e.setXYZ(t,fr.x,fr.y,fr.z)}toNonIndexed(){function t(e,t){let n=e.array,r=e.itemSize,i=e.normalized,a=new n.constructor(t.length*r),o=0,s=0;for(let i=0,c=t.length;i<c;i++){o=e.isInterleavedBufferAttribute?t[i]*e.data.stride+e.offset:t[i]*r;for(let e=0;e<r;e++)a[s++]=n[o++]}return new Qn(a,r,i)}if(this.index===null)return L(`BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed.`),this;let n=new e,r=this.index.array,i=this.attributes;for(let e in i){let a=i[e],o=t(a,r);n.setAttribute(e,o)}let a=this.morphAttributes;for(let e in a){let i=[],o=a[e];for(let e=0,n=o.length;e<n;e++){let n=o[e],a=t(n,r);i.push(a)}n.morphAttributes[e]=i}n.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let e=0,t=o.length;e<t;e++){let t=o[e];n.addGroup(t.start,t.count,t.materialIndex)}return n}toJSON(){let e={metadata:{version:4.7,type:`BufferGeometry`,generator:`BufferGeometry.toJSON`}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?`BufferGeometry`:this.type,this.name!==``&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let t=this.parameters;for(let n in t)t[n]!==void 0&&(e[n]=t[n]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let t in n){let r=n[t];e.data.attributes[t]=r.toJSON(e.data)}let r={},i=!1;for(let t in this.morphAttributes){let n=this.morphAttributes[t],a=[];for(let t=0,r=n.length;t<r;t++){let r=n[t];a.push(r.toJSON(e.data))}a.length>0&&(r[t]=a,i=!0)}i&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let r=e.attributes;for(let e in r){let n=r[e];this.setAttribute(e,n.clone(t))}let i=e.morphAttributes;for(let e in i){let n=[],r=i[e];for(let e=0,i=r.length;e<i;e++)n.push(r[e].clone(t));this.morphAttributes[e]=n}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let e=0,t=a.length;e<t;e++){let t=a[e];this.addGroup(t.start,t.count,t.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let s=e.boundingSphere;return s!==null&&(this.boundingSphere=s.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:`dispose`})}},mr=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e===void 0?0:e.length/t,this.usage=We,this.updateRanges=[],this.version=0,this.uuid=ot()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let r=0,i=this.stride;r<i;r++)this.array[e+r]=t.array[n+r];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=ot()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=ot()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}},hr=new B,gr=class e{constructor(e,t,n,r=!1){this.isInterleavedBufferAttribute=!0,this.name=``,this.data=e,this.itemSize=t,this.offset=n,this.normalized=r}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)hr.fromBufferAttribute(this,t),hr.applyMatrix4(e),this.setXYZ(t,hr.x,hr.y,hr.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)hr.fromBufferAttribute(this,t),hr.applyNormalMatrix(e),this.setXYZ(t,hr.x,hr.y,hr.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)hr.fromBufferAttribute(this,t),hr.transformDirection(e),this.setXYZ(t,hr.x,hr.y,hr.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=ut(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=dt(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=dt(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=dt(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=dt(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=dt(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=ut(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=ut(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=ut(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=ut(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=dt(t,this.array),n=dt(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=dt(t,this.array),n=dt(n,this.array),r=dt(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=r,this}setXYZW(e,t,n,r,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=dt(t,this.array),n=dt(n,this.array),r=dt(r,this.array),i=dt(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=r,this.data.array[e+3]=i,this}clone(t){if(t===void 0){Ze(`InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.`);let e=[];for(let t=0;t<this.count;t++){let n=t*this.data.stride+this.offset;for(let t=0;t<this.itemSize;t++)e.push(this.data.array[n+t])}return new Qn(new this.array.constructor(e),this.itemSize,this.normalized)}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.clone(t)),new e(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){Ze(`InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.`);let e=[];for(let t=0;t<this.count;t++){let n=t*this.data.stride+this.offset;for(let t=0;t<this.itemSize;t++)e.push(this.data.array[n+t])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:e,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},_r=0,vr=class extends nt{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:_r++}),this.uuid=ot(),this.name=``,this.type=`Material`,this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new H(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Ue,this.stencilZFail=Ue,this.stencilZPass=Ue,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){L(`Material: parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){L(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(n):r&&r.isVector2&&n&&n.isVector2||r&&r.isEuler&&n&&n.isEuler||r&&r.isVector3&&n&&n.isVector3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:`Material`,generator:`Material.toJSON`}};n.uuid=this.uuid,n.type=this.type,this.name!==``&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==1&&(n.blending=this.blending),this.side!==0&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==204&&(n.blendSrc=this.blendSrc),this.blendDst!==205&&(n.blendDst=this.blendDst),this.blendEquation!==100&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==3&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==519&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==7680&&(n.stencilFail=this.stencilFail),this.stencilZFail!==7680&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==7680&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.allowOverride===!1&&(n.allowOverride=!1),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==`round`&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==`round`&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function r(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}if(t){let t=r(e.textures),i=r(e.images);t.length>0&&(n.textures=t),i.length>0&&(n.images=i)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new H().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors==`number`?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let t=e.normalScale;Array.isArray(t)===!1&&(t=[t,t]),this.normalScale=new z().fromArray(t)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new z().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let e=t.length;n=Array(e);for(let r=0;r!==e;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:`dispose`})}set needsUpdate(e){e===!0&&this.version++}},yr=class extends vr{constructor(e){super(),this.isSpriteMaterial=!0,this.type=`SpriteMaterial`,this.color=new H(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},br,xr=new B,Sr=new B,Cr=new B,wr=new z,Tr=new z,Er=new Ft,Dr=new B,Or=new B,kr=new B,Ar=new z,jr=new z,Mr=new z,Nr=class extends ln{constructor(e=new yr){if(super(),this.isSprite=!0,this.type=`Sprite`,br===void 0){br=new pr;let e=new mr(new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),5);br.setIndex([0,1,2,0,2,3]),br.setAttribute(`position`,new gr(e,3,0,!1)),br.setAttribute(`uv`,new gr(e,2,3,!1))}this.geometry=br,this.material=e,this.center=new z(.5,.5),this.count=1}raycast(e,t){e.camera===null&&R(`Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.`),Sr.setFromMatrixScale(this.matrixWorld),Er.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),Cr.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&Sr.multiplyScalar(-Cr.z);let n=this.material.rotation,r,i;n!==0&&(i=Math.cos(n),r=Math.sin(n));let a=this.center;Pr(Dr.set(-.5,-.5,0),Cr,a,Sr,r,i),Pr(Or.set(.5,-.5,0),Cr,a,Sr,r,i),Pr(kr.set(.5,.5,0),Cr,a,Sr,r,i),Ar.set(0,0),jr.set(1,0),Mr.set(1,1);let o=e.ray.intersectTriangle(Dr,Or,kr,!1,xr);if(o===null&&(Pr(Or.set(-.5,.5,0),Cr,a,Sr,r,i),jr.set(0,1),o=e.ray.intersectTriangle(Dr,kr,Or,!1,xr),o===null))return;let s=e.ray.origin.distanceTo(xr);s<e.near||s>e.far||t.push({distance:s,point:xr.clone(),uv:Nn.getInterpolation(xr,Dr,Or,kr,Ar,jr,Mr,new z),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}};function Pr(e,t,n,r,i,a){wr.subVectors(e,n).addScalar(.5).multiply(r),i===void 0?Tr.copy(wr):(Tr.x=a*wr.x-i*wr.y,Tr.y=i*wr.x+a*wr.y),e.copy(t),e.x+=Tr.x,e.y+=Tr.y,e.applyMatrix4(Er)}var Fr=new B,Ir=new B,Lr=new B,Rr=new B,zr=new B,Br=new B,Vr=new B,Hr=class{constructor(e=new B,t=new B(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Fr)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Fr.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Fr.copy(this.origin).addScaledVector(this.direction,t),Fr.distanceToSquared(e))}distanceSqToSegment(e,t,n,r){Ir.copy(e).add(t).multiplyScalar(.5),Lr.copy(t).sub(e).normalize(),Rr.copy(this.origin).sub(Ir);let i=e.distanceTo(t)*.5,a=-this.direction.dot(Lr),o=Rr.dot(this.direction),s=-Rr.dot(Lr),c=Rr.lengthSq(),l=Math.abs(1-a*a),u,d,f,p;if(l>0)if(u=a*s-o,d=a*o-s,p=i*l,u>=0)if(d>=-p)if(d<=p){let e=1/l;u*=e,d*=e,f=u*(u+a*d+2*o)+d*(a*u+d+2*s)+c}else d=i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c;else d=-i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c;else d<=-p?(u=Math.max(0,-(-a*i+o)),d=u>0?-i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c):d<=p?(u=0,d=Math.min(Math.max(-i,-s),i),f=d*(d+2*s)+c):(u=Math.max(0,-(a*i+o)),d=u>0?i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c);else d=a>0?-i:i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),r&&r.copy(Ir).addScaledVector(Lr,d),f}intersectSphere(e,t){Fr.subVectors(e.center,this.origin);let n=Fr.dot(this.direction),r=Fr.dot(Fr)-n*n,i=e.radius*e.radius;if(r>i)return null;let a=Math.sqrt(i-r),o=n-a,s=n+a;return s<0?null:o<0?this.at(s,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,r,i,a,o,s,c=1/this.direction.x,l=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,r=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,r=(e.min.x-d.x)*c),l>=0?(i=(e.min.y-d.y)*l,a=(e.max.y-d.y)*l):(i=(e.max.y-d.y)*l,a=(e.min.y-d.y)*l),n>a||i>r||((i>n||isNaN(n))&&(n=i),(a<r||isNaN(r))&&(r=a),u>=0?(o=(e.min.z-d.z)*u,s=(e.max.z-d.z)*u):(o=(e.max.z-d.z)*u,s=(e.min.z-d.z)*u),n>s||o>r)||((o>n||n!==n)&&(n=o),(s<r||r!==r)&&(r=s),r<0)?null:this.at(n>=0?n:r,t)}intersectsBox(e){return this.intersectBox(e,Fr)!==null}intersectTriangle(e,t,n,r,i){zr.subVectors(t,e),Br.subVectors(n,e),Vr.crossVectors(zr,Br);let a=this.direction.dot(Vr),o;if(a>0){if(r)return null;o=1}else if(a<0)o=-1,a=-a;else return null;Rr.subVectors(this.origin,e);let s=o*this.direction.dot(Br.crossVectors(Rr,Br));if(s<0)return null;let c=o*this.direction.dot(zr.cross(Rr));if(c<0||s+c>a)return null;let l=-o*Rr.dot(Vr);return l<0?null:this.at(l/a,i)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Ur=class extends vr{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type=`MeshBasicMaterial`,this.color=new H(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Gt,this.combine=0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},Wr=new Ft,Gr=new Hr,Kr=new ar,qr=new B,Jr=new B,Yr=new B,Xr=new B,Zr=new B,Qr=new B,$r=new B,ei=new B,ti=class extends ln{constructor(e=new pr,t=new Ur){super(),this.isMesh=!0,this.type=`Mesh`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}getVertexPosition(e,t){let n=this.geometry,r=n.attributes.position,i=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(r,e);let o=this.morphTargetInfluences;if(i&&o){Qr.set(0,0,0);for(let n=0,r=i.length;n<r;n++){let r=o[n],s=i[n];r!==0&&(Zr.fromBufferAttribute(s,e),a?Qr.addScaledVector(Zr,r):Qr.addScaledVector(Zr.sub(t),r))}t.add(Qr)}return t}raycast(e,t){let n=this.geometry,r=this.material,i=this.matrixWorld;r!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Kr.copy(n.boundingSphere),Kr.applyMatrix4(i),Gr.copy(e.ray).recast(e.near),!(Kr.containsPoint(Gr.origin)===!1&&(Gr.intersectSphere(Kr,qr)===null||Gr.origin.distanceToSquared(qr)>(e.far-e.near)**2))&&(Wr.copy(i).invert(),Gr.copy(e.ray).applyMatrix4(Wr),!(n.boundingBox!==null&&Gr.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,Gr)))}_computeIntersections(e,t,n){let r,i=this.geometry,a=this.material,o=i.index,s=i.attributes.position,c=i.attributes.uv,l=i.attributes.uv1,u=i.attributes.normal,d=i.groups,f=i.drawRange;if(o!==null)if(Array.isArray(a))for(let i=0,s=d.length;i<s;i++){let s=d[i],p=a[s.materialIndex],m=Math.max(s.start,f.start),h=Math.min(o.count,Math.min(s.start+s.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=o.getX(i),d=o.getX(i+1),f=o.getX(i+2);r=ri(this,p,e,n,c,l,u,a,d,f),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=s.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),s=Math.min(o.count,f.start+f.count);for(let d=i,f=s;d<f;d+=3){let i=o.getX(d),s=o.getX(d+1),f=o.getX(d+2);r=ri(this,a,e,n,c,l,u,i,s,f),r&&(r.faceIndex=Math.floor(d/3),t.push(r))}}else if(s!==void 0)if(Array.isArray(a))for(let i=0,o=d.length;i<o;i++){let o=d[i],p=a[o.materialIndex],m=Math.max(o.start,f.start),h=Math.min(s.count,Math.min(o.start+o.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=i,s=i+1,d=i+2;r=ri(this,p,e,n,c,l,u,a,s,d),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=o.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),o=Math.min(s.count,f.start+f.count);for(let s=i,d=o;s<d;s+=3){let i=s,o=s+1,d=s+2;r=ri(this,a,e,n,c,l,u,i,o,d),r&&(r.faceIndex=Math.floor(s/3),t.push(r))}}}};function ni(e,t,n,r,i,a,o,s){let c;if(c=t.side===1?r.intersectTriangle(o,a,i,!0,s):r.intersectTriangle(i,a,o,t.side===0,s),c===null)return null;ei.copy(s),ei.applyMatrix4(e.matrixWorld);let l=n.ray.origin.distanceTo(ei);return l<n.near||l>n.far?null:{distance:l,point:ei.clone(),object:e}}function ri(e,t,n,r,i,a,o,s,c,l){e.getVertexPosition(s,Jr),e.getVertexPosition(c,Yr),e.getVertexPosition(l,Xr);let u=ni(e,t,n,r,Jr,Yr,Xr,$r);if(u){let e=new B;Nn.getBarycoord($r,Jr,Yr,Xr,e),i&&(u.uv=Nn.getInterpolatedAttribute(i,s,c,l,e,new z)),a&&(u.uv1=Nn.getInterpolatedAttribute(a,s,c,l,e,new z)),o&&(u.normal=Nn.getInterpolatedAttribute(o,s,c,l,e,new B),u.normal.dot(r.direction)>0&&u.normal.multiplyScalar(-1));let t={a:s,b:c,c:l,normal:new B,materialIndex:0};Nn.getNormal(Jr,Yr,Xr,t.normal),u.face=t,u.barycoord=e}return u}var ii=class extends kt{constructor(e=null,t=1,n=1,i,a,o,s,c,l=r,u=r,d,f){super(null,o,s,c,l,u,i,a,d,f),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},ai=new B,oi=new B,si=new V,ci=class{constructor(e=new B(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,r){return this.normal.set(e,t,n),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let r=ai.subVectors(n,t).cross(oi.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){let r=e.delta(ai),i=this.normal.dot(r);if(i===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let a=-(e.start.dot(this.normal)+this.constant)/i;return n===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(r,a)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||si.getNormalMatrix(e),r=this.coplanarPoint(ai).applyMatrix4(e),i=this.normal.applyMatrix3(n).normalize();return this.constant=-r.dot(i),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},li=new ar,ui=new z(.5,.5),di=new B,fi=class{constructor(e=new ci,t=new ci,n=new ci,r=new ci,i=new ci,a=new ci){this.planes=[e,t,n,r,i,a]}set(e,t,n,r,i,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(r),o[4].copy(i),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=Ge,n=!1){let r=this.planes,i=e.elements,a=i[0],o=i[1],s=i[2],c=i[3],l=i[4],u=i[5],d=i[6],f=i[7],p=i[8],m=i[9],h=i[10],g=i[11],_=i[12],v=i[13],y=i[14],b=i[15];if(r[0].setComponents(c-a,f-l,g-p,b-_).normalize(),r[1].setComponents(c+a,f+l,g+p,b+_).normalize(),r[2].setComponents(c+o,f+u,g+m,b+v).normalize(),r[3].setComponents(c-o,f-u,g-m,b-v).normalize(),n)r[4].setComponents(s,d,h,y).normalize(),r[5].setComponents(c-s,f-d,g-h,b-y).normalize();else if(r[4].setComponents(c-s,f-d,g-h,b-y).normalize(),t===2e3)r[5].setComponents(c+s,f+d,g+h,b+y).normalize();else if(t===2001)r[5].setComponents(s,d,h,y).normalize();else throw Error(`THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: `+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),li.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),li.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(li)}intersectsSprite(e){return li.center.set(0,0,0),li.radius=.7071067811865476+ui.distanceTo(e.center),li.applyMatrix4(e.matrixWorld),this.intersectsSphere(li)}intersectsSphere(e){let t=this.planes,n=e.center,r=-e.radius;for(let e=0;e<6;e++)if(t[e].distanceToPoint(n)<r)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let r=t[n];if(di.x=r.normal.x>0?e.max.x:e.min.x,di.y=r.normal.y>0?e.max.y:e.min.y,di.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(di)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},pi=class extends vr{constructor(e){super(),this.isLineBasicMaterial=!0,this.type=`LineBasicMaterial`,this.color=new H(16777215),this.map=null,this.linewidth=1,this.linecap=`round`,this.linejoin=`round`,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},mi=new B,hi=new B,gi=new Ft,_i=new Hr,vi=new ar,yi=new B,bi=new B,xi=class extends ln{constructor(e=new pr,t=new pi){super(),this.isLine=!0,this.type=`Line`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[0];for(let e=1,r=t.count;e<r;e++)mi.fromBufferAttribute(t,e-1),hi.fromBufferAttribute(t,e),n[e]=n[e-1],n[e]+=mi.distanceTo(hi);e.setAttribute(`lineDistance`,new tr(n,1))}else L(`Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.`);return this}raycast(e,t){let n=this.geometry,r=this.matrixWorld,i=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),vi.copy(n.boundingSphere),vi.applyMatrix4(r),vi.radius+=i,e.ray.intersectsSphere(vi)===!1)return;gi.copy(r).invert(),_i.copy(e.ray).applyMatrix4(gi);let o=i/((this.scale.x+this.scale.y+this.scale.z)/3),s=o*o,c=this.isLineSegments?2:1,l=n.index,u=n.attributes.position;if(l!==null){let n=Math.max(0,a.start),r=Math.min(l.count,a.start+a.count);for(let i=n,a=r-1;i<a;i+=c){let n=l.getX(i),r=l.getX(i+1),a=Si(this,e,_i,s,n,r,i);a&&t.push(a)}if(this.isLineLoop){let i=l.getX(r-1),a=l.getX(n),o=Si(this,e,_i,s,i,a,r-1);o&&t.push(o)}}else{let n=Math.max(0,a.start),r=Math.min(u.count,a.start+a.count);for(let i=n,a=r-1;i<a;i+=c){let n=Si(this,e,_i,s,i,i+1,i);n&&t.push(n)}if(this.isLineLoop){let i=Si(this,e,_i,s,r-1,n,r-1);i&&t.push(i)}}}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}};function Si(e,t,n,r,i,a,o){let s=e.geometry.attributes.position;if(mi.fromBufferAttribute(s,i),hi.fromBufferAttribute(s,a),n.distanceSqToSegment(mi,hi,yi,bi)>r)return;yi.applyMatrix4(e.matrixWorld);let c=t.ray.origin.distanceTo(yi);if(!(c<t.near||c>t.far))return{distance:c,point:bi.clone().applyMatrix4(e.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:e}}var Ci=new B,wi=new B,Ti=class extends xi{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type=`LineSegments`}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[];for(let e=0,r=t.count;e<r;e+=2)Ci.fromBufferAttribute(t,e),wi.fromBufferAttribute(t,e+1),n[e]=e===0?0:n[e-1],n[e+1]=n[e]+Ci.distanceTo(wi);e.setAttribute(`lineDistance`,new tr(n,1))}else L(`LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.`);return this}},Ei=class extends vr{constructor(e){super(),this.isPointsMaterial=!0,this.type=`PointsMaterial`,this.color=new H(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},Di=new Ft,Oi=new Hr,ki=new ar,Ai=new B,ji=class extends ln{constructor(e=new pr,t=new Ei){super(),this.isPoints=!0,this.type=`Points`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){let n=this.geometry,r=this.matrixWorld,i=e.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),ki.copy(n.boundingSphere),ki.applyMatrix4(r),ki.radius+=i,e.ray.intersectsSphere(ki)===!1)return;Di.copy(r).invert(),Oi.copy(e.ray).applyMatrix4(Di);let o=i/((this.scale.x+this.scale.y+this.scale.z)/3),s=o*o,c=n.index,l=n.attributes.position;if(c!==null){let n=Math.max(0,a.start),i=Math.min(c.count,a.start+a.count);for(let a=n,o=i;a<o;a++){let n=c.getX(a);Ai.fromBufferAttribute(l,n),Mi(Ai,n,s,r,e,t,this)}}else{let n=Math.max(0,a.start),i=Math.min(l.count,a.start+a.count);for(let a=n,o=i;a<o;a++)Ai.fromBufferAttribute(l,a),Mi(Ai,a,s,r,e,t,this)}}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}};function Mi(e,t,n,r,i,a,o){let s=Oi.distanceSqToPoint(e);if(s<n){let n=new B;Oi.closestPointToPoint(e,n),n.applyMatrix4(r);let c=i.ray.origin.distanceTo(n);if(c<i.near||c>i.far)return;a.push({distance:c,distanceToRay:Math.sqrt(s),point:n,index:t,face:null,faceIndex:null,barycoord:null,object:o})}}var Ni=class extends kt{constructor(e=[],t=301,n,r,i,a,o,s,c,l){super(e,t,n,r,i,a,o,s,c,l),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},Pi=class extends kt{constructor(e,t,n,r,i,a,o,s,c){super(e,t,n,r,i,a,o,s,c),this.isCanvasTexture=!0,this.needsUpdate=!0}},Fi=class extends kt{constructor(e,t,n=m,i,a,o,s=r,c=r,l,u=T,d=1){if(u!==1026&&u!==1027)throw Error(`THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat`);super({width:e,height:t,depth:d},i,a,o,s,c,u,n,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Tt(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},Ii=class extends Fi{constructor(e,t=m,n=301,i,a,o=r,s=r,c,l=T){let u={width:e,height:e,depth:1},d=[u,u,u,u,u,u];super(e,e,t,n,i,a,o,s,c,l),this.image=d,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},Li=class extends kt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},Ri=class e extends pr{constructor(e=1,t=1,n=1,r=1,i=1,a=1){super(),this.type=`BoxGeometry`,this.parameters={width:e,height:t,depth:n,widthSegments:r,heightSegments:i,depthSegments:a};let o=this;r=Math.floor(r),i=Math.floor(i),a=Math.floor(a);let s=[],c=[],l=[],u=[],d=0,f=0;p(`z`,`y`,`x`,-1,-1,n,t,e,a,i,0),p(`z`,`y`,`x`,1,-1,n,t,-e,a,i,1),p(`x`,`z`,`y`,1,1,e,n,t,r,a,2),p(`x`,`z`,`y`,1,-1,e,n,-t,r,a,3),p(`x`,`y`,`z`,1,-1,e,t,n,r,i,4),p(`x`,`y`,`z`,-1,-1,e,t,-n,r,i,5),this.setIndex(s),this.setAttribute(`position`,new tr(c,3)),this.setAttribute(`normal`,new tr(l,3)),this.setAttribute(`uv`,new tr(u,2));function p(e,t,n,r,i,a,p,m,h,g,_){let v=a/h,y=p/g,b=a/2,x=p/2,S=m/2,C=h+1,w=g+1,T=0,E=0,D=new B;for(let a=0;a<w;a++){let o=a*y-x;for(let s=0;s<C;s++)D[e]=(s*v-b)*r,D[t]=o*i,D[n]=S,c.push(D.x,D.y,D.z),D[e]=0,D[t]=0,D[n]=m>0?1:-1,l.push(D.x,D.y,D.z),u.push(s/h),u.push(1-a/g),T+=1}for(let e=0;e<g;e++)for(let t=0;t<h;t++){let n=d+t+C*e,r=d+t+C*(e+1),i=d+(t+1)+C*(e+1),a=d+(t+1)+C*e;s.push(n,r,a),s.push(r,i,a),E+=6}o.addGroup(f,E,_),f+=E,d+=T}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}},zi=class e extends pr{constructor(e=1,t=32,n=0,r=Math.PI*2){super(),this.type=`CircleGeometry`,this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:r},t=Math.max(3,t);let i=[],a=[],o=[],s=[],c=new B,l=new z;a.push(0,0,0),o.push(0,0,1),s.push(.5,.5);for(let i=0,u=3;i<=t;i++,u+=3){let d=n+i/t*r;c.x=e*Math.cos(d),c.y=e*Math.sin(d),a.push(c.x,c.y,c.z),o.push(0,0,1),l.x=(a[u]/e+1)/2,l.y=(a[u+1]/e+1)/2,s.push(l.x,l.y)}for(let e=1;e<=t;e++)i.push(e,e+1,0);this.setIndex(i),this.setAttribute(`position`,new tr(a,3)),this.setAttribute(`normal`,new tr(o,3)),this.setAttribute(`uv`,new tr(s,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.segments,t.thetaStart,t.thetaLength)}},Bi=new B,Vi=new B,Hi=new B,Ui=new Nn,Wi=class extends pr{constructor(e=null,t=1){if(super(),this.type=`EdgesGeometry`,this.parameters={geometry:e,thresholdAngle:t},e!==null){let n=10**4,r=Math.cos(it*t),i=e.getIndex(),a=e.getAttribute(`position`),o=i?i.count:a.count,s=[0,0,0],c=[`a`,`b`,`c`],l=[,,,],u={},d=[];for(let e=0;e<o;e+=3){i?(s[0]=i.getX(e),s[1]=i.getX(e+1),s[2]=i.getX(e+2)):(s[0]=e,s[1]=e+1,s[2]=e+2);let{a:t,b:o,c:f}=Ui;if(t.fromBufferAttribute(a,s[0]),o.fromBufferAttribute(a,s[1]),f.fromBufferAttribute(a,s[2]),Ui.getNormal(Hi),l[0]=`${Math.round(t.x*n)},${Math.round(t.y*n)},${Math.round(t.z*n)}`,l[1]=`${Math.round(o.x*n)},${Math.round(o.y*n)},${Math.round(o.z*n)}`,l[2]=`${Math.round(f.x*n)},${Math.round(f.y*n)},${Math.round(f.z*n)}`,!(l[0]===l[1]||l[1]===l[2]||l[2]===l[0]))for(let e=0;e<3;e++){let t=(e+1)%3,n=l[e],i=l[t],a=Ui[c[e]],o=Ui[c[t]],f=`${n}_${i}`,p=`${i}_${n}`;p in u&&u[p]?(Hi.dot(u[p].normal)<=r&&(d.push(a.x,a.y,a.z),d.push(o.x,o.y,o.z)),u[p]=null):f in u||(u[f]={index0:s[e],index1:s[t],normal:Hi.clone()})}}for(let e in u)if(u[e]){let{index0:t,index1:n}=u[e];Bi.fromBufferAttribute(a,t),Vi.fromBufferAttribute(a,n),d.push(Bi.x,Bi.y,Bi.z),d.push(Vi.x,Vi.y,Vi.z)}this.setAttribute(`position`,new tr(d,3))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}},Gi=class e extends pr{constructor(e=1,t=1,n=1,r=1){super(),this.type=`PlaneGeometry`,this.parameters={width:e,height:t,widthSegments:n,heightSegments:r};let i=e/2,a=t/2,o=Math.floor(n),s=Math.floor(r),c=o+1,l=s+1,u=e/o,d=t/s,f=[],p=[],m=[],h=[];for(let e=0;e<l;e++){let t=e*d-a;for(let n=0;n<c;n++){let r=n*u-i;p.push(r,-t,0),m.push(0,0,1),h.push(n/o),h.push(1-e/s)}}for(let e=0;e<s;e++)for(let t=0;t<o;t++){let n=t+c*e,r=t+c*(e+1),i=t+1+c*(e+1),a=t+1+c*e;f.push(n,r,a),f.push(r,i,a)}this.setIndex(f),this.setAttribute(`position`,new tr(p,3)),this.setAttribute(`normal`,new tr(m,3)),this.setAttribute(`uv`,new tr(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.widthSegments,t.heightSegments)}};function Ki(e){let t={};for(let n in e){t[n]={};for(let r in e[n]){let i=e[n][r];if(Ji(i))i.isRenderTargetTexture?(L(`UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms().`),t[n][r]=null):t[n][r]=i.clone();else if(Array.isArray(i))if(Ji(i[0])){let e=[];for(let t=0,n=i.length;t<n;t++)e[t]=i[t].clone();t[n][r]=e}else t[n][r]=i.slice();else t[n][r]=i}}return t}function qi(e){let t={};for(let n=0;n<e.length;n++){let r=Ki(e[n]);for(let e in r)t[e]=r[e]}return t}function Ji(e){return e&&(e.isColor||e.isMatrix3||e.isMatrix4||e.isVector2||e.isVector3||e.isVector4||e.isTexture||e.isQuaternion)}function Yi(e){let t=[];for(let n=0;n<e.length;n++)t.push(e[n].clone());return t}function Xi(e){let t=e.getRenderTarget();return t===null?e.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:yt.workingColorSpace}var Zi={clone:Ki,merge:qi},Qi=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,$i=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,ea=class extends vr{constructor(e){super(),this.isShaderMaterial=!0,this.type=`ShaderMaterial`,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Qi,this.fragmentShader=$i,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Ki(e.uniforms),this.uniformsGroups=Yi(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let n in this.uniforms){let r=this.uniforms[n].value;r&&r.isTexture?t.uniforms[n]={type:`t`,value:r.toJSON(e).uuid}:r&&r.isColor?t.uniforms[n]={type:`c`,value:r.getHex()}:r&&r.isVector2?t.uniforms[n]={type:`v2`,value:r.toArray()}:r&&r.isVector3?t.uniforms[n]={type:`v3`,value:r.toArray()}:r&&r.isVector4?t.uniforms[n]={type:`v4`,value:r.toArray()}:r&&r.isMatrix3?t.uniforms[n]={type:`m3`,value:r.toArray()}:r&&r.isMatrix4?t.uniforms[n]={type:`m4`,value:r.toArray()}:t.uniforms[n]={value:r}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let e in this.extensions)this.extensions[e]===!0&&(n[e]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let n in e.uniforms){let r=e.uniforms[n];switch(this.uniforms[n]={},r.type){case`t`:this.uniforms[n].value=t[r.value]||null;break;case`c`:this.uniforms[n].value=new H().setHex(r.value);break;case`v2`:this.uniforms[n].value=new z().fromArray(r.value);break;case`v3`:this.uniforms[n].value=new B().fromArray(r.value);break;case`v4`:this.uniforms[n].value=new At().fromArray(r.value);break;case`m3`:this.uniforms[n].value=new V().fromArray(r.value);break;case`m4`:this.uniforms[n].value=new Ft().fromArray(r.value);break;default:this.uniforms[n].value=r.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let t in e.extensions)this.extensions[t]=e.extensions[t];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},ta=class extends ea{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type=`RawShaderMaterial`}},na=class extends vr{constructor(e){super(),this.isMeshLambertMaterial=!0,this.type=`MeshLambertMaterial`,this.color=new H(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new H(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new z(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Gt,this.combine=0,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.envMapIntensity=e.envMapIntensity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},ra=class extends vr{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type=`MeshDepthMaterial`,this.depthPacking=I,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},ia=class extends vr{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type=`MeshDistanceMaterial`,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function aa(e,t){return!e||e.constructor===t?e:typeof t.BYTES_PER_ELEMENT==`number`?new t(e):Array.prototype.slice.call(e)}var oa=class{constructor(e,t,n,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r===void 0?new t.constructor(n):r,this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,r=t[n],i=t[n-1];validate_interval:{seek:{let a;linear_scan:{forward_scan:if(!(e<r)){for(let a=n+2;;){if(r===void 0){if(e<i)break forward_scan;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(i=r,r=t[++n],e<r)break seek}a=t.length;break linear_scan}if(!(e>=i)){let o=t[1];e<o&&(n=2,i=o);for(let a=n-2;;){if(i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===a)break;if(r=i,i=t[--n-1],e>=i)break seek}a=n,n=0;break linear_scan}break validate_interval}for(;n<a;){let r=n+a>>>1;e<t[r]?a=r:n=r+1}if(r=t[n],i=t[n-1],i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,i,r)}return this.interpolate_(n,i,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,r=this.valueSize,i=e*r;for(let e=0;e!==r;++e)t[e]=n[i+e];return t}interpolate_(){throw Error(`THREE.Interpolant: Call to abstract method.`)}intervalChanged_(){}},sa=class extends oa{constructor(e,t,n,r){super(e,t,n,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Le,endingEnd:Le}}intervalChanged_(e,t,n){let r=this.parameterPositions,i=e-2,a=e+1,o=r[i],s=r[a];if(o===void 0)switch(this.getSettings_().endingStart){case F:i=e,o=2*t-n;break;case Re:i=r.length-2,o=t+r[i]-r[i+1];break;default:i=e,o=n}if(s===void 0)switch(this.getSettings_().endingEnd){case F:a=e,s=2*n-t;break;case Re:a=1,s=n+r[1]-r[0];break;default:a=e-1,s=t}let c=(n-t)*.5,l=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(s-n),this._offsetPrev=i*l,this._offsetNext=a*l}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,p=(n-t)/(r-t),m=p*p,h=m*p,g=-d*h+2*d*m-d*p,_=(1+d)*h+(-1.5-2*d)*m+(-.5+d)*p+1,v=(-1-f)*h+(1.5+f)*m+.5*p,y=f*h-f*m;for(let e=0;e!==o;++e)i[e]=g*a[l+e]+_*a[c+e]+v*a[s+e]+y*a[u+e];return i}},ca=class extends oa{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=(n-t)/(r-t),u=1-l;for(let e=0;e!==o;++e)i[e]=a[c+e]*u+a[s+e]*l;return i}},la=class extends oa{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e){return this.copySampleValue_(e-1)}},ua=class extends oa{interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=this.inTangents,u=this.outTangents;if(!l||!u){let e=(n-t)/(r-t),l=1-e;for(let t=0;t!==o;++t)i[t]=a[c+t]*l+a[s+t]*e;return i}let d=o*2,f=e-1;for(let p=0;p!==o;++p){let o=a[c+p],m=a[s+p],h=f*d+p*2,g=u[h],_=u[h+1],v=e*d+p*2,y=l[v],b=l[v+1],x=(n-t)/(r-t),S,C,w,T,E;for(let e=0;e<8;e++){S=x*x,C=S*x,w=1-x,T=w*w,E=T*w;let e=E*t+3*T*x*g+3*w*S*y+C*r-n;if(Math.abs(e)<1e-10)break;let i=3*T*(g-t)+6*w*x*(y-g)+3*S*(r-y);if(Math.abs(i)<1e-10)break;x-=e/i,x=Math.max(0,Math.min(1,x))}i[p]=E*o+3*T*x*_+3*w*S*b+C*m}return i}},da=class{constructor(e,t,n,r){if(e===void 0)throw Error(`THREE.KeyframeTrack: track name is undefined`);if(t===void 0||t.length===0)throw Error(`THREE.KeyframeTrack: no keyframes in track named `+e);this.name=e,this.times=aa(t,this.TimeBufferType),this.values=aa(n,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:aa(e.times,Array),values:aa(e.values,Array)};let t=e.getInterpolation();t!==e.DefaultInterpolation&&(n.interpolation=t)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new la(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new ca(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new sa(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new ua(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case Pe:t=this.InterpolantFactoryMethodDiscrete;break;case P:t=this.InterpolantFactoryMethodLinear;break;case Fe:t=this.InterpolantFactoryMethodSmooth;break;case Ie:t=this.InterpolantFactoryMethodBezier;break}if(t===void 0){let t=`unsupported interpolation for `+this.ValueTypeName+` keyframe track named `+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw Error(t);return L(`KeyframeTrack:`,t),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Pe;case this.InterpolantFactoryMethodLinear:return P;case this.InterpolantFactoryMethodSmooth:return Fe;case this.InterpolantFactoryMethodBezier:return Ie}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]*=e}return this}trim(e,t){let n=this.times,r=n.length,i=0,a=r-1;for(;i!==r&&n[i]<e;)++i;for(;a!==-1&&n[a]>t;)--a;if(++a,i!==0||a!==r){i>=a&&(a=Math.max(a,1),i=a-1);let e=this.getValueSize();this.times=n.slice(i,a),this.values=this.values.slice(i*e,a*e)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(R(`KeyframeTrack: Invalid value size in track.`,this),e=!1);let n=this.times,r=this.values,i=n.length;i===0&&(R(`KeyframeTrack: Track is empty.`,this),e=!1);let a=null;for(let t=0;t!==i;t++){let r=n[t];if(typeof r==`number`&&isNaN(r)){R(`KeyframeTrack: Time is not a valid number.`,this,t,r),e=!1;break}if(a!==null&&a>r){R(`KeyframeTrack: Out of order keys.`,this,t,r,a),e=!1;break}a=r}if(r!==void 0&&qe(r))for(let t=0,n=r.length;t!==n;++t){let n=r[t];if(isNaN(n)){R(`KeyframeTrack: Value is not a valid number.`,this,t,n),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),r=this.getInterpolation()===Fe,i=e.length-1,a=1;for(let o=1;o<i;++o){let i=!1,s=e[o];if(s!==e[o+1]&&(o!==1||s!==e[0]))if(r)i=!0;else{let e=o*n,r=e-n,a=e+n;for(let o=0;o!==n;++o){let n=t[e+o];if(n!==t[r+o]||n!==t[a+o]){i=!0;break}}}if(i){if(o!==a){e[a]=e[o];let r=o*n,i=a*n;for(let e=0;e!==n;++e)t[i+e]=t[r+e]}++a}}if(i>0){e[a]=e[i];for(let e=i*n,r=a*n,o=0;o!==n;++o)t[r+o]=t[e+o];++a}return a===e.length?(this.times=e,this.values=t):(this.times=e.slice(0,a),this.values=t.slice(0,a*n)),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,r=new n(this.name,e,t);return r.createInterpolant=this.createInterpolant,r}};da.prototype.ValueTypeName=``,da.prototype.TimeBufferType=Float32Array,da.prototype.ValueBufferType=Float32Array,da.prototype.DefaultInterpolation=P;var fa=class extends da{constructor(e,t,n){super(e,t,n)}};fa.prototype.ValueTypeName=`bool`,fa.prototype.ValueBufferType=Array,fa.prototype.DefaultInterpolation=Pe,fa.prototype.InterpolantFactoryMethodLinear=void 0,fa.prototype.InterpolantFactoryMethodSmooth=void 0;var pa=class extends da{constructor(e,t,n,r){super(e,t,n,r)}};pa.prototype.ValueTypeName=`color`;var ma=class extends da{constructor(e,t,n,r){super(e,t,n,r)}};ma.prototype.ValueTypeName=`number`;var ha=class extends oa{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=(n-t)/(r-t),c=e*o;for(let e=c+o;c!==e;c+=4)ft.slerpFlat(i,0,a,c-o,a,c,s);return i}},ga=class extends da{constructor(e,t,n,r){super(e,t,n,r)}InterpolantFactoryMethodLinear(e){return new ha(this.times,this.values,this.getValueSize(),e)}};ga.prototype.ValueTypeName=`quaternion`,ga.prototype.InterpolantFactoryMethodSmooth=void 0;var _a=class extends da{constructor(e,t,n){super(e,t,n)}};_a.prototype.ValueTypeName=`string`,_a.prototype.ValueBufferType=Array,_a.prototype.DefaultInterpolation=Pe,_a.prototype.InterpolantFactoryMethodLinear=void 0,_a.prototype.InterpolantFactoryMethodSmooth=void 0;var va=class extends da{constructor(e,t,n,r){super(e,t,n,r)}};va.prototype.ValueTypeName=`vector`;var ya=new class{constructor(e,t,n){let r=this,i=!1,a=0,o=0,s,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this._abortController=null,this.itemStart=function(e){o++,i===!1&&r.onStart!==void 0&&r.onStart(e,a,o),i=!0},this.itemEnd=function(e){a++,r.onProgress!==void 0&&r.onProgress(e,a,o),a===o&&(i=!1,r.onLoad!==void 0&&r.onLoad())},this.itemError=function(e){r.onError!==void 0&&r.onError(e)},this.resolveURL=function(e){return e=e.normalize(`NFC`),s?s(e):e},this.setURLModifier=function(e){return s=e,this},this.addHandler=function(e,t){return c.push(e,t),this},this.removeHandler=function(e){let t=c.indexOf(e);return t!==-1&&c.splice(t,2),this},this.getHandler=function(e){for(let t=0,n=c.length;t<n;t+=2){let n=c[t],r=c[t+1];if(n.global&&(n.lastIndex=0),n.test(e))return r}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||=new AbortController,this._abortController}},ba=class{constructor(e){this.manager=e===void 0?ya:e,this.crossOrigin=`anonymous`,this.withCredentials=!1,this.path=``,this.resourcePath=``,this.requestHeader={},typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}load(){}loadAsync(e,t){let n=this;return new Promise(function(r,i){n.load(e,r,t,i)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};ba.DEFAULT_MATERIAL_NAME=`__DEFAULT`;var xa=class extends ln{constructor(e,t=1){super(),this.isLight=!0,this.type=`Light`,this.color=new H(e),this.intensity=t}dispose(){this.dispatchEvent({type:`dispose`})}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},Sa=new Ft,Ca=new B,wa=new B,Ta=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new z(512,512),this.mapType=l,this.map=null,this.mapPass=null,this.matrix=new Ft,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new fi,this._frameExtents=new z(1,1),this._viewportCount=1,this._viewports=[new At(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,n=this.matrix;Ca.setFromMatrixPosition(e.matrixWorld),t.position.copy(Ca),wa.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(wa),t.updateMatrixWorld(),Sa.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Sa,t.coordinateSystem,t.reversedDepth),t.coordinateSystem===2001||t.reversedDepth?n.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(Sa)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},Ea=new B,Da=new ft,Oa=new B,ka=class extends ln{constructor(){super(),this.isCamera=!0,this.type=`Camera`,this.matrixWorldInverse=new Ft,this.projectionMatrix=new Ft,this.projectionMatrixInverse=new Ft,this.coordinateSystem=Ge,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(Ea,Da,Oa),Oa.x===1&&Oa.y===1&&Oa.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ea,Da,Oa.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(Ea,Da,Oa),Oa.x===1&&Oa.y===1&&Oa.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ea,Da,Oa.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},Aa=new B,ja=new z,Ma=new z,Na=class extends ka{constructor(e=50,t=1,n=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type=`PerspectiveCamera`,this.fov=e,this.zoom=1,this.near=n,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=at*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(it*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return at*2*Math.atan(Math.tan(it*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Aa.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Aa.x,Aa.y).multiplyScalar(-e/Aa.z),Aa.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Aa.x,Aa.y).multiplyScalar(-e/Aa.z)}getViewSize(e,t){return this.getViewBounds(e,ja,Ma),t.subVectors(Ma,ja)}setViewOffset(e,t,n,r,i,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(it*.5*this.fov)/this.zoom,n=2*t,r=this.aspect*n,i=-.5*r,a=this.view;if(this.view!==null&&this.view.enabled){let e=a.fullWidth,o=a.fullHeight;i+=a.offsetX*r/e,t-=a.offsetY*n/o,r*=a.width/e,n*=a.height/o}let o=this.filmOffset;o!==0&&(i+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(i,i+r,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},Pa=class extends ka{constructor(e=-1,t=1,n=1,r=-1,i=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type=`OrthographicCamera`,this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=r,this.near=i,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,r,i,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,r=(this.top+this.bottom)/2,i=n-e,a=n+e,o=r+t,s=r-t;if(this.view!==null&&this.view.enabled){let e=(this.right-this.left)/this.view.fullWidth/this.zoom,t=(this.top-this.bottom)/this.view.fullHeight/this.zoom;i+=e*this.view.offsetX,a=i+e*this.view.width,o-=t*this.view.offsetY,s=o-t*this.view.height}this.projectionMatrix.makeOrthographic(i,a,o,s,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Fa=class extends Ta{constructor(){super(new Pa(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Ia=class extends xa{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type=`DirectionalLight`,this.position.copy(ln.DEFAULT_UP),this.updateMatrix(),this.target=new ln,this.shadow=new Fa}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}},La=class extends xa{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type=`AmbientLight`}},Ra=-90,za=1,Ba=class extends ln{constructor(e,t,n){super(),this.type=`CubeCamera`,this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let r=new Na(Ra,za,e,t);r.layers=this.layers,this.add(r);let i=new Na(Ra,za,e,t);i.layers=this.layers,this.add(i);let a=new Na(Ra,za,e,t);a.layers=this.layers,this.add(a);let o=new Na(Ra,za,e,t);o.layers=this.layers,this.add(o);let s=new Na(Ra,za,e,t);s.layers=this.layers,this.add(s);let c=new Na(Ra,za,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,r,i,a,o,s]=t;for(let e of t)this.remove(e);if(e===2e3)n.up.set(0,1,0),n.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),i.up.set(0,0,-1),i.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),s.up.set(0,1,0),s.lookAt(0,0,-1);else if(e===2001)n.up.set(0,-1,0),n.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),i.up.set(0,0,1),i.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),s.up.set(0,-1,0),s.lookAt(0,0,-1);else throw Error(`THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: `+e);for(let e of t)this.add(e),e.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[i,a,o,s,c,l]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),p=e.xr.enabled;e.xr.enabled=!1;let m=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let h=!1;h=e.isWebGLRenderer===!0?e.state.buffers.depth.getReversed():e.reversedDepthBuffer,e.setRenderTarget(n,0,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,i),e.setRenderTarget(n,1,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,2,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,3,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,s),e.setRenderTarget(n,4,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.generateMipmaps=m,e.setRenderTarget(n,5,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(u,d,f),e.xr.enabled=p,n.texture.needsPMREMUpdate=!0}},Va=class extends Na{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}},Ha=`\\[\\]\\.:\\/`,Ua=RegExp(`[\\[\\]\\.:\\/]`,`g`),Wa=`[^\\[\\]\\.:\\/]`,Ga=`[^`+Ha.replace(`\\.`,``)+`]`,Ka=`((?:WC+[\\/:])*)`.replace(`WC`,Wa),qa=`(WCOD+)?`.replace(`WCOD`,Ga),Ja=`(?:\\.(WC+)(?:\\[(.+)\\])?)?`.replace(`WC`,Wa),Ya=`\\.(WC+)(?:\\[(.+)\\])?`.replace(`WC`,Wa),Xa=RegExp(`^`+Ka+qa+Ja+Ya+`$`),Za=[`material`,`materials`,`bones`,`map`],Qa=class{constructor(e,t,n){let r=n||$a.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,r=this._bindings[n];r!==void 0&&r.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let r=this._targetGroup.nCachedObjects_,i=n.length;r!==i;++r)n[r].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},$a=class e{constructor(t,n,r){this.path=n,this.parsedPath=r||e.parseTrackName(n),this.node=e.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,n,r){return t&&t.isAnimationObjectGroup?new e.Composite(t,n,r):new e(t,n,r)}static sanitizeNodeName(e){return e.replace(/\s/g,`_`).replace(Ua,``)}static parseTrackName(e){let t=Xa.exec(e);if(t===null)throw Error(`THREE.PropertyBinding: Cannot parse trackName: `+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},r=n.nodeName&&n.nodeName.lastIndexOf(`.`);if(r!==void 0&&r!==-1){let e=n.nodeName.substring(r+1);Za.indexOf(e)!==-1&&(n.nodeName=n.nodeName.substring(0,r),n.objectName=e)}if(n.propertyName===null||n.propertyName.length===0)throw Error(`THREE.PropertyBinding: can not parse propertyName from trackName: `+e);return n}static findNode(e,t){if(t===void 0||t===``||t===`.`||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(e){for(let r=0;r<e.length;r++){let i=e[r];if(i.name===t||i.uuid===t)return i;let a=n(i.children);if(a)return a}return null},r=n(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)e[t++]=n[r]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let t=this.node,n=this.parsedPath,r=n.objectName,i=n.propertyName,a=n.propertyIndex;if(t||(t=e.findNode(this.rootNode,n.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){L(`PropertyBinding: No target node found for track: `+this.path+`.`);return}if(r){let e=n.objectIndex;switch(r){case`materials`:if(!t.material){R(`PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.materials){R(`PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.`,this);return}t=t.material.materials;break;case`bones`:if(!t.skeleton){R(`PropertyBinding: Can not bind to bones as node does not have a skeleton.`,this);return}t=t.skeleton.bones;for(let n=0;n<t.length;n++)if(t[n].name===e){e=n;break}break;case`map`:if(`map`in t){t=t.map;break}if(!t.material){R(`PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.map){R(`PropertyBinding: Can not bind to material.map as node.material does not have a map.`,this);return}t=t.material.map;break;default:if(t[r]===void 0){R(`PropertyBinding: Can not bind to objectName of node undefined.`,this);return}t=t[r]}if(e!==void 0){if(t[e]===void 0){R(`PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.`,this,t);return}t=t[e]}}let o=t[i];if(o===void 0){let e=n.nodeName;R(`PropertyBinding: Trying to update property for track: `+e+`.`+i+` but it wasn't found.`,t);return}let s=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?s=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(s=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(a!==void 0){if(i===`morphTargetInfluences`){if(!t.geometry){R(`PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.`,this);return}if(!t.geometry.morphAttributes){R(`PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.`,this);return}t.morphTargetDictionary[a]!==void 0&&(a=t.morphTargetDictionary[a])}c=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=a}else o.fromArray!==void 0&&o.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(c=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=i;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][s]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};$a.Composite=Qa,$a.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3},$a.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2},$a.prototype.GetterByBindingType=[$a.prototype._getValue_direct,$a.prototype._getValue_array,$a.prototype._getValue_arrayElement,$a.prototype._getValue_toArray],$a.prototype.SetterByBindingTypeAndVersioning=[[$a.prototype._setValue_direct,$a.prototype._setValue_direct_setNeedsUpdate,$a.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[$a.prototype._setValue_array,$a.prototype._setValue_array_setNeedsUpdate,$a.prototype._setValue_array_setMatrixWorldNeedsUpdate],[$a.prototype._setValue_arrayElement,$a.prototype._setValue_arrayElement_setNeedsUpdate,$a.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[$a.prototype._setValue_fromArray,$a.prototype._setValue_fromArray_setNeedsUpdate,$a.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]],class e{static{e.prototype.isMatrix2=!0}constructor(e,t,n,r){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,r)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,r){let i=this.elements;return i[0]=e,i[2]=t,i[1]=n,i[3]=r,this}};function eo(e,t,n,r){let i=to(r);switch(n){case S:return e*t;case D:return e*t/i.components*i.byteLength;case ee:return e*t/i.components*i.byteLength;case O:return e*t*2/i.components*i.byteLength;case k:return e*t*2/i.components*i.byteLength;case C:return e*t*3/i.components*i.byteLength;case w:return e*t*4/i.components*i.byteLength;case te:return e*t*4/i.components*i.byteLength;case A:case j:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case ne:case re:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case ie:case oe:return Math.max(e,16)*Math.max(t,8)/4;case M:case ae:return Math.max(e,8)*Math.max(t,8)/2;case se:case ce:case ue:case N:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case le:case de:case fe:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case pe:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case me:return Math.floor((e+4)/5)*Math.floor((t+3)/4)*16;case he:return Math.floor((e+4)/5)*Math.floor((t+4)/5)*16;case ge:return Math.floor((e+5)/6)*Math.floor((t+4)/5)*16;case _e:return Math.floor((e+5)/6)*Math.floor((t+5)/6)*16;case ve:return Math.floor((e+7)/8)*Math.floor((t+4)/5)*16;case ye:return Math.floor((e+7)/8)*Math.floor((t+5)/6)*16;case be:return Math.floor((e+7)/8)*Math.floor((t+7)/8)*16;case xe:return Math.floor((e+9)/10)*Math.floor((t+4)/5)*16;case Se:return Math.floor((e+9)/10)*Math.floor((t+5)/6)*16;case Ce:return Math.floor((e+9)/10)*Math.floor((t+7)/8)*16;case we:return Math.floor((e+9)/10)*Math.floor((t+9)/10)*16;case Te:return Math.floor((e+11)/12)*Math.floor((t+9)/10)*16;case Ee:return Math.floor((e+11)/12)*Math.floor((t+11)/12)*16;case De:case Oe:case ke:return Math.ceil(e/4)*Math.ceil(t/4)*16;case Ae:case je:return Math.ceil(e/4)*Math.ceil(t/4)*8;case Me:case Ne:return Math.ceil(e/4)*Math.ceil(t/4)*16}throw Error(`Unable to determine texture byte length for ${n} format.`)}function to(e){switch(e){case l:case u:return{byteLength:1,components:1};case f:case d:case g:return{byteLength:2,components:1};case _:case v:return{byteLength:2,components:4};case m:case p:case h:return{byteLength:4,components:1};case b:case x:return{byteLength:4,components:3}}throw Error(`THREE.TextureUtils: Unknown texture type ${e}.`)}typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`register`,{detail:{revision:`185`}})),typeof window<`u`&&(window.__THREE__?L(`WARNING: Multiple instances of Three.js being imported.`):window.__THREE__=`185`);function no(){let e=null,t=!1,n=null,r=null;function i(t,a){n(t,a),r=e.requestAnimationFrame(i)}return{start:function(){t!==!0&&n!==null&&e!==null&&(r=e.requestAnimationFrame(i),t=!0)},stop:function(){e!==null&&e.cancelAnimationFrame(r),t=!1},setAnimationLoop:function(e){n=e},setContext:function(t){e=t}}}function ro(e){let t=new WeakMap;function n(t,n){let r=t.array,i=t.usage,a=r.byteLength,o=e.createBuffer();e.bindBuffer(n,o),e.bufferData(n,r,i),t.onUploadCallback();let s;if(r instanceof Float32Array)s=e.FLOAT;else if(typeof Float16Array<`u`&&r instanceof Float16Array)s=e.HALF_FLOAT;else if(r instanceof Uint16Array)s=t.isFloat16BufferAttribute?e.HALF_FLOAT:e.UNSIGNED_SHORT;else if(r instanceof Int16Array)s=e.SHORT;else if(r instanceof Uint32Array)s=e.UNSIGNED_INT;else if(r instanceof Int32Array)s=e.INT;else if(r instanceof Int8Array)s=e.BYTE;else if(r instanceof Uint8Array)s=e.UNSIGNED_BYTE;else if(r instanceof Uint8ClampedArray)s=e.UNSIGNED_BYTE;else throw Error(`THREE.WebGLAttributes: Unsupported buffer data format: `+r);return{buffer:o,type:s,bytesPerElement:r.BYTES_PER_ELEMENT,version:t.version,size:a}}function r(t,n,r){let i=n.array,a=n.updateRanges;if(e.bindBuffer(r,t),a.length===0)e.bufferSubData(r,0,i);else{a.sort((e,t)=>e.start-t.start);let t=0;for(let e=1;e<a.length;e++){let n=a[t],r=a[e];r.start<=n.start+n.count+1?n.count=Math.max(n.count,r.start+r.count-n.start):(++t,a[t]=r)}a.length=t+1;for(let t=0,n=a.length;t<n;t++){let n=a[t];e.bufferSubData(r,n.start*i.BYTES_PER_ELEMENT,i,n.start,n.count)}n.clearUpdateRanges()}n.onUploadCallback()}function i(e){return e.isInterleavedBufferAttribute&&(e=e.data),t.get(e)}function a(n){n.isInterleavedBufferAttribute&&(n=n.data);let r=t.get(n);r&&(e.deleteBuffer(r.buffer),t.delete(n))}function o(e,i){if(e.isInterleavedBufferAttribute&&(e=e.data),e.isGLBufferAttribute){let n=t.get(e);(!n||n.version<e.version)&&t.set(e,{buffer:e.buffer,type:e.type,bytesPerElement:e.elementSize,version:e.version});return}let a=t.get(e);if(a===void 0)t.set(e,n(e,i));else if(a.version<e.version){if(a.size!==e.array.byteLength)throw Error(`THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.`);r(a.buffer,e,i),a.version=e.version}}return{get:i,remove:a,update:o}}var U={alphahash_fragment:`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,alphahash_pars_fragment:`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,alphamap_fragment:`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,alphamap_pars_fragment:`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,alphatest_fragment:`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,alphatest_pars_fragment:`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,aomap_fragment:`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,aomap_pars_fragment:`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,batching_pars_vertex:`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,batching_vertex:`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,begin_vertex:`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,beginnormal_vertex:`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,bsdfs:`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,iridescence_fragment:`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,bumpmap_pars_fragment:`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,clipping_planes_fragment:`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,clipping_planes_pars_fragment:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,clipping_planes_pars_vertex:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,clipping_planes_vertex:`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,color_fragment:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,color_pars_fragment:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,color_pars_vertex:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,color_vertex:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,common:`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,cube_uv_reflection_fragment:`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,defaultnormal_vertex:`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,displacementmap_pars_vertex:`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,displacementmap_vertex:`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,emissivemap_fragment:`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,emissivemap_pars_fragment:`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,colorspace_fragment:`gl_FragColor = linearToOutputTexel( gl_FragColor );`,colorspace_pars_fragment:`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,envmap_fragment:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,envmap_common_pars_fragment:`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,envmap_pars_fragment:`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,envmap_pars_vertex:`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,envmap_physical_pars_fragment:`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,envmap_vertex:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,fog_vertex:`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,fog_pars_vertex:`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,fog_fragment:`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,fog_pars_fragment:`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,gradientmap_pars_fragment:`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,lightmap_pars_fragment:`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,lights_lambert_fragment:`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,lights_lambert_pars_fragment:`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,lights_pars_begin:`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,lights_toon_fragment:`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,lights_toon_pars_fragment:`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,lights_phong_fragment:`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,lights_phong_pars_fragment:`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,lights_physical_fragment:`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,lights_physical_pars_fragment:`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
		vec3 iridescenceFresnelDielectric;
		vec3 iridescenceFresnelMetallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
vec3 BRDF_GGX_Multiscatter( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 singleScatter = BRDF_GGX( lightDir, viewDir, normal, material );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 dfgV = texture2D( dfgLUT, vec2( material.roughness, dotNV ) ).rg;
	vec2 dfgL = texture2D( dfgLUT, vec2( material.roughness, dotNL ) ).rg;
	vec3 FssEss_V = material.specularColorBlended * dfgV.x + material.specularF90 * dfgV.y;
	vec3 FssEss_L = material.specularColorBlended * dfgL.x + material.specularF90 * dfgL.y;
	float Ess_V = dfgV.x + dfgV.y;
	float Ess_L = dfgL.x + dfgL.y;
	float Ems_V = 1.0 - Ess_V;
	float Ems_L = 1.0 - Ess_L;
	vec3 Favg = material.specularColorBlended + ( 1.0 - material.specularColorBlended ) * 0.047619;
	vec3 Fms = FssEss_V * FssEss_L * Favg / ( 1.0 - Ems_V * Ems_L * Favg + EPSILON );
	float compensationFactor = Ems_V * Ems_L;
	vec3 multiScatter = Fms * compensationFactor;
	return singleScatter + multiScatter;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX_Multiscatter( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnelDielectric, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceFresnelMetallic, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,lights_fragment_begin:`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( material.iridescenceFresnelDielectric, material.iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,lights_fragment_maps:`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,lights_fragment_end:`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,lightprobes_pars_fragment:`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,logdepthbuf_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,logdepthbuf_pars_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_pars_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,map_fragment:`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,map_pars_fragment:`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,map_particle_fragment:`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,map_particle_pars_fragment:`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,metalnessmap_fragment:`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,metalnessmap_pars_fragment:`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,morphinstance_vertex:`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,morphcolor_vertex:`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,morphnormal_vertex:`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,morphtarget_pars_vertex:`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,morphtarget_vertex:`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,normal_fragment_begin:`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,normal_fragment_maps:`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,normal_pars_fragment:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_pars_vertex:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_vertex:`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,normalmap_pars_fragment:`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,clearcoat_normal_fragment_begin:`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,clearcoat_normal_fragment_maps:`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,clearcoat_pars_fragment:`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,iridescence_pars_fragment:`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,opaque_fragment:`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,packing:`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,premultiplied_alpha_fragment:`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,project_vertex:`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,dithering_fragment:`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,dithering_pars_fragment:`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,roughnessmap_fragment:`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,roughnessmap_pars_fragment:`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,shadowmap_pars_fragment:`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,shadowmap_pars_vertex:`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,shadowmap_vertex:`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,shadowmask_pars_fragment:`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,skinbase_vertex:`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,skinning_pars_vertex:`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,skinning_vertex:`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,skinnormal_vertex:`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,specularmap_fragment:`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,specularmap_pars_fragment:`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,tonemapping_fragment:`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,tonemapping_pars_fragment:`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,transmission_fragment:`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,transmission_pars_fragment:`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,uv_pars_fragment:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_pars_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,worldpos_vertex:`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,background_vert:`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,background_frag:`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,backgroundCube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,backgroundCube_frag:`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,cube_frag:`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,depth_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,depth_frag:`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,distance_vert:`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,distance_frag:`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,equirect_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,equirect_frag:`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,linedashed_vert:`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,linedashed_frag:`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,meshbasic_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,meshbasic_frag:`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshlambert_vert:`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshlambert_frag:`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshmatcap_vert:`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,meshmatcap_frag:`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshnormal_vert:`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,meshnormal_frag:`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,meshphong_vert:`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshphong_frag:`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshphysical_vert:`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,meshphysical_frag:`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshtoon_vert:`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshtoon_frag:`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,points_vert:`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,points_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,shadow_vert:`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,shadow_frag:`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,sprite_vert:`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,sprite_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`},W={common:{diffuse:{value:new H(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new V},alphaMap:{value:null},alphaMapTransform:{value:new V},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new V}},envmap:{envMap:{value:null},envMapRotation:{value:new V},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new V}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new V}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new V},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new V},normalScale:{value:new z(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new V},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new V}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new V}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new V}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new H(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new B},probesMax:{value:new B},probesResolution:{value:new B}},points:{diffuse:{value:new H(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new V},alphaTest:{value:0},uvTransform:{value:new V}},sprite:{diffuse:{value:new H(16777215)},opacity:{value:1},center:{value:new z(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new V},alphaMap:{value:null},alphaMapTransform:{value:new V},alphaTest:{value:0}}},io={basic:{uniforms:qi([W.common,W.specularmap,W.envmap,W.aomap,W.lightmap,W.fog]),vertexShader:U.meshbasic_vert,fragmentShader:U.meshbasic_frag},lambert:{uniforms:qi([W.common,W.specularmap,W.envmap,W.aomap,W.lightmap,W.emissivemap,W.bumpmap,W.normalmap,W.displacementmap,W.fog,W.lights,{emissive:{value:new H(0)},envMapIntensity:{value:1}}]),vertexShader:U.meshlambert_vert,fragmentShader:U.meshlambert_frag},phong:{uniforms:qi([W.common,W.specularmap,W.envmap,W.aomap,W.lightmap,W.emissivemap,W.bumpmap,W.normalmap,W.displacementmap,W.fog,W.lights,{emissive:{value:new H(0)},specular:{value:new H(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:U.meshphong_vert,fragmentShader:U.meshphong_frag},standard:{uniforms:qi([W.common,W.envmap,W.aomap,W.lightmap,W.emissivemap,W.bumpmap,W.normalmap,W.displacementmap,W.roughnessmap,W.metalnessmap,W.fog,W.lights,{emissive:{value:new H(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:U.meshphysical_vert,fragmentShader:U.meshphysical_frag},toon:{uniforms:qi([W.common,W.aomap,W.lightmap,W.emissivemap,W.bumpmap,W.normalmap,W.displacementmap,W.gradientmap,W.fog,W.lights,{emissive:{value:new H(0)}}]),vertexShader:U.meshtoon_vert,fragmentShader:U.meshtoon_frag},matcap:{uniforms:qi([W.common,W.bumpmap,W.normalmap,W.displacementmap,W.fog,{matcap:{value:null}}]),vertexShader:U.meshmatcap_vert,fragmentShader:U.meshmatcap_frag},points:{uniforms:qi([W.points,W.fog]),vertexShader:U.points_vert,fragmentShader:U.points_frag},dashed:{uniforms:qi([W.common,W.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:U.linedashed_vert,fragmentShader:U.linedashed_frag},depth:{uniforms:qi([W.common,W.displacementmap]),vertexShader:U.depth_vert,fragmentShader:U.depth_frag},normal:{uniforms:qi([W.common,W.bumpmap,W.normalmap,W.displacementmap,{opacity:{value:1}}]),vertexShader:U.meshnormal_vert,fragmentShader:U.meshnormal_frag},sprite:{uniforms:qi([W.sprite,W.fog]),vertexShader:U.sprite_vert,fragmentShader:U.sprite_frag},background:{uniforms:{uvTransform:{value:new V},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:U.background_vert,fragmentShader:U.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new V}},vertexShader:U.backgroundCube_vert,fragmentShader:U.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:U.cube_vert,fragmentShader:U.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:U.equirect_vert,fragmentShader:U.equirect_frag},distance:{uniforms:qi([W.common,W.displacementmap,{referencePosition:{value:new B},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:U.distance_vert,fragmentShader:U.distance_frag},shadow:{uniforms:qi([W.lights,W.fog,{color:{value:new H(0)},opacity:{value:1}}]),vertexShader:U.shadow_vert,fragmentShader:U.shadow_frag}};io.physical={uniforms:qi([io.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new V},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new V},clearcoatNormalScale:{value:new z(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new V},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new V},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new V},sheen:{value:0},sheenColor:{value:new H(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new V},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new V},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new V},transmissionSamplerSize:{value:new z},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new V},attenuationDistance:{value:0},attenuationColor:{value:new H(0)},specularColor:{value:new H(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new V},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new V},anisotropyVector:{value:new z},anisotropyMap:{value:null},anisotropyMapTransform:{value:new V}}]),vertexShader:U.meshphysical_vert,fragmentShader:U.meshphysical_frag};var ao={r:0,b:0,g:0},oo=new Ft,so=new V;so.set(-1,0,0,0,1,0,0,0,1);function co(e,t,n,r,i,a){let o=new H(0),s=i===!0?0:1,c,l,u=null,d=0,f=null;function p(e){let n=e.isScene===!0?e.background:null;if(n&&n.isTexture){let r=e.backgroundBlurriness>0;n=t.get(n,r)}return n}function m(t){let r=!1,i=p(t);i===null?g(o,s):i&&i.isColor&&(g(i,1),r=!0);let c=e.xr.getEnvironmentBlendMode();c===`additive`?n.buffers.color.setClear(0,0,0,1,a):c===`alpha-blend`&&n.buffers.color.setClear(0,0,0,0,a),(e.autoClear||r)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function h(t,n){let i=p(n);i&&(i.isCubeTexture||i.mapping===306)?(l===void 0&&(l=new ti(new Ri(1,1,1),new ea({name:`BackgroundCubeMaterial`,uniforms:Ki(io.backgroundCube.uniforms),vertexShader:io.backgroundCube.vertexShader,fragmentShader:io.backgroundCube.fragmentShader,side:1,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute(`normal`),l.geometry.deleteAttribute(`uv`),l.onBeforeRender=function(e,t,n){this.matrixWorld.copyPosition(n.matrixWorld)},Object.defineProperty(l.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(l)),l.material.uniforms.envMap.value=i,l.material.uniforms.backgroundBlurriness.value=n.backgroundBlurriness,l.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,l.material.uniforms.backgroundRotation.value.setFromMatrix4(oo.makeRotationFromEuler(n.backgroundRotation)).transpose(),i.isCubeTexture&&i.isRenderTargetTexture===!1&&l.material.uniforms.backgroundRotation.value.premultiply(so),l.material.toneMapped=yt.getTransfer(i.colorSpace)!==He,(u!==i||d!==i.version||f!==e.toneMapping)&&(l.material.needsUpdate=!0,u=i,d=i.version,f=e.toneMapping),l.layers.enableAll(),t.unshift(l,l.geometry,l.material,0,0,null)):i&&i.isTexture&&(c===void 0&&(c=new ti(new Gi(2,2),new ea({name:`BackgroundMaterial`,uniforms:Ki(io.background.uniforms),vertexShader:io.background.vertexShader,fragmentShader:io.background.fragmentShader,side:0,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute(`normal`),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(c)),c.material.uniforms.t2D.value=i,c.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,c.material.toneMapped=yt.getTransfer(i.colorSpace)!==He,i.matrixAutoUpdate===!0&&i.updateMatrix(),c.material.uniforms.uvTransform.value.copy(i.matrix),(u!==i||d!==i.version||f!==e.toneMapping)&&(c.material.needsUpdate=!0,u=i,d=i.version,f=e.toneMapping),c.layers.enableAll(),t.unshift(c,c.geometry,c.material,0,0,null))}function g(t,r){t.getRGB(ao,Xi(e)),n.buffers.color.setClear(ao.r,ao.g,ao.b,r,a)}function _(){l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return o},setClearColor:function(e,t=1){o.set(e),s=t,g(o,s)},getClearAlpha:function(){return s},setClearAlpha:function(e){s=e,g(o,s)},render:m,addToRenderList:h,dispose:_}}function lo(e,t){let n=e.getParameter(e.MAX_VERTEX_ATTRIBS),r={},i=f(null),a=i,o=!1;function s(n,r,i,s,c){let u=!1,f=d(n,s,i,r);a!==f&&(a=f,l(a.object)),u=p(n,s,i,c),u&&m(n,s,i,c),c!==null&&t.update(c,e.ELEMENT_ARRAY_BUFFER),(u||o)&&(o=!1,b(n,r,i,s),c!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.get(c).buffer))}function c(){return e.createVertexArray()}function l(t){return e.bindVertexArray(t)}function u(t){return e.deleteVertexArray(t)}function d(e,t,n,i){let a=i.wireframe===!0,o=r[t.id];o===void 0&&(o={},r[t.id]=o);let s=e.isInstancedMesh===!0?e.id:0,l=o[s];l===void 0&&(l={},o[s]=l);let u=l[n.id];u===void 0&&(u={},l[n.id]=u);let d=u[a];return d===void 0&&(d=f(c()),u[a]=d),d}function f(e){let t=[],r=[],i=[];for(let e=0;e<n;e++)t[e]=0,r[e]=0,i[e]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:t,enabledAttributes:r,attributeDivisors:i,object:e,attributes:{},index:null}}function p(e,t,n,r){let i=a.attributes,o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=i[t],r=o[t];if(r===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(r=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(r=e.instanceColor)),n===void 0||n.attribute!==r||r&&n.data!==r.data)return!0;s++}return a.attributesNum!==s||a.index!==r}function m(e,t,n,r){let i={},o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=o[t];n===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(n=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(n=e.instanceColor));let r={};r.attribute=n,n&&n.data&&(r.data=n.data),i[t]=r,s++}a.attributes=i,a.attributesNum=s,a.index=r}function h(){let e=a.newAttributes;for(let t=0,n=e.length;t<n;t++)e[t]=0}function g(e){_(e,0)}function _(t,n){let r=a.newAttributes,i=a.enabledAttributes,o=a.attributeDivisors;r[t]=1,i[t]===0&&(e.enableVertexAttribArray(t),i[t]=1),o[t]!==n&&(e.vertexAttribDivisor(t,n),o[t]=n)}function v(){let t=a.newAttributes,n=a.enabledAttributes;for(let r=0,i=n.length;r<i;r++)n[r]!==t[r]&&(e.disableVertexAttribArray(r),n[r]=0)}function y(t,n,r,i,a,o,s){s===!0?e.vertexAttribIPointer(t,n,r,a,o):e.vertexAttribPointer(t,n,r,i,a,o)}function b(n,r,i,a){h();let o=a.attributes,s=i.getAttributes(),c=r.defaultAttributeValues;for(let r in s){let i=s[r];if(i.location>=0){let s=o[r];if(s===void 0&&(r===`instanceMatrix`&&n.instanceMatrix&&(s=n.instanceMatrix),r===`instanceColor`&&n.instanceColor&&(s=n.instanceColor)),s!==void 0){let r=s.normalized,o=s.itemSize,c=t.get(s);if(c===void 0)continue;let l=c.buffer,u=c.type,d=c.bytesPerElement,f=u===e.INT||u===e.UNSIGNED_INT||s.gpuType===1013;if(s.isInterleavedBufferAttribute){let t=s.data,c=t.stride,p=s.offset;if(t.isInstancedInterleavedBuffer){for(let e=0;e<i.locationSize;e++)_(i.location+e,t.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=t.meshPerAttribute*t.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,c*d,(p+o/i.locationSize*e)*d,f)}else{if(s.isInstancedBufferAttribute){for(let e=0;e<i.locationSize;e++)_(i.location+e,s.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=s.meshPerAttribute*s.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,o*d,o/i.locationSize*e*d,f)}}else if(c!==void 0){let t=c[r];if(t!==void 0)switch(t.length){case 2:e.vertexAttrib2fv(i.location,t);break;case 3:e.vertexAttrib3fv(i.location,t);break;case 4:e.vertexAttrib4fv(i.location,t);break;default:e.vertexAttrib1fv(i.location,t)}}}}v()}function x(){T();for(let e in r){let t=r[e];for(let e in t){let n=t[e];for(let e in n){let t=n[e];for(let e in t)u(t[e].object),delete t[e];delete n[e]}}delete r[e]}}function S(e){if(r[e.id]===void 0)return;let t=r[e.id];for(let e in t){let n=t[e];for(let e in n){let t=n[e];for(let e in t)u(t[e].object),delete t[e];delete n[e]}}delete r[e.id]}function C(e){for(let t in r){let n=r[t];for(let t in n){let r=n[t];if(r[e.id]===void 0)continue;let i=r[e.id];for(let e in i)u(i[e].object),delete i[e];delete r[e.id]}}}function w(e){for(let t in r){let n=r[t],i=e.isInstancedMesh===!0?e.id:0,a=n[i];if(a!==void 0){for(let e in a){let t=a[e];for(let e in t)u(t[e].object),delete t[e];delete a[e]}delete n[i],Object.keys(n).length===0&&delete r[t]}}}function T(){E(),o=!0,a!==i&&(a=i,l(a.object))}function E(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:s,reset:T,resetDefaultState:E,dispose:x,releaseStatesOfGeometry:S,releaseStatesOfObject:w,releaseStatesOfProgram:C,initAttributes:h,enableAttribute:g,disableUnusedAttributes:v}}function uo(e,t,n){let r;function i(e){r=e}function a(t,i){e.drawArrays(r,t,i),n.update(i,r,1)}function o(t,i,a){a!==0&&(e.drawArraysInstanced(r,t,i,a),n.update(i,r,a))}function s(e,i,a){if(a===0)return;t.get(`WEBGL_multi_draw`).multiDrawArraysWEBGL(r,e,0,i,0,a);let o=0;for(let e=0;e<a;e++)o+=i[e];n.update(o,r,1)}this.setMode=i,this.render=a,this.renderInstances=o,this.renderMultiDraw=s}function fo(e,t,n,r){let i;function a(){if(i!==void 0)return i;if(t.has(`EXT_texture_filter_anisotropic`)===!0){let n=t.get(`EXT_texture_filter_anisotropic`);i=e.getParameter(n.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(t){return!(t!==1023&&r.convert(t)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT))}function s(n){let i=n===1016&&(t.has(`EXT_color_buffer_half_float`)||t.has(`EXT_color_buffer_float`));return!(n!==1009&&r.convert(n)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE)&&n!==1015&&!i)}function c(t){if(t===`highp`){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return`highp`;t=`mediump`}return t===`mediump`&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?`mediump`:`lowp`}let l=n.precision===void 0?`highp`:n.precision,u=c(l);u!==l&&(L(`WebGLRenderer:`,l,`not supported, using`,u,`instead.`),l=u);let d=n.logarithmicDepthBuffer===!0,f=n.reversedDepthBuffer===!0&&t.has(`EXT_clip_control`);n.reversedDepthBuffer===!0&&f===!1&&L(`WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.`);let p=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),m=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),h=e.getParameter(e.MAX_TEXTURE_SIZE),g=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),_=e.getParameter(e.MAX_VERTEX_ATTRIBS),v=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),y=e.getParameter(e.MAX_VARYING_VECTORS),b=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),x=e.getParameter(e.MAX_SAMPLES),S=e.getParameter(e.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:s,precision:l,logarithmicDepthBuffer:d,reversedDepthBuffer:f,maxTextures:p,maxVertexTextures:m,maxTextureSize:h,maxCubemapSize:g,maxAttributes:_,maxVertexUniforms:v,maxVaryings:y,maxFragmentUniforms:b,maxSamples:x,samples:S}}function po(e){let t=this,n=null,r=0,i=!1,a=!1,o=new ci,s=new V,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(e,t){let n=e.length!==0||t||r!==0||i;return i=t,r=e.length,n},this.beginShadows=function(){a=!0,u(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(e,t){n=u(e,t,0)},this.setState=function(t,o,s){let d=t.clippingPlanes,f=t.clipIntersection,p=t.clipShadows,m=e.get(t);if(!i||d===null||d.length===0||a&&!p)a?u(null):l();else{let e=a?0:r,t=e*4,i=m.clippingState||null;c.value=i,i=u(d,o,t,s);for(let e=0;e!==t;++e)i[e]=n[e];m.clippingState=i,this.numIntersection=f?this.numPlanes:0,this.numPlanes+=e}};function l(){c.value!==n&&(c.value=n,c.needsUpdate=r>0),t.numPlanes=r,t.numIntersection=0}function u(e,n,r,i){let a=e===null?0:e.length,l=null;if(a!==0){if(l=c.value,i!==!0||l===null){let t=r+a*4,i=n.matrixWorldInverse;s.getNormalMatrix(i),(l===null||l.length<t)&&(l=new Float32Array(t));for(let t=0,n=r;t!==a;++t,n+=4)o.copy(e[t]).applyMatrix4(i,s),o.normal.toArray(l,n),l[n+3]=o.constant}c.value=l,c.needsUpdate=!0}return t.numPlanes=a,t.numIntersection=0,l}}var mo=4,ho=[.125,.215,.35,.446,.526,.582],go=20,_o=256,vo=new Pa,yo=new H,bo=null,xo=0,So=0,Co=!1,wo=new B,To=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,n=.1,r=100,i={}){let{size:a=256,position:o=wo}=i;bo=this._renderer.getRenderTarget(),xo=this._renderer.getActiveCubeFace(),So=this._renderer.getActiveMipmapLevel(),Co=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,n,r,s,o),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Mo(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=jo(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=2**this._lodMax}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(bo,xo,So),this._renderer.xr.enabled=Co,e.scissorTest=!1,Oo(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===301||e.mapping===302?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),bo=this._renderer.getRenderTarget(),xo=this._renderer.getActiveCubeFace(),So=this._renderer.getActiveMipmapLevel(),Co=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:o,minFilter:o,generateMipmaps:!1,type:g,format:w,colorSpace:Be,depthBuffer:!1},r=Do(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Do(e,t,n);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=Eo(r)),this._blurMaterial=Ao(r,e,t),this._ggxMaterial=ko(r,e,t)}return r}_compileMaterial(e){let t=new ti(new pr,e);this._renderer.compile(t,vo)}_sceneToCubeUV(e,t,n,r,i){let a=new Na(90,1,t,n),o=[1,-1,1,1,1,1],s=[1,1,1,-1,-1,-1],c=this._renderer,l=c.autoClear,u=c.toneMapping;c.getClearColor(yo),c.toneMapping=0,c.autoClear=!1,c.state.buffers.depth.getReversed()&&(c.setRenderTarget(r),c.clearDepth(),c.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new ti(new Ri,new Ur({name:`PMREM.Background`,side:1,depthWrite:!1,depthTest:!1})));let d=this._backgroundBox,f=d.material,p=!1,m=e.background;m?m.isColor&&(f.color.copy(m),e.background=null,p=!0):(f.color.copy(yo),p=!0);for(let t=0;t<6;t++){let n=t%3;n===0?(a.up.set(0,o[t],0),a.position.set(i.x,i.y,i.z),a.lookAt(i.x+s[t],i.y,i.z)):n===1?(a.up.set(0,0,o[t]),a.position.set(i.x,i.y,i.z),a.lookAt(i.x,i.y+s[t],i.z)):(a.up.set(0,o[t],0),a.position.set(i.x,i.y,i.z),a.lookAt(i.x,i.y,i.z+s[t]));let l=this._cubeSize;Oo(r,n*l,t>2?l:0,l,l),c.setRenderTarget(r),p&&c.render(d,a),c.render(e,a)}c.toneMapping=u,c.autoClear=l,e.background=m}_textureToCubeUV(e,t){let n=this._renderer,r=e.mapping===301||e.mapping===302;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=Mo()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=jo());let i=r?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=i;let o=i.uniforms;o.envMap.value=e;let s=this._cubeSize;Oo(t,0,0,3*s,2*s),n.setRenderTarget(t),n.render(a,vo)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let r=this._lodMeshes.length;for(let t=1;t<r;t++)this._applyGGXFilter(e,t-1,t);t.autoClear=n}_applyGGXFilter(e,t,n){let r=this._renderer,i=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[n];o.material=a;let s=a.uniforms,c=n/(this._lodMeshes.length-1),l=t/(this._lodMeshes.length-1),u=Math.sqrt(c*c-l*l)*(0+c*1.25),{_lodMax:d}=this,f=this._sizeLods[n],p=3*f*(n>d-mo?n-d+mo:0),m=4*(this._cubeSize-f);s.envMap.value=e.texture,s.roughness.value=u,s.mipInt.value=d-t,Oo(i,p,m,3*f,2*f),r.setRenderTarget(i),r.render(o,vo),s.envMap.value=i.texture,s.roughness.value=0,s.mipInt.value=d-n,Oo(e,p,m,3*f,2*f),r.setRenderTarget(e),r.render(o,vo)}_blur(e,t,n,r,i){let a=this._pingPongRenderTarget;this._halfBlur(e,a,t,n,r,`latitudinal`,i),this._halfBlur(a,e,n,n,r,`longitudinal`,i)}_halfBlur(e,t,n,r,i,a,o){let s=this._renderer,c=this._blurMaterial;a!==`latitudinal`&&a!==`longitudinal`&&R(`blur direction must be either latitudinal or longitudinal!`);let l=this._lodMeshes[r];l.material=c;let u=c.uniforms,d=this._sizeLods[n]-1,f=isFinite(i)?Math.PI/(2*d):2*Math.PI/(2*go-1),p=i/f,m=isFinite(i)?1+Math.floor(3*p):go;m>go&&L(`sigmaRadians, ${i}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${go}`);let h=[],g=0;for(let e=0;e<go;++e){let t=e/p,n=Math.exp(-t*t/2);h.push(n),e===0?g+=n:e<m&&(g+=2*n)}for(let e=0;e<h.length;e++)h[e]=h[e]/g;u.envMap.value=e.texture,u.samples.value=m,u.weights.value=h,u.latitudinal.value=a===`latitudinal`,o&&(u.poleAxis.value=o);let{_lodMax:_}=this;u.dTheta.value=f,u.mipInt.value=_-n;let v=this._sizeLods[r];Oo(t,3*v*(r>_-mo?r-_+mo:0),4*(this._cubeSize-v),3*v,2*v),s.setRenderTarget(t),s.render(l,vo)}};function Eo(e){let t=[],n=[],r=[],i=e,a=e-mo+1+ho.length;for(let o=0;o<a;o++){let a=2**i;t.push(a);let s=1/a;o>e-mo?s=ho[o-e+mo-1]:o===0&&(s=0),n.push(s);let c=1/(a-2),l=-c,u=1+c,d=[l,l,u,l,u,u,l,l,u,u,l,u],f=new Float32Array(108),p=new Float32Array(72),m=new Float32Array(36);for(let e=0;e<6;e++){let t=e%3*2/3-1,n=e>2?0:-1,r=[t,n,0,t+2/3,n,0,t+2/3,n+1,0,t,n,0,t+2/3,n+1,0,t,n+1,0];f.set(r,18*e),p.set(d,12*e);let i=[e,e,e,e,e,e];m.set(i,6*e)}let h=new pr;h.setAttribute(`position`,new Qn(f,3)),h.setAttribute(`uv`,new Qn(p,2)),h.setAttribute(`faceIndex`,new Qn(m,1)),r.push(new ti(h,null)),i>mo&&i--}return{lodMeshes:r,sizeLods:t,sigmas:n}}function Do(e,t,n){let r=new Mt(e,t,n);return r.texture.mapping=306,r.texture.name=`PMREM.cubeUv`,r.scissorTest=!0,r}function Oo(e,t,n,r,i){e.viewport.set(t,n,r,i),e.scissor.set(t,n,r,i)}function ko(e,t,n){return new ea({name:`PMREMGGXConvolution`,defines:{GGX_SAMPLES:_o,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:No(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function Ao(e,t,n){let r=new Float32Array(go),i=new B(0,1,0);return new ea({name:`SphericalGaussianBlur`,defines:{n:go,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:r},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:i}},vertexShader:No(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function jo(){return new ea({name:`EquirectangularToCubeUV`,uniforms:{envMap:{value:null}},vertexShader:No(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function Mo(){return new ea({name:`CubemapToCubeUV`,uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:No(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function No(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}var Po=class extends Mt{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},r=[n,n,n,n,n,n];this.texture=new Ni(r),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},r=new Ri(5,5,5),i=new ea({name:`CubemapFromEquirect`,uniforms:Ki(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:1,blending:0});i.uniforms.tEquirect.value=t;let a=new ti(r,i),s=t.minFilter;return t.minFilter===1008&&(t.minFilter=o),new Ba(1,10,this).update(e,a),t.minFilter=s,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,r=!0){let i=e.getRenderTarget();for(let i=0;i<6;i++)e.setRenderTarget(this,i),e.clear(t,n,r);e.setRenderTarget(i)}};function Fo(e){let t=new WeakMap,n=new WeakMap,r=null;function i(e,t=!1){return e==null?null:t?o(e):a(e)}function a(n){if(n&&n.isTexture){let r=n.mapping;if(r===303||r===304)if(t.has(n)){let e=t.get(n).texture;return s(e,n.mapping)}else{let r=n.image;if(r&&r.height>0){let i=new Po(r.height);return i.fromEquirectangularTexture(e,n),t.set(n,i),n.addEventListener(`dispose`,l),s(i.texture,n.mapping)}else return null}}return n}function o(t){if(t&&t.isTexture){let i=t.mapping,a=i===303||i===304,o=i===301||i===302;if(a||o){let i=n.get(t),s=i===void 0?0:i.texture.pmremVersion;if(t.isRenderTargetTexture&&t.pmremVersion!==s)return r===null&&(r=new To(e)),i=a?r.fromEquirectangular(t,i):r.fromCubemap(t,i),i.texture.pmremVersion=t.pmremVersion,n.set(t,i),i.texture;if(i!==void 0)return i.texture;{let s=t.image;return a&&s&&s.height>0||o&&s&&c(s)?(r===null&&(r=new To(e)),i=a?r.fromEquirectangular(t):r.fromCubemap(t),i.texture.pmremVersion=t.pmremVersion,n.set(t,i),t.addEventListener(`dispose`,u),i.texture):null}}}return t}function s(e,t){return t===303?e.mapping=301:t===304&&(e.mapping=302),e}function c(e){let t=0;for(let n=0;n<6;n++)e[n]!==void 0&&t++;return t===6}function l(e){let n=e.target;n.removeEventListener(`dispose`,l);let r=t.get(n);r!==void 0&&(t.delete(n),r.dispose())}function u(e){let t=e.target;t.removeEventListener(`dispose`,u);let r=n.get(t);r!==void 0&&(n.delete(t),r.dispose())}function d(){t=new WeakMap,n=new WeakMap,r!==null&&(r.dispose(),r=null)}return{get:i,dispose:d}}function Io(e){let t={};function n(n){if(t[n]!==void 0)return t[n];let r=e.getExtension(n);return t[n]=r,r}return{has:function(e){return n(e)!==null},init:function(){n(`EXT_color_buffer_float`),n(`WEBGL_clip_cull_distance`),n(`OES_texture_float_linear`),n(`EXT_color_buffer_half_float`),n(`WEBGL_multisampled_render_to_texture`),n(`WEBGL_render_shared_exponent`)},get:function(e){let t=n(e);return t===null&&$e(`WebGLRenderer: `+e+` extension not supported.`),t}}}function Lo(e,t,n,r){let i={},a=new WeakMap;function o(e){let s=e.target;s.index!==null&&t.remove(s.index);for(let e in s.attributes)t.remove(s.attributes[e]);s.removeEventListener(`dispose`,o),delete i[s.id];let c=a.get(s);c&&(t.remove(c),a.delete(s)),r.releaseStatesOfGeometry(s),s.isInstancedBufferGeometry===!0&&delete s._maxInstanceCount,n.memory.geometries--}function s(e,t){return i[t.id]===!0?t:(t.addEventListener(`dispose`,o),i[t.id]=!0,n.memory.geometries++,t)}function c(n){let r=n.attributes;for(let n in r)t.update(r[n],e.ARRAY_BUFFER)}function l(e){let n=[],r=e.index,i=e.attributes.position,o=0;if(i===void 0)return;if(r!==null){let e=r.array;o=r.version;for(let t=0,r=e.length;t<r;t+=3){let r=e[t+0],i=e[t+1],a=e[t+2];n.push(r,i,i,a,a,r)}}else{let e=i.array;o=i.version;for(let t=0,r=e.length/3-1;t<r;t+=3){let e=t+0,r=t+1,i=t+2;n.push(e,r,r,i,i,e)}}let s=new(i.count>=65535?er:$n)(n,1);s.version=o;let c=a.get(e);c&&t.remove(c),a.set(e,s)}function u(e){let t=a.get(e);if(t){let n=e.index;n!==null&&t.version<n.version&&l(e)}else l(e);return a.get(e)}return{get:s,update:c,getWireframeAttribute:u}}function Ro(e,t,n){let r;function i(e){r=e}let a,o;function s(e){a=e.type,o=e.bytesPerElement}function c(t,i){e.drawElements(r,i,a,t*o),n.update(i,r,1)}function l(t,i,s){s!==0&&(e.drawElementsInstanced(r,i,a,t*o,s),n.update(i,r,s))}function u(e,i,o){if(o===0)return;t.get(`WEBGL_multi_draw`).multiDrawElementsWEBGL(r,i,0,a,e,0,o);let s=0;for(let e=0;e<o;e++)s+=i[e];n.update(s,r,1)}this.setMode=i,this.setIndex=s,this.render=c,this.renderInstances=l,this.renderMultiDraw=u}function zo(e){let t={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function r(t,r,i){switch(n.calls++,r){case e.TRIANGLES:n.triangles+=t/3*i;break;case e.LINES:n.lines+=t/2*i;break;case e.LINE_STRIP:n.lines+=i*(t-1);break;case e.LINE_LOOP:n.lines+=i*t;break;case e.POINTS:n.points+=i*t;break;default:R(`WebGLInfo: Unknown draw mode:`,r);break}}function i(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:t,render:n,programs:null,autoReset:!0,reset:i,update:r}}function Bo(e,t,n){let r=new WeakMap,i=new At;function a(a,o,s){let c=a.morphTargetInfluences,l=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=l===void 0?0:l.length,d=r.get(o);if(d===void 0||d.count!==u){d!==void 0&&d.texture.dispose();let e=o.morphAttributes.position!==void 0,n=o.morphAttributes.normal!==void 0,a=o.morphAttributes.color!==void 0,s=o.morphAttributes.position||[],c=o.morphAttributes.normal||[],l=o.morphAttributes.color||[],f=0;e===!0&&(f=1),n===!0&&(f=2),a===!0&&(f=3);let p=o.attributes.position.count*f,m=1;p>t.maxTextureSize&&(m=Math.ceil(p/t.maxTextureSize),p=t.maxTextureSize);let g=new Float32Array(p*m*4*u),_=new Nt(g,p,m,u);_.type=h,_.needsUpdate=!0;let v=f*4;for(let t=0;t<u;t++){let r=s[t],o=c[t],u=l[t],d=p*m*4*t;for(let t=0;t<r.count;t++){let s=t*v;e===!0&&(i.fromBufferAttribute(r,t),g[d+s+0]=i.x,g[d+s+1]=i.y,g[d+s+2]=i.z,g[d+s+3]=0),n===!0&&(i.fromBufferAttribute(o,t),g[d+s+4]=i.x,g[d+s+5]=i.y,g[d+s+6]=i.z,g[d+s+7]=0),a===!0&&(i.fromBufferAttribute(u,t),g[d+s+8]=i.x,g[d+s+9]=i.y,g[d+s+10]=i.z,g[d+s+11]=u.itemSize===4?i.w:1)}}d={count:u,texture:_,size:new z(p,m)},r.set(o,d);function y(){_.dispose(),r.delete(o),o.removeEventListener(`dispose`,y)}o.addEventListener(`dispose`,y)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)s.getUniforms().setValue(e,`morphTexture`,a.morphTexture,n);else{let t=0;for(let e=0;e<c.length;e++)t+=c[e];let n=o.morphTargetsRelative?1:1-t;s.getUniforms().setValue(e,`morphTargetBaseInfluence`,n),s.getUniforms().setValue(e,`morphTargetInfluences`,c)}s.getUniforms().setValue(e,`morphTargetsTexture`,d.texture,n),s.getUniforms().setValue(e,`morphTargetsTextureSize`,d.size)}return{update:a}}function Vo(e,t,n,r,i){let a=new WeakMap;function o(r){let o=i.render.frame,s=r.geometry,l=t.get(r,s);if(a.get(l)!==o&&(t.update(l),a.set(l,o)),r.isInstancedMesh&&(r.hasEventListener(`dispose`,c)===!1&&r.addEventListener(`dispose`,c),a.get(r)!==o&&(n.update(r.instanceMatrix,e.ARRAY_BUFFER),r.instanceColor!==null&&n.update(r.instanceColor,e.ARRAY_BUFFER),a.set(r,o))),r.isSkinnedMesh){let e=r.skeleton;a.get(e)!==o&&(e.update(),a.set(e,o))}return l}function s(){a=new WeakMap}function c(e){let t=e.target;t.removeEventListener(`dispose`,c),r.releaseStatesOfObject(t),n.remove(t.instanceMatrix),t.instanceColor!==null&&n.remove(t.instanceColor)}return{update:o,dispose:s}}var Ho={1:`LINEAR_TONE_MAPPING`,2:`REINHARD_TONE_MAPPING`,3:`CINEON_TONE_MAPPING`,4:`ACES_FILMIC_TONE_MAPPING`,6:`AGX_TONE_MAPPING`,7:`NEUTRAL_TONE_MAPPING`,5:`CUSTOM_TONE_MAPPING`};function Uo(e,t,n,r,i,a){let o=new Mt(t,n,{type:e,depthBuffer:i,stencilBuffer:a,samples:r?4:0,depthTexture:i?new Fi(t,n):void 0}),s=new Mt(t,n,{type:g,depthBuffer:!1,stencilBuffer:!1}),c=new pr;c.setAttribute(`position`,new tr([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute(`uv`,new tr([0,2,0,0,2,0],2));let l=new ta({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),u=new ti(c,l),d=new Pa(-1,1,1,-1,0,1),f=null,p=null,m=!1,h,_=null,v=[],y=!1;this.setSize=function(e,t){o.setSize(e,t),s.setSize(e,t);for(let n=0;n<v.length;n++){let r=v[n];r.setSize&&r.setSize(e,t)}},this.setEffects=function(e){v=e,y=v.length>0&&v[0].isRenderPass===!0;let t=o.width,n=o.height;for(let e=0;e<v.length;e++){let r=v[e];r.setSize&&r.setSize(t,n)}},this.begin=function(e,t){if(m||e.toneMapping===0&&v.length===0)return!1;if(_=t,t!==null){let e=t.width,n=t.height;(o.width!==e||o.height!==n)&&this.setSize(e,n)}return y===!1&&e.setRenderTarget(o),h=e.toneMapping,e.toneMapping=0,!0},this.hasRenderPass=function(){return y},this.end=function(e,t){e.toneMapping=h,m=!0;let n=o,r=s;for(let i=0;i<v.length;i++){let a=v[i];if(a.enabled!==!1&&(a.render(e,r,n,t),a.needsSwap!==!1)){let e=n;n=r,r=e}}if(f!==e.outputColorSpace||p!==e.toneMapping){f=e.outputColorSpace,p=e.toneMapping,l.defines={},yt.getTransfer(f)===`srgb`&&(l.defines.SRGB_TRANSFER=``);let t=Ho[p];t&&(l.defines[t]=``),l.needsUpdate=!0}l.uniforms.tDiffuse.value=n.texture,e.setRenderTarget(_),e.render(u,d),_=null,m=!1},this.isCompositing=function(){return m},this.dispose=function(){o.depthTexture&&o.depthTexture.dispose(),o.dispose(),s.dispose(),c.dispose(),l.dispose()}}var Wo=new kt,Go=new Fi(1,1),Ko=new Nt,qo=new Pt,Jo=new Ni,Yo=[],Xo=[],Zo=new Float32Array(16),Qo=new Float32Array(9),$o=new Float32Array(4);function es(e,t,n){let r=e[0];if(r<=0||r>0)return e;let i=t*n,a=Yo[i];if(a===void 0&&(a=new Float32Array(i),Yo[i]=a),t!==0){r.toArray(a,0);for(let r=1,i=0;r!==t;++r)i+=n,e[r].toArray(a,i)}return a}function ts(e,t){if(e.length!==t.length)return!1;for(let n=0,r=e.length;n<r;n++)if(e[n]!==t[n])return!1;return!0}function ns(e,t){for(let n=0,r=t.length;n<r;n++)e[n]=t[n]}function rs(e,t){let n=Xo[t];n===void 0&&(n=new Int32Array(t),Xo[t]=n);for(let r=0;r!==t;++r)n[r]=e.allocateTextureUnit();return n}function is(e,t){let n=this.cache;n[0]!==t&&(e.uniform1f(this.addr,t),n[0]=t)}function as(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2f(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(ts(n,t))return;e.uniform2fv(this.addr,t),ns(n,t)}}function os(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3f(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else if(t.r!==void 0)(n[0]!==t.r||n[1]!==t.g||n[2]!==t.b)&&(e.uniform3f(this.addr,t.r,t.g,t.b),n[0]=t.r,n[1]=t.g,n[2]=t.b);else{if(ts(n,t))return;e.uniform3fv(this.addr,t),ns(n,t)}}function ss(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4f(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(ts(n,t))return;e.uniform4fv(this.addr,t),ns(n,t)}}function cs(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(ts(n,t))return;e.uniformMatrix2fv(this.addr,!1,t),ns(n,t)}else{if(ts(n,r))return;$o.set(r),e.uniformMatrix2fv(this.addr,!1,$o),ns(n,r)}}function ls(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(ts(n,t))return;e.uniformMatrix3fv(this.addr,!1,t),ns(n,t)}else{if(ts(n,r))return;Qo.set(r),e.uniformMatrix3fv(this.addr,!1,Qo),ns(n,r)}}function us(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(ts(n,t))return;e.uniformMatrix4fv(this.addr,!1,t),ns(n,t)}else{if(ts(n,r))return;Zo.set(r),e.uniformMatrix4fv(this.addr,!1,Zo),ns(n,r)}}function ds(e,t){let n=this.cache;n[0]!==t&&(e.uniform1i(this.addr,t),n[0]=t)}function fs(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2i(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(ts(n,t))return;e.uniform2iv(this.addr,t),ns(n,t)}}function ps(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3i(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(ts(n,t))return;e.uniform3iv(this.addr,t),ns(n,t)}}function ms(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4i(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(ts(n,t))return;e.uniform4iv(this.addr,t),ns(n,t)}}function hs(e,t){let n=this.cache;n[0]!==t&&(e.uniform1ui(this.addr,t),n[0]=t)}function gs(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2ui(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(ts(n,t))return;e.uniform2uiv(this.addr,t),ns(n,t)}}function _s(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3ui(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(ts(n,t))return;e.uniform3uiv(this.addr,t),ns(n,t)}}function vs(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4ui(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(ts(n,t))return;e.uniform4uiv(this.addr,t),ns(n,t)}}function ys(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i);let a;this.type===e.SAMPLER_2D_SHADOW?(Go.compareFunction=n.isReversedDepthBuffer()?518:515,a=Go):a=Wo,n.setTexture2D(t||a,i)}function bs(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture3D(t||qo,i)}function xs(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTextureCube(t||Jo,i)}function Ss(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture2DArray(t||Ko,i)}function Cs(e){switch(e){case 5126:return is;case 35664:return as;case 35665:return os;case 35666:return ss;case 35674:return cs;case 35675:return ls;case 35676:return us;case 5124:case 35670:return ds;case 35667:case 35671:return fs;case 35668:case 35672:return ps;case 35669:case 35673:return ms;case 5125:return hs;case 36294:return gs;case 36295:return _s;case 36296:return vs;case 35678:case 36198:case 36298:case 36306:case 35682:return ys;case 35679:case 36299:case 36307:return bs;case 35680:case 36300:case 36308:case 36293:return xs;case 36289:case 36303:case 36311:case 36292:return Ss}}function ws(e,t){e.uniform1fv(this.addr,t)}function Ts(e,t){let n=es(t,this.size,2);e.uniform2fv(this.addr,n)}function Es(e,t){let n=es(t,this.size,3);e.uniform3fv(this.addr,n)}function Ds(e,t){let n=es(t,this.size,4);e.uniform4fv(this.addr,n)}function Os(e,t){let n=es(t,this.size,4);e.uniformMatrix2fv(this.addr,!1,n)}function ks(e,t){let n=es(t,this.size,9);e.uniformMatrix3fv(this.addr,!1,n)}function As(e,t){let n=es(t,this.size,16);e.uniformMatrix4fv(this.addr,!1,n)}function js(e,t){e.uniform1iv(this.addr,t)}function Ms(e,t){e.uniform2iv(this.addr,t)}function Ns(e,t){e.uniform3iv(this.addr,t)}function Ps(e,t){e.uniform4iv(this.addr,t)}function Fs(e,t){e.uniform1uiv(this.addr,t)}function Is(e,t){e.uniform2uiv(this.addr,t)}function Ls(e,t){e.uniform3uiv(this.addr,t)}function Rs(e,t){e.uniform4uiv(this.addr,t)}function zs(e,t,n){let r=this.cache,i=t.length,a=rs(n,i);ts(r,a)||(e.uniform1iv(this.addr,a),ns(r,a));let o;o=this.type===e.SAMPLER_2D_SHADOW?Go:Wo;for(let e=0;e!==i;++e)n.setTexture2D(t[e]||o,a[e])}function Bs(e,t,n){let r=this.cache,i=t.length,a=rs(n,i);ts(r,a)||(e.uniform1iv(this.addr,a),ns(r,a));for(let e=0;e!==i;++e)n.setTexture3D(t[e]||qo,a[e])}function Vs(e,t,n){let r=this.cache,i=t.length,a=rs(n,i);ts(r,a)||(e.uniform1iv(this.addr,a),ns(r,a));for(let e=0;e!==i;++e)n.setTextureCube(t[e]||Jo,a[e])}function Hs(e,t,n){let r=this.cache,i=t.length,a=rs(n,i);ts(r,a)||(e.uniform1iv(this.addr,a),ns(r,a));for(let e=0;e!==i;++e)n.setTexture2DArray(t[e]||Ko,a[e])}function Us(e){switch(e){case 5126:return ws;case 35664:return Ts;case 35665:return Es;case 35666:return Ds;case 35674:return Os;case 35675:return ks;case 35676:return As;case 5124:case 35670:return js;case 35667:case 35671:return Ms;case 35668:case 35672:return Ns;case 35669:case 35673:return Ps;case 5125:return Fs;case 36294:return Is;case 36295:return Ls;case 36296:return Rs;case 35678:case 36198:case 36298:case 36306:case 35682:return zs;case 35679:case 36299:case 36307:return Bs;case 35680:case 36300:case 36308:case 36293:return Vs;case 36289:case 36303:case 36311:case 36292:return Hs}}var Ws=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Cs(t.type)}},Gs=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Us(t.type)}},Ks=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let r=this.seq;for(let i=0,a=r.length;i!==a;++i){let a=r[i];a.setValue(e,t[a.id],n)}}},qs=/(\w+)(\])?(\[|\.)?/g;function Js(e,t){e.seq.push(t),e.map[t.id]=t}function Ys(e,t,n){let r=e.name,i=r.length;for(qs.lastIndex=0;;){let a=qs.exec(r),o=qs.lastIndex,s=a[1],c=a[2]===`]`,l=a[3];if(c&&(s|=0),l===void 0||l===`[`&&o+2===i){Js(n,l===void 0?new Ws(s,e,t):new Gs(s,e,t));break}else{let e=n.map[s];e===void 0&&(e=new Ks(s),Js(n,e)),n=e}}}var Xs=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){let n=e.getActiveUniform(t,r);Ys(n,e.getUniformLocation(t,n.name),this)}let r=[],i=[];for(let t of this.seq)t.type===e.SAMPLER_2D_SHADOW||t.type===e.SAMPLER_CUBE_SHADOW||t.type===e.SAMPLER_2D_ARRAY_SHADOW?r.push(t):i.push(t);r.length>0&&(this.seq=r.concat(i))}setValue(e,t,n,r){let i=this.map[t];i!==void 0&&i.setValue(e,n,r)}setOptional(e,t,n){let r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let i=0,a=t.length;i!==a;++i){let a=t[i],o=n[a.id];o.needsUpdate!==!1&&a.setValue(e,o.value,r)}}static seqWithValue(e,t){let n=[];for(let r=0,i=e.length;r!==i;++r){let i=e[r];i.id in t&&n.push(i)}return n}};function Zs(e,t,n){let r=e.createShader(t);return e.shaderSource(r,n),e.compileShader(r),r}var Qs=37297,$s=0;function ec(e,t){let n=e.split(`
`),r=[],i=Math.max(t-6,0),a=Math.min(t+6,n.length);for(let e=i;e<a;e++){let i=e+1;r.push(`${i===t?`>`:` `} ${i}: ${n[e]}`)}return r.join(`
`)}var tc=new V;function nc(e){yt._getMatrix(tc,yt.workingColorSpace,e);let t=`mat3( ${tc.elements.map(e=>e.toFixed(4))} )`;switch(yt.getTransfer(e)){case Ve:return[t,`LinearTransferOETF`];case He:return[t,`sRGBTransferOETF`];default:return L(`WebGLProgram: Unsupported color space: `,e),[t,`LinearTransferOETF`]}}function rc(e,t,n){let r=e.getShaderParameter(t,e.COMPILE_STATUS),i=(e.getShaderInfoLog(t)||``).trim();if(r&&i===``)return``;let a=/ERROR: 0:(\d+)/.exec(i);if(a){let r=parseInt(a[1]);return n.toUpperCase()+`

`+i+`

`+ec(e.getShaderSource(t),r)}else return i}function ic(e,t){let n=nc(t);return[`vec4 ${e}( vec4 value ) {`,`	return ${n[1]}( vec4( value.rgb * ${n[0]}, value.a ) );`,`}`].join(`
`)}var ac={1:`Linear`,2:`Reinhard`,3:`Cineon`,4:`ACESFilmic`,6:`AgX`,7:`Neutral`,5:`Custom`};function oc(e,t){let n=ac[t];return n===void 0?(L(`WebGLProgram: Unsupported toneMapping:`,t),`vec3 `+e+`( vec3 color ) { return LinearToneMapping( color ); }`):`vec3 `+e+`( vec3 color ) { return `+n+`ToneMapping( color ); }`}var sc=new B;function cc(){return yt.getLuminanceCoefficients(sc),[`float luminance( const in vec3 rgb ) {`,`	const vec3 weights = vec3( ${sc.x.toFixed(4)}, ${sc.y.toFixed(4)}, ${sc.z.toFixed(4)} );`,`	return dot( weights, rgb );`,`}`].join(`
`)}function lc(e){return[e.extensionClipCullDistance?`#extension GL_ANGLE_clip_cull_distance : require`:``,e.extensionMultiDraw?`#extension GL_ANGLE_multi_draw : require`:``].filter(fc).join(`
`)}function uc(e){let t=[];for(let n in e){let r=e[n];r!==!1&&t.push(`#define `+n+` `+r)}return t.join(`
`)}function dc(e,t){let n={},r=e.getProgramParameter(t,e.ACTIVE_ATTRIBUTES);for(let i=0;i<r;i++){let r=e.getActiveAttrib(t,i),a=r.name,o=1;r.type===e.FLOAT_MAT2&&(o=2),r.type===e.FLOAT_MAT3&&(o=3),r.type===e.FLOAT_MAT4&&(o=4),n[a]={type:r.type,location:e.getAttribLocation(t,a),locationSize:o}}return n}function fc(e){return e!==``}function pc(e,t){let n=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return e.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function mc(e,t){return e.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var hc=/^[ \t]*#include +<([\w\d./]+)>/gm;function gc(e){return e.replace(hc,vc)}var _c=new Map;function vc(e,t){let n=U[t];if(n===void 0){let e=_c.get(t);if(e!==void 0)n=U[e],L(`WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.`,t,e);else throw Error(`THREE.WebGLProgram: Can not resolve #include <`+t+`>`)}return gc(n)}var yc=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function bc(e){return e.replace(yc,xc)}function xc(e,t,n,r){let i=``;for(let e=parseInt(t);e<parseInt(n);e++)i+=r.replace(/\[\s*i\s*\]/g,`[ `+e+` ]`).replace(/UNROLLED_LOOP_INDEX/g,e);return i}function Sc(e){let t=`precision ${e.precision} float;
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
	`;return e.precision===`highp`?t+=`
#define HIGH_PRECISION`:e.precision===`mediump`?t+=`
#define MEDIUM_PRECISION`:e.precision===`lowp`&&(t+=`
#define LOW_PRECISION`),t}var Cc={1:`SHADOWMAP_TYPE_PCF`,3:`SHADOWMAP_TYPE_VSM`};function wc(e){return Cc[e.shadowMapType]||`SHADOWMAP_TYPE_BASIC`}var Tc={301:`ENVMAP_TYPE_CUBE`,302:`ENVMAP_TYPE_CUBE`,306:`ENVMAP_TYPE_CUBE_UV`};function Ec(e){return e.envMap===!1?`ENVMAP_TYPE_CUBE`:Tc[e.envMapMode]||`ENVMAP_TYPE_CUBE`}var Dc={302:`ENVMAP_MODE_REFRACTION`};function Oc(e){return e.envMap===!1?`ENVMAP_MODE_REFLECTION`:Dc[e.envMapMode]||`ENVMAP_MODE_REFLECTION`}var kc={0:`ENVMAP_BLENDING_MULTIPLY`,1:`ENVMAP_BLENDING_MIX`,2:`ENVMAP_BLENDING_ADD`};function Ac(e){return e.envMap===!1?`ENVMAP_BLENDING_NONE`:kc[e.combine]||`ENVMAP_BLENDING_NONE`}function jc(e){let t=e.envMapCubeUVHeight;if(t===null)return null;let n=Math.log2(t)-2,r=1/t;return{texelWidth:1/(3*Math.max(2**n,112)),texelHeight:r,maxMip:n}}function Mc(e,t,n,r){let i=e.getContext(),a=n.defines,o=n.vertexShader,s=n.fragmentShader,c=wc(n),l=Ec(n),u=Oc(n),d=Ac(n),f=jc(n),p=lc(n),m=uc(a),h=i.createProgram(),g,_,v=n.glslVersion?`#version `+n.glslVersion+`
`:``;n.isRawShaderMaterial?(g=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(fc).join(`
`),g.length>0&&(g+=`
`),_=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(fc).join(`
`),_.length>0&&(_+=`
`)):(g=[Sc(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.extensionClipCullDistance?`#define USE_CLIP_DISTANCE`:``,n.batching?`#define USE_BATCHING`:``,n.batchingColor?`#define USE_BATCHING_COLOR`:``,n.instancing?`#define USE_INSTANCING`:``,n.instancingColor?`#define USE_INSTANCING_COLOR`:``,n.instancingMorph?`#define USE_INSTANCING_MORPH`:``,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.map?`#define USE_MAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+u:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.displacementMap?`#define USE_DISPLACEMENTMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.mapUv?`#define MAP_UV `+n.mapUv:``,n.alphaMapUv?`#define ALPHAMAP_UV `+n.alphaMapUv:``,n.lightMapUv?`#define LIGHTMAP_UV `+n.lightMapUv:``,n.aoMapUv?`#define AOMAP_UV `+n.aoMapUv:``,n.emissiveMapUv?`#define EMISSIVEMAP_UV `+n.emissiveMapUv:``,n.bumpMapUv?`#define BUMPMAP_UV `+n.bumpMapUv:``,n.normalMapUv?`#define NORMALMAP_UV `+n.normalMapUv:``,n.displacementMapUv?`#define DISPLACEMENTMAP_UV `+n.displacementMapUv:``,n.metalnessMapUv?`#define METALNESSMAP_UV `+n.metalnessMapUv:``,n.roughnessMapUv?`#define ROUGHNESSMAP_UV `+n.roughnessMapUv:``,n.anisotropyMapUv?`#define ANISOTROPYMAP_UV `+n.anisotropyMapUv:``,n.clearcoatMapUv?`#define CLEARCOATMAP_UV `+n.clearcoatMapUv:``,n.clearcoatNormalMapUv?`#define CLEARCOAT_NORMALMAP_UV `+n.clearcoatNormalMapUv:``,n.clearcoatRoughnessMapUv?`#define CLEARCOAT_ROUGHNESSMAP_UV `+n.clearcoatRoughnessMapUv:``,n.iridescenceMapUv?`#define IRIDESCENCEMAP_UV `+n.iridescenceMapUv:``,n.iridescenceThicknessMapUv?`#define IRIDESCENCE_THICKNESSMAP_UV `+n.iridescenceThicknessMapUv:``,n.sheenColorMapUv?`#define SHEEN_COLORMAP_UV `+n.sheenColorMapUv:``,n.sheenRoughnessMapUv?`#define SHEEN_ROUGHNESSMAP_UV `+n.sheenRoughnessMapUv:``,n.specularMapUv?`#define SPECULARMAP_UV `+n.specularMapUv:``,n.specularColorMapUv?`#define SPECULAR_COLORMAP_UV `+n.specularColorMapUv:``,n.specularIntensityMapUv?`#define SPECULAR_INTENSITYMAP_UV `+n.specularIntensityMapUv:``,n.transmissionMapUv?`#define TRANSMISSIONMAP_UV `+n.transmissionMapUv:``,n.thicknessMapUv?`#define THICKNESSMAP_UV `+n.thicknessMapUv:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexNormals?`#define HAS_NORMAL`:``,n.vertexColors?`#define USE_COLOR`:``,n.vertexAlphas?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.flatShading?`#define FLAT_SHADED`:``,n.skinning?`#define USE_SKINNING`:``,n.morphTargets?`#define USE_MORPHTARGETS`:``,n.morphNormals&&n.flatShading===!1?`#define USE_MORPHNORMALS`:``,n.morphColors?`#define USE_MORPHCOLORS`:``,n.morphTargetsCount>0?`#define MORPHTARGETS_TEXTURE_STRIDE `+n.morphTextureStride:``,n.morphTargetsCount>0?`#define MORPHTARGETS_COUNT `+n.morphTargetsCount:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.sizeAttenuation?`#define USE_SIZEATTENUATION`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 modelMatrix;`,`uniform mat4 modelViewMatrix;`,`uniform mat4 projectionMatrix;`,`uniform mat4 viewMatrix;`,`uniform mat3 normalMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,`#ifdef USE_INSTANCING`,`	attribute mat4 instanceMatrix;`,`#endif`,`#ifdef USE_INSTANCING_COLOR`,`	attribute vec3 instanceColor;`,`#endif`,`#ifdef USE_INSTANCING_MORPH`,`	uniform sampler2D morphTexture;`,`#endif`,`attribute vec3 position;`,`attribute vec3 normal;`,`attribute vec2 uv;`,`#ifdef USE_UV1`,`	attribute vec2 uv1;`,`#endif`,`#ifdef USE_UV2`,`	attribute vec2 uv2;`,`#endif`,`#ifdef USE_UV3`,`	attribute vec2 uv3;`,`#endif`,`#ifdef USE_TANGENT`,`	attribute vec4 tangent;`,`#endif`,`#if defined( USE_COLOR_ALPHA )`,`	attribute vec4 color;`,`#elif defined( USE_COLOR )`,`	attribute vec3 color;`,`#endif`,`#ifdef USE_SKINNING`,`	attribute vec4 skinIndex;`,`	attribute vec4 skinWeight;`,`#endif`,`
`].filter(fc).join(`
`),_=[Sc(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.alphaToCoverage?`#define ALPHA_TO_COVERAGE`:``,n.map?`#define USE_MAP`:``,n.matcap?`#define USE_MATCAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+l:``,n.envMap?`#define `+u:``,n.envMap?`#define `+d:``,f?`#define CUBEUV_TEXEL_WIDTH `+f.texelWidth:``,f?`#define CUBEUV_TEXEL_HEIGHT `+f.texelHeight:``,f?`#define CUBEUV_MAX_MIP `+f.maxMip+`.0`:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.packedNormalMap?`#define USE_PACKED_NORMALMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoat?`#define USE_CLEARCOAT`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.dispersion?`#define USE_DISPERSION`:``,n.iridescence?`#define USE_IRIDESCENCE`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaTest?`#define USE_ALPHATEST`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.sheen?`#define USE_SHEEN`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexColors||n.instancingColor?`#define USE_COLOR`:``,n.vertexAlphas||n.batchingColor?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.gradientMap?`#define USE_GRADIENTMAP`:``,n.flatShading?`#define FLAT_SHADED`:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.premultipliedAlpha?`#define PREMULTIPLIED_ALPHA`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.numLightProbeGrids>0?`#define USE_LIGHT_PROBES_GRID`:``,n.decodeVideoTexture?`#define DECODE_VIDEO_TEXTURE`:``,n.decodeVideoTextureEmissive?`#define DECODE_VIDEO_TEXTURE_EMISSIVE`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 viewMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,n.toneMapping===0?``:`#define TONE_MAPPING`,n.toneMapping===0?``:U.tonemapping_pars_fragment,n.toneMapping===0?``:oc(`toneMapping`,n.toneMapping),n.dithering?`#define DITHERING`:``,n.opaque?`#define OPAQUE`:``,U.colorspace_pars_fragment,ic(`linearToOutputTexel`,n.outputColorSpace),cc(),n.useDepthPacking?`#define DEPTH_PACKING `+n.depthPacking:``,`
`].filter(fc).join(`
`)),o=gc(o),o=pc(o,n),o=mc(o,n),s=gc(s),s=pc(s,n),s=mc(s,n),o=bc(o),s=bc(s),n.isRawShaderMaterial!==!0&&(v=`#version 300 es
`,g=[p,`#define attribute in`,`#define varying out`,`#define texture2D texture`].join(`
`)+`
`+g,_=[`#define varying in`,n.glslVersion===`300 es`?``:`layout(location = 0) out highp vec4 pc_fragColor;`,n.glslVersion===`300 es`?``:`#define gl_FragColor pc_fragColor`,`#define gl_FragDepthEXT gl_FragDepth`,`#define texture2D texture`,`#define textureCube texture`,`#define texture2DProj textureProj`,`#define texture2DLodEXT textureLod`,`#define texture2DProjLodEXT textureProjLod`,`#define textureCubeLodEXT textureLod`,`#define texture2DGradEXT textureGrad`,`#define texture2DProjGradEXT textureProjGrad`,`#define textureCubeGradEXT textureGrad`].join(`
`)+`
`+_);let y=v+g+o,b=v+_+s,x=Zs(i,i.VERTEX_SHADER,y),S=Zs(i,i.FRAGMENT_SHADER,b);i.attachShader(h,x),i.attachShader(h,S),n.index0AttributeName===void 0?n.hasPositionAttribute===!0&&i.bindAttribLocation(h,0,`position`):i.bindAttribLocation(h,0,n.index0AttributeName),i.linkProgram(h);function C(t){if(e.debug.checkShaderErrors){let n=i.getProgramInfoLog(h)||``,r=i.getShaderInfoLog(x)||``,a=i.getShaderInfoLog(S)||``,o=n.trim(),s=r.trim(),c=a.trim(),l=!0,u=!0;if(i.getProgramParameter(h,i.LINK_STATUS)===!1)if(l=!1,typeof e.debug.onShaderError==`function`)e.debug.onShaderError(i,h,x,S);else{let e=rc(i,x,`vertex`),n=rc(i,S,`fragment`);R(`WebGLProgram: Shader Error `+i.getError()+` - VALIDATE_STATUS `+i.getProgramParameter(h,i.VALIDATE_STATUS)+`

Material Name: `+t.name+`
Material Type: `+t.type+`

Program Info Log: `+o+`
`+e+`
`+n)}else o===``?(s===``||c===``)&&(u=!1):L(`WebGLProgram: Program Info Log:`,o);u&&(t.diagnostics={runnable:l,programLog:o,vertexShader:{log:s,prefix:g},fragmentShader:{log:c,prefix:_}})}i.deleteShader(x),i.deleteShader(S),w=new Xs(i,h),T=dc(i,h)}let w;this.getUniforms=function(){return w===void 0&&C(this),w};let T;this.getAttributes=function(){return T===void 0&&C(this),T};let E=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return E===!1&&(E=i.getProgramParameter(h,Qs)),E},this.destroy=function(){r.releaseStatesOfProgram(this),i.deleteProgram(h),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=$s++,this.cacheKey=t,this.usedTimes=1,this.program=h,this.vertexShader=x,this.fragmentShader=S,this}var Nc=0,Pc=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){let r=this._getShaderCacheForMaterial(e);return r.has(t)===!1&&(r.add(t),t.usedTimes++),r.has(n)===!1&&(r.add(n),n.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let e of t)e.usedTimes--,e.usedTimes===0&&this.shaderCache.delete(e.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new Fc(e),t.set(e,n)),n}},Fc=class{constructor(e){this.id=Nc++,this.code=e,this.usedTimes=0}};function Ic(e){return e===1030||e===37490||e===36285}function Lc(e,t,n,r,i,a){let o=new Kt,s=new Pc,c=new Set,l=[],u=new Map,d=r.logarithmicDepthBuffer,f=r.precision,p={MeshDepthMaterial:`depth`,MeshDistanceMaterial:`distance`,MeshNormalMaterial:`normal`,MeshBasicMaterial:`basic`,MeshLambertMaterial:`lambert`,MeshPhongMaterial:`phong`,MeshToonMaterial:`toon`,MeshStandardMaterial:`physical`,MeshPhysicalMaterial:`physical`,MeshMatcapMaterial:`matcap`,LineBasicMaterial:`basic`,LineDashedMaterial:`dashed`,PointsMaterial:`points`,ShadowMaterial:`shadow`,SpriteMaterial:`sprite`};function m(e){return c.add(e),e===0?`uv`:`uv${e}`}function h(i,o,l,u,h,g){let _=u.fog,v=h.geometry,y=i.isMeshStandardMaterial||i.isMeshLambertMaterial||i.isMeshPhongMaterial?u.environment:null,b=i.isMeshStandardMaterial||i.isMeshLambertMaterial&&!i.envMap||i.isMeshPhongMaterial&&!i.envMap,x=t.get(i.envMap||y,b),S=x&&x.mapping===306?x.image.height:null,C=p[i.type];i.precision!==null&&(f=r.getMaxPrecision(i.precision),f!==i.precision&&L(`WebGLProgram.getParameters:`,i.precision,`not supported, using`,f,`instead.`));let w=v.morphAttributes.position||v.morphAttributes.normal||v.morphAttributes.color,T=w===void 0?0:w.length,E=0;v.morphAttributes.position!==void 0&&(E=1),v.morphAttributes.normal!==void 0&&(E=2),v.morphAttributes.color!==void 0&&(E=3);let D,ee,O,k;if(C){let e=io[C];D=e.vertexShader,ee=e.fragmentShader}else{D=i.vertexShader,ee=i.fragmentShader;let e=s.getVertexShaderStage(i),t=s.getFragmentShaderStage(i);s.update(i,e,t),O=e.id,k=t.id}let te=e.getRenderTarget(),A=e.state.buffers.depth.getReversed(),j=h.isInstancedMesh===!0,ne=h.isBatchedMesh===!0,re=!!i.map,M=!!i.matcap,ie=!!x,ae=!!i.aoMap,oe=!!i.lightMap,se=!!i.bumpMap&&i.wireframe===!1,ce=!!i.normalMap,le=!!i.displacementMap,ue=!!i.emissiveMap,N=!!i.metalnessMap,de=!!i.roughnessMap,fe=i.anisotropy>0,pe=i.clearcoat>0,me=i.dispersion>0,he=i.iridescence>0,ge=i.sheen>0,_e=i.transmission>0,ve=fe&&!!i.anisotropyMap,ye=pe&&!!i.clearcoatMap,be=pe&&!!i.clearcoatNormalMap,xe=pe&&!!i.clearcoatRoughnessMap,Se=he&&!!i.iridescenceMap,Ce=he&&!!i.iridescenceThicknessMap,we=ge&&!!i.sheenColorMap,Te=ge&&!!i.sheenRoughnessMap,Ee=!!i.specularMap,De=!!i.specularColorMap,Oe=!!i.specularIntensityMap,ke=_e&&!!i.transmissionMap,Ae=_e&&!!i.thicknessMap,je=!!i.gradientMap,Me=!!i.alphaMap,Ne=i.alphaTest>0,Pe=!!i.alphaHash,P=!!i.extensions,Fe=0;i.toneMapped&&(te===null||te.isXRRenderTarget===!0)&&(Fe=e.toneMapping);let Ie={shaderID:C,shaderType:i.type,shaderName:i.name,vertexShader:D,fragmentShader:ee,defines:i.defines,customVertexShaderID:O,customFragmentShaderID:k,isRawShaderMaterial:i.isRawShaderMaterial===!0,glslVersion:i.glslVersion,precision:f,batching:ne,batchingColor:ne&&h._colorsTexture!==null,instancing:j,instancingColor:j&&h.instanceColor!==null,instancingMorph:j&&h.morphTexture!==null,outputColorSpace:te===null?e.outputColorSpace:te.isXRRenderTarget===!0?te.texture.colorSpace:yt.workingColorSpace,alphaToCoverage:!!i.alphaToCoverage,map:re,matcap:M,envMap:ie,envMapMode:ie&&x.mapping,envMapCubeUVHeight:S,aoMap:ae,lightMap:oe,bumpMap:se,normalMap:ce,displacementMap:le,emissiveMap:ue,normalMapObjectSpace:ce&&i.normalMapType===1,normalMapTangentSpace:ce&&i.normalMapType===0,packedNormalMap:ce&&i.normalMapType===0&&Ic(i.normalMap.format),metalnessMap:N,roughnessMap:de,anisotropy:fe,anisotropyMap:ve,clearcoat:pe,clearcoatMap:ye,clearcoatNormalMap:be,clearcoatRoughnessMap:xe,dispersion:me,iridescence:he,iridescenceMap:Se,iridescenceThicknessMap:Ce,sheen:ge,sheenColorMap:we,sheenRoughnessMap:Te,specularMap:Ee,specularColorMap:De,specularIntensityMap:Oe,transmission:_e,transmissionMap:ke,thicknessMap:Ae,gradientMap:je,opaque:i.transparent===!1&&i.blending===1&&i.alphaToCoverage===!1,alphaMap:Me,alphaTest:Ne,alphaHash:Pe,combine:i.combine,mapUv:re&&m(i.map.channel),aoMapUv:ae&&m(i.aoMap.channel),lightMapUv:oe&&m(i.lightMap.channel),bumpMapUv:se&&m(i.bumpMap.channel),normalMapUv:ce&&m(i.normalMap.channel),displacementMapUv:le&&m(i.displacementMap.channel),emissiveMapUv:ue&&m(i.emissiveMap.channel),metalnessMapUv:N&&m(i.metalnessMap.channel),roughnessMapUv:de&&m(i.roughnessMap.channel),anisotropyMapUv:ve&&m(i.anisotropyMap.channel),clearcoatMapUv:ye&&m(i.clearcoatMap.channel),clearcoatNormalMapUv:be&&m(i.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:xe&&m(i.clearcoatRoughnessMap.channel),iridescenceMapUv:Se&&m(i.iridescenceMap.channel),iridescenceThicknessMapUv:Ce&&m(i.iridescenceThicknessMap.channel),sheenColorMapUv:we&&m(i.sheenColorMap.channel),sheenRoughnessMapUv:Te&&m(i.sheenRoughnessMap.channel),specularMapUv:Ee&&m(i.specularMap.channel),specularColorMapUv:De&&m(i.specularColorMap.channel),specularIntensityMapUv:Oe&&m(i.specularIntensityMap.channel),transmissionMapUv:ke&&m(i.transmissionMap.channel),thicknessMapUv:Ae&&m(i.thicknessMap.channel),alphaMapUv:Me&&m(i.alphaMap.channel),vertexTangents:!!v.attributes.tangent&&(ce||fe),vertexNormals:!!v.attributes.normal,vertexColors:i.vertexColors,vertexAlphas:i.vertexColors===!0&&!!v.attributes.color&&v.attributes.color.itemSize===4,pointsUvs:h.isPoints===!0&&!!v.attributes.uv&&(re||Me),fog:!!_,useFog:i.fog===!0,fogExp2:!!_&&_.isFogExp2,flatShading:i.wireframe===!1&&(i.flatShading===!0||v.attributes.normal===void 0&&ce===!1&&(i.isMeshLambertMaterial||i.isMeshPhongMaterial||i.isMeshStandardMaterial||i.isMeshPhysicalMaterial)),sizeAttenuation:i.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:A,skinning:h.isSkinnedMesh===!0,hasPositionAttribute:v.attributes.position!==void 0,morphTargets:v.morphAttributes.position!==void 0,morphNormals:v.morphAttributes.normal!==void 0,morphColors:v.morphAttributes.color!==void 0,morphTargetsCount:T,morphTextureStride:E,numDirLights:o.directional.length,numPointLights:o.point.length,numSpotLights:o.spot.length,numSpotLightMaps:o.spotLightMap.length,numRectAreaLights:o.rectArea.length,numHemiLights:o.hemi.length,numDirLightShadows:o.directionalShadowMap.length,numPointLightShadows:o.pointShadowMap.length,numSpotLightShadows:o.spotShadowMap.length,numSpotLightShadowsWithMaps:o.numSpotLightShadowsWithMaps,numLightProbes:o.numLightProbes,numLightProbeGrids:g.length,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:i.dithering,shadowMapEnabled:e.shadowMap.enabled&&l.length>0,shadowMapType:e.shadowMap.type,toneMapping:Fe,decodeVideoTexture:re&&i.map.isVideoTexture===!0&&yt.getTransfer(i.map.colorSpace)===`srgb`,decodeVideoTextureEmissive:ue&&i.emissiveMap.isVideoTexture===!0&&yt.getTransfer(i.emissiveMap.colorSpace)===`srgb`,premultipliedAlpha:i.premultipliedAlpha,doubleSided:i.side===2,flipSided:i.side===1,useDepthPacking:i.depthPacking>=0,depthPacking:i.depthPacking||0,index0AttributeName:i.index0AttributeName,extensionClipCullDistance:P&&i.extensions.clipCullDistance===!0&&n.has(`WEBGL_clip_cull_distance`),extensionMultiDraw:(P&&i.extensions.multiDraw===!0||ne)&&n.has(`WEBGL_multi_draw`),rendererExtensionParallelShaderCompile:n.has(`KHR_parallel_shader_compile`),customProgramCacheKey:i.customProgramCacheKey()};return Ie.vertexUv1s=c.has(1),Ie.vertexUv2s=c.has(2),Ie.vertexUv3s=c.has(3),c.clear(),Ie}function g(t){let n=[];if(t.shaderID?n.push(t.shaderID):(n.push(t.customVertexShaderID),n.push(t.customFragmentShaderID)),t.defines!==void 0)for(let e in t.defines)n.push(e),n.push(t.defines[e]);return t.isRawShaderMaterial===!1&&(_(n,t),v(n,t),n.push(e.outputColorSpace)),n.push(t.customProgramCacheKey),n.join()}function _(e,t){e.push(t.precision),e.push(t.outputColorSpace),e.push(t.envMapMode),e.push(t.envMapCubeUVHeight),e.push(t.mapUv),e.push(t.alphaMapUv),e.push(t.lightMapUv),e.push(t.aoMapUv),e.push(t.bumpMapUv),e.push(t.normalMapUv),e.push(t.displacementMapUv),e.push(t.emissiveMapUv),e.push(t.metalnessMapUv),e.push(t.roughnessMapUv),e.push(t.anisotropyMapUv),e.push(t.clearcoatMapUv),e.push(t.clearcoatNormalMapUv),e.push(t.clearcoatRoughnessMapUv),e.push(t.iridescenceMapUv),e.push(t.iridescenceThicknessMapUv),e.push(t.sheenColorMapUv),e.push(t.sheenRoughnessMapUv),e.push(t.specularMapUv),e.push(t.specularColorMapUv),e.push(t.specularIntensityMapUv),e.push(t.transmissionMapUv),e.push(t.thicknessMapUv),e.push(t.combine),e.push(t.fogExp2),e.push(t.sizeAttenuation),e.push(t.morphTargetsCount),e.push(t.morphAttributeCount),e.push(t.numDirLights),e.push(t.numPointLights),e.push(t.numSpotLights),e.push(t.numSpotLightMaps),e.push(t.numHemiLights),e.push(t.numRectAreaLights),e.push(t.numDirLightShadows),e.push(t.numPointLightShadows),e.push(t.numSpotLightShadows),e.push(t.numSpotLightShadowsWithMaps),e.push(t.numLightProbes),e.push(t.shadowMapType),e.push(t.toneMapping),e.push(t.numClippingPlanes),e.push(t.numClipIntersection),e.push(t.depthPacking)}function v(e,t){o.disableAll(),t.instancing&&o.enable(0),t.instancingColor&&o.enable(1),t.instancingMorph&&o.enable(2),t.matcap&&o.enable(3),t.envMap&&o.enable(4),t.normalMapObjectSpace&&o.enable(5),t.normalMapTangentSpace&&o.enable(6),t.clearcoat&&o.enable(7),t.iridescence&&o.enable(8),t.alphaTest&&o.enable(9),t.vertexColors&&o.enable(10),t.vertexAlphas&&o.enable(11),t.vertexUv1s&&o.enable(12),t.vertexUv2s&&o.enable(13),t.vertexUv3s&&o.enable(14),t.vertexTangents&&o.enable(15),t.anisotropy&&o.enable(16),t.alphaHash&&o.enable(17),t.batching&&o.enable(18),t.dispersion&&o.enable(19),t.batchingColor&&o.enable(20),t.gradientMap&&o.enable(21),t.packedNormalMap&&o.enable(22),t.vertexNormals&&o.enable(23),e.push(o.mask),o.disableAll(),t.fog&&o.enable(0),t.useFog&&o.enable(1),t.flatShading&&o.enable(2),t.logarithmicDepthBuffer&&o.enable(3),t.reversedDepthBuffer&&o.enable(4),t.skinning&&o.enable(5),t.morphTargets&&o.enable(6),t.morphNormals&&o.enable(7),t.morphColors&&o.enable(8),t.premultipliedAlpha&&o.enable(9),t.shadowMapEnabled&&o.enable(10),t.doubleSided&&o.enable(11),t.flipSided&&o.enable(12),t.useDepthPacking&&o.enable(13),t.dithering&&o.enable(14),t.transmission&&o.enable(15),t.sheen&&o.enable(16),t.opaque&&o.enable(17),t.pointsUvs&&o.enable(18),t.decodeVideoTexture&&o.enable(19),t.decodeVideoTextureEmissive&&o.enable(20),t.alphaToCoverage&&o.enable(21),t.numLightProbeGrids>0&&o.enable(22),t.hasPositionAttribute&&o.enable(23),e.push(o.mask)}function y(e){let t=p[e.type],n;if(t){let e=io[t];n=Zi.clone(e.uniforms)}else n=e.uniforms;return n}function b(t,n){let r=u.get(n);return r===void 0?(r=new Mc(e,n,t,i),l.push(r),u.set(n,r)):++r.usedTimes,r}function x(e){if(--e.usedTimes===0){let t=l.indexOf(e);l[t]=l[l.length-1],l.pop(),u.delete(e.cacheKey),e.destroy()}}function S(e){s.remove(e)}function C(){s.dispose()}return{getParameters:h,getProgramCacheKey:g,getUniforms:y,acquireProgram:b,releaseProgram:x,releaseShaderCache:S,programs:l,dispose:C}}function Rc(){let e=new WeakMap;function t(t){return e.has(t)}function n(t){let n=e.get(t);return n===void 0&&(n={},e.set(t,n)),n}function r(t){e.delete(t)}function i(t,n,r){e.get(t)[n]=r}function a(){e=new WeakMap}return{has:t,get:n,remove:r,update:i,dispose:a}}function zc(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.material.id===t.material.id?e.materialVariant===t.materialVariant?e.z===t.z?e.id-t.id:e.z-t.z:e.materialVariant-t.materialVariant:e.material.id-t.material.id:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function Bc(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.z===t.z?e.id-t.id:t.z-e.z:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function Vc(){let e=[],t=0,n=[],r=[],i=[];function a(){t=0,n.length=0,r.length=0,i.length=0}function o(e){let t=0;return e.isInstancedMesh&&(t+=2),e.isSkinnedMesh&&(t+=1),t}function s(n,r,i,a,s,c){let l=e[t];return l===void 0?(l={id:n.id,object:n,geometry:r,material:i,materialVariant:o(n),groupOrder:a,renderOrder:n.renderOrder,z:s,group:c},e[t]=l):(l.id=n.id,l.object=n,l.geometry=r,l.material=i,l.materialVariant=o(n),l.groupOrder=a,l.renderOrder=n.renderOrder,l.z=s,l.group=c),t++,l}function c(e,t,a,o,c,l){let u=s(e,t,a,o,c,l);a.transmission>0?r.push(u):a.transparent===!0?i.push(u):n.push(u)}function l(e,t,a,o,c,l){let u=s(e,t,a,o,c,l);a.transmission>0?r.unshift(u):a.transparent===!0?i.unshift(u):n.unshift(u)}function u(e,t,a){n.length>1&&n.sort(e||zc),r.length>1&&r.sort(t||Bc),i.length>1&&i.sort(t||Bc),a&&(n.reverse(),r.reverse(),i.reverse())}function d(){for(let n=t,r=e.length;n<r;n++){let t=e[n];if(t.id===null)break;t.id=null,t.object=null,t.geometry=null,t.material=null,t.group=null}}return{opaque:n,transmissive:r,transparent:i,init:a,push:c,unshift:l,finish:d,sort:u}}function Hc(){let e=new WeakMap;function t(t,n){let r=e.get(t),i;return r===void 0?(i=new Vc,e.set(t,[i])):n>=r.length?(i=new Vc,r.push(i)):i=r[n],i}function n(){e=new WeakMap}return{get:t,dispose:n}}function Uc(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`DirectionalLight`:n={direction:new B,color:new H};break;case`SpotLight`:n={position:new B,direction:new B,color:new H,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case`PointLight`:n={position:new B,color:new H,distance:0,decay:0};break;case`HemisphereLight`:n={direction:new B,skyColor:new H,groundColor:new H};break;case`RectAreaLight`:n={color:new H,position:new B,halfWidth:new B,halfHeight:new B};break}return e[t.id]=n,n}}}function Wc(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`DirectionalLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new z};break;case`SpotLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new z};break;case`PointLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new z,shadowCameraNear:1,shadowCameraFar:1e3};break}return e[t.id]=n,n}}}var Gc=0;function Kc(e,t){return(t.castShadow?2:0)-(e.castShadow?2:0)+ +!!t.map-!!e.map}function qc(e){let t=new Uc,n=Wc(),r={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let e=0;e<9;e++)r.probe.push(new B);let i=new B,a=new Ft,o=new Ft;function s(i){let a=0,o=0,s=0;for(let e=0;e<9;e++)r.probe[e].set(0,0,0);let c=0,l=0,u=0,d=0,f=0,p=0,m=0,h=0,g=0,_=0,v=0;i.sort(Kc);for(let e=0,y=i.length;e<y;e++){let y=i[e],b=y.color,x=y.intensity,S=y.distance,C=null;if(y.shadow&&y.shadow.map&&(C=y.shadow.map.texture.format===1030?y.shadow.map.texture:y.shadow.map.depthTexture||y.shadow.map.texture),y.isAmbientLight)a+=b.r*x,o+=b.g*x,s+=b.b*x;else if(y.isLightProbe){for(let e=0;e<9;e++)r.probe[e].addScaledVector(y.sh.coefficients[e],x);v++}else if(y.isDirectionalLight){let e=t.get(y);if(e.color.copy(y.color).multiplyScalar(y.intensity),y.castShadow){let e=y.shadow,t=n.get(y);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,r.directionalShadow[c]=t,r.directionalShadowMap[c]=C,r.directionalShadowMatrix[c]=y.shadow.matrix,p++}r.directional[c]=e,c++}else if(y.isSpotLight){let e=t.get(y);e.position.setFromMatrixPosition(y.matrixWorld),e.color.copy(b).multiplyScalar(x),e.distance=S,e.coneCos=Math.cos(y.angle),e.penumbraCos=Math.cos(y.angle*(1-y.penumbra)),e.decay=y.decay,r.spot[u]=e;let i=y.shadow;if(y.map&&(r.spotLightMap[g]=y.map,g++,i.updateMatrices(y),y.castShadow&&_++),r.spotLightMatrix[u]=i.matrix,y.castShadow){let e=n.get(y);e.shadowIntensity=i.intensity,e.shadowBias=i.bias,e.shadowNormalBias=i.normalBias,e.shadowRadius=i.radius,e.shadowMapSize=i.mapSize,r.spotShadow[u]=e,r.spotShadowMap[u]=C,h++}u++}else if(y.isRectAreaLight){let e=t.get(y);e.color.copy(b).multiplyScalar(x),e.halfWidth.set(y.width*.5,0,0),e.halfHeight.set(0,y.height*.5,0),r.rectArea[d]=e,d++}else if(y.isPointLight){let e=t.get(y);if(e.color.copy(y.color).multiplyScalar(y.intensity),e.distance=y.distance,e.decay=y.decay,y.castShadow){let e=y.shadow,t=n.get(y);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,t.shadowCameraNear=e.camera.near,t.shadowCameraFar=e.camera.far,r.pointShadow[l]=t,r.pointShadowMap[l]=C,r.pointShadowMatrix[l]=y.shadow.matrix,m++}r.point[l]=e,l++}else if(y.isHemisphereLight){let e=t.get(y);e.skyColor.copy(y.color).multiplyScalar(x),e.groundColor.copy(y.groundColor).multiplyScalar(x),r.hemi[f]=e,f++}}d>0&&(e.has(`OES_texture_float_linear`)===!0?(r.rectAreaLTC1=W.LTC_FLOAT_1,r.rectAreaLTC2=W.LTC_FLOAT_2):(r.rectAreaLTC1=W.LTC_HALF_1,r.rectAreaLTC2=W.LTC_HALF_2)),r.ambient[0]=a,r.ambient[1]=o,r.ambient[2]=s;let y=r.hash;(y.directionalLength!==c||y.pointLength!==l||y.spotLength!==u||y.rectAreaLength!==d||y.hemiLength!==f||y.numDirectionalShadows!==p||y.numPointShadows!==m||y.numSpotShadows!==h||y.numSpotMaps!==g||y.numLightProbes!==v)&&(r.directional.length=c,r.spot.length=u,r.rectArea.length=d,r.point.length=l,r.hemi.length=f,r.directionalShadow.length=p,r.directionalShadowMap.length=p,r.pointShadow.length=m,r.pointShadowMap.length=m,r.spotShadow.length=h,r.spotShadowMap.length=h,r.directionalShadowMatrix.length=p,r.pointShadowMatrix.length=m,r.spotLightMatrix.length=h+g-_,r.spotLightMap.length=g,r.numSpotLightShadowsWithMaps=_,r.numLightProbes=v,y.directionalLength=c,y.pointLength=l,y.spotLength=u,y.rectAreaLength=d,y.hemiLength=f,y.numDirectionalShadows=p,y.numPointShadows=m,y.numSpotShadows=h,y.numSpotMaps=g,y.numLightProbes=v,r.version=Gc++)}function c(e,t){let n=0,s=0,c=0,l=0,u=0,d=t.matrixWorldInverse;for(let t=0,f=e.length;t<f;t++){let f=e[t];if(f.isDirectionalLight){let e=r.directional[n];e.direction.setFromMatrixPosition(f.matrixWorld),i.setFromMatrixPosition(f.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(d),n++}else if(f.isSpotLight){let e=r.spot[c];e.position.setFromMatrixPosition(f.matrixWorld),e.position.applyMatrix4(d),e.direction.setFromMatrixPosition(f.matrixWorld),i.setFromMatrixPosition(f.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(d),c++}else if(f.isRectAreaLight){let e=r.rectArea[l];e.position.setFromMatrixPosition(f.matrixWorld),e.position.applyMatrix4(d),o.identity(),a.copy(f.matrixWorld),a.premultiply(d),o.extractRotation(a),e.halfWidth.set(f.width*.5,0,0),e.halfHeight.set(0,f.height*.5,0),e.halfWidth.applyMatrix4(o),e.halfHeight.applyMatrix4(o),l++}else if(f.isPointLight){let e=r.point[s];e.position.setFromMatrixPosition(f.matrixWorld),e.position.applyMatrix4(d),s++}else if(f.isHemisphereLight){let e=r.hemi[u];e.direction.setFromMatrixPosition(f.matrixWorld),e.direction.transformDirection(d),u++}}}return{setup:s,setupView:c,state:r}}function Jc(e){let t=new qc(e),n=[],r=[],i=[];function a(e){d.camera=e,n.length=0,r.length=0,i.length=0}function o(e){n.push(e)}function s(e){r.push(e)}function c(e){i.push(e)}function l(){t.setup(n)}function u(e){t.setupView(n,e)}let d={lightsArray:n,shadowsArray:r,lightProbeGridArray:i,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:a,state:d,setupLights:l,setupLightsView:u,pushLight:o,pushShadow:s,pushLightProbeGrid:c}}function Yc(e){let t=new WeakMap;function n(n,r=0){let i=t.get(n),a;return i===void 0?(a=new Jc(e),t.set(n,[a])):r>=i.length?(a=new Jc(e),i.push(a)):a=i[r],a}function r(){t=new WeakMap}return{get:n,dispose:r}}var Xc=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Zc=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,Qc=[new B(1,0,0),new B(-1,0,0),new B(0,1,0),new B(0,-1,0),new B(0,0,1),new B(0,0,-1)],$c=[new B(0,-1,0),new B(0,-1,0),new B(0,0,1),new B(0,0,-1),new B(0,-1,0),new B(0,-1,0)],el=new Ft,tl=new B,nl=new B;function rl(e,t,n){let i=new fi,a=new z,s=new z,c=new At,l=new ra,u=new ia,d={},f=n.maxTextureSize,p={0:1,1:0,2:2},_=new ea({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new z},radius:{value:4}},vertexShader:Xc,fragmentShader:Zc}),v=_.clone();v.defines.HORIZONTAL_PASS=1;let y=new pr;y.setAttribute(`position`,new Qn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let b=new ti(y,_),x=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=1;let S=this.type;this.render=function(t,n,l){if(x.enabled===!1||x.autoUpdate===!1&&x.needsUpdate===!1||t.length===0)return;this.type===2&&(L(`WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead.`),this.type=1);let u=e.getRenderTarget(),d=e.getActiveCubeFace(),p=e.getActiveMipmapLevel(),_=e.state;_.setBlending(0),_.buffers.depth.getReversed()===!0?_.buffers.color.setClear(0,0,0,0):_.buffers.color.setClear(1,1,1,1),_.buffers.depth.setTest(!0),_.setScissorTest(!1);let v=S!==this.type;v&&n.traverse(function(e){e.material&&(Array.isArray(e.material)?e.material.forEach(e=>e.needsUpdate=!0):e.material.needsUpdate=!0)});for(let u=0,d=t.length;u<d;u++){let d=t[u],p=d.shadow;if(p===void 0){L(`WebGLShadowMap:`,d,`has no shadow.`);continue}if(p.autoUpdate===!1&&p.needsUpdate===!1)continue;a.copy(p.mapSize);let y=p.getFrameExtents();a.multiply(y),s.copy(p.mapSize),(a.x>f||a.y>f)&&(a.x>f&&(s.x=Math.floor(f/y.x),a.x=s.x*y.x,p.mapSize.x=s.x),a.y>f&&(s.y=Math.floor(f/y.y),a.y=s.y*y.y,p.mapSize.y=s.y));let b=e.state.buffers.depth.getReversed();if(p.camera._reversedDepth=b,p.map===null||v===!0){if(p.map!==null&&(p.map.depthTexture!==null&&(p.map.depthTexture.dispose(),p.map.depthTexture=null),p.map.dispose()),this.type===3){if(d.isPointLight){L(`WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.`);continue}p.map=new Mt(a.x,a.y,{format:O,type:g,minFilter:o,magFilter:o,generateMipmaps:!1}),p.map.texture.name=d.name+`.shadowMap`,p.map.depthTexture=new Fi(a.x,a.y,h),p.map.depthTexture.name=d.name+`.shadowMapDepth`,p.map.depthTexture.format=T,p.map.depthTexture.compareFunction=null,p.map.depthTexture.minFilter=r,p.map.depthTexture.magFilter=r}else d.isPointLight?(p.map=new Po(a.x),p.map.depthTexture=new Ii(a.x,m)):(p.map=new Mt(a.x,a.y),p.map.depthTexture=new Fi(a.x,a.y,m)),p.map.depthTexture.name=d.name+`.shadowMap`,p.map.depthTexture.format=T,this.type===1?(p.map.depthTexture.compareFunction=b?518:515,p.map.depthTexture.minFilter=o,p.map.depthTexture.magFilter=o):(p.map.depthTexture.compareFunction=null,p.map.depthTexture.minFilter=r,p.map.depthTexture.magFilter=r);p.camera.updateProjectionMatrix()}let x=p.map.isWebGLCubeRenderTarget?6:1;for(let t=0;t<x;t++){if(p.map.isWebGLCubeRenderTarget)e.setRenderTarget(p.map,t),e.clear();else{t===0&&(e.setRenderTarget(p.map),e.clear());let n=p.getViewport(t);c.set(s.x*n.x,s.y*n.y,s.x*n.z,s.y*n.w),_.viewport(c)}if(d.isPointLight){let e=p.camera,n=p.matrix,r=d.distance||e.far;r!==e.far&&(e.far=r,e.updateProjectionMatrix()),tl.setFromMatrixPosition(d.matrixWorld),e.position.copy(tl),nl.copy(e.position),nl.add(Qc[t]),e.up.copy($c[t]),e.lookAt(nl),e.updateMatrixWorld(),n.makeTranslation(-tl.x,-tl.y,-tl.z),el.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),p._frustum.setFromProjectionMatrix(el,e.coordinateSystem,e.reversedDepth)}else p.updateMatrices(d);i=p.getFrustum(),E(n,l,p.camera,d,this.type)}p.isPointLightShadow!==!0&&this.type===3&&C(p,l),p.needsUpdate=!1}S=this.type,x.needsUpdate=!1,e.setRenderTarget(u,d,p)};function C(n,r){let i=t.update(b);_.defines.VSM_SAMPLES!==n.blurSamples&&(_.defines.VSM_SAMPLES=n.blurSamples,v.defines.VSM_SAMPLES=n.blurSamples,_.needsUpdate=!0,v.needsUpdate=!0),n.mapPass===null&&(n.mapPass=new Mt(a.x,a.y,{format:O,type:g})),_.uniforms.shadow_pass.value=n.map.depthTexture,_.uniforms.resolution.value=n.mapSize,_.uniforms.radius.value=n.radius,e.setRenderTarget(n.mapPass),e.clear(),e.renderBufferDirect(r,null,i,_,b,null),v.uniforms.shadow_pass.value=n.mapPass.texture,v.uniforms.resolution.value=n.mapSize,v.uniforms.radius.value=n.radius,e.setRenderTarget(n.map),e.clear(),e.renderBufferDirect(r,null,i,v,b,null)}function w(t,n,r,i){let a=null,o=r.isPointLight===!0?t.customDistanceMaterial:t.customDepthMaterial;if(o!==void 0)a=o;else if(a=r.isPointLight===!0?u:l,e.localClippingEnabled&&n.clipShadows===!0&&Array.isArray(n.clippingPlanes)&&n.clippingPlanes.length!==0||n.displacementMap&&n.displacementScale!==0||n.alphaMap&&n.alphaTest>0||n.map&&n.alphaTest>0||n.alphaToCoverage===!0){let e=a.uuid,t=n.uuid,r=d[e];r===void 0&&(r={},d[e]=r);let i=r[t];i===void 0&&(i=a.clone(),r[t]=i,n.addEventListener(`dispose`,D)),a=i}if(a.visible=n.visible,a.wireframe=n.wireframe,i===3?a.side=n.shadowSide===null?n.side:n.shadowSide:a.side=n.shadowSide===null?p[n.side]:n.shadowSide,a.alphaMap=n.alphaMap,a.alphaTest=n.alphaToCoverage===!0?.5:n.alphaTest,a.map=n.map,a.clipShadows=n.clipShadows,a.clippingPlanes=n.clippingPlanes,a.clipIntersection=n.clipIntersection,a.displacementMap=n.displacementMap,a.displacementScale=n.displacementScale,a.displacementBias=n.displacementBias,a.wireframeLinewidth=n.wireframeLinewidth,a.linewidth=n.linewidth,r.isPointLight===!0&&a.isMeshDistanceMaterial===!0){let t=e.properties.get(a);t.light=r}return a}function E(n,r,a,o,s){if(n.visible===!1)return;if(n.layers.test(r.layers)&&(n.isMesh||n.isLine||n.isPoints)&&(n.castShadow||n.receiveShadow&&s===3)&&(!n.frustumCulled||i.intersectsObject(n))){n.modelViewMatrix.multiplyMatrices(a.matrixWorldInverse,n.matrixWorld);let i=t.update(n),c=n.material;if(Array.isArray(c)){let t=i.groups;for(let l=0,u=t.length;l<u;l++){let u=t[l],d=c[u.materialIndex];if(d&&d.visible){let t=w(n,d,o,s);n.onBeforeShadow(e,n,r,a,i,t,u),e.renderBufferDirect(a,null,i,t,n,u),n.onAfterShadow(e,n,r,a,i,t,u)}}}else if(c.visible){let t=w(n,c,o,s);n.onBeforeShadow(e,n,r,a,i,t,null),e.renderBufferDirect(a,null,i,t,n,null),n.onAfterShadow(e,n,r,a,i,t,null)}}let c=n.children;for(let e=0,t=c.length;e<t;e++)E(c[e],r,a,o,s)}function D(e){e.target.removeEventListener(`dispose`,D);for(let t in d){let n=d[t],r=e.target.uuid;r in n&&(n[r].dispose(),delete n[r])}}}function il(e,t){function n(){let t=!1,n=new At,r=null,i=new At(0,0,0,0);return{setMask:function(n){r!==n&&!t&&(e.colorMask(n,n,n,n),r=n)},setLocked:function(e){t=e},setClear:function(t,r,a,o,s){s===!0&&(t*=o,r*=o,a*=o),n.set(t,r,a,o),i.equals(n)===!1&&(e.clearColor(t,r,a,o),i.copy(n))},reset:function(){t=!1,r=null,i.set(-1,0,0,0)}}}function r(){let n=!1,r=!1,i=null,a=null,o=null;return{setReversed:function(e){if(r!==e){let n=t.get(`EXT_clip_control`);e?n.clipControlEXT(n.LOWER_LEFT_EXT,n.ZERO_TO_ONE_EXT):n.clipControlEXT(n.LOWER_LEFT_EXT,n.NEGATIVE_ONE_TO_ONE_EXT),r=e;let i=o;o=null,this.setClear(i)}},getReversed:function(){return r},setTest:function(t){t?N(e.DEPTH_TEST):de(e.DEPTH_TEST)},setMask:function(t){i!==t&&!n&&(e.depthMask(t),i=t)},setFunc:function(t){if(r&&(t=tt[t]),a!==t){switch(t){case 0:e.depthFunc(e.NEVER);break;case 1:e.depthFunc(e.ALWAYS);break;case 2:e.depthFunc(e.LESS);break;case 3:e.depthFunc(e.LEQUAL);break;case 4:e.depthFunc(e.EQUAL);break;case 5:e.depthFunc(e.GEQUAL);break;case 6:e.depthFunc(e.GREATER);break;case 7:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}a=t}},setLocked:function(e){n=e},setClear:function(t){o!==t&&(o=t,r&&(t=1-t),e.clearDepth(t))},reset:function(){n=!1,i=null,a=null,o=null,r=!1}}}function i(){let t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null;return{setTest:function(n){t||(n?N(e.STENCIL_TEST):de(e.STENCIL_TEST))},setMask:function(r){n!==r&&!t&&(e.stencilMask(r),n=r)},setFunc:function(t,n,o){(r!==t||i!==n||a!==o)&&(e.stencilFunc(t,n,o),r=t,i=n,a=o)},setOp:function(t,n,r){(o!==t||s!==n||c!==r)&&(e.stencilOp(t,n,r),o=t,s=n,c=r)},setLocked:function(e){t=e},setClear:function(t){l!==t&&(e.clearStencil(t),l=t)},reset:function(){t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null}}}let a=new n,o=new r,s=new i,c=new WeakMap,l=new WeakMap,u={},d={},f={},p=new WeakMap,m=[],h=null,g=!1,_=null,v=null,y=null,b=null,x=null,S=null,C=null,w=new H(0,0,0),T=0,E=!1,D=null,ee=null,O=null,k=null,te=null,A=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS),j=!1,ne=0,re=e.getParameter(e.VERSION);re.indexOf(`WebGL`)===-1?re.indexOf(`OpenGL ES`)!==-1&&(ne=parseFloat(/^OpenGL ES (\d)/.exec(re)[1]),j=ne>=2):(ne=parseFloat(/^WebGL (\d)/.exec(re)[1]),j=ne>=1);let M=null,ie={},ae=e.getParameter(e.SCISSOR_BOX),oe=e.getParameter(e.VIEWPORT),se=new At().fromArray(ae),ce=new At().fromArray(oe);function le(t,n,r,i){let a=new Uint8Array(4),o=e.createTexture();e.bindTexture(t,o),e.texParameteri(t,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(t,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let o=0;o<r;o++)t===e.TEXTURE_3D||t===e.TEXTURE_2D_ARRAY?e.texImage3D(n,0,e.RGBA,1,1,i,0,e.RGBA,e.UNSIGNED_BYTE,a):e.texImage2D(n+o,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,a);return o}let ue={};ue[e.TEXTURE_2D]=le(e.TEXTURE_2D,e.TEXTURE_2D,1),ue[e.TEXTURE_CUBE_MAP]=le(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),ue[e.TEXTURE_2D_ARRAY]=le(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),ue[e.TEXTURE_3D]=le(e.TEXTURE_3D,e.TEXTURE_3D,1,1),a.setClear(0,0,0,1),o.setClear(1),s.setClear(0),N(e.DEPTH_TEST),o.setFunc(3),ye(!1),be(1),N(e.CULL_FACE),_e(0);function N(t){u[t]!==!0&&(e.enable(t),u[t]=!0)}function de(t){u[t]!==!1&&(e.disable(t),u[t]=!1)}function fe(t,n){return f[t]===n?!1:(e.bindFramebuffer(t,n),f[t]=n,t===e.DRAW_FRAMEBUFFER&&(f[e.FRAMEBUFFER]=n),t===e.FRAMEBUFFER&&(f[e.DRAW_FRAMEBUFFER]=n),!0)}function pe(t,n){let r=m,i=!1;if(t){r=p.get(n),r===void 0&&(r=[],p.set(n,r));let a=t.textures;if(r.length!==a.length||r[0]!==e.COLOR_ATTACHMENT0){for(let t=0,n=a.length;t<n;t++)r[t]=e.COLOR_ATTACHMENT0+t;r.length=a.length,i=!0}}else r[0]!==e.BACK&&(r[0]=e.BACK,i=!0);i&&e.drawBuffers(r)}function me(t){return h===t?!1:(e.useProgram(t),h=t,!0)}let he={100:e.FUNC_ADD,101:e.FUNC_SUBTRACT,102:e.FUNC_REVERSE_SUBTRACT};he[103]=e.MIN,he[104]=e.MAX;let ge={200:e.ZERO,201:e.ONE,202:e.SRC_COLOR,204:e.SRC_ALPHA,210:e.SRC_ALPHA_SATURATE,208:e.DST_COLOR,206:e.DST_ALPHA,203:e.ONE_MINUS_SRC_COLOR,205:e.ONE_MINUS_SRC_ALPHA,209:e.ONE_MINUS_DST_COLOR,207:e.ONE_MINUS_DST_ALPHA,211:e.CONSTANT_COLOR,212:e.ONE_MINUS_CONSTANT_COLOR,213:e.CONSTANT_ALPHA,214:e.ONE_MINUS_CONSTANT_ALPHA};function _e(t,n,r,i,a,o,s,c,l,u){if(t===0){g===!0&&(de(e.BLEND),g=!1);return}if(g===!1&&(N(e.BLEND),g=!0),t!==5){if(t!==_||u!==E){if((v!==100||x!==100)&&(e.blendEquation(e.FUNC_ADD),v=100,x=100),u)switch(t){case 1:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFunc(e.ONE,e.ONE);break;case 3:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case 4:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:R(`WebGLState: Invalid blending: `,t);break}else switch(t){case 1:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case 3:R(`WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true`);break;case 4:R(`WebGLState: MultiplyBlending requires material.premultipliedAlpha = true`);break;default:R(`WebGLState: Invalid blending: `,t);break}y=null,b=null,S=null,C=null,w.set(0,0,0),T=0,_=t,E=u}return}a||=n,o||=r,s||=i,(n!==v||a!==x)&&(e.blendEquationSeparate(he[n],he[a]),v=n,x=a),(r!==y||i!==b||o!==S||s!==C)&&(e.blendFuncSeparate(ge[r],ge[i],ge[o],ge[s]),y=r,b=i,S=o,C=s),(c.equals(w)===!1||l!==T)&&(e.blendColor(c.r,c.g,c.b,l),w.copy(c),T=l),_=t,E=!1}function ve(t,n){t.side===2?de(e.CULL_FACE):N(e.CULL_FACE);let r=t.side===1;n&&(r=!r),ye(r),t.blending===1&&t.transparent===!1?_e(0):_e(t.blending,t.blendEquation,t.blendSrc,t.blendDst,t.blendEquationAlpha,t.blendSrcAlpha,t.blendDstAlpha,t.blendColor,t.blendAlpha,t.premultipliedAlpha),o.setFunc(t.depthFunc),o.setTest(t.depthTest),o.setMask(t.depthWrite),a.setMask(t.colorWrite);let i=t.stencilWrite;s.setTest(i),i&&(s.setMask(t.stencilWriteMask),s.setFunc(t.stencilFunc,t.stencilRef,t.stencilFuncMask),s.setOp(t.stencilFail,t.stencilZFail,t.stencilZPass)),Se(t.polygonOffset,t.polygonOffsetFactor,t.polygonOffsetUnits),t.alphaToCoverage===!0?N(e.SAMPLE_ALPHA_TO_COVERAGE):de(e.SAMPLE_ALPHA_TO_COVERAGE)}function ye(t){D!==t&&(t?e.frontFace(e.CW):e.frontFace(e.CCW),D=t)}function be(t){t===0?de(e.CULL_FACE):(N(e.CULL_FACE),t!==ee&&(t===1?e.cullFace(e.BACK):t===2?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))),ee=t}function xe(t){t!==O&&(j&&e.lineWidth(t),O=t)}function Se(t,n,r){t?(N(e.POLYGON_OFFSET_FILL),(k!==n||te!==r)&&(k=n,te=r,o.getReversed()&&(n=-n),e.polygonOffset(n,r))):de(e.POLYGON_OFFSET_FILL)}function Ce(t){t?N(e.SCISSOR_TEST):de(e.SCISSOR_TEST)}function we(t){t===void 0&&(t=e.TEXTURE0+A-1),M!==t&&(e.activeTexture(t),M=t)}function Te(t,n,r){r===void 0&&(r=M===null?e.TEXTURE0+A-1:M);let i=ie[r];i===void 0&&(i={type:void 0,texture:void 0},ie[r]=i),(i.type!==t||i.texture!==n)&&(M!==r&&(e.activeTexture(r),M=r),e.bindTexture(t,n||ue[t]),i.type=t,i.texture=n)}function Ee(){let t=ie[M];t!==void 0&&t.type!==void 0&&(e.bindTexture(t.type,null),t.type=void 0,t.texture=void 0)}function De(){try{e.compressedTexImage2D(...arguments)}catch(e){R(`WebGLState:`,e)}}function Oe(){try{e.compressedTexImage3D(...arguments)}catch(e){R(`WebGLState:`,e)}}function ke(){try{e.texSubImage2D(...arguments)}catch(e){R(`WebGLState:`,e)}}function Ae(){try{e.texSubImage3D(...arguments)}catch(e){R(`WebGLState:`,e)}}function je(){try{e.compressedTexSubImage2D(...arguments)}catch(e){R(`WebGLState:`,e)}}function Me(){try{e.compressedTexSubImage3D(...arguments)}catch(e){R(`WebGLState:`,e)}}function Ne(){try{e.texStorage2D(...arguments)}catch(e){R(`WebGLState:`,e)}}function Pe(){try{e.texStorage3D(...arguments)}catch(e){R(`WebGLState:`,e)}}function P(){try{e.texImage2D(...arguments)}catch(e){R(`WebGLState:`,e)}}function Fe(){try{e.texImage3D(...arguments)}catch(e){R(`WebGLState:`,e)}}function Ie(t){return d[t]===void 0?e.getParameter(t):d[t]}function Le(t,n){d[t]!==n&&(e.pixelStorei(t,n),d[t]=n)}function F(t){se.equals(t)===!1&&(e.scissor(t.x,t.y,t.z,t.w),se.copy(t))}function Re(t){ce.equals(t)===!1&&(e.viewport(t.x,t.y,t.z,t.w),ce.copy(t))}function I(t,n){let r=l.get(n);r===void 0&&(r=new WeakMap,l.set(n,r));let i=r.get(t);i===void 0&&(i=e.getUniformBlockIndex(n,t.name),r.set(t,i))}function ze(t,n){let r=l.get(n).get(t);c.get(n)!==r&&(e.uniformBlockBinding(n,r,t.__bindingPointIndex),c.set(n,r))}function Be(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),o.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),e.pixelStorei(e.PACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,e.BROWSER_DEFAULT_WEBGL),e.pixelStorei(e.PACK_ROW_LENGTH,0),e.pixelStorei(e.PACK_SKIP_PIXELS,0),e.pixelStorei(e.PACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_ROW_LENGTH,0),e.pixelStorei(e.UNPACK_IMAGE_HEIGHT,0),e.pixelStorei(e.UNPACK_SKIP_PIXELS,0),e.pixelStorei(e.UNPACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_SKIP_IMAGES,0),u={},d={},M=null,ie={},f={},p=new WeakMap,m=[],h=null,g=!1,_=null,v=null,y=null,b=null,x=null,S=null,C=null,w=new H(0,0,0),T=0,E=!1,D=null,ee=null,O=null,k=null,te=null,se.set(0,0,e.canvas.width,e.canvas.height),ce.set(0,0,e.canvas.width,e.canvas.height),a.reset(),o.reset(),s.reset()}return{buffers:{color:a,depth:o,stencil:s},enable:N,disable:de,bindFramebuffer:fe,drawBuffers:pe,useProgram:me,setBlending:_e,setMaterial:ve,setFlipSided:ye,setCullFace:be,setLineWidth:xe,setPolygonOffset:Se,setScissorTest:Ce,activeTexture:we,bindTexture:Te,unbindTexture:Ee,compressedTexImage2D:De,compressedTexImage3D:Oe,texImage2D:P,texImage3D:Fe,pixelStorei:Le,getParameter:Ie,updateUBOMapping:I,uniformBlockBinding:ze,texStorage2D:Ne,texStorage3D:Pe,texSubImage2D:ke,texSubImage3D:Ae,compressedTexSubImage2D:je,compressedTexSubImage3D:Me,scissor:F,viewport:Re,reset:Be}}function al(l,u,d,f,p,m,h){let g=u.has(`WEBGL_multisampled_render_to_texture`)?u.get(`WEBGL_multisampled_render_to_texture`):null,_=typeof navigator>`u`?!1:/OculusBrowser/g.test(navigator.userAgent),v=new z,y=new WeakMap,b=new Set,x,S=new WeakMap,C=!1;try{C=typeof OffscreenCanvas<`u`&&new OffscreenCanvas(1,1).getContext(`2d`)!==null}catch{}function w(e,t){return C?new OffscreenCanvas(e,t):Je(`canvas`)}function T(e,t,n){let r=1,i=Ie(e);if((i.width>n||i.height>n)&&(r=n/Math.max(i.width,i.height)),r<1)if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap||typeof VideoFrame<`u`&&e instanceof VideoFrame){let n=Math.floor(r*i.width),a=Math.floor(r*i.height);x===void 0&&(x=w(n,a));let o=t?w(n,a):x;return o.width=n,o.height=a,o.getContext(`2d`).drawImage(e,0,0,n,a),L(`WebGLRenderer: Texture has been resized from (`+i.width+`x`+i.height+`) to (`+n+`x`+a+`).`),o}else return`data`in e&&L(`WebGLRenderer: Image in DataTexture is too big (`+i.width+`x`+i.height+`).`),e;return e}function D(e){return e.generateMipmaps}function ee(e){l.generateMipmap(e)}function O(e){return e.isWebGLCubeRenderTarget?l.TEXTURE_CUBE_MAP:e.isWebGL3DRenderTarget?l.TEXTURE_3D:e.isWebGLArrayRenderTarget||e.isCompressedArrayTexture?l.TEXTURE_2D_ARRAY:l.TEXTURE_2D}function k(e,t,n,r,i,a=!1){if(e!==null){if(l[e]!==void 0)return l[e];L(`WebGLRenderer: Attempt to use non-existing WebGL internal format '`+e+`'`)}let o;r&&(o=u.get(`EXT_texture_norm16`),o||L(`WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension`));let s=t;if(t===l.RED&&(n===l.FLOAT&&(s=l.R32F),n===l.HALF_FLOAT&&(s=l.R16F),n===l.UNSIGNED_BYTE&&(s=l.R8),n===l.UNSIGNED_SHORT&&o&&(s=o.R16_EXT),n===l.SHORT&&o&&(s=o.R16_SNORM_EXT)),t===l.RED_INTEGER&&(n===l.UNSIGNED_BYTE&&(s=l.R8UI),n===l.UNSIGNED_SHORT&&(s=l.R16UI),n===l.UNSIGNED_INT&&(s=l.R32UI),n===l.BYTE&&(s=l.R8I),n===l.SHORT&&(s=l.R16I),n===l.INT&&(s=l.R32I)),t===l.RG&&(n===l.FLOAT&&(s=l.RG32F),n===l.HALF_FLOAT&&(s=l.RG16F),n===l.UNSIGNED_BYTE&&(s=l.RG8),n===l.UNSIGNED_SHORT&&o&&(s=o.RG16_EXT),n===l.SHORT&&o&&(s=o.RG16_SNORM_EXT)),t===l.RG_INTEGER&&(n===l.UNSIGNED_BYTE&&(s=l.RG8UI),n===l.UNSIGNED_SHORT&&(s=l.RG16UI),n===l.UNSIGNED_INT&&(s=l.RG32UI),n===l.BYTE&&(s=l.RG8I),n===l.SHORT&&(s=l.RG16I),n===l.INT&&(s=l.RG32I)),t===l.RGB_INTEGER&&(n===l.UNSIGNED_BYTE&&(s=l.RGB8UI),n===l.UNSIGNED_SHORT&&(s=l.RGB16UI),n===l.UNSIGNED_INT&&(s=l.RGB32UI),n===l.BYTE&&(s=l.RGB8I),n===l.SHORT&&(s=l.RGB16I),n===l.INT&&(s=l.RGB32I)),t===l.RGBA_INTEGER&&(n===l.UNSIGNED_BYTE&&(s=l.RGBA8UI),n===l.UNSIGNED_SHORT&&(s=l.RGBA16UI),n===l.UNSIGNED_INT&&(s=l.RGBA32UI),n===l.BYTE&&(s=l.RGBA8I),n===l.SHORT&&(s=l.RGBA16I),n===l.INT&&(s=l.RGBA32I)),t===l.RGB&&(n===l.UNSIGNED_SHORT&&o&&(s=o.RGB16_EXT),n===l.SHORT&&o&&(s=o.RGB16_SNORM_EXT),n===l.UNSIGNED_INT_5_9_9_9_REV&&(s=l.RGB9_E5),n===l.UNSIGNED_INT_10F_11F_11F_REV&&(s=l.R11F_G11F_B10F)),t===l.RGBA){let e=a?Ve:yt.getTransfer(i);n===l.FLOAT&&(s=l.RGBA32F),n===l.HALF_FLOAT&&(s=l.RGBA16F),n===l.UNSIGNED_BYTE&&(s=e===`srgb`?l.SRGB8_ALPHA8:l.RGBA8),n===l.UNSIGNED_SHORT&&o&&(s=o.RGBA16_EXT),n===l.SHORT&&o&&(s=o.RGBA16_SNORM_EXT),n===l.UNSIGNED_SHORT_4_4_4_4&&(s=l.RGBA4),n===l.UNSIGNED_SHORT_5_5_5_1&&(s=l.RGB5_A1)}return(s===l.R16F||s===l.R32F||s===l.RG16F||s===l.RG32F||s===l.RGBA16F||s===l.RGBA32F)&&u.get(`EXT_color_buffer_float`),s}function te(e,t){let n;return e?t===null||t===1014||t===1020?n=l.DEPTH24_STENCIL8:t===1015?n=l.DEPTH32F_STENCIL8:t===1012&&(n=l.DEPTH24_STENCIL8,L(`DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.`)):t===null||t===1014||t===1020?n=l.DEPTH_COMPONENT24:t===1015?n=l.DEPTH_COMPONENT32F:t===1012&&(n=l.DEPTH_COMPONENT16),n}function A(e,t){return D(e)===!0||e.isFramebufferTexture&&e.minFilter!==1003&&e.minFilter!==1006?Math.log2(Math.max(t.width,t.height))+1:e.mipmaps!==void 0&&e.mipmaps.length>0?e.mipmaps.length:e.isCompressedTexture&&Array.isArray(e.image)?t.mipmaps.length:1}function j(e){let t=e.target;t.removeEventListener(`dispose`,j),re(t),t.isVideoTexture&&y.delete(t),t.isHTMLTexture&&b.delete(t)}function ne(e){let t=e.target;t.removeEventListener(`dispose`,ne),ie(t)}function re(e){let t=f.get(e);if(t.__webglInit===void 0)return;let n=e.source,r=S.get(n);if(r){let i=r[t.__cacheKey];i.usedTimes--,i.usedTimes===0&&M(e),Object.keys(r).length===0&&S.delete(n)}f.remove(e)}function M(e){let t=f.get(e);l.deleteTexture(t.__webglTexture);let n=e.source,r=S.get(n);delete r[t.__cacheKey],h.memory.textures--}function ie(e){let t=f.get(e);if(e.depthTexture&&(e.depthTexture.dispose(),f.remove(e.depthTexture)),e.isWebGLCubeRenderTarget)for(let e=0;e<6;e++){if(Array.isArray(t.__webglFramebuffer[e]))for(let n=0;n<t.__webglFramebuffer[e].length;n++)l.deleteFramebuffer(t.__webglFramebuffer[e][n]);else l.deleteFramebuffer(t.__webglFramebuffer[e]);t.__webglDepthbuffer&&l.deleteRenderbuffer(t.__webglDepthbuffer[e])}else{if(Array.isArray(t.__webglFramebuffer))for(let e=0;e<t.__webglFramebuffer.length;e++)l.deleteFramebuffer(t.__webglFramebuffer[e]);else l.deleteFramebuffer(t.__webglFramebuffer);if(t.__webglDepthbuffer&&l.deleteRenderbuffer(t.__webglDepthbuffer),t.__webglMultisampledFramebuffer&&l.deleteFramebuffer(t.__webglMultisampledFramebuffer),t.__webglColorRenderbuffer)for(let e=0;e<t.__webglColorRenderbuffer.length;e++)t.__webglColorRenderbuffer[e]&&l.deleteRenderbuffer(t.__webglColorRenderbuffer[e]);t.__webglDepthRenderbuffer&&l.deleteRenderbuffer(t.__webglDepthRenderbuffer)}let n=e.textures;for(let e=0,t=n.length;e<t;e++){let t=f.get(n[e]);t.__webglTexture&&(l.deleteTexture(t.__webglTexture),h.memory.textures--),f.remove(n[e])}f.remove(e)}let ae=0;function oe(){ae=0}function se(){return ae}function ce(e){ae=e}function le(){let e=ae;return e>=p.maxTextures&&L(`WebGLTextures: Trying to use `+e+` texture units while this GPU supports only `+p.maxTextures),ae+=1,e}function ue(e){let t=[];return t.push(e.wrapS),t.push(e.wrapT),t.push(e.wrapR||0),t.push(e.magFilter),t.push(e.minFilter),t.push(e.anisotropy),t.push(e.internalFormat),t.push(e.format),t.push(e.type),t.push(e.generateMipmaps),t.push(e.premultiplyAlpha),t.push(e.flipY),t.push(e.unpackAlignment),t.push(e.colorSpace),t.join()}function N(e,t){let n=f.get(e);if(e.isVideoTexture&&P(e),e.isRenderTargetTexture===!1&&e.isExternalTexture!==!0&&e.version>0&&n.__version!==e.version){let r=e.image;if(r===null)L(`WebGLRenderer: Texture marked for update but no image data found.`);else if(r.complete===!1)L(`WebGLRenderer: Texture marked for update but image is incomplete`);else{xe(n,e,t);return}}else e.isExternalTexture&&(n.__webglTexture=e.sourceTexture?e.sourceTexture:null);d.bindTexture(l.TEXTURE_2D,n.__webglTexture,l.TEXTURE0+t)}function de(e,t){let n=f.get(e);if(e.isRenderTargetTexture===!1&&e.version>0&&n.__version!==e.version){xe(n,e,t);return}else e.isExternalTexture&&(n.__webglTexture=e.sourceTexture?e.sourceTexture:null);d.bindTexture(l.TEXTURE_2D_ARRAY,n.__webglTexture,l.TEXTURE0+t)}function fe(e,t){let n=f.get(e);if(e.isRenderTargetTexture===!1&&e.version>0&&n.__version!==e.version){xe(n,e,t);return}d.bindTexture(l.TEXTURE_3D,n.__webglTexture,l.TEXTURE0+t)}function pe(e,t){let n=f.get(e);if(e.isCubeDepthTexture!==!0&&e.version>0&&n.__version!==e.version){Se(n,e,t);return}d.bindTexture(l.TEXTURE_CUBE_MAP,n.__webglTexture,l.TEXTURE0+t)}let me={[e]:l.REPEAT,[t]:l.CLAMP_TO_EDGE,[n]:l.MIRRORED_REPEAT},he={[r]:l.NEAREST,[i]:l.NEAREST_MIPMAP_NEAREST,[a]:l.NEAREST_MIPMAP_LINEAR,[o]:l.LINEAR,[s]:l.LINEAR_MIPMAP_NEAREST,[c]:l.LINEAR_MIPMAP_LINEAR},ge={512:l.NEVER,519:l.ALWAYS,513:l.LESS,515:l.LEQUAL,514:l.EQUAL,518:l.GEQUAL,516:l.GREATER,517:l.NOTEQUAL};function _e(e,t){if(t.type===1015&&u.has(`OES_texture_float_linear`)===!1&&(t.magFilter===1006||t.magFilter===1007||t.magFilter===1005||t.magFilter===1008||t.minFilter===1006||t.minFilter===1007||t.minFilter===1005||t.minFilter===1008)&&L(`WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.`),l.texParameteri(e,l.TEXTURE_WRAP_S,me[t.wrapS]),l.texParameteri(e,l.TEXTURE_WRAP_T,me[t.wrapT]),(e===l.TEXTURE_3D||e===l.TEXTURE_2D_ARRAY)&&l.texParameteri(e,l.TEXTURE_WRAP_R,me[t.wrapR]),l.texParameteri(e,l.TEXTURE_MAG_FILTER,he[t.magFilter]),l.texParameteri(e,l.TEXTURE_MIN_FILTER,he[t.minFilter]),t.compareFunction&&(l.texParameteri(e,l.TEXTURE_COMPARE_MODE,l.COMPARE_REF_TO_TEXTURE),l.texParameteri(e,l.TEXTURE_COMPARE_FUNC,ge[t.compareFunction])),u.has(`EXT_texture_filter_anisotropic`)===!0){if(t.magFilter===1003||t.minFilter!==1005&&t.minFilter!==1008||t.type===1015&&u.has(`OES_texture_float_linear`)===!1)return;if(t.anisotropy>1||f.get(t).__currentAnisotropy){let n=u.get(`EXT_texture_filter_anisotropic`);l.texParameterf(e,n.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(t.anisotropy,p.getMaxAnisotropy())),f.get(t).__currentAnisotropy=t.anisotropy}}}function ve(e,t){let n=!1;e.__webglInit===void 0&&(e.__webglInit=!0,t.addEventListener(`dispose`,j));let r=t.source,i=S.get(r);i===void 0&&(i={},S.set(r,i));let a=ue(t);if(a!==e.__cacheKey){i[a]===void 0&&(i[a]={texture:l.createTexture(),usedTimes:0},h.memory.textures++,n=!0),i[a].usedTimes++;let r=i[e.__cacheKey];r!==void 0&&(i[e.__cacheKey].usedTimes--,r.usedTimes===0&&M(t)),e.__cacheKey=a,e.__webglTexture=i[a].texture}return n}function ye(e,t,n){return Math.floor(Math.floor(e/n)/t)}function be(e,t,n,r){let i=e.updateRanges;if(i.length===0)d.texSubImage2D(l.TEXTURE_2D,0,0,0,t.width,t.height,n,r,t.data);else{i.sort((e,t)=>e.start-t.start);let a=0;for(let e=1;e<i.length;e++){let n=i[a],r=i[e],o=n.start+n.count,s=ye(r.start,t.width,4),c=ye(n.start,t.width,4);r.start<=o+1&&s===c&&ye(r.start+r.count-1,t.width,4)===s?n.count=Math.max(n.count,r.start+r.count-n.start):(++a,i[a]=r)}i.length=a+1;let o=d.getParameter(l.UNPACK_ROW_LENGTH),s=d.getParameter(l.UNPACK_SKIP_PIXELS),c=d.getParameter(l.UNPACK_SKIP_ROWS);d.pixelStorei(l.UNPACK_ROW_LENGTH,t.width);for(let e=0,a=i.length;e<a;e++){let a=i[e],o=Math.floor(a.start/4),s=Math.ceil(a.count/4),c=o%t.width,u=Math.floor(o/t.width),f=s;d.pixelStorei(l.UNPACK_SKIP_PIXELS,c),d.pixelStorei(l.UNPACK_SKIP_ROWS,u),d.texSubImage2D(l.TEXTURE_2D,0,c,u,f,1,n,r,t.data)}e.clearUpdateRanges(),d.pixelStorei(l.UNPACK_ROW_LENGTH,o),d.pixelStorei(l.UNPACK_SKIP_PIXELS,s),d.pixelStorei(l.UNPACK_SKIP_ROWS,c)}}function xe(e,t,n){let r=l.TEXTURE_2D;(t.isDataArrayTexture||t.isCompressedArrayTexture)&&(r=l.TEXTURE_2D_ARRAY),t.isData3DTexture&&(r=l.TEXTURE_3D);let i=ve(e,t),a=t.source;d.bindTexture(r,e.__webglTexture,l.TEXTURE0+n);let o=f.get(a);if(a.version!==o.__version||i===!0){if(d.activeTexture(l.TEXTURE0+n),!(typeof ImageBitmap<`u`&&t.image instanceof ImageBitmap)){let e=yt.getPrimaries(yt.workingColorSpace),n=t.colorSpace===``?null:yt.getPrimaries(t.colorSpace),r=t.colorSpace===``||e===n?l.NONE:l.BROWSER_DEFAULT_WEBGL;d.pixelStorei(l.UNPACK_FLIP_Y_WEBGL,t.flipY),d.pixelStorei(l.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t.premultiplyAlpha),d.pixelStorei(l.UNPACK_COLORSPACE_CONVERSION_WEBGL,r)}d.pixelStorei(l.UNPACK_ALIGNMENT,t.unpackAlignment);let e=T(t.image,!1,p.maxTextureSize);e=Fe(t,e);let s=m.convert(t.format,t.colorSpace),c=m.convert(t.type),u=k(t.internalFormat,s,c,t.normalized,t.colorSpace,t.isVideoTexture);_e(r,t);let f,h=t.mipmaps,g=t.isVideoTexture!==!0,_=o.__version===void 0||i===!0,v=a.dataReady,y=A(t,e);if(t.isDepthTexture)u=te(t.format===E,t.type),_&&(g?d.texStorage2D(l.TEXTURE_2D,1,u,e.width,e.height):d.texImage2D(l.TEXTURE_2D,0,u,e.width,e.height,0,s,c,null));else if(t.isDataTexture)if(h.length>0){g&&_&&d.texStorage2D(l.TEXTURE_2D,y,u,h[0].width,h[0].height);for(let e=0,t=h.length;e<t;e++)f=h[e],g?v&&d.texSubImage2D(l.TEXTURE_2D,e,0,0,f.width,f.height,s,c,f.data):d.texImage2D(l.TEXTURE_2D,e,u,f.width,f.height,0,s,c,f.data);t.generateMipmaps=!1}else g?(_&&d.texStorage2D(l.TEXTURE_2D,y,u,e.width,e.height),v&&be(t,e,s,c)):d.texImage2D(l.TEXTURE_2D,0,u,e.width,e.height,0,s,c,e.data);else if(t.isCompressedTexture)if(t.isCompressedArrayTexture){g&&_&&d.texStorage3D(l.TEXTURE_2D_ARRAY,y,u,h[0].width,h[0].height,e.depth);for(let n=0,r=h.length;n<r;n++)if(f=h[n],t.format!==1023)if(s!==null)if(g){if(v)if(t.layerUpdates.size>0){let e=eo(f.width,f.height,t.format,t.type);for(let r of t.layerUpdates){let t=f.data.subarray(r*e/f.data.BYTES_PER_ELEMENT,(r+1)*e/f.data.BYTES_PER_ELEMENT);d.compressedTexSubImage3D(l.TEXTURE_2D_ARRAY,n,0,0,r,f.width,f.height,1,s,t)}t.clearLayerUpdates()}else d.compressedTexSubImage3D(l.TEXTURE_2D_ARRAY,n,0,0,0,f.width,f.height,e.depth,s,f.data)}else d.compressedTexImage3D(l.TEXTURE_2D_ARRAY,n,u,f.width,f.height,e.depth,0,f.data,0,0);else L(`WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`);else g?v&&d.texSubImage3D(l.TEXTURE_2D_ARRAY,n,0,0,0,f.width,f.height,e.depth,s,c,f.data):d.texImage3D(l.TEXTURE_2D_ARRAY,n,u,f.width,f.height,e.depth,0,s,c,f.data)}else{g&&_&&d.texStorage2D(l.TEXTURE_2D,y,u,h[0].width,h[0].height);for(let e=0,n=h.length;e<n;e++)f=h[e],t.format===1023?g?v&&d.texSubImage2D(l.TEXTURE_2D,e,0,0,f.width,f.height,s,c,f.data):d.texImage2D(l.TEXTURE_2D,e,u,f.width,f.height,0,s,c,f.data):s===null?L(`WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`):g?v&&d.compressedTexSubImage2D(l.TEXTURE_2D,e,0,0,f.width,f.height,s,f.data):d.compressedTexImage2D(l.TEXTURE_2D,e,u,f.width,f.height,0,f.data)}else if(t.isDataArrayTexture)if(g){if(_&&d.texStorage3D(l.TEXTURE_2D_ARRAY,y,u,e.width,e.height,e.depth),v)if(t.layerUpdates.size>0){let n=eo(e.width,e.height,t.format,t.type);for(let r of t.layerUpdates){let t=e.data.subarray(r*n/e.data.BYTES_PER_ELEMENT,(r+1)*n/e.data.BYTES_PER_ELEMENT);d.texSubImage3D(l.TEXTURE_2D_ARRAY,0,0,0,r,e.width,e.height,1,s,c,t)}t.clearLayerUpdates()}else d.texSubImage3D(l.TEXTURE_2D_ARRAY,0,0,0,0,e.width,e.height,e.depth,s,c,e.data)}else d.texImage3D(l.TEXTURE_2D_ARRAY,0,u,e.width,e.height,e.depth,0,s,c,e.data);else if(t.isData3DTexture)g?(_&&d.texStorage3D(l.TEXTURE_3D,y,u,e.width,e.height,e.depth),v&&d.texSubImage3D(l.TEXTURE_3D,0,0,0,0,e.width,e.height,e.depth,s,c,e.data)):d.texImage3D(l.TEXTURE_3D,0,u,e.width,e.height,e.depth,0,s,c,e.data);else if(t.isFramebufferTexture){if(_)if(g)d.texStorage2D(l.TEXTURE_2D,y,u,e.width,e.height);else{let t=e.width,n=e.height;for(let e=0;e<y;e++)d.texImage2D(l.TEXTURE_2D,e,u,t,n,0,s,c,null),t>>=1,n>>=1}}else if(t.isHTMLTexture){if(`texElementImage2D`in l){let n=l.canvas;if(n.hasAttribute(`layoutsubtree`)||n.setAttribute(`layoutsubtree`,`true`),e.parentNode!==n){n.appendChild(e),b.add(t),n.onpaint=e=>{let t=e.changedElements;for(let e of b)t.includes(e.image)&&(e.needsUpdate=!0)},n.requestPaint();return}if(l.texElementImage2D.length===3)l.texElementImage2D(l.TEXTURE_2D,l.RGBA8,e);else{let t=l.RGBA,n=l.RGBA,r=l.UNSIGNED_BYTE;l.texElementImage2D(l.TEXTURE_2D,0,t,n,r,e)}l.texParameteri(l.TEXTURE_2D,l.TEXTURE_MIN_FILTER,l.LINEAR),l.texParameteri(l.TEXTURE_2D,l.TEXTURE_WRAP_S,l.CLAMP_TO_EDGE),l.texParameteri(l.TEXTURE_2D,l.TEXTURE_WRAP_T,l.CLAMP_TO_EDGE)}}else if(h.length>0){if(g&&_){let e=Ie(h[0]);d.texStorage2D(l.TEXTURE_2D,y,u,e.width,e.height)}for(let e=0,t=h.length;e<t;e++)f=h[e],g?v&&d.texSubImage2D(l.TEXTURE_2D,e,0,0,s,c,f):d.texImage2D(l.TEXTURE_2D,e,u,s,c,f);t.generateMipmaps=!1}else if(g){if(_){let t=Ie(e);d.texStorage2D(l.TEXTURE_2D,y,u,t.width,t.height)}v&&d.texSubImage2D(l.TEXTURE_2D,0,0,0,s,c,e)}else d.texImage2D(l.TEXTURE_2D,0,u,s,c,e);D(t)&&ee(r),o.__version=a.version,t.onUpdate&&t.onUpdate(t)}e.__version=t.version}function Se(e,t,n){if(t.image.length!==6)return;let r=ve(e,t),i=t.source;d.bindTexture(l.TEXTURE_CUBE_MAP,e.__webglTexture,l.TEXTURE0+n);let a=f.get(i);if(i.version!==a.__version||r===!0){d.activeTexture(l.TEXTURE0+n);let e=yt.getPrimaries(yt.workingColorSpace),o=t.colorSpace===``?null:yt.getPrimaries(t.colorSpace),s=t.colorSpace===``||e===o?l.NONE:l.BROWSER_DEFAULT_WEBGL;d.pixelStorei(l.UNPACK_FLIP_Y_WEBGL,t.flipY),d.pixelStorei(l.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t.premultiplyAlpha),d.pixelStorei(l.UNPACK_ALIGNMENT,t.unpackAlignment),d.pixelStorei(l.UNPACK_COLORSPACE_CONVERSION_WEBGL,s);let c=t.isCompressedTexture||t.image[0].isCompressedTexture,u=t.image[0]&&t.image[0].isDataTexture,f=[];for(let e=0;e<6;e++)!c&&!u?f[e]=T(t.image[e],!0,p.maxCubemapSize):f[e]=u?t.image[e].image:t.image[e],f[e]=Fe(t,f[e]);let h=f[0],g=m.convert(t.format,t.colorSpace),_=m.convert(t.type),v=k(t.internalFormat,g,_,t.normalized,t.colorSpace),y=t.isVideoTexture!==!0,b=a.__version===void 0||r===!0,x=i.dataReady,S=A(t,h);_e(l.TEXTURE_CUBE_MAP,t);let C;if(c){y&&b&&d.texStorage2D(l.TEXTURE_CUBE_MAP,S,v,h.width,h.height);for(let e=0;e<6;e++){C=f[e].mipmaps;for(let n=0;n<C.length;n++){let r=C[n];t.format===1023?y?x&&d.texSubImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,n,0,0,r.width,r.height,g,_,r.data):d.texImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,n,v,r.width,r.height,0,g,_,r.data):g===null?L(`WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()`):y?x&&d.compressedTexSubImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,n,0,0,r.width,r.height,g,r.data):d.compressedTexImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,n,v,r.width,r.height,0,r.data)}}}else{if(C=t.mipmaps,y&&b){C.length>0&&S++;let e=Ie(f[0]);d.texStorage2D(l.TEXTURE_CUBE_MAP,S,v,e.width,e.height)}for(let e=0;e<6;e++)if(u){y?x&&d.texSubImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,0,0,0,f[e].width,f[e].height,g,_,f[e].data):d.texImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,0,v,f[e].width,f[e].height,0,g,_,f[e].data);for(let t=0;t<C.length;t++){let n=C[t].image[e].image;y?x&&d.texSubImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,t+1,0,0,n.width,n.height,g,_,n.data):d.texImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,t+1,v,n.width,n.height,0,g,_,n.data)}}else{y?x&&d.texSubImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,0,0,0,g,_,f[e]):d.texImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,0,v,g,_,f[e]);for(let t=0;t<C.length;t++){let n=C[t];y?x&&d.texSubImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,t+1,0,0,g,_,n.image[e]):d.texImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,t+1,v,g,_,n.image[e])}}}D(t)&&ee(l.TEXTURE_CUBE_MAP),a.__version=i.version,t.onUpdate&&t.onUpdate(t)}e.__version=t.version}function Ce(e,t,n,r,i,a){let o=m.convert(n.format,n.colorSpace),s=m.convert(n.type),c=k(n.internalFormat,o,s,n.normalized,n.colorSpace),u=f.get(t),p=f.get(n);if(p.__renderTarget=t,!u.__hasExternalTextures){let e=Math.max(1,t.width>>a),n=Math.max(1,t.height>>a);i===l.TEXTURE_3D||i===l.TEXTURE_2D_ARRAY?d.texImage3D(i,a,c,e,n,t.depth,0,o,s,null):d.texImage2D(i,a,c,e,n,0,o,s,null)}d.bindFramebuffer(l.FRAMEBUFFER,e),Pe(t)?g.framebufferTexture2DMultisampleEXT(l.FRAMEBUFFER,r,i,p.__webglTexture,0,Ne(t)):(i===l.TEXTURE_2D||i>=l.TEXTURE_CUBE_MAP_POSITIVE_X&&i<=l.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&l.framebufferTexture2D(l.FRAMEBUFFER,r,i,p.__webglTexture,a),d.bindFramebuffer(l.FRAMEBUFFER,null)}function we(e,t,n){if(l.bindRenderbuffer(l.RENDERBUFFER,e),t.depthBuffer){let r=t.depthTexture,i=r&&r.isDepthTexture?r.type:null,a=te(t.stencilBuffer,i),o=t.stencilBuffer?l.DEPTH_STENCIL_ATTACHMENT:l.DEPTH_ATTACHMENT;Pe(t)?g.renderbufferStorageMultisampleEXT(l.RENDERBUFFER,Ne(t),a,t.width,t.height):n?l.renderbufferStorageMultisample(l.RENDERBUFFER,Ne(t),a,t.width,t.height):l.renderbufferStorage(l.RENDERBUFFER,a,t.width,t.height),l.framebufferRenderbuffer(l.FRAMEBUFFER,o,l.RENDERBUFFER,e)}else{let e=t.textures;for(let r=0;r<e.length;r++){let i=e[r],a=m.convert(i.format,i.colorSpace),o=m.convert(i.type),s=k(i.internalFormat,a,o,i.normalized,i.colorSpace);Pe(t)?g.renderbufferStorageMultisampleEXT(l.RENDERBUFFER,Ne(t),s,t.width,t.height):n?l.renderbufferStorageMultisample(l.RENDERBUFFER,Ne(t),s,t.width,t.height):l.renderbufferStorage(l.RENDERBUFFER,s,t.width,t.height)}}l.bindRenderbuffer(l.RENDERBUFFER,null)}function Te(e,t,n){let r=t.isWebGLCubeRenderTarget===!0;if(d.bindFramebuffer(l.FRAMEBUFFER,e),!(t.depthTexture&&t.depthTexture.isDepthTexture))throw Error(`THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.`);let i=f.get(t.depthTexture);if(i.__renderTarget=t,(!i.__webglTexture||t.depthTexture.image.width!==t.width||t.depthTexture.image.height!==t.height)&&(t.depthTexture.image.width=t.width,t.depthTexture.image.height=t.height,t.depthTexture.needsUpdate=!0),r){if(i.__webglInit===void 0&&(i.__webglInit=!0,t.depthTexture.addEventListener(`dispose`,j)),i.__webglTexture===void 0){i.__webglTexture=l.createTexture(),d.bindTexture(l.TEXTURE_CUBE_MAP,i.__webglTexture),_e(l.TEXTURE_CUBE_MAP,t.depthTexture);let e=m.convert(t.depthTexture.format),n=m.convert(t.depthTexture.type),r;t.depthTexture.format===1026?r=l.DEPTH_COMPONENT24:t.depthTexture.format===1027&&(r=l.DEPTH24_STENCIL8);for(let i=0;i<6;i++)l.texImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+i,0,r,t.width,t.height,0,e,n,null)}}else N(t.depthTexture,0);let a=i.__webglTexture,o=Ne(t),s=r?l.TEXTURE_CUBE_MAP_POSITIVE_X+n:l.TEXTURE_2D,c=t.depthTexture.format===1027?l.DEPTH_STENCIL_ATTACHMENT:l.DEPTH_ATTACHMENT;if(t.depthTexture.format===1026)Pe(t)?g.framebufferTexture2DMultisampleEXT(l.FRAMEBUFFER,c,s,a,0,o):l.framebufferTexture2D(l.FRAMEBUFFER,c,s,a,0);else if(t.depthTexture.format===1027)Pe(t)?g.framebufferTexture2DMultisampleEXT(l.FRAMEBUFFER,c,s,a,0,o):l.framebufferTexture2D(l.FRAMEBUFFER,c,s,a,0);else throw Error(`THREE.WebGLTextures: Unknown depthTexture format.`)}function Ee(e){let t=f.get(e),n=e.isWebGLCubeRenderTarget===!0;if(t.__boundDepthTexture!==e.depthTexture){let n=e.depthTexture;if(t.__depthDisposeCallback&&t.__depthDisposeCallback(),n){let e=()=>{delete t.__boundDepthTexture,delete t.__depthDisposeCallback,n.removeEventListener(`dispose`,e)};n.addEventListener(`dispose`,e),t.__depthDisposeCallback=e}t.__boundDepthTexture=n}if(e.depthTexture&&!t.__autoAllocateDepthBuffer)if(n)for(let n=0;n<6;n++)Te(t.__webglFramebuffer[n],e,n);else{let n=e.texture.mipmaps;n&&n.length>0?Te(t.__webglFramebuffer[0],e,0):Te(t.__webglFramebuffer,e,0)}else if(n){t.__webglDepthbuffer=[];for(let n=0;n<6;n++)if(d.bindFramebuffer(l.FRAMEBUFFER,t.__webglFramebuffer[n]),t.__webglDepthbuffer[n]===void 0)t.__webglDepthbuffer[n]=l.createRenderbuffer(),we(t.__webglDepthbuffer[n],e,!1);else{let r=e.stencilBuffer?l.DEPTH_STENCIL_ATTACHMENT:l.DEPTH_ATTACHMENT,i=t.__webglDepthbuffer[n];l.bindRenderbuffer(l.RENDERBUFFER,i),l.framebufferRenderbuffer(l.FRAMEBUFFER,r,l.RENDERBUFFER,i)}}else{let n=e.texture.mipmaps;if(n&&n.length>0?d.bindFramebuffer(l.FRAMEBUFFER,t.__webglFramebuffer[0]):d.bindFramebuffer(l.FRAMEBUFFER,t.__webglFramebuffer),t.__webglDepthbuffer===void 0)t.__webglDepthbuffer=l.createRenderbuffer(),we(t.__webglDepthbuffer,e,!1);else{let n=e.stencilBuffer?l.DEPTH_STENCIL_ATTACHMENT:l.DEPTH_ATTACHMENT,r=t.__webglDepthbuffer;l.bindRenderbuffer(l.RENDERBUFFER,r),l.framebufferRenderbuffer(l.FRAMEBUFFER,n,l.RENDERBUFFER,r)}}d.bindFramebuffer(l.FRAMEBUFFER,null)}function De(e,t,n){let r=f.get(e);t!==void 0&&Ce(r.__webglFramebuffer,e,e.texture,l.COLOR_ATTACHMENT0,l.TEXTURE_2D,0),n!==void 0&&Ee(e)}function Oe(e){let t=e.texture,n=f.get(e),r=f.get(t);e.addEventListener(`dispose`,ne);let i=e.textures,a=e.isWebGLCubeRenderTarget===!0,o=i.length>1;if(o||(r.__webglTexture===void 0&&(r.__webglTexture=l.createTexture()),r.__version=t.version,h.memory.textures++),a){n.__webglFramebuffer=[];for(let e=0;e<6;e++)if(t.mipmaps&&t.mipmaps.length>0){n.__webglFramebuffer[e]=[];for(let r=0;r<t.mipmaps.length;r++)n.__webglFramebuffer[e][r]=l.createFramebuffer()}else n.__webglFramebuffer[e]=l.createFramebuffer()}else{if(t.mipmaps&&t.mipmaps.length>0){n.__webglFramebuffer=[];for(let e=0;e<t.mipmaps.length;e++)n.__webglFramebuffer[e]=l.createFramebuffer()}else n.__webglFramebuffer=l.createFramebuffer();if(o)for(let e=0,t=i.length;e<t;e++){let t=f.get(i[e]);t.__webglTexture===void 0&&(t.__webglTexture=l.createTexture(),h.memory.textures++)}if(e.samples>0&&Pe(e)===!1){n.__webglMultisampledFramebuffer=l.createFramebuffer(),n.__webglColorRenderbuffer=[],d.bindFramebuffer(l.FRAMEBUFFER,n.__webglMultisampledFramebuffer);for(let t=0;t<i.length;t++){let r=i[t];n.__webglColorRenderbuffer[t]=l.createRenderbuffer(),l.bindRenderbuffer(l.RENDERBUFFER,n.__webglColorRenderbuffer[t]);let a=m.convert(r.format,r.colorSpace),o=m.convert(r.type),s=k(r.internalFormat,a,o,r.normalized,r.colorSpace,e.isXRRenderTarget===!0),c=Ne(e);l.renderbufferStorageMultisample(l.RENDERBUFFER,c,s,e.width,e.height),l.framebufferRenderbuffer(l.FRAMEBUFFER,l.COLOR_ATTACHMENT0+t,l.RENDERBUFFER,n.__webglColorRenderbuffer[t])}l.bindRenderbuffer(l.RENDERBUFFER,null),e.depthBuffer&&(n.__webglDepthRenderbuffer=l.createRenderbuffer(),we(n.__webglDepthRenderbuffer,e,!0)),d.bindFramebuffer(l.FRAMEBUFFER,null)}}if(a){d.bindTexture(l.TEXTURE_CUBE_MAP,r.__webglTexture),_e(l.TEXTURE_CUBE_MAP,t);for(let r=0;r<6;r++)if(t.mipmaps&&t.mipmaps.length>0)for(let i=0;i<t.mipmaps.length;i++)Ce(n.__webglFramebuffer[r][i],e,t,l.COLOR_ATTACHMENT0,l.TEXTURE_CUBE_MAP_POSITIVE_X+r,i);else Ce(n.__webglFramebuffer[r],e,t,l.COLOR_ATTACHMENT0,l.TEXTURE_CUBE_MAP_POSITIVE_X+r,0);D(t)&&ee(l.TEXTURE_CUBE_MAP),d.unbindTexture()}else if(o){for(let t=0,r=i.length;t<r;t++){let r=i[t],a=f.get(r),o=l.TEXTURE_2D;(e.isWebGL3DRenderTarget||e.isWebGLArrayRenderTarget)&&(o=e.isWebGL3DRenderTarget?l.TEXTURE_3D:l.TEXTURE_2D_ARRAY),d.bindTexture(o,a.__webglTexture),_e(o,r),Ce(n.__webglFramebuffer,e,r,l.COLOR_ATTACHMENT0+t,o,0),D(r)&&ee(o)}d.unbindTexture()}else{let i=l.TEXTURE_2D;if((e.isWebGL3DRenderTarget||e.isWebGLArrayRenderTarget)&&(i=e.isWebGL3DRenderTarget?l.TEXTURE_3D:l.TEXTURE_2D_ARRAY),d.bindTexture(i,r.__webglTexture),_e(i,t),t.mipmaps&&t.mipmaps.length>0)for(let r=0;r<t.mipmaps.length;r++)Ce(n.__webglFramebuffer[r],e,t,l.COLOR_ATTACHMENT0,i,r);else Ce(n.__webglFramebuffer,e,t,l.COLOR_ATTACHMENT0,i,0);D(t)&&ee(i),d.unbindTexture()}e.depthBuffer&&Ee(e)}function ke(e){let t=e.textures;for(let n=0,r=t.length;n<r;n++){let r=t[n];if(D(r)){let t=O(e),n=f.get(r).__webglTexture;d.bindTexture(t,n),ee(t),d.unbindTexture()}}}let Ae=[],je=[];function Me(e){if(e.samples>0){if(Pe(e)===!1){let t=e.textures,n=e.width,r=e.height,i=l.COLOR_BUFFER_BIT,a=e.stencilBuffer?l.DEPTH_STENCIL_ATTACHMENT:l.DEPTH_ATTACHMENT,o=f.get(e),s=t.length>1;if(s)for(let e=0;e<t.length;e++)d.bindFramebuffer(l.FRAMEBUFFER,o.__webglMultisampledFramebuffer),l.framebufferRenderbuffer(l.FRAMEBUFFER,l.COLOR_ATTACHMENT0+e,l.RENDERBUFFER,null),d.bindFramebuffer(l.FRAMEBUFFER,o.__webglFramebuffer),l.framebufferTexture2D(l.DRAW_FRAMEBUFFER,l.COLOR_ATTACHMENT0+e,l.TEXTURE_2D,null,0);d.bindFramebuffer(l.READ_FRAMEBUFFER,o.__webglMultisampledFramebuffer);let c=e.texture.mipmaps;c&&c.length>0?d.bindFramebuffer(l.DRAW_FRAMEBUFFER,o.__webglFramebuffer[0]):d.bindFramebuffer(l.DRAW_FRAMEBUFFER,o.__webglFramebuffer);for(let c=0;c<t.length;c++){if(e.resolveDepthBuffer&&(e.depthBuffer&&(i|=l.DEPTH_BUFFER_BIT),e.stencilBuffer&&e.resolveStencilBuffer&&(i|=l.STENCIL_BUFFER_BIT)),s){l.framebufferRenderbuffer(l.READ_FRAMEBUFFER,l.COLOR_ATTACHMENT0,l.RENDERBUFFER,o.__webglColorRenderbuffer[c]);let e=f.get(t[c]).__webglTexture;l.framebufferTexture2D(l.DRAW_FRAMEBUFFER,l.COLOR_ATTACHMENT0,l.TEXTURE_2D,e,0)}l.blitFramebuffer(0,0,n,r,0,0,n,r,i,l.NEAREST),_===!0&&(Ae.length=0,je.length=0,Ae.push(l.COLOR_ATTACHMENT0+c),e.depthBuffer&&e.resolveDepthBuffer===!1&&(Ae.push(a),je.push(a),l.invalidateFramebuffer(l.DRAW_FRAMEBUFFER,je)),l.invalidateFramebuffer(l.READ_FRAMEBUFFER,Ae))}if(d.bindFramebuffer(l.READ_FRAMEBUFFER,null),d.bindFramebuffer(l.DRAW_FRAMEBUFFER,null),s)for(let e=0;e<t.length;e++){d.bindFramebuffer(l.FRAMEBUFFER,o.__webglMultisampledFramebuffer),l.framebufferRenderbuffer(l.FRAMEBUFFER,l.COLOR_ATTACHMENT0+e,l.RENDERBUFFER,o.__webglColorRenderbuffer[e]);let n=f.get(t[e]).__webglTexture;d.bindFramebuffer(l.FRAMEBUFFER,o.__webglFramebuffer),l.framebufferTexture2D(l.DRAW_FRAMEBUFFER,l.COLOR_ATTACHMENT0+e,l.TEXTURE_2D,n,0)}d.bindFramebuffer(l.DRAW_FRAMEBUFFER,o.__webglMultisampledFramebuffer)}else if(e.depthBuffer&&e.resolveDepthBuffer===!1&&_){let t=e.stencilBuffer?l.DEPTH_STENCIL_ATTACHMENT:l.DEPTH_ATTACHMENT;l.invalidateFramebuffer(l.DRAW_FRAMEBUFFER,[t])}}}function Ne(e){return Math.min(p.maxSamples,e.samples)}function Pe(e){let t=f.get(e);return e.samples>0&&u.has(`WEBGL_multisampled_render_to_texture`)===!0&&t.__useRenderToTexture!==!1}function P(e){let t=h.render.frame;y.get(e)!==t&&(y.set(e,t),e.update())}function Fe(e,t){let n=e.colorSpace,r=e.format,i=e.type;return e.isCompressedTexture===!0||e.isVideoTexture===!0||n!==`srgb-linear`&&n!==``&&(yt.getTransfer(n)===`srgb`?(r!==1023||i!==1009)&&L(`WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.`):R(`WebGLTextures: Unsupported texture color space:`,n)),t}function Ie(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement?(v.width=e.naturalWidth||e.width,v.height=e.naturalHeight||e.height):typeof VideoFrame<`u`&&e instanceof VideoFrame?(v.width=e.displayWidth,v.height=e.displayHeight):(v.width=e.width,v.height=e.height),v}this.allocateTextureUnit=le,this.resetTextureUnits=oe,this.getTextureUnits=se,this.setTextureUnits=ce,this.setTexture2D=N,this.setTexture2DArray=de,this.setTexture3D=fe,this.setTextureCube=pe,this.rebindTextures=De,this.setupRenderTarget=Oe,this.updateRenderTargetMipmap=ke,this.updateMultisampleRenderTarget=Me,this.setupDepthRenderbuffer=Ee,this.setupFrameBufferTexture=Ce,this.useMultisampledRTT=Pe,this.isReversedDepthBuffer=function(){return d.buffers.depth.getReversed()}}function ol(e,t){function n(n,r=``){let i,a=yt.getTransfer(r);if(n===1009)return e.UNSIGNED_BYTE;if(n===1017)return e.UNSIGNED_SHORT_4_4_4_4;if(n===1018)return e.UNSIGNED_SHORT_5_5_5_1;if(n===35902)return e.UNSIGNED_INT_5_9_9_9_REV;if(n===35899)return e.UNSIGNED_INT_10F_11F_11F_REV;if(n===1010)return e.BYTE;if(n===1011)return e.SHORT;if(n===1012)return e.UNSIGNED_SHORT;if(n===1013)return e.INT;if(n===1014)return e.UNSIGNED_INT;if(n===1015)return e.FLOAT;if(n===1016)return e.HALF_FLOAT;if(n===1021)return e.ALPHA;if(n===1022)return e.RGB;if(n===1023)return e.RGBA;if(n===1026)return e.DEPTH_COMPONENT;if(n===1027)return e.DEPTH_STENCIL;if(n===1028)return e.RED;if(n===1029)return e.RED_INTEGER;if(n===1030)return e.RG;if(n===1031)return e.RG_INTEGER;if(n===1033)return e.RGBA_INTEGER;if(n===33776||n===33777||n===33778||n===33779)if(a===`srgb`)if(i=t.get(`WEBGL_compressed_texture_s3tc_srgb`),i!==null){if(n===33776)return i.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(i=t.get(`WEBGL_compressed_texture_s3tc`),i!==null){if(n===33776)return i.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===35840||n===35841||n===35842||n===35843)if(i=t.get(`WEBGL_compressed_texture_pvrtc`),i!==null){if(n===35840)return i.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===35841)return i.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===35842)return i.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===35843)return i.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===36196||n===37492||n===37496||n===37488||n===37489||n===37490||n===37491)if(i=t.get(`WEBGL_compressed_texture_etc`),i!==null){if(n===36196||n===37492)return a===`srgb`?i.COMPRESSED_SRGB8_ETC2:i.COMPRESSED_RGB8_ETC2;if(n===37496)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:i.COMPRESSED_RGBA8_ETC2_EAC;if(n===37488)return i.COMPRESSED_R11_EAC;if(n===37489)return i.COMPRESSED_SIGNED_R11_EAC;if(n===37490)return i.COMPRESSED_RG11_EAC;if(n===37491)return i.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===37808||n===37809||n===37810||n===37811||n===37812||n===37813||n===37814||n===37815||n===37816||n===37817||n===37818||n===37819||n===37820||n===37821)if(i=t.get(`WEBGL_compressed_texture_astc`),i!==null){if(n===37808)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:i.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===37809)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:i.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===37810)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:i.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===37811)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:i.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===37812)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:i.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===37813)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:i.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===37814)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:i.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===37815)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:i.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===37816)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:i.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===37817)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:i.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===37818)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:i.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===37819)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:i.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===37820)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:i.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===37821)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:i.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===36492||n===36494||n===36495)if(i=t.get(`EXT_texture_compression_bptc`),i!==null){if(n===36492)return a===`srgb`?i.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:i.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===36494)return i.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===36495)return i.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===36283||n===36284||n===36285||n===36286)if(i=t.get(`EXT_texture_compression_rgtc`),i!==null){if(n===36283)return i.COMPRESSED_RED_RGTC1_EXT;if(n===36284)return i.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===36285)return i.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===36286)return i.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===1020?e.UNSIGNED_INT_24_8:e[n]===void 0?null:e[n]}return{convert:n}}var sl=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,cl=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,ll=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new Li(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new ea({vertexShader:sl,fragmentShader:cl,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new ti(new Gi(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},ul=class extends nt{constructor(e,t){super();let n=this,r=null,i=1,a=null,o=`local-floor`,s=1,c=null,u=null,d=null,f=null,p=null,h=null,g=typeof XRWebGLBinding<`u`,_=new ll,v={},b=t.getContextAttributes(),x=null,S=null,C=[],D=[],ee=new z,O=null,k=new Na;k.viewport=new At;let te=new Na;te.viewport=new At;let A=[k,te],j=new Va,ne=null,re=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(e){let t=C[e];return t===void 0&&(t=new fn,C[e]=t),t.getTargetRaySpace()},this.getControllerGrip=function(e){let t=C[e];return t===void 0&&(t=new fn,C[e]=t),t.getGripSpace()},this.getHand=function(e){let t=C[e];return t===void 0&&(t=new fn,C[e]=t),t.getHandSpace()};function M(e){let t=D.indexOf(e.inputSource);if(t===-1)return;let n=C[t];n!==void 0&&(n.update(e.inputSource,e.frame,c||a),n.dispatchEvent({type:e.type,data:e.inputSource}))}function ie(){r.removeEventListener(`select`,M),r.removeEventListener(`selectstart`,M),r.removeEventListener(`selectend`,M),r.removeEventListener(`squeeze`,M),r.removeEventListener(`squeezestart`,M),r.removeEventListener(`squeezeend`,M),r.removeEventListener(`end`,ie),r.removeEventListener(`inputsourceschange`,ae);for(let e=0;e<C.length;e++){let t=D[e];t!==null&&(D[e]=null,C[e].disconnect(t))}ne=null,re=null,_.reset();for(let e in v)delete v[e];e.setRenderTarget(x),p=null,f=null,d=null,r=null,S=null,fe.stop(),n.isPresenting=!1,e.setPixelRatio(O),e.setSize(ee.width,ee.height,!1),n.dispatchEvent({type:`sessionend`})}this.setFramebufferScaleFactor=function(e){i=e,n.isPresenting===!0&&L(`WebXRManager: Cannot change framebuffer scale while presenting.`)},this.setReferenceSpaceType=function(e){o=e,n.isPresenting===!0&&L(`WebXRManager: Cannot change reference space type while presenting.`)},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(e){c=e},this.getBaseLayer=function(){return f===null?p:f},this.getBinding=function(){return d===null&&g&&(d=new XRWebGLBinding(r,t)),d},this.getFrame=function(){return h},this.getSession=function(){return r},this.setSession=async function(u){if(r=u,r!==null){if(x=e.getRenderTarget(),r.addEventListener(`select`,M),r.addEventListener(`selectstart`,M),r.addEventListener(`selectend`,M),r.addEventListener(`squeeze`,M),r.addEventListener(`squeezestart`,M),r.addEventListener(`squeezeend`,M),r.addEventListener(`end`,ie),r.addEventListener(`inputsourceschange`,ae),b.xrCompatible!==!0&&await t.makeXRCompatible(),O=e.getPixelRatio(),e.getSize(ee),g&&`createProjectionLayer`in XRWebGLBinding.prototype){let n=null,a=null,o=null;b.depth&&(o=b.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,n=b.stencil?E:T,a=b.stencil?y:m);let s={colorFormat:t.RGBA8,depthFormat:o,scaleFactor:i};d=this.getBinding(),f=d.createProjectionLayer(s),r.updateRenderState({layers:[f]}),e.setPixelRatio(1),e.setSize(f.textureWidth,f.textureHeight,!1),S=new Mt(f.textureWidth,f.textureHeight,{format:w,type:l,depthTexture:new Fi(f.textureWidth,f.textureHeight,a,void 0,void 0,void 0,void 0,void 0,void 0,n),stencilBuffer:b.stencil,colorSpace:e.outputColorSpace,samples:b.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}else{let n={antialias:b.antialias,alpha:!0,depth:b.depth,stencil:b.stencil,framebufferScaleFactor:i};p=new XRWebGLLayer(r,t,n),r.updateRenderState({baseLayer:p}),e.setPixelRatio(1),e.setSize(p.framebufferWidth,p.framebufferHeight,!1),S=new Mt(p.framebufferWidth,p.framebufferHeight,{format:w,type:l,colorSpace:e.outputColorSpace,stencilBuffer:b.stencil,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1})}S.isXRRenderTarget=!0,this.setFoveation(s),c=null,a=await r.requestReferenceSpace(o),fe.setContext(r),fe.start(),n.isPresenting=!0,n.dispatchEvent({type:`sessionstart`})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return _.getDepthTexture()};function ae(e){for(let t=0;t<e.removed.length;t++){let n=e.removed[t],r=D.indexOf(n);r>=0&&(D[r]=null,C[r].disconnect(n))}for(let t=0;t<e.added.length;t++){let n=e.added[t],r=D.indexOf(n);if(r===-1){for(let e=0;e<C.length;e++)if(e>=D.length){D.push(n),r=e;break}else if(D[e]===null){D[e]=n,r=e;break}if(r===-1)break}let i=C[r];i&&i.connect(n)}}let oe=new B,se=new B;function ce(e,t,n){oe.setFromMatrixPosition(t.matrixWorld),se.setFromMatrixPosition(n.matrixWorld);let r=oe.distanceTo(se),i=t.projectionMatrix.elements,a=n.projectionMatrix.elements,o=i[14]/(i[10]-1),s=i[14]/(i[10]+1),c=(i[9]+1)/i[5],l=(i[9]-1)/i[5],u=(i[8]-1)/i[0],d=(a[8]+1)/a[0],f=o*u,p=o*d,m=r/(-u+d),h=m*-u;if(t.matrixWorld.decompose(e.position,e.quaternion,e.scale),e.translateX(h),e.translateZ(m),e.matrixWorld.compose(e.position,e.quaternion,e.scale),e.matrixWorldInverse.copy(e.matrixWorld).invert(),i[10]===-1)e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse);else{let t=o+m,n=s+m,i=f-h,a=p+(r-h),u=c*s/n*t,d=l*s/n*t;e.projectionMatrix.makePerspective(i,a,u,d,t,n),e.projectionMatrixInverse.copy(e.projectionMatrix).invert()}}function le(e,t){t===null?e.matrixWorld.copy(e.matrix):e.matrixWorld.multiplyMatrices(t.matrixWorld,e.matrix),e.matrixWorldInverse.copy(e.matrixWorld).invert()}this.updateCamera=function(e){if(r===null)return;let t=e.near,n=e.far;_.texture!==null&&(_.depthNear>0&&(t=_.depthNear),_.depthFar>0&&(n=_.depthFar)),j.near=te.near=k.near=t,j.far=te.far=k.far=n,(ne!==j.near||re!==j.far)&&(r.updateRenderState({depthNear:j.near,depthFar:j.far}),ne=j.near,re=j.far),j.layers.mask=e.layers.mask|6,k.layers.mask=j.layers.mask&-5,te.layers.mask=j.layers.mask&-3;let i=e.parent,a=j.cameras;le(j,i);for(let e=0;e<a.length;e++)le(a[e],i);a.length===2?ce(j,k,te):j.projectionMatrix.copy(k.projectionMatrix),ue(e,j,i)};function ue(e,t,n){n===null?e.matrix.copy(t.matrixWorld):(e.matrix.copy(n.matrixWorld),e.matrix.invert(),e.matrix.multiply(t.matrixWorld)),e.matrix.decompose(e.position,e.quaternion,e.scale),e.updateMatrixWorld(!0),e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse),e.isPerspectiveCamera&&(e.fov=at*2*Math.atan(1/e.projectionMatrix.elements[5]),e.zoom=1)}this.getCamera=function(){return j},this.getFoveation=function(){if(!(f===null&&p===null))return s},this.setFoveation=function(e){s=e,f!==null&&(f.fixedFoveation=e),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=e)},this.hasDepthSensing=function(){return _.texture!==null},this.getDepthSensingMesh=function(){return _.getMesh(j)},this.getCameraTexture=function(e){return v[e]};let N=null;function de(t,i){if(u=i.getViewerPose(c||a),h=i,u!==null){let t=u.views;p!==null&&(e.setRenderTargetFramebuffer(S,p.framebuffer),e.setRenderTarget(S));let i=!1;t.length!==j.cameras.length&&(j.cameras.length=0,i=!0);for(let n=0;n<t.length;n++){let r=t[n],a=null;if(p!==null)a=p.getViewport(r);else{let t=d.getViewSubImage(f,r);a=t.viewport,n===0&&(e.setRenderTargetTextures(S,t.colorTexture,t.depthStencilTexture),e.setRenderTarget(S))}let o=A[n];o===void 0&&(o=new Na,o.layers.enable(n),o.viewport=new At,A[n]=o),o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.projectionMatrix.fromArray(r.projectionMatrix),o.projectionMatrixInverse.copy(o.projectionMatrix).invert(),o.viewport.set(a.x,a.y,a.width,a.height),n===0&&(j.matrix.copy(o.matrix),j.matrix.decompose(j.position,j.quaternion,j.scale)),i===!0&&j.cameras.push(o)}let a=r.enabledFeatures;if(a&&a.includes(`depth-sensing`)&&r.depthUsage==`gpu-optimized`&&g){d=n.getBinding();let e=d.getDepthInformation(t[0]);e&&e.isValid&&e.texture&&_.init(e,r.renderState)}if(a&&a.includes(`camera-access`)&&g){e.state.unbindTexture(),d=n.getBinding();for(let e=0;e<t.length;e++){let n=t[e].camera;if(n){let e=v[n];e||(e=new Li,v[n]=e);let t=d.getCameraImage(n);e.sourceTexture=t}}}}for(let e=0;e<C.length;e++){let t=D[e],n=C[e];t!==null&&n!==void 0&&n.update(t,i,c||a)}N&&N(t,i),i.detectedPlanes&&n.dispatchEvent({type:`planesdetected`,data:i}),h=null}let fe=new no;fe.setAnimationLoop(de),this.setAnimationLoop=function(e){N=e},this.dispose=function(){}}},dl=new Ft,fl=new V;fl.set(-1,0,0,0,1,0,0,0,1);function pl(e,t){function n(e,t){e.matrixAutoUpdate===!0&&e.updateMatrix(),t.value.copy(e.matrix)}function r(t,n){n.color.getRGB(t.fogColor.value,Xi(e)),n.isFog?(t.fogNear.value=n.near,t.fogFar.value=n.far):n.isFogExp2&&(t.fogDensity.value=n.density)}function i(e,t,n,r,i){t.isNodeMaterial?t.uniformsNeedUpdate=!1:t.isMeshBasicMaterial?a(e,t):t.isMeshLambertMaterial?(a(e,t),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)):t.isMeshToonMaterial?(a(e,t),d(e,t)):t.isMeshPhongMaterial?(a(e,t),u(e,t),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)):t.isMeshStandardMaterial?(a(e,t),f(e,t),t.isMeshPhysicalMaterial&&p(e,t,i)):t.isMeshMatcapMaterial?(a(e,t),m(e,t)):t.isMeshDepthMaterial?a(e,t):t.isMeshDistanceMaterial?(a(e,t),h(e,t)):t.isMeshNormalMaterial?a(e,t):t.isLineBasicMaterial?(o(e,t),t.isLineDashedMaterial&&s(e,t)):t.isPointsMaterial?c(e,t,n,r):t.isSpriteMaterial?l(e,t):t.isShadowMaterial?(e.color.value.copy(t.color),e.opacity.value=t.opacity):t.isShaderMaterial&&(t.uniformsNeedUpdate=!1)}function a(e,r){e.opacity.value=r.opacity,r.color&&e.diffuse.value.copy(r.color),r.emissive&&e.emissive.value.copy(r.emissive).multiplyScalar(r.emissiveIntensity),r.map&&(e.map.value=r.map,n(r.map,e.mapTransform)),r.alphaMap&&(e.alphaMap.value=r.alphaMap,n(r.alphaMap,e.alphaMapTransform)),r.bumpMap&&(e.bumpMap.value=r.bumpMap,n(r.bumpMap,e.bumpMapTransform),e.bumpScale.value=r.bumpScale,r.side===1&&(e.bumpScale.value*=-1)),r.normalMap&&(e.normalMap.value=r.normalMap,n(r.normalMap,e.normalMapTransform),e.normalScale.value.copy(r.normalScale),r.side===1&&e.normalScale.value.negate()),r.displacementMap&&(e.displacementMap.value=r.displacementMap,n(r.displacementMap,e.displacementMapTransform),e.displacementScale.value=r.displacementScale,e.displacementBias.value=r.displacementBias),r.emissiveMap&&(e.emissiveMap.value=r.emissiveMap,n(r.emissiveMap,e.emissiveMapTransform)),r.specularMap&&(e.specularMap.value=r.specularMap,n(r.specularMap,e.specularMapTransform)),r.alphaTest>0&&(e.alphaTest.value=r.alphaTest);let i=t.get(r),a=i.envMap,o=i.envMapRotation;a&&(e.envMap.value=a,e.envMapRotation.value.setFromMatrix4(dl.makeRotationFromEuler(o)).transpose(),a.isCubeTexture&&a.isRenderTargetTexture===!1&&e.envMapRotation.value.premultiply(fl),e.reflectivity.value=r.reflectivity,e.ior.value=r.ior,e.refractionRatio.value=r.refractionRatio),r.lightMap&&(e.lightMap.value=r.lightMap,e.lightMapIntensity.value=r.lightMapIntensity,n(r.lightMap,e.lightMapTransform)),r.aoMap&&(e.aoMap.value=r.aoMap,e.aoMapIntensity.value=r.aoMapIntensity,n(r.aoMap,e.aoMapTransform))}function o(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform))}function s(e,t){e.dashSize.value=t.dashSize,e.totalSize.value=t.dashSize+t.gapSize,e.scale.value=t.scale}function c(e,t,r,i){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.size.value=t.size*r,e.scale.value=i*.5,t.map&&(e.map.value=t.map,n(t.map,e.uvTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function l(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.rotation.value=t.rotation,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function u(e,t){e.specular.value.copy(t.specular),e.shininess.value=Math.max(t.shininess,1e-4)}function d(e,t){t.gradientMap&&(e.gradientMap.value=t.gradientMap)}function f(e,t){e.metalness.value=t.metalness,t.metalnessMap&&(e.metalnessMap.value=t.metalnessMap,n(t.metalnessMap,e.metalnessMapTransform)),e.roughness.value=t.roughness,t.roughnessMap&&(e.roughnessMap.value=t.roughnessMap,n(t.roughnessMap,e.roughnessMapTransform)),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)}function p(e,t,r){e.ior.value=t.ior,t.sheen>0&&(e.sheenColor.value.copy(t.sheenColor).multiplyScalar(t.sheen),e.sheenRoughness.value=t.sheenRoughness,t.sheenColorMap&&(e.sheenColorMap.value=t.sheenColorMap,n(t.sheenColorMap,e.sheenColorMapTransform)),t.sheenRoughnessMap&&(e.sheenRoughnessMap.value=t.sheenRoughnessMap,n(t.sheenRoughnessMap,e.sheenRoughnessMapTransform))),t.clearcoat>0&&(e.clearcoat.value=t.clearcoat,e.clearcoatRoughness.value=t.clearcoatRoughness,t.clearcoatMap&&(e.clearcoatMap.value=t.clearcoatMap,n(t.clearcoatMap,e.clearcoatMapTransform)),t.clearcoatRoughnessMap&&(e.clearcoatRoughnessMap.value=t.clearcoatRoughnessMap,n(t.clearcoatRoughnessMap,e.clearcoatRoughnessMapTransform)),t.clearcoatNormalMap&&(e.clearcoatNormalMap.value=t.clearcoatNormalMap,n(t.clearcoatNormalMap,e.clearcoatNormalMapTransform),e.clearcoatNormalScale.value.copy(t.clearcoatNormalScale),t.side===1&&e.clearcoatNormalScale.value.negate())),t.dispersion>0&&(e.dispersion.value=t.dispersion),t.iridescence>0&&(e.iridescence.value=t.iridescence,e.iridescenceIOR.value=t.iridescenceIOR,e.iridescenceThicknessMinimum.value=t.iridescenceThicknessRange[0],e.iridescenceThicknessMaximum.value=t.iridescenceThicknessRange[1],t.iridescenceMap&&(e.iridescenceMap.value=t.iridescenceMap,n(t.iridescenceMap,e.iridescenceMapTransform)),t.iridescenceThicknessMap&&(e.iridescenceThicknessMap.value=t.iridescenceThicknessMap,n(t.iridescenceThicknessMap,e.iridescenceThicknessMapTransform))),t.transmission>0&&(e.transmission.value=t.transmission,e.transmissionSamplerMap.value=r.texture,e.transmissionSamplerSize.value.set(r.width,r.height),t.transmissionMap&&(e.transmissionMap.value=t.transmissionMap,n(t.transmissionMap,e.transmissionMapTransform)),e.thickness.value=t.thickness,t.thicknessMap&&(e.thicknessMap.value=t.thicknessMap,n(t.thicknessMap,e.thicknessMapTransform)),e.attenuationDistance.value=t.attenuationDistance,e.attenuationColor.value.copy(t.attenuationColor)),t.anisotropy>0&&(e.anisotropyVector.value.set(t.anisotropy*Math.cos(t.anisotropyRotation),t.anisotropy*Math.sin(t.anisotropyRotation)),t.anisotropyMap&&(e.anisotropyMap.value=t.anisotropyMap,n(t.anisotropyMap,e.anisotropyMapTransform))),e.specularIntensity.value=t.specularIntensity,e.specularColor.value.copy(t.specularColor),t.specularColorMap&&(e.specularColorMap.value=t.specularColorMap,n(t.specularColorMap,e.specularColorMapTransform)),t.specularIntensityMap&&(e.specularIntensityMap.value=t.specularIntensityMap,n(t.specularIntensityMap,e.specularIntensityMapTransform))}function m(e,t){t.matcap&&(e.matcap.value=t.matcap)}function h(e,n){let r=t.get(n).light;e.referencePosition.value.setFromMatrixPosition(r.matrixWorld),e.nearDistance.value=r.shadow.camera.near,e.farDistance.value=r.shadow.camera.far}return{refreshFogUniforms:r,refreshMaterialUniforms:i}}function ml(e,t,n,r){let i={},a={},o=[],s=e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS);function c(e,t){let n=t.program;r.uniformBlockBinding(e,n)}function l(e,n){let o=i[e.id];o===void 0&&(g(e),o=u(e),i[e.id]=o,e.addEventListener(`dispose`,v));let s=n.program;r.updateUBOMapping(e,s);let c=t.render.frame;a[e.id]!==c&&(f(e),a[e.id]=c)}function u(t){let n=d();t.__bindingPointIndex=n;let r=e.createBuffer(),i=t.__size,a=t.usage;return e.bindBuffer(e.UNIFORM_BUFFER,r),e.bufferData(e.UNIFORM_BUFFER,i,a),e.bindBuffer(e.UNIFORM_BUFFER,null),e.bindBufferBase(e.UNIFORM_BUFFER,n,r),r}function d(){for(let e=0;e<s;e++)if(o.indexOf(e)===-1)return o.push(e),e;return R(`WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached.`),0}function f(t){let n=i[t.id],r=t.uniforms,a=t.__cache;e.bindBuffer(e.UNIFORM_BUFFER,n);for(let e=0,t=r.length;e<t;e++){let t=r[e];if(Array.isArray(t))for(let n=0,r=t.length;n<r;n++)p(t[n],e,n,a);else p(t,e,0,a)}e.bindBuffer(e.UNIFORM_BUFFER,null)}function p(t,n,r,i){if(h(t,n,r,i)===!0){let n=t.__offset,r=t.value;if(Array.isArray(r)){let e=0;for(let n=0;n<r.length;n++){let i=r[n],a=_(i);m(i,t.__data,e),typeof i!=`number`&&typeof i!=`boolean`&&!i.isMatrix3&&!ArrayBuffer.isView(i)&&(e+=a.storage/Float32Array.BYTES_PER_ELEMENT)}}else m(r,t.__data,0);e.bufferSubData(e.UNIFORM_BUFFER,n,t.__data)}}function m(e,t,n){typeof e==`number`||typeof e==`boolean`?t[0]=e:e.isMatrix3?(t[0]=e.elements[0],t[1]=e.elements[1],t[2]=e.elements[2],t[3]=0,t[4]=e.elements[3],t[5]=e.elements[4],t[6]=e.elements[5],t[7]=0,t[8]=e.elements[6],t[9]=e.elements[7],t[10]=e.elements[8],t[11]=0):ArrayBuffer.isView(e)?t.set(new e.constructor(e.buffer,e.byteOffset,t.length)):e.toArray(t,n)}function h(e,t,n,r){let i=e.value,a=t+`_`+n;if(r[a]===void 0)return typeof i==`number`||typeof i==`boolean`?r[a]=i:ArrayBuffer.isView(i)?r[a]=i.slice():r[a]=i.clone(),!0;{let e=r[a];if(typeof i==`number`||typeof i==`boolean`){if(e!==i)return r[a]=i,!0}else if(ArrayBuffer.isView(i))return!0;else if(e.equals(i)===!1)return e.copy(i),!0}return!1}function g(e){let t=e.uniforms,n=0;for(let e=0,r=t.length;e<r;e++){let r=Array.isArray(t[e])?t[e]:[t[e]];for(let e=0,t=r.length;e<t;e++){let t=r[e],i=Array.isArray(t.value)?t.value:[t.value];for(let e=0,r=i.length;e<r;e++){let r=i[e],a=_(r),o=n%16,s=o%a.boundary,c=o+s;n+=s,c!==0&&16-c<a.storage&&(n+=16-c),t.__data=new Float32Array(a.storage/Float32Array.BYTES_PER_ELEMENT),t.__offset=n,n+=a.storage}}}let r=n%16;return r>0&&(n+=16-r),e.__size=n,e.__cache={},this}function _(e){let t={boundary:0,storage:0};return typeof e==`number`||typeof e==`boolean`?(t.boundary=4,t.storage=4):e.isVector2?(t.boundary=8,t.storage=8):e.isVector3||e.isColor?(t.boundary=16,t.storage=12):e.isVector4?(t.boundary=16,t.storage=16):e.isMatrix3?(t.boundary=48,t.storage=48):e.isMatrix4?(t.boundary=64,t.storage=64):e.isTexture?L(`WebGLRenderer: Texture samplers can not be part of an uniforms group.`):ArrayBuffer.isView(e)?(t.boundary=16,t.storage=e.byteLength):L(`WebGLRenderer: Unsupported uniform value type.`,e),t}function v(t){let n=t.target;n.removeEventListener(`dispose`,v);let r=o.indexOf(n.__bindingPointIndex);o.splice(r,1),e.deleteBuffer(i[n.id]),delete i[n.id],delete a[n.id]}function y(){for(let t in i)e.deleteBuffer(i[t]);o=[],i={},a={}}return{bind:c,update:l,dispose:y}}var hl=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),gl=null;function _l(){return gl===null&&(gl=new ii(hl,16,16,O,g),gl.name=`DFG_LUT`,gl.minFilter=o,gl.magFilter=o,gl.wrapS=t,gl.wrapT=t,gl.generateMipmaps=!1,gl.needsUpdate=!0),gl}var vl=class{constructor(e={}){let{canvas:t=Ye(),context:n=null,depth:r=!0,stencil:i=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:s=!0,preserveDrawingBuffer:u=!1,powerPreference:d=`default`,failIfMajorPerformanceCaveat:p=!1,reversedDepthBuffer:h=!1,outputBufferType:b=l}=e;this.isWebGLRenderer=!0;let x;if(n!==null){if(typeof WebGLRenderingContext<`u`&&n instanceof WebGLRenderingContext)throw Error(`THREE.WebGLRenderer: WebGL 1 is not supported since r163.`);x=n.getContextAttributes().alpha}else x=a;let S=b,C=new Set([te,k,ee]),w=new Set([l,m,f,y,_,v]),T=new Uint32Array(4),E=new Int32Array(4),D=new B,O=null,A=null,j=[],ne=[],re=null;this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=0,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let M=this,ie=!1,ae=null,oe=null,se=null,ce=null;this._outputColorSpace=ze;let le=0,ue=0,N=null,de=-1,fe=null,pe=new At,me=new At,he=null,ge=new H(0),_e=0,ve=t.width,ye=t.height,be=1,xe=null,Se=null,Ce=new At(0,0,ve,ye),we=new At(0,0,ve,ye),Te=!1,Ee=new fi,De=!1,Oe=!1,ke=new Ft,Ae=new B,je=new At,Me={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Ne=!1;function Pe(){return N===null?be:1}let P=n;function Fe(e,n){return t.getContext(e,n)}try{let e={alpha:!0,depth:r,stencil:i,antialias:o,premultipliedAlpha:s,preserveDrawingBuffer:u,powerPreference:d,failIfMajorPerformanceCaveat:p};if(`setAttribute`in t&&t.setAttribute(`data-engine`,`three.js r185`),t.addEventListener(`webglcontextlost`,ut,!1),t.addEventListener(`webglcontextrestored`,dt,!1),t.addEventListener(`webglcontextcreationerror`,z,!1),P===null){let t=`webgl2`;if(P=Fe(t,e),P===null)throw Fe(t)?Error(`THREE.WebGLRenderer: Error creating WebGL context with your selected attributes.`):Error(`THREE.WebGLRenderer: Error creating WebGL context.`)}}catch(e){throw R(`WebGLRenderer: `+e.message),e}let Ie,Le,F,Re,I,Be,Ve,He,Ue,We,Ke,qe,Je,Xe,Qe,$e,tt,nt,rt,it,at,ot,st;function ct(){Ie=new Io(P),Ie.init(),at=new ol(P,Ie),Le=new fo(P,Ie,e,at),F=new il(P,Ie),Le.reversedDepthBuffer&&h&&F.buffers.depth.setReversed(!0),oe=P.createFramebuffer(),se=P.createFramebuffer(),ce=P.createFramebuffer(),Re=new zo(P),I=new Rc,Be=new al(P,Ie,F,I,Le,at,Re),Ve=new Fo(M),He=new ro(P),ot=new lo(P,He),Ue=new Lo(P,He,Re,ot),We=new Vo(P,Ue,He,ot,Re),nt=new Bo(P,Le,Be),Qe=new po(I),Ke=new Lc(M,Ve,Ie,Le,ot,Qe),qe=new pl(M,I),Je=new Hc,Xe=new Yc(Ie),tt=new co(M,Ve,F,We,x,s),$e=new rl(M,We,Le),st=new ml(P,Re,Le,F),rt=new uo(P,Ie,Re),it=new Ro(P,Ie,Re),Re.programs=Ke.programs,M.capabilities=Le,M.extensions=Ie,M.properties=I,M.renderLists=Je,M.shadowMap=$e,M.state=F,M.info=Re}ct(),S!==1009&&(re=new Uo(S,t.width,t.height,o,r,i));let lt=new ul(M,P);this.xr=lt,this.getContext=function(){return P},this.getContextAttributes=function(){return P.getContextAttributes()},this.forceContextLoss=function(){let e=Ie.get(`WEBGL_lose_context`);e&&e.loseContext()},this.forceContextRestore=function(){let e=Ie.get(`WEBGL_lose_context`);e&&e.restoreContext()},this.getPixelRatio=function(){return be},this.setPixelRatio=function(e){e!==void 0&&(be=e,this.setSize(ve,ye,!1))},this.getSize=function(e){return e.set(ve,ye)},this.setSize=function(e,n,r=!0){if(lt.isPresenting){L(`WebGLRenderer: Can't change size while VR device is presenting.`);return}ve=e,ye=n,t.width=Math.floor(e*be),t.height=Math.floor(n*be),r===!0&&(t.style.width=e+`px`,t.style.height=n+`px`),re!==null&&re.setSize(t.width,t.height),this.setViewport(0,0,e,n)},this.getDrawingBufferSize=function(e){return e.set(ve*be,ye*be).floor()},this.setDrawingBufferSize=function(e,n,r){ve=e,ye=n,be=r,t.width=Math.floor(e*r),t.height=Math.floor(n*r),this.setViewport(0,0,e,n)},this.setEffects=function(e){if(S===1009){R(`WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.`);return}if(e){for(let t=0;t<e.length;t++)if(e[t].isOutputPass===!0){L(`WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.`);break}}re.setEffects(e||[])},this.getCurrentViewport=function(e){return e.copy(pe)},this.getViewport=function(e){return e.copy(Ce)},this.setViewport=function(e,t,n,r){e.isVector4?Ce.set(e.x,e.y,e.z,e.w):Ce.set(e,t,n,r),F.viewport(pe.copy(Ce).multiplyScalar(be).round())},this.getScissor=function(e){return e.copy(we)},this.setScissor=function(e,t,n,r){e.isVector4?we.set(e.x,e.y,e.z,e.w):we.set(e,t,n,r),F.scissor(me.copy(we).multiplyScalar(be).round())},this.getScissorTest=function(){return Te},this.setScissorTest=function(e){F.setScissorTest(Te=e)},this.setOpaqueSort=function(e){xe=e},this.setTransparentSort=function(e){Se=e},this.getClearColor=function(e){return e.copy(tt.getClearColor())},this.setClearColor=function(){tt.setClearColor(...arguments)},this.getClearAlpha=function(){return tt.getClearAlpha()},this.setClearAlpha=function(){tt.setClearAlpha(...arguments)},this.clear=function(e=!0,t=!0,n=!0){let r=0;if(e){let e=!1;if(N!==null){let t=N.texture.format;e=C.has(t)}if(e){let e=N.texture.type,t=w.has(e),n=tt.getClearColor(),r=tt.getClearAlpha(),i=n.r,a=n.g,o=n.b;t?(T[0]=i,T[1]=a,T[2]=o,T[3]=r,P.clearBufferuiv(P.COLOR,0,T)):(E[0]=i,E[1]=a,E[2]=o,E[3]=r,P.clearBufferiv(P.COLOR,0,E))}else r|=P.COLOR_BUFFER_BIT}t&&(r|=P.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),n&&(r|=P.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),r!==0&&P.clear(r)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(e){e.setRenderer(this),ae=e},this.dispose=function(){t.removeEventListener(`webglcontextlost`,ut,!1),t.removeEventListener(`webglcontextrestored`,dt,!1),t.removeEventListener(`webglcontextcreationerror`,z,!1),tt.dispose(),Je.dispose(),Xe.dispose(),I.dispose(),Ve.dispose(),We.dispose(),ot.dispose(),st.dispose(),Ke.dispose(),lt.dispose(),lt.removeEventListener(`sessionstart`,_t),lt.removeEventListener(`sessionend`,vt),bt.stop()};function ut(e){e.preventDefault(),Ze(`WebGLRenderer: Context Lost.`),ie=!0}function dt(){Ze(`WebGLRenderer: Context Restored.`),ie=!1;let e=Re.autoReset,t=$e.enabled,n=$e.autoUpdate,r=$e.needsUpdate,i=$e.type;ct(),Re.autoReset=e,$e.enabled=t,$e.autoUpdate=n,$e.needsUpdate=r,$e.type=i}function z(e){R(`WebGLRenderer: A WebGL context could not be created. Reason: `,e.statusMessage)}function ft(e){let t=e.target;t.removeEventListener(`dispose`,ft),pt(t)}function pt(e){mt(e),I.remove(e)}function mt(e){let t=I.get(e).programs;t!==void 0&&(t.forEach(function(e){Ke.releaseProgram(e)}),e.isShaderMaterial&&Ke.releaseShaderCache(e))}this.renderBufferDirect=function(e,t,n,r,i,a){t===null&&(t=Me);let o=i.isMesh&&i.matrixWorld.determinantAffine()<0,s=jt(e,t,n,r,i);F.setMaterial(r,o);let c=n.index,l=1;if(r.wireframe===!0){if(c=Ue.getWireframeAttribute(n),c===void 0)return;l=2}let u=n.drawRange,d=n.attributes.position,f=u.start*l,p=(u.start+u.count)*l;a!==null&&(f=Math.max(f,a.start*l),p=Math.min(p,(a.start+a.count)*l)),c===null?d!=null&&(f=Math.max(f,0),p=Math.min(p,d.count)):(f=Math.max(f,0),p=Math.min(p,c.count));let m=p-f;if(m<0||m===1/0)return;ot.setup(i,r,s,n,c);let h,g=rt;if(c!==null&&(h=He.get(c),g=it,g.setIndex(h)),i.isMesh)r.wireframe===!0?(F.setLineWidth(r.wireframeLinewidth*Pe()),g.setMode(P.LINES)):g.setMode(P.TRIANGLES);else if(i.isLine){let e=r.linewidth;e===void 0&&(e=1),F.setLineWidth(e*Pe()),i.isLineSegments?g.setMode(P.LINES):i.isLineLoop?g.setMode(P.LINE_LOOP):g.setMode(P.LINE_STRIP)}else i.isPoints?g.setMode(P.POINTS):i.isSprite&&g.setMode(P.TRIANGLES);if(i.isBatchedMesh)if(Ie.get(`WEBGL_multi_draw`))g.renderMultiDraw(i._multiDrawStarts,i._multiDrawCounts,i._multiDrawCount);else{let e=i._multiDrawStarts,t=i._multiDrawCounts,n=i._multiDrawCount,a=c?He.get(c).bytesPerElement:1,o=I.get(r).currentProgram.getUniforms();for(let r=0;r<n;r++)o.setValue(P,`_gl_DrawID`,r),g.render(e[r]/a,t[r])}else if(i.isInstancedMesh)g.renderInstances(f,m,i.count);else if(n.isInstancedBufferGeometry){let e=n._maxInstanceCount===void 0?1/0:n._maxInstanceCount,t=Math.min(n.instanceCount,e);g.renderInstances(f,m,t)}else g.render(f,m)};function V(e,t,n){e.transparent===!0&&e.side===2&&e.forceSinglePass===!1?(e.side=1,e.needsUpdate=!0,Et(e,t,n),e.side=0,e.needsUpdate=!0,Et(e,t,n),e.side=2):Et(e,t,n)}this.compile=function(e,t,n=null){n===null&&(n=e),A=Xe.get(n),A.init(t),ne.push(A),n.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(A.pushLight(e),e.castShadow&&A.pushShadow(e))}),e!==n&&e.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(A.pushLight(e),e.castShadow&&A.pushShadow(e))}),A.setupLights();let r=new Set;return e.traverse(function(e){if(!(e.isMesh||e.isPoints||e.isLine||e.isSprite))return;let t=e.material;if(t)if(Array.isArray(t))for(let i=0;i<t.length;i++){let a=t[i];V(a,n,e),r.add(a)}else V(t,n,e),r.add(t)}),A=ne.pop(),r},this.compileAsync=function(e,t,n=null){let r=this.compile(e,t,n);return new Promise(t=>{function n(){if(r.forEach(function(e){I.get(e).currentProgram.isReady()&&r.delete(e)}),r.size===0){t(e);return}setTimeout(n,10)}Ie.get(`KHR_parallel_shader_compile`)===null?setTimeout(n,10):n()})};let ht=null;function gt(e){ht&&ht(e)}function _t(){bt.stop()}function vt(){bt.start()}let bt=new no;bt.setAnimationLoop(gt),typeof self<`u`&&bt.setContext(self),this.setAnimationLoop=function(e){ht=e,lt.setAnimationLoop(e),e===null?bt.stop():bt.start()},lt.addEventListener(`sessionstart`,_t),lt.addEventListener(`sessionend`,vt),this.render=function(e,t){if(t!==void 0&&t.isCamera!==!0){R(`WebGLRenderer.render: camera is not an instance of THREE.Camera.`);return}if(ie===!0)return;ae!==null&&ae.renderStart(e,t);let n=lt.enabled===!0&&lt.isPresenting===!0,r=re!==null&&(N===null||n)&&re.begin(M,N);if(e.matrixWorldAutoUpdate===!0&&e.updateMatrixWorld(),t.parent===null&&t.matrixWorldAutoUpdate===!0&&t.updateMatrixWorld(),lt.enabled===!0&&lt.isPresenting===!0&&(re===null||re.isCompositing()===!1)&&(lt.cameraAutoUpdate===!0&&lt.updateCamera(t),t=lt.getCamera()),e.isScene===!0&&e.onBeforeRender(M,e,t,N),A=Xe.get(e,ne.length),A.init(t),A.state.textureUnits=Be.getTextureUnits(),ne.push(A),ke.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),Ee.setFromProjectionMatrix(ke,Ge,t.reversedDepth),Oe=this.localClippingEnabled,De=Qe.init(this.clippingPlanes,Oe),O=Je.get(e,j.length),O.init(),j.push(O),lt.enabled===!0&&lt.isPresenting===!0){let e=M.xr.getDepthSensingMesh();e!==null&&xt(e,t,-1/0,M.sortObjects)}xt(e,t,0,M.sortObjects),O.finish(),M.sortObjects===!0&&O.sort(xe,Se,t.reversedDepth),Ne=lt.enabled===!1||lt.isPresenting===!1||lt.hasDepthSensing()===!1,Ne&&tt.addToRenderList(O,e),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),De===!0&&Qe.beginShadows();let i=A.state.shadowsArray;if($e.render(i,e,t),De===!0&&Qe.endShadows(),(r&&re.hasRenderPass())===!1){let n=O.opaque,r=O.transmissive;if(A.setupLights(),t.isArrayCamera){let i=t.cameras;if(r.length>0)for(let t=0,a=i.length;t<a;t++){let a=i[t];Ct(n,r,e,a)}Ne&&tt.render(e);for(let t=0,n=i.length;t<n;t++){let n=i[t];St(O,e,n,n.viewport)}}else r.length>0&&Ct(n,r,e,t),Ne&&tt.render(e),St(O,e,t)}N!==null&&ue===0&&(Be.updateMultisampleRenderTarget(N),Be.updateRenderTargetMipmap(N)),r&&re.end(M),e.isScene===!0&&e.onAfterRender(M,e,t),ot.resetDefaultState(),de=-1,fe=null,ne.pop(),ne.length>0?(A=ne[ne.length-1],Be.setTextureUnits(A.state.textureUnits),De===!0&&Qe.setGlobalState(M.clippingPlanes,A.state.camera)):A=null,j.pop(),O=j.length>0?j[j.length-1]:null,ae!==null&&ae.renderEnd()};function xt(e,t,n,r){if(e.visible===!1)return;if(e.layers.test(t.layers)){if(e.isGroup)n=e.renderOrder;else if(e.isLOD)e.autoUpdate===!0&&e.update(t);else if(e.isLightProbeGrid)A.pushLightProbeGrid(e);else if(e.isLight)A.pushLight(e),e.castShadow&&A.pushShadow(e);else if(e.isSprite){if(!e.frustumCulled||Ee.intersectsSprite(e)){r&&je.setFromMatrixPosition(e.matrixWorld).applyMatrix4(ke);let t=We.update(e),i=e.material;i.visible&&O.push(e,t,i,n,je.z,null)}}else if((e.isMesh||e.isLine||e.isPoints)&&(!e.frustumCulled||Ee.intersectsObject(e))){let t=We.update(e),i=e.material;if(r&&(e.boundingSphere===void 0?(t.boundingSphere===null&&t.computeBoundingSphere(),je.copy(t.boundingSphere.center)):(e.boundingSphere===null&&e.computeBoundingSphere(),je.copy(e.boundingSphere.center)),je.applyMatrix4(e.matrixWorld).applyMatrix4(ke)),Array.isArray(i)){let r=t.groups;for(let a=0,o=r.length;a<o;a++){let o=r[a],s=i[o.materialIndex];s&&s.visible&&O.push(e,t,s,n,je.z,o)}}else i.visible&&O.push(e,t,i,n,je.z,null)}}let i=e.children;for(let e=0,a=i.length;e<a;e++)xt(i[e],t,n,r)}function St(e,t,n,r){let{opaque:i,transmissive:a,transparent:o}=e;A.setupLightsView(n),De===!0&&Qe.setGlobalState(M.clippingPlanes,n),r&&F.viewport(pe.copy(r)),i.length>0&&wt(i,t,n),a.length>0&&wt(a,t,n),o.length>0&&wt(o,t,n),F.buffers.depth.setTest(!0),F.buffers.depth.setMask(!0),F.buffers.color.setMask(!0),F.setPolygonOffset(!1)}function Ct(e,t,n,r){if((n.isScene===!0?n.overrideMaterial:null)!==null)return;if(A.state.transmissionRenderTarget[r.id]===void 0){let e=Ie.has(`EXT_color_buffer_half_float`)||Ie.has(`EXT_color_buffer_float`);A.state.transmissionRenderTarget[r.id]=new Mt(1,1,{generateMipmaps:!0,type:e?g:l,minFilter:c,samples:Math.max(4,Le.samples),stencilBuffer:i,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:yt.workingColorSpace})}let a=A.state.transmissionRenderTarget[r.id],o=r.viewport||pe;a.setSize(o.z*M.transmissionResolutionScale,o.w*M.transmissionResolutionScale);let s=M.getRenderTarget(),u=M.getActiveCubeFace(),d=M.getActiveMipmapLevel();M.setRenderTarget(a),M.getClearColor(ge),_e=M.getClearAlpha(),_e<1&&M.setClearColor(16777215,.5),M.clear(),Ne&&tt.render(n);let f=M.toneMapping;M.toneMapping=0;let p=r.viewport;if(r.viewport!==void 0&&(r.viewport=void 0),A.setupLightsView(r),De===!0&&Qe.setGlobalState(M.clippingPlanes,r),wt(e,n,r),Be.updateMultisampleRenderTarget(a),Be.updateRenderTargetMipmap(a),Ie.has(`WEBGL_multisampled_render_to_texture`)===!1){let e=!1;for(let i=0,a=t.length;i<a;i++){let{object:a,geometry:o,material:s,group:c}=t[i];if(s.side===2&&a.layers.test(r.layers)){let t=s.side;s.side=1,s.needsUpdate=!0,Tt(a,n,r,o,s,c),s.side=t,s.needsUpdate=!0,e=!0}}e===!0&&(Be.updateMultisampleRenderTarget(a),Be.updateRenderTargetMipmap(a))}M.setRenderTarget(s,u,d),M.setClearColor(ge,_e),p!==void 0&&(r.viewport=p),M.toneMapping=f}function wt(e,t,n){let r=t.isScene===!0?t.overrideMaterial:null;for(let i=0,a=e.length;i<a;i++){let a=e[i],{object:o,geometry:s,group:c}=a,l=a.material;l.allowOverride===!0&&r!==null&&(l=r),o.layers.test(n.layers)&&Tt(o,t,n,s,l,c)}}function Tt(e,t,n,r,i,a){e.onBeforeRender(M,t,n,r,i,a),e.modelViewMatrix.multiplyMatrices(n.matrixWorldInverse,e.matrixWorld),e.normalMatrix.getNormalMatrix(e.modelViewMatrix),i.onBeforeRender(M,t,n,r,e,a),i.transparent===!0&&i.side===2&&i.forceSinglePass===!1?(i.side=1,i.needsUpdate=!0,M.renderBufferDirect(n,t,r,i,e,a),i.side=0,i.needsUpdate=!0,M.renderBufferDirect(n,t,r,i,e,a),i.side=2):M.renderBufferDirect(n,t,r,i,e,a),e.onAfterRender(M,t,n,r,i,a)}function Et(e,t,n){t.isScene!==!0&&(t=Me);let r=I.get(e),i=A.state.lights,a=A.state.shadowsArray,o=i.state.version,s=Ke.getParameters(e,i.state,a,t,n,A.state.lightProbeGridArray),c=Ke.getProgramCacheKey(s),l=r.programs;r.environment=e.isMeshStandardMaterial||e.isMeshLambertMaterial||e.isMeshPhongMaterial?t.environment:null,r.fog=t.fog;let u=e.isMeshStandardMaterial||e.isMeshLambertMaterial&&!e.envMap||e.isMeshPhongMaterial&&!e.envMap;r.envMap=Ve.get(e.envMap||r.environment,u),r.envMapRotation=r.environment!==null&&e.envMap===null?t.environmentRotation:e.envMapRotation,l===void 0&&(e.addEventListener(`dispose`,ft),l=new Map,r.programs=l);let d=l.get(c);if(d!==void 0){if(r.currentProgram===d&&r.lightsStateVersion===o)return Ot(e,s),d}else s.uniforms=Ke.getUniforms(e),ae!==null&&e.isNodeMaterial&&ae.build(e,n,s),e.onBeforeCompile(s,M),d=Ke.acquireProgram(s,c),l.set(c,d),r.uniforms=s.uniforms;let f=r.uniforms;return(!e.isShaderMaterial&&!e.isRawShaderMaterial||e.clipping===!0)&&(f.clippingPlanes=Qe.uniform),Ot(e,s),r.needsLights=Pt(e),r.lightsStateVersion=o,r.needsLights&&(f.ambientLightColor.value=i.state.ambient,f.lightProbe.value=i.state.probe,f.directionalLights.value=i.state.directional,f.directionalLightShadows.value=i.state.directionalShadow,f.spotLights.value=i.state.spot,f.spotLightShadows.value=i.state.spotShadow,f.rectAreaLights.value=i.state.rectArea,f.ltc_1.value=i.state.rectAreaLTC1,f.ltc_2.value=i.state.rectAreaLTC2,f.pointLights.value=i.state.point,f.pointLightShadows.value=i.state.pointShadow,f.hemisphereLights.value=i.state.hemi,f.directionalShadowMatrix.value=i.state.directionalShadowMatrix,f.spotLightMatrix.value=i.state.spotLightMatrix,f.spotLightMap.value=i.state.spotLightMap,f.pointShadowMatrix.value=i.state.pointShadowMatrix),r.lightProbeGrid=A.state.lightProbeGridArray.length>0,r.currentProgram=d,r.uniformsList=null,d}function Dt(e){if(e.uniformsList===null){let t=e.currentProgram.getUniforms();e.uniformsList=Xs.seqWithValue(t.seq,e.uniforms)}return e.uniformsList}function Ot(e,t){let n=I.get(e);n.outputColorSpace=t.outputColorSpace,n.batching=t.batching,n.batchingColor=t.batchingColor,n.instancing=t.instancing,n.instancingColor=t.instancingColor,n.instancingMorph=t.instancingMorph,n.skinning=t.skinning,n.morphTargets=t.morphTargets,n.morphNormals=t.morphNormals,n.morphColors=t.morphColors,n.morphTargetsCount=t.morphTargetsCount,n.numClippingPlanes=t.numClippingPlanes,n.numIntersection=t.numClipIntersection,n.vertexAlphas=t.vertexAlphas,n.vertexTangents=t.vertexTangents,n.toneMapping=t.toneMapping}function kt(e,t){if(e.length===0)return null;if(e.length===1)return e[0].texture===null?null:e[0];D.setFromMatrixPosition(t.matrixWorld);for(let t=0,n=e.length;t<n;t++){let n=e[t];if(n.texture!==null&&n.boundingBox.containsPoint(D))return n}return null}function jt(e,t,n,r,i){t.isScene!==!0&&(t=Me),Be.resetTextureUnits();let a=t.fog,o=r.isMeshStandardMaterial||r.isMeshLambertMaterial||r.isMeshPhongMaterial?t.environment:null,s=N===null?M.outputColorSpace:N.isXRRenderTarget===!0?N.texture.colorSpace:yt.workingColorSpace,c=r.isMeshStandardMaterial||r.isMeshLambertMaterial&&!r.envMap||r.isMeshPhongMaterial&&!r.envMap,l=Ve.get(r.envMap||o,c),u=r.vertexColors===!0&&!!n.attributes.color&&n.attributes.color.itemSize===4,d=!!n.attributes.tangent&&(!!r.normalMap||r.anisotropy>0),f=!!n.morphAttributes.position,p=!!n.morphAttributes.normal,m=!!n.morphAttributes.color,h=0;r.toneMapped&&(N===null||N.isXRRenderTarget===!0)&&(h=M.toneMapping);let g=n.morphAttributes.position||n.morphAttributes.normal||n.morphAttributes.color,_=g===void 0?0:g.length,v=I.get(r),y=A.state.lights;if(De===!0&&(Oe===!0||e!==fe)){let t=e===fe&&r.id===de;Qe.setState(r,e,t)}let b=!1;r.version===v.__version?v.needsLights&&v.lightsStateVersion!==y.state.version?b=!0:v.outputColorSpace===s?i.isBatchedMesh&&v.batching===!1||!i.isBatchedMesh&&v.batching===!0||i.isBatchedMesh&&v.batchingColor===!0&&i.colorTexture===null||i.isBatchedMesh&&v.batchingColor===!1&&i.colorTexture!==null||i.isInstancedMesh&&v.instancing===!1||!i.isInstancedMesh&&v.instancing===!0||i.isSkinnedMesh&&v.skinning===!1||!i.isSkinnedMesh&&v.skinning===!0||i.isInstancedMesh&&v.instancingColor===!0&&i.instanceColor===null||i.isInstancedMesh&&v.instancingColor===!1&&i.instanceColor!==null||i.isInstancedMesh&&v.instancingMorph===!0&&i.morphTexture===null||i.isInstancedMesh&&v.instancingMorph===!1&&i.morphTexture!==null?b=!0:v.envMap===l?r.fog===!0&&v.fog!==a||v.numClippingPlanes!==void 0&&(v.numClippingPlanes!==Qe.numPlanes||v.numIntersection!==Qe.numIntersection)?b=!0:v.vertexAlphas===u&&v.vertexTangents===d&&v.morphTargets===f&&v.morphNormals===p&&v.morphColors===m&&v.toneMapping===h&&v.morphTargetsCount===_?!!v.lightProbeGrid!=A.state.lightProbeGridArray.length>0&&(b=!0):b=!0:b=!0:b=!0:(b=!0,v.__version=r.version);let x=v.currentProgram;b===!0&&(x=Et(r,t,i),ae&&r.isNodeMaterial&&ae.onUpdateProgram(r,x,v));let S=!1,C=!1,w=!1,T=x.getUniforms(),E=v.uniforms;if(F.useProgram(x.program)&&(S=!0,C=!0,w=!0),r.id!==de&&(de=r.id,C=!0),v.needsLights){let e=kt(A.state.lightProbeGridArray,i);v.lightProbeGrid!==e&&(v.lightProbeGrid=e,C=!0)}if(S||fe!==e){F.buffers.depth.getReversed()&&e.reversedDepth!==!0&&(e._reversedDepth=!0,e.updateProjectionMatrix()),T.setValue(P,`projectionMatrix`,e.projectionMatrix),T.setValue(P,`viewMatrix`,e.matrixWorldInverse);let t=T.map.cameraPosition;t!==void 0&&t.setValue(P,Ae.setFromMatrixPosition(e.matrixWorld)),Le.logarithmicDepthBuffer&&T.setValue(P,`logDepthBufFC`,2/(Math.log(e.far+1)/Math.LN2)),(r.isMeshPhongMaterial||r.isMeshToonMaterial||r.isMeshLambertMaterial||r.isMeshBasicMaterial||r.isMeshStandardMaterial||r.isShaderMaterial)&&T.setValue(P,`isOrthographic`,e.isOrthographicCamera===!0),fe!==e&&(fe=e,C=!0,w=!0)}if(v.needsLights&&(y.state.directionalShadowMap.length>0&&T.setValue(P,`directionalShadowMap`,y.state.directionalShadowMap,Be),y.state.spotShadowMap.length>0&&T.setValue(P,`spotShadowMap`,y.state.spotShadowMap,Be),y.state.pointShadowMap.length>0&&T.setValue(P,`pointShadowMap`,y.state.pointShadowMap,Be)),i.isSkinnedMesh){T.setOptional(P,i,`bindMatrix`),T.setOptional(P,i,`bindMatrixInverse`);let e=i.skeleton;e&&(e.boneTexture===null&&e.computeBoneTexture(),T.setValue(P,`boneTexture`,e.boneTexture,Be))}i.isBatchedMesh&&(T.setOptional(P,i,`batchingTexture`),T.setValue(P,`batchingTexture`,i._matricesTexture,Be),T.setOptional(P,i,`batchingIdTexture`),T.setValue(P,`batchingIdTexture`,i._indirectTexture,Be),T.setOptional(P,i,`batchingColorTexture`),i._colorsTexture!==null&&T.setValue(P,`batchingColorTexture`,i._colorsTexture,Be));let D=n.morphAttributes;if((D.position!==void 0||D.normal!==void 0||D.color!==void 0)&&nt.update(i,n,x),(C||v.receiveShadow!==i.receiveShadow)&&(v.receiveShadow=i.receiveShadow,T.setValue(P,`receiveShadow`,i.receiveShadow)),(r.isMeshStandardMaterial||r.isMeshLambertMaterial||r.isMeshPhongMaterial)&&r.envMap===null&&t.environment!==null&&(E.envMapIntensity.value=t.environmentIntensity),E.dfgLUT!==void 0&&(E.dfgLUT.value=_l()),C){if(T.setValue(P,`toneMappingExposure`,M.toneMappingExposure),v.needsLights&&Nt(E,w),a&&r.fog===!0&&qe.refreshFogUniforms(E,a),qe.refreshMaterialUniforms(E,r,be,ye,A.state.transmissionRenderTarget[e.id]),v.needsLights&&v.lightProbeGrid){let e=v.lightProbeGrid;E.probesSH.value=e.texture,E.probesMin.value.copy(e.boundingBox.min),E.probesMax.value.copy(e.boundingBox.max),E.probesResolution.value.copy(e.resolution)}Xs.upload(P,Dt(v),E,Be)}if(r.isShaderMaterial&&r.uniformsNeedUpdate===!0&&(Xs.upload(P,Dt(v),E,Be),r.uniformsNeedUpdate=!1),r.isSpriteMaterial&&T.setValue(P,`center`,i.center),T.setValue(P,`modelViewMatrix`,i.modelViewMatrix),T.setValue(P,`normalMatrix`,i.normalMatrix),T.setValue(P,`modelMatrix`,i.matrixWorld),r.uniformsGroups!==void 0){let e=r.uniformsGroups;for(let t=0,n=e.length;t<n;t++){let n=e[t];st.update(n,x),st.bind(n,x)}}return x}function Nt(e,t){e.ambientLightColor.needsUpdate=t,e.lightProbe.needsUpdate=t,e.directionalLights.needsUpdate=t,e.directionalLightShadows.needsUpdate=t,e.pointLights.needsUpdate=t,e.pointLightShadows.needsUpdate=t,e.spotLights.needsUpdate=t,e.spotLightShadows.needsUpdate=t,e.rectAreaLights.needsUpdate=t,e.hemisphereLights.needsUpdate=t}function Pt(e){return e.isMeshLambertMaterial||e.isMeshToonMaterial||e.isMeshPhongMaterial||e.isMeshStandardMaterial||e.isShadowMaterial||e.isShaderMaterial&&e.lights===!0}this.getActiveCubeFace=function(){return le},this.getActiveMipmapLevel=function(){return ue},this.getRenderTarget=function(){return N},this.setRenderTargetTextures=function(e,t,n){let r=I.get(e);r.__autoAllocateDepthBuffer=e.resolveDepthBuffer===!1,r.__autoAllocateDepthBuffer===!1&&(r.__useRenderToTexture=!1),I.get(e.texture).__webglTexture=t,I.get(e.depthTexture).__webglTexture=r.__autoAllocateDepthBuffer?void 0:n,r.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(e,t){let n=I.get(e);n.__webglFramebuffer=t,n.__useDefaultFramebuffer=t===void 0},this.setRenderTarget=function(e,t=0,n=0){N=e,le=t,ue=n;let r=null,i=!1,a=!1;if(e){let o=I.get(e);if(o.__useDefaultFramebuffer!==void 0){F.bindFramebuffer(P.FRAMEBUFFER,o.__webglFramebuffer),pe.copy(e.viewport),me.copy(e.scissor),he=e.scissorTest,F.viewport(pe),F.scissor(me),F.setScissorTest(he),de=-1;return}else if(o.__webglFramebuffer===void 0)Be.setupRenderTarget(e);else if(o.__hasExternalTextures)Be.rebindTextures(e,I.get(e.texture).__webglTexture,I.get(e.depthTexture).__webglTexture);else if(e.depthBuffer){let t=e.depthTexture;if(o.__boundDepthTexture!==t){if(t!==null&&I.has(t)&&(e.width!==t.image.width||e.height!==t.image.height))throw Error(`THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.`);Be.setupDepthRenderbuffer(e)}}let s=e.texture;(s.isData3DTexture||s.isDataArrayTexture||s.isCompressedArrayTexture)&&(a=!0);let c=I.get(e).__webglFramebuffer;e.isWebGLCubeRenderTarget?(r=Array.isArray(c[t])?c[t][n]:c[t],i=!0):r=e.samples>0&&Be.useMultisampledRTT(e)===!1?I.get(e).__webglMultisampledFramebuffer:Array.isArray(c)?c[n]:c,pe.copy(e.viewport),me.copy(e.scissor),he=e.scissorTest}else pe.copy(Ce).multiplyScalar(be).floor(),me.copy(we).multiplyScalar(be).floor(),he=Te;if(n!==0&&(r=oe),F.bindFramebuffer(P.FRAMEBUFFER,r)&&F.drawBuffers(e,r),F.viewport(pe),F.scissor(me),F.setScissorTest(he),i){let r=I.get(e.texture);P.framebufferTexture2D(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_CUBE_MAP_POSITIVE_X+t,r.__webglTexture,n)}else if(a){let r=t;for(let t=0;t<e.textures.length;t++){let i=I.get(e.textures[t]);P.framebufferTextureLayer(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0+t,i.__webglTexture,n,r)}}else if(e!==null&&n!==0){let t=I.get(e.texture);P.framebufferTexture2D(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_2D,t.__webglTexture,n)}de=-1},this.readRenderTargetPixels=function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget)){R(`WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);return}let c=I.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o]),c){F.bindFramebuffer(P.FRAMEBUFFER,c);try{let o=e.textures[s],c=o.format,l=o.type;if(e.textures.length>1&&P.readBuffer(P.COLOR_ATTACHMENT0+s),!Le.textureFormatReadable(c)){R(`WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.`);return}if(!Le.textureTypeReadable(l)){R(`WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.`);return}t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i&&P.readPixels(t,n,r,i,at.convert(c),at.convert(l),a)}finally{let e=N===null?null:I.get(N).__webglFramebuffer;F.bindFramebuffer(P.FRAMEBUFFER,e)}}},this.readRenderTargetPixelsAsync=async function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget))throw Error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);let c=I.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o]),c)if(t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i){F.bindFramebuffer(P.FRAMEBUFFER,c);let o=e.textures[s],l=o.format,u=o.type;if(e.textures.length>1&&P.readBuffer(P.COLOR_ATTACHMENT0+s),!Le.textureFormatReadable(l))throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.`);if(!Le.textureTypeReadable(u))throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.`);let d=P.createBuffer();P.bindBuffer(P.PIXEL_PACK_BUFFER,d),P.bufferData(P.PIXEL_PACK_BUFFER,a.byteLength,P.STREAM_READ),P.readPixels(t,n,r,i,at.convert(l),at.convert(u),0);let f=N===null?null:I.get(N).__webglFramebuffer;F.bindFramebuffer(P.FRAMEBUFFER,f);let p=P.fenceSync(P.SYNC_GPU_COMMANDS_COMPLETE,0);return P.flush(),await et(P,p,4),P.bindBuffer(P.PIXEL_PACK_BUFFER,d),P.getBufferSubData(P.PIXEL_PACK_BUFFER,0,a),P.deleteBuffer(d),P.deleteSync(p),a}else throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.`)},this.copyFramebufferToTexture=function(e,t=null,n=0){let r=2**-n,i=Math.floor(e.image.width*r),a=Math.floor(e.image.height*r),o=t===null?0:t.x,s=t===null?0:t.y;Be.setTexture2D(e,0),P.copyTexSubImage2D(P.TEXTURE_2D,n,0,0,o,s,i,a),F.unbindTexture()},this.copyTextureToTexture=function(e,t,n=null,r=null,i=0,a=0){let o,s,c,l,u,d,f,p,m,h=e.isCompressedTexture?e.mipmaps[a]:e.image;if(n!==null)o=n.max.x-n.min.x,s=n.max.y-n.min.y,c=n.isBox3?n.max.z-n.min.z:1,l=n.min.x,u=n.min.y,d=n.isBox3?n.min.z:0;else{let t=2**-i;o=Math.floor(h.width*t),s=Math.floor(h.height*t),c=e.isDataArrayTexture?h.depth:e.isData3DTexture?Math.floor(h.depth*t):1,l=0,u=0,d=0}r===null?(f=0,p=0,m=0):(f=r.x,p=r.y,m=r.z);let g=at.convert(t.format),_=at.convert(t.type),v;t.isData3DTexture?(Be.setTexture3D(t,0),v=P.TEXTURE_3D):t.isDataArrayTexture||t.isCompressedArrayTexture?(Be.setTexture2DArray(t,0),v=P.TEXTURE_2D_ARRAY):(Be.setTexture2D(t,0),v=P.TEXTURE_2D),F.activeTexture(P.TEXTURE0),F.pixelStorei(P.UNPACK_FLIP_Y_WEBGL,t.flipY),F.pixelStorei(P.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t.premultiplyAlpha),F.pixelStorei(P.UNPACK_ALIGNMENT,t.unpackAlignment);let y=F.getParameter(P.UNPACK_ROW_LENGTH),b=F.getParameter(P.UNPACK_IMAGE_HEIGHT),x=F.getParameter(P.UNPACK_SKIP_PIXELS),S=F.getParameter(P.UNPACK_SKIP_ROWS),C=F.getParameter(P.UNPACK_SKIP_IMAGES);F.pixelStorei(P.UNPACK_ROW_LENGTH,h.width),F.pixelStorei(P.UNPACK_IMAGE_HEIGHT,h.height),F.pixelStorei(P.UNPACK_SKIP_PIXELS,l),F.pixelStorei(P.UNPACK_SKIP_ROWS,u),F.pixelStorei(P.UNPACK_SKIP_IMAGES,d);let w=e.isDataArrayTexture||e.isData3DTexture,T=t.isDataArrayTexture||t.isData3DTexture;if(e.isDepthTexture){let n=I.get(e),r=I.get(t),h=I.get(n.__renderTarget),g=I.get(r.__renderTarget);F.bindFramebuffer(P.READ_FRAMEBUFFER,h.__webglFramebuffer),F.bindFramebuffer(P.DRAW_FRAMEBUFFER,g.__webglFramebuffer);for(let n=0;n<c;n++)w&&(P.framebufferTextureLayer(P.READ_FRAMEBUFFER,P.COLOR_ATTACHMENT0,I.get(e).__webglTexture,i,d+n),P.framebufferTextureLayer(P.DRAW_FRAMEBUFFER,P.COLOR_ATTACHMENT0,I.get(t).__webglTexture,a,m+n)),P.blitFramebuffer(l,u,o,s,f,p,o,s,P.DEPTH_BUFFER_BIT,P.NEAREST);F.bindFramebuffer(P.READ_FRAMEBUFFER,null),F.bindFramebuffer(P.DRAW_FRAMEBUFFER,null)}else if(i!==0||e.isRenderTargetTexture||I.has(e)){let n=I.get(e),r=I.get(t);F.bindFramebuffer(P.READ_FRAMEBUFFER,se),F.bindFramebuffer(P.DRAW_FRAMEBUFFER,ce);for(let e=0;e<c;e++)w?P.framebufferTextureLayer(P.READ_FRAMEBUFFER,P.COLOR_ATTACHMENT0,n.__webglTexture,i,d+e):P.framebufferTexture2D(P.READ_FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_2D,n.__webglTexture,i),T?P.framebufferTextureLayer(P.DRAW_FRAMEBUFFER,P.COLOR_ATTACHMENT0,r.__webglTexture,a,m+e):P.framebufferTexture2D(P.DRAW_FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_2D,r.__webglTexture,a),i===0?T?P.copyTexSubImage3D(v,a,f,p,m+e,l,u,o,s):P.copyTexSubImage2D(v,a,f,p,l,u,o,s):P.blitFramebuffer(l,u,o,s,f,p,o,s,P.COLOR_BUFFER_BIT,P.NEAREST);F.bindFramebuffer(P.READ_FRAMEBUFFER,null),F.bindFramebuffer(P.DRAW_FRAMEBUFFER,null)}else T?e.isDataTexture||e.isData3DTexture?P.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h.data):t.isCompressedArrayTexture?P.compressedTexSubImage3D(v,a,f,p,m,o,s,c,g,h.data):P.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h):e.isDataTexture?P.texSubImage2D(P.TEXTURE_2D,a,f,p,o,s,g,_,h.data):e.isCompressedTexture?P.compressedTexSubImage2D(P.TEXTURE_2D,a,f,p,h.width,h.height,g,h.data):P.texSubImage2D(P.TEXTURE_2D,a,f,p,o,s,g,_,h);F.pixelStorei(P.UNPACK_ROW_LENGTH,y),F.pixelStorei(P.UNPACK_IMAGE_HEIGHT,b),F.pixelStorei(P.UNPACK_SKIP_PIXELS,x),F.pixelStorei(P.UNPACK_SKIP_ROWS,S),F.pixelStorei(P.UNPACK_SKIP_IMAGES,C),a===0&&t.generateMipmaps&&P.generateMipmap(v),F.unbindTexture()},this.initRenderTarget=function(e){I.get(e).__webglFramebuffer===void 0&&Be.setupRenderTarget(e)},this.initTexture=function(e){e.isCubeTexture?Be.setTextureCube(e,0):e.isData3DTexture?Be.setTexture3D(e,0):e.isDataArrayTexture||e.isCompressedArrayTexture?Be.setTexture2DArray(e,0):Be.setTexture2D(e,0),F.unbindTexture()},this.resetState=function(){le=0,ue=0,N=null,F.reset(),ot.reset()},typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}get coordinateSystem(){return Ge}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=yt._getDrawingBufferColorSpace(e),t.unpackColorSpace=yt._getUnpackColorSpace()}},G={Air:0,Grass:1,Stone:2,Cobblestone:3,Sand:4,Dirt:5,Log:6,Planks:7,Brick:8,Gravel:9,Bedrock:10,WoolWhite:11,WoolBlack:12,WoolRed:13,WoolOrange:14,WoolYellow:15,WoolGreen:16,WoolBlue:17,WoolPurple:18,Sandstone:19,StoneBricks:20,Snow:21,Obsidian:22,WoolPink:23,WoolCyan:24,WoolGray:25,WoolBrown:26,Glass:27,Leaves:28,LetterA:29,LetterB:30,LetterC:31,LetterD:32,LetterE:33,LetterF:34,LetterG:35,LetterH:36,LetterI:37,LetterJ:38,LetterK:39,LetterL:40,LetterM:41,LetterN:42,LetterO:43,LetterP:44,LetterQ:45,LetterR:46,LetterS:47,LetterT:48,LetterU:49,LetterV:50,LetterW:51,LetterX:52,LetterY:53,LetterZ:54,Digit0:55,Digit1:56,Digit2:57,Digit3:58,Digit4:59,Digit5:60,Digit6:61,Digit7:62,Digit8:63,Digit9:64,Cerca:65,PortaXFechada:66,PortaXAberta:67,PortaZFechada:68,PortaZAberta:69,Tocha:70,TapeteBranco:71,TapetePreto:72,TapeteVermelho:73,TapeteLaranja:74,TapeteAmarelo:75,TapeteVerde:76,TapeteAzul:77,TapeteRoxo:78,TapeteRosa:79,TapeteCiano:80,TapeteCinza:81,TapeteMarrom:82,JanelaXFechada:83,JanelaXAberta:84,JanelaZFechada:85,JanelaZAberta:86,Mesa:87,CadeiraXP:88,CadeiraZP:89,CadeiraXN:90,CadeiraZN:91,SofaXP:92,SofaZP:93,SofaXN:94,SofaZN:95,CamaXP:96,CamaZP:97,CamaXN:98,CamaZN:99,QuadroXP:100,QuadroZP:101,QuadroXN:102,QuadroZN:103,FlorVermelha:104,FlorAmarela:105,FlorAzul:106,FlorBranca:107,PortaXFechadaR:108,PortaXAbertaR:109,PortaZFechadaR:110,PortaZAbertaR:111,JanelaXFechadaR:112,JanelaXAbertaR:113,JanelaZFechadaR:114,JanelaZAbertaR:115,MinerioCarvao:116,MinerioFerro:117,MinerioOuro:118,MinerioDiamante:119,GramaSeca:120,GramaFria:121,LogIpe:122,FolhasIpe:123,LogAraucaria:124,FolhasAraucaria:125,LogPauBrasil:126,FolhasPauBrasil:127,Mandacaru:128,Agua:129,AguaFluida1:130,AguaFluida2:131,AguaFluida3:132,AguaFluida4:133,AguaFluida5:134,AguaFluida6:135,AguaFluida7:136,VidroBranco:137,VidroPreto:138,VidroVermelho:139,VidroLaranja:140,VidroAmarelo:141,VidroVerde:142,VidroAzul:143,VidroRoxo:144,VidroRosa:145,VidroCiano:146,VidroCinza:147,VidroMarrom:148,LajePedraBaixo:149,LajePedraCima:150,LajeTabuaBaixo:151,LajeTabuaCima:152,LajeTijoloBaixo:153,LajeTijoloCima:154,EscadaPedraXP:155,EscadaPedraZP:156,EscadaPedraXN:157,EscadaPedraZN:158,EscadaPedraXPC:159,EscadaPedraZPC:160,EscadaPedraXNC:161,EscadaPedraZNC:162,EscadaTabuaXP:163,EscadaTabuaZP:164,EscadaTabuaXN:165,EscadaTabuaZN:166,EscadaTabuaXPC:167,EscadaTabuaZPC:168,EscadaTabuaXNC:169,EscadaTabuaZNC:170,EscadaTijoloXP:171,EscadaTijoloZP:172,EscadaTijoloXN:173,EscadaTijoloZN:174,EscadaTijoloXPC:175,EscadaTijoloZPC:176,EscadaTijoloXNC:177,EscadaTijoloZNC:178,GramaAlta:179,GramaAltaSeca:180,GramaAltaFria:181,Plantacao0:182,Plantacao1:183,Plantacao2:184,Plantacao3:185,Fornalha:186,FornalhaAcesa:187,Bau:188,Algodao0:189,Algodao1:190,Algodao2:191,Algodao3:192,AlgodaoSelvagem:193,FornalhaXP:194,FornalhaZP:195,FornalhaXN:196,FornalhaAcesaXP:197,FornalhaAcesaZP:198,FornalhaAcesaXN:199,Cenoura0:200,Cenoura1:201,Cenoura2:202,Cenoura3:203,CenouraSelvagem:204,Batata0:205,Batata1:206,Batata2:207,Batata3:208,BatataSelvagem:209,Beterraba0:210,Beterraba1:211,Beterraba2:212,Beterraba3:213,BeterrabaSelvagem:214,Melancia0:215,Melancia1:216,Melancia2:217,Melancia3:218,MelanciaSelvagem:219,Banana0:220,Banana1:221,Banana2:222,Banana3:223,BananaSelvagem:224,Aipim0:225,Aipim1:226,Aipim2:227,Aipim3:228,AipimSelvagem:229,MudaComum0:230,MudaComum1:231,MudaComum2:232,MudaComum3:233,MudaIpe0:234,MudaIpe1:235,MudaIpe2:236,MudaIpe3:237,MudaAraucaria0:238,MudaAraucaria1:239,MudaAraucaria2:240,MudaAraucaria3:241,MudaPauBrasil0:242,MudaPauBrasil1:243,MudaPauBrasil2:244,MudaPauBrasil3:245},yl=G.MudaPauBrasil3;function bl(e){return e>=G.Agua&&e<=G.AguaFluida7}function xl(e){return e===G.Agua}function Sl(e){return e===G.Agua?8:e>=G.AguaFluida1&&e<=G.AguaFluida7?e-G.AguaFluida1+1:0}function Cl(e){return e>=8?G.Agua:e>=1?G.AguaFluida1+(e-1):G.Air}var wl=new Set([912,913,914,915]);function Tl(e){return wl.has(e)}var El=[{apagada:G.FornalhaXP,acesa:G.FornalhaAcesaXP},{apagada:G.FornalhaZP,acesa:G.FornalhaAcesaZP},{apagada:G.FornalhaXN,acesa:G.FornalhaAcesaXN},{apagada:G.Fornalha,acesa:G.FornalhaAcesa}];function Dl(e){return El.some(t=>t.apagada===e||t.acesa===e)}function Ol(e){return El.some(t=>t.acesa===e)}function kl(e){return El.findIndex(t=>t.apagada===e||t.acesa===e)}function Al(e){return(El[e]??El[3]).apagada}function jl(e){return e===900||e===901}var Ml=[{base:G.Plantacao0,estagios:4,colheita:903,colheitaMax:1},{base:G.Algodao0,estagios:4,colheita:911,colheitaMax:2,selvagem:G.AlgodaoSelvagem},{base:G.Cenoura0,estagios:4,colheita:916,colheitaMax:2,selvagem:G.CenouraSelvagem},{base:G.Batata0,estagios:4,colheita:917,colheitaMax:2,selvagem:G.BatataSelvagem},{base:G.Beterraba0,estagios:4,colheita:918,colheitaMax:2,selvagem:G.BeterrabaSelvagem},{base:G.Melancia0,estagios:4,colheita:919,colheitaMax:2,selvagem:G.MelanciaSelvagem},{base:G.Banana0,estagios:4,colheita:920,colheitaMax:2,selvagem:G.BananaSelvagem},{base:G.Aipim0,estagios:4,colheita:921,colheitaMax:2,selvagem:G.AipimSelvagem}],Nl=[],Pl=[];for(let e of Ml){for(let t=0;t<e.estagios;t++)Nl[e.base+t]=e;e.selvagem!==void 0&&(Pl[e.selvagem]=e)}function Fl(e){return Nl[e]??null}function Il(e){return Fl(e)!==null}function Ll(e){return Fl(e)?.base===e}function Rl(e){return Pl[e]??null}function zl(e){return Rl(e)!==null}function Bl(e){return e>=G.MudaComum0&&e<=G.MudaPauBrasil3}function Vl(e){return Bl(e)?e-G.MudaComum0&3:-1}function Hl(e){return Bl(e)&&Vl(e)===0}function Ul(e){return e===G.Dirt||e===G.Grass||e===G.GramaSeca||e===G.GramaFria}function Wl(e){return e>=G.FlorVermelha&&e<=G.FlorBranca}function Gl(e){return e>=G.GramaAlta&&e<=G.GramaAltaFria}function Kl(e){return e===G.Leaves||e===G.FolhasIpe||e===G.FolhasAraucaria||e===G.FolhasPauBrasil}function ql(e){return e>=G.VidroBranco&&e<=G.VidroMarrom}function Jl(e){return e>=G.LajePedraBaixo&&e<=G.LajeTijoloCima}function Yl(e){return(e-G.LajePedraBaixo&1)==1}function Xl(e){return e-G.LajePedraBaixo>>1}function Zl(e){return e>=G.EscadaPedraXP&&e<=G.EscadaTijoloZNC}function Ql(e){return(e-G.EscadaPedraXP)%4}function $l(e){return(e-G.EscadaPedraXP)%8>=4}function eu(e){return(e-G.EscadaPedraXP)/8|0}function tu(e,t,n){return G.EscadaPedraXP+e*8+(n?4:0)+(t&3)}function nu(e){switch(e&3){case 1:return[0,.5,1,1];case 2:return[0,0,.5,1];case 3:return[0,0,1,.5];default:return[.5,0,1,1]}}function ru(e){if(Jl(e))return Yl(e)?[[0,.5,0,1,1,1]]:[[0,0,0,1,.5,1]];if(Zl(e)){let[t,n,r,i]=nu(Ql(e));return $l(e)?[[0,.5,0,1,1,1],[t,0,n,r,.5,i]]:[[0,0,0,1,.5,1],[t,.5,n,r,1,i]]}return[[0,0,0,1,1,1]]}function iu(e){return e>=G.QuadroXP&&e<=G.QuadroZN}function au(e){return e>=G.CadeiraXP&&e<=G.CadeiraZN}function ou(e){return e>=G.SofaXP&&e<=G.SofaZN}function su(e){return e>=G.CamaXP&&e<=G.CamaZN}function cu(e){switch(e-G.CamaXP){case 0:return{dx:-1,dz:0};case 1:return{dx:0,dz:-1};case 2:return{dx:1,dz:0};default:return{dx:0,dz:1}}}function lu(e){return e>=G.Mesa&&e<=G.CamaZN}function uu(e){return e>=G.TapeteBranco&&e<=G.TapeteMarrom}function du(e){return e===G.Tocha||uu(e)||Wl(e)||Gl(e)||Il(e)||zl(e)||e===G.Mandacaru}function fu(e,t){return Il(e)||zl(e)||Bl(e)?Ul(t):Cu(t)}function pu(e){return e===G.Glass||e===G.Leaves||e===G.FolhasIpe||e===G.FolhasAraucaria||e===G.FolhasPauBrasil||bl(e)||ql(e)}function mu(e){return e>=G.PortaXFechada&&e<=G.PortaZAberta||e>=G.PortaXFechadaR&&e<=G.PortaZAbertaR}function hu(e){return e===G.PortaXAberta||e===G.PortaZAberta||e===G.PortaXAbertaR||e===G.PortaZAbertaR}function gu(e){return e===G.PortaXFechada||e===G.PortaXAberta||e===G.PortaXFechadaR||e===G.PortaXAbertaR}function _u(e){return e>=G.PortaXFechadaR&&e<=G.PortaZAbertaR}G.PortaXFechadaR-G.PortaXFechada;function vu(e){return e>=G.JanelaXFechada&&e<=G.JanelaZAberta||e>=G.JanelaXFechadaR&&e<=G.JanelaZAbertaR}function yu(e){return e===G.JanelaXAberta||e===G.JanelaZAberta||e===G.JanelaXAbertaR||e===G.JanelaZAbertaR}function bu(e){return e===G.JanelaXFechada||e===G.JanelaXAberta||e===G.JanelaXFechadaR||e===G.JanelaXAbertaR}function xu(e){return e>=G.JanelaXFechadaR&&e<=G.JanelaZAbertaR}G.JanelaXFechadaR-G.JanelaXFechada;function Su(e){return mu(e)||vu(e)}function Cu(e){return e!==G.Air&&!(e>=G.Cerca&&e<=G.Tocha)&&!mu(e)&&!uu(e)&&!vu(e)&&!lu(e)&&!iu(e)&&!Wl(e)&&!Gl(e)&&!Il(e)&&!zl(e)&&!Bl(e)&&e!==G.Bau&&!Jl(e)&&!Zl(e)}function wu(e){return e!==G.Air&&!hu(e)&&!yu(e)&&e!==G.Tocha&&!uu(e)&&!iu(e)&&!Wl(e)&&!Gl(e)&&!Il(e)&&!zl(e)&&!Bl(e)&&!bl(e)}function Tu(e){return hu(e)||yu(e)||bl(e)||Il(e)&&!Ll(e)||Bl(e)&&!Hl(e)||Ol(e)?!1:Number.isInteger(e)&&e>=G.Grass&&e<=yl}function Eu(e){return e===G.Bedrock}var Du={caatinga:{nome:`caatinga`,topo:G.Sand,subsolo:G.Sandstone,profundidadeSubsolo:3,arvores:[],flores:0,gramaAlta:0,mandacaru:1/16,selvagem:{},relevo:.1,neve:!1},cerrado:{nome:`cerrado`,topo:`grama`,subsolo:G.Dirt,profundidadeSubsolo:3,arvores:[[`ipe`,1/160]],flores:1/64,gramaAlta:1/6,mandacaru:0,selvagem:{[G.AlgodaoSelvagem]:1/40,[G.MelanciaSelvagem]:1/90,[G.AipimSelvagem]:1/70},relevo:.35,neve:!1},mata:{nome:`mata`,topo:`grama`,subsolo:G.Dirt,profundidadeSubsolo:3,arvores:[[`comum`,1/28],[`paubrasil`,1/80]],flores:1/48,gramaAlta:1/10,mandacaru:0,selvagem:{[G.BananaSelvagem]:1/60},relevo:.5,neve:!1},araucarias:{nome:`araucárias`,topo:`grama`,subsolo:G.Dirt,profundidadeSubsolo:3,arvores:[[`araucaria`,1/48]],flores:1/128,gramaAlta:1/12,mandacaru:0,selvagem:{[G.BatataSelvagem]:1/50,[G.CenouraSelvagem]:1/110,[G.BeterrabaSelvagem]:1/130},relevo:1,neve:!0}};function Ou(e){return e.temp<.35?Du.araucarias:e.temp>.65&&e.umid<.4?Du.caatinga:e.umid>.55?Du.mata:Du.cerrado}function ku(e){return e.temp<.42?G.GramaFria:e.temp>.58&&e.umid<.5?G.GramaSeca:G.Grass}function Au(e,t,n){let r=Math.min(1,Math.max(0,(e-t)/(n-t)));return r*r*(3-2*r)}var ju=.25,Mu=[.4,1];function Nu(e){let t=1-Au(e.temp,.35-ju,.6),n=Au(e.temp,.65-ju,.9),r=1-Au(e.umid,.4-ju,.65),i=Au(e.umid,.55-ju,.8),a=t,o=n*r,s=(1-t)*o,c=(1-t)*(1-o)*i,l=(1-t)*(1-o)*(1-i);return(a*Du.araucarias.relevo+s*Du.caatinga.relevo+c*Du.mata.relevo+l*Du.cerrado.relevo)*Au(Math.max(a,s,c,l),Mu[0],Mu[1])}var Pu=16**3,Fu={x:16,z:16,y:8},Iu=1200;function Lu(e,t=!0){let n=e.x*e.y*e.z,r=Array(n);if(t)for(let e=0;e<n;e++)r[e]=new Uint8Array(Pu);return{dims:e,sizeX:e.x*16,sizeY:e.y*16,sizeZ:e.z*16,chunks:r}}function Ru(e,t,n){return e.chunks[Bu(e,t,0,n)]!==void 0}function zu(e,t,n){for(let r=0;r<e.dims.y;r++){let i=Bu(e,t,r,n);e.chunks[i]||(e.chunks[i]=new Uint8Array(Pu))}}function Bu(e,t,n,r){return(n*e.dims.z+r)*e.dims.x+t}function Vu(e,t,n){return(t*16+n)*16+e}function Hu(e,t,n,r){return t>=0&&n>=0&&r>=0&&t<e.sizeX&&n<e.sizeY&&r<e.sizeZ}function K(e,t,n,r){if(!Hu(e,t,n,r))return G.Air;let i=t/16|0,a=n/16|0,o=r/16|0,s=e.chunks[Bu(e,i,a,o)];return s?s[Vu(t-i*16,n-a*16,r-o*16)]??G.Air:G.Air}function Uu(e,t,n,r,i){if(!Hu(e,t,n,r))return;let a=t/16|0,o=n/16|0,s=r/16|0,c=e.chunks[Bu(e,a,o,s)];c&&(c[Vu(t-a*16,n-o*16,r-s*16)]=i)}function Wu(e,t,n){for(let r=e.sizeY-1;r>=0;r--)if(K(e,t,r,n)!==G.Air)return r+1;return 1}G.Log,G.LogIpe,G.LogAraucaria,G.LogPauBrasil,G.Leaves,G.FolhasIpe,G.FolhasAraucaria,G.FolhasPauBrasil;function Gu(e){return[...e.trim()].filter(e=>/[\p{L}\p{N}\p{M}_-]/u.test(e)).join(``).slice(0,24)||`jogador`}function Ku(e){return{x:e.max.x-e.min.x+1,y:e.max.y-e.min.y+1,z:e.max.z-e.min.z+1}}function qu(e){if(typeof e!=`object`||!e)return null;let t=e;return[t.x,t.y,t.z].every(e=>typeof e==`number`&&Number.isInteger(e))?{x:t.x,y:t.y,z:t.z}:null}function Ju(e){if(typeof e!=`object`||!e)return null;let t=e,n=t.nome;if(typeof n!=`string`||!n||n.length>24)return null;let r=qu(t.min),i=qu(t.max);return!r||!i||r.x>i.x||r.y>i.y||r.z>i.z?null:{nome:n,min:r,max:i}}function Yu(e){if(typeof e!=`object`||!e)return null;let t=e,n=t.dono;if(typeof n!=`string`||!n)return null;let r=qu(t.min),i=qu(t.max);if(!r||!i||r.x>i.x||r.y>i.y||r.z>i.z)return null;let a={dono:n,min:r,max:i},o=t.nome;return typeof o==`string`&&o&&o.length<=24&&(a.nome=o),a}function Xu(e){if(typeof e!=`object`||!e)return null;let t=e,n=t.dono;if(typeof n!=`string`||!n)return null;let r=[];if(Array.isArray(t.membros))for(let e of t.membros)typeof e==`string`&&e&&e!==n&&!r.includes(e)&&r.push(e);return{dono:n,membros:r.slice(0,5)}}function Zu(e,t,n){return`${e},${t},${n}`}function Qu(e){if(typeof e!=`object`||!e)return null;let t=e,{x:n,y:r,z:i}=t;if(typeof n!=`number`||!Number.isInteger(n)||typeof r!=`number`||!Number.isInteger(r)||typeof i!=`number`||!Number.isInteger(i)||typeof t.texto!=`string`)return null;let a=t.texto.slice(0,300),o=t.imagem;return o===void 0?{x:n,y:r,z:i,texto:a}:typeof o!=`string`||!o.startsWith(`data:image/`)||o.length>32768?null:{x:n,y:r,z:i,texto:a,imagem:o}}function $u(e){return jl(e)||Tl(e)?1:64}function ed(){return Array(27).fill(null)}function td(e,t){let n=0;for(let r of e)r&&r.id===t&&(n+=r.qtd);return n}function nd(e,t){let n=$u(t),r=0;for(let i of e)i===null?r+=n:i.id===t&&i.qtd<n&&(r+=n-i.qtd);return r}function rd(e,t,n){return n<=nd(e,t)}function id(e,t,n){if(n<=0)return{inv:e,sobra:0};let r=$u(t),i=e.slice(),a=n;for(let e=0;e<i.length&&a>0;e++){let n=i[e];if(!n||n.id!==t||n.qtd>=r)continue;let o=Math.min(r-n.qtd,a);i[e]={id:t,qtd:n.qtd+o},a-=o}for(let e=0;e<i.length&&a>0;e++){if(i[e]!==null)continue;let n=Math.min(r,a);i[e]={id:t,qtd:n},a-=n}return a===n?{inv:e,sobra:a}:{inv:i,sobra:a}}function ad(e,t,n){if(n<=0||td(e,t)<n)return{inv:e,removido:0};let r=e.map((e,t)=>({s:e,i:t})).filter(e=>e.s!==null&&e.s.id===t).sort((e,t)=>e.s.qtd-t.s.qtd||e.i-t.i),i=e.slice(),a=n;for(let{s:e,i:n}of r){if(a<=0)break;let r=Math.min(e.qtd,a);i[n]=e.qtd===r?null:{id:t,qtd:e.qtd-r},a-=r}return{inv:i,removido:n}}function od(e){return Number.isInteger(e)&&e>=0&&e<27}function sd(e){let t=[];return e.forEach((e,n)=>{e&&t.push({slot:n,id:e.id,qtd:e.qtd})}),t}function cd(e){let t=ed().slice();if(!Array.isArray(e))return t;for(let n of e){if(typeof n!=`object`||!n)continue;let e=n,r=e.slot,i=e.id,a=e.qtd;typeof r!=`number`||!od(r)||typeof i!=`number`||!Number.isInteger(i)||i<=0||typeof a!=`number`||!Number.isInteger(a)||a<=0||a>$u(i)||(t[r]={id:i,qtd:a})}return t}var ld=new Map([[G.MinerioFerro,{id:909,qtd:1}],[G.MinerioOuro,{id:910,qtd:1}],[G.Log,{id:908,qtd:1}],[G.LogIpe,{id:908,qtd:1}],[G.LogAraucaria,{id:908,qtd:1}],[G.LogPauBrasil,{id:908,qtd:1}],[G.Sand,{id:G.Glass,qtd:1}],[917,{id:922,qtd:1}]]),ud=new Map([[905,800],[908,800],[G.Planks,100],[G.Log,100],[G.LogIpe,100],[G.LogAraucaria,100],[G.LogPauBrasil,100],[G.Cerca,100],[G.LajeTabuaBaixo,100],[G.EscadaTabuaXP,100]]),dd={fornalha:3,bau:27};function fd(e){return Dl(e)?`fornalha`:e===G.Bau?`bau`:null}function pd(e){return typeof e==`number`&&Number.isInteger(e)&&e>=0?e:0}function md(e){if(typeof e!=`object`||!e)return null;let t=e,{x:n,y:r,z:i}=t;if(typeof n!=`number`||!Number.isInteger(n)||typeof r!=`number`||!Number.isInteger(r)||typeof i!=`number`||!Number.isInteger(i))return null;let a=t.tipo;if(a!==`fornalha`&&a!==`bau`)return null;let o=dd[a],s=[];if(Array.isArray(t.slots))for(let e of t.slots){if(typeof e!=`object`||!e)continue;let t=e,n=t.slot,r=t.id,i=t.qtd;typeof n!=`number`||!Number.isInteger(n)||n<0||n>=o||typeof r!=`number`||!Number.isInteger(r)||r<=0||typeof i!=`number`||!Number.isInteger(i)||i<=0||i>$u(r)||s.push({slot:n,id:r,qtd:i})}let c=pd(t.queimando),l=pd(t.queimaTotal),u=pd(t.progresso);return{x:n,y:r,z:i,tipo:a,slots:s,...c?{queimando:c}:{},...l||c?{queimaTotal:l||c}:{},...u?{progresso:u}:{}}}function hd(e){if(!Array.isArray(e))return[];let t=[];for(let n of e){if(typeof n!=`object`||!n)continue;let e=n,r=e.id;if(typeof r!=`number`||!Number.isInteger(r)||r<1||r>20)continue;let i=Array.isArray(e.membros)?e.membros.filter(e=>typeof e==`string`&&e.length>0):[];t.push({id:r,membros:i})}return t}function gd(e){if(typeof e!=`string`)return null;let t=e.trim().toLowerCase().replace(/[áàâã]/g,`a`).replace(/[éèê]/g,`e`).replace(/[íì]/g,`i`).replace(/[óòôõ]/g,`o`).replace(/[úù]/g,`u`).replace(/ç/g,`c`);return t===`criativo`?`criativo`:t===`sobrevivencia`?`sobrevivencia`:null}function _d(e){return e===`criativo`}function vd(e){return gd(e)===`sobrevivencia`}function yd(e){return(e.max.x-e.min.x+1)*(e.max.y-e.min.y+1)*(e.max.z-e.min.z+1)}function bd(e){return e===`construir`||e===`chegar`||e===`limpar`}function xd(e,t){let n=qu(e),r=qu(t);return!n||!r||n.x>r.x||n.y>r.y||n.z>r.z?null:{min:n,max:r}}function Sd(e){if(typeof e!=`object`||!e)return null;let t=e;if(typeof t.id!=`number`||!Number.isInteger(t.id)||t.id<1||!bd(t.kind)||typeof t.regiao!=`string`||!t.regiao||typeof t.texto!=`string`)return null;let n=xd(t.min,t.max);if(!n)return null;let r;if(t.kind===`construir`){if(!Array.isArray(t.gabarito)||t.gabarito.length!==yd(n)||!t.gabarito.every(e=>typeof e==`number`&&Number.isInteger(e)&&e>=0))return null;r=t.gabarito}let i;if(t.alvos!==void 0){if(!Array.isArray(t.alvos)||t.alvos.length===0)return null;i=[];for(let e of t.alvos){let t=e,a=t?xd(t.min,t.max):null;if(!a||r&&yd(a)!==yd(n))return null;i.push(a)}}let a;if(Array.isArray(t.baseline)){let e=i??[n],r=t.baseline;r.length===e.length&&r.every((t,n)=>Array.isArray(t)&&t.length===yd(e[n])&&t.every(e=>typeof e==`number`&&Number.isInteger(e)&&e>=0))&&(a=r)}return{id:t.id,kind:t.kind,regiao:t.regiao,texto:t.texto.slice(0,120),min:n.min,max:n.max,...typeof t.modelo==`string`?{modelo:t.modelo}:{},...r?{gabarito:r}:{},...i?{alvos:i}:{},...t.regra===`todos`||t.regra===`um`?{regra:t.regra}:{},...a?{baseline:a}:{}}}function Cd(e){if(typeof e!=`object`||!e)return null;let t=e,n=[];if(Array.isArray(t.objetivos))for(let e of t.objetivos){let t=Sd(e);t&&n.push(t)}let r=Array.isArray(t.completos)?t.completos.filter(e=>typeof e==`number`&&Number.isInteger(e)):[],i=[];if(Array.isArray(t.completosGrupos))for(let e of t.completosGrupos){if(typeof e!=`object`||!e)continue;let t=e;typeof t.grupo!=`number`||!Number.isInteger(t.grupo)||i.push({grupo:t.grupo,objetivos:Array.isArray(t.objetivos)?t.objetivos.filter(e=>typeof e==`number`&&Number.isInteger(e)):[]})}return{modo:t.modo===`livre`?`livre`:`sequencial`,objetivos:n,completos:r,...i.length?{completosGrupos:i}:{}}}function wd(e){if(typeof e!=`object`||!e)return null;let t=e;if(typeof t.id!=`number`||!Number.isInteger(t.id)||!bd(t.kind)||typeof t.regiao!=`string`||typeof t.texto!=`string`)return null;let n=qu(t.min),r=qu(t.max);if(!n||!r||typeof t.completo!=`boolean`||typeof t.ativo!=`boolean`||![t.atual,t.total,t.extras].every(e=>typeof e==`number`&&Number.isInteger(e)))return null;let i;if(t.porGrupo!==void 0){if(!Array.isArray(t.porGrupo))return null;i=[];for(let e of t.porGrupo){if(typeof e!=`object`||!e)return null;let t=e,n=xd(t.min,t.max);if(!n||typeof t.grupo!=`number`||!Number.isInteger(t.grupo)||typeof t.completo!=`boolean`||typeof t.ativo!=`boolean`||![t.atual,t.total,t.extras].every(e=>typeof e==`number`&&Number.isInteger(e)))return null;i.push({grupo:t.grupo,min:n.min,max:n.max,atual:t.atual,total:t.total,extras:t.extras,completo:t.completo,ativo:t.ativo})}}return{id:t.id,kind:t.kind,regiao:t.regiao,texto:t.texto,min:n,max:r,completo:t.completo,ativo:t.ativo,atual:t.atual,total:t.total,extras:t.extras,...i?{porGrupo:i}:{}}}var Td=[`queda`,`afogamento`,`fome`,`pvp`,`sufocamento`,`outro`];function Ed(e){return typeof e==`string`&&Td.includes(e)?e:null}function Dd(e){let t;try{t=JSON.parse(e)}catch{return null}if(typeof t!=`object`||!t)return null;let n=t;switch(n.type){case`debug_stats`:{if(![n.tickAvgMs,n.tickMaxMs,n.tps].every(e=>typeof e==`number`&&Number.isFinite(e)))return null;let e=e=>{let t=n[e];return typeof t==`number`&&Number.isFinite(t)?t:void 0};return{type:`debug_stats`,tickAvgMs:n.tickAvgMs,tickMaxMs:n.tickMaxMs,tps:n.tps,...e(`regrasCelulasAvg`)===void 0?{}:{regrasCelulasAvg:e(`regrasCelulasAvg`)},...e(`regrasCelulasMax`)===void 0?{}:{regrasCelulasMax:e(`regrasCelulasMax`)},...e(`regrasMudancasAvg`)===void 0?{}:{regrasMudancasAvg:e(`regrasMudancasAvg`)},...e(`regrasAguaAvg`)===void 0?{}:{regrasAguaAvg:e(`regrasAguaAvg`)}}}case`block_changed`:return[n.x,n.y,n.z,n.blockId].every(e=>typeof e==`number`&&Number.isInteger(e))?{type:`block_changed`,x:n.x,y:n.y,z:n.z,blockId:n.blockId}:null;case`blocks_filled`:return[n.x0,n.y0,n.z0,n.x1,n.y1,n.z1,n.blockId].every(e=>typeof e==`number`&&Number.isInteger(e))?{type:`blocks_filled`,x0:n.x0,y0:n.y0,z0:n.z0,x1:n.x1,y1:n.y1,z1:n.z1,blockId:n.blockId}:null;case`player_moved`:return typeof n.id!=`number`||!Number.isInteger(n.id)||![n.x,n.y,n.z,n.yaw,n.pitch].every(e=>typeof e==`number`&&Number.isFinite(e))?null:{type:`player_moved`,id:n.id,x:n.x,y:n.y,z:n.z,yaw:n.yaw,pitch:n.pitch,...typeof n.name==`string`?{name:n.name}:{}};case`player_left`:return typeof n.id!=`number`||!Number.isInteger(n.id)?null:{type:`player_left`,id:n.id};case`spawn`:return[n.x,n.y,n.z].every(e=>typeof e==`number`&&Number.isFinite(e))?{type:`spawn`,x:n.x,y:n.y,z:n.z,...n.papel===`professor`||n.papel===`aluno`?{papel:n.papel}:{}}:null;case`regions`:{if(!Array.isArray(n.regions))return null;let e=[];for(let t of n.regions){let n=Ju(t);n&&e.push(n)}return{type:`regions`,regions:e}}case`objectives`:{if(n.modo!==`sequencial`&&n.modo!==`livre`||!Array.isArray(n.objetivos))return null;let e=[];for(let t of n.objetivos){let n=wd(t);n&&e.push(n)}return{type:`objectives`,modo:n.modo,objetivos:e}}case`group`:{let e=n.grupo;return e!==null&&(typeof e!=`number`||!Number.isInteger(e))?null:{type:`group`,grupo:e}}case`groups`:return{type:`groups`,grupos:hd(n.grupos)};case`claims`:{if(typeof n.ativo!=`boolean`||!Array.isArray(n.claims))return null;let e=[];for(let t of n.claims){let n=Yu(t);n&&e.push(n)}return{type:`claims`,ativo:n.ativo,claims:e}}case`friends`:{let e=e=>Array.isArray(e)?e.filter(e=>typeof e==`string`):[],t=null,r=n.equipe;if(r&&typeof r==`object`){let n=r;typeof n.dono==`string`&&(t={dono:n.dono,membros:e(n.membros)})}return{type:`friends`,equipe:t,convites:e(n.convites),enviados:e(n.enviados)}}case`players`:{if(!Array.isArray(n.conectados)||!Array.isArray(n.banidos))return null;let e=[];for(let t of n.conectados){if(!t||typeof t!=`object`)continue;let n=t;typeof n.name==`string`&&e.push({name:n.name,papel:n.papel===`professor`?`professor`:`aluno`})}return{type:`players`,conectados:e,banidos:n.banidos.filter(e=>typeof e==`string`)}}case`quadro_changed`:{let e=Qu(n);return e?{type:`quadro_changed`,...e}:null}case`quadros`:{if(!Array.isArray(n.lista))return null;let e=[];for(let t of n.lista){let n=Qu(t);n&&e.push(n)}return{type:`quadros`,lista:e}}case`container`:{let e=md(n);return e?{type:`container`,x:e.x,y:e.y,z:e.z,tipo:e.tipo,slots:e.slots,...e.queimando?{queimando:e.queimando}:{},...e.queimaTotal?{queimaTotal:e.queimaTotal}:{},...e.progresso?{progresso:e.progresso}:{}}:null}case`container_fechado`:return{type:`container_fechado`};case`chat`:return typeof n.author!=`string`||typeof n.text!=`string`?null:{type:`chat`,author:n.author,text:n.text};case`join_denied`:return typeof n.reason==`string`?{type:`join_denied`,reason:n.reason}:null;case`teleport`:return[n.x,n.y,n.z,n.yaw,n.pitch].every(e=>typeof e==`number`&&Number.isFinite(e))?{type:`teleport`,x:n.x,y:n.y,z:n.z,yaw:n.yaw,pitch:n.pitch}:null;case`time`:return typeof n.hora!=`number`||!Number.isFinite(n.hora)||typeof n.ciclo!=`boolean`?null:{type:`time`,hora:n.hora,ciclo:n.ciclo};case`vento`:{let e=n.dir,t=n.forca;return typeof e!=`number`||!Number.isFinite(e)||typeof t!=`number`||!Number.isFinite(t)||typeof n.ativo!=`boolean`?null:{type:`vento`,dir:e,forca:t,ativo:n.ativo}}case`mundo_trocando`:return typeof n.nome==`string`?{type:`mundo_trocando`,nome:n.nome}:null;case`voo`:return typeof n.liberado==`boolean`?{type:`voo`,liberado:n.liberado}:null;case`modo`:{let e=gd(n.efetivo);if(!e)return null;let t=n.pvp;return{type:`modo`,efetivo:e,...typeof t==`boolean`?{pvp:t}:{}}}case`vida`:{let e=n.vida;if(typeof e!=`number`||!Number.isFinite(e))return null;let t=Ed(n.causa),r=n.folego,i=n.fome;return{type:`vida`,vida:e,...t?{causa:t}:{},...n.morreu===!0?{morreu:!0}:{},...typeof r==`number`&&Number.isFinite(r)?{folego:r}:{},...typeof i==`number`&&Number.isFinite(i)?{fome:i}:{}}}case`inventario`:return Array.isArray(n.slots)?{type:`inventario`,slots:sd(cd(n.slots))}:null;case`kicked`:return typeof n.reason==`string`?{type:`kicked`,reason:n.reason}:null;default:return null}}function Od(e){if(e.byteLength<12)throw Error(`snapshot menor que o header (${e.byteLength} bytes)`);let t=new DataView(e);if(t.getUint32(0,!0)!==810178380)throw Error(`snapshot com magic inválido — não é um world_snapshot`);let n={x:t.getUint8(4),z:t.getUint8(5),y:t.getUint8(6)};if(n.x<1||n.z<1||n.y<1||n.x>Fu.x||n.z>Fu.z||n.y>Fu.y)throw Error(`snapshot com dims fora do limite: ${n.x}×${n.z}×${n.y}`);let r=t.getUint32(8,!0),i=Lu(n),a=12+i.chunks.length*Pu;if(e.byteLength!==a)throw Error(`snapshot com tamanho errado: ${e.byteLength} bytes (esperado ${a})`);for(let t=0;t<i.chunks.length;t++)i.chunks[t]?.set(new Uint8Array(e,12+t*Pu,Pu));return{world:i,seed:r}}var kd=809847372,Ad={x:240,z:240,y:8};function jd(e){return e.byteLength<4?0:new DataView(e).getUint32(0,!0)}function Md(e){if(e.byteLength!==16)throw Error(`LJE0 com tamanho errado (${e.byteLength} bytes)`);let t=new DataView(e);if(t.getUint32(0,!0)!==809847372)throw Error(`LJE0 com magic inválido`);let n={x:t.getUint16(4,!0),z:t.getUint16(6,!0),y:t.getUint16(8,!0)};if(n.x<1||n.z<1||n.y<1||n.x>Ad.x||n.z>Ad.z||n.y>Ad.y)throw Error(`LJE0 com dims fora do limite: ${n.x}×${n.z}×${n.y}`);return{world:Lu(n,!1),seed:t.getUint32(12,!0)}}var Nd=8;function Pd(e,t){if(e.byteLength<Nd)throw Error(`LJC0 menor que o header (${e.byteLength} bytes)`);let n=new DataView(e);if(n.getUint32(0,!0)!==809716300)throw Error(`LJC0 com magic inválido`);let r=n.getUint16(4,!0),i=4+t.dims.y*Pu;if(e.byteLength!==Nd+r*i)throw Error(`LJC0 com tamanho errado (${e.byteLength} bytes p/ ${r} colunas)`);let a=[],o=Nd;for(let i=0;i<r;i++){let r=n.getUint16(o,!0),i=n.getUint16(o+2,!0);if(o+=4,r>=t.dims.x||i>=t.dims.z)throw Error(`LJC0 com coluna fora do mundo: ${r},${i}`);zu(t,r,i);for(let n=0;n<t.dims.y;n++)t.chunks[Bu(t,r,n,i)]?.set(new Uint8Array(e,o,Pu)),o+=Pu;a.push({cx:r,cz:i})}return a}function Fd(e,t,n){return{cx:Math.max(0,Math.min(e.x-1,Math.floor(t/16))),cz:Math.max(0,Math.min(e.z-1,Math.floor(n/16)))}}function Id(e,t,n,r){return Math.max(Math.abs(e-n),Math.abs(t-r))}function Ld(e,t,n,r,i){return Id(e,t,n,r)<=i+2}function Rd(e,t,n){return n*e.x+t}function zd(e,t){let n=t%e.x;return{cx:n,cz:(t-n)/e.x}}function Bd(e,t,n,r){let i=Math.min(e.x-1,t+r)-Math.max(0,t-r)+1,a=Math.min(e.z-1,n+r)-Math.max(0,n-r)+1;return Math.max(0,i)*Math.max(0,a)}var Vd=class{ultima={x:NaN,y:NaN,z:NaN,yaw:NaN,pitch:NaN};ultimaEm=-1/0;aEnviar(e,t){return!(e.x!==this.ultima.x||e.y!==this.ultima.y||e.z!==this.ultima.z||e.yaw!==this.ultima.yaw||e.pitch!==this.ultima.pitch)&&t-this.ultimaEm<2e3?!1:(this.ultima={...e},this.ultimaEm=t,!0)}},Hd=new Map([[902,4],[904,5],[916,4],[917,1],[922,5],[918,1],[919,2],[920,4],[921,4]]);function Ud(e){return Hd.has(e)}function Wd(e){return Hd.get(e)??0}var q={width:.6,height:1.8,eyeHeight:1.62,sneakEyeHeight:1.32,walkSpeed:4.3,sprintFactor:1.6,sneakFactor:.3,jumpSpeed:8.4,gravity:25,terminalVelocity:40,flySpeed:9,flyVertSpeed:7,waterFactor:.5,waterGravity:8,swimSpeed:4,waterJumpSpeed:7.5,waterSinkMax:3},Gd=.001,Kd=.4,qd=.55;function Jd(e){return Jl(e)||Zl(e)}function Yd(e,t,n){return{pos:{x:e,y:t,z:n},vel:{x:0,y:0,z:0},onGround:!1,sprinting:!1}}function Xd(e,t){let n=q.width/2,r=t.x-n,i=t.x+n,a=t.y,o=t.y+q.height,s=t.z-n,c=t.z+n,l=Math.floor(r),u=Math.floor(i),d=Math.floor(a),f=Math.floor(o),p=Math.floor(s),m=Math.floor(c);for(let t=d;t<=f;t++)for(let n=p;n<=m;n++)for(let d=l;d<=u;d++){let l=K(e,d,t,n);if(wu(l)){if(!Jd(l))return!0;for(let e of ru(l))if(i>d+e[0]&&r<d+e[3]&&o>t+e[1]&&a<t+e[4]&&c>n+e[2]&&s<n+e[5])return!0}}return!1}var Zd=[[0,0,0,1,1,1]];function Qd(e,t,n){let r=q.width/2,i=t.x-r,a=t.x+r,o=t.z-r,s=t.z+r,c=Math.floor(i),l=Math.floor(a),u=Math.floor(o),d=Math.floor(s),f=Math.floor(t.y)-1,p=Math.floor(t.y+q.height)+1,m=t.y,h=t.y+q.height,g=NaN;for(let t=f;t<=p;t++)for(let r=u;r<=d;r++)for(let u=c;u<=l;u++){let c=K(e,u,t,r);if(!wu(c))continue;let l=Jd(c)?ru(c):Zd;for(let e of l){if(a<=u+e[0]||i>=u+e[3]||s<=r+e[2]||o>=r+e[5])continue;let c=t+e[1],l=t+e[4];n<0?c<=m+Gd&&(Number.isNaN(g)||l>g)&&(g=l):l>=h-Gd&&(Number.isNaN(g)||c<g)&&(g=c)}}return g}function $d(e,t,n,r){let i=q.width/2,a=n===`x`,o=a?0:2,s=a?3:5,c=a?2:0,l=a?5:3,u=t[n]-i,d=t[n]+i,f=a?t.z:t.x,p=f-i,m=f+i,h=t.y,g=t.y+q.height,_=Math.floor(u),v=Math.floor(d),y=Math.floor(p),b=Math.floor(m),x=Math.floor(h),S=Math.floor(g),C=NaN;for(let t=x;t<=S;t++)for(let n=y;n<=b;n++)for(let i=_;i<=v;i++){let f=K(e,a?i:n,t,a?n:i);if(!wu(f))continue;let _=Jd(f)?ru(f):Zd;for(let e of _)if(!(g<=t+e[1]||h>=t+e[4])&&!(m<=n+e[c]||p>=n+e[l])&&!(d<=i+e[o]||u>=i+e[s]))if(r>0){let t=i+e[o];(Number.isNaN(C)||t<C)&&(C=t)}else{let t=i+e[s];(Number.isNaN(C)||t>C)&&(C=t)}}return C}function ef(e,t,n,r){if(r===0||(t.pos[n]+=r,!Xd(e,t.pos)))return;let i=q.width/2;if(n===`y`){if(r<0){let n=Qd(e,t.pos,-1);t.pos.y=(Number.isNaN(n)?Math.floor(t.pos.y)+1:n)+Gd,t.onGround=!0}else{let n=Qd(e,t.pos,1);t.pos.y=(Number.isNaN(n)?Math.floor(t.pos.y+q.height):n)-q.height-Gd}t.vel.y=0}else{let a=$d(e,t.pos,n,r);r>0?t.pos[n]=(Number.isNaN(a)?Math.floor(t.pos[n]+i):a)-i-Gd:t.pos[n]=(Number.isNaN(a)?Math.floor(t.pos[n]-i)+1:a)+i+Gd,t.vel[n]=0}}function tf(e,t){return bl(K(e,Math.floor(t.x),Math.floor(t.y+q.height*.5),Math.floor(t.z)))}function nf(e,t){let n=q.width/2,r=t.x-n,i=t.x+n,a=t.z-n,o=t.z+n,s=Math.floor(r),c=Math.floor(i),l=Math.floor(a),u=Math.floor(o),d=Math.floor(t.y-.06),f=Math.floor(t.y);for(let n=d;n<=f;n++)for(let d=l;d<=u;d++)for(let l=s;l<=c;l++){let s=K(e,l,n,d);if(!wu(s))continue;let c=Jd(s)?ru(s):Zd;for(let e of c){if(i<=l+e[0]||r>=l+e[3]||o<=d+e[2]||a>=d+e[5])continue;let s=n+e[4];if(s<=t.y+Gd&&s>=t.y-.06)return!0}}return!1}function rf(e,t,n,r,i,a){let o=t.pos[n];of(e,t,n,r,i);let s=t.pos[n]-o;if(!a||Math.abs(s)>=Math.abs(r)-Gd)return;let c=t.pos[n],l=t.pos.y;if(t.pos.y=l+qd,Xd(e,t.pos)){t.pos.y=l;return}if(t.pos[n]+=r-s,Xd(e,t.pos)){t.pos[n]=c,t.pos.y=l;return}ef(e,t,`y`,-.55),i&&!nf(e,t.pos)&&(t.pos[n]=c,t.pos.y=l)}function af(e,t){let n=q.width/2,r=Math.floor(t.x),i=Math.floor(t.z),a=Math.floor(t.x+n)+1,o=Math.floor(t.x-n)-1,s=Math.floor(t.z+n)+1,c=Math.floor(t.z-n)-1,l=Math.floor(t.y),u=Math.floor(t.y+q.height*.5);for(let t=l;t<=u;t++)if(wu(K(e,a,t,i))||wu(K(e,o,t,i))||wu(K(e,r,t,s))||wu(K(e,r,t,c)))return!0;return!1}function of(e,t,n,r,i){let a=t.pos[n];ef(e,t,n,r),i&&!nf(e,t.pos)&&(t.pos[n]=a,t.vel[n]=0)}function sf(e,t,n,r){let i=n.forward,a=n.strafe;if(n.fly===!0){t.sprinting=!1,t.onGround=!1;let o=Math.sin(n.yaw),s=Math.cos(n.yaw),c=Math.hypot(i,a),l=(c>1?1/c:1)*q.flySpeed;t.vel.x=(a*s-i*o)*l,t.vel.z=(-i*s-a*o)*l,t.vel.y=(!!n.jump-+(n.sneak===!0))*q.flyVertSpeed;let u=Math.max(Math.abs(t.vel.x),Math.abs(t.vel.y),Math.abs(t.vel.z))*r,d=Math.max(1,Math.ceil(u/Kd)),f=r/d;for(let n=0;n<d;n++)ef(e,t,`y`,t.vel.y*f),ef(e,t,`x`,t.vel.x*f),ef(e,t,`z`,t.vel.z*f);return}let o=n.sneak===!0,s=tf(e,t.pos);o||i<=0||s?t.sprinting=!1:n.sprint===!0&&t.onGround&&(t.sprinting=!0);let c=(o?q.sneakFactor:t.sprinting?q.sprintFactor:1)*(s?q.waterFactor:1),l=Math.hypot(i,a),u=(l>1?1/l:1)*q.walkSpeed*c,d=Math.sin(n.yaw),f=Math.cos(n.yaw);t.vel.x=(a*f-i*d)*u,t.vel.z=(-i*f-a*d)*u,s?n.jump?t.vel.y=af(e,t.pos)?q.waterJumpSpeed:q.swimSpeed:o?t.vel.y=-q.swimSpeed:(t.vel.y-=q.waterGravity*r,t.vel.y<-q.waterSinkMax&&(t.vel.y=-q.waterSinkMax),t.vel.y>q.waterSinkMax&&(t.vel.y=q.waterSinkMax)):(n.jump&&t.onGround&&(t.vel.y=q.jumpSpeed),t.vel.y-=q.gravity*r,t.vel.y<-q.terminalVelocity&&(t.vel.y=-q.terminalVelocity)),t.onGround=!1;let p=Math.max(Math.abs(t.vel.x),Math.abs(t.vel.y),Math.abs(t.vel.z))*r,m=Math.max(1,Math.ceil(p/Kd)),h=r/m;for(let n=0;n<m;n++){ef(e,t,`y`,t.vel.y*h);let n=o&&t.onGround,r=t.onGround&&!s;rf(e,t,`x`,t.vel.x*h,n,r),rf(e,t,`z`,t.vel.z*h,n,r)}}var cf=class{apertadaAntes=!1;ultimoEm=-1/0;bateu(e,t){let n=e&&!this.apertadaAntes;if(this.apertadaAntes=e,!n)return!1;let r=t-this.ultimoEm<300;return this.ultimoEm=t,r}},lf=class{andar=new cf;pular=new cf;corridaEngatada=!1;olho=q.eyeHeight;degrau=0;correndo(e,t){return this.andar.bateu(e,t)&&(this.corridaEngatada=!0),e||(this.corridaEngatada=!1),this.corridaEngatada}alternarVoo(e,t){return this.pular.bateu(e,t)}avancarOlho(e,t){t.noChao&&!t.voando&&t.subiu>.01&&t.subiu<=.56&&(this.degrau=Math.min(this.degrau+t.subiu,qd)),this.degrau*=Math.exp(-e*14),this.degrau<.002&&(this.degrau=0);let n=1-Math.exp(-e*20),r=t.agachado&&!t.voando?q.sneakEyeHeight:q.eyeHeight;return this.olho+=(r-this.olho)*n,this.alturaOlho}get alturaOlho(){return this.olho-this.degrau}},uf=new Map([[912,{tipo:`picareta`,nivel:1,nome:`picareta de madeira`}],[913,{tipo:`picareta`,nivel:2,nome:`picareta de pedra`}],[914,{tipo:`picareta`,nivel:3,nome:`picareta de ferro`}],[915,{tipo:`picareta`,nivel:4,nome:`picareta de diamante`}]]),df=e=>({tipo:`picareta`,nivel:e}),ff=new Map([[G.Stone,df(1)],[G.Cobblestone,df(1)],[G.Sandstone,df(1)],[G.StoneBricks,df(1)],[G.Brick,df(1)],[G.MinerioCarvao,df(1)],[G.MinerioFerro,df(2)],[G.MinerioOuro,df(3)],[G.MinerioDiamante,df(3)],[G.Obsidian,df(4)]]),pf=new Set([0,2]);function mf(e){return ff.get(e)||(Jl(e)?pf.has(Xl(e))?df(1):null:Zl(e)?pf.has(eu(e))?df(1):null:e>=G.LetterA&&e<=G.Digit9||Dl(e)?df(1):null)}function hf(e,t){return[...uf.values()].find(n=>n.tipo===e&&n.nivel===t)?.nome??null}function gf(e,t){let n=[];for(let[r,i]of ff)i.tipo===e&&i.nivel===t&&n.push(r);return n}G.Grass,G.Dirt,G.GramaSeca,G.Dirt,G.GramaFria,G.Dirt,G.Stone,G.Cobblestone,G.Bedrock,G.MinerioCarvao,G.MinerioDiamante;function _f(e){let t=[],n=uf.get(e);n&&t.push({tipo:`ferramenta`,nome:n.nome,libera:gf(n.tipo,n.nivel)}),Ud(e)&&t.push({tipo:`comida`,fome:Wd(e)});let r=ld.get(e);r&&t.push({tipo:`funde`,saida:r});let i=ud.get(e);i!==void 0&&t.push({tipo:`combustivel`,cozimentos:Math.round(i/100)});let a=Fl(e);a&&t.push({tipo:`colheita`,item:a.colheita});let o=mf(e);if(o){let e=hf(o.tipo,o.nivel);e&&t.push({tipo:`exigeFerramenta`,ferramenta:e})}return t}function vf(e){return e===`plano`||e===`cabines`?e:`normal`}function yf(e){return e===`M`||e===`G`||e===`E`?e:`P`}function bf(e,t,n){let r=n^Math.imul(e,374761393)^Math.imul(t,668265263);return r=Math.imul(r^r>>>13,1274126177),((r^r>>>16)>>>0)/4294967296}new Map(Object.values(Du).map(e=>[e,Object.entries(e.selvagem).map(([e,t])=>({id:Number(e),chance:t})).sort((e,t)=>e.chance-t.chance||e.id-t.id)]));function xf(e){return e*e*(3-2*e)}function Sf(e,t,n){let r=Math.floor(e),i=Math.floor(t),a=xf(e-r),o=xf(t-i),s=bf(r,i,n),c=bf(r+1,i,n),l=bf(r,i+1,n),u=bf(r+1,i+1,n),d=s+(c-s)*a;return d+(l+(u-l)*a-d)*o}function Cf(e,t,n,r=128,i){let a=Sf(e/24,t/24,n),o=Sf(e/7,t/7,n^2654435769),s=16+a*12+o*4;if(r<128)return Math.floor(s);let c=Nu(i??wf(e,t,n));if(c<=0)return Math.floor(s);let l=Sf(e/90,t/90,n^6191009),u=xf(Math.min(1,Math.max(0,(l-.52)/.3))),d=Sf(e/28,t/28,n^9516923);return Math.floor(s+c*u*(28+d*60))}function wf(e,t,n){return{temp:Sf(e/80,t/80,n^1375183809),umid:Sf(e/80,t/80,n^731782471)}}G.MinerioCarvao,G.MinerioFerro,G.MinerioOuro,G.MinerioDiamante,G.StoneBricks;var Tf=15;function Ef(e){return e===G.Air?0:bl(e)||Kl(e)?1:mu(e)&&!hu(e)||Cu(e)&&!pu(e)?Tf:0}function Df(e){return e===G.Tocha?14:Ol(e)?13:0}function Of(e){return{dims:e,sizeX:e.x*16,sizeY:e.y*16,sizeZ:e.z*16,chunks:Array(e.x*e.y*e.z)}}function kf(e,t,n,r){return(n*e.z+r)*e.x+t}function Af(e,t){let n=t%e.x,r=(t-n)/e.x,i=r%e.z;return{cx:n,cy:(r-i)/e.z,cz:i}}function jf(e,t,n){for(let r=0;r<e.dims.y;r++){let i=kf(e.dims,t,r,n);e.chunks[i]||(e.chunks[i]=new Uint8Array(Pu))}}function Mf(e,t,n){for(let r=0;r<e.dims.y;r++)e.chunks[kf(e.dims,t,r,n)]=void 0}function Nf(e,t,n,r){return t>=0&&n>=0&&r>=0&&t<e.sizeX&&n<e.sizeY&&r<e.sizeZ}function Pf(e,t,n,r){if(!Nf(e,t,n,r))return 0;let i=t/16|0,a=n/16|0,o=r/16|0,s=e.chunks[kf(e.dims,i,a,o)];return s?s[Vu(t-i*16,n-a*16,r-o*16)]??0:0}function Ff(e,t,n,r){return Pf(e,t,n,r)>>4}function If(e,t,n,r){if(!Nf(e,t,n,r))return!1;let i=t/16|0,a=n/16|0,o=r/16|0;return e.chunks[kf(e.dims,i,a,o)]!==void 0}function Lf(e,t,n,r,i){let a=Pf(e,t,n,r);return i===0?a>>4:a&15}function Rf(e,t,n,r,i,a,o){if(!Nf(e,t,n,r))return;let s=t/16|0,c=n/16|0,l=r/16|0,u=kf(e.dims,s,c,l),d=e.chunks[u];if(!d)return;let f=Vu(t-s*16,n-c*16,r-l*16),p=d[f]??0,m=i===0?(a&15)<<4|p&15:p&240|a&15;if(p===m)return;d[f]=m,o.add(u);let h=t-s*16,g=n-c*16,_=r-l*16;h===0&&s>0&&o.add(kf(e.dims,s-1,c,l)),h===15&&s<e.dims.x-1&&o.add(kf(e.dims,s+1,c,l)),g===0&&c>0&&o.add(kf(e.dims,s,c-1,l)),g===15&&c<e.dims.y-1&&o.add(kf(e.dims,s,c+1,l)),_===0&&l>0&&o.add(kf(e.dims,s,c,l-1)),_===15&&l<e.dims.z-1&&o.add(kf(e.dims,s,c,l+1))}function zf(e,t,n,r){return(t*e.sizeZ+r)*e.sizeY+n}var Bf=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];function Vf(e,t,n,r,i){for(let a=0;a<n.length;a++){let o=n[a],s=o%t.sizeY,c=(o-s)/t.sizeY,l=c%t.sizeZ,u=(c-l)/t.sizeZ,d=Lf(t,u,s,l,r);if(!(d<=0))for(let a=0;a<Bf.length;a++){let[o,c,f]=Bf[a],p=u+o,m=s+c,h=l+f;if(!If(t,p,m,h))continue;let g=Ef(K(e,p,m,h));if(g>=Tf)continue;let _=r===0&&c===-1&&d===15&&g===0?15:d-1-g;_<=0||_<=Lf(t,p,m,h,r)||(Rf(t,p,m,h,r,_,i),n.push(zf(t,p,m,h)))}}}function Hf(e,t,n,r,i,a,o,s){let c=Lf(t,n,r,i,a);if(c<=0)return;let l=[zf(t,n,r,i)],u=[c];Rf(t,n,r,i,a,0,o);for(let e=0;e<l.length;e++){let n=l[e],r=u[e],i=n%t.sizeY,c=(n-i)/t.sizeY,d=c%t.sizeZ,f=(c-d)/t.sizeZ;for(let e=0;e<Bf.length;e++){let[n,c,p]=Bf[e],m=f+n,h=i+c,g=d+p;if(!If(t,m,h,g))continue;let _=Lf(t,m,h,g,a);_!==0&&(_<r||a===0&&c===-1&&r===15&&_===15?(Rf(t,m,h,g,a,0,o),l.push(zf(t,m,h,g)),u.push(_)):s.push(zf(t,m,h,g)))}}}function Uf(e,t,n){e[t]=(n&15)<<4|e[t]&15}var Wf=240;function Gf(e){if(!e)return!0;for(let t=0;t<e.length;t++)if(e[t]!==0)return!1;return!0}function Kf(e,t,n,r){let i=n/16|0,a=r/16|0,o=n-i*16,s=r-a*16;if(n<0||r<0||i>=t.x||a>=t.z)return-1;for(let n=t.y-1;n>=0;n--){let r=e.chunks[kf(t,i,n,a)];if(r){for(let e=15;e>=0;e--)if(Ef(r[Vu(o,e,s)])>=Tf)return n*16+e}}return-1}function qf(e,t,n,r,i,a){let o=n*16,s=r*16,c=t.dims.y,l=new Uint8Array(256).fill(15),u=new Int32Array(256).fill(-2),d=new Uint8Array(256),f=256,p=!0;for(let i=c-1;i>=0&&f>0;i--){let a=t.chunks[kf(t.dims,n,i,r)];if(!a)continue;let o=e.chunks[kf(t.dims,n,i,r)],s=Gf(o);if(s&&p){a.fill(Wf);continue}if(s){for(let e=0;e<16;e++)for(let t=0;t<16;t++){let n=e*16+t;if(u[n]!==-2)continue;let r=l[n];for(let n=0;n<16;n++)Uf(a,Vu(e,n,t),r)}continue}for(let e=0;e<16;e++)for(let t=0;t<16;t++){let n=e*16+t;if(u[n]!==-2)continue;let r=l[n];for(let s=15;s>=0;s--){let c=Vu(e,s,t),l=Ef(o[c]),m=i*16+s;if(l>=Tf){u[n]=m,f--;break}if(Uf(a,c,r),l>0&&(r-=l,p=!1,d[n]=1,r<=0)){u[n]=m-1,f--;break}}l[n]=r}}for(let e=0;e<16;e++)for(let t=0;t<16;t++){let n=u[e*16+t];a[(e+1)*18+(t+1)]=n===-2?-1:n}for(let n=0;n<16;n++)a[(n+1)*18+0]=Kf(e,t.dims,o+n,s-1),a[(n+1)*18+17]=Kf(e,t.dims,o+n,s+16),a[0+(n+1)]=Kf(e,t.dims,o-1,s+n),a[306+(n+1)]=Kf(e,t.dims,o+16,s+n);for(let e=0;e<16;e++)for(let n=0;n<16;n++){let r=a[(e+1)*18+(n+1)],c=Math.max(a[e*18+(n+1)],a[(e+2)*18+(n+1)],a[(e+1)*18+n],a[(e+1)*18+(n+2)]),l=o+e,u=s+n,f=Math.min(t.sizeY-1,c+1);for(let e=r+1;e<=f;e++)i.push(zf(t,l,e,u));if(d[e*16+n])for(let e=f+1;e<t.sizeY;e++){let n=Ff(t,l,e,u);n>0&&n<15&&i.push(zf(t,l,e,u))}}}function Jf(e,t,n,r,i,a){for(let o=0;o<t.dims.y;o++){let s=e.chunks[kf(t.dims,n,o,r)];if(s)for(let e=0;e<s.length;e++){let c=Df(s[e]);if(c<=0)continue;let l=e%16,u=(e-l)/16,d=u%16,f=(u-d)/16,p=n*16+l,m=o*16+f,h=r*16+d;Rf(t,p,m,h,1,c,a),i.push(zf(t,p,m,h))}}}function Yf(e,t,n,r,i,a){let o=t*16,s=n*16,c=(t,n,o)=>{if(!If(e,t,0,n))return;let s=Math.min(e.sizeY-1,r[o]+1);for(let r=0;r<e.sizeY;r++){let o=Pf(e,t,r,n);if(o===0)continue;let c=o>>4;c>0&&(r<=s||c<15)&&i.push(zf(e,t,r,n)),o&15&&a.push(zf(e,t,r,n))}};for(let e=0;e<16;e++)c(o+e,s-1,(e+1)*18+1),c(o+e,s+16,(e+1)*18+16),c(o-1,s+e,18+(e+1)),c(o+16,s+e,288+(e+1))}function Xf(e,t,n,r){let i=new Set;if(!Ru(e,n,r))return i;jf(t,n,r);for(let e=0;e<t.dims.y;e++)t.chunks[kf(t.dims,n,e,r)].fill(0);for(let e=0;e<t.dims.y;e++){i.add(kf(t.dims,n,e,r));for(let[a,o]of[[1,0],[-1,0],[0,1],[0,-1]]){let s=n+a,c=r+o;s<0||c<0||s>=t.dims.x||c>=t.dims.z||t.chunks[kf(t.dims,s,0,c)]&&i.add(kf(t.dims,s,e,c))}}let a=[],o=[],s=new Int32Array(324).fill(-1);return qf(e,t,n,r,a,s),Jf(e,t,n,r,o,i),Yf(t,n,r,s,a,o),Vf(e,t,a,0,i),Vf(e,t,o,1,i),i}function Zf(e,t,n,r,i){let a=new Set;if(!If(t,n,r,i))return a;let o=K(e,n,r,i),s=Ef(o),c=[];Hf(e,t,n,r,i,1,a,c);let l=Df(o);if(l>0&&s<Tf&&(Rf(t,n,r,i,1,l,a),c.push(zf(t,n,r,i))),s<Tf)for(let[e,a,o]of Bf)If(t,n+e,r+a,i+o)&&c.push(zf(t,n+e,r+a,i+o));Vf(e,t,c,1,a);let u=[];if(Hf(e,t,n,r,i,0,a,u),s<Tf)for(let[e,a,o]of Bf)If(t,n+e,r+a,i+o)&&u.push(zf(t,n+e,r+a,i+o));return Vf(e,t,u,0,a),a}var Qf=Math.PI*2,$f=[[-3,0],[-2,-2],[0,-3],[2,-2],[3,0],[2,2],[0,3],[-2,2]];function ep(e,t){return e===0&&t===0?0:(Math.round(Math.atan2(t,e)/(Qf/8))+8)%8}function tp(e){let t=(e%Qf+Qf)%Qf/(Qf/8)%8,n=Math.floor(t)%8;return{a:$f[n],b:$f[(n+1)%8],mistura:t-Math.floor(t)}}var J={tilesPerRow:16,tilePx:16},Y={grassTop:0,grassSide:1,dirt:2,stone:3,cobblestone:4,sand:5,logTop:6,logSide:7,planks:8,brick:9,gravel:10,bedrock:11,woolWhite:12,woolBlack:13,woolRed:14,woolOrange:15,woolYellow:16,woolGreen:17,woolBlue:18,woolPurple:19,sandstone:20,stoneBricks:21,snow:22,obsidian:23,woolPink:24,woolCyan:25,woolGray:26,woolBrown:27,glass:28,leaves:29,cerca:66,portaBaixo:67,portaCima:68,tocha:69,janela:70,estofado:71,colchao:72,quadro:73,florVermelha:74,florAmarela:75,florAzul:76,florBranca:77,minerioCarvao:78,minerioFerro:79,minerioOuro:80,minerioDiamante:81,gramaSecaTop:82,gramaSecaSide:83,gramaFriaTop:84,gramaFriaSide:85,logIpe:86,folhasIpe:87,logAraucaria:88,folhasAraucaria:89,logPauBrasil:90,folhasPauBrasil:91,mandacaruSide:92,mandacaruTop:93,agua:94,vidroBranco:95,vidroPreto:96,vidroVermelho:97,vidroLaranja:98,vidroAmarelo:99,vidroVerde:100,vidroAzul:101,vidroRoxo:102,vidroRosa:103,vidroCiano:104,vidroCinza:105,vidroMarrom:106,gramaAlta:107,gramaAltaSeca:108,gramaAltaFria:109,aguaFluxo:112,plantacao0:120,plantacao1:121,plantacao2:122,plantacao3:123,fornalhaTopo:124,fornalhaLado:125,fornalhaLadoAcesa:126,bauTopo:127,bauLado:128,algodao0:129,algodao1:130,algodao2:131,algodao3:132,algodaoSelvagem:133,fornalhaCostas:134,cenoura0:135,cenoura1:136,cenoura2:137,cenoura3:138,batata0:139,batata1:140,batata2:141,batata3:142,beterraba0:143,beterraba1:144,beterraba2:145,beterraba3:146,melancia0:147,melancia1:148,melancia2:149,melancia3:150,banana0:151,banana1:152,banana2:153,banana3:154,aipim0:155,aipim1:156,aipim2:157,aipim3:158,cenouraSelvagem:159,batataSelvagem:160,beterrabaSelvagem:161,melanciaSelvagem:162,bananaSelvagem:163,aipimSelvagem:164,mudaComum0:165,mudaComum1:166,mudaComum2:167,mudaComum3:168,mudaIpe0:169,mudaIpe1:170,mudaIpe2:171,mudaIpe3:172,mudaAraucaria0:173,mudaAraucaria1:174,mudaAraucaria2:175,mudaAraucaria3:176,mudaPauBrasil0:177,mudaPauBrasil1:178,mudaPauBrasil2:179,mudaPauBrasil3:180},np={base:30,letters:`ABCDEFGHIJKLMNOPQRSTUVWXYZ`,digits:`0123456789`},X=e=>({top:e,bottom:e,side:e}),rp=[[1,0],[0,1],[-1,0],[0,-1]];function ip(e){let t=kl(e);return t<0?null:rp[t]??null}var ap={[G.Grass]:{top:Y.grassTop,bottom:Y.dirt,side:Y.grassSide},[G.Stone]:X(Y.stone),[G.Cobblestone]:X(Y.cobblestone),[G.Sand]:X(Y.sand),[G.Dirt]:X(Y.dirt),[G.Log]:{top:Y.logTop,bottom:Y.logTop,side:Y.logSide},[G.Planks]:X(Y.planks),[G.Brick]:X(Y.brick),[G.Gravel]:X(Y.gravel),[G.Bedrock]:X(Y.bedrock),[G.WoolWhite]:X(Y.woolWhite),[G.WoolBlack]:X(Y.woolBlack),[G.WoolRed]:X(Y.woolRed),[G.WoolOrange]:X(Y.woolOrange),[G.WoolYellow]:X(Y.woolYellow),[G.WoolGreen]:X(Y.woolGreen),[G.WoolBlue]:X(Y.woolBlue),[G.WoolPurple]:X(Y.woolPurple),[G.Sandstone]:X(Y.sandstone),[G.StoneBricks]:X(Y.stoneBricks),[G.Snow]:X(Y.snow),[G.Obsidian]:X(Y.obsidian),[G.WoolPink]:X(Y.woolPink),[G.WoolCyan]:X(Y.woolCyan),[G.WoolGray]:X(Y.woolGray),[G.WoolBrown]:X(Y.woolBrown),[G.Glass]:X(Y.glass),[G.Leaves]:X(Y.leaves),[G.Cerca]:X(Y.cerca),[G.PortaXFechada]:X(Y.portaCima),[G.PortaXAberta]:X(Y.portaCima),[G.PortaZFechada]:X(Y.portaCima),[G.PortaZAberta]:X(Y.portaCima),[G.PortaXFechadaR]:X(Y.portaCima),[G.PortaXAbertaR]:X(Y.portaCima),[G.PortaZFechadaR]:X(Y.portaCima),[G.PortaZAbertaR]:X(Y.portaCima),[G.Tocha]:X(Y.tocha),[G.JanelaXFechada]:X(Y.janela),[G.JanelaXAberta]:X(Y.janela),[G.JanelaZFechada]:X(Y.janela),[G.JanelaZAberta]:X(Y.janela),[G.JanelaXFechadaR]:X(Y.janela),[G.JanelaXAbertaR]:X(Y.janela),[G.JanelaZFechadaR]:X(Y.janela),[G.JanelaZAbertaR]:X(Y.janela),[G.Mesa]:X(Y.planks),[G.MinerioCarvao]:X(Y.minerioCarvao),[G.MinerioFerro]:X(Y.minerioFerro),[G.MinerioOuro]:X(Y.minerioOuro),[G.MinerioDiamante]:X(Y.minerioDiamante),[G.GramaSeca]:{top:Y.gramaSecaTop,bottom:Y.dirt,side:Y.gramaSecaSide},[G.GramaFria]:{top:Y.gramaFriaTop,bottom:Y.dirt,side:Y.gramaFriaSide},[G.LogIpe]:{top:Y.logTop,bottom:Y.logTop,side:Y.logIpe},[G.FolhasIpe]:X(Y.folhasIpe),[G.LogAraucaria]:{top:Y.logTop,bottom:Y.logTop,side:Y.logAraucaria},[G.FolhasAraucaria]:X(Y.folhasAraucaria),[G.LogPauBrasil]:{top:Y.logTop,bottom:Y.logTop,side:Y.logPauBrasil},[G.FolhasPauBrasil]:X(Y.folhasPauBrasil),[G.Mandacaru]:{top:Y.mandacaruTop,bottom:Y.mandacaruTop,side:Y.mandacaruSide},[G.Agua]:X(Y.agua),[G.Bau]:{top:Y.bauTopo,bottom:Y.bauTopo,side:Y.bauLado}};for(let{apagada:e,acesa:t}of El)ap[e]={top:Y.fornalhaTopo,bottom:Y.fornalhaTopo,side:Y.fornalhaCostas,frente:Y.fornalhaLado},ap[t]={top:Y.fornalhaTopo,bottom:Y.fornalhaTopo,side:Y.fornalhaCostas,frente:Y.fornalhaLadoAcesa};for(let e=G.AguaFluida1;e<=G.AguaFluida7;e++)ap[e]=X(Y.agua);for(let e=0;e<12;e++)ap[G.VidroBranco+e]=X(Y.vidroBranco+e);var op=[Y.stone,Y.planks,Y.brick];for(let e=G.LajePedraBaixo;e<=G.LajeTijoloCima;e++)ap[e]=X(op[Xl(e)]);for(let e=G.EscadaPedraXP;e<=G.EscadaTijoloZNC;e++)ap[e]=X(op[eu(e)]);for(let e=0;e<4;e++)ap[G.CadeiraXP+e]=X(Y.planks),ap[G.SofaXP+e]=X(Y.estofado),ap[G.CamaXP+e]=X(Y.colchao),ap[G.QuadroXP+e]=X(Y.quadro);for(let e=0;e<4;e++)ap[G.FlorVermelha+e]=X(Y.florVermelha+e);for(let e=0;e<3;e++)ap[G.GramaAlta+e]=X(Y.gramaAlta+e);for(let e=0;e<4;e++)ap[G.Plantacao0+e]=X(Y.plantacao0+e);for(let e=0;e<4;e++)ap[G.Algodao0+e]=X(Y.algodao0+e);ap[G.AlgodaoSelvagem]=X(Y.algodaoSelvagem);var sp=[[G.Cenoura0,Y.cenoura0,Y.cenouraSelvagem],[G.Batata0,Y.batata0,Y.batataSelvagem],[G.Beterraba0,Y.beterraba0,Y.beterrabaSelvagem],[G.Melancia0,Y.melancia0,Y.melanciaSelvagem],[G.Banana0,Y.banana0,Y.bananaSelvagem],[G.Aipim0,Y.aipim0,Y.aipimSelvagem]];for(let[e,t,n]of sp){for(let n=0;n<4;n++)ap[e+n]=X(t+n);ap[e+4]=X(n)}for(let e=0;e<16;e++)ap[G.MudaComum0+e]=X(Y.mudaComum0+e);for(let e=0;e<np.letters.length;e++)ap[G.LetterA+e]=X(np.base+e);for(let e=0;e<np.digits.length;e++)ap[G.Digit0+e]=X(np.base+np.letters.length+e);var cp=[Y.woolWhite,Y.woolBlack,Y.woolRed,Y.woolOrange,Y.woolYellow,Y.woolGreen,Y.woolBlue,Y.woolPurple,Y.woolPink,Y.woolCyan,Y.woolGray,Y.woolBrown];for(let e=0;e<cp.length;e++)ap[G.TapeteBranco+e]=X(cp[e]);function lp(e){let t=ap[e];return t?.frente??t?.side??Y.stone}function up(e){return Wl(e)||Gl(e)||Il(e)||zl(e)||Bl(e)}function dp(e){if(up(e))return[4*Z,0,4*Z,12*Z,1,12*Z];if(uu(e))return[0,0,0,1,Z,1];if(e===G.Tocha)return[7*Z,0,7*Z,9*Z,10*Z,9*Z];if(e===G.Cerca)return[6*Z,0,6*Z,10*Z,1,10*Z];if(mu(e)){if(!hu(e))return gu(e)?[0,0,0,2*Z,1,1]:[0,0,0,1,1,2*Z];let t=_u(e)?1-2*Z:0;return gu(e)?[0,0,t,1,1,t+2*Z]:[t,0,0,t+2*Z,1,1]}if(vu(e)){if(!yu(e))return bu(e)?[0,0,0,2*Z,1,1]:[0,0,0,1,1,2*Z];let t=xu(e)?1-2*Z:0;return bu(e)?[0,0,t,1,1,t+2*Z]:[t,0,0,t+2*Z,1,1]}if(iu(e)){let[t,n,r,i]=yp(0,1*Z,2*Z,15*Z,e-G.QuadroXP);return[Math.min(t,r),1*Z,Math.min(n,i),Math.max(t,r),15*Z,Math.max(n,i)]}return e===G.Mesa?[0,0,0,1,14*Z,1]:e===G.Bau?[Z,0,Z,15*Z,14*Z,15*Z]:au(e)?[3*Z,0,3*Z,13*Z,1,13*Z]:ou(e)?[0,0,0,1,15*Z,1]:su(e)?[0,0,0,1,9*Z,1]:Jl(e)?ru(e)[0]:(Zl(e),[0,0,0,1,1,1])}var fp=[{dir:[-1,0,0],corners:[{pos:[0,1,0],uv:[0,1]},{pos:[0,0,0],uv:[0,0]},{pos:[0,1,1],uv:[1,1]},{pos:[0,0,1],uv:[1,0]}]},{dir:[1,0,0],corners:[{pos:[1,1,1],uv:[0,1]},{pos:[1,0,1],uv:[0,0]},{pos:[1,1,0],uv:[1,1]},{pos:[1,0,0],uv:[1,0]}]},{dir:[0,-1,0],corners:[{pos:[1,0,1],uv:[1,0]},{pos:[0,0,1],uv:[0,0]},{pos:[1,0,0],uv:[1,1]},{pos:[0,0,0],uv:[0,1]}]},{dir:[0,1,0],corners:[{pos:[0,1,1],uv:[1,1]},{pos:[1,1,1],uv:[0,1]},{pos:[0,1,0],uv:[1,0]},{pos:[1,1,0],uv:[0,0]}]},{dir:[0,0,-1],corners:[{pos:[1,0,0],uv:[0,0]},{pos:[0,0,0],uv:[1,0]},{pos:[1,1,0],uv:[0,1]},{pos:[0,1,0],uv:[1,1]}]},{dir:[0,0,1],corners:[{pos:[0,0,1],uv:[0,0]},{pos:[1,0,1],uv:[1,0]},{pos:[0,1,1],uv:[0,1]},{pos:[1,1,1],uv:[1,1]}]}];function pp(e,t){for(let n of[0,1,2])if(e.pos[n]!==t.pos[n])return{axis:n,flip:e.pos[n]===1};return{axis:0,flip:!1}}var mp=fp.map(e=>{let t=(t,n)=>e.corners.find(e=>e.uv[0]===t&&e.uv[1]===n)??e.corners[0],n=t(0,0).pos,r=t(1,0).pos,i=t(0,1).pos,a=(e,t)=>[e[0]-t[0],e[1]-t[1],e[2]-t[2]];return{dir:e.dir,du:a(r,n),dv:a(i,n)}}),hp=fp.map(e=>{let t=(t,n)=>e.corners.find(e=>e.uv[0]===t&&e.uv[1]===n)??e.corners[0];return{u:pp(t(0,0),t(1,0)),v:pp(t(0,0),t(0,1))}}),Z=1/16,gp=[[1,0],[-1,0],[0,1],[0,-1]];function _p(e,t,n,r){let i=mp[e];if(!i||t===0&&n===0)return Y.agua;let a=i.dv[1]!==0,o=t*i.du[0]+n*i.du[2],s=t*i.dv[0]+n*i.dv[2];return a&&(r||o===0)&&(o=0,s=-1),o===0&&s===0?Y.agua:Y.aguaFluxo+ep(-o,s)}var vp=.875;function yp(e,t,n,r,i){for(let a=0;a<i;a++){let i=1-r,a=n,o=1-t,s=e;e=i,t=s,n=o,r=a}return[e,t,n,r]}var bp=.34;function xp(e){return Kl(e)?bp:+!!up(e)}var Sp=18,Cp=Sp*Sp*Sp;function wp(e,t,n){return((t+1)*Sp+(n+1))*Sp+(e+1)}var Tp=()=>({positions:new Float32Array,normals:new Float32Array,uvs:new Float32Array,sway:new Uint8Array,luz:new Uint8Array,indices:new Uint32Array,opaqueIndexCount:0,aguaIndexCount:0});function Ep(e,t,n,r){let i=e.chunks[Bu(e,t,n,r)];if(!i||i.every(e=>e===0))return null;let a=new Uint8Array(Cp);for(let e=0;e<16;e++)for(let t=0;t<16;t++){let n=(e*16+t)*16;a.set(i.subarray(n,n+16),wp(0,e,t))}let o=t*16,s=n*16,c=r*16;for(let t=-1;t<=16;t++){let n=t>=0&&t<16;for(let r=-1;r<=16;r++){let i=n&&r>=0&&r<16;for(let n=-1;n<=16;n++)i&&n===0&&(n=16),a[wp(n,t,r)]=K(e,o+n,s+t,c+r)}}return a}function Dp(e,t,n,r){if(!e)return null;let i=new Uint8Array(Cp),a=t*16,o=n*16,s=r*16;for(let t=-1;t<=16;t++)for(let n=-1;n<=16;n++)for(let r=-1;r<=16;r++)i[wp(r,t,n)]=Pf(e,a+r,o+t,s+n);return i}function Op(e,t,n,r,i){let a=Ep(e,t,n,r);return a?kp(a,Dp(i,t,n,r)):Tp()}function kp(e,t){let n=(e,n,r)=>t?t[wp(e,n,r)]??0:255,r=(t,n,r)=>e[wp(t,n,r)]??G.Air,i=[],a=[],o=[],s=[],c=[],l=0,u=e=>{for(let t=0;t<e;t++)c.push(l)},d=[],f=(e,t)=>{for(let n=0;n<e;n++)d.push(t)},p=[],m=[],h=J.tilesPerRow,g=.5/(h*J.tilePx),_=(e,t,c,l,d,p,m,_,v,y,b,x=d,S=!0)=>{let C=[p,m,_],w=[v,y,b];for(let T=0;T<fp.length;T++){let E=fp[T],D=hp[T];if(!E||!D)continue;let ee=E.dir[0]===-1?p===0:E.dir[0]===1?v===1:E.dir[1]===-1?m===0:E.dir[1]===1?y===1:E.dir[2]===-1?_===0:b===1;if(ee){let n=r(e+E.dir[0],t+E.dir[1],c+E.dir[2]);if(n===l&&(S||E.dir[1]===0)||Cu(n)&&!pu(n))continue}let O=ee?n(e+E.dir[0],t+E.dir[1],c+E.dir[2]):n(e,t,c),k=E.dir[1]===0?d:x,te=k%h,A=k/h|0,j=i.length/3;for(let n of E.corners){let r=n.pos[0]===0?p:v,s=n.pos[1]===0?m:y,l=n.pos[2]===0?_:b;i.push(e+r,t+s,c+l),a.push(E.dir[0],E.dir[1],E.dir[2]);let u=(e,t)=>{let n=t===0?e.flip?w[e.axis]:C[e.axis]:e.flip?C[e.axis]:w[e.axis];return e.flip?1-n:n},d=u(D.u,n.uv[0]),f=u(D.v,n.uv[1]);o.push(te/h+g+d*(1/h-2*g),1-(A+1)/h+g+f*(1/h-2*g))}u(4),f(4,O),s.push(j,j+1,j+2,j+2,j+1,j+3)}},v=(e,t,r,u,d,p,m,_)=>{let v=u%h,y=u/h|0,b=v/h+g,x=(v+1)/h-g,S=1-(y+1)/h+g,C=1-y/h-g,w=[[e+d,t,r+p],[e+m,t,r+_],[e+m,t+1,r+_],[e+d,t+1,r+p]],T=[b,x,x,b],E=[S,S,C,C],D=_-p,ee=-(m-d),O=Math.hypot(D,ee)||1;D/=O,ee/=O;for(let u of[1,-1]){let d=i.length/3;for(let e=0;e<4;e++){let t=w[e];i.push(t[0],t[1],t[2]),a.push(D*u,0,ee*u),o.push(T[e],E[e]),c.push(e>=2?l:0)}f(4,n(e,t,r)),u>0?s.push(d,d+1,d+2,d,d+2,d+3):s.push(d,d+2,d+1,d,d+3,d+2)}},y=(e,t,n)=>{let i=r(e,t,n);return i===G.Cerca||Cu(i)},b=(e,t,n,i)=>{switch(e){case G.Cerca:{_(t,n,i,e,Y.cerca,6*Z,0,6*Z,10*Z,1,10*Z);let r=(r,a,o,s)=>{_(t,n,i,e,Y.cerca,r,12*Z,a,o,15*Z,s),_(t,n,i,e,Y.cerca,r,6*Z,a,o,9*Z,s)};return y(t-1,n,i)&&r(0,7*Z,6*Z,9*Z),y(t+1,n,i)&&r(10*Z,7*Z,1,9*Z),y(t,n,i-1)&&r(7*Z,0,9*Z,6*Z),y(t,n,i+1)&&r(7*Z,10*Z,9*Z,1),!0}case G.PortaXFechada:case G.PortaXAberta:case G.PortaZFechada:case G.PortaZAberta:case G.PortaXFechadaR:case G.PortaXAbertaR:case G.PortaZFechadaR:case G.PortaZAbertaR:{let a=r(t,n-1,i)===e?Y.portaCima:Y.portaBaixo,o=gu(e);if(!hu(e))o?_(t,n,i,e,a,0,0,0,2*Z,1,1):_(t,n,i,e,a,0,0,0,1,1,2*Z);else{let r=_u(e)?1-2*Z:0;o?_(t,n,i,e,a,0,0,r,1,1,r+2*Z):_(t,n,i,e,a,r,0,0,r+2*Z,1,1)}return!0}case G.Tocha:return _(t,n,i,e,Y.tocha,7*Z,0,7*Z,9*Z,10*Z,9*Z),!0;case G.JanelaXFechada:case G.JanelaXAberta:case G.JanelaZFechada:case G.JanelaZAberta:case G.JanelaXFechadaR:case G.JanelaXAbertaR:case G.JanelaZFechadaR:case G.JanelaZAbertaR:{let r=bu(e);if(!yu(e))r?_(t,n,i,e,Y.janela,0,0,0,2*Z,1,1):_(t,n,i,e,Y.janela,0,0,0,1,1,2*Z);else{let a=xu(e)?1-2*Z:0;r?_(t,n,i,e,Y.janela,0,0,a,1,1,a+2*Z):_(t,n,i,e,Y.janela,a,0,0,a+2*Z,1,1)}return!0}case G.Bau:return _(t,n,i,e,Y.bauLado,Z,0,Z,15*Z,14*Z,15*Z,Y.bauTopo),!0;case G.Mesa:_(t,n,i,e,Y.planks,0,12*Z,0,1,14*Z,1);for(let[r,a]of[[1,1],[13,1],[1,13],[13,13]])_(t,n,i,e,Y.planks,r*Z,0,a*Z,(r+2)*Z,12*Z,(a+2)*Z);return!0;default:if(Jl(e)||Zl(e)){let r=op[Jl(e)?Xl(e):eu(e)];for(let[a,o,s,c,l,u]of ru(e))_(t,n,i,e,r,a,o,s,c,l,u,r,!1);return!0}if(iu(e)){let[r,a,o,s]=yp(0,1*Z,2*Z,15*Z,e-G.QuadroXP);return _(t,n,i,e,Y.quadro,r,1*Z,a,o,15*Z,s),!0}if(Wl(e)){let r=Y.florVermelha+(e-G.FlorVermelha);return v(t,n,i,r,0,0,1,1),v(t,n,i,r,0,1,1,0),!0}if(Gl(e)){let r=Y.gramaAlta+(e-G.GramaAlta);return v(t,n,i,r,0,0,1,1),v(t,n,i,r,0,1,1,0),!0}if(Il(e)||zl(e)||Bl(e)){let r=lp(e);return v(t,n,i,r,0,0,1,1),v(t,n,i,r,0,1,1,0),!0}if(su(e)){let a=e-G.CamaXP,{dx:o,dz:s}=cu(e),c=r(t+o,n,i+s)===e?[[Y.planks,0,0,0,1,3*Z,1],[Y.colchao,0,3*Z,1*Z,1,7*Z,15*Z]]:[[Y.planks,0,0,0,1,3*Z,1],[Y.colchao,0,3*Z,1*Z,1,7*Z,15*Z],[Y.woolWhite,1*Z,7*Z,3*Z,6*Z,9*Z,13*Z]];for(let[r,o,s,l,u,d,f]of c){let[c,p,m,h]=yp(o,l,u,f,a);_(t,n,i,e,r,c,s,p,m,d,h)}return!0}if(au(e)||ou(e)){let r=au(e)?e-G.CadeiraXP:e-G.SofaXP,a=au(e)?[[Y.planks,3*Z,6*Z,3*Z,13*Z,8*Z,13*Z],[Y.planks,3*Z,0,3*Z,5*Z,6*Z,5*Z],[Y.planks,11*Z,0,3*Z,13*Z,6*Z,5*Z],[Y.planks,3*Z,0,11*Z,5*Z,6*Z,13*Z],[Y.planks,11*Z,0,11*Z,13*Z,6*Z,13*Z],[Y.planks,3*Z,8*Z,3*Z,5*Z,1,13*Z]]:[[Y.estofado,0,0,0,1,8*Z,1],[Y.estofado,0,8*Z,0,4*Z,15*Z,1],[Y.estofado,4*Z,8*Z,0,1,12*Z,2*Z],[Y.estofado,4*Z,8*Z,14*Z,1,12*Z,1]];for(let[o,s,c,l,u,d,f]of a){let[a,p,m,h]=yp(s,l,u,f,r);_(t,n,i,e,o,a,c,p,m,d,h)}return!0}return uu(e)?(_(t,n,i,e,cp[e-G.TapeteBranco],0,0,0,1,Z,1),!0):!1}},x=(e,t,n,i,a)=>{let o=0,s=0;for(let c=0;c<2;c++)for(let l=0;l<2;l++){let u=e+i-1+c,d=n+a-1+l,f=r(u,t,d);if(bl(f)){if(bl(r(u,t+1,d)))return 1;o+=Sl(f),s++}}return s===0?vp:o/s/8*vp},S=(e,t,n,i)=>{let a=Sl(i),o=0,s=0;for(let[i,c]of gp){let l=r(e+i,t,n+c);if(!bl(l))continue;let u=a-Sl(l);u<=0||(o+=i*u,s+=c*u)}return[o,s]};for(let e=0;e<16;e++)for(let t=0;t<16;t++)for(let c=0;c<16;c++){let d=r(c,e,t);if(d===G.Air)continue;if(l=xp(d),!Cu(d)){b(d,c,e,t);continue}let _=ap[d];if(!_)continue;let v=bl(d)?p:ql(d)?m:s,y=bl(d)?[[x(c,e,t,0,0),x(c,e,t,0,1)],[x(c,e,t,1,0),x(c,e,t,1,1)]]:null,C=y?S(c,e,t,d):null,w=C!==null&&r(c,e-1,t)===G.Air,T=_.frente===void 0?null:ip(d);for(let s=0;s<fp.length;s++){let l=fp[s],p=r(c+l.dir[0],e+l.dir[1],t+l.dir[2]);if(p!==G.Air&&Cu(p)&&(bl(d)&&bl(p)||!pu(p)||p===d))continue;let m=C?_p(s,C[0],C[1],w):l.dir[1]===1?_.top:l.dir[1]===-1?_.bottom:T&&l.dir[0]===T[0]&&l.dir[2]===T[1]?_.frente??_.side:_.side,b=m%h,x=m/h|0,S=b/h+g,E=(b+1)/h-g,D=1-(x+1)/h+g,ee=1-x/h-g,O=i.length/3;for(let n of l.corners){let r=y&&n.pos[1]===1?y[n.pos[0]]?.[n.pos[2]]??1:n.pos[1];i.push(c+n.pos[0],e+r,t+n.pos[2]),a.push(l.dir[0],l.dir[1],l.dir[2]),o.push(n.uv[0]===1?E:S,n.uv[1]===1?ee:D)}u(4),f(4,n(c+l.dir[0],e+l.dir[1],t+l.dir[2])),v.push(O,O+1,O+2,O+2,O+1,O+3)}}let C=p.length||m.length?s.concat(p,m):s;return{sway:new Uint8Array(c.map(e=>Math.round(e*255))),luz:new Uint8Array(d),positions:new Float32Array(i),normals:new Float32Array(a),uvs:new Float32Array(o),indices:new Uint32Array(C),opaqueIndexCount:s.length,aguaIndexCount:p.length}}function Ap(e){let t=-Math.sin(e),n=-Math.cos(e);return Math.abs(t)>Math.abs(n)?t>0?0:2:n>0?1:3}function jp(e,t,n){let r=Math.abs(Math.sin(t))>Math.abs(Math.cos(t));if(e===G.PortaXFechada||e===G.PortaZFechada)return r?G.PortaXFechada:G.PortaZFechada;if(e===G.JanelaXFechada||e===G.JanelaZFechada)return r?G.JanelaXFechada:G.JanelaZFechada;if(au(e)||ou(e)||su(e)||iu(e)){let n=(Ap(t)+2)%4;return(au(e)?G.CadeiraXP:ou(e)?G.SofaXP:su(e)?G.CamaXP:G.QuadroXP)+n}if(Dl(e))return Al((Ap(t)+2)%4);if(Jl(e)){let t=e-+!!Yl(e);return n?t+1:t}return Zl(e)?tu(eu(e),Ap(t),n):e}function Mp(e){return mu(e)?G.PortaXFechada:vu(e)?G.JanelaXFechada:au(e)?G.CadeiraXP:ou(e)?G.SofaXP:su(e)?G.CamaXP:iu(e)?G.QuadroXP:Dl(e)?G.Fornalha:Jl(e)?G.LajePedraBaixo+Xl(e)*2:Zl(e)?G.EscadaPedraXP+eu(e)*8:e}function Np(e){return e.ou&&e.ou.length>0?[e.id,...e.ou]:[e.id]}function Pp(e){return e.aposentada===void 0}var Fp=[{saida:{id:G.Planks,qtd:4},custo:[{id:G.Log,qtd:1}]},{saida:{id:G.Planks,qtd:4},custo:[{id:G.LogIpe,qtd:1}]},{saida:{id:G.Planks,qtd:4},custo:[{id:G.LogAraucaria,qtd:1}]},{saida:{id:G.Planks,qtd:4},custo:[{id:G.LogPauBrasil,qtd:1}]},{saida:{id:G.LajeTabuaBaixo,qtd:6},custo:[{id:G.Planks,qtd:3}]},{saida:{id:G.EscadaTabuaXP,qtd:4},custo:[{id:G.Planks,qtd:6}]},{saida:{id:G.Mesa,qtd:1},custo:[{id:G.Planks,qtd:4}]},{saida:{id:G.Cerca,qtd:3},custo:[{id:G.Planks,qtd:4}]},{saida:{id:G.LajePedraBaixo,qtd:6},custo:[{id:G.Cobblestone,qtd:3}]},{saida:{id:G.EscadaPedraXP,qtd:4},custo:[{id:G.Cobblestone,qtd:6}]},{saida:{id:900,qtd:1},custo:[{id:909,qtd:3}]},{saida:{id:904,qtd:1},custo:[{id:903,qtd:3}]}],Ip={id:G.FlorVermelha,qtd:1},Lp={id:G.FlorAmarela,qtd:1},Rp={id:G.FlorAzul,qtd:1},zp={id:G.FlorBranca,qtd:1},Bp={id:G.Mandacaru,qtd:1},Vp=[{nome:`branco`,la:G.WoolWhite,vidro:G.VidroBranco,tapete:G.TapeteBranco,corante:[zp]},{nome:`preto`,la:G.WoolBlack,vidro:G.VidroPreto,tapete:G.TapetePreto,corante:[{id:905,qtd:1}]},{nome:`vermelho`,la:G.WoolRed,vidro:G.VidroVermelho,tapete:G.TapeteVermelho,corante:[Ip]},{nome:`laranja`,la:G.WoolOrange,vidro:G.VidroLaranja,tapete:G.TapeteLaranja,corante:[Lp,Ip]},{nome:`amarelo`,la:G.WoolYellow,vidro:G.VidroAmarelo,tapete:G.TapeteAmarelo,corante:[Lp]},{nome:`verde`,la:G.WoolGreen,vidro:G.VidroVerde,tapete:G.TapeteVerde,corante:[Bp]},{nome:`azul`,la:G.WoolBlue,vidro:G.VidroAzul,tapete:G.TapeteAzul,corante:[Rp]},{nome:`roxo`,la:G.WoolPurple,vidro:G.VidroRoxo,tapete:G.TapeteRoxo,corante:[Ip,Rp]},{nome:`rosa`,la:G.WoolPink,vidro:G.VidroRosa,tapete:G.TapeteRosa,corante:[Ip,zp]},{nome:`ciano`,la:G.WoolCyan,vidro:G.VidroCiano,tapete:G.TapeteCiano,corante:[Rp,Bp]},{nome:`cinza`,la:G.WoolGray,vidro:G.VidroCinza,tapete:G.TapeteCinza,corante:[{id:G.Cobblestone,qtd:1}]},{nome:`marrom`,la:G.WoolBrown,vidro:G.VidroMarrom,tapete:G.TapeteMarrom,corante:[{id:G.Dirt,qtd:1}]}],Hp=[{saida:{id:G.Glass,qtd:1},custo:[{id:G.Sand,qtd:2}],aposentada:`agora o vidro sai da FORNALHA (areia derretida) — §🍖 F10b`},{saida:{id:G.Stone,qtd:1},custo:[{id:G.Cobblestone,qtd:2}]},{saida:{id:G.StoneBricks,qtd:4},custo:[{id:G.Stone,qtd:4}]},{saida:{id:G.Sandstone,qtd:1},custo:[{id:G.Sand,qtd:4}]},{saida:{id:G.Brick,qtd:4},custo:[{id:G.Dirt,qtd:2},{id:G.Sand,qtd:2}]},{saida:{id:G.Gravel,qtd:2},custo:[{id:G.Cobblestone,qtd:1}]},{saida:{id:G.Obsidian,qtd:1},custo:[{id:G.Stone,qtd:4},{id:905,qtd:1}]},{saida:{id:G.LajeTijoloBaixo,qtd:6},custo:[{id:G.Brick,qtd:3}]},{saida:{id:G.EscadaTijoloXP,qtd:4},custo:[{id:G.Brick,qtd:6}]},{saida:{id:G.Tocha,qtd:4},custo:[{id:907,qtd:1},{id:905,qtd:1,ou:[908]}]}],Up=3,Wp=[{saida:{id:G.WoolWhite,qtd:1},custo:[{id:911,qtd:Up}]},...Vp.filter(e=>e.la!==G.WoolWhite).map(e=>({saida:{id:e.la,qtd:1},custo:[{id:911,qtd:Up},...e.corante]}))],Gp=Vp.map(e=>({saida:{id:e.vidro,qtd:1},custo:[{id:G.Glass,qtd:1},...e.corante]})),Kp=Vp.map(e=>({saida:{id:e.tapete,qtd:3},custo:[{id:911,qtd:2*Up},...e.la===G.WoolWhite?[]:e.corante]})),qp=[{saida:{id:G.PortaXFechada,qtd:3},custo:[{id:G.Planks,qtd:6}]},{saida:{id:G.JanelaXFechada,qtd:2},custo:[{id:G.Glass,qtd:2},{id:G.Planks,qtd:1}]},{saida:{id:G.CadeiraXP,qtd:1},custo:[{id:G.Planks,qtd:4}]},{saida:{id:G.SofaXP,qtd:1},custo:[{id:G.Planks,qtd:3},{id:911,qtd:2*Up}]},{saida:{id:G.CamaXP,qtd:1},custo:[{id:G.Planks,qtd:3},{id:911,qtd:3*Up}]},{saida:{id:G.QuadroXP,qtd:1},custo:[{id:G.Planks,qtd:2},{id:911,qtd:Up}]}],Jp=[{saida:{id:G.Leaves,qtd:4},custo:[{id:G.Log,qtd:1}]},{saida:{id:G.FolhasIpe,qtd:4},custo:[{id:G.LogIpe,qtd:1}]},{saida:{id:G.FolhasAraucaria,qtd:4},custo:[{id:G.LogAraucaria,qtd:1}]},{saida:{id:G.FolhasPauBrasil,qtd:4},custo:[{id:G.LogPauBrasil,qtd:1}]},{saida:{id:G.Grass,qtd:1},custo:[{id:G.Dirt,qtd:1},{id:G.Plantacao0,qtd:1}]},{saida:{id:G.GramaSeca,qtd:1},custo:[{id:G.Dirt,qtd:1},{id:G.Sand,qtd:1}]},{saida:{id:G.GramaFria,qtd:1},custo:[{id:G.Dirt,qtd:1},{id:G.Snow,qtd:1}]},{saida:{id:G.GramaAlta,qtd:2},custo:[{id:G.Plantacao0,qtd:1},{id:G.Grass,qtd:1}]},{saida:{id:G.GramaAltaSeca,qtd:2},custo:[{id:G.Plantacao0,qtd:1},{id:G.GramaSeca,qtd:1}]},{saida:{id:G.GramaAltaFria,qtd:2},custo:[{id:G.Plantacao0,qtd:1},{id:G.GramaFria,qtd:1}]}],Yp=Array.from({length:36},(e,t)=>({saida:{id:t<26?G.LetterA+t:G.Digit0+(t-26),qtd:1},custo:[{id:G.Cobblestone,qtd:1},{id:905,qtd:1}]})),Xp=[{saida:{id:907,qtd:4},custo:[{id:G.Planks,qtd:2}]},{saida:{id:G.Fornalha,qtd:1},custo:[{id:G.Cobblestone,qtd:8}]},{saida:{id:G.Tocha,qtd:4},custo:[{id:907,qtd:1},{id:908,qtd:1}],aposentada:`virou UMA receita só — o carvão vegetal é alternativa do mineral (2026-08-05)`},{saida:{id:G.Bau,qtd:1},custo:[{id:G.Planks,qtd:8}]},{saida:{id:912,qtd:1},custo:[{id:G.Planks,qtd:3},{id:907,qtd:2}]},{saida:{id:913,qtd:1},custo:[{id:G.Cobblestone,qtd:3},{id:907,qtd:2}]},{saida:{id:914,qtd:1},custo:[{id:909,qtd:3},{id:907,qtd:2}]},{saida:{id:915,qtd:1},custo:[{id:906,qtd:3},{id:907,qtd:2}]}],Zp=[...Fp,...Hp,...Wp,...Gp,...Kp,...qp,...Jp,...Yp,...Xp];G.Dirt,G.Cobblestone,G.Sand,G.Snow,G.Log,G.LogIpe,G.LogAraucaria,G.LogPauBrasil,G.Mandacaru,G.FlorVermelha,G.FlorAmarela,G.FlorAzul,G.FlorBranca,G.MinerioCarvao,G.MinerioFerro,G.MinerioOuro,G.MinerioDiamante,G.Plantacao0,G.Algodao0,G.AlgodaoSelvagem,G.Cenoura0,G.CenouraSelvagem,G.Batata0,G.BatataSelvagem,G.Beterraba0,G.BeterrabaSelvagem,G.Melancia0,G.MelanciaSelvagem,G.Banana0,G.BananaSelvagem,G.Aipim0,G.AipimSelvagem,G.MudaComum0,G.MudaIpe0,G.MudaAraucaria0,G.MudaPauBrasil0,G.Bedrock;function Qp(e,t){let n=0;for(let r of Np(t))n+=td(e,r);return n}function $p(e,t){return em(e,t)!==null}function em(e,t){if(!Pp(t))return null;let n=e;for(let e of t.custo){let t=e.qtd;for(let r of Np(e)){if(t<=0)break;let e=Math.min(t,td(n,r));if(e<=0)continue;let{inv:i,removido:a}=ad(n,r,e);n=i,t-=a}if(t>0)return null}return rd(n,t.saida.id,t.saida.qtd)?id(n,t.saida.id,t.saida.qtd).inv:null}function tm(e,t){return t.custo.map(t=>{let n=Qp(e,t);return{id:t.id,ids:Np(t),need:t.qtd,have:n,falta:Math.max(0,t.qtd-n)}})}var nm=[{nome:`manter-inventario`,padrao:!0,ajuda:`Ao morrer, o jogador MANTÉM o que estava carregando. Ligada é o padrão de escola; desligue se quiser que a morte pese (aí os itens somem).`},{nome:`pvp`,padrao:!1,ajuda:`Alunos podem se atacar: clique esquerdo em outro jogador, ao alcance, tira um coração. Só vale entre quem está em sobrevivência, e mundo de aula ignora a regra. Desligada por padrão — ligue com /pvp ligar.`},{nome:`fome`,padrao:!0,ajuda:`A barra de fome (as coxas) baixa com o esforço: andar, construir e se curar gastam. No zero, o jogador para de se regenerar e perde vida devagar — mas a fome NÃO mata enquanto não houver comida no jogo. Desligue para uma sobrevivência sem fome (fundamental 1).`}];function rm(e){return nm.find(t=>t.nome===e)}function im(){return nm.map(e=>e.nome)}function am(e){let t=new Map;if(typeof e!=`object`||!e||Array.isArray(e))return t;for(let[n,r]of Object.entries(e)){let e=rm(n);!e||typeof r!=`boolean`||r!==e.padrao&&t.set(n,r)}return t}function om(e){let t={},n=0;for(let r of nm){let i=e.get(r.nome);i!==void 0&&i!==r.padrao&&(t[r.nome]=i,n++)}return n?t:void 0}function sm(e,t,n,r,i,a,o,s,c,l,u){let d=0,f=u,p=-1;{let t=o+l[0],n=o+l[3];if(r!==0){let i=1/r,a=(t-e)*i,o=(n-e)*i;if(a>o){let e=a;a=o,o=e}if(a>d&&(d=a,p=0),o<f&&(f=o),d>f)return null}else if(e<t||e>n)return null}{let e=s+l[1],n=s+l[4];if(i!==0){let r=1/i,a=(e-t)*r,o=(n-t)*r;if(a>o){let e=a;a=o,o=e}if(a>d&&(d=a,p=1),o<f&&(f=o),d>f)return null}else if(t<e||t>n)return null}{let e=c+l[2],t=c+l[5];if(a!==0){let r=1/a,i=(e-n)*r,o=(t-n)*r;if(i>o){let e=i;i=o,o=e}if(i>d&&(d=i,p=2),o<f&&(f=o),d>f)return null}else if(n<e||n>t)return null}return d>u?null:p===0?[r>0?-1:1,0,0]:p===1?[0,i>0?-1:1,0]:p===2?[0,0,a>0?-1:1]:[0,0,0]}function cm(e,t,n,r,i,a,o,s){let c=Math.hypot(r,i,a);if(c===0||!Number.isFinite(c))return null;r/=c,i/=c,a/=c;let l=q.width/2,u=null;for(let c of o){let o=lm(e,t,n,r,i,a,c.x-l,c.y,c.z-l,c.x+l,c.y+q.height,c.z+l,s);o!==null&&(!u||o<u.dist)&&(u={id:c.id,dist:o})}return u}function lm(e,t,n,r,i,a,o,s,c,l,u,d,f){let p=0,m=f,h=[[e,r,o,l],[t,i,s,u],[n,a,c,d]];for(let[e,t,n,r]of h){if(t===0){if(e<n||e>r)return null;continue}let i=1/t,a=(n-e)*i,o=(r-e)*i;if(a>o){let e=a;a=o,o=e}if(a>p&&(p=a),o<m&&(m=o),p>m)return null}return p>f?null:p}function um(e,t,n,r,i,a,o,s,c=!1){let l=Math.hypot(i,a,o);if(l===0||!Number.isFinite(l))return null;i/=l,a/=l,o/=l;let u=Math.floor(t),d=Math.floor(n),f=Math.floor(r),p=i>0?1:-1,m=a>0?1:-1,h=o>0?1:-1,g=i===0?1/0:Math.abs(1/i),_=a===0?1/0:Math.abs(1/a),v=o===0?1/0:Math.abs(1/o),y=i===0?1/0:(i>0?u+1-t:t-u)*g,b=a===0?1/0:(a>0?d+1-n:n-d)*_,x=o===0?1/0:(o>0?f+1-r:r-f)*v,S=0,C=0,w=0,T=0;for(;T<=s;){let l=K(e,u,d,f);if(c&&bl(l))return{x:u,y:d,z:f,nx:S,ny:C,nz:w};if(l!==G.Air&&!bl(l)){if(Cu(l))return{x:u,y:d,z:f,nx:S,ny:C,nz:w};let e=sm(t,n,r,i,a,o,u,d,f,dp(l),s);if(e)return{x:u,y:d,z:f,nx:e[0],ny:e[1],nz:e[2]}}y<b&&y<x?(u+=p,T=y,y+=g,S=-p,C=0,w=0):b<x?(d+=m,T=b,b+=_,S=0,C=-m,w=0):(f+=h,T=x,x+=v,S=0,C=0,w=-h)}return null}var dm=(e,t,n,r)=>n===0||K(e,t,n-1,r)!==G.Air?null:[{x:t,y:n-1,z:r,blockId:K(e,t,n,r)},{x:t,y:n,z:r,blockId:G.Air}],fm=(e,t,n,r)=>{let i=K(e,t,n,r);return K(e,t,n+1,r)===i||K(e,t,n-1,r)===i?null:[{x:t,y:n,z:r,blockId:G.Air}]},pm=(e,t,n,r)=>{let i=K(e,t,n,r),{dx:a,dz:o}=cu(i);return K(e,t+a,n,r+o)===i||K(e,t-a,n,r-o)===i?null:[{x:t,y:n,z:r,blockId:G.Air}]},mm=(e,t,n,r)=>fu(K(e,t,n,r),K(e,t,n-1,r))?null:[{x:t,y:n,z:r,blockId:G.Air}],hm=[[1,0],[-1,0],[0,1],[0,-1]];function gm(e){return e===G.Grass||e===G.GramaSeca||e===G.GramaFria}var _m=(e,t,n,r)=>{let i=K(e,t,n,r);if(!gm(i))return null;let a=[];for(let[o,s]of hm){let c=t+o,l=r+s;K(e,c,n,l)===G.Dirt&&K(e,c,n+1,l)===G.Air&&a.push({x:c,y:n,z:l,blockId:i})}return a.length?a:null};function vm(e,t,n,r){let i=0;for(let[a,o]of hm)xl(K(e,t+a,n,r+o))&&i++;return i}function ym(e,t,n,r){if(bl(K(e,t,n+1,r)))return 7;let i=0;for(let[a,o]of hm){let s=Sl(K(e,t+a,n,r+o));s>0&&(i=Math.max(i,s-1))}return i}var bm=4;function xm(e,t,n,r){if(!Hu(e,t,n-1,r))return!1;let i=K(e,t,n-1,r);return i===G.Air||bl(i)&&!xl(i)}function Sm(e,t,n,r){if(!Hu(e,t,n,r))return!1;let i=K(e,t,n,r);return i===G.Air||bl(i)&&!xl(i)}function Cm(e,t,n,r,i,a,o){let s=1/0;for(let[c,l]of hm){if(c===a&&l===o)continue;let u=t+c,d=r+l;if(!Sm(e,u,n,d))continue;if(xm(e,u,n,d))return i;if(i>=bm)continue;let f=Cm(e,u,n,d,i+1,-c,-l);f<s&&(s=f)}return s}var wm=(e,t,n,r)=>{let i=K(e,t,n,r),a=[],o=K(e,t,n-1,r),s;if(xl(i))s=8;else if(Cu(o)&&!bl(o)&&vm(e,t,n,r)>=2)a.push({x:t,y:n,z:r,blockId:G.Agua}),s=8;else{let o=ym(e,t,n,r);if(o<=0)return[{x:t,y:n,z:r,blockId:G.Air}];o!==Sl(i)&&a.push({x:t,y:n,z:r,blockId:Cl(o)}),s=o}if(o===G.Air)a.push({x:t,y:n-1,z:r,blockId:G.AguaFluida7});else if(Cu(o)&&!bl(o)){let i=s-1;if(i>=1){let o=[1/0,1/0,1/0,1/0],s=[!1,!1,!1,!1],c=1/0;for(let[a,[l,u]]of hm.entries()){let d=t+l,f=r+u,p=K(e,d,n,f);if(s[a]=Hu(e,d,n,f)&&(p===G.Air||bl(p)&&!xl(p)&&Sl(p)<i),!Sm(e,d,n,f))continue;let m=xm(e,d,n,f)?0:Cm(e,d,n,f,1,-l,-u);o[a]=m,m<c&&(c=m)}let l=c!==1/0;for(let[e,[u,d]]of hm.entries())s[e]&&(l&&(o[e]??1/0)>c||a.push({x:t+u,y:n,z:r+d,blockId:Cl(i)}))}}return a.length?a:null},Tm=new Map([[G.Sand,dm],[G.Gravel,dm],[G.PortaXFechada,fm],[G.PortaXAberta,fm],[G.PortaZFechada,fm],[G.PortaZAberta,fm],[G.PortaXFechadaR,fm],[G.PortaXAbertaR,fm],[G.PortaZFechadaR,fm],[G.PortaZAbertaR,fm],[G.Tocha,mm]]);for(let e of[G.CamaXP,G.CamaZP,G.CamaXN,G.CamaZN])Tm.set(e,pm);for(let e=0;e<256;e++)du(e)&&!Tm.has(e)&&Tm.set(e,mm);for(let e=G.Agua;e<=G.AguaFluida7;e++)Tm.set(e,wm);for(let e of[G.Grass,G.GramaSeca,G.GramaFria])Tm.set(e,_m);var Em=8;function Dm(e){if(typeof e!=`object`||!e)return!1;let t=e;return[`x`,`y`,`z`].every(e=>typeof t[e]==`number`&&Number.isFinite(t[e]))}function Om(e){if(e===void 0)return{};let t=sd(cd(e));return t.length?{inventario:t}:{}}function km(e){if(e.byteLength<Em)throw Error(`save menor que o header (${e.byteLength} bytes)`);let t=new DataView(e),n=t.getUint32(0,!0);if(n===844319308)return Am(e,t);if(n!==827542092)throw Error(`save com magic inválido — não é um arquivo .ljw`);let{jsonLen:r,meta:i}=jm(e,t),a=Od(e.slice(Em+r));return{...i,world:a.world}}function Am(e,t){let{jsonLen:n,m:r,meta:i}=jm(e,t),a=r.dims,o=typeof a==`object`&&a&&typeof a.x==`number`&&typeof a.z==`number`&&typeof a.y==`number`?a:null;if(!o||o.x<1||o.z<1||o.y<1||o.x>Ad.x||o.z>Ad.z||o.y>Ad.y)throw Error(`save esparso sem dims válidas`);let s=Em+n;if(s+4>e.byteLength)throw Error(`save esparso truncado (sem contagem)`);let c=t.getUint32(s,!0);if(s+=4,s+c*4100>e.byteLength)throw Error(`save esparso truncado (${c} chunks não cabem)`);let l=o.x*o.y*o.z,u=[];for(let n=0;n<c;n++){let n=t.getUint32(s,!0);s+=4,n<l&&u.push({index:n,bytes:new Uint8Array(e.slice(s,s+Pu))}),s+=Pu}return{...i,dims:o,world:Lu(o,!1),editedChunks:u}}function jm(e,t){let n=t.getUint32(4,!0);if(Em+n>e.byteLength)throw Error(`save truncado: JSON de metadados maior que o arquivo`);let r;try{r=JSON.parse(new TextDecoder().decode(new Uint8Array(e,Em,n)))}catch{throw Error(`save com JSON de metadados quebrado`)}if(typeof r!=`object`||!r)throw Error(`metadados não são objeto`);let i=r;if(typeof i.seed!=`number`||!Number.isFinite(i.seed))throw Error(`save sem seed válida`);if(!Dm(i.spawn))throw Error(`save sem spawn válido`);let a=[];if(Array.isArray(i.roster)){for(let e of i.roster)if(typeof e==`object`&&e&&typeof e.name==`string`&&Dm(e)){let t=e,n=e=>typeof e==`number`&&Number.isFinite(e)?e:0;a.push({name:t.name,x:t.x,y:t.y,z:t.z,yaw:n(t.yaw),pitch:n(t.pitch),...typeof t.pin==`string`?{pin:t.pin}:{},...t.papel===`professor`?{papel:`professor`}:{},...typeof t.vida==`number`&&Number.isFinite(t.vida)&&t.vida>0&&t.vida<20?{vida:Math.floor(t.vida)}:{},...typeof t.fome==`number`&&Number.isFinite(t.fome)&&t.fome>=0&&t.fome<20?{fome:Math.floor(t.fome)}:{},...Om(t.inventario)})}}let o=[];if(Array.isArray(i.regioes))for(let e of i.regioes){let t=Ju(e);t&&o.push(t)}let s=Cd(i.cenario),c=hd(i.grupos),l=[];if(Array.isArray(i.claims))for(let e of i.claims){let t=Yu(e);t&&l.push(t)}let u=[];if(Array.isArray(i.amigos))for(let e of i.amigos){let t=Xu(e);t&&u.push(t)}let d=[];if(Array.isArray(i.banidos))for(let e of i.banidos)typeof e==`string`&&e&&!d.includes(e)&&d.push(e);let f=[];if(Array.isArray(i.quadros))for(let e of i.quadros){let t=Qu(e);t&&f.push(t)}let p=[];if(Array.isArray(i.containers))for(let e of i.containers){let t=md(e);t&&p.push(t)}let m,h=i.modosPorJogador;if(typeof h==`object`&&h&&!Array.isArray(h))for(let[e,t]of Object.entries(h)){let n=gd(t);!e||!n||(m??={},m[e]=n)}let g=om(am(i.regras));return{jsonLen:n,m:i,meta:{seed:i.seed,spawn:{x:i.spawn.x,y:i.spawn.y,z:i.spawn.z},roster:a,...typeof i.codigo==`string`?{codigo:i.codigo}:{},...o.length?{regioes:o}:{},...s?.objetivos.length?{cenario:s}:{},...c.length?{grupos:c}:{},...i.claimsAtivo===!0?{claimsAtivo:!0}:{},...l.length?{claims:l}:{},...u.length?{amigos:u}:{},...d.length?{banidos:d}:{},...i.confinamento===!0?{confinamento:!0}:{},...f.length?{quadros:f}:{},...p.length?{containers:p}:{},...typeof i.hora==`number`&&Number.isFinite(i.hora)?{hora:i.hora}:{},...typeof i.ciclo==`boolean`?{ciclo:i.ciclo}:{},...i.vento===!1?{vento:!1}:{},...gd(i.modo)?{modo:gd(i.modo)}:{},...m?{modosPorJogador:m}:{},...g?{regras:g}:{}}}}var Mm=`0.10.1`,Nm=.11,Pm=3042486,Fm=class{scene;fog=new vn(Pm,Nm);tint;submerso=!1;constructor(e){this.scene=e,this.tint=document.createElement(`div`),this.tint.style.cssText=`position:fixed;inset:0;pointer-events:none;z-index:1;opacity:0;transition:opacity .18s linear;background:rgba(38,104,170,.3)`,document.body.appendChild(this.tint)}update(e,t,n,r){let i=Im(e,t,n,r);i!==this.submerso&&(this.submerso=i,this.scene.fog=i?this.fog:null,this.tint.style.opacity=i?`1`:`0`)}get estaSubmerso(){return this.submerso}};function Im(e,t,n,r){let i=Math.floor(t),a=Math.floor(n),o=Math.floor(r),s=K(e,i,a,o);return bl(s)?bl(K(e,i,a+1,o))?!0:n-a<Sl(s)/8*vp:!1}var Lm=new Set;function Rm(e){Lm.add(e)}function zm(e){for(let t of Lm)t(e)}var Bm=null,Vm=null,Hm=.8;function Um(){if(!Bm)try{Bm=new AudioContext,Vm=Bm.createGain(),Vm.gain.value=Hm,Vm.connect(Bm.destination)}catch{return null}return Bm.state===`suspended`&&Bm.resume(),Bm}function Wm(e){Hm=e,Vm&&(Vm.gain.value=e)}function Gm(e,t,n,r,i,a=0){if(!Bm||!Vm)return;let o=Bm.currentTime+a/1e3,s=o+n/1e3,c=Bm.createOscillator();c.type=r,c.frequency.setValueAtTime(e,o),c.frequency.exponentialRampToValueAtTime(Math.max(t,1),s);let l=Bm.createGain();l.gain.setValueAtTime(0,o),l.gain.linearRampToValueAtTime(i,o+.008),l.gain.exponentialRampToValueAtTime(1e-4,s),c.connect(l).connect(Vm),c.start(o),c.stop(s+.01)}function Km(e){if(Um())switch(e){case`click`:Gm(700,980,70,`triangle`,.22);break;case`back`:Gm(520,340,90,`triangle`,.2);break;case`confirm`:Gm(660,660,80,`sine`,.22),Gm(990,990,110,`sine`,.2,85);break;case`notify`:Gm(880,880,90,`sine`,.18),Gm(1175,1175,130,`sine`,.16,100);break;case`denied`:Gm(220,160,180,`sawtooth`,.15);break}}function qm(e){Bm&&Km(e)}function Jm(e){Wm(e),window.addEventListener(`pointerdown`,()=>void Um(),{capture:!0});let t=-1/0;Rm(e=>{if(e.kind===`objective_complete`)t=performance.now(),qm(`confirm`);else if(e.kind===`chat_message`){if(performance.now()-t<800)return;qm(`notify`)}})}var Ym=20260726,Xm=.75,Zm=24,Qm=96,$m=18,eh=-.25,th={raioRender:6,meshMsPorFrame:6,pixelRatioCap:1,fov:75,nuvens:!0,balanco:!0};function nh(e){if(!e.has(`bench`))return null;let t=Number(e.get(`bench`));return{duracaoS:Number.isFinite(t)&&t>=10?Math.min(t,300):30,semVida:e.has(`semvida`)}}function rh(e){return e.semVida?{...th,nuvens:!1,balanco:!1}:{...th}}var ih=class e{duracaoS;trajeto;semVida;t0=0;rodando=!1;constructor(e,t,n=!1){this.duracaoS=e,this.trajeto=t,this.semVida=n}static paraMundo(t,n,r){let i=Math.min(r.x,r.z)*16,a=Math.max(16,Math.min(Qm,i/2-16)),o=(e,t)=>Math.min(Math.max(e,a+8),Math.max(a+8,t*16-a-8));return new e(t.duracaoS,{centroX:+o(n.x,r.x).toFixed(2),centroZ:+o(n.z,r.z).toFixed(2),y:+(n.y+Zm).toFixed(2),raio:+a.toFixed(2)},t.semVida)}get ativo(){return this.rodando}iniciar(e){this.t0=e,this.rodando=!0}terminou(e){return this.rodando&&(e-this.t0)/1e3>=this.duracaoS}parar(){this.rodando=!1}pontoDoVoo(e){let{centroX:t,centroZ:n,raio:r}=this.trajeto,i=$m*e/r,a=-Math.sin(i),o=Math.cos(i);return{x:t+Math.cos(i)*r,z:n+Math.sin(i)*r,yaw:Math.atan2(-a,-o)}}amostra(e){let t=Math.min((e-this.t0)/1e3,this.duracaoS),n=this.duracaoS*Xm;if(t<n){let e=this.pontoDoVoo(t);return{x:e.x,y:this.trajeto.y,z:e.z,yaw:e.yaw,pitch:eh,fase:`voo`,t:+t.toFixed(2)}}let r=this.pontoDoVoo(n),i=(t-n)/(this.duracaoS-n)*Math.PI*2;return{x:r.x,y:this.trajeto.y,z:r.z,yaw:r.yaw+i,pitch:eh,fase:`giro`,t:+t.toFixed(2)}}meta(){return{versaoTrajeto:1,duracaoS:this.duracaoS,seed:Ym,trajeto:{...this.trajeto,fracaoVoo:Xm,velocidadeBlocosS:$m,pitch:eh},config:rh(this),semVida:this.semVida,viewport:`${window.innerWidth}×${window.innerHeight}`,dpr:window.devicePixelRatio}}},ah=6;function oh(e,t){let n=(document.elementFromPoint(e,t)?.closest?.(`.inv-slot`))?.dataset.slot;if(n===void 0)return null;let r=Number(n);return Number.isInteger(r)?r:null}function sh(e,t,n,r){for(let i=t;i<n;i++){let t=e[i];if(t==null||t.id===r&&t.qtd<$u(r))return i}return null}var ch=class{hooks;cand=null;arrastando=!1;suprimirClique=!1;ghost=null;qtdFantasma=0;px=0;py=0;constructor(e){this.hooks=e,document.addEventListener(`pointermove`,e=>this.mover(e)),document.addEventListener(`pointerup`,e=>this.soltar(e))}sincronizar(){this.hooks.pegando()===null&&this.esconderFantasma()}anexar(e,t,n,r){e.dataset.slot=String(t),e.addEventListener(`pointerdown`,e=>this.pressionar(t,n,r,e)),e.addEventListener(`click`,e=>this.clique(t,n===null,e))}pressionar(e,t,n,r){if(this.suprimirClique=!1,this.px=r.clientX,this.py=r.clientY,r.pointerType===`mouse`){if(r.button===2){r.preventDefault();let i=this.hooks.pegando();if(i===null){if(t===null||n<2)return;let r=Math.ceil(n/2);this.hooks.setPegando(e),this.hooks.setMetade(r),this.mostrarFantasma(e,r),this.hooks.redesenhar()}else i!==e&&(this.hooks.mover(i,e,1),this.qtdFantasma=Math.max(1,this.qtdFantasma-1),this.hooks.redesenhar());this.suprimirClique=!0;return}r.button===0&&(this.cand={slot:this.hooks.pegando()??e,x:r.clientX,y:r.clientY})}}mover(e){if(this.px=e.clientX,this.py=e.clientY,this.posicionarFantasma(),!this.cand)return;let t=e.clientX-this.cand.x,n=e.clientY-this.cand.y;if(!(!this.arrastando&&Math.hypot(t,n)<ah)){if(!this.arrastando){this.arrastando=!0,this.hooks.pegando()===null&&(this.hooks.setPegando(this.cand.slot),this.hooks.setMetade(null));let e=this.hooks.pegando();e!==null&&(this.mostrarFantasma(e,this.hooks.metade()??this.hooks.qtdDe(e)),this.hooks.redesenhar())}this.posicionarFantasma()}}soltar(e){if(!this.cand)return;let t=this.cand.slot;if(this.cand=null,!this.arrastando)return;this.arrastando=!1,this.suprimirClique=!0;let n=this.hooks.slotEm(e.clientX,e.clientY);n!==null&&n!==t&&this.hooks.mover(t,n,this.hooks.metade()??void 0),this.hooks.setPegando(null),this.hooks.setMetade(null),this.esconderFantasma(),this.hooks.redesenhar()}clique(e,t,n){if(this.suprimirClique){this.suprimirClique=!1;return}this.hooks.aoClicar(e,t,n.shiftKey)}mostrarFantasma(e,t){this.ghost||(this.ghost=document.createElement(`div`),this.ghost.className=`arrasto-fantasma`,this.ghost.style.cssText=`position:fixed;pointer-events:none;z-index:999;filter:drop-shadow(0 2px 3px rgba(0,0,0,0.5));`,document.body.appendChild(this.ghost)),this.qtdFantasma=t;let n=document.createElement(`img`);if(n.src=this.hooks.iconeDe(e)??``,n.style.cssText=`width:40px;height:40px;`,this.ghost.replaceChildren(n),t>1){let e=document.createElement(`b`);e.textContent=String(t),e.style.cssText=`position:absolute;right:-2px;bottom:-2px;color:#fff;background:rgba(0,0,0,0.7);border-radius:8px;padding:0 5px;font:700 13px/1.4 system-ui,sans-serif;`,this.ghost.appendChild(e)}this.posicionarFantasma()}posicionarFantasma(){this.ghost&&(this.ghost.style.setProperty(`left`,`${this.px+8}px`),this.ghost.style.setProperty(`top`,`${this.py+8}px`))}esconderFantasma(){this.ghost?.replaceChildren(),this.qtdFantasma=0}},lh=400,uh=2500,dh=12,fh=16,ph=3,mh={nameOf:e=>`#${e}`,sobrevivencia:()=>!1},hh=class{el;alvo=null;visivel=!1;timerToque=null;timerSaida=null;toque=null;constructor(){this.el=document.createElement(`div`),this.el.className=`tooltip-item hidden`,document.body.appendChild(this.el);let e=e=>this.aoApontar(e);document.addEventListener(`pointerover`,e),document.addEventListener(`pointermove`,e),document.addEventListener(`touchstart`,e=>this.aoTocar(e),{passive:!0}),document.addEventListener(`touchmove`,e=>this.aoArrastar(e),{passive:!0}),document.addEventListener(`touchend`,()=>this.aoSoltar()),document.addEventListener(`touchcancel`,()=>this.aoSoltar()),document.addEventListener(`scroll`,()=>this.esconder(),!0)}aoApontar(e){if(e.pointerType!==`mouse`)return;let t=_h(e.target,e.clientX,e.clientY);if(!t){this.esconder();return}t!==this.alvo&&(this.alvo=t,!this.pintar(t))||this.posicionar(e.clientX,e.clientY)}aoTocar(e){this.limparTimers();let t=e.touches[0],n=t?_h(e.target,t.clientX,t.clientY):null;if(!t||!n){this.esconder();return}this.toque={x:t.clientX,y:t.clientY},this.timerToque=window.setTimeout(()=>{this.timerToque=null;let e=this.toque;e&&(this.alvo=n,this.pintar(n)&&(this.posicionar(e.x,e.y,!0),this.engolirProximoClique()))},lh)}aoArrastar(e){let t=e.touches[0],n=this.toque;!t||!n||Math.hypot(t.clientX-n.x,t.clientY-n.y)<dh||(this.limparTimers(),this.esconder())}aoSoltar(){this.timerToque!==null&&(window.clearTimeout(this.timerToque),this.timerToque=null),this.toque=null,this.visivel&&(this.timerSaida=window.setTimeout(()=>this.esconder(),uh))}engolirProximoClique(){let e=e=>{e.stopPropagation(),e.preventDefault()};document.addEventListener(`click`,e,{capture:!0,once:!0}),window.setTimeout(()=>document.removeEventListener(`click`,e,!0),1200)}pintar(e){let t=e.dataset.tipId,n=[];if(t!==void 0){let e=Number(t);if(!Number.isInteger(e))return this.esconder(),!1;let r=document.createElement(`b`);r.className=`tip-nome`,r.textContent=mh.nameOf(e),n.push(r);for(let t of _f(e)){let e=yh(t);e&&n.push(vh(e))}}else{let t=e.dataset.tip;if(!t)return this.esconder(),!1;let r=document.createElement(`b`);r.className=`tip-nome`,r.textContent=t,n.push(r)}return this.el.replaceChildren(...n),this.el.classList.remove(`hidden`),this.visivel=!0,!0}posicionar(e,t,n=!1){let r=this.el.getBoundingClientRect(),i=e+fh,a=n?t-fh-r.height:t+fh;i+r.width>window.innerWidth-8&&(i=e-fh-r.width),a<8&&(a=t+fh),a+r.height>window.innerHeight-8&&(a=t-fh-r.height),this.el.style.left=`${Math.round(Math.max(8,i))}px`,this.el.style.top=`${Math.round(Math.max(8,a))}px`}esconder(){this.limparTimers(),this.alvo=null,this.toque=null,this.visivel&&(this.visivel=!1,this.el.classList.add(`hidden`))}limparTimers(){this.timerToque!==null&&window.clearTimeout(this.timerToque),this.timerSaida!==null&&window.clearTimeout(this.timerSaida),this.timerToque=null,this.timerSaida=null}},gh=`[data-tip-id],[data-tip]`;function _h(e,t,n){if(!(e instanceof Element))return null;let r=e.closest(gh);if(r)return r;if(!e.closest(`.craft-lista`))return null;let i=document.elementFromPoint(t,n);return i instanceof Element?i.closest(gh):null}function vh(e){let t=document.createElement(`small`);return t.className=`tip-uso`,t.textContent=e,t}function yh(e){switch(e.tipo){case`ferramenta`:return e.libera.length===0?`⛏ ferramenta`:`⛏ quebra ${bh(e.libera)}`;case`comida`:return`🍗 comida — enche ${e.fome} de fome`;case`funde`:return`🔥 na fornalha vira ${e.saida.qtd}× ${mh.nameOf(e.saida.id)}`;case`combustivel`:return`🪵 queima na fornalha — ${e.cozimentos} ${e.cozimentos===1?`cozimento`:`cozimentos`}`;case`colheita`:return`🌱 quando madura dá ${mh.nameOf(e.item)}`;case`exigeFerramenta`:return mh.sobrevivencia()?`⛏ para quebrar: ${e.ferramenta}`:null}}function bh(e){let t=e.slice(0,ph).map(e=>mh.nameOf(e)),n=e.length-t.length;return n>0?`${t.join(`, `)} e mais ${n}`:t.join(`, `)}var xh=null;function Sh(){return xh??=new hh,xh}function Ch(e){mh=e,Sh()}function wh(e,t){t===null?delete e.dataset.tipId:e.dataset.tipId=String(t)}function Th(){xh?.esconder()}var Eh=class{icons;mochila;mover;avisarFechado;onToggle;root=document.getElementById(`container`);isOpen=!1;pos=null;tipo=`bau`;slots=[];queimando=0;queimaTotal=0;progresso=0;pegando=null;metadePegando=null;arrasto;esperandoFechar=!1;onEsc=e=>{e.code===`Escape`&&(e.preventDefault(),e.stopPropagation(),this.fechar())};constructor(e,t,n,r,i){this.icons=e,this.mochila=t,this.mover=n,this.avisarFechado=r,this.onToggle=i,this.root?.addEventListener(`click`,e=>{e.target instanceof HTMLElement&&e.target.closest(`button`)&&Km(`click`)}),this.arrasto=new ch({slotEm:(e,t)=>oh(e,t),iconeDe:e=>{let t=e<27?this.mochila.idDoSlot(e):this.slots[e-27]?.id??null;return t===null?null:this.icons.get(t)??null},qtdDe:e=>e<27?this.mochila.qtdDoSlot(e):this.slots[e-27]?.qtd??0,pegando:()=>this.pegando,setPegando:e=>{this.pegando=e},metade:()=>this.metadePegando,setMetade:e=>{this.metadePegando=e},mover:(e,t,n)=>{this.pos&&this.mover(this.pos.x,this.pos.y,this.pos.z,e,t,n)},redesenhar:()=>this.render(),aoClicar:(e,t,n)=>this.clicar(e,t,n)})}get open(){return this.isOpen}atualizar(e){let t=!this.pos||this.pos.x!==e.x||this.pos.y!==e.y||this.pos.z!==e.z;if(!(this.esperandoFechar&&!t)){this.esperandoFechar=!1,t&&(this.pegando=null),this.pos={x:e.x,y:e.y,z:e.z},this.tipo=e.tipo,this.slots=Array(dd[e.tipo]).fill(null);for(let t of e.slots)t.slot>=0&&t.slot<this.slots.length&&(this.slots[t.slot]=t);this.queimando=e.queimando??0,this.queimaTotal=e.queimaTotal??0,this.progresso=e.progresso??0,this.isOpen||(this.isOpen=!0,this.root?.classList.remove(`hidden`),window.addEventListener(`keydown`,this.onEsc,!0),this.onToggle(!0)),this.render()}}fechar(){this.isOpen&&(this.avisarFechado(),this.fecharSemAvisar(),this.esperandoFechar=!0)}fecharSemAvisar(){this.esperandoFechar=!1,this.isOpen&&(this.isOpen=!1,this.pos=null,this.pegando=null,this.metadePegando=null,this.arrasto.sincronizar(),Th(),this.root?.classList.add(`hidden`),window.removeEventListener(`keydown`,this.onEsc,!0),this.onToggle(!1))}refresh(){this.isOpen&&this.render()}rotuloDoSlot(e){return this.tipo===`fornalha`?e===0?`cozinhar`:e===1?`queimar`:`pronto`:``}qtdUnificado(e){return e<27?this.mochila.qtdDoSlot(e):this.slots[e-27]?.qtd??0}clicar(e,t,n){if(this.pegando===null){if(t)return;if(n){this.moverRapido(e);return}this.pegando=e}else this.pegando===e?(this.pegando=null,this.metadePegando=null):this.pos&&(this.mover(this.pos.x,this.pos.y,this.pos.z,this.pegando,e,this.metadePegando??void 0),this.metadePegando=null,this.pegando=null);this.render()}moverRapido(e){if(this.pos===null)return;let t=e<27,n,r;if(t)n=this.mochila.idDoSlot(e),r=this.mochila.qtdDoSlot(e);else{let t=this.slots[e-27];n=t?.id??null,r=t?.qtd??0}if(!(n===null||r<=0))if(t){let t=sh(this.slots,0,this.slots.length,n);if(t===null)return;this.mover(this.pos.x,this.pos.y,this.pos.z,e,27+t)}else{let t=sh(this.mochila.estado(),0,27,n);if(t===null)return;this.mover(this.pos.x,this.pos.y,this.pos.z,e,t)}}slotBtn(e,t,n){let r=document.createElement(`button`);if(r.type=`button`,r.className=`inv-slot`+(e===this.pegando?` pego`:``),wh(r,t),t!==null){let e=document.createElement(`img`);if(e.src=this.icons.get(t)??``,e.alt=``,r.appendChild(e),n>1){let e=document.createElement(`b`);e.className=`qtd`,e.textContent=String(n),r.appendChild(e)}}return this.arrasto.anexar(r,e,t,n),r}render(){this.arrasto.sincronizar();let e=this.root;if(!e)return;e.replaceChildren();let t=document.createElement(`h2`);t.textContent=this.tipo===`fornalha`?`fornalha`:`baú`;let n=document.createElement(`button`);n.type=`button`,n.className=`cont-fechar`,n.textContent=`fechar`,n.addEventListener(`click`,()=>this.fechar());let r=document.createElement(`p`);if(r.className=`inv-dica`,r.textContent=this.pegando===null?`toque num item para pegar, depois toque onde ele deve ficar`:this.metadePegando===null?`agora toque no destino (ou no mesmo item para soltar)`:`agora toque no destino (leva ${this.metadePegando} do item) — ou no mesmo item para soltar`,this.pegando!==null){let e=this.qtdUnificado(this.pegando);if(e>1){let t=document.createElement(`button`);t.type=`button`,t.className=`inv-dividir`,t.textContent=this.metadePegando===null?`✂ dividir ao meio (${Math.ceil(e/2)})`:`↩ voltar a pilha inteira`,t.addEventListener(`click`,()=>{let e=this.pegando;this.metadePegando=this.metadePegando===null?Math.ceil(this.qtdUnificado(e)/2):null,this.render()}),r.after(t)}}let i=document.createElement(`div`);i.className=this.tipo===`fornalha`?`cont-fornalha`:`cont-bau`;for(let e=0;e<this.slots.length;e++){let t=this.slots[e]??null,n=document.createElement(`div`);n.className=`cont-cel`,n.appendChild(this.slotBtn(27+e,t?.id??null,t?.qtd??0));let r=this.rotuloDoSlot(e);if(r){let e=document.createElement(`small`);e.textContent=r,n.appendChild(e)}i.appendChild(n)}e.append(t,n,r,i),this.tipo===`fornalha`&&(e.appendChild(this.barra(`fogo`,this.queimaTotal>0?this.queimando/this.queimaTotal:0,`fogo`)),e.appendChild(this.barra(`cozinhando`,this.progresso/100,`coz`))),e.append(this.divisor(this.tipo===`fornalha`?`fornalha`:`baú`,`sua mochila`));let a=document.createElement(`div`);a.className=`inv-mochila`;for(let e=9;e<27;e++)a.appendChild(this.slotBtn(e,this.mochila.idDoSlot(e),this.mochila.qtdDoSlot(e)));let o=document.createElement(`div`);o.className=`inv-hotbar`;for(let e=0;e<9;e++){let t=this.slotBtn(e,this.mochila.idDoSlot(e),this.mochila.qtdDoSlot(e)),n=document.createElement(`small`);n.textContent=String(e+1),t.prepend(n),o.appendChild(t)}e.append(a,o)}divisor(e,t){let n=document.createElement(`div`);n.className=`cont-divisor`;let r=document.createElement(`small`);r.textContent=`▲ ${e}`;let i=document.createElement(`i`),a=document.createElement(`small`);return a.textContent=`${t} ▼`,n.append(r,i,a),n}barra(e,t,n){let r=document.createElement(`div`);r.className=`cont-barra`;let i=document.createElement(`small`);i.textContent=e;let a=document.createElement(`div`);a.className=`cont-trilho`;let o=document.createElement(`i`);return o.className=n,o.style.width=`${Math.round(Math.max(0,Math.min(1,t))*100)}%`,a.appendChild(o),r.append(i,a),r}},Dh=[{id:`blocos`,label:`blocos`},{id:`vegetacao`,label:`vegetação`},{id:`mobilia`,label:`mobília`},{id:`minerios`,label:`minérios`},{id:`ferramentas`,label:`ferramentas`},{id:`glifos`,label:`letras e números`}],Oh=[...Array.from(np.letters,(e,t)=>({id:G.LetterA+t,name:`letra ${e}`,cat:`glifos`})),...Array.from(np.digits,(e,t)=>({id:G.Digit0+t,name:`número ${e}`,cat:`glifos`}))],kh=[{id:G.Grass,name:`grama`,cat:`blocos`},{id:G.Stone,name:`pedra`,cat:`blocos`},{id:G.Cobblestone,name:`pedregulho`,cat:`blocos`},{id:G.Sand,name:`areia`,cat:`blocos`},{id:G.Dirt,name:`terra`,cat:`blocos`},{id:G.Log,name:`tronco`,cat:`vegetacao`},{id:G.Planks,name:`tábuas`,cat:`blocos`},{id:G.Brick,name:`tijolo`,cat:`blocos`},{id:G.Gravel,name:`cascalho`,cat:`blocos`},{id:G.Bedrock,name:`rocha-matriz`,cat:`blocos`},{id:G.WoolWhite,name:`lã branca`,cat:`blocos`},{id:G.WoolBlack,name:`lã preta`,cat:`blocos`},{id:G.WoolRed,name:`lã vermelha`,cat:`blocos`},{id:G.WoolOrange,name:`lã laranja`,cat:`blocos`},{id:G.WoolYellow,name:`lã amarela`,cat:`blocos`},{id:G.WoolGreen,name:`lã verde`,cat:`blocos`},{id:G.WoolBlue,name:`lã azul`,cat:`blocos`},{id:G.WoolPurple,name:`lã roxa`,cat:`blocos`},{id:G.Sandstone,name:`arenito`,cat:`blocos`},{id:G.StoneBricks,name:`pedra-lavrada`,cat:`blocos`},{id:G.Snow,name:`neve`,cat:`blocos`},{id:G.Obsidian,name:`obsidiana`,cat:`blocos`},{id:G.WoolPink,name:`lã rosa`,cat:`blocos`},{id:G.WoolCyan,name:`lã ciano`,cat:`blocos`},{id:G.WoolGray,name:`lã cinza`,cat:`blocos`},{id:G.WoolBrown,name:`lã marrom`,cat:`blocos`},{id:G.Glass,name:`vidro`,cat:`blocos`},{id:G.Leaves,name:`folhas`,cat:`vegetacao`},...Oh,{id:G.Cerca,name:`cerca`,cat:`mobilia`},{id:G.PortaXFechada,name:`porta`,cat:`mobilia`},{id:G.Tocha,name:`tocha`,cat:`mobilia`},{id:G.JanelaXFechada,name:`janela`,cat:`mobilia`},{id:G.Mesa,name:`mesa`,cat:`mobilia`},{id:G.CadeiraXP,name:`cadeira`,cat:`mobilia`},{id:G.SofaXP,name:`sofá`,cat:`mobilia`},{id:G.CamaXP,name:`cama`,cat:`mobilia`},{id:G.QuadroXP,name:`quadro`,cat:`mobilia`},{id:G.Fornalha,name:`fornalha`,cat:`mobilia`},{id:G.Bau,name:`baú`,cat:`mobilia`},...[`branco`,`preto`,`vermelho`,`laranja`,`amarelo`,`verde`,`azul`,`roxo`,`rosa`,`ciano`,`cinza`,`marrom`].map((e,t)=>({id:G.TapeteBranco+t,name:`tapete ${e}`,cat:`mobilia`})),...[`vermelha`,`amarela`,`azul`,`branca`].map((e,t)=>({id:G.FlorVermelha+t,name:`flor ${e}`,cat:`vegetacao`})),...[``,` seca`,` fria`].map((e,t)=>({id:G.GramaAlta+t,name:`grama alta${e}`,cat:`vegetacao`})),{id:G.Plantacao0,name:`semente de trigo`,cat:`vegetacao`},{id:G.Algodao0,name:`semente de algodão`,cat:`vegetacao`},{id:G.AlgodaoSelvagem,name:`algodão selvagem`,cat:`vegetacao`},{id:G.Cenoura0,name:`semente de cenoura`,cat:`vegetacao`},{id:G.CenouraSelvagem,name:`cenoura selvagem`,cat:`vegetacao`},{id:G.Batata0,name:`batata-semente`,cat:`vegetacao`},{id:G.BatataSelvagem,name:`batata selvagem`,cat:`vegetacao`},{id:G.Beterraba0,name:`semente de beterraba`,cat:`vegetacao`},{id:G.BeterrabaSelvagem,name:`beterraba selvagem`,cat:`vegetacao`},{id:G.Melancia0,name:`semente de melancia`,cat:`vegetacao`},{id:G.MelanciaSelvagem,name:`melancia selvagem`,cat:`vegetacao`},{id:G.Banana0,name:`muda de bananeira`,cat:`vegetacao`},{id:G.BananaSelvagem,name:`bananeira selvagem`,cat:`vegetacao`},{id:G.Aipim0,name:`rama de aipim`,cat:`vegetacao`},{id:G.AipimSelvagem,name:`aipim selvagem`,cat:`vegetacao`},{id:G.MudaComum0,name:`muda de carvalho`,cat:`vegetacao`},{id:G.MudaIpe0,name:`muda de ipê`,cat:`vegetacao`},{id:G.MudaAraucaria0,name:`muda de araucária`,cat:`vegetacao`},{id:G.MudaPauBrasil0,name:`muda de pau-brasil`,cat:`vegetacao`},{id:G.MinerioCarvao,name:`minério de carvão`,cat:`minerios`},{id:G.MinerioFerro,name:`minério de ferro`,cat:`minerios`},{id:G.MinerioOuro,name:`minério de ouro`,cat:`minerios`},{id:G.MinerioDiamante,name:`minério de diamante`,cat:`minerios`},{id:G.GramaSeca,name:`grama seca`,cat:`blocos`},{id:G.GramaFria,name:`grama fria`,cat:`blocos`},{id:G.LogIpe,name:`tronco de ipê`,cat:`vegetacao`},{id:G.FolhasIpe,name:`folhas de ipê`,cat:`vegetacao`},{id:G.LogAraucaria,name:`tronco de araucária`,cat:`vegetacao`},{id:G.FolhasAraucaria,name:`folhas de araucária`,cat:`vegetacao`},{id:G.LogPauBrasil,name:`tronco de pau-brasil`,cat:`vegetacao`},{id:G.FolhasPauBrasil,name:`folhas de pau-brasil`,cat:`vegetacao`},{id:G.Mandacaru,name:`mandacaru`,cat:`vegetacao`},...[`branco`,`preto`,`vermelho`,`laranja`,`amarelo`,`verde`,`azul`,`roxo`,`rosa`,`ciano`,`cinza`,`marrom`].map((e,t)=>({id:G.VidroBranco+t,name:`vidro ${e}`,cat:`blocos`})),{id:G.LajePedraBaixo,name:`laje de pedra`,cat:`blocos`},{id:G.LajeTabuaBaixo,name:`laje de tábuas`,cat:`blocos`},{id:G.LajeTijoloBaixo,name:`laje de tijolo`,cat:`blocos`},{id:G.EscadaPedraXP,name:`escada de pedra`,cat:`blocos`},{id:G.EscadaTabuaXP,name:`escada de tábuas`,cat:`blocos`},{id:G.EscadaTijoloXP,name:`escada de tijolo`,cat:`blocos`},{id:901,name:`balde de água`,cat:`ferramentas`}];function Ah(e){return e===`professor`?kh:kh.filter(e=>!Eu(e.id))}var jh=class{icons;blocks;state;pick;select;onToggle;mochila;mover;nameOf;fabricar;root=document.getElementById(`inventario`);isOpen=!1;cat=`blocos`;pegando=null;metadePegando=null;arrasto;subaba=`mochila`;filtroCraft=``;soPossiveis=!1;scrollCraft=0;listaCraft=null;onEsc=e=>{e.code===`Escape`&&(e.preventDefault(),e.stopPropagation(),this.hide())};constructor(e,t,n,r,i,a,o,s,c,l){this.icons=e,this.blocks=t,this.state=n,this.pick=r,this.select=i,this.onToggle=a,this.mochila=o,this.mover=s,this.nameOf=c,this.fabricar=l,this.root?.addEventListener(`click`,e=>{e.target instanceof HTMLElement&&e.target.closest(`button`)&&Km(`click`)}),this.arrasto=new ch({slotEm:(e,t)=>oh(e,t),iconeDe:e=>{let t=this.mochila.idDoSlot(e);return t===null?null:this.icons.get(t)??null},qtdDe:e=>this.mochila.qtdDoSlot(e),pegando:()=>this.pegando,setPegando:e=>{this.pegando=e},metade:()=>this.metadePegando,setMetade:e=>{this.metadePegando=e},mover:(e,t,n)=>this.mover(e,t,n),redesenhar:()=>this.render(),aoClicar:(e,t,n)=>this.clicarMochila(e,t,n)})}clicarMochila(e,t,n){if(this.pegando===null){if(t){e<9&&this.select(e),this.render();return}if(n){this.moverRapido(e);return}this.pegando=e}else if(this.pegando===e)this.pegando=null,this.metadePegando=null;else{let t=this.metadePegando??void 0;this.mover(this.pegando,e,t),this.metadePegando=null,this.pegando=null}this.render()}moverRapido(e){let t=this.mochila.estado(),n=t[e]?.id;if(n===void 0)return;let r=sh(t,e<9?9:0,e<9?27:9,n);r!==null&&this.mover(e,r)}get open(){return this.isOpen}toggle(){this.isOpen?this.hide():this.show()}show(){this.isOpen||!this.root||(this.isOpen=!0,this.render(),this.root.classList.remove(`hidden`),window.addEventListener(`keydown`,this.onEsc,!0),this.onToggle(!0))}hide(){this.isOpen&&(this.isOpen=!1,this.pegando=null,this.metadePegando=null,this.arrasto.sincronizar(),Th(),this.root?.classList.add(`hidden`),window.removeEventListener(`keydown`,this.onEsc,!0),this.onToggle(!1))}refresh(){this.isOpen&&this.render()}render(){if(this.arrasto.sincronizar(),this.mochila.ativa){this.renderMochila();return}let e=this.root;if(!e)return;e.replaceChildren();let t=document.createElement(`div`);t.className=`painel-head`;let n=document.createElement(`h2`);n.textContent=`inventário de blocos`;let r=document.createElement(`button`);r.type=`button`,r.textContent=`✕ fechar`,r.addEventListener(`click`,()=>this.hide()),t.append(n,r);let i=document.createElement(`p`);i.className=`inv-dica`,i.textContent=`clique num bloco pra pôr no slot selecionado · 1–9 ou clique escolhem o slot`;let a=this.blocks(),o=document.createElement(`div`);o.className=`inv-abas`;for(let e of Dh){if(!a.some(t=>t.cat===e.id))continue;let t=document.createElement(`button`);t.type=`button`,t.className=`inv-aba`+(e.id===this.cat?` sel`:``),t.textContent=e.label,t.addEventListener(`click`,()=>{this.cat=e.id,this.render()}),o.appendChild(t)}let s=document.createElement(`div`);s.className=`inv-grid`;for(let e of a.filter(e=>e.cat===this.cat)){let t=document.createElement(`button`);t.type=`button`,t.className=`inv-bloco`,wh(t,e.id);let n=document.createElement(`img`);n.src=this.icons.get(e.id)??``,n.alt=e.name;let r=document.createElement(`small`);r.textContent=e.name,t.append(n,r),t.addEventListener(`click`,()=>{this.pick(e.id),this.render()}),s.appendChild(t)}let c=document.createElement(`div`);c.className=`inv-hotbar`;let{hotbar:l,selected:u}=this.state();l.forEach((e,t)=>{let n=document.createElement(`button`);n.type=`button`,n.className=`inv-slot`+(t===u?` sel`:``);let r=document.createElement(`small`);r.textContent=String(t+1);let i=document.createElement(`img`);i.src=this.icons.get(e)??``,i.alt=``,wh(n,e),n.append(r,i),n.addEventListener(`click`,()=>{this.select(t),this.render()}),c.appendChild(n)}),e.append(t,i,o,s,c)}renderMochila(){let e=this.root;if(!e)return;e.replaceChildren();let t=document.createElement(`div`);t.className=`painel-head`;let n=document.createElement(`h2`);n.textContent=`mochila`;let r=document.createElement(`button`);r.type=`button`,r.textContent=`✕ fechar`,r.addEventListener(`click`,()=>this.hide()),t.append(n,r);let i=document.createElement(`div`);i.className=`inv-abas`;for(let e of[{id:`mochila`,label:`mochila`},{id:`criar`,label:`criar`}]){let t=document.createElement(`button`);t.type=`button`,t.className=`inv-aba`+(e.id===this.subaba?` sel`:``),t.textContent=e.label,t.addEventListener(`click`,()=>{this.subaba=e.id,this.pegando=null,this.render()}),i.appendChild(t)}let a=document.createElement(`p`);if(a.className=`inv-dica`,a.textContent=this.subaba===`criar`?`toque numa receita pra fabricar · o vermelho é o que falta · fabrica em qualquer lugar`:this.pegando===null?`toque num item para pegar, depois toque onde ele deve ficar · 1–9 escolhem o slot da mão`:this.metadePegando===null?`agora toque no slot de destino (ou no mesmo item para soltar)`:`agora toque no destino (leva ${this.metadePegando} do item) — ou toque no mesmo item para soltar`,this.subaba===`mochila`&&this.pegando!==null){let e=this.mochila.qtdDoSlot(this.pegando);if(e>1){let t=document.createElement(`button`);t.type=`button`,t.className=`inv-dividir`,t.textContent=this.metadePegando===null?`✂ dividir ao meio (${Math.ceil(e/2)})`:`↩ voltar a pilha inteira`,t.addEventListener(`click`,()=>{this.metadePegando=this.metadePegando===null?Math.ceil(this.mochila.qtdDoSlot(this.pegando)/2):null,this.render()}),a.after(t)}}if(this.subaba===`criar`){let n=this.hotbarBar();e.append(t,i,a,this.renderCraft(),n),this.listaCraft&&(this.listaCraft.scrollTop=this.scrollCraft);return}this.listaCraft=null;let o=e=>{let t=this.mochila.idDoSlot(e),n=this.mochila.qtdDoSlot(e),r=document.createElement(`button`);if(r.type=`button`,r.className=`inv-slot`+(e===this.pegando?` pego`:``)+(e===this.state().selected&&e<9?` sel`:``),wh(r,t),t!==null){let e=document.createElement(`img`);if(e.src=this.icons.get(t)??``,e.alt=``,r.appendChild(e),n>1){let e=document.createElement(`b`);e.className=`qtd`,e.textContent=String(n),r.appendChild(e)}}return this.arrasto.anexar(r,e,t,n),r},s=document.createElement(`div`);s.className=`inv-mochila`;for(let e=9;e<27;e++)s.appendChild(o(e));let c=document.createElement(`div`);c.className=`inv-hotbar`;for(let e=0;e<9;e++){let t=o(e),n=document.createElement(`small`);n.textContent=String(e+1),t.prepend(n),c.appendChild(t)}e.append(t,i,a,s,c)}hotbarBar(){let e=document.createElement(`div`);e.className=`inv-hotbar`;let{selected:t}=this.state();for(let n=0;n<9;n++){let r=this.mochila.idDoSlot(n),i=this.mochila.qtdDoSlot(n),a=document.createElement(`button`);a.type=`button`,a.className=`inv-slot`+(n===t?` sel`:``);let o=document.createElement(`small`);if(o.textContent=String(n+1),a.appendChild(o),wh(a,r),r!==null){let e=document.createElement(`img`);if(e.src=this.icons.get(r)??``,e.alt=``,a.appendChild(e),i>1){let e=document.createElement(`b`);e.className=`qtd`,e.textContent=String(i),a.appendChild(e)}}a.addEventListener(`click`,()=>{this.select(n),this.render()}),e.appendChild(a)}return e}renderCraft(){let e=document.createElement(`div`);e.className=`craft-wrap`;let t=document.createElement(`input`);t.type=`text`,t.className=`craft-filtro`,t.placeholder=`filtrar receita…`,t.value=this.filtroCraft;let n=document.createElement(`div`);n.className=`craft-lista`,t.addEventListener(`input`,()=>{this.filtroCraft=t.value,this.scrollCraft=0,this.montarReceitas(n)});let r=document.createElement(`label`);r.className=`craft-so`;let i=document.createElement(`input`);return i.type=`checkbox`,i.checked=this.soPossiveis,i.addEventListener(`change`,()=>{this.soPossiveis=i.checked,this.scrollCraft=0,this.montarReceitas(n)}),r.append(i,document.createTextNode(` só o que dá pra fazer agora`)),n.addEventListener(`scroll`,()=>{this.scrollCraft=n.scrollTop}),this.listaCraft=n,this.montarReceitas(n),e.append(t,r,n),e}montarReceitas(e){e.replaceChildren();let t=this.mochila.estado(),n=this.filtroCraft.trim().toLowerCase(),r=e=>{if(!n)return!0;let t=Zp[e];return[this.nameOf(t.saida.id),...t.custo.flatMap(e=>Np(e).map(e=>this.nameOf(e)))].some(e=>e.toLowerCase().includes(n))},i=0;if(Zp.forEach((n,a)=>{if(!r(a))return;let o=$p(t,n);if(this.soPossiveis&&!o)return;i++;let s=document.createElement(`button`);s.type=`button`,s.className=`craft-row`,s.disabled=!o,wh(s,n.saida.id);let c=document.createElement(`img`);c.src=this.icons.get(n.saida.id)??``,c.alt=``;let l=document.createElement(`div`);l.className=`craft-texto`;let u=document.createElement(`div`);u.className=`craft-nome`,u.textContent=`${n.saida.qtd}× ${this.nameOf(n.saida.id)}`;let d=document.createElement(`div`);d.className=`craft-custo`,tm(t,n).forEach((e,t)=>{t>0&&d.append(` · `);let n=document.createElement(`span`);n.className=e.falta>0?`falta`:`ok`,n.textContent=`${e.have}/${e.need} ${e.ids.map(e=>this.nameOf(e)).join(` ou `)}`,d.appendChild(n)}),l.append(u,d),s.append(c,l),s.addEventListener(`click`,()=>{s.disabled||this.fabricar(a)}),e.appendChild(s)}),i===0){let t=document.createElement(`p`);t.className=`inv-dica`,t.textContent=this.soPossiveis?`nada dá pra fazer com o que você tem agora — desmarque para ver a lista inteira.`:`nenhuma receita com esse nome.`,e.appendChild(t)}}},Mh=[`bloco`,`resetpin`,`regiao`,`objetivo`,`grupo`,`mundo`,`tp`,`tpr`,`tpa`,`iniciar`,`hora`,`ciclo`,`vento`,`voo`,`modo`,`regra`,`dar`,`confinar`,`kicar`,`claim`,`amigos`],Nh={regiao:[`criar`,`apagar`,`lista`,`encher`,`sortear`,`carimbar`],objetivo:[`add`,`lista`,`texto`,`mover`,`remover`,`modo`,`resetar`],grupo:[`criar`,`entrar`,`sair`,`lista`],mundo:[`lista`,`atual`,`carregar`],tp:[`grupos`],hora:[`dia`,`noite`,`amanhecer`,`entardecer`,`meio-dia`,`meia-noite`],ciclo:[`ligar`,`desligar`],vento:[`ligar`,`desligar`],voo:[`ligar`,`desligar`],modo:[`criativo`,`sobrevivencia`],regra:im(),confinar:[`ligar`,`desligar`,`status`],claim:[`ligar`,`desligar`,`criar`,`remover`,`lista`],amigos:[`convidar`,`aceitar`,`recusar`,`sair`,`expulsar`,`lista`]},Ph=new Set([`kicar`,`resetpin`,`tpr`,`tpa`]),Fh=new Set([`convidar`,`aceitar`,`recusar`,`expulsar`]),Ih=[],Lh=[];function Rh(e){Ih=e}function zh(e){Lh=e}function Bh(e,t){return e===`objetivo`&&t===`add`?[`construir`,`chegar`,`limpar`]:e===`objetivo`&&t===`modo`?[`sequencial`,`livre`]:e===`mundo`&&t===`carregar`?Ih:e===`amigos`&&Fh.has(t)?Lh:e===`modo`?[`eu`,`all`,...Lh]:e===`regra`?[`ligar`,`desligar`]:[]}function Vh(e){if(e.length===0)return Mh.map(e=>`/${e}`);let t=(e[0]??``).replace(/^\//,``);return e.length===1?Ph.has(t)?Lh:t===`tp`?[`grupos`,...Lh]:t===`dar`?[`eu`,`all`,...Lh]:Nh[t]??[]:e.length===2?Bh(t,e[1]??``):[]}function Hh(e){let t=(e[0]??``).replace(/^\//,``);if(e.length===1)return t===`tpa`?`enviar`:t===`dar`||Ph.has(t)?`preencher`:t===`tp`||Nh[t]?.length?`nivel`:`enviar`;if(e.length===2){let n=e[1];return t===`tpa`?`enviar`:t===`dar`?`preencher`:t===`tp`?`enviar`:t===`amigos`&&Fh.has(n??``)||t===`modo`&&(n===`criativo`||n===`sobrevivencia`)?`preencher`:Bh(t,n??``).length?`nivel`:`enviar`}return`enviar`}function Uh(){return new URLSearchParams(location.search).has(`touch`)?!0:window.matchMedia(`(pointer: coarse)`).matches}function Wh(){document.documentElement.requestFullscreen?.().then(()=>screen.orientation.lock?.(`landscape`)).catch(()=>{})}var Gh=`
:root { --ts: 1; }
#touch-ui, #touch-ui * { touch-action: none; user-select: none; -webkit-user-select: none; }
#touch-look { position: fixed; inset: 0; z-index: 4; }
#touch-joy {
  position: fixed; left: 20px; bottom: 88px;
  width: calc(128px * var(--ts)); height: calc(128px * var(--ts));
  border-radius: 50%; background: rgba(255,255,255,0.08);
  border: 2px solid rgba(255,255,255,0.3); z-index: 8;
}
#touch-joy-thumb {
  position: absolute; left: 50%; top: 50%;
  width: calc(52px * var(--ts)); height: calc(52px * var(--ts));
  margin: calc(-26px * var(--ts)) 0 0 calc(-26px * var(--ts)); border-radius: 50%;
  background: rgba(255,255,255,0.4); pointer-events: none;
}
#touch-acoes {
  position: fixed; right: 16px; bottom: 88px; display: grid;
  grid-template-columns: repeat(2, calc(64px * var(--ts))); gap: calc(10px * var(--ts)); z-index: 8;
}
#touch-topo {
  position: fixed; top: 8px; left: 50%; transform: translateX(-50%);
  display: flex; gap: 8px; z-index: 8;
}
.touch-btn {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 2px; width: calc(64px * var(--ts)); height: calc(64px * var(--ts)); border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.35); background: rgba(0,0,0,0.4);
  color: #fff; font: inherit; font-size: calc(22px * var(--ts)); line-height: 1; cursor: pointer;
}
.touch-btn small { font-size: calc(10px * var(--ts)); opacity: 0.85; }
.touch-btn:active { background: rgba(255,255,255,0.25); }
/* botão LIGADO (a varinha): o estado tem de ser visível na barra, porque com
   ela ligada o ⛏/▣ marcam CANTO 1/CANTO 2 em vez de quebrar e colocar */
.touch-btn.ativo { background: rgba(255,215,94,0.35); border-color: #ffd75e; }
/* alvo de dedo: a barra do topo abre mão do quadrado de 64px (ela é uma linha
   de ícone + texto), mas NÃO do piso de 40px — medido em 1024×600, ela estava
   em 30px, abaixo do mínimo que o resto da UI já respeita (2026-08-04) */
#touch-topo .touch-btn { width: auto; height: auto; min-height: 40px; padding: 6px 12px; font-size: 16px; flex-direction: row; gap: 6px; }
#touch-topo .touch-btn small { font-size: 12px; }
`;function Kh(e,t,n){let r=e.querySelector(`span`),i=e.querySelector(`small`);r&&(r.textContent=t),i&&(i.textContent=n)}var qh=class{input;actions;root;heldKeys=new Set;btnVarinha=null;btnAmigos=null;btnQuebrar=null;btnColocar=null;btnCopiar=null;btnBlocos=null;modoComer=!1;modoInteragir=!1;varinhaAtiva=!1;joyPointer=null;lookPointer=null;lookX=0;lookY=0;constructor(e,t){this.input=e,this.actions=t;let n=document.createElement(`style`);n.textContent=Gh,document.head.appendChild(n),this.root=document.createElement(`div`),this.root.id=`touch-ui`,this.root.className=`hidden`;let r=document.createElement(`div`);r.id=`touch-look`,r.addEventListener(`pointerdown`,e=>{this.lookPointer===null&&(this.lookPointer=e.pointerId,this.lookX=e.clientX,this.lookY=e.clientY,r.setPointerCapture(e.pointerId))}),r.addEventListener(`pointermove`,e=>{e.pointerId===this.lookPointer&&(this.input.applyLook(e.clientX-this.lookX,e.clientY-this.lookY),this.lookX=e.clientX,this.lookY=e.clientY)});let i=e=>{e.pointerId===this.lookPointer&&(this.lookPointer=null)};r.addEventListener(`pointerup`,i),r.addEventListener(`pointercancel`,i);let a=document.createElement(`div`);a.id=`touch-joy`;let o=document.createElement(`div`);o.id=`touch-joy-thumb`,a.appendChild(o);let s=e=>{let t=a.getBoundingClientRect(),n=t.width/2,r=e.clientX-(t.left+n),i=e.clientY-(t.top+n),s=Math.hypot(r,i);s>n&&(r*=n/s,i*=n/s),o.style.transform=`translate(${r}px, ${i}px)`;let c=this.actions.keys(),l=r/n,u=i/n;this.syncKey(c.forward,u<-.35),this.syncKey(c.back,u>.35),this.syncKey(c.left,l<-.35),this.syncKey(c.right,l>.35)},c=e=>{if(e.pointerId!==this.joyPointer)return;this.joyPointer=null,o.style.transform=``;let t=this.actions.keys();for(let e of[t.forward,t.back,t.left,t.right])this.syncKey(e,!1)};a.addEventListener(`pointerdown`,e=>{this.joyPointer===null&&(this.joyPointer=e.pointerId,a.setPointerCapture(e.pointerId),s(e))}),a.addEventListener(`pointermove`,e=>{e.pointerId===this.joyPointer&&s(e)}),a.addEventListener(`pointerup`,c),a.addEventListener(`pointercancel`,c);let l=document.createElement(`div`);l.id=`touch-acoes`,l.append(this.btnCopiar=this.tapButton(`✋`,`copiar`,()=>this.actions.copiar()),this.holdButton(`⤒`,`pular`,()=>this.actions.keys().jump),this.holdButton(`⤓`,`agachar`,()=>this.actions.keys().agachar),this.btnQuebrar=this.tapButton(`⛏`,`quebrar`,()=>this.actions.quebrar()));let u=this.makeButton(`▣`,`colocar`);u.addEventListener(`pointerdown`,e=>{e.preventDefault(),this.varinhaAtiva||!this.modoComer?this.actions.colocar():this.actions.comer()}),this.btnColocar=u,l.appendChild(u);let d=document.createElement(`div`);d.id=`touch-topo`,d.append(this.tapButton(`☰`,`menu`,()=>this.actions.menu()),this.btnBlocos=this.tapButton(`🧱`,`blocos`,()=>this.actions.inventario()),this.tapButton(`💬`,`chat`,()=>this.actions.chat()),this.btnVarinha=this.tapButton(`🪄`,`varinha`,()=>this.actions.varinha()),this.btnAmigos=this.tapButton(`👥`,`amigos`,()=>this.actions.amigos())),this.btnVarinha.classList.add(`hidden`),this.btnAmigos.classList.add(`hidden`),this.root.append(r,a,l,d),document.body.appendChild(this.root)}setScale(e){document.documentElement.style.setProperty(`--ts`,String(e))}setVarinhaDisponivel(e){this.btnVarinha?.classList.toggle(`hidden`,!e)}setAmigosDisponivel(e){this.btnAmigos?.classList.toggle(`hidden`,!e)}setCopiarDisponivel(e){this.btnCopiar?.classList.toggle(`hidden`,!e)}setVarinha(e){this.varinhaAtiva=e,this.btnVarinha?.classList.toggle(`ativo`,e),this.btnQuebrar&&Kh(this.btnQuebrar,e?`①`:`⛏`,e?`canto 1`:`quebrar`),this.atualizarBtnColocar()}setModoComer(e){this.modoComer=e,this.atualizarBtnColocar()}setModoInteragir(e){this.modoInteragir!==e&&(this.modoInteragir=e,this.atualizarBtnColocar())}setMochilaRotulo(e){this.btnBlocos&&Kh(this.btnBlocos,e?`🎒`:`🧱`,e?`mochila`:`blocos`)}atualizarBtnColocar(){this.btnColocar&&(this.varinhaAtiva?Kh(this.btnColocar,`②`,`canto 2`):this.modoInteragir?Kh(this.btnColocar,`👆`,`interagir`):this.modoComer?Kh(this.btnColocar,`🍎`,`comer`):Kh(this.btnColocar,`▣`,`colocar`))}setShown(e){this.root.classList.toggle(`hidden`,!e),e||this.releaseAll()}releaseAll(){for(let e of this.heldKeys)this.input.setKey(e,!1);this.heldKeys.clear(),this.joyPointer=null,this.lookPointer=null}syncKey(e,t){this.input.setKey(e,t),t?this.heldKeys.add(e):this.heldKeys.delete(e)}tapButton(e,t,n){let r=this.makeButton(e,t);return r.addEventListener(`pointerdown`,e=>{e.preventDefault(),n()}),r}holdButton(e,t,n){let r=this.makeButton(e,t);r.addEventListener(`pointerdown`,e=>{e.preventDefault(),r.setPointerCapture(e.pointerId),this.syncKey(n(),!0)});let i=()=>this.syncKey(n(),!1);return r.addEventListener(`pointerup`,i),r.addEventListener(`pointercancel`,i),r}makeButton(e,t){let n=document.createElement(`button`);n.type=`button`,n.className=`touch-btn`;let r=document.createElement(`span`);r.textContent=e;let i=document.createElement(`small`);return i.textContent=t,n.append(r,i),n}},Jh=1e4,Yh=50,Xh=`
#chat-painel {
  margin-top: 4px;
  max-height: 26vh;
  overflow-y: auto;
  overscroll-behavior: contain;
  pointer-events: auto;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-content: flex-start;
  padding: 4px;
  border-radius: 4px;
}
#chat-painel button {
  min-height: 40px;
  padding: 6px 12px;
  font: inherit;
  font-size: 12px;
  color: #fff;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 4px;
  pointer-events: auto;
}
#chat-painel button:active {
  background: rgba(255, 215, 74, 0.3);
}
#chat-painel button.pnl-volta {
  border-color: #ffd74a;
}
`;function Zh(){let e=window.visualViewport;if(!e)return;let t=()=>{let t=Math.max(0,window.innerHeight-e.height-e.offsetTop);document.documentElement.style.setProperty(`--kb`,`${Math.round(t)}px`)};e.addEventListener(`resize`,t),e.addEventListener(`scroll`,t),t()}var Qh=class{onToggle;root=document.getElementById(`chat`);log=document.getElementById(`chat-log`);field=document.getElementById(`chat-input`);hint=document.getElementById(`chat-hint`);cycle=null;painelCaminho=[];painel=null;constructor(e,t){this.onToggle=t,this.field&&(this.field.maxLength=200,Zh(),Uh()&&this.montarPainel(),this.field.addEventListener(`keydown`,t=>{if(t.stopPropagation(),t.code===`Tab`){t.preventDefault(),this.autocomplete();return}if(t.code===`Enter`||t.key===`Enter`){let t=this.field?.value.trim()??``;t&&e(t),this.close()}else t.code===`Escape`?this.close():this.resetCycle()}))}get open(){return this.field!==null&&!this.field.classList.contains(`hidden`)}openInput(){this.field&&(this.field.value=``,this.resetCycle(),this.field.classList.remove(`hidden`),this.root?.classList.add(`open`),this.painelCaminho=[],this.renderPainel(),this.painel?.classList.remove(`hidden`),this.field.focus(),this.scrollarFim(),this.onToggle(!0))}close(){this.field&&(this.field.value=``,this.resetCycle(),this.field.classList.add(`hidden`),this.root?.classList.remove(`open`),this.painelCaminho=[],this.painel?.classList.add(`hidden`),this.field.blur(),this.onToggle(!1))}montarPainel(){if(!this.root)return;let e=document.createElement(`style`);e.textContent=Xh,document.head.appendChild(e),this.painel=document.createElement(`div`),this.painel.id=`chat-painel`,this.painel.className=`hidden`,this.root.insertBefore(this.painel,this.field)}renderPainel(){let e=this.painel;if(e){e.textContent=``;for(let t of this.painelCaminho){let n=document.createElement(`button`);n.type=`button`,n.textContent=t,n.addEventListener(`pointerdown`,e=>{e.preventDefault(),this.painelCaminho=this.painelCaminho.slice(0,-1),this.renderPainel()}),e.appendChild(n)}for(let t of Vh(this.painelCaminho)){let n=document.createElement(`button`);n.type=`button`,n.textContent=t,n.addEventListener(`pointerdown`,e=>{e.preventDefault(),this.toqueNaOpcao(t)}),e.appendChild(n)}}}toqueNaOpcao(e){let t=[...this.painelCaminho,e],n=Hh(t);n===`nivel`?(this.painelCaminho=t,this.renderPainel()):n===`preencher`?(this.field.value=t.join(` `)+` `,this.field.focus(),this.resetCycle()):(this.painelCaminho=t,this.field.value=t.join(` `),this.field.dispatchEvent(new KeyboardEvent(`keydown`,{key:`Enter`,code:`Enter`,bubbles:!0})))}autocomplete(){let e=this.field;if(!e)return;let t=e.value;if(!t.startsWith(`/`))return;if(this.cycle&&t===this.cycle.produced&&this.cycle.matches.length>1){let t=this.cycle;t.index=(t.index+1)%t.matches.length,t.produced=t.base+t.matches[t.index],e.value=t.produced,this.showHint(t.matches,t.index);return}let n=/\s$/.test(t),r=t.replace(/\s+$/,``),i=r.length?r.split(/\s+/):[],a=n?i:i.slice(0,-1),o=n?``:i[i.length-1]??``,s=Vh(a).filter(e=>e.toLowerCase().startsWith(o.toLowerCase()));if(s.length===0){this.resetCycle();return}let c=a.length?`${a.join(` `)} `:``;s.length===1?(e.value=`${c}${s[0]} `,this.resetCycle()):(e.value=c+s[0],this.cycle={produced:e.value,matches:s,index:0,base:c},this.showHint(s,0))}showHint(e,t){this.hint&&(this.hint.textContent=``,e.forEach((e,n)=>{let r=document.createElement(`span`);r.textContent=e,n===t&&(r.className=`sel`),this.hint?.appendChild(r)}),this.hint.classList.remove(`hidden`))}resetCycle(){this.cycle=null,this.hint?.classList.add(`hidden`)}addMessage(e,t){if(!this.log)return;let n=document.createElement(`div`);for(n.className=`msg`,n.textContent=`<${e}> ${t}`,this.log.appendChild(n);this.log.childElementCount>Yh;)this.log.firstElementChild?.remove();this.scrollarFim(),setTimeout(()=>n.classList.add(`old`),Jh)}scrollarFim(){this.log&&(this.log.scrollTop=this.log.scrollHeight)}},$h=4,eg=8,tg=1,ng=class{onColapso;workers=[];carga=[];prontos=[];proximoId=1;dono=new Map;msTotal=0;profundidadeJogo;constructor(e,t){this.onColapso=e,this.profundidadeJogo=Math.max(1,t??tg);let n=navigator.hardwareConcurrency??4,r=Math.max(1,Math.min($h,n-1));for(let e=0;e<r;e++)try{let e=new Worker(new URL(`/assets/meshWorker-TqLe3pXM.js`,``+import.meta.url),{type:`module`});e.onmessage=e=>{let t=e.data,n=this.dono.get(t.id);n!==void 0&&(this.carga[n]=Math.max(0,(this.carga[n]??0)-1),this.dono.delete(t.id)),this.msTotal+=t.ms,this.prontos.push(t)},e.onerror=()=>this.colapsar(),this.workers.push(e),this.carga.push(0)}catch{break}}get disponivel(){return this.workers.length>0}get config(){return{workers:this.workers.length,profundidadeJogo:this.profundidadeJogo,profundidadeCarga:eg}}get emVoo(){return this.dono.size}get prontosPendentes(){return this.prontos.length}modoCarga=!0;get temVaga(){let e=this.modoCarga?eg:this.profundidadeJogo;return this.disponivel&&this.emVoo<this.workers.length*e}enviar(e,t){if(e.length!==Cp)throw Error(`vizinhança ${e.length} ≠ ${Cp}`);if(t&&t.length!==Cp)throw Error(`vizinhança de luz ${t.length} ≠ ${Cp}`);let n=0;for(let e=1;e<this.workers.length;e++)(this.carga[e]??0)<(this.carga[n]??0)&&(n=e);let r=this.proximoId++;this.dono.set(r,n),this.carga[n]=(this.carga[n]??0)+1;let i=[e.buffer];return t&&i.push(t.buffer),this.workers[n].postMessage({id:r,viz:e,luzViz:t??void 0},i),r}colher(){return this.prontos.shift()}colapsar(){let e=[...this.dono.keys()];for(let e of this.workers)e.terminate();this.workers=[],this.carga=[],this.dono.clear(),this.prontos=[],console.warn(`[mesh] pool de workers caiu — ${e.length} chunks voltam pro caminho síncrono`),this.onColapso?.(e)}encerrar(){for(let e of this.workers)e.terminate();this.workers=[],this.carga=[],this.dono.clear(),this.prontos=[]}},rg=64,ig=1024,ag={positions:new Float32Array,normals:new Float32Array,uvs:new Float32Array,sway:new Uint8Array,luz:new Uint8Array,indices:new Uint32Array,opaqueIndexCount:0,aguaIndexCount:0},og=class{world;materials;scene;meshes=new Map;fila=[];filaSet=new Set;remeshCount=0;remeshMsTotal=0;lastRemeshMs=0;porCaminho={fila:{n:0,ms:0},bloco:{n:0,ms:0},area:{n:0,ms:0},carga:{n:0,ms:0}};caminho=`bloco`;luz;pool=null;versaoAtual=new Map;seq=0;emVoo=new Map;chavesEmVoo=new Set;sujosEmVoo=new Set;onFalha;get remeshWorkerMsTotal(){return this.pool?.msTotal??0}get meshConfig(){return this.pool?.config??null}set modoCarga(e){this.emCarga=e,this.pool&&(this.pool.modoCarga=e)}emCarga=!1;constructor(e,t,n,r=!0,i,a){if(this.world=e,this.materials=t,this.scene=n,this.luz=a,r&&typeof Worker<`u`){let e=new ng(e=>{this.chavesEmVoo.clear(),this.sujosEmVoo.clear();for(let t of e){let e=this.emVoo.get(t);e&&this.enfileirar(e.cx,e.cy,e.cz,e.carga)}this.emVoo.clear(),this.pool=null},i);this.pool=e.disponivel?e:null}}novaVersao(e){let t=++this.seq;return this.versaoAtual.set(e,t),t}trocarMundo(e,t=!0,n){for(let e of this.meshes.values())this.scene.remove(e),e.geometry.dispose();this.meshes.clear(),this.versaoAtual.clear(),this.fila.length=0,this.filaSet.clear(),this.sujosEmVoo.clear(),this.chavesEmVoo.clear(),this.world=e,this.luz=n,t&&this.buildAll()}remeshSujos(e){this.caminho=`bloco`;for(let t of e){let{cx:e,cy:n,cz:r}=Af(this.world.dims,t);this.remesh(e,n,r)}}buildAll(){for(let e=0;e<this.world.dims.y;e++)for(let t=0;t<this.world.dims.z;t++)for(let n=0;n<this.world.dims.x;n++)this.enfileirar(n,e,t,!0)}remesh(e,t,n){let r=performance.now(),i=Bu(this.world,e,t,n);this.novaVersao(i);let a=Op(this.world,e,t,n,this.luz);this.aplicar(i,e,t,n,a),this.contabilizar(performance.now()-r)}aplicar(e,t,n,r,i){let a=this.meshes.get(e);if(a&&(this.scene.remove(a),a.geometry.dispose(),this.meshes.delete(e)),i.indices.length===0)return;let o=new pr;o.setAttribute(`position`,new Qn(i.positions,3)),o.setAttribute(`normal`,new Qn(i.normals,3)),o.setAttribute(`uv`,new Qn(i.uvs,2)),o.setAttribute(`sway`,new Qn(i.sway,1,!0)),o.setAttribute(`luz`,new Qn(i.luz,1,!1)),o.setIndex(new Qn(i.indices,1));let s=i.opaqueIndexCount+i.aguaIndexCount;o.addGroup(0,i.opaqueIndexCount,0),o.addGroup(i.opaqueIndexCount,i.aguaIndexCount,1),o.addGroup(s,i.indices.length-s,2);let c=new ti(o,this.materials);c.position.set(t*16,n*16,r*16),this.scene.add(c),this.meshes.set(e,c)}contabilizar(e){this.lastRemeshMs=e,this.remeshMsTotal+=e,this.remeshCount++;let t=this.porCaminho[this.caminho];t.n++,t.ms+=e}remeshBox(e,t){this.caminho=`area`;let n=(e,t)=>Math.max(0,Math.min(Math.floor(e/16),t-1)),r=n(e.x-1,this.world.dims.x),i=n(t.x+1,this.world.dims.x),a=n(e.y-1,this.world.dims.y),o=n(t.y+1,this.world.dims.y),s=n(e.z-1,this.world.dims.z),c=n(t.z+1,this.world.dims.z);for(let e=a;e<=o;e++)for(let t=s;t<=c;t++)for(let n=r;n<=i;n++)this.remesh(n,e,t)}enfileirar(e,t,n,r=!1){let i=Bu(this.world,e,t,n);if(!this.filaSet.has(i)){if(this.chavesEmVoo.has(i)){this.sujosEmVoo.add(i);return}this.filaSet.add(i),this.fila.push({cx:e,cy:t,cz:n,carga:r})}}enfileirarColuna(e,t){let n=(e,t,n)=>this.enfileirar(e,t,n);for(let r=0;r<this.world.dims.y;r++)n(e,r,t);for(let[r,i]of[[1,0],[-1,0],[0,1],[0,-1]]){let a=e+r,o=t+i;if(!(a<0||o<0||a>=this.world.dims.x||o>=this.world.dims.z)&&this.world.chunks[Bu(this.world,a,0,o)])for(let e=0;e<this.world.dims.y;e++)n(a,e,o)}}processarFila(e,t){this.onFalha=t;let n=performance.now()+e,r=this.emCarga?ig:rg,i=0;if(this.pool){let e=this.pool.colher();for(;e&&i<r;){let t=performance.now(),r=this.emVoo.get(e.id);if(this.emVoo.delete(e.id),r&&(this.chavesEmVoo.delete(r.key),this.caminho=r.carga?`carga`:`fila`,this.sujosEmVoo.delete(r.key)&&this.enfileirar(r.cx,r.cy,r.cz,r.carga),e.erro?(console.warn(`[mesh] chunk ${r.cx},${r.cy},${r.cz} falhou no worker: ${e.erro}`),this.onFalha?.(r.cx,r.cz)):this.versaoAtual.get(r.key)===r.versao&&this.aplicar(r.key,r.cx,r.cy,r.cz,{positions:e.positions,normals:e.normals,uvs:e.uvs,sway:e.sway,luz:e.luz,indices:e.indices,opaqueIndexCount:e.opaqueIndexCount,aguaIndexCount:e.aguaIndexCount}),this.contabilizar(r.msExtracao+(performance.now()-t))),++i>=1&&performance.now()>=n)break;e=this.pool.colher()}for(;this.fila.length>0&&this.pool.temVaga&&i<r;){let e=this.fila.shift(),t=Bu(this.world,e.cx,e.cy,e.cz);this.filaSet.delete(t),this.caminho=e.carga?`carga`:`fila`;let r=performance.now(),a=this.novaVersao(t),o;try{o=Ep(this.world,e.cx,e.cy,e.cz)}catch(t){console.warn(`[mesh] vizinhança ${e.cx},${e.cy},${e.cz} falhou:`,t),this.onFalha?.(e.cx,e.cz);continue}if(!o)this.aplicar(t,e.cx,e.cy,e.cz,ag),this.contabilizar(performance.now()-r);else{let n=this.pool.enviar(o,Dp(this.luz,e.cx,e.cy,e.cz));this.emVoo.set(n,{key:t,cx:e.cx,cy:e.cy,cz:e.cz,versao:a,msExtracao:performance.now()-r,carga:e.carga}),this.chavesEmVoo.add(t)}if(++i>=1&&performance.now()>=n)break}this.ultimoLote=i;return}for(;this.fila.length>0&&i<r;){let e=this.fila.shift();this.filaSet.delete(Bu(this.world,e.cx,e.cy,e.cz)),this.caminho=e.carga?`carga`:`fila`;try{this.remesh(e.cx,e.cy,e.cz)}catch(n){console.warn(`[mesh] chunk ${e.cx},${e.cy},${e.cz} falhou:`,n),t?.(e.cx,e.cz)}if(++i>=1&&performance.now()>=n)break}this.ultimoLote=i}ultimoLote=0;get filaPendente(){return this.fila.length+(this.pool?.emVoo??0)+(this.pool?.prontosPendentes??0)}descartarColuna(e,t){for(let n=0;n<this.world.dims.y;n++){let r=Bu(this.world,e,n,t);this.versaoAtual.delete(r),this.sujosEmVoo.delete(r);let i=this.meshes.get(r);i&&(this.scene.remove(i),i.geometry.dispose(),this.meshes.delete(r))}}remeshBlock(e,t,n){this.caminho=`bloco`;let r=e/16|0,i=t/16|0,a=n/16|0;this.remesh(r,i,a);let o=e-r*16,s=t-i*16,c=n-a*16;o===0&&r>0&&this.remesh(r-1,i,a),o===15&&r<this.world.dims.x-1&&this.remesh(r+1,i,a),s===0&&i>0&&this.remesh(r,i-1,a),s===15&&i<this.world.dims.y-1&&this.remesh(r,i+1,a),c===0&&a>0&&this.remesh(r,i,a-1),c===15&&a<this.world.dims.z-1&&this.remesh(r,i,a+1)}},sg=class e{descartarColuna;pedirColuna;faltando=new Map;pedidos=0;static ESPERA_INICIAL_MS=4e3;static BACKOFF_BASE_MS=2e3;static BACKOFF_MAX_MS=3e4;static PEDIDOS_POR_VARREDURA=4;constructor(e,t){this.descartarColuna=e,this.pedirColuna=t}get tamanho(){return this.faltando.size}get repedidas(){return this.pedidos}chegou(e){this.faltando.delete(e)}limpar(){this.faltando.clear()}varrer(t,n,r,i,a,o){let s=0;for(let c=t-a;c<=t+a;c++)for(let t=n-a;t<=n+a;t++){if(c<0||t<0||c>=i.x||t>=i.z)continue;let n=Rd(i,c,t);if(o.has(n))continue;let a=this.faltando.get(n);if(!a){this.faltando.set(n,{tentativas:0,proximo:r+e.ESPERA_INICIAL_MS});continue}r<a.proximo||s>=e.PEDIDOS_POR_VARREDURA||(this.descartarColuna(c,t),this.pedirColuna(c,t),a.tentativas++,a.proximo=r+Math.min(e.BACKOFF_MAX_MS,e.BACKOFF_BASE_MS*2**(a.tentativas-1)),s++,this.pedidos++)}for(let e of this.faltando.keys()){let{cx:r,cz:s}=zd(i,e);(o.has(e)||Id(r,s,t,n)>a)&&this.faltando.delete(e)}}};function cg(e,t,n){e.clearRect(0,0,t,t);let r=t*.28,i=t*.82,a=t*.2,o=t*.8,s=t*.32,c=t*.68;n&&(e.fillStyle=`#2e6fd6`,e.beginPath(),e.moveTo(a+t*.03,r+t*.03),e.lineTo(o-t*.03,r+t*.03),e.lineTo(c,i),e.lineTo(s,i),e.closePath(),e.fill()),e.strokeStyle=`#4a4a52`,e.fillStyle=n?`rgba(120,124,132,0.35)`:`#9a9ea8`,e.lineWidth=Math.max(1,t*.06),e.beginPath(),e.moveTo(a,r),e.lineTo(o,r),e.lineTo(c,i),e.lineTo(s,i),e.closePath(),n||e.fill(),e.stroke(),e.beginPath(),e.arc(t*.5,r,(o-a)/2,Math.PI,2*Math.PI),e.stroke()}function lg(e,t,n){if(e.clearRect(0,0,t,t),n===902){e.fillStyle=`#c8322c`,e.beginPath(),e.arc(t*.5,t*.58,t*.3,0,Math.PI*2),e.fill(),e.fillStyle=`#8c1f1c`,e.fillRect(t*.62,t*.42,t*.1,t*.3),e.strokeStyle=`#5a3a1e`,e.lineWidth=Math.max(1,t*.07),e.beginPath(),e.moveTo(t*.5,t*.3),e.lineTo(t*.56,t*.14),e.stroke(),e.fillStyle=`#4a8c3a`,e.fillRect(t*.56,t*.14,t*.22,t*.1);return}if(n===903){e.strokeStyle=`#b8912e`,e.lineWidth=Math.max(1,t*.09);for(let n of[-.16,0,.16])e.beginPath(),e.moveTo(t*(.5+n*.4),t*.9),e.lineTo(t*(.5+n),t*.16),e.stroke();e.fillStyle=`#e6c458`;for(let n of[-.16,0,.16])e.fillRect(t*(.5+n)-t*.11,t*.14,t*.22,t*.26);return}if(n===916){e.fillStyle=`#e8923c`,e.beginPath(),e.moveTo(t*.42,t*.36),e.lineTo(t*.58,t*.36),e.lineTo(t*.5,t*.84),e.closePath(),e.fill(),e.fillStyle=`#4a8c3a`;for(let n of[-.12,0,.12])e.fillRect(t*(.5+n)-t*.05,t*.2,t*.1,t*.16);return}if(n===917||n===922){e.fillStyle=n===922?`#d8b078`:`#a8783c`,e.beginPath(),e.ellipse(t*.5,t*.55,t*.3,t*.24,-.3,0,Math.PI*2),e.fill(),e.fillStyle=n===922?`#e8c890`:`#8a5e30`;for(let[n,r]of[[.42,.46],[.6,.6],[.52,.72]])e.fillRect(t*n,t*r,t*.08,t*.06);return}if(n===918){e.fillStyle=`#a02a3e`,e.beginPath(),e.arc(t*.5,t*.62,t*.26,0,Math.PI*2),e.fill(),e.fillStyle=`#7c1f30`,e.fillRect(t*.5,t*.6,t*.12,t*.28),e.fillStyle=`#8c2440`;for(let n of[-.1,.1])e.fillRect(t*(.5+n)-t*.05,t*.22,t*.1,t*.2);return}if(n===919){e.fillStyle=`#2e7a3a`,e.beginPath(),e.moveTo(t*.2,t*.3),e.lineTo(t*.8,t*.3),e.lineTo(t*.5,t*.82),e.closePath(),e.fill(),e.fillStyle=`#d83a38`,e.beginPath(),e.moveTo(t*.3,t*.3),e.lineTo(t*.7,t*.3),e.lineTo(t*.5,t*.74),e.closePath(),e.fill(),e.fillStyle=`#26262a`;for(let[n,r]of[[.42,.44],[.58,.44],[.5,.6]])e.fillRect(t*n,t*r,t*.06,t*.08);return}if(n===920){e.strokeStyle=`#e6c23a`,e.lineWidth=Math.max(2,t*.16),e.lineCap=`round`,e.beginPath(),e.arc(t*.48,t*.5,t*.26,Math.PI*.25,Math.PI*1.15),e.stroke(),e.fillStyle=`#8a6b2a`,e.fillRect(t*.24,t*.24,t*.08,t*.1);return}if(n===921){e.fillStyle=`#c8b088`;for(let[n,r,i]of[[.36,.6,-.4],[.66,.5,.4]])e.beginPath(),e.ellipse(t*n,t*r,t*.14,t*.26,i,0,Math.PI*2),e.fill();e.strokeStyle=`#a08058`,e.lineWidth=Math.max(1,t*.06);for(let n of[.34,.66])e.fillRect(t*n,t*.36,t*.04,t*.2);return}e.fillStyle=`#b5762f`,e.beginPath(),e.ellipse(t*.5,t*.54,t*.36,t*.24,0,0,Math.PI*2),e.fill(),e.fillStyle=`#d9a45c`;for(let n of[-.14,.08])e.fillRect(t*(.5+n),t*.4,t*.1,t*.16)}function ug(e,t,n){e.clearRect(0,0,t,t);let r=[[.32,.4],[.6,.34],[.46,.58],[.28,.68],[.66,.64]],i=dg(n,60);for(let[a,o]of r)e.fillStyle=n,e.beginPath(),e.ellipse(t*a,t*o,t*.11,t*.16,Math.PI/5,0,Math.PI*2),e.fill(),e.fillStyle=i,e.fillRect(t*a-t*.04,t*o-t*.1,t*.05,t*.1)}function dg(e,t){let n=parseInt(e.slice(1),16),r=Math.min(255,Math.max(0,(n>>16&255)+t)),i=Math.min(255,Math.max(0,(n>>8&255)+t)),a=Math.min(255,Math.max(0,(n&255)+t));return`#${(r<<16|i<<8|a).toString(16).padStart(6,`0`)}`}function fg(e,t,n){if(e.clearRect(0,0,t,t),n===907){e.strokeStyle=`#7a5426`,e.lineWidth=Math.max(1,t*.14),e.lineCap=`round`,e.beginPath(),e.moveTo(t*.26,t*.82),e.lineTo(t*.74,t*.2),e.stroke(),e.fillStyle=`#9c6d33`,e.fillRect(t*.4,t*.5,t*.12,t*.12),e.fillRect(t*.56,t*.3,t*.1,t*.1);return}if(n===906){e.fillStyle=`#3fc9d6`,e.beginPath(),e.moveTo(t*.5,t*.16),e.lineTo(t*.84,t*.5),e.lineTo(t*.5,t*.84),e.lineTo(t*.16,t*.5),e.closePath(),e.fill(),e.fillStyle=`#a8f0f6`,e.beginPath(),e.moveTo(t*.5,t*.2),e.lineTo(t*.72,t*.46),e.lineTo(t*.5,t*.5),e.closePath(),e.fill();return}if(n===909||n===910){let r=n===910;e.fillStyle=r?`#d8a72c`:`#b9bcc4`,e.beginPath(),e.moveTo(t*.3,t*.42),e.lineTo(t*.7,t*.42),e.lineTo(t*.82,t*.68),e.lineTo(t*.18,t*.68),e.closePath(),e.fill(),e.fillStyle=r?`#f6dc7a`:`#e2e5ec`,e.beginPath(),e.moveTo(t*.3,t*.42),e.lineTo(t*.7,t*.42),e.lineTo(t*.66,t*.5),e.lineTo(t*.34,t*.5),e.closePath(),e.fill();return}let r=mg.get(n);if(r){e.strokeStyle=`#7a5426`,e.lineWidth=Math.max(1,t*.12),e.lineCap=`round`,e.beginPath(),e.moveTo(t*.3,t*.86),e.lineTo(t*.66,t*.34),e.stroke(),e.strokeStyle=r,e.lineWidth=Math.max(1,t*.14),e.beginPath(),e.moveTo(t*.3,t*.32),e.quadraticCurveTo(t*.62,t*.1,t*.9,t*.34),e.stroke();return}if(n===911){e.strokeStyle=`#8a7d52`,e.lineWidth=Math.max(1,t*.08),e.beginPath(),e.moveTo(t*.5,t*.86),e.lineTo(t*.5,t*.56),e.stroke();for(let[n,r,i]of[[.5,.36,.22],[.31,.5,.17],[.69,.5,.17]])e.fillStyle=`#f4f4ee`,e.beginPath(),e.arc(t*n,t*r,t*i,0,Math.PI*2),e.fill(),e.fillStyle=`#cccdc6`,e.fillRect(t*(n+i*.3),t*(r+i*.1),t*i*.5,t*i*.6);return}let i=n===908;e.fillStyle=i?`#4a3524`:`#26262a`,e.beginPath(),e.moveTo(t*.22,t*.44),e.lineTo(t*.42,t*.2),e.lineTo(t*.76,t*.3),e.lineTo(t*.82,t*.62),e.lineTo(t*.56,t*.82),e.lineTo(t*.26,t*.7),e.closePath(),e.fill(),e.fillStyle=i?`#6d5136`:`#46464e`,e.beginPath(),e.moveTo(t*.4,t*.28),e.lineTo(t*.66,t*.36),e.lineTo(t*.5,t*.54),e.closePath(),e.fill()}var pg=new Set([905,908,906,907,909,910,911,912,913,914,915]),mg=new Map([[912,`#a8763a`],[913,`#8e8e94`],[914,`#d8dae2`],[915,`#4fd6e0`]]),hg=new Map([[G.Plantacao0,`#8a6b32`],[G.Algodao0,`#6d7a4a`],[G.Cenoura0,`#b0711f`],[G.Batata0,`#9c7a3c`],[G.Beterraba0,`#7c2f38`],[G.Melancia0,`#4c3a22`],[G.Banana0,`#5a5a52`],[G.Aipim0,`#8a7d5a`]]);function gg(e,t){let n=J.tilePx,r=new Map,i=document.createElement(`canvas`);i.width=n,i.height=n;let a=i.getContext(`2d`);if(!a)return r;for(let o of t){if(jl(o)){cg(a,n,o===901),r.set(o,i.toDataURL());continue}if(hg.has(o)){ug(a,n,hg.get(o)),r.set(o,i.toDataURL());continue}if(Ud(o)||o===903){lg(a,n,o),r.set(o,i.toDataURL());continue}if(pg.has(o)){fg(a,n,o),r.set(o,i.toDataURL());continue}let t=lp(o),s=t%J.tilesPerRow*n,c=(t/J.tilesPerRow|0)*n;a.clearRect(0,0,n,n),a.drawImage(e,s,c,n,n,0,0,n,n),r.set(o,i.toDataURL())}return r}var _g=class e{papel;mochila;deps;static KEY=`lj-hotbar`;el=document.getElementById(`hotbar`);slots;sel=0;varinha=!1;meusBlocos;icons;constructor(e,t,n,r){this.papel=e,this.mochila=t,this.deps=r,this.meusBlocos=Ah(e),this.slots=this.carregar(),this.icons=gg(n,[...kh.map(e=>e.id),900,902,903,904,905,906,907,908,909,910,911,912,913,914,915,916,917,922,918,919,920,921]),this.el?.addEventListener(`pointerdown`,e=>{let t=e.target?.closest?.(`.slot`);if(!t||!this.el)return;let n=[...this.el.querySelectorAll(`.slot`)].indexOf(t);n<0||(e.preventDefault(),this.selecionar(n))})}habilitarToque(){this.el&&(this.el.style.pointerEvents=`auto`,this.el.addEventListener(`click`,e=>{let t=e.target instanceof HTMLElement?e.target.closest(`.slot`):null,n=t?.parentElement?Array.from(t.parentElement.children).indexOf(t):-1;n<0||this.selecionar(n)}))}get selected(){return this.sel}get varinhaAtiva(){return this.varinha}get paleta(){return this.slots}idNaMao(){return this.mochila.ativa?this.mochila.idDoSlot(this.sel):this.slots[this.sel]??null}nome(e){return e===900?`balde vazio`:e===901?`balde de água`:e===902?`fruta`:e===903?`trigo`:e===904?`pão`:e===905?`carvão`:e===906?`diamante`:e===907?`graveto`:e===908?`carvão vegetal`:e===909?`lingote de ferro`:e===910?`lingote de ouro`:e===911?`algodão`:e===916?`cenoura`:e===917?`batata crua`:e===922?`batata assada`:e===918?`beterraba`:e===919?`melancia`:e===920?`banana`:e===921?`aipim`:e===912?`picareta de madeira`:e===913?`picareta de pedra`:e===914?`picareta de ferro`:e===915?`picareta de diamante`:kh.find(t=>t.id===e)?.name??`?`}selecionar(e){this.sel=e,this.refresh()}ciclar(e){this.sel=(this.sel+e+this.slots.length)%this.slots.length,this.refresh()}definirSlotLocal(t){this.slots[this.sel]=t,localStorage.setItem(e.KEY,JSON.stringify(this.slots)),this.refresh()}toggleVarinha(){this.papel!==`professor`&&!this.deps.claimsAtivo()||(this.varinha=!this.varinha,this.deps.setVarinhaToque(this.varinha),this.refresh())}revalidarVarinha(){!this.deps.claimsAtivo()&&this.papel!==`professor`&&this.varinha&&(this.varinha=!1,this.deps.setVarinhaToque(!1))}refresh(){if(!this.el)return;if(this.varinha){let e=this.papel===`professor`?`/regiao criar nome`:`/claim criar`;this.el.innerHTML=`<b>[varinha]</b> esq = canto 1 · dir = canto 2 · ${e} · R/🪄 volta`;return}let e=this.mochila.ativa?this.mochila.hotbar():this.slots,t=e.map((e,t)=>{let n=t===this.sel?` sel`:``;if(e==null)return`<span class="slot${n} vazio"><small>${t+1}</small></span>`;let r=this.mochila.ativa?this.mochila.qtdDoSlot(t):0,i=r>1?`<b class="qtd">${r}</b>`:``;return`<span class="slot${n}" data-tip-id="${e}"><small>${t+1}</small><img src="${this.icons.get(e)??``}" alt="">${i}</span>`}).join(``),n=e[this.sel];this.el.innerHTML=`<span class="bar-nome">${n==null?`mão vazia`:this.nome(n)}</span><span class="slots">${t}</span>`,this.deps.aoRedesenhar()}carregar(){let t=this.meusBlocos.slice(0,9).map(e=>e.id),n=new Set(this.meusBlocos.map(e=>e.id));n.add(900);try{let r=JSON.parse(localStorage.getItem(e.KEY)??`null`);return Array.isArray(r)?t.map((e,t)=>{let i=r[t];return typeof i==`number`&&n.has(i)?i:e}):t}catch{return t}}},vg=class{desligada;grade;fila=[];naFila=new Set;msTotal=0;colunas=0;constructor(e,t){this.desligada=t,this.grade=Of(e)}get paraMesher(){return this.desligada?void 0:this.grade}get medidas(){return{colunas:this.colunas,totalMs:this.msTotal,fila:this.fila.length}}get filaVazia(){return this.fila.length===0}enfileirar(e,t,n){let r=t*n+e;this.naFila.has(r)||(this.naFila.add(r),this.fila.push({cx:e,cz:t}))}descartar(e,t){Mf(this.grade,e,t)}trocarMundo(e){this.grade=Of(e),this.fila.length=0,this.naFila.clear()}acenderTudo(e){if(!this.desligada)for(let t=0;t<e.dims.x;t++)for(let n=0;n<e.dims.z;n++)Xf(e,this.grade,t,n)}aoMudarBloco(e,t,n,r){return this.desligada?new Set:Zf(e,this.grade,t,n,r)}aoChegarColuna(e,t,n){return this.desligada?new Set:Xf(e,this.grade,t,n)}drenar(e,t,n){let r=performance.now()+t,i=[];for(;this.fila.length>0;){let t=this.fila.shift();if(this.naFila.delete(t.cz*e.dims.x+t.cx),n(t.cz*e.dims.x+t.cx)){if(!this.desligada){let n=performance.now();Xf(e,this.grade,t.cx,t.cz),this.msTotal+=performance.now()-n,this.colunas++}if(i.push(t),i.length>=1&&performance.now()>=r)break}}return i}},yg=class e{scene;players=new Map;constructor(e){this.scene=e}static fazerPlaca(e){let t=document.createElement(`canvas`),n=t.getContext(`2d`),r=`bold 32px sans-serif`;n.font=r,t.width=Math.ceil(n.measureText(e).width)+20,t.height=44,n.font=r,n.fillStyle=`rgba(0,0,0,0.4)`,n.fillRect(0,0,t.width,t.height),n.fillStyle=`#fff`,n.textAlign=`center`,n.textBaseline=`middle`,n.fillText(e,t.width/2,t.height/2);let i=new Pi(t);i.minFilter=o;let a=new Nr(new yr({map:i,depthTest:!1,transparent:!0}));a.renderOrder=999;let s=.32;return a.scale.set(s*t.width/t.height,s,1),a.position.set(0,q.height/2+.35,0),a}static soltarPlaca(e){e.label&&=(e.label.material.map?.dispose(),e.label.material.dispose(),e.mesh.remove(e.label),void 0)}aoMover(t){let n=this.players.get(t.id);if(!n){let e=new ti(new Ri(q.width,q.height,q.width),new na({color:new H().setHSL(t.id*.618034%1,.7,.5)}));e.position.set(t.x,t.y+q.height/2,t.z),e.rotation.y=t.yaw,this.scene.add(e),n={mesh:e,target:e.position.clone(),targetYaw:t.yaw},this.players.set(t.id,n)}t.name&&t.name!==n.labelName&&(e.soltarPlaca(n),n.label=e.fazerPlaca(t.name),n.labelName=t.name,n.mesh.add(n.label)),n.target.set(t.x,t.y+q.height/2,t.z),n.targetYaw=t.yaw}aoSair(t){let n=this.players.get(t);n&&(e.soltarPlaca(n),this.scene.remove(n.mesh),n.mesh.geometry.dispose(),n.mesh.material.dispose(),this.players.delete(t))}interpolar(e){let t=1-Math.exp(-e*12);for(let e of this.players.values()){e.mesh.position.lerp(e.target,t);let n=e.targetYaw-e.mesh.rotation.y;e.mesh.rotation.y+=Math.atan2(Math.sin(n),Math.cos(n))*t}}alvosParaMira(){return[...this.players].map(([e,t])=>({id:e,x:t.mesh.position.x,y:t.mesh.position.y-q.height/2,z:t.mesh.position.z}))}},bg=(e,t,n,r,i)=>({hora:e,ceu:new H(t),sol:new H(n),solInt:r,ambInt:i}),xg=[bg(0,263695,3819392,.14,.3),bg(4.5,660016,4544666,.18,.31),bg(5.5,2569582,8022682,.35,.34),bg(6.5,14715470,16763274,1.15,.44),bg(7.5,11062764,16772300,1.9,.5),bg(12,8900331,16777215,2.4,.55),bg(16.5,9421800,16774106,2.1,.51),bg(17.8,14260572,16760954,1.5,.46),bg(18.7,14248516,16747093,.9,.4),bg(19.6,1778768,4871568,.3,.33),bg(21,659494,3819392,.17,.3),bg(24,263695,3819392,.14,.3)],Sg=.14,Cg=2.4,wg=.22,Tg=420,Eg=460,Dg=400,Og=100,kg=1400,Ag=260,jg=9,Mg=128;function Ng(e,t,n){let r=(e%n+n)%n,i=(t%n+n)%n,a=Math.imul(r,374761393)^Math.imul(i,668265263);return a=Math.imul(a^a>>>13,1274126177),((a^a>>>16)>>>0)/4294967296}function Pg(e,t,n){let r=e*n,i=t*n,a=Math.floor(r),o=Math.floor(i),s=r-a,c=i-o,l=s*s*(3-2*s),u=c*c*(3-2*c),d=Ng(a,o,n),f=Ng(a+1,o,n),p=Ng(a,o+1,n),m=Ng(a+1,o+1,n);return(d+(f-d)*l)*(1-u)+(p+(m-p)*l)*u}function Fg(){let t=Mg,n=document.createElement(`canvas`);n.width=n.height=t;let r=n.getContext(`2d`);if(!r)throw Error(`canvas 2d indisponível`);let i=r.createImageData(t,t);for(let e=0;e<t;e++)for(let n=0;n<t;n++){let r=n/t,a=e/t,o=Pg(r,a,3)*.52+Pg(r,a,6)*.26+Pg(r,a,12)*.14+Pg(r,a,24)*.08,s=Math.min(1,Math.max(0,(o-.44)/.17)),c=(e*t+n)*4;i.data[c]=255,i.data[c+1]=255,i.data[c+2]=255,i.data[c+3]=Math.round(s*235)}r.putImageData(i,0,0);let a=new Pi(n);a.wrapS=a.wrapT=e;let o=kg/Ag;return a.repeat.set(o,o),a}var Ig=new H,Lg=new H,Rg=e=>Math.min(Math.max(e,0),1),zg=class{sun;ambient;scene;camera;hora=12;ciclo=!1;nivelCeuAtual=1;get nivelCeu(){return this.nivelCeuAtual}nuvemScrollU=0;nuvemScrollV=0;skyGroup=new un;sunDisc;sunGlow;moonDisc;stars;nuvens;sunMat;glowMat;moonMat;starsMat;nuvemMat;nuvemTex;constructor(e,t,n,r,i=!0){this.sun=e,this.ambient=t,this.scene=n,this.camera=r,this.sunMat=new Ur({color:16768875,transparent:!0,depthWrite:!1}),this.sunDisc=new ti(new Gi(56,56),this.sunMat),this.glowMat=new Ur({color:16756816,transparent:!0,opacity:.28,depthWrite:!1,blending:2}),this.sunGlow=new ti(new zi(52,24),this.glowMat),this.moonMat=new Ur({color:14673650,transparent:!0,depthWrite:!1}),this.moonDisc=new ti(new zi(20,24),this.moonMat);let a=new Float32Array(Dg*3),o=20260719,s=()=>(o=Math.imul(o,1664525)+1013904223>>>0,o/4294967296);for(let e=0;e<Dg;e++){let t=s()*2-1,n=s()*Math.PI*2,r=Math.sqrt(1-t*t);a[e*3]=Math.cos(n)*r*Eg,a[e*3+1]=t*Eg,a[e*3+2]=Math.sin(n)*r*Eg}let c=new pr;c.setAttribute(`position`,new Qn(a,3)),this.starsMat=new Ei({color:15922431,size:2,sizeAttenuation:!1,transparent:!0,opacity:0,depthWrite:!1}),this.stars=new ji(c,this.starsMat),this.nuvemTex=Fg(),this.nuvemMat=new Ur({map:this.nuvemTex,transparent:!0,alphaTest:.02,depthWrite:!1,side:2,fog:!1}),this.nuvens=new ti(new Gi(kg,kg),this.nuvemMat),this.nuvens.rotation.x=-Math.PI/2,this.nuvens.position.y=Og,this.nuvens.visible=i,this.skyGroup.add(this.sunDisc,this.sunGlow,this.moonDisc,this.stars,this.nuvens),n.add(this.skyGroup)}setNuvens(e){this.nuvens.visible=e}dispose(){this.nuvemTex.dispose(),this.nuvemMat.dispose(),this.nuvens.geometry.dispose()}sync(e,t){Number.isFinite(e)&&(this.hora=(e%24+24)%24),this.ciclo=t}update(e,t){if(this.ciclo&&(this.hora=(this.hora+e*24/Iu)%24),t&&this.nuvens.visible){let n=e*jg*t.forca/Ag;this.nuvemScrollU-=t.x*n,this.nuvemScrollV+=t.z*n}this.apply()}apply(){let e=this.hora,t=xg[0],n=xg[xg.length-1];for(let r=0;r<xg.length-1;r++)if(e>=xg[r].hora&&e<=xg[r+1].hora){t=xg[r],n=xg[r+1];break}let r=n.hora-t.hora||1,i=Rg((e-t.hora)/r);i=i*i*(3-2*i),Ig.copy(t.ceu).lerp(n.ceu,i),this.scene.background.copy(Ig),Lg.copy(t.sol).lerp(n.sol,i),this.sun.color.copy(Lg),this.sun.intensity=t.solInt+(n.solInt-t.solInt)*i,this.ambient.intensity=t.ambInt+(n.ambInt-t.ambInt)*i,this.nivelCeuAtual=wg+(1-wg)*Rg((this.sun.intensity-Sg)/(Cg-Sg));let a=(e-6)/12*Math.PI,o=Math.cos(a),s=Math.sin(a);this.sun.position.set(o*100,Math.max(s*100,-40),40),this.skyGroup.position.copy(this.camera.position);let c=Math.hypot(o,s,.35),l=o/c*Tg,u=s/c*Tg,d=.35/c*Tg;this.sunDisc.position.set(l,u,d),this.sunGlow.position.set(l,u,d),this.moonDisc.position.set(-l,-u,d),this.sunDisc.lookAt(this.camera.position),this.sunGlow.lookAt(this.camera.position),this.moonDisc.lookAt(this.camera.position);let f=Rg((s+.14)/.28);this.sunMat.opacity=f,this.glowMat.opacity=.28*f,this.sunDisc.visible=this.sunGlow.visible=f>0;let p=Rg((-s+.14)/.28);this.moonMat.opacity=.92*p,this.moonDisc.visible=p>0;let m=Rg((-s-.08)/.3);this.starsMat.opacity=m,this.stars.visible=m>0,this.stars.rotation.z=a*.5,this.nuvens.visible&&(this.nuvemMat.color.copy(Lg).multiplyScalar(.92),this.nuvemMat.opacity=.5+.35*Rg(s+.35),this.nuvemTex.offset.set(this.camera.position.x/Ag+this.nuvemScrollU,-this.camera.position.z/Ag+this.nuvemScrollV))}},Bg=Math.PI*2,Vg=2,Hg=class{dir=0;forca=0;ativo=!1;fase=0;alvoDir=0;alvoForca=0;sync(e,t,n){Number.isFinite(e)&&(this.alvoDir=(e%Bg+Bg)%Bg),Number.isFinite(t)&&(this.alvoForca=Math.min(1,Math.max(0,t))),this.ativo=n}update(e){let t=1-Math.exp(-e*Vg),n=this.alvoDir-this.dir;n>Math.PI&&(n-=Bg),n<-Math.PI&&(n+=Bg),this.dir=(this.dir+n*t+Bg)%Bg,this.forca+=(this.alvoForca-this.forca)*t,this.fase+=e*(.35+this.forca*.4)}get x(){return Math.cos(this.dir)}get z(){return Math.sin(this.dir)}get setor(){return Math.floor(this.dir/(Bg/8))%8}get ondaAgua(){return tp(this.dir)}};function Ug(e,t){e.onBeforeCompile=e=>{e.uniforms.ventoTempo=t.ventoTempo,e.uniforms.ventoDir=t.ventoDir,e.uniforms.ventoForca=t.ventoForca,e.vertexShader=e.vertexShader.replace(`#include <common>`,`#include <common>
attribute float sway;
uniform float ventoTempo;
uniform vec2 ventoDir;
uniform float ventoForca;`).replace(`#include <begin_vertex>`,`#include <begin_vertex>
if (sway > 0.0 && ventoForca > 0.0) {
  vec3 mundoPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
  float p = mundoPos.x * 0.16 + mundoPos.z * 0.13;
  float onda = sin(ventoTempo * 0.34 + p) * 0.65
             + sin(ventoTempo * 0.55 + p * 1.7) * 0.35;
  transformed.xz += ventoDir * (onda * sway * ventoForca * 0.22);
}`)},e.needsUpdate=!0}function Wg(){return{ventoTempo:{value:0},ventoDir:{value:new z(1,0)},ventoForca:{value:0}}}function Gg(e,t,n){let r=n^Math.imul(e,374761393)^Math.imul(t,668265263);return r=Math.imul(r^r>>>13,1274126177),((r^r>>>16)>>>0)/4294967296}function Q(e,t,n,r,i=0,a=J.tilePx){let o=J.tilePx,s=t%J.tilesPerRow*o,c=(t/J.tilesPerRow|0)*o;for(let l=i;l<a;l++)for(let i=0;i<o;i++){let a=(Gg(i,l,t*7919+1)-.5)*2*r;e.fillStyle=`rgb(${Math.round(n[0]+a)},${Math.round(n[1]+a)},${Math.round(n[2]+a)})`,e.fillRect(s+i,c+l,1,1)}}function Kg(e,t){let n=J.tilePx,r=t%J.tilesPerRow*n,i=(t/J.tilesPerRow|0)*n;e.fillStyle=`rgb(72,72,72)`;for(let t=0;t<n;t++)e.fillRect(r+t,i+(t%2==0?4:5),1,1),e.fillRect(r+t,i+(t%3==0?11:10),1,1),e.fillRect(r+(t%2==0?7:8),i+t,1,1)}function qg(e){let t=J.tilePx;return[e%J.tilesPerRow*t,(e/J.tilesPerRow|0)*t]}function Jg(e,t){let[n,r]=qg(t);e.fillStyle=`rgb(74,54,34)`;for(let i=1;i<J.tilePx;i+=4)for(let a=0;a<J.tilePx;a++)Gg(i,a,t*31+3)<.8&&e.fillRect(n+i,r+a,1,a===0?2:1)}function Yg(e,t){let[n,r]=qg(t),i=J.tilePx/2-.5;e.fillStyle=`rgb(120,90,52)`;for(let t=0;t<J.tilePx;t++)for(let a=0;a<J.tilePx;a++){let o=Math.hypot(a-i,t-i);Math.round(o)%3==0&&o<7.5&&e.fillRect(n+a,r+t,1,1)}}function Xg(e,t){let[n,r]=qg(t);e.fillStyle=`rgb(122,92,56)`;for(let t=3;t<J.tilePx;t+=4)e.fillRect(n,r+t,J.tilePx,1);for(let t=0;t<4;t++)e.fillRect(n+(t%2==0?4:11),r+t*4,1,3)}function Zg(e,t){let[n,r]=qg(t);e.fillStyle=`rgb(196,178,124)`;for(let i=3;i<J.tilePx;i+=5)for(let a=0;a<J.tilePx;a++)Gg(a,i,t*41+5)<.7&&e.fillRect(n+a,r+i,1,1)}function Qg(e,t){let[n,r]=qg(t);e.fillStyle=`rgb(96,96,96)`;for(let t=3;t<J.tilePx;t+=4)e.fillRect(n,r+t,J.tilePx,1);for(let t=0;t<4;t++){let i=t%2==0?7:3;e.fillRect(n+i,r+t*4,1,3),e.fillRect(n+(i+8)%J.tilePx,r+t*4,1,3)}}function $g(e,t){let[n,r]=qg(t);e.fillStyle=`rgb(92,58,128)`;for(let i=0;i<J.tilePx;i++)for(let a=0;a<J.tilePx;a++)Gg(a,i,t*67+11)<.06&&e.fillRect(n+a,r+i,1,1)}function e_(e,t){let[n,r]=qg(t);for(let i=0;i<4;i++)for(let a=0;a<J.tilePx;a++){let o=(a+(i%2==0?0:4))%8;for(let s=0;s<3;s++){if(o===7)continue;let c=(Gg(a,i*4+s,t*53+9)-.5)*20;e.fillStyle=`rgb(${Math.round(158+c)},${Math.round(64+c)},${Math.round(52+c)})`,e.fillRect(n+a,r+i*4+s,1,1)}}}function t_(e,t){let[n,r]=qg(t),i=J.tilePx;e.clearRect(n,r,i,i),e.fillStyle=`rgb(214,232,240)`,e.fillRect(n,r,i,1),e.fillRect(n,r+i-1,i,1),e.fillRect(n,r,1,i),e.fillRect(n+i-1,r,1,i);for(let t=2;t<6;t++)e.fillRect(n+t,r+8-t,1,1);for(let t=4;t<10;t++)e.fillRect(n+t,r+14-t,1,1)}function n_(e,t,n){let[r,i]=qg(t),a=J.tilePx;e.fillStyle=`rgb(${n[0]},${n[1]},${n[2]})`,e.fillRect(r,i,a,a),e.fillStyle=`rgb(${Math.round((n[0]+255)/2)},${Math.round((n[1]+255)/2)},${Math.round((n[2]+255)/2)})`,e.fillRect(r,i,a,1),e.fillRect(r,i+a-1,a,1),e.fillRect(r,i,1,a),e.fillRect(r+a-1,i,1,a),e.fillStyle=`rgb(240,246,250)`;for(let t=3;t<8;t++)e.fillRect(r+t,i+11-t,1,1)}function r_(e,t,n,r){Q(e,t,r,6);let[i,a]=qg(t),o=J.tilePx;e.fillStyle=`rgb(28,28,32)`,e.font=`bold ${o-3}px sans-serif`,e.textAlign=`center`,e.textBaseline=`middle`,e.fillText(n,i+o/2,a+o/2+1)}function i_(e,t){Q(e,t,[146,112,66],10);let[n,r]=qg(t);e.fillStyle=`rgb(116,86,48)`;for(let i=2;i<J.tilePx;i+=3)for(let a=0;a<J.tilePx;a++)Gg(i,a,t*29+7)<.6&&e.fillRect(n+i,r+a,1,1)}function a_(e,t,n){Q(e,t,[164,126,76],8);let[r,i]=qg(t),a=J.tilePx;e.fillStyle=`rgb(112,82,46)`,e.fillRect(r,i,a,1),e.fillRect(r,i+a-1,a,1),e.fillRect(r,i,1,a),e.fillRect(r+a-1,i,1,a),e.fillRect(r+8,i,1,a),n&&(e.fillRect(r+3,i+3,10,1),e.fillRect(r+3,i+9,10,1),e.fillRect(r+3,i+3,1,7),e.fillRect(r+12,i+3,1,7),e.clearRect(r+4,i+4,8,5))}function o_(e,t){Q(e,t,[255,232,122],14,0,10),Q(e,t,[122,92,56],10,10,J.tilePx)}function s_(e,t){Q(e,t,[164,126,76],8);let[n,r]=qg(t),i=J.tilePx;e.clearRect(n+2,r+2,i-4,i-4),e.fillStyle=`rgb(112,82,46)`,e.fillRect(n+7,r+2,2,i-4),e.fillRect(n+2,r+7,i-4,2),e.fillStyle=`rgb(214,232,240)`;for(let t=0;t<3;t++)e.fillRect(n+3+t,r+6-t,1,1);for(let t=0;t<3;t++)e.fillRect(n+10+t,r+13-t,1,1)}function c_(e,t){Q(e,t,[72,104,168],8);let[n,r]=qg(t);e.fillStyle=`rgb(54,80,132)`;for(let t=5;t<J.tilePx;t+=6)e.fillRect(n,r+t,J.tilePx,1),e.fillRect(n+t,r,1,J.tilePx)}function l_(e,t){Q(e,t,[178,54,48],8);let[n,r]=qg(t);e.fillStyle=`rgb(140,40,36)`;for(let t=4;t<J.tilePx;t+=5)e.fillRect(n,r+t,J.tilePx,1)}function u_(e,t){Q(e,t,[242,238,228],4);let[n,r]=qg(t),i=J.tilePx;e.fillStyle=`rgb(122,86,50)`,e.fillRect(n,r,i,2),e.fillRect(n,r+i-2,i,2),e.fillRect(n,r,2,i),e.fillRect(n+i-2,r,2,i)}function d_(e,t,n=[52,118,44]){Q(e,t,n,16);let[r,i]=qg(t);for(let n=0;n<J.tilePx;n++)for(let a=0;a<J.tilePx;a++)Gg(a,n,t*97+13)<.22&&e.clearRect(r+a,i+n,1,1)}function f_(e,t,n,r){Q(e,t,[136,136,136],12);let[i,a]=qg(t);e.fillStyle=`rgb(${n[0]},${n[1]},${n[2]})`;for(let n=1;n<J.tilePx-2;n++)for(let r=1;r<J.tilePx-2;r++)Gg(r,n,t*131+17)<.07&&e.fillRect(i+r,a+n,2,2);let o=i+J.tilePx/2,s=a+J.tilePx/2;e.font=`bold 8px sans-serif`,e.textAlign=`center`,e.textBaseline=`middle`,e.fillStyle=`rgb(20,20,24)`,e.fillText(r,o+1,s+2),e.fillStyle=`rgb(244,244,248)`,e.fillText(r,o,s+1)}function p_(e,t){Q(e,t,[66,138,74],10);let[n,r]=qg(t);e.fillStyle=`rgb(48,104,56)`;for(let t=2;t<J.tilePx;t+=4)e.fillRect(n+t,r,1,J.tilePx);e.fillStyle=`rgb(230,238,214)`;for(let i=1;i<J.tilePx;i+=3)for(let a=3;a<J.tilePx;a+=4)Gg(a,i,t*61+19)<.5&&e.fillRect(n+a,r+i,1,1)}function m_(e,t){Q(e,t,[96,168,100],8);let[n,r]=qg(t),i=J.tilePx;e.fillStyle=`rgb(48,104,56)`,e.fillRect(n,r,i,1),e.fillRect(n,r+i-1,i,1),e.fillRect(n,r,1,i),e.fillRect(n+i-1,r,1,i)}function h_(e,t,n){let[r,i]=qg(t),a=J.tilePx;e.clearRect(r,i,a,a);let o=r+(a>>1);e.fillStyle=`rgb(56,132,52)`,e.fillRect(o-1,i+(a>>1),2,a>>1),e.fillRect(o-3,i+a-5,2,2),e.fillRect(o+1,i+a-7,2,2),e.fillStyle=`rgb(${n[0]},${n[1]},${n[2]})`,e.fillRect(o-3,i+2,6,6),e.fillRect(o-4,i+4,8,2),e.fillRect(o-2,i+1,4,8),e.fillStyle=`rgb(250,214,74)`,e.fillRect(o-1,i+4,2,2)}function g_(e,t,n){let[r,i]=qg(t),a=J.tilePx;e.clearRect(r,i,a,a);for(let o=0;o<7;o++){let s=1+Math.floor(Gg(o,0,t*17+3)*(a-2)),c=7+Math.floor(Gg(o,1,t*17+5)*7),l=Gg(o,2,t*17+7)<.5?-1:1,u=.72+Gg(o,3,t*17+9)*.5;e.fillStyle=`rgb(${Math.round(n[0]*u)},${Math.round(n[1]*u)},${Math.round(n[2]*u)})`;for(let t=0;t<c;t++){let n=a-1-t,o=t/c,u=s+Math.round(o*o*3)*l;u<0||u>=a||(e.fillRect(r+u,i+n,1,1),o<.45&&u+1<a&&e.fillRect(r+u+1,i+n,1,1))}}}function __(e,t,n){let[r,i]=qg(t),a=J.tilePx;e.clearRect(r,i,a,a);let o=[[96,176,74],[104,172,62],[156,176,56],[206,176,60]],s=o[n]??o[0],c=4+n*4;for(let t=0;t<5;t++){let o=2+Math.floor(Gg(t,0,91)*(a-4)),l=Math.max(2,c-Math.floor(Gg(t,1,93)*3)),u=.78+Gg(t,2,95)*.42;e.fillStyle=`rgb(${Math.round(s[0]*u)},${Math.round(s[1]*u)},${Math.round(s[2]*u)})`;for(let t=0;t<l;t++)e.fillRect(r+o,i+a-1-t,1,1);n===3&&(e.fillStyle=`rgb(226,196,88)`,e.fillRect(r+o-1,i+a-l,3,3))}}function v_(e,t,n,r){let[i,a]=qg(t),o=J.tilePx;e.clearRect(i,a,o,o);let s=4+n*2,c=i+(o/2|0)-1;e.fillStyle=`rgb(${r.casca[0]},${r.casca[1]},${r.casca[2]})`;for(let t=0;t<s;t++)e.fillRect(c,a+o-1-t,2,1);let l=a+o-1-s,u=1+n,d=(e,n)=>.8+Gg(t*7+e+n*37,0,41)*.5;for(let t=0;t<u*2-1;t++){let n=t-u+1,i=2*u-Math.abs(n)*2-1,a=c+1-(i>>1);for(let o=0;o<i;o++){let i=d(o,n);e.fillStyle=`rgb(${Math.round(r.folha[0]*i)},${Math.round(r.folha[1]*i)},${Math.round(r.folha[2]*i)})`,e.fillRect(a+o,l-u+1+t,1,1)}}}function y_(e,t,n){Q(e,t,[128,128,130],16),Kg(e,t);let[r,i]=qg(t),a=J.tilePx,o=r+3,s=i+6,c=a-6,l=a-9;e.fillStyle=`rgb(168,168,170)`,e.fillRect(o-1,s-1,c+2,l+2),e.fillStyle=n?`rgb(58,20,8)`:`rgb(38,36,38)`,e.fillRect(o,s,c,l),n&&(e.fillStyle=`rgb(220,96,26)`,e.fillRect(o,s+l-3,c,3),e.fillStyle=`rgb(248,190,60)`,e.fillRect(o+2,s+l-5,2,3),e.fillRect(o+c-4,s+l-6,2,4))}function b_(e,t){Q(e,t,[112,112,116],14),Kg(e,t)}function x_(e,t){Q(e,t,[140,140,142],12);let[n,r]=qg(t),i=J.tilePx;e.strokeStyle=`rgb(74,70,68)`,e.lineWidth=1,e.strokeRect(n+2.5,r+2.5,i-5,i-5)}function S_(e,t,n){Q(e,t,[116,78,40],14);let[r,i]=qg(t),a=J.tilePx;e.fillStyle=`rgb(84, 54, 26)`;for(let t of[4,8,12])e.fillRect(r+t,i,1,a);if(n){e.strokeStyle=`rgb(70, 46, 22)`,e.lineWidth=1,e.strokeRect(r+1.5,i+1.5,a-3,a-3),e.fillStyle=`rgb(150, 150, 158)`,e.fillRect(r+2,i+7,a-4,2);return}e.fillStyle=`rgb(146, 100, 52)`,e.fillRect(r,i+4,a,1),e.fillStyle=`rgb(64, 40, 18)`,e.fillRect(r,i+5,a,1),e.fillStyle=`rgb(158, 158, 166)`,e.fillRect(r+6,i+3,4,5),e.fillStyle=`rgb(52, 52, 58)`,e.fillRect(r+7,i+5,2,2)}function C_(e,t,n,r=!1){let[i,a]=qg(t),o=J.tilePx;e.clearRect(i,a,o,o);let s=r?[126,140,74]:[88,152,78],c=r?11:4+n*3;for(let t=0;t<4;t++){let l=3+Math.floor(Gg(t,0,61)*(o-6)),u=Math.max(2,c-Math.floor(Gg(t,1,67)*3)),d=.8+Gg(t,2,71)*.4;e.fillStyle=`rgb(${Math.round(s[0]*d)},${Math.round(s[1]*d)},${Math.round(s[2]*d)})`;for(let t=0;t<u;t++)e.fillRect(i+l,a+o-1-t,1,1);(n===3||r)&&(e.fillStyle=`rgb(244,244,238)`,e.fillRect(i+l-1,a+o-u-2,3,3),e.fillStyle=`rgb(206,206,198)`,e.fillRect(i+l+1,a+o-u,1,1))}}function w_(e,t,n,r,i,a=!1){let[o,s]=qg(t),c=J.tilePx;e.clearRect(o,s,c,c);let l=a?[Math.round(r.folha[0]*.9),Math.round(r.folha[1]*.85),Math.round(r.folha[2]*.6)]:r.folha,u=a?12:4+n*3;for(let t=0;t<4;t++){let n=3+Math.floor(Gg(t,0,i+11)*(c-6)),r=Math.max(2,u-Math.floor(Gg(t,1,i+17)*3)),a=.78+Gg(t,2,i+23)*.42;e.fillStyle=`rgb(${Math.round(l[0]*a)},${Math.round(l[1]*a)},${Math.round(l[2]*a)})`;for(let t=0;t<r;t++)e.fillRect(o+n,s+c-1-t,1,1)}if(n===3||a)if(e.fillStyle=`rgb(${r.fruta[0]},${r.fruta[1]},${r.fruta[2]})`,r.frutaNoTopo){let t=o+c/2-r.largura,n=s+c-u-3;e.fillRect(t,n,r.largura*2,Math.max(2,r.largura))}else{let t=o+c/2-r.largura;e.fillRect(t,s+c-3,r.largura*2,3),e.fillRect(t+1,s+c-4,r.largura*2-2,1)}}var T_={a:[-3,0],b:[-3,0],mistura:0},E_=Y.agua*7919+1;function D_(e,t,n,r,i){let a=J.tilePx,o=Math.PI*2/a,s=i.mistura,c=(e,t,n)=>{let i=Math.sin((e[0]*t+e[1]*n)*o-r),a=Math.sin((-e[1]*t+e[0]*n)*o*2-r*.55);return[i*6+a*3,+(i>.82&&a>.1)]};for(let r=0;r<a;r++)for(let o=0;o<a;o++){let[a,l]=c(i.a,o,r),[u,d]=c(i.b,o,r),f=a+(u-a)*s,p=l+(d-l)*s,m=(Gg(o,r,E_)-.5)*2*6,h=(r*t+n+o)*4;e[h]=46+f+m+p*52,e[h+1]=108+f+m+p*44,e[h+2]=182+f*.6+m+p*28,e[h+3]=255}}var O_=null,k_=null;function A_(e,t,n,r){let i=J.tilePx,a=Math.PI*2/16;O_??=e.createImageData(i,i),D_(O_.data,i,0,t%16*a,n);let[o,s]=qg(Y.agua);e.putImageData(O_,o,s);let c=$f.length;k_??=e.createImageData(i*c,i);let l=r%16*a;for(let e=0;e<c;e++){let t=$f[e];D_(k_.data,i*c,e*i,l,{a:t,b:t,mistura:0})}let[u,d]=qg(Y.aguaFluxo);e.putImageData(k_,u,d)}function j_(e,t,n,r){let i=e.image.getContext(`2d`);i&&(A_(i,t,n??T_,r),e.needsUpdate=!0)}function M_(){let e=J.tilesPerRow*J.tilePx,t=document.createElement(`canvas`);t.width=e,t.height=e;let n=t.getContext(`2d`);if(!n)throw Error(`canvas 2d indisponível`);Q(n,Y.grassTop,[92,158,60],14),Q(n,Y.grassSide,[121,88,58],12),Q(n,Y.grassSide,[92,158,60],14,0,4),Q(n,Y.dirt,[121,88,58],12),Q(n,Y.stone,[136,136,136],12),Q(n,Y.cobblestone,[120,120,120],20),Kg(n,Y.cobblestone),Q(n,Y.sand,[219,207,142],10),Q(n,Y.logSide,[104,78,48],10),Jg(n,Y.logSide),Q(n,Y.logTop,[168,132,82],8),Yg(n,Y.logTop),Q(n,Y.planks,[172,136,86],8),Xg(n,Y.planks),Q(n,Y.brick,[186,180,172],8),e_(n,Y.brick),Q(n,Y.gravel,[112,106,100],30),Q(n,Y.bedrock,[42,42,46],24),Q(n,Y.woolWhite,[232,232,230],6),Q(n,Y.woolBlack,[38,38,42],6),Q(n,Y.woolRed,[196,52,46],8),Q(n,Y.woolOrange,[226,132,38],8),Q(n,Y.woolYellow,[232,206,58],8),Q(n,Y.woolGreen,[74,164,62],8),Q(n,Y.woolBlue,[58,94,194],8),Q(n,Y.woolPurple,[142,72,182],8),Q(n,Y.sandstone,[214,198,146],8),Zg(n,Y.sandstone),Q(n,Y.stoneBricks,[128,128,128],10),Qg(n,Y.stoneBricks),Q(n,Y.snow,[240,244,248],5),Q(n,Y.obsidian,[30,24,42],8),$g(n,Y.obsidian),Q(n,Y.woolPink,[226,140,170],8),Q(n,Y.woolCyan,[70,178,190],8),Q(n,Y.woolGray,[130,130,134],6),Q(n,Y.woolBrown,[110,80,54],8),t_(n,Y.glass),d_(n,Y.leaves),i_(n,Y.cerca),a_(n,Y.portaBaixo,!1),a_(n,Y.portaCima,!0),o_(n,Y.tocha),s_(n,Y.janela),c_(n,Y.estofado),l_(n,Y.colchao),u_(n,Y.quadro),h_(n,Y.florVermelha,[214,58,54]),h_(n,Y.florAmarela,[242,206,62]),h_(n,Y.florAzul,[86,122,220]),h_(n,Y.florBranca,[238,240,246]),f_(n,Y.minerioCarvao,[40,40,44],`C`),f_(n,Y.minerioFerro,[216,162,122],`Fe`),f_(n,Y.minerioOuro,[244,208,64],`Au`),f_(n,Y.minerioDiamante,[108,226,222],`D`),Q(n,Y.gramaSecaTop,[178,162,66],14),Q(n,Y.gramaSecaSide,[121,88,58],12),Q(n,Y.gramaSecaSide,[178,162,66],14,0,4),Q(n,Y.gramaFriaTop,[96,138,116],12),Q(n,Y.gramaFriaSide,[121,88,58],12),Q(n,Y.gramaFriaSide,[96,138,116],12,0,4),Q(n,Y.logIpe,[128,110,86],10),Jg(n,Y.logIpe),Q(n,Y.logAraucaria,[86,60,42],10),Jg(n,Y.logAraucaria),Q(n,Y.logPauBrasil,[124,66,46],10),Jg(n,Y.logPauBrasil),d_(n,Y.folhasIpe,[222,186,48]),d_(n,Y.folhasAraucaria,[34,88,46]),d_(n,Y.folhasPauBrasil,[42,130,54]),p_(n,Y.mandacaruSide),m_(n,Y.mandacaruTop),A_(n,0,T_,0),g_(n,Y.gramaAlta,[92,158,60]),g_(n,Y.gramaAltaSeca,[178,162,66]),g_(n,Y.gramaAltaFria,[96,138,116]);for(let e=0;e<4;e++)__(n,Y.plantacao0+e,e);x_(n,Y.fornalhaTopo),y_(n,Y.fornalhaLado,!1),y_(n,Y.fornalhaLadoAcesa,!0),b_(n,Y.fornalhaCostas),S_(n,Y.bauTopo,!0),S_(n,Y.bauLado,!1);for(let e=0;e<4;e++)C_(n,Y.algodao0+e,e);C_(n,Y.algodaoSelvagem,3,!0);let i=[[Y.cenoura0,Y.cenouraSelvagem,101,{folha:[82,148,70],fruta:[238,138,40],frutaNoTopo:!1,largura:2}],[Y.batata0,Y.batataSelvagem,107,{folha:[86,140,76],fruta:[196,162,96],frutaNoTopo:!1,largura:2}],[Y.beterraba0,Y.beterrabaSelvagem,113,{folha:[104,64,108],fruta:[170,42,66],frutaNoTopo:!1,largura:2}],[Y.melancia0,Y.melanciaSelvagem,127,{folha:[72,150,66],fruta:[40,120,56],frutaNoTopo:!0,largura:3}],[Y.banana0,Y.bananaSelvagem,131,{folha:[70,140,84],fruta:[240,206,60],frutaNoTopo:!0,largura:2}],[Y.aipim0,Y.aipimSelvagem,137,{folha:[84,152,78],fruta:[178,138,88],frutaNoTopo:!1,largura:1}]];for(let[e,t,r,a]of i){for(let t=0;t<4;t++)w_(n,e+t,t,a,r);w_(n,t,3,a,r,!0)}let a=[{folha:[52,118,44],casca:[104,78,48]},{folha:[222,186,48],casca:[128,110,86]},{folha:[34,88,46],casca:[86,60,42]},{folha:[42,130,54],casca:[124,66,46]}];for(let e=0;e<a.length;e++)for(let t=0;t<4;t++)v_(n,Y.mudaComum0+e*4+t,t,a[e]);let o=[[232,232,230],[38,38,42],[196,52,46],[226,132,38],[232,206,58],[74,164,62],[58,94,194],[142,72,182],[226,140,170],[70,178,190],[130,130,134],[110,80,54]];for(let e=0;e<o.length;e++)n_(n,Y.vidroBranco+e,o[e]);for(let e=0;e<np.letters.length;e++)r_(n,np.base+e,np.letters[e],[236,228,206]);for(let e=0;e<np.digits.length;e++)r_(n,np.base+np.letters.length+e,np.digits[e],[206,222,240]);let s=new Pi(t);return s.magFilter=r,s.minFilter=r,s.generateMipmaps=!1,s.colorSpace=ze,s}function N_(){return{nivelCeu:{value:1},luzMin:{value:.05}}}function P_(e,t){let n=e.onBeforeCompile;e.onBeforeCompile=(r,i)=>{n?.call(e,r,i),r.uniforms.nivelCeu=t.nivelCeu,r.uniforms.luzMin=t.luzMin,r.vertexShader=r.vertexShader.replace(`#include <common>`,`#include <common>
attribute float luz;
varying float vBrilho;
uniform float nivelCeu;
uniform float luzMin;`).replace(`#include <begin_vertex>`,`#include <begin_vertex>
{
  // byte cru 0..255 (atributo NÃO normalizado): céu no nibble alto, bloco no baixo
  float nCeu = floor(luz / 16.0);
  float nBloco = luz - nCeu * 16.0;
  float efetivo = max(nCeu * nivelCeu, nBloco);
  // curva geométrica (0,86 por nível), não linear: é ela que faz os 3 ou 4
  // últimos blocos antes do breu caírem depressa e a boca da caverna ler como
  // boca de caverna. Linear dava um cinza chapado sem profundidade.
  vBrilho = mix(luzMin, 1.0, pow(0.86, 15.0 - efetivo));
}`),r.fragmentShader=r.fragmentShader.replace(`#include <common>`,`#include <common>
varying float vBrilho;`).replace(`#include <color_fragment>`,`#include <color_fragment>
diffuseColor.rgb *= vBrilho;`)},e.needsUpdate=!0}var F_=class{atlas;opaco;agua;vidro;balanco=Wg();luz=N_();aguaQuadroParada=-1;aguaFluxoRelogio=0;aguaQuadroFluxo=-1;aguaUltimaPintura=-1;constructor(){this.atlas=M_(),this.opaco=new na({map:this.atlas,alphaTest:.5}),this.agua=new na({map:this.atlas,transparent:!0,opacity:.72,depthWrite:!1}),this.vidro=new na({map:this.atlas,transparent:!0,opacity:.4,depthWrite:!1}),Ug(this.opaco,this.balanco),P_(this.opaco,this.luz),P_(this.agua,this.luz),P_(this.vidro,this.luz)}get paraChunks(){return[this.opaco,this.agua,this.vidro]}get canvas(){return this.atlas.image}atualizar(e,t,n,r){this.balanco.ventoTempo.value=t.fase*Math.PI*2,this.balanco.ventoDir.value.set(t.x,t.z),this.balanco.ventoForca.value=r?t.forca:0,this.luz.nivelCeu.value=n;let i=Math.floor(t.fase*16)%16;this.aguaFluxoRelogio+=e;let a=Math.floor(this.aguaFluxoRelogio*8)%16;(i!==this.aguaQuadroParada||a!==this.aguaQuadroFluxo)&&this.aguaFluxoRelogio-this.aguaUltimaPintura>=1/12&&(this.aguaUltimaPintura=this.aguaFluxoRelogio,this.aguaQuadroParada=i,this.aguaQuadroFluxo=a,j_(this.atlas,i,t.ondaAgua,a))}},I_=class{input;lerTeclas;controle=new lf;antX=0;antY=0;antZ=0;distancia=0;constructor(e,t){this.input=e,this.lerTeclas=t}ancorar(e){this.antX=e.x,this.antY=e.y,this.antZ=e.z}comando(e,t){let{input:n}=this,r=this.lerTeclas(),i=n.active,a=i&&n.down(r.forward),o=i?!!a-+!!n.down(r.back):0,s=i?!!n.down(r.right)-+!!n.down(r.left):0,c=i&&n.down(r.jump),l=i&&n.down(r.agachar),u=this.controle.correndo(a,e),d=o>0&&!l&&(u||i&&n.down(r.correr)),f=t.voando;return this.controle.alternarVoo(c,e)&&t.podeVoar&&(f=!f),{forward:o,strafe:s,jump:c,yaw:n.yaw,sprint:d,sneak:l,fly:f&&t.podeVoar,voando:f}}aposOPasso(e,t,n,r){this.controle.avancarOlho(e,{agachado:r.sneak,voando:r.fly,noChao:t.onGround,subiu:t.pos.y-n}),this.distancia+=Math.hypot(t.pos.x-this.antX,t.pos.y-this.antY,t.pos.z-this.antZ),this.ancorar(t.pos)}get alturaOlho(){return this.controle.alturaOlho}get distanciaTotal(){return this.distancia}},L_=class{bloqueado;cp14=null;jogadores=null;amigos=null;mochila=null;container=null;constructor(e){this.bloqueado=e}get algumAberto(){return(this.cp14?.open??!1)||(this.mochila?.open??!1)||(this.jogadores?.open??!1)||(this.amigos?.open??!1)||(this.container?.open??!1)}get podeAbrir(){return!this.algumAberto&&!this.bloqueado()}alternar(e){this.podeAlternar(e)&&e?.toggle()}podeAlternar(e){return(e?.open??!1)||this.podeAbrir}trocarParaJogadores(){this.cp14?.hide(),this.mochila?.hide(),this.amigos?.hide(),this.jogadores?.show()}trocarParaAmigos(){return this.amigos?(this.cp14?.hide(),this.mochila?.hide(),this.jogadores?.hide(),this.amigos.toggle(),!0):!1}aoAbrirContainer(){this.cp14?.hide(),this.jogadores?.hide(),this.amigos?.hide(),this.mochila?.hide()}},R_=class{loading;fontes;total=0;constructor(e,t){this.loading=e,this.fontes=t}recalcular(e,t,n,r,i){if(!i){this.total=0;return}let{cx:a,cz:o}=Fd(e,t,n);this.total=Math.max(1,Bd(e,a,o,r))}indeterminar(){this.total=0}observar(){this.loading.observar(()=>{let e=this.fontes();return{bytes:e.bytes,prontas:e.prontas,total:this.total,faltando:e.buracos>0?e.buracos:Math.max(0,this.total-e.prontas),fila:e.fila}})}get raioCompleto(){return this.fontes().prontas>=this.total}},z_=class{worker;stats={msgsIn:0,msgsOut:0,bytesIn:0,bytesOut:0};cb=null;savePending=null;constructor(e){this.worker=e,e.onmessage=e=>{let t=e.data;if(typeof t==`string`)this.stats.msgsIn++,this.stats.bytesIn+=t.length,this.cb?.(t);else if(t instanceof ArrayBuffer)this.stats.msgsIn++,this.stats.bytesIn+=t.byteLength,this.cb?.(t);else if(typeof t==`object`&&t){let e=t;e.hostType===`save`&&e.data instanceof ArrayBuffer&&(this.savePending?.(e.data),this.savePending=null)}}}init(e){this.worker.postMessage({hostType:`init`,save:e.save,seed:e.seed,preset:e.preset,tamanho:e.tamanho,sobrevivencia:e.sobrevivencia})}requestSave(){return new Promise(e=>{this.savePending=e,this.worker.postMessage({hostType:`save_request`})})}send(e){this.stats.msgsOut++,this.stats.bytesOut+=e.length,this.worker.postMessage(e)}onMessage(e){this.cb=e}},B_=class{aoFalhar;stats={msgsIn:0,msgsOut:0,bytesIn:0,bytesOut:0};cb=null;socket;queue=[];avisouFalha=!1;constructor(e,t){this.aoFalhar=t,this.socket=new WebSocket(e),this.socket.binaryType=`arraybuffer`,this.socket.onopen=()=>{for(let e of this.queue)this.socket.send(e);this.queue=[]},this.socket.onmessage=e=>{let t=e.data;typeof t==`string`?(this.stats.msgsIn++,this.stats.bytesIn+=t.length,this.cb?.(t)):t instanceof ArrayBuffer&&(this.stats.msgsIn++,this.stats.bytesIn+=t.byteLength,this.cb?.(t))},this.socket.onclose=()=>{console.warn(`[conn] conexão com ${e} fechou`),this.falhou(`a conexão com o servidor caiu`)},this.socket.onerror=()=>{this.falhou(`não deu pra falar com o servidor`)}}falhou(e){this.avisouFalha||(this.avisouFalha=!0,this.aoFalhar?.(e))}send(e){this.stats.msgsOut++,this.stats.bytesOut+=e.length,this.socket.readyState===WebSocket.OPEN?this.socket.send(e):this.socket.readyState===WebSocket.CONNECTING&&this.queue.push(e)}onMessage(e){this.cb=e}},V_=120,H_=250,U_=1e4,W_=[8,16,33,50,100],G_=60,K_=240;function q_(e){let t=Array(W_.length+1).fill(0);for(let n of e){let e=W_.findIndex(e=>n<=e);e<0&&(e=W_.length),t[e]++}let n=e.length||1;return t.map((e,t)=>({faixa:t<W_.length?`≤${W_[t]}ms`:`>${W_[W_.length-1]}ms`,frames:e,pct:+(e/n*100).toFixed(1)}))}var J_=()=>({frames:0,tempoMs:0,renderMs:0,longTasks:0,longTasksMs:0}),Y_=class{renderer;meta;net={msgsPerSec:0,bytesPerSec:0,tickAvgMs:0,tickMaxMs:0,jitterMs:0};fase=`carregando`;contexto=null;stream={colunas:0,fila:0,faltando:0,repedidas:0,ultimoLote:0};luz={colunas:0,totalMs:0,fila:0};regras=null;carga=null;extra=null;frameTimes=[];remesh={count:0,totalMs:0,lastMs:0};lastRefresh=0;recording=null;gpuCache;sessionStartMs=performance.now();longTasks=0;longTasksMs=0;porFase={carregando:J_(),jogando:J_()};pioresTravadas=[];marcadores=[];gpuExt;gpuQueries=[];gpuAtiva=null;gpuSamples=[];contextLost=0;batteryMgr=null;el;textEl;constructor(e,t){this.renderer=e,this.meta=t;let n=document.getElementById(`hud`),r=document.getElementById(`hud-text`),i=document.getElementById(`hud-export`);if(!n||!r||!i)throw Error(`elementos do HUD ausentes no index.html`);this.el=n,this.textEl=r,i.addEventListener(`click`,()=>this.record(e=>this.baixar(e)));try{new PerformanceObserver(e=>{for(let t of e.getEntries()){this.longTasks++,this.longTasksMs+=t.duration;let e=this.porFase[this.fase];e.longTasks++,e.longTasksMs+=t.duration,this.pioresTravadas.push({ms:+t.duration.toFixed(1),fase:this.fase,emS:+((performance.now()-this.sessionStartMs)/1e3).toFixed(1)}),this.pioresTravadas.sort((e,t)=>t.ms-e.ms),this.pioresTravadas.length=Math.min(this.pioresTravadas.length,5)}}).observe({entryTypes:[`longtask`]})}catch{}e.domElement.addEventListener(`webglcontextlost`,()=>{this.contextLost++}),navigator.getBattery?.().then(e=>{this.batteryMgr=e}).catch(()=>{})}get visible(){return!this.el.classList.contains(`hidden`)}toggle(){this.el.classList.toggle(`hidden`)}setFase(e){this.fase=e}setRemesh(e){this.remesh={...e}}marcar(e,t){this.marcadores.length>=G_||this.marcadores.push({emS:+((performance.now()-this.sessionStartMs)/1e3).toFixed(1),fase:this.fase,evento:e,...t?{detalhe:t}:{}})}gpuInicio(){if(!(!this.recording&&!this.visible))try{let e=this.renderer.getContext();if(!(e instanceof WebGL2RenderingContext))return;if(this.gpuExt===void 0){let t=e.getExtension(`EXT_disjoint_timer_query_webgl2`);this.gpuExt=t??null}if(!this.gpuExt||this.gpuAtiva||this.gpuQueries.length>=4)return;let t=e.createQuery();if(!t)return;e.beginQuery(this.gpuExt.TIME_ELAPSED_EXT,t),this.gpuAtiva=t}catch{this.desligarGpu()}}gpuFim(){if(!(!this.gpuAtiva||!this.gpuExt))try{this.renderer.getContext().endQuery(this.gpuExt.TIME_ELAPSED_EXT),this.gpuQueries.push(this.gpuAtiva),this.gpuAtiva=null}catch{this.desligarGpu()}}desligarGpu(){this.gpuExt=null,this.gpuQueries.length=0,this.gpuAtiva=null}gpuColher(){if(!(!this.gpuExt||this.gpuQueries.length===0))try{let e=this.renderer.getContext();if(e.getParameter(this.gpuExt.GPU_DISJOINT_EXT)){for(let t of this.gpuQueries)e.deleteQuery(t);this.gpuQueries.length=0;return}let t=[];for(let n of this.gpuQueries){if(!e.getQueryParameter(n,e.QUERY_RESULT_AVAILABLE)){t.push(n);continue}let r=e.getQueryParameter(n,e.QUERY_RESULT);e.deleteQuery(n);let i=r/1e6;this.gpuSamples.push(i),this.gpuSamples.length>K_&&this.gpuSamples.shift(),this.recording?.gpuSamples.push(i)}this.gpuQueries=t}catch{this.desligarGpu()}}gpuStats(e){if(this.gpuExt===null||e.length===0)return null;let t=[...e].sort((e,t)=>e-t);return{medioMs:+(e.reduce((e,t)=>e+t,0)/e.length).toFixed(2),p95Ms:+(t[Math.min(t.length-1,Math.floor(t.length*.95))]??0).toFixed(2),amostras:e.length}}frame(e,t=0){this.frameTimes.push(e),this.frameTimes.length>V_&&this.frameTimes.shift();let n=this.porFase[this.fase];n.frames++,n.tempoMs+=e,n.renderMs+=t;let r=performance.now();if(this.gpuColher(),this.recording){this.recording.frames.push(e);let t=this.memoryUsedMB();if(t!==null&&this.recording.memSamples.push(t),r>=this.recording.endAt){let e=this.recording;this.recording=null,e.onDone(this.buildRecordingReport(e))}}this.visible&&r-this.lastRefresh>=H_&&(this.lastRefresh=r,this.refresh())}record(e,t=U_){this.recording||(this.recording={frames:[],memSamples:[],gpuSamples:[],endAt:performance.now()+t,onDone:e,longTasksStart:this.longTasks,longTasksMsStart:this.longTasksMs,contextoStart:this.contexto?.()??null,marcadoresStart:this.marcadores.length},this.visible||this.toggle(),this.refresh())}frameStats(){let e=this.frameTimes;if(e.length===0)return{fps:0,avgMs:0,p95Ms:0};let t=e.reduce((e,t)=>e+t,0)/e.length,n=[...e].sort((e,t)=>e-t),r=n[Math.min(n.length-1,Math.floor(n.length*.95))]??0;return{fps:1e3/t,avgMs:t,p95Ms:r}}memoriaJs(){let e=performance.memory;return e?{usadaMB:Math.round(e.usedJSHeapSize/1048576),limiteMB:Math.round(e.jsHeapSizeLimit/1048576)}:null}memoryUsedMB(){return this.memoriaJs()?.usadaMB??null}gpu(){if(this.gpuCache!==void 0)return this.gpuCache;try{let e=this.renderer.getContext(),t=e.getExtension(`WEBGL_debug_renderer_info`);this.gpuCache=t?String(e.getParameter(t.UNMASKED_RENDERER_WEBGL)):null}catch{this.gpuCache=null}return this.gpuCache}dispositivo(){let e=navigator;return{nucleos:e.hardwareConcurrency??null,ramGB:e.deviceMemory??null,dpr:window.devicePixelRatio,tela:`${window.screen.width}×${window.screen.height}`,gpu:this.gpu(),bateria:this.batteryMgr?{nivelPct:Math.round(this.batteryMgr.level*100),carregando:this.batteryMgr.charging}:null}}conexao(){let e=navigator.connection;return e?{tipo:e.effectiveType??null,downlinkMbps:e.downlink??null,rttMs:e.rtt??null}:null}setMeta(e){this.meta={...this.meta,...e}}stats(){let{fps:e,avgMs:t,p95Ms:n}=this.frameStats(),r=this.renderer.info;return{versao:Mm,timestamp:new Date().toISOString(),userAgent:navigator.userAgent,meta:this.meta,...this.contexto?(()=>{let e=this.contexto();return{jogador:{x:+e.x.toFixed(1),y:+e.y.toFixed(1),z:+e.z.toFixed(1),yaw:+e.yaw.toFixed(2),pitch:+e.pitch.toFixed(2),voando:e.voando,noChao:e.noChao,chunk:{cx:Math.floor(e.x/16),cz:Math.floor(e.z/16)}},config:{raioRender:e.raioRender,meshMsPorFrame:e.meshMsPorFrame,pixelRatioCap:e.pixelRatioCap,fov:e.fov,nuvens:e.nuvens,balanco:e.balanco}}})():{},fps:Math.round(e),frametimeAvgMs:+t.toFixed(2),frametimeP95Ms:+n.toFixed(2),drawCalls:r.render.calls,triangles:r.render.triangles,points:r.render.points,lines:r.render.lines,remeshCount:this.remesh.count,remeshPorCaminho:this.remesh.porCaminho??null,remeshTotalMs:+this.remesh.totalMs.toFixed(1),remeshWorkerMs:+(this.remesh.workerMs??0).toFixed(1),mesher:this.remesh.config??null,remeshLastMs:+this.remesh.lastMs.toFixed(2),longTasksTotal:this.longTasks,fases:Object.keys(this.porFase).map(e=>{let t=this.porFase[e];return{fase:e,segundos:+(t.tempoMs/1e3).toFixed(1),frames:t.frames,fpsMedio:t.tempoMs>0?Math.round(t.frames/(t.tempoMs/1e3)):0,renderMsMedio:t.frames>0?+(t.renderMs/t.frames).toFixed(2):0,renderPct:t.tempoMs>0?Math.round(t.renderMs/t.tempoMs*100):0,longTasks:t.longTasks,longTasksMs:+t.longTasksMs.toFixed(1)}}),pioresTravadas:this.pioresTravadas,marcadores:this.marcadores,carga:this.carga?.()??null,gpu:this.gpuStats(this.gpuSamples),longTasksMsTotal:+this.longTasksMs.toFixed(1),contextLost:this.contextLost,sessaoS:Math.round((performance.now()-this.sessionStartMs)/1e3),memoriaJsMB:this.memoriaJs(),video:{geometrias:r.memory.geometries,texturas:r.memory.textures},stream:{...this.stream},luz:{...this.luz},regrasServidor:this.regras,rede:this.conexao(),dispositivo:this.dispositivo(),net:{...this.net}}}buildRecordingReport(e){let{frames:t,memSamples:n}=e,r=this.stats(),i=t.length;if(i===0)return{...r,gravacao:{duracaoS:0,frames:0}};let a=[...t].sort((e,t)=>e-t),o=t.reduce((e,t)=>e+t,0),s=e=>a[Math.min(i-1,Math.floor(i*e))]??0,c=o/1e3,l=e.contextoStart,u=this.contexto?.()??null,d=l&&u?(()=>{let e=u.distanciaTotal-l.distanciaTotal,t=c>0?e/c:0;return{estado:u.voando?`voando`:t>.5?`andando`:`parado`,distanciaBlocos:+e.toFixed(1),velocidadeBlocosS:+t.toFixed(2),colunasNovas:u.colunasRecebidas-l.colunasRecebidas,bytesRecebidos:u.bytesRecebidos-l.bytesRecebidos}})():null;return{...r,gravacao:{duracaoS:+c.toFixed(1),frames:i,movimento:d,fpsMedio:Math.round(i/(o/1e3)),frametimeMs:{min:+(a[0]??0).toFixed(2),med:+(o/i).toFixed(2),p50:+s(.5).toFixed(2),p95:+s(.95).toFixed(2),p99:+s(.99).toFixed(2),max:+(a[i-1]??0).toFixed(2)},framesLentos50ms:t.filter(e=>e>50).length,framesLentos100ms:t.filter(e=>e>100).length,histogramaMs:q_(t),gpu:this.gpuStats(e.gpuSamples),marcadores:this.marcadores.slice(e.marcadoresStart),longTasks:this.longTasks-e.longTasksStart,longTasksMs:+(this.longTasksMs-e.longTasksMsStart).toFixed(1),memoriaMB:n.length?{min:Math.min(...n),max:Math.max(...n),med:Math.round(n.reduce((e,t)=>e+t,0)/n.length)}:null}}}refresh(){let e=this.stats(),t=e.memoriaJsMB,n=[`FPS ${e.fps}  frame ${e.frametimeAvgMs}ms méd / ${e.frametimeP95Ms}ms p95`,`draw calls ${e.drawCalls}  triângulos ${e.triangles}  long tasks ${e.longTasksTotal}×`,`remesh ${e.remeshCount}× / ${e.remeshTotalMs}ms main / ${e.remeshWorkerMs??0}ms worker / ${e.remeshLastMs}ms último`,`stream ${e.stream.colunas} colunas · fila ${e.stream.fila} · faltando ${e.stream.faltando} · repedidas ${e.stream.repedidas}`,`malha ${e.stream.ultimoLote} chunks no último frame (orçamento ${e.config?.meshMsPorFrame??`?`} ms)`,`luz ${e.luz.colunas} colunas · ${Math.round(e.luz.totalMs)}ms main · ${e.luz.colunas?(e.luz.totalMs/e.luz.colunas).toFixed(2):`0`}ms/coluna · fila ${e.luz.fila}`,e.remeshPorCaminho?`remesh por caminho: fila ${e.remeshPorCaminho.fila.n}× (${Math.round(e.remeshPorCaminho.fila.ms)}ms) · bloco ${e.remeshPorCaminho.bloco.n}× (${Math.round(e.remeshPorCaminho.bloco.ms)}ms) · área ${e.remeshPorCaminho.area.n}× (${Math.round(e.remeshPorCaminho.area.ms)}ms)`:`remesh por caminho: n/d`,`fase ${this.fase} · ${e.fases.map(e=>`${e.fase} ${e.segundos}s ${e.fpsMedio}fps render ${e.renderPct}% travadas ${e.longTasks}×/${Math.round(e.longTasksMs)}ms`).join(` · `)}`,e.gpu?`GPU ${e.gpu.medioMs}ms méd / ${e.gpu.p95Ms}ms p95 (${e.gpu.amostras} amostras)`:`GPU: n/d (sem EXT_disjoint_timer_query_webgl2)`,e.regrasServidor?`regras (servidor) ${e.regrasServidor.celulasPorTick} cél/tick (máx ${e.regrasServidor.celulasMaxTick}) · ${e.regrasServidor.mudancasPorTick} mudanças · água ${e.regrasServidor.aguaPorTick}`:`regras (servidor): n/d`,t?`RAM (JS) ${t.usadaMB}/${t.limiteMB} MB`:`RAM (JS): n/d (só no Chrome)`,`vídeo ${e.video.geometrias} geometrias · ${e.video.texturas} texturas`,`rede ${e.net.msgsPerSec} msg/s  ${e.net.bytesPerSec} B/s  jitter ${e.net.jitterMs}ms  tick ${e.net.tickAvgMs}/${e.net.tickMaxMs}ms`];if(this.extra&&n.push(this.extra()),this.recording){let e=Math.max(0,Math.ceil((this.recording.endAt-performance.now())/1e3));n.push(`⏺ GRAVANDO perfil de 10 s… faltam ${e}s`)}this.textEl.textContent=n.join(`
`)}baixar(e,t=`perf`){let n=new Blob([JSON.stringify(e,null,2)],{type:`application/json`}),r=document.createElement(`a`);r.href=URL.createObjectURL(n),r.download=`perf-${t===`perf`?``:`${t}-`}${new Date().toISOString().replace(/[:.]/g,`-`)}.json`,r.click(),URL.revokeObjectURL(r.href)}},X_=class e{canvas;yaw=0;pitch=0;sensitivity=1;touch=!1;touchDevice=!1;keys=new Set;keyHandlers=new Map;mouseHandlers=new Map;wheelHandler=null;static SENSITIVITY=.0025;static TOUCH_LOOK=.004;static PITCH_LIMIT=Math.PI/2-.01;static MAX_DELTA=200;mouseStats={maxDelta:0,dropped:0,lastDropped:0};constructor(t){this.canvas=t,window.addEventListener(`keydown`,e=>{if(e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement)return;let t=this.keyHandlers.get(e.code);if(t){e.preventDefault(),t();return}this.keys.add(e.code)}),window.addEventListener(`keyup`,e=>this.keys.delete(e.code)),window.addEventListener(`blur`,()=>this.keys.clear()),document.addEventListener(`contextmenu`,e=>{let t=e.target;t instanceof HTMLInputElement||t instanceof HTMLTextAreaElement||e.preventDefault()}),t.addEventListener(`mousedown`,e=>{this.locked&&(e.button===1&&e.preventDefault(),this.mouseHandlers.get(e.button)?.())}),t.addEventListener(`wheel`,e=>{this.locked&&(e.preventDefault(),this.wheelHandler?.(e.deltaY>0?1:-1))},{passive:!1}),t.addEventListener(`click`,()=>this.lock()),document.addEventListener(`pointerlockerror`,()=>{this.reagendarLock(),this.pedindo=this.reagendado!==null}),document.addEventListener(`pointerlockchange`,()=>{this.locked&&(this.pedindo=!1,this.retryGasto=!1,this.reagendado!==null&&(clearTimeout(this.reagendado),this.reagendado=null))}),document.addEventListener(`mousemove`,t=>{if(!this.locked)return;let n=Math.max(Math.abs(t.movementX),Math.abs(t.movementY));if(n>this.mouseStats.maxDelta&&(this.mouseStats.maxDelta=n),n>e.MAX_DELTA){this.mouseStats.dropped++,this.mouseStats.lastDropped=n,console.warn(`[input] spike de mouse descartado: ${t.movementX},${t.movementY}`);return}this.yaw-=t.movementX*e.SENSITIVITY*this.sensitivity,this.pitch-=t.movementY*e.SENSITIVITY*this.sensitivity;let r=e.PITCH_LIMIT;this.pitch>r&&(this.pitch=r),this.pitch<-r&&(this.pitch=-r)})}get locked(){return document.pointerLockElement===this.canvas}get active(){return this.locked||this.touch}lock(){this.touchDevice||this.touch||this.locked||(this.retryGasto=!1,this.pedirLock())}get retomando(){return this.pedindo}static CARENCIA_ESC_MS=1400;reagendado=null;retryGasto=!1;pedindo=!1;podeTravar=()=>!0;pedirLock(){if(!this.podeTravar()){this.pedindo=!1;return}this.pedindo=!0,this.canvas.requestPointerLock({unadjustedMovement:!0})?.catch(()=>{try{this.canvas.requestPointerLock()?.catch(()=>{})}catch{}})}reagendarLock(){this.reagendado!==null||this.retryGasto||this.locked||this.touchDevice||this.touch||(this.retryGasto=!0,this.reagendado=setTimeout(()=>{this.reagendado=null,!this.locked&&!this.touchDevice&&!this.touch&&this.pedirLock()},e.CARENCIA_ESC_MS))}down(e){return this.keys.has(e)}setKey(e,t){t?this.keys.add(e):this.keys.delete(e)}applyLook(t,n){this.yaw-=t*e.TOUCH_LOOK*this.sensitivity,this.pitch-=n*e.TOUCH_LOOK*this.sensitivity;let r=e.PITCH_LIMIT;this.pitch>r&&(this.pitch=r),this.pitch<-r&&(this.pitch=-r)}press(e){this.mouseHandlers.get(e)?.()}onKey(e,t){this.keyHandlers.set(e,t)}rebind(e,t){if(e===t)return;let n=this.keyHandlers.get(e);n&&(this.keyHandlers.delete(e),this.keyHandlers.set(t,n))}onMouseButton(e,t){this.mouseHandlers.set(e,t)}onWheel(e){this.wheelHandler=e}},Z_=2e4,Q_=54,$_=2*Math.PI*Q_,ev=`
#load-tela {
  position: fixed; inset: 0; z-index: 35;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(180deg, #24344d 0%, #101826 100%);
  color: #fff; font-family: system-ui, sans-serif;
}
#load-caixa {
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  width: min(420px, 92vw); padding: 24px 28px;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 10px;
}
#load-caixa h1 { margin: 0; font-size: 1.4rem; font-weight: 600; }
#load-fase { color: #9fe8bc; font-size: 0.95rem; min-height: 1.2em; }
#load-anel { position: relative; width: 132px; height: 132px; }
/* -90° = o arco começa no topo, como todo mundo espera */
#load-anel svg { transform: rotate(-90deg); }
#load-arco { transition: stroke-dashoffset 0.25s linear; }
/* sem total conhecido (esperando o snapshot denso, que vem num blob só) não há
   fração a mostrar: o anel VIRA indeterminado em vez de mentir 0% parado */
#load-anel.indef svg { animation: load-anel 1.4s linear infinite; }
#load-anel.indef #load-arco { transition: none; }
@keyframes load-anel { from { transform: rotate(-90deg); } to { transform: rotate(270deg); } }
#load-pct {
  position: absolute; inset: 0; display: flex;
  align-items: center; justify-content: center;
  font-size: 1.7rem; font-variant-numeric: tabular-nums;
}
#load-linhas {
  width: 100%; margin: 0; display: grid;
  grid-template-columns: auto 1fr; gap: 2px 12px; font-size: 0.8rem;
}
#load-linhas dt { color: rgba(255, 255, 255, 0.6); }
#load-linhas dd { margin: 0; text-align: right; font-variant-numeric: tabular-nums; }
#load-forcar {
  margin-top: 4px; padding: 7px 14px; border: 0; border-radius: 8px;
  background: #ffd75e; color: #182338; font: inherit; font-size: 0.85rem; cursor: pointer;
}
/* decorativo: gira SEMPRE, independente de progresso (sinal de vida) */
#load-giro {
  position: fixed; right: 20px; bottom: 20px;
  width: 26px; height: 26px; border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.18); border-top-color: #ffd75e;
  animation: load-giro 0.9s linear infinite;
}
@keyframes load-giro { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { #load-giro { animation-duration: 3.5s; } }
`;function tv(e){return!Number.isFinite(e)||e<=0?`—`:e>=1e6?`${(e/1e6).toFixed(1)} Mbps`:e>=1e3?`${(e/1e3).toFixed(0)} kbps`:`${e.toFixed(0)} bps`}function nv(e){return e>=1e6?`${(e/1e6).toFixed(1)} MB`:e>=1e3?`${(e/1e3).toFixed(0)} kB`:`${e} B`}function rv(e){return`${(e/1e3).toFixed(1)} s`}var iv=class{aoFechar;raiz=null;estilo=null;timer=0;fimTimer=0;t0=0;fase=`conectando`;rede=!0;alvo;ler=null;amostraT=0;amostraBytes=0;amostraProntas=0;bps=0;colsPorSeg=0;primeiraAmostra=!0;pctMax=0;acaoBotao=()=>this.fechar();tempos={};faseMedida=`conectando`;faseT0=0;titulo=`carregando o mundo`;concluiu=!1;cargas=[];els=null;constructor(e){this.aoFechar=e}get ativo(){return this.raiz!==null}abrir(e){if(this.raiz)return;this.rede=e.rede,this.alvo=e.alvo,this.fase=`conectando`,this.pctMax=0,this.bps=0,this.colsPorSeg=0,this.t0=this.amostraT=this.faseT0=performance.now(),this.amostraBytes=0,this.amostraProntas=0,this.tempos={},this.faseMedida=`conectando`,this.concluiu=!1,this.titulo=e.titulo??`carregando o mundo`,this.primeiraAmostra=!0,this.estilo=document.createElement(`style`),this.estilo.textContent=ev,document.head.appendChild(this.estilo),this.raiz=document.createElement(`div`),this.raiz.id=`load-tela`,this.raiz.innerHTML=`
      <div id="load-caixa">
        <h1></h1>
        <div id="load-anel">
          <svg width="132" height="132" viewBox="0 0 132 132" aria-hidden="true">
            <circle cx="66" cy="66" r="${Q_}" fill="none"
              stroke="rgba(255,255,255,0.12)" stroke-width="9" />
            <circle id="load-arco" cx="66" cy="66" r="${Q_}" fill="none"
              stroke="#ffd75e" stroke-width="9" stroke-linecap="round"
              stroke-dasharray="${$_.toFixed(1)}" stroke-dashoffset="${$_.toFixed(1)}" />
          </svg>
          <div id="load-pct">0%</div>
        </div>
        <div id="load-fase"></div>
        <dl id="load-linhas"></dl>
        <button id="load-forcar" type="button" class="hidden">entrar mesmo assim</button>
      </div>
      <div id="load-giro"></div>`,document.body.appendChild(this.raiz),this.raiz.querySelector(`h1`).textContent=e.titulo??`carregando o mundo`;let t=this.raiz.querySelector(`#load-linhas`),n={},r=[[`colunas`,`colunas prontas`],[`transf`,`em transferência`],[`fila`,`chunks na fila de malha`],[`taxa`,e.rede?`taxa de rede`:`taxa do worker`],[`recebido`,`recebido`],[`tempo`,`tempo`],[`host`,`hospedeiro`]];for(let[e,i]of r){let r=document.createElement(`dt`);r.textContent=i;let a=document.createElement(`dd`);a.textContent=`—`,t.append(r,a),n[e]=a}n.host.textContent=e.host;let i=this.raiz.querySelector(`#load-forcar`);this.acaoBotao=()=>this.fechar(),i.addEventListener(`click`,()=>this.acaoBotao()),this.els={fase:this.raiz.querySelector(`#load-fase`),anel:this.raiz.querySelector(`#load-anel`),arco:this.raiz.querySelector(`#load-arco`),pct:this.raiz.querySelector(`#load-pct`),valores:n,forcar:i},this.pintar(),this.timer=window.setInterval(()=>this.pintar(),250)}observar(e){this.ler=e}setFase(e){!this.raiz||this.fase===e||(this.fase=e,this.pintar())}medir(e,t){this.tempos[this.faseMedida]=(this.tempos[this.faseMedida]??0)+(t-this.faseT0),this.faseT0=t,this.faseMedida=e}relatorio(){return this.cargas}concluir(){!this.raiz||this.fimTimer||(this.concluiu=!0,this.setFase(`pronto`),this.fimTimer=window.setTimeout(()=>this.fechar(),400))}erro(e,t){let n=this.els;n&&(this.pintar(),clearInterval(this.timer),clearTimeout(this.fimTimer),this.timer=this.fimTimer=0,n.fase.textContent=e,n.fase.style.color=`#ff9c9c`,n.anel.classList.remove(`indef`),this.raiz?.querySelector(`#load-giro`)?.classList.add(`hidden`),n.forcar.textContent=`voltar ao menu`,n.forcar.classList.remove(`hidden`),this.acaoBotao=t)}fechar(){if(!this.raiz)return;let e=performance.now();this.medir(this.faseMedida,e);let t=this.ler?.()??null;this.cargas.push({titulo:this.titulo,totalMs:+(e-this.t0).toFixed(0),fasesMs:Object.fromEntries(Object.entries(this.tempos).filter(([,e])=>e>=1).map(([e,t])=>[e,+t.toFixed(0)])),colunas:t?.prontas??0,bytes:t?.bytes??0,concluida:this.concluiu}),clearInterval(this.timer),clearTimeout(this.fimTimer),this.timer=this.fimTimer=0,this.raiz.remove(),this.estilo?.remove(),this.raiz=null,this.estilo=null,this.els=null,this.ler=null,this.aoFechar()}faseEfetiva(e){return this.fase===`mundo`&&e&&e.total>0&&e.prontas>=e.total?`malha`:this.fase}rotuloFase(e){return e===`preparando`?this.alvo?`o servidor está preparando "${this.alvo}"…`:`preparando a aula nova…`:e===`conectando`?this.rede?`conectando ao servidor…`:`abrindo o mundo…`:e===`mundo`?this.rede?`recebendo o mundo…`:`gerando o mundo…`:e===`malha`?`montando a malha…`:`pronto!`}pintar(){let e=this.els;if(!e)return;let t=performance.now(),n=this.ler?.()??null;if(n&&(this.primeiraAmostra||t-this.amostraT>=1e3)){if(!this.primeiraAmostra){let e=(t-this.amostraT)/1e3;this.bps=(n.bytes-this.amostraBytes)*8/e;let r=Math.max(0,(n.prontas-this.amostraProntas)/e);this.colsPorSeg=this.colsPorSeg===0?r:this.colsPorSeg*.6+r*.4}this.primeiraAmostra=!1,this.amostraT=t,this.amostraBytes=n.bytes,this.amostraProntas=n.prontas}let r=this.pctMax;this.fase===`pronto`?r=1:n&&n.total>0&&(r=Math.min(1,Math.max(0,n.prontas/n.total))),this.pctMax=r=Math.max(this.pctMax,r);let i=this.fase!==`pronto`&&(!n||n.total===0);e.anel.classList.toggle(`indef`,i),i?(e.arco.setAttribute(`stroke-dasharray`,`${($_*.25).toFixed(1)} ${$_.toFixed(1)}`),e.arco.setAttribute(`stroke-dashoffset`,`0`),e.pct.textContent=`…`):(e.arco.setAttribute(`stroke-dasharray`,$_.toFixed(1)),e.arco.setAttribute(`stroke-dashoffset`,($_*(1-r)).toFixed(1)),e.pct.textContent=`${Math.round(r*100)}%`);let a=this.faseEfetiva(n);a!==this.faseMedida&&this.medir(a,t),e.fase.textContent=this.rotuloFase(a);let o=t-this.t0,s=rv(o);if(n&&n.total>0&&this.colsPorSeg>.5&&r<1){let e=(n.total-n.prontas)/this.colsPorSeg*1e3;Number.isFinite(e)&&e<6e5&&(s+=` · falta ~${rv(e)}`)}if(e.valores.tempo.textContent=s,e.valores.taxa.textContent=tv(this.bps),n){let t=n.total>0;e.valores.colunas.textContent=t?`${n.prontas} / ${n.total}`:`—`,e.valores.transf.textContent=t?`${n.faltando}`:`—`,e.valores.fila.textContent=t?`${n.fila}`:`—`,e.valores.recebido.textContent=nv(n.bytes)}e.forcar.classList.toggle(`hidden`,o<Z_||this.fase===`pronto`)}},av={sensitivity:1,fov:75,pixelRatioCap:2,volume:.8,raioRender:6,meshMsPorFrame:6,uiScale:1,nuvens:!0,balanco:!0,keys:{forward:`KeyW`,back:`KeyS`,left:`KeyA`,right:`KeyD`,jump:`Space`,correr:`ControlLeft`,agachar:`ShiftLeft`,chat:`Enter`,hud:`F3`,varinha:`KeyR`,painel:`KeyP`,inventario:`KeyE`,amigos:`KeyG`}},ov={forward:`andar pra frente`,back:`andar pra trás`,left:`andar pra esquerda`,right:`andar pra direita`,jump:`pular`,correr:`correr (segurar; ou 2× andar pra frente)`,agachar:`agachar (não cai da borda)`,chat:`abrir chat`,hud:`painel de desempenho`,varinha:`varinha de região (professor)`,painel:`painel (professor: autoria · aluno: grupo)`,inventario:`inventário de blocos`,amigos:`painel de amigos (áreas compartilhadas)`},sv=`lj-config`;function cv(e,t,n,r){return typeof e==`number`&&Number.isFinite(e)?Math.min(r,Math.max(n,e)):t}function lv(e,t){return typeof e==`boolean`?e:t}function uv(){let e=null;try{e=JSON.parse(localStorage.getItem(sv)??`null`)}catch{}let t=typeof e==`object`&&e?e:{},n=typeof t.keys==`object`&&t.keys!==null?t.keys:{},r={...av.keys};for(let e of Object.keys(r))typeof n[e]==`string`&&n[e]&&(r[e]=n[e]);return{sensitivity:cv(t.sensitivity,av.sensitivity,.2,3),fov:cv(t.fov,av.fov,60,100),pixelRatioCap:cv(t.pixelRatioCap,av.pixelRatioCap,1,2),volume:cv(t.volume,av.volume,0,1),raioRender:cv(t.raioRender,av.raioRender,2,12),meshMsPorFrame:cv(t.meshMsPorFrame,av.meshMsPorFrame,1,16),uiScale:cv(t.uiScale,av.uiScale,.6,1.8),nuvens:lv(t.nuvens,av.nuvens),balanco:lv(t.balanco,av.balanco),keys:r}}function dv(e){localStorage.setItem(sv,JSON.stringify(e))}function fv(e){return e.startsWith(`Key`)?e.slice(3):e.startsWith(`Digit`)?e.slice(5):{Space:`Espaço`,Enter:`Enter`,ShiftLeft:`Shift esq.`,ShiftRight:`Shift dir.`,ControlLeft:`Ctrl esq.`,ArrowUp:`↑`,ArrowDown:`↓`,ArrowLeft:`←`,ArrowRight:`→`}[e]??e}var pv=`logica-em-jogo`,mv=`worlds`;function hv(e){return new Promise((t,n)=>{e.onsuccess=()=>t(e.result),e.onerror=()=>n(e.error??Error(`IndexedDB falhou`))})}var gv=null;function _v(){return gv??=new Promise((e,t)=>{let n=indexedDB.open(pv,1);n.onupgradeneeded=()=>{n.result.createObjectStore(mv,{keyPath:`id`})},n.onsuccess=()=>e(n.result),n.onerror=()=>t(n.error??Error(`IndexedDB indisponível`))}),gv}async function vv(){return(await hv((await _v()).transaction(mv).objectStore(mv).getAll())).sort((e,t)=>t.updatedAt-e.updatedAt)}async function yv(e){await hv((await _v()).transaction(mv,`readwrite`).objectStore(mv).put(e))}async function bv(e){await hv((await _v()).transaction(mv,`readwrite`).objectStore(mv).delete(e))}function xv(e){let t=e.name.replace(/[^\p{L}\p{N} _-]/gu,``).trim()||`mundo`,n=document.createElement(`a`);n.href=URL.createObjectURL(new Blob([e.data],{type:`application/octet-stream`})),n.download=`${t}.ljw`,n.click(),URL.revokeObjectURL(n.href)}async function Sv(e){let t=await e.arrayBuffer();km(t);let n=Date.now();return{id:crypto.randomUUID(),name:e.name.replace(/\.ljw$/i,``)||`mundo importado`,createdAt:n,updatedAt:n,data:t}}var Cv=`lj-nome`;function wv(){let e=localStorage.getItem(Cv),t=e?Gu(e):`jogador-${Math.random().toString(36).slice(2,6)}`;return t!==e&&localStorage.setItem(Cv,t),t}function Tv(e){let t=document.getElementById(e);if(!t)throw Error(`menu: #${e} não existe no HTML`);return t}function Ev(e,t){let n=document.getElementById(e);n&&(n.textContent=t,n.classList.remove(`hidden`))}function Dv(e){document.getElementById(e)?.classList.add(`hidden`)}function Ov(e){let t=Tv(`menu`),n={home:Tv(`menu-home`),worlds:Tv(`menu-worlds`),multi:Tv(`menu-multi`),config:Tv(`menu-config`)};function r(e){for(let[t,r]of Object.entries(n))r.classList.toggle(`hidden`,t!==e)}t.classList.remove(`hidden`),r(`home`),Tv(`menu-version`).textContent=`v${Mm}`,t.addEventListener(`click`,e=>{let t=e.target instanceof HTMLElement?e.target.closest(`button`):null;t&&Km(t.classList.contains(`menu-back`)?`back`:`click`)});let i=sessionStorage.getItem(`lj-erro`);i&&(sessionStorage.removeItem(`lj-erro`),Ev(`menu-erro`,i));let a=Tv(`menu-nome`);a.value=wv(),a.addEventListener(`change`,()=>{let e=Gu(a.value);localStorage.setItem(Cv,e),a.value=e}),Tv(`menu-btn-single`).addEventListener(`click`,()=>{c(),r(`worlds`)}),Tv(`menu-btn-multi`).addEventListener(`click`,()=>r(`multi`)),Tv(`menu-btn-config`).addEventListener(`click`,()=>r(`config`));for(let e of t.querySelectorAll(`.menu-back`))e.addEventListener(`click`,()=>r(`home`));function o(n){t.classList.add(`hidden`),e.onPlayWorld(n)}let s=Tv(`menu-world-list`);async function c(){let e=[];try{e=await vv()}catch{s.textContent=`não consegui abrir o armazenamento do navegador`;return}s.textContent=e.length?``:`nenhum mundo ainda — crie um!`;for(let t of e){let e=document.createElement(`div`);e.className=`world-row`;let n=document.createElement(`span`);n.className=`world-name`,n.textContent=t.name;let r=document.createElement(`small`);r.textContent=new Date(t.updatedAt).toLocaleDateString(`pt-BR`);let i=document.createElement(`button`);i.type=`button`,i.textContent=`jogar`,i.addEventListener(`click`,()=>o({...t}));let a=document.createElement(`button`);a.type=`button`,a.textContent=`exportar`,a.title=`baixa o arquivo .ljw pra compartilhar`,a.addEventListener(`click`,()=>xv(t));let l=document.createElement(`button`);l.type=`button`,l.textContent=`apagar`,l.addEventListener(`click`,()=>{if(l.dataset.armado){bv(t.id).then(c);return}l.dataset.armado=`1`,l.textContent=`confirma?`,l.classList.add(`world-del-armado`),window.setTimeout(()=>{delete l.dataset.armado,l.textContent=`apagar`,l.classList.remove(`world-del-armado`)},3e3)}),e.append(n,r,i,a,l),s.appendChild(e)}}let l=Tv(`menu-new-nome`),u=Tv(`menu-new-tipo`);Tv(`menu-btn-new`).addEventListener(`click`,()=>{let e=l.value.trim();if(!e){Ev(`menu-worlds-erro`,`Dê um nome ao mundo novo.`);return}Dv(`menu-worlds-erro`),o({id:crypto.randomUUID(),name:e,createdAt:Date.now(),data:null,preset:vf(u.value),tamanho:yf(Tv(`menu-new-tamanho`).value),sobrevivencia:vd(Tv(`menu-new-jogo`).value)})});let d=Tv(`menu-import-file`);Tv(`menu-btn-import`).addEventListener(`click`,()=>d.click()),d.addEventListener(`change`,()=>{let e=d.files?.[0];d.value=``,e&&Sv(e).then(async e=>{await yv(e),await c(),Dv(`menu-worlds-erro`)}).catch(e=>{Ev(`menu-worlds-erro`,`arquivo inválido: ${e instanceof Error?e.message:String(e)}`)})});let f=Tv(`menu-endereco`),p=Tv(`menu-pin`),m=Tv(`menu-codigo`);f.value=localStorage.getItem(`lj-endereco`)??`ws://${location.hostname}:8080`,Tv(`menu-btn-conectar`).addEventListener(`click`,()=>{let n=f.value.trim();if(!/^wss?:\/\//.test(n)){Ev(`menu-multi-erro`,`O endereço precisa começar com ws:// (exemplo: ws://192.168.0.10:8080).`);return}let r=p.value.trim();if(!/^\d{4}$/.test(r)){Ev(`menu-multi-erro`,`O PIN precisa ter 4 números. A primeira entrada com o seu nome é a que registra o PIN.`);return}Dv(`menu-multi-erro`),localStorage.setItem(`lj-endereco`,n);let i=m.value.trim();t.classList.add(`hidden`),e.onPlayMulti(n,{pin:r,...i?{codigo:i}:{}})}),kv(Tv(`menu-config-body`),void 0,()=>r(`home`))}function kv(e,t,n){Mv(e,t,n)}function Av(e,t){let n=document.createElement(`button`);n.type=`button`,n.className=`menu-back`,n.textContent=`← voltar`,n.addEventListener(`click`,t),e.appendChild(n)}var jv=[{id:`controles`,label:`🖱️ controles`},{id:`som`,label:`🔊 som`},{id:`graficos`,label:`🖥️ gráficos`}];function Mv(e,t,n){e.textContent=``;for(let r of jv){let i=document.createElement(`button`);i.type=`button`,i.textContent=r.label,i.addEventListener(`click`,()=>Nv(e,r.id,t,n)),e.appendChild(i)}let r=document.createElement(`button`);r.type=`button`,r.textContent=`restaurar padrões`,r.addEventListener(`click`,()=>{dv(structuredClone(av)),t?.(),Mv(e,t,n)}),e.appendChild(r),n&&Av(e,n)}function Nv(e,t,n,r){e.textContent=``;let i=uv(),a=()=>{dv(i),n?.()},o=document.createElement(`h2`);o.textContent=jv.find(e=>e.id===t)?.label??t,e.appendChild(o);function s(t,n,r,i,o,s,c=String){let l=document.createElement(`label`);l.className=`config-row`;let u=document.createElement(`span`);u.textContent=t;let d=document.createElement(`input`);d.type=`range`,d.min=String(n),d.max=String(r),d.step=String(i),d.value=String(o);let f=document.createElement(`output`);return f.textContent=c(o),d.addEventListener(`input`,()=>{let e=Number(d.value);f.textContent=c(e),s(e),a()}),l.append(u,d,f),e.appendChild(l),d}if(t===`controles`){s(`sensibilidade do mouse`,.2,3,.1,i.sensitivity,e=>i.sensitivity=e,e=>`${e.toFixed(1)}×`),Uh()&&s(`escala dos controles (toque)`,.6,1.8,.1,i.uiScale,e=>i.uiScale=e,e=>`${Math.round(e*100)}%`);let t=document.createElement(`p`);t.className=`menu-hint`,t.textContent=`teclas — clique num botão e aperte a tecla nova (Esc cancela):`,e.appendChild(t);let n=!1;for(let t of Object.keys(ov)){let r=document.createElement(`div`);r.className=`config-row`;let o=document.createElement(`span`);o.textContent=ov[t];let s=document.createElement(`button`);s.type=`button`,s.textContent=fv(i.keys[t]),s.addEventListener(`click`,()=>{n||(n=!0,s.textContent=`aperte a tecla…`,window.addEventListener(`keydown`,e=>{e.preventDefault(),e.stopPropagation(),e.code!==`Escape`&&(i.keys[t]=e.code,a()),s.textContent=fv(i.keys[t]),n=!1},{once:!0,capture:!0}))}),r.append(o,s),e.appendChild(r)}}else if(t===`som`)s(`volume dos sons de interface`,0,1,.05,i.volume,e=>{i.volume=e,Wm(e)},e=>`${Math.round(e*100)}%`).addEventListener(`change`,()=>Km(`notify`));else{s(`campo de visão (FOV)`,60,100,1,i.fov,e=>i.fov=e,e=>`${e}°`);let t=document.createElement(`label`);t.className=`config-row`,t.textContent=`alta nitidez (desligue em PC fraco) `;let n=document.createElement(`input`);n.type=`checkbox`,n.checked=i.pixelRatioCap>1,n.addEventListener(`change`,()=>{i.pixelRatioCap=n.checked?2:1,a()}),t.appendChild(n),e.appendChild(t);let r=(t,n,r)=>{let i=document.createElement(`label`);i.className=`config-row`,i.textContent=`${t} `;let o=document.createElement(`input`);o.type=`checkbox`,o.checked=n,o.addEventListener(`change`,()=>{r(o.checked),a()}),i.appendChild(o),e.appendChild(i)};r(`nuvens no céu`,i.nuvens,e=>i.nuvens=e),r(`balanço de folhas e grama`,i.balanco,e=>i.balanco=e),s(`raio de render (mundo procedural)`,2,12,1,i.raioRender,e=>i.raioRender=e,e=>`${e} chunks`),s(`tempo de montagem de malha por frame`,1,16,1,i.meshMsPorFrame,e=>i.meshMsPorFrame=e,e=>`${e} ms`)}Av(e,()=>Mv(e,n,r))}var Pv=class{root=document.getElementById(`objetivos`);update(e,t,n){if(!this.root)return;if(this.root.textContent=``,t.length===0){this.root.classList.add(`hidden`);return}this.root.classList.remove(`hidden`);let r=t.some(e=>e.porGrupo),i=e=>n.grupo===null?void 0:e.porGrupo?.find(e=>e.grupo===n.grupo);if(r&&!n.professor&&n.grupo===null){let e=document.createElement(`div`);e.className=`obj`,e.textContent=`⚠ entre num grupo pra participar — tecla ${n.painelKey} abre o painel de grupos`,this.root.appendChild(e);return}let a=t.filter(e=>r&&!n.professor?i(e)?.completo??!1:e.completo).length,o=document.createElement(`div`);if(o.className=`obj-head`,o.textContent=`objetivos: ${a}/${t.length} concluídos`+(r&&n.grupo!==null?` · seu grupo: ${n.grupo}`:``)+(e===`livre`?` · qualquer ordem`:``),this.root.appendChild(o),a===t.length){let e=document.createElement(`div`);e.className=`obj`,e.textContent=`🏆 cenário completo!`,this.root.appendChild(e);return}for(let e of t){if(n.professor&&r&&e.porGrupo){if(!e.porGrupo.some(e=>e.ativo||e.completo))continue;let t=document.createElement(`div`);t.className=`obj`;let n=document.createElement(`div`);n.textContent=`▸ ${e.texto}`,t.appendChild(n);let r=document.createElement(`small`);r.textContent=e.porGrupo.map(t=>t.completo?`g${t.grupo} ✓`:e.kind===`construir`?`g${t.grupo} ${t.atual}/${t.total}`:e.kind===`limpar`?`g${t.grupo} faltam ${t.atual}`:`g${t.grupo} …`).join(` · `),t.appendChild(r),this.root.appendChild(t);continue}let t=i(e),a=t?t.ativo:e.ativo,o=t?t.completo:e.completo;if(!a||o)continue;let s=t?t.atual:e.atual,c=t?t.total:e.total,l=t?t.extras:e.extras,u=document.createElement(`div`);u.className=`obj`;let d=document.createElement(`div`);d.textContent=`▸ ${e.texto}`,u.appendChild(d);let f=document.createElement(`small`);e.kind===`construir`?f.textContent=`blocos corretos: ${s}/${c}`+(l>0?` · ${l} sobrando`:``):e.kind===`limpar`?f.textContent=`faltam ${s} bloco(s)`:f.textContent=`chegue até a área marcada em verde`+(r?` (do seu grupo)`:``),u.appendChild(f),this.root.appendChild(u)}}},Fv=class{inv=ed();ligada=!1;travada=!1;get ativa(){return this.ligada}aplicar(e){this.travada||(this.inv=cd(e),this.ligada=!0)}travar(e){this.inv=cd(e),this.ligada=!0,this.travada=!0}desligar(){this.travada||(this.ligada=!1,this.inv=ed())}idDoSlot(e){return this.inv[e]?.id??null}qtdDoSlot(e){return this.inv[e]?.qtd??0}hotbar(){return Array.from({length:9},(e,t)=>this.idDoSlot(t))}estado(){return this.inv}contar(e){let t=0;for(let n of this.inv)n?.id===e&&(t+=n.qtd);return t}},Iv=10,Lv=10,Rv=10,zv=150/Rv,Bv=`
#lj-vitals {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  /* logo acima da hotbar (que fica no rodapé) */
  bottom: 96px;
  display: none;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  pointer-events: none;
  z-index: 12;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}
#lj-vitals.ativo { display: flex; }
#lj-vitals .linha { display: flex; gap: 2px; height: 18px; }
#lj-vitals .linha.vazia { display: none; }
/* corações e coxas lado a lado (como no Minecraft); em tela estreita a linha
   QUEBRA sozinha em vez de escapar da tela — sem media query */
#lj-vitals .barras {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4px 16px;
}
#lj-vitals .icone {
  width: 18px;
  height: 18px;
  background-size: 18px 18px;
  background-repeat: no-repeat;
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.7));
}
/* o "meio" recorta o ícone cheio pela METADE da esquerda */
#lj-vitals .icone.meio { clip-path: inset(0 50% 0 0); }
#lj-vitals .fundo { position: absolute; opacity: 0.35; }
#lj-vitals .casa { position: relative; width: 18px; height: 18px; }

/* dano: vinheta vermelha curta nas bordas — sem cobrir o meio da tela, que é
   onde o aluno está mirando */
#lj-dano {
  position: fixed;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  z-index: 11;
  background: radial-gradient(ellipse at center, rgba(180, 0, 0, 0) 45%, rgba(180, 0, 0, 0.55) 100%);
  transition: opacity 420ms ease-out;
}
#lj-dano.piscar { opacity: 1; transition: opacity 60ms ease-in; }

/* morte: aviso curto no meio, some sozinho (o respawn já aconteceu) */
#lj-morte {
  position: fixed;
  inset: 0;
  display: none;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 13;
  background: rgba(90, 0, 0, 0.35);
  color: #fff;
  font: 700 28px/1.3 system-ui, sans-serif;
  text-align: center;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.9);
}
#lj-morte.ativo { display: flex; }
`;function Vv(e){return`url("data:image/svg+xml,${encodeURIComponent(e)}")`}var Hv=Vv(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M8 14.5 1.8 8.3a3.8 3.8 0 0 1 5.4-5.4L8 3.7l.8-.8a3.8 3.8 0 0 1 5.4 5.4z" fill="#e23b3b" stroke="#5a0d0d" stroke-width="1.2"/></svg>`),Uv=Vv(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M8 14.5 1.8 8.3a3.8 3.8 0 0 1 5.4-5.4L8 3.7l.8-.8a3.8 3.8 0 0 1 5.4 5.4z" fill="#1a1a1a" stroke="#000" stroke-width="1.2"/></svg>`),Wv=Vv(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="#7fd4ff" stroke="#0a3550" stroke-width="1.2"/><circle cx="5.8" cy="5.8" r="1.6" fill="#fff" opacity="0.9"/></svg>`),Gv=(e,t,n)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M12.8 12.8 8.6 8.6" stroke="${t}" stroke-width="3" stroke-linecap="round"/><circle cx="12.9" cy="12.9" r="2.1" fill="${t}" stroke="${n}" stroke-width="0.9"/><circle cx="6" cy="6" r="4.7" fill="${e}" stroke="${n}" stroke-width="1.1"/></svg>`,Kv=Vv(Gv(`#b2601f`,`#f3e7cf`,`#4d2a10`)),qv=Vv(Gv(`#1a1a1a`,`#1a1a1a`,`#000`));function Jv(e,t,n){let r=document.createElement(`div`);r.className=`linha`;let i=[];for(let a=0;a<e;a++){let e=document.createElement(`div`);if(e.className=`casa`,n!==void 0){let t=document.createElement(`div`);t.className=`icone fundo`,t.style.backgroundImage=n,e.appendChild(t)}let a=document.createElement(`div`);a.className=`icone`,a.style.backgroundImage=t,e.appendChild(a),r.appendChild(e),i.push(e)}return{linha:r,casas:i}}function Yv(e,t){for(let[n,r]of e.entries()){let e=r.lastElementChild;if(!e)continue;let i=t>=(n+1)*2,a=!i&&t===n*2+1;e.style.display=i||a?`block`:`none`,e.classList.toggle(`meio`,a)}}var Xv=class{raiz;linhaVida;linhaFome;linhaAr;dano;morte;casasVida;casasFome;casasAr;morteTimer=null;danoTimer=null;ultimaVida=20;visivel=!1;constructor(){let e=document.createElement(`style`);e.textContent=Bv,document.head.appendChild(e),this.raiz=document.createElement(`div`),this.raiz.id=`lj-vitals`;let t=Jv(Iv,Hv,Uv),n=Jv(Lv,Kv,qv),r=Jv(Rv,Wv);this.linhaVida=t.linha,this.casasVida=t.casas,this.linhaFome=n.linha,this.casasFome=n.casas,this.linhaAr=r.linha,this.casasAr=r.casas,this.linhaAr.classList.add(`vazia`),this.linhaFome.classList.add(`vazia`);let i=document.createElement(`div`);i.className=`barras`,i.append(this.linhaVida,this.linhaFome),this.raiz.append(this.linhaAr,i),document.body.appendChild(this.raiz),this.dano=document.createElement(`div`),this.dano.id=`lj-dano`,this.morte=document.createElement(`div`),this.morte.id=`lj-morte`,document.body.append(this.dano,this.morte)}setVisivel(e){this.visivel=e,this.raiz.classList.toggle(`ativo`,e),e||this.esconderMorte()}aplicar(e){let t=Math.max(0,Math.min(20,Math.round(e.vida)));Yv(this.casasVida,t),this.desenharFome(e.fome),this.desenharAr(e.folego),t<this.ultimaVida&&this.visivel&&this.piscarDano(),e.morreu&&this.visivel&&this.mostrarMorte(e.causa),this.ultimaVida=t}desenharFome(e){this.linhaFome.classList.toggle(`vazia`,e===void 0),e!==void 0&&Yv(this.casasFome,Math.max(0,Math.min(20,Math.round(e))))}desenharAr(e){let t=e===void 0||e>=150;if(this.linhaAr.classList.toggle(`vazia`,t),t)return;let n=Math.max(0,Math.ceil(e/zv));for(let[e,t]of this.casasAr.entries()){let r=t.lastElementChild;r&&(r.style.display=e<n?`block`:`none`)}}piscarDano(){this.dano.classList.add(`piscar`),this.danoTimer!==null&&clearTimeout(this.danoTimer),this.danoTimer=setTimeout(()=>this.dano.classList.remove(`piscar`),90)}mostrarMorte(e){this.morte.textContent=e===`queda`?`Você caiu de muito alto`:e===`afogamento`?`Você ficou sem ar`:e===`fome`?`Você passou fome demais`:`Você não sobreviveu`,this.morte.classList.add(`ativo`),this.morteTimer!==null&&clearTimeout(this.morteTimer),this.morteTimer=setTimeout(()=>this.esconderMorte(),2600)}esconderMorte(){this.morte.classList.remove(`ativo`)}},Zv=class{send;onToggle;root=document.getElementById(`amigos`);isOpen=!1;data={eu:``,equipe:null,convites:[],enviados:[],online:[]};onEsc=e=>{e.code===`Escape`&&(e.preventDefault(),e.stopPropagation(),this.hide())};constructor(e,t){this.send=e,this.onToggle=t,this.root?.addEventListener(`click`,e=>{e.target instanceof HTMLElement&&e.target.closest(`button`)&&Km(`click`)})}get open(){return this.isOpen}update(e){this.data=e,this.isOpen&&this.render()}toggle(){this.isOpen?this.hide():this.show()}show(){this.isOpen||!this.root||(this.isOpen=!0,this.render(),this.root.classList.remove(`hidden`),window.addEventListener(`keydown`,this.onEsc,!0),this.onToggle(!0))}hide(){this.isOpen&&(this.isOpen=!1,this.root?.classList.add(`hidden`),window.removeEventListener(`keydown`,this.onEsc,!0),this.onToggle(!1))}btn(e,t){let n=document.createElement(`button`);return n.type=`button`,n.textContent=e,n.addEventListener(`click`,t),n}armedBtn(e,t){let n=this.btn(e,()=>{if(n.dataset.armado){t();return}n.dataset.armado=`1`,n.textContent=`confirma?`,n.classList.add(`painel-armado`),window.setTimeout(()=>{delete n.dataset.armado,n.textContent=e,n.classList.remove(`painel-armado`)},3e3)});return n}sec(e){let t=document.createElement(`h3`);return t.textContent=e,t}hint(e){let t=document.createElement(`p`);return t.className=`painel-hint`,t.textContent=e,t}linha(e,...t){let n=document.createElement(`div`);n.className=`jog-row`;let r=document.createElement(`span`);return r.className=`jog-nome`,r.textContent=e,n.append(r,...t),n}render(){let e=this.root;if(!e)return;e.replaceChildren();let t=document.createElement(`div`);t.className=`painel-head`;let n=document.createElement(`h2`);n.textContent=`amigos`,t.append(n,this.btn(`✕ fechar`,()=>this.hide()));let r=document.createElement(`div`);r.className=`jog-lista`,this.renderConvites(r),this.renderGrupo(r),this.renderConvidar(r),r.append(this.hint(`pelo chat também dá: /amigos convidar nome · /amigos aceitar · /amigos recusar · /amigos sair · /amigos expulsar nome · /amigos lista`)),e.append(t,r)}renderConvites(e){if(this.data.convites.length!==0){e.append(this.sec(`✉ convites para você (${this.data.convites.length})`));for(let t of this.data.convites)e.append(this.linha(`${t} convidou você`,this.btn(`aceitar`,()=>this.send(`/amigos aceitar ${t}`)),this.btn(`recusar`,()=>this.send(`/amigos recusar ${t}`))));e.append(this.hint(`aceitar um convite descarta os outros — você fica em UM grupo só.`))}}renderGrupo(e){let{eu:t,equipe:n}=this.data;if(!n){e.append(this.sec(`👥 seu grupo`)),e.append(this.hint(`Você não está em nenhum grupo. Quem está no seu grupo pode construir na sua ÁREA PROTEGIDA (e você na dele). Cabem 6 pessoas, contando você.`));return}let r=n.dono===t;e.append(this.sec(`👥 grupo de ${n.dono} — ${n.membros.length}/6`));for(let i of n.membros){let a=[i===n.dono?`dono`:``,i===t?`você`:``].filter(e=>e),o=a.length?`${i} (${a.join(`, `)})`:i;e.append(r&&i!==t?this.linha(o,this.armedBtn(`expulsar`,()=>this.send(`/amigos expulsar ${i}`))):this.linha(o))}let i=document.createElement(`div`);i.className=`painel-row`,i.append(r?this.armedBtn(`sair e DESFAZER o grupo`,()=>this.send(`/amigos sair`)):this.armedBtn(`sair do grupo`,()=>this.send(`/amigos sair`))),e.append(i),r&&e.append(this.hint(`você é o dono: se sair, o grupo acaba para todo mundo.`))}renderConvidar(e){let{eu:t,equipe:n,enviados:r,online:i}=this.data;if(e.append(this.sec(`＋ convidar`)),n&&n.dono!==t){e.append(this.hint(`Só ${n.dono} convida para este grupo. Saia dele para montar o seu.`));return}if(n&&n.membros.length>=6){e.append(this.hint(`Grupo cheio (6/6).`));return}for(let t of r)e.append(this.linha(`${t} — convite enviado, aguardando`));let a=new Set(n?.membros??[]),o=i.filter(e=>e!==t&&!a.has(e)&&!r.includes(e));for(let t of o)e.append(this.linha(t,this.btn(`convidar`,()=>this.send(`/amigos convidar ${t}`))));o.length===0&&r.length===0&&e.append(this.hint(`ninguém mais está na aula agora.`))}},Qv=class{send;onToggle;root=document.getElementById(`jogadores`);isOpen=!1;aba=`conectados`;data={conectados:[],banidos:[]};onEsc=e=>{e.code===`Escape`&&(e.preventDefault(),e.stopPropagation(),this.hide())};constructor(e,t){this.send=e,this.onToggle=t,this.root?.addEventListener(`click`,e=>{e.target instanceof HTMLElement&&e.target.closest(`button`)&&Km(`click`)})}get open(){return this.isOpen}update(e){this.data=e,this.isOpen&&this.render()}toggle(){this.isOpen?this.hide():this.show()}show(){this.isOpen||!this.root||(this.isOpen=!0,this.render(),this.root.classList.remove(`hidden`),window.addEventListener(`keydown`,this.onEsc,!0),this.onToggle(!0))}hide(){this.isOpen&&(this.isOpen=!1,this.root?.classList.add(`hidden`),window.removeEventListener(`keydown`,this.onEsc,!0),this.onToggle(!1))}armedBtn(e,t){let n=document.createElement(`button`);return n.type=`button`,n.textContent=e,n.addEventListener(`click`,()=>{if(n.dataset.armado){t();return}n.dataset.armado=`1`,n.textContent=`confirma?`,n.classList.add(`painel-armado`),window.setTimeout(()=>{delete n.dataset.armado,n.textContent=e,n.classList.remove(`painel-armado`)},3e3)}),n}hint(e){let t=document.createElement(`p`);return t.className=`painel-hint`,t.textContent=e,t}render(){let e=this.root;if(!e)return;e.replaceChildren();let t=document.createElement(`div`);t.className=`painel-head`;let n=document.createElement(`h2`);n.textContent=`jogadores`;let r=document.createElement(`button`);r.type=`button`,r.textContent=`✕ fechar`,r.addEventListener(`click`,()=>this.hide()),t.append(n,r);let i=document.createElement(`div`);i.className=`inv-abas`;let a=[{id:`conectados`,label:`conectados (${this.data.conectados.length})`},{id:`banidos`,label:`banidos (${this.data.banidos.length})`}];for(let e of a){let t=document.createElement(`button`);t.type=`button`,t.className=`inv-aba`+(e.id===this.aba?` sel`:``),t.textContent=e.label,t.addEventListener(`click`,()=>{this.aba=e.id,this.render()}),i.appendChild(t)}let o=document.createElement(`div`);o.className=`jog-lista`,this.aba===`conectados`?this.renderConectados(o):this.renderBanidos(o),e.append(t,i,o)}renderConectados(e){if(this.data.conectados.length===0){e.append(this.hint(`ninguém conectado agora.`));return}for(let t of this.data.conectados){let n=document.createElement(`div`);n.className=`jog-row`;let r=document.createElement(`span`);r.className=`jog-nome`,r.textContent=t.papel===`professor`?`${t.name} (professor)`:t.name,n.append(r),t.papel!==`professor`&&n.append(this.armedBtn(`expulsar`,()=>this.send(`/kicar ${t.name}`)),this.armedBtn(`banir`,()=>this.send(`/banir ${t.name}`))),e.append(n)}}renderBanidos(e){if(this.data.banidos.length===0){e.append(this.hint(`ninguém banido. Bane pela aba “conectados” ou com /banir nome.`));return}for(let t of this.data.banidos){let n=document.createElement(`div`);n.className=`jog-row`;let r=document.createElement(`span`);r.className=`jog-nome`,r.textContent=t;let i=document.createElement(`button`);i.type=`button`,i.textContent=`desbanir`,i.addEventListener(`click`,()=>this.send(`/desbanir ${t}`)),n.append(r,i),e.append(n)}}},$v=class{send;onToggle;root=document.getElementById(`painel`);data={regions:[],modo:`sequencial`,objetivos:[],grupos:[],myGrupo:null};isOpen=!1;dirty=!1;onEsc=e=>{e.code===`Escape`&&(e.preventDefault(),e.stopPropagation(),this.hide())};constructor(e,t){this.send=e,this.onToggle=t,this.root?.addEventListener(`click`,e=>{e.target instanceof HTMLElement&&e.target.closest(`button`)&&Km(`click`)}),this.root?.addEventListener(`focusout`,()=>{this.dirty&&this.isOpen&&(this.dirty=!1,this.render())})}get open(){return this.isOpen}update(e){if(this.data=e,!this.isOpen)return;let t=document.activeElement;if(t&&this.root?.contains(t)&&(t instanceof HTMLInputElement||t instanceof HTMLSelectElement)){this.dirty=!0;return}this.render()}toggle(){this.isOpen?this.hide():this.show()}show(){this.isOpen||!this.root||(this.isOpen=!0,this.render(),this.root.classList.remove(`hidden`),window.addEventListener(`keydown`,this.onEsc,!0),this.onToggle(!0))}hide(){this.isOpen&&(this.isOpen=!1,this.root?.classList.add(`hidden`),window.removeEventListener(`keydown`,this.onEsc,!0),this.onToggle(!1))}head(e){let t=document.createElement(`div`);t.className=`painel-head`;let n=document.createElement(`h2`);return n.textContent=e,t.append(n,this.btn(`✕ fechar`,()=>this.hide())),t}sec(e){let t=document.createElement(`h3`);return t.textContent=e,t}btn(e,t){let n=document.createElement(`button`);return n.type=`button`,n.textContent=e,n.addEventListener(`click`,t),n}armedBtn(e,t){let n=document.createElement(`button`);return n.type=`button`,n.textContent=e,n.addEventListener(`click`,()=>{if(n.dataset.armado){t();return}n.dataset.armado=`1`,n.textContent=`confirma?`,n.classList.add(`painel-armado`),window.setTimeout(()=>{delete n.dataset.armado,n.textContent=e,n.classList.remove(`painel-armado`)},3e3)}),n}row(...e){let t=document.createElement(`div`);t.className=`painel-row`;for(let n of e)if(typeof n==`string`){let e=document.createElement(`span`);e.textContent=n,t.appendChild(e)}else t.appendChild(n);return t}hint(e){let t=document.createElement(`p`);return t.className=`painel-hint`,t.textContent=e,t}select(e,t,n){let r=document.createElement(`select`);for(let t of e)r.appendChild(new Option(t.label,t.value));return e.some(e=>e.value===t)&&(r.value=t),n(r.value),r.addEventListener(`change`,()=>n(r.value)),r}textInput(e,t,n,r){let i=document.createElement(`input`);return i.type=`text`,i.placeholder=e,i.value=t,r&&(i.size=r,i.classList.add(`painel-input-curto`)),i.addEventListener(`input`,()=>n(i.value)),i}},ey=class extends $v{onOpenPlayers;constructor(e,t,n){super(e,t),this.onOpenPlayers=n}draft={objKind:`construir`,objModelo:``,objAlvo:``,objRegra:`um`,objTexto:``,regiaoNome:``,encherRegiao:``,encherBloco:String(kh[0]?.id??1),carimbModelo:``,carimbPrefixo:``,carimbEsp:`2`,carimbEixo:`x`,grupoN:`4`};editandoId=null;editandoTexto=``;erroMsg=``;flash(e){this.erroMsg=e,this.render()}cmd(e){this.erroMsg=``,this.send(e)}regionOptions(e){let t=new Set(this.data.regions.map(e=>e.nome)),n=this.data.regions.map(e=>{let t=Ku(e);return{value:e.nome,label:`${e.nome} (${t.x}×${t.y}×${t.z})`}});if(e&&this.data.grupos.length>0)for(let e of t){let r=/^(.+)-1$/.exec(e);r?.[1]&&!t.has(r[1])&&n.push({value:r[1],label:`${r[1]}-1…${this.data.grupos.length} (uma área por grupo)`})}return n}estadoDe(e){if(e.porGrupo?.length){let t=e.porGrupo.filter(e=>e.completo).length;return t===e.porGrupo.length?`✓ todos os grupos`:`${t}/${e.porGrupo.length} grupos ✓`}return e.completo?`✓ concluído`:e.ativo?`ativo`:`aguardando`}render(){let e=this.root;if(e){if(e.textContent=``,e.append(this.head(`painel de autoria`)),this.onOpenPlayers&&e.append(this.row(this.btn(`👥 jogadores (expulsar / banir)`,()=>this.onOpenPlayers?.()))),this.erroMsg){let t=document.createElement(`p`);t.className=`painel-erro`,t.textContent=this.erroMsg,e.append(t)}this.renderAtividade(e),this.renderObjetivos(e),this.renderRegioes(e),this.renderGrupos(e),e.append(this.hint(`as respostas dos comandos aparecem no chat (canto inferior esquerdo)`))}}renderAtividade(e){e.append(this.sec(`▶ começar a aula`)),e.append(this.row(this.armedBtn(`▶ iniciar atividade`,()=>this.cmd(`/iniciar`)),this.btn(`↦ levar grupos às áreas`,()=>this.cmd(`/tp grupos`)))),e.append(this.hint(`iniciar zera o progresso e leva cada grupo à sua área · pelo chat: /iniciar · /tp grupos`))}renderObjetivos(e){e.append(this.sec(`🎯 objetivos`));let t=this.row(`modo:`);for(let e of[`sequencial`,`livre`]){let n=this.btn(e===this.data.modo?`● ${e}`:e,()=>this.cmd(`/objetivo modo ${e}`));e===this.data.modo&&(n.disabled=!0),t.append(n)}t.append(`(sequencial = um de cada vez, na ordem)`),e.append(t),this.data.objetivos.forEach((t,n)=>{let r=document.createElement(`div`);r.className=`painel-obj`;let i=document.createElement(`div`);if(i.textContent=`#${t.id} ${t.kind} → ${t.regiao} — ${this.estadoDe(t)}`,r.append(i),this.editandoId===t.id){let e=this.textInput(`texto do objetivo`,this.editandoTexto,e=>{this.editandoTexto=e}),n=this.btn(`salvar`,()=>{let e=this.editandoTexto.trim();e&&(this.editandoId=null,this.cmd(`/objetivo texto ${t.id} ${e}`),this.render())}),i=this.btn(`cancelar`,()=>{this.editandoId=null,this.render()});r.append(this.row(e,n,i))}else{let e=document.createElement(`small`);e.textContent=t.texto,r.append(e);let i=this.btn(`↑`,()=>this.cmd(`/objetivo mover ${t.id} ${n}`));i.disabled=n===0;let a=this.btn(`↓`,()=>this.cmd(`/objetivo mover ${t.id} ${n+2}`));a.disabled=n===this.data.objetivos.length-1;let o=this.btn(`✎ texto`,()=>{this.editandoId=t.id,this.editandoTexto=t.texto,this.render()});r.append(this.row(i,a,o,this.armedBtn(`✕ remover`,()=>this.cmd(`/objetivo remover ${t.id}`))))}e.append(r)}),e.append(this.sec(`＋ novo objetivo`));let n=this.select([{value:`construir`,label:`construir (copiar um modelo)`},{value:`chegar`,label:`chegar (ir até uma área)`},{value:`limpar`,label:`limpar (esvaziar uma área)`}],this.draft.objKind,e=>{this.draft.objKind=e});n.addEventListener(`change`,()=>this.render()),e.append(this.row(`tipo:`,n));let r=this.regionOptions(!0);if(r.length===0)e.append(this.hint(`crie uma região antes (seção regiões, logo abaixo)`));else{if(this.draft.objKind===`construir`){let t=this.select(this.regionOptions(!1),this.draft.objModelo,e=>{this.draft.objModelo=e}),n=this.select(r,this.draft.objAlvo,e=>{this.draft.objAlvo=e});e.append(this.row(`modelo:`,t),this.row(`alvo:`,n)),e.append(this.hint(`fotografa o modelo AGORA (construa antes); o alvo precisa ter o mesmo tamanho`))}else{let t=this.select(r,this.draft.objAlvo,e=>{this.draft.objAlvo=e});if(e.append(this.row(`área:`,t)),this.draft.objKind===`chegar`){let t=this.select([{value:`um`,label:`basta um do grupo chegar`},{value:`todos`,label:`o grupo todo dentro, junto`}],this.draft.objRegra,e=>{this.draft.objRegra=e});e.append(this.row(`conclui quando:`,t))}}let t=this.textInput(`texto que o aluno vê (ex.: Copie o padrão do modelo)`,this.draft.objTexto,e=>{this.draft.objTexto=e}),n=this.btn(`criar objetivo`,()=>{let e=this.draft.objTexto.trim();if(!e){this.flash(`escreva o texto do objetivo`);return}let t=this.draft.objKind;if(t===`construir`)this.cmd(`/objetivo add construir ${this.draft.objModelo} ${this.draft.objAlvo} ${e}`);else if(t===`chegar`){let t=this.draft.objRegra===`todos`?`todos `:``;this.cmd(`/objetivo add chegar ${this.draft.objAlvo} ${t}${e}`)}else this.cmd(`/objetivo add limpar ${this.draft.objAlvo} ${e}`);this.draft.objTexto=``,this.render()});e.append(this.row(t,n))}this.data.objetivos.length>0&&e.append(this.row(this.armedBtn(`zerar progresso da turma`,()=>this.cmd(`/objetivo resetar`))))}renderRegioes(e){e.append(this.sec(`📐 regiões`));for(let t of this.data.regions){let n=Ku(t),r=this.row(`${t.nome} — ${n.x}×${n.y}×${n.z} em (${t.min.x}, ${t.min.y}, ${t.min.z})`);r.classList.add(`painel-obj`),r.append(this.armedBtn(`apagar`,()=>this.cmd(`/regiao apagar ${t.nome}`))),e.append(r)}e.append(this.hint(`criar: tecla R no jogo (varinha), clique esq/dir marca os 2 cantos, aí:`));let t=this.textInput(`nome da região (sem espaços)`,this.draft.regiaoNome,e=>{this.draft.regiaoNome=e}),n=this.btn(`criar região`,()=>{let e=this.draft.regiaoNome.trim();if(!e){this.flash(`dê um nome pra região`);return}if(/\s/.test(e)){this.flash(`nome de região não pode ter espaço`);return}this.draft.regiaoNome=``,this.cmd(`/regiao criar ${e}`),this.render()});if(e.append(this.row(t,n)),this.data.regions.length>0){let t=this.select(this.regionOptions(!1),this.draft.encherRegiao,e=>{this.draft.encherRegiao=e}),n=[{value:`0`,label:`ar (limpar)`},...kh.map(e=>({value:String(e.id),label:e.name}))],r=this.select(n,this.draft.encherBloco,e=>{this.draft.encherBloco=e});if(e.append(this.row(`encher`,t,`com`,r,this.btn(`aplicar`,()=>this.cmd(`/regiao encher ${this.draft.encherRegiao} ${this.draft.encherBloco}`)))),this.data.grupos.length>0){let t=this.select(this.regionOptions(!1),this.draft.carimbModelo,e=>{this.draft.carimbModelo=e}),n=this.textInput(`prefixo`,this.draft.carimbPrefixo,e=>{this.draft.carimbPrefixo=e},10),r=this.textInput(`espaço`,this.draft.carimbEsp,e=>{this.draft.carimbEsp=e},4),i=this.select([{value:`x`,label:`eixo x`},{value:`z`,label:`eixo z`}],this.draft.carimbEixo,e=>{this.draft.carimbEixo=e}),a=this.btn(`carimbar: 1 cópia por grupo`,()=>{let e=this.draft.carimbPrefixo.trim(),t=Number(this.draft.carimbEsp);if(!e||/\s/.test(e)){this.flash(`prefixo precisa ser uma palavra sem espaço`);return}if(!Number.isInteger(t)||t<0){this.flash(`espaçamento precisa ser um número inteiro ≥ 0`);return}this.cmd(`/regiao carimbar ${this.draft.carimbModelo} ${e} ${t}`+(this.draft.carimbEixo===`z`?` z`:``))});e.append(this.row(`carimbar`,t,n,r,i,a)),e.append(this.hint(`carimbar copia a região (com blocos!) e nomeia prefixo-1…N — as áreas dos grupos`))}else e.append(this.hint(`a ferramenta de carimbar (1 área por grupo) aparece depois de criar grupos`))}}renderGrupos(e){e.append(this.sec(`👥 grupos`));for(let t of this.data.grupos){let n=this.row(`grupo ${t.id} (${t.membros.length}): ${t.membros.join(`, `)||`—`}`);n.classList.add(`painel-obj`),e.append(n)}let t=this.textInput(`nº`,this.draft.grupoN,e=>{this.draft.grupoN=e},4),n=e=>{let t=Number(this.draft.grupoN);if(!Number.isInteger(t)||t<1){this.flash(`quantidade precisa ser um número ≥ 1`);return}this.cmd(`/grupo criar ${t}${e?` alunos`:``}`)};e.append(this.row(t,this.armedBtn(`criar N grupos`,()=>n(!1)),this.armedBtn(`grupos de N alunos`,()=>n(!0)))),e.append(this.hint(this.data.grupos.length?`criar de novo redistribui a turma e ZERA o progresso por grupo`:`criar grupos distribui os alunos online automaticamente (professor fica fora)`))}},ty=class extends $v{render(){let e=this.root;if(!e)return;if(e.textContent=``,e.append(this.head(`grupos`)),this.data.grupos.length===0){e.append(this.hint(`o professor ainda não criou grupos`));return}let t=this.data.myGrupo;e.append(this.hint(t===null?`você está SEM grupo — entre num grupo pra participar dos objetivos`:`você está no grupo ${t}`));for(let n of this.data.grupos){let r=this.row(`grupo ${n.id} (${n.membros.length}): ${n.membros.join(`, `)||`—`}`);r.classList.add(`painel-obj`),r.append(n.id===t?this.btn(`sair`,()=>this.send(`/grupo sair`)):this.btn(`entrar`,()=>this.send(`/grupo entrar ${n.id}`))),e.append(r)}e.append(this.hint(`pelo chat também dá: /grupo entrar n · /grupo sair`))}},ny=class{fixedColor;group=new un;cornerMarks=[];boxes=[];bounds=[];culling=null;constructor(e,t){this.fixedColor=t,e.add(this.group);for(let e of[16765952,58879]){let t=new Ti(new Wi(new Ri(1.01,1.01,1.01)),new pi({color:e}));t.visible=!1,this.group.add(t),this.cornerMarks.push(t)}}setCorner(e,t,n,r){let i=this.cornerMarks[e-1];i&&(i.position.set(t+.5,n+.5,r+.5),i.visible=!0)}clearCorners(){for(let e of this.cornerMarks)e.visible=!1}setRegions(e){for(let e of this.boxes)this.group.remove(e),e.geometry.dispose(),e.material.dispose();if(this.boxes=e.map((e,t)=>{let n=e.max.x-e.min.x+1,r=e.max.y-e.min.y+1,i=e.max.z-e.min.z+1,a=new Ti(new Wi(new Ri(n+.04,r+.04,i+.04)),new pi({color:this.fixedColor??new H().setHSL(t*.618034%1,.9,.55)}));return a.position.set(e.min.x+n/2,e.min.y+r/2,e.min.z+i/2),this.group.add(a),a}),this.bounds=e,this.culling){let{px:e,pz:t,raio:n}=this.culling;this.cularPorDistancia(e,t,n)}}cularPorDistancia(e,t,n){this.culling={px:e,pz:t,raio:n};for(let r=0;r<this.boxes.length;r++){let i=this.boxes[r],a=this.bounds[r];if(!i||!a)continue;let o=Math.max(a.min.x-e,0,e-(a.max.x+1)),s=Math.max(a.min.z-t,0,t-(a.max.z+1));i.visible=Math.max(o,s)<=n}}},ry=1/16,iy=[{dx:.129,dz:.5,ry:Math.PI/2},{dx:.5,dz:.129,ry:0},{dx:1-2*ry-.004,dz:.5,ry:-Math.PI/2},{dx:.5,dz:1-2*ry-.004,ry:Math.PI}];function ay(e,t,n){let r=e.getContext(`2d`);if(!r)return;let i=e.width,a=e.height;r.fillStyle=`#f2eee4`,r.fillRect(0,0,i,a);let o=0,s=a;if(n){let e=t.texto?Math.floor(a*.68):a,c=Math.min(i/n.width,e/n.height),l=n.width*c,u=n.height*c;r.drawImage(n,(i-l)/2,(e-u)/2,l,u),o=e,s=a-e}if(t.texto){r.fillStyle=`#22201c`,r.font=`bold 22px sans-serif`,r.textAlign=`center`,r.textBaseline=`middle`;let e=i-20,n=[],a=``;for(let i of t.texto.split(/\s+/)){let t=a?`${a} ${i}`:i;r.measureText(t).width>e&&a?(n.push(a),a=i):a=t}a&&n.push(a);let c=Math.max(1,Math.floor((s-8)/26)),l=n.slice(0,c),u=o+s/2-(l.length-1)*26/2;l.forEach((t,n)=>r.fillText(t,i/2,u+n*26,e))}}var oy=class{scene;planes=new Map;conteudos=new Map;constructor(e){this.scene=e}get(e,t,n){return this.conteudos.get(Zu(e,t,n))??null}setAll(e,t){for(let e of[...this.planes.keys()])this.remover(e);this.conteudos.clear();for(let n of e)this.aplicar(n,t)}aplicar(e,t){let n=Zu(e.x,e.y,e.z);if(this.remover(n),!e.texto&&!e.imagem){this.conteudos.delete(n);return}this.conteudos.set(n,e);let r=K(t,e.x,e.y,e.z);if(!iu(r))return;let i=iy[r-G.QuadroXP];if(!i)return;let a=document.createElement(`canvas`);a.width=128,a.height=128,ay(a,e,null);let o=new Pi(a);o.colorSpace=ze;let s=new ti(new Gi(12*ry,12*ry),new Ur({map:o}));if(s.position.set(e.x+i.dx,e.y+.5,e.z+i.dz),s.rotation.y=i.ry,this.scene.add(s),this.planes.set(n,{mesh:s,tex:o}),e.imagem){let t=new Image;t.onload=()=>{ay(a,e,t),o.needsUpdate=!0},t.src=e.imagem}}onBlockChanged(e,t,n,r,i){let a=Zu(e,t,n);if(this.conteudos.has(a))if(!iu(r))this.remover(a),this.conteudos.delete(a);else{let e=this.conteudos.get(a);e&&this.aplicar(e,i)}}validarTodos(e){for(let[t,n]of[...this.conteudos.entries()])iu(K(e,n.x,n.y,n.z))||(this.remover(t),this.conteudos.delete(t))}remover(e){let t=this.planes.get(e);t&&(this.scene.remove(t.mesh),t.mesh.geometry.dispose(),t.mesh.material.dispose(),t.tex.dispose(),this.planes.delete(e))}};async function sy(e){let t=await new Promise((t,n)=>{let r=new FileReader;r.onload=()=>t(String(r.result)),r.onerror=()=>n(Error(`falha ao ler o arquivo`)),r.readAsDataURL(e)}),n=await new Promise((e,n)=>{let r=new Image;r.onload=()=>e(r),r.onerror=()=>n(Error(`arquivo não é uma imagem`)),r.src=t}),r=document.createElement(`canvas`),i=Math.min(1,192/Math.max(n.width,n.height));r.width=Math.max(1,Math.round(n.width*i)),r.height=Math.max(1,Math.round(n.height*i));let a=r.getContext(`2d`);if(!a)return null;a.drawImage(n,0,0,r.width,r.height);for(let e of[.75,.55,.35]){let t=r.toDataURL(`image/jpeg`,e);if(t.length<=32768)return t}return null}var cy=class{root=null;get aberto(){return this.root!==null}open(e,t){if(this.root)return;document.exitPointerLock();let n=e?.imagem,r=document.createElement(`div`);r.style.cssText=`position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.55);z-index:40`;let i=document.createElement(`div`);i.style.cssText=`background:#1d222b;color:#e8e8e8;border-radius:10px;padding:16px;width:min(420px,92vw);display:flex;flex-direction:column;gap:10px;font:14px sans-serif`,i.innerHTML=`<b style="font-size:16px">✏️ Editar quadro</b>`;let a=document.createElement(`textarea`);a.maxLength=300,a.value=e?.texto??``,a.placeholder=`texto do quadro…`,a.style.cssText=`width:100%;height:84px;resize:vertical;background:#12151b;color:#e8e8e8;border:1px solid #3a4150;border-radius:6px;padding:8px;font:14px sans-serif`,a.addEventListener(`keydown`,e=>e.stopPropagation());let o=document.createElement(`input`);o.type=`file`,o.accept=`image/*`,o.style.cssText=`color:#aab`;let s=document.createElement(`div`);s.style.cssText=`min-height:18px;color:#8fa;font-size:12px`,n&&(s.textContent=`quadro tem uma imagem (escolher outra substitui)`);let c=document.createElement(`div`);c.style.cssText=`display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap`;let l=e=>{let t=document.createElement(`button`);return t.textContent=e,t.style.cssText=`padding:8px 14px;border-radius:6px;border:1px solid #3a4150;background:#2a3140;color:#e8e8e8;cursor:pointer;font:14px sans-serif`,c.appendChild(t),t},u=l(`tirar imagem`);u.style.display=n?``:`none`;let d=l(`cancelar`),f=l(`salvar`);f.style.background=`#3d6b3f`,u.addEventListener(`click`,()=>{n=void 0,o.value=``,u.style.display=`none`,s.textContent=`imagem removida (salve para confirmar)`});let p=e=>{r.remove(),this.root=null,window.removeEventListener(`keydown`,m,!0),t(e)},m=e=>{e.code===`Escape`&&(e.stopPropagation(),p(null))};window.addEventListener(`keydown`,m,!0),d.addEventListener(`click`,()=>p(null)),f.addEventListener(`click`,()=>{let e=o.files?.[0];if(!e){p({texto:a.value,...n?{imagem:n}:{}});return}s.textContent=`comprimindo imagem…`,sy(e).then(e=>{if(e===null){s.textContent=`essa imagem não coube nem comprimida — tente outra`,s.style.color=`#f88`;return}p({texto:a.value,imagem:e})}).catch(()=>{s.textContent=`não deu pra ler esse arquivo como imagem`,s.style.color=`#f88`})}),i.append(a,o,s,c),r.appendChild(i),document.body.appendChild(r),this.root=r,a.focus()}},ly=null;function uy(e){e.preventDefault(),e.returnValue=``}var dy=new Set([`F1`,`F5`,`F6`,`F7`,`F10`,`F12`]);function fy(e){ly?.()&&(e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement||(e.ctrlKey||e.metaKey||e.altKey||e.code===`Tab`||dy.has(e.code))&&e.preventDefault())}function py(e){ly?.()&&e.code.startsWith(`Alt`)&&e.preventDefault()}function my(e){ly||(ly=e,window.addEventListener(`beforeunload`,uy),window.addEventListener(`keydown`,fy,!0),window.addEventListener(`keyup`,py,!0),navigator.keyboard?.lock?.([`KeyW`,`KeyT`,`KeyN`,`KeyR`,`F4`])?.catch(()=>{}))}function hy(){ly=null,window.removeEventListener(`beforeunload`,uy),window.removeEventListener(`keydown`,fy,!0),window.removeEventListener(`keyup`,py,!0),navigator.keyboard?.unlock?.()}var gy=class{scene;sprites=new Map;material;constructor(e){this.scene=e;let t=document.createElement(`canvas`);t.width=t.height=64;let n=t.getContext(`2d`);if(!n)throw Error(`canvas 2d indisponível`);let r=n.createRadialGradient(32,32,2,32,32,32);r.addColorStop(0,`rgba(255,225,140,0.55)`),r.addColorStop(.5,`rgba(255,190,80,0.18)`),r.addColorStop(1,`rgba(255,170,60,0)`),n.fillStyle=r,n.fillRect(0,0,64,64);let i=new Pi(t);i.minFilter=o,this.material=new yr({map:i,blending:2,depthWrite:!1,transparent:!0})}setFromWorld(e){this.clear();let{x:t,y:n,z:r}=e.dims;for(let i=0;i<n;i++)for(let n=0;n<r;n++)for(let r=0;r<t;r++)this.varrerChunk(e,r,i,n)}varrerColuna(e,t,n){for(let r=0;r<e.dims.y;r++)this.varrerChunk(e,t,r,n)}descartarColuna(e,t){for(let[n,r]of this.sprites){let[i=0,,a=0]=n.split(`,`).map(Number);Math.floor(i/16)===e&&Math.floor(a/16)===t&&(this.scene.remove(r),this.sprites.delete(n))}}varrerChunk(e,t,n,r){let i=e.chunks[Bu(e,t,n,r)];if(i)for(let e=0;e<16;e++)for(let a=0;a<16;a++)for(let o=0;o<16;o++)i[(e*16+a)*16+o]===G.Tocha&&this.add(t*16+o,n*16+e,r*16+a)}onBlockChanged(e,t,n,r){r===G.Tocha?this.add(e,t,n):this.remove(e,t,n)}onRegionFilled(e,t,n){if(n===G.Tocha){for(let n=e.y;n<=t.y;n++)for(let r=e.z;r<=t.z;r++)for(let i=e.x;i<=t.x;i++)this.add(i,n,r);return}for(let n of[...this.sprites.keys()]){let[r=0,i=0,a=0]=n.split(`,`).map(Number);r>=e.x&&r<=t.x&&i>=e.y&&i<=t.y&&a>=e.z&&a<=t.z&&this.remove(r,i,a)}}add(e,t,n){let r=`${e},${t},${n}`;if(this.sprites.has(r))return;let i=new Nr(this.material);i.scale.set(2.4,2.4,1),i.position.set(e+.5,t+.55,n+.5),this.scene.add(i),this.sprites.set(r,i)}remove(e,t,n){let r=`${e},${t},${n}`,i=this.sprites.get(r);i&&(this.scene.remove(i),this.sprites.delete(r))}clear(){for(let e of this.sprites.values())this.scene.remove(e);this.sprites.clear()}};function _y(e){return fd(e)!==null||Su(e)||su(e)}function vy(e){let t=/dispon[ií]veis:\s*(.+?)\.\s*(?:para trocar|para continuar)/i.exec(e)?.[1];if(!t)return;let n=t.split(`·`).map(e=>e.replace(/\(em curso\)/i,``).trim()).filter(Boolean);n.length&&Rh(n)}var yy=new vl({antialias:!0});yy.setPixelRatio(Math.min(window.devicePixelRatio,2)),yy.setSize(window.innerWidth,window.innerHeight),document.body.appendChild(yy.domElement);var by=new yn;by.background=new H(8900331);var xy=new Na(75,window.innerWidth/window.innerHeight,.1,512);xy.rotation.order=`YXZ`;var Sy=new Ia(16777215,2.2);Sy.position.set(60,100,40);var Cy=new La(16777215,.55);by.add(Sy,Cy);var wy=new zg(Sy,Cy,by,xy),Ty=(()=>{let e=new URLSearchParams(location.search).get(`hora`);if(e===null)return null;let t=Number(e);return Number.isFinite(t)?t:null})();Ty!==null&&wy.sync(Ty,!1);var Ey=new Hg,Dy=(()=>{let e=new URLSearchParams(location.search).get(`vento`);if(e===null)return null;let[t,n]=e.split(`,`).map(Number);return t===void 0||!Number.isFinite(t)?null:{dir:t,forca:Number.isFinite(n)?n:.6}})();Dy&&Ey.sync(Dy.dir,Dy.forca,!0);var $=new X_(yy.domElement);$.touchDevice=Uh();var Oy=e=>{let t=new URLSearchParams(location.search).get(e);if(t===null)return null;let n=Number(t);return Number.isFinite(n)?n:null},ky=Oy(`yaw`),Ay=Oy(`pitch`);ky!==null&&($.yaw=ky),Ay!==null&&($.pitch=Ay);var jy=nh(new URLSearchParams(location.search));function My(){let e=jy?{...uv(),...rh(jy)}:uv();return $.sensitivity=e.sensitivity,xy.fov=e.fov,xy.updateProjectionMatrix(),yy.setPixelRatio(Math.min(window.devicePixelRatio,e.pixelRatioCap)),Wm(e.volume),Ny?.setScale(e.uiScale),wy.setNuvens(e.nuvens),e}var Ny=null,Py=My();Jm(Py.volume);var Fy=new L_(()=>Ky()||rb.open);$.podeTravar=()=>!Fy.algumAberto;var Iy={equipe:null,convites:[],enviados:[]},Ly=new iv(()=>{qy(),Ry?.hud.setFase(`jogando`),Ry?.hud.marcar(`carga concluída`),Ry?.iniciarBench()}),Ry=null,zy=!1,By=document.getElementById(`overlay`),Vy=document.getElementById(`overlay-main`),Hy=document.getElementById(`overlay-config`),Uy=document.getElementById(`crosshair`),Wy=document.getElementById(`hotbar`);function Gy(){Vy?.classList.remove(`hidden`),Hy?.classList.add(`hidden`)}function Ky(){return By!==null&&!By.classList.contains(`hidden`)}function qy(){let e=Fy.algumAberto;By?.classList.toggle(`hidden`,zy||Ly.ativo||$.active||$.retomando||rb.open||e);let t=zy||$.active||$.retomando;Wy?.classList.toggle(`hidden`,!(t&&!rb.open&&!e&&!Ly.ativo)),Uy?.classList.toggle(`hidden`,!$.active),$.locked&&Gy(),Ny?.setShown($.touch&&!rb.open&&!e&&!Ly.ativo)}document.addEventListener(`pointerlockchange`,qy),document.addEventListener(`pointerlockerror`,qy);function Jy(){Uh()?($.touch=!0,Wh(),qy()):$.lock()}window.addEventListener(`keydown`,e=>{e.code===`Escape`&&(!Ky()||rb.open||(document.getElementById(`menu`)?.classList.contains(`hidden`)??!1)&&(e.preventDefault(),Jy()))});function Yy(){let e=Py.keys;Py=My();for(let t of[`chat`,`hud`,`varinha`,`painel`,`inventario`,`amigos`])$.rebind(e[t],Py.keys[t]);Zy()}var Xy=-1;function Zy(){if(!Qy||Py.raioRender===Xy)return;let e=Xy;Xy=Py.raioRender,Qy.send(JSON.stringify({type:`radius`,chunks:Xy})),Ry?.hud.marcar(`raio`,`${e<0?`join`:e} → ${Xy}`)}document.getElementById(`overlay-voltar`)?.addEventListener(`click`,()=>Jy()),document.getElementById(`overlay-config-btn`)?.addEventListener(`click`,()=>{let e=document.getElementById(`overlay-config-body`);e&&kv(e,Yy,Gy),Vy?.classList.add(`hidden`),Hy?.classList.remove(`hidden`)}),document.getElementById(`overlay-telacheia`)?.addEventListener(`click`,()=>{Wh()}),document.getElementById(`overlay-hud`)?.addEventListener(`click`,()=>{Ry?.hud.toggle()}),By?.addEventListener(`click`,e=>{let t=e.target instanceof HTMLElement?e.target.closest(`button`):null;t&&Km(t.classList.contains(`menu-back`)?`back`:`click`)}),window.addEventListener(`resize`,()=>{xy.aspect=window.innerWidth/window.innerHeight,xy.updateProjectionMatrix(),yy.setSize(window.innerWidth,window.innerHeight)});var Qy=null,$y=`?`,eb=null;function tb(){return new URLSearchParams(location.search).get(`nome`)??wv()}function nb(e){return e.trim().toLowerCase()===`/amigos`&&Fy.trocarParaAmigos()}var rb=new Qh(e=>{nb(e)||Qy?.send(JSON.stringify({type:`chat`,text:e}))},e=>{qy(),!e&&!Fy.algumAberto&&$.lock()});qy(),yy.domElement.addEventListener(`pointerdown`,()=>{$.touch&&rb.open&&rb.close()});var ib={tickAvgMs:0,tickMaxMs:0},ab=null,ob=0,sb=[];function cb(){let e=performance.now();ob>0&&(sb.push(e-ob),sb.length>300&&sb.shift()),ob=e}function lb(){let e=sb.length;if(e<2)return 0;let t=sb.reduce((e,t)=>e+t,0)/e,n=sb.reduce((e,n)=>e+(n-t)**2,0)/e;return Math.round(Math.sqrt(n))}var ub=null,db=`aluno`,fb=!1,pb=!1,mb=`criativo`,hb=!1;function gb(){return _d(mb)&&(db===`professor`||fb)}var _b=new Fv,vb=null;function yb(){return vb??=new Xv,vb}var bb=null,xb=(()=>{let e=new URLSearchParams(location.search).get(`vida`);if(e===null)return null;let[t,n,r]=e.split(`,`).map(Number);return t===void 0||!Number.isFinite(t)?null:{vida:t,...Number.isFinite(n)?{folego:n}:{},...Number.isFinite(r)?{fome:r}:{}}})();xb&&(yb().setVisivel(!0),yb().aplicar(xb));{let e=new URLSearchParams(location.search).get(`mochila`);if(e!==null){let t=[];e.split(`,`).forEach((e,n)=>{let[r,i]=e.split(`x`).map(Number);r===void 0||!Number.isInteger(r)||r<=0||t.push({slot:n,id:r,qtd:Number.isInteger(i)&&i>0?i:1})}),_b.travar(t)}}var Sb=[],Cb=!1,wb=!1,Tb=[],Eb=new Pv,Db=null,Ob=null,kb=[],Ab=new Set,jb=!1,Mb=!1,Nb=new Map;function Pb(){Fy.cp14?.update({regions:Sb,modo:Db?.modo??`sequencial`,objetivos:Db?.objetivos??[],grupos:kb,myGrupo:Ob})}function Fb(){Fy.amigos?.update({eu:tb(),equipe:Iy.equipe,convites:Iy.convites,enviados:Iy.enviados,online:[...new Set(Nb.values())].sort()})}function Ib(e){return e.porGrupo&&db!==`professor`?Ob===null?!1:e.porGrupo.find(e=>e.grupo===Ob)?.completo??!1:e.completo}function Lb(e){if(Db){for(let t of Db.objetivos)Ib(t)?Ab.has(t.id)||(Ab.add(t.id),e&&jb&&zm({kind:`objective_complete`})):Ab.delete(t.id);jb=!0,Eb.update(Db.modo,Db.objetivos,{grupo:Ob,professor:db===`professor`,painelKey:fv(Py.keys.painel)}),Ry?.applyObjectiveBoxes(Db.objetivos)}}var Rb=null;function zb(){let e=Rb;if(e){Rb=null;for(let t of e)Vb(t)}}function Bb(){Rb||(Rb=[],requestAnimationFrame(()=>requestAnimationFrame(zb)),setTimeout(zb,500))}function Vb(e){if(Rb){Rb.push(e);return}if(cb(),Ry||Ly.setFase(`mundo`),typeof e==`string`){let t=Dd(e);if(!t)return;if(t.type===`debug_stats`)ib={tickAvgMs:t.tickAvgMs,tickMaxMs:t.tickMaxMs},ab=t.regrasCelulasAvg===void 0?null:{celulasPorTick:t.regrasCelulasAvg,celulasMaxTick:t.regrasCelulasMax??0,mudancasPorTick:t.regrasMudancasAvg??0,aguaPorTick:t.regrasAguaAvg??0};else if(t.type===`block_changed`)Ry?.applyBlockChanged(t);else if(t.type===`blocks_filled`)Ry?.applyBlocksFilled(t);else if(t.type===`player_moved`)t.name&&Nb.get(t.id)!==t.name&&(Nb.set(t.id,t.name),zh([...new Set(Nb.values())]),Fb()),Ry?.applyPlayerMoved(t);else if(t.type===`player_left`)Nb.delete(t.id),zh([...new Set(Nb.values())]),Fb(),Ry?.applyPlayerLeft(t.id);else if(t.type===`spawn`)ub={x:t.x,y:t.y,z:t.z},db=t.papel??`aluno`;else if(t.type===`regions`)Sb=t.regions,Ry?.applyRegions(t.regions),Pb();else if(t.type===`objectives`)Db={modo:t.modo,objetivos:t.objetivos},Lb(!0),Pb();else if(t.type===`group`)Ob=t.grupo,Ab.clear(),Lb(!1),Pb();else if(t.type===`groups`)kb=t.grupos,Pb();else if(t.type===`quadros`)Ry?.applyQuadros(t.lista);else if(t.type===`quadro_changed`)Ry?.applyQuadroChanged(t);else if(t.type===`container`)Fy.container?.atualizar(t);else if(t.type===`container_fechado`)Fy.container?.fecharSemAvisar();else if(t.type===`claims`)Cb=t.ativo,t.ativo&&!wb&&(wb=!0,rb.addMessage(`jogo`,`tecla ${fv(Py.keys.amigos)} abre o painel de amigos — quem está no seu grupo constrói na sua área`)),Tb=t.claims,Ry?.applyClaims(t.claims);else if(t.type===`friends`)Iy={equipe:t.equipe,convites:t.convites,enviados:t.enviados},Fb();else if(t.type===`players`)Fy.jogadores?.update({conectados:t.conectados,banidos:t.banidos});else if(t.type===`mundo_trocando`)Ry?.iniciarTroca(t.nome),Bb();else if(t.type===`teleport`)Ry?.applyTeleport(t);else if(t.type===`time`)Ty===null&&wy.sync(t.hora,t.ciclo);else if(t.type===`vento`)Dy===null&&Ey.sync(t.dir,t.forca,t.ativo);else if(t.type===`voo`)fb=t.liberado,gb()||(pb=!1),rb.addMessage(`jogo`,t.liberado?`voo liberado — dois toques no espaço para voar (espaço sobe, agachar desce)`:`voo trancado pela turma`);else if(t.type===`modo`){let e=mb!==t.efetivo;mb=t.efetivo,Ny?.setCopiarDisponivel(t.efetivo!==`sobrevivencia`),Ny?.setMochilaRotulo(t.efetivo===`sobrevivencia`),Ry?.atualizarComerToque(),hb=t.pvp===!0,gb()||(pb=!1),xb===null&&(t.efetivo===`sobrevivencia`?yb().setVisivel(!0):vb?.setVisivel(!1)),t.efetivo===`criativo`&&_b.ativa&&(_b.desligar(),Ry?.aoMudarMochila()),e&&rb.addMessage(`jogo`,t.efetivo===`sobrevivencia`?`modo sobrevivência — não dá para voar`:`modo criativo`)}else if(t.type===`inventario`)_b.aplicar(t.slots),Ry?.aoMudarMochila();else if(t.type===`vida`){if(xb!==null)return;bb=t,yb().aplicar(t),Ry?.atualizarComerToque(),t.causa&&zm({kind:`dano`}),t.morreu&&(zm({kind:`morte`}),rb.addMessage(`jogo`,t.causa===`queda`?`você caiu de muito alto — voltou ao ponto de partida`:t.causa===`afogamento`?`você ficou sem ar — voltou ao ponto de partida`:t.causa===`fome`?`você passou fome demais — voltou ao ponto de partida`:t.causa===`sufocamento`?`você ficou soterrado — voltou ao ponto de partida`:t.causa===`pvp`?`você foi derrubado por outro jogador — voltou ao ponto de partida`:`você não sobreviveu — voltou ao ponto de partida`))}else t.type===`kicked`?(Km(`denied`),sessionStorage.setItem(`lj-erro`,t.reason),hy(),location.href=location.pathname):t.type===`join_denied`?(Km(`denied`),sessionStorage.setItem(`lj-erro`,`não deu pra entrar: ${t.reason}`),hy(),location.href=location.pathname):t.type===`chat`&&(rb.addMessage(t.author,t.text),t.author===`servidor`&&vy(t.text),zm({kind:`chat_message`}));return}let t=jd(e);if(t===809716300){Ry?.aplicarColunas(e);return}let n=()=>(Mb=t===kd,Mb?Md(e):Od(e));if(Ry){Ry.reloadWorld(n());return}Xb(n())}function Hb(e,t){Py=My(),Qy=e,Ly.abrir({host:$y,rede:!(e instanceof z_)}),Ly.observar(()=>({bytes:e.stats.bytesIn+e.stats.bytesOut,prontas:0,total:0,faltando:0,fila:0})),qy(),e.onMessage(Vb),$.onKey(Py.keys.chat,()=>{rb.open||Fy.podeAbrir&&(document.exitPointerLock(),rb.openInput())}),e.send(JSON.stringify({type:`join`,name:tb(),...t?{pin:t.pin}:{},...t?.codigo?{codigo:t.codigo}:{}})),Xy=-1,Zy()}function Ub(e,t){$y=e;let n=document.getElementById(`btn-sair`);n&&(n.textContent=`voltar ao menu`),Hb(new B_(e,t=>{Ry||!Ly.ativo||Ly.erro(t,()=>{sessionStorage.setItem(`lj-erro`,`${t} (${e})`),location.href=location.pathname})}),t)}function Wb(e,t){eb={id:e.id,name:e.name,createdAt:e.createdAt},$y=`web-worker (${e.name})`;let n=new z_(new Worker(new URL(`/assets/worker-Ca1HqY08.js`,``+import.meta.url),{type:`module`})),r=t??crypto.getRandomValues(new Uint32Array(1))[0]??1;n.init({save:e.data??void 0,seed:r,preset:e.preset,tamanho:e.tamanho,sobrevivencia:e.sobrevivencia}),Hb(n)}async function Gb(){if(!(Qy instanceof z_)||!eb)return;let e=await Qy.requestSave();await yv({...eb,updatedAt:Date.now(),data:e})}document.getElementById(`btn-sair`)?.addEventListener(`click`,()=>{hy(),Gb().finally(()=>location.reload())});var Kb=new URLSearchParams(location.search),qb=Kb.get(`server`);if(qb){let e=Kb.get(`codigo`);Ub(qb,{pin:Kb.get(`pin`)??``,...e?{codigo:e}:{}})}else jy?Wb({id:`bench-${Ym}`,name:`benchmark`,createdAt:0,data:null,preset:`normal`,tamanho:yf(Kb.get(`tamanho`)??`E`)},Ym):Ov({onPlayWorld:Wb,onPlayMulti:Ub});var Jb=3,Yb=class{activeConn;world;worldSeed;luz;mundoLazy;colunasCarregadas=new Set;frameCount=0;colunasRecebidas=0;materiais;chunkRenderer;aguaFx;torchGlow;colunasFaltando;regionRenderer;claimRenderer;quadroRenderer;objectiveBoxes;spawn;player;movimento;progresso;outros;highlight;lookDir=new B;hotbarUi;hud;target=null;alvoJogador=null;ultimoIdMirado=-1;bench=null;constructor(e,t){if(this.activeConn=t,my(()=>$.active),this.world=e.world,this.worldSeed=e.seed,this.mundoLazy=Mb,this.luz=new vg(this.world.dims,new URLSearchParams(location.search).has(`semluz`)),this.materiais=new F_,new URLSearchParams(location.search).has(`atlas`)){let e=this.materiais.canvas;e.style.cssText=`position:fixed;right:8px;top:8px;width:256px;image-rendering:pixelated;z-index:20;border:1px solid #000`,document.body.appendChild(e)}let n=new URLSearchParams(location.search),r=n.has(`semworker`),i=Number(n.get(`meshdepth`));this.chunkRenderer=new og(this.world,this.materiais.paraChunks,by,!r,Number.isFinite(i)&&i>0?i:void 0,this.luz.paraMesher),this.aguaFx=new Fm(by),this.mundoLazy||(this.luz.acenderTudo(this.world),this.chunkRenderer.buildAll()),this.torchGlow=new gy(by),this.torchGlow.setFromWorld(this.world),this.colunasFaltando=new sg(this.descartarColuna,(e,t)=>{this.activeConn.send(JSON.stringify({type:`pedir_coluna`,cx:e,cz:t}))}),this.regionRenderer=new ny(by),this.regionRenderer.setRegions(Sb),this.claimRenderer=new ny(by,16747546),this.drawClaims(Tb),this.quadroRenderer=new oy(by);let a=new cy;this.objectiveBoxes=new ny(by,3066993),Db&&this.updateObjectiveBoxes(Db.objetivos);let o=e=>this.activeConn.send(JSON.stringify({type:`chat`,text:e})),s=e=>{e?document.exitPointerLock():$.lock(),qy()};db===`professor`&&(Fy.jogadores=new Qv(o,s)),Fy.amigos=new Zv(o,s),Fb(),Fy.cp14=db===`professor`?new ey(o,s,()=>Fy.trocarParaJogadores()):new ty(o,s),Pb(),$.onKey(Py.keys.painel,()=>{if(Fy.podeAlternar(Fy.cp14)){if(db!==`professor`&&kb.length===0){rb.addMessage(`jogo`,`o professor ainda não criou grupos — o painel abre quando existirem`);return}Fy.cp14?.toggle()}}),$.onKey(Py.keys.amigos,()=>Fy.alternar(Fy.amigos)),db===`professor`&&rb.addMessage(`jogo`,`tecla ${fv(Py.keys.painel)} abre o painel de autoria`),this.spawn=ub??{x:this.world.sizeX/2+.5,y:Wu(this.world,Math.floor(this.world.sizeX/2),Math.floor(this.world.sizeZ/2)),z:this.world.sizeZ/2+.5},this.player=Yd(this.spawn.x,this.spawn.y,this.spawn.z),this.movimento=new I_($,()=>Py.keys),this.movimento.ancorar(this.player.pos),this.progresso=new R_(Ly,()=>({bytes:this.activeConn.stats.bytesIn+this.activeConn.stats.bytesOut,prontas:this.colunasCarregadas.size,buracos:this.colunasFaltando.tamanho,fila:this.chunkRenderer.filaPendente})),this.recalcularCarga(),this.progresso.observar(),Ly.setFase(this.mundoLazy?`mundo`:`malha`),this.outros=new yg(by),this.highlight=new Ti(new Wi(new Ri(1,1,1)),new pi({color:0})),this.highlight.visible=!1,by.add(this.highlight),this.hotbarUi=new _g(db,_b,this.materiais.canvas,{claimsAtivo:()=>Cb,setVarinhaToque:e=>Ny?.setVarinha(e),aoRedesenhar:()=>{Fy.mochila?.refresh(),Fy.container?.refresh(),this.atualizarComerToque()}}),this.hotbarUi.refresh(),Ch({nameOf:e=>this.hotbarUi.nome(e),sobrevivencia:()=>_b.ativa}),$.onKey(Py.keys.varinha,()=>this.hotbarUi.toggleVarinha());for(let e=0;e<9;e++)$.onKey(`Digit${e+1}`,()=>this.hotbarUi.selecionar(e));$.onWheel(e=>this.hotbarUi.ciclar(e)),Fy.mochila=new jh(this.hotbarUi.icons,()=>this.hotbarUi.meusBlocos,()=>({hotbar:this.hotbarUi.paleta,selected:this.hotbarUi.selected}),e=>this.hotbarUi.definirSlotLocal(e),e=>this.hotbarUi.selecionar(e),e=>{e?document.exitPointerLock():$.lock(),qy()},_b,(e,t,n)=>this.activeConn.send(JSON.stringify({type:`mover_item`,de:e,para:t,qtd:n})),e=>this.hotbarUi.nome(e),e=>this.activeConn.send(JSON.stringify({type:`fabricar`,receita:e}))),$.onKey(Py.keys.inventario,()=>Fy.alternar(Fy.mochila)),Fy.container=new Eh(this.hotbarUi.icons,_b,(e,t,n,r,i,a)=>this.activeConn.send(JSON.stringify({type:`mover_container`,x:e,y:t,z:n,de:r,para:i,qtd:a})),()=>this.activeConn.send(JSON.stringify({type:`fechar_container`})),e=>{e?(Fy.aoAbrirContainer(),document.exitPointerLock()):$.lock(),qy()});let c=(e,t)=>{this.activeConn.send(JSON.stringify({type:`wand_mark`,corner:e,x:t.x,y:t.y,z:t.z})),this.regionRenderer.setCorner(e,t.x,t.y,t.z)};$.onMouseButton(0,()=>{if(this.alvoJogador&&!this.hotbarUi.varinhaAtiva){this.activeConn.send(JSON.stringify({type:`atacar`,alvo:this.alvoJogador.id}));return}if(this.target){if(this.hotbarUi.varinhaAtiva){c(1,this.target);return}jl(this.hotbarUi.idNaMao()??-1)&&mb!==`criativo`||this.activeConn.send(JSON.stringify({type:`break_block`,x:this.target.x,y:this.target.y,z:this.target.z}))}}),$.onMouseButton(2,()=>{if(_b.ativa&&Ud(this.hotbarUi.idNaMao()??-1)){let e=this.target?K(this.world,this.target.x,this.target.y,this.target.z):null;if(e===null||!_y(e)){this.activeConn.send(JSON.stringify({type:`comer`,slot:this.hotbarUi.selected}));return}}if(!this.target)return;if(this.hotbarUi.varinhaAtiva){c(2,this.target);return}let e=K(this.world,this.target.x,this.target.y,this.target.z);if(_y(e)){this.activeConn.send(JSON.stringify({type:`use_block`,x:this.target.x,y:this.target.y,z:this.target.z}));return}{let e=this.hotbarUi.idNaMao();if(jl(e??-1)){let t=_b.ativa?{slot:this.hotbarUi.selected}:{};if(e===901)this.activeConn.send(JSON.stringify({type:`balde`,x:this.target.x+this.target.nx,y:this.target.y+this.target.ny,z:this.target.z+this.target.nz,encher:!1,...t})),_b.ativa||this.hotbarUi.definirSlotLocal(900);else{if(K(this.world,this.target.x,this.target.y,this.target.z)!==G.Agua)return;this.activeConn.send(JSON.stringify({type:`balde`,x:this.target.x,y:this.target.y,z:this.target.z,encher:!0,...t})),_b.ativa||this.hotbarUi.definirSlotLocal(901)}return}}if(iu(e)){let{x:e,y:t,z:n}=this.target;a.open(this.quadroRenderer.get(e,t,n),r=>{$.lock(),r&&this.activeConn.send(JSON.stringify({type:`quadro_set`,x:e,y:t,z:n,texto:r.texto,...r.imagem?{imagem:r.imagem}:{}}))});return}let t=this.hotbarUi.idNaMao();if(t===null)return;let n=jp(t,$.yaw,this.target.ny<0);this.activeConn.send(JSON.stringify({type:`place_block`,x:this.target.x+this.target.nx,y:this.target.y+this.target.ny,z:this.target.z+this.target.nz,blockId:n}))}),$.onMouseButton(1,()=>{if(!this.target||this.hotbarUi.varinhaAtiva||_b.ativa)return;let e=Mp(K(this.world,this.target.x,this.target.y,this.target.z));Tu(e)&&(Eu(e)&&db!==`professor`||this.hotbarUi.definirSlotLocal(e))}),this.hud=new Y_(yy,{checkpoint:14,worldChunks:this.world.dims,worldSeed:e.seed,serverHost:$y}),this.hud.contexto=()=>({x:this.player.pos.x,y:this.player.pos.y,z:this.player.pos.z,yaw:$.yaw,pitch:$.pitch,voando:pb&&gb(),noChao:this.player.onGround,raioRender:Py.raioRender,meshMsPorFrame:Py.meshMsPorFrame,pixelRatioCap:Py.pixelRatioCap,fov:Py.fov,nuvens:Py.nuvens,balanco:Py.balanco,distanciaTotal:this.movimento.distanciaTotal,colunasRecebidas:this.colunasRecebidas,bytesRecebidos:this.activeConn.stats.bytesIn}),this.hud.setRemesh({count:this.chunkRenderer.remeshCount,totalMs:this.chunkRenderer.remeshMsTotal,workerMs:this.chunkRenderer.remeshWorkerMsTotal,config:this.chunkRenderer.meshConfig,lastMs:this.chunkRenderer.lastRemeshMs,porCaminho:this.chunkRenderer.porCaminho}),this.hud.carga=()=>Ly.relatorio(),this.hud.marcar(`join`,`${this.world.dims.x}×${this.world.dims.z}×${this.world.dims.y} chunks · seed ${e.seed}`),$.onKey(Py.keys.hud,()=>this.hud.toggle()),document.getElementById(`hud-report`)?.addEventListener(`click`,()=>{this.hud.record(e=>{this.activeConn.send(JSON.stringify({type:`profile_report`,stats:e}))})}),Uh()&&(this.hotbarUi.habilitarToque(),Ny=new qh($,{keys:()=>Py.keys,quebrar:()=>$.press(0),colocar:()=>$.press(2),comer:()=>this.activeConn.send(JSON.stringify({type:`comer`,slot:this.hotbarUi.selected})),copiar:()=>$.press(1),inventario:()=>Fy.alternar(Fy.mochila),chat:()=>{rb.open||(document.exitPointerLock(),rb.openInput())},menu:()=>{$.touch=!1,Gy(),qy()},hud:()=>this.hud.toggle(),varinha:()=>this.hotbarUi.toggleVarinha(),amigos:()=>Fy.alternar(Fy.amigos)}),Ny.setVarinhaDisponivel(db===`professor`||Cb),Ny.setAmigosDisponivel(Cb),Ny.setCopiarDisponivel(mb!==`sobrevivencia`),Ny.setMochilaRotulo(mb===`sobrevivencia`),Ny.setScale(Py.uiScale),this.atualizarComerToque(),qy()),this.hud.extra=()=>{let e=$.mouseStats,t=this.player.pos,n=Math.floor(t.x),r=Math.floor(t.z),i=wf(n,r,this.worldSeed),a=Ou(i),o=ku(i),s=Math.min(Cf(n,r,this.worldSeed,this.world.sizeY),this.world.sizeY-2),c=s<=23?`areia (praia)`:s>=58&&a.neve?`neve`:s>=85?`pedra (chapada)`:a.topo===`grama`?o===G.GramaSeca?`grama seca`:o===G.GramaFria?`grama fria`:`grama`:`areia (caatinga)`;return`pos ${t.x.toFixed(1)} ${t.y.toFixed(1)} ${t.z.toFixed(1)}  bloco ${Math.floor(t.x)} ${Math.floor(t.y)} ${Math.floor(t.z)}\nbioma ${a.nome}  temp ${i.temp.toFixed(2)}  umid ${i.umid.toFixed(2)}  seed ${this.worldSeed}\nterreno h ${s}  topo ${c}  [praia ≤23 · neve ≥58 se o bioma neva · chapada ≥85]\nrelevo ${Nu(i).toFixed(2)} (teto do bioma ${a.relevo})\nmodo ${mb===`sobrevivencia`?`sobrevivência`:`criativo`}  voo ${gb()?pb?`voando`:`liberado`:`trancado`}`+(bb?`  vida ${bb.vida}/20`+(bb.fome===void 0?`  sem fome`:`  fome ${bb.fome}/20`):``)+`
mouse Δmáx ${e.maxDelta}px  descartados ${e.dropped} (último ${e.lastDropped}px)`};let l=new Vd;setInterval(()=>{let e={x:this.player.pos.x,y:this.player.pos.y,z:this.player.pos.z,yaw:$.yaw,pitch:$.pitch};l.aEnviar(e,performance.now())&&this.activeConn.send(JSON.stringify({type:`move`,...e}))},1e3/10),this.activeConn instanceof z_&&eb&&!jy&&(Gb(),setInterval(()=>void Gb(),3e4));let u={...t.stats};setInterval(()=>{let e=this.activeConn.stats;this.hud.net={msgsPerSec:e.msgsIn+e.msgsOut-(u.msgsIn+u.msgsOut),bytesPerSec:e.bytesIn+e.bytesOut-(u.bytesIn+u.bytesOut),tickAvgMs:ib.tickAvgMs,tickMaxMs:ib.tickMaxMs,jitterMs:lb()},this.hud.regras=ab,this.hud.stream={colunas:this.colunasCarregadas.size,fila:this.chunkRenderer.filaPendente,faltando:this.colunasFaltando.tamanho,repedidas:this.colunasFaltando.repedidas,ultimoLote:this.chunkRenderer.ultimoLote},this.hud.luz=this.luz.medidas,u={...e}},1e3)}async entregarPerfilDoBench(e,t){try{let t=await fetch(`/perfil`,{method:`POST`,headers:{"content-type":`application/json`},body:JSON.stringify(e)}),n=await t.json();if(!t.ok||!n.arquivo)throw Error(`resposta inesperada (${t.status})`);rb.addMessage(`jogo`,`benchmark concluído — perfil salvo no servidor: ${n.arquivo}`)}catch{let n=t?`bench-semvida`:`bench`;this.hud.baixar(e,n),rb.addMessage(`jogo`,`benchmark concluído — o perfil foi baixado (perf-${n}-*.json)`)}}iniciarBench(){if(!jy||this.bench)return;let e=this.bench=ih.paraMundo(jy,this.spawn,this.world.dims),t=jy;this.hud.setMeta({bench:e.meta()}),this.hud.marcar(`bench: início`,`${t.duracaoS}s · raio ${e.trajeto.raio}${t.semVida?` · sem vida ambiental`:``}`),zy=!0,window.__benchRodando=!0,pb=!0,qy(),e.iniciar(performance.now());let n=e.amostra(performance.now());this.player.pos.x=n.x,this.player.pos.y=n.y,this.player.pos.z=n.z,this.movimento.ancorar(this.player.pos),this.hud.record(e=>{zy=!1,window.__benchRodando=!1,qy(),window.__benchPerfil=e,this.entregarPerfilDoBench(e,t.semVida)},t.duracaoS*1e3)}iniciar(){let e=performance.now();yy.setAnimationLoop(()=>{let t=performance.now(),n=t-e;e=t;let r=Math.min(n/1e3,.05),i=this.movimento.comando(t,{voando:pb,podeVoar:gb()});pb=i.voando;let a=!0;if(this.chunkRenderer.modoCarga=Ly.ativo,this.mundoLazy){{let e=this.luz.drenar(this.world,Ly.ativo?16:Jb,e=>this.colunasCarregadas.has(e));for(let t of e)this.chunkRenderer.enfileirarColuna(t.cx,t.cz)}this.chunkRenderer.processarFila(Py.meshMsPorFrame,(e,t)=>{this.colunasCarregadas.delete(t*this.world.dims.x+e)});let{cx:e,cz:n}=Fd(this.world.dims,this.player.pos.x,this.player.pos.z);if(a=this.colunasCarregadas.has(Rd(this.world.dims,e,n)),(this.frameCount=(this.frameCount+1)%60)==0){for(let t of this.colunasCarregadas){let{cx:r,cz:i}=zd(this.world.dims,t);Ld(r,i,e,n,Py.raioRender)||(this.colunasCarregadas.delete(t),this.descartarColuna(r,i))}this.colunasFaltando.varrer(e,n,t,this.world.dims,Py.raioRender,this.colunasCarregadas);let r=Py.raioRender*16;this.claimRenderer.cularPorDistancia(this.player.pos.x,this.player.pos.z,r),this.regionRenderer.cularPorDistancia(this.player.pos.x,this.player.pos.z,r)}}else this.chunkRenderer.processarFila(Ly.ativo?50:Py.meshMsPorFrame);if(Ly.ativo&&this.progresso.raioCompleto&&this.luz.filaVazia&&this.chunkRenderer.filaPendente===0&&Ly.concluir(),this.bench?.ativo){let e=this.bench.amostra(t);this.player.pos.x=e.x,this.player.pos.y=e.y,this.player.pos.z=e.z,this.player.vel.x=this.player.vel.y=this.player.vel.z=0,$.yaw=e.yaw,$.pitch=e.pitch,this.bench.terminou(t)&&(this.bench.parar(),this.hud.marcar(`bench: fim`))}let o=this.player.pos.y;a&&!this.bench?.ativo&&sf(this.world,this.player,i,r),this.movimento.aposOPasso(r,this.player,o,i),this.player.pos.y<-16&&this.respawn(),this.outros.interpolar(r);let s=Py.fov*(this.player.sprinting?1.1:1);Math.abs(xy.fov-s)>.01&&(xy.fov+=(s-xy.fov)*(1-Math.exp(-r*20)),xy.updateProjectionMatrix()),xy.position.set(this.player.pos.x,this.player.pos.y+this.movimento.alturaOlho,this.player.pos.z),xy.rotation.set($.pitch,$.yaw,0),xy.getWorldDirection(this.lookDir),this.target=$.active?um(this.world,xy.position.x,xy.position.y,xy.position.z,this.lookDir.x,this.lookDir.y,this.lookDir.z,5,this.hotbarUi.idNaMao()===900):null;let c=this.target?K(this.world,this.target.x,this.target.y,this.target.z):null;if(c!==this.ultimoIdMirado&&(this.ultimoIdMirado=c??-1,Ny?.setModoInteragir(c!==null&&_y(c))),this.alvoJogador=$.active&&mb===`sobrevivencia`&&hb?cm(xy.position.x,xy.position.y,xy.position.z,this.lookDir.x,this.lookDir.y,this.lookDir.z,this.outros.alvosParaMira(),5):null,this.alvoJogador&&this.target){let e=Math.hypot(this.target.x+.5-xy.position.x,this.target.y+.5-xy.position.y,this.target.z+.5-xy.position.z);this.alvoJogador.dist>e&&(this.alvoJogador=null)}if(Uy?.classList.toggle(`alvo`,this.alvoJogador!==null),this.highlight.visible=this.target!==null&&this.alvoJogador===null,this.target){let[e,t,n,r,i,a]=dp(K(this.world,this.target.x,this.target.y,this.target.z));this.highlight.position.set(this.target.x+(e+r)/2,this.target.y+(t+i)/2,this.target.z+(n+a)/2),this.highlight.scale.set(r-e+.004,i-t+.004,a-n+.004)}this.hud.setRemesh({count:this.chunkRenderer.remeshCount,totalMs:this.chunkRenderer.remeshMsTotal,workerMs:this.chunkRenderer.remeshWorkerMsTotal,config:this.chunkRenderer.meshConfig,lastMs:this.chunkRenderer.lastRemeshMs,porCaminho:this.chunkRenderer.porCaminho}),Ey.update(r),wy.update(r,Ey),this.materiais.atualizar(r,Ey,wy.nivelCeu,Py.balanco),this.aguaFx.update(this.world,xy.position.x,xy.position.y,xy.position.z);let l=performance.now();this.hud.gpuInicio(),yy.render(by,xy),this.hud.gpuFim(),this.hud.frame(n,performance.now()-l)}),Kb.has(`hud`)&&this.hud.toggle(),new URLSearchParams(location.search).has(`painel`)&&Fy.cp14?.toggle(),new URLSearchParams(location.search).has(`inv`)&&Fy.mochila?.toggle(),new URLSearchParams(location.search).has(`amigos`)&&Fy.amigos?.toggle(),Kb.has(`touch`)&&Jy()}descartarColuna=(e,t)=>{this.chunkRenderer.descartarColuna(e,t),this.torchGlow.descartarColuna(e,t),this.luz.descartar(e,t);for(let n=0;n<this.world.dims.y;n++)this.world.chunks[(n*this.world.dims.z+t)*this.world.dims.x+e]=void 0};drawClaims=e=>{this.claimRenderer.setRegions(e.map(e=>({nome:e.dono,min:e.min,max:e.max})))};updateObjectiveBoxes=e=>{let t=[];for(let n of e)if(n.porGrupo){let e=!1;for(let r of n.porGrupo){let i=Ob!==null&&r.grupo===Ob;(db===`professor`||i)&&r.ativo&&!r.completo&&(t.push({nome:`${n.regiao} g${r.grupo}`,min:r.min,max:r.max}),e=!0)}e&&n.kind===`construir`&&t.push({nome:`modelo ${n.regiao}`,min:n.min,max:n.max})}else n.ativo&&!n.completo&&t.push({nome:n.regiao,min:n.min,max:n.max});this.objectiveBoxes.setRegions(t)};recalcularCarga=()=>this.progresso.recalcular(this.world.dims,this.player.pos.x,this.player.pos.z,Py.raioRender,this.mundoLazy);respawn(){this.player.pos.x=this.spawn.x,this.player.pos.y=this.spawn.y,this.player.pos.z=this.spawn.z,this.player.vel.x=this.player.vel.y=this.player.vel.z=0}aplicarColunas(e){let t=[];try{t=Pd(e,this.world)}catch(e){console.warn(`[streaming] lote de colunas inválido, será repedido:`,e);return}for(let{cx:e,cz:n}of t){let t=n*this.world.dims.x+e;this.colunasCarregadas.add(t),this.colunasFaltando.chegou(t),this.luz.enfileirar(e,n,this.world.dims.x),this.torchGlow.varrerColuna(this.world,e,n)}this.colunasRecebidas+=t.length}applyRegions(e){this.regionRenderer.setRegions(e),this.regionRenderer.clearCorners()}applyClaims(e){this.drawClaims(e),this.regionRenderer.clearCorners(),this.hotbarUi.revalidarVarinha(),Ny?.setVarinhaDisponivel(db===`professor`||Cb),Ny?.setAmigosDisponivel(Cb),this.hotbarUi.refresh()}applyQuadros(e){this.quadroRenderer.setAll(e,this.world)}applyQuadroChanged(e){this.quadroRenderer.aplicar(e,this.world)}applyObjectiveBoxes(e){this.updateObjectiveBoxes(e)}iniciarTroca(e){this.progresso.indeterminar(),Ly.abrir({host:$y,rede:!(this.activeConn instanceof z_),titulo:`trocando de aula`,alvo:e}),this.progresso.observar(),Ly.setFase(`preparando`),this.hud.setFase(`carregando`),this.hud.marcar(`troca de aula`,e),qy()}reloadWorld(e){this.world=e.world,this.worldSeed=e.seed,this.mundoLazy=Mb,this.colunasCarregadas=new Set,this.colunasFaltando.limpar(),this.luz.trocarMundo(this.world.dims),this.mundoLazy||this.luz.acenderTudo(this.world),this.chunkRenderer.trocarMundo(this.world,!this.mundoLazy,this.luz.paraMesher),this.torchGlow.setFromWorld(this.world),Sb=[],this.regionRenderer.setRegions([]),this.regionRenderer.clearCorners(),this.quadroRenderer.setAll([],this.world),Db=null,this.updateObjectiveBoxes([]),Eb.update(`livre`,[],{grupo:null,professor:db===`professor`,painelKey:fv(Py.keys.painel)}),Ab.clear(),jb=!1,kb=[],Ob=null,Pb(),this.spawn=ub??this.spawn,this.respawn(),rb.addMessage(`jogo`,`a aula mudou — mundo novo carregado`),Xy=-1,Zy(),this.hud.setMeta({worldChunks:this.world.dims,worldSeed:e.seed}),this.recalcularCarga(),Ly.abrir({host:$y,rede:!(this.activeConn instanceof z_),titulo:`trocando de aula`}),this.progresso.observar(),Ly.setFase(this.mundoLazy?`mundo`:`malha`),this.hud.setFase(`carregando`),qy()}applyTeleport(e){this.player.pos.x=e.x,this.player.pos.y=e.y,this.player.pos.z=e.z,this.player.vel.x=this.player.vel.y=this.player.vel.z=0,$.yaw=ky??e.yaw,$.pitch=Ay??e.pitch}applyBlockChanged(e){Uu(this.world,e.x,e.y,e.z,e.blockId),this.chunkRenderer.remeshBlock(e.x,e.y,e.z),this.chunkRenderer.remeshSujos(this.luz.aoMudarBloco(this.world,e.x,e.y,e.z)),this.torchGlow.onBlockChanged(e.x,e.y,e.z,e.blockId),this.quadroRenderer.onBlockChanged(e.x,e.y,e.z,e.blockId,this.world),zm(e.blockId===G.Air?{kind:`block_broken`}:{kind:`block_placed`,blockId:e.blockId})}applyBlocksFilled(e){for(let t=e.y0;t<=e.y1;t++)for(let n=e.z0;n<=e.z1;n++)for(let r=e.x0;r<=e.x1;r++)Uu(this.world,r,t,n,e.blockId);let t={x:e.x0,y:e.y0,z:e.z0},n={x:e.x1,y:e.y1,z:e.z1};for(let t=Math.max(0,e.x0/16|0);t<=Math.min(this.world.dims.x-1,e.x1/16|0);t++)for(let n=Math.max(0,e.z0/16|0);n<=Math.min(this.world.dims.z-1,e.z1/16|0);n++)this.chunkRenderer.remeshSujos(this.luz.aoChegarColuna(this.world,t,n));this.chunkRenderer.remeshBox(t,n),this.torchGlow.onRegionFilled(t,n,e.blockId),this.quadroRenderer.validarTodos(this.world),zm(e.blockId===G.Air?{kind:`block_broken`}:{kind:`block_placed`,blockId:e.blockId})}applyPlayerMoved(e){this.outros.aoMover(e)}applyPlayerLeft(e){this.outros.aoSair(e)}aoMudarMochila(){this.hotbarUi.refresh(),this.atualizarComerToque()}atualizarComerToque(){let e=this.hotbarUi.idNaMao(),t=bb?.fome,n=_b.ativa&&e!==null&&Ud(e)&&t!==void 0&&t<20;Ny?.setModoComer(n)}};function Xb(e){let t=Qy;t&&(Ry=new Yb(e,t),Ry.iniciar())}