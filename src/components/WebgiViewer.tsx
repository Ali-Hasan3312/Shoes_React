import React, { useEffect, useRef } from 'react'
import {
    ViewerApp,
    AssetManagerPlugin,
    GBufferPlugin,
    ProgressivePlugin,
    addBasePlugins,
    TonemapPlugin,
    ISceneObject,
    SSRPlugin,
    SSAOPlugin,
    mobileAndTabletCheck,
    DiamondPlugin,
    BloomPlugin,
    Vector3, GammaCorrectionPlugin, MeshBasicMaterial2, Color, AssetImporter, IAsset, IModel, Object3D
  } from "webgi";
  import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
const WebgiViewer = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const diamondMaterialsRef = useRef<MeshBasicMaterial2[]>([]);
    const metalMaterialsRef = useRef<MeshBasicMaterial2[]>([]);
    const currentModelRef = useRef<any[] | null>(null);
    const viewerRef = useRef<ViewerApp | null>(null);
  
    useEffect(() => {
      const setupViewer = async () => {
        if (!canvasRef.current) return;
  
        const viewer = new ViewerApp({
          canvas: canvasRef.current,
        });
        viewerRef.current = viewer;
  
        const isMobile = mobileAndTabletCheck();
        const manager = await viewer.addPlugin(AssetManagerPlugin);
        const camera = viewer.scene.activeCamera;
        const position = camera.position;
        const target = camera.target;
  
        await addBasePlugins(viewer);
        viewer.renderer.refreshPipeline();
  
        await manager.addFromPath('./assets/ss-011.vjson');
  
        const loadModel = async (path: string, modelId: string) => {
          unloadModel();
  
          try {
            const assets = await manager.addFromPath(path);
            if (Array.isArray(assets) && assets.length > 0) {
              currentModelRef.current = assets;
              assets.forEach((asset: any) => {
                if ('modelObject' in asset && asset.modelObject instanceof Object3D) {
                  viewer.scene.addModel(asset);
                }
              });
  
              updateMaterialReferences();
              updateBottomBarContent(modelId);
            } else {
              console.error('Invalid asset type or asset could not be added:', assets);
            }
          } catch (error) {
            console.error('Error loading model:', error);
          }
        };
  
        const unloadModel = () => {
          if (currentModelRef.current) {
            viewer.scene.removeSceneModels();
            currentModelRef.current = null;
          }
        };
  
        const updateBottomBarContent = (modelId: string) => {
          // Add logic to update the bottom bar based on the model ID
          console.log(`Updating bottom bar for model: ${modelId}`);
          // You can update this method based on the initial code logic
        };
  
        const updateMaterialReferences = () => {
          diamondMaterialsRef.current = [];
          metalMaterialsRef.current = [];
  
          currentModelRef.current?.forEach((asset: any) => {
            if ('modelObject' in asset && asset.modelObject instanceof Object3D) {
              asset.modelObject.traverse((object: Object3D) => {
                if ((object as any).material) {
                  const material = (object as any).material;
                  if (material.name.toLowerCase().includes('diamond')) {
                    diamondMaterialsRef.current.push(material);
                  } else if (material.name.toLowerCase().includes('gold')) {
                    metalMaterialsRef.current.push(material);
                  }
                }
              });
            }
          });
  
          viewer.scene.setDirty();
        };
  
        const changeDiamondColor = (colorToBeChanged: Color) => {
          diamondMaterialsRef.current.forEach((material) => {
            if (material) {
              material.color = colorToBeChanged;
            }
          });
          viewer.scene.setDirty();
        };
  
        const changeMetalColor = (colorToBeChanged: Color) => {
          metalMaterialsRef.current.forEach((material) => {
            if (material) {
              material.color = colorToBeChanged;
            }
          });
          viewer.scene.setDirty();
        };
  
        // Example of loading a model initially
        await loadModel('./assets/ss-011-red.glb', 'model1');
  
        viewer.renderer.refreshPipeline();
  
        gsap.to(position, {
          x: 0.06,
          y: 3.17,
          z: 9.48,
          duration: 2,
          ease: 'power3.inOut',
          onUpdate: () => viewer.setDirty(),
        });
        gsap.to(target, {
          x: 0,
          y: 0.000001,
          z: 0.12,
          duration: 2,
          ease: 'power3.inOut',
          onUpdate: () => viewer.setDirty(),
          onComplete: () => {
            viewer.scene.activeCamera.setCameraOptions({ controlsEnabled: true });
          },
        });
      };
  
      setupViewer();
  
      // Cleanup function
      return () => {
        if (canvasRef.current) {
          canvasRef.current = null;
        }
      };
    }, []);
  return (
    <div id="webgi-canvas-container" style={{ width: '100%', height: '100%' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
      <div className="bottom-bar">
        <div className="logo-icons">
          <img src="./assets/3d_logo.png" alt="Logo" className="logo" />
          <span className="icons">
            <i id="model1" className="fas fa-ring" onClick={() => viewerRef.current?.scene.removeSceneModels()}></i>
            <i id="model2" className="fas fa-mobile-alt" onClick={() => viewerRef.current?.scene.removeSceneModels()}></i>
            <i id="model3" className="fas fa-cube" onClick={() => viewerRef.current?.scene.removeSceneModels()}></i>
          </span>
        </div>
        <div className="nav-links">
          <a href="#">Diamond</a>
          <a href="#">Metal</a>
          <a href="src/jewelry.html" className="contact-button">
            Contact Us
          </a>
        </div>
      </div>

      <div id="diamond-toggle-bar" className="diamond-toggle-bar">
        <div className="diamond-items">
          <img src="./assets/d1-removebg-preview.png" alt="Diamond 1" className="diamond-item" />
          <img src="./assets/dia2-removebg-preview.png" alt="Diamond 2" className="diamond-item" />
          <img src="./assets/dia3-removebg-preview.png" alt="Diamond 3" className="diamond-item" />
        </div>
        <button id="close-toggle-bar" className="close-toggle-bar">
          ✕
        </button>
      </div>

      <div id="metal-toggle-bar" className="metal-toggle-bar">
        <div className="metal-items">
          <img src="./assets/br1-removebg-preview.png" alt="Metal 1" className="metal-item" />
          <img src="./assets/br2-removebg-preview.png" alt="Metal 2" className="metal-item" />
        </div>
        <button id="close-toggle-bar-metal" className="close-toggle-bar">
          ✕
        </button>
      </div>
    </div>
  )
}

export default WebgiViewer