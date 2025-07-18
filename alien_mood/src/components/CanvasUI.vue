<template>
  <div class="relative">
    <!-- TopBar(툴바)는 항상 보임 -->
    <div
      class="TopBar h-[34px] flex items-center bg-gray-900 relative select-none"
    >
      <span
        class="absolute inset-0 flex items-center justify-center pointer-events-none text-[16px] text-[#9A9A9E]"
      >
        2025. 06. 08
      </span>
      <template v-if="!showPopup">
        <button
          class="text-green-300 flex absolute right-[20px] z-10"
          @click="openPopup"
        >
          <img src="@/assets/image/ui/download.svg" alt="" /> <span>완료</span>
        </button>
      </template>
      <template v-else>
        <button
          class="text-red-400 flex absolute left-[20px] z-10"
          @click="closePopup"
        >
          취소
        </button>
        <button
          class="text-blue-400 flex absolute right-[20px] z-10"
          @click="save"
        >
          저장
        </button>
      </template>
    </div>
    <!-- MainCanvas: 네비/패널은 showPopup이 true면 숨김 -->
    <div>
      <MainCanvas ref="mainCanvas" :hideUi="showPopup" />
    </div>
  </div>
</template>

<script>
import MainCanvas from "@/components/MainCanvas.vue";
export default {
  components: {
    MainCanvas,
  },
  data() {
    return {
      showPopup: false,
    };
  },
  methods: {
    openPopup() {
      this.showPopup = true;
    },
    closePopup() {
      this.showPopup = false;
    },
    save() {
      if (this.$refs.mainCanvas && this.$refs.mainCanvas.saveCanvasAsImage) {
        this.$refs.mainCanvas.saveCanvasAsImage();
      }
      this.showPopup = false;
    },
  },
};
</script>

<style>
.popup-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.popup-content {
  background: #fff;
  padding: 32px 24px;
  border-radius: 16px;
  text-align: center;
}
</style>
