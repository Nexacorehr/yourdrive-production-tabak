export async function trackFileActivity(
  fileId: number,
  userId: string,
  activityType: string,
  metadata: object = {},
  pool: any,
) {
  await pool.query(
    `INSERT INTO file_activity (file_id, user_id, activity_type, metadata)
     VALUES ($1, $2, $3, $4)`,
    [fileId, userId, activityType, JSON.stringify(metadata)],
  );
}

export async function logDeviceAction(
  deviceId: string,
  userId: string,
  action: string,
  details: any,
  req: any,
  pool: any,
) {
  await pool.query(
    `INSERT INTO device_activity_audit (device_id, user_id, action, details, ip_address, user_agent)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      deviceId,
      userId,
      action,
      JSON.stringify(details),
      req.ip || req.headers["x-forwarded-for"],
      req.headers["user-agent"],
    ],
  );
}
