function ownWrapper(model) {
  return async function own(req, res, next) {
    console.log(req.user);
    console.log(req.params.id);
    console.log(model);
    next();
  };
}

module.exports = ownWrapper;
