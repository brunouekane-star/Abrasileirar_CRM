export type ClientType = "b2b" | "b2c";

export type LeadStage =
  | "lead"
  | "first_contact"
  | "proposal_sent"
  | "negotiation"
  | "won"
  | "lost";

export interface Lead {
  id: number;
  type: ClientType;
  stage: LeadStage;
  contact_name: string;
  company_name: string | null;
  email: string | null;
  phone: string | null;
  nationality: string | null;
  native_language: string | null;
  estimated_value: number | null;
  service_id: number | null;
  notes: string | null;
  lost_reason: string | null;
  converted_at: string | null;
  created_at: string;
}

export interface Service {
  id: number;
  code: string;
  name: string;
}

export type ProficiencyLevel = "a1" | "a2" | "b1" | "b2" | "c1" | "c2";

export type ContractStatus =
  | "active"
  | "completed"
  | "expired"
  | "cancelled";

export interface Company {
  id: number;
  name: string;
  industry: string | null;
  country: string | null;
}

export interface Student {
  id: number;
  full_name: string;
  email: string | null;
  phone: string | null;
  nationality: string | null;
  native_language: string | null;
  company_id: number | null;
  proficiency_level: ProficiencyLevel | null;
  assigned_teacher_id: string | null;
  cultural_notes: string | null;
  is_active: boolean;
}

export interface Contract {
  id: number;
  service_id: number;
  company_id: number | null;
  student_id: number | null;
  total_hours: number;
  consumed_hours: number;
  remaining_hours: number;
  total_value: number;
  monthly_value: number | null;
  status: ContractStatus;
  start_date: string;
  end_date: string | null;
}

export interface TeacherOption {
  id: string;
  full_name: string;
  role: string;
}

