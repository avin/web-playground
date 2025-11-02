var a=[{id:1,email:"john@example.com",name:"John"},{id:2,email:"jane@example.com",name:"Jane"},{id:3,email:"john@example.com",name:"Johnny"},{id:4,email:"bob@example.com",name:"Bob"}],n={},o=a.reduce((m,e)=>(n[e.email]||(n[e.email]=!0,m.push(e)),m),[]);console.log(o);
//# sourceMappingURL=script.js.map
