import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, User } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  getDocs, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  increment, 
  query, 
  where,
  orderBy, 
  limit, 
  onSnapshot, 
  getDocFromServer, 
  Firestore 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { CommunityReport, UserProfile, ScamAnalysisResult, ReportComment, ChatSession, UserSettings, UserActivityLog } from '../types';

let app: FirebaseApp;
let auth: ReturnType<typeof getAuth>;
let db: Firestore;
let googleProvider: GoogleAuthProvider;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: 'select_account' });
} catch (error) {
  console.warn("Firebase initialization warning:", error);
}

export { auth, db, googleProvider };

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
    },
    operationType,
    path
  };
  console.warn('Firestore Operation Notice:', JSON.stringify(errInfo));
  return errInfo;
}

// Connection test helper
export async function testConnection() {
  if (db) {
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
    } catch (error) {
      if (error instanceof Error && error.message.includes('the client is offline')) {
        console.error("Please check your Firebase configuration.");
      }
    }
  }
}
testConnection();

// Fetch or create user profile in Firestore with RBAC roles
export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  if (!db || !uid) return null;
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        uid: data.uid || uid,
        displayName: data.displayName || 'Người dùng',
        email: data.email || '',
        photoURL: data.photoURL || undefined,
        role: (data.role as any) || 'user',
        status: (data.status as any) || 'active',
        createdAt: data.createdAt || new Date().toISOString(),
        lastLogin: data.lastLogin || new Date().toISOString()
      };
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `users/${uid}`);
  }
  return null;
}

// Save or sync user profile to Firestore according to strict RBAC rules:
// - New user: create with role = 'user', status = 'active', createdAt & lastLogin
// - Returning user: NEVER overwrite role or status; update lastLogin, displayName, photoURL, updatedAt
export async function saveUserProfile(user: UserProfile): Promise<UserProfile> {
  if (!db || !user.uid) return user;
  try {
    const userRef = doc(db, 'users', user.uid);
    const existing = await getDoc(userRef);
    const now = new Date().toISOString();

    if (existing.exists()) {
      const data = existing.data();
      // Maintain exact role & status from Firestore
      const preservedRole = data.role || 'user';
      const preservedStatus = data.status || 'active';
      const preservedCreatedAt = data.createdAt || now;

      const updatedProfile: UserProfile = {
        uid: data.uid || user.uid,
        displayName: user.displayName || data.displayName || 'Người dùng',
        email: user.email || data.email || '',
        photoURL: user.photoURL !== undefined ? user.photoURL : data.photoURL,
        role: preservedRole,
        status: preservedStatus,
        createdAt: preservedCreatedAt,
        lastLogin: now
      };

      // Update lastLogin, displayName, photoURL, updatedAt WITHOUT touching role or status
      await setDoc(userRef, {
        displayName: updatedProfile.displayName,
        photoURL: updatedProfile.photoURL || '',
        lastLogin: now,
        updatedAt: now
      }, { merge: true });

      return updatedProfile;
    } else {
      // First-time user registration: Default role MUST be 'user', status MUST be 'active'
      const newProfile: UserProfile = {
        uid: user.uid,
        displayName: user.displayName || 'Người dùng Google',
        email: user.email || '',
        photoURL: user.photoURL || '',
        role: 'user',
        status: 'active',
        createdAt: now,
        lastLogin: now
      };

      await setDoc(userRef, {
        uid: newProfile.uid,
        displayName: newProfile.displayName,
        email: newProfile.email,
        photoURL: newProfile.photoURL || '',
        role: 'user',
        status: 'active',
        createdAt: now,
        lastLogin: now,
        updatedAt: now
      });

      return newProfile;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
    return user;
  }
}

// Helper function to update user role in Firestore (Used exclusively by Admins in User Management)
export async function updateUserRoleInFirestore(uid: string, role: 'user' | 'moderator' | 'admin'): Promise<boolean> {
  if (!db || !uid) return false;
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      role,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
    return false;
  }
}

