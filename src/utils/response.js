// 공통 응답 포맷 유틸
export function sendSuccess(
  res,
  { message = "success", data = null, statusCode = 200 } = {}
) {
  return res.status(statusCode).json({
    result: "success",
    message,
    data,
  });
}

export function sendFail(
  res,
  { message = "fail", data = null, statusCode = 400 } = {}
) {
  return res.status(statusCode).json({
    result: "fail",
    message,
    data,
  });
}
