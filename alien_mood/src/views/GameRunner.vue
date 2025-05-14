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
      <div v-if="activeTab === 0">
        <h2>Konva</h2>
        <TestKonva></TestKonva>
      </div>
      <div v-if="activeTab === 1">
        <h2>Fabric</h2>
        <TestFabric></TestFabric>
      </div>
      <div v-if="activeTab === 2">
        <h2>탭 3 내용</h2>
        <p>이곳은 세 번째 탭의 내용입니다.</p>
      </div>
    </div>
  </div>
</template>

<script>
import TestKonva from "@/components/TestKonva.vue";
import TestFabric from "@/components/TestFabric.vue";

export default {
  components: {
    TestKonva,
    TestFabric,
  },
  data() {
    return {
      activeTab: 0, // 현재 활성화된 탭 (0부터 시작)
      tabs: [{ name: "Konva" }, { name: "Fabric" }, { name: "탭 3" }],
    };
  },
};
</script>

<style>
/* 추가적인 스타일이 필요하면 여기에 작성하세요 */
</style>
