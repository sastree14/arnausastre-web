'use client'

export default function ConfirmFormButton({action,fields,label,message,className}:{action:string;fields:Record<string,string>;label:string;message:string;className?:string}){
  return <form action={action} method="post" data-live-form="1" onSubmit={(event)=>{if(!window.confirm(message))event.preventDefault()}}>
    {Object.entries(fields).map(([name,value])=><input key={name} type="hidden" name={name} value={value}/>)}
    <button className={className||'rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-700'}>{label}</button>
  </form>
}
