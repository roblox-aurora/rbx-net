(window.webpackJsonp=window.webpackJsonp||[]).push([[28],{100:function(e,n,t){"use strict";t.r(n),t.d(n,"frontMatter",(function(){return l})),t.d(n,"metadata",(function(){return c})),t.d(n,"toc",(function(){return o})),t.d(n,"default",(function(){return b}));var i=t(3),r=t(7),a=(t(0),t(131)),l={id:"net.definitions",title:"Net.Definitions Namespace",sidebar_label:"Net.Definitions",slug:"/api/definitions"},c={unversionedId:"api/net.definitions",id:"api/net.definitions",isDocsHomePage:!1,title:"Net.Definitions Namespace",description:"This namespace is for the Definitions feature.",source:"@site/docs/api/net-definitions.md",slug:"/api/definitions",permalink:"/rbx-net/docs/2.1/api/definitions",editUrl:"https://github.com/roblox-aurora/rbx-net/edit/main/docs/docs/api/net-definitions.md",version:"current",sidebar_label:"Net.Definitions",sidebar:"docs",previous:{title:"Net.Client Namespace",permalink:"/rbx-net/docs/2.1/api/client"},next:{title:"Net.Middleware Namespace",permalink:"/rbx-net/docs/2.1/api/middleware"}},o=[{value:"Definitions.Create(definitions)",id:"definitionscreatedefinitions",children:[]},{value:"Definitions.ServerFunction&lt;Server&gt;(...)",id:"definitionsserverfunctionserver",children:[]},{value:"Definitions.ServerToClientEvent&lt;ServerArgs&gt;(...)",id:"definitionsservertoclienteventserverargs",children:[]},{value:"Definitions.ClientToServerEvent&lt;ClientArgs&gt;(...)",id:"definitionsclienttoservereventclientargs",children:[]},{value:"Definitions.BidirectionalEvent&lt;ServerArgs, ClientArgs&gt;(...)",id:"definitionsbidirectionaleventserverargs-clientargs",children:[]},{value:"Definitions.ServerAsyncFunction&lt;Server&gt;(...)",id:"definitionsserverasyncfunctionserver",children:[]},{value:"Definitions.Namespace(definitions)",id:"definitionsnamespacedefinitions",children:[]},{value:"DefinitionsCreateResult&lt;T&gt;",id:"definitionscreateresultt",children:[{value:"Server",id:"server",children:[]},{value:"Client",id:"client",children:[]}]},{value:"ServerDefinitionBuilder&lt;T&gt;",id:"serverdefinitionbuildert",children:[{value:"Create(name)",id:"createname",children:[]},{value:"OnFunction(name, callback)",id:"onfunctionname-callback",children:[]},{value:"OnEvent(name, callback)",id:"oneventname-callback",children:[]},{value:"GetNamespace(name)",id:"getnamespacename",children:[]}]},{value:"ClientDefinitionBuilder&lt;T&gt;",id:"clientdefinitionbuildert",children:[{value:"Get(name)",id:"getname",children:[]},{value:"OnEvent(name, callback)",id:"oneventname-callback-1",children:[]},{value:"GetNamespace(name)",id:"getnamespacename-1",children:[]}]}],s={toc:o};function b(e){var n=e.components,t=Object(r.a)(e,["components"]);return Object(a.b)("wrapper",Object(i.a)({},s,t,{components:n,mdxType:"MDXLayout"}),Object(a.b)("p",null,"This namespace is for the Definitions feature."),Object(a.b)("h3",{id:"definitionscreatedefinitions"},"Definitions.Create(definitions)"),Object(a.b)("pre",null,Object(a.b)("code",Object(i.a)({parentName:"pre"},{className:"language-ts"}),"function Create<T extends RemoteDeclarations>(\n    remotes: T,\n    globalMiddleware?: Net.GlobalMiddleware\n): DefinitionBuilders<T>\n")),Object(a.b)("p",null,"Function"),Object(a.b)("ul",null,Object(a.b)("li",{parentName:"ul"},"Parameters",Object(a.b)("ul",{parentName:"li"},Object(a.b)("li",{parentName:"ul"},Object(a.b)("inlineCode",{parentName:"li"},"remotes")," An object of remote definitions. See ",Object(a.b)("a",Object(i.a)({parentName:"li"},{href:"../definitions#definitions-oh-my"}),"definitions")," for usage."),Object(a.b)("li",{parentName:"ul"},Object(a.b)("inlineCode",{parentName:"li"},"globalMiddleware")," (optional) A collection of ",Object(a.b)("em",{parentName:"li"},"global middleware")," to apply to all remotes in this definition"))),Object(a.b)("li",{parentName:"ul"},"Returns a ",Object(a.b)("a",Object(i.a)({parentName:"li"},{href:"#definitionscreateresultt"}),"DefinitionsCreateResult"))),Object(a.b)("p",null,"Example"),Object(a.b)("pre",null,Object(a.b)("code",Object(i.a)({parentName:"pre"},{className:"language-ts",metastring:'title="shared/remotes.ts"',title:'"shared/remotes.ts"'}),'import Net from "@rbxts/net";\nconst MyDefinitions = Net.Definitions.Create({\n    TestRemote: Net.Definitions.AsyncFunction<(name: string) => boolean>()\n});\n')),Object(a.b)("h3",{id:"definitionsserverfunctionserver"},"Definitions.ServerFunction","<","Server",">","(...)"),Object(a.b)("p",null,"Definition function for creating a ",Object(a.b)("inlineCode",{parentName:"p"},"FunctionDefinition")),Object(a.b)("h3",{id:"definitionsservertoclienteventserverargs"},"Definitions.ServerToClientEvent","<","ServerArgs",">","(...)"),Object(a.b)("p",null,"Definition function for creating an ",Object(a.b)("inlineCode",{parentName:"p"},"ServerEventDeclaration")),Object(a.b)("h3",{id:"definitionsclienttoservereventclientargs"},"Definitions.ClientToServerEvent","<","ClientArgs",">","(...)"),Object(a.b)("p",null,"Definition function for creating an ",Object(a.b)("inlineCode",{parentName:"p"},"ClientEventDeclaration")),Object(a.b)("h3",{id:"definitionsbidirectionaleventserverargs-clientargs"},"Definitions.BidirectionalEvent","<","ServerArgs, ClientArgs",">","(...)"),Object(a.b)("p",null,"Definition function for creating an ",Object(a.b)("inlineCode",{parentName:"p"},"BidirectionalEventDeclaration")),Object(a.b)("h3",{id:"definitionsserverasyncfunctionserver"},"Definitions.ServerAsyncFunction","<","Server",">","(...)"),Object(a.b)("p",null,"Definition function for creating an ",Object(a.b)("inlineCode",{parentName:"p"},"ServerAsyncFunctionDefinition")),Object(a.b)("h3",{id:"definitionsnamespacedefinitions"},"Definitions.Namespace(definitions)"),Object(a.b)("p",null,"Creates a group of definitions (returns ",Object(a.b)("inlineCode",{parentName:"p"},"DeclarationNamespace"),")"),Object(a.b)("h2",{id:"definitionscreateresultt"},"DefinitionsCreateResult","<","T",">"),Object(a.b)("p",null,"Contains the definition builders for a given definition (returned using ",Object(a.b)("a",Object(i.a)({parentName:"p"},{href:"definitions#definitionscreatedefinitions"}),Object(a.b)("inlineCode",{parentName:"a"},"Create"))," in Net.Definitions)"),Object(a.b)("pre",null,Object(a.b)("code",Object(i.a)({parentName:"pre"},{className:"language-ts"}),"interface DefinitionsCreateResult<T extends RemoteDeclarations> {\n    readonly Server: ServerDefinitionBuilder<T>;\n    readonly Client: ClientDefinitionBuilder<T>;\n}\n")),Object(a.b)("h3",{id:"server"},"Server"),Object(a.b)("p",null,"A ",Object(a.b)("a",Object(i.a)({parentName:"p"},{href:"definitions#serverdefinitionbuildert"}),"ServerDefinitionBuilder")," object."),Object(a.b)("h3",{id:"client"},"Client"),Object(a.b)("p",null,"A ",Object(a.b)("a",Object(i.a)({parentName:"p"},{href:"definitions#clientdefinitionbuildert"}),"ClientDefinitionBuilder")," object."),Object(a.b)("h2",{id:"serverdefinitionbuildert"},"ServerDefinitionBuilder","<","T",">"),Object(a.b)("p",null,"Contains all the definition builders for server-side events and functions."),Object(a.b)("pre",null,Object(a.b)("code",Object(i.a)({parentName:"pre"},{className:"language-ts"}),"class ServerDefinitionBuilder<T extends RemoteDeclaration> {\n    Create(name: string): ServerEvent | ServerAsyncFunction | ServerFunction;\n    GetNamespace<K extends string>(name: K): SeverDefinitionBuilder<T[K]>;\n    OnEvent(name: string, callback: Callback): void;\n    OnFunction(name: string, callback: Callback): void;\n}\n")),Object(a.b)("h3",{id:"createname"},"Create(name)"),Object(a.b)("p",null,"Will get the specified event by name, and return it. The returned object will be the type provided in the definition."),Object(a.b)("pre",null,Object(a.b)("code",Object(i.a)({parentName:"pre"},{className:"language-ts",metastring:'title="server/example.server.ts"',title:'"server/example.server.ts"'}),'import { Server as ServerRemotes } from "shared/remotes.ts";\nconst TestRemote = ServerRemotes.Create("TestRemote");\n')),Object(a.b)("h3",{id:"onfunctionname-callback"},"OnFunction(name, callback)"),Object(a.b)("p",null,"Similar to ",Object(a.b)("inlineCode",{parentName:"p"},"Create")," but only works on events, and is pretty much a shortcut for ",Object(a.b)("inlineCode",{parentName:"p"},"Create(name).SetCallback(callback)")),Object(a.b)("h3",{id:"oneventname-callback"},"OnEvent(name, callback)"),Object(a.b)("p",null,"Similar to ",Object(a.b)("inlineCode",{parentName:"p"},"Create")," but only works on events, and is pretty much a shortcut for ",Object(a.b)("inlineCode",{parentName:"p"},"Create(name).Connect(callback)")),Object(a.b)("h3",{id:"getnamespacename"},"GetNamespace(name)"),Object(a.b)("p",null,"Gets a child namespace under this namespace"),Object(a.b)("h2",{id:"clientdefinitionbuildert"},"ClientDefinitionBuilder","<","T",">"),Object(a.b)("p",null,"Contains all the definition builders for server-side events and functions."),Object(a.b)("pre",null,Object(a.b)("code",Object(i.a)({parentName:"pre"},{className:"language-ts"}),"class ClientDefinitionBuilder<T extends RemoteDeclaration> {\n    Get(name: string): ServerEvent | ServerAsyncFunction | ServerFunction;\n    GetNamespace<K extends string>(name: K): ClientDefinitionBuilder<T[K]>;\n    OnEvent(name: string, callback: Callback): void;\n}\n")),Object(a.b)("h3",{id:"getname"},"Get(name)"),Object(a.b)("p",null,"Will get the specified event by name, and return it. The returned object will be the type provided in the definition."),Object(a.b)("p",null,"Gets the specified remote definition and gets the client version of the event/function/asyncfunction"),Object(a.b)("pre",null,Object(a.b)("code",Object(i.a)({parentName:"pre"},{className:"language-ts",metastring:'title="client/example.client.ts"',title:'"client/example.client.ts"'}),'import { Client as ClientRemotes } from "shared/remotes.ts";\nconst TestRemote = ClientRemotes.Get("TestRemote");\n')),Object(a.b)("h3",{id:"oneventname-callback-1"},"OnEvent(name, callback)"),Object(a.b)("p",null,"Similar to ",Object(a.b)("inlineCode",{parentName:"p"},"Get")," but only works on events, and is pretty much a shortcut for ",Object(a.b)("inlineCode",{parentName:"p"},"Create(name).Connect(callback)")),Object(a.b)("h3",{id:"getnamespacename-1"},"GetNamespace(name)"),Object(a.b)("p",null,"Gets a child namespace under this namespace"))}b.isMDXComponent=!0},131:function(e,n,t){"use strict";t.d(n,"a",(function(){return d})),t.d(n,"b",(function(){return p}));var i=t(0),r=t.n(i);function a(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function l(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);n&&(i=i.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,i)}return t}function c(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?l(Object(t),!0).forEach((function(n){a(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):l(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function o(e,n){if(null==e)return{};var t,i,r=function(e,n){if(null==e)return{};var t,i,r={},a=Object.keys(e);for(i=0;i<a.length;i++)t=a[i],n.indexOf(t)>=0||(r[t]=e[t]);return r}(e,n);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(i=0;i<a.length;i++)t=a[i],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(r[t]=e[t])}return r}var s=r.a.createContext({}),b=function(e){var n=r.a.useContext(s),t=n;return e&&(t="function"==typeof e?e(n):c(c({},n),e)),t},d=function(e){var n=b(e.components);return r.a.createElement(s.Provider,{value:n},e.children)},u={inlineCode:"code",wrapper:function(e){var n=e.children;return r.a.createElement(r.a.Fragment,{},n)}},f=r.a.forwardRef((function(e,n){var t=e.components,i=e.mdxType,a=e.originalType,l=e.parentName,s=o(e,["components","mdxType","originalType","parentName"]),d=b(t),f=i,p=d["".concat(l,".").concat(f)]||d[f]||u[f]||a;return t?r.a.createElement(p,c(c({ref:n},s),{},{components:t})):r.a.createElement(p,c({ref:n},s))}));function p(e,n){var t=arguments,i=n&&n.mdxType;if("string"==typeof e||i){var a=t.length,l=new Array(a);l[0]=f;var c={};for(var o in n)hasOwnProperty.call(n,o)&&(c[o]=n[o]);c.originalType=e,c.mdxType="string"==typeof e?e:i,l[1]=c;for(var s=2;s<a;s++)l[s]=t[s];return r.a.createElement.apply(null,l)}return r.a.createElement.apply(null,t)}f.displayName="MDXCreateElement"}}]);