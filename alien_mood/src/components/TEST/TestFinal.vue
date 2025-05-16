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
        v-for="img in additionalImages"
        :key="img.src"
        @click="addImage(img.src)"
        style="background: none; border: none; cursor: pointer"
      >
        <img :src="img.src" :alt="img.label" width="32" height="32" />
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
      />
      <!-- SVG 색상 변경 버튼 -->
      <div>
        <button
          v-for="(btn, idx) in colorButtonList"
          :key="btn.label + idx"
          @click="changeSvgColorsByIds(btn.colors)"
        >
          {{ btn.label }}
        </button>
      </div>
      <!-- 옷 종류별 아이콘 버튼 -->
      <div style="display: flex; gap: 8px">
        <button
          v-for="clothes in clothesList"
          :key="clothes.name"
          @click="selectClothes(clothes)"
          style="background: none; border: none; cursor: pointer"
        >
          <img :src="clothes.icon" :alt="clothes.name" width="48" height="48" />
          <div>{{ clothes.name }}</div>
        </button>
      </div>

      <!-- 옷을 입혔을 때만 색상 버튼 노출 -->
      <div v-if="selectedClothes" style="margin: 12px 0">
        <button
          v-for="(btn, idx) in selectedClothes.colorButtons"
          :key="btn.label + idx"
          @click="changeClothesColors(btn.targets)"
          style="display: flex; align-items: center; gap: 8px"
        >
          <!-- 메인 컬러 미리보기 동그라미 -->
          <span
            v-if="btn.mainColor"
            :style="{
              display: 'inline-block',
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: btn.mainColor,
              border: '1px solid #aaa',
            }"
          ></span>
          {{ btn.label }}
        </button>
      </div>
      <!-- 포즈 선택 버튼 -->
      <div style="display: flex; gap: 8px; margin-bottom: 12px">
        <button
          v-for="pose in ['인간', '인간팔']"
          :key="pose"
          :style="{
            background: currentPose === pose ? '#00bfff' : '#eee',
            color: currentPose === pose ? '#fff' : '#333',
            border: '1px solid #ccc',
            borderRadius: '6px',
            padding: '6px 16px',
            cursor: 'pointer',
          }"
          @click="changePose(pose)"
        >
          {{ pose }}
        </button>
      </div>
      <button @click="saveCanvasAsImage">이미지로 저장</button>
    </div>
    <canvas
      ref="canvas"
      style="border: 1px solid #ccc; width: 100%; height: 100%"
    ></canvas>
  </div>
</template>

<script>
const req = require.context("@/assets/image", false, /\.png$/);
const additionalImages = req.keys().map((key, idx) => ({
  src: req(key),
  label: `emoji${idx + 1}`,
}));

