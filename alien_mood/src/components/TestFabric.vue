<template>
  <div style="position: relative; width: 100%; height: 100%">
    <!-- 삭제 버튼 -->
    <button
      @click="handleDelete"
      style="
        position: absolute;
        top: 10px;
        left: 10px;
        padding: 10px;
        background-color: red;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        z-index: 1000;
      "
    >
      삭제
    </button>

    <!-- 이미지 추가 버튼 -->
    <div
      style="
        position: absolute;
        top: 50px;
        left: 10px;
        z-index: 1000;
        display: flex;
        gap: 10px;
      "
    >
      <button
        v-for="(image, index) in additionalImages"
        :key="'add-' + index"
        @click="addImage(image)"
        style="
          padding: 10px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          background-color: lightgray;
        "
      >
        이미지 추가 {{ index + 1 }}
      </button>
    </div>

    <!-- 기본 이미지 변경 버튼 -->
    <div
      style="
        position: absolute;
        top: 100px;
        left: 10px;
        z-index: 1000;
        display: flex;
        gap: 10px;
      "
    >
      <button
        v-for="(image, index) in predefinedImages"
        :key="'replace-' + index"
        @click="replaceDefaultImage(image)"
        style="
          padding: 10px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          background-color: lightblue;
        "
      >
        기본 이미지 변경 {{ index + 1 }}
      </button>
    </div>

    <!-- 파일 업로드 버튼 -->
    <button
      @click="triggerFileInput"
      style="
        position: absolute;
        top: 150px;
        left: 10px;
        padding: 10px;
        background-color: blue;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        z-index: 1000;
      "
    >
      이미지 첨부
    </button>

    <!-- 숨겨진 파일 입력 -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      style="display: none"
      @change="onFileChange"
      multiple
    />

    <!-- Fabric.js 캔버스 -->
    <canvas
      ref="canvas"
      style="border: 1px solid #ccc; width: 100%; height: 100%"
    ></canvas>
  </div>
</template>

<script>
import { onMounted, ref, markRaw } from "vue";
import { Canvas, Image as FabricImage } from "fabric";

import image1 from "@/assets/image/Ae.png";
import image2 from "@/assets/image/Ai.png";
import image3 from "@/assets/image/css.png";
import image4 from "@/assets/image/다가오는솔라스 (1).jpg";
import image5 from "@/assets/image/다가오는솔라스 (2).jpg";
import image6 from "@/assets/image/다가오는솔라스 (4).jpg";

export default {
  setup() {
    const canvas = ref(null);
    const predefinedImages = [image4, image5, image6];
    const additionalImages = [image1, image2, image3];
    const defaultImageObject = ref(null);
    const selectedObject = ref(null);

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

      // 기본 이미지 추가
      const img = new Image();
      img.src = predefinedImages[0];
      img.onload = () => {
        const fabricImage = new FabricImage(img, {
          left: canvas.value.width / 2,
          top: canvas.value.height / 2,
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

        // 상하좌우 핸들 숨기기
        fabricImage.setControlsVisibility({
          mt: false, // 상단
          mb: false, // 하단
          ml: false, // 왼쪽
          mr: false, // 오른쪽
        });

        canvas.value.add(fabricImage);
        defaultImageObject.value = fabricImage;
        canvas.value.renderAll();
      };

      // 객체 선택 이벤트
      canvas.value.on("object:selected", (e) => {
        selectedObject.value = e.target;
        console.log("선택된 객체:", selectedObject.value);
      });

      // 선택 해제 이벤트
      canvas.value.on("selection:cleared", () => {
        selectedObject.value = null;
        console.log("선택이 해제되었습니다.");
      });
    };

    // 이미지 추가
    const addImage = (imageSrc) => {
      const img = new Image();
      img.src = imageSrc;
      img.onload = () => {
        const fabricImage = new FabricImage(img, {
          left: canvas.value.width / 2,
          top: canvas.value.height / 2,
          originX: "center",
          originY: "center",
          scaleX: 0.5,
          scaleY: 0.5,
          selectable: true,
          evented: true,
          hasControls: true,
          hasBorders: true,
        });

        // 상하좌우 핸들 숨기기
        fabricImage.setControlsVisibility({
          mt: false, // 상단
          mb: false, // 하단
          ml: false, // 왼쪽
          mr: false, // 오른쪽
        });

        canvas.value.add(fabricImage);
        canvas.value.setActiveObject(fabricImage);
        canvas.value.renderAll();
      };
    };

    // 기본 이미지 변경
    const replaceDefaultImage = (newImageSrc) => {
      if (!defaultImageObject.value) {
        console.error("기본 이미지 객체가 없습니다.");
        return;
      }

      const img = new Image();
      img.src = newImageSrc;
      img.onload = () => {
        defaultImageObject.value.setElement(img);
        defaultImageObject.value.set({
          width: 200,
          height: 200,
          scaleX: 1,
          scaleY: 1,
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

        // 상하좌우 핸들 숨기기
        defaultImageObject.value.setControlsVisibility({
          mt: false, // 상단
          mb: false, // 하단
          ml: false, // 왼쪽
          mr: false, // 오른쪽
        });

        canvas.value.renderAll();
      };
    };

    // 파일 선택 창 열기
    const triggerFileInput = () => {
      const fileInput = document.querySelector("input[type='file']");
      if (fileInput) {
        fileInput.click();
      }
    };

    // 파일 선택 후 이미지 추가
    const onFileChange = (event) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.src = e.target.result;
          img.onload = () => {
            const fabricImage = new FabricImage(img, {
              left: 100,
              top: 100,
              scaleX: 0.5,
              scaleY: 0.5,
              selectable: true,
            });

            canvas.value.add(fabricImage);
            canvas.value.setActiveObject(fabricImage);
            canvas.value.renderAll();
          };
        };
        reader.readAsDataURL(file);
      });
    };

    // 선택된 객체 삭제
    const handleDelete = () => {
      const activeObject = canvas.value.getActiveObject();

      if (activeObject) {
        console.log("삭제할 객체:", activeObject);

        if (activeObject === defaultImageObject.value) {
          alert("기본 이미지는 삭제할 수 없습니다.");
          return;
        }

        canvas.value.remove(activeObject);
        canvas.value.discardActiveObject();
        canvas.value.renderAll();
      } else {
        alert("삭제할 객체를 선택하세요!");
      }
    };

    onMounted(() => {
      initializeCanvas();
    });

    return {
      canvas,
      predefinedImages,
      additionalImages,
      addImage,
      replaceDefaultImage,
      triggerFileInput,
      onFileChange,
      handleDelete,
    };
  },
};
</script>

<style>
canvas {
  display: block;
}
</style>
