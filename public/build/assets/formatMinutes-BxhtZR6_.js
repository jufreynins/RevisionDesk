function s(o){const t=Number(o);if(!t)return"—";const r=Math.floor(t/60),n=t%60;return r>0?n>0?`${r}h ${n}m`:`${r}h`:`${n}m`}export{s as f};
