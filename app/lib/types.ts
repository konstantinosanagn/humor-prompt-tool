export interface HumorFlavor {
  id: number;
  slug: string;
  description: string | null;
  created_datetime_utc: string;
  created_by_user_id: string;
  modified_by_user_id: string;
  modified_datetime_utc: string;
}

export interface HumorFlavorStep {
  id: number;
  humor_flavor_id: number;
  order_by: number;
  humor_flavor_step_type_id: number;
  llm_model_id: number;
  llm_temperature: number;
  llm_input_type_id: number;
  llm_output_type_id: number;
  llm_system_prompt: string;
  llm_user_prompt: string;
  description: string | null;
  created_datetime_utc: string;
  created_by_user_id: string;
  modified_by_user_id: string;
  modified_datetime_utc: string;
}

export interface LlmModel {
  id: number;
  name: string;
  llm_provider_id: number;
  is_temperature_supported: boolean;
}

export interface LookupItem {
  id: number;
  slug: string;
  description: string;
}

export interface StudyImageSet {
  id: number;
  slug: string;
  description: string | null;
}

export interface ImageRecord {
  id: number;
  url: string;
  image_description: string | null;
}

export interface CaptionRecord {
  id: number;
  content: string;
  image_id: number;
  humor_flavor_id: number | null;
  caption_request_id: number | null;
  llm_prompt_chain_id: number | null;
  created_datetime_utc: string;
}
