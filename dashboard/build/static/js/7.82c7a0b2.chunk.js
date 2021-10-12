(this["webpackJsonpe2e-dashboard"]=this["webpackJsonpe2e-dashboard"]||[]).push([[7],{1024:function(e,a,t){"use strict";var n=t(0),l=t.n(n),r=t(217),i=t(5),c=t(413),o=t(1015),m=Object(i.a)((function(){return{tooltip:{left:"-15px"}}}))(o.a),s=Object(c.a)((function(){return{smallRadialChart:{height:"3rem",margin:"0.5rem 0",width:"3rem","& p":{fontSize:"1rem",maxWidth:"8rem",minWidth:"1rem",lineHeight:"1rem",height:"0.5rem"}},largeRadialChart:{height:"7rem",margin:"0.5rem 0",width:"7rem","& p":{fontSize:"2rem",maxWidth:"8rem",minWidth:"1rem",lineHeight:"1rem",height:"0.5rem"}}}}));a.a=function(e){var a=e.pass,t=void 0===a?0:a,n=e.fail,i=void 0===n?0:n,c=e.pending,o=void 0===c?0:c,d=e.size,u=void 0===d?"small":d,p=s();return l.a.createElement(m,{title:l.a.createElement("p",null,"Pass: ",t,l.a.createElement("br",null),"Fail: ",i,l.a.createElement("br",null),"Pending: ",o),placement:"right",arrow:!0},l.a.createElement("div",{className:"small"===u?p.smallRadialChart:p.largeRadialChart},l.a.createElement(r.RadialChart,{arcWidth:4,showLegend:!1,circleExpandOnHover:3,radialData:[{baseColor:"#00CC9A",label:"Pass",value:t},{baseColor:"#5252F6",label:"Pending",value:o},{baseColor:"#CA2C2C",label:"Failed",value:i}],showCenterHeading:!1})))}},1033:function(e,a,t){"use strict";var n=t(128),l=t(24),r=t(0),i=t.n(r),c=t(1036),o=t(963),m=t(217),s=t(1035),d=t(1024),u=t(344),p=t(452),b=t(451),E=t(413),v=Object(E.a)((function(){return{drawerContainer:{minWidth:"22rem",marginTop:"3rem",textAlign:"left"},outlinedPills:{display:"block",margin:"0.5rem",width:"min-content",borderRadius:"1rem",padding:"0.5rem 1rem 1.5rem 1rem",fontWeight:"500"},muted:{color:"#6c757d"},topMargin:{marginTop:"1rem"}}})),g=t(1037),f=t(1025),h=t.n(f),j=t(1018),O=t(1010),C=t(1004),N=t(411),x=t(1046),w=t(1047),y=t(1048),k=t(1049),_=t(1050),S=t(1051),P="#09825d",I="#dd2b0e",F="#3a97d4",z="#949ab7",R=function(e){var a=e.step,t=e.connectorLine,n=void 0===t||t,l=v();if("completed"===a.status)switch(a.conclusion){case"success":return i.a.createElement(x.a,null,i.a.createElement(w.a,null,i.a.createElement(y.a,null,i.a.createElement(m.Icon,{name:"experimentPassed",color:P})),n&&i.a.createElement(k.a,null)),i.a.createElement(_.a,null,a.name," ",i.a.createElement("span",{className:l.muted},"(",Object(u.c)(null===a||void 0===a?void 0:a.started_at,null===a||void 0===a?void 0:a.completed_at),")")));case"failure":return i.a.createElement(x.a,null,i.a.createElement(w.a,null,i.a.createElement(y.a,null,i.a.createElement(m.Icon,{name:"experimentFailed",color:I})),n&&i.a.createElement(k.a,null)),i.a.createElement(_.a,null,a.name," ",i.a.createElement("span",{className:l.muted},"(",Object(u.c)(null===a||void 0===a?void 0:a.started_at,null===a||void 0===a?void 0:a.completed_at),")")));case"skipped":return i.a.createElement(x.a,null,i.a.createElement(w.a,null,i.a.createElement(y.a,null,i.a.createElement(m.Icon,{name:"experimentSkipped",color:z})),n&&i.a.createElement(k.a,null)),i.a.createElement(_.a,null,a.name," ",i.a.createElement("span",{className:l.muted},"(",Object(u.c)(null===a||void 0===a?void 0:a.started_at,null===a||void 0===a?void 0:a.completed_at),")")));default:return i.a.createElement(x.a,null,i.a.createElement(w.a,null,i.a.createElement(y.a,null,i.a.createElement(m.Icon,{name:"experimentError",color:I})),n&&i.a.createElement(k.a,null)),i.a.createElement(_.a,null,a.name," ",i.a.createElement("span",{className:l.muted},"(",Object(u.c)(null===a||void 0===a?void 0:a.started_at,null===a||void 0===a?void 0:a.completed_at),")")))}return i.a.createElement(x.a,null,i.a.createElement(w.a,null,i.a.createElement(y.a,null,i.a.createElement(m.Icon,{name:"experimentPending",color:F})),n&&i.a.createElement(k.a,null)),i.a.createElement(_.a,null,a.name," ",i.a.createElement("span",{className:l.muted},"(",Object(u.c)(null===a||void 0===a?void 0:a.started_at,null===a||void 0===a?void 0:a.completed_at),")")))},W=function(e){var a=e.job;return i.a.createElement(S.a,null,a.steps&&a.steps.map((function(e,t){return t===a.steps.length-1?i.a.createElement(R,{step:e,connectorLine:!1}):i.a.createElement(R,{step:e})})))},T={action_required:"pending",cancelled:"fail",failure:"fail",neutral:"pass",skipped:"pass",stale:"pass",startup_failure:"fail",success:"pass",timed_out:"fail"},D=function(e){var a={pending:0,pass:0,fail:0};return console.log("jobsteps are",e),e&&Array.isArray(e)&&e.forEach((function(e){"completed"!==(null===e||void 0===e?void 0:e.status)?++a.pending:++a[T[null===e||void 0===e?void 0:e.conclusion]]})),a},V=["children","value","index"],A=function(e){var a=e.children,t=e.value,n=e.index,l=Object(g.a)(e,V);return i.a.createElement("div",Object.assign({role:"tabpanel",hidden:t!==n,id:"vertical-tabpanel-".concat(n),"aria-labelledby":"vertical-tab-".concat(n)},l),t===n&&i.a.createElement(N.a,{p:3},i.a.createElement(o.a,null,a)))},B={action_required:"pending",cancelled:"failed",failure:"failed",neutral:"succeeded",skipped:"succeeded",stale:"succeeded",startup_failure:"failed",success:"succeeded",timed_out:"failed"},H=Object(E.a)((function(e){return{root:{flexGrow:1,backgroundColor:e.palette.background.paper,display:"flex",height:"max-content"},tabs:{borderRight:"1px solid ".concat(e.palette.divider)},tab:{"& span.MuiTab-wrapper":{alignItems:"flex-start"}},outlinedPills:{display:"block",margin:"0.5rem",width:"min-content",borderRadius:"1rem",padding:"0.5rem 1rem 1.5rem 1rem",fontWeight:"500"}}}));function L(e){var a=e.data,t=e.pipelineId;console.log("data inside VerticalTabs is",a);var n=H(),c=Object(r.useState)(0),o=Object(l.a)(c,2),s=o[0],p=o[1],b=Object(r.useState)(D(a.jobs[0].steps)||{pending:0,pass:0,fail:0}),E=Object(l.a)(b,2),v=E[0],g=E[1];return i.a.createElement(i.a.Fragment,null,i.a.createElement("hr",null),i.a.createElement(C.a,{container:!0,rowSpacing:1,columnSpacing:{xs:1,sm:2,md:3}},i.a.createElement(C.a,{item:!0,xs:7},i.a.createElement("p",null,"Pipeline Id: ",i.a.createElement("a",{href:"https://github.com/litmuschaos/litmus-e2e/actions/runs/".concat(t),target:"_blank",rel:"noopener noreferrer"},t,i.a.createElement(m.Icon,{name:"externalLink"})),i.a.createElement("br",null),i.a.createElement(m.Icon,{name:"clock",size:"sm"})," ",Object(u.a)(null===a||void 0===a?void 0:a.jobs)," ",i.a.createElement("br",null))),i.a.createElement(C.a,{item:!0,xs:5},i.a.createElement("div",{style:{display:"flex",justifyContent:"center"}},v&&i.a.createElement(i.a.Fragment,null,i.a.createElement(d.a,{pass:v.pass,fail:v.fail,pending:v.pending}),i.a.createElement("a",{href:a.jobs[s].html_url,target:"_blank",rel:"noopener noreferrer",style:{color:"black",height:"auto",marginTop:"auto",marginBottom:"auto"}},i.a.createElement(h.a,{style:{height:"auto",fontSize:"2.1rem"}})))))),i.a.createElement("hr",null),i.a.createElement("div",{className:n.root},i.a.createElement(j.a,{orientation:"vertical",variant:"scrollable",value:s,onChange:function(e,t){console.log("newValue inside handleChange is",t),p(t),console.log(D(a.jobs[t].steps)),g(D(a.jobs[t].steps))},"aria-label":"Vertical tabs example",className:n.tabs},a&&a.jobs&&a.jobs.map((function(e,a){return i.a.createElement(O.a,Object.assign({label:i.a.createElement(m.OutlinedPills,{color:"primary",label:e.name,size:"medium",variant:B[e.conclusion],className:n.outlinedPills})},function(e){return{id:"vertical-tab-".concat(e),"aria-controls":"vertical-tabpanel-".concat(e)}}(a),{className:n.tab}))}))),a&&a.jobs.map((function(e,a){return i.a.createElement(A,{value:s,index:a},i.a.createElement(W,{job:e}))}))),i.a.createElement("hr",null))}a.a=function(e){var a=e.data,t=e.tableName,E=e.match,g=(E=void 0===E?{}:E).params,f=(g=void 0===g?{}:g).pipelineName,h=e.displayVersion,j=void 0===h||h,O=Object(r.useState)(10),C=Object(l.a)(O,2),N=C[0],x=C[1],w=Object(r.useState)(null),y=Object(l.a)(w,2),k=y[0],_=y[1],S=Object(r.useState)(!1),P=Object(l.a)(S,2),I=P[0],F=P[1],z=v(),R=function(e){return function(a){console.log("Inside toggleDrawer open is",e),("keydown"!==a.type||"Tab"!==a.key&&"Shift"!==a.key)&&F(e)}},W=[{field:"id",headerName:"Pipeline Id",flex:1,renderCell:function(e){return i.a.createElement(m.TextButton,{size:"small",variant:"highlight",onClick:function(){return a=e.value,void Object(b.a)(p.a.pipelineJobs(a)).then((function(e){console.log("response is",e),_({pipelineId:a,jobs:e}),F(!0)}));var a}},e.value)}},{field:"created_at",headerName:"Created Time",flex:1,renderCell:function(e){return"".concat(Object(s.a)(new Date(e.value))," ago")}},{field:"head_commit",headerName:"Description",flex:1,renderCell:function(e){return i.a.createElement(i.a.Fragment,null,i.a.createElement("a",{href:"https://github.com/litmuschaos/litmus-e2e/commit/".concat(e.value.id)},"#".concat(e.value.id.substring(0,6)))," \xa0 Repository: litmus-go")}}].concat(Object(n.a)(j?[{field:"version",headerName:"Version",flex:1,renderCell:function(e){return"ci"}}]:[]),[{field:"status",headerName:"Status",flex:1,renderCell:function(e){return i.a.createElement(d.a,{pass:4,fail:2,pending:1})}}]);return i.a.createElement(i.a.Fragment,null,i.a.createElement(o.a,{variant:"h3",component:"h2",align:"center",className:z.topMargin},Object(u.b)(t)||Object(u.b)(f)),i.a.createElement(o.a,{variant:"subtitle1",component:"h3",align:"center",className:z.topMargin},"It contains the test cases (GO BDDs) for component-level generic experiments"),i.a.createElement("br",null),a&&i.a.createElement(c.a,{rows:a,columns:W,id:t||f,pageSize:N,onPageSizeChange:function(e){return x(e)},rowsPerPageOptions:[5,10,20],autoHeight:!0,pagination:!0,disableSelectionOnClick:!0}),i.a.createElement(m.Drawer,{anchor:"right",icon:"close",variant:"temporary",onButtonClose:R(!1),onClose:R(!1),open:I},i.a.createElement("div",{className:z.drawerContainer},i.a.createElement(L,{data:null===k||void 0===k?void 0:k.jobs,pipelineId:null===k||void 0===k?void 0:k.pipelineId}))))}},1045:function(e,a,t){"use strict";t.r(a);var n=t(24),l=t(0),r=t.n(l),i=t(413),c=t(969),o=t(414),m=t(977),s=t(217),d=t(259),u=t(1033),p=t(1024),b=t(234),E=t(452),v=t(451),g=Object(i.a)((function(e){return{formControl:{margin:e.spacing(1),minWidth:120},label:{color:"#0000008a"}}}));a.default=function(e){var a,t,i=e.location,f=g(),h=Object(l.useState)({id:(null===i||void 0===i||null===(a=i.state)||void 0===a?void 0:a.id)||"",readableName:(null===i||void 0===i||null===(t=i.state)||void 0===t?void 0:t.readableName)||""}),j=Object(n.a)(h,2),O=j[0],C=j[1],N=Object(l.useState)(null),x=Object(n.a)(N,2),w=x[0],y=x[1],k=Object(b.a)("scheduledRuns");return Object(l.useEffect)((function(){O.id&&Object(v.a)(E.a.pipelinesByWorkflow(O.id)).then((function(e){console.log("pipeline data is",e),y(null===e||void 0===e?void 0:e.workflow_runs)}))}),[O.id]),r.a.createElement(r.a.Fragment,null,r.a.createElement(d.a,null,r.a.createElement(s.Typography,null,"Select Scheduled Pipeline:"),r.a.createElement(o.a,{variant:"outlined",className:f.formControl},r.a.createElement(c.a,{htmlFor:"outlined-pipelineName",className:f.label},"Pipeline Name"),r.a.createElement(m.a,{native:!0,value:O.id,onChange:function(e){C({id:e.target.value,readableName:e.target.options[e.target.selectedIndex].text})},label:"pipelineName",inputProps:{name:"pipelineName",id:"outlined-pipelineName"}},r.a.createElement("option",{"aria-label":"None",value:""}),k&&k.map((function(e){return r.a.createElement("option",{value:e.id,key:e.id},e.readableName)}))))),O.id&&w&&r.a.createElement(r.a.Fragment,null,r.a.createElement(d.a,null,r.a.createElement(p.a,{pass:20,fail:5,pending:2,size:"large"})),r.a.createElement(u.a,{tableName:O.readableName,data:w,displayVersion:!1})))}}}]);
//# sourceMappingURL=7.82c7a0b2.chunk.js.map