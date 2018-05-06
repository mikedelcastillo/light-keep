var MIKE_LIB = "MIKE";
(function(window){
  function init(){
    var lib = {
      version: "Math Libs",
      creator: "Mike del Castillo"
    };

    //component: constants.js
    lib.PI  = Math.PI * 1;
    lib.TAU = Math.PI * 2;
    lib.HPI = Math.PI / 2;

    //component: utils.js
    lib.def = function(v, def){
      if(typeof v === "undefined" || v == null) return def;
      return v;
    };

    lib.requireArguments = function(){
      //TODO: fix dis cause it sketch lolz
      for(let i = 0; i < arguments.length; i++)
        if(typeof arguments[i] === "undefined")
          throw "Error: Missing arguments.";
    };

    lib.swap = function(v1, v2, o){
      lib.requireArguments(v1, v2, o);
      let t = o[v1];
      //console.log(t, o[v1], o[v2], o);
      o[v1] = o[v2];
      o[v2] = t;
      //console.log("t: ", t, o[v1], o[v2], o);
    };

    lib.setProps = function(object, props){
      lib.requireArguments(object, props);
      for(var prop in props) object[prop] = props[prop];
    };

    //component: math.js
    lib.toRadians = function(n){
      return n / 180 * lib.PI;
    };

    lib.toDegrees = function(n){
      return n * 180 / lib.PI;
    };

    lib.normalizeAngle = function(n){
      n = n % lib.TAU;
      if(n < 0) n += lib.TAU;
      return n;
    };

    lib.angleDisplacement = function(f, t){
      let d = lib.normalizeAngle(t - f);
      let c = lib.normalizeAngle(lib.TAU - d);
      if(d >= c) return -c;
      return d;
    };

    lib.nearestPointFromSegment = function(x1, y1, x2, y2, x, y){
      let o = {
        a: { x: x1, y: y1 },
        b: { x: x2, y: y2 },
        c: { x: x, y: y },
        dx: x2 - x1,
        dy: y2 - y1
      };
      o.m = o.dy/o.dx;
      if(o.dy === 0){
        if(o.a.x > o.b.x) lib.swap("a", "b", o);
        if(o.a.x < x && x < o.b.x) return {x: x, y: o.a.y};
        else if(x <= o.a.x) return o.a;
        else return o.b;
      }
      else if(o.dx === 0){
        if(o.a.y > o.b.y) lib.swap("a", "b", o);
        if(o.a.y < y && y < o.b.y) return {x: o.a.x, y: y};
        else if(y <= o.a.y) return o.a;
        else return o.b;
      }
      else{
        if(o.a.x > o.b.x) lib.swap("a", "b", o);
        o.c = {};
        o.c.x = (o.m * o.a.x - (-1/o.m) * x + y - o.a.y)/(o.m + 1/o.m);
        o.c.y = o.m * (o.c.x - o.a.x) + o.a.y;
        if(o.a.x < o.c.x && o.c.x < o.b.x) return o.c;
        else if(o.c.x <= o.a.x) return o.a;
        else return o.b;
      }
    }

    lib.segmentIntersect = function(x1, y1, x2, y2, x3, y3, x4, y4){
      //TODO: more options for just using slopes, also 1D interesect
      let A1 = y2 - y1;
      let B1 = x1 - x2;
      let C1 = A1 * x1 + B1 * y1;

      let A2 = y4 - y3;
      let B2 = x3 - x4;
      var C2 = A2 * x3 + B2 * y3;

      let D = A1 * B2 - A2 * B1;

      if(D !== 0){
        let x = (B2 * C1 - B1 * C2)/D;
        let y = (A1 * C2 - A2 * C1)/D;
        if(Math.min(x1, x2) <= x && x <= Math.max(x1, x2) &&
           Math.min(x3, x4) <= x && x <= Math.max(x3, x4) &&
           Math.min(y1, y2) <= y && y <= Math.max(y1, y2) &&
           Math.min(y3, y4) <= y && y <= Math.max(y3, y4)){
            return {x: x, y: y};
        }
      }

      return null;
    };

    lib.prettyInt = function(n){
      //TODO: add flexibility
      n = Math.round(n).toString().split("").reverse().join("");
      var text = "";
      for(var i = 0; i < n.length; i++){
        text = n.charAt(i) + text;
        if((i + 1) % 3 == 0 && i != n.length - 1) text = "," + text;
      }
      return text;
    };

    lib.computePhysics = function(obj1, obj2){
      var comps = {
        dx: obj1.x - obj2.x,
        dy: obj1.y - obj2.y
      };
      comps.dist2 = comps.dx * comps.dx + comps.dy * comps.dy;
      comps.dist = Math.sqrt(comps.dist2);
      comps.diff = (obj1.radius + obj2.radius - comps.dist) / comps.dist;

      comps.s1 = (1 / obj1.mass) / ((1 / obj1.mass) + (1 / obj2.mass));
      comps.s2 = 1 - comps.s1;

      comps.x = comps.dx * comps.diff;
      comps.y = comps.dy * comps.diff;

      return comps;
    };

    return lib;
  }
  if(typeof window[MIKE_LIB] === "undefined")
    window[MIKE_LIB] = init();
})(window);
