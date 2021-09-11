var admin = require("firebase-admin");

var serviceAccount = require("./accountKeys/dfIndia.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const getBadgeCodeId = async (badgeCode) => {
  const badgeRef = await db.collection('badges');
  const badgeSnapshot = await badgeRef.where('code', '==', badgeCode).get();
  const badgeIds = [];
  if (badgeSnapshot.empty) {
    return null;
  }

  badgeSnapshot.forEach((doc) => badgeIds.push(doc.id));

  return badgeIds;
};

const getUsersHavingBadgeId = async (badgeIds) => {
  const edataRef = await db.collection('edata');
  const userDocuments = await edataRef.listDocuments();
  
  if (userDocuments.empty) {
    return null;
  }

  const users = [];
  
  for (const userDocument of userDocuments) {
    const userDocumentSnapshot = await userDocument.get();
    const userBadgeSnapshots = await userDocument.collection('badges').where('codeId', '==', badgeIds[0]).get();
  
    if (!userBadgeSnapshots.empty) {
      users.push(userDocumentSnapshot.data());
    }
  }
  return users;
};

const getUsersHavingBadgeName = async (badgeCode) => {
  const badgeId = await getBadgeCodeId(badgeCode);
  if (!badgeId) return null;
  
  const users = await getUsersHavingBadgeId(badgeId);
  if (!users) return null;

  return users;
};

export default getUsersHavingBadgeName;
