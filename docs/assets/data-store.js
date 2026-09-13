/**
 * Camada de dados do moodbeat.
 *
 * Hoje guarda os check-ins no localStorage do aparelho. A ideia é que,
 * quando existir um backend, só a implementação de cada função abaixo
 * mude (para chamadas fetch/API) - quem consome (telas) continua
 * chamando MoodbeatStore.addCheckIn / getTodayCheckIns / etc. sem
 * precisar saber onde o dado mora.
 */
(function () {
  var STORAGE_KEY = 'moodbeat_checkins';

  function readAll() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function writeAll(checkins) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(checkins));
    } catch (e) {
      // localStorage indisponível (modo privado, quota etc.) - falha silenciosa
    }
  }

  function uuid() {
    return 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  /**
   * @param {{emotions: {label: string, emoji: string}[], energyLevel: number|null, note: string}} data
   */
  function addCheckIn(data) {
    var record = {
      id: uuid(),
      timestamp: Date.now(),
      emotions: (data && data.emotions) || [],
      energyLevel: data && data.energyLevel != null ? data.energyLevel : null,
      note: (data && data.note) || ''
    };
    var all = readAll();
    all.push(record);
    writeAll(all);
    return record;
  }

  function getAllCheckIns() {
    return readAll().sort(function (a, b) { return b.timestamp - a.timestamp; });
  }

  function isSameDay(timestamp, date) {
    var d1 = new Date(timestamp);
    return (
      d1.getFullYear() === date.getFullYear() &&
      d1.getMonth() === date.getMonth() &&
      d1.getDate() === date.getDate()
    );
  }

  function getCheckInsForDate(date) {
    date = date || new Date();
    return getAllCheckIns().filter(function (c) { return isSameDay(c.timestamp, date); });
  }

  function getTodayCheckIns() {
    return getCheckInsForDate(new Date());
  }

  function getEmotionCounts(checkins) {
    var counts = {};
    checkins.forEach(function (c) {
      (c.emotions || []).forEach(function (e) {
        var key = e.label;
        counts[key] = counts[key] || { label: e.label, emoji: e.emoji, count: 0 };
        counts[key].count++;
      });
    });
    return counts;
  }

  function getTopEmotions(checkins, limit) {
    var counts = getEmotionCounts(checkins);
    return Object.keys(counts)
      .map(function (k) { return counts[k]; })
      .sort(function (a, b) { return b.count - a.count; })
      .slice(0, limit || 2);
  }

  window.MoodbeatStore = {
    addCheckIn: addCheckIn,
    getAllCheckIns: getAllCheckIns,
    getCheckInsForDate: getCheckInsForDate,
    getTodayCheckIns: getTodayCheckIns,
    getEmotionCounts: getEmotionCounts,
    getTopEmotions: getTopEmotions
  };
})();
