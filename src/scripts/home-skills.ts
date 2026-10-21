import { homeSkills } from '../data/home-skills';

const section = document.querySelector<HTMLElement>('[data-skills]');
if (section) {
  const stage = section.querySelector<HTMLElement>('[data-skills-stage]')!;
  stage.dataset.loading='true';
  const buttons = [...stage.querySelectorAll<HTMLButtonElement>('[data-skill]')];
  const sculptureButton = stage.querySelector<HTMLButtonElement>('[data-sculpture]')!;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let selected = 0;
  let activate: ((index: number) => void) | undefined;
  let disposeScene: (() => void) | undefined;
  let disposed = false;
  const select = (index: number) => {
    selected = index;
    buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
    activate?.(index);
  };
  buttons.forEach((button, index) => {
    button.addEventListener('click', () => select(index));
    button.addEventListener('keydown', event => {
      if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 :
        (index + (['ArrowLeft','ArrowUp'].includes(event.key) ? -1 : 1) + buttons.length) % buttons.length;
      buttons[next].focus(); select(next);
    });
  });

  const initialize = async () => {
    const [THREE, { SVGLoader }, { RoomEnvironment }] = await Promise.all([
      import('three'), import('three/addons/loaders/SVGLoader.js'), import('three/addons/environments/RoomEnvironment.js'),
    ]);
    if (disposed) return;
    const renderer = new THREE.WebGLRenderer({ alpha:true, antialias:true, powerPreference:'low-power' });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = .95;
    renderer.shadowMap.enabled=true;
    renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.setAttribute('aria-hidden','true');
    stage.prepend(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30,1,.1,50);
    camera.position.set(0,0,18);
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    // Broad studio panels give the silver bands continuous light/dark reflections.
    const panelGeometry=new THREE.PlaneGeometry(1,1);
    const panel=(x:number,y:number,z:number,w:number,h:number,intensity:number)=>{
      const surface=new THREE.MeshBasicMaterial({color:new THREE.Color().setScalar(intensity),side:THREE.DoubleSide});
      const lightPanel=new THREE.Mesh(panelGeometry,surface);
      lightPanel.position.set(x,y,z); lightPanel.scale.set(w,h,1); lightPanel.lookAt(0,0,0);
      room.add(lightPanel);
    };
    panel(0,8,-5,7,3,5);
    panel(7,4,-1,3,8,4);
    panel(-6,5,4,2,7,3);
    panel(0,0,6,8,2,.08);
    const environment = pmrem.fromScene(room,.1);
    room.dispose(); pmrem.dispose();
    scene.environment = environment.texture;
    scene.environmentIntensity = .72;
    scene.add(new THREE.AmbientLight(0xffffff,.55));
    const key = new THREE.DirectionalLight(0xfff5e8,1.8);
    key.position.set(-3,6,10); scene.add(key);
    key.castShadow=true;
    key.shadow.mapSize.set(1024,1024);
    key.shadow.camera.left=-3; key.shadow.camera.right=3;
    key.shadow.camera.top=3; key.shadow.camera.bottom=-3;
    key.shadow.camera.near=.1; key.shadow.camera.far=25;
    key.shadow.normalBias=.015; key.shadow.bias=-.0001;
    const fill = new THREE.DirectionalLight(0xe9efff,.65);
    fill.position.set(5,-1,3); scene.add(fill);
    const group = new THREE.Group(); scene.add(group);
    const geometries: InstanceType<typeof THREE.BufferGeometry>[] = [];
    const materials: InstanceType<typeof THREE.Material>[] = [];
    const material = (color: string | InstanceType<typeof THREE.Color>, metalness=.12, roughness=.32) => {
      const result = new THREE.MeshPhysicalMaterial({color,metalness,roughness,specularIntensity:.35});
      materials.push(result); return result;
    };
    const mesh = (geometry: InstanceType<typeof THREE.BufferGeometry>, surface: InstanceType<typeof THREE.Material> | InstanceType<typeof THREE.Material>[]) => {
      geometries.push(geometry); return new THREE.Mesh(geometry,surface);
    };
    const loader = new SVGLoader();
    const makeLogo = (svg: string, id: string) => {
      const logo = new THREE.Group();
      // Preserve independent silhouettes: SVG paths become bevelled meshes, not plane textures.
      const xml = new DOMParser().parseFromString(svg,'image/svg+xml');
      // SVGLoader cannot render paint-server gradients. Use the source's first stop.
      xml.querySelectorAll('[fill^="url("]').forEach(element => {
        const gradientId = element.getAttribute('fill')?.match(/#([^)]*)/)?.[1];
        const stop = gradientId ? xml.getElementById(gradientId)?.querySelector('stop') : null;
        element.setAttribute('fill', stop?.getAttribute('stop-color') || '#ffffff');
      });
      xml.querySelectorAll('[fill="currentColor"]').forEach(element => element.setAttribute('fill','#252829'));
      if (id === 'python') {
        const paths = xml.querySelectorAll('path');
        paths[0].setAttribute('fill','#3776ab'); paths[1].setAttribute('fill','#ffd343');
        paths[2]?.remove(); // taste-skill-ignore: remove the SVG's baked shadow; lighting comes from the 3D scene.
      }
      const unit = Number(xml.documentElement.getAttribute('viewBox')?.split(/\s+/)[2]) || 128;
      const data = loader.parse(new XMLSerializer().serializeToString(xml));
      data.paths.forEach((path,index) => {
        const style = path.userData?.style;
        if (style?.fill === 'none' || style?.opacity === 0) return;
        const colour = path.color.clone();
        const face = material(colour,.1,.27);
        const edge = material(colour.clone().multiplyScalar(.7),.18,.32);
        path.toShapes().forEach(shape => {
          const geometry = new THREE.ExtrudeGeometry(shape,{
            depth:unit*.105, bevelEnabled:true, bevelThickness:unit*.01,
            bevelSize:unit*.006, bevelSegments:3, steps:1, curveSegments:16,
          });
          const part = mesh(geometry,[face,edge]);
          part.position.z=index*unit*.002;
          logo.add(part);
        });
      });
      const box = new THREE.Box3().setFromObject(logo);
      const size = box.getSize(new THREE.Vector3()), center = box.getCenter(new THREE.Vector3());
      logo.children.forEach(part=>part.position.sub(center));
      const scale = 1/Math.max(size.x,size.y);
      logo.scale.set(scale,-scale,scale);
      const wrapper = new THREE.Group(); wrapper.add(logo);
      return wrapper;
    };
    const makeDatabase = () => {
      const model = new THREE.Group();
      const sides=material('#b55528',.35,.3), caps=material('#eea459',.25,.28);
      for(let i=0;i<3;i++) {
        const drum=mesh(new THREE.CylinderGeometry(.46,.46,.23,48),[sides,caps,sides]);
        drum.position.y=(i-1)*.31; model.add(drum);
      }
      return model;
    };
    // Solid ivory core, two bevelled metal bands, and a threaded vermilion bead.
    const sculpture = new THREE.Group();
    const pearl = material('#e2d4bd',.02,.42);
    const steel = material('#bdb9b1',.96,.18);
    steel.envMapIntensity=1.25;
    const vermilion = material('#d9472f',.18,.26);
    vermilion.clearcoat=.35;
    vermilion.clearcoatRoughness=.22;
    vermilion.specularIntensity=.6;
    sculpture.add(mesh(new THREE.SphereGeometry(.87,64,40),pearl));
    const makeOrbit = (radius:number) => {
      // Revolve one rounded cross-section: continuous highlights, no extrusion seam.
      const outer=radius+.016, inner=radius-.156, halfDepth=.0485, fillet=.016;
      const profile=new THREE.Path();
      profile.moveTo(outer,0);
      profile.lineTo(outer,halfDepth-fillet);
      profile.quadraticCurveTo(outer,halfDepth,outer-fillet,halfDepth);
      profile.lineTo(inner+fillet,halfDepth);
      profile.quadraticCurveTo(inner,halfDepth,inner,halfDepth-fillet);
      profile.lineTo(inner,-halfDepth+fillet);
      profile.quadraticCurveTo(inner,-halfDepth,inner+fillet,-halfDepth);
      profile.lineTo(outer-fillet,-halfDepth);
      profile.quadraticCurveTo(outer,-halfDepth,outer,-halfDepth+fillet);
      profile.lineTo(outer,0);
      const band = mesh(new THREE.LatheGeometry(profile.getPoints(8),160),steel);
      band.rotation.x=Math.PI/2;
      const orbit = new THREE.Group(); orbit.add(band); sculpture.add(orbit);
      return orbit;
    };
    // The inner band clears the bead's entire swept volume, including both crossings.
    const orbitA=makeOrbit(1.52), orbitB=makeOrbit(1.18);
    // Revolve a spherical shell with a real through-hole around its local Y axis.
    // The hole clears the band and points along its tangent, like a bead on a wire.
    const beadRadius=.235, boreRadius=.125, lipRadius=.145;
    const boreAngle=Math.asin(lipRadius/beadRadius);
    const lipY=Math.sqrt(beadRadius*beadRadius-lipRadius*lipRadius);
    const beadProfile=new THREE.Path();
    beadProfile.moveTo(boreRadius,0);
    beadProfile.lineTo(boreRadius,-lipY+.018);
    beadProfile.bezierCurveTo(boreRadius,-lipY-.004,lipRadius-.012,-lipY-.009,lipRadius,-lipY);
    for(let i=1;i<=64;i++) {
      const angle=Math.PI-boreAngle-(Math.PI-2*boreAngle)*i/64;
      beadProfile.lineTo(beadRadius*Math.sin(angle),beadRadius*Math.cos(angle));
    }
    beadProfile.bezierCurveTo(lipRadius-.012,lipY+.009,boreRadius,lipY+.004,boreRadius,lipY-.018);
    beadProfile.lineTo(boreRadius,0);
    const orbitBead = mesh(new THREE.LatheGeometry(beadProfile.getPoints(8),64),vermilion);
    const beadAxis=new THREE.Vector3(0,1,0), beadTangent=new THREE.Vector3();
    orbitA.add(orbitBead);
    sculpture.traverse(object=>{
      if(object instanceof THREE.Mesh) {object.castShadow=true;object.receiveShadow=true;}
    });
    sculpture.position.set(.05,0,0);group.add(sculpture);
    type Token = { object:InstanceType<typeof THREE.Group>; kick:number; velocity:number };
    const tokens:Token[]=[];
    let frame=0, visible=false, elapsed=0, last=performance.now(), enter=0, entered=false, overscan=1.5;
    // Match the reference's parent-group scale: 0.3s delay, 1s elastic.out(1, 0.3).
    const entranceScale=(time:number)=>{
      const progress=Math.max(0,Math.min(1,time-.3));
      if(progress===0||progress===1)return progress;
      return 1+Math.pow(2,-10*progress)*Math.sin((progress-.075)*Math.PI*2/.3);
    };
    let aimX=0,aimY=0,tiltX=0,tiltY=0,sculptureKick=0,sculptureVelocity=0;
    const projected=new THREE.Vector3();
    const draw=(now:number)=>{
      frame=0;
      const dt=Math.min((now-last)/1000,.04);last=now;
      if(!reduced.matches) {
        elapsed+=dt;
        if(entered)enter=Math.min(1.3,enter+dt);
      } else enter=1.3;
      tiltX+=(aimX-tiltX)*.06;tiltY+=(aimY-tiltY)*.06;
      group.rotation.set(reduced.matches?0:tiltY,reduced.matches?0:tiltX,0);
      const entrance=entranceScale(enter);
      group.visible=entrance>0;
      group.scale.setScalar(Math.max(.0001,entrance));
      const entering=enter<1.3;
      if(overscan!==(entering?1.5:1))sizeCanvas();
      if(stage.dataset.entering!==String(entering))stage.dataset.entering=String(entering);
      tokens.forEach((token,index)=>{
        const s=homeSkills[index], phase=elapsed*.65+index*1.7;
        token.velocity+=(-30*token.kick-6*token.velocity)*dt;
        token.kick+=token.velocity*dt;
        token.object.position.set(s.x,s.y+(reduced.matches?0:Math.sin(phase)*.12),s.z);
        token.object.rotation.set(s.rx+(reduced.matches?0:Math.cos(phase*.8)*.1),s.ry+(reduced.matches?0:Math.sin(phase)*.16+token.kick),s.turn+(reduced.matches?0:Math.sin(phase*.7)*.07+token.kick*.2));
        token.object.scale.setScalar(s.size*(selected===index?1.04:1));
      });
      sculptureVelocity+=(-24*sculptureKick-5*sculptureVelocity)*dt;sculptureKick+=sculptureVelocity*dt;
      sculpture.rotation.set(.08+(reduced.matches?0:Math.sin(elapsed*.2)*.07+sculptureKick*.35),-.12+(reduced.matches?0:Math.sin(elapsed*.15)*.1+sculptureKick),.02);
      orbitA.rotation.set(-1.02,-.12,.38+(reduced.matches?0:Math.sin(elapsed*.16)*.07));
      orbitB.rotation.set(.12,.95,.4+(reduced.matches?0:Math.sin(elapsed*.12)*.07));
      // Stay on the band centreline, keeping the bore tangent throughout the orbit.
      const beadAngle=-.35+(reduced.matches?0:elapsed*Math.PI*2/18);
      orbitBead.position.set(Math.cos(beadAngle)*1.45,Math.sin(beadAngle)*1.45,0);
      beadTangent.set(-Math.sin(beadAngle),Math.cos(beadAngle),0);
      orbitBead.quaternion.setFromUnitVectors(beadAxis,beadTangent);
      sculpture.scale.setScalar(1.55);
      group.updateMatrixWorld(true);camera.updateMatrixWorld();
      const width=stage.clientWidth,height=stage.clientHeight;
      const positionButton=(object:InstanceType<typeof THREE.Group>,button:HTMLButtonElement,size:number)=>{
        object.getWorldPosition(projected);const depth=18-projected.z;projected.project(camera);
        button.style.left=`${((projected.x*.5+.5)*overscan-(overscan-1)/2)*width}px`;button.style.top=`${((projected.y*-.5+.5)*overscan-(overscan-1)/2)*height}px`;
        button.style.visibility=group.visible?'':'hidden';
        const pixels=height/(2*Math.tan(Math.PI/12)*depth)*size*entrance;
        button.style.width=`${Math.max(44,pixels)}px`;button.style.height=`${Math.max(44,pixels)}px`;
      };
      tokens.forEach((token,index)=>positionButton(token.object,buttons[index],homeSkills[index].size*1.12));
      positionButton(sculpture,sculptureButton,4.4);
      renderer.render(scene,camera);
      if(visible&&!document.hidden&&!reduced.matches) frame=requestAnimationFrame(draw);
    };
    const start=()=>{if(!frame&&visible&&!document.hidden&&!disposed){last=performance.now();frame=requestAnimationFrame(draw);}};
    const sizeCanvas=()=>{
      const width=stage.clientWidth,height=Math.max(1,stage.clientHeight);
      overscan=enter<1.3?1.5:1;
      // Extra drawing space for the elastic overshoot, with unchanged final framing.
      camera.setViewOffset(width,height,-width*(overscan-1)/2,-height*(overscan-1)/2,width*overscan,height*overscan);
      renderer.setSize(width*overscan,height*overscan,false);
      renderer.domElement.style.inset=`${-(overscan-1)*50}%`;
      renderer.domElement.style.width=`${overscan*100}%`;
      renderer.domElement.style.height=`${overscan*100}%`;
    };
    const resize=()=>{sizeCanvas();start();};
    const move=(event:PointerEvent)=>{const box=stage.getBoundingClientRect();aimX=((event.clientX-box.left)/box.width-.5)*.18;aimY=((event.clientY-box.top)/box.height-.5)*.12;};
    const leave=()=>{aimX=0;aimY=0;};
    const onVisibility=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else start();};
    const onMotion=()=>{tokens.forEach(t=>{t.kick=0;t.velocity=0;});sculptureKick=0;sculptureVelocity=0;cancelAnimationFrame(frame);frame=0;start();};
    const pulse=()=>{if(!reduced.matches)sculptureVelocity+=12;start();};
    const observer=new IntersectionObserver(([entry])=>{
      visible=entry.isIntersecting;
      // Preload nearby, but play once only when enough of the model is actually on screen.
      if(entry.intersectionRatio>=.25)entered=true;
      if(visible)start();else{cancelAnimationFrame(frame);frame=0;}
    },{threshold:[0,.25]});
    const resizeObserver=new ResizeObserver(resize);
    let cleaned=false;
    disposeScene=()=>{
      if(cleaned)return;cleaned=true;activate=undefined;
      cancelAnimationFrame(frame);observer.disconnect();resizeObserver.disconnect();
      stage.removeEventListener('pointermove',move);stage.removeEventListener('pointerleave',leave);sculptureButton.removeEventListener('click',pulse);
      document.removeEventListener('visibilitychange',onVisibility);reduced.removeEventListener('change',onMotion);
      geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());environment.dispose();key.shadow.dispose();
      renderer.dispose();renderer.domElement.remove();delete stage.dataset.ready;delete stage.dataset.entering;delete stage.dataset.loading;
      [...buttons,sculptureButton].forEach(button=>button.style.removeProperty('visibility'));
    };
    try {
      const sources=await Promise.all(homeSkills.map(async skill=>{
        if(skill.id==='sql')return '';
        const response=await fetch(`/mori/skills/${skill.id}.svg`);
        if(!response.ok)throw new Error(`Logo unavailable: ${skill.id}`);
        return response.text();
      }));
      if(disposed){disposeScene();return;}
      homeSkills.forEach((skill,index)=>{
        const object=skill.id==='sql'?makeDatabase():makeLogo(sources[index],skill.id);
        group.add(object);tokens.push({object,kick:0,velocity:0});
      });
      activate=index=>{if(!reduced.matches)tokens[index].velocity+=13;start();};
      stage.addEventListener('pointermove',move);stage.addEventListener('pointerleave',leave);sculptureButton.addEventListener('click',pulse);
      document.addEventListener('visibilitychange',onVisibility);reduced.addEventListener('change',onMotion);
      stage.dataset.entering=String(!reduced.matches);
      observer.observe(stage);resizeObserver.observe(stage);stage.dataset.ready='true';delete stage.dataset.loading;resize();
    } catch(error){disposeScene();console.warn('Skills: using accessible static logos',error);}
  };
  const lazy=new IntersectionObserver(([entry])=>{
    if(!entry.isIntersecting)return;
    lazy.disconnect();
    void initialize().catch(error=>{
      delete stage.dataset.loading;
      console.warn('Skills: using accessible static logos',error);
    });
  },{rootMargin:'200px'});
  lazy.observe(stage);
  const cleanup=()=>{disposed=true;lazy.disconnect();disposeScene?.();};
  window.addEventListener('pagehide',event=>{if(!event.persisted)cleanup();},{once:true});
  document.addEventListener('astro:before-swap',cleanup,{once:true});
}
