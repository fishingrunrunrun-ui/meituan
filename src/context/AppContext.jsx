import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AppContext = createContext(null);

// --- localStorage helpers ---
function load(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
function save(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

function uid() { return crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2); }

const PET_BASE_STATS = {
  '炎龙': { hp: 80, atk: 18, def: 6, mag: 14 },
  '蘑菇': { hp: 120, atk: 8, def: 14, mag: 6 },
  '魔像': { hp: 100, atk: 12, def: 12, mag: 10 },
};

function createPet(ownerId, species, name) {
  const base = PET_BASE_STATS[species];
  return {
    id: uid(), ownerId, species, name, level: 1, exp: 0,
    hp: base.hp, maxHp: base.hp,
    atk: base.atk, def: base.def, mag: base.mag,
    isEquipped: true, isRunaway: false,
    lastCheckinDate: new Date().toISOString().split('T')[0],
    capturedAt: new Date().toISOString(),
  };
}

function levelUpExp(level) { return level * 100; }

export function AppProvider({ children }) {
  // --- State ---
  const [user, setUser] = useState(() => load('fb_user', null));
  const [pets, setPets] = useState(() => load('fb_pets', []));
  const [records, setRecords] = useState(() => load('fb_records', []));
  const [plan, setPlan] = useState(() => load('fb_plan', null));
  const [posts, setPosts] = useState(() => load('fb_posts', []));
  const [friends, setFriends] = useState(() => load('fb_friends', []));
  const [messages, setMessages] = useState(() => load('fb_messages', []));
  const [allUsers, setAllUsers] = useState(() => load('fb_all_users', []));
  const [allPets, setAllPets] = useState(() => load('fb_all_pets', []));
  const [activeTab, setActiveTab] = useState(0);

  // --- Persist ---
  useEffect(() => { save('fb_user', user); }, [user]);
  useEffect(() => { save('fb_pets', pets); }, [pets]);
  useEffect(() => { save('fb_records', records); }, [records]);
  useEffect(() => { save('fb_plan', plan); }, [plan]);
  useEffect(() => { save('fb_posts', posts); }, [posts]);
  useEffect(() => { save('fb_friends', friends); }, [friends]);
  useEffect(() => { save('fb_messages', messages); }, [messages]);
  useEffect(() => { save('fb_all_users', allUsers); }, [allUsers]);
  useEffect(() => { save('fb_all_pets', allPets); }, [allPets]);

  // Daily reset
  useEffect(() => {
    const today = new Date().toDateString();
    if (user && user._lastReset !== today) {
      setUser(prev => ({ ...prev, dailyBattleCount: 0, dailyExploreCount: 0, _lastReset: today }));
    }
  }, []);

  // --- Derived ---
  const equippedPet = pets.find(p => p.isEquipped) || null;
  const myPets = pets.filter(p => !p.isRunaway);
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecords = records.filter(r => r.userId === user?.id && r.startTime?.startsWith(todayStr));
  const todayChecked = plan ? todayRecords.some(r => plan.categories?.includes(r.type) && (r.value || 0) >= (plan.dailyTarget || 0)) : false;
  const materials = user?.materials ?? 0;
  const consecutiveDays = user?.consecutiveDays ?? 0;

  // --- Actions ---
  const updateUser = useCallback((patch) => setUser(prev => prev ? { ...prev, ...patch } : prev), []);

  const addPet = useCallback((pet) => {
    setPets(prev => [...prev, pet]);
    setAllPets(prev => [...prev, pet]);
  }, []);

  const updatePet = useCallback((petId, patch) => {
    setPets(prev => prev.map(p => p.id === petId ? { ...p, ...patch } : p));
    setAllPets(prev => prev.map(p => p.id === petId ? { ...p, ...patch } : p));
  }, []);

  const equipPet = useCallback((petId) => {
    setPets(prev => prev.map(p => ({ ...p, isEquipped: p.id === petId })));
    setAllPets(prev => prev.map(p => ({ ...p, isEquipped: p.id === petId && p.ownerId === user?.id })));
  }, [user]);

  const addRecord = useCallback((record) => {
    const r = { ...record, id: uid(), userId: user?.id };
    setRecords(prev => [...prev, r]);
    // Check plan match
    if (plan && plan.categories?.includes(record.type) && (record.value || 0) >= (plan.dailyTarget || 0)) {
      const multiplier = { '0': 1.0, '1-2': 1.1, '3-4': 1.2, '5-7': 1.4 }[user?.activityLevel] || 1.0;
      const bonus = Math.floor(30 * multiplier);
      updateUser({
        materials: (user?.materials || 0) + bonus,
        consecutiveDays: (user?.consecutiveDays || 0) + 1,
        totalExerciseDays: (user?.totalExerciseDays || 0) + 1,
      });
      // Update pet lastCheckin
      setPets(prev => prev.map(p => ({ ...p, lastCheckinDate: todayStr })));
      return { checked: true, bonus };
    }
    return { checked: false, bonus: 0 };
  }, [plan, user, updateUser, todayStr]);

  const spendMaterials = useCallback((amount) => {
    if ((user?.materials || 0) < amount) return false;
    updateUser({ materials: (user?.materials || 0) - amount });
    return true;
  }, [user, updateUser]);

  const addPost = useCallback((post) => {
    const p = { ...post, id: uid(), userId: user?.id, likes: [], comments: [], interactionScore: 0, createdAt: new Date().toISOString() };
    setPosts(prev => [p, ...prev]);
  }, [user]);

  const toggleLike = useCallback((postId) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const liked = p.likes.includes(user?.id);
      return {
        ...p,
        likes: liked ? p.likes.filter(id => id !== user?.id) : [...p.likes, user?.id],
        interactionScore: (p.interactionScore || 0) + (liked ? -0.5 : 0.5),
      };
    }));
  }, [user]);

  const addComment = useCallback((postId, text) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      return {
        ...p,
        comments: [...p.comments, { userId: user?.id, text, createdAt: new Date().toISOString() }],
        interactionScore: (p.interactionScore || 0) + 1,
      };
    }));
  }, [user]);

  const sendFriendRequest = useCallback((toUserId) => {
    const existing = friends.find(f =>
      (f.fromUserId === user?.id && f.toUserId === toUserId) ||
      (f.toUserId === user?.id && f.fromUserId === toUserId)
    );
    if (existing) return false;
    const req = { id: uid(), fromUserId: user?.id, toUserId, status: 'pending', createdAt: new Date().toISOString() };
    setFriends(prev => [...prev, req]);
    return true;
  }, [user, friends]);

  const respondFriendRequest = useCallback((reqId, accept) => {
    setFriends(prev => prev.map(f => f.id === reqId ? { ...f, status: accept ? 'accepted' : 'rejected' } : f));
  }, []);

  const sendMessage = useCallback((toUserId, text) => {
    const msg = { id: uid(), fromUserId: user?.id, toUserId, text, createdAt: new Date().toISOString() };
    setMessages(prev => [...prev, msg]);
  }, [user]);

  const getFriendIds = useCallback(() => {
    return friends
      .filter(f => f.status === 'accepted' && (f.fromUserId === user?.id || f.toUserId === user?.id))
      .map(f => f.fromUserId === user?.id ? f.toUserId : f.fromUserId);
  }, [friends, user]);

  // Pet EXP & leveling
  const addPetExp = useCallback((petId, amount) => {
    setPets(prev => prev.map(p => {
      if (p.id !== petId) return p;
      let { exp, level, maxHp, hp, atk, def, mag } = p;
      exp += amount;
      const base = PET_BASE_STATS[p.species];
      while (exp >= levelUpExp(level)) {
        exp -= levelUpExp(level);
        level += 1;
        maxHp = Math.floor(base.hp + base.hp * 0.1 * (level - 1));
        atk = Math.floor(base.atk + base.atk * 0.1 * (level - 1));
        def = Math.floor(base.def + base.def * 0.1 * (level - 1));
        mag = Math.floor(base.mag + base.mag * 0.1 * (level - 1));
        hp = maxHp; // full heal on level up
      }
      return { ...p, exp, level, maxHp, hp, atk, def, mag };
    }));
    setAllPets(prev => prev.map(p => {
      if (p.id !== petId) return p;
      let { exp, level, maxHp, hp, atk, def, mag } = p;
      exp += amount;
      const base = PET_BASE_STATS[p.species];
      while (exp >= levelUpExp(level)) {
        exp -= levelUpExp(level);
        level += 1;
        maxHp = Math.floor(base.hp + base.hp * 0.1 * (level - 1));
        atk = Math.floor(base.atk + base.atk * 0.1 * (level - 1));
        def = Math.floor(base.def + base.def * 0.1 * (level - 1));
        mag = Math.floor(base.mag + base.mag * 0.1 * (level - 1));
        hp = maxHp;
      }
      return { ...p, exp, level, maxHp, hp, atk, def, mag };
    }));
  }, []);

  // Initialize user from onboarding data
  const initUser = useCallback((onboardingData) => {
    const newUser = {
      id: uid(),
      school: onboardingData.school,
      studentId: onboardingData.studentId,
      nickname: onboardingData.nickname,
      avatar: null,
      activityLevel: onboardingData.activityLevel,
      gender: onboardingData.gender,
      age: parseInt(onboardingData.age) || 0,
      heightCm: parseFloat(onboardingData.heightCm) || 0,
      weightKg: parseFloat(onboardingData.weightKg) || 0,
      bmi: onboardingData.bmi || 0,
      materials: 20,
      dailyBattleCount: 0,
      dailyExploreCount: 0,
      consecutiveDays: 0,
      totalExerciseDays: 0,
      monstersDefeated: 0,
      bossesDefeated: 0,
      pkWins: 0,
      totalExplores: 0,
      runawaysCaptured: 0,
      _lastReset: new Date().toDateString(),
      createdAt: new Date().toISOString(),
    };
    setUser(newUser);

    // Create plan
    const newPlan = {
      id: uid(), userId: newUser.id,
      categories: [onboardingData.sportTypes],
      dailyTarget: parseFloat(onboardingData.dailyTarget) || 0,
      targetUnit: onboardingData.targetUnit || 'km',
      frequency: onboardingData.frequency,
    };
    setPlan(newPlan);

    // Create pet
    const pet = createPet(newUser.id, onboardingData.petSpecies, onboardingData.petName);
    setPets([pet]);
    setAllPets(prev => [...prev, pet]);

    // Register in allUsers
    setAllUsers(prev => [...prev, newUser]);

    return newUser;
  }, []);

  // Achievement check
  const getAchievements = useCallback(() => {
    const achs = [];
    const u = user || {};
    // Consecutive check-in
    if (consecutiveDays >= 3) achs.push({ id: 'checkin_3' });
    if (consecutiveDays >= 7) achs.push({ id: 'checkin_7' });
    if (consecutiveDays >= 30) achs.push({ id: 'checkin_30' });
    if (consecutiveDays >= 100) achs.push({ id: 'checkin_100' });
    // Pet collection
    if (myPets.length >= 2) achs.push({ id: 'pet_2' });
    if (myPets.length >= 5) achs.push({ id: 'pet_5' });
    if (myPets.length >= 10) achs.push({ id: 'pet_10' });
    // Friends
    const friendCount = getFriendIds().length;
    if (friendCount >= 1) achs.push({ id: 'friend_1' });
    if (friendCount >= 10) achs.push({ id: 'friend_10' });
    // Posts
    const myPosts = posts.filter(p => p.userId === user?.id);
    if (myPosts.length >= 5) achs.push({ id: 'post_5' });
    const totalLikes = myPosts.reduce((sum, p) => sum + p.likes.length, 0);
    if (totalLikes >= 100) achs.push({ id: 'likes_100' });
    if (totalLikes >= 500) achs.push({ id: 'likes_500' });
    // Battle
    if ((u.monstersDefeated || 0) >= 1) achs.push({ id: 'battle_1' });
    if ((u.monstersDefeated || 0) >= 20) achs.push({ id: 'battle_20' });
    if ((u.monstersDefeated || 0) >= 50) achs.push({ id: 'battle_50' });
    if ((u.bossesDefeated || 0) >= 10) achs.push({ id: 'boss_10' });
    if ((u.pkWins || 0) >= 10) achs.push({ id: 'pk_10' });
    if ((u.pkWins || 0) >= 50) achs.push({ id: 'pk_50' });
    // Explore
    if ((u.totalExplores || 0) >= 10) achs.push({ id: 'explore_10' });
    if ((u.totalExplores || 0) >= 50) achs.push({ id: 'explore_50' });
    if ((u.runawaysCaptured || 0) >= 3) achs.push({ id: 'runaway_3' });
    if ((u.runawaysCaptured || 0) >= 10) achs.push({ id: 'runaway_10' });
    return achs;
  }, [consecutiveDays, myPets.length, getFriendIds, posts, user]);

  const value = {
    user, pets, records, plan, posts, friends, messages, allUsers, allPets, activeTab,
    setActiveTab,
    equippedPet, myPets, todayChecked, materials, consecutiveDays, todayStr,
    updateUser, addPet, updatePet, equipPet, addRecord, spendMaterials,
    addPost, toggleLike, addComment,
    sendFriendRequest, respondFriendRequest, sendMessage, getFriendIds,
    addPetExp,
    initUser, getAchievements,
    PET_BASE_STATS, createPet, uid,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
