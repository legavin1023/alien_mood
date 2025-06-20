<template>
  <div class="relative">
    <div
      class="TopBar h-[34px] flex items-center bg-gray-900 relative select-none"
    >
      <span
        class="absolute inset-0 flex items-center justify-center pointer-events-none text-[16px] text-[#9A9A9E]"
      >
        2025. 06. 08
      </span>
      <button
        class="text-green-300 flex absolute right-[20px] z-10"
        @click="onComplete"
      >
        <img src="@/assets/image/ui/download.svg" alt="" /> <span>완료</span>
      </button>
    </div>
    <MainCanvas ref="mainCanvas"></MainCanvas>
    <div v-if="showPopup" class="popup-backdrop">
      <div class="popup-content">
        저장이 완료되었습니다!
        <button @click="closePopup">닫기</button>
      </div>
    </div>
    <MainCanvas ref="mainCanvas" :hideUi="showPopup" />
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
    penPopup() {
      this.showPopup = true;
      // 필요하다면 MainCanvas의 상태를 popupCanvas로 복사
    },
    closePopup() {
      this.showPopup = false;
    },
    save() {
      // 팝업 MainCanvas의 저장 메서드 호출
      this.$refs.popupCanvas.saveCanvasAsImage();
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
