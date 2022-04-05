(window.webpackJsonp=window.webpackJsonp||[]).push([[75],{146:function(e,t,n){"use strict";n.r(t),n.d(t,"frontMatter",(function(){return u})),n.d(t,"metadata",(function(){return s})),n.d(t,"toc",(function(){return m})),n.d(t,"default",(function(){return d}));var a=n(3),r=n(7),i=(n(0),n(154)),o=n(160),l=n(156),c=n(157),u={id:"ratelimit",title:"Rate limiting your remotes",sidebar_label:"Rate limiting",slug:"/middleware/rate-limit"},s={unversionedId:"middleware/ratelimit",id:"version-2.1.x/middleware/ratelimit",isDocsHomePage:!1,title:"Rate limiting your remotes",description:"Your event or AsyncFunction may perform an intensive task that you don't want players to be able to invoke every second (and possibly crash your game)",source:"@site/versioned_docs/version-2.1.x/middleware/ratelimit.md",slug:"/middleware/rate-limit",permalink:"/docs/2.1/middleware/rate-limit",editUrl:"https://github.com/roblox-aurora/rbx-net/edit/main/docs/versioned_docs/version-2.1.x/middleware/ratelimit.md",version:"2.1.x",sidebar_label:"Rate limiting",sidebar:"docs",previous:{title:"Wrapping Custom Player Objects",permalink:"/docs/2.1/custom-player-objects"},next:{title:"Runtime Type Checking",permalink:"/docs/2.1/middleware/types"}},m=[{value:"Limiting to a certain amount of requests",id:"limiting-to-a-certain-amount-of-requests",children:[]},{value:"Custom Error Handling",id:"custom-error-handling",children:[]}],b={toc:m};function d(e){var t=e.components,n=Object(r.a)(e,["components"]);return Object(i.b)("wrapper",Object(a.a)({},b,n,{components:t,mdxType:"MDXLayout"}),Object(i.b)("p",null,"Your event or AsyncFunction may perform an intensive task that you don't want players to be able to invoke every second (and possibly crash your game)"),Object(i.b)("p",null,"A way you can get around this is by using the ",Object(i.b)("a",Object(a.a)({parentName:"p"},{href:"../api/middleware#ratelimit"}),Object(i.b)("inlineCode",{parentName:"a"},"Net.Middleware.RateLimit"))," middleware. This is a built in."),Object(i.b)("h2",{id:"limiting-to-a-certain-amount-of-requests"},"Limiting to a certain amount of requests"),Object(i.b)("p",null,"The rate limiter middleware is created as such:"),Object(i.b)(l.a,{defaultValue:o.a,groupId:o.b,values:o.c,mdxType:"Tabs"},Object(i.b)(c.a,{value:"ts",mdxType:"TabItem"},Object(i.b)("pre",null,Object(i.b)("code",Object(a.a)({parentName:"pre"},{className:"language-ts"}),"Net.Middleware.RateLimit({\n    MaxRequestsPerMinute: 1 // This can be the amount of requests you want to limit per minute\n})\n"))),Object(i.b)(c.a,{value:"luau",mdxType:"TabItem"},Object(i.b)("pre",null,Object(i.b)("code",Object(a.a)({parentName:"pre"},{className:"language-lua"}),"Net.Middleware.RateLimit({\n    MaxRequestsPerMinute = 1 -- This can be the amount of requests you want to limit per minute\n})\n")))),Object(i.b)("p",null,"Then you pass it to a constructor for a server object, or a definition:"),Object(i.b)(l.a,{defaultValue:o.a,groupId:o.b,values:o.c,mdxType:"Tabs"},Object(i.b)(c.a,{value:"ts",mdxType:"TabItem"},Object(i.b)("pre",null,Object(i.b)("code",Object(a.a)({parentName:"pre"},{className:"language-ts",metastring:'title="Object"',title:'"Object"'}),'const Example = new Net.Server.AsyncFunction("Example", [\n    Net.Middleware.RateLimit({\n        MaxRequestsPerMinute: 1\n    })\n])\n')),Object(i.b)("pre",null,Object(i.b)("code",Object(a.a)({parentName:"pre"},{className:"language-ts",metastring:'title="Definition"',title:'"Definition"'}),"const Remotes = Net.Definitions.Create({\n    Example: Net.Definitions.AsyncFunction([\n        Net.Middleware.RateLimit({\n            MaxRequestsPerMinute: 1\n        })\n    ])\n})\n"))),Object(i.b)(c.a,{value:"luau",mdxType:"TabItem"},Object(i.b)("pre",null,Object(i.b)("code",Object(a.a)({parentName:"pre"},{className:"language-lua",metastring:'title="Object"',title:'"Object"'}),'local Example = Net.Server.AsyncFunction.new("Example", {\n    Net.Middleware.RateLimit({\n        MaxRequestsPerMinute = 1\n    })\n})\n')),Object(i.b)("pre",null,Object(i.b)("code",Object(a.a)({parentName:"pre"},{className:"language-lua",metastring:'title="Definition"',title:'"Definition"'}),"local Remotes = Net.Definitions.Create({\n    Example = Net.Definitions.AsyncFunction({\n        Net.Middleware.RateLimit({\n            MaxRequestsPerMinute: 1\n        })\n    })\n})\n")))),Object(i.b)("h2",{id:"custom-error-handling"},"Custom Error Handling"),Object(i.b)("p",null,"When the rate limit is reached, it will run the error handler. By default this is set to a function which displays a warning on the server:"),Object(i.b)("pre",null,Object(i.b)("code",Object(a.a)({parentName:"pre"},{className:"language-ts"}),'export function rateLimitWarningHandler(error: RateLimitError) {\n    warn("[rbx-net]", error.Message);\n}\n')),Object(i.b)("p",null,"However, if you want to send this to something like analytics, you can provide your own error handler:"),Object(i.b)(l.a,{defaultValue:o.a,groupId:o.b,values:o.c,mdxType:"Tabs"},Object(i.b)(c.a,{value:"ts",mdxType:"TabItem"},Object(i.b)("pre",null,Object(i.b)("code",Object(a.a)({parentName:"pre"},{className:"language-ts"}),"function analyticRateLimitError(error: RateLimitError) {\n    AnalyticsService.Error(error.Message); // this is just an example\n}\n")),Object(i.b)("pre",null,Object(i.b)("code",Object(a.a)({parentName:"pre"},{className:"language-ts",metastring:'title="Object"',title:'"Object"'}),'const Example = new Net.Server.AsyncFunction("Example", [\n    Net.Middleware.RateLimit({\n        MaxRequestsPerMinute: 1,\n        ErrorHandler: analyticRateLimitError\n    })\n])\n')),Object(i.b)("pre",null,Object(i.b)("code",Object(a.a)({parentName:"pre"},{className:"language-ts",metastring:'title="Definition"',title:'"Definition"'}),"const Remotes = Net.Definitions.Create({\n    Example: Net.Definitions.AsyncFunction([\n        Net.Middleware.RateLimit({\n            MaxRequestsPerMinute: 1,\n            ErrorHandler: analyticRateLimitError\n        })\n    ])\n})\n"))),Object(i.b)(c.a,{value:"luau",mdxType:"TabItem"},Object(i.b)("pre",null,Object(i.b)("code",Object(a.a)({parentName:"pre"},{className:"language-lua"}),"local function analyticRateLimitError(error)\n    AnalyticsService:Error(error.Message) -- this is just an example\nend\n")),Object(i.b)("pre",null,Object(i.b)("code",Object(a.a)({parentName:"pre"},{className:"language-lua",metastring:'title="Object"',title:'"Object"'}),'local Example = Net.Server.AsyncFunction.new("Example", {\n    Net.Middleware.RateLimit({\n        MaxRequestsPerMinute = 1,\n        ErrorHandler = analyticRateLimitError\n    })\n})\n')),Object(i.b)("pre",null,Object(i.b)("code",Object(a.a)({parentName:"pre"},{className:"language-lua",metastring:'title="Definition"',title:'"Definition"'}),"local Remotes = Net.Definitions.Create({\n    Example = Net.Definitions.AsyncFunction({\n        Net.Middleware.RateLimit({\n            MaxRequestsPerMinute: 1,\n            ErrorHandler = analyticRateLimitError\n        })\n    })\n})\n")))))}d.isMDXComponent=!0},154:function(e,t,n){"use strict";n.d(t,"a",(function(){return m})),n.d(t,"b",(function(){return p}));var a=n(0),r=n.n(a);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function c(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},i=Object.keys(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var u=r.a.createContext({}),s=function(e){var t=r.a.useContext(u),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},m=function(e){var t=s(e.components);return r.a.createElement(u.Provider,{value:t},e.children)},b={inlineCode:"code",wrapper:function(e){var t=e.children;return r.a.createElement(r.a.Fragment,{},t)}},d=r.a.forwardRef((function(e,t){var n=e.components,a=e.mdxType,i=e.originalType,o=e.parentName,u=c(e,["components","mdxType","originalType","parentName"]),m=s(n),d=a,p=m["".concat(o,".").concat(d)]||m[d]||b[d]||i;return n?r.a.createElement(p,l(l({ref:t},u),{},{components:n})):r.a.createElement(p,l({ref:t},u))}));function p(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=n.length,o=new Array(i);o[0]=d;var l={};for(var c in t)hasOwnProperty.call(t,c)&&(l[c]=t[c]);l.originalType=e,l.mdxType="string"==typeof e?e:a,o[1]=l;for(var u=2;u<i;u++)o[u]=n[u];return r.a.createElement.apply(null,o)}return r.a.createElement.apply(null,n)}d.displayName="MDXCreateElement"},155:function(e,t,n){"use strict";function a(e){var t,n,r="";if("string"==typeof e||"number"==typeof e)r+=e;else if("object"==typeof e)if(Array.isArray(e))for(t=0;t<e.length;t++)e[t]&&(n=a(e[t]))&&(r&&(r+=" "),r+=n);else for(t in e)e[t]&&(r&&(r+=" "),r+=t);return r}t.a=function(){for(var e,t,n=0,r="";n<arguments.length;)(e=arguments[n++])&&(t=a(e))&&(r&&(r+=" "),r+=t);return r}},156:function(e,t,n){"use strict";var a=n(0),r=n.n(a),i=n(158),o=n(155),l=n(56),c=n.n(l),u=37,s=39;t.a=function(e){var t=e.lazy,n=e.block,l=e.defaultValue,m=e.values,b=e.groupId,d=e.className,p=Object(i.a)(),f=p.tabGroupChoices,O=p.setTabGroupChoices,y=Object(a.useState)(l),j=y[0],g=y[1],v=a.Children.toArray(e.children);if(null!=b){var h=f[b];null!=h&&h!==j&&m.some((function(e){return e.value===h}))&&g(h)}var w=function(e){g(e),null!=b&&O(b,e)},N=[];return r.a.createElement("div",null,r.a.createElement("ul",{role:"tablist","aria-orientation":"horizontal",className:Object(o.a)("tabs",{"tabs--block":n},d)},m.map((function(e){var t=e.value,n=e.label;return r.a.createElement("li",{role:"tab",tabIndex:0,"aria-selected":j===t,className:Object(o.a)("tabs__item",c.a.tabItem,{"tabs__item--active":j===t}),key:t,ref:function(e){return N.push(e)},onKeyDown:function(e){!function(e,t,n){switch(n.keyCode){case s:!function(e,t){var n=e.indexOf(t)+1;e[n]?e[n].focus():e[0].focus()}(e,t);break;case u:!function(e,t){var n=e.indexOf(t)-1;e[n]?e[n].focus():e[e.length-1].focus()}(e,t)}}(N,e.target,e)},onFocus:function(){return w(t)},onClick:function(){w(t)}},n)}))),t?Object(a.cloneElement)(v.filter((function(e){return e.props.value===j}))[0],{className:"margin-vert--md"}):r.a.createElement("div",{className:"margin-vert--md"},v.map((function(e,t){return Object(a.cloneElement)(e,{key:t,hidden:e.props.value!==j})}))))}},157:function(e,t,n){"use strict";var a=n(3),r=n(0),i=n.n(r);t.a=function(e){var t=e.children,n=e.hidden,r=e.className;return i.a.createElement("div",Object(a.a)({role:"tabpanel"},{hidden:n,className:r}),t)}},158:function(e,t,n){"use strict";var a=n(0),r=n(159);t.a=function(){var e=Object(a.useContext)(r.a);if(null==e)throw new Error("`useUserPreferencesContext` is used outside of `Layout` Component.");return e}},159:function(e,t,n){"use strict";var a=n(0),r=Object(a.createContext)(void 0);t.a=r},160:function(e,t,n){"use strict";n.d(t,"a",(function(){return l})),n.d(t,"b",(function(){return c})),n.d(t,"c",(function(){return u}));var a=n(0),r=n.n(a),i=n(156),o=n(157),l="ts",c="code",u=[{label:"roblox-ts",value:"ts"},{label:"luau",value:"luau"}];t.d=function(e){var t=e.children,n=t[0],a=t[1];return console.log(n,a),r.a.createElement(i.a,{defaultValue:l,groupId:c,values:u},r.a.createElement(o.a,{value:"ts"},n),r.a.createElement(o.a,{value:"luau"},a))}}}]);