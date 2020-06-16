import mongoose from 'mongoose';

const firebaseTokenSchema = new mongoose.Schema({
  /*
  * tokens = [{'type': 'browser', 'ua': 'Mozilla', 'token': 'qwew'},
  *  {'type': 'mobile', 'ua': 'android', 'token': 'qweqw'}]
  *
  */
  tokens: [mongoose.Schema.Types.Mixed],
  user: mongoose.Schema.Types.Mixed,
  dname: String,
  tenant: String,

}, {
  toJSON: {
    virtuals: true,
  },
});

firebaseTokenSchema.statics.findOrCreate = async (conditions, optAttr) => {
  const document = await FirebaseTokens.findOne(conditions);

  return document || await new FirebaseTokens({ ...conditions, ...optAttr }).save();
};

/*
 * Deletes token if exists. If the tokens array will be empty
 * after deleting given token the entire document will be destroyed.
 */
firebaseTokenSchema.statics.deleteToken = async (token, optAttr) => {
  const document = await FirebaseTokens.findOne({
    tokens: {
      $elemMatch: {
        token,
      },
    },
  });
  if (document) {
    // delete all entry if no token available else delete given token
    document.tokens = document.tokens.filter((tokens) => tokens.token !== token);
    if (document.tokens.length === 0) await document.delete();
    else await document.save();
  }
};

const FirebaseTokens = mongoose.model('FirebaseTokens', firebaseTokenSchema);

export default FirebaseTokens;
