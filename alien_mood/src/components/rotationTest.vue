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
import { onMounted, ref, markRaw } from "vue";
import { Canvas, Rect, Control, util, controlsUtils } from "fabric";

// 프로젝트 내부 이미지 import
import deleteIcon from "@/assets/image/deleteIcon.png"; // 삭제 버튼
import rotateIcon from "@/assets/image/custom-handle.png"; // 회전 버튼
import resizeIcon from "@/assets/image/html.png"; // 크기조절 버튼

export default {
  setup() {
    const canvas = ref(null);

    // 중앙 좌표 저장 변수
    let centerX = 200;
    let centerY = 200;

    // 크기조절 핸들(오른쪽 하단) 렌더 함수 (이미지+투명 hit영역)
    const renderResizeIcon = function (
      ctx,
      left,
      top,
      styleOverride,
      fabricObject
    ) {
      const size = 24;
      const padding = 16; // 핸들 주변 여백
      const hitSize = size + padding * 2; // 클릭 영역 크기

      ctx.save();
      ctx.translate(left, top);
      ctx.rotate(util.degreesToRadians(fabricObject.angle));
      // 1. 이미지 그림
      const img = new window.Image();
      img.src = resizeIcon;
      ctx.globalAlpha = 0.7;
      ctx.drawImage(img, -size / 2, -size / 2, size, size);
      // 2. 투명한 원(hit 영역)
      ctx.globalAlpha = 0.01;
      ctx.beginPath();
      ctx.arc(0, 0, hitSize / 2, 0, 2 * Math.PI);
      ctx.fillStyle = "#000";
      ctx.fill();
      ctx.globalAlpha = 1.0;
      ctx.restore();
    };

    // 캔버스 초기화 함수
    const initializeCanvas = () => {
      canvas.value = markRaw(
        new Canvas(canvas.value, {
          width: window.innerWidth,
          height: window.innerHeight,
          selection: true,
        })
      );
    };

    // 삭제 버튼 렌더 함수
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

    // 회전 버튼 렌더 함수
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

    // 사각형(이미지) 추가 함수
    const addRectangle = () => {
      // 중앙 좌표로 생성
      const rect = new Rect({
        left: centerX,
        top: centerY,
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
        borderDashArray: [6, 4], // 컨트롤 박스(핸들 연결선) 점선
        cornerColor: "#00000000", // ★ 원하는 색상
        cornerStyle: "circle", // (선택)
      });

      // 모든 기본 핸들 숨기기
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
        // 커스텀 컨트롤(deleteControl, rotateControl, resizeControl)도 필요 없으면 추가하지 마세요.
      });

      // 삭제 컨트롤 추가
      rect.controls.deleteControl = new Control({
        x: 0.5,
        y: -0.5,
        cursorStyle: "pointer",
        mouseUpHandler: deleteObject,
        render: renderDeleteIcon,
        cornerSize: 24,
      });

      // 회전 컨트롤 추가
      rect.controls.rotateControl = new Control({
        x: 0,
        y: -0.7,
        cursorStyle: "crosshair",
        render: renderRotateIcon,
        cornerSize: 24,
        actionHandler: controlsUtils.rotationWithSnapping,
      });

      // 크기조절 컨트롤 추가
      rect.controls.resizeControl = new Control({
        x: 0.5,
        y: 0.5,
        cursorStyle: "se-resize",
        render: renderResizeIcon,
        cornerSize: 24,
        actionHandler: controlsUtils.scalingEqually,
      });

      canvas.value.add(rect);
      // canvas.value.setActiveObject(rect); // 추가한 사각형을 선택 상태로 설정

      // 오브젝트 수정 시 중앙 좌표 갱신
      canvas.value.on("object:modified", (e) => {
        if (e.target && e.target.targetObj === "rectangle") {
          centerX = e.target.left;
          centerY = e.target.top;
        }
      });
    };

    // 컴포넌트 마운트 시 캔버스 초기화 및 사각형 추가
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
