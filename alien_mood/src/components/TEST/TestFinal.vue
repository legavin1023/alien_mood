<template>
  <!-- UI 패널: 이모티콘, 도형, 이미지, 옷, 색상, 포즈, 저장 버튼 등 -->

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
      <!-- 이모티콘 추가 버튼 -->
      <button
        v-for="img in additionalImages"
        :key="img.src"
        @click="addImage(img.src)"
        style="background: none; border: none; cursor: pointer"
      >
        <img :src="img.src" :alt="img.label" width="32" height="32" />
      </button>
      <!-- 도형 추가 버튼 -->
      <button @click="addRectangle">도형 추가</button>
      <button @click="addTextbox">텍스트 추가</button>
      <!-- 기본 이미지 교체 버튼 -->
      <button
        v-for="(img, idx) in predefinedImages"
        :key="'replace-img-' + idx"
        @click="replaceDefaultImage(img)"
      >
        기본 이미지 변경 {{ idx + 1 }}
      </button>
      <!-- 파일 첨부 버튼 -->
      <button @click="triggerFileInput">이미지 첨부</button>
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        style="display: none"
        @change="onFileChange"
      />
      <!-- SVG 색상 변경 버튼 (예시) -->
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
      <!-- 옷 색상 옵션 버튼 (입힌 옷이 있을 때만) -->
      <div v-if="selectedClothes" style="margin: 12px 0">
        <button
          v-for="(btn, idx) in selectedClothes.colorButtons"
          :key="btn.label + idx"
          @click="changeClothesColors(btn.targets, selectedClothes.name, idx)"
          style="display: flex; align-items: center; gap: 8px"
        >
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
      <!-- 캔버스 저장 버튼 -->
      <button @click="saveCanvasAsImage">이미지로 저장</button>
    </div>

    <!-- Fabric.js 캔버스 -->
    <canvas
      ref="canvas"
      style="border: 1px solid #ccc; width: 100%; height: 100%"
    ></canvas>
  </div>
</template>

<script>
// 이미지, SVG 등 리소스 import
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
  Group,
  IText,
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
import human from "@/assets/image/인간.svg";
import humanArm from "@/assets/image/인간팔.svg";

// Vue CLI/webpack용 require.context 사용
const svgContext = require.context("@/assets/image", false, /\.(svg|png|jpg)$/);

function getImageUrl(filename) {
  try {
    return svgContext("./" + filename);
  } catch {
    return "";
  }
}

import clothesDataRaw from "@/assets/data/clothes.json";
const clothesData = clothesDataRaw.default || clothesDataRaw;
const clothesListRaw = clothesData.clothesList || [];
const clothesList = clothesListRaw.map((item) => ({
  ...item,
  icon: getImageUrl(item.icon),
  svgUrl: Object.fromEntries(
    Object.entries(item.svgUrl).map(([k, v]) => [k, getImageUrl(v)])
  ),
}));

