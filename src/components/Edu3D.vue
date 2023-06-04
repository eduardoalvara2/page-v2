<template>
    <div ref="canvasContainer">
      <div class="canvas" ref="canvas"></div>
    </div>
</template>
<script>
  /* Author: Eduardo Alvarado 
  * Date: 2023-02-14
  * Description: This component is used to display the main 3D scene
  */
  import * as THREE from 'three'
  import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
  import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
  import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
  import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
  import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

  export default {
    name: 'Edu3D',
    components: {
    },
    props: {
      scroll: Number
    },
    data: function () {
      return {
        particlesQuantity: 1000,
        mouseSensitivity: 0.10,
        radius: 200,
        rocketSmokeInterval: null,
        rocketSmokeArr: [],
        maxRocketSmokeAtOnce: 13,
        targetCameraPosition: null,
        ready: false,
        loadParticlesReady: false,
        loadEduLetterReady: false,
        loadRocketReady: false,
        loadRocketSmokeReady: false,
        scrollRelative: 0,
      }
    },
    created: function () {
      this.scene = null;
      this.camera = null;
      this.renderer = null;
      this.composer = null;
      this.light = null;
      this.particleSystem = null;
      this.particleGeometry = null;
      this.particleColor = 0xffffff;
      this.geometry = null;
      this.material = null;
      this.eduLetterObj = null;
      this.rocketObj = null;
      this.rocketLight = null;
      this.raycaster = null;
      this.pointer = null;
      this.init();
    },
    watch: {
      scroll: function (val) {
        this.scrollRelative = (val / 200) * -1;
        this.targetCameraPosition.y = this.scrollRelative;
      }
    },
    methods: {
      async start(){
        this.ready = false;
        this.$refs.canvas.appendChild(this.renderer.domElement)
        await this.loadAllModels();
        this.lateInit();
        this.animate();
        this.listen();
        this.rocketSmokeInterval = setInterval(() => {
          this.placeRocketSmoke();
          this.collectPlacedRocketSmokes();
        }, 100);
        this.ready = true;
        this.$emit('ready');
      },
      init() {
        this.scene = new THREE.Scene()
        this.camera = new THREE.PerspectiveCamera(
          75, // fov
          window.innerWidth / window.innerHeight, // aspect ratio
          0.1, // near clipping plane
          1000 // far clipping plane
        )
        this.renderer = new THREE.WebGLRenderer({
          powerPreference: "high-performance",
          antialias: false,
          stencil: false,
          depth: true
        })
        this.renderer.setPixelRatio( 1 ); // ensure pixel ratio is always 1 for performance reasons
        
        // Postprocessing 
        this.composer = new EffectComposer(this.renderer)
        this.composer.addPass(new RenderPass(this.scene, this.camera))

        // Raycaster
        this.raycaster = new THREE.Raycaster();
        this.raycaster.near = 0.1;
        this.pointer = new THREE.Vector2();
  
        // Bloom
        const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
				bloomPass.threshold = 0;
				bloomPass.strength = 0.3;
				bloomPass.radius = 0.25;
				this.composer.addPass( bloomPass ); // ensure pixel ratio is always 1 for performance reasons
  
        // Antialiasing
				this.composer.setPixelRatio( 1 ); // ensure pixel ratio is always 1 for performance reasons
        // - SMAA
				const smaaPass = new SMAAPass( this.scene, this.camera );
				this.composer.addPass( smaaPass ); // ensure pixel ratio is always 1 for performance reasons
        
        // - SSAA
        // const ssaaRenderPassP = new SSAARenderPass( this.scene, this.camera );
				// this.composer.addPass( ssaaRenderPassP );
        
        // Lighting
        this.light = new THREE.DirectionalLight('hsl(0, 100%, 100%)', 1)
        this.geometry = new THREE.BoxGeometry(1, 1, 1)
        this.material = new THREE.MeshStandardMaterial({
          side: THREE.FrontSide,
          color: 'hsl(0, 100%, 50%)',
          wireframe: false
        })
      },
      async loadAllModels(){
        this.loadParticles();
        await this.loadEduLetter();
        await this.loadRocket();
        await this.loadRocketSmoke();
      },
      lateInit() {
        this.scene.add(this.camera)
        this.scene.add(this.light)
        // this.scene.fog = new THREE.FogExp2( 0xFF7853, 0.1 );
        this.scene.fog = new THREE.FogExp2( 0xFF9873, 0.1 );
        this.renderer.setClearColor(0x000000, 0);
        this.light.position.set(0, 0, 10)
        this.camera.position.z = 2
        this.targetCameraPosition = this.camera.position.clone();
        this.setRenderSize();
      },
      setRenderSize(){
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.composer.setSize(window.innerWidth, window.innerHeight);
      },
      loadParticles() {
        this.particleGeometry = new THREE.BufferGeometry();
        
        const positions = [];
        const colors = [];
        const sizes = [];
  
        const color = new THREE.Color();
  
        for ( let i = 0; i < this.particlesQuantity; i ++ ) {
  
          positions.push( ( Math.random() * 2 - 1 ) * this.radius );
          positions.push( ( Math.random() * 2 - 1 ) * this.radius );
          positions.push( ( Math.random() * 2 - 1 ) * this.radius );
  
          color.setHSL( i / this.particlesQuantity, 1.0, 0.5 );
  
          colors.push( color.r, color.g, color.b );
  
          sizes.push( 10 );
  
        }
  
        const textureLoader = new THREE.TextureLoader();
        const sprite = textureLoader.load( require('../assets/images/star.png') );
        const particleMaterial = new THREE.PointsMaterial({
          color: this.particleColor,
          map: sprite,
          size: 3,
          alphaTest: 0.5, // Ajusta el alphaTest para que las partículas sean transparentes
          transparent: true
        });

        this.particleGeometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
        this.particleGeometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
        this.particleGeometry.setAttribute( 'size', new THREE.Float32BufferAttribute( sizes, 1 ).setUsage( THREE.DynamicDrawUsage ) );
  
        this.particleSystem = new THREE.Points(
          this.particleGeometry,
          particleMaterial
        )
        this.scene.add(this.particleSystem)
      },
      loadEduLetter: async function () {
        const loader = new GLTFLoader();
        return loader.loadAsync( require('../assets/models/EduDeveloper.glb'), function () {
        }).then( r => {
            this.eduLetterObj = r.scene;
            this.eduLetterObj.scale.set(0.4, 0.4, 0.4);
            this.scene.add(this.eduLetterObj);
            this.eduLetterObj.position.x = 0.05;  
            this.eduLetterObj.position.y = 0.25;  
        });
      },
      loadRocket: async function () {
        const loader = new GLTFLoader();
        return loader.loadAsync( require('../assets/models/Rocket.glb'), function () {
        }).then( r => {
            this.rocketObj = r.scene;
            this.rocketObj.scale.set(0.15, 0.15, 0.17);
            this.scene.add(this.rocketObj);
            this.rocketObj.position.x = 1;  
            this.rocketObj.position.y = 0;
            this.rocketObj.position.z = -10;

        });
      },
      loadRocketSmoke: async function () {
        const loader = new GLTFLoader();
        return loader.loadAsync( require('../assets/models/Cloud.glb'), function () {
        }).then( r => {
            this.rocketSmokePrefab = r.scene;
            this.rocketSmokePrefab.scale.set(0.05, 0.05, 0.05);
        });
      },
      placeRocketSmoke(){
        const time = Date.now();

        if(!this.rocketSmokePrefab || !this.rocketObj) return;
        const rocketSmoke = this.rocketSmokePrefab.clone();
        this.scene.add(rocketSmoke);
        // position
        rocketSmoke.position.x = this.rocketObj.position.x;
        rocketSmoke.position.y = this.rocketObj.position.y;
        rocketSmoke.position.z = this.rocketObj.position.z;
        rocketSmoke.name = 'rocketSmoke' + time;
        // random rotation
        rocketSmoke.rotation.x = Math.random() * 2 * Math.PI;
        rocketSmoke.rotation.y = Math.random() * 2 * Math.PI;
        rocketSmoke.rotation.z = Math.random() * 2 * Math.PI;
        // random scale
        const scale = Math.random() * 0.1 + 0.01;
        rocketSmoke.scale.set(scale, scale, scale);
        this.rocketSmokeArr.push(rocketSmoke);
      },
      collectPlacedRocketSmokes(){
        if(this.rocketSmokeArr.length > this.maxRocketSmokeAtOnce){
          const objectToDelete = this.scene.getObjectByName(this.rocketSmokeArr[0].name);
          this.scene.remove(objectToDelete);
          this.rocketSmokeArr.shift();
        }
      },
      animate() {
        requestAnimationFrame(this.animate.bind(this))  
        this.animateParticles();
        this.animateRocket();
        this.animateRocketSmoke();
        this.animateCamera();
        this.composer.render(this.scene, this.camera)
      },
      animateParticles(){
        const time = Date.now() * 0.0005;
  
        this.particleSystem.rotation.y = 0.009 * time;
        this.particleSystem.position.z += 0.005;
  
      },
      animateRocket(){
        if(!this.rocketObj) return;
        const mouseVector = new THREE.Vector3();
        mouseVector.set(this.pointer.x, this.pointer.y, 0.5);
        mouseVector.unproject(this.camera);
        this.raycaster.set(this.camera.position, mouseVector.sub(this.camera.position).normalize());
        
        // get raycaster position
        const raycasterPosition = this.raycaster.ray.direction;

        const y = raycasterPosition.y * (4 / 1.5) - 0.3 + this.scrollRelative;
        const x = raycasterPosition.x * 3;
        const z = ( raycasterPosition.y * 1 )  ;
        

        const targetPosition = new THREE.Vector3(x, y, z);

        this.rocketObj.position.lerp(targetPosition, 0.01);
        this.rocketObj.lookAt(targetPosition);

      },
      animateRocketSmoke(){
        this.rocketSmokeArr.forEach((rocketSmoke) => {
          rocketSmoke.scale.lerp(new THREE.Vector3(0, 0, 0), 0.01);
        })
      },
      animateRaycaster(){
        this.raycaster.setFromCamera( this.pointer, this.camera );
  
        // calculate objects intersecting the picking ray
        const intersects = this.raycaster.intersectObjects( this.scene.children );
        // const raycasterPosition = this.raycaster.ray.origin;
        
        if(!this.rocketObj) return;
        if(intersects.length <= 0){
          return;
        }
        // const intersectedObj = intersects[0];

      },
      animateCamera(){
        this.camera.position.lerp(this.targetCameraPosition, 0.01);
      },
      updateRocketPointer(nextPointer){
        this.pointer.x = nextPointer.h;
        this.pointer.y = nextPointer.v * -1;
      },
      rotateEduLetter(nextRotation) {
        const {h, v} = nextRotation;
        const multiplier = this.mouseSensitivity;
        if(!this.eduLetterObj) return;
        this.eduLetterObj.rotation.x = v * multiplier;
        this.eduLetterObj.rotation.y = h * multiplier;
      },
      listen() {
        this.onResize();
        this.onPointerMove();
        this.onClick();
      },
      normalizeMousePosition(e){
        const h = (e.clientX / window.innerWidth) * 2 - 1;
        const v = (e.clientY / window.innerHeight) * 2 - 1;
        return {h, v};
      },
      onResize(){
        window.addEventListener('resize', () => {
          this.setRenderSize();
        })
      },
      onPointerMove() {
        document.addEventListener( 'pointermove', (e) => {
          // calculate pointer position in normalized device coordinates
          // (-1 to +1) for both components
          const normalizedMousePosition = this.normalizeMousePosition(e);
          this.updateRocketPointer(normalizedMousePosition);
          this.rotateEduLetter(normalizedMousePosition);
        });
      },
      onClick() {
        document.addEventListener('click', (e) => {
          // calculate pointer position in normalized device coordinates
          // (-1 to +1) for both components
          const normalizedMousePosition = this.normalizeMousePosition(e);
          this.updateRocketPointer(normalizedMousePosition);
        });
      }
    }
  }
  </script>
  
  <!-- Add "scoped" attribute to limit CSS to this component only -->
  <style scoped>

  h3 {
    margin: 40px 0 0;
  }
  
  ul {
    list-style-type: none;
    padding: 0;
  }
  
  li {
    display: inline-block;
    margin: 0 10px;
  }
  
  a {
    color: #42b983;
  }
  
  .canvas {
    background-image: url('../assets/images/bg.png');
    background-repeat: no-repeat;
    background-size: cover;
    /* background-color: #281313; */
    /* background-color: #2c1f1f; */
    /* background-color: #4f3636; */
    background-color: #ffbb86;
    background-blend-mode: multiply;
    background-position: center;
    overflow: hidden;
    height: 100%;
  }

  </style>
  