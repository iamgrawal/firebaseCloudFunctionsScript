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

getUsersHavingBadgeName('USERSIGNUP').then((users) => {
  console.log(users);
});


module.exports = getUsersHavingBadgeName;
