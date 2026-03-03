/* ============================================================
   Holi – Festival of Colors  (p5.js)
   ----------------------------------------------------------
   • Click / drag   → shoot a stream of colored powder
   • Press any key   → radial color burst from center
   • Automatic gulal clouds float up from the bottom
   ============================================================ */

// ---------- palette: traditional Holi gulal colors ----------
const HOLI_COLORS = [
  [255, 50, 80],   // red / kumkum
  [255, 105, 30],  // orange
  [255, 200, 0],   // yellow / haldi
  [0, 200, 80],    // green
  [30, 160, 255],  // blue
  [180, 60, 255],  // purple
  [255, 80, 200],  // magenta / pink
  [0, 220, 200],   // teal
];

let particles = [];
let splashes  = [];          // permanent color stains on the ground
let gulalTimer = 0;

// -------------------- setup --------------------------------
function setup() {
  createCanvas(windowWidth, windowHeight);
  background(20, 18, 30);
  colorMode(RGB, 255, 255, 255, 255);
  noStroke();
}

// -------------------- draw ---------------------------------
function draw() {
  // semi-transparent overlay to let trails linger
  background(20, 18, 30, 18);

  // draw permanent splashes first
  for (let s of splashes) {
    fill(s.r, s.g, s.b, s.a);
    ellipse(s.x, s.y, s.size);
  }

  // auto-gulal clouds from the bottom
  gulalTimer++;
  if (gulalTimer % 6 === 0) {
    spawnGulalCloud(random(width), height + 10, 8);
  }

  // update & draw particles
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.update();
    p.display();
    if (p.isDead()) {
      // leave a faint splash
      if (random() < 0.5) {
        splashes.push({
          x: p.pos.x, y: p.pos.y,
          r: p.col[0], g: p.col[1], b: p.col[2],
          a: random(15, 40),
          size: random(p.radius * 0.5, p.radius * 1.5),
        });
      }
      particles.splice(i, 1);
    }
  }

  // cap arrays to keep performance steady
  if (particles.length > 4000) particles.splice(0, particles.length - 4000);
  if (splashes.length  > 6000) splashes.splice(0, splashes.length - 6000);
}

// -------------------- interactions -------------------------

function mouseDragged() {
  shootColor(mouseX, mouseY, 12);
}

function mousePressed() {
  shootColor(mouseX, mouseY, 30);
}

function keyPressed() {
  radialBurst(width / 2, height / 2, 200);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// -------------------- particle helpers ---------------------

function shootColor(x, y, count) {
  let col = random(HOLI_COLORS);
  for (let i = 0; i < count; i++) {
    let angle = random(TWO_PI);
    let speed = random(1, 6);
    let vel = p5.Vector.fromAngle(angle).mult(speed);
    particles.push(new Particle(x, y, vel, col));
  }
}

function radialBurst(cx, cy, count) {
  for (let i = 0; i < count; i++) {
    let col   = random(HOLI_COLORS);
    let angle = random(TWO_PI);
    let speed = random(3, 12);
    let vel   = p5.Vector.fromAngle(angle).mult(speed);
    particles.push(new Particle(cx, cy, vel, col, random(6, 18)));
  }
}

function spawnGulalCloud(x, y, count) {
  let col = random(HOLI_COLORS);
  for (let i = 0; i < count; i++) {
    let vel = createVector(random(-1, 1), random(-2.5, -0.5));
    particles.push(new Particle(x + random(-40, 40), y, vel, col, random(8, 22), random(120, 220)));
  }
}

// ==================== Particle class =======================
class Particle {
  constructor(x, y, vel, col, radius, life) {
    this.pos    = createVector(x, y);
    this.vel    = vel.copy();
    this.acc    = createVector(0, 0);
    this.col    = col;
    this.radius = radius || random(4, 14);
    this.life   = life   || random(80, 200);
    this.maxLife = this.life;
    this.drag   = random(0.96, 0.99);
    this.wobble = random(1000);
  }

  update() {
    // slight gravity
    this.acc.y += 0.03;
    // horizontal wobble (wind)
    this.acc.x += sin(frameCount * 0.05 + this.wobble) * 0.02;

    this.vel.add(this.acc);
    this.vel.mult(this.drag);
    this.pos.add(this.vel);
    this.acc.set(0, 0);
    this.life--;
  }

  display() {
    let alpha = map(this.life, 0, this.maxLife, 0, 220);
    let r = this.radius * map(this.life, 0, this.maxLife, 0.3, 1);

    // soft glow layer
    fill(this.col[0], this.col[1], this.col[2], alpha * 0.25);
    ellipse(this.pos.x, this.pos.y, r * 2.8);

    // core
    fill(this.col[0], this.col[1], this.col[2], alpha);
    ellipse(this.pos.x, this.pos.y, r);
  }

  isDead() {
    return this.life <= 0;
  }
}
