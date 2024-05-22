function successMessage(data) {
  return { status: "success", data };
}
function errorMessage(error) {
  return { status: "error", error };
}

function result(data, error) {
  return data ? successMessage(data) : errorMessage(error);
}
module.exports = { successMessage, errorMessage, result };
