var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;

var mouseX = 0, mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var separation = 345;
var amountX = 50, amountY = 50;

var camera, scene, stats, renderer;

var orb, particles, lines, oldLines;

var object, uniforms, attributes;

var start = Date.now();

init();
animate();

function init() {
  var container = document.createElement('div');
  $('body').append(container);

  camera = new THREE.PerspectiveCamera( 75, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 10000 );
  camera.position.z = 800;

  scene = new THREE.Scene();

  // outside circle
  var resolution = 150;
  var amplitude = 600;
  var size = 360 / resolution;

  var geometry = new THREE.Geometry();
  var material = new THREE.LineBasicMaterial( { color: 0x656565 } );
  for(var i = 0; i <= resolution; i++) {
      var segment = ( i * size ) * Math.PI / 180;
      geometry.vertices.push( new THREE.Vector3( Math.cos( segment ) * amplitude, Math.sin( segment ) * amplitude, 0 ) );
  }

  var circle = new THREE.Line( geometry, material );
  scene.add( circle );

  // red sphere
  var material = new THREE.MeshBasicMaterial( {
      color: 0x660022,
      opacity: 0.5,
      transparent: true,
  } );

  var sphere = new THREE.Mesh(
      new THREE.SphereGeometry( 456, 28, 28 ),
      material
  );
  scene.add( sphere );

  // orb parent container
  orb = new THREE.Object3D();
  scene.add( orb );

  // particles and lines
  var particleGeo = new THREE.Geometry();
  var lineGeo = new THREE.Geometry();

  for ( var i = 0; i < 1500; i ++ ) {
    var particle = new THREE.Vector3();

    particle.x = Math.random() * 2 - 1;
    particle.y = Math.random() * 2 - 1;
    particle.z = Math.random() * 2 - 1;
    particle.normalize();
    particle.multiplyScalar( Math.random() * 10 + 450 );

    particleGeo.vertices.push( particle );

    for (var j = 0; j < particleGeo.vertices.length-1; j++) {
      d = particle.distanceTo(particleGeo.vertices[j]);

      if (d < separation / 5) {
        lineGeo.vertices.push( particle );
        lineGeo.vertices.push( particleGeo.vertices[j] );
      }
    }
  }

  var particleMat = new THREE.ParticleBasicMaterial( { size: 3 } );
  particles = new THREE.ParticleSystem( particleGeo, particleMat );
  orb.add( particles );

  var shader = THREE.DisintegrateShader;

  attributes = THREE.UniformsUtils.clone( shader.attributes );
  uniforms = THREE.UniformsUtils.clone( shader.uniforms );

  var shaderMaterial = new THREE.ShaderMaterial( {

    uniforms:       uniforms,
    attributes:     attributes,
    vertexShader:   shader.vertexShader,
    fragmentShader: shader.fragmentShader,
    blending:       THREE.AdditiveBlending,
    depthTest:      false,
    transparent:    true,
    vertexColors:   THREE.VertexColors

  });

  shaderMaterial.linewidth = 1;

  lineGeo.dynamic = true;

  lines = new THREE.Line( lineGeo, shaderMaterial, THREE.LinePieces );

  var vertices = lines.geometry.vertices;
  var color = attributes.customColor.value;

  for( var v = 0; v < vertices.length; v ++ ) {

    color[ v ] = new THREE.Color( 0xffffff );

  }

  orb.add( lines );

  renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  $(container).append( renderer.domElement );

  stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.top = '0px';
  $(container).append( stats.domElement );

  window.addEventListener( 'resize', onWindowResize, false );

  // setInterval(function() { recalcLines() }, 3000);
}

function onWindowResize() {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );
}

function recalcLines() {
  var sign;

  if ( Math.random() > .5 )
    sign = true;
  else
    sign = false;

  if (sign) {
    separation += Math.random()*50;
  } else {
    separation -= Math.random()*50;
  }

  var lineGeo = new THREE.Geometry();

  console.log('recalculated');

  for ( var i = 0; i < particles.geometry.vertices.length; i ++ ) {
    for (var j = i + 1; j < particles.geometry.vertices.length; j++) {
      d = particles.geometry.vertices[i].distanceTo(particles.geometry.vertices[j]);

      if (d < separation / 5) {
        lineGeo.vertices.push( particles.geometry.vertices[i] );
        lineGeo.vertices.push( particles.geometry.vertices[j] );
      }
    }
  }

  material = new THREE.LineBasicMaterial( { opacity: 0.25, linewidth: 1, transparent: true } );

  // oldLines = new THREE.Line( lines.geometry, material, THREE.LinePieces );

  orb.remove( lines );
  // orb.add( oldLines );

  // var tween = new TWEEN.Tween( { opacity: 0.25 } )
  //   .to( { opacity: 0 }, 5000 )
  //   .easing( TWEEN.Easing.Linear.None )
  //   .onUpdate( function () {

  //     oldLines.material.opacity = this.opacity;

  //   } )
  //   .start();

  lines = new THREE.Line( lineGeo, material, THREE.LinePieces );
  orb.add( lines );
}

function animate() {
  requestAnimationFrame( animate );

  render();
  TWEEN.update();
  stats.update();
}

function render() {
  uniforms.time.value = .00015 * ( Date.now() - start );

  camera.lookAt( scene.position );

  orb.rotation.x += .002;
  orb.rotation.y += .002;
  orb.rotation.z -= .002;

  renderer.render( scene, camera );

  // lines.material.opacity = 1 + Math.sin(new Date().getTime() * .0025);
}