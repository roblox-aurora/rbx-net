(window.webpackJsonp=window.webpackJsonp||[]).push([[5],{154:function(e,t,n){"use strict";n.d(t,"a",(function(){return p})),n.d(t,"b",(function(){return f}));var r=n(0),a=n.n(r);function c(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){c(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},c=Object.keys(e);for(r=0;r<c.length;r++)n=c[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var c=Object.getOwnPropertySymbols(e);for(r=0;r<c.length;r++)n=c[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var u=a.a.createContext({}),s=function(e){var t=a.a.useContext(u),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},p=function(e){var t=s(e.components);return a.a.createElement(u.Provider,{value:t},e.children)},d={inlineCode:"code",wrapper:function(e){var t=e.children;return a.a.createElement(a.a.Fragment,{},t)}},b=a.a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,c=e.originalType,i=e.parentName,u=l(e,["components","mdxType","originalType","parentName"]),p=s(n),b=r,f=p["".concat(i,".").concat(b)]||p[b]||d[b]||c;return n?a.a.createElement(f,o(o({ref:t},u),{},{components:n})):a.a.createElement(f,o({ref:t},u))}));function f(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var c=n.length,i=new Array(c);i[0]=b;var o={};for(var l in t)hasOwnProperty.call(t,l)&&(o[l]=t[l]);o.originalType=e,o.mdxType="string"==typeof e?e:r,i[1]=o;for(var u=2;u<c;u++)i[u]=n[u];return a.a.createElement.apply(null,i)}return a.a.createElement.apply(null,n)}b.displayName="MDXCreateElement"},155:function(e,t,n){"use strict";function r(e){var t,n,a="";if("string"==typeof e||"number"==typeof e)a+=e;else if("object"==typeof e)if(Array.isArray(e))for(t=0;t<e.length;t++)e[t]&&(n=r(e[t]))&&(a&&(a+=" "),a+=n);else for(t in e)e[t]&&(a&&(a+=" "),a+=t);return a}t.a=function(){for(var e,t,n=0,a="";n<arguments.length;)(e=arguments[n++])&&(t=r(e))&&(a&&(a+=" "),a+=t);return a}},156:function(e,t,n){"use strict";var r=n(0),a=n.n(r),c=n(158),i=n(155),o=n(56),l=n.n(o),u=37,s=39;t.a=function(e){var t=e.lazy,n=e.block,o=e.defaultValue,p=e.values,d=e.groupId,b=e.className,f=Object(c.a)(),m=f.tabGroupChoices,y=f.setTabGroupChoices,h=Object(r.useState)(o),v=h[0],g=h[1],O=r.Children.toArray(e.children);if(null!=d){var j=m[d];null!=j&&j!==v&&p.some((function(e){return e.value===j}))&&g(j)}var w=function(e){g(e),null!=d&&y(d,e)},k=[];return a.a.createElement("div",null,a.a.createElement("ul",{role:"tablist","aria-orientation":"horizontal",className:Object(i.a)("tabs",{"tabs--block":n},b)},p.map((function(e){var t=e.value,n=e.label;return a.a.createElement("li",{role:"tab",tabIndex:0,"aria-selected":v===t,className:Object(i.a)("tabs__item",l.a.tabItem,{"tabs__item--active":v===t}),key:t,ref:function(e){return k.push(e)},onKeyDown:function(e){!function(e,t,n){switch(n.keyCode){case s:!function(e,t){var n=e.indexOf(t)+1;e[n]?e[n].focus():e[0].focus()}(e,t);break;case u:!function(e,t){var n=e.indexOf(t)-1;e[n]?e[n].focus():e[e.length-1].focus()}(e,t)}}(k,e.target,e)},onFocus:function(){return w(t)},onClick:function(){w(t)}},n)}))),t?Object(r.cloneElement)(O.filter((function(e){return e.props.value===v}))[0],{className:"margin-vert--md"}):a.a.createElement("div",{className:"margin-vert--md"},O.map((function(e,t){return Object(r.cloneElement)(e,{key:t,hidden:e.props.value!==v})}))))}},157:function(e,t,n){"use strict";var r=n(3),a=n(0),c=n.n(a);t.a=function(e){var t=e.children,n=e.hidden,a=e.className;return c.a.createElement("div",Object(r.a)({role:"tabpanel"},{hidden:n,className:a}),t)}},158:function(e,t,n){"use strict";var r=n(0),a=n(159);t.a=function(){var e=Object(r.useContext)(a.a);if(null==e)throw new Error("`useUserPreferencesContext` is used outside of `Layout` Component.");return e}},159:function(e,t,n){"use strict";var r=n(0),a=Object(r.createContext)(void 0);t.a=a},160:function(e,t,n){"use strict";n.d(t,"a",(function(){return o})),n.d(t,"b",(function(){return l})),n.d(t,"c",(function(){return u}));var r=n(0),a=n.n(r),c=n(156),i=n(157),o="ts",l="code",u=[{label:"roblox-ts",value:"ts"},{label:"luau",value:"luau"}];t.d=function(e){var t=e.children,n=t[0],r=t[1];return console.log(n,r),a.a.createElement(c.a,{defaultValue:o,groupId:l,values:u},a.a.createElement(i.a,{value:"ts"},n),a.a.createElement(i.a,{value:"luau"},r))}},73:function(e,t,n){"use strict";n.r(t),n.d(t,"frontMatter",(function(){return u})),n.d(t,"metadata",(function(){return s})),n.d(t,"toc",(function(){return p})),n.d(t,"default",(function(){return b}));var r=n(3),a=n(7),c=(n(0),n(154)),i=n(160),o=n(156),l=n(157),u={id:"typecheck",title:"Runtime Type Checking",sidebar_label:"Enforcing types at runtime",slug:"/middleware/types"},s={unversionedId:"middleware/typecheck",id:"middleware/typecheck",isDocsHomePage:!1,title:"Runtime Type Checking",description:"It's important when you recieve events or calls from the server that you ensure the types are correct, otherwise unwanted errors may pop up.",source:"@site/docs/middleware/typecheck.md",slug:"/middleware/types",permalink:"/docs/3.0/middleware/types",editUrl:"https://github.com/roblox-aurora/rbx-net/edit/main/docs/docs/middleware/typecheck.md",version:"current",sidebar_label:"Enforcing types at runtime",sidebar:"docs",previous:{title:"Rate limiting your remotes",permalink:"/docs/3.0/middleware/rate-limit"},next:{title:"Logging",permalink:"/docs/3.0/middleware/logging"}},p=[{value:"Using a library like t",id:"using-a-library-like-t",children:[]}],d={toc:p};function b(e){var t=e.components,n=Object(a.a)(e,["components"]);return Object(c.b)("wrapper",Object(r.a)({},d,n,{components:t,mdxType:"MDXLayout"}),Object(c.b)("p",null,"It's important when you recieve events or calls from the server that you ensure the types are correct, otherwise unwanted errors may pop up."),Object(c.b)("p",null,"If you want to ensure the types you're recieving from the client ",Object(c.b)("em",{parentName:"p"},"are")," the types you're expecting, you can use the ",Object(c.b)("a",Object(r.a)({parentName:"p"},{href:"../api/middleware#typechecking"}),Object(c.b)("inlineCode",{parentName:"a"},"Net.Middleware.TypeChecking"))," middleware."),Object(c.b)("p",null,"This middleware just takes type checking functions."),Object(c.b)("h2",{id:"using-a-library-like-t"},"Using a library like ",Object(c.b)("a",Object(r.a)({parentName:"h2"},{href:"https://github.com/osyrisrblx/t"}),Object(c.b)("inlineCode",{parentName:"a"},"t"))),Object(c.b)("p",null,"The type checking middleware is created as such:"),Object(c.b)(o.a,{defaultValue:i.a,groupId:i.b,values:i.c,mdxType:"Tabs"},Object(c.b)(l.a,{value:"ts",mdxType:"TabItem"},Object(c.b)("pre",null,Object(c.b)("code",Object(r.a)({parentName:"pre"},{className:"language-ts"}),"Net.Middleware.TypeCheck(t.string)\n"))),Object(c.b)(l.a,{value:"luau",mdxType:"TabItem"},Object(c.b)("pre",null,Object(c.b)("code",Object(r.a)({parentName:"pre"},{className:"language-lua"}),"local t = require(ReplicatedStorage.Libs.t)\n  \nlocal Remotes = Net.CreateDefinitions({\n    Click = Net.Definitions.ClientToServerEvent({\n        Net.Middleware.TypeChecking(t.Vector3, t.string)\n    })\n})\n")),Object(c.b)("p",null,"  or"),Object(c.b)("pre",null,Object(c.b)("code",Object(r.a)({parentName:"pre"},{className:"language-lua"}),'local function typeCheckString(check: any)\n    return typeof(check) == "string"\nend\n\nlocal function typeCheckVector3(check: any)\n    return typeof(check) == "Vector3"\nend\n\nlocal Remotes = Net.CreateDefinitions({\n    Click = Net.Definitions.ClientToServerEvent({\n        Net.Middleware.TypeChecking(typeCheckVector3, typeCheckString)\n    })\n})\n')))))}b.isMDXComponent=!0}}]);