import { ref, onMounted, markRaw } from "vue";
import {
  Canvas,
  Rect,
  Image as FabricImage,
  Control,
  util,
  controlsUtils,
  loadSVGFromURL,
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
import shirt from "@/assets/image/shirt.svg";
import shirtArm from "@/assets/image/shirt팔.svg";
import drass from "@/assets/image/dress.svg";
import drassArm from "@/assets/image/dress팔.svg";
import human from "@/assets/image/인간.svg";
import humanArm from "@/assets/image/인간팔.svg";
export default {
  data() {
    return {
      canvas: null,
      predefinedImages: [image4, image5, image6],
      additionalImages: [
        { src: image1, label: "에펙" },
        { src: image2, label: "일러" },
        { src: image3, label: "html" },
        // ...이모티콘 추가
      ],
      defaultImageObject: null,
      svgGroup: null, // SVG 그룹 참조 저장
      currentPose: "인간", // 포즈
      // data()에 추가
      colorButtonList: [
        {
          label: "핑크색",

          colors: [
            { id: "green_1", color: "#ff0055" },
            { id: "green_2", color: "#00bfff" },
          ],
        },
        {
          label: "초록색",
          colors: [
            { id: "green_1", color: "#00cc44" },
            { id: "green_2", color: "#ffe066" },
          ],
        },
      ],

      clothesList: [
        {
          name: "드레스",
          icon: drass,
          svgUrl: {
            인간: drass,
            인간팔: drassArm,
          },
          position: {
            인간: { left: 90, top: 470 },
            인간팔: { left: 170, top: 480 },
          },
          colorButtons: [
            {
              label: "핑크/파랑",
              mainColor: "#ff69b4", // 대표색
              targets: [
                { type: "id", value: "dress_body1", color: "#ff69b4" },
                { type: "id", value: "dress_body2", color: "#ff69b4" },
                { type: "id", value: "belt", color: "#00bfff" },
              ],
            },
            {
              label: "핑크/노랑",
              mainColor: "#ffe066", // 대표색
              targets: [
                { type: "id", value: "dress_body1", color: "#ff69b4" },
                { type: "id", value: "dress_body2", color: "#ff69b4" },
                { type: "id", value: "belt", color: "#ffe066" },
              ],
            },
            {
              label: "노랑/파랑",
              mainColor: "#00cc44", // 대표색
              targets: [
                { type: "id", value: "dress_body1", color: "#00cc44" },
                { type: "id", value: "dress_body2", color: "#00cc44" },
                { type: "id", value: "belt", color: "#00bfff" },
              ],
            },
          ],
        },
        {
          name: "셔츠",
          icon: shirt,
          svgUrl: {
            인간: shirt,
            인간팔: shirtArm,
          },
          position: {
            인간: { left: 70, top: 440 },
            인간팔: { left: 160, top: 440 },
          },
          colorButtons: [
            {
              label: "하양/파랑",
              mainColor: "#00bfff",
              targets: [
                { type: "id", value: "main", color: "#fff" },
                { type: "id", value: "collar", color: "#00bfff" },
              ],
            },
          ],
        },
      ],
      selectedClothes: null, // 현재 선택된 옷 데이터
    };
  },
  methods: {
    // methods에 추가 또는 initializeCanvas 내에 아래 코드 삽입
    async addHumanSvg() {
      // 포즈에 따라 파일 선택
      const humanSvgUrl = this.currentPose === "인간팔" ? humanArm : human;
      const loadedSVG = await loadSVGFromURL(humanSvgUrl);
      let svgGroup = util.groupSVGElements(loadedSVG.objects);
      svgGroup.set({
        left: 100,
        top: this.canvas.height / 2,
        originX: "left",
        originY: "center",
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
      this.canvas.add(svgGroup);
      this.humanSvgGroup = svgGroup;
      this.canvas.renderAll();
    },
    async selectClothes(clothes) {
      if (this.clothesSvgGroup) {
        this.canvas.remove(this.clothesSvgGroup);
      }
      // 포즈에 맞는 SVG 파일 선택
      const svgUrl =
        typeof clothes.svgUrl === "object"
          ? clothes.svgUrl[this.currentPose] || clothes.svgUrl["인간"]
          : clothes.svgUrl;
      const loadedSVG = await loadSVGFromURL(svgUrl);
      let svgGroup = util.groupSVGElements(loadedSVG.objects);

      // 포즈별 위치 적용
      const pos = clothes.position?.[this.currentPose] || {
        left: 100,
        top: 200,
      };

      svgGroup.set({
        left: pos.left,
        top: pos.top,
        originX: "left",
        originY: "center",
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
      this.canvas.add(svgGroup);
      this.clothesSvgGroup = svgGroup;
      this.selectedClothes = clothes;
      this.canvas.renderAll();
    },
    async changePose(pose) {
      this.currentPose = pose;
      // 기존 인간/옷 SVG 삭제
      if (this.humanSvgGroup) this.canvas.remove(this.humanSvgGroup);
      if (this.clothesSvgGroup) this.canvas.remove(this.clothesSvgGroup);
      // 새 포즈의 인간 SVG 추가
      await this.addHumanSvg();
      // 옷이 선택되어 있으면 새 위치에 다시 추가
      if (this.selectedClothes) {
        await this.selectClothes(this.selectedClothes);
      }
    },
    // 옷 SVG 색상 변경 (id/class 모두 지원, 재귀 순회)
    changeClothesColors(targets) {
      if (!this.clothesSvgGroup) return;

      function changeRecursive(obj) {
        if (obj._objects) {
          obj._objects.forEach((child) => changeRecursive(child));
        } else {
          targets.forEach(({ type, value, color }) => {
            if (
              (type === "id" &&
                (obj.id === value || (obj.get && obj.get("id") === value))) ||
              (type === "class" &&
                (obj.className === value ||
                  (obj.get && obj.get("class") === value)))
            ) {
              obj.set("fill", color);
            }
          });
        }
      }

      changeRecursive(this.clothesSvgGroup);
      this.canvas.requestRenderAll();
    },
    saveCanvasAsImage() {
      // 파일명 입력 받기 (기본값: 오늘기분외계인)
      let filename = prompt("저장할 파일 이름을 입력하세요.", "오늘기분외계인");
      if (!filename || filename.trim() === "") {
        filename = "오늘기분외계인";
      }
      // 확장자 자동 추가
      if (!filename.endsWith(".jpg") && !filename.endsWith(".png")) {
        filename += ".jpg";
      }

      // 캔버스를 이미지로 변환
      const dataUrl = this.canvas.toDataURL({
        format: "jpg",
        quality: 1.0,
      });

      // 다운로드 링크 생성 및 클릭
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    changeSvgColorsByIds(idColorList) {
      if (!this.svgGroup) return;
      this.svgGroup.forEachObject((obj) => {
        idColorList.forEach(({ id, color }) => {
          if (obj.id === id || obj.get("id") === id) {
            obj.set("fill", color);
          }
        });
      });
      this.canvas.requestRenderAll();
    },
    async addSvgToCanvas() {
      const loadedSVG = await loadSVGFromURL(svgUrl);
      let svgGroup = util.groupSVGElements(loadedSVG.objects);

      // getBoundingRect가 0일 경우 대비
      let bounds = svgGroup.getBoundingRect();
      let svgWidth = bounds.width;
      let svgHeight = bounds.height;
      if (!svgWidth || !svgHeight) {
        svgWidth = loadedSVG.options.width || 200;
        svgHeight = loadedSVG.options.height || 200;
      }

      const canvasWidth = this.canvas.width;
      const canvasHeight = this.canvas.height;
      const scale = Math.min(
        (canvasWidth * 0.5) / svgWidth,
        (canvasHeight * 0.5) / svgHeight,
        1
      );

      svgGroup.set({
        left: 100,
        top: 100,
        originX: "center",
        originY: "center",
        scaleX: scale,
        scaleY: scale,
        selectable: true,
        evented: true,
      });

      this.addCustomControls(svgGroup);
      this.canvas.add(svgGroup);
      this.canvas.setActiveObject(svgGroup);
      this.svgGroup = svgGroup; // SVG 그룹 참조 저장
      this.canvas.renderAll();
    },
    changeSvgColor(color) {
      if (!this.svgGroup) return;
      // SVG 그룹 내부의 모든 path/shape의 fill 변경
      this.svgGroup.forEachObject((obj) => {
        if (obj.set) obj.set("fill", color);
      });
      this.canvas.requestRenderAll();
    },
    renderDeleteIcon(ctx, left, top, _styleOverride, fabricObject) {
      const size = 28;
      const padding = 16;
      const hitSize = size + padding * 2;
      const img = new Image();
      img.src = deleteIcon;
      ctx.save();
      ctx.translate(left, top);
      ctx.rotate(util.degreesToRadians(fabricObject.angle));
      ctx.globalAlpha = 0.01;
      ctx.beginPath();
      ctx.arc(0, 0, hitSize / 2, 0, 2 * Math.PI);
      ctx.fillStyle = "#000";
      ctx.fill();
      ctx.globalAlpha = 1.0;
      ctx.drawImage(img, -size / 2, -size / 2, size, size);
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
      ctx.globalAlpha = 0.01;
      ctx.beginPath();
      ctx.arc(0, 0, hitSize / 2, 0, 2 * Math.PI);
      ctx.fillStyle = "#000";
      ctx.fill();
      ctx.globalAlpha = 1.0;
      ctx.drawImage(img, -size / 2, -size / 2, size, size);
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
      ctx.globalAlpha = 0.01;
      ctx.beginPath();
      ctx.arc(0, 0, hitSize / 2, 0, 2 * Math.PI);
      ctx.fillStyle = "#000";
      ctx.fill();
      ctx.globalAlpha = 1.0;
      ctx.drawImage(img, -size / 2, -size / 2, size, size);
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
      // "사용자가 추가한 이미지"만 카운트 (selectable !== false)
      const imageCount = this.canvas
        .getObjects()
        .filter(
          (obj) => obj.type === "image" && obj.selectable !== false
        ).length;
      if (imageCount >= 3) {
        alert("이미지는 최대 3개까지만 추가할 수 있습니다.");
        return;
      }
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

    onFileChange(event) {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      // "사용자가 추가한 이미지"만 카운트 (selectable !== false)
      let imageCount = this.canvas
        .getObjects()
        .filter(
          (obj) => obj.type === "image" && obj.selectable !== false
        ).length;

      if (imageCount >= 3) {
        alert("이미지는 최대 3개까지만 추가할 수 있습니다.");
        return;
      }

      // 항상 첫 번째 파일만 추가
      const file = files[0];
      if (!file) return;

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
    async initializeCanvas() {
      this.canvas = markRaw(
        new Canvas(this.$refs.canvas, {
          width: window.innerWidth,
          height: window.innerHeight,
          selection: true,
          backgroundColor: "#ffffff",
        })
      );

      // 인간 SVG 추가 (여기서 await!)
      await this.addHumanSvg();
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
      this.addSvgToCanvas();

      // 클릭 시 바로 선택 상태로
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
  mounted: async function () {
    await this.initializeCanvas();
  },
};
</script>

<style>
canvas {
  display: block;
}
</style>
