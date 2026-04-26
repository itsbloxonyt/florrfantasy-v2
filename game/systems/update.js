import {
  WORLD_W, WORLD_H, SWAP_CD_MAX, PETAL_TYPES,
  cam, player, petals, petalState, setPetalState,
  mobs, drops, frame, setFrame, spawnTimer, setSpawnTimer,
  dead, swapCooldown, setSwapCooldown,
} from '../state.js';
import { spawnMob, killMob, addPetalDrop } from '../content/petals.js';
import { keys, mouse, handleInput } from './input.js';
import { updateHUD } from './ui.js';

export function getPetalTarget(i, state) {
  const a = petals[i].angle;
  if(state==='attack'){
    return { x: player.x+Math.cos(a)*72, y: player.y+Math.sin(a)*72 };
  } else if(state==='defend'){
    return { x: player.x+Math.cos(a)*(player.r+11), y: player.y+Math.sin(a)*(player.r+11) };
  } else {
    return { x: player.x+Math.cos(a)*player.petalOrbitR, y: player.y+Math.sin(a)*player.petalOrbitR };
  }
}

export function update(canvas, faceCanvas, drawSmiley, triggerDeath, drawCooldown) {
  if(dead) return;
  setFrame(frame + 1);

  if (swapCooldown > 0) setSwapCooldown(swapCooldown - 1);

  handleInput();
  drawCooldown();

  // Petal state
  const attacking = mouse.left || keys['Space'];
  const defending  = mouse.right || keys['ShiftLeft'] || keys['ShiftRight'];
  setPetalState(defending ? 'defend' : attacking ? 'attack' : 'idle');
  document.getElementById('state-indicator').textContent =
    petalState==='attack' ? '⚔️ ATTACK' : petalState==='defend' ? '🛡️ DEFEND' : '🌸 IDLE';

  // WASD movement
  let vx=0, vy=0;
  if(keys['KeyW']||keys['ArrowUp'])    vy-=1;
  if(keys['KeyS']||keys['ArrowDown'])  vy+=1;
  if(keys['KeyA']||keys['ArrowLeft'])  vx-=1;
  if(keys['KeyD']||keys['ArrowRight']) vx+=1;
  const vl = Math.hypot(vx, vy);
  if(vl>0){ vx/=vl; vy/=vl; }
  player.x = Math.max(player.r, Math.min(WORLD_W-player.r, player.x+vx*player.speed));
  player.y = Math.max(player.r, Math.min(WORLD_H-player.r, player.y+vy*player.speed));

  // Camera
  const targetX = Math.max(0, Math.min(WORLD_W-canvas.width,  player.x - canvas.width/2));
  const targetY = Math.max(0, Math.min(WORLD_H-canvas.height, player.y - canvas.height/2));
  cam.x += (targetX - cam.x) * 0.1;
  cam.y += (targetY - cam.y) * 0.1;

  // Mouse world pos
  mouse.wx = mouse.x + cam.x;
  mouse.wy = mouse.y + cam.y;

  // Petal orbit spin
  const spinSpeed = petalState==='defend'
    ? player.petalOrbitSpeed*3
    : petalState==='attack'
      ? player.petalOrbitSpeed*2.2
      : player.petalOrbitSpeed;
  player.petalAngle += spinSpeed;
  for(let i=0;i<petals.length;i++)
    petals[i].angle = player.petalAngle + (Math.PI*2/petals.length)*i;

  // Move petals, handle broken/respawn
  for(let i=0;i<petals.length;i++){
    const p = petals[i];
    const def = PETAL_TYPES[p.type];
    if(p.broken){
      p.respawnTimer--;
      p.x+=(player.x-p.x)*0.2; p.y+=(player.y-p.y)*0.2;
      if(p.respawnTimer<=0){
        p.broken=false;
        p.hp=def.maxHp;
        p.cooldown=5;
        p.justReady = true;
        p.invincible = 5;
      }
      continue;
    }
    if(p.invincible > 0) p.invincible--;
    if(p.hitCooldown > 0) p.hitCooldown--;
    const t = getPetalTarget(i, petalState);
    const spd = petalState==='defend' ? 0.32 : petalState==='attack' ? 0.18 : 0.2;
    p.x+=(t.x-p.x)*spd;
    p.y+=(t.y-p.y)*spd;
    if(p.justReady){
      const dx = p.x - player.x;
      const dy = p.y - player.y;
      const len = Math.hypot(dx, dy) || 1;
      p.x += (dx/len)*25;
      p.y += (dy/len)*25;
      p.justReady = false;
    }
    if(p.cooldown>0){
      p.cooldown--;
      if(p.cooldown === 0) p.justReady = true;
    }
    if(p.type==='healing'){
      if(p.healTimer>0) p.healTimer--;
      if(p.healTimer<=0 && player.hp<player.maxHp){
        player.hp = Math.min(player.maxHp, player.hp+def.healAmt);
        p.healTimer = def.healCooldown;
      }
    }
  }

  // Spawn mobs
  setSpawnTimer(spawnTimer + 1);
  const spawnRate = Math.max(180, 420 - player.level*12);
  if(spawnTimer>=spawnRate && mobs.length < 40){ spawnMob(); setSpawnTimer(0); }

  // Update mobs
  for(let i=mobs.length-1;i>=0;i--){
    const m = mobs[i];
    if(m.hp <= 0){ killMob(i); continue; };
    m.spinAngle += 0.04;
    if(m.hitFlash>0) m.hitFlash--;

    if(m.poisoned>0){
      m.poisonTimer++;
      if(m.poisonTimer%60===0){ m.hp-=PETAL_TYPES.poison.poisonDps; m.hitFlash=4; }
      m.poisoned--;
      if(m.hp<=0){ killMob(i); continue; }
    }

    const mdx=player.x-m.x, mdy=player.y-m.y, md=Math.hypot(mdx,mdy);
    if(md>1){ m.x+=(mdx/md)*m.speed; m.y+=(mdy/md)*m.speed; }
    m.x = Math.max(m.r, Math.min(WORLD_W-m.r, m.x));
    m.y = Math.max(m.r, Math.min(WORLD_H-m.r, m.y));
    
    // Mob to mob collision
    for(let i=0;i<mobs.length;i++){
      for(let j=i+1;j<mobs.length;j++){
        const a = mobs[i], b = mobs[j];
        const dx = b.x-a.x, dy = b.y-a.y;
        const dist = Math.hypot(dx,dy);
        const minDist = a.r+b.r;
        if(dist<minDist && dist>0){
          const push = (minDist-dist)/2;
          const nx = dx/dist, ny = dy/dist;
          a.x -= nx*push; a.y -= ny*push;
          b.x += nx*push; b.y += ny*push;
        }
      }
    }

    // Player to mobs collision
    if(Math.hypot(player.x-m.x,player.y-m.y)<m.r+player.r-2){
      const dx = player.x-m.x, dy = player.y-m.y;
      const dist = Math.hypot(dx,dy)||1;
      const push = (m.r+player.r-dist) * 1.5; // 👈 multiply by 1.5 for more bounce
      player.x += (dx/dist)*push;
      player.y += (dy/dist)*push;
      if(player.invincible<=0){
        player.hp -= m.dmg; player.invincible = 3;
        if(player.hp<=0){ player.hp=0; triggerDeath(); return; }
      }
    }

   for(const p of petals){
  if(p.broken) continue;
  if(p.invincible > 0) continue;
  if(p.cooldown === 0 && p.hitCooldown === 0 && Math.hypot(p.x-m.x,p.y-m.y)<p.r+m.r){
    const dmgMult = petalState==='defend' ? 0.35 : 1;
    const def = PETAL_TYPES[p.type];
    m.hp -= p.damage * dmgMult;
    p.hp -= m.dmg;
    p.hitCooldown = 5;
    m.hitFlash = 10;
    if(p.hp<=0){ 
      p.broken=true;
      p.respawnTimer=PETAL_TYPES[p.type].respawnTime;
      p.cooldown = petalState==='attack' ? def.cooldownAtk : def.cooldownIdle;
      continue; 
    }
    if(p.type==='lightning'){
      const bx=m.x-player.x, by=m.y-player.y, bl=Math.hypot(bx,by)||1;
      m.x+=bx/bl*def.knockback; m.y+=by/bl*def.knockback;
      let nearest=null, nd=999;
      for(const m2 of mobs){ if(m2===m) continue; const d2=Math.hypot(m2.x-m.x,m2.y-m.y); if(d2<nd){nd=d2;nearest=m2;} }
      if(nearest && nd<120){ nearest.hp-=def.damage*0.6; nearest.hitFlash=8; }
    }
    if(p.type==='poison'){
      m.poisoned = def.poisonDur;
      m.poisonTimer = 0;
    }
    if(petalState==='defend'){
      const bx=m.x-player.x, by=m.y-player.y, bl=Math.hypot(bx,by)||1;
      m.x+=bx/bl*9; m.y+=by/bl*9;
    }
    if(m.hp<=0){ killMob(i); break; }
  }
}
}
  // Drops update
  for(let i=drops.length-1;i>=0;i--){
    const dr = drops[i]; dr.life--;
    const dd = Math.hypot(dr.x-player.x, dr.y-player.y);
    if(dd<100){ dr.x+=(player.x-dr.x)*0.14; dr.y+=(player.y-dr.y)*0.14; }
    if(dd<player.r+dr.r || dr.life<=0){
      if(dr.life>0){
        if(dr.type==='xp'){
          player.xp += dr.xp;
          while(player.xp>=player.xpToNext){
            player.xp -= player.xpToNext; player.level++;
            player.xpToNext = Math.floor(player.xpToNext*1.4);
            player.maxHp += 10; player.hp = Math.min(player.hp+20, player.maxHp);
          }
        } else {
          addPetalDrop(dr.type);
        }
      }
      drops.splice(i, 1);
    }
  }

  if(player.invincible>0) player.invincible--;
  if(frame%240===0 && player.hp<player.maxHp) player.hp = Math.min(player.maxHp, player.hp+1);

  updateHUD(faceCanvas, drawSmiley);
}
