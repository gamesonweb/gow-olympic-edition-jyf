import { ActionManager, ArcRotateCamera, Color3, Engine, ExecuteCodeAction, FreeCamera, HemisphericLight, MeshBuilder, Scene, SceneLoader, StandardMaterial, Vector3 }
    from "@babylonjs/core";
import { Inspector } from '@babylonjs/inspector';

export class Personnage {
    constructor(scene, camera, walkSpeed, runSpeed) {
        this.scene = scene;
        this.camera = camera;
        this.player = null;
        this.walkAnimation = null;
        this.walkBackAnimation = null;
        this.idleAnimeation = null;
        this.sambaAnimation = null;
        // Valeurs de reference
        // this.playerWalkSpeed = 0.03;
        // this.playerRunSpeed = 0.1;
        this.playerWalkSpeed = walkSpeed;
        this.playerRunSpeed = runSpeed;
        this.playerSpeedBackwards = 0.01;
        this.playerRotationSpeed = 0.01;
        this.runAnimationSpeed = 3;
        this.walkAnimSpeed = 1;
        this.keyStatus = {
            w: false,
            s: false,
            a: false,
            d: false,
            b: false,
            Shift: false
        };
        this.loadModel();
        this.setupActions();
    }

    async loadModel() {
        const model = await SceneLoader.ImportMeshAsync(null, "https://assets.babylonjs.com/meshes/", "HVGirl.glb", this.scene);
        this.player = model.meshes[0];
        this.player.scaling.setAll(0.1);
        this.camera.setTarget(this.player);
        this.walkAnimation = this.scene.getAnimationGroupByName("Walking");
        this.walkBackAnimation = this.scene.getAnimationGroupByName("WalkingBack");
        this.idleAnimeation = this.scene.getAnimationGroupByName("Idle");
        this.sambaAnimation = this.scene.getAnimationGroupByName("Samba");
    }

    setupActions() {
        this.scene.actionManager = new ActionManager(this.scene);

        this.scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, (event) => {
            let key = event.sourceEvent.key;
            if (key !== "Shift") {
                key = key.toLowerCase();
            }
            if (key in this.keyStatus) {
                this.keyStatus[key] = true;
            }
            console.log(this.keyStatus);
        }));

        this.scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, (event) => {
            let key = event.sourceEvent.key;
            if (key !== "Shift") {
                key = key.toLowerCase();
            }
            if (key in this.keyStatus) {
                this.keyStatus[key] = false;
            }
            console.log(this.keyStatus);
        }));

        let moving = false;
        this.scene.onBeforeRenderObservable.add(() => {

            if (this.keyStatus.w || this.keyStatus.s || this.keyStatus.a || this.keyStatus.d || this.keyStatus.b) {
                let speed;
                let AnimationSpeed;

                if (this.keyStatus.w || this.keyStatus.a || this.keyStatus.d) {
                    speed = this.keyStatus.Shift ? this.playerRunSpeed : this.playerWalkSpeed;
                    AnimationSpeed = this.keyStatus.Shift ? this.runAnimationSpeed : this.walkAnimSpeed;
                    this.walkAnimation.speedRatio = AnimationSpeed;
                    this.walkAnimation.start(true, AnimationSpeed, this.walkAnimation.from, this.walkAnimation.to, false);
                    moving = true;
                }
                if (this.keyStatus.s && !this.keyStatus.w) {
                    speed = -this.playerSpeedBackwards;
                    this.walkBackAnimation.start(true, 1, this.walkBackAnimation.from, this.walkBackAnimation.to, false);
                    moving = true;
                }
                if (this.keyStatus.b) {
                    this.sambaAnimation.start(true, 1, this.sambaAnimation.from, this.sambaAnimation.to, false);
                }
                if (this.keyStatus.a) {
                    this.player.rotate(Vector3.Up(), -this.playerRotationSpeed);
                }
                if (this.keyStatus.d) {
                    this.player.rotate(Vector3.Up(), this.playerRotationSpeed);
                }
                if (moving) {
                    this.player.moveWithCollisions(this.player.forward.scaleInPlace(speed));
                }
            } else {
                if (moving) {
                    this.idleAnimeation.start(true, 1, this.idleAnimeation.from, this.idleAnimeation.tp, false);
                    this.sambaAnimation.stop();
                    this.walkAnimation.stop();
                    this.walkBackAnimation.stop();
                    moving = false;
                }
            }
        });
    }
}

export default Personnage;
