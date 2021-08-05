(window.webpackJsonp=window.webpackJsonp||[]).push([[41],{113:function(e,n,t){"use strict";t.r(n),t.d(n,"frontMatter",(function(){return l})),t.d(n,"metadata",(function(){return i})),t.d(n,"toc",(function(){return o})),t.d(n,"default",(function(){return u}));var r=t(3),c=t(7),a=(t(0),t(131)),l={id:"net.client",title:"Net.Client Namespace",sidebar_label:"Net.Client",slug:"/api/client"},i={unversionedId:"api/net.client",id:"api/net.client",isDocsHomePage:!1,title:"Net.Client Namespace",description:"This contains all the client-related code relating to Net",source:"@site/docs/api/net-client.md",slug:"/api/client",permalink:"/docs/2.1/api/client",editUrl:"https://github.com/roblox-aurora/rbx-net/edit/main/docs/docs/api/net-client.md",version:"current",sidebar_label:"Net.Client",sidebar:"docs",previous:{title:"Net.Server Namespace",permalink:"/docs/2.1/api/server"},next:{title:"Net.Definitions Namespace",permalink:"/docs/2.1/api/definitions"}},o=[{value:"Event",id:"event",children:[{value:"SendToServer",id:"sendtoserver",children:[]},{value:"Connect",id:"connect",children:[]}]},{value:"Function",id:"function",children:[{value:"CallServerAsync",id:"callserverasync",children:[]}]},{value:"AsyncFunction",id:"asyncfunction",children:[{value:"CallServerAsync",id:"callserverasync-1",children:[]},{value:"SetCallback",id:"setcallback",children:[]},{value:"SetCallTimeout",id:"setcalltimeout",children:[]},{value:"GetCalllTimeout",id:"getcallltimeout",children:[]}]},{value:"CrossServerEvent",id:"crossserverevent",children:[{value:"Connect",id:"connect-1",children:[]}]}],s={toc:o};function u(e){var n=e.components,t=Object(c.a)(e,["components"]);return Object(a.b)("wrapper",Object(r.a)({},s,t,{components:n,mdxType:"MDXLayout"}),Object(a.b)("p",null,"This contains all the client-related code relating to Net"),Object(a.b)("h2",{id:"event"},"Event"),Object(a.b)("pre",null,Object(a.b)("code",Object(r.a)({parentName:"pre"},{className:"language-ts"}),"class ClientEvent<ConnectArgs, CallArgs> {\n    constructor(name: string);\n    SendToServer(...args: CallArguments): void;\n    Connect(callback: (...args: ConnectArgs) => void): RBXScriptConnection;\n}\n")),Object(a.b)("h3",{id:"sendtoserver"},"SendToServer"),Object(a.b)("h3",{id:"connect"},"Connect"),Object(a.b)("h2",{id:"function"},"Function"),Object(a.b)("pre",null,Object(a.b)("code",Object(r.a)({parentName:"pre"},{className:"language-ts"}),"class ClientFunction<CallArgs, ServerReturnType> {\n    constructor(name: string);\n    CallServerAsync(...args: CallArgs): Promise<ServerReturnType>;\n}\n")),Object(a.b)("h3",{id:"callserverasync"},"CallServerAsync"),Object(a.b)("h2",{id:"asyncfunction"},"AsyncFunction"),Object(a.b)("pre",null,Object(a.b)("code",Object(r.a)({parentName:"pre"},{className:"language-ts"}),"class ClientAsyncFunction<CallbackArgs, CallArgs, ServerReturnType> {\n    constructor(name: string);\n    CallServerAsync(...args: CallArgs): Promise<ServerReturnType>;\n    SetCallback(callback: (...args: CallbackArgs) => any): void;\n    SetCallTimeout(timeout: number): void;\n    GetCallTimeout(): number;\n}\n")),Object(a.b)("h3",{id:"callserverasync-1"},"CallServerAsync"),Object(a.b)("h3",{id:"setcallback"},"SetCallback"),Object(a.b)("h3",{id:"setcalltimeout"},"SetCallTimeout"),Object(a.b)("h3",{id:"getcallltimeout"},"GetCalllTimeout"),Object(a.b)("h2",{id:"crossserverevent"},"CrossServerEvent"),Object(a.b)("pre",null,Object(a.b)("code",Object(r.a)({parentName:"pre"},{className:"language-ts"}),"class CrossServerEvent {\n    constructor(name: string);\n    Connect(callback: (...args: unknown[]) => void): void;\n}\n")),Object(a.b)("h3",{id:"connect-1"},"Connect"))}u.isMDXComponent=!0},131:function(e,n,t){"use strict";t.d(n,"a",(function(){return d})),t.d(n,"b",(function(){return v}));var r=t(0),c=t.n(r);function a(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function l(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function i(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?l(Object(t),!0).forEach((function(n){a(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):l(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function o(e,n){if(null==e)return{};var t,r,c=function(e,n){if(null==e)return{};var t,r,c={},a=Object.keys(e);for(r=0;r<a.length;r++)t=a[r],n.indexOf(t)>=0||(c[t]=e[t]);return c}(e,n);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)t=a[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(c[t]=e[t])}return c}var s=c.a.createContext({}),u=function(e){var n=c.a.useContext(s),t=n;return e&&(t="function"==typeof e?e(n):i(i({},n),e)),t},d=function(e){var n=u(e.components);return c.a.createElement(s.Provider,{value:n},e.children)},b={inlineCode:"code",wrapper:function(e){var n=e.children;return c.a.createElement(c.a.Fragment,{},n)}},p=c.a.forwardRef((function(e,n){var t=e.components,r=e.mdxType,a=e.originalType,l=e.parentName,s=o(e,["components","mdxType","originalType","parentName"]),d=u(t),p=r,v=d["".concat(l,".").concat(p)]||d[p]||b[p]||a;return t?c.a.createElement(v,i(i({ref:n},s),{},{components:t})):c.a.createElement(v,i({ref:n},s))}));function v(e,n){var t=arguments,r=n&&n.mdxType;if("string"==typeof e||r){var a=t.length,l=new Array(a);l[0]=p;var i={};for(var o in n)hasOwnProperty.call(n,o)&&(i[o]=n[o]);i.originalType=e,i.mdxType="string"==typeof e?e:r,l[1]=i;for(var s=2;s<a;s++)l[s]=t[s];return c.a.createElement.apply(null,l)}return c.a.createElement.apply(null,t)}p.displayName="MDXCreateElement"}}]);