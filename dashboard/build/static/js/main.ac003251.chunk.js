(this["webpackJsonpe2e-dashboard"]=this["webpackJsonpe2e-dashboard"]||[]).push([[2],{152:function(e,t,n){"use strict";n.r(t);var a=n(0),c=n.n(a),r=n(35),i=n.n(r),s=n(38),o=n(182),l=n(4),u=n(79),d=n(30),b=n(31),j=n(13),h=n(50),m=function(e){if(e){var t=[],n=[];return e.workflows.forEach((function(e){null!=e.name.match(/^Nightly.*Pipeline$/)?t.push(Object(j.a)(Object(j.a)({},e),{},{readableName:Object(h.b)(e.name)})):null!=e.name.match(/.*Pipeline$/)&&n.push(Object(j.a)(Object(j.a)({},e),{},{readableName:Object(h.b)(e.name)}))})),{nightly:t,manual:n}}return{nightly:null,manual:null}},f=n(32),p=n(179),O=n(183),g=n(26),x=n(178),v=n(175),y=n(177),w=n(100),k=n.n(w),N=n(101),S=n.n(N),T=n(102),D=n.n(T),z=n(159),B=n.p+"static/media/slack.bce3d9aa.svg",R=n(115),C=Object(R.a)((function(e){return{appBar:{position:"sticky",boxShadow:"0px 0.6px 1.8px rgba(0, 0, 0, 0.1), 0px 3.2px 7.2px rgba(0, 0, 0, 0.13)"},toolBar:{height:"4.9rem",display:"flex",justifyContent:"space-between",background:e.palette.header,padding:e.spacing(0,7.5),"& *":{color:e.palette.text.secondary},"& nav":{flexGrow:1,marginLeft:e.spacing(15)}},details:{display:"flex",justifyContent:"flex-end"},nounderline:{textDecoration:"none"},chaosText:{fontSize:"1.625rem",color:e.palette.text.secondary,fontWeight:600},active:{background:"".concat(e.palette.cards.highlight," !important")},profileButtons:{marginTop:e.spacing(3.75)},homeIcon:{"& svg":{marginBottom:"0.3rem"}},rightSection:{display:"flex",justifyContent:"space-between","& div":{marginRight:"0.5rem"},"& a":{textDecoration:"none"}},slackIcon:{height:"max-content",paddingTop:"0.4rem"},middleSection:{display:"flex",justifyContent:"flex-start",flexGrow:1,marginLeft:"3rem","& a":{margin:"0 1.5rem"}}}})),I=n(2),P=function(){var e=C(),t=Object(a.useState)({version:"",stars:"",forks:""}),n=Object(s.a)(t,2),c=n[0],r=n[1];Object(a.useEffect)((function(){Object(d.a)(b.a.releaseTag()).then((function(e){r((function(t){return Object(j.a)(Object(j.a)({},t),{},{version:null===e||void 0===e?void 0:e.tag_name})}))})),Object(d.a)(b.a.repoDetails()).then((function(e){r((function(t){return Object(j.a)(Object(j.a)({},t),{},{stars:null===e||void 0===e?void 0:e.stargazers_count,forks:null===e||void 0===e?void 0:e.forks_count})}))}))}),[]);var i=Object(O.a)().t;return Object(I.jsx)("div",{"data-cy":"headerComponent",children:Object(I.jsx)(v.a,{className:e.appBar,children:Object(I.jsxs)(y.a,{disableGutters:!0,className:e.toolBar,children:[Object(I.jsx)(g.a,{to:{pathname:"/"},className:e.nounderline,children:Object(I.jsxs)(x.a,{className:e.chaosText,variant:"body1",children:[Object(I.jsx)(z.a,{name:"home",size:"xl",color:"white",className:e.homeIcon})," ",i("header.e2eDashboard")]})}),Object(I.jsxs)("div",{className:e.middleSection,children:[Object(I.jsx)(g.a,{to:{pathname:"/nightly-runs"},className:e.nounderline,children:Object(I.jsx)(x.a,{variant:"body1",children:i("header.nightlyRun")})}),Object(I.jsx)(g.a,{to:{pathname:"/manual-runs"},className:e.nounderline,children:Object(I.jsx)(x.a,{variant:"body1",children:i("header.manualRun")})})]}),Object(I.jsxs)("div",{className:e.rightSection,children:[Object(I.jsx)("div",{className:e.slackIcon,children:Object(I.jsx)("a",{href:"https://docs.litmuschaos.io/",target:"_blank",rel:"noopener noreferrer",children:Object(I.jsx)(z.a,{name:"document",size:"xl",color:"white"})})}),Object(I.jsx)("div",{className:e.slackIcon,children:Object(I.jsx)("a",{href:"https://slack.litmuschaos.io/",target:"_blank",rel:"noopener noreferrer",children:Object(I.jsx)("img",{src:B,alt:"slack logo"})})}),Object(I.jsx)("div",{children:Object(I.jsxs)("a",{href:"https://github.com/litmuschaos/litmus",target:"_blank",rel:"noopener noreferrer",children:[i("header.githubRepo"),Object(I.jsx)("br",{}),Object(I.jsx)(k.a,{style:{paddingTop:4}}),c.version,Object(I.jsx)(S.a,{style:{paddingTop:4}}),c.stars,Object(I.jsx)(D.a,{style:{paddingTop:4}}),c.forks]})})]})]})})})},_=Object(R.a)((function(e){return{root:{height:"100vh",width:"100%",gridTemplateColumns:"20.5em auto",gridTemplateRows:"6.5em auto",gridTemplateAreas:'"header header" "sidebar content"',"& ::-webkit-scrollbar":{width:"0.4rem",height:"0.4rem"},"& ::-webkit-scrollbar-track":{marginTop:e.spacing(1),webkitBoxShadow:"inset 0 0 8px ".concat(e.palette.common.black),backgroundColor:e.palette.border.main},"& ::-webkit-scrollbar-thumb":{backgroundColor:e.palette.highlight,borderRadius:8},"& img":{userDrag:"none"}},header:{gridArea:"header"},content:{gridArea:"content",padding:e.spacing(5,7.5,10),overflowY:"auto"}}})),E=function(e){var t=e.children,n=_();return Object(I.jsxs)("div",{className:n.root,children:[Object(I.jsx)(p.a,{}),Object(I.jsx)("header",{className:n.header,children:Object(I.jsx)(P,{})}),Object(I.jsx)("main",{className:n.content,children:t})]})},G=n(40),J=n(180),A=Object(R.a)((function(e){return{spinner:{color:e.palette.primary.main}}})),W=function(e){var t=e.size,n=e.message,a=A();return Object(I.jsxs)("div",{children:[Object(I.jsx)(G.a,{children:Object(I.jsx)(J.a,{className:a.spinner,size:t||40})}),Object(I.jsx)(x.a,{children:n})]})},L=function(e){var t=e.children,n=e.style;return Object(I.jsx)(a.Suspense,{fallback:Object(I.jsx)("div",{style:null!==n&&void 0!==n?n:{},children:Object(I.jsx)(G.a,{children:Object(I.jsx)(W,{})})}),children:t})},U=Object(a.lazy)((function(){return Promise.all([n.e(0),n.e(8)]).then(n.bind(null,336))})),$=Object(a.lazy)((function(){return Promise.all([n.e(0),n.e(7)]).then(n.bind(null,329))})),K=Object(a.lazy)((function(){return Promise.all([n.e(0),n.e(1),n.e(6)]).then(n.bind(null,299))})),M=Object(a.lazy)((function(){return Promise.all([n.e(0),n.e(1),n.e(5)]).then(n.bind(null,325))})),V=function(){return Object(I.jsx)(E,{children:Object(I.jsx)(L,{style:{height:"80vh"},children:Object(I.jsxs)(l.d,{children:[Object(I.jsx)(l.b,{exact:!0,path:"/",render:function(e){return Object(I.jsx)($,Object(j.a)({},e))}}),Object(I.jsx)(l.b,{exact:!0,path:"/manual-runs",render:function(e){return Object(I.jsx)(M,Object(j.a)({},e))}}),Object(I.jsx)(l.b,{exact:!0,path:"/nightly-runs",render:function(e){return Object(I.jsx)(K,Object(j.a)({},e))}}),Object(I.jsx)(l.b,{exact:!0,path:"/404",component:U}),Object(I.jsx)(l.a,{to:"/404"})]})})})},Y=function(){var e=Object(a.useState)(null),t=Object(s.a)(e,2),n=t[0],c=t[1];return Object(a.useEffect)((function(){Object(f.a)("manualRuns")&&Object(f.a)("nightlyRuns")&&n||Object(d.a)(b.a.allWorkflows()).then((function(e){var t=m(e),n=t.nightly,a=t.manual;Object(f.b)("nightlyRuns",n),Object(f.b)("manualRuns",a),c({nightly:n,manual:a})}))}),[n]),Object(I.jsx)(o.a,{children:Object(I.jsx)(l.c,{history:u.a,children:Object(I.jsx)(V,{})})})},q=n(58),F=n(103),H=n(104),Q=n(106),X=n(34);q.a.use(H.a).use(F.a).use(X.e).init({lng:"en",fallbackLng:{"en-US":["en"],"en-GB":["en"],"en-UK":["en"],default:["en"]},debug:!0,ns:["translation"],defaultNS:"translation",backend:{loadPath:"".concat("/litmus-e2e/dashboard/build","/locales/{{lng}}/{{ns}}.yaml"),parse:function(e){return Q.a.load(e)}},interpolation:{escapeValue:!1},react:{useSuspense:!1}});q.a;i.a.render(Object(I.jsx)(c.a.StrictMode,{children:Object(I.jsx)(Y,{})}),document.getElementById("root"))},30:function(e,t,n){"use strict";var a=n(91),c=n.n(a);t.a=function(e){return c()({method:"GET",url:e,headers:{Accept:"application/vnd.github.v3+json"}}).then((function(e){return e.data})).catch((function(e){console.error(e)}))}},31:function(e,t,n){"use strict";var a="https://api.github.com",c={allWorkflows:function(){return"".concat(a,"/repos/litmuschaos/litmus-e2e/actions/workflows")},allPipelines:function(){return"".concat(a,"/repos/litmuschaos/litmus-e2e/actions/runs")},pipelinesByWorkflow:function(e){return"".concat(a,"/repos/litmuschaos/litmus-e2e/actions/workflows/").concat(e,"/runs")},pipelineJobs:function(e){return"".concat(a,"/repos/litmuschaos/litmus-e2e/actions/runs/").concat(e,"/jobs")},releaseTag:function(){return"".concat(a,"/repos/litmuschaos/litmus/releases/latest")},repoDetails:function(){return"".concat(a,"/repos/litmuschaos/litmus")}};t.a=c},32:function(e,t,n){"use strict";n.d(t,"b",(function(){return a})),n.d(t,"a",(function(){return c}));var a=function(e,t){"undefined"!==typeof window&&localStorage.setItem(e,JSON.stringify(t))},c=function(e){return"undefined"!==typeof window?JSON.parse(localStorage.getItem(e)):null}},40:function(e,t,n){"use strict";n(0);var a=n(115),c=n(2),r=Object(a.a)({center:{width:"100%",height:"100%",display:"flex",justifyContent:"center",alignItems:"center"}});t.a=function(e){var t=e.children,n=e.className,a=r();return Object(c.jsx)("div",{className:"".concat(a.center," ").concat(n),children:t})}},50:function(e,t,n){"use strict";n.d(t,"b",(function(){return c})),n.d(t,"c",(function(){return r})),n.d(t,"a",(function(){return i}));var a=n(90),c=function(e){return null===e||void 0===e?void 0:e.replace(/-/g," ")},r=function(e,t){return Object(a.a)(new Date(e),new Date(t))},i=function(e){var t=0;e.forEach((function(e){t+=new Date(null===e||void 0===e?void 0:e.completed_at).getTime()-new Date(null===e||void 0===e?void 0:e.started_at).getTime()}));var n=new Date;return r(n,new Date(n.getTime()+t))}},79:function(e,t,n){"use strict";var a=n(9),c=Object(a.a)({basename:"/litmus-e2e/dashboard/build"});t.a=c}},[[152,3,4]]]);
//# sourceMappingURL=main.ac003251.chunk.js.map