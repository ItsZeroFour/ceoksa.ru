import{w as p,a as d,cU as u,j as e,cV as g,I as f,ce as m,b_ as h,K as x,M as i,bg as M,bh as b,cW as j,l as C,cX as y}from"./strapi-DfjkmCfL.js";import{u as k}from"./useAdminRoles-C1l1Ezzq.js";const v=({children:a,target:o})=>{const{toggleNotification:n}=p(),{formatMessage:t}=d(),{copy:r}=u(),l=t({id:"app.component.CopyToClipboard.label",defaultMessage:"Copy to clipboard"}),c=async s=>{s.preventDefault(),await r(o)&&n({type:"info",message:t({id:"notification.link-copied"})})};return e.jsx(g,{endAction:e.jsx(f,{label:l,variant:"ghost",onClick:c,children:e.jsx(m,{})}),title:o,titleEllipsis:!0,subtitle:a,icon:e.jsx("span",{style:{fontSize:32},children:"✉️"}),iconBackground:"neutral100"})},U=({registrationToken:a})=>{const{formatMessage:o}=d(),n=`${window.location.origin}${h()}/auth/register?registrationToken=${a}`;return e.jsx(v,{target:n,children:o({id:"app.components.Users.MagicLink.connect",defaultMessage:"Copy and share this link to give access to this user"})})},E=({disabled:a})=>{const{isLoading:o,roles:n}=k(),{formatMessage:t}=d(),{value:r=[],onChange:l,error:c}=x("roles");return e.jsxs(i.Root,{error:c,hint:t({id:"app.components.Users.ModalCreateBody.block-title.roles.description",defaultMessage:"A user can have one or several roles"}),name:"roles",required:!0,children:[e.jsx(i.Label,{children:t({id:"app.components.Users.ModalCreateBody.block-title.roles",defaultMessage:"User's roles"})}),e.jsx(M,{disabled:a,onChange:s=>{l("roles",s)},placeholder:t({id:"app.components.Select.placeholder",defaultMessage:"Select"}),startIcon:o?e.jsx(w,{}):void 0,value:r.map(s=>s.toString()),withTags:!0,children:n.map(s=>e.jsx(b,{value:s.id.toString(),children:t({id:`global.${s.code}`,defaultMessage:s.name})},s.id))}),e.jsx(i.Error,{}),e.jsx(i.Hint,{})]})},S=y`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(359deg);
  }
`,L=C.div`
  animation: ${S} 2s infinite linear;
`,w=()=>e.jsx(L,{children:e.jsx(j,{})});export{U as M,E as S,v as a};
