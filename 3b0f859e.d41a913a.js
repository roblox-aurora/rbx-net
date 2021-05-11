(window.webpackJsonp=window.webpackJsonp||[]).push([[16],{131:function(e,t,n){"use strict";n.d(t,"a",(function(){return p})),n.d(t,"b",(function(){return m}));var r=n(0),o=n.n(r);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function c(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,o=function(e,t){if(null==e)return{};var n,r,o={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var s=o.a.createContext({}),u=function(e){var t=o.a.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):c(c({},t),e)),n},p=function(e){var t=u(e.components);return o.a.createElement(s.Provider,{value:t},e.children)},d={inlineCode:"code",wrapper:function(e){var t=e.children;return o.a.createElement(o.a.Fragment,{},t)}},b=o.a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,a=e.originalType,i=e.parentName,s=l(e,["components","mdxType","originalType","parentName"]),p=u(n),b=r,m=p["".concat(i,".").concat(b)]||p[b]||d[b]||a;return n?o.a.createElement(m,c(c({ref:t},s),{},{components:n})):o.a.createElement(m,c({ref:t},s))}));function m(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var a=n.length,i=new Array(a);i[0]=b;var c={};for(var l in t)hasOwnProperty.call(t,l)&&(c[l]=t[l]);c.originalType=e,c.mdxType="string"==typeof e?e:r,i[1]=c;for(var s=2;s<a;s++)i[s]=n[s];return o.a.createElement.apply(null,i)}return o.a.createElement.apply(null,n)}b.displayName="MDXCreateElement"},87:function(e,t,n){"use strict";n.r(t),n.d(t,"frontMatter",(function(){return i})),n.d(t,"metadata",(function(){return c})),n.d(t,"toc",(function(){return l})),n.d(t,"default",(function(){return u}));var r=n(3),o=n(7),a=(n(0),n(131)),i={id:"install-luau",title:"Install for Luau"},c={unversionedId:"install-luau",id:"version-2.0.x/install-luau",isDocsHomePage:!1,title:"Install for Luau",description:"Depending on your stack for Roblox, you might want to either use the Rojo step or the Studio step. If you don't know what Rojo is, use the Studio step.",source:"@site/versioned_docs/version-2.0.x/install-lua.md",slug:"/install-luau",permalink:"/rbx-net/docs/2.0/install-luau",editUrl:"https://github.com/roblox-aurora/rbx-net/edit/main/docs/versioned_docs/version-2.0.x/install-lua.md",version:"2.0.x",sidebar:"docs",previous:{title:"Install for TypeScript",permalink:"/rbx-net/docs/2.0/install"},next:{title:"Basics",permalink:"/rbx-net/docs/2.0/basic-usage"}},l=[{value:"Via Rojo",id:"via-rojo",children:[]},{value:"Via Studio",id:"via-studio",children:[{value:"RBXMX model file",id:"rbxmx-model-file",children:[]}]}],s={toc:l};function u(e){var t=e.components,n=Object(o.a)(e,["components"]);return Object(a.b)("wrapper",Object(r.a)({},s,n,{components:t,mdxType:"MDXLayout"}),Object(a.b)("p",null,"Depending on your stack for Roblox, you might want to either use the ",Object(a.b)("a",Object(r.a)({parentName:"p"},{href:"#via-rojo"}),"Rojo")," step or the ",Object(a.b)("a",Object(r.a)({parentName:"p"},{href:"#via-studio"}),"Studio")," step. If you don't know what ",Object(a.b)("em",{parentName:"p"},"Rojo")," is, use the Studio step."),Object(a.b)("h2",{id:"via-rojo"},"Via Rojo"),Object(a.b)("p",null,"The following steps require knowledge and use of ",Object(a.b)("a",Object(r.a)({parentName:"p"},{href:"https://rojo.space"}),"rojo"),". If you're not using rojo, look at ",Object(a.b)("a",Object(r.a)({parentName:"p"},{href:"#via-studio"}),"studio")," instructions."),Object(a.b)("div",{className:"admonition admonition-danger alert alert--danger"},Object(a.b)("div",Object(r.a)({parentName:"div"},{className:"admonition-heading"}),Object(a.b)("h5",{parentName:"div"},Object(a.b)("span",Object(r.a)({parentName:"h5"},{className:"admonition-icon"}),Object(a.b)("svg",Object(r.a)({parentName:"span"},{xmlns:"http://www.w3.org/2000/svg",width:"12",height:"16",viewBox:"0 0 12 16"}),Object(a.b)("path",Object(r.a)({parentName:"svg"},{fillRule:"evenodd",d:"M5.05.31c.81 2.17.41 3.38-.52 4.31C3.55 5.67 1.98 6.45.9 7.98c-1.45 2.05-1.7 6.53 3.53 7.7-2.2-1.16-2.67-4.52-.3-6.61-.61 2.03.53 3.33 1.94 2.86 1.39-.47 2.3.53 2.27 1.67-.02.78-.31 1.44-1.13 1.81 3.42-.59 4.78-3.42 4.78-5.56 0-2.84-2.53-3.22-1.25-5.61-1.52.13-2.03 1.13-1.89 2.75.09 1.08-1.02 1.8-1.86 1.33-.67-.41-.66-1.19-.06-1.78C8.18 5.31 8.68 2.45 5.05.32L5.03.3l.02.01z"})))),"danger")),Object(a.b)("div",Object(r.a)({parentName:"div"},{className:"admonition-content"}),Object(a.b)("p",{parentName:"div"},"Due to this being an older version, it is no longer available for Luau. Until Rotriever is released, there is no sane way of achieving this. :("))),Object(a.b)("h2",{id:"via-studio"},"Via Studio"),Object(a.b)("h3",{id:"rbxmx-model-file"},"RBXMX model file"),Object(a.b)("p",null,"Releases can be found ",Object(a.b)("a",Object(r.a)({parentName:"p"},{href:"https://github.com/roblox-aurora/rbx-net/releases"}),"here"),". Download the appropriate ",Object(a.b)("inlineCode",{parentName:"p"},".rbxmx")," file under the ",Object(a.b)("inlineCode",{parentName:"p"},"Assets")," dropdown, then drag it into studio. Ensure the library is under ",Object(a.b)("inlineCode",{parentName:"p"},"ReplicatedStorage")," so it can be used by all your code."))}u.isMDXComponent=!0}}]);