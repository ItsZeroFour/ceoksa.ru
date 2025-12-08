import{j as e,l as b,$ as p,eZ as O,a as A,f as x,T as k,k as Ce,r as R,aJ as L,I as U,g as we,a6 as Te,fy as $e,bV as Q,b7 as V,a3 as ee,fz as ve,h as te,bB as ke,bI as De,bJ as Me,cZ as Re,bm as Fe,b as ne,aG as Se,s as Ae,bK as oe,D as B,db as Ie,V as Ee,z as Le,fg as Oe,bo as Ne,aP as J,fA as Ue,C as ie}from"./strapi-DfjkmCfL.js";import{u as D,g as m,C as _,a as W,A as Be,S as Pe,c as X}from"./index-Brn3pxvO.js";import{d as Ze,e as Y,D as ze,f as Ve,a as We,S as He,v as Ge,s as Ke,K as qe,P as Je,c as _e,C as Xe}from"./sortable.esm-BWq2BBYg.js";import"./index-B8aj5-1e.js";import"./groupBy-DeOO0czF.js";import"./_baseEach-GrJ5h0Ir.js";import"./sortBy-C1pfJltn.js";import"./_baseMap-i2PKaoSG.js";import"./index-DdWmLd5A.js";import"./index-BRVyLNfZ.js";const Ye=t=>{let{transform:n}=t;return{...n,x:0}},Qe=b(p)`
  position: absolute;
  left: -3.4rem;
  top: 0px;

  &:before {
    content: '';
    width: 0.4rem;
    height: 1.2rem;
    background: ${({theme:t,color:n})=>t.colors[n]};
    display: block;
  }
`,et=b.svg`
  position: relative;
  flex-shrink: 0;
  transform: translate(-0.5px, -1px);

  * {
    fill: ${({theme:t,color:n})=>t.colors[n]};
  }
`,tt=t=>e.jsx(Qe,{...t,children:e.jsx(et,{width:"20",height:"23",viewBox:"0 0 20 23",fill:"none",xmlns:"http://www.w3.org/2000/svg",...t,children:e.jsx("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M7.02477 14.7513C8.65865 17.0594 11.6046 18.6059 17.5596 18.8856C18.6836 18.9384 19.5976 19.8435 19.5976 20.9688V20.9688C19.5976 22.0941 18.6841 23.0125 17.5599 22.9643C10.9409 22.6805 6.454 20.9387 3.75496 17.1258C0.937988 13.1464 0.486328 7.39309 0.486328 0.593262H4.50974C4.50974 7.54693 5.06394 11.9813 7.02477 14.7513Z"})})}),nt=t=>{let n;switch(t){case"date":case"datetime":case"time":case"timestamp":n="date";break;case"integer":case"biginteger":case"decimal":case"float":n="number";break;case"string":case"text":n="text";break;case"":n="relation";break;default:n=t}return n},se=b(p)`
  &.component-row,
  &.dynamiczone-row {
    position: relative;

    > ul:first-of-type {
      padding: 0 0 0 104px;
      position: relative;

      &::before {
        content: '';
        width: 0.4rem;
        height: ${({$isFromDynamicZone:t})=>t?"calc(100% - 65px)":"calc(100%)"};
        position: absolute;
        left: 7rem;
        border-radius: 4px;

        ${({$isFromDynamicZone:t,$isChildOfDynamicZone:n,theme:o})=>n?`background-color: ${o.colors.primary200};`:t?`background-color: ${o.colors.primary200};`:`background: ${o.colors.neutral150};`}
      }
    }
  }

  &.dynamiczone-row > ul:first-of-type {
    padding: 0;
  }
`,re=({component:t,isFromDynamicZone:n=!1,firstLoopComponentUid:o})=>{const{components:s}=D(),a=O(s,t);if(a)return e.jsx(se,{$isChildOfDynamicZone:n,className:"component-row",children:e.jsx(ue,{type:a,firstLoopComponentUid:o||t,isFromDynamicZone:n,isSub:!0,secondLoopComponentUid:o?t:null})})},ot=({type:t,customField:n=null,repeatable:o=!1,multiple:s=!1})=>{const{formatMessage:a}=A();let l=t;return["integer","biginteger","float","decimal"].includes(t)?l="number":["string"].includes(t)&&(l="text"),n?a({id:m("attribute.customField"),defaultMessage:"Custom field"}):e.jsxs(e.Fragment,{children:[o&&a({id:m("component.repeatable"),defaultMessage:"Repeatable"}),s&&a({id:m("media.multiple"),defaultMessage:"Multiple"})," ",a({id:m(`attribute.${l}`),defaultMessage:t})]})},it=({isActive:t=!1,icon:n="dashboard"})=>{const o=_[n]||_.dashboard;return e.jsx(x,{alignItems:"center",background:t?"primary200":"neutral200",justifyContent:"center",height:8,width:8,borderRadius:"50%",children:e.jsx(o,{height:"2rem",width:"2rem"})})},ae=b(p)`
  position: absolute;
  display: none;
  top: 5px;
  right: 0.8rem;

  svg {
    width: 1rem;
    height: 1rem;

    path {
      fill: ${({theme:t})=>t.colors.primary600};
    }
  }
`,st=b(x)`
  width: 14rem;
  height: 8rem;
  position: relative;
  border: 1px solid ${({theme:t})=>t.colors.neutral200};
  background: ${({theme:t})=>t.colors.neutral100};
  border-radius: ${({theme:t})=>t.borderRadius};
  max-width: 100%;

  &.active,
  &:focus,
  &:hover {
    border: 1px solid ${({theme:t})=>t.colors.primary200};
    background: ${({theme:t})=>t.colors.primary100};
    color: ${({theme:t})=>t.colors.primary600};

    ${ae} {
      display: block;
    }

    /* > ComponentIcon */
    > div:first-child {
      background: ${({theme:t})=>t.colors.primary200};
      color: ${({theme:t})=>t.colors.primary600};

      svg {
        path {
          fill: ${({theme:t})=>t.colors.primary600};
        }
      }
    }
  }
`,rt=({component:t,dzName:n,index:o,isActive:s=!1,isInDevelopmentMode:a=!1,onClick:l,forTarget:i,targetUid:c,disabled:f})=>{const{components:y,removeComponentFromDynamicZone:v}=D(),r=O(y,t),{icon:d,displayName:u}=r?.info||{},w=T=>{T.stopPropagation(),v({forTarget:i,targetUid:c,dzName:n,componentToRemoveIndex:o})};return e.jsxs(st,{alignItems:"center",direction:"column",className:s?"active":"",borderRadius:"borderRadius",justifyContent:"center",paddingLeft:4,paddingRight:4,shrink:0,onClick:l,role:"tab",tabIndex:s?0:-1,cursor:"pointer","aria-selected":s,"aria-controls":`dz-${n}-panel-${o}`,id:`dz-${n}-tab-${o}`,children:[e.jsx(it,{icon:d,isActive:s}),e.jsx(p,{marginTop:1,maxWidth:"100%",children:e.jsx(k,{variant:"pi",fontWeight:"bold",ellipsis:!0,children:u})}),a&&!f&&e.jsx(ae,{cursor:"pointer",tag:"button",onClick:w,children:e.jsx(Ce,{})})]})},at=b(L)`
  width: 3.2rem;
  height: 3.2rem;
  padding: 0.9rem;
  border-radius: 6.4rem;
  background: ${({theme:t,disabled:n})=>n?t.colors.neutral100:t.colors.primary100};
  path {
    fill: ${({theme:t,disabled:n})=>n?t.colors.neutral600:t.colors.primary600};
  }
`,lt=b(x)`
  flex-shrink: 0;
  width: 14rem;
  height: 8rem;
  justify-content: center;
  align-items: center;
`,dt=({components:t=[],addComponent:n,name:o,forTarget:s,targetUid:a,disabled:l=!1})=>{const{isInDevelopmentMode:i}=D(),[c,f]=R.useState(0),{formatMessage:y}=A(),v=d=>{c!==d&&f(d)},r=()=>{n(o)};return e.jsx(se,{className:"dynamiczone-row",$isFromDynamicZone:!0,children:e.jsxs(p,{children:[e.jsx(p,{padding:2,paddingLeft:"104px",children:e.jsxs(x,{role:"tablist",gap:2,wrap:"wrap",children:[i&&e.jsx("button",{type:"button",onClick:r,disabled:l,style:{cursor:l?"not-allowed":"pointer"},children:e.jsxs(lt,{direction:"column",alignItems:"stretch",gap:1,children:[e.jsx(at,{disabled:l}),e.jsx(k,{variant:"pi",fontWeight:"bold",textColor:l?"neutral600":"primary600",children:y({id:m("button.component.add"),defaultMessage:"Add a component"})})]})}),t.map((d,u)=>e.jsx(rt,{dzName:o||"",index:u,component:d,isActive:c===u,isInDevelopmentMode:i,onClick:()=>v(u),forTarget:s,targetUid:a,disabled:l},d))]})}),e.jsx(p,{children:t.map((d,u)=>e.jsx(p,{id:`dz-${o}-panel-${u}`,role:"tabpanel","aria-labelledby":`dz-${o}-tab-${u}`,style:{display:c===u?"block":"none"},children:e.jsx(re,{isFromDynamicZone:!0,component:d},d)},d))})]})})},ct=b(x)`
  justify-content: space-between;

  border-top: ${({theme:t,$isOverlay:n})=>n?"none":`1px solid ${t.colors.neutral150}`};

  padding-top: ${({theme:t})=>t.spaces[4]};
  padding-bottom: ${({theme:t})=>t.spaces[4]};

  opacity: ${({$isDragging:t})=>t?0:1};
  align-items: center;
`,ut=b(p)`
  list-style: none;
  list-style-type: none;
`,le=R.forwardRef((t,n)=>{const{style:o,...s}=t;return e.jsx(ut,{tag:"li",ref:n,...t.attributes,style:o,background:"neutral0",shadow:t.isOverlay?"filterShadow":"none","aria-label":t.item.name,children:e.jsx(pt,{...s})})}),pt=R.memo(t=>{const{item:n,firstLoopComponentUid:o,isFromDynamicZone:s,addComponentToDZ:a,secondLoopComponentUid:l,type:i,isDragging:c,isOverlay:f,handleRef:y,listeners:v}=t,r=f||c,[d,u]=R.useState(!0),w=i.status==="REMOVED",{contentTypes:T,removeAttribute:F,isInDevelopmentMode:M}=D(),{onOpenModalEditField:I,onOpenModalEditCustomField:S}=W(),{formatMessage:g}=A(),[h,j]=R.useState(!1),C=n.status==="REMOVED",P=n.type==="relation"&&n.relation.includes("morph"),pe=["integer","biginteger","float","decimal"].includes(n.type)?"number":n.type,E=n.type==="relation"?O(T,n.target):null,H=O(E,"plugin"),ge="target"in n&&n.target?"relation":pe,me=$=>{$.stopPropagation(),X(T,n.name).length>0?j(!0):F({forTarget:i.modelType,targetUid:i.uid,attributeToRemoveName:n.name})},fe=()=>{F({forTarget:i.modelType,targetUid:i.uid,attributeToRemoveName:n.name}),j(!1)},he=()=>{j(!1)},G=$=>{if($&&$.stopPropagation(),!P&&n.configurable!==!1){const Z=l||o||i.uid,q=nt(n.type),je=n.type==="component"?"2":null;n.customField?S({forTarget:i.modelType,targetUid:Z,attributeName:n.name,attributeType:q,customFieldUid:n.customField}):I({forTarget:i.modelType,targetUid:Z,attributeName:n.name,attributeType:q,step:je})}};let N;l&&o?N=2:o?N=1:N=0;const K=!w&&!C,xe=!w&&!C,be=w||C?"not-allowed":"move",ye=M&&n.configurable!==!1&&!P&&K;return e.jsxs(e.Fragment,{children:[e.jsxs(ct,{$isOverlay:f,$isDragging:c,onClick:ye?G:void 0,paddingLeft:4,paddingRight:4,children:[e.jsxs(x,{alignItems:"center",overflow:"hidden",gap:2,children:[N!==0&&!f&&e.jsx(tt,{color:s?"primary200":"neutral150"}),M&&e.jsx(U,{cursor:be,role:"Handle",ref:y,...v,variant:"ghost",withTooltip:!1,label:`${g({id:"app.utils.drag",defaultMessage:"Drag"})} ${n.name}`,disabled:w||C,style:{outlineOffset:"-2px"},children:e.jsx(we,{})}),e.jsxs(x,{gap:4,children:[e.jsxs(x,{gap:4,alignItems:"center",children:[e.jsx(Be,{type:ge,customField:n.customField}),e.jsxs(k,{textColor:"neutral800",fontWeight:"bold",textDecoration:C?"line-through":"none",ellipsis:!0,overflow:"hidden",children:[n.name,"required"in n&&n.required&&e.jsx(k,{textColor:"danger600",children:"* "})]})]}),e.jsx(x,{children:e.jsxs(k,{textColor:"neutral600",children:[e.jsx(ot,{type:n.type,customField:n.customField,repeatable:"repeatable"in n&&n.repeatable,multiple:"multiple"in n&&n.multiple}),"conditions"in n&&n.conditions&&Object.keys(n.conditions).length>0&&e.jsx(Te,{margin:4,children:"conditional"}),n.type==="relation"&&e.jsxs(e.Fragment,{children:[" (",$e(n.relation,n.targetAttribute),") ",E&&g({id:m("modelPage.attribute.with"),defaultMessage:"with"})," ",E&&e.jsx(Q,{onClick:$=>$.stopPropagation(),tag:ee,to:`/plugins/content-type-builder/content-types/${E.uid}`,children:V(E.info.displayName)}),H&&`(${g({id:m("from"),defaultMessage:"from"})}: ${H})`]}),n.type==="component"&&e.jsx(mt,{uid:n.component})]})})]})]}),e.jsx(p,{children:e.jsx(x,{justifyContent:"flex-end",gap:1,onClick:$=>$.stopPropagation(),children:e.jsxs(e.Fragment,{children:[e.jsx(p,{children:n.status&&e.jsx(Pe,{status:n.status})}),["component","dynamiczone"].includes(n.type)&&e.jsx(U,{onClick:$=>{$.preventDefault(),$.stopPropagation(),u(!d)},"aria-expanded":d,label:g({id:"app.utils.toggle",defaultMessage:"Toggle"}),variant:"ghost",withTooltip:!1,children:e.jsx(ve,{"aria-hidden":!0,fill:"neutral500",style:{transform:`rotate(${d?"0deg":"-90deg"})`,transition:"transform 0.5s"}})}),M&&n.configurable!==!1?e.jsxs(e.Fragment,{children:[!P&&e.jsx(U,{onClick:G,label:`${g({id:"app.utils.edit",defaultMessage:"Edit"})} ${n.name}`,variant:"ghost",disabled:!K,children:e.jsx(te,{})}),e.jsx(U,{onClick:me,label:`${g({id:"global.delete",defaultMessage:"Delete"})} ${n.name}`,variant:"ghost",disabled:!xe,children:e.jsx(ke,{})}),e.jsx(De.Root,{open:h,onOpenChange:j,children:e.jsx(Me,{onConfirm:fe,onCancel:he,children:e.jsx(p,{children:e.jsxs(k,{children:[g({id:m("popUpWarning.bodyMessage.delete-attribute-with-conditions"),defaultMessage:"The following fields have conditions that depend on this field: "}),e.jsx(k,{fontWeight:"bold",children:X(T,n.name).map(({attribute:$})=>$).join(", ")}),g({id:m("popUpWarning.bodyMessage.delete-attribute-with-conditions-end"),defaultMessage:". Are you sure you want to delete it?"})]})})})})]}):e.jsx(x,{padding:2,children:e.jsx(Re,{fill:"neutral500"})})]})})})]}),e.jsxs(gt,{$shouldHideNestedInfos:r,$isOpen:d,children:[n.type==="component"&&e.jsx(re,{...n,isFromDynamicZone:s,firstLoopComponentUid:o}),n.type==="dynamiczone"&&e.jsx(dt,{...n,disabled:w||n.status==="REMOVED",addComponent:a,forTarget:i.modelType,targetUid:i.uid})]})]})}),gt=b(p)`
  display: ${({$shouldHideNestedInfos:t})=>t?"none":"block"};
  max-height: ${({$isOpen:t})=>t?"9999px":"0px"};
  overflow: hidden;

  transition: ${({$isOpen:t})=>t?"max-height 1s ease-in-out":"max-height 0.5s cubic-bezier(0, 1, 0, 1)"};
`,mt=({uid:t})=>{const{components:n}=D(),o=O(n,t);return e.jsxs(e.Fragment,{children:[" (",e.jsx(Q,{onClick:s=>s.stopPropagation(),tag:ee,to:`/plugins/content-type-builder/component-categories/${o.category}/${o.uid}`,children:V(o.info.displayName)}),")"]})},de=b(p)`
  height: 2.4rem;
  width: 2.4rem;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;

  svg {
    height: 1rem;
    width: 1rem;
  }

  svg path {
    fill: ${({theme:t,color:n})=>t.colors[`${n}600`]};
  }
`,ce=b(p)`
  border-radius: 0 0 ${({theme:t})=>t.borderRadius} ${({theme:t})=>t.borderRadius};
  display: block;
  width: 100%;
  border: none;
  position: relative;
`,ft=({children:t,icon:n,color:o,...s})=>e.jsx(ce,{paddingBottom:4,paddingTop:4,paddingLeft:"6rem",tag:"button",type:"button",...s,children:e.jsxs(x,{children:[e.jsx(de,{color:o,"aria-hidden":!0,background:`${o}200`,children:n}),e.jsx(p,{paddingLeft:3,children:e.jsx(k,{variant:"pi",fontWeight:"bold",textColor:`${o}600`,children:t})})]})}),ht=({children:t,icon:n,color:o,...s})=>e.jsxs("div",{children:[e.jsx(Fe,{}),e.jsx(ce,{tag:"button",background:`${o}100`,padding:5,...s,children:e.jsxs(x,{children:[e.jsx(de,{color:o,"aria-hidden":!0,background:`${o}200`,children:n}),e.jsx(p,{paddingLeft:3,children:e.jsx(k,{variant:"pi",fontWeight:"bold",textColor:`${o}600`,children:t})})]})})]}),xt=b(p)`
  white-space: nowrap;
  list-style: none;
  list-style-type: none;
`,bt=t=>{const{isInDevelopmentMode:n}=D(),{isDragging:o,attributes:s,listeners:a,setNodeRef:l,transform:i,transition:c,setActivatorNodeRef:f}=_e({disabled:!n||t.item.status==="REMOVED"||t.type.status==="REMOVED",id:t.item.id,data:{index:t.item.index}}),y={transform:Xe.Transform.toString({x:i?.x??0,y:i?.y??0,scaleX:1,scaleY:1}),transition:c};return e.jsx(le,{ref:l,handleRef:f,isDragging:o,attributes:s,listeners:a,style:y,...t})},ue=({addComponentToDZ:t,firstLoopComponentUid:n,isFromDynamicZone:o=!1,isMain:s=!1,isSub:a=!1,secondLoopComponentUid:l,type:i})=>{const{formatMessage:c}=A(),{trackUsage:f}=ne(),{isInDevelopmentMode:y,moveAttribute:v}=D(),{onOpenModalAddField:r}=W(),d=i?.attributes.map((h,j)=>({id:`${i.uid}_${h.name}`,index:j,...h})),[u,w]=R.useState(null),T=i?.status==="REMOVED",F=Ze(Y(Je),Y(qe,{coordinateGetter:Ke}));function M({active:h}){h&&w(h.id)}function I(h){const{active:j,over:C}=h;w(null),C&&j.id!==C.id&&v({forTarget:i.modelType,targetUid:i.uid,from:j.data.current.index,to:C.data.current.index})}const S=d.find(h=>h.id===u),g=()=>{T||(f("hasClickedCTBAddFieldBanner"),r({forTarget:i?.modelType,targetUid:i.uid}))};return i?.attributes.length===0&&s?e.jsx(Se,{action:e.jsx(oe.contentTypeBuilder.AddFields,{children:e.jsx(B,{onClick:g,size:"L",startIcon:e.jsx(L,{}),variant:"secondary",children:c({id:m("table.button.no-fields"),defaultMessage:"Add new field"})})}),content:c(i.modelType==="contentType"?{id:m("table.content.no-fields.collection-type"),defaultMessage:"Add your first field to this Collection-Type"}:{id:m("table.content.no-fields.component"),defaultMessage:"Add your first field to this component"}),hasRadius:!0,icon:e.jsx(Ae,{width:"16rem"})}):e.jsxs(ze,{sensors:F,collisionDetection:Ve,onDragEnd:I,onDragStart:M,onDragCancel:()=>w(null),modifiers:[Ye],children:[e.jsxs(xt,{tag:"ul",children:[Ie.createPortal(e.jsx(We,{zIndex:10,children:S&&e.jsx(le,{isOverlay:!0,item:S,firstLoopComponentUid:n,isFromDynamicZone:o,secondLoopComponentUid:l,type:i,addComponentToDZ:t})}),document.body),e.jsx(He,{items:d,strategy:Ge,children:d.map(h=>e.jsx(bt,{item:h,firstLoopComponentUid:n,isFromDynamicZone:o,secondLoopComponentUid:l,type:i,addComponentToDZ:t},h.id))})]}),s&&y&&e.jsx(ht,{cursor:T?"normal":"pointer",icon:e.jsx(L,{}),onClick:g,color:T?"neutral":"primary",children:c({id:m(`form.button.add.field.to.${i.modelType==="component"?"component":i.kind}`),defaultMessage:"Add another field"})}),a&&y&&e.jsx(ft,{cursor:T?"normal":"pointer",icon:e.jsx(L,{}),onClick:g,color:o&&!T?"primary":"neutral",children:c({id:m("form.button.add.field.to.component"),defaultMessage:"Add another field"})})]})},z={collectionTypesConfigurations:[{action:"plugin::content-manager.collection-types.configure-view",subject:null}],componentsConfigurations:[{action:"plugin::content-manager.components.configure-layout",subject:null}],singleTypesConfigurations:[{action:"plugin::content-manager.single-types.configure-view",subject:null}]},yt=t=>t.modelType==="contentType"?t.kind==="singleType"?z.singleTypesConfigurations:z.collectionTypesConfigurations:z.componentsConfigurations,jt=t=>{switch(t.modelType){case"contentType":switch(t.kind){case"singleType":return`/content-manager/single-types/${t.uid}/configurations/edit`;case"collectionType":return`/content-manager/collection-types/${t.uid}/configurations/edit`}case"component":return`/content-manager/components/${t.uid}/configurations/edit`}},Ct=b(B)`
  white-space: nowrap;
`,wt=R.memo(({disabled:t,type:n})=>{const{formatMessage:o}=A(),s=Ee(),a=yt(n),l=o({id:"content-type-builder.form.button.configure-view",defaultMessage:"Configure the view"}),i=()=>{if(t)return!1;const y=jt(n);return s(y),!1},{isLoading:c,allowedActions:f}=Le(a);return c||!f.canConfigureView&&!f.canConfigureLayout?null:e.jsx(Ct,{startIcon:e.jsx(Oe,{}),variant:"tertiary",onClick:i,disabled:t,children:l})}),Tt=b(ie.Header)`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`,Et=()=>{const{isInDevelopmentMode:t,contentTypes:n,components:o,isLoading:s}=D(),{formatMessage:a}=A(),{trackUsage:l}=ne(),{contentTypeUid:i,componentUid:c}=Ne(),{onOpenModalAddComponentsToDZ:f,onOpenModalAddField:y,onOpenModalEditSchema:v}=W(),r=i?n[i]:c?o[c]:null;if(s)return null;if(!r){const j=Object.values(n).filter(C=>C.visible===!0&&!C.plugin).map(C=>C.uid).sort();return j.length>0?e.jsx(J,{to:`/plugins/content-type-builder/content-types/${j[0]}`}):e.jsx(J,{to:"/plugins/content-type-builder/content-types/create-content-type"})}const d="plugin"in r&&r?.plugin!==void 0,u=i?"contentType":"component",w=r?.info?.displayName??"",T=t&&!d,F=j=>{f({dynamicZoneTarget:j,targetUid:r.uid})},M=()=>{if("kind"in r){r?.kind==="collectionType"&&l("willEditNameOfContentType"),r?.kind==="singleType"&&l("willEditNameOfSingleType"),v({modalType:u,forTarget:u,targetUid:r.uid,kind:r?.kind});return}v({modalType:u,forTarget:u,targetUid:r.uid})},I=a({id:m("table.button.no-fields"),defaultMessage:"Add new field"}),S=a({id:m("button.attributes.add.another"),defaultMessage:"Add another field"}),g=r.status==="REMOVED",h=t&&e.jsxs(x,{gap:2,children:[e.jsx(wt,{type:r,disabled:r.status==="NEW"||g},"link-to-cm-settings-view"),e.jsx(B,{startIcon:e.jsx(te,{}),variant:"tertiary",onClick:M,disabled:!T||g,children:a({id:"app.utils.edit",defaultMessage:"Edit"})}),e.jsx(B,{startIcon:e.jsx(L,{}),variant:"secondary",minWidth:"max-content",onClick:()=>{y({forTarget:u,targetUid:r.uid})},disabled:g,children:r.attributes.length===0?I:S})]});return e.jsxs(e.Fragment,{children:[e.jsx(oe.contentTypeBuilder.Introduction,{children:e.jsx(p,{})}),g&&e.jsx(x,{background:"danger100",justifyContent:"center",padding:4,children:e.jsxs(x,{gap:2,children:[e.jsx(Ue,{fill:"danger600",height:"2rem",width:"2rem"}),e.jsx(k,{children:a({id:m("table.warning.deleted"),defaultMessage:"This {kind} has been deleted"},{kind:r.modelType==="contentType"?"Content Type":"Component"})})]})}),e.jsx(Tt,{id:"title",primaryAction:h,title:V(w)}),e.jsx(ie.Content,{children:e.jsx(p,{background:"neutral0",shadow:"filterShadow",hasRadius:!0,overflow:"auto",borderColor:"neutral150",children:e.jsx(ue,{type:r,addComponentToDZ:F,isMain:!0})})})]})};export{Et as default};
