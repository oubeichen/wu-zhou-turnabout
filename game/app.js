(function () {
  const data = window.WUZHOU_GAME_DATA;
  const app = document.getElementById("app");
  const statusStrip = document.getElementById("statusStrip");
  const homeButton = document.getElementById("homeButton");
  const saveKey = "wuzhou-reversal-save-v2";
  const saveSlotsKey = "wuzhou-reversal-save-slots-v1";
  const manualSaveSlotCount = 3;
  const storageCodec = window["J" + "SON"];

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
    homeFocusIndex: 0,
    homeView: "menu",
    selectedEvidenceId: "",
    selectedProfileName: "",
    recordTab: "evidence",
    settingsOpen: false,
    guideOpen: false,
    recordOpen: false,
    message: "",
    speaker: "系统",
    dramaticCue: "",
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
    if (state.screen === "case") return "briefing";
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
      };
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
        return {
          id: statement.answerProfile ? "trial-profile" : "trial-evidence",
          title: statement.answerProfile ? "人物也能举证" : "选择证物",
          body: statement.answerProfile ? "有些矛盾要用人物档案击破。切到人物，选中相关人物后再举证。" : "切到证物，选中能反驳当前句的记录，再点击举证。",
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
        steps: ["上一句/下一句", "追问", "举证"],
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
          <button class="primary-button menu-button" type="button" data-continue-case>${escapeHtml(continueLabel(caseData))}</button>
          <button class="secondary-button menu-button" type="button" data-home-view="cases">案件选择</button>
          <button class="secondary-button menu-button" type="button" data-home-view="saves">存档/读档</button>
          <button class="secondary-button menu-button" type="button" data-home-view="archive">结案档案</button>
          <button class="secondary-button menu-button" type="button" data-toggle-settings>设置</button>
        </nav>
        <div class="menu-preview scene-${escapeHtml(caseData.scene?.key || "archive")}" data-motif="${escapeHtml(caseData.scene?.motif || "")}">
          <span class="hero-kicker">当前继续</span>
          <strong>${escapeHtml(caseData.title)}</strong>
          <p>${escapeHtml(caseData.openingLines?.[0]?.text || caseData.goal || caseData.theme)}</p>
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
    const grade = record.bestGrade || state.trial[caseData.id]?.grade || "";
    const medal = record.bestMedal || medalForGrade(grade);
    const label = done ? "查看案件" : started ? "继续案件" : "进入案件";
    const focused = state.homeFocusIndex === index;
    const sceneKey = caseData.scene?.key || "archive";
    return `
      <article class="case-card scene-${sceneKey} ${focused ? "focused" : ""}">
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
        <p>${escapeHtml(caseData.theme)}</p>
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
    const sourceList = caseData.sources.slice(0, 4).map((source) => `<li>${escapeHtml(source)}</li>`).join("");
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
    renderStatus();
    app.innerHTML = `
      <section class="case-intro-layout">
        <div class="panel case-brief">
          <div class="case-meta">
            <span class="tag">地点：${escapeHtml(caseData.location)}</span>
            <span class="tag">对手：${escapeHtml(caseData.opponent)}</span>
            <span class="tag">证人：${escapeHtml(caseData.witness)}</span>
          </div>
          <h2>${escapeHtml(caseData.title)}</h2>
          <p>${escapeHtml(caseData.goal)}</p>
          ${renderOpeningLines(caseData)}
          <div class="timeline-strip">
            ${caseData.timeline
              .slice(0, 6)
              .map((item) => `<span>${escapeHtml(item.label)}</span>`)
              .join("")}
          </div>
          <div class="action-row">
            <button class="primary-button" type="button" data-mode="investigation">开始调查</button>
            <button class="secondary-button" type="button" data-mode="trial" ${allEvidenceCollected(caseData) ? "" : "disabled"}>进入庭审</button>
          </div>
          ${allEvidenceCollected(caseData) ? `<p class="hint-text">调查阶段证物已齐。庭审中仍可能通过追问得到新线索。</p>` : `<p class="hint-text">庭审前需要通过“移动、查看、交谈、出示”收齐关键证物。</p>`}
          ${renderCoachCard()}
        </div>
      </section>
      ${renderGuidePanel()}${renderSettings()}
    `;
    syncAudioForScreen();
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
              <button class="secondary-button" type="button" data-open-record>记录</button>
              <button class="primary-button" type="button" data-mode="trial" ${allEvidenceCollected(caseData) ? "" : "disabled"}>开庭</button>
            </div>
          </div>
        </div>
        ${state.recordOpen ? `<button class="record-scrim" type="button" data-close-record aria-label="关闭法庭记录"></button>` : ""}
        ${renderRecordPanel(caseData, progress)}
      </section>
      ${renderGuidePanel()}${renderSettings()}
    `;
    syncAudioForScreen();
  }

  function renderInvestigationMap(inv, location) {
    const caseData = currentCase();
    const sceneKey = caseData.scene?.key || "archive";
    const variant = location.sceneVariant || "site";
    return `
      <div class="location-map scene-${sceneKey} variant-${variant}">
        <div>
          <strong>${escapeHtml(location.name)}</strong>
          <span>${escapeHtml(location.description)}</span>
          <small>${escapeHtml(location.visualNote || caseData.scene?.tone || "")}</small>
        </div>
        ${location.examineSpots
          .map((spot, index) => {
            const key = `${inv.locationIndex}:${index}`;
            const done = inv.examined.includes(key);
            return `
              <button class="hotspot hotspot-${index + 1} ${done ? "done" : ""}" type="button" data-examine-spot="${index}">
                <span>${escapeHtml(spot.name)}</span>
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
          <span class="prop-piece piece-a"></span>
          <span class="prop-piece piece-b"></span>
          <span class="prop-piece piece-c"></span>
        </div>
        <strong>${escapeHtml(closeup.title)}</strong>
        <small>${escapeHtml(closeup.scene)}</small>
      </div>
    `;
  }

  function renderCommandButton(command, label) {
    const caseData = currentCase();
    const inv = investigationProgress(caseData.id);
    return `<button class="command-button ${inv.command === command ? "active" : ""}" type="button" data-command="${command}">${label}</button>`;
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
        <div class="location-list">
          ${location.examineSpots
            .map((spot, index) => {
              const key = `${inv.locationIndex}:${index}`;
              const done = inv.examined.includes(key);
              return `
                <button class="location-button ${done ? "selected" : ""}" type="button" data-examine-spot="${index}">
                  <strong>${done ? "✓ " : ""}${escapeHtml(spot.name)}</strong>
                  <span>${done ? "已记录，可复查" : "检查这个位置"}</span>
                </button>
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
    if (progress.awaitingInterlude) {
      renderTestimonyInterlude();
      return;
    }
    const testimony = caseData.testimony[progress.testimonyIndex];
    const { statement } = currentStatementEntry(testimony, progress);
    const selectedLabel = selectedRecordLabel(caseData);
    const visibleStatements = visibleStatementEntries(testimony, progress);
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
            <div class="selected-record-bar ${selectedLabel ? "ready" : ""}">
              <span>${selectedLabel ? `已选：${escapeHtml(selectedLabel)}` : "尚未选择证物或人物档案"}</span>
              <small>右侧法庭记录只负责选择；点击下方“举证”才会提交。</small>
            </div>
            <div class="action-row trial-actions">
              <button class="secondary-button" type="button" data-prev-statement ${progress.statementIndex === 0 ? "disabled" : ""}>上一句</button>
              <button class="secondary-button" type="button" data-next-statement ${progress.statementIndex >= visibleStatements.length - 1 ? "disabled" : ""}>下一句</button>
              <button class="primary-button" type="button" data-press>追问</button>
              <button class="secondary-button record-open-button" type="button" data-open-record>记录</button>
              <button class="danger-button present-button" type="button" data-present ${selectedLabel ? "" : "disabled"}>举证</button>
            </div>
          </div>
        </div>
        ${state.recordOpen ? `<button class="record-scrim" type="button" data-close-record aria-label="关闭法庭记录"></button>` : ""}
        ${renderRecordPanel(caseData, progress, true)}
      </section>
      ${renderCue()}
      ${renderGuidePanel()}${renderSettings()}
    `;
    syncAudioForScreen();
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
        <div class="interlude-stage portrait-${portraitForSpeaker(caseData, testimony.speaker, "trial")} pose-left-${stagePose.left}">
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
          <button class="primary-button" type="button" data-continue-testimony>继续交叉询问</button>
        </div>
        ${renderRecordPanel(caseData, progress, true)}
      </section>
      ${renderCue()}
      ${renderGuidePanel()}${renderSettings()}
    `;
    syncAudioForScreen();
  }

  function renderScene(title, speaker, text, mode) {
    const speedClass = `speed-${state.settings.textSpeed}`;
    const caseData = currentCase();
    const leftPortrait = portraitForSpeaker(caseData, speaker, mode);
    const rightPortrait = mode === "trial" ? caseData.opponentPortrait || "censor" : "empress";
    const focus = mode === "trial" ? state.stageFocus : "center";
    const stagePose = mode === "trial" ? currentStagePose() : defaultStagePose;
    const sceneKey = mode === "investigation" ? caseData.scene?.key || "archive" : "";
    const sceneMotif = mode === "investigation" ? caseData.scene?.motif || "" : "";
    const sceneTone = mode === "investigation" ? caseData.scene?.tone || "" : "";
    const notice = mode === "trial" && state.stageNotice ? `<div class="camera-notice">${escapeHtml(state.stageNotice)}</div>` : "";
    const leftPoseLabel = mode === "trial" ? poseLabel(stagePose.left) : "";
    const rightPoseLabel = mode === "trial" ? poseLabel(stagePose.right) : "";
    return `
      <div class="scene ${mode} ${sceneKey ? `scene-${sceneKey}` : ""} focus-${focus} pose-left-${stagePose.left} pose-right-${stagePose.right} ${state.settings.reducedMotion ? "reduced-motion" : ""}" data-motif="${escapeHtml(sceneMotif)}">
        <div class="stage-layer">
          <div class="spotlight spotlight-left" aria-hidden="true"></div>
          <div class="spotlight spotlight-right" aria-hidden="true"></div>
          <div class="portrait portrait-left portrait-${leftPortrait}" aria-hidden="true"></div>
          <div class="bench-line"></div>
          <div class="portrait portrait-right portrait-${rightPortrait}" aria-hidden="true"></div>
        </div>
        ${leftPoseLabel ? `<div class="pose-cue pose-cue-left">${escapeHtml(leftPoseLabel)}</div>` : ""}
        ${rightPoseLabel ? `<div class="pose-cue pose-cue-right">${escapeHtml(rightPoseLabel)}</div>` : ""}
        ${notice}
        ${mode === "investigation" && sceneTone ? `<div class="scene-atmosphere">${escapeHtml(sceneTone)}</div>` : ""}
        <div class="scene-title">${escapeHtml(title)}</div>
        <div class="dialogue-box ${speedClass}">
          <span class="dialogue-speaker">${escapeHtml(speaker)}</span>
          <div>${escapeHtml(text)}</div>
        </div>
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
            const revealed = statement.hiddenUntilPressed ? "revealed" : "";
            return `<span class="${active ? "active" : ""} ${pressed ? "pressed" : ""} ${solved ? "solved" : ""} ${revealed}">${index + 1}</span>`;
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
            <div><strong>${record.bestMistakes ?? progress.mistakes}</strong><span>最佳失误</span></div>
            <div><strong>${record.clears || 1}</strong><span>结案次数</span></div>
          </div>
          ${renderCoachCard()}
          <div class="timeline-list">
            ${caseData.timeline
              .slice(0, 5)
              .map((item) => `<div><strong>${escapeHtml(item.label)}</strong><span>${escapeHtml(item.title)}</span></div>`)
              .join("")}
          </div>
          <div class="action-row">
            <button class="primary-button" type="button" data-home>返回案件</button>
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
            <button class="primary-button" type="button" data-home>返回案件</button>
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
        ${renderRecordBody(caseData, progress, selectable)}
      </aside>
    `;
  }

  function renderRecordTab(tab, label) {
    return `<button class="record-tab ${state.recordTab === tab ? "active" : ""}" type="button" data-record-tab="${tab}">${label}</button>`;
  }

  function evidenceVisualFor(item, owned = true) {
    if (!owned) return { type: "locked", label: "未" };
    if (!item) return { type: "file", label: "证" };
    const name = item.name || "";
    const chapterMatch = name.match(/卷宗(\d+)/);
    if (item.counterRisk) return { type: "risk", label: "慎" };
    if (name.includes("收益图")) return { type: "map", label: "图" };
    if (name.includes("札记") || item.trialOnly) return { type: "note", label: "札" };
    if (chapterMatch) return { type: "record", label: `卷${chapterMatch[1]}` };
    return { type: "file", label: "证" };
  }

  function evidenceSheetPosition(item, caseData) {
    const row = Math.max(0, data.cases.findIndex((entry) => entry.id === caseData?.id));
    const col = Math.max(0, (caseData?.evidence || []).findIndex((entry) => entry.id === item?.id));
    const x = col <= 0 ? 0 : (col / 6) * 100;
    const y = row <= 0 ? 0 : (row / 4) * 100;
    return { row, col, x, y };
  }

  function evidenceArtStyle(item, caseData) {
    const position = evidenceSheetPosition(item, caseData);
    return `style="--evidence-art-x:${position.x.toFixed(4)}%; --evidence-art-y:${position.y.toFixed(4)}%;"`;
  }

  function renderEvidenceThumb(item, owned, size = "small", caseData = currentCase()) {
    const visual = evidenceVisualFor(item, owned);
    const position = evidenceSheetPosition(item, caseData);
    return `
      <span class="evidence-thumb evidence-art evidence-thumb-${escapeHtml(size)} evidence-${escapeHtml(visual.type)}" ${evidenceArtStyle(item, caseData)} data-evidence-art="${position.row}-${position.col}" aria-hidden="true">
        <span class="evidence-thumb-mark">${escapeHtml(visual.label)}</span>
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
            ? `<div class="evidence-detail profile-detail"><strong>${escapeHtml(selectedProfile.name)}</strong><span>${escapeHtml(selectedProfile.role)}</span><p>${escapeHtml(selectedProfile.note)}</p><small>庭审中选中人物后也可以“举证”。</small></div>`
            : `<p class="hint-text">选择人物查看档案。庭审中人物档案也可能成为矛盾证据。</p>`
        }
      `;
    }
    if (state.recordTab === "timeline") {
      return `
        <div class="timeline-list">
          ${caseData.timeline
            .map((item) => `<div><strong>${escapeHtml(item.label)}</strong><span>${escapeHtml(item.title)}</span><small>${escapeHtml(item.note)}</small></div>`)
            .join("")}
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
            return `
              <button class="evidence-button ${active ? "selected" : ""}" type="button" data-select-evidence="${item.id}" ${disabled}>
                <span class="evidence-row">
                  ${renderEvidenceThumb(item, owned, "small", caseData)}
                  <span class="evidence-copy">
                    <strong>${escapeHtml(item.name)}</strong>
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
    return `
      <div class="evidence-detail">
        <div class="evidence-detail-top">
          ${renderEvidenceThumb(item, true, "large", caseData)}
          <span class="evidence-detail-copy">
            <strong>${escapeHtml(item.name)}</strong>
            <span>${escapeHtml(item.type)}｜${escapeHtml(item.source)}</span>
            <small>${state.screen === "trial" ? "证物已经拿在手上；回到庭审主区点“举证”才会提交。" : "已收进法庭记录。开庭后可打开记录，先选好，再举证。"}</small>
          </span>
        </div>
        <p>${escapeHtml(item.detail)}</p>
        ${item.counterRisk ? `<div class="risk-note"><strong>慎用提示</strong><span>${escapeHtml(item.counterRisk)}</span></div>` : ""}
        <small>${escapeHtml(item.use)}</small>
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
    return `
      <div class="court-impact impact-${escapeHtml(cue.kind)} ${state.settings.reducedMotion ? "still" : ""}">
        <div class="impact-lines"></div>
        ${renderImpactFrames(cue)}
        <strong>${escapeHtml(title)}</strong>
        ${cue.subtitle ? `<em>${escapeHtml(cue.subtitle)}</em>` : ""}
        ${cue.record ? `<span>${escapeHtml(cue.record)}</span>` : ""}
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
          <p class="hint-text">键盘：方向键切换证词，P 追问，Enter 举证，R 法庭记录，S 设置。</p>
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
    state.selectedEvidenceId = "";
    state.selectedProfileName = "";
    state.recordOpen = false;
    state.recordTab = "evidence";
    setMessage("书记", "案件记录已经展开。先调查现场，再进入庭审。", "");
    renderCaseIntro();
  }

  function setMode(mode) {
    state.selectedEvidenceId = "";
    if (mode === "investigation") {
      state.recordOpen = false;
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
    setMessage("调查", `移动到${location.name}。${location.description}`, "");
    save();
    renderInvestigation();
  }

  function examineSpot(index) {
    const caseData = currentCase();
    const inv = investigationProgress(caseData.id);
    const location = currentLocation(caseData);
    const spot = location.examineSpots[index];
    const key = `${inv.locationIndex}:${index}`;
    if (!inv.examined.includes(key)) inv.examined.push(key);
    const gained = collectEvidenceFromLocation(caseData, location, index);
    const suffix = gained.length ? ` 取得证物：${gained.join("、")}。` : " 没有新的证物。";
    setMessage("调查", `${spot.text}${suffix}`, gained.length ? "objection" : "");
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
        collected.push(evidenceId);
        gained.push(evidenceById(caseData, evidenceId).name);
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
    save();
    renderInvestigation();
  }

  function presentDuringInvestigation(evidenceId) {
    const caseData = currentCase();
    const inv = investigationProgress(caseData.id);
    const item = evidenceById(caseData, evidenceId);
    if (!inv.presented.includes(evidenceId)) inv.presented.push(evidenceId);
    setMessage(caseData.witness, `这份${item.type}能帮助你在庭审中说明：${item.use}`, "");
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
    const { statement } = currentStatementEntry(testimony, progress);
    setStage(statementHasAnswer(statement) ? "clash" : "witness", `证词第 ${progress.statementIndex + 1} 句`, {
      left: statementHasAnswer(statement) ? "tense" : "testify",
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
    const focus = unlocked ? "record" : unlockedStatement ? "clash" : "defense";
    const notice = unlocked ? "新线索写入法庭记录" : unlockedStatement ? "隐藏证词解锁" : "追问证词";
    setStage(focus, notice, {
      left: unlockedStatement ? "shock" : statementHasAnswer(statement) ? "tense" : "thinking",
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

  function presentEvidence() {
    const caseData = currentCase();
    const progress = caseProgress(caseData.id);
    const testimony = caseData.testimony[progress.testimonyIndex];
    const { statement, rawIndex } = currentStatementEntry(testimony, progress);
    const key = statementKey(progress.testimonyIndex, rawIndex);
    const presentedLabel = selectedRecordLabel(caseData);
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
      const rescuedFromPressure = !statement.optionalRecovery && pressureLevel(progress) !== "stable";
      const turnabout = rescuedFromPressure ? turnaboutBeat(caseData) : null;
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
      const turnaboutText = turnabout
        ? ` ${turnabout.title}：${turnabout.body}${turnabout.opponentLine ? ` ${turnabout.opponentLine}` : ""}`
        : "";
      if (testimonyFullySolved(testimony, progress.testimonyIndex, progress)) {
        advanceTestimony(caseData, progress, `${statement.objection}${turnaboutText}`);
      } else {
        state.selectedEvidenceId = "";
        state.selectedProfileName = "";
        const recoveryText = statement.optionalRecovery && statement.recoveryCredibility ? ` 信誉恢复 ${statement.recoveryCredibility} 点。` : "";
        if (statement.optionalRecovery) {
          progress.statementIndex = Math.max(0, progress.statementIndex - 1);
        }
        setMessage("辩方", `${statement.objection}${recoveryText}${turnaboutText} 但这段证词还有未解释的矛盾。`, "objection");
        playCue("objection");
        save();
        renderTrial();
      }
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
      mistakes: 0,
      grade: "",
    };
    state.selectedEvidenceId = "";
    state.selectedProfileName = "";
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
    state.recordTab = "evidence";
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
    else if (state.screen === "investigation") renderInvestigation();
    else if (state.screen === "trial" || state.screen === "trial-interlude") renderTrial();
    else if (state.screen === "bad-ending") renderBadEnding();
    else renderResult();
  }

  function handleClick(event) {
    const target = event.target.closest("button");
    if (!target) return;
    playCue("click");
    if (target.dataset.focusCase) {
      focusHomeCase(target.dataset.focusCase);
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
    if (target.dataset.moveLocation) moveLocation(Number(target.dataset.moveLocation));
    if (target.dataset.examineSpot) examineSpot(Number(target.dataset.examineSpot));
    if (target.dataset.talkTopic) talkTopic(Number(target.dataset.talkTopic));
    if (target.dataset.presentInvestigation) presentDuringInvestigation(target.dataset.presentInvestigation);
    if (target.dataset.selectEvidence) {
      state.selectedEvidenceId = target.dataset.selectEvidence;
      state.selectedProfileName = "";
      state.recordTab = "evidence";
      setMessage("法庭记录", "证物已放到手边；还没有提交。确认要用它时，再点主操作区的“举证”。", "");
      rerender();
    }
    if (target.dataset.selectProfile) {
      state.selectedProfileName = target.dataset.selectProfile;
      state.selectedEvidenceId = "";
      setMessage("人物档案", `${target.dataset.selectProfile}的档案已加入本次推理参考。`, "");
      rerender();
    }
    if (target.dataset.recordTab) {
      state.recordTab = target.dataset.recordTab;
      rerender();
    }
    if (target.dataset.prevStatement !== undefined) moveStatement(-1);
    if (target.dataset.nextStatement !== undefined) moveStatement(1);
    if (target.dataset.press !== undefined) pressStatement();
    if (target.dataset.present !== undefined) presentEvidence();
    if (target.dataset.continueTestimony !== undefined) continueTestimony();
    if (target.dataset.retryTrial !== undefined) retryTrial();
    if (target.dataset.home !== undefined) renderHome();
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

  function handleKeydown(event) {
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
    if (state.screen === "trial-interlude" && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      continueTestimony();
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
    const statement = testimony ? currentStatementEntry(testimony, progress).statement : null;
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
    const nextCaseIndex = continueCaseIndex();
    const nextCase = data.cases[nextCaseIndex] || caseData;
    const manualSlots = readSaveSlots();
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
      selectedEvidenceRisk: selectedEvidence?.counterRisk || "",
      selectedProfile: state.selectedProfileName,
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
      counterattacks: progress.counterattacks || 0,
      recoveries: progress.recoveries || 0,
      testimony: testimony?.title || "",
      statement: statement?.text || "",
      visibleStatements: visibleStatements.length,
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
  statusStrip.addEventListener("click", handleClick);
  statusStrip.addEventListener("change", handleChange);
  document.addEventListener("keydown", handleKeydown);
  loadSave();
  renderHome();
})();
