const createUserPayload = (user) => {
  return { userId: user._id };
};

module.exports = createUserPayload;
