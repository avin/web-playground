var n={id:1,profile:{name:"John",address:{city:"New York",street:"5th Avenue"}}},o=(s,t,i)=>{let l=t.split("."),e=s;for(let r of l){if(e==null||!(r in e))return i;e=e[r]}return e};console.log(o(n,"profile.address.city"),"New York");console.log(o(n,"profile.phone.number"),void 0);console.log(o(n,"profile.phone.number","N/A"),"N/A");
//# sourceMappingURL=script.js.map
