var i=(e,t)=>{let r;return function(...o){let a=this;clearTimeout(r),r=setTimeout(()=>{e.apply(a,o)},t)}},n=class{constructor(){this.name="SearchComponent";this.query="";this.search=i(function(t){this.query=t,console.log(this.name,this.query)},300)}},c=new n,s;(s=document.querySelector("input"))==null||s.addEventListener("input",e=>{c.search(e.target.value)});
//# sourceMappingURL=script.js.map
