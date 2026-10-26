/* Ambient Three.js background: gold particle field + floating balloons.
   Follows ui-ux-pro-max threejs rules: BufferGeometry + Points for particles,
   and prefers-reduced-motion is tracked reactively. */
(function () {
  var canvas = document.getElementById('bg3d');
  if (!canvas || !window.THREE) return;

  var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  var noMotion = mq.matches;
  var onMotionPrefChange = function (e) { noMotion = e.matches; };
  if (mq.addEventListener) mq.addEventListener('change', onMotionPrefChange);
  else if (mq.addListener) mq.addListener(onMotionPrefChange);

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  } catch (e) { canvas.style.display = 'none'; return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 14;

  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  var keyLight = new THREE.DirectionalLight(0xfff1cc, 1.1);
  keyLight.position.set(4, 6, 8);
  scene.add(keyLight);
  var roseLight = new THREE.PointLight(0xfb7185, 1.4, 40);
  roseLight.position.set(-8, -4, 6);
  scene.add(roseLight);
  var goldLight = new THREE.PointLight(0xfbbf24, 1.6, 40);
  goldLight.position.set(8, 5, 4);
  scene.add(goldLight);

  /* ── particle field (BufferGeometry + Points) ── */
  var COUNT = 900;
  var geo = new THREE.BufferGeometry();
  var pos = new Float32Array(COUNT * 3);
  var speeds = new Float32Array(COUNT);
  for (var i = 0; i < COUNT; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 44;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 30;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 24;
    speeds[i] = 0.15 + Math.random() * 0.5;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  var dotTexture = makeDotTexture();
  var particles = new THREE.Points(geo, new THREE.PointsMaterial({
    size: 0.14, map: dotTexture, transparent: true, opacity: 0.85,
    color: 0xfde68a, depthWrite: false, blending: THREE.AdditiveBlending
  }));
  scene.add(particles);

  function makeDotTexture() {
    var c = document.createElement('canvas');
    c.width = c.height = 64;
    var ctx = c.getContext('2d');
    var g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.4, 'rgba(255,255,255,.6)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }

  /* ── balloons ── */
  var balloonColors = [0xfb7185, 0xfbbf24, 0xa78bfa, 0x60a5fa, 0x4ade80];
  var balloons = [];
  for (var b = 0; b < 9; b++) {
    var group = new THREE.Group();
    var color = balloonColors[b % balloonColors.length];
    var bodyMat = new THREE.MeshStandardMaterial({
      color: color, roughness: 0.35, metalness: 0.05,
      transparent: true, opacity: 0.85
    });
    var body = new THREE.Mesh(new THREE.SphereGeometry(0.75, 24, 24), bodyMat);
    body.scale.y = 1.25;
    group.add(body);
    var knot = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.3, 10), bodyMat);
    knot.position.y = -1.02;
    knot.rotation.x = Math.PI;
    group.add(knot);
    var stringGeo = new THREE.CylinderGeometry(0.012, 0.012, 2.4, 6);
    var string = new THREE.Mesh(stringGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25 }));
    string.position.y = -2.4;
    group.add(string);

    group.position.set((Math.random() - 0.5) * 30, -14 - Math.random() * 12, -4 - Math.random() * 8);
    group.userData = {
      riseSpeed: 0.35 + Math.random() * 0.45,
      swayPhase: Math.random() * Math.PI * 2,
      swayAmp: 0.5 + Math.random() * 0.8,
      x: group.position.x
    };
    scene.add(group);
    balloons.push(group);
  }

  window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  var clock = new THREE.Clock();
  var lastInteractionPush = 0;

  function animate() {
    requestAnimationFrame(animate);
    var dt = Math.min(clock.getDelta(), 0.05);
    var t = clock.elapsedTime;

    if (!noMotion) {
      // gentle particle drift upward
      var arr = geo.attributes.position.array;
      for (var i = 0; i < COUNT; i++) {
        arr[i * 3 + 1] += speeds[i] * dt * 0.6;
        if (arr[i * 3 + 1] > 15) arr[i * 3 + 1] = -15;
      }
      geo.attributes.position.needsUpdate = true;
      particles.rotation.y = t * 0.02;

      balloons.forEach(function (g, idx) {
        var u = g.userData;
        g.position.y += u.riseSpeed * dt;
        g.position.x = u.x + Math.sin(t * 0.6 + u.swayPhase) * u.swayAmp;
        g.rotation.z = Math.sin(t * 0.5 + u.swayPhase) * 0.08;
        if (g.position.y > 16) {
          g.position.y = -16;
          u.x = (Math.random() - 0.5) * 30;
          g.position.x = u.x;
        }
      });

      // subtle parallax toward pointer
      camera.position.x += ((mouseX * 1.2) - camera.position.x) * 0.03;
      camera.position.y += ((-mouseY * 0.8) - camera.position.y) * 0.03;
      camera.lookAt(0, 0, 0);
    }

    renderer.render(scene, camera);
  }

  var mouseX = 0, mouseY = 0;
  window.addEventListener('pointermove', function (e) {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  animate();
})();
