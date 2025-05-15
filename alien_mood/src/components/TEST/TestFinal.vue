<template>
  <div style="position: relative; width: 100%; height: 100%">
    <div
      style="
        position: absolute;
        top: 10px;
        left: 10px;
        z-index: 1000;
        display: flex;
        gap: 10px;
      "
    >
      <button
        v-for="(img, idx) in additionalImages"
        :key="'add-img-' + idx"
        @click="addImage(img)"
      >
        이미지 추가 {{ idx + 1 }}
      </button>
      <button @click="addRectangle">도형 추가</button>
      <button
        v-for="(img, idx) in predefinedImages"
        :key="'replace-img-' + idx"
        @click="replaceDefaultImage(img)"
      >
        기본 이미지 변경 {{ idx + 1 }}
      </button>
      <button @click="triggerFileInput">이미지 첨부</button>
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        style="display: none"
        @change="onFileChange"
        multiple
      />
    </div>
    <canvas
      ref="canvas"
      style="border: 1px solid #ccc; width: 100%; height: 100%"
    ></canvas>
  </div>
</template>

<script>
import { markRaw } from "vue";
import {
  Canvas,
  Rect,
  Image as FabricImage,
  Control,
  util,
  controlsUtils,
  loadSVGFromURL,
  Group,
} from "fabric";
import image1 from "@/assets/image/Ae.png";
import image2 from "@/assets/image/Ai.png";
import image3 from "@/assets/image/css.png";
import image4 from "@/assets/image/다가오는솔라스 (1).jpg";
import image5 from "@/assets/image/다가오는솔라스 (2).jpg";
import image6 from "@/assets/image/다가오는솔라스 (4).jpg";
import deleteIcon from "@/assets/image/deleteIcon.png";
import rotateIcon from "@/assets/image/custom-handle.png";
import resizeIcon from "@/assets/image/html.png";
import svgUrl from "@/assets/image/green.svg";

