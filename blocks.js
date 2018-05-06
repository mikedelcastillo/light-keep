var Block = function(options){
  this.x = this.y = 0;
  this.update = null;
  this.getCollisionPoint = null;
  for(var prop in options)
    this[prop] = options[prop];

  this._x = world.block.size * this.x;
  this._y = world.block.size * this.y;
};

var AirBlock = function(options){
  Block.call(this, options);
  this.type = 0;
};

var CylinderBlock = function(options){
  Block.call(this, options);
  this.type = 2;

  this.radius = world.block.size / 5;

  this.geometry = new THREE.CylinderGeometry(this.radius, this.radius, world.depth);
  this.mesh = new THREE.Mesh(
    this.geometry
  );
  this.mesh.rotation.x += Math.PI/2;
  this.mesh.position.x = this._x;
  this.mesh.position.y = this._y;


  this.mesh.updateMatrix();
  world.three.staticBlocks.geometry.merge(
    this.mesh.geometry,
    this.mesh.matrix
  );

  this.getCollisionPoint = function(point){
    return {
      x: this._x,
      y: this._y,
      radius: this.radius,
      mass: world.block.mass
    };
  };

};

var SolidBlock = function(options){
  Block.call(this, options);
  this.type = 1;
  this.geometry = new THREE.BoxGeometry(world.block.size, world.block.size, world.depth);
  this.mesh = new THREE.Mesh(
    this.geometry
  );

  this.mesh.position.x = this._x;
  this.mesh.position.y = this._y;

  this.mesh.updateMatrix();
  world.three.staticBlocks.geometry.merge(
    this.mesh.geometry,
    this.mesh.matrix
  );

  this.size = world.block.size;

  this.rect = [];

  this.rect.push({
    x: this._x - this.size/2,
    y: this._y - this.size/2
  });

  this.rect.push({
    x: this._x + this.size/2,
    y: this._y - this.size/2
  });

  this.rect.push({
    x: this._x + this.size/2,
    y: this._y + this.size/2
  });

  this.rect.push({
    x: this._x - this.size/2,
    y: this._y + this.size/2
  });

  this.getCollisionPoint = function(point){
    var points = [];
    for(var i = 0; i < this.rect.length; i++){
      var cur = this.rect[i];
      var nex = this.rect[(i + 1) % this.rect.length];
      var p = MIKE.nearestPointFromSegment(
        cur.x, cur.y,
        nex.x, nex.y,
        point.x, point.y
      );
      p.radius = 0;
      points.push(p);
    }

    var colPoint = points.pop();
    var colDist2 = (point.x - colPoint.x) * (point.x - colPoint.x)
                 + (point.y - colPoint.y) * (point.y - colPoint.y);

    points.push({
      x: this._x,
      y: this._y,
      radius: this.size/2
    })

    for(var i = 0; i < points.length; i++){
      var cur = points[i];
      var dist2 = (point.x - cur.x) * (point.x - cur.x)
                + (point.y - cur.y) * (point.y - cur.y);
      if(dist2 < colDist2){
        colPoint = cur;
        colDist2 = dist2;
      }
    }

    colPoint.mass = world.block.mass;

    return colPoint;
  };
};
