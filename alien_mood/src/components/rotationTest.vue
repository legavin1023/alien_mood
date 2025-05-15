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
import { Canvas, Rect, Control, util, controlsUtils } from "fabric";

// 프로젝트 내부 이미지 import
import deleteIcon from "@/assets/image/deleteIcon.png"; // 삭제 버튼
import rotateIcon from "@/assets/image/custom-handle.png"; // 회전 버튼
import resizeIcon from "@/assets/image/html.png"; // 오른쪽 하단에 추가할 아이콘(예시)

export default {
  setup() {
    const canvas = ref(null);

    // 중앙 좌표 저장 변수
    let centerX = 200;
    let centerY = 200;

    const renderResizeIcon = function (
      ctx,
      left,
      top,
      styleOverride,
      fabricObject
    ) {
      const size = 24;
      const padding = 16; // 패딩 추가
      const hitSize = size + padding * 2; // 실제 클릭 영역(핸들) 크기

      ctx.save();
      ctx.translate(left, top);
      ctx.rotate(util.degreesToRadians(fabricObject.angle));
      // 1. 이미지 먼저 그림 (투명하게)
      const img = new window.Image();
      img.src = resizeIcon;
      ctx.globalAlpha = 0.7;
      ctx.drawImage(img, -size / 2, -size / 2, size, size);
      // 2. 점(핸들)도 같이 그림 (투명, 하지만 hit 영역은 살아있음)
      ctx.globalAlpha = 0.01;
      ctx.beginPath();
      ctx.arc(0, 0, hitSize / 2, 0, 2 * Math.PI);
      ctx.fillStyle = "#000";
      ctx.fill();
      ctx.globalAlpha = 1.0;
      ctx.restore();
    };

    // 캔버스 초기화
    const initializeCanvas = () => {
      canvas.value = markRaw(
        new Canvas(canvas.value, {
          width: window.innerWidth,
          height: window.innerHeight,
          selection: true,
        })
      );

      // Fabric.js 기본 설정
      Rect.prototype.transparentCorners = false;
      Rect.prototype.cornerColor = "blue";
      Rect.prototype.cornerStyle = "circle";
    };

    // 사용자 정의 삭제 버튼 렌더링
    const renderDeleteIcon = (ctx, left, top, _styleOverride, fabricObject) => {
      const size = 24;
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
      const size = 24;
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

    // 사각형 추가
    const addRectangle = () => {
      // 중앙 좌표로 생성
      const rect = new Rect({
        left: centerX,
        top: centerY,
        fill: "yellow",
        width: 200,
        height: 200,
        objectCaching: false,
        stroke: null, // 선 없음
        strokeWidth: 0, // 선 두께 없음
        strokeDashArray: null, // 점선 없음
        originX: "center",
        originY: "center",
        centeredRotation: true,
        targetObj: "rectangle",
        padding: 16,
        borderDashArray: [6, 4], // ← 이 줄 추가!
      });

      // 사용자 정의 삭제 컨트롤 추가
      rect.controls.deleteControl = new Control({
        x: 0.5,
        y: -0.5,
        cursorStyle: "pointer",
        mouseUpHandler: deleteObject,
        render: renderDeleteIcon,
        cornerSize: 24,
      });

      // 사용자 정의 회전 컨트롤 추가
      rect.controls.rotateControl = new Control({
        x: 0,
        y: -0.7,
        cursorStyle: "crosshair",
        render: renderRotateIcon,
        cornerSize: 24,
        actionHandler: controlsUtils.rotationWithSnapping,
      });

      // 오른쪽 하단에 이미지 컨트롤 추가
      rect.controls.resizeControl = new Control({
        x: 0.5,
        y: 0.5,
        cursorStyle: "se-resize",
        render: renderResizeIcon,
        cornerSize: 24,
      });

      canvas.value.add(rect);
      canvas.value.setActiveObject(rect);

      // 오브젝트 수정 시 중앙 좌표 갱신
      canvas.value.on("object:modified", (e) => {
        if (e.target && e.target.targetObj === "rectangle") {
          centerX = e.target.left;
          centerY = e.target.top;
        }
      });
    };

    onMounted(() => {
      initializeCanvas();
      addRectangle();
    });

    return {
      canvas,
    };
  },
};
</script>
