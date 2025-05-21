<template>
  <div>
    <div v-for="(count, date) in dailyCounts" :key="date">
      {{ date }}: {{ count }}명
    </div>
    방문자 수: <b>{{ visitorCount }}</b>
  </div>
</template>

<script>
import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  get,
  runTransaction,
  onValue,
} from "firebase/database";

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyDdvQbWbBmkDWSJeivHI01mJTVSnnYctTs",
  authDomain: "alien-mood.firebaseapp.com",
  databaseURL: "https://alien-mood-default-rtdb.firebaseio.com",
  projectId: "alien-mood",
  storageBucket: "alien-mood.firebasestorage.app",
  messagingSenderId: "450783398597",
  appId: "1:450783398597:web:70b656cd69807231633eac",
  measurementId: "G-F6ZE81HPV7",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export default {
  name: "VisitorCounter",
  data() {
    return {
      visitorCount: 0,
      dailyCounts: {},
    };
  },
  mounted() {
    const countRef = ref(db, "visitorCount");
    // 전체 방문자 카운트 증가
    runTransaction(countRef, (current) => (current || 0) + 1);
    onValue(countRef, (snapshot) => {
      this.visitorCount = snapshot.val() || 0;
    });

    // 오늘 날짜 구하기 (YYYY-MM-DD)
    const today = new Date().toISOString().slice(0, 10);
    const todayRef = ref(db, `dailyCounts/${today}`);
    // 오늘 방문자 카운트 증가
    runTransaction(todayRef, (current) => (current || 0) + 1);

    // 날짜별 전체 카운트 가져오기
    const dailyCountsRef = ref(db, "dailyCounts");
    onValue(dailyCountsRef, (snapshot) => {
      if (snapshot.exists()) {
        this.dailyCounts = snapshot.val();
      }
    });
  },
};
</script>
