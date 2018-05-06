var world = {
  blocks: [],
  width: 100,
  height: 100,
  depth: 50,
  block: {
    size: 100,
    mass: 1000000000000000000
  },
  lights: {
    ambient: null,
    player: null,
    scattered: []
  },
  three: {
    staticBlocks: null,
    bgPlane: null
  },
  player: null,
  entities: [],
  color: {
    solidBlock: 0xAAAAAA
  }
};

world.block.get = function(x, y, absolute){
  var d = absolute ? 1 : world.block.size;
  var i = y * world.height + (x % world.width);
  if(i >= 0 && i < world.blocks.length) return world.blocks[i];
  else return null;
};

var Ball = function(options){
  this.x = options.x;
  this.y = options.y;
  this.radius = 1;

  this.physics = {
    vx: 0, vy: 0, f: 0.985,
    grounded: false,
    gx: 0, gy: 0,//-0.1,
    clip: false
  };

  var p = this.physics;
  var t = this;

  this.updateEntityCollision = function(){
    if(!this.clip){
      for(var i = 0; i < world.entities.length; i++){
        var entity = world.entities[i];
        if(entity != this && !entity.clip){
          var c = MIKE.computePhysics(this, entity);

          if(c.dist < this.radius + entity.radius){
            p.vx += c.x * c.s1;
            p.vy += c.y * c.s1;
            t.x += c.x * c.s1;
            t.y += c.y * c.s1;

            entity.physics.vx -= c.x * c.s2;
            entity.physics.vy -= c.y * c.s2;
            entity.x -= c.x * c.s2;
            entity.y -= c.y * c.s2;
          }
        }
      }
    }
  };

  this.updateBlockCollision = function(){
    var blocks = [];
    var debug = [];

    var range = Math.ceil(this.radius / world.block.size);

    for(var x = -range; x <= range; x++){
      for(var y = -range; y <= range; y++){
        var _x = Math.round(this.x / world.block.size) + x;
        var _y = Math.round(this.y / world.block.size) + y;
        var b = world.block.get(
          _x,
          _y, true);
        if(b){
          blocks.push(b);
          debug.push(_x + " " + _y);
        }
      }
    }

    for(var i = 0; i < blocks.length; i++){
      var block = blocks[i];
      if(block.getCollisionPoint){
        var cp = block.getCollisionPoint(this);
        var c = MIKE.computePhysics(this, cp);

        if(c.dist < cp.radius + this.radius){
          p.vx += c.x * c.s1;
          p.vy += c.y * c.s1;
          t.x += c.x * c.s1;
          t.y += c.y * c.s1;
        }
      }
    }
  };

  this.updatePhysics = function(){
    p.vx += p.gx;
    p.vy += p.gy;

    p.vx *= p.f;
    p.vy *= p.f;
  };

  this.updatePosition = function(){
    t.x += p.vx;
    t.y += p.vy;
  };

  this.render = null;
};

var Player = function(options){
  Ball.call(this, options);

  var p = this.physics;
  var t = this;

  this.mass = 200;
  this.speed = .2;

  this.defaultRadius = 10;
  this.pushRadius = 16;
  this.radius = this.defaultRadius;
  this.pushing = false;

  this.material = new THREE.MeshStandardMaterial({
    color: 0xFFFFFF,
    metalness: 1,
    roughness: 0.5,
    emissive: 0xFFFFFF
  })
  this.geometry = new THREE.SphereBufferGeometry(this.radius, 8, 8);
  this.mesh = new THREE.Mesh(
    this.geometry, this.material
  );

  this.mesh.position.x = this._x;
  this.mesh.position.y = this._y;
  //this.mesh.castShadow = this.mesh.receiveShadow = true;

  scene.add(this.mesh);

  this.health = 0.8;
  this.redness = 0;

  this.update = function(){
    if(key[87])
      p.vy += this.speed;

    if(key[83])
      p.vy += -this.speed;

    if(key[68])
      p.vx += this.speed;

    if(key[65])
      p.vx += -this.speed;

    if(key[32]){
      if(!this.pushing){
        this.pushing = true;
        this.radius = this.pushRadius;
      } else{
        this.radius = this.defaultRadius;
      }
    } else{
      this.radius = this.defaultRadius;
      this.pushing = false;
    }

    if(mouse.down){
      p.vx -= (mouse.dx - mouse.x)/5000;
      p.vy += (mouse.dy - mouse.y)/3000;
    }

    this.health += 0.001;
    this.health = Math.min(1, Math.max(0, this.health));

    if(this.health <= 0) location.href = "index.html";

    this.redness -= 0.001;
    this.redness = Math.min(1, Math.max(0, this.redness));

    world.lights.player.intensity = this.health;
    world.lights.player.color.g = 1 - this.redness;
    world.lights.player.color.b = 1 - this.redness;
  }

  this.render = function(){
    this.mesh.position.x = this.x;
    this.mesh.position.y = this.y;
  };
};

var Enemy = function(options){
  Ball.call(this, options);

  this.hostile = true;
  this.radius = 5;
  this.mass = 50;
  this.speed = .1;

  this.physics.gy = 0;
  this.physics.f = 0.98;

  this.material = new THREE.MeshStandardMaterial({
    color: 0xFFFFFF,
    metalness: 1,
    roughness: 0.5
  });

  this.geometry = new THREE.SphereBufferGeometry(this.radius, 8, 8);
  this.mesh = new THREE.Mesh(
    this.geometry, this.material
  );

  this.mesh.position.x = this._x;
  this.mesh.position.y = this._y;
  this.mesh.castShadow = this.mesh.receiveShadow = true;

  scene.add(this.mesh);

  this.update = function(){
    var dist2 = (this.x - world.player.x) * (this.x - world.player.x) + (this.y - world.player.y) * (this.y - world.player.y);
    if(true || dist2 < 400 * 400){
      var angle = Math.atan2(this.y - world.player.y, this.x - world.player.x);
      this.physics.vx -= this.speed * Math.cos(angle);
      this.physics.vy -= this.speed * Math.sin(angle);

      if(dist2 < Math.pow(this.radius + world.player.radius, 2)){
        world.player.health -= 0.005;
        world.player.redness += 0.1;
      }
    }
  };

  this.render = function(){
    this.mesh.position.x = this.x;
    this.mesh.position.y = this.y;
  };

};

var BeachBall = function(options){
  Ball.call(this, options);

  this.radius = world.block.size/4;
  this.mass = 500;


  this.physics.gy = 0;
  this.physics.f = 1;

  this.material = new THREE.MeshStandardMaterial({
    color: 0xFFFFFF,
    metalness: 0,
    roughness: 1
  });

  this.geometry = new THREE.SphereBufferGeometry(this.radius, 8, 8);
  this.mesh = new THREE.Mesh(
    this.geometry, this.material
  );

  // this.light = new THREE.PointLight(0xFFFFFF, 1);
  // this.mesh = this.light;


  this.mesh.position.x = this._x;
  this.mesh.position.y = this._y;
  this.mesh.castShadow = this.mesh.receiveShadow = true;

  scene.add(this.mesh);

  this.update = function(){

  };

  this.render = function(){
    this.mesh.position.x = this.x;
    this.mesh.position.y = this.y;
  };
};
