// Shared types for the block-based page builder.
// This module is imported by both server (rendering) and client (admin editor)
// code, so it must contain types and plain data only — no React component imports.

export type BlockCategory = "Hero" | "Content" | "Dynamic" | "Heading";

export type FieldType =
  | "text"
  | "textarea"
  | "paragraphArray"
  | "image"
  | "imageArray"
  | "url"
  | "enum"
  | "boolean"
  | "studyCards";

export interface BlockField {
  key: string;
  label: string;
  type: FieldType;
  /** Allowed values for an "enum" field. */
  options?: readonly string[];
  help?: string;
}

export interface BlockDefinition {
  /** Registry key, also stored in PageBlock.type. */
  type: string;
  /** Human-readable name shown in the admin block picker and card header. */
  label: string;
  category: BlockCategory;
  /**
   * When false the block has no editable content (it is "content-frozen"):
   * it can be reordered, hidden, or deleted, but renders fixed markup.
   */
  editable: boolean;
  fields: readonly BlockField[];
  /** Starting content used when an admin inserts a new instance of this block. */
  defaultContent: Record<string, unknown>;
}

/** Shape of a single card inside a `homepageStudies` block. */
export interface StudyCardContent {
  title: string;
  subtitle?: string;
  description: string;
  buttonLabel?: string;
  buttonHref?: string;
  imageSrc: string;
  imageAlt: string;
  imagePosition?: "center" | "right" | "left" | "top" | "bottom";
}
