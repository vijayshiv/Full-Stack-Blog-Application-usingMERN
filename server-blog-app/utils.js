function successResult(data) {
  return { status: "success", data };
}

function errorResult(error) {
  return { status: "error", error };
}

function resultMsg(error, data) {
  return error ? errorResult(error) : successResult(data);
}

module.exports = {
  successResult,
  errorResult,
  resultMsg,
};
