let scene;
let camera;
let renderer;
let ico;

let arToolkitSource;
let arToolkitContext;

const clock = new THREE.Clock();

const cameraParam = {
  fovy: 60,
  aspect: window.innerWidth / window.innerHeight,
  near: 0.1,
  far: 30.0,
  x: 0.0,
  y: 0.0,
  z: 0.0,
};

const rendererParam = {
  antialias: true,
  alpha: true,
  width: window.innerWidth,
  height: window.innerHeight,
};

const directionalLightParam = {
  color: 0xffffff,
  intensity: 1.0,
  x: 3,
  y: 5,
  z: -10,
};

const ambientLightParam = {
  color: 0xeeeeee,
  intensity: 0.5,
};

const objectParam = {
  x: 0,
  y: -1,
  z: 0,
};

const init = () => {
  scene = new THREE.Scene();
  scene.visible = false;

  renderer = new THREE.WebGLRenderer({
    antialias: rendererParam.antialias,
    alpha: rendererParam.alpha,
  });
  renderer.setClearColor(new THREE.Color("lightgrey"), 0);
  renderer.setSize(rendererParam.width, rendererParam.height);
  document.body.appendChild(renderer.domElement);

  camera = new THREE.Camera(
    cameraParam.fovy,
    cameraParam.aspect,
    cameraParam.near,
    cameraParam.far
  );
  camera.position.set(cameraParam.x, cameraParam.y, cameraParam.z);
  scene.add(camera);

  arToolkitSource = new THREEx.ArToolkitSource({
    sourceType: "webcam",
  });

  arToolkitSource.init(() => {
    setTimeout(() => {
      onResize();
    }, 2000);
  });

  arToolkitContext = new THREEx.ArToolkitContext({
    cameraParametersUrl:
      THREEx.ArToolkitContext.baseURL + "../data/data/camera_para.dat",
    detectionMode: "mono",
  });

  arToolkitContext.init(
    (onCompleted = () => {
      camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
    })
  );

  let onRenderFcts = [];
  onRenderFcts.push(() => {
    if (arToolkitSource.ready === false) return;
    arToolkitContext.update(arToolkitSource.domElement);
    scene.visible = camera.visible;
  });

  const markerControls = new THREEx.ArMarkerControls(arToolkitContext, camera, {
    type: "pattern",
    patternUrl: THREEx.ArToolkitContext.baseURL + "../data/data/patt.hiro",
    changeMatrixMode: "cameraTransformMatrix",
  });

  const directionalLight = new THREE.DirectionalLight(
    directionalLightParam.color,
    directionalLightParam.intensity
  );
  directionalLight.position.set(
    directionalLightParam.x,
    directionalLightParam.y,
    directionalLightParam.z
  );
  scene.add(directionalLight);

  const ambientLight = new THREE.AmbientLight(
    ambientLightParam.color,
    ambientLightParam.intensity
  );
  scene.add(ambientLight);

  const insideGeo = new THREE.CubeGeometry(1, 1, 1);
  const outsideGeo = new THREE.CubeGeometry(1, 1, 1);
  outsideGeo.faces.splice(4, 2);
  // const texture = new THREE.TextureLoader().load("texture.jpg");
  // texture.wrapS = THREE.RepeatWrapping;
  // texture.wrapT = THREE.RepeatWrapping;
  // texture.repeat.set(1, 1);
  const insideMat = new THREE.MeshLambertMaterial({
    side: THREE.BackSide,
    // map: texture,
  });
  const invisibleMat = new THREE.MeshBasicMaterial({ colorWrite: false });
  const insideBox = new THREE.Mesh(insideGeo, insideMat);
  const outsideBox = new THREE.Mesh(outsideGeo, invisibleMat);
  outsideBox.renderOrder = -1;
  outsideBox.scale.multiplyScalar(1.05);
  outsideBox.position.set(objectParam.x, objectParam.y, objectParam.z);
  insideBox.position.set(objectParam.x, objectParam.y, objectParam.z);
  scene.add(insideBox);
  scene.add(outsideBox);
};

let count = 0;
const render = () => {
  requestAnimationFrame(render);
  if (arToolkitSource.ready) {
    arToolkitContext.update(arToolkitSource.domElement);
    scene.visible = camera.visible;
  }
  const delta = clock.getDelta();
  if (count < 10) {
    console.log(delta);
    count++;
  }
  renderer.render(scene, camera);
};

const onResize = () => {
  arToolkitSource.onResizeElement();
  arToolkitSource.copyElementSizeTo(renderer.domElement);
  if (arToolkitContext.arController !== null) {
    arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas);
  }
};

window.addEventListener("resize", () => {
  onResize();
});

window.addEventListener("load", () => {
  init();
  render();
});