export type ClassSession = {
  time: string;
  subject: string;
};

export type ScheduleDay = {
  date: string;
  classes: ClassSession[];
};
