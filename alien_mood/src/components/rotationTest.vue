<template>
  <div style="position: relative; width: 100%; height: 100%">
    <canvas
      ref="canvas"
      style="border: 1px solid #ccc; width: 100%; height: 100%"
    ></canvas>
  </div>
</template>

<script>
import { onMounted, ref, markRaw } from "vue";
import { Canvas, Rect, Control, util } from "fabric";

// 프로젝트 내부 이미지 import
import deleteIcon from "@/assets/image/deleteIcon.png"; // 삭제 버튼
import rotateIcon from "@/assets/image/custom-handle.png"; // 회전 버튼

export default {
  setup() {
    const canvas = ref(null);

    // 캔버스 초기화
    const initializeCanvas = () => {
      canvas.value = markRaw(
        new Canvas(canvas.value, {
          width: window.innerWidth,
          height: window.innerHeight,
          selection: true,
        })
      );

      console.log("캔버스 초기화 성공:", canvas.value);

      // Fabric.js 기본 설정
      Rect.prototype.transparentCorners = false;
      Rect.prototype.cornerColor = "blue";
      Rect.prototype.cornerStyle = "circle";
    };

    // 사용자 정의 삭제 버튼 렌더링
    const renderDeleteIcon = (ctx, left, top, _styleOverride, fabricObject) => {
      const size = 24; // cornerSize 기본값 설정
      const img = new Image();
      img.src = deleteIcon;
      ctx.save();
      ctx.translate(left, top);
      ctx.rotate(util.degreesToRadians(fabricObject.angle));
      ctx.drawImage(img, -size / 2, -size / 2, size, size);
      ctx.restore();
    };

    // 사용자 정의 회전 버튼 렌더링
    const renderRotateIcon = (ctx, left, top, _styleOverride, fabricObject) => {
      const size = 24; // cornerSize 기본값 설정
      const img = new Image();
      img.src = rotateIcon;
      ctx.save();
      ctx.translate(left, top);
      ctx.rotate(util.degreesToRadians(fabricObject.angle));
      ctx.drawImage(img, -size / 2, -size / 2, size, size);
      ctx.restore();
    };

    // 삭제 버튼 클릭 핸들러
    const deleteObject = (_eventData, transform) => {
      const canvasInstance = transform.target.canvas;
      canvasInstance.remove(transform.target);
      canvasInstance.requestRenderAll();
    };

    // 회전 버튼 클릭 핸들러
    const rotateObject = (_eventData, transform) => {
      const target = transform.target;
      target.rotate((target.angle || 0) + 15); // 15도 회전
      target.canvas.requestRenderAll();
    };

    // 사각형 추가
    const addRectangle = () => {
      const rect = new Rect({
        left: 100,
        top: 100,
        fill: "yellow",
        width: 200,
        height: 200,
        objectCaching: false,
        stroke: "lightgreen",
        strokeWidth: 4,
      });

      // 사용자 정의 삭제 컨트롤 추가
      rect.controls.deleteControl = new Control({
        x: 0.5,
        y: -0.5,
        offsetY: 16,
        cursorStyle: "pointer",
        mouseUpHandler: deleteObject,
        render: renderDeleteIcon,
        cornerSize: 24,
      });

      // 사용자 정의 회전 컨트롤 추가
      rect.controls.rotateControl = new Control({
        x: -0.5,
        y: -0.5,
        offsetY: 16,
        cursorStyle: "pointer",
        mouseUpHandler: rotateObject,
        render: renderRotateIcon,
        cornerSize: 24,
      });

      canvas.value.add(rect);
      canvas.value.setActiveObject(rect);
    };

    onMounted(() => {
      initializeCanvas();
      addRectangle(); // 초기 사각형 추가
    });

    return {
      canvas,
    };
  },
};
</script>

<style>
canvas {
  display: block;
}
</style>
