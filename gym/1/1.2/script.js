var s=[{id:1,name:"Laptop",category:"Electronics",price:1e3},{id:2,name:"Shirt",category:"Clothing",price:50},{id:3,name:"Phone",category:"Electronics",price:800},{id:4,name:"Jeans",category:"Clothing",price:80}],c=(n,r)=>n.reduce((e,o)=>{let t=String(o[r]);e[t]||(e[t]=[]);let{[r]:p,...i}=o;return e[t].push(i),e},{}),g=c(s,"category");console.log(g);
//# sourceMappingURL=script.js.map
