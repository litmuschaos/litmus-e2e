(this["webpackJsonpe2e-dashboard"]=this["webpackJsonpe2e-dashboard"]||[]).push([[2],{161:function(e,t,n){"use strict";n.r(t);var a=n(0),r=n.n(a),i=n(40),l=n.n(i),o=n(7),c=n(57),s=n(113),d=n(197),u=n(6),h=n(90),b=n(31),g=n(32),p=n(58),m=n(62),j=function(e){if(e){var t=[],n=[];return e.workflows.forEach((function(e){null!=e.name.match(m.b)?t.push(Object(o.a)(Object(o.a)({},e),{},{readableName:Object(p.b)(e.name)})):null!=e.name.match(m.a)&&n.push(Object(o.a)(Object(o.a)({},e),{},{readableName:Object(p.b)(e.name)}))})),{nightly:t,manual:n}}return{nightly:null,manual:null}},f=function(e){var t,n,a={all:{id:0,name:"all-workflows",readableName:"All Workflows",badge_url:"https://img.shields.io/badge/All%20Workflows-passing-%2331c754?logo=GitHub",workflow_runs:{updated_at:new Date(0).toISOString()},html_url:"https://github.com/litmuschaos/litmus-e2e/tree/master/.github/workflows"},manual:[],nightly:[]},r=[];return null===e||void 0===e||null===(t=e.manual)||void 0===t||t.forEach((function(e){r.push(Object(b.a)("".concat(g.a.pipelinesByWorkflow(e.id),"?per_page=1")).then((function(t){var n,r,i,l,c;(a.manual.push(Object(o.a)(Object(o.a)({},e),{},{workflow_runs:null===t||void 0===t||null===(n=t.workflow_runs)||void 0===n?void 0:n[0]})),new Date(a.all.workflow_runs.updated_at).getTime()<new Date(null===t||void 0===t||null===(r=t.workflow_runs)||void 0===r||null===(i=r[0])||void 0===i?void 0:i.updated_at).getTime())&&(a.all.workflow_runs.updated_at=new Date(null===t||void 0===t||null===(l=t.workflow_runs)||void 0===l||null===(c=l[0])||void 0===c?void 0:c.updated_at).toISOString())})))})),null===e||void 0===e||null===(n=e.nightly)||void 0===n||n.forEach((function(e){r.push(Object(b.a)("".concat(g.a.pipelinesByWorkflow(e.id),"?per_page=1")).then((function(t){var n,r,i,l,c;(a.nightly.push(Object(o.a)(Object(o.a)({},e),{},{workflow_runs:null===t||void 0===t||null===(n=t.workflow_runs)||void 0===n?void 0:n[0]})),new Date(a.all.workflow_runs.updated_at).getTime()<new Date(null===t||void 0===t||null===(r=t.workflow_runs)||void 0===r||null===(i=r[0])||void 0===i?void 0:i.updated_at).getTime())&&(a.all.workflow_runs.updated_at=new Date(null===t||void 0===t||null===(l=t.workflow_runs)||void 0===l||null===(c=l[0])||void 0===c?void 0:c.updated_at).toISOString())})))})),Promise.all(r).then((function(){return a}))},B=n(26),F=r.a.createContext({toggleColorMode:function(){}}),O={primary:{main:"#5B44BA",light:"#858CDD",dark:"#4028A0"},secondary:{main:"#109B67",light:"#109B6799",dark:"#128359"},graph:{dashboard:{lightBlue:"#08BBD7",lightOrange:"#F6B92B"},toolTip:"#5252F6",legendTableHeading:"#0098DD",radialChartPassed:"#0098DD",line:["#A93DDB","#A05195","#D45087","#CC556A","#FFA600","#DFA73E","#F6793E","#6DA966","#51C9DA","#2F4B7C"],area:["#A93DDB73","#A0519573","#A4508773","#CC556A73","#FFA60073","#DFA73E73","#F6793E73","#6DA96673","#51C9DA73","#2F4B7C73"],calendarHeatmap:["#FD6868","#FE9A9A","#FDB4B4","#EECC91","#E3AD4F","#E79F32","#9BE9A8","#40C463","#109B67","#E5E7F1","#BDC3DB"]},success:{main:"#109B67",light:"#109B6710",dark:"#128359"},error:{light:"#CA2C2C10",main:"#CA2C2C",dark:"#A62F28"},warning:{light:"#F6B92B20",main:"#DBA017",dark:"#402C01"},background:{default:"#F5F6F8",paper:"#FFFFFF"},sidebarMenu:"#F5F6F8",header:"linear-gradient(269.82deg, #5B44BA 0.52%, #493795 99.07%)",loginBackground:"linear-gradient(78.42deg, #403083 0.01%, #5B44BA 100.01%)",disabledBackground:"#D9D9D9",text:{primary:"#1C0732",secondary:"#FFFFFF",disabled:"#BCB9C6",hint:"#696F8C",tertiary:"#FFFFFF"},highlight:"#5B44BA",horizontalStepper:{completed:"#5D6173",active:"#2CCA8F",pending:"#B9B9B9"},border:{main:"#BBBBBB",success:"#109B67",error:"#CA2C2C"},progressBarGradient:"linear-gradient(90.43deg, #5B44BA 0.35%, #858CDD 51.03%, #109B67 99.64%)",status:{workflow:{running:"#3A97D4",completed:"#09825D",failed:"#DD2B0E",pending:"#949AB7"},experiment:{running:"#5469D4",completed:"#00CC9A",failed:"#F2536D",pending:"#BBBBBB",skipped:"#0098DD",error:"#FFA600",omitted:"#A93DDB"}},cards:{header:"#EDF0F8",background:"#FFFFFF",highlight:"#8F96E066"},icon:{primary:"white"},label:"#0000008a",select:"#0000003b",highlightText:"#FFFFFF"},D={primary:{main:"#5B44BA",light:"#858CDD",dark:"#4028A0"},secondary:{main:"#109B67",light:"#109B6799",dark:"#128359"},graph:{dashboard:{lightBlue:"#08BBD7",lightOrange:"#F6B92B"},toolTip:"#5252F6",legendTableHeading:"#0098DD",radialChartPassed:"#0098DD",line:["#A93DDB","#A05195","#D45087","#CC556A","#FFA600","#DFA73E","#F6793E","#6DA966","#51C9DA","#2F4B7C"],area:["#A93DDB73","#A0519573","#A4508773","#CC556A73","#FFA60073","#DFA73E73","#F6793E73","#6DA96673","#51C9DA73","#2F4B7C73"],calendarHeatmap:["#FD6868","#FE9A9A","#FDB4B4","#EECC91","#E3AD4F","#E79F32","#9BE9A8","#40C463","#109B67","#E5E7F1","#BDC3DB"]},success:{main:"#109B67",light:"#109B6710",dark:"#128359"},error:{light:"#CA2C2C10",main:"#CA2C2C",dark:"#A62F28"},warning:{light:"#F6B92B20",main:"#DBA017",dark:"#402C01"},background:{default:"#121212",paper:"#272c34"},sidebarMenu:"#F5F6F8",header:"#333",loginBackground:"linear-gradient(78.42deg, #403083 0.01%, #5B44BA 100.01%)",disabledBackground:"#D9D9D9",text:{primary:"#FFFFFF",secondary:"#FFFFFF",disabled:"#BCB9C6",hint:"#696F8C",tertiary:"#697386"},highlight:"#5B44BA",horizontalStepper:{completed:"#5D6173",active:"#2CCA8F",pending:"#B9B9B9"},border:{main:"#BBBBBB",success:"#109B67",error:"#CA2C2C"},progressBarGradient:"linear-gradient(90.43deg, #5B44BA 0.35%, #858CDD 51.03%, #109B67 99.64%)",status:{workflow:{running:"#3A97D4",completed:"#09825D",failed:"#DD2B0E",pending:"#949AB7"},experiment:{running:"#5469D4",completed:"#00CC9A",failed:"#F2536D",pending:"#BBBBBB",skipped:"#0098DD",error:"#FFA600",omitted:"#A93DDB"}},cards:{header:"#EDF0F8",background:"#FFFFFF",highlight:"#8F96E066"},icon:{primary:"black"},label:"#696F8C",select:"#696F8C",highlightText:"#D1BCA0"},x=n(193),v=n(196),w=n(28),C=n(165),k=n(192),A=n(189),y=n(191),E=n(111),_=n.n(E),T=n(112),S=n.n(T),N=n(172),z=n.p+"static/media/slack.ff384727.svg",P=n.p+"static/media/github.1ca713cc.svg",G=n(171),I=Object(G.a)((function(e){return{appBar:{position:"sticky",boxShadow:"0px 0.6px 1.8px rgba(0, 0, 0, 0.1), 0px 3.2px 7.2px rgba(0, 0, 0, 0.13)"},toolBar:{height:"4.9rem",display:"flex",justifyContent:"space-between",background:e.palette.header,padding:e.spacing(0,7.5),"& *":{color:e.palette.text.tertiary},"& nav":{flexGrow:1,marginLeft:e.spacing(15)}},nounderline:{textDecoration:"none"},chaosText:{fontSize:"1.625rem",fontWeight:600,color:e.palette.highlightText},rightSection:{display:"flex",justifyContent:"space-between","& div":{marginRight:"0.5rem"},"& a":{textDecoration:"none"}},slackIcon:{height:"max-content",paddingTop:"0.4rem"},middleSection:{display:"flex",justifyContent:"center",flexGrow:1,"& a":{margin:"0 1.5rem"},"& a:hover p":{color:e.palette.highlightText},"& a:hover svg path":{stroke:e.palette.highlightText,fill:e.palette.highlightText}}}})),R=n(2),M=function(){var e=Object(C.a)(),t=r.a.useContext(F),n=I(),a=Object(v.a)().t;return Object(R.jsx)("div",{"data-cy":"headerComponent",children:Object(R.jsx)(A.a,{className:n.appBar,children:Object(R.jsxs)(y.a,{disableGutters:!0,className:n.toolBar,children:[Object(R.jsx)(w.a,{to:{pathname:"/"},className:n.nounderline,children:Object(R.jsx)(k.a,{className:n.chaosText,variant:"body1",children:a("header.e2eDashboard")})}),Object(R.jsxs)("div",{className:n.middleSection,children:[Object(R.jsx)(w.a,{to:{pathname:"/",state:{pipelinesToDisplay:{manual:!0,nightly:!0}}},className:n.nounderline,children:Object(R.jsxs)(k.a,{variant:"body1",children:[Object(R.jsx)(N.a,{name:"home",size:"lg",color:e.palette.text.tertiary}),"\xa0",a("header.home")]})}),Object(R.jsx)(w.a,{to:{pathname:"/",state:{pipelinesToDisplay:{manual:!1,nightly:!0}}},className:n.nounderline,children:Object(R.jsxs)(k.a,{variant:"body1",children:[Object(R.jsx)(N.a,{name:"scheduleWorkflow",size:"lg",color:e.palette.text.tertiary}),"\xa0",a("header.nightlyRuns")]})}),Object(R.jsx)(w.a,{to:{pathname:"/",state:{pipelinesToDisplay:{manual:!0,nightly:!1}}},className:n.nounderline,children:Object(R.jsxs)(k.a,{variant:"body1",children:[Object(R.jsx)(N.a,{name:"workflow",size:"lg",color:e.palette.text.tertiary}),"\xa0",a("header.manualRuns")]})})]}),Object(R.jsxs)("div",{className:n.rightSection,children:[Object(R.jsx)("div",{className:n.slackIcon,children:"dark"===e.palette.mode?Object(R.jsx)(_.a,{onClick:t.toggleColorMode}):Object(R.jsx)(S.a,{onClick:t.toggleColorMode})}),Object(R.jsx)("div",{className:n.slackIcon,children:Object(R.jsx)("a",{href:"https://slack.litmuschaos.io/",target:"_blank",rel:"noopener noreferrer",children:Object(R.jsx)("img",{src:P,alt:"GitHub logo"})})}),Object(R.jsx)("div",{className:n.slackIcon,children:Object(R.jsx)("a",{href:"https://slack.litmuschaos.io/",target:"_blank",rel:"noopener noreferrer",children:Object(R.jsx)("img",{src:z,alt:"Slack logo"})})})]})]})})})},W=Object(G.a)((function(e){return{root:{height:"100vh",width:"100%",gridTemplateColumns:"20.5em auto",gridTemplateRows:"6.5em auto",gridTemplateAreas:'"header header" "sidebar content"',"& ::-webkit-scrollbar":{width:"0.4rem",height:"0.4rem"},"& ::-webkit-scrollbar-track":{marginTop:e.spacing(1),webkitBoxShadow:"inset 0 0 8px ".concat(e.palette.common.black),backgroundColor:e.palette.border.main},"& ::-webkit-scrollbar-thumb":{backgroundColor:e.palette.highlight,borderRadius:8},"& img":{userDrag:"none"}},header:{gridArea:"header"},content:{gridArea:"content",padding:e.spacing(5,7.5,10),overflowY:"auto"}}})),H=function(e){var t=e.children,n=W();return Object(R.jsxs)("div",{className:n.root,children:[Object(R.jsx)(x.a,{}),Object(R.jsx)("header",{className:n.header,children:Object(R.jsx)(M,{})}),Object(R.jsx)("main",{className:n.content,children:t})]})},J=n(55),L=n(84),U=function(e){var t=e.children,n=e.style;return Object(R.jsx)(a.Suspense,{fallback:Object(R.jsx)("div",{style:null!==n&&void 0!==n?n:{},children:Object(R.jsx)(J.a,{children:Object(R.jsx)(L.a,{})})}),children:t})},$=Object(a.lazy)((function(){return Promise.all([n.e(0),n.e(8)]).then(n.bind(null,354))})),K=Object(a.lazy)((function(){return Promise.all([n.e(0),n.e(5)]).then(n.bind(null,346))})),V=Object(a.lazy)((function(){return Promise.all([n.e(0),n.e(1),n.e(7)]).then(n.bind(null,355))})),Y=Object(a.lazy)((function(){return Promise.all([n.e(0),n.e(1),n.e(6)]).then(n.bind(null,360))})),q=function(e){var t=e.pipelineData;return Object(R.jsx)(H,{children:Object(R.jsx)(U,{style:{height:"80vh"},children:Object(R.jsxs)(u.d,{children:[Object(R.jsx)(u.b,{exact:!0,path:"/",render:function(e){return Object(R.jsx)(K,Object(o.a)(Object(o.a)({},e),{},{pipelineData:t}))}}),Object(R.jsx)(u.b,{exact:!0,path:"/workflows",render:function(e){return Object(R.jsx)(V,Object(o.a)(Object(o.a)({},e),{},{pipelineData:t}))}}),Object(R.jsx)(u.b,{exact:!0,path:"/all",render:function(e){return Object(R.jsx)(Y,Object(o.a)(Object(o.a)({},e),{},{pipelineData:t}))}}),Object(R.jsx)(u.b,{exact:!0,path:"/404",component:$}),Object(R.jsx)(u.a,{to:"/404"})]})})})},Q=function(){var e=Object(a.useState)(null),t=Object(c.a)(e,2),n=t[0],i=t[1],l=r.a.useState("light"),p=Object(c.a)(l,2),m=p[0],x=p[1],v=r.a.useMemo((function(){return{toggleColorMode:function(){x((function(e){return"light"===e?"dark":"light"}))}}}),[]),w=r.a.useMemo((function(){return Object(s.a)({palette:Object(o.a)({mode:m},"light"===m?O:D)})}),[m]);return Object(a.useEffect)((function(){Object(B.a)("manualRuns")&&Object(B.a)("nightlyRuns")&&Object(B.a)("allRuns")&&n||(Object(b.a)(g.a.allWorkflows()).then((function(e){var t=j(e);f(t).then((function(e){var t=e.nightly,n=e.manual,a=e.all;Object(B.b)("nightlyRuns",t),Object(B.b)("manualRuns",n),Object(B.b)("allRuns",a),i({nightly:t,manual:n,all:a})}))})).catch((function(){})),Object(B.a)("litmusGoCommits")||Object(b.a)(g.a.commits()).then((function(e){Object(B.b)("litmusGoCommits",e)})).catch((function(){})))}),[n]),Object(R.jsx)(F.Provider,{value:v,children:Object(R.jsx)(d.a,{theme:w,children:Object(R.jsx)(u.c,{history:h.a,children:Object(R.jsx)(q,{pipelineData:n})})})})},X=n(65),Z=n(114),ee=n(115),te=n(117),ne=n(39);X.a.use(ee.a).use(Z.a).use(ne.e).init({lng:"en",fallbackLng:{"en-US":["en"],"en-GB":["en"],"en-UK":["en"],default:["en"]},debug:!0,ns:["translation"],defaultNS:"translation",backend:{loadPath:"".concat("/litmus-e2e/dashboard","/locales/{{lng}}/{{ns}}.yaml"),parse:function(e){return te.a.load(e)}},interpolation:{escapeValue:!1},react:{useSuspense:!1}});X.a;l.a.render(Object(R.jsx)(r.a.StrictMode,{children:Object(R.jsx)(Q,{})}),document.getElementById("root"))},26:function(e,t,n){"use strict";n.d(t,"b",(function(){return a})),n.d(t,"a",(function(){return r}));var a=function(e,t){"undefined"!==typeof window&&localStorage.setItem(e,JSON.stringify(t))},r=function(e){return"undefined"!==typeof window?JSON.parse(localStorage.getItem(e)):null}},31:function(e,t,n){"use strict";var a=n(102),r=n.n(a);t.a=function(e){return r()({method:"GET",url:e,headers:{Accept:"application/vnd.github.v3+json"}}).then((function(e){return e.data})).catch((function(e){console.error(e)}))}},32:function(e,t,n){"use strict";var a="https://api.github.com",r="litmuschaos",i={allWorkflows:function(){return"".concat(a,"/repos/").concat(r,"/litmus-e2e/actions/workflows")},allPipelines:function(){return"".concat(a,"/repos/").concat(r,"/litmus-e2e/actions/runs")},pipelinesByWorkflow:function(e){return"".concat(a,"/repos/").concat(r,"/litmus-e2e/actions/workflows/").concat(e,"/runs")},pipelineJobs:function(e){return"".concat(a,"/repos/").concat(r,"/litmus-e2e/actions/runs/").concat(e,"/jobs")},commits:function(){return"".concat(a,"/repos/").concat(r,"/litmus-go/commits")}};t.a=i},55:function(e,t,n){"use strict";n(0);var a=n(171),r=Object(a.a)({center:{width:"100%",height:"100%",display:"flex",justifyContent:"center",alignItems:"center"}}),i=n(2);t.a=function(e){var t=e.children,n=e.className,a=r();return Object(i.jsx)("div",{className:"".concat(a.center," ").concat(n),children:t})}},58:function(e,t,n){"use strict";n.d(t,"b",(function(){return l})),n.d(t,"c",(function(){return o})),n.d(t,"d",(function(){return c})),n.d(t,"a",(function(){return s}));var a=n(168),r=n(162),i=n(163),l=function(e){return null===e||void 0===e?void 0:e.replace(/-/g," ")},o=function(e,t){if(!e||!t)return"";var n=Object(a.a)({start:new Date(e),end:new Date(t)});return Object(r.a)(n)||"0 second"},c=function(e,t){return e&&t?Object(i.a)(new Date(e),new Date(t))||"0 second":""},s=function(e){var t=0;e.forEach((function(e){(null===e||void 0===e?void 0:e.completed_at)&&(null===e||void 0===e?void 0:e.started_at)&&(t+=new Date(null===e||void 0===e?void 0:e.completed_at).getTime()-new Date(null===e||void 0===e?void 0:e.started_at).getTime())}));var n=new Date;return o(n,new Date(n.getTime()+t))}},62:function(e,t,n){"use strict";n.d(t,"b",(function(){return a})),n.d(t,"a",(function(){return r}));var a=/^Nightly.*Pipeline$/,r=/.*Pipeline$/},84:function(e,t,n){"use strict";n(0);var a=n(194),r=n(192),i=n(55),l=n(171),o=Object(l.a)((function(e){return{spinner:{color:e.palette.primary.main}}})),c=n(2);t.a=function(e){var t=e.size,n=e.message,l=o();return Object(c.jsxs)("div",{children:[Object(c.jsx)(i.a,{children:Object(c.jsx)(a.a,{className:l.spinner,size:t||40})}),Object(c.jsx)(r.a,{children:n})]})}},90:function(e,t,n){"use strict";var a=n(12),r=Object(a.a)({basename:"/litmus-e2e/dashboard"});t.a=r}},[[161,3,4]]]);
//# sourceMappingURL=main.2f7dc3d7.chunk.js.map