export default {
  data() {
    return {
      canvas: null,
      predefinedImages: [image4, image5, image6],
      additionalImages: [image1, image2, image3],
      defaultImageObject: null,
    };
  },
  methods: {
    renderDeleteIcon(ctx, left, top, _styleOverride, fabricObject) {
      const size = 28;
      const padding = 16;
      const hitSize = size + padding * 2;
      const img = new Image();
      img.src = deleteIcon;
      ctx.save();
      ctx.translate(left, top);
      ctx.rotate(util.degreesToRadians(fabricObject.angle));
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
    renderRotateIcon(ctx, left, top, _styleOverride, fabricObject) {
      const size = 28;
      const padding = 16;
      const hitSize = size + padding * 2;
      const img = new Image();
      img.src = rotateIcon;
      ctx.save();
      ctx.translate(left, top);
      ctx.rotate(util.degreesToRadians(fabricObject.angle));
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
    renderResizeIcon(ctx, left, top, _styleOverride, fabricObject) {
      const size = 24;
      const padding = 16;
      const hitSize = size + padding * 2;
      const img = new Image();
      img.src = resizeIcon;
      ctx.save();
      ctx.translate(left, top);
      ctx.rotate(util.degreesToRadians(fabricObject.angle));
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
    deleteObject(_eventData, transform) {
      const canvasInstance = transform.target.canvas;
      canvasInstance.remove(transform.target);
      canvasInstance.requestRenderAll();
    },
    addCustomControls(obj) {
      obj.setControlsVisibility({
        tl: false,
        tr: false,
        bl: false,
        br: false,
        mt: false,
        mb: false,
        ml: false,
        mr: false,
        mtr: true,
        deleteControl: true,
        rotateControl: true,
        resizeControl: true,
      });

      obj.controls.deleteControl = new Control({
        x: 0.5,
        y: -0.5,
        cursorStyle: "pointer",
        mouseUpHandler: this.deleteObject,
        render: this.renderDeleteIcon,
        cornerSize: 28,
        hitbox: { width: 60, height: 60 },
      });
      obj.controls.rotateControl = new Control({
        x: 0,
        y: -0.7,
        cursorStyle: "crosshair",
        render: this.renderRotateIcon,
        cornerSize: 28,
        actionHandler: controlsUtils.rotationWithSnapping,
        hitbox: { width: 60, height: 60 },
      });
      obj.controls.resizeControl = new Control({
        x: 0.5,
        y: 0.5,
        cursorStyle: "se-resize",
        render: this.renderResizeIcon,
        cornerSize: 28,
        actionHandler: controlsUtils.scalingEqually,
        hitbox: { width: 60, height: 60 },
      });

      obj.set({
        cornerColor: "#00000000",
        cornerSize: 18,
        cornerStyle: "circle",
        borderColor: "#00bfff",
        borderDashArray: [6, 4],
        transparentCorners: false,
        hasBorders: false,
        hasControls: false,
      });

      obj.on("selected", () => {
        obj.set({ hasBorders: true, hasControls: true });
        obj.setControlsVisibility({
          tl: false,
          tr: false,
          bl: false,
          br: false,
          mt: false,
          mb: false,
          ml: false,
          mr: false,
          mtr: true,
          deleteControl: true,
          rotateControl: true,
          resizeControl: true,
        });
        obj.canvas.requestRenderAll();
      });
      obj.on("deselected", () => {
        obj.set({ hasBorders: false, hasControls: false });
        obj.setControlsVisibility({
          tl: false,
          tr: false,
          bl: false,
          br: false,
          mt: false,
          mb: false,
          ml: false,
          mr: false,
          mtr: true,
          deleteControl: true,
          rotateControl: true,
          resizeControl: true,
        });
        obj.canvas.requestRenderAll();
      });
    },
    addRectangle() {
      const rect = new Rect({
        left: this.canvas.width / 2,
        top: this.canvas.height / 2,
        fill: "#ffe066",
        width: 200,
        height: 200,
        objectCaching: false,
        originX: "center",
        originY: "center",
        centeredRotation: true,
        padding: 16,
        selectable: true,
        evented: true,
        hasControls: false,
        hasBorders: false,
      });
      this.addCustomControls(rect);
      this.canvas.add(rect);
      this.canvas.setActiveObject(rect);
      this.canvas.renderAll();
    },
    addImage(imageSrc) {
      const img = new window.Image();
      img.src = imageSrc;
      img.onload = () => {
        const targetWidth = 300;
        const targetHeight = 300;
        const scaleX = targetWidth / img.width;
        const scaleY = targetHeight / img.height;

        const fabricImage = new FabricImage(img, {
          left: this.canvas.width / 2,
          top: this.canvas.height / 2,
          originX: "center",
          originY: "center",
          scaleX,
          scaleY,
          padding: 16,
          selectable: true,
          evented: true,
          hasControls: false,
          hasBorders: false,
        });
        this.addCustomControls(fabricImage);
        this.canvas.add(fabricImage);
        this.canvas.setActiveObject(fabricImage);
        this.canvas.renderAll();
      };
    },
    replaceDefaultImage(newImageSrc) {
      if (!this.defaultImageObject) return;
      const img = new window.Image();
      img.src = newImageSrc;
      img.onload = () => {
        this.defaultImageObject.setElement(img);
        this.defaultImageObject.set({
          width: 200,
          height: 200,
          scaleX: 1,
          scaleY: 1,
        });
        this.canvas.renderAll();
      };
    },
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    onFileChange(event) {
      const files = event.target.files;
      if (!files || files.length === 0) return;
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new window.Image();
          img.src = e.target.result;
          img.onload = () => {
            const fabricImage = new FabricImage(img, {
              left: this.canvas.width / 2,
              top: this.canvas.height / 2,
              originX: "center",
              originY: "center",
              scaleX: 0.5,
              scaleY: 0.5,
              padding: 16,
              selectable: true,
              evented: true,
              hasControls: false,
              hasBorders: false,
            });
            this.addCustomControls(fabricImage);
            this.canvas.add(fabricImage);
            this.canvas.setActiveObject(fabricImage);
            this.canvas.renderAll();
          };
        };
        reader.readAsDataURL(file);
      });
    },
    animate(obj) {
      obj.animate(
        { angle: 360 },
        {
          duration: 3000,
          onComplete: () => {
            obj.set("angle", 0);
            this.animate(obj);
          },
          easing: (t, b, c, d) => (c * t) / d + b,
        }
      );
    },
    addSvgMatrixToCanvas() {
      loadSVGFromURL(svgUrl, (objects, options) => {
        const baseSvg = new Group(objects, {
          ...options,
          originX: "center",
          originY: "center",
          selectable: true,
          evented: true,
          hasControls: false,
          hasBorders: false,
          padding: 16,
        });

        // SVG 원본 크기
        const bounds = baseSvg.getBoundingRect();
        const svgWidth = bounds.width;
        const svgHeight = bounds.height;

        // 행렬 정보
        const colCount = 5;
        const rowCount = 3;
        const margin = 40;

        // 전체 SVG 행렬의 크기
        const totalWidth = svgWidth * colCount + margin * (colCount - 1);
        const totalHeight = svgHeight * rowCount + margin * (rowCount - 1);

        // 캔버스 크기에 맞게 scale 계산 (90% 영역에 맞춤)
        const scaleX = (this.canvas.width * 0.9) / totalWidth;
        const scaleY = (this.canvas.height * 0.9) / totalHeight;
        const scale = Math.min(scaleX, scaleY);

        // scale 적용된 SVG 크기
        const scaledSvgWidth = svgWidth * scale;
        const scaledSvgHeight = svgHeight * scale;
        const scaledMargin = margin * scale;

        // 중앙 배치 좌표
        const matrixWidth =
          scaledSvgWidth * colCount + scaledMargin * (colCount - 1);
        const matrixHeight =
          scaledSvgHeight * rowCount + scaledMargin * (rowCount - 1);
        const startX =
          this.canvas.width / 2 - matrixWidth / 2 + scaledSvgWidth / 2;
        const startY =
          this.canvas.height / 2 - matrixHeight / 2 + scaledSvgHeight / 2;

        // SVG 행렬로 복제 및 배치
        for (let i = 0; i < rowCount; i++) {
          for (let j = 0; j < colCount; j++) {
            baseSvg.clone((clone) => {
              clone.set({
                left: startX + j * (scaledSvgWidth + scaledMargin),
                top: startY + i * (scaledSvgHeight + scaledMargin),
                scaleX: scale,
                scaleY: scale,
              });
              this.addCustomControls(clone);
              this.canvas.add(clone);
              this.animate(clone);
            });
          }
        }
        this.canvas.renderAll();
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

      // 기본 이미지 추가
      const img = new window.Image();
      img.src = this.predefinedImages[0];
      img.onload = () => {
        const fabricImage = new FabricImage(img, {
          left: this.canvas.width / 2,
          top: this.canvas.height / 2,
          originX: "center",
          originY: "center",
          width: 200,
          height: 200,
          selectable: false,
          evented: false,
          hasControls: false,
          hasBorders: false,
          lockMovementX: true,
          lockMovementY: true,
          lockScalingX: true,
          lockScalingY: true,
          lockRotation: true,
        });
        this.canvas.add(fabricImage);
        this.defaultImageObject = fabricImage;
        this.canvas.renderAll();
      };

      // SVG 여러 개를 캔버스에 바로 추가
      this.addSvgMatrixToCanvas();

      // 클릭 시 바로 선택 상태로 & zIndex 조정
      this.canvas.on("mouse:up", (opt) => {
        const evt = opt.e;
        const target = this.canvas.findTarget(evt, false);
        if (target && target.selectable !== false) {
          this.canvas.setActiveObject(target);

          // 오브젝트를 맨 위로 올리기 (zIndex 조정)
          const objs = this.canvas.getObjects();
          const idx = objs.indexOf(target);
          if (idx > -1 && idx !== objs.length - 1) {
            objs.splice(idx, 1);
            objs.push(target);
            this.canvas._objects = objs;
          }
          this.canvas.renderAll();
        } else {
          this.canvas.discardActiveObject();
          this.canvas.renderAll();
        }
      });
    },
  },
  mounted() {
    this.initializeCanvas();
  },
};
</script>

<style>
canvas {
  display: block;
}
</style>
