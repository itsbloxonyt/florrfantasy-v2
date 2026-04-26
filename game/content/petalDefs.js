export const PETAL_TYPES = {
    basic: { name: 'basic', color:'#ffffff', glow: '#ccccff', damage:10, cooldownAtk:120, cooldownIdle:120, r:10, emoji:'⚪', maxHp:40, respawnTime: 120},
    healing: {name: 'healing', color:'ff88aa', glow:'#ff44aa', damage:2, cooldownAtk:120, cooldownIdle:120, r:10, emoji:'💗', healAmt:5, healCooldown:180, maxHp:25, respawnTime:180 },
    lightning: { name:'Lightning',color:'#ffff44', glow:'#ffffaa', damage:14, cooldownAtk:120, cooldownIdle:200, r:10, emoji:'⚡', knockback:18, chain:true, maxHp:30, respawnTime:150 },
    poison:    { name:'Poison',   color:'#88ff44', glow:'#44ff44', damage:4,  cooldownAtk:120, cooldownIdle:200, r:10, emoji:'☠️', poisonDps:6, poisonDur:180, maxHp:35, respawnTime:140 },
};
