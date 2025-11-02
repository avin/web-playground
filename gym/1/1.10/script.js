var d=[{id:1,name:"Electronics",children:[{id:2,name:"Laptops",children:[]},{id:3,name:"Phones",children:[{id:4,name:"iOS",children:[]},{id:5,name:"Android",children:[]}]}]},{id:6,name:"Clothing",children:[]}],i=o=>{let e=[];for(let r of o){let{children:n,...c}=r;e.push(c),n&&e.push(...i(n))}return e};console.log(i(d));
//# sourceMappingURL=script.js.map
