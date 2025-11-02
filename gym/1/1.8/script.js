var l=[{id:1,total:100,status:"completed"},{id:2,total:250,status:"completed"},{id:3,total:150,status:"pending"},{id:4,total:300,status:"completed"}],o=0,t=0,a=0;l.forEach(e=>{e.status==="completed"&&(o+=e.total,a+=1),t+=e.total});t=t/l.length;console.log({totalRevenue:o,averageOrder:t,completedCount:a});
//# sourceMappingURL=script.js.map
