import{q as m}from"./a-14d94dc6.js";import"./index-0d8158eb.js";import"./layout-9e52ad07.js";import"./use-notification-56391e62.js";import"./index-aba65090.js";import"./error-messages-d2d0bb30.js";import"./index.esm-07f1e6d3.js";import"./index-845e4de2.js";import"./index-c0b93546.js";import"./index-9af9f9f3.js";function d(t){var r=t;return!!(r.ctrlKey||r.shiftKey||r.metaKey||r.button&&r.button==1)}function b(t,r){return!!(t.target==="_blank"&&r)}function D(t,r,e,i){var f=this,u=[];return t?(t instanceof Element?u=[t]:"toArray"in t?u=t.toArray():u=t,u.forEach(function(n){n.addEventListener("click",function(a){var c,o,s=r instanceof Function?r(n):r,v=e instanceof Function?e(n):e,h=n.getAttribute("href")||n.getAttributeNS("http://www.w3.org/1999/xlink","href")||n.getAttribute("xlink:href")||((c=n.getElementsByTagName("a")[0])===null||c===void 0?void 0:c.getAttribute("href")),l=m(f.track(s,v,i??{}),(o=f.settings.timeout)!==null&&o!==void 0?o:500);!b(n,h)&&!d(a)&&h&&(a.preventDefault?a.preventDefault():a.returnValue=!1,l.catch(console.error).then(function(){window.location.href=h}).catch(console.error))},!1)}),this):this}function L(t,r,e,i){var f=this;if(!t)return this;t instanceof HTMLFormElement&&(t=[t]);var u=t;return u.forEach(function(n){if(!(n instanceof Element))throw new TypeError("Must pass HTMLElement to trackForm/trackSubmit.");var a=function(o){var s;o.preventDefault?o.preventDefault():o.returnValue=!1;var v=r instanceof Function?r(n):r,h=e instanceof Function?e(n):e,l=m(f.track(v,h,i??{}),(s=f.settings.timeout)!==null&&s!==void 0?s:500);l.catch(console.error).then(function(){n.submit()}).catch(console.error)},c=window.jQuery||window.Zepto;c?c(n).submit(a):n.addEventListener("submit",a,!1)}),this}export{L as form,D as link};