// Helper function for Google Sign-In
export async function signInWithGoogle(): Promise<UserProfile> {
  if (auth && googleProvider) {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const googleUser = result.user;
      
      const userProfile: UserProfile = {
        uid: googleUser.uid,
        displayName: googleUser.displayName || 'Người dùng Google',
        email: googleUser.email || '',
        photoURL: googleUser.photoURL || undefined
      };
      
      // Save or update profile without mutating role or status
      await saveUserProfile(userProfile);

      // Always read final UserProfile from Firestore to get authoritative role
      const fetched = await fetchUserProfile(googleUser.uid);
      if (fetched) {
        return fetched;
      }
      return { ...userProfile, role: 'user', status: 'active' };
    } catch (err: any) {
      console.warn("Firebase popup auth error or restricted:", err?.message);
      throw err;
    }
  }
  
  throw new Error("Firebase Auth is not initialized.");
}

export async function signOutUser() {
  if (auth) {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.warn("Signout error:", e);
    }
  }
}

// Firestore Community Reports Operations
export async function fetchFirestoreCommunityReports(): Promise<CommunityReport[]> {
  if (!db) return [];
  try {
    const q = query(collection(db, 'community_reports'), orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    const reports: CommunityReport[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      reports.push({
        id: docSnap.id,
        timestamp: data.timestamp || Date.now(),
        reporterName: data.reporterName || 'Người dùng ẩn danh',
        reporterAvatar: data.reporterAvatar,
        scamType: data.scamType || 'OTHER',
        scamTypeNameVi: data.scamTypeNameVi || 'Lừa đảo',
        title: data.title || '',
        description: data.description || '',
        targetPhone: data.targetPhone,
        targetBankAccount: data.targetBankAccount,
        targetBankName: data.targetBankName,
        targetUrl: data.targetUrl,
        targetSocialHandle: data.targetSocialHandle,
        locationName: data.locationName || 'Toàn Quốc',
        proofImages: data.proofImages || [],
        upvotes: data.upvotes || 0,
        commentsCount: data.commentsCount || 0,
        verifiedStatus: data.verifiedStatus || 'VERIFIED'
      });
    });
    return reports;
  } catch (err) {
    console.warn("Error fetching Firestore community reports:", err);
    return [];
  }
}

export function subscribeToCommunityReports(callback: (reports: CommunityReport[]) => void) {
  if (!db) return () => {};
  try {
    const q = query(collection(db, 'community_reports'), orderBy('timestamp', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const reports: CommunityReport[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        reports.push({
          id: docSnap.id,
          timestamp: data.timestamp || Date.now(),
          reporterName: data.reporterName || 'Người dùng ẩn danh',
          reporterAvatar: data.reporterAvatar,
          scamType: data.scamType || 'OTHER',
          scamTypeNameVi: data.scamTypeNameVi || 'Lừa đảo',
          title: data.title || '',
          description: data.description || '',
          targetPhone: data.targetPhone,
          targetBankAccount: data.targetBankAccount,
          targetBankName: data.targetBankName,
          targetUrl: data.targetUrl,
          targetSocialHandle: data.targetSocialHandle,
          locationName: data.locationName || 'Toàn Quốc',
          proofImages: data.proofImages || [],
          upvotes: data.upvotes || 0,
          commentsCount: data.commentsCount || 0,
          verifiedStatus: data.verifiedStatus || 'VERIFIED'
        });
      });
      if (reports.length > 0) {
        callback(reports);
      }
    }, (error) => {
      console.warn("Firestore snapshot listener error:", error);
    });
  } catch (err) {
    console.warn("Firestore subscription failed:", err);
    return () => {};
  }
}

