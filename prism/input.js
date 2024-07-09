class ControllerInputManager {
    constructor() {
        this.sensitivity = 1.4;
        this.deadzone = 0.27;
        this.stopThreshold = 0.075;
        this.maxThreshold = 0.95;
        this.smoothingFactor = 0.2;
        this.currentX = 0;
        this.currentY = 0;
        this.shootX = 0;
        this.shootY = 0;
    }

    applyDeadzone(value) {
        const percentage = (Math.abs(value) - this.deadzone) / (this.maxThreshold - this.deadzone);
        if (percentage < 0) return 0;
        return percentage > 1 ? Math.sign(value) : Math.sign(value) * percentage;
    }

    smoothInput(rawX, rawY) {
        const processedX = this.applyDeadzone(rawX) * this.sensitivity;
        const processedY = this.applyDeadzone(rawY) * this.sensitivity;

        this.currentX = this.currentX * (1 - this.smoothingFactor) + processedX * this.smoothingFactor;
        this.currentY = this.currentY * (1 - this.smoothingFactor) + processedY * this.smoothingFactor;

        if (Math.abs(this.currentX) < this.stopThreshold) this.currentX = 0;
        if (Math.abs(this.currentY) < this.stopThreshold) this.currentY = 0;

        return { x: this.currentX, y: this.currentY };
    }

    getMovement(gamepad) {
        if (!gamepad) return { x: 0, y: 0 };
        return this.smoothInput(gamepad.axes[0], -gamepad.axes[1]); // Negate the Y axis
    }
    
    getShootingDirection(gamepad) {
        if (!gamepad) return { x: 0, y: 0 };
        this.shootX = this.applyDeadzone(gamepad.axes[2]);
        this.shootY = -this.applyDeadzone(gamepad.axes[3]); // Negate the Y axis
        return { x: this.shootX, y: this.shootY };
    }
}

class InputManager {
    constructor(camera) {
        this.keys = {};
        this.gamepad = null;
        this.controllerManager = new ControllerInputManager();
        this.camera = camera;
        this.mouse = new THREE.Vector2();
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.keys[e.code] = true);
        document.addEventListener('keyup', (e) => this.keys[e.code] = false);
        window.addEventListener("gamepadconnected", (e) => {
            console.log("Gamepad connected:", e.gamepad);
            this.gamepad = e.gamepad;
        });
        window.addEventListener("gamepaddisconnected", (e) => {
            console.log("Gamepad disconnected:", e.gamepad);
            this.gamepad = null;
        });
        document.addEventListener('mousemove', (e) => this.onMouseMove(e), false);
    }

    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    update() {
        if (this.gamepad) {
            const gamepads = navigator.getGamepads();
            this.gamepad = gamepads[this.gamepad.index];
        }
    }

    getMovement() {
        let dx = 0;
        let dy = 0;
    
        if (this.gamepad) {
            const movement = this.controllerManager.getMovement(this.gamepad);
            dx = movement.x;
            dy = movement.y;
        } else {
            if (this.keys['ArrowUp'] || this.keys['KeyW']) dy += 1; // Changed from -= to +=
            if (this.keys['ArrowDown'] || this.keys['KeyS']) dy -= 1; // Changed from += to -=
            if (this.keys['ArrowLeft'] || this.keys['KeyA']) dx -= 1;
            if (this.keys['ArrowRight'] || this.keys['KeyD']) dx += 1;
        }
    
        const magnitude = Math.sqrt(dx * dx + dy * dy);
        if (magnitude !== 0) {
            dx = dx / magnitude;
            dy = dy / magnitude;
        }
    
        return { x: dx, y: dy };
    }

    getShootingDirection() {
        if (this.gamepad) {
            return this.controllerManager.getShootingDirection(this.gamepad);
        } else {
            // For mouse, calculate direction based on mouse position
            const vector = new THREE.Vector3(this.mouse.x, this.mouse.y, 0.5);
            vector.unproject(this.camera);
            vector.sub(this.camera.position).normalize();
            return { x: vector.x, y: vector.y }; // No need to negate y here
        }
    }

    isFirePressed() {
        if (this.gamepad) {
            const shootingDir = this.controllerManager.getShootingDirection(this.gamepad);
            return Math.abs(shootingDir.x) > 0.1 || Math.abs(shootingDir.y) > 0.1;
        } else {
            return this.keys['Space'];
        }
    }
}