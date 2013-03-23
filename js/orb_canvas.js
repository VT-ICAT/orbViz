var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;

var mouseX = 0, mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var separation = 400;
var amountX = 50, amountY = 50;

var camera, scene, stats, renderer;

var orb, particles, lines;

init();
animate();

function init() {
  var container;
  var particle;

  container = document.createElement('div');
  $('body').append(container);

  camera = new THREE.PerspectiveCamera( 75, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 10000 );
  camera.position.z = 800;

  scene = new THREE.Scene();

  renderer = new THREE.CanvasRenderer();
  renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
  $(container).append( renderer.domElement );

  stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.top = '0px';
  $(container).append( stats.domElement );

  orb = new THREE.Object3D();
  particles = new THREE.Object3D();
  lines = new THREE.Object3D();

  orb.add(particles);
  orb.add(lines);

  scene.add( orb );

  // particles
  var PI2 = Math.PI * 2;
  var material = new THREE.ParticleCanvasMaterial( {
    color: 0xffffff,
    program: function ( context ) {
      context.beginPath();
      context.arc( 0, 0, 1, 0, PI2, true );
      context.closePath();
      context.fill();
    }
  } );

  for ( var i = 0; i < 1000; i ++ ) {
    particle = new THREE.Particle( material );
    particle.position.x = Math.random() * 2 - 1;
    particle.position.y = Math.random() * 2 - 1;
    particle.position.z = Math.random() * 2 - 1;
    particle.position.normalize();
    particle.position.multiplyScalar( Math.random() * 10 + 450 );
    // scene.add( particle );

    particles.add( particle );

    for (var j = 0; j < particles.children.length-1; j++) {
      d = particle.position.distanceTo(particles.children[j].position);

      if (d < separation / 5) {
        var geometry = new THREE.Geometry();

        geometry.vertices.push( particle.position );
        geometry.vertices.push( particles.children[j].position );

        var line = new THREE.Line( geometry, new THREE.LineBasicMaterial( { color: 0xffffff, opacity: Math.random() } ) );

        lines.add( line );
      }
    }
  }

  // lines
  // for (var i = 0; i < 300; i++) {
  //   var geometry = new THREE.Geometry();

  //   var vertex = new THREE.Vector3( Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1 );
  //   vertex.normalize();
  //   vertex.multiplyScalar( 450 );

  //   geometry.vertices.push( vertex );

  //   var vertex2 = vertex.clone();
  //   vertex2.multiplyScalar( Math.random() * 0.3 + 1 );

  //   geometry.vertices.push( vertex2 );

  //   var line = new THREE.Line( geometry, new THREE.LineBasicMaterial( { color: 0xffffff, opacity: Math.random() } ) );
  //   // scene.add( line );
  //   lines.add( line );
  // }

  window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
  requestAnimationFrame( animate );

  render();
  stats.update();
}

function render() {
  // camera.position.x += ( camera.position.x ) * .05;
  // camera.position.y += ( - mouseY + 200 - camera.position.y ) * .05;
  camera.lookAt( scene.position );

  orb.rotation.x += .002;
  orb.rotation.y += .002;
  orb.rotation.z -= .002;

  renderer.render( scene, camera );
}