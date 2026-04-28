export const PETAL_TYPES = {
    basic: { name: 'basic', color:'#ffffff', glow: '#ccccff', damage:10, cooldownAtk:120, cooldownIdle:120, r:10, emoji:'⚪', maxHp:40, respawnTime: 120},
    healing: {name: 'healing', color:'ff88aa', glow:'#ff44aa', damage:2, cooldownAtk:120, cooldownIdle:120, r:10, emoji:'💗', healAmt:5, healCooldown:180, maxHp:25, respawnTime:180 },
    lightning: { name:'Lightning',color:'#ffff44', glow:'#ffffaa', damage:14, cooldownAtk:120, cooldownIdle:200, r:10, emoji:'⚡', knockback:18, chain:true, maxHp:30, respawnTime:150 },
    poison:    { name:'Poison',   color:'#88ff44', glow:'#44ff44', damage:4,  cooldownAtk:120, cooldownIdle:200, r:10, emoji:'☠️', poisonDps:6, poisonDur:180, maxHp:35, respawnTime:140 },
    tri: { name:'Tri', color:'#ff8844', glow:'#ff6622', damage:8, cooldownAtk:100, cooldownIdle:180, r:9, emoji:'🔺', maxHp:30, respawnTime:130, count:3 },
    leech: { name:'Leech', color:'#ff44ff', glow:'#cc00cc', damage:8, cooldownAtk:120, cooldownIdle:200, r:10, emoji:'🩸', maxHp:30, respawnTime:150, lifeSteal:0.3 },
    thorns: { name:'Thorns', color:'#44ff44', glow:'#00cc00', damage:15, cooldownAtk:120, cooldownIdle:200, r:10, emoji:'🌿', maxHp:35, respawnTime:140, thornDmg:0.2 },
    bleed: { name:'Bleed', color:'#cc0000', glow:'#ff0000', damage:5, cooldownAtk:120, cooldownIdle:200, r:10, emoji:'🩸', maxHp:30, respawnTime:140, bleedDps:4, bleedDur:180, bleedRamp:1.5 },
    multiheal: { name:'MultiHeal', color:'#ff88cc', glow:'#ff44aa', damage:1, cooldownAtk:120, cooldownIdle:200, r:8, emoji:'💞', maxHp:20, respawnTime:180, healAmt:3, healCooldown:180, count:3 },
};
