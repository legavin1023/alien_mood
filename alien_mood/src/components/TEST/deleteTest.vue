<template>
  <div>
    <button
      @click="addRectangle"
      style="
        margin-bottom: 10px;
        padding: 10px;
        background-color: lightblue;
        border: none;
        cursor: pointer;
      "
    >
      사각형 추가
    </button>
    <canvas
      ref="canvas"
      style="border: 1px solid #ccc; width: 100%; height: 400px"
    ></canvas>
  </div>
</template>

<script>
import { onMounted, ref, markRaw } from "vue";
import { Canvas, Rect, Control, util } from "fabric"; // Fabric.js v6 방식으로 가져오기

export default {
  setup() {
    const canvas = ref(null);

    // 삭제 버튼 아이콘 (SVG 데이터 URI)
    const deleteIcon =
      "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='595.275px' height='595.275px' viewBox='200 215 230 470' xml:space='preserve'%3E%3Ccircle style='fill:%23F44336;' cx='299.76' cy='439.067' r='218.516'/%3E%3Cg%3E%3Crect x='267.162' y='307.978' transform='matrix(0.7071 -0.7071 0.7071 0.7071 -222.6202 340.6915)' style='fill:white;' width='65.545' height='262.18'/%3E%3Crect x='266.988' y='308.153' transform='matrix(0.7071 0.7071 -0.7071 0.7071 398.3889 -83.3116)' style='fill:white;' width='65.544' height='262.179'/%3E%3C/g%3E%3C/svg%3E";

    const deleteImg = new Image();
    deleteImg.src = deleteIcon;

    // 캔버스 초기화
    const initializeCanvas = () => {
      canvas.value = markRaw(
        new Canvas(canvas.value, {
          width: 800,
          height: 400,
          selection: true,
        })
      );

      // Fabric.js 기본 설정
      Rect.prototype.transparentCorners = false;
      Rect.prototype.cornerColor = "blue";
      Rect.prototype.cornerStyle = "circle";

      console.log("캔버스 초기화 성공:", canvas.value);
    };

    // 사용자 정의 삭제 버튼 렌더링
    const renderDeleteIcon = (ctx, left, top, _styleOverride, fabricObject) => {
      const size = 24; // cornerSize 기본값 설정
      ctx.save();
      ctx.translate(left, top);
      ctx.rotate(util.degreesToRadians(fabricObject.angle));
      ctx.drawImage(deleteImg, -size / 2, -size / 2, size, size);
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
      const rect = new Rect({
        left: 100,
        top: 50,
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
        offsetY: 0,
        cursorStyle: "pointer",
        mouseUpHandler: deleteObject,
        render: renderDeleteIcon, // renderDeleteIcon 함수 사용
        cornerSize: 24,
      });

      canvas.value.add(rect);
      canvas.value.setActiveObject(rect);
    };

    onMounted(() => {
      initializeCanvas();
    });

    return {
      canvas,
      addRectangle,
    };
  },
};
</script>

<style>
canvas {
  display: block;
}
</style>