export default {
  data() {
    return {
      canvas: null, // Fabric.js 캔버스 인스턴스
      isRestoring: false, // 복원 중 여부
      predefinedImages: [image4, image5, image6], // 기본 이미지 목록
      additionalImages: [
        { src: image1, label: "에펙" },
        { src: image2, label: "일러" },
        { src: image3, label: "html" },
      ],
      defaultImageObject: null, // 교체 가능한 기본 이미지 오브젝트
      currentPose: "인간", // 현재 포즈 상태
      colorButtonList: [
        // SVG 색상 변경용 버튼 예시
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
      // 옷 목록 (포즈별 SVG, 위치, 색상 옵션 포함)
      clothesList,
      selectedClothes: null, // 현재 선택된 옷 데이터
      selectedColorIndexes: {}, // { [clothes.name]: index }
    };
  },
  methods: {
    async addHumanControlLayer() {
      // 기존 컨트롤 레이어가 있으면 삭제
      if (this.humanControlLayer) {
        this.canvas.remove(this.humanControlLayer);
        this.humanControlLayer = null;
      }
      if (!this.humanSvgGroup) return;

      const bounds = this.humanSvgGroup.getBoundingRect();
      const controlLayer = new Rect({
        left: this.humanSvgGroup.left,
        top: this.humanSvgGroup.top,
        width: bounds.width,
        height: bounds.height,
        originX: this.humanSvgGroup.originX,
        originY: this.humanSvgGroup.originY,
        // fill: "rgba(0,0,0,0)", // 완전 투명
        fill: "rgba(0,0,255,0.2)", // 디버깅용: 파란 반투명
        selectable: true,
        evented: true,
        hasControls: false,
        hasBorders: false,
        padding: 20,
      });
      this.addCustomControls(controlLayer);
      this.canvas.add(controlLayer);
      this.humanControlLayer = controlLayer;

      // 컨트롤 레이어 이동 시 캐릭터/옷 동기화
      controlLayer.on("moving", () => {
        this.humanSvgGroup.set({
          left: controlLayer.left,
          top: controlLayer.top,
        });
        if (this.clothesSvgGroup) {
          const pos = this.selectedClothes?.position?.[this.currentPose] || {
            left: 0,
            top: 0,
          };
          this.clothesSvgGroup.set({
            left: controlLayer.left + pos.left * controlLayer.scaleX,
            top: controlLayer.top + pos.top * controlLayer.scaleY,
          });
        }
        this.canvas.renderAll();
      });

      // 컨트롤 레이어 스케일 시 캐릭터/옷 동기화
      controlLayer.on("scaling", () => {
        this.humanSvgGroup.set({
          scaleX: controlLayer.scaleX,
          scaleY: controlLayer.scaleY,
          left: controlLayer.left,
          top: controlLayer.top,
        });
        if (this.clothesSvgGroup) {
          const pos = this.selectedClothes?.position?.[this.currentPose] || {
            left: 0,
            top: 0,
          };
          this.clothesSvgGroup.set({
            scaleX: controlLayer.scaleX,
            scaleY: controlLayer.scaleY,
            left: controlLayer.left + pos.left * controlLayer.scaleX,
            top: controlLayer.top + pos.top * controlLayer.scaleY,
          });
        }
        this.canvas.renderAll();
      });

      // ★ 컨트롤 레이어 회전 시 캐릭터/옷 동기화
      controlLayer.on("rotating", () => {
        this.humanSvgGroup.set({
          angle: controlLayer.angle,
        });
        if (this.clothesSvgGroup) {
          this.clothesSvgGroup.set({
            angle: controlLayer.angle,
          });
        }
        this.canvas.renderAll();
      });

      // // 캐릭터와 옷은 직접 선택 불가
      // this.humanSvgGroup.set({ selectable: false, evented: false });
      // if (this.clothesSvgGroup) {
      //   this.clothesSvgGroup.set({ selectable: false, evented: false });
      // }

      // 항상 z-index 정렬
      this.canvas.renderAll();
    },

    // 포즈에 따라 인간 SVG를 캔버스에 추가
    async addHumanSvg() {
      // 기존 인간 SVG가 있으면 삭제
      let prevLeft = 100;
      let prevTop = this.canvas.height / 2;
      let prevScaleX = 1;
      let prevScaleY = 1;
      let prevAngle = 0;
      if (this.humanSvgGroup) {
        // 기존 중심, 스케일, 각도 기억
        prevLeft = this.humanSvgGroup.left;
        prevTop = this.humanSvgGroup.top;
        prevScaleX = this.humanSvgGroup.scaleX;
        prevScaleY = this.humanSvgGroup.scaleY;
        prevAngle = this.humanSvgGroup.angle;
        this.canvas.remove(this.humanSvgGroup);
        this.humanSvgGroup = null;
      }
      const humanSvgUrl = this.currentPose === "인간팔" ? humanArm : human;
      const loadedSVG = await loadSVGFromURL(humanSvgUrl);
      let svgGroup = util.groupSVGElements(loadedSVG.objects);
      svgGroup.set({
        left: prevLeft,
        top: prevTop,
        originX: "center",
        originY: "center",
        scaleX: prevScaleX,
        scaleY: prevScaleY,
        angle: prevAngle,
        selectable: true,
        evented: true,
        hasControls: false,
        hasBorders: false,
        lockMovementX: false,
        lockMovementY: false,
        lockScalingX: false,
        lockScalingY: false,
        lockRotation: false,
      });

      this.addCustomControls(svgGroup);
      this.canvas.add(svgGroup);
      this.humanSvgGroup = svgGroup;
      this.addHumanMoveListener();
      await this.addHumanControlLayer();
      this.canvas.renderAll();
    },
    // 옷 선택 시 캔버스에 추가 (포즈별 SVG/위치 적용)
    async selectClothes(clothes) {
      if (this.clothesSvgGroup) {
        this.canvas.remove(this.clothesSvgGroup);
      }
      const svgUrl =
        typeof clothes.svgUrl === "object"
          ? clothes.svgUrl[this.currentPose] || clothes.svgUrl["인간"]
          : clothes.svgUrl;
      const loadedSVG = await loadSVGFromURL(svgUrl);
      let svgGroup = util.groupSVGElements(loadedSVG.objects);

      // 인간 SVG 기준 + 옷 position 값 더해서 위치/스케일 맞추기
      const human = this.humanSvgGroup;
      const pos = clothes.position?.[this.currentPose] || { left: 0, top: 0 };

      // 옷 그룹을 인간과 완전히 동일하게 맞춤
      svgGroup.set({
        left: human.left,
        top: human.top,
        originX: human.originX,
        originY: human.originY,
        scaleX: human.scaleX,
        scaleY: human.scaleY,
        angle: human.angle,
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

      // 옷 내부 오브젝트에만 offset 적용
      svgGroup.forEachObject((obj) => {
        obj.left += pos.left;
        obj.top += pos.top;
      });
      svgGroup.setCoords();
      this.canvas.add(svgGroup);
      this.clothesSvgGroup = svgGroup;
      this.selectedClothes = clothes;
      this.canvas.renderAll();

      // 마지막으로 선택한 색상 옵션 적용
      const idx = this.selectedColorIndexes[clothes.name] ?? 0;
      const btn = clothes.colorButtons[idx];
      if (btn) {
        this.changeClothesColors(btn.targets, clothes.name, idx);
      }
      await this.addHumanControlLayer();
    },
    // 인간을 움직일 때 옷도 같이 움직이게 이벤트 연결
    addHumanMoveListener() {
      if (!this.humanSvgGroup) return;
      this.humanSvgGroup.set({ selectable: true, evented: true });

      // 이동 시 옷 따라오기
      this.humanSvgGroup.on("moving", () => {
        if (this.clothesSvgGroup && this.selectedClothes) {
          const pos = this.selectedClothes.position?.[this.currentPose] || {
            left: 0,
            top: 0,
          };
          this.clothesSvgGroup.set({
            left:
              this.humanSvgGroup.left + pos.left * this.humanSvgGroup.scaleX,
            top: this.humanSvgGroup.top + pos.top * this.humanSvgGroup.scaleY,
          });
          this.canvas.renderAll();
        }
      });

      // 크기 조절(스케일) 시 옷도 같이 스케일
      this.humanSvgGroup.on("scaling", () => {
        if (this.clothesSvgGroup && this.selectedClothes) {
          // scaleX, scaleY 동기화
          this.clothesSvgGroup.set({
            scaleX: this.humanSvgGroup.scaleX,
            scaleY: this.humanSvgGroup.scaleY,
          });
          // 위치도 스케일에 맞게 보정
          const pos = this.selectedClothes.position?.[this.currentPose] || {
            left: 0,
            top: 0,
          };
          this.clothesSvgGroup.set({
            left:
              this.humanSvgGroup.left + pos.left * this.humanSvgGroup.scaleX,
            top: this.humanSvgGroup.top + pos.top * this.humanSvgGroup.scaleY,
          });
          this.canvas.renderAll();
        }
      });
    },
    // 포즈 변경 시 인간/옷 SVG 갱신
    async changePose(pose) {
      this.currentPose = pose;
      if (this.humanSvgGroup) this.canvas.remove(this.humanSvgGroup);
      if (this.clothesSvgGroup) this.canvas.remove(this.clothesSvgGroup);
      await this.addHumanSvg();
      if (this.selectedClothes) {
        await this.selectClothes(this.selectedClothes);
      }
      await this.addHumanControlLayer();
    },
    // 옷 SVG 색상 변경 (id/class 모두 지원, 재귀 순회)
    changeClothesColors(targets, clothesName, idx) {
      if (!this.clothesSvgGroup) return;
      // 색상 적용
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

      // 선택된 색상 인덱스 저장
      this.selectedColorIndexes = {
        ...this.selectedColorIndexes,
        [clothesName]: idx,
      };
    },

    // 캔버스 이미지를 파일로 저장 (파일명 입력 가능, 기본값: 오늘기분외계인)
    saveCanvasAsImage() {
      let filename = prompt("저장할 파일 이름을 입력하세요.", "오늘기분외계인");
      if (!filename || filename.trim() === "") {
        filename = "오늘기분외계인";
      }
      if (!filename.endsWith(".jpg") && !filename.endsWith(".png")) {
        filename += ".jpg";
      }
      const dataUrl = this.canvas.toDataURL({
        format: "jpg",
        quality: 1.0,
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    // 일반 SVG 색상 변경 (id 기준)
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
    // 일반 SVG 추가 (예시)
    async addSvgToCanvas() {
      const loadedSVG = await loadSVGFromURL(svgUrl);
      let svgGroup = util.groupSVGElements(loadedSVG.objects);
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
      this.svgGroup = svgGroup;
      this.canvas.renderAll();
    },
    // 일반 SVG 전체 색상 변경 (예시)
    changeSvgColor(color) {
      if (!this.svgGroup) return;
      this.svgGroup.forEachObject((obj) => {
        if (obj.set) obj.set("fill", color);
      });
      this.canvas.requestRenderAll();
    },
    // 커스텀 컨트롤(삭제/회전/크기조절) 렌더링 함수들
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
    // 오브젝트 삭제 핸들러
    deleteObject(_eventData, transform) {
      const canvasInstance = transform.target.canvas;
      // 텍스트에 배경이 연결되어 있으면 같이 삭제
      if (
        transform.target.type === "i-text" &&
        transform.target._bgRect &&
        canvasInstance.contains(transform.target._bgRect)
      ) {
        canvasInstance.remove(transform.target._bgRect);
      }
      canvasInstance.remove(transform.target);
      canvasInstance.requestRenderAll();
    },
    // 커스텀 컨트롤 추가
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
        y: -0.5,
        offsetY: -40,
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
        // editable: true, // ← 이 줄은 필요 없음!
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
    // 도형(사각형) 추가
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
    // 텍스트 추가
    addTextbox() {
      const text =
        "1.캐릭터 삭제버튼 없애기 2. 편집창 와리가리 4. 방문자 카운팅 ";
      const padding = 24;
      const textbox = new IText(text, {
        left: this.canvas.width / 2,
        top: this.canvas.height / 2,
        originX: "center",
        originY: "center",
        fontSize: 32,
        fill: "#222",
        fontFamily: "sans-serif",
        editable: true,
        selectable: true,
        evented: true,
        hasControls: false,
        hasBorders: false,
        backgroundColor: "transparent",
        textAlign: "center",
      });

      // 배경 사각형 생성
      const bgRect = new Rect({
        left: textbox.left,
        top: textbox.top,
        originX: "center",
        originY: "center",
        width: textbox.width + padding * 2,
        height: textbox.height + padding * 2,
        rx: 18,
        ry: 18,
        fill: "#fffbe6",
        selectable: false,
        evented: false,
        hasBorders: false,
        hasControls: false,
      });

      // 텍스트에 배경 참조 저장
      textbox._bgRect = bgRect;

      this.canvas.add(bgRect);
      this.canvas.add(textbox);

      // 항상 텍스트 바로 아래에 배경이 오도록 순서 조정 함수
      const ensureBgBelowText = () => {
        const objs = this.canvas.getObjects();
        const bgIdx = objs.indexOf(bgRect);
        const textIdx = objs.indexOf(textbox);
        if (bgIdx > -1 && textIdx > -1 && bgIdx !== textIdx - 1) {
          objs.splice(bgIdx, 1);
          objs.splice(textIdx, 0, bgRect);
          this.canvas._objects = objs;
        }
      };

      // 텍스트 이동/수정/스케일/회전 시 배경도 같이 이동 및 크기 조정
      const updateBgRect = () => {
        textbox.setCoords();
        bgRect.set({
          width: textbox.width * textbox.scaleX + padding * 2,
          height: textbox.height * textbox.scaleY + padding * 2,
          left: textbox.left,
          top: textbox.top,
          scaleX: 1,
          scaleY: 1,
          angle: textbox.angle,
        });
        ensureBgBelowText();
        this.canvas.requestRenderAll();
      };

      // 이벤트 연결
      textbox.on("changed", updateBgRect);
      textbox.on("scaling", updateBgRect);
      textbox.on("moving", updateBgRect);
      textbox.on("rotating", updateBgRect);

      // 최초 위치/순서 보장
      ensureBgBelowText();

      this.addCustomControls(textbox);
      this.canvas.setActiveObject(textbox);
      this.canvas.renderAll();
    },

    // 이미지 추가 (최대 3개)
    addImage(imageSrc) {
      const img = new window.Image();
      img.src = imageSrc;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        // 가로가 400px을 넘으면 비율 유지하며 축소
        if (width > 400) {
          const scale = 400 / width;
          width = 400;
          height = height * scale;
        }
        const fabricImage = new FabricImage(img, {
          left: this.canvas.width / 2,
          top: this.canvas.height / 2,
          originX: "center",
          originY: "center",
          width,
          height,
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
    // 파일 첨부로 이미지 추가
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
          let width = img.width;
          let height = img.height;
          let scale = 1;
          // 가로가 400px을 넘으면 비율 유지하며 축소 (scale만 조정)
          if (width > 400) {
            scale = 400 / width;
          }
          const fabricImage = new FabricImage(img, {
            left: this.canvas.width / 2,
            top: this.canvas.height / 2,
            originX: "center",
            originY: "center",
            // 원본 width/height 유지
            width: width,
            height: height,
            scaleX: scale,
            scaleY: scale,
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
    // 기본 이미지 교체
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
    // 파일 첨부 input 트리거
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    // 캔버스 초기화 및 기본 오브젝트 추가
    async initializeCanvas() {
      this.canvas = markRaw(
        new Canvas(this.$refs.canvas, {
          width: window.innerWidth,
          height: window.innerHeight,
          selection: true,
          backgroundColor: "#ffffff",
        })
      );
      this.canvas.on("after:render", () => {
        const ctx = this.canvas.getContext();
        const objs = this.canvas.getObjects();
        objs.forEach((obj, idx) => {
          // 오브젝트의 좌상단 좌표 계산
          const p = obj.getPointByOrigin
            ? obj.getPointByOrigin("left", "top")
            : { x: obj.left, y: obj.top };
          ctx.save();
          ctx.font = "bold 18px sans-serif";
          ctx.fillStyle = "red";
          ctx.strokeStyle = "white";
          ctx.lineWidth = 3;
          ctx.strokeText(idx + "", p.x + 8, p.y + 24);
          ctx.fillText(idx + "", p.x + 8, p.y + 24);
          ctx.restore();
        });
      });
      // 기본 이미지 추가
      const img = new window.Image();
      img.src = this.predefinedImages[0];
      img.onload = async () => {
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

        // 기본 이미지가 추가된 후 인간 추가
        await this.addHumanSvg();
        await this.addHumanControlLayer();
        this.addSvgToCanvas();
      };

      // mouse:up 이벤트는 한 번만 등록!
      this.canvas.on("mouse:down", (opt) => {
        const target = this.canvas.getActiveObject();
        const objs = this.canvas.getObjects();

        // 1. 기본 이미지는 항상 맨 아래
        if (this.defaultImageObject) {
          const idx = objs.indexOf(this.defaultImageObject);
          if (idx > -1) {
            objs.splice(idx, 1);
            objs.unshift(this.defaultImageObject);
          }
        }

        // 캐릭터(인간 SVG 그룹)만 클릭 시 셋을 동시에 맨 위로!
        if (target === this.humanSvgGroup) {
          [
            this.humanSvgGroup,
            this.humanControlLayer,
            this.clothesSvgGroup,
          ].forEach((obj) => {
            const idx = objs.indexOf(obj);
            if (idx > -1) objs.splice(idx, 1);
          });
          if (this.humanSvgGroup) objs.push(this.humanSvgGroup);
          if (this.humanControlLayer) objs.push(this.humanControlLayer);
          if (this.clothesSvgGroup) objs.push(this.clothesSvgGroup);

          this.canvas._objects = objs;
          this.canvas.renderAll();
          return;
        }
        // 2. 캐릭터 3종 중 하나라도 클릭하면 셋을 동시에 맨 위로!
        const isHumanPart = [
          this.humanControlLayer,
          this.humanSvgGroup,
          this.clothesSvgGroup,
        ].includes(target);

        if (isHumanPart) {
          [
            this.humanSvgGroup,
            this.humanControlLayer,
            this.clothesSvgGroup,
          ].forEach((obj) => {
            const idx = objs.indexOf(obj);
            if (idx > -1) objs.splice(idx, 1);
          });
          if (this.humanSvgGroup) objs.push(this.humanSvgGroup);
          if (this.humanControlLayer) objs.push(this.humanControlLayer);
          if (this.clothesSvgGroup) objs.push(this.clothesSvgGroup);
        } else if (
          target &&
          ![
            this.humanControlLayer,
            this.humanSvgGroup,
            this.clothesSvgGroup,
            this.defaultImageObject,
          ].includes(target)
        ) {
          const idx = objs.indexOf(target);
          if (idx > -1) {
            objs.splice(idx, 1);
            objs.push(target);
          }
        }

        this.canvas._objects = objs;
        this.canvas.renderAll();
      });
    },
  },
  // 컴포넌트 마운트 시 캔버스 초기화
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
