var camera, scene, renderer, canvas;
var $message;
var key = {};

var mouse = {
  down: false,
  x: 0, y: 0,
  dx: 0, dy: 0
};

window.addEventListener("keydown", function(e){
  key[e.keyCode] = true;
  e.preventDefault();
  return false;
}, false);

window.addEventListener("keyup", function(e){
  key[e.keyCode] = false;
}, false);

document.addEventListener("touchstart", function(e){
  console.log(mouse);
  mouse.down = true;
  mouse.x = mouse.dx = e.touches[0].clientX;
  mouse.y = mouse.dy = e.touches[0].clientY;
  e.preventDefault();
  return false;
}, false);

document.addEventListener("touchmove", function(e){
  console.log(mouse);
  e.preventDefault();
  return false;
}, false);

document.addEventListener("touchend", function(e){
  mouse.down = false;

  console.log(mouse);
  e.preventDefault();
  return false;
}, false);

window.addEventListener("load", function(){
  initTHREE();
  initMap();

  world.player = new Player({
    x: world.width/2 * world.block.size,
    y: world.height * world.block.size
  });

  world.entities.push(world.player);

  for(var i = 0; i < 100; i++){
    world.entities.push(
      new Enemy({
        x: world.width * world.block.size / 2 + (0.5 - Math.random()) * world.block.size * 10,
        y: (Math.random() * world.height - 10) * world.block.size
      })
    );
  }

  for(var i = 0; i < 100; i++){
    world.entities.push(
      new BeachBall({
        x: world.width * world.block.size / 2 + (0.5 - Math.random()) * world.block.size * 10,
        y: (Math.random() * world.height - 10) * world.block.size
      })
    );
  }

  window.addEventListener("resize", function(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }, false);

  $message = $("#message");
  $message
    .text("Keep the light alive.")
    .show()
    .delay(2000)
    .fadeOut(1000, loop);
}, false);

function initMap(){
  var blockTypes = ["AirBlock", "SolidBlock", "CylinderBlock"].reverse();
  for(var i = 0; i < world.width * world.height; i++){
    var blockType = this[blockTypes[Math.floor(Math.sqrt(Math.random()) * blockTypes.length)]];
    world.blocks.push(
      new blockType({
        x: i % world.width,
        y: Math.floor(i/world.height)
      })
    );
  }
}

function initTHREE(){
  canvas = document.getElementById("canvas");

  renderer = new THREE.WebGLRenderer({
    canvas: canvas, antialias: false, alpha: false
  });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PFCShadowMap;
  renderer.setClearColor(0x000000);

  camera = new THREE.PerspectiveCamera(
    60, window.innerWidth/window.innerHeight, 0.1, 1000
  );

  scene = new THREE.Scene();

  world.lights.ambient = new THREE.AmbientLight(0xffffff, 0.5);
  //scene.add(world.lights.ambient);

  world.lights.player = new THREE.PointLight(0xffffff, 1);
  world.lights.player.castShadow = true;
  scene.add(world.lights.player);


  for(var i = 0; i < 0; i++){
    var light = new THREE.PointLight(0xFF0000, 0.75);
    light.position.x = Math.random() * world.width * world.block.size;
    light.position.y = Math.random() * world.height * world.block.size;
    light.castShadow = true;
    scene.add(light);
  }

  world.three.bgPlane = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(1000, 1000),
    new THREE.MeshStandardMaterial({
      color: world.color.solidBlock,
      metalness: 0,
      roughness: 0.5
    })
  );
  world.three.bgPlane.receiveShadow = true;
  world.three.bgPlane.position.z -= world.depth/2 + 2;
  scene.add(world.three.bgPlane);

  world.three.staticBlocks = new THREE.Mesh(new THREE.Geometry(),
  new THREE.MeshStandardMaterial({
    color: world.color.solidBlock,
    metalness: 0.75,
    roughness: 0.5
  }));
  world.three.staticBlocks.castShadow = true;
  world.three.staticBlocks.receiveShadow = true;
  scene.add(world.three.staticBlocks);

  setViewSize();
}

function setViewSize(){
  renderer.setSize(window.innerWidth, window.innerHeight);

}

function loop(){
  update();
  render();

  requestAnimationFrame(loop);
}

function update(){

  for(var i = 0; i < world.blocks.length; i++){
    var block = world.blocks[i];
    if(block.update) block.update();
  }

  for(var i = 0; i < world.entities.length; i++){
    var ent = world.entities[i];
    if(ent.update) ent.update();
  }

  for(var i = 0; i < world.entities.length; i++){
    var ent = world.entities[i];
    if(ent.updateBlockCollision) ent.updateBlockCollision();
    if(ent.updateBlockCollision) ent.updateEntityCollision();
    if(ent.updatePhysics) ent.updatePhysics();
  }

  for(var i = 0; i < world.entities.length; i++){
    var ent = world.entities[i];
    if(ent.updatePosition) ent.updatePosition();
  }
}

function render(){

  camera.position.z = 400;
  var pabebeness = 20;
  camera.position.x += (world.player.x - camera.position.x)/pabebeness;
  camera.position.y += (world.player.y - camera.position.y)/pabebeness;
  world.three.bgPlane.position.x = camera.position.x;
  world.three.bgPlane.position.y = camera.position.y;
  //camera.lookAt(world.player.mesh.position)
  world.lights.player.position.y = world.player.y;
  world.lights.player.position.x = world.player.x;

  for(var i = 0; i < world.entities.length; i++){
    var ent = world.entities[i];
    if(ent.render) ent.render();
  }
  renderer.render(scene, camera);
}
