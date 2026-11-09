export type UserRole = "EMPLOYEE" | "SUPERVISOR" | "HR_ADMIN";
export type AttendanceStatus = "ONTIME" | "LATE" | "ABSENT" | "LEAVE";
export type TaskStatus = "IN_PROGRESS" | "COMPLETED" | "BLOCKED";
export type LeaveType = "SICK" | "ANNUAL_LEAVE" | "PERMIT";
export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface Office {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  work_start_time: string; // '08:00:00'
  work_end_time: string; // '17:00:00'
  timezone: string; // 'Asia/Jakarta'
}

export interface Profile {
  id: string;
  employee_id: string;
  full_name: string;
  role: UserRole;
  department: string | null;
  office_id: string | null;
  is_active: boolean;
}

export interface Attendance {
  id: string;
  user_id: string;
  date: string; // 'YYYY-MM-DD'
  clock_in: string; // timestamptz
  clock_out: string | null; // timestamptz
  lat_in: number;
  long_in: number;
  lat_out: number | null;
  long_out: number | null;
  is_out_of_area: boolean;
  status: AttendanceStatus;
  notes: string | null;
}

export interface DailyTask {
  id: string;
  attendance_id: string;
  user_id: string;
  task_description: string;
  status: TaskStatus;
}

export interface LeaveRequest {
  id: string;
  user_id: string;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  reason: string;
  status: LeaveStatus;
  approved_by: string | null;
}

