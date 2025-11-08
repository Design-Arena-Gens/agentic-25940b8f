"use client";

import { useEffect, useRef } from "react";

type Runner = {
  x: number;
  y: number;
  baseY: number;
  vx: number;
  wobble: number;
  pulse: number;
};

type Tear = {
  x: number;
  y: number;
  vy: number;
  alpha: number;
};

type Ember = {
  x: number;
  y: number;
  radius: number;
  speed: number;
  hue: number;
};

const HUMAN_COLORS = ["#f97366", "#fbbf24", "#fb7185"];

export default function AlienChaseCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    let width = canvas.clientWidth;
    let height = canvas.clientHeight;

    const setSize = () => {
      const dpr = window.devicePixelRatio || 1;
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    setSize();

    const alien: Runner = {
      x: width * 0.18,
      y: height * 0.6,
      baseY: height * 0.6,
      vx: 180,
      wobble: 0,
      pulse: 0
    };

    const humans: Runner[] = Array.from({ length: 3 }).map((_, index) => ({
      x: width * (0.05 - index * 0.08),
      y: height * 0.62,
      baseY: height * 0.62 + index * 12,
      vx: 140 + index * 18,
      wobble: Math.random() * Math.PI * 2,
      pulse: Math.random() * Math.PI * 2
    }));

    const tears: Tear[] = [];
    const embers: Ember[] = Array.from({ length: 80 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.8 + 0.4,
      speed: 10 + Math.random() * 20,
      hue: 180 + Math.random() * 60
    }));

    let tearTimer = 0;
    let lastTime = performance.now();

    const resetChase = () => {
      alien.x = width * 0.18;
      alien.baseY = height * (0.5 + Math.random() * 0.2);
      alien.vx = 170 + Math.random() * 40;
      humans.forEach((human, index) => {
        human.x = width * (0.05 - index * 0.08);
        human.baseY = alien.baseY + 15 + index * 10;
        human.vx = 150 + index * 15 + Math.random() * 25;
      });
    };

    const updateTears = (dt: number) => {
      tearTimer += dt;
      if (tearTimer > 140) {
        tearTimer = 0;
        tears.push({
          x: alien.x + 6,
          y: alien.y - 12,
          vy: 40 + Math.random() * 30,
          alpha: 1
        });
        tears.push({
          x: alien.x - 6,
          y: alien.y - 12,
          vy: 45 + Math.random() * 30,
          alpha: 1
        });
      }

      for (let i = tears.length - 1; i >= 0; i -= 1) {
        const tear = tears[i];
        tear.y += tear.vy * (dt / 1000);
        tear.alpha -= 0.9 * (dt / 1000);
        if (tear.alpha <= 0) {
          tears.splice(i, 1);
        }
      }
    };

    const updateEmbers = (dt: number) => {
      embers.forEach((ember) => {
        ember.y += ember.speed * (dt / 1000);
        ember.x += Math.sin(ember.y * 0.03) * 8 * (dt / 1000);

        if (ember.y > height + 10) {
          ember.y = -10;
          ember.x = Math.random() * width;
        }
      });
    };

    const ease = (current: number, target: number, speed: number) =>
      current + (target - current) * speed;

    const drawBackground = () => {
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, "#0f172a");
      gradient.addColorStop(0.4, "#1e1b4b");
      gradient.addColorStop(1, "#020617");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      embers.forEach((ember) => {
        ctx.beginPath();
        const alpha = 0.18 + Math.sin(ember.y * 0.02) * 0.12;
        ctx.fillStyle = `hsla(${ember.hue}, 70%, 65%, ${alpha})`;
        ctx.arc(ember.x, ember.y, ember.radius, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const drawAlien = () => {
      ctx.save();

      const bodyBob = Math.sin(alien.pulse) * 4;
      const headTilt = Math.sin(alien.pulse * 2) * 0.2;

      // body
      ctx.translate(alien.x, alien.y + bodyBob);
      ctx.beginPath();
      ctx.fillStyle = "#34d399";
      ctx.ellipse(0, 0, 28, 38, 0, 0, Math.PI * 2);
      ctx.fill();

      // head
      ctx.save();
      ctx.rotate(headTilt);
      ctx.translate(0, -42);
      ctx.beginPath();
      ctx.fillStyle = "#4ade80";
      ctx.ellipse(0, 0, 22, 26, 0, 0, Math.PI * 2);
      ctx.fill();

      // eyes
      ctx.beginPath();
      ctx.fillStyle = "#0f172a";
      ctx.ellipse(-8, -2, 6, 12, 0.1, 0, Math.PI * 2);
      ctx.ellipse(8, -2, 6, 12, -0.1, 0, Math.PI * 2);
      ctx.fill();

      // tear gloss
      ctx.beginPath();
      ctx.fillStyle = "rgba(191, 219, 254, 0.5)";
      ctx.arc(-9, -4, 3, 0, Math.PI * 2);
      ctx.arc(9, -4, 3, 0, Math.PI * 2);
      ctx.fill();

      // mouth
      ctx.beginPath();
      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 2;
      ctx.moveTo(-6, 8);
      ctx.quadraticCurveTo(0, 14, 6, 8);
      ctx.stroke();

      ctx.restore();

      // limbs
      ctx.strokeStyle = "#059669";
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      const legSwing = Math.sin(alien.wobble) * 14;
      const armSwing = Math.cos(alien.wobble * 1.2) * 16;

      ctx.beginPath();
      ctx.moveTo(-12, 18);
      ctx.quadraticCurveTo(-22 - armSwing, 28, -22 - armSwing, 34);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(12, 18);
      ctx.quadraticCurveTo(26 + armSwing, 30, 28 + armSwing, 38);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-8, 28);
      ctx.quadraticCurveTo(-20 - legSwing, 58, -16 - legSwing * 0.4, 74);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(8, 28);
      ctx.quadraticCurveTo(20 + legSwing, 58, 16 + legSwing * 0.4, 74);
      ctx.stroke();

      ctx.restore();
    };

    const drawHumans = () => {
      humans.forEach((human, index) => {
        ctx.save();
        ctx.translate(human.x, human.y + Math.sin(human.wobble) * 4);

        ctx.fillStyle = HUMAN_COLORS[index % HUMAN_COLORS.length];
        ctx.beginPath();
        const bodyWidth = 32;
        const bodyHeight = 50;
        const radius = 10;
        ctx.moveTo(-bodyWidth / 2, -26 + radius);
        ctx.quadraticCurveTo(-bodyWidth / 2, -26, -bodyWidth / 2 + radius, -26);
        ctx.lineTo(bodyWidth / 2 - radius, -26);
        ctx.quadraticCurveTo(bodyWidth / 2, -26, bodyWidth / 2, -26 + radius);
        ctx.lineTo(bodyWidth / 2, 24 - radius);
        ctx.quadraticCurveTo(bodyWidth / 2, 24, bodyWidth / 2 - radius, 24);
        ctx.lineTo(-bodyWidth / 2 + radius, 24);
        ctx.quadraticCurveTo(-bodyWidth / 2, 24, -bodyWidth / 2, 24 - radius);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#fde68a";
        ctx.beginPath();
        ctx.arc(0, -40, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#0f172a";
        ctx.beginPath();
        ctx.arc(-5, -42, 2.8, 0, Math.PI * 2);
        ctx.arc(5, -42, 2.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#0f172a";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-8, -32);
        ctx.quadraticCurveTo(0, -26, 8, -32);
        ctx.stroke();

        ctx.strokeStyle = HUMAN_COLORS[index % HUMAN_COLORS.length];
        ctx.lineWidth = 6;
        ctx.lineCap = "round";
        const stride = Math.sin(human.wobble * 1.8) * 12;

        ctx.beginPath();
        ctx.moveTo(-14, 6);
        ctx.lineTo(-30 - stride, 28);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(14, 6);
        ctx.lineTo(30 + stride, 28);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-10, 18);
        ctx.lineTo(-14 - stride, 52);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(10, 18);
        ctx.lineTo(14 + stride, 52);
        ctx.stroke();

        ctx.restore();
      });
    };

    const drawTears = () => {
      tears.forEach((tear) => {
        ctx.beginPath();
        ctx.fillStyle = `rgba(191, 219, 254, ${tear.alpha})`;
        ctx.ellipse(tear.x, tear.y, 3, 6, 0.3, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const drawEnergyTrails = () => {
      humans.forEach((human) => {
        ctx.save();
        const gradient = ctx.createLinearGradient(human.x - 60, human.y, human.x, human.y);
        gradient.addColorStop(0, "rgba(248, 113, 113, 0)");
        gradient.addColorStop(0.6, "rgba(248, 113, 113, 0.35)");
        gradient.addColorStop(1, "rgba(248, 113, 113, 0.8)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(
          human.x - 30,
          human.y + 8,
          60,
          28 + Math.sin(human.pulse) * 4,
          0.1,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.restore();
      });
    };

    const drawAlienAura = () => {
      const gradient = ctx.createRadialGradient(alien.x, alien.y, 5, alien.x, alien.y, 70);
      gradient.addColorStop(0, "rgba(74, 222, 128, 0.65)");
      gradient.addColorStop(1, "rgba(74, 222, 128, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(alien.x, alien.y, 70, 0, Math.PI * 2);
      ctx.fill();
    };

    let animationFrameId = 0;

    const step = (now: number) => {
      const dt = Math.min(now - lastTime, 1000);
      lastTime = now;

      alien.wobble += 6 * (dt / 1000);
      alien.pulse += 3 * (dt / 1000);
      alien.x += alien.vx * (dt / 1000);
      alien.baseY = ease(alien.baseY, height * 0.55 + Math.sin(now * 0.0007) * 40, 0.04);
      alien.y = alien.baseY + Math.sin(alien.wobble * 1.6) * 12;

      humans.forEach((human, index) => {
        human.wobble += 6.5 * (dt / 1000);
        human.pulse += 2.6 * (dt / 1000);
        const targetX = alien.x - 140 - index * 60;
        human.x = ease(human.x, targetX, 0.08);
        human.baseY = ease(human.baseY, alien.baseY + 20 + index * 12, 0.04);
        human.y = human.baseY + Math.sin(human.wobble * 1.7) * 10;
      });

      if (alien.x > width + 120) {
        resetChase();
      }

      updateTears(dt);
      updateEmbers(dt);

      drawBackground();
      drawAlienAura();
      drawEnergyTrails();
      drawAlien();
      drawHumans();
      drawTears();

      animationFrameId = requestAnimationFrame(step);
    };

    const handleResize = () => {
      setSize();
    };

    window.addEventListener("resize", handleResize);
    animationFrameId = requestAnimationFrame(step);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas className="videoCanvas" ref={canvasRef} />;
}
