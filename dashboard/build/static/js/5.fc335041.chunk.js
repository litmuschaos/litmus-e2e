(this["webpackJsonpe2e-dashboard"]=this["webpackJsonpe2e-dashboard"]||[]).push([[5],{186:function(e,t,a){"use strict";a(0);var n=a(183),i=a(326),l=a(10),s=a(115),c=a(300),r=Object(l.a)((function(){return{tooltip:{left:"-15px"}}}))(c.a),o=Object(s.a)((function(){return{smallRadialChart:{height:"3rem",margin:"0.5rem 0",width:"3rem","& p":{fontSize:"1rem",maxWidth:"8rem",minWidth:"1rem",lineHeight:"1rem",height:"0.5rem"}},largeRadialChart:{height:"7rem",margin:"0.5rem 0",width:"7rem","& p":{fontSize:"2rem",maxWidth:"8rem",minWidth:"1rem",lineHeight:"1rem",height:"0.5rem"}}}})),d=a(2);t.a=function(e){var t=e.pass,a=void 0===t?0:t,l=e.fail,s=void 0===l?0:l,c=e.pending,j=void 0===c?0:c,b=e.size,u=void 0===b?"small":b,m=o(),p=Object(n.a)().t;return Object(d.jsx)(r,{title:Object(d.jsxs)("p",{children:[p("radialChart.pass"),": ",a,Object(d.jsx)("br",{}),p("radialChart.fail"),": ",s,Object(d.jsx)("br",{}),p("radialChart.pending"),": ",j]}),placement:"right",arrow:!0,children:Object(d.jsx)("div",{className:"small"===u?m.smallRadialChart:m.largeRadialChart,children:Object(d.jsx)(i.a,{arcWidth:4,showLegend:!1,circleExpandOnHover:3,radialData:[{baseColor:"#00CC9A",label:"Pass",value:a},{baseColor:"#5252F6",label:"Pending",value:j},{baseColor:"#CA2C2C",label:"Failed",value:s}],showCenterHeading:!1})})})}},204:function(e,t,a){"use strict";var n=a(205),i=a(38),l=a(0),s=a(183),c=a(223),r=a(178),o=a(337),d=a(330),j=a(222),b=a(186),u=a(50),m=a(31),p=a(30),h=a(13),O=a(226),x=a(194),f=a.n(x),v=a(115),g=a(331),N=a(312),C=a(311),P=a(327),y=a(159),S=a(333),D=a(310),k=a(305),w=a(306),I=a(308),_=a(309),E=a(307),G=Object(v.a)((function(){return{drawerContainer:{minWidth:"22rem",marginTop:"3rem",textAlign:"left"},outlinedPills:{display:"block",margin:"0.5rem",width:"min-content",borderRadius:"1rem",padding:"0.5rem 1rem 1.5rem 1rem",fontWeight:"500"},muted:{color:"#6c757d"},topMargin:{marginTop:"1rem"}}})),W=a(2),B="#09825d",z="#dd2b0e",F="#3a97d4",A="#949ab7",L=function(e){var t=e.step,a=e.connectorLine,n=void 0===a||a,i=G();if("completed"===t.status)switch(t.conclusion){case"success":return Object(W.jsxs)(k.a,{children:[Object(W.jsxs)(w.a,{children:[Object(W.jsx)(E.a,{children:Object(W.jsx)(y.a,{name:"experimentPassed",color:B})}),n&&Object(W.jsx)(I.a,{})]}),Object(W.jsxs)(_.a,{children:[t.name," ",Object(W.jsxs)("span",{className:i.muted,children:["(",Object(u.c)(null===t||void 0===t?void 0:t.started_at,null===t||void 0===t?void 0:t.completed_at),")"]})]})]});case"failure":return Object(W.jsxs)(k.a,{children:[Object(W.jsxs)(w.a,{children:[Object(W.jsx)(E.a,{children:Object(W.jsx)(y.a,{name:"experimentFailed",color:z})}),n&&Object(W.jsx)(I.a,{})]}),Object(W.jsxs)(_.a,{children:[t.name," ",Object(W.jsxs)("span",{className:i.muted,children:["(",Object(u.c)(null===t||void 0===t?void 0:t.started_at,null===t||void 0===t?void 0:t.completed_at),")"]})]})]});case"skipped":return Object(W.jsxs)(k.a,{children:[Object(W.jsxs)(w.a,{children:[Object(W.jsx)(E.a,{children:Object(W.jsx)(y.a,{name:"experimentSkipped",color:A})}),n&&Object(W.jsx)(I.a,{})]}),Object(W.jsxs)(_.a,{children:[t.name," ",Object(W.jsxs)("span",{className:i.muted,children:["(",Object(u.c)(null===t||void 0===t?void 0:t.started_at,null===t||void 0===t?void 0:t.completed_at),")"]})]})]});default:return Object(W.jsxs)(k.a,{children:[Object(W.jsxs)(w.a,{children:[Object(W.jsx)(E.a,{children:Object(W.jsx)(y.a,{name:"experimentError",color:z})}),n&&Object(W.jsx)(I.a,{})]}),Object(W.jsxs)(_.a,{children:[t.name," ",Object(W.jsxs)("span",{className:i.muted,children:["(",Object(u.c)(null===t||void 0===t?void 0:t.started_at,null===t||void 0===t?void 0:t.completed_at),")"]})]})]})}return Object(W.jsxs)(k.a,{children:[Object(W.jsxs)(w.a,{children:[Object(W.jsx)(E.a,{children:Object(W.jsx)(y.a,{name:"experimentPending",color:F})}),n&&Object(W.jsx)(I.a,{})]}),Object(W.jsxs)(_.a,{children:[t.name," ",Object(W.jsxs)("span",{className:i.muted,children:["(",Object(u.c)(null===t||void 0===t?void 0:t.started_at,null===t||void 0===t?void 0:t.completed_at),")"]})]})]})},R=function(e){var t=e.job;return Object(W.jsx)(D.a,{children:t.steps&&t.steps.map((function(e,a){return a===t.steps.length-1?Object(W.jsx)(L,{step:e,connectorLine:!1}):Object(W.jsx)(L,{step:e})}))})},T={action_required:"pending",cancelled:"fail",failure:"fail",neutral:"pass",skipped:"pass",stale:"pass",startup_failure:"fail",success:"pass",timed_out:"fail"},H=function(e){var t={pending:0,pass:0,fail:0};return e&&Array.isArray(e)&&e.forEach((function(e){"completed"!==(null===e||void 0===e?void 0:e.status)?++t.pending:++t[T[null===e||void 0===e?void 0:e.conclusion]]})),t},M={"Component Pipeline":"It contains the test cases (GO BDDs) for component-level generic experiments","Pod Level Pipeline":"It contains the test cases (GO BDDs) for all pod-level generic experiments","Node Level Pipeline":"It contains the test cases (GO BDDs) for node-level generic experiments","AWS Experiment Pipeline":"It contains the test cases (GO BDDs) for all AWS experiments","Portal E2E K3S Pipeline":"It contains different UI E2E test cases for litmus portal","GCP Experiment Pipeline":"It contains the test cases (GO BDDs) for all GCP experiments","Nightly Component Pipeline":"It contains the test cases (GO BDDs) for component-level generic experiments","Nightly Pod Level Pipeline":"It contains the test cases (GO BDDs) for all pod-level generic experiments","Nightly Node Level Pipeline":"It contains the test cases (GO BDDs) for node-level generic experiments","Nightly AWS Experiment Pipeline":"It contains the test cases (GO BDDs) for all AWS experiments","Nightly Portal E2E K3S Pipeline":"It contains different UI E2E test cases for litmus portal","Nightly GCP Experiment Pipeline":"It contains the test cases (GO BDDs) for all GCP experiments"},J=["children","value","index"],V=function(e){var t=e.children,a=e.value,n=e.index,i=Object(O.a)(e,J);return Object(W.jsx)("div",Object(h.a)(Object(h.a)({role:"tabpanel",hidden:a!==n,id:"vertical-tabpanel-".concat(n),"aria-labelledby":"vertical-tab-".concat(n)},i),{},{children:a===n&&Object(W.jsx)(P.a,{p:3,children:Object(W.jsx)(r.a,{children:t})})}))},q={action_required:"pending",cancelled:"failed",failure:"failed",neutral:"succeeded",skipped:"succeeded",stale:"succeeded",startup_failure:"failed",success:"succeeded",timed_out:"failed"},K=Object(v.a)((function(e){return{root:{flexGrow:1,backgroundColor:e.palette.background.paper,display:"flex",height:"max-content"},tabs:{borderRight:"1px solid ".concat(e.palette.divider)},tab:{"& span.MuiTab-wrapper":{alignItems:"flex-start"}},outlinedPills:{display:"block",margin:"0.5rem",width:"min-content",borderRadius:"1rem",padding:"0.5rem 1rem 1.5rem 1rem",fontWeight:"500"}}}));function U(e){var t=e.data,a=e.pipelineId,n=K(),c=Object(l.useState)(0),r=Object(i.a)(c,2),o=r[0],d=r[1],j=Object(l.useState)(H(t.jobs[0].steps)||{pending:0,pass:0,fail:0}),m=Object(i.a)(j,2),p=m[0],O=m[1],x=Object(s.a)().t;return Object(W.jsxs)(W.Fragment,{children:[Object(W.jsx)("hr",{}),Object(W.jsxs)(C.a,{container:!0,rowSpacing:1,columnSpacing:{xs:1,sm:2,md:3},children:[Object(W.jsx)(C.a,{item:!0,xs:7,children:Object(W.jsxs)("p",{children:[x("table.pipelineId"),":"," ",Object(W.jsxs)("a",{href:"https://github.com/litmuschaos/litmus-e2e/actions/runs/".concat(a),target:"_blank",rel:"noopener noreferrer",children:[a,Object(W.jsx)(y.a,{name:"externalLink"})]}),Object(W.jsx)("br",{}),Object(W.jsx)(y.a,{name:"clock",size:"sm"})," ",Object(u.a)(null===t||void 0===t?void 0:t.jobs)," ",Object(W.jsx)("br",{})]})}),Object(W.jsx)(C.a,{item:!0,xs:5,children:Object(W.jsx)("div",{style:{display:"flex",justifyContent:"center"},children:p&&Object(W.jsxs)(W.Fragment,{children:[Object(W.jsx)(b.a,{pass:p.pass,fail:p.fail,pending:p.pending}),Object(W.jsx)("a",{href:t.jobs[o].html_url,target:"_blank",rel:"noopener noreferrer",style:{color:"black",height:"auto",marginTop:"auto",marginBottom:"auto"},children:Object(W.jsx)(f.a,{style:{height:"auto",fontSize:"2.1rem"}})})]})})})]}),Object(W.jsx)("hr",{}),Object(W.jsxs)("div",{className:n.root,children:[Object(W.jsx)(g.a,{orientation:"vertical",variant:"scrollable",value:o,onChange:function(e,a){d(a),O(H(t.jobs[a].steps))},"aria-label":"Vertical tabs example",className:n.tabs,children:t&&t.jobs&&t.jobs.map((function(e,t){return Object(W.jsx)(N.a,Object(h.a)(Object(h.a)({label:Object(W.jsx)(S.a,{color:"primary",label:e.name,size:"medium",variant:q[e.conclusion],className:n.outlinedPills})},function(e){return{id:"vertical-tab-".concat(e),"aria-controls":"vertical-tabpanel-".concat(e)}}(t)),{},{className:n.tab}))}))}),t&&t.jobs.map((function(e,t){return Object(W.jsx)(V,{value:o,index:t,children:Object(W.jsx)(R,{job:e})})}))]}),Object(W.jsx)("hr",{})]})}t.a=function(e){var t=e.data,a=e.tableName,h=e.match,O=(h=void 0===h?{}:h).params,x=(O=void 0===O?{}:O).pipelineName,f=e.displayVersion,v=void 0===f||f,g=Object(l.useState)(10),N=Object(i.a)(g,2),C=N[0],P=N[1],y=Object(l.useState)(null),S=Object(i.a)(y,2),D=S[0],k=S[1],w=Object(l.useState)(!1),I=Object(i.a)(w,2),_=I[0],E=I[1],B=Object(l.useState)("litmus-go"),z=Object(i.a)(B,2),F=z[0],A=z[1],L=G(),R=Object(s.a)().t,T=function(e){return function(t){("keydown"!==t.type||"Tab"!==t.key&&"Shift"!==t.key)&&E(e)}},H=[{field:"id",headerName:"Pipeline Id",flex:1,renderCell:function(e){return Object(W.jsx)(o.a,{size:"small",variant:"highlight",onClick:function(){return t=e.value,void Object(p.a)(m.a.pipelineJobs(t)).then((function(e){k({pipelineId:t,jobs:e}),E(!0)}));var t},children:e.value})}},{field:"created_at",headerName:"Created Time",flex:1,renderCell:function(e){return"".concat(Object(j.a)(new Date(e.value))," ago")}},{field:"head_commit",headerName:"Description",flex:1,renderCell:function(e){return Object(W.jsxs)(W.Fragment,{children:[Object(W.jsx)("a",{href:"https://github.com/litmuschaos/".concat(F,"/commit/").concat(e.value.id),children:"#".concat(e.value.id.substring(0,6))})," ","\xa0 ",R("table.repository"),": ",F]})}}].concat(Object(n.a)(v?[{field:"version",headerName:"Version",flex:1,renderCell:function(){return"ci"}}]:[]),[{field:"status",headerName:"Status",flex:1,renderCell:function(){return Object(W.jsx)(b.a,{pass:4,fail:2,pending:1})}}]);return Object(l.useEffect)((function(){(null!=(null===a||void 0===a?void 0:a.match(/.*Portal.*$/))||(null===x||void 0===x?void 0:x.match(/.*Portal.*$/)))&&A("litmus")}),[]),Object(W.jsxs)(W.Fragment,{children:[Object(W.jsx)(r.a,{variant:"h3",component:"h2",align:"center",className:L.topMargin,children:Object(u.b)(a)||Object(u.b)(x)}),Object(W.jsx)(r.a,{variant:"subtitle1",component:"h3",align:"center",className:L.topMargin,children:M[a]||M[x]}),Object(W.jsx)("br",{}),t&&Object(W.jsx)(c.a,{rows:t,columns:H,id:a||x,pageSize:C,onPageSizeChange:function(e){return P(e)},rowsPerPageOptions:[5,10,20],autoHeight:!0,pagination:!0,disableSelectionOnClick:!0}),Object(W.jsx)(d.a,{anchor:"right",icon:"close",variant:"temporary",onButtonClose:T(!1),onClose:T(!1),open:_,children:Object(W.jsx)("div",{className:L.drawerContainer,children:Object(W.jsx)(U,{data:null===D||void 0===D?void 0:D.jobs,pipelineId:null===D||void 0===D?void 0:D.pipelineId})})})]})}},325:function(e,t,a){"use strict";a.r(t);var n=a(38),i=a(0),l=a(183),s=a(115),c=a(339),r=a(315),o=a(328),d=a(338),j=a(40),b=a(204),u=a(186),m=a(32),p=a(31),h=a(30),O=a(2),x=Object(s.a)((function(e){return{formControl:{margin:e.spacing(1),minWidth:120},label:{color:"#0000008a"}}}));t.default=function(e){var t,a,s=e.location,f=x(),v=Object(i.useState)({id:(null===s||void 0===s||null===(t=s.state)||void 0===t?void 0:t.id)||"",readableName:(null===s||void 0===s||null===(a=s.state)||void 0===a?void 0:a.readableName)||""}),g=Object(n.a)(v,2),N=g[0],C=g[1],P=Object(i.useState)(null),y=Object(n.a)(P,2),S=y[0],D=y[1],k=Object(m.a)("manualRuns");Object(i.useEffect)((function(){N.id&&Object(h.a)(p.a.pipelinesByWorkflow(N.id)).then((function(e){D(null===e||void 0===e?void 0:e.workflow_runs)}))}),[N.id]);var w=Object(l.a)().t;return Object(O.jsxs)(O.Fragment,{children:[Object(O.jsxs)(j.a,{children:[Object(O.jsxs)(d.a,{children:[w("pipelinePage.selectManual"),":"]}),Object(O.jsxs)(r.a,{variant:"outlined",className:f.formControl,children:[Object(O.jsx)(c.a,{htmlFor:"outlined-pipelineName",className:f.label,children:w("pipelinePage.pipelineName")}),Object(O.jsxs)(o.a,{native:!0,value:N.id,onChange:function(e){C({id:e.target.value,readableName:e.target.options[e.target.selectedIndex].text})},label:"pipelineName",inputProps:{name:"pipelineName",id:"outlined-pipelineName"},children:[Object(O.jsx)("option",{"aria-label":"None",value:""}),k&&k.map((function(e){return Object(O.jsx)("option",{value:e.id,children:e.readableName},e.id)}))]})]})]}),N.id&&S&&Object(O.jsxs)(O.Fragment,{children:[Object(O.jsx)(j.a,{children:Object(O.jsx)(u.a,{pass:20,fail:5,pending:2,size:"large"})}),Object(O.jsx)(b.a,{tableName:N.readableName,data:S})]})]})}}}]);
//# sourceMappingURL=5.fc335041.chunk.js.map