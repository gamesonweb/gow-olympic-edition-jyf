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
        this.jumpSpeed = 0.5;
        this.gravity = -0.005;
        this.keyStatus = {
            x: false,
            Space: false,
            w: false,
            s: false,
            a: false,
            d: false,
            b: false,
            Shift: false
        };

        this.moving = false;
        this.jumping = false;

        this.jumpHeight = 2;
        this.jumpSpeed = 0.05;

        this.currentHeight = 0;

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
            // console.log("down" + key + "-");
            if (key == " ") {
                this.keyStatus.Space = true;
            }
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
            // console.log("up" + key);
            if (key == " ") {
                this.keyStatus.Space = false;
            }
            if (key !== "Shift") {
                key = key.toLowerCase();
            }
            if (key in this.keyStatus) {
                this.keyStatus[key] = false;
            }
            // console.log(this.keyStatus);
        }));



        this.scene.onBeforeRenderObservable.add(() => {

            if (this.keyStatus.w || this.keyStatus.s || this.keyStatus.a || this.keyStatus.d || this.keyStatus.b || this.keyStatus.Space) {
                let speed;
                let AnimationSpeed;


                if (this.keyStatus.Space) { // Si la touche d'espace est enfoncée
                    if (!this.jumping) { // Si le personnage n'est pas déjà en train de sauter
                        this.jumping = true; // Mettre à jour l'état de saut
                        this.jump();
                    }
                }

                if (this.keyStatus.w || this.keyStatus.a || this.keyStatus.d) {
                    speed = this.keyStatus.Shift ? this.playerRunSpeed : this.playerWalkSpeed;
                    AnimationSpeed = this.keyStatus.Shift ? this.runAnimationSpeed : this.walkAnimSpeed;
                    this.walkAnimation.speedRatio = AnimationSpeed;
                    this.walkAnimation.start(true, AnimationSpeed, this.walkAnimation.from, this.walkAnimation.to, false);
                    this.moving = true;
                }
                if (this.keyStatus.s && !this.keyStatus.w) {
                    speed = -this.playerSpeedBackwards;
                    this.walkBackAnimation.start(true, 1, this.walkBackAnimation.from, this.walkBackAnimation.to, false);
                    this.moving = true;
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
                if (this.moving) {
                    this.player.moveWithCollisions(this.player.forward.scaleInPlace(speed));
                }
            } else {
                if (this.moving) {
                    this.idleAnimeation.start(true, 1, this.idleAnimeation.from, this.idleAnimeation.tp, false);
                    this.sambaAnimation.stop();
                    this.walkAnimation.stop();
                    this.walkBackAnimation.stop();
                    this.moving = false;

                }
            }
        });
    }


    jump() {


        const jumpInterval = setInterval(() => {
            this.currentHeight += this.jumpSpeed; // Augmenter la hauteur actuelle du saut
            this.player.position.y = this.currentHeight; // Mettre à jour la position en fonction de la hauteur du saut

            if (this.currentHeight >= this.jumpHeight) { // Si le personnage a atteint la hauteur maximale du saut
                clearInterval(jumpInterval); // Arrêter l'interval de saut
                setTimeout(() => {
                    this.land();
                }, 100);
                // Appeler la fonction pour gérer l'atterrissage
            }
            // console.log(this.currentHeight);
        }, 10); // Rafraîchir toutes les 10 ms
    }

    land() {
        const groundHeight = 0; // Hauteur du sol

        const jumpInterval = setInterval(() => {
            this.currentHeight -= this.jumpSpeed; // Augmenter la hauteur actuelle du saut
            this.player.position.y = this.currentHeight; // Mettre à jour la position en fonction de la hauteur du saut

            if (this.currentHeight <= groundHeight) { // Si le personnage a atteint la hauteur maximale du saut
                clearInterval(jumpInterval); // Arrêter l'interval de saut
                this.jumping = false;
            }
            // console.log(this.currentHeight);
        }, 10); // Rafraîchir toutes les 10 ms

        /*
        

        // Réinitialiser la position du personnage au niveau du sol
        this.player.position.y = groundHeight;

        // Mettre à jour l'état de saut
        this.jumping = false;
        */
    }
}

export default Personnage;
