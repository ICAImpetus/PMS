export const normalizeUserType = (type) => {
  if (type == null) return "";
  const raw = String(type).trim();
  const lower = raw.toLowerCase();

  if (lower === "superadmin") return "superadmin";
  if (lower === "admin") return "admin";
  if (lower === "supermanager") return "supermanager";
  if (lower === "teamleader") return "teamLeader";
  if (lower === "executive") return "executive";

  return raw;
};