export async function addFirestoreCommunityReport(report: Partial<CommunityReport>): Promise<string | null> {
  if (!db) return null;
  try {
    const currentUid = auth?.currentUser?.uid || 'anonymous';
    const docData = {
      reporterName: report.reporterName || 'Người dùng ẩn danh',
      reporterAvatar: report.reporterAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
      scamType: report.scamType || 'OTHER',
      scamTypeNameVi: report.scamTypeNameVi || 'Lừa đảo',
      title: report.title || '',
      description: report.description || '',
      targetPhone: report.targetPhone || null,
      targetBankAccount: report.targetBankAccount || null,
      targetBankName: report.targetBankName || null,
      targetUrl: report.targetUrl || null,
      targetSocialHandle: report.targetSocialHandle || null,
      locationName: report.locationName || 'Hà Nội',
      proofImages: report.proofImages || [],
      upvotes: report.upvotes || 1,
      commentsCount: 0,
      verifiedStatus: 'VERIFIED',
      timestamp: Date.now(),
      reportedDate: new Date().toISOString(),
      reporterUid: currentUid
    };
    const docRef = await addDoc(collection(db, 'community_reports'), docData);
    return docRef.id;
  } catch (err) {
    console.warn("Error adding community report to Firestore:", err);
    return null;
  }
}

export async function upvoteFirestoreReport(reportId: string) {
  if (!db || !reportId) return;
  try {
    const reportRef = doc(db, 'community_reports', reportId);
    await updateDoc(reportRef, {
      upvotes: increment(1)
    });
  } catch (err) {
    console.warn("Error upvoting report in Firestore:", err);
  }
}

export async function deleteFirestoreCommunityReport(reportId: string): Promise<boolean> {
  if (!db || !reportId) return false;
  try {
    const reportRef = doc(db, 'community_reports', reportId);
    await deleteDoc(reportRef);
    return true;
  } catch (err) {
    console.warn("Error deleting report from Firestore:", err);
    return false;
  }
}

export async function updateFirestoreReportStatus(
  reportId: string, 
  verifiedStatus: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'COMMUNITY_FLAGGED'
): Promise<boolean> {
  if (!db || !reportId) return false;
  try {
    const reportRef = doc(db, 'community_reports', reportId);
    await updateDoc(reportRef, {
      verifiedStatus
    });
    return true;
  } catch (err) {
    console.warn("Error updating report status in Firestore:", err);
    return false;
  }
}

// Firestore Comments Operations
export function subscribeToReportComments(reportId: string, callback: (comments: ReportComment[]) => void) {
  if (!db || !reportId) return () => {};
  try {
    const q = query(collection(db, 'community_reports', reportId, 'comments'), orderBy('timestamp', 'asc'));
    return onSnapshot(q, (snapshot) => {
      const comments: ReportComment[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        comments.push({
          id: docSnap.id,
          reportId,
          authorName: data.authorName || 'Người dùng',
          authorAvatar: data.authorAvatar,
          content: data.content || '',
          timestamp: data.timestamp || Date.now()
        });
      });
      callback(comments);
    }, (err) => {
      console.warn("Error subscribing to report comments:", err);
    });
  } catch (err) {
    console.warn("Failed subscribing to report comments:", err);
    return () => {};
  }
}

export async function addFirestoreReportComment(
  reportId: string, 
  authorName: string, 
  authorAvatar: string | undefined, 
  content: string
): Promise<string | null> {
  if (!db || !reportId || !content.trim()) return null;
  try {
    const commentData = {
      authorName: authorName || 'Người dùng ẩn danh',
      authorAvatar: authorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
      content: content.trim(),
      timestamp: Date.now()
    };
    const commentsCol = collection(db, 'community_reports', reportId, 'comments');
    const docRef = await addDoc(commentsCol, commentData);

    // Update parent report comments count
    const reportRef = doc(db, 'community_reports', reportId);
    await updateDoc(reportRef, {
      commentsCount: increment(1)
    });

    return docRef.id;
  } catch (err) {
    console.warn("Error adding report comment to Firestore:", err);
    return null;
  }
}

