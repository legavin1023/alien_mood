<style></style>
<template>
  <div>
    <!-- 탭 버튼 -->
    <div style="display: flex; gap: 10px; margin-bottom: 20px">
      <button
        v-for="(tab, index) in tabs"
        :key="index"
        @click="activeTab = index"
        :style="{
          padding: '10px 20px',
          backgroundColor: activeTab === index ? '#007BFF' : '#E0E0E0',
          color: activeTab === index ? 'white' : 'black',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }"
      >
        {{ tab.name }}
      </button>
    </div>

    <!-- 탭 내용 -->
    <div>
      <div>
        <h2>방문자 수</h2>
        <VisitorCounter></VisitorCounter>
      </div>
      <!-- <div v-if="activeTab === 0">
        <h2>Konva</h2>
        <TestKonva></TestKonva>
      </div>
      <div v-if="activeTab === 1">
        <h2>Fabric</h2>
        <TestFabric></TestFabric>
      </div>
      <div v-if="activeTab === 2">
        <h2>삭제 테스트</h2>
        <deleteTest></deleteTest>
      </div>
      <div v-if="activeTab === 3">
        <h2>점 테스트</h2>
        <rotationTest></rotationTest>
      </div> -->
      <div v-if="activeTab === 0">
        <h2>최종 테스트</h2>
        <TestFinal></TestFinal>
      </div>
      <div v-if="activeTab === 1">
        <h2>메인</h2>
        <MainCanvas></MainCanvas>
      </div>
    </div>
  </div>
</template>

<script>
// import TestKonva from "@/components/TEST/TestKonva.vue";
// import TestFabric from "@/components/TEST/TestFabric.vue";
// import deleteTest from "@/components/TEST/deleteTest.vue";
// import rotationTest from "@/components/TEST/rotationTest.vue";
import TestFinal from "@/components/TEST/TestFinal.vue";
import MainCanvas from "@/components/MainCanvas.vue";
import VisitorCounter from "@/components/VisitorCounter.vue";
export default {
  components: {
    // TestKonva,
    // TestFabric,
    // deleteTest,
    // rotationTest,
    TestFinal,
    MainCanvas,
    VisitorCounter,
  },
  data() {
    return {
      activeTab: 0, // 현재 활성화된 탭 (0부터 시작)
      tabs: [
        // { name: "Konva" },
        // { name: "Fabric" },
        // { name: "추가 삭제" },
        // { name: "삭제 회전 크기" },
        { name: "최종 테스트" },
        { name: "메인" },
      ],
    };
  },
};
</script>

<style>
/* 추가적인 스타일이 필요하면 여기에 작성하세요 */
</style>
