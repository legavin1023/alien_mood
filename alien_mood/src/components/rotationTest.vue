<template>
  <div style="position: relative; width: 100%; height: 100%">
    <canvas
      ref="canvas"
      style="
        border: 1px solid #ccc;
        width: 100%;
        height: 100%;
        touch-action: none;
      "
    ></canvas>
  </div>
</template>

<script>
import { ref, onMounted, markRaw } from "vue";
import { Canvas, Rect, Control, util, controlsUtils } from "fabric";
import deleteIcon from "@/assets/image/deleteIcon.png";
import rotateIcon from "@/assets/image/custom-handle.png";
import resizeIcon from "@/assets/image/html.png";

export default {
  data() {
    return {
      centerX: 200,
      centerY: 200,
      canvas: null,
    };
  },
  methods: {
    renderResizeIcon(ctx, left, top, styleOverride, fabricObject) {
      const size = 24;
      const padding = 16;
      const hitSize = size + padding * 2;

      ctx.save();
      ctx.translate(left, top);
      ctx.rotate(util.degreesToRadians(fabricObject.angle));
      const img = new window.Image();
      img.src = resizeIcon;
      ctx.globalAlpha = 0.7;
      ctx.drawImage(img, -size / 2, -size / 2, size, size);
      ctx.globalAlpha = 0.01;
      ctx.beginPath();
      ctx.arc(0, 0, hitSize / 2, 0, 2 * Math.PI);
      ctx.fillStyle = "#000";
      ctx.fill();
      ctx.globalAlpha = 1.0;
      ctx.restore();
    },
    renderDeleteIcon(ctx, left, top, _styleOverride, fabricObject) {
      const size = 24;
      const img = new Image();
      img.src = deleteIcon;
      ctx.save();
      ctx.translate(left, top);
      ctx.rotate(util.degreesToRadians(fabricObject.angle));
      ctx.drawImage(img, -size / 2, -size / 2, size, size);
      ctx.restore();
    },
    renderRotateIcon(ctx, left, top, _styleOverride, fabricObject) {
      const size = 24;
      const img = new Image();
      img.src = rotateIcon;
      ctx.save();
      ctx.translate(left, top);
      ctx.rotate(util.degreesToRadians(fabricObject.angle));
      ctx.drawImage(img, -size / 2, -size / 2, size, size);
      ctx.restore();
    },
    deleteObject(_eventData, transform) {
      const canvasInstance = transform.target.canvas;
      canvasInstance.remove(transform.target);
      canvasInstance.requestRenderAll();
    },
    addRectangle() {
      const rect = new Rect({
        left: this.centerX,
        top: this.centerY,
        fill: "yellow",
        width: 200,
        height: 200,
        objectCaching: false,
        stroke: null,
        strokeWidth: 0,
        strokeDashArray: null,
        originX: "center",
        originY: "center",
        centeredRotation: true,
        targetObj: "rectangle",
        padding: 16,
        borderDashArray: [6, 4],
        cornerColor: "#00000000",
        cornerStyle: "circle",
      });

      rect.setControlsVisibility({
        tl: false,
        tr: false,
        bl: false,
        br: false,
        mt: false,
        mb: false,
        ml: false,
        mr: false,
        mtr: true,
      });

      rect.controls.deleteControl = new Control({
        x: 0.5,
        y: -0.5,
        cursorStyle: "pointer",
        mouseUpHandler: this.deleteObject,
        render: this.renderDeleteIcon,
        cornerSize: 24,
      });

      rect.controls.rotateControl = new Control({
        x: 0,
        y: -0.7,
        cursorStyle: "crosshair",
        render: this.renderRotateIcon,
        cornerSize: 24,
        actionHandler: controlsUtils.rotationWithSnapping,
      });

      rect.controls.resizeControl = new Control({
        x: 0.5,
        y: 0.5,
        cursorStyle: "se-resize",
        render: this.renderResizeIcon,
        cornerSize: 24,
        actionHandler: controlsUtils.scalingEqually,
      });

      this.canvas.add(rect);

      this.canvas.on("object:modified", (e) => {
        if (e.target && e.target.targetObj === "rectangle") {
          this.centerX = e.target.left;
          this.centerY = e.target.top;
        }
      });
    },
    initializeCanvas() {
      this.canvas = markRaw(
        new Canvas(this.$refs.canvas, {
          width: window.innerWidth,
          height: window.innerHeight,
          selection: true,
        })
      );

      this.canvas.on("mouse:up", (opt) => {
        const evt = opt.e;
        const target = this.canvas.findTarget(evt, false);
        if (target) {
          this.canvas.setActiveObject(target);
          this.canvas.requestRenderAll();
        } else {
          this.canvas.discardActiveObject();
          this.canvas.requestRenderAll();
        }
      });
    },
  },
  mounted() {
    this.initializeCanvas();
    this.addRectangle();
  },
};
</script>
