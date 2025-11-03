async function s(e,a={},o=3){let r=0;for(;r<o;){await new Promise(t=>setTimeout(t,r*2e3));try{let t=await fetch(e);if(!t.ok)throw new Error(`Response Status: ${t.status}`);return await t.json()}catch(t){r++}}throw new Error("max tries ended")}s("/api/users/1/posts",{},3).then(e=>{console.log("data=",e)}).catch(e=>{console.log("err=",e)});
//# sourceMappingURL=script.js.map