// Firestore Scan History Operations
export async function addFirestoreScanHistory(scanResult: ScamAnalysisResult): Promise<string | null> {
  if (!db) return null;
  try {
    const currentUid = auth?.currentUser?.uid || 'anonymous';
    const docData = {
      ...scanResult,
      uid: currentUid,
      createdAt: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, 'scan_history'), docData);
    return docRef.id;
  } catch (err) {
    console.warn("Error saving scan history to Firestore:", err);
    return null;
  }
}

export function subscribeToScanHistory(uidOrCallback: string | ((scans: ScamAnalysisResult[]) => void), callback?: (scans: ScamAnalysisResult[]) => void) {
  if (!db) return () => {};
  const userUid = typeof uidOrCallback === 'string' ? uidOrCallback : auth?.currentUser?.uid;
  const cb = typeof uidOrCallback === 'function' ? uidOrCallback : callback;
  if (!cb) return () => {};

  try {
    const q = userUid
      ? query(collection(db, 'scan_history'), where('uid', '==', userUid))
      : query(collection(db, 'scan_history'), limit(50));

    return onSnapshot(q, (snapshot) => {
      const scans: ScamAnalysisResult[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        scans.push({
          id: docSnap.id,
          timestamp: data.timestamp || Date.now(),
          inputType: data.inputType || 'text',
          inputText: data.inputText,
          imageName: data.imageName,
          imageUrl: data.imageUrl,
          riskScore: data.riskScore || 0,
          riskLevel: data.riskLevel || 'SAFE',
          scamType: data.scamType || 'OTHER',
          scamTypeNameVi: data.scamTypeNameVi || 'Không xác định',
          confidenceLevel: data.confidenceLevel || '95% (Cực kỳ tin cậy)',
          confidenceScore: data.confidenceScore || 95,
          summary: data.summary || '',
          explanation: data.explanation || '',
          redFlags: data.redFlags || [],
          recommendedActions: data.recommendedActions || [],
          emergencyHotlines: data.emergencyHotlines || [],
          timeline: data.timeline || [],
          similarCases: data.similarCases || [],
          type: data.type || (data.url ? 'website' : data.imageUrl ? 'image' : 'message'),
          title: data.title || data.scamTypeNameVi,
          aiModel: data.aiModel || 'Gemini 3.6 Flash',
          favorite: data.favorite || false,
          pinned: data.pinned || false,
          note: data.note || '',
          device: data.device || 'Chrome / macOS',
          location: data.location || 'TP. Hồ Chí Minh',
          processingTime: data.processingTime || '1.2s',
          status: data.status || 'ACTIVE',
          updatedAt: data.updatedAt || new Date().toISOString(),
          userId: data.userId || data.uid || 'anonymous',
          url: data.url,
          domain: data.domain,
          phone: data.phone,
          bankAccount: data.bankAccount
        });
      });
      scans.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      cb(scans);
    }, (err) => {
      console.warn("Firestore scan_history listener warning:", err);
    });
  } catch (err) {
    console.warn("Firestore scan_history subscription failed:", err);
    return () => {};
  }
}

