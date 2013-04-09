var camera, scene, stats, renderer;

var orb, redSphere, particles, lines, texts;

var hideRedSphere, showRedSphere;

var start = Date.now();

var studios;

init();
animate();

function init() {
  var separation = 375;

  var container = document.createElement('div');
  $('body').append(container);

  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
  camera.position.z = 875;

  scene = new THREE.Scene();

  // outside circle
  var resolution = 150;
  var amplitude = 575;
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

  redSphere = new THREE.Mesh(
      new THREE.SphereGeometry( 456, 28, 28 ),
      material
  );
  scene.add( redSphere );

  // parent containers
  orb = new THREE.Object3D();
  texts = new THREE.Object3D();
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

  // load the studios
  populateStudios();

  window.addEventListener( 'resize', onWindowResize, false );

  // defineTweens
  defineTweens();
}

function onWindowResize() {
  var windowHalfX = window.innerWidth / 2;
  var windowHalfY = window.innerHeight / 2;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );
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

  orb.rotation.x += .001;
  orb.rotation.y += .001;
  orb.rotation.z -= .001;

  if (texts.children.length > 0) {
    particles.updateMatrixWorld();

    $.each(texts.children, function(index) {
      var vector = particles.geometry.vertices[index].clone();
      texts.children[index].position = vector.applyMatrix4( particles.matrixWorld );
    });
  }

  renderer.render( scene, camera );
}

function defineTweens() {
  hideRedSphere = new TWEEN.Tween( { x: 1.0, y: 1.0, z:1.0 } )
    .to( { x: 0.01, y: 0.01, z: 0.01 }, 1000 )
    .easing( TWEEN.Easing.Linear.None )
    .onUpdate( function () {
      redSphere.scale = {x: this.x, y: this.y, z: this.z};
  })
    .onComplete( function() {
      redSphere.visible = false;
  });

  showRedSphere = new TWEEN.Tween( { x: 0.01, y: 0.01, z: 0.01 } )
    .to( { x: 1.0, y: 1.0, z:1.0 }, 1000 )
    .easing( TWEEN.Easing.Linear.None )
    .onStart( function() {
      redSphere.visible = true;
  })
    .onUpdate( function () {
      redSphere.scale = {x: this.x, y: this.y, z: this.z};
  });
}

function populateStudios() {
  $.getJSON('data/studio-data.json', function(data){
    studios = data;
  });
}

function populateProjects( studio ) {
  $.each(studios[studio], function(project) {
    console.log(project);
  });
}

function createText( text ) {
  var textArray = ['Lorem', 'ipsum', 'dolor', 'sit', 'amet,', 'consectetur', 'adipiscing', 'elit', 'Mauris', 'et', 'nunc', 'urna,', 'eget', 'aliquet', 'neque', 'Pellentesque', 'habitant', 'morbi', 'tristique', 'senectus', 'et', 'netus', 'et', 'malesuada', 'fames', 'ac', 'turpis', 'egestas', 'Praesent', 'et', 'arcu', 'tincidunt', 'metus', 'feugiat', 'pretium', 'et', 'at', 'purus', 'In', 'venenatis', 'lobortis', 'volutpat', 'Etiam', 'non', 'tortor', 'dolor,', 'eget', 'eleifend', 'lorem', 'Nulla', 'vitae', 'lectus', 'metus,', 'quis', 'aliquam', 'enim', 'Morbi', 'vel', 'lacus', 'quis', 'libero', 'blandit', 'pulvinar', 'Nunc', 'luctus', 'felis', 'non', 'ligula', 'tempor', 'rutrum', 'Nulla', 'facilisi', 'Donec', 'in', 'dui', 'eu', 'tortor', 'mattis', 'viverra', 'in', 'vitae', 'dolor', 'Mauris', 'quis', 'lorem', 'magna', 'Nullam', 'tempus', 'dapibus', 'eros', 'nec', 'mollis', 'Suspendisse', 'eu', 'tempus', 'orci', 'Duis', 'quis', 'lobortis', 'velit'];

  $.each(textArray, function(index) {
    var fontShapes = THREE.FontUtils.generateShapes( textArray[index], {
      font: "optimer",
      weight: "normal",
      size: 20
    } );

    var textGeo = new THREE.ShapeGeometry( fontShapes );
    var textMat = new THREE.MeshBasicMaterial();
    var textMesh = new THREE.Mesh( textGeo, textMesh );

    // Offsets origin to the center of the text
    textMesh.geometry.applyMatrix( new THREE.Matrix4().translate( new THREE.Vector3( -textMesh.geometry.boundingSphere.radius/2, 0, 0 ) ) );
    texts.add( textMesh );
  });

  scene.add( texts );
}