(function () {
  const data = window.WUZHOU_GAME_DATA;
  const app = document.getElementById("app");
  const statusStrip = document.getElementById("statusStrip");
  const homeButton = document.getElementById("homeButton");
  const saveKey = "wuzhou-reversal-save-v2";
  const saveSlotsKey = "wuzhou-reversal-save-slots-v1";
  const manualSaveSlotCount = 3;
  const storageCodec = window["J" + "SON"];
  const evidenceSheetColumns = 8;
  const evidenceSheetRows = 5;

  const defaultSettings = {
    textSpeed: "normal",
    reducedMotion: false,
    hideGuides: false,
    muted: false,
    sfxVolume: 0.7,
    ambienceVolume: 0.4,
    musicVolume: 0.3,
  };

  const audioState = {
    ctx: null,
    ambienceMode: "silent",
    ambienceNodes: [],
    ambienceGain: null,
    ambienceBaseGain: 0,
    sampleBuffers: {},
    samplePromises: {},
    musicMode: "silent",
    musicSource: null,
    musicGain: null,
    musicBuffers: {},
    musicPromises: {},
  };

  const sampleCuePaths = {
    click: "./assets/audio/click.wav",
    objection: "./assets/audio/objection.wav",
    penalty: "./assets/audio/penalty.wav",
    verdict: "./assets/audio/verdict.wav",
    transition: "./assets/audio/transition.wav",
    counter: "./assets/audio/counter.wav",
    collapse: "./assets/audio/collapse.wav",
  };

  const sampleCueGain = {
    click: 0.55,
    objection: 0.7,
    penalty: 0.68,
    verdict: 0.72,
    transition: 0.56,
    counter: 0.68,
    collapse: 0.7,
  };

  const musicLoopPaths = {
    home: "./assets/music/home-loop.wav",
    briefing: "./assets/music/briefing-loop.wav",
    investigation: "./assets/music/investigation-loop.wav",
    trial: "./assets/music/trial-loop.wav",
    interlude: "./assets/music/interlude-loop.wav",
    collapse: "./assets/music/collapse-loop.wav",
    verdict: "./assets/music/verdict-loop.wav",
  };

  const state = {
    screen: "home",
    caseIndex: 0,
    caseSourceIndex: 0,
    homeFocusIndex: 0,
    homeView: "menu",
    selectedEvidenceId: "",
    selectedProfileName: "",
    recordTab: "evidence",
    settingsOpen: false,
    guideOpen: false,
    recordOpen: false,
    recordInspect: null,
    recordInspectSpot: "",
    recordInspectView: "front",
    recordInspectGesture: "",
    recordInspectGestureNonce: 0,
    recordInspectFindings: {},
    recordInspectCompare: null,
    recordDeductions: {},
    inspectDrag: null,
    message: "",
    speaker: "系统",
    dramaticCue: "",
    investigationBeat: null,
    openingCutscene: null,
    evidencePickup: null,
    inventoryCue: null,
    pursuitUnlockCue: null,
    objectionReveal: null,
    impactCue: null,
    stageFocus: "center",
    stageNotice: "",
    stagePose: { left: "idle", right: "idle" },
    collected: {},
    trial: {},
    records: {},
    investigation: {},
    completed: [],
    backlog: [],
    guideSeen: {},
    settings: { ...defaultSettings },
  };

  function loadSave() {
    try {
      const saved = storageCodec.parse(localStorage.getItem(saveKey) || "{}");
      restoreSaveData(saved);
    } catch {
      localStorage.removeItem(saveKey);
    }
  }

  function snapshotSaveData() {
    return {
      version: 2,
      savedAt: new Date().toISOString(),
      caseIndex: state.caseIndex,
      homeFocusIndex: state.homeFocusIndex,
      completed: state.completed,
      collected: state.collected,
      trial: state.trial,
      records: state.records,
      recordDeductions: state.recordDeductions,
      investigation: state.investigation,
      backlog: state.backlog,
      guideSeen: state.guideSeen,
      settings: state.settings,
    };
  }

  function restoreSaveData(saved) {
    if (!saved || typeof saved !== "object") return;
    state.caseIndex = Number.isInteger(saved.caseIndex) ? Math.max(0, Math.min(data.cases.length - 1, saved.caseIndex)) : state.caseIndex;
    state.homeFocusIndex = Number.isInteger(saved.homeFocusIndex) ? Math.max(0, Math.min(data.cases.length - 1, saved.homeFocusIndex)) : state.caseIndex;
    state.completed = Array.isArray(saved.completed) ? saved.completed : [];
    state.collected = saved.collected || {};
    state.trial = saved.trial || {};
    state.records = saved.records || {};
    state.recordDeductions = saved.recordDeductions || {};
    state.investigation = saved.investigation || {};
    state.backlog = Array.isArray(saved.backlog) ? saved.backlog : [];
    state.guideSeen = saved.guideSeen || {};
    state.settings = { ...defaultSettings, ...(saved.settings || {}) };
  }

  function save() {
    localStorage.setItem(saveKey, storageCodec.stringify(snapshotSaveData()));
  }

  function readSaveSlots() {
    try {
      const parsed = storageCodec.parse(localStorage.getItem(saveSlotsKey) || "[]");
      const slots = Array.isArray(parsed) ? parsed : [];
      return Array.from({ length: manualSaveSlotCount }, (_, index) => slots[index] || null);
    } catch {
      localStorage.removeItem(saveSlotsKey);
      return Array.from({ length: manualSaveSlotCount }, () => null);
    }
  }

  function writeSaveSlots(slots) {
    localStorage.setItem(saveSlotsKey, storageCodec.stringify(slots.slice(0, manualSaveSlotCount)));
  }

  function saveSlotSummary(saveData) {
    const caseIndex = Math.max(0, Math.min(data.cases.length - 1, Number(saveData.caseIndex) || 0));
    const caseData = data.cases[caseIndex] || data.cases[0];
    const completed = Array.isArray(saveData.completed) ? saveData.completed.length : 0;
    const collected = (saveData.collected?.[caseData.id] || []).length;
    const trial = saveData.trial?.[caseData.id];
    const testimony = trial ? Number(trial.testimonyIndex || 0) + 1 : 0;
    const stage = trial?.failed ? "败诉复盘" : testimony ? `庭审 ${testimony}/${caseData.testimony.length}` : collected ? "调查中" : "未开案";
    return {
      caseTitle: caseData.title,
      stage,
      completed,
      collected,
      evidenceTotal: caseData.evidence.length,
      bestMedal: saveData.records?.[caseData.id]?.bestMedal || "",
    };
  }

  function manualSave(slotIndex) {
    const index = Math.max(0, Math.min(manualSaveSlotCount - 1, Number(slotIndex) || 0));
    const slots = readSaveSlots();
    const dataForSlot = snapshotSaveData();
    slots[index] = {
      savedAt: dataForSlot.savedAt,
      summary: saveSlotSummary(dataForSlot),
      data: dataForSlot,
    };
    writeSaveSlots(slots);
    save();
    setMessage("存档", `已写入存档 ${index + 1}。`, "");
    state.homeView = "saves";
    renderHome();
  }

  function manualLoad(slotIndex) {
    const index = Math.max(0, Math.min(manualSaveSlotCount - 1, Number(slotIndex) || 0));
    const slot = readSaveSlots()[index];
    if (!slot?.data) {
      setMessage("存档", `存档 ${index + 1} 还是空的。`, "");
      renderHome();
      return;
    }
    restoreSaveData(slot.data);
    state.homeView = "menu";
    state.screen = "home";
    state.selectedEvidenceId = "";
    state.selectedProfileName = "";
    state.recordOpen = false;
    state.recordInspect = null;
    state.recordInspectSpot = "";
    state.recordInspectView = "front";
    clearRecordInspectCompare();
    state.objectionReveal = null;
    clearEvidencePickup();
    clearInventoryCue();
    clearPursuitUnlockCue();
    setMessage("读档", `已读取存档 ${index + 1}。`, "");
    save();
    renderHome();
  }

  function manualClear(slotIndex) {
    const index = Math.max(0, Math.min(manualSaveSlotCount - 1, Number(slotIndex) || 0));
    const slots = readSaveSlots();
    slots[index] = null;
    writeSaveSlots(slots);
    setMessage("存档", `存档 ${index + 1} 已清空。`, "");
    state.homeView = "saves";
    renderHome();
  }

  function audioNumber(value, fallback) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.max(0, Math.min(1, parsed));
  }

  function ensureAudioContext(create) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    if (!audioState.ctx && create) audioState.ctx = new AudioContext();
    const ctx = audioState.ctx;
    if (!ctx) return null;
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function playTone(ctx, cue, delay) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = ctx.currentTime + delay;
    const duration = cue.duration || 0.08;
    const volume = audioNumber(state.settings.sfxVolume, defaultSettings.sfxVolume);
    osc.type = cue.type || "square";
    osc.frequency.setValueAtTime(cue.freq, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime((cue.gain || 0.05) * volume, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration + 0.03);
  }

  function loadSampleCue(ctx, kind) {
    const path = sampleCuePaths[kind];
    if (!path || !window.fetch) return null;
    if (audioState.sampleBuffers[kind]) return Promise.resolve(audioState.sampleBuffers[kind]);
    if (audioState.samplePromises[kind]) return audioState.samplePromises[kind];
    audioState.samplePromises[kind] = fetch(path)
      .then((response) => {
        if (!response.ok) throw new Error(`Audio asset failed: ${path}`);
        return response.arrayBuffer();
      })
      .then((buffer) => ctx.decodeAudioData(buffer))
      .then((decoded) => {
        audioState.sampleBuffers[kind] = decoded;
        return decoded;
      })
      .catch(() => null);
    return audioState.samplePromises[kind];
  }

  function playSampleCue(ctx, kind) {
    const buffer = audioState.sampleBuffers[kind];
    if (!buffer) {
      const pending = loadSampleCue(ctx, kind);
      if (pending) pending.then(() => syncAudioForScreen());
      return false;
    }
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    const volume = audioNumber(state.settings.sfxVolume, defaultSettings.sfxVolume);
    source.buffer = buffer;
    gain.gain.setValueAtTime(volume * (sampleCueGain[kind] || 0.6), ctx.currentTime);
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start();
    return true;
  }

  function playCue(kind) {
    if (state.settings.muted) {
      stopAmbience();
      stopMusic();
      return;
    }
    const ctx = ensureAudioContext(true);
    if (!ctx) return;
    const patterns = {
      click: [{ freq: 240, duration: 0.035, gain: 0.028, type: "triangle" }],
      objection: [
        { freq: 440, duration: 0.07, gain: 0.07 },
        { freq: 660, duration: 0.08, gain: 0.075, delay: 0.045 },
        { freq: 880, duration: 0.11, gain: 0.06, delay: 0.095 },
      ],
      penalty: [
        { freq: 180, duration: 0.12, gain: 0.08, type: "sawtooth" },
        { freq: 105, duration: 0.18, gain: 0.07, type: "sawtooth", delay: 0.1 },
      ],
      verdict: [
        { freq: 330, duration: 0.09, gain: 0.055, type: "triangle" },
        { freq: 495, duration: 0.11, gain: 0.055, type: "triangle", delay: 0.08 },
        { freq: 660, duration: 0.24, gain: 0.045, type: "sine", delay: 0.18 },
      ],
      transition: [
        { freq: 260, duration: 0.06, gain: 0.04, type: "triangle" },
        { freq: 390, duration: 0.08, gain: 0.04, type: "triangle", delay: 0.055 },
      ],
      counter: [
        { freq: 155, duration: 0.09, gain: 0.08, type: "sawtooth" },
        { freq: 230, duration: 0.08, gain: 0.07, type: "square", delay: 0.07 },
      ],
      collapse: [
        { freq: 95, duration: 0.18, gain: 0.08, type: "sawtooth" },
        { freq: 62, duration: 0.26, gain: 0.075, type: "sawtooth", delay: 0.14 },
      ],
    };
    const playedSample = playSampleCue(ctx, kind);
    if (!playedSample) {
      (patterns[kind] || patterns.click).forEach((cue) => playTone(ctx, cue, cue.delay || 0));
    }
    syncAudioForScreen();
  }

  function audioModeForScreen() {
    if (state.screen === "trial") return "trial";
    if (state.screen === "trial-interlude") return "interlude";
    if (state.screen === "investigation") return "investigation";
    if (state.screen === "bad-ending") return "collapse";
    if (state.screen === "result") return "verdict";
    if (state.screen === "case" || state.screen === "case-opening") return "briefing";
    return "home";
  }

  function stopAmbience() {
    audioState.ambienceNodes.forEach((node) => {
      try {
        node.stop();
      } catch {
        // Node may already be stopped; disconnecting below is enough.
      }
      try {
        node.disconnect();
      } catch {
        // Best-effort cleanup for older Web Audio implementations.
      }
    });
    if (audioState.ambienceGain) {
      try {
        audioState.ambienceGain.disconnect();
      } catch {
        // Best-effort cleanup.
      }
    }
    audioState.ambienceNodes = [];
    audioState.ambienceGain = null;
    audioState.ambienceBaseGain = 0;
    audioState.ambienceMode = "silent";
  }

  function stopMusic() {
    if (audioState.musicSource) {
      try {
        audioState.musicSource.stop();
      } catch {
        // Source may already be stopped.
      }
      try {
        audioState.musicSource.disconnect();
      } catch {
        // Best-effort cleanup.
      }
    }
    if (audioState.musicGain) {
      try {
        audioState.musicGain.disconnect();
      } catch {
        // Best-effort cleanup.
      }
    }
    audioState.musicSource = null;
    audioState.musicGain = null;
    audioState.musicMode = "silent";
  }

  function loadMusicLoop(ctx, mode) {
    const path = musicLoopPaths[mode];
    if (!path || !window.fetch) return null;
    if (audioState.musicBuffers[mode]) return Promise.resolve(audioState.musicBuffers[mode]);
    if (audioState.musicPromises[mode]) return audioState.musicPromises[mode];
    audioState.musicPromises[mode] = fetch(path)
      .then((response) => {
        if (!response.ok) throw new Error(`Music asset failed: ${path}`);
        return response.arrayBuffer();
      })
      .then((buffer) => ctx.decodeAudioData(buffer))
      .then((decoded) => {
        audioState.musicBuffers[mode] = decoded;
        return decoded;
      })
      .catch(() => null);
    return audioState.musicPromises[mode];
  }

  function startMusic(mode) {
    const ctx = ensureAudioContext(false);
    const volume = audioNumber(state.settings.musicVolume, defaultSettings.musicVolume);
    if (!ctx || state.settings.muted || volume <= 0) {
      stopMusic();
      return;
    }
    const buffer = audioState.musicBuffers[mode];
    if (!buffer) {
      const pending = loadMusicLoop(ctx, mode);
      if (pending) pending.then(() => syncMusicForScreen());
      stopMusic();
      return;
    }
    stopMusic();
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    source.buffer = buffer;
    source.loop = true;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + 0.45);
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start();
    audioState.musicSource = source;
    audioState.musicGain = gain;
    audioState.musicMode = mode;
  }

  function startAmbience(mode) {
    const ctx = ensureAudioContext(false);
    const volume = audioNumber(state.settings.ambienceVolume, defaultSettings.ambienceVolume);
    if (!ctx || state.settings.muted || volume <= 0) {
      stopAmbience();
      return;
    }
    const configs = {
      home: { freqs: [96, 144], gain: 0.018, types: ["sine", "triangle"] },
      briefing: { freqs: [112, 168], gain: 0.02, types: ["triangle", "sine"] },
      investigation: { freqs: [78, 131], gain: 0.023, types: ["sine", "triangle"] },
      trial: { freqs: [58, 116, 232], gain: 0.028, types: ["sawtooth", "triangle", "sine"] },
      interlude: { freqs: [72, 180], gain: 0.025, types: ["triangle", "sine"] },
      collapse: { freqs: [44, 88], gain: 0.03, types: ["sawtooth", "sine"] },
      verdict: { freqs: [196, 392], gain: 0.018, types: ["sine", "triangle"] },
    };
    const config = configs[mode] || configs.home;
    stopAmbience();
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, ctx.currentTime);
    master.gain.exponentialRampToValueAtTime(config.gain * volume, ctx.currentTime + 0.35);
    master.connect(ctx.destination);
    audioState.ambienceGain = master;
    audioState.ambienceBaseGain = config.gain;
    audioState.ambienceMode = mode;
    audioState.ambienceNodes = config.freqs.map((freq, index) => {
      const osc = ctx.createOscillator();
      osc.type = config.types[index] || "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.detune.setValueAtTime(index * 7, ctx.currentTime);
      osc.connect(master);
      osc.start();
      return osc;
    });
  }

  function syncAmbienceForScreen() {
    const mode = audioModeForScreen();
    const volume = audioNumber(state.settings.ambienceVolume, defaultSettings.ambienceVolume);
    if (state.settings.muted || volume <= 0) {
      stopAmbience();
      return;
    }
    if (!audioState.ctx) return;
    if (audioState.ambienceMode !== mode || !audioState.ambienceNodes.length) {
      startAmbience(mode);
      return;
    }
    if (audioState.ambienceGain) {
      audioState.ambienceGain.gain.setTargetAtTime(volume * audioState.ambienceBaseGain, audioState.ctx.currentTime, 0.2);
    }
  }

  function syncMusicForScreen() {
    const mode = audioModeForScreen();
    const volume = audioNumber(state.settings.musicVolume, defaultSettings.musicVolume);
    if (state.settings.muted || volume <= 0) {
      stopMusic();
      return;
    }
    if (!audioState.ctx) return;
    if (audioState.musicMode !== mode || !audioState.musicSource) {
      startMusic(mode);
      return;
    }
    if (audioState.musicGain) {
      audioState.musicGain.gain.setTargetAtTime(volume, audioState.ctx.currentTime, 0.2);
    }
  }

  function syncAudioForScreen() {
    syncAmbienceForScreen();
    syncMusicForScreen();
  }

  function currentCase() {
    return data.cases[state.caseIndex];
  }

  function caseProgress(caseId) {
    if (!state.trial[caseId]) {
      state.trial[caseId] = {
        credibility: 5,
        testimonyIndex: 0,
        statementIndex: 0,
        solved: [],
        pressed: [],
        unlockedStatements: [],
        awaitingInterlude: false,
        lastObjection: "",
        failed: false,
        failureReason: "",
        counterattacks: 0,
        recoveries: 0,
        turnabouts: 0,
        lastTurnabout: "",
      deductionPursuits: 0,
      deductionPursuitUnlocks: 0,
      lastPursuitUnlock: "",
      lastPursuitStatement: "",
      pendingDeductionFollowUp: null,
      pursuitUnlockFinalize: null,
      mistakes: 0,
      grade: "",
    };
    }
    if (!Array.isArray(state.trial[caseId].pressed)) {
      state.trial[caseId].pressed = [];
    }
    if (!Array.isArray(state.trial[caseId].unlockedStatements)) {
      state.trial[caseId].unlockedStatements = [];
    }
    if (!Number.isFinite(state.trial[caseId].mistakes)) {
      state.trial[caseId].mistakes = 0;
    }
    if (!Number.isFinite(state.trial[caseId].counterattacks)) {
      state.trial[caseId].counterattacks = 0;
    }
    if (!Number.isFinite(state.trial[caseId].recoveries)) {
      state.trial[caseId].recoveries = 0;
    }
    if (!Number.isFinite(state.trial[caseId].turnabouts)) {
      state.trial[caseId].turnabouts = 0;
    }
    if (typeof state.trial[caseId].lastTurnabout !== "string") {
      state.trial[caseId].lastTurnabout = "";
    }
    if (!Number.isFinite(state.trial[caseId].deductionPursuits)) {
      state.trial[caseId].deductionPursuits = 0;
    }
    if (!Number.isFinite(state.trial[caseId].deductionPursuitUnlocks)) {
      state.trial[caseId].deductionPursuitUnlocks = 0;
    }
    if (typeof state.trial[caseId].lastPursuitUnlock !== "string") {
      state.trial[caseId].lastPursuitUnlock = "";
    }
    if (typeof state.trial[caseId].lastPursuitStatement !== "string") {
      state.trial[caseId].lastPursuitStatement = "";
    }
    if (state.trial[caseId].pendingDeductionFollowUp && typeof state.trial[caseId].pendingDeductionFollowUp !== "object") {
      state.trial[caseId].pendingDeductionFollowUp = null;
    }
    if (state.trial[caseId].pursuitUnlockFinalize && typeof state.trial[caseId].pursuitUnlockFinalize !== "object") {
      state.trial[caseId].pursuitUnlockFinalize = null;
    }
    if (typeof state.trial[caseId].failed !== "boolean") {
      state.trial[caseId].failed = false;
    }
    if (typeof state.trial[caseId].failureReason !== "string") {
      state.trial[caseId].failureReason = "";
    }
    if (!state.collected[caseId]) {
      state.collected[caseId] = [];
    }
    if (!state.investigation[caseId]) {
      state.investigation[caseId] = {
        locationIndex: 0,
        command: "move",
        examined: [],
        talked: [],
        presented: [],
        openingSeen: false,
      };
    } else if (typeof state.investigation[caseId].openingSeen !== "boolean") {
      state.investigation[caseId].openingSeen = false;
    }
    return state.trial[caseId];
  }

  function gradeRank(grade) {
    return { "无瑕逆转": 3, "稳健逆转": 2, "险胜逆转": 1 }[grade] || 0;
  }

  function medalForGrade(grade) {
    if (grade === "无瑕逆转") return "金章";
    if (grade === "稳健逆转") return "银章";
    if (grade === "险胜逆转") return "铜章";
    return "";
  }

  function caseRecord(caseId) {
    if (!state.records[caseId]) {
      state.records[caseId] = {
        clears: 0,
        bestGrade: "",
        bestMistakes: null,
        bestMedal: "",
        lastGrade: "",
        lastMistakes: null,
        runs: [],
      };
    }
    const record = state.records[caseId];
    if (!Array.isArray(record.runs)) record.runs = [];
    if (!record.bestGrade && state.completed.includes(caseId)) {
      const progress = caseProgress(caseId);
      const grade = progress.grade || gradeForCase(progress);
      record.clears = Math.max(1, Number(record.clears) || 0);
      record.bestGrade = grade;
      record.bestMistakes = progress.mistakes;
      record.bestMedal = medalForGrade(grade);
      record.lastGrade = grade;
      record.lastMistakes = progress.mistakes;
    }
    return record;
  }

  function recordCompletion(caseData, progress) {
    const record = caseRecord(caseData.id);
    const grade = progress.grade || gradeForCase(progress);
    record.clears = (Number(record.clears) || 0) + 1;
    record.lastGrade = grade;
    record.lastMistakes = progress.mistakes;
    record.runs = [
      {
        grade,
        medal: medalForGrade(grade),
        mistakes: progress.mistakes,
        at: new Date().toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }),
      },
      ...record.runs,
    ].slice(0, 6);
    if (!record.bestGrade || gradeRank(grade) > gradeRank(record.bestGrade) || progress.mistakes < record.bestMistakes) {
      record.bestGrade = grade;
      record.bestMistakes = progress.mistakes;
      record.bestMedal = medalForGrade(grade);
    }
  }

  function investigationProgress(caseId) {
    caseProgress(caseId);
    return state.investigation[caseId];
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function setMessage(speaker, message, cue) {
    state.speaker = speaker || "系统";
    state.message = message || "";
    state.dramaticCue = cue || "";
    if (!cue) {
      state.impactCue = null;
    } else if (["trial", "trial-interlude", "result", "bad-ending"].includes(state.screen) && (!state.impactCue || state.impactCue.kind !== cue)) {
      const title = cue === "penalty" ? "驳回" : "异议";
      const subtitle = cue === "penalty" ? "举证被压回" : "证词出现破绽";
      state.impactCue = {
        kind: cue,
        title,
        record: "",
        subtitle,
        frames: impactFramesFor(cue, title, "", subtitle),
      };
    } else if (!["trial", "trial-interlude", "result", "bad-ending"].includes(state.screen)) {
      state.impactCue = null;
    }
    if (message) {
      state.backlog.unshift({
        speaker: state.speaker,
        message,
        cue: cue || "",
        at: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
      });
      state.backlog = state.backlog.slice(0, 16);
    }
  }

  function clearInvestigationBeat() {
    state.investigationBeat = null;
  }

  function clearEvidencePickup() {
    state.evidencePickup = null;
  }

  function clearInventoryCue() {
    state.inventoryCue = null;
  }

  function clearPursuitUnlockCue() {
    state.pursuitUnlockCue = null;
  }

  function clearRecordInspectTransient() {
    state.recordInspectGesture = "";
    state.recordInspectGestureNonce = 0;
    state.inspectDrag = null;
  }

  function clearRecordInspectCompare() {
    state.recordInspectCompare = null;
  }

  function setRecordInspectGesture(gesture) {
    const nonce = Date.now();
    state.recordInspectGesture = gesture || "";
    state.recordInspectGestureNonce = nonce;
    if (!gesture) return;
    window.setTimeout(() => {
      if (state.recordInspectGestureNonce !== nonce) return;
      state.recordInspectGesture = "";
      state.recordInspectGestureNonce = 0;
      if (state.recordInspect) rerender();
    }, 420);
  }

  function setEvidencePickup(caseData, items) {
    const itemIds = (items || []).map((item) => item?.id).filter(Boolean);
    state.evidencePickup = itemIds.length
      ? {
          caseId: caseData.id,
          itemIds,
          index: 0,
        }
      : null;
  }

  function currentEvidencePickup(caseData = currentCase()) {
    const pickup = state.evidencePickup;
    if (!pickup || pickup.caseId !== caseData.id) return null;
    const items = (pickup.itemIds || []).map((id) => evidenceById(caseData, id)).filter(Boolean);
    if (!items.length) return null;
    const index = Math.max(0, Math.min(items.length - 1, Number(pickup.index || 0)));
    return { pickup, items, item: items[index], index };
  }

  function advanceEvidencePickup() {
    const view = currentEvidencePickup();
    if (!view) {
      clearEvidencePickup();
      rerender();
      return;
    }
    if (view.index < view.items.length - 1) {
      view.pickup.index = view.index + 1;
    } else {
      triggerInventoryCue(view.item);
      clearEvidencePickup();
    }
    rerender();
  }

  function triggerInventoryCue(item) {
    const caseData = currentCase();
    if (!item || state.screen !== "investigation") return;
    const nonce = Date.now();
    state.inventoryCue = {
      caseId: caseData.id,
      itemId: item.id,
      nonce,
    };
    window.setTimeout(() => {
      if (state.inventoryCue?.nonce !== nonce) return;
      clearInventoryCue();
      if (state.screen === "investigation") rerender();
    }, 1150);
  }

  function currentInventoryCue(caseData = currentCase()) {
    const cue = state.inventoryCue;
    if (!cue || cue.caseId !== caseData.id || state.screen !== "investigation") return null;
    const item = evidenceById(caseData, cue.itemId);
    if (!item) return null;
    return { cue, item };
  }

  function setInvestigationBeat(kind, speaker, text, result, evidenceNames = [], followUps = []) {
    const lines = [{ speaker: speaker || "调查", text: text || "" }].concat(followUps.filter((line) => line?.text));
    state.investigationBeat = {
      kind,
      speaker: speaker || "调查",
      text: text || "",
      result: result || "",
      evidenceNames,
      lines,
      lineIndex: 0,
    };
  }

  function advanceInvestigationBeat() {
    const beat = state.investigationBeat;
    if (!beat?.lines?.length) return;
    beat.lineIndex = Math.min(beat.lines.length - 1, Number(beat.lineIndex || 0) + 1);
    const line = beat.lines[beat.lineIndex] || beat.lines[0];
    setMessage(line.speaker, line.text, "");
    renderInvestigation();
  }

  function advanceOrCloseInvestigationBeat() {
    const beat = state.investigationBeat;
    if (!beat?.lines?.length) return;
    const lineIndex = Number(beat.lineIndex || 0);
    if (lineIndex < beat.lines.length - 1) advanceInvestigationBeat();
    else closeInvestigationBeat();
  }

  function retreatInvestigationBeat() {
    const beat = state.investigationBeat;
    if (!beat?.lines?.length) return;
    beat.lineIndex = Math.max(0, Number(beat.lineIndex || 0) - 1);
    const line = beat.lines[beat.lineIndex] || beat.lines[0];
    setMessage(line.speaker, line.text, "");
    renderInvestigation();
  }

  function closeInvestigationBeat() {
    clearInvestigationBeat();
    renderInvestigation();
  }

  function setImpactCue(kind, title, record, subtitle) {
    const frames = impactFramesFor(kind, title, record, subtitle);
    state.impactCue = {
      kind,
      title,
      record: record || "",
      subtitle: subtitle || "",
      frames,
    };
  }

  function impactFramesFor(kind, title, record, subtitle) {
    const caseData = currentCase();
    const opponent = caseData.opponentPortrait || "censor";
    if (kind === "penalty") {
      return [
        { role: "辩方", label: "举证受阻", portrait: "empress", tone: "penalty", pose: "shaken" },
        { role: title || "驳回", label: record || "证据失准", portrait: "record", tone: "record", pose: "idle" },
        { role: caseData.opponent, label: subtitle || "夺回节奏", portrait: opponent, tone: "opponent", pose: "assert" },
      ];
    }
    return [
      { role: "辩方", label: title === "逆转" ? "绝地反击" : "指出矛盾", portrait: "empress", tone: "defense", pose: "assert" },
      { role: "法庭记录", label: record || "关键证据", portrait: "record", tone: "record", pose: "idle" },
      { role: caseData.opponent, label: subtitle || "证词动摇", portrait: opponent, tone: "opponent", pose: "shaken" },
    ];
  }

  const defaultStagePose = { left: "idle", right: "idle" };

  function currentStagePose() {
    return { ...defaultStagePose, ...(state.stagePose || {}) };
  }

  function setStage(focus, notice, pose) {
    state.stageFocus = focus || "center";
    state.stageNotice = notice || "";
    state.stagePose = { ...defaultStagePose, ...(pose || {}) };
  }

  function poseLabel(pose) {
    return {
      idle: "",
      enter: "入庭",
      testify: "作证",
      thinking: "沉思",
      tense: "动摇",
      shock: "破绽",
      confident: "压制",
      attack: "反击",
      stagger: "失衡",
      observe: "审视",
    }[pose] || "";
  }

  function pressureLevel(progress) {
    if (progress.failed || progress.credibility <= 0) return "collapse";
    if (progress.credibility <= 1) return "final-warning";
    if (progress.credibility <= 2) return "danger";
    return "stable";
  }

  function pressureCopy(level) {
    return {
      stable: {
        label: "稳定",
        title: "节奏稳定",
        body: "法庭仍愿意听取辩方推理。继续先追问、再举证。",
      },
      danger: {
        label: "危险",
        title: "法庭警戒",
        body: "信誉已经偏低。下一次错误会让对手夺走节奏，先用追问确认矛盾再行动。",
      },
      "final-warning": {
        label: "最后警告",
        title: "最后警告",
        body: "法官已经准备维持原判。只能选择最能击穿当前证词的记录。",
      },
      collapse: {
        label: "崩盘",
        title: "庭审崩盘",
        body: "信誉归零，必须重审庭审。",
      },
    }[level];
  }

  function pressureBeat(caseData, level) {
    const fallback = pressureCopy(level);
    const beat = caseData?.pressureBeats?.[level];
    return { ...fallback, ...(beat || {}) };
  }

  function turnaboutBeat(caseData) {
    return {
      title: "逆转突破",
      body: "关键证物扭转庭审方向，法庭重新听取辩方推理。",
      opponentLine: "对手的压迫被迫中断，庭审节奏回到辩方手里。",
      recovery: 1,
      ...(caseData?.turnaboutBeat || {}),
    };
  }

  function evidenceById(caseData, evidenceId) {
    return caseData.evidence.find((item) => item.id === evidenceId);
  }

  function exactProfileByName(name) {
    return data.profiles.find((profile) => profile.name === name) || null;
  }

  function selectedRecordLabel(caseData) {
    if (state.selectedEvidenceId) return evidenceById(caseData, state.selectedEvidenceId)?.name || "";
    if (state.selectedProfileName) return exactProfileByName(state.selectedProfileName)?.name || state.selectedProfileName;
    return "";
  }

  function statementHasAnswer(statement) {
    return Boolean(statement.answerEvidence || statement.answerProfile);
  }

  function statementAnswerMatched(statement) {
    if (statement.answerEvidence) return state.selectedEvidenceId === statement.answerEvidence;
    if (statement.answerProfile) return state.selectedProfileName === statement.answerProfile;
    return false;
  }

  function statementCounterMatched(statement) {
    return Boolean(statement.counterEvidence && state.selectedEvidenceId === statement.counterEvidence);
  }

  function statementKey(testimonyIndex, rawIndex) {
    return `${testimonyIndex}:${rawIndex}`;
  }

  function statementReadyToPresent(statement, progress, testimonyIndex, rawIndex) {
    const key = statementKey(testimonyIndex, rawIndex);
    return statementHasAnswer(statement) && progress.pressed.includes(key) && !progress.solved.includes(key);
  }

  function trialDeductionForStatement(caseData, statement, progress, testimonyIndex, rawIndex) {
    if (!statement?.answerEvidence) return null;
    if (!statementReadyToPresent(statement, progress, testimonyIndex, rawIndex)) return null;
    const deduction = deductionForEvidence(caseData, statement.answerEvidence);
    const evidence = deduction ? evidenceById(caseData, statement.answerEvidence) : null;
    return deduction && evidence ? { evidence, deduction } : null;
  }

  function deductionPursuitCopy(caseData, statement, deduction, recordLabel) {
    const targetName = deduction?.targetName || "另一份证物";
    const recordName = recordLabel || "这份记录";
    const generic = {
      title: "对照札记打开了新缺口",
      defenseLine: `札记已经把“${recordName}”和“${targetName}”连在一起。证人必须解释这条连接为什么会存在。`,
      witnessLine: "证人刚才只解释单件证物，却避开了两件证物为什么会互相咬合。",
      button: "追击证人",
    };
    const byCase = {
      "case-empress-seat": {
        title: "哭声被写进了诏书",
        defenseLine: `婴儿的哭声可以是传闻，但“${recordName}”和“${targetName}”对上以后，废后的话就不再是宫人随口一说。谁把哭声送进文书？`,
        witnessLine: "内廷记录官的手指停在案卷边上。他能说听见哭声，却不敢说是谁先把废后的字写下来。",
        button: "追问文书来源",
      },
      "case-crown-shadow": {
        title: "家事被整理成罪名",
        defenseLine: `如果这只是皇子之间的家事，“${recordName}”为什么会和“${targetName}”扣在同一条线上？谁把问安、名册和传位记录排成了罪证？`,
        witnessLine: "邠王守礼垂下眼。他避开了高宗病榻，也避开了谁最早拿走那些记录。",
        button: "追问记录流向",
      },
      "case-rebellion-box": {
        title: "投书途中被加了罪",
        defenseLine: `铜匦里的纸本来只是告发。可“${recordName}”一旦和“${targetName}”对上，谋反二字就是途中被人加重的。谁接过这张纸？`,
        witnessLine: "告密人的声音低了下去。他敢说自己投书，却不敢说投书离开铜匦后经过了谁的手。",
        button: "追问加罪之手",
      },
      "case-urn": {
        title: "供词照着刑具长出来",
        defenseLine: `自愿供词不会和“${targetName}”贴得这么紧。“${recordName}”对上以后，问题不再是谁签字，而是谁照着手册逼他签。`,
        witnessLine: "魏元忠盯着瓮口烙痕，声音发哑：同样的话，他在暗室外听过不止一次。",
        button: "追问逼供步骤",
      },
      "case-half-hour-coup": {
        title: "半小时早被人排好",
        defenseLine: `若真是仓促政变，“${recordName}”和“${targetName}”不该刚好咬住同一个时辰。谁在夜门撞开前就安排了结局？`,
        witnessLine: "玄宗旧部不再看张易之。他知道更漏牌不会替任何人圆谎。",
        button: "追问半小时安排",
      },
    };
    return { ...generic, ...(byCase[caseData.id] || {}) };
  }

  function deductionPursuitUnlock(caseData) {
    return evidenceById(caseData, `${caseData.id}-ev-pursuit-note`);
  }

  function visibleStatementEntries(testimony, progress) {
    return testimony.statements
      .map((statement, rawIndex) => ({ statement, rawIndex }))
      .filter(({ statement }) => !statement.hiddenUntilPressed || progress.unlockedStatements.includes(statement.hiddenUntilPressed));
  }

  function currentStatementEntry(testimony, progress) {
    const entries = visibleStatementEntries(testimony, progress);
    if (!entries.length) return { statement: testimony.statements[0], rawIndex: 0 };
    if (progress.statementIndex >= entries.length) progress.statementIndex = entries.length - 1;
    return entries[Math.max(0, progress.statementIndex)];
  }

  function testimonyAnswerKeys(testimony, testimonyIndex, progress) {
    return testimony.statements
      .map((statement, index) => {
        if (!statementHasAnswer(statement)) return "";
        if (statement.optionalRecovery && !progress.unlockedStatements.includes(statement.hiddenUntilPressed)) return "";
        if (statement.requiredAfterUnlock && statement.hiddenUntilPressed && !progress.unlockedStatements.includes(statement.hiddenUntilPressed)) return "";
        return statementKey(testimonyIndex, index);
      })
      .filter(Boolean);
  }

  function testimonyFullySolved(testimony, testimonyIndex, progress) {
    return testimonyAnswerKeys(testimony, testimonyIndex, progress).every((key) => progress.solved.includes(key));
  }

  function allEvidenceCollected(caseData) {
    const collected = state.collected[caseData.id] || [];
    return caseData.evidence
      .filter((item) => !item.trialOnly)
      .every((item) => collected.includes(item.id));
  }

  function missingTrialEvidence(caseData) {
    const collected = state.collected[caseData.id] || [];
    return caseData.evidence
      .filter((item) => !item.trialOnly && !collected.includes(item.id))
      .map((item) => item.name);
  }

  function collectedEvidence(caseData) {
    const collected = state.collected[caseData.id] || [];
    return caseData.evidence.filter((item) => collected.includes(item.id));
  }

  function profileForName(name) {
    return data.profiles.find((profile) => profile.name === name) || data.profiles[0];
  }

  function portraitForSpeaker(caseData, speaker, mode) {
    if (mode === "investigation") return "survivor";
    if (!speaker) return "minister";
    if (speaker === caseData.witness) return caseData.witnessPortrait || "survivor";
    if (speaker === caseData.opponent) return caseData.opponentPortrait || "censor";
    if (speaker.includes("武")) return "empress";
    if (speaker.includes("狄") || speaker.includes("辩") || speaker.includes("追问")) return "minister";
    if (speaker.includes("张")) return "favorite";
    if (speaker.includes("审判") || speaker.includes("书记")) return "empress";
    return caseData.witnessPortrait || "survivor";
  }

  function investigationPortraitForSpeaker(caseData, speaker) {
    const profile = data.profiles.find((item) => item.name === speaker);
    if (profile?.portrait) return profile.portrait;
    if (!speaker || speaker === "调查" || speaker.includes("书记")) return "empress";
    if (speaker === caseData.witness) return caseData.witnessPortrait || "survivor";
    if (speaker === caseData.opponent) return caseData.opponentPortrait || "censor";
    if (speaker.includes("辩")) return "minister";
    return caseData.witnessPortrait || "survivor";
  }

  function currentLocation(caseData) {
    const progress = investigationProgress(caseData.id);
    return caseData.locations[progress.locationIndex] || caseData.locations[0];
  }

  function caseHasProgress(caseData) {
    return Boolean(
      state.completed.includes(caseData.id) ||
        (state.collected[caseData.id] || []).length ||
        state.trial[caseData.id] ||
        state.investigation[caseData.id]
    );
  }

  function continueCaseIndex() {
    const current = data.cases[state.caseIndex];
    if (current && !state.completed.includes(current.id)) return state.caseIndex;
    const active = data.cases.findIndex((caseData) => caseHasProgress(caseData) && !state.completed.includes(caseData.id));
    if (active >= 0) return active;
    const firstUnfinished = data.cases.findIndex((caseData) => !state.completed.includes(caseData.id));
    if (firstUnfinished >= 0) return firstUnfinished;
    return Math.max(0, data.cases.length - 1);
  }

  function continueLabel(caseData) {
    if (caseHasProgress(caseData) && !state.completed.includes(caseData.id)) return "继续审理";
    if (state.completed.includes(caseData.id)) return "重看终案";
    return "开始新案";
  }

  function caseDisplayIndex(caseData) {
    const index = data.cases.findIndex((entry) => entry.id === caseData?.id);
    if (index < 0) return "";
    return `第${index + 1}案`;
  }

  function currentGuideContext() {
    const caseData = currentCase();
    if (state.screen === "home") {
      return {
        id: "home-gallery",
        title: "案卷选择",
        body: "先选一案查看档案。结案后，本页会留下奖章、最佳失误和复盘记录。",
        steps: ["查看当前档案", "进入案件", "结案后重审刷更好评价"],
      };
    }
    const progress = caseProgress(caseData.id);
    if (state.screen === "case") {
      return {
        id: "case-brief",
        title: "庭前整理",
        body: allEvidenceCollected(caseData) ? "庭前证物已齐，可以开庭。庭上仍可能通过追问写入新线索。" : "先完成三处调查。证物齐全后，开庭按钮会开放。",
        steps: ["开始调查", "查看可疑处", "证物齐后开庭"],
      };
    }
    if (state.screen === "investigation") {
      const inv = investigationProgress(caseData.id);
      const location = currentLocation(caseData);
      const commandTips = {
        move: `移动到不同地点补全现场。当前地点：${location.name}。`,
        examine: "查看现场可疑处会取得证物；热点和列表按钮都能记录线索。",
        talk: "交谈能补足证人立场，也会把疑点写入对话记录。",
        present: "向现场人物出示已取得证物，可提前听到庭审用途。",
      };
      return {
        id: `investigation-${inv.command}`,
        title: "调查推进",
        body: commandTips[inv.command] || commandTips.move,
        steps: ["移动", "查看", "交谈", "出示"],
      };
    }
    if (state.screen === "trial-interlude") {
      return {
        id: "trial-interlude",
        title: "证词更新",
        body: "上一段证词已动摇。确认新证词后继续交叉询问，证人会换一套说法。",
        steps: ["确认更新", "继续询问", "寻找新矛盾"],
      };
    }
    if (state.screen === "trial") {
      const testimony = caseData.testimony[progress.testimonyIndex];
      const { statement, rawIndex } = currentStatementEntry(testimony, progress);
      const key = statementKey(progress.testimonyIndex, rawIndex);
      if (statement.unlockStatementId && !progress.unlockedStatements.includes(statement.unlockStatementId)) {
        return {
          id: "trial-hidden",
          title: "追问突破",
          body: "这句证词像是在挡住后续说法。先追问它，可能逼出新的证词句段。",
          steps: ["停在当前句", "追问", "观察证词条变化"],
        };
      }
      if (statementHasAnswer(statement) && !progress.pressed.includes(key)) {
        return {
          id: "trial-press-first",
          title: "先追问",
          body: "可疑句不能急着举证。先追问，让矛盾完全暴露，再选择记录。",
          steps: ["追问当前句", "听完整回应", "再准备举证"],
        };
      }
      if (statement.optionalRecovery) {
        return {
          id: "trial-recovery",
          title: "补救破绽",
          body: "对手反制后留下了补救破绽。别再用刚才那件有漏洞的证物，换一件能说明后续动作是谁做的记录，可追回部分信誉。",
          steps: ["确认补救句", "换正确证物", "追回信誉"],
        };
      }
      if (statementHasAnswer(statement) && !selectedRecordLabel(caseData)) {
        const trialDeduction = trialDeductionForStatement(caseData, statement, progress, progress.testimonyIndex, rawIndex);
        return {
          id: trialDeduction ? "trial-deduction" : statement.answerProfile ? "trial-profile" : "trial-evidence",
          title: trialDeduction ? "对照札记可用" : statement.answerProfile ? "人物也能举证" : "选择证物",
          body: trialDeduction
            ? `你已经在记录里做过一条对照札记：${trialDeduction.deduction.text} 打开证物，找带有“已对照”的那件记录。`
            : statement.answerProfile
              ? "有些矛盾要用人物档案击破。切到人物，选中相关人物后再举证。"
              : "切到证物，选中能反驳当前句的记录，再点击举证。",
          steps: statement.answerProfile ? ["打开人物", "选中人物", "举证"] : ["打开证物", "选中记录", "举证"],
        };
      }
      if (statement.counterEvidence && state.selectedEvidenceId === statement.counterEvidence) {
        const selected = evidenceById(caseData, state.selectedEvidenceId);
        return {
          id: "trial-counter-risk",
          title: "慎防反制",
          body: selected?.counterRisk || "这份记录有使用边界。若只凭它举证，对手可能抓住漏洞反击。",
          steps: ["查看慎用提示", "换证物", "再举证"],
        };
      }
      return {
        id: "trial-scan",
        title: "交叉询问",
        body: "逐句切换证词，先追问，再用法庭记录击破绝对说法。",
        steps: ["左右方向键切换证词", "追问", "举证"],
      };
    }
    if (state.screen === "bad-ending") {
      return {
        id: "bad-ending",
        title: "败诉复盘",
        body: "法庭信誉已经归零。调查证物仍保留，重审庭审会从第一段证词重新开始。",
        steps: ["查看最后压制", "重审庭审", "换证物路线"],
      };
    }
    return {
      id: "result",
      title: "复盘结案",
      body: "判决会写入结案档案。失误越少，奖章越好，重审不会覆盖最佳记录。",
      steps: ["返回案件", "查看档案", "必要时重审"],
    };
  }

  function renderCoachCard() {
    if (state.settings.hideGuides) return "";
    const guide = currentGuideContext();
    const seen = state.guideSeen[guide.id];
    return `
      <div class="coach-card ${seen ? "" : "new"}">
        <strong>书记提示：${escapeHtml(guide.title)}</strong>
        <p>${escapeHtml(guide.body)}</p>
        <div class="coach-actions">
          <button class="coach-link" type="button" data-toggle-guide>详阅</button>
          <button class="coach-link ghost" type="button" data-hide-guides>隐藏</button>
        </div>
      </div>
    `;
  }

  function renderGuidePanel() {
    if (!state.guideOpen) return "";
    const guide = currentGuideContext();
    return `
      <div class="modal-scrim">
        <section class="guide-panel">
          <div class="guide-header">
            <span class="hero-kicker">书记提示</span>
            <h2>${escapeHtml(guide.title)}</h2>
          </div>
          <p>${escapeHtml(guide.body)}</p>
          <div class="guide-steps">
            ${guide.steps.map((step, index) => `<span><b>${index + 1}</b>${escapeHtml(step)}</span>`).join("")}
          </div>
          <div class="action-row">
            <button class="secondary-button" type="button" data-hide-guides>以后隐藏</button>
            <button class="primary-button" type="button" data-toggle-guide>明白</button>
          </div>
        </section>
      </div>
    `;
  }

  function renderStatus() {
    const caseData = currentCase();
    if (state.screen === "home") {
      statusStrip.innerHTML = `
        <span class="tag">已结案 ${state.completed.length}/${data.cases.length}</span>
        <button class="top-action" type="button" data-toggle-guide>提示</button>
        <button class="top-action" type="button" data-toggle-settings>设置</button>
      `;
      return;
    }
    const progress = caseProgress(caseData.id);
    statusStrip.innerHTML = `
      <span class="tag">${escapeHtml(caseData.title)}</span>
      <span class="tag">信誉 ${progress.credibility}/5</span>
      <span class="tag">证物 ${(state.collected[caseData.id] || []).length}/${caseData.evidence.length}</span>
      <button class="top-action" type="button" data-toggle-guide>提示</button>
      <button class="top-action" type="button" data-toggle-settings>设置</button>
    `;
  }

  function renderHome() {
    const wasHome = state.screen === "home";
    state.screen = "home";
    state.selectedEvidenceId = "";
    state.selectedProfileName = "";
    state.recordOpen = false;
    state.recordInspect = null;
    state.recordInspectSpot = "";
    state.recordInspectView = "front";
    clearRecordInspectCompare();
    state.objectionReveal = null;
    clearEvidencePickup();
    clearInventoryCue();
    clearPursuitUnlockCue();
    state.homeView = ["menu", "cases", "archive", "saves"].includes(state.homeView) ? state.homeView : "menu";
    state.homeFocusIndex = Math.min(Math.max(state.homeFocusIndex, 0), data.cases.length - 1);
    const focusedCase = data.cases[state.homeFocusIndex] || data.cases[0];
    renderStatus();
    app.innerHTML = `
      <section class="hero home-shell view-${state.homeView}">
        ${state.homeView === "menu" ? renderHomeMenu() : ""}
        ${state.homeView === "cases" ? renderHomeCases(focusedCase) : ""}
        ${state.homeView === "archive" ? renderHomeArchiveView() : ""}
        ${state.homeView === "saves" ? renderHomeSavesView() : ""}
      </section>
      ${renderGuidePanel()}${renderSettings()}
    `;
    syncAudioForScreen();
    if (!wasHome) window.scrollTo(0, 0);
  }

  function renderHomeMenu() {
    const index = continueCaseIndex();
    const caseData = data.cases[index] || data.cases[0];
    const solved = data.cases.filter((entry) => state.completed.includes(entry.id)).length;
    const gold = data.cases.filter((entry) => caseRecord(entry.id).bestMedal === "金章").length;
    const hasProgress = data.cases.some(caseHasProgress);
    return `
      <div class="main-menu">
        <div class="menu-copy">
          <span class="hero-kicker">宫廷法庭推理</span>
          <h1>${escapeHtml(data.title)}</h1>
          <p>${escapeHtml(data.subtitle)}。调查现场、询问证人、整理法庭记录，在庭审中追问并举出矛盾。</p>
          <div class="menu-progress">
            <span class="tag">结案 ${solved}/${data.cases.length}</span>
            <span class="tag">金章 ${gold}/${data.cases.length}</span>
            <span class="tag">${hasProgress ? `最近：${escapeHtml(caseData.title)}` : "尚未开案"}</span>
          </div>
        </div>
        <nav class="menu-actions" aria-label="主菜单">
          <button class="primary-button menu-button" type="button" data-continue-case>${escapeHtml(`当前继续·${caseDisplayIndex(caseData)}：${continueLabel(caseData)}`)}</button>
          <button class="secondary-button menu-button" type="button" data-home-view="cases">案件选择</button>
          <button class="secondary-button menu-button" type="button" data-home-view="saves">存档/读档</button>
          <button class="secondary-button menu-button" type="button" data-home-view="archive">结案档案</button>
          <button class="secondary-button menu-button" type="button" data-toggle-settings>设置</button>
        </nav>
        <div class="menu-preview scene-${escapeHtml(caseData.scene?.key || "archive")}" data-motif="${escapeHtml(caseData.scene?.motif || "")}">
          <span class="hero-kicker">当前继续 · ${escapeHtml(caseDisplayIndex(caseData))}</span>
          <strong>${escapeHtml(caseData.title)}</strong>
          <p>${escapeHtml(caseMenuHook(caseData))}</p>
          <small>${escapeHtml(caseData.scene?.name || caseData.location)}｜${escapeHtml(caseData.theme)}</small>
        </div>
      </div>
    `;
  }

  function renderHomeCases(focusedCase) {
    return `
      <div class="home-subview">
        <div class="subview-header">
          <div>
            <span class="hero-kicker">案件选择</span>
            <h2>选择要调查的案件</h2>
          </div>
          <button class="secondary-button" type="button" data-home-view="menu">返回主菜单</button>
        </div>
        ${renderFocusedCasePanel(focusedCase)}
        <div class="case-gallery" aria-label="案件章节画廊">
          ${data.cases.map(renderCaseCard).join("")}
        </div>
      </div>
    `;
  }

  function renderHomeArchiveView() {
    return `
      <div class="home-subview">
        <div class="subview-header">
          <div>
            <span class="hero-kicker">结案档案</span>
            <h2>奖章、重审与完成度</h2>
          </div>
          <button class="secondary-button" type="button" data-home-view="menu">返回主菜单</button>
        </div>
        ${renderCaseArchive()}
      </div>
    `;
  }

  function renderHomeSavesView() {
    const slots = readSaveSlots();
    const autoSummary = saveSlotSummary(snapshotSaveData());
    return `
      <div class="home-subview save-subview">
        <div class="subview-header">
          <div>
            <span class="hero-kicker">存档/读档</span>
            <h2>选择存档槽</h2>
          </div>
          <button class="secondary-button" type="button" data-home-view="menu">返回主菜单</button>
        </div>
        <div class="auto-save-card">
          <div>
            <strong>自动存档</strong>
            <span>${escapeHtml(autoSummary.caseTitle)}｜${escapeHtml(autoSummary.stage)}｜结案 ${autoSummary.completed}/${data.cases.length}</span>
          </div>
          <small>自动存档会在调查、庭审、设置和结案后更新。手动槽用于保留关键审理节点。</small>
        </div>
        <div class="save-slot-grid">
          ${slots.map((slot, index) => renderSaveSlot(slot, index)).join("")}
        </div>
      </div>
    `;
  }

  function renderSaveSlot(slot, index) {
    const summary = slot?.summary;
    const savedAt = slot?.savedAt ? new Date(slot.savedAt).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }) : "";
    return `
      <article class="save-slot ${slot ? "filled" : "empty"}">
        <div class="save-slot-head">
          <span class="tag">存档 ${index + 1}</span>
          <strong>${summary ? escapeHtml(summary.caseTitle) : "空存档"}</strong>
        </div>
        ${
          summary
            ? `<p>${escapeHtml(summary.stage)}｜证物 ${summary.collected}/${summary.evidenceTotal}｜结案 ${summary.completed}/${data.cases.length}${summary.bestMedal ? `｜最佳 ${escapeHtml(summary.bestMedal)}` : ""}</p><small>${escapeHtml(savedAt)}</small>`
            : `<p>还没有写入记录。可以把当前自动存档复制到这里。</p><small>适合在庭审前、反制前或结案前保留进度。</small>`
        }
        <div class="save-slot-actions">
          <button class="primary-button" type="button" data-save-slot="${index}">${slot ? "覆盖保存" : "保存"}</button>
          <button class="secondary-button" type="button" data-load-slot="${index}" ${slot ? "" : "disabled"}>读取</button>
          <button class="secondary-button compact-button" type="button" data-clear-slot="${index}" ${slot ? "" : "disabled"}>清空</button>
        </div>
      </article>
    `;
  }

  function renderCaseCard(caseData, index) {
    const done = state.completed.includes(caseData.id);
    const collected = state.collected[caseData.id]?.length || 0;
    const total = caseData.evidence.length;
    const started = collected > 0 || Boolean(state.trial[caseData.id]);
    const record = caseRecord(caseData.id);
    const cardHook = caseMenuHook(caseData);
    const grade = record.bestGrade || state.trial[caseData.id]?.grade || "";
    const medal = record.bestMedal || medalForGrade(grade);
    const label = done ? "查看案件" : started ? "继续案件" : "进入案件";
    const focused = state.homeFocusIndex === index;
    const sceneKey = caseData.scene?.key || "archive";
    return `
      <article
        class="case-card scene-${sceneKey} ${focused ? "focused" : ""} case-card-openable"
        role="button"
        tabindex="0"
        data-open-case-card="${index}"
        aria-label="进入${escapeHtml(caseData.title)}：${escapeHtml(cardHook)}"
      >
        <button class="case-poster" type="button" data-focus-case="${index}" aria-label="查看${escapeHtml(caseData.title)}档案">
          <span>${escapeHtml(caseData.scene?.motif || String(index + 1))}</span>
          <small>${escapeHtml(caseData.scene?.name || "案件现场")}</small>
        </button>
        <div class="case-meta">
          <span class="tag">第 ${index + 1} 案</span>
          <span class="tag">${done ? "已结案" : started ? "进行中" : "待审理"}</span>
          <span class="tag">证物 ${collected}/${total}</span>
          ${medal ? `<span class="tag medal-tag">${escapeHtml(medal)}</span>` : ""}
          ${grade ? `<span class="tag">评价 ${escapeHtml(grade)}</span>` : ""}
          ${record.clears ? `<span class="tag">结案 ${record.clears} 次</span>` : ""}
        </div>
        <h2>${escapeHtml(caseData.title)}</h2>
        <p>${escapeHtml(cardHook)}</p>
        <p class="case-hook">${escapeHtml(caseData.theme)}</p>
        <div class="case-actions">
          <button class="secondary-button" type="button" data-focus-case="${index}">查看档案</button>
          <button class="case-button" type="button" data-open-case="${index}">${label}</button>
          ${done ? `<button class="secondary-button" type="button" data-replay-case="${index}">重审此案</button>` : ""}
        </div>
      </article>
    `;
  }

  function renderFocusedCasePanel(caseData) {
    const index = data.cases.indexOf(caseData);
    const record = caseRecord(caseData.id);
    const collected = state.collected[caseData.id]?.length || 0;
    const sceneKey = caseData.scene?.key || "archive";
    const status = state.completed.includes(caseData.id) ? "已结案" : collected ? "调查中" : "未开始";
    const sourceItems = caseSourceItems(caseData);
    const sourceList = sourceItems
      .slice(0, 4)
      .map(
        (item) => `
            <li>
              <button
                class="source-brief-button"
                type="button"
                data-open-case-source-case="${index}"
                data-open-case-source="${item.index}"
              >
                ${escapeHtml(item.storyTitle)}
              </button>
              <small>${escapeHtml(item.title)}</small>
            </li>
          `
      )
      .join("");
    const latestRuns = renderRunHistory(record);
    return `
      <section class="case-dossier scene-${sceneKey}" data-motif="${escapeHtml(caseData.scene?.motif || "")}">
        <div class="dossier-main">
          <span class="hero-kicker">当前档案</span>
          <h2>${escapeHtml(caseData.title)}</h2>
          <p>${escapeHtml(caseData.theme)}</p>
          <div class="dossier-tags">
            <span class="tag">${escapeHtml(status)}</span>
            <span class="tag">现场：${escapeHtml(caseData.scene?.name || "案件现场")}</span>
            <span class="tag">证物 ${collected}/${caseData.evidence.length}</span>
            <span class="tag">证词 ${caseData.testimony.length} 组</span>
          </div>
          <div class="dossier-actions">
            <button class="primary-button" type="button" data-open-case="${index}">${state.completed.includes(caseData.id) ? "查看案件" : collected ? "继续案件" : "进入案件"}</button>
            ${state.completed.includes(caseData.id) ? `<button class="secondary-button" type="button" data-replay-case="${index}">重审此案</button>` : ""}
          </div>
        </div>
        <div class="dossier-stats">
          <div class="stat-seal">
            <strong>${escapeHtml(record.bestMedal || "未结案")}</strong>
            <span>${record.bestGrade ? `最佳 ${escapeHtml(record.bestGrade)}` : "尚无判决"}</span>
          </div>
          <dl>
            <div><dt>最佳失误</dt><dd>${record.bestMistakes ?? "-"}</dd></div>
            <div><dt>结案次数</dt><dd>${record.clears || 0}</dd></div>
            <div><dt>最近评价</dt><dd>${record.lastGrade ? escapeHtml(record.lastGrade) : "-"}</dd></div>
          </dl>
          <div class="source-brief">
            <strong>卷宗范围</strong>
            <ul>${sourceList}</ul>
          </div>
          ${latestRuns}
        </div>
      </section>
    `;
  }

  function renderRunHistory(record) {
    if (!record.runs.length) {
      return `
        <div class="run-history empty">
          <strong>复盘历史</strong>
          <p>取得判决后，这里会记录最近六次重审结果。</p>
        </div>
      `;
    }
    return `
      <div class="run-history">
        <strong>复盘历史</strong>
        ${record.runs
          .map(
            (run, index) => `
              <div class="run-row">
                <span>${index + 1}</span>
                <b>${escapeHtml(run.medal || "结案")}</b>
                <small>${escapeHtml(run.grade)}｜失误 ${run.mistakes}｜${escapeHtml(run.at)}</small>
              </div>
            `
          )
          .join("")}
      </div>
    `;
  }

  function focusHomeCase(index) {
    state.homeFocusIndex = Number(index);
    renderHome();
  }

  function renderCaseArchive() {
    const solved = data.cases.filter((caseData) => state.completed.includes(caseData.id));
    const gold = data.cases.filter((caseData) => caseRecord(caseData.id).bestMedal === "金章").length;
    const totalClears = data.cases.reduce((sum, caseData) => sum + (Number(caseRecord(caseData.id).clears) || 0), 0);
    return `
      <section class="archive-panel">
        <div class="archive-header">
          <div>
            <span class="hero-kicker">结案档案</span>
            <h2>奖章、重审与完成度</h2>
          </div>
          <div class="archive-summary">
            <span class="tag">金章 ${gold}/${data.cases.length}</span>
            <span class="tag">结案 ${solved.length}/${data.cases.length}</span>
            <span class="tag">重审 ${totalClears} 次</span>
          </div>
        </div>
        <div class="archive-grid">
          ${data.cases
            .map((caseData, index) => {
              const record = caseRecord(caseData.id);
              const cleared = solved.includes(caseData);
              return `
                <div class="archive-card ${cleared ? "cleared" : ""}">
                  <strong>${escapeHtml(caseData.title)}</strong>
                  <span>${record.bestMedal ? escapeHtml(record.bestMedal) : "未结案"}</span>
                  <small>${record.bestGrade ? `最佳：${escapeHtml(record.bestGrade)}｜失误 ${record.bestMistakes}｜结案 ${record.clears} 次` : "尚未取得判决"}</small>
                  <button class="archive-link" type="button" data-focus-case="${index}">查看复盘</button>
                </div>
              `;
            })
            .join("")}
        </div>
      </section>
    `;
  }

  function renderCaseIntro() {
    const caseData = currentCase();
    const progress = caseProgress(caseData.id);
    state.screen = "case";
    state.recordOpen = false;
    state.recordInspect = null;
    clearRecordInspectCompare();
    clearEvidencePickup();
    clearPursuitUnlockCue();
    clearInventoryCue();
    renderStatus();
    app.innerHTML = `
      <section class="case-intro-layout">
        <div class="panel case-brief">
          <div class="case-meta">
            <span class="tag">地点：${escapeHtml(caseData.location)}</span>
            <span class="tag">对手：${escapeHtml(caseData.opponent)}</span>
            <span class="tag">证人：${escapeHtml(caseData.witness)}</span>
          </div>
          <div class="case-brief-main">
            <div class="case-brief-copy">
              <h2>${escapeHtml(caseData.title)}</h2>
              ${renderCaseOpeningStory(caseData)}
              ${renderCaseSetup(caseData)}
            </div>
            ${renderCaseIntroArt(caseData)}
          </div>
          ${renderCaseSourcePanel(caseData)}
          <div class="action-row">
            <button class="secondary-button compact-button" type="button" data-home>返回主菜单</button>
            <button class="primary-button" type="button" data-mode="investigation">开始调查</button>
            <button class="secondary-button" type="button" data-mode="trial" ${allEvidenceCollected(caseData) ? "" : "disabled"}>进入庭审</button>
          </div>
          ${allEvidenceCollected(caseData) ? `<p class="hint-text">线索已经够进庭。庭审里还会从证人嘴里逼出新材料。</p>` : `<p class="hint-text">先在现场把能说话的纸、物、人找齐；少一件，庭上就会被堵死。</p>`}
          ${renderCoachCard()}
        </div>
      </section>
      ${renderGuidePanel()}${renderSettings()}
    `;
    syncAudioForScreen();
  }

  function caseOpeningBeats(caseData) {
    const story = caseOpeningStory(caseData);
    const lines = Array.isArray(caseData.openingLines) ? caseData.openingLines : [];
    const sources = caseSourceItems(caseData);
    return [
      {
        kicker: story.kicker || "案件开场",
        title: story.title,
        body: story.body,
        speaker: lines[0]?.speaker || caseData.witness || "证人",
        line: lines[0]?.text || story.body,
        focus: "scene",
      },
      {
        kicker: "辩护席",
        title: sources[0]?.storyTitle ? `第一条线索：${sources[0].storyTitle}` : "第一条线索已经露出",
        body: sources[0]?.storyNote || story.stakes,
        speaker: lines[1]?.speaker || "辩方",
        line: lines[1]?.text || "先从现场留下的纸、物、人查起。",
        focus: "defense",
      },
      {
        kicker: "对手入庭",
        title: `${caseData.opponent}已经等在庭上`,
        body: story.stakes,
        speaker: lines[2]?.speaker || caseData.opponent || "对手",
        line: lines[2]?.text || "没有更强证据，法庭只会接受眼前的案卷。",
        focus: "opponent",
      },
    ];
  }

  function startCaseOpeningCutscene(caseData) {
    state.screen = "case-opening";
    state.recordOpen = false;
    state.recordInspect = null;
    state.openingCutscene = { caseId: caseData.id, step: 0 };
    clearRecordInspectCompare();
    clearInvestigationBeat();
    clearEvidencePickup();
    clearInventoryCue();
    clearPursuitUnlockCue();
    setMessage("开幕", "案件开场。点击画面或按 Enter 继续。", "");
    playCue("transition");
    renderCaseOpeningCutscene();
  }

  function renderCaseOpeningCutscene() {
    const caseData = currentCase();
    const beats = caseOpeningBeats(caseData);
    const cutscene = state.openingCutscene?.caseId === caseData.id ? state.openingCutscene : { caseId: caseData.id, step: 0 };
    state.openingCutscene = cutscene;
    const step = Math.max(0, Math.min(beats.length - 1, Number(cutscene.step) || 0));
    const beat = beats[step];
    const startLocation = caseData.locations?.[0] || { sceneVariant: "site", name: caseData.location };
    const art = locationBackgroundFile(caseData, startLocation);
    renderStatus();
    app.innerHTML = `
      <section class="opening-cutscene scene-${escapeHtml(caseData.scene?.key || "palace")} focus-${escapeHtml(beat.focus)}" data-motif="${escapeHtml(caseData.scene?.motif || "")}" data-advance-opening-panel style="--location-art: url('./assets/${escapeHtml(art)}');">
        <div class="opening-cutscene-shade"></div>
        <div class="opening-cutscene-card">
          <span class="hero-kicker">${escapeHtml(beat.kicker)}</span>
          <strong>${escapeHtml(beat.title)}</strong>
          <p>${escapeHtml(beat.body)}</p>
        </div>
        <div class="opening-cutscene-dialogue">
          <b>${escapeHtml(beat.speaker)}</b>
          <span>${escapeHtml(beat.line)}</span>
        </div>
        <div class="opening-cutscene-actions">
          <span>${step + 1}/${beats.length}</span>
          <button class="secondary-button" type="button" data-skip-opening>跳过开场</button>
          <span class="opening-continue-hint">${step >= beats.length - 1 ? "点击任意处开始调查" : "点击任意处继续开场"}</span>
        </div>
      </section>
      ${renderSettings()}
    `;
    syncAudioForScreen();
  }

  function advanceCaseOpeningCutscene() {
    const caseData = currentCase();
    const beats = caseOpeningBeats(caseData);
    const cutscene = state.openingCutscene || { caseId: caseData.id, step: 0 };
    if ((Number(cutscene.step) || 0) >= beats.length - 1) {
      finishCaseOpeningCutscene();
      return;
    }
    state.openingCutscene = { caseId: caseData.id, step: (Number(cutscene.step) || 0) + 1 };
    playCue("click");
    renderCaseOpeningCutscene();
  }

  function finishCaseOpeningCutscene() {
    const caseData = currentCase();
    const inv = investigationProgress(caseData.id);
    inv.openingSeen = true;
    state.openingCutscene = null;
    save();
    setMode("investigation", { force: true });
  }

  function renderCaseOpeningStory(caseData) {
    const story = caseOpeningStory(caseData);
    const lines = Array.isArray(caseData.openingLines) ? caseData.openingLines.slice(0, 3) : [];
    return `
      <div class="case-story-scene" aria-label="案件开场故事">
        <span class="hero-kicker">${escapeHtml(story.kicker)}</span>
        <strong>${escapeHtml(story.title)}</strong>
        <p>${escapeHtml(story.body)}</p>
        <div class="case-dialogue-strip">
          ${lines
            .map(
              (line) => `
                <div>
                  <b>${escapeHtml(line.speaker || "记录")}</b>
                  <span>${escapeHtml(line.text || "")}</span>
                </div>
              `
            )
            .join("")}
        </div>
        <small>${escapeHtml(story.stakes)}</small>
      </div>
    `;
  }

  function caseMenuHook(caseData) {
    return caseData.menuHook || caseOpeningStory(caseData).body || caseData.goal || caseData.theme;
  }

  function caseOpeningStory(caseData) {
    if (caseData.openingStory && typeof caseData.openingStory === "object") {
      return {
        kicker: caseData.openingStory.kicker || "案件开场",
        title: caseData.openingStory.title || caseNarrativeLead(caseData),
        body: caseData.openingStory.body || caseData.goal || caseData.theme,
        stakes: caseData.openingStory.stakes || "先找到能把口供和证物连起来的裂缝，再把它带上庭。",
      };
    }
    const byCase = {
      "case-empress-seat": {
        kicker: "事发当晚",
        title: "立政殿外，有人先听见哭声，也有人先准备好了诏书。",
        body: "婴儿死讯还没走出宫墙，废后的名字已经被压进案卷。宫人跪在门前，手指攥着袖口，只敢说“听见了”，不敢说是谁第一个把废后喊出口。",
        stakes: "若你只按口供走，宫人会替整座后宫背下罪名；若你翻出纸张流向，真正推动后位更替的人才会露面。",
      },
      "case-crown-shadow": {
        kicker: "东宫夜审",
        title: "旧臣递来的是账册，天亮后却变成了罪状。",
        body: "东宫长廊的灯烧了一夜。旧臣说自己只是护送文书，可记录官已经把“储位不稳”四个字写在案头，等着法庭盖印。",
        stakes: "越多人说这是皇家家事，越要问清谁整理了这些家事，又是谁等着用它定罪。",
      },
      "case-rebellion-box": {
        kicker: "铜匦开封",
        title: "一封投书从匣中取出时，还没有重到能压死人。",
        body: "半日之后，街头榜文已经把旧臣说成谋反。投书、檄文、缉捕令像一串急促的脚步，越走越快，也越走越像有人在后面推。",
        stakes: "你要追的不是谁最先告发，而是谁在纸张转手时把告发改成了谋反。",
      },
      "case-urn": {
        kicker: "暗室余温",
        title: "供状太整齐，反而像刚从刑具旁擦干净。",
        body: "狄仁杰的签押端正得刺眼，暗室里的空瓮却还留着焦味。周兴把供词拍上案时，连看都不看那个瓮口。",
        stakes: "若法庭只看供状，酷吏就赢了；若你让刑具、笔迹和副本一起开口，自愿二字就会裂开。",
      },
      "case-half-hour-coup": {
        kicker: "夜门半小时",
        title: "所有人都说来不及，可命令偏偏来得很准。",
        body: "宫门被撞开的那半小时里，张氏兄弟还没倒下，赏赐簿、换岗令和罪名纸条已经像排好队一样等着登场。",
        stakes: "别被混乱骗走视线。真正的破绽在时间里：谁最早知道结局，谁就最早安排了结局。",
      },
    };
    return (
      byCase[caseData.id] || {
        kicker: "案件开场",
        title: caseNarrativeLead(caseData),
        body: caseData.goal || caseData.theme || "案卷已经打开，先听现场的人怎么说。",
        stakes: "先找到能把口供和证物连起来的裂缝，再把它带上庭。",
      }
    );
  }

  function renderCaseSetup(caseData) {
    const cards = caseBriefingCards(caseData);
    return `
      <div class="case-setup" aria-label="案情导入">
        <div class="case-section-title">
          <strong>先盯住这三个地方</strong>
          <span>它们不是任务清单，而是本案一开始就不对劲的地方。</span>
        </div>
        ${cards
          .map(
            (card) => `
              <div>
                <strong>${escapeHtml(card.title)}</strong>
                <p>${escapeHtml(card.body)}</p>
              </div>
            `
          )
          .join("")}
      </div>
    `;
  }

  function caseBriefingCards(caseData) {
    if (Array.isArray(caseData.introCards) && caseData.introCards.length) {
      return caseData.introCards;
    }
    const byCase = {
      "case-empress-seat": [
        {
          title: "哭声之后，宫门突然安静了",
          body: "立政殿外有人哭，有人跪，也有人把话咽了回去。宫人只说听见婴儿的哭声，却不肯说废后的风声是谁先放出来的。",
        },
        {
          title: "最怕的不是证人撒谎",
          body: "奏章撕过，值夜签改过，名册又被新蜡封住。每张纸都像在替同一个人遮掩，却没有一张愿意把名字说全。",
        },
        {
          title: "许敬宗已经等在庭上",
          body: "他会把这案子说成后宫旧怨。你若只听口供，宫人会背下所有罪名；你若找到文书的破口，后位之争才会露出真正的手。",
        },
      ],
      "case-crown-shadow": [
        {
          title: "东宫旧臣一夜成了罪人",
          body: "他只是递过几封旧文书，天亮后却被说成搅乱储位。越是没人敢替他说话，越说明有人在等这个罪名落地。",
        },
        {
          title: "病榻旁的记录很干净",
          body: "问安笺、皇子名册、传位记录摆得太整齐，像是早就准备给人看的。真正的问题在缺掉的那几句问候里。",
        },
        {
          title: "一句“家事”挡住了所有人",
          body: "对手会说皇子待遇只是宫里安排。可旧臣为什么偏偏这时被推出来？储位的影子，已经压到每一本账册上。",
        },
      ],
      "case-rebellion-box": [
        {
          title: "铜匦打开，罪名也打开了",
          body: "投书从匣中取出时，还只是一张纸。等它送到案前，街上已经贴出榜文，旧臣连辩白的机会都快没了。",
        },
        {
          title: "纸在路上被人添了重量",
          body: "投书、檄文、缉捕令说的是同一件事，却像出自三只不同的手。谁把“告发”改成“谋反”，谁就藏在纸张转交的路上。",
        },
        {
          title: "最吵的人未必最清楚真相",
          body: "街上人人都在喊谋反，法庭也想快些定案。你要让他们先安静下来，看清那张纸最初到底写了什么。",
        },
      ],
      "case-urn": [
        {
          title: "供词太漂亮，像刚擦过的刀",
          body: "狄仁杰的签押干净得反常。御史台暗室里却还留着空瓮、烙痕和没有收好的笔，像有人匆忙把夜里的事盖住。",
        },
        {
          title: "同一句话，被写了太多遍",
          body: "几份供状的语气一模一样，连停笔的位置都像照着抄。人会害怕，笔不会；笔迹会把审讯者留下来。",
        },
        {
          title: "周兴不怕喊冤，他怕被追问细节",
          body: "他会把供词拍在案上。别和他比嗓门，盯住瓮口、笔迹和副本，让他亲口解释这份“自愿”为什么带着火味。",
        },
      ],
      "case-half-hour-coup": [
        {
          title: "半小时里，宫门换了主人",
          body: "夜门被撞开时，所有人都说太乱了。可半小时后，罪名、赏赐和换岗都已经有了去处，像有人早把结局写好。",
        },
        {
          title: "更漏牌没有说谎",
          body: "它只记时间，不认胜负。张氏兄弟的赏赐簿、禁军换岗令和那张罪名纸条，才在替某些人抢时间。",
        },
        {
          title: "“来不及”是最方便的借口",
          body: "对手会说局势变化太快，没人能看清。可若真没人看清，为什么惩罚和奖赏都来得那么准？",
        },
      ],
    };
    return byCase[caseData.id] || [];
  }

  function caseNarrativeLead(caseData) {
    const byCase = {
      "case-empress-seat": "婴儿的死讯刚传开，废后的话已经有人写进奏章。立政殿里每个人都说自己只是听见了风声，可风声不会自己变成诏书。",
      "case-crown-shadow": "东宫旧臣被押来时，手上还带着整理账册留下的墨。没人愿意说他到底犯了什么，只反复提醒你：储位的事，不该问太深。",
      "case-rebellion-box": "铜匦里的一封投书，在半日之间变成了谋反大案。纸张每经过一只手，罪名就重一分，直到被告再也说不清自己面对的是什么。",
      "case-urn": "御史台的供状看起来无懈可击，连签押都端正得刺眼。可暗室里的空瓮还没凉，像在等一个人承认：这份供词不是自己长出来的。",
      "case-half-hour-coup": "夜门被撞开，到新命令传遍宫中，只用了半小时。所有人都说太乱了，可最乱的时候，偏偏有人把赏赐、换岗和罪名安排得很准。",
    };
    return byCase[caseData.id] || caseData.openingLines?.[0]?.text || caseData.goal || caseData.theme;
  }

  function renderCaseIntroArt(caseData) {
    const startLocation = caseData.locations?.[0] || { sceneVariant: "site", name: caseData.location };
    const art = locationBackgroundFile(caseData, startLocation);
    const evidence = caseData.evidence?.slice(0, 3) || [];
    return `
      <aside class="case-intro-art scene-${escapeHtml(caseData.scene?.key || "palace")}" data-motif="${escapeHtml(caseData.scene?.motif || "")}" style="--location-art: url('./assets/${escapeHtml(art)}');">
        <span class="hero-kicker">现场档案</span>
        <strong>${escapeHtml(startLocation.name || caseData.location)}</strong>
        <small>${escapeHtml(caseData.scene?.name || caseData.location)}｜${escapeHtml(caseData.theme)}</small>
        <div class="intro-evidence-strip">
          ${evidence.map((item) => `<span>${escapeHtml(item.name)}</span>`).join("")}
        </div>
      </aside>
    `;
  }

  function caseSourceItems(caseData) {
    const storyItems = Array.isArray(caseData.sourceStoryItems) ? caseData.sourceStoryItems : caseSourceStoryItems(caseData.id);
    return (caseData.timeline || []).map((item, index) => ({
      ...item,
      index,
      chapter: chapterLabel(item.title || item.label || ""),
      shortTitle: chapterShortTitle(item.title || item.label || ""),
      storyTitle: storyItems[index]?.title || chapterShortTitle(item.title || item.label || ""),
      storyNote: storyItems[index]?.note || item.note || "",
    }));
  }

  function caseSourceStoryItems(caseId) {
    const byCase = {
      "case-empress-seat": [
        { title: "宫门前的哭声", note: "流言从这里开始：有人把婴儿死亡和废后连到一起，却没人敢承认第一句话出自谁口。" },
        { title: "值夜签被改", note: "名单上少了一段关键时辰，又多出后来补上的人名。它像一扇没关严的门，露出现场真正的动静。" },
        { title: "名册重新封蜡", note: "后宫、外戚和当值官员被放进同一本册子，说明这不是宫人之间的私怨，而是有人在清点站位。" },
        { title: "元老终于出声", note: "朝臣们的反对不是替谁哭冤，而是在抗拒后位突然改写。有人急着让他们闭嘴。" },
        { title: "诏稿上盖住的名字", note: "墨迹遮住了反对者，却留下新后的称号。结果像是早就写好，只等一个理由送上来。" },
        { title: "第一刀落下", note: "风波开始变成惩罚。谁被推出去承罪，谁被留下来受益，线索在这一刻分得最清楚。" },
        { title: "宝座终于空出缺口", note: "所有纸张、证词和沉默都指向同一个结局：后位不是自然空出来的，是被一步步挪开的。" },
      ],
      "case-crown-shadow": [
        { title: "旧臣递来的账", note: "一份旧账册让东宫旧事重新浮出水面，也让递账的人变成最方便的嫌疑人。" },
        { title: "病榻旁的问安", note: "问安笺越整齐，越像有人事后补过。储位之争藏在一句句客气话之间。" },
        { title: "皇子名册的空格", note: "名单里不是所有名字都一样重。谁被少写一笔，谁就可能被排到局外。" },
        { title: "传位记录被翻出", note: "旧记录本该安静躺在库房里，却在最紧要的时候被人拿出来当刀。" },
        { title: "东宫影子压上庭", note: "证人不愿谈继承，只想谈规矩。可规矩被谁拿在手里，才是本案真正的问题。" },
      ],
      "case-rebellion-box": [
        { title: "铜匦里的投书", note: "纸还没展开，罪名已经在旁人嘴里成形。告密和事实之间，隔着一条很长的路。" },
        { title: "街上的榜文", note: "榜文比审问先到百姓眼前，像有人急着让所有人相信被告已经有罪。" },
        { title: "残檄的缺口", note: "檄文被撕开后，剩下的字刚好足够吓人，也刚好不够完整。" },
        { title: "酷吏的名单", note: "审讯名单写得太满，像不是为了查清谁说谎，而是为了让每个人都害怕开口。" },
        { title: "缉捕令的墨迹", note: "墨还没干，抓人的命令已经发出。有人把审理变成了追捕。" },
        { title: "兵败后的空白", note: "兵败之后，最先消失的不是人，而是能替人说清楚前因后果的记录。" },
        { title: "疾风里的证人", note: "越是人人自保的时候，敢留下只字片语的人越少。那些小字，也许比高声控诉更可靠。" },
        { title: "舆论先判了案", note: "百姓听到的是结论，不是过程。法庭若也只听结论，真正加罪的人就永远不用上庭。" },
      ],
      "case-urn": [
        { title: "空瓮留在暗室", note: "刑具没有说话，却比供状诚实。它告诉你：有人曾在这里等一个人崩溃。" },
        { title: "供状上的笔锋", note: "笔画一顺到底，像写字的人没有停顿，也没有犹豫。真正的供词不该这样干净。" },
        { title: "副本里的同一句话", note: "几份供状像互相照抄，错也错在同一处。恐惧会重复，伪造也会。" },
        { title: "审讯手册的折角", note: "手册折在逼供那一页，说明这不是一场偶然失控，而是一套被反复使用的方法。" },
        { title: "救援纸条迟到了", note: "有人想把狄仁杰救出来，却来得太晚。迟到的纸条也许正能证明供词来得太快。" },
        { title: "用贤也会招祸", note: "有才能的人未必安全。若法庭只看供状，不看谁最怕他活着，案子就会被写成一场自白。" },
      ],
      "case-half-hour-coup": [
        { title: "夜门的更漏", note: "半小时很短，却足够改变宫门、兵权和一条人命。时间是本案最冷静的证人。" },
        { title: "赏赐簿先动了", note: "赏赐来得太早，像是在事情结束前就知道谁会赢。" },
        { title: "罪名纸条", note: "纸条字少，分量却重。越含糊的罪名，越方便把人推下去。" },
        { title: "禁军换岗令", note: "换岗不是混乱里的小事。谁离开岗位，谁留下缺口，半小时里都有人算过。" },
        { title: "终局前的沉默", note: "等所有人都说尘埃落定，真正该问的是：谁最早知道尘埃会落向哪里。" },
      ],
    };
    return byCase[caseId] || [];
  }

  function chapterLabel(title) {
    const match = String(title).match(/第[一二三四五六七八九十百\d]+章/);
    return match ? match[0] : "章节";
  }

  function chapterShortTitle(title) {
    return String(title)
      .replace(/^第[一二三四五六七八九十百\d]+章\s*/, "")
      .replace(/^[:：]\s*/, "")
      .slice(0, 14);
  }

  function parseChapterNumber(text) {
    const str = String(text || "");
    const direct = str.match(/第(\d+)章/);
    if (direct) return Number(direct[1]);
    const map = { 零: 0, 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10, 百: 100 };
    const match = str.match(/第([一二三四五六七八九十百]+)章/);
    if (!match) return 0;
    const chars = match[1];
    let total = 0;
    let unit = 1;
    for (let i = chars.length - 1; i >= 0; i--) {
      const ch = chars[i];
      const value = map[ch];
      if (value === undefined) continue;
      if (value === 10 || value === 100) {
        unit = value;
        continue;
      }
      total += value * (unit >= 10 ? unit : 1);
      if (unit >= 10) unit = 1;
    }
    return total;
  }

  function timelineLabel(item, fallbackIndex = 0) {
    const chapter = parseChapterNumber(item?.label || item?.title);
    if (chapter) return `线索${chapter}`;
    return `线索${Math.max(1, Number(fallbackIndex) + 1)}`;
  }

  function timelineSourceIndex(caseData, item, fallbackIndex = 0) {
    const targetChapter = parseChapterNumber(item?.label || item?.title);
    const sources = caseSourceItems(caseData);
    if (!sources.length) return Math.max(0, Math.min(sources.length - 1, Number(fallbackIndex) || 0));
    if (!targetChapter) return Math.max(0, Math.min(sources.length - 1, Number(fallbackIndex) || 0));
    const direct = sources.findIndex((sourceItem) => parseChapterNumber(sourceItem.title) === targetChapter);
    if (direct >= 0) return direct;
    return Math.max(0, Math.min(sources.length - 1, Number(fallbackIndex) || 0));
  }

  function timelineSourceSummary(caseData, item) {
    const targetChapter = parseChapterNumber(item?.label || item?.title);
    const sourceItems = caseSourceItems(caseData);
    const matched = targetChapter
      ? sourceItems.find((sourceItem) => parseChapterNumber(sourceItem.title) === targetChapter)
      : null;
    return matched || sourceItems[0] || null;
  }

  function activeCaseSource(caseData) {
    const items = caseSourceItems(caseData);
    if (!items.length) return null;
    const index = Math.max(0, Math.min(items.length - 1, Number(state.caseSourceIndex) || 0));
    return items[index] || items[0];
  }

  function renderCaseSourcePanel(caseData) {
    const items = caseSourceItems(caseData);
    if (!items.length) return "";
    const active = activeCaseSource(caseData);
    return `
      <div class="case-source-panel">
        <div class="case-section-title">
          <strong>翻开本案卷宗</strong>
          <span>点选一条线索，看它怎样把现场、证人和证物接起来。</span>
        </div>
        <div class="source-tabs" aria-label="章节线索">
          ${items
            .map(
              (item) => `
                <button class="source-tab ${active?.index === item.index ? "active" : ""}" type="button" data-case-source="${item.index}">
                  <strong>${escapeHtml(item.storyTitle)}</strong>
                  <span>线索 ${item.index + 1}｜${active?.index === item.index ? "正在翻看" : "点击翻看"}</span>
                </button>
              `
            )
            .join("")}
        </div>
        <div class="source-detail">
          <strong>翻到这里，看见：${escapeHtml(active.storyTitle)}</strong>
          <p>${escapeHtml(active.storyNote)}</p>
          <small>出处：${escapeHtml(active.title)}</small>
        </div>
      </div>
    `;
  }

  function renderOpeningLines(caseData) {
    const lines = Array.isArray(caseData.openingLines) ? caseData.openingLines.slice(0, 3) : [];
    if (!lines.length) return "";
    return `
      <div class="opening-lines" aria-label="案件开场">
        ${lines
          .map(
            (line) => `
              <div>
                <strong>${escapeHtml(line.speaker || "记录")}</strong>
                <span>${escapeHtml(line.text || "")}</span>
              </div>
            `
          )
          .join("")}
      </div>
    `;
  }

  function renderInvestigation() {
    const caseData = currentCase();
    const progress = caseProgress(caseData.id);
    const inv = investigationProgress(caseData.id);
    const location = currentLocation(caseData);
    const inventoryCue = currentInventoryCue(caseData);
    state.screen = "investigation";
    renderStatus();
    app.innerHTML = `
      <section class="play-layout investigation-layout record-drawer-layout">
        <div>
          ${renderScene(location.name, state.speaker || "调查", state.message || "选择指令。移动到现场，查看可疑处，交谈获得提示，必要时向证人出示证物。", "investigation")}
          ${renderInvestigationMap(inv, location)}
          ${renderClueBoard(caseData, inv, location)}
          <div class="panel command-panel">
            <div class="command-tabs">
              ${renderCommandButton("move", "移动")}
              ${renderCommandButton("examine", "查看")}
              ${renderCommandButton("talk", "交谈")}
              ${renderCommandButton("present", "出示")}
            </div>
            <div class="command-body">
              ${renderInvestigationCommand(caseData, inv, location)}
            </div>
              ${renderCoachCard()}
            <div class="action-row investigation-actions">
              <button class="secondary-button" type="button" data-open-intro>案件概要</button>
              <button class="secondary-button inventory-target ${inventoryCue ? "inventory-target-active" : ""}" type="button" data-open-record>记录</button>
              <button class="primary-button" type="button" data-mode="trial" ${allEvidenceCollected(caseData) ? "" : "disabled"}>开庭</button>
              <button class="secondary-button compact-button" type="button" data-home>返回主菜单</button>
            </div>
          </div>
        </div>
        ${state.recordOpen ? `<button class="record-scrim" type="button" data-close-record aria-label="关闭法庭记录"></button>` : ""}
        ${renderRecordPanel(caseData, progress)}
      </section>
      ${renderRecordInspectModal(caseData)}
      ${renderEvidencePickup(caseData)}
      ${renderInventoryCue(caseData)}
      ${renderGuidePanel()}${renderSettings()}
    `;
    syncAudioForScreen();
  }

  function renderInvestigationMap(inv, location) {
    const caseData = currentCase();
    const sceneKey = caseData.scene?.key || "archive";
    const variant = location.sceneVariant || "site";
    const mapArt = locationBackgroundFile(caseData, location);
    const inspected = location.examineSpots.filter((_, index) => inv.examined.includes(`${inv.locationIndex}:${index}`)).length;
    const mapArtStyle = mapArt ? `style="--map-art: url('./assets/${escapeHtml(mapArt)}');"` : "";
    return `
      <div class="location-map scene-${sceneKey} variant-${variant}" ${mapArtStyle}>
        <div>
          <strong>${escapeHtml(location.name)}</strong>
          <span>${escapeHtml(location.description)}</span>
          <small>${escapeHtml(location.visualNote || caseData.scene?.tone || "")}</small>
          <em>${inspected}/${location.examineSpots.length} 处已检视。直接点击左侧现场标记查看。</em>
        </div>
      </div>
    `;
  }

  function renderInvestigationHotspots() {
    if (state.screen !== "investigation") return "";
    const caseData = currentCase();
    const inv = investigationProgress(caseData.id);
    const location = currentLocation(caseData);
    return `
      <div class="scene-hotspots" aria-label="现场可疑处">
        ${location.examineSpots
          .map((spot, index) => {
            const key = `${inv.locationIndex}:${index}`;
            const done = inv.examined.includes(key);
            return `
              <button class="scene-hotspot scene-hotspot-${index + 1} ${done ? "done" : ""}" type="button" data-examine-spot="${index}" aria-label="${escapeHtml(done ? `复查${spot.name}` : `查看${spot.name}`)}">
                <span>${escapeHtml(spot.name)}</span>
                <small>${done ? "已记录" : "查看"}</small>
              </button>
            `;
          })
          .join("")}
      </div>
    `;
  }

  function renderClueBoard(caseData, inv, location) {
    const collected = state.collected[caseData.id] || [];
    const examinedAtLocation = location.examineSpots
      .map((spot, index) => ({ spot, index, key: `${inv.locationIndex}:${index}` }))
      .filter((item) => inv.examined.includes(item.key));
    const latest = examinedAtLocation[examinedAtLocation.length - 1];
    const activeSpot = latest?.spot || location.examineSpots[0];
    const activeSpotIndex = latest?.index ?? 0;
    const activeDone = Boolean(latest);
    const closeup = closeupForSpot(activeSpot, location, caseData, activeDone);
    const locationEvidence = (location.evidenceIds || [])
      .map((id) => evidenceById(caseData, id))
      .filter(Boolean);
    const collectedHere = locationEvidence.filter((item) => collected.includes(item.id));
    const talkedHere = location.talkTopics.filter((_, index) => inv.talked.includes(`${inv.locationIndex}:${index}`));
    return `
      <div class="clue-board">
        <div class="clue-head">
          <span class="hero-kicker">线索特写</span>
          <strong>${examinedAtLocation.length}/${location.examineSpots.length} 处已检视</strong>
        </div>
        <div class="clue-focus">
          ${renderPropCloseup(closeup, activeSpotIndex)}
          <div class="clue-copy">
            <b>${escapeHtml(activeSpot?.name || "现场概览")}</b>
            <p>${escapeHtml(activeSpot?.text || location.visualNote || location.description)}</p>
          </div>
        </div>
        <div class="clue-grid">
          <div>
            <span>关联证物</span>
            <strong>${collectedHere.length}/${locationEvidence.length}</strong>
            <small>${collectedHere.map((item) => escapeHtml(item.name)).join("、") || "查看现场后补入法庭记录"}</small>
          </div>
          <div>
            <span>交谈线索</span>
            <strong>${talkedHere.length}/${location.talkTopics.length}</strong>
            <small>${talkedHere.map((item) => escapeHtml(item.title)).join("、") || "与现场人物交谈可补足动机"}</small>
          </div>
          <div>
            <span>现场判断</span>
            <strong>${collectedHere.length === locationEvidence.length ? "证物齐备" : "继续搜查"}</strong>
            <small>${escapeHtml(location.visualNote || caseData.scene?.tone || "观察现场变化，决定下一步行动。")}</small>
          </div>
        </div>
      </div>
    `;
  }

  function closeupForSpot(spot, location, caseData, done) {
    const name = spot?.name || "现场概览";
    const text = `${name} ${spot?.text || ""}`;
    const type = text.includes("屏风") || text.includes("影子")
      ? "screen"
      : text.includes("竹签")
        ? "bamboo"
        : text.includes("墨")
          ? "ink"
          : text.includes("辩状")
            ? "petition"
            : text.includes("铃")
              ? "bell"
              : "desk";
    const labels = {
      desk: "案几近景",
      screen: "屏风阴影",
      bamboo: "断签断面",
      ink: "墨迹湿痕",
      petition: "空白辩状",
      bell: "庭铃回声",
    };
    return {
      type,
      title: labels[type] || "现场近景",
      name,
      scene: caseData.scene?.name || location.name,
      status: done ? "已记录" : "待检视",
      motif: caseData.scene?.motif || "证",
    };
  }

  function renderPropCloseup(closeup, index) {
    return `
      <div class="prop-closeup prop-${escapeHtml(closeup.type)} ${closeup.status === "已记录" ? "inspected" : ""}" data-spot-index="${index}">
        <span class="prop-kicker">${escapeHtml(closeup.status)}</span>
        <div class="prop-stage" aria-hidden="true">
          <span class="prop-mark">${escapeHtml(closeup.motif)}</span>
        </div>
        <strong>${escapeHtml(closeup.title)}</strong>
        <small>${escapeHtml(closeup.scene)}</small>
      </div>
    `;
  }

  function renderCommandButton(command, label) {
    const caseData = currentCase();
    const inv = investigationProgress(caseData.id);
    const keys = {
      move: "1",
      examine: "2",
      talk: "3",
      present: "4",
    };
    const key = keys[command] || "";
    return `<button class="command-button ${inv.command === command ? "active" : ""}" type="button" data-command="${command}"><span class="command-key">${escapeHtml(key)}</span>${escapeHtml(label)}</button>`;
  }

  function renderInvestigationCommand(caseData, inv, location) {
    if (inv.command === "move") {
      return `
        <h2>移动</h2>
        <div class="location-list">
          ${caseData.locations
            .map(
              (item, index) => `
                <button class="location-button ${inv.locationIndex === index ? "selected" : ""}" type="button" data-move-location="${index}">
                  <strong>${escapeHtml(item.name)}</strong>
                  <span>${escapeHtml(item.description)}</span>
                </button>
              `
            )
            .join("")}
        </div>
      `;
    }
    if (inv.command === "examine") {
      return `
        <h2>查看</h2>
        <p class="hint-text">在左侧现场图上点击发光标记。已记录的位置会变成绿色，可随时复查。</p>
        <div class="spot-status-list">
          ${location.examineSpots
            .map((spot, index) => {
              const key = `${inv.locationIndex}:${index}`;
              const done = inv.examined.includes(key);
              return `
                <div class="spot-status ${done ? "done" : ""}">
                  <strong>${escapeHtml(spot.name)}</strong>
                  <span>${done ? "已记录" : "待查看"}</span>
                </div>
              `;
            })
            .join("")}
        </div>
      `;
    }
    if (inv.command === "talk") {
      return `
        <h2>交谈</h2>
        <div class="location-list">
          ${location.talkTopics
            .map((topic, index) => {
              const key = `${inv.locationIndex}:${index}`;
              const done = inv.talked.includes(key);
              return `
                <button class="location-button ${done ? "selected" : ""}" type="button" data-talk-topic="${index}">
                  <strong>${done ? "✓ " : ""}${escapeHtml(topic.title)}</strong>
                  <span>${escapeHtml(topic.speaker)}</span>
                </button>
              `;
            })
            .join("")}
        </div>
      `;
    }
    const owned = collectedEvidence(caseData);
    return `
      <h2>出示</h2>
      <p class="hint-text">向现场人物出示证物可获得提示。庭审中才会正式扣除信誉。</p>
      <div class="location-list">
        ${owned
          .map(
            (item) => `
              <button class="location-button" type="button" data-present-investigation="${item.id}">
                <strong>${escapeHtml(item.name)}</strong>
                <span>${escapeHtml(item.use)}</span>
              </button>
            `
          )
          .join("") || `<p class="hint-text">还没有可出示的证物。先查看现场。</p>`}
      </div>
    `;
  }

  function renderTrial() {
    const caseData = currentCase();
    const progress = caseProgress(caseData.id);
    if (state.pursuitUnlockCue && state.pursuitUnlockCue.caseId === caseData.id) {
      renderPursuitUnlockCue();
      return;
    }
    if (progress.awaitingInterlude) {
      renderTestimonyInterlude();
      return;
    }
    if (progress.pendingDeductionFollowUp) {
      renderDeductionFollowUp();
      return;
    }
    const testimony = caseData.testimony[progress.testimonyIndex];
    const { statement, rawIndex } = currentStatementEntry(testimony, progress);
    const selectedLabel = selectedRecordLabel(caseData);
    const visibleStatements = visibleStatementEntries(testimony, progress);
    const readyToPresent = statementReadyToPresent(statement, progress, progress.testimonyIndex, rawIndex);
    const trialDeduction = trialDeductionForStatement(caseData, statement, progress, progress.testimonyIndex, rawIndex);
    const recordPrompt = readyToPresent
      ? selectedLabel
        ? "破绽已经逼出来了。确认这份记录能反驳当前句，可直接按 E/Enter 提交举证。"
        : statement.answerProfile
          ? "破绽已经逼出来了。打开人物档案，选中能推翻当前句的人。"
          : "破绽已经逼出来了。打开证物记录，选中能推翻当前句的证物。可按 E 直接提交。"
      : "右侧法庭记录只负责选择；点击下方“举证”才会提交。";
    state.screen = "trial";
    renderStatus();
    app.innerHTML = `
      <section class="play-layout trial-layout record-drawer-layout">
        <div>
          ${renderScene(testimony.title, testimony.speaker, statement.text, "trial")}
          <div class="panel trial-panel">
            ${renderTrialHeader(testimony, progress)}
            ${renderCredibility(progress)}
            ${renderPressurePanel(progress)}
            ${renderTurnaboutPanel(progress)}
            ${renderStatementNav(testimony, progress)}
            ${state.message ? `<div class="toast ${state.dramaticCue ? "dramatic" : ""}">${escapeHtml(state.message)}</div>` : ""}
            ${renderCoachCard()}
            ${renderTrialDeductionPanel(trialDeduction)}
            <div class="selected-record-bar ${selectedLabel ? "ready" : ""} ${readyToPresent ? "opportunity" : ""}">
              <span>${selectedLabel ? `已选：${escapeHtml(selectedLabel)}` : "尚未选择证物或人物档案"}</span>
              <small>${escapeHtml(recordPrompt)}</small>
            </div>
          <div class="action-row trial-actions">
            <button class="secondary-button compact-button" type="button" data-home>返回主菜单</button>
            <button class="primary-button" type="button" data-press>追问</button>
            <button class="secondary-button record-open-button ${readyToPresent ? "opportunity" : ""}" type="button" data-open-record>记录</button>
            <button class="danger-button present-button ${readyToPresent && selectedLabel ? "opportunity" : ""}" type="button" data-present ${selectedLabel ? "" : "disabled"}><span class="action-key">E</span>举证</button>
          </div>
        </div>
        </div>
        ${state.recordOpen ? `<button class="record-scrim" type="button" data-close-record aria-label="关闭法庭记录"></button>` : ""}
        ${renderRecordPanel(caseData, progress, true)}
      </section>
      ${renderCue()}
      ${renderObjectionReveal()}
      ${renderRecordInspectModal(caseData)}
      ${renderGuidePanel()}${renderSettings()}
    `;
    syncAudioForScreen();
    queueMobileTrialStageFocus();
  }

  function renderTrialDeductionPanel(trialDeduction) {
    if (!trialDeduction) return "";
    return `
      <div class="trial-deduction-card">
        <strong>对照札记可用</strong>
        <span>${escapeHtml(trialDeduction.deduction.text)}</span>
        <small>这条札记来自已对照证物。回到证物记录，找带有“已对照”的记录后再正式举证。</small>
      </div>
    `;
  }

  function renderDeductionFollowUp() {
    const caseData = currentCase();
    const progress = caseProgress(caseData.id);
    const followUp = progress.pendingDeductionFollowUp;
    if (!followUp) {
      renderTrial();
      return;
    }
    const testimony = caseData.testimony[Number(followUp.testimonyIndex) || 0];
    const statement = testimony?.statements?.[Number(followUp.rawIndex) || 0];
    state.screen = "trial";
    renderStatus();
    app.innerHTML = `
    <section class="deduction-followup" data-continue-deduction-followup-panel role="button" tabindex="0" aria-label="继续追击">
      <div class="deduction-followup-stage">
          <span class="hero-kicker">追击证词</span>
          <h2>${escapeHtml(followUp.pursuitTitle || "对照札记打开了新缺口")}</h2>
          <p>${escapeHtml(statement?.text || followUp.target || "证人的说法已经动摇。")}</p>
          <div class="deduction-followup-grid">
            <div>
              <strong>${escapeHtml(followUp.record || "关键证物")}</strong>
              <span>${escapeHtml(followUp.deductionText || "庭前对照已经指出证物之间能互相咬合。")}</span>
            </div>
            <div>
              <strong>证人露出的破绽</strong>
              <span>${escapeHtml(followUp.chaseLine || "既然证物之间已经对上，证人不能再把它说成孤立巧合。")}</span>
            </div>
            <div>
              <strong>${escapeHtml(caseData.witness || "证人")}的反应</strong>
              <span>${escapeHtml(followUp.witnessLine || "证人没有立刻回答，反而看向了对手席。")}</span>
            </div>
          </div>
          <div class="deduction-followup-actions">
            ${followUp.unlockEvidenceName ? `<span class="deduction-followup-unlock">追击成立后写入法庭记录：${escapeHtml(followUp.unlockEvidenceName)}</span>` : ""}
            <button class="secondary-button" type="button" data-home>返回主菜单</button>
            <span class="panel-continue-hint">点击任意处继续追击</span>
          </div>
        </div>
      </section>
      ${renderCue()}
      ${renderSettings()}
    `;
    syncAudioForScreen();
  }

  function renderPursuitUnlockCue() {
    const caseData = currentCase();
    const progress = caseProgress(caseData.id);
    const cue = state.pursuitUnlockCue;
    if (!cue || cue.caseId !== caseData.id) {
      renderTrial();
      return;
    }
    const item = cue.unlockEvidenceId ? evidenceById(caseData, cue.unlockEvidenceId) : null;
    state.screen = "trial";
    renderStatus();
    app.innerHTML = `
      <section class="pursuit-unlock-layer" data-continue-pursuit-unlock role="button" tabindex="0" aria-label="返回庭审">
        <section class="pursuit-unlock-card">
          <span class="hero-kicker">对照追击成立</span>
          <div class="pursuit-unlock-ribbon" aria-hidden="true">突破口已确认</div>
          <h2>${escapeHtml(cue.pursuitTitle || "法庭记录已扩展")}</h2>
          <div class="pursuit-unlock-main">
            ${item ? `<div class="pickup-art">${renderEvidenceThumb(item, true, "pickup", caseData)}</div>` : ""}
            <div class="pursuit-unlock-copy">
              <p>${escapeHtml(cue.unlockText || "追击成立后，新的证据与证词关系已经被补齐。")}</p>
              ${cue.unlockEvidenceName ? `<span class="pursuit-unlock-evidence">${escapeHtml(cue.unlockEvidenceName)} · 已写入法庭记录</span>` : ""}
              ${cue.unlockStatementText ? `<span>新证词追加：${escapeHtml(cue.unlockStatementText)}</span>` : ""}
            </div>
          </div>
          <div class="pursuit-unlock-actions">
            <button class="secondary-button" type="button" data-home>返回主菜单</button>
            <span class="panel-continue-hint">点击任意处返回庭审</span>
          </div>
        </section>
      </section>
      ${renderCue()}${renderSettings()}
    `;
    syncAudioForScreen();
    queueMobileTrialStageFocus();
  }

  function queueMobileTrialStageFocus() {
    if (state.screen !== "trial" || state.recordOpen || state.recordInspect) return;
    if (!window.matchMedia("(max-width: 820px)").matches) return;
    requestAnimationFrame(() => {
      const scene = app.querySelector(".scene.trial");
      if (!scene) return;
      const topbarHeight = document.querySelector(".topbar")?.getBoundingClientRect().height || 0;
      const top = Math.max(0, window.scrollY + scene.getBoundingClientRect().top - topbarHeight - 8);
      window.scrollTo({ top, behavior: "auto" });
    });
  }

  function renderTestimonyInterlude() {
    const caseData = currentCase();
    const progress = caseProgress(caseData.id);
    const testimony = caseData.testimony[progress.testimonyIndex];
    const previous = caseData.testimony[progress.testimonyIndex - 1];
    const stagePose = currentStagePose();
    const interludePoseLabel = poseLabel(stagePose.left);
    state.screen = "trial-interlude";
    renderStatus();
    app.innerHTML = `
      <section class="trial-interlude">
        <div class="interlude-stage portrait-${portraitForSpeaker(caseData, testimony.speaker, "trial")} pose-left-${stagePose.left}" data-continue-testimony-panel role="button" tabindex="0" aria-label="继续交叉询问">
          ${interludePoseLabel ? `<span class="interlude-pose">${escapeHtml(interludePoseLabel)}</span>` : ""}
          <span class="hero-kicker">证词更新</span>
          <h2>${escapeHtml(testimony.title)}</h2>
          <p>${escapeHtml(progress.lastObjection || "上一段证词已经动摇。证人必须重新组织说法。")}</p>
          ${renderCoachCard()}
          ${renderTurnaboutPanel(progress)}
          <div class="interlude-flow">
            <div><strong>${escapeHtml(previous?.title || "上一段证词")}</strong><span>已击破</span></div>
            <div><strong>${escapeHtml(testimony.title)}</strong><span>${escapeHtml(testimony.speaker)}｜${visibleStatementEntries(testimony, progress).length} 句证词</span></div>
          </div>
          <div class="interlude-actions">
            <button class="secondary-button" type="button" data-home>返回主菜单</button>
            <span class="panel-continue-hint">点击任意处继续交叉询问</span>
          </div>
        </div>
      </section>
      ${renderCue()}
      ${renderGuidePanel()}${renderSettings()}
    `;
    syncAudioForScreen();
  }

  function renderScene(title, speaker, text, mode) {
    const speedClass = `speed-${state.settings.textSpeed}`;
    const caseData = currentCase();
    const location = mode === "investigation" ? currentLocation(caseData) : null;
    const progress = mode === "trial" ? caseProgress(caseData.id) : null;
    const testimony = progress && caseData.testimony[progress.testimonyIndex];
    const visibleStatements = testimony ? visibleStatementEntries(testimony, progress) : [];
    const hasNextStatement = progress && progress.statementIndex < visibleStatements.length - 1;
    const hasPrevStatement = progress ? progress.statementIndex > 0 : false;
    const leftPortrait = portraitForSpeaker(caseData, speaker, mode);
    const rightPortrait = mode === "trial" ? caseData.opponentPortrait || "censor" : "empress";
    const focus = mode === "trial" ? state.stageFocus : "center";
    const stagePose = mode === "trial" ? currentStagePose() : defaultStagePose;
    const sceneKey = caseData.scene?.key || "archive";
    const sceneMotif = mode === "investigation" ? caseData.scene?.motif || "" : "";
    const sceneTone = mode === "investigation" ? caseData.scene?.tone || "" : "";
    const notice = mode === "trial" && state.stageNotice ? `<div class="camera-notice">${escapeHtml(state.stageNotice)}</div>` : "";
    const leftPoseLabel = mode === "trial" ? poseLabel(stagePose.left) : "";
    const rightPoseLabel = mode === "trial" ? poseLabel(stagePose.right) : "";
    const hasInvestigationBeat = mode === "investigation" && state.investigationBeat;
    const trialSceneAttr = mode === "trial"
      ? `data-advance-trial-scene="1" role="button" tabindex="0" aria-label="庭审场景区域可直接切换证词"`
      : "";
    const trialAdvanceAttr = mode === "trial"
      ? `data-advance-trial-dialogue="1" role="button" tabindex="0" aria-label="${hasPrevStatement ? "可回退/前进证词" : "继续查看证词下一句"}"`
      : "";
    const vulnerabilityCue = mode === "trial" ? renderTrialVulnerabilityCue() : "";
    const locationArt = location
      ? locationBackgroundFile(caseData, location)
      : trialBackgroundFile(caseData);
    const locationStyle = locationArt ? `style="--location-art: url('./assets/${escapeHtml(locationArt)}');"` : "";
    const trialAdvanceHint = mode === "trial"
      ? hasPrevStatement
        ? hasNextStatement
          ? "左侧点击可回退一句，右侧点击可继续下一句"
          : "左侧点击可回退一句，当前句可直接追问 / 打开记录 / 举证"
        : hasNextStatement
          ? "右侧点击可继续下一句，或按空格/回车"
          : "当前句可直接追问 / 打开记录 / 举证"
      : "";
    return `
      <div class="scene ${mode} ${sceneKey ? `scene-${sceneKey}` : ""} focus-${focus} pose-left-${stagePose.left} pose-right-${stagePose.right} ${vulnerabilityCue ? "vulnerability-ready" : ""} ${hasInvestigationBeat ? "has-investigation-beat" : ""} ${state.settings.reducedMotion ? "reduced-motion" : ""}" data-motif="${escapeHtml(sceneMotif)}" ${trialSceneAttr} ${locationStyle}>
        ${
          mode === "trial"
            ? `<div class="stage-layer">
                <div class="spotlight spotlight-left" aria-hidden="true"></div>
                <div class="spotlight spotlight-right" aria-hidden="true"></div>
                <div class="portrait portrait-left portrait-${leftPortrait}" aria-hidden="true"></div>
                <div class="bench-line"></div>
                <div class="portrait portrait-right portrait-${rightPortrait}" aria-hidden="true"></div>
              </div>`
            : ""
        }
        ${leftPoseLabel ? `<div class="pose-cue pose-cue-left">${escapeHtml(leftPoseLabel)}</div>` : ""}
        ${rightPoseLabel ? `<div class="pose-cue pose-cue-right">${escapeHtml(rightPoseLabel)}</div>` : ""}
        ${notice}
        ${vulnerabilityCue}
        ${mode === "investigation" && sceneTone ? `<div class="scene-atmosphere">${escapeHtml(sceneTone)}</div>` : ""}
        <div class="scene-title">${escapeHtml(title)}</div>
        ${mode === "investigation" ? renderInvestigationHotspots() : ""}
        ${hasInvestigationBeat ? renderInvestigationBeat() : `
          <div class="dialogue-box ${speedClass} ${hasNextStatement ? "trial-dialogue-advance" : ""}" ${trialAdvanceAttr}>
            <span class="dialogue-speaker">${escapeHtml(speaker)}</span>
            <div>${escapeHtml(text)}</div>
            <div class="dialogue-advance-hint">${escapeHtml(trialAdvanceHint)}</div>
          </div>
        `}
      </div>
    `;
  }

  function locationBackgroundFile(caseData, location) {
    const sceneKey = caseData.scene?.key || "palace";
    const variant = location.sceneVariant || "site";
    return `location-bg-${sceneKey}-${variant}.png`;
  }

  function trialBackgroundFile(caseData) {
    const sceneKey = caseData.scene?.key || "palace";
    const trialMap = {
      palace: "episode-art-palace.png",
      "east-palace": "episode-art-east-palace.png",
      "bronze-urn": "episode-art-bronze-urn.png",
      censorate: "episode-art-censorate.png",
      "night-gate": "episode-art-night-gate.png",
    };
    return trialMap[sceneKey] || "courtroom-bg-v1.png";
  }

  function renderTrialVulnerabilityCue() {
    const caseData = currentCase();
    const progress = caseProgress(caseData.id);
    const testimony = caseData.testimony[progress.testimonyIndex];
    if (!testimony) return "";
    const { statement, rawIndex } = currentStatementEntry(testimony, progress);
    if (!statementReadyToPresent(statement, progress, progress.testimonyIndex, rawIndex)) return "";
    const target = statement.answerProfile ? "人物档案" : "证物记录";
    return `
      <div class="vulnerability-cue" aria-live="polite">
        <strong>破绽已现</strong>
        <span>${escapeHtml(target)}能反驳当前句</span>
        <small>打开记录，选准后再举证。</small>
      </div>
    `;
  }

  function renderInvestigationBeat() {
    const beat = state.investigationBeat;
    if (!beat) return "";
    const caseData = currentCase();
    const lines = beat.lines?.length ? beat.lines : [{ speaker: beat.speaker, text: beat.text }];
    const lineIndex = Math.max(0, Math.min(lines.length - 1, Number(beat.lineIndex || 0)));
    const line = lines[lineIndex] || lines[0];
    const hasPrevious = lineIndex > 0;
    const hasNext = lineIndex < lines.length - 1;
    const portrait = investigationPortraitForSpeaker(caseData, line.speaker);
    const pose = line.speaker.includes("辩") ? "assert" : "";
    const evidenceLine = beat.evidenceNames?.length ? `<small>新证物：${escapeHtml(beat.evidenceNames.join("、"))}</small>` : "";
    return `
      <div class="investigation-beat" data-advance-investigation-panel role="button" tabindex="0" aria-live="polite" aria-label="${hasNext ? "点击继续调查对白" : "点击收起调查对白"}">
        <i class="beat-portrait portrait-${escapeHtml(portrait)} ${pose ? `pose-${pose}` : ""}" aria-hidden="true"></i>
        <div class="beat-head">
          <span>${escapeHtml(beat.kind)}</span>
          <strong>${escapeHtml(line.speaker)}</strong>
          <b>${lineIndex + 1}/${lines.length}</b>
        </div>
        <p>${escapeHtml(line.text)}</p>
        <div class="beat-meta">
          <em>${escapeHtml(beat.result)}</em>
          ${evidenceLine}
        </div>
        <div class="beat-controls">
          ${hasPrevious ? `<button class="beat-next-button secondary" type="button" data-retreat-investigation-beat>上一句</button>` : ""}
        </div>
      </div>
    `;
  }

  function renderEvidencePickup(caseData) {
    const view = currentEvidencePickup(caseData);
    if (!view) return "";
    const { item, index, items } = view;
    const hasNext = index < items.length - 1;
    const counterCopy = item.counterRisk ? `慎用：${item.counterRisk}` : "已收入法庭记录，庭审中可以先选中它，再正式举证。";
    return `
      <div class="evidence-pickup-layer" aria-live="assertive">
        <section class="evidence-pickup-card" data-advance-pickup-panel role="button" tabindex="0" aria-label="${hasNext ? "点击收入下一件证物" : "点击收起证物取得演出"}">
          <div class="pickup-kicker">
            <span>证物取得</span>
            <b>${index + 1}/${items.length}</b>
          </div>
          <div class="pickup-main">
            <div class="pickup-art">
              ${renderEvidenceThumb(item, true, "pickup", caseData)}
            </div>
            <div class="pickup-copy">
              <h2>${escapeHtml(item.name)}</h2>
              <p>${escapeHtml(item.summary || item.detail || "这件物品已经加入法庭记录。")}</p>
              <small>${escapeHtml(item.type)}｜${escapeHtml(item.source)}</small>
            </div>
          </div>
          <div class="pickup-note">
            <strong>记录提示</strong>
            <span>${escapeHtml(counterCopy)}</span>
          </div>
          <div class="pickup-actions">
            <button class="secondary-button" type="button" data-open-record>打开记录</button>
            <span class="panel-continue-hint">点击任意处${hasNext ? "收入下一件证物" : "离开收集界面"}</span>
          </div>
        </section>
      </div>
    `;
  }

  function renderInventoryCue(caseData) {
    const view = currentInventoryCue(caseData);
    if (!view) return "";
    const { item, cue } = view;
    return `
      <div class="inventory-add-cue" data-inventory-cue="${escapeHtml(cue.itemId)}" aria-live="polite">
        <div class="inventory-flight-card">
          ${renderEvidenceThumb(item, true, "flight", caseData)}
          <span>收入记录</span>
        </div>
        <div class="inventory-target-burst" aria-hidden="true">记录</div>
      </div>
    `;
  }

  function renderTrialHeader(testimony, progress) {
    const moodLabels = {
      cautious: "谨慎",
      aggressive: "强硬",
      decisive: "决断",
    };
    return `
      <div class="trial-header">
        <span>交叉询问 ${progress.testimonyIndex + 1}/${currentCase().testimony.length}</span>
        <strong>${escapeHtml(testimony.title)}</strong>
        <span>${escapeHtml(testimony.speaker)}｜${moodLabels[testimony.mood] || "证言"}</span>
      </div>
    `;
  }

  function renderStatementNav(testimony, progress) {
    const entries = visibleStatementEntries(testimony, progress);
    return `
      <div class="statement-strip" aria-label="证词句段">
        ${entries
          .map(({ statement, rawIndex }, index) => {
            const active = index === progress.statementIndex;
            const key = statementKey(progress.testimonyIndex, rawIndex);
            const pressed = progress.pressed.includes(key);
            const solved = progress.solved.includes(key);
            const revealed = Boolean(statement.hiddenUntilPressed);
            const suspicious = statementHasAnswer(statement);
            const ready = statementReadyToPresent(statement, progress, progress.testimonyIndex, rawIndex);
            const status = solved ? "已突破" : ready ? "可举证" : pressed ? "已追问" : revealed ? "新证词" : suspicious ? "有疑点" : "未追问";
            return `
              <button class="statement-card ${active ? "active" : ""} ${pressed ? "pressed" : ""} ${solved ? "solved" : ""} ${revealed ? "revealed" : ""} ${suspicious ? "suspicious" : ""} ${ready ? "ready-present" : ""}" type="button" data-jump-statement="${index}">
                <span>${index + 1}</span>
                <p>${escapeHtml(statement.text)}</p>
                <small>${status}</small>
              </button>
            `;
          })
          .join("")}
      </div>
    `;
  }

  function renderResult() {
    const caseData = currentCase();
    const progress = caseProgress(caseData.id);
    const record = caseRecord(caseData.id);
    state.screen = "result";
    window.scrollTo(0, 0);
    renderStatus();
    app.innerHTML = `
      <section class="result">
        <div class="panel verdict-panel">
        <div class="case-meta">
          <span class="tag">判决</span>
          <span class="tag">结案</span>
          <span class="tag medal-tag">${escapeHtml(medalForGrade(progress.grade || gradeForCase(progress)))}</span>
          <span class="tag">评价 ${escapeHtml(progress.grade || gradeForCase(progress))}</span>
          <span class="tag">最佳 ${escapeHtml(record.bestMedal || medalForGrade(progress.grade || gradeForCase(progress)))}</span>
        </div>
          <h2>${escapeHtml(caseData.title)}</h2>
          <p>${escapeHtml(caseData.verdict)}</p>
          <div class="result-stats">
            <div><strong>${progress.mistakes}</strong><span>本次失误</span></div>
            <div><strong>${progress.deductionPursuits || 0}</strong><span>札记追击</span></div>
            <div><strong>${progress.deductionPursuitUnlocks || 0}</strong><span>追击补记</span></div>
            <div><strong>${record.bestMistakes ?? progress.mistakes}</strong><span>最佳失误</span></div>
            <div><strong>${record.clears || 1}</strong><span>结案次数</span></div>
          </div>
          ${renderCoachCard()}
          <div class="timeline-list">
            ${caseData.timeline
              .slice(0, 5)
              .map((item) => `<div><strong>${escapeHtml(timelineLabel(item))}</strong><span>${escapeHtml(item.title)}</span></div>`)
              .join("")}
          </div>
          <div class="action-row">
            <button class="secondary-button" type="button" data-home>返回主菜单</button>
            <button class="primary-button" type="button" data-return-case>返回案件</button>
            <button class="secondary-button" type="button" data-next-case>下一案</button>
          </div>
        </div>
      </section>
      ${renderCue()}
      ${renderGuidePanel()}${renderSettings()}
    `;
    syncAmbienceForScreen();
  }

  function renderBadEnding() {
    const caseData = currentCase();
    const progress = caseProgress(caseData.id);
    state.screen = "bad-ending";
    window.scrollTo(0, 0);
    renderStatus();
    app.innerHTML = `
      <section class="result bad-ending">
        <div class="panel verdict-panel collapse-panel">
          <div class="case-meta">
            <span class="tag danger-tag">败诉</span>
            <span class="tag">信誉归零</span>
            <span class="tag">失误 ${progress.mistakes}</span>
          </div>
          <span class="hero-kicker">庭审崩盘</span>
          <h2>${escapeHtml(caseData.title)}</h2>
          <p>${escapeHtml(caseData.badEnding || "辩方未能维持法庭信誉，证词链条被原判吞没。")}</p>
          <div class="action-row">
            <button class="danger-button" type="button" data-retry-trial>重审庭审</button>
            <button class="secondary-button" type="button" data-open-intro>整理案卷</button>
            <button class="secondary-button" type="button" data-home>返回主菜单</button>
            <button class="primary-button" type="button" data-return-case>返回案件</button>
          </div>
          <div class="evidence-detail">
            <strong>最后压制</strong>
            <p>${escapeHtml(progress.failureReason || state.message || "错误举证让对方夺回庭审节奏。")}</p>
            <small>已取得的调查证物会保留。重审将从第一段证词重新开始。</small>
          </div>
          ${renderCoachCard()}
          <div class="result-stats">
            <div><strong>${progress.mistakes}</strong><span>本次失误</span></div>
            <div><strong>${progress.counterattacks || 0}</strong><span>反制次数</span></div>
            <div><strong>${progress.recoveries || 0}</strong><span>补救次数</span></div>
            <div><strong>${progress.turnabouts || 0}</strong><span>逆转次数</span></div>
          </div>
        </div>
      </section>
      ${renderCue()}
      ${renderGuidePanel()}${renderSettings()}
    `;
  }

  function renderCredibility(progress) {
    const caseData = currentCase();
    const percent = Math.max(0, Math.min(100, progress.credibility * 20));
    const level = pressureLevel(progress);
    return `
      <div class="meter pressure-${level}">
        <strong>法庭信誉 <span>${escapeHtml(pressureBeat(caseData, level).label)}</span></strong>
        <div class="meter-bar"><div class="meter-fill" style="width:${percent}%"></div></div>
      </div>
    `;
  }

  function renderPressurePanel(progress) {
    const caseData = currentCase();
    const level = pressureLevel(progress);
    if (level === "stable") return "";
    const copy = pressureBeat(caseData, level);
    return `
      <div class="pressure-panel pressure-${level}">
        <strong>${escapeHtml(copy.title)}</strong>
        <span>${escapeHtml(copy.body)}</span>
        ${copy.opponentLine ? `<em>${escapeHtml(copy.opponentLine)}</em>` : ""}
      </div>
    `;
  }

  function renderTurnaboutPanel(progress) {
    if (!progress.lastTurnabout) return "";
    const caseData = currentCase();
    const copy = turnaboutBeat(caseData);
    return `
      <div class="turnabout-panel">
        <strong>${escapeHtml(progress.lastTurnabout)}</strong>
        <span>${escapeHtml(copy.body)}</span>
        ${copy.opponentLine ? `<em>${escapeHtml(copy.opponentLine)}</em>` : ""}
      </div>
    `;
  }

  function renderRecordPanel(caseData, progress, selectable) {
    return `
      <aside class="record-panel ${state.recordOpen ? "open" : ""}">
        <div class="record-header">
          <h2>法庭记录</h2>
          <div class="record-header-actions">
            <span class="tag">Tab 切换</span>
            <button class="record-close-button" type="button" data-close-record>关闭</button>
          </div>
        </div>
        <div class="record-tabs">
          ${renderRecordTab("evidence", "证物")}
          ${renderRecordTab("profiles", "人物")}
          ${renderRecordTab("timeline", "时间线")}
          ${renderRecordTab("backlog", "记录")}
        </div>
        <div class="record-body">
          ${renderRecordBody(caseData, progress, selectable)}
        </div>
      </aside>
    `;
  }

  function renderRecordTab(tab, label) {
    return `<button class="record-tab ${state.recordTab === tab ? "active" : ""}" type="button" data-record-tab="${tab}">${label}</button>`;
  }

  function evidenceVisualFor(item, owned = true) {
    if (!owned) return { type: "locked", label: "未" };
    if (!item) return { type: "file", label: "" };
    const name = item.name || "";
    const chapterMatch = name.match(/卷宗(\d+)/);
    if (item.counterRisk) return { type: "risk", label: "" };
    if (name.includes("收益图")) return { type: "map", label: "" };
    if (name.includes("札记") || item.trialOnly) return { type: "note", label: "" };
    if (chapterMatch) return { type: "record", label: "" };
    return { type: "file", label: "" };
  }

  function evidenceSheetPosition(item, caseData) {
    const row = Math.max(0, data.cases.findIndex((entry) => entry.id === caseData?.id));
    const col = Math.max(0, (caseData?.evidence || []).findIndex((entry) => entry.id === item?.id));
    const x = col <= 0 ? 0 : (col / Math.max(1, evidenceSheetColumns - 1)) * 100;
    const y = row <= 0 ? 0 : (row / Math.max(1, evidenceSheetRows - 1)) * 100;
    return { row, col, x, y };
  }

  function evidenceArtStyle(item, caseData) {
    const position = evidenceSheetPosition(item, caseData);
    return `style="--evidence-art-x:${position.x.toFixed(4)}%; --evidence-art-y:${position.y.toFixed(4)}%;"`;
  }

  function renderEvidenceThumb(item, owned, size = "small", caseData = currentCase()) {
    const visual = evidenceVisualFor(item, owned);
    const position = evidenceSheetPosition(item, caseData);
    const mark = visual.label ? `<span class="evidence-thumb-mark">${escapeHtml(visual.label)}</span>` : "";
    return `
      <span class="evidence-thumb evidence-art evidence-thumb-${escapeHtml(size)} evidence-${escapeHtml(visual.type)}" ${evidenceArtStyle(item, caseData)} data-evidence-art="${position.row}-${position.col}" aria-hidden="true">
        ${mark}
        <span class="evidence-thumb-lines"></span>
      </span>
    `;
  }

  function renderRecordBody(caseData, progress, selectable) {
    if (state.recordTab === "profiles") {
      const selectedProfile = exactProfileByName(state.selectedProfileName);
      return `
        <div class="record-list">
          ${data.profiles
            .map(
              (profile) => `
                <button class="evidence-button ${state.selectedProfileName === profile.name ? "selected" : ""}" type="button" data-select-profile="${escapeHtml(profile.name)}">
                  <span class="profile-row">
                    <span class="profile-thumb portrait-${profile.portrait}" aria-hidden="true"></span>
                    <span>
                      <strong>${escapeHtml(profile.name)}：${escapeHtml(profile.role)}</strong>
                      <span>${escapeHtml(profile.note)}</span>
                    </span>
                  </span>
                </button>
              `
            )
            .join("")}
        </div>
        ${
          selectedProfile
            ? `<div class="evidence-detail profile-detail"><strong>${escapeHtml(selectedProfile.name)}</strong><span>${escapeHtml(selectedProfile.role)}</span><p>${escapeHtml(selectedProfile.note)}</p><small>${state.screen === "trial" ? "人物档案已拿在手上；带回庭审后再正式举证。" : "庭审中选中人物后也可以“举证”。"}</small><div class="detail-actions"><button class="secondary-button" type="button" data-inspect-record="profile">详查人物</button></div>${renderRecordReturnAction()}</div>`
            : `<p class="hint-text">选择人物查看档案。庭审中人物档案也可能成为矛盾证据。</p>`
        }
      `;
    }
    if (state.recordTab === "timeline") {
      const timelineSource = timelineSourceSummary(currentCase(), caseData.timeline[state.caseSourceIndex] || caseData.timeline[0]);
      const timelineSourceText = timelineSource?.storyTitle || "尚未对应卷宗";
      const timelineSourceNote = timelineSource?.storyNote || "时间线条目可点击，快速定位线索文本。";
      return `
        <div class="timeline-list">
          ${caseData.timeline
            .map((item, index) => {
              const sourceIndex = timelineSourceIndex(caseData, item, index);
              const activeSource = sourceIndex === state.caseSourceIndex;
              return `
                <button class="timeline-row ${activeSource ? "active" : ""}" type="button" data-timeline-source="${sourceIndex}">
                  <strong>${escapeHtml(timelineLabel(item, index))}</strong>
                  <span>${escapeHtml(item.title)}</span>
                  <small>${escapeHtml(item.note)}</small>
                </button>
              `;
            })
            .join("")}
        </div>
        <div class="timeline-source-note">
          <strong>${escapeHtml(timelineSourceText)}</strong>
          <small>${escapeHtml(timelineSourceNote)}</small>
        </div>
      `;
    }
    if (state.recordTab === "backlog") {
      return `
        <div class="backlog-list">
          ${state.backlog
            .map((item) => `<div><strong>${escapeHtml(item.speaker)}</strong><span>${escapeHtml(item.message)}</span><small>${escapeHtml(item.at)}</small></div>`)
            .join("") || `<p class="hint-text">暂无对话记录。</p>`}
        </div>
      `;
    }
    const collected = state.collected[caseData.id] || [];
    return `
      <p>${escapeHtml(caseData.defendant)}</p>
      <div class="record-list">
        ${caseData.evidence
          .map((item) => {
            const owned = collected.includes(item.id);
            const active = state.selectedEvidenceId === item.id;
            const disabled = !owned ? "disabled" : "";
            const lockedText = item.trialOnly ? "庭审追问可取得" : "尚未取得";
            const deduction = deductionForEvidence(caseData, item.id);
            return `
              <button class="evidence-button ${active ? "selected" : ""}" type="button" data-select-evidence="${item.id}" ${disabled}>
                <span class="evidence-row">
                  ${renderEvidenceThumb(item, owned, "small", caseData)}
                  <span class="evidence-copy">
                    <strong>${escapeHtml(item.name)}${deduction ? `<em class="deduction-badge">已对照</em>` : ""}</strong>
                    <span>${owned ? escapeHtml(item.summary) : lockedText}</span>
                  </span>
                </span>
              </button>
            `;
          })
          .join("")}
      </div>
      ${renderSelectedEvidence(caseData)}
    `;
  }

  function renderSelectedEvidence(caseData) {
    const item = state.selectedEvidenceId ? evidenceById(caseData, state.selectedEvidenceId) : null;
    if (!item) {
      return `<p class="hint-text">选择证物查看详情。庭审中选中证物后再点“举证”；人物档案也可用于举证。</p>`;
    }
    const deduction = deductionForEvidence(caseData, item.id);
    return `
      <div class="evidence-detail">
        <div class="evidence-detail-top">
          ${renderEvidenceThumb(item, true, "large", caseData)}
          <span class="evidence-detail-copy">
            <strong>${escapeHtml(item.name)}</strong>
            <span>${escapeHtml(item.type)}｜${escapeHtml(item.source)}</span>
            <small>${state.screen === "trial" ? "证物已经拿在手上；带回庭审后点“举证”才会提交。" : "已收进法庭记录。开庭后可打开记录，先选好，再举证。"}</small>
          </span>
        </div>
        <p>${escapeHtml(item.detail)}</p>
        ${
          deduction
            ? `<div class="deduction-note"><strong>${escapeHtml(deduction.title)}</strong><span>${escapeHtml(deduction.text)}</span><small>对照：${escapeHtml(deduction.targetName)}</small></div>`
            : ""
        }
        ${item.counterRisk ? `<div class="risk-note"><strong>慎用提示</strong><span>${escapeHtml(item.counterRisk)}</span></div>` : ""}
        <small>${escapeHtml(item.use)}</small>
        <div class="detail-actions">
          <button class="secondary-button" type="button" data-inspect-record="evidence">详查证物</button>
        </div>
        ${renderRecordReturnAction()}
      </div>
    `;
  }

  function recordInspectItems(caseData, type) {
    if (type === "profile") return data.profiles;
    const collected = state.collected[caseData.id] || [];
    return caseData.evidence.filter((item) => collected.includes(item.id));
  }

  function currentRecordInspect(caseData) {
    const inspect = state.recordInspect;
    if (!inspect) return null;
    const type = inspect.type === "profile" ? "profile" : "evidence";
    const items = recordInspectItems(caseData, type);
    if (!items.length) return null;
    const index = Math.max(
      0,
      items.findIndex((item) => (type === "profile" ? item.name : item.id) === inspect.id)
    );
    const activeIndex = index < 0 ? 0 : index;
    return { type, items, item: items[activeIndex], index: activeIndex };
  }

  function openRecordInspect(type) {
    const caseData = currentCase();
    const inspectType = type === "profile" ? "profile" : "evidence";
    const id = inspectType === "profile" ? state.selectedProfileName : state.selectedEvidenceId;
    if (!id) return;
    const items = recordInspectItems(caseData, inspectType);
    if (!items.some((item) => (inspectType === "profile" ? item.name : item.id) === id)) return;
    const inspectItem = items.find((item) => (inspectType === "profile" ? item.name : item.id) === id);
    state.recordInspect = { type: inspectType, id };
    state.recordInspectView = inspectType === "evidence" ? "front" : "";
    state.recordInspectSpot = inspectType === "evidence" ? inspectSpotsForEvidence(inspectItem, "front")[0]?.id || "" : "";
    clearRecordInspectTransient();
    clearRecordInspectCompare();
    if (inspectType === "evidence") markRecordInspectFinding(inspectItem, "front", state.recordInspectSpot);
    rerender();
  }

  function closeRecordInspect() {
    state.recordInspect = null;
    state.recordInspectSpot = "";
    state.recordInspectView = "front";
    clearRecordInspectTransient();
    clearRecordInspectCompare();
    rerender();
  }

  function stepRecordInspect(delta) {
    const caseData = currentCase();
    const inspect = currentRecordInspect(caseData);
    if (!inspect) return;
    const nextIndex = (inspect.index + delta + inspect.items.length) % inspect.items.length;
    const next = inspect.items[nextIndex];
    if (inspect.type === "profile") {
      state.selectedProfileName = next.name;
      state.selectedEvidenceId = "";
      state.recordTab = "profiles";
      state.recordInspect = { type: "profile", id: next.name };
      state.recordInspectSpot = "";
      state.recordInspectView = "";
      clearRecordInspectTransient();
      clearRecordInspectCompare();
    } else {
      state.selectedEvidenceId = next.id;
      state.selectedProfileName = "";
      state.recordTab = "evidence";
      state.recordInspect = { type: "evidence", id: next.id };
      state.recordInspectView = "front";
      state.recordInspectSpot = inspectSpotsForEvidence(next, "front")[0]?.id || "";
      clearRecordInspectTransient();
      clearRecordInspectCompare();
      markRecordInspectFinding(next, "front", state.recordInspectSpot);
    }
    rerender();
  }

  function inspectViewsForEvidence() {
    return [
      { id: "front", label: "正面", title: "正面查看" },
      { id: "back", label: "背面", title: "翻到背面" },
      { id: "edge", label: "边缘", title: "侧看边缘" },
    ];
  }

  function activeInspectView() {
    const views = inspectViewsForEvidence();
    return views.find((view) => view.id === state.recordInspectView) || views[0];
  }

  function setRecordInspectView(viewId, gesture = "") {
    const inspect = currentRecordInspect(currentCase());
    if (!inspect || inspect.type !== "evidence") return;
    const views = inspectViewsForEvidence();
    const view = views.find((entry) => entry.id === viewId) || views[0];
    state.recordInspectView = view.id;
    state.recordInspectSpot = inspectSpotsForEvidence(inspect.item, view.id)[0]?.id || "";
    markRecordInspectFinding(inspect.item, view.id, state.recordInspectSpot);
    setRecordInspectGesture(gesture);
  }

  function rotateRecordInspectView(delta, gestureSource = "drag") {
    const inspect = currentRecordInspect(currentCase());
    if (!inspect || inspect.type !== "evidence") return;
    const views = inspectViewsForEvidence();
    const activeIndex = Math.max(0, views.findIndex((view) => view.id === activeInspectView().id));
    const nextIndex = (activeIndex + delta + views.length) % views.length;
    setRecordInspectView(views[nextIndex].id, delta > 0 ? `${gestureSource}:next` : `${gestureSource}:prev`);
  }

  function inspectSpotsForEvidence(item, viewId = activeInspectView().id) {
    if (!item) return [];
    const specific = specificInspectSpotsForEvidence(item, viewId);
    if (specific.length) return specific;
    const source = item.source ? `来源：${item.source}` : "来源仍需和证词互相印证。";
    const risk = item.counterRisk ? ` 慎用点：${item.counterRisk}` : "";
    const common = {
      trace: {
        id: "trace",
        label: "表面痕迹",
        title: "能直接看见什么",
        text: `${item.summary} ${source}`,
      },
      logic: {
        id: "logic",
        label: "庭审结论",
        title: "它能推翻哪种说法",
        text: `${item.use} ${item.detail}${risk}`,
      },
    };
    if (viewId === "back") {
      return [
        {
          id: "source",
          label: "来源标记",
          title: "背面留下什么出处",
          text: `${source} 背面信息先确认这份记录从哪里来，再决定它能不能被带上庭。`,
        },
        {
          id: "gap",
          label: "缺漏位置",
          title: "哪里故意没写清楚",
          text: `${item.detail} 如果证词把这段空白说成理所当然，就可以从这里追问。`,
        },
      ];
    }
    if (viewId === "edge") {
      return [
        {
          id: "wear",
          label: "磨损边角",
          title: "它经历过怎样的传递",
          text: `${item.name}不是凭空出现的线索。边角痕迹提醒玩家：先问它怎样到场，再问谁从它受益。`,
        },
        {
          id: "risk",
          label: "出示风险",
          title: "什么时候不能乱拍",
          text: risk ? risk.trim() : `这份记录要等证词说死后再用；太早出示只会让对手转移争点。`,
        },
      ];
    }
    return [common.trace, common.logic];
  }

  function evidenceInspectKind(item) {
    const id = item?.id || "";
    const name = item?.name || "";
    if (id.endsWith("-ev-pattern") || name.includes("线索板") || name.includes("流向图") || name.includes("审讯图") || name.includes("半小时图")) return "board";
    if (name.includes("名册")) return "roster";
    if (name.includes("账册") || name.includes("赏赐簿")) return "ledger";
    if (name.includes("联名折")) return "petition";
    if (name.includes("诏稿") || name.includes("遗诏") || name.includes("传位记录")) return "edict";
    if (name.includes("铜匦")) return "bronze_box";
    if (name.includes("榜文") || name.includes("檄文")) return "notice";
    if (name.includes("缉捕令") || name.includes("换岗令")) return "order";
    if (name.includes("瓮口")) return "jar";
    if (name.includes("供状") || name.includes("口供")) return "confession";
    if (name.includes("手册")) return "manual";
    if (name.includes("纸条") || name.includes("札") || name.includes("笺")) return "note";
    if (name.includes("签") || name.includes("牌")) return "tally";
    return "record";
  }

  function specificInspectSpotsForEvidence(item, viewId) {
    const source = item.source ? `来源：${item.source}` : "来源仍需和证词互相印证。";
    const risk = item.counterRisk ? `慎用点：${item.counterRisk}` : "太早出示只会让对手把争点带偏。";
    const map = {
      board: {
        front: [
          ["thread", "红线关系", "先看线怎么连", `${item.name}把受益者、被推出来背罪的人和关键时辰绑在一起。庭上如果有人说“一切只是巧合”，先点这条红线。`],
          ["pin", "钉住节点", "哪几个点不能分开", `${item.summary} 玩家要记住：线索板不是新传闻，而是把已经取得的证物摆成同一条因果链。`],
        ],
        back: [
          ["order", "排列顺序", "背面的排序痕迹", `${item.detail} 背面排序提醒你先讲时间，再讲动机，最后讲谁受益。`],
          ["missing", "空白缺口", "还差哪句话", `${item.use} 如果证人回避这些空白，就用追问逼他承认自己解释不了。`],
        ],
        edge: [
          ["wear", "反复翻阅", "边角磨损", `${item.name}边角被翻得发亮，说明它是最后总结用的东西，不适合一开庭就拍出去。`],
          ["risk", "出示时机", "什么时候拿出来", "等对方把多件事说成偶然，或者否认证物之间有关联时，再用它做最后一击。"],
        ],
      },
      roster: {
        front: [
          ["names", "同页名单", "哪些人被放在一起", `${item.summary} 名册的重点不是单个名字，而是谁被写在同一页、谁被调离现场。`],
          ["seal", "封口印", "谁有权封存", `${source} 这种名册能上庭，是因为它留下了封存痕迹，不是口耳相传。`],
        ],
        back: [
          ["source", "登记出处", "背面来源", `${source} 背面出处能证明它不是事后编出来的便利说法。`],
          ["gap", "缺席位置", "谁没有出现在名单里", `${item.detail} 如果证词装作所有人在场，这个缺席位置就是追问入口。`],
        ],
        edge: [
          ["wear", "抽换痕", "册页边缘", "边缘厚薄不齐，说明这类名单最怕有人事后补页或抽页。"],
          ["risk", "举证风险", "不能只念名字", `${risk} 必须先把名单和现场时辰连起来。`],
        ],
      },
      ledger: {
        front: [
          ["amount", "赏赐/账目", "数字说明什么", `${item.summary} 账册把口头恩宠变成看得见的资源流向。`],
          ["recipient", "受益人", "钱物去了谁手里", `${item.use} 证人若说某人只是旁观者，就用账目把他拉回案情中心。`],
        ],
        back: [
          ["source", "账房标记", "登记从哪来", `${source} 背面标记能说明它不是辩方临时拼出的故事。`],
          ["gap", "断档处", "哪一段账忽然断开", `${item.detail} 断档比完整数字更值得问：谁有能力让记录停住。`],
        ],
        edge: [
          ["wear", "常翻页", "账册被翻过哪里", "磨损集中在同一侧，说明这页在案发后被反复核对。"],
          ["risk", "举证时机", "什么时候有用", `${risk} 等证人否认利益流向时再用。`],
        ],
      },
      bronze_box: {
        front: [
          ["slot", "投书口", "信从哪里进去", `${item.summary} 铜匦只能证明有人投书，不能自动证明后面的审讯和抓捕都合理。`],
          ["letter", "匣中原札", "原札写到哪一步", `${item.detail} 先分清“有人投书”和“有人扩大案情”，庭上才不会被带跑。`],
        ],
        back: [
          ["seal", "匣背封缄", "谁打开过", `${source} 背面的封缄说明它经过公门流程，也给审讯者留下了动手脚的机会。`],
          ["gap", "转办空白", "投书之后谁接手", `${item.use} 证词如果只讲投书、不讲转办，就从这里追问。`],
        ],
        edge: [
          ["wear", "铜边擦痕", "被谁频繁使用", "投书口边缘磨亮，说明它不是孤例，而是一套告密机器的入口。"],
          ["risk", "出示风险", "不能直接定罪", risk],
        ],
      },
      jar: {
        front: [
          ["scorch", "烙痕", "火从哪里烧过", `${item.summary} 烙痕让逼供传闻变成现场物证。`],
          ["mouth", "瓮口", "人会被怎样威吓", `${item.detail} 重点不是故事吓人，而是办案者真的把恐吓当成办法。`],
        ],
        back: [
          ["ash", "灰痕", "背面残灰", `${source} 灰痕说明它不是摆设，曾经被搬进审讯流程。`],
          ["gap", "谁下令", "记录没有写的人", `${item.use} 若证人只说按旧例问案，就追问是谁把旧例变成火候。`],
        ],
        edge: [
          ["crack", "裂口", "热胀裂痕", "裂口方向能证明它被加热过，不是普通储物瓮。"],
          ["risk", "出示时机", "要配合哪句话", `${risk} 等证人否认逼供办法时再拿出来。`],
        ],
      },
      confession: {
        front: [
          ["hand", "笔迹停顿", "哪里不像自愿写下", `${item.summary} 手抖、停笔和补字，比供词内容本身更能说明压力。`],
          ["seal", "供状印记", "谁把它定成正式记录", `${source} 印记把个人口供变成公文，也把责任推给办案流程。`],
        ],
        back: [
          ["source", "副本来源", "背面出处", `${source} 背面能说明这是正本、副本，还是后来转抄。`],
          ["gap", "漏写处", "供词没解释什么", `${item.detail} 供词越完整，漏掉的动机和逼供过程越显眼。`],
        ],
        edge: [
          ["wear", "折痕", "被急着收过", "折痕压在字迹上，像是写完后很快被收走。"],
          ["risk", "举证风险", "不能只说供词可疑", `${risk} 需要和逼供工具或审讯手册一起形成链条。`],
        ],
      },
      order: {
        front: [
          ["route", "路线/命令", "行动怎么被安排", `${item.summary} 命令类证物能把“临时发生”改成“已经部署”。`],
          ["seal", "官印", "谁让命令生效", `${source} 官印不是装饰，它决定这份命令能不能压过证人的口头说法。`],
        ],
        back: [
          ["source", "发出位置", "从哪一道门传出", `${item.detail} 背面标记能把行动路线和权力来源连起来。`],
          ["gap", "空白时辰", "少了哪段时间", `${item.use} 如果证词把行动说成突然，就追问空白时辰。`],
        ],
        edge: [
          ["wear", "传递折痕", "一路传过几手", "边缘折痕说明它被匆忙传递，不像事后慢慢归档。"],
          ["risk", "举证时机", "等证词说死", `${risk} 等对方否认准备动作时再用。`],
        ],
      },
      petition: {
        front: [
          ["names", "联名处", "谁把名字写在一起", `${item.summary} 联名折的重点是“不是一个人在反对”，而是一群朝臣把风险一起写下。`],
          ["fold", "折痕", "折子被如何传阅", `${item.use} 如果证词说朝中无人介意，这些反复翻折的痕迹就能说明它并非孤声。`],
        ],
        back: [
          ["source", "递呈出处", "从哪一路送来", `${source} 背面递呈痕迹能把它从私下抱怨变成正式朝臣文书。`],
          ["gap", "删改空白", "谁的话被压掉", `${item.detail} 空白处提醒玩家：有人不只是在反对，也可能在被迫沉默。`],
        ],
        edge: [
          ["wear", "传阅磨损", "被多少人摸过", "边角磨损越集中，越能说明它经历了多次传阅。"],
          ["risk", "出示风险", "不能当作单人怨言", `${risk} 要把它和后续诏稿或名册连起来。`],
        ],
      },
      edict: {
        front: [
          ["title", "诏令题头", "命令指向谁", `${item.summary} 诏令类证物要先看题头：它把传闻变成了朝廷动作。`],
          ["ink", "墨迹覆盖", "哪几个字被盖住", `${item.detail} 墨迹不是污损，而是在遮住不方便留下的人名或顺序。`],
        ],
        back: [
          ["source", "起草出处", "谁能写这份稿", `${source} 起草出处决定它是传闻、草稿，还是已经进入政务流程。`],
          ["gap", "改写痕迹", "命令哪里被换过", `${item.use} 如果证词把记录说成天然可信，就问这处改写是谁做的。`],
        ],
        edge: [
          ["wear", "卷轴边", "是否反复展开", "边缘被压平，说明这份文书不只是收藏品，而是被拿出来核对过。"],
          ["risk", "举证时机", "等对方夸口记录完整", `${risk} 对方把公开记录说得越绝对，这份证物越有力。`],
        ],
      },
      notice: {
        front: [
          ["headline", "告示题头", "公开说法怎么扩散", `${item.summary} 告示类证物说明恐惧如何从公门贴到街口。`],
          ["paste", "张贴痕", "它被贴在哪里", `${item.use} 证词若只讲案卷，不讲民间恐惧，就从张贴痕追问。`],
        ],
        back: [
          ["source", "印刷来源", "谁让它变成公开话", `${source} 背面来源能说明它不是自然流言，而是有人推动公开叙事。`],
          ["gap", "缺页边", "哪半截不见了", `${item.detail} 残缺处可能正是把投书扩大成罪名的那一步。`],
        ],
        edge: [
          ["wear", "撕裂边", "被谁急着揭下", "边缘撕裂不整，像是有人想赶在别人读完前揭走。"],
          ["risk", "出示风险", "不能只证明有流言", `${risk} 它要用来证明扩散路径，而不是证明罪名本身。`],
        ],
      },
      manual: {
        front: [
          ["method", "审讯步骤", "办法写得有多细", `${item.summary} 手册把逼问变成流程，说明问题不在某一句供词，而在办案方法。`],
          ["mark", "重点批注", "谁把恐吓当技巧", `${item.use} 证人若说只是照例问案，批注能把“旧例”戳成主动选择。`],
        ],
        back: [
          ["source", "手册出处", "从谁那里流出", `${source} 出处能说明这不是旁听传闻，而是办案者自己承认的方法。`],
          ["gap", "删去段落", "哪一步不敢写明", `${item.detail} 被删去的段落往往比写出来的更接近真相。`],
        ],
        edge: [
          ["wear", "常用页", "哪一页翻得最多", "边缘磨损集中，说明这套方法被反复拿来照做。"],
          ["risk", "举证时机", "要配合供状或物证", `${risk} 单独拿手册容易被说成纸上谈兵。`],
        ],
      },
      note: {
        front: [
          ["line", "急写字迹", "写信人当时有多慌", `${item.summary} 私札、纸条和问安笺要看语气：它往往比正式文书更诚实。`],
          ["seal", "封口痕", "有没有被拆看", `${item.use} 封口痕能说明它在到达收信人前是否被别人看过。`],
        ],
        back: [
          ["source", "传递路径", "从谁手里来", `${source} 背面传递痕迹决定它是私人求援，还是被拿来加工罪名。`],
          ["gap", "没写完处", "为什么突然停笔", `${item.detail} 停笔处说明写信人可能被打断，也可能不敢把话说透。`],
        ],
        edge: [
          ["wear", "折角", "被藏过还是递过", "折角小而密，像是被塞进袖中或夹进册页。"],
          ["risk", "出示风险", "不能只讲情绪", `${risk} 要让它和现场行动或公开记录相互印证。`],
        ],
      },
      tally: {
        front: [
          ["slot", "刻痕", "缺了哪个时辰", `${item.summary} 签牌类证物要看时辰刻痕，少掉的一格比写上的字更重要。`],
          ["name", "补写姓名", "谁后来被添进去", `${item.use} 证词若只说听见哭声，就用补写姓名把他拉回现场。`],
        ],
        back: [
          ["source", "值夜出处", "谁管这块签", `${source} 出处能证明它属于现场秩序，不是辩方随口拿出的木牌。`],
          ["gap", "空档", "哪一段无人值守", `${item.detail} 空档处正好连接案发时辰，是追问现场动线的入口。`],
        ],
        edge: [
          ["wear", "挂绳磨痕", "曾挂在哪里", "挂绳处磨得发亮，说明它确实长期用于值夜交接。"],
          ["risk", "举证时机", "等证人回避现场", `${risk} 别在传闻入口浪费它。`],
        ],
      },
    };
    const kind = evidenceInspectKind(item);
    const byView = map[kind]?.[viewId];
    if (!byView) return [];
    return byView.map(([id, label, title, text]) => ({ id, label, title, text }));
  }

  function recordInspectFindingKey(item, viewId, spotId) {
    if (!item || !spotId) return "";
    return `${item.id || item.name}:${viewId}:${spotId}`;
  }

  function markRecordInspectFinding(item, viewId, spotId) {
    const key = recordInspectFindingKey(item, viewId, spotId);
    if (!key) return;
    state.recordInspectFindings[key] = true;
  }

  function isRecordInspectFindingChecked(item, viewId, spotId) {
    const key = recordInspectFindingKey(item, viewId, spotId);
    return Boolean(key && state.recordInspectFindings[key]);
  }

  function recordInspectProgress(item) {
    if (!item) return { checked: 0, total: 0, label: "" };
    const views = inspectViewsForEvidence();
    const keys = views.flatMap((view) => inspectSpotsForEvidence(item, view.id).map((spot) => recordInspectFindingKey(item, view.id, spot.id))).filter(Boolean);
    const checked = keys.filter((key) => state.recordInspectFindings[key]).length;
    return { checked, total: keys.length, label: `${checked}/${keys.length}` };
  }

  function isRecordInspectComplete(item) {
    const progress = recordInspectProgress(item);
    return progress.total > 0 && progress.checked >= progress.total;
  }

  function inspectCompareTargetForEvidence(item, caseData) {
    if (!item || !caseData?.evidence?.length) return null;
    const evidence = caseData.evidence.filter((entry) => !entry.trialOnly);
    const index = evidence.findIndex((entry) => entry.id === item.id);
    if (index < 0) return null;
    if (item.id.endsWith("-ev-pattern")) return evidence[Math.max(0, index - 1)] || null;
    if (evidenceInspectKind(item) === "tally") return evidence.find((entry) => entry.name.includes("名册")) || evidence[index + 1] || null;
    if (evidenceInspectKind(item) === "roster") return evidence.find((entry) => entry.name.includes("签") || entry.name.includes("牌")) || evidence[index - 1] || null;
    if (evidenceInspectKind(item) === "bronze_box") return evidence.find((entry) => entry.name.includes("榜文") || entry.name.includes("缉捕令")) || evidence[index + 1] || null;
    if (evidenceInspectKind(item) === "jar") return evidence.find((entry) => entry.name.includes("供状") || entry.name.includes("手册")) || evidence[index + 1] || null;
    if (evidenceInspectKind(item) === "order") return evidence[Math.max(0, index - 1)] || null;
    return evidence[index + 1] || evidence[index - 1] || null;
  }

  function inspectCompareOptionsForEvidence(item, caseData) {
    if (!item || !isRecordInspectComplete(item)) return [];
    const collected = new Set(state.collected[caseData.id] || []);
    const candidates = (caseData.evidence || []).filter((entry) => entry.id !== item.id && collected.has(entry.id) && !entry.trialOnly);
    if (!candidates.length) return [];
    const target = inspectCompareTargetForEvidence(item, caseData);
    const ordered = [];
    if (target && candidates.some((entry) => entry.id === target.id)) ordered.push(target);
    for (const entry of candidates) {
      if (!ordered.some((itemEntry) => itemEntry.id === entry.id)) ordered.push(entry);
      if (ordered.length >= 3) break;
    }
    return ordered.slice(0, 3);
  }

  function inspectCompareResultText(source, target, correct) {
    if (!source || !target) return "";
    if (!correct) return `${target.name}和${source.name}暂时接不上。先确认两件证物是否在同一条时间线或同一个人身上。`;
    const kind = evidenceInspectKind(source);
    if (kind === "board") return `${source.name}的红线和${target.name}对上了：这不是零散线索，而是一条能带上庭的因果链。`;
    if (kind === "tally" || kind === "roster") return `${source.name}和${target.name}互相补上了“谁在场、谁缺席、谁后来被添进去”的空白。`;
    if (kind === "bronze_box") return `${source.name}和${target.name}对上后，投书入口和案情扩大的步骤被分开了。`;
    if (kind === "jar" || kind === "confession" || kind === "manual") return `${source.name}和${target.name}连起来后，逼供不再只是传闻，而成了办案流程的破绽。`;
    if (kind === "order") return `${source.name}和${target.name}对上后，“临时发生”的说法站不住了。`;
    return `${source.name}和${target.name}互相印证，可以作为庭上追问的下一层依据。`;
  }

  function deductionStoreForCase(caseId) {
    if (!state.recordDeductions[caseId]) state.recordDeductions[caseId] = {};
    return state.recordDeductions[caseId];
  }

  function deductionForEvidence(caseData, evidenceId) {
    return state.recordDeductions[caseData.id]?.[evidenceId] || null;
  }

  function saveInspectDeduction(caseData, source, target, text) {
    if (!caseData || !source || !target || !text) return;
    const store = deductionStoreForCase(caseData.id);
    store[source.id] = {
      sourceId: source.id,
      targetId: target.id,
      title: "对照札记",
      targetName: target.name,
      text,
    };
    setMessage("推理札记", `${source.name}已经写入新的对照札记。`, "turnabout");
    save();
  }

  function compareInspectEvidence(targetId) {
    const caseData = currentCase();
    const inspect = currentRecordInspect(caseData);
    if (!inspect || inspect.type !== "evidence" || !targetId) return;
    const target = evidenceById(caseData, targetId);
    const expected = inspectCompareTargetForEvidence(inspect.item, caseData);
    const correct = Boolean(target && expected && target.id === expected.id);
    state.recordInspectCompare = {
      sourceId: inspect.item.id,
      targetId,
      result: correct ? "match" : "miss",
      text: inspectCompareResultText(inspect.item, target, correct),
    };
    if (correct) saveInspectDeduction(caseData, inspect.item, target, state.recordInspectCompare.text);
    rerender();
  }

  function activeInspectSpot(item) {
    const spots = inspectSpotsForEvidence(item);
    return spots.find((spot) => spot.id === state.recordInspectSpot) || spots[0] || null;
  }

  function inspectLensClass(viewId, spotId) {
    const safeView = viewId || "front";
    const safeSpot = spotId || "trace";
    return `inspect-lens-${safeView}-${safeSpot}`;
  }

  function renderEvidenceInspectArt(item, caseData) {
    const view = activeInspectView();
    const views = inspectViewsForEvidence();
    const spots = inspectSpotsForEvidence(item, view.id);
    const activeSpot = activeInspectSpot(item);
    const activeSpotIndex = Math.max(0, spots.findIndex((spot) => spot.id === activeSpot?.id));
    const progress = recordInspectProgress(item);
    return `
      <div class="inspect-view-tabs" aria-label="证物查看角度">
        ${views
          .map(
            (entry) => `
              <button class="inspect-view-button ${entry.id === view.id ? "active" : ""}" type="button" data-inspect-view="${escapeHtml(entry.id)}">
                <span>${escapeHtml(entry.label)}</span>
              </button>
            `
          )
          .join("")}
      </div>
      <div class="inspect-art-stage inspect-view-${escapeHtml(view.id)} inspect-spot-${escapeHtml(activeSpot?.id || "trace")} ${state.recordInspectGesture ? "inspect-gesture-active" : ""}" data-view="${escapeHtml(view.title)}" data-active-lens="${escapeHtml(`${view.id}:${activeSpot?.id || ""}`)}" data-inspect-drag-stage>
        ${renderEvidenceThumb(item, true, "inspect", caseData)}
        <div class="inspect-progress" aria-label="${escapeHtml(`已查 ${progress.label}`)}"><b>${escapeHtml(progress.label)}</b><span>已查</span></div>
        <div class="inspect-drag-hint" aria-hidden="true"><span>拖动切换角度</span></div>
        ${
          activeSpot
            ? `<div class="inspect-lens ${escapeHtml(inspectLensClass(view.id, activeSpot.id))} inspect-lens-slot-${activeSpotIndex + 1}" data-inspect-lens aria-label="${escapeHtml(`放大查看：${activeSpot.label}`)}">
                <i aria-hidden="true"></i>
                <strong>${escapeHtml(activeSpot.label)}</strong>
                <small>${activeSpotIndex + 1}</small>
              </div>`
            : ""
        }
        <div class="inspect-hotspots" aria-label="证物检查点">
          ${spots
            .map(
              (spot, index) => {
                const checked = isRecordInspectFindingChecked(item, view.id, spot.id);
                return `
                <button class="inspect-hotspot inspect-hotspot-${index + 1} ${activeSpot?.id === spot.id ? "active" : ""} ${checked ? "checked" : ""}" type="button" data-inspect-spot="${escapeHtml(spot.id)}">
                  <span>${index + 1}</span>
                  <small>${escapeHtml(spot.label)}</small>
                </button>
              `;
              }
            )
            .join("")}
        </div>
      </div>
    `;
  }

  function renderInspectComparePanel(item, caseData) {
    const progress = recordInspectProgress(item);
    const options = inspectCompareOptionsForEvidence(item, caseData);
    const compare = state.recordInspectCompare?.sourceId === item.id ? state.recordInspectCompare : null;
    const deduction = deductionForEvidence(caseData, item.id);
    if (!isRecordInspectComplete(item)) {
      return `<div class="inspect-compare locked"><b>二次推理</b><span>先把这件证物的全部检查点看完。当前进度：${escapeHtml(progress.label)}</span></div>`;
    }
    if (!options.length) {
      return `<div class="inspect-compare locked"><b>二次推理</b><span>证物还不够。继续调查后，再回来把它和另一件记录对照。</span></div>`;
    }
    const target = compare?.targetId ? evidenceById(caseData, compare.targetId) : null;
    return `
      <div class="inspect-compare ${compare?.result === "match" ? "matched" : compare?.result === "miss" ? "missed" : ""}">
        <div>
          <b>${compare?.result === "match" ? "推理确认" : "证物对照"}</b>
          <span>${compare ? escapeHtml(compare.text) : deduction ? escapeHtml(deduction.text) : "选择一件已取得证物，确认它能不能和当前证物组成新的推理链。"}</span>
          ${target ? `<small>已对照：${escapeHtml(target.name)}</small>` : ""}
          ${!target && deduction ? `<small>已写入：${escapeHtml(deduction.targetName)}</small>` : ""}
        </div>
        <div class="inspect-compare-options">
          ${options
            .map(
              (option) => `
                <button class="secondary-button ${compare?.targetId === option.id ? "selected" : ""}" type="button" data-compare-inspect="${escapeHtml(option.id)}">
                  ${escapeHtml(option.name)}
                </button>
              `
            )
            .join("")}
        </div>
      </div>
    `;
  }

  function renderRecordInspectModal(caseData) {
    const inspect = currentRecordInspect(caseData);
    if (!inspect) return "";
    const { type, item, index, items } = inspect;
    const title = type === "profile" ? item.name : item.name;
    const subtitle = type === "profile" ? item.role : `${item.type}｜${item.source}`;
    const spot = type === "evidence" ? activeInspectSpot(item) : null;
    return `
      <div class="modal-scrim record-inspect-scrim" role="dialog" aria-modal="true" aria-label="法庭记录详查">
        <section class="record-inspect-panel record-inspect-${escapeHtml(type)}">
          <div class="record-inspect-header">
            <span class="hero-kicker">法庭记录详查</span>
            <button class="record-close-button visible" type="button" data-close-inspect>关闭</button>
          </div>
          <div class="record-inspect-body">
            <div class="record-inspect-art">
              ${
                type === "profile"
                  ? `<span class="inspect-profile portrait-${escapeHtml(item.portrait || "empress")}" aria-hidden="true"></span>`
                  : renderEvidenceInspectArt(item, caseData)
              }
            </div>
            <div class="record-inspect-copy">
              <strong>${escapeHtml(title)}</strong>
              <span>${escapeHtml(subtitle)}</span>
              ${type === "profile" ? `<p>${escapeHtml(item.note)}</p>` : `<p>${escapeHtml(item.detail)}</p>`}
              ${spot ? `<div class="inspect-observation"><b>${escapeHtml(spot.title)}</b><span>${escapeHtml(spot.text)}</span></div>` : ""}
              ${type === "evidence" ? renderInspectComparePanel(item, caseData) : ""}
              <div class="inspect-facts">
                ${
                  type === "profile"
                    ? `<div><b>身份</b><small>${escapeHtml(item.role)}</small></div><div><b>观察点</b><small>${escapeHtml(item.note)}</small></div>`
                    : `<div><b>现场说法</b><small>${escapeHtml(item.summary)}</small></div><div><b>庭审用途</b><small>${escapeHtml(item.use)}</small></div>`
                }
                ${type === "evidence" && item.counterRisk ? `<div class="risk"><b>慎用</b><small>${escapeHtml(item.counterRisk)}</small></div>` : ""}
              </div>
              <small class="inspect-index">${index + 1}/${items.length}</small>
            </div>
          </div>
          <div class="record-inspect-actions">
            <button class="secondary-button" type="button" data-inspect-step="-1">上一项</button>
            <button class="secondary-button" type="button" data-inspect-step="1">下一项</button>
            ${state.screen === "trial" ? `<button class="primary-button" type="button" data-return-to-trial-inspect>带回庭审</button>` : ""}
          </div>
        </section>
      </div>
    `;
  }

  function renderRecordReturnAction() {
    if (state.screen !== "trial") return "";
    return `
      <div class="record-return-action">
        <span>确认选择后回到庭审主操作区，再决定是否正式举证。</span>
        <button class="primary-button" type="button" data-return-to-trial>带回庭审</button>
      </div>
    `;
  }

  function renderCue() {
    if (!state.dramaticCue) return "";
    const cue = state.impactCue || {
      kind: state.dramaticCue,
      title: state.dramaticCue === "objection" ? "异议" : "驳回",
      record: "",
      subtitle: "",
    };
    const title = cue.title || (cue.kind === "objection" ? "异议" : "驳回");
    const impactFrame = impactBitmapFrameFor(cue);
    const calloutFrame = impactCalloutFrameFor(cue);
    return `
      <div class="court-impact impact-${escapeHtml(cue.kind)} impact-bitmap-frame-${impactFrame} impact-callout-frame-${calloutFrame} ${state.settings.reducedMotion ? "still" : ""}" data-impact-bitmap-frame="${impactFrame}" data-impact-callout-frame="${calloutFrame}" aria-label="${escapeHtml(title)}">
        <div class="impact-bitmap" aria-hidden="true"></div>
        <div class="impact-lines"></div>
        ${renderImpactFrames(cue)}
        <div class="impact-callout" aria-hidden="true"></div>
        <strong class="impact-title-fallback">${escapeHtml(title)}</strong>
        ${cue.subtitle ? `<em>${escapeHtml(cue.subtitle)}</em>` : ""}
        ${cue.record ? `<span>${escapeHtml(cue.record)}</span>` : ""}
      </div>
    `;
  }

  function impactBitmapFrameFor(cue) {
    if (cue?.kind === "penalty") return 2;
    const title = cue?.title || "";
    if (title.includes("逆转") || title.includes("判决") || title.includes("胜诉")) return 3;
    return 1;
  }

  function impactCalloutFrameFor(cue) {
    const title = cue?.title || "";
    if (title.includes("追问不足")) return 2;
    if (title.includes("驳回")) return 3;
    if (title.includes("反制")) return 4;
    if (title.includes("逆转")) return 5;
    if (title.includes("判决") || title.includes("胜诉")) return 6;
    if (title.includes("档案")) return 7;
    return 1;
  }

  function renderObjectionReveal() {
    const reveal = state.objectionReveal;
    if (!reveal) return "";
    const steps = objectionRevealSteps(reveal);
    const stepIndex = Math.max(0, Math.min(steps.length - 1, Number(reveal.step) || 0));
    const step = steps[stepIndex] || steps[0];
    const finalStep = stepIndex >= steps.length - 1;
    return `
      <div class="objection-reveal reveal-step-${stepIndex + 1} reveal-advance-panel" data-advance-reveal-panel role="dialog" aria-live="assertive" aria-label="异议揭示，点击任意位置推进">
        <div class="objection-reveal-inner">
          <div class="reveal-head">
            <span class="hero-kicker">${escapeHtml(step.kicker)}</span>
            <small>${stepIndex + 1}/${steps.length}</small>
          </div>
          <strong>${escapeHtml(step.title)}</strong>
          <p>${escapeHtml(step.body)}</p>
          ${renderObjectionCutIn(reveal, stepIndex)}
          <div class="reveal-record">
            <em>${escapeHtml(step.recordLabel)}</em>
            <small>${escapeHtml(step.targetLabel)}</small>
          </div>
          <div class="reveal-stepper" aria-label="异议揭示进度">
            ${steps
              .map(
                (item, index) => `
                  <span class="${index === stepIndex ? "active" : ""}">
                    <b>${index + 1}</b>
                    <small>${escapeHtml(item.kicker)}</small>
                  </span>
                `
              )
              .join("")}
          </div>
        <div class="reveal-actions">
            <button class="secondary-button" type="button" data-home>返回主菜单</button>
            <button class="secondary-button" type="button" data-reveal-objection>跳过演出</button>
            <span class="panel-continue-hint">点击任意处${finalStep ? "揭示矛盾" : "继续下一幕"}</span>
          </div>
        </div>
      </div>
    `;
  }

  function objectionRevealSteps(reveal) {
    const title = reveal.title || "异议成立";
    const line = reveal.line || "证物与证词正面冲突。";
    const record = reveal.record || "法庭记录";
    const target = reveal.target || "当前证词";
    const deductionText = reveal.deductionText || "";
    const deductionTarget = reveal.deductionTarget || "";
    return [
      {
        kicker: "异议切入",
        title,
        body: deductionText ? "先打断证词节奏。辩方不是临场猜测，而是已经在法庭记录里完成过证物对照。" : "先打断证词节奏，把法庭注意力从证人的说法拉回记录本身。",
        recordLabel: "辩方发声",
        targetLabel: line,
      },
      {
        kicker: "证物对照",
        title: record,
        body: deductionText ? `札记写得很清楚：${deductionText}` : "把证物摆到证词旁边看：哪一句话经不起这份记录的检查？",
        recordLabel: record,
        targetLabel: deductionTarget || target,
      },
      {
        kicker: "矛盾揭示",
        title: line,
        body: deductionText ? `庭前对照和当前证词咬在同一个缺口上：${target}` : `这份记录击中的不是细枝末节，而是证词的核心前提：${target}`,
        recordLabel: title,
        targetLabel: record,
      },
    ];
  }

  function renderObjectionCutIn(reveal, stepIndex) {
    const caseData = currentCase();
    const frames = [
      {
        tone: "defense",
        role: "辩方",
        label: reveal.title || "异议",
      },
      {
        tone: "record",
        role: "法庭记录",
        label: reveal.record || "关键证据",
      },
      {
        tone: "opponent",
        role: caseData.opponent || "对手",
        label: reveal.line || "证词动摇",
      },
    ];
    return `
      <div class="reveal-cutin" aria-label="异议演出分镜">
        <div class="objection-sprite-stage objection-sprite-frame-${stepIndex + 1}" data-objection-sprite-frame="${stepIndex + 1}" aria-hidden="true"></div>
        ${frames
          .map(
            (frame, index) => `
              <div class="reveal-frame reveal-frame-${index + 1} tone-${escapeHtml(frame.tone)} ${index === stepIndex ? "active" : ""}">
                <span class="objection-sprite-thumb objection-sprite-frame-${index + 1}" aria-hidden="true"></span>
                <b>${escapeHtml(frame.role)}</b>
                <small>${escapeHtml(frame.label)}</small>
              </div>
            `
          )
          .join("")}
      </div>
    `;
  }

  function renderImpactFrames(cue) {
    const frames = Array.isArray(cue.frames) ? cue.frames.slice(0, 3) : [];
    if (!frames.length) return "";
    return `
      <div class="acting-strip" aria-label="法庭演出帧">
        ${frames
          .map(
            (frame, index) => `
              <div class="acting-frame acting-frame-${index + 1} tone-${escapeHtml(frame.tone || "record")}">
                <span class="acting-portrait portrait-${escapeHtml(frame.portrait || "record")} pose-${escapeHtml(frame.pose || "idle")}"></span>
                <b>${escapeHtml(frame.role || "")}</b>
                <small>${escapeHtml(frame.label || "")}</small>
              </div>
            `
          )
          .join("")}
      </div>
    `;
  }

  function renderSettings() {
    if (!state.settingsOpen) return "";
    return `
      <div class="modal-scrim">
        <section class="settings-panel">
          <h2>设置</h2>
          <label>
            <span>文本速度</span>
            <select data-setting="textSpeed">
              <option value="slow" ${state.settings.textSpeed === "slow" ? "selected" : ""}>沉稳</option>
              <option value="normal" ${state.settings.textSpeed === "normal" ? "selected" : ""}>标准</option>
              <option value="fast" ${state.settings.textSpeed === "fast" ? "selected" : ""}>快速</option>
            </select>
          </label>
          <label class="checkbox-row">
            <input type="checkbox" data-setting="reducedMotion" ${state.settings.reducedMotion ? "checked" : ""} />
            <span>减少演出动画</span>
          </label>
          <label class="checkbox-row">
            <input type="checkbox" data-setting="hideGuides" ${state.settings.hideGuides ? "checked" : ""} />
            <span>隐藏新手提示卡</span>
          </label>
          <label class="checkbox-row">
            <input type="checkbox" data-setting="muted" ${state.settings.muted ? "checked" : ""} />
            <span>关闭音效</span>
          </label>
          <label class="volume-row">
            <span>提示音量 <strong>${Math.round(audioNumber(state.settings.sfxVolume, defaultSettings.sfxVolume) * 100)}%</strong></span>
            <input type="range" min="0" max="1" step="0.05" data-setting="sfxVolume" value="${audioNumber(state.settings.sfxVolume, defaultSettings.sfxVolume)}" />
          </label>
          <label class="volume-row">
            <span>环境音量 <strong>${Math.round(audioNumber(state.settings.ambienceVolume, defaultSettings.ambienceVolume) * 100)}%</strong></span>
            <input type="range" min="0" max="1" step="0.05" data-setting="ambienceVolume" value="${audioNumber(state.settings.ambienceVolume, defaultSettings.ambienceVolume)}" />
          </label>
          <label class="volume-row">
            <span>配乐音量 <strong>${Math.round(audioNumber(state.settings.musicVolume, defaultSettings.musicVolume) * 100)}%</strong></span>
            <input type="range" min="0" max="1" step="0.05" data-setting="musicVolume" value="${audioNumber(state.settings.musicVolume, defaultSettings.musicVolume)}" />
          </label>
          <p class="audio-status">当前声场：${escapeHtml(audioModeForScreenLabel())}</p>
          <div class="action-row">
            <button class="secondary-button" type="button" data-reset-case>重置当前案</button>
            <button class="primary-button" type="button" data-toggle-settings>关闭</button>
          </div>
          <p class="hint-text">键盘：方向键切换证词，空格/Enter 前进对话，P 追问，E 举证，R 法庭记录，S 设置，1-4 切换调查指令（移动/查看/交谈/出示）。</p>
        </section>
      </div>
    `;
  }

  function audioModeForScreenLabel() {
    const labels = {
      home: "卷宗室",
      briefing: "案件简报",
      investigation: "现场调查",
      trial: "法庭攻防",
      interlude: "证词更新",
      collapse: "败诉复盘",
      verdict: "判决落定",
    };
    return labels[audioModeForScreen()] || "卷宗室";
  }

  function openCase(index) {
    state.caseIndex = index;
    state.caseSourceIndex = 0;
    state.selectedEvidenceId = "";
    state.selectedProfileName = "";
    state.recordOpen = false;
    state.recordInspect = null;
    state.recordInspectSpot = "";
    state.recordInspectView = "front";
    clearRecordInspectCompare();
    clearPursuitUnlockCue();
    state.recordTab = "evidence";
    clearInvestigationBeat();
    clearEvidencePickup();
    clearInventoryCue();
    clearPursuitUnlockCue();
    setMessage("书记", "案件记录已经展开。先调查现场，再进入庭审。", "");
    renderCaseIntro();
  }

  function setMode(mode, options = {}) {
    state.selectedEvidenceId = "";
    state.recordInspect = null;
    state.recordInspectSpot = "";
    state.recordInspectView = "front";
    clearRecordInspectCompare();
    clearEvidencePickup();
    clearInventoryCue();
    clearPursuitUnlockCue();
    if (mode === "investigation") {
      const caseData = currentCase();
      const inv = investigationProgress(caseData.id);
      if (!options.force && !inv.openingSeen) {
        startCaseOpeningCutscene(caseData);
        return;
      }
      state.recordOpen = false;
      clearInvestigationBeat();
      setMessage("调查", "选择指令。移动、查看、交谈、出示，每一步都可能改变法庭记录。", "");
      renderInvestigation();
    } else {
      const caseData = currentCase();
      if (!allEvidenceCollected(caseData)) {
        const missing = missingTrialEvidence(caseData);
        setStage("record", "庭前证物不足", { left: "thinking", right: "observe" });
        setMessage("书记", `案卷还没合上。先把${missing.slice(0, 2).join("、") || "庭前证物"}找齐，再进殿受审。`, "");
        save();
        renderInvestigation();
        return;
      }
      const progress = caseProgress(caseData.id);
      if (progress.failed) {
        renderBadEnding();
        return;
      }
      if (progress.awaitingInterlude) {
        renderTestimonyInterlude();
        return;
      }
      const testimony = caseData.testimony[progress.testimonyIndex];
      state.recordOpen = false;
      setStage("witness", `${testimony.speaker}入庭`, { left: "enter", right: "observe" });
      playCue("transition");
      setMessage("审判长", "开始交叉询问。追问每句证词，找到能被证物击穿的矛盾。", "");
      renderTrial();
    }
  }

  function setCommand(command) {
    const caseData = currentCase();
    const inv = investigationProgress(caseData.id);
    inv.command = command;
    clearInvestigationBeat();
    clearEvidencePickup();
    clearPursuitUnlockCue();
    clearInventoryCue();
    setMessage("调查", `已切换到“${commandLabel(command)}”。`, "");
    save();
    renderInvestigation();
  }

  function commandLabel(command) {
    return { move: "移动", examine: "查看", talk: "交谈", present: "出示" }[command] || "调查";
  }

  function moveLocation(index) {
    const caseData = currentCase();
    const inv = investigationProgress(caseData.id);
    inv.locationIndex = index;
    const location = caseData.locations[index];
    clearInvestigationBeat();
    clearEvidencePickup();
    clearInventoryCue();
    clearPursuitUnlockCue();
    setMessage("调查", `移动到${location.name}。${location.description}`, "");
    save();
    renderInvestigation();
  }

  function examineSpot(index) {
    const caseData = currentCase();
    const inv = investigationProgress(caseData.id);
    const location = currentLocation(caseData);
    const spot = location.examineSpots[index];
    if (!spot) return;
    inv.command = "examine";
    const key = `${inv.locationIndex}:${index}`;
    if (!inv.examined.includes(key)) inv.examined.push(key);
    const gainedItems = collectEvidenceFromLocation(caseData, location, index);
    const gainedNames = gainedItems.map((item) => item.name);
    if (gainedItems.length) setEvidencePickup(caseData, gainedItems);
    const suffix = gainedNames.length ? ` 取得证物：${gainedNames.join("、")}。` : " 没有新的证物。";
    setMessage("调查", `${spot.text}${suffix}`, gainedNames.length ? "objection" : "");
    setInvestigationBeat(
      "查看",
      "调查",
      spot.text,
      gainedNames.length ? "证物取得" : "没有新的证物",
      gainedNames,
      [
        {
          speaker: gainedNames.length ? "辩方" : "调查",
          text: gainedNames.length ? `这件东西先收进法庭记录。等证词说到这里，再把它拿出来。` : "这里已经查过一遍。与其反复翻找，不如换个可疑处继续看。",
        },
      ]
    );
    save();
    renderInvestigation();
  }

  function collectEvidenceFromLocation(caseData, location, spotIndex) {
    const collected = state.collected[caseData.id] || [];
    const ids = location.evidenceIds || [];
    const split = Math.ceil(ids.length / Math.max(1, location.examineSpots.length));
    const start = spotIndex * split;
    const gainedIds = ids.slice(start, start + split);
    const gained = [];
    gainedIds.forEach((evidenceId) => {
      if (!collected.includes(evidenceId)) {
        const item = evidenceById(caseData, evidenceId);
        if (!item) return;
        collected.push(evidenceId);
        gained.push(item);
      }
    });
    state.collected[caseData.id] = collected;
    return gained;
  }

  function talkTopic(index) {
    const caseData = currentCase();
    const inv = investigationProgress(caseData.id);
    const location = currentLocation(caseData);
    const topic = location.talkTopics[index];
    const key = `${inv.locationIndex}:${index}`;
    if (!inv.talked.includes(key)) inv.talked.push(key);
    setMessage(topic.speaker, topic.text, "");
    setInvestigationBeat("交谈", topic.speaker, topic.text, "证言已记录", [], [
      {
        speaker: "辩方",
        text: "这句话先记下。真正的破绽，往往要和现场证物摆在一起才看得出来。",
      },
    ]);
    save();
    renderInvestigation();
  }

  function presentDuringInvestigation(evidenceId) {
    const caseData = currentCase();
    const inv = investigationProgress(caseData.id);
    const item = evidenceById(caseData, evidenceId);
    if (!inv.presented.includes(evidenceId)) inv.presented.push(evidenceId);
    const reaction = `这份${item.type}能帮助你在庭审中说明：${item.use}`;
    setMessage(caseData.witness, reaction, "");
    setInvestigationBeat("出示", caseData.witness, reaction, "出示反应", [], [
      {
        speaker: "辩方",
        text: "庭审时别急着乱拍证物。先听证词哪里说死了，再用这份记录顶回去。",
      },
    ]);
    save();
    renderInvestigation();
  }

  function moveStatement(delta) {
    const caseData = currentCase();
    const progress = caseProgress(caseData.id);
    const testimony = caseData.testimony[progress.testimonyIndex];
    const visibleStatements = visibleStatementEntries(testimony, progress);
    progress.statementIndex = Math.max(
      0,
      Math.min(visibleStatements.length - 1, progress.statementIndex + delta)
    );
    const { statement, rawIndex } = currentStatementEntry(testimony, progress);
    const ready = statementReadyToPresent(statement, progress, progress.testimonyIndex, rawIndex);
    setStage(statementHasAnswer(statement) ? "clash" : "witness", ready ? "破绽已现" : `证词第 ${progress.statementIndex + 1} 句`, {
      left: ready ? "shock" : statementHasAnswer(statement) ? "tense" : "testify",
      right: "observe",
    });
    setMessage(testimony.speaker, statement.text, "");
    save();
    renderTrial();
  }

  function advanceTrialDialogueByClick() {
    if (state.screen !== "trial" || state.recordOpen) return;
    const caseData = currentCase();
    const progress = caseProgress(caseData.id);
    const testimony = caseData.testimony[progress.testimonyIndex];
    const visibleStatements = visibleStatementEntries(testimony, progress);
    if (progress.statementIndex < visibleStatements.length - 1) {
      moveStatement(1);
    }
  }

  function advanceTrialDialogueByPointer(clientX, sourceRect) {
    if (state.screen !== "trial" || state.recordOpen) return;
    const rect = sourceRect || null;
    if (!rect || rect.width <= 0) {
      return advanceTrialDialogueByClick();
    }
    const x = clientX - rect.left;
    const caseData = currentCase();
    const progress = caseProgress(caseData.id);
    const testimony = caseData.testimony[progress.testimonyIndex];
    const visibleStatements = testimony ? visibleStatementEntries(testimony, progress) : [];
    const hasPrevStatement = progress.statementIndex > 0;
    const hasNextStatement = progress.statementIndex < visibleStatements.length - 1;
    if (x <= rect.width / 2 && hasPrevStatement) {
      moveStatement(-1);
      return;
    }
    if (hasNextStatement) {
      advanceTrialDialogueByClick();
    }
  }

  function jumpStatement(index) {
    const caseData = currentCase();
    const progress = caseProgress(caseData.id);
    const testimony = caseData.testimony[progress.testimonyIndex];
    const visibleStatements = visibleStatementEntries(testimony, progress);
    const nextIndex = Math.max(0, Math.min(visibleStatements.length - 1, Number(index) || 0));
    progress.statementIndex = nextIndex;
    const { statement, rawIndex } = currentStatementEntry(testimony, progress);
    const ready = statementReadyToPresent(statement, progress, progress.testimonyIndex, rawIndex);
    setStage(statementHasAnswer(statement) ? "clash" : "witness", ready ? "破绽已现" : `证词第 ${nextIndex + 1} 句`, {
      left: ready ? "shock" : statementHasAnswer(statement) ? "tense" : "testify",
      right: "observe",
    });
    setMessage(testimony.speaker, statement.text, "");
    save();
    renderTrial();
  }

  function pressStatement() {
    const caseData = currentCase();
    const progress = caseProgress(caseData.id);
    const testimony = caseData.testimony[progress.testimonyIndex];
    const { statement, rawIndex } = currentStatementEntry(testimony, progress);
    const key = statementKey(progress.testimonyIndex, rawIndex);
    if (!progress.pressed.includes(key)) progress.pressed.push(key);
    let unlocked = "";
    if (statement.pressUnlockEvidence) {
      unlocked = unlockEvidence(caseData, statement.pressUnlockEvidence);
    }
    let unlockedStatement = "";
    if (statement.unlockStatementId && !progress.unlockedStatements.includes(statement.unlockStatementId)) {
      progress.unlockedStatements.push(statement.unlockStatementId);
      const revealed = testimony.statements.find((item) => item.hiddenUntilPressed === statement.unlockStatementId);
      unlockedStatement = revealed?.revealLabel || "新的证词";
      playCue("transition");
    }
    const extra = statementHasAnswer(statement) ? " 这句证词已经动摇，现在可以考虑举证。" : "";
    const unlockText = unlocked ? ` 新线索已加入法庭记录：${unlocked}。` : "";
    const revealText = unlockedStatement ? ` 新证词浮出水面：${unlockedStatement}。` : "";
    const focus = unlocked ? "record" : statementHasAnswer(statement) || unlockedStatement ? "clash" : "defense";
    const notice = unlocked ? "新线索写入法庭记录" : unlockedStatement ? "隐藏证词解锁" : statementHasAnswer(statement) ? "破绽已现" : "追问证词";
    setStage(focus, notice, {
      left: unlockedStatement || statementHasAnswer(statement) ? "shock" : "thinking",
      right: unlocked ? "observe" : "thinking",
    });
    setMessage("追问", `${statement.press}${extra}${unlockText}${revealText}`, statementHasAnswer(statement) || unlocked || unlockedStatement ? "objection" : "");
    save();
    renderTrial();
  }

  function unlockEvidence(caseData, evidenceId) {
    const collected = state.collected[caseData.id] || [];
    if (collected.includes(evidenceId)) return "";
    const item = evidenceById(caseData, evidenceId);
    if (!item) return "";
    collected.push(evidenceId);
    state.collected[caseData.id] = collected;
    playCue("objection");
    return item.name;
  }

  function prepareObjectionReveal(caseData, progress, statement, rawIndex, presentedLabel) {
    const turnabout = !statement.optionalRecovery && pressureLevel(progress) !== "stable" ? turnaboutBeat(caseData) : null;
    const deduction = statement.answerEvidence ? deductionForEvidence(caseData, statement.answerEvidence) : null;
    const title = turnabout ? "逆转" : statement.answerProfile ? "档案击破" : "异议成立";
    const subtitle = deduction ? "对照札记补上证物链条" : turnabout ? turnabout.title : statement.answerProfile ? "人物档案刺穿证词" : "证物与证词正面冲突";
    setStage("clash", "异议切入", { left: "confident", right: "stagger" });
    setImpactCue("objection", title, presentedLabel, subtitle);
    state.objectionReveal = {
      caseId: caseData.id,
      testimonyIndex: progress.testimonyIndex,
      rawIndex,
      step: 0,
      title,
      record: presentedLabel,
      target: statement.text,
      line: subtitle,
      deductionText: deduction?.text || "",
      deductionTarget: deduction?.targetName || "",
    };
    setMessage("辩方", `异议！${presentedLabel || "这份记录"}和这句证词对不上。`, "objection");
    playCue("objection");
    save();
    renderTrial();
  }

  function advanceObjectionReveal() {
    const reveal = state.objectionReveal;
    if (!reveal) return;
    const steps = objectionRevealSteps(reveal);
    const currentStep = Math.max(0, Math.min(steps.length - 1, Number(reveal.step) || 0));
    if (currentStep >= steps.length - 1) {
      resolveObjectionReveal();
      return;
    }
    reveal.step = currentStep + 1;
    playCue(reveal.step >= steps.length - 1 ? "counter" : "click");
    save();
    renderTrial();
  }

  function resolveObjectionReveal() {
    const reveal = state.objectionReveal;
    if (!reveal) return;
    const caseData = currentCase();
    const progress = caseProgress(caseData.id);
    const testimony = caseData.testimony[Number(reveal.testimonyIndex) || 0];
    const statement = testimony?.statements?.[Number(reveal.rawIndex) || 0];
    const key = statementKey(Number(reveal.testimonyIndex) || 0, Number(reveal.rawIndex) || 0);
    const presentedLabel = reveal.record || selectedRecordLabel(caseData);
    state.objectionReveal = null;
    if (!statement || progress.solved.includes(key)) {
      renderTrial();
      return;
    }
    applyCorrectPresent(caseData, progress, testimony, statement, key, presentedLabel);
  }

  function applyCorrectPresent(caseData, progress, testimony, statement, key, presentedLabel) {
    const rescuedFromPressure = !statement.optionalRecovery && pressureLevel(progress) !== "stable";
    const turnabout = rescuedFromPressure ? turnaboutBeat(caseData) : null;
    const deduction = statement.answerEvidence ? deductionForEvidence(caseData, statement.answerEvidence) : null;
    progress.solved.push(key);
    setStage("clash", turnabout ? turnabout.title : statement.answerProfile ? "人物档案击中矛盾" : "证物击中矛盾", { left: "shock", right: "stagger" });
    setImpactCue(
      "objection",
      turnabout ? "逆转" : statement.answerProfile ? "档案击破" : "异议成立",
      presentedLabel,
      turnabout ? turnabout.title : statement.answerProfile ? "人物档案刺穿证词" : "证物与证词正面冲突"
    );
    if (statement.optionalRecovery && statement.recoveryCredibility) {
      const recovered = Math.max(0, Number(statement.recoveryCredibility) || 0);
      progress.credibility = Math.min(5, progress.credibility + recovered);
      progress.recoveries += 1;
    }
    if (turnabout) {
      const recovered = Math.max(0, Number(turnabout.recovery) || 0);
      progress.credibility = Math.min(5, progress.credibility + recovered);
      progress.turnabouts += 1;
      progress.lastTurnabout = turnabout.title;
    }
    if (deduction) {
      const pursuitCopy = deductionPursuitCopy(caseData, statement, deduction, presentedLabel);
      const pursuitUnlock = deductionPursuitUnlock(caseData);
      progress.pendingDeductionFollowUp = {
        testimonyIndex: progress.testimonyIndex,
        rawIndex: Number(key.split(":")[1]) || 0,
        key,
        record: presentedLabel,
        target: statement.text,
        deductionText: deduction.text,
        deductionTarget: deduction.targetName || "",
        objectionText: statement.objection || "",
        turnaboutText: turnabout
          ? ` ${turnabout.title}：${turnabout.body}${turnabout.opponentLine ? ` ${turnabout.opponentLine}` : ""}`
          : "",
        optionalRecovery: Boolean(statement.optionalRecovery),
        recoveryCredibility: Number(statement.recoveryCredibility) || 0,
        pursuitTitle: pursuitCopy.title,
        chaseLine: pursuitCopy.defenseLine,
        witnessLine: pursuitCopy.witnessLine,
        buttonLabel: pursuitCopy.button,
        unlockEvidenceId: pursuitUnlock?.id || "",
        unlockEvidenceName: pursuitUnlock?.name || "",
        unlockStatementId: statement.pursuitUnlockStatementId || "",
        unlockStatementLabel: statement.pursuitUnlockLabel || "追击后的补充证词",
      };
      progress.deductionPursuits += 1;
      setStage("clash", "对照追击", { left: "confident", right: "stagger" });
      setMessage("辩方", "这条札记还可以继续追。不能只让证词倒下，要让证人解释证物之间为什么能对上。", "objection");
      playCue("counter");
      save();
      renderDeductionFollowUp();
      return;
    }
    finishCorrectPresent(caseData, progress, testimony, statement, key, statement.objection || "", turnabout ? ` ${turnabout.title}：${turnabout.body}${turnabout.opponentLine ? ` ${turnabout.opponentLine}` : ""}` : "");
  }

  function finishCorrectPresent(caseData, progress, testimony, statement, key, objectionText, turnaboutText = "") {
    if (testimonyFullySolved(testimony, progress.testimonyIndex, progress)) {
      advanceTestimony(caseData, progress, `${objectionText || statement.objection}${turnaboutText}`);
    } else {
      state.selectedEvidenceId = "";
      state.selectedProfileName = "";
      const recoveryText = statement.optionalRecovery && statement.recoveryCredibility ? ` 信誉恢复 ${statement.recoveryCredibility} 点。` : "";
      if (statement.optionalRecovery) {
        progress.statementIndex = Math.max(0, progress.statementIndex - 1);
      }
      setMessage("辩方", `${objectionText || statement.objection}${recoveryText}${turnaboutText} 但这段证词还有未解释的矛盾。`, "objection");
      playCue("objection");
      save();
      renderTrial();
    }
  }

  function continueDeductionFollowUp() {
    const caseData = currentCase();
    const progress = caseProgress(caseData.id);
    const followUp = progress.pendingDeductionFollowUp;
    if (!followUp) {
      renderTrial();
      return;
    }
    const testimony = caseData.testimony[Number(followUp.testimonyIndex) || progress.testimonyIndex];
    const statement = testimony?.statements?.[Number(followUp.rawIndex) || 0];
    const key = followUp.key || statementKey(Number(followUp.testimonyIndex) || progress.testimonyIndex, Number(followUp.rawIndex) || 0);
    const unlocked = followUp.unlockEvidenceId ? unlockEvidence(caseData, followUp.unlockEvidenceId) : "";
    if (unlocked) {
      progress.deductionPursuitUnlocks += 1;
      progress.lastPursuitUnlock = unlocked;
    } else if (followUp.unlockEvidenceName) {
      progress.lastPursuitUnlock = followUp.unlockEvidenceName;
    }
    let unlockedStatement = "";
    if (followUp.unlockStatementId && !progress.unlockedStatements.includes(followUp.unlockStatementId)) {
      progress.unlockedStatements.push(followUp.unlockStatementId);
      unlockedStatement = followUp.unlockStatementLabel || "追击后的补充证词";
      progress.lastPursuitStatement = unlockedStatement;
      const focusedIndex = visibleStatementEntries(testimony || { statements: [] }, progress).findIndex(
        ({ statement: item }) => item.hiddenUntilPressed === followUp.unlockStatementId
      );
      if (focusedIndex >= 0) progress.statementIndex = focusedIndex;
    }
    const unlockText = unlocked
      ? ` ${unlocked}已经写入法庭记录。`
      : followUp.unlockEvidenceName
        ? ` ${followUp.unlockEvidenceName}已经在法庭记录中，可以直接查看。`
        : "";
    const statementText = unlockedStatement ? ` 新证词追加：${unlockedStatement}。` : "";
    const stageMessage = `${followUp.chaseLine || "对照札记已经把证词推到新的缺口上。"} ${followUp.witnessLine || ""}${unlockText}${statementText} ${followUp.objectionText || statement?.objection || ""}`.trim();
    const finalPayload = {
      testimonyIndex: Number(followUp.testimonyIndex) || progress.testimonyIndex,
      rawIndex: Number(followUp.rawIndex) || 0,
      key,
      objectionText: followUp.objectionText || statement?.objection || "",
      turnaboutText: followUp.turnaboutText || "",
      stageMessage,
      unlockText,
      statementText,
    };
    progress.lastObjection = `${followUp.objectionText || statement?.objection || ""} ${followUp.chaseLine || ""} ${followUp.witnessLine || ""}${unlockText}${statementText}`.trim();
    setStage("clash", "追击成立", { left: "confident", right: "stagger" });
    setMessage("辩方", stageMessage, "objection");
    playCue("objection");
    save();
    if (!statement) {
      renderTrial();
      return;
    }
    if (!(unlocked || unlockedStatement || followUp.unlockEvidenceId || followUp.unlockStatementId)) {
      progress.pendingDeductionFollowUp = null;
      finalizePursuitFollowUp(caseData, progress, testimony, statement, finalPayload);
      return;
    }
    progress.pendingDeductionFollowUp = null;
    progress.pursuitUnlockFinalize = finalPayload;
    state.pursuitUnlockCue = {
      caseId: caseData.id,
      pursuitTitle: followUp.pursuitTitle || "对照追击成立",
      unlockEvidenceId: followUp.unlockEvidenceId || "",
      unlockEvidenceName: unlocked || followUp.unlockEvidenceName || "",
      unlockStatementText: unlockedStatement,
      unlockText: finalPayload.stageMessage,
      unlockTextBrief: unlockText || "已解锁新证据。",
    };
    renderPursuitUnlockCue();
    return;
  }

  function continuePursuitUnlock() {
    const caseData = currentCase();
    const progress = caseProgress(caseData.id);
    const cue = state.pursuitUnlockCue;
    const finalPayload = progress.pursuitUnlockFinalize;
    if (!cue || cue.caseId !== caseData.id || !finalPayload) {
      clearPursuitUnlockCue();
      progress.pursuitUnlockFinalize = null;
      renderTrial();
      return;
    }
    clearPursuitUnlockCue();
    progress.pursuitUnlockFinalize = null;
    const testimony = caseData.testimony[Number(finalPayload.testimonyIndex) || 0];
    const statement = testimony?.statements?.[Number(finalPayload.rawIndex) || 0];
    finalizePursuitFollowUp(caseData, progress, testimony, statement, finalPayload);
  }

  function finalizePursuitFollowUp(caseData, progress, testimony, statement, finalPayload) {
    progress.pendingDeductionFollowUp = null;
    if (!testimony || !statement) {
      renderTrial();
      return;
    }
    setMessage("辩方", finalPayload.stageMessage, "objection");
    playCue("objection");
    save();
    finishCorrectPresent(caseData, progress, testimony, statement, finalPayload.key, finalPayload.objectionText, finalPayload.turnaboutText);
  }

  function presentEvidence() {
    const caseData = currentCase();
    const progress = caseProgress(caseData.id);
    const testimony = caseData.testimony[progress.testimonyIndex];
    const { statement, rawIndex } = currentStatementEntry(testimony, progress);
    const key = statementKey(progress.testimonyIndex, rawIndex);
    const presentedLabel = selectedRecordLabel(caseData);
    state.recordOpen = false;
    state.recordInspect = null;
    state.recordInspectSpot = "";
    state.recordInspectView = "front";
    clearRecordInspectCompare();
    clearPursuitUnlockCue();
    if (state.objectionReveal) {
      resolveObjectionReveal();
      return;
    }
    if (statementHasAnswer(statement) && !progress.pressed.includes(key)) {
      setStage("opponent", "举证时机不足", { left: "stagger", right: "attack" });
      setImpactCue("penalty", "追问不足", presentedLabel, "先追问，再举证");
      state.selectedEvidenceId = "";
      state.selectedProfileName = "";
      setMessage("审判长", "这句还没被问出破绽。先追问，把话逼实了，再拍证物。", "penalty");
      playCue("penalty");
      renderTrial();
      return;
    }
    if (progress.solved.includes(key)) {
      setStage("witness", "证词已击破", { left: "stagger", right: "observe" });
      setMessage("审判长", "这句证词已经被击破。继续查看同段证词中尚未解释的矛盾。", "");
      renderTrial();
      return;
    }
    if (statementHasAnswer(statement) && statementAnswerMatched(statement)) {
      prepareObjectionReveal(caseData, progress, statement, rawIndex, presentedLabel);
    } else {
      const countered = statementCounterMatched(statement);
      const penalty = countered ? Number(statement.counterPenalty) || 2 : 1;
      progress.mistakes += 1;
      progress.credibility -= penalty;
      if (countered) {
        progress.counterattacks += 1;
        if (statement.counterRecoveryId && !progress.unlockedStatements.includes(statement.counterRecoveryId)) {
          progress.unlockedStatements.push(statement.counterRecoveryId);
        }
      }
      if (countered) {
        setStage("opponent", statement.counterNotice || "对手反制", { left: "stagger", right: "confident" });
        const recoveryHint = statement.counterRecoveryId ? " 但这次反制留下了新的补救破绽，继续查看证词条。" : "";
        setImpactCue("penalty", "反制", presentedLabel, caseData.opponent);
        setMessage(caseData.opponent, `${statement.counterFeedback || "对手抓住了这份证物的漏洞，辩方信誉受到重创。"}${recoveryHint}`, "penalty");
        playCue("counter");
      } else {
        setStage("opponent", "异议被驳回", { left: "stagger", right: "attack" });
        setImpactCue("penalty", "驳回", presentedLabel, "证物没有击中这句证词");
        setMessage("审判长", statement.wrongEvidenceFeedback || "异议被驳回。证物与这句证词没有形成矛盾。", "penalty");
      }
      if (progress.credibility <= 0) {
        progress.failed = true;
        progress.failureReason = state.message;
        progress.credibility = 0;
        setStage("opponent", "败诉", { left: "stagger", right: "confident" });
        setImpactCue("penalty", "败诉", presentedLabel, "法庭信誉归零");
        setMessage("审判长", "法庭信誉归零。本案暂时维持原判。", "penalty");
        playCue("collapse");
        save();
        renderBadEnding();
        return;
      }
      const pressure = pressureLevel(progress);
      if (pressure !== "stable") {
        const copy = pressureBeat(caseData, pressure);
        state.stageNotice = copy.title;
        state.message = `${state.message} ${copy.title}：${copy.opponentLine || copy.body}`;
      }
      state.selectedEvidenceId = "";
      state.selectedProfileName = "";
      if (!countered) playCue("penalty");
      save();
      renderTrial();
    }
  }

  function advanceTestimony(caseData, progress, message) {
    if (progress.testimonyIndex >= caseData.testimony.length - 1) {
      progress.grade = gradeForCase(progress);
      recordCompletion(caseData, progress);
      if (!state.completed.includes(caseData.id)) {
        state.completed.push(caseData.id);
      }
      save();
      setStage("verdict", "判决", { left: "confident", right: "stagger" });
      setMessage("辩方", message, "objection");
      playCue("verdict");
      renderResult();
      return;
    }
    progress.testimonyIndex += 1;
    progress.statementIndex = 0;
    progress.awaitingInterlude = true;
    progress.lastObjection = message || "";
    state.selectedEvidenceId = "";
    state.recordInspect = null;
    state.recordInspectSpot = "";
    state.recordInspectView = "front";
    clearRecordInspectCompare();
    setStage("clash", `证词更新：${caseData.testimony[progress.testimonyIndex].title}`, { left: "shock", right: "stagger" });
    setMessage("辩方", message, "objection");
    playCue("objection");
    save();
    renderTestimonyInterlude();
  }

  function continueTestimony() {
    const caseData = currentCase();
    const progress = caseProgress(caseData.id);
    progress.awaitingInterlude = false;
    const testimony = caseData.testimony[progress.testimonyIndex];
    const first = testimony.statements[0];
    setStage("witness", `${testimony.speaker}重新作证`, { left: "testify", right: "observe" });
    setMessage(testimony.speaker, first.text, "");
    playCue("transition");
    save();
    renderTrial();
  }

  function resetTrialProgress(caseData, message) {
    state.trial[caseData.id] = {
      credibility: 5,
      testimonyIndex: 0,
      statementIndex: 0,
      solved: [],
      pressed: [],
      unlockedStatements: [],
      awaitingInterlude: false,
      lastObjection: "",
      failed: false,
      failureReason: "",
      counterattacks: 0,
      recoveries: 0,
      turnabouts: 0,
      lastTurnabout: "",
        deductionPursuits: 0,
        deductionPursuitUnlocks: 0,
        lastPursuitUnlock: "",
        lastPursuitStatement: "",
        pendingDeductionFollowUp: null,
      mistakes: 0,
      grade: "",
    };
    state.selectedEvidenceId = "";
    state.selectedProfileName = "";
    state.objectionReveal = null;
    state.recordInspect = null;
    state.recordInspectSpot = "";
    state.recordInspectView = "front";
    clearRecordInspectCompare();
    state.recordTab = "evidence";
    setStage("witness", `${caseData.testimony[0].speaker}重新入庭`, { left: "enter", right: "observe" });
    setMessage("审判长", message || "庭审重新开始。调查证物保留，信誉恢复。", "");
    save();
  }

  function retryTrial() {
    const caseData = currentCase();
    resetTrialProgress(caseData, "庭审重开。调查证物保留，重新从第一段证词开始。");
    renderTrial();
  }

  function gradeForCase(progress) {
    if (progress.mistakes === 0) return "无瑕逆转";
    if (progress.mistakes <= 2) return "稳健逆转";
    return "险胜逆转";
  }

  function nextCase() {
    if (state.caseIndex < data.cases.length - 1) {
      openCase(state.caseIndex + 1);
    } else {
      renderHome();
    }
  }

  function replayCase(index) {
    const caseData = data.cases[index];
    if (!caseData) return;
    state.caseIndex = index;
    state.collected[caseData.id] = [];
    delete state.trial[caseData.id];
    delete state.investigation[caseData.id];
    state.completed = state.completed.filter((id) => id !== caseData.id);
    state.selectedEvidenceId = "";
    state.selectedProfileName = "";
    state.recordInspect = null;
    state.recordInspectSpot = "";
    state.recordInspectView = "front";
    clearRecordInspectCompare();
    state.recordTab = "evidence";
    clearEvidencePickup();
    clearInventoryCue();
    clearPursuitUnlockCue();
    setMessage("书记", "旧判决已归档。本次重审会重新计算评价，但保留最佳奖章。", "");
    save();
    renderCaseIntro();
  }

  function resetCurrentCase() {
    const caseData = currentCase();
    const resetIndex = Math.max(0, data.cases.findIndex((item) => item.id === caseData.id));
    const wasHome = state.screen === "home";
    state.caseIndex = resetIndex;
    state.homeFocusIndex = resetIndex;
    state.collected[caseData.id] = [];
    delete state.trial[caseData.id];
    delete state.investigation[caseData.id];
    delete state.records[caseData.id];
    state.completed = state.completed.filter((id) => id !== caseData.id);
    state.selectedEvidenceId = "";
    state.selectedProfileName = "";
    state.objectionReveal = null;
    state.recordInspect = null;
    state.recordInspectSpot = "";
    state.recordInspectView = "front";
    clearRecordInspectCompare();
    clearEvidencePickup();
    clearInventoryCue();
    state.settingsOpen = false;
    state.homeView = "menu";
    setMessage("系统", "当前案件已重置，结案记录也已清除。", "");
    save();
    if (wasHome) renderHome();
    else renderCaseIntro();
  }

  function rerender() {
    if (state.screen === "home") renderHome();
    else if (state.screen === "case") renderCaseIntro();
    else if (state.screen === "case-opening") renderCaseOpeningCutscene();
    else if (state.screen === "investigation") renderInvestigation();
    else if (state.screen === "trial" || state.screen === "trial-interlude") renderTrial();
    else if (state.screen === "bad-ending") renderBadEnding();
    else renderResult();
  }

  function handleClick(event) {
    const openingPanel = event.target.closest("[data-advance-opening-panel]");
    if (openingPanel && !event.target.closest("button")) {
      advanceCaseOpeningCutscene();
      return;
    }
    const pickupPanel = event.target.closest("[data-advance-pickup-panel]");
    if (pickupPanel && !event.target.closest("button")) {
      playCue("click");
      advanceEvidencePickup();
      return;
    }
    const beatPanel = event.target.closest("[data-advance-investigation-panel]");
    if (beatPanel && !event.target.closest("button")) {
      playCue("click");
      advanceOrCloseInvestigationBeat();
      return;
    }
    const trialDialogPanel = event.target.closest("[data-advance-trial-dialogue]");
    if (trialDialogPanel && !event.target.closest("button") && state.screen === "trial") {
      playCue("click");
      advanceTrialDialogueByPointer(event.clientX, trialDialogPanel.getBoundingClientRect());
      return;
    }
    const trialScenePanel = event.target.closest("[data-advance-trial-scene]");
    if (trialScenePanel && !event.target.closest("button") && state.screen === "trial") {
      playCue("click");
      advanceTrialDialogueByPointer(event.clientX, trialScenePanel.getBoundingClientRect());
      return;
    }
    const interludePanel = event.target.closest("[data-continue-testimony-panel]");
    if (interludePanel && !event.target.closest("button")) {
      playCue("click");
      continueTestimony();
      return;
    }
    const pursuitPanel = event.target.closest("[data-continue-pursuit-unlock]");
    if (pursuitPanel && !event.target.closest("button")) {
      playCue("click");
      continuePursuitUnlock();
      return;
    }
    const deductionFollowupPanel = event.target.closest("[data-continue-deduction-followup-panel]");
    if (deductionFollowupPanel && !event.target.closest("button")) {
      playCue("click");
      continueDeductionFollowUp();
      return;
    }
    const revealPanel = event.target.closest("[data-advance-reveal-panel]");
    if (revealPanel && !event.target.closest("button")) {
      playCue("click");
      advanceObjectionReveal();
      return;
    }
    const openCaseCard = event.target.closest("[data-open-case-card]");
    if (openCaseCard && !event.target.closest("button")) {
      playCue("click");
      const index = Number(openCaseCard.dataset.openCaseCard);
      if (Number.isFinite(index)) {
        openCase(index);
      }
      return;
    }
    const target = event.target.closest("button");
    if (!target) return;

    if (target.dataset.openCaseSourceCase !== undefined && target.dataset.openCaseSource !== undefined) {
      const caseIndex = Number(target.dataset.openCaseSourceCase);
      const sourceIndex = Number(target.dataset.openCaseSource);
      const clampedCaseIndex = Number.isFinite(caseIndex)
        ? Math.max(0, Math.min(data.cases.length - 1, caseIndex))
        : -1;
      if (Number.isFinite(clampedCaseIndex) && clampedCaseIndex >= 0) {
        const caseData = data.cases[clampedCaseIndex];
        if (caseData) {
          const items = caseSourceItems(caseData);
          const clampedSourceIndex = Number.isFinite(sourceIndex)
            ? Math.max(0, Math.min(items.length - 1, sourceIndex))
            : 0;
          playCue("click");
          openCase(clampedCaseIndex);
          state.caseSourceIndex = clampedSourceIndex;
          renderCaseIntro();
        }
      }
      return;
    }

    if (target.dataset.openCaseSource !== undefined) {
      const items = caseSourceItems(currentCase());
      const sourceIndex = Number(target.dataset.openCaseSource);
      state.caseSourceIndex = Number.isFinite(sourceIndex) ? Math.max(0, Math.min(items.length - 1, sourceIndex)) : 0;
      renderCaseIntro();
      return;
    }

    playCue("click");
    if (target.dataset.focusCase) {
      focusHomeCase(target.dataset.focusCase);
      return;
    }
    if (target.dataset.timelineSource !== undefined) {
      const sources = caseSourceItems(currentCase());
      const index = Math.max(0, Math.min(sources.length - 1, Number(target.dataset.timelineSource) || 0));
      state.caseSourceIndex = index;
      const source = sources[index];
      setMessage("卷宗", source ? `已定位到线索：${source.storyTitle}` : "已定位到该线索。", "");
      rerender();
      return;
    }
    if (target.dataset.advanceOpening !== undefined) {
      advanceCaseOpeningCutscene();
      return;
    }
    if (target.dataset.skipOpening !== undefined) {
      playCue("click");
      finishCaseOpeningCutscene();
      return;
    }
    if (target.dataset.openCase) openCase(Number(target.dataset.openCase));
    if (target.dataset.continueCase !== undefined) openCase(continueCaseIndex());
    if (target.dataset.homeView) {
      state.homeView = target.dataset.homeView;
      renderHome();
    }
    if (target.dataset.saveSlot !== undefined) manualSave(target.dataset.saveSlot);
    if (target.dataset.loadSlot !== undefined) manualLoad(target.dataset.loadSlot);
    if (target.dataset.clearSlot !== undefined) manualClear(target.dataset.clearSlot);
    if (target.dataset.replayCase) replayCase(Number(target.dataset.replayCase));
    if (target.dataset.mode) setMode(target.dataset.mode);
    if (target.dataset.openIntro !== undefined) renderCaseIntro();
    if (target.dataset.command) setCommand(target.dataset.command);
    if (target.dataset.advanceInvestigationBeat !== undefined) advanceInvestigationBeat();
    if (target.dataset.retreatInvestigationBeat !== undefined) retreatInvestigationBeat();
    if (target.dataset.closeInvestigationBeat !== undefined) closeInvestigationBeat();
    if (target.dataset.advancePickup !== undefined) advanceEvidencePickup();
    if (target.dataset.moveLocation !== undefined) moveLocation(Number(target.dataset.moveLocation));
    if (target.dataset.examineSpot !== undefined) examineSpot(Number(target.dataset.examineSpot));
    if (target.dataset.talkTopic !== undefined) talkTopic(Number(target.dataset.talkTopic));
    if (target.dataset.presentInvestigation) presentDuringInvestigation(target.dataset.presentInvestigation);
    if (target.dataset.jumpStatement !== undefined) jumpStatement(Number(target.dataset.jumpStatement));
    if (target.dataset.selectEvidence) {
      state.selectedEvidenceId = target.dataset.selectEvidence;
      state.selectedProfileName = "";
      state.recordTab = "evidence";
      state.recordOpen = state.screen === "trial" ? false : state.recordOpen;
      setMessage("法庭记录", "证物已放到手边；还没有提交。确认要用它时，再点主操作区的“举证”。", "");
      rerender();
    }
    if (target.dataset.selectProfile) {
      state.selectedProfileName = target.dataset.selectProfile;
      state.selectedEvidenceId = "";
      state.recordOpen = state.screen === "trial" ? false : state.recordOpen;
      setMessage("人物档案", `${target.dataset.selectProfile}的档案已加入本次推理参考。`, "");
      rerender();
    }
    if (target.dataset.recordTab) {
      state.recordTab = target.dataset.recordTab;
      rerender();
    }
    if (target.dataset.inspectRecord) openRecordInspect(target.dataset.inspectRecord);
    if (target.dataset.closeInspect !== undefined) closeRecordInspect();
    if (target.dataset.inspectStep !== undefined) stepRecordInspect(Number(target.dataset.inspectStep));
    if (target.dataset.inspectSpot) {
      state.recordInspectSpot = target.dataset.inspectSpot;
      const inspect = currentRecordInspect(currentCase());
      if (inspect?.type === "evidence") markRecordInspectFinding(inspect.item, activeInspectView().id, state.recordInspectSpot);
      clearRecordInspectTransient();
      rerender();
    }
    if (target.dataset.inspectView) {
      setRecordInspectView(target.dataset.inspectView, "button");
      rerender();
    }
    if (target.dataset.compareInspect) compareInspectEvidence(target.dataset.compareInspect);
    if (target.dataset.returnToTrial !== undefined || target.dataset.returnToTrialInspect !== undefined) {
      state.recordOpen = false;
      state.recordInspect = null;
      state.recordInspectSpot = "";
      state.recordInspectView = "front";
      clearRecordInspectCompare();
      setMessage("法庭记录", "记录已合上。现在可以在主操作区点击“举证”正式提交。", "");
      rerender();
    }
    if (target.dataset.prevStatement !== undefined) moveStatement(-1);
    if (target.dataset.press !== undefined) pressStatement();
    if (target.dataset.present !== undefined) presentEvidence();
    if (target.dataset.advanceReveal !== undefined) advanceObjectionReveal();
    if (target.dataset.revealObjection !== undefined) resolveObjectionReveal();
    if (target.dataset.continueDeductionFollowup !== undefined) continueDeductionFollowUp();
    if (target.dataset.continuePursuitUnlock !== undefined) continuePursuitUnlock();
    if (target.dataset.continueTestimony !== undefined) continueTestimony();
    if (target.dataset.retryTrial !== undefined) retryTrial();
    if (target.dataset.home !== undefined) renderHome();
    if (target.dataset.returnCase !== undefined) {
      const index = Number.isFinite(state.caseIndex) ? Math.max(0, Math.min(data.cases.length - 1, state.caseIndex)) : continueCaseIndex();
      openCase(index);
      return;
    }
    if (target.dataset.nextCase !== undefined) nextCase();
    if (target.dataset.toggleGuide !== undefined) {
      state.guideOpen = !state.guideOpen;
      if (state.guideOpen) {
        const guide = currentGuideContext();
        state.guideSeen[guide.id] = true;
      }
      save();
      rerender();
    }
    if (target.dataset.toggleSettings !== undefined) {
      state.settingsOpen = !state.settingsOpen;
      rerender();
    }
    if (target.dataset.openRecord !== undefined) {
      clearEvidencePickup();
      clearInventoryCue();
      state.recordOpen = true;
      rerender();
    }
    if (target.dataset.closeRecord !== undefined) {
      state.recordOpen = false;
      rerender();
    }
    if (target.dataset.hideGuides !== undefined) {
      state.settings.hideGuides = true;
      state.guideOpen = false;
      save();
      rerender();
    }
    if (target.dataset.resetCase !== undefined) resetCurrentCase();
  }

  function handleChange(event) {
    const target = event.target;
    if (!target.dataset.setting) return;
    const setting = target.dataset.setting;
    if (target.type === "checkbox") {
      state.settings[setting] = target.checked;
    } else if (target.type === "range") {
      state.settings[setting] = audioNumber(target.value, defaultSettings[setting] ?? 0.5);
    } else {
      state.settings[setting] = target.value;
    }
    save();
    playCue("click");
    syncAudioForScreen();
    rerender();
  }

  function handlePointerDown(event) {
    const stage = event.target.closest("[data-inspect-drag-stage]");
    if (!stage || event.target.closest("button") || !state.recordInspect || state.recordInspect.type !== "evidence") return;
    state.inspectDrag = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };
    stage.setPointerCapture?.(event.pointerId);
  }

  function handlePointerUp(event) {
    const drag = state.inspectDrag;
    if (!drag || (drag.pointerId !== undefined && event.pointerId !== drag.pointerId)) return;
    state.inspectDrag = null;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (Math.abs(dx) < 44 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
    rotateRecordInspectView(dx < 0 ? 1 : -1, "drag");
    rerender();
  }

  function handlePointerCancel(event) {
    if (!state.inspectDrag || (state.inspectDrag.pointerId !== undefined && event.pointerId !== state.inspectDrag.pointerId)) return;
    state.inspectDrag = null;
  }

  function handleKeydown(event) {
    if (state.screen === "case-opening") {
      if (event.key === "Escape") {
        event.preventDefault();
        playCue("click");
        finishCaseOpeningCutscene();
        return;
      }
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        advanceCaseOpeningCutscene();
        return;
      }
    }
    if (state.screen === "investigation" && !state.recordOpen && !state.recordInspect && !state.settingsOpen && !state.guideOpen) {
      const commandByKey = {
        1: "move",
        2: "examine",
        3: "talk",
        4: "present",
      };
      const command = commandByKey[event.key];
      if (command) {
        event.preventDefault();
        setCommand(command);
        return;
      }
    }
    if (
      event.key === "Escape" &&
      !state.settingsOpen &&
      !state.guideOpen &&
      !state.recordOpen &&
      !state.recordInspect &&
      !state.objectionReveal &&
      !state.investigationBeat &&
      !state.pursuitUnlockCue &&
      state.screen !== "home"
    ) {
      event.preventDefault();
      playCue("click");
      state.homeView = "menu";
      renderHome();
      return;
    }
    if (state.screen === "trial" && (event.key === "Enter" || event.key === " ")) {
      const isButtonFocus = event.target && event.target.closest && event.target.closest("button");
      if (!isButtonFocus && !state.recordOpen) {
        const caseData = currentCase();
        const progress = caseProgress(caseData.id);
        const { statement, rawIndex } = currentStatementEntry(caseData.testimony[progress.testimonyIndex], progress);
        const readyToPresent = statementReadyToPresent(statement, progress, progress.testimonyIndex, rawIndex);
        if (readyToPresent && selectedRecordLabel(caseData) && !state.objectionReveal && !state.pursuitUnlockCue && !state.settingsOpen) {
          event.preventDefault();
          playCue("click");
          presentEvidence();
          return;
        }
        event.preventDefault();
        playCue("click");
        advanceTrialDialogueByClick();
        return;
      }
    }
    if (state.screen === "trial" && !state.recordOpen && !state.objectionReveal && !state.pursuitUnlockCue && !state.investigationBeat && !state.settingsOpen && !state.guideOpen) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        playCue("click");
        moveStatement(-1);
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        playCue("click");
        advanceTrialDialogueByClick();
        return;
      }
    }
    if (state.screen === "trial" && event.key.toLowerCase() === "e" && !state.recordOpen) {
      const caseData = currentCase();
      const progress = caseProgress(caseData.id);
      const { statement, rawIndex } = currentStatementEntry(caseData.testimony[progress.testimonyIndex], progress);
      const readyToPresent = statementReadyToPresent(statement, progress, progress.testimonyIndex, rawIndex);
      if (readyToPresent && !state.objectionReveal && !state.pursuitUnlockCue && !state.settingsOpen) {
        event.preventDefault();
        playCue("click");
        presentEvidence();
        return;
      }
    }
    if (state.evidencePickup && state.screen === "investigation" && event.key === "Escape") {
      event.preventDefault();
      playCue("click");
      clearEvidencePickup();
      clearInventoryCue();
      rerender();
      return;
    }
    if (state.evidencePickup && state.screen === "investigation" && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      playCue("click");
      advanceEvidencePickup();
      return;
    }
    if (state.pursuitUnlockCue && event.key === "Escape") {
      event.preventDefault();
      playCue("click");
      const caseData = currentCase();
      const progress = caseProgress(caseData.id);
      clearPursuitUnlockCue();
      progress.pursuitUnlockFinalize = null;
      renderTrial();
      return;
    }
    if (state.recordInspect) {
      if (event.key === "Escape") {
        playCue("click");
        closeRecordInspect();
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        playCue("click");
        stepRecordInspect(-1);
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        playCue("click");
        stepRecordInspect(1);
        return;
      }
    }
    if (event.key === "Escape" && state.recordOpen) {
      playCue("click");
      state.recordOpen = false;
      rerender();
      return;
    }
    if (event.key === "Escape" && state.settingsOpen) {
      playCue("click");
      state.settingsOpen = false;
      rerender();
      return;
    }
    if (event.key === "Escape" && state.guideOpen) {
      playCue("click");
      state.guideOpen = false;
      rerender();
      return;
    }
    if (state.screen === "home") {
      const focusedCaseCard = document.activeElement?.closest?.("[data-open-case-card]");
      if (focusedCaseCard && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        const index = Number(focusedCaseCard.dataset.openCaseCard);
        if (Number.isFinite(index)) {
          playCue("click");
          openCase(index);
        }
        return;
      }
    }
    if (state.objectionReveal && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      advanceObjectionReveal();
      return;
    }
    if (event.key.toLowerCase() === "s") {
      playCue("click");
      state.settingsOpen = !state.settingsOpen;
      rerender();
      return;
    }
    if (event.key.toLowerCase() === "r" && state.screen !== "home") {
      playCue("click");
      if ((state.screen === "trial" || state.screen === "investigation") && !state.recordOpen) {
        state.recordOpen = true;
        rerender();
        return;
      }
      const tabs = ["evidence", "profiles", "timeline", "backlog"];
      const next = (tabs.indexOf(state.recordTab) + 1) % tabs.length;
      state.recordTab = tabs[next];
      rerender();
      return;
    }
    if (state.screen === "investigation" && state.investigationBeat && !state.recordOpen && !state.settingsOpen && !state.guideOpen && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      advanceOrCloseInvestigationBeat();
      return;
    }
    if (state.screen === "trial-interlude" && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      continueTestimony();
      return;
    }
    if (state.screen === "trial" && caseProgress(currentCase().id).pendingDeductionFollowUp && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      continueDeductionFollowUp();
      return;
    }
    if (state.screen === "trial" && state.pursuitUnlockCue && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      continuePursuitUnlock();
      return;
    }
    if (state.screen !== "trial") return;
    if (event.key === "ArrowLeft") {
      playCue("click");
      moveStatement(-1);
    }
    if (event.key === "ArrowRight") {
      playCue("click");
      moveStatement(1);
    }
    if (event.key.toLowerCase() === "p") pressStatement();
    if (event.key === "Enter" && (state.selectedEvidenceId || state.selectedProfileName)) presentEvidence();
  }

  function renderGameToText() {
    const caseData = currentCase();
    const progress = caseProgress(caseData.id);
    const inv = investigationProgress(caseData.id);
    const testimony = caseData.testimony[progress.testimonyIndex];
    const visibleStatements = testimony ? visibleStatementEntries(testimony, progress) : [];
    const currentEntry = testimony ? currentStatementEntry(testimony, progress) : null;
    const statement = currentEntry?.statement || null;
    const record = caseRecord(caseData.id);
    const guide = currentGuideContext();
    const location = currentLocation(caseData);
    const locationExamined = location.examineSpots.filter((_, index) => inv.examined.includes(`${inv.locationIndex}:${index}`));
    const locationEvidence = (location.evidenceIds || []).filter((id) => (state.collected[caseData.id] || []).includes(id));
    const activeClue = locationExamined[locationExamined.length - 1] || location.examineSpots[0];
    const closeup = closeupForSpot(activeClue, location, caseData, locationExamined.length > 0);
    const selectedEvidence = state.selectedEvidenceId ? evidenceById(caseData, state.selectedEvidenceId) : null;
    const selectedEvidenceVisual = selectedEvidence ? evidenceVisualFor(selectedEvidence, true) : null;
    const selectedEvidencePosition = selectedEvidence ? evidenceSheetPosition(selectedEvidence, caseData) : null;
    const selectedDeduction = selectedEvidence ? deductionForEvidence(caseData, selectedEvidence.id) : null;
    const inspect = currentRecordInspect(caseData);
    const inspectSpot = inspect?.type === "evidence" ? activeInspectSpot(inspect.item) : null;
    const inspectProgress = inspect?.type === "evidence" ? recordInspectProgress(inspect.item) : { label: "", checked: 0, total: 0 };
    const inspectCompareOptions = inspect?.type === "evidence" ? inspectCompareOptionsForEvidence(inspect.item, caseData) : [];
    const inspectCompareTarget = inspect?.type === "evidence" ? inspectCompareTargetForEvidence(inspect.item, caseData) : null;
    const inspectCompare = inspect?.type === "evidence" && state.recordInspectCompare?.sourceId === inspect.item.id ? state.recordInspectCompare : null;
    const trialDeduction = currentEntry ? trialDeductionForStatement(caseData, currentEntry.statement, progress, progress.testimonyIndex, currentEntry.rawIndex) : null;
    const pickup = currentEvidencePickup(caseData);
    const inventoryCue = currentInventoryCue(caseData);
    const nextCaseIndex = continueCaseIndex();
    const nextCase = data.cases[nextCaseIndex] || caseData;
    const manualSlots = readSaveSlots();
    const caseSourceTabs = caseSourceItems(caseData);
    const activeSource = activeCaseSource(caseData);
    const openingStory = caseOpeningStory(caseData);
    return storageCodec.stringify({
      note: "文字状态供自动化测试使用；屏幕左上为原点，坐标不适用于本 DOM 游戏。",
      screen: state.screen,
      homeView: state.homeView,
      currentCase: caseData.title,
      homeFocusCase: data.cases[state.homeFocusIndex]?.title || "",
      homeFocusScene: data.cases[state.homeFocusIndex]?.scene?.name || "",
      homeFocusEpisodeArt: data.cases[state.homeFocusIndex]?.scene?.key ? `episode-art-${data.cases[state.homeFocusIndex].scene.key}.png` : "",
      homeFocusRuns: caseRecord(data.cases[state.homeFocusIndex]?.id || caseData.id).runs.length,
      continueCase: nextCase.title,
      continueCaseIndex: nextCaseIndex,
      continueLabel: continueLabel(nextCase),
      caseOpeningTitle: openingStory.title,
      caseOpeningBody: openingStory.body,
      caseOpeningStakes: openingStory.stakes,
      openingCutsceneStep: state.screen === "case-opening" ? `${(Number(state.openingCutscene?.step) || 0) + 1}/${caseOpeningBeats(caseData).length}` : "",
      openingCutsceneTitle: state.screen === "case-opening" ? caseOpeningBeats(caseData)[Number(state.openingCutscene?.step) || 0]?.title || "" : "",
      openingCutsceneSpeaker: state.screen === "case-opening" ? caseOpeningBeats(caseData)[Number(state.openingCutscene?.step) || 0]?.speaker || "" : "",
      openingCutsceneLine: state.screen === "case-opening" ? caseOpeningBeats(caseData)[Number(state.openingCutscene?.step) || 0]?.line || "" : "",
      openingSeen: Boolean(inv.openingSeen),
      caseBriefingCards: caseBriefingCards(caseData).map((card) => card.title),
      caseIntroArt: caseData.locations?.[0] ? locationBackgroundFile(caseData, caseData.locations[0]) : "",
      caseSourceTabs: caseSourceTabs.map((item) => item.storyTitle),
      activeCaseSourceTitle: activeSource?.storyTitle || "",
      activeCaseSourceChapter: activeSource?.title || "",
      activeCaseSourceNote: activeSource?.storyNote || "",
      manualSaveSlots: manualSlots.map((slot, index) => ({
        index,
        filled: Boolean(slot?.data),
        caseTitle: slot?.summary?.caseTitle || "",
        stage: slot?.summary?.stage || "",
        savedAt: slot?.savedAt || "",
      })),
      manualSaveFilled: manualSlots.filter((slot) => slot?.data).length,
      location: location.name,
      scene: caseData.scene?.name || "",
      sceneVariant: location.sceneVariant || "",
      locationArt: locationBackgroundFile(caseData, location),
      activeClue: activeClue?.name || "",
      closeupType: closeup.type,
      closeupTitle: closeup.title,
      closeupStatus: closeup.status,
      clueProgress: `${locationExamined.length}/${location.examineSpots.length}`,
      locationEvidenceProgress: `${locationEvidence.length}/${(location.evidenceIds || []).length}`,
      episodeArt: caseData.scene?.key ? `episode-art-${caseData.scene.key}.png` : "",
      investigationCommand: inv.command,
      collectedEvidence: (state.collected[caseData.id] || []).length,
      selectedEvidence: selectedEvidence?.name || "",
      selectedEvidenceIcon: selectedEvidenceVisual ? `${selectedEvidenceVisual.type}:${selectedEvidenceVisual.label}` : "",
      selectedEvidenceArt: selectedEvidencePosition ? `${selectedEvidencePosition.row + 1}-${selectedEvidencePosition.col + 1}` : "",
      selectedEvidenceArtAsset: selectedEvidencePosition ? "evidence-item-sheet-v3.png" : "",
      selectedEvidenceUsesBitmapOnly: selectedEvidenceVisual ? selectedEvidenceVisual.label === "" : false,
      selectedEvidenceRisk: selectedEvidence?.counterRisk || "",
      selectedEvidenceDeduction: selectedDeduction?.text || "",
      selectedEvidenceDeductionTarget: selectedDeduction?.targetName || "",
      selectedProfile: state.selectedProfileName,
      selectedRecordLabel: selectedRecordLabel(caseData),
      recordReturnAvailable: state.screen === "trial" && state.recordOpen && Boolean(selectedRecordLabel(caseData)),
      presentEnabled: state.screen === "trial" && Boolean(selectedRecordLabel(caseData)),
      trialDeductionAvailable: Boolean(trialDeduction),
      trialDeductionEvidence: trialDeduction?.evidence?.name || "",
      trialDeductionTarget: trialDeduction?.deduction?.targetName || "",
      trialDeductionText: trialDeduction?.deduction?.text || "",
      recordInspectOpen: Boolean(inspect),
      recordInspectType: inspect?.type || "",
      recordInspectTitle: inspect?.item?.name || "",
      recordInspectIndex: inspect ? `${inspect.index + 1}/${inspect.items.length}` : "",
      recordInspectView: inspect?.type === "evidence" ? activeInspectView().label : "",
      recordInspectSpot: inspectSpot?.label || "",
      recordInspectObservation: inspectSpot?.text || "",
      recordInspectLens: inspect?.type === "evidence" && inspectSpot ? `${activeInspectView().id}:${inspectSpot.id}` : "",
      recordInspectLensLabel: inspectSpot?.label || "",
      recordInspectSpotId: inspectSpot?.id || "",
      recordInspectSpotChecked: inspect?.type === "evidence" && inspectSpot ? isRecordInspectFindingChecked(inspect.item, activeInspectView().id, inspectSpot.id) : false,
      recordInspectProgress: inspectProgress.label,
      recordInspectCheckedCount: inspectProgress.checked,
      recordInspectTotalCount: inspectProgress.total,
      recordInspectCompareReady: inspect?.type === "evidence" ? isRecordInspectComplete(inspect.item) : false,
      recordInspectCompareOptions: inspectCompareOptions.map((item) => item.name),
      recordInspectCompareTarget: inspectCompareTarget?.name || "",
      recordInspectCompareResult: inspectCompare?.result || "",
      recordInspectCompareText: inspectCompare?.text || "",
      recordInspectDeduction: inspect?.type === "evidence" ? deductionForEvidence(caseData, inspect.item.id)?.text || "" : "",
      recordDeductionCount: Object.keys(state.recordDeductions[caseData.id] || {}).length,
      recordInspectGesture: state.recordInspectGesture || "",
      investigationBeatKind: state.screen === "investigation" ? state.investigationBeat?.kind || "" : "",
      investigationBeatSpeaker: state.screen === "investigation" ? state.investigationBeat?.speaker || "" : "",
      investigationBeatResult: state.screen === "investigation" ? state.investigationBeat?.result || "" : "",
      investigationBeatStep: state.screen === "investigation" && state.investigationBeat?.lines?.length ? `${Number(state.investigationBeat.lineIndex || 0) + 1}/${state.investigationBeat.lines.length}` : "",
      investigationBeatLineSpeaker: state.screen === "investigation" && state.investigationBeat?.lines?.length ? state.investigationBeat.lines[Number(state.investigationBeat.lineIndex || 0)]?.speaker || "" : "",
      investigationBeatLine: state.screen === "investigation" && state.investigationBeat?.lines?.length ? state.investigationBeat.lines[Number(state.investigationBeat.lineIndex || 0)]?.text || "" : "",
      investigationBeatHasPrevious: state.screen === "investigation" && state.investigationBeat?.lines?.length ? Number(state.investigationBeat.lineIndex || 0) > 0 : false,
      investigationBeatHasNext: state.screen === "investigation" && state.investigationBeat?.lines?.length ? Number(state.investigationBeat.lineIndex || 0) < state.investigationBeat.lines.length - 1 : false,
      investigationBeatPortrait: state.screen === "investigation" && state.investigationBeat?.lines?.length ? investigationPortraitForSpeaker(caseData, state.investigationBeat.lines[Number(state.investigationBeat.lineIndex || 0)]?.speaker || "") : "",
      evidencePickupOpen: Boolean(pickup),
      evidencePickupName: pickup?.item?.name || "",
      evidencePickupIndex: pickup ? `${pickup.index + 1}/${pickup.items.length}` : "",
      evidencePickupHasNext: pickup ? pickup.index < pickup.items.length - 1 : false,
      evidencePickupArt: pickup ? `${evidenceSheetPosition(pickup.item, caseData).row + 1}-${evidenceSheetPosition(pickup.item, caseData).col + 1}` : "",
      inventoryCueOpen: Boolean(inventoryCue),
      inventoryCueName: inventoryCue?.item?.name || "",
      inventoryCueArt: inventoryCue ? `${evidenceSheetPosition(inventoryCue.item, caseData).row + 1}-${evidenceSheetPosition(inventoryCue.item, caseData).col + 1}` : "",
      guideOpen: state.guideOpen,
      guideTitle: guide.title,
      guideSeen: Boolean(state.guideSeen[guide.id]),
      guidesHidden: Boolean(state.settings.hideGuides),
      canStartTrial: allEvidenceCollected(caseData),
      missingTrialEvidence: missingTrialEvidence(caseData),
      audioReady: Boolean(audioState.ctx),
      audioSamplesLoaded: Object.keys(audioState.sampleBuffers).length,
      audioSamplesTotal: Object.keys(sampleCuePaths).length,
      audioMusic: audioState.musicMode,
      musicTracksLoaded: Object.keys(audioState.musicBuffers).length,
      musicTracksTotal: Object.keys(musicLoopPaths).length,
      audioMuted: Boolean(state.settings.muted),
      audioMode: audioModeForScreen(),
      audioAmbience: audioState.ambienceMode,
      sfxVolume: audioNumber(state.settings.sfxVolume, defaultSettings.sfxVolume),
      ambienceVolume: audioNumber(state.settings.ambienceVolume, defaultSettings.ambienceVolume),
      musicVolume: audioNumber(state.settings.musicVolume, defaultSettings.musicVolume),
      credibility: progress.credibility,
      pressureLevel: pressureLevel(progress),
      pressureLabel: pressureBeat(caseData, pressureLevel(progress)).label,
      pressureTitle: pressureBeat(caseData, pressureLevel(progress)).title,
      pressureBody: pressureBeat(caseData, pressureLevel(progress)).body,
      pressureOpponentLine: pressureBeat(caseData, pressureLevel(progress)).opponentLine || "",
      turnabouts: progress.turnabouts || 0,
      lastTurnabout: progress.lastTurnabout || "",
      deductionPursuits: progress.deductionPursuits || 0,
      deductionPursuitUnlocks: progress.deductionPursuitUnlocks || 0,
      lastPursuitUnlock: progress.lastPursuitUnlock || "",
      lastPursuitStatement: progress.lastPursuitStatement || "",
      pendingDeductionFollowUp: Boolean(progress.pendingDeductionFollowUp),
      pendingDeductionRecord: progress.pendingDeductionFollowUp?.record || "",
      pendingDeductionText: progress.pendingDeductionFollowUp?.deductionText || "",
      pendingDeductionTarget: progress.pendingDeductionFollowUp?.deductionTarget || "",
      pendingDeductionPursuitTitle: progress.pendingDeductionFollowUp?.pursuitTitle || "",
      pendingDeductionChaseLine: progress.pendingDeductionFollowUp?.chaseLine || "",
      pendingDeductionWitnessLine: progress.pendingDeductionFollowUp?.witnessLine || "",
      pendingDeductionButton: progress.pendingDeductionFollowUp?.buttonLabel || "",
      pendingDeductionUnlock: progress.pendingDeductionFollowUp?.unlockEvidenceName || "",
      pendingDeductionStatementUnlock: progress.pendingDeductionFollowUp?.unlockStatementLabel || "",
      pursuitUnlockCueOpen: Boolean(state.pursuitUnlockCue),
      pursuitUnlockCueCaseId: state.pursuitUnlockCue?.caseId || "",
      pursuitUnlockCueEvidence: state.pursuitUnlockCue?.unlockEvidenceName || "",
      pursuitUnlockCueStatement: state.pursuitUnlockCue?.unlockStatementText || "",
      pursuitUnlockCueMessage: state.pursuitUnlockCue?.unlockText || "",
      pursuitUnlockAwaitFinalize: Boolean(progress.pursuitUnlockFinalize),
      pursuitNoteCollected: (state.collected[caseData.id] || []).includes(`${caseData.id}-ev-pursuit-note`),
      turnaboutTitle: turnaboutBeat(caseData).title,
      turnaboutBody: turnaboutBeat(caseData).body,
      turnaboutOpponentLine: turnaboutBeat(caseData).opponentLine || "",
      mistakes: progress.mistakes,
      failed: Boolean(progress.failed),
      failureReason: progress.failureReason || "",
      awaitingInterlude: Boolean(progress.awaitingInterlude),
      grade: progress.grade || "",
      bestGrade: record.bestGrade || "",
      bestMedal: record.bestMedal || "",
      clears: record.clears || 0,
      stageFocus: state.stageFocus,
      stageNotice: state.stageNotice,
      poseSpriteAsset: "character-pose-strip-v1.png",
      poseSpriteRows: 3,
      stagePoseLeft: currentStagePose().left,
      stagePoseRight: currentStagePose().right,
      impactKind: state.impactCue?.kind || "",
      impactTitle: state.impactCue?.title || "",
      impactRecord: state.impactCue?.record || "",
      impactSubtitle: state.impactCue?.subtitle || "",
      impactFrames: (state.impactCue?.frames || []).map((frame) => `${frame.role}:${frame.label}:${frame.pose || "idle"}`),
      impactBitmapAsset: state.impactCue ? "court-impact-burst-sheet-v1.png" : "",
      impactBitmapFrame: state.impactCue ? impactBitmapFrameFor(state.impactCue) : 0,
      impactCalloutAsset: state.impactCue ? "court-impact-callout-sheet-v1.png" : "",
      impactCalloutFrame: state.impactCue ? impactCalloutFrameFor(state.impactCue) : 0,
      objectionReveal: Boolean(state.objectionReveal),
      objectionRevealTitle: state.objectionReveal?.title || "",
      objectionRevealRecord: state.objectionReveal?.record || "",
      objectionRevealLine: state.objectionReveal?.line || "",
      objectionRevealDeductionText: state.objectionReveal?.deductionText || "",
      objectionRevealDeductionTarget: state.objectionReveal?.deductionTarget || "",
      objectionRevealStep: state.objectionReveal ? Number(state.objectionReveal.step || 0) + 1 : 0,
      objectionRevealStepTitle: state.objectionReveal ? objectionRevealSteps(state.objectionReveal)[Number(state.objectionReveal.step || 0)]?.kicker || "" : "",
      objectionRevealSteps: state.objectionReveal ? objectionRevealSteps(state.objectionReveal).length : 0,
      objectionRevealSpriteAsset: state.objectionReveal ? "objection-cutin-sheet-v1.png" : "",
      objectionRevealSpriteFrame: state.objectionReveal ? Number(state.objectionReveal.step || 0) + 1 : 0,
      counterattacks: progress.counterattacks || 0,
      recoveries: progress.recoveries || 0,
      testimony: testimony?.title || "",
      statement: statement?.text || "",
      statementIndex: progress.statementIndex + 1,
      visibleStatements: visibleStatements.length,
      statementCards: visibleStatements.map(({ statement: item, rawIndex }, index) => {
        const key = statementKey(progress.testimonyIndex, rawIndex);
        const pressed = progress.pressed.includes(key);
        const solved = progress.solved.includes(key);
        const suspicious = statementHasAnswer(item);
        return {
          index: index + 1,
          active: index === progress.statementIndex,
          pressed,
          solved,
          hiddenReveal: Boolean(item.hiddenUntilPressed),
          suspicious,
          readyToPresent: statementReadyToPresent(item, progress, progress.testimonyIndex, rawIndex),
          text: item.text,
        };
      }),
      readyToPresent: currentEntry ? statementReadyToPresent(statement, progress, progress.testimonyIndex, currentEntry.rawIndex) : false,
      unlockedStatements: progress.unlockedStatements.length,
      pressedStatements: progress.pressed.length,
      message: state.message,
      completed: state.completed.length,
      recordTab: state.recordTab,
      recordOpen: Boolean(state.recordOpen),
    });
  }

  window.render_game_to_text = renderGameToText;
  window.advanceTime = function () {
    return renderGameToText();
  };

  homeButton.addEventListener("click", () => {
    playCue("click");
    state.homeView = "menu";
    renderHome();
  });
  app.addEventListener("click", handleClick);
  app.addEventListener("change", handleChange);
  app.addEventListener("pointerdown", handlePointerDown);
  app.addEventListener("pointerup", handlePointerUp);
  app.addEventListener("pointercancel", handlePointerCancel);
  statusStrip.addEventListener("click", handleClick);
  statusStrip.addEventListener("change", handleChange);
  document.addEventListener("keydown", handleKeydown);
  loadSave();
  renderHome();
})();
