(window.webpackJsonp=window.webpackJsonp||[]).push([[27],{131:function(e,t,n){"use strict";n.d(t,"a",(function(){return b})),n.d(t,"b",(function(){return u}));var a=n(0),o=n.n(a);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function s(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?r(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function c(e,t){if(null==e)return{};var n,a,o=function(e,t){if(null==e)return{};var n,a,o={},i=Object.keys(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var l=o.a.createContext({}),d=function(e){var t=o.a.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):s(s({},t),e)),n},b=function(e){var t=d(e.components);return o.a.createElement(l.Provider,{value:t},e.children)},m={inlineCode:"code",wrapper:function(e){var t=e.children;return o.a.createElement(o.a.Fragment,{},t)}},p=o.a.forwardRef((function(e,t){var n=e.components,a=e.mdxType,i=e.originalType,r=e.parentName,l=c(e,["components","mdxType","originalType","parentName"]),b=d(n),p=a,u=b["".concat(r,".").concat(p)]||b[p]||m[p]||i;return n?o.a.createElement(u,s(s({ref:t},l),{},{components:n})):o.a.createElement(u,s({ref:t},l))}));function u(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=n.length,r=new Array(i);r[0]=p;var s={};for(var c in t)hasOwnProperty.call(t,c)&&(s[c]=t[c]);s.originalType=e,s.mdxType="string"==typeof e?e:a,r[1]=s;for(var l=2;l<i;l++)r[l]=n[l];return o.a.createElement.apply(null,r)}return o.a.createElement.apply(null,n)}p.displayName="MDXCreateElement"},99:function(e,t,n){"use strict";n.r(t),n.d(t,"frontMatter",(function(){return r})),n.d(t,"metadata",(function(){return s})),n.d(t,"toc",(function(){return c})),n.d(t,"default",(function(){return d}));var a=n(3),o=n(7),i=(n(0),n(131)),r={id:"uuid",title:"Using Compile Time Remote IDs",sidebar_label:"Compile-time Remote IDs",slug:"/uuid"},s={unversionedId:"guides/uuid",id:"version-2.0.x/guides/uuid",isDocsHomePage:!1,title:"Using Compile Time Remote IDs",description:"This functionality is only available to roblox-ts users. This is not possible in regular Luau.",source:"@site/versioned_docs/version-2.0.x/guides/uuid.md",slug:"/uuid",permalink:"/rbx-net/docs/2.0/uuid",editUrl:"https://github.com/roblox-aurora/rbx-net/edit/main/docs/versioned_docs/version-2.0.x/guides/uuid.md",version:"2.0.x",sidebar_label:"Compile-time Remote IDs",sidebar:"docs",previous:{title:"Leveraging the Definitions API",permalink:"/rbx-net/docs/2.0/definitions"},next:{title:"Wrapping Custom Player Objects",permalink:"/rbx-net/docs/2.0/custom-player-objects"}},c=[{value:"Getting started",id:"getting-started",children:[]},{value:"Usage",id:"usage",children:[{value:"Using with Definitions",id:"using-with-definitions",children:[]}]}],l={toc:c};function d(e){var t=e.components,n=Object(o.a)(e,["components"]);return Object(i.b)("wrapper",Object(a.a)({},l,n,{components:t,mdxType:"MDXLayout"}),Object(i.b)("div",{className:"admonition admonition-info alert alert--info"},Object(i.b)("div",Object(a.a)({parentName:"div"},{className:"admonition-heading"}),Object(i.b)("h5",{parentName:"div"},Object(i.b)("span",Object(a.a)({parentName:"h5"},{className:"admonition-icon"}),Object(i.b)("svg",Object(a.a)({parentName:"span"},{xmlns:"http://www.w3.org/2000/svg",width:"14",height:"16",viewBox:"0 0 14 16"}),Object(i.b)("path",Object(a.a)({parentName:"svg"},{fillRule:"evenodd",d:"M7 2.3c3.14 0 5.7 2.56 5.7 5.7s-2.56 5.7-5.7 5.7A5.71 5.71 0 0 1 1.3 8c0-3.14 2.56-5.7 5.7-5.7zM7 1C3.14 1 0 4.14 0 8s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7zm1 3H6v5h2V4zm0 6H6v2h2v-2z"})))),"TypeScript Only")),Object(i.b)("div",Object(a.a)({parentName:"div"},{className:"admonition-content"}),Object(i.b)("p",{parentName:"div"},"This functionality is only available to roblox-ts users. This is not possible in regular Luau."))),Object(i.b)("p",null,'A feature that can be leveraged with the power of the roblox-ts compiler, is a thing referred to as "Remote Ids". This is a way to throw off any identifying information about your remotes to any external parties. '),Object(i.b)("p",null,"If used correctly it should make it quite hard to make exploit tools for your game, and throw off most exploiters."),Object(i.b)("div",{className:"admonition admonition-caution alert alert--warning"},Object(i.b)("div",Object(a.a)({parentName:"div"},{className:"admonition-heading"}),Object(i.b)("h5",{parentName:"div"},Object(i.b)("span",Object(a.a)({parentName:"h5"},{className:"admonition-icon"}),Object(i.b)("svg",Object(a.a)({parentName:"span"},{xmlns:"http://www.w3.org/2000/svg",width:"16",height:"16",viewBox:"0 0 16 16"}),Object(i.b)("path",Object(a.a)({parentName:"svg"},{fillRule:"evenodd",d:"M8.893 1.5c-.183-.31-.52-.5-.887-.5s-.703.19-.886.5L.138 13.499a.98.98 0 0 0 0 1.001c.193.31.53.501.886.501h13.964c.367 0 .704-.19.877-.5a1.03 1.03 0 0 0 .01-1.002L8.893 1.5zm.133 11.497H6.987v-2.003h2.039v2.003zm0-3.004H6.987V5.987h2.039v4.006z"})))),"caution")),Object(i.b)("div",Object(a.a)({parentName:"div"},{className:"admonition-content"}),Object(i.b)("p",{parentName:"div"},"It is not an anti-exploit solution, but a ",Object(i.b)("a",Object(a.a)({parentName:"p"},{href:"https://utkusen.com/blog/security-by-obscurity-is-underrated.html"}),"good piece of cheese")," in preventing exploits. You ",Object(i.b)("em",{parentName:"p"},"should always")," secure your remotes yourself, using things like the ",Object(i.b)("a",Object(a.a)({parentName:"p"},{href:"/docs/2.0/middleware/types"}),"runtime type checking middleware"),". Doesn't hurt to add another layer of cheese."))),Object(i.b)("h2",{id:"getting-started"},"Getting started"),Object(i.b)("p",null,"To start using Remote Ids, first install the Remote Id generation tool:"),Object(i.b)("pre",null,Object(i.b)("code",Object(a.a)({parentName:"pre"},{className:"language-bash"}),"npm install -g roblox-ts-net-idgen\n")),Object(i.b)("p",null,"Then, create a new ",Object(i.b)("inlineCode",{parentName:"p"},"remoteIds.id.json")," file inside your project. It doesn't have to be called ",Object(i.b)("inlineCode",{parentName:"p"},"remoteIds"),", but for this example that's what we're doing. As long as it ends with ",Object(i.b)("inlineCode",{parentName:"p"},".id.json"),"."),Object(i.b)("pre",null,Object(i.b)("code",Object(a.a)({parentName:"pre"},{className:"language-json",metastring:'title="shared/remoteIds.id.json"',title:'"shared/remoteIds.id.json"'}),'{\n    "Name": "RemoteId",\n    "IDs": [\n    ]\n}\n')),Object(i.b)("p",null,"The ",Object(i.b)("inlineCode",{parentName:"p"},"Name")," field is the outputted name of the ",Object(i.b)("inlineCode",{parentName:"p"},"const enum"),", and the ",Object(i.b)("inlineCode",{parentName:"p"},"IDs")," will be the IDs you have for your remotes."),Object(i.b)("p",null,"Now lets add some example remote ids"),Object(i.b)("pre",null,Object(i.b)("code",Object(a.a)({parentName:"pre"},{className:"language-json",metastring:'title="shared/remoteIds.id.json"',title:'"shared/remoteIds.id.json"'}),'{\n    "Name": "RemoteId",\n    "IDs": [\n        "PrintMessage",\n        "MakeHello"\n    ]\n}\n')),Object(i.b)("p",null,"Now that we have some remote ids, we need to generate the ",Object(i.b)("inlineCode",{parentName:"p"},"type declaration")," file. Run the command in your console:"),Object(i.b)("pre",null,Object(i.b)("code",Object(a.a)({parentName:"pre"},{className:"language-bash"}),"rbxnid\n")),Object(i.b)("p",null,"A new ",Object(i.b)("inlineCode",{parentName:"p"},"remoteId.d.ts")," file should have been generated, and should look like the following:"),Object(i.b)("pre",null,Object(i.b)("code",Object(a.a)({parentName:"pre"},{className:"language-ts",metastring:'title="shared/remoteId.d.ts"',title:'"shared/remoteId.d.ts"'}),'export const enum RemoteId {\n    PrintMessage = "cbf11f23-ed6e-43f6-8750-fce7c6558ae4",\n    MakeHello = "ffa61bfe-d8ba-4c82-a7eb-3dd36b133184"\n}\n')),Object(i.b)("p",null,"These IDs will change every time you run the ",Object(i.b)("inlineCode",{parentName:"p"},"rbxnid")," command. It's recommended you do this as part of your build process, so each new build of your game has an entirely new set of IDs. This will ensure that it's difficult to make any specific exploit tools for your game."),Object(i.b)("h2",{id:"usage"},"Usage"),Object(i.b)("p",null,"Then when you have the RemoteIds, you can use them in place where you'd normally supply a remote id:"),Object(i.b)("pre",null,Object(i.b)("code",Object(a.a)({parentName:"pre"},{className:"language-ts"}),'import Net from "@rbxts/net";\nimport { RemoteId } from "shared/remoteId";\n\nconst ExampleUsage = new Net.Server.Event(RemoteId.PrintMessage); \n')),Object(i.b)("p",null,"This will end up compiling to"),Object(i.b)("pre",null,Object(i.b)("code",Object(a.a)({parentName:"pre"},{className:"language-lua",metastring:'title="compiled code"',title:'"compiled','code"':!0}),'--- ... roblox-ts imports\nlocal ExampleUsage = Net.Server.Event.new("cbf11f23-ed6e-43f6-8750-fce7c6558ae4")\n')),Object(i.b)("h3",{id:"using-with-definitions"},"Using with Definitions"),Object(i.b)("p",null,"Using remote ids with definitions is straightforward."),Object(i.b)("pre",null,Object(i.b)("code",Object(a.a)({parentName:"pre"},{className:"language-ts"}),'import Net from "@rbxts/net";\nimport { RemoteId } from "shared/remoteId";\n\nconst Remotes = Net.Definitions.Create({\n    [RemoteId.PrintMessage]: Net.Definitions.Event<[message: string]>(),\n    [RemoteId.MakeHello]: Net.Definitions.AsyncFunction<(message: string) => string>()\n});\nexport = Remotes;\n')),Object(i.b)("p",null,"Which should compile to the following:"),Object(i.b)("pre",null,Object(i.b)("code",Object(a.a)({parentName:"pre"},{className:"language-lua",metastring:'title="compiled code"',title:'"compiled','code"':!0}),'-- ... roblox-ts imports\nlocal Remotes = Net.Definitions.Create({\n    ["cbf11f23-ed6e-43f6-8750-fce7c6558ae4"] = Net.Definitions.Event(),\n    ["ffa61bfe-d8ba-4c82-a7eb-3dd36b133184"] = Net.Definitions.AsyncFunction()\n})\n\n-- .. exports\n')))}d.isMDXComponent=!0}}]);