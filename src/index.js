import { ActionManager, ArcRotateCamera, Color3, Engine, ExecuteCodeAction, FreeCamera, HemisphericLight, MeshBuilder, Scene, SceneLoader, StandardMaterial, Vector3 }
    from "@babylonjs/core";
import { Inspector } from '@babylonjs/inspector';

let engine;
let canvas;

window.onload = () => {
    canvas = document.getElementById("renderCanvas");
    engine = new Engine(canvas, true);
    const scene = createScene();

    Inspector.Show(scene, {});

    engine.runRenderLoop(function () {
        scene.render();
    });

    window.addEventListener("resize", function () {
        engine.resize();
    });

};

var createScene = function () {
    /*
    // This creates a basic Babylon Scene object (non-mesh)
    var scene = new Scene(engine);

    // This creates and positions a free camera (non-mesh)
    var camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene);

    // This targets the camera to scene origin
    camera.setTarget(Vector3.Zero());

    // This attaches the camera to the canvas
    camera.attachControl(canvas, true);

    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    var light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

    // Default intensity is 1. Let's dim the light a small amount
    light.intensity = 0.7;

    // Our built-in 'sphere' shape.
    var sphere = MeshBuilder.CreateSphere("sphere", { diameter: 2, segments: 32 }, scene);
    var sphere2 = MeshBuilder.CreateSphere("sphere", { diameter: 1, segments: 32 }, scene);
    var material = new StandardMaterial(scene);
    material.alpha = 1;
    material.diffuseColor = new Color3(1.0, 0.2, 0.7);

    sphere.material = material

    // Move the sphere upward 1/2 its height
    sphere.position.y = 1;
    sphere2.position.y = 2.5;

    // Our built-in 'ground' shape.
    var ground = MeshBuilder.CreateGround("ground", { width: 6, height: 6 }, scene);

    */

    var scene = new Scene(engine);
    scene.createDefaultEnvironment({ createGround: false, createSkybox: false });

    const camera = new ArcRotateCamera("arcRotateCamera", 0, 1, 10, new Vector3(0, 0, 0), scene);
    camera.speed = 0.1;
    camera.attachControl(canvas, true);

    var light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

    let ground = MeshBuilder.CreateGround("ground", { width: 50, height: 50 }, scene);

    //vitesse du zoom molette
    camera.wheelPrecision = 10;

    const loadModel = async () => {
        const model = await SceneLoader.ImportMeshAsync(null, "https://assets.babylonjs.com/meshes/", "HVGirl.glb", scene);
        const player = model.meshes[0];

        //ajuster la taille du joueur
        player.scaling.setAll(0.1);


        camera.setTarget(player);


        const walkAnimation = scene.getAnimationGroupByName("Walking");
        const walkBackAnimation = scene.getAnimationGroupByName("WalkingBack");
        const idleAnimeation = scene.getAnimationGroupByName("Idle");
        const sambaAnimation = scene.getAnimationGroupByName("Samba");

        const playerWalkSpeed = 0.03;
        const playerRunSpeed = 0.1;
        const playerSpeedBackwards = 0.01;
        const playerRotationSpeed = 0.01;

        const runAnimationSpeed = 3;
        const walkAnimSpeed = 1;

        let speed;
        let AnimationSpeed;


        let keyStatus = {
            w: false,
            s: false,
            a: false,
            d: false,
            b: false,
            Shift: false
        };

        scene.actionManager = new ActionManager(scene);

        scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, (event) => {
            let key = event.sourceEvent.key;
            if (key !== "Shift") {
                key = key.toLowerCase();
            }
            if (key in keyStatus) {
                keyStatus[key] = true;
            }
            console.log(keyStatus);
        }));

        scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, (event) => {
            let key = event.sourceEvent.key;
            if (key !== "Shift") {
                key = key.toLowerCase();
            }
            if (key in keyStatus) {
                keyStatus[key] = false;
            }
            console.log(keyStatus);
        }));


        let moving = false;
        scene.onBeforeRenderObservable.add(() => {
            if (keyStatus.w || keyStatus.s || keyStatus.a || keyStatus.d || keyStatus.b) {
                moving = true;
                if (keyStatus.s && !keyStatus.w) {
                    speed = -playerSpeedBackwards;
                    walkBackAnimation.start(true, 1, walkBackAnimation.from, walkBackAnimation.to, false);
                }
                else if (keyStatus.w || keyStatus.a || keyStatus.d) {
                    speed = keyStatus.Shift ? playerRunSpeed : playerWalkSpeed;
                    AnimationSpeed = keyStatus.Shift ? runAnimationSpeed : walkAnimSpeed;
                    walkAnimation.speedRatio = AnimationSpeed;
                    walkAnimation.start(true, AnimationSpeed, walkAnimation.from, walkAnimation.to, false);
                }
                if (keyStatus.a) {
                    player.rotate(Vector3.Up(), -playerRotationSpeed);
                }
                if (keyStatus.d) {
                    player.rotate(Vector3.Up(), playerRotationSpeed);
                }

                if (keyStatus.b) {
                    sambaAnimation.start(true, 1, sambaAnimation.from, sambaAnimation.to, false);
                }

                player.moveWithCollisions(player.forward.scaleInPlace(speed));
            }
            else if (moving) {
                idleAnimeation.start(true, 1, idleAnimeation.from, idleAnimeation.tp, false);
                sambaAnimation.stop();
                walkAnimation.stop();
                walkBackAnimation.stop();
                moving = false;
            }



        });

    };



    loadModel();



    return scene;
};

