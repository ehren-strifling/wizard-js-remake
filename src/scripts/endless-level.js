"use strict";
//Ehren Strifling

class EndlessLevel extends GridCollisionLevel {
  static SPAWN_COOLDOWN = 120;
  static MIN_SPAWN_DISTANCE = 360; //how close an enemy can spawn to a player
  static RADIUS = 1600;

  static SCORE_TIME = 1;
  static SCORE_ENEMY = 360;

  static HEAL_PER_KO = 100;
  static MANA_PER_KO = 100;
  static MAX_HEALTH_PER_KO = 10;
  static MAX_MANA_PER_KO = 10;


  constructor(instance) {
    super (instance);
    /** level area. Magic outside this area is destroyed. Wizards outside this area are bounced back in.
     * @type {number}
    */
    this.radius = this.constructor.RADIUS;
    //Grid cell size = width / cell count. MAKE SURE THE CELLS ARE NOT TOO TINY.
    this.grid = new Grid(128,128,this.constructor.RADIUS*2, this.constructor.RADIUS*2);

    //new properties
    /**@type {number} game time */
    this.time = -60;

    /**@type {WIzard} How many wizards the player has defeated */
    this.wizardsDefeated = 0;

    /** @type {Player} The game's player */
    this.player = new Player(this, 0, 0);
    /** @type {Wizard} */
    this.cameraTarget = this.player;
    this.addWizard(this.player);

    this.gameover = false;
  }

  reset() {
    this.time = -60;
    this.wizardsDefeated = 0;

    for (let i=this.wizards.length-1;i>=0;--i) {
      this.destroyWizard(i);
    }
    for (let i=this.magic.length-1;i>=0;--i) {
      this.destroyMagic(i);
    }

    this.player = new Player(this, 0, 0);
    /** @type {Wizard} */
    this.cameraTarget = this.player;
    this.addWizard(this.player);

    this.gameover = false;
  }

  /**
   * Main loop called every frame
   */
  act() {
    if (this.gameover) {
      this.reset();
    }

    if (this.time%this.constructor.SPAWN_COOLDOWN === 0) {
      this.spawnWizards();
    }
    super.act();

    this.time++;
  }

  destroyWizard(i) {
    let w = this.wizards[i].defeatedBy;
    if (w!==null) {
      if (w===this.player) {
        this.wizardsDefeated++;
      }
      w.maxHealth += this.constructor.MAX_HEALTH_PER_KO;
      w.maxMana += this.constructor.MAX_MANA_PER_KO;

      w.heal(this.constructor.HEAL_PER_KO);
      w.manaHeal(this.constructor.MANA_PER_KO);
    }
    //TEMP: There is an AFTERCODE.PLAYER_DEFEAT that could and should be used for this instead.
    if (this.wizards[i]===this.player) {
      this.gameover = true;
    }

    super.destroyWizard(i);
  }


  spawnWizards() {
    let v = this.getEnemySpawnLocation();
    this.addWizard(new Enemy(this, v.x, v.y));
  }

  getEnemySpawnLocation() {
    let v = new Vector2(Math.random()*this.radius-this.radius/2, Math.random()*this.radius-this.radius/2);
    if (this.player) {
      for (let i=0;i<8 && v.sqDistance(this.player) <= (this.constructor.MIN_SPAWN_DISTANCE * this.constructor.MIN_SPAWN_DISTANCE);++i) {
        v.set(Math.random()*this.radius-this.radius/2, Math.random()*this.radius-this.radius/2);
      }
      //random spawning didn't work.
      if (v.sqDistance(this.player) <= (this.constructor.MIN_SPAWN_DISTANCE * this.constructor.MIN_SPAWN_DISTANCE)) {
        if (v.x === this.player.x && v.y === this.player.y) {
          v.x+=1;
        }
        v.subtract(this.player).normalize().scale(this.constructor.MIN_SPAWN_DISTANCE);
      }
    }
    return v;
  }

  drawBackground() {
    let ctx = this.getContext();
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, this.getCanvas().width, this.getCanvas().height);

    ctx.lineWidth = 5;
    ctx.strokeStyle = "#000000";

    ctx.fillStyle = "#606060";
    ctx.beginPath();
    this.camera.circle(ctx, 0, 0, this.radius);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#808080";
    ctx.beginPath();
    this.camera.circle(ctx, 0, 0, this.radius * 3/4);
    ctx.fill();
    ctx.stroke();
    
    ctx.fillStyle = "#A0A0A0";
    ctx.beginPath();
    this.camera.circle(ctx, 0, 0, this.radius * 1/2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#C0C0C0";
    ctx.beginPath();
    this.camera.circle(ctx, 0, 0, this.radius * 1/4);
    ctx.fill();
    ctx.stroke();
    
    ctx.beginPath();
    ctx.fillStyle = "#000000";
    this.camera.circle(ctx, 0, 0, 5);
    ctx.fill();
  }
}