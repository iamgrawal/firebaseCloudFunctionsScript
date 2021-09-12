var admin = require("firebase-admin");

var serviceAccount = require("./accountKeys/dfIndia.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const NETWORKING_TYPES = [
  'Networking with Android Experts',
  'Networking with Web Experts',
  'Networking with Google Cloud Experts',
  'Networking with community organisers',
  'Networking with Flutter Experts',
  'Networking with Talent Acquisition team /HRs',
];

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

const getUsersHavingBadgeId = async (badgeId) => {
  const users = [];
  
  const queryData = await db.collectionGroup('badges').where('codeId', '==', badgeId).get();
  for (const badgeSnapshot of queryData.docs) {
    const userDataSnapshot = await badgeSnapshot.ref.parent.parent.get();
  
    if (!userDataSnapshot.empty) {
      users.push(userDataSnapshot.data());
    }
  }
  return users;
};

const getUsersHavingBadgeName = async (badgeCode) => {
  const badgeIds = await getBadgeCodeId(badgeCode);
  if (!badgeId) return null;

  const [badgeId] = badgeIds;
  
  const users = await getUsersHavingBadgeId(badgeId);
  if (!users) return null;

  return users;
};

const getUsersHavingNetworkingType = async (networkingType) => {
  const users = [];

  const queryData = await db.collection('edata').where('networkingType', 'array-contains', networkingType).get();
  if (!queryData.empty) {
    queryData.forEach((usersSnapshot) => {
      users.push(usersSnapshot.data());
    });
  }
  return users;
};


const getUsersCountForEachNetworkingTypes = async () => {
  const result = [];
  for (const networkingType of NETWORKING_TYPES) {
    const { length } = await getUsersHavingNetworkingType(networkingType);
    result.push([networkingType, length]);
  }
  return result;
};

const getUsersCountForEachBadges = async () => {
  const result = [];
  const badgesData = [];
  const badgesRefs = await db.collection('badges').listDocuments();
  for (const badgeDoc of badgesRefs) {
    const badgeSnap = await (await badgeDoc.get());
    badgesData.push({ badgeId: badgeDoc.id, ...badgeSnap.data() });
  }
  for (const { badgeId, code, name, image } of badgesData) {
    const usersData = await getUsersHavingBadgeId(badgeId);
    result.push({
      badgeId,
      code,
      name,
      image,
      count: usersData.length,
    });
  }
  return result;
};

// getUsersCountForEachNetworkingTypes().then((users) => console.log(users));
// getUsersCountForEachBadges().then((users) => console.log(users));
// getUsersHavingNetworkingType('Network with Google Cloud Experts').then((users) => console.log(users));
// getUsersHavingBadgeId('CblOFXpLu9Oez1xygQJA').then((users) => console.log(users));


module.exports = getUsersHavingBadgeName;