export async function updateFirestoreScanItem(id: string, updates: Partial<ScamAnalysisResult>): Promise<boolean> {
  if (!db || !id) return false;
  try {
    const docRef = doc(db, 'scan_history', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (err) {
    console.warn("Error updating scan item in Firestore:", err);
    return false;
  }
}

export async function deleteFirestoreScanItem(id: string): Promise<boolean> {
  if (!db || !id) return false;
  try {
    const docRef = doc(db, 'scan_history', id);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.warn("Error deleting scan item from Firestore:", err);
    return false;
  }
}

// Firestore Chat Sessions Operations
export async function saveFirestoreChatSession(session: ChatSession, uid?: string): Promise<boolean> {
  if (!db) return false;
  try {
    const currentUid = uid || auth?.currentUser?.uid || 'guest';
    const docRef = doc(db, 'chat_sessions', session.id);
    await setDoc(docRef, {
      ...session,
      uid: currentUid,
      updatedAt: Date.now()
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn("Error saving chat session to Firestore:", err);
    return false;
  }
}

export function subscribeToChatSessions(uid: string, callback: (sessions: ChatSession[]) => void) {
  if (!db || !uid || uid === 'guest') {
    callback([]);
    return () => {};
  }
  try {
    const q = query(
      collection(db, 'chat_sessions'),
      where('uid', '==', uid)
    );
    return onSnapshot(q, (snapshot) => {
      const sessions: ChatSession[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        sessions.push({
          id: docSnap.id,
          title: data.title || 'Trò chuyện mới',
          createdAt: data.createdAt || Date.now(),
          updatedAt: data.updatedAt || Date.now(),
          messages: data.messages || []
        });
      });
      sessions.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      callback(sessions);
    }, (err) => {
      console.warn("Firestore chat_sessions listener warning:", err);
    });
  } catch (err) {
    console.warn("Firestore chat_sessions subscription failed:", err);
    return () => {};
  }
}

export async function deleteFirestoreChatSession(sessionId: string): Promise<boolean> {
  if (!db || !sessionId) return false;
  try {
    const docRef = doc(db, 'chat_sessions', sessionId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.warn("Error deleting chat session from Firestore:", err);
    return false;
  }
}

// Firestore User Settings Operations
export async function saveFirestoreUserSettings(uid: string, settings: Partial<UserSettings>): Promise<boolean> {
  if (!db || !uid) return false;
  try {
    const settingsRef = doc(db, 'user_settings', uid);
    await setDoc(settingsRef, {
      ...settings,
      uid,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn("Error saving user settings to Firestore:", err);
    return false;
  }
}

export function subscribeToUserSettings(uid: string, callback: (settings: UserSettings) => void) {
  if (!db || !uid) return () => {};
  try {
    const settingsRef = doc(db, 'user_settings', uid);
    return onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data() as UserSettings);
      }
    }, (err) => {
      console.warn("Firestore user_settings subscription error:", err);
    });
  } catch (err) {
    console.warn("Firestore user_settings subscribe failed:", err);
    return () => {};
  }
}

export async function fetchFirestoreUserSettings(uid: string): Promise<UserSettings | null> {
  if (!db || !uid) return null;
  try {
    const settingsRef = doc(db, 'user_settings', uid);
    const docSnap = await getDoc(settingsRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserSettings;
    }
    return null;
  } catch (err) {
    console.warn("Error fetching user settings from Firestore:", err);
    return null;
  }
}

// Firestore Activity Logs Operations
export async function addFirestoreUserActivityLog(uid: string, log: Omit<UserActivityLog, 'id'>): Promise<string | null> {
  if (!db || !uid) return null;
  try {
    const logsCol = collection(db, 'user_activity_logs', uid, 'logs');
    const docRef = await addDoc(logsCol, {
      ...log,
      timestamp: log.timestamp || Date.now()
    });
    return docRef.id;
  } catch (err) {
    console.warn("Error adding user activity log:", err);
    return null;
  }
}

export function subscribeToUserActivityLogs(uid: string, callback: (logs: UserActivityLog[]) => void) {
  if (!db || !uid) return () => {};
  try {
    const q = query(collection(db, 'user_activity_logs', uid, 'logs'), orderBy('timestamp', 'desc'), limit(30));
    return onSnapshot(q, (snapshot) => {
      const logs: UserActivityLog[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        logs.push({
          id: docSnap.id,
          timestamp: data.timestamp || Date.now(),
          action: data.action || '',
          details: data.details || '',
          category: data.category || 'INFO',
          status: data.status || 'SUCCESS',
          ipAddress: data.ipAddress || '118.70.124.5'
        });
      });
      callback(logs);
    }, (err) => {
      console.warn("User activity logs snapshot error:", err);
    });
  } catch (err) {
    console.warn("Failed subscribing to activity logs:", err);
    return () => {};
  }
}


